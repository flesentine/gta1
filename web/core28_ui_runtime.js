function unlockedMissionCount(){
  if(levelComplete)return CAMPAIGN.length;
  if(bestScore>=2500)return Math.min(3,CAMPAIGN.length);
  if(bestScore>=1000)return Math.min(2,CAMPAIGN.length);
  return Math.max(1,Math.min(campaignIndex+1,CAMPAIGN.length));
}
function navTarget(){
  const m=mission();
  if(missionState==='available')return{x:PHONE.x,y:PHONE.y,label:'MISSION PHONE'};
  if(['steal','destroy','chain_steal','mixed_steal'].includes(missionState)&&missionCar)return{x:missionCar.x,y:missionCar.y,label:missionState==='chain_steal'?'COURIER CAR':missionState==='mixed_steal'?'GETAWAY CAR':'TARGET CAR'};
  if(missionState==='deliver'&&m.delivery)return{x:m.delivery.x+m.delivery.w/2,y:m.delivery.y+m.delivery.h/2,label:'DELIVERY'};
  if(missionState==='chain_drive'&&chainPoints[chainIndex]){const p=chainPoints[chainIndex];return{x:p[0],y:p[1],label:`CHECKPOINT ${Math.min(chainIndex+1,chainPoints.length)}/${chainPoints.length}`};}
  if(missionState==='mixed_drive'&&m.drop)return{x:m.drop.x+m.drop.w/2,y:m.drop.y+m.drop.h/2,label:'DROP CAR'};
  if(missionState==='mixed_package'&&m.package)return{x:m.package.x,y:m.package.y,label:'PACKAGE'};
  if(missionState==='mixed_escape'||missionState==='escape')return{x:RESPRAY.x+RESPRAY.w/2,y:RESPRAY.y+RESPRAY.h/2,label:'LOSE HEAT'};
  return null;
}
function closeMissionMenu(dismiss=true){const el=document.getElementById('build11-missions');if(el)el.remove();missionMenuOpen=false;if(dismiss)missionMenuDismissed=true;}
function selectMission(i){
  if(i<0||i>=unlockedMissionCount())return;
  campaignIndex=i;missionState='available';missionCooldown=0;missionTimer=0;missionCar=null;chainIndex=0;chainPoints=[];saveProgress();closeMissionMenu(false);startMission();
}
function missionTypeLabel28(m){
  if(m.type==='steal_deliver')return'Steal + deliver';if(m.type==='destroy_target')return'Timed destruction';if(m.type==='lose_wanted')return'Lose the police';if(m.type==='checkpoint_run')return'Courier checkpoints';if(m.type==='mixed_run')return'Drive + on-foot + escape';return String(m.type||'JOB').replaceAll('_',' ');
}
function openMissionMenu(){
  if(missionMenuOpen||missionState!=='available')return;missionMenuOpen=true;
  const unlocked=unlockedMissionCount(),el=document.createElement('div');el.id='build11-missions';
  Object.assign(el.style,{position:'fixed',inset:'0',zIndex:'70',display:'grid',placeItems:'center',background:'rgba(0,0,0,.72)',fontFamily:'ui-monospace,monospace'});
  let cards='';CAMPAIGN.forEach((m,i)=>{const ok=i<unlocked;cards+=`<button data-mission="${i}" ${ok?'':'disabled'} style="display:block;width:100%;margin:7px 0;padding:11px 14px;text-align:left;background:${ok?'#1b252d':'#111417'};color:${ok?'#f5f7f8':'#61666b'};border:1px solid ${ok?'#4c6877':'#292d30'};border-radius:7px;font:700 13px ui-monospace,monospace;cursor:${ok?'pointer':'default'}"><b>${i+1}. ${m.title}</b><span style="float:right">${ok?'SELECT':'LOCKED'}</span><br><span style="font-size:10px;font-weight:500;opacity:.72">${missionTypeLabel28(m)} · base ${m.reward||0}</span></button>`;});
  el.innerHTML=`<div style="width:min(560px,calc(100vw - 34px));max-height:90vh;overflow:auto;padding:22px;background:#0d1114;border:2px solid #5bb8df;box-shadow:0 22px 80px #000"><div style="font-size:12px;color:#5bb8df;font-weight:900;letter-spacing:.16em">MISSION TERMINAL · BUILD 28</div><div style="font-size:27px;color:#fff;font-weight:1000;margin:6px 0 14px">CHOOSE A JOB</div>${cards}<div style="margin-top:12px;color:#8c949b;font-size:11px">Keys 1–9 + symbols select · Esc closes · post-clear jobs unlock after core clear</div></div>`;
  el.querySelectorAll('[data-mission]').forEach(b=>b.addEventListener('click',()=>selectMission(Number(b.dataset.mission))));el.addEventListener('pointerdown',e=>{if(e.target===el)closeMissionMenu(true);});document.body.appendChild(el);
}
function ensureMinimap(){
  let c=document.getElementById('build11-map');if(c)return c;c=document.createElement('canvas');c.id='build11-map';c.width=250;c.height=170;Object.assign(c.style,{position:'fixed',right:'18px',top:'18px',zIndex:'35',width:'250px',height:'170px',border:'2px solid rgba(255,255,255,.28)',borderRadius:'8px',background:'rgba(5,7,9,.9)',boxShadow:'0 8px 28px rgba(0,0,0,.45)',pointerEvents:'none'});document.body.appendChild(c);return c;
}
function drawMinimap(){
  const c=ensureMinimap();c.style.display=minimapVisible?'block':'none';if(!minimapVisible)return;
  const g=c.getContext('2d'),w=c.width,h=c.height,pad=9,sx=(w-pad*2)/WORLD.w,sy=(h-pad*2)/WORLD.h,s=Math.min(sx,sy),ox=(w-WORLD.w*s)/2-WORLD.x*s,oy=(h-WORLD.h*s)/2-WORLD.y*s,mx=x=>ox+x*s,my=y=>oy+y*s;
  g.clearRect(0,0,w,h);g.fillStyle='#0a1013';g.fillRect(0,0,w,h);g.strokeStyle='#2f3940';g.lineWidth=Math.max(2,ROAD_HALF*2*s);for(const x of ROAD_X){g.beginPath();g.moveTo(mx(x),my(WORLD.y));g.lineTo(mx(x),my(WORLD.y+WORLD.h));g.stroke();}for(const y of ROAD_Y){g.beginPath();g.moveTo(mx(WORLD.x),my(y));g.lineTo(mx(WORLD.x+WORLD.w),my(y));g.stroke();}
  g.fillStyle='#596168';for(const b of buildings)g.fillRect(mx(b.x),my(b.y),Math.max(1,b.w*s),Math.max(1,b.h*s));g.fillStyle='#2d4954';for(const p of PARKING_LOTS)g.fillRect(mx(p.x),my(p.y),Math.max(1,p.w*s),Math.max(1,p.h*s));
  for(const c2 of police){g.fillStyle='#ef4545';g.beginPath();g.arc(mx(c2.x),my(c2.y),2.3,0,Math.PI*2);g.fill();}
  const nt=navTarget();if(nt){g.strokeStyle='#ffd84d';g.lineWidth=2;g.beginPath();g.arc(mx(nt.x),my(nt.y),5,0,Math.PI*2);g.stroke();}
  const pt=playerTarget();g.fillStyle='#5ee7ff';g.beginPath();g.arc(mx(pt.x),my(pt.y),3.8,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,255,255,.82)';g.font='900 10px ui-monospace,monospace';g.fillText('N',w-17,13);g.fillText(districtName(),8,h-7);if(nt){const d=Math.round(Math.hypot(nt.x-pt.x,nt.y-pt.y));g.fillStyle='#ffd84d';g.fillText(nt.label+' '+d+'m',8,13);}
}
function showFrontEnd(){
  if(document.getElementById('build11-front'))return;
  const el=document.createElement('div');el.id='build11-front';Object.assign(el.style,{position:'fixed',inset:'0',zIndex:'80',display:'grid',placeItems:'center',background:'radial-gradient(circle at 50% 40%,rgba(28,43,52,.94),rgba(3,5,7,.98))',fontFamily:'ui-monospace,monospace'});
  const unlocked=unlockedMissionCount();el.innerHTML=`<div style="width:min(600px,calc(100vw - 34px));padding:30px 34px;background:#0b0f12;border:2px solid #efc94c;box-shadow:0 26px 100px #000"><div style="color:#efc94c;font-size:12px;font-weight:900;letter-spacing:.18em">BUILD 28</div><div style="font-size:38px;font-weight:1000;color:white;margin-top:6px">THREE-SECTOR CITY</div><div style="color:#a9b3ba;margin:6px 0 22px">Flat runtime core + three-weapon combat online</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;color:#d5dadd"><div>BEST SCORE<br><b style="font-size:20px;color:#fff">${bestScore.toLocaleString()}</b></div><div>MISSIONS UNLOCKED<br><b style="font-size:20px;color:#fff">${unlocked}/${CAMPAIGN.length}</b></div><div>MAP<br><b>M toggles minimap</b></div><div>WEAPONS<br><b>Q cycles owned weapons</b></div></div><button id="enter-city" style="width:100%;margin-top:24px;padding:14px;background:#efc94c;color:#111;border:0;border-radius:6px;font:1000 15px ui-monospace,monospace;cursor:pointer">ENTER CITY</button></div>`;
  el.querySelector('#enter-city').addEventListener('click',()=>el.remove(),{once:true});document.body.appendChild(el);
}

