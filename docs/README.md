# LiteraryFriend — Version 1

LiteraryFriend Version 1 is a free-to-use, local-first literary creation and organization workspace. It consolidates the three supplied Version 1 frontends into one application shell with one entry point: `index.html`.

Project Compiled by William Saville AKA The Transgender T-Rex #TheTransgenderTRex

## Open it

Open `index.html` directly in a modern browser. No build step, package manager, framework server, paid API, or account is required for the local writing tools. Local data is stored in the browser. The supplied backend can be enabled for account/cloud features.

The application is intentionally packaged with only these top-level folders:

```text
index.html
js/
css/
json/
assets/
  audio/
  images/
docs/
backend/
```

## Consolidated workspaces

- Writer Desktop dashboard and project organization
- manuscript/chapter/scene editor with autosave, formatting, read-aloud, dictation support, focus tools, snapshots, tags, links, and attachments
- notes and journal, folders, quick capture, research, outline, characters, world/lore, timeline, continuity/plot issues, constructed languages and lexicon, revision analysis, recently deleted items, global local search
- Literary Assistant with deterministic analysis plus a large, lazy-loaded local literary/specialist corpus; it can assemble project-aware prompts without requiring a paid AI service or pretending the retrieval corpus itself is a language model
- Book Builder with trim presets, page design, cover setup, JSON page import, paper textures, reader mode, local page-turn mode, page audio, local drafts, and export
- Art Studio for book covers and book art with trim/bleed/spine tools, text/image/shape/paint layers, effects, local project files, prompt refinement, and a free local concept-art generator
- Cloud & Account control center that exposes the capabilities already present in the supplied Apps Script backend, without adding backend routes
- Documentation viewer inside the app for this README, license/attribution notes, source map, backend capability notes, and audit

## Backend — used as supplied

Web app endpoint:
`https://script.google.com/macros/s/AKfycbxs5m-v5PQt2LZHO9T-OEckMim_jVDtvOgGeQJzR_bQ34FhbHvMFWssi1GQnBnWosXM/exec`

Apps Script library reference:
`https://script.google.com/macros/library/d/1m--huLkqouxXGKHTj2gTpV19li8tS1IO_RLEbgmy3a8wUcvljt9dlLdD/1`

`backend/LiteraryFriend_Backend.gs` is the supplied backend source and is kept unchanged. The frontend is written against its existing action contract. The app does not require a replacement backend.

## Backend capability coverage

The supplied backend reports support for accounts, password authentication, Google sign-in, multi-device sessions, multiple recovery email/phone contacts, one-time recovery codes, email password reset, optional SMS webhook integration, projects/directories, notes/folders/tags, attachments, imports, exports, backup, global search, plot issue tracking, timelines, entities, fantasy languages/lexicon, read-aloud state, trash, and audit/activity history. The Cloud & Account view gives direct access to these existing routes, while the normal workspaces sync their matching local record types.

Some public authentication flows such as Google sign-in still depend on the deployment being configured with the corresponding backend/provider settings. LiteraryFriend does not fabricate a local substitute for a server capability.

## Direct-file compatibility

Large literary corpus JSON was converted into lazy JavaScript data packs so assistant search can work when the app is opened as `file://.../index.html`. Templates also have a bundled JavaScript copy. The Book Builder uses its included local reader mode and does not require an external page-turn CDN.

Google Fonts is the only optional visual network request: if unavailable, the `LiteraryFriend` wordmark falls back to a script font stack. Application functionality does not depend on the font service.

## Responsive layout

Desktop keeps the full two-column early-2000s workspace. Landscape tablets retain a compact desktop layout. Smaller tablets/phones use the same desktop-inspired controls with a collapsible navigation drawer, touch-sized controls, and safe overflow rather than switching to a separate mobile application.

## Brand rules

Only the literal displayed word `LiteraryFriend` uses Updock. The rest of the UI, book pages, editor, Art Studio controls, and documentation use normal system/reading fonts. The app follows the supplied cyan-centered green–blue palette and high-contrast text pairings.

## Free-use behavior

The local app has no paywall, subscriptions, usage meter, purchase screen, or required commercial AI key. Optional backend hosting and any external service a user independently chooses are separate from the local application.

## Starter writing

The Book Builder starter uses the user-provided short stories **Freedom Changes Everything** and **The Farmer's Plea**. Retired project-specific legacy dataset material was not restored.

## Version

This package remains **Version 1** because it has not been deployed.
