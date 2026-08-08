(function (global) {
  'use strict';
  const LF = global.LFArt;
  const U = LF.util;

  class LiteraryFriendBackend {
    constructor() { this.controller=null; this.lastHealth=null; this.settings=this.loadSettings(); }
    defaults(){return {backendUrl:LF.CONFIG.backendUrl,libraryUrl:LF.CONFIG.backendLibrary,projectId:LF.CONFIG.projectId,userId:'local-user'};}
    loadSettings(){try{return {...this.defaults(),...(U.safeJson(localStorage.getItem(LF.CONFIG.backendKey),{})||{})};}catch{return this.defaults();}}
    saveSettings(patch){this.settings={...this.settings,...patch};try{localStorage.setItem(LF.CONFIG.backendKey,JSON.stringify(this.settings));}catch{}return this.settings;}
    configured(){return Boolean(this.settings.backendUrl);}
    cancel(){if(this.controller)this.controller.abort();this.controller=null;}
    async call(action,payload={},timeoutMs=LF.CONFIG.healthRequestTimeoutMs){
      const url=String(this.settings.backendUrl||'').trim(); if(!url)throw new Error('Backend URL is not configured.');
      const body={action,data:payload};this.controller=new AbortController();const timer=setTimeout(()=>this.controller?.abort(),timeoutMs);
      try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),redirect:'follow',cache:'no-store',signal:this.controller.signal});const text=await r.text();const data=U.safeJson(text,null);if(!data)throw new Error(`Backend returned non-JSON output (${r.status}).`);if(!r.ok||data.ok===false)throw new Error(data.error?.message||data.error||data.message||`Backend request failed (${r.status}).`);return data;}catch(err){if(err.name==='AbortError')throw new Error('Backend request timed out or was cancelled.');throw err;}finally{clearTimeout(timer);this.controller=null;}
    }
    async health(){try{const url=String(this.settings.backendUrl||'').trim();if(!url)throw new Error('Backend URL is not configured.');const r=await fetch(`${url}?action=health&_=${Date.now()}`,{cache:'no-store',redirect:'follow'});const j=await r.json();this.lastHealth=j;}catch(e){this.lastHealth={ok:false,error:e.message};}return this.lastHealth;}

    // The supplied LiteraryFriend backend intentionally does not expose generative AI routes.
    // Prompt refinement therefore remains local and free instead of inventing a new backend contract.
    async improvePrompt(prompt,context=''){
      const clean=String(prompt||'').trim().replace(/\s+/g,' ');
      if(!clean)throw new Error('Enter an art description first.');
      const additions=[
        'book-cover illustration with a clear focal point and intentional visual hierarchy',
        'print-friendly composition, edge-aware framing, deliberate negative space for editable title and author typography',
        'cohesive lighting, controlled detail, readable silhouette at thumbnail size',
        'no rendered words, logos, ISBNs, watermarks, signatures, or fake publisher marks'
      ];
      const response=[clean,...additions,context?`Production context: ${context}`:''].filter(Boolean).join('. ');
      return {ok:true,response};
    }

    // Creates a deterministic local concept image from the prompt. This is a free procedural
    // composition aid, not falsely labeled as model-generated art and not a backend action.
    async generateImage(prompt,options={}){
      const text=String(prompt||'').trim(); if(!text)throw new Error('Describe the artwork first.');
      const size=String(options.size||'1024x1536'); const [w0,h0]=size.split('x').map(Number); const w=Math.max(512,Math.min(w0||1024,1536)),h=Math.max(512,Math.min(h0||1536,1536));
      let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}
      const hue=hash%360,hue2=(hue+65+(hash%80))%360,hue3=(hue+190)%360;
      const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const stars=Array.from({length:34},(_,i)=>{const x=(Math.imul(hash^(i*2654435761),97)>>>0)%w,y=(Math.imul(hash^(i*1597334677),53)>>>0)%h,r=1+((hash>>>(i%24))&3);return `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,.${2+(i%6)})"/>`;}).join('');
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 72% 19%)"/><stop offset=".52" stop-color="hsl(${hue2} 74% 32%)"/><stop offset="1" stop-color="hsl(${hue3} 66% 12%)"/></linearGradient><radialGradient id="r"><stop stop-color="rgba(255,255,255,.48)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${stars}<circle cx="${Math.round(w*.68)}" cy="${Math.round(h*.33)}" r="${Math.round(Math.min(w,h)*.22)}" fill="url(#r)"/><path d="M0 ${Math.round(h*.78)} Q ${Math.round(w*.28)} ${Math.round(h*.58)} ${Math.round(w*.52)} ${Math.round(h*.76)} T ${w} ${Math.round(h*.62)} V ${h} H0Z" fill="rgba(0,0,0,.42)"/><path d="M${Math.round(w*.12)} ${Math.round(h*.7)} Q ${Math.round(w*.36)} ${Math.round(h*.52)} ${Math.round(w*.56)} ${Math.round(h*.69)} T ${Math.round(w*.9)} ${Math.round(h*.56)}" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="${Math.max(4,Math.round(w*.008))}"/><metadata>${esc(text.slice(0,1800))}</metadata></svg>`;
      const dataUrl='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
      return {ok:true,image:{dataUrl,mimeType:'image/svg+xml',name:options.name||`literaryfriend-concept-${Date.now()}.svg`},localConcept:true};
    }
  }

  LF.backend = new LiteraryFriendBackend();
})(window);
