(() => {
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const detailEl = document.getElementById('detail');

const WORLD={x:-1600,y:-1200,w:3200,h:2400};
const ROAD_X=[-900,0,900], ROAD_Y=[-650,0,650], ROAD_HALF=112;
const xSpans=[[-1540,-1040],[-760,-140],[140,760],[1040,1540]];
const ySpans=[[-1140,-790],[-510,-140],[140,510],[790,1140]];
const buildings=[];
for(const xs of xSpans) for(const ys of ySpans) buildings.push({x:xs[0],y:ys[0],w:xs[1]-xs[0],h:ys[1]-ys[0]});

const routes=[
  [[-900,-650],[0,-650],[900,-650],[900,0],[900,650],[0,650],[-900,650],[-900,0]],
  [[-900,0],[0,0],[0,650],[900,650],[900,0],[0,0],[0,-650],[-900,-650]],
  [[0,-650],[900,-650],[900,0],[0,0],[-900,0],[-900,650],[0,650],[0,0]]
];
const carColors=['#287acd','#e7ac29','#35b36e','#b849b8','#dbdbd1','#2d2e32','#d35132','#57b2bd'];
const pedColors=['#337bd0','#d64a40','#2fa360','#b66bbb','#df9c31','#515159','#bdb294','#2fa3ad'];
const spawnPlan=[[0,0],[0,2],[0,4],[0,6],[1,1],[1,3],[1,5],[2,0],[2,3],[2,6]];
const sidewalkRoutes=[];
for(const xs of xSpans) for(const ys of ySpans){
  const m=38;
  sidewalkRoutes.push([[xs[0]-m,ys[0]-m],[xs[1]+m,ys[0]-m],[xs[1]+m,ys[1]+m],[xs[0]-m,ys[1]+m]]);
}

const keys=new Set();
let W=0,H=0,DPR=1,last=performance.now();
let inVehicle=false,currentCar=null,player,cars,peds,camera;

function makeCar(x,y,rot,color,ai,route,index,cruise){
  return {x,y,rot,color,ai,route,index,cruise:cruise||0,speed:ai?(cruise||200)*.7:0,max:520,reverse:180,accel:510,brake:700,drag:260};
}
function makePed(route,start,color,i){
  const p=route[start%route.length];
  return {x:p[0],y:p[1],route,index:(start+1)%route.length,color,speed:52+(i%5)*5,panic:0,down:0,fx:0,fy:1,stride:Math.random()*6};
}
function reset(){
  player={x:60,y:80,r:14,active:true};
  camera={x:30,y:40,zoom:1};
  cars=[makeCar(0,0,0,'#c72925',false,null,0,0)];
  spawnPlan.forEach((sp,i)=>{
    const route=routes[sp[0]], idx=sp[1]%route.length, next=(idx+1)%route.length;
    const p=route[idx],q=route[next],rot=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;
    cars.push(makeCar(p[0],p[1],rot,carColors[i%carColors.length],true,route,next,185+(i%4)*18));
  });
  peds=[];
  for(let i=0;i<28;i++){
    const r=sidewalkRoutes[i%sidewalkRoutes.length];
    peds.push(makePed(r,i%r.length,pedColors[i%pedColors.length],i));
  }
  inVehicle=false;currentCar=null;updateHud();
}

function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2); W=innerWidth; H=innerHeight;
  canvas.width=Math.floor(W*DPR); canvas.height=Math.floor(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener('resize',resize);resize();
function down(name){return keys.has(name);}
addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyE','KeyR'].includes(e.code)) e.preventDefault();
  if(e.code==='KeyE'&&!e.repeat) toggleCar();
  if(e.code==='KeyR'&&!e.repeat) reset();
  keys.add(e.code);
});
addEventListener('keyup',e=>keys.delete(e.code));
document.querySelectorAll('[data-key]').forEach(btn=>{
  const code=btn.dataset.key;
  const start=e=>{e.preventDefault();keys.add(code);};
  const end=e=>{e.preventDefault();keys.delete(code);};
  btn.addEventListener('pointerdown',start);btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end);btn.addEventListener('pointerleave',end);
});
document.getElementById('action').addEventListener('pointerdown',e=>{e.preventDefault();toggleCar();});

