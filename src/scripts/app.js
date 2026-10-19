import { announce, download, exportCSS } from './palette-shared.js';
import { initTheme } from './theme.js';
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const names={blue:'Tide',alter:'Ember',violet:'Dusk',green:'Viridian',rose:'Bloom'};
const hues={blue:'CYAN-BLUE',alter:'AMBER',violet:'VIOLET',green:'LEAF-GREEN',rose:'DUSTY ROSE'};
const descriptions={blue:'Cyan-blue, like harbour lights across dark water.',alter:'Warm amber—the greenhouse after sundown.',violet:'Violet settling over the last train home.',green:'Leaf-green against the city’s charcoal.',rose:'Rose light caught on concrete.'};
let data,flavour=document.documentElement.dataset.flavor||'blue',mode=document.documentElement.dataset.mode||'dark',effect='dither';const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const modeName=()=>mode==='light'?'Light':'Dark';
const currentPalette=()=>data.flavors[flavour].modes[mode];
function updateAnsi(){const p=currentPalette().primitives;const ansi=[p.fg[3],...['red','green','yellow','blue','magenta','cyan'].map(k=>p[k][7]),p.fg[8],p.fg[6],...['red','green','yellow','blue','magenta','cyan'].map(k=>p[k][9]),p.fg[10]];$('#ansi-swatches').replaceChildren(...ansi.map(hex=>{const e=document.createElement('span');e.style.background=hex;e.title=hex;return e}));}
function updateTheme(){
  const f=currentPalette(),r=f.roleValues;
  $$('.current-name').forEach(e=>e.textContent=names[flavour]);
  $$('.current-name-lower').forEach(e=>e.textContent=names[flavour].toLowerCase());
  $$('.current-mode').forEach(e=>e.textContent=modeName());
  $('.canvas-hex').textContent="'"+r['surface.canvas']+"'";
  $('.accent-hex').textContent="'"+r['accent.primary']+"'";
  $('#flavour-description').textContent=descriptions[flavour];
  $('#flavour-origin').textContent=f.upstreamVariant?'UPSTREAM PALETTE · PROPOSED UI ROLES':'NEW COLOUR STUDY';
  $$('.flavour-button').forEach(b=>{
    const active=b.dataset.flavour===flavour;
    const colors=data.flavors[b.dataset.flavour].modes[mode].roleValues;
    b.setAttribute('aria-pressed',String(active));
    b.querySelector('.check').textContent=active?'●':'';
    b.style.setProperty('--f-bg',colors['surface.canvas']);
    b.style.setProperty('--f-text',colors['text.secondary']);
    b.style.setProperty('--f-accent',colors['accent.primary']);
    const shades=[colors['surface.panel'],colors['surface.raised'],colors['text.secondary'],colors['accent.primary'],colors['accent.highlight']];
    [...b.querySelectorAll('.mini-ramp i')].forEach((bar,index)=>bar.style.background=shades[index]);
  });
  updateAnsi();
  renderArt();
}
function buildFlavours(){
  const parent=$('#flavour-list');
  data.flavorOrder.forEach((id,index)=>{
    const button=document.createElement('button');
    button.className='flavour-button';
    button.dataset.flavour=id;
    button.setAttribute('aria-pressed','false');
    button.innerHTML=`<span class="n">0${index+1} /</span><span class="check"></span><h3>${names[id]}</h3><small>${hues[id]}</small><div class="mini-ramp"></div>`;
    for(let grade=0;grade<5;grade++)button.querySelector('.mini-ramp').append(document.createElement('i'));
    button.addEventListener('click',()=>theme.selectFlavour(id));
    parent.append(button);
  });
}
function selectTab(name){$$('[data-tab]').forEach(b=>{const active=b.dataset.tab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});$$('[role=tabpanel]').forEach(p=>p.hidden=p.id!=='sample-'+name);$('#window-title').textContent={editor:'theme.ts',terminal:'~/studio',interface:'Preferences'}[name];$('#window-title').classList.toggle('technical-title',name!=='interface')}
$$('[data-tab]').forEach(b=>{b.addEventListener('click',()=>selectTab(b.dataset.tab));b.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const tabs=$$('[data-tab]');let i=tabs.indexOf(b);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].focus();selectTab(tabs[i].dataset.tab)})});selectTab('editor');
$('#save-demo').addEventListener('click',()=>announce('Preview saved'));
$('#reset-demo').addEventListener('click',()=>{
  $('#workspace-name').value='Studio';
  const toggles=$$('.setting-row input');
  toggles[0].checked=true;
  toggles[1].checked=false;
  announce('Preview reset');
});
$$('[data-download]').forEach(button=>button.addEventListener('click',()=>{
  if(!data)return;
  const type=button.dataset.download;
  const filename=`solai-${names[flavour].toLowerCase()}-${mode}`;
  if(type==='css')download(exportCSS(currentPalette(),names[flavour],mode),'text/css',`${filename}.css`);
  else if(type==='json')download(JSON.stringify({...currentPalette(),name:`Solai ${names[flavour]} ${modeName()}`,source:data.source},null,2),'application/json',`${filename}.json`);
  else download(JSON.stringify(data,null,2),'application/json','solai-palettes.json');
}));
// Original landscape → duotone, real ordered dithering, or luminance-mapped glyphs.
// Render only on changes; pointer work is one animation-frame update. No perpetual loop.
const art=$('#landscape'),ctx=art.getContext('2d'),sourceImage=new Image();let artReady=false,renderCache={},hoverPoint=null,raf=0;
const bayer=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
// A small, fixed skyline on the left shore; grayscale keeps every treatment in sync.
function drawSkyline(sc,w,h,shore){
  const height=Math.min(h*.31,w*.29),base=Math.round(shore-h*.018);
  const buildings=[[.052,.030,.53],[.090,.033,.79],[.132,.035,1],[.177,.028,.67],[.213,.025,.43]];
  sc.save();
  buildings.forEach(([left,width,tall],i)=>{
    const x=Math.round(w*left),bw=Math.round(w*width),bh=Math.round(height*tall),top=base-bh;
    const cap=Math.max(3,Math.round(bh*.08)),inset=Math.max(3,Math.round(bw*.22));
    const face=sc.createLinearGradient(0,top,0,base);face.addColorStop(0,'#292929');face.addColorStop(1,'#373737');
    sc.fillStyle=face;sc.fillRect(x,top+cap,bw,bh-cap);sc.fillRect(x+inset,top,bw-inset*2,cap);
    sc.fillStyle='#414141';sc.fillRect(x+bw-3,top+cap,3,bh-cap);
    if(i===2){sc.fillStyle='#424242';sc.fillRect(x+Math.floor(bw/2),top-Math.round(height*.09),2,Math.round(height*.09));}
    const gap=Math.max(7,Math.round(height*.055)),windowWidth=Math.max(2,Math.round(bw*.10));
    for(let y=top+cap+7,row=0;y<base-8;y+=gap,row++)for(let col=0,wx=x+5;wx<x+bw-4;wx+=7,col++){
      if((row+col+i)%4===0)continue;
      sc.fillStyle=(row+i)%3===0?'#a0a0a0':'#797979';sc.fillRect(wx,y,windowWidth,2);
    }
  });
  sc.restore();
}
function renderArt(){if(!artReady||!data||!ctx)return;const w=900,h=Math.round(w/(art.clientWidth/art.clientHeight||2.33));art.width=w;art.height=h;const scratch=canvas(w,h),sc=scratch.getContext('2d',{willReadFrequently:true});const scale=Math.max(w/sourceImage.width,h/sourceImage.height);sc.drawImage(sourceImage,(w-sourceImage.width*scale)/2,(h-sourceImage.height*scale)/2,sourceImage.width*scale,sourceImage.height*scale);drawSkyline(sc,w,h,(h-sourceImage.height*scale)/2+sourceImage.height*scale*.604);const pixels=sc.getImageData(0,0,w,h);const f=currentPalette(),low=rgb(f.roleValues['surface.canvas']),high=rgb(f.primitives.accent[8]);const lum=new Float32Array(w*h);for(let i=0;i<lum.length;i++)lum[i]=(pixels.data[i*4]*.2126+pixels.data[i*4+1]*.7152+pixels.data[i*4+2]*.0722)/255;
renderCache={};for(const treatment of ['soft','dither']){const c=canvas(w,h),cctx=c.getContext('2d'),output=cctx.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;let t=Math.max(0,Math.min(1,(lum[i]-.08)*1.1));if(mode==='light')t=1-t;if(treatment==='dither')t=t>(bayer[(y%8)*8+x%8]+.5)/64?1:0;for(let k=0;k<3;k++)output.data[i*4+k]=low[k]+(high[k]-low[k])*t;output.data[i*4+3]=255}cctx.putImageData(output,0,0);renderCache[treatment]=c}
const ascii=canvas(w,h),ac=ascii.getContext('2d');ac.fillStyle=f.roleValues['surface.canvas'];ac.fillRect(0,0,w,h);ac.fillStyle=f.primitives.accent[8];ac.font='10px "Iosevka Solai", monospace';ac.textBaseline='top';const chars=' .,:;i1tfLCG08@';const cw=6,ch=11;for(let y=0;y<h;y+=ch)for(let x=0;x<w;x+=cw){let sum=0,count=0;for(let dy=0;dy<ch&&y+dy<h;dy+=3)for(let dx=0;dx<cw&&x+dx<w;dx+=2){sum+=lum[(y+dy)*w+x+dx];count++}let value=sum/Math.max(1,count);if(mode==='light')value=1-value;ac.fillText(chars[Math.min(chars.length-1,Math.floor(value*chars.length))],x,y)}renderCache.ascii=ascii;paintArt();}
function paintArt(){if(!ctx||!renderCache[effect])return;ctx.drawImage(renderCache[effect],0,0);if(hoverPoint&&!reduced.matches&&effect!=='ascii'){ctx.save();ctx.beginPath();ctx.arc(hoverPoint.x*art.width,hoverPoint.y*art.height,Math.max(75,art.width*.13),0,Math.PI*2);ctx.clip();ctx.drawImage(renderCache.ascii,0,0);ctx.restore()}}
sourceImage.onload=()=>{artReady=true;renderArt()};sourceImage.onerror=()=>{art.style.display='none'};sourceImage.src='/assets/landscape.png';
$$('[data-effect]').forEach(b=>b.addEventListener('click',()=>{effect=b.dataset.effect;hoverPoint=null;$$('[data-effect]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});paintArt()}));art.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;const r=art.getBoundingClientRect();hoverPoint={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};if(!raf)raf=requestAnimationFrame(()=>{raf=0;paintArt()})});art.addEventListener('pointerleave',()=>{hoverPoint=null;paintArt()});let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(renderArt,150)});reduced.addEventListener('change',()=>{hoverPoint=null;paintArt()});
const theme=initTheme({
  onChange(state){
    const firstLoad=!data;
    data=state.data;
    flavour=state.flavour;
    mode=state.mode;
    if(firstLoad)buildFlavours();
    updateTheme();
  },
  onError(){
    announce('Palette data could not load. Please refresh.');
    $('#flavour-description').textContent='Palette data unavailable. Please refresh.';
  }
});

if(document.fonts){document.fonts.load('400 10px \"Iosevka Solai\"').then(()=>renderArt()).catch(()=>{});}
