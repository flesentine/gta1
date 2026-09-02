window.__gtaCore28Compat = true;

const SAVE_KEY='gta1-build9-progress-v1';
let levelComplete=false,sectorUnlocked=false,bestScore=0,justUnlocked=false;
let missionMenuOpen=false,missionMenuDismissed=false,minimapVisible=true;
let chainIndex=0,chainPoints=[];

const coreCity28=window.__city28Data||{};
const toRects28=list=>(list||[]).map(r=>({x:Number(r[0]),y:Number(r[1]),w:Number(r[2]),h:Number(r[3])}));
const PARKING_LOTS=toRects28(coreCity28.parking_lots);
const ALLEYS=toRects28(coreCity28.alleys);
const DISTRICTS=Array.isArray(coreCity28.districts)?coreCity28.districts:[];

function rgbHex28(v,fallback='#65c6df'){
  if(!Array.isArray(v)||v.length<3)return fallback;
  const h=n=>Math.round(Math.max(0,Math.min(1,Number(n)||0))*255).toString(16).padStart(2,'0');
  return `#${h(v[0])}${h(v[1])}${h(v[2])}`;
}
function point28(v,fallback=[0,0]){const p=Array.isArray(v)&&v.length>=2?v:fallback;return{x:Number(p[0])||0,y:Number(p[1])||0};}
function rect28(v){const r=Array.isArray(v)&&v.length>=4?v:[0,0,0,0];return{x:Number(r[0])||0,y:Number(r[1])||0,w:Number(r[2])||0,h:Number(r[3])||0};}
function normalizeCoreMission28(m){
  const base={id:String(m.id||''),title:String(m.title||'JOB'),type:String(m.type||''),time:Number(m.time_limit||0),reward:Number(m.base_reward||0)};
  if(m.target_color)base.color=rgbHex28(m.target_color);
  if(m.vehicle_spawn)base.spawn=point28(m.vehicle_spawn);
  if(m.delivery_rect)base.delivery=rect28(m.delivery_rect);
  if(m.mission_ammo!=null)base.ammo=Number(m.mission_ammo)||0;
  if(m.starting_wanted!=null)base.wanted=Number(m.starting_wanted)||0;
  if(m.checkpoints){base.checkpoints=m.checkpoints;base.radius=Number(m.checkpoint_radius||90);base.maxCheckpointSpeed=Number(m.checkpoint_speed||110);base.heat=Number(m.checkpoint_heat||0);}
  if(m.drop_rect)base.drop=rect28(m.drop_rect);
  if(m.package_position)base.package=point28(m.package_position);
  if(m.drop_speed!=null)base.dropSpeed=Number(m.drop_speed)||75;
  if(m.escape_wanted!=null)base.wanted=Number(m.escape_wanted)||0;
  return base;
}

function installCoreData28(){
  const w=coreCity28.world;
  if(Array.isArray(w)&&w.length>=4){WORLD.x=Number(w[0]);WORLD.y=Number(w[1]);WORLD.w=Number(w[2]);WORLD.h=Number(w[3]);}
  if(Array.isArray(coreCity28.road_x))ROAD_X.splice(0,ROAD_X.length,...coreCity28.road_x.map(Number));
  if(Array.isArray(coreCity28.road_y))ROAD_Y.splice(0,ROAD_Y.length,...coreCity28.road_y.map(Number));
  if(Array.isArray(coreCity28.buildings))buildings.splice(0,buildings.length,...toRects28(coreCity28.buildings));
  if(Array.isArray(coreCity28.traffic_routes))routes.splice(0,routes.length,...coreCity28.traffic_routes.map(r=>r.map(p=>[Number(p[0]),Number(p[1])])));
  if(Array.isArray(coreCity28.traffic_spawns))spawnPlan.splice(0,spawnPlan.length,...coreCity28.traffic_spawns.map(p=>[Number(p[0]),Number(p[1])]));
  if(Array.isArray(coreCity28.pedestrian_routes))sidewalkRoutes.splice(0,sidewalkRoutes.length,...coreCity28.pedestrian_routes.map(r=>r.map(p=>[Number(p[0]),Number(p[1])])));
  const missionData=window.__missions28Data;
  if(missionData&&Array.isArray(missionData.campaign)){
    const first=missionData.campaign.slice(0,5).map(normalizeCoreMission28);
    if(first.length>=5)CAMPAIGN.splice(0,CAMPAIGN.length,...first);
  }
}
installCoreData28();

