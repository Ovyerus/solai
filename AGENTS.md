# Solai project handoff

## Working model

This is a static Astro website. Editable source lives in `src/`, and unchanged public assets live in `public/`. `dist/` is generated, ignored build output; never edit it directly. Keep scoped changes in the existing Astro, CSS and vanilla JavaScript files. Do not introduce client frameworks, server adapters or extra dependencies unless requested. Enter the Node.js/pnpm shell with `nix develop` (or nix-direnv), and use pnpm for dependencies and the development/build/preview commands in `README.md`; do not deploy as part of ordinary editing. Keep `pnpm-lock.yaml` as the only dependency lockfile. Git and Jujutsu are colocated; preserve both `.git/` and `.jj/`.

Use Conventional Commit descriptions for named changes, such as `feat: ...`, `fix: ...`, `refactor: ...`, `build: ...` and `chore: ...`. After completing and verifying a change, describe it and run `jj new` before handing back. Always leave `@` as a fresh, empty working change rather than leaving completed work checked out.

Styling uses Tailwind CSS v4 and `@tailwindcss/vite`. `Page.astro` imports the single `src/styles/main.css` entry. Keep complete utility strings in Astro and JavaScript DOM builders; do not construct utility names dynamically. Reuse the `solai-*` semantic colour utilities and `font-sans`/`font-mono`. Keep native CSS for font definitions, base behavior, artwork, registered custom properties and genuinely complex ramp motion—not a second ordinary styling system. Preserve inclusive breakpoints with `[@media(max-width:650px)]:` (and corresponding widths), not exclusive `max-[650px]:` variants. Compare rendered styles when translating old selectors: their specificity may have overridden seemingly active declarations.

## Baseline to preserve

- Full-width mountain/lake hero with a transparent overlaid header and small static left-shore skyline
- Soft, Dither and ASCII treatments, plus pointer ASCII reveal; render on changes, without a perpetual animation loop
- Sora for the main interface, Iosevka Solai for technical/monospace content
- Use the single canonical outlined wordmark in `src/assets/solai-wordmark.svg` through `<Wordmark />` in `src/components/Wordmark.astro` for hero/header/footer branding. Preserve the Sora 500 lettering and enlarged, raised geometric eight-ray star with heavier rays, baked into the master under its `2390×900` viewBox. There are no size variants or selector props; do not restore the smaller star or `small` prop. Keep existing placement widths, theme-aware ink/accent and accessible labels on containing headings/links. Never reconstruct it with live text or a Unicode star, which iOS can render as emoji.
- Five flavours and stable internal IDs: Tide=`blue`, Ember=`alter`, Dusk=`violet`, Viridian=`green`, Bloom=`rose`; each has Dark and Light variants
- Native header theme dropdown paired with the Dark/Light toggle at the right edge and synchronized with the home flavour cards; no palette bar below the hero; Home, Palette and Guide share flavour/mode persistence and navigation context
- Keep main navigation visible while scrolling Home, Palette and Guide. Home uses a fixed overlay without changing hero geometry: transparent at the document top, solid theme surface after scrolling. Palette/Guide use a solid sticky header. Preserve measured anchor clearance for wrapped headers and the negative scroll margins that keep visible navbar controls from scrolling the document when focused. No perpetual animation/scroll loop; no-script navigation stays readable.
- Preserve the approved Linework interface across Home, Palette and Guide: flat neutral working surfaces, fine dividers, 2px rectangular corners, inset segmented groups with accent/ink active choices, restrained selected fills, independent keyboard-focus outlines and a thin accent underline for current-page navigation. Keep circular dots, pill switches and the flush full-bleed hero. The temporary comparison page is removed; do not restore it or the alternate treatments unless requested.
- Responsive layout, keyboard-operable tabs and controls, accessible labels, reduced-motion behavior, clipboard fallback and working downloads
- `/palette/` shows one twelve-family shared base table, then all five flavour tables with `fg`, `bg`, `coShades`, `accent` and `coAccent`, regardless of the site's selected flavour. Dark/Light updates all six tables; flavour changes preserve table DOM, focus, inspected grades and scroll positions. Selected-theme CSS copying remains explicitly labelled. Roles & accents and Selected contrast/accessibility sections are removed; semantic explanations belong on `/guide/`, while contrast checks remain in the data/generator. Preserve compact pseudo-table rows with shared grade headings, OKLab gradients, stop dots and independent colour-filled preview windows. On row entry, place the window at the new stop before fading in; never animate in from its cached column. Row exit fades opacity without intercepting clicks. Keep continuous scrubbing, exact-value copying, fixed 150ms Glide (`cubic-bezier(.22, .68, 0, 1)`), one keyboard stop per row, native touch scrolling and reduced motion.
- `/guide/` explains colour meanings across eight contexts with fixed approved mappings in `src/data/guide.js`. Each section has one title and a consolidated description; do not restore named treatment subheadings, separate summaries or repeated proposal disclaimers. The page-level export/provenance note remains. Keep the example beside the colour-role ledger on wide screens and stack vertically on narrow screens. Code is clean and mostly monotone, using contrast for definition and limited accents for meaning. Editor chrome keeps its neutral active line/caret/gutter, violet search text plus underlines, and six-colour rainbow bracket pairing by nesting depth. Preserve readable glyph/background contrast, theme selection, section deep links and truthful unavailable-data/no-script states. Treatment selectors, alternatives and per-section treatment URL handling are removed. Mappings remain unexported; do not publish aliases without updating the generator/data/exports together.
- Retain `/guide-editor/` for future colour tuning. Its ten flavour/mode drafts and version-2 proposal export remain independent of the canonical guide and published palettes. Keep it unlinked; do not remove the tool as cleanup or apply its drafts without an explicit request.

