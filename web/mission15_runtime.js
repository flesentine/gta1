if (!window.__gtaBuild15Mission) {
window.__gtaBuild15Mission = true;

const RED_FLAG15 = {
  id:'red_flag', title:'RED FLAG', type:'character_target', time:90, reward:5000,
  targetRoute:[[2020,-1020],[2240,-1020],[2240,-820],[2020,-820]],
  color:'#d62846', targetHp:4, ammo:16, wanted:3
};
if (!CAMPAIGN.some(m=>m.id==='red_flag')) CAMPAIGN.push(RED_FLAG15);

let missionTarget15 = null;

function cleanupTarget15() {
  if (missionTarget15) {
    peds = peds.filter(p=>p!==missionTarget15);
    missionTarget15 = null;
  }
}
function spawnTarget15(m) {
  cleanupTarget15();
  const route = m.targetRoute || RED_FLAG15.targetRoute;
  const p = ped(route,0,m.color||'#d62846',77);
  p.hp = m.targetHp || 4;
  p.missionTarget15 = true;
  p.dead = 0;
  p.down = 0;
  p.panic = 0;
  p.speed = 82;
  missionTarget15 = p;
  peds.push(p);
}
function completeRedFlag15() {
  const m = mission();
  const reward = m.reward * multiplier;
  score += reward;
  multiplier = Math.min(multiplier+1,5);
  missionTimer = 0;
  cleanupTarget15();
  campaignIndex = 0;
  missionState = 'cooldown';
  missionCooldown = 3;
  statusMessage = `RED FLAG COMPLETE +${reward}`;
  statusTimer = 3;
  saveProgress();
  tone15(880,.14,.07);
  banner15('RED FLAG','MISSION COMPLETE');
}

try {
  const raw15 = localStorage.getItem(SAVE_KEY);
  if (raw15) {
    const saved15 = JSON.parse(raw15);
    if (levelComplete && Number(saved15.campaignIndex) === 5) campaignIndex = 5;
  }
} catch (e) {
  console.warn('Build 15 saved mission restore failed', e);
}

const front15 = document.getElementById('build11-front');
if (front15) {
  front15.innerHTML = front15.innerHTML
    .replace(/BUILD 14/g,'BUILD 15')
    .replace('Audio + handling polish online','Character target + pursuit online');
  const bold15 = front15.querySelectorAll('b');
  if (bold15.length > 1) bold15[1].textContent = `${unlockedMissionCount()}/${CAMPAIGN.length}`;
}

let bannerUntil15 = 0;
let audio15 = null;
function ensureAudio15() {
  if (audio15) {
    if (audio15.state === 'suspended') audio15.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) audio15 = new AC();
}
function tone15(freq=480,dur=.09,vol=.05) {
  ensureAudio15();
  if (!audio15) return;
  const o=audio15.createOscillator(),g=audio15.createGain(),t=audio15.currentTime;
  o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(audio15.destination);o.start(t);o.stop(t+dur+.02);
}
function banner15(title,sub='') {
  let b=document.getElementById('build15-banner');
  if(!b){b=document.createElement('div');b.id='build15-banner';Object.assign(b.style,{position:'fixed',left:'50%',top:'29%',transform:'translate(-50%,-50%)',zIndex:'66',padding:'12px 20px',background:'rgba(18,8,12,.94)',border:'2px solid #ff4058',borderRadius:'8px',font:'900 14px ui-monospace,monospace',color:'#fff',textAlign:'center',pointerEvents:'none',boxShadow:'0 14px 50px rgba(0,0,0,.55)'});document.body.appendChild(b);}
  b.innerHTML=`<div style="color:#ff7184;font-size:10px;letter-spacing:.15em">${sub}</div><div style="font-size:21px;margin-top:3px">${title}</div>`;
  b.style.opacity='1';bannerUntil15=performance.now()+1650;
}
addEventListener('pointerdown',ensureAudio15,{once:true});addEventListener('keydown',ensureAudio15,{once:true});

const update15Base = update;
update = function(dt) {
  update15Base(dt);
  const bar=document.getElementById('build14-drive');
  if(bar)bar.textContent=bar.textContent.replace('BUILD 14','BUILD 15');
  const b=document.getElementById('build15-banner');
  if(b&&performance.now()>bannerUntil15)b.style.opacity='0';
};

const showUnlock15Base = showUnlock;
showUnlock = function() {
  showUnlock15Base();
  const el = document.getElementById('build9-unlock');
  if (el) {
    el.innerHTML = el.innerHTML
      .replace('DOWNTOWN + CROSSTOWN + DEAD DROP UNLOCKED','3 POST-CLEAR JOBS UNLOCKED')
      .replace('DOWNTOWN ACCESS UNLOCKED','DOWNTOWN + 3 POST-CLEAR JOBS UNLOCKED');
  }
};

const selectMission15Base = selectMission;
selectMission = function(i) {
  cleanupTarget15();
  selectMission15Base(i);
};

const openMissionMenu15Base = openMissionMenu;
openMissionMenu = function() {
  openMissionMenu15Base();
  const button = document.querySelector('[data-mission="5"]');
  if (button) {
    const ok = !button.disabled;
    button.innerHTML = `<b>6. RED FLAG</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:11px;font-weight:500;opacity:.72">Marked target + police escape · base 5000</span>`;
  }
  const panel = document.querySelector('#build11-missions > div');
  if (panel) {
    const help = panel.lastElementChild;
    if (help) help.textContent = 'Keys 1–6 select · Esc closes · post-clear jobs unlock after level clear';
  }
};
addEventListener('keydown',e=>{
  if (missionMenuOpen && e.code==='Digit6' && !e.repeat) {
    e.preventDefault();
    selectMission(5);
  }
});

const navTarget15Base = navTarget;
navTarget = function() {
  if (missionState==='hunt_target' && missionTarget15 && missionTarget15.dead<=0)
    return {x:missionTarget15.x,y:missionTarget15.y,label:'MARKED TARGET'};
  if (missionState==='hunt_escape')
    return {x:RESPRAY.x+RESPRAY.w/2,y:RESPRAY.y+RESPRAY.h/2,label:'LOSE HEAT'};
  return navTarget15Base();
};

const startMission15Base = startMission;
startMission = function() {
  const m = mission();
  if (m.type!=='character_target') return startMission15Base();
  cleanupTarget15();
  missionTimer = m.time || 0;
  pistolOwned = true;
  pistolAmmo = Math.max(pistolAmmo,m.ammo||16);
  spawnTarget15(m);
  missionState = 'hunt_target';
  statusMessage = `${m.title} — FIND THE MARKED TARGET`;
  statusTimer = 2.4;
  tone15(540,.08,.045);
  banner15(m.title,'MISSION STARTED');
};

const updatePed15Base = updatePed;
updatePed = function(p,dt) {
  if (p===missionTarget15 && missionState==='hunt_target' && p.dead<=0) {
    const t = playerTarget();
    const dx = p.x-t.x, dy = p.y-t.y, d = Math.hypot(dx,dy)||1;
    if (d < 280) {
      p.fx = dx/d;
      p.fy = dy/d;
      p.panic = Math.max(p.panic,1.45);
    }
  }
  updatePed15Base(p,dt);
};

const updateMission15Base = updateMission;
updateMission = function(dt) {
  updateMission15Base(dt);
  if (missionState!=='hunt_target' && missionState!=='hunt_escape') return;

  if (mission().time) {
    missionTimer = Math.max(0,missionTimer-dt);
    if (!missionTimer) {
      failMission('MISSION FAILED — TIME EXPIRED');
      return;
    }
  }

  if (missionState==='hunt_target') {
    if (!missionTarget15) {
      failMission('MISSION FAILED — TARGET LOST');
      return;
    }
    if (missionTarget15.dead>0 || missionTarget15.hp<=0) {
      missionTarget15.dead = 99999;
      missionState = 'hunt_escape';
      wantedAtLeast(mission().wanted||3);
      statusMessage = 'TARGET DOWN — LOSE THE COPS';
      statusTimer = 2.4;
      tone15(250,.11,.06);
      banner15('TARGET DOWN','LOSE THE COPS');
    }
  } else if (missionState==='hunt_escape' && wanted<=0) {
    completeRedFlag15();
  }
};

const missionText15Base = missionText;
missionText = function() {
  if (missionState==='hunt_target') {
    const time = mission().time ? ` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}` : '';
    return `TAKE DOWN THE MARKED TARGET${time}`;
  }
  if (missionState==='hunt_escape') {
    const time = mission().time ? ` · TIME ${String(Math.ceil(missionTimer)).padStart(2,'0')}` : '';
    return `TARGET DOWN — LOSE ALL HEAT${time}`;
  }
  return missionText15Base();
};

const drawMission15Base = drawMission;
drawMission = function() {
  drawMission15Base();
  const pulse = 1 + Math.sin(performance.now()/180)*.08;
  if (missionState==='hunt_target' && missionTarget15 && missionTarget15.dead<=0) {
    ctx.strokeStyle='#ff344d';
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.arc(missionTarget15.x,missionTarget15.y,42*pulse,0,Math.PI*2);
    ctx.stroke();
    ctx.fillStyle='#ff344d';
    ctx.beginPath();
    ctx.moveTo(missionTarget15.x-10,missionTarget15.y-67);
    ctx.lineTo(missionTarget15.x+10,missionTarget15.y-67);
    ctx.lineTo(missionTarget15.x,missionTarget15.y-51);
    ctx.fill();
  } else if (missionState==='hunt_escape') {
    const p = playerTarget();
    ctx.strokeStyle='rgba(255,52,77,.78)';
    ctx.lineWidth=4;
    ctx.beginPath(); ctx.arc(p.x,p.y,55*pulse,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='rgba(50,115,255,.50)';
    ctx.beginPath(); ctx.arc(p.x,p.y,69*pulse,0,Math.PI*2); ctx.stroke();
  }
};

const failMission15Base = failMission;
failMission = function(msg) {
  cleanupTarget15();
  failMission15Base(msg);
};

const loseLife15Base = loseLife;
loseLife = function(reason) {
  if (missionState==='hunt_target' || missionState==='hunt_escape') {
    missionState = 'escape';
  }
  loseLife15Base(reason);
};

const reset15Base = reset;
reset = function() {
  cleanupTarget15();
  reset15Base();
};

banner15('TARGET OPS ONLINE','BUILD 15');
}
