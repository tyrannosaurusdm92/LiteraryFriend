/**
 * LiteraryFriend Unified Backend
 * Version: 1.0.0
 * Generated: 2026-08-07
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
  VERSION: '1.0.0',
  API_VERSION: '2026-08-07',
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
  DEFAULT_PROJECT_TYPES: [
    'book','book-series','game','video-game','ttrpg','board-game','story','screenplay',
    'worldbuilding','fantasy-language','constructed-language','campaign','research',
    'character-collection','setting','other'
  ]
});

const LF_SHEETS = Object.freeze({
  USERS: [
    'id','usernameKey','username','primaryEmailKey','primaryEmail','displayName',
    'passwordHash','passwordSalt','passwordIterations','googleSub','emailVerified',
    'status','settingsJson','preferencesJson','userFolderId','createdAt','updatedAt','lastLoginAt'
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
    'content','plainText','metadataJson','tagsJson','linksJson','driveFileId',
    'createdAt','updatedAt','deletedAt'
  ],
  NOTES: [
    'id','userId','projectId','folderId','title','content','plainText','format',
    'tagsJson','pinned','locked','color','source','metadataJson',
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
    smsWebhookSecret: 'LF_SMS_WEBHOOK_SECRET'
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
    'auth.contact.code.verify': true
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

    case 'entities.save': return lf_entitySave_(auth, data);
    case 'entities.get': return lf_entityGet_(auth, data);
    case 'entities.list': return lf_entitiesList_(auth, data);
    case 'entities.delete': return lf_entityDelete_(auth, data);

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

    case 'plotissues.save': return lf_plotIssueSave_(auth, data);
    case 'plotissues.list': return lf_plotIssuesList_(auth, data);
    case 'plotissues.resolve': return lf_plotIssueResolve_(auth, data);
    case 'plotissues.delete': return lf_plotIssueDelete_(auth, data);
    case 'plotissues.scan': return lf_plotIssueScan_(auth, data);

    case 'search.global': return lf_search_(auth, data);
    case 'search.saved.save': return lf_savedSearchSave_(auth, data);
    case 'search.saved.list': return lf_savedSearchList_(auth, data);
    case 'search.saved.delete': return lf_savedSearchDelete_(auth, data);

    case 'reading.state.get': return lf_readingStateGet_(auth, data);
    case 'reading.state.save': return lf_readingStateSave_(auth, data);

    case 'export.project': return lf_exportProject_(auth, data);
    case 'export.user': return lf_exportUser_(auth, data);
    case 'backup.create': return lf_backupCreate_(auth, data);

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
    storage: 'Google Drive + Google Sheets',
    githubRequired: false,
    capabilities: [
      'accounts','password-auth','google-sign-in','multi-device-sessions',
      'multiple-recovery-emails','multiple-recovery-phones','one-time-recovery-codes',
      'email-password-reset','optional-sms-webhook','projects','directories','notes',
      'folders','tags','attachments','imports','exports','backup','global-search',
      'plot-issue-tracking','timeline','entities','fantasy-languages','lexicon',
      'read-aloud-state','audit-history'
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
    projectTypes: LF.DEFAULT_PROJECT_TYPES
  };
}

function lf_launcher_() {
  const api = ScriptApp.getService().getUrl() || '';
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>LiteraryFriend Backend</title><style>body{font-family:Georgia,serif;background:#f5efe3;color:#33251f;margin:0;padding:32px}' +
    '.card{max-width:900px;margin:auto;background:#fffaf1;border:1px solid #9f8069;border-radius:20px;padding:28px;box-shadow:0 12px 40px #0002}' +
    'a{color:#68452f}code{background:#eee2d1;padding:.12em .35em;border-radius:5px}</style></head><body><div class="card">' +
    '<h1>LiteraryFriend Backend</h1><p>This deployment is the storage and account API for LiteraryFriend. It does not depend on GitHub.</p>' +
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
      lastLoginAt: now
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
  const session = lf_createSession_(user.id, data, req);
  lf_activity_(user.id, 'auth.login', 'session', session.publicSession.id, '', {
    deviceName: session.publicSession.deviceName
  });

  return {ok:true, user:lf_privateUser_(user), token:session.token, session:session.publicSession};
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

  const email = lf_cleanEmail_(profile.email);
  let user = lf_findOne_('USERS', function(r) { return r.googleSub === String(profile.sub) || r.primaryEmailKey === email; });

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
        userFolderId:folder.root.getId(), createdAt:now, updatedAt:now, lastLoginAt:now
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

    const session = lf_createSession_(user.id, data, req);
    lf_activity_(user.id, 'auth.google', 'session', session.publicSession.id, '', {});
    return {ok:true, user:lf_privateUser_(user), token:session.token, session:session.publicSession};
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

  let contacts = lf_rows_('RECOVERY_CONTACTS').filter(function(r) {
    return r.userId === user.id && r.kind === 'email' && lf_bool_(r.verified);
  });
  if (!contacts.length) {
    contacts = lf_rows_('RECOVERY_CONTACTS').filter(function(r) {
      return r.userId === user.id && r.kind === 'email';
    }).slice(0,1);
  }
  contacts.forEach(function(c){ lf_sendVerificationCodeForContact_(user.id, 'email', c.value, 'password_reset'); });
  return {ok:true, message:'If the account exists, a reset code was sent.', destinations:contacts.length};
}

function lf_passwordResetComplete_(data, req) {
  const login = String(data.login || data.email || data.username || '').trim().toLowerCase();
  const code = String(data.code || '').replace(/\s+/g,'');
  const newPassword = lf_validatePassword_(data.newPassword);
  if (!login || !code) throw lf_error_('RESET_FIELDS_REQUIRED', 'Login and reset code are required.', 400);

  const user = lf_findOne_('USERS', function(r){ return r.primaryEmailKey === login || r.usernameKey === login; });
  if (!user) throw lf_error_('RESET_INVALID', 'Reset code is invalid or expired.', 401);

  lf_consumeAuthCode_(user.id, 'password_reset', code);

  const salt = lf_randomToken_(24);
  user = lf_updateRow_('USERS', user._row, {
    passwordSalt:salt,
    passwordHash:lf_hashPassword_(newPassword, salt, LF.PBKDF2_ITERATIONS),
    passwordIterations:LF.PBKDF2_ITERATIONS,
    updatedAt:lf_nowIso_()
  });
  lf_revokeAllSessionsForUser_(user.id, '');
  const session = lf_createSession_(user.id, data, req);
  lf_activity_(user.id, 'auth.password.reset.complete', 'user', user.id, '', {});
  return {ok:true, user:lf_privateUser_(user), token:session.token, session:session.publicSession};
}

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
      fontScale:1,
      highContrast:false,
      reduceMotion:false,
      dyslexiaFriendly:false,
      screenReaderLabels:true,
      largeTargets:true
    },
    reading:{
      readAloudEnabled:true,
      speed:1,
      voice:'',
      highlightSentence:true,
      autoScroll:true
    },
    editor:{
      autosave:true,
      autosaveSeconds:15,
      spellcheck:true,
      smartQuotes:true,
      wordCount:true
    },
    organization:{
      defaultView:'directory',
      rememberExpandedFolders:true
    }
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
  lf_activity_(auth.user.id, 'projects.create', 'project', id, id, {type:type,title:title});
  return {ok:true, project:lf_publicProject_(row)};
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
    {type:'directory',title:'Language'},
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

function lf_nodeSave_(auth, data) {
  const project = lf_requireOwnedProject_(auth, data.projectId);
  const id = String(data.id || data.nodeId || '');
  const now = lf_nowIso_();
  let row = id ? lf_findOne_('NODES', function(r){ return r.id === id && r.userId === auth.user.id && r.projectId === project.id; }) : null;

  const content = lf_limitText_(data.content || '', LF.MAX_TEXT_CHARS);
  const patch = {
    userId:auth.user.id,
    projectId:project.id,
    parentId:String(data.parentId || ''),
    nodeType:lf_cleanSlug_(data.nodeType || data.type || 'document'),
    title:lf_cleanText_(data.title || 'Untitled',200),
    slug:lf_slug_(data.title || 'Untitled'),
    sortOrder:Number(data.sortOrder || 0),
    content:content,
    plainText:lf_plainText_(data.plainText || content),
    metadataJson:JSON.stringify(data.metadata || {}),
    tagsJson:JSON.stringify(lf_stringArray_(data.tags)),
    linksJson:JSON.stringify(data.links || []),
    driveFileId:String(data.driveFileId || (row && row.driveFileId) || ''),
    updatedAt:now,
    deletedAt:''
  };

  if (row) {
    row = lf_updateRow_('NODES', row._row, patch);
  } else {
    patch.id = 'node_' + Utilities.getUuid();
    patch.createdAt = now;
    row = lf_appendRow_('NODES', patch);
  }
  lf_activity_(auth.user.id, 'nodes.save', 'node', row.id, project.id, {nodeType:row.nodeType});
  return {ok:true, node:lf_publicNode_(row)};
}

function lf_nodeGet_(auth, data) {
  const id = String(data.id || data.nodeId || '');
  const row = lf_findOne_('NODES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NODE_NOT_FOUND', 'Directory item was not found.', 404);
  return {ok:true, node:lf_publicNode_(row)};
}

function lf_nodesList_(auth, data) {
  let rows = lf_rows_('NODES').filter(function(r){
    return r.userId === auth.user.id &&
      (!data.projectId || r.projectId === String(data.projectId)) &&
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

function lf_noteSave_(auth, data) {
  if (data.projectId) lf_requireOwnedProject_(auth, data.projectId);
  const id = String(data.id || data.noteId || '');
  let row = id ? lf_findOne_('NOTES', function(r){ return r.id === id && r.userId === auth.user.id; }) : null;
  const now = lf_nowIso_();
  const content = lf_limitText_(data.content || data.text || '', LF.MAX_NOTE_CHARS);

  const patch = {
    userId:auth.user.id,
    projectId:String(data.projectId || (row && row.projectId) || ''),
    folderId:String(data.folderId || (row && row.folderId) || ''),
    title:lf_cleanText_(data.title || (row && row.title) || lf_titleFromText_(content) || 'Untitled Note',200),
    content:content,
    plainText:lf_plainText_(data.plainText || content),
    format:lf_cleanText_(data.format || (row && row.format) || 'html',20),
    tagsJson:JSON.stringify(lf_stringArray_(data.tags || (row ? lf_parseJson_(row.tagsJson,[]) : []))),
    pinned:lf_bool_(Object.prototype.hasOwnProperty.call(data,'pinned') ? data.pinned : (row && row.pinned)),
    locked:lf_bool_(Object.prototype.hasOwnProperty.call(data,'locked') ? data.locked : (row && row.locked)),
    color:lf_cleanText_(data.color || (row && row.color) || '',30),
    source:lf_cleanText_(data.source || (row && row.source) || 'editor',40),
    metadataJson:JSON.stringify(data.metadata || (row ? lf_parseJson_(row.metadataJson,{}) : {})),
    updatedAt:now,
    deletedAt:''
  };

  if (row) row = lf_updateRow_('NOTES', row._row, patch);
  else {
    patch.id = 'note_' + Utilities.getUuid();
    patch.createdAt = now;
    row = lf_appendRow_('NOTES', patch);
  }

  lf_activity_(auth.user.id, 'notes.save', 'note', row.id, row.projectId, {title:row.title});
  return {ok:true, note:lf_publicNote_(row)};
}

function lf_noteGet_(auth, data) {
  const id = String(data.id || data.noteId || '');
  const row = lf_findOne_('NOTES', function(r){ return r.id === id && r.userId === auth.user.id; });
  if (!row) throw lf_error_('NOTE_NOT_FOUND', 'Note was not found.', 404);
  return {ok:true, note:lf_publicNote_(row), attachments:lf_attachmentsFor_(auth.user.id,'note',row.id)};
}

function lf_notesList_(auth, data) {
  let rows = lf_rows_('NOTES').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt &&
      (!data.projectId || r.projectId === String(data.projectId)) &&
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
  const rows = lf_rows_('NOTE_FOLDERS').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt && (!data.projectId || r.projectId === String(data.projectId));
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
  const counts = {};
  lf_rows_('NOTES').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt && (!data.projectId || r.projectId === String(data.projectId));
  }).forEach(function(r){
    lf_parseJson_(r.tagsJson,[]).forEach(function(t){ counts[t] = (counts[t] || 0) + 1; });
  });
  return {ok:true, tags:Object.keys(counts).sort().map(function(name){ return {name:name,count:counts[name]}; })};
}

/* ========================================================================== */
/* ATTACHMENTS / IMPORTS                                                       */
/* ========================================================================== */

