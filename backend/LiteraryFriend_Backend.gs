/**
 * LiteraryFriend Unified Backend
 * Version: 2.0.0
 * Generated: 2026-08-08
 *
 * ONE-FILE GOOGLE APPS SCRIPT BACKEND
 * -----------------------------------
 * Purpose:
 *   LiteraryFriend is a GitHub-independent backend for organizing, creating,
 *   editing, annotating, searching, backing up, and maintaining creative work:
 *   books, games, settings, campaigns, fantasy languages, characters, places,
 *   timelines, research, notes, outlines, plot-hole tracking, and attachments.
 *
 * Required Google Drive root:
 *   https://drive.google.com/drive/folders/1rPwRvEZYp6Pqs9zXMaFLC_KYkyCgfii-
 *
 * Required root layout:
 *   LiteraryFriend root
 *   ├── Backend
 *   │   ├── LiteraryFriend Backend Database (Google Sheet)
 *   │   ├── Backups
 *   │   └── System Exports
 *   └── Users
 *       └── <userId>
 *           ├── Projects
 *           ├── Notes
 *           ├── Files
 *           ├── Imports
 *           ├── Exports
 *           └── Trash
 *
 * Deployment:
 *   1. Create a standalone Google Apps Script project.
 *   2. Paste this entire file into Code.gs.
 *   3. Run LITERARYFRIEND_SETUP() once and authorize.
 *   4. Optionally run LITERARYFRIEND_CONFIGURE({...}).
 *   5. Deploy as Web App, Execute as Me, access appropriate for your app.
 *
 * API:
 *   POST JSON:
 *     { action: "auth.login", token: "...", data: {...} }
 *
 *   GET:
 *     ?action=health
 *     ?action=manifest
 *     ?action=client.config
 *
 * Important boundaries:
 *   - Password visibility is a frontend input feature. The backend never returns passwords.
 *   - Browser speechSynthesis/read-aloud is a frontend feature. This backend stores reading
 *     preferences, text, transcripts, and reading-position state.
 *   - Apps Script has no built-in SMS gateway. Multiple phone numbers are supported as
 *     recovery contacts; SMS verification works when an optional webhook is configured.
 *   - Email recovery uses MailApp and is functional after Apps Script authorization.
 *   - Recovery-code batches can be regenerated whenever an authenticated user needs them.
 *     Only hashes are stored. Generating a new batch invalidates unused codes from old batches.
 *   - This backend does not require GitHub. A frontend may live on GitHub Pages, another host,
 *     or be packaged as an installable PWA/native wrapper while using this backend.
 */

const LF = Object.freeze({
  APP_NAME: 'LiteraryFriend',
  SHORT_NAME: 'LiteraryFriend',
  VERSION: '2.0.0',
  API_VERSION: '2026-08-08-v2',
  ROOT_FOLDER_ID: '1rPwRvEZYp6Pqs9zXMaFLC_KYkyCgfii-',
  BACKEND_FOLDER_NAME: 'Backend',
  USERS_FOLDER_NAME: 'Users',
  DATABASE_NAME: 'LiteraryFriend Backend Database',
  BACKUPS_FOLDER_NAME: 'Backups',
  SYSTEM_EXPORTS_FOLDER_NAME: 'System Exports',
  SESSION_DAYS: 30,
  PASSWORD_MIN: 10,
  PASSWORD_MAX: 200,
  PBKDF2_ITERATIONS: 12000,
  LOCK_WAIT_MS: 28000,
  EMAIL_CODE_TTL_MINUTES: 15,
  EMAIL_CODE_RESEND_SECONDS: 60,
  EMAIL_CODE_MAX_ATTEMPTS: 10,
  RECOVERY_CODES_PER_BATCH: 12,
  RECOVERY_CODE_LENGTH: 12,
  MAX_NOTE_CHARS: 250000,
  MAX_TEXT_CHARS: 750000,
  MAX_JSON_CHARS: 1000000,
  MAX_SEARCH_RESULTS: 250,
  MAX_LIST_RESULTS: 500,
  MAX_UPLOAD_BYTES: 20 * 1024 * 1024,
  SHEET_SAFE_CHARS: 42000,
  MAX_BATCH_FILES: 24,
  MAX_BATCH_MUTATIONS: 250,
  MAX_EDITOR_RESULTS: 250,
  MAX_AI_CONTEXT_CHARS: 600000,
  TWO_FACTOR_TTL_MINUTES: 10,
  OAUTH_STATE_TTL_MINUTES: 15,
  GOOGLE_DRIVE_SCOPE: 'https://www.googleapis.com/auth/drive.file',
  DEFAULT_PROJECT_TYPES: [
    'book','novel','novella','short-story','book-series','anthology','screenplay',
    'comic','graphic-novel','story','ttrpg','campaign','board-game','video-game','mmorpg',
    'transmedia-universe','multi-platform-world','worldbuilding','fantasy-language',
    'constructed-language','research','character-collection','setting','other'
  ],
  BOOK_FORMATS: {
    paperback: [
      {id:'digest-us-trade',name:'Digest / US Trade',widthIn:5.5,heightIn:8.5},
      {id:'standard-trade',name:'Standard Trade',widthIn:6,heightIn:9},
      {id:'small-trade',name:'Small Trade',widthIn:5,heightIn:8},
      {id:'mass-market',name:'Mass Market',widthIn:4.25,heightIn:6.87}
    ],
    hardcover: [
      {id:'standard-fiction',name:'Standard Fiction / Novel',widthIn:6,heightIn:9},
      {id:'royal',name:'Royal',widthIn:6.14,heightIn:9.21},
      {id:'compact-novella',name:'Compact / Novella',widthIn:5.5,heightIn:8.5},
      {id:'textbook-7x10',name:'Textbook / Manual 7 x 10',widthIn:7,heightIn:10},
      {id:'textbook-letter',name:'Textbook / Manual 8.5 x 11',widthIn:8.5,heightIn:11},
      {id:'picture-portrait',name:'Children’s Picture Book 8 x 10',widthIn:8,heightIn:10},
      {id:'picture-landscape',name:'Children’s Picture Book 10 x 8',widthIn:10,heightIn:8},
      {id:'coffee-table-10',name:'Coffee Table / Art 10 x 10',widthIn:10,heightIn:10},
      {id:'coffee-table-12',name:'Coffee Table / Art 12 x 12',widthIn:12,heightIn:12}
    ]
  }
});

const LF_SHEETS = Object.freeze({
  USERS: [
    'id','usernameKey','username','primaryEmailKey','primaryEmail','displayName',
    'passwordHash','passwordSalt','passwordIterations','googleSub','emailVerified',
    'status','settingsJson','preferencesJson','userFolderId','createdAt','updatedAt','lastLoginAt',
    'twoFactorJson'
  ],
  SESSIONS: [
    'id','tokenHash','userId','deviceId','deviceName','platform','userAgent',
    'createdAt','expiresAt','lastSeenAt','revokedAt'
  ],
  AUTH_CODES: [
    'id','userId','destinationType','destinationKey','purpose','codeHash',
    'createdAt','expiresAt','usedAt','attempts'
  ],
  RECOVERY_CONTACTS: [
    'id','userId','kind','valueKey','value','label','verified','isPrimary',
    'createdAt','updatedAt','verifiedAt'
  ],
  RECOVERY_CODES: [
    'id','userId','batchId','codeHash','createdAt','usedAt','revokedAt'
  ],
  PROJECTS: [
    'id','userId','type','title','slug','description','status','parentProjectId',
    'driveFolderId','metadataJson','settingsJson','createdAt','updatedAt','archivedAt'
  ],
  NODES: [
    'id','userId','projectId','parentId','nodeType','title','slug','sortOrder',
    'content','plainText','metadataJson','tagsJson','linksJson','driveFileId','contentStorageJson',
    'createdAt','updatedAt','deletedAt'
  ],
  NOTES: [
    'id','userId','projectId','folderId','title','content','plainText','format',
    'tagsJson','pinned','locked','color','source','metadataJson','contentStorageJson',
    'createdAt','updatedAt','deletedAt'
  ],
  NOTE_FOLDERS: [
    'id','userId','projectId','parentFolderId','name','sortOrder','createdAt','updatedAt','deletedAt'
  ],
  ATTACHMENTS: [
    'id','userId','projectId','ownerType','ownerId','name','mimeType','size',
    'driveFileId','webViewUrl','description','metadataJson','createdAt','deletedAt'
  ],
  IMPORTS: [
    'id','userId','projectId','name','sourceType','driveFileId','status',
    'metadataJson','createdAt','updatedAt'
  ],
  EXPORTS: [
    'id','userId','projectId','exportType','name','driveFileId','status',
    'metadataJson','createdAt','updatedAt'
  ],
  PLOT_ISSUES: [
    'id','userId','projectId','title','description','issueType','severity','status',
    'relatedNodeIdsJson','evidenceJson','suggestion','resolution','metadataJson',
    'createdAt','updatedAt','resolvedAt'
  ],
  TIMELINE_EVENTS: [
    'id','userId','projectId','title','description','startValue','endValue','calendar',
    'era','sortKey','participantIdsJson','locationIdsJson','tagsJson','metadataJson',
    'createdAt','updatedAt','deletedAt'
  ],
  ENTITIES: [
    'id','userId','projectId','entityType','name','aliasesJson','description',
    'attributesJson','relationshipsJson','tagsJson','driveFileId',
    'createdAt','updatedAt','deletedAt'
  ],
  LANGUAGES: [
    'id','userId','projectId','name','code','description','phonologyJson','grammarJson',
    'orthographyJson','settingsJson','createdAt','updatedAt','deletedAt'
  ],
  LEXICON: [
    'id','userId','projectId','languageId','word','normalizedWord','partOfSpeech',
    'definition','pronunciation','etymology','formsJson','tagsJson','notes',
    'createdAt','updatedAt','deletedAt'
  ],
  READING_STATE: [
    'id','userId','projectId','targetType','targetId','position','speed','voice',
    'settingsJson','updatedAt'
  ],
  SAVED_SEARCHES: [
    'id','userId','projectId','name','query','filtersJson','createdAt','updatedAt'
  ],
  ACTIVITY: [
    'id','userId','action','targetType','targetId','projectId','detailsJson','createdAt'
  ],
  TWO_FACTOR_CHALLENGES: [
    'id','userId','challengeHash','method','destinationKey','codeHash','createdAt','expiresAt',
    'attempts','usedAt','metadataJson'
  ],
  OAUTH_STATES: [
    'id','userId','stateHash','provider','purpose','returnUrl','createdAt','expiresAt','usedAt','metadataJson'
  ],
  DRIVE_LINKS: [
    'id','userId','provider','accountEmail','tokenKey','scope','rootFolderId','status','metadataJson',
    'createdAt','updatedAt','lastUsedAt','revokedAt'
  ],
  FILE_INDEX: [
    'id','userId','projectId','attachmentId','name','extension','mimeType','category','logicalType',
    'sourceHash','extractedText','textDriveFileId','textCharacters','nodeIdsJson','metadataJson','status','createdAt','updatedAt'
  ],
  REVISION_SNAPSHOTS: [
    'id','userId','projectId','targetType','targetId','label','contentJson','contentDriveFileId','sourceAction','createdAt'
  ],
  STORY_FACTS: [
    'id','userId','projectId','subjectType','subjectId','predicate','valueJson','truthStatus','scope',
    'validFrom','validUntil','sourceType','sourceId','sourceQuote','confidence','status','metadataJson',
    'createdAt','updatedAt'
  ],
  KNOWLEDGE_LEDGER: [
    'id','userId','projectId','characterId','factId','knowledgeState','learnedAtEventId','learnedAtNodeId',
    'sourceCharacterId','reliability','metadataJson','createdAt','updatedAt'
  ],
  PLOT_THREADS: [
    'id','userId','projectId','name','threadType','status','importance','introducedNodeId','lastTouchedNodeId',
    'resolutionNodeId','beatNodeIdsJson','metadataJson','createdAt','updatedAt'
  ],
  CAUSAL_LINKS: [
    'id','userId','projectId','fromType','fromId','toType','toId','relation','required','confidence','notes',
    'metadataJson','createdAt','updatedAt'
  ],
  WORLD_RULES: [
    'id','userId','projectId','ruleType','name','statement','conditionsJson','exceptionsJson','status',
    'sourceIdsJson','metadataJson','createdAt','updatedAt'
  ],
  ENTITY_MENTIONS: [
    'id','userId','projectId','entityId','nodeId','startOffset','endOffset','quote','context','metadataJson','createdAt'
  ],
  PROJECT_RELATIONS: [
    'id','userId','parentProjectId','childProjectId','relationType','canonScope','chronologyJson','metadataJson',
    'createdAt','updatedAt','deletedAt'
  ],
  EDITOR_RUNS: [
    'id','userId','projectId','editorType','scopeType','scopeId','provider','status','summary','resultsJson',
    'createdAt','updatedAt'
  ],
  AI_JOBS: [
    'id','userId','projectId','jobType','provider','status','inputHash','requestJson','resultJson','error',
    'createdAt','updatedAt'
  ],
  MERGE_JOBS: [
    'id','userId','projectId','name','status','inputImportIdsJson','planJson','planDriveFileId','resultJson','resultDriveFileId','snapshotId',
    'createdAt','updatedAt'
  ],
  BOOKS: [
    'id','userId','projectId','title','subtitle','authorName','bookType','seriesName','seriesNumber','language',
    'isbn','description','metadataJson','createdAt','updatedAt','deletedAt'
  ],
  BOOK_EDITIONS: [
    'id','userId','projectId','bookId','name','binding','trimWidthIn','trimHeightIn','orientation','bleedIn',
    'gutterIn','marginsJson','typographyJson','pageStyleJson','frontMatterJson','backMatterJson','settingsJson',
    'createdAt','updatedAt','deletedAt'
  ],
  BOOK_CHAPTERS: [
    'id','userId','projectId','bookId','nodeId','chapterNumber','title','subtitle','sortOrder','povEntityId',
    'status','wordCount','formatJson','metadataJson','createdAt','updatedAt','deletedAt'
  ],
  ART_PROJECTS: [
    'id','userId','projectId','bookId','name','width','height','dpi','canvasJson','layersJson','paletteJson',
    'toolSettingsJson','backgroundJson','metadataJson','stateDriveFileId','createdAt','updatedAt','deletedAt'
  ]
});

/* ========================================================================== */
/* PUBLIC SETUP / CONFIGURATION                                                */
/* ========================================================================== */

function setup() {
  return LITERARYFRIEND_SETUP();
}

