(() => {
'use strict';
fetch('game23.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 23 base (${r.status})`); return r.text(); })
  .then(build23 => {
    if (!build23.includes('runtime23_bundle.js')) throw new Error('Build 24 patch missing: Build 23 runtime bundle');
    build23 = build23
      .replace(/runtime23_bundle\.js/g, 'runtime24_bundle.js')
      .replace(/Build 23 runtime/g, 'Build 24 runtime')
      .replace(/BUILD 23 RUNTIME ERROR/g, 'BUILD 24 RUNTIME ERROR')
      .replace(/BUILD 23 BOOTSTRAP ERROR/g, 'BUILD 24 BOOTSTRAP ERROR')
      .replace(/BUILD 23 LOAD ERROR/g, 'BUILD 24 LOAD ERROR');
    const blob = new Blob([build23], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 24 LOAD ERROR\n${err.message}`;
  });
})();
