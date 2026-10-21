import { guideSections } from '../../src/data/guide.js';
import { resolveRole } from '../../src/scripts/guide-renderer.js';
import { contrastInk } from '../../src/scripts/palette-shared.js';

export const json = value => JSON.stringify(value, null, 2) + '\n';

export function withAlpha(hex, alphaByte) {
  const alpha = typeof alphaByte === 'number' ? alphaByte.toString(16).padStart(2, '0') : alphaByte;
  return hex.slice(0, 7) + alpha.toUpperCase();
}

export function composite(foreground, background) {
  const alpha = foreground.length === 9 ? parseInt(foreground.slice(7), 16) / 255 : 1;
  return '#' + [1, 3, 5].map(index => Math.round(
    parseInt(foreground.slice(index, index + 2), 16) * alpha +
    parseInt(background.slice(index, index + 2), 16) * (1 - alpha),
  ).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function makeThemes(data) {
  return data.flavorOrder.flatMap(flavor => data.modeOrder.map(mode => {
    const family = data.flavors[flavor];
    const palette = family.modes[mode];
    const modeName = mode === 'light' ? 'Light' : 'Dark';
    const roles = Object.fromEntries(guideSections.map(section => [section.id,
      Object.fromEntries(section.roles.map(role => [role.key, resolveRole(role, palette, mode).value])),
    ]));
    const terminal = roles.terminal;
    return {
      flavor, flavorName: family.name, mode, modeName,
      name: `Solai ${family.name} ${modeName}`,
      slug: `solai-${family.name.toLowerCase()}-${mode}`,
      palette, ui: palette.roleValues, roles,
      ansi: Array.from({ length: 16 }, (_, index) => roles.ansi[`slot${index}`]),
      terminal: {
        background: terminal.background,
        foreground: terminal.foreground,
        cursor: terminal.cursor,
        cursorText: contrastInk(terminal.cursor),
        // Formats disagree about alpha selection. Bake the same actual canvas composite for every port.
        selection: composite(terminal.selection, terminal.background),
        selectionForeground: terminal.foreground,
      },
    };
  }));
}
