(() => {
'use strict';
const BUILD31_VERSION='31b1fresh1';
window.__player31BitmapEnabled=true;
window.__ped31BitmapEnabled=true;
addEventListener('keydown',e=>{
  if(e.code==='F1'){
    e.preventDefault();window.__player31BitmapEnabled=false;
    if(typeof window.__player31ResetGait==='function')window.__player31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31B.1 · VECTOR PLAYER · F2 ALTERNATING-WALK PLAYER';
  }else if(e.code==='F2'){
    e.preventDefault();window.__player31BitmapEnabled=true;
    if(typeof window.__player31ResetGait==='function')window.__player31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31B.1 · ALTERNATING-WALK PLAYER ON · F1 VECTOR PLAYER';
  }
});
addEventListener('keydown',e=>{
  if(e.code==='F3'){
    e.preventDefault();window.__ped31BitmapEnabled=false;
    if(typeof window.__ped31ResetGait==='function')window.__ped31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31B.1 · TEST PED VECTOR · F4 BITMAP PED';
  }else if(e.code==='F4'){
    e.preventDefault();window.__ped31BitmapEnabled=true;
    if(typeof window.__ped31ResetGait==='function')window.__ped31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31B.1 · TEST PED BITMAP ON · F3 VECTOR PED';
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
 fetch(v('runtime31b1_manifest.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load Build 31B.1 manifest (${r.status})`);return r.json();})
]).then(([core,city,harbor,west,missions,build29,manifest])=>{
 window.__city28Data=city;window.__harbor18Data=harbor;window.__west25Data=west;window.__missions28Data=missions;window.__build29Data=build29;window.__runtime31B1Manifest=manifest;
 const activeNeedle="const activeMission=()=>['steal','deliver','destroy','escape'].includes(missionState);";
 if(!core.includes(activeNeedle))throw new Error('Flat core active-mission marker missing');
 core=core.replace(activeNeedle,"const activeMission=()=>['steal','deliver','destroy','escape','chain_steal','chain_drive','mixed_steal','mixed_drive','mixed_package','mixed_escape'].includes(missionState);");
 core=core.replace('ROAD_HALF=112;',`ROAD_HALF=${Number(city.road_half||96)};`);

 const playerNeedle="function drawPlayer(){if(!player.active)return;ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();}";
 if(!core.includes(playerNeedle))throw new Error('Build 31B.1 player draw marker missing');
 const playerPatch=`const PLAYER31_IDLE=new Image();
const PLAYER31_STEP_A=new Image();
const PLAYER31_STEP_B=new Image();
const PLAYER31_PATHS=['assets/build31a7/player_idle.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_2.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_3.png?v=${BUILD31_VERSION}'];
let PLAYER31_READY=0,PLAYER31_HAVE_LAST=false,PLAYER31_LAST_X=0,PLAYER31_LAST_Y=0,PLAYER31_ANIM_DIST=0,PLAYER31_FACE_X=0,PLAYER31_FACE_Y=-1,PLAYER31_WAS_MOVING=false,PLAYER31_LEAD_FOOT=1;
function player31Load(img,path){
 img.decoding='async';
 img.addEventListener('load',()=>{PLAYER31_READY++;if(PLAYER31_READY===3){const d=document.getElementById('detail');if(d)d.textContent='31B.1 · 3-FRAME ALTERNATING WALK ONLINE · F1 VECTOR / F2 BITMAP';}},{once:true});
 img.addEventListener('error',()=>{const d=document.getElementById('detail');if(d)d.textContent='31B.1 · REQUIRED PLAYER FRAME LOAD ERROR · VECTOR FALLBACK';},{once:true});
 img.src=path;
}
player31Load(PLAYER31_IDLE,PLAYER31_PATHS[0]);
player31Load(PLAYER31_STEP_A,PLAYER31_PATHS[1]);
player31Load(PLAYER31_STEP_B,PLAYER31_PATHS[2]);
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
function player31ResetGait(){
 PLAYER31_HAVE_LAST=false;
 PLAYER31_ANIM_DIST=0;
 PLAYER31_WAS_MOVING=false;
 player31UpdateFacing(player.fx,player.fy);
}
window.__player31ResetGait=player31ResetGait;
function player31UpdateInputFacing(){
 const ix=(down('ArrowRight')||down('KeyD')?1:0)-(down('ArrowLeft')||down('KeyA')?1:0);
 const iy=(down('ArrowDown')||down('KeyS')?1:0)-(down('ArrowUp')||down('KeyW')?1:0);
 if(ix||iy)player31UpdateFacing(ix,iy);
}
function drawPlayer(){
 if(!player.active){player31ResetGait();return;}
 let moved=0;
 if(PLAYER31_HAVE_LAST)moved=Math.hypot(player.x-PLAYER31_LAST_X,player.y-PLAYER31_LAST_Y);
 PLAYER31_LAST_X=player.x;PLAYER31_LAST_Y=player.y;PLAYER31_HAVE_LAST=true;
 if(moved>80){moved=0;PLAYER31_ANIM_DIST=0;PLAYER31_WAS_MOVING=false;PLAYER31_FACE_X=0;PLAYER31_FACE_Y=-1;}
 const bitmapOn=window.__player31BitmapEnabled!==false&&PLAYER31_READY===3;
 if(!bitmapOn){ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();return;}
 player31UpdateInputFacing();
 const moving=moved>0.05;
 if(moving){
  if(!PLAYER31_WAS_MOVING){PLAYER31_LEAD_FOOT^=1;PLAYER31_ANIM_DIST=0;}
  PLAYER31_ANIM_DIST+=moved;
 }else PLAYER31_ANIM_DIST=0;
 PLAYER31_WAS_MOVING=moving;
 const phase=Math.floor(PLAYER31_ANIM_DIST/32)%4;
 const first=PLAYER31_LEAD_FOOT?PLAYER31_STEP_A:PLAYER31_STEP_B;
 const second=PLAYER31_LEAD_FOOT?PLAYER31_STEP_B:PLAYER31_STEP_A;
 const frame=moving?(phase===0?first:phase===1?PLAYER31_IDLE:phase===2?second:PLAYER31_IDLE):PLAYER31_IDLE;
 const ang=Math.atan2(PLAYER31_FACE_Y,PLAYER31_FACE_X)-Math.PI/2;
 ctx.save();
 ctx.translate(player.x,player.y);ctx.rotate(ang);ctx.imageSmoothingEnabled=false;
 ctx.drawImage(frame,-32,-32,64,64);
 ctx.restore();
}`;
 core=core.replace(playerNeedle,playerPatch);

 const pedSpawnNeedle="peds=[];for(let i=0;i<28;i++){const r=sidewalkRoutes[i%sidewalkRoutes.length];peds.push(ped(r,i%r.length,pedColors[i%pedColors.length],i));}";
 if(!core.includes(pedSpawnNeedle))throw new Error('Build 31B.1 pedestrian spawn marker missing');
 core=core.replace(pedSpawnNeedle,pedSpawnNeedle+"const ped31Route=[[102,102],[798,102],[798,548],[102,548]];Object.assign(peds[0],{x:102,y:102,route:ped31Route,index:1,color:'#d64a40',speed:52,panic:0,down:0,dead:0,fx:1,fy:0});");

 const pedStart=core.indexOf("function drawPed(p){");
 const pedEnd=core.indexOf("\nfunction drawPickup",pedStart);
 if(pedStart<0||pedEnd<0)throw new Error('Build 31B.1 pedestrian draw marker missing');
 const pedPatch=`const PED31_IDLE=new Image();
const PED31_STEP_A=new Image();
const PED31_STEP_B=new Image();
const PED31_PATHS=['assets/build31b1/ped_idle.png?v=${BUILD31_VERSION}','assets/build31b1/ped_walk_a.png?v=${BUILD31_VERSION}','assets/build31b1/ped_walk_b.png?v=${BUILD31_VERSION}'];
let PED31_READY=0,PED31_HAVE_LAST=false,PED31_LAST_X=0,PED31_LAST_Y=0,PED31_ANIM_DIST=0,PED31_WAS_MOVING=false,PED31_LEAD_FOOT=1,PED31_FACE_X=0,PED31_FACE_Y=1;
function ped31Load(img,path){
 img.decoding='async';
 img.addEventListener('load',()=>{PED31_READY++;if(PED31_READY===3){const d=document.getElementById('detail');if(d)d.textContent='31B.1 · ONE BITMAP PEDESTRIAN ONLINE · F3 VECTOR / F4 BITMAP';}},{once:true});
 img.addEventListener('error',()=>{const d=document.getElementById('detail');if(d)d.textContent='31B.1 · PEDESTRIAN FRAME LOAD ERROR · VECTOR FALLBACK';},{once:true});
 img.src=path;
}
ped31Load(PED31_IDLE,PED31_PATHS[0]);
ped31Load(PED31_STEP_A,PED31_PATHS[1]);
ped31Load(PED31_STEP_B,PED31_PATHS[2]);
function ped31ResetGait(){PED31_HAVE_LAST=false;PED31_ANIM_DIST=0;PED31_WAS_MOVING=false;}
window.__ped31ResetGait=ped31ResetGait;
function ped31UpdateFacing(fx,fy){
 fx=Number.isFinite(fx)?fx:0;fy=Number.isFinite(fy)?fy:1;
 const ax=Math.abs(fx),ay=Math.abs(fy);
 if(ax>ay){PED31_FACE_X=Math.sign(fx)||PED31_FACE_X||1;PED31_FACE_Y=0;return;}
 if(ay>ax){PED31_FACE_X=0;PED31_FACE_Y=Math.sign(fy)||PED31_FACE_Y||1;return;}
 if(ax>0||ay>0){
  if(PED31_FACE_X!==0){PED31_FACE_X=Math.sign(fx)||PED31_FACE_X;PED31_FACE_Y=0;}
  else{PED31_FACE_X=0;PED31_FACE_Y=Math.sign(fy)||PED31_FACE_Y||1;}
 }
}
function drawPedVector(p){
 ctx.save();ctx.translate(p.x,p.y);
 if(p.dead>0||p.down>0){ctx.globalAlpha=.6;ctx.fillStyle=p.dead>0?'#5b1919':p.color;ctx.beginPath();ctx.ellipse(0,0,15,7,0,0,Math.PI*2);ctx.fill();ctx.restore();return;}
 const bob=Math.sin(p.stride)*1.3;ctx.fillStyle='#e4b88f';ctx.beginPath();ctx.arc(0,-8+bob,5.5,0,Math.PI*2);ctx.fill();rect(-5.5,-2+bob,11,15,p.color);ctx.restore();
}
function drawPed(p){
 if(p!==peds[0]||p.dead>0||p.down>0||window.__ped31BitmapEnabled===false||PED31_READY!==3){drawPedVector(p);return;}
 let moved=0;
 if(PED31_HAVE_LAST)moved=Math.hypot(p.x-PED31_LAST_X,p.y-PED31_LAST_Y);
 PED31_LAST_X=p.x;PED31_LAST_Y=p.y;PED31_HAVE_LAST=true;
 if(moved>80){moved=0;PED31_ANIM_DIST=0;PED31_WAS_MOVING=false;}
 const moving=moved>0.02;
 if(moving){if(!PED31_WAS_MOVING){PED31_LEAD_FOOT^=1;PED31_ANIM_DIST=0;}PED31_ANIM_DIST+=moved;}else PED31_ANIM_DIST=0;
 PED31_WAS_MOVING=moving;
 ped31UpdateFacing(p.fx,p.fy);
 const stepPx=p.panic>0?22:12;
 const phase=Math.floor(PED31_ANIM_DIST/stepPx)%4;
 const first=PED31_LEAD_FOOT?PED31_STEP_A:PED31_STEP_B;
 const second=PED31_LEAD_FOOT?PED31_STEP_B:PED31_STEP_A;
 const frame=moving?(phase===0?first:phase===1?PED31_IDLE:phase===2?second:PED31_IDLE):PED31_IDLE;
 const ang=Math.atan2(PED31_FACE_Y,PED31_FACE_X)-Math.PI/2;
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);ctx.imageSmoothingEnabled=false;ctx.drawImage(frame,-24,-24,48,48);ctx.restore();
}`;
 core=core.slice(0,pedStart)+pedPatch+core.slice(pedEnd+1);

 const close=core.lastIndexOf('\n})();');if(close<0)throw new Error('Flat core closure marker missing');
 const hook=`\nfetch('runtime31b1_bundle.js?v=${BUILD31_VERSION}')\n .then(r=>{if(!r.ok)throw new Error(\`Build 31B.1 runtime bundle (\${r.status})\`);return r.text();})\n .then(code=>eval(code))\n .catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=\`BUILD 31B.1 RUNTIME ERROR\\n\${err.message}\`;});\n`;
 core=core.slice(0,close)+hook+core.slice(close);
 const blob=new Blob([core],{type:'text/javascript'}),script=document.createElement('script');
 script.src=URL.createObjectURL(blob);script.onload=()=>URL.revokeObjectURL(script.src);document.head.appendChild(script);
}).catch(err=>{
 console.error(err);const d=document.getElementById('detail');if(d)d.textContent=`BUILD 31B.1 LOAD ERROR\n${err.message}`;
});
})();
