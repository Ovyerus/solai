import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeThemes } from './model.mjs';
import { renderVSCode } from './vscode.mjs';
import { renderZed } from './zed.mjs';

const data = JSON.parse(await readFile(new URL('../../public/assets/palettes.json', import.meta.url), 'utf8'));
const themes = makeThemes(data);

function luminance(hex) {
  const rgb = hex.slice(1, 7).match(/../g).map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}

function readable(foreground, background, context) {
  const a = luminance(foreground), b = luminance(background);
  const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  assert(ratio >= 4.5, `${context}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1`);
}

for (const theme of themes) {
  test(`${theme.name}: VS Code popup labels and matches remain readable`, () => {
    const c = JSON.parse(renderVSCode(theme)).colors;
    const pairs = [
      ['descriptionForeground', 'quickInput.background'],
      ['list.deemphasizedForeground', 'quickInput.background'],
      ['list.highlightForeground', 'list.hoverBackground'],
      ['list.focusHighlightForeground', 'list.activeSelectionBackground'],
      ['editorSuggestWidget.highlightForeground', 'editorSuggestWidget.background'],
      ['editorSuggestWidget.focusHighlightForeground', 'editorSuggestWidget.selectedBackground'],
      ['editorSuggestWidgetStatus.foreground', 'editorSuggestWidget.background'],
      ['editorHoverWidget.highlightForeground', 'editorHoverWidget.background'],
      ['peekViewTitleDescription.foreground', 'peekViewTitle.background'],
    ];
    for (const [foreground, background] of pairs) readable(c[foreground], c[background], foreground);
  });

  test(`${theme.name}: Zed shared popup foregrounds survive hover and selection`, () => {
    const c = JSON.parse(renderZed([theme])).themes[0].style;
    for (const foreground of ['text', 'text.muted', 'text.placeholder', 'text.accent']) {
      for (const background of ['elevated_surface.background', 'element.hover', 'element.selected', 'ghost_element.hover', 'ghost_element.selected']) {
        readable(c[foreground], c[background], `${foreground} / ${background}`);
      }
    }
  });
}
