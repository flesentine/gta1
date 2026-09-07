(() => {
'use strict';

const required = (src, needle, replacement, label) => {
  if (!src.includes(needle)) throw new Error(`Build 10 patch missing: ${label}`);
  return src.replace(needle, replacement);
};

Promise.all([
  fetch('game8.js').then(r => {
    if (!r.ok) throw new Error(`Unable to load Build 8 base (${r.status})`);
    return r.text();
  }),
  fetch('../data/city_sector.json').then(r => {
    if (!r.ok) throw new Error(`Unable to load city sector (${r.status})`);
    return r.json();
  })
]).then(([src, city]) => {
  const world = city.world || [-2400,-1700,5200,3400];
  const roadX = city.road_x || [-1800,-900,0,900,1800];
  const roadY = city.road_y || [-1200,-650,0,650,1200];
  const roadHalf = Number(city.road_half || 96);
  const buildings = (city.buildings || []).map(r => ({x:r[0],y:r[1],w:r[2],h:r[3]}));
  const lots = (city.parking_lots || []).map(r => ({x:r[0],y:r[1],w:r[2],h:r[3]}));
  const alleys = (city.alleys || []).map(r => ({x:r[0],y:r[1],w:r[2],h:r[3]}));
  const districts = city.districts || [];
  const routes = city.traffic_routes || [];
  const spawnPlan = city.traffic_spawns || [];
  const pedRoutes = city.pedestrian_routes || [];

  src = required(
    src,
    "const WORLD={x:-1600,y:-1200,w:3200,h:2400},ROAD_X=[-900,0,900],ROAD_Y=[-650,0,650],ROAD_HALF=112;",
    `const WORLD={x:${world[0]},y:${world[1]},w:${world[2]},h:${world[3]}},ROAD_X=${JSON.stringify(roadX)},ROAD_Y=${JSON.stringify(roadY)},ROAD_HALF=${roadHalf};\nconst PARKING_LOTS=${JSON.stringify(lots)},ALLEYS=${JSON.stringify(alleys)},DISTRICTS=${JSON.stringify(districts)};`,
    "expanded world"
  );

  src = required(
    src,
    "const xSpans=[[-1540,-1040],[-760,-140],[140,760],[1040,1540]],ySpans=[[-1140,-790],[-510,-140],[140,510],[790,1140]];\nconst buildings=[];for(const xs of xSpans)for(const ys of ySpans)buildings.push({x:xs[0],y:ys[0],w:xs[1]-xs[0],h:ys[1]-ys[0]});",
    `const buildings=${JSON.stringify(buildings)};`,
    "authored buildings"
  );

  src = required(
    src,
    `const routes=[\n[[-900,-650],[0,-650],[900,-650],[900,0],[900,650],[0,650],[-900,650],[-900,0]],\n[[-900,0],[0,0],[0,650],[900,650],[900,0],[0,0],[0,-650],[-900,-650]],\n[[0,-650],[900,-650],[900,0],[0,0],[-900,0],[-900,650],[0,650],[0,0]]];`,
    `const routes=${JSON.stringify(routes)};`,
    "expanded traffic routes"
  );

  src = required(
    src,
    "const spawnPlan=[[0,0],[0,2],[0,4],[0,6],[1,1],[1,3],[1,5],[2,0],[2,3],[2,6]];",
    `const spawnPlan=${JSON.stringify(spawnPlan)};`,
    "expanded traffic spawns"
  );

  src = required(
    src,
    "const sidewalkRoutes=[];for(const xs of xSpans)for(const ys of ySpans){const m=38;sidewalkRoutes.push([[xs[0]-m,ys[0]-m],[xs[1]+m,ys[0]-m],[xs[1]+m,ys[1]+m],[xs[0]-m,ys[1]+m]]);}",
    `const sidewalkRoutes=${JSON.stringify(pedRoutes)};`,
    "authored pedestrian routes"
  );

  src = required(
    src,
    "{id:'hot_property',title:'HOT PROPERTY',type:'steal_deliver',spawn:{x:900,y:-360},delivery:{x:-1025,y:565,w:250,h:170},reward:1000,color:'#1abdcf'},",
    "{id:'hot_property',title:'HOT PROPERTY',type:'steal_deliver',spawn:{x:2280,y:-640},delivery:{x:-1940,y:520,w:280,h:220},reward:1000,color:'#1abdcf'},",
    "expanded hot property route"
  );

  src = required(
    src,
    "{id:'short_fuse',title:'SHORT FUSE',type:'destroy_target',spawn:{x:900,y:330},time:35,reward:1500,color:'#ef6124',ammo:10},",
    "{id:'short_fuse',title:'SHORT FUSE',type:'destroy_target',spawn:{x:1320,y:620},time:35,reward:1500,color:'#ef6124',ammo:10},",
    "expanded short fuse location"
  );

  src = required(
    src,
    "for(const b of buildings){rect(b.x-22,b.y-22,b.w+44,b.h+44,'#77776e');rect(b.x,b.y,b.w,b.h,'#5c514a');rect(b.x+12,b.y+12,b.w-24,b.h-24,'#494441');}",
    `for(const a of ALLEYS){rect(a.x,a.y,a.w,a.h,'#1f2224');ctx.strokeStyle='rgba(130,130,130,.32)';ctx.lineWidth=2;ctx.strokeRect(a.x,a.y,a.w,a.h);}\n for(const p of PARKING_LOTS){rect(p.x,p.y,p.w,p.h,'#34393d');ctx.strokeStyle='rgba(190,190,175,.45)';ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,p.w,p.h);for(let x=p.x+20;x<p.x+p.w-12;x+=42){ctx.beginPath();ctx.moveTo(x,p.y+10);ctx.lineTo(x,p.y+42);ctx.stroke();}}\n for(const b of buildings){rect(b.x-18,b.y-18,b.w+36,b.h+36,'#77776e');rect(b.x,b.y,b.w,b.h,'#5c514a');if(b.w>80&&b.h>80)rect(b.x+10,b.y+10,b.w-20,b.h-20,'#494441');}\n ctx.font='900 28px ui-monospace,monospace';ctx.fillStyle='rgba(255,255,255,.16)';for(const d of DISTRICTS){const q=d.label||[0,0];ctx.fillText(d.name||'DISTRICT',q[0],q[1]);}`,
    "district dressing"
  );

  src = required(
    src,
    "const PHONE={x:260,y:80},LEVEL_TARGET=5000;",
    "const PHONE={x:260,y:80},LEVEL_TARGET=5000,SAVE_KEY='gta1-build9-progress-v1';",
    "save key"
  );

  src = required(
    src,
    "let campaignIndex=0,missionState='available',missionCar=null,missionCooldown=0,missionTimer=0,score=0,multiplier=1;",
    "let campaignIndex=0,missionState='available',missionCar=null,missionCooldown=0,missionTimer=0,score=0,multiplier=1,levelComplete=false,sectorUnlocked=false,bestScore=0,justUnlocked=false;",
    "progress state"
  );

  src = required(
    src,
    "function cop(x,y,level){return{x,y,rot:0,speed:170,max:350+level*38,accel:520+level*55,turn:2.8,level,siren:Math.random()*6,stuck:0};}",
    `function cop(x,y,level){return{x,y,rot:0,speed:170,max:350+level*38,accel:520+level*55,turn:2.8,level,siren:Math.random()*6,stuck:0};}\nfunction districtName(){\n const p=playerTarget();\n if(p.x>900)return 'DOWNTOWN';\n if(p.x<-900&&p.y>500)return 'WAREHOUSE ROW';\n if(p.x<-900)return 'MARKET WEST';\n return 'CENTRAL';\n}\nfunction areaBadge(){\n let el=document.getElementById('build10-area');\n if(!el){el=document.createElement('div');el.id='build10-area';Object.assign(el.style,{position:'fixed',right:'18px',bottom:'68px',zIndex:'30',padding:'7px 10px',background:'rgba(5,7,9,.72)',border:'1px solid rgba(255,255,255,.14)',borderRadius:'6px',font:'800 12px ui-monospace,monospace',color:'#e8eef5',pointerEvents:'none'});document.body.appendChild(el);}\n el.textContent='AREA  ·  '+districtName();\n}\nfunction progressBadge(){\n let el=document.getElementById('build9-progress');\n if(!el){el=document.createElement('div');el.id='build9-progress';Object.assign(el.style,{position:'fixed',top:'18px',left:'50%',transform:'translateX(-50%)',zIndex:'30',padding:'8px 12px',background:'rgba(5,7,9,.84)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'7px',font:'700 12px ui-monospace,monospace',color:'#f3f3f3',pointerEvents:'none'});document.body.appendChild(el);}\n el.textContent=\`SAVE ✓  ·  BEST \${String(bestScore).padStart(7,'0')}  ·  \${sectorUnlocked?'DOWNTOWN UNLOCKED':'CITY SECTOR'}\`;\n}\nfunction showUnlock(){\n let el=document.getElementById('build9-unlock');\n if(el)el.remove();\n el=document.createElement('div');el.id='build9-unlock';\n Object.assign(el.style,{position:'fixed',inset:'0',zIndex:'60',display:'grid',placeItems:'center',background:'rgba(0,0,0,.72)',fontFamily:'ui-monospace,monospace'});\n el.innerHTML=\`<div style=\"min-width:320px;max-width:560px;padding:28px 34px;text-align:center;background:#111519;border:3px solid #efc94c;box-shadow:0 18px 70px #000\"><div style=\"font-size:34px;font-weight:1000;color:#efc94c\">LEVEL COMPLETE</div><div style=\"margin-top:10px;font-size:18px;color:#fff\">CENTRAL DISTRICT CLEARED</div><div style=\"margin-top:18px;font-size:22px;font-weight:900;color:#6ee7ff\">DOWNTOWN ACCESS UNLOCKED</div><div style=\"margin-top:18px;color:#c7cbd0\">Score \${score.toLocaleString()} · Best \${bestScore.toLocaleString()} · Multiplier x\${multiplier}</div><div style=\"margin-top:20px;font-size:12px;color:#888\">CLICK OR PRESS ANY KEY TO CONTINUE</div></div>\`;\n const dismiss=()=>{el.remove();removeEventListener('keydown',dismiss);};\n el.addEventListener('pointerdown',dismiss,{once:true});addEventListener('keydown',dismiss,{once:true});\n document.body.appendChild(el);\n}\nfunction loadProgress(){\n try{\n  const raw=localStorage.getItem(SAVE_KEY);if(!raw){progressBadge();return;}\n  const p=JSON.parse(raw);\n  score=Math.max(0,Number(p.score)||0);multiplier=clamp(Number(p.multiplier)||1,1,5);\n  campaignIndex=clamp(Number(p.campaignIndex)||0,0,CAMPAIGN.length-1);\n  levelComplete=!!p.levelComplete;sectorUnlocked=!!p.sectorUnlocked;\n  bestScore=Math.max(score,Number(p.bestScore)||0);\n }catch(e){console.warn('Build 10 save load failed',e);}\n progressBadge();\n}\nfunction saveProgress(){\n bestScore=Math.max(bestScore,score);\n try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,score,multiplier,campaignIndex,levelComplete,sectorUnlocked,bestScore}));}\n catch(e){console.warn('Build 10 save failed',e);}\n progressBadge();\n}\nfunction clearProgress(){\n try{localStorage.removeItem(SAVE_KEY);}catch(e){}\n score=0;multiplier=1;campaignIndex=0;levelComplete=false;sectorUnlocked=false;bestScore=0;justUnlocked=false;progressBadge();\n}`,
    "progress helpers"
  );

  src = required(
    src,
    "campaignIndex=0;missionState='available';missionCar=null;missionCooldown=0;missionTimer=0;score=0;multiplier=1;updateHud();",
    "campaignIndex=0;missionState='available';missionCar=null;missionCooldown=0;missionTimer=0;score=0;multiplier=1;levelComplete=false;sectorUnlocked=false;bestScore=0;justUnlocked=false;loadProgress();updateHud();",
    "reset loads progress"
  );

  src = required(
    src,
    "if(e.code==='KeyR'&&!e.repeat)reset();keys.add(e.code);",
    "if(e.code==='KeyR'&&!e.repeat){if(e.shiftKey)clearProgress();reset();}keys.add(e.code);",
    "shift-r clear save"
  );

  src = required(
    src,
    `function completeMission(){\n const m=mission(),reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);missionCar=null;missionTimer=0;campaignIndex++;\n if(campaignIndex>=CAMPAIGN.length){missionState='campaign_complete';missionCooldown=5;statusMessage=\`CAMPAIGN COMPLETE +\${reward}\${score>=LEVEL_TARGET?' — LEVEL TARGET CLEARED':''}\`;statusTimer=4;}\n else{missionState='cooldown';missionCooldown=3;statusMessage=\`MISSION COMPLETE +\${reward} — NEXT: \${mission().title}\`;statusTimer=3;}\n}`,
    `function completeMission(){\n const m=mission(),reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);missionCar=null;missionTimer=0;campaignIndex++;\n if(campaignIndex>=CAMPAIGN.length){\n  const firstClear=!levelComplete&&score>=LEVEL_TARGET;\n  if(score>=LEVEL_TARGET){levelComplete=true;sectorUnlocked=true;}\n  campaignIndex=0;missionState='campaign_complete';missionCooldown=5;\n  statusMessage=\`CAMPAIGN COMPLETE +\${reward}\${levelComplete?' — LEVEL CLEARED':''}\`;statusTimer=4;\n  justUnlocked=firstClear;saveProgress();if(firstClear)showUnlock();\n }else{\n  missionState='cooldown';missionCooldown=3;statusMessage=\`MISSION COMPLETE +\${reward} — NEXT: \${mission().title}\`;statusTimer=3;saveProgress();\n }\n}`,
    "mission checkpoint save"
  );

  src = required(
    src,
    "if(missionCooldown>0){missionCooldown=Math.max(0,missionCooldown-dt);if(!missionCooldown){if(missionState==='campaign_complete')campaignIndex=0;missionState='available';statusMessage='MISSION PHONE READY';statusTimer=1.2;}}",
    "if(missionCooldown>0){missionCooldown=Math.max(0,missionCooldown-dt);if(!missionCooldown){missionState='available';statusMessage='MISSION PHONE READY';statusTimer=1.2;saveProgress();}}",
    "campaign completion checkpoint"
  );

  src = required(
    src,
    "if(missionState==='campaign_complete')return'MINI CAMPAIGN COMPLETE';",
    "if(missionState==='campaign_complete')return levelComplete?'LEVEL COMPLETE — DOWNTOWN UNLOCKED':'MINI CAMPAIGN COMPLETE';",
    "completion mission text"
  );

  src = required(
    src,
    "detailEl.textContent=`${first}${weapon}\\nWANTED ${wantedText()}${bust} · POLICE ${String(police.length).padStart(2,'0')}\\nLIVES ${lives} · TRAFFIC ${String(traffic).padStart(2,'0')} · PEDS ${String(pedn).padStart(2,'0')}\\nCAMPAIGN ${step}/${CAMPAIGN.length}: ${missionText()}\\nSCORE ${String(score).padStart(7,'0')} · TARGET ${LEVEL_TARGET} · x${multiplier}${msg}`;",
    "detailEl.textContent=`${first}${weapon}\\nWANTED ${wantedText()}${bust} · POLICE ${String(police.length).padStart(2,'0')}\\nLIVES ${lives} · TRAFFIC ${String(traffic).padStart(2,'0')} · PEDS ${String(pedn).padStart(2,'0')}\\nCAMPAIGN ${step}/${CAMPAIGN.length}: ${missionText()}\\nSCORE ${String(score).padStart(7,'0')} · TARGET ${LEVEL_TARGET} · x${multiplier}\\nPROGRESS ${levelComplete?'LEVEL CLEARED · DOWNTOWN UNLOCKED':'AUTO-SAVED'}${msg}`;",
    "progress HUD"
  );

  src = required(
    src,
    "function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(frame);}reset();requestAnimationFrame(frame);",
    "function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();areaBadge();requestAnimationFrame(frame);}reset();progressBadge();areaBadge();requestAnimationFrame(frame);",
    "area badge init"
  );

  const blob = new Blob([src], {type:'text/javascript'});
  const script = document.createElement('script');
  script.src = URL.createObjectURL(blob);
  script.onload = () => URL.revokeObjectURL(script.src);
  document.head.appendChild(script);
}).catch(err => {
  console.error(err);
  const detail = document.getElementById('detail');
  if (detail) detail.textContent = `BUILD 10 LOAD ERROR\n${err.message}`;
});
})();