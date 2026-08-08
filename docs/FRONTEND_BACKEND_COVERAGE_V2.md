# LiteraryFriend Frontend ↔ Service Coverage Audit — V2

This audit is a development artifact. It verifies that the V2 callable capability set is assigned to a frontend owner and has an executable frontend call path. Technical action identifiers are intentionally kept out of normal creative dialogs.

- Callable capabilities mapped: **156 / 156**
- Executable frontend call paths found: **156 / 156**
- Capability names found in the installed V2 service source: **156 / 156**
- V2 source SHA-256: `2aca0a0aa41a44c2e0cf156c7bade9ba5752aa0f3638afdefcc6e8612e2c6c32`

## Creative surface ownership

- **account** — 27 capabilities
- **app** — 2 capabilities
- **artstudio** — 6 capabilities
- **assistant** — 2 capabilities
- **bookbuilder** — 13 capabilities
- **characters** — 8 capabilities
- **consolidate** — 9 capabilities
- **continuity** — 7 capabilities
- **home** — 1 capabilities
- **identity** — 9 capabilities
- **language** — 9 capabilities
- **manuscript** — 10 capabilities
- **notes** — 13 capabilities
- **outline** — 4 capabilities
- **projects** — 10 capabilities
- **publish** — 1 capabilities
- **research** — 3 capabilities
- **revision** — 2 capabilities
- **search** — 4 capabilities
- **timeline** — 3 capabilities
- **trash** — 3 capabilities
- **world** — 10 capabilities

## Capability groups

### activity (1)
- `activity.list` → **account** · executable in `feature-hubs.js, connected-features.js`

### ai (2)
- `ai.jobs.list` → **assistant** · executable in `connected-features.js`
- `ai.request` → **assistant** · executable in `art-ai-director.js, art-studio-backend.js`

### art (6)
- `art.ai.generate` → **artstudio** · executable in `art-studio-backend.js`
- `art.asset.upload` → **artstudio** · executable in `connected-features.js`
- `art.delete` → **artstudio** · executable in `connected-features.js`
- `art.get` → **artstudio** · executable in `art-studio-backend.js, connected-features.js`
- `art.list` → **artstudio** · executable in `art-studio-backend.js, connected-features.js`
- `art.save` → **artstudio** · executable in `art-studio-backend.js`

### attachments (3)
- `attachments.delete` → **research** · executable in `connected-features.js`
- `attachments.list` → **research** · executable in `connected-features.js`
- `attachments.upload` → **research** · executable in `api.js, connected-features.js`

### auth (24)
- `auth.2fa.disable` → **account** · executable in `connected-features.js`
- `auth.2fa.enable` → **account** · executable in `connected-features.js`
- `auth.2fa.resend` → **account** · executable in `login.js`
- `auth.2fa.status` → **account** · executable in `connected-features.js`
- `auth.2fa.verify` → **identity** · executable in `login.js`
- `auth.contact.code.verify` → **identity** · executable in `login.js, app.js`
- `auth.google` → **identity** · executable in `login.js`
- `auth.google.link` → **account** · executable in `connected-features.js`
- `auth.login` → **identity** · executable in `api.js, login.js`
- `auth.logout` → **account** · executable in `api.js, login.js`
- `auth.me` → **account** · executable in `api.js, book-studio.js`
- `auth.password.change` → **account** · executable in `app.js`
- `auth.password.reset.complete` → **identity** · executable in `login.js`
- `auth.password.reset.request` → **identity** · executable in `login.js`
- `auth.recovery.code.login` → **identity** · executable in `login.js`
- `auth.recovery.codes.generate` → **account** · executable in `app.js`
- `auth.recovery.contacts.add` → **account** · executable in `app.js`
- `auth.recovery.contacts.list` → **account** · executable in `login.js, app.js`
- `auth.recovery.contacts.remove` → **account** · executable in `app.js`
- `auth.recovery.contacts.sendcode` → **account** · executable in `login.js, app.js`
- `auth.register` → **identity** · executable in `api.js, login.js`
- `auth.sessions.list` → **account** · executable in `app.js`
- `auth.sessions.revoke` → **account** · executable in `app.js`
- `auth.sessions.revoke.others` → **account** · executable in `connected-features.js`

### backup (1)
- `backup.create` → **account** · executable in `feature-hubs.js, connected-features.js`

### books (13)
- `books.chapters.format` → **bookbuilder** · executable in `connected-features.js`
- `books.chapters.list` → **bookbuilder** · executable in `connected-features.js`
- `books.chapters.save` → **bookbuilder** · executable in `connected-features.js`
- `books.cover.spec` → **bookbuilder** · executable in `connected-features.js`
- `books.delete` → **bookbuilder** · executable in `connected-features.js`
- `books.editions.delete` → **bookbuilder** · executable in `connected-features.js`
- `books.editions.list` → **bookbuilder** · executable in `feature-hubs.js, connected-features.js`
- `books.editions.save` → **bookbuilder** · executable in `connected-features.js`
- `books.export.html` → **bookbuilder** · executable in `feature-hubs.js, connected-features.js`
- `books.formats` → **bookbuilder** · executable in `connected-features.js`
- `books.get` → **bookbuilder** · executable in `connected-features.js`
- `books.list` → **bookbuilder** · executable in `feature-hubs.js, connected-features.js`
- `books.save` → **bookbuilder** · executable in `connected-features.js`

