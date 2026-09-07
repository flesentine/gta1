(() => {
'use strict';

const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const statusEl=document.getElementById('status'),detailEl=document.getElementById('detail');
const WORLD={x:-1600,y:-1200,w:3200,h:2400},ROAD_X=[-900,0,900],ROAD_Y=[-650,0,650],ROAD_HALF=112;
const RESPAWN={x:60,y:80},RESPRAY={x:-988,y:-365,w:176,h:130};
const PHONE={x:260,y:80},LEVEL_TARGET=5000;
const CAMPAIGN=[
 {id:'hot_property',title:'HOT PROPERTY',type:'steal_deliver',spawn:{x:900,y:-360},delivery:{x:-1025,y:565,w:250,h:170},reward:1000,color:'#1abdcf'},
 {id:'short_fuse',title:'SHORT FUSE',type:'destroy_target',spawn:{x:900,y:330},time:35,reward:1500,color:'#ef6124',ammo:10},
 {id:'clean_break',title:'CLEAN BREAK',type:'lose_wanted',time:45,reward:2000,wanted:3}
];
const xSpans=[[-1540,-1040],[-760,-140],[140,760],[1040,1540]],ySpans=[[-1140,-790],[-510,-140],[140,510],[790,1140]];
const buildings=[];for(const xs of xSpans)for(const ys of ySpans)buildings.push({x:xs[0],y:ys[0],w:xs[1]-xs[0],h:ys[1]-ys[0]});
const routes=[
[[-900,-650],[0,-650],[900,-650],[900,0],[900,650],[0,650],[-900,650],[-900,0]],
[[-900,0],[0,0],[0,650],[900,650],[900,0],[0,0],[0,-650],[-900,-650]],
[[0,-650],[900,-650],[900,0],[0,0],[-900,0],[-900,650],[0,650],[0,0]]];
const carColors=['#287acd','#e7ac29','#35b36e','#b849b8','#dbdbd1','#2d2e32','#d35132','#57b2bd'];
const pedColors=['#337bd0','#d64a40','#2fa360','#b66bbb','#df9c31','#515159','#bdb294','#2fa3ad'];
const spawnPlan=[[0,0],[0,2],[0,4],[0,6],[1,1],[1,3],[1,5],[2,0],[2,3],[2,6]];
const sidewalkRoutes=[];for(const xs of xSpans)for(const ys of ySpans){const m=38;sidewalkRoutes.push([[xs[0]-m,ys[0]-m],[xs[1]+m,ys[0]-m],[xs[1]+m,ys[1]+m],[xs[0]-m,ys[1]+m]]);}

const keys=new Set();let W=0,H=0,DPR=1,last=performance.now();
let player,camera,cars,peds,pickups,police,tracers,effects,currentCar=null,inVehicle=false;
let pistolOwned=false,pistolAmmo=0,shotCooldown=0,wanted=0,wantedTimer=0,policeCooldown=0,stolenCars=new Set();
let lives=3,arrest=0,respawnTimer=0,gameOver=false,statusMessage='',statusTimer=0,resprayCooldown=0;
let campaignIndex=0,missionState='available',missionCar=null,missionCooldown=0,missionTimer=0,score=0,multiplier=1;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const approach=(v,t,a)=>v<t?Math.min(v+a,t):v>t?Math.max(v-a,t):t;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const inside=(p,r)=>!!p&&p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
const activeMission=()=>['steal','deliver','destroy','escape'].includes(missionState);
const mission=()=>CAMPAIGN[Math.min(campaignIndex,CAMPAIGN.length-1)];
function wrap(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;}
function car(x,y,rot,color,ai=false,route=null,index=0,cruise=0,safe=false){return{x,y,rot,color,ai,route,index,cruise,speed:ai?cruise*.7:0,max:520,reverse:180,accel:510,brake:700,drag:260,hp:4,destroyed:false,flash:0,smoke:0,safe,mission:false};}
function ped(route,start,color,i){const p=route[start%route.length];return{x:p[0],y:p[1],route,index:(start+1)%route.length,color,speed:52+(i%5)*5,panic:0,down:0,dead:0,fx:0,fy:1,stride:Math.random()*6,hp:2};}
function cop(x,y,level){return{x,y,rot:0,speed:170,max:350+level*38,accel:520+level*55,turn:2.8,level,siren:Math.random()*6,stuck:0};}

function reset(){
 player={x:RESPAWN.x,y:RESPAWN.y,r:14,active:true,fx:0,fy:-1};camera={x:30,y:40,zoom:1};
 cars=[car(0,0,0,'#c72925',false,null,0,0,true)];
 spawnPlan.forEach((sp,i)=>{const r=routes[sp[0]],idx=sp[1]%r.length,n=(idx+1)%r.length,p=r[idx],q=r[n],rot=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2;cars.push(car(p[0],p[1],rot,carColors[i%carColors.length],true,r,n,185+(i%4)*18));});
 peds=[];for(let i=0;i<28;i++){const r=sidewalkRoutes[i%sidewalkRoutes.length];peds.push(ped(r,i%r.length,pedColors[i%pedColors.length],i));}
 pickups=[{kind:'pistol',x:125,y:82,amount:12,t:0},{kind:'ammo',x:-75,y:82,amount:10,t:1},{kind:'ammo',x:82,y:-120,amount:10,t:2},{kind:'ammo',x:-900,y:-520,amount:10,t:3},{kind:'ammo',x:900,y:520,amount:10,t:4},{kind:'ammo',x:900,y:-520,amount:10,t:5},{kind:'ammo',x:-900,y:520,amount:10,t:6},{kind:'bribe',x:-1020,y:0,amount:1,t:0},{kind:'bribe',x:1020,y:650,amount:1,t:1},{kind:'bribe',x:0,y:-770,amount:1,t:2},{kind:'bribe',x:0,y:770,amount:1,t:3}];
 police=[];tracers=[];effects=[];currentCar=null;inVehicle=false;pistolOwned=false;pistolAmmo=0;shotCooldown=0;wanted=0;wantedTimer=0;policeCooldown=0;stolenCars=new Set();lives=3;arrest=0;respawnTimer=0;gameOver=false;statusMessage='';statusTimer=0;resprayCooldown=0;
 campaignIndex=0;missionState='available';missionCar=null;missionCooldown=0;missionTimer=0;score=0;multiplier=1;updateHud();
}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);}addEventListener('resize',resize);resize();
const down=k=>keys.has(k);
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyE','KeyR','Space','KeyF'].includes(e.code))e.preventDefault();if(respawnTimer<=0){if(e.code==='KeyE'&&!e.repeat)toggleCar();if((e.code==='Space'||e.code==='KeyF')&&!e.repeat)shoot();}if(e.code==='KeyR'&&!e.repeat)reset();keys.add(e.code);});
addEventListener('keyup',e=>keys.delete(e.code));
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key,start=e=>{e.preventDefault();if(respawnTimer<=0)keys.add(k);},end=e=>{e.preventDefault();keys.delete(k);};b.addEventListener('pointerdown',start);b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);b.addEventListener('pointerleave',end);});
document.getElementById('action').addEventListener('pointerdown',e=>{e.preventDefault();if(respawnTimer<=0)toggleCar();});
document.getElementById('fire').addEventListener('pointerdown',e=>{e.preventDefault();if(respawnTimer<=0)shoot();});