function LITERARYFRIEND_SETUP() {
  const lock = LockService.getScriptLock();
  lock.waitLock(LF.LOCK_WAIT_MS);
  try {
    const props = PropertiesService.getScriptProperties();
    const root = DriveApp.getFolderById(LF.ROOT_FOLDER_ID);
    const backend = lf_getOrCreateChildFolder_(root, LF.BACKEND_FOLDER_NAME);
    const users = lf_getOrCreateChildFolder_(root, LF.USERS_FOLDER_NAME);
    const backups = lf_getOrCreateChildFolder_(backend, LF.BACKUPS_FOLDER_NAME);
    const systemExports = lf_getOrCreateChildFolder_(backend, LF.SYSTEM_EXPORTS_FOLDER_NAME);

    let ss;
    let dbId = props.getProperty('LF_DB_ID');
    if (dbId) {
      try { ss = SpreadsheetApp.openById(dbId); } catch (err) { ss = null; }
    }
    if (!ss) {
      const files = backend.getFilesByName(LF.DATABASE_NAME);
      if (files.hasNext()) {
        const f = files.next();
        try { ss = SpreadsheetApp.openById(f.getId()); } catch (err2) { ss = null; }
      }
    }
    if (!ss) {
      ss = SpreadsheetApp.create(LF.DATABASE_NAME);
      const file = DriveApp.getFileById(ss.getId());
      file.moveTo(backend);
    }

    props.setProperty('LF_DB_ID', ss.getId());
    props.setProperty('LF_ROOT_FOLDER_ID', root.getId());
    props.setProperty('LF_BACKEND_FOLDER_ID', backend.getId());
    props.setProperty('LF_USERS_FOLDER_ID', users.getId());
    props.setProperty('LF_BACKUPS_FOLDER_ID', backups.getId());
    props.setProperty('LF_SYSTEM_EXPORTS_FOLDER_ID', systemExports.getId());

    Object.keys(LF_SHEETS).forEach(function(name) {
      lf_ensureSheet_(ss, name, LF_SHEETS[name]);
    });

    if (!props.getProperty('LF_SERVER_SECRET')) props.setProperty('LF_SERVER_SECRET', lf_randomToken_(64));
    if (!props.getProperty('LF_PASSWORD_PEPPER')) props.setProperty('LF_PASSWORD_PEPPER', lf_randomToken_(64));
    if (!props.getProperty('LF_APP_BASE_URL')) props.setProperty('LF_APP_BASE_URL', '');
    if (!props.getProperty('LF_GOOGLE_CLIENT_ID')) props.setProperty('LF_GOOGLE_CLIENT_ID', '');
    if (!props.getProperty('LF_SUPPORT_EMAIL')) props.setProperty('LF_SUPPORT_EMAIL', '');
    if (!props.getProperty('LF_SMS_WEBHOOK_URL')) props.setProperty('LF_SMS_WEBHOOK_URL', '');
    if (!props.getProperty('LF_SMS_WEBHOOK_SECRET')) props.setProperty('LF_SMS_WEBHOOK_SECRET', '');
    if (!props.getProperty('LF_GOOGLE_OAUTH_CLIENT_ID')) props.setProperty('LF_GOOGLE_OAUTH_CLIENT_ID', '');
    if (!props.getProperty('LF_GOOGLE_OAUTH_CLIENT_SECRET')) props.setProperty('LF_GOOGLE_OAUTH_CLIENT_SECRET', '');
    if (!props.getProperty('LF_AI_WEBHOOK_URL')) props.setProperty('LF_AI_WEBHOOK_URL', '');
    if (!props.getProperty('LF_AI_WEBHOOK_SECRET')) props.setProperty('LF_AI_WEBHOOK_SECRET', '');
    if (!props.getProperty('LF_AI_PROVIDER_LABEL')) props.setProperty('LF_AI_PROVIDER_LABEL', 'Configured AI');
    if (!props.getProperty('LF_IMAGE_AI_WEBHOOK_URL')) props.setProperty('LF_IMAGE_AI_WEBHOOK_URL', '');

    lf_installMaintenanceTrigger_();

    return {
      ok: true,
      app: LF.APP_NAME,
      version: LF.VERSION,
      rootFolderId: root.getId(),
      rootFolderUrl: root.getUrl(),
      backendFolderId: backend.getId(),
      backendFolderUrl: backend.getUrl(),
      usersFolderId: users.getId(),
      usersFolderUrl: users.getUrl(),
      databaseId: ss.getId(),
      databaseUrl: ss.getUrl(),
      sheets: Object.keys(LF_SHEETS),
      message: 'LiteraryFriend backend is ready.'
    };
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function LITERARYFRIEND_CONFIGURE(options) {
  options = options || {};
  const props = PropertiesService.getScriptProperties();
  const map = {
    appBaseUrl: 'LF_APP_BASE_URL',
    googleClientId: 'LF_GOOGLE_CLIENT_ID',
    supportEmail: 'LF_SUPPORT_EMAIL',
    smsWebhookUrl: 'LF_SMS_WEBHOOK_URL',
    smsWebhookSecret: 'LF_SMS_WEBHOOK_SECRET',
    googleOAuthClientId: 'LF_GOOGLE_OAUTH_CLIENT_ID',
    googleOAuthClientSecret: 'LF_GOOGLE_OAUTH_CLIENT_SECRET',
    aiWebhookUrl: 'LF_AI_WEBHOOK_URL',
    aiWebhookSecret: 'LF_AI_WEBHOOK_SECRET',
    aiProviderLabel: 'LF_AI_PROVIDER_LABEL',
    imageAiWebhookUrl: 'LF_IMAGE_AI_WEBHOOK_URL'
  };
  Object.keys(map).forEach(function(k) {
    if (Object.prototype.hasOwnProperty.call(options, k)) {
      props.setProperty(map[k], String(options[k] || '').trim());
    }
  });
  return LITERARYFRIEND_CONFIGURATION();
}

function LITERARYFRIEND_CONFIGURATION() {
  const p = PropertiesService.getScriptProperties();
  return {
    ok: true,
    app: LF.APP_NAME,
    version: LF.VERSION,
    rootFolderId: p.getProperty('LF_ROOT_FOLDER_ID') || LF.ROOT_FOLDER_ID,
    backendFolderId: p.getProperty('LF_BACKEND_FOLDER_ID') || '',
    usersFolderId: p.getProperty('LF_USERS_FOLDER_ID') || '',
    databaseId: p.getProperty('LF_DB_ID') || '',
    appBaseUrl: p.getProperty('LF_APP_BASE_URL') || '',
    googleClientId: p.getProperty('LF_GOOGLE_CLIENT_ID') || '',
    supportEmail: p.getProperty('LF_SUPPORT_EMAIL') || '',
    smsWebhookConfigured: !!p.getProperty('LF_SMS_WEBHOOK_URL'),
    googleDriveOAuthConfigured: !!(p.getProperty('LF_GOOGLE_OAUTH_CLIENT_ID') && p.getProperty('LF_GOOGLE_OAUTH_CLIENT_SECRET')),
    aiConfigured: !!p.getProperty('LF_AI_WEBHOOK_URL'),
    imageAiConfigured: !!(p.getProperty('LF_IMAGE_AI_WEBHOOK_URL') || p.getProperty('LF_AI_WEBHOOK_URL')),
    aiProviderLabel: p.getProperty('LF_AI_PROVIDER_LABEL') || 'Configured AI',
    serverSecretConfigured: !!p.getProperty('LF_SERVER_SECRET'),
    passwordPepperConfigured: !!p.getProperty('LF_PASSWORD_PEPPER')
  };
}

/* ========================================================================== */
/* HTTP ENTRYPOINTS                                                            */
/* ========================================================================== */

function doGet(e) {
  try {
    const req = lf_parseRequest_(e);
    const action = String(req.action || req.route || 'launcher').trim().toLowerCase();

    if (action === 'launcher' || action === 'app') return lf_launcher_();
    if (action === 'manifest' || action === 'manifest.webmanifest') return lf_manifestResponse_();
    if (action === 'health') return lf_jsonOutput_(lf_health_());
    if (action === 'client.config' || action === 'client-config') return lf_jsonOutput_(lf_clientConfig_());
    if (action === 'icon.svg') return lf_iconResponse_();
    if (action === 'oauth.google.drive.callback') return lf_driveOAuthCallbackResponse_(req);

    return lf_jsonOutput_(lf_dispatch_(req));
  } catch (err) {
    return lf_jsonOutput_(lf_errorEnvelope_(err));
  }
}

function doPost(e) {
  try {
    const req = lf_parseRequest_(e);
    return lf_jsonOutput_(lf_dispatch_(req));
  } catch (err) {
    return lf_jsonOutput_(lf_errorEnvelope_(err));
  }
}

function lf_dispatch_(req) {
  const action = String(req.action || '').trim().toLowerCase();
  const data = lf_data_(req);

  if (!action) throw lf_error_('MISSING_ACTION', 'An action is required.', 400);

  const publicActions = {
    'health': true,
    'manifest': true,
    'client.config': true,
    'auth.register': true,
    'auth.login': true,
    'auth.google': true,
    'auth.password.reset.request': true,
    'auth.password.reset.complete': true,
    'auth.recovery.code.login': true,
    'auth.contact.code.verify': true,
    'auth.2fa.verify': true,
    'auth.2fa.resend': true
  };

  if (action === 'health') return lf_health_();
  if (action === 'manifest') return {ok:true, manifest:lf_manifest_()};
  if (action === 'client.config') return lf_clientConfig_();

  if (action === 'auth.register') return lf_authRegister_(data, req);
  if (action === 'auth.login') return lf_authLogin_(data, req);
  if (action === 'auth.google') return lf_authGoogle_(data, req);
  if (action === 'auth.password.reset.request') return lf_passwordResetRequest_(data);
  if (action === 'auth.password.reset.complete') return lf_passwordResetComplete_(data, req);
  if (action === 'auth.recovery.code.login') return lf_recoveryCodeLogin_(data, req);
  if (action === 'auth.contact.code.verify') return lf_recoveryContactVerifyCode_(data, req);
  if (action === 'auth.2fa.verify') return lf_twoFactorVerifyLogin_(data, req);
  if (action === 'auth.2fa.resend') return lf_twoFactorResendPublic_(data);

  let auth = null;
  if (!publicActions[action]) auth = lf_requireAuth_(req);

  switch (action) {
    case 'auth.logout': return lf_authLogout_(auth);
    case 'auth.me': return lf_authMe_(auth);
    case 'auth.password.change': return lf_passwordChange_(auth, data);
    case 'auth.sessions.list': return lf_sessionsList_(auth);
    case 'auth.sessions.revoke': return lf_sessionsRevoke_(auth, data);
    case 'auth.sessions.revoke.others': return lf_sessionsRevokeOthers_(auth);
    case 'auth.recovery.codes.generate': return lf_recoveryCodesGenerate_(auth);
    case 'auth.recovery.contacts.list': return lf_recoveryContactsList_(auth);
    case 'auth.recovery.contacts.add': return lf_recoveryContactAdd_(auth, data);
    case 'auth.recovery.contacts.remove': return lf_recoveryContactRemove_(auth, data);
    case 'auth.recovery.contacts.sendcode': return lf_recoveryContactSendCode_(auth, data);
    case 'auth.2fa.status': return lf_twoFactorStatus_(auth);
    case 'auth.2fa.enable': return lf_twoFactorEnable_(auth, data);
    case 'auth.2fa.disable': return lf_twoFactorDisable_(auth, data);
    case 'auth.2fa.resend': return lf_twoFactorResend_(auth, data);
    case 'auth.google.link': return lf_googleAccountLink_(auth, data);

    case 'drive.link.start': return lf_driveLinkStart_(auth, data);
    case 'drive.link.status': return lf_driveLinkStatus_(auth);
    case 'drive.link.revoke': return lf_driveLinkRevoke_(auth, data);
    case 'drive.link.setroot': return lf_driveLinkSetRoot_(auth, data);

    case 'profile.get': return {ok:true, user:lf_privateUser_(auth.user)};
    case 'profile.update': return lf_profileUpdate_(auth, data);
    case 'settings.get': return lf_settingsGet_(auth);
    case 'settings.update': return lf_settingsUpdate_(auth, data);

    case 'projects.create': return lf_projectCreate_(auth, data);
    case 'projects.update': return lf_projectUpdate_(auth, data);
    case 'projects.get': return lf_projectGet_(auth, data);
    case 'projects.list': return lf_projectsList_(auth, data);
    case 'projects.archive': return lf_projectArchive_(auth, data);
    case 'projects.restore': return lf_projectRestore_(auth, data);
    case 'projects.switch': return lf_projectSwitch_(auth, data);
    case 'projects.workspace': return lf_projectWorkspace_(auth, data);
    case 'projects.relations.save': return lf_projectRelationSave_(auth, data);
    case 'projects.relations.list': return lf_projectRelationsList_(auth, data);
    case 'projects.relations.delete': return lf_projectRelationDelete_(auth, data);

    case 'nodes.save': return lf_nodeSave_(auth, data);
    case 'nodes.get': return lf_nodeGet_(auth, data);
    case 'nodes.list': return lf_nodesList_(auth, data);
    case 'nodes.move': return lf_nodeMove_(auth, data);
    case 'nodes.delete': return lf_nodeDelete_(auth, data);
    case 'nodes.restore': return lf_nodeRestore_(auth, data);

    case 'notes.save':
    case 'notes.quickcapture': return lf_noteSave_(auth, data);
    case 'notes.get': return lf_noteGet_(auth, data);
    case 'notes.list': return lf_notesList_(auth, data);
    case 'notes.search': return lf_search_(auth, Object.assign({}, data, {types:['note']}));
    case 'notes.delete': return lf_noteDelete_(auth, data);
    case 'notes.restore': return lf_noteRestore_(auth, data);
    case 'notes.recentlydeleted': return lf_notesRecentlyDeleted_(auth, data);
    case 'notes.folders.create': return lf_noteFolderCreate_(auth, data);
    case 'notes.folders.update': return lf_noteFolderUpdate_(auth, data);
    case 'notes.folders.list': return lf_noteFoldersList_(auth, data);
    case 'notes.folders.delete': return lf_noteFolderDelete_(auth, data);
    case 'notes.tags.list': return lf_noteTagsList_(auth, data);

    case 'attachments.upload': return lf_attachmentUpload_(auth, data);
    case 'attachments.list': return lf_attachmentsList_(auth, data);
    case 'attachments.delete': return lf_attachmentDelete_(auth, data);

    case 'imports.register': return lf_importRegister_(auth, data);
    case 'imports.list': return lf_importsList_(auth, data);
    case 'files.ingest': return lf_fileIngest_(auth, data);
    case 'files.ingest.batch': return lf_fileIngestBatch_(auth, data);
    case 'files.index.list': return lf_fileIndexList_(auth, data);
    case 'files.index.get': return lf_fileIndexGet_(auth, data);
    case 'consolidation.plan': return lf_consolidationPlan_(auth, data);
    case 'consolidation.apply': return lf_consolidationApply_(auth, data);
    case 'bulk.apply': return lf_bulkApply_(auth, data);

    case 'entities.save': return lf_entitySave_(auth, data);
    case 'entities.get': return lf_entityGet_(auth, data);
    case 'entities.list': return lf_entitiesList_(auth, data);
    case 'entities.delete': return lf_entityDelete_(auth, data);
    case 'characters.search': return lf_characterSearch_(auth, data);
    case 'story.facts.save': return lf_storyFactSave_(auth, data);
    case 'story.facts.list': return lf_storyFactsList_(auth, data);
    case 'story.facts.delete': return lf_storyFactDelete_(auth, data);
    case 'story.knowledge.save': return lf_knowledgeSave_(auth, data);
    case 'story.knowledge.list': return lf_knowledgeList_(auth, data);
    case 'story.threads.save': return lf_plotThreadSave_(auth, data);
    case 'story.threads.list': return lf_plotThreadsList_(auth, data);
    case 'story.threads.delete': return lf_plotThreadDelete_(auth, data);
    case 'story.causes.save': return lf_causalLinkSave_(auth, data);
    case 'story.causes.list': return lf_causalLinksList_(auth, data);
    case 'story.causes.delete': return lf_causalLinkDelete_(auth, data);
    case 'story.rules.save': return lf_worldRuleSave_(auth, data);
    case 'story.rules.list': return lf_worldRulesList_(auth, data);
    case 'story.rules.delete': return lf_worldRuleDelete_(auth, data);
    case 'story.extract': return lf_storyExtract_(auth, data);
    case 'story.mentions.list': return lf_storyMentionsList_(auth, data);
    case 'story.mentions.delete': return lf_storyMentionDelete_(auth, data);
    case 'story.debug.state': return lf_storyDebugState_(auth, data);
    case 'outline.generate': return lf_outlineGenerate_(auth, data);

    case 'timeline.save': return lf_timelineSave_(auth, data);
    case 'timeline.list': return lf_timelineList_(auth, data);
    case 'timeline.delete': return lf_timelineDelete_(auth, data);

    case 'languages.save': return lf_languageSave_(auth, data);
    case 'languages.get': return lf_languageGet_(auth, data);
    case 'languages.list': return lf_languagesList_(auth, data);
    case 'languages.delete': return lf_languageDelete_(auth, data);
    case 'lexicon.save': return lf_lexiconSave_(auth, data);
    case 'lexicon.list': return lf_lexiconList_(auth, data);
    case 'lexicon.delete': return lf_lexiconDelete_(auth, data);
    case 'languages.generate': return lf_languageGenerate_(auth, data);
    case 'languages.dictionary.export': return lf_languageDictionaryExport_(auth, data);

    case 'plotissues.save': return lf_plotIssueSave_(auth, data);
    case 'plotissues.list': return lf_plotIssuesList_(auth, data);
    case 'plotissues.resolve': return lf_plotIssueResolve_(auth, data);
    case 'plotissues.delete': return lf_plotIssueDelete_(auth, data);
    case 'plotissues.scan': return lf_plotIssueScan_(auth, data);
    case 'plotissues.action': return lf_plotIssueAction_(auth, data);
    case 'plotissues.applyfix': return lf_plotIssueApplyFix_(auth, data);
    case 'editor.run': return lf_editorRun_(auth, data);
    case 'editor.runs.list': return lf_editorRunsList_(auth, data);
    case 'ai.request': return lf_aiRequest_(auth, data);
    case 'ai.jobs.list': return lf_aiJobsList_(auth, data);

    case 'search.global': return lf_search_(auth, data);
    case 'search.saved.save': return lf_savedSearchSave_(auth, data);
    case 'search.saved.list': return lf_savedSearchList_(auth, data);
    case 'search.saved.delete': return lf_savedSearchDelete_(auth, data);

    case 'reading.state.get': return lf_readingStateGet_(auth, data);
    case 'reading.state.save': return lf_readingStateSave_(auth, data);

    case 'books.formats': return {ok:true, formats:LF.BOOK_FORMATS};
    case 'books.save': return lf_bookSave_(auth, data);
    case 'books.get': return lf_bookGet_(auth, data);
    case 'books.list': return lf_booksList_(auth, data);
    case 'books.delete': return lf_bookDelete_(auth, data);
    case 'books.editions.save': return lf_bookEditionSave_(auth, data);
    case 'books.editions.list': return lf_bookEditionsList_(auth, data);
    case 'books.editions.delete': return lf_bookEditionDelete_(auth, data);
    case 'books.chapters.save': return lf_bookChapterSave_(auth, data);
    case 'books.chapters.list': return lf_bookChaptersList_(auth, data);
    case 'books.chapters.format': return lf_bookChapterFormat_(auth, data);
    case 'books.cover.spec': return lf_bookCoverSpec_(auth, data);
    case 'books.export.html': return lf_bookExportHtml_(auth, data);
    case 'art.save': return lf_artProjectSave_(auth, data);
    case 'art.get': return lf_artProjectGet_(auth, data);
    case 'art.list': return lf_artProjectsList_(auth, data);
    case 'art.delete': return lf_artProjectDelete_(auth, data);
    case 'art.asset.upload': return lf_artAssetUpload_(auth, data);
    case 'art.ai.generate': return lf_artAiGenerate_(auth, data);

    case 'export.project': return lf_exportProject_(auth, data);
    case 'export.user': return lf_exportUser_(auth, data);
    case 'backup.create': return lf_backupCreate_(auth, data);
    case 'revisions.list': return lf_revisionSnapshotsList_(auth, data);
    case 'revisions.get': return lf_revisionSnapshotGet_(auth, data);

    case 'trash.list': return lf_trashList_(auth, data);
    case 'activity.list': return lf_activityList_(auth, data);

    default:
      throw lf_error_('UNKNOWN_ACTION', 'Unknown LiteraryFriend action: ' + action, 404);
  }
}

/* ========================================================================== */
/* HEALTH / MANIFEST / CLIENT CONFIG                                           */
/* ========================================================================== */

function lf_health_() {
  const p = PropertiesService.getScriptProperties();
  let dbOk = false;
  try { if (p.getProperty('LF_DB_ID')) { SpreadsheetApp.openById(p.getProperty('LF_DB_ID')); dbOk = true; } } catch (err) {}
  return {
    ok: true,
    app: LF.APP_NAME,
    version: LF.VERSION,
    apiVersion: LF.API_VERSION,
    serverTime: lf_nowIso_(),
    configured: dbOk && !!p.getProperty('LF_USERS_FOLDER_ID'),
    storage: 'Google Drive + Google Sheets + optional user-linked Google Drive',
    githubRequired: false,
    capabilities: [
      'accounts','password-auth','google-sign-in','google-account-linking','optional-two-factor-authentication','multi-device-sessions',
      'multiple-recovery-emails','multiple-recovery-phones','verification-codes','one-time-recovery-codes','email-password-reset','optional-sms-webhook',
      'linked-personal-google-drive','project-isolation','multi-project-switching','project-relations','transmedia-worlds','directories','notes','folders','tags',
      'multi-format-file-ingestion','file-classification','document-consolidation','mass-project-updates','revision-snapshots','exports','backups','global-search',
      'story-state','fact-provenance','character-knowledge-ledger','plot-thread-lifecycle','causal-links','world-rules','timeline','entities','character-search',
      'plot-hole-detection','issue-evidence','fix-ignore-intentional-false-positive-workflows','specialized-ai-editors','outline-generation',
      'fantasy-language-generation','lexicon','dictionary-export','book-builder','chapter-formatting','paperback-hardcover-formats','page-colors-textures','html-book-export',
      'chapter-json-export','page-flip-sound','cover-art-projects','art-layers','art-assets','ai-image-generation','read-aloud-state','audit-history'
    ]
  };
}

function lf_manifest_() {
  const config = LITERARYFRIEND_CONFIGURATION();
  const start = config.appBaseUrl || ScriptApp.getService().getUrl() || './';
  return {
    name: LF.APP_NAME,
    short_name: LF.SHORT_NAME,
    description: 'Accessible creative organization for books, games, worlds, notes, timelines, plot continuity, and constructed languages.',
    start_url: start,
    scope: start,
    display: 'standalone',
    orientation: 'any',
    background_color: '#f5efe3',
    theme_color: '#5d3d2e',
    categories: ['productivity','books','education'],
    id: 'literaryfriend',
    prefer_related_applications: false
  };
}

function lf_manifestResponse_() {
  return ContentService.createTextOutput(JSON.stringify(lf_manifest_(), null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function lf_clientConfig_() {
  const c = LITERARYFRIEND_CONFIGURATION();
  return {
    ok: true,
    app: LF.APP_NAME,
    version: LF.VERSION,
    apiVersion: LF.API_VERSION,
    backendUrl: ScriptApp.getService().getUrl() || '',
    appBaseUrl: c.appBaseUrl,
    googleClientId: c.googleClientId,
    githubRequired: false,
    passwordReveal: 'frontend-controlled',
    readAloud: {
      browserSpeechSynthesis: true,
      backendStoresReadingState: true
    },
    phoneRecovery: {
      multipleNumbersSupported: true,
      smsWebhookConfigured: c.smsWebhookConfigured
    },
    twoFactor: {optional:true, methods:['email','phone','recovery-code']},
    linkedGoogleDrive: {available:c.googleDriveOAuthConfigured, scope:LF.GOOGLE_DRIVE_SCOPE},
    ai: {available:c.aiConfigured, imageGenerationAvailable:c.imageAiConfigured, provider:c.aiProviderLabel},
    fileIngestion: {maxBytes:LF.MAX_UPLOAD_BYTES,batchMax:LF.MAX_BATCH_FILES,extensions:['doc','docx','odt','rtf','txt','md','markdown','pdf','html','htm','epub','json','csv','tsv','xml','yaml','yml','png','jpg','jpeg','gif','webp','svg','bmp','tif','tiff','mp3','wav','m4a','ogg','flac']},
    storyIntelligence: {persistentStoryState:true,provenance:true,temporalFacts:true,characterKnowledge:true,plotThreads:true,causalLinks:true,worldRules:true,entityMentions:true,authorReviewedFixes:true},
    editorTypes: ['continuity','plot','character','world','timeline','developmental','line','copy','pov','series','causality','setup-payoff','knowledge'],
    artStudio: {statePersistence:true,assetUploads:true,aiImageGeneration:c.imageAiConfigured,frontendTools:['layers','stretch','skew','rotate','brushes','textures','color-match','color-wheel','hex','spray','markers','clipboard','fill','shapes','stickers']},
    htmlBooks: {chapterJson:true,pageColors:true,pageTextures:true,pageFlipSound:true,localFileFallback:true},
    projectTypes: LF.DEFAULT_PROJECT_TYPES,
    bookFormats: LF.BOOK_FORMATS
  };
}

function lf_launcher_() {
  const api = ScriptApp.getService().getUrl() || '';
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>LiteraryFriend Backend</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Updock&display=swap" rel="stylesheet"><style>body{font-family:Georgia,serif;background:#f5efe3;color:#33251f;margin:0;padding:32px}' +
    '.card{max-width:900px;margin:auto;background:#fffaf1;border:1px solid #9f8069;border-radius:20px;padding:28px;box-shadow:0 12px 40px #0002}' +
    'a{color:#68452f}code{background:#eee2d1;padding:.12em .35em;border-radius:5px}.brand{font-family:Updock,cursive;font-size:2.2em;font-weight:400}</style></head><body><div class="card">' +
    '<h1><span class="brand">LiteraryFriend</span> Backend</h1><p>This deployment is the storage and account API for LiteraryFriend. It does not depend on GitHub.</p>' +
    '<p><a href="' + lf_escapeHtml_(api + '?action=health') + '">Health</a> · <a href="' + lf_escapeHtml_(api + '?action=client.config') + '">Client config</a> · <a href="' + lf_escapeHtml_(api + '?action=manifest') + '">Manifest</a></p>' +
    '<p>Run <code>LITERARYFRIEND_SETUP()</code> once before using the API.</p></div></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('LiteraryFriend Backend').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function lf_iconResponse_() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#f5efe3"/><path d="M118 100h276v312H118z" fill="#fffaf1" stroke="#5d3d2e" stroke-width="18"/><path d="M175 165h164M175 225h164M175 285h120" stroke="#5d3d2e" stroke-width="18" stroke-linecap="round"/><path d="M313 339l52-52 30 30-52 52-43 13z" fill="#c98a5a" stroke="#5d3d2e" stroke-width="10"/></svg>';
  return ContentService.createTextOutput(svg).setMimeType(ContentService.MimeType.XML);
}

/* ========================================================================== */
/* AUTHENTICATION                                                              */
/* ========================================================================== */

function lf_authRegister_(data, req) {
  const email = lf_cleanEmail_(data.email);
  const username = lf_cleanUsername_(data.username || email.split('@')[0]);
  const password = lf_validatePassword_(data.password);
  const displayName = lf_cleanText_(data.displayName || username, 100);

  return lf_withWriteLock_(function() {
    if (lf_findOne_('USERS', function(r){ return r.primaryEmailKey === email; })) {
      throw lf_error_('ACCOUNT_EXISTS', 'That email is already registered.', 409);
    }
    if (lf_findOne_('USERS', function(r){ return r.usernameKey === username.toLowerCase(); })) {
      throw lf_error_('USERNAME_EXISTS', 'That username is already registered.', 409);
    }

    const salt = lf_randomToken_(24);
    const now = lf_nowIso_();
    const userId = 'user_' + Utilities.getUuid();
    const folder = lf_createUserFolders_(userId);

    const user = lf_appendRow_('USERS', {
      id: userId,
      usernameKey: username.toLowerCase(),
      username: username,
      primaryEmailKey: email,
      primaryEmail: email,
      displayName: displayName,
      passwordHash: lf_hashPassword_(password, salt, LF.PBKDF2_ITERATIONS),
      passwordSalt: salt,
      passwordIterations: LF.PBKDF2_ITERATIONS,
      googleSub: '',
      emailVerified: false,
      status: 'active',
      settingsJson: JSON.stringify(lf_defaultSettings_()),
      preferencesJson: JSON.stringify({}),
      userFolderId: folder.root.getId(),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      twoFactorJson: '{}'
    });

    lf_appendRow_('RECOVERY_CONTACTS', {
      id: 'contact_' + Utilities.getUuid(),
      userId: userId,
      kind: 'email',
      valueKey: email,
      value: email,
      label: 'Primary email',
      verified: false,
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
      verifiedAt: ''
    });

    const session = lf_createSession_(userId, data, req);
    lf_sendVerificationCodeForContact_(userId, 'email', email, 'verify_email');
    lf_activity_(userId, 'auth.register', 'user', userId, '', {username:username});

    return {
      ok: true,
      user: lf_privateUser_(user),
      token: session.token,
      session: session.publicSession,
      verificationEmailSent: true
    };
  });
}

function lf_authLogin_(data, req) {
  const login = String(data.login || data.email || data.username || '').trim().toLowerCase();
  const password = String(data.password || '');
  if (!login || !password) throw lf_error_('MISSING_CREDENTIALS', 'Email/username and password are required.', 400);

  const user = lf_findOne_('USERS', function(r) {
    return r.primaryEmailKey === login || r.usernameKey === login;
  });
  if (!user || user.status !== 'active' || !lf_verifyPassword_(password, user)) {
    throw lf_error_('INVALID_CREDENTIALS', 'Email, username, or password is incorrect.', 401);
  }

  lf_updateRow_('USERS', user._row, {lastLoginAt:lf_nowIso_(), updatedAt:lf_nowIso_()});
  return lf_finishCredentialLogin_(user, data, req, 'password');
}

function lf_authGoogle_(data, req) {
  const idToken = String(data.idToken || data.credential || '').trim();
  if (!idToken) throw lf_error_('GOOGLE_TOKEN_REQUIRED', 'Google ID token is required.', 400);

  const clientId = PropertiesService.getScriptProperties().getProperty('LF_GOOGLE_CLIENT_ID') || '';
  if (!clientId) throw lf_error_('GOOGLE_NOT_CONFIGURED', 'Google sign-in is not configured.', 503);

  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
  const response = UrlFetchApp.fetch(url, {muteHttpExceptions:true});
  if (response.getResponseCode() !== 200) throw lf_error_('GOOGLE_TOKEN_INVALID', 'Google sign-in token was rejected.', 401);

  const profile = JSON.parse(response.getContentText());
  if (String(profile.aud || '') !== clientId) throw lf_error_('GOOGLE_AUDIENCE_INVALID', 'Google sign-in token is for a different app.', 401);
  if (!profile.sub || !profile.email) throw lf_error_('GOOGLE_PROFILE_INVALID', 'Google profile did not include required account data.', 401);
  if (!(profile.email_verified === true || String(profile.email_verified).toLowerCase() === 'true')) throw lf_error_('GOOGLE_EMAIL_UNVERIFIED', 'Google did not verify this account email address.', 401);

  const email = lf_cleanEmail_(profile.email);
  let user = lf_findOne_('USERS', function(r) { return r.googleSub === String(profile.sub); });
  if (!user) user = lf_findOne_('USERS', function(r) { return r.primaryEmailKey === email; });

  return lf_withWriteLock_(function() {
    if (!user) {
      let base = String(profile.name || email.split('@')[0]).replace(/[^A-Za-z0-9._-]/g,'').slice(0,24) || 'writer';
      if (base.length < 3) base = 'writer';
      let username = base;
      let n = 1;
      while (lf_findOne_('USERS', function(r){ return r.usernameKey === username.toLowerCase(); })) {
        username = (base.slice(0,20) + n++).slice(0,24);
      }

      const now = lf_nowIso_();
      const userId = 'user_' + Utilities.getUuid();
      const folder = lf_createUserFolders_(userId);
      user = lf_appendRow_('USERS', {
        id:userId, usernameKey:username.toLowerCase(), username:username,
        primaryEmailKey:email, primaryEmail:email,
        displayName:lf_cleanText_(profile.name || username,100),
        passwordHash:'', passwordSalt:'', passwordIterations:'',
        googleSub:String(profile.sub), emailVerified:true, status:'active',
        settingsJson:JSON.stringify(lf_defaultSettings_()), preferencesJson:'{}',
        userFolderId:folder.root.getId(), createdAt:now, updatedAt:now, lastLoginAt:now,
        twoFactorJson:'{}'
      });
      lf_appendRow_('RECOVERY_CONTACTS', {
        id:'contact_' + Utilities.getUuid(), userId:userId, kind:'email',
        valueKey:email, value:email, label:'Google email', verified:true, isPrimary:true,
        createdAt:now, updatedAt:now, verifiedAt:now
      });
    } else {
      const patch = {googleSub:String(profile.sub), emailVerified:true, updatedAt:lf_nowIso_(), lastLoginAt:lf_nowIso_()};
      user = lf_updateRow_('USERS', user._row, patch);
    }

    return lf_finishCredentialLogin_(user, data, req, 'google');
  });
}

function lf_authLogout_(auth) {
  lf_updateRow_('SESSIONS', auth.session._row, {revokedAt:lf_nowIso_()});
  lf_activity_(auth.user.id, 'auth.logout', 'session', auth.session.id, '', {});
  return {ok:true};
}

function lf_authMe_(auth) {
  return {ok:true, user:lf_privateUser_(auth.user), session:lf_publicSession_(auth.session)};
}

function lf_passwordChange_(auth, data) {
  const oldPassword = String(data.currentPassword || '');
  const newPassword = lf_validatePassword_(data.newPassword);
  if (auth.user.passwordHash && !lf_verifyPassword_(oldPassword, auth.user)) {
    throw lf_error_('CURRENT_PASSWORD_INVALID', 'Current password is incorrect.', 401);
  }
  const salt = lf_randomToken_(24);
  lf_updateRow_('USERS', auth.user._row, {
    passwordSalt:salt,
    passwordHash:lf_hashPassword_(newPassword, salt, LF.PBKDF2_ITERATIONS),
    passwordIterations:LF.PBKDF2_ITERATIONS,
    updatedAt:lf_nowIso_()
  });
  lf_revokeAllSessionsForUser_(auth.user.id, auth.session.id);
  lf_activity_(auth.user.id, 'auth.password.change', 'user', auth.user.id, '', {});
  return {ok:true, message:'Password changed. Other sessions were signed out.'};
}

function lf_passwordResetRequest_(data) {
  const login = String(data.login || data.email || '').trim().toLowerCase();
  if (!login) return {ok:true, message:'If the account exists, a reset code was sent.'};

  const user = lf_findOne_('USERS', function(r){ return r.primaryEmailKey === login || r.usernameKey === login; });
  if (!user || user.status !== 'active') return {ok:true, message:'If the account exists, a reset code was sent.'};

  const all = lf_rows_('RECOVERY_CONTACTS').filter(function(r) {
    return r.userId === user.id && lf_bool_(r.verified) && (r.kind === 'email' || r.kind === 'phone');
  });
  let contacts = all;
  if (!contacts.length) {
    contacts = lf_rows_('RECOVERY_CONTACTS').filter(function(r) {
      return r.userId === user.id && r.kind === 'email';
    }).slice(0,1);
  }

  const deliveries=[];
  contacts.forEach(function(c){
    try { deliveries.push(lf_sendVerificationCodeForContact_(user.id, c.kind, c.value, 'password_reset')); }
    catch (err) { deliveries.push({sent:false,kind:c.kind}); }
  });
  return {
    ok:true,
    message:'If the account exists, a reset code was sent to available verified recovery methods.',
    destinations:deliveries.filter(function(x){return x.sent;}).length
  };
}

function lf_passwordResetComplete_(data,req){const login=String(data.login||data.email||data.username||'').trim().toLowerCase(),code=String(data.code||'').replace(/\s+/g,''),newPassword=lf_validatePassword_(data.newPassword);if(!login||!code)throw lf_error_('RESET_FIELDS_REQUIRED','Login and reset code are required.',400);let user=lf_findOne_('USERS',function(r){return r.primaryEmailKey===login||r.usernameKey===login;});if(!user)throw lf_error_('RESET_INVALID','Reset code is invalid or expired.',401);lf_consumeAuthCode_(user.id,'password_reset',code);const salt=lf_randomToken_(24);user=lf_updateRow_('USERS',user._row,{passwordSalt:salt,passwordHash:lf_hashPassword_(newPassword,salt,LF.PBKDF2_ITERATIONS),passwordIterations:LF.PBKDF2_ITERATIONS,updatedAt:lf_nowIso_()});lf_revokeAllSessionsForUser_(user.id,'');lf_activity_(user.id,'auth.password.reset.complete','user',user.id,'',{});return lf_finishCredentialLogin_(user,data,req,'password-reset');}
function lf_recoveryCodesGenerate_(auth) {
  const now = lf_nowIso_();
  const batchId = 'batch_' + Utilities.getUuid();

  lf_rows_('RECOVERY_CODES').filter(function(r){
    return r.userId === auth.user.id && !r.usedAt && !r.revokedAt;
  }).forEach(function(r){
    lf_updateRow_('RECOVERY_CODES', r._row, {revokedAt:now});
  });

  const codes = [];
  for (let i=0; i<LF.RECOVERY_CODES_PER_BATCH; i++) {
    const raw = lf_randomRecoveryCode_();
    codes.push(raw);
    lf_appendRow_('RECOVERY_CODES', {
      id:'recovery_' + Utilities.getUuid(),
      userId:auth.user.id,
      batchId:batchId,
      codeHash:lf_sha256Hex_('recovery|' + auth.user.id + '|' + raw),
      createdAt:now,
      usedAt:'',
      revokedAt:''
    });
  }

  lf_activity_(auth.user.id, 'auth.recovery.codes.generate', 'recovery_batch', batchId, '', {count:codes.length});
  return {
    ok:true,
    batchId:batchId,
    codes:codes,
    warning:'Save these codes now. LiteraryFriend stores only hashes and cannot show them again.'
  };
}

function lf_recoveryCodeLogin_(data, req) {
  const login = String(data.login || data.email || data.username || '').trim().toLowerCase();
  const code = String(data.code || '').trim().toUpperCase();
  if (!login || !code) throw lf_error_('RECOVERY_FIELDS_REQUIRED', 'Login and recovery code are required.', 400);

  const user = lf_findOne_('USERS', function(r){ return r.primaryEmailKey === login || r.usernameKey === login; });
  if (!user || user.status !== 'active') throw lf_error_('RECOVERY_INVALID', 'Recovery code is invalid.', 401);

  const hash = lf_sha256Hex_('recovery|' + user.id + '|' + code);
  const row = lf_findOne_('RECOVERY_CODES', function(r){
    return r.userId === user.id && r.codeHash === hash && !r.usedAt && !r.revokedAt;
  });
  if (!row) throw lf_error_('RECOVERY_INVALID', 'Recovery code is invalid.', 401);

  lf_updateRow_('RECOVERY_CODES', row._row, {usedAt:lf_nowIso_()});
  const session = lf_createSession_(user.id, data, req);
  lf_activity_(user.id, 'auth.recovery.code.login', 'recovery_code', row.id, '', {});
  return {ok:true, user:lf_privateUser_(user), token:session.token, session:session.publicSession};
}

function lf_recoveryContactsList_(auth) {
  const items = lf_rows_('RECOVERY_CONTACTS').filter(function(r){ return r.userId === auth.user.id; })
    .map(lf_publicRecoveryContact_);
  return {ok:true, contacts:items};
}

function lf_recoveryContactAdd_(auth, data) {
  const kind = String(data.kind || '').toLowerCase();
  if (kind !== 'email' && kind !== 'phone') throw lf_error_('CONTACT_KIND_INVALID', 'Recovery contact must be email or phone.', 400);

  let value = '';
  if (kind === 'email') value = lf_cleanEmail_(data.value || data.email);
  else value = lf_cleanPhone_(data.value || data.phone);

  const key = kind === 'email' ? value.toLowerCase() : value.replace(/\D/g,'');
  const existing = lf_findOne_('RECOVERY_CONTACTS', function(r){
    return r.userId === auth.user.id && r.kind === kind && r.valueKey === key;
  });
  if (existing) return {ok:true, contact:lf_publicRecoveryContact_(existing), alreadyExists:true};

  const now = lf_nowIso_();
  const row = lf_appendRow_('RECOVERY_CONTACTS', {
    id:'contact_' + Utilities.getUuid(),
    userId:auth.user.id,
    kind:kind,
    valueKey:key,
    value:value,
    label:lf_cleanText_(data.label || (kind === 'email' ? 'Backup email' : 'Backup phone'),80),
    verified:false,
    isPrimary:false,
    createdAt:now,
    updatedAt:now,
    verifiedAt:''
  });
  lf_activity_(auth.user.id, 'auth.recovery.contact.add', 'recovery_contact', row.id, '', {kind:kind});

  let delivery = {sent:false};
  try { delivery = lf_sendVerificationCodeForContact_(auth.user.id, kind, value, 'verify_contact'); } catch (err) {
    delivery = {sent:false, message:err.publicMessage || err.message};
  }

  return {ok:true, contact:lf_publicRecoveryContact_(row), verification:delivery};
}

function lf_recoveryContactRemove_(auth, data) {
  const id = String(data.id || data.contactId || '');
  const row = lf_findOne_('RECOVERY_CONTACTS', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('CONTACT_NOT_FOUND', 'Recovery contact was not found.', 404);
  if (lf_bool_(row.isPrimary)) throw lf_error_('PRIMARY_CONTACT', 'The primary email cannot be removed here.', 409);
  lf_deleteRow_('RECOVERY_CONTACTS', row._row);
  lf_activity_(auth.user.id, 'auth.recovery.contact.remove', 'recovery_contact', id, '', {});
  return {ok:true};
}

function lf_recoveryContactSendCode_(auth, data) {
  const id = String(data.id || data.contactId || '');
  const row = lf_findOne_('RECOVERY_CONTACTS', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('CONTACT_NOT_FOUND', 'Recovery contact was not found.', 404);
  const result = lf_sendVerificationCodeForContact_(auth.user.id, row.kind, row.value, 'verify_contact');
  return {ok:true, delivery:result};
}

function lf_recoveryContactVerifyCode_(data, req) {
  const userId = String(data.userId || '').trim();
  const contactId = String(data.contactId || data.id || '').trim();
  const code = String(data.code || '').replace(/\s+/g,'');
  if (!userId || !contactId || !code) throw lf_error_('VERIFY_FIELDS_REQUIRED', 'userId, contactId, and code are required.', 400);

  const contact = lf_findOne_('RECOVERY_CONTACTS', function(r){ return r.id === contactId && r.userId === userId; });
  if (!contact) throw lf_error_('CONTACT_NOT_FOUND', 'Recovery contact was not found.', 404);

  lf_consumeAuthCode_(userId, contact.isPrimary ? 'verify_email' : 'verify_contact', code, contact.valueKey);
  lf_updateRow_('RECOVERY_CONTACTS', contact._row, {verified:true, verifiedAt:lf_nowIso_(), updatedAt:lf_nowIso_()});

  if (lf_bool_(contact.isPrimary) && contact.kind === 'email') {
    const user = lf_findOne_('USERS', function(r){ return r.id === userId; });
    if (user) lf_updateRow_('USERS', user._row, {emailVerified:true, updatedAt:lf_nowIso_()});
  }
  return {ok:true, verified:true};
}

function lf_sendVerificationCodeForContact_(userId, kind, destination, purpose) {
  const code = lf_randomDigits_(6);
  const now = lf_nowIso_();
  const key = kind === 'email' ? String(destination).toLowerCase() : String(destination).replace(/\D/g,'');

  const recent = lf_rows_('AUTH_CODES').filter(function(r){
    return r.userId === userId && r.destinationKey === key && r.purpose === purpose && !r.usedAt;
  }).sort(function(a,b){ return String(b.createdAt).localeCompare(String(a.createdAt)); })[0];

  if (recent && Date.now() - Date.parse(recent.createdAt) < LF.EMAIL_CODE_RESEND_SECONDS * 1000) {
    throw lf_error_('CODE_TOO_SOON', 'Please wait before requesting another code.', 429);
  }

  lf_appendRow_('AUTH_CODES', {
    id:'code_' + Utilities.getUuid(),
    userId:userId,
    destinationType:kind,
    destinationKey:key,
    purpose:purpose,
    codeHash:lf_sha256Hex_('authcode|' + userId + '|' + purpose + '|' + code),
    createdAt:now,
    expiresAt:new Date(Date.now() + LF.EMAIL_CODE_TTL_MINUTES * 60000).toISOString(),
    usedAt:'',
    attempts:0
  });

  if (kind === 'email') {
    MailApp.sendEmail({
      to:String(destination),
      subject:'Your LiteraryFriend authorization code',
      htmlBody:'<p>Your LiteraryFriend code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">' +
        lf_escapeHtml_(code) + '</p><p>This code expires in ' + LF.EMAIL_CODE_TTL_MINUTES + ' minutes.</p>',
      name:'LiteraryFriend'
    });
    return {sent:true, kind:'email'};
  }

  return lf_sendSmsCode_(destination, code, purpose);
}

function lf_sendSmsCode_(phone, code, purpose) {
  const p = PropertiesService.getScriptProperties();
  const webhook = p.getProperty('LF_SMS_WEBHOOK_URL') || '';
  if (!webhook) {
    return {
      sent:false,
      kind:'phone',
      providerConfigured:false,
      message:'Phone is saved as a recovery contact, but SMS delivery requires configuring LF_SMS_WEBHOOK_URL.'
    };
  }

  const secret = p.getProperty('LF_SMS_WEBHOOK_SECRET') || '';
  const payload = JSON.stringify({
    app:LF.APP_NAME,
    phone:phone,
    code:code,
    purpose:purpose,
    text:'Your LiteraryFriend authorization code is ' + code
  });
  const headers = {'Content-Type':'application/json'};
  if (secret) headers['X-LiteraryFriend-Secret'] = secret;

  const response = UrlFetchApp.fetch(webhook, {
    method:'post',
    contentType:'application/json',
    payload:payload,
    headers:headers,
    muteHttpExceptions:true
  });
  const ok = response.getResponseCode() >= 200 && response.getResponseCode() < 300;
  return {sent:ok, kind:'phone', providerConfigured:true, status:response.getResponseCode()};
}

function lf_consumeAuthCode_(userId, purpose, code, destinationKey) {
  const hash = lf_sha256Hex_('authcode|' + userId + '|' + purpose + '|' + code);
  const rows = lf_rows_('AUTH_CODES').filter(function(r){
    return r.userId === userId && r.purpose === purpose && !r.usedAt &&
      (!destinationKey || r.destinationKey === destinationKey);
  }).sort(function(a,b){ return String(b.createdAt).localeCompare(String(a.createdAt)); });

  for (let i=0; i<rows.length; i++) {
    const r = rows[i];
    if (Date.parse(r.expiresAt) <= Date.now()) continue;
    if (Number(r.attempts || 0) >= LF.EMAIL_CODE_MAX_ATTEMPTS) continue;

    if (lf_safeEqual_(r.codeHash, hash)) {
      lf_updateRow_('AUTH_CODES', r._row, {usedAt:lf_nowIso_(), attempts:Number(r.attempts || 0)+1});
      return true;
    }
    lf_updateRow_('AUTH_CODES', r._row, {attempts:Number(r.attempts || 0)+1});
  }
  throw lf_error_('CODE_INVALID', 'Authorization code is invalid or expired.', 401);
}

function lf_sessionsList_(auth) {
  const items = lf_rows_('SESSIONS').filter(function(r){
    return r.userId === auth.user.id && !r.revokedAt && Date.parse(r.expiresAt) > Date.now();
  }).map(function(r){
    const out = lf_publicSession_(r);
    out.current = r.id === auth.session.id;
    return out;
  });
  return {ok:true, sessions:items};
}

function lf_sessionsRevoke_(auth, data) {
  const id = String(data.id || data.sessionId || '');
  const row = lf_findOne_('SESSIONS', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('SESSION_NOT_FOUND', 'Session was not found.', 404);
  lf_updateRow_('SESSIONS', row._row, {revokedAt:lf_nowIso_()});
  return {ok:true};
}

function lf_sessionsRevokeOthers_(auth) {
  lf_revokeAllSessionsForUser_(auth.user.id, auth.session.id);
  return {ok:true};
}

function lf_revokeAllSessionsForUser_(userId, exceptId) {
  lf_rows_('SESSIONS').filter(function(r){
    return r.userId === userId && r.id !== exceptId && !r.revokedAt;
  }).forEach(function(r){ lf_updateRow_('SESSIONS', r._row, {revokedAt:lf_nowIso_()}); });
}

function lf_createSession_(userId, data, req) {
  const token = lf_randomToken_(48);
  const now = lf_nowIso_();
  const row = lf_appendRow_('SESSIONS', {
    id:'session_' + Utilities.getUuid(),
    tokenHash:lf_sha256Hex_('session|' + token),
    userId:userId,
    deviceId:lf_cleanText_(data.deviceId || '',128),
    deviceName:lf_cleanText_(data.deviceName || '',120),
    platform:lf_cleanText_(data.platform || '',80),
    userAgent:lf_cleanText_(data.userAgent || (req && req.userAgent) || '',500),
    createdAt:now,
    expiresAt:new Date(Date.now() + LF.SESSION_DAYS * 86400000).toISOString(),
    lastSeenAt:now,
    revokedAt:''
  });
  return {token:token, publicSession:lf_publicSession_(row)};
}

function lf_requireAuth_(req) {
  const data = lf_data_(req);
  const token = String(req.token || req.sessionToken || data.token || data.sessionToken || '').trim();
  if (!token) throw lf_error_('AUTH_REQUIRED', 'Sign in is required.', 401);

  const hash = lf_sha256Hex_('session|' + token);
  const session = lf_findOne_('SESSIONS', function(r){ return r.tokenHash === hash && !r.revokedAt; });
  if (!session || Date.parse(session.expiresAt) <= Date.now()) throw lf_error_('SESSION_EXPIRED', 'Your session expired. Sign in again.', 401);

  const user = lf_findOne_('USERS', function(r){ return r.id === session.userId; });
  if (!user || user.status !== 'active') throw lf_error_('ACCOUNT_UNAVAILABLE', 'This account is unavailable.', 403);

  if (!session.lastSeenAt || Date.now() - Date.parse(session.lastSeenAt) > 60000) {
    lf_updateRow_('SESSIONS', session._row, {lastSeenAt:lf_nowIso_()});
  }
  return {token:token, session:session, user:user};
}

/* ========================================================================== */
/* PROFILE / SETTINGS                                                          */
/* ========================================================================== */

function lf_profileUpdate_(auth, data) {
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(data,'displayName')) patch.displayName = lf_cleanText_(data.displayName,100);
  if (Object.prototype.hasOwnProperty.call(data,'preferences')) patch.preferencesJson = JSON.stringify(data.preferences || {});
  patch.updatedAt = lf_nowIso_();
  const user = lf_updateRow_('USERS', auth.user._row, patch);
  lf_activity_(auth.user.id, 'profile.update', 'user', auth.user.id, '', {});
  return {ok:true, user:lf_privateUser_(user)};
}

function lf_settingsGet_(auth) {
  return {ok:true, settings:lf_parseJson_(auth.user.settingsJson, lf_defaultSettings_())};
}

function lf_settingsUpdate_(auth, data) {
  const current = lf_parseJson_(auth.user.settingsJson, lf_defaultSettings_());
  const patch = data.settings || data;
  const merged = lf_deepMerge_(current, patch);
  const user = lf_updateRow_('USERS', auth.user._row, {settingsJson:JSON.stringify(merged), updatedAt:lf_nowIso_()});
  return {ok:true, settings:lf_parseJson_(user.settingsJson,{})};
}

function lf_defaultSettings_() {
  return {
    accessibility:{
      fontScale:1, highContrast:false, reduceMotion:false, dyslexiaFriendly:false,
      screenReaderLabels:true, largeTargets:true
    },
    reading:{
      readAloudEnabled:true, speed:1, voice:'', highlightSentence:true, autoScroll:true
    },
    editor:{
      autosave:true, autosaveSeconds:15, spellcheck:true, smartQuotes:true, wordCount:true,
      issueHighlighting:true, protectIntentionalContinuity:true, autoApplyAiFixes:false
    },
    organization:{
      defaultView:'directory', rememberExpandedFolders:true, activeProjectId:'', isolateProjects:true
    },
    storage:{
      defaultTarget:'internal', mirrorToLinkedDrive:false
    },
    bookBuilder:{
      defaultBinding:'paperback', defaultTrimId:'standard-trade', pageColor:'#fffdf8',
      pageTexture:'paper', pageFlipSound:true
    },
    artStudio:{
      autosave:true, preserveLayerHistory:true, defaultDpi:300
    },
    twoFactor:{enabled:false}
  };
}

/* ========================================================================== */
/* PROJECTS / DIRECTORIES                                                      */
/* ========================================================================== */

function lf_projectCreate_(auth, data) {
  const title = lf_cleanText_(data.title || data.name || 'Untitled Project',180);
  const type = lf_cleanSlug_(data.type || 'other');
  const now = lf_nowIso_();
  const id = 'project_' + Utilities.getUuid();
  const userFolders = lf_getUserFolders_(auth.user);
  const folder = userFolders.projects.createFolder(lf_safeFilename_(title + ' — ' + id.slice(-8)));

  const row = lf_appendRow_('PROJECTS', {
    id:id, userId:auth.user.id, type:type, title:title,
    slug:lf_slug_(title), description:lf_cleanText_(data.description || '',5000),
    status:lf_cleanText_(data.status || 'active',40),
    parentProjectId:String(data.parentProjectId || ''),
    driveFolderId:folder.getId(),
    metadataJson:JSON.stringify(data.metadata || {}),
    settingsJson:JSON.stringify(data.settings || {}),
    createdAt:now, updatedAt:now, archivedAt:''
  });

  lf_seedProjectDirectories_(auth.user.id, id);
  lf_ensureProjectDirectoriesByRow_(row);
  lf_activity_(auth.user.id, 'projects.create', 'project', id, id, {type:type,title:title});
  if(lf_boolDefault_(data.makeActive,true)){const settings=lf_parseJson_(auth.user.settingsJson,lf_defaultSettings_());settings.organization=settings.organization||{};settings.organization.activeProjectId=id;settings.organization.isolateProjects=true;lf_updateRow_('USERS',auth.user._row,{settingsJson:JSON.stringify(settings),updatedAt:lf_nowIso_()});}
  return {ok:true, project:lf_publicProject_(row), activeProjectId:id};
}

function lf_seedProjectDirectories_(userId, projectId) {
  const dirs = [
    {type:'directory',title:'Overview'},
    {type:'directory',title:'Ideas'},
    {type:'directory',title:'Outline'},
    {type:'directory',title:'Characters'},
    {type:'directory',title:'Locations'},
    {type:'directory',title:'Worldbuilding'},
    {type:'directory',title:'Timeline'},
    {type:'directory',title:'Research'},
    {type:'directory',title:'Continuity & Plot Holes'},
    {type:'directory',title:'Story State & Canon'},
    {type:'directory',title:'Plot Threads & Causality'},
    {type:'directory',title:'Language'},
    {type:'directory',title:'Book Builder'},
    {type:'directory',title:'Cover Art Studio'},
    {type:'directory',title:'Imports & Consolidation'},
    {type:'directory',title:'Drafts'}
  ];
  const now = lf_nowIso_();
  dirs.forEach(function(d, i) {
    lf_appendRow_('NODES', {
      id:'node_' + Utilities.getUuid(), userId:userId, projectId:projectId, parentId:'',
      nodeType:d.type, title:d.title, slug:lf_slug_(d.title), sortOrder:i * 10,
      content:'', plainText:'', metadataJson:'{}', tagsJson:'[]', linksJson:'[]',
      driveFileId:'', createdAt:now, updatedAt:now, deletedAt:''
    });
  });
}

function lf_projectUpdate_(auth, data) {
  const row = lf_requireOwnedProject_(auth, data.id || data.projectId);
  const patch = {updatedAt:lf_nowIso_()};
  ['title','description','status','parentProjectId'].forEach(function(k){
    if (Object.prototype.hasOwnProperty.call(data,k)) patch[k] = k === 'title' ? lf_cleanText_(data[k],180) : lf_cleanText_(data[k],5000);
  });
  if (Object.prototype.hasOwnProperty.call(data,'type')) patch.type = lf_cleanSlug_(data.type);
  if (Object.prototype.hasOwnProperty.call(data,'metadata')) patch.metadataJson = JSON.stringify(data.metadata || {});
  if (Object.prototype.hasOwnProperty.call(data,'settings')) patch.settingsJson = JSON.stringify(data.settings || {});
  if (patch.title) patch.slug = lf_slug_(patch.title);
  const updated = lf_updateRow_('PROJECTS', row._row, patch);
  lf_activity_(auth.user.id, 'projects.update', 'project', row.id, row.id, {});
  return {ok:true, project:lf_publicProject_(updated)};
}

function lf_projectGet_(auth, data) {
  const row = lf_requireOwnedProject_(auth, data.id || data.projectId);
  const nodes = lf_rows_('NODES').filter(function(r){ return r.userId === auth.user.id && r.projectId === row.id && !r.deletedAt; })
    .map(lf_publicNode_);
  return {ok:true, project:lf_publicProject_(row), nodes:nodes};
}

function lf_projectsList_(auth, data) {
  const includeArchived = lf_bool_(data.includeArchived);
  let rows = lf_rows_('PROJECTS').filter(function(r){
    return r.userId === auth.user.id && (includeArchived || !r.archivedAt);
  });
  if (data.type) rows = rows.filter(function(r){ return r.type === String(data.type); });
  rows.sort(function(a,b){ return String(b.updatedAt).localeCompare(String(a.updatedAt)); });
  return {ok:true, projects:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicProject_)};
}

function lf_projectArchive_(auth, data) {
  const row = lf_requireOwnedProject_(auth, data.id || data.projectId);
  const updated = lf_updateRow_('PROJECTS', row._row, {archivedAt:lf_nowIso_(), status:'archived', updatedAt:lf_nowIso_()});
  return {ok:true, project:lf_publicProject_(updated)};
}

function lf_projectRestore_(auth, data) {
  const row = lf_requireOwnedProject_(auth, data.id || data.projectId);
  const updated = lf_updateRow_('PROJECTS', row._row, {archivedAt:'', status:'active', updatedAt:lf_nowIso_()});
  return {ok:true, project:lf_publicProject_(updated)};
}

function lf_nodeSave_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),id=String(data.id||data.nodeId||''),now=lf_nowIso_();
  let row=id?lf_findOne_('NODES',function(r){return r.id===id&&r.userId===auth.user.id&&r.projectId===project.id;}):null;
  const previous=row?lf_fullTextPair_(row):{content:'',plainText:''};
  const content=lf_limitText_(Object.prototype.hasOwnProperty.call(data,'content')?data.content:previous.content,LF.MAX_TEXT_CHARS);
  const plain=lf_limitText_(Object.prototype.hasOwnProperty.call(data,'plainText')?data.plainText:(Object.prototype.hasOwnProperty.call(data,'content')?lf_plainText_(content):previous.plainText),LF.MAX_TEXT_CHARS);
  const stored=lf_externalizeTextPair_(auth,project,row&&row.contentStorageJson,content,plain,'node-'+(id||'new')+'.json');
  const patch={userId:auth.user.id,projectId:project.id,parentId:String(Object.prototype.hasOwnProperty.call(data,'parentId')?data.parentId:(row&&row.parentId)||''),nodeType:lf_cleanSlug_(Object.prototype.hasOwnProperty.call(data,'nodeType')?data.nodeType:(Object.prototype.hasOwnProperty.call(data,'type')?data.type:(row&&row.nodeType)||'document')),title:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'title')?data.title:(row&&row.title)||'Untitled',200),sortOrder:Number(Object.prototype.hasOwnProperty.call(data,'sortOrder')?data.sortOrder:(row&&row.sortOrder)||0),content:stored.contentPreview,plainText:stored.plainPreview,contentStorageJson:JSON.stringify(stored.storage),metadataJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'metadata')?data.metadata:(row?lf_parseJson_(row.metadataJson,{}):{})),tagsJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'tags')?lf_stringArray_(data.tags):(row?lf_parseJson_(row.tagsJson,[]):[])),linksJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'links')?(data.links||[]):(row?lf_parseJson_(row.linksJson,[]):[])),driveFileId:String(Object.prototype.hasOwnProperty.call(data,'driveFileId')?data.driveFileId:(row&&row.driveFileId)||''),updatedAt:now,deletedAt:''};
  patch.slug=lf_slug_(patch.title);
  if(row)row=lf_updateRow_('NODES',row._row,patch);else{patch.id='node_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('NODES',patch);}
  lf_activity_(auth.user.id,'nodes.save','node',row.id,project.id,{nodeType:row.nodeType,externalContent:stored.storage.mode==='drive-json'});
  return{ok:true,node:lf_publicNode_(row)};
}
function lf_nodeGet_(auth, data) {
  const id = String(data.id || data.nodeId || '');
  const row = lf_findOne_('NODES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NODE_NOT_FOUND', 'Directory item was not found.', 404);
  return {ok:true, node:lf_publicNode_(row)};
}

