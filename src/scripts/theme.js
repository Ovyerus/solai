export function initTheme({ onChange, onError }) {
  const root = document.documentElement;
  const select = document.querySelector("#theme-select");
  const buttons = [...document.querySelectorAll("[data-mode-option]")];
  let flavour = root.dataset.flavor || "blue";
  let mode = root.dataset.mode || "dark";
  let data;

  select.value = flavour;
  buttons.forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.modeOption === mode),
    ),
  );

  function apply(persist) {
    const palette = data.flavors[flavour].modes[mode];
    root.dataset.flavor = flavour;
    root.dataset.mode = mode;
    select.value = flavour;
    document.querySelector("meta[name=theme-color]").content =
      palette.roleValues["surface.canvas"];
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.modeOption === mode),
      ),
    );

    for (const link of document.querySelectorAll("[data-theme-link]")) {
      const url = new URL(link.getAttribute("href"), location.href);
      url.searchParams.set("theme", flavour);
      url.searchParams.set("mode", mode);
      link.href = url.pathname + url.search + url.hash;
    }

    if (persist) {
      try {
        localStorage.setItem("solai.flavour", flavour);
        localStorage.setItem("solai.mode", mode);
      } catch (error) {}
      const url = new URL(location.href);
      if (url.searchParams.has("theme") || url.searchParams.has("mode")) {
        url.searchParams.set("theme", flavour);
        url.searchParams.set("mode", mode);
        history.replaceState(
          history.state,
          "",
          url.pathname + url.search + url.hash,
        );
      }
    }
    onChange({ data, flavour, mode, palette });
  }

  function selectFlavour(id) {
    if (!data || !data.flavors[id]) return;
    flavour = id;
    apply(true);
  }

  select.addEventListener("change", () => selectFlavour(select.value));
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      if (!data || !data.modeOrder.includes(button.dataset.modeOption)) return;
      mode = button.dataset.modeOption;
      apply(true);
    }),
  );

  fetch("/assets/palettes.json")
    .then((response) => {
      if (!response.ok) throw Error("Palette unavailable");
      return response.json();
    })
    .then((result) => {
      data = result;
      if (!data.flavors[flavour]) flavour = data.defaultFlavor;
      if (!data.modeOrder.includes(mode)) mode = data.defaultMode;
      apply(false);
      select.disabled = false;
      buttons.forEach((button) => (button.disabled = false));
    })
    .catch(onError);

  return { selectFlavour };
}