The proposed high-rise balcony is NOT integrated. Do not silently substitute it when making unrelated changes.

## Palette integrity

`public/assets/palettes.json` is canonical schema v2: `flavors[id].modes.dark/light` contains each variant's parameters, primitive ramps, proposed semantic roles, provenance and selected contrast checks. All five flavours share Tide's twelve base families in each mode. Tide preserves the exact Blue dark/light upstream sets. Ember now preserves only Dolch Alter's five custom ramps (`fg`, `bg`, `coShades`, `accent`, `coAccent`); its base colours are intentionally normalized to Tide. Its metadata is `provenance: "adapted"`, `upstreamVariant: null`, with `customUpstreamVariant` naming the original Alter variant. Do not restore the old separate Ember base colours or claim it is wholly source-exact. Dusk/Violet, Viridian/Green and Bloom/Rose remain independent studies; all UI semantic mappings are proposed. Preserve status meanings and the five internal IDs.

`python3 palette-source/build_flavors.py` regenerates the live JSON, `public/downloads/flavor-studies.json`, `public/downloads/flavors.css`, `public/downloads/flavors.tailwind.css` and `src/styles/themes.css`; read `palette-source/README.md` first. This optional standard-library tool is separate from Astro builds. The other palette tools remain historical. Never overwrite Solai metadata with historical output. If colors or roles change, update the generator, default CSS where applicable, data and exports together, and recalculate actual contrast pairings. Keep the family Tailwind export and browser's selected-variant serializer in `palette-shared.js` synchronized: 187 canonical primitive stops + 32 semantic roles, `solai-` namespace, kebab-case names, no guide-only or extra syntax aliases. Existing selected checks are not a complete accessibility audit.

Preserve the Dolch MIT notice and all font licenses. Do not describe the whole project as MIT merely because the upstream palette is MIT.

## Artwork pipeline

The active pipeline in `src/scripts/app.js` is:

1. Load `/assets/landscape.png` from `public/assets/`
2. Draw and crop it to an offscreen canvas
3. Composite `drawSkyline(...)` in grayscale
4. Calculate luminance and render Soft, ordered Dither and glyph-based ASCII caches for the active variant; light mode reverses ink coverage to keep the sky bright and silhouettes dark
5. Paint the selected treatment and optional pointer reveal

`art-source/generate_landscape.py` is the original deterministic landscape generator. It is optional and requires NumPy and Pillow; serving or editing the site does not. The supplied PNG is already ready to use.

`art-source/balcony/solai-balcony-study.svg` is editable vector artwork with named groups. `balcony-generated-reference.png` is a separate raster reference. The other PNGs are previews, and the grayscale SVG is the balcony generator's input. None is an active asset. The SVG builder is optional Python standard-library code; its paths were made relative for this package.

If explicitly asked to switch to balcony art: copy/export the chosen source into `public/assets/`, change the image path, and remove both the `drawSkyline` call and function. Otherwise the old towers will be drawn over the new balcony. Keep the grayscale-to-luminance recoloring pipeline. Check the wide balcony composition at desktop, tablet and phone sizes; the current centered cover-crop may need adjustment to preserve key elements. Update the canvas description if the scene changes. Keep the editable source separate from any exported raster.

## Verify edits

- Run `node --check` on changed `src/scripts/*.js` and `src/data/*.js` files, check the home entry point, and run `pnpm build`
- Use `pnpm dev` for development and `pnpm preview` to check the built site; check `/`, `/palette/`, `/guide/`, fonts, JSON and downloads without missing requests
- Test all five flavours in both modes with each hero treatment, synchronized selectors, pointer enter/leave, resize, keyboard tabs/mode controls, reduced motion and narrow layouts
- Test copy/download actions and localStorage behavior when affected
- On `/palette/`, check stop/gradient alignment, nearest-stop snapping through the overlay, diagonal entry into cached rows (including rapid re-entry during fade-out), independent row crossfades, idle preview hiding, first/last containment during Glide motion, exact clipboard values, one-tab-stop-per-row keyboard navigation, horizontal/vertical touch scrolling and cross-page theme persistence
- On `/guide/`, exercise the eight fixed mappings in all five flavours and both modes; legacy per-section treatment queries must not change them. Check actual role/source/value resolution, coloured search and matching rainbow pairs on their real backgrounds, consistent wide/narrow layouts, section deep links, theme preservation, keyboard traversal and JSON/no-script failure states. Interface statuses stay green/yellow/red/blue; do not imply ANSI indices or syntax categories have universal status meanings.
- Check browser console errors and preserve license/source links
- State what was verified and any remaining limits; do not claim browser QA from syntax checks alone
