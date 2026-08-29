(() => {
'use strict';
fetch('game18.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 18 base (${r.status})`); return r.text(); })
  .then(build18 => {
    const needle = "then(()=>fetch('sector18_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 18 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    const replacement = "then(()=>fetch('sector18_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 18 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('traffic19_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 19 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    if (!build18.includes(needle)) throw new Error('Build 19 patch missing: Build 18 runtime chain');
    build18 = build18.replace(needle, replacement).replace('BUILD 18 RUNTIME ERROR','BUILD 19 RUNTIME ERROR');
    const blob = new Blob([build18], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 19 LOAD ERROR\n${err.message}`;
  });
})();
