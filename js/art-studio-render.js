(function (global) {
  'use strict';
  const LF=global.LFArt, U=LF.util;

  class Renderer {
    constructor(canvas,overlay,frame){
      this.canvas=canvas; this.ctx=canvas.getContext('2d',{alpha:true});
      this.overlay=overlay; this.octx=overlay.getContext('2d',{alpha:true});
      this.frame=frame; this.project=null; this.metrics=null; this.zoom=1;
      this.imageCache=new Map(); this.paintCache=new Map(); this.renderPending=false;
    }
    setProject(project){this.project=project; this.resize();}
    resize(){
      if(!this.project)return;
      this.metrics=LF.model.documentMetrics(this.project.document);
      const {widthPx,heightPx}=this.metrics;
      if(this.canvas.width!==widthPx||this.canvas.height!==heightPx){this.canvas.width=widthPx;this.canvas.height=heightPx;this.overlay.width=widthPx;this.overlay.height=heightPx;}
      this.frame.style.width=`${widthPx}px`; this.frame.style.height=`${heightPx}px`;
      this.setZoom(this.zoom,true); this.requestRender();
    }
    setZoom(value,silent=false){
      this.zoom=U.clamp(value,.05,4);
      this.frame.style.transform=`scale(${this.zoom})`;
      this.frame.style.margin=`${Math.round((this.frame.offsetHeight*(this.zoom-1))/2)}px ${Math.round((this.frame.offsetWidth*(this.zoom-1))/2)}px`;
      if(!silent) document.dispatchEvent(new CustomEvent('lf:zoom',{detail:{zoom:this.zoom}}));
    }
    fitTo(viewport){
      if(!this.metrics)return;
      const pad=80, sx=Math.max(.05,(viewport.clientWidth-pad)/this.metrics.widthPx), sy=Math.max(.05,(viewport.clientHeight-pad)/this.metrics.heightPx);
      this.setZoom(Math.min(1,sx,sy));
    }
    pointFromEvent(event){
      const r=this.overlay.getBoundingClientRect();
      return {x:(event.clientX-r.left)*(this.overlay.width/r.width), y:(event.clientY-r.top)*(this.overlay.height/r.height)};
    }
    requestRender(){if(this.renderPending)return;this.renderPending=true;requestAnimationFrame(()=>{this.renderPending=false;this.render();});}
    async ensureImage(src){
      if(!src)return null;
      if(this.imageCache.has(src))return this.imageCache.get(src);
      const promise=U.loadImage(src).catch(()=>null); this.imageCache.set(src,promise); return promise;
    }
    async ensurePaint(layer){
      if(this.paintCache.has(layer.id))return this.paintCache.get(layer.id);
      const c=document.createElement('canvas'); c.width=this.canvas.width;c.height=this.canvas.height;
      if(layer.dataUrl){const img=await this.ensureImage(layer.dataUrl);if(img)c.getContext('2d').drawImage(img,0,0,c.width,c.height);}
      this.paintCache.set(layer.id,c);return c;
    }
    invalidatePaint(layerId){this.paintCache.delete(layerId);}
    getPaintCanvas(layer){
      let c=this.paintCache.get(layer.id);
      if(!c){c=document.createElement('canvas');c.width=this.canvas.width;c.height=this.canvas.height;this.paintCache.set(layer.id,c);if(layer.dataUrl)this.ensureImage(layer.dataUrl).then(img=>{if(img){c.getContext('2d').drawImage(img,0,0,c.width,c.height);this.requestRender();}});}
      if(c.width!==this.canvas.width||c.height!==this.canvas.height){const n=document.createElement('canvas');n.width=this.canvas.width;n.height=this.canvas.height;n.getContext('2d').drawImage(c,0,0,n.width,n.height);this.paintCache.set(layer.id,n);c=n;}
      return c;
    }
    layerTransform(ctx,layer){
      const cx=layer.x+layer.w/2, cy=layer.y+layer.h/2;
      ctx.translate(cx,cy); ctx.rotate((Number(layer.rotation)||0)*Math.PI/180);
      const sx=(layer.flipX?-1:1)*(Number(layer.scaleX)||1), sy=(layer.flipY?-1:1)*(Number(layer.scaleY)||1);
      ctx.transform(1,Math.tan((Number(layer.skewY)||0)*Math.PI/180),Math.tan((Number(layer.skewX)||0)*Math.PI/180),1,0,0); ctx.scale(sx,sy); ctx.translate(-layer.w/2,-layer.h/2);
    }
    layerFilter(layer){const f=layer.filters||{};return `brightness(${f.brightness??100}%) contrast(${f.contrast??100}%) saturate(${f.saturation??100}%) grayscale(${f.grayscale??0}%) sepia(${f.sepia??0}%) blur(${f.blur??0}px)`;}
    async drawLayer(ctx,layer){
      if(!layer.visible)return;
      ctx.save();ctx.globalAlpha=U.clamp(layer.opacity??1,0,1);ctx.globalCompositeOperation=layer.blend||'source-over';
      if(layer.shadow?.enabled){ctx.shadowColor=layer.shadow.color||'#000';ctx.shadowBlur=Number(layer.shadow.blur)||0;ctx.shadowOffsetX=Number(layer.shadow.x)||0;ctx.shadowOffsetY=Number(layer.shadow.y)||0;}
      if(layer.type==='paint'){
        const p=this.getPaintCanvas(layer);ctx.filter=this.layerFilter(layer);ctx.drawImage(p,0,0,this.canvas.width,this.canvas.height);ctx.restore();return;
      }
      if(layer.type==='texture'){this.drawTexture(ctx,layer);ctx.restore();return;}
      this.layerTransform(ctx,layer);ctx.filter=this.layerFilter(layer);
      if(layer.type==='image'){
        const img=await this.ensureImage(layer.src);if(img)ctx.drawImage(img,0,0,layer.w,layer.h);
      } else if(layer.type==='text'){this.drawText(ctx,layer);}
      else if(layer.type==='shape'){this.drawShape(ctx,layer);}
      ctx.restore();
    }
    drawShape(ctx,l){
      ctx.fillStyle=l.fill||'#184c54';ctx.strokeStyle=l.stroke||'#17252a';ctx.lineWidth=Number(l.strokeWidth)||0;
      if(l.shape==='ellipse'){ctx.beginPath();ctx.ellipse(l.w/2,l.h/2,l.w/2,l.h/2,0,0,Math.PI*2);if(l.fill!=='transparent')ctx.fill();if(l.strokeWidth)ctx.stroke();}
      else {if(l.radius){const r=Math.min(Number(l.radius)||0,l.w/2,l.h/2);ctx.beginPath();ctx.roundRect?.(0,0,l.w,l.h,r);if(!ctx.roundRect){ctx.rect(0,0,l.w,l.h);}if(l.fill!=='transparent')ctx.fill();if(l.strokeWidth)ctx.stroke();}else{if(l.fill!=='transparent')ctx.fillRect(0,0,l.w,l.h);if(l.strokeWidth)ctx.strokeRect(0,0,l.w,l.h);}}
    }
    wrapText(ctx,text,maxWidth,letterSpacing){
      const paragraphs=String(text||'').split('\n'), lines=[];
      for(const para of paragraphs){
        const words=para.split(/\s+/);let line='';
        for(const word of words){const test=line?`${line} ${word}`:word;const width=ctx.measureText(test).width+Math.max(0,test.length-1)*letterSpacing;if(width>maxWidth&&line){lines.push(line);line=word;}else line=test;}
        lines.push(line||' ');
      }
      return lines;
    }
    drawSpacedText(ctx,text,x,y,spacing,stroke){
      if(!spacing){stroke?ctx.strokeText(text,x,y):ctx.fillText(text,x,y);return;}
      const align=ctx.textAlign;let width=0;for(const ch of text)width+=ctx.measureText(ch).width+spacing;width-=spacing;
      let cx=x;if(align==='center')cx-=width/2;else if(align==='right')cx-=width;ctx.textAlign='left';
      for(const ch of text){stroke?ctx.strokeText(ch,cx,y):ctx.fillText(ch,cx,y);cx+=ctx.measureText(ch).width+spacing;}ctx.textAlign=align;
    }
    drawText(ctx,l){
      const size=Math.max(4,Number(l.fontSize)||72), family=l.fontFamily||'Georgia', weight=l.bold?'700':'400', style=l.italic?'italic':'normal';
      ctx.font=`${style} ${weight} ${size}px ${family}`;ctx.textAlign=l.align||'center';ctx.textBaseline='top';ctx.fillStyle=l.color||'#17252a';ctx.strokeStyle=l.stroke||'#fff8e5';ctx.lineWidth=Number(l.strokeWidth)||0;ctx.lineJoin='round';
      const spacing=Number(l.letterSpacing)||0,lineHeight=size*(Number(l.lineHeight)||1.12), lines=this.wrapText(ctx,l.text||'',Math.max(10,l.w),spacing);let y=0;
      const x=l.align==='left'?0:l.align==='right'?l.w:l.w/2;
      for(const line of lines){if(l.strokeWidth>0)this.drawSpacedText(ctx,line,x,y,spacing,true);this.drawSpacedText(ctx,line,x,y,spacing,false);y+=lineHeight;if(y>l.h)break;}
    }
    seeded(seed){let x=(seed||123456789)>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000;};}
    drawTexture(ctx,l){
      const w=this.canvas.width,h=this.canvas.height,id=l.textureId||'paper',density=Number(l.density??.15),scale=Math.max(1,Number(l.textureScale)||3),rand=this.seeded(Number(l.seed)||12345);
      ctx.save();ctx.globalAlpha=U.clamp(l.opacity??.2,0,1);ctx.globalCompositeOperation=l.blend||'multiply';
      if(id==='vignette'){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.18,w/2,h/2,Math.max(w,h)*.68);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,l.color||'rgba(0,0,0,.9)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();return;}
      if(id==='halftone'){ctx.fillStyle=l.color||'#17252a';for(let y=0;y<h;y+=scale*2){for(let x=(Math.floor(y/(scale*2))%2)*scale;x<w;x+=scale*2){ctx.beginPath();ctx.arc(x,y,Math.max(.5,scale*density),0,Math.PI*2);ctx.fill();}}ctx.restore();return;}
      if(id==='linen'||id==='canvas'){ctx.strokeStyle=l.color||'#675e4f';ctx.lineWidth=Math.max(.4,scale*.12);for(let x=0;x<w;x+=scale){ctx.globalAlpha=U.clamp((l.opacity??.2)*(.55+rand()),0,1);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=scale){ctx.globalAlpha=U.clamp((l.opacity??.2)*(.55+rand()),0,1);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}ctx.restore();return;}
      const count=Math.min(180000,Math.floor(w*h*density/(scale*scale*45)));ctx.fillStyle=l.color||'#302c26';
      for(let i=0;i<count;i++){const x=rand()*w,y=rand()*h,s=(.4+rand()*1.4)*scale;ctx.globalAlpha=U.clamp((l.opacity??.2)*(.25+rand()),0,1);ctx.fillRect(x,y,s,s*(id==='speckle'?rand()*2+.2:.35));}
      ctx.restore();
    }
    async render(){
      if(!this.project)return;const ctx=this.ctx;ctx.save();ctx.clearRect(0,0,this.canvas.width,this.canvas.height);ctx.fillStyle=this.project.document.background||'#fff';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      for(const layer of this.project.layers){await this.drawLayer(ctx,layer);}ctx.restore();this.renderOverlay();
      document.dispatchEvent(new CustomEvent('lf:rendered'));
    }
    renderOverlay(){
      const ctx=this.octx;ctx.clearRect(0,0,this.overlay.width,this.overlay.height);if(!this.project)return;
      if(this.project.document.guides)this.drawGuides(ctx);
      const layer=this.project.layers.find(l=>l.id===this.project.selectedLayerId);if(layer&&layer.visible&&layer.type!=='paint'&&layer.type!=='texture')this.drawSelection(ctx,layer);
    }
    drawGuides(ctx){
      const m=this.metrics,d=this.project.document;ctx.save();ctx.lineWidth=Math.max(1,2/this.zoom);ctx.setLineDash([10/this.zoom,7/this.zoom]);
      const bleed=m.bleedPx;ctx.strokeStyle='rgba(202,99,9,.9)';ctx.strokeRect(bleed,bleed,this.overlay.width-bleed*2,this.overlay.height-bleed*2);
      const safe=bleed+m.safePx;ctx.strokeStyle='rgba(0,120,130,.8)';ctx.strokeRect(safe,safe,this.overlay.width-safe*2,this.overlay.height-safe*2);
      if(d.coverMode==='wrap'){
        const backEnd=bleed+m.trimWidthPx, spineEnd=backEnd+m.spinePx;ctx.strokeStyle='rgba(120,35,100,.88)';ctx.beginPath();ctx.moveTo(backEnd,bleed);ctx.lineTo(backEnd,this.overlay.height-bleed);ctx.moveTo(spineEnd,bleed);ctx.lineTo(spineEnd,this.overlay.height-bleed);ctx.stroke();
      }
      ctx.restore();
    }
    corners(layer){
      const pts=[[0,0],[layer.w,0],[layer.w,layer.h],[0,layer.h]],cx=layer.x+layer.w/2,cy=layer.y+layer.h/2,a=(Number(layer.rotation)||0)*Math.PI/180,cos=Math.cos(a),sin=Math.sin(a),sx=(layer.flipX?-1:1)*(Number(layer.scaleX)||1),sy=(layer.flipY?-1:1)*(Number(layer.scaleY)||1),kx=Math.tan((Number(layer.skewX)||0)*Math.PI/180),ky=Math.tan((Number(layer.skewY)||0)*Math.PI/180);
      return pts.map(([x,y])=>{x-=layer.w/2;y-=layer.h/2;let tx=(x+kx*y)*sx,ty=(ky*x+y)*sy;return{x:cx+tx*cos-ty*sin,y:cy+tx*sin+ty*cos};});
    }
    drawSelection(ctx,l){const c=this.corners(l);ctx.save();ctx.strokeStyle='#00ffff';ctx.fillStyle='#fff';ctx.lineWidth=Math.max(1,2/this.zoom);ctx.setLineDash([7/this.zoom,4/this.zoom]);ctx.beginPath();ctx.moveTo(c[0].x,c[0].y);for(let i=1;i<c.length;i++)ctx.lineTo(c[i].x,c[i].y);ctx.closePath();ctx.stroke();ctx.setLineDash([]);const r=5/this.zoom;for(const p of c){ctx.fillRect(p.x-r,p.y-r,r*2,r*2);ctx.strokeRect(p.x-r,p.y-r,r*2,r*2);}ctx.restore();}
    pointInLayer(point,l){
      if(l.type==='paint'||l.type==='texture')return false;
      const cx=l.x+l.w/2,cy=l.y+l.h/2,a=-(Number(l.rotation)||0)*Math.PI/180,dx=point.x-cx,dy=point.y-cy,cos=Math.cos(a),sin=Math.sin(a);let x=dx*cos-dy*sin,y=dx*sin+dy*cos;
      const sx=(l.flipX?-1:1)*(Number(l.scaleX)||1),sy=(l.flipY?-1:1)*(Number(l.scaleY)||1);if(Math.abs(sx)<.001||Math.abs(sy)<.001)return false;x/=sx;y/=sy;
      const kx=Math.tan((Number(l.skewX)||0)*Math.PI/180),ky=Math.tan((Number(l.skewY)||0)*Math.PI/180),det=1-kx*ky;if(Math.abs(det)>.001){const nx=(x-kx*y)/det,ny=(y-ky*x)/det;x=nx;y=ny;}
      return x>=-l.w/2&&x<=l.w/2&&y>=-l.h/2&&y<=l.h/2;
    }
    hitTest(point){for(let i=this.project.layers.length-1;i>=0;i--){const l=this.project.layers[i];if(l.visible&&!l.locked&&this.pointInLayer(point,l))return l;}return null;}
    async exportCanvas(){const c=document.createElement('canvas');c.width=this.canvas.width;c.height=this.canvas.height;const ctx=c.getContext('2d');ctx.fillStyle=this.project.document.background||'#fff';ctx.fillRect(0,0,c.width,c.height);for(const layer of this.project.layers)await this.drawLayer(ctx,layer);return c;}
    async previewDataUrl(maxW=420,maxH=420){const source=await this.exportCanvas(),scale=Math.min(1,maxW/source.width,maxH/source.height),c=document.createElement('canvas');c.width=Math.max(1,Math.round(source.width*scale));c.height=Math.max(1,Math.round(source.height*scale));c.getContext('2d').drawImage(source,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.78);}
  }

  LF.Renderer=Renderer;
})(window);
