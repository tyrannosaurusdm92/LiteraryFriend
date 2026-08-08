(function(global){
  'use strict';
  const LF=global.LFArt;
  if(!LF)return;
  const BRUSH_TOOLS=new Set(['paint','pencil','ink','marker','crayon','charcoal','calligraphy','neon','spray','graffiti','pixel','eraser']);
  const SHAPES=new Set(['rect','ellipse','roundrect','triangle','diamond','star','polygon','cloud','burst','moon','plant','cube','heart','arrow','speech','line']);
  const BLENDS=new Set(['source-over','multiply','screen','overlay','soft-light','hard-light','color-dodge','color-burn','difference','lighter']);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const color=(v,f='#17252a')=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):f;
  const resolveColor=(v,palette={},f='#17252a')=>{const s=String(v||'');return s.startsWith('$')?color(palette[s.slice(1)],f):color(s,f);};
  const status=(text,kind='')=>{const el=document.getElementById('aiToolsResult');if(el){el.textContent=text;el.className=`ai-result ${kind==='ok'?'status-ok':kind==='warn'?'status-warn':''}`.trim();}};
  const resultText=r=>{
    const x=r?.result??r?.data?.result??r?.data??r;
    if(typeof x==='string')return x;
    if(x&&typeof x==='object'){
      if(Array.isArray(x.operations))return JSON.stringify(x);
      return String(x.response||x.output_text||x.text||x.reply||x.content||x.answer||'');
    }
    return '';
  };
  function parsePlan(value){
    if(value&&typeof value==='object'&&Array.isArray(value.operations))return value;
    let t=String(value||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
    try{const j=JSON.parse(t);if(Array.isArray(j.operations))return j;}catch{}
    const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a>=0&&b>a){try{const j=JSON.parse(t.slice(a,b+1));if(Array.isArray(j.operations))return j;}catch{}}
    return null;
  }
  function localPlan(prompt,mode='build'){
    const lower=String(prompt||'').toLowerCase();
    const dark=/horror|thriller|night|dark|goth|storm|mystery/.test(lower);
    const warm=/romance|sunset|warm|gold|fire|autumn/.test(lower);
    const cosmic=/space|sci[- ]?fi|star|galaxy|cosmic|neon/.test(lower);
    const palette=cosmic?['#061d33','#00ffff','#1e90ff','#f2ffff']:warm?['#2a1208','#ca6309','#f4c430','#fff4db']:dark?['#080b12','#184c54','#ca6309','#f2ffff']:['#003333','#00ffff','#ca6309','#f2ffff'];
    const ops=[];
    if(mode==='build')ops.push({op:'clear',background:palette[0]});
    ops.push({op:'shape',shape:cosmic?'star':dark?'moon':'roundrect',fill:palette[1],stroke:palette[3],opacity:.3,x:.08,y:.12,w:.84,h:.62,rotation:dark?-8:0});
    ops.push({op:'shape',shape:'line',fill:palette[2],stroke:palette[2],opacity:.8,x:.08,y:.72,w:.84,h:.04,rotation:0});
    // A mixed-media pass demonstrates that AI composition is not limited to image prompting.
    const tools=mode==='decorate'?['pencil','ink','marker','crayon','charcoal','calligraphy','neon','spray','graffiti','pixel','paint','eraser']:['paint',cosmic?'neon':dark?'charcoal':'ink','pencil'];
    tools.forEach((tool,i)=>ops.push({op:'stroke',tool,color:palette[(i%3)+1],size:tool==='spray'?72:tool==='pixel'?14:18+i*3,opacity:tool==='marker'?.35:.55,points:[[.08,.2+i*.035],[.25,.17+i*.025],[.48,.25+i*.02],[.72,.19+i*.03],[.9,.28+i*.025]]}));
    if(mode==='build'){
      const book=global.__LF_BOOK_SPEC__||{};
      if(book.title)ops.push({op:'text',text:String(book.title),role:'Title Text',color:palette[3],stroke:palette[0],fontSize:.075,x:.1,y:.10,w:.8,h:.22,bold:true});
      const author=book.author||book.creator||'';if(author)ops.push({op:'text',text:String(author),role:'Author Text',color:palette[3],stroke:palette[0],fontSize:.035,x:.12,y:.82,w:.76,h:.10,bold:false});
      ops.push({op:'gradient',a:palette[1],b:palette[2],angle:32,opacity:.18,blend:'overlay',name:'AI Color Wash'});
      ops.push({op:'texture',textureId:'paper',opacity:.15,intensity:.42,blend:'overlay'});
      ops.push({op:'sample',x:.5,y:.5,as:'midTone'});
      ops.push({op:'layer',name:'AI Finish',opacity:.96,blend:'source-over'});
    }
    return {name:'Editable tool composition',operations:ops};
  }
  function metricPoint(m,p){return {x:clamp(p?.[0],0,1)*m.widthPx,y:clamp(p?.[1],0,1)*m.heightPx};}
  function patchBounds(layer,m,op){
    const patch={};
    if(Number.isFinite(Number(op.x)))patch.x=clamp(op.x,0,1)*m.widthPx;
    if(Number.isFinite(Number(op.y)))patch.y=clamp(op.y,0,1)*m.heightPx;
    if(Number.isFinite(Number(op.w)))patch.w=Math.max(2,clamp(op.w,.01,1.5)*m.widthPx);
    if(Number.isFinite(Number(op.h)))patch.h=Math.max(2,clamp(op.h,.01,1.5)*m.heightPx);
    if(Number.isFinite(Number(op.rotation)))patch.rotation=clamp(op.rotation,-180,180);
    if(Number.isFinite(Number(op.opacity)))patch.opacity=clamp(op.opacity,0,1);
    if(op.blend&&BLENDS.has(op.blend))patch.blend=op.blend;
    Object.assign(layer,patch);return layer;
  }
  function drawStroke(editor,renderer,op,palette={}){
    const tool=BRUSH_TOOLS.has(op.tool)?op.tool:'paint';
    let layer=editor.selected();
    if(tool==='eraser'){if(!layer||layer.type!=='paint')layer=[...editor.project.layers].reverse().find(x=>x.type==='paint'&&!x.locked)||null;if(!layer)return null;editor.select(layer.id);}
    else if(!layer||layer.type!=='paint'||layer.locked)layer=editor.addPaintLayer(`AI ${tool.charAt(0).toUpperCase()+tool.slice(1)} Layer`);
    const c=renderer.getPaintCanvas(layer),ctx=c.getContext('2d');
    const m=renderer.metrics,points=(Array.isArray(op.points)&&op.points.length>1?op.points:[[.1,.5],[.3,.4],[.55,.55],[.85,.4]]).map(p=>metricPoint(m,p));
    editor.brush.color=resolveColor(op.color,palette,'#00ffff');editor.brush.secondaryColor=resolveColor(op.secondaryColor,palette,editor.brush.color);editor.brush.size=clamp(op.size||22,1,300);editor.brush.opacity=clamp(op.opacity??.65,.02,1);editor.brush.hardness=clamp(op.hardness??.55,0,1);editor.brush.softness=clamp(op.softness??editor.brush.softness??.45,0,1);editor.brush.smoothing=clamp(op.smoothing??editor.brush.smoothing??.35,0,1);editor.brush.flow=clamp(op.flow??.75,.02,1);editor.brush.spacing=clamp(op.spacing??.14,.01,1);editor.brush.blend=BLENDS.has(op.blend)?op.blend:'source-over';editor.mirror=!!op.mirror;if(op.brushProgram){const programs=LF.effects?.brushPrograms||LF.effects?.brushPresets||[];editor.brush.program=programs.find?.(x=>x.id===op.brushProgram)||editor.brush.program;}
    ctx.save();for(let i=1;i<points.length;i++)editor.paintAt(ctx,points[i-1],points[i],tool,clamp(op.pressure??1,.05,1));ctx.restore();layer.dataUrl=c.toDataURL('image/png');renderer.requestRender();return layer;
  }
  function targetLayer(editor,op={}){
    const layers=editor.project.layers||[];
    if(op.layerName){const n=String(op.layerName).toLowerCase();const hit=[...layers].reverse().find(x=>String(x.name||'').toLowerCase()===n||String(x.name||'').toLowerCase().includes(n));if(hit)return hit;}
    if(Number.isInteger(Number(op.layerIndex))){const i=Number(op.layerIndex);return i<0?layers[layers.length+i]:layers[i];}
    if(op.layerType){const hit=[...layers].reverse().find(x=>x.type===op.layerType);if(hit)return hit;}
    return editor.selected();
  }
  function selectTarget(editor,op={}){const layer=targetLayer(editor,op);if(layer)editor.select(layer.id);return layer;}
  function fillPaint(editor,renderer,op,palette={}){
    let layer=targetLayer(editor,op);if(!layer||layer.type!=='paint'||layer.locked)layer=editor.addPaintLayer(op.name||'AI Fill Layer');else editor.select(layer.id);
    const c=renderer.getPaintCanvas(layer),ctx=c.getContext('2d'),x=clamp(op.x??.5,0,1)*c.width,y=clamp(op.y??.5,0,1)*c.height,fill=resolveColor(op.color,palette,'#00ffff');
    editor.pushHistory();LF.effects.floodFill(ctx,Math.round(x),Math.round(y),fill,clamp(op.tolerance??.18,0,1),false);if(op.mirror)LF.effects.floodFill(ctx,Math.round(c.width-x),Math.round(y),fill,clamp(op.tolerance??.18,0,1),false);layer.dataUrl=c.toDataURL('image/png');renderer.requestRender();return layer;
  }
  function applyGradient(editor,renderer,op,palette={}){
    let layer=targetLayer(editor,op);const gradient={enabled:true,a:resolveColor(op.a,palette,'#00ffff'),b:resolveColor(op.b,palette,'#ca6309'),angle:clamp(op.angle??45,-360,360)};
    if(layer&&(layer.type==='shape'||layer.type==='text')){editor.pushHistory();layer.gradient={...(layer.gradient||{}),...gradient};editor.changed('AI gradient');return layer;}
    layer=editor.addShape('rect',{name:op.name||'AI Gradient',fill:gradient.a,stroke:gradient.a,strokeWidth:0,fillMode:'fill',gradient});layer.x=0;layer.y=0;layer.w=renderer.metrics.widthPx;layer.h=renderer.metrics.heightPx;layer.opacity=clamp(op.opacity??1,0,1);layer.blend=BLENDS.has(op.blend)?op.blend:'source-over';return layer;
  }
  async function sampleColor(renderer,op,palette={}){await renderer.render();const x=clamp(op.x??.5,0,1)*renderer.canvas.width,y=clamp(op.y??.5,0,1)*renderer.canvas.height,c=LF.effects.sampleCanvas(renderer.canvas,x,y),key=String(op.as||'sampled').replace(/[^a-z0-9_-]/gi,'').slice(0,40)||'sampled';palette[key]=c;return c;}
  function layerControl(editor,op={}){
    const layer=selectTarget(editor,op);if(!layer)return null;editor.pushHistory();if(op.name)layer.name=String(op.name).slice(0,120);if(op.visible!==undefined)layer.visible=!!op.visible;if(op.locked!==undefined)layer.locked=!!op.locked;if(Number.isFinite(Number(op.opacity)))layer.opacity=clamp(op.opacity,0,1);if(op.blend&&BLENDS.has(op.blend))layer.blend=op.blend;if(op.shadow&&typeof op.shadow==='object')layer.shadow={...(layer.shadow||{}),enabled:op.shadow.enabled!==false,color:color(op.shadow.color,'#000000'),blur:clamp(op.shadow.blur??18,0,100),x:clamp(op.shadow.x??8,-200,200),y:clamp(op.shadow.y??8,-200,200)};editor.changed('AI layer settings');return layer;
  }
  function applyTextStyle(editor,op,palette={}){
    const layer=selectTarget(editor,op);if(!layer||layer.type!=='text')return null;editor.pushHistory();
    if(op.fontFamily)layer.fontFamily=String(op.fontFamily).slice(0,100);if(Number.isFinite(Number(op.fontSize)))layer.fontSize=clamp(op.fontSize,4,1000);
    if(op.bold!==undefined)layer.bold=!!op.bold;if(op.italic!==undefined)layer.italic=!!op.italic;if(op.underline!==undefined)layer.underline=!!op.underline;if(op.strike!==undefined)layer.strike=!!op.strike;
    if(op.align)layer.align=['left','center','right'].includes(op.align)?op.align:layer.align;if(Number.isFinite(Number(op.letterSpacing)))layer.letterSpacing=clamp(op.letterSpacing,-20,100);if(Number.isFinite(Number(op.lineHeight)))layer.lineHeight=clamp(op.lineHeight,.5,3);if(Number.isFinite(Number(op.bend)))layer.bend=clamp(op.bend,-100,100);
    if(op.color)layer.color=resolveColor(op.color,palette,layer.color||'#f2ffff');if(op.stroke)layer.stroke=resolveColor(op.stroke,palette,layer.stroke||'#001010');if(Number.isFinite(Number(op.strokeWidth)))layer.strokeWidth=clamp(op.strokeWidth,0,100);
    if(op.highlight){layer.highlight=resolveColor(op.highlight,palette,'#fff3d6');layer.highlightOpacity=clamp(op.highlightOpacity??.38,0,1);}if(op.shadow&&typeof op.shadow==='object'){layer.textShadowBlur=clamp(op.shadow.blur??0,0,100);layer.textShadowColor=resolveColor(op.shadow.color,palette,'#000000');layer.textShadowX=clamp(op.shadow.x??4,-200,200);layer.textShadowY=clamp(op.shadow.y??4,-200,200);}
    if(op.gradient&&typeof op.gradient==='object')layer.gradient={...(layer.gradient||{}),enabled:op.gradient.enabled!==false,a:resolveColor(op.gradient.a,palette,'#00ffff'),b:resolveColor(op.gradient.b,palette,'#ca6309'),angle:clamp(op.gradient.angle??45,-180,180)};
    editor.changed('AI text styling');return layer;
  }
  function cropLayer(editor,op){const layer=selectTarget(editor,op);if(!layer||layer.type!=='image')return null;return editor.cropSelected({x:clamp(op.x??0,0,.99),y:clamp(op.y??0,0,.99),w:clamp(op.w??1,.01,1),h:clamp(op.h??1,.01,1)});}
  function arrangeLayer(editor,op){const layer=selectTarget(editor,op);if(!layer)return null;const mode=String(op.mode||op.align||'center').toLowerCase();if(['left','center','right','top','middle','bottom'].includes(mode))return editor.alignSelected(mode);return layer;}
  function groupLayers(editor,op){const names=(op.layers||op.layerNames||[]).map(String).filter(Boolean);if(names.length>1){const matches=editor.project.layers.filter(l=>names.some(n=>String(l.name||'').toLowerCase().includes(n.toLowerCase())));if(matches.length>1){editor.pushHistory();const id=matches.find(x=>x.groupId)?.groupId||`group_ai_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;matches.forEach(l=>l.groupId=id);editor.select(matches.at(-1).id);editor.changed('AI group');return matches;}}selectTarget(editor,op);return editor.groupSelectedWithAdjacent();}
  function addStamp(editor,renderer,op){const st=editor.stamp||{};if(!st.src||!st.image)return null;const m=renderer.metrics,size=clamp(op.size??.12,.01,1)*Math.min(m.widthPx,m.heightPx),ratio=st.image.width/Math.max(1,st.image.height),w=ratio>=1?size:size*ratio,h=ratio>=1?size/ratio:size;return editor.addLayer({type:'image',name:op.name||'AI Image Stamp',src:st.src,naturalWidth:st.image.width,naturalHeight:st.image.height,x:clamp(op.x??.5,0,1)*m.widthPx-w/2,y:clamp(op.y??.5,0,1)*m.heightPx-h/2,w,h,rotation:clamp(op.rotation??st.rotation??0,-360,360),opacity:clamp(op.opacity??st.opacity??1,0,1)});}
  function convolution(data,w,h,kernel,div=1,bias=0){const src=new Uint8ClampedArray(data),side=Math.sqrt(kernel.length)|0,half=side>>1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){let rr=0,gg=0,bb=0;for(let ky=0;ky<side;ky++)for(let kx=0;kx<side;kx++){const xx=Math.max(0,Math.min(w-1,x+kx-half)),yy=Math.max(0,Math.min(h-1,y+ky-half)),i=(yy*w+xx)*4,k=kernel[ky*side+kx];rr+=src[i]*k;gg+=src[i+1]*k;bb+=src[i+2]*k;}const o=(y*w+x)*4;data[o]=Math.max(0,Math.min(255,rr/div+bias));data[o+1]=Math.max(0,Math.min(255,gg/div+bias));data[o+2]=Math.max(0,Math.min(255,bb/div+bias));}}
  function bakePaint(editor,renderer,op){const layer=selectTarget(editor,op);if(!layer||layer.type!=='paint')return null;const name=String(op.effect||'grayscale').toLowerCase(),c=renderer.getPaintCanvas(layer),ctx=c.getContext('2d');editor.pushHistory();const img=ctx.getImageData(0,0,c.width,c.height),d=img.data;if(['grayscale','invert','sepia'].includes(name)){for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(name==='grayscale'){const y=.299*r+.587*g+.114*b;d[i]=d[i+1]=d[i+2]=y;}else if(name==='invert'){d[i]=255-r;d[i+1]=255-g;d[i+2]=255-b;}else{d[i]=Math.min(255,.393*r+.769*g+.189*b);d[i+1]=Math.min(255,.349*r+.686*g+.168*b);d[i+2]=Math.min(255,.272*r+.534*g+.131*b);}}}else if(name==='sharpen')convolution(d,c.width,c.height,[0,-1,0,-1,5,-1,0,-1,0]);else if(name==='emboss')convolution(d,c.width,c.height,[-2,-1,0,-1,1,1,0,1,2],1,128);else if(name==='edge')convolution(d,c.width,c.height,[-1,-1,-1,-1,8,-1,-1,-1,-1],1,128);ctx.putImageData(img,0,0);layer.dataUrl=c.toDataURL('image/png');editor.changed('AI baked paint effect');return layer;}
  async function execute(plan,{append=false}={}){
    const api=LF.studioApi,editor=api?._getEditor?.(),renderer=api?._getRenderer?.();if(!editor||!renderer)throw new Error('The cover canvas is still loading.');
    const m=renderer.metrics,palette={...(plan?.palette||{})};
    const ops=Array.isArray(plan?.operations)?plan.operations.slice(0,120):[];
    if(!append&&ops[0]?.op!=='clear')editor.pushHistory();
    for(const op of ops){
      if(!op||typeof op!=='object')continue;
      switch(String(op.op||'').toLowerCase()){
        case 'clear': {
          editor.pushHistory();editor.project.layers=[];editor.project.selectedLayerId=null;editor.renderer.paintCache.clear();editor.setDocument({background:resolveColor(op.background,palette,'#001010')},false);break;
        }
        case 'background': editor.setDocument({background:resolveColor(op.color,palette,'#001010')},true);break;
        case 'shape': {
          const shape=SHAPES.has(op.shape)?op.shape:'rect';const layer=editor.addShape(shape,{name:op.name||`AI ${shape}`,shapeSides:clamp(op.sides||6,3,18),fillMode:['fillStroke','fill','stroke'].includes(op.fillMode)?op.fillMode:'fillStroke',fill:resolveColor(op.fill,palette,'#00ffff'),stroke:resolveColor(op.stroke,palette,'#f2ffff'),strokeWidth:clamp(op.strokeWidth??3,0,100),opacity:clamp(op.opacity??.75,0,1)});patchBounds(layer,m,op);break;
        }
        case 'text': {
          if(!String(op.text||'').trim())break;const fs=Number(op.fontSize);const layer=editor.addText(String(op.text),{name:op.role||op.name||'AI Text',fontFamily:String(op.fontFamily||'Georgia').slice(0,80),fontSize:fs>0&&fs<1?m.widthPx*fs:clamp(fs||m.widthPx*.065,8,1000),bold:op.bold!==false,color:resolveColor(op.color,palette,'#f2ffff'),stroke:resolveColor(op.stroke,palette,'#001010'),strokeWidth:clamp(op.strokeWidth??2,0,50)});patchBounds(layer,m,op);applyTextStyle(editor,{...op,layerName:layer.name},palette);break;
        }
        case 'texture': {
          const presets=LF.effects?.texturePrograms||[];const preset=presets.find?.(x=>x.id===op.textureId)||{id:op.textureId||'paper',name:op.name||'AI Texture',renderer:op.renderer||''};const layer=editor.addTexture({...preset,intensity:clamp(op.intensity??.5,0,1),opacity:clamp(op.opacity??.25,0,1),blend:BLENDS.has(op.blend)?op.blend:'overlay',scale:clamp(op.scale??1,.2,3),angle:clamp(op.angle??18,-180,180)});break;
        }
        case 'pattern': editor.addPattern(String(op.pattern||'checker'),{primary:resolveColor(op.primary,palette,'#00ffff'),secondary:resolveColor(op.secondary,palette,'#ffffff'),intensity:clamp(op.intensity??.7,0,1),opacity:clamp(op.opacity??.3,0,1),scale:clamp(op.scale??18,1,200),angle:clamp(op.angle??35,-180,180),blend:BLENDS.has(op.blend)?op.blend:'overlay'});break;
        case 'stroke': drawStroke(editor,renderer,op,palette);break;
        case 'fill': fillPaint(editor,renderer,op,palette);break;
        case 'gradient': applyGradient(editor,renderer,op,palette);break;
        case 'sample': await sampleColor(renderer,op,palette);break;
        case 'select': selectTarget(editor,op);break;
        case 'layer': layerControl(editor,op);break;
        case 'delete': {const layer=selectTarget(editor,op);if(layer)editor.deleteSelected();break;}
        case 'transform': {
          const layer=selectTarget(editor,op);if(layer){patchBounds(layer,m,op);if(Number.isFinite(Number(op.scaleX)))layer.scaleX=clamp(op.scaleX,.05,20);if(Number.isFinite(Number(op.scaleY)))layer.scaleY=clamp(op.scaleY,.05,20);if(Number.isFinite(Number(op.skewX)))layer.skewX=clamp(op.skewX,-80,80);if(Number.isFinite(Number(op.skewY)))layer.skewY=clamp(op.skewY,-80,80);layer.flipX=!!op.flipX;layer.flipY=!!op.flipY;editor.changed('AI transform');}break;
        }
        case 'filter': {
          const layer=selectTarget(editor,op);if(layer){layer.filters={...(layer.filters||{}),brightness:clamp(op.brightness??100,0,250),contrast:clamp(op.contrast??100,0,250),saturation:clamp(op.saturation??100,0,300),grayscale:clamp(op.grayscale??0,0,100),sepia:clamp(op.sepia??0,0,100),blur:clamp(op.blur??0,0,40),invert:clamp(op.invert??0,0,100),hue:clamp(op.hue??0,-180,180)};editor.changed('AI filter');}break;
        }
        case 'textstyle': applyTextStyle(editor,op,palette);break;
        case 'crop': cropLayer(editor,op);break;
        case 'align': arrangeLayer(editor,op);break;
        case 'group': groupLayers(editor,op);break;
        case 'ungroup': selectTarget(editor,op);editor.ungroupSelected();break;
        case 'distribute': selectTarget(editor,op);editor.distributeGroup(String(op.axis||'horizontal').toLowerCase()==='vertical'?'vertical':'horizontal');break;
        case 'copy': selectTarget(editor,op);editor.copySelected();break;
        case 'cut': selectTarget(editor,op);editor.cutSelected();break;
        case 'paste': editor.pasteClipboard(clamp(op.offset??24,0,500));break;
        case 'stamp': addStamp(editor,renderer,op);break;
        case 'bake': bakePaint(editor,renderer,op);break;
        case 'duplicate': selectTarget(editor,op);editor.duplicateSelected();break;
        case 'layerup': selectTarget(editor,op);editor.moveLayer(1);break;
        case 'layerdown': selectTarget(editor,op);editor.moveLayer(-1);break;
        case 'front': {const layer=selectTarget(editor,op);if(layer){while(editor.project.layers.at(-1)?.id!==layer.id)editor.moveLayer(1);}break;}
        case 'back': {const layer=selectTarget(editor,op);if(layer){while(editor.project.layers[0]?.id!==layer.id)editor.moveLayer(-1);}break;}
      }
    }
    editor.changed('AI tool composition');renderer.requestRender();return ops.length;
  }
  function planInstruction(prompt,mode){
    const spec=global.__LF_BOOK_SPEC__||{};
    return `Create a structured, editable LiteraryFriend book-cover composition plan. Return ONLY JSON with {"name":"...","operations":[...]}. Do not return markdown. Use the actual editable cover tools, not descriptions. Available operations: clear, background; shape (rect, ellipse, roundrect, triangle, diamond, star, polygon, cloud, burst, moon, plant, cube, heart, arrow, speech, line); text and textStyle (font, size, bold, italic, underline, strike, alignment, tracking, line height, bend, fill, outline, highlight, gradient, text shadow); texture; pattern; stroke using paint, pencil, ink, marker, crayon, charcoal, calligraphy, neon, spray, graffiti, pixel, eraser plus brushProgram, size, hardness, softness, opacity, flow, spacing, smoothing, pressure, mirror, blend; fill/bucket; gradient; sample/eyedropper; select; layer rename/show/hide/lock/opacity/blend/shadow; transform position/resize/stretch/skew/rotate/flip; crop; align left/center/right/top/middle/bottom; group, ungroup, distribute horizontal/vertical; copy, cut, paste, duplicate; layerUp, layerDown, front, back; filter brightness/contrast/saturation/grayscale/sepia/blur/invert/hue; bake paint effects grayscale/invert/sepia/sharpen/emboss/edge; stamp when a reusable stamp is loaded. Coordinates x,y,w,h and stroke points are normalized 0..1 except explicitly pixel-valued settings. Use 10-40 purposeful operations and no more than 8 text layers. Preserve cover safe areas and strong title/author hierarchy. Every output must stay editable. ${mode==='decorate'?'Add a cohesive secondary tool pass without clearing existing art.':'Build a complete cover composition.'}
Book context: ${JSON.stringify(spec).slice(0,4000)}
Creative direction: ${String(prompt||'').slice(0,12000)}`;
  }
  async function requestPlan(prompt,mode){
    try{
      const outer=parent?.LF;if(!outer?.api?.token||!outer?.api?.request)return null;
      let projectId='';try{projectId=await parent.LFBackendFeatures?.ensureProjectId?.();}catch{}
      const r=await outer.api.request('ai.request',{projectId,jobType:'brainstorm',instruction:planInstruction(prompt,mode),input:{prompt,book:global.__LF_BOOK_SPEC__||{},currentLayers:LF.studioApi?.getProjectTitle?.()||''},context:{surface:'cover-art-tool-composer',editableTools:true},options:{responseFormat:'json'}},{timeout:120000});
      return parsePlan(r?.result)||parsePlan(resultText(r));
    }catch{return null;}
  }
  async function compose(mode='build'){
    const prompt=document.getElementById('aiPromptInput')?.value?.trim()||'Create a balanced, genre-appropriate book cover with strong focal hierarchy.';
    const button=document.getElementById(mode==='decorate'?'aiDecorateToolsBtn':'aiComposeToolsBtn');if(button)button.disabled=true;status('Planning editable layers and tool strokes…');
    try{const plan=await requestPlan(prompt,mode)||localPlan(prompt,mode);const count=await execute(plan,{append:mode==='decorate'});status(`Created an editable ${count}-operation cover pass with Studio tools.`,'ok');}
    catch(err){status(err?.message||'The tool composition could not be completed.','warn');}
    finally{if(button)button.disabled=false;}
  }
  function bind(){
    const a=document.getElementById('aiComposeToolsBtn'),b=document.getElementById('aiDecorateToolsBtn');if(!a||!b)return false;
    a.addEventListener('click',()=>compose('build'));b.addEventListener('click',()=>compose('decorate'));return true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{let tries=0;const t=setInterval(()=>{if(bind()||++tries>50)clearInterval(t);},100);},{once:true});else {let tries=0;const t=setInterval(()=>{if(bind()||++tries>50)clearInterval(t);},100);}
  LF.aiDirector={execute,compose,localPlan,tools:{brushes:[...BRUSH_TOOLS],shapes:[...SHAPES],operations:['clear','background','shape','text','textStyle','texture','pattern','stroke','fill','gradient','sample','select','layer','transform','crop','align','group','ungroup','distribute','copy','cut','paste','duplicate','delete','layerUp','layerDown','front','back','filter','bake','stamp']}};
})(window);
