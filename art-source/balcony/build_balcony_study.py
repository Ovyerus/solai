"""Recreate the editable balcony SVG; Python standard library only.
Paths adapted for this standalone source package.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import math, random, re, hashlib, json

ROOT=Path(__file__).resolve().parent
SVG='http://www.w3.org/2000/svg'
INK='http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('', SVG)
ET.register_namespace('inkscape', INK)
source=ROOT/'solai-scene-greyscale.svg'
source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
root=ET.fromstring(source.read_bytes())
def q(tag): return '{'+SVG+'}'+tag
def el(tag,parent=None,**attrs):
    n=ET.Element(q(tag),{k.replace('_','-'):str(v) for k,v in attrs.items()})
    if parent is not None: parent.append(n)
    return n
def group(parent,ident,name,**attrs):
    n=el('g',parent,id=ident,data_name=name,**attrs)
    n.set('{'+INK+'}label',name)
    return n
def fmt(x): return f'{x:.2f}'.rstrip('0').rstrip('.')
def path(parent,ident,d,fill,**attrs): return el('path',parent,id=ident,d=d,fill=fill,**attrs)
def line(parent,ident,x1,y1,x2,y2,c,w=1,**attrs):
    return el('path',parent,id=ident,d=f'M {fmt(x1)} {fmt(y1)} L {fmt(x2)} {fmt(y2)}',fill='none',stroke=c,stroke_width=w,**attrs)
def grad(ident,x1,y1,x2,y2,stops):
    g=el('linearGradient',defs,id=ident,gradientUnits='userSpaceOnUse',x1=x1,y1=y1,x2=x2,y2=y2)
    for t,c in stops:el('stop',g,offset=t,stop_color=c)
    return 'url(#'+ident+')'

defs=root.find(q('defs'))
scene=root.find(q('g'))
scene.set('id','Solai-Balcony-Study')
scene.set('data-name','Solai · High-rise balcony study')
root.find(q('title')).text='Solai · Greyscale high-rise balcony study'
root.find(q('desc')).text='Editable vector concept: an open planted balcony in a compact vertical neighborhood looks across a lake to mountains and a ridge-top wind farm. A neighboring residential tower is cropped at the left edge, with individual stacked terraces and planting. The original sky, sun, mountains, water and reflections are retained unchanged. Named groups separate the wind turbines, tower, balcony floor, transparent railing and individual plants. Pure grayscale; no images, fonts, filters, external resources or symbol instances.'
for n in list(scene):
    if n.get('id')=='06-skyscrapers':scene.remove(n)
for n in list(defs):
    if (n.get('id') or '').startswith('building-'):defs.remove(n)

# Ridge-top wind farm, between the original distant and middle ridge layers.
mountains=scene.find(".//*[@id='03-mountains']")
wind=group(None,'06-ridge-wind-farm','06 Ridge wind farm · 6 editable turbines')
mountains.insert(1,wind)
for i,(x,base,h,r,angle) in enumerate([(1275,309,35,17,-20),(1327,292,39,19,5),(1380,267,42,20,24),(1436,241,40,19,7),(1492,247,36,18,-25),(1542,267,32,16,11)],1):
    hub=base-h
    g=group(wind,f'wind-turbine-{i:02}',f'Turbine {i:02} · tower, hub and three blades')
    path(g,f'turbine-{i:02}-mast',f'M {fmt(x-1.35)} {base} L {fmt(x-.65)} {fmt(hub)} L {fmt(x+.65)} {fmt(hub)} L {fmt(x+1.35)} {base} Z','#666666')
    rotor=group(g,f'turbine-{i:02}-rotor','Rotor · independently editable blades')
    for b in range(3):
        theta=math.radians(angle+120*b-90)
        ux,uy=math.cos(theta),math.sin(theta)
        vx,vy=-uy,ux
        pts=[(x+ux*1.1+vx*.65,hub+uy*1.1+vy*.65),(x+ux*r+vx*.2,hub+uy*r+vy*.2),(x+ux*(r-.8)-vx*.5,hub+uy*(r-.8)-vy*.5),(x+ux*5-vx*1.25,hub+uy*5-vy*1.25),(x+ux*1.1-vx*.65,hub+uy*1.1-vy*.65)]
        path(rotor,f'turbine-{i:02}-blade-{b+1}','M '+' L '.join(f'{fmt(a)} {fmt(c)}' for a,c in pts)+' Z','#606060')
    el('ellipse',g,id=f'turbine-{i:02}-nacelle',cx=x,cy=hub,rx=2.1,ry=1.4,fill='#656565')
    el('circle',g,id=f'turbine-{i:02}-hub',cx=x,cy=hub,r=1.35,fill='#858585')

# Plants are real paths, never raster or reused symbol instances.
rng=random.Random(56)
def leaf(parent,ident,x,y,length,width,angle,color):
    a=math.radians(angle);u=(math.cos(a),math.sin(a));v=(-u[1],u[0])
    def p(t,s):return f'{fmt(x+u[0]*t+v[0]*s)} {fmt(y+u[1]*t+v[1]*s)}'
    d=f'M {p(0,0)} Q {p(length*.44,width)} {p(length,0)} Q {p(length*.53,-width*.73)} {p(0,0)} Z'
    path(parent,ident,d,color)
def shrub(parent,ident,x,y,w,h,tone='#3a3a3a'):
    g=group(parent,ident,ident.replace('-',' ').title())
    # Tapered woody stems with distinct lanceolate leaf paths.
    for b in range(5):
        bx=x+(b-2)*w*.16;tx=bx+rng.uniform(-w*.15,w*.15);ty=y-h*rng.uniform(.52,1)
        path(g,f'{ident}-stem-{b+1}',f'M {fmt(x+(bx-x)*.55)} {fmt(y)} Q {fmt(bx)} {fmt(y-h*.35)} {fmt(tx)} {fmt(ty)}','none',stroke=tone,stroke_width=1.25,stroke_linecap='round')
        for k in range(4):
            t=.28+.19*k;cx=bx+(tx-bx)*t;cy=y+(ty-y)*t
            for side in [-1,1]:
                leaf(g,f'{ident}-leaf-{b+1}-{k+1}-{side+1}',cx,cy,w*rng.uniform(.13,.22),w*.067,-90+side*rng.uniform(35,75),tone)
    return g

def grasses(parent,ident,x,y,w,h,tone):
    g=group(parent,ident,ident.replace('-',' ').title())
    for j in range(13):
        tx=x+rng.uniform(-w/2,w/2);ty=y-rng.uniform(.45,1)*h
        path(g,f'{ident}-blade-{j+1:02}',f'M {fmt(x+rng.uniform(-w*.12,w*.12))} {fmt(y)} Q {fmt(x+(tx-x)*.16)} {fmt(y-h*.55)} {fmt(tx)} {fmt(ty)} Q {fmt(x+(tx-x)*.3)} {fmt(y-h*.38)} {fmt(x+rng.uniform(-w*.07,w*.07))} {fmt(y)} Z',tone)
    return g

# A cropped neighbor: concrete floor plates, deeply recessed homes and planted terraces.
tower=group(scene,'07-neighboring-residential-tower','07 Neighboring high-rise · stacked planted terraces')
core=group(tower,'tower-recessed-facade','Recessed facade · editable glazing and columns')
path(core,'tower-main-body','M -30 -80 H 151 V 760 H -30 Z',grad('tower-body-gradient',0,0,152,0,[(0,'#393939'),(1,'#515151')]))
path(core,'tower-side-body','M 151 -80 L 205 -98 V 760 H 151 Z','#3b3b3b')
for j,x in enumerate([6,49,92,136]):
    el('rect',core,id=f'tower-mullion-{j+1}',x=x,y=-40,width=2.4,height=800,fill='#272727')
# Every floor has separate geometry and can be edited/removed as a group.
for i,y in enumerate([-25,73,171,269,367,465,563,661,759],1):
    g=group(tower,f'tower-terrace-{i:02}',f'Terrace {i:02} · slab, home, railing and plants')
    if y>=73:
        # Glazing has low contrast to avoid a city-grid feel.
        path(g,f'terrace-{i:02}-glazing',f'M 7 {y-89} H 133 V {y-17} H 7 Z','#535353',opacity='.4')
        line(g,f'terrace-{i:02}-transom',7,y-58,133,y-58,'#353535',1.3)
        for j,x in enumerate([7,49,91,133]):line(g,f'terrace-{i:02}-window-{j+1}',x,y-89,x,y-16,'#303030',2)
        path(g,f'terrace-{i:02}-side-glass',f'M 155 {y-88} L 201 {y-99} V {y-30} L 155 {y-18} Z','#4d4d4d')
        line(g,f'terrace-{i:02}-door',177,y-92,177,y-23,'#292929',2)
    # Floor plate projects 35px beyond the recessed facade.
    path(g,f'terrace-{i:02}-slab-top',f'M -24 {y-7} L 157 {y-7} L 236 {y-25} L 236 {y-14} L 157 {y+4} H -24 Z','#777777')
    path(g,f'terrace-{i:02}-slab-front',f'M -24 {y+4} H 157 V {y+12} H -24 Z','#4a4a4a')
    path(g,f'terrace-{i:02}-slab-side',f'M 157 {y+4} L 236 {y-14} V {y-6} L 157 {y+12} Z','#555555')
    line(g,f'terrace-{i:02}-edge-light',-24,y+4,157,y+4,'#888888',1)
    line(g,f'terrace-{i:02}-side-light',157,y+4,236,y-14,'#929292',1)
    # Low planters on alternating portions of each balcony.
    plants=group(g,f'terrace-{i:02}-plants','Terrace planting')
    if i%2:
        shrub(plants,f'terrace-{i:02}-shrub',35,y-15,48,31,'#303030')
        grasses(plants,f'terrace-{i:02}-grass',106,y-14,44,34,'#373737')
        path(plants,f'terrace-{i:02}-planter',f'M 10 {y-16} H 126 V {y-5} H 10 Z','#606060')
    else:
        shrub(plants,f'terrace-{i:02}-shrub',96,y-14,51,36,'#303030')
        path(plants,f'terrace-{i:02}-planter',f'M 59 {y-17} H 131 V {y-5} H 59 Z','#626262')
    shrub(plants,f'terrace-{i:02}-side-shrub',211,y-23,31,31 if i%2 else 46,'#303030')
    path(plants,f'terrace-{i:02}-side-planter',f'M 190 {y-26} L 230 {y-35} V {y-20} L 190 {y-11} Z','#606060')
    rail=group(g,f'terrace-{i:02}-railing','Terrace railing')
    path(rail,f'terrace-{i:02}-glass-front',f'M -20 {y-39} H 157 V {y+1} H -20 Z','#b8b8b8',opacity='.07')
    path(rail,f'terrace-{i:02}-glass-side',f'M 157 {y-39} L 236 {y-57} V {y-18} L 157 {y+1} Z','#b8b8b8',opacity='.08')
    line(rail,f'terrace-{i:02}-handrail-front',-20,y-39,157,y-39,'#939393',1.3)
    line(rail,f'terrace-{i:02}-handrail-side',157,y-39,236,y-57,'#949494',1.3)
    for j,x in enumerate([5,81,157]):line(rail,f'terrace-{i:02}-front-post-{j}',x,y-39,x,y+1,'#747474',1.1)
    line(rail,f'terrace-{i:02}-end-post',236,y-57,236,y-18,'#828282',1.1)
    line(rail,f'terrace-{i:02}-side-post',197,y-48,197,y-8,'#797979',1)

# Open foreground balcony: slender glass railing and small strip of floor.
balcony=group(scene,'08-viewpoint-balcony','08 Viewpoint balcony · floor and slender glass railing')
floor=group(balcony,'balcony-floor','Balcony floor · shallow foreground strip')
path(floor,'balcony-floor-surface','M -20 649 H 1620 V 750 H -20 Z',grad('balcony-floor-gradient',0,649,0,740,[(0,'#626262'),(1,'#414141')]))
line(floor,'balcony-floor-edge',0,649,1600,649,'#858585',1.4)
# Wide paving joints use perspective toward the natural vanishing line.
for i,(a,b) in enumerate([(345,208),(715,674),(1090,1147),(1445,1595)],1):
    line(floor,f'balcony-floor-joint-{i}',a,650,b,720,'#464646',1,opacity='.5')
line(floor,'balcony-floor-cross-joint',0,693,1600,693,'#414141',1,opacity='.4')
rail=group(balcony,'balcony-transparent-railing','Transparent balcony railing · panels, top rail and posts')
for i,(a,b) in enumerate([(0,340),(340,655),(655,970),(970,1285),(1285,1600)],1):
    el('rect',rail,id=f'balcony-glass-panel-{i}',x=a+3,y=568,width=b-a-6,height=78,fill='#e5e5e5',opacity='.045')
    line(rail,f'balcony-glass-edge-{i}',b-3,570,b-3,646,'#cccccc',.65,opacity='.25')
line(rail,'balcony-railing-top-shadow',0,568,1600,568,'#323232',3)
line(rail,'balcony-railing-top',0,565.5,1600,565.5,'#525252',3.4)
line(rail,'balcony-railing-top-highlight',0,564.1,1600,564.1,'#aaaaaa',.8)
line(rail,'balcony-railing-bottom',0,648,1600,648,'#414141',2.2)
for i,x in enumerate([24,340,655,970,1285,1592],1):
    line(rail,f'balcony-railing-post-{i}',x,566,x,651,'#434343',3.2)
    line(rail,f'balcony-railing-post-highlight-{i}',x-.8,568,x-.8,648,'#878787',.75)
    el('rect',rail,id=f'balcony-railing-foot-{i}',x=x-5,y=650,width=10,height=2,fill='#3c3c3c')

# Foreground planting is kept at the corners, leaving lake and mountains open.
plants=group(scene,'09-balcony-planting','09 Balcony planting · individually editable plants and planters')
left=group(plants,'balcony-left-planter','Left balcony planter · grasses and low shrubs')
shrub(left,'balcony-left-shrub-1',65,641,112,86,'#303030')
shrub(left,'balcony-left-shrub-2',185,641,100,77,'#383838')
grasses(left,'balcony-left-tall-grass',263,640,91,117,'#353535')
grasses(left,'balcony-left-low-grass',119,642,71,71,'#414141')
path(left,'balcony-left-planter-top','M -20 637 H 300 L 319 647 H -20 Z','#7a7a7a')
path(left,'balcony-left-planter-body','M -20 647 H 319 V 707 H -20 Z',grad('foreground-planter-gradient',0,647,0,707,[(0,'#545454'),(1,'#414141')]))
line(left,'balcony-left-planter-lip',0,647,319,647,'#929292',1.3)
# Slender multi-stem balcony tree, cropped at the opposite edge.
right=group(plants,'balcony-right-tree','Right balcony tree · trunks, branches, leaves and pot')
trunks=group(right,'balcony-tree-trunks','Tree trunks and branches')
path(trunks,'balcony-tree-main-trunk','M 1519 675 C 1515 616 1530 563 1515 510 C 1511 494 1496 478 1494 454','none',stroke='#363636',stroke_width=4.3,stroke_linecap='round')
path(trunks,'balcony-tree-left-branch','M 1520 594 C 1508 569 1481 541 1456 527 C 1433 515 1418 492 1408 478','none',stroke='#3a3a3a',stroke_width=2.7,stroke_linecap='round')
path(trunks,'balcony-tree-right-branch','M 1522 558 C 1530 540 1545 521 1567 505 C 1583 494 1591 472 1594 452','none',stroke='#373737',stroke_width=2.6,stroke_linecap='round')
path(trunks,'balcony-tree-upper-branch','M 1518 518 C 1531 498 1537 479 1538 456','none',stroke='#3a3a3a',stroke_width=2.1,stroke_linecap='round')
# Airy botanical clusters rather than a solid hedge.
for i,(x,y,ang,s) in enumerate([(1494,461,-108,1),(1501,481,-148,.9),(1514,502,-50,.8),(1408,483,-130,1),(1430,509,-156,.9),(1456,528,-55,.9),(1481,550,-160,.8),(1592,460,-65,1),(1580,486,-145,1),(1565,507,-14,1),(1544,526,-46,.8),(1538,461,-104,.85),(1533,480,-24,.9)],1):
    g=group(right,f'balcony-tree-foliage-{i:02}',f'Foliage cluster {i:02}')
    for k in range(5):
        a=ang+(k-2)*29
        leaf(g,f'tree-leaf-{i:02}-{k+1}',x+rng.uniform(-4,4),y+rng.uniform(-4,4),rng.uniform(19,30)*s,rng.uniform(6,10)*s,a,['#343434','#414141','#4c4c4c'][k%3])
path(right,'balcony-tree-planter-rim','M 1480 657 Q 1521 646 1562 657 L 1558 666 Q 1521 674 1484 666 Z','#808080')
path(right,'balcony-tree-planter-soil','M 1486 657 Q 1521 650 1557 657 Q 1521 664 1486 657 Z','#303030')
path(right,'balcony-tree-planter-body','M 1482 663 Q 1521 674 1560 663 L 1550 720 H 1491 Z',grad('tree-planter-gradient',1482,670,1560,670,[(0,'#555555'),(.5,'#666666'),(1,'#454545')]))

# Name the original layers for conventional vector editors as well.
for n in root.iter(q('g')):
    if n.get('data-name') and not n.get('{'+INK+'}label'):
        n.set('{'+INK+'}label',n.get('data-name'))
for n in scene:
    if n.tag==q('g'):n.set('{'+INK+'}groupmode','layer')
ET.indent(root,space='  ')
out=ROOT/'solai-balcony-study.svg'
out.write_text('<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding='unicode')+'\n')
assert source_hash==hashlib.sha256(source.read_bytes()).hexdigest(),'Original was altered'
print(out, out.stat().st_size)
