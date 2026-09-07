if (!window.__gtaBuild31ALoader) {
window.__gtaBuild31ALoader = true;
window.__prepareBitmap31A = async function(){
  const res=await fetch('assets/build31a/manifest.json',{cache:'no-cache'});
  if(!res.ok)throw new Error(`Build 31A manifest (${res.status})`);
  const manifest=await res.json();
  const required=['player','ped_01','car_red','car_blue','police_car'];
  for(const id of required)if(!manifest.assets||!manifest.assets[id])throw new Error(`Build 31A missing ${id}`);
  const loaded={};
  await Promise.all(Object.entries(manifest.assets).map(async([id,meta])=>{
    const img=new Image();img.decoding='async';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error(`Build 31A failed ${meta.src}`));img.src=meta.src;});
    if(img.naturalWidth!==meta.sourceW||img.naturalHeight!==meta.sourceH)throw new Error(`Build 31A ${id} dimensions ${img.naturalWidth}x${img.naturalHeight}, expected ${meta.sourceW}x${meta.sourceH}`);
    loaded[id]={img,meta};
  }));
  window.__bitmap31aManifest=manifest;
  window.__bitmap31aAssets=loaded;
  window.__bitmap31aReady=true;
  window.__bitmap31aEnabled=true;
  const d=document.getElementById('detail');if(d)d.textContent='BITMAP 31A ONLINE · 5 CLEAN PNGS · F1 VECTOR / F2 BITMAP';
  return loaded;
};
}
