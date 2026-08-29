if (!window.__gtaBuild14Polish) {
window.__gtaBuild14Polish = true;

const VEHICLE_CLASSES14 = [
  {id:'COMPACT',w:30,h:56,max:500,reverse:190,accel:610,brake:760,drag:285,turn:2.95,hp:3},
  {id:'SEDAN',w:34,h:64,max:525,reverse:180,accel:510,brake:700,drag:260,turn:2.50,hp:4},
  {id:'MUSCLE',w:38,h:68,max:590,reverse:175,accel:650,brake:740,drag:245,turn:2.20,hp:5},
  {id:'VAN',w:40,h:72,max:455,reverse:160,accel:420,brake:660,drag:275,turn:1.95,hp:6}
];
let vehicleSerial14 = 0;
let skidCooldown14 = 0;
let shake14 = 0;
let audio14 = null;
let engineOsc14 = null;
let engineGain14 = null;
let sirenOsc14 = null;
let sirenGain14 = null;
let bannerUntil14 = 0;

function ensureAudio14() {
  if (audio14) {
    if (audio14.state === 'suspended') audio14.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audio14 = new AC();

  engineOsc14 = audio14.createOscillator();
  engineGain14 = audio14.createGain();
  engineOsc14.type = 'sawtooth';
  engineOsc14.frequency.value = 65;
  engineGain14.gain.value = 0;
  engineOsc14.connect(engineGain14).connect(audio14.destination);
  engineOsc14.start();

  sirenOsc14 = audio14.createOscillator();
  sirenGain14 = audio14.createGain();
  sirenOsc14.type = 'square';
  sirenOsc14.frequency.value = 620;
  sirenGain14.gain.value = 0;
  sirenOsc14.connect(sirenGain14).connect(audio14.destination);
  sirenOsc14.start();
}
addEventListener('pointerdown', ensureAudio14, {once:true});
addEventListener('keydown', ensureAudio14, {once:true});

function tone14(freq, dur=.07, vol=.06, type='square', delay=0) {
  ensureAudio14();
  if (!audio14) return;
  const o = audio14.createOscillator();
  const g = audio14.createGain();
  const t = audio14.currentTime + delay;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(.001, vol), t + .008);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(audio14.destination);
  o.start(t);
  o.stop(t + dur + .02);
}
function sequence14(notes) {
  let delay = 0;
  for (const n of notes) {
    tone14(n[0], n[1] || .08, n[2] || .06, n[3] || 'square', delay);
    delay += n[4] || .07;
  }
}
const sfxGun14 = () => { tone14(175,.045,.13,'square'); tone14(82,.09,.055,'sawtooth',.012); };
const sfxPickup14 = () => sequence14([[520,.05,.055,'sine'],[780,.08,.055,'sine']]);
const sfxDoor14 = () => { tone14(115,.06,.045,'square'); tone14(85,.08,.035,'square',.045); };
const sfxImpact14 = v => tone14(Math.max(55,130-v*.12),.09,Math.min(.12,.035+v/5000),'sawtooth');
const sfxSkid14 = () => tone14(145,.045,.025,'sawtooth');
const sfxMission14 = () => sequence14([[440,.08,.06,'sine'],[660,.08,.07,'sine'],[880,.14,.08,'sine']]);
const sfxFail14 = () => sequence14([[260,.09,.055,'square'],[185,.12,.055,'square'],[120,.18,.06,'sawtooth']]);
const sfxAccept14 = () => sequence14([[360,.055,.04,'sine'],[540,.07,.045,'sine']]);

function ensureHud14() {
  let bar = document.getElementById('build14-drive');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'build14-drive';
    Object.assign(bar.style, {
      position:'fixed', left:'50%', bottom:'64px', transform:'translateX(-50%)', zIndex:'36',
      minWidth:'270px', padding:'8px 13px', background:'rgba(5,8,10,.84)',
      border:'1px solid rgba(255,255,255,.2)', borderRadius:'7px',
      font:'800 12px ui-monospace,monospace', color:'#eef3f6', textAlign:'center',
      pointerEvents:'none', boxShadow:'0 8px 24px rgba(0,0,0,.4)'
    });
    document.body.appendChild(bar);
  }
  let banner = document.getElementById('build14-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'build14-banner';
    Object.assign(banner.style, {
      position:'fixed', left:'50%', top:'20%', transform:'translate(-50%,-50%) scale(.96)',
      zIndex:'65', padding:'14px 22px', background:'rgba(8,12,15,.95)',
      border:'2px solid #efc94c', borderRadius:'8px', font:'900 15px ui-monospace,monospace',
      color:'#fff', textAlign:'center', pointerEvents:'none', opacity:'0',
      transition:'opacity .15s, transform .15s', boxShadow:'0 15px 55px rgba(0,0,0,.58)'
    });
    document.body.appendChild(banner);
  }
}
function flashBanner14(title, sub='') {
  ensureHud14();
  const b = document.getElementById('build14-banner');
  b.innerHTML = `<div style="color:#efc94c;font-size:11px;letter-spacing:.16em">${sub}</div><div style="font-size:22px;margin-top:3px">${title}</div>`;
  b.style.opacity = '1';
  b.style.transform = 'translate(-50%,-50%) scale(1)';
  bannerUntil14 = performance.now() + 1700;
}
function updateHud14() {
  ensureHud14();
  const bar = document.getElementById('build14-drive');
  const banner = document.getElementById('build14-banner');
  if (inVehicle && currentCar) {
    bar.textContent = `BUILD 14  ·  ${currentCar.kind || 'SEDAN'}  ·  SPEED ${Math.round(Math.abs(currentCar.speed))}  ·  HP ${Math.max(0,currentCar.hp)}/${currentCar.maxHp || 4}`;
  } else {
    bar.textContent = `BUILD 14  ·  ON FOOT  ·  ${pistolOwned ? 'PISTOL '+pistolAmmo : 'UNARMED'}  ·  AUDIO ${audio14 ? 'ON' : 'CLICK/KEY TO ENABLE'}`;
  }
  if (banner && performance.now() > bannerUntil14) {
    banner.style.opacity = '0';
    banner.style.transform = 'translate(-50%,-50%) scale(.96)';
  }
}
function updateAudio14() {
  if (!audio14) return;
  const now = audio14.currentTime;
  const speed = inVehicle && currentCar ? Math.abs(currentCar.speed) : 0;
  const ratio = inVehicle && currentCar ? Math.min(speed / Math.max(1,currentCar.max),1) : 0;
  engineOsc14.frequency.setTargetAtTime(62 + ratio*125, now, .035);
  engineGain14.gain.setTargetAtTime(inVehicle ? .012 + ratio*.028 : 0, now, .04);
  const policeOn = wanted > 0 && police.length > 0;
  sirenOsc14.frequency.setTargetAtTime(610 + Math.sin(performance.now()/145)*165, now, .025);
  sirenGain14.gain.setTargetAtTime(policeOn ? .012 + Math.min(wanted,4)*.004 : 0, now, .04);
}

