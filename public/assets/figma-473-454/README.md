# Passwork first-screen assets

Source: https://www.figma.com/design/cfKzXws2r1wr4VbJIzjBBD/Passwork?node-id=473-454

Imported on 2026-09-08. The visual scene is node `473:456`, at `(0, 499)` in the 1920 × 1603 first-screen frame. Its local size is 1920 × 832.

| File | Figma node | Position in scene | Rendered size |
| --- | --- | --- | --- |
| hero-cast-shadow.png | 473:458 / 473:459 | -5, -20 | 1920 × 891 |
| hero-floor-light.png | 473:461 | 11, -240 | 1898 × 1072 |
| hero-contact-shadow.svg | 485:9377 | 233.9, 713.9 including blur | 1451.2 × 71.2 including blur |

The cast-shadow PNG is the exact original asset (2560 × 1188), without cropping, additional masks, or extra blur. The floor PNG is a Figma render of the image layer alone; it includes the frame's crop and image adjustments (exposure 0.13, temperature -1, tint -0.48, shadows 1). Its original dashboard and ellipse children were excluded from the export, not from the source frame.

The contact-shadow SVG is Figma's original vector export. The unblurred ellipse is 1405 × 25 at `(257, 737)`, filled #1e1e1e, with Figma layer blur 23.1. The SVG includes the complete blur bounds; do not add another CSS blur.

The live dashboard occupies `(288, 24)`, size 1344 × 725. CSS expresses the source coordinates as percentages of the shared scene so that the dashboard and all shadow layers scale together. The existing scroll movement is shared by the dashboard and the two shadow layers.

For the requested seamless web layout, the upper base and the composited scene share one visible width: at most 1880 px with 20 px viewport insets (12 px on mobile). The original 12 px inset of the scene gradient remains inside its coordinate system, but the shared outer clip removes the mismatch with the base. The first 48–120 px of the scene blend into the base as one group; source shadow images and their placement are unchanged. The header uses the common page background instead of an opaque black rectangle.
