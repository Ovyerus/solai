import { contrastInk } from "./palette-shared.js";

export function node(tag, className, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  for (const child of Array.isArray(children) ? children : [children]) {
    element.append(
      typeof child === "string" ? document.createTextNode(child) : child,
    );
  }
  return element;
}

function token(role, text, className = "") {
  const element = node("span", `guide-token ${className}`, text);
  element.style.color = `var(--study-${role})`;
  return element;
}

function compositeColour(colour, background) {
  if (colour.length === 7) return colour;
  const alpha = parseInt(colour.slice(7), 16) / 255;
  return (
    "#" +
    [1, 3, 5]
      .map((index) =>
        Math.round(
          parseInt(colour.slice(index, index + 2), 16) * alpha +
            parseInt(background.slice(index, index + 2), 16) * (1 - alpha),
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export function resolveRole(role, palette, mode) {
  const reference =
    typeof role.source === "string" ? role.source : role.source[mode];
  if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(reference)) {
    return {
      ...role,
      reference,
      sourceKey: "Custom colour",
      value: reference.toUpperCase(),
    };
  }
  if (Object.hasOwn(palette.roleValues, reference)) {
    return {
      ...role,
      reference,
      sourceKey: palette.roles[reference].sourceKey,
      value: palette.roleValues[reference],
    };
  }
  if (reference.startsWith("syntax.")) {
    const key = reference.slice(7);
    const syntax =
      Object.hasOwn(palette.syntaxRoles, key) && palette.syntaxRoles[key];
    if (syntax)
      return {
        ...role,
        reference,
        sourceKey: syntax.sourceKey,
        value: syntax.value,
      };
  }
  const primitive = /^([A-Za-z][A-Za-z0-9]*)\[(\d+)\]$/.exec(reference);
  const value =
    primitive && palette.primitives[primitive[1]]?.[Number(primitive[2])];
  if (value) return { ...role, reference, sourceKey: reference, value };
  throw Error(`Unavailable guide source: ${reference}`);
}

function surfaceSpecimen() {
  const canvas = node(
    "div",
    "study-surfaces p-[25px] bg-[var(--study-canvas)] text-[color:var(--study-text)] [@media(max-width:650px)]:p-[17px]",
    [
      node(
        "div",
        "study-surface-title text-[21px] font-medium tracking-[-.03em]",
        "Harbour notebook",
      ),
      node(
        "p",
        "study-surface-caption mt-0 mb-0 text-[12px]",
        "Canvas · the space around the work",
      ),
    ],
  );
  const panel = node(
    "div",
    "study-surface-panel mt-[18px] rounded-[2px] border border-[color:var(--study-border)] bg-[var(--study-panel)] p-[20px] [@media(max-width:650px)]:p-[14px]",
    [
      node("strong", "font-bold", "Evening field notes"),
      node(
        "p",
        "mt-[6px] mb-0 text-[12px]",
        "Panel · a group of related observations",
      ),
    ],
  );
  const raised = node(
    "div",
    "study-surface-raised mt-[18px] rounded-[2px] border border-[color:var(--study-border)] bg-[var(--study-raised)] p-[20px] [@media(max-width:650px)]:p-[14px]",
    [
      node("strong", "font-bold", "Lake walk · 19:40"),
      node(
        "p",
        "mt-[6px] mb-0 text-[12px]",
        "Raised · the item in the foreground",
      ),
    ],
  );
  const hover = node(
    "div",
    "study-surface-hover mt-[18px] rounded-[2px] border border-[color:var(--study-border)] bg-[var(--study-hover)] p-[14px] text-[12px] [@media(max-width:650px)]:p-[10px]",
    "Hover / pressed fill · selected note",
  );
  raised.append(hover);
  panel.append(raised);
  canvas.append(panel);
  return canvas;
}

function interfaceSpecimen(values, roles, canvas) {
  const sample = node(
    "div",
    "study-interface p-[24px] text-[color:var(--study-text)] [@media(max-width:650px)]:p-[17px]",
  );
  const nav = node(
    "div",
    "study-interface-nav flex flex-wrap items-baseline gap-x-[22px] gap-y-[14px] border-b border-solai-border-subtle pb-[17px] text-[13px]",
    [
      token("text", "Field station", "study-interface-title grow font-medium"),
      token("link", "Overview", "study-link underline underline-offset-[4px]"),
      token("link", "Readings", "study-link underline underline-offset-[4px]"),
    ],
  );
  const content = node(
    "div",
    "study-interface-content flex flex-col items-start gap-[9px] py-[23px] text-[13px]",
    [
      token(
        "text",
        "Tonight’s observations",
        "study-interface-heading text-[21px] tracking-[-.03em]",
      ),
      token("muted", "Last synced at 20:14 · 4 entries"),
      node("p", "my-[9px]", [
        "The ",
        node(
          "span",
          "study-selected rounded-[2px] bg-[var(--study-selection)] p-[3px]",
          "harbour route",
        ),
        " is selected.",
      ]),
    ],
  );
  const action = node(
    "span",
    "study-action inline-block rounded-[2px] px-[13px] py-[10px] text-[12px]",
    "Save note · primary action",
  );
  action.style.backgroundColor = values.action;
  action.style.color = contrastInk(compositeColour(values.action, canvas));
  content.append(
    node("div", "study-actions flex flex-wrap items-center gap-[18px]", [
      action,
      node(
        "span",
        "study-focus rounded-[2px] border border-solai-border-strong p-[8px] text-[12px] text-[color:var(--study-text)] outline-2 outline-offset-[3px] outline-[color:var(--study-focus)]",
        "Keyboard focus",
      ),
    ]),
  );
  const signals = node(
    "div",
    "study-signals grid gap-[8px] border-t border-solai-border-subtle pt-[17px] text-[12px]",
    [
      token("success", "✓ Saved · success"),
      token("warning", "! Unsynced · warning"),
      token("danger", "× Failed upload · danger"),
      token("info", "i Offline copy · information"),
    ],
  );
  sample.append(nav, content, signals);
  return sample;
}

function codeSpecimen() {
  return node(
    "pre",
    "study-code m-0 max-w-full overflow-x-auto px-[23px] py-[27px] font-mono text-[13px] leading-[1.95] text-solai-text-primary [tab-size:2] [@media(max-width:650px)]:px-[15px] [@media(max-width:650px)]:py-[20px] [@media(max-width:650px)]:text-[12px]",
    node("code", "[font:inherit]", [
      token("comment", "// Gather the lights along the water."),
      "\n",
      token("keyword", "function"),
      " ",
      token("function", "harbourLights"),
      token("punctuation", "("),
      token("identifier", "route"),
      token("punctuation", ": "),
      token("type", "Route"),
      token("punctuation", ") {"),
      "\n",
      "  ",
      token("keyword", "const"),
      " ",
      token("identifier", "limit"),
      " ",
      token("operator", "="),
      " ",
      token("literal", "3"),
      token("punctuation", ";"),
      "\n",
      "  ",
      token("keyword", "return"),
      " ",
      token("identifier", "route"),
      token("punctuation", "."),
      token("member", "stops"),
      "\n",
      "    ",
      token("punctuation", "."),
      token("function", "filter"),
      token("punctuation", "("),
      token("identifier", "stop"),
      " ",
      token("operator", "=>"),
      " ",
      token("identifier", "stop"),
      token("punctuation", "."),
      token("member", "lit"),
      token("punctuation", ")"),
      "\n",
      "    ",
      token("punctuation", "."),
      token("function", "slice"),
      token("punctuation", "("),
      token("literal", "0"),
      token("punctuation", ", "),
      token("identifier", "limit"),
      token("punctuation", ")"),
      "\n",
      "    ",
      token("punctuation", "."),
      token("function", "map"),
      token("punctuation", "("),
      token("identifier", "stop"),
      " ",
      token("operator", "=>"),
      " ",
      token("string", '"Light at "'),
      " ",
      token("operator", "+"),
      " ",
      token("identifier", "stop"),
      token("punctuation", "."),
      token("member", "name"),
      token("punctuation", ");"),
      "\n",
      token("punctuation", "}"),
    ]),
  );
}

function proseSpecimen() {
  const article = node(
    "article",
    "study-prose max-w-[740px] p-[28px] text-[14px] leading-[1.9] text-[color:var(--study-body)] [@media(max-width:650px)]:px-[18px] [@media(max-width:650px)]:py-[22px]",
    [
      node(
        "p",
        "study-prose-marker mt-0 mb-[1em] text-[11px] tracking-[.05em] text-[color:var(--study-marker)] uppercase",
        "Night walks / 07",
      ),
      node(
        "h3",
        "mt-0 mb-[1em] text-[25px] leading-[1.4] font-medium tracking-[-.035em] text-[color:var(--study-heading)] [@media(max-width:650px)]:text-[23px]",
        "What the water remembers",
      ),
      node("p", "mt-0 mb-[1em]", [
        "After sunset, the glasshouse holds the last warmth. We record each lamp with ",
        token(
          "code",
          "light.level",
          "study-inline-code font-mono text-[14px] leading-[normal]",
        ),
        " and follow the reflections home.",
      ]),
      node(
        "blockquote",
        "mx-0 my-[23px] border-l-[3px] border-[color:var(--study-quote)] pl-[18px] text-[16px] text-[color:var(--study-quote)]",
        "“The bright marks tell us where to look; the quiet page gives us room to read.”",
      ),
      node("p", "mt-0 mb-[1em]", [
        token("marker", "01 · "),
        "Compare the readings at the same hour.",
      ]),
      node("p", "m-0", [
        token(
          "link",
          "Field notes and measurement method ↗",
          "study-link underline underline-offset-[4px]",
        ),
      ]),
    ],
  );
  return article;
}

function editorSpecimen() {
  const bracket = (text, depth) => {
    const element = token(`bracket${depth % 6}`, text, "study-bracket");
    element.dataset.bracketDepth = String(depth);
    return element;
  };
  const line = (number, children, active = false) =>
    node(
      "div",
      active
        ? "study-editor-line is-current flex w-max min-w-full rounded-[2px] bg-[var(--study-currentLine)] pe-[18px] whitespace-pre text-solai-text-primary"
        : "study-editor-line flex w-max min-w-full pe-[18px] whitespace-pre text-solai-text-primary",
      [
        token(
          active ? "activeNumber" : "lineNumber",
          String(number),
          "study-line-number basis-[52px] grow-0 shrink-0 pr-[16px] text-right select-none [@media(max-width:650px)]:basis-[38px] [@media(max-width:650px)]:pr-[10px]",
        ),
        node(
          "span",
          "study-editor-source relative border-l border-[color:var(--study-guide)] pl-[16px] [@media(max-width:650px)]:pl-[10px]",
          children,
        ),
      ],
    );
  const frame = node(
    "div",
    "study-editor overflow-hidden rounded-[2px] bg-solai-surface-canvas",
    [
      node(
        "div",
        "study-window-title border-b border-solai-border-subtle px-[17px] py-[12px] font-mono text-[12px] leading-[normal] text-solai-text-secondary",
        "harbour.ts · editor chrome",
      ),
      node(
        "div",
        "study-editor-lines overflow-x-auto py-[20px] font-mono text-[13px] leading-[2.25] [@media(max-width:650px)]:text-[12px]",
        [
          line(12, [
            "function lights",
            bracket("(", 0),
            "route",
            bracket(")", 0),
            " ",
            bracket("{", 0),
          ]),
          line(13, [
            "  const ",
            token(
              "search",
              "harbour",
              "study-search border-b-2 border-[color:var(--study-search)] font-medium",
            ),
            " = route.stops;",
          ]),
          line(
            14,
            [
              "  return ",
              token(
                "search",
                "harbour",
                "study-search border-b-2 border-[color:var(--study-search)] font-medium",
              ),
              ".map",
              bracket("(", 1),
              bracket("(", 2),
              "light",
              token("cursor", "▏", "study-cursor font-medium"),
              bracket(")", 2),
              " => ",
              bracket("(", 2),
              bracket("{", 3),
            ],
            true,
          ),
          line(15, [
            "    labels: ",
            bracket("[", 4),
            "String",
            bracket("(", 5),
            "light.name",
            bracket(")", 5),
            bracket("]", 4),
            ",",
          ]),
          line(16, [
            "  ",
            bracket("}", 3),
            bracket(")", 2),
            bracket(")", 1),
            ";",
          ]),
          line(17, [bracket("}", 0)]),
        ],
      ),
      node(
        "div",
        "study-editor-footer border-t border-solai-border-subtle px-[17px] py-[12px] font-mono text-[11px] leading-[normal] text-solai-text-secondary",
        "Rainbow brackets · 6 nesting colours · 2 search matches",
      ),
    ],
  );
  return frame;
}

function changesSpecimen() {
  const rowHooks = {
    removed: "study-change-removed",
    added: "study-change-added",
    changed: "study-change-changed",
    conflict: "study-change-conflict",
    hint: "study-change-hint",
  };
  const wordClasses = {
    removed:
      "study-changed-word line-through decoration-[color:var(--study-removed)]",
    added:
      "study-changed-word underline decoration-[color:var(--study-added)] decoration-2 underline-offset-[5px]",
    changed:
      "study-changed-word underline decoration-[color:var(--study-changed)] decoration-2 underline-offset-[5px]",
    conflict: "study-changed-word",
    hint: "study-changed-word",
  };
  const row = (role, symbol, before, value, after, detail) => {
    const content = [before, token(role, value, wordClasses[role]), after];
    const label = token(
      role,
      detail,
      "study-change-detail col-start-2 font-sans text-[11px] leading-[1.7]",
    );
    const element = node(
      "div",
      "study-change mt-[12px] grid grid-cols-[18px_minmax(0,1fr)] gap-x-[10px] gap-y-[6px] rounded-[2px] border border-solai-border-subtle px-[18px] py-[14px] font-mono text-[12px] leading-[1.7] [@media(max-width:650px)]:px-[12px]",
      [
        token(role, symbol, "study-change-mark font-medium"),
        node(
          "code",
          "wrap-anywhere whitespace-pre-wrap font-mono text-solai-text-primary",
          content,
        ),
        label,
      ],
    );
    element.classList.add(rowHooks[role]);
    return element;
  };
  return node("div", "study-changes p-[15px]", [
    node(
      "div",
      "study-window-title border-b border-solai-border-subtle py-[12px] pr-[17px] pl-0 font-mono text-[12px] leading-[normal] text-solai-text-secondary",
      "route.ts · change review",
    ),
    row("removed", "−", "const stop = ", '"Old quay"', ";", "Removed line"),
    row("added", "+", "const stop = ", '"Glasshouse"', ";", "Added line"),
    row("changed", "~", "const departure = ", '"20:10"', ";", "Changed value"),
    row(
      "conflict",
      "!",
      "Unresolved departure: ",
      '"20:10" / "20:30"',
      "",
      "Conflict · attention needed",
    ),
    row(
      "hint",
      "i",
      "",
      "Compare local and incoming times.",
      "",
      "Hint · information",
    ),
  ]);
}

function terminalSpecimen() {
  const prompt = node("div", "study-terminal-command wrap-anywhere", [
    token("prompt", "garden@harbour ~/notes $ "),
    "cat evening.txt",
  ]);
  const output = node("div", "study-terminal-output my-[16px] wrap-anywhere", [
    node("div", "", "20:14  glasshouse lights on"),
    node("div", "", [
      node(
        "span",
        "study-terminal-selection rounded-[2px] bg-[var(--study-selection)] py-[3px]",
        "20:18  quay lamps reflected in the water",
      ),
    ]),
    node("div", "", "20:21  last train across the bridge"),
  ]);
  const next = node("div", "study-terminal-command wrap-anywhere", [
    token("prompt", "garden@harbour ~/notes $ "),
    token("cursor", "▌", "study-cursor font-medium"),
  ]);
  return node(
    "div",
    "study-terminal rounded-[2px] border-2 border-[color:var(--study-border)] bg-[var(--study-background)] p-[20px] font-mono text-[13px] leading-[1.9] text-[color:var(--study-foreground)] [@media(max-width:650px)]:p-[15px] [@media(max-width:650px)]:text-[12px]",
    [
      node(
        "div",
        "study-terminal-title mb-[16px] border-b border-[color:var(--study-border)] pb-[14px]",
        "Evening log · terminal chrome",
      ),
      prompt,
      output,
      next,
      node(
        "p",
        "study-terminal-note mt-[22px] mb-0 border-t border-[color:var(--study-border)] pt-[13px] font-sans text-[11px] leading-[1.8]",
        "Output uses the terminal foreground here; program ANSI colours are a separate choice below.",
      ),
    ],
  );
}

function ansiSpecimen(roles, canvas) {
  return node("div", "study-ansi p-[20px] [@media(max-width:650px)]:p-[17px]", [
    node(
      "p",
      "study-ansi-note mt-0 mb-[15px] text-[12px] text-solai-text-secondary",
      "16 conventional slots · labels use contrasting ink, not the slot as a text colour.",
    ),
    node(
      "div",
      "study-ansi-grid grid grid-cols-2 gap-[7px] [@media(max-width:1000px)]:grid-cols-4 [@media(max-width:650px)]:grid-cols-2",
      roles.map((role) => {
        const tile = node(
          "div",
          "study-ansi-tile flex min-h-[70px] min-w-0 flex-col gap-[6px] rounded-[2px] p-[13px]",
          [
            node("strong", "text-[11px] font-medium", role.label),
            node("code", "font-mono text-[12px]", role.value),
          ],
        );
        tile.style.backgroundColor = role.value;
        tile.style.color = contrastInk(compositeColour(role.value, canvas));
        tile.dataset.ansiSlot = role.key.slice(4);
        return tile;
      }),
    ),
    node(
      "p",
      "study-ansi-note mt-[18px] mb-0 text-[12px] text-solai-text-secondary",
      "The application assigns meaning to each slot. “Bright” is a separate palette grade, not white mixed into a colour.",
    ),
  ]);
}

const renderers = {
  surfaces: surfaceSpecimen,
  interface: interfaceSpecimen,
  code: codeSpecimen,
  prose: proseSpecimen,
  editor: editorSpecimen,
  changes: changesSpecimen,
  terminal: terminalSpecimen,
  ansi: (values, roles, canvas) => ansiSpecimen(roles, canvas),
};

export function renderSpecimen(specimen, sectionId, roles, context = {}) {
  const values = Object.fromEntries(
    roles.map((role) => [role.key, role.value]),
  );
  specimen.style.cssText = "";
  for (const [key, value] of Object.entries(context))
    specimen.style.setProperty(`--${key}`, value);
  for (const role of roles)
    specimen.style.setProperty(`--study-${role.key}`, role.value);
  let canvas;
  const translucentLabels =
    sectionId === "interface"
      ? values.action.length === 9
      : sectionId === "ansi" && roles.some((role) => role.value.length === 9);
  if (translucentLabels) {
    const pageCanvas = getComputedStyle(document.documentElement)
      .getPropertyValue("--canvas")
      .trim();
    const specimenCanvas = getComputedStyle(specimen)
      .getPropertyValue("--canvas")
      .trim();
    canvas = compositeColour(specimenCanvas, pageCanvas);
  }
  specimen.replaceChildren(renderers[sectionId](values, roles, canvas));
}
