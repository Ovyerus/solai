export const guideSections = [
  {
    id: "surfaces",
    title: "Surfaces",
    description:
      "A surface tells you where something belongs: the workspace, a contained task, a raised detail or a temporary interaction. Neutral steps describe depth. Keep the strongest text on hover fills; subtle dividers separate regions without serving as the only boundary of a control.",
    roles: [
      {
        key: "canvas",
        label: "Workspace",
        source: "surface.canvas",
        meaning:
          "The continuous background behind the whole application, not a card of its own.",
      },
      {
        key: "panel",
        label: "Contained task",
        source: "surface.panel",
        meaning:
          "Groups related material without suggesting that it floats above the workspace.",
      },
      {
        key: "raised",
        label: "Raised detail",
        source: "surface.raised",
        meaning:
          "Separates a nested inspector or small overlay from its parent panel.",
      },
      {
        key: "hover",
        label: "Interaction fill",
        source: "surface.hover",
        meaning:
          "Marks the row under the pointer or a pressed item; use primary text on this stronger fill.",
      },
      {
        key: "border",
        label: "Decorative divider",
        source: "border.subtle",
        meaning:
          "Separates neighbouring regions softly; it is not an essential control outline.",
      },
      {
        key: "text",
        label: "Surface text",
        source: "text.primary",
        meaning:
          "Carries the content across all four neutral layers without assigning a status.",
      },
    ],
  },
  {
    id: "interface",
    title: "Text & signals",
    description:
      "Separate ordinary reading, navigation, actions and status. The flavour accent leads links, actions and focus. Success stays green, warning yellow, danger red and information blue, independently of the chosen flavour. Labels and symbols carry the same message without colour.",
    roles: [
      {
        key: "text",
        label: "Reading text",
        source: "text.primary",
        meaning:
          "Names the object and explains the task without implying interactivity.",
      },
      {
        key: "muted",
        label: "Supporting text",
        source: "text.muted",
        meaning:
          "Carries useful secondary detail on canvas or panel; it is not disabled content.",
      },
      {
        key: "link",
        label: "Navigation link",
        source: "accent.primary",
        meaning:
          "Identifies a destination in the flavour colour; an underline should also identify the link.",
      },
      {
        key: "action",
        label: "Primary action",
        source: "accent.primary",
        meaning:
          "Names the main operation, not a success that has already happened; filled versions need an appropriate contrasting label.",
      },
      {
        key: "focus",
        label: "Keyboard focus",
        source: "accent.highlight",
        meaning:
          "Marks the element receiving keyboard input, independently of hover or selection.",
      },
      {
        key: "selection",
        label: "Selected content",
        source: "selection.background",
        meaning:
          "A translucent fill behind selected text; composite it over the real surface and retain a readable foreground.",
      },
      {
        key: "success",
        label: "Successful result",
        source: "status.success",
        meaning:
          "Confirms an operation completed; pair green with a success label or check mark.",
      },
      {
        key: "warning",
        label: "Needs attention",
        source: "status.warning",
        meaning:
          "Warns about a condition worth checking before continuing, without claiming failure.",
      },
      {
        key: "danger",
        label: "Failure or destructive action",
        source: "status.danger",
        meaning:
          "Identifies a failed operation or a destructive choice; name the consequence explicitly.",
      },
      {
        key: "info",
        label: "Informational notice",
        source: "status.info",
        meaning:
          "Provides neutral operational information, not an extra action accent.",
      },
    ],
  },
  {
    id: "code",
    title: "Code",
    description:
      "Clean, mostly monotone code uses contrast to give the grammar definition. Small accents distinguish quoted data, literal values and types rather than colouring every name. Colour identifies language roles, not correctness; comments and punctuation stay readable in neutral text.",
    roles: [
      {
        key: "keyword",
        label: "Language keyword",
        source: "syntax.keyword",
        meaning:
          "Strong neutral grammar identifies a declaration without assigning it a category hue.",
      },
      {
        key: "string",
        label: "String value",
        source: "accent.primary",
        meaning:
          "The lead accent marks quoted data; it does not mean the string is an action or a status.",
      },
      {
        key: "literal",
        label: "Literal value",
        source: "syntax.literal",
        meaning:
          "A stronger accent grade distinguishes a boolean or number from surrounding names.",
      },
      {
        key: "function",
        label: "Callable name",
        source: "text.primary",
        meaning:
          "Readable neutral text names an operation without making every call a visual headline.",
      },
      {
        key: "type",
        label: "Type name",
        source: "accent.secondary",
        meaning:
          "The companion accent marks the shape of a value rather than the value itself.",
      },
      {
        key: "member",
        label: "Object member",
        source: "text.secondary",
        meaning:
          "A quieter neutral names a property reached through an object.",
      },
      {
        key: "operator",
        label: "Operator",
        source: "accent.highlight",
        meaning:
          "A sparse high-emphasis mark identifies an operation or assignment between tokens.",
      },
      {
        key: "comment",
        label: "Comment",
        source: "text.muted",
        meaning:
          "Secondary explanation stays readable on the code canvas; muted does not mean disposable.",
      },
      {
        key: "punctuation",
        label: "Punctuation",
        source: "text.muted",
        meaning:
          "Delimiters remain readable but do not compete with data for the accent colour.",
      },
      {
        key: "identifier",
        label: "Local identifier",
        source: "syntax.identifier",
        meaning:
          "A neutral name ties the expression together without suggesting a special token class.",
      },
    ],
  },
  {
    id: "prose",
    title: "Prose",
    description:
      "A neutral heading and body give long reading a stable foundation. The lead accent marks destinations, the companion picks out inline code, and quieter text distinguishes quotations. Link underlines and quotation marks retain their meaning when hues converge.",
    roles: [
      {
        key: "heading",
        label: "Heading",
        source: "text.emphasis",
        meaning:
          "Strong neutral hierarchy names the subject without turning the heading into a link.",
      },
      {
        key: "body",
        label: "Body text",
        source: "text.primary",
        meaning: "Carries the continuous reading text on the prose canvas.",
      },
      {
        key: "link",
        label: "Prose link",
        source: "accent.primary",
        meaning:
          "The flavour accent marks a destination inside the sentence; retain an underline.",
      },
      {
        key: "code",
        label: "Inline code",
        source: "accent.secondary",
        meaning:
          "Distinguishes an exact technical identifier from ordinary prose, not a clickable action.",
      },
      {
        key: "quote",
        label: "Quotation",
        source: "text.secondary",
        meaning:
          "A modest neutral step identifies another voice alongside quotation marks or a rule.",
      },
      {
        key: "marker",
        label: "List marker",
        source: "accent.primary",
        meaning:
          "An accent marker gives a list a scanning rhythm without assigning priority to its items.",
      },
    ],
  },
  {
    id: "editor",
    title: "Editor chrome",
    description:
      "Editor colour locates the caret, the active line and navigation matches, separately from language syntax. A neutral current-line fill and quiet gutter keep the code grounded. Violet text and underlines mark search matches; rainbow brackets pair delimiters by nesting depth, while the bright caret marks the insertion point. Use current-line colours as background fills and guide colours for lines.",
    roles: [
      {
        key: "cursor",
        label: "Caret",
        source: "accent.highlight",
        meaning:
          "Identifies the insertion point, not a selected character or a syntax class.",
      },
      {
        key: "currentLine",
        label: "Current-line fill",
        source: "surface.panel",
        meaning:
          "A neutral background band locates the line containing the caret while code remains readable above it.",
      },
      {
        key: "lineNumber",
        label: "Line number",
        source: "text.muted",
        meaning:
          "Provides readable location information on the gutter canvas without competing with the code.",
      },
      {
        key: "activeNumber",
        label: "Active line number",
        source: "text.primary",
        meaning:
          "A stronger neutral number confirms which line owns the caret.",
      },
      {
        key: "search",
        label: "Search match",
        source: "support.violet",
        meaning:
          "Violet text and an underline identify the found term on both the canvas and neutral current-line fill; the match is not a syntax category.",
      },
      {
        key: "bracket0",
        label: "Bracket depth 1",
        source: "support.orange",
        meaning:
          "Orange starts the nesting cycle on outer delimiter pairs; matching open and close characters share a colour, not a warning state.",
      },
      {
        key: "bracket1",
        label: "Bracket depth 2",
        source: "support.chartreuse",
        meaning:
          "Chartreuse identifies the next pair inside the outer scope; colour follows nesting rather than bracket shape.",
      },
      {
        key: "bracket2",
        label: "Bracket depth 3",
        source: "support.spring",
        meaning:
          "Spring distinguishes a third nesting level; closing delimiters return to the colour of their own opening pair.",
      },
      {
        key: "bracket3",
        label: "Bracket depth 4",
        source: "support.cyan",
        meaning:
          "Cyan carries the fourth level through the nested object, independently of search, selection or diagnostic status.",
      },
      {
        key: "bracket4",
        label: "Bracket depth 5",
        source: "support.violet",
        meaning:
          "Violet identifies the fifth level, here an array inside the object; pairing and position provide meaning even when hues converge.",
      },
      {
        key: "bracket5",
        label: "Bracket depth 6",
        source: "support.rose",
        meaning:
          "Rose completes the six-colour cycle on the innermost call; deeper nesting repeats the sequence instead of inventing a new semantic category.",
      },
      {
        key: "guide",
        label: "Indentation guide",
        source: "border.subtle",
        meaning:
          "A decorative vertical rule helps follow indentation; do not use this low-contrast role for line-number text.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes & diagnostics",
    description:
      "Spend colour on the words or values that changed instead of colouring an entire row. Additions stay green, removals red, and the lead accent marks ordinary edits. Red identifies unresolved conflicts; optional hints recede to readable neutral text. Diff categories are separate from diagnostic severity: retain +, −, ~ and explicit labels.",
    roles: [
      {
        key: "added",
        label: "Inserted word",
        source: "status.success",
        meaning:
          "Green identifies the inserted word alongside a + marker; surrounding unchanged text stays neutral.",
      },
      {
        key: "removed",
        label: "Deleted word",
        source: "status.danger",
        meaning:
          "Red identifies the deleted word alongside a − marker; removal is a diff operation, not a diagnosis.",
      },
      {
        key: "changed",
        label: "Edited value",
        source: "accent.primary",
        meaning:
          "The flavour accent singles out an edited value without implying a warning severity.",
      },
      {
        key: "conflict",
        label: "Conflicting value",
        source: "status.danger",
        meaning:
          "Red and a conflict label identify the unresolved choice, not just either side of the edit.",
      },
      {
        key: "hint",
        label: "Optional advice",
        source: "text.muted",
        meaning:
          "A readable neutral keeps nonblocking advice below conflicts in visual priority; the hint label remains explicit.",
      },
    ],
  },
  {
    id: "terminal",
    title: "Terminal UI",
    description:
      "A neutral canvas and readable output frame a lead-accent prompt. Keep the caret bright and the border quiet so shell context does not overshadow the command result. Program output chooses ANSI slots, true colour or its own theme independently of the terminal interface.",
    roles: [
      {
        key: "background",
        label: "Terminal canvas",
        source: "surface.canvas",
        meaning:
          "The base surface beneath shell text and program output; it is separate from ANSI slot 0.",
      },
      {
        key: "foreground",
        label: "Default output",
        source: "text.primary",
        meaning:
          "Readable text for output that does not request its own colour.",
      },
      {
        key: "prompt",
        label: "Shell prompt",
        source: "accent.primary",
        meaning:
          "The flavour accent identifies shell context before the command, not the command’s exit status.",
      },
      {
        key: "cursor",
        label: "Terminal caret",
        source: "accent.highlight",
        meaning:
          "Marks where the next typed character will appear; a block caret needs a contrasting character colour.",
      },
      {
        key: "selection",
        label: "Terminal selection",
        source: "selection.background",
        meaning:
          "A translucent fill behind selected terminal text; keep the normal output foreground and check the composite.",
      },
      {
        key: "border",
        label: "Window divider",
        source: "border.subtle",
        meaning:
          "A decorative edge separates shell chrome from content; it must not be the sole essential window boundary.",
      },
    ],
  },
  {
    id: "ansi",
    title: "ANSI slots",
    description:
      "ANSI is an indexed vocabulary: applications decide what each slot means. Medium chromatic slots use grades 7/9 in dark mode and 8/9 in light mode for the normal/bright banks. Bright selects another palette grade, not a white overlay. Black and white retain their conventional identities rather than reversing with the page. Some normal and neutral slots lack sufficient contrast for small foreground text.",
    roles: [
      {
        key: "slot0",
        label: "0 · Black",
        source: { dark: "fg[0]", light: "fg[10]" },
        meaning:
          "Conventional black slot for applications that request index 0; it can disappear as foreground on a dark canvas.",
      },
      {
        key: "slot1",
        label: "1 · Red",
        source: { dark: "red[7]", light: "red[8]" },
        meaning:
          "Conventional red, often requested for errors or removals but not guaranteed to mean either; normal-grade contrast needs checking.",
      },
      {
        key: "slot2",
        label: "2 · Green",
        source: { dark: "green[7]", light: "green[8]" },
        meaning:
          "Conventional green, which a program may use for success, directories or unrelated output; the application supplies the meaning.",
      },
      {
        key: "slot3",
        label: "3 · Yellow",
        source: { dark: "yellow[7]", light: "yellow[8]" },
        meaning:
          "Conventional yellow; warning is a common application choice, not a promise built into the index.",
      },
      {
        key: "slot4",
        label: "4 · Blue",
        source: { dark: "blue[7]", light: "blue[8]" },
        meaning:
          "Conventional blue; check this normal grade against the terminal canvas before using it for small text.",
      },
      {
        key: "slot5",
        label: "5 · Magenta",
        source: { dark: "magenta[7]", light: "magenta[8]" },
        meaning:
          "Conventional magenta for whichever category a program assigns, not a built-in diagnostic level.",
      },
      {
        key: "slot6",
        label: "6 · Cyan",
        source: { dark: "cyan[7]", light: "cyan[8]" },
        meaning:
          "Conventional cyan, independent of navigation, syntax or status meanings a program may assign.",
      },
      {
        key: "slot7",
        label: "7 · White",
        source: { dark: "fg[8]", light: "fg[2]" },
        meaning:
          "Conventional normal white; intentionally pale in light mode and not a replacement for readable default foreground.",
      },
      {
        key: "slot8",
        label: "8 · Bright black",
        source: { dark: "fg[5]", light: "fg[6]" },
        meaning:
          "A grey version of black, not disabled-text semantics; especially in dark mode it is below a normal-text contrast target.",
      },
      {
        key: "slot9",
        label: "9 · Bright red",
        source: "red[9]",
        meaning:
          "A stronger red grade for the bright-red index; it does not mean a more severe error than slot 1.",
      },
      {
        key: "slot10",
        label: "10 · Bright green",
        source: "green[9]",
        meaning:
          "A stronger green grade for the bright-green index; a program may use it without any success meaning.",
      },
      {
        key: "slot11",
        label: "11 · Bright yellow",
        source: "yellow[9]",
        meaning:
          "A stronger yellow grade, not a higher warning severity or yellow mixed with white.",
      },
      {
        key: "slot12",
        label: "12 · Bright blue",
        source: "blue[9]",
        meaning:
          "A stronger blue grade; in light mode stronger can mean darker, because the grade direction reverses.",
      },
      {
        key: "slot13",
        label: "13 · Bright magenta",
        source: "magenta[9]",
        meaning:
          "A stronger magenta grade that keeps the same conventional hue identity as slot 5.",
      },
      {
        key: "slot14",
        label: "14 · Bright cyan",
        source: "cyan[9]",
        meaning:
          "A stronger cyan grade rather than an information-status alias or an added white overlay.",
      },
      {
        key: "slot15",
        label: "15 · Bright white",
        source: { dark: "fg[10]", light: "fg[0]" },
        meaning:
          "The lightest neutral in this mapping; as foreground it is deliberately unsuitable on a light terminal canvas.",
      },
    ],
  },
];
