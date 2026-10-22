import { guideSections } from "../data/guide.js";
import { resolveRole, renderSpecimen } from "./guide-renderer.js";
import { copy, download } from "./palette-shared.js";

const storageKey = "solai.guide-editor.v2";
const legacyStorageKey = "solai.guide-editor.v1";
const modes = ["dark", "light"];
const flavours = ["blue", "alter", "violet", "green", "rose"];
const flavourNames = {
  tide: "blue",
  ember: "alter",
  dusk: "violet",
  viridian: "green",
  bloom: "rose",
};
const primitivePattern = /^([A-Za-z][A-Za-z0-9]*)\[(\d+)\]$/;
const contextRoles = [
  {
    key: "canvas",
    label: "Specimen canvas",
    source: "surface.canvas",
    meaning: "Inherited background behind each specimen, not the editor page.",
  },
  {
    key: "text",
    label: "Inherited text",
    source: "text.primary",
    meaning: "Default text for specimen content without its own section token.",
  },
  {
    key: "secondary",
    label: "Inherited secondary text",
    source: "text.secondary",
    meaning: "Supporting specimen notes and window chrome.",
  },
  {
    key: "border",
    label: "Inherited subtle border",
    source: "border.subtle",
    meaning: "Shared decorative dividers inside the specimens.",
  },
  {
    key: "strong",
    label: "Inherited strong border",
    source: "border.strong",
    meaning: "Shared specimen outlines and essential control edges.",
  },
];
const definitions = [
  ...contextRoles.map((role) => ({
    section: "$context",
    sectionTitle: "Shared specimen context",
    role,
  })),
  ...guideSections.flatMap((section) =>
    section.roles.map((role) => ({
      section: section.id,
      sectionTitle: section.title,
      role,
    })),
  ),
];
const sortedDefinitions = [...definitions].sort(
  (a, b) => compare(a.section, b.section) || compare(a.role.key, b.role.key),
);
const assignments = Object.fromEntries(
  flavours.map((id) => [
    id,
    Object.fromEntries(modes.map((mode) => [mode, {}])),
  ]),
);
const invalidInputs = Object.fromEntries(
  flavours.map((id) => [
    id,
    Object.fromEntries(modes.map((mode) => [mode, new Map()])),
  ]),
);
const rows = new Map();
const root = document.documentElement;
const select = document.querySelector("#theme-select");
const modeButtons = [...document.querySelectorAll("[data-mode-option]")];
const status = document.querySelector("#editor-status");
const storageStatus = document.querySelector("#editor-storage-status");
const exportField = document.querySelector("#editor-export");
const copyButton = document.querySelector("#editor-copy");
const downloadButton = document.querySelector("#editor-download");
const resetVariantButton = document.querySelector("#editor-reset-variant");
const sectionElements = new Map(
  guideSections.map((section) => [
    section.id,
    document.querySelector(`[data-editor-section="${section.id}"]`),
  ]),
);
let data;
let flavour = "blue";
let mode = "light";
let exportText = "";
let storageWarning = "";
let legacyDraftPending = false;

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function variantLabel(targetFlavour = flavour, targetMode = mode) {
  return `${data.flavors[targetFlavour].name} ${targetMode === "light" ? "Light" : "Dark"}`;
}

function invalidInputCount() {
  let count = 0;
  for (const id of flavours) {
    for (const targetMode of modes) count += invalidInputs[id][targetMode].size;
  }
  return count;
}

function persistDraft() {
  localStorage.setItem(storageKey, JSON.stringify({ version: 2, assignments }));
  if (legacyDraftPending) {
    localStorage.removeItem(legacyStorageKey);
    legacyDraftPending = false;
  }
}

function tokenId(definition) {
  return `${definition.section}/${definition.role.key}`;
}

function originalSource(definition, targetMode) {
  const source = definition.role.source;
  return typeof source === "string" ? source : source[targetMode];
}

