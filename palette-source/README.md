# Optional palette generators

These standalone Python scripts use only the standard library. They are optional tools, not an Astro build step. `build_flavors.py` regenerates live Solai data; the other tools below preserve the historical Dolch reference workflow.

## Live Solai palettes

Run from the project root:

```sh
python3 palette-source/build_flavors.py
```

This reads `reference/all-generated-palettes.json` and `contrast-and-roles.json`, and writes:

- `public/assets/palettes.json`: canonical schema v2, with `flavors[id].modes.dark/light`
- `public/downloads/flavor-studies.json`: the matching whole-family download
- `public/downloads/flavors.css`: primitive and semantic `--solai-*` variables scoped by `data-flavor` and `data-mode`
- `public/downloads/flavors.tailwind.css`: Tailwind v4 colour tokens for the complete family, with a Tide Dark fallback and root/nested `data-flavor` + `data-mode` selection
- `src/styles/themes.css`: main-page UI variables, inline Tailwind aliases and native colour scheme for all ten variants

Tide preserves the exact upstream Blue dark/light primitive sets. All five flavours share its twelve base families per mode. Ember preserves only the five custom Dolch Alter ramps (`fg`, `bg`, `coShades`, `accent`, `coAccent`); its former Alter base colours are replaced with corresponding-mode Tide values before generation. Its provenance is `adapted`, `upstreamVariant` is null, and `customUpstreamVariant` identifies the original Alter source. Dusk, Viridian and Bloom keep their established custom hue choices. All semantic aliases are independent Solai proposals.

Light grades run from light to dark. Role grades are chosen against actual paired surfaces and button/badge fills, rather than merely reusing dark-mode indices. The generator recalculates 21 selected contrast checks per dark variant and 35 per light variant. Normal text targets 4.5:1 and essential borders 3:1; these checks are not a complete accessibility audit. It rejects failing pairs and unintended changes to the existing complete dark variants. Regeneration is deterministic and does not depend on previous output values.

Generation asserts exact shared base parameters, LCH ramps and hex values for every flavour, plus exact upstream values for Tide and Ember's retained custom families. Keep the normal dark-output guard intact when regenerating; the intentional Ember normalization is already integrated into the live snapshot.

The Tailwind export serializes the canonical 17 × 11 primitive stops and 32 `roleValues` entries per variant into 219 `--color-solai-*` tokens. Names are kebab-cased consistently with the existing CSS export. `@theme inline` maps utilities to scoped `--solai-*` values so nested themes resolve correctly. Import it after `@import "tailwindcss"` in a Tailwind v4 consumer; it does not bundle Tailwind, fonts or layout.

The home page's single-variant download is produced by `exportTailwindCSS` in `src/scripts/palette-shared.js`, using the same canonical primitive/role inventory and naming rule, with literal `@theme static` values. Keep both serializations in sync. Neither exports the guide-only mappings or adds syntax aliases.

## Historical tools

`build_tokens.py` reads `palette.json` and writes historical `dolch.css` and `terminal-proposal.json` in this folder:

```sh
python3 palette-source/build_tokens.py
```

`reference/reproduce_palette.py` independently reproduces the four upstream Dolch variants from the included `source-snapshot.json`. It writes `dolch-palette.json`, per-variant published JSON and the MIT notice alongside itself. Its `dolch-palette.json` is the historical input represented by the supplied `all-generated-palettes.json`; the script does not replace that file automatically.

```sh
python3 palette-source/reference/reproduce_palette.py
```

Live data retains the Solai names Tide, Ember, Dusk, Viridian and Bloom. The reference snapshot and historical tools retain Dolch's original labels. Do not copy historical output over live Solai metadata. The original downloadable bundle remains untouched at `public/downloads/dolch-reference-starter.zip`.

Source repository: https://github.com/be5invis/vscode-theme-dolch
Source commit: `cf3817311b30d3c21a60ebb0b250d18386e66a30`
Original colors: Renzhi Li (Belleve Invis), MIT. See `LICENSE-Dolch.txt`.
