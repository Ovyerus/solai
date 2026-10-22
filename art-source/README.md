# Artwork sources

The active hero loads `public/assets/balcony.png`, an unchanged copy of `balcony/balcony-generated-reference.png`. `src/scripts/hero-art.js` recolours it with Bayer fine ordered dithering, subtle drift and pointer response. The separate `public/assets/balcony-dither.png` is a baked Tide Dark Bayer poster for no-script/loading/failure states. Keep both public assets in sync when changing the selected source. There is no procedural skyline overlay.

## Original landscape

`landscape-original.png` preserves the retired mountain/lake PNG formerly served from `public/assets/landscape.png`. `generate_landscape.py` is its deterministic procedural generator. It needs NumPy and Pillow only if you choose to regenerate the artwork. From the project root, this writes a comparison copy without touching the active image:

```sh
python3 art-source/generate_landscape.py art-source/landscape-regenerated.png
```

## Balcony source and vector studies

- `balcony/solai-balcony-study.svg`: editable vector concept with a neighboring planted high-rise, balcony railing, lake, mountains and ridge wind turbines
- `balcony/solai-balcony-study-preview.png`: raster preview of that SVG
- `balcony/solai-scene-greyscale.svg`: earlier editable grayscale scene and the balcony generator's input
- `balcony/solai-scene-greyscale-preview.png`: preview of the earlier scene
- `balcony/balcony-generated-reference.png`: active AI-generated raster source, not a vector file or exact rendering of the SVG; copied unchanged into `public/assets/balcony.png`
- `balcony/build_balcony_study.py`: original vector builder, with paths adapted to this folder; Python standard library only

The SVG contains named groups for direct editing in a vector editor or as XML. Running the builder below overwrites the balcony SVG from its grayscale input, so preserve direct edits first:

```sh
python3 art-source/balcony/build_balcony_study.py
```

The builder does not update its PNG preview or the active hero. Export a new preview from your SVG editor if needed. The other SVGs and previews remain independent studies; do not silently substitute them for the selected raster. Both renderers use the fixed Bayer fine matrix with 2px cells and the approved settings in `src/scripts/hero-settings.js`, with Ripple as the sole live pointer effect. There are no image-tweaking controls or PNG export; the old Soft/ASCII renderers, reveal circle and `drawSkyline` function have been removed.
