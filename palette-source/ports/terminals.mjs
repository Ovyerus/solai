import { Buffer } from "node:buffer";
import { json } from "./model.mjs";

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
const plistHeader =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
  '<plist version="1.0">\n<dict>\n';

function xml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
}

function plist(entries) {
  return (
    plistHeader +
    entries
      .map(([key, value]) => `  <key>${xml(key)}</key>\n${value}\n`)
      .join("") +
    "</dict>\n</plist>\n"
  );
}

function channels(hex) {
  return [1, 3, 5].map(
    (start) => parseInt(hex.slice(start, start + 2), 16) / 255,
  );
}

function itermColor(hex) {
  const [red, green, blue] = channels(hex);
  return (
    "  <dict>\n" +
    "    <key>Color Space</key><string>sRGB</string>\n" +
    `    <key>Red Component</key><real>${red}</real>\n` +
    `    <key>Green Component</key><real>${green}</real>\n` +
    `    <key>Blue Component</key><real>${blue}</real>\n` +
    "    <key>Alpha Component</key><real>1</real>\n" +
    "  </dict>"
  );
}

// NSKeyedArchiver uses binary-plist UID objects, not integers or base64 text
// pretending to be an archive. Only the scalar/container types needed below
// are implemented; object references and offsets are computed from the data.
const archiveUID = Symbol("archive UID");
const uid = (value) => ({ [archiveUID]: value });

function byteWidth(value) {
  if (value < 0x100) return 1;
  if (value < 0x10000) return 2;
  return 4;
}

function unsigned(value, width) {
  const bytes = Buffer.alloc(width);
  bytes.writeUIntBE(value, 0, width);
  return bytes;
}

function integer(value) {
  const width = byteWidth(value);
  return Buffer.concat([
    Buffer.from([0x10 | Math.log2(width)]),
    unsigned(value, width),
  ]);
}

function sized(type, length, payload) {
  const prefix =
    length < 15
      ? Buffer.from([type | length])
      : Buffer.concat([Buffer.from([type | 15]), integer(length)]);
  return Buffer.concat([prefix, payload]);
}

function binaryPlist(root) {
  const objects = [];
  function collect(value) {
    const index = objects.length;
    objects.push(null);
    if (Array.isArray(value)) {
      objects[index] = { type: "array", refs: value.map(collect) };
    } else if (Buffer.isBuffer(value)) {
      objects[index] = { type: "data", value };
    } else if (typeof value === "object" && archiveUID in value) {
      objects[index] = { type: "uid", value: value[archiveUID] };
    } else if (typeof value === "object") {
      const entries = Object.entries(value);
      objects[index] = {
        type: "dict",
        count: entries.length,
        refs: [
          ...entries.map(([key]) => collect(key)),
          ...entries.map(([, item]) => collect(item)),
        ],
      };
    } else {
      objects[index] = { type: typeof value, value };
    }
    return index;
  }
  const top = collect(root);
  const refWidth = byteWidth(objects.length - 1);
  const encoded = objects.map((object) => {
    switch (object.type) {
      case "string":
        return sized(
          0x50,
          object.value.length,
          Buffer.from(object.value, "ascii"),
        );
      case "number":
        return integer(object.value);
      case "data":
        return sized(0x40, object.value.length, object.value);
      case "uid": {
        const width = byteWidth(object.value);
        return Buffer.concat([
          Buffer.from([0x80 | (width - 1)]),
          unsigned(object.value, width),
        ]);
      }
      case "array":
        return sized(
          0xa0,
          object.refs.length,
          Buffer.concat(
            object.refs.map((reference) => unsigned(reference, refWidth)),
          ),
        );
      case "dict":
        return sized(
          0xd0,
          object.count,
          Buffer.concat(
            object.refs.map((reference) => unsigned(reference, refWidth)),
          ),
        );
      default:
        throw new TypeError(
          `Unsupported NSColor archive value: ${object.type}`,
        );
    }
  });
  let offset = 8;
  const offsets = encoded.map((bytes) => {
    const start = offset;
    offset += bytes.length;
    return start;
  });
  const offsetWidth = byteWidth(offset);
  const trailer = Buffer.alloc(32);
  trailer[6] = offsetWidth;
  trailer[7] = refWidth;
  trailer.writeBigUInt64BE(BigInt(objects.length), 8);
  trailer.writeBigUInt64BE(BigInt(top), 16);
  trailer.writeBigUInt64BE(BigInt(offset), 24);
  return Buffer.concat([
    Buffer.from("bplist00"),
    ...encoded,
    ...offsets.map((start) => unsigned(start, offsetWidth)),
    trailer,
  ]);
}

