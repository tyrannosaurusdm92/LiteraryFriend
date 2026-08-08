(function(global){
  'use strict';
  const LF=global.LF;
  if(!LF)return;
  const esc=LF.escapeHtml;
  const textExt=new Set(['txt','md','markdown','html','htm','rtf','csv','tsv','xml','yaml','yml']);
  const researchExt=new Set(['pdf','epub','mobi','azw','azw3','jpg','jpeg','png','gif','webp','svg','bmp','tif','tiff','mp3','wav','m4a','ogg','flac','mp4','mov','webm']);
  const extOf=name=>String(name||'').toLowerCase().split('.').pop();
  const baseName=name=>String(name||'Untitled').replace(/\.[^.]+$/,'');
  const normalizeVersionName=name=>baseName(name).toLowerCase()
    .replace(/\b(final|finalized|revised|revision|rev|draft|copy|edited|updated|latest|new|old)\b/g,' ')
    .replace(/\b(v(?:ersion)?\s*\d+(?:\.\d+)*)\b/g,' ')
    .replace(/\b\d{4}[-_.]\d{1,2}[-_.]\d{1,2}\b/g,' ')
    .replace(/\(\d+\)|\[\d+\]/g,' ').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim()||baseName(name).toLowerCase();

  async function inflateRaw(bytes){
    if(typeof DecompressionStream!=='function')throw new Error('This browser cannot decompress DOCX files locally. The DOCX will still be preserved as an attachment.');
    const ds=new DecompressionStream('deflate-raw');
    const stream=new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  function u16(v,o){return v.getUint16(o,true);}function u32(v,o){return v.getUint32(o,true);}
  async function zipEntry(buffer,target){
    const v=new DataView(buffer);let eocd=-1;for(let i=v.byteLength-22;i>=Math.max(0,v.byteLength-66000);i--){if(u32(v,i)===0x06054b50){eocd=i;break;}}
    if(eocd<0)throw new Error('DOCX container could not be read.');
    const count=u16(v,eocd+10),cdOffset=u32(v,eocd+16);let p=cdOffset;const dec=new TextDecoder();
    for(let n=0;n<count&&p+46<=v.byteLength;n++){
      if(u32(v,p)!==0x02014b50)break;
      const method=u16(v,p+10),compSize=u32(v,p+20),nameLen=u16(v,p+28),extraLen=u16(v,p+30),commentLen=u16(v,p+32),localOffset=u32(v,p+42);
      const name=dec.decode(new Uint8Array(buffer,p+46,nameLen));
      if(name===target){
        if(u32(v,localOffset)!==0x04034b50)throw new Error('DOCX entry is damaged.');
        const ln=u16(v,localOffset+26),le=u16(v,localOffset+28),start=localOffset+30+ln+le;
        const bytes=new Uint8Array(buffer,start,compSize);
        if(method===0)return bytes;
        if(method===8)return inflateRaw(bytes);
        throw new Error('DOCX compression method is unsupported by this browser.');
      }
      p+=46+nameLen+extraLen+commentLen;
    }
    throw new Error('word/document.xml was not found in the DOCX file.');
  }
  function docxXmlToHtml(xml){
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.querySelector('parsererror'))throw new Error('DOCX document XML could not be parsed.');
    const paras=[...doc.getElementsByTagNameNS('*','p')];
    const out=[];
    for(const p of paras){
      const style=[...p.getElementsByTagNameNS('*','pStyle')][0]?.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','val')||[...p.getElementsByTagNameNS('*','pStyle')][0]?.getAttribute('w:val')||'';
      const pieces=[];
      const walker=doc.createTreeWalker(p,NodeFilter.SHOW_ELEMENT);
      let node=walker.currentNode;
      while(node){
        const local=node.localName;
        if(local==='t')pieces.push(node.textContent||'');
        else if(local==='tab')pieces.push('\t');
        else if(local==='br'||local==='cr')pieces.push('\n');
        node=walker.nextNode();
      }
      const text=pieces.join('').replace(/\u00a0/g,' ').trim();if(!text)continue;
      const safe=esc(text).replace(/\n/g,'<br>');
      const m=String(style).match(/Heading\s*([1-6])/i);out.push(m?`<h${m[1]}>${safe}</h${m[1]}>`:`<p>${safe}</p>`);
    }
    return out.join('')||'<p></p>';
  }
  function textToHtml(text,ext){
    const s=String(text||'');
    if(ext==='md'||ext==='markdown')return LF.writer.markdownToHtml(s);
    if(ext==='html'||ext==='htm'){const doc=new DOMParser().parseFromString(s,'text/html');doc.querySelectorAll('script,iframe,object,embed,link[rel="import"]').forEach(x=>x.remove());return doc.body.innerHTML;}
    if(ext==='rtf'){const plain=s.replace(/\\par[d]?/g,'\n').replace(/\\'[0-9a-fA-F]{2}/g,'').replace(/\\[a-z]+-?\d* ?/g,'').replace(/[{}]/g,'').trim();return `<p>${esc(plain).replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>')}</p>`;}
    return `<p>${esc(s).replace(/\r\n/g,'\n').replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>')}</p>`;
  }
  async function parseFile(file){
    const ext=extOf(file.name),title=baseName(file.name),common={file,name:file.name,title,ext,mimeType:file.type||'',size:file.size||0,lastModified:file.lastModified||0};
    if(ext==='docx'){
      try{const bytes=await zipEntry(await file.arrayBuffer(),'word/document.xml');const xml=new TextDecoder('utf-8').decode(bytes);return {...common,kind:'document',docType:'import',html:docxXmlToHtml(xml),text:LF.stripHtml(docxXmlToHtml(xml)),parsed:true};}
      catch(error){return {...common,kind:'research',sourceType:'document',notes:`DOCX preserved as an attachment. ${error.message}`,parsed:false,error};}
    }
    if(ext==='json'){
      const text=await file.text();let data;try{data=JSON.parse(text);}catch(_){return {...common,kind:'document',docType:'import',html:textToHtml(text,'txt'),text,parsed:false};}
      if(data?.format&&String(data.format).startsWith('literaryfriend-export'))return {...common,kind:'literaryfriend-export',data,parsed:true};
      if(data?.schema&&/literaryfriend\.interactive-book/i.test(String(data.schema)))return {...common,kind:'book-project',data,parsed:true};
      return {...common,kind:'research',sourceType:'structured data',notes:JSON.stringify(data,null,2),data,parsed:true};
    }
    if(textExt.has(ext)){const text=await file.text();return {...common,kind:'document',docType:ext==='md'||ext==='markdown'?'manuscript':'import',html:textToHtml(text,ext),text,parsed:true};}
    if(researchExt.has(ext))return {...common,kind:'research',sourceType:ext==='pdf'?'PDF':(/^image\//.test(file.type)?'image':(/^audio\//.test(file.type)?'audio':(/^video\//.test(file.type)?'video':'reference file'))),notes:'Imported reference file',parsed:false};
    return {...common,kind:'research',sourceType:'reference file',notes:'Imported file',parsed:false};
  }
  async function storeAttachment(file,{projectId='',ownerId='',ownerType='research'}={}){
    const blob=await LF.store.putBlob({ownerId,projectId,name:file.name,mimeType:file.type||'application/octet-stream',blob:file,metadata:{imported:true}});
    return LF.store.put({type:'attachment',id:blob.id,blobId:blob.id,ownerId,ownerType,projectId,name:blob.name,mimeType:blob.mimeType,size:blob.size,tags:['imported']});
  }
  async function importParsed(parsed,{projectId='',open=false}={}){
    if(parsed.kind==='literaryfriend-export'){if(projectId)return mergeProjectPackage(parsed.data,projectId);const count=await LF.store.importAll(parsed.data,{merge:true});return {kind:'package',count,mode:'full-import'};}
    if(parsed.kind==='book-project'){
      const rec=await LF.store.put({type:'document',projectId,docType:'book-project',title:parsed.title,content:`<h1>${esc(parsed.data.title||parsed.title)}</h1><p>Interactive Book Builder project imported from JSON.</p>`,metadata:{bookProject:parsed.data},tags:['imported','book-builder']});
      await storeAttachment(parsed.file,{projectId,ownerId:rec.id,ownerType:'document'});return {kind:'document',record:rec};
    }
    if(parsed.kind==='document'){
      const rec=await LF.store.put({type:'document',projectId,docType:parsed.docType||'import',title:parsed.title,content:parsed.html||'',tags:['imported',parsed.ext],metadata:{sourceFile:parsed.name,sourceModified:parsed.lastModified}});
      if(parsed.ext==='docx')await storeAttachment(parsed.file,{projectId,ownerId:rec.id,ownerType:'document'});
      return {kind:'document',record:rec};
    }
    const rec=await LF.store.put({type:'research',projectId,title:parsed.title,sourceType:parsed.sourceType||'reference file',notes:parsed.notes||'',tags:['imported',parsed.ext],metadata:{sourceFile:parsed.name,sourceModified:parsed.lastModified}});
    await storeAttachment(parsed.file,{projectId,ownerId:rec.id,ownerType:'research'});return {kind:'research',record:rec};
  }
  async function importFiles(files,{projectId=''}={}){const results=[];for(const file of [...files]){const parsed=await parseFile(file);results.push({parsed,result:await importParsed(parsed,{projectId})});}return results;}

  function paragraphs(html){const box=document.createElement('div');box.innerHTML=html||'';return [...box.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote')].map(x=>({html:x.outerHTML,text:(x.textContent||'').trim()})).filter(x=>x.text);}
  function wordsSet(text){return new Set(String(text||'').toLowerCase().match(/[a-z0-9’'-]{3,}/g)||[]);}
  function similarity(a,b){const A=wordsSet(a),B=wordsSet(b);if(!A.size||!B.size)return 0;let same=0;A.forEach(x=>{if(B.has(x))same++;});return same/(A.size+B.size-same);}
  function mergeDocuments(parsedList){
    const docs=parsedList.filter(x=>x.kind==='document');if(!docs.length)return {html:'',sources:[]};
    docs.sort((a,b)=>(b.text?.length||0)-(a.text?.length||0));const base=docs[0],out=paragraphs(base.html),recovered=[];
    for(const d of docs.slice(1))for(const p of paragraphs(d.html)){if(out.some(q=>similarity(p.text,q.text)>=0.86))continue;recovered.push({...p,source:d.name});out.push(p);}
    let html=out.map(x=>x.html).join('');if(recovered.length){html+=`<hr><h2>Recovered material from alternate versions</h2>`+recovered.map(x=>`<section class="merge-recovered"><small>Source: ${esc(x.source)}</small>${x.html}</section>`).join('');}
    return {html,sources:docs.map(d=>d.name),recovered:recovered.length,base:base.name};
  }
  function groups(parsed){const map=new Map();for(const p of parsed.filter(x=>x.kind==='document')){const key=normalizeVersionName(p.name);if(!map.has(key))map.set(key,[]);map.get(key).push(p);}return [...map.entries()].map(([key,items])=>({key,items,title:items[0]?.title||key}));}
  function replaceRecursive(value,replacements,key=''){
    const blocked=new Set(['id','key','backendId','projectId','type','blobId','mimeType','createdAt','updatedAt','deletedAt']);if(blocked.has(key))return value;
    if(typeof value==='string'){let out=value;for(const r of replacements){if(!r.find)continue;const re=new RegExp(r.regex?r.find.replace(/^\/(.*)\/[gimsuy]*$/,'$1'):r.find.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),r.caseSensitive?'g':'gi');try{out=out.replace(re,r.replace??'');}catch(_){}}return out;}
    if(Array.isArray(value))return value.map(v=>replaceRecursive(v,replacements,''));
    if(value&&typeof value==='object'){const out={...value};for(const k of Object.keys(out))out[k]=replaceRecursive(out[k],replacements,k);return out;}
    return value;
  }
  function recordIdentity(r){
    const clean=v=>String(v||'').toLowerCase().replace(/\s+/g,' ').trim();
    if(r.type==='document')return `document|${clean(r.docType)}|${normalizeVersionName(r.title||'')}`;
    if(r.type==='note')return `note|${clean(r.noteType)}|${normalizeVersionName(r.title||'')}`;
    if(r.type==='entity')return `entity|${clean(r.entityType)}|${clean(r.name)}`;
    if(r.type==='timeline')return `timeline|${clean(r.dateLabel)}|${clean(r.title)}`;
    if(r.type==='language')return `language|${clean(r.name)}`;
    if(r.type==='lexicon')return `lexicon|${clean(r.term)}|${clean(r.meaning)}`;
    if(r.type==='research')return `research|${clean(r.sourceType)}|${normalizeVersionName(r.title||'')}`;
    if(r.type==='plotIssue')return `plotIssue|${clean(r.issueType)}|${clean(r.title)}`;
    if(r.type==='outline')return `outline|${clean(r.act||r.section)}|${clean(r.title||r.summary)}`;
    if(r.type==='folder')return `folder|${clean(r.title||r.name)}`;
    return `${clean(r.type)}|${clean(r.title||r.name||r.term||r.id)}`;
  }
  function remapRefs(value,idMap,key=''){
    if(typeof value==='string'&&idMap.has(value)&&(/id$/i.test(key)||/ids$/i.test(key)||['ownerId','parentId'].includes(key)))return idMap.get(value);
    if(Array.isArray(value))return value.map(v=>typeof v==='string'&&idMap.has(v)?idMap.get(v):remapRefs(v,idMap,''));
    if(value&&typeof value==='object'){const out={};for(const [k,v] of Object.entries(value))out[k]=remapRefs(v,idMap,k);return out;}
    return value;
  }
  function mergeArrays(a,b){return [...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])].map(v=>typeof v==='string'?v:JSON.stringify(v)))].map(v=>{try{return /^[\[{]/.test(v)?JSON.parse(v):v;}catch{return v;}});}
  function mergeHtml(existing,incoming,sourceLabel='alternate project version'){
    if(!incoming)return existing||'';if(!existing)return incoming;
    const current=paragraphs(existing),incomingParts=paragraphs(incoming),recovered=[];
    for(const part of incomingParts){if(current.some(x=>similarity(part.text,x.text)>=.9))continue;current.push(part);recovered.push(part);}
    if(!recovered.length)return existing;
    return existing+`<section class="merge-recovered"><hr><small>Recovered from ${esc(sourceLabel)}</small>${recovered.map(x=>x.html).join('')}</section>`;
  }
  async function mergeProjectPackage(pack,targetProjectId){
    if(!pack||!Array.isArray(pack.records))throw new Error('This JSON file is not a LiteraryFriend project package.');
    const target=await LF.store.get('project',targetProjectId);if(!target)throw new Error('Choose the destination project before merging a package.');
    const sourceProjects=pack.records.filter(r=>r.type==='project'),sourceIds=[...new Set(pack.records.map(r=>r.projectId).filter(Boolean))];
    let chosenIds=[];
    const targetKey=normalizeVersionName(target.title||'');
    const matched=sourceProjects.filter(r=>normalizeVersionName(r.title||'')===targetKey);
    if(matched.length)chosenIds=matched.map(r=>r.id);
    else if(sourceProjects.length===1)chosenIds=[sourceProjects[0].id];
    else if(sourceProjects.length===0&&sourceIds.length===1)chosenIds=[sourceIds[0]];
    else throw new Error('This package contains multiple projects and none matches the active project title. Import or merge a single matching project package instead.');
    const sourceRecords=pack.records.filter(r=>chosenIds.includes(r.projectId)&&!['project','attachment','snapshot'].includes(r.type)&&!r.deletedAt);
    const targetRecords=(await LF.store.all()).filter(r=>r.projectId===targetProjectId&&!r.deletedAt&&!['attachment','snapshot'].includes(r.type));
    const byIdentity=new Map(targetRecords.map(r=>[recordIdentity(r),r]));const idMap=new Map();let created=0,merged=0;
    for(const r of sourceRecords){const existing=byIdentity.get(recordIdentity(r));idMap.set(r.id,existing?.id||LF.uid(r.type||'record'));}
    for(const src of sourceRecords){const existing=byIdentity.get(recordIdentity(src));let next=remapRefs({...src},idMap);next.projectId=targetProjectId;next.backendId='';next.id=idMap.get(src.id);delete next.key;delete next.deletedAt;
      if(existing){
        const mergedRec={...existing,...next,id:existing.id,projectId:targetProjectId,backendId:existing.backendId||'',tags:mergeArrays(existing.tags,next.tags),aliases:mergeArrays(existing.aliases,next.aliases),relatedIds:mergeArrays(existing.relatedIds,next.relatedIds)};
        if(['document','note'].includes(src.type))mergedRec.content=mergeHtml(existing.content||'',next.content||'',src.title||src.name||'alternate project version');
        if(existing.attributes||next.attributes)mergedRec.attributes={...(existing.attributes||{}),...(next.attributes||{})};
        if(existing.rules||next.rules)mergedRec.rules={...(existing.rules||{}),...(next.rules||{})};
        await LF.store.put(mergedRec);merged++;
      }else{await LF.store.put(next);byIdentity.set(recordIdentity(next),next);created++;}
    }
    return {kind:'package',count:sourceRecords.length,created,merged,mode:'project-merge',sourceProjects:chosenIds.length};
  }

  async function massUpdate(projectId,replacements){
    const all=await LF.store.all();const targets=all.filter(r=>r.projectId===projectId&&!r.deletedAt&&!['attachment','snapshot'].includes(r.type));let changed=0;
    for(const r of targets){const next=replaceRecursive(r,replacements);if(JSON.stringify(next)!==JSON.stringify(r)){await LF.store.put(next);changed++;}}
    return {changed,total:targets.length};
  }

  LF.importer={extOf,parseFile,importParsed,importFiles,storeAttachment,normalizeVersionName};
  LF.consolidator={groups,mergeDocuments,mergeProjectPackage,massUpdate,similarity};
})(window);
