# Optional palette and theme generators

These generators are optional tools, not Astro build steps. `build_flavors.py` uses Python’s standard library to regenerate canonical Solai data. `build_ports.mjs` uses built-in Node.js modules to generate application themes and the download catalog. The other tools below preserve the historical Dolch reference workflow.

## Live Solai palettes

Run from the project root:

```sh
python3 palette-source/build_flavors.py
```

This reads `reference/all-generated-palettes.json`, `contrast-and-roles.json` and the original `LICENSE` text in `reference/source-snapshot.json`, and writes:

- `public/assets/palettes.json`: canonical schema v2, with `flavors[id].modes.dark/light`
- `public/downloads/flavor-studies.json`: the matching whole-family download
- `public/downloads/flavors.css`: primitive and semantic `--solai-*` variables scoped by `data-flavor` and `data-mode`
- `public/downloads/flavors.tailwind.css`: Tailwind v4 colour tokens for the complete family, with a Tide Dark fallback and root/nested `data-flavor` + `data-mode` selection
- `src/styles/themes.css`: main-page UI variables, inline Tailwind aliases and native colour scheme for all ten variants

Tide preserves the exact upstream Blue dark/light primitive sets. All five flavours share its twelve base families per mode. Ember preserves only the five custom Dolch Alter ramps (`fg`, `bg`, `coShades`, `accent`, `coAccent`); its former Alter base colours are replaced with corresponding-mode Tide values before generation. Its provenance is `adapted`, `upstreamVariant` is null, and `customUpstreamVariant` identifies the original Alter source. Dusk, Viridian and Bloom keep their established custom hue choices. All semantic aliases are independent Solai proposals.

Light grades run from light to dark. Role grades are chosen against actual paired surfaces and button/badge fills, rather than merely reusing dark-mode indices. The generator recalculates 21 selected contrast checks per dark variant and 35 per light variant. Normal text targets 4.5:1 and essential borders 3:1; these checks are not a complete accessibility audit. It rejects failing pairs and unintended changes to the existing complete dark variants. Regeneration is deterministic and does not depend on previous output values.

Generation asserts exact shared base parameters, LCH ramps and hex values for every flavour, plus exact upstream values for Tide and Ember's retained custom families. Keep the normal dark-output guard intact when regenerating; the intentional Ember normalization is already integrated into the live snapshot.

The Tailwind export serializes the canonical 17 × 11 primitive stops and 32 `roleValues` entries per variant into 219 `--color-solai-*` tokens. Names are kebab-cased consistently with the existing CSS export. `@theme inline` maps utilities to scoped `--solai-*` values so nested themes resolve correctly. Import it after `@import "tailwindcss"` in a Tailwind v4 consumer; it does not bundle Tailwind, fonts or layout.

The selected-variant files on `/downloads/` are generated with `exportCSS` and `exportTailwindCSS` from `src/scripts/palette-shared.js`, using the existing canonical inventory and naming rules. Selected CSS contains the semantic custom properties; selected Tailwind contains all 219 primitive/semantic tokens with literal `@theme static` values. Keep both serializations in sync with family exports. Neither adds guide-only aliases to web exports.

The canonical JSON source metadata includes the complete upstream notice as `source.licenseText`; family exports, selected serializers and copied CSS embed that same notice. This replaces separate served license files without changing colours, token names or role mappings.

## Application ports and download catalog

After changing canonical palettes, approved guide mappings or application formatters, run from the project root:

```sh
nix develop --command node palette-source/build_ports.mjs
```

This reads `public/assets/palettes.json`, the approved `src/data/guide.js` definitions, the existing `resolveRole` resolver and the exact upstream `LICENSE` text preserved in `reference/source-snapshot.json`. It does not read or apply guide-editor drafts. It writes:

- `public/downloads/themes/`: VS Code/VSCodium VSIX and JSON sources, Zed family/individual JSON, eight terminal formats, selected Windows Terminal ZIPs and per-format/combined terminal bundles.
- `public/downloads/variants/`: the thirty selected JSON/CSS/Tailwind exports using the existing serializers, not a parallel implementation.
- `public/downloads/theme-manifest.json`: the catalog consumed by the Astro downloads page and its shared-theme controller.

