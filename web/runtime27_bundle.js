(() => {
'use strict';
const manifest=window.__runtime27Manifest;
if(!manifest||manifest.build!==27||!Array.isArray(manifest.modules)){
  const detail=document.getElementById('detail');
  if(detail)detail.textContent='BUILD 27 RUNTIME MANIFEST ERROR';
  return;
}
Promise.all(manifest.modules.map(name=>fetch(name).then(r=>{
  if(!r.ok)throw new Error(`${name} (${r.status})`);
  return r.text();
}))).then(codes=>{
  const source=codes.join('\n\n');
  try{new Function(source);}
  catch(err){throw new Error(`ordered Build 27 runtime syntax: ${err.message}`);}
  eval(source);
}).catch(err=>{
  console.error(err);
  const detail=document.getElementById('detail');
  if(detail)detail.textContent=`BUILD 27 RUNTIME BUNDLE ERROR\n${err.message}`;
});
})();
