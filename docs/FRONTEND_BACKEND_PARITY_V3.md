# LiteraryFriend Frontend / Backend Parity — V3

## Result

- **156 / 156 callable backend actions are assigned to a frontend product surface.**
- **156 / 156 callable backend actions have at least one frontend JavaScript callsite outside the capability registry.**
- Internal HTTP/resource routes are deliberately not presented as user controls.
- The runtime `capability-contract.js` compares the build-time backend action contract with `connected-features.js`; technical identifiers remain non-rendered.

## Frontend ownership by surface

| Surface | Callable capabilities |
|---|---:|
| account | 27 |
| app | 2 |
| artstudio | 6 |
| assistant | 2 |
| bookbuilder | 13 |
| characters | 8 |
| consolidate | 9 |
| continuity | 7 |
| home | 1 |
| identity | 9 |
| language | 9 |
| manuscript | 10 |
| notes | 13 |
| outline | 4 |
| projects | 10 |
| publish | 1 |
| research | 3 |
| revision | 2 |
| search | 4 |
| timeline | 3 |
| trash | 3 |
| world | 10 |

## Source-of-truth behavior represented

- Identity and account: registration, password/Google access, verification, 2FA, hidden password recovery, recovery codes, backup contacts, sessions/devices, profile, preferences, Google Drive, exports, and backups.
- Projects and writing: project relationships, dashboard snapshot, hierarchical manuscript items, notes/folders/tags, attachments, import indexing, batch ingest, consolidation, canonical merge, and mass update.
- Story model: entities, character search, temporal facts, knowledge/belief, mentions, plot threads, causal links, rules, extraction, debugger state, outline generation, timeline, languages, lexicon/dictionary.
- Editorial systems: persistent issues, continuity scanning, author decisions, fix application, specialized editors, AI jobs, global search, saved searches, and reading state.
- Book and art: format presets, books, editions, chapters, formatting, cover specification, interactive HTML export, editable art projects/assets, AI image generation, and AI-operated editable Studio tools.
- Portability and history: project/account export, backup, revision snapshots, Recently Deleted, and activity history.

## Callable action map

