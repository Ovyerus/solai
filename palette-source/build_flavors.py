"""Reproduce upstream Blue/Alter and generate three unofficial dark flavor studies.
No upstream executable code or third-party libraries are run.
"""
import copy,json,math,pathlib,re
def css_name(s): return re.sub(r'([A-Z])',lambda m:'-'+m[1].lower(),s.replace('.', '-'))
ROOT=pathlib.Path(__file__).resolve().parent
baseline=json.loads((ROOT/'reference/all-generated-palettes.json').read_text())
role_template=json.loads((ROOT/'contrast-and-roles.json').read_text())['roles']
def convert(L,C,H):
    a=C*math.cos(math.radians(H));b=C*math.sin(math.radians(H))
    y=(L+16)/116;x=a/500+y;z=y-b/200
    f=lambda t:t**3 if t>6/29 else 3*(6/29)**2*(t-4/29)
    x,y,z=.95047*f(x),f(y),1.08883*f(z)
    lin=[3.2406*x-1.5372*y-.4986*z,-.9689*x+1.8758*y+.0415*z,.0557*x-.204*y+1.057*z]
    rgb=[1.055*t**(1/2.4)-.055 if t>.0031308 else 12.92*t for t in lin]
    return '#'+''.join(f'{math.floor(max(0,min(1,t))*255+.5):02X}' for t in rgb),any(t<0 or t>1 for t in rgb)
def mix(v,t):return v[0]+t*(v[1]-v[0]) if isinstance(v,list) else v
def generate(parameters):
    out={}
    for name,p in parameters.items():
        colors=[]
        for i in range(11):
            t=i/10;L=mix(p['luma'],t**p.get('power',1));C=mix(p['chroma'],t);H=mix(p['hue'],t)
            hx,clip=convert(L,C,H)
            colors.append({'grade':i,'hex':hx,'lch':[round(L,9),round(C,9),round(H,9)],'gamutClipped':clip})
        out[name]=colors
    return out
