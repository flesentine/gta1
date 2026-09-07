if (!window.__gtaBuild17Branch) {
window.__gtaBuild17Branch = true;

const CROSSROADS17 = {
  id:'crossroads', title:'CROSSROADS', type:'branch_delivery',
  spawn:{x:0,y:-650}, time:105, reward:4500, color:'#f29e1f',
  quietGate:{x:-300,y:650}, hotGate:{x:300,y:650},
  choiceRadius:95, choiceSpeed:120,
  quietDelivery:{x:-2240,y:540,w:520,h:190},
  hotDelivery:{x:1980,y:1120,w:620,h:150},
  deliverySpeed:75, hotWanted:3, hotBonus:2000
};
if (!CAMPAIGN.some(m=>m.id==='crossroads')) CAMPAIGN.push(CROSSROADS17);

let branchChoice17 = '';

try {
  const raw17 = localStorage.getItem(SAVE_KEY);
  if (raw17) {
    const saved17 = JSON.parse(raw17);
    if (levelComplete && Number(saved17.campaignIndex) === 6) campaignIndex = 6;
  }
} catch (e) {
  console.warn('Build 17 saved mission restore failed', e);
}

function branchActive17() {
  return ['branch_steal','branch_choose','branch_deliver','branch_escape'].includes(missionState);
}
function branchDelivery17() {
  const m=mission();
  return branchChoice17==='hot' ? m.hotDelivery : m.quietDelivery;
}
function branchCarOk17() {
  return !!missionCar && !missionCar.destroyed;
}
function completeCrossroads17() {
  const m=mission();
  const selected=branchChoice17;
  const bonus=selected==='hot' ? (m.hotBonus||0) : 0;
  const reward=(m.reward+bonus)*multiplier;
  score+=reward;
  multiplier=Math.min(multiplier+1,5);
  missionCar=null;
  missionTimer=0;
  branchChoice17='';
  campaignIndex=0;
  missionState='cooldown';
  missionCooldown=3;
  statusMessage=`CROSSROADS COMPLETE — ${selected==='hot'?'HOT ROUTE':'QUIET ROUTE'} +${reward}`;
  statusTimer=3.2;
  saveProgress();
  if (typeof sfxMission14==='function') sfxMission14();
  if (typeof banner15==='function') banner15('CROSSROADS','MISSION COMPLETE');
}

const front17=document.getElementById('build11-front');
if(front17){
  front17.innerHTML=front17.innerHTML
    .replace(/BUILD 16/g,'BUILD 17')
    .replace('Living city + cleanup online','Branching missions online');
  const bold17=front17.querySelectorAll('b');
  if(bold17.length>1)bold17[1].textContent=`${unlockedMissionCount()}/${CAMPAIGN.length}`;
}

const showUnlock17Base=showUnlock;
showUnlock=function(){
  showUnlock17Base();
  const el=document.getElementById('build9-unlock');
  if(el){
    el.innerHTML=el.innerHTML
      .replace('3 POST-CLEAR JOBS UNLOCKED','4 POST-CLEAR JOBS UNLOCKED')
      .replace('DOWNTOWN + 3 POST-CLEAR JOBS UNLOCKED','DOWNTOWN + 4 POST-CLEAR JOBS UNLOCKED');
  }
};

const selectMission17Base=selectMission;
selectMission=function(i){
  branchChoice17='';
  selectMission17Base(i);
};

const openMissionMenu17Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu17Base();
  const button=document.querySelector('[data-mission="6"]');
  if(button){
    const ok=!button.disabled;
    button.innerHTML=`<b>7. CROSSROADS</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">Branching delivery · quiet 4500 / hot 6500</span>`;
  }
  const menu=document.getElementById('build11-missions');
  if(menu){
    menu.innerHTML=menu.innerHTML.replace(/BUILD (11|12|13|14|15|16)/g,'BUILD 17');
    const panel=menu.firstElementChild;
    const help=panel ? panel.lastElementChild : null;
    if(help)help.textContent='Keys 1–7 select · Esc closes · CROSSROADS: green quiet / red hot';
    menu.querySelectorAll('[data-mission]').forEach(b=>{
      if(!b.disabled)b.addEventListener('click',()=>selectMission(Number(b.dataset.mission)));
    });
  }
};
addEventListener('keydown',e=>{
  if(missionMenuOpen && e.code==='Digit7' && !e.repeat){
    e.preventDefault();
    selectMission(6);
  }
});

