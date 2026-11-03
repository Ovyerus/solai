import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { inflateRawSync } from "node:zlib";
import { makeThemes } from "./model.mjs";
import { renderVSCode } from "./vscode.mjs";
import { renderShiki, shikiExample } from "./shiki.mjs";

// Exercise the real Shiki already pinned by Astro, without a new dependency.
const astro = createRequire(import.meta.resolve("astro"));
const helpers = createRequire(astro.resolve("@astrojs/internal-helpers/shiki"));
const { createHighlighter } = await import(helpers.resolve("shiki"));
const readPublic = (href) =>
  readFile(new URL("../../public" + href, import.meta.url));
const data = JSON.parse(await readPublic("/assets/palettes.json"));
const themes = makeThemes(data);
const manifest = JSON.parse(await readPublic("/downloads/theme-manifest.json"));
const format = manifest.formats.find(({ id }) => id === "shiki");
const emitted = await Promise.all(
  themes.map(async (theme) =>
    JSON.parse(await readPublic(`/downloads/themes/shiki/${theme.slug}.json`)),
  ),
);
const highlighter = await createHighlighter({
  themes: structuredClone(emitted),
  langs: [
    "typescript",
    "javascript",
    "markdown",
    "json",
    "html",
    "css",
    "python",
    "diff",
  ],
});
after(() => highlighter.dispose());

const sample =
  '// garden\nconst sky: string = "after sunset";\nlet watts = 42;';
