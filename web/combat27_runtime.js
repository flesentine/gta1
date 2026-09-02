if (!window.__gtaBuild27Combat) {
window.__gtaBuild27Combat = true;

const RUNWAY_RAID27={
  id:'runway_raid',title:'RUNWAY RAID',type:'combat_sweep',
  time:150,reward:13500,
  armory:{x:-4100,y:1200},
  targetPositions:[[-5000,650],[-4100,0],[-3200,650]],
  targetHealth:7,shotgunShells:12,escapeWanted:4
};
if(!CAMPAIGN.some(m=>m.id==='runway_raid'))CAMPAIGN.push(RUNWAY_RAID27);

let shotgunOwned27=false;
let shotgunAmmo27=0;
let weapon27='PISTOL';
let raidTargets27=[];
let raidArmory27={x:-4100,y:1200};

function installWeaponPickups27(){
  const wanted=[
    {kind:'shotgun',x:-4100,y:1180,amount:8,t:0},
    {kind:'shells',x:-5000,y:-650,amount:5,t:1},
    {kind:'shells',x:-3200,y:1200,amount:5,t:2}
  ];
  for(const p of wanted){
    if(!pickups.some(q=>q.kind===p.kind&&Math.hypot(q.x-p.x,q.y-p.y)<3))pickups.push({...p});
  }
}
function grantShotgun27(shells=8){
  shotgunOwned27=true;
  shotgunAmmo27=Math.max(shotgunAmmo27,shells);
  weapon27='SHOTGUN';
  statusMessage=`SHOTGUN ACQUIRED — ${shotgunAmmo27} SHELLS`;statusTimer=1.8;
  if(typeof sfxPickup14==='function')sfxPickup14();
  if(typeof banner15==='function')banner15('SHOTGUN ACQUIRED','Q SWITCHES WEAPON');
}
function toggleWeapon27(){
  if(!shotgunOwned27)return;
  if(!pistolOwned){weapon27='SHOTGUN';return;}
  weapon27=weapon27==='SHOTGUN'?'PISTOL':'SHOTGUN';
  statusMessage=`WEAPON — ${weapon27}`;statusTimer=1.0;
}
addEventListener('keydown',e=>{
  if(e.code==='KeyQ'&&!e.repeat&&respawnTimer<=0){e.preventDefault();toggleWeapon27();}
});
const weaponButton27=document.getElementById('weapon');
if(weaponButton27)weaponButton27.addEventListener('pointerdown',e=>{e.preventDefault();if(respawnTimer<=0)toggleWeapon27();});

const collectPickups27Base=collectPickups;
collectPickups=function(dt){
  if(!inVehicle){
    const removed=new Set();
    for(const p of pickups){
      if((p.kind!=='shotgun'&&p.kind!=='shells')||dist(player,p)>31)continue;
      if(p.kind==='shotgun'){shotgunOwned27=true;shotgunAmmo27+=p.amount;weapon27='SHOTGUN';}
      else shotgunAmmo27+=p.amount;
      effects.push({x:p.x,y:p.y,t:.45,type:'pickup'});
      removed.add(p);
      statusMessage=p.kind==='shotgun'?`SHOTGUN ACQUIRED — ${shotgunAmmo27} SHELLS`:`SHOTGUN SHELLS +${p.amount}`;
      statusTimer=1.5;
      if(typeof sfxPickup14==='function')sfxPickup14();
    }
    if(removed.size)pickups=pickups.filter(p=>!removed.has(p));
  }
  collectPickups27Base(dt);
};

const drawPickup27Base=drawPickup;
drawPickup=function(p){
  if(p.kind!=='shotgun'&&p.kind!=='shells')return drawPickup27Base(p);
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.t*.18);
  ctx.fillStyle='#101214';ctx.fillRect(-14,-10,28,20);
  if(p.kind==='shotgun'){
    ctx.fillStyle='#d7d0b8';ctx.fillRect(-10,-3,19,5);
    ctx.fillStyle='#754b2a';ctx.fillRect(5,2,5,9);
    ctx.fillStyle='#3a4148';ctx.fillRect(-13,-2,6,4);
  }else{
    for(let i=-1;i<=1;i++){ctx.fillStyle='#c83224';ctx.fillRect(i*7-2,-6,4,12);ctx.fillStyle='#d7bd68';ctx.fillRect(i*7-2,-6,4,3);}
  }
  ctx.restore();
};