function districtName(){
  const p=playerTarget();
  if(p.x>=3000)return p.y>850?'DOCKLANDS':'HARBOR EAST';
  if(p.x<=-3000)return p.y>850?'AIRFIELD':'WEST RIDGE';
  if(p.x>900)return'DOWNTOWN';
  if(p.x<-900&&p.y>500)return'WAREHOUSE ROW';
  if(p.x<-900)return'MARKET WEST';
  return'CENTRAL';
}
function areaBadge(){
  let el=document.getElementById('build10-area');
  if(!el){el=document.createElement('div');el.id='build10-area';Object.assign(el.style,{position:'fixed',right:'18px',bottom:'68px',zIndex:'30',padding:'7px 10px',background:'rgba(5,7,9,.72)',border:'1px solid rgba(255,255,255,.14)',borderRadius:'6px',font:'800 12px ui-monospace,monospace',color:'#e8eef5',pointerEvents:'none'});document.body.appendChild(el);}
  el.textContent='AREA  ·  '+districtName();
}
function progressBadge(){
  let el=document.getElementById('build9-progress');
  if(!el){el=document.createElement('div');el.id='build9-progress';Object.assign(el.style,{position:'fixed',top:'18px',left:'50%',transform:'translateX(-50%)',zIndex:'30',padding:'8px 12px',background:'rgba(5,7,9,.84)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'7px',font:'700 12px ui-monospace,monospace',color:'#f3f3f3',pointerEvents:'none'});document.body.appendChild(el);}
  el.textContent=`SAVE ✓  ·  BEST ${String(bestScore).padStart(7,'0')}  ·  ${levelComplete?'FULL CITY UNLOCKED':'CITY SECTOR'}`;
}
function showUnlock(){
  let el=document.getElementById('build9-unlock');if(el)el.remove();
  el=document.createElement('div');el.id='build9-unlock';
  Object.assign(el.style,{position:'fixed',inset:'0',zIndex:'60',display:'grid',placeItems:'center',background:'rgba(0,0,0,.72)',fontFamily:'ui-monospace,monospace'});
  el.innerHTML=`<div style="min-width:320px;max-width:620px;padding:28px 34px;text-align:center;background:#111519;border:3px solid #efc94c;box-shadow:0 18px 70px #000"><div style="font-size:34px;font-weight:1000;color:#efc94c">LEVEL COMPLETE</div><div style="margin-top:10px;font-size:18px;color:#fff">CENTRAL DISTRICT CLEARED</div><div style="margin-top:18px;font-size:22px;font-weight:900;color:#6ee7ff">WEST RIDGE + HARBOR EAST + 14 POST-CLEAR JOBS UNLOCKED</div><div style="margin-top:18px;color:#c7cbd0">Score ${score.toLocaleString()} · Best ${bestScore.toLocaleString()} · Multiplier x${multiplier}</div><div style="margin-top:20px;font-size:12px;color:#888">CLICK OR PRESS ANY KEY TO CONTINUE</div></div>`;
  const dismiss=()=>{if(el.isConnected)el.remove();removeEventListener('keydown',dismiss);};
  el.addEventListener('pointerdown',dismiss,{once:true});addEventListener('keydown',dismiss,{once:true});document.body.appendChild(el);
}
function loadProgress(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);if(!raw){progressBadge();return;}
    const p=JSON.parse(raw);score=Math.max(0,Number(p.score)||0);multiplier=clamp(Number(p.multiplier)||1,1,5);
    campaignIndex=clamp(Number(p.campaignIndex)||0,0,Math.max(0,CAMPAIGN.length-1));levelComplete=!!(p.levelComplete??p.level_complete);sectorUnlocked=!!(p.sectorUnlocked??p.sector_unlocked??levelComplete);bestScore=Math.max(score,Number(p.bestScore??p.best_score)||0);
  }catch(e){console.warn('Build 28 progress load failed',e);}progressBadge();
}
function saveProgress(){
  bestScore=Math.max(bestScore,score);
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,score,multiplier,campaignIndex,levelComplete,sectorUnlocked,bestScore}));}catch(e){console.warn('Build 28 progress save failed',e);}progressBadge();
}
function clearProgress(){
  try{localStorage.removeItem(SAVE_KEY);}catch(e){}
  score=0;multiplier=1;campaignIndex=0;levelComplete=false;sectorUnlocked=false;bestScore=0;justUnlocked=false;progressBadge();
}
