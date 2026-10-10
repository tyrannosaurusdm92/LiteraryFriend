# Literary Friend

Literary Friend uses the supplied Luxury Editor App Shell as its interface. It is a responsive, offline-first writing workspace with document channels, side-by-side writing studios, tasks, reminders, a movable Unicode keyboard, font uploads, and local writing Helper tools. It has no generative AI interface or AI backend connection.

## Running

Upload these exact files to a static HTTPS website, preserving the folders, and open `index.html`. For development, you can use any standard static web server. On HTTPS, install the PWA when offered. Its shell files are cached for offline use; large research assets are loaded on demand. Loading the entry page directly with a `file://` URL is not recommended, because WebAssembly, PWA and reference lookup require HTTP(S).

## Editing and storage

The left rail creates workspaces. Each workspace contains writing channels and two-pane studios. Write in the center editor, and use the top formatting toolbar. Documents, tasks and notes save locally with IndexedDB and a browser storage fallback. Settings let you export/import your local library, import individual TXT or HTML documents, and upload personal TTF/OTF/WOFF/WOFF2 fonts.

The floating on-screen keyboard can move, collapse, split, switch language, and enter Latin Extended and combining Unicode characters. Panels have side/corner resize handles (touch/mouse/stylus), and the handles can be adjusted with arrow keys; holding Shift changes the keyboard step. Button and label sizing responds to panel widths. On tablets and phones the pane positions adapt to the viewport.

## Helper

Select **Helper** from the main toolbar or Planner to access:

* **Draft scan** — word counts, reading time, sentence length, repeated words, filler candidates, and local WebAssembly-powered metrics
* **Find & replace** — counts and replaces text in the current draft while preserving surrounding element formatting
* **Outline** — opens current workspace channels and exports an outline
* **Continuity** — rule-based unresolved-marker and spelling-variant checks across the local library
* **References** — searchable titles and tags from the preserved Writer Helper catalog, fetched only when requested
* **Glyph studio** — pen/mouse/touch glyph drawing with editable strokes; SVG and JSON export
* **Book layout** — page trim/margin/size settings and an HTML page prepared for printing

The original large Writer Helper library is preserved under `script/js/helper/`, with its `ai-brain` module/file terminology renamed to `helper`. Its original creative/world-model data are **retained for compatibility** but are **not loaded during startup and not used to generate text**. The provider bridge refuses AI-generation calls. The active tools are deterministic, local editorial features.

## WebAssembly and no Python

`script/wasm/text-diagnostics.wasm` is a compiled browser-native WASM module; it is called through `script/js/wasm-diagnostics.js`. It is not a disguised Python script or bundled Python runtime. The distribution includes no `.py`, `.pyc`, or `.ipynb` files, and does not require Python, Pyodide, Node, a custom backend build, or a Python package installation. Python scripts from third-party desktop repositories that cannot run in the browser were omitted rather than falsely renamed or represented as compiled WASM. Full FontForge Python scripting and desktop Pandoc conversion are not implemented in-browser. The included repository sources are reference materials, not automatically executed browser code.

## Existing backend only

The only configured account endpoint is:

`https://script.google.com/macros/s/AKfycbyzbjqonkGubp-g2XnLr5vSgDc6EnYreGBS-hSBRGIdMRPFarQxeGTmOdSN9nBRp3eF/exec`

It uses the supplied backend's `?action=bridge` iframe + `LF_RPC_REQUEST`/`LF_RPC_RESPONSE` postMessage contract. **No backend is included or modified.** The frontend must be hosted at the HTTPS origin authorized in the supplied Apps Script backend, and that deployment must be accessible. Neither the package nor a local file can change that backend's deployment configuration.

Log in via Settings → Account connection, then use **Sync local → cloud** or **Restore cloud → local**. These are **explicit manual** backup/restore actions, not automatic simultaneous document merging or real-time collaboration. Cloud snapshots are stored as multiple notes via the backend's `notes.save` action, and recovered via `notes.list` and `notes.get`. Export a local backup before cloud restore. The backend enforces its own account, verification and per-record limits. Cloud availability and end-to-end compatibility cannot be proven without a live login on the authorized origin.

## Source preservation

The package integrates a browser-facing subset of Literary Friend, Writer Helper, word processing tools, and FontForge-inspired glyph workflows. Reference snapshots of Word clones, Wordcraft and FontForge source material are retained under `assets/` with their licenses where present. These snapshots are not functioning desktop applications on the web. Browser source used by the live app is under `script/js`; reference materials are kept separate so they do not block startup. See `docs/SOURCE_NOTES.md` and `docs/TESTING.md`.