function lf_attachmentUpload_(auth, data) {
  if (data.projectId) lf_requireOwnedProject_(auth, data.projectId);
  const name = lf_safeFilename_(data.name || data.fileName || 'attachment');
  const mimeType = lf_cleanText_(data.mimeType || 'application/octet-stream',120);
  const base64 = String(data.base64 || data.dataBase64 || '').replace(/^data:[^;]+;base64,/,'');
  if (!base64) throw lf_error_('FILE_DATA_REQUIRED', 'Attachment base64 data is required.', 400);

  const bytes = Utilities.base64Decode(base64);
  if (bytes.length > LF.MAX_UPLOAD_BYTES) throw lf_error_('FILE_TOO_LARGE', 'Attachment exceeds LiteraryFriend upload limit.', 413);

  const folders = lf_getUserFolders_(auth.user);
  const target = data.importMode ? folders.imports : folders.files;
  const blob = Utilities.newBlob(bytes, mimeType, name);
  const file = target.createFile(blob);
  const now = lf_nowIso_();

  const row = lf_appendRow_('ATTACHMENTS', {
    id:'attachment_' + Utilities.getUuid(), userId:auth.user.id,
    projectId:String(data.projectId || ''), ownerType:lf_cleanSlug_(data.ownerType || ''),
    ownerId:String(data.ownerId || ''), name:name, mimeType:mimeType, size:bytes.length,
    driveFileId:file.getId(), webViewUrl:file.getUrl(),
    description:lf_cleanText_(data.description || '',1000),
    metadataJson:JSON.stringify(data.metadata || {}), createdAt:now, deletedAt:''
  });
  lf_activity_(auth.user.id, 'attachments.upload', 'attachment', row.id, row.projectId, {name:name,size:bytes.length});
  return {ok:true, attachment:lf_publicAttachment_(row)};
}

