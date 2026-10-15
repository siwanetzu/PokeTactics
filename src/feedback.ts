import type {Hit,Fighter} from './engine.ts';
export type FeedbackLabel={target:number;kind:'damage'|'heal';value:number;count:number;ability:boolean;x:number;y:number;width:number;height:number;anchorX:number;anchorY:number};
export type FeedbackBox={x:number;y:number;width:number;height:number};
export function healthBarAreas(fighters:Fighter[],point:(x:number,y:number)=>{x:number;y:number},size:number):FeedbackBox[]{const scale=Math.min(1.25,size/39);return fighters.filter(f=>f.hp>0).map(f=>{const p=point(f.x,f.y);return {x:p.x,y:p.y-65*scale,width:58*scale,height:28*scale};});}
/** Combine currently visible impacts by victim/channel, then place their totals without overlaps. */
export function crowdedFeedback(hits:Hit[],point:(x:number,y:number)=>{x:number;y:number},width:number,height:number,size:number,protectedAreas:FeedbackBox[]=[]){
 const grouped=new Map<string,{hits:Hit[];newest:Hit;age:number}>();
 for(const h of hits){const age=1-h.life/(h.duration??1);if(h.value<=0||h.life<=0||age<.34)continue;const key=`${h.target}:${h.kind==='heal'?'heal':'damage'}`,g=grouped.get(key);if(g){g.hits.push(h);if(age<g.age){g.newest=h;g.age=age;}}else grouped.set(key,{hits:[h],newest:h,age});}
 const labels:FeedbackLabel[]=[],minX=Math.max(40,point(0,0).x-size),maxX=Math.min(width-40,point(6.5,0).x+size);
 for(const g of [...grouped.values()].sort((a,b)=>a.newest.target-b.newest.target||Number(a.newest.kind==='heal')-Number(b.newest.kind==='heal'))){
  const h=g.newest,p=point(h.toX,h.toY),value=Math.round(g.hits.reduce((sum,h)=>sum+h.value,0)),w=Math.max(78,String(value).length*11+45),boxHeight=23;
  const desiredX=p.x+(h.kind==='heal'?26:-20),desiredY=p.y-size*.85;
  const candidates=[];for(let row=-9;row<=9;row++)for(const dx of [0,-55,55,-110,110,-165,165]){const x=Math.max(minX+w/2,Math.min(maxX-w/2,desiredX+dx)),y=Math.max(15,Math.min(height-15,desiredY+row*26));candidates.push({x,y,cost:(x-desiredX)**2+(y-desiredY)**2});}
  candidates.sort((a,b)=>a.cost-b.cost);const position=candidates.find(p=>[...labels,...protectedAreas].every(l=>Math.abs(p.x-l.x)>=(w+l.width)/2+4||Math.abs(p.y-l.y)>=(boxHeight+l.height)/2+4));
  if(!position)continue;labels.push({target:h.target,kind:h.kind==='heal'?'heal':'damage',value,count:g.hits.length,ability:g.hits.some(h=>!!h.ability),x:position.x,y:position.y,width:w,height:boxHeight,anchorX:p.x,anchorY:p.y});
 }
 return labels;
}