function sourceFor(definition, targetFlavour = flavour, targetMode = mode) {
  return (
    assignments[targetFlavour][targetMode][definition.section]?.[
      definition.role.key
    ] ?? originalSource(definition, targetMode)
  );
}

function resolve(
  definition,
  source,
  targetFlavour = flavour,
  targetMode = mode,
) {
  return resolveRole(
    { ...definition.role, source },
    data.flavors[targetFlavour].modes[targetMode],
    targetMode,
  );
}

function validSource(input, targetFlavour = flavour, targetMode = mode) {
  const trimmed = input.trim();
  if (!trimmed)
    throw Error(
      "Enter a semantic source, syntax.NAME, FAMILY[0–10], or #RRGGBB / #RRGGBBAA.",
    );
  const source = /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(trimmed)
    ? trimmed.toUpperCase()
    : trimmed;
  resolveRole(
    { source },
    data.flavors[targetFlavour].modes[targetMode],
    targetMode,
  );
  return source;
}

function assign(definition, source) {
  const section = definition.section;
  const key = definition.role.key;
  const draft = assignments[flavour][mode];
  if (source === originalSource(definition, mode)) {
    if (draft[section]) {
      delete draft[section][key];
      if (!Object.keys(draft[section]).length) delete draft[section];
    }
  } else {
    draft[section] ??= {};
    draft[section][key] = source;
  }
}

function showStorage(message) {
  storageStatus.textContent = message;
  storageStatus.hidden = !message;
}

function restoreDraft() {
  let stored;
  let migrating = false;
  try {
    stored = localStorage.getItem(storageKey);
    if (stored === null) {
      stored = localStorage.getItem(legacyStorageKey);
      migrating = stored !== null;
      legacyDraftPending = migrating;
    }
  } catch {
    storageWarning =
      "Local storage is unavailable. Edits work in this tab, but are not saved for reload; copy or download the JSON proposal.";
    showStorage(storageWarning);
    return;
  }
  if (stored === null) return;
  try {
    const draft = JSON.parse(stored);
    if (
      draft?.version !== (migrating ? 1 : 2) ||
      !draft.assignments ||
      typeof draft.assignments !== "object" ||
      Array.isArray(draft.assignments)
    )
      throw Error("Unknown draft format");
    let skipped = false;
    let restored = 0;
    for (const targetFlavour of flavours) {
      for (const targetMode of modes) {
        const saved = migrating
          ? draft.assignments[targetMode]
          : draft.assignments[targetFlavour]?.[targetMode];
        if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
          skipped = true;
          continue;
        }
        for (const definition of definitions) {
          const input = saved[definition.section]?.[definition.role.key];
          if (input === undefined) continue;
          try {
            if (typeof input !== "string") throw Error("Invalid stored source");
            const source = validSource(input, targetFlavour, targetMode);
            if (source !== originalSource(definition, targetMode)) {
              const variant = assignments[targetFlavour][targetMode];
              variant[definition.section] ??= {};
              variant[definition.section][definition.role.key] = source;
              restored++;
            }
          } catch {
            skipped = true;
          }
        }
      }
    }
    if (migrating) {
      try {
        persistDraft();
      } catch {
        storageWarning =
          "Previous shared drafts were loaded into all ten variants, but could not be saved. The old draft is retained; copy or download the JSON proposal before reloading.";
        showStorage(storageWarning);
        return;
      }
    }
    if (skipped) {
      storageWarning =
        "Some stored draft entries were invalid and were not restored. Valid entries are available; export a proposal to keep a separate copy.";
      showStorage(storageWarning);
    } else if (migrating) {
      showStorage(
        "Previous shared Light/Dark drafts were copied into ten independent variant drafts and saved on this device. Further edits affect only the selected flavour and mode.",
      );
    } else if (restored) {
      showStorage(
        "Local variant drafts restored on this device. Only valid assignments are saved; this does not change the canonical guide.",
      );
    }
  } catch {
    storageWarning =
      "The stored draft could not be read and was not restored. New edits still work; copy or download the JSON proposal.";
    showStorage(storageWarning);
  }
}

