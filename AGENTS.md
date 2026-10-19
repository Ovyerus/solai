# Solai project handoff

## Working model

This is a static Astro website. Editable source lives in `src/`, and unchanged public assets live in `public/`. `dist/` is generated, ignored build output; never edit it directly. Keep scoped changes in the existing Astro, CSS and vanilla JavaScript files. Do not introduce client frameworks, server adapters or extra dependencies unless requested. Enter the Node.js/pnpm shell with `nix develop` (or nix-direnv), and use pnpm for dependencies and the development/build/preview commands in `README.md`; do not deploy as part of ordinary editing. Keep `pnpm-lock.yaml` as the only dependency lockfile. Git and Jujutsu are colocated; preserve both `.git/` and `.jj/`.

Use Conventional Commit descriptions for named changes, such as `feat: ...`, `fix: ...`, `refactor: ...`, `build: ...` and `chore: ...`. After completing and verifying a change, describe it and run `jj new` before handing back. Always leave `@` as a fresh, empty working change rather than leaving completed work checked out.

## Baseline to preserve

- Full-width mountain/lake hero with a transparent overlaid header and small static left-shore skyline
- Soft, Dither and ASCII treatments, plus pointer ASCII reveal; render on changes, without a perpetual animation loop
- Sora for the main interface, Iosevka Solai for technical/monospace content
- Five flavours and stable internal IDs: Tide=`blue`, Ember=`alter`, Dusk=`violet`, Viridian=`green`, Bloom=`rose`; each has Dark and Light variants
- Native header theme dropdown paired with the Dark/Light toggle at the right edge and synchronized with the home flavour cards; no palette bar below the hero; Home and Palette share flavour/mode persistence and navigation context; `/type/` preferences remain local
- Responsive layout, keyboard-operable tabs and controls, accessible labels, reduced-motion behavior, clipboard fallback and working downloads
- `/type/` remains a standalone font comparison specimen, with Space Grotesk available there
- `/palette/` is the separate explorer: compact pseudo-table rows with shared grade headings, OKLab gradients between unchanged original stops, stop dots and independent colour-filled preview windows overlaid on the bars. On row entry, position the window at the new stop before fading in; never animate in from its cached column. Row exit fades opacity without intercepting clicks. Keep continuous scrubbing, exact-value copying, fixed 150ms Glide motion (`cubic-bezier(.22, .68, 0, 1)`) with no motion selector, keyboard navigation, native touch scrolling and reduced-motion behavior.

The proposed high-rise balcony is NOT integrated. Do not silently substitute it when making unrelated changes.

## Palette integrity

`public/assets/palettes.json` is canonical schema v2: `flavors[id].modes.dark/light` contains each variant's parameters, primitive ramps, proposed semantic roles, provenance and selected contrast checks. Tide/Blue and Ember/Alter preserve the exact four upstream dark/light primitive sets. Dusk/Violet, Viridian/Green and Bloom/Rose are independent studies; all UI semantic mappings are proposed. Preserve status meanings and the five internal IDs.

`python3 palette-source/build_flavors.py` regenerates the live JSON, `public/downloads/flavor-studies.json`, `public/downloads/flavors.css` and `src/styles/themes.css`; read `palette-source/README.md` first. This optional standard-library tool is separate from Astro builds. The other palette tools remain historical. Never overwrite Solai metadata with historical output. If colors or roles change, update the generator, default CSS where applicable, data and exports together, and recalculate actual contrast pairings. Existing selected checks are not a complete accessibility audit.

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

- Run `node --check` on changed `src/scripts/*.js` files, check the home/type entry points, and run `pnpm build`
- Use `pnpm dev` for development and `pnpm preview` to check the built site; check `/`, `/palette/`, `/type/`, fonts, JSON and downloads without missing requests
- Test all five flavours in both modes with each hero treatment, synchronized selectors, pointer enter/leave, resize, keyboard tabs/mode controls, reduced motion and narrow layouts
- Test copy/download actions and localStorage behavior when affected
- On `/palette/`, check stop/gradient alignment, nearest-stop snapping through the overlay, diagonal entry into cached rows (including rapid re-entry during fade-out), independent row crossfades, idle preview hiding, first/last containment during Glide motion, exact clipboard values, one-tab-stop-per-row keyboard navigation, horizontal/vertical touch scrolling and cross-page theme persistence
- Check browser console errors and preserve license/source links
- State what was verified and any remaining limits; do not claim browser QA from syntax checks alone
