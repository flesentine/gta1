try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const s=JSON.parse(raw);if(levelComplete&&Number(s.campaignIndex)===16)campaignIndex=16;}}catch(e){console.warn('Build 28 mission restore failed',e);}

const navTarget28Base=navTarget;
navTarget=function(){
  if(mission().id==='three_fronts'){
    if(missionState==='front_armory')return{x:mission().armory.x,y:mission().armory.y,label:'HARBOR ARMORY'};
    if(missionState==='front_target'&&frontTarget28)return{x:frontTarget28.x,y:frontTarget28.y,label:`FRONT ${frontStage28+1}/3 TARGET`};
    if(missionState==='front_escape')return{x:RESPRAY.x+RESPRAY.w/2,y:RESPRAY.y+RESPRAY.h/2,label:'LOSE HEAT'};
  }
  return navTarget28Base();
};
const startMission28Base=startMission;
startMission=function(){
  const m=mission();if(m.id!=='three_fronts')return startMission28Base();
  cleanFrontTarget28();frontStage28=0;missionTimer=m.time||0;missionState='front_armory';statusMessage='THREE FRONTS — REACH HARBOR EAST ARMORY';statusTimer=2.6;
  if(typeof sfxAccept14==='function')sfxAccept14();if(typeof banner15==='function')banner15('THREE FRONTS','HARBOR → CENTRAL → WEST RIDGE');
};
const completeMission28Base=completeMission;
completeMission=function(){
  const m=mission();if(m.id!=='three_fronts')return completeMission28Base();
  const reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);cleanFrontTarget28();missionTimer=0;campaignIndex=0;missionState='cooldown';missionCooldown=3.6;statusMessage=`THREE FRONTS COMPLETE — CITY RUN +${reward}`;statusTimer=3.8;saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();if(typeof banner15==='function')banner15('THREE FRONTS COMPLETE','ALL SECTORS CLEARED');
};
const failMission28Base=failMission;
failMission=function(msg){if(mission().id==='three_fronts')cleanFrontTarget28();return failMission28Base(msg);};
const loseLife28Base=loseLife;
loseLife=function(reason){const was=frontActive28();const before=lives;const result=loseLife28Base(reason);if(was&&lives<before)failMission('MISSION FAILED — LOST A LIFE');return result;};

const missionText28Base=missionText;
missionText=function(){
  if(mission().id==='three_fronts'){
    const t=` · TIME ${String(Math.ceil(missionTimer)).padStart(3,'0')}`;
    if(missionState==='front_armory')return`1/5 REACH HARBOR EAST ARMORY${t}`;
    if(missionState==='front_target')return`${frontStage28+2}/5 CLEAR ${['HARBOR','CENTRAL','WEST RIDGE'][frontStage28]} TARGET · ${weaponText28()}${t}`;
    if(missionState==='front_escape')return`5/5 FOUR-HEAD ESCAPE — LOSE THE COPS${t}`;
  }
  return missionText28Base();
};

const showUnlock28Base=showUnlock;
showUnlock=function(){showUnlock28Base();const el=document.getElementById('build9-unlock');if(el)el.innerHTML=el.innerHTML.replace('13 POST-CLEAR JOBS UNLOCKED','14 POST-CLEAR JOBS UNLOCKED');};
const openMissionMenu28Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu28Base();const menu=document.getElementById('build11-missions');if(!menu)return;
  menu.innerHTML=menu.innerHTML.replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27)/g,'BUILD 28');
  const b=menu.querySelector('[data-mission="16"]');if(b){const ok=!b.disabled;b.innerHTML=`<b>17. THREE FRONTS</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">SMG · Harbor → Central → West Ridge · 4-head escape · base 15000</span>`;}
  const help=menu.querySelector('div > div:last-child');if(help&&help.textContent.includes('Keys'))help.textContent='Keys 1–9 / 0 / - / = / ] / [ / \\ / / / . select · Esc closes';
  menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});
};
addEventListener('keydown',e=>{if(missionMenuOpen&&e.code==='Period'&&!e.repeat){e.preventDefault();selectMission(16);}});

