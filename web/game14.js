(() => {
'use strict';
fetch('game13.js')
  .then(r => { if (!r.ok) throw new Error(`Unable to load Build 13 base (${r.status})`); return r.text(); })
  .then(build13 => {
    const marker14b12 = "    const blob = new Blob([build12], {type:'text/javascript'});";
    if (!build13.includes(marker14b12)) throw new Error('Build 14 patch missing: Build 13 injection point');
    const build14Into13 = "    const marker14b11 = \"    const blob = new Blob([build11], {type:'text/javascript'});\";\n    if (!build12.includes(marker14b11)) throw new Error('Build 14 patch missing: Build 12 injection point');\n    const build14Into12 = \"    const marker14b10 = \\\"    const blob = new Blob([build10], {type:'text/javascript'});\\\";\\n    if (!build11.includes(marker14b10)) throw new Error('Build 14 patch missing: Build 11 injection point');\\n    const build14Into11 = \\\"    const close14 = src.lastIndexOf(\\\\\\\"\\\\\\\\n})();\\\\\\\");\\\\n    if (close14 < 0) throw new Error('Build 14 patch missing: final game closure');\\\\n    const runtime14 = \\\\\\\"\\\\\\\\nfetch('polish14_runtime.js').then(r=>{if(!r.ok)throw new Error(`Build 14 runtime (${r.status})`);return r.text();}).then(code=>eval(code)).catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=`BUILD 14 RUNTIME ERROR\\\\\\\\n${err.message}`;});\\\\\\\";\\\\n    src = src.slice(0, close14) + runtime14 + src.slice(close14);\\\\n\\\";\\n    build11 = build11.replace(marker14b10, build14Into11 + \\\"\\\\n\\\" + marker14b10);\\n\";\n    build12 = build12.replace(marker14b11, build14Into12 + \"\\n\" + marker14b11);\n";
    build13 = build13.replace(marker14b12, build14Into13 + "\n" + marker14b12);
    const blob = new Blob([build13], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 14 LOAD ERROR\n${err.message}`;
  });
})();