function nearestCar(){
  let best=null,dist=Infinity;
  for(const c of cars){const d=Math.hypot(player.x-c.x,player.y-c.y);if(d<dist){dist=d;best=c;}}
  return {car:best,dist};
}
function toggleCar(){
  if(inVehicle){
    player.x=currentCar.x+Math.cos(currentCar.rot)*52;player.y=currentCar.y+Math.sin(currentCar.rot)*52;
    player.active=true;currentCar.ai=false;currentCar=null;inVehicle=false;return;
  }
  const n=nearestCar();
  if(n.car&&n.dist<=92){currentCar=n.car;currentCar.ai=false;player.active=false;inVehicle=true;}
}
function collides(x,y,r=18){
  if(x-r<WORLD.x||y-r<WORLD.y||x+r>WORLD.x+WORLD.w||y+r>WORLD.y+WORLD.h)return true;
  for(const b of buildings) if(x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)return true;
  return false;
}
function updatePlayer(dt){
  if(!player.active)return;
  let dx=(down('ArrowRight')||down('KeyD')?1:0)-(down('ArrowLeft')||down('KeyA')?1:0);
  let dy=(down('ArrowDown')||down('KeyS')?1:0)-(down('ArrowUp')||down('KeyW')?1:0);
  const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
  const nx=player.x+dx*220*dt,ny=player.y+dy*220*dt;
  if(!collides(nx,player.y,player.r))player.x=nx;
  if(!collides(player.x,ny,player.r))player.y=ny;
}
function approach(v,t,a){return v<t?Math.min(v+a,t):v>t?Math.max(v-a,t):t;}
function wrapAngle(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;}
function updateControlledCar(c,dt){
  const gas=down('ArrowUp')||down('KeyW'),brake=down('ArrowDown')||down('KeyS');
  const steer=(down('ArrowRight')||down('KeyD')?1:0)-(down('ArrowLeft')||down('KeyA')?1:0);
  if(gas)c.speed=approach(c.speed,c.max,c.accel*dt);
  else if(brake){if(c.speed>20)c.speed=approach(c.speed,0,c.brake*dt);else c.speed=approach(c.speed,-c.reverse,c.accel*.65*dt);}
  else c.speed=approach(c.speed,0,c.drag*dt);
  const strength=Math.min(Math.abs(c.speed)/120,1);
  if(Math.abs(c.speed)>4)c.rot+=steer*2.5*strength*Math.sign(c.speed)*dt;
  moveCar(c,dt,true);
}
function updateAI(c,dt){
  if(!c.route||c.route.length<2)return;
  let target=c.route[c.index],dx=target[0]-c.x,dy=target[1]-c.y;
  if(Math.hypot(dx,dy)<86){c.index=(c.index+1)%c.route.length;target=c.route[c.index];dx=target[0]-c.x;dy=target[1]-c.y;}
  const desired=Math.atan2(dy,dx)+Math.PI/2,err=wrapAngle(desired-c.rot),slow=Math.max(.38,Math.min(1,1-Math.abs(err)/2.2));
  c.speed=approach(c.speed,c.cruise*slow,c.accel*.55*dt);
  const maxTurn=2.5*.72*dt;c.rot+=Math.max(-maxTurn,Math.min(maxTurn,err));moveCar(c,dt,false);
}
function moveCar(c,dt,bounce){
  const vx=Math.sin(c.rot)*c.speed,vy=-Math.cos(c.rot)*c.speed,ox=c.x,oy=c.y,nx=c.x+vx*dt,ny=c.y+vy*dt;
  if(!collides(nx,ny,20)){c.x=nx;c.y=ny;}else{c.x=ox;c.y=oy;c.speed*=bounce?.48:.35;if(!bounce&&c.route)c.index=(c.index+1)%c.route.length;}
}
function nearestFastCar(p){
  let best=null,dist=Infinity;
  for(const c of cars){if(Math.abs(c.speed)<65)continue;const d=Math.hypot(p.x-c.x,p.y-c.y);if(d<dist){dist=d;best=c;}}
  return {car:best,dist};
}
function movePed(p,vx,vy,dt){
  const nx=p.x+vx*dt,ny=p.y+vy*dt;
  if(!collides(nx,p.y,9))p.x=nx;
  if(!collides(p.x,ny,9))p.y=ny;
}
function updatePed(p,dt){
  if(p.down>0){p.down=Math.max(0,p.down-dt);return;}
  const t=nearestFastCar(p);
  let vx=0,vy=0,speed=p.speed;
  if(t.car&&t.dist<=31&&Math.abs(t.car.speed)>115){p.down=2.2;p.panic=0;return;}
  if(t.car&&t.dist<=165){
    const dx=p.x-t.car.x,dy=p.y-t.car.y,len=Math.hypot(dx,dy)||1;
    p.fx=dx/len;p.fy=dy/len;p.panic=1.35;
  }
  if(p.panic>0){p.panic=Math.max(0,p.panic-dt);vx=p.fx;vy=p.fy;speed=185;}
  else{
    let target=p.route[p.index],dx=target[0]-p.x,dy=target[1]-p.y,len=Math.hypot(dx,dy);
    if(len<22){p.index=(p.index+1)%p.route.length;target=p.route[p.index];dx=target[0]-p.x;dy=target[1]-p.y;len=Math.hypot(dx,dy);}
    len=len||1;p.fx=dx/len;p.fy=dy/len;vx=p.fx;vy=p.fy;
  }
  movePed(p,vx*speed,vy*speed,dt);p.stride+=dt*(p.panic>0?9:5);
}
function update(dt){
  updatePlayer(dt);
  for(const c of cars){if(c===currentCar&&inVehicle)updateControlledCar(c,dt);else if(c.ai)updateAI(c,dt);else c.speed=approach(c.speed,0,c.drag*dt);}
  for(const p of peds)updatePed(p,dt);
  const target=inVehicle?currentCar:player,follow=1-Math.exp(-8*dt);
  camera.x+=(target.x-camera.x)*follow;camera.y+=(target.y-camera.y)*follow;
  const ratio=inVehicle?Math.min(Math.abs(currentCar.speed)/currentCar.max,1):0,targetZoom=1+(0.62-1)*ratio;
  camera.zoom+=(targetZoom-camera.zoom)*(1-Math.exp(-4*dt));updateHud();
}
function updateHud(){
  if(!player||!cars||!peds)return;
  statusEl.textContent=inVehicle?'DRIVING':'ON FOOT';
  const traffic=cars.filter(c=>c.ai).length,activePeds=peds.filter(p=>p.down<=0).length;
  if(inVehicle) detailEl.textContent=`SPEED ${String(Math.round(Math.abs(currentCar.speed))).padStart(3,'0')}\nTRAFFIC ${String(traffic).padStart(2,'0')} · PEDS ${String(activePeds).padStart(2,'0')}`;
  else{const n=nearestCar();detailEl.textContent=(n.dist<=92?'E — STEAL VEHICLE\n':'')+`TRAFFIC ${String(traffic).padStart(2,'0')} · PEDS ${String(activePeds).padStart(2,'0')}`;}
}
function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}
function drawWorld(){
  rect(WORLD.x,WORLD.y,WORLD.w,WORLD.h,'#2b4029');ctx.fillStyle='#2b2e31';
  for(const x of ROAD_X)ctx.fillRect(x-ROAD_HALF,WORLD.y,ROAD_HALF*2,WORLD.h);
  for(const y of ROAD_Y)ctx.fillRect(WORLD.x,y-ROAD_HALF,WORLD.w,ROAD_HALF*2);
  ctx.strokeStyle='#b8aa60';ctx.lineWidth=3;ctx.setLineDash([24,24]);
  for(const x of ROAD_X){ctx.beginPath();ctx.moveTo(x,WORLD.y);ctx.lineTo(x,WORLD.y+WORLD.h);ctx.stroke();}
  for(const y of ROAD_Y){ctx.beginPath();ctx.moveTo(WORLD.x,y);ctx.lineTo(WORLD.x+WORLD.w,y);ctx.stroke();}
  ctx.setLineDash([]);
  for(const b of buildings){
    rect(b.x-22,b.y-22,b.w+44,b.h+44,'#77776e');rect(b.x,b.y,b.w,b.h,'#5c514a');rect(b.x+12,b.y+12,b.w-24,b.h-24,'#494441');
    ctx.fillStyle='rgba(255,222,137,.13)';for(let x=b.x+28;x<b.x+b.w-18;x+=54)for(let y=b.y+28;y<b.y+b.h-18;y+=54)ctx.fillRect(x,y,13,10);
  }
}
function drawCar(c){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);rect(-17,-32,34,64,c.color);rect(-13,-16,26,18,'#27353b');rect(-13,8,26,13,'#1b2427');
  rect(-18,-25,4,14,'#090909');rect(14,-25,4,14,'#090909');rect(-18,12,4,14,'#090909');rect(14,12,4,14,'#090909');
  ctx.fillStyle='#ffe995';ctx.beginPath();ctx.arc(-10,-30,2.4,0,Math.PI*2);ctx.arc(10,-30,2.4,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawPed(p){
  ctx.save();ctx.translate(p.x,p.y);
  if(p.down>0){ctx.globalAlpha=.72;ctx.fillStyle=p.color;ctx.beginPath();ctx.ellipse(0,0,15,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e4b88f';ctx.beginPath();ctx.arc(12,0,5,0,Math.PI*2);ctx.fill();ctx.restore();return;}
  const bob=Math.sin(p.stride)*1.3,leg=Math.sin(p.stride)*3;
  ctx.fillStyle='#e4b88f';ctx.beginPath();ctx.arc(0,-8+bob,5.5,0,Math.PI*2);ctx.fill();rect(-5.5,-2+bob,11,15,p.color);
  ctx.strokeStyle='#141416';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-2.5,13);ctx.lineTo(-3.5+leg,22);ctx.moveTo(2.5,13);ctx.lineTo(3.5-leg,22);ctx.stroke();ctx.restore();
}
function drawPlayer(){
  if(!player.active)return;ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');rect(player.x-9,player.y+24,7,14,'#151515');rect(player.x+2,player.y+24,7,14,'#151515');
}
function draw(){
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  drawWorld();for(const p of peds)drawPed(p);for(const c of cars)drawCar(c);drawPlayer();ctx.restore();
  if(!inVehicle){const n=nearestCar();if(n.car&&n.dist<=92){const sx=(n.car.x-camera.x)*camera.zoom+W/2,sy=(n.car.y-camera.y)*camera.zoom+H/2;ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(sx-58,sy-70,116,27);ctx.fillStyle='#fff';ctx.font='700 13px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('E  STEAL CAR',sx,sy-52);ctx.textAlign='start';}}
}
function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
})();
