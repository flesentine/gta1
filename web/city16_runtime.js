if (!window.__gtaBuild16City) {
window.__gtaBuild16City = true;

let pedSerial16 = 0;
let trafficSerial16 = 0;
let trafficRespawnCooldown16 = 0;
let cleanupTick16 = 0;
let retiredCount16 = 0;
const retirement16 = new Map();
const trafficColors16 = ['#3389cf','#e5a32f','#3fba74','#b65ac0','#d8d7cf','#3b3c42','#d65938','#55abb7'];
const initialTraffic16 = Math.max(12, cars.filter(c=>c.ai && !c.destroyed).length);

function decoratePed16(p) {
  if (!p || p.missionTarget15 || p.behavior16) return p;
  const types = ['COMMUTER','CAUTIOUS','STROLLER','JOGGER'];
  p.behavior16 = types[pedSerial16++ % types.length];
  p.pause16 = 0;
  p.pauseIn16 = 3.8 + (pedSerial16 % 7) * .55;
  if (p.behavior16 === 'COMMUTER') p.speed = Math.max(p.speed, 72);
  if (p.behavior16 === 'JOGGER') p.speed = Math.max(p.speed, 96);
  if (p.behavior16 === 'STROLLER') p.speed = Math.min(p.speed, 48);
  return p;
}
peds.forEach(decoratePed16);

const ped16Base = ped;
ped = function(route,start,color,i) {
  return decoratePed16(ped16Base(route,start,color,i));
};

const updatePed16Base = updatePed;
updatePed = function(p,dt) {
  if (!p || p.missionTarget15) return updatePed16Base(p,dt);
  decoratePed16(p);

  if (p.dead<=0 && p.down<=0 && p.panic<=0) {
    if (p.behavior16 === 'CAUTIOUS') {
      const threat = nearestFast(p);
      if (threat.car && threat.dist < 235 && Math.abs(threat.car.speed) > 80) {
        const dx=p.x-threat.car.x,dy=p.y-threat.car.y,m=Math.hypot(dx,dy)||1;
        p.fx=dx/m;p.fy=dy/m;p.panic=Math.max(p.panic,1.55);
      }
    } else if (p.behavior16 === 'STROLLER') {
      p.pauseIn16 -= dt;
      if (p.pause16 > 0) {
        p.pause16 = Math.max(0,p.pause16-dt);
        p.stride += dt*.4;
        return;
      }
      if (p.pauseIn16 <= 0) {
        p.pause16 = .65 + (pedSerial16 % 4)*.12;
        p.pauseIn16 = 5.2 + (pedSerial16 % 5)*.75;
        return;
      }
    }
  }
  updatePed16Base(p,dt);
};

function trafficFactor16(c) {
  if (!c || !c.ai || c.destroyed) return 1;
  const fx=Math.sin(c.rot),fy=-Math.cos(c.rot);
  let nearest=Infinity;
  for (const other of cars) {
    if (!other || other===c || other.destroyed) continue;
    const dx=other.x-c.x,dy=other.y-c.y,d=Math.hypot(dx,dy);
    if (d<1 || d>185) continue;
    const dot=(dx/d)*fx+(dy/d)*fy;
    if (dot < .78) continue;
    nearest=Math.min(nearest,d);
  }
  if (nearest < 54) return .08;
  if (nearest < 88) return .30;
  if (nearest < 128) return .58;
  if (nearest < 165) return .78;
  return 1;
}

const updateAI16Base = updateAI;
updateAI = function(c,dt) {
  if (!c) return;
  if (c._baseCruise16 == null) c._baseCruise16 = c.cruise;
  const factor = trafficFactor16(c);
  c.braking16 = factor < .72;
  const original = c.cruise;
  c.cruise = c._baseCruise16 * factor;
  updateAI16Base(c,dt);
  c.cruise = c._baseCruise16 || original;
};

const drawCar16Base = drawCar;
drawCar = function(c) {
  drawCar16Base(c);
  if (!c || !c.braking16 || c.destroyed) return;
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);
  const w=c.bodyW||34,h=c.bodyH||64,hw=w/2,hh=h/2;
  ctx.fillStyle='rgba(255,38,28,.92)';
  ctx.fillRect(-hw*.68,hh-5,5,4);ctx.fillRect(hw*.68-5,hh-5,5,4);
  ctx.restore();
};

