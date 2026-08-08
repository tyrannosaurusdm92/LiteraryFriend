(function(global){
  'use strict'; const LF=global.LF;
  class LiteraryAssistant{
    constructor(){this.index=null;this.parts=new Map();this.loading=null;this.scriptLoads=new Map();this.extendedLoaded=false;}
    loadScript(src){
      if(this.scriptLoads.has(src))return this.scriptLoads.get(src);
      const promise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>resolve(src);s.onerror=()=>reject(new Error(`Bundled assistant pack could not load: ${src}`));document.head.appendChild(s);});
      this.scriptLoads.set(src,promise); return promise;
    }
    async loadIndex(){
      if(this.index)return this.index;
      if(global.LF_LITERARY_CORPUS_INDEX){this.index=global.LF_LITERARY_CORPUS_INDEX;return this.index;}
      if(this.loading)return this.loading;
      this.loading=this.loadScript('js/literary-corpus-index.js').then(()=>{if(!global.LF_LITERARY_CORPUS_INDEX)throw new Error('Bundled literary corpus index did not initialize.');return this.index=global.LF_LITERARY_CORPUS_INDEX;}).finally(()=>this.loading=null);
      return this.loading;
    }
    async loadPart(n){
      if(this.parts.has(n))return this.parts.get(n);
      let pack=global.LF_LITERARY_CORPUS_PARTS?.[n];
      if(!pack){await this.loadScript(`js/literary-corpus-part-${n}.js`);pack=global.LF_LITERARY_CORPUS_PARTS?.[n];}
      if(!pack)throw new Error(`Bundled literary corpus part ${n} is unavailable.`);
      const records=pack.records||pack;this.parts.set(n,records);return records;
    }
    async loadExtended(){
      if(this.extendedLoaded)return global.LITERARYFRIEND_INTELLIGENCE_CORPUS||[];
      global.LITERARYFRIEND_INTELLIGENCE_CORPUS=global.LITERARYFRIEND_INTELLIGENCE_CORPUS||[];
      global.LF_INTELLIGENCE_CORPUS=global.LF_INTELLIGENCE_CORPUS||[];
      const files=[
        'js/specialist-corpus-part-1.js','js/specialist-corpus-part-2.js','js/specialist-corpus-part-3.js','js/specialist-corpus-part-4.js',
        'js/workflow-corpus-part-1.js','js/workflow-corpus-part-2.js','js/workflow-corpus-part-3.js'
      ];
      for(const f of files)await this.loadScript(f);
      // The supplied versions used two historical global names. Merge both packs and
      // de-duplicate them at runtime while retaining genuinely distinct specialist records.
      const seen=new Set(),dedup=[];
      const combined=[...(global.LITERARYFRIEND_INTELLIGENCE_CORPUS||[]),...(global.LF_INTELLIGENCE_CORPUS||[])];
      for(const r of combined){const key=`${r.id||''}|${String(r.title||'').toLowerCase()}|${String(r.prompt||'').slice(0,160)}`;if(seen.has(key))continue;seen.add(key);dedup.push(r);}
      global.LITERARYFRIEND_INTELLIGENCE_CORPUS=dedup;this.extendedLoaded=true;return dedup;
    }
    async search(query,{limit=8,includeExtended=false}={}){
      const idx=await this.loadIndex(),tokens=LF.tokenize(query);if(!tokens.length)return[];const scores=new Map();
      for(const token of tokens){const ids=idx.tokens?.[token]||[];ids.forEach((id,i)=>scores.set(id,(scores.get(id)||0)+Math.max(1,8-Math.floor(i/80))));}
      if(!scores.size){for(const entry of idx.entries||[]){const hay=`${entry.title} ${(entry.tags||[]).join(' ')}`.toLowerCase();const s=tokens.reduce((n,t)=>n+(hay.includes(t)?2:0),0);if(s)scores.set(entry.id,s);}}
      const top=[...scores].sort((a,b)=>b[1]-a[1]).slice(0,Math.max(limit*6,30));const meta=new Map((idx.entries||[]).map(e=>[e.id,e]));const byPart=new Map();top.forEach(([id,score])=>{const m=meta.get(id);if(!m)return;if(!byPart.has(m.part))byPart.set(m.part,[]);byPart.get(m.part).push({id,score});});
      const found=[];for(const [part,wanted] of byPart){const records=await this.loadPart(part);const map=new Map(records.map(r=>[r.id,r]));wanted.forEach(w=>{const r=map.get(w.id);if(r)found.push({...r,_score:w.score,_pack:'literary'});});}
      if(includeExtended){
        const ext=await this.loadExtended();
        for(const r of ext){const title=String(r.title||'').toLowerCase(),tags=(r.tags||[]).join(' ').toLowerCase(),prompt=String(r.prompt||'').toLowerCase();let score=0;for(const t of tokens){if(title.includes(t))score+=8;if(tags.includes(t))score+=4;if(prompt.includes(t))score+=1;}if(score)found.push({...r,_score:score,_pack:'extended'});}
      }
      const unique=new Map();for(const r of found){const k=r.id||`${r.title}|${r.prompt}`;if(!unique.has(k)||unique.get(k)._score<r._score)unique.set(k,r);}
      return [...unique.values()].sort((a,b)=>b._score-a._score).slice(0,limit);
    }
    buildContext({project,record,entities=[],research=[],request=''}){const lines=[];if(project){lines.push(`PROJECT: ${project.title}`);if(project.premise)lines.push(`PREMISE: ${project.premise}`);if(project.description)lines.push(`DESCRIPTION: ${project.description}`);if(project.styleProfile)lines.push(`STYLE PROFILE: ${project.styleProfile}`);}if(record){lines.push(`CURRENT DOCUMENT: ${record.title}`);const txt=LF.stripHtml(record.content||record._unlockedContent||'').trim();if(txt)lines.push(`CURRENT TEXT:\n${txt.slice(0,12000)}`);}if(entities.length)lines.push(`PROJECT ENTITIES:\n${entities.slice(0,30).map(e=>`- ${e.name} (${e.entityType}): ${(e.description||'').slice(0,240)}`).join('\n')}`);if(research.length)lines.push(`RESEARCH NOTES:\n${research.slice(0,12).map(r=>`- ${r.title}: ${(r.notes||r.description||'').slice(0,300)}`).join('\n')}`);if(request)lines.push(`TASK:\n${request}`);return lines.join('\n\n');}
    async composePrompt(request,{record=null,includeExtended=false}={}){const project=LF.state.activeProjectId?await LF.store.get('project',LF.state.activeProjectId):null,entities=project?await LF.store.list('entity',{projectId:project.id}):[],research=project?await LF.store.list('research',{projectId:project.id}):[];const refs=await this.search(request,{limit:4,includeExtended}).catch(()=>[]);const context=this.buildContext({project,record,entities,research,request});const patterns=refs.length?`\n\nOPTIONAL SPECIALIST PATTERNS:\n${refs.map((r,i)=>`${i+1}. ${r.title}\n${r.prompt.slice(0,2200)}`).join('\n\n')}`:'';return `You are assisting a writer inside LiteraryFriend. Preserve the writer's established intent, continuity, point of view, characterization, and voice. Do not overwrite deliberate stylistic choices merely to standardize them. Identify uncertainty instead of inventing canon.\n\n${context}${patterns}`;}
    localResponse(request,record){const q=request.toLowerCase(),text=record?record._unlockedContent??record.content??'':'';const analysis=LF.writer.analyze(text);if(/readab|style|prose|revise|revision|edit/.test(q))return {title:'Local revision scan',body:`This draft has ${analysis.stats.words} words, ${analysis.stats.sentences} sentences, an average sentence length of ${analysis.stats.avgSentence} words, and a readability score of ${analysis.stats.flesch} (${LF.writer.readabilityLabel(analysis.stats.flesch)}). Dialogue accounts for about ${analysis.dialogueRatio}% of words. ${analysis.phrases.length?`Frequent softening/filler candidates include ${analysis.phrases.slice(0,6).map(x=>`${x.phrase} (${x.count})`).join(', ')}.`:'No common filler phrase stands out strongly.'} ${analysis.repeated.length?`Repeated content words include ${analysis.repeated.slice(0,6).map(x=>`${x.word} (${x.count})`).join(', ')}.`:''}`};if(/scene|chapter|next|block|stuck/.test(q))return {title:'Scene development questions',body:LF.writer.sceneQuestions(record||{}).map(x=>`• ${x}`).join('\n')};if(/continuity|plot hole|inconsisten/.test(q))return {title:'Continuity approach',body:'Use the Continuity workspace to scan manuscript markers, entity usage, proper-name variants, timeline ordering, and open plot issues. For a focused pass, name the character, location, rule, or event you want checked and LiteraryFriend will assemble the relevant project context.'};return {title:'Local writing assistant',body:'I can search the bundled literary and specialist libraries, assemble project-aware prompts, run revision statistics, build scene questions, and surface continuity context. Generative rewriting remains optional: LiteraryFriend does not falsely present a retrieval library as a language model or require a paid service to keep the core app useful.'};}
  }
  LF.assistant=new LiteraryAssistant();
})(window);
