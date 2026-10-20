import { announce, download, exportCSS, exportTailwindCSS } from './palette-shared.js';
import { initTheme } from './theme.js';
import { createHeroArt } from './hero-art.js';
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const names={blue:'Tide',alter:'Ember',violet:'Dusk',green:'Viridian',rose:'Bloom'};
const hues={blue:'CYAN-BLUE',alter:'AMBER',violet:'VIOLET',green:'LEAF-GREEN',rose:'DUSTY ROSE'};
const descriptions={blue:'Cyan-blue, like harbour lights across dark water.',alter:'Warm amber—the greenhouse after sundown.',violet:'Violet settling over the last train home.',green:'Leaf-green against the city’s charcoal.',rose:'Rose light caught on concrete.'};
let data,flavour=document.documentElement.dataset.flavor||'blue',mode=document.documentElement.dataset.mode||'dark';
const modeName=()=>mode==='light'?'Light':'Dark';
const currentPalette=()=>data.flavors[flavour].modes[mode];
function updateAnsi(){const p=currentPalette().primitives;const ansi=[p.fg[3],...['red','green','yellow','blue','magenta','cyan'].map(k=>p[k][7]),p.fg[8],p.fg[6],...['red','green','yellow','blue','magenta','cyan'].map(k=>p[k][9]),p.fg[10]];$('#ansi-swatches').replaceChildren(...ansi.map(hex=>{const e=document.createElement('span');e.className='h-[20px] flex-1';e.style.background=hex;e.title=hex;return e}));}
function updateTheme(){
  const f=currentPalette(),r=f.roleValues;
  $$('.current-name').forEach(e=>e.textContent=names[flavour]);
  $$('.current-name-lower').forEach(e=>e.textContent=names[flavour].toLowerCase());
  $$('.current-mode').forEach(e=>e.textContent=modeName());
  $('.canvas-hex').textContent="'"+r['surface.canvas']+"'";
  $('.accent-hex').textContent="'"+r['accent.primary']+"'";
  $('#flavour-description').textContent=descriptions[flavour];
  $('#flavour-origin').textContent=f.customUpstreamVariant?'ADAPTED PALETTE · PROPOSED UI ROLES':f.upstreamVariant?'UPSTREAM PALETTE · PROPOSED UI ROLES':'NEW COLOUR STUDY';
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
  heroArt.setTheme({ background: r['surface.canvas'], ink: r['accent.primary'], mode });
}
function buildFlavours(){
  const parent=$('#flavour-list');
  data.flavorOrder.forEach((id,index)=>{
    const button=document.createElement('button');
    button.className='flavour-button relative min-h-[190px] rounded-[2px] border-0 border-b-[3px] border-transparent bg-[var(--f-bg)] px-[20px] py-[23px] text-left text-[var(--f-text)] aria-pressed:border-[var(--f-accent)] aria-pressed:bg-[color-mix(in_srgb,var(--f-accent)_12%,var(--f-bg))] hover:border-[var(--f-accent)] [@media(max-width:1000px)]:px-[13px] [@media(max-width:1000px)]:py-[20px] [@media(max-width:650px)]:min-h-[145px] [@media(max-width:650px)]:p-[16px] [@media(max-width:650px)]:last:col-span-full [@media(max-width:650px)]:last:min-h-[120px] [@media(max-width:650px)]:last:[&_.mini-ramp]:max-w-[200px]';
    button.dataset.flavour=id;
    button.setAttribute('aria-pressed','false');
    button.innerHTML=`<span class="n font-mono text-[12px]">0${index+1} /</span><span class="check absolute top-[18px] right-[16px] text-[12px] text-[var(--f-accent)]"></span><h3 class="mt-[23px] mb-0 text-[25px] font-medium tracking-[-1px] text-[var(--f-accent)] [@media(max-width:1000px)]:text-[22px] [@media(max-width:650px)]:mt-[12px] [@media(max-width:650px)]:text-[24px]">${names[id]}</h3><small class="font-mono text-[12px]">${hues[id]}</small><div class="mini-ramp mt-[22px] flex h-[14px] gap-[3px] [@media(max-width:650px)]:mt-[15px] [@media(max-width:650px)]:h-[11px]"></div>`;
    for(let grade=0;grade<5;grade++){const bar=document.createElement('i');bar.className='flex-1 rounded-[2px]';button.querySelector('.mini-ramp').append(bar);}
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
  else if(type==='tailwind')download(exportTailwindCSS(currentPalette(),names[flavour],mode),'text/css',`${filename}.tailwind.css`);
  else if(type==='json')download(JSON.stringify({...currentPalette(),name:`Solai ${names[flavour]} ${modeName()}`,source:data.source},null,2),'application/json',`${filename}.json`);
  else download(JSON.stringify(data,null,2),'application/json','solai-palettes.json');
}));
const heroArt = createHeroArt($('#hero-canvas'));
// The artwork remains usable if palette JSON is unavailable; CSS already has the active tokens.
const initialColours = getComputedStyle(document.documentElement);
heroArt.setTheme({
  background: initialColours.getPropertyValue('--canvas').trim(),
  ink: initialColours.getPropertyValue('--accent').trim(),
  mode,
});
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
