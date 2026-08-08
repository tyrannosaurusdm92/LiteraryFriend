(function (global) {
  'use strict';
  const LF = global.LFArt;
  const U = LF.util;

  class LiteraryFriendTools {
    cancel(){}
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
    // composition aid, not falsely labeled as model-generated art.
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

  LF.tools = new LiteraryFriendTools();
})(window);
