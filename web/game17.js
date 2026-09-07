(() => {
'use strict';
fetch('game16.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 16 base (${r.status})`); return r.text(); })
  .then(build16 => {
    const needle = "then(()=>fetch('city16_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 16 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    const replacement = "then(()=>fetch('city16_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 16 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).then(()=>fetch('branch17_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 17 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    if (!build16.includes(needle)) throw new Error('Build 17 patch missing: Build 16 runtime chain');
    build16 = build16.replace(needle, replacement).replace('BUILD 16 RUNTIME ERROR','BUILD 17 RUNTIME ERROR');
    const blob = new Blob([build16], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 17 LOAD ERROR\n${err.message}`;
  });
})();
