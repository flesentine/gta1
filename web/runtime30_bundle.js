(() => {
'use strict';
if(window.__gtaRuntime30Loaded)return;
window.__gtaRuntime30Loaded=true;
const manifest=window.__runtime30Manifest;
if(!manifest||!Array.isArray(manifest.modules))throw new Error('Build 30 runtime manifest unavailable');
function flattenModule30(name,source){
  let code=String(source||'').trim();
  const guard=code.match(/^if\s*\(\s*!window\.([A-Za-z_$][\w$]*)\s*\)\s*\{\s*/);
  if(!guard)return `\n// ---- ${name} ----\n${code}\n`;
  const flag=guard[1];code=code.slice(guard[0].length);
  code=code.replace(new RegExp(`^\\s*window\\.${flag}\\s*=\\s*true\\s*;\\s*`),'');
  const last=code.lastIndexOf('}');
  if(last<0||code.slice(last+1).trim()!=='')throw new Error(`Unable to flatten guarded runtime ${name}`);
  code=code.slice(0,last).trimEnd();
  return `\n// ---- ${name} ----\nwindow.${flag}=true;\n${code}\n`;
}
Promise.all(manifest.modules.map(name=>fetch(name).then(r=>{
  if(!r.ok)throw new Error(`Unable to load ${name} (${r.status})`);
  return r.text().then(source=>({name,source}));
}))).then(parts=>{
  const rendererIndex=parts.findIndex(p=>p.name==='bitmap30_runtime.js');
  if(rendererIndex<0)throw new Error('Build 30 bitmap renderer missing from manifest');
  const before=parts.slice(0,rendererIndex).map(p=>flattenModule30(p.name,p.source)).join('\n');
  const renderer=flattenModule30(parts[rendererIndex].name,parts[rendererIndex].source);
  const after=parts.slice(rendererIndex+1).map(p=>flattenModule30(p.name,p.source)).join('\n');
  const source=`(async()=>{\n${before}\nif(typeof window.__prepareBitmap30==='function'){try{await window.__prepareBitmap30();}catch(err){console.warn('Build 30 bitmap preparation failed; using procedural fallback',err);window.__bitmap30DecodeError=String(err&&err.message||err);}}\n${renderer}\n${after}\n})();`;
  try{new Function(source);}catch(err){throw new Error(`Flattened runtime syntax check failed: ${err.message}`);}
  return eval(source);
}).catch(err=>{
  console.error(err);const detail=document.getElementById('detail');if(detail)detail.textContent=`BUILD 30 BUNDLE ERROR\n${err.message}`;throw err;
});
})();
