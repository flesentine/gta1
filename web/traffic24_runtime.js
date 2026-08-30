if (!window.__gtaBuild24Coordination) {
window.__gtaBuild24Coordination = true;

const TWIN_STRIKE24={
  id:'twin_strike',title:'TWIN STRIKE',type:'parallel_order',
  spawn:{x:900,y:-650},time:140,reward:10500,color:'#e65129',
  objectives:[{x:-1800,y:-650,label:'WEST CACHE'},{x:4100,y:650,label:'HARBOR CACHE'}],
  radius:105,maxObjectiveSpeed:115,heat:1,escapeWanted:3,
  finalDelivery:{x:1980,y:1120,w:620,h:150},finalSpeed:80
};
if(!CAMPAIGN.some(m=>m.id==='twin_strike'))CAMPAIGN.push(TWIN_STRIKE24);

let twinDone24=[false,false];
let roadblocks24=[];
let roadblockCooldown24=3.0;
let roadblockSerial24=0;

function targetMotion24(){
  if(inVehicle&&currentCar){
    return{x:Math.sin(currentCar.rot)*Math.sign(currentCar.speed||1),y:-Math.cos(currentCar.rot)*Math.sign(currentCar.speed||1)};
  }
  const m=Math.hypot(player.fx||0,player.fy||0)||1;
  return{x:(player.fx||1)/m,y:(player.fy||0)/m};
}
function adjacentAxis24(value,list,dir){
  if(!list||!list.length)return value;
  const a=[...list].sort((x,y)=>x-y);
  let best=0,d=Infinity;
  for(let i=0;i<a.length;i++){const q=Math.abs(a[i]-value);if(q<d){d=q;best=i;}}
  return a[Math.max(0,Math.min(a.length-1,best+dir))];
}
function routePoint24(p,target){
  const px=nearestAxis22(p.x,ROAD_X),py=nearestAxis22(p.y,ROAD_Y),tx=nearestAxis22(target.x,ROAD_X),ty=nearestAxis22(target.y,ROAD_Y);
  const a=[{x:px,y:py},{x:px,y:ty},{x:tx,y:ty},target],b=[{x:px,y:py},{x:tx,y:py},{x:tx,y:ty},target];
  return routeCost22(p,a,target)<=routeCost22(p,b,target)?a:b;
}
function coordinatedPolice24(dt){
  const target=playerTarget(),base=predictedTarget23();if(!target||!base)return;
  const motion=targetMotion24(),side={x:-motion.y,y:motion.x};
  for(let i=0;i<police.length;i++){
    const p=police[i];if(!p)continue;
    let aim={x:base.x,y:base.y};const role=i%3;
    if(role===1){aim={x:base.x+side.x*520,y:base.y+side.y*520};}
    else if(role===2){aim={x:base.x-side.x*520,y:base.y-side.y*520};}
    aim.x=clamp(aim.x,WORLD.x+60,WORLD.x+WORLD.w-60);aim.y=clamp(aim.y,WORLD.y+60,WORLD.y+WORLD.h-60);
    p._role24=role===0?'CHASE':role===1?'FLANK A':'FLANK B';
    if(wanted>=3&&dist(p,target)<210){p._route22=[];continue;}
    if(!segmentBlocked22(p,aim)){p._route22=[aim];}
    else if(!p._route22||!p._route22.length)p._route22=routePoint24(p,aim);
    while(p._route22&&p._route22.length&&dist(p,p._route22[0])<70)p._route22.shift();
    const w=p._route22&&p._route22[0];if(!w)continue;
    const desired=Math.atan2(w.y-p.y,w.x-p.x)+Math.PI/2,e=wrap(desired-p.rot);
    p.rot+=clamp(e,-1.72*dt,1.72*dt);
  }
}
routePolice21=coordinatedPolice24;

function chooseRoadblock24(){
  const t=playerTarget(),pred=predictedTarget23();if(!t||!pred)return null;
  const m=targetMotion24(),horizontal=Math.abs(m.x)>=Math.abs(m.y);
  let x,y;
  if(horizontal){
    x=adjacentAxis24(pred.x,ROAD_X,m.x>=0?1:-1);y=nearestAxis22(t.y,ROAD_Y);
  }else{
    x=nearestAxis22(t.x,ROAD_X);y=adjacentAxis24(pred.y,ROAD_Y,m.y>=0?1:-1);
  }
  const d=Math.hypot(x-t.x,y-t.y);if(d<320||d>1350)return null;
  return{x,y,horizontal,id:++roadblockSerial24,until:performance.now()/1000+11.0};
}
function spawnRoadblock24(){
  const r=chooseRoadblock24();if(!r)return false;
  roadblocks24=[r];roadblockCooldown24=12.0;
  statusMessage='POLICE ROADBLOCK DEPLOYED AHEAD';statusTimer=2.0;
  if(typeof banner15==='function')banner15('ROADBLOCK','POLICE COORDINATION');
  return true;
}
function roadblockBlocks24(r){
  if(r.horizontal)return[{x:r.x,y:r.y-43,rot:0},{x:r.x,y:r.y+43,rot:0}];
  return[{x:r.x-43,y:r.y,rot:Math.PI/2},{x:r.x+43,y:r.y,rot:Math.PI/2}];
}
const collides24Base=collides;
collides=function(x,y,r=18){
  if(collides24Base(x,y,r))return true;
  for(const rb of roadblocks24)for(const b of roadblockBlocks24(rb))if(Math.hypot(x-b.x,y-b.y)<r+27)return true;
  return false;
};
function updateRoadblocks24(dt){
  roadblockCooldown24=Math.max(0,roadblockCooldown24-dt);
  const now=performance.now()/1000;
  roadblocks24=roadblocks24.filter(r=>r.until>now&&wanted>=3);
  if(wanted>=3&&!roadblocks24.length&&roadblockCooldown24<=0)spawnRoadblock24();
}
function drawRoadblocks24(){
  ctx.save();
  for(const rb of roadblocks24){
    for(const b of roadblockBlocks24(rb)){
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);
      ctx.fillStyle='#15191d';ctx.fillRect(-18,-34,36,68);
      ctx.fillStyle='#e8ecef';ctx.fillRect(-15,-12,30,24);
      ctx.fillStyle='#d62626';ctx.fillRect(-15,-31,8,5);
      ctx.fillStyle='#2c78d2';ctx.fillRect(7,-31,8,5);
      ctx.restore();
    }
    ctx.strokeStyle='rgba(255,188,52,.9)';ctx.lineWidth=4;ctx.setLineDash([10,7]);
    if(rb.horizontal){ctx.beginPath();ctx.moveTo(rb.x-54,rb.y-84);ctx.lineTo(rb.x+54,rb.y+84);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(rb.x-84,rb.y+54);ctx.lineTo(rb.x+84,rb.y-54);ctx.stroke();}
    ctx.setLineDash([]);
  }
  ctx.restore();
}

