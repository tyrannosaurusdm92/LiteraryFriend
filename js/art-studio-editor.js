(function (global) {
  'use strict';
  const LF=global.LFArt,U=LF.util;

  class Editor {
    constructor(renderer){
      this.renderer=renderer;this.project=LF.model.newProject();this.history=[];this.future=[];this.drag=null;this.activeTool='select';this.brush={color:'#17252a',size:28,opacity:1,hardness:.8};this.onChange=()=>{};
      this.renderer.setProject(this.project);
    }
    setChangeHandler(fn){this.onChange=typeof fn==='function'?fn:()=>{};}
    changed(reason='Changed'){this.project.updatedAt=new Date().toISOString();this.renderer.requestRender();this.onChange(reason);}
    snapshot(){return JSON.stringify(this.serialize(false));}
    pushHistory(){this.history.push(this.snapshot());if(this.history.length>LF.CONFIG.maxHistory)this.history.shift();this.future=[];}
    async undo(){if(!this.history.length)return false;this.future.push(this.snapshot());await this.load(JSON.parse(this.history.pop()),false);this.onChange('Undo');return true;}
    async redo(){if(!this.future.length)return false;this.history.push(this.snapshot());await this.load(JSON.parse(this.future.pop()),false);this.onChange('Redo');return true;}
    serialize(includePaint=true){
      const p=U.deepClone(this.project);
      if(includePaint){for(const l of p.layers){if(l.type==='paint'){const original=this.project.layers.find(x=>x.id===l.id);const c=this.renderer.paintCache.get(l.id);if(c)l.dataUrl=c.toDataURL('image/png');else if(original?.dataUrl)l.dataUrl=original.dataUrl;}}}
      return p;
    }
    async load(project,clearHistory=true){
      if(!project||project.schema!=='literaryfriend-art-project/v1')throw new Error('This is not a LiteraryFriend Art Studio project.');
      this.project=U.deepClone(project);this.project.layers=(this.project.layers||[]).map(LF.model.normalizeLayer);this.renderer.paintCache.clear();this.renderer.imageCache.clear();this.renderer.setProject(this.project);if(clearHistory){this.history=[];this.future=[];}this.changed('Project loaded');
    }
    newProject(title='Untitled Cover'){this.project=LF.model.newProject(title);this.history=[];this.future=[];this.renderer.paintCache.clear();this.renderer.imageCache.clear();this.renderer.setProject(this.project);this.changed('New project');}
    selected(){return this.project.layers.find(l=>l.id===this.project.selectedLayerId)||null;}
    select(id){this.project.selectedLayerId=id||null;this.renderer.requestRender();this.onChange('Selection changed');}
    addLayer(layer){this.pushHistory();const l=LF.model.normalizeLayer(layer);this.project.layers.push(l);this.project.selectedLayerId=l.id;this.changed(`Added ${l.name}`);return l;}
    addPaintLayer(name='Paint Layer'){return this.addLayer({type:'paint',name,opacity:1,blend:'source-over'});}
    async addImage(src,name='Artwork',natural=null){
      const m=this.renderer.metrics,img=natural||await U.loadImage(src),ratio=Math.min(m.widthPx/img.width,m.heightPx/img.height,.92),w=Math.max(10,img.width*ratio),h=Math.max(10,img.height*ratio);return this.addLayer({type:'image',name,src,naturalWidth:img.width,naturalHeight:img.height,x:(m.widthPx-w)/2,y:(m.heightPx-h)/2,w,h});
    }
    addText(text='BOOK TITLE',options={}){const m=this.renderer.metrics,w=m.widthPx*.78,h=m.heightPx*.24;return this.addLayer({type:'text',name:options.name||'Title Text',text,fontFamily:options.fontFamily||'Georgia',fontSize:options.fontSize||Math.max(42,m.widthPx*.075),bold:options.bold??true,italic:false,align:'center',color:options.color||'#fff8e5',stroke:options.stroke||'#17252a',strokeWidth:options.strokeWidth??Math.max(1,m.widthPx*.0015),letterSpacing:0,lineHeight:1.08,x:(m.widthPx-w)/2,y:m.heightPx*.12,w,h});}
    addShape(shape='rect'){const m=this.renderer.metrics,w=m.widthPx*.55,h=m.heightPx*.16;return this.addLayer({type:'shape',name:shape==='ellipse'?'Ellipse':'Shape',shape,fill:'#184c54',stroke:'#fff8e5',strokeWidth:3,radius:12,x:(m.widthPx-w)/2,y:(m.heightPx-h)/2,w,h,opacity:.75});}
    addTexture(preset){return this.addLayer({type:'texture',name:preset.name||'Texture',textureId:preset.id||'paper',density:preset.density??.15,textureScale:preset.scale??3,opacity:preset.opacity??.2,blend:preset.blend||'multiply',seed:Math.floor(Math.random()*2147483647),color:'#302c26'});}
    duplicateSelected(){const s=this.selected();if(!s)return;this.pushHistory();const copy=LF.model.normalizeLayer({...U.deepClone(s),id:U.uid('layer'),name:`${s.name} Copy`,x:(s.x||0)+20,y:(s.y||0)+20});if(s.type==='paint'){const c=this.renderer.paintCache.get(s.id);if(c)copy.dataUrl=c.toDataURL('image/png');}this.project.layers.push(copy);this.project.selectedLayerId=copy.id;this.changed('Layer duplicated');}
    deleteSelected(){const i=this.project.layers.findIndex(l=>l.id===this.project.selectedLayerId);if(i<0)return;this.pushHistory();this.renderer.paintCache.delete(this.project.layers[i].id);this.project.layers.splice(i,1);this.project.selectedLayerId=this.project.layers[Math.min(i,this.project.layers.length-1)]?.id||null;this.changed('Layer deleted');}
    moveLayer(direction){const i=this.project.layers.findIndex(l=>l.id===this.project.selectedLayerId);if(i<0)return;const j=U.clamp(i+direction,0,this.project.layers.length-1);if(i===j)return;this.pushHistory();const [l]=this.project.layers.splice(i,1);this.project.layers.splice(j,0,l);this.changed('Layer reordered');}
    updateSelected(patch,history=true){const s=this.selected();if(!s)return;if(history)this.pushHistory();Object.assign(s,patch);this.changed('Layer updated');}
    updateSelectedNested(key,patch,history=true){const s=this.selected();if(!s)return;if(history)this.pushHistory();s[key]={...(s[key]||{}),...patch};this.changed('Layer updated');}
    setDocument(patch,history=true){if(history)this.pushHistory();Object.assign(this.project.document,patch);this.renderer.resize();this.changed('Document updated');}
    resizeDocument(patch){
      const old=this.renderer.metrics||LF.model.documentMetrics(this.project.document);this.pushHistory();Object.assign(this.project.document,patch);const next=LF.model.documentMetrics(this.project.document),sx=next.widthPx/old.widthPx,sy=next.heightPx/old.heightPx;
      for(const l of this.project.layers){if(l.type==='paint'){const c=this.renderer.paintCache.get(l.id);if(c){const n=document.createElement('canvas');n.width=next.widthPx;n.height=next.heightPx;n.getContext('2d').drawImage(c,0,0,n.width,n.height);this.renderer.paintCache.set(l.id,n);}}else if(l.type!=='texture'){l.x*=sx;l.y*=sy;l.w*=sx;l.h*=sy;}}
      this.renderer.resize();this.changed('Cover size changed');
    }
    setTool(tool){this.activeTool=tool;document.dispatchEvent(new CustomEvent('lf:tool',{detail:{tool}}));}
    pointerDown(event){
      const p=this.renderer.pointFromEvent(event),selected=this.selected();
      if(this.activeTool==='brush'||this.activeTool==='eraser'){
        let layer=selected&&selected.type==='paint'?selected:null;if(!layer)layer=this.addPaintLayer();
        this.pushHistory();const c=this.renderer.getPaintCanvas(layer),ctx=c.getContext('2d');ctx.save();ctx.globalAlpha=this.brush.opacity;ctx.globalCompositeOperation=this.activeTool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=this.brush.color;ctx.lineWidth=this.brush.size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(p.x,p.y);this.drag={type:'paint',layer,ctx,last:p};event.preventDefault();return;
      }
      if(this.activeTool==='select'){
        const hit=this.renderer.hitTest(p);if(hit){this.select(hit.id);this.pushHistory();this.drag={type:'move',layer:hit,start:p,x:hit.x,y:hit.y};}else this.select(null);event.preventDefault();
      }
    }
    pointerMove(event){if(!this.drag)return;const p=this.renderer.pointFromEvent(event);if(this.drag.type==='move'){this.drag.layer.x=this.drag.x+(p.x-this.drag.start.x);this.drag.layer.y=this.drag.y+(p.y-this.drag.start.y);this.renderer.requestRender();this.onChange('Moving layer');}else if(this.drag.type==='paint'){const {ctx,last}=this.drag;ctx.lineTo(p.x,p.y);ctx.stroke();this.drag.last=p;this.renderer.requestRender();}event.preventDefault();}
    pointerUp(event){if(!this.drag)return;if(this.drag.type==='paint'){this.drag.ctx.restore();this.drag.layer.dataUrl=this.renderer.getPaintCanvas(this.drag.layer).toDataURL('image/png');}this.drag=null;this.changed('Edit complete');event?.preventDefault();}
    async importFile(file){const src=await U.readFileAsDataUrl(file),img=await U.loadImage(src);return this.addImage(src,file.name,img);}
  }

  LF.Editor=Editor;
})(window);
