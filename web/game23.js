(() => {
'use strict';
fetch('game22.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 22 base (${r.status})`); return r.text(); })
  .then(build22 => {
    const needle = "then(()=>fetch('traffic22_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 22 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    const replacement = "then(()=>fetch('traffic22_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 22 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('traffic23_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 23 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    if (!build22.includes(needle)) throw new Error('Build 23 patch missing: Build 22 runtime chain');
    build22 = build22.replace(needle, replacement).replace('BUILD 22 RUNTIME ERROR','BUILD 23 RUNTIME ERROR');
    const blob = new Blob([build22], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 23 LOAD ERROR\n${err.message}`;
  });
})();
