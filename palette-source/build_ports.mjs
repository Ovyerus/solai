#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { makeThemes, json } from "./ports/model.mjs";
import { zip } from "./ports/archive.mjs";
import { renderVSCode, vscodeFormat } from "./ports/vscode.mjs";
import { renderZed, zedFormat } from "./ports/zed.mjs";
import { terminalFormats } from "./ports/terminals.mjs";
import { exportCSS, exportTailwindCSS } from "../src/scripts/palette-shared.js";

const project = fileURLToPath(new URL("../", import.meta.url));
const downloads = path.join(project, "public/downloads");
const data = JSON.parse(
  await readFile(path.join(project, "public/assets/palettes.json"), "utf8"),
);
const { version } = JSON.parse(
  await readFile(path.join(project, "package.json"), "utf8"),
);
const themes = makeThemes(data);
const { LICENSE: dolchLicense } = JSON.parse(
  await readFile(
    path.join(project, "palette-source/reference/source-snapshot.json"),
    "utf8",
  ),
);
const themeLicense =
  "MIT License\n\n" +
  dolchLicense.replace(
    /^Copyright[^\n]+/,
    "Copyright (c) 2026 Solai contributors",
  );
const scope =
  "This MIT license covers the Solai application theme ports and their port mappings only. It does not relicense the website, artwork, fonts or other palette exports.";
const provenance =
  "Original Dolch palettes: Renzhi Li (Belleve Invis). https://github.com/be5invis/vscode-theme-dolch\nTide retains upstream Blue primitives; Ember uses original Alter custom ramps with the shared Blue base. Dusk, Viridian, Bloom and the application mappings are Solai studies.";
const notices = `${scope}\n\n${themeLicense}\n\nDolch upstream notice:\n\n${dolchLicense}\n\n${provenance}`;
const legal = [
  { path: "LICENSE-Themes.txt", content: themeLicense + "\n" + scope + "\n" },
  { path: "LICENSE-Dolch.txt", content: dolchLicense },
];
const fileName = (theme, extension) =>
  theme.slug + (extension ? "." + extension : "");