const car13 = car;
car = function(x,y,rot,color,ai=false,route=null,index=0,cruise=0,safe=false) {
  const c = car13(x,y,rot,color,ai,route,index,cruise,safe);
  const cls = VEHICLE_CLASSES14[vehicleSerial14++ % VEHICLE_CLASSES14.length];
  c.max = cls.max;
  c.reverse = cls.reverse;
  c.accel = cls.accel;
  c.brake = cls.brake;
  c.drag = cls.drag;
  c.turn = cls.turn;
  c.hp = cls.hp;
  c.maxHp = cls.hp;
  c.kind = cls.id;
  c.bodyW = cls.w;
  c.bodyH = cls.h;
  return c;
};

const ped13 = ped;
ped = function(route,start,color,i) {
  const p = ped13(route,start,color,i);
  p.style = i % 4;
  return p;
};

const reset13 = reset;
reset = function() {
  vehicleSerial14 = 0;
  reset13();
};

toggleCar = (function(base) {
  return function() {
    const before = inVehicle;
    base();
    if (before !== inVehicle) sfxDoor14();
  };
})(toggleCar);

shoot = (function(base) {
  return function() {
    const before = pistolAmmo;
    base();
    if (pistolAmmo < before) sfxGun14();
  };
})(shoot);

collectPickups = (function(base) {
  return function(dt) {
    const beforeCount = pickups.length;
    const beforeAmmo = pistolAmmo;
    const beforeWanted = wanted;
    base(dt);
    if (pickups.length < beforeCount || pistolAmmo > beforeAmmo || wanted < beforeWanted) sfxPickup14();
  };
})(collectPickups);

startMission = (function(base) {
  return function() {
    const title = mission().title;
    base();
    sfxAccept14();
    flashBanner14(title, 'MISSION STARTED');
  };
})(startMission);

