(() => {
'use strict';
fetch('game25.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 25 base (${r.status})`); return r.text(); })
  .then(build25 => {
    if (!build25.includes('runtime25_bundle.js')) throw new Error('Build 26 patch missing: Build 25 runtime bundle');
    build25 = build25
      .replace(/runtime25_bundle\.js/g, 'runtime26_bundle.js')
      .replace(/Build 25 runtime/g, 'Build 26 runtime')
      .replace(/BUILD 25 RUNTIME ERROR/g, 'BUILD 26 RUNTIME ERROR')
      .replace(/BUILD 25 BOOTSTRAP ERROR/g, 'BUILD 26 BOOTSTRAP ERROR')
      .replace(/BUILD 25 LOAD ERROR/g, 'BUILD 26 LOAD ERROR');
    const blob = new Blob([build25], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 26 LOAD ERROR\n${err.message}`;
  });
})();
