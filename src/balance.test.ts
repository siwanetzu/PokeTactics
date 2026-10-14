import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {makeFighter,tick,species,type Fighter,type Hit} from './engine.ts';
import {rate,match,teams,formations} from '../scripts/balance.ts';
const unit=(uid:number,id:number,team=0)=>{const f=makeFighter({uid,species:id,slot:team?14:21,star:1,board:true},team);f.cooldown=999;return f;};
function impact(source:Fighter,target:Fighter,ability=true){const hit:Hit={x:0,y:0,toX:0,toY:0,value:0,color:'#fff',life:1,attacker:source.uid,target:target.uid,species:source.species,primary:true};source.strike={remaining:0,ability,victims:[{uid:target.uid,amount:100,hit}]};tick([source,target],.01,[hit],()=>.5);return hit;}
test('Electric shield pressure removes extra shield without multiplying health damage',()=>{
 const a=unit(1,25),b=unit(-1,52,1);a.bonuses.Electric=2;b.shield=1000;impact(a,b);assert.ok(Math.abs(b.shield-850)<1e-9);assert.equal(b.hp,b.maxHp);
 b.shield=33;const before=b.hp;impact(a,b);assert.equal(before-b.hp,78);
});
test('Water burn resistance also applies when a burn consumes a shield',()=>{
 const b=unit(-1,7,1);b.bonuses.Water=2;b.shield=30;b.statuses=[{kind:'burn',time:2,pulse:0,source:1,power:100}];const hp=b.hp;tick([b],.01,[],()=>.5);assert.equal(b.shield,0);assert.equal(hp-b.hp,25);
});
test('Grass reduces spell impact and control, while Fire burns suppress its healing',()=>{
 const a=unit(1,25),b=unit(-1,43,1);b.bonuses.Grass=2;const hit=impact(a,b);assert.equal(hit.value,65);assert.ok(b.statuses.find(s=>s.kind==='stun')!.time<.27);
 const fire=unit(2,4);fire.bonuses.Fire=2;impact(fire,b);assert.equal(b.statuses.find(s=>s.kind==='burn')!.healingCut,.6);
});
test('Water shielded damage bonus ends when its shield breaks',()=>{
 const trial=(shield:number)=>{const a=unit(1,7),b=unit(-1,52,1);a.bonuses.Water=2;a.shield=shield;a.cooldown=0;tick([a,b],.01,[],()=>.5);return a.strike!.victims[0].amount;};assert.equal(trial(100),48);assert.equal(trial(0),42);
});
test('equal-cost archetypes retain soft counters across formations and both board sides',()=>{
 for(const lineup of Object.values(teams))assert.equal(lineup.reduce((sum,id)=>sum+species(id).cost,0),8);
 for(const [a,b] of [['Fire','Grass'],['Water','Fire'],['Electric','Water'],['Grass','Electric']]){const values=Object.keys(formations).flatMap(fa=>Object.keys(formations).map(fb=>rate(a,b,fa,fb,32)));const mean=values.reduce((sum,n)=>sum+n,0)/values.length;assert.ok(mean>=55&&mean<=85,`${a} vs ${b}: ${mean}%`);}
});
test('repositioning an unchanged Fire lineup materially changes its Water matchup',()=>{assert.ok(rate('Fire','Water','clump','spread',32)<5);assert.ok(rate('Fire','Water','spread','spread',32)>10);});

test('spread Fire/Water outcomes remain similar on opposite board sides',()=>{const scores=[false,true].map(reverse=>{let sum=0;for(let seed=1;seed<=128;seed++)sum+=match('Fire','Water','spread','spread',seed,reverse).score;return sum/128;});assert.ok(Math.abs(scores[0]-scores[1])<.15,`blue ${scores[0]}, red ${scores[1]}`);});