completeMission = (function(base) {
  return function() {
    const title = mission().title;
    const before = score;
    base();
    if (score > before) {
      sfxMission14();
      flashBanner14(title, 'MISSION COMPLETE');
    }
  };
})(completeMission);

failMission = (function(base) {
  return function(msg) {
    base(msg);
    sfxFail14();
    flashBanner14('MISSION FAILED', String(msg).replace('MISSION FAILED — ','').replace('MISSION FAILED - ',''));
  };
})(failMission);

loseLife = (function(base) {
  return function(reason) {
    const missionWasActive = activeMission();
    const beforeLives = lives;
    base(reason);
    if (lives < beforeLives && !missionWasActive) {
      sfxFail14();
      flashBanner14(reason, reason === 'BUSTED' ? 'POLICE ARREST' : 'LIFE LOST');
    }
  };
})(loseLife);

moveCar = function(c,dt,bounce) {
  if (c.destroyed) return;
  const vx = Math.sin(c.rot)*c.speed;
  const vy = -Math.cos(c.rot)*c.speed;
  const ox = c.x, oy = c.y;
  const nx = c.x + vx*dt, ny = c.y + vy*dt;
  const radius = Math.max(18, Math.min(25, (c.bodyW || 34)*.58));
  if (!collides(nx,ny,radius)) {
    c.x = nx; c.y = ny;
  } else {
    const impact = Math.abs(c.speed);
    c.x = ox; c.y = oy;
    c.speed *= bounce ? .48 : .35;
    if (!bounce && c.route) c.index = (c.index+1)%c.route.length;
    if (bounce && impact > 105 && (!c._impact14 || performance.now()-c._impact14 > 180)) {
      c._impact14 = performance.now();
      shake14 = Math.max(shake14, Math.min(10, impact/42));
      effects.push({x:c.x,y:c.y,t:.38,type:'impact',rot:c.rot});
      sfxImpact14(impact);
    }
  }
};

updateControlled = function(c,dt) {
  const gas = down('ArrowUp') || down('KeyW');
  const brake = down('ArrowDown') || down('KeyS');
  const steer = (down('ArrowRight')||down('KeyD')?1:0) - (down('ArrowLeft')||down('KeyA')?1:0);
  if (gas) c.speed = approach(c.speed,c.max,c.accel*dt);
  else if (brake) {
    if (c.speed > 20) c.speed = approach(c.speed,0,c.brake*dt);
    else c.speed = approach(c.speed,-c.reverse,c.accel*.65*dt);
  } else c.speed = approach(c.speed,0,c.drag*dt);
  if (Math.abs(c.speed) > 4) c.rot += steer*(c.turn||2.5)*Math.min(Math.abs(c.speed)/120,1)*Math.sign(c.speed)*dt;
  if (Math.abs(steer) > .5 && Math.abs(c.speed) > 255 && skidCooldown14 <= 0) {
    effects.push({x:c.x-Math.sin(c.rot)*18,y:c.y+Math.cos(c.rot)*18,t:1.05,type:'skid',rot:c.rot});
    skidCooldown14 = .09;
    sfxSkid14();
  }
  moveCar(c,dt,true);
};

