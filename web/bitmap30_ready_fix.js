if (!window.__gtaBuild30ReadyFix) {
window.__gtaBuild30ReadyFix = true;
function bitmap30Ready(){
  if(!bitmap30Enabled||!BITMAP30)return false;
  if(typeof BITMAP30.getContext==='function')return BITMAP30.width>0&&BITMAP30.height>0;
  return !!(BITMAP30.complete&&BITMAP30.naturalWidth>0);
}
if(bitmap30Ready()){
  bitmap30Patterns.clear();
  if(typeof banner15==='function')banner15('SLICED BITMAP ART ONLINE','BUILD 30');
  const detail=document.getElementById('detail');
  if(detail&&detail.textContent.includes('LOADING'))detail.textContent='BITMAP ATLAS ONLINE';
}
}