function saveDraft() {
  try {
    persistDraft();
    storageWarning = "";
    const invalidCount = invalidInputCount();
    showStorage(
      invalidCount
        ? "Last valid assignments saved on this device. Invalid source text is not saved; fix it before exporting."
        : "Valid draft saved on this device. Canonical guide mappings and palette files are unchanged.",
    );
  } catch {
    storageWarning =
      "Local storage is unavailable or full. These edits are not saved for reload; copy or download the JSON proposal.";
    showStorage(storageWarning);
  }
}

function readPreviewURL() {
  const url = new URL(location.href);
  const requested = url.searchParams.get("theme")?.toLowerCase();
  const id = flavourNames[requested] || requested;
  flavour = flavours.includes(id) ? id : "blue";
  mode = url.searchParams.get("mode") === "dark" ? "dark" : "light";
}

function updateURL() {
  const url = new URL(location.href);
  url.searchParams.set("theme", flavour);
  url.searchParams.set("mode", mode);
  try {
    history.replaceState(
      history.state,
      "",
      url.pathname + url.search + url.hash,
    );
  } catch {
    // Editing remains available in environments that deny history writes.
  }
}

function applyPreview(updateHistory = true) {
  const palette = data.flavors[flavour].modes[mode];
  root.dataset.flavor = flavour;
  root.dataset.mode = mode;
  select.value = flavour;
  modeButtons.forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.modeOption === mode),
    ),
  );
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = palette.roleValues["surface.canvas"];
  for (const link of document.querySelectorAll("[data-editor-link]")) {
    const url = new URL(link.getAttribute("href"), location.href);
    url.searchParams.set("theme", flavour);
    url.searchParams.set("mode", mode);
    link.href = url.pathname + url.search + url.hash;
  }
  document.querySelector("#editor-selection").textContent =
    `${variantLabel()} — editing this variant only. The other nine flavour/mode drafts are independent.`;
  populateSources();
  for (const definition of definitions) updateRow(definition, true);
  renderSections();
  updateExport();
  if (updateHistory) updateURL();
}

function contextValues() {
  return Object.fromEntries(
    definitions
      .filter((definition) => definition.section === "$context")
      .map((definition) => [
        definition.role.key,
        resolve(definition, sourceFor(definition)).value,
      ]),
  );
}

function renderSections(onlySection) {
  const context = contextValues();
  for (const section of guideSections) {
    if (onlySection && section.id !== onlySection) continue;
    const roles = section.roles.map((role) => {
      const definition = { section: section.id, role };
      return resolve(definition, sourceFor(definition));
    });
    const specimen = sectionElements
      .get(section.id)
      .querySelector("[data-editor-specimen]");
    const scroll = [...specimen.querySelectorAll("*")].map((element) => [
      element.scrollLeft,
      element.scrollTop,
    ]);
    const specimenScroll = [specimen.scrollLeft, specimen.scrollTop];
    renderSpecimen(specimen, section.id, roles, context);
    // Keep a scrolled code specimen in place while its colours change.
    [...specimen.querySelectorAll("*")].forEach((element, index) => {
      if (scroll[index]) {
        element.scrollLeft = scroll[index][0];
        element.scrollTop = scroll[index][1];
      }
    });
    specimen.scrollLeft = specimenScroll[0];
    specimen.scrollTop = specimenScroll[1];
  }
}