function lf_nodesList_(auth, data) {
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  let rows = lf_rows_('NODES').filter(function(r){
    return r.userId === auth.user.id &&
      (!scopedProjectId || r.projectId === scopedProjectId) &&
      (!lf_bool_(data.includeDeleted) ? !r.deletedAt : true);
  });
  if (Object.prototype.hasOwnProperty.call(data,'parentId')) rows = rows.filter(function(r){ return r.parentId === String(data.parentId || ''); });
  if (data.nodeType) rows = rows.filter(function(r){ return r.nodeType === String(data.nodeType); });
  rows.sort(function(a,b){ return Number(a.sortOrder || 0)-Number(b.sortOrder || 0) || String(a.title).localeCompare(String(b.title)); });
  return {ok:true, nodes:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicNode_)};
}

function lf_nodeMove_(auth, data) {
  const id = String(data.id || data.nodeId || '');
  const row = lf_findOne_('NODES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NODE_NOT_FOUND', 'Directory item was not found.', 404);
  const updated = lf_updateRow_('NODES', row._row, {
    parentId:String(data.parentId || ''),
    sortOrder:Number(data.sortOrder || row.sortOrder || 0),
    updatedAt:lf_nowIso_()
  });
  return {ok:true, node:lf_publicNode_(updated)};
}

function lf_nodeDelete_(auth, data) {
  const id = String(data.id || data.nodeId || '');
  const row = lf_findOne_('NODES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NODE_NOT_FOUND', 'Directory item was not found.', 404);
  const updated = lf_updateRow_('NODES', row._row, {deletedAt:lf_nowIso_(), updatedAt:lf_nowIso_()});
  return {ok:true, node:lf_publicNode_(updated)};
}

function lf_nodeRestore_(auth, data) {
  const id = String(data.id || data.nodeId || '');
  const row = lf_findOne_('NODES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NODE_NOT_FOUND', 'Directory item was not found.', 404);
  const updated = lf_updateRow_('NODES', row._row, {deletedAt:'', updatedAt:lf_nowIso_()});
  return {ok:true, node:lf_publicNode_(updated)};
}

/* ========================================================================== */
/* NOTES                                                                       */
/* ========================================================================== */

function lf_noteSave_(auth,data){
  const id=String(data.id||data.noteId||'');let row=id?lf_findOne_('NOTES',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  const projectId=String(Object.prototype.hasOwnProperty.call(data,'projectId')?data.projectId:(row&&row.projectId)||''),project=projectId?lf_requireOwnedProject_(auth,projectId):null,previous=row?lf_fullTextPair_(row):{content:'',plainText:''},now=lf_nowIso_();
  const content=lf_limitText_(Object.prototype.hasOwnProperty.call(data,'content')?data.content:(Object.prototype.hasOwnProperty.call(data,'text')?data.text:previous.content),LF.MAX_NOTE_CHARS),plain=lf_limitText_(Object.prototype.hasOwnProperty.call(data,'plainText')?data.plainText:((Object.prototype.hasOwnProperty.call(data,'content')||Object.prototype.hasOwnProperty.call(data,'text'))?lf_plainText_(content):previous.plainText),LF.MAX_NOTE_CHARS),stored=lf_externalizeTextPair_(auth,project,row&&row.contentStorageJson,content,plain,'note-'+(id||'new')+'.json');
  const patch={userId:auth.user.id,projectId:projectId,folderId:String(Object.prototype.hasOwnProperty.call(data,'folderId')?data.folderId:(row&&row.folderId)||''),title:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'title')?data.title:(row&&row.title)||lf_titleFromText_(plain)||'Untitled Note',200),content:stored.contentPreview,plainText:stored.plainPreview,contentStorageJson:JSON.stringify(stored.storage),format:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'format')?data.format:(row&&row.format)||'html',20),tagsJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'tags')?lf_stringArray_(data.tags):(row?lf_parseJson_(row.tagsJson,[]):[])),pinned:lf_bool_(Object.prototype.hasOwnProperty.call(data,'pinned')?data.pinned:(row&&row.pinned)),locked:lf_bool_(Object.prototype.hasOwnProperty.call(data,'locked')?data.locked:(row&&row.locked)),color:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'color')?data.color:(row&&row.color)||'',30),source:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'source')?data.source:(row&&row.source)||'editor',40),metadataJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'metadata')?data.metadata:(row?lf_parseJson_(row.metadataJson,{}):{})),updatedAt:now,deletedAt:''};
  if(row)row=lf_updateRow_('NOTES',row._row,patch);else{patch.id='note_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('NOTES',patch);}
  lf_activity_(auth.user.id,'notes.save','note',row.id,row.projectId,{title:row.title,externalContent:stored.storage.mode==='drive-json'});return{ok:true,note:lf_publicNote_(row)};
}
function lf_noteGet_(auth, data) {
  const id = String(data.id || data.noteId || '');
  const row = lf_findOne_('NOTES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NOTE_NOT_FOUND', 'Note was not found.', 404);
  return {ok:true, note:lf_publicNote_(row), attachments:lf_attachmentsFor_(auth.user.id,'note',row.id)};
}

function lf_notesList_(auth, data) {
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  let rows = lf_rows_('NOTES').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt &&
      (!scopedProjectId || r.projectId === scopedProjectId) &&
      (!data.folderId || r.folderId === String(data.folderId));
  });
  if (lf_bool_(data.pinnedOnly)) rows = rows.filter(function(r){ return lf_bool_(r.pinned); });
  rows.sort(function(a,b){
    return Number(lf_bool_(b.pinned))-Number(lf_bool_(a.pinned)) || String(b.updatedAt).localeCompare(String(a.updatedAt));
  });
  return {ok:true, notes:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicNote_)};
}

function lf_noteDelete_(auth, data) {
  const id = String(data.id || data.noteId || '');
  const row = lf_findOne_('NOTES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NOTE_NOT_FOUND', 'Note was not found.', 404);
  const updated = lf_updateRow_('NOTES', row._row, {deletedAt:lf_nowIso_(), updatedAt:lf_nowIso_()});
  return {ok:true, note:lf_publicNote_(updated)};
}

function lf_noteRestore_(auth, data) {
  const id = String(data.id || data.noteId || '');
  const row = lf_findOne_('NOTES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NOTE_NOT_FOUND', 'Note was not found.', 404);
  const updated = lf_updateRow_('NOTES', row._row, {deletedAt:'', updatedAt:lf_nowIso_()});
  return {ok:true, note:lf_publicNote_(updated)};
}

function lf_notesRecentlyDeleted_(auth, data) {
  const rows = lf_rows_('NOTES').filter(function(r){
    return r.userId === auth.user.id && !!r.deletedAt && (!data.projectId || r.projectId === String(data.projectId));
  }).sort(function(a,b){ return String(b.deletedAt).localeCompare(String(a.deletedAt)); });
  return {ok:true, notes:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicNote_)};
}

function lf_noteFolderCreate_(auth, data) {
  if (data.projectId) lf_requireOwnedProject_(auth, data.projectId);
  const now = lf_nowIso_();
  const row = lf_appendRow_('NOTE_FOLDERS', {
    id:'notefolder_' + Utilities.getUuid(), userId:auth.user.id,
    projectId:String(data.projectId || ''), parentFolderId:String(data.parentFolderId || ''),
    name:lf_cleanText_(data.name || 'New Folder',120), sortOrder:Number(data.sortOrder || 0),
    createdAt:now, updatedAt:now, deletedAt:''
  });
  return {ok:true, folder:lf_publicNoteFolder_(row)};
}

function lf_noteFolderUpdate_(auth, data) {
  const id = String(data.id || data.folderId || '');
  const row = lf_findOne_('NOTE_FOLDERS', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('FOLDER_NOT_FOUND', 'Note folder was not found.', 404);
  const patch = {updatedAt:lf_nowIso_()};
  if (Object.prototype.hasOwnProperty.call(data,'name')) patch.name = lf_cleanText_(data.name,120);
  if (Object.prototype.hasOwnProperty.call(data,'parentFolderId')) patch.parentFolderId = String(data.parentFolderId || '');
  if (Object.prototype.hasOwnProperty.call(data,'sortOrder')) patch.sortOrder = Number(data.sortOrder || 0);
  return {ok:true, folder:lf_publicNoteFolder_(lf_updateRow_('NOTE_FOLDERS', row._row, patch))};
}

function lf_noteFoldersList_(auth, data) {
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  const rows = lf_rows_('NOTE_FOLDERS').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt && (!scopedProjectId || r.projectId === scopedProjectId);
  }).sort(function(a,b){ return Number(a.sortOrder || 0)-Number(b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)); });
  return {ok:true, folders:rows.map(lf_publicNoteFolder_)};
}

function lf_noteFolderDelete_(auth, data) {
  const id = String(data.id || data.folderId || '');
  const row = lf_findOne_('NOTE_FOLDERS', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('FOLDER_NOT_FOUND', 'Note folder was not found.', 404);
  lf_updateRow_('NOTE_FOLDERS', row._row, {deletedAt:lf_nowIso_(), updatedAt:lf_nowIso_()});
  return {ok:true};
}

function lf_noteTagsList_(auth, data) {
  const scopedProjectId=lf_scopeProjectId_(auth,data),counts = {};
  lf_rows_('NOTES').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt && (!scopedProjectId || r.projectId === scopedProjectId);
  }).forEach(function(r){lf_parseJson_(r.tagsJson,[]).forEach(function(t){ counts[t] = (counts[t] || 0) + 1; });});
  return {ok:true, tags:Object.keys(counts).sort().map(function(name){ return {name:name,count:counts[name]}; })};
}

/* ========================================================================== */
/* ATTACHMENTS / IMPORTS                                                       */
/* ========================================================================== */

function lf_attachmentUpload_(auth, data) {
  const project = data.projectId ? lf_requireOwnedProject_(auth, data.projectId) : null;
  const name = lf_safeFilename_(data.name || data.fileName || 'attachment');
  const mimeType = lf_cleanText_(data.mimeType || 'application/octet-stream',120);
  const base64 = String(data.base64 || data.dataBase64 || '').replace(/^data:[^;]+;base64,/,'');
  if (!base64) throw lf_error_('FILE_DATA_REQUIRED', 'Attachment base64 data is required.', 400);

  const bytes = Utilities.base64Decode(base64);
  if (bytes.length > LF.MAX_UPLOAD_BYTES) throw lf_error_('FILE_TOO_LARGE', 'Attachment exceeds LiteraryFriend upload limit.', 413);
  const blob = Utilities.newBlob(bytes, mimeType, name);
  const category = lf_cleanSlug_(data.category || lf_classifyFile_(name,mimeType,'').category);
  const stored = lf_storeBlobForUser_(auth, project, blob, {
    category:category,
    importMode:lf_bool_(data.importMode),
    storageTarget:data.storageTarget,
    mirrorToLinkedDrive:data.mirrorToLinkedDrive
  });
  const now = lf_nowIso_();
  const meta = lf_deepMerge_(data.metadata || {}, {storage:stored.storage, category:category});

  const row = lf_appendRow_('ATTACHMENTS', {
    id:'attachment_' + Utilities.getUuid(), userId:auth.user.id,
    projectId:project ? project.id : '', ownerType:lf_cleanSlug_(data.ownerType || ''),
    ownerId:String(data.ownerId || ''), name:name, mimeType:mimeType, size:bytes.length,
    driveFileId:stored.internalDriveFileId || '', webViewUrl:stored.webViewUrl || '',
    description:lf_cleanText_(data.description || '',1000),
    metadataJson:JSON.stringify(meta), createdAt:now, deletedAt:''
  });
  lf_activity_(auth.user.id, 'attachments.upload', 'attachment', row.id, row.projectId, {name:name,size:bytes.length,storage:stored.storage});
  return {ok:true, attachment:lf_publicAttachment_(row), storage:stored};
}

function lf_attachmentsList_(auth, data) {
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  let rows = lf_rows_('ATTACHMENTS').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt &&
      (!scopedProjectId || r.projectId === scopedProjectId) &&
      (!data.ownerType || r.ownerType === String(data.ownerType)) &&
      (!data.ownerId || r.ownerId === String(data.ownerId));
  });
  rows.sort(function(a,b){ return String(b.createdAt).localeCompare(String(a.createdAt)); });
  return {ok:true, attachments:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicAttachment_)};
}

function lf_attachmentDelete_(auth, data) {
  const id = String(data.id || data.attachmentId || '');
  const row = lf_findOne_('ATTACHMENTS', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('ATTACHMENT_NOT_FOUND', 'Attachment was not found.', 404);
  try { if (row.driveFileId) DriveApp.getFileById(row.driveFileId).setTrashed(true); } catch (err) {}
  const meta=lf_parseJson_(row.metadataJson,{});
  const extId=meta && meta.storage && meta.storage.linkedDriveFileId;
  if(extId){ try{lf_linkedDriveDeleteFile_(auth.user.id,extId);}catch(err2){} }
  lf_updateRow_('ATTACHMENTS', row._row, {deletedAt:lf_nowIso_()});
  return {ok:true};
}

function lf_importRegister_(auth, data) {
  if (data.projectId) lf_requireOwnedProject_(auth, data.projectId);
  const now = lf_nowIso_();
  const row = lf_appendRow_('IMPORTS', {
    id:'import_' + Utilities.getUuid(), userId:auth.user.id, projectId:String(data.projectId || ''),
    name:lf_cleanText_(data.name || 'Import',180), sourceType:lf_cleanText_(data.sourceType || 'file',80),
    driveFileId:String(data.driveFileId || ''), status:lf_cleanText_(data.status || 'registered',40),
    metadataJson:JSON.stringify(data.metadata || {}), createdAt:now, updatedAt:now
  });
  return {ok:true, item:lf_publicImport_(row)};
}

function lf_importsList_(auth, data) {
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  const rows = lf_rows_('IMPORTS').filter(function(r){
    return r.userId === auth.user.id && (!scopedProjectId || r.projectId === scopedProjectId);
  }).sort(function(a,b){ return String(b.createdAt).localeCompare(String(a.createdAt)); });
  return {ok:true, imports:rows.map(lf_publicImport_)};
}

/* ========================================================================== */
/* ENTITIES / TIMELINE                                                         */
/* ========================================================================== */

function lf_entitySave_(auth, data) {
  const project = lf_requireOwnedProject_(auth, data.projectId);
  const id = String(data.id || data.entityId || '');
  let row = id ? lf_findOne_('ENTITIES', function(r){ return r.id === id && r.userId === auth.user.id; }) : null;
  const now = lf_nowIso_();
  const patch = {
    userId:auth.user.id, projectId:project.id,
    entityType:lf_cleanSlug_(data.entityType || data.type || 'other'),
    name:lf_cleanText_(data.name || 'Untitled',160),
    aliasesJson:JSON.stringify(lf_stringArray_(data.aliases)),
    description:lf_limitText_(data.description || '',50000),
    attributesJson:JSON.stringify(data.attributes || {}),
    relationshipsJson:JSON.stringify(data.relationships || []),
    tagsJson:JSON.stringify(lf_stringArray_(data.tags)),
    driveFileId:String(data.driveFileId || (row && row.driveFileId) || ''),
    updatedAt:now, deletedAt:''
  };
  if (row) row = lf_updateRow_('ENTITIES', row._row, patch);
  else { patch.id='entity_' + Utilities.getUuid(); patch.createdAt=now; row=lf_appendRow_('ENTITIES',patch); }
  return {ok:true, entity:lf_publicEntity_(row)};
}

function lf_entityGet_(auth, data) {
  const id = String(data.id || data.entityId || '');
  const row = lf_findOne_('ENTITIES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('ENTITY_NOT_FOUND', 'Entity was not found.', 404);
  return {ok:true, entity:lf_publicEntity_(row)};
}

function lf_entitiesList_(auth, data) {
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  let rows = lf_rows_('ENTITIES').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt &&
      (!scopedProjectId || r.projectId === scopedProjectId);
  });
  if (data.entityType) rows = rows.filter(function(r){ return r.entityType === String(data.entityType); });
  rows.sort(function(a,b){ return String(a.name).localeCompare(String(b.name)); });
  return {ok:true, entities:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicEntity_)};
}

function lf_entityDelete_(auth, data) {
  const id = String(data.id || data.entityId || '');
  const row = lf_findOne_('ENTITIES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('ENTITY_NOT_FOUND', 'Entity was not found.', 404);
  lf_updateRow_('ENTITIES', row._row, {deletedAt:lf_nowIso_(), updatedAt:lf_nowIso_()});
  return {ok:true};
}

function lf_timelineSave_(auth, data) {
  const project = lf_requireOwnedProject_(auth, data.projectId);
  const id = String(data.id || data.eventId || '');
  let row = id ? lf_findOne_('TIMELINE_EVENTS', function(r){ return r.id === id && r.userId === auth.user.id; }) : null;
  const now=lf_nowIso_();
  const patch={
    userId:auth.user.id, projectId:project.id,
    title:lf_cleanText_(data.title || 'Untitled Event',180),
    description:lf_limitText_(data.description || '',50000),
    startValue:lf_cleanText_(data.startValue || data.start || '',120),
    endValue:lf_cleanText_(data.endValue || data.end || '',120),
    calendar:lf_cleanText_(data.calendar || 'default',80),
    era:lf_cleanText_(data.era || '',80),
    sortKey:Number(data.sortKey || 0),
    participantIdsJson:JSON.stringify(data.participantIds || []),
    locationIdsJson:JSON.stringify(data.locationIds || []),
    tagsJson:JSON.stringify(lf_stringArray_(data.tags)),
    metadataJson:JSON.stringify(data.metadata || {}),
    updatedAt:now, deletedAt:''
  };
  if(row) row=lf_updateRow_('TIMELINE_EVENTS',row._row,patch);
  else {patch.id='event_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('TIMELINE_EVENTS',patch);}
  return {ok:true,event:lf_publicTimeline_(row)};
}

function lf_timelineList_(auth,data){
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  const rows=lf_rows_('TIMELINE_EVENTS').filter(function(r){
    return r.userId===auth.user.id&&!r.deletedAt&&(!scopedProjectId||r.projectId===scopedProjectId);
  }).sort(function(a,b){return Number(a.sortKey||0)-Number(b.sortKey||0)||String(a.startValue).localeCompare(String(b.startValue));});
  return {ok:true,events:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicTimeline_)};
}

function lf_timelineDelete_(auth,data){
  const id=String(data.id||data.eventId||'');
  const row=lf_findOne_('TIMELINE_EVENTS',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('EVENT_NOT_FOUND','Timeline event was not found.',404);
  lf_updateRow_('TIMELINE_EVENTS',row._row,{deletedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});
  return {ok:true};
}

/* ========================================================================== */
/* CONSTRUCTED / FANTASY LANGUAGES                                             */
/* ========================================================================== */

function lf_languageSave_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId);
  const id=String(data.id||data.languageId||'');
  let row=id?lf_findOne_('LANGUAGES',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  const now=lf_nowIso_();
  const patch={
    userId:auth.user.id,projectId:project.id,
    name:lf_cleanText_(data.name||'Unnamed Language',160),
    code:lf_cleanSlug_(data.code||data.name||'lang').slice(0,24),
    description:lf_limitText_(data.description||'',50000),
    phonologyJson:JSON.stringify(data.phonology||{}),
    grammarJson:JSON.stringify(data.grammar||{}),
    orthographyJson:JSON.stringify(data.orthography||{}),
    settingsJson:JSON.stringify(data.settings||{}),
    updatedAt:now,deletedAt:''
  };
  if(row)row=lf_updateRow_('LANGUAGES',row._row,patch);
  else{patch.id='language_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('LANGUAGES',patch);}
  return {ok:true,language:lf_publicLanguage_(row)};
}

function lf_languageGet_(auth,data){
  const id=String(data.id||data.languageId||'');
  const row=lf_findOne_('LANGUAGES',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('LANGUAGE_NOT_FOUND','Language was not found.',404);
  const words=lf_rows_('LEXICON').filter(function(r){return r.userId===auth.user.id&&r.languageId===id&&!r.deletedAt;}).map(lf_publicLexicon_);
  return {ok:true,language:lf_publicLanguage_(row),lexicon:words};
}

function lf_languagesList_(auth,data){
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  const rows=lf_rows_('LANGUAGES').filter(function(r){
    return r.userId===auth.user.id&&!r.deletedAt&&(!scopedProjectId||r.projectId===scopedProjectId);
  }).sort(function(a,b){return String(a.name).localeCompare(String(b.name));});
  return {ok:true,languages:rows.map(lf_publicLanguage_)};
}

function lf_languageDelete_(auth,data){
  const id=String(data.id||data.languageId||'');
  const row=lf_findOne_('LANGUAGES',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('LANGUAGE_NOT_FOUND','Language was not found.',404);
  lf_updateRow_('LANGUAGES',row._row,{deletedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});
  return {ok:true};
}

function lf_lexiconSave_(auth,data){
  const lang=lf_findOne_('LANGUAGES',function(r){return r.id===String(data.languageId||'')&&r.userId===auth.user.id&&!r.deletedAt;});
  if(!lang)throw lf_error_('LANGUAGE_NOT_FOUND','Language was not found.',404);
  const id=String(data.id||data.lexiconId||'');
  let row=id?lf_findOne_('LEXICON',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  const now=lf_nowIso_();
  const word=lf_cleanText_(data.word||'',200);
  if(!word)throw lf_error_('WORD_REQUIRED','A word is required.',400);
  const patch={
    userId:auth.user.id,projectId:lang.projectId,languageId:lang.id,
    word:word,normalizedWord:word.toLowerCase(),
    partOfSpeech:lf_cleanText_(data.partOfSpeech||'',80),
    definition:lf_limitText_(data.definition||'',10000),
    pronunciation:lf_cleanText_(data.pronunciation||'',500),
    etymology:lf_limitText_(data.etymology||'',5000),
    formsJson:JSON.stringify(data.forms||{}),
    tagsJson:JSON.stringify(lf_stringArray_(data.tags)),
    notes:lf_limitText_(data.notes||'',10000),
    updatedAt:now,deletedAt:''
  };
  if(row)row=lf_updateRow_('LEXICON',row._row,patch);
  else{patch.id='word_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('LEXICON',patch);}
  return {ok:true,entry:lf_publicLexicon_(row)};
}

function lf_lexiconList_(auth,data){
  const scopedProjectId=data.languageId?'':lf_scopeProjectId_(auth,data);
  let rows=lf_rows_('LEXICON').filter(function(r){
    return r.userId===auth.user.id&&!r.deletedAt&&(!scopedProjectId||r.projectId===scopedProjectId)&&(!data.languageId||r.languageId===String(data.languageId));
  });
  if(data.query){const q=String(data.query).toLowerCase();rows=rows.filter(function(r){return String(r.word).toLowerCase().indexOf(q)>=0||String(r.definition).toLowerCase().indexOf(q)>=0;});}
  rows.sort(function(a,b){return String(a.normalizedWord).localeCompare(String(b.normalizedWord));});
  return {ok:true,entries:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicLexicon_)};
}

function lf_lexiconDelete_(auth,data){
  const id=String(data.id||data.lexiconId||'');
  const row=lf_findOne_('LEXICON',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('LEXICON_NOT_FOUND','Lexicon entry was not found.',404);
  lf_updateRow_('LEXICON',row._row,{deletedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});
  return {ok:true};
}

/* ========================================================================== */
/* PLOT / CONTINUITY ISSUES                                                    */
/* ========================================================================== */

function lf_plotIssueSave_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId);
  const id=String(data.id||data.issueId||'');
  let row=id?lf_findOne_('PLOT_ISSUES',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  const now=lf_nowIso_();
  const patch={
    userId:auth.user.id,projectId:project.id,
    title:lf_cleanText_(data.title||'Continuity Issue',180),
    description:lf_limitText_(data.description||'',50000),
    issueType:lf_cleanSlug_(data.issueType||'continuity'),
    severity:lf_cleanText_(data.severity||'medium',20),
    status:lf_cleanText_(data.status||'open',30),
    relatedNodeIdsJson:JSON.stringify(data.relatedNodeIds||[]),
    evidenceJson:JSON.stringify(data.evidence||[]),
    suggestion:lf_limitText_(data.suggestion||'',20000),
    resolution:lf_limitText_(data.resolution||'',20000),
    metadataJson:JSON.stringify(data.metadata||{}),
    updatedAt:now,resolvedAt:data.status==='resolved'?(row&&row.resolvedAt||now):''
  };
  if(row)row=lf_updateRow_('PLOT_ISSUES',row._row,patch);
  else{patch.id='issue_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('PLOT_ISSUES',patch);}
  return {ok:true,issue:lf_publicPlotIssue_(row)};
}

function lf_plotIssuesList_(auth,data){
  const scopedProjectId=lf_scopeProjectId_(auth,data);
  let rows=lf_rows_('PLOT_ISSUES').filter(function(r){
    return r.userId===auth.user.id&&(!scopedProjectId||r.projectId===scopedProjectId);
  });
  if(data.status)rows=rows.filter(function(r){return r.status===String(data.status);});
  if(data.severity)rows=rows.filter(function(r){return r.severity===String(data.severity);});
  rows.sort(function(a,b){return String(b.updatedAt).localeCompare(String(a.updatedAt));});
  return {ok:true,issues:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicPlotIssue_)};
}

function lf_plotIssueResolve_(auth,data){
  const id=String(data.id||data.issueId||'');
  const row=lf_findOne_('PLOT_ISSUES',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('ISSUE_NOT_FOUND','Plot issue was not found.',404);
  const updated=lf_updateRow_('PLOT_ISSUES',row._row,{
    status:'resolved',
    resolution:lf_limitText_(data.resolution||row.resolution||'',20000),
    resolvedAt:lf_nowIso_(),updatedAt:lf_nowIso_()
  });
  return {ok:true,issue:lf_publicPlotIssue_(updated)};
}

function lf_plotIssueDelete_(auth,data){
  const id=String(data.id||data.issueId||'');
  const row=lf_findOne_('PLOT_ISSUES',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('ISSUE_NOT_FOUND','Plot issue was not found.',404);
  lf_deleteRow_('PLOT_ISSUES',row._row);
  return {ok:true};
}

/**
 * Deterministic local scan. This is intentionally not advertised as AI.
 * It catches common continuity-warning patterns and returns suggestions
 * without silently modifying the user's work.
 */
function lf_plotIssueScan_(auth,data){
  const projectId=String(data.projectId||lf_scopeProjectId_(auth,data)||'');
  if(!projectId)throw lf_error_('PROJECT_REQUIRED','Choose a project before scanning for plot and continuity issues.',400);
  const project=lf_requireOwnedProject_(auth,projectId),corpus=[];
  lf_rows_('NODES').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt&&r.nodeType!=='directory';}).forEach(function(r){corpus.push({id:r.id,type:'node',title:r.title,text:String(lf_fullTextPair_(r).plainText||'')});});
  lf_rows_('NOTES').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;}).forEach(function(r){corpus.push({id:r.id,type:'note',title:r.title,text:String(lf_fullTextPair_(r).plainText||'')});});
  const warnings=[];
  function add(w){if(warnings.length<LF.MAX_SEARCH_RESULTS)warnings.push(w);}
  function ev(item,start,len){start=Math.max(0,Number(start||0));len=Math.max(1,Number(len||1));const a=Math.max(0,start-90),b=Math.min(item.text.length,start+len+150);return{sourceId:item.id,sourceType:item.type,title:item.title,startOffset:start,endOffset:start+len,quote:item.text.slice(a,b)};}
  corpus.forEach(function(item){
    const marker=/\b(todo|fixme|plot\s*hole|plothole|continuity\s+error|inconsistent|doesn't\s+make\s+sense|does\s+not\s+make\s+sense)\b/ig;let m;
    while((m=marker.exec(item.text))&&warnings.length<LF.MAX_SEARCH_RESULTS){const e=ev(item,m.index,m[0].length);add({kind:'explicit-marker',severity:'medium',confidence:0.98,sourceId:item.id,sourceType:item.type,title:item.title,quote:e.quote,evidence:[e],message:'This passage contains an explicit continuity or revision marker.'});}
    const abrupt=/\b(suddenly|somehow)\b/ig;
    if(item.text.length>500&&(m=abrupt.exec(item.text))){const e=ev(item,m.index,m[0].length);add({kind:'review-transition',severity:'low',confidence:0.35,sourceId:item.id,sourceType:item.type,title:item.title,quote:e.quote,evidence:[e],message:'Review this transition for an unexplained causal step. This is a review signal, not proof of a plot hole.'});}
  });
  const timeline=lf_rows_('TIMELINE_EVENTS').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;}),dupes={};
  timeline.forEach(function(e){
    const k=(String(e.startValue||'')+'|'+String(e.title||'')).toLowerCase();(dupes[k]||(dupes[k]=[])).push(e);
    const a=lf_parseComparableTime_(e.startValue),b=lf_parseComparableTime_(e.endValue);
    if(a!==null&&b!==null&&b<a)add({kind:'timeline-range-reversed',severity:'high',confidence:0.99,eventIds:[e.id],message:'Timeline event “'+e.title+'” ends before it begins.',evidence:[{sourceId:e.id,sourceType:'timeline',quote:String(e.startValue)+' → '+String(e.endValue)}]});
  });
  Object.keys(dupes).forEach(function(k){if(dupes[k].length>1)add({kind:'possible-duplicate-timeline-event',severity:'medium',confidence:0.8,eventIds:dupes[k].map(function(e){return e.id;}),message:'Multiple timeline events share the same title and start value.',evidence:dupes[k].map(function(e){return{sourceId:e.id,sourceType:'timeline',quote:e.title+' @ '+e.startValue};})});});
  const facts=lf_rows_('STORY_FACTS').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&r.status==='active'&&['canon','true','established'].indexOf(String(r.truthStatus||'canon'))>=0;}),groups={};
  facts.forEach(function(f){const k=[f.subjectType,f.subjectId,f.predicate].join('|').toLowerCase();(groups[k]||(groups[k]=[])).push(f);});
  Object.keys(groups).forEach(function(k){const g=groups[k];for(let i=0;i<g.length;i++){for(let j=i+1;j<g.length;j++){const a=g[i],b=g[j];if(String(a.valueJson)===String(b.valueJson)||!lf_factPeriodsOverlap_(a,b))continue;add({kind:'canon-fact-conflict',severity:'high',confidence:0.9,factIds:[a.id,b.id],message:'Two simultaneously valid canon facts give different values for “'+a.predicate+'”.',evidence:[{sourceId:a.sourceId||a.id,sourceType:a.sourceType||'story-fact',quote:a.sourceQuote||a.predicate+': '+a.valueJson},{sourceId:b.sourceId||b.id,sourceType:b.sourceType||'story-fact',quote:b.sourceQuote||b.predicate+': '+b.valueJson}]});}}});
  lf_rows_('PLOT_THREADS').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id;}).forEach(function(t){if(t.status==='active'&&t.introducedNodeId&&!t.lastTouchedNodeId&&!t.resolutionNodeId)add({kind:'possibly-dangling-thread',severity:t.importance==='high'?'high':'medium',confidence:0.72,threadIds:[t.id],message:'Active plot thread “'+t.name+'” has an introduction but no recorded progression or resolution.',evidence:[{sourceId:t.introducedNodeId,sourceType:'node',quote:'Thread introduced here.'}]});});
  lf_rows_('CAUSAL_LINKS').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id;}).forEach(function(l){if(lf_bool_(l.required)&&(!l.fromId||!l.toId))add({kind:'broken-causal-link',severity:'high',confidence:0.99,causalLinkIds:[l.id],message:'A required causal relationship is missing its cause or consequence endpoint.',evidence:[{sourceId:l.id,sourceType:'causal-link',quote:l.notes||l.relation}]});});
  const entityIds={};lf_rows_('ENTITIES').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;}).forEach(function(e){entityIds[e.id]=true;});
  const factIds={};facts.forEach(function(f){factIds[f.id]=true;});
  lf_rows_('KNOWLEDGE_LEDGER').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id;}).forEach(function(k){if(!entityIds[k.characterId]||!factIds[k.factId])add({kind:'knowledge-ledger-orphan',severity:'high',confidence:0.99,knowledgeIds:[k.id],message:'A character-knowledge record points to a missing character or inactive canon fact.',evidence:[{sourceId:k.id,sourceType:'knowledge-ledger',quote:'character '+k.characterId+' / fact '+k.factId}]});});
  const createdIssues=[];
  if(lf_bool_(data.createIssues))warnings.forEach(function(w){
    const fingerprint=lf_sha256Hex_(w.kind+'|'+JSON.stringify((w.evidence||[]).map(function(e){return[e.sourceType,e.sourceId,e.startOffset||0,e.endOffset||0];}))).slice(0,32);
    const existing=lf_findOne_('PLOT_ISSUES',function(r){const m=lf_parseJson_(r.metadataJson,{});return r.userId===auth.user.id&&r.projectId===project.id&&m.scannerFingerprint===fingerprint&&['open','review-later'].indexOf(r.status)>=0;});
    if(existing){createdIssues.push(lf_publicPlotIssue_(existing));return;}
    try{createdIssues.push(lf_plotIssueSave_(auth,{projectId:project.id,title:lf_scanTitle_(w.kind),description:w.message,issueType:w.kind,severity:w.severity||'medium',status:'open',relatedNodeIds:(w.evidence||[]).filter(function(e){return e.sourceType==='node';}).map(function(e){return e.sourceId;}),evidence:w.evidence||[],suggestion:'Review the cited evidence against canon, chronology, character knowledge, and deliberate exceptions. Then fix, ignore, mark intentional, mark false positive, or review later.',metadata:{scanner:'deterministic-local-v2',scannerFingerprint:fingerprint,confidence:w.confidence||0.5}}).issue);}catch(ignore){}
  });
  return{ok:true,projectId:project.id,scanner:'deterministic-local-v2',warningCount:warnings.length,warnings:warnings,createdIssues:createdIssues};
}
function lf_scanTitle_(kind){return lf_cleanText_(String(kind||'continuity').replace(/[-_]+/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();}),180);}
function lf_parseComparableTime_(v){if(v===null||typeof v==='undefined'||String(v).trim()==='')return null;const raw=String(v).trim();if(/^[-+]?\d+(\.\d+)?$/.test(raw))return Number(raw);const d=Date.parse(raw);return isNaN(d)?null:d;}
function lf_factPeriodsOverlap_(a,b){if(!a.validFrom&&!a.validUntil&&!b.validFrom&&!b.validUntil)return true;const a1=lf_parseComparableTime_(a.validFrom),a2=lf_parseComparableTime_(a.validUntil),b1=lf_parseComparableTime_(b.validFrom),b2=lf_parseComparableTime_(b.validUntil);if(a1===null&&a2===null&&b1===null&&b2===null)return String(a.validFrom||'')===String(b.validFrom||'')&&String(a.validUntil||'')===String(b.validUntil||'');const loA=a1===null?-Infinity:a1,hiA=a2===null?Infinity:a2,loB=b1===null?-Infinity:b1,hiB=b2===null?Infinity:b2;return loA<=hiB&&loB<=hiA;}

