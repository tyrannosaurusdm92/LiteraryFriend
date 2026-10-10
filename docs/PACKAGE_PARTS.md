# Full project package — five ZIP parts

Because the complete source-and-asset bundle is too large for a single attachment, it is distributed as five normal ZIP archives. **Extract all five into the same destination directory**, choosing merge folders when asked. Do not nest each part in a separate folder.

1. `LiteraryFriend_01_Core_WASM.zip`: complete working web app, PWA, Helper UI and diagnostics, local search catalog, existing Literary Friend CSS/JS/JSON sources, Wordcraft/Word clone/FontForge reference snapshots
2. `LiteraryFriend_02_Helper_Creative_Library.zip`: preserved large optional `helper-creative.js`, not loaded by the app or used for AI generation
3. `LiteraryFriend_03_Helper_World_Library.zip`: preserved large optional `helper-world-model.js`, not loaded on startup
4. `LiteraryFriend_04_Converter_Linux_Reference.zip`: optional desktop Linux converter binary supplied in old Literary Friend source, not executable by a web browser
5. `LiteraryFriend_05_Converter_Mac_Reference.zip`: optional desktop macOS converter binaries supplied in old Literary Friend source, not executable by a web browser

Only part 1 is needed to **run** the browser application. Parts 2–5 preserve source/reference library assets and the total original supplied material. Their inclusion is not a claim that desktop binaries can run inside a web page. No Python source, Python runtime or Apps Script backend file is bundled.
