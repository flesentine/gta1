if (!window.__gtaBuild26Lockdown) {
window.__gtaBuild26Lockdown = true;

const LOCKDOWN26={
  id:'lockdown',title:'LOCKDOWN',type:'level4_escape',
  spawn:{x:-4100,y:-650},time:165,reward:12500,color:'#15171b',
  checkpoints:[[-5000,0],[-3200,650],[-5000,1200]],
  radius:105,maxCheckpointSpeed:125,startingWanted:2,heat:1,escapeWanted:4,
  finalDelivery:{x:-3620,y:1120,w:560,h:150},finalSpeed:75
};
if(!CAMPAIGN.some(m=>m.id==='lockdown'))CAMPAIGN.push(LOCKDOWN26);

let lockdownPoints26=[];
let lockdownIndex26=0;
let spikeStrips26=[];
let spikeCooldown26=4.0;
let spikeSerial26=0;

function ensureTireState26(c){
  if(!c)return;
  if(c._tireBase26)return;
  c._tireBase26={max:c.max,turn:c.turn,accel:c.accel,brake:c.brake};
  c.tireDamage26=0;
}
function applyTirePenalty26(c){
  if(!c)return;
  ensureTireState26(c);
  const n=Math.max(0,Math.min(4,c.tireDamage26||0));
  const speed=[1,.92,.80,.68,.56][n],turn=[1,.93,.84,.74,.64][n],accel=[1,.96,.89,.82,.74][n],brake=[1,.98,.94,.88,.82][n];
  c.max=c._tireBase26.max*speed;
  c.turn=c._tireBase26.turn*turn;
  c.accel=c._tireBase26.accel*accel;
  c.brake=c._tireBase26.brake*brake;
}
function damageTires26(c,amount=1){
  if(!c||c.destroyed)return;
  ensureTireState26(c);
  const before=c.tireDamage26||0;
  c.tireDamage26=Math.min(4,before+amount);
  applyTirePenalty26(c);
  c._spikeHit26=performance.now()+900;
  if(c.tireDamage26>before){
    shake14=Math.max(shake14,5+c.tireDamage26);
    effects.push({x:c.x,y:c.y,t:.55,type:'impact',rot:c.rot});
    if(typeof sfxImpact14==='function')sfxImpact14(220+c.tireDamage26*30);
    statusMessage=`SPIKE STRIP — TIRE DAMAGE ${c.tireDamage26}/4`;
    statusTimer=2.0;
    if(typeof banner15==='function')banner15('TIRES HIT',`${c.tireDamage26}/4 DAMAGED`);
  }
}
function spikeRect26(s){
  return s.horizontalMotion?{x:s.x-13,y:s.y-96,w:26,h:192}:{x:s.x-96,y:s.y-13,w:192,h:26};
}
function chooseSpike26(){
  const t=playerTarget(),pred=predictedTarget23();if(!t||!pred)return null;
  const m=targetMotion24(),horizontal=Math.abs(m.x)>=Math.abs(m.y);
  let x,y;
  if(horizontal){
    x=adjacentAxis24(pred.x,ROAD_X,m.x>=0?1:-1);y=nearestAxis22(t.y,ROAD_Y);
  }else{
    x=nearestAxis22(t.x,ROAD_X);y=adjacentAxis24(pred.y,ROAD_Y,m.y>=0?1:-1);
  }
  const d=Math.hypot(x-t.x,y-t.y);
  if(d<280||d>1150)return null;
  if(roadblocks24.some(r=>Math.hypot(r.x-x,r.y-y)<220))return null;
  return{x,y,horizontalMotion:horizontal,id:++spikeSerial26,until:performance.now()/1000+9.0};
}
function spawnSpike26(){
  const s=chooseSpike26();
  if(!s){spikeCooldown26=1.5;return false;}
  spikeStrips26=[s];
  spikeCooldown26=8.0;
  statusMessage='LEVEL 4 — SPIKE STRIP DEPLOYED';statusTimer=2.0;
  if(typeof banner15==='function')banner15('SPIKE STRIP','LEVEL 4 PURSUIT');
  return true;
}
function updateSpikes26(dt){
  spikeCooldown26=Math.max(0,spikeCooldown26-dt);
  const now=performance.now()/1000;
  spikeStrips26=spikeStrips26.filter(s=>s.until>now&&wanted>=4);
  if(wanted>=4&&!spikeStrips26.length&&spikeCooldown26<=0)spawnSpike26();
  if(!inVehicle||!currentCar||!spikeStrips26.length)return;
  if(currentCar._spikeHit26&&performance.now()<currentCar._spikeHit26)return;
  for(const s of spikeStrips26){
    const r=spikeRect26(s);
    if(currentCar.x>=r.x&&currentCar.x<=r.x+r.w&&currentCar.y>=r.y&&currentCar.y<=r.y+r.h){
      damageTires26(currentCar,Math.abs(currentCar.speed)>220?2:1);
      s.until=now+.45;
      break;
    }
  }
}

function boxedPolice26(dt){
  if(wanted<4)return coordinatedPolice24(dt);
  const target=playerTarget(),base=predictedTarget23();if(!target||!base)return;
  const motion=targetMotion24(),side={x:-motion.y,y:motion.x};
  const targetSpeed=inVehicle&&currentCar?Math.abs(currentCar.speed):0;
  const ring=targetSpeed<170?135:235;
  const aims=[
    {x:base.x+motion.x*ring,y:base.y+motion.y*ring,role:'BOX FRONT'},
    {x:target.x+side.x*ring,y:target.y+side.y*ring,role:'BOX LEFT'},
    {x:target.x-side.x*ring,y:target.y-side.y*ring,role:'BOX RIGHT'},
    {x:target.x-motion.x*ring*.85,y:target.y-motion.y*ring*.85,role:'BOX REAR'}
  ];
  for(let i=0;i<police.length;i++){
    const p=police[i];if(!p)continue;
    const a=aims[i%aims.length];
    const aim={x:clamp(a.x,WORLD.x+60,WORLD.x+WORLD.w-60),y:clamp(a.y,WORLD.y+60,WORLD.y+WORLD.h-60)};
    p._role24=a.role;p._role26=a.role;
    if(!segmentBlocked22(p,aim))p._route22=[aim];
    else if(!p._route22||!p._route22.length)p._route22=routePoint24(p,aim);
    while(p._route22&&p._route22.length&&dist(p,p._route22[0])<58)p._route22.shift();
    const w=p._route22&&p._route22[0];if(!w)continue;
    const desired=Math.atan2(w.y-p.y,w.x-p.x)+Math.PI/2,e=wrap(desired-p.rot);
    p.rot+=clamp(e,-1.82*dt,1.82*dt);
  }
}
routePolice21=boxedPolice26;

const updateControlled26Base=updateControlled;
updateControlled=function(c,dt){
  ensureTireState26(c);applyTirePenalty26(c);
  updateControlled26Base(c,dt);
  const n=c.tireDamage26||0;
  if(n>=2&&Math.abs(c.speed)>90){
    const wobble=Math.sin(performance.now()/72+n)*(.18+n*.06)*dt*Math.min(1,Math.abs(c.speed)/260);
    c.rot+=wobble;
    if(n>=3)c.skid26=true;
  }
};
const drawCar26Base=drawCar;
drawCar=function(c){
  drawCar26Base(c);
  const n=c.tireDamage26||0;if(!n)return;
  const w=c.bodyW||34,h=c.bodyH||64,hw=w/2,hh=h/2;
  const marks=[[-hw-4,-hh+12],[hw+4,-hh+12],[-hw-4,hh-12],[hw+4,hh-12]];
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);
  for(let i=0;i<n;i++){
    ctx.fillStyle='#ff5a28';ctx.beginPath();ctx.arc(marks[i][0],marks[i][1],4,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,190,70,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(marks[i][0]-4,marks[i][1]-4);ctx.lineTo(marks[i][0]+4,marks[i][1]+4);ctx.stroke();
  }
  ctx.restore();
};

try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const s=JSON.parse(raw);if(levelComplete&&Number(s.campaignIndex)===14)campaignIndex=14;}}catch(e){console.warn('Build 26 saved mission restore failed',e);}

