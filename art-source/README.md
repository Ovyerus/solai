# Artwork sources

The site currently loads `public/assets/landscape.png` at `/assets/landscape.png`; its left-shore skyline is drawn separately by `drawSkyline` in `src/scripts/app.js`.

## Original landscape

`generate_landscape.py` is the deterministic procedural generator. It needs NumPy and Pillow only if you choose to regenerate the artwork. From the project root, this writes a comparison copy without touching the active image:

```sh
python3 art-source/generate_landscape.py art-source/landscape-regenerated.png
```

## Balcony alternatives (not active)

- `balcony/solai-balcony-study.svg`: editable vector concept with a neighboring planted high-rise, balcony railing, lake, mountains and ridge wind turbines
- `balcony/solai-balcony-study-preview.png`: raster preview of that SVG
- `balcony/solai-scene-greyscale.svg`: earlier editable grayscale scene and the balcony generator's input
- `balcony/solai-scene-greyscale-preview.png`: preview of the earlier scene
- `balcony/balcony-generated-reference.png`: separate AI-generated raster reference, not a vector file or exact rendering of the SVG
- `balcony/build_balcony_study.py`: original vector builder, with paths adapted to this folder; Python standard library only

The SVG contains named groups for direct editing in a vector editor or as XML. Running the builder below overwrites the balcony SVG from its grayscale input, so preserve direct edits first:

```sh
python3 art-source/balcony/build_balcony_study.py
```

The builder does not update its PNG preview. Export a new preview from your SVG editor if needed. Switching the website to balcony art also requires removing the existing `drawSkyline` call and function; see `AGENTS.md`. No artwork here is automatically copied into the running site.
