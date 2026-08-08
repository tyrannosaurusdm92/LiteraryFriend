# LiteraryFriend Art Studio — Manual / AI Tool Parity V3

Art Studio now exposes the same editable cover-making vocabulary to the AI tool composer that the user has manually. **Build with Studio Tools** requests a structured operation plan; **Add Tool Pass** appends another editable design pass without replacing the current composition. Image generation remains available separately for generating source imagery that can be inserted as a layer.

## AI-operable drawing and color tools

- Paint, pencil, ink, marker, crayon, charcoal, calligraphy, neon, spray, graffiti, pixel, and eraser strokes.
- Brush programs plus size, hardness, softness, opacity, flow, spacing, smoothing, pressure, mirror behavior, secondary color, and blend mode.
- Bucket/flood fill, gradients, eyedropper sampling, exact color selection, and palette-driven color references.
- Geometric/decorative shapes with editable fill, stroke, opacity, bounds, and rotation.
- Editable text creation and text styling including font, size, emphasis, alignment, tracking, line height, bend, fill, outline, highlight, gradient, and shadow.

## AI-operable layer and editing tools

- Select a layer by name, index, or type.
- Rename, show/hide, lock/unlock, opacity, blend, and shadow.
- Move, resize/stretch, skew, rotate, flip, position, and reorder.
- Non-destructive normalized image crop and crop reset.
- Cut, copy, paste, duplicate, delete, layer up/down, front/back.
- Group, ungroup, align left/center/right/top/middle/bottom, and distribute horizontally/vertically.
- Texture and pattern layers, filters, reusable stamps when available, and supported baked paint effects (grayscale, invert, sepia, sharpen, emboss, edge).

## Manual parity controls added to the Studio

The inspector includes explicit alignment, grouping/ungrouping, distribution, clipboard, duplicate, and image-crop controls. Image crop is stored on the image layer and rendered from the selected source rectangle rather than permanently destroying the original source image.

All AI tool-composition output remains represented as Studio layers or paint-layer pixels so the user can keep editing the result by hand.
