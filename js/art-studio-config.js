(function (global) {
  'use strict';
  const LF = global.LFArt = global.LFArt || {};

  LF.VERSION = '1.0.0';
  LF.CONFIG = Object.freeze({
    appName: 'LiteraryFriend Art Studio',
    storageDb: 'literaryfriend.artstudio.v1',
    storageVersion: 1,
    settingsKey: 'literaryfriend.artstudio.settings.v1',
    backendKey: 'literaryfriend.artstudio.backend.v1',
    backendUrl: 'https://script.google.com/macros/s/AKfycbw0lsf6upSeg1h_PD6cIyxLt1ukOfU71vRKuz3xc7-PlDbzKHFfvm4NR0c5eD1RoNNK/exec',
    backendLibrary: 'https://script.google.com/macros/library/d/1m--huLkqouxXGKHTj2gTpV19li8tS1IO_RLEbgmy3a8wUcvljt9dlLdD/2',
    projectId: 'literaryfriend-book-studio',
    defaultDpi: 300,
    maxCanvasPixels: 18000000,
    maxHistory: 24,
    imageRequestTimeoutMs: 180000,
    chatRequestTimeoutMs: 120000,
    healthRequestTimeoutMs: 20000,
    pageSizesUrl: 'json/page-sizes.json',
    genrePresetsUrl: 'json/genre-presets.json',
    texturePresetsUrl: 'json/texture-presets.json',
    brushPresetsUrl: 'json/effects-brush-presets.json',
    colorPalettesUrl: 'json/effects-color-palettes.json'
  });

  LF.FALLBACK_PAGE_SIZES = [
    {id:'paperback-digest',binding:'Paperback',name:'Digest / US Trade',width:5.5,height:8.5,use:'Standard fiction, memoirs, and poetry'},
    {id:'paperback-standard',binding:'Paperback',name:'Standard Trade',width:6,height:9,use:'Non-fiction, textbooks, and larger novels'},
    {id:'paperback-small',binding:'Paperback',name:'Small Trade',width:5,height:8,use:'Compact novels and literary fiction'},
    {id:'paperback-mass',binding:'Paperback',name:'Mass Market',width:4.25,height:6.87,use:'Pocket books, genre fiction, and airport thrillers'},
    {id:'hardcover-fiction',binding:'Hardcover',name:'Standard Fiction / Novel',width:6,height:9,use:'Common US trade hardcover fiction'},
    {id:'hardcover-royal',binding:'Hardcover',name:'Royal',width:6.14,height:9.21,use:'Slightly larger fiction / novel format'},
    {id:'hardcover-compact',binding:'Hardcover',name:'Compact / Novella',width:5.5,height:8.5,use:'Compact hardcovers and novellas'},
    {id:'hardcover-textbook-7x10',binding:'Hardcover',name:'Textbook / Manual 7 × 10',width:7,height:10,use:'Textbooks and manuals'},
    {id:'hardcover-letter',binding:'Hardcover',name:'Textbook / Manual 8.5 × 11',width:8.5,height:11,use:'Large textbooks and manuals'},
    {id:'hardcover-child-portrait',binding:'Hardcover',name:"Children's Picture Book 8 × 10",width:8,height:10,use:'Portrait picture books'},
    {id:'hardcover-child-landscape',binding:'Hardcover',name:"Children's Picture Book 10 × 8",width:10,height:8,use:'Landscape picture books'},
    {id:'hardcover-art-10',binding:'Hardcover',name:'Coffee Table / Art 10 × 10',width:10,height:10,use:'Square art and coffee-table books'},
    {id:'hardcover-art-12',binding:'Hardcover',name:'Coffee Table / Art 12 × 12',width:12,height:12,use:'Large square art and coffee-table books'},
    {id:'custom',binding:'Custom',name:'Custom Size',width:6,height:9,use:'Enter any trim size'}
  ];

  LF.FALLBACK_GENRES = [
    {id:'literary',name:'Literary Fiction',prompt:'editorial literary cover art, symbolic focal image, subtle visual metaphor, restrained palette, sophisticated negative space, print-ready composition, no typography'},
    {id:'fantasy',name:'Fantasy',prompt:'epic fantasy cover art, atmospheric depth, dramatic light, rich painterly detail, cinematic focal point, room for title and author, no typography'},
    {id:'scifi',name:'Science Fiction',prompt:'science fiction book cover art, speculative technology, cinematic scale, luminous atmosphere, bold silhouette, intelligent visual storytelling, no typography'},
    {id:'thriller',name:'Thriller',prompt:'psychological thriller cover art, high tension, stark contrast, ominous composition, cinematic shadows, strong central mystery, no typography'},
    {id:'horror',name:'Horror',prompt:'horror cover art, unsettling atmosphere, controlled darkness, eerie texture, disturbing but elegant visual motif, print-ready, no typography'},
    {id:'romance',name:'Romance',prompt:'romance cover art, emotionally intimate composition, warm cinematic light, expressive atmosphere, elegant color harmony, no typography'},
    {id:'memoir',name:'Memoir',prompt:'memoir cover art, intimate documentary mood, symbolic personal detail, editorial photography sensibility, thoughtful negative space, no typography'},
    {id:'minimal',name:'Minimal',prompt:'minimalist book cover art, one striking symbolic element, generous negative space, refined composition, sophisticated print design, no typography'},
    {id:'ya',name:'Young Adult',prompt:'young adult cover art, emotionally vivid focal character or symbol, energetic modern composition, cinematic atmosphere, strong genre readability, no typography'}
  ];

  LF.FALLBACK_TEXTURES = [
    {id:'paper',name:'Paper Grain',density:.14,scale:1,opacity:.22,blend:'multiply'},
    {id:'linen',name:'Linen',density:.22,scale:5,opacity:.18,blend:'multiply'},
    {id:'canvas',name:'Canvas Weave',density:.28,scale:8,opacity:.20,blend:'overlay'},
    {id:'speckle',name:'Ink Speckle',density:.10,scale:2,opacity:.28,blend:'multiply'},
    {id:'halftone',name:'Halftone',density:.35,scale:7,opacity:.20,blend:'soft-light'},
    {id:'dust',name:'Dust',density:.08,scale:3,opacity:.22,blend:'screen'},
    {id:'vignette',name:'Vignette',density:.35,scale:1,opacity:.35,blend:'multiply'}
  ];

  LF.util = {
    uid(prefix='id') { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`; },
    clamp(v,min,max) { return Math.max(min, Math.min(max, Number(v))); },
    round(v,d=2) { const p=10**d; return Math.round(Number(v)*p)/p; },
    deepClone(v) { return JSON.parse(JSON.stringify(v)); },
    async loadJson(url, fallback) {
      try {
        const r = await fetch(url, {cache:'no-store'});
        if (!r.ok) throw new Error(String(r.status));
        return await r.json();
      } catch { return fallback; }
    },
    readFileAsDataUrl(file) { return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); },
    loadImage(src) { return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=src; }); },
    download(name, blobOrText, type='application/octet-stream') {
      const blob = blobOrText instanceof Blob ? blobOrText : new Blob([blobOrText], {type});
      const a=document.createElement('a'); const url=URL.createObjectURL(blob); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    },
    canvasBlob(canvas,type='image/png',quality=.95) { return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Unable to create export image.')),type,quality)); },
    formatBytes(n) { const u=['B','KB','MB','GB']; let i=0,v=Number(n)||0; while(v>=1024&&i<u.length-1){v/=1024;i++;} return `${v.toFixed(i?1:0)} ${u[i]}`; },
    safeJson(text,fallback=null) { try{return JSON.parse(text);}catch{return fallback;} },
    escapeHtml(s) { return String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  };
})(window);
