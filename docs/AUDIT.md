# LiteraryFriend Version 1 — Consolidation & Privacy Audit

## Required structure

PASS — exactly one HTML file exists in the project root: `index.html`.

PASS — the only additional HTML artwork is stored under `assets/`, not in the root.

PASS — the requested top-level folders are present: `js`, `css`, `json`, `assets`, `docs`, and `backend`.

## Account-first startup

PASS — the account gate appears before the workspace.

PASS — the initial account gate shows exactly four access actions: Download app, Sign in, Sign up, and Skip login. Sign-in/sign-up fields are revealed only after their matching action is chosen, with Show/Hide password controls.

PASS — Google account access is supported when Google identity is configured for the deployed account service.

PASS — optional two-factor sign-in can use a verified backup email/phone; registration can separately require primary-email verification before entry.

PASS — Forgot password appears only inside the expanded Sign in flow; reset request/completion and recovery-code sign in remain hidden beneath it until requested.

PASS — Sign-in/sign-up/recovery fields use browser-standard autocomplete tokens for password-manager support. Account supports multiple recovery email addresses and phone numbers, contact verification, recovery codes, password changes, and signed-in device management.

## Frontend privacy

PASS — normal application screens do not display deployment URLs, library identifiers, raw service action names, connection-health controls, or an advanced service console.

PASS — Art Studio and Book Builder use the shared account session instead of exposing separate connection configuration.

NOTE — LiteraryFriend is a static browser application. The public service address required for network requests remains implementation wiring in the JavaScript client and can inherently be inspected through source code or browser network tools; it is not displayed as user-facing configuration.

## Project separation, import, and consolidation

PASS — every working record is scoped to an active project, and the top-bar project selector switches the working context without combining unrelated projects.

PASS — Import & Merge accepts multiple writing, structured-data, reference, image, audio, video, ebook, and document formats and sorts them into manuscript or research workflows.

PASS — DOCX content is extracted locally when supported, while the original file is retained as an attachment.

PASS — related draft/final/revision files can be grouped and consolidated while recovering substantially unique passages.

PASS — an earlier LiteraryFriend project export can merge into the active matching project by record identity, while a multi-project package that does not match the active project is refused instead of being mixed into it.

PASS — Mass Update applies deliberate canon/name/terminology replacements across editable records in the active project.

## Story creation and editing

PASS — project types cover novels, series, short fiction, screen work, comics, audio fiction, nonfiction, TTRPGs, video games, visual novels, MMORPGs, and multi-platform/transmedia worlds.

PASS — manuscript editing includes chapter/scene organization, chapter-wide formatting, snapshots, read aloud, dictation where supported, attachments, search/replace, and export workflows.

PASS — Characters provides project-scoped searchable character records.

PASS — Outline supports editable beats and flexible structure scaffolds linked to manuscript documents.

PASS — Plot Holes & Continuity can scan for concrete warning signs, track manual issues, highlight exact linked excerpts, and apply an explicit saved fix.

PASS — Revision Lab and AI Editor provide editing assistance. AI Editor uses an on-device browser language model when available and otherwise uses LiteraryFriend's local editor analysis.

PASS — Language Lab can build and edit constructed languages with sound rules, phonotactics, orthography/writing systems, morphology, grammar, syntax, tense/aspect/mood, pronouns, numbering, naming, idioms, dialects, historical notes, and searchable lexicon entries.

## Documentation and legal visibility

PASS — README, Tutorial, and License/Attribution are available inside the Docs & Licenses view and remain as files in `docs/`.

PASS — redistribution notes explicitly avoid claiming exclusive ownership of third-party concepts, references, fonts, licenses, or upstream material.

## Design

PASS — the literal `LiteraryFriend` wordmark uses Updock; normal interface text uses reading/system fonts.

PASS — the cyan-centered lime-green/cyan/Dodger-blue design system remains intact.

PASS — the persistent footer credit reads: `Project Compiled by William Saville AKA The Transgender T-Rex #TheTransgenderTRex`.

PASS — phone and tablet layouts remain desktop-derived and support portrait/landscape rotation rather than becoming a separate simplified app.

## Validation

Final packaging validation checks JavaScript syntax, JSON parsing, local references, root HTML count, required folders, supplied server-file byte identity, public UI implementation-detail scans, font packaging, archive integrity, and compressed size.

## V3 full frontend parity pass

PASS — the uploaded V2 service file is installed byte-for-byte as `backend/LiteraryFriend_Backend.gs`.

PASS — all 156 callable V2 backend capabilities are assigned to a frontend owner and all 156 have an executable frontend call path. The generated non-rendered build contract is `js/capability-contract.js`, the machine-readable contract is `json/backend-feature-contract.v3.json`, and exact frontend callsites are audited in `json/frontend-callsite-audit.v3.json` / `docs/FRONTEND_BACKEND_PARITY_V3.md`.

PASS — Story Intelligence exposes the structured story model as writer-facing views for provenance, temporal facts, character state/knowledge, chronology, revelation order, plot-thread lifecycle, causality, rules, the Scene × thread Matrix, state debugging, and evidence-backed issues.

PASS — Revision provides specialized continuity, plot, character, world, timeline, developmental, line, copy, POV, series, causality, setup/payoff, and knowledge analysis rather than one undifferentiated analysis action.

PASS — Organizer and Publish are first-class project-scoped surfaces. Publish covers project packages, interactive HTML/JSON book handoff, cover-art return paths, backups, and activity history.

PASS — Art Studio AI can execute editable canvas operations through the studio model: paint, pencil, ink, marker, crayon, charcoal, calligraphy, neon, spray, graffiti, pixel, eraser, flood fill, gradients, eyedropper sampling, shapes, editable text styling, textures, patterns, layer selection/settings, crop, cut/copy/paste, grouping, ungrouping, alignment, distribution, transforms, filters, reusable stamps, baked paint effects, duplication/deletion, and front/back ordering. Brush-directed operations support brush programs, size, hardness, softness, opacity, flow, spacing, smoothing, pressure, mirror behavior, and blend modes.

PASS — normal creative dialogs use human labels and named record selectors. Deployment URLs, folder identifiers, raw action names, and raw request/response payloads are not exposed as creative controls.

PASS — PWA manifest, install flow, and service worker are present so Download app can use the browser install experience when LiteraryFriend is served from an installable origin.

PASS — the supplied frontend product blueprint is preserved under `docs/source/` as a development source of truth and is not shown as normal application UI.
