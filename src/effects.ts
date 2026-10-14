import {species,type Hit} from './engine.ts';
type Profile={shape:string;color:string;accent:string};
export const abilityEffects:Record<number,Profile>={
45:{shape:'petals',color:'#f5b8ed',accent:'#e2ffa1'},135:{shape:'needles',color:'#ffe88a',accent:'#fffdf0'},59:{shape:'firefang',color:'#ff9958',accent:'#ffe48e'},131:{shape:'ice',color:'#9beaff',accent:'#f0ffff'},
 81:{shape:'magnet',color:'#99dcff',accent:'#eefbff'},100:{shape:'discharge',color:'#ffe785',accent:'#fffdf0'},26:{shape:'thunder',color:'#ffd47a',accent:'#fff9cc'},
 1:{shape:'vine',color:'#79d779',accent:'#d1ff91'},3:{shape:'solar',color:'#c7ef72',accent:'#fff8b2'},
 4:{shape:'flame',color:'#ff9345',accent:'#ffe880'},6:{shape:'fireblast',color:'#ff633d',accent:'#ffd981'},
 7:{shape:'water',color:'#71caff',accent:'#dcfaff'},9:{shape:'hydro',color:'#4abaff',accent:'#e6ffff'},
 23:{shape:'fang',color:'#c487e8',accent:'#f1d0ff'},25:{shape:'lightning',color:'#ffe368',accent:'#fffce1'},
 43:{shape:'drain',color:'#9ce16c',accent:'#efffa5'},52:{shape:'coins',color:'#edc565',accent:'#fff0b4'},
 54:{shape:'confusion',color:'#eab0f9',accent:'#fff0ff'},58:{shape:'wheel',color:'#ff9a45',accent:'#ffe194'},
 63:{shape:'psybeam',color:'#f394dd',accent:'#b8b0ff'},74:{shape:'rock',color:'#b8a080',accent:'#f6dbad'},
 92:{shape:'shadow',color:'#b391f3',accent:'#ded1ff'},94:{shape:'night',color:'#8872d9',accent:'#efa6ff'},
 95:{shape:'rockslide',color:'#b1a190',accent:'#e8d1aa'},133:{shape:'stars',color:'#ffe693',accent:'#fff9d8'},
 143:{shape:'slam',color:'#ccc4b6',accent:'#fff2ca'},147:{shape:'dragon',color:'#89afff',accent:'#f4c4ff'},
};
const line=(x:number,y:number,xx:number,yy:number,color:string,width=2)=>`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const ring=(x:number,y:number,r:number,color:string,width=2)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const star=(x:number,y:number,r:number,color:string)=>{const points=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.4:r;return `${x+Math.cos(a)*rr},${y+Math.sin(a)*rr}`;}).join(' ');return `<polygon points="${points}" fill="${color}"/>`;};
export function renderAttackEffects(hits:Hit[],point:(x:number,y:number)=>{x:number;y:number},width:number,height:number,size:number){
 let drawing='',labels='';
 for(const original of hits){const h={...original,life:original.life/(original.duration??1)};const age=1-h.life,cast=!!h.ability,profile=abilityEffects[h.species],color=cast?profile.color:h.color,accent=cast?profile.accent:'#fff1d3';const a=point(h.x,h.y),b=point(h.toX,h.toY);a.y-=size*.22;b.y-=size*.22;const progress=Math.max(0,Math.min(1,(age-.12)/.22)),x=a.x+(b.x-a.x)*progress,y=a.y+(b.y-a.y)*progress;let art='';
  if(h.primary&&age<.13){art+=ring(a.x,a.y,4+age*80,color,2);art+=star(a.x,a.y,3+age*20,accent);}
  if(h.primary&&age>=.12&&age<.36){
   // A faint trail makes every attacker/target pairing readable.
   art+=line(a.x,a.y,x,y,color,cast?2.2:1);
   const shape=cast?profile.shape:species(h.species).range===1?'slash':'bolt';
   if(['lightning','thunder'].includes(shape)){const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;const pts=Array.from({length:9},(_,i)=>{const t=i/8*progress,j=i===0||i===8?0:(i%2?7:-7);return `${a.x+dx*t-dy/l*j},${a.y+dy*t+dx/l*j}`;}).join(' ');art+=`<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="4"/><polyline points="${pts}" fill="none" stroke="${accent}" stroke-width="1.3"/>`;}
   else if(shape==='petals'){for(let i=0;i<6;i++)art+=`<ellipse cx="${x+Math.cos(i)*10}" cy="${y+Math.sin(i)*8}" rx="5" ry="2" fill="${color}" transform="rotate(${i*60} ${x} ${y})"/>`;}
   else if(shape==='needles'){for(let i=-1;i<=1;i++)art+=line(x-12,y+i*6,x+8,y+i*6,color,2);}
   else if(shape==='firefang'){art+=`<path d="M ${x-10} ${y-8} L ${x-5} ${y+9} L ${x} ${y-8} M ${x+2} ${y-8} L ${x+7} ${y+9} L ${x+12} ${y-8}" fill="${color}"/>`;}
   else if(shape==='ice'){art+=line(a.x,a.y,x,y,color,6)+star(x,y,12,accent)+line(x-15,y,x+15,y,accent,1);}
   else if(['solar','hydro','psybeam','dragon'].includes(shape)){art+=line(a.x,a.y,x,y,color,shape==='hydro'?9:6)+line(a.x,a.y,x,y,accent,2);for(let i=0;i<3;i++)art+=ring(x-i*5,y,4+i*2,color,1);}
   else if(shape==='vine'){const dx=x-a.x,dy=y-a.y;art+=`<path d="M ${a.x} ${a.y} Q ${a.x+dx*.4-dy*.15} ${a.y+dy*.4+dx*.15} ${x} ${y}" fill="none" stroke="${color}" stroke-width="4"/>`;art+=`<ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="${accent}" transform="rotate(-35 ${x} ${y})"/>`;}
   else if(['rock','rockslide'].includes(shape)){for(let i=0;i<(shape==='rockslide'?3:1);i++){const ry=y-Math.sin(progress*Math.PI)*15+i*7;art+=`<polygon points="${x-6},${ry-5} ${x+4},${ry-7} ${x+8},${ry+2} ${x},${ry+6} ${x-7},${ry+2}" fill="${i%2?accent:color}" stroke="#65574a"/>`;}}
   else if(['stars','coins'].includes(shape)){for(let i=0;i<3;i++){const px=x-i*8,py=y+Math.sin(progress*8+i)*7;art+=shape==='stars'?star(px,py,6,color):`<circle cx="${px}" cy="${py}" r="5" fill="${color}" stroke="${accent}"/>`;}}
   else if(shape==='fang'||shape==='slash'){art+=`<path d="M ${x-8} ${y+9} L ${x+5} ${y-8} M ${x-2} ${y+11} L ${x+11} ${y-6}" stroke="${color}" stroke-width="3" fill="none"/>`;}
   else if(['flame','fireblast','wheel'].includes(shape)){for(let i=0;i<4;i++){art+=`<ellipse cx="${x-i*5}" cy="${y+Math.sin(i+progress*8)*4}" rx="${8-i}" ry="${5+i%2}" fill="${i%2?accent:color}"/>`;}if(shape==='wheel')art+=ring(x,y,12,color,4);}
   else if(shape==='water'){for(let i=0;i<3;i++)art+=`<circle cx="${x-i*7}" cy="${y+i*2}" r="${5-i}" fill="${color}" stroke="${accent}"/>`;}
   else if(shape==='confusion'){art+=ring(x,y,10,color,2)+ring(x,y,6,accent,2);}
   else if(shape==='drain'){art+=`<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="${color}" transform="rotate(-35 ${x} ${y})"/>`;}
   else if(shape==='slam'){art+=ring(x,y,10,color,3)+star(x,y,6,accent);}
   else if(['shadow','night'].includes(shape)){art+=`<circle cx="${x}" cy="${y}" r="${shape==='night'?11:8}" fill="#44305f" stroke="${color}" stroke-width="3"/>`+ring(x,y,13,accent,1);}
   else art+=`<circle cx="${x}" cy="${y}" r="3" fill="${accent}" stroke="${color}" stroke-width="2"/>`;
  }
  if(age>=.34){const t=(age-.34)/.66,opacity=1-t;art+=`<g opacity="${opacity}">`+ring(b.x,b.y,5+t*(cast?24:12),color,cast?3:1.5);for(let i=0;i<(cast?8:4);i++){const angle=i*Math.PI*2/(cast?8:4)+h.species*.2;const px=b.x+Math.cos(angle)*(8+t*22),py=b.y+Math.sin(angle)*(8+t*22);art+=star(px,py,cast?3:1.7,i%2?accent:color);}if(cast&&h.primary){if(profile.shape==='fireblast')art+=star(b.x,b.y,18*(1-t),color);if(profile.shape==='night')art+=`<ellipse cx="${b.x}" cy="${b.y}" rx="${12+t*15}" ry="${8+t*10}" fill="#49345d77"/>`;if(profile.shape==='confusion')art+=ring(b.x,b.y,8+t*10,accent);if(profile.shape==='fang')art+=`<path d="M ${b.x-9} ${b.y-8} L ${b.x-6} ${b.y+4} L ${b.x-3} ${b.y-8} M ${b.x+3} ${b.y-8} L ${b.x+6} ${b.y+4} L ${b.x+9} ${b.y-8}" fill="${accent}"/>`;if(profile.shape==='drain'){const xx=b.x+(a.x-b.x)*t,yy=b.y+(a.y-b.y)*t;art+=`<circle cx="${xx}" cy="${yy}" r="4" fill="${accent}"/>`+ring(a.x,a.y,10+t*10,color);}}art+='</g>';
   if(h.value>0)labels+=`<div class="damage-number ${cast?'ability-hit':''}" style="left:${b.x}px;top:${b.y-size*.6-t*20}px;opacity:${opacity};color:${color}">${h.kind==='heal'?'+':''}${Math.round(h.value)}</div>`;
  }
  if(cast&&h.primary&&age<.65)labels+=`<div class="cast-label" style="left:${a.x}px;top:${a.y-size*.8}px;color:${color};opacity:${Math.min(1,h.life*3)}">${h.ability}</div>`;
  drawing+=art;
 }
 return `<svg class="combat-vfx" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><defs><filter id="spell-bloom" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${epicEffects(hits,point,size)}${drawing}</svg>${labels}`;
}

/** Cinematic layers share the same deterministic timeline as hit feedback. */
function epicEffects(hits:Hit[],point:(x:number,y:number)=>{x:number;y:number},size:number){
 let output='';
 for(const h of hits){if(!h.ability||h.kind==='heal')continue;
 const p=abilityEffects[h.species],u=1-h.life/(h.duration??1),a=point(h.x,h.y),b=point(h.toX,h.toY),r=size;
 a.y-=r*.22;b.y-=r*.22;
 const charge=Math.min(1,u/.18),travel=Math.max(0,Math.min(1,(u-.16)/.22)),impact=Math.max(0,(u-.36)/.64),fade=Math.min(1,(1-u)*3);
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,px=-dy/d,py=dx/d;
 let art='';
 if(h.primary&&u<.24){
  art+=`<g opacity="${1-u/.3}">`+ring(a.x,a.y+r*.22,r*.42*charge,p.color,2)+ring(a.x,a.y+r*.22,r*.56*charge,p.accent,1);
  for(let i=0;i<6;i++){const angle=i*Math.PI/3+u*6;art+=star(a.x+Math.cos(angle)*r*.5,a.y+r*.22+Math.sin(angle)*r*.25,2+charge*2,p.accent);}
  art+=`<circle cx="${a.x}" cy="${a.y}" r="${3+charge*8}" fill="${p.color}" opacity=".5"/></g>`;
 }
 if(u>.14&&u<.62){
  const ex=a.x+dx*travel,ey=a.y+dy*travel;
  if(['solar','hydro','psybeam','dragon'].includes(p.shape)){
   const beam=(p.shape==='solar'?r*.32:p.shape==='hydro'?r*.23:r*.14)*Math.sin(Math.min(1,(u-.14)/.5)*Math.PI);
   art+=`<g opacity="${u>.5?( .62-u)/.12:1}" filter="url(#spell-bloom)">`;
   if(p.shape==='hydro')for(const side of [-1,1])art+=line(a.x+px*r*.12*side,a.y+py*r*.12*side,ex+px*r*.12*side,ey+py*r*.12*side,p.color,beam);
   else art+=line(a.x,a.y,ex,ey,p.color,beam);
   art+=line(a.x,a.y,ex,ey,p.accent,Math.max(1,beam*.25));
   for(let i=0;i<7;i++){const t=((i/7+u*2)%1)*travel;art+=ring(a.x+dx*t,a.y+dy*t,beam*(.6+i%2*.3),p.accent,1);}
   art+='</g>';
  }
  if(p.shape==='vine'){for(const side of [-1,1]){art+=`<path d="M ${a.x} ${a.y} Q ${a.x+dx*.5+px*r*.4*side} ${a.y+dy*.5+py*r*.4*side} ${ex} ${ey}" stroke="${p.color}" stroke-width="${r*.09}" fill="none"/>`;for(let i=1;i<5;i++){const t=i/5*travel;art+=`<ellipse cx="${a.x+dx*t+px*Math.sin(t*Math.PI)*r*.3*side}" cy="${a.y+dy*t+py*Math.sin(t*Math.PI)*r*.3*side}" rx="${r*.13}" ry="${r*.05}" fill="${p.accent}" transform="rotate(${side*35} ${a.x+dx*t} ${a.y+dy*t})"/>`;}}}
  if(['flame','fireblast','wheel'].includes(p.shape)){for(let i=0;i<18;i++){const t=(i/18)*travel,w=Math.sin(t*Math.PI)*r*.35;const side=Math.sin(i*2.4+u*20);art+=`<circle cx="${a.x+dx*t+px*w*side}" cy="${a.y+dy*t+py*w*side}" r="${(3+i%4)*(1-u*.6)}" fill="${i%3?p.color:p.accent}" opacity=".75"/>`;}}
  if(p.shape==='stars'||p.shape==='coins')for(let i=0;i<5;i++){const offset=Math.sin(u*12+i)*r*.25,t=Math.max(0,travel-i*.035),x=a.x+dx*t+px*offset,y=a.y+dy*t+py*offset;art+=line(x-dx/d*15,y-dy/d*15,x,y,p.color,2)+star(x,y,4+i%3,p.accent);}
 }
 if(u>=.32){
  const t=impact;
  art+=`<g opacity="${fade}">`;
  if(['lightning','thunder'].includes(p.shape)){
   const bolt=(x:number,y:number,j:number)=>`<polyline points="${x-6},${y-r*2.4} ${x+8+j},${y-r*1.7} ${x-9},${y-r} ${x+7-j},${y-r*.6} ${x},${y}" stroke="${p.color}" stroke-width="4" fill="none"/>`;
   if(t<.42)art+=`<g filter="url(#spell-bloom)">${bolt(b.x,b.y,Math.sin(u*45)*8)}${line(a.x,a.y,b.x,b.y,p.accent,2)}</g>`;
   for(let i=0;i<5;i++){const angle=i*Math.PI*2/5;const x=b.x+Math.cos(angle)*r*.7,y=b.y+Math.sin(angle)*r*.4;art+=`<path d="M ${b.x} ${b.y} L ${(b.x+x)/2+5} ${(b.y+y)/2-4} L ${x} ${y}" stroke="${p.color}" fill="none"/>`;}
  }
  if(['water','hydro','discharge'].includes(p.shape)){for(let i=0;i<3;i++)art+=`<ellipse cx="${b.x}" cy="${b.y+r*.22}" rx="${r*(.3+t*.9+i*.17)}" ry="${r*(.13+t*.35+i*.07)}" stroke="${i%2?p.accent:p.color}" stroke-width="${3-i*.7}" fill="none" opacity="${1-t}"/>`;}
  if(['confusion','psybeam','magnet'].includes(p.shape))for(let i=0;i<3;i++)art+=`<ellipse cx="${b.x}" cy="${b.y}" rx="${r*(.25+i*.18)}" ry="${r*.18}" fill="none" stroke="${i%2?p.accent:p.color}" stroke-width="2" transform="rotate(${u*180+i*60} ${b.x} ${b.y})"/>`;
  if(p.shape==='fireblast')art+=`<g transform="translate(${b.x} ${b.y}) rotate(${u*15})" filter="url(#spell-bloom)">${star(0,0,r*(.7+t*.45),p.color)}${star(0,0,r*(.46+t*.2),p.accent)}</g>`;
  if(p.shape==='wheel'){for(let i=0;i<12;i++){const ang=i*Math.PI/6+u*10;art+=`<circle cx="${a.x+Math.cos(ang)*r*.75}" cy="${a.y+Math.sin(ang)*r*.38}" r="${r*.12}" fill="${i%2?p.color:p.accent}"/>`;}}
  if(['shadow','night'].includes(p.shape)){art+=`<ellipse cx="${b.x}" cy="${b.y}" rx="${r*(.35+t*.4)}" ry="${r*(.3+t*.3)}" fill="#170d30" stroke="${p.color}" stroke-width="3"/>`;for(let i=0;i<8;i++){const angle=i*Math.PI/4+u*3;art+=`<path d="M ${b.x} ${b.y} Q ${b.x+Math.cos(angle+.5)*r*.9} ${b.y+Math.sin(angle+.5)*r*.65} ${b.x+Math.cos(angle)*r*(.7+t*.3)} ${b.y+Math.sin(angle)*r*(.55+t*.2)}" stroke="${p.color}" fill="none" opacity=".7"/>`;}if(p.shape==='night')art+=`<path d="M ${b.x-r*.24} ${b.y} Q ${b.x} ${b.y-r*.25} ${b.x+r*.24} ${b.y} Q ${b.x} ${b.y+r*.2} ${b.x-r*.24} ${b.y}" fill="${p.accent}"/><circle cx="${b.x}" cy="${b.y}" r="3" fill="#20102d"/>`;}
  if(['rock','rockslide','slam'].includes(p.shape)){for(let i=0;i<8;i++){const angle=i*Math.PI/4,x=b.x+Math.cos(angle)*r*(.45+t*.6),y=b.y+Math.sin(angle)*r*(.2+t*.3);art+=`<path d="M ${b.x} ${b.y+r*.2} L ${(b.x+x)/2+4} ${(b.y+y)/2} L ${x} ${y}" stroke="#302834" stroke-width="2" fill="none"/>`;if(p.shape==='rockslide'&&t<.6){const yy=y-r*(1-t/.6)*1.4;art+=`<polygon points="${x-7},${yy-7} ${x+4},${yy-9} ${x+10},${yy+4} ${x},${yy+9} ${x-9},${yy+3}" fill="${p.color}" stroke="#65594f"/>`;}}
   art+=`<ellipse cx="${b.x}" cy="${b.y+r*.22}" rx="${r*(.35+t*1.4)}" ry="${r*(.14+t*.55)}" stroke="${p.accent}" stroke-width="${4*(1-t)}" fill="none"/>`;
  }
  if(p.shape==='fang'){art+=`<ellipse cx="${b.x}" cy="${b.y+r*.25}" rx="${r*.55}" ry="${r*.18}" fill="${p.color}" opacity=".2"/>`;for(const side of [-1,1])art+=`<path d="M ${b.x+side*r*.3} ${b.y-r*.4} L ${b.x+side*r*.18} ${b.y+r*.1} L ${b.x+side*r*.06} ${b.y-r*.4}" fill="${p.accent}"/>`;}
  if(p.shape==='drain')for(let i=0;i<7;i++){const tt=(t+i/7)%1;art+=`<circle cx="${b.x+(a.x-b.x)*tt+Math.sin(tt*8+i)*8}" cy="${b.y+(a.y-b.y)*tt}" r="${2+i%3}" fill="${p.accent}"/>`;}
  for(let i=0;i<18;i++){const angle=i*2.399+h.species*.15,dist=r*(.15+t*(.65+(i%4)*.2));const x=b.x+Math.cos(angle)*dist,y=b.y+Math.sin(angle)*dist*.65-t*t*r*.2;art+=`<circle cx="${x}" cy="${y}" r="${(1+i%3)*(1-t*.6)}" fill="${i%3?p.color:p.accent}" opacity="${1-t}"/>`;}
  art+='</g>';
 }
 output+=art;
 }
 return output;
}
