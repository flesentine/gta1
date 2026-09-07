(() => {
'use strict';
fetch('game19.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 19 base (${r.status})`); return r.text(); })
  .then(build19 => {
    const needle = "then(()=>fetch('traffic19_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 19 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    const replacement = "then(()=>fetch('traffic19_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 19 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('traffic20_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 20 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    if (!build19.includes(needle)) throw new Error('Build 20 patch missing: Build 19 runtime chain');
    build19 = build19.replace(needle, replacement).replace('BUILD 19 RUNTIME ERROR','BUILD 20 RUNTIME ERROR');
    const blob = new Blob([build19], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 20 LOAD ERROR\n${err.message}`;
  });
})();
