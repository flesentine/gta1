(() => {
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const detailEl = document.getElementById('detail');

const WORLD = {x:-1600,y:-1200,w:3200,h:2400};
const ROAD_X = [-900,0,900];
const ROAD_Y = [-650,0,650];
const ROAD_HALF = 112;

const xSpans = [[-1540,-1040],[-760,-140],[140,760],[1040,1540]];
const ySpans = [[-1140,-790],[-510,-140],[140,510],[790,1140]];
const buildings = [];
for (const xs of xSpans) for (const ys of ySpans) buildings.push({x:xs[0],y:ys[0],w:xs[1]-xs[0],h:ys[1]-ys[0]});

const routes = [
  [[-900,-650],[0,-650],[900,-650],[900,0],[900,650],[0,650],[-900,650],[-900,0]],
  [[-900,0],[0,0],[0,650],[900,650],[900,0],[0,0],[0,-650],[-900,-650]],
  [[0,-650],[900,-650],[900,0],[0,0],[-900,0],[-900,650],[0,650],[0,0]]
];

const colors = ['#287acd','#e7ac29','#35b36e','#b849b8','#dbdbd1','#2d2e32','#d35132','#57b2bd'];
const spawnPlan = [[0,0],[0,2],[0,4],[0,6],[1,1],[1,3],[1,5],[2,0],[2,3],[2,6]];

const keys = new Set();
let W = 0, H = 0, DPR = 1;
let last = performance.now();
let inVehicle = false;
let currentCar = null;
let player;
let cars;
let camera;

function reset() {
  player = {x:60,y:80,r:14,active:true};
  camera = {x:30,y:40,zoom:1};
  cars = [];
  cars.push(makeCar(0,0,0,'#c72925',false,null,0,0));

  spawnPlan.forEach((sp,i) => {
    const route = routes[sp[0]];
    const idx = sp[1] % route.length;
    const next = (idx+1)%route.length;
    const p = route[idx], q = route[next];
    const rot = Math.atan2(q[1]-p[1], q[0]-p[0]) + Math.PI/2;
    cars.push(makeCar(p[0],p[1],rot,colors[i%colors.length],true,route,next,185+(i%4)*18));
  });
  inVehicle = false;
  currentCar = null;
  updateHud();
}

function makeCar(x,y,rot,color,ai,route,index,cruise) {
  return {x,y,rot,color,ai,route,index,cruise:cruise||0,speed:ai?(cruise||200)*.7:0,max:520,reverse:180,accel:510,brake:700,drag:260};
}

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W*DPR); canvas.height = Math.floor(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize',resize);
resize();

function down(name){ return keys.has(name); }
window.addEventListener('keydown',e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyE','KeyR'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyE' && !e.repeat) toggleCar();
  if (e.code === 'KeyR' && !e.repeat) reset();
  keys.add(e.code);
});
window.addEventListener('keyup',e => keys.delete(e.code));

document.querySelectorAll('[data-key]').forEach(btn => {
  const code = btn.dataset.key;
  const start = e => {e.preventDefault(); keys.add(code);};
  const end = e => {e.preventDefault(); keys.delete(code);};
  btn.addEventListener('pointerdown',start); btn.addEventListener('pointerup',end);
  btn.addEventListener('pointercancel',end); btn.addEventListener('pointerleave',end);
});
document.getElementById('action').addEventListener('pointerdown',e => {e.preventDefault();toggleCar();});

function nearestCar() {
  let best = null, dist = Infinity;
  for (const c of cars) {
    const d = Math.hypot(player.x-c.x,player.y-c.y);
    if (d < dist) {dist=d;best=c;}
  }
  return {car:best,dist};
}

function toggleCar() {
  if (inVehicle) {
    const sideX = Math.cos(currentCar.rot)*52;
    const sideY = Math.sin(currentCar.rot)*52;
    player.x = currentCar.x + sideX;
    player.y = currentCar.y + sideY;
    player.active = true;
    currentCar.ai = false;
    currentCar = null;
    inVehicle = false;
    return;
  }
  const n = nearestCar();
  if (n.car && n.dist <= 92) {
    currentCar = n.car;
    currentCar.ai = false;
    player.active = false;
    inVehicle = true;
  }
}

