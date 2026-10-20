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

Open **http://localhost:4321/**. The palette explorer is at **http://localhost:4321/palette/** and the colour guide at **http://localhost:4321/guide/**. Edit `src/` or `public/` and Astro refreshes the development page. Use HTTP rather than opening HTML directly, because the pages fetch local JSON.

To build and preview the production site:

```sh
node --check src/scripts/app.js
node --check src/scripts/palette.js
node --check src/scripts/palette-ramp.js
node --check src/scripts/guide.js
node --check src/data/guide.js
pnpm build
pnpm preview
```

Preview also defaults to port 4321, so stop the development server first or pass a different `--port`. Stop foreground servers with Ctrl+C. Astro also supports background servers (`pnpm dev --background`); stop those with `pnpm dev stop` or `pnpm preview stop`, respectively.

`dist/` is generated output, not editable source. Deploy that directory to a static host after building; Node.js is required only for development and builds. No client framework or server adapter is used.

## Version control

This folder is a colocated Jujutsu/Git repository (`.jj/` and `.git/`). Both `jj` and `git` work against the same history, with a `main` bookmark/branch. The original buildless website is preserved in the initial commit. Use `jj status` and `jj log` to inspect changes; `jj new` starts a new change. Generated output, installed packages, Astro caches and macOS metadata are ignored.

## Current baseline

The hero is a grayscale mountain-and-lake landscape with a small static skyline composited on the left shore. Soft, Dither and ASCII treatments recolor that image; moving the pointer reveals ASCII in a circular area. There is no continuous scene animation. The full-width hero and transparent overlaid header are retained. The native theme dropdown and Dark/Light toggle are paired at the header's right edge, synchronized with the lower flavour cards; there is no palette bar below the hero.

The home page contains Flavours, Previews and Downloads. `/palette/` describes the colour families and contains the ramps, role swatches and selected contrast checks; copying/keyboard instructions are optional, collapsed help. `/guide/` explores semantic meanings in eight usage contexts.

The working interface uses **Linework**: flat neutral surfaces, fine dividers and **2px corners** on controls and frames. Appearance controls, artwork treatments and preview tabs use inset segmented groups with accent-filled active choices; current-page navigation uses a thin accent underline. Restrained selection fills and separate keyboard-focus outlines have different jobs. Technical labels and values use Iosevka Solai; prose and control labels remain Sora. Circular stop dots and pill switches retain their shapes, and the full-bleed hero stays flush.

The hero and flavour captions use a synthwave/solarpunk-after-dark direction. Controls and technical notes stay plain.

The shared wordmark is `src/assets/solai-wordmark.svg`, inlined by `src/components/Wordmark.astro` in the hero, navigation and footer. Its Sora Medium lettering is outlined at weight 500 with the hero's tight spacing, and the raised eight-ray star is geometric rather than a Unicode glyph. All instances inherit the active theme's ink/accent colours and render without fonts or emoji fallback. Navigation uses the component's `small` optical variant: identical lettering paths, a 1.8× star with slightly heavier rays, and a wider viewBox to prevent clipping. The hero and footer retain the original composition. Edit the master rather than recreating the logo with text; the Sora font notice remains in `public/assets/fonts/Sora-OFL.txt`.

Palettes: **Tide, Ember, Dusk, Viridian, Bloom**, each with **Dark** and **Light** variants. Dark remains the default. Home, Palette and Guide share flavour/mode preferences in browser localStorage. Query parameters such as `?theme=Tide&mode=light` preview a combination without saving it; navigation carries that preview, while an explicit header choice updates preferences and any theme query so reloads keep the new selection. Sora is the interface/display face and Iosevka Solai is the monospace face. Demo preferences are illustrative; exports are palette data and CSS variables, not installed app themes.

### Palette interaction

The generated ramps use compact pseudo-table rows with a shared 0–10 grade header. Each bar is a continuous OKLab-interpolated gradient with dots at the original stops. Each row has its own colour-filled preview, overlaid on the bar for hover or keyboard focus. On entry, it is placed at the current stop before fading in; it never slides in from that row's cached column. Leaving the row fades its window out over 120 ms without intercepting pointer input. Movement within the row slides between stops. Clicking the bar, window or a dot copies the original hex value, never an interpolated sample.

Horizontal motion is fixed to **Glide: 150 ms with `cubic-bezier(.22, .68, 0, 1)`**, with no motion selector. Reduced motion disables both slides and fades. Keyboard users get one tab stop per row: Left/Right and Home/End choose a grade; Enter or Space copies. Narrow screens scroll the table horizontally with sticky family labels, while touch copying and scrolling remain native.

