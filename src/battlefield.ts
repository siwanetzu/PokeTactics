/** Pixel-style island arena. Deterministic scenery keeps seeded battles reproducible. */
export function drawIsland(ctx:CanvasRenderingContext2D,w:number,h:number,board:{left:number;top:number;right:number;bottom:number}) {
 const {left:l,top:t,right:r,bottom:b}=board,cx=w/2,s=Math.max(.4,(r-l)/520);
 const rect=(x:number,y:number,a:number,b:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(a),Math.round(b));};
 const poly=(points:number[][],fill:string,stroke?:string)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2*s;ctx.stroke();}};
 // Open water: short staggered strokes create the reference's pixel-art texture.
 rect(0,0,w,h,'#235b68');
 for(let row=0;row<h/12;row++)for(let col=0;col<w/38;col++){
  const n=(row*37+col*19)%11,x=col*38+(row%2)*17,y=row*12;
  rect(x,y,11+n*2,2,['#317080','#286573','#397b86','#245f6d'][n%4]);
  if(n===2)rect(x+12,y+5,9,1,'#51939b');
 }
 // Rocky shoreline and shallow water around the island.
 const shore=[[l+22*s,t-42*s],[cx-55*s,t-52*s],[cx+80*s,t-48*s],[r-12*s,t-38*s],[r+35*s,t+40*s],[r+49*s,b-45*s],[r+20*s,b+35*s],[l-35*s,b+30*s],[l-45*s,b-80*s],[l-16*s,t+55*s]];
 poly(shore.map(([x,y])=>[cx+(x-cx)*1.055,y+9*s]),'#477d78');
 poly(shore.map(([x,y])=>[x,y+10*s]),'#303a32');poly(shore,'#574d39');
 poly([[l+35*s,t-36*s],[r-22*s,t-36*s],[r+8*s,t+75*s],[r+25*s,b-35*s],[r-3*s,b+15*s],[l-17*s,b+15*s],[l-21*s,t+80*s]],'#665c40');
 for(let i=0;i<34;i++){
  const side=i%2,x=side?r+13*s+(i%4)*4*s:l-13*s-(i%4)*4*s,y=t+(b-t)*(i/34);
  rect(x,y,(3+i%4)*s,3*s,i%3?'#91856a':'#303e34');if(i%5===0)rect(x+8*s,y,4*s,5*s,'#558373');
 }
 // Houses and fences at the far bank.
 function house(x:number,y:number){rect(x+4*s,y+15*s,37*s,29*s,'#bbad81');rect(x+13*s,y+24*s,9*s,20*s,'#645e51');rect(x+28*s,y+23*s,8*s,8*s,'#7196a0');poly([[x-3*s,y+17*s],[x+5*s,y],[x+39*s,y],[x+45*s,y+17*s]],'#405c88','#30445d');rect(x+7*s,y+3*s,29*s,2*s,'#5974a1');}
 const hy=Math.max(10*s,t-50*s);poly([[cx-300*s,hy+40*s],[cx-270*s,0],[cx+250*s,0],[cx+300*s,hy+40*s]],'#728259');
 // Village path, grass tufts and little flower beds give the far bank depth.
 rect(cx-19*s,0,38*s,t-25*s,'#998765');
 for(let y=8*s;y<t-30*s;y+=17*s){rect(cx-16*s,y,13*s,7*s,'#baa681');rect(cx+2*s,y+5*s,12*s,7*s,'#ac9874');}
 for(let i=0;i<26;i++){const x=cx-260*s+(i*61%500)*s,y=(12+(i*29%Math.max(20,hy/s-10)))*s;rect(x,y,3*s,5*s,'#8e9c67');rect(x+4*s,y+2*s,3*s,4*s,'#a1aa75');if(i%6===0)rect(x+2*s,y-2*s,3*s,2*s,'#dcc897');}
 house(cx-240*s,hy);house(cx-115*s,hy-15*s);house(cx+103*s,hy-15*s);house(cx+218*s,hy);
 function fence(x:number,y:number,length:number){rect(x,y+5*s,length,3*s,'#d5c7a0');rect(x,y+13*s,length,3*s,'#ad9e7b');for(let i=0;i<length/(19*s);i++)rect(x+i*19*s,y,4*s,23*s,'#e2d3a8');}
 fence(cx-290*s,t-45*s,180*s);fence(cx+110*s,t-45*s,180*s);
 // Decorative stones float beyond the two shores.
 for(const [x,y,n] of [[l-85*s,t+55*s,23],[r+95*s,t+80*s,25],[l-105*s,b-80*s,34],[r+125*s,b-45*s,30],[l-190*s,b+15*s,21],[r+205*s,t+30*s,18]]){
  poly([[x-n*s,y],[x-n*.65*s,y-n*.65*s],[x+n*.4*s,y-n*.8*s],[x+n*s,y-n*.15*s],[x+n*.75*s,y+n*.7*s],[x-n*.4*s,y+n*.85*s]],'#777568');
  rect(x-n*.3*s,y-n*.5*s,n*.7*s,3*s,'#8e8a77');
 }
 // The plaza edges stay irregular, rather than surrounding the grid with a panel.
 rect(cx-12*s,t-43*s,24*s,18*s,'#917b53');rect(cx-8*s,t-40*s,16*s,3*s,'#baa27a');
 const vignette=ctx.createRadialGradient(cx,h*.45,Math.min(w,h)*.22,cx,h*.45,Math.max(w,h)*.7);vignette.addColorStop(0,'#071e2200');vignette.addColorStop(1,'#061d3266');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
}