function playerTarget(){return inVehicle&&currentCar?currentCar:player;}
function nearestCar(){let best=null,d=Infinity;for(const c of cars){if(c.destroyed)continue;const x=dist(player,c);if(x<d){d=x;best=c;}}return{car:best,dist:d};}
function clearPolice(){police.length=0;policeCooldown=0;}
function clearWanted(msg=''){wanted=0;wantedTimer=0;arrest=0;clearPolice();if(msg){statusMessage=msg;statusTimer=2;}}
function raiseWanted(n=1){wanted=clamp(wanted+n,0,4);wantedTimer=13+wanted*2;policeCooldown=Math.min(policeCooldown,.3);}
function wantedAtLeast(n){if(wanted<n)raiseWanted(n-wanted);else if(wanted>0)wantedTimer=Math.max(wantedTimer,13+wanted*2);}
function toggleCar(){if(inVehicle){player.x=currentCar.x+Math.cos(currentCar.rot)*52;player.y=currentCar.y+Math.sin(currentCar.rot)*52;player.active=true;currentCar.ai=false;currentCar=null;inVehicle=false;return;}const n=nearestCar();if(n.car&&n.dist<=92){currentCar=n.car;currentCar.ai=false;player.active=false;inVehicle=true;const i=cars.indexOf(currentCar);if(!currentCar.safe&&!stolenCars.has(i)){stolenCars.add(i);raiseWanted(1);}}}
function collides(x,y,r=18){if(x-r<WORLD.x||y-r<WORLD.y||x+r>WORLD.x+WORLD.w||y+r>WORLD.y+WORLD.h)return true;for(const b of buildings)if(x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)return true;return false;}
function updatePlayer(dt){if(!player.active)return;let dx=(down('ArrowRight')||down('KeyD')?1:0)-(down('ArrowLeft')||down('KeyA')?1:0),dy=(down('ArrowDown')||down('KeyS')?1:0)-(down('ArrowUp')||down('KeyW')?1:0),m=Math.hypot(dx,dy);if(m){dx/=m;dy/=m;player.fx=dx;player.fy=dy;}const nx=player.x+dx*220*dt,ny=player.y+dy*220*dt;if(!collides(nx,player.y,player.r))player.x=nx;if(!collides(player.x,ny,player.r))player.y=ny;}
function moveCar(c,dt,bounce){if(c.destroyed)return;const vx=Math.sin(c.rot)*c.speed,vy=-Math.cos(c.rot)*c.speed,ox=c.x,oy=c.y,nx=c.x+vx*dt,ny=c.y+vy*dt;if(!collides(nx,ny,20)){c.x=nx;c.y=ny;}else{c.x=ox;c.y=oy;c.speed*=bounce?.48:.35;if(!bounce&&c.route)c.index=(c.index+1)%c.route.length;}}
function updateControlled(c,dt){const gas=down('ArrowUp')||down('KeyW'),brake=down('ArrowDown')||down('KeyS'),steer=(down('ArrowRight')||down('KeyD')?1:0)-(down('ArrowLeft')||down('KeyA')?1:0);if(gas)c.speed=approach(c.speed,c.max,c.accel*dt);else if(brake){if(c.speed>20)c.speed=approach(c.speed,0,c.brake*dt);else c.speed=approach(c.speed,-c.reverse,c.accel*.65*dt);}else c.speed=approach(c.speed,0,c.drag*dt);if(Math.abs(c.speed)>4)c.rot+=steer*2.5*Math.min(Math.abs(c.speed)/120,1)*Math.sign(c.speed)*dt;moveCar(c,dt,true);}
function updateAI(c,dt){if(!c.route||c.route.length<2||c.destroyed)return;let t=c.route[c.index],dx=t[0]-c.x,dy=t[1]-c.y;if(Math.hypot(dx,dy)<86){c.index=(c.index+1)%c.route.length;t=c.route[c.index];dx=t[0]-c.x;dy=t[1]-c.y;}const desired=Math.atan2(dy,dx)+Math.PI/2,e=wrap(desired-c.rot),slow=clamp(1-Math.abs(e)/2.2,.38,1);c.speed=approach(c.speed,c.cruise*slow,c.accel*.55*dt);c.rot+=clamp(e,-2.5*.72*dt,2.5*.72*dt);moveCar(c,dt,false);}

