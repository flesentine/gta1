(() => {
'use strict';
Promise.all([
  fetch('game14.js').then(r => { if (!r.ok) throw new Error(`Unable to load Build 14 bootstrap (${r.status})`); return r.text(); }),
  fetch('../data/harbor_east.json').then(r => { if (!r.ok) throw new Error(`Unable to load Harbor East (${r.status})`); return r.json(); })
]).then(([build14, harbor]) => {
  window.__harbor18Data = harbor;
  if (!build14.includes('polish14_runtime.js')) throw new Error('Build 23 bootstrap missing: Build 14 runtime injection');
  build14 = build14
    .replace(/polish14_runtime\.js/g, 'runtime23_bundle.js')
    .replace(/Build 14 runtime/g, 'Build 23 runtime')
    .replace(/BUILD 14 RUNTIME ERROR/g, 'BUILD 23 RUNTIME ERROR')
    .replace(/BUILD 14 LOAD ERROR/g, 'BUILD 23 BOOTSTRAP ERROR');
  const blob = new Blob([build14], {type:'text/javascript'});
  const script = document.createElement('script');
  script.src = URL.createObjectURL(blob);
  script.onload = () => URL.revokeObjectURL(script.src);
  document.head.appendChild(script);
}).catch(err => {
  console.error(err);
  const detail = document.getElementById('detail');
  if (detail) detail.textContent = `BUILD 23 LOAD ERROR\n${err.message}`;
});
})();
