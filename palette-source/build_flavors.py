"""Generate Solai's ten live variants and exports without third-party dependencies.

Run from any directory: python3 palette-source/build_flavors.py
Historical source snapshots are read as data, never imported or executed.
"""

import copy
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
PROJECT = ROOT.parent
SPECS = (
    ('blue', 'Tide', 'dolch', None, None),
    ('alter', 'Ember', 'dolch-alter', None, None),
    ('violet', 'Dusk', None, 300, 332),
    ('green', 'Viridian', None, 150, 182),
    ('rose', 'Bloom', None, 0, 32),
)
SURFACES = ('canvas', 'panel', 'raised', 'hover')
STATUS_FAMILIES = {'success': 'green', 'warning': 'yellow', 'danger': 'red', 'info': 'blue'}
UI_ROLES = {
    'canvas': 'surface.canvas', 'panel': 'surface.panel', 'raised': 'surface.raised',
    'hover': 'surface.hover', 'text': 'text.primary', 'emphasis': 'text.emphasis',
    'secondary': 'text.secondary', 'muted': 'text.muted', 'border': 'border.subtle',
    'strong': 'border.strong', 'accent': 'accent.primary', 'accent-hover': 'accent.hover',
    'highlight': 'accent.highlight', 'ink': 'accent.ink', 'support': 'accent.secondary',
    'selection': 'selection.background',
    **{key: 'status.' + key for key in STATUS_FAMILIES},
    **{key + '-bg': 'status.' + key + 'Background' for key in STATUS_FAMILIES},
}
DARK_USAGE = {
    'surface.canvas': 'Main canvas',
    'surface.panel': 'Cards, sidebar, inputs and dialogs',
    'surface.raised': 'Raised containers; use text.secondary or brighter',
    'surface.hover': 'Hover or pressed fill; use text.primary or text.emphasis',
    'border.subtle': 'Decorative dividers; do not rely on this alone to identify a control',
    'border.strong': 'Essential control outlines on canvas, panel or raised surfaces; recheck other pairings',
    'text.primary': 'Primary readable text on all four neutral surfaces',
    'text.emphasis': 'Headings and strongest text emphasis',
    'text.secondary': 'Body-color role; normal-sized text on canvas, panel and raised surfaces',
    'text.muted': 'Muted readable text on canvas and panel; use a brighter grade on raised or hover surfaces',
    'text.disabled': 'Inactive or decorative text only; source comment-grade color is below the normal-text contrast target',
    'accent.primary': 'Primary identity: links on canvas/panel; filled primary controls with accent.ink labels',
    'accent.hover': 'Hover/active accent and links on raised surfaces',
    'accent.highlight': 'High emphasis, cursor and small highlight details; reserve sparingly',
    'accent.ink': 'Dark labels and icons on primary or hover accent fills',
    'accent.secondary': 'Secondary accent, also used for type names in the source syntax arrangement',
    'selection.background': 'Translucent accent selection, serialized to an 8-bit alpha of 80/255; composite over the current surface',
}
DARK_NOTES = [
    'Muted text stays on canvas/panel; on raised use text.secondary or brighter.',
    'On hover surfaces, use text.primary or text.emphasis.',
    'Reference/syntax comment grade5 preserves upstream assignment but does not reach 4.5:1; use fg7 if legibility is the priority.',
    'Semantic instructions are recommendations; shade changes require rechecking actual pairings.',
]
SYNTAX_REFS = {
    'identifier': 'fg[8]', 'keyword': 'fg[10]', 'operator': 'accent[10]',
    'string': 'accent[7]', 'literal': 'accent[9]', 'function': 'fg[9]',
    'comment': 'fg[5]', 'punctuation': 'fg[5]', 'member': 'coShades[7]',
    'namespace': 'coShades[9]', 'type': 'coAccent[8]',
    'builtInType': 'coAccent[9]', 'invalid': 'red[7]',
}


def css_name(value):
    return re.sub(r'([A-Z])', lambda match: '-' + match[1].lower(), value.replace('.', '-'))