const navTarget17Base=navTarget;
navTarget=function(){
  const m=mission();
  if(missionState==='branch_steal'&&missionCar)
    return{x:missionCar.x,y:missionCar.y,label:'RUNNER CAR'};
  if(missionState==='branch_choose')
    return{x:(m.quietGate.x+m.hotGate.x)/2,y:(m.quietGate.y+m.hotGate.y)/2,label:'CHOOSE GREEN / RED'};
  if(missionState==='branch_deliver'){
    const d=branchDelivery17();
    return{x:d.x+d.w/2,y:d.y+d.h/2,label:branchChoice17==='hot'?'HOT DELIVERY':'QUIET DELIVERY'};
  }
  if(missionState==='branch_escape')
    return{x:RESPRAY.x+RESPRAY.w/2,y:RESPRAY.y+RESPRAY.h/2,label:'LOSE HEAT'};
  return navTarget17Base();
};

const startMission17Base=startMission;
startMission=function(){
  const m=mission();
  if(m.type!=='branch_delivery')return startMission17Base();
  branchChoice17='';
  missionTimer=m.time||0;
  missionState='branch_steal';
  spawnMissionCar(m);
  statusMessage=`${m.title} — STEAL THE ORANGE RUNNER`;
  statusTimer=2.4;
  if(typeof sfxAccept14==='function')sfxAccept14();
  if(typeof banner15==='function')banner15(m.title,'MISSION STARTED');
};

const updateMission17Base=updateMission;
updateMission=function(dt){
  updateMission17Base(dt);
  if(!branchActive17())return;
  const m=mission();

  if((m.time||0)>0){
    missionTimer=Math.max(0,missionTimer-dt);
    if(!missionTimer){
      failMission('MISSION FAILED — TIME EXPIRED');
      return;
    }
  }
  if(respawnTimer>0)return;

  if(missionState==='branch_steal'){
    if(!branchCarOk17()){
      failMission('MISSION FAILED — RUNNER LOST');
      return;
    }
    if(inVehicle&&currentCar===missionCar){
      missionState='branch_choose';
      statusMessage='RUNNER ACQUIRED — GREEN QUIET / RED HOT';
      statusTimer=2.5;
      if(typeof banner15==='function')banner15('CHOOSE YOUR ROUTE','GREEN QUIET · RED HOT');
    }
  }else if(missionState==='branch_choose'){
    if(!branchCarOk17()){
      failMission('MISSION FAILED — RUNNER LOST');
      return;
    }
    if(inVehicle&&currentCar===missionCar&&Math.abs(missionCar.speed)<=(m.choiceSpeed||120)){
      if(Math.hypot(missionCar.x-m.quietGate.x,missionCar.y-m.quietGate.y)<=(m.choiceRadius||95)){
        branchChoice17='quiet';
        missionState='branch_deliver';
        statusMessage='QUIET ROUTE — DELIVER TO WAREHOUSE ROW';
        statusTimer=2.5;
        if(typeof banner15==='function')banner15('QUIET ROUTE','LOW HEAT · BASE 4500');
      }else if(Math.hypot(missionCar.x-m.hotGate.x,missionCar.y-m.hotGate.y)<=(m.choiceRadius||95)){
        branchChoice17='hot';
        missionState='branch_deliver';
        wantedAtLeast(m.hotWanted||3);
        statusMessage='HOT ROUTE — 3 HEADS — DELIVER DOWNTOWN';
        statusTimer=2.5;
        if(typeof banner15==='function')banner15('HOT ROUTE','BONUS +2000 · 3 HEADS');
      }
    }
  }else if(missionState==='branch_deliver'){
    if(!branchCarOk17()){
      failMission('MISSION FAILED — RUNNER LOST');
      return;
    }
    const d=branchDelivery17();
    if(inVehicle&&currentCar===missionCar&&inside(missionCar,d)&&Math.abs(missionCar.speed)<=(m.deliverySpeed||75)){
      if(branchChoice17==='hot'){
        wantedAtLeast(m.hotWanted||3);
        missionState='branch_escape';
        statusMessage='HOT DROP COMPLETE — LOSE THE COPS';
        statusTimer=2.5;
        if(typeof banner15==='function')banner15('HOT DROP COMPLETE','LOSE ALL HEAT');
      }else{
        completeCrossroads17();
      }
    }
  }else if(missionState==='branch_escape'&&wanted<=0){
    completeCrossroads17();
  }
};