### bulk (1)
- `bulk.apply` → **consolidate** · executable in `connected-features.js`

### characters (1)
- `characters.search` → **characters** · executable in `connected-features.js`

### client (1)
- `client.config` → **identity** · executable in `login.js, connected-features.js`

### consolidation (2)
- `consolidation.apply` → **consolidate** · executable in `connected-features.js`
- `consolidation.plan` → **consolidate** · executable in `connected-features.js`

### drive (4)
- `drive.link.revoke` → **account** · executable in `connected-features.js`
- `drive.link.setroot` → **account** · executable in `connected-features.js`
- `drive.link.start` → **account** · executable in `connected-features.js`
- `drive.link.status` → **account** · executable in `connected-features.js`

### editor (2)
- `editor.run` → **revision** · executable in `connected-features.js`
- `editor.runs.list` → **revision** · executable in `connected-features.js`

### entities (4)
- `entities.delete` → **world** · executable in `connected-features.js`
- `entities.get` → **world** · executable in `connected-features.js`
- `entities.list` → **world** · executable in `feature-hubs.js, connected-features.js`
- `entities.save` → **world** · executable in `api.js, connected-features.js`

### export (2)
- `export.project` → **publish** · executable in `feature-hubs.js, connected-features.js`
- `export.user` → **account** · executable in `connected-features.js`

### files (4)
- `files.index.get` → **consolidate** · executable in `connected-features.js`
- `files.index.list` → **consolidate** · executable in `connected-features.js`
- `files.ingest` → **consolidate** · executable in `connected-features.js`
- `files.ingest.batch` → **consolidate** · executable in `connected-features.js`

### health (1)
- `health` → **app** · executable in `art-studio-backend.js`

### imports (2)
- `imports.list` → **consolidate** · executable in `connected-features.js`
- `imports.register` → **consolidate** · executable in `connected-features.js`

### languages (6)
- `languages.delete` → **language** · executable in `connected-features.js`
- `languages.dictionary.export` → **language** · executable in `connected-features.js`
- `languages.generate` → **language** · executable in `connected-features.js`
- `languages.get` → **language** · executable in `connected-features.js`
- `languages.list` → **language** · executable in `connected-features.js`
- `languages.save` → **language** · executable in `api.js`

### lexicon (3)
- `lexicon.delete` → **language** · executable in `connected-features.js`
- `lexicon.list` → **language** · executable in `connected-features.js`
- `lexicon.save` → **language** · executable in `api.js, connected-features.js`

### manifest (1)
- `manifest` → **app** · executable in `book-studio.js`

### nodes (6)
- `nodes.delete` → **manuscript** · executable in `book-studio.js, connected-features.js`
- `nodes.get` → **manuscript** · executable in `book-studio.js, connected-features.js`
- `nodes.list` → **manuscript** · executable in `feature-hubs.js, book-studio.js, connected-features.js`
- `nodes.move` → **manuscript** · executable in `connected-features.js`
- `nodes.restore` → **manuscript** · executable in `connected-features.js`
- `nodes.save` → **manuscript** · executable in `api.js, book-studio.js`

### notes (13)
- `notes.delete` → **notes** · executable in `connected-features.js`
- `notes.folders.create` → **notes** · executable in `connected-features.js`
- `notes.folders.delete` → **notes** · executable in `connected-features.js`
- `notes.folders.list` → **notes** · executable in `connected-features.js`
- `notes.folders.update` → **notes** · executable in `connected-features.js`
- `notes.get` → **notes** · executable in `connected-features.js`
- `notes.list` → **notes** · executable in `connected-features.js`
- `notes.quickcapture` → **notes** · executable in `connected-features.js`
- `notes.recentlydeleted` → **notes** · executable in `connected-features.js`
- `notes.restore` → **notes** · executable in `connected-features.js`
- `notes.save` → **notes** · executable in `api.js, connected-features.js`
- `notes.search` → **notes** · executable in `connected-features.js`
- `notes.tags.list` → **notes** · executable in `connected-features.js`

### outline (1)
- `outline.generate` → **outline** · executable in `connected-features.js`