def convert(lightness, chroma, hue):
    a = chroma * math.cos(math.radians(hue))
    b = chroma * math.sin(math.radians(hue))
    y = (lightness + 16) / 116
    x, z = a / 500 + y, y - b / 200

    def inverse_lab(t):
        return t ** 3 if t > 6 / 29 else 3 * (6 / 29) ** 2 * (t - 4 / 29)

    x, y, z = .95047 * inverse_lab(x), inverse_lab(y), 1.08883 * inverse_lab(z)
    linear = [3.2406*x - 1.5372*y - .4986*z,
              -.9689*x + 1.8758*y + .0415*z,
              .0557*x - .204*y + 1.057*z]
    rgb = [1.055 * t ** (1 / 2.4) - .055 if t > .0031308 else 12.92*t for t in linear]
    value = '#' + ''.join(f'{math.floor(max(0, min(1, t))*255 + .5):02X}' for t in rgb)
    return value, any(t < 0 or t > 1 for t in rgb)


def interpolate(value, fraction):
    return value[0] + fraction * (value[1] - value[0]) if isinstance(value, list) else value


def generate(parameters):
    ramps = {}
    for name, parameter in parameters.items():
        colors = []
        for grade in range(11):
            fraction = grade / 10
            lch = [interpolate(parameter['luma'], fraction ** parameter.get('power', 1)),
                   interpolate(parameter['chroma'], fraction),
                   interpolate(parameter['hue'], fraction)]
            value, clipped = convert(*lch)
            colors.append({'grade': grade, 'hex': value,
                           'lch': [round(channel, 9) for channel in lch], 'gamutClipped': clipped})
        ramps[name] = colors
    return ramps


def luminance(value):
    rgb = [int(value[index:index+2], 16) / 255 for index in (1, 3, 5)]
    return sum(weight * (x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4)
               for x, weight in zip(rgb, (.2126, .7152, .0722)))


def ratio(foreground, background):
    low, high = sorted((luminance(foreground), luminance(background)))
    return (high + .05) / (low + .05)


def resolve(primitives, reference):
    family, grade = re.fullmatch(r'(\w+)\[(\d+)\]', reference).groups()
    return primitives[family][int(grade)]


def passing_grade(primitives, family, start, backgrounds, minimum=4.5):
    """Keep the proposed grade unless a darker light-mode grade is required."""
    for grade in range(start, 11):
        if all(ratio(primitives[family][grade], background) >= minimum for background in backgrounds):
            return f'{family}[{grade}]'
    raise ValueError(f'No {family} grade from {start} passes {minimum}:1 against {backgrounds}')


def make_roles(primitives, template, mode):
    references = {name: role['sourceKey'] for name, role in template.items()}
    usage = dict(DARK_USAGE)
    if mode == 'light':
        backgrounds = [primitives['bg'][index] for index in range(4)]
        references['border.strong'] = passing_grade(primitives, 'fg', 6, backgrounds, 3)
        references['text.secondary'] = passing_grade(primitives, 'fg', 8, backgrounds[:3])
        references['text.muted'] = passing_grade(primitives, 'fg', 7, backgrounds[:2])
        # Link and button constraints must both hold for the same accent fill.
        references['accent.primary'] = passing_grade(primitives, 'accent', 7, backgrounds[:2] + [primitives['fg'][0]])
        primary_grade = int(re.search(r'\[(\d+)\]', references['accent.primary'])[1])
        references['accent.hover'] = passing_grade(primitives, 'accent', min(primary_grade + 1, 10), backgrounds[:3] + [primitives['fg'][0]])
        references['accent.secondary'] = passing_grade(primitives, 'coAccent', 8, backgrounds[:3])
        references['selection.background'] = references['accent.primary']
        for status, family in STATUS_FAMILIES.items():
            references['status.' + status + 'Background'] = f'{family}[1]'
            references['status.' + status] = passing_grade(primitives, family, 8, backgrounds[:3] + [primitives[family][1]])
        for name in references:
            if name.startswith('support.'):
                family = name.split('.')[1]
                references[name] = passing_grade(primitives, family, 8, backgrounds[:3])
        usage.update({
            'surface.raised': 'Raised containers; use text.secondary or darker',
            'border.strong': 'Essential control outlines on canvas, panel, raised and hover surfaces',
            'text.muted': 'Muted readable text on canvas and panel; use a darker grade on raised or hover surfaces',
            'accent.ink': 'Light labels and icons on primary or hover accent fills',
            'accent.secondary': 'Secondary accent; readable on canvas, panel and raised surfaces',
            'text.disabled': 'Inactive or decorative text only; not a normal-text role',
        })
    roles = {}
    for name, original in template.items():
        role = copy.deepcopy(original)
        value = resolve(primitives, references[name])
        role.update(sourceKey=references[name], value=value)
        if name in usage:
            role['usage'] = usage[name]
        if len(original['value']) == 9:
            role['value'] += original['value'][-2:]
            role['alpha'] = int(role['value'][-2:], 16) / 255
            role['sourceAlphaBeforeSerialization'] = 5 / 16
        else:
            role['contrastOnSurfaces'] = {
                surface: round(ratio(value, primitives['bg'][index]), 4)
                for index, surface in enumerate(SURFACES)
            }
        roles[name] = role
    return roles