function shotgunBlast27(){
  if(inVehicle||!shotgunOwned27||shotgunAmmo27<=0||shotCooldown>0||respawnTimer>0)return;
  shotgunAmmo27--;shotCooldown=.72;
  const baseAngle=Math.atan2(player.fy,player.fx);
  const ox=player.x+player.fx*24,oy=player.y+player.fy*24;
  const spreads=[-.18,-.11,-.045,.045,.11,.18];
  const pedHits=new Map(),carHits=new Map();
  let hitPed=false;
  for(const spread of spreads){
    const a=baseAngle+spread,dx=Math.cos(a),dy=Math.sin(a),max=Math.min(330,wallDist(ox,oy,dx,dy));
    let best=max,target=null,type='';
    for(const p of peds){
      if(p.dead>0)continue;
      const h=rayCircle(ox,oy,dx,dy,p.x,p.y,14,max);
      if(h!==null&&h<best){best=h;target=p;type='ped';}
    }
    for(const c of cars){
      if(c.destroyed)continue;
      const h=rayCircle(ox,oy,dx,dy,c.x,c.y,26,max);
      if(h!==null&&h<best){best=h;target=c;type='car';}
    }
    if(type==='ped'){pedHits.set(target,(pedHits.get(target)||0)+1);hitPed=true;}
    else if(type==='car')carHits.set(target,(carHits.get(target)||0)+1);
    tracers.push({x1:ox,y1:oy,x2:ox+dx*best,y2:oy+dy*best,t:.12});
  }
  for(const [p,hits] of pedHits){
    p.hp-=hits;
    if(p.hp<=0){
      p.hp=0;p.down=0;p.panic=0;
      if(p.raidTarget27){p.dead=99999;p.raidDown27=true;}
      else p.dead=4.5;
    }else p.panic=Math.max(p.panic,2.4);
  }
  for(const [c,hits] of carHits){
    const was=c.destroyed;c.hp-=Math.min(hits,3);c.flash=.14;
    if(c.hp<=0&&!was){c.hp=0;c.destroyed=true;c.ai=false;c.speed=0;effects.push({x:c.x,y:c.y,t:.8,type:'boom'});raiseWanted();}
  }
  if(hitPed)raiseWanted();
  for(const p of peds)if(p.dead<=0&&Math.hypot(p.x-ox,p.y-oy)<=440){
    const ax=p.x-ox,ay=p.y-oy,m=Math.hypot(ax,ay)||1;p.fx=ax/m;p.fy=ay/m;p.panic=Math.max(p.panic,2.2);
  }
  shake14=Math.max(shake14,4);
  if(typeof tone14==='function'){tone14(105,.075,.15,'sawtooth');tone14(58,.14,.08,'square',.015);}
}
const shoot27Base=shoot;
shoot=function(){
  if(weapon27==='SHOTGUN'&&shotgunOwned27)return shotgunBlast27();
  return shoot27Base();
};

const loseLife27Base=loseLife;
loseLife=function(reason){
  const raidWasActive=raidActive27();
  const beforeLives=lives;
  shotgunOwned27=false;shotgunAmmo27=0;weapon27='PISTOL';
  const result=loseLife27Base(reason);
  if(raidWasActive&&lives<beforeLives)failMission('MISSION FAILED — LOST A LIFE');
  return result;
};

