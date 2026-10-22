# Contributing to Solai

This guide covers working on the website and its colour exports. For an introduction, supported applications and downloads, see the [README](README.md).

Solai is a static Astro site with Tailwind CSS and vanilla browser JavaScript. Editable source lives in `src/`; unchanged public assets live in `public/`. Astro builds `dist/`, which is generated output, never editable source. The deployed site needs no application server, API keys or runtime framework.

- [Run locally](#run-locally)
- [Source layout](#source-layout) and [version control](#version-control)
- [Design and behaviour](#design-and-behaviour)
- [Styling and Tailwind exports](#styling-with-tailwind)
- [Palette data](#palette-data) and [application themes](#application-themes-and-downloads)
- [Guide token editor](#guide-token-editor)
- [Artwork](#balcony-artwork) and [provenance](#provenance-and-licenses)
- [Deploy to Wisp](#deploy-to-wisp)

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

Open **http://localhost:4321/**. The palette explorer is at **http://localhost:4321/palette/**, the colour guide at **http://localhost:4321/guide/** and application themes/data at **http://localhost:4321/downloads/**. Edit `src/` or `public/` and Astro refreshes the development page. Use HTTP rather than opening HTML directly, because the pages fetch local JSON.

To build and preview the production site:

```sh
node --check src/scripts/app.js
node --check src/scripts/site-header.js
node --check src/scripts/hero-settings.js
node --check src/scripts/hero-art.js
node --check src/scripts/palette.js
node --check src/scripts/palette-ramp.js
node --check src/scripts/guide.js
node --check src/scripts/guide-renderer.js
node --check src/scripts/guide-editor.js
node --check src/scripts/downloads.js
node --test palette-source/ports/ports.test.mjs
node --check src/data/guide.js
pnpm build
pnpm preview
```

Preview also defaults to port 4321, so stop the development server first or pass a different `--port`. Stop foreground servers with Ctrl+C. Astro also supports background servers (`pnpm dev --background`); stop those with `pnpm dev stop` or `pnpm preview stop`, respectively.

`dist/` is generated output, not editable source. Deploy that directory to a static host after building; Node.js is required only for development and builds. No client framework or server adapter is used.

## Source layout

- `src/pages/`: Home, Palette, Guide, Downloads and the unlinked guide editor.
- `src/layouts/` and `src/components/`: the shared document, navigation, wordmark and seven preview windows.
- `src/scripts/`: browser interactions, shared theme state, palette ramps, hero renderer and guide specimens.
- `src/data/guide.js`: approved guide mappings, also used to generate application themes.
- `src/styles/`: the Tailwind entry point, generated theme variables and complex ramp motion.
- `src/assets/solai-wordmark.svg`: the single canonical outlined wordmark.
- `public/assets/`: canonical palette JSON, served artwork and self-hosted fonts.
- `public/downloads/`: generated application themes, web exports and the download manifest.
- `palette-source/`: optional palette/theme generators and preserved historical inputs.
- `art-source/`: active balcony source, inactive vector studies and the retired procedural landscape.
- `astro.config.mjs`: static output, trailing-slash routes and Tailwind’s Vite plugin.
- `flake.nix`, `flake.lock` and `.envrc`: pinned Node.js/pnpm shell and optional nix-direnv loading.

## Version control

This folder is a colocated Jujutsu/Git repository (`.jj/` and `.git/`). Both `jj` and `git` work against the same history, with a `main` bookmark/branch. The original buildless website is preserved in the initial commit. Use `jj status` and `jj log` to inspect changes; `jj new` starts a new change. Generated output, installed packages, Astro caches and macOS metadata are ignored.

Use Conventional Commit descriptions, such as `feat:`, `fix:`, `refactor:`, `build:`, `docs:` or `chore:`. Keep unrelated changes separate. After completing and verifying a change, describe it and run `jj new` so `@` is a fresh, empty working change. Preserve both VCS directories and use `pnpm-lock.yaml` as the only dependency lockfile.

## Design and behaviour

The hero uses the AI-generated planted-balcony scene from `art-source/balcony/balcony-generated-reference.png`, copied unchanged to `public/assets/balcony.png`. It is always rendered with two-colour dithering; the old skyline overlay, Soft/ASCII variants and cursor reveal are removed. Desktop framing keeps the lake and sun in view; phone framing favours the planted facade and balcony rather than cropping them out.

**Bayer fine** is the fixed dither treatment in both the live WebGL renderer and static Canvas2D fallback. The approved settings are 2px cells, 0.25 spread, 0.54 threshold, 1.1× contrast, 1 drift and 0.65 cursor strength, with **Ripple** as the sole pointer effect. Ripple rolls around the pointer; faster gestures add energy, while the dither grid stays fixed and the image retains the selected theme's two inks.

The hero has no image-tweaking controls or PNG export. Its rendering settings are fixed in `src/scripts/hero-settings.js`; the normal site flavour and Dark/Light controls still recolour the artwork.

WebGL handles the live image. Animation stops offscreen, in a hidden document or with reduced motion. Touch movement does not drive the image or capture scrolling. A static Canvas2D Bayer fine renderer supports browsers without WebGL and context loss. Without JavaScript, or if the source cannot load, the baked `public/assets/balcony-dither.png` Tide Dark poster remains visible. The poster is a separate full-scene fallback; keep it in sync when replacing the source.

Navigation stays at the viewport top on Home, Palette, Guide and Downloads. The home header remains transparent over the full-width hero at the top, then gains a solid theme surface while scrolling; the inner pages use a solid sticky header throughout. Anchor offsets follow the actual wrapped header height, and focusing visible navbar controls does not move the page. Without JavaScript, the header stays solid and uses a conservative anchor offset. The native theme dropdown and Dark/Light toggle remain paired at the header’s right edge and synchronized with the lower flavour cards; there is no palette bar below the hero.

The home page introduces Solai’s Dolch origins and solarpunk-after-sunset mood between the hero and Flavours. Flavour cards retain their scene captions without upstream/study badges. Seven labelled preview windows are stacked vertically with no selector or tab panels. Downloads live on `/downloads/`, not in a home-page section. `/palette/` shows the shared base colours followed by all five flavours' custom ramps, with exact-value copying and optional, collapsed keyboard help. Semantic roles and their usage are explained on `/guide/`, not duplicated on the palette page.

The working interface uses **Linework**: flat neutral surfaces, fine dividers and **2px corners** on controls and frames. Appearance controls use inset segmented groups with accent-filled active choices; current-page navigation uses a thin accent underline. Restrained selection fills and separate keyboard-focus outlines have different jobs. Technical labels and values use Iosevka Solai; prose and control labels remain Sora. Circular stop dots and pill switches retain their shapes, and the full-bleed hero stays flush.

The hero, introduction and flavour captions use a synthwave/solarpunk-after-dark direction. Controls and technical notes stay plain.

The single canonical wordmark is `src/assets/solai-wordmark.svg`, inlined by `src/components/Wordmark.astro` in the hero, navigation and footer. Its Sora Medium lettering is outlined at weight 500 with tight spacing. The enlarged, raised eight-ray star, heavier rays and unclipped `2390×900` viewBox are baked into the master SVG; there are no alternate size variants or selector props. All placements use `<Wordmark />`, inherit the active theme's ink/accent colours and retain their existing layout widths and accessible containing labels. The artwork renders without fonts or emoji fallback. Edit this master rather than recreating the logo with text. The Sora font notice is retained in the legal comments beside the font definitions in `src/styles/main.css`. Standalone SVG use (including the README) follows the viewer’s light/dark colour scheme; those defaults do not override the inline website’s theme colours.

Palettes: **Tide, Ember, Dusk, Viridian, Bloom**, each with **Dark** and **Light** variants. Dark remains the default. Home, Palette, Guide and Downloads share flavour/mode preferences in browser localStorage. Query parameters such as `?theme=Tide&mode=light` preview a combination without saving it; navigation carries that preview, while an explicit header choice updates preferences and any theme query so reloads keep the new selection. Sora is the interface/display face and Iosevka Solai is the monospace face. Preview controls are illustrative; downloadable application themes are separate from the specimens.

### Preview specimens

The previews are fixed colour specimens, not live applications or application screenshots:

- **Editor:** mostly neutral TypeScript, a file tree, current line, violet search matches, a compact three-row completion list anchored above the caret and moving with native code scrolling, change markers and explicit diagnostics.
- **Terminal:** directory/file/symlink/executable colours, Git output, a process table, resource meters and the guide’s normal/bright ANSI mappings.
- **Interface:** selected and archived rows, the existing switches/name field and Save/Reset actions, a fixed read-only invalid-field example, a disabled action and a notice.
- **Night Radio:** original tape-cover artwork, paused waveform, track metadata and a fixed 16-step pattern with active/off/muted states.
- **Rooftop Station:** a coherent 20:14 microgrid snapshot, solid/dashed solar-demand chart, reserves, greenhouse readings and maintenance notice.
- **Harbour Departures:** a sample night-service board, independent selection/status colours and a timed route. Narrow screens scroll the table natively.
- **Field Notebook:** an original evening entry, botanical sketch, quotation, annotation and working footnote/backlink.

All seven follow the shared flavour/mode. Extra specimen-only colours are resolved at Astro build time from the unchanged canonical JSON and approved guide definitions, scoped to `#examples`; no aliases are added to palette downloads. The specimens remain styled without JavaScript or a successful client JSON fetch. Missing client data is reported rather than leaving incorrect code hex values visible. New windows have no app controls, services, timers or animation loops; the existing Interface controls remain page-local.

### Palette interaction

The explorer shows six tables at once: twelve shared base families at the top, then Tide, Ember, Dusk, Viridian and Bloom, each with `fg`, `bg`, `coShades`, `accent` and `coAccent`. Dark/Light switches every table to that mode. The site flavour changes the surrounding interface and selected-theme CSS copy target without rebuilding or hiding tables, so inspected grades, keyboard focus and horizontal scroll positions remain intact.

Each table uses compact pseudo-table rows with its own 0–10 grade header and horizontal scroll region. Every bar is a continuous OKLab-interpolated gradient with dots at the canonical stops. Each row has its own colour-filled preview, overlaid on the bar for hover or keyboard focus. On entry, it is placed at the current stop before fading in; it never slides in from that row's cached column. Leaving the row fades its window out over 120 ms without intercepting pointer input. Movement within the row slides between stops. Clicking a bar, window or dot copies the exact hex value, with the table's flavour/mode identified in the feedback.

Horizontal motion is fixed to **Glide: 150 ms with `cubic-bezier(.22, .68, 0, 1)`**, with no motion selector. Reduced motion disables both slides and fades. Keyboard users get one tab stop per row: Left/Right and Home/End choose a grade; Enter or Space copies. Narrow screens scroll the table horizontally with sticky family labels, while touch copying and scrolling remain native.

### Colour guide

`/guide/` covers **Surfaces, Text & signals, Code, Prose, Editor chrome, Changes & diagnostics, Terminal UI and ANSI slots**. Each context has one title and a consolidated description, followed by its example and colour-role ledger. Examples sit beside the ledger on wide screens and stack above it on narrow screens. There are no treatment subheadings or per-section proposal disclaimers; the export distinction is explained once at page level.

`src/data/guide.js` contains the eight section descriptions and their fixed role mappings. Treatment selectors, unused alternatives and obsolete name/summary metadata have been removed.

Code uses a clean, mostly monotone foundation whose limited accents carry meaning and whose contrast gives grammar definition. Editor chrome retains its neutral current-line fill, caret and gutter, with violet search text and underlines, and pairs brackets by nesting depth through orange, chartreuse, spring, cyan, violet and rose. The example shows all six nesting levels and matching opening/closing colours. Selected rendered search/bracket text pairings were checked against their real canvas/current-line backgrounds in every flavour and mode.

Flavour and mode still follow the shared header controls and theme query. Section links can be bookmarked or shared, for example `/guide/?theme=Tide&mode=light#editor`. Legacy per-section treatment parameters no longer alter the fixed mappings.

These fixed mappings resolve canonical palette roles, syntax assignments and primitive ramps, and now also supply the application ports where host APIs support them. They do not add generic aliases to the canonical palette JSON, CSS or Tailwind exports. Interface statuses retain their meanings; a syntax colour or ANSI slot is not inherently a status. Low-contrast ANSI slots are shown as labelled colour tiles, not recommended as universal foreground text. Selected prototype pairings were checked, but the guide is not a complete accessibility audit. After changing an approved mapping, regenerate the ports and check their real consumer surfaces; guide-editor drafts do not apply themselves.

## Styling with Tailwind

The site uses **Tailwind CSS 4** through the official `@tailwindcss/vite` integration. `src/layouts/Page.astro` imports `src/styles/main.css` once. Keep complete utility class names in Astro markup and JavaScript-rendered elements so Tailwind can discover them; do not construct class names from colour or state fragments.

`main.css` contains the Tailwind import, self-hosted font declarations, small shared base rules, the responsive `wrap` utility and the landscape's layered gradients. `palette-ramps.css` retains the registered position property and independent preview transitions. Ordinary layout, typography and control states live in utilities. Generated `themes.css` supplies the canonical colour aliases. Keep inclusive legacy breakpoints with variants such as `[@media(max-width:650px)]:`, rather than Tailwind's exclusive `max-[650px]:`.

### Downloadable Tailwind colour tokens

The Downloads page offers the **current variant** as `solai-tide-dark.tailwind.css` (with the selected flavour and mode in the filename), plus [`flavors.tailwind.css`](public/downloads/flavors.tailwind.css) for the whole family. Each variant contains **219 colour tokens**: 17 primitive ramps × 11 grades and 32 existing semantic roles. Names use the `solai-` namespace and kebab case: `accent[7]` becomes `accent-7`, `coAccent[8]` becomes `co-accent-8`, and `status.dangerBackground` becomes `status-danger-background`.

Import the downloaded file after Tailwind in your project's stylesheet:

```css
@import "tailwindcss";
@import "./flavors.tailwind.css";
```

Use classes such as `bg-solai-surface-canvas`, `text-solai-text-primary`, `border-solai-border-strong`, `bg-solai-accent-7` and `bg-solai-accent-primary/50`.

The family defaults to Tide Dark. Set `data-flavor="blue|alter|violet|green|rose"` and `data-mode="dark|light"` on the same root or nested container to select a variant. Its `@theme inline` aliases resolve at the consuming element, including nested themes. The single-variant download uses literal `@theme static` values and does not require theme attributes. Import either the family or one fixed variant, not both.

These exports require Tailwind v4 and contain colours only—not fonts, layout, guide-only mappings or additional syntax aliases. Canonical primitive values, alpha selection and proposed semantic roles are preserved by the serializers. Contrast still depends on the actual foreground/background pairing.

## Palette data

`public/assets/palettes.json` uses schema version 2: select a variant with `flavors[id].modes.dark` or `flavors[id].modes.light`. Each variant includes its primitive ramps, proposed semantic roles, provenance and selected contrast checks. Current-palette JSON/CSS filenames include the mode, such as `solai-tide-light.json`; the whole-family export contains all ten variants. The static family CSS uses `[data-flavor="blue"][data-mode="light"]` selectors and `--solai-*` variables.

The explorer's OKLab interpolation is display-only. All five flavours share Tide's twelve base families in each mode. Ember's former base families have been replaced with those Tide values; its five custom ramps remain source-exact Dolch Alter. The generator recalculates affected semantic/syntax values and contrast checks and updates every live export together.

To regenerate the live data and exports, using Python 3's standard library:

```sh
python3 palette-source/build_flavors.py
```

This updates the canonical JSON, `public/downloads/flavor-studies.json`, `public/downloads/flavors.css`, `public/downloads/flavors.tailwind.css` and `src/styles/themes.css`. It verifies upstream primitive equality and actual contrast pairings, and guards against unintended changes to the existing dark variants. Then run `node palette-source/build_ports.mjs` to refresh application themes, selected web files and the download manifest. Both generators are optional and separate from the Astro build. See `palette-source/README.md` for the live and historical workflows.

## Application themes and downloads

`/downloads/` contains all five flavours in Dark and Light:

- **VS Code / VSCodium:** an installable local VSIX containing all ten themes, plus individual theme-source JSON files.
- **Zed:** a native JSON family containing all ten themes, plus individual one-theme families.
- **Terminals:** Ghostty, Kitty, Alacritty, WezTerm, iTerm2, macOS Terminal, Windows Terminal and Xresources/xterm. Download the selected variant, a per-format all-ten ZIP, or the combined terminal bundle.
- **Web/data:** the existing selected-palette JSON, semantic CSS variables and Tailwind colour tokens, plus complete-family JSON, CSS and Tailwind files.

The shared header selects the download variant and preserves navigation context. Packages that contain all ten variants do not depend on the selected appearance. Without JavaScript or if palette loading fails, individual links explicitly remain Tide Dark; all-theme packages still work. Installation instructions are on the page and in archive bundles. These packages are local downloads, not marketplace listings, and do not install fonts or configure shell prompts.

Ports resolve the approved guide mappings through the existing resolver rather than maintaining a second set of colour choices. Host-specific popup bindings use readable existing neutral/accent grades and restrained selection fills; regression tests cover their foreground/background combinations in all ten variants. Host APIs have limits: Zed exposes search backgrounds rather than match foregrounds/underlines, bracket colouring depends on editor settings, and terminal applications decide how to use ANSI slots. The conventional normal/bright banks and light-mode black/white identities are preserved; some ANSI slots intentionally are not readable as small foreground text.

To regenerate packages, selected web exports and the download manifest, using only built-in Node.js modules:

```sh
nix develop --command node palette-source/build_ports.mjs
```

Run this after palette regeneration or approved guide/port mapping changes. Generated files live under `public/downloads/themes/`, `public/downloads/variants/` and `public/downloads/theme-manifest.json`; generation is separate from the Astro build. See `palette-source/README.md`.

Application theme packages and port mappings are [MIT-licensed](LICENSE), with Dolch’s original notice retained. Artwork, fonts and upstream palette material retain their existing terms. Strict Windows Terminal scheme JSON is distributed in a selected-variant ZIP with both notices; other standalone port files carry the notices as comments or root JSON metadata. The former reference/generators ZIP is preserved at `palette-source/reference/dolch-reference-starter.zip`, outside the served site.

## Guide token editor

Open **http://localhost:4321/guide-editor/** to tune the eight real guide examples. It starts in Tide Light; `?theme=Bloom&mode=dark#editor` selects another preview and section. The page is unlinked and marked `noindex,nofollow`, not access-controlled; it remains part of static builds while present.

Keep this editor available for future tuning. The current guide colours remain unchanged; retaining the tool does not approve or apply any draft proposal.

- Edit all 71 section tokens and five inherited specimen-context colours using palette/syntax references, primitive grade sliders or exact six/eight-digit hex values. The colour picker preserves existing alpha; moving a grade slider selects an opaque primitive directly. Action and ANSI label ink is derived from the composited background.
- Each **flavour × mode** has an independent draft: Tide Light, Tide Dark, Ember Light, and so on through all ten variants. The header selects which draft to edit; token and inherited-context changes affect only that pair. Reset restores only the selected variant. Editor chrome and main-site appearance preferences are unaffected.
- Valid drafts save under the page-local `solai.guide-editor.v2` localStorage key. Existing version-1 shared Light/Dark drafts are copied into each flavour’s matching mode, then saved in the new structure before the old key is removed. Denied/full storage is reported and the old draft is retained if migration cannot save. Invalid input stays in its own variant, leaves the last valid example visible and blocks the combined export until corrected or reset.
- **Copy proposal JSON** and **Download proposal JSON** include edits from all ten variants. The `solai-guide-token-study` version-2 payload uses `appliesTo: "specified-flavour-and-mode"`; each change records `flavour`, `mode`, `section`, `token`, `originalSource`, `source` and `resolved: { before, after }` for that pair. Shared-context entries use section `$context`. Send this proposal back for an explicit canonical update; exporting applies nothing and does not change palette downloads.

The temporary UI lives in `src/pages/guide-editor/index.astro` and `src/scripts/guide-editor.js`. Its specimens share `src/scripts/guide-renderer.js` with the canonical guide, rather than maintaining a second set of examples. The canonical mappings in `src/data/guide.js` remain unchanged.

## Balcony artwork

The active scene is the **AI-generated raster PNG** `art-source/balcony/balcony-generated-reference.png`, not an exported version of the vector study. `art-source/balcony/` also retains the editable SVG, its PNG preview and the earlier grayscale scene SVG/preview; those remain inactive. The retired procedural PNG is preserved as `art-source/landscape-original.png`, with its optional generator alongside it. See `art-source/README.md` before replacing artwork. The live dither and motion treatment takes inspiration from [doll.systems](https://doll.systems/) and [fauux](https://fauux.neocities.org/), particularly the ordered texture in [promo9th.gif](https://fauux.neocities.org/promo9th.gif); their artwork is not bundled.

## Provenance and licenses

Tide preserves Dolch Blue primitives in both modes (`dolch` and `dolch-light`). Ember is adapted: its `fg`, `bg`, `coShades`, `accent` and `coAccent` ramps preserve Dolch Alter (`dolch-alter` and `dolch-light-alter`), while its twelve base families use Tide's corresponding-mode values. Ember's metadata uses `provenance: "adapted"`, `upstreamVariant: null` and `customUpstreamVariant` to identify the original Alter source without claiming a complete upstream-exact palette. Dusk, Viridian and Bloom are independent colour studies. All five flavours share the same base/status ring per mode. Semantic UI mappings remain proposed in every variant. Light roles choose darker grades where needed for their actual text, control and badge pairings. Selected checks remain in the data and generator, but are not a complete accessibility audit.

Original Dolch colors: Renzhi Li (Belleve Invis), MIT, source commit `cf3817311b30d3c21a60ebb0b250d18386e66a30`: https://github.com/be5invis/vscode-theme-dolch. The footer links to the [upstream license](https://github.com/be5invis/vscode-theme-dolch/blob/master/LICENSE); its exact notice is preserved in the source snapshot and embedded in palette exports. Full font notices accompany their definitions in the generated CSS, rather than separate license files. Font links point to [Sora](https://github.com/sora-xor/sora-font) and [Iosevka Solai](https://github.com/Ovyerus/iosevka-solai). The original landscape is procedural artwork; the balcony reference is AI-generated. Artwork is excluded from the repository’s source-code license.

Solai’s original source code and documentation, including website code, generators, application themes and port mappings, are MIT-licensed, © 2026 Solai contributors, under the root [LICENSE](LICENSE). Application theme archives retain their package-scoped MIT notice and the complete Dolch notice; the download page links to their repository sources instead of separate license downloads. Artwork, third-party fonts, upstream palettes and other third-party material retain their existing notices and terms.

## Deploy to Wisp

The intended public address is **https://solai.style/**. Deployment uses the [Wisp CLI](https://docs.wisp.place/cli/) to publish the built `dist/` directory to the `solai` site in an AT Protocol account.

### GitHub Actions

`.github/workflows/deploy.yml` installs the package-manager version from `package.json`, checks JavaScript syntax and the existing editor contrast tests, then builds with Node.js 24. Pull requests only check and build; pushes to `main` also deploy. The workflow can be run manually from **Actions → Check and deploy to Wisp → Run workflow**; choose `main` to deploy. Runs on other branches never publish.

Before enabling deployment:

1. Create or choose the AT Protocol account that will own the site, and create a dedicated app password on its PDS.
2. In the GitHub repository's **Settings → Secrets and variables → Actions**, add a repository **variable** named `WISP_HANDLE` containing that account's full handle or DID, and a repository **secret** named `WISPCTL_APP_PASSWORD` containing the app password. Never commit it or put it in command arguments.
3. Add the GitHub remote, push `main`, and check the workflow run. Missing credentials fail the deployment step explicitly; they do not trigger an interactive login.

Actions are pinned to commit hashes, checkout does not persist Git credentials, and the workflow has read-only repository permissions. Wisp credentials are exposed only to the final deployment step, never to PR builds. Production runs are serialized without cancelling an upload already in progress. PR runs can cancel superseded checks.

The workflow publishes committed palette and theme assets; it does not regenerate them. Regenerate them locally with the documented palette tools before committing colour or port changes.

### Custom domain: one-time setup

After the first successful deployment, authenticate locally and claim the domain for the same account and site. Set `WISP_HANDLE` to that account's handle or DID first:

```sh
pnpm dlx wispctl@2.1.2 login "$WISP_HANDLE"
pnpm dlx wispctl@2.1.2 domain claim "$WISP_HANDLE" --domain solai.style --site solai
```

Login uses OAuth by default. Follow the exact TXT and CNAME instructions returned by the claim; for the apex domain, use your DNS provider's supported CNAME-flattening or ALIAS equivalent. Then verify and check the claim:

```sh
pnpm dlx wispctl@2.1.2 domain verify "$WISP_HANDLE" --domain solai.style
pnpm dlx wispctl@2.1.2 domain status "$WISP_HANDLE" --domain solai.style
```

If the domain was already claimed without a site, attach it with `pnpm dlx wispctl@2.1.2 domain add-site "$WISP_HANDLE" --domain solai.style --site solai`. Domain claiming and DNS changes are not part of CI.

### Local deploy or a future Spindle

`pnpm deploy:wisp` calls `scripts/deploy-wisp.sh`, which pins `wispctl` to `2.1.2` and reads `WISP_HANDLE` and `WISPCTL_APP_PASSWORD` from the environment. Supply those securely, then run:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm deploy:wisp
```

The deploy command does not build for you: always build first. It preserves ordinary static routing, without SPA fallback or directory listing. It publishes immediately; do not run it during routine verification.

The same install/build/deploy commands and environment variables can move to a Tangled Spindle once one is available; no Spindle configuration is assumed here. Keep GitHub and Spindle from deploying the production site concurrently during a cutover.

After publishing, check HTTPS, direct page loads for `/`, `/palette/`, `/guide/` and `/downloads/`, and actual downloads on the public host. Canonical/social metadata and deployed-host browser verification are separate from wiring up this workflow.
