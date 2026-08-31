if (!window.__gtaBuild30DecodeFix) {
window.__gtaBuild30DecodeFix = true;
window.__prepareBitmap30 = async function(){
  const current=window.__bitmap30AtlasImage;
  if(current&&current.naturalWidth>0)return current;
  if(typeof BITMAP30_SLICED_URI!=='string'||!BITMAP30_SLICED_URI.includes(','))throw new Error('Build 30 sliced atlas URI unavailable');
  const encoded=BITMAP30_SLICED_URI.slice(BITMAP30_SLICED_URI.indexOf(',')+1);
  const raw=atob(encoded),bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  const blob=new Blob([bytes],{type:'image/png'});
  const bitmap=await createImageBitmap(blob);
  const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
  const g=canvas.getContext('2d',{alpha:true});g.imageSmoothingEnabled=false;g.drawImage(bitmap,0,0);
  if(typeof bitmap.close==='function')bitmap.close();
  window.__bitmap30AtlasImage=canvas;
  window.__bitmap30AtlasReady=true;
  window.__bitmap30DecodeMode='blob-imagebitmap-canvas';
  const detail=document.getElementById('detail');
  if(detail)detail.textContent=`BITMAP ATLAS DECODED ${canvas.width}×${canvas.height}`;
  return canvas;
};
}
