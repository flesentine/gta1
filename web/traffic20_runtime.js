if (!window.__gtaBuild20Lanes) {
window.__gtaBuild20Lanes = true;

const GREEN_WAVE20 = {
  id:'green_wave', title:'GREEN WAVE', type:'bonus_checkpoint_run',
  spawn:{x:3350,y:-1200}, time:105, reward:7000, bonus:2500, color:'#4de078',
  checkpoints:[[4100,-650],[5000,0],[4100,650],[3200,1200]],
  radius:95, maxCheckpointSpeed:115, heat:0
};
if (!CAMPAIGN.some(m=>m.id==='green_wave')) CAMPAIGN.push(GREEN_WAVE20);

let greenWaveBonus20 = true;
const LANE_OFFSET20=26, LANE_CHANGE_RATE20=42;

function shiftedRoute20(base, offset){
  const n=base.length, result=[];
  if(n<2)return base.map(p=>[p[0],p[1]]);
  for(let i=0;i<n;i++){
    const prev=base[(i-1+n)%n],cur=base[i];
    let dx=cur[0]-prev[0],dy=cur[1]-prev[1],m=Math.hypot(dx,dy)||1;
    dx/=m;dy/=m;
    result.push([cur[0]-dy*offset,cur[1]+dx*offset]);
  }
  return result;
}
function ensureLane20(c){
  if(!c||!c.ai||!c.route||c.route.length<2||c.destroyed)return;
  if(c.laneBase20)return;
  c.laneBase20=c.route.map(p=>[p[0],p[1]]);
  const index=Math.max(0,cars.indexOf(c));
  c.laneSide20=(index%2===0)?-1:1;
  c.laneTarget20=c.laneSide20;
  c.laneOffset20=c.laneSide20*LANE_OFFSET20;
  c.laneCooldown20=performance.now()/1000+(index%5)*.35;
  c.route=shiftedRoute20(c.laneBase20,c.laneOffset20);
}
function updateLaneRoutes20(dt){
  for(const c of cars){
    if(!c||!c.ai||c.destroyed)continue;
    ensureLane20(c);
    if(!c.laneBase20)continue;
    const target=(c.laneTarget20||1)*LANE_OFFSET20;
    c.laneOffset20=approach(c.laneOffset20||0,target,LANE_CHANGE_RATE20*dt);
    c.route=shiftedRoute20(c.laneBase20,c.laneOffset20);
  }
}
function laneSpacing20(c){
  if(!c||c.destroyed)return 1;
  const fx=Math.sin(c.rot),fy=-Math.cos(c.rot),sx=-fy,sy=fx;
  let nearest=Infinity;
  for(const other of cars){
    if(!other||other===c||other.destroyed)continue;
    const dx=other.x-c.x,dy=other.y-c.y;
    const along=dx*fx+dy*fy,lateral=Math.abs(dx*sx+dy*sy);
    if(along<1||along>185||lateral>42)continue;
    nearest=Math.min(nearest,along);
  }
  if(nearest<54)return .08;
  if(nearest<88)return .30;
  if(nearest<128)return .58;
  if(nearest<165)return .78;
  return 1;
}
function distanceToIntersection20(c){
  const fx=Math.sin(c.rot),fy=-Math.cos(c.rot),sx=-fy,sy=fx;
  let nearest=Infinity;
  for(const x of ROAD_X)for(const y of ROAD_Y){
    const dx=x-c.x,dy=y-c.y,along=dx*fx+dy*fy,lateral=Math.abs(dx*sx+dy*sy);
    if(along<0||along>260||lateral>90)continue;
    nearest=Math.min(nearest,along);
  }
  return nearest;
}
function adjacentLaneClear20(c,targetSide){
  const fx=Math.sin(c.rot),fy=-Math.cos(c.rot),sx=-fy,sy=fx;
  const current=c.laneOffset20||0,target=targetSide*LANE_OFFSET20,shift=target-current;
  for(const other of cars){
    if(!other||other===c||other.destroyed)continue;
    const dx=other.x-c.x,dy=other.y-c.y;
    const along=dx*fx+dy*fy,lateral=dx*sx+dy*sy;
    if(along<-95||along>135)continue;
    if(Math.abs(lateral-shift)<38)return false;
  }
  return true;
}
function tryLaneChange20(c){
  ensureLane20(c);
  if(!c.laneBase20)return;
  const now=performance.now()/1000;
  if(now<(c.laneCooldown20||0))return;
  if(distanceToIntersection20(c)<180)return;
  const target=-(c.laneTarget20||1);
  if(!adjacentLaneClear20(c,target)){c.laneCooldown20=now+1.5;return;}
  c.laneTarget20=target;c.laneSide20=target;c.laneCooldown20=now+6;
}
if(typeof trafficFactor16==='function'){
  trafficFactor16=function(c){
    ensureLane20(c);
    const spacing=laneSpacing20(c);
    const signal=(typeof intersectionFactor19==='function')?intersectionFactor19(c):1;
    if(spacing<=.30)tryLaneChange20(c);
    return Math.min(spacing,signal);
  };
}

function signalFactorAny20(c){
  if(!c)return 1;
  const fx=Math.sin(c.rot),fy=-Math.cos(c.rot),horizontal=Math.abs(fx)>=Math.abs(fy),sx=-fy,sy=fx;
  let nearest=Infinity,ix=0,iy=0;
  for(const x of ROAD_X)for(const y of ROAD_Y){
    const dx=x-c.x,dy=y-c.y,along=dx*fx+dy*fy,lateral=Math.abs(dx*sx+dy*sy);
    if(along<26||along>155||lateral>78)continue;
    if(along<nearest){nearest=along;ix=x;iy=y;}
  }
  if(!Number.isFinite(nearest))return 1;
  const p=signalPhase19(ix,iy),green=horizontal?p.h:p.v;
  if(green)return 1;
  if(nearest<58)return .06;
  if(nearest<88)return .22;
  if(nearest<120)return .48;
  return .72;
}
function coordinatePolice20(){
  for(const p of police){
    if(!p)continue;
    if(wanted>=3){p.signalBrake20=false;continue;}
    const factor=signalFactorAny20(p);
    p.signalBrake20=factor<.72;
    if(factor<1)p.speed=Math.min(p.speed,p.max*Math.max(factor,.08));
  }
}
function redViolation20(c){
  if(!c||Math.abs(c.speed||0)<95)return false;
  return signalFactorAny20(c)<=.22 && distanceToIntersection20(c)<72;
}

try{
  const raw20=localStorage.getItem(SAVE_KEY);
  if(raw20){
    const saved20=JSON.parse(raw20);
    if(levelComplete&&Number(saved20.campaignIndex)===9)campaignIndex=9;
  }
}catch(e){console.warn('Build 20 saved mission restore failed',e);}

const startMission20Base=startMission;
startMission=function(){
  const m=mission();
  if(m.id!=='green_wave')return startMission20Base();
  missionTimer=m.time||0;chainIndex=0;chainPoints=m.checkpoints||[];
  greenWaveBonus20=true;missionState='chain_steal';spawnMissionCar(m);
  statusMessage='GREEN WAVE — STEAL THE GREEN COURIER';statusTimer=2.4;
  if(typeof sfxAccept14==='function')sfxAccept14();
  if(typeof banner15==='function')banner15('GREEN WAVE','CLEAN BONUS ACTIVE');
};

const completeMission20Base=completeMission;
completeMission=function(){
  const m=mission();
  if(m.id!=='green_wave')return completeMission20Base();
  const bonus=greenWaveBonus20?(m.bonus||2500):0;
  const reward=(m.reward+bonus)*multiplier,clean=greenWaveBonus20;
  score+=reward;multiplier=Math.min(multiplier+1,5);
  missionCar=null;missionTimer=0;chainIndex=0;chainPoints=[];greenWaveBonus20=true;
  campaignIndex=0;missionState='cooldown';missionCooldown=3;
  statusMessage=`GREEN WAVE COMPLETE${clean?' + CLEAN BONUS':''} +${reward}`;statusTimer=3.4;
  saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();
  if(typeof banner15==='function')banner15('GREEN WAVE',clean?'CLEAN BONUS':'MISSION COMPLETE');
};

const failMission20Base=failMission;
failMission=function(msg){greenWaveBonus20=true;return failMission20Base(msg);};

const missionText20Base=missionText;
missionText=function(){
  if(mission().id==='green_wave'){
    const time=mission().time?` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`:'';
    if(missionState==='chain_steal')return `STEAL THE GREEN COURIER · BONUS +${mission().bonus||2500}${time}`;
    if(missionState==='chain_drive')return `GREEN STOP ${Math.min(chainIndex+1,chainPoints.length)}/${chainPoints.length} · ${greenWaveBonus20?'BONUS CLEAN':'BONUS LOST'}${time}`;
  }
  return missionText20Base();
};

const showUnlock20Base=showUnlock;
showUnlock=function(){
  showUnlock20Base();
  const el=document.getElementById('build9-unlock');
  if(el)el.innerHTML=el.innerHTML
    .replace('6 POST-CLEAR JOBS UNLOCKED','7 POST-CLEAR JOBS UNLOCKED')
    .replace('HARBOR EAST + 6 POST-CLEAR JOBS UNLOCKED','HARBOR EAST + 7 POST-CLEAR JOBS UNLOCKED');
};

const openMissionMenu20Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu20Base();
  const menu=document.getElementById('build11-missions');
  if(!menu)return;
  menu.innerHTML=menu.innerHTML
    .replace(/BUILD (11|12|13|14|15|16|17|18|19)/g,'BUILD 20')
    .replace('Keys 1–9 select','Keys 1–9, 0 select');
  const green=menu.querySelector('[data-mission="9"]');
  if(green){
    const ok=!green.disabled;
    green.innerHTML=`<b>10. GREEN WAVE</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">Signal run + clean bonus · base 7000 · bonus 2500</span>`;
  }
  menu.querySelectorAll('[data-mission]').forEach(b=>{
    const clone=b.cloneNode(true);b.replaceWith(clone);
    clone.addEventListener('click',()=>selectMission(Number(clone.dataset.mission)));
  });
};
addEventListener('keydown',e=>{
  if(missionMenuOpen&&e.code==='Digit0'&&!e.repeat){e.preventDefault();selectMission(9);}
});

