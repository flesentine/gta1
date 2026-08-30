if (!window.__gtaBuild22Reservations) {
window.__gtaBuild22Reservations = true;

const HOT_SWAP22={
  id:'hot_swap',title:'HOT SWAP',type:'multi_stage_swap',
  spawn:{x:1800,y:-1200},time:150,reward:9500,color:'#35c7c9',
  checkpoints:[[3200,-650],[4100,0]],radius:95,maxCheckpointSpeed:118,heat:1,
  handoff:{x:4260,y:540,w:500,h:190},package:{x:4510,y:635},handoffSpeed:70,
  escapeSpawn:{x:4860,y:1190},escapeColor:'#22272d',escapeWanted:3,
  finalDelivery:{x:1980,y:1120,w:620,h:150},finalSpeed:75
};
if(!CAMPAIGN.some(m=>m.id==='hot_swap'))CAMPAIGN.push(HOT_SWAP22);

let hotSwapEscape22=null;
let hotSwapStage22=0;
let reservationSerial22=0;
const reservations22=new Map();

function carId22(c){if(!c._reservationId22)c._reservationId22=++reservationSerial22;return c._reservationId22;}
function approachIntersection22(c){
  if(!c)return null;
  const fx=Math.sin(c.rot),fy=-Math.cos(c.rot),sx=-fy,sy=fx;
  let nearest=Infinity,ix=0,iy=0;
  for(const x of ROAD_X)for(const y of ROAD_Y){
    const dx=x-c.x,dy=y-c.y,along=dx*fx+dy*fy,lateral=Math.abs(dx*sx+dy*sy);
    if(along<18||along>145||lateral>76)continue;
    if(along<nearest){nearest=along;ix=x;iy=y;}
  }
  return Number.isFinite(nearest)?{x:ix,y:iy,d:nearest}:null;
}
function reservationFactor22(c){
  if(!c||!c.ai||c.destroyed)return 1;
  const hit=approachIntersection22(c);if(!hit)return 1;
  const now=performance.now()/1000,key=`${hit.x},${hit.y}`;
  for(const [k,r] of reservations22)if(r.until<now)reservations22.delete(k);
  const phase=signalPhase19(hit.x,hit.y),fx=Math.sin(c.rot),fy=-Math.cos(c.rot),horizontal=Math.abs(fx)>=Math.abs(fy);
  if(!(horizontal?phase.h:phase.v))return 1;
  const id=carId22(c),current=reservations22.get(key);
  if(!current||current.until<now||current.owner===id){
    if(hit.d<118)reservations22.set(key,{owner:id,until:now+1.18,x:hit.x,y:hit.y});
    return 1;
  }
  if(hit.d<62)return .05;
  if(hit.d<90)return .18;
  if(hit.d<118)return .42;
  return .72;
}
if(typeof trafficFactor16==='function'){
  const trafficFactor22Base=trafficFactor16;
  trafficFactor16=function(c){return Math.min(trafficFactor22Base(c),reservationFactor22(c));};
}

function segmentBlocked22(a,b){
  for(let i=1;i<14;i++){
    const t=i/14,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
    for(const q of buildings)if(x>q.x-22&&x<q.x+q.w+22&&y>q.y-22&&y<q.y+q.h+22)return true;
  }
  return false;
}
function nearestAxis22(v,list){let best=list[0]??v,d=Infinity;for(const n of list){const q=Math.abs(n-v);if(q<d){d=q;best=n;}}return best;}
function routeCost22(p,points,target){let cost=0,last={x:p.x,y:p.y};for(const w of points.concat([target])){cost+=dist(last,w)+(segmentBlocked22(last,w)?1400:0);last=w;}return cost;}
routePolice21=function(dt){
  const target=playerTarget();if(!target)return;
  for(const p of police){
    if(!p)continue;
    if(wanted>=3&&dist(p,target)<260){p._route22=[];continue;}
    if(!segmentBlocked22(p,target)){p._route22=[];continue;}
    const px=nearestAxis22(p.x,ROAD_X),py=nearestAxis22(p.y,ROAD_Y),tx=nearestAxis22(target.x,ROAD_X),ty=nearestAxis22(target.y,ROAD_Y);
    const a=[{x:px,y:py},{x:px,y:ty},{x:tx,y:ty}].filter((w,i,arr)=>i===0||w.x!==arr[i-1].x||w.y!==arr[i-1].y);
    const b=[{x:px,y:py},{x:tx,y:py},{x:tx,y:ty}].filter((w,i,arr)=>i===0||w.x!==arr[i-1].x||w.y!==arr[i-1].y);
    if(!p._route22||!p._route22.length)p._route22=(routeCost22(p,a,target)<=routeCost22(p,b,target)?a:b);
    while(p._route22.length&&dist(p,p._route22[0])<78)p._route22.shift();
    const w=p._route22[0];if(!w)continue;
    const desired=Math.atan2(w.y-p.y,w.x-p.x)+Math.PI/2,e=wrap(desired-p.rot);
    p.rot+=clamp(e,-1.55*dt,1.55*dt);
  }
};

function spawnHotSwapEscape22(){
  const m=mission();
  const c=car(m.escapeSpawn.x,m.escapeSpawn.y,Math.PI/2,m.escapeColor,false,null,0,0,false);
  c.mission=true;c._hotSwapEscape22=true;cars.push(c);hotSwapEscape22=c;return c;
}
function hotSwapActive22(){return mission().id==='hot_swap'&&['swap_steal','swap_drive','swap_handoff','swap_package','swap_escape_steal','swap_escape','swap_deliver'].includes(missionState);}

try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const s=JSON.parse(raw);if(levelComplete&&Number(s.campaignIndex)===11)campaignIndex=11;}}catch(e){console.warn('Build 22 saved mission restore failed',e);}