def contrast_checks(values, mode):
    checks = []

    def check(name, foreground, background, minimum=4.5):
        actual = ratio(values[foreground], values[background])
        checks.append({'name': name, 'foreground': foreground, 'background': background,
                       'ratio': round(actual, 4), 'minimum': minimum, 'passes': actual >= minimum})

    for surface in SURFACES:
        check('Primary text on ' + surface, 'text.primary', 'surface.' + surface)
    for surface in SURFACES[:3]:
        check('Secondary text on ' + surface, 'text.secondary', 'surface.' + surface)
    for surface in SURFACES[:2]:
        check('Muted text on ' + surface, 'text.muted', 'surface.' + surface)
    for surface in SURFACES[:2]:
        check('Primary link on ' + surface, 'accent.primary', 'surface.' + surface)
    check('Link on raised', 'accent.hover', 'surface.raised')
    check('Primary button', 'accent.ink', 'accent.primary')
    check('Hover button', 'accent.ink', 'accent.hover')
    for status in STATUS_FAMILIES:
        check(status + ' badge', 'status.' + status, 'status.' + status + 'Background')
    for surface in (SURFACES if mode == 'light' else SURFACES[:3]):
        check('Essential border on ' + surface, 'border.strong', 'surface.' + surface, 3)
    if mode == 'light':
        for status in STATUS_FAMILIES:
            for surface in SURFACES[:3]:
                check(status + ' text on ' + surface, 'status.' + status, 'surface.' + surface)
        check('Companion on raised', 'accent.secondary', 'surface.raised')
    return checks


def make_variant(spec, mode, baseline, template):
    ident, name, upstream, hue, companion_hue = spec
    source_variant = upstream or 'dolch'
    if mode == 'light':
        source_variant = source_variant.replace('dolch', 'dolch-light', 1)
    parameters = copy.deepcopy(baseline['variants'][source_variant]['parameters'])
    if upstream is None:
        for family in ('fg', 'bg', 'coShades', 'accent'):
            parameters[family]['hue'] = hue
        parameters['coAccent']['hue'] = companion_hue
    ramps = generate(parameters)
    primitives = {family: [color['hex'] for color in colors] for family, colors in ramps.items()}
    if upstream:
        assert primitives == baseline['variants'][source_variant]['hexRamps'], source_variant
    roles = make_roles(primitives, template, mode)
    values = {name: role['value'] for name, role in roles.items()}
    checks = contrast_checks(values, mode)
    passing = all(check['passes'] for check in checks)
    if not passing:
        raise ValueError((ident, mode, [check for check in checks if not check['passes']]))
    syntax = {}
    for syntax_name, reference in SYNTAX_REFS.items():
        if mode == 'light':
            family, grade = re.fullmatch(r'(\w+)\[(\d+)\]', reference).groups()
            reference = passing_grade(primitives, family, int(grade), [values['surface.canvas']])
        syntax[syntax_name] = {'sourceKey': reference, 'value': resolve(primitives, reference)}
    notes = list(DARK_NOTES) if mode == 'dark' else [
        'Light primitives preserve the source lightness direction: higher grades are darker.',
        'Semantic aliases are Solai proposals, not upstream role assignments. Grades are selected against their actual paired surfaces.',
        'Muted text stays on canvas/panel; on raised use text.secondary or darker.',
        'Status backgrounds use grade1; matching status text is checked at 4.5:1 on its badge and canvas, panel and raised surfaces.',
        'Syntax roles are independently mapped for at least 4.5:1 on the canvas; recheck other surfaces.',
        'Selection uses serialized alpha 80/255; composite over the current surface before evaluating contrast.',
    ]
    return {
        'mode': mode, 'id': ident, 'name': name,
        'provenance': 'upstream' if upstream else 'proposed',
        'upstreamVariant': source_variant if upstream else None,
        'ringPolicy': 'exact upstream' if upstream else 'shared original Blue' + (' light' if mode == 'light' else '') + ' ring',
        'parameters': parameters, 'primitives': primitives, 'ramps': ramps,
        'roles': roles, 'roleValues': values, 'syntaxRoles': syntax,
        'contrastChecks': checks, 'allEssentialPairsPass': passing, 'notes': notes,
    }


