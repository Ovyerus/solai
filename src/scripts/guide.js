import { guideSections } from '../data/guide.js';
import { initTheme } from './theme.js';
import { contrastInk } from './palette-shared.js';

const sections = guideSections.map(definition => ({
  definition,
  element: document.querySelector(`[data-guide-section="${definition.id}"]`),
}));
let initialRender = true;

function node(tag, className, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  for (const child of Array.isArray(children) ? children : [children]) {
    element.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return element;
}

function token(role, text, className = '') {
  const element = node('span', `guide-token ${className}`, text);
  element.style.color = `var(--study-${role})`;
  return element;
}

function resolveRole(role, palette, mode) {
  const reference = typeof role.source === 'string' ? role.source : role.source[mode];
  if (palette.roleValues[reference]) {
    return { ...role, reference, sourceKey: palette.roles[reference].sourceKey, value: palette.roleValues[reference] };
  }
  if (reference.startsWith('syntax.')) {
    const syntax = palette.syntaxRoles[reference.slice(7)];
    if (syntax) return { ...role, reference, sourceKey: syntax.sourceKey, value: syntax.value };
  }
  const primitive = /^([A-Za-z][A-Za-z0-9]*)\[(\d+)\]$/.exec(reference);
  const value = primitive && palette.primitives[primitive[1]]?.[Number(primitive[2])];
  if (value) return { ...role, reference, sourceKey: reference, value };
  throw Error(`Unavailable guide source: ${reference}`);
}

function surfaceSpecimen() {
  const canvas = node('div', 'study-surfaces', [
    node('div', 'study-surface-title', 'Harbour notebook'),
    node('p', 'study-surface-caption', 'Canvas · the space around the work'),
  ]);
  const panel = node('div', 'study-surface-panel', [
    node('strong', '', 'Evening field notes'),
    node('p', '', 'Panel · a group of related observations'),
  ]);
  const raised = node('div', 'study-surface-raised', [
    node('strong', '', 'Lake walk · 19:40'),
    node('p', '', 'Raised · the item in the foreground'),
  ]);
  const hover = node('div', 'study-surface-hover', 'Hover / pressed fill · selected note');
  raised.append(hover);
  panel.append(raised);
  canvas.append(panel);
  return canvas;
}

function interfaceSpecimen(values) {
  const sample = node('div', 'study-interface');
  const nav = node('div', 'study-interface-nav', [token('text', 'Field station', 'study-interface-title'), token('link', 'Overview', 'study-link'), token('link', 'Readings', 'study-link')]);
  const content = node('div', 'study-interface-content', [
    token('text', 'Tonight’s observations', 'study-interface-heading'),
    token('muted', 'Last synced at 20:14 · 4 entries'),
    node('p', '', ['The ', node('span', 'study-selected', 'harbour route'), ' is selected.']),
  ]);
  const action = node('span', 'study-action', 'Save note · primary action');
  action.style.backgroundColor = values.action;
  action.style.color = contrastInk(values.action);
  content.append(node('div', 'study-actions', [action, node('span', 'study-focus', 'Keyboard focus') ]));
  const signals = node('div', 'study-signals', [
    token('success', '✓ Saved · success'),
    token('warning', '! Unsynced · warning'),
    token('danger', '× Failed upload · danger'),
    token('info', 'i Offline copy · information'),
  ]);
  sample.append(nav, content, signals);
  return sample;
}

function codeSpecimen() {
  return node('pre', 'study-code', node('code', '', [
    token('comment', '// Gather the lights along the water.'), '\n',
    token('keyword', 'function'), ' ', token('function', 'harbourLights'), token('punctuation', '('), token('identifier', 'route'), token('punctuation', ': '), token('type', 'Route'), token('punctuation', ') {'), '\n',
    '  ', token('keyword', 'const'), ' ', token('identifier', 'limit'), ' ', token('operator', '='), ' ', token('literal', '3'), token('punctuation', ';'), '\n',
    '  ', token('keyword', 'return'), ' ', token('identifier', 'route'), token('punctuation', '.'), token('member', 'stops'), '\n',
    '    ', token('punctuation', '.'), token('function', 'filter'), token('punctuation', '('), token('identifier', 'stop'), ' ', token('operator', '=>'), ' ', token('identifier', 'stop'), token('punctuation', '.'), token('member', 'lit'), token('punctuation', ')'), '\n',
    '    ', token('punctuation', '.'), token('function', 'slice'), token('punctuation', '('), token('literal', '0'), token('punctuation', ', '), token('identifier', 'limit'), token('punctuation', ')'), '\n',
    '    ', token('punctuation', '.'), token('function', 'map'), token('punctuation', '('), token('identifier', 'stop'), ' ', token('operator', '=>'), ' ', token('string', '"Light at "'), ' ', token('operator', '+'), ' ', token('identifier', 'stop'), token('punctuation', '.'), token('member', 'name'), token('punctuation', ');'), '\n',
    token('punctuation', '}'),
  ]));
}

function proseSpecimen() {
  const article = node('article', 'study-prose', [
    node('p', 'study-prose-marker', 'Night walks / 07'),
    node('h3', '', 'What the water remembers'),
    node('p', '', ['After sunset, the glasshouse holds the last warmth. We record each lamp with ', token('code', 'light.level', 'study-inline-code'), ' and follow the reflections home.']),
    node('blockquote', '', '“The bright marks tell us where to look; the quiet page gives us room to read.”'),
    node('p', '', [token('marker', '01 · '), 'Compare the readings at the same hour.']),
    node('p', '', [token('link', 'Field notes and measurement method ↗', 'study-link')]),
  ]);
  return article;
}

function editorSpecimen() {
  const bracket = (text, depth) => {
    const element = token(`bracket${depth % 6}`, text, 'study-bracket');
    element.dataset.bracketDepth = String(depth);
    return element;
  };
  const line = (number, children, active = false) => node('div', `study-editor-line${active ? ' is-current' : ''}`, [
    token(active ? 'activeNumber' : 'lineNumber', String(number), 'study-line-number'),
    node('span', 'study-editor-source', children),
  ]);
  const frame = node('div', 'study-editor', [
    node('div', 'study-window-title', 'harbour.ts · editor chrome'),
    node('div', 'study-editor-lines', [
      line(12, ['function lights', bracket('(', 0), 'route', bracket(')', 0), ' ', bracket('{', 0)]),
      line(13, ['  const ', token('search', 'harbour', 'study-search'), ' = route.stops;']),
      line(14, ['  return ', token('search', 'harbour', 'study-search'), '.map', bracket('(', 1), bracket('(', 2), 'light', token('cursor', '▏', 'study-cursor'), bracket(')', 2), ' => ', bracket('(', 2), bracket('{', 3)], true),
      line(15, ['    labels: ', bracket('[', 4), 'String', bracket('(', 5), 'light.name', bracket(')', 5), bracket(']', 4), ',']),
      line(16, ['  ', bracket('}', 3), bracket(')', 2), bracket(')', 1), ';']),
      line(17, [bracket('}', 0)]),
    ]),
    node('div', 'study-editor-footer', 'Rainbow brackets · 6 nesting colours · 2 search matches'),
  ]);
  return frame;
}

function changesSpecimen() {
  const row = (role, symbol, before, value, after, detail) => {
    const content = [before, token(role, value, 'study-changed-word'), after];
    const label = token(role, detail, 'study-change-detail');
    return node('div', `study-change study-change-${role}`, [
      token(role, symbol, 'study-change-mark'), node('code', '', content), label,
    ]);
  };
  return node('div', 'study-changes', [
    node('div', 'study-window-title', 'route.ts · change review'),
    row('removed', '−', 'const stop = ', '"Old quay"', ';', 'Removed line'),
    row('added', '+', 'const stop = ', '"Glasshouse"', ';', 'Added line'),
    row('changed', '~', 'const departure = ', '"20:10"', ';', 'Changed value'),
    row('conflict', '!', 'Unresolved departure: ', '"20:10" / "20:30"', '', 'Conflict · attention needed'),
    row('hint', 'i', '', 'Compare local and incoming times.', '', 'Hint · information'),
  ]);
}

function terminalSpecimen() {
  const prompt = node('div', 'study-terminal-command', [token('prompt', 'garden@harbour ~/notes $ '), 'cat evening.txt']);
  const output = node('div', 'study-terminal-output', [
    node('div', '', '20:14  glasshouse lights on'),
    node('div', '', [node('span', 'study-terminal-selection', '20:18  quay lamps reflected in the water')]),
    node('div', '', '20:21  last train across the bridge'),
  ]);
  const next = node('div', 'study-terminal-command', [token('prompt', 'garden@harbour ~/notes $ '), token('cursor', '▌', 'study-cursor')]);
  return node('div', 'study-terminal', [
    node('div', 'study-terminal-title', 'Evening log · terminal chrome'), prompt, output, next,
    node('p', 'study-terminal-note', 'Output uses the terminal foreground here; program ANSI colours are a separate choice below.'),
  ]);
}

function ansiSpecimen(roles) {
  return node('div', 'study-ansi', [
    node('p', 'study-ansi-note', '16 conventional slots · labels use contrasting ink, not the slot as a text colour.'),
    node('div', 'study-ansi-grid', roles.map(role => {
      const tile = node('div', 'study-ansi-tile', [node('strong', '', role.label), node('code', '', role.value)]);
      tile.style.backgroundColor = role.value;
      tile.style.color = contrastInk(role.value);
      tile.dataset.ansiSlot = role.key.slice(4);
      return tile;
    })),
    node('p', 'study-ansi-note', 'The application assigns meaning to each slot. “Bright” is a separate palette grade, not white mixed into a colour.'),
  ]);
}

const renderers = {
  surfaces: surfaceSpecimen,
  interface: interfaceSpecimen,
  code: codeSpecimen,
  prose: proseSpecimen,
  editor: editorSpecimen,
  changes: changesSpecimen,
  terminal: terminalSpecimen,
  ansi: (values, roles) => ansiSpecimen(roles),
};

function roleListing(role) {
  const swatch = node('span', 'guide-role-swatch');
  swatch.style.backgroundColor = role.value;
  swatch.setAttribute('aria-hidden', 'true');
  const source = node('code', 'guide-role-source', role.sourceKey);
  const value = node('code', 'guide-role-value', role.value);
  const reference = node('span', 'guide-role-reference', role.reference === role.sourceKey ? 'Primitive source' : role.reference);
  return node('article', 'guide-role', [
    node('h4', '', [swatch, role.label]),
    node('div', 'guide-role-resolution', [source, value]),
    reference,
    node('p', 'guide-role-meaning', role.meaning),
  ]);
}

function renderSection(section, { palette, mode }) {
  const roles = section.definition.roles.map(role => resolveRole(role, palette, mode));
  const values = Object.fromEntries(roles.map(role => [role.key, role.value]));
  const element = section.element;
  const specimen = element.querySelector('[data-guide-specimen]');
  specimen.style.cssText = '';
  for (const role of roles) specimen.style.setProperty(`--study-${role.key}`, role.value);
  specimen.replaceChildren(renderers[section.definition.id](values, roles));
  element.querySelector('[data-guide-roles]').replaceChildren(...roles.map(roleListing));
  element.querySelector('.guide-ready').hidden = false;
}

function unavailable() {
  document.querySelector('#guide-selection').textContent = 'Palette unavailable';
  document.querySelector('#guide-status').textContent = 'The palette data could not be loaded, so live studies and theme controls are unavailable. Reload to try again, or use the static palette data linked below.';
  document.querySelector('#guide-status').hidden = false;
  for (const section of sections) {
    section.element.querySelector('.guide-ready').hidden = true;
  }
  document.querySelector('#theme-select').disabled = true;
  document.querySelectorAll('[data-mode-option]').forEach(button => { button.disabled = true; });
}

document.querySelector('#guide-status').hidden = false;

initTheme({
  onChange(theme) {
    document.querySelector('#guide-selection').textContent = `${theme.data.flavors[theme.flavour].name} · ${theme.mode === 'light' ? 'Light' : 'Dark'}`;
    for (const section of sections) renderSection(section, theme);
    document.querySelector('#guide-status').hidden = true;
    if (initialRender) {
      initialRender = false;
      const target = sections.find(section => `#${section.definition.id}` === location.hash);
      if (target) requestAnimationFrame(() => target.element.scrollIntoView({ behavior: 'instant', block: 'start' }));
    }
  },
  onError: unavailable,
});
