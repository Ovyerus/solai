# Solai local source

A standalone, buildless copy of the current Solai theme explorer. The files in `dist/` are the actual editable source, not a compiled bundle. No package install, build step, application server, API keys, or network services are needed. Fonts, palette data, artwork and downloads are included locally.

## Run locally

Unzip, open a terminal in the `solai` folder, and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open **http://localhost:8000/**. The type comparison is at **http://localhost:8000/type/**. Stop the server with Ctrl+C. Use HTTP rather than opening the HTML directly, because the pages fetch local JSON. Python 3 is only serving files; the site itself runs in your browser with no runtime libraries.

To work with a coding agent, open this `solai` folder and ask it to read `AGENTS.md`. Edit files under `dist/`, then refresh the browser. Optional JavaScript syntax checks, if Node is available:

```sh
node --check dist/assets/app.js
node --check dist/type/type.js
```

## Current baseline

The hero is a grayscale mountain-and-lake landscape with a small static skyline composited on the left shore. Soft, Dither and ASCII treatments recolor that image; moving the pointer reveals ASCII in a circular area. There is no continuous scene animation. The full-width hero, transparent overlaid header and synchronized five-segment palette selector are retained.

Palettes: **Tide, Ember, Dusk, Viridian, Bloom**. Sora is the interface/display face, and Iosevka Solai is the monospace face. The separate type comparison also includes Space Grotesk. Palette selection persists in browser localStorage. Demo preferences are illustrative, and exported CSS provides semantic variables rather than installed app themes.

## File map

- `dist/index.html`: main page structure and copy
- `dist/assets/style.css`: layout, typography and default theme variables
- `dist/assets/app.js`: palette controls, samples, downloads and canvas rendering
- `dist/assets/palettes.json`: current canonical palette data and provenance
- `dist/assets/landscape.png`: current grayscale landscape source
- `dist/assets/fonts/`: self-hosted font files and their license notices
- `dist/downloads/`: original downloads, licenses and the Dolch reference ZIP
- `dist/type/`: editable typography comparison page
- `art-source/`: optional landscape generator and proposed balcony artwork
- `palette-source/`: optional Python palette generators and their complete inputs

## Proposed balcony artwork

`art-source/balcony/` contains an **editable vector SVG** balcony study, its PNG preview, the earlier grayscale scene SVG/preview, and a separate **AI-generated raster PNG reference**. The reference is a visual direction, not a vector source or an exact rendering of the SVG. None of these alternatives is wired into the current site. See `art-source/README.md` before changing the hero.

## Provenance and licenses

Tide preserves Dolch Blue primitives; Ember preserves Dolch Alter primitives. Dusk, Viridian and Bloom are independent color studies using the same generation approach. The semantic UI role mappings are proposed mappings, including those for Tide and Ember.

Original Dolch colors: Renzhi Li (Belleve Invis), MIT, source commit `cf3817311b30d3c21a60ebb0b250d18386e66a30`: https://github.com/be5invis/vscode-theme-dolch. Preserve `dist/downloads/LICENSE-Dolch.txt` and all font notices. The original landscape is procedural artwork; the balcony reference is AI-generated. No blanket license is added for the remaining site/artwork.