function lf_search_(auth,data){
  const q=String(data.query||data.q||'').trim().toLowerCase();if(!q)throw lf_error_('QUERY_REQUIRED','Search query is required.',400);
  const projectId=lf_scopeProjectId_(auth,data),wanted=(data.types&&Array.isArray(data.types)?data.types:['note','node','entity','timeline','language','lexicon','plotissue']).map(String),results=[];
  function add(type,id,title,text,project,updated,extra){const hay=(String(title||'')+'\n'+String(text||'')).toLowerCase(),idx=hay.indexOf(q);if(idx<0)return;let score=1;if(String(title||'').toLowerCase().indexOf(q)>=0)score+=5;const preview=lf_plainText_(text||'').slice(Math.max(0,idx-90),Math.max(0,idx-90)+260);results.push(Object.assign({type:type,id:id,title:title||'',projectId:project||'',score:score,preview:preview,updatedAt:updated||''},extra||{}));}
  if(wanted.indexOf('note')>=0)lf_rows_('NOTES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('note',r.id,r.title,lf_fullTextPair_(r).plainText,r.projectId,r.updatedAt,{tags:lf_parseJson_(r.tagsJson,[])});});
  if(wanted.indexOf('node')>=0)lf_rows_('NODES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('node',r.id,r.title,lf_fullTextPair_(r).plainText,r.projectId,r.updatedAt,{nodeType:r.nodeType});});
  if(wanted.indexOf('entity')>=0)lf_rows_('ENTITIES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('entity',r.id,r.name,r.description,r.projectId,r.updatedAt,{entityType:r.entityType});});
  if(wanted.indexOf('timeline')>=0)lf_rows_('TIMELINE_EVENTS').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('timeline',r.id,r.title,r.description,r.projectId,r.updatedAt,{startValue:r.startValue});});
  if(wanted.indexOf('language')>=0)lf_rows_('LANGUAGES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('language',r.id,r.name,r.description,r.projectId,r.updatedAt,{});});
  if(wanted.indexOf('lexicon')>=0)lf_rows_('LEXICON').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('lexicon',r.id,r.word,r.definition+'\n'+r.notes,r.projectId,r.updatedAt,{languageId:r.languageId});});
  if(wanted.indexOf('plotissue')>=0)lf_rows_('PLOT_ISSUES').filter(function(r){return r.userId===auth.user.id&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('plotissue',r.id,r.title,r.description+'\n'+r.suggestion+'\n'+r.resolution,r.projectId,r.updatedAt,{status:r.status,severity:r.severity});});
  results.sort(function(a,b){return b.score-a.score||String(b.updatedAt).localeCompare(String(a.updatedAt));});return{ok:true,query:q,projectId:projectId||'',results:results.slice(0,Math.min(Number(data.limit||LF.MAX_SEARCH_RESULTS),LF.MAX_SEARCH_RESULTS))};
}
function lf_savedSearchSave_(auth,data){
  const id=String(data.id||data.savedSearchId||'');
  let row=id?lf_findOne_('SAVED_SEARCHES',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  const now=lf_nowIso_();
  const patch={userId:auth.user.id,projectId:String(data.projectId||''),name:lf_cleanText_(data.name||'Saved Search',120),query:lf_cleanText_(data.query||'',1000),filtersJson:JSON.stringify(data.filters||{}),updatedAt:now};
  if(row)row=lf_updateRow_('SAVED_SEARCHES',row._row,patch);
  else{patch.id='search_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('SAVED_SEARCHES',patch);}
  return {ok:true,savedSearch:lf_publicSavedSearch_(row)};
}

function lf_savedSearchList_(auth,data){const scopedProjectId=lf_scopeProjectId_(auth,data);const rows=lf_rows_('SAVED_SEARCHES').filter(function(r){return r.userId===auth.user.id&&(!scopedProjectId||r.projectId===scopedProjectId);});return{ok:true,savedSearches:rows.map(lf_publicSavedSearch_)};}
function lf_savedSearchDelete_(auth,data){
  const id=String(data.id||data.savedSearchId||'');
  const row=lf_findOne_('SAVED_SEARCHES',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('SEARCH_NOT_FOUND','Saved search was not found.',404);
  lf_deleteRow_('SAVED_SEARCHES',row._row);
  return {ok:true};
}

/* ========================================================================== */
/* READING STATE / READ ALOUD SUPPORT                                          */
/* ========================================================================== */

function lf_readingStateGet_(auth,data){
  const targetType=lf_cleanSlug_(data.targetType||'note');
  const targetId=String(data.targetId||'');
  const row=lf_findOne_('READING_STATE',function(r){return r.userId===auth.user.id&&r.targetType===targetType&&r.targetId===targetId;});
  return {ok:true,state:row?lf_publicReadingState_(row):{targetType:targetType,targetId:targetId,position:0,speed:1,voice:'',settings:{}}};
}

function lf_readingStateSave_(auth,data){
  const targetType=lf_cleanSlug_(data.targetType||'note');
  const targetId=String(data.targetId||'');
  if(!targetId)throw lf_error_('TARGET_REQUIRED','Reading target is required.',400);
  let row=lf_findOne_('READING_STATE',function(r){return r.userId===auth.user.id&&r.targetType===targetType&&r.targetId===targetId;});
  const patch={userId:auth.user.id,projectId:String(data.projectId||''),targetType:targetType,targetId:targetId,position:Number(data.position||0),speed:Number(data.speed||1),voice:lf_cleanText_(data.voice||'',200),settingsJson:JSON.stringify(data.settings||{}),updatedAt:lf_nowIso_()};
  if(row)row=lf_updateRow_('READING_STATE',row._row,patch);
  else{patch.id='reading_'+Utilities.getUuid();row=lf_appendRow_('READING_STATE',patch);}
  return {ok:true,state:lf_publicReadingState_(row)};
}

/* ========================================================================== */
/* EXPORT / BACKUP                                                            */
/* ========================================================================== */

function lf_exportProject_(auth,data){const project=lf_requireOwnedProject_(auth,data.projectId||data.id),pack=lf_buildProjectExport_(auth.user.id,project.id),name=lf_safeFilename_(project.title+' — LiteraryFriend V2 Export — '+lf_dateStamp_()+'.json'),blob=Utilities.newBlob(JSON.stringify(pack,null,2),MimeType.PLAIN_TEXT,name),stored=lf_storeBlobForUser_(auth,project,blob,{category:'exports',storageTarget:data.storageTarget,mirrorToLinkedDrive:data.mirrorToLinkedDrive}),now=lf_nowIso_(),row=lf_appendRow_('EXPORTS',{id:'export_'+Utilities.getUuid(),userId:auth.user.id,projectId:project.id,exportType:'project-json-v2',name:name,driveFileId:stored.internalDriveFileId||'',status:'complete',metadataJson:JSON.stringify({storage:stored.storage,url:stored.webViewUrl||''}),createdAt:now,updatedAt:now});return{ok:true,export:lf_publicExport_(row),download:{driveFileId:stored.internalDriveFileId||'',linkedDriveFileId:stored.linkedDriveFileId||'',url:stored.webViewUrl||''},storage:stored.storage,data:lf_bool_(data.includeInline)?pack:undefined};}
function lf_exportUser_(auth,data){const pack=lf_buildUserExport_(auth.user.id),name='LiteraryFriend Full V2 Export — '+lf_dateStamp_()+'.json',blob=Utilities.newBlob(JSON.stringify(pack,null,2),MimeType.PLAIN_TEXT,name),stored=lf_storeBlobForUser_(auth,null,blob,{category:'exports',storageTarget:data.storageTarget,mirrorToLinkedDrive:data.mirrorToLinkedDrive}),now=lf_nowIso_(),row=lf_appendRow_('EXPORTS',{id:'export_'+Utilities.getUuid(),userId:auth.user.id,projectId:'',exportType:'user-json-v2',name:name,driveFileId:stored.internalDriveFileId||'',status:'complete',metadataJson:JSON.stringify({storage:stored.storage,url:stored.webViewUrl||''}),createdAt:now,updatedAt:now});return{ok:true,export:lf_publicExport_(row),download:{driveFileId:stored.internalDriveFileId||'',linkedDriveFileId:stored.linkedDriveFileId||'',url:stored.webViewUrl||''},storage:stored.storage,data:lf_bool_(data.includeInline)?pack:undefined};}
function lf_backupCreate_(auth,data){const pack=lf_buildUserExport_(auth.user.id),name='LiteraryFriend V2 Backup — '+lf_dateStamp_(true)+'.json',blob=Utilities.newBlob(JSON.stringify(pack),MimeType.PLAIN_TEXT,name),stored=lf_storeBlobForUser_(auth,null,blob,{category:'backup',storageTarget:data.storageTarget,mirrorToLinkedDrive:data.mirrorToLinkedDrive});lf_activity_(auth.user.id,'backup.create','file',stored.internalDriveFileId||stored.linkedDriveFileId||'','',{name:name,storage:stored.storage});return{ok:true,backup:{driveFileId:stored.internalDriveFileId||'',linkedDriveFileId:stored.linkedDriveFileId||'',url:stored.webViewUrl||'',name:name,createdAt:lf_nowIso_(),storage:stored.storage}};}
function lf_buildProjectExport_(userId,projectId){
  const project=lf_findOne_('PROJECTS',function(r){return r.id===projectId&&r.userId===userId;});if(!project)throw lf_error_('PROJECT_NOT_FOUND','Project was not found.',404);
  const mine=function(sheet){return lf_rows_(sheet).filter(function(r){return r.userId===userId&&r.projectId===projectId;});};
  return{schema:'literaryfriend.project.export.v2',exportedAt:lf_nowIso_(),project:lf_publicProject_(project),nodes:mine('NODES').map(lf_publicNode_),notes:mine('NOTES').map(lf_publicNote_),noteFolders:mine('NOTE_FOLDERS').map(lf_publicNoteFolder_),entities:mine('ENTITIES').map(lf_publicEntity_),timeline:mine('TIMELINE_EVENTS').map(lf_publicTimeline_),languages:mine('LANGUAGES').map(lf_publicLanguage_),lexicon:mine('LEXICON').map(lf_publicLexicon_),plotIssues:mine('PLOT_ISSUES').map(lf_publicPlotIssue_),attachments:mine('ATTACHMENTS').filter(function(r){return !r.deletedAt;}).map(lf_publicAttachment_),imports:mine('IMPORTS').map(lf_publicImport_),fileIndex:mine('FILE_INDEX').map(function(r){const x=lf_publicFileIndex_(r);x.fullText=lf_fileIndexFullText_(r);return x;}),storyState:{facts:mine('STORY_FACTS').map(lf_publicStoryFact_),knowledge:mine('KNOWLEDGE_LEDGER').map(lf_publicKnowledge_),plotThreads:mine('PLOT_THREADS').map(lf_publicPlotThread_),causalLinks:mine('CAUSAL_LINKS').map(lf_publicCausalLink_),worldRules:mine('WORLD_RULES').map(lf_publicWorldRule_),entityMentions:mine('ENTITY_MENTIONS').map(function(r){return{id:r.id,projectId:r.projectId,entityId:r.entityId,nodeId:r.nodeId,startOffset:Number(r.startOffset||0),endOffset:Number(r.endOffset||0),quote:r.quote||'',context:r.context||'',metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt};})},projectRelations:lf_rows_('PROJECT_RELATIONS').filter(function(r){return r.userId===userId&&!r.deletedAt&&(r.parentProjectId===projectId||r.childProjectId===projectId);}).map(lf_publicProjectRelation_),editorRuns:mine('EDITOR_RUNS').map(lf_publicEditorRun_),mergeJobs:mine('MERGE_JOBS').map(lf_publicMergeJob_),books:mine('BOOKS').map(lf_publicBook_),bookEditions:mine('BOOK_EDITIONS').map(lf_publicBookEdition_),bookChapters:mine('BOOK_CHAPTERS').map(lf_publicBookChapter_),artProjects:mine('ART_PROJECTS').map(lf_publicArtProject_),revisionSnapshots:mine('REVISION_SNAPSHOTS').map(function(r){return{id:r.id,projectId:r.projectId,targetType:r.targetType,targetId:r.targetId,label:r.label,sourceAction:r.sourceAction,createdAt:r.createdAt};})};
}
function lf_buildUserExport_(userId){const user=lf_findOne_('USERS',function(r){return r.id===userId;}),projects=lf_rows_('PROJECTS').filter(function(r){return r.userId===userId;});return{schema:'literaryfriend.user.export.v2',exportedAt:lf_nowIso_(),user:user?lf_privateUser_(user):null,recoveryContacts:lf_rows_('RECOVERY_CONTACTS').filter(function(r){return r.userId===userId;}).map(lf_publicRecoveryContact_),driveLinks:lf_rows_('DRIVE_LINKS').filter(function(r){return r.userId===userId;}).map(lf_publicDriveLink_),projects:projects.map(function(pr){return lf_buildProjectExport_(userId,pr.id);}),unfiledNotes:lf_rows_('NOTES').filter(function(r){return r.userId===userId&&!r.projectId;}).map(lf_publicNote_),savedSearches:lf_rows_('SAVED_SEARCHES').filter(function(r){return r.userId===userId;}).map(lf_publicSavedSearch_),readingState:lf_rows_('READING_STATE').filter(function(r){return r.userId===userId;}).map(lf_publicReadingState_)};}
function lf_trashList_(auth,data){const projectId=lf_scopeProjectId_(auth,data),out=[];lf_rows_('NOTES').filter(function(r){return r.userId===auth.user.id&&r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){out.push({type:'note',item:lf_publicNote_(r),deletedAt:r.deletedAt});});lf_rows_('NODES').filter(function(r){return r.userId===auth.user.id&&r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){out.push({type:'node',item:lf_publicNode_(r),deletedAt:r.deletedAt});});lf_rows_('ENTITIES').filter(function(r){return r.userId===auth.user.id&&r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){out.push({type:'entity',item:lf_publicEntity_(r),deletedAt:r.deletedAt});});out.sort(function(a,b){return String(b.deletedAt).localeCompare(String(a.deletedAt));});return{ok:true,items:out.slice(0,LF.MAX_LIST_RESULTS)};}
function lf_activityList_(auth,data){const scopedProjectId=lf_scopeProjectId_(auth,data);let rows=lf_rows_('ACTIVITY').filter(function(r){return r.userId===auth.user.id&&(!scopedProjectId||r.projectId===scopedProjectId);});rows.sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});return{ok:true,activity:rows.slice(0,Math.min(Number(data.limit||100),500)).map(function(r){return{id:r.id,action:r.action,targetType:r.targetType,targetId:r.targetId,projectId:r.projectId,details:lf_parseJson_(r.detailsJson,{}),createdAt:r.createdAt};})};}
function lf_db_(){
  const id=PropertiesService.getScriptProperties().getProperty('LF_DB_ID');
  if(!id)throw lf_error_('NOT_CONFIGURED','Run LITERARYFRIEND_SETUP() first.',503);
  return SpreadsheetApp.openById(id);
}

function lf_sheet_(name){
  const sh=lf_db_().getSheetByName(name);
  if(!sh)throw lf_error_('SCHEMA_MISSING','Missing database sheet: '+name,500);
  return sh;
}

function lf_headers_(name){
  const h=LF_SHEETS[name];
  if(!h)throw new Error('Unknown LiteraryFriend sheet: '+name);
  return h;
}

function lf_ensureSheet_(ss,name,headers){
  let sh=ss.getSheetByName(name);
  if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0)sh.getRange(1,1,1,headers.length).setValues([headers]);
  else{
    const current=sh.getRange(1,1,1,Math.max(headers.length,sh.getLastColumn())).getValues()[0];
    headers.forEach(function(h,i){if(current[i]!==h)sh.getRange(1,i+1).setValue(h);});
  }
  sh.setFrozenRows(1);
  return sh;
}

function lf_rows_(name){
  const sh=lf_sheet_(name),headers=lf_headers_(name),last=sh.getLastRow();
  if(last<2)return[];
  return sh.getRange(2,1,last-1,headers.length).getValues().map(function(row,i){return lf_rowObject_(headers,row,i+2);});
}

function lf_rowObject_(headers,row,rowNumber){
  const o={_row:rowNumber};
  headers.forEach(function(h,i){o[h]=row[i];});
  return o;
}

function lf_appendRow_(name,obj){
  const sh=lf_sheet_(name),headers=lf_headers_(name);
  const row=headers.map(function(h){return lf_cell_(Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:'');});
  sh.appendRow(row);
  return lf_rowObject_(headers,row,sh.getLastRow());
}

function lf_updateRow_(name,rowNumber,patch){
  const sh=lf_sheet_(name),headers=lf_headers_(name);
  const row=sh.getRange(rowNumber,1,1,headers.length).getValues()[0];
  headers.forEach(function(h,i){if(Object.prototype.hasOwnProperty.call(patch,h))row[i]=lf_cell_(patch[h]);});
  sh.getRange(rowNumber,1,1,headers.length).setValues([row]);
  return lf_rowObject_(headers,row,rowNumber);
}

function lf_deleteRow_(name,rowNumber){lf_sheet_(name).deleteRow(rowNumber);}

function lf_findOne_(name,predicate){
  const rows=lf_rows_(name);
  for(let i=0;i<rows.length;i++)if(predicate(rows[i]))return rows[i];
  return null;
}

function lf_cell_(v){
  if(v===null||typeof v==='undefined')return'';
  if(typeof v==='object')return JSON.stringify(v);
  return v;
}

function lf_withWriteLock_(fn){
  const lock=LockService.getScriptLock();
  lock.waitLock(LF.LOCK_WAIT_MS);
  try{return fn();}finally{SpreadsheetApp.flush();lock.releaseLock();}
}

/* ========================================================================== */
/* DRIVE                                                                       */
/* ========================================================================== */

function lf_getOrCreateChildFolder_(parent,name){
  const it=parent.getFoldersByName(name);
  return it.hasNext()?it.next():parent.createFolder(name);
}

function lf_createUserFolders_(userId){
  const users=DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('LF_USERS_FOLDER_ID'));
  const root=users.createFolder(userId);
  return {
    root:root,
    projects:root.createFolder('Projects'),
    notes:root.createFolder('Notes'),
    files:root.createFolder('Files'),
    imports:root.createFolder('Imports'),
    exports:root.createFolder('Exports'),
    trash:root.createFolder('Trash')
  };
}

function lf_getUserFolders_(user){
  let root;
  try{root=DriveApp.getFolderById(user.userFolderId);}catch(err){root=lf_createUserFolders_(user.id).root;}
  return {
    root:root,
    projects:lf_getOrCreateChildFolder_(root,'Projects'),
    notes:lf_getOrCreateChildFolder_(root,'Notes'),
    files:lf_getOrCreateChildFolder_(root,'Files'),
    imports:lf_getOrCreateChildFolder_(root,'Imports'),
    exports:lf_getOrCreateChildFolder_(root,'Exports'),
    trash:lf_getOrCreateChildFolder_(root,'Trash')
  };
}

/* ========================================================================== */
/* PUBLIC SERIALIZERS                                                          */
/* ========================================================================== */

