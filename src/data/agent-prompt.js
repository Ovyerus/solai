// Shared by the static Downloads page and its appearance controller.
export function createAgentPrompt(variant) {
  const absolute = (path) => new URL(path, "https://solai.style").href;
  return `Implement ${variant.name} in this project.

First read https://solai.style/llms.txt for the integration guide and https://solai.style/guide/ for colour meanings. Inspect this project's stack and existing theme system before changing anything. Keep its layout, components and behaviour; do not clone the Solai website or add a framework or dependency just to apply colours.

Requested flavour: ${variant.flavorName} (data-flavor="${variant.flavor}"). Requested mode: ${variant.modeName} (data-mode="${variant.mode}").

Use the published exports, not guessed hex values:
- Plain CSS, fixed variant (32 semantic variables): ${absolute(variant.downloads.css)}
- Tailwind CSS v4, fixed variant (219 colour tokens): ${absolute(variant.downloads.tailwind)}
- Variant JSON for other stacks: ${absolute(variant.downloads.json)}
- Switchable CSS family: https://solai.style/downloads/flavors.css
- Switchable Tailwind v4 family: https://solai.style/downloads/flavors.tailwind.css
- Shiki, editor and terminal formats: https://solai.style/downloads/theme-manifest.json

Use the export that fits the existing stack, not all of them. Preserve existing appearance controls, system preferences and persistence. Prefer semantic surface/text/accent/status roles; keep readable action text, keyboard focus and status labels. Check contrast on real backgrounds, including hover, selection and disabled states. Preserve the relevant Solai/Dolch licence notices. Colours do not include fonts or artwork.

Implement the theme, run the project's relevant checks, and report changes and any unverified states. If you cannot fetch the guide or exports, ask me for the files instead of inventing colours.`;
}