function lockdownActive26(){return mission().id==='lockdown'&&['lockdown_steal','lockdown_run','lockdown_escape','lockdown_deliver'].includes(missionState);}
const startMission26Base=startMission;
startMission=function(){
  const m=mission();if(m.id!=='lockdown')return startMission26Base();
  missionTimer=m.time||0;lockdownPoints26=m.checkpoints||[];lockdownIndex26=0;
  missionState='lockdown_steal';spawnMissionCar(m);
  statusMessage='LOCKDOWN — STEAL THE BLACK WEST RIDGE RUNNER';statusTimer=2.5;
  if(typeof sfxAccept14==='function')sfxAccept14();
  if(typeof banner15==='function')banner15('LOCKDOWN','LEVEL 4 ESCAPE RUN');
};
const completeMission26Base=completeMission;
completeMission=function(){
  const m=mission();if(m.id!=='lockdown')return completeMission26Base();
  const reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);
  missionCar=null;missionTimer=0;lockdownPoints26=[];lockdownIndex26=0;
  campaignIndex=0;missionState='cooldown';missionCooldown=3.4;
  statusMessage=`LOCKDOWN COMPLETE — AIRFIELD SECURED +${reward}`;statusTimer=3.6;saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();
  if(typeof banner15==='function')banner15('LOCKDOWN','LEVEL 4 ESCAPED');
};
const failMission26Base=failMission;
failMission=function(msg){if(mission().id==='lockdown'){lockdownPoints26=[];lockdownIndex26=0;}return failMission26Base(msg);};
const loseLife26Base=loseLife;
loseLife=function(reason){const active=lockdownActive26(),before=lives;loseLife26Base(reason);if(active&&lives<before)failMission('MISSION FAILED — LOST A LIFE');};

