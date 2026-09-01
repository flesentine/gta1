(() => {
'use strict';
Promise.all([
 fetch('game8.js').then(r=>{if(!r.ok)throw new Error(`Unable to load flat engine core (${r.status})`);return r.text();}),
 fetch('../data/city_sector.json').then(r=>{if(!r.ok)throw new Error(`Unable to load city sector (${r.status})`);return r.json();}),
 fetch('../data/harbor_east.json').then(r=>{if(!r.ok)throw new Error(`Unable to load Harbor East (${r.status})`);return r.json();}),
 fetch('../data/west_ridge.json').then(r=>{if(!r.ok)throw new Error(`Unable to load West Ridge (${r.status})`);return r.json();}),
 fetch('../data/missions.json').then(r=>{if(!r.ok)throw new Error(`Unable to load missions (${r.status})`);return r.json();}),
 fetch('../data/build29_campaign.json').then(r=>{if(!r.ok)throw new Error(`Unable to load campaign (${r.status})`);return r.json();}),
 fetch('runtime31_manifest.json').then(r=>{if(!r.ok)throw new Error(`Unable to load Build 31A manifest (${r.status})`);return r.json();})
]).then(([core,city,harbor,west,missions,build29,manifest])=>{
 window.__city28Data=city;window.__harbor18Data=harbor;window.__west25Data=west;window.__missions28Data=missions;window.__build29Data=build29;window.__runtime31Manifest=manifest;
 const activeNeedle="const activeMission=()=>['steal','deliver','destroy','escape'].includes(missionState);";if(!core.includes(activeNeedle))throw new Error('Flat core active-mission marker missing');
 core=core.replace(activeNeedle,"const activeMission=()=>['steal','deliver','destroy','escape','chain_steal','chain_drive','mixed_steal','mixed_drive','mixed_package','mixed_escape'].includes(missionState);");
 core=core.replace('ROAD_HALF=112;',`ROAD_HALF=${Number(city.road_half||96)};`);
 const close=core.lastIndexOf('\n})();');if(close<0)throw new Error('Flat core closure marker missing');
 const hook=`\nfetch('runtime31_bundle.js')\n .then(r=>{if(!r.ok)throw new Error(\`Build 31A runtime bundle (\${r.status})\`);return r.text();})\n .then(code=>eval(code))\n .catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=\`BUILD 31A RUNTIME ERROR\\n\${err.message}\`;});\n`;
 core=core.slice(0,close)+hook+core.slice(close);
 const blob=new Blob([core],{type:'text/javascript'}),script=document.createElement('script');script.src=URL.createObjectURL(blob);script.onload=()=>URL.revokeObjectURL(script.src);document.head.appendChild(script);
}).catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=`BUILD 31A LOAD ERROR\n${err.message}`;});
})();