async function emit(relative, content) {
  const destination = path.join(downloads, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
  return "/downloads/" + relative;
}

function licensed(content, format) {
  if (format.id === "windows-terminal") return content;
  if (format.extension === "json")
    return json({ $comment: notices, ...JSON.parse(content) });
  if (format.extension === "itermcolors" || format.extension === "terminal") {
    const declaration = content.indexOf("?>") + 2;
    return (
      content.slice(0, declaration) +
      "\n<!--\n" +
      notices +
      "\n-->\n" +
      content.slice(declaration).trimStart()
    );
  }
  const prefix = format.id === "xresources" ? "! " : "# ";
  return (
    notices
      .split("\n")
      .map((line) => prefix + line)
      .join("\n") +
    "\n\n" +
    content
  );
}

const ansiNote =
  "The sixteen ANSI slots preserve conventional black/white and normal/bright banks. Some slots have low contrast as foreground text, particularly white in light mode. Applications choose their own ANSI/true-colour usage. Schemes do not change shell prompts, fonts or keyboard settings.";
function installation(format) {
  return (
    `# Solai — ${format.title}\n\n${format.description}\n\n` +
    format.installation.map((step) => "- " + step).join("\n") +
    "\n\n" +
    themes
      .map(
        (theme) => "- " + theme.name + ": " + fileName(theme, format.extension),
      )
      .join("\n") +
    "\n\n" +
    ansiNote +
    "\n\n" +
    provenance +
    "\n\n" +
    scope +
    "\nSee LICENSE-Themes.txt and LICENSE-Dolch.txt.\n"
  );
}

const variants = [];
for (const theme of themes) {
  const base = "variants/" + theme.slug;
  variants.push({
    flavor: theme.flavor,
    flavorName: theme.flavorName,
    mode: theme.mode,
    modeName: theme.modeName,
    name: theme.name,
    slug: theme.slug,
    downloads: {
      json: await emit(
        base + ".json",
        JSON.stringify(
          { ...theme.palette, name: theme.name, source: data.source },
          null,
          2,
        ),
      ),
      css: await emit(
        base + ".css",
        exportCSS(theme.palette, theme.flavorName, theme.mode, data.source),
      ),
      tailwind: await emit(
        base + ".tailwind.css",
        exportTailwindCSS(
          theme.palette,
          theme.flavorName,
          theme.mode,
          data.source,
        ),
      ),
    },
  });
}

const formats = [];
const vscodeEntries = [];
const vscodeVariants = [];
for (const theme of themes) {
  const content = licensed(renderVSCode(theme), vscodeFormat);
  const filename = fileName(theme, "json");
  const href = await emit("themes/vscode/" + filename, content);
  vscodeEntries.push({ path: "extension/themes/" + filename, content });
  vscodeVariants.push({
    flavor: theme.flavor,
    mode: theme.mode,
    name: theme.name,
    href,
  });
}
const extensionPackage = {
  name: "solai-themes",
  displayName: "Solai Themes",
  version,
  publisher: "solai",
  description:
    "Five Solai colour flavours, each in dark and light, for code after sunset.",
  license: "MIT",
  categories: ["Themes"],
  keywords: ["theme", "solai", "solarpunk", "dolch"],
  engines: { vscode: "^1.85.0" },
  contributes: {
    themes: themes.map((theme) => ({
      id: theme.name,
      label: theme.name,
      uiTheme: theme.mode === "dark" ? "vs-dark" : "vs",
      path: "./themes/" + fileName(theme, "json"),
    })),
  },
};
const extensionReadme = `# Solai Themes\n\nFive flavours — Tide, Ember, Dusk, Viridian and Bloom — in Dark and Light.\n\nInstall the VSIX through Extensions → … → Install from VSIX, then run Preferences: Color Theme and choose a Solai theme. This package is a local download, not a Marketplace listing.\n\nThe theme uses neutral surfaces and mostly monotone code, with accent strings, companion types, violet search matches, six nesting colours and conventional terminal ANSI slots. Explicit user semantic-highlighting and bracket settings retain precedence. Theme APIs do not reproduce every detail of the website specimens.\n\n${ansiNote}\n\n${provenance}\n\n${scope}\nSee [theme license](LICENSE-Themes.txt) and [Dolch notice](LICENSE-Dolch.txt).\n`;
const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Language="en-US" Id="solai-themes" Version="${version}" Publisher="solai" />
    <DisplayName>Solai Themes</DisplayName>
    <Description xml:space="preserve">Five Solai colour flavours in dark and light.</Description>
    <Categories>Themes</Categories>
    <Properties><Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.85.0" /><Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" /><Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="" /><Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="ui" /></Properties>
  </Metadata>
  <Installation><InstallationTarget Id="Microsoft.VisualStudio.Code" /></Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE-Themes.txt" Addressable="true" />
  </Assets>
</PackageManifest>
`;
const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="json" ContentType="application/json" /><Default Extension="md" ContentType="text/markdown" /><Default Extension="txt" ContentType="text/plain" /><Default Extension="vsixmanifest" ContentType="text/xml" /></Types>
`;
const vsix = zip([
  ...vscodeEntries,
  ...legal.map((entry) => ({ ...entry, path: "extension/" + entry.path })),
  { path: "extension/package.json", content: json(extensionPackage) },
  { path: "extension/README.md", content: extensionReadme },
  { path: "extension.vsixmanifest", content: vsixManifest },
  { path: "[Content_Types].xml", content: contentTypes },
]);
const vscodeHref = await emit("themes/solai-vscode.vsix", vsix);
formats.push({
  ...vscodeFormat,
  variants: vscodeVariants,
  bundle: { href: vscodeHref, label: "Install all ten themes · VSIX" },
});

const zedVariants = [];
for (const theme of themes) {
  const href = await emit(
    "themes/zed/" + fileName(theme, "json"),
    licensed(renderZed([theme]), zedFormat),
  );
  zedVariants.push({
    flavor: theme.flavor,
    mode: theme.mode,
    name: theme.name,
    href,
  });
}
const zedHref = await emit(
  "themes/zed/solai.json",
  licensed(renderZed(themes), zedFormat),
);
formats.push({
  ...zedFormat,
  variants: zedVariants,
  bundle: { href: zedHref, label: "All ten themes · JSON" },
});

const allTerminals = [];
for (const format of terminalFormats) {
  const files = [];
  const formatVariants = [];
  for (const theme of themes) {
    const filename = fileName(theme, format.extension);
    const content = licensed(format.render(theme), format);
    const href = await emit(`themes/${format.id}/${filename}`, content);
    files.push({ path: filename, content });
    allTerminals.push({ path: format.id + "/" + filename, content });
    // Windows Terminal's strict scheme schema forbids embedded licensing metadata.
    // Distribute its selected scheme with the notices rather than adding unsupported keys.
    const selectedHref =
      format.id === "windows-terminal"
        ? await emit(
            `themes/${format.id}/${theme.slug}.zip`,
            zip([{ path: filename, content }, ...legal]),
          )
        : href;
    formatVariants.push({
      flavor: theme.flavor,
      mode: theme.mode,
      name: theme.name,
      href: selectedHref,
      ...(format.id === "windows-terminal"
        ? { label: "Scheme JSON + licenses · ZIP" }
        : {}),
    });
  }
  const instructions = installation(format);
  const href = await emit(
    `themes/solai-${format.id}.zip`,
    zip([...files, ...legal, { path: "INSTALL.md", content: instructions }]),
  );
  allTerminals.push({ path: format.id + "/INSTALL.md", content: instructions });
  const { render, ...metadata } = format;
  formats.push({
    ...metadata,
    variants: formatVariants,
    bundle: { href, label: "All ten themes · ZIP" },
  });
}
const terminalHref = await emit(
  "themes/solai-terminals.zip",
  zip([...allTerminals, ...legal]),
);
const manifest = {
  schemaVersion: 1,
  version,
  variants,
  formats,
  terminalBundle: {
    href: terminalHref,
    label: "Every terminal format · all ten variants · ZIP",
  },
  licenses: {
    themes:
      "https://github.com/Ovyerus/solai/blob/main/palette-source/README.md#application-theme-license",
    dolch: "https://github.com/be5invis/vscode-theme-dolch/blob/master/LICENSE",
  },
};
await emit("theme-manifest.json", json(manifest));
console.log(
  `Generated ${themes.length} variants × ${formats.length} application formats, VSIX, terminal bundles and 30 existing web/data exports.`,
);