const reset28Base=reset;
reset=function(){smgOwned28=false;smgAmmo28=0;frontStage28=0;cleanFrontTarget28();reset28Base();installSmgPickups28();};
installSmgPickups28();

const draw28Base=draw;
draw=function(){
  draw28Base();if(mission().id!=='three_fronts')return;const now=performance.now()/1000;ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  if(missionState==='front_armory'){
    const a=mission().armory;ctx.strokeStyle='#62e7ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(a.x,a.y,48+Math.sin(now*5)*5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#62e7ff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('HARBOR ARMORY',a.x,a.y-62);
  }else if(missionState==='front_target'&&frontTarget28&&!frontTargetDown28()){
    ctx.strokeStyle=['#ff5545','#ffc34b','#c875ff'][frontStage28];ctx.lineWidth=5;ctx.beginPath();ctx.arc(frontTarget28.x,frontTarget28.y,40+Math.sin(now*6)*4,0,Math.PI*2);ctx.stroke();ctx.font='bold 10px monospace';ctx.fillStyle=ctx.strokeStyle;ctx.textAlign='center';ctx.fillText(`${['HARBOR','CENTRAL','WEST RIDGE'][frontStage28]} TARGET`,frontTarget28.x,frontTarget28.y-52);
  }
  ctx.restore();
};

const update28Base=update;
update=function(dt){
  update28Base(dt);
  if(frontActive28()&&respawnTimer<=0&&missionTimer>0){missionTimer=Math.max(0,missionTimer-dt);if(missionTimer<=0){failMission('MISSION FAILED — TIME EXPIRED');return;}}
  if(mission().id==='three_fronts'){
    const m=mission();
    if(missionState==='front_armory'&&!inVehicle&&Math.hypot(player.x-m.armory.x,player.y-m.armory.y)<=48){
      grantSmg28(m.smgAmmo||90);spawnFrontTarget28(0);wantedAtLeast(2);missionState='front_target';statusMessage='SMG READY — CLEAR HARBOR TARGET';statusTimer=2.4;
    }else if(missionState==='front_target'&&frontTargetDown28()){
      if(frontTarget28){frontTarget28.dead=99999;frontTarget28.frontDown28=true;}cleanFrontTarget28();frontStage28++;
      if(frontStage28>=3){wantedAtLeast(m.escapeWanted||4);missionState='front_escape';statusMessage='ALL FRONTS DOWN — FOUR-HEAD ESCAPE';statusTimer=2.6;if(typeof banner15==='function')banner15('ALL FRONTS CLEARED','LOSE THE COPS');}
      else{wantedAtLeast(Math.min(4,2+frontStage28));spawnFrontTarget28(frontStage28);statusMessage=`NEXT FRONT — ${['HARBOR','CENTRAL','WEST RIDGE'][frontStage28]}`;statusTimer=2.2;if(typeof banner15==='function')banner15('MOVE TO NEXT FRONT',`${frontStage28+1}/3`);}
    }else if(missionState==='front_escape'&&wanted<=0)completeMission();
  }
  const bar=document.getElementById('build14-drive');if(bar){bar.textContent=bar.textContent.replace('BUILD 27','BUILD 28');if(!inVehicle){bar.textContent=bar.textContent.replace(/ON FOOT\s+·\s+(SHOTGUN \d+|PISTOL \d+|SMG \d+|UNARMED)/,`ON FOOT  ·  ${weaponText28()}`);if((shotgunOwned27||smgOwned28)&&!bar.textContent.includes('Q SWITCH'))bar.textContent+=' · Q SWITCH';}}
  if(detailEl&&!inVehicle)detailEl.textContent=detailEl.textContent.replace(/(?:SHOTGUN|PISTOL|SMG) (?:--|\d{1,3})/,weaponText28());
};
const front28=document.getElementById('build11-front');if(front28){front28.innerHTML=front28.innerHTML.replace(/BUILD 27/g,'BUILD 28').replace('Shotgun combat + direct manifest boot online','Flat core + SMG cross-sector combat online');const bold=front28.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;}
if(typeof banner15==='function')banner15('FLAT CORE + SMG ONLINE','BUILD 28');
