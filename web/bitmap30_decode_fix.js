if (!window.__gtaBuild30DecodeFix) {
window.__gtaBuild30DecodeFix = true;

window.__prepareBitmap30 = async function(){
  const paths=window.__bitmap30AtlasPaths;
  if(!paths||!paths.map||!paths.image)throw new Error('Build 30 Git bitmap asset paths unavailable');

  const [mapResponse,imageResponse]=await Promise.all([
    fetch(paths.map,{cache:'no-cache'}),
    fetch(paths.image,{cache:'no-cache'})
  ]);
  if(!mapResponse.ok)throw new Error(`Unable to load Build 30 atlas map (${mapResponse.status})`);
  if(!imageResponse.ok)throw new Error(`Unable to load Build 30 atlas image (${imageResponse.status})`);

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

  const imageBlob=await imageResponse.blob();
  if(!imageBlob.size)throw new Error('Build 30 atlas image response was empty');
  const objectUrl=URL.createObjectURL(imageBlob);
  const image=new Image();
  image.decoding='async';
  try{
    await new Promise((resolve,reject)=>{
      image.addEventListener('load',resolve,{once:true});
      image.addEventListener('error',()=>reject(new Error(`Unable to decode Build 30 atlas image: ${paths.image}`)),{once:true});
      image.src=objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  if(image.naturalWidth<1||image.naturalHeight<1)throw new Error('Build 30 atlas image decoded at zero size');

  let maxX=0,maxY=0;
  for(const r of Object.values(sprites)){
    if(!r)continue;
    maxX=Math.max(maxX,Number(r.x||0)+Number(r.w||0));
    maxY=Math.max(maxY,Number(r.y||0)+Number(r.h||0));
  }
  if(maxX>image.naturalWidth||maxY>image.naturalHeight){
    throw new Error(`Build 30 atlas map exceeds image bounds (${maxX}×${maxY} map vs ${image.naturalWidth}×${image.naturalHeight} image)`);
  }

  window.__bitmap30AtlasMap=atlas;
  window.__bitmap30AtlasImage=image;
  window.__bitmap30AtlasReady=true;
  window.__bitmap30DecodeMode='git-file-image';

  const detail=document.getElementById('detail');
  if(detail)detail.textContent=`BITMAP ATLAS ONLINE · GIT FILE · ${image.naturalWidth}×${image.naturalHeight}`;
  return image;
};
}
