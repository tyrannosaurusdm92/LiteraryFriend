# LiteraryFriend Version 1 — Merge Source Map

## Inputs merged

1. `LiteraryFriend_Frontend_v1.0.0 (1).zip` — strongest general writing/organization shell plus a large local writing-intelligence corpus.
2. `LiteraryFriend_v1.zip` — cover/book-art studio and additional specialist corpus packs.
3. `LiteraryFriend_v1 (1).zip` — newest integrated writing shell and Interactive Book Builder, local paper/audio assets, short-story starter, and literary corpus.
4. `LiteraryFriend_Backend.gs` — authoritative server contract; copied unchanged.
5. `design.txt` — authoritative visual/font/palette rules.

## Consolidation strategy

The final package keeps one `index.html` and one primary application shell. Duplicate standalone shells were not retained as competing applications.

- General writing/organization features are consolidated into the main LiteraryFriend navigation.
- Book Builder is a native view mounted by `js/book-studio.js`.
- Art Studio is a native navigation view whose self-contained retro editor is mounted inside the main shell; it keeps its own namespaced CSS so its distinctive studio look does not overwrite the rest of LiteraryFriend.
- Assistant corpora are lazy-loaded from JavaScript packs only when searched, avoiding a 100+ MB startup parse.
- Backend tools use the existing Apps Script action names. No `chat` or `image.generate` server action was invented because those routes are absent from the supplied backend.

## Removed or intentionally not restored

- retired project-specific legacy dataset material
- duplicate app entry pages and duplicate application shells
- dependency/build trees that are unnecessary for the one-HTML runtime
- remote StPageFlip runtime dependency
- unsupported assumptions that the supplied backend provides generative-chat or image-generation routes

## Useful retained material

- literary corpus index and four lazy literary corpus partitions
- seven specialist/workflow corpus partitions from the other supplied versions
- Art Studio implementation and book-cover assets
- Book Builder, paper textures, page-turn audio, trim presets, page schema, and short-story starter
- existing writer editor, organization, accessibility, continuity, timeline, entity, language, revision, and data-portability features

## Versioning

Everything remains Version 1 because this is a pre-deployment consolidation, not a post-release major/minor upgrade.
