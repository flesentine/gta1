if (!window.__gtaBuild23ConflictMatrix) {
window.__gtaBuild23ConflictMatrix = true;

const movementReservations23=new Map();
let movementOwnerSerial23=0;
let hotSwapRecoveryArmed23=false,hotSwapRecoveryUsed23=false;
const HOT_SWAP_RECOVERY_TIME23=70;

function ownerId23(c){if(!c._movementOwner23)c._movementOwner23=++movementOwnerSerial23;return c._movementOwner23;}
function opposite23(a){return a==='N'?'S':a==='S'?'N':a==='E'?'W':a==='W'?'E':'';}
function approach23(c){const fx=Math.sin(c.rot),fy=-Math.cos(c.rot);return Math.abs(fx)>=Math.abs(fy)?(fx>=0?'E':'W'):(fy>=0?'S':'N');}
function movement23(c){
  const a=approach23(c);let turn='S';const r=c.laneBase20||c.route;
  if(r&&r.length>=3){const i=((c.index||0)%r.length+r.length)%r.length,corner=r[i],next=r[(i+1)%r.length];if(corner&&next){const fx=Math.sin(c.rot),fy=-Math.cos(c.rot),ox=next[0]-corner[0],oy=next[1]-corner[1],m=Math.hypot(ox,oy)||1,dot=fx*ox/m+fy*oy/m;if(dot<=.82){const cross=fx*oy/m-fy*ox/m;turn=cross>0?'R':'L';}}}
  return a+turn;
}
function conflict23(a,b){
  if(!a||!b||a.length<2||b.length<2)return true;
  const aa=a[0],at=a[1],ba=b[0],bt=b[1];
  if(aa===ba)return true;
  if(at==='S'&&bt==='S'&&opposite23(aa)===ba)return false;
  if(at==='R'&&bt==='R')return false;
  if(opposite23(aa)===ba&&((at==='S'&&bt==='R')||(at==='R'&&bt==='S')))return false;
  return true;
}
function movementReservationFactor23(c){
  if(!c||!c.ai||c.destroyed)return 1;
  const hit=approachIntersection22(c);if(!hit)return 1;
  const phase=signalPhase19(hit.x,hit.y),fx=Math.sin(c.rot),fy=-Math.cos(c.rot),horizontal=Math.abs(fx)>=Math.abs(fy);
  if(!(horizontal?phase.h:phase.v))return 1;
  const now=performance.now()/1000,key=`${hit.x},${hit.y}`,owner=ownerId23(c),move=movement23(c);
  let list=(movementReservations23.get(key)||[]).filter(r=>r.until>=now);
  const blocked=list.some(r=>r.owner!==owner&&conflict23(move,r.movement));
  if(!blocked){
    if(hit.d<122){const existing=list.find(r=>r.owner===owner);if(existing){existing.until=now+1.2;existing.movement=move;}else list.push({owner,movement:move,until:now+1.2,x:hit.x,y:hit.y});movementReservations23.set(key,list);}
    return 1;
  }
  if(hit.d<62)return .05;if(hit.d<90)return .18;if(hit.d<122)return .42;return .72;
}
if(typeof reservationFactor22==='function')reservationFactor22=function(){return 1;};
if(typeof trafficFactor16==='function'){
  const trafficFactor23Base=trafficFactor16;
  trafficFactor16=function(c){return Math.min(trafficFactor23Base(c),movementReservationFactor23(c));};
}

function predictedTarget23(){
  const t=playerTarget();if(!t)return null;let x=t.x,y=t.y,lead=wanted>=3?1.65:1.35;
  if(inVehicle&&currentCar){const travel=clamp((currentCar.speed||0)*lead,-560,560);x+=Math.sin(currentCar.rot)*travel;y-=Math.cos(currentCar.rot)*travel;}
  else if(player&&Number.isFinite(player.fx)&&Number.isFinite(player.fy)){x+=player.fx*150*lead;y+=player.fy*150*lead;}
  x=clamp(x,WORLD.x+40,WORLD.x+WORLD.w-40);y=clamp(y,WORLD.y+40,WORLD.y+WORLD.h-40);return{x,y};
}
function routePolicePredictive23(dt){
  const target=playerTarget(),intercept=predictedTarget23();if(!target||!intercept)return;
  for(const p of police){
    if(!p)continue;
    if(wanted>=3&&dist(p,target)<230){p._route22=[];continue;}
    if(!segmentBlocked22(p,intercept)){
      p._route22=[intercept];const desired=Math.atan2(intercept.y-p.y,intercept.x-p.x)+Math.PI/2,e=wrap(desired-p.rot);p.rot+=clamp(e,-1.65*dt,1.65*dt);continue;
    }
    const px=nearestAxis22(p.x,ROAD_X),py=nearestAxis22(p.y,ROAD_Y),tx=nearestAxis22(intercept.x,ROAD_X),ty=nearestAxis22(intercept.y,ROAD_Y);
    const a=[{x:px,y:py},{x:px,y:ty},{x:tx,y:ty},intercept],b=[{x:px,y:py},{x:tx,y:py},{x:tx,y:ty},intercept];
    if(!p._route22||!p._route22.length)p._route22=routeCost22(p,a,intercept)<=routeCost22(p,b,intercept)?a:b;
    while(p._route22.length&&dist(p,p._route22[0])<72)p._route22.shift();
    const w=p._route22[0];if(!w)continue;const desired=Math.atan2(w.y-p.y,w.x-p.x)+Math.PI/2,e=wrap(desired-p.rot);p.rot+=clamp(e,-1.65*dt,1.65*dt);
  }
}
routePolice21=routePolicePredictive23;

function lateHotSwap23(){return mission().id==='hot_swap'&&['swap_package','swap_escape_steal','swap_escape','swap_deliver'].includes(missionState);}
function restoreHotSwap23(reason){
  const m=mission();hotSwapRecoveryUsed23=true;hotSwapRecoveryArmed23=false;
  if(inVehicle&&currentCar)toggleCar();
  if(hotSwapEscape22)cars=cars.filter(c=>c!==hotSwapEscape22);
  hotSwapEscape22=null;missionCar=null;clearWanted();
  player.active=true;player.x=m.package.x;player.y=m.package.y+52;chainIndex=chainPoints.length;
  missionTimer=Math.max(missionTimer,HOT_SWAP_RECOVERY_TIME23);missionState='swap_package';
  statusMessage='HOT SWAP RECOVERY — HANDOFF RESTORED · 70 SEC';statusTimer=3;
  if(typeof banner15==='function')banner15('RECOVERY CHECKPOINT','HANDOFF RESTORED');
}
const failMission23Base=failMission;
failMission=function(msg){
  if(lateHotSwap23()&&hotSwapRecoveryArmed23&&!hotSwapRecoveryUsed23&&!String(msg).includes('LOST A LIFE')&&respawnTimer<=0){restoreHotSwap23(msg);return;}
  if(mission().id==='hot_swap'){hotSwapRecoveryArmed23=false;hotSwapRecoveryUsed23=false;}
  return failMission23Base(msg);
};
const startMission23Base=startMission;
startMission=function(){if(mission().id==='hot_swap'){hotSwapRecoveryArmed23=false;hotSwapRecoveryUsed23=false;}return startMission23Base();};
const completeMission23Base=completeMission;
completeMission=function(){const hot=mission().id==='hot_swap';const result=completeMission23Base();if(hot){hotSwapRecoveryArmed23=false;hotSwapRecoveryUsed23=false;}return result;};
const missionText23Base=missionText;
missionText=function(){let text=missionText23Base();if(lateHotSwap23()){const flag=hotSwapRecoveryUsed23?'RECOVERY USED':hotSwapRecoveryArmed23?'RECOVERY READY':'RECOVERY —';text+=` · ${flag}`;}return text;};

const openMissionMenu23Base=openMissionMenu;
openMissionMenu=function(){openMissionMenu23Base();const menu=document.getElementById('build11-missions');if(!menu)return;menu.innerHTML=menu.innerHTML.replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21|22)/g,'BUILD 23').replace('7-stage courier → package → escape chain · base 9500','7 stages · handoff recovery checkpoint · base 9500');menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});};

