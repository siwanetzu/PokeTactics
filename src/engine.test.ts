import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {fresh,buy,place,prepare,tick,synergies,merge,makeFighter,hexDistance,hexNeighbors,type Fighter} from './engine.ts';
test('purchases deduct gold and merge three identical units',()=>{const g=fresh();g.shop=[1,1,7,4,43];assert.equal(buy(g,0),'');assert.equal(buy(g,1),'');assert.equal(g.gold,16);assert.equal(g.units.filter(u=>u.species===1).length,1);assert.equal(g.units.find(u=>u.species===1)?.star,2);});
test('capacity and opponent area are enforced; swaps preserve units',()=>{const g=fresh();place(g,4,35,true);g.shop[0]=43;buy(g,0);assert.match(place(g,5,36,true),/full/);assert.match(place(g,1,0,true),/lower/);assert.equal(place(g,1,38,true),'');assert.equal(g.units.find(u=>u.uid===2)?.slot,31);});
test('synergies count distinct species',()=>{const g=fresh();g.units.push({...g.units[0],uid:99,slot:32});assert.equal(synergies(g.units).find(([t])=>t==='Grass')?.[1],1);});
test('combat resolves with damage and a surviving side',()=>{const fs=prepare(fresh());const hits:any[]=[];for(let i=0;i<2400&&fs.some(f=>f.team===0&&f.hp>0)&&fs.some(f=>f.team===1&&f.hp>0);i++)tick(fs,.05,hits,()=>.5);assert.ok(hits.length>0);assert.ok(!fs.some(f=>f.team===0&&f.hp>0)||!fs.some(f=>f.team===1&&f.hp>0));});
test('merge chains into three stars',()=>{const g=fresh();g.units=Array.from({length:9},(_,i)=>({uid:i,species:1,star:1,slot:i,board:false}));merge(g);assert.equal(g.units.length,1);assert.equal(g.units[0].star,3);});
test('every encounter resolves and final encounter can be beaten by an upgraded team',()=>{for(let round=1;round<=10;round++){const g=fresh();g.round=round;g.level=9;g.units=[95,143,3,9,6,94,25,43,147].map((species,i)=>({uid:i+1,species,star:2,slot:21+i,board:true}));const fs=prepare(g);const hits:any[]=[];let steps=0;while(fs.some(f=>f.team===0&&f.hp>0)&&fs.some(f=>f.team===1&&f.hp>0)&&steps++<1200)tick(fs,.05,hits,()=>.5);assert.ok(steps<1200,`Round ${round} timed out`);assert.ok(fs.some(f=>f.team===0&&f.hp>0),`Round ${round} was unwinnable`);}});
function fighter(uid:number,species:number,slot:number,team=0){return makeFighter({uid,species,slot,star:1,board:true},team);}
function assertExclusiveTiles(fs:Fighter[]){const occupied=new Map<number,number>();for(const f of fs.filter(f=>f.hp>0)){for(const tile of [f.slot,...(f.moveTo===null?[]:[f.moveTo])]){assert.ok(!occupied.has(tile),`Tile ${tile} shared by ${f.uid} and ${occupied.get(tile)}`);occupied.set(tile,f.uid);}if(f.moveTo!==null)assert.equal(hexDistance(f.slot,f.moveTo),1);}}
test('hex neighbors respect odd-row offsets and board boundaries',()=>{assert.deepEqual(hexNeighbors(0),[1,7]);assert.equal(hexNeighbors(17).length,6);for(let a=0;a<42;a++)for(const b of hexNeighbors(a)){assert.ok(b>=0&&b<42);assert.ok(hexNeighbors(b).includes(a));assert.equal(hexDistance(a,b),1);}});
test('pathfinding goes around a stationary teammate',()=>{const mover=fighter(1,52,28),blocker=fighter(2,25,21),enemy=fighter(3,52,0,1);tick([mover,blocker,enemy],.05,[],()=>.5);assert.equal(blocker.moveTo,null);assert.equal(mover.moveTo,29);assertExclusiveTiles([mover,blocker,enemy]);});
test('a moving Pokemon holds its origin and destination until arrival',()=>{const mover=fighter(1,52,28),enemy=fighter(2,52,0,1);const fs=[mover,enemy];tick(fs,.05,[],()=>.5);const origin=mover.slot,destination=mover.moveTo!;assert.notEqual(origin,destination);tick(fs,.2,[],()=>.5);assert.equal(mover.slot,origin);assert.equal(mover.moveTo,destination);assert.ok(mover.x!==Math.floor(origin%7)||mover.y!==Math.floor(origin/7)*.86);tick(fs,.3,[],()=>.5);assert.equal(mover.slot,destination);assert.equal(mover.moveTo,null);assertExclusiveTiles(fs);});
test('melee Pokemon attack adjacent tiles without entering the target tile',()=>{const ally=fighter(1,52,21),enemy=fighter(2,52,14,1);ally.cooldown=0;tick([ally,enemy],.01,[],()=>.5);tick([ally,enemy],.35,[],()=>.5);assert.ok(enemy.hp<enemy.maxHp);assert.equal(ally.slot,21);assert.equal(ally.moveTo,null);assertExclusiveTiles([ally,enemy]);});
test('all living Pokemon keep exclusive tiles and reservations throughout every encounter',()=>{for(let round=1;round<=10;round++){const g=fresh();g.round=round;g.level=9;g.units=[95,143,3,9,6,94,25,43,147].map((species,i)=>({uid:i+1,species,star:2,slot:21+i,board:true}));const fs=prepare(g);for(let step=0;step<1200;step++){assertExclusiveTiles(fs);tick(fs,.05,[],()=>.5);if(!fs.some(f=>f.team===0&&f.hp>0)||!fs.some(f=>f.team===1&&f.hp>0))break;}assertExclusiveTiles(fs);}});
test('two Pokemon competing for the same empty tile cannot both reserve it',()=>{
 const a=fighter(1,52,21),b=fighter(2,52,22),enemy=fighter(3,52,8,1);
 const blockers=Array.from({length:42},(_,i)=>i).filter(slot=>![21,22,8,15].includes(slot)).map((slot,i)=>fighter(10+i,52,slot));
 const fs=[a,b,enemy,...blockers];fs.forEach(f=>f.cooldown=999);
 tick(fs,.01,[],()=>.5);assert.equal(a.moveTo,15);assert.equal(b.moveTo,null);assertExclusiveTiles(fs);
});
test('a surrounded Pokemon waits until a neighboring tile is freed',()=>{
 const mover=fighter(1,52,28),blockers=[fighter(10,25,21),fighter(11,25,29),fighter(12,25,35)],enemy=fighter(2,52,0,1);
 // Each ally is midway through a valid adjacent step, retaining its source tile.
 blockers.forEach((f,i)=>{f.moveTo=[14,22,36][i];f.moveProgress=.2;});
 const fs=[mover,...blockers,enemy];tick(fs,.01,[],()=>.5);
 assert.equal(mover.moveTo,null);assertExclusiveTiles(fs);
 blockers[0].hp=0;tick(fs,.01,[],()=>.5);
 assert.equal(mover.moveTo,21);assertExclusiveTiles(fs);
});
test('signature skills apply real control, healing, poison, and shields',()=>{
 const cast=(id:number)=>{const a=fighter(1,id,21),b=fighter(2,143,14,1);a.hp=a.maxHp*.3;a.mana=120;a.cooldown=0;b.cooldown=99;const hits:any[]=[];tick([a,b],.01,hits,()=>.5);for(let frame=0;frame<38;frame++)tick([a,b],1/60,hits,()=>.5);return {a,b,hits};};
 const electric=cast(25);assert.ok(electric.b.statuses.some(s=>s.kind==='stun'));const hp=electric.a.hp;electric.b.cooldown=0;tick([electric.a,electric.b],.1,[],()=>.5);assert.equal(electric.a.hp,hp);
 const drain=cast(43);assert.ok(drain.a.hp>drain.a.maxHp*.3);assert.ok(drain.hits.some(h=>h.kind==='heal'));
 const venom=cast(23);assert.ok(venom.b.statuses.some(s=>s.kind==='poison'));const before=venom.b.hp;venom.a.cooldown=99;tick([venom.a,venom.b],.8,[],()=>.5);assert.ok(venom.b.hp<before);
 const tank=cast(143);assert.ok(tank.a.shield>0);const hpBefore=tank.a.hp;tank.b.cooldown=0;const shieldBefore=tank.a.shield;tick([tank.a,tank.b],1.3,[],()=>.5);tick([tank.a,tank.b],.35,[],()=>.5);assert.equal(tank.a.hp,hpBefore);assert.ok(tank.a.shield<shieldBefore);
});

