(() => {
'use strict';
Promise.all([
  fetch('game17.js').then(r => {
    if (!r.ok) throw new Error(`Unable to load Build 17 base (${r.status})`);
    return r.text();
  }),
  fetch('../data/harbor_east.json').then(r => {
    if (!r.ok) throw new Error(`Unable to load Harbor East (${r.status})`);
    return r.json();
  })
]).then(([build17, harbor]) => {
  window.__harbor18Data = harbor;
  const needle = "then(()=>fetch('branch17_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 17 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
  const replacement = "then(()=>fetch('branch17_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 17 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('sector18_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 18 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
  if (!build17.includes(needle)) throw new Error('Build 18 patch missing: Build 17 runtime chain');
  build17 = build17.replace(needle, replacement).replace('BUILD 17 RUNTIME ERROR','BUILD 18 RUNTIME ERROR');
  const blob = new Blob([build17], {type:'text/javascript'});
  const script = document.createElement('script');
  script.src = URL.createObjectURL(blob);
  script.onload = () => URL.revokeObjectURL(script.src);
  document.head.appendChild(script);
}).catch(err => {
  console.error(err);
  const detail = document.getElementById('detail');
  if (detail) detail.textContent = `BUILD 18 LOAD ERROR\n${err.message}`;
});
})();