function collides(x,y,r=18) {
  if (x-r < WORLD.x || y-r < WORLD.y || x+r > WORLD.x+WORLD.w || y+r > WORLD.y+WORLD.h) return true;
  for (const b of buildings) {
    if (x+r>b.x && x-r<b.x+b.w && y+r>b.y && y-r<b.y+b.h) return true;
  }
  return false;
}

function updatePlayer(dt) {
  if (!player.active) return;
  let dx = (down('ArrowRight')||down('KeyD')?1:0) - (down('ArrowLeft')||down('KeyA')?1:0);
  let dy = (down('ArrowDown')||down('KeyS')?1:0) - (down('ArrowUp')||down('KeyW')?1:0);
  const len = Math.hypot(dx,dy) || 1;
  dx/=len; dy/=len;
  const nx = player.x + dx*220*dt;
  const ny = player.y + dy*220*dt;
  if (!collides(nx,player.y,player.r)) player.x=nx;
  if (!collides(player.x,ny,player.r)) player.y=ny;
}

function approach(v,target,amount) {
  if (v < target) return Math.min(v+amount,target);
  if (v > target) return Math.max(v-amount,target);
  return target;
}
function wrapAngle(a){ while(a>Math.PI)a-=Math.PI*2; while(a<-Math.PI)a+=Math.PI*2; return a; }

function updateControlledCar(c,dt) {
  const gas = down('ArrowUp')||down('KeyW');
  const brake = down('ArrowDown')||down('KeyS');
  const left = down('ArrowLeft')||down('KeyA');
  const right = down('ArrowRight')||down('KeyD');
  const steer = (right?1:0)-(left?1:0);

  if (gas) c.speed = approach(c.speed,c.max,c.accel*dt);
  else if (brake) {
    if (c.speed>20) c.speed=approach(c.speed,0,c.brake*dt);
    else c.speed=approach(c.speed,-c.reverse,c.accel*.65*dt);
  } else c.speed=approach(c.speed,0,c.drag*dt);

  const strength = Math.min(Math.abs(c.speed)/120,1);
  if (Math.abs(c.speed)>4) c.rot += steer*2.5*strength*Math.sign(c.speed)*dt;
  moveCar(c,dt,true);
}

function updateAI(c,dt) {
  if (!c.route || c.route.length<2) return;
  let target = c.route[c.index];
  let dx=target[0]-c.x, dy=target[1]-c.y;
  if (Math.hypot(dx,dy)<86) {
    c.index=(c.index+1)%c.route.length;
    target=c.route[c.index]; dx=target[0]-c.x;dy=target[1]-c.y;
  }
  const desired = Math.atan2(dy,dx)+Math.PI/2;
  const err = wrapAngle(desired-c.rot);
  const slow = Math.max(.38,Math.min(1,1-Math.abs(err)/2.2));
  c.speed=approach(c.speed,c.cruise*slow,c.accel*.55*dt);
  const maxTurn=2.5*.72*dt;
  c.rot += Math.max(-maxTurn,Math.min(maxTurn,err));
  moveCar(c,dt,false);
}

function moveCar(c,dt,bounce) {
  const vx=Math.sin(c.rot)*c.speed;
  const vy=-Math.cos(c.rot)*c.speed;
  const ox=c.x, oy=c.y;
  const nx=c.x+vx*dt, ny=c.y+vy*dt;
  if (!collides(nx,ny,20)) {c.x=nx;c.y=ny;}
  else {
    c.x=ox;c.y=oy;c.speed*=bounce?.48:.35;
    if (!bounce && c.route) c.index=(c.index+1)%c.route.length;
  }
}

function update(dt) {
  updatePlayer(dt);
  for (const c of cars) {
    if (c===currentCar && inVehicle) updateControlledCar(c,dt);
    else if (c.ai) updateAI(c,dt);
    else c.speed=approach(c.speed,0,c.drag*dt);
  }

  const target = inVehicle ? currentCar : player;
  const follow=1-Math.exp(-8*dt);
  camera.x += (target.x-camera.x)*follow;
  camera.y += (target.y-camera.y)*follow;
  const speedRatio=inVehicle?Math.min(Math.abs(currentCar.speed)/currentCar.max,1):0;
  const targetZoom=1+(0.62-1)*speedRatio;
  camera.zoom += (targetZoom-camera.zoom)*(1-Math.exp(-4*dt));
  updateHud();
}

