const startMissionCore28=startMission;startMission=function(){
  const m=mission();missionTimer=m.time||0;
  if(m.type==='steal_deliver'){missionState='steal';spawnMissionCar(m);statusMessage=`${m.title} — STEAL THE MARKED CAR`;}
  else if(m.type==='destroy_target'){missionState='destroy';spawnMissionCar(m);pistolOwned=true;pistolAmmo=Math.max(pistolAmmo,m.ammo||10);statusMessage=`${m.title} — DESTROY THE MARKED CAR`;}
  else if(m.type==='lose_wanted'){missionState='escape';wantedAtLeast(m.wanted||3);statusMessage=`${m.title} — LOSE THE COPS`;}
  else if(m.type==='checkpoint_run'){missionState='chain_steal';chainIndex=0;chainPoints=m.checkpoints||[];spawnMissionCar(m);statusMessage=`${m.title} — STEAL THE GREEN COURIER CAR`;}
  else if(m.type==='mixed_run'){missionState='mixed_steal';spawnMissionCar(m);statusMessage=`${m.title} — STEAL THE PURPLE GETAWAY CAR`;}
  else return startMissionCore28();
  statusTimer=2.4;
};
function completeCoreMission28(){
  const m=mission(),completedId=m.id,reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);missionCar=null;missionTimer=0;chainIndex=0;chainPoints=[];
  if(completedId==='clean_break'){
    const firstClear=!levelComplete&&score>=LEVEL_TARGET;if(score>=LEVEL_TARGET){levelComplete=true;sectorUnlocked=true;}campaignIndex=0;missionState='campaign_complete';missionCooldown=5;statusMessage=`CORE CAMPAIGN COMPLETE +${reward}${levelComplete?' — LEVEL CLEARED':' — REACH 5000'}`;statusTimer=4;justUnlocked=firstClear;saveProgress();if(firstClear)showUnlock();
  }else if(completedId==='crosstown'||completedId==='dead_drop'){
    campaignIndex=0;missionState='cooldown';missionCooldown=3;statusMessage=`${m.title} COMPLETE +${reward}`;statusTimer=3;saveProgress();
  }else{
    campaignIndex=Math.min(campaignIndex+1,2);missionState='cooldown';missionCooldown=3;statusMessage=`MISSION COMPLETE +${reward} — NEXT: ${mission().title}`;statusTimer=3;saveProgress();
  }
}
completeMission=function(){completeCoreMission28();};
failMission=function(msg){missionState='cooldown';missionCooldown=3;missionTimer=0;missionCar=null;chainIndex=0;chainPoints=[];statusMessage=msg;statusTimer=2.2;};
updateMission=function(dt){
  if(missionState==='available'&&dist(player,PHONE)>58)missionMenuDismissed=false;
  if(missionCooldown>0){missionCooldown=Math.max(0,missionCooldown-dt);if(!missionCooldown){missionState='available';statusMessage='MISSION PHONE READY';statusTimer=1.2;saveProgress();}}
  if(['steal','deliver','destroy','escape','chain_steal','chain_drive','mixed_steal','mixed_drive','mixed_package','mixed_escape'].includes(missionState)&&(mission().time||0)>0){missionTimer=Math.max(0,missionTimer-dt);if(!missionTimer){failMission('MISSION FAILED — TIME EXPIRED');return;}}
  if(respawnTimer>0)return;
  if(missionState==='available'&&!inVehicle&&dist(player,PHONE)<=34){if(!missionMenuOpen&&!missionMenuDismissed)openMissionMenu();}
  else if(missionState==='steal'){if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — CAR DESTROYED');else if(inVehicle&&currentCar===missionCar){missionState='deliver';statusMessage='TARGET ACQUIRED — DELIVER THE CAR';statusTimer=2;}}
  else if(missionState==='deliver'){if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — CAR DESTROYED');else if(inVehicle&&currentCar===missionCar&&inside(missionCar,mission().delivery)&&Math.abs(missionCar.speed)<=75)completeMission();}
  else if(missionState==='destroy'){if(!missionCar)failMission('MISSION FAILED — TARGET LOST');else if(missionCar.destroyed)completeMission();}
  else if(missionState==='escape'&&wanted<=0)completeMission();
  else if(missionState==='chain_steal'){if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — COURIER CAR DESTROYED');else if(inVehicle&&currentCar===missionCar){missionState='chain_drive';statusMessage=`COURIER CAR ACQUIRED — CHECKPOINT 1/${chainPoints.length}`;statusTimer=2;}}
  else if(missionState==='chain_drive'){if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — COURIER CAR DESTROYED');else if(inVehicle&&currentCar===missionCar&&chainPoints[chainIndex]){const p=chainPoints[chainIndex],r=mission().radius||90,maxSpeed=mission().maxCheckpointSpeed||110;if(Math.hypot(missionCar.x-p[0],missionCar.y-p[1])<=r&&Math.abs(missionCar.speed)<=maxSpeed){if((mission().heat||0)>0&&chainIndex<chainPoints.length-1)raiseWanted(mission().heat);chainIndex++;if(chainIndex>=chainPoints.length)completeMission();else{statusMessage=`CHECKPOINT ${chainIndex}/${chainPoints.length} — KEEP MOVING`;statusTimer=1.8;}}}}
  else if(missionState==='mixed_steal'){if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — GETAWAY CAR DESTROYED');else if(inVehicle&&currentCar===missionCar){missionState='mixed_drive';statusMessage='CAR ACQUIRED — DRIVE TO THE PURPLE DROP LOT';statusTimer=2;}}
  else if(missionState==='mixed_drive'){const m=mission();if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — GETAWAY CAR DESTROYED');else if(inVehicle&&currentCar===missionCar&&m.drop&&inside(missionCar,m.drop)&&Math.abs(missionCar.speed)<=(m.dropSpeed||75)){missionState='mixed_package';statusMessage='PARKED — GET OUT AND GRAB THE PACKAGE';statusTimer=2.2;}}
  else if(missionState==='mixed_package'){const m=mission();if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — GETAWAY CAR DESTROYED');else if(!inVehicle&&m.package&&Math.hypot(player.x-m.package.x,player.y-m.package.y)<=34){missionState='mixed_escape';wantedAtLeast(m.wanted||3);statusMessage='PACKAGE SECURED — LOSE THE COPS';statusTimer=2.4;}}
  else if(missionState==='mixed_escape'&&wanted<=0)completeMission();
};
missionText=function(){
  const m=mission(),time=['steal','deliver','destroy','escape','chain_steal','chain_drive','mixed_steal','mixed_drive','mixed_package','mixed_escape'].includes(missionState)&&m.time?` · ${Math.ceil(missionTimer)}s`:'';
  if(missionState==='available')return`${m.title}: TOUCH BLUE PHONE`;if(missionState==='steal')return`STEAL THE MARKED CAR${time}`;if(missionState==='deliver')return`${inside(missionCar,m.delivery)?'DELIVERY BAY — SLOW BELOW 75':'DELIVER CAR TO YELLOW BAY'}${time}`;if(missionState==='destroy')return`DESTROY THE MARKED ORANGE CAR${time}`;if(missionState==='escape')return`CLEAR ALL WANTED HEADS${time}`;if(missionState==='chain_steal')return`STEAL THE GREEN COURIER CAR${time}`;if(missionState==='chain_drive')return`CHECKPOINT ${Math.min(chainIndex+1,chainPoints.length)}/${chainPoints.length} — SLOW BELOW ${m.maxCheckpointSpeed||110}${time}`;if(missionState==='mixed_steal')return`STEAL THE PURPLE GETAWAY CAR${time}`;if(missionState==='mixed_drive')return`PARK GETAWAY CAR IN PURPLE DROP LOT${time}`;if(missionState==='mixed_package')return`GET OUT — GRAB THE PACKAGE${time}`;if(missionState==='mixed_escape')return`PACKAGE SECURED — LOSE ALL HEAT${time}`;if(missionState==='campaign_complete')return levelComplete?'LEVEL COMPLETE — FULL CITY UNLOCKED':'CORE CAMPAIGN COMPLETE';return`NEXT: ${m.title}`;
};
const drawMissionCore28=drawMission;drawMission=function(){
  drawMissionCore28();const pulse=1+Math.sin(performance.now()/180)*.08,m=mission();
  if(missionState==='chain_drive'&&chainPoints[chainIndex]){const cp=chainPoints[chainIndex];ctx.strokeStyle='#4ff2e8';ctx.lineWidth=5;ctx.beginPath();ctx.arc(cp[0],cp[1],58*pulse,0,Math.PI*2);ctx.stroke();}
  if(missionState==='mixed_drive'&&m.drop){ctx.fillStyle='rgba(149,100,244,.18)';ctx.fillRect(m.drop.x,m.drop.y,m.drop.w,m.drop.h);ctx.strokeStyle='#b793ff';ctx.lineWidth=5;ctx.strokeRect(m.drop.x,m.drop.y,m.drop.w,m.drop.h);}
  if(missionState==='mixed_package'&&m.package){ctx.strokeStyle='#ffda4c';ctx.lineWidth=4;ctx.beginPath();ctx.arc(m.package.x,m.package.y,34*pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f2c94c';ctx.fillRect(m.package.x-9,m.package.y-7,18,14);}
};

const updateHudCore28=updateHud;updateHud=function(){updateHudCore28();if(detailEl)detailEl.textContent+=`\nPROGRESS ${levelComplete?'LEVEL CLEARED · FULL CITY UNLOCKED':'AUTO-SAVED'}`;};
const resetCore28Base=reset;reset=function(){chainIndex=0;chainPoints=[];missionMenuOpen=false;missionMenuDismissed=false;resetCore28Base();loadProgress();};

addEventListener('keydown',e=>{
  if(e.code==='KeyM'&&!e.repeat){minimapVisible=!minimapVisible;drawMinimap();}
  if(e.code==='KeyR'&&!e.repeat&&e.shiftKey){clearProgress();}
  if(missionMenuOpen){if(e.code==='Escape'){e.preventDefault();closeMissionMenu(true);}const n={'Digit1':0,'Digit2':1,'Digit3':2,'Digit4':3,'Digit5':4}[e.code];if(n!==undefined){e.preventDefault();selectMission(n);}}
});
const updateCore28Base=update;update=function(dt){updateCore28Base(dt);areaBadge();drawMinimap();};

loadProgress();progressBadge();areaBadge();ensureMinimap();drawMinimap();showFrontEnd();