const startMission22Base=startMission;
startMission=function(){
  const m=mission();if(m.id!=='hot_swap')return startMission22Base();
  missionTimer=m.time||0;chainIndex=0;chainPoints=m.checkpoints||[];hotSwapStage22=0;hotSwapEscape22=null;
  missionState='swap_steal';spawnMissionCar(m);statusMessage='HOT SWAP — STEAL THE TEAL COURIER';statusTimer=2.4;
  if(typeof sfxAccept14==='function')sfxAccept14();if(typeof banner15==='function')banner15('HOT SWAP','MULTI-STAGE JOB');
};

const completeMission22Base=completeMission;
completeMission=function(){
  const m=mission();if(m.id!=='hot_swap')return completeMission22Base();
  const reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);
  missionCar=null;hotSwapEscape22=null;missionTimer=0;chainIndex=0;chainPoints=[];hotSwapStage22=0;campaignIndex=0;missionState='cooldown';missionCooldown=3.2;
  statusMessage=`HOT SWAP COMPLETE — FULL HANDOFF +${reward}`;statusTimer=3.6;saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();if(typeof banner15==='function')banner15('HOT SWAP','FULL HANDOFF COMPLETE');
};
const failMission22Base=failMission;
failMission=function(msg){if(mission().id==='hot_swap'){hotSwapEscape22=null;hotSwapStage22=0;}return failMission22Base(msg);};

const missionText22Base=missionText;
missionText=function(){
  if(mission().id==='hot_swap'){
    const t=` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`;
    if(missionState==='swap_steal')return `1/7 STEAL THE TEAL COURIER${t}`;
    if(missionState==='swap_drive')return `2/7 HARBOR RUN ${Math.min(chainIndex+1,chainPoints.length)}/${chainPoints.length}${t}`;
    if(missionState==='swap_handoff')return `3/7 PARK IN THE HANDOFF LOT${t}`;
    if(missionState==='swap_package')return `4/7 GET OUT — GRAB THE PACKAGE${t}`;
    if(missionState==='swap_escape_steal')return `5/7 STEAL THE BLACK ESCAPE CAR${t}`;
    if(missionState==='swap_escape')return `6/7 LOSE THE COPS${t}`;
    if(missionState==='swap_deliver')return `7/7 DELIVER ESCAPE CAR TO DOWNTOWN SAFEHOUSE${t}`;
  }
  return missionText22Base();
};