for (const [index, theme] of themes.entries()) {
  const exported = emitted[index];
  test(`${theme.name}: Shiki export matches shared syntax and preserves notices`, () => {
    const { $comment, ...definition } = exported;
    assert.deepEqual(definition, JSON.parse(renderShiki(theme)));
    assert.equal(exported.name, theme.slug);
    assert.equal(exported.type, theme.mode);
    assert.equal(exported.displayName, theme.name);
    assert.deepEqual(
      exported.tokenColors,
      JSON.parse(renderVSCode(theme)).tokenColors,
    );
    assert.deepEqual(Object.keys(exported.colors).sort(), [
      "editor.background",
      "editor.foreground",
    ]);
    assert($comment.includes(data.source.licenseText));
    assert($comment.includes("Copyright (c) 2026 Solai contributors"));
    assert(!("semanticTokenColors" in exported));
    for (const rule of exported.tokenColors) {
      assert.match(rule.settings.foreground, /^#[0-9A-F]{6}$/);
    }
  });

  test(`${theme.name}: real TypeScript tokens use approved colours and bold grammar`, () => {
    const result = highlighter.codeToTokens(sample, {
      lang: "typescript",
      theme: theme.slug,
    });
    assert.equal(result.bg, theme.roles.surfaces.canvas);
    assert.equal(result.fg, theme.roles.code.identifier);
    assert.equal(
      result.tokens
        .map((line) => line.map((token) => token.content).join(""))
        .join("\n"),
      sample,
    );
    const tokens = result.tokens.flat();
    const check = (text, color, fontStyle = 0) => {
      const token = tokens.find((token) => token.content.includes(text));
      assert(token, `Missing token: ${text}`);
      assert.equal(token.color, color, text);
      assert.equal(token.fontStyle, fontStyle, text);
    };
    check("garden", theme.roles.code.comment);
    check("const", theme.roles.code.keyword, 2);
    check("sky", theme.roles.code.identifier);
    check("string", theme.roles.code.type);
    check("after sunset", theme.roles.code.string);
    check("42", theme.roles.code.literal);
    check("=", theme.roles.code.operator);
    check(";", theme.roles.code.punctuation);
    const html = highlighter.codeToHtml('const html = "<script>";', {
      lang: "typescript",
      theme: theme.slug,
    });
    assert(html.includes("font-weight:bold"));
    assert.match(html, /&(?:lt|#x3[cC]|#60);script/);
    assert(!html.includes("<script>"));
  });

  test(`${theme.name}: prose styles and multiple language grammars render`, () => {
    const { tokens } = highlighter.codeToTokens(
      "# Garden\n**strong** and *soft*",
      { lang: "markdown", theme: theme.slug },
    );
    const heading = tokens[0].find((token) => token.content.includes("Garden"));
    assert.equal(heading.color, theme.roles.prose.heading);
    assert.equal(heading.fontStyle, 2);
    const strong = tokens[1].find((token) => token.content.includes("strong"));
    const soft = tokens[1].find((token) => token.content.includes("soft"));
    assert.equal(strong.fontStyle, 2);
    assert.equal(soft.fontStyle, 1);
    for (const [lang, source] of [
      ["javascript", 'const sky = "blue";'],
      ["json", '{"sky": "blue", "watts": 42}'],
      ["html", '<p class="sky">garden</p>'],
      ["css", ".sky { color: #07afae; }"],
      ["python", 'def garden():\n    return "sky"'],
      ["diff", "+ garden\n- concrete"],
    ]) {
      const result = highlighter.codeToTokens(source, {
        lang,
        theme: theme.slug,
      });
      assert.equal(
        result.tokens
          .map((line) => line.map((token) => token.content).join(""))
          .join("\n"),
        source,
      );
      assert(
        highlighter
          .codeToHtml(source, { lang, theme: theme.slug })
          .includes("<pre"),
      );
    }
  });
}

for (const family of data.flavorOrder) {
  test(`${data.flavors[family].name}: light/dark themes render together`, () => {
    const dark = themes.find(
      (theme) => theme.flavor === family && theme.mode === "dark",
    );
    const light = themes.find(
      (theme) => theme.flavor === family && theme.mode === "light",
    );
    const html = highlighter.codeToHtml(sample, {
      lang: "typescript",
      themes: { light: light.slug, dark: dark.slug },
    });
    assert(html.includes(`background-color:${light.roles.surfaces.canvas}`));
    assert(html.includes(`--shiki-dark-bg:${dark.roles.surfaces.canvas}`));
    assert(html.includes(`--shiki-dark:${dark.roles.code.string}`));
  });
}

test("custom names must be loaded as objects, including loadTheme on an existing highlighter", async () => {
  const h = await createHighlighter({ themes: [], langs: ["typescript"] });
  try {
    assert.throws(
      () => h.codeToHtml(sample, { lang: "typescript", theme: themes[0].slug }),
      /not found|not loaded/i,
    );
    await h.loadTheme(structuredClone(emitted[0]));
    assert(
      h
        .codeToHtml(sample, { lang: "typescript", theme: emitted[0].name })
        .includes("<pre"),
    );
  } finally {
    h.dispose();
  }
});

// Read the deterministic ZIP32 local entries independently of the archive writer.
function unzip(buffer) {
  const entries = new Map();
  let offset = 0;
  while (buffer.readUInt32LE(offset) === 0x04034b50) {
    const method = buffer.readUInt16LE(offset + 8);
    const size = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const name = buffer
      .subarray(offset + 30, offset + 30 + nameLength)
      .toString();
    const start = offset + 30 + nameLength + extraLength;
    const content = buffer.subarray(start, start + size);
    assert([0, 8].includes(method));
    assert(!entries.has(name), `Duplicate archive entry: ${name}`);
    entries.set(
      name,
      (method === 8 ? inflateRawSync(content) : content).toString(),
    );
    offset = start + size;
  }
  assert.equal(buffer.readUInt32LE(offset), 0x02014b50);
  return entries;
}

test("Shiki catalog and all-ten ZIP contain the selected files, usage and both notices", async () => {
  assert(format);
  assert.equal(format.variants.length, 10);
  const archive = unzip(await readPublic(format.bundle.href));
  assert.equal(archive.size, 13);
  assert(
    archive.get("LICENSE-Dolch.txt").includes(data.source.licenseText.trim()),
  );
  assert(
    archive
      .get("LICENSE-Themes.txt")
      .includes("Copyright (c) 2026 Solai contributors"),
  );
  assert(archive.get("INSTALL.md").includes(shikiExample));
  for (const [index, theme] of themes.entries()) {
    const entry = format.variants.find(
      (v) => v.flavor === theme.flavor && v.mode === theme.mode,
    );
    assert.equal(entry.name, theme.name);
    const file = JSON.parse(await readPublic(entry.href));
    assert.deepEqual(file, emitted[index]);
    assert.deepEqual(JSON.parse(archive.get(`${theme.slug}.json`)), file);
  }
});