function terminalColor(hex) {
  // AppKit's sRGB NSColor archive stores explicit component fractions and
  // references the named sRGB NSColorSpace (NSID = 7). AppKit reconstructs this
  // built-in space without embedding an ICC profile or a deviceRGB fallback.
  const archive = binaryPlist({
    $version: 100000,
    $archiver: "NSKeyedArchiver",
    $top: { root: uid(1) },
    $objects: [
      "$null",
      {
        NSComponents: Buffer.from(`${channels(hex).join(" ")} 1`, "ascii"),
        NSColorSpace: 1,
        NSCustomColorSpace: uid(2),
        $class: uid(4),
      },
      { NSID: 7, $class: uid(3) },
      { $classname: "NSColorSpace", $classes: ["NSColorSpace", "NSObject"] },
      { $classname: "NSColor", $classes: ["NSColor", "NSObject"] },
    ],
  });
  const lines = archive.toString("base64").match(/.{1,68}/g);
  return `  <data>\n${lines.map((line) => `    ${line}`).join("\n")}\n  </data>`;
}

function renderGhostty(theme) {
  const t = theme.terminal;
  return (
    `# ${theme.name}\n` +
    `background = ${t.background}\nforeground = ${t.foreground}\n` +
    `cursor-color = ${t.cursor}\ncursor-text = ${t.cursorText}\n` +
    `selection-background = ${t.selection}\nselection-foreground = ${t.selectionForeground}\n` +
    theme.ansi.map((color, index) => `palette = ${index}=${color}\n`).join("")
  );
}

function renderKitty(theme) {
  const t = theme.terminal;
  return (
    `# ${theme.name}\n` +
    `background ${t.background}\nforeground ${t.foreground}\n` +
    `cursor ${t.cursor}\ncursor_text_color ${t.cursorText}\n` +
    `selection_background ${t.selection}\nselection_foreground ${t.selectionForeground}\n` +
    theme.ansi.map((color, index) => `color${index} ${color}\n`).join("")
  );
}

function renderAlacritty(theme) {
  const t = theme.terminal;
  const bank = (name, start) =>
    `[colors.${name}]\n` +
    ansiNames
      .map((color, index) => `${color} = "${theme.ansi[start + index]}"\n`)
      .join("");
  return (
    `# ${theme.name}\n\n[colors.primary]\nbackground = "${t.background}"\nforeground = "${t.foreground}"\n\n` +
    `[colors.cursor]\ncursor = "${t.cursor}"\ntext = "${t.cursorText}"\n\n` +
    `[colors.selection]\nbackground = "${t.selection}"\ntext = "${t.selectionForeground}"\n\n` +
    bank("normal", 0) +
    "\n" +
    bank("bright", 8)
  );
}

function renderWezTerm(theme) {
  const t = theme.terminal;
  return (
    `# ${theme.name}\n\n[colors]\n` +
    `background = "${t.background}"\nforeground = "${t.foreground}"\n` +
    `cursor_bg = "${t.cursor}"\ncursor_fg = "${t.cursorText}"\ncursor_border = "${t.cursor}"\n` +
    `selection_bg = "${t.selection}"\nselection_fg = "${t.selectionForeground}"\n` +
    `ansi = [${theme.ansi
      .slice(0, 8)
      .map((color) => `"${color}"`)
      .join(", ")}]\n` +
    `brights = [${theme.ansi
      .slice(8)
      .map((color) => `"${color}"`)
      .join(", ")}]\n` +
    `\n[metadata]\nname = "${theme.name}"\n`
  );
}

function renderITerm(theme) {
  const t = theme.terminal;
  return plist([
    ["Background Color", itermColor(t.background)],
    ["Foreground Color", itermColor(t.foreground)],
    ["Bold Color", itermColor(t.foreground)],
    ["Cursor Color", itermColor(t.cursor)],
    ["Cursor Text Color", itermColor(t.cursorText)],
    ["Selection Color", itermColor(t.selection)],
    ["Selected Text Color", itermColor(t.selectionForeground)],
    ...theme.ansi.map((color, index) => [
      `Ansi ${index} Color`,
      itermColor(color),
    ]),
  ]);
}

