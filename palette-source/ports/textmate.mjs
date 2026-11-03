// Shared TextMate syntax rules for VS Code and Shiki.
export function textMateTokens({ roles }) {
  const { code, prose, changes, interface: signal } = roles;
  const token = (name, scope, foreground, fontStyle = "") => ({
    name,
    scope,
    settings: { foreground, fontStyle },
  });
  return [
    token(
      "Neutral source and embedded code",
      ["source", "meta.embedded"],
      code.identifier,
    ),
    token(
      "Readable comments",
      ["comment", "punctuation.definition.comment"],
      code.comment,
    ),
    token(
      "Neutral bold grammar",
      ["keyword", "storage", "variable.language"],
      code.keyword,
      "bold",
    ),
    token("Sparse operators", ["keyword.operator"], code.operator),
    token(
      "Word operators remain grammar",
      [
        "keyword.operator.expression",
        "keyword.operator.new",
        "keyword.operator.word",
        "keyword.operator.logical.python",
        "keyword.operator.typeof",
        "keyword.operator.instanceof",
      ],
      code.keyword,
      "bold",
    ),
    token(
      "Neutral identifiers, including constants",
      [
        "variable",
        "entity.name.variable",
        "support.variable",
        "support.constant",
        "constant.other",
        "entity.name.namespace",
        "entity.name.label",
      ],
      code.identifier,
    ),
    token(
      "Neutral callable names",
      ["entity.name.function", "support.function"],
      code.function,
    ),
    token(
      "Neutral members and object keys",
      [
        "variable.other.property",
        "variable.other.object.property",
        "variable.other.constant.property",
        "variable.other.enummember",
        "support.variable.property",
        "meta.object-literal.key",
      ],
      code.member,
    ),
    token(
      "Companion types",
      [
        "entity.name.type",
        "entity.name.class",
        "entity.other.inherited-class",
        "support.type",
        "support.class",
        "storage.type.primitive",
        "storage.type.builtin",
        "storage.type.numeric",
        "storage.type.string",
        "storage.type.boolean",
      ],
      code.type,
    ),
    token(
      "Quoted data",
      ["string", "punctuation.definition.string"],
      code.string,
    ),
    token(
      "Literal values",
      [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.character.escape",
        "support.constant.color",
      ],
      code.literal,
    ),
    token(
      "Readable delimiters",
      ["punctuation", "meta.brace"],
      code.punctuation,
    ),
    token(
      "Quoted delimiters follow their data",
      ["punctuation.definition.string"],
      code.string,
    ),
    token(
      "Template interpolation delimiters",
      [
        "punctuation.definition.template-expression",
        "punctuation.section.embedded",
      ],
      code.punctuation,
    ),
    token(
      "Template interpolation code",
      ["meta.template.expression"],
      code.identifier,
    ),
    token("Markup tags", ["entity.name.tag"], code.keyword),
    token("Markup attributes", ["entity.other.attribute-name"], code.member),
    token(
      "CSS properties",
      ["support.type.property-name", "meta.property-name"],
      code.member,
    ),
    token(
      "CSS selectors",
      [
        "entity.other.attribute-name.class.css",
        "entity.other.attribute-name.id.css",
      ],
      code.identifier,
    ),
    token("Markdown body", ["text.html.markdown"], prose.body),
    token(
      "Markdown headings",
      ["markup.heading", "entity.name.section.markdown"],
      prose.heading,
      "bold",
    ),
    token("Markdown strong", ["markup.bold"], prose.body, "bold"),
    token("Markdown emphasis", ["markup.italic"], prose.body, "italic"),
    token(
      "Markdown strong emphasis",
      ["markup.bold markup.italic", "markup.italic markup.bold"],
      prose.body,
      "bold italic",
    ),
    token("Markdown quotations", ["markup.quote"], prose.quote),
    token("Markdown inline code", ["markup.inline.raw"], prose.code),
    token(
      "Markdown links",
      [
        "markup.underline.link",
        "string.other.link",
        "meta.link.inline.markdown",
      ],
      prose.link,
      "underline",
    ),
    token(
      "Markdown list markers",
      ["punctuation.definition.list.begin.markdown"],
      prose.marker,
    ),
    token(
      "Markdown fences",
      [
        "punctuation.definition.markdown",
        "punctuation.definition.raw.markdown",
      ],
      code.punctuation,
    ),
    token("Inserted diff text", ["markup.inserted"], changes.added),
    token("Removed diff text", ["markup.deleted"], changes.removed),
    token("Changed diff text", ["markup.changed"], changes.changed),
    token(
      "Diff headers",
      ["meta.diff.header", "meta.diff.range"],
      code.comment,
    ),
    token("Invalid syntax", ["invalid", "invalid.illegal"], signal.danger),
    token("Deprecated syntax", ["invalid.deprecated"], changes.hint),
  ];
}
