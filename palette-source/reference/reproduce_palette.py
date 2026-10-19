"""Independent arithmetic reproduction after inspecting Dolch source; no repo code is executed."""
import json, math, pathlib, re
ROOT=pathlib.Path(__file__).resolve().parent
SHA='cf3817311b30d3c21a60ebb0b250d18386e66a30'
source=json.loads((ROOT/'source-snapshot.json').read_text())
ring_names=['red','orange','yellow','chartreuse','green','spring','cyan','azure','blue','violet','magenta','rose']
def convert(L,C,H):
    a=C*math.cos(math.radians(H)); b=C*math.sin(math.radians(H))
    y=(L+16)/116; x=a/500+y; z=y-b/200
    f=lambda t:t**3 if t>6/29 else 3*(6/29)**2*(t-4/29)
    x,y,z=.95047*f(x),f(y),1.08883*f(z)
    linear=[3.2406*x-1.5372*y-.4986*z,-.9689*x+1.8758*y+.0415*z,.0557*x-.204*y+1.057*z]
    srgb=[1.055*t**(1/2.4)-.055 if t>.0031308 else 12.92*t for t in linear]
    vals=[math.floor(min(1,max(0,t))*255+.5) for t in srgb]
    return '#'+''.join(f'{t:02X}' for t in vals),any(t<0 or t>1 for t in srgb)
def interp(v,t):
    return v[0]+(v[1]-v[0])*t if isinstance(v,list) else v
def ramp(g):
    out=[]
    for n in range(11):
        t=n/10
        L=interp(g['luma'],t**g.get('power',1)); C=interp(g['chroma'],t); H=interp(g['hue'],t)
        hx,clip=convert(L,C,H)
        out.append(dict(grade=n,hex=hx,lch=[round(L,9),round(C,9),round(H,9)],gamutClipped=clip))
    return out
def props(light=False,alter=False):
    hue=60 if alter else 240
    fg=dict(luma=[92,10] if light else [6,90],chroma=2,hue=hue,power=1)
    bg={**fg,**(dict(luma=[95,10],power=1.25) if light else {})}
    accent={**fg,'luma':[92,30] if light else [6,90],'chroma':([45,80] if alter else [15,42]) if light else ([75,45] if alter else [42,36]),'hue':77 if alter else 227}
    coaccent={**accent,'hue':45 if alter else 195}
    common={**fg,**accent,'chroma':[32,56]}
    angle=30 if alter else 32
    p=dict(fg=fg,bg=bg,coShades={**fg,'chroma':16},accent=accent,coAccent=coaccent)
    p.update({name:{**common,'hue':angle+30*i} for i,name in enumerate(ring_names)})
    return p
def luminance(h):
    vals=[int(h[n:n+2],16)/255 for n in (1,3,5)]
    v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in vals]
    return sum(a*b for a,b in zip(v,[.2126,.7152,.0722]))
def contrast(a,b):
    ls=sorted([luminance(a),luminance(b)])
    return (ls[1]+.05)/(ls[0]+.05)

result={
  'provenance':{'repository':'https://github.com/be5invis/vscode-theme-dolch','commit':SHA,'commitDate':'2023-11-26T06:17:36Z','extensionVersion':'0.4.0','license':'MIT','copyright':'Copyright 2017-2021 Renzhi Li (a.k.a Belleve Invis)','method':'Independent calculation from inspected source parameters and D65 CIELAB conversion; repository code was not executed'},
  'generation':{'colorSpace':'CIE LCh(ab), D65 whitepoint (not CSS lch D50 or OKLCH)','grades':[0,1,2,3,4,5,6,7,8,9,10],'lightnessInterpolation':'L0 + (L1-L0)*(grade/10)^power','chromaInterpolation':'C0+(C1-C0)*grade/10','hueInterpolation':'H0+(H1-H0)*grade/10 degrees','conversion':'LCh to Lab to D65 XYZ to sRGB, clip channels to [0,1], round to nearest 8-bit value','ringAngleFunction':'(angle % 30)+30, then hue + 30*k for k=0..11','note':'The source names luma, but the quantity is CIE Lab L*, not relative luminance. Grade direction is reversed for light variants; absGrade(g) returns 10-g there.'},
  'variants':{}
}
all_references={}
for light,alter in [(False,False),(True,False),(False,True),(True,True)]:
    name='dolch'+('-light' if light else '')+('-alter' if alter else '')
    p=props(light,alter); ramps={k:ramp(v) for k,v in p.items()}
    actual=json.loads(source['themes/'+name+'.json'])
    refs={}
    for family,colors in ramps.items():
        for c in colors: refs.setdefault(c['hex'],[]).append(f'{family}[{c["grade"]}]')
    used=set(v[:7] for v in actual['colors'].values())|set(t['settings']['foreground'] for t in actual['tokenColors'] if 'foreground' in t['settings'])
    unmatched=sorted(used-set(refs)-{'#000000'})
    assert not unmatched,(name,unmatched)
    mapping={k:{'hex':v,'paletteCandidates':refs.get(v[:7],[])} for k,v in actual['colors'].items()}
    tokenmapping=[{**t,'paletteCandidates':refs.get(t['settings'].get('foreground'),[])} for t in actual['tokenColors']]
    bg=actual['colors']['editor.background']
    contrastReport={k:round(contrast(actual['colors'][k],bg),4) for k in ['editor.foreground','editorLineNumber.foreground','textLink.foreground','editorError.foreground','editorWarning.foreground','editorInfo.foreground']}
    contrastReport['originalButtonTextOnButton']=round(contrast(actual['colors']['button.foreground'],actual['colors']['button.background']),4)
    result['variants'][name]={'parameters':p,'ramps':ramps,'hexRamps':{k:[c['hex'] for c in a] for k,a in ramps.items()},'bracketFamilies':['yellow','green','cyan','blue','magenta','red'] if alter else ['azure','spring','chartreuse','orange','rose','violet'],'publishedThemeColors':mapping,'publishedTokenColors':tokenmapping,'verification':{'publishedUniqueRgbColors':len(used),'allPublishedColorsMatched':True,'unmatched':unmatched},'contrastOnMainBackground':contrastReport}
    (ROOT/(name+'-published.json')).write_text(json.dumps(actual,indent=2)+'\n')
(ROOT/'dolch-palette.json').write_text(json.dumps(result,indent=2)+'\n')
(ROOT/'LICENSE-Dolch.txt').write_text(source['LICENSE'])
print(json.dumps({k:{'ramps':v['hexRamps'],'verification':v['verification'],'contrast':v['contrastOnMainBackground']} for k,v in result['variants'].items()},indent=2))