function nearestFast(p){let best=null,d=Infinity;for(const c of cars.concat(police)){if(c.destroyed||Math.abs(c.speed)<65)continue;const x=dist(p,c);if(x<d){d=x;best=c;}}return{car:best,dist:d};}
function updatePed(p,dt){if(p.dead>0){p.dead=Math.max(0,p.dead-dt);if(!p.dead)p.hp=2;return;}if(p.down>0){p.down=Math.max(0,p.down-dt);return;}const t=nearestFast(p);let vx=0,vy=0,s=p.speed;if(t.car&&t.dist<=31&&Math.abs(t.car.speed)>115){p.down=2.2;p.panic=0;return;}if(t.car&&t.dist<=165){const dx=p.x-t.car.x,dy=p.y-t.car.y,m=Math.hypot(dx,dy)||1;p.fx=dx/m;p.fy=dy/m;p.panic=1.35;}if(p.panic>0){p.panic=Math.max(0,p.panic-dt);vx=p.fx;vy=p.fy;s=185;}else{let t2=p.route[p.index],dx=t2[0]-p.x,dy=t2[1]-p.y,m=Math.hypot(dx,dy);if(m<22){p.index=(p.index+1)%p.route.length;t2=p.route[p.index];dx=t2[0]-p.x;dy=t2[1]-p.y;m=Math.hypot(dx,dy);}m=m||1;p.fx=dx/m;p.fy=dy/m;vx=p.fx;vy=p.fy;}const nx=p.x+vx*s*dt,ny=p.y+vy*s*dt;if(!collides(nx,p.y,9))p.x=nx;if(!collides(p.x,ny,9))p.y=ny;p.stride+=dt*(p.panic>0?9:5);}

