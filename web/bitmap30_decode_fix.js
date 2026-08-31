if (!window.__gtaBuild30DecodeFix) {
window.__gtaBuild30DecodeFix = true;

window.__prepareBitmap30 = async function(){
  const paths=window.__bitmap30AtlasPaths;
  if(!paths||!paths.map||!paths.image)throw new Error('Build 30 Git bitmap asset paths unavailable');

  const mapResponse=await fetch(paths.map,{cache:'no-cache'});
  if(!mapResponse.ok)throw new Error(`Unable to load Build 30 atlas map (${mapResponse.status})`);
  const atlas=await mapResponse.json();
  if(!atlas||!atlas.sprites||!Object.keys(atlas.sprites).length)throw new Error('Build 30 atlas map has no sprites');

  // Keep the whole visual pass bitmap-backed even when the authored atlas uses a
  // more general terrain/pedestrian region name than the renderer expects.
  const sprites=atlas.sprites;
  if(!sprites.player&&sprites.ped_a)sprites.player={...sprites.ped_a};
  if(!sprites.grass&&sprites.bushes)sprites.grass={...sprites.bushes};
  if(!sprites.alley&&sprites.asphalt)sprites.alley={...sprites.asphalt};
  if(!sprites.airfield&&sprites.concrete)sprites.airfield={...sprites.concrete};
  if(!sprites.runway&&sprites.asphalt)sprites.runway={...sprites.asphalt};

  const image=new Image();
  image.decoding='async';
  const loaded=new Promise((resolve,reject)=>{
    image.addEventListener('load',()=>resolve(image),{once:true});
    image.addEventListener('error',()=>reject(new Error(`Unable to load Build 30 atlas image: ${paths.image}`)),{once:true});
  });
  image.src=paths.image;
  await loaded;
  if(image.naturalWidth<1||image.naturalHeight<1)throw new Error('Build 30 atlas image decoded at zero size');

  window.__bitmap30AtlasMap=atlas;
  window.__bitmap30AtlasImage=image;
  window.__bitmap30AtlasReady=true;
  window.__bitmap30DecodeMode='git-file-image';

  const detail=document.getElementById('detail');
  if(detail)detail.textContent=`BITMAP ATLAS ONLINE · GIT FILE · ${image.naturalWidth}×${image.naturalHeight}`;
  return image;
};
}