function lf_publicSession_(r){return{id:r.id,deviceId:r.deviceId||'',deviceName:r.deviceName||'',platform:r.platform||'',createdAt:r.createdAt,expiresAt:r.expiresAt,lastSeenAt:r.lastSeenAt};}
function lf_publicRecoveryContact_(r){return{id:r.id,kind:r.kind,value:r.value,label:r.label||'',verified:lf_bool_(r.verified),isPrimary:lf_bool_(r.isPrimary),createdAt:r.createdAt,verifiedAt:r.verifiedAt||''};}
function lf_publicProject_(r){return{id:r.id,type:r.type,title:r.title,slug:r.slug,description:r.description,status:r.status,parentProjectId:r.parentProjectId||'',driveFolderId:r.driveFolderId,metadata:lf_parseJson_(r.metadataJson,{}),settings:lf_parseJson_(r.settingsJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,archivedAt:r.archivedAt||''};}
function lf_publicNode_(r){const pair=lf_fullTextPair_(r),storage=lf_parseJson_(r.contentStorageJson,{});return{id:r.id,projectId:r.projectId,parentId:r.parentId||'',nodeType:r.nodeType,title:r.title,slug:r.slug,sortOrder:Number(r.sortOrder||0),content:pair.content,plainText:pair.plainText,contentExternal:storage.mode==='drive-json',contentSize:Number(storage.contentChars||pair.content.length),metadata:lf_parseJson_(r.metadataJson,{}),tags:lf_parseJson_(r.tagsJson,[]),links:lf_parseJson_(r.linksJson,[]),driveFileId:r.driveFileId||'',createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicNote_(r){const pair=lf_fullTextPair_(r),storage=lf_parseJson_(r.contentStorageJson,{});return{id:r.id,projectId:r.projectId||'',folderId:r.folderId||'',title:r.title,content:pair.content,plainText:pair.plainText,contentExternal:storage.mode==='drive-json',contentSize:Number(storage.contentChars||pair.content.length),format:r.format,tags:lf_parseJson_(r.tagsJson,[]),pinned:lf_bool_(r.pinned),locked:lf_bool_(r.locked),color:r.color||'',source:r.source||'',metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicNoteFolder_(r){return{id:r.id,projectId:r.projectId||'',parentFolderId:r.parentFolderId||'',name:r.name,sortOrder:Number(r.sortOrder||0),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicAttachment_(r){return{id:r.id,projectId:r.projectId||'',ownerType:r.ownerType||'',ownerId:r.ownerId||'',name:r.name,mimeType:r.mimeType,size:Number(r.size||0),driveFileId:r.driveFileId,webViewUrl:r.webViewUrl,description:r.description||'',metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,deletedAt:r.deletedAt||''};}
function lf_publicImport_(r){return{id:r.id,projectId:r.projectId||'',name:r.name,sourceType:r.sourceType,driveFileId:r.driveFileId,status:r.status,metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicExport_(r){return{id:r.id,projectId:r.projectId||'',exportType:r.exportType,name:r.name,driveFileId:r.driveFileId,status:r.status,metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicEntity_(r){return{id:r.id,projectId:r.projectId,entityType:r.entityType,name:r.name,aliases:lf_parseJson_(r.aliasesJson,[]),description:r.description,attributes:lf_parseJson_(r.attributesJson,{}),relationships:lf_parseJson_(r.relationshipsJson,[]),tags:lf_parseJson_(r.tagsJson,[]),driveFileId:r.driveFileId||'',createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicTimeline_(r){return{id:r.id,projectId:r.projectId,title:r.title,description:r.description,startValue:r.startValue,endValue:r.endValue,calendar:r.calendar,era:r.era,sortKey:Number(r.sortKey||0),participantIds:lf_parseJson_(r.participantIdsJson,[]),locationIds:lf_parseJson_(r.locationIdsJson,[]),tags:lf_parseJson_(r.tagsJson,[]),metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicLanguage_(r){return{id:r.id,projectId:r.projectId,name:r.name,code:r.code,description:r.description,phonology:lf_parseJson_(r.phonologyJson,{}),grammar:lf_parseJson_(r.grammarJson,{}),orthography:lf_parseJson_(r.orthographyJson,{}),settings:lf_parseJson_(r.settingsJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicLexicon_(r){return{id:r.id,projectId:r.projectId,languageId:r.languageId,word:r.word,partOfSpeech:r.partOfSpeech,definition:r.definition,pronunciation:r.pronunciation,etymology:r.etymology,forms:lf_parseJson_(r.formsJson,{}),tags:lf_parseJson_(r.tagsJson,[]),notes:r.notes,createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicPlotIssue_(r){return{id:r.id,projectId:r.projectId,title:r.title,description:r.description,issueType:r.issueType,severity:r.severity,status:r.status,relatedNodeIds:lf_parseJson_(r.relatedNodeIdsJson,[]),evidence:lf_parseJson_(r.evidenceJson,[]),suggestion:r.suggestion,resolution:r.resolution,metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,resolvedAt:r.resolvedAt||''};}
function lf_publicSavedSearch_(r){return{id:r.id,projectId:r.projectId||'',name:r.name,query:r.query,filters:lf_parseJson_(r.filtersJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicReadingState_(r){return{id:r.id,projectId:r.projectId||'',targetType:r.targetType,targetId:r.targetId,position:Number(r.position||0),speed:Number(r.speed||1),voice:r.voice||'',settings:lf_parseJson_(r.settingsJson,{}),updatedAt:r.updatedAt};}
function lf_privateUser_(u){const tf=lf_parseJson_(u.twoFactorJson,{});return{id:u.id,username:u.username,displayName:u.displayName,primaryEmail:u.primaryEmail,emailVerified:lf_bool_(u.emailVerified),googleLinked:!!u.googleSub,status:u.status,twoFactor:{enabled:!!tf.enabled,preferredMethod:tf.preferredMethod||'',contactId:tf.contactId||'',enabledAt:tf.enabledAt||''},settings:lf_parseJson_(u.settingsJson,lf_defaultSettings_()),preferences:lf_parseJson_(u.preferencesJson,{}),createdAt:u.createdAt,updatedAt:u.updatedAt,lastLoginAt:u.lastLoginAt||''};}
function lf_requireOwnedProject_(auth,id){
  id=String(id||'');
  if(!id)throw lf_error_('PROJECT_REQUIRED','projectId is required.',400);
  const row=lf_findOne_('PROJECTS',function(r){return r.id===id&&r.userId===auth.user.id;});
  if(!row)throw lf_error_('PROJECT_NOT_FOUND','Project was not found.',404);
  return row;
}

function lf_attachmentsFor_(userId,ownerType,ownerId){
  return lf_rows_('ATTACHMENTS').filter(function(r){return r.userId===userId&&!r.deletedAt&&r.ownerType===ownerType&&r.ownerId===ownerId;}).map(lf_publicAttachment_);
}

/* ========================================================================== */
/* CRYPTO / VALIDATION                                                         */
/* ========================================================================== */

function lf_utf8Bytes_(s){return Utilities.newBlob(String(s)).getBytes().map(function(b){return b&255;});}
function lf_int32Bytes_(n){return[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];}
function lf_xorBytes_(a,b){const out=[];for(let i=0;i<a.length;i++)out.push(((a[i]&255)^(b[i]&255))&255);return out;}
function lf_hmacBytes_(messageBytes,keyBytes){return Utilities.computeHmacSha256Signature(messageBytes,keyBytes).map(function(b){return b&255;});}

function lf_pbkdf2Hex_(password,salt,iterations,dkLen){
  const key=lf_utf8Bytes_(String(password)+'|'+lf_pepper_());
  const saltBytes=lf_utf8Bytes_(salt),hLen=32,blocks=Math.ceil(dkLen/hLen);
  let derived=[];
  for(let block=1;block<=blocks;block++){
    let u=lf_hmacBytes_(saltBytes.concat(lf_int32Bytes_(block)),key),t=u.slice();
    for(let i=1;i<iterations;i++){u=lf_hmacBytes_(u,key);t=lf_xorBytes_(t,u);}
    derived=derived.concat(t);
  }
  return derived.slice(0,dkLen).map(function(n){return('0'+n.toString(16)).slice(-2);}).join('');
}

function lf_hashPassword_(password,salt,iterations){return lf_pbkdf2Hex_(password,salt,iterations||LF.PBKDF2_ITERATIONS,32);}
function lf_verifyPassword_(password,user){
  if(!user.passwordHash||!user.passwordSalt)return false;
  return lf_safeEqual_(lf_hashPassword_(String(password||''),user.passwordSalt,Number(user.passwordIterations||LF.PBKDF2_ITERATIONS)),user.passwordHash);
}
function lf_validatePassword_(p){
  p=String(p||'');
  if(p.length<LF.PASSWORD_MIN||p.length>LF.PASSWORD_MAX)throw lf_error_('INVALID_PASSWORD','Password must be '+LF.PASSWORD_MIN+'–'+LF.PASSWORD_MAX+' characters.',400);
  return p;
}
function lf_pepper_(){const p=PropertiesService.getScriptProperties();let s=p.getProperty('LF_PASSWORD_PEPPER');if(!s){s=lf_randomToken_(64);p.setProperty('LF_PASSWORD_PEPPER',s);}return s;}
function lf_sha256Hex_(value){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value));return bytes.map(function(b){const n=b&255;return('0'+n.toString(16)).slice(-2);}).join('');}
function lf_safeEqual_(a,b){a=String(a||'');b=String(b||'');let diff=a.length^b.length,len=Math.max(a.length,b.length);for(let i=0;i<len;i++)diff|=(a.charCodeAt(i%Math.max(1,a.length))||0)^(b.charCodeAt(i%Math.max(1,b.length))||0);return diff===0;}

function lf_randomToken_(bytesWanted){
  let bytes=[];
  while(bytes.length<bytesWanted){
    const block=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+'|'+Date.now()+'|'+Math.random());
    bytes=bytes.concat(block.map(function(b){return b&255;}));
  }
  return Utilities.base64EncodeWebSafe(bytes.slice(0,bytesWanted)).replace(/=+$/,'');
}
function lf_randomDigits_(length){let out='';while(out.length<length){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+Date.now()+Math.random());for(let i=0;i<bytes.length&&out.length<length;i++)out+=String((bytes[i]&255)%10);}return out;}
function lf_randomRecoveryCode_(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let raw='';
  const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+Date.now()+Math.random());
  for(let i=0;i<LF.RECOVERY_CODE_LENGTH;i++)raw+=alphabet[(bytes[i%bytes.length]&255)%alphabet.length];
  return raw.slice(0,4)+'-'+raw.slice(4,8)+'-'+raw.slice(8,12);
}

function lf_cleanEmail_(v){const s=String(v||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)||s.length>254)throw lf_error_('INVALID_EMAIL','Enter a valid email address.',400);return s;}
function lf_cleanPhone_(v){let s=String(v||'').trim();const digits=s.replace(/\D/g,'');if(digits.length<7||digits.length>15)throw lf_error_('INVALID_PHONE','Enter a valid phone number including country code when possible.',400);if(s.charAt(0)!=='+')s='+'+digits;return s;}
function lf_cleanUsername_(v){const s=String(v||'').trim();if(s.length<3||s.length>30||!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(s))throw lf_error_('INVALID_USERNAME','Username must be 3–30 characters using letters, numbers, periods, underscores, or hyphens.',400);return s;}
function lf_cleanText_(v,max){return String(v===null||typeof v==='undefined'?'':v).replace(/\u0000/g,'').trim().slice(0,max);}
function lf_cleanSlug_(v){return String(v||'').toLowerCase().trim().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'')||'other';}
function lf_slug_(v){return String(v||'').toLowerCase().trim().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120)||'untitled';}
function lf_safeFilename_(v){return String(v||'file').replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,' ').trim().slice(0,180)||'file';}
function lf_limitText_(v,max){const s=String(v||'');if(s.length>max)throw lf_error_('TEXT_TOO_LARGE','Text exceeds the maximum size for this field.',413);return s;}
function lf_stringArray_(v){if(!Array.isArray(v))return[];const seen={};return v.map(function(x){return lf_cleanText_(x,120);}).filter(function(x){if(!x||seen[x.toLowerCase()])return false;seen[x.toLowerCase()]=true;return true;}).slice(0,200);}
function lf_plainText_(html){return String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();}
function lf_titleFromText_(text){const s=lf_plainText_(text);return s?s.slice(0,80):'';}
function lf_bool_(v){return v===true||v===1||String(v).toLowerCase()==='true'||String(v)==='1';}

/* ========================================================================== */
/* REQUEST / JSON / ERRORS                                                     */
/* ========================================================================== */

function lf_parseRequest_(e){
  if(!e)return{};
  let body={};
  if(e.postData&&e.postData.contents){
    const raw=e.postData.contents;
    try{body=JSON.parse(raw);}catch(err){
      body={};
      if(e.parameter)Object.keys(e.parameter).forEach(function(k){body[k]=e.parameter[k];});
    }
  }else if(e.parameter){
    Object.keys(e.parameter).forEach(function(k){body[k]=e.parameter[k];});
  }
  if(e&&e.parameter){
    if(!body.action&&e.parameter.action)body.action=e.parameter.action;
    if(!body.route&&e.parameter.route)body.route=e.parameter.route;
  }
  return body||{};
}

function lf_data_(req){
  let d=req&&Object.prototype.hasOwnProperty.call(req,'data')?req.data:{};
  if(typeof d==='string')d=lf_parseJson_(d,{});
  return d&&typeof d==='object'?d:{};
}
function lf_jsonOutput_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function lf_parseJson_(v,fallback){if(v===null||v===''||typeof v==='undefined')return fallback;if(typeof v==='object')return v;try{return JSON.parse(String(v));}catch(err){return fallback;}}
function lf_error_(code,message,status,details){const e=new Error(message);e.code=code;e.publicMessage=message;e.status=status||400;e.details=details||null;return e;}
function lf_errorEnvelope_(err){const status=err&&err.status?err.status:500,code=err&&err.code?err.code:'INTERNAL_ERROR',message=err&&err.publicMessage?err.publicMessage:'The server could not complete the request.';if(status>=500)console.error(err&&err.stack?err.stack:err);return{ok:false,error:{status:status,code:code,message:message},serverTime:lf_nowIso_(),version:LF.VERSION};}

/* ========================================================================== */
/* MISC                                                                        */
/* ========================================================================== */

function lf_activity_(userId,action,targetType,targetId,projectId,details){
  try{lf_appendRow_('ACTIVITY',{id:'activity_'+Utilities.getUuid(),userId:userId||'',action:action,targetType:targetType||'',targetId:targetId||'',projectId:projectId||'',detailsJson:JSON.stringify(details||{}),createdAt:lf_nowIso_()});}catch(err){console.error('LiteraryFriend activity log failure: '+err);}
}
function lf_nowIso_(){return new Date().toISOString();}
function lf_dateStamp_(includeTime){
  const d=new Date(),pad=function(n){return String(n).padStart(2,'0');};
  let s=d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());
  if(includeTime)s+=' '+pad(d.getUTCHours())+'-'+pad(d.getUTCMinutes())+'-'+pad(d.getUTCSeconds())+' UTC';
  return s;
}
function lf_escapeHtml_(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function lf_deepMerge_(a,b){
  if(!b||typeof b!=='object'||Array.isArray(b))return b;
  const out=(a&&typeof a==='object'&&!Array.isArray(a))?JSON.parse(JSON.stringify(a)):{};
  Object.keys(b).forEach(function(k){out[k]=(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k]))?lf_deepMerge_(out[k],b[k]):b[k];});
  return out;
}

function lf_publicAttachmentSafeFileUrl_(driveFileId){
  try{return DriveApp.getFileById(driveFileId).getUrl();}catch(err){return'';}
}

function lf_installMaintenanceTrigger_(){
  const exists=ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='LITERARYFRIEND_MAINTENANCE';});
  if(!exists)ScriptApp.newTrigger('LITERARYFRIEND_MAINTENANCE').timeBased().everyHours(6).create();
}

function LITERARYFRIEND_MAINTENANCE(){
  const now=Date.now();
  try{
    lf_rows_('SESSIONS').filter(function(r){return !r.revokedAt&&Date.parse(r.expiresAt)<=now;}).forEach(function(r){lf_updateRow_('SESSIONS',r._row,{revokedAt:lf_nowIso_()});});
    lf_rows_('AUTH_CODES').filter(function(r){return !r.usedAt&&Date.parse(r.expiresAt)<=now-86400000;}).sort(function(a,b){return b._row-a._row;}).forEach(function(r){lf_deleteRow_('AUTH_CODES',r._row);});
  }catch(err){console.error(err&&err.stack?err.stack:err);}
}


/* ========================================================================== */
/* V2 UPGRADE / MIGRATION                                                      */
/* ========================================================================== */

function LITERARYFRIEND_UPGRADE_V2() {
  const setup = LITERARYFRIEND_SETUP();
  const now = lf_nowIso_();
  lf_rows_('USERS').forEach(function(u){
    const current = lf_parseJson_(u.settingsJson, {});
    const merged = lf_deepMerge_(lf_defaultSettings_(), current);
    const patch = {settingsJson:JSON.stringify(merged), updatedAt:u.updatedAt || now};
    if (!u.twoFactorJson) patch.twoFactorJson = '{}';
    lf_updateRow_('USERS', u._row, patch);
  });
  lf_rows_('PROJECTS').forEach(function(p){
    try { lf_ensureProjectDirectoriesByRow_(p); } catch (err) { console.error(err); }
    try { lf_ensureLogicalProjectDirectories_(p.userId, p.id); } catch (err2) { console.error(err2); }
  });
  return {ok:true, version:LF.VERSION, upgradedAt:now, setup:setup};
}

function lf_ensureLogicalProjectDirectories_(userId, projectId) {
  const wanted = [
    'Overview','Ideas','Outline','Characters','Locations','Worldbuilding','Timeline','Research',
    'Continuity & Plot Holes','Story State & Canon','Plot Threads & Causality','Language',
    'Book Builder','Cover Art Studio','Imports & Consolidation','Drafts'
  ];
  const existing = {};
  lf_rows_('NODES').filter(function(r){return r.userId===userId&&r.projectId===projectId&&!r.deletedAt&&r.nodeType==='directory';})
    .forEach(function(r){existing[String(r.title).toLowerCase()]=true;});
  const now=lf_nowIso_();
  wanted.forEach(function(title,i){
    if(existing[title.toLowerCase()])return;
    lf_appendRow_('NODES',{
      id:'node_'+Utilities.getUuid(),userId:userId,projectId:projectId,parentId:'',nodeType:'directory',
      title:title,slug:lf_slug_(title),sortOrder:i*10,content:'',plainText:'',metadataJson:'{}',tagsJson:'[]',
      linksJson:'[]',driveFileId:'',createdAt:now,updatedAt:now,deletedAt:''
    });
  });
}

/* ========================================================================== */
/* OPTIONAL TWO-FACTOR AUTHENTICATION                                          */
/* ========================================================================== */

function lf_finishCredentialLogin_(user, data, req, method) {
  const tf = lf_parseJson_(user.twoFactorJson, {});
  if (tf.enabled) return lf_beginTwoFactorChallenge_(user, data, req, method);
  const session = lf_createSession_(user.id, data, req);
  lf_activity_(user.id, 'auth.' + method, 'session', session.publicSession.id, '', {twoFactor:false});
  return {ok:true, user:lf_privateUser_(user), token:session.token, session:session.publicSession, twoFactorRequired:false};
}

function lf_beginTwoFactorChallenge_(user, data, req, loginMethod) {
  const tf = lf_parseJson_(user.twoFactorJson, {});
  const contacts = lf_rows_('RECOVERY_CONTACTS').filter(function(r){return r.userId===user.id&&lf_bool_(r.verified);});
  let contact = null;
  if (tf.contactId) contact = contacts.filter(function(r){return r.id===tf.contactId;})[0] || null;
  if (!contact && tf.preferredMethod) contact = contacts.filter(function(r){return r.kind===tf.preferredMethod;})[0] || null;
  if (!contact) contact = contacts.filter(function(r){return r.kind==='email';})[0] || contacts[0] || null;
  if (!contact) throw lf_error_('TWO_FACTOR_CONTACT_MISSING','Two-factor authentication is enabled but no verified recovery contact is available.',409);

  const rawToken=lf_randomToken_(36), code=lf_randomDigits_(6), now=lf_nowIso_();
  const challenge=lf_appendRow_('TWO_FACTOR_CHALLENGES',{
    id:'2fa_'+Utilities.getUuid(),userId:user.id,challengeHash:lf_sha256Hex_('2fa|'+rawToken),method:contact.kind,
    destinationKey:contact.valueKey,codeHash:lf_sha256Hex_('2fa-code|'+user.id+'|'+code),createdAt:now,
    expiresAt:new Date(Date.now()+LF.TWO_FACTOR_TTL_MINUTES*60000).toISOString(),attempts:0,usedAt:'',
    metadataJson:JSON.stringify({loginMethod:loginMethod,deviceId:data.deviceId||'',deviceName:data.deviceName||'',platform:data.platform||'',userAgent:data.userAgent||''})
  });
  lf_deliverTwoFactorCode_(contact, code);
  return {
    ok:true,twoFactorRequired:true,challengeToken:rawToken,challengeId:challenge.id,method:contact.kind,
    destination:lf_maskDestination_(contact.kind,contact.value),expiresAt:challenge.expiresAt,
    user:{id:user.id,displayName:user.displayName,username:user.username}
  };
}

function lf_deliverTwoFactorCode_(contact, code) {
  if (contact.kind==='email') {
    MailApp.sendEmail({
      to:String(contact.value),subject:'Your LiteraryFriend two-factor code',name:'LiteraryFriend',
      htmlBody:'<p>Your LiteraryFriend two-factor code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">'+lf_escapeHtml_(code)+'</p><p>This code expires in '+LF.TWO_FACTOR_TTL_MINUTES+' minutes.</p>'
    });
    return {sent:true,kind:'email'};
  }
  return lf_sendSmsCode_(contact.value,code,'two_factor');
}

function lf_twoFactorVerifyLogin_(data,req){const raw=String(data.challengeToken||'').trim(),code=String(data.code||'').replace(/\s+/g,'').toUpperCase();if(!raw||!code)throw lf_error_('TWO_FACTOR_FIELDS_REQUIRED','Two-factor challenge token and code are required.',400);const hash=lf_sha256Hex_('2fa|'+raw),ch=lf_findOne_('TWO_FACTOR_CHALLENGES',function(r){return r.challengeHash===hash&&!r.usedAt;});if(!ch||Date.parse(ch.expiresAt)<=Date.now())throw lf_error_('TWO_FACTOR_EXPIRED','Two-factor challenge expired. Sign in again.',401);if(Number(ch.attempts||0)>=LF.EMAIL_CODE_MAX_ATTEMPTS)throw lf_error_('TWO_FACTOR_LOCKED','Too many incorrect two-factor attempts.',429);const expected=lf_sha256Hex_('2fa-code|'+ch.userId+'|'+code);let recovery=null;if(!lf_safeEqual_(expected,ch.codeHash))recovery=lf_findOne_('RECOVERY_CODES',function(r){return r.userId===ch.userId&&r.codeHash===lf_sha256Hex_('recovery|'+ch.userId+'|'+code)&&!r.usedAt&&!r.revokedAt;});if(!lf_safeEqual_(expected,ch.codeHash)&&!recovery){lf_updateRow_('TWO_FACTOR_CHALLENGES',ch._row,{attempts:Number(ch.attempts||0)+1});throw lf_error_('TWO_FACTOR_INVALID','The two-factor or recovery code is incorrect.',401);}if(recovery)lf_updateRow_('RECOVERY_CODES',recovery._row,{usedAt:lf_nowIso_()});lf_updateRow_('TWO_FACTOR_CHALLENGES',ch._row,{usedAt:lf_nowIso_()});const user=lf_findOne_('USERS',function(r){return r.id===ch.userId&&r.status==='active';});if(!user)throw lf_error_('ACCOUNT_UNAVAILABLE','This account is unavailable.',403);const meta=lf_parseJson_(ch.metadataJson,{}),session=lf_createSession_(user.id,{deviceId:data.deviceId||meta.deviceId||'',deviceName:data.deviceName||meta.deviceName||'',platform:data.platform||meta.platform||'',userAgent:data.userAgent||meta.userAgent||''},req);lf_activity_(user.id,'auth.2fa.verify','session',session.publicSession.id,'',{method:recovery?'recovery-code':ch.method,loginMethod:meta.loginMethod||''});return{ok:true,twoFactorRequired:false,user:lf_privateUser_(user),token:session.token,session:session.publicSession,recoveryCodeUsed:!!recovery};}
function lf_twoFactorStatus_(auth){
  const tf=lf_parseJson_(auth.user.twoFactorJson,{});
  const contacts=lf_rows_('RECOVERY_CONTACTS').filter(function(r){return r.userId===auth.user.id&&lf_bool_(r.verified);}).map(lf_publicRecoveryContact_);
  return {ok:true,twoFactor:{enabled:!!tf.enabled,preferredMethod:tf.preferredMethod||'',contactId:tf.contactId||''},verifiedContacts:contacts};
}

function lf_twoFactorEnable_(auth,data){
  const contactId=String(data.contactId||'');
  const contact=lf_findOne_('RECOVERY_CONTACTS',function(r){return r.id===contactId&&r.userId===auth.user.id&&lf_bool_(r.verified);});
  if(!contact)throw lf_error_('TWO_FACTOR_CONTACT_REQUIRED','Choose a verified backup email or phone number for two-factor authentication.',400);
  if(contact.kind==='phone'&&!PropertiesService.getScriptProperties().getProperty('LF_SMS_WEBHOOK_URL'))throw lf_error_('SMS_NOT_CONFIGURED','Phone two-factor authentication requires the SMS webhook to be configured.',503);
  const tf={enabled:true,preferredMethod:contact.kind,contactId:contact.id,enabledAt:lf_nowIso_()};
  const user=lf_updateRow_('USERS',auth.user._row,{twoFactorJson:JSON.stringify(tf),updatedAt:lf_nowIso_()});
  lf_activity_(auth.user.id,'auth.2fa.enable','user',auth.user.id,'',{method:contact.kind,contactId:contact.id});
  return {ok:true,user:lf_privateUser_(user),twoFactor:tf};
}

function lf_twoFactorDisable_(auth,data){
  if(auth.user.passwordHash&&!lf_verifyPassword_(String(data.currentPassword||''),auth.user))throw lf_error_('CURRENT_PASSWORD_INVALID','Current password is required to disable two-factor authentication.',401);
  const user=lf_updateRow_('USERS',auth.user._row,{twoFactorJson:JSON.stringify({enabled:false,disabledAt:lf_nowIso_()}),updatedAt:lf_nowIso_()});
  lf_activity_(auth.user.id,'auth.2fa.disable','user',auth.user.id,'',{});
  return {ok:true,user:lf_privateUser_(user)};
}

function lf_twoFactorResend_(auth,data){
  const tf=lf_parseJson_(auth.user.twoFactorJson,{});
  if(!tf.enabled)throw lf_error_('TWO_FACTOR_DISABLED','Two-factor authentication is not enabled.',409);
  return lf_beginTwoFactorChallenge_(auth.user,data,{},'session-reverify');
}

function lf_maskDestination_(kind,value){
  value=String(value||'');
  if(kind==='email'){
    const parts=value.split('@'), local=parts[0]||'', domain=parts[1]||'';
    return (local.slice(0,2)||'*')+'***@'+domain;
  }
  const d=value.replace(/\D/g,'');return '••• ••• '+d.slice(-4);
}

/* ========================================================================== */
/* GOOGLE ACCOUNT LINKING + USER-CONTROLLED GOOGLE DRIVE                       */
/* ========================================================================== */

function lf_googleAccountLink_(auth,data){
  const idToken=String(data.idToken||data.credential||'').trim();
  if(!idToken)throw lf_error_('GOOGLE_TOKEN_REQUIRED','Google ID token is required.',400);
  const clientId=PropertiesService.getScriptProperties().getProperty('LF_GOOGLE_CLIENT_ID')||'';
  if(!clientId)throw lf_error_('GOOGLE_NOT_CONFIGURED','Google sign-in is not configured.',503);
  const response=UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token='+encodeURIComponent(idToken),{muteHttpExceptions:true});
  if(response.getResponseCode()!==200)throw lf_error_('GOOGLE_TOKEN_INVALID','Google token was rejected.',401);
  const profile=JSON.parse(response.getContentText());
  if(String(profile.aud||'')!==clientId||!profile.sub||!profile.email)throw lf_error_('GOOGLE_PROFILE_INVALID','Google profile could not be verified.',401);
  if(!(profile.email_verified===true||String(profile.email_verified).toLowerCase()==='true'))throw lf_error_('GOOGLE_EMAIL_UNVERIFIED','Google did not verify this account email address.',401);
  const email=lf_cleanEmail_(profile.email);
  const other=lf_findOne_('USERS',function(r){return r.id!==auth.user.id&&(r.googleSub===String(profile.sub)||r.primaryEmailKey===email);});
  if(other)throw lf_error_('GOOGLE_ALREADY_LINKED','That Google account or verified email is already associated with another LiteraryFriend account.',409);
  const user=lf_updateRow_('USERS',auth.user._row,{googleSub:String(profile.sub),updatedAt:lf_nowIso_()});
  let existing=lf_findOne_('RECOVERY_CONTACTS',function(r){return r.userId===auth.user.id&&r.kind==='email'&&r.valueKey===email;});
  if(!existing)lf_appendRow_('RECOVERY_CONTACTS',{id:'contact_'+Utilities.getUuid(),userId:auth.user.id,kind:'email',valueKey:email,value:email,label:'Linked Google email',verified:true,isPrimary:false,createdAt:lf_nowIso_(),updatedAt:lf_nowIso_(),verifiedAt:lf_nowIso_()});
  else if(!lf_bool_(existing.verified))lf_updateRow_('RECOVERY_CONTACTS',existing._row,{verified:true,verifiedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});
  return {ok:true,user:lf_privateUser_(user),linkedEmail:email};
}

function lf_driveLinkStart_(auth,data){
  const p=PropertiesService.getScriptProperties();
  const clientId=p.getProperty('LF_GOOGLE_OAUTH_CLIENT_ID')||'';
  const secret=p.getProperty('LF_GOOGLE_OAUTH_CLIENT_SECRET')||'';
  if(!clientId||!secret)throw lf_error_('DRIVE_OAUTH_NOT_CONFIGURED','Google Drive linking is not configured.',503);
  const redirect=lf_driveOAuthRedirectUri_();
  if(!redirect)throw lf_error_('WEB_APP_NOT_DEPLOYED','Deploy LiteraryFriend as a web app before linking Google Drive.',503);
  const rawState=lf_randomToken_(40), now=lf_nowIso_();
  const configuredReturn=p.getProperty('LF_APP_BASE_URL')||'';
  lf_appendRow_('OAUTH_STATES',{
    id:'oauth_'+Utilities.getUuid(),userId:auth.user.id,stateHash:lf_sha256Hex_('oauth-state|'+rawState),provider:'google',purpose:'drive-link',
    returnUrl:lf_safeReturnUrl_(data.returnUrl,configuredReturn),createdAt:now,
    expiresAt:new Date(Date.now()+LF.OAUTH_STATE_TTL_MINUTES*60000).toISOString(),usedAt:'',metadataJson:'{}'
  });
  const params={
    client_id:clientId,redirect_uri:redirect,response_type:'code',scope:'openid email '+LF.GOOGLE_DRIVE_SCOPE,
    access_type:'offline',include_granted_scopes:'true',prompt:'consent',state:rawState
  };
  const qs=Object.keys(params).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(params[k]);}).join('&');
  return {ok:true,authorizationUrl:'https://accounts.google.com/o/oauth2/v2/auth?'+qs,redirectUri:redirect,scope:LF.GOOGLE_DRIVE_SCOPE};
}

function lf_driveOAuthRedirectUri_(){
  const base=ScriptApp.getService().getUrl()||'';
  return base ? base+'?action=oauth.google.drive.callback' : '';
}

function lf_driveOAuthCallbackResponse_(req){
  try{
    const result=lf_driveOAuthCallback_(req);
    const ret=result.returnUrl||'';
    const link=ret?'<p><a href="'+lf_escapeHtml_(ret)+'">Return to LiteraryFriend</a></p>':'';
    const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Updock&display=swap" rel="stylesheet"><style>body{font-family:system-ui,sans-serif;background:#f5efe3;color:#33251f;padding:32px}.card{max-width:620px;margin:auto;background:#fffaf1;border:1px solid #9f8069;border-radius:18px;padding:28px}.brand{font-family:Updock,cursive;font-size:2em}</style></head><body><div class="card"><h1><span class="brand">LiteraryFriend</span></h1><h2>Google Drive linked</h2><p>Your personal Google Drive is now available as a LiteraryFriend storage destination.</p>'+link+'</div></body></html>';
    return HtmlService.createHtmlOutput(html).setTitle('LiteraryFriend — Drive linked').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }catch(err){
    return HtmlService.createHtmlOutput('<!doctype html><html><body style="font-family:system-ui;padding:32px"><h2>Google Drive could not be linked</h2><p>'+lf_escapeHtml_(err.publicMessage||err.message||'Authorization failed.')+'</p></body></html>').setTitle('LiteraryFriend — Drive link error');
  }
}

function lf_driveOAuthCallback_(req){
  if(req.error)throw lf_error_('DRIVE_OAUTH_DENIED','Google Drive authorization was cancelled or denied.',401);
  const state=String(req.state||''), code=String(req.code||'');
  if(!state||!code)throw lf_error_('DRIVE_OAUTH_INVALID','Google Drive authorization response is incomplete.',400);
  const stateHash=lf_sha256Hex_('oauth-state|'+state);
  const row=lf_findOne_('OAUTH_STATES',function(r){return r.stateHash===stateHash&&!r.usedAt&&r.provider==='google'&&r.purpose==='drive-link';});
  if(!row||Date.parse(row.expiresAt)<=Date.now())throw lf_error_('DRIVE_OAUTH_STATE_EXPIRED','Google Drive link request expired. Start again.',401);
  lf_updateRow_('OAUTH_STATES',row._row,{usedAt:lf_nowIso_()});
  const p=PropertiesService.getScriptProperties();
  const tokenResponse=UrlFetchApp.fetch('https://oauth2.googleapis.com/token',{
    method:'post',contentType:'application/x-www-form-urlencoded',muteHttpExceptions:true,
    payload:{code:code,client_id:p.getProperty('LF_GOOGLE_OAUTH_CLIENT_ID')||'',client_secret:p.getProperty('LF_GOOGLE_OAUTH_CLIENT_SECRET')||'',redirect_uri:lf_driveOAuthRedirectUri_(),grant_type:'authorization_code'}
  });
  if(tokenResponse.getResponseCode()<200||tokenResponse.getResponseCode()>=300)throw lf_error_('DRIVE_TOKEN_EXCHANGE_FAILED','Google Drive authorization could not be completed.',401);
  const tokens=JSON.parse(tokenResponse.getContentText());
  if(!tokens.access_token)throw lf_error_('DRIVE_TOKEN_MISSING','Google did not return a Drive access token.',401);
  const userInfoResponse=UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+tokens.access_token},muteHttpExceptions:true});
  let accountEmail='';try{if(userInfoResponse.getResponseCode()===200)accountEmail=JSON.parse(userInfoResponse.getContentText()).email||'';}catch(ignore){}
  let link=lf_findOne_('DRIVE_LINKS',function(r){return r.userId===row.userId&&r.provider==='google'&&!r.revokedAt;});
  const now=lf_nowIso_(), tokenKey=link&&link.tokenKey?link.tokenKey:'drive_token_'+lf_sha256Hex_(row.userId+'|'+Utilities.getUuid()).slice(0,32);
  const oldSecret=lf_secretGet_(tokenKey)||{};
  lf_secretSet_(tokenKey,{
    accessToken:tokens.access_token,
    refreshToken:tokens.refresh_token||oldSecret.refreshToken||'',
    expiresAt:new Date(Date.now()+Number(tokens.expires_in||3600)*1000).toISOString(),
    tokenType:tokens.token_type||'Bearer'
  });
  const patch={userId:row.userId,provider:'google',accountEmail:accountEmail,tokenKey:tokenKey,scope:tokens.scope||LF.GOOGLE_DRIVE_SCOPE,status:'active',updatedAt:now,lastUsedAt:now,revokedAt:''};
  if(link)link=lf_updateRow_('DRIVE_LINKS',link._row,patch);
  else{patch.id='drivelink_'+Utilities.getUuid();patch.rootFolderId='';patch.metadataJson='{}';patch.createdAt=now;link=lf_appendRow_('DRIVE_LINKS',patch);}
  const rootId=lf_linkedDriveEnsureRoot_(link);
  if(rootId!==link.rootFolderId)link=lf_updateRow_('DRIVE_LINKS',link._row,{rootFolderId:rootId,updatedAt:lf_nowIso_()});
  lf_activity_(row.userId,'drive.link.google','drive_link',link.id,'',{accountEmail:accountEmail});
  return {ok:true,link:lf_publicDriveLink_(link),returnUrl:row.returnUrl||''};
}

function lf_driveLinkStatus_(auth){
  const links=lf_rows_('DRIVE_LINKS').filter(function(r){return r.userId===auth.user.id&&!r.revokedAt;}).map(lf_publicDriveLink_);
  return {ok:true,linked:links.length>0,links:links};
}

function lf_driveLinkRevoke_(auth,data){
  const row=lf_findOne_('DRIVE_LINKS',function(r){return r.userId===auth.user.id&&!r.revokedAt&&(!data.id||r.id===String(data.id));});
  if(!row)return {ok:true,revoked:false};
  const secret=lf_secretGet_(row.tokenKey)||{};
  const token=secret.refreshToken||secret.accessToken||'';
  if(token){try{UrlFetchApp.fetch('https://oauth2.googleapis.com/revoke?token='+encodeURIComponent(token),{method:'post',muteHttpExceptions:true});}catch(ignore){}}
  lf_secretDelete_(row.tokenKey);
  lf_updateRow_('DRIVE_LINKS',row._row,{status:'revoked',revokedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});
  return {ok:true,revoked:true};
}

function lf_driveLinkSetRoot_(auth,data){const link=lf_requireDriveLink_(auth.user.id),folderId=String(data.folderId||'').trim();if(!folderId)throw lf_error_('FOLDER_REQUIRED','Google Drive folderId is required.',400);const access=lf_linkedDriveAccessToken_(link),resp=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(folderId)+'?fields=id,name,mimeType,trashed',{headers:{Authorization:'Bearer '+access},muteHttpExceptions:true});if(resp.getResponseCode()!==200)throw lf_error_('DRIVE_FOLDER_UNAVAILABLE','The selected Google Drive folder is not accessible to LiteraryFriend.',403);const info=JSON.parse(resp.getContentText());if(info.mimeType!=='application/vnd.google-apps.folder'||info.trashed)throw lf_error_('DRIVE_FOLDER_INVALID','The selected Google Drive item is not an active folder.',400);const meta=lf_parseJson_(link.metadataJson,{});delete meta.projectsFolderId;const updated=lf_updateRow_('DRIVE_LINKS',link._row,{rootFolderId:folderId,metadataJson:JSON.stringify(meta),updatedAt:lf_nowIso_()});lf_rows_('PROJECTS').filter(function(r){return r.userId===auth.user.id;}).forEach(function(pr){const pm=lf_parseJson_(pr.metadataJson,{});if(pm.linkedDriveFolderId){delete pm.linkedDriveFolderId;lf_updateRow_('PROJECTS',pr._row,{metadataJson:JSON.stringify(pm),updatedAt:lf_nowIso_()});}});return{ok:true,link:lf_publicDriveLink_(updated),folder:{id:info.id,name:info.name}};}
function lf_requireDriveLink_(userId){
  const row=lf_findOne_('DRIVE_LINKS',function(r){return r.userId===userId&&r.status==='active'&&!r.revokedAt;});
  if(!row)throw lf_error_('DRIVE_NOT_LINKED','Link a personal Google Drive before using this storage option.',409);
  return row;
}

function lf_linkedDriveAccessToken_(link){
  const secret=lf_secretGet_(link.tokenKey)||{};
  if(secret.accessToken&&secret.expiresAt&&Date.parse(secret.expiresAt)>Date.now()+60000)return secret.accessToken;
  if(!secret.refreshToken)throw lf_error_('DRIVE_REAUTH_REQUIRED','Google Drive authorization expired. Link Drive again.',401);
  const p=PropertiesService.getScriptProperties();
  const resp=UrlFetchApp.fetch('https://oauth2.googleapis.com/token',{
    method:'post',contentType:'application/x-www-form-urlencoded',muteHttpExceptions:true,
    payload:{client_id:p.getProperty('LF_GOOGLE_OAUTH_CLIENT_ID')||'',client_secret:p.getProperty('LF_GOOGLE_OAUTH_CLIENT_SECRET')||'',refresh_token:secret.refreshToken,grant_type:'refresh_token'}
  });
  if(resp.getResponseCode()<200||resp.getResponseCode()>=300)throw lf_error_('DRIVE_REAUTH_REQUIRED','Google Drive authorization must be renewed.',401);
  const t=JSON.parse(resp.getContentText());
  secret.accessToken=t.access_token;secret.expiresAt=new Date(Date.now()+Number(t.expires_in||3600)*1000).toISOString();
  lf_secretSet_(link.tokenKey,secret);
  try{lf_updateRow_('DRIVE_LINKS',link._row,{lastUsedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});}catch(ignore){}
  return secret.accessToken;
}

function lf_linkedDriveEnsureRoot_(link){
  if(link.rootFolderId)return link.rootFolderId;
  const access=lf_linkedDriveAccessToken_(link);
  const resp=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType',{
    method:'post',contentType:'application/json',payload:JSON.stringify({name:'LiteraryFriend',mimeType:'application/vnd.google-apps.folder'}),
    headers:{Authorization:'Bearer '+access},muteHttpExceptions:true
  });
  if(resp.getResponseCode()<200||resp.getResponseCode()>=300)throw lf_error_('DRIVE_ROOT_CREATE_FAILED','LiteraryFriend could not create its folder in the linked Google Drive.',502);
  return JSON.parse(resp.getContentText()).id;
}

function lf_linkedDriveCreateFolder_(userId,name,parentId){
  const link=lf_requireDriveLink_(userId),access=lf_linkedDriveAccessToken_(link);
  parentId=parentId||link.rootFolderId||lf_linkedDriveEnsureRoot_(link);
  const meta={name:lf_safeFilename_(name),mimeType:'application/vnd.google-apps.folder',parents:[parentId]};
  const resp=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',{
    method:'post',contentType:'application/json',payload:JSON.stringify(meta),headers:{Authorization:'Bearer '+access},muteHttpExceptions:true
  });
  if(resp.getResponseCode()<200||resp.getResponseCode()>=300)throw lf_error_('DRIVE_FOLDER_CREATE_FAILED','Could not create a folder in linked Google Drive.',502);
  return JSON.parse(resp.getContentText());
}

function lf_linkedDriveUploadBlob_(userId,blob,parentId){
  const link=lf_requireDriveLink_(userId),access=lf_linkedDriveAccessToken_(link);
  parentId=parentId||link.rootFolderId||lf_linkedDriveEnsureRoot_(link);
  const meta={name:blob.getName()||'file',parents:[parentId]};
  const init=UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink',{
    method:'post',contentType:'application/json',payload:JSON.stringify(meta),headers:{Authorization:'Bearer '+access,'X-Upload-Content-Type':blob.getContentType()||'application/octet-stream','X-Upload-Content-Length':String(blob.getBytes().length)},muteHttpExceptions:true
  });
  if(init.getResponseCode()<200||init.getResponseCode()>=300)throw lf_error_('DRIVE_UPLOAD_INIT_FAILED','Could not start upload to linked Google Drive.',502);
  const headers=init.getAllHeaders?init.getAllHeaders():init.getHeaders();
  const location=headers.Location||headers.location;
  if(!location)throw lf_error_('DRIVE_UPLOAD_INIT_FAILED','Google Drive did not return an upload session.',502);
  const upload=UrlFetchApp.fetch(String(location),{method:'put',contentType:blob.getContentType()||'application/octet-stream',payload:blob.getBytes(),headers:{Authorization:'Bearer '+access},muteHttpExceptions:true});
  if(upload.getResponseCode()<200||upload.getResponseCode()>=300)throw lf_error_('DRIVE_UPLOAD_FAILED','Upload to linked Google Drive failed.',502);
  return JSON.parse(upload.getContentText());
}

function lf_linkedDriveDeleteFile_(userId,fileId){
  const link=lf_requireDriveLink_(userId),access=lf_linkedDriveAccessToken_(link);
  const resp=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(fileId),{method:'delete',headers:{Authorization:'Bearer '+access},muteHttpExceptions:true});
  return resp.getResponseCode()===204||resp.getResponseCode()===200||resp.getResponseCode()===404;
}

function lf_linkedProjectFolder_(auth,project){let meta=lf_parseJson_(project.metadataJson,{});if(meta.linkedDriveFolderId)return meta.linkedDriveFolderId;let link=lf_requireDriveLink_(auth.user.id),linkMeta=lf_parseJson_(link.metadataJson,{}),projectsFolderId=String(linkMeta.projectsFolderId||'');if(!projectsFolderId){const pf=lf_linkedDriveCreateFolder_(auth.user.id,'Projects',link.rootFolderId||lf_linkedDriveEnsureRoot_(link));projectsFolderId=pf.id;linkMeta.projectsFolderId=projectsFolderId;link=lf_updateRow_('DRIVE_LINKS',link._row,{metadataJson:JSON.stringify(linkMeta),updatedAt:lf_nowIso_()});}const pf=lf_linkedDriveCreateFolder_(auth.user.id,project.title+' — '+project.id.slice(-8),projectsFolderId);meta.linkedDriveFolderId=pf.id;lf_updateRow_('PROJECTS',project._row,{metadataJson:JSON.stringify(meta),updatedAt:lf_nowIso_()});return pf.id;}
function lf_secretSet_(key,obj){PropertiesService.getScriptProperties().setProperty('LF_SECRET_'+lf_sha256Hex_(key),JSON.stringify(obj||{}));}
function lf_secretGet_(key){return lf_parseJson_(PropertiesService.getScriptProperties().getProperty('LF_SECRET_'+lf_sha256Hex_(key)),null);}
function lf_secretDelete_(key){PropertiesService.getScriptProperties().deleteProperty('LF_SECRET_'+lf_sha256Hex_(key));}
function lf_safeReturnUrl_(candidate,configured){
  const c=String(candidate||'').trim(), base=String(configured||'').trim();
  if(!base)return '';
  if(!c)return base;
  const normalized=base.replace(/\/+$/,'');
  if(c===base||c===normalized||c.indexOf(normalized+'/')===0||c.indexOf(normalized+'?')===0||c.indexOf(normalized+'#')===0)return c;
  return base;
}

/* ========================================================================== */
/* PROJECT-ISOLATED DRIVE STORAGE / FILE INGESTION                             */
/* ========================================================================== */

function lf_ensureProjectDirectoriesByRow_(project){
  let root;
  try{root=DriveApp.getFolderById(project.driveFolderId);}catch(err){
    const user=lf_findOne_('USERS',function(r){return r.id===project.userId;});
    if(!user)throw err;
    const uf=lf_getUserFolders_(user);
    root=uf.projects.createFolder(lf_safeFilename_(project.title+' — '+project.id.slice(-8)));
    project=lf_updateRow_('PROJECTS',project._row,{driveFolderId:root.getId(),updatedAt:lf_nowIso_()});
  }
  const names=['Manuscript','Outline','Characters','Worldbuilding','Languages','Research','Art','Audio','Data','Imports','Exports','Revisions','Book Builds','Other'];
  const out={root:root};
  names.forEach(function(n){out[lf_slug_(n).replace(/-/g,'_')]=lf_getOrCreateChildFolder_(root,n);});
  return out;
}

function lf_storeBlobForUser_(auth,project,blob,options){options=options||{};const settings=lf_parseJson_(auth.user.settingsJson,lf_defaultSettings_()),target=String(options.storageTarget||(settings.storage&&settings.storage.defaultTarget)||'internal').toLowerCase();if(['internal','linked-drive','both'].indexOf(target)<0)throw lf_error_('STORAGE_TARGET_INVALID','Storage target must be internal, linked-drive, or both.',400);const mirror=Object.prototype.hasOwnProperty.call(options,'mirrorToLinkedDrive')?lf_bool_(options.mirrorToLinkedDrive):!!(settings.storage&&settings.storage.mirrorToLinkedDrive),storage={primary:target,internalDriveFileId:'',internalDriveUrl:'',linkedDriveFileId:'',linkedDriveWebViewUrl:''};let internalFile=null;if(target!=='linked-drive'||mirror){let folder;if(project){const pf=lf_ensureProjectDirectoriesByRow_(project),key=lf_categoryFolderKey_(options.category||'other');folder=pf[key]||pf.other||pf.root;}else{const uf=lf_getUserFolders_(auth.user),cat=String(options.category||'').toLowerCase();folder=(cat==='exports'||cat==='backup'||cat==='backups')?uf.exports:(options.importMode||cat==='imports'||cat==='import'?uf.imports:uf.files);}internalFile=folder.createFile(blob);storage.internalDriveFileId=internalFile.getId();storage.internalDriveUrl=internalFile.getUrl();}if(target==='linked-drive'||target==='both'||mirror){const parent=project?lf_linkedProjectFolder_(auth,project):lf_requireDriveLink_(auth.user.id).rootFolderId,ext=lf_linkedDriveUploadBlob_(auth.user.id,blob,parent);storage.linkedDriveFileId=ext.id||'';storage.linkedDriveWebViewUrl=ext.webViewLink||'';}return{storage:storage,internalDriveFileId:storage.internalDriveFileId,linkedDriveFileId:storage.linkedDriveFileId,webViewUrl:storage.linkedDriveWebViewUrl||storage.internalDriveUrl||''};}
function lf_categoryFolderKey_(category){
  const map={manuscript:'manuscript',outline:'outline',character:'characters',characters:'characters',worldbuilding:'worldbuilding',language:'languages',research:'research',art:'art',image:'art',audio:'audio',data:'data',import:'imports',exports:'exports',revision:'revisions','book-build':'book_builds'};
  return map[String(category||'').toLowerCase()]||'other';
}