function lf_attachmentsList_(auth, data) {
  let rows = lf_rows_('ATTACHMENTS').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt &&
      (!data.projectId || r.projectId === String(data.projectId)) &&
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
  try { DriveApp.getFileById(row.driveFileId).setTrashed(true); } catch (err) {}
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
  const rows = lf_rows_('IMPORTS').filter(function(r){
    return r.userId === auth.user.id && (!data.projectId || r.projectId === String(data.projectId));
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
  let rows = lf_rows_('ENTITIES').filter(function(r){
    return r.userId === auth.user.id && !r.deletedAt &&
      (!data.projectId || r.projectId === String(data.projectId));
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
  const rows=lf_rows_('TIMELINE_EVENTS').filter(function(r){
    return r.userId===auth.user.id&&!r.deletedAt&&(!data.projectId||r.projectId===String(data.projectId));
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
  const rows=lf_rows_('LANGUAGES').filter(function(r){
    return r.userId===auth.user.id&&!r.deletedAt&&(!data.projectId||r.projectId===String(data.projectId));
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
  let rows=lf_rows_('LEXICON').filter(function(r){
    return r.userId===auth.user.id&&!r.deletedAt&&(!data.languageId||r.languageId===String(data.languageId));
  });
  if(data.query){
    const q=String(data.query).toLowerCase();
    rows=rows.filter(function(r){return String(r.word).toLowerCase().indexOf(q)>=0||String(r.definition).toLowerCase().indexOf(q)>=0;});
  }
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
  let rows=lf_rows_('PLOT_ISSUES').filter(function(r){
    return r.userId===auth.user.id&&(!data.projectId||r.projectId===String(data.projectId));
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
  const project=lf_requireOwnedProject_(auth,data.projectId);
  const corpus=[];
  lf_rows_('NODES').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;})
    .forEach(function(r){corpus.push({id:r.id,type:'node',title:r.title,text:r.plainText||lf_plainText_(r.content)});});
  lf_rows_('NOTES').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;})
    .forEach(function(r){corpus.push({id:r.id,type:'note',title:r.title,text:r.plainText||lf_plainText_(r.content)});});

  const warnings=[];
  corpus.forEach(function(item){
    const text=String(item.text||'');
    if(/\b(todo|fixme|plot hole|plothole|continuity error|inconsistent|doesn't make sense|does not make sense)\b/i.test(text)){
      warnings.push({kind:'explicit-marker',sourceId:item.id,sourceType:item.type,title:item.title,
        message:'This section contains an explicit continuity or revision marker.'});
    }
    if(/\b(suddenly|somehow)\b/i.test(text) && text.length > 500){
      warnings.push({kind:'review-transition',sourceId:item.id,sourceType:item.type,title:item.title,
        message:'Review an abrupt transition or unexplained causal step near “suddenly/somehow”.'});
    }
  });

  const timeline=lf_rows_('TIMELINE_EVENTS').filter(function(r){return r.userId===auth.user.id&&r.projectId===project.id&&!r.deletedAt;});
  const duplicates={};
  timeline.forEach(function(e){
    const k=(e.startValue+'|'+e.title).toLowerCase();
    duplicates[k]=(duplicates[k]||[]).concat([e.id]);
  });
  Object.keys(duplicates).forEach(function(k){
    if(duplicates[k].length>1)warnings.push({kind:'possible-duplicate-timeline-event',eventIds:duplicates[k],message:'Multiple timeline events share the same title and start value.'});
  });

  return {ok:true,projectId:project.id,scanner:'deterministic-local-v1',warnings:warnings.slice(0,LF.MAX_SEARCH_RESULTS)};
}

/* ========================================================================== */
/* SEARCH                                                                      */
/* ========================================================================== */

function lf_search_(auth,data){
  const q=String(data.query||data.q||'').trim().toLowerCase();
  if(!q)throw lf_error_('QUERY_REQUIRED','Search query is required.',400);
  const projectId=String(data.projectId||'');
  const wanted=(data.types&&Array.isArray(data.types)?data.types:['note','node','entity','timeline','language','lexicon','plotissue']).map(String);
  const results=[];

  function add(type,id,title,text,project,updated,extra){
    const hay=(String(title||'')+'\n'+String(text||'')).toLowerCase();
    const idx=hay.indexOf(q);
    if(idx<0)return;
    let score=1;
    if(String(title||'').toLowerCase().indexOf(q)>=0)score+=5;
    const preview=lf_plainText_(text||'').slice(Math.max(0,idx-90),Math.max(0,idx-90)+260);
    results.push(Object.assign({type:type,id:id,title:title||'',projectId:project||'',score:score,preview:preview,updatedAt:updated||''},extra||{}));
  }

  if(wanted.indexOf('note')>=0)lf_rows_('NOTES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('note',r.id,r.title,r.plainText||r.content,r.projectId,r.updatedAt,{tags:lf_parseJson_(r.tagsJson,[])});});
  if(wanted.indexOf('node')>=0)lf_rows_('NODES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('node',r.id,r.title,r.plainText||r.content,r.projectId,r.updatedAt,{nodeType:r.nodeType});});
  if(wanted.indexOf('entity')>=0)lf_rows_('ENTITIES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('entity',r.id,r.name,r.description,r.projectId,r.updatedAt,{entityType:r.entityType});});
  if(wanted.indexOf('timeline')>=0)lf_rows_('TIMELINE_EVENTS').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('timeline',r.id,r.title,r.description,r.projectId,r.updatedAt,{startValue:r.startValue});});
  if(wanted.indexOf('language')>=0)lf_rows_('LANGUAGES').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('language',r.id,r.name,r.description,r.projectId,r.updatedAt,{});});
  if(wanted.indexOf('lexicon')>=0)lf_rows_('LEXICON').filter(function(r){return r.userId===auth.user.id&&!r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('lexicon',r.id,r.word,r.definition+'\n'+r.notes,r.projectId,r.updatedAt,{languageId:r.languageId});});
  if(wanted.indexOf('plotissue')>=0)lf_rows_('PLOT_ISSUES').filter(function(r){return r.userId===auth.user.id&&(!projectId||r.projectId===projectId);}).forEach(function(r){add('plotissue',r.id,r.title,r.description+'\n'+r.suggestion+'\n'+r.resolution,r.projectId,r.updatedAt,{status:r.status,severity:r.severity});});

  results.sort(function(a,b){return b.score-a.score||String(b.updatedAt).localeCompare(String(a.updatedAt));});
  return {ok:true,query:q,results:results.slice(0,Math.min(Number(data.limit||LF.MAX_SEARCH_RESULTS),LF.MAX_SEARCH_RESULTS))};
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

function lf_savedSearchList_(auth,data){
  const rows=lf_rows_('SAVED_SEARCHES').filter(function(r){return r.userId===auth.user.id&&(!data.projectId||r.projectId===String(data.projectId));});
  return {ok:true,savedSearches:rows.map(lf_publicSavedSearch_)};
}

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

function lf_exportProject_(auth,data){
  const project=lf_requireOwnedProject_(auth,data.projectId||data.id);
  const pack=lf_buildProjectExport_(auth.user.id,project.id);
  const folders=lf_getUserFolders_(auth.user);
  const name=lf_safeFilename_(project.title+' — LiteraryFriend Export — '+lf_dateStamp_()+'.json');
  const file=folders.exports.createFile(name,JSON.stringify(pack,null,2),MimeType.PLAIN_TEXT);
  const now=lf_nowIso_();
  const row=lf_appendRow_('EXPORTS',{id:'export_'+Utilities.getUuid(),userId:auth.user.id,projectId:project.id,exportType:'project-json',name:name,driveFileId:file.getId(),status:'complete',metadataJson:JSON.stringify({url:file.getUrl()}),createdAt:now,updatedAt:now});
  return {ok:true,export:lf_publicExport_(row),download:{driveFileId:file.getId(),url:file.getUrl()},data:lf_bool_(data.includeInline)?pack:undefined};
}

function lf_exportUser_(auth,data){
  const pack=lf_buildUserExport_(auth.user.id);
  const folders=lf_getUserFolders_(auth.user);
  const name='LiteraryFriend Full Export — '+lf_dateStamp_()+'.json';
  const file=folders.exports.createFile(name,JSON.stringify(pack,null,2),MimeType.PLAIN_TEXT);
  const now=lf_nowIso_();
  const row=lf_appendRow_('EXPORTS',{id:'export_'+Utilities.getUuid(),userId:auth.user.id,projectId:'',exportType:'user-json',name:name,driveFileId:file.getId(),status:'complete',metadataJson:JSON.stringify({url:file.getUrl()}),createdAt:now,updatedAt:now});
  return {ok:true,export:lf_publicExport_(row),download:{driveFileId:file.getId(),url:file.getUrl()},data:lf_bool_(data.includeInline)?pack:undefined};
}

function lf_backupCreate_(auth,data){
  const pack=lf_buildUserExport_(auth.user.id);
  const folders=lf_getUserFolders_(auth.user);
  const name='Backup — '+lf_dateStamp_(true)+'.json';
  const file=folders.exports.createFile(name,JSON.stringify(pack),MimeType.PLAIN_TEXT);
  lf_activity_(auth.user.id,'backup.create','file',file.getId(),'',{name:name});
  return {ok:true,backup:{driveFileId:file.getId(),url:file.getUrl(),name:name,createdAt:lf_nowIso_()}};
}

function lf_buildProjectExport_(userId,projectId){
  const project=lf_findOne_('PROJECTS',function(r){return r.id===projectId&&r.userId===userId;});
  if(!project)throw lf_error_('PROJECT_NOT_FOUND','Project was not found.',404);
  return {
    schema:'literaryfriend.project.export.v1',exportedAt:lf_nowIso_(),
    project:lf_publicProject_(project),
    nodes:lf_rows_('NODES').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicNode_),
    notes:lf_rows_('NOTES').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicNote_),
    noteFolders:lf_rows_('NOTE_FOLDERS').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicNoteFolder_),
    entities:lf_rows_('ENTITIES').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicEntity_),
    timeline:lf_rows_('TIMELINE_EVENTS').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicTimeline_),
    languages:lf_rows_('LANGUAGES').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicLanguage_),
    lexicon:lf_rows_('LEXICON').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicLexicon_),
    plotIssues:lf_rows_('PLOT_ISSUES').filter(function(r){return r.userId===userId&&r.projectId===projectId;}).map(lf_publicPlotIssue_),
    attachments:lf_rows_('ATTACHMENTS').filter(function(r){return r.userId===userId&&r.projectId===projectId&&!r.deletedAt;}).map(lf_publicAttachment_)
  };
}