def main():
    baseline = json.loads((ROOT / 'reference/all-generated-palettes.json').read_text())
    template = json.loads((ROOT / 'contrast-and-roles.json').read_text())['roles']
    result = {
        'schemaVersion': 2, 'name': 'Solai', 'source': baseline['provenance'],
        'generation': baseline['generation'], 'defaultFlavor': 'blue',
        'flavorOrder': [spec[0] for spec in SPECS], 'displayFlavorOrder': [spec[1] for spec in SPECS],
        'modeOrder': ['dark', 'light'], 'defaultMode': 'dark',
        'statusPolicy': 'Tide and Ember preserve their exact upstream dark/light rings. Independent Dusk, Viridian and Bloom studies share the original Blue ring for each mode; status hues never rotate with the accent.',
        'designNote': 'Tide/Ember primitives are source-exact Dolch/Dolch Alter in each mode. All semantic aliases are Solai proposals. Dusk/Viridian/Bloom are independent studies using the original per-mode generation parameters and their own accent hues, not official Dolch releases or extracted Madoromi palettes.',
        'flavors': {},
    }
    css = [
        '/* Generated by palette-source/build_flavors.py. Original Dolch primitives: Renzhi Li, MIT; other flavours and semantic UI roles are independent Solai studies. */',
        '/* Set data-flavor and data-mode on the same element. Higher light grades are darker. */',
    ]
    ui_css = ['/* Generated by palette-source/build_flavors.py; do not edit by hand. */']
    for spec in SPECS:
        ident, name = spec[:2]
        variants = {mode: make_variant(spec, mode, baseline, template) for mode in result['modeOrder']}
        result['flavors'][ident] = {'id': ident, 'name': name, 'modes': variants}
        for mode, variant in variants.items():
            selector = f'[data-flavor="{ident}"][data-mode="{mode}"]'
            css.append(selector + ' {')
            css.append(f'  color-scheme: {mode};')
            for family, colors in variant['primitives'].items():
                for grade, value in enumerate(colors):
                    css.append(f'  --solai-{css_name(family)}-{grade}: {value};')
            for role, value in variant['roleValues'].items():
                css.append(f'  --solai-{css_name(role)}: {value};')
            css.append('}')
            ui_css.extend([':root' + selector + ' {', f'  color-scheme: {mode};'])
            for key, role in UI_ROLES.items():
                ui_css.append(f'  --{key}: {variant["roleValues"][role]};')
            ui_css.append('}')
    # This is a migration/regeneration guard, not an input dependency: all dark
    # content above is independently reproduced from compact source parameters.
    live_path = PROJECT / 'public/assets/palettes.json'
    if live_path.exists():
        previous = json.loads(live_path.read_text())
        for ident in result['flavorOrder']:
            old = previous['flavors'][ident]
            old = old['modes']['dark'] if previous.get('schemaVersion') == 2 else old
            new = dict(result['flavors'][ident]['modes']['dark'])
            if 'mode' not in old:
                new.pop('mode')
            if new != old:
                changed = {key: {'old': old.get(key), 'new': new.get(key)}
                           for key in old.keys() | new.keys() if old.get(key) != new.get(key)}
                raise ValueError(f'Dark variant changed: {ident}: {json.dumps(changed)}')
    serialized = json.dumps(result, indent=2) + '\n'
    live_path.write_text(serialized)
    (PROJECT / 'public/downloads/flavor-studies.json').write_text(serialized)
    (PROJECT / 'public/downloads/flavors.css').write_text('\n'.join(css) + '\n')
    (PROJECT / 'src/styles/themes.css').write_text('\n'.join(ui_css) + '\n')
    for ident, flavor in result['flavors'].items():
        for mode, variant in flavor['modes'].items():
            selected = {role: variant['roles'][role]['sourceKey'] for role in
                        ('border.strong', 'accent.primary', 'accent.hover', 'accent.secondary',
                         'status.success', 'status.warning', 'status.danger', 'status.info')}
            print(f'{ident}/{mode}: {len(variant["contrastChecks"])} essential pairs pass; {selected}')


if __name__ == '__main__':
    main()
