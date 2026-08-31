if (!window.__gtaBuild30Bitmap) {
window.__gtaBuild30Bitmap = true;

const BITMAP30 = window.__bitmap30AtlasImage || null;
const BITMAP30_MAP = (window.__bitmap30AtlasMap && window.__bitmap30AtlasMap.sprites) || {};
let bitmap30Enabled = !!BITMAP30 && !!Object.keys(BITMAP30_MAP).length;
function bitmap30Ready(){return bitmap30Enabled&&BITMAP30.complete&&BITMAP30.naturalWidth>0;}
const bitmap30Patterns = new Map();
let pedBitmapSerial30 = 0;

function region30(name){ return BITMAP30_MAP[name] || null; }
function drawRegion30(name,x,y,w,h,rot=0,alpha=1){
  const r=region30(name); if(!bitmap30Ready()||!r)return false;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.globalAlpha*=alpha;
  ctx.drawImage(BITMAP30,r.x,r.y,r.w,r.h,-w/2,-h/2,w,h);ctx.restore();return true;
}
function tilePattern30(name,rot=0){
  const key=`${name}:${rot}`;if(bitmap30Patterns.has(key))return bitmap30Patterns.get(key);
  const r=region30(name);if(!bitmap30Ready()||!r)return null;
  const c=document.createElement('canvas'),cw=r.w,ch=r.h;
  if(rot){c.width=ch;c.height=cw;}else{c.width=cw;c.height=ch;}
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  if(rot){g.translate(c.width/2,c.height/2);g.rotate(rot);g.drawImage(BITMAP30,r.x,r.y,r.w,r.h,-cw/2,-ch/2,cw,ch);}
  else g.drawImage(BITMAP30,r.x,r.y,r.w,r.h,0,0,cw,ch);
  const p=ctx.createPattern(c,'repeat');bitmap30Patterns.set(key,p);return p;
}
function fillTexture30(name,x,y,w,h,rot=0,alpha=1){
  const p=tilePattern30(name,rot);if(!p)return false;
  ctx.save();ctx.globalAlpha*=alpha;ctx.fillStyle=p;ctx.fillRect(x,y,w,h);ctx.restore();return true;
}
function roofTexture30(i){return ['roof_a','roof_b','roof_c'][Math.abs(i)%3];}

const drawWorld30Base=drawWorld;
drawWorld=function(){
  if(!bitmap30Ready())return drawWorld30Base();

  ctx.fillStyle='#203222';ctx.fillRect(WORLD.x,WORLD.y,WORLD.w,WORLD.h);
  fillTexture30('grass',WORLD.x,WORLD.y,WORLD.w,WORLD.h,0,.78);

  const roadV=tilePattern30('road_straight',0),roadH=tilePattern30('road_straight',Math.PI/2);
  for(const x of ROAD_X){ctx.fillStyle=roadV||'#2b2e31';ctx.fillRect(x-ROAD_HALF,WORLD.y,ROAD_HALF*2,WORLD.h);}
  for(const y of ROAD_Y){ctx.fillStyle=roadH||'#2b2e31';ctx.fillRect(WORLD.x,y-ROAD_HALF,WORLD.w,ROAD_HALF*2);}
  for(const x of ROAD_X)for(const y of ROAD_Y)drawRegion30('road_intersection',x,y,ROAD_HALF*2.14,ROAD_HALF*2.14,0,.98);

  if(typeof ALLEYS!=='undefined')for(const a of ALLEYS)fillTexture30('alley',a.x,a.y,a.w,a.h,0,.96);
  if(typeof PARKING_LOTS!=='undefined')for(const p of PARKING_LOTS){
    fillTexture30('concrete',p.x,p.y,p.w,p.h,0,.96);
    ctx.strokeStyle='rgba(235,228,199,.22)';ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,p.w,p.h);
  }

  buildings.forEach((b,i)=>{
    fillTexture30('sidewalk_tiles',b.x-20,b.y-20,b.w+40,b.h+40,0,.92);
    ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
    fillTexture30(roofTexture30(i),b.x,b.y,b.w,b.h,0,.99);
    ctx.fillStyle=`rgba(8,10,12,${.04+(i%4)*.022})`;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.restore();
    ctx.strokeStyle='rgba(12,15,17,.65)';ctx.lineWidth=3;ctx.strokeRect(b.x,b.y,b.w,b.h);
  });

  ctx.strokeStyle='rgba(232,198,62,.70)';ctx.lineWidth=2.5;ctx.setLineDash([24,24]);
  for(const x of ROAD_X){ctx.beginPath();ctx.moveTo(x,WORLD.y);ctx.lineTo(x,WORLD.y+WORLD.h);ctx.stroke();}
  for(const y of ROAD_Y){ctx.beginPath();ctx.moveTo(WORLD.x,y);ctx.lineTo(WORLD.x+WORLD.w,y);ctx.stroke();}
  ctx.setLineDash([]);

  if(WORLD.x<-5000){
    drawRegion30('airfield',-4520,1190,250,250,0,.82);
    drawRegion30('helipad',-5050,1290,150,150,0,.96);
    drawRegion30('runway',-4100,1210,190,220,0,.72);
  }

  rect(RESPRAY.x,RESPRAY.y,RESPRAY.w,RESPRAY.h,'rgba(185,42,168,.16)');
  ctx.strokeStyle='#f05bd9';ctx.lineWidth=4;ctx.strokeRect(RESPRAY.x,RESPRAY.y,RESPRAY.w,RESPRAY.h);

  if(typeof DISTRICTS!=='undefined'){
    ctx.font='900 27px ui-monospace,monospace';ctx.fillStyle='rgba(255,255,255,.16)';
    for(const d of DISTRICTS){const q=d.label||[0,0];ctx.fillText(d.name||'DISTRICT',q[0],q[1]);}
  }
};

