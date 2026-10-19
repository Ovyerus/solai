import { contrastInk } from './palette-shared.js';

export function createRamp(family, colors, onCopy) {
  const ramp = document.createElement('div');
  ramp.className = 'palette-ramp';
  ramp.dataset.family = family;
  ramp.setAttribute('role', 'group');
  ramp.setAttribute('aria-label', `${family} colour ramp`);

  const label = document.createElement('div');
  label.className = 'ramp-family';
  label.textContent = family;

  const track = document.createElement('div');
  track.className = 'ramp-track';

  const position = (grade) => `${grade / (colors.length - 1) * 100}%`;
  const gradient = document.createElement('div');
  gradient.className = 'ramp-gradient';
  gradient.setAttribute('aria-hidden', 'true');
  gradient.style.background = `linear-gradient(90deg in oklab, ${colors.map((hex, grade) => `${hex} ${position(grade)}`).join(', ')})`;

  const preview = document.createElement('button');
  preview.type = 'button';
  preview.className = 'ramp-window';
  preview.tabIndex = -1;
  const previewGrade = document.createElement('span');
  previewGrade.className = 'ramp-window-grade';
  const previewValue = document.createElement('span');
  previewValue.className = 'ramp-window-value';
  preview.append(previewGrade, previewValue);

  let selected = Math.floor(colors.length / 2);
  const stops = colors.map((hex, grade) => {
    const stop = document.createElement('button');
    stop.type = 'button';
    stop.className = 'ramp-stop';
    stop.dataset.grade = String(grade);
    stop.dataset.color = hex;
    stop.style.left = position(grade);
    stop.style.setProperty('--stop-color', hex);
    stop.style.setProperty('--stop-ink', contrastInk(hex));
    stop.title = `${family}[${grade}] · ${hex}`;
    stop.setAttribute('aria-label', `Copy ${family}[${grade}], ${hex}`);

    const dot = document.createElement('span');
    dot.className = 'ramp-stop-dot';
    dot.setAttribute('aria-hidden', 'true');
    stop.append(dot);

    stop.addEventListener('focus', (event) => {
      select(grade);
      if (!track.contains(event.relatedTarget)) settlePosition();
    });
    stop.addEventListener('click', () => {
      select(grade);
      onCopy(hex, `${family}[${grade}] · ${hex} copied`);
    });
    stop.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowLeft') next = Math.max(0, grade - 1);
      else if (event.key === 'ArrowRight') next = Math.min(colors.length - 1, grade + 1);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = colors.length - 1;
      else return;
      event.preventDefault();
      select(next);
      stops[next].focus({ preventScroll: true });
      stops[next].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
    });
    return stop;
  });

  function select(grade) {
    selected = grade;
    const hex = colors[grade];
    preview.style.setProperty('--ramp-position', position(grade));
    preview.style.backgroundColor = hex;
    preview.style.color = contrastInk(hex);
    preview.dataset.grade = String(grade);
    preview.dataset.color = hex;
    preview.title = `Copy ${family}[${grade}] · ${hex}`;
    preview.setAttribute('aria-label', `Copy ${family}[${grade}], ${hex}`);
    previewGrade.textContent = `[${grade}]`;
    previewValue.textContent = hex;
    stops.forEach((stop, index) => {
      stop.tabIndex = index === grade ? 0 : -1;
      if (index === grade) stop.setAttribute('aria-current', 'true');
      else stop.removeAttribute('aria-current');
    });
  }

  function settlePosition() {
    // Enter at this row's new stop; only movement within the row should slide.
    // Leave opacity transitions alone so row changes still crossfade.
    for (const transition of preview.getAnimations()) {
      if (transition.transitionProperty === '--ramp-position') transition.finish();
    }
  }

  function selectFromPointer(event) {
    // Touch scrolling stays native. A tap selects; dragging never captures it.
    if (event.type === 'pointermove' && event.pointerType === 'touch') return;
    // The overlay must not block scrubbing, but pressing it copies the value
    // already displayed rather than sampling its in-flight animation position.
    if (event.type === 'pointerdown' && preview.contains(event.target)) return;
    const bounds = gradient.getBoundingClientRect();
    if (!bounds.width) return;
    const fraction = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const grade = Math.round(fraction * (colors.length - 1));
    if (grade !== selected) select(grade);
  }

  track.addEventListener('pointerenter', (event) => {
    selectFromPointer(event);
    settlePosition();
  });
  track.addEventListener('pointermove', selectFromPointer);
  track.addEventListener('pointerdown', selectFromPointer);
  preview.addEventListener('click', () => {
    // Read the selected original, not a transition position or sampled colour.
    onCopy(colors[selected], `${family}[${selected}] · ${colors[selected]} copied`);
  });
  track.addEventListener('click', (event) => {
    if (!event.target.closest('button')) {
      onCopy(colors[selected], `${family}[${selected}] · ${colors[selected]} copied`);
    }
  });

  track.append(gradient, ...stops, preview);
  ramp.append(label, track);
  select(selected);
  return ramp;
}
