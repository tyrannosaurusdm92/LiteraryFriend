(function (global) {
  'use strict';
  const LF = global.LFArt;
  const U = LF.util;
  const TOKEN_KEY = 'literaryfriend-book-token';

  class LiteraryFriendBackend {
    constructor() {
      this.controller = null;
      this.lastHealth = null;
      this.settings = this.loadSettings();
    }
    defaults() { return { backendUrl: LF.CONFIG.backendUrl, libraryUrl: LF.CONFIG.backendLibrary }; }
    loadSettings() {
      try { return {...this.defaults(), ...(U.safeJson(localStorage.getItem(LF.CONFIG.backendKey), {})||{})}; }
      catch { return this.defaults(); }
    }
    saveSettings(patch) {
      this.settings = {...this.settings, ...patch};
      try { localStorage.setItem(LF.CONFIG.backendKey, JSON.stringify({backendUrl:this.settings.backendUrl,libraryUrl:this.settings.libraryUrl})); } catch {}
      return this.settings;
    }
    token() {
      try {
        return parent?.LF?.api?.token || localStorage.getItem('lf.auth.token') || sessionStorage.getItem(TOKEN_KEY) || '';
      } catch {
        try { return localStorage.getItem('lf.auth.token') || sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
      }
    }
    hasSession() { return Boolean(this.token()); }
    configured() { return Boolean(this.settings.backendUrl && this.hasSession()); }
    cancel(){ if(this.controller) this.controller.abort(); this.controller=null; }
    async call(action,data={},timeoutMs=LF.CONFIG.chatRequestTimeoutMs,tokenOverride=null){
      const url=String(this.settings.backendUrl||LF.CONFIG.backendUrl||'').trim();
      if(!url) throw new Error('LiteraryFriend service is not configured.');
      const token=tokenOverride===null?this.token():String(tokenOverride||'');
      this.controller=new AbortController(); const timer=setTimeout(()=>this.controller?.abort(),timeoutMs);
      try{
        const r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,token,data:data||{}}),redirect:'follow',cache:'no-store',signal:this.controller.signal});
        const text=await r.text(); const result=U.safeJson(text,null);
        if(!result) throw new Error(`LiteraryFriend returned non-JSON output (${r.status}).`);
        if(!r.ok||result.ok===false) throw new Error(result.error?.message||result.message||result.error||`LiteraryFriend request failed (${r.status}).`);
        return result;
      } catch(err){ if(err.name==='AbortError') throw new Error('LiteraryFriend request timed out or was cancelled.'); throw err; }
      finally {clearTimeout(timer);this.controller=null;}
    }
    async health(){ try{this.lastHealth=await this.call('health',{},LF.CONFIG.healthRequestTimeoutMs,'');}catch(e){this.lastHealth={ok:false,error:e.message};} return this.lastHealth; }
    bookContext(){
      try {
        const shared = global.__LF_CLOUD_CONTEXT__ || parent?.LFBookStudio?.getCloudContext?.() || {};
        return {...shared};
      } catch { return global.__LF_CLOUD_CONTEXT__ || {}; }
    }
    async ensureProject(title='Untitled Book') {
      if(!this.hasSession()) throw new Error('Sign in to LiteraryFriend before using cloud cover saves or AI.');
      let ctx=this.bookContext();
      if(ctx.projectId) return ctx;
      const created=await this.call('projects.create',{type:'book',title:title||'Untitled Book',description:'Book and cover project created from LiteraryFriend Book Studio.',metadata:{app:'literaryfriend-book-studio',studioVersion:LF.VERSION},makeActive:true});
      const project=created.project||created.data?.project||created.data||{};
      const projectId=project.id||project.projectId||'';
      if(!projectId) throw new Error('LiteraryFriend could not finish preparing the project.');
      try { global.__LF_CLOUD_CONTEXT__={...(global.__LF_CLOUD_CONTEXT__||{}),projectId}; global.LFBookStudio?.setCloudContext?.({projectId}); } catch {}
      return {...this.bookContext(),projectId};
    }
    statePayload(project,toolState={}) {
      const metrics=LF.model.documentMetrics(project.document||LF.model.defaultDocument());
      return {
        canvas:{schema:project.schema,version:project.meta?.version||LF.VERSION,localProjectId:project.id,selectedLayerId:project.selectedLayerId||null,document:project.document||{}},
        layers:project.layers||[],
        palette:{primary:toolState.brush?.color||'#17252a',secondary:toolState.brush?.secondaryColor||'#fff8e5',sprayColors:toolState.spray?.colors||[]},
        toolSettings:{activeTool:toolState.activeTool||'select',brush:toolState.brush||{},spray:toolState.spray||{},mirror:!!toolState.mirror,fillTolerance:Number(toolState.fillTolerance??.12)},
        background:{color:project.document?.background||'#f6f0df'},
        width:metrics.widthPx,
        height:metrics.heightPx,
        dpi:Number(project.document?.dpi||300)
      };
    }
    async saveArtProject(project,toolState={}) {
      const ctx=await this.ensureProject(global.LFBookStudio?.getBookSpec?.().title||project.title);
      const state=this.statePayload(project,toolState), cloud=project.cloud||{};
      const payload={projectId:ctx.projectId,bookId:ctx.bookId||cloud.bookId||'',name:project.title||'Cover Art',width:state.width,height:state.height,dpi:state.dpi,canvas:state.canvas,layers:state.layers,palette:state.palette,toolSettings:state.toolSettings,background:state.background,metadata:{studioSchema:project.schema,studioVersion:LF.VERSION,localProjectId:project.id,editable:true}};
      if(cloud.artProjectId) payload.id=cloud.artProjectId;
      const result=await this.call('art.save',payload,LF.CONFIG.chatRequestTimeoutMs);
      const art=result.art||result.data?.art||result.data||{};
      const artProjectId=art.id||art.artProjectId||cloud.artProjectId||'';
      project.cloud={...cloud,projectId:ctx.projectId,bookId:ctx.bookId||cloud.bookId||'',artProjectId};
      document.dispatchEvent(new CustomEvent('literaryfriend:art-saved',{detail:{projectId:ctx.projectId,bookId:project.cloud.bookId,artProjectId,localProjectId:project.id}}));
      return {result,art,cloud:project.cloud};
    }
    async listArtProjects() {
      if(!this.hasSession()) return [];
      const ctx=this.bookContext();
      const data=ctx.projectId?{projectId:ctx.projectId}:{allProjects:true};
      const result=await this.call('art.list',data,LF.CONFIG.chatRequestTimeoutMs);
      return result.projects||result.arts||result.data?.projects||[];
    }
    async getArtProject(id) {
      const result=await this.call('art.get',{id,artProjectId:id},LF.CONFIG.chatRequestTimeoutMs);
      return result.art||result.data?.art||result.data||result;
    }
    toLocalProject(art) {
      const canvas=art.canvas||{},meta=art.metadata||{};
      return {
        schema:canvas.schema||meta.studioSchema||'literaryfriend-art-project/v1',
        id:canvas.localProjectId||meta.localProjectId||U.uid('project'),
        title:art.name||'Cover Art',
        createdAt:art.createdAt||new Date().toISOString(),
        updatedAt:art.updatedAt||new Date().toISOString(),
        document:{...LF.model.defaultDocument(),...(canvas.document||{}),dpi:Number(art.dpi||canvas.document?.dpi||300),background:art.background?.color||canvas.document?.background||'#f6f0df'},
        layers:Array.isArray(art.layers)?art.layers:[],
        selectedLayerId:canvas.selectedLayerId||null,
        meta:{version:canvas.version||LF.VERSION,restoredFrom:'LiteraryFriend account storage'},
        cloud:{projectId:art.projectId||'',bookId:art.bookId||'',artProjectId:art.id||''}
      };
    }
    async improvePrompt(prompt,context=''){
      if(!this.hasSession()) throw new Error('Sign in to LiteraryFriend before using AI prompt assistance.');
      const ctx=await this.ensureProject(global.LFBookStudio?.getBookSpec?.().title||'Book Studio');
      const instruction=['You are the LiteraryFriend cover-art assistant.','Improve the supplied image-generation prompt for a book cover. Preserve concrete story details. Do not add typography unless explicitly requested. Do not imitate a living artist. Return only one polished prompt.',context].filter(Boolean).join('\n');
      const r=await this.call('ai.request',{projectId:ctx.projectId,jobType:'writing-assistant',instruction,input:{prompt},context:{surface:'book-cover-art-studio'}},LF.CONFIG.chatRequestTimeoutMs);
      const x=r.result||r.data?.result||r.data||{};
      const response=String(typeof x==='string'?x:(x.response||x.output_text||x.text||x.reply||x.content||x.answer||'')).trim();
      return {...r,response};
    }
    async generateImage(prompt,options={}){
      if(!this.hasSession()) throw new Error('Sign in to LiteraryFriend before generating cover art.');
      const artProjectId=String(options.artProjectId||'');
      if(!artProjectId) throw new Error('Save the editable cover project before generating AI art.');
      const size=String(options.size||'1024x1536').split('x').map(Number);
      const r=await this.call('art.ai.generate',{artProjectId,prompt,negativePrompt:options.negativePrompt||'',width:size[0]||1024,height:size[1]||1536,styleControls:{quality:options.quality||'high',background:options.background||'auto'},bookContext:(global.LFBookStudio?.getBookSpec?.()||global.__LF_BOOK_SPEC__||{})},LF.CONFIG.imageRequestTimeoutMs);
      const generated=r.result||r.data?.result||{},saved=r.savedAssets||r.data?.savedAssets||[];
      const first=generated.images?.[0]||generated.image||(generated.imageBase64?{base64:generated.imageBase64,mimeType:generated.mimeType||'image/png',name:generated.name||`literaryfriend-ai-${Date.now()}.png`}:null)||saved[0]||null;
      return {...r,...generated,image:first,savedAssets:saved};
    }
  }
  LF.backend = new LiteraryFriendBackend();
})(window);