function collectPickups(dt){for(const p of pickups)p.t+=dt*3;if(inVehicle)return;pickups=pickups.filter(p=>{if(dist(player,p)>31)return true;if(p.kind==='bribe'){if(wanted<=0)return true;wanted=Math.max(0,wanted-p.amount);wantedTimer=wanted?7:0;statusMessage='POLICE BRIBE  -1 WANTED';statusTimer=1.6;if(!wanted)clearPolice();effects.push({x:p.x,y:p.y,t:.45,type:'bribe'});return false;}if(p.kind==='pistol')pistolOwned=true;pistolAmmo+=p.amount;effects.push({x:p.x,y:p.y,t:.45,type:'pickup'});return false;});}
function checkRespray(){if(inVehicle&&currentCar&&wanted>0&&resprayCooldown<=0&&inside(currentCar,RESPRAY)&&Math.abs(currentCar.speed)<=85){clearWanted('RES-PRAYED — WANTED CLEARED');resprayCooldown=2;}}
function rayCircle(ox,oy,dx,dy,cx,cy,r,max){const vx=cx-ox,vy=cy-oy,p=vx*dx+vy*dy;if(p<0||p>max)return null;return Math.hypot(cx-(ox+dx*p),cy-(oy+dy*p))<=r?p:null;}
function wallDist(ox,oy,dx,dy){for(let t=8;t<=560;t+=8)if(collides(ox+dx*t,oy+dy*t,2))return t;return 560;}
function shoot(){if(inVehicle||!pistolOwned||pistolAmmo<=0||shotCooldown>0||respawnTimer>0)return;pistolAmmo--;shotCooldown=.24;const dx=player.fx,dy=player.fy,ox=player.x+dx*24,oy=player.y+dy*24,max=wallDist(ox,oy,dx,dy);let best=max,target=null,type='';for(const p of peds){if(p.dead>0)continue;const h=rayCircle(ox,oy,dx,dy,p.x,p.y,14,max);if(h!==null&&h<best){best=h;target=p;type='ped';}}for(const c of cars){if(c.destroyed)continue;const h=rayCircle(ox,oy,dx,dy,c.x,c.y,26,max);if(h!==null&&h<best){best=h;target=c;type='car';}}if(type==='ped'){target.hp-=2;raiseWanted();if(target.hp<=0){target.dead=4.5;target.down=0;target.panic=0;}}else if(type==='car'){target.hp--;target.flash=.12;if(target.hp<=0){target.hp=0;target.destroyed=true;target.ai=false;target.speed=0;effects.push({x:target.x,y:target.y,t:.8,type:'boom'});raiseWanted();if(target===currentCar&&inVehicle)loseLife('WASTED');}}for(const p of peds)if(p.dead<=0&&Math.hypot(p.x-ox,p.y-oy)<=360){const ax=p.x-ox,ay=p.y-oy,m=Math.hypot(ax,ay)||1;p.fx=ax/m;p.fy=ay/m;p.panic=Math.max(p.panic,1.8);}tracers.push({x1:ox,y1:oy,x2:ox+dx*best,y2:oy+dy*best,t:.09});}