function cleanRaidTargets27(){
  if(!raidTargets27.length)return;
  const set=new Set(raidTargets27);
  peds=peds.filter(p=>!set.has(p));
  raidTargets27=[];
}
function spawnRaidTargets27(){
  cleanRaidTargets27();
  const colors=['#dc3b3b','#d04c26','#b6265d'];
  RUNWAY_RAID27.targetPositions.forEach((pt,i)=>{
    const x=pt[0],y=pt[1],r=[[x-70,y],[x,y-65],[x+70,y],[x,y+65]];
    const p=ped(r,0,colors[i],240+i);
    p.hp=RUNWAY_RAID27.targetHealth;p.raidTarget27=true;p.raidDown27=false;p.speed=78;p.panic=0;
    raidTargets27.push(p);peds.push(p);
  });
}
function raidAlive27(){return raidTargets27.filter(p=>p&&!p.raidDown27&&p.dead<=0).length;}
function raidActive27(){return mission().id==='runway_raid'&&['raid_armory','raid_targets','raid_escape'].includes(missionState);}

try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const s=JSON.parse(raw);if(levelComplete&&Number(s.campaignIndex)===15)campaignIndex=15;}}catch(e){console.warn('Build 27 saved mission restore failed',e);}

const startMission27Base=startMission;
startMission=function(){
  const m=mission();if(m.id!=='runway_raid')return startMission27Base();
  cleanRaidTargets27();missionTimer=m.time||0;raidArmory27={...m.armory};missionState='raid_armory';
  statusMessage='RUNWAY RAID — REACH THE AIRFIELD ARMORY';statusTimer=2.5;
  if(typeof sfxAccept14==='function')sfxAccept14();
  if(typeof banner15==='function')banner15('RUNWAY RAID','GET THE SHOTGUN');
};
const completeMission27Base=completeMission;
completeMission=function(){
  const m=mission();if(m.id!=='runway_raid')return completeMission27Base();
  const reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);
  cleanRaidTargets27();missionTimer=0;campaignIndex=0;missionState='cooldown';missionCooldown=3.4;
  statusMessage=`RUNWAY RAID COMPLETE — AIRFIELD CLEARED +${reward}`;statusTimer=3.6;saveProgress();
  if(typeof sfxMission14==='function')sfxMission14();
  if(typeof banner15==='function')banner15('RUNWAY RAID','AIRFIELD CLEARED');
};
const failMission27Base=failMission;
failMission=function(msg){if(mission().id==='runway_raid')cleanRaidTargets27();return failMission27Base(msg);};

const missionText27Base=missionText;
missionText=function(){
  if(mission().id==='runway_raid'){
    const t=` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`;
    if(missionState==='raid_armory')return `1/3 REACH AIRFIELD ARMORY${t}`;
    if(missionState==='raid_targets')return `2/3 CLEAR MARKED TARGETS — ${3-raidAlive27()}/3 · ${weapon27} ${weapon27==='SHOTGUN'?shotgunAmmo27:pistolAmmo}${t}`;
    if(missionState==='raid_escape')return `3/3 FOUR-HEAD ESCAPE — LOSE THE COPS${t}`;
  }
  return missionText27Base();
};

const showUnlock27Base=showUnlock;
showUnlock=function(){
  showUnlock27Base();const el=document.getElementById('build9-unlock');
  if(el)el.innerHTML=el.innerHTML
    .replace('WEST RIDGE + HARBOR EAST + 12 POST-CLEAR JOBS UNLOCKED','WEST RIDGE + HARBOR EAST + 13 POST-CLEAR JOBS UNLOCKED')
    .replace('12 POST-CLEAR JOBS UNLOCKED','13 POST-CLEAR JOBS UNLOCKED');
};

const openMissionMenu27Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu27Base();const menu=document.getElementById('build11-missions');if(!menu)return;
  menu.innerHTML=menu.innerHTML
    .replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26)/g,'BUILD 27')
    .replace('Keys 1–9, 0, -, =, ], [, \\ select','Keys 1–9, 0, -, =, ], [, \\, / select');
  const b=menu.querySelector('[data-mission="15"]');
  if(b){const ok=!b.disabled;b.innerHTML=`<b>16. RUNWAY RAID</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">shotgun · 3 targets · level-4 escape · base 13500</span>`;}
  menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});
};
addEventListener('keydown',e=>{if(missionMenuOpen&&e.code==='Slash'&&!e.repeat){e.preventDefault();selectMission(15);}});