const showUnlock22Base=showUnlock;
showUnlock=function(){showUnlock22Base();const el=document.getElementById('build9-unlock');if(el)el.innerHTML=el.innerHTML.replace('8 POST-CLEAR JOBS UNLOCKED','9 POST-CLEAR JOBS UNLOCKED').replace('HARBOR EAST + 8 POST-CLEAR JOBS UNLOCKED','HARBOR EAST + 9 POST-CLEAR JOBS UNLOCKED');};

const openMissionMenu22Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu22Base();const menu=document.getElementById('build11-missions');if(!menu)return;
  menu.innerHTML=menu.innerHTML.replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21)/g,'BUILD 22').replace('Keys 1–9, 0, - select','Keys 1–9, 0, -, = select');
  const b=menu.querySelector('[data-mission="11"]');if(b){const ok=!b.disabled;b.innerHTML=`<b>12. HOT SWAP</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">7-stage courier → package → escape chain · base 9500</span>`;}
  menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});
};
addEventListener('keydown',e=>{if(missionMenuOpen&&(e.code==='Equal'||e.code==='NumpadAdd')&&!e.repeat){e.preventDefault();selectMission(11);}});

const navInfo22Base=(typeof navInfo==='function'?navInfo:null);
if(navInfo22Base){navInfo=function(){
  if(mission().id==='hot_swap'){
    if(missionState==='swap_steal'&&missionCar)return{label:'TEAL COURIER',x:missionCar.x,y:missionCar.y};
    if(missionState==='swap_drive'&&chainPoints.length){const p=chainPoints[Math.min(chainIndex,chainPoints.length-1)];return{label:'HARBOR RUN',x:p[0],y:p[1]};}
    if(missionState==='swap_handoff'){const r=mission().handoff;return{label:'HANDOFF LOT',x:r.x+r.w/2,y:r.y+r.h/2};}
    if(missionState==='swap_package'){return{label:'PACKAGE',x:mission().package.x,y:mission().package.y};}
    if(missionState==='swap_escape_steal'&&hotSwapEscape22)return{label:'ESCAPE CAR',x:hotSwapEscape22.x,y:hotSwapEscape22.y};
    if(missionState==='swap_escape')return{label:'LOSE HEAT',x:RESPRAY.x+RESPRAY.w/2,y:RESPRAY.y+RESPRAY.h/2};
    if(missionState==='swap_deliver'){const r=mission().finalDelivery;return{label:'SAFEHOUSE',x:r.x+r.w/2,y:r.y+r.h/2};}
  }
  return navInfo22Base();
};}

