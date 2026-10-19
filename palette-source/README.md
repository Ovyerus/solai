# Optional palette generators

These are the original standalone Python scripts and complete inputs used for the palette studies. They use only the Python standard library. They are not an Astro build step and do not modify `public/` or `dist/`.

Run from the project root:

```sh
python3 palette-source/build_flavors.py
python3 palette-source/build_tokens.py
```

`build_flavors.py` reads `reference/all-generated-palettes.json` and `contrast-and-roles.json`, then writes historical `flavor-studies.json` and `flavors.css` here. It asserts original Blue/Alter primitive equality and selected contrast checks. `build_tokens.py` reads `palette.json` and writes `dolch.css` and `terminal-proposal.json` here.

`reference/reproduce_palette.py` independently reproduces the four upstream Dolch variants from the included `source-snapshot.json`. It writes `dolch-palette.json`, per-variant published JSON and the MIT notice alongside itself. Its `dolch-palette.json` is the historical input represented by the supplied `all-generated-palettes.json`; the script does not replace that file automatically.

```sh
python3 palette-source/reference/reproduce_palette.py
```

Current site data is `public/assets/palettes.json`. These earlier generators use Blue, Alter, Violet, Green and Rose labels, while Solai displays Tide, Ember, Dusk, Viridian and Bloom. Their primitives and semantic role values match this package's baseline. Preserve Solai metadata when deliberately updating the live data. The untouched historical downloadable bundle remains in `public/downloads/dolch-reference-starter.zip`.

Source repository: https://github.com/be5invis/vscode-theme-dolch
Source commit: `cf3817311b30d3c21a60ebb0b250d18386e66a30`
Original colors: Renzhi Li (Belleve Invis), MIT. See `LICENSE-Dolch.txt`.
