(function(global){
  'use strict';
  const LF=global.LF;
  const DEFAULT_ENDPOINT='https://script.google.com/macros/s/AKfycbw0lsf6upSeg1h_PD6cIyxLt1ukOfU71vRKuz3xc7-PlDbzKHFfvm4NR0c5eD1RoNNK/exec';

  class ApiClient{
    constructor(){this.endpoint=DEFAULT_ENDPOINT;this.token=localStorage.getItem('lf.auth.token')||'';this.user=LF.safeJsonParse(localStorage.getItem('lf.auth.user')||'null',null);this.online=navigator.onLine;this.queue=LF.safeJsonParse(localStorage.getItem('lf.sync.queue')||'[]',[]);}
    saveAuth(){ if(this.token)localStorage.setItem('lf.auth.token',this.token);else localStorage.removeItem('lf.auth.token'); if(this.user)localStorage.setItem('lf.auth.user',JSON.stringify(this.user));else localStorage.removeItem('lf.auth.user'); }
    async request(action,data={},opts={}){
      const body={action,data,token:opts.token===undefined?this.token:opts.token,client:{name:'LiteraryFriend',version:LF.VERSION,platform:navigator.platform||''}};
      const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),opts.timeout||20000);
      try{
        const res=await fetch(this.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),signal:controller.signal,redirect:'follow'});
        const text=await res.text(); const json=LF.safeJsonParse(text,{ok:false,error:{message:text||`HTTP ${res.status}`}});
        if(!res.ok||json.ok===false) throw new Error(json.error?.message||json.message||`LiteraryFriend service error ${res.status}`);
        this.online=true; LF.events.emit('api:online',json); return json;
      } catch(err){ this.online=false; LF.events.emit('api:offline',err); throw err; } finally{clearTimeout(timer);}
    }
    async health(){ try{ const res=await fetch(`${this.endpoint}?action=health`,{cache:'no-store'}); return await res.json(); }catch(err){throw err;} }
    async login(email,password){ const r=await this.request('auth.login',{email,password},{token:''}); this.token=r.token||r.session?.token||''; this.user=r.user||r.session?.user||null; this.saveAuth(); return r; }
    async register(data){ const r=await this.request('auth.register',data,{token:''}); if(r.token){this.token=r.token;this.user=r.user||null;this.saveAuth();} return r; }
    async me(){const r=await this.request('auth.me');this.user=r.user||this.user;this.saveAuth();return r;}
    async logout(){try{if(this.token)await this.request('auth.logout');}catch(_){}this.token='';this.user=null;this.saveAuth();}
    queueAction(action,data){this.queue.push({id:LF.uid('sync'),action,data,createdAt:LF.now(),tries:0});localStorage.setItem('lf.sync.queue',JSON.stringify(this.queue));LF.events.emit('sync:queue',this.queue.length);}
    async flushQueue(){ if(!this.token||!navigator.onLine||!this.queue.length)return {sent:0,remaining:this.queue.length}; let sent=0; const remain=[]; for(const item of this.queue){try{await this.request(item.action,item.data);sent++;}catch(err){item.tries=(item.tries||0)+1;item.lastError=err.message;remain.push(item);}} this.queue=remain;localStorage.setItem('lf.sync.queue',JSON.stringify(remain));return{sent,remaining:remain.length};}
    async pushRecord(rec){
      if(!this.token)throw new Error('Sign in to sync.');
      let action,data;
      const projectId=async()=>rec.projectId?this.backendProjectId(rec.projectId):'';
      if(rec.type==='project'){
        action=rec.backendId?'projects.update':'projects.create';
        data={id:rec.backendId,title:rec.title,type:rec.projectType||'other',description:rec.description||'',status:rec.status||'active',parentProjectId:rec.parentProjectBackendId||'',metadata:{localId:rec.id,wordGoal:rec.wordGoal||0,...(rec.metadata||{})},settings:rec.settings||{}};
      }else if(rec.type==='document'){
        action='nodes.save';
        data={id:rec.backendId,projectId:await projectId(),parentId:rec.parentBackendId||'',nodeType:rec.docType||'document',title:rec.title,content:rec.content||'',plainText:LF.stripHtml(rec.content||''),sortOrder:rec.sortOrder||0,tags:rec.tags||[],links:rec.links||[],metadata:{localId:rec.id,status:rec.status||'',pov:rec.pov||'',sceneDate:rec.sceneDate||'',location:rec.location||'',participants:rec.participants||[],threads:rec.threads||[],revisionState:rec.revisionState||'',...(rec.metadata||{})}};
      }else if(rec.type==='outlineBeat'){
        action='nodes.save';
        const linked=rec.documentId?await LF.store.get('document',rec.documentId):null;
        data={id:rec.backendId,projectId:await projectId(),nodeType:'outline-beat',title:rec.title,content:rec.summary||'',plainText:rec.summary||'',sortOrder:rec.sortOrder||0,tags:rec.tags||[],links:linked?.backendId?[{type:'manuscript-node',id:linked.backendId}]:[],metadata:{localId:rec.id,act:rec.act||'',beatType:rec.beatType||'',linkedLocalDocumentId:rec.documentId||''}};
      }else if(rec.type==='task'){
        action='nodes.save';
        data={id:rec.backendId,projectId:await projectId(),nodeType:'task',title:rec.title||'Untitled task',content:rec.notes||'',plainText:rec.notes||'',sortOrder:rec.sortOrder||0,tags:rec.tags||[],metadata:{localId:rec.id,status:rec.status||'todo',priority:rec.priority||'normal',dueAt:rec.dueAt||'',category:rec.category||'',milestone:rec.milestone||'',linkedRecordType:rec.linkedRecordType||'',linkedRecordId:rec.linkedRecordId||'',reminderAt:rec.reminderAt||'',completedAt:rec.completedAt||''}};
      }else if(rec.type==='note'){
        action='notes.save';
        data={id:rec.backendId,projectId:await projectId(),title:rec.title,content:rec.locked?JSON.stringify({literaryFriendEncrypted:rec.encrypted||null}):(rec.content||''),plainText:rec.locked?'Encrypted LiteraryFriend note':LF.stripHtml(rec.content||''),format:rec.locked?'encrypted-json':'html',folderId:rec.folderId||'',tags:rec.tags||[],pinned:!!rec.pinned,locked:!!rec.locked,color:rec.color||'',source:rec.source||'',metadata:{localId:rec.id,noteType:rec.noteType||'note',encrypted:!!rec.locked,...(rec.metadata||{})}};
      }else if(rec.type==='research'){
        action='notes.save';
        const structured={sourceType:rec.sourceType||'source',author:rec.author||'',publication:rec.publication||'',publishedAt:rec.publishedAt||'',url:rec.url||'',quote:rec.quote||'',notes:rec.notes||''};
        data={id:rec.backendId,projectId:await projectId(),title:rec.title||'Untitled source',content:JSON.stringify(structured,null,2),plainText:[rec.author,rec.publication,rec.url,rec.quote,rec.notes].filter(Boolean).join('\n\n'),format:'research-json',tags:rec.tags||[],pinned:!!rec.pinned,locked:false,source:rec.url||'',metadata:{localId:rec.id,noteType:'research',research:structured,...(rec.metadata||{})}};
      }else if(rec.type==='entity'){
        action='entities.save';
        data={id:rec.backendId,projectId:await projectId(),entityType:rec.entityType||'other',name:rec.name,aliases:rec.aliases||[],description:rec.description||'',attributes:rec.attributes||{},relationships:rec.relationships||[],tags:rec.tags||[]};
      }else if(rec.type==='timeline'){
        action='timeline.save';
        data={id:rec.backendId,projectId:await projectId(),title:rec.title,startValue:rec.startValue||rec.dateLabel||'',endValue:rec.endValue||'',calendar:rec.calendar||'default',era:rec.era||'',sortKey:rec.sortOrder||0,description:rec.description||'',participantIds:rec.participantIds||rec.participants||[],locationIds:rec.locationIds||[],tags:rec.tags||[],metadata:{narrativeOrder:rec.narrativeOrder??rec.metadata?.narrativeOrder??'',revelationOrder:rec.revelationOrder??rec.metadata?.revelationOrder??'',...(rec.metadata||{})}};
      }else if(rec.type==='plotIssue'){
        action='plotissues.save';
        data={id:rec.backendId,projectId:await projectId(),title:rec.title,issueType:rec.issueType||'continuity',severity:rec.severity||'medium',status:rec.status||'open',description:rec.description||'',evidence:rec.evidence||[],suggestion:rec.suggestion||rec.suggestedFix||'',resolution:rec.resolution||'',relatedNodeIds:rec.relatedNodeIds||rec.relatedIds||[],metadata:{tags:rec.tags||[],localId:rec.id,...(rec.metadata||{})}};
      }else if(rec.type==='language'){
        action='languages.save';
        const rules=rec.rules||{};
        data={id:rec.backendId,projectId:await projectId(),name:rec.name,code:rec.code||'',description:rec.description||'',phonology:{sounds:rules.sounds||'',phonotactics:rules.phonotactics||'',pronunciation:rules.pronunciation||''},orthography:{orthography:rules.orthography||'',writingSystem:rules.writingSystem||''},grammar:{morphology:rules.morphology||'',grammar:rules.grammar||'',syntax:rules.syntax||'',tense:rules.tense||'',pronouns:rules.pronouns||'',numbers:rules.numbers||''},settings:{names:rules.names||'',idioms:rules.idioms||'',dialects:rules.dialects||'',rawRules:rules,...(rec.settings||{})}};
      }else if(rec.type==='lexicon'){
        action='lexicon.save';
        data={id:rec.backendId,languageId:await this.backendLanguageId(rec.languageId,rec.projectId),word:rec.word||rec.term||'Untitled term',definition:rec.definition||rec.meaning||'',pronunciation:rec.pronunciation||'',partOfSpeech:rec.partOfSpeech||'',etymology:rec.etymology||'',forms:rec.forms||[],notes:rec.notes||'',tags:rec.tags||[]};
      }else return rec;
      try{
        const r=await this.request(action,data);
        const remote=r.project||r.node||r.note||r.entity||r.event||r.issue||r.language||r.entry;
        const backendId=remote?.id||rec.backendId;
        if(backendId&&!rec.backendId)rec=await LF.store.put({...rec,backendId,lastSyncedAt:LF.now()});
        else rec=await LF.store.put({...rec,lastSyncedAt:LF.now()});
        return rec;
      }catch(err){this.queueAction(action,data);throw err;}
    }
    async backendLanguageId(localId,localProjectId=''){
      if(!localId)return '';
      const language=await LF.store.get('language',localId);
      if(!language)return localId;
      if(language.backendId)return language.backendId;
      if(!language.projectId&&localProjectId)language.projectId=localProjectId;
      const pushed=await this.pushRecord(language);
      return pushed.backendId||'';
    }
    async backendProjectId(localId){const p=await LF.store.get('project',localId);if(!p)throw new Error('Project not found.');if(p.backendId)return p.backendId;const pushed=await this.pushRecord(p);return pushed.backendId;}
    async uploadAttachment(row){ if(!this.token)throw new Error('Sign in to sync attachments.'); const b=await LF.store.getBlob(row.blobId||row.id); if(!b?.blob)throw new Error('Attachment data is not available.'); const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=()=>reject(r.error);r.readAsDataURL(b.blob);}); const data={projectId:row.projectId?await this.backendProjectId(row.projectId):'',ownerType:row.ownerType||'',ownerId:row.ownerBackendId||'',name:row.name,mimeType:row.mimeType,base64,description:row.description||'',metadata:{localId:row.id}};return this.request('attachments.upload',data); }
  }
  LF.api=new ApiClient();
  LF.API_CONFIG={endpoint:DEFAULT_ENDPOINT};
})(window);
