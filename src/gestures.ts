export type GestureSurface='board'|'bench'|'item';
export type GestureIntent='pending'|'scroll'|'drag';

// Decide before capturing a pointer or changing selection. Bench browsing must
// remain a native horizontal pan, even when the finger starts on a Pokémon.
export function gestureIntent(pointerType:string,surface:GestureSurface,dx:number,dy:number):GestureIntent{
 const threshold=pointerType==='touch'?8:6;
 if(Math.hypot(dx,dy)<=threshold)return 'pending';
 if(pointerType==='touch'&&surface==='bench'&&Math.abs(dx)>=Math.abs(dy))return 'scroll';
 return 'drag';
}