function updateRow(definition, syncSource = false) {
  const row = rows.get(tokenId(definition));
  const source = sourceFor(definition);
  const resolved = resolve(definition, source);
  const original = resolve(definition, originalSource(definition, mode));
  const invalid = invalidInputs[flavour][mode].get(tokenId(definition));
  if (syncSource) row.source.value = invalid?.text ?? source;
  row.element.dataset.edited = String(
    source !== originalSource(definition, mode),
  );
  row.source.setAttribute("aria-invalid", String(Boolean(invalid)));
  row.source.setCustomValidity(invalid ? invalid.message : "");
  row.error.hidden = !invalid;
  row.error.textContent = invalid?.message ?? "";
  row.reset.disabled = source === originalSource(definition, mode) && !invalid;
  row.colour.value = resolved.value.slice(0, 7);
  row.resolved.textContent = `${resolved.sourceKey} → ${resolved.value}${invalid ? " · last valid preview" : ""}`;
  row.original.textContent = `${original.reference} → ${original.sourceKey} → ${original.value}`;
  const primitive = primitivePattern.exec(resolved.sourceKey);
  const ramp =
    primitive && data.flavors[flavour].modes[mode].primitives[primitive[1]];
  row.grade.disabled = !ramp;
  row.grade.style.backgroundImage = ramp
    ? `linear-gradient(90deg, ${ramp.join(", ")})`
    : "none";
  row.grade.value = primitive ? primitive[2] : "0";
  row.gradeValue.textContent = primitive
    ? `${primitive[1]} · grade ${primitive[2]} / 10`
    : "Fixed hex · no primitive grade";
  row.grade.setAttribute(
    "aria-valuetext",
    primitive
      ? `${primitive[1]} grade ${primitive[2]}, ${resolved.value}`
      : "Fixed colour; grade unavailable",
  );
}

function changed(definition, source, syncSource) {
  invalidInputs[flavour][mode].delete(tokenId(definition));
  assign(definition, source);
  updateRow(definition, syncSource);
  renderSections(
    definition.section === "$context" ? undefined : definition.section,
  );
  updateExport();
  saveDraft();
  updateURL();
}

function createRows() {
  const template = document.querySelector("#editor-token-template");
  for (const definition of definitions) {
    const fragment = template.content.cloneNode(true);
    const element = fragment.querySelector("[data-token-row]");
    const field = (name) => element.querySelector(`[data-token-${name}]`);
    const row = {
      element,
      source: field("source"),
      colour: field("colour"),
      grade: field("grade"),
      gradeValue: field("grade-value"),
      resolved: field("resolved"),
      original: field("original"),
      error: field("error"),
      reset: field("reset"),
    };
    const id = `editor-${definition.section === "$context" ? "context" : definition.section}-${definition.role.key}`;
    element.id = id;
    element.dataset.tokenRow = `${definition.section}.${definition.role.key}`;
    field("label").textContent = definition.role.label;
    field("key").textContent =
      definition.section === "$context"
        ? `--${definition.role.key}`
        : definition.role.key;
    const meaning = field("meaning");
    if (meaning) {
      meaning.textContent = definition.role.meaning;
      meaning.id = `${id}-meaning`;
    }
    row.resolved.id = `${id}-resolved`;
    row.original.id = `${id}-original`;
    row.error.id = `${id}-error`;
    for (const name of ["source", "colour", "grade"]) {
      const input = row[name];
      input.id = `${id}-${name}`;
      input.setAttribute(
        "aria-label",
        `${definition.sectionTitle}: ${definition.role.label} ${name}`,
      );
      input.setAttribute(
        "aria-describedby",
        [meaning?.id, row.resolved.id, row.original.id, row.error.id]
          .filter(Boolean)
          .join(" "),
      );
      const label = input.closest("label");
      if (label) label.htmlFor = input.id;
    }
    row.gradeValue.setAttribute("for", row.grade.id);
    row.error.setAttribute("aria-live", "polite");
    row.reset.setAttribute(
      "aria-label",
      `Reset ${definition.sectionTitle}: ${definition.role.label}`,
    );
    row.source.addEventListener("input", () => {
      let source;
      try {
        source = validSource(row.source.value);
      } catch {
        const message =
          "Unknown source. Use a listed semantic or syntax source, FAMILY[0–10], or exactly 6 or 8 hexadecimal digits after #. The last valid colour is still previewed.";
        invalidInputs[flavour][mode].set(tokenId(definition), {
          text: row.source.value,
          message,
        });
        updateRow(definition);
        updateExport();
        if (!storageWarning)
          showStorage(
            "Invalid source text is kept only in this tab. The last valid preview is unchanged; fix the input before exporting. Only valid assignments can be saved.",
          );
        return;
      }
      changed(definition, source, false);
    });
    row.source.addEventListener("change", () => {
      if (!invalidInputs[flavour][mode].has(tokenId(definition)))
        row.source.value = sourceFor(definition);
    });
    row.colour.addEventListener("input", () => {
      const current = resolve(definition, sourceFor(definition));
      const alpha = current.value.length === 9 ? current.value.slice(7) : "";
      changed(definition, `${row.colour.value}${alpha}`.toUpperCase(), true);
    });
    row.grade.addEventListener("input", () => {
      const current = resolve(definition, sourceFor(definition));
      const primitive = primitivePattern.exec(current.sourceKey);
      if (!primitive) return;
      changed(definition, `${primitive[1]}[${Number(row.grade.value)}]`, true);
    });
    row.reset.addEventListener("click", () =>
      changed(definition, originalSource(definition, mode), true),
    );
    rows.set(tokenId(definition), row);
    const target =
      definition.section === "$context"
        ? document.querySelector("#editor-context-controls")
        : sectionElements
            .get(definition.section)
            .querySelector("[data-editor-controls]");
    target.append(fragment);
  }
}

