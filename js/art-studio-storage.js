(function (global) {
  'use strict';
  const LF=global.LFArt;

  class ProjectStorage {
    constructor(){this.db=null;}
    open(){
      if(this.db) return Promise.resolve(this.db);
      return new Promise((resolve,reject)=>{
        const req=indexedDB.open(LF.CONFIG.storageDb,LF.CONFIG.storageVersion);
        req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('projects')){const s=db.createObjectStore('projects',{keyPath:'id'});s.createIndex('updatedAt','updatedAt');}};
        req.onsuccess=()=>{this.db=req.result;resolve(this.db);}; req.onerror=()=>reject(req.error);
      });
    }
    async put(record){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(record);tx.oncomplete=()=>resolve(record);tx.onerror=()=>reject(tx.error);});}
    async get(id){const db=await this.open();return new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
    async list(){const db=await this.open();return new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))));r.onerror=()=>reject(r.error);});}
    async delete(id){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
  }

  LF.storage=new ProjectStorage();
})(window);
