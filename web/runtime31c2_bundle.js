(() => {
'use strict';
if(window.__gtaRuntime31C2Loaded)return;
window.__gtaRuntime31C2Loaded=true;
const manifest=window.__runtime31C2Manifest;
if(!manifest||!Array.isArray(manifest.modules))throw new Error('Build 31C.2 fresh runtime manifest unavailable');
function flatten31(name,source){
  let code=String(source||'').trim();
  const guard=code.match(/^if\s*\(\s*!window\.([A-Za-z_$][\w$]*)\s*\)\s*\{\s*/);
  if(!guard)return `\n// ---- ${name} ----\n${code}\n`;
  const flag=guard[1];
  code=code.slice(guard[0].length);
  code=code.replace(new RegExp(`^\\s*window\\.${flag}\\s*=\\s*true\\s*;\\s*`),'');
  const last=code.lastIndexOf('}');
  if(last<0||code.slice(last+1).trim()!=='')throw new Error(`Unable to flatten ${name}`);
  code=code.slice(0,last).trimEnd();
  return `\n// ---- ${name} ----\nwindow.${flag}=true;\n${code}\n`;
}
Promise.all(manifest.modules.map(name=>fetch(`${name}?v=31c2fresh1`).then(r=>{
  if(!r.ok)throw new Error(`Unable to load ${name} (${r.status})`);
  return r.text().then(source=>({name,source}));
}))).then(parts=>{
  const source=`(()=>{\n${parts.map(p=>flatten31(p.name,p.source)).join('\n')}\n})();`;
  try{new Function(source);}catch(err){throw new Error(`Build 31C.2 syntax check failed: ${err.message}`);}
  return eval(source);
}).then(()=>{
  const runtimeDrawPed31C2=drawPed;
  drawPed=function(p){
    if(window.__ped31RenderBitmap&&window.__ped31RenderBitmap(p))return;
    return runtimeDrawPed31C2(p);
  };
  const runtimeDrawCar31C2=drawCar;
  drawCar=function(c){
    if(window.__car31RenderBitmap&&window.__car31RenderBitmap(c))return;
    return runtimeDrawCar31C2(c);
  };
  const title=document.querySelector('#hud .title span');
  if(title)title.textContent='BUILD 31C.2';
}).catch(err=>{
  console.error(err);
  const d=document.getElementById('detail');
  if(d)d.textContent=`BUILD 31C.2 RUNTIME ERROR\n${err.message}`;
  throw err;
});
})();