function populateSources() {
  const palette = data.flavors[flavour].modes[mode];
  const sources = [
    ...Object.keys(palette.roleValues),
    ...Object.keys(palette.syntaxRoles).map((name) => `syntax.${name}`),
    ...Object.entries(palette.primitives).flatMap(([family, ramp]) =>
      ramp.map((_, grade) => `${family}[${grade}]`),
    ),
  ];
  const options = sources.sort(compare).map((source) => {
    const option = document.createElement("option");
    option.value = source;
    return option;
  });
  document.querySelector("#editor-source-options").replaceChildren(...options);
}

function updateExport() {
  const changes = [];
  for (const targetFlavour of flavours) {
    for (const targetMode of modes) {
      for (const definition of sortedDefinitions) {
        const source = sourceFor(definition, targetFlavour, targetMode);
        const beforeSource = originalSource(definition, targetMode);
        if (source === beforeSource) continue;
        changes.push({
          flavour: targetFlavour,
          mode: targetMode,
          section: definition.section,
          token: definition.role.key,
          originalSource: beforeSource,
          source,
          resolved: {
            before: resolve(definition, beforeSource, targetFlavour, targetMode)
              .value,
            after: resolve(definition, source, targetFlavour, targetMode).value,
          },
        });
      }
    }
  }
  exportText =
    JSON.stringify(
      {
        format: "solai-guide-token-study",
        version: 2,
        scope: "guide-only",
        appliesTo: "specified-flavour-and-mode",
        preview: { flavour, mode },
        changes,
      },
      null,
      2,
    ) + "\n";
  exportField.value = exportText;
  const invalidCount = invalidInputCount();
  copyButton.disabled = Boolean(invalidCount);
  downloadButton.disabled = Boolean(invalidCount);
  const currentCount = changes.filter(
    (change) => change.flavour === flavour && change.mode === mode,
  ).length;
  document.querySelector("#editor-change-count").textContent =
    `${changes.length} changed assignment${changes.length === 1 ? "" : "s"} across all ten variants · ${currentCount} in ${variantLabel()}${invalidCount ? ` · ${invalidCount} invalid source${invalidCount === 1 ? "" : "s"}` : ""}`;
  resetVariantButton.textContent = `Reset ${variantLabel()}`;
  resetVariantButton.disabled =
    !currentCount && !invalidInputs[flavour][mode].size;
  status.hidden = !invalidCount;
  const invalidVariants = flavours.flatMap((id) =>
    modes
      .filter((targetMode) => invalidInputs[id][targetMode].size)
      .map((targetMode) => variantLabel(id, targetMode)),
  );
  status.textContent = invalidCount
    ? `Export paused: fix or reset invalid source inputs in ${invalidVariants.join(", ")}. Specimens and JSON retain the last valid assignments. Invalid text is not saved for reload.`
    : "";
}