function lf_buildUserExport_(userId){
  const user=lf_findOne_('USERS',function(r){return r.id===userId;});
  const projects=lf_rows_('PROJECTS').filter(function(r){return r.userId===userId;});
  return {
    schema:'literaryfriend.user.export.v1',exportedAt:lf_nowIso_(),
    user:user?lf_privateUser_(user):null,
    recoveryContacts:lf_rows_('RECOVERY_CONTACTS').filter(function(r){return r.userId===userId;}).map(lf_publicRecoveryContact_),
    projects:projects.map(function(p){return lf_buildProjectExport_(userId,p.id);}),
    unfiledNotes:lf_rows_('NOTES').filter(function(r){return r.userId===userId&&!r.projectId;}).map(lf_publicNote_)
  };
}

/* ========================================================================== */
/* TRASH / ACTIVITY                                                           */
/* ========================================================================== */

function lf_trashList_(auth,data){
  const projectId=String(data.projectId||'');
  const out=[];
  lf_rows_('NOTES').filter(function(r){return r.userId===auth.user.id&&r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){out.push({type:'note',item:lf_publicNote_(r),deletedAt:r.deletedAt});});
  lf_rows_('NODES').filter(function(r){return r.userId===auth.user.id&&r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){out.push({type:'node',item:lf_publicNode_(r),deletedAt:r.deletedAt});});
  lf_rows_('ENTITIES').filter(function(r){return r.userId===auth.user.id&&r.deletedAt&&(!projectId||r.projectId===projectId);}).forEach(function(r){out.push({type:'entity',item:lf_publicEntity_(r),deletedAt:r.deletedAt});});
  out.sort(function(a,b){return String(b.deletedAt).localeCompare(String(a.deletedAt));});
  return {ok:true,items:out.slice(0,LF.MAX_LIST_RESULTS)};
}

