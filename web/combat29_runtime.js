if (!window.__gtaBuild29Combat) {
window.__gtaBuild29Combat = true;

const BUILD29_DATA = window.__build29Data || {};
const CROSSFIRE29 = BUILD29_DATA.mission || {
  id:'crossfire',title:'CROSSFIRE',type:'hostile_assault',time_limit:180,base_reward:16500,
  staging_position:[1800,0],smg_ammo:120,armor:4,escape_wanted:4,hostiles:[]
};
const CHAPTER29 = BUILD29_DATA.chapter || {
  id:'coast_to_coast',title:'CHAPTER ONE — COAST TO COAST',
  mission_ids:['airmail','lockdown','runway_raid','three_fronts','crossfire']
};

function mission29FromData(raw){
  return {
    id:raw.id,title:raw.title,type:raw.type,
    time:Number(raw.time_limit||0),reward:Number(raw.base_reward||0),
    staging:{x:Number((raw.staging_position||[1800,0])[0]),y:Number((raw.staging_position||[1800,0])[1])},
    smgAmmo:Number(raw.smg_ammo||120),armor:Number(raw.armor||4),wanted:Number(raw.escape_wanted||4),
    hostiles:(raw.hostiles||[]).map(h=>({
      spawn:{x:Number(h.spawn[0]),y:Number(h.spawn[1])},health:Number(h.health||6),
      cover:(h.cover||[]).map(p=>({x:Number(p[0]),y:Number(p[1])}))
    }))
  };
}
const CROSSFIRE_MISSION29=mission29FromData(CROSSFIRE29);
if(!CAMPAIGN.some(m=>m.id==='crossfire'))CAMPAIGN.push(CROSSFIRE_MISSION29);

const CHAPTER_KEY29='gta1-build29-chapter-v1';
let chapter29={active:false,stage:0,pending:false};
let chapterSelecting29=false;
let armor29=4;
let hostileHitLock29=0;
let hostiles29=[];

function missionIndex29(id){return CAMPAIGN.findIndex(m=>m.id===id);}
function expectedChapterId29(){return CHAPTER29.mission_ids[Math.max(0,Math.min(chapter29.stage,CHAPTER29.mission_ids.length-1))]||'';}
function saveChapter29(){
  try{localStorage.setItem(CHAPTER_KEY29,JSON.stringify({active:!!chapter29.active,stage:chapter29.stage,pending:!!chapter29.pending}));}catch(e){console.warn('Build 29 chapter save failed',e);}
}
function loadChapter29(){
  try{
    const raw=localStorage.getItem(CHAPTER_KEY29);if(!raw)return;
    const s=JSON.parse(raw);chapter29.active=!!s.active;chapter29.stage=Math.max(0,Math.min(Number(s.stage)||0,CHAPTER29.mission_ids.length-1));chapter29.pending=!!s.pending||chapter29.active;
  }catch(e){console.warn('Build 29 chapter load failed',e);}
}
loadChapter29();

function chapterLabel29(){
  if(!chapter29.active)return 'START CHAPTER';
  return `RESUME ${Math.min(chapter29.stage+1,CHAPTER29.mission_ids.length)}/${CHAPTER29.mission_ids.length}`;
}
function beginChapter29(){
  if(!levelComplete){statusMessage='CHAPTER LOCKED — CLEAR THE CORE LEVEL FIRST';statusTimer=2.2;return;}
  if(!chapter29.active){chapter29={active:true,stage:0,pending:false};}
  const idx=missionIndex29(expectedChapterId29());if(idx<0)return;
  chapterSelecting29=true;
  campaignIndex=idx;missionState='available';missionCooldown=0;missionTimer=0;missionCar=null;saveProgress();
  if(typeof closeMissionMenu==='function')closeMissionMenu(false);
  chapterSelecting29=false;chapter29.pending=false;saveChapter29();
  startMission();
  if(typeof banner15==='function')banner15(CHAPTER29.title,`STAGE ${chapter29.stage+1}/${CHAPTER29.mission_ids.length}`);
}
function suspendChapter29(){
  if(!chapter29.active)return;
  chapter29.active=false;chapter29.pending=false;saveChapter29();
  statusMessage='CHAPTER RUN SUSPENDED';statusTimer=1.4;
}

const selectMission29Base=selectMission;
selectMission=function(i){
  if(chapter29.active&&!chapterSelecting29)suspendChapter29();
  return selectMission29Base(i);
};

function cleanHostiles29(){
  if(!hostiles29.length)return;
  const set=new Set(hostiles29);peds=peds.filter(p=>!set.has(p));hostiles29=[];
}
function spawnHostiles29(){
  cleanHostiles29();
  CROSSFIRE_MISSION29.hostiles.forEach((h,i)=>{
    const r=[[h.spawn.x-45,h.spawn.y],[h.spawn.x,h.spawn.y-45],[h.spawn.x+45,h.spawn.y],[h.spawn.x,h.spawn.y+45]];
    const p=ped(r,0,['#8e2430','#7f2c38','#9b3330','#762733','#a04028'][i%5],420+i);
    p.hp=h.health;p.hostile29=true;p.hostileDown29=false;p.hostileIndex29=i;p.coverPoints29=h.cover;p.coverTarget29=null;
    p.fireCooldown29=.35+i*.12;p.coverUntil29=0;p.lastHp29=p.hp;p.speed=78;p.panic=0;
    hostiles29.push(p);peds.push(p);
  });
}
function hostileAlive29(){return hostiles29.filter(p=>p&&!p.hostileDown29&&p.dead<=0&&p.hp>0).length;}
function crossfireActive29(){return mission().id==='crossfire'&&['crossfire_staging','crossfire_hostiles','crossfire_escape'].includes(missionState);}

function chooseCover29(p,target){
  const pts=p.coverPoints29||[];if(!pts.length)return null;
  let best=null,bestScore=-Infinity;
  for(const q of pts){
    if(collides(q.x,q.y,9))continue;
    const fromPlayer=Math.hypot(q.x-target.x,q.y-target.y);
    const fromSelf=Math.hypot(q.x-p.x,q.y-p.y);
    const score=fromPlayer-fromSelf*.45;
    if(score>bestScore){bestScore=score;best=q;}
  }
  return best;
}
function hostileLos29(p,target){
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;
  if(d>560)return false;
  const blocked=wallDist(p.x,p.y,dx/d,dy/d);
  return blocked>=d-16;
}
function hostileShoot29(p,target){
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;
  if(d>540||!hostileLos29(p,target))return;
  p.fireCooldown29=.68+(p.hostileIndex29%3)*.10;
  const jitter=(Math.random()-.5)*Math.min(55,d*.09),nx=-dy/d,ny=dx/d;
  const ex=target.x+nx*jitter,ey=target.y+ny*jitter;
  tracers.push({x1:p.x,y1:p.y,x2:ex,y2:ey,t:.10});
  const hitChance=Math.max(.24,.78-d/980);
  if(Math.random()>hitChance)return;
  if(inVehicle&&currentCar&&!currentCar.destroyed){
    currentCar.hp=Math.max(0,currentCar.hp-1);currentCar.flash=.16;
    if(currentCar.hp<=0){currentCar.destroyed=true;currentCar.ai=false;currentCar.speed=0;effects.push({x:currentCar.x,y:currentCar.y,t:.8,type:'boom'});}
  }else if(hostileHitLock29<=0&&respawnTimer<=0){
    hostileHitLock29=.24;armor29=Math.max(0,armor29-1);statusMessage=`UNDER FIRE — ARMOR ${armor29}`;statusTimer=.8;
    if(armor29<=0){armor29=CROSSFIRE_MISSION29.armor||4;loseLife('WASTED');}
  }
}
function updateHostile29(p,dt){
  if(p.dead>0||p.hp<=0){p.dead=99999;p.hostileDown29=true;return;}
  if(p.hp<p.lastHp29){p.coverUntil29=performance.now()+2400;p.coverTarget29=null;p.lastHp29=p.hp;}
  p.fireCooldown29=Math.max(0,(p.fireCooldown29||0)-dt);
  const target=playerTarget(),dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;
  const seekingCover=performance.now()<p.coverUntil29||p.hp<=Math.ceil((CROSSFIRE_MISSION29.hostiles[p.hostileIndex29]?.health||6)/2)||d<135;
  let tx=target.x,ty=target.y,move=true;
  if(seekingCover){
    if(!p.coverTarget29)p.coverTarget29=chooseCover29(p,target);
    if(p.coverTarget29){tx=p.coverTarget29.x;ty=p.coverTarget29.y;if(Math.hypot(tx-p.x,ty-p.y)<22)move=false;}
  }else if(d<500&&hostileLos29(p,target)){move=false;}
  if(move){
    const mdx=tx-p.x,mdy=ty-p.y,m=Math.hypot(mdx,mdy)||1,spd=seekingCover?112:78;
    p.fx=mdx/m;p.fy=mdy/m;p.stride+=dt*8;
    const nx=p.x+p.fx*spd*dt,ny=p.y+p.fy*spd*dt;
    if(!collides(nx,ny,9)){p.x=nx;p.y=ny;}else{p.coverTarget29=null;p.x+=-p.fy*spd*.35*dt;p.y+=p.fx*spd*.35*dt;}
  }else{p.stride+=dt*.5;}
  if(p.fireCooldown29<=0&&d<540)hostileShoot29(p,target);
}

const updatePed29Base=updatePed;
updatePed=function(p,dt){if(p&&p.hostile29)return updateHostile29(p,dt);return updatePed29Base(p,dt);};
const drawPed29Base=drawPed;
drawPed=function(p){
  drawPed29Base(p);if(!p||!p.hostile29||p.dead>0||p.hp<=0)return;
  ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#ffb24d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(15,-3);ctx.stroke();
  ctx.fillStyle='#ff4d57';ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(6,-14);ctx.lineTo(-6,-14);ctx.closePath();ctx.fill();
  if(performance.now()<p.coverUntil29){ctx.strokeStyle='rgba(105,220,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,18,Math.PI*.1,Math.PI*.9);ctx.stroke();}
  ctx.restore();
};

const navTarget29Base=navTarget;
navTarget=function(){
  if(mission().id==='crossfire'){
    if(missionState==='crossfire_staging')return{x:CROSSFIRE_MISSION29.staging.x,y:CROSSFIRE_MISSION29.staging.y,label:'STAGING POINT'};
    if(missionState==='crossfire_hostiles'){
      const t=playerTarget(),alive=hostiles29.filter(p=>p&&!p.hostileDown29&&p.dead<=0&&p.hp>0).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y));
      if(alive[0])return{x:alive[0].x,y:alive[0].y,label:`HOSTILES ${alive.length}`};
    }
    if(missionState==='crossfire_escape')return{x:RESPRAY.x+RESPRAY.w/2,y:RESPRAY.y+RESPRAY.h/2,label:'LOSE HEAT'};
  }
  return navTarget29Base();
};

