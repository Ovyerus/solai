import { initTheme } from './theme.js';
import { copy, contrastInk, exportCSS } from './palette-shared.js';
import { createRamp } from './palette-ramp.js';

const selection = document.querySelector('#palette-selection');
const status = document.querySelector('#palette-status');
const content = document.querySelector('#palette-content');
const copyCSSButton = document.querySelector('#copy-css');
const rampList = document.querySelector('#palette-ramp-list');
const neutralSwatches = document.querySelector('#neutral-swatches');
const accentSwatches = document.querySelector('#accent-swatches');
const buttonRatio = document.querySelector('#button-ratio');
const contrastCount = document.querySelector('#contrast-count');

const neutralRoles = [
  ['Canvas', 'surface.canvas'],
  ['Panel', 'surface.panel'],
  ['Raised', 'surface.raised'],
  ['Border', 'border.subtle'],
  ['Text', 'text.secondary'],
  ['Emphasis', 'text.emphasis'],
];
const accentFamilies = [
  ['Red', 'red'],
  ['Orange', 'orange'],
  ['Yellow', 'yellow'],
  ['Chartreuse', 'chartreuse'],
  ['Green', 'green'],
  ['Spring green', 'spring'],
  ['Cyan', 'cyan'],
  ['Azure', 'azure'],
  ['Blue', 'blue'],
  ['Violet', 'violet'],
  ['Magenta', 'magenta'],
  ['Rose', 'rose'],
];

let currentSelection;

function createSwatch(label, hex, source, role) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'swatch group min-w-0 rounded-[2px] border-0 bg-transparent p-0 text-left';
  const origin = role ? `${role} · ${source}` : source;
  button.title = `${label} · ${origin} · copy ${hex}`;
  button.setAttribute('aria-label', `Copy ${label}, ${hex}, ${origin}`);

  const colour = document.createElement('span');
  colour.className = 'swatch-color flex h-[92px] items-center justify-center rounded-[2px] border border-solai-border-strong font-mono text-[12px] leading-[normal] text-(--swatch-ink) [@media(max-width:650px)]:h-[74px]';
  colour.style.backgroundColor = hex;
  colour.style.setProperty('--swatch-ink', contrastInk(hex));
  const hint = document.createElement('span');
  hint.className = 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100';
  hint.textContent = '↗ COPY';
  hint.setAttribute('aria-hidden', 'true');
  colour.append(hint);

  const name = document.createElement('span');
  name.className = 'swatch-name mt-[9px] block font-sans text-[12px] leading-[normal] whitespace-nowrap';
  name.textContent = label;
  const value = document.createElement('span');
  value.className = 'swatch-hex mt-[3px] mb-[16px] block font-mono text-[12px] leading-[normal] text-solai-text-muted';
  value.textContent = hex;

  button.append(colour, name, value);
  button.addEventListener('click', () => copy(hex, `${label} · ${hex} copied`));
  return button;
}

function createRoleSwatch(palette, label, key) {
  return createSwatch(label, palette.roleValues[key], palette.roles[key].sourceKey, key);
}

function renderPalette({ data, flavour, mode, palette }) {
  const flavorName = data.flavors[flavour].name;
  const modeName = mode === 'light' ? 'Light' : 'Dark';
  const ramps = Object.entries(palette.primitives).map(([family, colors]) =>
    createRamp(family, colors, copy),
  );
  const neutrals = neutralRoles.map(([label, key]) => createRoleSwatch(palette, label, key));
  const accents = [
    createRoleSwatch(palette, 'Lead', 'accent.primary'),
    createRoleSwatch(palette, 'Companion', 'accent.secondary'),
    ...accentFamilies.map(([label, family]) =>
      createSwatch(label, palette.primitives[family][8], `${family}[8]`),
    ),
  ];
  const primaryButton = palette.contrastChecks.find(check => check.name === 'Primary button');

  rampList.replaceChildren(...ramps);
  neutralSwatches.replaceChildren(...neutrals);
  accentSwatches.replaceChildren(...accents);
  buttonRatio.textContent = `${primaryButton.ratio.toFixed(2)}:1`;
  buttonRatio.title = `${primaryButton.foreground} on ${primaryButton.background}; target ${primaryButton.minimum}:1`;
  contrastCount.textContent = String(palette.contrastChecks.length);
  selection.textContent = `${flavorName} · ${modeName}`;
  document.title = `${flavorName} ${modeName} palette — Solai`;
  currentSelection = { palette, flavorName, mode, modeName };
  copyCSSButton.disabled = false;
  content.hidden = false;
  status.hidden = true;
}

copyCSSButton.addEventListener('click', () => {
  if (!currentSelection) return;
  const { palette, flavorName, mode, modeName } = currentSelection;
  copy(exportCSS(palette, flavorName, mode), `${flavorName} ${modeName} CSS copied`);
});

initTheme({
  onChange: renderPalette,
  onError() {
    currentSelection = undefined;
    copyCSSButton.disabled = true;
    content.hidden = true;
    selection.textContent = 'Palette unavailable';
    status.textContent = 'Palette data could not be loaded. Reload this page to try again, or use the downloads on the home page.';
    status.hidden = false;
  },
});
