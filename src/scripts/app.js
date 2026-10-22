import { announce } from "./palette-shared.js";
import { initTheme } from "./theme.js";
import { createHeroArt } from "./hero-art.js";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const names = {
  blue: "Tide",
  alter: "Ember",
  violet: "Dusk",
  green: "Viridian",
  rose: "Bloom",
};
const hues = {
  blue: "CYAN-BLUE",
  alter: "AMBER",
  violet: "VIOLET",
  green: "LEAF-GREEN",
  rose: "DUSTY ROSE",
};
const descriptions = {
  blue: "Cyan-blue, like harbour lights across dark water.",
  alter: "Warm amber—the greenhouse after sundown.",
  violet: "Violet settling over the last train home.",
  green: "Leaf-green against the city’s charcoal.",
  rose: "Rose light caught on concrete.",
};
let data,
  flavour = document.documentElement.dataset.flavor || "blue",
  mode = document.documentElement.dataset.mode || "dark";
const modeName = () => (mode === "light" ? "Light" : "Dark");
const currentPalette = () => data.flavors[flavour].modes[mode];
function updateNames() {
  $$(".current-name").forEach((e) => (e.textContent = names[flavour]));
  $$(".current-name-lower").forEach(
    (e) => (e.textContent = names[flavour].toLowerCase()),
  );
  $$(".current-mode").forEach((e) => (e.textContent = modeName()));
}
function updateTheme() {
  const r = currentPalette().roleValues;
  updateNames();
  $(".canvas-hex").textContent = "'" + r["surface.canvas"] + "'";
  $(".accent-hex").textContent = "'" + r["accent.primary"] + "'";
  $("#flavour-description").textContent = descriptions[flavour];
  $$(".flavour-button").forEach((b) => {
    const active = b.dataset.flavour === flavour;
    const colors = data.flavors[b.dataset.flavour].modes[mode].roleValues;
    b.setAttribute("aria-pressed", String(active));
    b.querySelector(".check").textContent = active ? "●" : "";
    b.style.setProperty("--f-bg", colors["surface.canvas"]);
    b.style.setProperty("--f-text", colors["text.secondary"]);
    b.style.setProperty("--f-accent", colors["accent.primary"]);
    const shades = [
      colors["surface.panel"],
      colors["surface.raised"],
      colors["text.secondary"],
      colors["accent.primary"],
      colors["accent.highlight"],
    ];
    [...b.querySelectorAll(".mini-ramp i")].forEach(
      (bar, index) => (bar.style.background = shades[index]),
    );
  });
  heroArt.setTheme({
    background: r["surface.canvas"],
    ink: r["accent.primary"],
    mode,
  });
}
function buildFlavours() {
  const parent = $("#flavour-list");
  data.flavorOrder.forEach((id, index) => {
    const button = document.createElement("button");
    button.className =
      "flavour-button relative min-h-[190px] rounded-[2px] border-0 border-b-[3px] border-transparent bg-[var(--f-bg)] px-[20px] py-[23px] text-left text-[var(--f-text)] aria-pressed:border-[var(--f-accent)] aria-pressed:bg-[color-mix(in_srgb,var(--f-accent)_12%,var(--f-bg))] hover:border-[var(--f-accent)] [@media(max-width:1000px)]:px-[13px] [@media(max-width:1000px)]:py-[20px] [@media(max-width:650px)]:min-h-[145px] [@media(max-width:650px)]:p-[16px] [@media(max-width:650px)]:last:col-span-full [@media(max-width:650px)]:last:min-h-[120px] [@media(max-width:650px)]:last:[&_.mini-ramp]:max-w-[200px]";
    button.dataset.flavour = id;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `<span class="n font-mono text-[12px]">0${index + 1} /</span><span class="check absolute top-[18px] right-[16px] text-[12px] text-[var(--f-accent)]"></span><h3 class="mt-[23px] mb-0 text-[25px] font-medium tracking-[-1px] text-[var(--f-accent)] [@media(max-width:1000px)]:text-[22px] [@media(max-width:650px)]:mt-[12px] [@media(max-width:650px)]:text-[24px]">${names[id]}</h3><small class="font-mono text-[12px]">${hues[id]}</small><div class="mini-ramp mt-[22px] flex h-[14px] gap-[3px] [@media(max-width:650px)]:mt-[15px] [@media(max-width:650px)]:h-[11px]"></div>`;
    for (let grade = 0; grade < 5; grade++) {
      const bar = document.createElement("i");
      bar.className = "flex-1 rounded-[2px]";
      button.querySelector(".mini-ramp").append(bar);
    }
    button.addEventListener("click", () => theme.selectFlavour(id));
    parent.append(button);
  });
}
$("#save-demo").addEventListener("click", () => announce("Preview saved"));
$("#reset-demo").addEventListener("click", () => {
  $("#workspace-name").value = "Studio";
  const toggles = $$(".setting-row input");
  toggles[0].checked = true;
  toggles[1].checked = false;
  announce("Preview reset");
});
const heroArt = createHeroArt($("#hero-canvas"));
// The artwork remains usable if palette JSON is unavailable; CSS already has the active tokens.
const initialColours = getComputedStyle(document.documentElement);
heroArt.setTheme({
  background: initialColours.getPropertyValue("--canvas").trim(),
  ink: initialColours.getPropertyValue("--accent").trim(),
  mode,
});
const theme = initTheme({
  onChange(state) {
    const firstLoad = !data;
    data = state.data;
    flavour = state.flavour;
    mode = state.mode;
    if (firstLoad) buildFlavours();
    updateTheme();
  },
  onError() {
    announce("Palette data could not load. Please refresh.");
    $("#flavour-description").textContent =
      "Palette data unavailable. Please refresh.";
    updateNames();
    $$(".canvas-hex,.accent-hex").forEach(
      (element) => (element.textContent = "'unavailable'"),
    );
  },
});
