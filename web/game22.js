(() => {
'use strict';
fetch('game21.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 21 base (${r.status})`); return r.text(); })
  .then(build21 => {
    const needle = "then(()=>fetch('traffic21_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 21 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    const replacement = "then(()=>fetch('traffic21_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 21 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('traffic22_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 22 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    if (!build21.includes(needle)) throw new Error('Build 22 patch missing: Build 21 runtime chain');
    build21 = build21.replace(needle, replacement).replace('BUILD 21 RUNTIME ERROR','BUILD 22 RUNTIME ERROR');
    const blob = new Blob([build21], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 22 LOAD ERROR\n${err.message}`;
  });
})();