function playerDistance16(c) {
  const t=playerTarget();
  return t && c ? Math.hypot(c.x-t.x,c.y-t.y) : Infinity;
}
function retireAge16(c,dt) {
  const key = c._build16Id || (c._build16Id = `c${Date.now()}_${Math.random()}`);
  const next=(retirement16.get(key)||0)+dt;
  retirement16.set(key,next);
  return next;
}
function clearRetire16(c) {
  if (c && c._build16Id) retirement16.delete(c._build16Id);
}
function cleanupEntities16(dt) {
  cars = cars.filter(c=>{
    if (!c) return false;
    if (c===currentCar || c===missionCar) { clearRetire16(c); return true; }
    const d=playerDistance16(c);
    let limit=Infinity;
    if (c.mission) limit=4.0;
    else if (c.destroyed && d>420) limit=11.0;
    else if (!c.ai && !c.safe && d>1250) limit=24.0;
    if (!Number.isFinite(limit)) { clearRetire16(c); return true; }
    if (retireAge16(c,dt) < limit) return true;
    clearRetire16(c); retiredCount16++; return false;
  });
}

function spawnTraffic16() {
  if (!routes || !routes.length) return false;
  const t=playerTarget();
  for (let attempt=0;attempt<routes.length*2;attempt++) {
    const r=routes[(trafficSerial16+attempt)%routes.length];
    if (!r || r.length<2) continue;
    const idx=(trafficSerial16*3+attempt)%r.length;
    const p=r[idx],q=r[(idx+1)%r.length];
    if (t && Math.hypot(p[0]-t.x,p[1]-t.y)<650) continue;
    const rot=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;
    const c=car(p[0],p[1],rot,trafficColors16[trafficSerial16%trafficColors16.length],true,r,(idx+1)%r.length,185+(trafficSerial16%4)*18);
    c._baseCruise16=c.cruise;
    cars.push(c);trafficSerial16++;return true;
  }
  trafficSerial16++;
  return false;
}
function maintainTraffic16(dt) {
  trafficRespawnCooldown16=Math.max(0,trafficRespawnCooldown16-dt);
  const live=cars.filter(c=>c.ai&&!c.destroyed).length;
  if (live<initialTraffic16 && trafficRespawnCooldown16<=0) {
    if (spawnTraffic16()) trafficRespawnCooldown16=2.4;
    else trafficRespawnCooldown16=1.0;
  }
}

const update16Base = update;
update = function(dt) {
  update16Base(dt);
  cleanupTick16 += dt;
  if (cleanupTick16 >= .5) {
    cleanupEntities16(cleanupTick16);
    cleanupTick16 = 0;
  }
  maintainTraffic16(dt);
  const bar=document.getElementById('build14-drive');
  if (bar) {
    bar.textContent=bar.textContent.replace('BUILD 15','BUILD 16').replace('BUILD 14','BUILD 16');
    const liveTraffic=cars.filter(c=>c.ai&&!c.destroyed).length;
    if (!bar.textContent.includes('CITY ')) bar.textContent += ` · CITY ${liveTraffic}C/${peds.length}P`;
  }
};

const front16=document.getElementById('build11-front');
if(front16){front16.innerHTML=front16.innerHTML.replace(/BUILD 15/g,'BUILD 16').replace('Character target + pursuit online','Living city + cleanup online');}

const openMissionMenu16Base=openMissionMenu;
openMissionMenu=function(){
  openMissionMenu16Base();
  const menu=document.getElementById('build11-missions');
  if(menu) menu.innerHTML=menu.innerHTML.replace(/BUILD (11|12|13|14|15)/g,'BUILD 16');
};

const reset16Base=reset;
reset=function(){retirement16.clear();retiredCount16=0;trafficRespawnCooldown16=0;reset16Base();peds.forEach(decoratePed16);};

if (typeof banner15 === 'function') banner15('CITY SYSTEMS ONLINE','BUILD 16');
}
