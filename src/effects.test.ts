import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {dex,makeFighter,tick,type Hit} from './engine.ts';
import {abilityEffects,renderAttackEffects} from './effects.ts';
test('every roster member has a distinct ability effect that renders at all animation phases',()=>{
 assert.equal(new Set(dex.map(s=>abilityEffects[s.id]?.shape)).size,dex.length);
 for(const s of dex)for(const life of [.95,.8,.6,.15]){
  const hit:Hit={attacker:1,target:2,species:s.id,primary:true,x:1,y:1,toX:2,toY:2,value:100,color:'#fff',life,ability:s.ability};
  const svg=renderAttackEffects([hit],(x,y)=>({x:x*60,y:y*60}),600,400,40);
  assert.ok(svg.includes('<svg'));assert.ok(!/NaN|undefined|Infinity/.test(svg),s.name);
 }
});
test('attack events identify the source and every victim without repeating the primary cast',()=>{
 const unit=(uid:number,species:number,slot:number,team:number)=>makeFighter({uid,species,slot,star:1,board:true},team);
 const caster=unit(1,25,21,0),target=unit(2,52,14,1),nearby=unit(3,52,15,1);caster.mana=75;caster.cooldown=0;
 target.cooldown=nearby.cooldown=99;const hits:Hit[]=[];tick([caster,target,nearby],.05,hits,()=>.5);
 assert.equal(hits.length,2);assert.equal(hits.filter(h=>h.primary).length,1);
 assert.ok(hits.every(h=>h.attacker===1&&h.species===25&&h.ability==='Thunderbolt'));
 assert.deepEqual(new Set(hits.map(h=>h.target)),new Set([2,3]));
});