test('damage and status effects land at impact rather than at the start of casting',()=>{
 const caster=fighter(1,25,21),target=fighter(2,143,14,1);caster.cooldown=0;caster.mana=100;target.cooldown=999;const hits:any[]=[];
 tick([caster,target],.01,hits,()=>.5);assert.ok(caster.strike);assert.equal(target.hp,target.maxHp);assert.equal(target.statuses.length,0);
 tick([caster,target],.5,hits,()=>.5);assert.equal(target.hp,target.maxHp);
 tick([caster,target],.12,hits,()=>.5);assert.ok(target.hp<target.maxHp);assert.ok(target.statuses.some(s=>s.kind==='stun'));assert.ok(hits[0].value>0);
});
test('launched projectiles resolve after their caster faints without reviving it',()=>{
 const caster=fighter(1,43,21),target=fighter(2,143,14,1);caster.cooldown=0;caster.mana=100;target.cooldown=999;const hits:any[]=[];
 tick([caster,target],.01,hits,()=>.5);caster.hp=0;tick([caster,target],.62,hits,()=>.5);
 assert.equal(caster.hp,0);assert.ok(target.hp<target.maxHp);assert.equal(caster.strike,null);
});
test('single-target, chain, and area signatures select different victims',()=>{
 const cast=(id:number)=>{const a=fighter(1,id,21),targets=[fighter(2,143,14,1),fighter(3,143,15,1),fighter(4,143,8,1)];a.cooldown=0;a.mana=120;targets.forEach(f=>f.cooldown=999);const hits:any[]=[];tick([a,...targets],.01,hits,()=>.5);tick([a,...targets],.62,hits,()=>.5);return hits.filter(h=>h.ability&&h.kind!=='heal');};
 assert.equal(cast(1).length,1);const chain=cast(25);assert.equal(chain.length,3);assert.ok(chain[0].value>chain[1].value&&chain[1].value>chain[2].value);assert.equal(cast(6).length,3);
});
