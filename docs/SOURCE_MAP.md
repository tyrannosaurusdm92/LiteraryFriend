# LiteraryFriend Version 1 — Consolidated Source Map

## Consolidation result

The supplied Version 1 applications were merged into one LiteraryFriend workspace with one root entry file, `index.html`. Duplicate standalone shells were removed rather than retained as competing applications.

The merged application keeps:

- the general writing, organization, notes, research, outline, character, timeline, continuity, revision, and language workspaces;
- the retro Art Studio as a native LiteraryFriend view with namespaced styling;
- the Interactive Book Builder as a native LiteraryFriend view;
- the useful local literary, specialist, and workflow corpora as lazy-loaded resources;
- paper, page, icon, audio, and other useful creation assets from the supplied packages;
- user-provided starter writing retained for Book Builder;
- the uploaded V2 LiteraryFriend service source installed byte-for-byte in the `backend/` folder, with the frontend adapted to its complete callable capability set.

## Consolidation choices

- One root HTML is used for startup.
- Animated sign-in artwork is stored under `assets/`.
- Large local writing corpora are lazy-loaded so normal startup does not parse the full corpus at once.
- Art Studio and Book Builder reuse the main LiteraryFriend account session and do not expose separate deployment configuration controls.
- Story Intelligence, Organizer, Publish, the connected account surfaces, and the creative workspaces translate all 156 callable V2 capabilities into writer-facing actions. A generated parity contract and callsite audit fail the packaging check if a callable action loses its frontend owner/call path.
- Art Studio AI can execute editable manual-tool operations—including brush media, shapes, editable text styling, fills, gradients, eyedropper sampling, crop, cut/copy/paste, grouping, alignment/distribution, layer settings/order, transforms, textures, patterns, stamps, filters, and paint effects—in addition to requesting generated image concepts.
- Required client networking remains internal application wiring rather than an end-user settings panel.
- Import & Merge handles document versions and project-export versions in a project-aware way.
- No artificial padding is included to satisfy archive size. Added bytes are application code, parity data, documentation, install support, or the supplied product-blueprint source retained under `docs/source/`.

## Intentionally excluded

- duplicate application shells and duplicate root entry pages;
- retired unrelated project-specific legacy material;
- unnecessary dependency/build trees for the direct-open application;
- required external JavaScript runtimes for page turning;
- legacy service-contract assumptions replaced by the uploaded V2 contract.

## Source-of-truth preservation

The supplied `LiteraryFriend_Frontend_Product_Pitch_Project_Plan.docx` is retained under `docs/source/`. It is development reference material, not rendered in the normal Docs & Licenses surface. The supplied backend is installed at `backend/LiteraryFriend_Backend.gs`.

## Versioning

The merged application remains Version 1 because it is still the pre-deployment consolidated release.
