(() => {
'use strict';
fetch('game14.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 14 base (${r.status})`); return r.text(); })
  .then(build14 => {
    const needle = "}).then(code=>eval(code)).catch(err=>{";
    if (!build14.includes(needle)) throw new Error('Build 15 patch missing: Build 14 runtime chain');
    const replacement = "}).then(code=>eval(code)).then(()=>fetch('mission15_runtime.js')).then(r=>{if(!r.ok)throw new Error(`Build 15 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{";
    build14 = build14.replace(needle, replacement).replace('BUILD 14 RUNTIME ERROR','BUILD 15 RUNTIME ERROR');
    const blob = new Blob([build14], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 15 LOAD ERROR\n${err.message}`;
  });
})();
