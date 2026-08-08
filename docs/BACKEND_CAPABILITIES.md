# LiteraryFriend Version 1 — Existing Backend Capability Map

The supplied `backend/LiteraryFriend_Backend.gs` is authoritative. This frontend does not require a new backend.

## Public actions

`health`, `manifest`, `client.config`, `auth.register`, `auth.login`, `auth.google`, `auth.password.reset.request`, `auth.password.reset.complete`, `auth.recovery.code.login`, and `auth.contact.code.verify`.

## Authenticated action families

- Authentication/session: logout, current user, password change, list/revoke sessions, recovery-code generation, recovery contact list/add/remove/send-code.
- Profile/settings: profile get/update, settings get/update.
- Projects/directories: project create/update/get/list/archive/restore; node save/get/list/move/delete/restore.
- Notes: save/quick capture/get/list/search/delete/restore/recently deleted; folders create/update/list/delete; tag list.
- Files/imports: attachment upload/list/delete; import register/list.
- Story data: entities save/get/list/delete; timeline save/list/delete; languages save/get/list/delete; lexicon save/list/delete.
- Continuity: plot issue save/list/resolve/delete/scan.
- Discovery: global search and saved-search save/list/delete.
- Reading: reading-state get/save.
- Portability: project export, user export, backup create.
- History: trash list and activity list.

## Frontend coverage

Normal LiteraryFriend views use local IndexedDB first and the existing API client maps compatible project, document/node, note, entity, timeline, language, lexicon, and plot-issue records to backend routes. Attachment upload is implemented in the API client. The **Cloud & Account** view exposes health/account/recovery/session tools, remote lists/search, exports/backup, reading state, and an advanced runner containing every backend action name for capabilities that do not need a dedicated everyday UI.

## Deliberate non-routes

The supplied backend does not define `chat` or `image.generate`. The Art Studio therefore uses local prompt refinement and a deterministic editable SVG concept generator rather than requiring backend changes or falsely reporting server-generated art.

## Deployment links

Web app:
`https://script.google.com/macros/s/AKfycbxs5m-v5PQt2LZHO9T-OEckMim_jVDtvOgGeQJzR_bQ34FhbHvMFWssi1GQnBnWosXM/exec`

Library:
`https://script.google.com/macros/library/d/1m--huLkqouxXGKHTj2gTpV19li8tS1IO_RLEbgmy3a8wUcvljt9dlLdD/1`
