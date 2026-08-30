(() => {
'use strict';
fetch('game20.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 20 base (${r.status})`); return r.text(); })
  .then(build20 => {
    const needle = "then(()=>fetch('traffic20_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 20 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    const replacement = "then(()=>fetch('traffic20_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 20 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('traffic21_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 21 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    if (!build20.includes(needle)) throw new Error('Build 21 patch missing: Build 20 runtime chain');
    build20 = build20.replace(needle, replacement).replace('BUILD 20 RUNTIME ERROR','BUILD 21 RUNTIME ERROR');
    const blob = new Blob([build20], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 21 LOAD ERROR\n${err.message}`;
  });
})();
