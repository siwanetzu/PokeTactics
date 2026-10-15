import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {stressRecord} from './stress.ts';
import {BattleSession} from './battle.ts';
import {crowdedFeedback,healthBarAreas,type FeedbackBox} from './feedback.ts';
const point=(x:number,y:number)=>({x:425+x*68,y:140+y*68}),size=39;
const overlaps=(a:FeedbackBox,b:FeedbackBox)=>Math.abs(a.x-b.x)<(a.width+b.width)/2&&Math.abs(a.y-b.y)<(a.height+b.height)/2;
test('crowded feedback preserves every visible damage/heal total and avoids labels and live health bars',()=>{
 for(const seed of [1,7,42]){const record=stressRecord(seed),session=new BattleSession(record);assert.equal(record.initial.length,16);assert.ok(record.initial.every(f=>f.star===2&&f.items?.length===2));let sampled=0;
 while(!session.done){session.step();if(session.steps%6)continue;const protectedAreas=healthBarAreas(session.fighters,point,size),labels=crowdedFeedback(session.hits,point,1280,500,size,protectedAreas);
 const eligible=session.hits.filter(h=>h.value>0&&h.life>0&&1-h.life/(h.duration??1)>=.34);const targets=new Set(eligible.map(h=>`${h.target}:${h.kind==='heal'?'heal':'damage'}`));
 assert.equal(labels.length,targets.size,`missing target feedback at seed ${seed}, tick ${session.steps}`);assert.equal(labels.reduce((n,l)=>n+l.value,0),eligible.reduce((n,h)=>n+Math.round(h.value),0));assert.equal(labels.reduce((n,l)=>n+l.count,0),eligible.length);
 for(let i=0;i<labels.length;i++){assert.ok(protectedAreas.every(box=>!overlaps(labels[i],box)),'label hides a health bar');for(let j=i+1;j<labels.length;j++)assert.ok(!overlaps(labels[i],labels[j]),'labels overlap');}sampled++;}
 assert.ok(sampled>50);assert.deepEqual(session.result(),record.result);}
});

test('health protection follows the capped sprite scale on full-HD boards',()=>{
 const f=stressRecord().initial[0],area=healthBarAreas([f],()=>({x:500,y:250}),54)[0];
 const manaBottom=250-58.5*1.25;assert.ok(area.y+area.height/2>=manaBottom);assert.ok(area.x-area.width/2<=500-23*1.25);
});
