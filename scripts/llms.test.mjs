import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const guide = await read("public/llms.txt");
const data = JSON.parse(await read("public/assets/palettes.json"));
const manifest = JSON.parse(await read("public/downloads/theme-manifest.json"));
const blocks = [...guide.matchAll(/```(\w+)\n([\s\S]*?)```/g)];
const links = [...guide.matchAll(/\[[^\]]+\]\((https:\/\/[^)]+)\)/g)].map(
  (match) => new URL(match[1]),
);
const css = await read("public/downloads/flavors.css");
const tailwind = await read("public/downloads/flavors.tailwind.css");
const selectedCSS = await read("public/downloads/variants/solai-tide-dark.css");

test("llms.txt has a title, summary, absolute resource links and existing local targets", async () => {
  assert(guide.startsWith("# Solai\n\n> "));
  assert(guide.includes("## Optional\n"));
  assert(links.length > 0);
  const local = links.filter((url) => url.origin === "https://solai.style");
  for (const url of local) {
    assert(!url.pathname.includes("guide-editor"));
    const path = url.pathname.endsWith("/")
      ? "src/pages" + url.pathname + "index.astro"
      : "public" + url.pathname;
    assert(
      (await stat(new URL("../" + path, import.meta.url))).isFile(),
      url.href,
    );
  }
  for (const path of [
    "/assets/palettes.json",
    "/downloads/flavors.css",
    "/downloads/flavors.tailwind.css",
    "/downloads/theme-manifest.json",
  ]) {
    assert(
      local.some((url) => url.pathname === path),
      `Missing core resource: ${path}`,
    );
  }
  const downloads = new Set([
    ...manifest.variants.flatMap((variant) => Object.values(variant.downloads)),
    ...manifest.formats.flatMap((format) => [
      format.bundle.href,
      ...format.variants.map((variant) => variant.href),
    ]),
    manifest.terminalBundle.href,
  ]);
  for (const url of local.filter(
    (url) =>
      url.pathname.startsWith("/downloads/themes/") ||
      url.pathname.startsWith("/downloads/variants/"),
  )) {
    assert(downloads.has(url.pathname), `Not in catalog: ${url.href}`);
  }
});

test("documented flavour IDs, stems and inventory match all ten exports", () => {
  assert.equal(data.schemaVersion, 2);
  assert.equal(manifest.schemaVersion, 1);
  for (const variant of manifest.variants) {
    assert(
      guide.includes(
        `${variant.flavorName}: ID \`${variant.flavor}\`, filename stem \`solai-${variant.flavorName.toLowerCase()}\``,
      ),
    );
    const palette = data.flavors[variant.flavor].modes[variant.mode];
    assert.equal(Object.values(palette.primitives).flat().length, 187);
    assert.equal(Object.keys(palette.roleValues).length, 32);
    const selector = `[data-flavor="${variant.flavor}"][data-mode="${variant.mode}"]`;
    assert(css.includes(selector));
    assert(tailwind.includes(selector));
  }
  assert(!selectedCSS.includes("--solai-accent-7:"));
  assert(css.includes("--solai-accent-7:"));
  assert(tailwind.includes("@theme inline"));
});

test("CSS variables and Tailwind utilities in quick-start examples exist in the downloads", () => {
  for (const [, language, source] of blocks) {
    if (language === "css") {
      for (const [, variable] of source.matchAll(/var\((--solai-[a-z-]+)\)/g)) {
        assert(css.includes(variable + ":"), variable);
        assert(selectedCSS.includes(variable + ":"), variable);
      }
    }
    if (language === "html") {
      for (const [, classes] of source.matchAll(/class="([^"]+)"/g)) {
        for (const utility of classes
          .split(/\s+/)
          .filter((value) => value.includes("solai-"))) {
          const token = utility.slice(utility.indexOf("solai-"));
          assert(tailwind.includes("--color-" + token + ":"), utility);
        }
      }
    }
  }
});

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const jsonExample = new AsyncFunction(
  "fetch",
  blocks.find(([, language]) => language === "js")[2] +
    "\nreturn { canvas, text, accent7 };",
);
test("JSON example resolves real colours and rejects failed downloads or unknown schemas", async () => {
  let requested;
  const result = await jsonExample(async (url) => {
    requested = url;
    return { ok: true, json: async () => data };
  });
  assert.equal(requested, "https://solai.style/assets/palettes.json");
  const palette = data.flavors.blue.modes.dark;
  assert.deepEqual(result, {
    canvas: palette.roleValues["surface.canvas"],
    text: palette.roleValues["text.primary"],
    accent7: palette.primitives.accent[7],
  });
  await assert.rejects(
    jsonExample(async () => ({ ok: false, status: 404 })),
    /download failed: 404/,
  );
  await assert.rejects(
    jsonExample(async () => ({
      ok: true,
      json: async () => ({ schemaVersion: 99 }),
    })),
    /Unsupported Solai palette schema/,
  );
});