const reset27Base=reset;
reset=function(){
  shotgunOwned27=false;shotgunAmmo27=0;weapon27='PISTOL';raidTargets27=[];
  reset27Base();installWeaponPickups27();
};
installWeaponPickups27();

const draw27Base=draw;
draw=function(){
  draw27Base();const now=performance.now()/1000;
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  if(mission().id==='runway_raid'){
    if(missionState==='raid_armory'){
      ctx.strokeStyle='#ffd85a';ctx.lineWidth=5;ctx.beginPath();ctx.arc(raidArmory27.x,raidArmory27.y,46+Math.sin(now*5)*5,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#ffd85a';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('AIRFIELD ARMORY',raidArmory27.x,raidArmory27.y-60);
    }else if(missionState==='raid_targets'){
      for(let i=0;i<raidTargets27.length;i++){
        const p=raidTargets27[i];if(!p||p.raidDown27||p.dead>0)continue;
        ctx.strokeStyle='#ff4352';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,38+Math.sin(now*6+i)*4,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#ff6773';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(`TARGET ${i+1}`,p.x,p.y-50);
      }
    }
  }
  ctx.restore();
};

const update27Base=update;
update=function(dt){
  update27Base(dt);
  if(raidActive27()&&respawnTimer<=0&&missionTimer>0){
    missionTimer=Math.max(0,missionTimer-dt);
    if(missionTimer<=0){failMission('MISSION FAILED — TIME EXPIRED');return;}
  }
  if(mission().id==='runway_raid'){
    const m=mission();
    if(missionState==='raid_armory'){
      if(!inVehicle&&Math.hypot(player.x-m.armory.x,player.y-m.armory.y)<=48){
        grantShotgun27(m.shotgunShells||12);spawnRaidTargets27();wantedAtLeast(2);missionState='raid_targets';
        statusMessage='SHOTGUN READY — CLEAR ALL THREE TARGETS';statusTimer=2.4;
      }
    }else if(missionState==='raid_targets'){
      if(raidTargets27.length&&raidAlive27()===0){
        wantedAtLeast(m.escapeWanted||4);missionState='raid_escape';
        statusMessage='TARGETS DOWN — FOUR-HEAD ESCAPE';statusTimer=2.5;
        if(typeof banner15==='function')banner15('TARGETS CLEARED','LOSE THE COPS');
      }
    }else if(missionState==='raid_escape'&&wanted<=0)completeMission();
  }
  const bar=document.getElementById('build14-drive');
  if(bar){
    bar.textContent=bar.textContent.replace('BUILD 26','BUILD 27');
    if(!inVehicle){
      const wt=weapon27==='SHOTGUN'?`SHOTGUN ${shotgunAmmo27}`:(pistolOwned?`PISTOL ${pistolAmmo}`:'UNARMED');
      bar.textContent=bar.textContent.replace(/ON FOOT\s+·\s+(PISTOL \d+|UNARMED)/,`ON FOOT  ·  ${wt}`);
      if(shotgunOwned27&&!bar.textContent.includes('Q SWITCH'))bar.textContent+=' · Q SWITCH';
    }
  }
  if(detailEl&&shotgunOwned27){
    const wt=weapon27==='SHOTGUN'?`SHOTGUN ${String(shotgunAmmo27).padStart(3,'0')}`:`PISTOL ${String(pistolAmmo).padStart(3,'0')}`;
    detailEl.textContent=detailEl.textContent.replace(/PISTOL (?:--|\d{3})/,wt);
  }
};
const front27=document.getElementById('build11-front');
if(front27){
  front27.innerHTML=front27.innerHTML.replace(/BUILD 26/g,'BUILD 27').replace('Spike strips + box pursuit online','Shotgun combat + direct manifest boot online');
  const bold=front27.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;
}
if(typeof banner15==='function')banner15('SHOTGUN COMBAT ONLINE','BUILD 27');
}
