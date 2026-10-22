"""Rebuild CSS and JSON exports from the included canonical primitives/roles; stdlib only."""
import json,re
from pathlib import Path
def css_name(s): return re.sub(r'([A-Z])',lambda m:'-'+m[1].lower(),s.replace('.', '-'))
root=Path(__file__).resolve().parent
p=json.loads((root/'palette.json').read_text())
license_text=json.loads((root/'reference'/'source-snapshot.json').read_text())['LICENSE']
roles=p['roles']; ramps=p['primitives']
lines=['/*! Dolch cross-application proposal. Original colors: MIT.\n\n'+license_text+'*/',':root {']
for family,colors in ramps.items():
    name=re.sub(r'([A-Z])',lambda m:'-'+m[1].lower(),family)
    for grade,color in enumerate(colors):lines.append(f'  --dolch-{name}-{grade}: {color};')
for name,role in roles.items():lines.append(f"  --dolch-{css_name(name)}: {role['value']};")
lines.append('}')
(root/'dolch.css').write_text('\n'.join(lines)+'\n')
(root/'terminal-proposal.json').write_text(json.dumps({'$comment':license_text,**p['terminalProposal']},indent=2)+'\n')
print('Wrote dolch.css and terminal-proposal.json')
