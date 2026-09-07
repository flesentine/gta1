(() => {
'use strict';

const required = (src, needle, replacement, label) => {
  if (!src.includes(needle)) throw new Error(`Build 9 patch missing: ${label}`);
  return src.replace(needle, replacement);
};

fetch('game8.js')
  .then(r => {
    if (!r.ok) throw new Error(`Unable to load Build 8 base (${r.status})`);
    return r.text();
  })
  .then(src => {
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
      `function cop(x,y,level){return{x,y,rot:0,speed:170,max:350+level*38,accel:520+level*55,turn:2.8,level,siren:Math.random()*6,stuck:0};}
function progressBadge(){
 let el=document.getElementById('build9-progress');
 if(!el){el=document.createElement('div');el.id='build9-progress';Object.assign(el.style,{position:'fixed',top:'18px',left:'50%',transform:'translateX(-50%)',zIndex:'30',padding:'8px 12px',background:'rgba(5,7,9,.84)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'7px',font:'700 12px ui-monospace,monospace',color:'#f3f3f3',pointerEvents:'none'});document.body.appendChild(el);}
 el.textContent=\`SAVE ✓  ·  BEST \${String(bestScore).padStart(7,'0')}  ·  \${sectorUnlocked?'DOWNTOWN UNLOCKED':'CENTRAL DISTRICT'}\`;
}
function showUnlock(){
 let el=document.getElementById('build9-unlock');
 if(el)el.remove();
 el=document.createElement('div');el.id='build9-unlock';
 Object.assign(el.style,{position:'fixed',inset:'0',zIndex:'60',display:'grid',placeItems:'center',background:'rgba(0,0,0,.72)',fontFamily:'ui-monospace,monospace'});
 el.innerHTML=\`<div style="min-width:320px;max-width:560px;padding:28px 34px;text-align:center;background:#111519;border:3px solid #efc94c;box-shadow:0 18px 70px #000"><div style="font-size:34px;font-weight:1000;color:#efc94c">LEVEL COMPLETE</div><div style="margin-top:10px;font-size:18px;color:#fff">CENTRAL DISTRICT CLEARED</div><div style="margin-top:18px;font-size:22px;font-weight:900;color:#6ee7ff">DOWNTOWN ACCESS UNLOCKED</div><div style="margin-top:18px;color:#c7cbd0">Score \${score.toLocaleString()} · Best \${bestScore.toLocaleString()} · Multiplier x\${multiplier}</div><div style="margin-top:20px;font-size:12px;color:#888">CLICK OR PRESS ANY KEY TO CONTINUE</div></div>\`;
 const dismiss=()=>{el.remove();removeEventListener('keydown',dismiss);};
 el.addEventListener('pointerdown',dismiss,{once:true});addEventListener('keydown',dismiss,{once:true});
 document.body.appendChild(el);
}
function loadProgress(){
 try{
  const raw=localStorage.getItem(SAVE_KEY);if(!raw){progressBadge();return;}
  const p=JSON.parse(raw);
  score=Math.max(0,Number(p.score)||0);multiplier=clamp(Number(p.multiplier)||1,1,5);
  campaignIndex=clamp(Number(p.campaignIndex)||0,0,CAMPAIGN.length-1);
  levelComplete=!!p.levelComplete;sectorUnlocked=!!p.sectorUnlocked;
  bestScore=Math.max(score,Number(p.bestScore)||0);
 }catch(e){console.warn('Build 9 save load failed',e);}
 progressBadge();
}
function saveProgress(){
 bestScore=Math.max(bestScore,score);
 try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,score,multiplier,campaignIndex,levelComplete,sectorUnlocked,bestScore}));}
 catch(e){console.warn('Build 9 save failed',e);}
 progressBadge();
}
function clearProgress(){
 try{localStorage.removeItem(SAVE_KEY);}catch(e){}
 score=0;multiplier=1;campaignIndex=0;levelComplete=false;sectorUnlocked=false;bestScore=0;justUnlocked=false;progressBadge();
}`,
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
      `function completeMission(){
 const m=mission(),reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);missionCar=null;missionTimer=0;campaignIndex++;
 if(campaignIndex>=CAMPAIGN.length){missionState='campaign_complete';missionCooldown=5;statusMessage=\`CAMPAIGN COMPLETE +\${reward}\${score>=LEVEL_TARGET?' — LEVEL TARGET CLEARED':''}\`;statusTimer=4;}
 else{missionState='cooldown';missionCooldown=3;statusMessage=\`MISSION COMPLETE +\${reward} — NEXT: \${mission().title}\`;statusTimer=3;}
}`,
      `function completeMission(){
 const m=mission(),reward=m.reward*multiplier;score+=reward;multiplier=Math.min(multiplier+1,5);missionCar=null;missionTimer=0;campaignIndex++;
 if(campaignIndex>=CAMPAIGN.length){
  const firstClear=!levelComplete&&score>=LEVEL_TARGET;
  if(score>=LEVEL_TARGET){levelComplete=true;sectorUnlocked=true;}
  campaignIndex=0;missionState='campaign_complete';missionCooldown=5;
  statusMessage=\`CAMPAIGN COMPLETE +\${reward}\${levelComplete?' — LEVEL CLEARED':''}\`;statusTimer=4;
  justUnlocked=firstClear;saveProgress();if(firstClear)showUnlock();
 }else{
  missionState='cooldown';missionCooldown=3;statusMessage=\`MISSION COMPLETE +\${reward} — NEXT: \${mission().title}\`;statusTimer=3;saveProgress();
 }
}`,
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
      "function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(frame);}reset();progressBadge();requestAnimationFrame(frame);",
      "progress badge init"
    );

    const blob = new Blob([src], {type:'text/javascript'});
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    script.onload = () => URL.revokeObjectURL(script.src);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    const detail = document.getElementById('detail');
    if (detail) detail.textContent = `BUILD 9 LOAD ERROR\n${err.message}`;
  });
})();