const draw23Base=draw;
draw=function(){
  draw23Base();const pt=playerTarget(),now=performance.now()/1000;ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  for(const [key,list0] of movementReservations23){const list=list0.filter(r=>r.until>=now);if(!list.length)continue;const [x,y]=key.split(',').map(Number);if(pt&&Math.hypot(x-pt.x,y-pt.y)>850)continue;ctx.strokeStyle='rgba(61,239,224,.78)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,48,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(61,239,224,.90)';ctx.fillText(list.map(r=>r.movement).join(' '),x,y);}
  ctx.restore();
};

const update23Base=update;
update=function(dt){
  update23Base(dt);
  if(mission().id==='hot_swap'&&missionState==='swap_package'&&!hotSwapRecoveryUsed23&&!hotSwapRecoveryArmed23){hotSwapRecoveryArmed23=true;statusMessage='HANDOFF CHECKPOINT ARMED — 1 RECOVERY';statusTimer=2.1;if(typeof banner15==='function')banner15('CHECKPOINT ARMED','1 LATE-RUN RECOVERY');}
  routePolicePredictive23(dt);
  const bar=document.getElementById('build14-drive');if(bar){bar.textContent=bar.textContent.replace('BUILD 22','BUILD 23');if(!bar.textContent.includes('CONFLICT MATRIX'))bar.textContent+=' · CONFLICT MATRIX + INTERCEPT';}
};
const front23=document.getElementById('build11-front');if(front23){front23.innerHTML=front23.innerHTML.replace(/BUILD 22/g,'BUILD 23').replace('Reserved intersections + multi-hop pursuit online','Conflict matrix + predictive pursuit online');const bold=front23.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;}
if(typeof banner15==='function')banner15('CONFLICT MATRIX ONLINE','BUILD 23');
}