const startMission29Base=startMission;
startMission=function(){
  const m=mission();if(m.id!=='crossfire')return startMission29Base();
  cleanHostiles29();missionTimer=m.time||180;armor29=m.armor||4;missionState='crossfire_staging';statusMessage='CROSSFIRE — REACH DOWNTOWN STAGING';statusTimer=2.5;
  if(typeof sfxAccept14==='function')sfxAccept14();if(typeof banner15==='function')banner15('CROSSFIRE','ARMED HOSTILES ONLINE');
};

const completeMission29Base=completeMission;
completeMission=function(){
  const completedId=mission().id,before=score;
  let result;
  if(completedId==='crossfire'){
    const m=mission(),reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);cleanHostiles29();missionTimer=0;campaignIndex=0;missionState='cooldown';missionCooldown=3.8;statusMessage=`CROSSFIRE COMPLETE — ${reward}`;statusTimer=3.8;saveProgress();
    if(typeof sfxMission14==='function')sfxMission14();if(typeof banner15==='function')banner15('CROSSFIRE COMPLETE','HOSTILES CLEARED');
  }else result=completeMission29Base();
  if(chapter29.active&&completedId===expectedChapterId29()&&score>before){
    chapter29.stage++;
    if(chapter29.stage>=CHAPTER29.mission_ids.length){chapter29.active=false;chapter29.pending=false;chapter29.stage=0;saveChapter29();statusMessage='CHAPTER ONE COMPLETE — COAST TO COAST';statusTimer=4;if(typeof banner15==='function')banner15('CHAPTER ONE COMPLETE','COAST TO COAST');}
    else{chapter29.pending=true;saveChapter29();statusMessage=`CHAPTER CHECKPOINT ${chapter29.stage}/${CHAPTER29.mission_ids.length} — NEXT ${expectedChapterId29().replaceAll('_',' ').toUpperCase()}`;statusTimer=3;}
  }
  return result;
};
const failMission29Base=failMission;
failMission=function(msg){
  const id=mission().id,match=chapter29.active&&id===expectedChapterId29();if(id==='crossfire')cleanHostiles29();const r=failMission29Base(msg);if(match){chapter29.pending=true;saveChapter29();statusMessage+=' · CHAPTER CHECKPOINT HELD';}return r;
};

