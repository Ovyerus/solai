import { json } from "./model.mjs";
import { textMateTokens } from "./textmate.mjs";

export const shikiExample = `import { readFile } from "node:fs/promises";
import { createHighlighter } from "shiki";

const theme = JSON.parse(await readFile("./solai-tide-dark.json", "utf8"));
const highlighter = await createHighlighter({
  themes: [theme],
  langs: ["typescript"],
});
try {
  const html = highlighter.codeToHtml('const sky = "after sunset";', {
    lang: "typescript",
    theme: theme.name,
  });
  // Insert html into your page at build time.
} finally {
  highlighter.dispose();
}`;

export const shikiFormat = {
  id: "shiki",
  title: "Shiki",
  extension: "json",
  description:
    "TextMate themes for static syntax highlighting: mostly neutral code, accent strings and companion types, using the same syntax rules as the Solai VS Code port.",
  installation: [
    "Download the selected JSON, or unzip all ten themes into your project. Each file is a separate custom theme, not a palette-data export.",
    "In a project that uses Shiki, parse the JSON and pass the object to createHighlighter({ themes: [theme], langs: [yourLanguage] }), or await highlighter.loadTheme(theme) on an existing highlighter. Select it with theme: theme.name when rendering. A custom JSON path or Solai theme name alone is not a bundled Shiki theme.",
    "For light/dark output, load both theme objects and use themes: { light: lightTheme.name, dark: darkTheme.name } when rendering; apply Shiki’s documented dual-theme CSS. A theme file does not switch your website’s appearance automatically.",
    "Shiki uses TextMate grammars, not language-server semantic highlighting. Workbench chrome, search matches and nesting-depth bracket colours from editor ports are not reproduced. Language grammar coverage can differ.",
  ],
};

// Custom themes: https://shiki.style/guide/load-theme
// Only canvas colours and TextMate rules belong in this static highlighter port.
export function renderShiki(theme) {
  return json({
    name: theme.slug,
    displayName: theme.name,
    type: theme.mode,
    colors: {
      "editor.background": theme.roles.surfaces.canvas,
      "editor.foreground": theme.roles.code.identifier,
    },
    tokenColors: textMateTokens(theme),
  });
}