drawCar = function(c) {
  ctx.save();
  ctx.translate(c.x,c.y);
  ctx.rotate(c.rot);
  let paint = c.destroyed ? '#222326' : c.color;
  if (c.flash > 0) paint = '#f5f1e9';
  const w=c.bodyW||34,h=c.bodyH||64,hw=w/2,hh=h/2;
  rect(-hw,-hh,w,h,paint);
  if (c.kind === 'VAN') {
    rect(-hw+5,-hh+10,w-10,h*.42,'#27353b');
    rect(-hw+6,4,w-12,h*.34,'rgba(25,27,29,.38)');
  } else {
    rect(-hw+4,-hh+16,w-8,Math.max(15,h*.27),'#27353b');
    rect(-hw+4,hh-24,w-8,Math.max(11,h*.2),'#1b2427');
  }
  if (c.kind === 'MUSCLE') rect(-3,-hh+3,6,h-6,'rgba(15,15,17,.52)');
  if (c.kind === 'COMPACT') {
    ctx.fillStyle='rgba(255,255,255,.18)';
    ctx.fillRect(-hw+5,-hh+8,w-10,5);
  }
  const wy=hh-19,fy=-hh+7;
  rect(-hw-1,fy,4,14,'#090909'); rect(hw-3,fy,4,14,'#090909');
  rect(-hw-1,wy,4,14,'#090909'); rect(hw-3,wy,4,14,'#090909');
  if (c.destroyed) {
    ctx.fillStyle='#e54a12';
    ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
  } else if (c.hp <= Math.ceil((c.maxHp||4)/2)) {
    ctx.fillStyle='rgba(35,35,35,.65)';
    ctx.beginPath(); ctx.arc(0,-hh-2,6+Math.sin(c.smoke)*1.5,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#fff0a0';
  ctx.beginPath(); ctx.arc(-hw*.55,-hh+3,2.3,0,Math.PI*2); ctx.arc(hw*.55,-hh+3,2.3,0,Math.PI*2); ctx.fill();
  ctx.restore();
};

drawPed = function(p) {
  ctx.save(); ctx.translate(p.x,p.y);
  if (p.dead>0 || p.down>0) {
    ctx.globalAlpha=.6; ctx.fillStyle=p.dead>0?'#5b1919':p.color;
    ctx.beginPath(); ctx.ellipse(0,0,15,7,0,0,Math.PI*2); ctx.fill(); ctx.restore(); return;
  }
  const bob=Math.sin(p.stride)*1.3,s=p.style||0;
  const skin=['#e4b88f','#c98f66','#f0c7a1','#9d684d'][s];
  const bw=[11,13,10,12][s],bh=[15,16,14,17][s];
  ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(0,-8+bob,s===2?5:5.8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=['#3a2a24','#241c18','#7b5536','#151515'][s];
  ctx.beginPath(); ctx.arc(0,-10.5+bob,5.2,Math.PI,Math.PI*2); ctx.fill();
  rect(-bw/2,-2+bob,bw,bh,p.color);
  if (s===1) rect(-bw/2-2,4+bob,2,8,'#d8d8d8');
  if (s===3) rect(bw/2,1+bob,3,11,'#2e3337');
  ctx.restore();
};

drawFx = function() {
  for (const t of tracers) {
    ctx.strokeStyle='#ffe04a'; ctx.lineWidth=3; ctx.beginPath();
    ctx.moveTo(t.x1,t.y1); ctx.lineTo(t.x2,t.y2); ctx.stroke();
  }
  for (const e of effects) {
    if (e.type==='skid') {
      ctx.save(); ctx.translate(e.x,e.y); ctx.rotate(e.rot||0);
      ctx.globalAlpha=clamp(e.t/1.05,0,.5); ctx.strokeStyle='#111'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(-9,-22); ctx.lineTo(-9,24); ctx.moveTo(9,-22); ctx.lineTo(9,24); ctx.stroke();
      ctx.restore(); continue;
    }
    if (e.type==='impact') {
      ctx.save(); ctx.translate(e.x,e.y); ctx.rotate(e.rot||0);
      ctx.globalAlpha=clamp(e.t/.38,0,1); ctx.strokeStyle='#ffb23e'; ctx.lineWidth=3;
      for (let i=0;i<6;i++) {
        const a=i*Math.PI/3,r=18+20*(1-e.t/.38);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); ctx.stroke();
      }
      ctx.restore(); continue;
    }
    ctx.strokeStyle=e.type==='bribe'?'#35e65f':'#ffe65a';
    ctx.lineWidth=3; ctx.beginPath(); ctx.arc(e.x,e.y,28*(1-e.t),0,Math.PI*2); ctx.stroke();
  }
};

update = (function(base) {
  return function(dt) {
    skidCooldown14 = Math.max(0,skidCooldown14-dt);
    shake14 = Math.max(0,shake14-dt*24);
    base(dt);
    updateAudio14();
    updateHud14();
  };
})(update);

draw = (function(base) {
  return function() {
    if (!shake14) return base();
    const ox=camera.x,oy=camera.y;
    camera.x += (Math.random()-.5)*shake14/Math.max(.3,camera.zoom);
    camera.y += (Math.random()-.5)*shake14/Math.max(.3,camera.zoom);
    base();
    camera.x=ox; camera.y=oy;
  };
})(draw);

const front14 = document.getElementById('build11-front');
if (front14) {
  front14.innerHTML = front14.innerHTML
    .replace(/BUILD 13/g,'BUILD 14')
    .replace('Mixed on-foot + vehicle objectives online','Audio + handling polish online');
}

reset();
ensureHud14();
flashBanner14('POLISH ONLINE','BUILD 14');
}
