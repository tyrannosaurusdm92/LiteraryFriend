# Page-Flip Research — Historical Note

## StPageFlip / page-flip

An earlier LiteraryFriend Book Builder version evaluated StPageFlip (`page-flip`), an MIT-licensed HTML page-turn library, because it supports touch/mouse page turns, portrait/landscape behavior, shadows, and hard/soft pages.

Upstream project: `https://github.com/Nodlik/StPageFlip`

The earlier prototype could load `page-flip@2.0.7` from jsDelivr. The final consolidated Version 1 package intentionally removes that runtime dependency so `index.html` does not need an external JavaScript library to open or use the Book Builder. The local Book Builder page-turn/reader implementation is the active default.

The code still contains defensive detection for `window.St.PageFlip`; this allows an owner/developer to experiment with the upstream library separately without making it a required dependency. No StPageFlip browser bundle or upstream repository is bundled in this distribution.

## Other alternatives considered historically

React wrappers were not appropriate because the requested application uses a plain single-HTML entry and no build pipeline. Other polished flipbook libraries had less suitable licensing or heavier PDF/image-oriented dependencies for an editable writing application.

## Final decision

Use LiteraryFriend's local reader/page-turn mode by default. Retain this research note solely for transparency and historical attribution.
