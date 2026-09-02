window.__gtaBuild28Combat = true;

const THREE_FRONTS28={
  id:'three_fronts',title:'THREE FRONTS',type:'cross_sector_combat',time:190,reward:15000,
  armory:{x:4100,y:-1200},
  targetPositions:[[5000,650],[900,0],[-4100,650]],
  targetHealth:6,smgAmmo:90,escapeWanted:4
};
if(!CAMPAIGN.some(m=>m.id==='three_fronts'))CAMPAIGN.push(THREE_FRONTS28);

let smgOwned28=false;
let smgAmmo28=0;
let frontTarget28=null;
let frontStage28=0;

function weaponText28(){
  if(weapon27==='SMG'&&smgOwned28)return`SMG ${String(smgAmmo28).padStart(3,'0')}`;
  if(weapon27==='SHOTGUN'&&shotgunOwned27)return`SHOTGUN ${String(shotgunAmmo27).padStart(3,'0')}`;
  if(pistolOwned)return`PISTOL ${String(pistolAmmo).padStart(3,'0')}`;
  if(shotgunOwned27)return`SHOTGUN ${String(shotgunAmmo27).padStart(3,'0')}`;
  if(smgOwned28)return`SMG ${String(smgAmmo28).padStart(3,'0')}`;
  return'UNARMED';
}
function installSmgPickups28(){
  const wanted=[
    {kind:'smg',x:4100,y:-1180,amount:45,t:0},
    {kind:'smg_ammo',x:5000,y:-650,amount:30,t:1},
    {kind:'smg_ammo',x:3200,y:650,amount:30,t:2}
  ];
  for(const p of wanted)if(!pickups.some(q=>q.kind===p.kind&&Math.hypot(q.x-p.x,q.y-p.y)<3))pickups.push({...p});
}
function grantSmg28(ammo=45){
  smgOwned28=true;smgAmmo28=Math.max(smgAmmo28,ammo);weapon27='SMG';
  statusMessage=`SMG ACQUIRED — ${smgAmmo28} ROUNDS`;statusTimer=1.8;
  if(typeof sfxPickup14==='function')sfxPickup14();
  if(typeof banner15==='function')banner15('SMG ACQUIRED','Q CYCLES WEAPONS');
}

toggleWeapon27=function(){
  const owned=[];
  if(pistolOwned)owned.push('PISTOL');
  if(shotgunOwned27)owned.push('SHOTGUN');
  if(smgOwned28)owned.push('SMG');
  if(!owned.length)return;
  let i=owned.indexOf(weapon27);if(i<0)i=0;else i=(i+1)%owned.length;
  weapon27=owned[i];statusMessage=`WEAPON — ${weapon27}`;statusTimer=1.0;
};

const collectPickups28Base=collectPickups;
collectPickups=function(dt){
  if(!inVehicle){
    const removed=new Set();
    for(const p of pickups){
      if((p.kind!=='smg'&&p.kind!=='smg_ammo')||dist(player,p)>31)continue;
      if(p.kind==='smg'){smgOwned28=true;smgAmmo28+=p.amount;weapon27='SMG';statusMessage=`SMG ACQUIRED — ${smgAmmo28} ROUNDS`;}
      else{smgAmmo28+=p.amount;statusMessage=`SMG AMMO +${p.amount}`;}
      statusTimer=1.5;effects.push({x:p.x,y:p.y,t:.45,type:'pickup'});removed.add(p);if(typeof sfxPickup14==='function')sfxPickup14();
    }
    if(removed.size)pickups=pickups.filter(p=>!removed.has(p));
  }
  collectPickups28Base(dt);
};
const drawPickup28Base=drawPickup;
drawPickup=function(p){
  if(p.kind!=='smg'&&p.kind!=='smg_ammo')return drawPickup28Base(p);
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.t*.18);ctx.fillStyle='#101214';ctx.fillRect(-14,-10,28,20);
  if(p.kind==='smg'){
    ctx.fillStyle='#69727a';ctx.fillRect(-11,-3,20,6);ctx.fillStyle='#24292e';ctx.fillRect(-14,-2,7,4);ctx.fillRect(4,3,5,8);ctx.fillStyle='#9b7b45';ctx.fillRect(0,2,5,8);
  }else{
    ctx.fillStyle='#8b9aa6';ctx.fillRect(-8,-7,16,14);ctx.fillStyle='#d9b75c';for(let i=0;i<3;i++)ctx.fillRect(-6+i*5,-4,3,8);
  }
  ctx.restore();
};