function nearestPolice(){let d=Infinity,t=playerTarget();for(const c of police)d=Math.min(d,dist(t,c));return d;}
function updateWanted(dt){if(!wanted){wantedTimer=0;return;}if(nearestPolice()<=620)wantedTimer=Math.max(wantedTimer,5);else if((wantedTimer-=dt)<=0){wanted=Math.max(0,wanted-1);wantedTimer=wanted?8:0;if(!wanted)clearPolice();}}
function spawnPolice(){const t=playerTarget(),offs=[[0,-620],[620,0],[0,620],[-620,0],[430,-430],[-430,430]],o=offs[(police.length+wanted)%offs.length],x=clamp(t.x+o[0],-1500,1500),y=clamp(t.y+o[1],-1100,1100),c=cop(x,y,wanted);c.rot=Math.atan2(t.y-y,t.x-x)+Math.PI/2;police.push(c);}
function updateCop(c,dt){const t=playerTarget(),dx=t.x-c.x,dy=t.y-c.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx)+Math.PI/2,e=wrap(a-c.rot),slow=clamp(1-Math.abs(e)/2.4,.42,1);c.speed=approach(c.speed,d<120?c.max:c.max*slow,c.accel*dt);c.rot+=clamp(e,-c.turn*dt,c.turn*dt);const vx=Math.sin(c.rot)*c.speed,vy=-Math.cos(c.rot)*c.speed,nx=c.x+vx*dt,ny=c.y+vy*dt;if(!collides(nx,ny,21)){c.x=nx;c.y=ny;c.stuck=Math.max(0,c.stuck-dt*2);}else{c.speed*=.58;c.stuck+=dt;}if(c.stuck>1){c.rot+=Math.PI*.42;c.speed=c.max*.38;c.stuck=0;}c.siren+=dt*9;}
function updatePolice(dt){policeCooldown=Math.max(0,policeCooldown-dt);if(!wanted){police=[];return;}let n=Math.min(wanted+(wanted>=3?1:0),5);if(police.length<n&&policeCooldown<=0){spawnPolice();policeCooldown=Math.max(.7,2-wanted*.25);}for(const c of police){c.max=350+wanted*38;c.accel=520+wanted*55;updateCop(c,dt);}}
function checkConsequences(dt){if(!wanted||inVehicle){arrest=0;return;}let near=Infinity;for(const c of police){const d=dist(player,c);near=Math.min(near,d);if(d<=44&&Math.abs(c.speed)>=170){loseLife('WASTED');return;}}if(near<=54){arrest+=dt;if(arrest>=1.15)loseLife('BUSTED');}else arrest=Math.max(0,arrest-dt*2);}
function loseLife(reason){if(respawnTimer>0)return;if(activeMission())failMission('MISSION FAILED — LOST A LIFE');lives=Math.max(0,lives-1);statusMessage=reason;statusTimer=2;arrest=0;wanted=0;wantedTimer=0;pistolOwned=false;pistolAmmo=0;tracers=[];clearPolice();currentCar=null;inVehicle=false;player.x=RESPAWN.x;player.y=RESPAWN.y;player.active=false;gameOver=!lives;respawnTimer=gameOver?2.2:1.25;if(gameOver)statusMessage='GAME OVER';}