function lf_activityList_(auth,data){
  let rows=lf_rows_('ACTIVITY').filter(function(r){return r.userId===auth.user.id&&(!data.projectId||r.projectId===String(data.projectId));});
  rows.sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});
  return {ok:true,activity:rows.slice(0,Math.min(Number(data.limit||100),500)).map(function(r){return{id:r.id,action:r.action,targetType:r.targetType,targetId:r.targetId,projectId:r.projectId,details:lf_parseJson_(r.detailsJson,{}),createdAt:r.createdAt};})};
}

/* ========================================================================== */
/* DATABASE                                                                    */
/* ========================================================================== */

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
function lf_publicNode_(r){return{id:r.id,projectId:r.projectId,parentId:r.parentId||'',nodeType:r.nodeType,title:r.title,slug:r.slug,sortOrder:Number(r.sortOrder||0),content:r.content,plainText:r.plainText,metadata:lf_parseJson_(r.metadataJson,{}),tags:lf_parseJson_(r.tagsJson,[]),links:lf_parseJson_(r.linksJson,[]),driveFileId:r.driveFileId||'',createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
function lf_publicNote_(r){return{id:r.id,projectId:r.projectId||'',folderId:r.folderId||'',title:r.title,content:r.content,plainText:r.plainText,format:r.format,tags:lf_parseJson_(r.tagsJson,[]),pinned:lf_bool_(r.pinned),locked:lf_bool_(r.locked),color:r.color||'',source:r.source||'',metadata:lf_parseJson_(r.metadataJson,{}),createdAt:r.createdAt,updatedAt:r.updatedAt,deletedAt:r.deletedAt||''};}
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
function lf_privateUser_(u){return{id:u.id,username:u.username,displayName:u.displayName,primaryEmail:u.primaryEmail,emailVerified:lf_bool_(u.emailVerified),googleLinked:!!u.googleSub,status:u.status,settings:lf_parseJson_(u.settingsJson,lf_defaultSettings_()),preferences:lf_parseJson_(u.preferencesJson,{}),createdAt:u.createdAt,updatedAt:u.updatedAt,lastLoginAt:u.lastLoginAt||''};}

/* ========================================================================== */
/* OWNERSHIP / LOOKUPS                                                         */
/* ========================================================================== */

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
