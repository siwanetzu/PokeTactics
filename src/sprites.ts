const revision='2';
export function spriteURL(id:number){return `/sprites/animated/${id}.gif?v=${revision}`;}

const loading=new Map<number,Promise<boolean>>();
export function preloadSprites(ids:number[]){
 return Promise.all([...new Set(ids)].map(id=>{
  const cached=loading.get(id);if(cached)return cached;
  const pending=new Promise<boolean>(resolve=>{
   const image=new Image();
   image.onload=()=>resolve(true);
   image.onerror=()=>{loading.delete(id);resolve(false);};
   image.src=spriteURL(id);
  });loading.set(id,pending);return pending;
 }));
}

// A failed network request can stay attached to an image even after the local
// server recovers. Retry once with a fresh URL rather than showing broken art.
export function installSpriteRecovery(root:Document){
 const attempts=new WeakSet<HTMLImageElement>();
 root.addEventListener('error',event=>{
  const image=event.target;
  if(!(image instanceof HTMLImageElement)||!image.classList.contains('sprite')||attempts.has(image))return;
  const url=new URL(image.src);if(!url.pathname.startsWith('/sprites/animated/'))return;
  attempts.add(image);url.searchParams.set('retry','1');image.src=url.href;
 },true);
}