function lf_classifyFile_(name,mime,text){
  name=String(name||'').toLowerCase();mime=String(mime||'').toLowerCase();text=String(text||'').slice(0,20000);
  const ext=(name.match(/\.([a-z0-9]{1,12})$/)||[])[1]||'';
  let category='other',logicalType='attachment';
  if(/^image\//.test(mime)||/^(png|jpe?g|gif|webp|svg|bmp|tiff?)$/.test(ext)){category='art';logicalType='image';}
  else if(/^audio\//.test(mime)||/^(mp3|wav|m4a|ogg|flac)$/.test(ext)){category='audio';logicalType='audio';}
  else if(/^(json|csv|tsv|xml|yaml|yml)$/.test(ext)||/json|csv|xml/.test(mime)){category='data';logicalType='structured-data';}
  else if(/\b(outline|beat sheet|beats|synopsis|treatment|story plan)\b/i.test(name+' '+text.slice(0,1200))){category='outline';logicalType='outline';}
  else if(/\b(character|cast|protagonist|antagonist|npc|character sheet)\b/i.test(name+' '+text.slice(0,1200))){category='characters';logicalType='character-reference';}
  else if(/\b(language|lexicon|dictionary|grammar|phonology|conlang)\b/i.test(name+' '+text.slice(0,1200))){category='language';logicalType='language-reference';}
  else if(/\b(world|lore|setting|magic system|religion|culture|species|location|map|timeline)\b/i.test(name+' '+text.slice(0,1200))){category='worldbuilding';logicalType='world-reference';}
  else if(/\b(research|source|citation|bibliography|reference)\b/i.test(name+' '+text.slice(0,1200))){category='research';logicalType='research';}
  else if(/^(docx?|odt|rtf|txt|md|markdown|pdf|html?|epub)$/.test(ext)||/^text\//.test(mime)){category='manuscript';logicalType='document';}
  return {extension:ext,category:category,logicalType:logicalType};
}

function lf_fileIngest_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),name=lf_safeFilename_(data.name||data.fileName||'import'),mime=lf_cleanText_(data.mimeType||lf_guessMimeFromName_(name),120),base64=String(data.base64||data.dataBase64||'').replace(/^data:[^;]+;base64/,'').replace(/^,/,'');
  if(!base64)throw lf_error_('FILE_DATA_REQUIRED','File base64 data is required.',400);const bytes=Utilities.base64Decode(base64);if(bytes.length>LF.MAX_UPLOAD_BYTES)throw lf_error_('FILE_TOO_LARGE','File exceeds LiteraryFriend upload limit.',413);const blob=Utilities.newBlob(bytes,mime,name);let extracted='';try{extracted=lf_extractTextFromBlob_(blob,name,mime);}catch(err){extracted='';}
  const classification=lf_classifyFile_(name,mime,extracted),stored=lf_storeBlobForUser_(auth,project,blob,{category:classification.category,importMode:true,storageTarget:data.storageTarget,mirrorToLinkedDrive:data.mirrorToLinkedDrive}),now=lf_nowIso_(),attachment=lf_appendRow_('ATTACHMENTS',{id:'attachment_'+Utilities.getUuid(),userId:auth.user.id,projectId:project.id,ownerType:'import',ownerId:'',name:name,mimeType:mime,size:bytes.length,driveFileId:stored.internalDriveFileId||'',webViewUrl:stored.webViewUrl||'',description:'Imported into LiteraryFriend',metadataJson:JSON.stringify({storage:stored.storage,classification:classification}),createdAt:now,deletedAt:''}),sourceHash=lf_sha256Hex_(Utilities.base64Encode(bytes)),textStored=lf_externalizeIndexedText_(auth,project,extracted,'extracted-'+attachment.id+'.txt'),index=lf_appendRow_('FILE_INDEX',{id:'fileindex_'+Utilities.getUuid(),userId:auth.user.id,projectId:project.id,attachmentId:attachment.id,name:name,extension:classification.extension,mimeType:mime,category:classification.category,logicalType:classification.logicalType,sourceHash:sourceHash,extractedText:textStored.preview,textDriveFileId:textStored.fileId,textCharacters:extracted.length,nodeIdsJson:'[]',metadataJson:JSON.stringify({storage:stored.storage,extraction:{success:!!extracted,characters:extracted.length,external:!!textStored.fileId}}),status:extracted?'indexed':'stored',createdAt:now,updatedAt:now}),importRow=lf_appendRow_('IMPORTS',{id:'import_'+Utilities.getUuid(),userId:auth.user.id,projectId:project.id,name:name,sourceType:classification.logicalType,driveFileId:stored.internalDriveFileId||'',status:extracted?'indexed':'stored',metadataJson:JSON.stringify({fileIndexId:index.id,attachmentId:attachment.id,classification:classification}),createdAt:now,updatedAt:now});
  let createdNode=null;if(extracted&&lf_boolDefault_(data.createDocument,true)){const parent=lf_findDirectoryByCategory_(auth.user.id,project.id,classification.category);createdNode=lf_nodeSave_(auth,{projectId:project.id,parentId:parent?parent.id:'',nodeType:classification.logicalType==='outline'?'outline':'document',title:lf_stripExtension_(name),content:lf_escapeHtml_(extracted).replace(/\n/g,'<br>'),plainText:extracted,metadata:{sourceFileIndexId:index.id,sourceAttachmentId:attachment.id,imported:true,classification:classification},tags:['imported',classification.category]});lf_updateRow_('FILE_INDEX',index._row,{nodeIdsJson:JSON.stringify([createdNode.node.id]),updatedAt:lf_nowIso_()});}
  lf_activity_(auth.user.id,'files.ingest','file_index',index.id,project.id,{name:name,category:classification.category});return{ok:true,classification:classification,attachment:lf_publicAttachment_(attachment),fileIndex:lf_publicFileIndex_(lf_findOne_('FILE_INDEX',function(r){return r.id===index.id;})),import:lf_publicImport_(importRow),node:createdNode?createdNode.node:null};
}
function lf_fileIngestBatch_(auth,data){
  const files=Array.isArray(data.files)?data.files:[];
  if(!files.length)throw lf_error_('FILES_REQUIRED','files[] is required.',400);
  if(files.length>LF.MAX_BATCH_FILES)throw lf_error_('TOO_MANY_FILES','Upload at most '+LF.MAX_BATCH_FILES+' files in one batch.',413);
  const results=[];
  files.forEach(function(f){
    try{results.push(lf_fileIngest_(auth,Object.assign({},f,{projectId:data.projectId||f.projectId,storageTarget:f.storageTarget||data.storageTarget,mirrorToLinkedDrive:Object.prototype.hasOwnProperty.call(f,'mirrorToLinkedDrive')?f.mirrorToLinkedDrive:data.mirrorToLinkedDrive})));}
    catch(err){results.push({ok:false,name:f.name||f.fileName||'',error:{code:err.code||'INGEST_FAILED',message:err.publicMessage||err.message}});}
  });
  return {ok:true,results:results,succeeded:results.filter(function(r){return r.ok;}).length,failed:results.filter(function(r){return !r.ok;}).length};
}

function lf_fileIndexList_(auth,data){
  let rows=lf_rows_('FILE_INDEX').filter(function(r){return r.userId===auth.user.id&&(!data.projectId||r.projectId===String(data.projectId));});
  if(data.category)rows=rows.filter(function(r){return r.category===String(data.category);});
  rows.sort(function(a,b){return String(b.updatedAt).localeCompare(String(a.updatedAt));});
  return {ok:true,files:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicFileIndex_)};
}
function lf_fileIndexGet_(auth,data){const row=lf_findOne_('FILE_INDEX',function(r){return r.id===String(data.id||data.fileIndexId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('FILE_INDEX_NOT_FOUND','Indexed file was not found.',404);const out=lf_publicFileIndex_(row);if(lf_boolDefault_(data.includeFullText,true))out.fullText=lf_fileIndexFullText_(row);return{ok:true,file:out};}
function lf_extractTextFromBlob_(blob,name,mime){
  const lower=String(name||'').toLowerCase(), ext=(lower.match(/\.([a-z0-9]+)$/)||[])[1]||'';
  if(/^text\//i.test(mime)||/^(txt|md|markdown|csv|tsv|json|xml|html?|yaml|yml)$/.test(ext))return lf_limitText_(blob.getDataAsString('UTF-8'),LF.MAX_TEXT_CHARS);
  if(ext==='docx')return lf_extractDocxText_(blob);
  if(ext==='odt')return lf_extractOdtText_(blob);
  if(ext==='epub')return lf_extractEpubText_(blob);
  if(ext==='rtf')return lf_extractRtfText_(blob.getDataAsString('UTF-8'));
  if(ext==='pdf'||mime==='application/pdf')return lf_extractPdfTextViaDrive_(blob);
  return '';
}

function lf_extractDocxText_(blob){
  const parts=Utilities.unzip(blob), doc=parts.filter(function(b){return b.getName()==='word/document.xml';})[0];
  if(!doc)return'';
  return lf_limitText_(lf_xmlishToText_(doc.getDataAsString('UTF-8')),LF.MAX_TEXT_CHARS);
}
function lf_extractOdtText_(blob){
  const parts=Utilities.unzip(blob), doc=parts.filter(function(b){return b.getName()==='content.xml';})[0];
  return doc?lf_limitText_(lf_xmlishToText_(doc.getDataAsString('UTF-8')),LF.MAX_TEXT_CHARS):'';
}
function lf_extractEpubText_(blob){
  const parts=Utilities.unzip(blob).filter(function(b){return /\.(x?html?|xml)$/i.test(b.getName());});
  let out='';parts.forEach(function(b){if(out.length<LF.MAX_TEXT_CHARS)out+='\n\n'+lf_xmlishToText_(b.getDataAsString('UTF-8'));});
  return lf_limitText_(out.trim(),LF.MAX_TEXT_CHARS);
}
function lf_extractRtfText_(s){
  return lf_limitText_(String(s||'').replace(/\\par[d]?/g,'\n').replace(/\\'[0-9a-fA-F]{2}/g,' ').replace(/\\[a-zA-Z]+-?\d* ?/g,'').replace(/[{}]/g,'').replace(/\s+\n/g,'\n').trim(),LF.MAX_TEXT_CHARS);
}
function lf_xmlishToText_(xml){
  return lf_decodeXmlEntities_(String(xml||'').replace(/<w:tab\s*\/?\s*>/gi,'\t').replace(/<w:br\s*\/?\s*>/gi,'\n').replace(/<\/w:p>/gi,'\n').replace(/<\/text:p>/gi,'\n').replace(/<\/p>/gi,'\n').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n').replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}
function lf_decodeXmlEntities_(s){return String(s||'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&').replace(/&#(\d+);/g,function(_,n){return String.fromCharCode(Number(n));});}

function lf_extractPdfTextViaDrive_(blob){
  let tempId='';
  try{
    const boundary='lf_'+Utilities.getUuid().replace(/-/g,''), meta={name:'LiteraryFriend PDF Text Extraction',mimeType:'application/vnd.google-apps.document'};
    const head='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/pdf\r\n\r\n';
    const tail='\r\n--'+boundary+'--';
    const bytes=Utilities.newBlob(head).getBytes().concat(blob.getBytes()).concat(Utilities.newBlob(tail).getBytes());
    const resp=UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{
      method:'post',contentType:'multipart/related; boundary='+boundary,payload:bytes,headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true
    });
    if(resp.getResponseCode()<200||resp.getResponseCode()>=300)return'';
    tempId=JSON.parse(resp.getContentText()).id;
    Utilities.sleep(350);
    const doc=DocumentApp.openById(tempId);return lf_limitText_(doc.getBody().getText(),LF.MAX_TEXT_CHARS);
  }catch(err){return'';}finally{if(tempId)try{DriveApp.getFileById(tempId).setTrashed(true);}catch(ignore){}}
}

function lf_guessMimeFromName_(name){
  const ext=(String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/)||[])[1]||'';
  const m={txt:'text/plain',md:'text/markdown',markdown:'text/markdown',json:'application/json',pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',doc:'application/msword',odt:'application/vnd.oasis.opendocument.text',rtf:'application/rtf',html:'text/html',htm:'text/html',csv:'text/csv',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',mp3:'audio/mpeg',wav:'audio/wav'};
  return m[ext]||'application/octet-stream';
}
function lf_stripExtension_(name){return String(name||'').replace(/\.[A-Za-z0-9]{1,12}$/,'');}
function lf_findDirectoryByCategory_(userId,projectId,category){
  const map={manuscript:'Drafts',outline:'Outline',characters:'Characters',character:'Characters',worldbuilding:'Worldbuilding',language:'Language',research:'Research',art:'Cover Art Studio',data:'Imports & Consolidation',other:'Imports & Consolidation'};
  const title=map[category]||'Imports & Consolidation';
  return lf_findOne_('NODES',function(r){return r.userId===userId&&r.projectId===projectId&&!r.deletedAt&&r.nodeType==='directory'&&String(r.title).toLowerCase()===title.toLowerCase();});
}
function lf_boolDefault_(v,d){return v===null||typeof v==='undefined'?d:lf_bool_(v);}

/* ========================================================================== */
/* PROJECT SWITCHING / MULTI-PROJECT & TRANSMEDIA RELATIONS                    */
/* ========================================================================== */

function lf_projectSwitch_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId||data.id);
  const settings=lf_parseJson_(auth.user.settingsJson,lf_defaultSettings_());
  settings.organization=settings.organization||{};settings.organization.activeProjectId=project.id;settings.organization.isolateProjects=true;
  lf_updateRow_('USERS',auth.user._row,{settingsJson:JSON.stringify(settings),updatedAt:lf_nowIso_()});
  return lf_projectWorkspace_(auth,{projectId:project.id});
}

function lf_projectWorkspace_(auth,data){
  const id=String(data.projectId||lf_parseJson_(auth.user.settingsJson,{}).organization&&lf_parseJson_(auth.user.settingsJson,{}).organization.activeProjectId||'');
  const project=lf_requireOwnedProject_(auth,id);
  const counts={};
  ['NODES','NOTES','ENTITIES','TIMELINE_EVENTS','PLOT_ISSUES','LANGUAGES','FILE_INDEX','BOOKS','ART_PROJECTS'].forEach(function(sh){counts[sh.toLowerCase()]=lf_rows_(sh).filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&(!Object.prototype.hasOwnProperty.call(r,'deletedAt')||!r.deletedAt);}).length;});
  return {ok:true,activeProjectId:project.id,project:lf_publicProject_(project),counts:counts,relations:lf_projectRelationsList_(auth,{projectId:project.id}).relations};
}

function lf_projectRelationSave_(auth,data){
  const parent=lf_requireOwnedProject_(auth,data.parentProjectId), child=lf_requireOwnedProject_(auth,data.childProjectId);
  if(parent.id===child.id)throw lf_error_('RELATION_INVALID','A project cannot be related to itself.',400);
  const id=String(data.id||data.relationId||'');let row=id?lf_findOne_('PROJECT_RELATIONS',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  const now=lf_nowIso_(),patch={userId:auth.user.id,parentProjectId:parent.id,childProjectId:child.id,relationType:lf_cleanSlug_(data.relationType||'shared-universe'),canonScope:lf_cleanText_(data.canonScope||'shared',80),chronologyJson:JSON.stringify(data.chronology||{}),metadataJson:JSON.stringify(data.metadata||{}),updatedAt:now,deletedAt:''};
  if(row)row=lf_updateRow_('PROJECT_RELATIONS',row._row,patch);else{patch.id='relation_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('PROJECT_RELATIONS',patch);}return{ok:true,relation:lf_publicProjectRelation_(row)};
}
function lf_projectRelationsList_(auth,data){const id=String(data.projectId||lf_scopeProjectId_(auth,data)||'');let rows=lf_rows_('PROJECT_RELATIONS').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!id||r.parentProjectId===id||r.childProjectId===id);});return{ok:true,relations:rows.map(lf_publicProjectRelation_)};}
function lf_projectRelationDelete_(auth,data){const row=lf_findOne_('PROJECT_RELATIONS',function(r){return r.id===String(data.id||data.relationId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('RELATION_NOT_FOUND','Project relation was not found.',404);lf_updateRow_('PROJECT_RELATIONS',row._row,{deletedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});return{ok:true};}

/* ========================================================================== */
/* STORY-STATE / CANON / KNOWLEDGE / THREADS / CAUSALITY / RULES               */
/* ========================================================================== */

function lf_storyFactSave_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),id=String(data.id||data.factId||'');let row=id?lf_findOne_('STORY_FACTS',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  const now=lf_nowIso_(),patch={userId:auth.user.id,projectId:project.id,subjectType:lf_cleanSlug_(data.subjectType||'entity'),subjectId:String(data.subjectId||''),predicate:lf_cleanText_(data.predicate||'',160),valueJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'value')?data.value:null),truthStatus:lf_cleanSlug_(data.truthStatus||'canon'),scope:lf_cleanSlug_(data.scope||'project'),validFrom:lf_cleanText_(data.validFrom||'',160),validUntil:lf_cleanText_(data.validUntil||'',160),sourceType:lf_cleanSlug_(data.sourceType||''),sourceId:String(data.sourceId||''),sourceQuote:lf_limitText_(data.sourceQuote||'',5000),confidence:Number(Object.prototype.hasOwnProperty.call(data,'confidence')?data.confidence:1),status:lf_cleanSlug_(data.status||'active'),metadataJson:JSON.stringify(data.metadata||{}),updatedAt:now};
  if(!patch.predicate)throw lf_error_('PREDICATE_REQUIRED','Story fact predicate is required.',400);if(row)row=lf_updateRow_('STORY_FACTS',row._row,patch);else{patch.id='fact_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('STORY_FACTS',patch);}return{ok:true,fact:lf_publicStoryFact_(row)};
}
function lf_storyFactsList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('STORY_FACTS').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p)&&(!data.subjectId||r.subjectId===String(data.subjectId))&&(!data.status||r.status===String(data.status));});return{ok:true,facts:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicStoryFact_)};}
function lf_storyFactDelete_(auth,data){const row=lf_findOne_('STORY_FACTS',function(r){return r.id===String(data.id||data.factId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('FACT_NOT_FOUND','Story fact was not found.',404);lf_updateRow_('STORY_FACTS',row._row,{status:'deleted',updatedAt:lf_nowIso_()});return{ok:true};}

function lf_knowledgeSave_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),character=lf_findOne_('ENTITIES',function(r){return r.id===String(data.characterId||'')&&r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;});if(!character)throw lf_error_('CHARACTER_NOT_FOUND','Character was not found.',404);
  const fact=lf_findOne_('STORY_FACTS',function(r){return r.id===String(data.factId||'')&&r.userId===auth.user.id&&r.projectId===project.id&&r.status!=='deleted';});if(!fact)throw lf_error_('FACT_NOT_FOUND','Story fact was not found.',404);
  const id=String(data.id||data.knowledgeId||'');let row=id?lf_findOne_('KNOWLEDGE_LEDGER',function(r){return r.id===id&&r.userId===auth.user.id;}):null;const now=lf_nowIso_(),patch={userId:auth.user.id,projectId:project.id,characterId:character.id,factId:fact.id,knowledgeState:lf_cleanSlug_(data.knowledgeState||'knows'),learnedAtEventId:String(data.learnedAtEventId||''),learnedAtNodeId:String(data.learnedAtNodeId||''),sourceCharacterId:String(data.sourceCharacterId||''),reliability:Number(Object.prototype.hasOwnProperty.call(data,'reliability')?data.reliability:1),metadataJson:JSON.stringify(data.metadata||{}),updatedAt:now};if(row)row=lf_updateRow_('KNOWLEDGE_LEDGER',row._row,patch);else{patch.id='knowledge_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('KNOWLEDGE_LEDGER',patch);}return{ok:true,knowledge:lf_publicKnowledge_(row)};
}
function lf_knowledgeList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('KNOWLEDGE_LEDGER').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p)&&(!data.characterId||r.characterId===String(data.characterId))&&(!data.factId||r.factId===String(data.factId));});return{ok:true,knowledge:rows.map(lf_publicKnowledge_)};}
function lf_plotThreadSave_(auth,data){const project=lf_requireOwnedProject_(auth,data.projectId),id=String(data.id||data.threadId||'');let row=id?lf_findOne_('PLOT_THREADS',function(r){return r.id===id&&r.userId===auth.user.id;}):null;const now=lf_nowIso_(),patch={userId:auth.user.id,projectId:project.id,name:lf_cleanText_(data.name||'Untitled Thread',180),threadType:lf_cleanSlug_(data.threadType||'plot'),status:lf_cleanSlug_(data.status||'active'),importance:lf_cleanText_(data.importance||'medium',20),introducedNodeId:String(data.introducedNodeId||''),lastTouchedNodeId:String(data.lastTouchedNodeId||''),resolutionNodeId:String(data.resolutionNodeId||''),beatNodeIdsJson:JSON.stringify(data.beatNodeIds||[]),metadataJson:JSON.stringify(data.metadata||{}),updatedAt:now};if(row)row=lf_updateRow_('PLOT_THREADS',row._row,patch);else{patch.id='thread_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('PLOT_THREADS',patch);}return{ok:true,thread:lf_publicPlotThread_(row)};}
function lf_plotThreadsList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('PLOT_THREADS').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p)&&(!data.status||r.status===String(data.status));});return{ok:true,threads:rows.map(lf_publicPlotThread_)};}
function lf_plotThreadDelete_(auth,data){const row=lf_findOne_('PLOT_THREADS',function(r){return r.id===String(data.id||data.threadId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('THREAD_NOT_FOUND','Plot thread was not found.',404);lf_deleteRow_('PLOT_THREADS',row._row);return{ok:true};}

function lf_causalLinkSave_(auth,data){const project=lf_requireOwnedProject_(auth,data.projectId),id=String(data.id||data.linkId||'');let row=id?lf_findOne_('CAUSAL_LINKS',function(r){return r.id===id&&r.userId===auth.user.id;}):null;const now=lf_nowIso_(),patch={userId:auth.user.id,projectId:project.id,fromType:lf_cleanSlug_(data.fromType||'event'),fromId:String(data.fromId||''),toType:lf_cleanSlug_(data.toType||'event'),toId:String(data.toId||''),relation:lf_cleanSlug_(data.relation||'causes'),required:lf_boolDefault_(data.required,true),confidence:Number(Object.prototype.hasOwnProperty.call(data,'confidence')?data.confidence:1),notes:lf_limitText_(data.notes||'',10000),metadataJson:JSON.stringify(data.metadata||{}),updatedAt:now};if(!patch.fromId||!patch.toId)throw lf_error_('CAUSAL_ENDPOINTS_REQUIRED','Causal link requires fromId and toId.',400);if(row)row=lf_updateRow_('CAUSAL_LINKS',row._row,patch);else{patch.id='cause_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('CAUSAL_LINKS',patch);}return{ok:true,link:lf_publicCausalLink_(row)};}
function lf_causalLinksList_(auth,data){const p=lf_scopeProjectId_(auth,data);return{ok:true,links:lf_rows_('CAUSAL_LINKS').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p);}).map(lf_publicCausalLink_)};}
function lf_causalLinkDelete_(auth,data){const row=lf_findOne_('CAUSAL_LINKS',function(r){return r.id===String(data.id||data.linkId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('CAUSAL_LINK_NOT_FOUND','Causal link was not found.',404);lf_deleteRow_('CAUSAL_LINKS',row._row);return{ok:true};}

function lf_worldRuleSave_(auth,data){const project=lf_requireOwnedProject_(auth,data.projectId),id=String(data.id||data.ruleId||'');let row=id?lf_findOne_('WORLD_RULES',function(r){return r.id===id&&r.userId===auth.user.id;}):null;const now=lf_nowIso_(),patch={userId:auth.user.id,projectId:project.id,ruleType:lf_cleanSlug_(data.ruleType||'world'),name:lf_cleanText_(data.name||'World Rule',180),statement:lf_limitText_(data.statement||'',20000),conditionsJson:JSON.stringify(data.conditions||[]),exceptionsJson:JSON.stringify(data.exceptions||[]),status:lf_cleanSlug_(data.status||'active'),sourceIdsJson:JSON.stringify(data.sourceIds||[]),metadataJson:JSON.stringify(data.metadata||{}),updatedAt:now};if(row)row=lf_updateRow_('WORLD_RULES',row._row,patch);else{patch.id='rule_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('WORLD_RULES',patch);}return{ok:true,rule:lf_publicWorldRule_(row)};}
function lf_worldRulesList_(auth,data){const p=lf_scopeProjectId_(auth,data);return{ok:true,rules:lf_rows_('WORLD_RULES').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p)&&(!data.status||r.status===String(data.status));}).map(lf_publicWorldRule_)};}
function lf_worldRuleDelete_(auth,data){const row=lf_findOne_('WORLD_RULES',function(r){return r.id===String(data.id||data.ruleId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('WORLD_RULE_NOT_FOUND','World rule was not found.',404);lf_updateRow_('WORLD_RULES',row._row,{status:'deleted',updatedAt:lf_nowIso_()});return{ok:true};}

function lf_characterSearch_(auth,data){const q=String(data.query||data.q||'').toLowerCase().trim(),projectId=lf_scopeProjectId_(auth,data);let rows=lf_rows_('ENTITIES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&r.entityType==='character'&&(!projectId||r.projectId===projectId);});if(q)rows=rows.filter(function(r){return[r.name,r.description,r.aliasesJson,r.attributesJson,r.relationshipsJson,r.tagsJson].join('\n').toLowerCase().indexOf(q)>=0;});return{ok:true,projectId:projectId||'',characters:rows.slice(0,LF.MAX_SEARCH_RESULTS).map(lf_publicEntity_)};}
function lf_storyExtract_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),context=lf_buildEditorContext_(auth.user.id,project.id,data.scopeType||'project',data.scopeId||'',data.maxChars||LF.MAX_AI_CONTEXT_CHARS),response=lf_aiInvoke_(auth,'story-state-extraction',project.id,{instruction:'Extract only evidence-supported story state. Build a living story model, not merely a summary. Return entities, facts, character knowledge/beliefs, plot threads, causal links, world rules, and entity mentions. Every fact and mention must preserve source node/evidence and confidence. Distinguish canon truth from character belief, rumor, legend, lie, unreliable narration, deliberate retcon, and uncertain information. Use stable clientRef values so facts/knowledge/mentions/causal links can reference extracted entities and threads.',context:context,options:data.options||{},requiredSchema:{entities:[{clientRef:'string',entityType:'character|location|object|organization|species|culture|event|concept|other',name:'string',aliases:'array',description:'string',attributes:'object',relationships:'array',tags:'array'}],facts:[{clientRef:'string',subjectRef:'entity clientRef?',subjectId:'existing id?',subjectType:'string',predicate:'string',value:'any',truthStatus:'canon|belief|rumor|legend|lie|uncertain|intentional',scope:'project|series|universe',validFrom:'string',validUntil:'string',sourceType:'node',sourceId:'string',sourceQuote:'string',confidence:'0..1'}],knowledge:[{characterRef:'entity clientRef?',characterId:'existing id?',factRef:'fact clientRef?',factId:'existing id?',knowledgeState:'knows|believes|disbelieves|suspects|forgot|cannot-know',learnedAtNodeId:'string',learnedAtEventId:'string',sourceCharacterId:'string',reliability:'0..1'}],plotThreads:[{clientRef:'string',name:'string',threadType:'string',status:'string',importance:'string',introducedNodeId:'string',lastTouchedNodeId:'string',resolutionNodeId:'string',beatNodeIds:'array'}],causalLinks:[{fromRef:'clientRef or id',fromType:'string',toRef:'clientRef or id',toType:'string',relation:'string',required:'boolean',confidence:'0..1',notes:'string'}],worldRules:[{ruleType:'string',name:'string',statement:'string',conditions:'array',exceptions:'array',status:'active',sourceIds:'array'}],entityMentions:[{entityRef:'entity clientRef?',entityId:'existing id?',nodeId:'string',startOffset:'number',endOffset:'number',quote:'string',context:'string'}]}},false),result=response.result||{},committed={entities:0,facts:0,knowledge:0,threads:0,causalLinks:0,rules:0,mentions:0},refs={};
  if(lf_bool_(data.commit)){
    (result.entities||[]).forEach(function(x){try{const key=String(x.clientRef||x.ref||x.name||''),type=lf_cleanSlug_(x.entityType||'other'),name=String(x.name||'').trim();if(!name)return;let entity=lf_findOne_('ENTITIES',function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt&&r.entityType===type&&String(r.name).toLowerCase()===name.toLowerCase();});if(!entity||lf_bool_(data.updateExistingEntities)){const saved=lf_entitySave_(auth,{id:entity?entity.id:'',projectId:project.id,entityType:type,name:name,aliases:x.aliases||[],description:x.description||(entity&&entity.description)||'',attributes:entity?lf_deepMerge_(lf_parseJson_(entity.attributesJson,{}),x.attributes||{}):(x.attributes||{}),relationships:x.relationships||(entity?lf_parseJson_(entity.relationshipsJson,[]):[]),tags:x.tags||(entity?lf_parseJson_(entity.tagsJson,[]):[])}).entity;entity=lf_findOne_('ENTITIES',function(r){return r.id===saved.id;});committed.entities++;}if(key)refs[key]=entity.id;refs[name]=entity.id;}catch(ignore){}});
    const factRefs={};(result.facts||[]).forEach(function(x){try{const subjectId=String(x.subjectId||refs[String(x.subjectRef||'')]||''),valueJson=JSON.stringify(Object.prototype.hasOwnProperty.call(x,'value')?x.value:null),existing=lf_findOne_('STORY_FACTS',function(r){return r.userId===auth.user.id&&r.projectId===project.id&&r.status==='active'&&r.subjectId===subjectId&&r.predicate===String(x.predicate||'')&&r.valueJson===valueJson&&r.validFrom===String(x.validFrom||'')&&r.validUntil===String(x.validUntil||'')&&r.sourceId===String(x.sourceId||'');});let fact;if(existing)fact=lf_publicStoryFact_(existing);else{fact=lf_storyFactSave_(auth,{projectId:project.id,subjectType:x.subjectType||'entity',subjectId:subjectId,predicate:x.predicate,value:x.value,truthStatus:x.truthStatus||'canon',scope:x.scope||'project',validFrom:x.validFrom||'',validUntil:x.validUntil||'',sourceType:x.sourceType||'node',sourceId:x.sourceId||'',sourceQuote:x.sourceQuote||'',confidence:Object.prototype.hasOwnProperty.call(x,'confidence')?x.confidence:1,metadata:lf_deepMerge_(x.metadata||{},{extracted:true})}).fact;committed.facts++;}const key=String(x.clientRef||x.ref||'');if(key)factRefs[key]=fact.id;}catch(ignore){}});
    (result.knowledge||[]).forEach(function(x){try{const characterId=String(x.characterId||refs[String(x.characterRef||'')]||''),factId=String(x.factId||factRefs[String(x.factRef||'')]||'');if(!characterId||!factId)return;const existing=lf_findOne_('KNOWLEDGE_LEDGER',function(r){return r.userId===auth.user.id&&r.projectId===project.id&&r.characterId===characterId&&r.factId===factId&&r.knowledgeState===lf_cleanSlug_(x.knowledgeState||'knows')&&r.learnedAtNodeId===String(x.learnedAtNodeId||'');});if(!existing){lf_knowledgeSave_(auth,{projectId:project.id,characterId:characterId,factId:factId,knowledgeState:x.knowledgeState||'knows',learnedAtEventId:x.learnedAtEventId||'',learnedAtNodeId:x.learnedAtNodeId||'',sourceCharacterId:x.sourceCharacterId||'',reliability:Object.prototype.hasOwnProperty.call(x,'reliability')?x.reliability:1,metadata:lf_deepMerge_(x.metadata||{},{extracted:true})});committed.knowledge++;}}catch(ignore){}});
    const threadRefs={};(result.plotThreads||[]).forEach(function(x){try{let row=lf_findOne_('PLOT_THREADS',function(r){return r.userId===auth.user.id&&r.projectId===project.id&&String(r.name).toLowerCase()===String(x.name||'').toLowerCase();}),thread;if(row&&!lf_bool_(data.updateExistingStoryState))thread=lf_publicPlotThread_(row);else{thread=lf_plotThreadSave_(auth,{id:row?row.id:'',projectId:project.id,name:x.name,threadType:x.threadType||'plot',status:x.status||'active',importance:x.importance||'medium',introducedNodeId:x.introducedNodeId||'',lastTouchedNodeId:x.lastTouchedNodeId||'',resolutionNodeId:x.resolutionNodeId||'',beatNodeIds:x.beatNodeIds||[],metadata:lf_deepMerge_(x.metadata||{},{extracted:true})}).thread;committed.threads++;}const key=String(x.clientRef||x.ref||x.name||'');if(key)threadRefs[key]=thread.id;}catch(ignore){}});
    const allRefs=lf_deepMerge_(lf_deepMerge_({},refs),lf_deepMerge_(factRefs,threadRefs));
    (result.causalLinks||[]).forEach(function(x){try{const fromId=String(x.fromId||allRefs[String(x.fromRef||'')]||''),toId=String(x.toId||allRefs[String(x.toRef||'')]||'');if(!fromId||!toId)return;const existing=lf_findOne_('CAUSAL_LINKS',function(r){return r.userId===auth.user.id&&r.projectId===project.id&&r.fromId===fromId&&r.toId===toId&&r.relation===lf_cleanSlug_(x.relation||'causes');});if(!existing){lf_causalLinkSave_(auth,{projectId:project.id,fromType:x.fromType||'event',fromId:fromId,toType:x.toType||'event',toId:toId,relation:x.relation||'causes',required:Object.prototype.hasOwnProperty.call(x,'required')?x.required:true,confidence:Object.prototype.hasOwnProperty.call(x,'confidence')?x.confidence:1,notes:x.notes||'',metadata:lf_deepMerge_(x.metadata||{},{extracted:true})});committed.causalLinks++;}}catch(ignore){}});
    (result.worldRules||[]).forEach(function(x){try{const existing=lf_findOne_('WORLD_RULES',function(r){return r.userId===auth.user.id&&r.projectId===project.id&&String(r.name).toLowerCase()===String(x.name||'').toLowerCase()&&r.statement===String(x.statement||'');});if(!existing){lf_worldRuleSave_(auth,Object.assign({},x,{projectId:project.id,metadata:lf_deepMerge_(x.metadata||{},{extracted:true})}));committed.rules++;}}catch(ignore){}});
    (result.entityMentions||[]).forEach(function(x){try{const entityId=String(x.entityId||refs[String(x.entityRef||'')]||'');if(!entityId||!x.nodeId)return;const existing=lf_findOne_('ENTITY_MENTIONS',function(r){return r.userId===auth.user.id&&r.projectId===project.id&&r.entityId===entityId&&r.nodeId===String(x.nodeId)&&Number(r.startOffset||0)===Number(x.startOffset||0)&&Number(r.endOffset||0)===Number(x.endOffset||0);});if(!existing){lf_storyMentionSave_(auth,{projectId:project.id,entityId:entityId,nodeId:x.nodeId,startOffset:x.startOffset,endOffset:x.endOffset,quote:x.quote||'',context:x.context||'',metadata:lf_deepMerge_(x.metadata||{},{extracted:true})});committed.mentions++;}}catch(ignore){}});
  }
  return{ok:true,projectId:project.id,result:result,committed:committed,commitRequiredForChanges:!lf_bool_(data.commit)};
}
function lf_storyMentionSave_(auth,data){const project=lf_requireOwnedProject_(auth,data.projectId),entity=lf_findOne_('ENTITIES',function(r){return r.id===String(data.entityId||'')&&r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;}),node=lf_findOne_('NODES',function(r){return r.id===String(data.nodeId||'')&&r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;});if(!entity||!node)throw lf_error_('MENTION_TARGET_INVALID','Entity mention requires a valid entity and node in the same project.',400);const row=lf_appendRow_('ENTITY_MENTIONS',{id:'mention_'+Utilities.getUuid(),userId:auth.user.id,projectId:project.id,entityId:entity.id,nodeId:node.id,startOffset:Number(data.startOffset||0),endOffset:Number(data.endOffset||0),quote:lf_limitText_(data.quote||'',5000),context:lf_limitText_(data.context||'',10000),metadataJson:JSON.stringify(data.metadata||{}),createdAt:lf_nowIso_()});return{ok:true,mention:lf_publicEntityMention_(row)};}
function lf_storyMentionsList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('ENTITY_MENTIONS').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p)&&(!data.entityId||r.entityId===String(data.entityId))&&(!data.nodeId||r.nodeId===String(data.nodeId));});rows.sort(function(a,b){return String(a.nodeId).localeCompare(String(b.nodeId))||Number(a.startOffset||0)-Number(b.startOffset||0);});return{ok:true,mentions:rows.slice(0,LF.MAX_LIST_RESULTS).map(lf_publicEntityMention_)};}
function lf_storyMentionDelete_(auth,data){const row=lf_findOne_('ENTITY_MENTIONS',function(r){return r.id===String(data.id||data.mentionId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('MENTION_NOT_FOUND','Entity mention was not found.',404);lf_deleteRow_('ENTITY_MENTIONS',row._row);return{ok:true};}
function lf_publicEntityMention_(r){return{id:r.id,projectId:r.projectId,entityId:r.entityId,nodeId:r.nodeId,startOffset:Number(r.startOffset||0),endOffset:Number(r.endOffset||0),quote:r.quote||'',context:r.context||'',metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt};}

function lf_storyDebugState_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),nodeId=String(data.nodeId||'');
  const facts=lf_storyFactsList_(auth,{projectId:project.id,status:'active'}).facts;
  const knowledge=lf_knowledgeList_(auth,{projectId:project.id}).knowledge;
  const threads=lf_plotThreadsList_(auth,{projectId:project.id}).threads;
  const rules=lf_worldRulesList_(auth,{projectId:project.id,status:'active'}).rules;
  const entities=lf_entitiesList_(auth,{projectId:project.id}).entities;
  const events=lf_timelineList_(auth,{projectId:project.id}).events;
  const mentions=lf_storyMentionsList_(auth,{projectId:project.id,nodeId:nodeId||undefined}).mentions;
  return{ok:true,projectId:project.id,nodeId:nodeId,state:{facts:facts,knowledge:knowledge,threads:threads,worldRules:rules,entities:entities,timeline:events,entityMentions:mentions},note:'State data is evidence-oriented. Facts marked belief, rumor, legend, lie, uncertain, or intentional remain distinct from project canon.'};
}

function lf_outlineGenerate_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId);let result;
  if(lf_aiConfigured_()){
    result=lf_aiInvoke_(auth,'outline-generate',project.id,{project:lf_publicProject_(project),structure:data.structure||'adaptive',length:data.length||'',genre:data.genre||'',premise:data.premise||project.description||'',constraints:data.constraints||[],existingContext:lf_buildEditorContext_(auth.user.id,project.id,'project','',Math.min(LF.MAX_AI_CONTEXT_CHARS,250000))},false).result;
  }else{
    result={title:project.title,structure:data.structure||'adaptive',sections:[{title:'Opening',purpose:'Establish protagonist, situation, stakes, and destabilizing change.'},{title:'Development',purpose:'Escalate conflicts, deepen relationships, advance subplots, and complicate goals.'},{title:'Turning Point',purpose:'Force a consequential choice or revelation that changes the story direction.'},{title:'Escalation',purpose:'Tighten cause and effect, increase cost, and move major threads toward convergence.'},{title:'Climax',purpose:'Resolve the central conflict through choices supported by prior setup.'},{title:'Resolution',purpose:'Pay off major threads and establish the changed story state.'}],generatedBy:'local-outline-skeleton'};
  }
  if(lf_bool_(data.save)){
    const parent=lf_findDirectoryByCategory_(auth.user.id,project.id,'outline');
    const node=lf_nodeSave_(auth,{projectId:project.id,parentId:parent?parent.id:'',nodeType:'outline',title:lf_cleanText_(data.title||'Generated Outline',180),content:'<pre>'+lf_escapeHtml_(JSON.stringify(result,null,2))+'</pre>',plainText:JSON.stringify(result,null,2),metadata:{generated:true,source:'outline.generate'}});
    return{ok:true,outline:result,node:node.node};
  }
  return{ok:true,outline:result};
}

/* ========================================================================== */
/* AI GATEWAY + SPECIALIZED EDITORS                                            */
/* ========================================================================== */

function lf_aiConfigured_(){return !!PropertiesService.getScriptProperties().getProperty('LF_AI_WEBHOOK_URL');}

function lf_aiInvoke_(auth,jobType,projectId,payload,useImageEndpoint){
  const p=PropertiesService.getScriptProperties(),url=(useImageEndpoint?p.getProperty('LF_IMAGE_AI_WEBHOOK_URL'):'')||p.getProperty('LF_AI_WEBHOOK_URL')||'';if(!url)throw lf_error_('AI_NOT_CONFIGURED','AI features require configuring LF_AI_WEBHOOK_URL (or LF_IMAGE_AI_WEBHOOK_URL for image generation).',503);
  const provider=p.getProperty('LF_AI_PROVIDER_LABEL')||'Configured AI',now=lf_nowIso_(),requestEnvelope={app:LF.APP_NAME,version:LF.VERSION,jobType:jobType,userId:auth.user.id,projectId:projectId||'',request:payload||{}},job=lf_appendRow_('AI_JOBS',{id:'aijob_'+Utilities.getUuid(),userId:auth.user.id,projectId:projectId||'',jobType:jobType,provider:provider,status:'running',inputHash:lf_sha256Hex_(JSON.stringify(requestEnvelope)),requestJson:lf_jsonCell_(lf_compactAiLog_(lf_redactAiRequest_(requestEnvelope))),resultJson:'',error:'',createdAt:now,updatedAt:now}),headers={'Content-Type':'application/json'},secret=p.getProperty('LF_AI_WEBHOOK_SECRET')||'';if(secret)headers['X-LiteraryFriend-AI-Secret']=secret;
  try{const resp=UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',payload:JSON.stringify(requestEnvelope),headers:headers,muteHttpExceptions:true});if(resp.getResponseCode()<200||resp.getResponseCode()>=300)throw lf_error_('AI_PROVIDER_ERROR','The configured AI service returned an error.',502,{status:resp.getResponseCode()});const parsed=lf_parseJson_(resp.getContentText(),null);if(!parsed)throw lf_error_('AI_PROVIDER_INVALID','The configured AI service did not return JSON.',502);const result=Object.prototype.hasOwnProperty.call(parsed,'result')?parsed.result:parsed;lf_updateRow_('AI_JOBS',job._row,{status:'complete',resultJson:lf_jsonCell_(lf_compactAiLog_(result)),updatedAt:lf_nowIso_()});return{ok:true,jobId:job.id,provider:provider,result:result};}catch(err){lf_updateRow_('AI_JOBS',job._row,{status:'failed',error:lf_cleanText_(err.publicMessage||err.message||'AI request failed',2000),updatedAt:lf_nowIso_()});throw err;}
}
function lf_redactAiRequest_(obj){
  const clone=lf_parseJson_(JSON.stringify(obj),{});
  function walk(v){if(!v||typeof v!=='object')return;Object.keys(v).forEach(function(k){if(/token|password|secret|authorization/i.test(k))v[k]='[redacted]';else walk(v[k]);});}walk(clone);return clone;
}

function lf_aiRequest_(auth,data){
  const projectId=String(data.projectId||'');if(projectId)lf_requireOwnedProject_(auth,projectId);
  const jobType=lf_cleanSlug_(data.jobType||'writing-assistant');
  const allowed=['writing-assistant','rewrite','brainstorm','editor','story-state-extraction','outline-generate','language-generate','image-generate','consolidation'];
  if(allowed.indexOf(jobType)<0)throw lf_error_('AI_JOB_INVALID','Unsupported AI job type.',400);
  return lf_aiInvoke_(auth,jobType,projectId,{instruction:lf_limitText_(data.instruction||'',50000),input:data.input||{},context:data.context||{},options:data.options||{}},jobType==='image-generate');
}
function lf_aiJobsList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('AI_JOBS').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p);});rows.sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});return{ok:true,jobs:rows.slice(0,Math.min(Number(data.limit||100),500)).map(lf_publicAiJob_)};}
function lf_editorRun_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId);const editorType=lf_cleanSlug_(data.editorType||'developmental');
  const allowed=['continuity','plot','character','world','timeline','developmental','line','copy','pov','series','causality','setup-payoff','knowledge'];
  if(allowed.indexOf(editorType)<0)throw lf_error_('EDITOR_TYPE_INVALID','Unsupported editor type.',400);
  const context=lf_buildEditorContext_(auth.user.id,project.id,data.scopeType||'project',data.scopeId||'',data.maxChars||LF.MAX_AI_CONTEXT_CHARS);
  let results=[],summary='',provider='deterministic-local-v2';
  const deterministic=lf_deterministicEditor_(auth,project,editorType,context);
  results=results.concat(deterministic.results);summary=deterministic.summary;
  if(lf_boolDefault_(data.useAi,true)&&lf_aiConfigured_()){
    const ai=lf_aiInvoke_(auth,'editor',project.id,{editorType:editorType,instruction:lf_editorInstruction_(editorType),context:context,storyState:lf_storyDebugState_(auth,{projectId:project.id}).state,deterministicFindings:results,requiredResultSchema:{summary:'string',findings:[{title:'string',description:'string',issueType:'string',severity:'low|medium|high|critical',confidence:'0..1',evidence:[{sourceId:'string',quote:'string',startOffset:'number?',endOffset:'number?'}],suggestion:'string',fixPatch:'optional object',classification:'continuity|editorial|line|copy'}]}},false);
    provider=ai.provider;const ar=ai.result||{};if(ar.summary)summary=String(ar.summary);if(Array.isArray(ar.findings))results=results.concat(ar.findings);
  }
  results=lf_normalizeEditorFindings_(results).slice(0,LF.MAX_EDITOR_RESULTS);
  const now=lf_nowIso_();const run=lf_appendRow_('EDITOR_RUNS',{id:'editor_'+Utilities.getUuid(),userId:auth.user.id,projectId:project.id,editorType:editorType,scopeType:lf_cleanSlug_(data.scopeType||'project'),scopeId:String(data.scopeId||''),provider:provider,status:'complete',summary:lf_limitText_(summary,20000),resultsJson:lf_jsonArrayCell_(results),createdAt:now,updatedAt:now});
  const createdIssues=[];
  if(lf_boolDefault_(data.createIssues,editorType==='continuity'||editorType==='plot'||editorType==='timeline'||editorType==='world'||editorType==='knowledge'||editorType==='causality')){
    results.forEach(function(f){if(f.classification==='line'||f.classification==='copy')return;try{const r=lf_plotIssueSave_(auth,{projectId:project.id,title:f.title,description:f.description,issueType:f.issueType||editorType,severity:f.severity||'medium',status:'open',relatedNodeIds:(f.evidence||[]).map(function(e){return e.sourceId;}).filter(Boolean),evidence:f.evidence||[],suggestion:f.suggestion||'',metadata:{editorRunId:run.id,confidence:f.confidence,classification:f.classification||'editorial',fixPatch:f.fixPatch||null}});createdIssues.push(r.issue);}catch(ignore){}});
  }
  return{ok:true,run:lf_publicEditorRun_(run),results:results,createdIssues:createdIssues};
}

