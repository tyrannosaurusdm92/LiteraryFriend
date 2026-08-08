(function(){
  'use strict';
  const LF=window.LFArt,$=id=>document.getElementById(id),$$=(sel,root=document)=>[...root.querySelectorAll(sel)];
  let editor=null,renderer=null,brushes=[],palettes=[],textures=[],started=false;
  const n=(id,f=0)=>{const v=Number($(id)?.value);return Number.isFinite(v)?v:f;};
  const setOut=(id,v)=>{if($(id))$(id).textContent=String(v);};
  const status=(msg)=>{const el=$('statusText');if(el)el.textContent=msg;};
  const esc=s=>LF.util.escapeHtml(s);

  async function loadData(){
    const [b,p,t]=await Promise.all([
      LF.util.loadJson(LF.CONFIG.brushPresetsUrl,{presets:[]}),
      LF.util.loadJson(LF.CONFIG.colorPalettesUrl,{palettes:[]}),
      LF.util.loadJson(LF.CONFIG.texturePresetsUrl,{presets:[]})
    ]);
    brushes=b.presets||[];palettes=p.palettes||[];textures=t.presets||[];
  }
  function fillSelects(){
    const bs=$('effectsBrushPreset');if(bs){bs.innerHTML=brushes.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');if(brushes[0])useBrush(brushes[0]);}
    const ps=$('effectsPaletteSelect');if(ps){ps.innerHTML=palettes.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');if(palettes[0])usePalette(palettes[0]);}
    refreshTexturePreview();
  }
  function useBrush(b){
    if(!b||!editor)return;editor.brush.program=b;const size=Math.min(300,Math.max(1,Number(b.defaultPx)||editor.brush.size));editor.brush.size=size;
    if($('brushSizeInput')){$('brushSizeInput').value=size;$('brushSizeInput').dispatchEvent(new Event('input',{bubbles:true}));}
    if($('effectsBrushInfo'))$('effectsBrushInfo').innerHTML=`<strong>${esc(b.name)}</strong> · ${esc(b.description||b.family||'Procedural brush')}<br><span>${esc((b.uses||[]).slice(0,5).join(' · '))}</span>`;
    status(`Brush program: ${b.name}.`);
  }
  function usePalette(p){
    if(!p||!editor)return;const wrap=$('effectsPaletteSwatches');if(wrap){wrap.innerHTML='';for(const c of p.colors||[]){const b=document.createElement('button');b.type='button';b.title=`${c.name||'Color'}: ${c.hex}`;b.style.background=c.hex;b.addEventListener('click',()=>setColor(c.hex));wrap.appendChild(b);}}
    editor.spray.colors=(p.colors||[]).map(c=>c.hex).filter(Boolean);status(`Palette: ${p.name}.`);
  }
  function setColor(color){
    if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;const c=color.toUpperCase();editor.brush.color=c;
    if($('brushColorInput')){$('brushColorInput').value=c;$('brushColorInput').dispatchEvent(new Event('input',{bubbles:true}));}
    if($('effectsHexInput'))$('effectsHexInput').value=c;document.documentElement.style.setProperty('--paint-current',c);const [r,g,b]=LF.effects.parseHex(c);document.documentElement.style.setProperty('--paint-rgb',`${r} ${g} ${b}`);
  }
  function complement(hex){const [r,g,b]=LF.effects.parseHex(hex);return LF.effects.rgbToHex(255-r,255-g,255-b);}
  function currentTexture(){return textures.find(x=>x.id===$('textureSelect')?.value)||null;}
  function refreshTexturePreview(){
    const p=currentTexture(),el=$('effectsTexturePreview');if(!el||!p)return;el.className=`program-texture-preview studio-texture ${p.cssClass||''}`;const c=$('effectsTextureColor')?.value||'#302c26',[r,g,b]=LF.effects.parseHex(c),intensity=n('effectsTextureIntensity',Math.round((p.intensity??.55)*100))/100,scale=n('effectsTextureScale',100)/100,angle=n('effectsTextureAngle',18);el.style.setProperty('--paint-current',c);el.style.setProperty('--paint-rgb',`${r} ${g} ${b}`);el.style.setProperty('--paper-rgb','246 240 223');el.style.setProperty('--texture-intensity',String(intensity));el.style.setProperty('--texture-scale',String(scale));el.style.setProperty('--texture-angle',`${angle}deg`);if($('effectsTextureInfo'))$('effectsTextureInfo').innerHTML=`<strong>${esc(p.name)}</strong> · ${esc(p.description||p.category||'Procedural texture')}`;
  }
  function patchSelectedTexture(){const s=editor.selected();if(s?.type!=='texture')return;s.textureIntensity=n('effectsTextureIntensity',55)/100;s.textureScale=n('effectsTextureScale',100)/100;s.textureAngle=n('effectsTextureAngle',18);s.color=$('effectsTextureColor').value;s.opacity=n('effectsTextureOpacity',28)/100;editor.changed('Texture adjusted');}
  function patchSelectedText(patch){const s=editor.selected();if(s?.type!=='text')return;Object.assign(s,patch);editor.changed('Text effect adjusted');}
  function patchTextGradient(){const s=editor.selected();if(s?.type!=='text')return;s.gradient={...(s.gradient||{}),enabled:$('effectsTextGradientToggle').checked,a:$('effectsTextGradientA').value,b:$('effectsTextGradientB').value,angle:n('effectsTextGradientAngle',45)};editor.changed('Text gradient adjusted');}
  function patchShape(){const s=editor.selected();if(s?.type!=='shape')return;s.shape=$('effectsSelectedShapeType').value;s.shapeSides=n('effectsSelectedShapeSides',6);s.fillMode=$('effectsSelectedShapeFillMode').value;s.gradient={...(s.gradient||{}),enabled:$('effectsShapeGradientToggle').checked,a:$('effectsShapeGradientA').value,b:$('effectsShapeGradientB').value,angle:n('effectsShapeGradientAngle',45)};editor.changed('Shape effect adjusted');}
  function sync(){
    if(!editor)return;const s=editor.selected();
    if($('effectsHexInput')&&document.activeElement!==$('effectsHexInput'))$('effectsHexInput').value=String(editor.brush.color||'#17252a').toUpperCase();
    if(s?.type==='text'){
      $('effectsTextLineHeight').value=s.lineHeight??1.08;$('effectsTextBend').value=Math.round((Number(s.bend)||0)*100);setOut('effectsTextBendOut',$('effectsTextBend').value);$('effectsUnderlineToggle').checked=!!s.underline;$('effectsStrikeToggle').checked=!!s.strike;$('effectsHighlightColor').value=s.highlight||'#fff3d6';$('effectsHighlightOpacity').value=Math.round((Number(s.highlightOpacity)||0)*100);$('effectsTextGradientToggle').checked=!!s.gradient?.enabled;$('effectsTextGradientA').value=s.gradient?.a||'#00ffff';$('effectsTextGradientB').value=s.gradient?.b||'#ca6309';$('effectsTextGradientAngle').value=s.gradient?.angle??45;setOut('effectsTextGradientAngleOut',$('effectsTextGradientAngle').value);$('effectsTextShadowBlur').value=s.textShadowBlur||0;setOut('effectsTextShadowOut',$('effectsTextShadowBlur').value);
    }
    if(s?.type==='shape'){$('effectsSelectedShapeType').value=s.shape||'rect';$('effectsSelectedShapeSides').value=s.shapeSides||6;$('effectsSelectedShapeFillMode').value=s.fillMode||'fillStroke';$('effectsShapeGradientToggle').checked=!!s.gradient?.enabled;$('effectsShapeGradientA').value=s.gradient?.a||'#00ffff';$('effectsShapeGradientB').value=s.gradient?.b||'#ca6309';$('effectsShapeGradientAngle').value=s.gradient?.angle??45;setOut('effectsShapeGradientAngleOut',$('effectsShapeGradientAngle').value);}
    if(s?.type==='texture'){$('effectsTextureIntensity').value=Math.round((s.textureIntensity??.55)*100);$('effectsTextureScale').value=Math.round((s.textureScale??1)*100);$('effectsTextureAngle').value=s.textureAngle??18;$('effectsTextureColor').value=s.color||'#302c26';$('effectsTextureOpacity').value=Math.round((s.opacity??.28)*100);setOut('effectsTextureIntensityOut',$('effectsTextureIntensity').value);setOut('effectsTextureScaleOut',$('effectsTextureScale').value);setOut('effectsTextureAngleOut',$('effectsTextureAngle').value);}
    const f=s?.filters||{};$('effectsInvertInput').value=f.invert??0;setOut('effectsInvertOut',$('effectsInvertInput').value);$('effectsHueInput').value=f.hue??0;setOut('effectsHueOut',$('effectsHueInput').value);
  }
  function bind(){
    LF.effects.drawColorDisc($('effectsColorDisc'));
    $('effectsColorDisc')?.addEventListener('pointerdown',e=>{const c=LF.effects.pickColorDisc($('effectsColorDisc'),e);if(c)setColor(c);});
    $('effectsColorDisc')?.addEventListener('pointermove',e=>{if(!e.buttons)return;const c=LF.effects.pickColorDisc($('effectsColorDisc'),e);if(c)setColor(c);});
    $('effectsHexInput')?.addEventListener('change',()=>{let c=$('effectsHexInput').value.trim();if(!c.startsWith('#'))c=`#${c}`;if(/^#[0-9a-f]{6}$/i.test(c))setColor(c);else $('effectsHexInput').value=editor.brush.color;});
    $('effectsUseComplementBtn')?.addEventListener('click',()=>setColor(complement(editor.brush.color)));
    $('effectsBrushPreset')?.addEventListener('change',()=>useBrush(brushes.find(x=>x.id===$('effectsBrushPreset').value)));
    $('effectsPaletteSelect')?.addEventListener('change',()=>usePalette(palettes.find(x=>x.id===$('effectsPaletteSelect').value)));
    $('effectsSoftnessInput')?.addEventListener('input',()=>{editor.brush.softness=n('effectsSoftnessInput',45)/100;setOut('effectsSoftnessOut',$('effectsSoftnessInput').value);});
    $('effectsSmoothingInput')?.addEventListener('input',()=>{editor.brush.smoothing=n('effectsSmoothingInput',35)/100;setOut('effectsSmoothingOut',$('effectsSmoothingInput').value);});
    $('effectsMirrorToggle')?.addEventListener('change',()=>{editor.mirror=$('effectsMirrorToggle').checked;status(`Mirror painting ${editor.mirror?'on':'off'}.`);});
    $('effectsFillToleranceInput')?.addEventListener('input',()=>editor.fillTolerance=n('effectsFillToleranceInput',12)/100);
    $('effectsSprayDensityInput')?.addEventListener('input',()=>{editor.spray.density=n('effectsSprayDensityInput',55)/100;setOut('effectsSprayDensityOut',$('effectsSprayDensityInput').value);});
    $('effectsDripInput')?.addEventListener('input',()=>{editor.spray.drip=n('effectsDripInput',12)/100;setOut('effectsDripOut',$('effectsDripInput').value);});
    document.addEventListener('lf:colorpicked',e=>setColor(e.detail.color));

    $('effectsAddShapeBtn')?.addEventListener('click',()=>editor.addShape($('effectsShapeType').value,{shapeSides:n('effectsShapeSides',6),fillMode:$('effectsShapeFillMode').value,fill:editor.brush.color,gradient:{enabled:false,a:editor.brush.color,b:complement(editor.brush.color),angle:45}}));
    ['effectsSelectedShapeType','effectsSelectedShapeSides','effectsSelectedShapeFillMode','effectsShapeGradientToggle','effectsShapeGradientA','effectsShapeGradientB'].forEach(id=>$(id)?.addEventListener($(id)?.type==='color'?'input':'change',patchShape));
    $('effectsShapeGradientAngle')?.addEventListener('input',()=>{setOut('effectsShapeGradientAngleOut',$('effectsShapeGradientAngle').value);patchShape();});

    $('effectsTextLineHeight')?.addEventListener('change',()=>patchSelectedText({lineHeight:n('effectsTextLineHeight',1.08)}));
    $('effectsTextBend')?.addEventListener('input',()=>{setOut('effectsTextBendOut',$('effectsTextBend').value);patchSelectedText({bend:n('effectsTextBend',0)/100});});
    $('effectsUnderlineToggle')?.addEventListener('change',()=>patchSelectedText({underline:$('effectsUnderlineToggle').checked}));
    $('effectsStrikeToggle')?.addEventListener('change',()=>patchSelectedText({strike:$('effectsStrikeToggle').checked}));
    $('effectsHighlightColor')?.addEventListener('input',()=>patchSelectedText({highlight:$('effectsHighlightColor').value}));
    $('effectsHighlightOpacity')?.addEventListener('change',()=>patchSelectedText({highlightOpacity:n('effectsHighlightOpacity',0)/100,highlight:n('effectsHighlightOpacity',0)>0?$('effectsHighlightColor').value:''}));
    ['effectsTextGradientToggle','effectsTextGradientA','effectsTextGradientB'].forEach(id=>$(id)?.addEventListener($(id)?.type==='color'?'input':'change',patchTextGradient));
    $('effectsTextGradientAngle')?.addEventListener('input',()=>{setOut('effectsTextGradientAngleOut',$('effectsTextGradientAngle').value);patchTextGradient();});
    $('effectsTextShadowBlur')?.addEventListener('input',()=>{setOut('effectsTextShadowOut',$('effectsTextShadowBlur').value);patchSelectedText({textShadowBlur:n('effectsTextShadowBlur',0)});});
    $('effectsSwapGradientBtn')?.addEventListener('click',()=>{const a=$('effectsTextGradientA').value,b=$('effectsTextGradientB').value;$('effectsTextGradientA').value=b;$('effectsTextGradientB').value=a;const s=editor.selected();if(s?.gradient){s.gradient={...s.gradient,a:s.gradient.b||b,b:s.gradient.a||a};editor.changed('Gradient colors swapped');}});

    $('textureSelect')?.addEventListener('change',()=>{const p=currentTexture();if(p){$('effectsTextureIntensity').value=Math.round((p.intensity??.55)*100);$('effectsTextureScale').value=Math.round((p.scale??1)*100);setOut('effectsTextureIntensityOut',$('effectsTextureIntensity').value);setOut('effectsTextureScaleOut',$('effectsTextureScale').value);}refreshTexturePreview();});
    ['effectsTextureIntensity','effectsTextureScale','effectsTextureAngle','effectsTextureColor'].forEach(id=>$(id)?.addEventListener('input',()=>{setOut('effectsTextureIntensityOut',$('effectsTextureIntensity').value);setOut('effectsTextureScaleOut',$('effectsTextureScale').value);setOut('effectsTextureAngleOut',$('effectsTextureAngle').value);refreshTexturePreview();patchSelectedTexture();}));
    $('effectsTextureOpacity')?.addEventListener('change',patchSelectedTexture);
    $('addTextureBtn')?.addEventListener('click',()=>{const s=editor.selected(),p=currentTexture();if(s?.type==='texture'&&p){s.textureRenderer=p.renderer||s.textureRenderer;s.textureIntensity=n('effectsTextureIntensity',Math.round((p.intensity??.55)*100))/100;s.textureScale=n('effectsTextureScale',Math.round((p.scale??1)*100))/100;s.textureAngle=n('effectsTextureAngle',18);s.color=$('effectsTextureColor').value;s.opacity=n('effectsTextureOpacity',28)/100;editor.changed('Effects texture settings applied');}});
    $$('#effectsPatternButtons [data-pattern]').forEach(b=>b.addEventListener('click',()=>editor.addPattern(b.dataset.pattern,{primary:$('effectsPatternPrimary').value,secondary:$('effectsPatternSecondary').value,opacity:n('effectsTextureOpacity',28)/100,scale:n('effectsTextureScale',100)/100*18,angle:n('effectsTextureAngle',18)})));

    $('effectsInvertInput')?.addEventListener('input',()=>{const s=editor.selected();if(!s)return;s.filters={...(s.filters||{}),invert:n('effectsInvertInput',0)};setOut('effectsInvertOut',$('effectsInvertInput').value);editor.changed('Invert adjusted');});
    $('effectsHueInput')?.addEventListener('input',()=>{const s=editor.selected();if(!s)return;s.filters={...(s.filters||{}),hue:n('effectsHueInput',0)};setOut('effectsHueOut',$('effectsHueInput').value);editor.changed('Hue adjusted');});
    $$('#effectsFilterButtons [data-filter]').forEach(b=>b.addEventListener('click',()=>{const s=editor.selected();if(!s)return;s.filters=LF.effects.filterPreset(b.dataset.filter,s.filters);editor.changed(`Filter: ${b.dataset.filter}`);}));

    document.addEventListener('lf:rendered',sync);document.addEventListener('lf:tool',e=>$$('.editor-tool').forEach(b=>b.classList.toggle('active',b.dataset.editorTool===e.detail.tool)));
  }
  async function start(){if(started||!LF.studioApi?.isReady?.())return;started=true;editor=LF.studioApi._getEditor();renderer=LF.studioApi._getRenderer();await loadData();fillSelects();bind();setColor(editor.brush.color);sync();status(`Ready for book art · Effects Studio tools absorbed (${brushes.length} brushes, ${palettes.length} palettes, ${textures.length} textures).`);}
  document.addEventListener('lf:studio-ready',start,{once:true});if(LF.studioApi?.isReady?.())start();
})();
