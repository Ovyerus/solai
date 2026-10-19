# Solai

A static Astro site for the Solai theme explorer. Editable pages, styles and browser scripts live in `src/`; fonts, palette data, artwork and downloads live in `public/`. Astro builds deployable files into `dist/`. The deployed site needs no application server, API keys or runtime framework.

## Run locally

With Nix, enter the pinned development shell, which provides only Node.js 24 and pnpm:

```sh
nix develop
```

For automatic loading with nix-direnv, run `direnv allow` once; `.envrc` uses the same flake. Without Nix, install a supported even-numbered Node.js release **22.22.0 or newer** (Node.js 24 LTS recommended) and the pnpm version declared in `package.json`.

Then install the locked dependencies and start Astro:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open **http://localhost:4321/**. The standalone type comparison is at **http://localhost:4321/type/**. Edit `src/` or `public/` and Astro refreshes the development page. Use HTTP rather than opening HTML directly, because the pages fetch local JSON.

To build and preview the production site:

```sh
node --check src/scripts/app.js
node --check src/scripts/type.js
pnpm build
pnpm preview
```

Preview also defaults to port 4321, so stop the development server first or pass a different `--port`. Stop foreground servers with Ctrl+C. Astro also supports background servers (`pnpm dev --background`); stop those with `pnpm dev stop` or `pnpm preview stop`, respectively.

`dist/` is generated output, not editable source. Deploy that directory to a static host after building; Node.js is required only for development and builds. No client framework or server adapter is used.

## Version control

This folder is a colocated Jujutsu/Git repository (`.jj/` and `.git/`). Both `jj` and `git` work against the same history, with a `main` bookmark/branch. The original buildless website is preserved in the initial commit. Use `jj status` and `jj log` to inspect changes; `jj new` starts a new change. Generated output, installed packages, Astro caches and macOS metadata are ignored.

## Current baseline

The hero is a grayscale mountain-and-lake landscape with a small static skyline composited on the left shore. Soft, Dither and ASCII treatments recolor that image; moving the pointer reveals ASCII in a circular area. There is no continuous scene animation. The full-width hero and transparent overlaid header are retained. A native theme dropdown in the navigation stays synchronized with the lower flavour cards; there is no palette bar below the hero.

The main page contains Flavours, Previews, Palette and Downloads. Selected contrast checks are shown with the palette. The standalone type page includes editable samples, character coverage and weight comparisons.

The hero and flavour captions use a synthwave/solarpunk-after-dark direction. Controls and technical notes stay plain.

Palettes: **Tide, Ember, Dusk, Viridian, Bloom**, each with **Dark** and **Light** variants. Dark remains the default. The main page remembers flavour and mode in browser localStorage; `?theme=Tide&mode=light` previews a combination without overwriting those preferences. The `/type/` controls stay local to that page. Sora is the interface/display face, Iosevka Solai is the monospace face, and the type comparison also includes Space Grotesk. Demo preferences are illustrative; exports are palette data and CSS variables, not installed app themes.

## Palette data

`public/assets/palettes.json` uses schema version 2: select a variant with `flavors[id].modes.dark` or `flavors[id].modes.light`. Each variant includes its primitive ramps, proposed semantic roles, provenance and selected contrast checks. Current-palette JSON/CSS filenames include the mode, such as `solai-tide-light.json`; the whole-family export contains all ten variants. The static family CSS uses `[data-flavor="blue"][data-mode="light"]` selectors and `--solai-*` variables.

To regenerate the live data and exports, using Python 3's standard library:

```sh
python3 palette-source/build_flavors.py
```

This updates the canonical JSON, `public/downloads/flavor-studies.json`, `public/downloads/flavors.css` and `src/styles/themes.css`. It verifies upstream primitive equality and actual contrast pairings, and guards against unintended changes to the existing dark variants. Regeneration is optional and is not part of the Astro build. See `palette-source/README.md` for the separate historical tools.

## File map

- `src/pages/index.astro`: main page structure and copy
- `src/pages/type/index.astro`: standalone typography comparison page
- `src/layouts/Page.astro`: shared document metadata and page slots
- `src/components/AppSamples.astro`: editor, terminal and interface specimens
- `src/components/AppearanceControl.astro`: shared keyboard-operable Dark/Light controls
- `src/styles/main.css` and `src/styles/type.css`: independent page styles and self-hosted font declarations
- `src/styles/themes.css`: generated main-page tokens for every flavour/mode, applied before palette JSON loads
- `src/scripts/app.js`: palette controls, samples, downloads and canvas rendering
- `src/scripts/type.js`: typography comparison controls
- `public/assets/palettes.json`: current canonical palette data and provenance
- `public/assets/landscape.png`: current grayscale landscape source
- `public/assets/fonts/`: self-hosted font files and their license notices
- `public/downloads/`: current family JSON/CSS, original reference data, licenses and the untouched Dolch reference ZIP
- `astro.config.mjs`: static output and trailing-slash route configuration
- `flake.nix` and `flake.lock`: pinned Node.js/pnpm development shell for Apple Silicon macOS and ARM64/x86-64 Linux
- `.envrc`: optional nix-direnv integration
- `pnpm-lock.yaml`: locked application dependencies; use pnpm rather than npm
- `art-source/`: optional landscape generator and proposed balcony artwork
- `palette-source/`: optional Python palette generators and their complete inputs

## Proposed balcony artwork

`art-source/balcony/` contains an **editable vector SVG** balcony study, its PNG preview, the earlier grayscale scene SVG/preview, and a separate **AI-generated raster PNG reference**. The reference is a visual direction, not a vector source or an exact rendering of the SVG. None of these alternatives is wired into the current site. See `art-source/README.md` before changing the hero.

## Provenance and licenses

Tide preserves Dolch Blue primitives in both modes (`dolch` and `dolch-light`); Ember preserves Dolch Alter primitives (`dolch-alter` and `dolch-light-alter`). Dusk, Viridian and Bloom are independent color studies using each mode's original generation approach and an unrotated status ring. The semantic UI role mappings are proposed in every variant, including Tide and Ember. Light roles choose darker grades where needed for their actual text, control and badge pairings. The selected checks are not a complete accessibility audit.

Original Dolch colors: Renzhi Li (Belleve Invis), MIT, source commit `cf3817311b30d3c21a60ebb0b250d18386e66a30`: https://github.com/be5invis/vscode-theme-dolch. Preserve `public/downloads/LICENSE-Dolch.txt` and all font notices. The original landscape is procedural artwork; the balcony reference is AI-generated. No blanket license is added for the remaining site/artwork.