function lf_deterministicEditor_(auth,project,editorType,context){
  const results=[];
  if(editorType==='continuity'||editorType==='plot'||editorType==='timeline'||editorType==='causality'||editorType==='knowledge'){
    const base=lf_plotIssueScan_(auth,{projectId:project.id}).warnings||[];
    base.forEach(function(w){results.push({title:'Review '+String(w.kind||'continuity').replace(/-/g,' '),description:w.message||'Potential continuity issue.',issueType:w.kind||editorType,severity:'medium',confidence:0.55,evidence:w.sourceId?[{sourceId:w.sourceId,quote:w.quote||''}]:[],suggestion:'Review the cited passage against project canon and chronology.',classification:'continuity'});});
  }
  if(editorType==='plot'){
    lf_rows_('PLOT_THREADS').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&r.status==='active';}).forEach(function(t){if(!t.lastTouchedNodeId)results.push({title:'Plot thread has no recorded progression',description:'“'+t.name+'” is active but has no last-touched scene recorded.',issueType:'dangling-thread',severity:t.importance==='high'?'high':'medium',confidence:0.8,evidence:[],suggestion:'Advance, resolve, intentionally defer, or mark this thread as carried forward.',classification:'continuity'});});
  }
  if(editorType==='causality'){
    const links=lf_rows_('CAUSAL_LINKS').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id;});
    links.forEach(function(l){if(lf_bool_(l.required)&&(!l.fromId||!l.toId))results.push({title:'Incomplete causal link',description:'A required causal relationship is missing one endpoint.',issueType:'broken-causality',severity:'high',confidence:0.95,evidence:[],suggestion:'Connect both cause and consequence.',classification:'continuity'});});
  }
  return{summary:results.length?results.length+' deterministic '+editorType+' finding(s) need review.':'No deterministic '+editorType+' problems were found.',results:results};
}

function lf_editorInstruction_(type){
  const map={
    continuity:'Find evidence-backed contradictions in state, possession, location, identity, age, appearance, names, facts, abilities, injuries, deaths, and established canon. Do not treat lies, unreliable narration, myths, rumors, flashbacks, retcons, or deliberate exceptions as errors without evidence.',
    plot:'Evaluate dangling threads, setup/payoff, escalation, prerequisite logic, consequences, promises to the reader, and unresolved story obligations. Separate objective continuity concerns from subjective editorial suggestions.',
    character:'Evaluate motivation, goals, behavior continuity, relationship progression, characterization drift, skill/ability continuity, and whether arc changes have adequate causal support.',
    world:'Check locations, geography, cultures, technology, magic, politics, social rules, terminology, species, and explicit world rules. Respect recorded exceptions.',
    timeline:'Check chronology, durations, ages, travel time, seasons, simultaneous events, flashbacks, and narrative order versus world order.',
    developmental:'Assess structure, pacing, stakes, tension, scene purpose, climax, resolution, theme, and reader experience. Label these as editorial judgments rather than factual contradictions.',
    line:'Suggest clarity, flow, rhythm, redundancy, sentence-level precision, and awkwardness improvements while preserving voice.',
    copy:'Check grammar, punctuation, spelling, usage, capitalization, and mechanical consistency.',
    pov:'Check POV consistency, head hopping, sensory access, interiority, and information unavailable to the current viewpoint character.',
    series:'Check project canon against related projects and shared-universe chronology. Distinguish intentional retcons and alternate continuities.',
    causality:'Check that major effects have causes, prerequisites are satisfied, character choices have motivations, and consequences logically follow established events.',
    'setup-payoff':'Track promises, clues, foreshadowing, objects, abilities, prophecies, mysteries, and setups to their intended payoffs, identifying missing setup or missing payoff.',
    knowledge:'Check what each character knows, believes, falsely believes, remembers, was told, witnessed, inferred, or could not know at each point in the narrative.'
  };return map[type]||map.developmental;
}

function lf_buildEditorContext_(userId,projectId,scopeType,scopeId,maxChars){maxChars=Math.max(10000,Math.min(Number(maxChars||LF.MAX_AI_CONTEXT_CHARS),LF.MAX_AI_CONTEXT_CHARS));let remaining=maxChars;const docs=[];let nodes=lf_rows_('NODES').filter(function(r){return r.userId===userId&&r.projectId===projectId&&!r.deletedAt&&r.nodeType!=='directory';});if(scopeType==='node'||scopeType==='chapter')nodes=nodes.filter(function(r){return r.id===String(scopeId);});nodes.sort(function(a,b){return Number(a.sortOrder||0)-Number(b.sortOrder||0)||String(a.createdAt).localeCompare(String(b.createdAt));});nodes.forEach(function(n){if(remaining<=0)return;let text=String(lf_fullTextPair_(n).plainText||'');if(text.length>remaining)text=text.slice(0,remaining);docs.push({id:n.id,title:n.title,nodeType:n.nodeType,text:text,metadata:lf_parseJson_(n.metadataJson,{})});remaining-=text.length;});return{projectId:projectId,scopeType:scopeType,scopeId:scopeId,documents:docs,truncated:remaining<=0};}
function lf_normalizeEditorFindings_(arr){return (Array.isArray(arr)?arr:[]).map(function(f,i){return{title:lf_cleanText_(f.title||('Finding '+(i+1)),180),description:lf_limitText_(f.description||f.message||'',20000),issueType:lf_cleanSlug_(f.issueType||'editorial'),severity:['low','medium','high','critical'].indexOf(String(f.severity||'').toLowerCase())>=0?String(f.severity).toLowerCase():'medium',confidence:Math.max(0,Math.min(1,Number(Object.prototype.hasOwnProperty.call(f,'confidence')?f.confidence:0.5))),evidence:Array.isArray(f.evidence)?f.evidence.slice(0,20):[],suggestion:lf_limitText_(f.suggestion||'',20000),fixPatch:f.fixPatch||null,classification:lf_cleanSlug_(f.classification||'editorial')};});}
function lf_editorRunsList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('EDITOR_RUNS').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p);});rows.sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});return{ok:true,runs:rows.slice(0,Math.min(Number(data.limit||100),500)).map(lf_publicEditorRun_)};}
function lf_plotIssueAction_(auth,data){
  const row=lf_findOne_('PLOT_ISSUES',function(r){return r.id===String(data.id||data.issueId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('ISSUE_NOT_FOUND','Plot issue was not found.',404);
  const action=lf_cleanSlug_(data.action||'review-later');const allowed=['fixed','ignored','intentional','false-positive','review-later','open','update-canon'];if(allowed.indexOf(action)<0)throw lf_error_('ISSUE_ACTION_INVALID','Unsupported issue action.',400);
  let status=action,resolution=lf_limitText_(data.resolution||row.resolution||'',20000),resolvedAt='';
  if(['fixed','ignored','intentional','false-positive','update-canon'].indexOf(action)>=0)resolvedAt=lf_nowIso_();
  if(action==='update-canon'&&data.fact){lf_storyFactSave_(auth,Object.assign({},data.fact,{projectId:row.projectId}));resolution=resolution||'Project canon was updated explicitly by the author.';}
  const meta=lf_parseJson_(row.metadataJson,{});meta.lastAction=action;meta.lastActionAt=lf_nowIso_();
  const updated=lf_updateRow_('PLOT_ISSUES',row._row,{status:status,resolution:resolution,resolvedAt:resolvedAt,metadataJson:JSON.stringify(meta),updatedAt:lf_nowIso_()});return{ok:true,issue:lf_publicPlotIssue_(updated)};
}

function lf_plotIssueApplyFix_(auth,data){
  const issue=lf_findOne_('PLOT_ISSUES',function(r){return r.id===String(data.id||data.issueId||'')&&r.userId===auth.user.id;});if(!issue)throw lf_error_('ISSUE_NOT_FOUND','Plot issue was not found.',404);
  const patch=data.patch||(lf_parseJson_(issue.metadataJson,{}).fixPatch||null);if(!patch)throw lf_error_('FIX_PATCH_REQUIRED','No explicit fix patch is available. Provide a patch after reviewing the issue.',400);
  if(patch.targetType!=='node')throw lf_error_('FIX_TARGET_UNSUPPORTED','Automatic fix application currently supports node text only.',400);
  const node=lf_findOne_('NODES',function(r){return r.id===String(patch.targetId||'')&&r.userId===auth.user.id&&r.projectId===issue.projectId&&!r.deletedAt;});if(!node)throw lf_error_('NODE_NOT_FOUND','Fix target node was not found.',404);
  lf_snapshotTarget_(auth.user.id,issue.projectId,'node',node.id,'Before issue fix '+issue.id,node,'plotissues.applyfix');
  const currentPair=lf_fullTextPair_(node);let content=String(currentPair.content||''),plain=String(currentPair.plainText||lf_plainText_(content));
  if(Object.prototype.hasOwnProperty.call(patch,'expectedText')&&plain.indexOf(String(patch.expectedText))<0)throw lf_error_('FIX_STALE','The passage changed since this fix was proposed. Review the issue again.',409);
  if(patch.mode==='replace-text'){
    const oldText=String(patch.expectedText||patch.oldText||''),newText=String(patch.newText||'');if(!oldText)throw lf_error_('FIX_TEXT_REQUIRED','replace-text patch needs expectedText.',400);plain=plain.replace(oldText,newText);content=lf_escapeHtml_(plain).replace(/\n/g,'<br>');
  }else if(patch.mode==='replace-content'){
    content=lf_limitText_(patch.content||'',LF.MAX_TEXT_CHARS);plain=lf_plainText_(content);
  }else throw lf_error_('FIX_MODE_INVALID','Unsupported fix mode.',400);
  const updated=lf_nodeSave_(auth,{id:node.id,projectId:node.projectId,parentId:node.parentId,nodeType:node.nodeType,title:node.title,content:content,plainText:plain}).node;
  lf_plotIssueAction_(auth,{id:issue.id,action:'fixed',resolution:data.resolution||'Author explicitly applied the reviewed fix patch.'});
  return{ok:true,node:updated,issue:lf_publicPlotIssue_(lf_findOne_('PLOT_ISSUES',function(r){return r.id===issue.id;}))};
}

/* ========================================================================== */
/* DOCUMENT CONSOLIDATION / MASS UPDATE / REVISION SNAPSHOTS                   */
/* ========================================================================== */

function lf_consolidationPlan_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),ids=(data.fileIndexIds||data.inputIds||[]).map(String);if(ids.length<2)throw lf_error_('CONSOLIDATION_INPUTS_REQUIRED','Choose at least two indexed files to consolidate.',400);const files=lf_rows_('FILE_INDEX').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&ids.indexOf(r.id)>=0;});if(files.length<2)throw lf_error_('CONSOLIDATION_INPUTS_MISSING','Two or more selected files were not found.',404);
  const duplicates={},items=files.map(function(r){duplicates[r.sourceHash]=(duplicates[r.sourceHash]||0)+1;const text=lf_fileIndexFullText_(r);return{id:r.id,name:r.name,category:r.category,logicalType:r.logicalType,sourceHash:r.sourceHash,text:text,characters:text.length};});let plan={strategy:'author-reviewed-merge',baseFileId:items.slice().sort(function(a,b){return b.characters-a.characters;})[0].id,identicalGroups:Object.keys(duplicates).filter(function(h){return duplicates[h]>1;}).map(function(h){return items.filter(function(x){return x.sourceHash===h;}).map(function(x){return x.id;});}),inputs:items.map(function(x){return{id:x.id,name:x.name,characters:x.characters};}),conflicts:[],proposedMutations:[],notes:['No source file will be changed until consolidation.apply is explicitly called.']};
  if(lf_boolDefault_(data.useAi,true)&&lf_aiConfigured_()){const ai=lf_aiInvoke_(auth,'consolidation',project.id,{instruction:'Compare all versions, preserve unique information, identify contradictions instead of silently deciding authorial intent, choose a base, produce a merged document proposal, and return a mass-update plan for related structured project data. Do not delete source material.',files:items,requiredSchema:{baseFileId:'string',mergedTitle:'string',mergedText:'string',conflicts:'array',proposedMutations:'array',notes:'array'}},false);plan=lf_deepMerge_(plan,ai.result||{});}
  const now=lf_nowIso_(),jobId='merge_'+Utilities.getUuid(),storedPlan=lf_storeJsonPayload_(auth,project,plan,'merge-plan-'+jobId+'.json','', 'data'),job=lf_appendRow_('MERGE_JOBS',{id:jobId,userId:auth.user.id,projectId:project.id,name:lf_cleanText_(data.name||'Project consolidation',180),status:'planned',inputImportIdsJson:JSON.stringify(ids),planJson:storedPlan.cellJson,planDriveFileId:storedPlan.fileId,resultJson:'',resultDriveFileId:'',snapshotId:'',createdAt:now,updatedAt:now});return{ok:true,job:lf_publicMergeJob_(job),plan:plan};
}
function lf_consolidationApply_(auth,data){const job=lf_findOne_('MERGE_JOBS',function(r){return r.id===String(data.jobId||data.id||'')&&r.userId===auth.user.id;});if(!job)throw lf_error_('MERGE_JOB_NOT_FOUND','Consolidation job was not found.',404);const project=lf_requireOwnedProject_(auth,job.projectId),plan=lf_readJsonPayload_(job.planJson,job.planDriveFileId,{}),mergedText=String(data.mergedText||plan.mergedText||'');if(!mergedText)throw lf_error_('MERGED_TEXT_REQUIRED','Review the consolidation plan and provide or approve mergedText before applying.',400);const snapshot=lf_snapshotProject_(auth.user.id,project.id,'Before consolidation '+job.id,'consolidation.apply'),parent=lf_findDirectoryByCategory_(auth.user.id,project.id,'manuscript'),node=lf_nodeSave_(auth,{projectId:project.id,parentId:parent?parent.id:'',nodeType:'document',title:lf_cleanText_(data.title||plan.mergedTitle||project.title+' Consolidated Master',180),content:lf_escapeHtml_(mergedText).replace(/\n/g,'<br>'),plainText:mergedText,metadata:{consolidated:true,mergeJobId:job.id,sourceFileIndexIds:lf_parseJson_(job.inputImportIdsJson,[])},tags:['consolidated','master']}).node;let bulkResult={ok:true,applied:0,skipped:0,errors:[]};const muts=Array.isArray(data.mutations)?data.mutations:(Array.isArray(plan.proposedMutations)?plan.proposedMutations:[]);if(lf_bool_(data.applyMassUpdates)&&muts.length)bulkResult=lf_bulkApply_(auth,{projectId:project.id,mutations:muts,reason:'Consolidation '+job.id,skipSnapshot:true});const result={masterNodeId:node.id,bulk:bulkResult,sourceFilesPreserved:true},storedResult=lf_storeJsonPayload_(auth,project,result,'merge-result-'+job.id+'.json',job.resultDriveFileId||'','data'),updated=lf_updateRow_('MERGE_JOBS',job._row,{status:'applied',resultJson:storedResult.cellJson,resultDriveFileId:storedResult.fileId,snapshotId:snapshot.id,updatedAt:lf_nowIso_()});return{ok:true,job:lf_publicMergeJob_(updated),result:result,node:node};}
function lf_bulkApply_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),muts=Array.isArray(data.mutations)?data.mutations:[];if(!muts.length)throw lf_error_('MUTATIONS_REQUIRED','mutations[] is required.',400);if(muts.length>LF.MAX_BATCH_MUTATIONS)throw lf_error_('TOO_MANY_MUTATIONS','Too many changes in one batch.',413);
  let snapshot=null;if(!lf_bool_(data.skipSnapshot))snapshot=lf_snapshotProject_(auth.user.id,project.id,data.reason||'Before bulk update','bulk.apply');
  const errors=[];let applied=0,skipped=0;
  muts.forEach(function(m,i){try{const type=lf_cleanSlug_(m.type||'');if(type==='node-update'){const r=lf_findOne_('NODES',function(x){return x.id===String(m.id||'')&&x.userId===auth.user.id&&x.projectId===project.id&&!x.deletedAt;});if(!r){skipped++;return;}const saveData={id:r.id,projectId:project.id,parentId:r.parentId,nodeType:r.nodeType};if(Object.prototype.hasOwnProperty.call(m,'title'))saveData.title=m.title;if(Object.prototype.hasOwnProperty.call(m,'content'))saveData.content=m.content;if(Object.prototype.hasOwnProperty.call(m,'plainText'))saveData.plainText=m.plainText;if(Object.prototype.hasOwnProperty.call(m,'metadata'))saveData.metadata=m.metadata||{};lf_nodeSave_(auth,saveData);applied++;}
      else if(type==='entity-update'){lf_entitySave_(auth,Object.assign({},m.data||m,{projectId:project.id,id:m.id}));applied++;}
      else if(type==='fact-save'){lf_storyFactSave_(auth,Object.assign({},m.data||m,{projectId:project.id}));applied++;}
      else if(type==='timeline-save'){lf_timelineSave_(auth,Object.assign({},m.data||m,{projectId:project.id}));applied++;}
      else if(type==='thread-save'){lf_plotThreadSave_(auth,Object.assign({},m.data||m,{projectId:project.id}));applied++;}
      else if(type==='world-rule-save'){lf_worldRuleSave_(auth,Object.assign({},m.data||m,{projectId:project.id}));applied++;}
      else{skipped++;}}
    catch(err){errors.push({index:i,code:err.code||'MUTATION_FAILED',message:err.publicMessage||err.message});}});
  lf_activity_(auth.user.id,'bulk.apply','project',project.id,project.id,{applied:applied,skipped:skipped,errors:errors.length,snapshotId:snapshot?snapshot.id:''});return{ok:true,applied:applied,skipped:skipped,errors:errors,snapshot:snapshot?lf_publicRevisionSnapshot_(snapshot):null};
}

function lf_snapshotTarget_(userId,projectId,targetType,targetId,label,data,sourceAction){const user=lf_findOne_('USERS',function(r){return r.id===userId;}),project=lf_findOne_('PROJECTS',function(r){return r.id===projectId&&r.userId===userId;}),auth={user:user},id='snapshot_'+Utilities.getUuid();let payload=data||{};if((targetType==='node'||targetType==='note')&&payload&&payload.contentStorageJson){payload=lf_parseJson_(JSON.stringify(payload),{});const pair=lf_fullTextPair_(data);payload.content=pair.content;payload.plainText=pair.plainText;}const stored=lf_storeJsonPayload_(auth,project,payload,'snapshot-'+id+'.json','', 'revisions');return lf_appendRow_('REVISION_SNAPSHOTS',{id:id,userId:userId,projectId:projectId,targetType:targetType,targetId:targetId,label:lf_cleanText_(label,200),contentJson:stored.cellJson,contentDriveFileId:stored.fileId,sourceAction:sourceAction||'',createdAt:lf_nowIso_()});}
function lf_snapshotProject_(userId,projectId,label,sourceAction){return lf_snapshotTarget_(userId,projectId,'project',projectId,label,lf_buildProjectExport_(userId,projectId),sourceAction);}
function lf_languageGenerate_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId);if(!lf_aiConfigured_())throw lf_error_('AI_NOT_CONFIGURED','Fantasy-language generation requires the configured AI service.',503);
  const ai=lf_aiInvoke_(auth,'language-generate',project.id,{instruction:'Create a coherent constructed language package suitable for fiction or game worldbuilding. Return phonology, phonotactics, orthography, morphology, syntax, grammar rules, number system, pronouns, derivation rules, naming rules, sample sentences, cultural notes, and a lexicon. Keep every generated rule internally consistent.',name:data.name||'Unnamed Language',goals:data.goals||{},inspirationConstraints:data.inspirationConstraints||[],lexiconSize:Math.max(10,Math.min(Number(data.lexiconSize||250),2000)),requiredSchema:{name:'string',description:'string',phonology:'object',grammar:'object',orthography:'object',settings:'object',lexicon:'array'}},false);
  const result=ai.result||{};let language=null,entries=[];
  if(lf_boolDefault_(data.save,true)){
    language=lf_languageSave_(auth,{projectId:project.id,name:result.name||data.name||'Unnamed Language',description:result.description||'',phonology:result.phonology||{},grammar:result.grammar||{},orthography:result.orthography||{},settings:result.settings||{}}).language;
    (result.lexicon||[]).slice(0,2000).forEach(function(w){try{entries.push(lf_lexiconSave_(auth,Object.assign({},w,{languageId:language.id})).entry);}catch(ignore){}});
  }
  return{ok:true,generated:result,language:language,entriesSaved:entries.length};
}