const draw22Base=draw;
draw=function(){
  draw22Base();const pt=playerTarget();ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  const now=performance.now()/1000;
  for(const r of reservations22.values())if(r.until>=now){if(pt&&Math.hypot(r.x-pt.x,r.y-pt.y)>850)continue;ctx.strokeStyle='rgba(55,225,240,.72)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(r.x,r.y,42,0,Math.PI*2);ctx.stroke();}
  if(mission().id==='hot_swap'){
    const m=mission();ctx.lineWidth=5;
    if(missionState==='swap_handoff'){ctx.strokeStyle='#35c7c9';ctx.strokeRect(m.handoff.x,m.handoff.y,m.handoff.w,m.handoff.h);}
    if(missionState==='swap_package'){ctx.fillStyle='#f2c94c';ctx.beginPath();ctx.arc(m.package.x,m.package.y,13+Math.sin(now*5)*3,0,Math.PI*2);ctx.fill();}
    if(missionState==='swap_escape_steal'&&hotSwapEscape22){ctx.strokeStyle='#f5f5f5';ctx.beginPath();ctx.arc(hotSwapEscape22.x,hotSwapEscape22.y,38,0,Math.PI*2);ctx.stroke();}
    if(missionState==='swap_deliver'){ctx.strokeStyle='#35e278';ctx.strokeRect(m.finalDelivery.x,m.finalDelivery.y,m.finalDelivery.w,m.finalDelivery.h);}
  }
  ctx.restore();
};

const update22Base=update;
update=function(dt){
  update22Base(dt);
  if(hotSwapActive22()&&respawnTimer<=0&&missionTimer>0){
    missionTimer=Math.max(0,missionTimer-dt);
    if(missionTimer<=0){failMission('MISSION FAILED — TIME EXPIRED');return;}
  }
  if(mission().id==='hot_swap'){
    const m=mission();
    if(missionState==='swap_steal'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — COURIER LOST');
      else if(inVehicle&&currentCar===missionCar){missionState='swap_drive';chainIndex=0;statusMessage='COURIER ACQUIRED — RUN THE HARBOR GATES';statusTimer=2;}
    }else if(missionState==='swap_drive'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — COURIER LOST');
      else if(inVehicle&&currentCar===missionCar&&chainIndex<chainPoints.length){const p=chainPoints[chainIndex];if(Math.hypot(missionCar.x-p[0],missionCar.y-p[1])<=m.radius&&Math.abs(missionCar.speed)<=m.maxCheckpointSpeed){if(chainIndex<chainPoints.length-1&&m.heat)raiseWanted(m.heat);chainIndex++;if(chainIndex>=chainPoints.length){missionState='swap_handoff';statusMessage='HARBOR GATES CLEARED — PARK IN HANDOFF LOT';statusTimer=2.2;}}}
    }else if(missionState==='swap_handoff'){
      if(inVehicle&&currentCar===missionCar&&inside(missionCar,m.handoff)&&Math.abs(missionCar.speed)<=m.handoffSpeed){missionState='swap_package';statusMessage='PARKED — GET OUT AND TAKE THE PACKAGE';statusTimer=2.2;}
    }else if(missionState==='swap_package'){
      if(!inVehicle&&dist(player,m.package)<=34){spawnHotSwapEscape22();wantedAtLeast(m.escapeWanted||3);missionState='swap_escape_steal';statusMessage='PACKAGE SECURED — STEAL THE BLACK ESCAPE CAR';statusTimer=2.4;}
    }else if(missionState==='swap_escape_steal'){
      if(!hotSwapEscape22||hotSwapEscape22.destroyed)failMission('MISSION FAILED — ESCAPE CAR LOST');
      else if(inVehicle&&currentCar===hotSwapEscape22){missionState='swap_escape';statusMessage='ESCAPE CAR ACQUIRED — LOSE THE COPS';statusTimer=2.2;}
    }else if(missionState==='swap_escape'){
      if(wanted<=0){missionState='swap_deliver';statusMessage='HEAT CLEARED — RETURN TO DOWNTOWN SAFEHOUSE';statusTimer=2.4;}
    }else if(missionState==='swap_deliver'){
      if(!hotSwapEscape22||hotSwapEscape22.destroyed)failMission('MISSION FAILED — ESCAPE CAR LOST');
      else if(inVehicle&&currentCar===hotSwapEscape22&&inside(hotSwapEscape22,m.finalDelivery)&&Math.abs(hotSwapEscape22.speed)<=m.finalSpeed)completeMission();
    }
  }
  const bar=document.getElementById('build14-drive');if(bar){bar.textContent=bar.textContent.replace('BUILD 21','BUILD 22');if(!bar.textContent.includes('RESERVATIONS'))bar.textContent+=' · RESERVATIONS';}
};

const front22=document.getElementById('build11-front');if(front22){front22.innerHTML=front22.innerHTML.replace(/BUILD 21/g,'BUILD 22').replace('Turn pockets + routed pursuit online','Reserved intersections + multi-hop pursuit online');const bold=front22.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;}
if(typeof banner15==='function')banner15('INTERSECTION RESERVATIONS ONLINE','BUILD 22');
}
