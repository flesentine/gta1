(() => {
'use strict';
const BUILD31_VERSION='31a8fresh1';
window.__player31BitmapEnabled=true;
addEventListener('keydown',e=>{
  if(e.code==='F1'){
    e.preventDefault();window.__player31BitmapEnabled=false;
    const d=document.getElementById('detail');if(d)d.textContent='31A.8 · VECTOR PLAYER · F2 STEP-NEUTRAL PLAYER';
  }else if(e.code==='F2'){
    e.preventDefault();window.__player31BitmapEnabled=true;
    const d=document.getElementById('detail');if(d)d.textContent='31A.8 · STEP-NEUTRAL PLAYER ON · F1 VECTOR PLAYER';
  }
});
const v=p=>`${p}${p.includes('?')?'&':'?'}v=${BUILD31_VERSION}`;
Promise.all([
 fetch(v('game8.js')).then(r=>{if(!r.ok)throw new Error(`Unable to load flat engine core (${r.status})`);return r.text();}),
 fetch(v('../data/city_sector.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load city sector (${r.status})`);return r.json();}),
 fetch(v('../data/harbor_east.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load Harbor East (${r.status})`);return r.json();}),
 fetch(v('../data/west_ridge.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load West Ridge (${r.status})`);return r.json();}),
 fetch(v('../data/missions.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load missions (${r.status})`);return r.json();}),
 fetch(v('../data/build29_campaign.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load campaign (${r.status})`);return r.json();}),
 fetch(v('runtime31a8_manifest.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load Build 31A.8 manifest (${r.status})`);return r.json();})
]).then(([core,city,harbor,west,missions,build29,manifest])=>{
 window.__city28Data=city;window.__harbor18Data=harbor;window.__west25Data=west;window.__missions28Data=missions;window.__build29Data=build29;window.__runtime31A8Manifest=manifest;
 const activeNeedle="const activeMission=()=>['steal','deliver','destroy','escape'].includes(missionState);";
 if(!core.includes(activeNeedle))throw new Error('Flat core active-mission marker missing');
 core=core.replace(activeNeedle,"const activeMission=()=>['steal','deliver','destroy','escape','chain_steal','chain_drive','mixed_steal','mixed_drive','mixed_package','mixed_escape'].includes(missionState);");
 core=core.replace('ROAD_HALF=112;',`ROAD_HALF=${Number(city.road_half||96)};`);

 const playerNeedle="function drawPlayer(){if(!player.active)return;ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();}";
 if(!core.includes(playerNeedle))throw new Error('Build 31A.8 player draw marker missing');
 const playerPatch=`const PLAYER31_IDLE=new Image();
const PLAYER31_WALK=[new Image(),new Image(),new Image(),new Image()];
const PLAYER31_PATHS=['assets/build31a7/player_idle.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_0.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_1.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_2.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_3.png?v=${BUILD31_VERSION}'];
let PLAYER31_READY=0,PLAYER31_HAVE_LAST=false,PLAYER31_LAST_X=0,PLAYER31_LAST_Y=0,PLAYER31_ANIM_DIST=0,PLAYER31_FACE_X=0,PLAYER31_FACE_Y=-1;
function player31Load(img,path){
 img.decoding='async';
 img.addEventListener('load',()=>{PLAYER31_READY++;if(PLAYER31_READY===5){const d=document.getElementById('detail');if(d)d.textContent='31A.8 · STEP → NEUTRAL → STEP WALK ONLINE · F1 VECTOR / F2 BITMAP';}},{once:true});
 img.addEventListener('error',()=>{const d=document.getElementById('detail');if(d)d.textContent='31A.8 · PLAYER FRAME LOAD ERROR · VECTOR FALLBACK';},{once:true});
 img.src=path;
}
player31Load(PLAYER31_IDLE,PLAYER31_PATHS[0]);
PLAYER31_WALK.forEach((img,i)=>player31Load(img,PLAYER31_PATHS[i+1]));
function player31UpdateFacing(fx,fy){
 fx=Number.isFinite(fx)?fx:0;fy=Number.isFinite(fy)?fy:-1;
 const ax=Math.abs(fx),ay=Math.abs(fy);
 if(ax>ay){PLAYER31_FACE_X=Math.sign(fx)||PLAYER31_FACE_X||1;PLAYER31_FACE_Y=0;return;}
 if(ay>ax){PLAYER31_FACE_X=0;PLAYER31_FACE_Y=Math.sign(fy)||PLAYER31_FACE_Y||-1;return;}
 if(ax>0||ay>0){
  if(PLAYER31_FACE_X!==0){PLAYER31_FACE_X=Math.sign(fx)||PLAYER31_FACE_X;PLAYER31_FACE_Y=0;}
  else{PLAYER31_FACE_X=0;PLAYER31_FACE_Y=Math.sign(fy)||PLAYER31_FACE_Y||-1;}
 }
}
function player31UpdateInputFacing(){
 const ix=(down('ArrowRight')||down('KeyD')?1:0)-(down('ArrowLeft')||down('KeyA')?1:0);
 const iy=(down('ArrowDown')||down('KeyS')?1:0)-(down('ArrowUp')||down('KeyW')?1:0);
 if(ix||iy)player31UpdateFacing(ix,iy);
}
function drawPlayer(){
 if(!player.active){PLAYER31_HAVE_LAST=false;PLAYER31_ANIM_DIST=0;return;}
 let moved=0;
 if(PLAYER31_HAVE_LAST)moved=Math.hypot(player.x-PLAYER31_LAST_X,player.y-PLAYER31_LAST_Y);
 PLAYER31_LAST_X=player.x;PLAYER31_LAST_Y=player.y;PLAYER31_HAVE_LAST=true;
 if(moved>80){moved=0;PLAYER31_ANIM_DIST=0;PLAYER31_FACE_X=0;PLAYER31_FACE_Y=-1;}
 const bitmapOn=window.__player31BitmapEnabled!==false&&PLAYER31_READY===5;
 if(!bitmapOn){ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();return;}
 player31UpdateInputFacing();
 const moving=moved>0.05;
 if(moving)PLAYER31_ANIM_DIST+=moved;else PLAYER31_ANIM_DIST=0;
 const phase=Math.floor(PLAYER31_ANIM_DIST/32)%4;
 const frame=moving?(phase===0?PLAYER31_WALK[3]:phase===1?PLAYER31_IDLE:phase===2?PLAYER31_WALK[2]:PLAYER31_IDLE):PLAYER31_IDLE;
 const ang=Math.atan2(PLAYER31_FACE_Y,PLAYER31_FACE_X)-Math.PI/2;
 ctx.save();
 ctx.translate(player.x,player.y);ctx.rotate(ang);ctx.imageSmoothingEnabled=false;
 ctx.drawImage(frame,-32,-32,64,64);
 ctx.restore();
}`;
 core=core.replace(playerNeedle,playerPatch);

 const close=core.lastIndexOf('\n})();');if(close<0)throw new Error('Flat core closure marker missing');
 const hook=`\nfetch('runtime31a8_bundle.js?v=${BUILD31_VERSION}')\n .then(r=>{if(!r.ok)throw new Error(\`Build 31A.8 runtime bundle (\${r.status})\`);return r.text();})\n .then(code=>eval(code))\n .catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=\`BUILD 31A.8 RUNTIME ERROR\\n\${err.message}\`;});\n`;
 core=core.slice(0,close)+hook+core.slice(close);
 const blob=new Blob([core],{type:'text/javascript'}),script=document.createElement('script');
 script.src=URL.createObjectURL(blob);script.onload=()=>URL.revokeObjectURL(script.src);document.head.appendChild(script);
}).catch(err=>{
 console.error(err);const d=document.getElementById('detail');if(d)d.textContent=`BUILD 31A.8 LOAD ERROR\n${err.message}`;
});
})();