function renderTerminal(theme) {
  const t = theme.terminal;
  const nativeNames = ansiNames.map(
    (name) => name[0].toUpperCase() + name.slice(1),
  );
  return plist([
    ["name", `  <string>${xml(theme.name)}</string>`],
    ["type", "  <string>Window Settings</string>"],
    ["ProfileCurrentVersion", "  <real>2.07</real>"],
    ["BackgroundColor", terminalColor(t.background)],
    ["TextColor", terminalColor(t.foreground)],
    ["TextBoldColor", terminalColor(t.foreground)],
    ["CursorColor", terminalColor(t.cursor)],
    ["SelectionColor", terminalColor(t.selection)],
    ...theme.ansi.map((color, index) => [
      `ANSI${index >= 8 ? "Bright" : ""}${nativeNames[index % 8]}Color`,
      terminalColor(color),
    ]),
  ]);
}

function renderWindowsTerminal(theme) {
  const t = theme.terminal;
  const names = ansiNames.map((name) => (name === "magenta" ? "purple" : name));
  return json({
    name: theme.name,
    background: t.background,
    foreground: t.foreground,
    cursorColor: t.cursor,
    selectionBackground: t.selection,
    ...Object.fromEntries(
      theme.ansi.map((color, index) => {
        const name = names[index % 8];
        return [
          index < 8 ? name : `bright${name[0].toUpperCase()}${name.slice(1)}`,
          color,
        ];
      }),
    ),
  });
}

function renderXresources(theme) {
  const t = theme.terminal;
  return (
    `! ${theme.name} — xterm resources; does not affect other X applications.\n` +
    `XTerm*background: ${t.background}\nXTerm*foreground: ${t.foreground}\n` +
    `XTerm*cursorColor: ${t.cursor}\n` +
    `XTerm*highlightColor: ${t.selection}\nXTerm*highlightTextColor: ${t.selectionForeground}\n` +
    "XTerm*highlightColorMode: true\n" +
    theme.ansi.map((color, index) => `XTerm*color${index}: ${color}\n`).join("")
  );
}

