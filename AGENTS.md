# Local development

This checkout is the source for `reserve-passwork-copy.andrtek.chatgpt.site`.

The user requested local development without publishing updates on 2026-09-09.
Keep changes local until the user explicitly requests publication. Do not deploy
or push source changes to remote repositories as part of ordinary edits.

Use `npm run dev` for the local preview. The current preview is
`http://localhost:3000/`; check for an existing server before starting another.

On 2026-09-09, the user explicitly published the hero and second-block updates
as Site version 62 (commit `971ca29f53c07b9c96b458a2e63129d819278b08`).
The new third block in `app/fstec-section.tsx`, `app/fstec-showcase.css`, and
`app/security-feature-graphics.tsx` remains local only; keep the existing
published third block unless the user explicitly asks to publish its replacement
or removal. Later on 2026-09-09, the user removed this entire third block from the
local homepage, including its introduction and four cards. Its source files are
retained but are no longer rendered. A new local third section in
`app/product-feature-tabs.tsx` replaces it with a Fora-inspired tabbed section.
Its copy comes from Figma node `15:5629`: scenarios for IT teams, DevOps,
security, government organizations, and manufacturing. The bottom transition follows this
new section, and the `certification` anchor belongs to the second block.

# Card copy

The user prefers the text volume of the infrastructure card in `app/what-you-get.tsx`:
a main title, a short paragraph, a subheading, a second short paragraph, and a
one-line footnote. Keep the other cards close to that volume (roughly 90 characters
per body paragraph), using supported product information.

The user subsequently requested Passwork interface elements in the illustrations,
with Fora-style glass (using terminal and audit-table examples). The three cards
now use `app/what-you-get-visuals.tsx`: a minimal FSTEC document, an animated
terminal, and a centered infrastructure panel. The certificate uses the site's
Inter typography and a large 4 for its trust level; no extra floating panels.
Keep their translucent surfaces, the reference landscape, and the shared Passwork
type and icons consistent when editing them.