const missionText29Base=missionText;
missionText=function(){
  if(mission().id==='crossfire'){
    const t=` · TIME ${String(Math.ceil(missionTimer)).padStart(3,'0')}`;
    if(missionState==='crossfire_staging')return`1/3 REACH DOWNTOWN STAGING${t}`;
    if(missionState==='crossfire_hostiles')return`2/3 CLEAR ARMED HOSTILES — ${5-hostileAlive29()}/5 · ARMOR ${armor29}${t}`;
    if(missionState==='crossfire_escape')return`3/3 FOUR-HEAD ESCAPE — LOSE THE COPS${t}`;
  }
  return missionText29Base();
};

const openMissionMenu29Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu29Base();const menu=document.getElementById('build11-missions');if(!menu)return;
  menu.innerHTML=menu.innerHTML.replace(/BUILD (11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28)/g,'BUILD 29');
  const b=menu.querySelector('[data-mission="17"]');if(b){const ok=!b.disabled;b.innerHTML=`<b>18. CROSSFIRE</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">armed hostiles · cover AI · four-head escape · base 16500</span>`;}
  const panel=menu.firstElementChild;if(panel&&!panel.querySelector('#chapter29-button')){
    const cb=document.createElement('button');cb.id='chapter29-button';cb.disabled=!levelComplete;cb.textContent=`${CHAPTER29.title} — ${levelComplete?chapterLabel29():'LOCKED'}`;
    Object.assign(cb.style,{width:'100%',margin:'11px 0 0',padding:'13px 14px',background:levelComplete?'#203748':'#111417',color:levelComplete?'#8ee9ff':'#61666b',border:'1px solid #4d7f96',borderRadius:'7px',font:'900 12px ui-monospace,monospace',cursor:levelComplete?'pointer':'default'});
    if(levelComplete)cb.addEventListener('click',()=>beginChapter29());panel.appendChild(cb);
  }
  const help=menu.querySelector('div > div:last-child');if(help&&help.textContent.includes('Keys'))help.textContent='Jobs: 1–9 / 0 / - / = / ] / [ / \\ / / / . / ;  ·  , starts Chapter One';
  menu.querySelectorAll('[data-mission]').forEach(x=>{const c=x.cloneNode(true);x.replaceWith(c);c.addEventListener('click',()=>selectMission(Number(c.dataset.mission)));});
};
addEventListener('keydown',e=>{
  if(!missionMenuOpen||e.repeat)return;
  if(e.code==='Semicolon'){e.preventDefault();selectMission(17);}
  if(e.code==='Comma'){e.preventDefault();beginChapter29();}
});

