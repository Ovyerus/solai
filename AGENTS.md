# Solai project handoff

## Working model

This is a static, buildless website. `dist/` is the editable source of truth. There is no package manifest, bundler, framework or build step. Make small, scoped edits in the existing HTML, CSS and JavaScript. Do not introduce a build system or new dependencies unless requested. Use the local HTTP command in `README.md`; do not deploy as part of ordinary editing.

## Baseline to preserve

- Full-width mountain/lake hero with a transparent overlaid header and small static left-shore skyline
- Soft, Dither and ASCII treatments, plus pointer ASCII reveal; render on changes, without a perpetual animation loop
- Sora for the main interface, Iosevka Solai for technical/monospace content
- Five palettes and stable internal IDs: Tide=`blue`, Ember=`alter`, Dusk=`violet`, Viridian=`green`, Bloom=`rose`
- Synchronized hero palette bar and lower flavor selector; browser localStorage persistence
- Responsive layout, keyboard-operable tabs and controls, accessible labels, reduced-motion behavior, clipboard fallback and working downloads
- `/type/` remains a standalone font comparison specimen, with Space Grotesk available there

The proposed high-rise balcony is NOT integrated. Do not silently substitute it when making unrelated changes.

## Palette integrity

`dist/assets/palettes.json` contains current palette values, generation parameters, source attribution and selected contrast checks. Keep provenance and distinction between original colors and independent studies intact. Tide/Blue and Ember/Alter preserve original Dolch primitives; Dusk/Violet, Viridian/Green and Bloom/Rose are independent studies. Semantic UI roles are proposed in all flavors. Preserve status color meanings and existing internal IDs when changing display names.

Optional generators and their inputs are in `palette-source/`; read its README before running them. They produce historical Dolch-labelled data and do not automatically update the live site. Never overwrite current Solai display metadata blindly. If values change, update relevant default CSS, data and export artifacts together, and recalculate actual contrast pairings. Existing selected checks are not a complete accessibility audit.

Preserve the Dolch MIT notice and all font licenses. Do not describe the whole project as MIT merely because the upstream palette is MIT.

## Artwork pipeline

The active pipeline in `dist/assets/app.js` is:

1. Load `assets/landscape.png`
2. Draw and crop it to an offscreen canvas
3. Composite `drawSkyline(...)` in grayscale
4. Calculate luminance and render Soft, ordered Dither and glyph-based ASCII caches
5. Paint the selected treatment and optional pointer reveal

`art-source/generate_landscape.py` is the original deterministic landscape generator. It is optional and requires NumPy and Pillow; serving or editing the site does not. The supplied PNG is already ready to use.

`art-source/balcony/solai-balcony-study.svg` is editable vector artwork with named groups. `balcony-generated-reference.png` is a separate raster reference. The other PNGs are previews, and the grayscale SVG is the balcony generator's input. None is an active asset. The SVG builder is optional Python standard-library code; its paths were made relative for this package.

If explicitly asked to switch to balcony art: copy/export the chosen source into `dist/assets/`, change the image path, and remove both the `drawSkyline` call and function. Otherwise the old towers will be drawn over the new balcony. Keep the grayscale-to-luminance recoloring pipeline. Check the wide balcony composition at desktop, tablet and phone sizes; the current centered cover-crop may need adjustment to preserve key elements. Update the canvas description if the scene changes. Keep the editable source separate from any exported raster.

## Verify edits

- Run `node --check dist/assets/app.js` and `node --check dist/type/type.js` if Node is available
- Serve `dist/` over local HTTP; check `/`, `/type/`, fonts, JSON and downloads without missing requests
- Test all five palettes with each hero treatment, synchronized selectors, pointer enter/leave, resize, keyboard tabs, reduced-motion behavior and narrow layouts
- Test copy/download actions and localStorage behavior when affected
- Check browser console errors and preserve license/source links
- State what was verified and any remaining limits; do not claim browser QA from syntax checks alone