export const terminalFormats = [
  {
    id: "ghostty",
    title: "Ghostty",
    extension: "conf",
    description:
      "Native colour-only theme with cursor, opaque selection and the exact 16 ANSI slots.",
    installation: [
      "Save the .conf file in $XDG_CONFIG_HOME/ghostty/themes/ (normally ~/.config/ghostty/themes/ on macOS and Linux). Create the themes directory if needed.",
      "In your existing Ghostty config, set theme = solai-tide-dark.conf, replacing the name with the exact downloaded filename, including .conf. An absolute path also works. Do not replace the rest of your config.",
      "Reload Ghostty configuration to apply. Existing explicit colour overrides in your config take precedence over theme values.",
    ],
    render: renderGhostty,
  },
  {
    id: "kitty",
    title: "Kitty",
    extension: "conf",
    description:
      "Colour-only include for Kitty; fonts, tabs, layout and shell settings remain yours.",
    installation: [
      "Save the file under ~/.config/kitty/themes/ on macOS or Linux (or the themes directory under your KITTY_CONFIG_DIRECTORY).",
      "Add include themes/solai-tide-dark.conf to your existing kitty.conf, replacing the filename with your chosen variant. Place it after other colour settings you want it to override.",
      "Reload the config with Ctrl+Shift+F5 on Linux or Control+Command+, on macOS. Other explicit colour settings after the include can override this theme.",
    ],
    render: renderKitty,
  },
  {
    id: "alacritty",
    title: "Alacritty",
    extension: "toml",
    description:
      "Importable TOML containing only primary, cursor, selection and ANSI colours.",
    installation: [
      "Save the file under ~/.config/alacritty/themes/ on macOS or Linux, or %APPDATA%\\alacritty\\themes\\ on Windows.",
      'Add the chosen file to the import array in the existing [general] table of alacritty.toml, for example import = ["themes/solai-tide-dark.toml"]. Merge with existing imports; do not duplicate the table or replace the config.',
      "Imports resolve relative to alacritty.toml; its own colour settings override imported values. Alacritty normally reloads changes automatically; otherwise restart it.",
    ],
    render: renderAlacritty,
  },
  {
    id: "wezterm",
    title: "WezTerm",
    extension: "toml",
    description:
      "Native colour-scheme TOML, not an executable Lua configuration.",
    installation: [
      "On macOS or Linux save the file in ~/.config/wezterm/colors/. On Windows use the colors directory beside wezterm.exe, or a directory already listed in color_scheme_dirs.",
      'In your existing wezterm.lua, set config.color_scheme = "Solai Tide Dark" using the exact name from the file’s [metadata] section, and retain your existing returned config table.',
      "WezTerm reloads configuration automatically. Explicit config.colors overrides still take precedence; multiplexed sessions use the multiplexer server’s scheme configuration.",
    ],
    render: renderWezTerm,
  },
  {
    id: "iterm2",
    title: "iTerm2",
    extension: "itermcolors",
    description:
      "Native sRGB colour preset; does not replace a profile or its fonts and commands.",
    installation: [
      "Keep the .itermcolors file anywhere convenient on your Mac. In iTerm2 open Settings → Profiles, choose your existing profile, then Colors → Color Presets… → Import….",
      "Select the downloaded file, then choose its filename-based preset from Color Presets…. If separate light/dark colours are enabled, first choose the mode you want to edit.",
      "Enable Use custom color for selected text to use the exported selected-text colour. Existing minimum-contrast, cursor-boost and context-aware cursor options can alter displayed colours; the preset does not change those preferences.",
    ],
    render: renderITerm,
  },
  {
    id: "terminal",
    title: "macOS Terminal",
    extension: "terminal",
    description:
      "Colour-only native profile with real sRGB NSColor keyed archives. Terminal controls selected-text and cursor-text colours itself.",
    installation: [
      "Keep the .terminal file anywhere convenient on your Mac. In Terminal → Settings → Profiles, use the action menu → Import… and select it, or drag it from Finder into the profile list.",
      "Choose the imported Solai profile from Shell → New Window or Shell → New Tab. Importing does not make it the default profile and does not modify your existing profiles.",
      "The imported profile supplies colours only; other properties inherit Terminal’s defaults, not custom settings from another profile. Adjust those in the new profile if needed. No shell command, font or window dimensions are included.",
    ],
    render: renderTerminal,
  },
  {
    id: "windows-terminal",
    title: "Windows Terminal",
    extension: "json",
    description:
      "One native scheme object, not a replacement settings.json. This format has no independent selected-text or cursor-text colour.",
    installation: [
      "Unzip the download and locate its scheme .json file; keep the accompanying license notices. Open Windows Terminal → Settings → Open JSON file. Store installations normally use %LOCALAPPDATA%\\Packages\\Microsoft.WindowsTerminal_8wekyb3d8bbwe\\LocalState\\settings.json; unpackaged installations use %LOCALAPPDATA%\\Microsoft\\Windows Terminal\\settings.json.",
      "Copy the downloaded object into the existing top-level schemes array, keeping other schemes and valid commas. Do not replace settings.json with this file.",
      "In Settings choose the desired profile → Appearance → Color scheme → Solai Tide Dark (or your imported name), then Save. Alternatively set that profile’s colorScheme to the exact scheme name. Your default profile and command line remain unchanged.",
    ],
    render: renderWindowsTerminal,
  },
  {
    id: "xresources",
    title: "Xresources / xterm",
    extension: "Xresources",
    description:
      "XTerm-scoped X11 resources with the exact ANSI palette and opaque selection. Other terminal emulators may use different resource names; xterm controls cursor text itself.",
    installation: [
      'Save the file under ~/.config/solai/ on an X11 system, then add #include ".config/solai/solai-tide-dark.Xresources" to ~/.Xresources, using your chosen filename. The quoted path resolves relative to ~/.Xresources.',
      "Merge your existing resource file with xrdb -merge ~/.Xresources, then open a new xterm. Keep other resources; do not use xrdb -load, which replaces the resource database.",
      "These resources target the XTerm application class only. More-specific existing XTerm resources and application-set colours may override them. A Wayland-native terminal does not consume Xresources.",
    ],
    render: renderXresources,
  },
];