const missionText17Base=missionText;
missionText=function(){
  const m=mission();
  const time=(m.time||0)>0?` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}`:'';
  if(missionState==='branch_steal')return`STEAL THE ORANGE RUNNER${time}`;
  if(missionState==='branch_choose')return`CHOOSE ROUTE — GREEN QUIET / RED HOT${time}`;
  if(missionState==='branch_deliver')return`${branchChoice17==='hot'?'HOT':'QUIET'} ROUTE — DELIVER THE RUNNER${time}`;
  if(missionState==='branch_escape')return`HOT ROUTE — LOSE ALL HEAT${time}`;
  return missionText17Base();
};

const drawMission17Base=drawMission;
drawMission=function(){
  drawMission17Base();
  const m=mission(),pulse=1+Math.sin(performance.now()/180)*.08;
  if(missionState==='branch_steal'&&missionCar){
    ctx.strokeStyle='#ffab2e';ctx.lineWidth=5;ctx.beginPath();ctx.arc(missionCar.x,missionCar.y,42*pulse,0,Math.PI*2);ctx.stroke();
  }else if(missionState==='branch_choose'){
    const gates=[[m.quietGate,'#36e36d'],[m.hotGate,'#ff3b43']];
    for(const [g,color] of gates){
      ctx.fillStyle=color==='#36e36d'?'rgba(54,227,109,.14)':'rgba(255,59,67,.14)';
      ctx.beginPath();ctx.arc(g.x,g.y,62*pulse,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(g.x,g.y,52*pulse,0,Math.PI*2);ctx.stroke();
    }
  }else if(missionState==='branch_deliver'){
    const d=branchDelivery17(),hot=branchChoice17==='hot';
    ctx.fillStyle=hot?'rgba(255,55,62,.18)':'rgba(45,226,105,.18)';
    ctx.fillRect(d.x,d.y,d.w,d.h);
    ctx.strokeStyle=hot?'#ff3b43':'#36e36d';ctx.lineWidth=6;ctx.strokeRect(d.x,d.y,d.w,d.h);
  }else if(missionState==='branch_escape'){
    const p=playerTarget();
    ctx.strokeStyle='rgba(255,65,30,.78)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,55*pulse,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='rgba(50,115,255,.50)';ctx.beginPath();ctx.arc(p.x,p.y,69*pulse,0,Math.PI*2);ctx.stroke();
  }
};

const drawMinimap17Base=drawMinimap;
drawMinimap=function(){
  drawMinimap17Base();
  if(!minimapVisible||missionState!=='branch_choose')return;
  const c=document.getElementById('build11-map');if(!c)return;
  const g=c.getContext('2d'),w=c.width,h=c.height,pad=9;
  const sx=(w-pad*2)/WORLD.w,sy=(h-pad*2)/WORLD.h,s=Math.min(sx,sy);
  const ox=(w-WORLD.w*s)/2-WORLD.x*s,oy=(h-WORLD.h*s)/2-WORLD.y*s;
  const mx=x=>ox+x*s,my=y=>oy+y*s,m=mission();
  for(const [pt,color] of [[m.quietGate,'#36e36d'],[m.hotGate,'#ff3b43']]){
    g.fillStyle=color;g.beginPath();g.arc(mx(pt.x),my(pt.y),4.4,0,Math.PI*2);g.fill();
    g.strokeStyle=color;g.lineWidth=1.5;g.beginPath();g.arc(mx(pt.x),my(pt.y),7,0,Math.PI*2);g.stroke();
  }
};

const failMission17Base=failMission;
failMission=function(msg){
  branchChoice17='';
  failMission17Base(msg);
};

const loseLife17Base=loseLife;
loseLife=function(reason){
  if(branchActive17())failMission('MISSION FAILED — LOST A LIFE');
  loseLife17Base(reason);
};

const update17Base=update;
update=function(dt){
  update17Base(dt);
  const bar=document.getElementById('build14-drive');
  if(bar)bar.textContent=bar.textContent.replace('BUILD 16','BUILD 17').replace('BUILD 15','BUILD 17').replace('BUILD 14','BUILD 17');
};

const reset17Base=reset;
reset=function(){
  branchChoice17='';
  reset17Base();
};

if(typeof banner15==='function')banner15('BRANCHING OPS ONLINE','BUILD 17');
}
