import { initTheme } from './theme.js';
import { copy, exportCSS } from './palette-shared.js';
import { createRamp } from './palette-ramp.js';

const selection = document.querySelector('#palette-selection');
const status = document.querySelector('#palette-status');
const content = document.querySelector('#palette-content');
const copyCSSButton = document.querySelector('#copy-css');
const rampTables = [...document.querySelectorAll('[data-ramp-table]')].map(section => ({
  id: section.dataset.rampTable,
  region: section.querySelector('[role="region"]'),
  list: section.querySelector('[data-ramp-list]'),
}));
const customFamilies = ['fg', 'bg', 'coShades', 'accent', 'coAccent'];

let currentSelection;
let renderedRampMode;

function renderRampTables(data, mode, modeName) {
  if (renderedRampMode === mode) return;

  const basePalette = data.flavors.blue.modes[mode];
  const baseFamilies = Object.keys(basePalette.primitives).filter(family => !customFamilies.includes(family));
  for (const table of rampTables) {
    const isBase = table.id === 'base';
    const palette = isBase ? basePalette : data.flavors[table.id].modes[mode];
    const name = isBase ? 'Base colours' : data.flavors[table.id].name;
    const context = `${name} · ${modeName}`;
    const families = isBase ? baseFamilies : customFamilies;
    const onCopy = (hex, message) => copy(hex, `${context} · ${message}`);
    const ramps = families.map(family => {
      const ramp = createRamp(family, palette.primitives[family], onCopy);
      ramp.setAttribute('aria-label', `${context} · ${family} colour ramp`);
      return ramp;
    });
    table.region.setAttribute('aria-label', `${context} ramps`);
    table.list.replaceChildren(...ramps);
  }
  renderedRampMode = mode;
}

function renderPalette({ data, flavour, mode, palette }) {
  const flavorName = data.flavors[flavour].name;
  const modeName = mode === 'light' ? 'Light' : 'Dark';
  renderRampTables(data, mode, modeName);
  selection.textContent = `${flavorName} · ${modeName} selected theme`;
  document.title = `${flavorName} ${modeName} palette — Solai`;
  currentSelection = { palette, flavorName, mode, modeName };
  copyCSSButton.setAttribute('aria-label', `Copy selected theme CSS, ${flavorName} ${modeName}`);
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
