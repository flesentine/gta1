(() => {
'use strict';
if(window.__gtaRuntime28Loaded)return;
window.__gtaRuntime28Loaded=true;

const manifest=window.__runtime28Manifest;
if(!manifest||!Array.isArray(manifest.modules))throw new Error('Build 28 runtime manifest unavailable');

function flattenModule28(name,source){
  let code=String(source||'').trim();
  const guard=code.match(/^if\s*\(\s*!window\.([A-Za-z_$][\w$]*)\s*\)\s*\{\s*/);
  if(!guard)return `\n// ---- ${name} ----\n${code}\n`;
  const flag=guard[1];
  code=code.slice(guard[0].length);
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
  const source=parts.map(p=>flattenModule28(p.name,p.source)).join('\n');
  try{new Function(source);}catch(err){throw new Error(`Flattened runtime syntax check failed: ${err.message}`);}
  (0,eval)(`void 0`);
  eval(source);
}).catch(err=>{
  console.error(err);
  const detail=document.getElementById('detail');
  if(detail)detail.textContent=`BUILD 28 BUNDLE ERROR\n${err.message}`;
  throw err;
});
})();
