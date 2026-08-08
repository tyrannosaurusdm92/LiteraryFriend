# LiteraryFriend Version 1 — License, Attribution, and Source Notes

This file is intended to keep redistribution transparent. It is not a claim that every idea, reference, corpus record, font, or upstream work used during development is exclusively owned by the LiteraryFriend project.

Project Compiled by William Saville AKA The Transgender T-Rex #TheTransgenderTRex

## LiteraryFriend integration

The consolidated application shell, integration code, project schema, local workflows, UI glue, and merge-specific code in this package were created for the LiteraryFriend project from the supplied Version 1 materials. User-provided writing, icons, artwork, and backend remain the user's project materials.

Do not treat this notice as relicensing third-party material whose own license applies independently.

## Local writing-intelligence corpora

The merged package retains the useful local literary/specialist corpus packs from the supplied LiteraryFriend versions. Earlier package documentation states that portions were derived from a prompt-library/intelligence collection with upstream references that included MIT- and Apache-2.0-licensed material. Preserve upstream attribution/license records when redistributing any underlying material for which those licenses require it.

The corpora are data/retrieval material. Their presence is not a claim that LiteraryFriend created or exclusively owns every underlying writing concept, prompt pattern, taxonomy, public-domain fact, or referenced work represented in those records.

## Writer software used as design/feature references

Earlier LiteraryFriend repository audits documented feature-study or concept review of a number of writing/note projects. Projects with copyleft or unclear/no licenses were not copied wholesale into this standalone package. Permissive projects were used as references/pattern studies rather than repository dumps.

Documented references included: AppFlowy (AGPL-3.0), Trilium (AGPL-3.0), Logseq (AGPL-3.0), WriteMelo (GPL-3.0), note-gen-dev (GPL-3.0), Notesnook (GPL-3.0), open-notebook (MIT), show-me-the-story (MIT), GemType (Apache-2.0), Recurrent-LLM (MIT), Vybe.app (MIT), WorldScript-Studio (MIT), claude-obsidian (MIT), Foam (MIT), grammar-ai (Apache-2.0), Memos (MIT), Spellbound (MIT), Typollama (MIT), and additional repositories whose earlier audit found no clear top-level license. See `docs/SOURCE_MAP.md` and the preserved audit history for treatment notes.

## Novelium and similar applications

The request that LiteraryFriend behave similarly to Novelium and similar programs is treated as a product/workflow reference only. This package does not state or imply affiliation, endorsement, or ownership of those third-party products, names, interfaces, trademarks, or code.

## Updock / Google Fonts

The literal displayed `LiteraryFriend` wordmark may load Updock through Google Fonts. Font licensing remains governed by the font's upstream license and Google Fonts distribution terms. No font binary is bundled in this package. If the font cannot load, the application remains functional with fallback typography.

## Page-turn behavior

An earlier Book Builder version evaluated StPageFlip / `page-flip` (MIT) and could load its published browser bundle from a CDN. The final consolidated direct-file build does **not** depend on or load that CDN. It uses the locally implemented reader/page-turn fallback. Historical research is retained in `docs/PAGE_FLIP_RESEARCH.md` for attribution/transparency; it is not a declaration that the upstream library is bundled.

Upstream project historically evaluated: `https://github.com/Nodlik/StPageFlip`

## Page-turn audio and paper textures

The included page-turn audio and local paper texture assets are retained from the supplied LiteraryFriend packages and are used by the integrated Book Builder. Any user-imported images, covers, manuscripts, fonts, or audio remain governed by their own rights and licenses.

## User writing

`json/favorite-short-stories.json` contains user-provided writing used as an editable Book Builder starter, including **Freedom Changes Everything** and **The Farmer's Plea**. It is not presented as third-party sample content.

## Backend

`backend/LiteraryFriend_Backend.gs` is the supplied backend source. This merge does not add server routes or claim authorship beyond the rights already held by its owner. The two deployment references are recorded in `backend/BACKEND_LINKS.txt`.

## No license laundering

Files with their own licenses retain those licenses. References to upstream licenses are attribution/compliance notes, not an attempt to absorb third-party rights into a blanket LiteraryFriend ownership claim.
