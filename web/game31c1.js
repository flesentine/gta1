(() => {
'use strict';
const BUILD31_VERSION='31c1fresh5';
window.__player31BitmapEnabled=true;
window.__ped31BitmapEnabled=true;
window.__car31BitmapEnabled=true;
addEventListener('keydown',e=>{
  if(e.code==='F1'){
    e.preventDefault();window.__player31BitmapEnabled=false;
    if(typeof window.__player31ResetGait==='function')window.__player31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31C.1 · VECTOR PLAYER · F2 ALTERNATING-WALK PLAYER';
  }else if(e.code==='F2'){
    e.preventDefault();window.__player31BitmapEnabled=true;
    if(typeof window.__player31ResetGait==='function')window.__player31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31C.1 · ALTERNATING-WALK PLAYER ON · F1 VECTOR PLAYER';
  }
});
addEventListener('keydown',e=>{
  if(e.code==='F3'){
    e.preventDefault();window.__ped31BitmapEnabled=false;
    if(typeof window.__ped31ResetGait==='function')window.__ped31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31C.1 · BITMAP CROWD VECTOR · F4 BITMAP PED';
  }else if(e.code==='F4'){
    e.preventDefault();window.__ped31BitmapEnabled=true;
    if(typeof window.__ped31ResetGait==='function')window.__ped31ResetGait();
    const d=document.getElementById('detail');if(d)d.textContent='31C.1 · BITMAP CROWD ON · F3 VECTOR PED';
  }
});
addEventListener('keydown',e=>{
  if(e.code==='Digit5'){
    e.preventDefault();window.__car31BitmapEnabled=false;
    const d=document.getElementById('detail');if(d)d.textContent='31C.1 · VECTOR TEST SEDAN · 6 BITMAP SEDAN';
  }else if(e.code==='Digit6'){
    e.preventDefault();window.__car31BitmapEnabled=true;
    const d=document.getElementById('detail');if(d)d.textContent='31C.1 · BITMAP TEST SEDAN ON · 5 VECTOR SEDAN';
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
 fetch(v('runtime31c1_manifest.json')).then(r=>{if(!r.ok)throw new Error(`Unable to load Build 31C.1 manifest (${r.status})`);return r.json();})
]).then(([core,city,harbor,west,missions,build29,manifest])=>{
 window.__city28Data=city;window.__harbor18Data=harbor;window.__west25Data=west;window.__missions28Data=missions;window.__build29Data=build29;window.__runtime31C1Manifest=manifest;
 const activeNeedle="const activeMission=()=>['steal','deliver','destroy','escape'].includes(missionState);";
 if(!core.includes(activeNeedle))throw new Error('Flat core active-mission marker missing');
 core=core.replace(activeNeedle,"const activeMission=()=>['steal','deliver','destroy','escape','chain_steal','chain_drive','mixed_steal','mixed_drive','mixed_package','mixed_escape'].includes(missionState);");
 core=core.replace('ROAD_HALF=112;',`ROAD_HALF=${Number(city.road_half||96)};`);

 const carSpawnNeedle="spawnPlan.forEach((sp,i)=>{const r=routes[sp[0]],idx=sp[1]%r.length,n=(idx+1)%r.length,p=r[idx],q=r[n],rot=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;cars.push(car(p[0],p[1],rot,carColors[i%carColors.length],true,r,n,185+(i%4)*18));});";
 if(!core.includes(carSpawnNeedle))throw new Error('Build 31C.1 vehicle spawn marker missing');
 core=core.replace(carSpawnNeedle,carSpawnNeedle+"if(cars[1])cars[1].bitmapVehicle31C1=true;");

 const carStart=core.indexOf("function drawCar(c){");
 const carEnd=core.indexOf("\nfunction drawCop",carStart);
 if(carStart<0||carEnd<0)throw new Error('Build 31C.1 vehicle draw marker missing');
 const carVector=core.slice(carStart,carEnd);
 const carPatch=`const CAR31_SPRITE=new Image();
let CAR31_READY=false;
CAR31_SPRITE.decoding='async';
CAR31_SPRITE.addEventListener('load',()=>{CAR31_READY=true;const d=document.getElementById('detail');if(d)d.textContent='31C.1 · APPROVED RED SEDAN ONLINE · 5 VECTOR / 6 BITMAP';},{once:true});
CAR31_SPRITE.addEventListener('error',()=>{CAR31_READY=false;const d=document.getElementById('detail');if(d)d.textContent='31C.1 · TEST SEDAN LOAD ERROR · VECTOR FALLBACK';},{once:true});
CAR31_SPRITE.src='assets/build31c1/car_red_approved.png?v=${BUILD31_VERSION}';
window.__car31RenderBitmap=function(c){
 if(!c||!c.bitmapVehicle31C1||window.__car31BitmapEnabled===false||!CAR31_READY)return false;
 const maxHp=Number(c.maxHp||4),hp=Number(c.hp==null?maxHp:c.hp);
 if(c.destroyed||c.flash>0||hp<=Math.ceil(maxHp/2)||(c.tireDamage26||0)>0)return false;
 ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.imageSmoothingEnabled=false;
 ctx.drawImage(CAR31_SPRITE,-20,-44,40,88);
 ctx.restore();return true;
};
${carVector.replace("function drawCar(c){","function drawCar(c){if(window.__car31RenderBitmap(c))return;")}`;
 core=core.slice(0,carStart)+carPatch+core.slice(carEnd);

 const playerNeedle="function drawPlayer(){if(!player.active)return;ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();}";
 if(!core.includes(playerNeedle))throw new Error('Build 31C.1 player draw marker missing');
 const playerPatch=`const PLAYER31_IDLE=new Image();
const PLAYER31_STEP_A=new Image();
const PLAYER31_STEP_B=new Image();
const PLAYER31_PATHS=['assets/build31a7/player_idle.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_2.png?v=${BUILD31_VERSION}','assets/build31a7/player_walk_3.png?v=${BUILD31_VERSION}'];
let PLAYER31_READY=0,PLAYER31_HAVE_LAST=false,PLAYER31_LAST_X=0,PLAYER31_LAST_Y=0,PLAYER31_ANIM_DIST=0,PLAYER31_FACE_X=0,PLAYER31_FACE_Y=-1,PLAYER31_WAS_MOVING=false,PLAYER31_LEAD_FOOT=1;
function player31Load(img,path){
 img.decoding='async';
 img.addEventListener('load',()=>{PLAYER31_READY++;if(PLAYER31_READY===3){const d=document.getElementById('detail');if(d)d.textContent='31C.1 · 3-FRAME ALTERNATING WALK ONLINE · F1 VECTOR / F2 BITMAP';}},{once:true});
 img.addEventListener('error',()=>{const d=document.getElementById('detail');if(d)d.textContent='31C.1 · REQUIRED PLAYER FRAME LOAD ERROR · VECTOR FALLBACK';},{once:true});
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
 if(!core.includes(pedSpawnNeedle))throw new Error('Build 31C.1 pedestrian spawn marker missing');
 core=core.replace(pedSpawnNeedle,pedSpawnNeedle+"const PED31_CROWD_INDICES=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],PED31_CROWD_SETS=[0,1,4,5,2,3,4,5,0,1,4,5,2,3,4,5,0,1,4,5,2,3,4,5,0,1,2,3];for(let n=0;n<PED31_CROWD_INDICES.length;n++){const i=PED31_CROWD_INDICES[n];if(peds[i]){peds[i].bitmapCrowd31B7=true;peds[i].bitmapSet31B7=PED31_CROWD_SETS[n];}}");

 const pedStart=core.indexOf("function drawPed(p){");
 const pedEnd=core.indexOf("\nfunction drawPickup",pedStart);
 if(pedStart<0||pedEnd<0)throw new Error('Build 31C.1 pedestrian draw marker missing');
 const pedPatch=`const PED31_SETS=[
 {idle:new Image(),stepA:new Image(),stepB:new Image(),ready:0},
 {idle:new Image(),stepA:new Image(),stepB:new Image(),ready:0},
 {idle:new Image(),stepA:new Image(),stepB:new Image(),ready:0},
 {idle:new Image(),stepA:new Image(),stepB:new Image(),ready:0},
 {idle:new Image(),stepA:new Image(),stepB:new Image(),ready:0},
 {idle:new Image(),stepA:new Image(),stepB:new Image(),ready:0}
];
const PED31_PATHS=[
 ['assets/build31b1/ped_idle.png?v=${BUILD31_VERSION}','assets/build31b1/ped_walk_a.png?v=${BUILD31_VERSION}','assets/build31b3/ped1_walk_b.png?v=${BUILD31_VERSION}'],
 ['assets/build31b2/ped2_idle.png?v=${BUILD31_VERSION}','assets/build31b2/ped2_walk_a.png?v=${BUILD31_VERSION}','assets/build31b2/ped2_walk_b.png?v=${BUILD31_VERSION}'],
 ['assets/build31b4/ped3_idle.png?v=${BUILD31_VERSION}','assets/build31b4/ped3_walk_a.png?v=${BUILD31_VERSION}','assets/build31b4/ped3_walk_b.png?v=${BUILD31_VERSION}'],
 ['assets/build31b4/ped4_idle.png?v=${BUILD31_VERSION}','assets/build31b4/ped4_walk_a.png?v=${BUILD31_VERSION}','assets/build31b4/ped4_walk_b.png?v=${BUILD31_VERSION}'],
 ['assets/build31b5/ped5_idle.png?v=${BUILD31_VERSION}','assets/build31b5/ped5_walk_a.png?v=${BUILD31_VERSION}','assets/build31b5/ped5_walk_b.png?v=${BUILD31_VERSION}'],
 ['assets/build31b5/ped6_idle.png?v=${BUILD31_VERSION}','assets/build31b5/ped6_walk_a.png?v=${BUILD31_VERSION}','assets/build31b5/ped6_walk_b.png?v=${BUILD31_VERSION}']
];
let PED31_STATES=new WeakMap();
function ped31Load(setIndex,img,path){
 img.decoding='async';
 img.addEventListener('load',()=>{const set=PED31_SETS[setIndex];set.ready++;if(set.ready===3){const d=document.getElementById('detail');if(d)d.textContent='31C.1 · BITMAP CROWD SET '+(setIndex+1)+' ONLINE · F3 VECTOR / F4 BITMAP';}},{once:true});
 img.addEventListener('error',()=>{const d=document.getElementById('detail');if(d)d.textContent='31C.1 · BITMAP CROWD SET '+(setIndex+1)+' FRAME LOAD ERROR · PER-SET FALLBACK';},{once:true});
 img.src=path;
}
PED31_SETS.forEach((set,i)=>{
 ped31Load(i,set.idle,PED31_PATHS[i][0]);
 ped31Load(i,set.stepA,PED31_PATHS[i][1]);
 ped31Load(i,set.stepB,PED31_PATHS[i][2]);
});
function ped31ResetGait(){PED31_STATES=new WeakMap();}
window.__ped31ResetGait=ped31ResetGait;
function ped31State(p){
 let st=PED31_STATES.get(p);
 if(!st){
  st={haveLast:true,lastX:p.x,lastY:p.y,animDist:0,wasMoving:false,leadFoot:1,faceX:Number.isFinite(p.fx)?p.fx:0,faceY:Number.isFinite(p.fy)?p.fy:1};
  PED31_STATES.set(p,st);
 }
 return st;
}
function ped31UpdateFacing(st,fx,fy){
 fx=Number.isFinite(fx)?fx:0;fy=Number.isFinite(fy)?fy:1;
 const ax=Math.abs(fx),ay=Math.abs(fy);
 if(ax>ay){st.faceX=Math.sign(fx)||st.faceX||1;st.faceY=0;return;}
 if(ay>ax){st.faceX=0;st.faceY=Math.sign(fy)||st.faceY||1;return;}
 if(ax>0||ay>0){
  if(st.faceX!==0){st.faceX=Math.sign(fx)||st.faceX;st.faceY=0;}
  else{st.faceX=0;st.faceY=Math.sign(fy)||st.faceY||1;}
 }
}
function ped31DrawBitmap(p,setIndex){
 const set=PED31_SETS[setIndex],st=ped31State(p);
 let moved=st.haveLast?Math.hypot(p.x-st.lastX,p.y-st.lastY):0;
 st.lastX=p.x;st.lastY=p.y;st.haveLast=true;
 if(moved>80){moved=0;st.animDist=0;st.wasMoving=false;}
 const moving=moved>0.02;
 if(moving){if(!st.wasMoving){st.leadFoot^=1;st.animDist=0;}st.animDist+=moved;}else st.animDist=0;
 st.wasMoving=moving;
 ped31UpdateFacing(st,p.fx,p.fy);
 const stepPx=p.panic>0?22:12;
 const phase=Math.floor(st.animDist/stepPx)%4;
 const first=st.leadFoot?set.stepA:set.stepB;
 const second=st.leadFoot?set.stepB:set.stepA;
 const frame=moving?(phase===0?first:phase===1?set.idle:phase===2?second:set.idle):set.idle;
 const ang=Math.atan2(st.faceY,st.faceX)-Math.PI/2;
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);ctx.imageSmoothingEnabled=false;ctx.drawImage(frame,-24,-24,48,48);ctx.restore();
}
window.__ped31RenderBitmap=function(p){
 if(!p||!p.bitmapCrowd31B7||p.dead>0||p.down>0||window.__ped31BitmapEnabled===false)return false;
 const setIndex=Number.isInteger(p.bitmapSet31B7)?p.bitmapSet31B7:0;
 const set=PED31_SETS[setIndex];
 if(!set||set.ready!==3)return false;
 ped31DrawBitmap(p,setIndex);return true;
};
function drawPed(p){
 if(window.__ped31RenderBitmap(p))return;
 ctx.save();ctx.translate(p.x,p.y);
 if(p.dead>0||p.down>0){ctx.globalAlpha=.6;ctx.fillStyle=p.dead>0?'#5b1919':p.color;ctx.beginPath();ctx.ellipse(0,0,15,7,0,0,Math.PI*2);ctx.fill();ctx.restore();return;}
 const bob=Math.sin(p.stride)*1.3;ctx.fillStyle='#e4b88f';ctx.beginPath();ctx.arc(0,-8+bob,5.5,0,Math.PI*2);ctx.fill();rect(-5.5,-2+bob,11,15,p.color);ctx.restore();
}`;
 core=core.slice(0,pedStart)+pedPatch+core.slice(pedEnd+1);

 const close=core.lastIndexOf('\n})();');if(close<0)throw new Error('Flat core closure marker missing');
 const hook=`\nfetch('runtime31c1_bundle.js?v=${BUILD31_VERSION}')\n .then(r=>{if(!r.ok)throw new Error(\`Build 31C.1 runtime bundle (\${r.status})\`);return r.text();})\n .then(code=>eval(code))\n .catch(err=>{console.error(err);const d=document.getElementById('detail');if(d)d.textContent=\`BUILD 31C.1 RUNTIME ERROR\\n\${err.message}\`;});\n`;
 core=core.slice(0,close)+hook+core.slice(close);
 const blob=new Blob([core],{type:'text/javascript'}),script=document.createElement('script');
 script.src=URL.createObjectURL(blob);script.onload=()=>URL.revokeObjectURL(script.src);document.head.appendChild(script);
}).catch(err=>{
 console.error(err);const d=document.getElementById('detail');if(d)d.textContent=`BUILD 31C.1 LOAD ERROR\n${err.message}`;
});
})();
