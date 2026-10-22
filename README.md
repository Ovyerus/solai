<h1 align="center">
  <a href="https://solai.style/">
    <img src="src/assets/solai-wordmark.svg" alt="Solai" width="320">
  </a>
</h1>

Five colour themes for editors, terminals and the web, each in light and dark. Quiet neutrals, deliberate accents, and a little solarpunk after sunset.

**[Explore the palettes](https://solai.style/palette/)** · **[Previews](https://solai.style/#examples)** · **[Colour guide](https://solai.style/guide/)** · **[Downloads](https://solai.style/downloads/)**

## Flavours

| Flavour | Accent |
| --- | --- |
| Tide | Cyan-blue |
| Ember | Warm amber |
| Dusk | Violet |
| Viridian | Leaf-green |
| Bloom | Rose |

All five share a set of twelve base colour families, with their own foreground, background, tinted-neutral and accent ramps. The website lets you compare every flavour, inspect and copy exact colours, and see them in editor, terminal and after-dark interface specimens.

The [colour guide](https://solai.style/guide/) explains how the colours are used for surfaces, text, code, prose, editor chrome, changes, terminal interfaces and ANSI slots.

## Get a theme

The [Downloads page](https://solai.style/downloads/) includes installation instructions and all ten flavour/mode combinations:

- **VS Code / VSCodium:** a local VSIX containing all ten themes, plus individual theme JSON files.
- **Zed:** a native theme family containing all ten themes, plus individual variants.
- **Terminals:** Ghostty, Kitty, Alacritty, WezTerm, iTerm2, macOS Terminal, Windows Terminal and Xresources/xterm. Choose one variant or an all-theme bundle.
- **Web projects:** palette JSON, CSS custom properties and Tailwind CSS v4 colour tokens, for one variant or the complete family.

These are downloadable files, not marketplace listings. Application themes do not bundle fonts or replace your existing application settings. The previews on the website are colour specimens, not live applications.

## Origins and credits

Solai began with [Dolch](https://github.com/be5invis/vscode-theme-dolch) by Renzhi Li (Belleve Invis). Tide preserves Dolch Blue; Ember combines Dolch Alter’s five custom ramps with the shared Blue base colours. Dusk, Viridian and Bloom are independent colour studies. Solai’s semantic colour assignments are proposed mappings, not upstream Dolch assignments or a complete accessibility audit.

The website uses [Sora](https://github.com/sora-xor/sora-font) and [Iosevka Solai](https://github.com/Ovyerus/iosevka-solai). Presentation takes inspiration from [Madoromi](https://madoromi.moonwit.ch/) and [doll.systems](https://doll.systems/). The balcony scene is AI-generated, with a two-colour dither treatment.

### Licensing

Solai’s original code and documentation, including the application themes and port mappings, are [MIT-licensed](LICENSE), © 2026 Solai contributors.

Artwork is not covered by this license. Third-party fonts, upstream palettes and other third-party material retain their existing terms, including the original [Dolch MIT notice](https://github.com/be5invis/vscode-theme-dolch/blob/master/LICENSE). Font notices are preserved alongside the font definitions in the website’s CSS; palette exports retain their own notices and provenance.

## Working on Solai

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, checks, source layout, design constraints, palette and theme generation, and deployment. The optional generators have their own [palette](palette-source/README.md) and [artwork](art-source/README.md) guides.
