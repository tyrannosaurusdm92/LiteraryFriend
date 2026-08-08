(function(global){
  'use strict'; const LF=global.LF;
  const enc=new TextEncoder(),dec=new TextDecoder();
  const toB64=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))); const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  async function derive(password,salt){const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:160000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
  LF.security={
    async encrypt(text,password){if(!password)throw new Error('A password is required.');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await derive(password,salt);const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(String(text||'')));return{v:1,alg:'AES-GCM',kdf:'PBKDF2-SHA256-160000',salt:toB64(salt),iv:toB64(iv),cipher:toB64(cipher)};},
    async decrypt(pack,password){if(!pack?.cipher)throw new Error('Encrypted content is missing.');const salt=fromB64(pack.salt),iv=fromB64(pack.iv),key=await derive(password,salt);try{return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,fromB64(pack.cipher)));}catch(_){throw new Error('Could not unlock this note. Check the password.');}},
    supported:!!global.crypto?.subtle
  };
})(window);