try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const s=JSON.parse(raw);if(levelComplete&&Number(s.campaignIndex)===12)campaignIndex=12;}}catch(e){console.warn('Build 24 saved mission restore failed',e);}

function twinActive24(){return mission().id==='twin_strike'&&['parallel_steal','parallel_targets','parallel_escape','parallel_deliver'].includes(missionState);}
const startMission24Base=startMission;
startMission=function(){
  const m=mission();if(m.id!=='twin_strike')return startMission24Base();
  missionTimer=m.time||0;twinDone24=[false,false];missionState='parallel_steal';spawnMissionCar(m);
  statusMessage='TWIN STRIKE — STEAL THE ORANGE RUNNER';statusTimer=2.4;
  if(typeof sfxAccept14==='function')sfxAccept14();if(typeof banner15==='function')banner15('TWIN STRIKE','CHOOSE YOUR ORDER');
};
const completeMission24Base=completeMission;
completeMission=function(){
  const m=mission();if(m.id!=='twin_strike')return completeMission24Base();
  const reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);
  missionCar=null;missionTimer=0;twinDone24=[false,false];campaignIndex=0;missionState='cooldown';missionCooldown=3.2;
  statusMessage=`TWIN STRIKE COMPLETE — BOTH CACHES +${reward}`;statusTimer=3.5;saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();if(typeof banner15==='function')banner15('TWIN STRIKE','BOTH CACHES CLEARED');
};
const failMission24Base=failMission;
failMission=function(msg){if(mission().id==='twin_strike')twinDone24=[false,false];return failMission24Base(msg);};
const loseLife24Base=loseLife;
loseLife=function(reason){const twin=twinActive24(),before=lives;loseLife24Base(reason);if(twin&&lives<before)failMission('MISSION FAILED — LOST A LIFE');};

const missionText24Base=missionText;
missionText=function(){
  if(mission().id==='twin_strike'){
    const t=` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`;
    if(missionState==='parallel_steal')return `1/4 STEAL THE ORANGE RUNNER${t}`;
    if(missionState==='parallel_targets'){
      const a=twinDone24[0]?'WEST ✓':'WEST ○',b=twinDone24[1]?'HARBOR ✓':'HARBOR ○';
      return `2/4 HIT BOTH CACHES — ${a} · ${b}${t}`;
    }
    if(missionState==='parallel_escape')return `3/4 BOTH CACHES HIT — LOSE THE COPS${t}`;
    if(missionState==='parallel_deliver')return `4/4 RETURN RUNNER TO DOWNTOWN SAFEHOUSE${t}`;
  }
  return missionText24Base();
};