### Colour guide

`/guide/` covers **Surfaces, Text & signals, Code, Prose, Editor chrome, Changes & diagnostics, Terminal UI and ANSI slots**. Each context has one title and a consolidated description, followed by its example and colour-role ledger. Examples sit beside the ledger on wide screens and stack above it on narrow screens. There are no treatment subheadings or per-section proposal disclaimers; the export distinction is explained once at page level.

`src/data/guide.js` contains the eight section descriptions and their fixed role mappings. Treatment selectors, unused alternatives and obsolete name/summary metadata have been removed.

Code uses a clean, mostly monotone foundation whose limited accents carry meaning and whose contrast gives grammar definition. Editor chrome retains its neutral current-line fill, caret and gutter, with violet search text and underlines, and pairs brackets by nesting depth through orange, chartreuse, spring, cyan, violet and rose. The example shows all six nesting levels and matching opening/closing colours. Selected rendered search/bracket text pairings were checked against their real canvas/current-line backgrounds in every flavour and mode.

Flavour and mode still follow the shared header controls and theme query. Section links can be bookmarked or shared, for example `/guide/?theme=Tide&mode=light#editor`. Legacy per-section treatment parameters no longer alter the fixed mappings.

These are **guide-only proposals** resolved from canonical palette roles, syntax assignments and primitive ramps. The fixed selections do not change the published aliases, source colours or downloads. Interface statuses retain their meanings; a syntax colour or ANSI slot is not inherently a status. Low-contrast ANSI slots are shown as labelled colour tiles, not recommended as universal foreground text. Selected prototype pairings were checked, but the guide is not a complete accessibility audit. If a study is adopted into published aliases, update the generator and exports together.

## Palette data

`public/assets/palettes.json` uses schema version 2: select a variant with `flavors[id].modes.dark` or `flavors[id].modes.light`. Each variant includes its primitive ramps, proposed semantic roles, provenance and selected contrast checks. Current-palette JSON/CSS filenames include the mode, such as `solai-tide-light.json`; the whole-family export contains all ten variants. The static family CSS uses `[data-flavor="blue"][data-mode="light"]` selectors and `--solai-*` variables.

The explorer's OKLab interpolation is display-only. The source ramp generation, primitive colours, semantic mappings and exports are unchanged.

To regenerate the live data and exports, using Python 3's standard library:

```sh
python3 palette-source/build_flavors.py
```

This updates the canonical JSON, `public/downloads/flavor-studies.json`, `public/downloads/flavors.css` and `src/styles/themes.css`. It verifies upstream primitive equality and actual contrast pairings, and guards against unintended changes to the existing dark variants. Regeneration is optional and is not part of the Astro build. See `palette-source/README.md` for the separate historical tools.

## File map

- `src/pages/index.astro`: main page structure and copy
- `src/pages/palette/index.astro`: standalone palette explorer
- `src/pages/guide/index.astro`: collaborative semantic-colour guide
- `src/layouts/Page.astro`: shared document metadata and page slots
- `src/components/AppSamples.astro`: editor, terminal and interface specimens
- `src/components/AppearanceControl.astro`: shared keyboard-operable Dark/Light controls
- `src/components/SiteHeader.astro`, `SiteFooter.astro` and `ThemeHead.astro`: shared navigation, attribution and prepaint theme restoration
- `src/assets/solai-wordmark.svg` and `src/components/Wordmark.astro`: canonical outlined brand artwork and shared inline SVG presentation
- `src/styles/main.css`: shared site styles and home-page artwork/layout
- `src/styles/themes.css`: generated site tokens for every flavour/mode, applied before palette JSON loads
- `src/styles/palette.css` and `palette-ramps.css`: palette-page layout, gradient markers and sliding preview
- `src/styles/guide.css`: responsive guide layouts and contextual colour specimens
- `src/scripts/app.js`: home flavour cards, samples, downloads and canvas rendering
- `src/scripts/palette.js` and `palette-ramp.js`: semantic palette rendering and snapped ramp interaction
- `src/scripts/theme.js` and `palette-shared.js`: shared theme controls, navigation context, copy feedback and exports
- `src/data/guide.js`: eight usage contexts and their fixed, unexported semantic studies
- `src/scripts/guide.js`: live colour resolution and section deep links
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
