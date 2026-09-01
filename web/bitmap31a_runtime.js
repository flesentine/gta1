if (!window.__gtaBuild31ARuntime) {
window.__gtaBuild31ARuntime=true;
const assets31=()=>window.__bitmap31aAssets||{};
const ready31=()=>!!window.__bitmap31aReady&&window.__bitmap31aEnabled!==false;
function drawAsset31(id,x,y,rot=0,alpha=1){
  const e=assets31()[id];if(!ready31()||!e)return false;
  const m=e.meta;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.globalAlpha*=alpha;
  ctx.drawImage(e.img,-m.worldW/2,-m.worldH/2,m.worldW,m.worldH);ctx.restore();return true;
}
const drawPlayer31Base=drawPlayer;
drawPlayer=function(){
  if(!player.active)return;
  if(!ready31())return drawPlayer31Base();
  const a=Math.atan2(player.fy||-1,player.fx||0)+Math.PI/2;
  if(!drawAsset31('player',player.x,player.y,a,1))return drawPlayer31Base();
};
const drawPed31Base=drawPed;
drawPed=function(p){
  if(!ready31()||p.hostile29||p.missionTarget15||p.raidDown27||p.frontDown28)return drawPed31Base(p);
  const down=(p.dead>0||p.down>0),a=down?Math.PI/2:Math.atan2(p.fy||0,p.fx||0)+Math.PI/2;
  if(!drawAsset31('ped_01',p.x,p.y,a,down?.62:1))return drawPed31Base(p);
};
function carAsset31(c){
  const s=String(c.color||'').toLowerCase();
  if(s.includes('287acd')||s.includes('57b2bd')||s.includes('blue')||s.includes('teal'))return 'car_blue';
  return 'car_red';
}
const drawCar31Base=drawCar;
drawCar=function(c){
  if(!ready31())return drawCar31Base(c);
  if(!drawAsset31(carAsset31(c),c.x,c.y,c.rot,c.destroyed?.60:1))return drawCar31Base(c);
};
const drawCop31Base=drawCop;
drawCop=function(c){
  if(!ready31())return drawCop31Base(c);
  if(!drawAsset31('police_car',c.x,c.y,c.rot,1))return drawCop31Base(c);
};
function mode31(on){
  window.__bitmap31aEnabled=!!on;
  const d=document.getElementById('detail');if(d)d.textContent=on?'BITMAP 31A · CLEAN INDIVIDUAL PNGS · F1 VECTOR / F2 BITMAP':'VECTOR BASELINE · F2 BITMAP 31A';
  if(typeof banner15==='function')banner15(on?'BITMAP 31A ONLINE':'VECTOR BASELINE','BUILD 31A');
}
addEventListener('keydown',e=>{if(e.code==='F1'){e.preventDefault();mode31(false);}else if(e.code==='F2'){e.preventDefault();mode31(true);}});
function replace31(root,from,to){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(n.nodeValue&&n.nodeValue.includes(from))n.nodeValue=n.nodeValue.split(from).join(to);}
const front31=document.getElementById('build11-front');if(front31){replace31(front31,'BUILD 29','BUILD 31A');replace31(front31,'BUILD 30','BUILD 31A');replace31(front31,'Hostile AI + Chapter One online','5-sprite bitmap recovery test');replace31(front31,'Sliced ImageGen bitmap assets online','5 clean individual PNGs online');}
if(typeof banner15==='function')banner15('5 CLEAN SPRITES ONLINE · F1/F2 A/B','BUILD 31A');
}
