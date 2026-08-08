(function(g){
'use strict';
const LF=g.LF;
const TEMPLATE=`<!doctype html><html lang="en"><head><base href="__LF_BASE__"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Updock&display=swap" rel="stylesheet"><link rel="stylesheet" href="css/art-studio-shell.css"><link rel="stylesheet" href="css/art-studio.css"><link rel="stylesheet" href="css/art-studio-effects-colors.css"><link rel="stylesheet" href="css/art-studio-effects-textures.css"><link rel="stylesheet" href="css/art-studio-effects-enhancements.css"><link rel="stylesheet" href="css/art-studio-retro.css"></head><body><section aria-label="Cover and Art workspace" class="studio-view art-studio-scope active" id="artStudioView">
<div class="app" id="app">
<header class="topbar">
<div aria-label="LiteraryFriend Art Studio" class="brand">
<img alt="" src="assets/images/icon-180.png"/>
<div class="brand-copy">
<div class="brand-lf">LiteraryFriend</div>
<div class="brand-art">Cover &amp; Art Studio</div>
<div class="project-name" id="projectNameTop">Untitled Cover</div>
</div>
</div>
<nav aria-label="Project actions" class="menu-strip">
<button id="newProjectBtn" type="button">New</button>
<button id="projectsBtn" type="button">Open</button>
<button id="saveProjectBtn" type="button">Save</button>
<button id="importProjectBtn" type="button">Import</button>
<button class="accent" id="exportBtn" type="button">Export</button>
</nav>
<div class="top-center" id="documentReadout">6 × 9 in · 300 DPI · Front Cover</div>
<div class="top-actions">
<span class="marquee-badge" id="connectionBadge">AI: CHECKING</span>
<button id="undoBtn" title="Undo" type="button">↶</button>
<button id="redoBtn" title="Redo" type="button">↷</button>
<button id="settingsBtn" title="LiteraryFriend connection" type="button">⚙</button>
</div>
</header>
<main class="workspace">
<aside class="panel-column">
<section class="retro-window">
<div class="window-title"><span>STUDIO TOOLBOX</span><span class="lights"><i></i><i></i><i></i></span></div>
<div class="window-body">
<div aria-label="Toolbox sections" class="tool-tabs" role="tablist">
<button class="tool-tab active" data-toolpane="documentPane" type="button"><span>▣</span><span>Cover</span></button>
<button class="tool-tab" data-toolpane="createPane" type="button"><span>✎</span><span>Create</span></button>
<button class="tool-tab" data-toolpane="textPane" type="button"><span>T</span><span>Text</span></button>
<button class="tool-tab" data-toolpane="effectsPane" type="button"><span>◐</span><span>Effects</span></button>
</div>
<hr class="hr-pixels"/>
<div class="tool-pane active" id="documentPane">
<div class="section-label">Book cover size</div>
<div class="field"><label for="formatSelect">Common trim size</label><select id="formatSelect"></select><small id="formatUse">Choose a print trim size.</small></div>
<div class="field-row">
<div class="field"><label for="coverModeSelect">Layout</label><select id="coverModeSelect"><option value="front">Front only</option><option value="wrap">Full wrap</option></select></div>
<div class="field"><label for="dpiSelect">Resolution</label><select id="dpiSelect"><option value="72">72 DPI</option><option value="150">150 DPI</option><option selected="" value="300">300 DPI</option><option value="400">400 DPI</option></select></div>
</div>
<div class="field-row">
<div class="field"><label for="trimWidthInput">Trim width (in)</label><input id="trimWidthInput" max="30" min="1" step="0.01" type="number"/></div>
<div class="field"><label for="trimHeightInput">Trim height (in)</label><input id="trimHeightInput" max="30" min="1" step="0.01" type="number"/></div>
</div>
<div class="field-row">
<div class="field"><label for="bleedInput">Bleed (in)</label><input id="bleedInput" max="1" min="0" step="0.001" type="number"/></div>
<div class="field"><label for="safeInput">Safe margin (in)</label><input id="safeInput" max="2" min="0" step="0.01" type="number"/></div>
</div>
<div class="section-label">Spine estimate</div>
<div class="field-row">
<div class="field"><label for="pageCountInput">Page count</label><input id="pageCountInput" max="5000" min="1" step="1" type="number"/></div>
<div class="field"><label for="caliperInput">Paper caliper (in/page)</label><input id="caliperInput" max="0.02" min="0.0001" step="0.00001" type="number"/></div>
</div>
<div class="field"><label><input id="customSpineToggle" type="checkbox"/> Use custom spine width</label></div>
<div class="field"><label for="spineWidthInput">Spine width (in)</label><input id="spineWidthInput" max="5" min="0" step="0.001" type="number"/></div>
<small>Spine calculation is an editable estimate. Use your printer's exact specification before final production.</small>
<div class="section-label">Guides</div>
<div class="field-row">
<label><input checked="" id="guidesToggle" type="checkbox"/> Show bleed + safe guides</label>
<div class="field"><label for="backgroundInput">Canvas color</label><input id="backgroundInput" type="color"/></div>
</div>
<button class="primary" id="applyDocumentBtn" type="button">Apply Cover Size</button>
</div>
<div class="tool-pane" id="createPane">
<div class="section-label">Pointer tools</div>
<div class="effects-tool-grid">
<button class="editor-tool active" data-editor-tool="select" type="button">↖ Select</button>
<button class="editor-tool" data-editor-tool="paint" type="button">▰ Paint</button>
<button class="editor-tool" data-editor-tool="pencil" type="button">✎ Pencil</button>
<button class="editor-tool" data-editor-tool="ink" type="button">⌁ Ink</button>
<button class="editor-tool" data-editor-tool="marker" type="button">▮ Marker</button>
<button class="editor-tool" data-editor-tool="crayon" type="button">▱ Crayon</button>
<button class="editor-tool" data-editor-tool="charcoal" type="button">▰ Charcoal</button>
<button class="editor-tool" data-editor-tool="calligraphy" type="button">𝒞 Calligraphy</button>
<button class="editor-tool" data-editor-tool="neon" type="button">✦ Neon</button>
<button class="editor-tool" data-editor-tool="spray" type="button">☁ Spray</button>
<button class="editor-tool" data-editor-tool="graffiti" type="button">G Graffiti</button>
<button class="editor-tool" data-editor-tool="pixel" type="button">▪ Pixel</button>
<button class="editor-tool" data-editor-tool="fill" type="button">◈ Fill</button>
<button class="editor-tool" data-editor-tool="eyedropper" type="button">⌁ Pick</button>
<button class="editor-tool" data-editor-tool="eraser" type="button">⌫ Erase</button>
</div>
<div class="section-label">Add artwork</div>
<div class="button-grid">
<button class="primary" id="uploadImageBtn" type="button">＋ Upload Image</button>
<button id="addPaintLayerBtn" type="button">＋ Paint Layer</button>
<button id="addRectBtn" type="button">▭ Rectangle</button>
<button id="addEllipseBtn" type="button">◯ Ellipse</button>
</div>
<div class="field"><label for="effectsShapeType">Expanded shape</label><select id="effectsShapeType"><option value="roundrect">Rounded rectangle</option><option value="triangle">Triangle</option><option value="diamond">Diamond</option><option value="star">Star</option><option value="polygon">Polygon</option><option value="cloud">Cloud / thought bubble</option><option value="burst">Shout burst</option><option value="moon">Moon</option><option value="plant">Plant</option><option value="cube">Isometric box</option><option value="heart">Heart</option><option value="arrow">Arrow</option><option value="speech">Speech bubble</option><option value="line">Line</option></select></div>
<div class="field-row"><div class="field"><label for="effectsShapeSides">Sides / points</label><input id="effectsShapeSides" max="18" min="3" type="number" value="6"/></div><div class="field"><label for="effectsShapeFillMode">Fill mode</label><select id="effectsShapeFillMode"><option value="fillStroke">Fill + border</option><option value="fill">Fill only</option><option value="stroke">Border only</option></select></div></div>
<button id="effectsAddShapeBtn" type="button">＋ Add Expanded Shape</button>
<div class="section-label">Painting + brush programs</div>
<div class="field"><label for="effectsBrushPreset">Brush program</label><select id="effectsBrushPreset"></select></div>
<div class="effects-program-info" id="effectsBrushInfo">Effects Studio procedural brush programs load here.</div>
<div class="field"><label for="brushColorInput">Brush color</label><input id="brushColorInput" type="color" value="#17252a"/></div>
<div class="field"><label for="effectsHexInput">Hex color</label><input id="effectsHexInput" maxlength="7" value="#17252A"/></div>
<div class="field"><label for="brushSizeInput">Brush size <output id="brushSizeOut">28</output> px</label><input id="brushSizeInput" max="300" min="1" type="range" value="28"/></div>
<div class="field"><label for="brushOpacityInput">Brush opacity <output id="brushOpacityOut">100</output>%</label><input id="brushOpacityInput" max="100" min="1" type="range" value="100"/></div>
<div class="field"><label>Softness <output id="effectsSoftnessOut">45</output>%</label><input id="effectsSoftnessInput" max="100" min="0" type="range" value="45"/></div>
<div class="field"><label>Smoothing <output id="effectsSmoothingOut">35</output>%</label><input id="effectsSmoothingInput" max="100" min="0" type="range" value="35"/></div>
<div class="effects-inline-checks"><label><input id="effectsMirrorToggle" type="checkbox"/> Mirror paint</label><label>Fill tolerance <input id="effectsFillToleranceInput" max="100" min="0" type="range" value="12"/></label></div>
<div class="field"><label>Spray density <output id="effectsSprayDensityOut">55</output>%</label><input id="effectsSprayDensityInput" max="100" min="5" type="range" value="55"/></div>
<div class="field"><label>Graffiti drip <output id="effectsDripOut">12</output>%</label><input id="effectsDripInput" max="100" min="0" type="range" value="12"/></div>
<div class="section-label">Color wheel + palettes</div>
<div class="field"><label for="effectsPaletteSelect">Palette</label><select id="effectsPaletteSelect"></select></div>
<div aria-label="Effects Studio color palette" class="program-swatches" id="effectsPaletteSwatches"></div>
<div class="color-disc-wrap"><canvas aria-label="Color wheel" height="220" id="effectsColorDisc" width="220"></canvas><div class="effects-color-fields"><small>Pick directly from the color disc or one of the imported Effects Studio palettes.</small><button id="effectsUseComplementBtn" type="button">Use Complement</button><button id="effectsSwapGradientBtn" type="button">Swap Gradient Colors</button></div></div>
<div class="section-label">Fast composition</div>
<div class="button-grid">
<button id="fitLayerBtn" type="button">Fit to Cover</button>
<button id="fillLayerBtn" type="button">Fill Cover</button>
<button id="centerLayerBtn" type="button">Center Layer</button>
<button id="resetTransformBtn" type="button">Reset Transform</button>
</div>
<div class="section-label">Align + arrange</div>
<div class="effect-button-grid">
<button id="alignLeftBtn" type="button">Left</button><button id="alignCenterBtn" type="button">Center</button><button id="alignRightBtn" type="button">Right</button>
<button id="alignTopBtn" type="button">Top</button><button id="alignMiddleBtn" type="button">Middle</button><button id="alignBottomBtn" type="button">Bottom</button>
</div>
<div class="button-grid"><button id="groupLayerBtn" type="button">Group with Below</button><button id="ungroupLayerBtn" type="button">Ungroup</button><button id="distributeHorizontalBtn" type="button">Distribute Across</button><button id="distributeVerticalBtn" type="button">Distribute Down</button></div>
<div class="section-label">Cut + copy + paste</div>
<div class="button-grid"><button id="cutLayerBtn" type="button">Cut</button><button id="copyLayerBtn" type="button">Copy</button><button id="pasteLayerBtn" type="button">Paste</button><button id="duplicateArrangeBtn" type="button">Duplicate</button></div>
<div class="section-label">Image crop</div>
<div id="cropControls">
<div class="field-row"><div class="field"><label>Left %</label><input id="cropLeftInput" min="0" max="99" step="1" type="number" value="0"></div><div class="field"><label>Top %</label><input id="cropTopInput" min="0" max="99" step="1" type="number" value="0"></div></div>
<div class="field-row"><div class="field"><label>Right %</label><input id="cropRightInput" min="0" max="99" step="1" type="number" value="0"></div><div class="field"><label>Bottom %</label><input id="cropBottomInput" min="0" max="99" step="1" type="number" value="0"></div></div>
<div class="button-grid"><button id="applyCropBtn" type="button">Apply Crop</button><button id="resetCropBtn" type="button">Reset Crop</button></div>
</div>
</div>
<div class="tool-pane" id="textPane">
<div class="field"><label for="newTextInput">Text</label><textarea id="newTextInput" rows="4">BOOK TITLE</textarea></div>
<div class="field-row">
<div class="field"><label for="newTextRole">Role</label><select id="newTextRole"><option value="Title Text">Title</option><option value="Subtitle Text">Subtitle</option><option value="Author Text">Author</option><option value="Spine Text">Spine</option><option value="Text">Other</option></select></div>
<div class="field"><label for="newTextFont">Font family</label><select id="newTextFont"><option value="Georgia">Georgia</option><option value="Garamond">Garamond</option><option value="Palatino Linotype">Palatino</option><option value="Times New Roman">Times New Roman</option><option value="Trebuchet MS">Trebuchet MS</option><option value="Arial">Arial</option><option value="Courier New">Courier New</option></select></div>
</div>
<div class="field-row">
<div class="field"><label for="newTextColor">Fill</label><input id="newTextColor" type="color" value="#fff8e5"/></div>
<div class="field"><label for="newTextStroke">Outline</label><input id="newTextStroke" type="color" value="#17252a"/></div>
</div>
<button class="primary" id="addTextBtn" type="button">＋ Add Text Layer</button>
<div class="section-label">Selected text</div>
<div id="selectedTextControls">
<div class="field"><label for="textContentInput">Content</label><textarea id="textContentInput" rows="4"></textarea></div>
<div class="field-row">
<div class="field"><label for="fontFamilySelect">Font</label><select id="fontFamilySelect"><option value="Georgia">Georgia</option><option value="Garamond">Garamond</option><option value="Palatino Linotype">Palatino</option><option value="Times New Roman">Times New Roman</option><option value="Trebuchet MS">Trebuchet MS</option><option value="Arial">Arial</option><option value="Courier New">Courier New</option></select></div>
<div class="field"><label for="fontSizeInput">Size (px)</label><input id="fontSizeInput" max="1000" min="4" step="1" type="number"/></div>
</div>
<div class="field-row three">
<label><input id="boldToggle" type="checkbox"/> Bold</label>
<label><input id="italicToggle" type="checkbox"/> Italic</label>
<div class="field"><label for="textAlignSelect">Align</label><select id="textAlignSelect"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
</div>
<div class="field-row">
<div class="field"><label for="textColorInput">Text color</label><input id="textColorInput" type="color"/></div>
<div class="field"><label for="textStrokeInput">Outline</label><input id="textStrokeInput" type="color"/></div>
</div>
<div class="field-row">
<div class="field"><label for="strokeWidthInput">Outline px</label><input id="strokeWidthInput" max="100" min="0" step="0.5" type="number"/></div>
<div class="field"><label for="letterSpacingInput">Tracking px</label><input id="letterSpacingInput" max="100" min="-20" step="0.5" type="number"/></div>
</div>
<div class="field-row"><div class="field"><label>Line spacing</label><input id="effectsTextLineHeight" max="3" min="0.5" step="0.05" type="number" value="1.08"/></div><div class="field"><label>Bend <output id="effectsTextBendOut">0</output>%</label><input id="effectsTextBend" max="100" min="-100" type="range" value="0"/></div></div>
<div class="effects-inline-checks"><label><input id="effectsUnderlineToggle" type="checkbox"/> Underline</label><label><input id="effectsStrikeToggle" type="checkbox"/> Strike-through</label></div>
<div class="field-row"><div class="field"><label>Highlight</label><input id="effectsHighlightColor" type="color" value="#fff3d6"/></div><div class="field"><label>Highlight %</label><input id="effectsHighlightOpacity" max="100" min="0" type="number" value="0"/></div></div>
<div class="field"><label><input id="effectsTextGradientToggle" type="checkbox"/> Gradient text fill</label></div>
<div class="field-row"><div class="field"><label>Gradient A</label><input id="effectsTextGradientA" type="color" value="#00ffff"/></div><div class="field"><label>Gradient B</label><input id="effectsTextGradientB" type="color" value="#ca6309"/></div></div>
<div class="field"><label>Gradient angle <output id="effectsTextGradientAngleOut">45</output>°</label><input id="effectsTextGradientAngle" max="180" min="-180" type="range" value="45"/></div>
<div class="field"><label>Text shadow blur <output id="effectsTextShadowOut">0</output> px</label><input id="effectsTextShadowBlur" max="100" min="0" type="range" value="0"/></div>
</div>
</div>
<div class="tool-pane" id="effectsPane">
<div class="section-label">Texture layers</div>
<div class="field"><label for="textureSelect">Texture program</label><select id="textureSelect"></select></div>
<div class="effects-program-info" id="effectsTextureInfo">Procedural texture presets from the Effects Studio.</div>
<div class="field"><label>Texture intensity <output id="effectsTextureIntensityOut">55</output>%</label><input id="effectsTextureIntensity" max="100" min="0" type="range" value="55"/></div>
<div class="field"><label>Texture scale <output id="effectsTextureScaleOut">100</output>%</label><input id="effectsTextureScale" max="300" min="20" type="range" value="100"/></div>
<div class="field"><label>Texture angle <output id="effectsTextureAngleOut">18</output>°</label><input id="effectsTextureAngle" max="180" min="-180" type="range" value="18"/></div>
<div class="field-row"><div class="field"><label>Texture color</label><input id="effectsTextureColor" type="color" value="#302c26"/></div><div class="field"><label>Layer opacity %</label><input id="effectsTextureOpacity" max="100" min="0" type="number" value="28"/></div></div>
<div class="program-texture-preview studio-texture texture-canvas-weave" id="effectsTexturePreview"></div>
<button class="primary" id="addTextureBtn" type="button">＋ Add Texture Layer</button>
<div class="section-label">Pattern fills</div>
<div class="field-row"><div class="field"><label>Primary</label><input id="effectsPatternPrimary" type="color" value="#00ffff"/></div><div class="field"><label>Secondary</label><input id="effectsPatternSecondary" type="color" value="#ffffff"/></div></div>
<div class="effect-button-grid" id="effectsPatternButtons"><button data-pattern="checker" type="button">Checker</button><button data-pattern="stripes" type="button">Stripes</button><button data-pattern="noise" type="button">Noise</button><button data-pattern="fabric" type="button">Fabric</button><button data-pattern="metal" type="button">Metal</button><button data-pattern="stars" type="button">Stars</button></div>
<div class="section-label">Selected layer filters</div>
<div class="field"><label>Brightness <output id="brightnessOut">100</output>%</label><input id="brightnessInput" max="250" min="0" type="range" value="100"/></div>
<div class="field"><label>Contrast <output id="contrastOut">100</output>%</label><input id="contrastInput" max="250" min="0" type="range" value="100"/></div>
<div class="field"><label>Saturation <output id="saturationOut">100</output>%</label><input id="saturationInput" max="300" min="0" type="range" value="100"/></div>
<div class="field"><label>Grayscale <output id="grayscaleOut">0</output>%</label><input id="grayscaleInput" max="100" min="0" type="range" value="0"/></div>
<div class="field"><label>Sepia <output id="sepiaOut">0</output>%</label><input id="sepiaInput" max="100" min="0" type="range" value="0"/></div>
<div class="field"><label>Blur <output id="blurOut">0</output> px</label><input id="blurInput" max="40" min="0" step="0.5" type="range" value="0"/></div>
<div class="field"><label>Invert <output id="effectsInvertOut">0</output>%</label><input id="effectsInvertInput" max="100" min="0" type="range" value="0"/></div>
<div class="field"><label>Hue rotate <output id="effectsHueOut">0</output>°</label><input id="effectsHueInput" max="180" min="-180" type="range" value="0"/></div>
<div class="section-label">Quick filter presets</div>
<div class="effect-button-grid" id="effectsFilterButtons"><button data-filter="grayscale" type="button">Grayscale</button><button data-filter="invert" type="button">Invert</button><button data-filter="sepia" type="button">Sepia</button><button data-filter="brighten" type="button">Brighten</button><button data-filter="darken" type="button">Darken</button><button data-filter="contrast" type="button">Contrast</button><button data-filter="saturate" type="button">Saturate</button><button data-filter="desaturate" type="button">Desaturate</button><button data-filter="blur" type="button">Blur</button><button data-filter="reset" type="button">Reset</button></div>
<div class="section-label">Shadow</div>
<label><input id="shadowToggle" type="checkbox"/> Enable drop shadow</label>
<div class="field-row">
<div class="field"><label for="shadowColorInput">Color</label><input id="shadowColorInput" type="color" value="#000000"/></div>
<div class="field"><label for="shadowBlurInput">Blur</label><input id="shadowBlurInput" max="200" min="0" type="number" value="18"/></div>
</div>
<div class="field-row">
<div class="field"><label for="shadowXInput">X offset</label><input id="shadowXInput" max="500" min="-500" type="number" value="8"/></div>
<div class="field"><label for="shadowYInput">Y offset</label><input id="shadowYInput" max="500" min="-500" type="number" value="8"/></div>
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
<canvas aria-label="Book cover artwork" id="artCanvas"></canvas>
<canvas aria-label="Book cover editing surface" id="overlayCanvas"></canvas>
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
<button class="danger" id="deleteLayerBtn" title="Delete" type="button">×</button>
</div>
<div class="layers-list" id="layersList"></div>
</div>
</section>
<section class="retro-window ai-window">
<div class="window-title"><span>AI COVER ART + TOOL ASSISTANT</span><span class="connection-dot" id="aiStatusDot"></span></div>
<div class="window-body">
<div class="genre-chips" id="genreChips"></div>
<div class="field"><label for="aiPromptInput">Describe the image you need</label><textarea class="ai-prompt" id="aiPromptInput" placeholder="Example: A storm-lit Detroit skyline in 2030, teenage heroine in silhouette, electricity curling around her hands, mythic but grounded, space for title at the top, no text..."></textarea></div>
<div class="field-row">
<div class="field"><label for="aiQualitySelect">Quality</label><select id="aiQualitySelect"><option selected="" value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
<div class="field"><label for="aiBackgroundSelect">Background</label><select id="aiBackgroundSelect"><option value="auto">Auto</option><option value="opaque">Opaque</option><option value="transparent">Transparent</option></select></div>
</div>
<div class="button-grid">
<button id="improvePromptBtn" type="button">✦ Improve Prompt</button>
<button class="accent" id="generateArtBtn" type="button">★ Generate Art</button>
</div>
<div class="ai-result" id="aiResult">AI art uses your shared LiteraryFriend sign-in. Save the editable cover to your project, then generate or refine artwork through the same account.</div><div class="section-label">AI tool composition</div><div class="button-grid"><button id="aiComposeToolsBtn" class="primary" type="button">✦ Build with Studio Tools</button><button id="aiDecorateToolsBtn" type="button">Add Tool Pass</button></div><div class="ai-result" id="aiToolsResult">AI can use the full editable cover toolbox: brushes, pencil, ink, marker, paint media, fill, gradients, eyedropper, shapes, text styling, layers, crop, cut/copy/paste, grouping, alignment, transforms, filters, textures, patterns, and color controls.</div>
<img alt="Generated art preview" class="ai-preview hidden" id="aiPreview"/>
<div class="button-grid hidden" id="aiResultActions">
<button class="primary" id="insertAiImageBtn" type="button">Insert as Layer</button>
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
<div class="field"><label for="layerNameInput">Layer name</label><input id="layerNameInput" type="text"/></div>
<div class="field-row"><div class="field"><label>X</label><input id="layerXInput" step="1" type="number"/></div><div class="field"><label>Y</label><input id="layerYInput" step="1" type="number"/></div></div>
<div class="field-row"><div class="field"><label>Width</label><input id="layerWInput" min="1" step="1" type="number"/></div><div class="field"><label>Height</label><input id="layerHInput" min="1" step="1" type="number"/></div></div>
<div class="field"><label>Rotation <output id="rotationOut">0</output>°</label><input id="rotationInput" max="180" min="-180" step="1" type="range" value="0"/></div>
<div class="field-row"><div class="field"><label>Stretch X</label><input id="scaleXInput" max="20" min="0.05" step="0.05" type="number" value="1"/></div><div class="field"><label>Stretch Y</label><input id="scaleYInput" max="20" min="0.05" step="0.05" type="number" value="1"/></div></div>
<div class="field-row"><div class="field"><label>Skew X</label><input id="skewXInput" max="80" min="-80" step="1" type="number" value="0"/></div><div class="field"><label>Skew Y</label><input id="skewYInput" max="80" min="-80" step="1" type="number" value="0"/></div></div>
<div class="field-row"><label><input id="flipXToggle" type="checkbox"/> Flip horizontal</label><label><input id="flipYToggle" type="checkbox"/> Flip vertical</label></div>
</div>
<div class="inspector-pane" id="styleInspector">
<div class="field"><label>Opacity <output id="layerOpacityOut">100</output>%</label><input id="layerOpacityInput" max="100" min="0" type="range" value="100"/></div>
<div class="field"><label for="blendModeSelect">Blend mode</label><select id="blendModeSelect"><option value="source-over">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="soft-light">Soft Light</option><option value="hard-light">Hard Light</option><option value="color-dodge">Color Dodge</option><option value="color-burn">Color Burn</option><option value="difference">Difference</option><option value="lighter">Add / Glow</option></select></div>
<div id="shapeStyleControls">
<div class="field-row"><div class="field"><label>Shape fill</label><input id="shapeFillInput" type="color"/></div><div class="field"><label>Shape stroke</label><input id="shapeStrokeInput" type="color"/></div></div>
<div class="field"><label>Stroke width</label><input id="shapeStrokeWidthInput" max="100" min="0" step="1" type="number"/></div>
<div class="field-row"><div class="field"><label>Shape type</label><select id="effectsSelectedShapeType"><option value="rect">Rectangle</option><option value="roundrect">Rounded rectangle</option><option value="ellipse">Ellipse</option><option value="line">Line</option><option value="triangle">Triangle</option><option value="diamond">Diamond</option><option value="star">Star</option><option value="polygon">Polygon</option><option value="cloud">Cloud</option><option value="burst">Burst</option><option value="moon">Moon</option><option value="plant">Plant</option><option value="cube">Isometric box</option><option value="heart">Heart</option><option value="arrow">Arrow</option><option value="speech">Speech bubble</option></select></div><div class="field"><label>Sides / points</label><input id="effectsSelectedShapeSides" max="18" min="3" type="number" value="6"/></div></div>
<div class="field"><label>Fill mode</label><select id="effectsSelectedShapeFillMode"><option value="fillStroke">Fill + border</option><option value="fill">Fill only</option><option value="stroke">Border only</option></select></div>
<label><input id="effectsShapeGradientToggle" type="checkbox"/> Gradient shape fill</label>
<div class="field-row"><div class="field"><label>Gradient A</label><input id="effectsShapeGradientA" type="color" value="#00ffff"/></div><div class="field"><label>Gradient B</label><input id="effectsShapeGradientB" type="color" value="#ca6309"/></div></div>
<div class="field"><label>Gradient angle <output id="effectsShapeGradientAngleOut">45</output>°</label><input id="effectsShapeGradientAngle" max="180" min="-180" type="range" value="45"/></div>
</div>
</div>
<div class="inspector-pane" id="bookInspector">
<div class="book-preview-wrap">
<div class="book3d" id="book3d"><div class="front" id="book3dFront"></div><div class="spine"></div><div class="pages"></div></div>
</div>
<div class="field"><label>3D turn <output id="bookTurnOut">-24</output>°</label><input id="bookTurnInput" max="75" min="-75" type="range" value="-24"/></div>
<div class="field"><label>3D tilt <output id="bookTiltOut">5</output>°</label><input id="bookTiltInput" max="45" min="-45" type="range" value="5"/></div>
<div class="field"><label>Depth <output id="bookDepthOut">20</output> px</label><input id="bookDepthInput" max="80" min="5" type="range" value="20"/></div>
<small>This is a live presentation preview. It does not distort the printable cover artwork.</small>
</div>
</div>
</section>
</aside>
</main>
<footer class="statusbar"><span id="statusText">Ready.</span><span id="memoryReadout"></span><span id="saveState">LOCAL</span></footer>
</div>
<input accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" id="imageFileInput" type="file"/>
<input accept="application/json,.lfart,.json" class="hidden" id="projectFileInput" type="file"/>
<div aria-labelledby="projectsModalTitle" aria-modal="true" class="modal-backdrop" id="projectsModal" role="dialog">
<div class="modal">
<div class="window-title"><span id="projectsModalTitle">PROJECT LIBRARY</span><button class="flat" data-close-modal="projectsModal" type="button">×</button></div>
<div class="modal-body">
<div class="field-row"><div class="field"><label>Project name</label><input id="projectTitleInput" type="text"/></div><div class="field"><label>Search saved projects</label><input id="projectSearchInput" placeholder="Search" type="search"/></div></div>
<div class="section-label">Browser cover projects</div>
<div class="project-grid" id="projectGrid"></div>
<div class="project-cloud-head"><div><div class="section-label">LiteraryFriend cloud covers</div><small id="cloudProjectStatus">Shared account covers appear here after sign-in.</small></div><button id="refreshCloudProjectsBtn" type="button">↻ Refresh Cloud</button></div>
<div class="project-grid" id="cloudProjectGrid"></div>
<div class="dialog-actions"><button class="danger" id="deleteSavedProjectBtn" type="button">Delete Selected Browser Project</button><button data-close-modal="projectsModal" type="button">Close</button></div>
</div>
</div>
</div>
<div aria-labelledby="settingsModalTitle" aria-modal="true" class="modal-backdrop" id="settingsModal" role="dialog">
<div class="modal compact-modal">
<div class="window-title"><span id="settingsModalTitle">LITERARYFRIEND CONNECTION</span><button class="flat" data-close-modal="settingsModal" type="button">×</button></div>
<div class="modal-body">
<p>This studio shares the LiteraryFriend sign-in from Book Builder or the larger LiteraryFriend application. Connection details stay private to LiteraryFriend.</p>
<div class="ai-result" id="healthResult">Connection has not been checked in this session.</div>
<div class="dialog-actions"><button id="testBackendBtn" type="button">Check LiteraryFriend</button><button class="primary" data-close-modal="settingsModal" type="button">Done</button></div>
</div>
</div>
</div>
<div aria-labelledby="exportModalTitle" aria-modal="true" class="modal-backdrop" id="exportModal" role="dialog">
<div class="modal">
<div class="window-title"><span id="exportModalTitle">EXPORT COVER ART</span><button class="flat" data-close-modal="exportModal" type="button">×</button></div>
<div class="modal-body">
<div class="field-row"><div class="field"><label>Image format</label><select id="exportFormatSelect"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div><div class="field"><label>Quality</label><input id="exportQualityInput" max="100" min="50" type="range" value="95"/></div></div>
<div class="ai-result" id="exportInfo">Printable output excludes editing guides and selection outlines.</div>
<div class="dialog-actions"><button id="exportProjectJsonBtn" type="button">Export Editable Project</button><button class="primary" id="sendCoverFromExportBtn" type="button">Use in Book</button><button class="accent" id="exportImageBtn" type="button">Export Image</button></div>
</div>
</div>
</div>
<div aria-labelledby="preflightModalTitle" aria-modal="true" class="modal-backdrop" id="preflightModal" role="dialog">
<div class="modal">
<div class="window-title"><span id="preflightModalTitle">PRINT PREFLIGHT</span><button class="flat" data-close-modal="preflightModal" type="button">×</button></div>
<div class="modal-body" id="preflightBody"></div>
</div>
</div>
</section><script>
window.__LF_CLOUD_CONTEXT__={};window.__LF_BOOK_SPEC__={};
window.LFBookStudio={
 getCloudContext:function(){return window.__LF_CLOUD_CONTEXT__||{};},
 setCloudContext:function(p){window.__LF_CLOUD_CONTEXT__=Object.assign({},window.__LF_CLOUD_CONTEXT__||{},p||{});},
 getBookSpec:function(){return window.__LF_BOOK_SPEC__||{};}
};
addEventListener('message',function(e){var d=e.data||{};if(d.type==='literaryfriend.project-context'){window.__LF_CLOUD_CONTEXT__=Object.assign({},window.__LF_CLOUD_CONTEXT__||{},d.cloud||{});if(d.title)window.__LF_BOOK_SPEC__.title=d.title;}if(d.type==='literaryfriend.book-spec'){window.__LF_BOOK_SPEC__=Object.assign({},window.__LF_BOOK_SPEC__||{},d.spec||{});}});
</script><script src="js/art-studio-config.js"></script><script src="js/art-studio-backend.js"></script><script src="js/art-studio-storage.js"></script><script src="js/art-studio-model.js"></script><script src="js/art-studio-effects-engine.js"></script><script src="js/art-studio-render.js"></script><script src="js/art-studio-editor.js"></script><script src="js/art-studio-app.js"></script><script src="js/art-studio-effects-ui.js"></script><script src="js/art-studio-merged-tools.js"></script><script src="js/art-ai-director.js"></script></body></html>`;
let frame=null;
function baseHref(){try{return new URL('.',g.location.href).href;}catch{return './';}}
async function projectContext(){
  let title='';let cloud={};
  try{
    const id=LF?.state?.activeProjectId||'';
    if(id&&LF?.store){const p=await LF.store.get('project',id);title=p?.title||'';if(p?.backendId)cloud.projectId=p.backendId;}
  }catch{}
  return {title,cloud};
}
async function sendContext(){if(!frame?.contentWindow)return;const c=await projectContext();frame.contentWindow.postMessage({type:'literaryfriend.project-context',...c},'*');}
function buildFrame(){
 const f=document.createElement('iframe');f.className='art-studio-frame';f.title='LiteraryFriend Cover & Art Studio';f.setAttribute('allow','clipboard-read; clipboard-write');f.srcdoc=TEMPLATE.replace('__LF_BASE__',baseHref().replace(/&/g,'&amp;').replace(/"/g,'&quot;'));f.addEventListener('load',()=>sendContext());return f;
}
LF.artStudio={
 mount(host){if(!host)return;if(!frame)frame=buildFrame();host.appendChild(frame);frame.hidden=false;sendContext();},
 park(){const dock=document.getElementById('artStudioDock');if(frame&&dock&&frame.parentNode!==dock){dock.hidden=false;dock.appendChild(frame);frame.hidden=true;}},
 refreshProjectContext:sendContext,
 sendBookSpec(spec){if(frame?.contentWindow)frame.contentWindow.postMessage({type:'literaryfriend.book-spec',spec:spec||{}},'*');},
 get frame(){return frame;}
};
})(window);