const update20Base=update;
update=function(dt){
  updateLaneRoutes20(dt);
  update20Base(dt);
  coordinatePolice20();

  if(mission().id==='green_wave'&&missionState==='chain_drive'&&greenWaveBonus20&&inVehicle&&currentCar===missionCar){
    if(redViolation20(missionCar)){
      greenWaveBonus20=false;
      statusMessage='BONUS LOST — RED LIGHT VIOLATION';statusTimer=2.2;
      if(typeof banner15==='function')banner15('BONUS LOST','RED LIGHT');
    }
  }

  const bar=document.getElementById('build14-drive');
  if(bar){
    bar.textContent=bar.textContent.replace('BUILD 19','BUILD 20').replace('BUILD 18','BUILD 20');
    if(!bar.textContent.includes('LANES'))bar.textContent+=' · LANES + SIGNALS';
  }
};

const front20=document.getElementById('build11-front');
if(front20){
  front20.innerHTML=front20.innerHTML
    .replace(/BUILD 19/g,'BUILD 20')
    .replace('Signals + Harbor traffic online','Lane intelligence + bonus jobs online');
  const bold20=front20.querySelectorAll('b');
  if(bold20.length>1)bold20[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;
}
if(typeof banner15==='function')banner15('LANE INTELLIGENCE ONLINE','BUILD 20');
}
