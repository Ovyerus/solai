import { composite, json, withAlpha } from "./model.mjs";

export const zedFormat = {
  id: "zed",
  title: "Zed",
  extension: "json",
  description:
    "A local Zed theme family with restrained syntax, six nesting accents and the approved ANSI banks.",
  installation: [
    "Place the all-ten solai.json file, or one selected variant JSON, in ~/.config/zed/themes/ on macOS or Linux; on Windows use %APPDATA%\\Zed\\themes\\. Use your custom configuration directory if you run Zed with --user-data-dir.",
    "Restart Zed, run “theme selector: toggle” from the command palette, and choose a Solai flavour and mode. These are local themes, not marketplace extensions.",
    "To use the six nesting colours, enable “colorize_brackets” in your Zed settings. Bracket colouring depends on each language’s bracket queries; the theme does not change this setting.",
    "Zed themes expose search background fills, not separate match text or underline colours. Editor and terminal carets and selections share the local player colours; a terminal block cursor uses the terminal background for its character.",
  ],
};

const ansiNames = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
];

// Supported fields: https://zed.dev/schema/themes/v0.2.0.json and
// https://github.com/zed-industries/zed/blob/main/crates/settings_content/src/theme.rs
// The hosted schema permits additional properties and predates the current
// search.active_match_background, version_control.* and diff-hunk fields.
function renderTheme(theme) {
  const { ui, roles, terminal, ansi } = theme;
  const { surfaces, interface: signals, code, prose, editor, changes } = roles;
  const accents = Array.from(
    { length: 6 },
    (_, index) => editor[`bracket${index}`],
  );
  const transparent = "#00000000";
  // Zed reuses these foregrounds in popups, hovered rows and selected rows.
  // Keep the fills restrained so their matching text remains readable.
  const selected = composite(
    withAlpha(signals.selection, "18"),
    surfaces.panel,
  );
  const style = {
    border: surfaces.border,
    "border.variant": surfaces.border,
    "border.focused": signals.focus,
    "border.selected": signals.action,
    "border.transparent": transparent,
    "border.disabled": surfaces.border,
    background: surfaces.canvas,
    "surface.background": surfaces.panel,
    "elevated_surface.background": surfaces.raised,
    "element.background": surfaces.panel,
    "element.hover": surfaces.raised,
    "element.active": surfaces.raised,
    "element.selected": selected,
    "element.disabled": surfaces.panel,
    "drop_target.background": signals.selection,
    "ghost_element.background": transparent,
    "ghost_element.hover": surfaces.panel,
    "ghost_element.active": surfaces.raised,
    "ghost_element.selected": selected,
    "ghost_element.disabled": transparent,
    text: signals.text,
    "text.muted": ui["text.secondary"],
    "text.placeholder": ui["text.secondary"],
    "text.disabled": ui["text.disabled"],
    "text.accent": ui["accent.hover"],
    icon: signals.text,
    "icon.muted": signals.muted,
    "icon.placeholder": signals.muted,
    "icon.disabled": ui["text.disabled"],
    "icon.accent": signals.action,
    "link_text.hover": ui["accent.hover"],
    "status_bar.background": surfaces.panel,
    "title_bar.background": surfaces.panel,
    "title_bar.inactive_background": surfaces.canvas,
    "toolbar.background": surfaces.panel,
    "tab_bar.background": surfaces.panel,
    "tab.inactive_background": surfaces.panel,
    "tab.active_background": surfaces.canvas,
    "panel.background": surfaces.panel,
    "panel.focused_border": signals.focus,
    "panel.indent_guide": editor.guide,
    "panel.indent_guide_active": ui["border.strong"],
    "panel.indent_guide_hover": ui["border.strong"],
    "pane.focused_border": signals.focus,
    "pane_group.border": surfaces.border,
    "scrollbar.thumb.background": withAlpha(signals.muted, "66"),
    "scrollbar.thumb.hover_background": withAlpha(signals.muted, "99"),
    "scrollbar.thumb.border": surfaces.border,
    "scrollbar.track.background": transparent,
    "scrollbar.track.border": surfaces.border,
    "editor.background": surfaces.canvas,
    "editor.foreground": code.identifier,
    "editor.gutter.background": surfaces.canvas,
    "editor.subheader.background": surfaces.panel,
    "editor.active_line.background": editor.currentLine,
    "editor.highlighted_line.background": editor.currentLine,
    "editor.line_number": editor.lineNumber,
    "editor.active_line_number": editor.activeNumber,
    "editor.invisible": editor.guide,
    "editor.wrap_guide": editor.guide,
    "editor.active_wrap_guide": ui["border.strong"],
    "editor.indent_guide": editor.guide,
    "editor.indent_guide_active": ui["border.strong"],
    "editor.document_highlight.read_background": signals.selection,
    "editor.document_highlight.write_background": signals.selection,
    "editor.document_highlight.bracket_background": surfaces.hover,
    // Zed cannot reproduce the guide's violet search foreground/underline.
    "search.match_background": withAlpha(editor.search, "18"),
    "search.active_match_background": withAlpha(editor.search, "28"),
    "version_control.added": changes.added,
    "version_control.deleted": changes.removed,
    "version_control.modified": changes.changed,
    "version_control.renamed": changes.changed,
    "version_control.conflict": changes.conflict,
    "version_control.ignored": changes.hint,
    // Word-diff fields paint backgrounds, not changed-token foregrounds.
    "version_control.word_added": withAlpha(changes.added, "30"),
    "version_control.word_deleted": withAlpha(changes.removed, "30"),
    "version_control.conflict_marker.ours": withAlpha(changes.conflict, "12"),
    "version_control.conflict_marker.theirs": withAlpha(changes.conflict, "1C"),
    "editor.diff_hunk.added.background": withAlpha(changes.added, "12"),
    "editor.diff_hunk.added.hollow_background": transparent,
    "editor.diff_hunk.added.hollow_border": changes.added,
    "editor.diff_hunk.deleted.background": withAlpha(changes.removed, "12"),
    "editor.diff_hunk.deleted.hollow_background": transparent,
    "editor.diff_hunk.deleted.hollow_border": changes.removed,
    "terminal.background": terminal.background,
    "terminal.ansi.background": terminal.background,
    "terminal.foreground": terminal.foreground,
    "terminal.bright_foreground": ui["text.emphasis"],
    "terminal.dim_foreground": signals.muted,
    accents,
    // Zed uses player zero for both editor and terminal cursor/selection.
    // Keep the shared opaque selection identical to the other terminal ports.
    players: [
      {
        cursor: editor.cursor,
        background: editor.cursor,
        selection: terminal.selection,
      },
      ...accents.map((color) => ({
        cursor: color,
        background: color,
        selection: withAlpha(color, "30"),
      })),
    ],
    syntax: {
      attribute: { color: code.member },
      boolean: { color: code.literal },
      comment: { color: code.comment },
      "comment.doc": { color: code.comment },
      constant: { color: code.literal },
      "constant.builtin": { color: code.literal },
      constructor: { color: code.type },
      embedded: { color: code.identifier },
      emphasis: { color: prose.body, font_style: "italic" },
      "emphasis.strong": { color: prose.heading, font_weight: 700 },
      enum: { color: code.type },
      function: { color: code.function },
      hint: { color: changes.hint },
      keyword: { color: code.keyword, font_weight: 700 },
      label: { color: code.identifier },
      link_text: { color: prose.link },
      link_uri: { color: prose.link },
      number: { color: code.literal },
      operator: { color: code.operator },
      predictive: { color: changes.hint },
      preproc: { color: code.keyword, font_weight: 700 },
      primary: { color: prose.body },
      property: { color: code.member },
      punctuation: { color: code.punctuation },
      "punctuation.bracket": { color: code.punctuation },
      "punctuation.delimiter": { color: code.punctuation },
      "punctuation.list_marker": { color: prose.marker },
      "punctuation.special": { color: code.punctuation },
      string: { color: code.string },
      "string.escape": { color: code.literal },
      "string.regex": { color: code.string },
      "string.special": { color: code.string },
      "string.special.symbol": { color: code.literal },
      tag: { color: code.keyword },
      "tag.doctype": { color: code.keyword },
      "text.literal": { color: prose.code },
      title: { color: prose.heading, font_weight: 700 },
      type: { color: code.type },
      "type.builtin": { color: code.type },
      variable: { color: code.identifier },
      "variable.special": { color: code.identifier },
      "variable.parameter": { color: code.identifier },
      variant: { color: code.literal },
    },
  };

  const statuses = {
    conflict: [changes.conflict, ui["status.dangerBackground"]],
    created: [changes.added, ui["status.successBackground"]],
    deleted: [changes.removed, ui["status.dangerBackground"]],
    error: [signals.danger, ui["status.dangerBackground"]],
    hidden: [signals.muted, surfaces.panel],
    hint: [changes.hint, surfaces.panel],
    ignored: [signals.muted, surfaces.panel],
    info: [signals.info, ui["status.infoBackground"]],
    modified: [changes.changed, withAlpha(changes.changed, "12")],
    predictive: [changes.hint, surfaces.panel],
    renamed: [changes.changed, withAlpha(changes.changed, "12")],
    success: [signals.success, ui["status.successBackground"]],
    unreachable: [signals.muted, surfaces.panel],
    warning: [signals.warning, ui["status.warningBackground"]],
  };
  for (const [name, [foreground, background]] of Object.entries(statuses)) {
    style[name] = foreground;
    style[`${name}.background`] = background;
    style[`${name}.border`] = foreground;
  }

  for (const [index, name] of ansiNames.entries()) {
    style[`terminal.ansi.${name}`] = ansi[index];
    style[`terminal.ansi.bright_${name}`] = ansi[index + 8];
    // The additional dim bank is a faint rendering of the normal bank. It
    // neither changes the sixteen approved slots nor borrows host-default hues.
    style[`terminal.ansi.dim_${name}`] = composite(
      withAlpha(ansi[index], "A6"),
      terminal.background,
    );
  }

  return { name: theme.name, appearance: theme.mode, style };
}

export function renderZed(themes) {
  return json({
    $schema: "https://zed.dev/schema/themes/v0.2.0.json",
    name: "Solai",
    author: "Solai contributors",
    themes: themes.map(renderTheme),
  });
}