function smgBurst28(){
  if(inVehicle||!smgOwned28||smgAmmo28<=0||shotCooldown>0||respawnTimer>0)return;
  const rounds=Math.min(3,smgAmmo28);smgAmmo28-=rounds;shotCooldown=.22;
  const baseAngle=Math.atan2(player.fy,player.fx),ox=player.x+player.fx*24,oy=player.y+player.fy*24;
  const spreads=[-.035,0,.035],pedHits=new Map(),carHits=new Map();let hitPed=false;
  for(let i=0;i<rounds;i++){
    const a=baseAngle+spreads[i],dx=Math.cos(a),dy=Math.sin(a),max=Math.min(520,wallDist(ox,oy,dx,dy));let best=max,target=null,type='';
    for(const p of peds){if(p.dead>0)continue;const h=rayCircle(ox,oy,dx,dy,p.x,p.y,14,max);if(h!==null&&h<best){best=h;target=p;type='ped';}}
    for(const c of cars){if(c.destroyed)continue;const h=rayCircle(ox,oy,dx,dy,c.x,c.y,26,max);if(h!==null&&h<best){best=h;target=c;type='car';}}
    if(type==='ped'){pedHits.set(target,(pedHits.get(target)||0)+1);hitPed=true;}else if(type==='car')carHits.set(target,(carHits.get(target)||0)+1);
    tracers.push({x1:ox,y1:oy,x2:ox+dx*best,y2:oy+dy*best,t:.08});
  }
  for(const [p,hits] of pedHits){
    p.hp-=hits;
    if(p.hp<=0){p.hp=0;p.down=0;p.panic=0;if(p===frontTarget28){p.dead=99999;p.frontDown28=true;}else if(p.raidTarget27){p.dead=99999;p.raidDown27=true;}else p.dead=4.5;}
    else p.panic=Math.max(p.panic,2.6);
  }
  for(const [c] of carHits){const was=c.destroyed;c.hp-=1;c.flash=.10;if(c.hp<=0&&!was){c.hp=0;c.destroyed=true;c.ai=false;c.speed=0;effects.push({x:c.x,y:c.y,t:.8,type:'boom'});raiseWanted();}}
  if(hitPed)raiseWanted();
  for(const p of peds)if(p.dead<=0&&Math.hypot(p.x-ox,p.y-oy)<=520){const ax=p.x-ox,ay=p.y-oy,m=Math.hypot(ax,ay)||1;p.fx=ax/m;p.fy=ay/m;p.panic=Math.max(p.panic,2.5);}
  if(typeof tone14==='function')for(let i=0;i<rounds;i++)tone14(165-i*18,.035,.07,'square',i*.045);
}
const shoot28Base=shoot;
shoot=function(){if(weapon27==='SMG'&&smgOwned28)return smgBurst28();return shoot28Base();};

function cleanFrontTarget28(){
  if(frontTarget28){peds=peds.filter(p=>p!==frontTarget28);frontTarget28=null;}
}
function spawnFrontTarget28(index){
  cleanFrontTarget28();const pt=THREE_FRONTS28.targetPositions[index],x=pt[0],y=pt[1],r=[[x-80,y],[x,y-70],[x+80,y],[x,y+70]];
  const colors=['#c33f2f','#c17a28','#8b42bd'];const p=ped(r,0,colors[index%colors.length],310+index);p.hp=THREE_FRONTS28.targetHealth;p.frontTarget28=true;p.frontDown28=false;p.speed=86;p.panic=0;frontTarget28=p;peds.push(p);
}
function frontActive28(){return mission().id==='three_fronts'&&['front_armory','front_target','front_escape'].includes(missionState);}
function frontTargetDown28(){return !frontTarget28||frontTarget28.frontDown28||frontTarget28.dead>0||frontTarget28.hp<=0;}
