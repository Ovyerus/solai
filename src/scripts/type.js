'use strict';
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const original=$$('[contenteditable]').map(e=>e.innerHTML);let palettes;let mode='dark';
const root=document.documentElement;
const modeButtons=$$('[data-mode-option]');
const roleKeys={bg:'surface.canvas',panel:'surface.panel',raised:'surface.raised',text:'text.primary',strong:'text.emphasis',muted:'text.muted',border:'border.subtle','control-border':'border.strong',accent:'accent.primary',ink:'accent.ink'};
root.dataset.mode=mode;
root.dataset.flavor='blue';
root.style.colorScheme=mode;
$('#palette').disabled=true;
modeButtons.forEach(button=>button.disabled=true);
function applyPalette(){
  const flavor=palettes.flavors[$('#palette').value];
  const variant=flavor.modes[mode];
  const roles=variant.roleValues;
  Object.entries(roleKeys).forEach(([key,role])=>root.style.setProperty('--'+key,roles[role]));
  root.dataset.mode=mode;
  root.dataset.flavor=flavor.id;
  root.style.colorScheme=mode;
  modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.modeOption===mode)));
  $('#code-name').textContent="'"+flavor.name+"'";
  $('#code-mode').textContent="'"+mode+"'";
  $('#code-bg').textContent="'"+roles['surface.canvas']+"'";
  $('#code-accent').textContent="'"+roles['accent.primary']+"'";
  $('#code-readable').textContent=String(variant.allEssentialPairsPass);
}
function choose(id){const name=id==='sora'?'Sora':'Space Grotesk';document.documentElement.style.setProperty('--font',`'${name}'`);$('#chosen-name').textContent=name;$$('[data-font]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.font===id)));}
$$('[data-font]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.font)));
$('#size').addEventListener('input',e=>{const value=e.target.value+'px';document.documentElement.style.setProperty('--size',value);$('#size-label').textContent=value});$('#weight').addEventListener('change',e=>document.documentElement.style.setProperty('--weight',e.target.value));
$('#palette').addEventListener('change',()=>{if(palettes)applyPalette()});
modeButtons.forEach(button=>button.addEventListener('click',()=>{if(!palettes)return;mode=button.dataset.modeOption;applyPalette()}));
$('#apply').addEventListener('click',()=>$('#demo-status').textContent='Applied to this page only');$('#reset').addEventListener('click',()=>{$$('[contenteditable]').forEach((e,i)=>e.innerHTML=original[i]);$('#workspace').value='Studio';$('.row input').checked=true;$('#demo-status').textContent='Sample text and controls reset'});
fetch('/assets/palettes.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{palettes=data;applyPalette();$('#palette').disabled=false;modeButtons.forEach(button=>button.disabled=false)}).catch(()=>{$('#demo-status').textContent='Palette data unavailable; dark Tide is shown'});
if(document.fonts){Promise.all([document.fonts.load('400 18px "Space Grotesk"'),document.fonts.load('400 18px Sora'),document.fonts.load('400 17px "Iosevka Solai"'),document.fonts.load('italic 400 17px "Iosevka Solai"')]).then(results=>{if(results.some(r=>r.length===0))throw Error();$('#font-status').textContent='All three fonts loaded'}).catch(()=>$('#font-status').textContent='A font failed to load — refresh before comparing')}else $('#font-status').textContent='Font loading could not be verified';