function carSprite30(c){
  const kind=String(c.kind||'').toUpperCase();
  if(kind==='VAN')return 'car_white';
  if(kind==='MUSCLE')return 'car_red';
  if(kind==='COMPACT')return 'car_blue';
  if(kind==='SEDAN')return 'car_green';
  const pool=['car_red','car_blue','car_yellow','car_green','car_white','truck_white'];
  let h=0;const s=String(c.color||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;
  return pool[Math.abs(h)%pool.length];
}
const drawCar30Base=drawCar;
drawCar=function(c){
  if(!bitmap30Ready())return drawCar30Base(c);
  const name=carSprite30(c),r=region30(name);if(!r)return drawCar30Base(c);
  const bodyH=c.bodyH||64,h=bodyH*1.18,w=Math.max((c.bodyW||34)*1.10,h*(r.w/r.h));
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.globalAlpha=c.destroyed?.62:1;
  ctx.drawImage(BITMAP30,r.x,r.y,r.w,r.h,-w/2,-h/2,w,h);ctx.globalAlpha=1;
  if(c.flash>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.55,c.flash*3.5);ctx.drawImage(BITMAP30,r.x,r.y,r.w,r.h,-w/2,-h/2,w,h);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;}
  if(c.destroyed)drawRegion30('explosion_small',0,0,54,54,0,.92);
  else if(c.hp<=Math.ceil((c.maxHp||4)/2)){
    const smoke=['smoke_a','smoke_b','smoke_c','smoke_d'][Math.floor((c.smoke||0)*3)%4];
    drawRegion30(smoke,0,-h*.55,38,46,0,.78);
  }
  ctx.restore();
};

const drawCop30Base=drawCop;
drawCop=function(c){
  if(!bitmap30Ready())return drawCop30Base(c);
  const name=c.level>=4&&region30('swat_h')?'swat_h':c.level>=3&&region30('police_blue_h')?'police_blue_h':'police_car';
  const r=region30(name);if(!r)return drawCop30Base(c);
  const h=name==='swat_h'?78:72,w=h*(r.w/r.h);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.drawImage(BITMAP30,r.x,r.y,r.w,r.h,-w/2,-h/2,w,h);ctx.restore();
};