function lf_languageDictionaryExport_(auth,data){
  const lang=lf_findOne_('LANGUAGES',function(r){return r.id===String(data.languageId||data.id||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!lang)throw lf_error_('LANGUAGE_NOT_FOUND','Language was not found.',404);
  const words=lf_rows_('LEXICON').filter(function(r){return r.userId===auth.user.id&&r.languageId===lang.id&&!r.deletedAt;}).sort(function(a,b){return String(a.normalizedWord).localeCompare(String(b.normalizedWord));});
  const format=lf_cleanSlug_(data.format||'txt');let content='',mime='text/plain',ext='txt';
  if(format==='json'){content=JSON.stringify({language:lf_publicLanguage_(lang),lexicon:words.map(lf_publicLexicon_)},null,2);mime='application/json';ext='json';}
  else{content=lang.name+' Dictionary\n\n'+words.map(function(w){return w.word+(w.pronunciation?' ['+w.pronunciation+']':'')+(w.partOfSpeech?' — '+w.partOfSpeech:'')+'\n'+w.definition+(w.etymology?'\nEtymology: '+w.etymology:'')+(w.notes?'\nNotes: '+w.notes:'');}).join('\n\n');}
  const project=lf_requireOwnedProject_(auth,lang.projectId),blob=Utilities.newBlob(content,mime,lf_safeFilename_(lang.name+' Dictionary.'+ext)),stored=lf_storeBlobForUser_(auth,project,blob,{category:'language',storageTarget:data.storageTarget,mirrorToLinkedDrive:data.mirrorToLinkedDrive});
  return{ok:true,name:blob.getName(),storage:stored};
}

/* ========================================================================== */
/* BOOK BUILDER / CHAPTER FORMATTING / HTML BOOK EXPORT                        */
/* ========================================================================== */

function lf_bookSave_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),id=String(data.id||data.bookId||'');let row=id?lf_findOne_('BOOKS',function(r){return r.id===id&&r.userId===auth.user.id;}):null;const now=lf_nowIso_(),patch={userId:auth.user.id,projectId:project.id,title:lf_cleanText_(data.title||project.title||'Untitled Book',220),subtitle:lf_cleanText_(data.subtitle||'',220),authorName:lf_cleanText_(data.authorName||auth.user.displayName||'',160),bookType:lf_cleanSlug_(data.bookType||'book'),seriesName:lf_cleanText_(data.seriesName||'',180),seriesNumber:lf_cleanText_(data.seriesNumber||'',40),language:lf_cleanText_(data.language||'en',80),isbn:lf_cleanText_(data.isbn||'',40),description:lf_limitText_(data.description||'',10000),metadataJson:JSON.stringify(data.metadata||{}),updatedAt:now,deletedAt:''};if(row)row=lf_updateRow_('BOOKS',row._row,patch);else{patch.id='book_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('BOOKS',patch);}return{ok:true,book:lf_publicBook_(row)};
}
function lf_bookGet_(auth,data){const row=lf_findOne_('BOOKS',function(r){return r.id===String(data.id||data.bookId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!row)throw lf_error_('BOOK_NOT_FOUND','Book was not found.',404);return{ok:true,book:lf_publicBook_(row),editions:lf_bookEditionsList_(auth,{bookId:row.id}).editions,chapters:lf_bookChaptersList_(auth,{bookId:row.id}).chapters};}
function lf_booksList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('BOOKS').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!p||r.projectId===p);});return{ok:true,books:rows.map(lf_publicBook_)};}
function lf_bookDelete_(auth,data){const row=lf_findOne_('BOOKS',function(r){return r.id===String(data.id||data.bookId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('BOOK_NOT_FOUND','Book was not found.',404);lf_updateRow_('BOOKS',row._row,{deletedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});return{ok:true};}

function lf_bookEditionSave_(auth,data){
  const book=lf_findOne_('BOOKS',function(r){return r.id===String(data.bookId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!book)throw lf_error_('BOOK_NOT_FOUND','Book was not found.',404);const id=String(data.id||data.editionId||'');let row=id?lf_findOne_('BOOK_EDITIONS',function(r){return r.id===id&&r.userId===auth.user.id;}):null;
  let width=Number(data.trimWidthIn||0),height=Number(data.trimHeightIn||0);if(data.trimId){const found=lf_findBookFormat_(data.binding||'paperback',data.trimId);if(found){width=found.widthIn;height=found.heightIn;}}
  if(!(width>0&&height>0))throw lf_error_('TRIM_SIZE_REQUIRED','A valid trim size is required.',400);const now=lf_nowIso_(),patch={userId:auth.user.id,projectId:book.projectId,bookId:book.id,name:lf_cleanText_(data.name||'Default Edition',160),binding:lf_cleanSlug_(data.binding||'paperback'),trimWidthIn:width,trimHeightIn:height,orientation:width>height?'landscape':'portrait',bleedIn:Number(Object.prototype.hasOwnProperty.call(data,'bleedIn')?data.bleedIn:0.125),gutterIn:Number(data.gutterIn||0),marginsJson:JSON.stringify(data.margins||{top:0.75,bottom:0.75,inside:0.85,outside:0.65}),typographyJson:JSON.stringify(data.typography||{}),pageStyleJson:JSON.stringify(data.pageStyle||{color:'#fffdf8',texture:'paper',pageFlipSound:true}),frontMatterJson:JSON.stringify(data.frontMatter||{}),backMatterJson:JSON.stringify(data.backMatter||{}),settingsJson:JSON.stringify(data.settings||{}),updatedAt:now,deletedAt:''};if(row)row=lf_updateRow_('BOOK_EDITIONS',row._row,patch);else{patch.id='edition_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('BOOK_EDITIONS',patch);}return{ok:true,edition:lf_publicBookEdition_(row)};
}
function lf_bookEditionsList_(auth,data){const p=data.bookId?'':lf_scopeProjectId_(auth,data);let rows=lf_rows_('BOOK_EDITIONS').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!data.bookId||r.bookId===String(data.bookId))&&(!p||r.projectId===p);});return{ok:true,editions:rows.map(lf_publicBookEdition_)};}
function lf_bookEditionDelete_(auth,data){const row=lf_findOne_('BOOK_EDITIONS',function(r){return r.id===String(data.id||data.editionId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('EDITION_NOT_FOUND','Book edition was not found.',404);lf_updateRow_('BOOK_EDITIONS',row._row,{deletedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});return{ok:true};}
function lf_findBookFormat_(binding,id){const arr=LF.BOOK_FORMATS[lf_cleanSlug_(binding)]||[];for(let i=0;i<arr.length;i++)if(arr[i].id===String(id))return arr[i];return null;}

function lf_bookChapterSave_(auth,data){const book=lf_findOne_('BOOKS',function(r){return r.id===String(data.bookId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!book)throw lf_error_('BOOK_NOT_FOUND','Book was not found.',404);let node=null;if(data.nodeId)node=lf_findOne_('NODES',function(r){return r.id===String(data.nodeId)&&r.userId===auth.user.id&&r.projectId===book.projectId&&!r.deletedAt;});if(!node){const parent=lf_findDirectoryByCategory_(auth.user.id,book.projectId,'manuscript'),saved=lf_nodeSave_(auth,{projectId:book.projectId,parentId:parent?parent.id:'',nodeType:'chapter',title:data.title||'Chapter',content:data.content||'',plainText:data.plainText||lf_plainText_(data.content||''),metadata:{bookId:book.id}});node=lf_findOne_('NODES',function(r){return r.id===saved.node.id&&r.userId===auth.user.id;});}else if(Object.prototype.hasOwnProperty.call(data,'content')||Object.prototype.hasOwnProperty.call(data,'plainText')||Object.prototype.hasOwnProperty.call(data,'title')){const currentPair=lf_fullTextPair_(node),saved=lf_nodeSave_(auth,{id:node.id,projectId:book.projectId,parentId:node.parentId,nodeType:'chapter',title:Object.prototype.hasOwnProperty.call(data,'title')?data.title:node.title,content:Object.prototype.hasOwnProperty.call(data,'content')?data.content:currentPair.content,plainText:Object.prototype.hasOwnProperty.call(data,'plainText')?data.plainText:currentPair.plainText,metadata:lf_deepMerge_(lf_parseJson_(node.metadataJson,{}),{bookId:book.id})});node=lf_findOne_('NODES',function(r){return r.id===saved.node.id&&r.userId===auth.user.id;});}if(!node)throw lf_error_('NODE_NOT_FOUND','The chapter document could not be created or updated.',500);const id=String(data.id||data.chapterId||''),now=lf_nowIso_();let row=id?lf_findOne_('BOOK_CHAPTERS',function(r){return r.id===id&&r.userId===auth.user.id;}):lf_findOne_('BOOK_CHAPTERS',function(r){return r.bookId===book.id&&r.nodeId===node.id&&r.userId===auth.user.id&&!r.deletedAt;});const chapterPair=lf_fullTextPair_(node),plain=chapterPair.plainText||lf_plainText_(chapterPair.content),oldFormat=row?lf_parseJson_(row.formatJson,{}):{},oldMeta=row?lf_parseJson_(row.metadataJson,{}):{},patch={userId:auth.user.id,projectId:book.projectId,bookId:book.id,nodeId:node.id,chapterNumber:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'chapterNumber')?data.chapterNumber:(row?row.chapterNumber:''),40),title:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'title')?data.title:(row?row.title:node.title)||'Chapter',200),subtitle:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'subtitle')?data.subtitle:(row?row.subtitle:''),200),sortOrder:Number(Object.prototype.hasOwnProperty.call(data,'sortOrder')?data.sortOrder:(row?row.sortOrder:0)),povEntityId:String(Object.prototype.hasOwnProperty.call(data,'povEntityId')?data.povEntityId:(row?row.povEntityId:'')),status:lf_cleanSlug_(Object.prototype.hasOwnProperty.call(data,'status')?data.status:(row?row.status:'draft')),wordCount:lf_wordCount_(plain),formatJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'format')?lf_deepMerge_(oldFormat,data.format||{}):oldFormat),metadataJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'metadata')?lf_deepMerge_(oldMeta,data.metadata||{}):oldMeta),updatedAt:now,deletedAt:''};if(row)row=lf_updateRow_('BOOK_CHAPTERS',row._row,patch);else{patch.id='chapter_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('BOOK_CHAPTERS',patch);}return{ok:true,chapter:lf_publicBookChapter_(row),node:lf_publicNode_(node)};}
function lf_bookChaptersList_(auth,data){const p=data.bookId?'':lf_scopeProjectId_(auth,data);let rows=lf_rows_('BOOK_CHAPTERS').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!data.bookId||r.bookId===String(data.bookId))&&(!p||r.projectId===p);});rows.sort(function(a,b){return Number(a.sortOrder||0)-Number(b.sortOrder||0)||String(a.createdAt).localeCompare(String(b.createdAt));});return{ok:true,chapters:rows.map(lf_publicBookChapter_)};}
function lf_bookChapterFormat_(auth,data){const row=lf_findOne_('BOOK_CHAPTERS',function(r){return r.id===String(data.id||data.chapterId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!row)throw lf_error_('CHAPTER_NOT_FOUND','Book chapter was not found.',404);const current=lf_parseJson_(row.formatJson,{}),merged=lf_deepMerge_(current,data.format||{});const updated=lf_updateRow_('BOOK_CHAPTERS',row._row,{formatJson:JSON.stringify(merged),updatedAt:lf_nowIso_()});return{ok:true,chapter:lf_publicBookChapter_(updated)};}
function lf_wordCount_(s){const m=String(s||'').trim().match(/\S+/g);return m?m.length:0;}

function lf_bookCoverSpec_(auth,data){
  let trimW=Number(data.trimWidthIn||0),trimH=Number(data.trimHeightIn||0),binding=lf_cleanSlug_(data.binding||'paperback');if(data.editionId){const e=lf_findOne_('BOOK_EDITIONS',function(r){return r.id===String(data.editionId)&&r.userId===auth.user.id&&!r.deletedAt;});if(!e)throw lf_error_('EDITION_NOT_FOUND','Book edition was not found.',404);trimW=Number(e.trimWidthIn);trimH=Number(e.trimHeightIn);binding=e.binding;}
  if(!(trimW>0&&trimH>0))throw lf_error_('TRIM_SIZE_REQUIRED','Trim width and height are required.',400);const pages=Math.max(0,Number(data.pageCount||0)),bleed=Math.max(0,Number(Object.prototype.hasOwnProperty.call(data,'bleedIn')?data.bleedIn:0.125)),paper=Number(data.paperThicknessIn||0.002252),spine=Math.max(0,Number(data.spineWidthIn||pages*paper)),joint=binding==='hardcover'?Math.max(0,Number(data.hingeIn||0.375)):0;
  const totalW=trimW*2+spine+bleed*2+joint*2,totalH=trimH+bleed*2,dpi=Math.max(72,Number(data.dpi||300));return{ok:true,spec:{binding:binding,trimWidthIn:trimW,trimHeightIn:trimH,pageCount:pages,bleedIn:bleed,spineWidthIn:spine,hingeIn:joint,totalWidthIn:totalW,totalHeightIn:totalH,pixelWidth:Math.round(totalW*dpi),pixelHeight:Math.round(totalH*dpi),dpi:dpi,panels:{back:{xIn:bleed+joint,widthIn:trimW},spine:{xIn:bleed+joint+trimW,widthIn:spine},front:{xIn:bleed+joint+trimW+spine,widthIn:trimW}}}};
}

function lf_bookExportHtml_(auth,data){
  const book=lf_findOne_('BOOKS',function(r){return r.id===String(data.bookId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!book)throw lf_error_('BOOK_NOT_FOUND','Book was not found.',404);const edition=data.editionId?lf_findOne_('BOOK_EDITIONS',function(r){return r.id===String(data.editionId)&&r.userId===auth.user.id&&!r.deletedAt;}):lf_rows_('BOOK_EDITIONS').filter(function(r){return r.bookId===book.id&&r.userId===auth.user.id&&!r.deletedAt;})[0],chapters=lf_rows_('BOOK_CHAPTERS').filter(function(r){return r.bookId===book.id&&r.userId===auth.user.id&&!r.deletedAt;}).sort(function(a,b){return Number(a.sortOrder||0)-Number(b.sortOrder||0);});if(!chapters.length)throw lf_error_('BOOK_HAS_NO_CHAPTERS','Add chapters before exporting an HTML book.',409);
  const blobs=[],chapterData=[],manifest={schema:'literaryfriend.html-book.v2',generatedAt:lf_nowIso_(),book:lf_publicBook_(book),edition:edition?lf_publicBookEdition_(edition):null,chapters:[]};chapters.forEach(function(ch,i){const node=lf_findOne_('NODES',function(r){return r.id===ch.nodeId&&r.userId===auth.user.id&&!r.deletedAt;}),pair=node?lf_fullTextPair_(node):{content:'',plainText:''},obj={id:ch.id,number:ch.chapterNumber||String(i+1),title:ch.title,subtitle:ch.subtitle||'',html:pair.content,plainText:pair.plainText,format:lf_parseJson_(ch.formatJson,{})},file='chapters/chapter-'+String(i+1).padStart(3,'0')+'.json';chapterData.push(obj);manifest.chapters.push({file:file,title:ch.title,number:obj.number,index:i});blobs.push(Utilities.newBlob(JSON.stringify(obj,null,2),'application/json',file));});const pageStyle=edition?lf_parseJson_(edition.pageStyleJson,{}):{color:'#fffdf8',texture:'paper',pageFlipSound:true};blobs.push(Utilities.newBlob(JSON.stringify(manifest,null,2),'application/json','manifest.json'));blobs.push(Utilities.newBlob('window.LITERARYFRIEND_BOOK_MANIFEST='+JSON.stringify(manifest)+';window.LITERARYFRIEND_CHAPTERS='+JSON.stringify(chapterData)+';','application/javascript','chapters/chapter-data.js'));blobs.push(Utilities.newBlob(lf_htmlBookIndex_(book),'text/html','index.html'));blobs.push(Utilities.newBlob(lf_htmlBookCss_(pageStyle,edition),'text/css','css/book.css'));blobs.push(Utilities.newBlob(lf_htmlBookJs_(!!pageStyle.pageFlipSound),'application/javascript','js/book.js'));const zip=Utilities.zip(blobs,lf_safeFilename_(book.title+' — HTML Book.zip')),project=lf_requireOwnedProject_(auth,book.projectId),stored=lf_storeBlobForUser_(auth,project,zip,{category:'book-build',storageTarget:data.storageTarget,mirrorToLinkedDrive:data.mirrorToLinkedDrive}),now=lf_nowIso_(),exp=lf_appendRow_('EXPORTS',{id:'export_'+Utilities.getUuid(),userId:auth.user.id,projectId:book.projectId,exportType:'html-book-v2',name:zip.getName(),driveFileId:stored.internalDriveFileId||'',status:'complete',metadataJson:JSON.stringify({bookId:book.id,editionId:edition?edition.id:'',storage:stored.storage,chapterJson:true,localFileSafe:true,pageFlipSound:!!pageStyle.pageFlipSound}),createdAt:now,updatedAt:now});return{ok:true,export:lf_publicExport_(exp),storage:stored,manifest:manifest};
}
function lf_htmlBookIndex_(book){return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+lf_escapeHtml_(book.title)+'</title><link rel="stylesheet" href="css/book.css"></head><body><main id="book"><section class="cover"><h1>'+lf_escapeHtml_(book.title)+'</h1>'+(book.subtitle?'<h2>'+lf_escapeHtml_(book.subtitle)+'</h2>':'')+'<p>'+lf_escapeHtml_(book.authorName||'')+'</p><button id="openBook">Open book</button></section><section class="reader" hidden><header><button id="prevPage">Previous</button><strong id="chapterTitle"></strong><button id="nextPage">Next</button></header><article id="page"></article></section></main><script src="chapters/chapter-data.js"></script><script src="js/book.js"></script></body></html>';}
function lf_htmlBookCss_(style,edition){const color=String(style.color||'#fffdf8').replace(/[^#a-zA-Z0-9(),.%\s-]/g,''),texture=lf_cleanSlug_(style.texture||'paper');const pattern=texture==='parchment'?'radial-gradient(circle at 20% 20%,rgba(120,80,30,.08),transparent 30%),linear-gradient(#f3e6c8,#ead7ad)':texture==='linen'?'repeating-linear-gradient(0deg,rgba(0,0,0,.025) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(0,0,0,.02) 0 1px,transparent 1px 4px)':texture==='speckle'?'radial-gradient(rgba(0,0,0,.05) .6px,transparent .7px)':'linear-gradient(rgba(255,255,255,.4),rgba(0,0,0,.015))';return ':root{--page:'+color+'}*{box-sizing:border-box}body{margin:0;background:#2b2926;color:#1e1a17;font-family:Georgia,serif}.cover,.reader{max-width:900px;margin:3vh auto;background:var(--page);background-image:'+pattern+';min-height:92vh;padding:8vw;box-shadow:0 10px 50px #0008}.cover{text-align:center;display:grid;place-content:center}.cover h1{font-size:clamp(2rem,7vw,5rem)}button{font:inherit;padding:.65rem 1rem}.reader header{display:flex;justify-content:space-between;align-items:center;gap:1rem;border-bottom:1px solid #0002;padding-bottom:1rem}.reader article{font-size:1.12rem;line-height:1.65;padding:4vh 0;white-space:normal}.reader article p{text-indent:1.25em;margin:.2em 0}.reader article h1,.reader article h2{text-align:center;margin:2.5em 0 1.5em}@media(max-width:700px){.cover,.reader{margin:0;min-height:100vh;padding:8vw;box-shadow:none}}';}
function lf_htmlBookJs_(sound){return '(function(){let manifest=window.LITERARYFRIEND_BOOK_MANIFEST||null,chapters=window.LITERARYFRIEND_CHAPTERS||[],idx=0;const q=s=>document.querySelector(s),reader=q(".reader"),cover=q(".cover"),page=q("#page"),title=q("#chapterTitle");function flip(){'+(sound?'try{const A=window.AudioContext||window.webkitAudioContext,a=new A(),b=a.createBuffer(1,Math.floor(a.sampleRate*.12),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)*.12;const s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start();}catch(e){}':'')+'}async function chapter(){if(chapters[idx])return chapters[idx];const c=manifest.chapters[idx],r=await fetch(c.file);return r.json()}async function load(){const j=await chapter();title.textContent=(j.number?"Chapter "+j.number+": ":"")+j.title;page.innerHTML=j.html||("<p>"+(j.plainText||"").replace(/\\n\\n+/g,"</p><p>").replace(/\\n/g,"<br>")+"</p>");flip();q("#prevPage").disabled=idx===0;q("#nextPage").disabled=idx===manifest.chapters.length-1}q("#openBook").onclick=async()=>{if(!manifest)manifest=await (await fetch("manifest.json")).json();cover.hidden=true;reader.hidden=false;idx=0;load()};q("#prevPage").onclick=()=>{if(idx>0){idx--;load()}};q("#nextPage").onclick=()=>{if(idx<manifest.chapters.length-1){idx++;load()}}})();';}
function lf_artProjectSave_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId),id=String(data.id||data.artProjectId||'');let row=id?lf_findOne_('ART_PROJECTS',function(r){return r.id===id&&r.userId===auth.user.id;}):null;const previous=row?lf_artState_(row):{canvas:{},layers:[],palette:{},toolSettings:{},background:{}},state={canvas:Object.prototype.hasOwnProperty.call(data,'canvas')?(data.canvas||{}):previous.canvas,layers:Object.prototype.hasOwnProperty.call(data,'layers')?(Array.isArray(data.layers)?data.layers:[]):previous.layers,palette:Object.prototype.hasOwnProperty.call(data,'palette')?(data.palette||{}):previous.palette,toolSettings:Object.prototype.hasOwnProperty.call(data,'toolSettings')?(data.toolSettings||{}):previous.toolSettings,background:Object.prototype.hasOwnProperty.call(data,'background')?(data.background||{}):previous.background},stateJson=JSON.stringify(state),external=stateJson.length>LF.SHEET_SAFE_CHARS,now=lf_nowIso_();let stateDriveFileId=row&&row.stateDriveFileId||'';if(external){const stored=lf_storeJsonPayload_(auth,project,state,'art-state-'+(id||'new')+'.json',stateDriveFileId,'art');stateDriveFileId=stored.fileId;}else if(stateDriveFileId){try{DriveApp.getFileById(stateDriveFileId).setTrashed(true);}catch(ignore){}stateDriveFileId='';}
  const patch={userId:auth.user.id,projectId:project.id,bookId:String(Object.prototype.hasOwnProperty.call(data,'bookId')?data.bookId:(row&&row.bookId)||''),name:lf_cleanText_(Object.prototype.hasOwnProperty.call(data,'name')?data.name:(row&&row.name)||'Cover Art',180),width:Number(Object.prototype.hasOwnProperty.call(data,'width')?data.width:(row&&row.width)||1800),height:Number(Object.prototype.hasOwnProperty.call(data,'height')?data.height:(row&&row.height)||2700),dpi:Number(Object.prototype.hasOwnProperty.call(data,'dpi')?data.dpi:(row&&row.dpi)||300),canvasJson:external?'{}':JSON.stringify(state.canvas),layersJson:external?'[]':JSON.stringify(state.layers),paletteJson:external?'{}':JSON.stringify(state.palette),toolSettingsJson:external?'{}':JSON.stringify(state.toolSettings),backgroundJson:external?'{}':JSON.stringify(state.background),metadataJson:JSON.stringify(Object.prototype.hasOwnProperty.call(data,'metadata')?data.metadata:(row?lf_parseJson_(row.metadataJson,{}):{})),stateDriveFileId:stateDriveFileId,updatedAt:now,deletedAt:''};if(row)row=lf_updateRow_('ART_PROJECTS',row._row,patch);else{patch.id='art_'+Utilities.getUuid();patch.createdAt=now;row=lf_appendRow_('ART_PROJECTS',patch);}return{ok:true,art:lf_publicArtProject_(row)};
}
function lf_artProjectGet_(auth,data){const row=lf_findOne_('ART_PROJECTS',function(r){return r.id===String(data.id||data.artProjectId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!row)throw lf_error_('ART_PROJECT_NOT_FOUND','Art project was not found.',404);return{ok:true,art:lf_publicArtProject_(row),assets:lf_attachmentsList_(auth,{projectId:row.projectId,ownerType:'art',ownerId:row.id}).attachments};}
function lf_artProjectsList_(auth,data){const p=data.bookId?'':lf_scopeProjectId_(auth,data);return{ok:true,projects:lf_rows_('ART_PROJECTS').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!p||r.projectId===p)&&(!data.bookId||r.bookId===String(data.bookId));}).map(lf_publicArtProject_) };}
function lf_artProjectDelete_(auth,data){const row=lf_findOne_('ART_PROJECTS',function(r){return r.id===String(data.id||data.artProjectId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('ART_PROJECT_NOT_FOUND','Art project was not found.',404);lf_updateRow_('ART_PROJECTS',row._row,{deletedAt:lf_nowIso_(),updatedAt:lf_nowIso_()});return{ok:true};}
function lf_artAssetUpload_(auth,data){const art=lf_findOne_('ART_PROJECTS',function(r){return r.id===String(data.artProjectId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!art)throw lf_error_('ART_PROJECT_NOT_FOUND','Art project was not found.',404);return lf_attachmentUpload_(auth,Object.assign({},data,{projectId:art.projectId,ownerType:'art',ownerId:art.id,category:'art'}));}
function lf_artAiGenerate_(auth,data){
  const art=lf_findOne_('ART_PROJECTS',function(r){return r.id===String(data.artProjectId||'')&&r.userId===auth.user.id&&!r.deletedAt;});if(!art)throw lf_error_('ART_PROJECT_NOT_FOUND','Art project was not found.',404);const ai=lf_aiInvoke_(auth,'image-generate',art.projectId,{prompt:lf_limitText_(data.prompt||'',20000),negativePrompt:lf_limitText_(data.negativePrompt||'',5000),width:Number(data.width||art.width||1024),height:Number(data.height||art.height||1024),referenceAssets:data.referenceAssets||[],styleControls:data.styleControls||{},bookContext:data.bookContext||{}},true);const result=ai.result||{};const saved=[];
  const images=Array.isArray(result.images)?result.images:(result.imageBase64?[{base64:result.imageBase64,mimeType:result.mimeType||'image/png',name:result.name||'AI Generated Art.png'}]:[]);images.slice(0,8).forEach(function(img,i){try{const r=lf_artAssetUpload_(auth,{artProjectId:art.id,name:img.name||('AI Generated Art '+(i+1)+'.png'),mimeType:img.mimeType||'image/png',base64:img.base64,description:'AI-generated artwork',metadata:{aiJobId:ai.jobId,prompt:data.prompt||''},storageTarget:data.storageTarget,mirrorToLinkedDrive:data.mirrorToLinkedDrive});saved.push(r.attachment);}catch(ignore){}});return{ok:true,jobId:ai.jobId,result:result,savedAssets:saved};
}

/* ========================================================================== */
/* V2 PUBLIC SERIALIZERS                                                       */
/* ========================================================================== */

function lf_publicDriveLink_(r){return{id:r.id,provider:r.provider,accountEmail:r.accountEmail||'',scope:r.scope||'',rootFolderId:r.rootFolderId||'',status:r.status,createdAt:r.createdAt,updatedAt:r.updatedAt,lastUsedAt:r.lastUsedAt||''};}
function lf_publicFileIndex_(r){return{id:r.id,projectId:r.projectId,attachmentId:r.attachmentId,name:r.name,extension:r.extension,mimeType:r.mimeType,category:r.category,logicalType:r.logicalType,sourceHash:r.sourceHash,extractedText:r.extractedText||'',fullTextExternal:!!r.textDriveFileId,textCharacters:Number(r.textCharacters||String(r.extractedText||'').length),nodeIds:lf_parseJson_(r.nodeIdsJson,[]),metadata:lf_parseJson_(r.metadataJson,{}),status:r.status,createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicStoryFact_(r){return{id:r.id,projectId:r.projectId,subjectType:r.subjectType,subjectId:r.subjectId,predicate:r.predicate,value:lf_parseJson_(r.valueJson,null),truthStatus:r.truthStatus,scope:r.scope,validFrom:r.validFrom||'',validUntil:r.validUntil||'',sourceType:r.sourceType||'',sourceId:r.sourceId||'',sourceQuote:r.sourceQuote||'',confidence:Number(r.confidence||0),status:r.status,metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicKnowledge_(r){return{id:r.id,projectId:r.projectId,characterId:r.characterId,factId:r.factId,knowledgeState:r.knowledgeState,learnedAtEventId:r.learnedAtEventId||'',learnedAtNodeId:r.learnedAtNodeId||'',sourceCharacterId:r.sourceCharacterId||'',reliability:Number(r.reliability||0),metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicPlotThread_(r){return{id:r.id,projectId:r.projectId,name:r.name,threadType:r.threadType,status:r.status,importance:r.importance,introducedNodeId:r.introducedNodeId||'',lastTouchedNodeId:r.lastTouchedNodeId||'',resolutionNodeId:r.resolutionNodeId||'',beatNodeIds:lf_parseJson_(r.beatNodeIdsJson,[]),metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicCausalLink_(r){return{id:r.id,projectId:r.projectId,fromType:r.fromType,fromId:r.fromId,toType:r.toType,toId:r.toId,relation:r.relation,required:lf_bool_(r.required),confidence:Number(r.confidence||0),notes:r.notes||'',metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicWorldRule_(r){return{id:r.id,projectId:r.projectId,ruleType:r.ruleType,name:r.name,statement:r.statement,conditions:lf_parseJson_(r.conditionsJson,[]),exceptions:lf_parseJson_(r.exceptionsJson,[]),status:r.status,sourceIds:lf_parseJson_(r.sourceIdsJson,[]),metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicProjectRelation_(r){return{id:r.id,parentProjectId:r.parentProjectId,childProjectId:r.childProjectId,relationType:r.relationType,canonScope:r.canonScope,chronology:lf_parseJson_(r.chronologyJson,{}),metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicEditorRun_(r){return{id:r.id,projectId:r.projectId,editorType:r.editorType,scopeType:r.scopeType,scopeId:r.scopeId||'',provider:r.provider,status:r.status,summary:r.summary,results:lf_parseJson_(r.resultsJson,[]),createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicAiJob_(r){return{id:r.id,projectId:r.projectId||'',jobType:r.jobType,provider:r.provider,status:r.status,inputHash:r.inputHash,error:r.error||'',createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicMergeJob_(r){return{id:r.id,projectId:r.projectId,name:r.name,status:r.status,inputIds:lf_parseJson_(r.inputImportIdsJson,[]),plan:lf_readJsonPayload_(r.planJson,r.planDriveFileId,{}),result:lf_readJsonPayload_(r.resultJson,r.resultDriveFileId,{}),snapshotId:r.snapshotId||'',createdAt:r.createdAt,updatedAt:r.updatedAt};}
function lf_publicRevisionSnapshot_(r){return{id:r.id,projectId:r.projectId,targetType:r.targetType,targetId:r.targetId,label:r.label,sourceAction:r.sourceAction,createdAt:r.createdAt};}
function lf_publicBook_(r){return{id:r.id,projectId:r.projectId,title:r.title,subtitle:r.subtitle||'',authorName:r.authorName||'',bookType:r.bookType,seriesName:r.seriesName||'',seriesNumber:r.seriesNumber||'',language:r.language||'',isbn:r.isbn||'',description:r.description||'',metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicBookEdition_(r){return{id:r.id,projectId:r.projectId,bookId:r.bookId,name:r.name,binding:r.binding,trimWidthIn:Number(r.trimWidthIn),trimHeightIn:Number(r.trimHeightIn),orientation:r.orientation,bleedIn:Number(r.bleedIn||0),gutterIn:Number(r.gutterIn||0),margins:lf_parseJson_(r.marginsJson,{}),typography:lf_parseJson_(r.typographyJson,{}),pageStyle:lf_parseJson_(r.pageStyleJson,{}),frontMatter:lf_parseJson_(r.frontMatterJson,{}),backMatter:lf_parseJson_(r.backMatterJson,{}),settings:lf_parseJson_(r.settingsJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicBookChapter_(r){return{id:r.id,projectId:r.projectId,bookId:r.bookId,nodeId:r.nodeId,chapterNumber:r.chapterNumber||'',title:r.title,subtitle:r.subtitle||'',sortOrder:Number(r.sortOrder||0),povEntityId:r.povEntityId||'',status:r.status,wordCount:Number(r.wordCount||0),format:lf_parseJson_(r.formatJson,{}),metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicArtProject_(r){const state=lf_artState_(r);return{id:r.id,projectId:r.projectId,bookId:r.bookId||'',name:r.name,width:Number(r.width||0),height:Number(r.height||0),dpi:Number(r.dpi||0),canvas:state.canvas,layers:state.layers,palette:state.palette,toolSettings:state.toolSettings,background:state.background,stateExternal:!!r.stateDriveFileId,metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_twoFactorResendPublic_(data){const raw=String(data.challengeToken||'').trim();if(!raw)throw lf_error_('TWO_FACTOR_CHALLENGE_REQUIRED','Two-factor challenge token is required.',400);const ch=lf_findOne_('TWO_FACTOR_CHALLENGES',function(r){return r.challengeHash===lf_sha256Hex_('2fa|'+raw)&&!r.usedAt;});if(!ch||Date.parse(ch.expiresAt)<=Date.now())throw lf_error_('TWO_FACTOR_EXPIRED','Two-factor challenge expired. Sign in again.',401);const contact=lf_findOne_('RECOVERY_CONTACTS',function(r){return r.userId===ch.userId&&r.kind===ch.method&&r.valueKey===ch.destinationKey&&lf_bool_(r.verified);});if(!contact)throw lf_error_('TWO_FACTOR_CONTACT_MISSING','The two-factor recovery method is unavailable.',409);const code=lf_randomDigits_(6),expires=new Date(Date.now()+LF.TWO_FACTOR_TTL_MINUTES*60000).toISOString();lf_updateRow_('TWO_FACTOR_CHALLENGES',ch._row,{codeHash:lf_sha256Hex_('2fa-code|'+ch.userId+'|'+code),expiresAt:expires,attempts:0});lf_deliverTwoFactorCode_(contact,code);return{ok:true,twoFactorRequired:true,challengeToken:raw,method:contact.kind,destination:lf_maskDestination_(contact.kind,contact.value),expiresAt:expires};}
function lf_scopeProjectId_(auth,data){if(data&&data.allProjects)return'';if(data&&data.projectId)return String(data.projectId);const settings=lf_parseJson_(auth.user.settingsJson,{}),id=settings&&settings.organization?String(settings.organization.activeProjectId||''):'';if(!id)return'';const owned=lf_findOne_('PROJECTS',function(r){return r.id===id&&r.userId===auth.user.id&&!r.archivedAt;});return owned?id:'';}


/* ========================================================================== */
/* V2 HYBRID LARGE-CONTENT STORAGE HELPERS                                     */
/* ========================================================================== */
function lf_backendPayloadFolder_(auth,project,category){if(project){const pf=lf_ensureProjectDirectoriesByRow_(project),key=lf_categoryFolderKey_(category||'data');return pf[key]||pf.data||pf.other||pf.root;}const uf=lf_getUserFolders_(auth.user);return uf.files;}
function lf_writeInternalPayload_(auth,project,text,name,existingFileId,category){let file=null;if(existingFileId){try{file=DriveApp.getFileById(existingFileId);file.setContent(String(text));file.setName(lf_safeFilename_(name));}catch(ignore){file=null;}}if(!file)file=lf_backendPayloadFolder_(auth,project,category).createFile(lf_safeFilename_(name),String(text),MimeType.PLAIN_TEXT);return file.getId();}
function lf_externalizeTextPair_(auth,project,existingStorageJson,content,plain,name){content=String(content||'');plain=String(plain||'');const old=lf_parseJson_(existingStorageJson,{}),large=content.length>LF.SHEET_SAFE_CHARS||plain.length>LF.SHEET_SAFE_CHARS;if(!large){if(old.fileId)try{DriveApp.getFileById(old.fileId).setTrashed(true);}catch(ignore){}return{contentPreview:content,plainPreview:plain,storage:{mode:'sheet',contentChars:content.length,plainChars:plain.length,hash:lf_sha256Hex_(content+'|'+plain)}};}const payload=JSON.stringify({schema:'literaryfriend.text-pair.v2',content:content,plainText:plain}),fileId=lf_writeInternalPayload_(auth,project,payload,name,old.fileId||'','data');return{contentPreview:content.slice(0,LF.SHEET_SAFE_CHARS),plainPreview:plain.slice(0,LF.SHEET_SAFE_CHARS),storage:{mode:'drive-json',fileId:fileId,contentChars:content.length,plainChars:plain.length,hash:lf_sha256Hex_(content+'|'+plain)}};}
function lf_fullTextPair_(row){const storage=lf_parseJson_(row&&row.contentStorageJson,{});if(storage.mode==='drive-json'&&storage.fileId){try{const obj=JSON.parse(DriveApp.getFileById(storage.fileId).getBlob().getDataAsString('UTF-8'));return{content:String(obj.content||''),plainText:String(obj.plainText||lf_plainText_(obj.content||''))};}catch(ignore){}}return{content:String(row&&row.content||''),plainText:String(row&&row.plainText||lf_plainText_(row&&row.content||''))};}
function lf_externalizeIndexedText_(auth,project,text,name){text=String(text||'');if(text.length<=LF.SHEET_SAFE_CHARS)return{preview:text,fileId:''};return{preview:text.slice(0,LF.SHEET_SAFE_CHARS),fileId:lf_writeInternalPayload_(auth,project,text,name,'','data')};}
function lf_fileIndexFullText_(row){if(row&&row.textDriveFileId){try{return lf_limitText_(DriveApp.getFileById(row.textDriveFileId).getBlob().getDataAsString('UTF-8'),LF.MAX_TEXT_CHARS);}catch(ignore){}}return String(row&&row.extractedText||'');}
function lf_jsonCell_(value){let text='';try{text=JSON.stringify(value);}catch(ignore){text=JSON.stringify({unserializable:true});}if(text.length<=LF.SHEET_SAFE_CHARS)return text;const n=Math.floor(LF.SHEET_SAFE_CHARS/3);return JSON.stringify({truncated:true,characters:text.length,preview:text.slice(0,n)});}
function lf_jsonArrayCell_(arr){arr=Array.isArray(arr)?arr:[];const kept=[];for(let i=0;i<arr.length;i++){kept.push(arr[i]);const s=JSON.stringify(kept);if(s.length>LF.SHEET_SAFE_CHARS){kept.pop();break;}}return JSON.stringify(kept);}
function lf_compactAiLog_(value,depth){depth=Number(depth||0);if(depth>6)return'[depth omitted]';if(value===null||typeof value==='undefined')return value;if(typeof value==='string'){if(/^data:[^;]+;base64,/i.test(value)||value.length>12000&&/^[A-Za-z0-9+/=\r\n]+$/.test(value))return'[binary/base64 omitted: '+value.length+' chars]';return value.length>4000?value.slice(0,4000)+'… ['+(value.length-4000)+' chars omitted]':value;}if(Array.isArray(value))return value.slice(0,40).map(function(v){return lf_compactAiLog_(v,depth+1);});if(typeof value==='object'){const out={};Object.keys(value).slice(0,80).forEach(function(k){out[k]=lf_compactAiLog_(value[k],depth+1);});return out;}return value;}
function lf_storeJsonPayload_(auth,project,value,name,existingFileId,category){const json=JSON.stringify(value);if(json.length<=LF.SHEET_SAFE_CHARS){if(existingFileId)try{DriveApp.getFileById(existingFileId).setTrashed(true);}catch(ignore){}return{cellJson:json,fileId:''};}const fileId=lf_writeInternalPayload_(auth,project,json,name,existingFileId||'',category||'data');return{cellJson:JSON.stringify({external:true,fileId:fileId,characters:json.length,hash:lf_sha256Hex_(json)}),fileId:fileId};}
function lf_readJsonPayload_(cellJson,fileId,fallback){if(fileId){try{return JSON.parse(DriveApp.getFileById(fileId).getBlob().getDataAsString('UTF-8'));}catch(ignore){}}const parsed=lf_parseJson_(cellJson,null);return parsed&&parsed.external?fallback:(parsed===null?fallback:parsed);}
function lf_artState_(r){if(r&&r.stateDriveFileId){try{const x=JSON.parse(DriveApp.getFileById(r.stateDriveFileId).getBlob().getDataAsString('UTF-8'));return{canvas:x.canvas||{},layers:Array.isArray(x.layers)?x.layers:[],palette:x.palette||{},toolSettings:x.toolSettings||{},background:x.background||{}};}catch(ignore){}}return{canvas:lf_parseJson_(r&&r.canvasJson,{}),layers:lf_parseJson_(r&&r.layersJson,[]),palette:lf_parseJson_(r&&r.paletteJson,{}),toolSettings:lf_parseJson_(r&&r.toolSettingsJson,{}),background:lf_parseJson_(r&&r.backgroundJson,{})};}

function lf_revisionSnapshotsList_(auth,data){const p=lf_scopeProjectId_(auth,data);let rows=lf_rows_('REVISION_SNAPSHOTS').filter(function(r){return r.userId===auth.user.id&&(!p||r.projectId===p)&&(!data.targetType||r.targetType===String(data.targetType))&&(!data.targetId||r.targetId===String(data.targetId));});rows.sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});return{ok:true,snapshots:rows.slice(0,Math.min(Number(data.limit||100),500)).map(lf_publicRevisionSnapshot_)};}
function lf_revisionSnapshotGet_(auth,data){const row=lf_findOne_('REVISION_SNAPSHOTS',function(r){return r.id===String(data.id||data.snapshotId||'')&&r.userId===auth.user.id;});if(!row)throw lf_error_('SNAPSHOT_NOT_FOUND','Revision snapshot was not found.',404);return{ok:true,snapshot:lf_publicRevisionSnapshot_(row),data:lf_readJsonPayload_(row.contentJson,row.contentDriveFileId,{})};}