const missionText26Base=missionText;
missionText=function(){
  if(mission().id==='lockdown'){
    const t=` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`;
    if(missionState==='lockdown_steal')return `1/4 STEAL THE BLACK WEST RIDGE RUNNER${t}`;
    if(missionState==='lockdown_run')return `2/4 RIDGE GATE ${Math.min(lockdownIndex26+1,lockdownPoints26.length)}/${lockdownPoints26.length} · TIRES ${missionCar?(missionCar.tireDamage26||0):0}/4${t}`;
    if(missionState==='lockdown_escape')return `3/4 LEVEL 4 — EVADE SPIKES + BOX UNITS · TIRES ${missionCar?(missionCar.tireDamage26||0):0}/4${t}`;
    if(missionState==='lockdown_deliver')return `4/4 RETURN RUNNER TO AIRFIELD SERVICE LOT${t}`;
  }
  return missionText26Base();
};

const showUnlock26Base=showUnlock;
showUnlock=function(){
  showUnlock26Base();const el=document.getElementById('build9-unlock');
  if(el)el.innerHTML=el.innerHTML
    .replace('WEST RIDGE + HARBOR EAST + 11 POST-CLEAR JOBS UNLOCKED','WEST RIDGE + HARBOR EAST + 12 POST-CLEAR JOBS UNLOCKED')
    .replace('11 POST-CLEAR JOBS UNLOCKED','12 POST-CLEAR JOBS UNLOCKED');
};
const openMissionMenu26Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu26Base();const menu=document.getElementById('build11-missions');if(!menu)return;
  menu.innerHTML=menu.innerHTML
    .replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21|22|23|24|25)/g,'BUILD 26')
    .replace('Keys 1–9, 0, -, =, ], [ select','Keys 1–9, 0, -, =, ], [, \\ select');
  const b=menu.querySelector('[data-mission="14"]');
  if(b){const ok=!b.disabled;b.innerHTML=`<b>15. LOCKDOWN</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">West Ridge · level-4 spikes + box pursuit · base 12500</span>`;}
  menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});
};
addEventListener('keydown',e=>{if(missionMenuOpen&&e.code==='Backslash'&&!e.repeat){e.preventDefault();selectMission(14);}});

