import { guideSections } from "../data/guide.js";
import { initTheme } from "./theme.js";
import { node, resolveRole, renderSpecimen } from "./guide-renderer.js";

const sections = guideSections.map((definition) => ({
  definition,
  element: document.querySelector(`[data-guide-section="${definition.id}"]`),
}));
let initialRender = true;

function roleListing(role) {
  const swatch = node(
    "span",
    "guide-role-swatch inline-block size-[17px] shrink-0 rounded-[2px] border border-solai-border-strong",
  );
  swatch.style.backgroundColor = role.value;
  swatch.setAttribute("aria-hidden", "true");
  const source = node(
    "code",
    "guide-role-source wrap-anywhere font-mono text-solai-text-primary",
    role.sourceKey,
  );
  const value = node(
    "code",
    "guide-role-value font-mono text-solai-text-secondary",
    role.value,
  );
  const reference = node(
    "span",
    "guide-role-reference col-start-2 row-start-2 block wrap-anywhere font-mono text-[11px] leading-[normal] text-solai-text-secondary",
    role.reference === role.sourceKey ? "Primitive source" : role.reference,
  );
  return node(
    "article",
    "guide-role relative grid min-w-0 grid-cols-[minmax(88px,.9fr)_minmax(108px,1fr)_minmax(0,2fr)] gap-x-[12px] gap-y-[3px] border-t border-solai-border-subtle py-[12px] [@media(max-width:650px)]:block",
    [
      node(
        "h4",
        "col-start-1 row-span-2 row-start-1 m-0 flex items-start gap-[9px] text-[13px] font-medium text-solai-text-emphasis [@media(max-width:650px)]:mb-[6px]",
        [swatch, role.label],
      ),
      node(
        "div",
        "guide-role-resolution col-start-2 row-start-1 grid gap-[3px] font-mono text-[12px] leading-[1.5]",
        [source, value],
      ),
      reference,
      node(
        "p",
        "guide-role-meaning col-start-3 row-span-2 row-start-1 m-0 text-[12px] leading-[1.65] text-solai-text-secondary",
        role.meaning,
      ),
    ],
  );
}

function renderSection(section, { palette, mode }) {
  const roles = section.definition.roles.map((role) =>
    resolveRole(role, palette, mode),
  );
  const element = section.element;
  renderSpecimen(
    element.querySelector("[data-guide-specimen]"),
    section.definition.id,
    roles,
  );
  element
    .querySelector("[data-guide-roles]")
    .replaceChildren(...roles.map(roleListing));
  element.querySelector(".guide-ready").hidden = false;
}

function unavailable() {
  document.querySelector("#guide-selection").textContent =
    "Palette unavailable";
  document.querySelector("#guide-status").textContent =
    "The palette data could not be loaded, so live studies and theme controls are unavailable. Reload to try again, or use the static palette data linked below.";
  document.querySelector("#guide-status").hidden = false;
  for (const section of sections) {
    section.element.querySelector(".guide-ready").hidden = true;
  }
  document.querySelector("#theme-select").disabled = true;
  document.querySelectorAll("[data-mode-option]").forEach((button) => {
    button.disabled = true;
  });
}

document.querySelector("#guide-status").hidden = false;

initTheme({
  onChange(theme) {
    document.querySelector("#guide-selection").textContent =
      `${theme.data.flavors[theme.flavour].name} · ${theme.mode === "light" ? "Light" : "Dark"}`;
    for (const section of sections) renderSection(section, theme);
    document.querySelector("#guide-status").hidden = true;
    if (initialRender) {
      initialRender = false;
      const target = sections.find(
        (section) => `#${section.definition.id}` === location.hash,
      );
      if (target)
        requestAnimationFrame(() =>
          target.element.scrollIntoView({
            behavior: "instant",
            block: "start",
          }),
        );
    }
  },
  onError: unavailable,
});
