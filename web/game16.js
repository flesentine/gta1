(() => {
'use strict';
fetch('game15.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 15 base (${r.status})`); return r.text(); })
  .then(build15 => {
    const needle = "then(()=>fetch('mission15_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 15 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    const replacement = "then(()=>fetch('mission15_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 15 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('city16_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 16 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    if (!build15.includes(needle)) throw new Error('Build 16 patch missing: Build 15 runtime chain');
    build15 = build15.replace(needle, replacement).replace('BUILD 15 RUNTIME ERROR','BUILD 16 RUNTIME ERROR');
    const blob = new Blob([build15], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 16 LOAD ERROR\n${err.message}`;
  });
})();