const updatePlayerCore28=updatePlayer;updatePlayer=function(dt){if(missionMenuOpen)return;updatePlayerCore28(dt);};
const shootCore28=shoot;shoot=function(){if(missionMenuOpen)return;shootCore28();};
const drawWorldCore28=drawWorld;drawWorld=function(){
  rect(WORLD.x,WORLD.y,WORLD.w,WORLD.h,'#2b4029');ctx.fillStyle='#2b2e31';for(const x of ROAD_X)ctx.fillRect(x-ROAD_HALF,WORLD.y,ROAD_HALF*2,WORLD.h);for(const y of ROAD_Y)ctx.fillRect(WORLD.x,y-ROAD_HALF,WORLD.w,ROAD_HALF*2);
  ctx.strokeStyle='#b8aa60';ctx.lineWidth=3;ctx.setLineDash([24,24]);for(const x of ROAD_X){ctx.beginPath();ctx.moveTo(x,WORLD.y);ctx.lineTo(x,WORLD.y+WORLD.h);ctx.stroke();}for(const y of ROAD_Y){ctx.beginPath();ctx.moveTo(WORLD.x,y);ctx.lineTo(WORLD.x+WORLD.w,y);ctx.stroke();}ctx.setLineDash([]);
  for(const a of ALLEYS){rect(a.x,a.y,a.w,a.h,'#1f2224');ctx.strokeStyle='rgba(130,130,130,.32)';ctx.lineWidth=2;ctx.strokeRect(a.x,a.y,a.w,a.h);}for(const p of PARKING_LOTS){rect(p.x,p.y,p.w,p.h,'#34393d');ctx.strokeStyle='rgba(190,190,175,.45)';ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,p.w,p.h);}
  for(const b of buildings){rect(b.x-18,b.y-18,b.w+36,b.h+36,'#77776e');rect(b.x,b.y,b.w,b.h,'#5c514a');if(b.w>80&&b.h>80)rect(b.x+10,b.y+10,b.w-20,b.h-20,'#494441');}
  ctx.font='900 28px ui-monospace,monospace';ctx.fillStyle='rgba(255,255,255,.16)';for(const d of DISTRICTS){const q=d.label||[0,0];ctx.fillText(d.name||'DISTRICT',q[0],q[1]);}
  rect(RESPRAY.x,RESPRAY.y,RESPRAY.w,RESPRAY.h,'rgba(185,42,168,.32)');ctx.strokeStyle='#f05bd9';ctx.lineWidth=5;ctx.strokeRect(RESPRAY.x,RESPRAY.y,RESPRAY.w,RESPRAY.h);
};
