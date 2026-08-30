if (!window.__gtaBuild25WestRidge) {
window.__gtaBuild25WestRidge = true;

const WEST25=window.__west25Data;
const AIRMAIL25={
  id:'airmail',title:'AIRMAIL',type:'cross_sector_delivery',
  spawn:{x:5000,y:-1200},time:150,reward:11500,color:'#f0f0e8',
  checkpoints:[[1800,0],[-900,650],[-3200,-650],[-4100,0]],
  radius:105,maxCheckpointSpeed:125,heat:1,
  finalDelivery:{x:-5280,y:1120,w:520,h:150},finalSpeed:85
};
if(!CAMPAIGN.some(m=>m.id==='airmail'))CAMPAIGN.push(AIRMAIL25);

let westTrafficSerial25=0;
let airmailPoints25=[];
let airmailIndex25=0;

function rect25(r){return{x:r[0],y:r[1],w:r[2],h:r[3]};}
function installWest25(data){
  if(!data||data.__installed25)return;
  data.__installed25=true;
  const w=data.world||[-5400,-1700,3000,3400];
  const oldRight=WORLD.x+WORLD.w,oldBottom=WORLD.y+WORLD.h;
  const newLeft=Math.min(WORLD.x,w[0]),newTop=Math.min(WORLD.y,w[1]);
  const newRight=Math.max(oldRight,w[0]+w[2]),newBottom=Math.max(oldBottom,w[1]+w[3]);
  WORLD.x=newLeft;WORLD.y=newTop;WORLD.w=newRight-newLeft;WORLD.h=newBottom-newTop;
  for(const x of(data.road_x||[]))if(!ROAD_X.includes(x))ROAD_X.push(x);
  ROAD_X.sort((a,b)=>a-b);
  for(const r of(data.buildings||[]))buildings.push(rect25(r));
  for(const r of(data.parking_lots||[]))PARKING_LOTS.push(rect25(r));
  for(const r of(data.alleys||[]))ALLEYS.push(rect25(r));
  for(const d of(data.districts||[]))DISTRICTS.push(d);
  for(const r of(data.traffic_routes||[]))routes.push(r);
  for(const r of(data.pedestrian_routes||[]))sidewalkRoutes.push(r);
}
function spawnWestPopulation25(data){
  if(!data)return;
  const colors=['#5d7ea8','#d6a13d','#5aaf74','#a65b8f','#cfd2d4','#34383d','#bd5941','#649ca9'];
  const localRoutes=data.traffic_routes||[];
  for(const sp of(data.traffic_spawns||[])){
    const r=localRoutes[sp[0]];if(!r||r.length<2)continue;
    const idx=((sp[1]||0)%r.length+r.length)%r.length,n=(idx+1)%r.length,p=r[idx],q=r[n];
    const rot=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;
    const c=car(p[0],p[1],rot,colors[westTrafficSerial25%colors.length],true,r,n,188+(westTrafficSerial25%4)*18);
    c._west25=true;cars.push(c);westTrafficSerial25++;
  }
  const localPeds=data.pedestrian_routes||[];
  localPeds.forEach((r,i)=>{if(!r||r.length<2)return;const p=ped(r,i%r.length,pedColors[(i+3)%pedColors.length],120+i);p._west25=true;peds.push(p);});
}
installWest25(WEST25);
spawnWestPopulation25(WEST25);

try{
  const raw=localStorage.getItem(SAVE_KEY);
  if(raw){const s=JSON.parse(raw);if(levelComplete&&Number(s.campaignIndex)===13)campaignIndex=13;}
}catch(e){console.warn('Build 25 saved mission restore failed',e);}

const districtName25Base=districtName;
districtName=function(){
  const p=playerTarget();
  if(p&&p.x<=-2400)return p.y>500?'AIRFIELD':'WEST RIDGE';
  return districtName25Base();
};

function airmailActive25(){return mission().id==='airmail'&&['airmail_steal','airmail_drive','airmail_deliver'].includes(missionState);}
const startMission25Base=startMission;
startMission=function(){
  const m=mission();if(m.id!=='airmail')return startMission25Base();
  missionTimer=m.time||0;airmailPoints25=m.checkpoints||[];airmailIndex25=0;
  missionState='airmail_steal';spawnMissionCar(m);
  statusMessage='AIRMAIL — STEAL THE WHITE HARBOR COURIER';statusTimer=2.4;
  if(typeof sfxAccept14==='function')sfxAccept14();
  if(typeof banner15==='function')banner15('AIRMAIL','COAST-TO-COAST RUN');
};
const completeMission25Base=completeMission;
completeMission=function(){
  const m=mission();if(m.id!=='airmail')return completeMission25Base();
  const reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);
  missionCar=null;missionTimer=0;airmailPoints25=[];airmailIndex25=0;
  campaignIndex=0;missionState='cooldown';missionCooldown=3.3;
  statusMessage=`AIRMAIL COMPLETE — AIRFIELD DELIVERY +${reward}`;statusTimer=3.6;saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();
  if(typeof banner15==='function')banner15('AIRMAIL','WEST RIDGE REACHED');
};
const failMission25Base=failMission;
failMission=function(msg){if(mission().id==='airmail'){airmailPoints25=[];airmailIndex25=0;}return failMission25Base(msg);};
const loseLife25Base=loseLife;
loseLife=function(reason){const active=airmailActive25(),before=lives;loseLife25Base(reason);if(active&&lives<before)failMission('MISSION FAILED — LOST A LIFE');};