### plotissues (7)
- `plotissues.action` → **continuity** · executable in `connected-features.js`
- `plotissues.applyfix` → **continuity** · executable in `connected-features.js`
- `plotissues.delete` → **continuity** · executable in `connected-features.js`
- `plotissues.list` → **continuity** · executable in `feature-hubs.js, connected-features.js`
- `plotissues.resolve` → **continuity** · executable in `connected-features.js`
- `plotissues.save` → **continuity** · executable in `api.js, connected-features.js`
- `plotissues.scan` → **continuity** · executable in `connected-features.js`

### profile (2)
- `profile.get` → **account** · executable in `connected-features.js`
- `profile.update` → **account** · executable in `connected-features.js`

### projects (11)
- `projects.archive` → **projects** · executable in `connected-features.js`
- `projects.create` → **projects** · executable in `api.js, art-studio-backend.js, book-studio.js`
- `projects.get` → **projects** · executable in `book-studio.js, connected-features.js`
- `projects.list` → **projects** · executable in `book-studio.js, connected-features.js`
- `projects.relations.delete` → **projects** · executable in `connected-features.js`
- `projects.relations.list` → **projects** · executable in `connected-features.js`
- `projects.relations.save` → **projects** · executable in `connected-features.js`
- `projects.restore` → **projects** · executable in `connected-features.js`
- `projects.switch` → **projects** · executable in `connected-features.js`
- `projects.update` → **projects** · executable in `api.js, book-studio.js, connected-features.js`
- `projects.workspace` → **home** · executable in `connected-features.js`

### reading (2)
- `reading.state.get` → **manuscript** · executable in `connected-features.js`
- `reading.state.save` → **manuscript** · executable in `connected-features.js`

### revisions (2)
- `revisions.get` → **trash** · executable in `connected-features.js`
- `revisions.list` → **trash** · executable in `connected-features.js`

### search (4)
- `search.global` → **search** · executable in `connected-features.js`
- `search.saved.delete` → **search** · executable in `connected-features.js`
- `search.saved.list` → **search** · executable in `connected-features.js`
- `search.saved.save` → **search** · executable in `connected-features.js`

### settings (2)
- `settings.get` → **account** · executable in `connected-features.js`
- `settings.update` → **account** · executable in `app.js, connected-features.js`

### story (18)
- `story.causes.delete` → **world** · executable in `connected-features.js`
- `story.causes.list` → **world** · executable in `feature-hubs.js, connected-features.js`
- `story.causes.save` → **world** · executable in `connected-features.js`
- `story.debug.state` → **manuscript** · executable in `feature-hubs.js, connected-features.js`
- `story.extract` → **manuscript** · executable in `feature-hubs.js, connected-features.js`
- `story.facts.delete` → **characters** · executable in `connected-features.js`
- `story.facts.list` → **characters** · executable in `feature-hubs.js, connected-features.js`
- `story.facts.save` → **characters** · executable in `connected-features.js`
- `story.knowledge.list` → **characters** · executable in `feature-hubs.js, connected-features.js`
- `story.knowledge.save` → **characters** · executable in `connected-features.js`
- `story.mentions.delete` → **characters** · executable in `connected-features.js`
- `story.mentions.list` → **characters** · executable in `feature-hubs.js, connected-features.js`
- `story.rules.delete` → **world** · executable in `connected-features.js`
- `story.rules.list` → **world** · executable in `feature-hubs.js, connected-features.js`
- `story.rules.save` → **world** · executable in `connected-features.js`
- `story.threads.delete` → **outline** · executable in `connected-features.js`
- `story.threads.list` → **outline** · executable in `feature-hubs.js, connected-features.js`
- `story.threads.save` → **outline** · executable in `connected-features.js`

### timeline (3)
- `timeline.delete` → **timeline** · executable in `connected-features.js`
- `timeline.list` → **timeline** · executable in `feature-hubs.js, connected-features.js`
- `timeline.save` → **timeline** · executable in `api.js, connected-features.js`

### trash (1)
- `trash.list` → **trash** · executable in `connected-features.js`

## Art Studio AI tool coverage

The cover AI director can produce editable operation plans and execute them against the same canvas model used by the manual studio. Supported directed operations include canvas/background changes, editable shapes and text, textures, patterns, paint strokes, flood fill, gradients, eyedropper sampling, layer selection/settings, transforms, filters, duplication, deletion, and layer ordering.

**Directed painting media:** paint, pencil, ink, marker, crayon, charcoal, calligraphy, neon, spray, graffiti, pixel, eraser.

**Directed shapes:** rect, ellipse, roundrect, triangle, diamond, star, polygon, cloud, burst, moon, plant, cube, heart, arrow, speech, line.

Brush operations carry size, hardness, softness, opacity, flow, spacing, smoothing, pressure, mirror, color, secondary color, and blend behavior. Layer operations can alter name, visibility, lock state, opacity, blend mode, shadow, scale, skew, rotation, flip, position, and size.

## Separation rule

Normal app screens translate service results into writer-facing states and controls. URLs, storage identifiers, sheet/database details, and request action names are not presented as creative-interface controls. Technical inventories stay in development documentation and source code.