`ports/model.mjs` resolves the shared colours; `vscode.mjs`, `zed.mjs` and `terminals.mjs` implement host-specific bindings. Terminal selection is composited over the actual terminal canvas once so formats without alpha reproduce the same fill. The sixteen ANSI entries retain the approved mode-aware mapping, including conventional black/white identities. Do not replace them with status colours or claim every slot is readable as foreground text.

Editor frame dividers use the guide's quieter `surfaces.border` mapping. Zed's default `border` follows that subtle tier, not the canonical `border.strong` token; VS Code's main frame already uses it. Focus, selection, diagnostics and active indent guides retain their distinct stronger colours. This port-specific choice does not change canonical palette roles or website styling.

Ghostty downloads use `.conf` filenames, which its theme lookup accepts verbatim, so Astro’s static preview serves them as files rather than extensionless routes. Keep that suffix in the page, archive entries and example `theme` setting; use the exact downloaded filename. See the [Ghostty theme reference](https://ghostty.org/docs/config/reference#theme).

`ports/archive.mjs` builds deterministic UTF-8 ZIP32 archives using Node’s `crc32` and deflate support, with fixed 1980 timestamps. VSIX packages contain a real extension manifest, theme contributions and both license notices. JSON ports carry full notices in permitted root metadata; Windows Terminal’s strict scheme schema does not permit that metadata, so its selected download is a ZIP containing pure scheme JSON plus the notices. XML/text formats carry comment notices. Never put unsupported colour fields into native schemas or add commands/fonts/layout to a colour scheme.

The full notices stay embedded in native theme files and in `LICENSE-Themes.txt` / `LICENSE-Dolch.txt` entries inside ZIP/VSIX packages; no standalone license files are emitted. The catalog links to the [application theme license](https://github.com/Ovyerus/solai/blob/main/palette-source/README.md#application-theme-license) below and the [upstream Dolch license](https://github.com/be5invis/vscode-theme-dolch/blob/master/LICENSE).

Check the popup contrast regressions after mapping changes:

```sh
node --test palette-source/ports/ports.test.mjs
```

These tests cover readable normal/hover/selected popup text in every editor variant, not a complete application accessibility audit. Native host overrides, syntax in selected text, contrast-adjustment settings and emitted terminal colours still need real-consumer inspection. Zed cannot reproduce separate search-match text/underline colours; its six nesting accents require the user’s bracket-colour setting. Keep these limits visible in download instructions.

## Application theme license

MIT License

Copyright (c) 2026 Solai contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This MIT license covers the Solai application theme ports and their port mappings only. It does not relicense the website, artwork, fonts or other palette exports.

## Historical tools

`build_tokens.py` reads `palette.json` and writes historical `dolch.css` and `terminal-proposal.json` in this folder. It embeds the full upstream notice from `reference/source-snapshot.json` in the CSS comment and JSON metadata:

```sh
python3 palette-source/build_tokens.py
```

`reference/reproduce_palette.py` independently reproduces the four upstream Dolch variants from the included `source-snapshot.json`. It writes `dolch-palette.json`, with the full upstream notice in its `licenseText` metadata, and per-variant published JSON alongside itself. It does not emit a standalone license file. Its `dolch-palette.json` is the historical input represented by the supplied `all-generated-palettes.json`; the script does not replace that file automatically.

```sh
python3 palette-source/reference/reproduce_palette.py
```

Live data retains the Solai names Tide, Ember, Dusk, Viridian and Bloom. The reference snapshot and historical tools retain Dolch's original labels. Do not copy historical output over live Solai metadata. The former reference/generators download is preserved unchanged at `palette-source/reference/dolch-reference-starter.zip`, outside `public/`; do not restore it to the site without a request.

Source repository: https://github.com/be5invis/vscode-theme-dolch
Source commit: `cf3817311b30d3c21a60ebb0b250d18386e66a30`
Original colors: Renzhi Li (Belleve Invis), MIT. See the [upstream license](https://github.com/be5invis/vscode-theme-dolch/blob/master/LICENSE); its exact original text is preserved in the `LICENSE` field of `reference/source-snapshot.json`.
