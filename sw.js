'use strict';
const CACHE='literaryfriend-shell-v3';
const SHELL=[
  './','./index.html','./manifest.webmanifest',
  './css/app.css','./css/login.css','./css/accessibility.css','./css/book-studio.css','./css/merged.css','./css/connected-features.css','./css/feature-hubs.css','./css/frontend-parity.css',
  './js/templates-data.js','./js/docs-content.js','./js/core.js','./js/storage.js','./js/api.js','./js/security.js','./js/login.js','./js/writer-tools.js','./js/import-consolidation.js','./js/story-engine.js','./js/editor.js','./js/assistant.js','./js/accessibility.js','./js/art-studio-embed.js','./js/book-studio.js','./js/capability-contract.js','./js/connected-features.js','./js/feature-hubs.js','./js/frontend-parity.js','./js/pwa.js','./js/app.js','./js/project-switcher.js',
  './assets/images/icon-192.png','./assets/images/icon-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('literaryfriend-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{const clone=response.clone();caches.open(CACHE).then(c=>c.put('./index.html',clone));return response;}).catch(()=>caches.match('./index.html')));return;}
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok&&['style','script','image','font'].includes(event.request.destination)){const clone=response.clone();caches.open(CACHE).then(c=>c.put(event.request,clone));}return response;})));
});