const draw26Base=draw;
draw=function(){
  draw26Base();const now=performance.now()/1000;
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  for(const s of spikeStrips26){
    const r=spikeRect26(s);ctx.fillStyle='rgba(20,22,24,.92)';ctx.fillRect(r.x,r.y,r.w,r.h);
    ctx.fillStyle='#e6e8e5';
    const count=8;for(let i=0;i<count;i++){
      if(s.horizontalMotion){const yy=r.y+12+i*(r.h-24)/(count-1);ctx.beginPath();ctx.moveTo(s.x-8,yy+5);ctx.lineTo(s.x,yy-7);ctx.lineTo(s.x+8,yy+5);ctx.fill();}
      else{const xx=r.x+12+i*(r.w-24)/(count-1);ctx.beginPath();ctx.moveTo(xx-5,s.y+8);ctx.lineTo(xx+7,s.y);ctx.lineTo(xx-5,s.y-8);ctx.fill();}
    }
  }
  if(mission().id==='lockdown'){
    const m=mission();
    if(missionState==='lockdown_run'&&lockdownPoints26.length){const p=lockdownPoints26[Math.min(lockdownIndex26,lockdownPoints26.length-1)];ctx.strokeStyle='#ff8b3d';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p[0],p[1],48+Math.sin(now*5)*5,0,Math.PI*2);ctx.stroke();}
    if(missionState==='lockdown_deliver'){ctx.strokeStyle='#78e06e';ctx.lineWidth=6;ctx.strokeRect(m.finalDelivery.x,m.finalDelivery.y,m.finalDelivery.w,m.finalDelivery.h);}
  }
  ctx.restore();
};

const update26Base=update;
update=function(dt){
  update26Base(dt);updateSpikes26(dt);
  if(currentCar&&(currentCar.tireDamage26||0)>0)applyTirePenalty26(currentCar);
  if(lockdownActive26()&&respawnTimer<=0&&missionTimer>0){missionTimer=Math.max(0,missionTimer-dt);if(missionTimer<=0){failMission('MISSION FAILED — TIME EXPIRED');return;}}
  if(mission().id==='lockdown'){
    const m=mission();
    if(missionState==='lockdown_steal'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — RUNNER LOST');
      else if(inVehicle&&currentCar===missionCar){ensureTireState26(missionCar);wantedAtLeast(m.startingWanted||2);missionState='lockdown_run';statusMessage='RUNNER ACQUIRED — WEST RIDGE GATES';statusTimer=2.2;}
    }else if(missionState==='lockdown_run'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — RUNNER LOST');
      else if(inVehicle&&currentCar===missionCar&&lockdownIndex26<lockdownPoints26.length){
        const p=lockdownPoints26[lockdownIndex26];
        if(Math.hypot(missionCar.x-p[0],missionCar.y-p[1])<=m.radius&&Math.abs(missionCar.speed)<=m.maxCheckpointSpeed){
          if(m.heat)raiseWanted(m.heat);lockdownIndex26++;statusMessage=`RIDGE GATE ${lockdownIndex26}/${lockdownPoints26.length}`;statusTimer=1.5;
          if(lockdownIndex26>=lockdownPoints26.length){wantedAtLeast(m.escapeWanted||4);missionState='lockdown_escape';statusMessage='LEVEL 4 LOCKDOWN — LOSE THE COPS';statusTimer=2.6;if(typeof banner15==='function')banner15('LEVEL 4','SPIKES + BOX UNITS ACTIVE');}
        }
      }
    }else if(missionState==='lockdown_escape'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — RUNNER LOST');
      else if(wanted<=0){missionState='lockdown_deliver';statusMessage='HEAT CLEARED — RETURN TO AIRFIELD SERVICE LOT';statusTimer=2.4;}
    }else if(missionState==='lockdown_deliver'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — RUNNER LOST');
      else if(inVehicle&&currentCar===missionCar&&inside(missionCar,m.finalDelivery)&&Math.abs(missionCar.speed)<=m.finalSpeed)completeMission();
    }
  }
  const bar=document.getElementById('build14-drive');
  if(bar){
    bar.textContent=bar.textContent.replace('BUILD 25','BUILD 26');
    const n=inVehicle&&currentCar?(currentCar.tireDamage26||0):0;
    if(!bar.textContent.includes('TIRES'))bar.textContent+=` · TIRES ${n}/4`;
    if(wanted>=4&&!bar.textContent.includes('BOX MODE'))bar.textContent+=' · BOX MODE';
    if(spikeStrips26.length&&!bar.textContent.includes('SPIKES'))bar.textContent+=' · SPIKES';
  }
};
const front26=document.getElementById('build11-front');
if(front26){front26.innerHTML=front26.innerHTML.replace(/BUILD 25/g,'BUILD 26').replace('West Ridge + Airfield expansion online','Spike strips + level-4 box pursuit online');const bold=front26.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;}
if(typeof banner15==='function')banner15('LEVEL 4 TACTICS ONLINE','BUILD 26');
}
