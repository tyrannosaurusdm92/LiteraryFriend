(function(global){
'use strict';
const LF=global.LF;
if(!LF)return;
const connected=global.LFConnected;
const contract=global.LFBackendContract;
const q=(selector,root=document)=>root.querySelector(selector);
const esc=value=>LF.escapeHtml(String(value??''));

/*
  Frontend parity guard
  ---------------------
  The backend dispatcher and this frontend are deliberately connected through a
  non-rendered contract. Users never see action identifiers, deployment URLs,
  storage IDs, sheet names, or request payloads. They see the owning product
  surface: Account, Projects, Manuscript, World, Timeline, Language Lab, etc.
*/
const CAPABILITY_FAMILIES=Object.freeze({
  identity:Object.freeze(['Account creation','Password sign-in','Google sign-in','Verification','Two-factor challenge','Forgot-password recovery','Recovery-code sign-in']),
  account:Object.freeze(['Profile','Password change','Backup emails and phones','Recovery codes','Device sessions','Two-factor settings','Google account link','Personal Drive storage','Preferences','Account export','Backups','Activity']),
  projects:Object.freeze(['Project creation','Project switcher','Universe and series relationships','Archive and restore','Project dashboard snapshot']),
  manuscript:Object.freeze(['Hierarchical writing items','Move and restore writing','Story extraction','Story-state inspection','Reading position']),
  notes:Object.freeze(['Notes','Quick capture','Folders','Tags','Search','Recently deleted and restore']),
  consolidate:Object.freeze(['Attachment intake','Import registration','File indexing','Batch ingest','Duplicate comparison','Consolidation plans','Canonical merge','Mass update']),
  characters:Object.freeze(['Character search','Temporal facts','Knowledge and beliefs','Evidence mentions']),
  world:Object.freeze(['World entities','Rules','Cause and consequence']),
  outline:Object.freeze(['Plot threads','Generated outlines','Scene × thread planning']),
  timeline:Object.freeze(['World chronology','Narrative order','Reader revelation']),
  language:Object.freeze(['Language profiles','Phonology and grammar','Lexicon','Dictionary','Word generation','Dictionary export']),
  continuity:Object.freeze(['Issue persistence','Continuity scan','Author decisions','Reviewed fix application']),
  revision:Object.freeze(['Specialized editor runs','Tracked editor history']),
  assistant:Object.freeze(['AI requests','AI job history']),
  search:Object.freeze(['Global project search','Saved searches']),
  bookbuilder:Object.freeze(['Trim presets','Book projects','Editions','Chapters','Chapter formatting','Cover specifications','Interactive HTML export']),
  artstudio:Object.freeze(['Editable art projects','Art assets','AI image generation','AI-operated editable cover tools']),
  publish:Object.freeze(['Portable project export']),
  trash:Object.freeze(['Revision snapshots','Deleted-item review'])
});

function audit(){
  const result=contract?.audit?.(connected?.ACTION_SURFACES||{})||{ok:false,expected:0,mapped:0,missing:[],unexpected:[],surfaceMismatches:[]};
  return {...result,families:CAPABILITY_FAMILIES};
}

function artToolSummary(){
  const root=q('#viewRoot');
  if(!root||q('.parity-art-tools',root))return;
  const section=document.createElement('section');
  section.className='panel parity-panel parity-art-tools';
  section.innerHTML=`<div class="panel-heading"><h2>AI + editable cover tools</h2></div><p class="muted">The assistant can build with the same editable tools available by hand, then leave every result ready for manual revision.</p><div class="parity-tool-grid">${[
    'Brushes','Pencil & ink','Markers & paint','Spray & eraser','Fill & gradients','Eyedropper','Shapes','Editable text','Layers','Crop','Cut / copy / paste','Group & arrange','Align & distribute','Resize / skew / rotate / flip','Filters','Textures & patterns','Reusable stamps','Color controls'
  ].map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
  root.appendChild(section);
}

async function extras(_app,view){
  if(view==='artstudio')artToolSummary();
}

const baseHook=global.LFBackendFeatures?.afterNavigate;
if(global.LFBackendFeatures){
  global.LFBackendFeatures.afterNavigate=async function(app,view){
    if(baseHook)await baseHook(app,view);
    await extras(app,view);
  };
}

global.LFFrontendParity=Object.freeze({audit,families:CAPABILITY_FAMILIES,extras});
})(window);