function spawnMissionCar(m){missionCar=car(m.spawn.x,m.spawn.y,Math.PI/2,m.color);missionCar.mission=true;cars.push(missionCar);}
function startMission(){
 const m=mission();missionTimer=m.time||0;
 if(m.type==='steal_deliver'){missionState='steal';spawnMissionCar(m);statusMessage=`${m.title} — STEAL THE MARKED CAR`;}
 else if(m.type==='destroy_target'){missionState='destroy';spawnMissionCar(m);pistolOwned=true;pistolAmmo=Math.max(pistolAmmo,m.ammo||10);statusMessage=`${m.title} — DESTROY THE MARKED CAR`;}
 else if(m.type==='lose_wanted'){missionState='escape';wantedAtLeast(m.wanted||3);statusMessage=`${m.title} — LOSE THE COPS`;}
 statusTimer=2.4;
}
function completeMission(){
 const m=mission(),reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);missionCar=null;missionTimer=0;campaignIndex++;
 if(campaignIndex>=CAMPAIGN.length){missionState='campaign_complete';missionCooldown=5;statusMessage=`CAMPAIGN COMPLETE +${reward}${score>=LEVEL_TARGET?' — LEVEL TARGET CLEARED':''}`;statusTimer=4;}
 else{missionState='cooldown';missionCooldown=3;statusMessage=`MISSION COMPLETE +${reward} — NEXT: ${mission().title}`;statusTimer=3;}
}
function failMission(msg){missionState='cooldown';missionCooldown=3;missionTimer=0;missionCar=null;statusMessage=msg;statusTimer=2.2;}
function updateMission(dt){
 if(missionCooldown>0){missionCooldown=Math.max(0,missionCooldown-dt);if(!missionCooldown){if(missionState==='campaign_complete')campaignIndex=0;missionState='available';statusMessage='MISSION PHONE READY';statusTimer=1.2;}}
 if(activeMission()&&(mission().time||0)>0){missionTimer=Math.max(0,missionTimer-dt);if(!missionTimer){failMission('MISSION FAILED — TIME EXPIRED');return;}}
 if(respawnTimer>0)return;
 if(missionState==='available'&&!inVehicle&&dist(player,PHONE)<=34)startMission();
 else if(missionState==='steal'){if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — CAR DESTROYED');else if(inVehicle&&currentCar===missionCar){missionState='deliver';statusMessage='TARGET ACQUIRED — DELIVER THE CAR';statusTimer=2;}}
 else if(missionState==='deliver'){if(!missionCar||missionCar.destroyed)failMission('MISSION FAILED — CAR DESTROYED');else if(inVehicle&&currentCar===missionCar&&inside(missionCar,mission().delivery)&&Math.abs(missionCar.speed)<=75)completeMission();}
 else if(missionState==='destroy'){if(!missionCar)failMission('MISSION FAILED — TARGET LOST');else if(missionCar.destroyed)completeMission();}
 else if(missionState==='escape'&&wanted<=0)completeMission();
}
function missionText(){
 const m=mission(),time=activeMission()&&m.time?` · ${Math.ceil(missionTimer)}s`:'';
 if(missionState==='available')return`${m.title}: TOUCH BLUE PHONE`;
 if(missionState==='steal')return`STEAL THE MARKED TEAL CAR${time}`;
 if(missionState==='deliver')return`${inside(missionCar,m.delivery)?'DELIVERY BAY — SLOW BELOW 75':'DELIVER CAR TO YELLOW BAY'}${time}`;
 if(missionState==='destroy')return`DESTROY THE MARKED ORANGE CAR${time}`;
 if(missionState==='escape')return`CLEAR ALL WANTED HEADS${time}`;
 if(missionState==='campaign_complete')return'MINI CAMPAIGN COMPLETE';
 return`NEXT: ${m.title}`;
}

function update(dt){
 shotCooldown=Math.max(0,shotCooldown-dt);resprayCooldown=Math.max(0,resprayCooldown-dt);statusTimer=Math.max(0,statusTimer-dt);
 for(const c of cars){c.flash=Math.max(0,c.flash-dt);c.smoke+=dt*4;}tracers=tracers.filter(t=>(t.t-=dt)>0);effects=effects.filter(e=>(e.t-=dt)>0);
 if(respawnTimer>0){respawnTimer=Math.max(0,respawnTimer-dt);if(!respawnTimer){if(gameOver){reset();return;}player.active=true;statusMessage='BACK ON THE STREET';statusTimer=1.2;}updateCamera(dt);updateHud();return;}
 updatePlayer(dt);for(const c of cars){if(c===currentCar&&inVehicle)updateControlled(c,dt);else if(c.ai)updateAI(c,dt);else if(!c.destroyed)c.speed=approach(c.speed,0,c.drag*dt);}for(const p of peds)updatePed(p,dt);
 collectPickups(dt);checkRespray();updateMission(dt);if(inVehicle&&currentCar&&currentCar.destroyed){loseLife('WASTED');return;}updateWanted(dt);updatePolice(dt);checkConsequences(dt);if(respawnTimer>0)return;updateCamera(dt);updateHud();
}
function updateCamera(dt){const t=playerTarget(),f=1-Math.exp(-8*dt);camera.x+=(t.x-camera.x)*f;camera.y+=(t.y-camera.y)*f;const z=inVehicle&&currentCar?1-.38*Math.min(Math.abs(currentCar.speed)/currentCar.max,1):1;camera.zoom+=(z-camera.zoom)*(1-Math.exp(-4*dt));}
function wantedText(){let s='';for(let i=0;i<4;i++)s+=i<wanted?'●':'○';return s;}
function updateHud(){
 statusEl.textContent=respawnTimer>0?statusMessage:(inVehicle?'DRIVING':'ON FOOT');
 const traffic=cars.filter(c=>c.ai&&!c.destroyed).length,pedn=peds.filter(p=>p.down<=0&&p.dead<=0).length,weapon=pistolOwned?`PISTOL ${String(pistolAmmo).padStart(3,'0')}`:'PISTOL --',bust=arrest>0?` · BUST ${Math.round(clamp(arrest/1.15,0,1)*100)}%`:'',msg=(statusTimer>0||respawnTimer>0)?`\n*** ${statusMessage} ***`:'';let first='';
 if(inVehicle)first=`SPEED ${String(Math.round(Math.abs(currentCar.speed))).padStart(3,'0')}${inside(currentCar,RESPRAY)&&wanted?'\nRES-PRAY: SLOW DOWN TO CLEAR HEAT':''}\n`;else{const n=nearestCar();if(n.dist<=92)first='E — STEAL VEHICLE\n';}
 const step=Math.min(campaignIndex+1,CAMPAIGN.length);
 detailEl.textContent=`${first}${weapon}\nWANTED ${wantedText()}${bust} · POLICE ${String(police.length).padStart(2,'0')}\nLIVES ${lives} · TRAFFIC ${String(traffic).padStart(2,'0')} · PEDS ${String(pedn).padStart(2,'0')}\nCAMPAIGN ${step}/${CAMPAIGN.length}: ${missionText()}\nSCORE ${String(score).padStart(7,'0')} · TARGET ${LEVEL_TARGET} · x${multiplier}${msg}`;
}

function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function drawWorld(){
 rect(WORLD.x,WORLD.y,WORLD.w,WORLD.h,'#2b4029');ctx.fillStyle='#2b2e31';for(const x of ROAD_X)ctx.fillRect(x-ROAD_HALF,WORLD.y,ROAD_HALF*2,WORLD.h);for(const y of ROAD_Y)ctx.fillRect(WORLD.x,y-ROAD_HALF,WORLD.w,ROAD_HALF*2);
 ctx.strokeStyle='#b8aa60';ctx.lineWidth=3;ctx.setLineDash([24,24]);for(const x of ROAD_X){ctx.beginPath();ctx.moveTo(x,WORLD.y);ctx.lineTo(x,WORLD.y+WORLD.h);ctx.stroke();}for(const y of ROAD_Y){ctx.beginPath();ctx.moveTo(WORLD.x,y);ctx.lineTo(WORLD.x+WORLD.w,y);ctx.stroke();}ctx.setLineDash([]);
 for(const b of buildings){rect(b.x-22,b.y-22,b.w+44,b.h+44,'#77776e');rect(b.x,b.y,b.w,b.h,'#5c514a');rect(b.x+12,b.y+12,b.w-24,b.h-24,'#494441');}
 rect(RESPRAY.x,RESPRAY.y,RESPRAY.w,RESPRAY.h,'rgba(185,42,168,.32)');ctx.strokeStyle='#f05bd9';ctx.lineWidth=5;ctx.strokeRect(RESPRAY.x,RESPRAY.y,RESPRAY.w,RESPRAY.h);
}
function drawCar(c){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);let paint=c.destroyed?'#222326':c.color;if(c.flash>0)paint='#f5f1e9';rect(-17,-32,34,64,paint);rect(-13,-16,26,18,'#27353b');rect(-13,8,26,13,'#1b2427');rect(-18,-25,4,14,'#090909');rect(14,-25,4,14,'#090909');rect(-18,12,4,14,'#090909');rect(14,12,4,14,'#090909');if(c.destroyed){ctx.fillStyle='#e54a12';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();}else if(c.hp<=2){ctx.fillStyle='rgba(35,35,35,.65)';ctx.beginPath();ctx.arc(0,-34,6+Math.sin(c.smoke)*1.5,0,Math.PI*2);ctx.fill();}ctx.restore();}
function drawCop(c){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);rect(-18,-33,36,66,'#e1e3e6');rect(-18,-2,36,35,'#1f232b');rect(-13,-17,26,18,'#2d414e');const f=Math.sin(c.siren)>0;rect(-11,-5,10,5,f?'#f12b31':'#335ed7');rect(1,-5,10,5,f?'#335ed7':'#f12b31');ctx.restore();}
function drawPed(p){ctx.save();ctx.translate(p.x,p.y);if(p.dead>0||p.down>0){ctx.globalAlpha=.6;ctx.fillStyle=p.dead>0?'#5b1919':p.color;ctx.beginPath();ctx.ellipse(0,0,15,7,0,0,Math.PI*2);ctx.fill();ctx.restore();return;}const bob=Math.sin(p.stride)*1.3;ctx.fillStyle='#e4b88f';ctx.beginPath();ctx.arc(0,-8+bob,5.5,0,Math.PI*2);ctx.fill();rect(-5.5,-2+bob,11,15,p.color);ctx.restore();}
function drawPickup(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.kind==='bribe'?Math.PI/4:p.t*.25);ctx.strokeStyle='#161616';ctx.lineWidth=3;if(p.kind==='bribe'){ctx.fillStyle='#34cf5c';ctx.fillRect(-11,-11,22,22);ctx.strokeRect(-11,-11,22,22);}else{ctx.fillStyle=p.kind==='pistol'?'#f4d548':'#f0a431';ctx.fillRect(-12,-8,24,16);ctx.strokeRect(-12,-8,24,16);}ctx.restore();}
function drawPlayer(){if(!player.active)return;ctx.fillStyle='#f2d1aa';ctx.beginPath();ctx.arc(player.x,player.y,10,0,Math.PI*2);ctx.fill();rect(player.x-9,player.y+7,18,19,'#255ca8');ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+player.fx*21,player.y+player.fy*21);ctx.stroke();}
function drawMission(){
 const t=performance.now()/1000,pulse=1+Math.sin(t*5)*.08,m=mission();
 if(missionState==='available'){ctx.fillStyle='rgba(35,190,255,.25)';ctx.beginPath();ctx.arc(PHONE.x,PHONE.y,30*pulse,0,Math.PI*2);ctx.fill();ctx.fillStyle='#167fb8';ctx.beginPath();ctx.arc(PHONE.x,PHONE.y,22,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(PHONE.x,PHONE.y,13,.45,2.7);ctx.stroke();}
 if(['steal','deliver','destroy'].includes(missionState)&&missionCar){ctx.strokeStyle=missionState==='destroy'?'#ff4e25':'#ffd62e';ctx.lineWidth=4;ctx.beginPath();ctx.arc(missionCar.x,missionCar.y,40*pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.moveTo(missionCar.x-10,missionCar.y-65);ctx.lineTo(missionCar.x+10,missionCar.y-65);ctx.lineTo(missionCar.x,missionCar.y-50);ctx.fill();}
 if(missionState==='deliver'){ctx.fillStyle='rgba(246,198,28,.24)';ctx.fillRect(m.delivery.x,m.delivery.y,m.delivery.w,m.delivery.h);ctx.strokeStyle='#ffdc3b';ctx.lineWidth=6;ctx.strokeRect(m.delivery.x,m.delivery.y,m.delivery.w,m.delivery.h);}
 if(missionState==='escape'){const p=playerTarget();ctx.strokeStyle='rgba(255,65,30,.75)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,55*pulse,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(50,115,255,.48)';ctx.beginPath();ctx.arc(p.x,p.y,68*pulse,0,Math.PI*2);ctx.stroke();}
}
function drawFx(){for(const t of tracers){ctx.strokeStyle='#ffe04a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(t.x1,t.y1);ctx.lineTo(t.x2,t.y2);ctx.stroke();}for(const e of effects){ctx.strokeStyle=e.type==='bribe'?'#35e65f':'#ffe65a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,28*(1-e.t),0,Math.PI*2);ctx.stroke();}}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);drawWorld();drawMission();for(const p of pickups)drawPickup(p);for(const p of peds)drawPed(p);for(const c of cars)drawCar(c);for(const c of police)drawCop(c);drawPlayer();drawFx();ctx.restore();}
function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(frame);}reset();requestAnimationFrame(frame);
})();
