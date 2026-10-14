import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {makeFighter,tick,type Hit} from './engine.ts';
import {SandboxLab,formationSlots} from './sandbox.ts';
function lethal(hp:number,shield=0){const a=makeFighter({uid:1,species:4,slot:21,star:1,board:true},0),b=makeFighter({uid:-1,species:52,slot:14,star:1,board:true},1);a.cooldown=b.cooldown=999;b.hp=hp;b.shield=shield;const hit:Hit={x:0,y:0,toX:0,toY:0,value:0,color:'#fff',life:1,attacker:1,target:-1,species:4,primary:true};a.strike={remaining:0,ability:false,victims:[{uid:-1,amount:100,hit}]};tick([a,b],1/60,[],()=>.5);return {a,b,hit};}
test('lethal strikes remove fractional HP and credit only health actually lost',()=>{for(const hp of [.1,.4,.8,1.2,99.7]){const {a,b,hit}=lethal(hp);assert.equal(b.hp,0,`remaining ${hp} HP`);assert.ok(Math.abs(a.damage-hp)<1e-9);assert.equal(hit.value,hp);}});
test('full absorption produces zero health damage, including fractional shields',()=>{for(const shield of [100,100.25,1000]){const {a,b,hit}=lethal(.4,shield);assert.equal(b.hp,.4);assert.equal(a.damage,0);assert.equal(hit.value,0);assert.equal(b.shield,shield-100);}});
test('health loss plus healing reconciles with enemy damage at every star level and orientation',()=>{
 for(const star of [1,2,3])for(const form of ['clump','spread'] as const)for(const reverse of [false,true])for(let seed=1;seed<=8;seed++){
  const lab=new SandboxLab();lab.config.teams=reverse?['Water','Fire']:['Fire','Water'];lab.config.star=star;lab.config.seed=seed;lab.config.slots=reverse?[formationSlots('spread',0),formationSlots(form,1)]:[formationSlots(form,0),formationSlots('spread',1)];const s=lab.start();const initial=[0,1].map(t=>s.fighters.filter(f=>f.team===t).reduce((sum,f)=>sum+f.hp,0));lab.finish();
  for(const f of s.fighters){assert.ok(f.hp>=0&&f.hp<=f.maxHp+1e-7);assert.ok(f.shield>=0);assert.ok(Number.isFinite(f.damage));}
  for(const team of [0,1]){const own=s.fighters.filter(f=>f.team===team),enemy=s.fighters.filter(f=>f.team!==team);const loss=initial[team]+own.reduce((sum,f)=>sum+f.healing,0)-own.reduce((sum,f)=>sum+f.hp,0);const damage=enemy.reduce((sum,f)=>sum+f.damage,0);assert.ok(Math.abs(loss-damage)<1e-5,`${star} stars, ${form}, seed ${seed}, team ${team}: ${loss} vs ${damage}`);}
 }
});

test('rotating a melee approach mirrors the chosen movement tile',()=>{
 const setup=(reverse:boolean)=>{const a=makeFighter({uid:reverse?-1:1,species:52,slot:reverse?3:38,star:1,board:true},reverse?1:0),b=makeFighter({uid:reverse?2:-2,species:143,slot:reverse?38:3,star:1,board:true},reverse?0:1);a.cooldown=b.cooldown=999;tick([a,b],.01,[],()=>.5);return a.moveTo;};const blue=setup(false),red=setup(true);assert.notEqual(blue,null);assert.equal(red,41-blue!);
});
test('equal-distance target preference is consistent after rotating the board and swapping sides',()=>{
 const setup=(reverse:boolean)=>{const a=makeFighter({uid:reverse?-1:1,species:25,slot:reverse?20:21,star:1,board:true},reverse?1:0);a.cooldown=0;const enemies=[14,15].map((slot,i)=>{const f=makeFighter({uid:(reverse?1:-1)*(i+2),species:143,slot:reverse?41-slot:slot,star:1,board:true},reverse?0:1);f.cooldown=999;return f;});tick([a,...enemies],.01,[],()=>.5);return Math.abs(a.strike!.victims[0].uid);};assert.equal(setup(false),setup(true));assert.equal(setup(false),2);
});
