"""Original deterministic procedural landscape for Solai.
No stock imagery, generated models, or externally sourced textures.
Run: python generate_landscape.py [output.png]
"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1000
rng = np.random.default_rng(8240)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
y, x = yy / H, xx / W

def noise(nx, ny, seed):
    r = np.random.default_rng(seed)
    src = Image.fromarray((r.random((ny, nx)) * 255).astype('uint8'))
    return np.asarray(src.resize((W, H), Image.Resampling.BICUBIC), dtype=np.float32) / 255.0 - .5

# Air: a soft, luminous haze builds toward the center of the valley.
air = 120 + 64*y + 27*np.exp(-((x-.61)/.53)**2-((y-.48)/.3)**2)
air += noise(12, 9, 1)*10 + noise(38, 24, 2)*3
# Long cirrus veils, defined continuously rather than with pasted textures.
for cy, cx, width, amp in [(.15,.20,.36,8),(.27,.72,.53,9),(.34,.2,.61,9),(.44,.68,.5,14)]:
    bend = cy + .014*np.sin(x*12+cy*21) + .009*np.sin(x*23)
    air += amp*np.exp(-((y-bend)/.023)**2)*np.exp(-((x-cx)/width)**2)
# Oversized celestial disk and subtle diffusion halo.
sx, sy, sr = 1015., 245., 100.
d = np.sqrt((xx-sx)**2+(yy-sy)**2)
air += 15*np.exp(-(d/205)**2)
alpha = np.clip((sr+1-d)/2, 0, 1)
air = air*(1-alpha) + (231 + 7*(1-(yy-sy+sr)/(sr*2)))*alpha

# Irregular, calm long ridge lines with small natural erosion details.
def ridge(points, jitter, seed):
    X = np.arange(W)
    px, py = zip(*points)
    base = np.interp(X, np.array(px)*W, np.array(py)*H)
    r = np.random.default_rng(seed)
    detail = np.zeros(W)
    for count, amp in [(12,jitter),(42,jitter*.36),(130,jitter*.11)]:
        detail += np.interp(X,np.linspace(0,W-1,count),r.normal(0,amp,count))
    return base+detail

def add_ridge(base, points, tone, jitter, seed, mist):
    top = ridge(points,jitter,seed)
    alpha = np.clip((yy-top[None,:])/.9,0,1)
    depth = np.maximum(0,yy-top[None,:])
    tone_map = tone + mist*(1-np.exp(-depth/125))
    tone_map += noise(48,23,seed+20)*2
    return base*(1-alpha)+tone_map*alpha

# All forms converge at a bright, distant valley near the horizon.
scene = air.copy()
scene = add_ridge(scene,[(0,.49),(.13,.40),(.24,.45),(.38,.29),(.45,.35),(.53,.42),(.63,.38),(.75,.47),(.91,.37),(1,.43)],136,10,30,28)
scene = add_ridge(scene,[(0,.45),(.08,.39),(.19,.46),(.29,.44),(.36,.40),(.48,.53),(.6,.48),(.71,.53),(.81,.46),(.9,.48),(1,.40)],110,8,40,33)
scene = add_ridge(scene,[(0,.32),(.08,.36),(.14,.40),(.24,.45),(.29,.49),(.42,.53),(.48,.57),(.58,.58),(.7,.56),(.8,.49),(.89,.43),(1,.42)],77,8,50,42)
scene = add_ridge(scene,[(0,.47),(.1,.47),(.18,.51),(.28,.56),(.35,.59),(.48,.61),(.6,.61),(.73,.59),(.85,.55),(.94,.49),(1,.46)],49,4,60,34)

horizon = 603
# The lake reflects the whole scene through horizontal, rippled sampling.
water_y = np.maximum(yy-horizon,0)
depth = water_y/(H-horizon)
reflect_y = np.clip(horizon-water_y*.78,0,horizon).astype(int)
warped_x = np.clip(xx+np.sin(water_y*.22 + noise(20,80,90)*2)* (1.3+depth*7) + np.sin(water_y*.053)*depth*13,0,W-1).astype(int)
reflection = scene[reflect_y,warped_x]
water = reflection*.57 + 48 + depth*5
water += np.sin(yy*.23+np.sin(xx*.008)*.9)*(1+depth*4)
water += noise(8,150,94)*(4+depth*10)
# Broad luminous path that quietly points back to the sun.
water += 17*np.exp(-((xx-sx)/(55+water_y*.36))**2)*(1-depth*.8)
scene = np.where(yy>horizon, water, scene)
# Low fog and thin shining waterline.
scene += 26*np.exp(-((yy-horizon)/24)**2)*np.exp(-((x-.54)/.5)**2)
scene += 7*np.exp(-((yy-(horizon+9))/.9)**2)

# Discrete flattened glints break the reflected layers into water.
img = Image.fromarray(np.uint8(np.clip(scene,0,255)), 'L')
draw = ImageDraw.Draw(img)
for _ in range(430):
    gy = int(rng.uniform(horizon+17,H))
    dep = (gy-horizon)/(H-horizon)
    gx = int(rng.uniform(0,W))
    length = int(rng.uniform(5,28)*(0.5+dep*2.5))
    tone = int(scene[gy,gx]+rng.uniform(-8,10))
    draw.line((gx,gy,min(gx+length,W),gy),fill=max(0,min(255,tone)),width=1)
# A tiny, quiet near-shore silhouette anchors the lower left.
shore = [(0,895),(86,915),(134,938),(209,953),(294,968),(403,987),(460,1000),(0,1000)]
draw.polygon(shore,fill=35)
# Grain at sub-visible amplitude avoids plastic smoothness without baked dithering.
final = np.asarray(img,dtype=np.float32)+rng.normal(0,.6,(H,W))
final = np.uint8(np.clip(final,0,255))
output = Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).with_name('landscape.png')
Image.fromarray(final,'L').convert('RGB').save(output,optimize=True)
print(f'{output}: {W} × {H}, grayscale RGB, tonal range {final.min()}–{final.max()}')
