import {cell,type Fighter,type Hit} from './engine.ts';

// Animated front sprites face left in their source assets. Store visual facing
// outside combat state so rendering cannot change seeded replay checksums.
const directions=new WeakMap<Fighter,number>();
export function spriteFacing(f:Fighter,fighters:Fighter[],hits:Hit[]=[]):number {
 let direction=directions.get(f)??(f.team?1:-1);
 let dx=0;
 if(f.moveTo!==null)dx=cell(f.moveTo).x-f.x;
 else {
  const primary=f.strike?.victims.find(v=>v.hit.primary);
  const attack=primary?.hit??[...hits].reverse().find(h=>h.attacker===f.uid&&h.primary&&h.life/(h.duration??1)>.64);
  if(attack){const target=fighters.find(v=>v.uid===attack.target);dx=(target?.x??attack.toX)-f.x;}
 }
 // Vertical actions retain facing instead of flipping on floating-point noise.
 if(Math.abs(dx)>.01)direction=Math.sign(dx);
 directions.set(f,direction);
 return -direction;
}
