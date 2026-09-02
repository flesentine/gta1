if (!window.__gtaBuild18Sector) {
window.__gtaBuild18Sector = true;

const HARBOR18 = window.__harbor18Data;
const EASTBOUND18 = {
  id:'eastbound', title:'EASTBOUND', type:'checkpoint_run',
  spawn:{x:2280,y:-1200}, time:95, reward:5500, color:'#299eea',
  checkpoints:[[3200,-650],[4100,0],[5000,650]],
  radius:95, maxCheckpointSpeed:120, heat:1
};
if (!CAMPAIGN.some(m=>m.id==='eastbound')) CAMPAIGN.push(EASTBOUND18);

let harborTrafficSerial18 = 0;

function rect18(r){ return {x:r[0],y:r[1],w:r[2],h:r[3]}; }
function installHarbor18(data) {
  if (!data || data.__installed18) return;
  data.__installed18 = true;

  const w=data.world||[2800,-1700,2600,3400];
  const endX=w[0]+w[2], endY=w[1]+w[3];
  WORLD.x=Math.min(WORLD.x,w[0]);
  WORLD.y=Math.min(WORLD.y,w[1]);
  WORLD.w=Math.max(WORLD.w,endX-WORLD.x);
  WORLD.h=Math.max(WORLD.h,endY-WORLD.y);

  for(const x of (data.road_x||[])) if(!ROAD_X.includes(x)) ROAD_X.push(x);
  for(const r of (data.buildings||[])) buildings.push(rect18(r));
  for(const r of (data.parking_lots||[])) PARKING_LOTS.push(rect18(r));
  for(const r of (data.alleys||[])) ALLEYS.push(rect18(r));
  for(const d of (data.districts||[])) DISTRICTS.push(d);
  for(const r of (data.traffic_routes||[])) routes.push(r);
  for(const r of (data.pedestrian_routes||[])) sidewalkRoutes.push(r);
}

function spawnHarborPopulation18(data) {
  if(!data) return;
  const colors=['#2f8fd2','#dfa034','#3fb174','#a94db5','#d3d4cf','#34363b','#d35439','#4ba5b5'];
  const localRoutes=data.traffic_routes||[];
  for(const sp of (data.traffic_spawns||[])){
    const r=localRoutes[sp[0]];
    if(!r||r.length<2) continue;
    const idx=((sp[1]||0)%r.length+r.length)%r.length;
    const n=(idx+1)%r.length,p=r[idx],q=r[n];
    const rot=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;
    const c=car(p[0],p[1],rot,colors[harborTrafficSerial18%colors.length],true,r,n,190+(harborTrafficSerial18%4)*17);
    c._harbor18=true;
    cars.push(c);
    harborTrafficSerial18++;
  }
  const localPeds=data.pedestrian_routes||[];
  localPeds.forEach((r,i)=>{
    if(!r||r.length<2) return;
    const p=ped(r,i%r.length,pedColors[i%pedColors.length],80+i);
    p._harbor18=true;
    peds.push(p);
  });
}

installHarbor18(HARBOR18);
spawnHarborPopulation18(HARBOR18);

try {
  const raw18=localStorage.getItem(SAVE_KEY);
  if(raw18){
    const saved18=JSON.parse(raw18);
    if(levelComplete && Number(saved18.campaignIndex)===7) campaignIndex=7;
  }
} catch(e) {
  console.warn('Build 18 saved mission restore failed',e);
}

const districtName18Base=districtName;
districtName=function(){
  const p=playerTarget();
  if(p.x>=2800) return p.y>500?'DOCKLANDS':'HARBOR EAST';
  return districtName18Base();
};

const showUnlock18Base=showUnlock;
showUnlock=function(){
  showUnlock18Base();
  const el=document.getElementById('build9-unlock');
  if(el){
    el.innerHTML=el.innerHTML
      .replace('4 POST-CLEAR JOBS UNLOCKED','5 POST-CLEAR JOBS UNLOCKED')
      .replace('DOWNTOWN + 4 POST-CLEAR JOBS UNLOCKED','HARBOR EAST + 5 POST-CLEAR JOBS UNLOCKED')
      .replace('DOWNTOWN + 3 POST-CLEAR JOBS UNLOCKED','HARBOR EAST + 5 POST-CLEAR JOBS UNLOCKED');
  }
};

const startMission18Base=startMission;
startMission=function(){
  const m=mission();
  if(m.id!=='eastbound') return startMission18Base();
  missionTimer=m.time||0;
  chainIndex=0;
  chainPoints=m.checkpoints||[];
  missionState='chain_steal';
  spawnMissionCar(m);
  statusMessage='EASTBOUND — STEAL THE BLUE HARBOR CAR';
  statusTimer=2.4;
  if(typeof sfxAccept14==='function') sfxAccept14();
  if(typeof banner15==='function') banner15('EASTBOUND','MISSION STARTED');
};

const completeMission18Base=completeMission;
completeMission=function(){
  const m=mission();
  if(m.id!=='eastbound') return completeMission18Base();
  const reward=m.reward*multiplier;
  score+=reward;
  multiplier=Math.min(multiplier+1,5);
  missionCar=null;
  missionTimer=0;
  chainIndex=0;
  chainPoints=[];
  campaignIndex=0;
  missionState='cooldown';
  missionCooldown=3;
  statusMessage=`EASTBOUND COMPLETE — HARBOR EAST REACHED +${reward}`;
  statusTimer=3.2;
  saveProgress();
  if(typeof sfxMission14==='function') sfxMission14();
  if(typeof banner15==='function') banner15('EASTBOUND','HARBOR EAST REACHED');
};

const missionText18Base=missionText;
missionText=function(){
  if(mission().id==='eastbound'){
    const time=mission().time?` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`:'';
    if(missionState==='chain_steal') return `STEAL THE BLUE HARBOR CAR${time}`;
    if(missionState==='chain_drive') return `HARBOR CHECKPOINT ${Math.min(chainIndex+1,chainPoints.length)}/${chainPoints.length} — SLOW BELOW ${mission().maxCheckpointSpeed||120}${time}`;
  }
  return missionText18Base();
};

const openMissionMenu18Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu18Base();
  const menu=document.getElementById('build11-missions');
  if(!menu) return;
  menu.innerHTML=menu.innerHTML
    .replace(/BUILD (11|12|13|14|15|16|17)/g,'BUILD 18')
    .replace('Keys 1–7 select','Keys 1–8 select');
  menu.querySelectorAll('[data-mission]').forEach(b=>{
    const clone=b.cloneNode(true);
    b.replaceWith(clone);
    clone.addEventListener('click',()=>selectMission(Number(clone.dataset.mission)));
  });
};

addEventListener('keydown',e=>{
  if(missionMenuOpen && e.code==='Digit8' && !e.repeat){
    e.preventDefault();
    selectMission(7);
  }
});

const reset18Base=reset;
reset=function(){
  harborTrafficSerial18=0;
  reset18Base();
  spawnHarborPopulation18(HARBOR18);
};

const update18Base=update;
update=function(dt){
  update18Base(dt);
  const bar=document.getElementById('build14-drive');
  if(bar) bar.textContent=bar.textContent.replace('BUILD 17','BUILD 18').replace('BUILD 16','BUILD 18');
};

const front18=document.getElementById('build11-front');
if(front18){
  front18.innerHTML=front18.innerHTML
    .replace(/BUILD 17/g,'BUILD 18')
    .replace('Branching missions online','Harbor East expansion online');
  const bold18=front18.querySelectorAll('b');
  if(bold18.length>1) bold18[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;
}

if(typeof banner15==='function') banner15('HARBOR EAST OPEN','BUILD 18');
}
