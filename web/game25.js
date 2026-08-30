(() => {
'use strict';
Promise.all([
  fetch('game24.js').then(r => { if (!r.ok) throw new Error(`Unable to load Build 24 base (${r.status})`); return r.text(); }),
  fetch('../data/west_ridge.json').then(r => { if (!r.ok) throw new Error(`Unable to load West Ridge (${r.status})`); return r.json(); })
]).then(([build24, west]) => {
  window.__west25Data = west;
  if (!build24.includes('runtime24_bundle.js')) throw new Error('Build 25 patch missing: Build 24 runtime bundle');
  build24 = build24
    .replace(/runtime24_bundle\.js/g, 'runtime25_bundle.js')
    .replace(/Build 24 runtime/g, 'Build 25 runtime')
    .replace(/BUILD 24 RUNTIME ERROR/g, 'BUILD 25 RUNTIME ERROR')
    .replace(/BUILD 24 BOOTSTRAP ERROR/g, 'BUILD 25 BOOTSTRAP ERROR')
    .replace(/BUILD 24 LOAD ERROR/g, 'BUILD 25 LOAD ERROR');
  const blob = new Blob([build24], {type:'text/javascript'});
  const script = document.createElement('script');
  script.src = URL.createObjectURL(blob);
  script.onload = () => URL.revokeObjectURL(script.src);
  document.head.appendChild(script);
}).catch(err => {
  console.error(err);
  const detail = document.getElementById('detail');
  if (detail) detail.textContent = `BUILD 25 LOAD ERROR\n${err.message}`;
});
})();