| Action | Frontend owner | Frontend callsite |
|---|---|---|
| `activity.list` | account | `js/connected-features.js:145` |
| `ai.jobs.list` | assistant | `js/connected-features.js:131` |
| `ai.request` | assistant | `js/art-ai-director.js:177` |
| `art.ai.generate` | artstudio | `js/art-studio-backend.js:130` |
| `art.asset.upload` | artstudio | `js/connected-features.js:156` |
| `art.delete` | artstudio | `js/connected-features.js:156` |
| `art.get` | artstudio | `js/art-studio-backend.js:98` |
| `art.list` | artstudio | `js/art-studio-backend.js:94` |
| `art.save` | artstudio | `js/art-studio-backend.js:83` |
| `attachments.delete` | research | `js/connected-features.js:101` |
| `attachments.list` | research | `js/connected-features.js:101` |
| `attachments.upload` | research | `js/api.js:86` |
| `auth.2fa.disable` | account | `js/connected-features.js:147` |
| `auth.2fa.enable` | account | `js/connected-features.js:147` |
| `auth.2fa.resend` | account | `js/login.js:134` |
| `auth.2fa.status` | account | `js/connected-features.js:145` |
| `auth.2fa.verify` | identity | `js/login.js:119` |
| `auth.contact.code.verify` | identity | `js/app.js:212` |
| `auth.google` | identity | `js/connected-features.js:144` |
| `auth.google.link` | account | `js/connected-features.js:144` |
| `auth.login` | identity | `js/api.js:20` |
| `auth.logout` | account | `js/api.js:23` |
| `auth.me` | account | `js/api.js:22` |
| `auth.password.change` | account | `js/app.js:214` |
| `auth.password.reset.complete` | identity | `js/login.js:151` |
| `auth.password.reset.request` | identity | `js/login.js:142` |
| `auth.recovery.code.login` | identity | `js/login.js:159` |
| `auth.recovery.codes.generate` | account | `js/app.js:213` |
| `auth.recovery.contacts.add` | account | `js/app.js:210` |
| `auth.recovery.contacts.list` | account | `js/app.js:209` |
| `auth.recovery.contacts.remove` | account | `js/app.js:212` |
| `auth.recovery.contacts.sendcode` | account | `js/app.js:212` |
| `auth.register` | identity | `js/api.js:21` |
| `auth.sessions.list` | account | `js/app.js:209` |
| `auth.sessions.revoke` | account | `js/app.js:212` |
| `auth.sessions.revoke.others` | account | `js/connected-features.js:147` |
| `backup.create` | account | `js/connected-features.js:147` |
| `books.chapters.format` | bookbuilder | `js/connected-features.js:140` |
| `books.chapters.list` | bookbuilder | `js/connected-features.js:140` |
| `books.chapters.save` | bookbuilder | `js/connected-features.js:140` |
| `books.cover.spec` | bookbuilder | `js/connected-features.js:140` |
| `books.delete` | bookbuilder | `js/connected-features.js:140` |
| `books.editions.delete` | bookbuilder | `js/connected-features.js:140` |
| `books.editions.list` | bookbuilder | `js/connected-features.js:138` |
| `books.editions.save` | bookbuilder | `js/connected-features.js:140` |
| `books.export.html` | bookbuilder | `js/connected-features.js:140` |
| `books.formats` | bookbuilder | `js/connected-features.js:138` |
| `books.get` | bookbuilder | `js/connected-features.js:140` |
| `books.list` | bookbuilder | `js/connected-features.js:138` |
| `books.save` | bookbuilder | `js/connected-features.js:140` |
| `bulk.apply` | consolidate | `js/connected-features.js:109` |
| `characters.search` | characters | `js/connected-features.js:81` |
| `client.config` | identity | `js/connected-features.js:144` |
| `consolidation.apply` | consolidate | `js/connected-features.js:110` |
| `consolidation.plan` | consolidate | `js/connected-features.js:110` |
| `drive.link.revoke` | account | `js/connected-features.js:147` |
| `drive.link.setroot` | account | `js/connected-features.js:147` |
| `drive.link.start` | account | `js/connected-features.js:147` |
| `drive.link.status` | account | `js/connected-features.js:145` |
| `editor.run` | revision | `js/connected-features.js:126` |
| `editor.runs.list` | revision | `js/connected-features.js:126` |
| `entities.delete` | world | `js/connected-features.js:92` |
| `entities.get` | world | `js/connected-features.js:92` |
| `entities.list` | world | `js/connected-features.js:78` |
| `entities.save` | world | `js/api.js:51` |
| `export.project` | publish | `js/connected-features.js:147` |
| `export.user` | account | `js/connected-features.js:147` |
| `files.index.get` | consolidate | `js/connected-features.js:108` |
| `files.index.list` | consolidate | `js/connected-features.js:104` |
| `files.ingest` | consolidate | `js/connected-features.js:106` |
| `files.ingest.batch` | consolidate | `js/connected-features.js:106` |
| `health` | app | `js/api.js:19` |
| `imports.list` | consolidate | `js/connected-features.js:104` |
| `imports.register` | consolidate | `js/connected-features.js:107` |
| `languages.delete` | language | `js/connected-features.js:122` |
| `languages.dictionary.export` | language | `js/connected-features.js:122` |
| `languages.generate` | language | `js/connected-features.js:122` |
| `languages.get` | language | `js/connected-features.js:122` |
| `languages.list` | language | `js/connected-features.js:120` |
| `languages.save` | language | `js/api.js:60` |
| `lexicon.delete` | language | `js/connected-features.js:122` |
| `lexicon.list` | language | `js/connected-features.js:120` |
| `lexicon.save` | language | `js/api.js:64` |
| `manifest` | app | `js/book-studio.js:33` |
| `nodes.delete` | manuscript | `js/book-studio.js:1482` |
| `nodes.get` | manuscript | `js/book-studio.js:1614` |
| `nodes.list` | manuscript | `js/book-studio.js:1553` |
| `nodes.move` | manuscript | `js/connected-features.js:63` |
| `nodes.restore` | manuscript | `js/connected-features.js:151` |
| `nodes.save` | manuscript | `js/api.js:34` |
| `notes.delete` | notes | `js/connected-features.js:69` |
| `notes.folders.create` | notes | `js/connected-features.js:68` |
| `notes.folders.delete` | notes | `js/connected-features.js:69` |
| `notes.folders.list` | notes | `js/connected-features.js:66` |
| `notes.folders.update` | notes | `js/connected-features.js:69` |
| `notes.get` | notes | `js/connected-features.js:69` |
| `notes.list` | notes | `js/connected-features.js:66` |
| `notes.quickcapture` | notes | `js/connected-features.js:68` |
| `notes.recentlydeleted` | notes | `js/connected-features.js:66` |
| `notes.restore` | notes | `js/connected-features.js:69` |
| `notes.save` | notes | `js/api.js:44` |
| `notes.search` | notes | `js/connected-features.js:68` |
| `notes.tags.list` | notes | `js/connected-features.js:66` |
| `outline.generate` | outline | `js/connected-features.js:74` |
| `plotissues.action` | continuity | `js/connected-features.js:116` |
| `plotissues.applyfix` | continuity | `js/connected-features.js:116` |
| `plotissues.delete` | continuity | `js/connected-features.js:116` |
| `plotissues.list` | continuity | `js/connected-features.js:113` |
| `plotissues.resolve` | continuity | `js/connected-features.js:116` |
| `plotissues.save` | continuity | `js/api.js:57` |
| `plotissues.scan` | continuity | `js/connected-features.js:116` |
| `profile.get` | account | `js/connected-features.js:145` |
| `profile.update` | account | `js/connected-features.js:147` |
| `projects.archive` | projects | `js/connected-features.js:53` |
| `projects.create` | projects | `js/api.js:31` |
| `projects.get` | projects | `js/book-studio.js:1549` |
| `projects.list` | projects | `js/book-studio.js:1407` |
| `projects.relations.delete` | projects | `js/connected-features.js:53` |
| `projects.relations.list` | projects | `js/connected-features.js:50` |
| `projects.relations.save` | projects | `js/connected-features.js:54` |
| `projects.restore` | projects | `js/connected-features.js:53` |
| `projects.switch` | projects | `js/connected-features.js:53` |
| `projects.update` | projects | `js/api.js:31` |
| `projects.workspace` | home | `js/connected-features.js:42` |
| `reading.state.get` | manuscript | `js/connected-features.js:60` |
| `reading.state.save` | manuscript | `js/connected-features.js:62` |
| `revisions.get` | trash | `js/connected-features.js:151` |
| `revisions.list` | trash | `js/connected-features.js:151` |
| `search.global` | search | `js/connected-features.js:134` |
| `search.saved.delete` | search | `js/connected-features.js:134` |
| `search.saved.list` | search | `js/connected-features.js:134` |
| `search.saved.save` | search | `js/connected-features.js:134` |
| `settings.get` | account | `js/connected-features.js:145` |
| `settings.update` | account | `js/app.js:36` |
| `story.causes.delete` | world | `js/connected-features.js:92` |
| `story.causes.list` | world | `js/connected-features.js:87` |
| `story.causes.save` | world | `js/connected-features.js:91` |
| `story.debug.state` | manuscript | `js/connected-features.js:60` |
| `story.extract` | manuscript | `js/connected-features.js:62` |
| `story.facts.delete` | characters | `js/connected-features.js:83` |
| `story.facts.list` | characters | `js/connected-features.js:78` |
| `story.facts.save` | characters | `js/connected-features.js:82` |
| `story.knowledge.list` | characters | `js/connected-features.js:78` |
| `story.knowledge.save` | characters | `js/connected-features.js:83` |
| `story.mentions.delete` | characters | `js/connected-features.js:83` |
| `story.mentions.list` | characters | `js/connected-features.js:78` |
| `story.rules.delete` | world | `js/connected-features.js:92` |
| `story.rules.list` | world | `js/connected-features.js:87` |
| `story.rules.save` | world | `js/connected-features.js:91` |
| `story.threads.delete` | outline | `js/connected-features.js:74` |
| `story.threads.list` | outline | `js/connected-features.js:72` |
| `story.threads.save` | outline | `js/connected-features.js:74` |
| `timeline.delete` | timeline | `js/connected-features.js:98` |
| `timeline.list` | timeline | `js/connected-features.js:78` |
| `timeline.save` | timeline | `js/api.js:54` |
| `trash.list` | trash | `js/connected-features.js:151` |

The full callsite list for actions used in more than one file is stored in `json/frontend-callsite-audit.v3.json`. This document is development documentation and is not rendered in the LiteraryFriend user interface.