const missionText25Base=missionText;
missionText=function(){
  if(mission().id==='airmail'){
    const t=` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`;
    if(missionState==='airmail_steal')return `1/3 STEAL THE WHITE HARBOR COURIER${t}`;
    if(missionState==='airmail_drive')return `2/3 CROSS-CITY GATE ${Math.min(airmailIndex25+1,airmailPoints25.length)}/${airmailPoints25.length}${t}`;
    if(missionState==='airmail_deliver')return `3/3 DELIVER TO WEST RIDGE AIRFIELD${t}`;
  }
  return missionText25Base();
};

const showUnlock25Base=showUnlock;
showUnlock=function(){
  showUnlock25Base();
  const el=document.getElementById('build9-unlock');
  if(el)el.innerHTML=el.innerHTML
    .replace('HARBOR EAST + 10 POST-CLEAR JOBS UNLOCKED','WEST RIDGE + HARBOR EAST + 11 POST-CLEAR JOBS UNLOCKED')
    .replace('10 POST-CLEAR JOBS UNLOCKED','11 POST-CLEAR JOBS UNLOCKED');
};

const openMissionMenu25Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu25Base();const menu=document.getElementById('build11-missions');if(!menu)return;
  menu.innerHTML=menu.innerHTML
    .replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21|22|23|24)/g,'BUILD 25')
    .replace('Keys 1–9, 0, -, =, ] select','Keys 1–9, 0, -, =, ], [ select');
  const b=menu.querySelector('[data-mission="13"]');
  if(b){const ok=!b.disabled;b.innerHTML=`<b>14. AIRMAIL</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">Harbor East → West Ridge airfield · base 11500</span>`;}
  menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});
};
addEventListener('keydown',e=>{if(missionMenuOpen&&e.code==='BracketLeft'&&!e.repeat){e.preventDefault();selectMission(13);}});

const reset25Base=reset;
reset=function(){westTrafficSerial25=0;reset25Base();spawnWestPopulation25(WEST25);};

function drawAirfield25(){
  const rr=WEST25&&WEST25.landmarks&&WEST25.landmarks.runway_rect;
  if(!rr)return;
  ctx.save();
  ctx.fillStyle='rgba(110,120,126,.18)';ctx.fillRect(rr[0],rr[1],rr[2],rr[3]);
  ctx.strokeStyle='rgba(245,245,235,.72)';ctx.lineWidth=4;ctx.setLineDash([34,28]);
  ctx.beginPath();ctx.moveTo(rr[0]+40,rr[1]+rr[3]/2);ctx.lineTo(rr[0]+rr[2]-40,rr[1]+rr[3]/2);ctx.stroke();
  ctx.setLineDash([]);ctx.restore();
}
const draw25Base=draw;
draw=function(){
  draw25Base();const now=performance.now()/1000;
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  drawAirfield25();
  if(mission().id==='airmail'){
    const m=mission();
    if(missionState==='airmail_drive'&&airmailPoints25.length){
      const p=airmailPoints25[Math.min(airmailIndex25,airmailPoints25.length-1)];
      ctx.strokeStyle='#f5f1d5';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p[0],p[1],48+Math.sin(now*5)*5,0,Math.PI*2);ctx.stroke();
    }
    if(missionState==='airmail_deliver'){
      ctx.strokeStyle='#7fe06f';ctx.lineWidth=6;ctx.strokeRect(m.finalDelivery.x,m.finalDelivery.y,m.finalDelivery.w,m.finalDelivery.h);
    }
  }
  ctx.restore();
};

const update25Base=update;
update=function(dt){
  update25Base(dt);
  if(airmailActive25()&&respawnTimer<=0&&missionTimer>0){
    missionTimer=Math.max(0,missionTimer-dt);
    if(missionTimer<=0){failMission('MISSION FAILED — TIME EXPIRED');return;}
  }
  if(mission().id==='airmail'){
    const m=mission();
    if(missionState==='airmail_steal'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — COURIER LOST');
      else if(inVehicle&&currentCar===missionCar){missionState='airmail_drive';statusMessage='COURIER ACQUIRED — CROSS THE CITY';statusTimer=2.2;}
    }else if(missionState==='airmail_drive'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — COURIER LOST');
      else if(inVehicle&&currentCar===missionCar&&airmailIndex25<airmailPoints25.length){
        const p=airmailPoints25[airmailIndex25];
        if(Math.hypot(missionCar.x-p[0],missionCar.y-p[1])<=m.radius&&Math.abs(missionCar.speed)<=m.maxCheckpointSpeed){
          if(m.heat&&airmailIndex25<airmailPoints25.length-1)raiseWanted(m.heat);
          airmailIndex25++;
          statusMessage=`CROSS-CITY GATE ${airmailIndex25}/${airmailPoints25.length}`;statusTimer=1.5;
          if(airmailIndex25>=airmailPoints25.length){missionState='airmail_deliver';statusMessage='WEST RIDGE REACHED — DELIVER TO AIRFIELD';statusTimer=2.4;}
        }
      }
    }else if(missionState==='airmail_deliver'){
      if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — COURIER LOST');
      else if(inVehicle&&currentCar===missionCar&&inside(missionCar,m.finalDelivery)&&Math.abs(missionCar.speed)<=m.finalSpeed)completeMission();
    }
  }
  const bar=document.getElementById('build14-drive');
  if(bar){bar.textContent=bar.textContent.replace('BUILD 24','BUILD 25');if(!bar.textContent.includes('3 SECTORS'))bar.textContent+=' · 3 SECTORS';}
};
const front25=document.getElementById('build11-front');
if(front25){front25.innerHTML=front25.innerHTML.replace(/BUILD 24/g,'BUILD 25').replace('Coordinated pursuit + parallel missions online','West Ridge + Airfield expansion online');const bold=front25.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;}
if(typeof banner15==='function')banner15('WEST RIDGE OPEN','BUILD 25');
}
