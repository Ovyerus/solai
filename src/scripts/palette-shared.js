let toastTimer;

export function announce(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

export async function copy(value, label) {
  try {
    if (!navigator.clipboard) throw Error('Clipboard unavailable');
    await navigator.clipboard.writeText(value);
    announce(label || 'Copied');
  } catch (error) {
    const fallback = document.querySelector('#copy-fallback');
    fallback.value = value;
    document.querySelector('#copy-dialog').showModal();
    fallback.select();
  }
}

export function contrastInk(hex) {
  const channels = hex.match(/[\da-f]{2}/gi).slice(0, 3)
    .map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000000' : '#FFFFFF';
}

function cssName(value) {
  return value.replace(/\./g, '-').replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
}

export function exportCSS(palette, flavorName, mode) {
  const modeName = mode === 'light' ? 'Light' : 'Dark';
  const provenance = palette.upstreamVariant
    ? `Original Dolch primitives (${palette.upstreamVariant}): Renzhi Li, MIT.`
    : 'Independent colour study using the Dolch generation method.';
  return `/* Solai ${flavorName} ${modeName} · ${provenance} Semantic UI roles are proposed. */\n:root {\n  color-scheme: ${mode};\n` +
    Object.entries(palette.roleValues).map(([key, value]) => `  --solai-${cssName(key)}: ${value};`).join('\n') + '\n}\n';
}

export function exportTailwindCSS(palette, flavorName, mode) {
  const modeName = mode === 'light' ? 'Light' : 'Dark';
  const provenance = palette.upstreamVariant
    ? `Original Dolch primitives (${palette.upstreamVariant}): Renzhi Li, MIT.`
    : 'Independent colour study using the Dolch generation method by Renzhi Li (MIT).';
  const primitives = Object.entries(palette.primitives).flatMap(([family, colors]) =>
    colors.map((value, grade) => `  --color-solai-${cssName(family)}-${grade}: ${value};`));
  const roles = Object.entries(palette.roleValues)
    .map(([key, value]) => `  --color-solai-${cssName(key)}: ${value};`);
  return `/* Solai ${flavorName} ${modeName} · ${provenance}
 * Source: https://github.com/be5invis/vscode-theme-dolch
 * Semantic UI roles are Solai proposals, not upstream assignments.
 * Contrast depends on the paired surface; recheck actual use, including alpha selection.
 * Colour tokens only: no guide-only aliases, syntax aliases beyond roleValues, fonts or layout.
 * Import after your own @import "tailwindcss"; requires Tailwind CSS 4.
 */
@theme static {
${[...primitives, ...roles].join('\n')}
}
:root {
  color-scheme: ${mode};
}
`;
}

export function download(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
