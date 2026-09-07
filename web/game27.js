(() => {
'use strict';
Promise.all([
  fetch('game14.js').then(r=>{if(!r.ok)throw new Error(`Unable to load stable browser core (${r.status})`);return r.text();}),
  fetch('../data/harbor_east.json').then(r=>{if(!r.ok)throw new Error(`Unable to load Harbor East (${r.status})`);return r.json();}),
  fetch('../data/west_ridge.json').then(r=>{if(!r.ok)throw new Error(`Unable to load West Ridge (${r.status})`);return r.json();}),
  fetch('runtime27_manifest.json').then(r=>{if(!r.ok)throw new Error(`Unable to load Build 27 manifest (${r.status})`);return r.json();})
]).then(([core,harbor,west,manifest])=>{
  window.__harbor18Data=harbor;
  window.__west25Data=west;
  window.__runtime27Manifest=manifest;
  if(!core.includes('polish14_runtime.js'))throw new Error('Stable browser core runtime injection point missing');
  core=core
    .replace(/polish14_runtime\.js/g,'runtime27_bundle.js')
    .replace(/Build 14 runtime/g,'Build 27 runtime')
    .replace(/BUILD 14 RUNTIME ERROR/g,'BUILD 27 RUNTIME ERROR')
    .replace(/BUILD 14 LOAD ERROR/g,'BUILD 27 CORE ERROR');
  const blob=new Blob([core],{type:'text/javascript'});
  const script=document.createElement('script');
  script.src=URL.createObjectURL(blob);
  script.onload=()=>URL.revokeObjectURL(script.src);
  document.head.appendChild(script);
}).catch(err=>{
  console.error(err);
  const detail=document.getElementById('detail');
  if(detail)detail.textContent=`BUILD 27 LOAD ERROR\n${err.message}`;
});
})();