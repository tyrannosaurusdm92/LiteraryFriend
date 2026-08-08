(function(g){'use strict';
const LF=g.LiteraryFriend=g.LiteraryFriend||{};
const TEMPLATE=`<!doctype html>
<html lang="en">
<head>
  <base href="__LF_BASE__">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#184c54">
  <meta name="description" content="LiteraryFriend Art Studio — retro book-cover and book-art creation workspace.">
  <title>LiteraryFriend Art Studio</title>
  <link rel="icon" href="assets/images/art-studio-icon-192.png" type="image/png">
  <link rel="apple-touch-icon" href="assets/images/art-studio-icon-180.png">
  <link rel="stylesheet" href="css/art-studio-styles.css">
  <link rel="stylesheet" href="css/art-studio-workspace.css">
  <link rel="stylesheet" href="css/art-studio-retro.css">
</head>
<body>
<div class="app" id="app">
  <header class="topbar">
    <div class="brand" aria-label="LiteraryFriend Art Studio">
      <img src="assets/images/art-studio-icon-180.png" alt="">
      <div class="brand-copy">
        <div class="brand-lf">LiteraryFriend</div>
        <div class="brand-art">Art Studio</div>
        <div class="project-name" id="projectNameTop">Untitled Cover</div>
      </div>
    </div>
    <nav class="menu-strip" aria-label="Project actions">
      <button id="newProjectBtn" type="button">New</button>
      <button id="projectsBtn" type="button">Open</button>
      <button id="saveProjectBtn" type="button">Save</button>
      <button id="importProjectBtn" type="button">Import</button>
      <button id="exportBtn" class="accent" type="button">Export</button>
    </nav>
    <div class="top-center" id="documentReadout">6 × 9 in · 300 DPI · Front Cover</div>
    <div class="top-actions">
      <span class="marquee-badge" id="connectionBadge">BACKEND: CHECKING</span>
      <button id="undoBtn" title="Undo" type="button">↶</button>
      <button id="redoBtn" title="Redo" type="button">↷</button>
      <button id="settingsBtn" title="Backend status / connection settings" type="button">⚙</button>
    </div>
  </header>

  <main class="workspace">
    <aside class="panel-column">
      <section class="retro-window">
        <div class="window-title"><span>STUDIO TOOLBOX</span><span class="lights"><i></i><i></i><i></i></span></div>
        <div class="window-body">
          <div class="tool-tabs" role="tablist" aria-label="Toolbox sections">
            <button class="tool-tab active" data-toolpane="documentPane" type="button"><span>▣</span><span>Cover</span></button>
            <button class="tool-tab" data-toolpane="createPane" type="button"><span>✎</span><span>Create</span></button>
            <button class="tool-tab" data-toolpane="textPane" type="button"><span>T</span><span>Text</span></button>
            <button class="tool-tab" data-toolpane="effectsPane" type="button"><span>◐</span><span>Effects</span></button>
          </div>
          <hr class="hr-pixels">

          <div class="tool-pane active" id="documentPane">
            <div class="section-label">Book cover size</div>
            <div class="field"><label for="formatSelect">Common trim size</label><select id="formatSelect"></select><small id="formatUse">Choose a print trim size.</small></div>
            <div class="field-row">
              <div class="field"><label for="coverModeSelect">Layout</label><select id="coverModeSelect"><option value="front">Front only</option><option value="wrap">Full wrap</option></select></div>
              <div class="field"><label for="dpiSelect">Resolution</label><select id="dpiSelect"><option value="72">72 DPI</option><option value="150">150 DPI</option><option value="300" selected>300 DPI</option><option value="400">400 DPI</option></select></div>
            </div>
            <div class="field-row">
              <div class="field"><label for="trimWidthInput">Trim width (in)</label><input id="trimWidthInput" type="number" min="1" max="30" step="0.01"></div>
              <div class="field"><label for="trimHeightInput">Trim height (in)</label><input id="trimHeightInput" type="number" min="1" max="30" step="0.01"></div>
            </div>
            <div class="field-row">
              <div class="field"><label for="bleedInput">Bleed (in)</label><input id="bleedInput" type="number" min="0" max="1" step="0.001"></div>
              <div class="field"><label for="safeInput">Safe margin (in)</label><input id="safeInput" type="number" min="0" max="2" step="0.01"></div>
            </div>
            <div class="section-label">Spine estimate</div>
            <div class="field-row">
              <div class="field"><label for="pageCountInput">Page count</label><input id="pageCountInput" type="number" min="1" max="5000" step="1"></div>
              <div class="field"><label for="caliperInput">Paper caliper (in/page)</label><input id="caliperInput" type="number" min="0.0001" max="0.02" step="0.00001"></div>
            </div>
            <div class="field"><label><input id="customSpineToggle" type="checkbox"> Use custom spine width</label></div>
            <div class="field"><label for="spineWidthInput">Spine width (in)</label><input id="spineWidthInput" type="number" min="0" max="5" step="0.001"></div>
            <small>Spine calculation is an editable estimate. Use your printer's exact specification before final production.</small>
            <div class="section-label">Guides</div>
            <div class="field-row">
              <label><input id="guidesToggle" type="checkbox" checked> Show bleed + safe guides</label>
              <div class="field"><label for="backgroundInput">Canvas color</label><input id="backgroundInput" type="color"></div>
            </div>
            <button id="applyDocumentBtn" class="primary" type="button">Apply Cover Size</button>
          </div>

          <div class="tool-pane" id="createPane">
            <div class="section-label">Pointer tools</div>
            <div class="button-grid three">
              <button class="editor-tool active" data-editor-tool="select" type="button">↖ Select</button>
              <button class="editor-tool" data-editor-tool="brush" type="button">✎ Paint</button>
              <button class="editor-tool" data-editor-tool="eraser" type="button">⌫ Erase</button>
            </div>
            <div class="section-label">Add artwork</div>
            <div class="button-grid">
              <button id="uploadImageBtn" class="primary" type="button">＋ Upload Image</button>
              <button id="addPaintLayerBtn" type="button">＋ Paint Layer</button>
              <button id="addRectBtn" type="button">▭ Rectangle</button>
              <button id="addEllipseBtn" type="button">◯ Ellipse</button>
            </div>
            <div class="section-label">Painting</div>
            <div class="field"><label for="brushColorInput">Brush color</label><input id="brushColorInput" type="color" value="#17252a"></div>
            <div class="field"><label for="brushSizeInput">Brush size <output id="brushSizeOut">28</output> px</label><input id="brushSizeInput" type="range" min="1" max="300" value="28"></div>
            <div class="field"><label for="brushOpacityInput">Brush opacity <output id="brushOpacityOut">100</output>%</label><input id="brushOpacityInput" type="range" min="1" max="100" value="100"></div>
            <div class="section-label">Fast composition</div>
            <div class="button-grid">
              <button id="fitLayerBtn" type="button">Fit to Cover</button>
              <button id="fillLayerBtn" type="button">Fill Cover</button>
              <button id="centerLayerBtn" type="button">Center Layer</button>
              <button id="resetTransformBtn" type="button">Reset Transform</button>
            </div>
          </div>

          <div class="tool-pane" id="textPane">
            <div class="field"><label for="newTextInput">Text</label><textarea id="newTextInput" rows="4">BOOK TITLE</textarea></div>
            <div class="field-row">
              <div class="field"><label for="newTextRole">Role</label><select id="newTextRole"><option value="Title Text">Title</option><option value="Subtitle Text">Subtitle</option><option value="Author Text">Author</option><option value="Spine Text">Spine</option><option value="Text">Other</option></select></div>
              <div class="field"><label for="newTextFont">Font family</label><select id="newTextFont"><option value="Georgia">Georgia</option><option value="Garamond">Garamond</option><option value="Palatino Linotype">Palatino</option><option value="Times New Roman">Times New Roman</option><option value="Trebuchet MS">Trebuchet MS</option><option value="Arial">Arial</option><option value="Courier New">Courier New</option></select></div>
            </div>
            <div class="field-row">
              <div class="field"><label for="newTextColor">Fill</label><input id="newTextColor" type="color" value="#fff8e5"></div>
              <div class="field"><label for="newTextStroke">Outline</label><input id="newTextStroke" type="color" value="#17252a"></div>
            </div>
            <button id="addTextBtn" class="primary" type="button">＋ Add Text Layer</button>
            <div class="section-label">Selected text</div>
            <div id="selectedTextControls">
              <div class="field"><label for="textContentInput">Content</label><textarea id="textContentInput" rows="4"></textarea></div>
              <div class="field-row">
                <div class="field"><label for="fontFamilySelect">Font</label><select id="fontFamilySelect"><option value="Georgia">Georgia</option><option value="Garamond">Garamond</option><option value="Palatino Linotype">Palatino</option><option value="Times New Roman">Times New Roman</option><option value="Trebuchet MS">Trebuchet MS</option><option value="Arial">Arial</option><option value="Courier New">Courier New</option></select></div>
                <div class="field"><label for="fontSizeInput">Size (px)</label><input id="fontSizeInput" type="number" min="4" max="1000" step="1"></div>
              </div>
              <div class="field-row three">
                <label><input id="boldToggle" type="checkbox"> Bold</label>
                <label><input id="italicToggle" type="checkbox"> Italic</label>
                <div class="field"><label for="textAlignSelect">Align</label><select id="textAlignSelect"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
              </div>
              <div class="field-row">
                <div class="field"><label for="textColorInput">Text color</label><input id="textColorInput" type="color"></div>
                <div class="field"><label for="textStrokeInput">Outline</label><input id="textStrokeInput" type="color"></div>
              </div>
              <div class="field-row">
                <div class="field"><label for="strokeWidthInput">Outline px</label><input id="strokeWidthInput" type="number" min="0" max="100" step="0.5"></div>
                <div class="field"><label for="letterSpacingInput">Tracking px</label><input id="letterSpacingInput" type="number" min="-20" max="100" step="0.5"></div>
              </div>
            </div>
          </div>

          <div class="tool-pane" id="effectsPane">
            <div class="section-label">Texture layers</div>
            <div class="field"><label for="textureSelect">Texture</label><select id="textureSelect"></select></div>
            <button id="addTextureBtn" class="primary" type="button">＋ Add Texture Layer</button>
            <div class="section-label">Selected layer filters</div>
            <div class="field"><label>Brightness <output id="brightnessOut">100</output>%</label><input id="brightnessInput" type="range" min="0" max="250" value="100"></div>
            <div class="field"><label>Contrast <output id="contrastOut">100</output>%</label><input id="contrastInput" type="range" min="0" max="250" value="100"></div>
            <div class="field"><label>Saturation <output id="saturationOut">100</output>%</label><input id="saturationInput" type="range" min="0" max="300" value="100"></div>
            <div class="field"><label>Grayscale <output id="grayscaleOut">0</output>%</label><input id="grayscaleInput" type="range" min="0" max="100" value="0"></div>
            <div class="field"><label>Sepia <output id="sepiaOut">0</output>%</label><input id="sepiaInput" type="range" min="0" max="100" value="0"></div>
            <div class="field"><label>Blur <output id="blurOut">0</output> px</label><input id="blurInput" type="range" min="0" max="40" step="0.5" value="0"></div>
            <div class="section-label">Shadow</div>
            <label><input id="shadowToggle" type="checkbox"> Enable drop shadow</label>
            <div class="field-row">
              <div class="field"><label for="shadowColorInput">Color</label><input id="shadowColorInput" type="color" value="#000000"></div>
              <div class="field"><label for="shadowBlurInput">Blur</label><input id="shadowBlurInput" type="number" min="0" max="200" value="18"></div>
            </div>
            <div class="field-row">
              <div class="field"><label for="shadowXInput">X offset</label><input id="shadowXInput" type="number" min="-500" max="500" value="8"></div>
              <div class="field"><label for="shadowYInput">Y offset</label><input id="shadowYInput" type="number" min="-500" max="500" value="8"></div>
            </div>
          </div>
        </div>
      </section>
    </aside>

    <section class="canvas-shell">
      <div class="canvas-toolbar">
        <button id="zoomOutBtn" type="button">−</button><span class="zoom-readout" id="zoomReadout">100%</span><button id="zoomInBtn" type="button">＋</button>
        <button id="fitCanvasBtn" type="button">Fit</button><button id="actualSizeBtn" type="button">100%</button>
        <span class="spacer"></span>
        <span class="canvas-size-readout" id="canvasSizeReadout">1800 × 2700 px</span>
        <button id="toggleGuidesBtn" type="button">Guides</button>
        <button id="preflightBtn" type="button">Preflight</button>
      </div>
      <div class="canvas-viewport" id="canvasViewport">
        <div class="canvas-frame" id="canvasFrame">
          <canvas id="artCanvas" aria-label="Book cover artwork"></canvas>
          <canvas id="overlayCanvas" aria-label="Book cover editing surface"></canvas>
        </div>
      </div>
    </section>

    <aside class="inspector-column">
      <section class="retro-window layers-window">
        <div class="window-title"><span>LAYERS</span><span id="layerCount">0</span></div>
        <div class="window-body">
          <div class="layer-actions">
            <button id="layerUpBtn" title="Move layer up" type="button">▲</button>
            <button id="layerDownBtn" title="Move layer down" type="button">▼</button>
            <button id="duplicateLayerBtn" title="Duplicate" type="button">⧉</button>
            <button id="renameLayerBtn" title="Rename" type="button">✎</button>
            <button id="deleteLayerBtn" class="danger" title="Delete" type="button">×</button>
          </div>
          <div class="layers-list" id="layersList"></div>
        </div>
      </section>

      <section class="retro-window ai-window">
        <div class="window-title"><span>AI-READY COVER ASSISTANT</span><span id="aiStatusDot" class="connection-dot"></span></div>
        <div class="window-body">
          <div class="genre-chips" id="genreChips"></div>
          <div class="field"><label for="aiPromptInput">Describe the image you need</label><textarea class="ai-prompt" id="aiPromptInput" placeholder="Example: A storm-lit Detroit skyline in 2030, teenage heroine in silhouette, electricity curling around her hands, mythic but grounded, space for title at the top, no text..."></textarea></div>
          <div class="field-row">
            <div class="field"><label for="aiQualitySelect">Quality</label><select id="aiQualitySelect"><option value="high" selected>High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
            <div class="field"><label for="aiBackgroundSelect">Background</label><select id="aiBackgroundSelect"><option value="auto">Auto</option><option value="opaque">Opaque</option><option value="transparent">Transparent</option></select></div>
          </div>
          <div class="button-grid">
            <button id="improvePromptBtn" type="button">✦ Improve Prompt</button>
            <button id="generateArtBtn" class="accent" type="button">★ Create Concept</button>
          </div>
          <div class="ai-result" id="aiResult">Prompt refinement and concept art work locally. The supplied backend is used only for capabilities it actually provides.</div>
          <img class="ai-preview hidden" id="aiPreview" alt="Generated art preview">
          <div class="button-grid hidden" id="aiResultActions">
            <button id="insertAiImageBtn" class="primary" type="button">Insert as Layer</button>
            <button id="openAiAssetBtn" type="button">Open Asset</button>
          </div>
        </div>
      </section>

      <section class="retro-window">
        <div class="window-title"><span>OBJECT INSPECTOR</span><span id="selectedType">NONE</span></div>
        <div class="window-body">
          <div class="inspector-tabs">
            <button class="inspector-tab active" data-inspector="transformInspector" type="button">Transform</button>
            <button class="inspector-tab" data-inspector="styleInspector" type="button">Style</button>
            <button class="inspector-tab" data-inspector="bookInspector" type="button">3D Book</button>
          </div>
          <div class="inspector-pane active" id="transformInspector">
            <div class="field"><label for="layerNameInput">Layer name</label><input id="layerNameInput" type="text"></div>
            <div class="field-row"><div class="field"><label>X</label><input id="layerXInput" type="number" step="1"></div><div class="field"><label>Y</label><input id="layerYInput" type="number" step="1"></div></div>
            <div class="field-row"><div class="field"><label>Width</label><input id="layerWInput" type="number" min="1" step="1"></div><div class="field"><label>Height</label><input id="layerHInput" type="number" min="1" step="1"></div></div>
            <div class="field"><label>Rotation <output id="rotationOut">0</output>°</label><input id="rotationInput" type="range" min="-180" max="180" step="1" value="0"></div>
            <div class="field-row"><div class="field"><label>Stretch X</label><input id="scaleXInput" type="number" min="0.05" max="20" step="0.05" value="1"></div><div class="field"><label>Stretch Y</label><input id="scaleYInput" type="number" min="0.05" max="20" step="0.05" value="1"></div></div>
            <div class="field-row"><div class="field"><label>Skew X</label><input id="skewXInput" type="number" min="-80" max="80" step="1" value="0"></div><div class="field"><label>Skew Y</label><input id="skewYInput" type="number" min="-80" max="80" step="1" value="0"></div></div>
            <div class="field-row"><label><input id="flipXToggle" type="checkbox"> Flip horizontal</label><label><input id="flipYToggle" type="checkbox"> Flip vertical</label></div>
          </div>
          <div class="inspector-pane" id="styleInspector">
            <div class="field"><label>Opacity <output id="layerOpacityOut">100</output>%</label><input id="layerOpacityInput" type="range" min="0" max="100" value="100"></div>
            <div class="field"><label for="blendModeSelect">Blend mode</label><select id="blendModeSelect"><option value="source-over">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="soft-light">Soft Light</option><option value="hard-light">Hard Light</option><option value="color-dodge">Color Dodge</option><option value="color-burn">Color Burn</option><option value="difference">Difference</option><option value="lighter">Add / Glow</option></select></div>
            <div id="shapeStyleControls">
              <div class="field-row"><div class="field"><label>Shape fill</label><input id="shapeFillInput" type="color"></div><div class="field"><label>Shape stroke</label><input id="shapeStrokeInput" type="color"></div></div>
              <div class="field"><label>Stroke width</label><input id="shapeStrokeWidthInput" type="number" min="0" max="100" step="1"></div>
            </div>
          </div>
          <div class="inspector-pane" id="bookInspector">
            <div class="book-preview-wrap">
              <div class="book3d" id="book3d"><div class="front" id="book3dFront"></div><div class="spine"></div><div class="pages"></div></div>
            </div>
            <div class="field"><label>3D turn <output id="bookTurnOut">-24</output>°</label><input id="bookTurnInput" type="range" min="-75" max="75" value="-24"></div>
            <div class="field"><label>3D tilt <output id="bookTiltOut">5</output>°</label><input id="bookTiltInput" type="range" min="-45" max="45" value="5"></div>
            <div class="field"><label>Depth <output id="bookDepthOut">20</output> px</label><input id="bookDepthInput" type="range" min="5" max="80" value="20"></div>
            <small>This is a live presentation preview. It does not distort the printable cover artwork.</small>
          </div>
        </div>
      </section>
    </aside>
  </main>

  <footer class="statusbar"><span id="statusText">Ready.</span><span id="memoryReadout"></span><span id="saveState">LOCAL</span></footer>
</div>

<input id="imageFileInput" class="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
<input id="projectFileInput" class="hidden" type="file" accept="application/json,.lfart,.json">

<div class="modal-backdrop" id="projectsModal" role="dialog" aria-modal="true" aria-labelledby="projectsModalTitle">
  <div class="modal">
    <div class="window-title"><span id="projectsModalTitle">PROJECT LIBRARY</span><button class="flat" data-close-modal="projectsModal" type="button">×</button></div>
    <div class="modal-body">
      <div class="field-row"><div class="field"><label>Project name</label><input id="projectTitleInput" type="text"></div><div class="field"><label>Search saved projects</label><input id="projectSearchInput" type="search" placeholder="Search"></div></div>
      <div class="project-grid" id="projectGrid"></div>
      <div class="dialog-actions"><button id="deleteSavedProjectBtn" class="danger" type="button">Delete Selected Saved Project</button><button data-close-modal="projectsModal" type="button">Close</button></div>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="settingsModal" role="dialog" aria-modal="true" aria-labelledby="settingsModalTitle">
  <div class="modal">
    <div class="window-title"><span id="settingsModalTitle">LITERARYFRIEND BACKEND STATUS</span><button class="flat" data-close-modal="settingsModal" type="button">×</button></div>
    <div class="modal-body">
      <p>The supplied LiteraryFriend backend is preconfigured and is used only for the account, storage, project, note, search, continuity, language, export, backup, and activity capabilities it actually exposes. Cover prompt refinement and concept creation stay local.</p>
      <div class="field"><label for="backendUrlInput">Backend web app URL</label><input id="backendUrlInput" type="url"></div>
      <div class="field"><label for="backendLibraryInput">Apps Script library reference</label><input id="backendLibraryInput" type="url" readonly></div>
      <input id="repositoryInput" type="hidden"><input id="projectIdInput" type="hidden">
      <input id="projectTokenInput" type="hidden">
      <input id="backendUserInput" type="hidden">
      <div class="ai-result" id="healthResult">Backend has not been tested in this session.</div>
      <div class="dialog-actions"><button id="testBackendBtn" type="button">Test Backend</button><button id="saveBackendBtn" class="primary" type="button">Save Connection</button></div>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="exportModal" role="dialog" aria-modal="true" aria-labelledby="exportModalTitle">
  <div class="modal">
    <div class="window-title"><span id="exportModalTitle">EXPORT COVER ART</span><button class="flat" data-close-modal="exportModal" type="button">×</button></div>
    <div class="modal-body">
      <div class="field-row"><div class="field"><label>Image format</label><select id="exportFormatSelect"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div><div class="field"><label>Quality</label><input id="exportQualityInput" type="range" min="50" max="100" value="95"></div></div>
      <div class="ai-result" id="exportInfo">Printable output excludes editing guides and selection outlines.</div>
      <div class="dialog-actions"><button id="exportProjectJsonBtn" type="button">Export Editable Project</button><button id="exportImageBtn" class="accent" type="button">Export Image</button></div>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="preflightModal" role="dialog" aria-modal="true" aria-labelledby="preflightModalTitle">
  <div class="modal">
    <div class="window-title"><span id="preflightModalTitle">PRINT PREFLIGHT</span><button class="flat" data-close-modal="preflightModal" type="button">×</button></div>
    <div class="modal-body" id="preflightBody"></div>
  </div>
</div>

<script src="js/art-studio-config.js"></script>
<script src="js/art-studio-backend.js"></script>
<script src="js/art-studio-storage.js"></script>
<script src="js/art-studio-model.js"></script>
<script src="js/art-studio-render.js"></script>
<script src="js/art-studio-editor.js"></script>
<script src="js/art-studio-app.js"></script>
</body>
</html>
`;
let frame=null;
function baseHref(){try{return new URL('.',g.location.href).href;}catch{return './';}}
function buildFrame(){
  const f=document.createElement('iframe');
  f.className='art-studio-frame';
  f.title='LiteraryFriend Art Studio';
  f.setAttribute('allow','clipboard-read; clipboard-write');
  f.srcdoc=TEMPLATE.replace('__LF_BASE__',baseHref().replace(/&/g,'&amp;').replace(/"/g,'&quot;'));
  f.addEventListener('load',()=>{
    try{
      const p=LF.store&&LF.store.project?LF.store.project():null;
      f.contentWindow.postMessage({type:'literaryfriend.project-context',title:p?.title||''},'*');
    }catch{}
  });
  return f;
}
LF.artStudio={
  mount(host){if(!host)return;if(!frame)frame=buildFrame();host.appendChild(frame);frame.hidden=false;},
  park(){const dock=document.getElementById('artStudioDock');if(frame&&dock&&frame.parentNode!==dock){dock.hidden=false;dock.appendChild(frame);frame.hidden=true;}},
  refreshProjectContext(){if(!frame?.contentWindow)return;try{const p=LF.store&&LF.store.project?LF.store.project():null;frame.contentWindow.postMessage({type:'literaryfriend.project-context',title:p?.title||''},'*');}catch{}},
  get frame(){return frame;}
};
})(window);
