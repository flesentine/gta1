(() => {
'use strict';
if(window.__gtaRuntime31Loaded)return;window.__gtaRuntime31Loaded=true;
const manifest=window.__runtime31Manifest;if(!manifest||!Array.isArray(manifest.modules))throw new Error('Build 31A runtime manifest unavailable');
function flatten31(name,source){let code=String(source||'').trim();const guard=code.match(/^if\s*\(\s*!window\.([A-Za-z_$][\w$]*)\s*\)\s*\{\s*/);if(!guard)return `\n// ---- ${name} ----\n${code}\n`;const flag=guard[1];code=code.slice(guard[0].length);code=code.replace(new RegExp(`^\\s*window\\.${flag}\\s*=\\s*true\\s*;\\s*`),'');const last=code.lastIndexOf('}');if(last<0||code.slice(last+1).trim()!=='')throw new Error(`Unable to flatten ${name}`);code=code.slice(0,last).trimEnd();return `\n// ---- ${name} ----\nwindow.${flag}=true;\n${code}\n`;}
Promise.all(manifest.modules.map(name=>fetch(name).then(r=>{if(!r.ok)throw new Error(`Unable to load ${name} (${r.status})`);return r.text().then(source=>({name,source}));}))).then(parts=>{
 const ri=parts.findIndex(p=>p.name==='bitmap31a_runtime.js');if(ri<0)throw new Error('Build 31A renderer missing');
 const before=parts.slice(0,ri).map(p=>flatten31(p.name,p.source)).join('\n');const renderer=flatten31(parts[ri].name,parts[ri].source);
 const source=`(async()=>{\n${before}\ntry{if(typeof window.__prepareBitmap31A==='function')await window.__prepareBitmap31A();}catch(err){console.error(err);window.__bitmap31aReady=false;window.__bitmap31aEnabled=false;const d=document.getElementById('detail');if(d)d.textContent=\`31A ASSET ERROR · VECTOR FALLBACK · ${'${'}err.message}\`;}\n${renderer}\n})();`;
 try{new Function(source);}catch(err){throw new Error(`Build 31A syntax check failed: ${err.message}`);}return eval(source);
}).catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=`BUILD 31A BUNDLE ERROR\n${err.message}`;throw err;});
})();