const showUnlock29Base=showUnlock;
showUnlock=function(){showUnlock29Base();const el=document.getElementById('build9-unlock');if(el)el.innerHTML=el.innerHTML.replace('14 POST-CLEAR JOBS UNLOCKED','15 POST-CLEAR JOBS + CHAPTER ONE UNLOCKED');};

const draw29Base=draw;
draw=function(){
  draw29Base();if(mission().id!=='crossfire')return;const now=performance.now()/1000;ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  if(missionState==='crossfire_staging'){
    const p=CROSSFIRE_MISSION29.staging;ctx.strokeStyle='#ffb24d';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x,p.y,50+Math.sin(now*5)*5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffcf72';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('CROSSFIRE STAGING',p.x,p.y-64);
  }else if(missionState==='crossfire_hostiles'){
    for(const p of hostiles29){if(!p||p.hostileDown29||p.dead>0||p.hp<=0)continue;ctx.strokeStyle='#ff4654';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,31+Math.sin(now*6+p.hostileIndex29)*3,0,Math.PI*2);ctx.stroke();}
  }
  ctx.restore();
};

const update29Base=update;
update=function(dt){
  hostileHitLock29=Math.max(0,hostileHitLock29-dt);update29Base(dt);
  if(crossfireActive29()&&respawnTimer<=0&&missionTimer>0){missionTimer=Math.max(0,missionTimer-dt);if(missionTimer<=0){failMission('MISSION FAILED — TIME EXPIRED');return;}}
  if(mission().id==='crossfire'){
    const m=mission();
    if(missionState==='crossfire_staging'&&!inVehicle&&Math.hypot(player.x-m.staging.x,player.y-m.staging.y)<=50){if(typeof grantSmg28==='function')grantSmg28(m.smgAmmo||120);armor29=m.armor||4;spawnHostiles29();wantedAtLeast(2);missionState='crossfire_hostiles';statusMessage='AMBUSH ACTIVE — HOSTILES ARE ARMED';statusTimer=2.5;if(typeof banner15==='function')banner15('CONTACT','HOSTILES USING COVER');}
    else if(missionState==='crossfire_hostiles'&&hostiles29.length&&hostileAlive29()===0){wantedAtLeast(m.wanted||4);missionState='crossfire_escape';statusMessage='HOSTILES DOWN — FOUR-HEAD ESCAPE';statusTimer=2.5;if(typeof banner15==='function')banner15('CROSSFIRE CLEARED','LOSE THE COPS');}
    else if(missionState==='crossfire_escape'&&wanted<=0)completeMission();
  }
  if(chapter29.active&&chapter29.pending&&missionState==='available'&&missionCooldown<=0&&respawnTimer<=0){
    const idx=missionIndex29(expectedChapterId29());if(idx>=0){campaignIndex=idx;chapter29.pending=false;saveChapter29();saveProgress();startMission();if(typeof banner15==='function')banner15(CHAPTER29.title,`STAGE ${chapter29.stage+1}/${CHAPTER29.mission_ids.length}`);}
  }
  const bar=document.getElementById('build14-drive');if(bar){bar.textContent=bar.textContent.replace('BUILD 28','BUILD 29');if(!inVehicle&&!bar.textContent.includes('ARMOR'))bar.textContent+=` · ARMOR ${armor29}`;if(chapter29.active&&!bar.textContent.includes('CHAPTER'))bar.textContent+=` · CHAPTER ${chapter29.stage+1}/${CHAPTER29.mission_ids.length}`;}
};

const reset29Base=reset;
reset=function(){cleanHostiles29();armor29=CROSSFIRE_MISSION29.armor||4;reset29Base();if(chapter29.active)chapter29.pending=true;};
const front29=document.getElementById('build11-front');if(front29){front29.innerHTML=front29.innerHTML.replace(/BUILD 28/g,'BUILD 29').replace('Flat core + SMG cross-sector combat online','Armed hostiles + persistent chapter run online');const bold=front29.querySelectorAll('b');if(bold.length>1)bold[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;}
if(typeof banner15==='function')banner15('HOSTILE AI + CHAPTER ONE','BUILD 29');
}