const showUnlock24Base=showUnlock;
showUnlock=function(){showUnlock24Base();const el=document.getElementById('build9-unlock');if(el)el.innerHTML=el.innerHTML.replace('9 POST-CLEAR JOBS UNLOCKED','10 POST-CLEAR JOBS UNLOCKED').replace('HARBOR EAST + 9 POST-CLEAR JOBS UNLOCKED','HARBOR EAST + 10 POST-CLEAR JOBS UNLOCKED');};

const openMissionMenu24Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu24Base();const menu=document.getElementById('build11-missions');if(!menu)return;
  menu.innerHTML=menu.innerHTML.replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21|22|23)/g,'BUILD 24').replace('Keys 1–9, 0, -, = select','Keys 1–9, 0, -, =, ] select');
  const b=menu.querySelector('[data-mission="12"]');if(b){const ok=!b.disabled;b.innerHTML=`<b>13. TWIN STRIKE</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">2 caches · either order · escape + safehouse · base 10500</span>`;}
  menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});
};
addEventListener('keydown',e=>{if(missionMenuOpen&&e.code==='BracketRight'&&!e.repeat){e.preventDefault();selectMission(12);}});

const draw24Base=draw;
draw=function(){
  draw24Base();const pt=playerTarget(),now=performance.now()/1000;
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  drawRoadblocks24();
  if(mission().id==='twin_strike'){
    const m=mission();
    if(missionState==='parallel_targets'){
      m.objectives.forEach((o,i)=>{if(twinDone24[i])return;ctx.strokeStyle=i===0?'#ffd34d':'#47e7ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(o.x,o.y,48+Math.sin(now*5+i)*5,0,Math.PI*2);ctx.stroke();ctx.font='bold 11px monospace';ctx.fillStyle=ctx.strokeStyle;ctx.textAlign='center';ctx.fillText(o.label,o.x,o.y-62);});
    }
    if(missionState==='parallel_deliver'){ctx.strokeStyle='#45e27c';ctx.lineWidth=5;ctx.strokeRect(m.finalDelivery.x,m.finalDelivery.y,m.finalDelivery.w,m.finalDelivery.h);}
  }
  for(const p of police){if(!p||!p._role24)continue;ctx.fillStyle='rgba(255,255,255,.75)';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(p._role24,p.x,p.y-28);}
  ctx.restore();
};

const update24Base=update;
update=function(dt){
  update24Base(dt);updateRoadblocks24(dt);
  if(twinActive24()&&respawnTimer<=0&&missionTimer>0){missionTimer=Math.max(0,missionTimer-dt);if(missionTimer<=0){failMission('MISSION FAILED — TIME EXPIRED');return;}}
  if(mission().id==='twin_strike'){
    const m=mission();
    if(missionState==='parallel_steal'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — RUNNER LOST');
      else if(inVehicle&&currentCar===missionCar){missionState='parallel_targets';statusMessage='RUNNER ACQUIRED — HIT BOTH CACHES IN ANY ORDER';statusTimer=2.2;}
    }else if(missionState==='parallel_targets'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — RUNNER LOST');
      else if(inVehicle&&currentCar===missionCar){
        m.objectives.forEach((o,i)=>{if(twinDone24[i])return;if(Math.hypot(missionCar.x-o.x,missionCar.y-o.y)<=m.radius&&Math.abs(missionCar.speed)<=m.maxObjectiveSpeed){twinDone24[i]=true;if(m.heat)raiseWanted(m.heat);statusMessage=`${o.label} CLEARED — ${twinDone24.filter(Boolean).length}/2`;statusTimer=1.8;if(typeof banner15==='function')banner15(o.label,'CACHE CLEARED');}});
        if(twinDone24.every(Boolean)){wantedAtLeast(m.escapeWanted||3);missionState='parallel_escape';statusMessage='BOTH CACHES CLEARED — LOSE THE COPS';statusTimer=2.4;}
      }
    }else if(missionState==='parallel_escape'){
      if(wanted<=0){missionState='parallel_deliver';statusMessage='HEAT CLEARED — RETURN RUNNER TO SAFEHOUSE';statusTimer=2.4;}
    }else if(missionState==='parallel_deliver'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — RUNNER LOST');
      else if(inVehicle&&currentCar===missionCar&&inside(missionCar,m.finalDelivery)&&Math.abs(missionCar.speed)<=m.finalSpeed)completeMission();
    }
  }
  const bar=document.getElementById('build14-drive');if(bar){bar.textContent=bar.textContent.replace('BUILD 23','BUILD 24');if(!bar.textContent.includes('COORDINATED COPS'))bar.textContent+=` · COORDINATED COPS${roadblocks24.length?' · ROADBLOCK':''}`;}
};
const front24=document.getElementById('build11-front');if(front24){front24.innerHTML=front24.innerHTML.replace(/BUILD 23/g,'BUILD 24').replace('Conflict matrix + predictive pursuit online','Coordinated pursuit + parallel missions online');const bold=front24.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;}
if(typeof banner15==='function')banner15('COORDINATED PURSUIT ONLINE','BUILD 24');
}