const pedNames30=['ped_a','ped_b','ped_c','ped_d','ped_e','ped_f','ped_g','ped_h'];
const hostileNames30=['hostile_a','hostile_b','hostile_c'];
function pedSprite30(p){
  if(p.hostile29)return hostileNames30[Math.abs(p.hostileIndex29||0)%hostileNames30.length];
  if(p.missionTarget15||p.raidDown27||p.frontDown28)return 'hostile_c';
  if(!p._bitmap30)p._bitmap30=pedNames30[pedBitmapSerial30++%pedNames30.length];
  return p._bitmap30;
}
const drawPed30Base=drawPed;
drawPed=function(p){
  if(!bitmap30Ready())return drawPed30Base(p);
  const name=pedSprite30(p),r=region30(name);if(!r)return drawPed30Base(p);
  const downed=p.dead>0||p.down>0,ang=downed?Math.PI/2:Math.atan2(p.fy||0,p.fx||0)+Math.PI/2;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(p.x,p.y);ctx.rotate(ang);ctx.globalAlpha=downed?.62:1;
  const h=p.hostile29?40:36,w=h*(r.w/r.h);ctx.drawImage(BITMAP30,r.x,r.y,r.w,r.h,-w/2,-h/2,w,h);ctx.restore();
  if(downed&&region30('blood'))drawRegion30('blood',p.x,p.y+4,38,18,0,p.dead>0?.78:.34);
  if(p.hostile29&&!downed){
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#ff4d57';ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(6,-21);ctx.lineTo(-6,-21);ctx.closePath();ctx.fill();
    if(performance.now()<(p.coverUntil29||0)){ctx.strokeStyle='rgba(105,220,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,20,.2,Math.PI-.2);ctx.stroke();}ctx.restore();
  }
};

const drawPlayer30Base=drawPlayer;
drawPlayer=function(){
  if(!player.active)return;
  if(!bitmap30Ready())return drawPlayer30Base();
  const r=region30('player');if(!r)return drawPlayer30Base();
  const ang=Math.atan2(player.fy||-1,player.fx||0)+Math.PI/2;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(player.x,player.y);ctx.rotate(ang);ctx.drawImage(BITMAP30,r.x,r.y,r.w,r.h,-11,-21,22,42);ctx.restore();
};

const drawPickup30Base=drawPickup;
drawPickup=function(p){
  if(!bitmap30Ready())return drawPickup30Base(p);
  const names={pistol:'weapon_pistol',ammo:'ammo_box',bribe:'cash',shotgun:'weapon_shotgun',shells:'shells',smg:'weapon_smg',smg_ammo:'ammo_box'};
  const name=names[p.kind];if(!name||!region30(name))return drawPickup30Base(p);
  const r=region30(name),weapon=['pistol','shotgun','smg'].includes(p.kind),w=weapon?44:32,h=w*(r.h/r.w);
  drawRegion30(name,p.x,p.y+Math.sin(p.t||0)*3,w,h,0,weapon?1:.88);
};

const drawFx30Base=drawFx;
drawFx=function(){
  if(!bitmap30Ready())return drawFx30Base();
  for(const t of tracers){
    const x1=t.x1??t.start?.x??0,y1=t.y1??t.start?.y??0,x2=t.x2??t.end?.x??0,y2=t.y2??t.end?.y??0;
    ctx.strokeStyle='#ffe56b';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    if(Number.isFinite(x2)&&Number.isFinite(y2))drawRegion30('muzzle',x2,y2,23,18,Math.atan2(y2-y1,x2-x1),.62);
  }
  for(const e of effects){
    const a=Math.max(.15,Math.min(1,(e.t||.4)*2.2));
    if(e.type==='skid')drawRegion30('skid',e.x,e.y,48,20,e.rot||0,a);
    else if(e.type==='impact')drawRegion30('sparks',e.x,e.y,48,28,e.rot||0,a);
    else if(e.type==='boom')drawRegion30('explosion_big',e.x,e.y,76,76,0,a);
    else if(e.type==='pickup'||e.type==='bribe')drawRegion30('explosion_small',e.x,e.y,28,28,0,a*.55);
    else drawRegion30('sparks',e.x,e.y,32,18,e.rot||0,a*.5);
  }
};

function replaceText30(root,from,to){
  if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while((n=walker.nextNode()))if(n.nodeValue&&n.nodeValue.includes(from))n.nodeValue=n.nodeValue.split(from).join(to);
}
const front30=document.getElementById('build11-front');
if(front30){
  replaceText30(front30,'BUILD 29','BUILD 30');replaceText30(front30,'Hostile AI + Chapter One online','Sliced ImageGen bitmap assets online');
  const card=front30.firstElementChild;if(card){card.style.background='rgba(7,11,14,.94)';card.style.backdropFilter='blur(3px)';}
  const enter=front30.querySelector('#enter-city');if(enter)enter.onclick=()=>front30.remove();
}

const openMissionMenu30Base=openMissionMenu;
openMissionMenu=function(){openMissionMenu30Base();const menu=document.getElementById('build11-missions');if(menu)replaceText30(menu,'BUILD 29','BUILD 30');};
const update30Base=update;
update=function(dt){
  update30Base(dt);
  const bar=document.getElementById('build14-drive');
  if(bar){bar.textContent=bar.textContent.replace('BUILD 29','BUILD 30');if(!bar.textContent.includes('BITMAP'))bar.textContent+=' · BITMAP';}
};
const reset30Base=reset;
reset=function(){pedBitmapSerial30=0;reset30Base();};

if(typeof banner15==='function')banner15(bitmap30Enabled?'SLICED BITMAP ART LOADING':'BITMAP FALLBACK — VECTOR MODE','BUILD 30');
if(BITMAP30){BITMAP30.addEventListener('load',()=>{bitmap30Patterns.clear();if(typeof banner15==='function')banner15('SLICED BITMAP ART ONLINE','BUILD 30');},{once:true});}
}