function scrollToDeepLink() {
  if (!location.hash) return;
  let id;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  if (target)
    requestAnimationFrame(() =>
      target.scrollIntoView({ block: "start", behavior: "instant" }),
    );
}

function unavailable() {
  status.hidden = false;
  status.textContent =
    "Palette data could not be loaded. Editing, specimens and exports are unavailable. Reload to try again; the canonical guide link remains available.";
  document.querySelector("#editor-selection").textContent =
    "Preview unavailable · canonical files are unchanged.";
  document.querySelectorAll("[data-editor-ready]").forEach((element) => {
    element.hidden = true;
  });
  select.disabled = true;
  modeButtons.forEach((button) => {
    button.disabled = true;
  });
  copyButton.disabled = true;
  downloadButton.disabled = true;
  resetVariantButton.disabled = true;
}

async function start() {
  status.hidden = false;
  const header = document.querySelector("body > header");
  if (header) {
    const measureHeader = () => {
      root.style.setProperty(
        "--editor-header-height",
        `${Math.ceil(header.getBoundingClientRect().height)}px`,
      );
    };
    measureHeader();
    new ResizeObserver(measureHeader).observe(header);
  }
  readPreviewURL();
  select.value = flavour;
  modeButtons.forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.modeOption === mode),
    ),
  );
  try {
    const response = await fetch("/assets/palettes.json");
    if (!response.ok) throw Error("Palette unavailable");
    data = await response.json();
    // Resolve all originals before exposing controls; a partial payload is not editable.
    for (const targetMode of modes) {
      for (const id of flavours) {
        for (const definition of definitions)
          resolve(
            definition,
            originalSource(definition, targetMode),
            id,
            targetMode,
          );
      }
    }
    restoreDraft();
    createRows();
    applyPreview();
    document.querySelectorAll("[data-editor-ready]").forEach((element) => {
      element.hidden = false;
    });
    select.disabled = false;
    modeButtons.forEach((button) => {
      button.disabled = false;
    });
    select.addEventListener("change", () => {
      if (!flavours.includes(select.value)) return;
      flavour = select.value;
      applyPreview();
    });
    modeButtons.forEach((button) =>
      button.addEventListener("click", () => {
        if (!modes.includes(button.dataset.modeOption)) return;
        mode = button.dataset.modeOption;
        applyPreview();
      }),
    );
    resetVariantButton.addEventListener("click", () => {
      if (
        !window.confirm(
          `Reset every ${variantLabel()} guide assignment? The other nine variants will be kept.`,
        )
      )
        return;
      assignments[flavour][mode] = {};
      invalidInputs[flavour][mode].clear();
      applyPreview();
      saveDraft();
    });
    copyButton.addEventListener("click", () => {
      if (!copyButton.disabled)
        copy(exportText, "Guide-only JSON proposal copied");
    });
    downloadButton.addEventListener("click", () => {
      if (!downloadButton.disabled)
        download(
          exportText,
          "application/json;charset=utf-8",
          "solai-guide-token-study.json",
        );
    });
    window.addEventListener("popstate", () => {
      readPreviewURL();
      applyPreview(false);
      scrollToDeepLink();
    });
    window.addEventListener("hashchange", scrollToDeepLink);
    scrollToDeepLink();
  } catch {
    unavailable();
  }
}

start();