def luminance(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return sum(w*(x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4) for x,w in zip(c,[.2126,.7152,.0722]))
def ratio(a,b):
    lo,hi=sorted([luminance(a),luminance(b)])
    return (hi+.05)/(lo+.05)
def make_roles(hexes):
    out={}
    usage={
        'surface.canvas':'Main canvas',
        'surface.panel':'Cards, sidebar, inputs and dialogs',
        'surface.raised':'Raised containers; use text.secondary or brighter',
        'surface.hover':'Hover or pressed fill; use text.primary or text.emphasis',
        'border.subtle':'Decorative dividers; do not rely on this alone to identify a control',
        'border.strong':'Essential control outlines on canvas, panel or raised surfaces; recheck other pairings',
        'text.primary':'Primary readable text on all four neutral surfaces',
        'text.emphasis':'Headings and strongest text emphasis',
        'text.secondary':'Body-color role; normal-sized text on canvas, panel and raised surfaces',
        'text.muted':'Muted readable text on canvas and panel; use a brighter grade on raised or hover surfaces',
        'text.disabled':'Inactive or decorative text only; source comment-grade color is below the normal-text contrast target',
        'accent.primary':'Primary identity: links on canvas/panel; filled primary controls with accent.ink labels',
        'accent.hover':'Hover/active accent and links on raised surfaces',
        'accent.highlight':'High emphasis, cursor and small highlight details; reserve sparingly',
        'accent.ink':'Dark labels and icons on primary or hover accent fills',
        'accent.secondary':'Secondary accent, also used for type names in the source syntax arrangement',
        'selection.background':'Translucent accent selection, serialized to an 8-bit alpha of 80/255; composite over the current surface'
    }
    for name,t in role_template.items():
        v=copy.deepcopy(t);m=re.fullmatch(r'(\w+)\[(\d+)\]',t['sourceKey']);value=hexes[m[1]][int(m[2])]
        if len(t['value'])==9:
            value+=t['value'][-2:]
            v['alpha']=int(value[-2:],16)/255
            v['sourceAlphaBeforeSerialization']=5/16
        v['value']=value
        if name in usage:v['usage']=usage[name]
        if len(value)==7:v['contrastOnSurfaces']={s:round(ratio(value,hexes['bg'][i]),4) for s,i in [('canvas',0),('panel',1),('raised',2),('hover',3)]}
        out[name]=v
    return out
base=baseline['variants']['dolch']
specs=[('blue','Blue','upstream','dolch',None,None),('alter','Alter','upstream','dolch-alter',None,None),('violet','Violet','proposed',None,300,332),('green','Green','proposed',None,150,182),('rose','Rose','proposed',None,0,32)]
result={'name':'Dolch dark flavor studies','source':baseline['provenance'],'generation':baseline['generation'],'defaultFlavor':'blue','flavorOrder':[s[0] for s in specs],'statusPolicy':'Blue and Alter preserve their exact upstream ring. Proposed Violet, Green and Rose use the original Blue ring unchanged, so success, warning, error and info never rotate with the accent.','designNote':'Blue/Alter primitives are upstream. Semantic role aliases are new in all flavors. Violet/Green/Rose are unofficial exploratory studies, not official Dolch releases or extracted Madoromi palettes.','flavors':{}}
css=['/* Dolch flavor studies. Load after dolch.css; apply data-dolch-flavor to the root element. */','/* Blue and Alter primitives are upstream. Violet, Green and Rose are unofficial studies. */']
for ident,label,kind,upstream,hue,cohue in specs:
    params=copy.deepcopy(baseline['variants'][upstream]['parameters'] if upstream else base['parameters'])
    if upstream is None:
        for k in ['fg','bg','coShades']:params[k]['hue']=hue
        params['accent']['hue']=hue;params['coAccent']['hue']=cohue
    ramps=generate(params);primitives={k:[v['hex'] for v in arr] for k,arr in ramps.items()}
    if upstream:assert primitives==baseline['variants'][upstream]['hexRamps']
    roles=make_roles(primitives);values={k:v['value'] for k,v in roles.items()}
    checks=[]
    def check(label,fg,bg,minimum=4.5):
        r=ratio(values[fg],values[bg]);checks.append({'name':label,'foreground':fg,'background':bg,'ratio':round(r,4),'minimum':minimum,'passes':r>=minimum})
    for s in ['canvas','panel','raised','hover']:check('Primary text on '+s,'text.primary','surface.'+s)
    for s in ['canvas','panel','raised']:check('Secondary text on '+s,'text.secondary','surface.'+s)
    for s in ['canvas','panel']:check('Muted text on '+s,'text.muted','surface.'+s)
    for s in ['canvas','panel']:check('Primary link on '+s,'accent.primary','surface.'+s)
    check('Link on raised','accent.hover','surface.raised')
    check('Primary button','accent.ink','accent.primary');check('Hover button','accent.ink','accent.hover')
    for state in ['success','warning','danger','info']:check(state+' badge','status.'+state,'status.'+state+'Background')
    for s in ['canvas','panel','raised']:check('Essential border on '+s,'border.strong','surface.'+s,3)
    assert all(c['passes'] for c in checks),(ident,checks)
    syntax_refs={'identifier':'fg[8]','keyword':'fg[10]','operator':'accent[10]','string':'accent[7]','literal':'accent[9]','function':'fg[9]','comment':'fg[5]','punctuation':'fg[5]','member':'coShades[7]','namespace':'coShades[9]','type':'coAccent[8]','builtInType':'coAccent[9]','invalid':'red[7]'}
    syntax={}
    for k,ref in syntax_refs.items():
        m=re.fullmatch(r'(\w+)\[(\d+)\]',ref);syntax[k]={'sourceKey':ref,'value':primitives[m[1]][int(m[2])]}
    result['flavors'][ident]={'id':ident,'name':label,'provenance':kind,'upstreamVariant':upstream,'ringPolicy':'exact upstream' if upstream else 'shared original Blue ring','parameters':params,'primitives':primitives,'ramps':ramps,'roles':roles,'roleValues':values,'syntaxRoles':syntax,'contrastChecks':checks,'allEssentialPairsPass':True,'notes':['Muted text stays on canvas/panel; on raised use text.secondary or brighter.','On hover surfaces, use text.primary or text.emphasis.','Reference/syntax comment grade5 preserves upstream assignment but does not reach 4.5:1; use fg7 if legibility is the priority.','Semantic instructions are recommendations; shade changes require rechecking actual pairings.']}
    css.append(f'[data-dolch-flavor="{ident}"] {{')
    for family,arr in primitives.items():
        for n,c in enumerate(arr):css.append(f'  --dolch-{css_name(family)}-{n}: {c};')
    for k,v in values.items():css.append(f'  --dolch-{css_name(k)}: {v};')
    css.append('}')
(ROOT/'flavor-studies.json').write_text(json.dumps(result,indent=2)+'\n')
(ROOT/'flavors.css').write_text('\n'.join(css)+'\n')
print(json.dumps({k:{'source':v['provenance'],'canvas':v['roleValues']['surface.canvas'],'accent':v['roleValues']['accent.primary'],'coAccent':v['roleValues']['accent.secondary'],'essentialChecks':len(v['contrastChecks']),'pass':v['allEssentialPairsPass']} for k,v in result['flavors'].items()},indent=2))
