(() => {
'use strict';
window.__player31BitmapEnabled=true;
addEventListener('keydown',e=>{
  if(e.code==='F1'){
    e.preventDefault();window.__player31BitmapEnabled=false;
    const d=document.getElementById('detail');if(d)d.textContent='31A.1 · VECTOR PLAYER · F2 BITMAP PLAYER';
  }else if(e.code==='F2'){
    e.preventDefault();window.__player31BitmapEnabled=true;
    const d=document.getElementById('detail');if(d)d.textContent='31A.1 · PLAYER BITMAP ON · F1 VECTOR PLAYER';
  }
});
Promise.all([
 fetch('game8.js').then(r=>{if(!r.ok)throw new Error(`Unable to load flat engine core (${r.status})`);return r.text();}),
 fetch('../data/city_sector.json').then(r=>{if(!r.ok)throw new Error(`Unable to load city sector (${r.status})`);return r.json();}),
 fetch('../data/harbor_east.json').then(r=>{if(!r.ok)throw new Error(`Unable to load Harbor East (${r.status})`);return r.json();}),
 fetch('../data/west_ridge.json').then(r=>{if(!r.ok)throw new Error(`Unable to load West Ridge (${r.status})`);return r.json();}),
 fetch('../data/missions.json').then(r=>{if(!r.ok)throw new Error(`Unable to load missions (${r.status})`);return r.json();}),
 fetch('../data/build29_campaign.json').then(r=>{if(!r.ok)throw new Error(`Unable to load campaign (${r.status})`);return r.json();}),
 fetch('runtime31_manifest.json').then(r=>{if(!r.ok)throw new Error(`Unable to load Build 31A.1 manifest (${r.status})`);return r.json();})
]).then(([core,city,harbor,west,missions,build29,manifest])=>{
 window.__city28Data=city;window.__harbor18Data=harbor;window.__west25Data=west;window.__missions28Data=missions;window.__build29Data=build29;window.__runtime31Manifest=manifest;
 const activeNeedle="const activeMission=()=>['steal','deliver','destroy','escape'].includes(missionState);";
 if(!core.includes(activeNeedle))throw new Error('Flat core active-mission marker missing');
 core=core.replace(activeNeedle,"const activeMission=()=>['steal','deliver','destroy','escape','chain_steal','chain_drive','mixed_steal','mixed_drive','mixed_package','mixed_escape'].includes(missionState);");
 core=core.replace('ROAD_HALF=112;',`ROAD_HALF=${Number(city.road_half||96)};`);

 const playerNeedle="function drawPlayer(){if(!player.active)return;ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();}";
 if(!core.includes(playerNeedle))throw new Error('Build 31A.1 player draw marker missing');
 const playerPatch=`const PLAYER31_IMG=new Image();\nPLAYER31_IMG.decoding='async';\nPLAYER31_IMG.src='assets/build31a/player.png';\nPLAYER31_IMG.addEventListener('load',()=>{const d=document.getElementById('detail');if(d)d.textContent='31A.1 · PLAYER PNG LOADED · F1 VECTOR / F2 BITMAP';},{once:true});\nfunction drawPlayer(){\n if(!player.active)return;\n const bitmapOn=window.__player31BitmapEnabled!==false&&PLAYER31_IMG.complete&&PLAYER31_IMG.naturalWidth>0;\n if(!bitmapOn){ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();return;}\n const ang=Math.atan2(player.fy||-1,player.fx||0)+Math.PI/2;\n ctx.save();\n ctx.strokeStyle='#ff3cff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x,player.y,24,0,Math.PI*2);ctx.stroke();\n ctx.translate(player.x,player.y);ctx.rotate(ang);ctx.imageSmoothingEnabled=false;\n ctx.drawImage(PLAYER31_IMG,-15,-23,30,46);\n ctx.restore();\n}`;
 core=core.replace(playerNeedle,playerPatch);

 const close=core.lastIndexOf('\n})();');if(close<0)throw new Error('Flat core closure marker missing');
 const hook=`\nfetch('runtime31_bundle.js')\n .then(r=>{if(!r.ok)throw new Error(\`Build 31A.1 runtime bundle (\${r.status})\`);return r.text();})\n .then(code=>eval(code))\n .catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=\`BUILD 31A.1 RUNTIME ERROR\\n\${err.message}\`;});\n`;
 core=core.slice(0,close)+hook+core.slice(close);
 const blob=new Blob([core],{type:'text/javascript'}),script=document.createElement('script');
 script.src=URL.createObjectURL(blob);script.onload=()=>URL.revokeObjectURL(script.src);document.head.appendChild(script);
}).catch(err=>{
 console.error(err);const d=document.getElementById('detail');if(d)d.textContent=`BUILD 31A.1 LOAD ERROR\n${err.message}`;
});
})();