function updateHud() {
  if (!player || !cars) return;
  statusEl.textContent = inVehicle ? 'DRIVING' : 'ON FOOT';
  const activeTraffic=cars.filter(c=>c.ai).length;
  if (inVehicle) {
    detailEl.textContent=`SPEED ${String(Math.round(Math.abs(currentCar.speed))).padStart(3,'0')}\nTRAFFIC ${String(activeTraffic).padStart(2,'0')}`;
  } else {
    const n=nearestCar();
    detailEl.textContent=(n.dist<=92?'E — STEAL VEHICLE\n':'')+`TRAFFIC ${String(activeTraffic).padStart(2,'0')}`;
  }
}

function rect(x,y,w,h,fill) {ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}
function drawWorld() {
  rect(WORLD.x,WORLD.y,WORLD.w,WORLD.h,'#2b4029');

  ctx.fillStyle='#2b2e31';
  for (const x of ROAD_X) ctx.fillRect(x-ROAD_HALF,WORLD.y,ROAD_HALF*2,WORLD.h);
  for (const y of ROAD_Y) ctx.fillRect(WORLD.x,y-ROAD_HALF,WORLD.w,ROAD_HALF*2);

  ctx.strokeStyle='#b8aa60';ctx.lineWidth=3;ctx.setLineDash([24,24]);
  for (const x of ROAD_X){ctx.beginPath();ctx.moveTo(x,WORLD.y);ctx.lineTo(x,WORLD.y+WORLD.h);ctx.stroke();}
  for (const y of ROAD_Y){ctx.beginPath();ctx.moveTo(WORLD.x,y);ctx.lineTo(WORLD.x+WORLD.w,y);ctx.stroke();}
  ctx.setLineDash([]);

  for (const b of buildings) {
    rect(b.x-22,b.y-22,b.w+44,b.h+44,'#77776e');
    rect(b.x,b.y,b.w,b.h,'#5c514a');
    rect(b.x+12,b.y+12,b.w-24,b.h-24,'#494441');
    ctx.fillStyle='rgba(255,222,137,.13)';
    for(let x=b.x+28;x<b.x+b.w-18;x+=54) for(let y=b.y+28;y<b.y+b.h-18;y+=54) ctx.fillRect(x,y,13,10);
  }
}

function drawCar(c) {
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);
  rect(-17,-32,34,64,c.color);
  rect(-13,-16,26,18,'#27353b');rect(-13,8,26,13,'#1b2427');
  rect(-18,-25,4,14,'#090909');rect(14,-25,4,14,'#090909');rect(-18,12,4,14,'#090909');rect(14,12,4,14,'#090909');
  ctx.fillStyle='#ffe995';ctx.beginPath();ctx.arc(-10,-30,2.4,0,Math.PI*2);ctx.arc(10,-30,2.4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawPlayer() {
  if (!player.active) return;
  ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#255ca8';ctx.fillRect(player.x-9,player.y+7,18,19);
  ctx.fillStyle='#151515';ctx.fillRect(player.x-9,player.y+24,7,14);ctx.fillRect(player.x+2,player.y+24,7,14);
}
function draw() {
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  ctx.translate(W/2,H/2);
  ctx.scale(camera.zoom,camera.zoom);
  ctx.translate(-camera.x,-camera.y);
  drawWorld();
  for(const c of cars) drawCar(c);
  drawPlayer();
  ctx.restore();

  if(!inVehicle){
    const n=nearestCar();
    if(n.car && n.dist<=92){
      const sx=(n.car.x-camera.x)*camera.zoom+W/2;
      const sy=(n.car.y-camera.y)*camera.zoom+H/2;
      ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(sx-58,sy-70,116,27);
      ctx.fillStyle='#fff';ctx.font='700 13px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('E  STEAL CAR',sx,sy-52);ctx.textAlign='start';
    }
  }
}

function frame(now) {
  const dt=Math.min((now-last)/1000,.033);last=now;
  update(dt);draw();requestAnimationFrame(frame);
}
reset();
requestAnimationFrame(frame);
})();
