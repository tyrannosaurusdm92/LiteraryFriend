(function(global) {
  'use strict';

  let mountRoot = null;

  const API_URL = 'https://script.google.com/macros/s/AKfycbxs5m-v5PQt2LZHO9T-OEckMim_jVDtvOgGeQJzR_bQ34FhbHvMFWssi1GQnBnWosXM/exec';
  const LIBRARY_URL = 'https://script.google.com/macros/library/d/1m--huLkqouxXGKHTj2gTpV19li8tS1IO_RLEbgmy3a8wUcvljt9dlLdD/1';
  const APP_SCHEMA = 'literaryfriend.interactive-book.v1';
  const PAGE_SCHEMA = 'literaryfriend.interactive-book.page.v1';
  const DB_NAME = 'literaryfriend-book-builder-v1';
  const DB_STORE = 'projects';
  const DB_VERSION = 1;
  const LOCAL_KEY = 'current-book';
  const TOKEN_KEY = 'lf.auth.token';
  const MAX_CLOUD_NODE_TEXT = 690000;
  const TARGET_CHUNK_TEXT = 520000;

  const SIZE_PRESETS = [
    { id: 'digest', label: 'Paperback — Digest / US Trade', width: 5.5, height: 8.5, binding: 'paperback' },
    { id: 'trade', label: 'Paperback — Standard Trade', width: 6, height: 9, binding: 'paperback' },
    { id: 'small-trade', label: 'Paperback — Small Trade', width: 5, height: 8, binding: 'paperback' },
    { id: 'mass-market', label: 'Paperback — Mass Market', width: 4.25, height: 6.87, binding: 'paperback' },
    { id: 'hardcover-trade', label: 'Hardcover — US Trade', width: 6, height: 9, binding: 'hardcover' },
    { id: 'hardcover-royal', label: 'Hardcover — Royal', width: 6.14, height: 9.21, binding: 'hardcover' },
    { id: 'hardcover-compact', label: 'Hardcover — Compact / Novella', width: 5.5, height: 8.5, binding: 'hardcover' },
    { id: 'hardcover-textbook', label: 'Hardcover — Textbook / Manual', width: 7, height: 10, binding: 'hardcover' },
    { id: 'hardcover-manual-large', label: 'Hardcover — Large Manual', width: 8.5, height: 11, binding: 'hardcover' },
    { id: 'hardcover-child-portrait', label: "Hardcover — Children's Portrait", width: 8, height: 10, binding: 'hardcover' },
    { id: 'hardcover-child-landscape', label: "Hardcover — Children's Landscape", width: 10, height: 8, binding: 'hardcover' },
    { id: 'hardcover-art-square', label: 'Hardcover — Coffee Table 10 × 10', width: 10, height: 10, binding: 'hardcover' },
    { id: 'hardcover-art-large', label: 'Hardcover — Coffee Table 12 × 12', width: 12, height: 12, binding: 'hardcover' },
    { id: 'custom', label: 'Custom Size', width: 6, height: 9, binding: 'custom' }
  ];

  const FAVORITE_STARTER = {"schema":"literaryfriend.interactive-book.v1","version":1,"id":"literaryfriend-favorite-short-stories-starter","title":"Favorite Short Stories","subtitle":"A LiteraryFriend Book Builder starter","author":"Will Saville","size":{"preset":"small-trade","width":5,"height":8,"unit":"in","binding":"paperback"},"cover":{"preset":"midnight","artUrl":"","artDataUrl":"","showText":true,"title":"Favorite Short Stories","subtitle":"Freedom Changes Everything • The Farmer's Plea","author":"Will Saville","background":"#061D33","text":"#F2FFFF","fit":"cover","overlay":0},"pageDesign":{"preset":"cream","background":"#f7efd9","ink":"#2b241b","accent":"#006666","pattern":"paper","font":"serif","margin":8,"pageNumbers":true,"textureDataUrl":"","textureUrl":"assets/images/paper-cream-fiber.jpg"},"sound":{"enabled":true,"volume":0.55,"file":"assets/audio/page-flip.wav"},"pages":[{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-1","title":"Freedom Changes Everything","type":"article","html":"<div class=\"story-title-page\"><p class=\"story-kicker\">Short Story</p><h1>Freedom Changes Everything</h1><p>Written March 23rd, 2023</p></div>"},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-2","title":"Freedom Changes Everything — 1","type":"article","html":"<p>He looked out his window, his view obstructed by the metal lattice that was framed with wood nearly as pale as himself. The clouds were low today, and he sensed a fog would be rolling in. Far off in the distance, a bell tolled and his eyes widened in trepidation and fear for what was to come. While he gazed, a pigeon landed on his sill, and outstretched its leg to present a small attached scroll. He swung the section of lattice open. His chambermaid had cut off a panel and added a hidden hinge to it, and the lord was grateful that his friend was the daughter of a craftsman, and had secretly learned this knowledge for herself, as it allowed him to send and receive secret messages that his parents were not aware of. He reached through  to the bird, and grasped the scroll between his fingers before reaching his other slender hand through and untying it. Once free of its burden, the pigeon flew off, and the boy swung the lattice back into place. He opened the scroll and read its contents, then carried it to the flames in his hearth, and watched it become embers as tears of fury and agony ran down his face. He clenched his fists, and unclenched them, he repeated this for several minutes before regaining his composure.</p><p>His cousin had sent word that he would not help him, and he must escape his imprisonment on his own. It was the eve of his wedding. His gown and veil hung on the dressing screen, the lace bodice would accentuate his delicate feminine features and make his parents proud. Or at the very least, proud to finally be rid of him, he would then be the problem of his husband who would expect him to be a dutiful wife and future queen, and not the man that he knew himself to be.</p><p>His parents had tried everything to rid him of the belief that his soul did not match his body. Priests, leeches, and finally neighboring witches and vile potions that made him vomit and ill. The hags had told his parents that the vomit and fevers would rid him of the demons that possessed him into believing that god had made a mistake. After realizing they had not changed him into what they wanted him to be, they imprisoned him in his room, with only his loyal chambermaid for company, and had held a ball for his hand in marriage. Using denial of food as persuasion, he was forced to dance with eligible bachelors from all over the region, and one in particular kept requesting dances with him. The prince had come disguised as a lord of high station, and had become smitten with him and his beauty, but those feelings were not returned.</p><p>He wanted freedom, and royal life as a royal wife meant that freedom would never be a possibility. He was prepared to end his life, using a jagged piece of glass he’d hidden in his fireplace, when his chambermaid entered the room.</p><p>“My lord.” The girl said demurely. “I have solved all of our problems.”</p>","source":{"kind":"user-writing-sample","work":"Freedom Changes Everything"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-3","title":"Freedom Changes Everything — 2","type":"article","html":"<p>She eyed him carefully as he unclenched his hand and dropped the glass, which had still left deep cuts in his hand.</p><p>“How is that Harleina?” He responded, raising an eyebrow.</p><p>“My lord, I came across a witch and she offered me a potion, she showed me that it works by drinking it in front of me. She poured the contents from a larger bottle, into two smaller, and drank from one to prove its worth before handing me the second. My lord, this potion will allow you to take my appearance, and I yours, for several hours, and then it will wear off. I can take your place so you can escape.”</p><p>“What did she ask for in payment? And the prince will kill you once the magic wears off, and then he will hunt me down.”</p><p>“She asked only for a lock of my hair. As for the magic, she said it can be altered to become permanent if you wish it to be.”</p><p>“Do you wish to become Queen Harleina?” he scoffed, raising his eyebrow again. “She bowed her head in response, and color rose in her cheeks.</p><p>“My lord, the prince is very handsome, and I&#x27;m a lowly chambermaid. I know it is you that he physically desires, however he desires a meek and quiet Queen, I can be that for him so that you can find your freedom and find a way to fix nature&#x27;s mistake. Making the potion permanent means that we will never be discovered, and you will only have my appearance for a short while before you are able to become who you truly are. Traveling the road with my appearance will also be easier for you because I am nothing to look at.” She bowed her head again.</p><p>With that, he strode across the room, and lifted her chin and kissed her cheek. “My dear Harleina, you are beautiful inside and out, and I will treasure you always. If this is what you want, I will forgo ending my life in favor of your plan, and escape this life, just tell me what I must do.”</p><p>“The potion, to be temporary, needs only a hair from both of our heads. To be permanent, it requires three, and three drops of blood. As the one taking your place, I am the one who must drink. My transformation takes place first, and then yours will follow. The process is disorienting.” She grimaced, uncorked the small bottle and held it out to him.</p><p>He reached up to his scalp,  pulled a fistful of raven hair from his braid, separated out three strands, and placed them into the three strands, and placed them into the bottle, watching the contents absorb the hair as it sank. She did the same with her reddish curls. They then removed their clothing to prepare for the physical changes their bodies would undergo, and laid them across the satin and silk blankets that covered the lord&#x27;s large canopied bed.</p>","source":{"kind":"user-writing-sample","work":"Freedom Changes Everything"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-4","title":"Freedom Changes Everything — 3","type":"article","html":"<p>She reached into her apron, pulled out a pin cushion, and pricked her finger. She placed her thumb against the pad of her finger to form the drops and they sizzled when they hit the contents. The lord did the same, his eyes wide and his body trembling with anticipation and fear. Once the lord had completed dropping his blood into the bottle, she held it up, as if to say a toast. She seemed to think better of it, and decided to drink immediately. She gulped noisily from the bottle, and frowned. Her long eyelashes cascaded against her cheeks as she swayed back and forth, and then fell backwards towards the floor. The lord caught her as she began to glow and transform. Her transformation was happening quickly, her red curls that hung to her shoulders in an unruly fashion grew and straightened to become the raven hair that the lord had. Her once blue eyes turned brown, and her too-wide mouth became full and seductive. Her hands became more slender and unblemished from labor, and she shrank in height and girth.</p><p>As these changes became more prominent on the woman in his arms, the lord began to feel a rushing heat throughout his body. Because he was crouching already, the floor was at a much closer proximity, and he fell to blackness.</p><p>He awoke some time later, and ran his fingers through his hair. It was red and curly! She was sitting on his bed and looking at him, curiously. She laughed once, then again and told him “Wow, I knew I wasn&#x27;t much to look at, but seeing myself in front of me, is definitely an eye opening experience.” He laughed in response and smiled a genuine smile for the first time in what felt like years, and he was very grateful to her. They dressed themselves in their new clothing, and Harleina got under the blankets on the bed, her face content and blushing as she took in the comfort she had never known but would now experience for the rest of her life. The young lord kissed his friend on the forehead, tucked a stray raven lock behind her ear, and left the room, closing the door quietly behind him.</p><p>“What of the Princess to be? Has her disposition improved?” Came a voice behind him. He jumped slightly and turned to see a familiar guard.</p><p>“She seems to be resigned now Sir.” He responded with a curtsy. The guard raised an eyebrow but did not question him further.</p><p>“Off you go then chambermaid, you are needed in the ‘morn.” He said with a scowl.</p><p>“Yes sir, of course!” The lord said, he curtsied again and left hurriedly down the corridor and down the large staircase that led to the main entrance of the manor. He walked through the doors of his home for the last time, only giving a small glance as he headed in the direction of the town that he knew Harleina lived. He would go to her home, pack a bag with provisions, and would start his journey.</p>","source":{"kind":"user-writing-sample","work":"Freedom Changes Everything"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-5","title":"Freedom Changes Everything — 4","type":"article","html":"<p>Many months passed and the lord got word that the coronation of the prince was taking place. That the beautiful Princess that had stolen the hearts of the kingdom with her stunning beauty and equally stunning heart would finally be queen. He smiled, and kept on his journey. He still had Harleinas form, but was glad that she was happy and that their ruse had worked. He had spent these last few months tracking down legends and myths. He&#x27;d also gone to see witches and seers trying to find an answer for his predicament that would not expose Harleinas deceit. So far, any magic he would undergo to be who he was meant to be, required the lord to undo the magic that had already been done, and Harleina deserved better. He was in search of a magician known as The Raeston, who apparently practiced the most ancient of arts, but had not been seen in many years. But the young lord was not discouraged, he was still young enough to be filled with hope now that he was no longer imprisoned.</p><p>It took several years. By the time the lord had found The Raeston, he had gotten word that the kingdom he&#x27;d once called home had reached a golden age under its new rule. That peasants had easier lives, more jobs had been created, taxes were lowered on the poor and raised on the rich. His old kingdom was thriving, and he ached to return as a new man and find employment and reap the benefits of his and Harleinas deceit. The lord trudged up the worn stone steps leading to the temple hidden in the mountains, and there, he would receive his true freedom. The Raeston greeted him, and had apparently seen him coming in a vision. The Raeston was an old and weathered man. His skin was cracked, bruised, and saggy. He stooped low, and his humble wooden walking stick thudded loudly against the stone bricks.</p><p>“My young lord, so many years of hardship and determination have led you to my temple, but as you can see it is in disarray. It is in dire need of repair, and I am very old. I know you are friends with the queen, and I will give you what you desire, if you promise that you will seek the council of the crown, and have my temple restored.”</p><p>“Of course, Raeston. The young lord said, bowing low. I will do as you ask, if you can give me what I desire without destroying the magic that has created the queen, and has allowed me to flee my former life.”</p>","source":{"kind":"user-writing-sample","work":"Freedom Changes Everything"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-6","title":"Freedom Changes Everything — 5","type":"article","html":"<p>“Drink from the fountain before you.” The Raeston demanded. And the lord drank, while he drank, the flavor changed from that of water, to the flavor of the finest of wines, but its appearance never changed. “The shape you came here with is gone and you are now a shapeless clay to be molded, while the queen still holds your former image. Look in the reflection of the fountain, concentrate, and picture the appearance you most desire, and that is what you will become.” The lord did what he asked, he concentrated hard on the featureless face reflected in the fountain. When he was done, The Raeston managed to look shocked. “My lord, the magic must have gone wrong!”</p><p>The lord looked at his new reflection in the fountain, and smiled. “No, this is what I wanted.” The lord was of completely average appearance, with nothing special or striking about his appearance. He looked like someone who was easily forgettable.</p><p>“In your former life, the one your friend has taken for her own, you were the most beautiful creature that most have ever set their eyes upon. You would truly rather be this, than that?” The Raeston asked, his mouth agape.</p><p>“Yes. I have never wanted wealth or beauty, and I have found time and time again, that those with the least, truly have the most.”</p><p>“What is your name young man? I would like to remember this and tell your story.”</p><p>“Eistor Green. Eistor was the name of my favorite male poet, and Green is my favorite color. I have long waited to say it outloud.” He said, tears forming in the corner of his weather and travel worn eyes. He wiped them with the back of his sleeve, and looked down and realized that the magic had also masculinized the commoner clothes he wore. He smiled brightly at The Raeston, and bowed low. “I will send aid to your temple as soon as possible. The journey home will be much shorter than the journey it took to get here, and I owe you my life.”</p><p>“Eistor Green, I wish you the safest journey home possible.” The Raeston bowed lower than should be possible given his stature and posture, and then he walked back slowly into the temple, his walking stick thuds getting quieter as he got further away.</p>","source":{"kind":"user-writing-sample","work":"Freedom Changes Everything"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-7","title":"Freedom Changes Everything — 6","type":"article","html":"<p>Several months later, Eister found himself walking through the familiar streets of the town that Harleina had lived in. The town was clean, and several small children played in the streets. The manor that his parents owned had been torn down and replaced with an orphanage. His parents had moved into the castle to be grandparents to the prince and two princesses that Harleina had born as queen. He smiled because his parents had gotten what they wanted, Harleina had gotten what she deserved, and the kingdom was better for their deception. Harleina was aware that he was coming, that&#x27;s why he was stopping in her old town first. Shed already sent aid to The Raestons temple after his first correspondence letter telling her of his success. Eister walked through the town, determined to complete the one task she&#x27;d given him. Her father still lived there, and she&#x27;d asked Eister to bring him to the castle. He had the royal invitation for her father safely in his traveling sack. Harleina knew her father was getting old, had been mourning her disappearance, thought she was dead, and how it had aged him further. She was planning on letting him know the truth, so that he knew she was ok before his passing.</p><p>Several decades later, Eister was surrounded by grandchildren that were carbon copies of the beautiful lass he had married, a cousin of his dear friend Harleina who herself had passed several years earlier after changing the course of the country with her kind heart. The country was still prospering and advancing in ways that would never have happened if Eister had been forced to be who he was not meant to be, for the king may have fallen in love with beauty, but his country fell in love with her grace and humility. Eister chuckled as a grandson attempted to climb up his leg, and he offered him candy, his eldest daughter retrieved her son, and playfully admonished him before turning to her father.</p><p>“One day father, you are going to have to tell me why you get those far off looks in your eyes.”</p><p>“My dear, today is that day. Sit down next to me, and I will tell you of the day I almost became the queen, but my choice to not go through with it, made this kingdom thrive.”</p>","source":{"kind":"user-writing-sample","work":"Freedom Changes Everything"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-8","title":"The Farmer's Plea","type":"article","html":"<div class=\"story-title-page\"><p class=\"story-kicker\">Short Story</p><h1>The Farmer&#x27;s Plea</h1><p>Written August 13th, 2022</p><p>Revised December 31st, 2024</p></div>"},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-9","title":"The Farmer's Plea — 1","type":"article","html":"<p>He looked upwards at the clouds as tears streamed down his lined, aged face. The years had not been kind to him, and hard labor in the sun had taken its toll. The days were growing longer as summer was approaching again, and his fields were barren. The lien on the house was what got him through last year, but this year he would lose everything he and past generations had worked for. Worse yet, his entire family was buried here and he would have to leave them behind, including his twin daughters he had lost to fever two years prior, and his wife who had died giving birth to his beautiful girls.</p><p>He took off his tattered hat, wiped the sweat from his brow, and placed it back upon his balding head. He grabbed his ho, and set upon the earth, praying to the old gods that there was still some magic left in the  dried up land that six generations had worked to death.</p><p>The dirt beneath his nails was caked and dried, and his knuckles bled by the time the sun set and the work was done. He ate his dinner in the silence that he was still unaccustomed to, by a lone candle that had melted nearly to the base, its wax melding it to the strong oak table his grandfather had built with his own two hands. He sighed as he finished, downed his mug of water, and washed his plate and utensils. After completing this mundane task, he headed to his bedroom, shuffling with tired feet, and an aching back, and flung himself on his hay mattress.</p><p>The sun broke across the sky and something felt different to him. It was the next morning, and he had no memory of falling asleep. He rose, walked to the window, and his mouth gaped open. The fields were full of fully grown crops, even though the fields had only been sewn the day before! The farmer stared out at the golden fields, his mouth still agape. A miracle, there was no other word for it. Stalks of corn stretched high and full, their husks gleaming in the morning light, and rows of wheat rippled like a sea under the faint breeze. His barren land, so lifeless only yesterday, now teemed with the promise of abundance.</p><p>He staggered out into the fields, his old boots crunching against soil that had somehow transformed overnight. The dirt was rich and dark, crumbling between his fingers as he knelt to touch it. He ran his calloused hand over the crops, their leaves strong, the roots deeply anchored.</p><p>The air was heavy, though, not with the heat of summer but with a strange stillness. No birds chirped in the nearby trees. Even the familiar rustling of the wind through the grass seemed muted, as if the land itself held its breath.</p><p>The farmer stood and turned in a slow circle, taking it all in. His heart swelled with gratitude. He fell to his knees again, clasping his hands together in prayer. &quot;Thank you,&quot; he whispered hoarsely, tears streaming anew. &quot;Thank you for hearing me.&quot;</p>","source":{"kind":"user-writing-sample","work":"The Farmer's Plea"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-10","title":"The Farmer's Plea — 2","type":"article","html":"<p>But as he bowed his head, he noticed something he hadn’t seen before. At the far edge of the field, just beyond where the last row of crops ended, the earth was darker, almost black. A single tree stood there, gnarled and ancient, its branches clawing at the sky. He didn’t remember seeing it before.</p><p>Curiosity and unease battled within him, but he reasoned it was simply the result of exhaustion or a trick of the eye. He rose, shaking off his unease, and began his day. The crops needed tending, and his prayers needed fulfillment through work.</p><p>Days passed, and the harvest was bountiful. The farmer worked from dawn till dusk, his heart lighter than it had been in years. The food would see him through the winter and even allow him to pay off the lien. For the first time in a long while, he dared to dream of a future.</p><p>But every night, his dreams grew stranger. He saw his daughters, their small hands clutching bouquets of wildflowers. They stood at the base of the gnarled tree, their faces pale and eyes hollow, staring at him in silence. In the dreams, he would try to approach them, but his legs refused to move. They would simply point to the tree as whispers filled the air, soft, indistinct murmurs that sent shivers down his spine.</p><p>The whispers followed him into the waking world. At first, they were faint, like the wind through the cracks of the farmhouse. But soon, they became more insistent, rising in urgency whenever he neared the edge of the field where the tree stood.</p><p>One evening, unable to bear it any longer, he took a lantern and made his way toward the dark corner of his land. The air grew colder with every step, and the crops around him seemed to wither, their vibrant green fading to a sickly yellow. When he reached the tree, his breath caught in his throat.</p><p>Beneath its twisted roots lay something that gleamed faintly in the lantern light, bones. Small ones. Human. His daughters’ names were etched into the bark above them, the letters crude but unmistakable.</p><p>The whispers surged, now loud and clear: “A debt unpaid.”</p><p>The farmer stumbled back, his heart racing. &quot;What, what do you want?&quot; he cried into the darkness.</p><p>The ground beneath the tree cracked, and from the fissure rose a figure cloaked in shadow. It had no face, only an empty void where features should have been. Its voice was as cold as the grave.</p><p>&quot;You asked, and we gave,&quot; it said. &quot;But the price was not your prayers. It was your blood.&quot;</p><p>The farmer shook his head, tears streaming again, this time in terror. &quot;No,&quot; he whispered. &quot;Take the land, take everything, just leave me be.&quot;</p><p>The figure tilted its head, as if considering his plea. &quot;The land is ours already. What remains is your choice: to stay and tend it, or leave and face what awaits you beyond.&quot;</p>","source":{"kind":"user-writing-sample","work":"The Farmer's Plea"}},{"schema":"literaryfriend.interactive-book.page.v1","id":"sample-11","title":"The Farmer's Plea — 3","type":"article","html":"<p>The farmer turned back to the fields, now shrouded in shadow. He thought of his family, buried in the land they had loved, and of the generations who had poured their lives into its soil.</p><p>Swallowing his fear, he lowered his head. &quot;I’ll stay,&quot; he said. &quot;I’ll care for it, no matter the cost.&quot;</p><p>The shadow receded, its whispers fading into the wind. The tree remained, its gnarled branches looming over the land like a silent sentinel. The farmer worked the fields each day, his labor as unending as the whispers that now lived in his mind.</p><p>And as the seasons turned, the crops grew bountiful each year, but the land itself seemed darker, heavier. The farm prospered, but the farmer himself withered, his body growing frailer with each passing harvest. He rarely ventured to the edge of the field where the tree stood, though its presence haunted him.</p><p>The farm would thrive long after he was gone, but the whispers promised that no one who lived there would ever truly leave.</p>","source":{"kind":"user-writing-sample","work":"The Farmer's Plea"}}],"cloud":{"projectId":"","manifestNodeId":"","pageNodeIds":[]}};

  const PAPER_PRESETS = {
    cream: { label: 'Warm Cream', background: '#f7efd9', ink: '#2b241b', accent: '#8b5f32', pattern: 'paper', font: 'serif' },
    white: { label: 'Clean White', background: '#fffef8', ink: '#161616', accent: '#3a4f76', pattern: 'plain', font: 'serif' },
    parchment: { label: 'Parchment', background: '#efe0b8', ink: '#382a1c', accent: '#7d4e24', pattern: 'parchment', font: 'serif' },
    night: { label: 'Night Reader', background: '#20242c', ink: '#eef0f2', accent: '#75c8d8', pattern: 'plain', font: 'sans' },
    notebook: { label: 'Notebook', background: '#fbfcf8', ink: '#232323', accent: '#466890', pattern: 'grid', font: 'sans' },
    custom: { label: 'Custom', background: '#f7efd9', ink: '#2b241b', accent: '#8b5f32', pattern: 'paper', font: 'serif' }
  };

  const BUILTIN_TEXTURES = {
    none: '',
    cream: 'assets/images/paper-cream-fiber.jpg',
    parchment: 'assets/images/paper-parchment.jpg',
    linen: 'assets/images/paper-linen.jpg'
  };

  const COVER_PRESETS = {
    classic: { bg: '#362a25', text: '#fff7e9', overlay: 22, fit: 'cover' },
    midnight: { bg: '#101827', text: '#e6f8ff', overlay: 38, fit: 'cover' },
    'retro-pulp': { bg: '#a53f2b', text: '#fff2a8', overlay: 14, fit: 'cover' },
    minimal: { bg: '#e9e3d9', text: '#24201d', overlay: 0, fit: 'contain' },
    custom: { bg: '#362a25', text: '#fff7e9', overlay: 18, fit: 'cover' }
  };

  const els = {};
  let state = makeDefaultBook();
  let pageFlip = null;
  let selectedPageIndex = 0;
  let visibleFlipIndex = 0;
  let rebuildTimer = null;
  let forceRebuildPending = false;
  let localSaveTimer = null;
  let pageTurnSoundAt = 0;
  let fallbackMode = false;
  let fallbackFlipIndex = 0;
  let dbPromise = null;
  let cloudToken = localStorage.getItem(TOKEN_KEY) || (global.LF?.api?.token || '');
  let cloudUser = null;

  async function init(root) {
    mountRoot = root || mountRoot;
    if (!mountRoot) throw new Error('Book Builder mount root is missing.');
    cacheElements();
    fillSizePresets();
    bindTabs();
    bindBookControls();
    bindCoverControls();
    bindPageControls();
    bindDesignControls();
    bindNavigation();
    bindInspector();
    bindCloudControls();
    bindKeyboard();

    try {
      const saved = await localGet(LOCAL_KEY);
      if (saved && saved.schema === APP_SCHEMA) {
        state = normalizeProject(saved);
        setStatus('Restored your last local book draft.');
      } else {
        setStatus('Ready. Start a blank book or load the favorite short-stories starter.');
      }
    } catch (error) {
      console.warn('Local restore failed', error);
      setStatus('Local restore was unavailable; using a fresh starter.', true);
    }

    syncAllControls();
    rebuildBook(false);
    renderPageList();
    selectPage(Math.min(selectedPageIndex, Math.max(0, state.pages.length - 1)), false);
    updateSoundControls();
    updatePreviewMeta();

    if (cloudToken) {
      verifyCloudSession();
    }
  }

  function cacheElements() {
    Object.keys(els).forEach((key) => delete els[key]);
    mountRoot.querySelectorAll('[id]').forEach((node) => { els[node.id] = node; });
  }

  function makeDefaultBook() {
    const now = new Date().toISOString();
    return {
      schema: APP_SCHEMA,
      version: 1,
      id: cryptoRandomId('book'),
      title: 'Favorite Short Stories',
      subtitle: 'Book Builder Starter',
      author: 'Will Saville',
      createdAt: now,
      updatedAt: now,
      size: { preset: 'trade', width: 6, height: 9, unit: 'in', binding: 'paperback' },
      cover: {
        preset: 'classic',
        artUrl: '',
        artDataUrl: '',
        showText: true,
        title: 'Favorite Short Stories',
        subtitle: '',
        author: 'Will Saville',
        background: '#362a25',
        text: '#fff7e9',
        fit: 'cover',
        overlay: 12
      },
      pageDesign: {
        preset: 'cream',
        background: '#f7efd9',
        ink: '#2b241b',
        accent: '#8b5f32',
        pattern: 'paper',
        font: 'serif',
        margin: 8,
        pageNumbers: true,
        textureDataUrl: '',
        textureUrl: BUILTIN_TEXTURES.cream
      },
      sound: { enabled: true, volume: 0.55, file: 'assets/audio/page-flip.wav' },
      pages: [
        {
          schema: PAGE_SCHEMA,
          id: cryptoRandomId('page'),
          title: 'Welcome to LiteraryFriend Book Builder',
          type: 'article',
          html: '<h1>Build a book that behaves like a book.</h1><p>Upload page JSON files separately from cover art, choose a physical trim size, style the paper, then drag or swipe the page corners to turn pages.</p><div class="page-callout"><strong>Starter included:</strong> The Book tab can load two favorite short stories from the supplied writing collection.</div>'
        },
        {
          schema: PAGE_SCHEMA,
          id: cryptoRandomId('page'),
          title: 'JSON Pages',
          type: 'article',
          html: '<h2>One file or many</h2><p>The Pages tab accepts one JSON page, an array of pages, a project containing <code>pages</code>, or structured records. Multiple files can be selected and naturally sorted by filename.</p><p>Cover art is never bundled into the page-upload action, so creators can replace art without touching their page data.</p>'
        },
        {
          schema: PAGE_SCHEMA,
          id: cryptoRandomId('page'),
          title: 'Design It Your Way',
          type: 'article',
          html: '<h2>Cover, paper, texture, and trim are independent.</h2><p>Choose paperback, hardcover, square, portrait, landscape, or custom dimensions. Paper colors, ink, patterns, reading fonts, margins, and textures can all be changed without changing page content.</p>'
        }
      ],
      cloud: { projectId: '', manifestNodeId: '', pageNodeIds: [] }
    };
  }

  function normalizeProject(raw) {
    const base = makeDefaultBook();
    const src = raw && typeof raw === 'object' ? deepClone(raw) : {};
    const merged = {
      ...base,
      ...src,
      size: { ...base.size, ...(src.size || {}) },
      cover: { ...base.cover, ...(src.cover || {}) },
      pageDesign: { ...base.pageDesign, ...(src.pageDesign || {}) },
      sound: { ...base.sound, ...(src.sound || {}) },
      cloud: { ...base.cloud, ...(src.cloud || {}) }
    };
    merged.schema = APP_SCHEMA;
    merged.pages = Array.isArray(src.pages) ? src.pages.map((p, i) => normalizePage(p, `Page ${i + 1}`)) : base.pages;
    merged.updatedAt = new Date().toISOString();
    if (!merged.id) merged.id = cryptoRandomId('book');
    if (!merged.cloud.pageNodeIds || !Array.isArray(merged.cloud.pageNodeIds)) merged.cloud.pageNodeIds = [];
    return merged;
  }

  function normalizePage(raw, fallbackTitle = 'Untitled Page') {
    const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? deepClone(raw) : { text: String(raw ?? '') };
    const recognized = ['article', 'image', 'record', 'blank'];
    const hasPageFields = ['title', 'type', 'html', 'text', 'image', 'blocks', 'data', 'design'].some((key) => Object.prototype.hasOwnProperty.call(value, key));

    if (!hasPageFields) {
      return {
        schema: PAGE_SCHEMA,
        id: cryptoRandomId('page'),
        title: fallbackTitle,
        type: 'record',
        data: value
      };
    }

    const page = {
      ...value,
      schema: PAGE_SCHEMA,
      id: value.id || cryptoRandomId('page'),
      title: String(value.title || fallbackTitle),
      type: recognized.includes(value.type) ? value.type : inferPageType(value)
    };
    return page;
  }

  function inferPageType(page) {
    if (page.image || page.imageUrl || page.src) return 'image';
    if (page.data && typeof page.data === 'object') return 'record';
    if (page.html || page.text || page.blocks) return 'article';
    return 'record';
  }

  function fillSizePresets() {
    els.sizePresetSelect.innerHTML = SIZE_PRESETS.map((preset) =>
      `<option value="${escapeAttr(preset.id)}">${escapeHtml(preset.label)} — ${formatNumber(preset.width)} × ${formatNumber(preset.height)} in</option>`
    ).join('');
  }

  function bindTabs() {
    mountRoot.querySelectorAll('.panel-tab').forEach((button) => {
      button.addEventListener('click', () => {
        mountRoot.querySelectorAll('.panel-tab').forEach((b) => b.classList.remove('active'));
        mountRoot.querySelectorAll('.panel-page').forEach((panel) => panel.classList.remove('active'));
        button.classList.add('active');
        const target = mountRoot.querySelector(`#${button.dataset.panel}`);
        if (target) target.classList.add('active');
      });
    });
  }

  function bindBookControls() {
    els.bookTitleInput.addEventListener('input', () => {
      const previousTitle = state.title;
      state.title = els.bookTitleInput.value;
      if (!state.cover.title || state.cover.title === previousTitle) {
        state.cover.title = state.title;
        els.coverTitleInput.value = state.cover.title;
      }
      touch();
      updatePreviewMeta();
      scheduleRebuild();
    });
    els.bookSubtitleInput.addEventListener('input', () => {
      const old = state.subtitle;
      state.subtitle = els.bookSubtitleInput.value;
      if (!state.cover.subtitle || state.cover.subtitle === old) {
        state.cover.subtitle = state.subtitle;
        els.coverSubtitleInput.value = state.cover.subtitle;
      }
      touch();
      scheduleRebuild();
    });
    els.bookAuthorInput.addEventListener('input', () => {
      const old = state.author;
      state.author = els.bookAuthorInput.value;
      if (!state.cover.author || state.cover.author === old) {
        state.cover.author = state.author;
        els.coverAuthorInput.value = state.cover.author;
      }
      touch();
      scheduleRebuild();
    });

    els.sizePresetSelect.addEventListener('change', () => {
      const preset = SIZE_PRESETS.find((item) => item.id === els.sizePresetSelect.value) || SIZE_PRESETS[1];
      state.size.preset = preset.id;
      if (preset.id !== 'custom') {
        state.size.width = preset.width;
        state.size.height = preset.height;
        state.size.binding = preset.binding;
      }
      syncSizeControls();
      touch();
      scheduleRebuild(true);
    });

    [els.customWidthInput, els.customHeightInput].forEach((input) => {
      input.addEventListener('input', () => {
        state.size.preset = 'custom';
        state.size.binding = 'custom';
        state.size.width = clamp(Number(els.customWidthInput.value) || 6, 2, 20);
        state.size.height = clamp(Number(els.customHeightInput.value) || 9, 2, 20);
        els.sizePresetSelect.value = 'custom';
        syncSizeControls();
        touch();
        scheduleRebuild(true);
      });
    });

    els.newBookBtn.addEventListener('click', () => {
      state = makeDefaultBook();
      state.id = cryptoRandomId('book');
      state.title = 'Untitled Interactive Book';
      state.subtitle = '';
      state.author = '';
      state.cover = {
        ...state.cover,
        artUrl: '',
        showText: true,
        title: state.title,
        subtitle: '',
        author: '',
        background: '#362a25',
        text: '#fff7e9'
      };
      state.pages = [makeBlankPage('Page 1')];
      state.cloud = { projectId: '', manifestNodeId: '', pageNodeIds: [] };
      selectedPageIndex = 0;
      syncAllControls();
      renderPageList();
      selectPage(0, false);
      rebuildBook(false);
      touch(true);
      setStatus('Started a new blank interactive book.');
    });

    els.loadStarterBtn.addEventListener('click', () => {
      try {
        setStatus('Loading the favorite short-stories starter…');
        state = normalizeProject(deepClone(FAVORITE_STARTER));
        state.cloud = { projectId: '', manifestNodeId: '', pageNodeIds: [] };
        selectedPageIndex = 0;
        syncAllControls();
        renderPageList();
        selectPage(0, false);
        rebuildBook(false);
        touch(true);
        setStatus(`Loaded ${state.pages.length} pages from the included favorite short-stories starter.`);
      } catch (error) {
        console.error(error);
        setStatus('Could not load the included starter book.', true);
      }
    });

    els.projectImportInput.addEventListener('change', async () => {
      const [file] = els.projectImportInput.files || [];
      if (!file) return;
      try {
        const raw = JSON.parse(await file.text());
        if (raw.schema === APP_SCHEMA || Array.isArray(raw.pages)) {
          state = normalizeProject(raw);
        } else {
          const imported = normalizeImportedPages(raw, file.name);
          state = makeDefaultBook();
          state.title = stripExtension(file.name);
          state.cover.title = state.title;
          state.pages = imported;
        }
        state.cloud = { projectId: '', manifestNodeId: '', pageNodeIds: [] };
        selectedPageIndex = 0;
        syncAllControls();
        renderPageList();
        selectPage(0, false);
        rebuildBook(false);
        touch(true);
        setStatus(`Imported project: ${file.name}`);
      } catch (error) {
        console.error(error);
        setStatus(`Project import failed: ${error.message}`, true);
      } finally {
        els.projectImportInput.value = '';
      }
    });

    els.saveLocalBtn.addEventListener('click', async () => {
      await saveLocalNow(true);
    });

    els.exportProjectBtn.addEventListener('click', () => {
      downloadJson(`${safeFilename(state.title || 'interactive-book')}.literaryfriend-book.json`, state);
      setStatus('Exported the complete interactive book project JSON.');
    });

    els.readerModeBtn.addEventListener('click', () => {
      const active = !mountRoot.classList.contains('reader-mode');
      mountRoot.classList.toggle('reader-mode', active);
      els.readerModeBtn.setAttribute('aria-pressed', String(active));
      els.readerModeBtn.textContent = active ? 'Exit Reader Mode' : 'Reader Mode';
      window.setTimeout(() => rebuildBook(true, true), 180);
    });
  }

  function bindCoverControls() {
    els.coverArtInput.addEventListener('change', async () => {
      const [file] = els.coverArtInput.files || [];
      if (!file) return;
      try {
        state.cover.artDataUrl = await imageFileToDataUrl(file, 1800, 430000);
        state.cover.artUrl = '';
        touch();
        scheduleRebuild();
        setStatus(`Cover art replaced with ${file.name}.`);
      } catch (error) {
        setStatus(`Cover art could not be prepared: ${error.message}`, true);
      } finally {
        els.coverArtInput.value = '';
      }
    });

    els.clearCoverBtn.addEventListener('click', () => {
      state.cover.artDataUrl = '';
      state.cover.artUrl = '';
      touch();
      scheduleRebuild();
      setStatus('Cover art cleared; the cover design color remains.');
    });

    els.coverPresetSelect.addEventListener('change', () => {
      const id = els.coverPresetSelect.value;
      const preset = COVER_PRESETS[id] || COVER_PRESETS.custom;
      state.cover.preset = id;
      if (id !== 'custom') {
        state.cover.background = preset.bg;
        state.cover.text = preset.text;
        state.cover.overlay = preset.overlay;
        state.cover.fit = preset.fit;
      }
      syncCoverControls();
      touch();
      scheduleRebuild();
    });

    els.coverShowTextInput.addEventListener('change', () => {
      state.cover.showText = els.coverShowTextInput.checked;
      touch();
      scheduleRebuild();
    });

    const coverTextInputs = [
      [els.coverTitleInput, 'title'],
      [els.coverSubtitleInput, 'subtitle'],
      [els.coverAuthorInput, 'author']
    ];
    coverTextInputs.forEach(([input, key]) => {
      input.addEventListener('input', () => {
        state.cover[key] = input.value;
        touch();
        scheduleRebuild();
      });
    });

    els.coverBgInput.addEventListener('input', () => setCoverCustom('background', els.coverBgInput.value));
    els.coverTextInput.addEventListener('input', () => setCoverCustom('text', els.coverTextInput.value));
    els.coverFitSelect.addEventListener('change', () => setCoverCustom('fit', els.coverFitSelect.value));
    els.coverOverlayInput.addEventListener('input', () => {
      setCoverCustom('overlay', Number(els.coverOverlayInput.value));
      els.coverOverlayValue.textContent = `${els.coverOverlayInput.value}%`;
    });
  }

  function setCoverCustom(key, value) {
    state.cover[key] = value;
    state.cover.preset = 'custom';
    els.coverPresetSelect.value = 'custom';
    touch();
    scheduleRebuild();
  }

  function bindPageControls() {
    els.pageFilesInput.addEventListener('change', async () => {
      let files = Array.from(els.pageFilesInput.files || []);
      if (!files.length) return;
      if (els.naturalSortInput.checked) {
        files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      }
      const additions = [];
      const failures = [];
      for (const file of files) {
        try {
          const parsed = JSON.parse(await file.text());
          additions.push(...normalizeImportedPages(parsed, file.name));
        } catch (error) {
          failures.push(`${file.name}: ${error.message}`);
        }
      }
      if (additions.length) {
        state.pages.push(...additions);
        selectedPageIndex = Math.max(0, state.pages.length - additions.length);
        renderPageList();
        selectPage(selectedPageIndex, false);
        touch();
        rebuildBook(true);
      }
      els.pageFilesInput.value = '';
      const message = `Imported ${additions.length} page${additions.length === 1 ? '' : 's'} from ${files.length} JSON file${files.length === 1 ? '' : 's'}.`;
      setStatus(failures.length ? `${message} ${failures.length} file(s) failed: ${failures.join(' | ')}` : message, failures.length > 0);
    });

    els.addBlankPageBtn.addEventListener('click', () => {
      const page = makeBlankPage(`Page ${state.pages.length + 1}`);
      const insertAt = state.pages.length ? selectedPageIndex + 1 : 0;
      state.pages.splice(insertAt, 0, page);
      renderPageList();
      selectPage(insertAt, true);
      touch();
      rebuildBook(true);
      setStatus('Added a blank page.');
    });

    els.downloadPagesBtn.addEventListener('click', () => {
      downloadJson(`${safeFilename(state.title || 'book')}.pages.json`, { schema: `${APP_SCHEMA}.pages`, pages: state.pages });
      setStatus(`Exported ${state.pages.length} page${state.pages.length === 1 ? '' : 's'} as JSON.`);
    });

    els.duplicatePageBtn.addEventListener('click', () => {
      if (!state.pages.length) return;
      const copy = deepClone(state.pages[selectedPageIndex]);
      copy.id = cryptoRandomId('page');
      copy.title = `${copy.title || 'Page'} Copy`;
      state.pages.splice(selectedPageIndex + 1, 0, copy);
      renderPageList();
      selectPage(selectedPageIndex + 1, true);
      touch();
      rebuildBook(true);
      setStatus('Duplicated the selected page.');
    });
  }

  function normalizeImportedPages(data, fileName = 'page.json') {
    const fallback = stripExtension(fileName);
    if (Array.isArray(data)) {
      return data.map((item, index) => normalizePage(item, `${fallback} ${index + 1}`));
    }
    if (!data || typeof data !== 'object') {
      return [normalizePage({ text: String(data ?? '') }, fallback)];
    }
    if (Array.isArray(data.pages)) {
      return data.pages.map((item, index) => normalizePage(item, `${fallback} ${index + 1}`));
    }
    if (Array.isArray(data.records)) {
      if (data.records.length > 500) {
        throw new Error(`This JSON contains ${data.records.length} records. Split it into smaller page files to avoid creating an unusably large live flipbook.`);
      }
      return data.records.map((record, index) => normalizePage({
        title: record.name || record.title || `${fallback} ${index + 1}`,
        type: 'record',
        data: record,
        source: { kind: 'records', fileName }
      }, `${fallback} ${index + 1}`));
    }
    return [normalizePage(data, fallback)];
  }

  function bindDesignControls() {
    els.paperPresetSelect.addEventListener('change', () => {
      const id = els.paperPresetSelect.value;
      const preset = PAPER_PRESETS[id] || PAPER_PRESETS.custom;
      state.pageDesign.preset = id;
      if (id !== 'custom') {
        state.pageDesign.background = preset.background;
        state.pageDesign.ink = preset.ink;
        state.pageDesign.accent = preset.accent;
        state.pageDesign.pattern = preset.pattern;
        state.pageDesign.font = preset.font;
      }
      syncDesignControls();
      touch();
      scheduleRebuild();
    });

    els.paperColorInput.addEventListener('input', () => setPaperCustom('background', els.paperColorInput.value));
    els.inkColorInput.addEventListener('input', () => setPaperCustom('ink', els.inkColorInput.value));
    els.accentColorInput.addEventListener('input', () => setPaperCustom('accent', els.accentColorInput.value));
    els.paperPatternSelect.addEventListener('change', () => setPaperCustom('pattern', els.paperPatternSelect.value));
    els.pageFontSelect.addEventListener('change', () => setPaperCustom('font', els.pageFontSelect.value));

    els.pageMarginInput.addEventListener('input', () => {
      state.pageDesign.margin = Number(els.pageMarginInput.value);
      els.pageMarginValue.textContent = `${formatNumber(state.pageDesign.margin)}%`;
      touch();
      scheduleRebuild();
    });

    els.builtinTextureSelect.addEventListener('change', () => {
      const choice = els.builtinTextureSelect.value;
      if (choice === 'custom') return;
      state.pageDesign.textureDataUrl = '';
      state.pageDesign.textureUrl = BUILTIN_TEXTURES[choice] || '';
      touch();
      scheduleRebuild();
      setStatus(choice === 'none' ? 'Built-in page texture cleared.' : `Built-in ${choice} page texture applied.`);
    });

    els.pageTextureInput.addEventListener('change', async () => {
      const [file] = els.pageTextureInput.files || [];
      if (!file) return;
      try {
        state.pageDesign.textureDataUrl = await imageFileToDataUrl(file, 1200, 210000);
        state.pageDesign.textureUrl = '';
        els.builtinTextureSelect.value = 'custom';
        touch();
        scheduleRebuild();
        setStatus(`Page texture changed to ${file.name}.`);
      } catch (error) {
        setStatus(`Page texture could not be prepared: ${error.message}`, true);
      } finally {
        els.pageTextureInput.value = '';
      }
    });

    els.clearTextureBtn.addEventListener('click', () => {
      state.pageDesign.textureDataUrl = '';
      state.pageDesign.textureUrl = '';
      els.builtinTextureSelect.value = 'none';
      touch();
      scheduleRebuild();
      setStatus('Page texture cleared.');
    });

    els.pageNumbersInput.addEventListener('change', () => {
      state.pageDesign.pageNumbers = els.pageNumbersInput.checked;
      touch();
      scheduleRebuild();
    });

    els.soundEnabledInput.addEventListener('change', () => {
      state.sound.enabled = els.soundEnabledInput.checked;
      updateSoundControls();
      touch();
    });

    els.soundVolumeInput.addEventListener('input', () => {
      state.sound.volume = clamp(Number(els.soundVolumeInput.value) / 100, 0, 1);
      updateSoundControls();
      touch();
    });
  }

  function setPaperCustom(key, value) {
    state.pageDesign[key] = value;
    state.pageDesign.preset = 'custom';
    els.paperPresetSelect.value = 'custom';
    touch();
    scheduleRebuild();
  }

  function bindNavigation() {
    els.prevPageBtn.addEventListener('click', () => navigateBook('prev'));
    els.nextPageBtn.addEventListener('click', () => navigateBook('next'));
    els.firstPageBtn.addEventListener('click', () => navigateBook('first'));
    els.lastPageBtn.addEventListener('click', () => navigateBook('last'));
    els.soundToggleBtn.addEventListener('click', () => {
      state.sound.enabled = !state.sound.enabled;
      updateSoundControls();
      touch();
    });
  }

  function navigateBook(action) {
    if (pageFlip && !fallbackMode) {
      if (action === 'prev') pageFlip.flipPrev('top');
      if (action === 'next') pageFlip.flipNext('top');
      if (action === 'first') pageFlip.flip(0, 'top');
      if (action === 'last') pageFlip.flip(state.pages.length + 1, 'top');
      return;
    }
    const max = state.pages.length + 1;
    if (action === 'prev') fallbackFlipIndex = clamp(fallbackFlipIndex - 1, 0, max);
    if (action === 'next') fallbackFlipIndex = clamp(fallbackFlipIndex + 1, 0, max);
    if (action === 'first') fallbackFlipIndex = 0;
    if (action === 'last') fallbackFlipIndex = max;
    visibleFlipIndex = fallbackFlipIndex;
    renderFallbackPage(true);
    playPageTurn();
    updatePagePosition();
  }

  function bindKeyboard() {
    if (global.__lfBookBuilderKeyHandler) {
      window.removeEventListener('keydown', global.__lfBookBuilderKeyHandler);
    }
    global.__lfBookBuilderKeyHandler = (event) => {
      if (!mountRoot?.isConnected) return;
      if (global.LF?.state?.view && global.LF.state.view !== 'bookbuilder') return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateBook('prev');
      } else if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        navigateBook('next');
      } else if (event.key === 'Home') {
        event.preventDefault();
        navigateBook('first');
      } else if (event.key === 'End') {
        event.preventDefault();
        navigateBook('last');
      }
    };
    window.addEventListener('keydown', global.__lfBookBuilderKeyHandler);
  }

  function bindInspector() {
    els.pageTitleInput.addEventListener('input', () => {
      if (!state.pages[selectedPageIndex]) return;
      state.pages[selectedPageIndex].title = els.pageTitleInput.value;
      touch();
      renderPageList();
      scheduleRebuild();
    });

    els.pageTypeSelect.addEventListener('change', () => {
      const page = state.pages[selectedPageIndex];
      if (!page) return;
      page.type = els.pageTypeSelect.value;
      touch();
      syncInspector();
      renderPageList();
      scheduleRebuild();
    });

    els.applyPageJsonBtn.addEventListener('click', () => {
      if (!state.pages[selectedPageIndex]) return;
      try {
        const parsed = JSON.parse(els.pageJsonEditor.value);
        const page = normalizePage(parsed, state.pages[selectedPageIndex].title || `Page ${selectedPageIndex + 1}`);
        page.id = parsed.id || state.pages[selectedPageIndex].id || cryptoRandomId('page');
        state.pages[selectedPageIndex] = page;
        touch();
        syncInspector();
        renderPageList();
        rebuildBook(true);
        setStatus(`Applied JSON to page ${selectedPageIndex + 1}.`);
      } catch (error) {
        setStatus(`Page JSON is invalid: ${error.message}`, true);
      }
    });

    els.downloadPageBtn.addEventListener('click', () => {
      const page = state.pages[selectedPageIndex];
      if (!page) return;
      downloadJson(`${String(selectedPageIndex + 1).padStart(3, '0')}-${safeFilename(page.title || 'page')}.json`, page);
      setStatus('Downloaded the selected page JSON.');
    });

    els.deletePageBtn.addEventListener('click', () => {
      if (!state.pages.length) return;
      state.pages.splice(selectedPageIndex, 1);
      if (!state.pages.length) state.pages.push(makeBlankPage('Page 1'));
      selectedPageIndex = clamp(selectedPageIndex, 0, state.pages.length - 1);
      renderPageList();
      selectPage(selectedPageIndex, false);
      touch();
      rebuildBook(false);
      setStatus('Deleted the selected page.');
    });
  }

  function renderPageList() {
    els.pageCountLabel.textContent = `${state.pages.length} page${state.pages.length === 1 ? '' : 's'}`;
    els.pageList.innerHTML = '';
    state.pages.forEach((page, index) => {
      const item = document.createElement('div');
      item.className = `page-list-item${index === selectedPageIndex ? ' selected' : ''}`;
      item.setAttribute('role', 'listitem');
      item.innerHTML = `
        <button class="page-select" type="button" title="Edit page ${index + 1}">
          <span class="page-list-num">${index + 1}</span>
          <span class="page-list-copy"><strong>${escapeHtml(page.title || `Page ${index + 1}`)}</strong><small>${escapeHtml(page.type || 'article')}</small></span>
        </button>
        <span class="page-order-buttons">
          <button type="button" class="tiny-icon" data-move="up" title="Move page up" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="tiny-icon" data-move="down" title="Move page down" ${index === state.pages.length - 1 ? 'disabled' : ''}>↓</button>
        </span>`;
      item.querySelector('.page-select').addEventListener('click', () => selectPage(index, true));
      item.querySelector('[data-move="up"]').addEventListener('click', () => movePage(index, index - 1));
      item.querySelector('[data-move="down"]').addEventListener('click', () => movePage(index, index + 1));
      els.pageList.appendChild(item);
    });
  }

  function movePage(from, to) {
    if (to < 0 || to >= state.pages.length || from === to) return;
    const [page] = state.pages.splice(from, 1);
    state.pages.splice(to, 0, page);
    selectedPageIndex = to;
    renderPageList();
    syncInspector();
    touch();
    rebuildBook(false);
    jumpToContentPage(to);
  }

  function selectPage(index, flipToPage = true) {
    if (!state.pages.length) return;
    selectedPageIndex = clamp(index, 0, state.pages.length - 1);
    syncInspector();
    renderPageList();
    if (flipToPage) jumpToContentPage(selectedPageIndex);
  }

  function jumpToContentPage(index) {
    const engineIndex = index + 1;
    if (pageFlip && !fallbackMode) {
      try { pageFlip.turnToPage(engineIndex); } catch (_) { try { pageFlip.flip(engineIndex, 'top'); } catch (_) {} }
      visibleFlipIndex = engineIndex;
      updatePagePosition();
    } else {
      fallbackFlipIndex = engineIndex;
      visibleFlipIndex = engineIndex;
      renderFallbackPage(false);
      updatePagePosition();
    }
  }

  function syncInspector() {
    const page = state.pages[selectedPageIndex];
    if (!page) {
      els.selectedPageBadge.textContent = 'No page';
      els.pageTitleInput.value = '';
      els.pageJsonEditor.value = '';
      return;
    }
    els.selectedPageBadge.textContent = `Page ${selectedPageIndex + 1}`;
    els.pageTitleInput.value = page.title || '';
    els.pageTypeSelect.value = ['article', 'image', 'record', 'blank'].includes(page.type) ? page.type : 'article';
    els.pageJsonEditor.value = JSON.stringify(page, null, 2);
  }

  function syncAllControls() {
    els.bookTitleInput.value = state.title || '';
    els.bookSubtitleInput.value = state.subtitle || '';
    els.bookAuthorInput.value = state.author || '';
    syncSizeControls();
    syncCoverControls();
    syncDesignControls();
    updateSoundControls();
    updatePreviewMeta();
  }

  function syncSizeControls() {
    const presetExists = SIZE_PRESETS.some((item) => item.id === state.size.preset);
    els.sizePresetSelect.value = presetExists ? state.size.preset : 'custom';
    els.customWidthInput.value = formatNumber(state.size.width);
    els.customHeightInput.value = formatNumber(state.size.height);
    els.customWidthInput.disabled = els.sizePresetSelect.value !== 'custom';
    els.customHeightInput.disabled = els.sizePresetSelect.value !== 'custom';
    els.sizeReadout.textContent = `${formatNumber(state.size.width)} × ${formatNumber(state.size.height)} ${state.size.unit || 'in'} · ${capitalize(state.size.binding || 'custom')}`;
    updatePreviewMeta();
  }

  function syncCoverControls() {
    els.coverPresetSelect.value = Object.prototype.hasOwnProperty.call(COVER_PRESETS, state.cover.preset) ? state.cover.preset : 'custom';
    els.coverShowTextInput.checked = Boolean(state.cover.showText);
    els.coverTitleInput.value = state.cover.title || '';
    els.coverSubtitleInput.value = state.cover.subtitle || '';
    els.coverAuthorInput.value = state.cover.author || '';
    els.coverBgInput.value = validHex(state.cover.background, '#362a25');
    els.coverTextInput.value = validHex(state.cover.text, '#fff7e9');
    els.coverFitSelect.value = ['cover', 'contain', 'stretch'].includes(state.cover.fit) ? state.cover.fit : 'cover';
    els.coverOverlayInput.value = String(clamp(Number(state.cover.overlay) || 0, 0, 80));
    els.coverOverlayValue.textContent = `${els.coverOverlayInput.value}%`;
  }

  function syncDesignControls() {
    els.paperPresetSelect.value = Object.prototype.hasOwnProperty.call(PAPER_PRESETS, state.pageDesign.preset) ? state.pageDesign.preset : 'custom';
    els.paperColorInput.value = validHex(state.pageDesign.background, '#f7efd9');
    els.inkColorInput.value = validHex(state.pageDesign.ink, '#2b241b');
    els.accentColorInput.value = validHex(state.pageDesign.accent, '#8b5f32');
    els.paperPatternSelect.value = ['plain', 'paper', 'parchment', 'linen', 'grid', 'dots'].includes(state.pageDesign.pattern) ? state.pageDesign.pattern : 'plain';
    els.pageFontSelect.value = ['serif', 'sans', 'mono'].includes(state.pageDesign.font) ? state.pageDesign.font : 'serif';
    els.pageMarginInput.value = String(clamp(Number(state.pageDesign.margin) || 8, 3, 15));
    els.pageMarginValue.textContent = `${formatNumber(Number(els.pageMarginInput.value))}%`;
    if (state.pageDesign.textureDataUrl) {
      els.builtinTextureSelect.value = 'custom';
    } else {
      const match = Object.entries(BUILTIN_TEXTURES).find(([, url]) => url && url === state.pageDesign.textureUrl);
      els.builtinTextureSelect.value = match ? match[0] : (state.pageDesign.textureUrl ? 'custom' : 'none');
    }
    els.pageNumbersInput.checked = Boolean(state.pageDesign.pageNumbers);
  }

  function updateSoundControls() {
    const enabled = Boolean(state.sound.enabled);
    const volume = clamp(Number(state.sound.volume ?? 0.55), 0, 1);
    els.soundEnabledInput.checked = enabled;
    els.soundVolumeInput.value = String(Math.round(volume * 100));
    els.soundVolumeValue.textContent = `${Math.round(volume * 100)}%`;
    els.soundToggleBtn.textContent = enabled ? '🔊' : '🔇';
    els.soundToggleBtn.setAttribute('aria-pressed', String(enabled));
    els.pageFlipAudio.volume = volume;
  }

  function updatePreviewMeta() {
    els.previewTitle.textContent = state.title || 'Untitled Book';
    els.previewTrim.textContent = `${formatNumber(state.size.width)} × ${formatNumber(state.size.height)} in`;
  }

  function scheduleRebuild(forceRecreate = false) {
    forceRebuildPending = forceRebuildPending || forceRecreate;
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      const force = forceRebuildPending;
      forceRebuildPending = false;
      rebuildBook(true, force);
    }, 190);
  }

  function rebuildBook(preservePosition = true, forceRecreate = false) {
    const desired = preservePosition ? visibleFlipIndex : 0;
    const pages = buildBookPageElements();
    const canUseEngine = Boolean(window.St && typeof window.St.PageFlip === 'function');

    if (pageFlip && !fallbackMode && canUseEngine && !forceRecreate && typeof pageFlip.updateFromHtml === 'function') {
      try {
        pageFlip.updateFromHtml(pages);
        visibleFlipIndex = clamp(desired, 0, state.pages.length + 1);
        try { pageFlip.turnToPage(visibleFlipIndex); } catch (_) {}
        els.engineState.textContent = 'Real-page engine · drag corners, swipe, click, or use arrows';
        els.engineState.classList.remove('fallback');
        updatePagePosition();
        return;
      } catch (error) {
        console.warn('Live page update failed; recreating page engine', error);
        forceRecreate = true;
      }
    }

    if (pageFlip) {
      try { pageFlip.destroy(); } catch (_) {}
      pageFlip = null;
    }
    fallbackMode = false;
    els.bookHost.innerHTML = '<div class="book-mount" id="bookMount"></div>';
    els.bookMount = document.getElementById('bookMount');

    if (!canUseEngine) {
      fallbackMode = true;
      fallbackFlipIndex = clamp(desired, 0, state.pages.length + 1);
      visibleFlipIndex = fallbackFlipIndex;
      renderFallbackPage(false);
      els.engineState.textContent = 'Offline reader · local page-turn mode';
      els.engineState.classList.add('fallback');
      updatePagePosition();
      return;
    }

    pages.forEach((page) => els.bookMount.appendChild(page));
    const geometry = calculatePageGeometry();

    try {
      pageFlip = new window.St.PageFlip(els.bookMount, {
        width: geometry.width,
        height: geometry.height,
        size: 'stretch',
        minWidth: geometry.minWidth,
        maxWidth: geometry.maxWidth,
        minHeight: geometry.minHeight,
        maxHeight: geometry.maxHeight,
        drawShadow: true,
        flippingTime: 900,
        usePortrait: true,
        startPage: clamp(desired, 0, state.pages.length + 1),
        autoSize: true,
        maxShadowOpacity: 0.6,
        showCover: true,
        mobileScrollSupport: false,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 20,
        showPageCorners: true,
        disableFlipByClick: false
      });
      pageFlip.on('init', (event) => {
        visibleFlipIndex = Number(event.data?.page ?? desired) || 0;
        updatePagePosition();
      });
      pageFlip.on('flip', (event) => {
        visibleFlipIndex = Number(event.data) || 0;
        updatePagePosition();
        playPageTurn();
      });
      pageFlip.on('changeState', () => {
        els.engineState.textContent = 'Real-page engine · drag corners, swipe, click, or use arrows';
      });
      pageFlip.loadFromHtml(pages);
      els.engineState.textContent = 'Real-page engine · drag corners, swipe, click, or use arrows';
      els.engineState.classList.remove('fallback');
      visibleFlipIndex = clamp(desired, 0, state.pages.length + 1);
      updatePagePosition();
    } catch (error) {
      console.error('StPageFlip initialization failed', error);
      pageFlip = null;
      fallbackMode = true;
      fallbackFlipIndex = clamp(desired, 0, state.pages.length + 1);
      visibleFlipIndex = fallbackFlipIndex;
      renderFallbackPage(false);
      els.engineState.textContent = 'Offline reader · local page-turn mode';
      els.engineState.classList.add('fallback');
      setStatus(`The real-page engine could not initialize, so the safe fallback reader is active: ${error.message}`, true);
    }
  }

  function calculatePageGeometry() {
    const widthIn = clamp(Number(state.size.width) || 6, 2, 20);
    const heightIn = clamp(Number(state.size.height) || 9, 2, 20);
    const baseHeight = 760;
    let height = baseHeight;
    let width = Math.round(baseHeight * (widthIn / heightIn));
    if (width > 760) {
      const scale = 760 / width;
      width = 760;
      height = Math.round(height * scale);
    }
    if (height > 880) {
      const scale = 880 / height;
      height = 880;
      width = Math.round(width * scale);
    }
    width = Math.max(230, width);
    height = Math.max(300, height);
    return {
      width,
      height,
      minWidth: Math.max(160, Math.round(width * 0.48)),
      maxWidth: width,
      minHeight: Math.max(220, Math.round(height * 0.48)),
      maxHeight: height
    };
  }

  function buildBookPageElements() {
    const result = [];
    result.push(makeCoverElement(false));
    state.pages.forEach((page, index) => result.push(makeContentPageElement(page, index)));
    result.push(makeCoverElement(true));
    return result;
  }

  function makeCoverElement(backCover) {
    const outer = document.createElement('div');
    outer.className = `book-page book-cover-page ${backCover ? 'back-cover' : 'front-cover'} cover-${cssToken(state.cover.preset || 'custom')}`;
    outer.dataset.density = 'hard';
    const art = safeAssetUrl(state.cover.artDataUrl || state.cover.artUrl || '');
    const backgroundSize = state.cover.fit === 'stretch' ? '100% 100%' : (state.cover.fit || 'cover');
    outer.style.setProperty('--cover-bg', state.cover.background || '#362a25');
    outer.style.setProperty('--cover-text', state.cover.text || '#fff7e9');
    outer.style.setProperty('--cover-overlay', String(clamp(Number(state.cover.overlay) || 0, 0, 80) / 100));
    outer.style.setProperty('--cover-image', art ? `url("${escapeCssUrl(art)}")` : 'none');
    outer.style.setProperty('--cover-fit', backgroundSize);

    if (backCover) {
      outer.innerHTML = `<div class="cover-inner back-cover-inner"><div class="back-cover-rule"></div><p>${escapeHtml(state.title || 'Untitled Book')}</p>${state.author ? `<small>${escapeHtml(state.author)}</small>` : ''}<div class="back-cover-mark">Interactive edition</div></div>`;
      return outer;
    }

    const titleText = state.cover.title || state.title || 'Untitled Book';
    const subtitleText = state.cover.subtitle || state.subtitle || '';
    const authorText = state.cover.author || state.author || '';
    outer.innerHTML = `<div class="cover-inner">
      <div class="cover-overlay"></div>
      ${state.cover.showText ? `<div class="cover-copy"><h1>${escapeHtml(titleText)}</h1>${subtitleText ? `<p>${escapeHtml(subtitleText)}</p>` : ''}${authorText ? `<small>${escapeHtml(authorText)}</small>` : ''}</div>` : ''}
    </div>`;
    return outer;
  }

  function makeContentPageElement(page, index) {
    const design = { ...state.pageDesign, ...(page.design || {}) };
    const outer = document.createElement('div');
    outer.className = `book-page content-page pattern-${cssToken(design.pattern || 'plain')} font-${cssToken(design.font || 'serif')}`;
    outer.dataset.density = 'soft';
    outer.dataset.pageIndex = String(index);
    outer.style.setProperty('--page-bg', design.background || '#f7efd9');
    outer.style.setProperty('--page-ink', design.ink || '#2b241b');
    outer.style.setProperty('--page-accent', design.accent || '#8b5f32');
    outer.style.setProperty('--page-margin', `${clamp(Number(design.margin) || 8, 3, 15)}%`);
    const texture = safeAssetUrl(design.textureDataUrl || design.textureUrl || '');
    outer.style.setProperty('--page-texture', texture ? `url("${escapeCssUrl(texture)}")` : 'none');
    outer.innerHTML = `<div class="page-surface">
      <div class="page-running-title">${escapeHtml(state.title || '')}</div>
      <div class="page-content-scroll">${renderPageContent(page)}</div>
      ${design.pageNumbers !== false ? `<div class="page-number">${index + 1}</div>` : ''}
    </div>`;
    return outer;
  }

  function renderPageContent(page) {
    if (!page) return '';
    if (page.type === 'blank') return '<div class="blank-page"></div>';
    if (page.type === 'image') return renderImagePage(page);
    if (page.type === 'record') return renderRecordPage(page);
    return renderArticlePage(page);
  }

  function renderArticlePage(page) {
    const title = page.title ? `<h1>${escapeHtml(page.title)}</h1>` : '';
    if (page.html) return `${title}${sanitizeHtml(String(page.html))}`;
    if (Array.isArray(page.blocks)) return `${title}${renderBlocks(page.blocks)}`;
    if (page.text != null) {
      const paragraphs = String(page.text).split(/\n{2,}/).map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`).join('');
      return `${title}${paragraphs}`;
    }
    if (page.data && typeof page.data === 'object') return `${title}${renderRecordValue(page.data, 0)}`;
    return `${title}<p class="empty-state">This page has no content yet.</p>`;
  }

  function renderImagePage(page) {
    const src = safeAssetUrl(page.image || page.imageUrl || page.src || '');
    const caption = page.caption || page.text || '';
    return `${page.title ? `<h1>${escapeHtml(page.title)}</h1>` : ''}
      ${src ? `<figure class="image-page-figure"><img src="${escapeAttr(src)}" alt="${escapeAttr(page.alt || page.title || '')}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>` : '<p class="empty-state">Add an image URL or data URL to this page JSON.</p>'}`;
  }

  function renderRecordPage(page) {
    const title = page.title ? `<h1>${escapeHtml(page.title)}</h1>` : '';
    const data = page.data !== undefined ? page.data : Object.fromEntries(Object.entries(page).filter(([key]) => !['schema', 'id', 'title', 'type', 'design', 'source'].includes(key)));
    return `${title}<div class="record-page">${renderRecordValue(data, 0)}</div>`;
  }

  function renderBlocks(blocks) {
    return blocks.slice(0, 120).map((block) => {
      if (!block || typeof block !== 'object') return `<p>${escapeHtml(String(block ?? ''))}</p>`;
      const type = block.type || 'paragraph';
      if (type === 'heading') {
        const level = clamp(Number(block.level) || 2, 2, 4);
        return `<h${level}>${escapeHtml(block.text || '')}</h${level}>`;
      }
      if (type === 'quote') return `<blockquote>${escapeHtml(block.text || '')}</blockquote>`;
      if (type === 'callout') return `<div class="page-callout">${sanitizeHtml(String(block.html || escapeHtml(block.text || '')))}</div>`;
      if (type === 'divider') return '<hr>';
      if (type === 'code') return `<pre><code>${escapeHtml(block.code || block.text || '')}</code></pre>`;
      if (type === 'image') {
        const src = safeAssetUrl(block.src || block.image || '');
        return src ? `<figure><img src="${escapeAttr(src)}" alt="${escapeAttr(block.alt || '')}">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>` : '';
      }
      if (type === 'list' && Array.isArray(block.items)) {
        const tag = block.ordered ? 'ol' : 'ul';
        return `<${tag}>${block.items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('')}</${tag}>`;
      }
      if (type === 'table' && Array.isArray(block.rows)) {
        return `<div class="page-table-wrap"><table>${block.rows.slice(0, 30).map((row) => `<tr>${(Array.isArray(row) ? row : [row]).slice(0, 10).map((cell) => `<td>${escapeHtml(String(cell ?? ''))}</td>`).join('')}</tr>`).join('')}</table></div>`;
      }
      if (type === 'rawJson') return `<pre><code>${escapeHtml(JSON.stringify(block.data ?? block.value ?? block, null, 2))}</code></pre>`;
      return `<p>${escapeHtml(block.text || block.content || '')}</p>`;
    }).join('');
  }

  function renderRecordValue(value, depth) {
    if (depth > 4) return `<pre class="json-preview">${escapeHtml(truncate(JSON.stringify(value, null, 2), 4000))}</pre>`;
    if (value === null || value === undefined) return '<span class="record-null">—</span>';
    if (typeof value !== 'object') return `<span class="record-value">${escapeHtml(String(value))}</span>`;
    if (Array.isArray(value)) {
      if (!value.length) return '<span class="record-null">None</span>';
      if (value.every((item) => ['string', 'number', 'boolean'].includes(typeof item) || item == null)) {
        return `<ul class="record-list">${value.slice(0, 80).map((item) => `<li>${escapeHtml(String(item ?? '—'))}</li>`).join('')}${value.length > 80 ? `<li>… ${value.length - 80} more</li>` : ''}</ul>`;
      }
      return `<div class="record-array">${value.slice(0, 36).map((item, i) => `<section class="record-array-item"><h3>${escapeHtml(item?.name || item?.title || `Item ${i + 1}`)}</h3>${renderRecordValue(item, depth + 1)}</section>`).join('')}${value.length > 36 ? `<p class="record-overflow">${value.length - 36} additional items are preserved in JSON but hidden in this page preview.</p>` : ''}</div>`;
    }
    const entries = Object.entries(value).filter(([, val]) => val !== '' && val !== null && val !== undefined);
    return `<dl class="record-grid">${entries.slice(0, 90).map(([key, val]) => {
      const heading = humanizeKey(key);
      return `<div class="record-field"><dt>${escapeHtml(heading)}</dt><dd>${renderRecordValue(val, depth + 1)}</dd></div>`;
    }).join('')}${entries.length > 90 ? `<div class="record-field"><dt>More data</dt><dd>${entries.length - 90} additional fields remain in the JSON source.</dd></div>` : ''}</dl>`;
  }

  function renderFallbackPage(animate) {
    const index = clamp(fallbackFlipIndex, 0, state.pages.length + 1);
    let element;
    if (index === 0) element = makeCoverElement(false);
    else if (index === state.pages.length + 1) element = makeCoverElement(true);
    else element = makeContentPageElement(state.pages[index - 1], index - 1);
    element.classList.add('fallback-page');
    if (animate) element.classList.add('fallback-turning');
    els.bookMount.innerHTML = '';
    els.bookMount.appendChild(element);
  }

  function updatePagePosition() {
    const index = clamp(Number(visibleFlipIndex) || 0, 0, state.pages.length + 1);
    if (index === 0) els.pagePosition.textContent = 'Cover';
    else if (index >= state.pages.length + 1) els.pagePosition.textContent = 'Back Cover';
    else els.pagePosition.textContent = `Page ${index} of ${state.pages.length}`;
  }

  function playPageTurn() {
    if (!state.sound.enabled) return;
    const now = performance.now();
    if (now - pageTurnSoundAt < 140) return;
    pageTurnSoundAt = now;
    const audio = els.pageFlipAudio;
    try {
      audio.volume = clamp(Number(state.sound.volume ?? 0.55), 0, 1);
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_) {}
  }

  function sanitizeHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('script, iframe, object, embed, link, meta, base, form').forEach((node) => node.remove());
    template.content.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = String(attr.value || '').trim();
        if (name.startsWith('on') || name === 'srcdoc') node.removeAttribute(attr.name);
        if (['href', 'src', 'xlink:href'].includes(name) && /^\s*(javascript|vbscript):/i.test(value)) node.removeAttribute(attr.name);
      });
      if (node.tagName === 'A') {
        node.setAttribute('rel', 'noopener noreferrer');
        node.setAttribute('target', '_blank');
      }
    });
    return template.innerHTML;
  }

  function safeAssetUrl(value) {
    if (!value) return '';
    const url = String(value).trim();
    if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(url)) return url;
    if (/^blob:/i.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^(assets|json)\/[\w./%+@()-]+$/i.test(url)) return url;
    return '';
  }

  async function imageFileToDataUrl(file, maxDimension, maxChars) {
    if (!file.type.startsWith('image/')) throw new Error('Select an image file.');
    const original = await fileToDataUrl(file);
    const image = await loadImage(original);
    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;
    const ratio = Math.min(1, maxDimension / Math.max(width, height));
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas image processing is unavailable.');
    let quality = 0.9;
    let result = original;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= maxChars) return result;
      quality = Math.max(0.5, quality - 0.08);
      width = Math.max(320, Math.round(width * 0.84));
      height = Math.max(320, Math.round(height * 0.84));
    }
    if (result.length > maxChars) throw new Error('The image is still too large after safe compression. Try a smaller source image.');
    return result;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error || new Error('File could not be read.'));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image could not be decoded.'));
      image.src = src;
    });
  }

  function makeBlankPage(title = 'Untitled Page') {
    return { schema: PAGE_SCHEMA, id: cryptoRandomId('page'), title, type: 'blank', text: '' };
  }

  function touch(saveImmediately = false) {
    state.updatedAt = new Date().toISOString();
    els.autosaveState.textContent = 'Unsaved changes';
    clearTimeout(localSaveTimer);
    if (saveImmediately) {
      saveLocalNow(false);
    } else {
      localSaveTimer = setTimeout(() => saveLocalNow(false), 750);
    }
  }

  async function saveLocalNow(showMessage) {
    try {
      await localPut(LOCAL_KEY, state);
      els.autosaveState.textContent = 'Saved locally';
      if (showMessage) setStatus('Saved the current book locally in this browser.');
    } catch (error) {
      console.error(error);
      els.autosaveState.textContent = 'Local save failed';
      if (showMessage) setStatus(`Local save failed: ${error.message}`, true);
    }
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not available in this browser.'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB could not be opened.'));
    });
    return dbPromise;
  }

  async function localPut(key, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(deepClone(value), key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Local save transaction failed.'));
    });
  }

  async function localGet(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const request = tx.objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Local read failed.'));
    });
  }

  function bindCloudControls() {
    els.backendHealthBtn.addEventListener('click', checkBackendHealth);
    els.cloudLoginBtn.addEventListener('click', cloudLogin);
    els.cloudRegisterBtn.addEventListener('click', cloudRegister);
    els.cloudListBtn.addEventListener('click', listCloudBooks);
    els.cloudSaveBtn.addEventListener('click', saveBookToCloud);
    els.cloudLoadBtn.addEventListener('click', loadSelectedCloudBook);
    els.cloudProjectSelect.addEventListener('change', () => {
      els.cloudLoadBtn.disabled = !els.cloudProjectSelect.value;
    });
    els.cloudPasswordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') cloudLogin();
    });
  }

  async function checkBackendHealth() {
    setBackendStatus('Checking backend…');
    try {
      let result;
      try {
        const response = await fetch(`${API_URL}?action=health&_=${Date.now()}`, { method: 'GET', redirect: 'follow' });
        result = await response.json();
      } catch (_) {
        result = await apiPost('health', {}, '');
      }
      setBackendStatus(result.ok === false ? 'Backend replied with an error' : 'Backend online', result.ok === false);
      setStatus(`LiteraryFriend backend is reachable. Library reference: ${LIBRARY_URL}`);
    } catch (error) {
      setBackendStatus('Backend unavailable', true);
      setStatus(`Backend check failed: ${error.message}`, true);
    }
  }

  async function cloudLogin() {
    const login = els.cloudLoginInput.value.trim();
    const password = els.cloudPasswordInput.value;
    if (!login || !password) {
      setStatus('Enter your LiteraryFriend email/username and password first.', true);
      return;
    }
    try {
      setStatus('Signing in to LiteraryFriend…');
      const result = await apiPost('auth.login', { login, email: login, password }, '');
      acceptCloudAuth(result);
      setStatus('Signed in. You can now save and load interactive books from the supplied LiteraryFriend backend.');
      await listCloudBooks();
    } catch (error) {
      setStatus(`Sign-in failed: ${error.message}`, true);
    }
  }

  async function cloudRegister() {
    const email = els.cloudLoginInput.value.trim();
    const password = els.cloudPasswordInput.value;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('Registration requires an email address in the login field.', true);
      return;
    }
    if (password.length < 10) {
      setStatus('The LiteraryFriend backend requires a password of at least 10 characters.', true);
      return;
    }
    const stem = (email.split('@')[0] || 'reader').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 28) || 'reader';
    const username = `${stem}${String(Date.now()).slice(-4)}`;
    try {
      setStatus('Creating LiteraryFriend account…');
      const result = await apiPost('auth.register', { email, username, password, displayName: stem }, '');
      acceptCloudAuth(result);
      setStatus(`Account created as ${username}. Your browser has stored the returned session token for this tab.`);
      await listCloudBooks();
    } catch (error) {
      setStatus(`Registration failed: ${error.message}`, true);
    }
  }

  function acceptCloudAuth(result) {
    const token = result.token || result.data?.token || result.session?.token || '';
    const user = result.user || result.data?.user || null;
    if (!token) throw new Error('Backend did not return a session token.');
    cloudToken = token;
    cloudUser = user;
    localStorage.setItem(TOKEN_KEY, cloudToken); if (global.LF?.api) { global.LF.api.token = cloudToken; global.LF.api.user = cloudUser; global.LF.api.saveAuth?.(); }
    updateCloudUserLabel();
    setBackendStatus('Signed in');
  }

  async function verifyCloudSession() {
    try {
      const result = await apiPost('auth.me', {}, cloudToken);
      cloudUser = result.user || result.data?.user || result.data || null;
      updateCloudUserLabel();
      setBackendStatus('Signed in');
      await listCloudBooks(false);
    } catch (error) {
      console.warn('Stored cloud session rejected', error);
      cloudToken = '';
      cloudUser = null;
      localStorage.removeItem(TOKEN_KEY); if (global.LF?.api) { global.LF.api.token = ''; global.LF.api.user = null; global.LF.api.saveAuth?.(); }
      updateCloudUserLabel();
    }
  }

  function updateCloudUserLabel() {
    if (!cloudToken) {
      els.cloudUserLabel.textContent = 'Not signed in';
      return;
    }
    els.cloudUserLabel.textContent = cloudUser?.displayName || cloudUser?.username || cloudUser?.email || 'Signed in';
  }

  async function listCloudBooks(report = true) {
    if (!requireCloudToken()) return;
    try {
      if (report) setStatus('Loading cloud book list…');
      const result = await apiPost('projects.list', { type: 'book' }, cloudToken);
      const projects = result.projects || result.data?.projects || result.data || [];
      const list = Array.isArray(projects) ? projects : [];
      els.cloudProjectSelect.innerHTML = '<option value="">Choose a saved book…</option>' + list.map((project) => {
        const id = project.id || project.projectId || '';
        const title = project.title || project.name || 'Untitled book';
        return `<option value="${escapeAttr(id)}">${escapeHtml(title)}</option>`;
      }).join('');
      if (state.cloud.projectId && list.some((p) => (p.id || p.projectId) === state.cloud.projectId)) {
        els.cloudProjectSelect.value = state.cloud.projectId;
      }
      els.cloudLoadBtn.disabled = !els.cloudProjectSelect.value;
      if (report) setStatus(`Found ${list.length} cloud project${list.length === 1 ? '' : 's'}.`);
    } catch (error) {
      setStatus(`Could not list cloud books: ${error.message}`, true);
    }
  }

  async function saveBookToCloud() {
    if (!requireCloudToken()) return;
    try {
      setStatus('Preparing book for cloud save…');
      let projectId = state.cloud.projectId;
      if (!projectId) {
        const created = await apiPost('projects.create', {
          type: 'book',
          title: state.title || 'Untitled Interactive Book',
          description: 'Interactive book created with LiteraryFriend Book Builder.',
          metadata: { app: 'interactive-book-studio', schema: APP_SCHEMA },
          settings: { size: state.size }
        }, cloudToken);
        const project = created.project || created.data?.project || created.data || {};
        projectId = project.id || project.projectId;
        if (!projectId) throw new Error('Backend created the project but did not return a project ID.');
        state.cloud.projectId = projectId;
      } else {
        await apiPost('projects.update', {
          projectId,
          title: state.title || 'Untitled Interactive Book',
          metadata: { app: 'interactive-book-studio', schema: APP_SCHEMA, updatedAt: new Date().toISOString() },
          settings: { size: state.size }
        }, cloudToken);
      }

      const chunks = chunkPagesForCloud(state.pages);
      const previousIds = Array.isArray(state.cloud.pageNodeIds) ? state.cloud.pageNodeIds.slice() : [];
      const newIds = [];
      for (let i = 0; i < chunks.length; i += 1) {
        setStatus(`Saving cloud page chunk ${i + 1} of ${chunks.length}…`);
        const content = JSON.stringify({
          schema: 'literaryfriend.interactive-book.pages-chunk.v1',
          index: i,
          total: chunks.length,
          pages: chunks[i]
        });
        const payload = {
          projectId,
          parentId: '',
          nodeType: 'interactive-book-pages',
          title: `Interactive Book Pages ${String(i + 1).padStart(3, '0')}`,
          sortOrder: i + 100,
          content,
          plainText: `Page chunk ${i + 1} of ${chunks.length}`,
          metadata: { app: 'interactive-book-studio', schema: APP_SCHEMA, chunkIndex: i, chunkCount: chunks.length },
          tags: ['interactive-book', 'page-chunk']
        };
        if (previousIds[i]) payload.id = previousIds[i];
        const result = await apiPost('nodes.save', payload, cloudToken);
        const node = result.node || result.data?.node || result.data || {};
        const id = node.id || node.nodeId || result.id;
        if (!id) throw new Error(`Backend did not return a node ID for page chunk ${i + 1}.`);
        newIds.push(id);
      }

      for (let i = newIds.length; i < previousIds.length; i += 1) {
        try { await apiPost('nodes.delete', { projectId, id: previousIds[i], nodeId: previousIds[i] }, cloudToken); } catch (error) { console.warn('Old page chunk cleanup failed', error); }
      }
      state.cloud.pageNodeIds = newIds;

      const manifest = deepClone(state);
      manifest.pages = [];
      manifest.cloud = { ...state.cloud, projectId, pageNodeIds: newIds };
      const manifestText = JSON.stringify(manifest);
      if (manifestText.length > MAX_CLOUD_NODE_TEXT) {
        throw new Error('The cover/texture metadata is too large for one backend node. Replace it with smaller images and try again.');
      }
      const manifestPayload = {
        projectId,
        parentId: '',
        nodeType: 'interactive-book-manifest',
        title: 'Interactive Book Manifest',
        sortOrder: 1,
        content: manifestText,
        plainText: `${state.title || 'Untitled Interactive Book'} manifest`,
        metadata: { app: 'interactive-book-studio', schema: APP_SCHEMA, role: 'manifest' },
        tags: ['interactive-book', 'manifest']
      };
      if (state.cloud.manifestNodeId) manifestPayload.id = state.cloud.manifestNodeId;
      const manifestResult = await apiPost('nodes.save', manifestPayload, cloudToken);
      const manifestNode = manifestResult.node || manifestResult.data?.node || manifestResult.data || {};
      state.cloud.manifestNodeId = manifestNode.id || manifestNode.nodeId || manifestResult.id || state.cloud.manifestNodeId;
      touch(true);
      await listCloudBooks(false);
      els.cloudProjectSelect.value = projectId;
      els.cloudLoadBtn.disabled = false;
      setStatus(`Saved ${state.pages.length} page${state.pages.length === 1 ? '' : 's'} to LiteraryFriend cloud in ${chunks.length} page chunk${chunks.length === 1 ? '' : 's'}.`);
    } catch (error) {
      console.error(error);
      setStatus(`Cloud save failed: ${error.message}`, true);
    }
  }

  function chunkPagesForCloud(pages) {
    const chunks = [];
    let current = [];
    let currentSize = 120;
    pages.forEach((page, index) => {
      const text = JSON.stringify(page);
      if (text.length > TARGET_CHUNK_TEXT) {
        throw new Error(`Page ${index + 1} (${page.title || 'Untitled'}) is too large for the backend node limit. Split its content across pages.`);
      }
      if (current.length && currentSize + text.length + 2 > TARGET_CHUNK_TEXT) {
        chunks.push(current);
        current = [];
        currentSize = 120;
      }
      current.push(page);
      currentSize += text.length + 2;
    });
    if (current.length || !chunks.length) chunks.push(current);
    return chunks;
  }

  async function loadSelectedCloudBook() {
    if (!requireCloudToken()) return;
    const projectId = els.cloudProjectSelect.value;
    if (!projectId) {
      setStatus('Choose a cloud book first.', true);
      return;
    }
    try {
      setStatus('Loading cloud book structure…');
      const result = await apiPost('projects.get', { projectId }, cloudToken);
      const project = result.project || result.data?.project || result.data || result;
      let nodes = result.nodes || project.nodes || result.data?.nodes || [];
      if (!Array.isArray(nodes) || !nodes.length) {
        const listed = await apiPost('nodes.list', { projectId }, cloudToken);
        nodes = listed.nodes || listed.data?.nodes || listed.data || [];
      }
      if (!Array.isArray(nodes)) nodes = [];
      const manifestCandidates = nodes.filter((node) => node.nodeType === 'interactive-book-manifest' || node.type === 'interactive-book-manifest' || node.metadata?.role === 'manifest');
      let manifestNode = manifestCandidates.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0];
      if (!manifestNode) throw new Error('No interactive-book manifest node was found in this project.');
      manifestNode = await hydrateNodeIfNeeded(projectId, manifestNode);
      const manifestText = manifestNode.content || manifestNode.data?.content || '';
      const loaded = normalizeProject(JSON.parse(manifestText));

      const allPageNodes = nodes.filter((node) => node.nodeType === 'interactive-book-pages' || node.type === 'interactive-book-pages');
      const pageNodeMap = new Map(allPageNodes.map((node) => [node.id || node.nodeId, node]));
      let orderedNodes = [];
      const referencedIds = loaded.cloud?.pageNodeIds || [];
      if (referencedIds.length) {
        orderedNodes = referencedIds.map((id) => pageNodeMap.get(id) || { id }).filter(Boolean);
      } else {
        orderedNodes = allPageNodes.slice().sort((a, b) => {
          const ai = Number(a.metadata?.chunkIndex ?? a.sortOrder ?? 0);
          const bi = Number(b.metadata?.chunkIndex ?? b.sortOrder ?? 0);
          return ai - bi;
        });
      }
      const assembled = [];
      const hydratedIds = [];
      for (let i = 0; i < orderedNodes.length; i += 1) {
        setStatus(`Loading cloud page chunk ${i + 1} of ${orderedNodes.length}…`);
        const node = await hydrateNodeIfNeeded(projectId, orderedNodes[i]);
        const content = node.content || node.data?.content || '';
        if (!content) continue;
        const chunk = JSON.parse(content);
        if (Array.isArray(chunk.pages)) assembled.push(...chunk.pages.map((p, pageIndex) => normalizePage(p, `Page ${assembled.length + pageIndex + 1}`)));
        const id = node.id || node.nodeId;
        if (id) hydratedIds.push(id);
      }
      loaded.pages = assembled.length ? assembled : [makeBlankPage('Page 1')];
      loaded.cloud = {
        ...(loaded.cloud || {}),
        projectId,
        manifestNodeId: manifestNode.id || manifestNode.nodeId || '',
        pageNodeIds: hydratedIds
      };
      state = loaded;
      selectedPageIndex = 0;
      syncAllControls();
      renderPageList();
      selectPage(0, false);
      rebuildBook(false);
      touch(true);
      setStatus(`Loaded “${state.title}” with ${state.pages.length} page${state.pages.length === 1 ? '' : 's'} from LiteraryFriend cloud.`);
    } catch (error) {
      console.error(error);
      setStatus(`Cloud load failed: ${error.message}`, true);
    }
  }

  async function hydrateNodeIfNeeded(projectId, node) {
    if (node?.content) return node;
    const id = node?.id || node?.nodeId;
    if (!id) return node || {};
    const result = await apiPost('nodes.get', { projectId, id, nodeId: id }, cloudToken);
    return result.node || result.data?.node || result.data || result;
  }

  function requireCloudToken() {
    if (cloudToken) return true;
    setStatus('Sign in to the supplied LiteraryFriend backend first.', true);
    return false;
  }

  async function apiPost(action, data, token = cloudToken) {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token: token || '', data: data || {} })
    });
    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch (_) { throw new Error(`Backend returned non-JSON (HTTP ${response.status}).`); }
    if (!response.ok || result.ok === false) {
      throw new Error(result.error?.message || result.message || result.error || `Backend request failed (HTTP ${response.status}).`);
    }
    return result;
  }

  function setBackendStatus(message, isError = false) {
    els.backendStatus.textContent = message;
    els.backendStatus.classList.toggle('error', Boolean(isError));
    els.backendStatus.classList.toggle('ok', !isError && /online|signed/i.test(message));
  }

  function setStatus(message, isError = false) {
    els.statusMessage.textContent = message;
    els.statusMessage.classList.toggle('error', Boolean(isError));
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function validHex(value, fallback) {
    const str = String(value || '');
    return /^#[0-9a-f]{6}$/i.test(str) ? str : fallback;
  }

  function deepClone(value) {
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (_) {}
    }
    return JSON.parse(JSON.stringify(value));
  }

  function cryptoRandomId(prefix) {
    const random = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
    return `${prefix}-${random}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }
  function escapeCssUrl(value) { return String(value).replace(/["\\\n\r]/g, (m) => `\\${m}`); }
  function cssToken(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-'); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function formatNumber(value) { return Number(value).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1'); }
  function capitalize(value) { const str = String(value || ''); return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }
  function stripExtension(name) { return String(name || '').replace(/\.[^.]+$/, ''); }
  function safeFilename(name) { return String(name || 'book').trim().replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'book'; }
  function truncate(text, max) { const str = String(text ?? ''); return str.length > max ? `${str.slice(0, max)}\n…` : str; }
  function humanizeKey(key) { return String(key).replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (m) => m.toUpperCase()); }

  global.LFBookStudio = {
    template: "<section class=\"book-studio-feature\" aria-label=\"LiteraryFriend Book Builder\">\n  <div class=\"book-app-shell\">\n    <header class=\"book-topbar\">\n      <div class=\"book-feature-title\">\n        <img src=\"assets/images/literaryfriend-icon.png\" alt=\"\" class=\"app-icon\">\n        <div><strong>Book Builder</strong><span>Create, design, preview, and export page-flipping books inside LiteraryFriend.</span></div>\n      </div>\n      <div class=\"top-actions\">\n        <span class=\"autosave-state\" id=\"autosaveState\" aria-live=\"polite\">Local draft ready</span>\n        <button class=\"ui-button\" id=\"saveLocalBtn\" type=\"button\">Save Local</button>\n        <button class=\"ui-button\" id=\"exportProjectBtn\" type=\"button\">Export Project JSON</button>\n        <button class=\"ui-button primary\" id=\"readerModeBtn\" type=\"button\" aria-pressed=\"false\">Reader Mode</button>\n      </div>\n    </header>\n    <div class=\"book-workspace\">\n<aside aria-label=\"Book controls\" class=\"control-panel\" id=\"controlPanel\">\n<nav aria-label=\"Editor sections\" class=\"panel-tabs\">\n<button class=\"panel-tab active\" data-panel=\"bookPanel\" type=\"button\">Book</button>\n<button class=\"panel-tab\" data-panel=\"coverPanel\" type=\"button\">Cover</button>\n<button class=\"panel-tab\" data-panel=\"pagesPanel\" type=\"button\">Pages</button>\n<button class=\"panel-tab\" data-panel=\"designPanel\" type=\"button\">Paper</button>\n<button class=\"panel-tab\" data-panel=\"cloudPanel\" type=\"button\">Cloud</button>\n</nav>\n<section class=\"panel-page active\" id=\"bookPanel\">\n<div class=\"panel-heading\">\n<h2>Book Setup</h2>\n<p>Title, trim size, and project import.</p>\n</div>\n<label class=\"field\">Book title\n            <input autocomplete=\"off\" id=\"bookTitleInput\" maxlength=\"180\" type=\"text\"/>\n</label>\n<label class=\"field\">Subtitle\n            <input autocomplete=\"off\" id=\"bookSubtitleInput\" maxlength=\"240\" type=\"text\"/>\n</label>\n<label class=\"field\">Author / creator\n            <input autocomplete=\"off\" id=\"bookAuthorInput\" maxlength=\"160\" type=\"text\"/>\n</label>\n<label class=\"field\">Book size\n            <select id=\"sizePresetSelect\"></select>\n</label>\n<div class=\"two-col\">\n<label class=\"field\">Width (in)\n              <input id=\"customWidthInput\" max=\"20\" min=\"2\" step=\"0.01\" type=\"number\"/>\n</label>\n<label class=\"field\">Height (in)\n              <input id=\"customHeightInput\" max=\"20\" min=\"2\" step=\"0.01\" type=\"number\"/>\n</label>\n</div>\n<div class=\"size-readout\" id=\"sizeReadout\"></div>\n<div class=\"button-stack\">\n<button class=\"ui-button primary\" id=\"newBookBtn\" type=\"button\">New Blank Book</button>\n<button class=\"ui-button\" id=\"loadStarterBtn\" type=\"button\">Load Favorite Short Stories</button>\n<label class=\"file-button\">Import Project JSON\n              <input accept=\".json,application/json\" id=\"projectImportInput\" type=\"file\"/>\n</label>\n</div>\n<div class=\"info-box\">\n            A small starter book made from two favorite short stories is included so the builder opens with real prose instead of old project data. Cover art remains a separate upload.\n          </div>\n</section>\n<section class=\"panel-page\" id=\"coverPanel\">\n<div class=\"panel-heading\">\n<h2>Cover Designer</h2>\n<p>Cover art is uploaded separately from page JSON.</p>\n</div>\n<label class=\"file-button primary-file\">Upload / Replace Cover Art\n            <input accept=\"image/*\" id=\"coverArtInput\" type=\"file\"/>\n</label>\n<button class=\"ui-button danger-lite\" id=\"clearCoverBtn\" type=\"button\">Clear Cover Art</button>\n<label class=\"field\">Cover preset\n            <select id=\"coverPresetSelect\">\n<option value=\"classic\">Classic</option>\n<option value=\"midnight\">Midnight</option>\n<option value=\"retro-pulp\">Retro Pulp</option>\n<option value=\"minimal\">Minimal</option>\n<option value=\"custom\">Custom</option>\n</select>\n</label>\n<label class=\"check-row\"><input id=\"coverShowTextInput\" type=\"checkbox\"/> Show title text over art</label>\n<label class=\"field\">Cover title\n            <input id=\"coverTitleInput\" maxlength=\"180\" type=\"text\"/>\n</label>\n<label class=\"field\">Cover subtitle\n            <input id=\"coverSubtitleInput\" maxlength=\"240\" type=\"text\"/>\n</label>\n<label class=\"field\">Cover author\n            <input id=\"coverAuthorInput\" maxlength=\"160\" type=\"text\"/>\n</label>\n<div class=\"two-col colors-row\">\n<label class=\"field\">Cover color\n              <input id=\"coverBgInput\" type=\"color\"/>\n</label>\n<label class=\"field\">Cover text\n              <input id=\"coverTextInput\" type=\"color\"/>\n</label>\n</div>\n<label class=\"field\">Art fit\n            <select id=\"coverFitSelect\">\n<option value=\"cover\">Fill / crop</option>\n<option value=\"contain\">Fit whole art</option>\n<option value=\"stretch\">Stretch</option>\n</select>\n</label>\n<label class=\"field\">Dark overlay <span id=\"coverOverlayValue\">18%</span>\n<input id=\"coverOverlayInput\" max=\"80\" min=\"0\" step=\"1\" type=\"range\"/>\n</label>\n</section>\n<section class=\"panel-page\" id=\"pagesPanel\">\n<div class=\"panel-heading\">\n<h2>JSON Pages</h2>\n<p>Upload individual pages or a batch of page JSON files.</p>\n</div>\n<label class=\"file-button primary-file\">Upload JSON Page(s)\n            <input accept=\".json,application/json\" id=\"pageFilesInput\" multiple=\"\" type=\"file\"/>\n</label>\n<div class=\"button-grid\">\n<button class=\"ui-button\" id=\"addBlankPageBtn\" type=\"button\">Add Blank</button>\n<button class=\"ui-button\" id=\"downloadPagesBtn\" type=\"button\">Export Pages</button>\n</div>\n<label class=\"check-row\"><input checked=\"\" id=\"naturalSortInput\" type=\"checkbox\"/> Sort imported files by filename</label>\n<div class=\"page-list-toolbar\">\n<span id=\"pageCountLabel\">0 pages</span>\n<button class=\"tiny-button\" id=\"duplicatePageBtn\" type=\"button\">Duplicate</button>\n</div>\n<div class=\"page-list\" id=\"pageList\" role=\"list\"></div>\n</section>\n<section class=\"panel-page\" id=\"designPanel\">\n<div class=\"panel-heading\">\n<h2>Paper &amp; Page Design</h2>\n<p>Global paper styling; a page JSON can override these values.</p>\n</div>\n<label class=\"field\">Paper preset\n            <select id=\"paperPresetSelect\">\n<option value=\"cream\">Book Cream</option>\n<option value=\"white\">Bright White</option>\n<option value=\"parchment\">Parchment</option>\n<option value=\"notebook\">Notebook Grid</option>\n<option value=\"night\">Night Reader</option>\n<option value=\"custom\">Custom</option>\n</select>\n</label>\n<div class=\"two-col colors-row\">\n<label class=\"field\">Paper\n              <input id=\"paperColorInput\" type=\"color\"/>\n</label>\n<label class=\"field\">Ink\n              <input id=\"inkColorInput\" type=\"color\"/>\n</label>\n</div>\n<label class=\"field\">Accent\n            <input id=\"accentColorInput\" type=\"color\"/>\n</label>\n<label class=\"field\">Pattern\n            <select id=\"paperPatternSelect\">\n<option value=\"plain\">Plain</option>\n<option value=\"paper\">Fine Paper</option>\n<option value=\"parchment\">Parchment Grain</option>\n<option value=\"linen\">Linen</option>\n<option value=\"grid\">Grid</option>\n<option value=\"dots\">Dot Grid</option>\n</select>\n</label>\n<label class=\"field\">Reading font\n            <select id=\"pageFontSelect\">\n<option value=\"serif\">Book Serif</option>\n<option value=\"sans\">Clean Sans</option>\n<option value=\"mono\">Typewriter Mono</option>\n</select>\n</label>\n<label class=\"field\">Page margin <span id=\"pageMarginValue\">8%</span>\n<input id=\"pageMarginInput\" max=\"15\" min=\"3\" step=\"0.5\" type=\"range\"/>\n</label>\n<label class=\"field\">Built-in texture\n            <select id=\"builtinTextureSelect\">\n<option value=\"none\">None</option>\n<option value=\"cream\">Cream Fiber</option>\n<option value=\"parchment\">Parchment</option>\n<option value=\"linen\">Linen</option>\n<option value=\"custom\">Custom Upload</option>\n</select>\n</label>\n<label class=\"file-button\">Upload Page Texture / Design\n            <input accept=\"image/*\" id=\"pageTextureInput\" type=\"file\"/>\n</label>\n<button class=\"ui-button danger-lite\" id=\"clearTextureBtn\" type=\"button\">Clear Page Texture</button>\n<label class=\"check-row\"><input checked=\"\" id=\"pageNumbersInput\" type=\"checkbox\"/> Show page numbers</label>\n<label class=\"check-row\"><input checked=\"\" id=\"soundEnabledInput\" type=\"checkbox\"/> Page-flip sound</label>\n<label class=\"field\">Flip sound volume <span id=\"soundVolumeValue\">55%</span>\n<input id=\"soundVolumeInput\" max=\"100\" min=\"0\" step=\"1\" type=\"range\"/>\n</label>\n</section>\n<section class=\"panel-page\" id=\"cloudPanel\">\n<div class=\"panel-heading\">\n<h2>LiteraryFriend Cloud</h2>\n<p>Optional cloud book storage through the same supplied Apps Script deployment used by LiteraryFriend.</p>\n</div>\n<div class=\"backend-chip\" id=\"backendStatus\">Backend not checked</div>\n<button class=\"ui-button\" id=\"backendHealthBtn\" type=\"button\">Check Backend</button>\n<hr class=\"panel-rule\"/>\n<label class=\"field\">Email or username\n            <input autocomplete=\"username\" id=\"cloudLoginInput\" type=\"text\"/>\n</label>\n<label class=\"field\">Password\n            <input autocomplete=\"current-password\" id=\"cloudPasswordInput\" type=\"password\"/>\n</label>\n<div class=\"button-grid\">\n<button class=\"ui-button primary\" id=\"cloudLoginBtn\" type=\"button\">Sign In</button>\n<button class=\"ui-button\" id=\"cloudRegisterBtn\" type=\"button\">Register</button>\n</div>\n<div class=\"cloud-user\" id=\"cloudUserLabel\">Not signed in</div>\n<hr class=\"panel-rule\"/>\n<div class=\"button-grid\">\n<button class=\"ui-button\" id=\"cloudListBtn\" type=\"button\">List Cloud Books</button>\n<button class=\"ui-button primary\" id=\"cloudSaveBtn\" type=\"button\">Save Book to Cloud</button>\n</div>\n<label class=\"field\">Cloud book\n            <select id=\"cloudProjectSelect\">\n<option value=\"\">No cloud project selected</option>\n</select>\n</label>\n<button class=\"ui-button\" id=\"cloudLoadBtn\" type=\"button\">Load Selected Cloud Book</button>\n<div class=\"info-box compact\">\n            Web app endpoint is preconfigured. The supplied Apps Script Library ID/version is documented in <code>json/backend-config.json</code>; browsers call the deployed web-app endpoint directly.\n          </div>\n</section>\n</aside>\n<main class=\"preview-panel\" id=\"previewPanel\">\n<div class=\"preview-toolbar\">\n<div class=\"book-meta-preview\">\n<strong id=\"previewTitle\">Untitled Book</strong>\n<span id=\"previewTrim\">6 \u00d7 9 in</span>\n</div>\n<div aria-live=\"polite\" class=\"engine-state\" id=\"engineState\">Loading page engine\u2026</div>\n</div>\n<section aria-label=\"Interactive book preview\" class=\"book-stage\" id=\"bookStage\">\n<div class=\"stage-surface\">\n<div class=\"book-host\" id=\"bookHost\">\n<div class=\"book-mount\" id=\"bookMount\"></div>\n</div>\n</div>\n</section>\n<div aria-label=\"Book navigation\" class=\"reader-controls\" role=\"group\">\n<button aria-label=\"Go to cover\" class=\"nav-button\" id=\"firstPageBtn\" type=\"button\">|\u2039</button>\n<button aria-label=\"Previous page\" class=\"nav-button\" id=\"prevPageBtn\" type=\"button\">\u2039</button>\n<div class=\"page-position\" id=\"pagePosition\">Cover</div>\n<button aria-label=\"Next page\" class=\"nav-button\" id=\"nextPageBtn\" type=\"button\">\u203a</button>\n<button aria-label=\"Go to back cover\" class=\"nav-button\" id=\"lastPageBtn\" type=\"button\">\u203a|</button>\n<button aria-label=\"Toggle page flip sound\" aria-pressed=\"true\" class=\"nav-button sound-toggle\" id=\"soundToggleBtn\" type=\"button\">\ud83d\udd0a</button>\n</div>\n<div class=\"reader-tip\">Drag a page corner, click a page edge, swipe, or use \u2190 / \u2192. Covers use a firmer hard-page turn.</div>\n</main>\n<aside aria-label=\"Current page editor\" class=\"inspector-panel\" id=\"inspectorPanel\">\n<div class=\"inspector-heading\">\n<div>\n<h2>Page Editor</h2>\n<p>Edit the selected page as JSON.</p>\n</div>\n<span class=\"selected-page-badge\" id=\"selectedPageBadge\">No page</span>\n</div>\n<label class=\"field\">Page title\n          <input id=\"pageTitleInput\" maxlength=\"200\" type=\"text\"/>\n</label>\n<label class=\"field\">Page type\n          <select id=\"pageTypeSelect\">\n<option value=\"article\">Article</option>\n<option value=\"image\">Image</option>\n<option value=\"record\">Structured Record</option>\n<option value=\"blank\">Blank</option>\n</select>\n</label>\n<label class=\"field grow-field\">Page JSON\n          <textarea aria-label=\"Current page JSON\" id=\"pageJsonEditor\" spellcheck=\"false\"></textarea>\n</label>\n<div class=\"button-grid inspector-actions\">\n<button class=\"ui-button primary\" id=\"applyPageJsonBtn\" type=\"button\">Apply JSON</button>\n<button class=\"ui-button\" id=\"downloadPageBtn\" type=\"button\">Download Page</button>\n<button class=\"ui-button danger\" id=\"deletePageBtn\" type=\"button\">Delete</button>\n</div>\n<div class=\"schema-help\">\n<strong>Accepted page content</strong>\n<code>html</code>, <code>text</code>, <code>image</code>, <code>blocks[]</code>, or <code>data</code>. Page-specific <code>design</code> values override global paper settings.\n        </div>\n</aside>\n</div>\n    <footer class=\"statusbar\">\n<span id=\"statusMessage\">Ready.</span>\n<span>JSON-driven \u2022 separate cover art \u2022 real page fold preview \u2022 local + optional backend storage</span>\n</footer>\n  </div>\n  <audio id=\"pageFlipAudio\" src=\"assets/audio/page-flip.wav\" preload=\"auto\"></audio>\n</section>",
    async mount(container) {
      if (!container) throw new Error('Book Builder container is required.');
      container.innerHTML = this.template;
      const root = container.querySelector('.book-studio-feature');
      await init(root);
      return root;
    }
  };
})(window);
