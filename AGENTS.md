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

# Section spacing

Section spacing is owned by `.pw-page-frame` in `app/globals.css`: a shared gap
and matching outer padding of 200px on desktop, 144px on tablet, and 96px on
mobile. Do not add separate top/bottom section padding that doubles these gaps;
spacing inside sections and the sticky-card stack remains independent.

# Certification card borders

The five cards in `SecurityProofGrid` use one perimeter only: `CardGlow` with
`borderOnly`, aligned to the card edge. It uses the scenarios' 490px proximity,
25% light and .05 smoothing for both appearance and fading. Do not add an outer
frame or a permanent grey outline; the glow must disappear as the cursor leaves.
Their `interiorGlow={0.15}` keeps the same subtle cursor-controlled interior
light as the feature cards' 85% glass fill, while preserving the blue gradient.
The interior and perimeter share one light field and fade together in both themes.
The FSTEC card keeps the dark theme's saturated blue gradient in light mode,
with light copy, a white icon and white cursor glow.

The hero dashboard also uses `CardGlow` with `borderOnly` and the same shared
hover settings. Keep it outside the engine-managed HTML, inside the dashboard's
entrance and scroll wrappers, so the outline moves with the glass in both themes.

# Card copy

The user now prefers the Fora card structure in `app/what-you-get.tsx`: one main
title and one concise body paragraph, with the category label and one-line
footnote retained. Merge supporting details into the single paragraph; do not
add a second heading or paragraph. Use supported product information.

The user subsequently requested Passwork interface elements in the illustrations,
with Fora-style glass (using terminal and audit-table examples). The three cards
now use `app/what-you-get-visuals.tsx`: a minimal FSTEC document, an animated
terminal, and a centered infrastructure panel. The certificate uses the site's
Inter typography and a large 4 for its trust level; no extra floating panels.
Keep their translucent surfaces, the reference landscape, and the shared Passwork
type and icons consistent when editing them.
In light mode, these three illustration panels use light translucent white glass
with soft white reflections and dark text and icons. Avoid an opaque white fill
or a dark smoked/grey tint. This preference
applies to `.wy-ui-scene` (certificate, terminal and infrastructure), not the
separate `SecurityProofGrid`. Keep the blue landscape visible through the glass
and preserve the shared typing and scrolling animations.
Light-mode hero and scenario dashboards share the illustrations' translucent
white glass through `--product-light-glass`. Their sidebar and main pane add only
subtle translucent layers; do not stack opaque white fills over the outer glass.
Use the darker text and accent tokens to keep small interface copy readable.
Dashboard popovers, dialogs and toasts also use `--product-light-glass` with
26px backdrop blur and a soft white edge, rather than a separate opaque fill.

# Theme parity

Light mode mirrors dark mode's composition, gradients, glass and animations,
including the hero dashboard, all scenario demos and feature illustrations.
Use light palette tokens in `app/theme.css` and `app/theme-illustrations.css`;
use `app/theme-motion.ts` for animated colour targets instead of CSS overrides
that block Framer's transitions. Keep one shared animation engine and timeline
for both themes. Recolour canvas stars on theme changes without resetting their
positions or clock, and preserve the single fading certification-card border.

The light hero uses the dark theme's exact saturated blue sky, depth layers,
white copy, original white Russia mark and button colours, including hover
states. The header above the hero also uses white text and translucent controls,
including scrolled and open-menu states. Its palette changes only as the hero's
bottom fade reaches the navigation, with a smoothly animated masked background;
resizing must recompute this boundary. White belongs to
the lower fade into the page. Keep the light dashboard panels and their legible
dark text, and preserve the shared animations.
The light hero's lower fade uses blue and pale-blue intermediate stops before
the page colour. Avoid a neutral white overlay on navy that creates a grey band;
retain the opaque final 8px so the section boundary stays seamless.

Scenario stages also share the saturated landscape, dark overlay, pale stars
and white copy in both themes. Do not add a white wash over their background;
the demo interfaces and tabs still follow the selected page theme.
