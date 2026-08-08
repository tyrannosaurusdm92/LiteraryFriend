(function () {
  'use strict';
  const LF=window.LFArt,U=LF.util,$=(id)=>document.getElementById(id),$$=(sel,root=document)=>[...root.querySelectorAll(sel)];
  const els={};
  let renderer,editor,pageSizes=LF.FALLBACK_PAGE_SIZES,genres=LF.FALLBACK_GENRES,textures=LF.FALLBACK_TEXTURES,activeGenre='',generatedAsset=null,selectedSavedProjectId=null,syncQueued=false,previewTimer=null;

  const ids=[
    'projectNameTop','documentReadout','connectionBadge','undoBtn','redoBtn','newProjectBtn','projectsBtn','saveProjectBtn','importProjectBtn','exportBtn','settingsBtn',
    'formatSelect','formatUse','coverModeSelect','dpiSelect','trimWidthInput','trimHeightInput','bleedInput','safeInput','pageCountInput','caliperInput','customSpineToggle','spineWidthInput','guidesToggle','backgroundInput','applyDocumentBtn',
    'uploadImageBtn','addPaintLayerBtn','addRectBtn','addEllipseBtn','brushColorInput','brushSizeInput','brushSizeOut','brushOpacityInput','brushOpacityOut','fitLayerBtn','fillLayerBtn','centerLayerBtn','resetTransformBtn',
    'newTextInput','newTextRole','newTextFont','newTextColor','newTextStroke','addTextBtn','selectedTextControls','textContentInput','fontFamilySelect','fontSizeInput','boldToggle','italicToggle','textAlignSelect','textColorInput','textStrokeInput','strokeWidthInput','letterSpacingInput',
    'textureSelect','addTextureBtn','brightnessInput','brightnessOut','contrastInput','contrastOut','saturationInput','saturationOut','grayscaleInput','grayscaleOut','sepiaInput','sepiaOut','blurInput','blurOut','shadowToggle','shadowColorInput','shadowBlurInput','shadowXInput','shadowYInput',
    'canvasViewport','canvasFrame','artCanvas','overlayCanvas','zoomOutBtn','zoomReadout','zoomInBtn','fitCanvasBtn','actualSizeBtn','canvasSizeReadout','toggleGuidesBtn','preflightBtn',
    'layersList','layerCount','layerUpBtn','layerDownBtn','duplicateLayerBtn','renameLayerBtn','deleteLayerBtn',
    'aiStatusDot','genreChips','aiPromptInput','aiQualitySelect','aiBackgroundSelect','improvePromptBtn','generateArtBtn','aiResult','aiPreview','aiResultActions','insertAiImageBtn','openAiAssetBtn',
    'selectedType','layerNameInput','layerXInput','layerYInput','layerWInput','layerHInput','rotationInput','rotationOut','scaleXInput','scaleYInput','skewXInput','skewYInput','flipXToggle','flipYToggle','layerOpacityInput','layerOpacityOut','blendModeSelect','shapeStyleControls','shapeFillInput','shapeStrokeInput','shapeStrokeWidthInput',
    'book3d','book3dFront','bookTurnInput','bookTurnOut','bookTiltInput','bookTiltOut','bookDepthInput','bookDepthOut','statusText','memoryReadout','saveState',
    'imageFileInput','projectFileInput','projectsModal','projectTitleInput','projectSearchInput','projectGrid','deleteSavedProjectBtn','settingsModal','backendUrlInput','backendLibraryInput','repositoryInput','projectIdInput','projectTokenInput','backendUserInput','healthResult','testBackendBtn','saveBackendBtn',
    'exportModal','exportFormatSelect','exportQualityInput','exportInfo','exportProjectJsonBtn','exportImageBtn','preflightModal','preflightBody'
  ];
  ids.forEach(id=>els[id]=$(id));

  function status(message,type=''){els.statusText.textContent=message;els.statusText.className=type==='ok'?'status-ok':type==='warn'?'status-warn':'';}
  function openModal(id){$(id)?.classList.add('open');}
  function closeModal(id){$(id)?.classList.remove('open');}
  function slug(s){return String(s||'cover').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)||'cover';}
  function selected(){return editor.selected();}
  function valueNumber(el,fallback=0){const n=Number(el.value);return Number.isFinite(n)?n:fallback;}
  function extractText(result){return String(result?.response||result?.output_text||result?.reply||result?.message||result?.answer||result?.content||result?.data?.response||'').trim();}
  function queueSync(reason){if(reason&&reason!=='Selection changed'&&reason!=='Moving layer')els.saveState.textContent='UNSAVED';if(syncQueued)return;syncQueued=true;requestAnimationFrame(()=>{syncQueued=false;syncAll();});}

  async function loadData(){
    const [ps,gp,tp]=await Promise.all([
      U.loadJson(LF.CONFIG.pageSizesUrl,{sizes:LF.FALLBACK_PAGE_SIZES}),
      U.loadJson(LF.CONFIG.genrePresetsUrl,{presets:LF.FALLBACK_GENRES}),
      U.loadJson(LF.CONFIG.texturePresetsUrl,{presets:LF.FALLBACK_TEXTURES})
    ]);
    pageSizes=ps.sizes||LF.FALLBACK_PAGE_SIZES;genres=gp.presets||LF.FALLBACK_GENRES;textures=tp.presets||LF.FALLBACK_TEXTURES;
  }

  function populateDataUi(){
    els.formatSelect.innerHTML='';let last='';for(const s of pageSizes){if(s.binding!==last){const g=document.createElement('optgroup');g.label=s.binding;els.formatSelect.appendChild(g);last=s.binding;}const group=els.formatSelect.lastElementChild;const o=document.createElement('option');o.value=s.id;o.textContent=`${s.name} — ${s.width} × ${s.height}`;group.appendChild(o);}
    els.textureSelect.innerHTML=textures.map(t=>`<option value="${U.escapeHtml(t.id)}">${U.escapeHtml(t.name)}</option>`).join('');
    els.genreChips.innerHTML='';for(const g of genres){const b=document.createElement('button');b.type='button';b.className='genre-chip';b.dataset.genre=g.id;b.textContent=g.name;b.addEventListener('click',()=>{activeGenre=activeGenre===g.id?'':g.id;renderGenreChips();});els.genreChips.appendChild(b);}renderGenreChips();
  }
  function renderGenreChips(){$$('.genre-chip',els.genreChips).forEach(b=>b.classList.toggle('active',b.dataset.genre===activeGenre));}

  function syncAll(){
    if(!editor||!renderer)return;
    const p=editor.project,d=p.document,m=renderer.metrics,s=selected();
    els.projectNameTop.textContent=p.title;els.projectTitleInput.value=p.title;
    els.documentReadout.textContent=`${U.round(d.trimWidth,2)} × ${U.round(d.trimHeight,2)} in · ${m.requestedDpi} DPI · ${d.coverMode==='wrap'?'Full Wrap':'Front Cover'}`;
    els.canvasSizeReadout.textContent=`${m.widthPx} × ${m.heightPx} px${m.limited?` · browser-safe ${m.effectiveDpi} DPI render`:''}`;
    els.memoryReadout.textContent=`Canvas ≈ ${U.formatBytes(m.widthPx*m.heightPx*4)}`;
    els.formatSelect.value=d.formatId||'custom';const fs=pageSizes.find(x=>x.id===d.formatId);els.formatUse.textContent=fs?.use||'Custom trim size.';
    els.coverModeSelect.value=d.coverMode;els.dpiSelect.value=String(d.dpi);els.trimWidthInput.value=d.trimWidth;els.trimHeightInput.value=d.trimHeight;els.bleedInput.value=d.bleed;els.safeInput.value=d.safeMargin;els.pageCountInput.value=d.pageCount;els.caliperInput.value=d.paperCaliper;els.customSpineToggle.checked=!!d.customSpine;els.spineWidthInput.value=U.round(d.spineWidth,4);els.spineWidthInput.disabled=!d.customSpine;els.guidesToggle.checked=!!d.guides;els.backgroundInput.value=d.background||'#f6f0df';
    renderLayers();syncInspector(s);syncText(s);syncEffects(s);updateHistoryButtons();scheduleBookPreview();
  }

  function typeIcon(l){return l.type==='image'?'▧':l.type==='text'?'T':l.type==='paint'?'✎':l.type==='texture'?'▒':'◇';}
  function thumbnailFor(l){
    if(l.type==='image'&&l.src)return l.src;
    if(l.type==='paint'){const c=renderer.paintCache.get(l.id);if(c){const t=document.createElement('canvas');t.width=50;t.height=50;t.getContext('2d').drawImage(c,0,0,50,50);return t.toDataURL('image/png');}}
    const bg=l.type==='shape'?(l.fill||'#184c54'):l.type==='text'?(l.color||'#17252a'):'#d8c8a6';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="${bg}"/><text x="25" y="31" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="22" fill="#fff">${typeIcon(l)}</text></svg>`)}`;
  }
  function renderLayers(){
    const layers=editor.project.layers;els.layerCount.textContent=String(layers.length);els.layersList.innerHTML='';
    [...layers].reverse().forEach(l=>{
      const row=document.createElement('div');row.className=`layer-item${l.id===editor.project.selectedLayerId?' selected':''}`;row.dataset.id=l.id;
      const vis=document.createElement('button');vis.className='layer-visibility';vis.type='button';vis.title=l.visible?'Hide':'Show';vis.textContent=l.visible?'●':'○';vis.addEventListener('click',e=>{e.stopPropagation();editor.pushHistory();l.visible=!l.visible;editor.changed('Layer visibility');});
      const img=document.createElement('img');img.className='layer-thumb';img.alt='';img.src=thumbnailFor(l);
      const label=document.createElement('div');label.innerHTML=`<div class="layer-name">${U.escapeHtml(l.name)}</div><div class="layer-type">${U.escapeHtml(l.type)}</div>`;
      const lock=document.createElement('button');lock.className='layer-lock';lock.type='button';lock.title=l.locked?'Unlock':'Lock';lock.textContent=l.locked?'🔒':'🔓';lock.addEventListener('click',e=>{e.stopPropagation();editor.pushHistory();l.locked=!l.locked;editor.changed('Layer lock');});
      row.append(vis,img,label,lock);row.addEventListener('click',()=>editor.select(l.id));els.layersList.appendChild(row);
    });
  }
  function setDisabled(group,disabled){$$('input,select,textarea,button',group).forEach(x=>x.disabled=disabled);}
  function syncInspector(s){
    els.selectedType.textContent=s?String(s.type).toUpperCase():'NONE';const disabled=!s||s.type==='paint'||s.type==='texture';
    ['layerNameInput','layerXInput','layerYInput','layerWInput','layerHInput','rotationInput','scaleXInput','scaleYInput','skewXInput','skewYInput','flipXToggle','flipYToggle'].forEach(id=>els[id].disabled=disabled);
    ['layerOpacityInput','blendModeSelect'].forEach(id=>els[id].disabled=!s);
    if(!s){els.layerNameInput.value='';els.selectedType.textContent='NONE';return;}
    els.layerNameInput.value=s.name||'';els.layerOpacityInput.value=Math.round((s.opacity??1)*100);els.layerOpacityOut.textContent=els.layerOpacityInput.value;els.blendModeSelect.value=s.blend||'source-over';
    if(!disabled){els.layerXInput.value=U.round(s.x,1);els.layerYInput.value=U.round(s.y,1);els.layerWInput.value=U.round(s.w,1);els.layerHInput.value=U.round(s.h,1);els.rotationInput.value=s.rotation||0;els.rotationOut.textContent=s.rotation||0;els.scaleXInput.value=s.scaleX??1;els.scaleYInput.value=s.scaleY??1;els.skewXInput.value=s.skewX||0;els.skewYInput.value=s.skewY||0;els.flipXToggle.checked=!!s.flipX;els.flipYToggle.checked=!!s.flipY;}
    els.shapeStyleControls.classList.toggle('hidden',s.type!=='shape');if(s.type==='shape'){els.shapeFillInput.value=s.fill||'#184c54';els.shapeStrokeInput.value=s.stroke||'#fff8e5';els.shapeStrokeWidthInput.value=s.strokeWidth||0;}
  }
  function syncText(s){const isText=s?.type==='text';setDisabled(els.selectedTextControls,!isText);if(!isText){els.textContentInput.value='';return;}els.textContentInput.value=s.text||'';els.fontFamilySelect.value=s.fontFamily||'Georgia';els.fontSizeInput.value=s.fontSize||72;els.boldToggle.checked=!!s.bold;els.italicToggle.checked=!!s.italic;els.textAlignSelect.value=s.align||'center';els.textColorInput.value=s.color||'#17252a';els.textStrokeInput.value=s.stroke||'#fff8e5';els.strokeWidthInput.value=s.strokeWidth||0;els.letterSpacingInput.value=s.letterSpacing||0;}
  function syncEffects(s){const f=s?.filters||{};for(const [id,key,def] of [['brightnessInput','brightness',100],['contrastInput','contrast',100],['saturationInput','saturation',100],['grayscaleInput','grayscale',0],['sepiaInput','sepia',0],['blurInput','blur',0]]){els[id].disabled=!s;els[id].value=f[key]??def;els[id.replace('Input','Out')].textContent=els[id].value;}els.shadowToggle.disabled=!s;els.shadowColorInput.disabled=!s;els.shadowBlurInput.disabled=!s;els.shadowXInput.disabled=!s;els.shadowYInput.disabled=!s;if(s){const sh=s.shadow||{};els.shadowToggle.checked=!!sh.enabled;els.shadowColorInput.value=sh.color||'#000000';els.shadowBlurInput.value=sh.blur??18;els.shadowXInput.value=sh.x??8;els.shadowYInput.value=sh.y??8;}}
  function updateHistoryButtons(){els.undoBtn.disabled=!editor.history.length;els.redoBtn.disabled=!editor.future.length;}

  function bindTabs(){
    $$('.tool-tab').forEach(b=>b.addEventListener('click',()=>{$$('.tool-tab').forEach(x=>x.classList.toggle('active',x===b));$$('.tool-pane').forEach(p=>p.classList.toggle('active',p.id===b.dataset.toolpane));}));
    $$('.inspector-tab').forEach(b=>b.addEventListener('click',()=>{$$('.inspector-tab').forEach(x=>x.classList.toggle('active',x===b));$$('.inspector-pane').forEach(p=>p.classList.toggle('active',p.id===b.dataset.inspector));}));
    $$('.editor-tool').forEach(b=>b.addEventListener('click',()=>{editor.setTool(b.dataset.editorTool);$$('.editor-tool').forEach(x=>x.classList.toggle('active',x===b));status(`Tool: ${b.textContent.trim()}`);}));
  }

  function bindDocument(){
    els.formatSelect.addEventListener('change',()=>{const s=pageSizes.find(x=>x.id===els.formatSelect.value);if(!s)return;els.trimWidthInput.value=s.width;els.trimHeightInput.value=s.height;els.formatUse.textContent=s.use;});
    els.customSpineToggle.addEventListener('change',()=>{els.spineWidthInput.disabled=!els.customSpineToggle.checked;});
    els.applyDocumentBtn.addEventListener('click',()=>{
      const chosenSize=pageSizes.find(x=>x.id===els.formatSelect.value);const patch={formatId:els.formatSelect.value,binding:chosenSize?.binding||'Custom',coverMode:els.coverModeSelect.value,dpi:valueNumber(els.dpiSelect,300),trimWidth:valueNumber(els.trimWidthInput,6),trimHeight:valueNumber(els.trimHeightInput,9),bleed:valueNumber(els.bleedInput,.125),safeMargin:valueNumber(els.safeInput,.25),pageCount:valueNumber(els.pageCountInput,300),paperCaliper:valueNumber(els.caliperInput,.00225),customSpine:els.customSpineToggle.checked,spineWidth:valueNumber(els.spineWidthInput,0),guides:els.guidesToggle.checked,background:els.backgroundInput.value};
      editor.resizeDocument(patch);setTimeout(()=>renderer.fitTo(els.canvasViewport),0);status('Cover dimensions applied.','ok');
    });
    els.guidesToggle.addEventListener('change',()=>editor.setDocument({guides:els.guidesToggle.checked},false));
    els.backgroundInput.addEventListener('input',()=>editor.setDocument({background:els.backgroundInput.value},false));
    els.toggleGuidesBtn.addEventListener('click',()=>editor.setDocument({guides:!editor.project.document.guides},false));
  }

  function bindCreate(){
    els.uploadImageBtn.addEventListener('click',()=>els.imageFileInput.click());
    els.imageFileInput.addEventListener('change',async()=>{const f=els.imageFileInput.files?.[0];if(!f)return;try{status(`Importing ${f.name}…`);await editor.importFile(f);status('Artwork imported.','ok');}catch(e){status(`Import failed: ${e.message}`,'warn');}finally{els.imageFileInput.value='';}});
    els.addPaintLayerBtn.addEventListener('click',()=>editor.addPaintLayer());els.addRectBtn.addEventListener('click',()=>editor.addShape('rect'));els.addEllipseBtn.addEventListener('click',()=>editor.addShape('ellipse'));
    els.brushColorInput.addEventListener('input',()=>editor.brush.color=els.brushColorInput.value);els.brushSizeInput.addEventListener('input',()=>{editor.brush.size=valueNumber(els.brushSizeInput,28);els.brushSizeOut.textContent=els.brushSizeInput.value;});els.brushOpacityInput.addEventListener('input',()=>{editor.brush.opacity=valueNumber(els.brushOpacityInput,100)/100;els.brushOpacityOut.textContent=els.brushOpacityInput.value;});
    els.fitLayerBtn.addEventListener('click',()=>fitSelected(false));els.fillLayerBtn.addEventListener('click',()=>fitSelected(true));els.centerLayerBtn.addEventListener('click',()=>{const s=selected();if(!s||s.type==='paint'||s.type==='texture')return;editor.updateSelected({x:(renderer.metrics.widthPx-s.w)/2,y:(renderer.metrics.heightPx-s.h)/2});});
    els.resetTransformBtn.addEventListener('click',()=>{const s=selected();if(!s||s.type==='paint'||s.type==='texture')return;editor.updateSelected({rotation:0,scaleX:1,scaleY:1,skewX:0,skewY:0,flipX:false,flipY:false});});
  }
  function fitSelected(fill){
    const s=selected();if(!s||s.type==='paint'||s.type==='texture')return;const m=renderer.metrics,ratio=s.type==='image'&&s.naturalWidth&&s.naturalHeight?s.naturalWidth/s.naturalHeight:s.w/s.h;let w,h;
    if(fill){w=m.widthPx;h=w/ratio;if(h<m.heightPx){h=m.heightPx;w=h*ratio;}}else{w=m.widthPx*.92;h=w/ratio;if(h>m.heightPx*.92){h=m.heightPx*.92;w=h*ratio;}}
    editor.updateSelected({w,h,x:(m.widthPx-w)/2,y:(m.heightPx-h)/2,scaleX:1,scaleY:1});
  }

  function bindText(){
    els.addTextBtn.addEventListener('click',()=>editor.addText(els.newTextInput.value||'BOOK TITLE',{name:els.newTextRole.value,fontFamily:els.newTextFont.value,color:els.newTextColor.value,stroke:els.newTextStroke.value}));
    const simple={textContentInput:['text',v=>v],fontFamilySelect:['fontFamily',v=>v],fontSizeInput:['fontSize',Number],boldToggle:['bold',(_,e)=>e.checked],italicToggle:['italic',(_,e)=>e.checked],textAlignSelect:['align',v=>v],textColorInput:['color',v=>v],textStrokeInput:['stroke',v=>v],strokeWidthInput:['strokeWidth',Number],letterSpacingInput:['letterSpacing',Number]};
    for(const [id,[key,convert]] of Object.entries(simple)){const e=els[id];e.addEventListener(id.includes('Color')||id==='textContentInput'?'input':'change',()=>{const s=selected();if(s?.type!=='text')return;const raw=e.type==='checkbox'?e.checked:e.value;editor.updateSelected({[key]:convert(raw,e)},false);});}
  }

  function bindEffects(){
    els.addTextureBtn.addEventListener('click',()=>{const p=textures.find(t=>t.id===els.textureSelect.value)||textures[0];editor.addTexture(p);});
    const filters={brightnessInput:'brightness',contrastInput:'contrast',saturationInput:'saturation',grayscaleInput:'grayscale',sepiaInput:'sepia',blurInput:'blur'};
    for(const [id,key] of Object.entries(filters)){els[id].addEventListener('input',()=>{const s=selected();if(!s)return;const v=valueNumber(els[id]);s.filters={...(s.filters||{}),[key]:v};els[id.replace('Input','Out')].textContent=String(v);editor.changed('Filter adjusted');});}
    els.shadowToggle.addEventListener('change',()=>shadowPatch({enabled:els.shadowToggle.checked}));els.shadowColorInput.addEventListener('input',()=>shadowPatch({color:els.shadowColorInput.value}));els.shadowBlurInput.addEventListener('change',()=>shadowPatch({blur:valueNumber(els.shadowBlurInput)}));els.shadowXInput.addEventListener('change',()=>shadowPatch({x:valueNumber(els.shadowXInput)}));els.shadowYInput.addEventListener('change',()=>shadowPatch({y:valueNumber(els.shadowYInput)}));
  }
  function shadowPatch(patch){const s=selected();if(!s)return;s.shadow={...(s.shadow||{}),...patch};editor.changed('Shadow adjusted');}

  function bindCanvas(){
    const c=els.overlayCanvas;c.addEventListener('pointerdown',e=>{c.setPointerCapture?.(e.pointerId);editor.pointerDown(e);});c.addEventListener('pointermove',e=>editor.pointerMove(e));c.addEventListener('pointerup',e=>editor.pointerUp(e));c.addEventListener('pointercancel',e=>editor.pointerUp(e));
    els.zoomOutBtn.addEventListener('click',()=>renderer.setZoom(renderer.zoom*.8));els.zoomInBtn.addEventListener('click',()=>renderer.setZoom(renderer.zoom*1.25));els.fitCanvasBtn.addEventListener('click',()=>renderer.fitTo(els.canvasViewport));els.actualSizeBtn.addEventListener('click',()=>renderer.setZoom(1));
    document.addEventListener('lf:zoom',e=>els.zoomReadout.textContent=`${Math.round(e.detail.zoom*100)}%`);
    els.canvasViewport.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();renderer.setZoom(renderer.zoom*(e.deltaY<0?1.1:.9));},{passive:false});
  }

  function bindLayers(){
    els.layerUpBtn.addEventListener('click',()=>editor.moveLayer(1));els.layerDownBtn.addEventListener('click',()=>editor.moveLayer(-1));els.duplicateLayerBtn.addEventListener('click',()=>editor.duplicateSelected());els.deleteLayerBtn.addEventListener('click',()=>editor.deleteSelected());
    els.renameLayerBtn.addEventListener('click',()=>{const s=selected();if(!s)return;const name=prompt('Layer name',s.name);if(name?.trim())editor.updateSelected({name:name.trim()});});
  }

  function bindInspector(){
    const propInputs={layerNameInput:['name',v=>v],layerXInput:['x',Number],layerYInput:['y',Number],layerWInput:['w',Number],layerHInput:['h',Number],rotationInput:['rotation',Number],scaleXInput:['scaleX',Number],scaleYInput:['scaleY',Number],skewXInput:['skewX',Number],skewYInput:['skewY',Number],flipXToggle:['flipX',(_,e)=>e.checked],flipYToggle:['flipY',(_,e)=>e.checked],layerOpacityInput:['opacity',v=>Number(v)/100],blendModeSelect:['blend',v=>v],shapeFillInput:['fill',v=>v],shapeStrokeInput:['stroke',v=>v],shapeStrokeWidthInput:['strokeWidth',Number]};
    for(const [id,[key,convert]] of Object.entries(propInputs)){const e=els[id];const live=['rotationInput','layerOpacityInput','shapeFillInput','shapeStrokeInput'].includes(id)?'input':'change';e.addEventListener(live,()=>{const s=selected();if(!s)return;const raw=e.type==='checkbox'?e.checked:e.value;const val=convert(raw,e);if(['w','h','scaleX','scaleY'].includes(key)&&!(Number(val)>0))return;s[key]=val;if(id==='rotationInput')els.rotationOut.textContent=String(val);if(id==='layerOpacityInput')els.layerOpacityOut.textContent=String(Math.round(val*100));editor.changed('Layer property changed');});}
    const updateBook=()=>{const turn=valueNumber(els.bookTurnInput,-24),tilt=valueNumber(els.bookTiltInput,5),depth=valueNumber(els.bookDepthInput,20);els.bookTurnOut.textContent=turn;els.bookTiltOut.textContent=tilt;els.bookDepthOut.textContent=depth;els.book3d.style.transform=`rotateY(${turn}deg) rotateX(${tilt}deg)`;const spine=els.book3d.querySelector('.spine');spine.style.width=`${depth}px`;spine.style.transform=`rotateY(90deg) translateZ(0)`;els.book3d.querySelector('.pages').style.width=`${Math.max(5,depth-3)}px`;};
    ['bookTurnInput','bookTiltInput','bookDepthInput'].forEach(id=>els[id].addEventListener('input',updateBook));updateBook();
  }

  async function backendHealth(showResult=false){
    els.connectionBadge.textContent='BACKEND: CHECKING';els.aiStatusDot.classList.remove('ok');const h=await LF.backend.health();
    if(h?.ok){els.connectionBadge.textContent='BACKEND: ONLINE';els.aiStatusDot.classList.add('ok');if(showResult)els.healthResult.textContent=`Connected: ${h.service||'LiteraryFriend Backend'}${h.version?` v${h.version}`:''}. Existing cloud routes are reachable; cover concept tools remain local.`;}
    else{els.connectionBadge.textContent='BACKEND: OFFLINE';if(showResult)els.healthResult.textContent=`Backend test failed: ${h?.error||'Unknown error'}`;}
  }
  function aiRequestSize(){const m=renderer.metrics,ratio=m.widthPx/m.heightPx;if(ratio<.86)return'1024x1536';if(ratio>1.16)return'1536x1024';return'1024x1024';}
  function aiContext(){const d=editor.project.document;return `Current cover: ${d.trimWidth} × ${d.trimHeight} inches, ${d.coverMode==='wrap'?'full wrap':'front cover'}, ${d.binding||''}. The user will add title typography separately in the editor.`;}
  function finalAiPrompt(){const raw=els.aiPromptInput.value.trim();const g=genres.find(x=>x.id===activeGenre);return [raw,g?.prompt,`Composition should work for a ${editor.project.document.trimWidth} × ${editor.project.document.trimHeight} inch book cover. Leave deliberate negative space for editable title and author typography. Do not render readable title text, author text, logos, ISBNs, or barcodes.`].filter(Boolean).join('\n\n');}
  function locateGenerated(result){
    const asset=result?.image||result?.asset||result?.data?.[0]||{};let dataUrl=result?.dataUrl||asset?.dataUrl||'';const b64=result?.b64_json||asset?.b64_json||result?.data?.[0]?.b64_json||'';const mime=asset?.mimeType||'image/png';if(!dataUrl&&b64)dataUrl=`data:${mime};base64,${b64}`;
    const driveId=asset?.driveFileId||result?.driveFileId||'';let url=asset?.downloadUrl||asset?.webContentLink||asset?.url||asset?.driveUrl||result?.url||'';if(!url&&driveId)url=`https://drive.google.com/uc?export=view&id=${encodeURIComponent(driveId)}`;
    return {dataUrl,url,driveId,name:asset?.name||`literaryfriend-concept-${Date.now()}.svg`,raw:result};
  }
  async function sourceToDataUrl(asset){
    if(asset.dataUrl)return asset.dataUrl;if(!asset.url)throw new Error('The concept tool returned no usable image source.');
    const r=await fetch(asset.url,{credentials:'include'});if(!r.ok)throw new Error(`Concept asset could not be downloaded (${r.status}).`);const blob=await r.blob();if(!blob.type.startsWith('image/'))throw new Error('The concept asset link did not return image bytes.');return await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(blob);});
  }
  function bindAi(){
    els.improvePromptBtn.addEventListener('click',async()=>{const promptText=els.aiPromptInput.value.trim();if(!promptText){status('Enter an art description first.','warn');return;}try{els.improvePromptBtn.disabled=true;els.aiResult.textContent='Refining the cover-art prompt locally…';const r=await LF.backend.improvePrompt(promptText,aiContext());const text=extractText(r);if(!text)throw new Error('The assistant returned no prompt text.');els.aiPromptInput.value=text;els.aiResult.textContent='Prompt refined. Review it, then create a local concept or import finished artwork.';status('Cover prompt improved locally.','ok');}catch(e){els.aiResult.textContent=`Prompt assistant error: ${e.message}`;status(e.message,'warn');}finally{els.improvePromptBtn.disabled=false;backendHealth(false);}});
    els.generateArtBtn.addEventListener('click',async()=>{const promptText=finalAiPrompt();if(!els.aiPromptInput.value.trim()){status('Describe the artwork you want first.','warn');return;}try{els.generateArtBtn.disabled=true;els.improvePromptBtn.disabled=true;els.aiResult.textContent=`Creating ${aiRequestSize()} local concept artwork…`;els.aiPreview.classList.add('hidden');els.aiResultActions.classList.add('hidden');generatedAsset=null;const r=await LF.backend.generateImage(promptText,{size:aiRequestSize(),quality:els.aiQualitySelect.value,background:els.aiBackgroundSelect.value,name:`${slug(editor.project.title)}-art-${Date.now()}`});generatedAsset=locateGenerated(r);els.aiResult.textContent=generatedAsset.dataUrl?'Concept created and ready to insert.':generatedAsset.url?'Concept created.':'Concept creation completed, but no usable image source was returned.';if(generatedAsset.dataUrl||generatedAsset.url){els.aiPreview.src=generatedAsset.dataUrl||generatedAsset.url;els.aiPreview.classList.remove('hidden');els.aiResultActions.classList.remove('hidden');els.openAiAssetBtn.disabled=!generatedAsset.url;}status('Local concept artwork created.','ok');}catch(e){els.aiResult.textContent=`Concept creation error: ${e.message}`;status(e.message,'warn');}finally{els.generateArtBtn.disabled=false;els.improvePromptBtn.disabled=false;backendHealth(false);}});
    els.insertAiImageBtn.addEventListener('click',async()=>{if(!generatedAsset)return;try{status('Importing concept artwork…');const src=await sourceToDataUrl(generatedAsset);await editor.addImage(src,generatedAsset.name||'Concept Art');status('Concept artwork inserted as an editable layer.','ok');}catch(e){els.aiResult.textContent=`The concept was created, but direct insertion failed: ${e.message} You can save the concept and upload it again if the browser blocks direct insertion.`;status('Concept image needs manual import.','warn');}});
    els.openAiAssetBtn.addEventListener('click',()=>{if(generatedAsset?.url)window.open(generatedAsset.url,'_blank','noopener');});
  }

  function syncBackendForm(){const s=LF.backend.settings;els.backendUrlInput.value=s.backendUrl||LF.CONFIG.backendUrl;els.backendLibraryInput.value=s.libraryUrl||LF.CONFIG.backendLibrary;els.repositoryInput.value='';els.projectIdInput.value=LF.CONFIG.projectId;els.projectTokenInput.value='';els.backendUserInput.value='local-user';}
  function bindBackend(){
    els.settingsBtn.addEventListener('click',()=>{syncBackendForm();openModal('settingsModal');});
    els.saveBackendBtn.addEventListener('click',()=>{LF.backend.saveSettings({backendUrl:els.backendUrlInput.value.trim(),libraryUrl:els.backendLibraryInput.value.trim(),projectId:LF.CONFIG.projectId,userId:'local-user'});els.healthResult.textContent='Connection settings saved locally.';backendHealth(true);status('Backend connection settings saved.','ok');});
    els.testBackendBtn.addEventListener('click',async()=>{LF.backend.saveSettings({backendUrl:els.backendUrlInput.value.trim(),libraryUrl:els.backendLibraryInput.value.trim(),projectId:LF.CONFIG.projectId,userId:'local-user'});els.healthResult.textContent='Testing backend…';await backendHealth(true);});
  }

  async function saveProject(){
    try{editor.project.title=(els.projectTitleInput.value||editor.project.title||'Untitled Cover').trim();const project=editor.serialize(true),preview=await renderer.previewDataUrl(360,240);await LF.storage.put({id:project.id,title:project.title,updatedAt:new Date().toISOString(),preview,project});els.saveState.textContent='SAVED';status('Project saved to this browser.','ok');queueSync();}
    catch(e){status(`Save failed: ${e.message}`,'warn');}
  }
  async function renderProjectLibrary(filter=''){
    const items=await LF.storage.list(),q=filter.trim().toLowerCase();els.projectGrid.innerHTML='';for(const rec of items.filter(x=>!q||x.title.toLowerCase().includes(q))){const card=document.createElement('article');card.className='project-card';card.dataset.id=rec.id;card.innerHTML=`<img src="${rec.preview||'assets/icon-192.png'}" alt=""><h3>${U.escapeHtml(rec.title)}</h3><p>${new Date(rec.updatedAt).toLocaleString()}</p>`;card.addEventListener('click',async()=>{selectedSavedProjectId=rec.id;$$('.project-card',els.projectGrid).forEach(x=>x.style.outline=x===card?'3px solid #00aab3':'');await editor.load(rec.project);els.saveState.textContent='SAVED';closeModal('projectsModal');setTimeout(()=>renderer.fitTo(els.canvasViewport),0);status(`Opened ${rec.title}.`,'ok');});els.projectGrid.appendChild(card);}if(!els.projectGrid.children.length)els.projectGrid.innerHTML='<p class="muted">No saved projects match this search.</p>';
  }
  function bindProjects(){
    els.newProjectBtn.addEventListener('click',()=>{if(!confirm('Start a new cover project? Save the current project first if needed.'))return;editor.newProject('Untitled Cover');els.saveState.textContent='UNSAVED';setTimeout(()=>renderer.fitTo(els.canvasViewport),0);});
    els.projectsBtn.addEventListener('click',async()=>{await renderProjectLibrary();openModal('projectsModal');});els.saveProjectBtn.addEventListener('click',saveProject);els.projectTitleInput.addEventListener('change',()=>{editor.project.title=els.projectTitleInput.value.trim()||'Untitled Cover';editor.changed('Project renamed');});els.projectSearchInput.addEventListener('input',()=>renderProjectLibrary(els.projectSearchInput.value));
    els.deleteSavedProjectBtn.addEventListener('click',async()=>{if(!selectedSavedProjectId){status('Select a saved project first.','warn');return;}if(!confirm('Delete the selected saved project from this browser?'))return;await LF.storage.delete(selectedSavedProjectId);selectedSavedProjectId=null;await renderProjectLibrary(els.projectSearchInput.value);status('Saved project deleted.','ok');});
    els.importProjectBtn.addEventListener('click',()=>els.projectFileInput.click());els.projectFileInput.addEventListener('change',async()=>{const f=els.projectFileInput.files?.[0];if(!f)return;try{const text=await f.text();await editor.load(JSON.parse(text));els.saveState.textContent='UNSAVED';setTimeout(()=>renderer.fitTo(els.canvasViewport),0);status('Editable project imported.','ok');}catch(e){status(`Project import failed: ${e.message}`,'warn');}finally{els.projectFileInput.value='';}});
  }

  function bindExport(){
    els.exportBtn.addEventListener('click',()=>{const m=renderer.metrics;els.exportInfo.textContent=`Output: ${m.widthPx} × ${m.heightPx} pixels. Editing guides and selection boxes are excluded.`;openModal('exportModal');});
    els.exportProjectJsonBtn.addEventListener('click',()=>{const p=editor.serialize(true);U.download(`${slug(p.title)}.lfart`,JSON.stringify(p,null,2),'application/json');status('Editable project exported.','ok');});
    els.exportImageBtn.addEventListener('click',async()=>{try{els.exportImageBtn.disabled=true;status('Rendering final cover…');const canvas=await renderer.exportCanvas(),type=els.exportFormatSelect.value,quality=valueNumber(els.exportQualityInput,95)/100,blob=await U.canvasBlob(canvas,type,quality),ext=type==='image/jpeg'?'jpg':type==='image/webp'?'webp':'png';U.download(`${slug(editor.project.title)}.${ext}`,blob,type);status('Cover image exported.','ok');closeModal('exportModal');}catch(e){status(`Export failed: ${e.message}`,'warn');}finally{els.exportImageBtn.disabled=false;}});
  }

  function preflight(){
    const p=editor.project,d=p.document,m=renderer.metrics,notes=[];notes.push({kind:'ok',text:`Document: ${U.round(m.widthIn,3)} × ${U.round(m.heightIn,3)} in, ${m.widthPx} × ${m.heightPx} px.`});
    if(m.limited)notes.push({kind:'warn',text:`The requested ${m.requestedDpi} DPI canvas exceeded the browser safety limit and is currently rendered at about ${m.effectiveDpi} DPI. Export from a smaller trim size or lower requested DPI, or use a desktop publishing application for ultra-large production files.`});
    else if(m.effectiveDpi>=300)notes.push({kind:'ok',text:`Canvas resolution is ${m.effectiveDpi} DPI, suitable for high-resolution print workflows when source art is also sharp.`});else notes.push({kind:'warn',text:`Canvas resolution is ${m.effectiveDpi} DPI. For print, verify this is sufficient for your printer.`});
    if(d.coverMode==='wrap'){notes.push({kind:m.spine>0?'ok':'warn',text:`Full-wrap spine: ${U.round(m.spine,4)} in from ${d.customSpine?'custom input':`${d.pageCount} pages × ${d.paperCaliper} in/page`}. Verify this against the printer's template.`});}
    const images=p.layers.filter(l=>l.type==='image'&&l.visible);if(!images.length)notes.push({kind:'warn',text:'No image layers are present. This is fine for a typography-only design, but verify that it is intentional.'});
    for(const l of images){if(!l.naturalWidth||!l.naturalHeight)continue;const printW=Math.abs(l.w*(l.scaleX||1))/m.effectiveDpi,printH=Math.abs(l.h*(l.scaleY||1))/m.effectiveDpi,ppi=Math.min(l.naturalWidth/Math.max(.001,printW),l.naturalHeight/Math.max(.001,printH));notes.push({kind:ppi>=300?'ok':ppi>=150?'warn':'warn',text:`${l.name}: estimated effective source resolution ≈ ${Math.round(ppi)} PPI at its current size${ppi<150?' (likely soft for print)':''}.`});}
    const texts=p.layers.filter(l=>l.type==='text'&&l.visible);const safe=m.bleedPx+m.safePx;for(const l of texts){const right=l.x+l.w,bottom=l.y+l.h;if(l.x<safe||l.y<safe||right>m.widthPx-safe||bottom>m.heightPx-safe)notes.push({kind:'warn',text:`${l.name}: its text box reaches outside the outer safe-area guide. Check title/author placement visually.`});}
    if(!texts.length)notes.push({kind:'warn',text:'No editable text layers are present yet.'});
    els.preflightBody.innerHTML=`<p><strong>Preflight is a design check, not a printer certification.</strong> Final bleed, spine, barcode, color profile, and file-format requirements should come from the printer or publishing service.</p>${notes.map(n=>`<div class="ai-result ${n.kind==='ok'?'status-ok':'status-warn'}">${n.kind==='ok'?'✓':'⚠'} ${U.escapeHtml(n.text)}</div>`).join('')}`;openModal('preflightModal');
  }

  function scheduleBookPreview(){clearTimeout(previewTimer);previewTimer=setTimeout(updateBookPreview,350);}
  function updateBookPreview(){
    if(!renderer?.canvas?.width)return;try{const m=renderer.metrics,d=editor.project.document,src=renderer.canvas,c=document.createElement('canvas');c.width=300;c.height=450;const ctx=c.getContext('2d');let sx=0,sw=src.width;if(d.coverMode==='wrap'){sx=m.bleedPx+m.trimWidthPx+m.spinePx;sw=m.trimWidthPx;}ctx.drawImage(src,sx,0,sw,src.height,0,0,c.width,c.height);els.book3dFront.style.backgroundImage=`url(${c.toDataURL('image/jpeg',.72)})`;els.book3d.querySelector('.spine').style.backgroundColor=d.background||'#ddd';}catch{}
  }

  function bindGlobal(){
    $$('.modal-backdrop').forEach(m=>m.addEventListener('mousedown',e=>{if(e.target===m)closeModal(m.id);}));$$('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.closeModal)));
    els.preflightBtn.addEventListener('click',preflight);
    els.undoBtn.addEventListener('click',()=>editor.undo());els.redoBtn.addEventListener('click',()=>editor.redo());
    document.addEventListener('keydown',e=>{
      const tag=e.target?.tagName?.toLowerCase();const typing=['input','textarea','select'].includes(tag);
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProject();return;}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?editor.redo():editor.undo();return;}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();editor.redo();return;}
      if(typing)return;
      if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();editor.deleteSelected();return;}
      const s=selected();if(s&&s.type!=='paint'&&s.type!=='texture'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const step=e.shiftKey?10:1;if(e.key==='ArrowLeft')s.x-=step;if(e.key==='ArrowRight')s.x+=step;if(e.key==='ArrowUp')s.y-=step;if(e.key==='ArrowDown')s.y+=step;editor.changed('Layer nudged');}
    });
    window.addEventListener('resize',()=>renderer.fitTo(els.canvasViewport));document.addEventListener('lf:rendered',scheduleBookPreview);
  }

  window.addEventListener('message',e=>{
    const data=e.data||{};
    if(data.type!=='literaryfriend.project-context'||!data.title)return;
    try{
      const current=String(editor?.project?.title||'').trim();
      if(editor && (!current || /^(untitled|new cover|book cover)/i.test(current))){
        editor.project.title=`${data.title} Cover`;
        queueSync('Project context');
      }
    }catch{}
  });

  async function init(){
    status('Loading LiteraryFriend Art Studio…');await loadData();populateDataUi();renderer=new LF.Renderer(els.artCanvas,els.overlayCanvas,els.canvasFrame);editor=new LF.Editor(renderer);editor.setChangeHandler(queueSync);
    bindTabs();bindDocument();bindCreate();bindText();bindEffects();bindCanvas();bindLayers();bindInspector();bindAi();bindBackend();bindProjects();bindExport();bindGlobal();syncBackendForm();syncAll();setTimeout(()=>renderer.fitTo(els.canvasViewport),50);backendHealth(false);status('Ready for book art.','ok');
  }
  init().catch(e=>{console.error(e);status(`Studio failed to start: ${e.message}`,'warn');});
})();
