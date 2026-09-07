if (!window.__gtaBuild19Traffic) {
window.__gtaBuild19Traffic = true;

const NIGHT_SHIFT19 = {
  id:'night_shift', title:'NIGHT SHIFT', type:'checkpoint_run',
  spawn:{x:4700,y:-1200}, time:110, reward:6500, color:'#ebc72a',
  checkpoints:[[3200,0],[4100,650],[5000,1200],[4100,1200]],
  radius:95, maxCheckpointSpeed:115, heat:1
};
if (!CAMPAIGN.some(m=>m.id==='night_shift')) CAMPAIGN.push(NIGHT_SHIFT19);

function signalPhase19(x,y) {
  const phase=(performance.now()/1000 + Math.abs(x*.003+y*.005))%12;
  return {h:phase<5,v:phase>=6&&phase<11};
}
function intersectionFactor19(c) {
  if(!c||!c.ai||c.destroyed) return 1;
  const fx=Math.sin(c.rot),fy=-Math.cos(c.rot),horizontal=Math.abs(fx)>=Math.abs(fy);
  const sx=-fy,sy=fx;
  let nearest=Infinity,ix=0,iy=0;
  for(const x of ROAD_X) for(const y of ROAD_Y) {
    const dx=x-c.x,dy=y-c.y,along=dx*fx+dy*fy,lateral=Math.abs(dx*sx+dy*sy);
    if(along<26||along>155||lateral>78) continue;
    if(along<nearest){nearest=along;ix=x;iy=y;}
  }
  if(!Number.isFinite(nearest)) return 1;
  const phase=signalPhase19(ix,iy),green=horizontal?phase.h:phase.v;
  if(green) return 1;
  if(nearest<58) return .06;
  if(nearest<88) return .22;
  if(nearest<120) return .48;
  return .72;
}
if(typeof trafficFactor16==='function'){
  const trafficFactor19Base=trafficFactor16;
  trafficFactor16=function(c){
    const factor=Math.min(trafficFactor19Base(c),intersectionFactor19(c));
    if(c)c.signalBrake19=factor<.72;
    return factor;
  };
}

const draw19Base=draw;
draw=function(){
  draw19Base();
  const pt=playerTarget();
  ctx.save();
  ctx.translate(W/2,H/2);
  ctx.scale(camera.zoom,camera.zoom);
  ctx.translate(-camera.x,-camera.y);
  for(const x of ROAD_X) for(const y of ROAD_Y){
    if(pt&&Math.hypot(x-pt.x,y-pt.y)>900) continue;
    const p=signalPhase19(x,y);
    ctx.fillStyle=p.h?'#35dc67':'#ef3636';
    ctx.beginPath();ctx.arc(x-22,y-22,5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+22,y+22,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=p.v?'#35dc67':'#ef3636';
    ctx.beginPath();ctx.arc(x+22,y-22,5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x-22,y+22,5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};

const startMission19Base=startMission;
startMission=function(){
  const m=mission();
  if(m.id!=='night_shift') return startMission19Base();
  missionTimer=m.time||0;
  chainIndex=0;
  chainPoints=m.checkpoints||[];
  missionState='chain_steal';
  spawnMissionCar(m);
  statusMessage='NIGHT SHIFT — STEAL THE YELLOW DOCK VAN';
  statusTimer=2.4;
  if(typeof sfxAccept14==='function')sfxAccept14();
  if(typeof banner15==='function')banner15('NIGHT SHIFT','MISSION STARTED');
};

const completeMission19Base=completeMission;
completeMission=function(){
  const m=mission();
  if(m.id!=='night_shift') return completeMission19Base();
  const reward=m.reward*multiplier;
  score+=reward; multiplier=Math.min(multiplier+1,5);
  missionCar=null; missionTimer=0; chainIndex=0; chainPoints=[];
  campaignIndex=0; missionState='cooldown'; missionCooldown=3;
  statusMessage=`NIGHT SHIFT COMPLETE — DOCKLANDS CLEARED +${reward}`;
  statusTimer=3.2; saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();
  if(typeof banner15==='function')banner15('NIGHT SHIFT','DOCKLANDS CLEARED');
};

const missionText19Base=missionText;
missionText=function(){
  if(mission().id==='night_shift'){
    const time=mission().time?` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`:'';
    if(missionState==='chain_steal')return `STEAL THE YELLOW DOCK VAN${time}`;
    if(missionState==='chain_drive')return `DOCK STOP ${Math.min(chainIndex+1,chainPoints.length)}/${chainPoints.length} — SLOW BELOW ${mission().maxCheckpointSpeed||115}${time}`;
  }
  return missionText19Base();
};

const showUnlock19Base=showUnlock;
showUnlock=function(){
  showUnlock19Base();
  const el=document.getElementById('build9-unlock');
  if(el)el.innerHTML=el.innerHTML
    .replace('5 POST-CLEAR JOBS UNLOCKED','6 POST-CLEAR JOBS UNLOCKED')
    .replace('HARBOR EAST + 5 POST-CLEAR JOBS UNLOCKED','HARBOR EAST + 6 POST-CLEAR JOBS UNLOCKED');
};

const openMissionMenu19Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu19Base();
  const menu=document.getElementById('build11-missions');
  if(!menu)return;
  menu.innerHTML=menu.innerHTML
    .replace(/BUILD (11|12|13|14|15|16|17|18)/g,'BUILD 19')
    .replace('Keys 1–8 select','Keys 1–9 select');
  menu.querySelectorAll('[data-mission]').forEach(b=>{
    const clone=b.cloneNode(true); b.replaceWith(clone);
    clone.addEventListener('click',()=>selectMission(Number(clone.dataset.mission)));
  });
};
addEventListener('keydown',e=>{
  if(missionMenuOpen&&e.code==='Digit9'&&!e.repeat){e.preventDefault();selectMission(8);}
});

const update19Base=update;
update=function(dt){
  update19Base(dt);
  const bar=document.getElementById('build14-drive');
  if(bar){
    bar.textContent=bar.textContent.replace('BUILD 18','BUILD 19').replace('BUILD 17','BUILD 19');
    if(!bar.textContent.includes('SIGNALS'))bar.textContent+=' · SIGNALS ACTIVE';
  }
};

const front19=document.getElementById('build11-front');
if(front19){
  front19.innerHTML=front19.innerHTML
    .replace(/BUILD 18/g,'BUILD 19')
    .replace('Harbor East expansion online','Signals + Harbor traffic online');
  const bold19=front19.querySelectorAll('b');
  if(bold19.length>1)bold19[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;
}
if(typeof banner15==='function')banner15('TRAFFIC SIGNALS ONLINE','BUILD 19');
}
