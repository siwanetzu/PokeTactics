import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {makeFighter} from './engine.ts';
import {BattleSession} from './battle.ts';
import {stressRecord} from './stress.ts';
import {meterRows,meterValue} from './meter.ts';
test('meter ranks actual health damage and effective healing separately, retaining knocked-out carries',()=>{
 const a=makeFighter({uid:1,species:6,star:2,slot:21,board:true},0),b=makeFighter({uid:2,species:3,star:2,slot:22,board:true},0),enemy=makeFighter({uid:-1,species:26,star:2,slot:14,board:true},1);
 a.damage=900;a.healing=40;a.hp=0;b.damage=100;b.healing=600;enemy.damage=5000;a.absorbed=3000;
 const damage=meterRows([a,b,enemy],0,'damage'),healing=meterRows([a,b,enemy],0,'healing');assert.equal(damage[0].uid,1);assert.equal(damage[0].alive,false);assert.equal(damage[0].share,.9);assert.equal(damage[1].bar,1/9);assert.equal(healing[0].uid,2);assert.equal(healing[0].value,600);assert.equal(damage.reduce((n,r)=>n+r.value,0),1000);assert.equal(meterRows([a,b,enemy],1,'damage')[0].value,5000);
});
test('seed-1 8v8 meter matches every fighter and report total, including replay resets and seeking',()=>{
 const record=stressRecord(1),session=new BattleSession(record);session.seek(60);
 for(const metric of ['damage','healing'] as const)for(const team of [0,1]){const rows=meterRows(session.fighters,team,metric),members=session.fighters.filter(f=>f.team===team);assert.equal(rows.length,8);assert.equal(rows.reduce((n,r)=>n+r.value,0),members.reduce((n,f)=>n+f[metric],0));assert.ok(rows.every((r,i)=>!i||r.value<=rows[i-1].value));for(const row of rows)assert.equal(row.value,members.find(f=>f.uid===row.uid)![metric]);}
 assert.deepEqual(session.result(),record.result);session.seek(0);for(const metric of ['damage','healing'] as const)assert.ok(meterRows(session.fighters,0,metric).every(r=>r.value===0&&r.share===0&&r.bar===0));session.seek(5);const snapshot=JSON.stringify(meterRows(session.fighters,0,'damage'));session.seek(0);session.seek(5);assert.equal(JSON.stringify(meterRows(session.fighters,0,'damage')),snapshot);
});

test('damage taken includes incoming heals and own regeneration, excluding outgoing heals and shields',()=>{
 const tank=makeFighter({uid:1,species:143,star:1,slot:21,board:true},0),support=makeFighter({uid:2,species:43,star:1,slot:22,board:true},0);
 tank.maxHp=100;tank.hp=80;const initial=structuredClone([tank,support]);tank.hp=40;tank.healing=30;tank.healingTargets={2:20};support.healing=70;support.healingTargets={1:50,2:20};tank.absorbed=200;
 assert.equal(meterValue(tank,[tank,support],'taken',initial),100);tank.hp+=10;support.healing+=10;support.healingTargets[1]+=10;assert.equal(meterValue(tank,[tank,support],'taken',initial),100);
 tank.shielding=400;tank.shield=110;assert.equal(meterValue(tank,[tank,support],'shielding',initial),400);
});
test('taken totals conserve opposing damage throughout seeded 8v8 fights and shielding resets to opening grants',()=>{
 for(const seed of [1,7,42]){const record=stressRecord(seed),session=new BattleSession(record),previous=new Map<number,number>();while(!session.done){session.step();if(session.steps%6)continue;
 for(const team of [0,1]){const rows=meterRows(session.fighters,team,'taken',record.initial),received=rows.reduce((n,r)=>n+r.value,0),dealt=session.fighters.filter(f=>f.team!==team).reduce((n,f)=>n+f.damage,0);assert.ok(Math.abs(received-dealt)<1e-7,`damage conservation seed ${seed}`);for(const row of rows){assert.ok(row.value+1e-7>=(previous.get(row.uid)??0));previous.set(row.uid,row.value);}
 const shields=meterRows(session.fighters,team,'shielding',record.initial);assert.equal(shields.reduce((n,r)=>n+r.value,0),session.fighters.filter(f=>f.team===team).reduce((n,f)=>n+f.shielding,0));}}
 assert.deepEqual(session.result(),record.result);session.seek(0);for(const team of [0,1]){assert.ok(meterRows(session.fighters,team,'taken',record.initial).every(r=>r.value===0));assert.equal(meterRows(session.fighters,team,'shielding',record.initial).reduce((n,r)=>n+r.value,0),record.initial.filter(f=>f.team===team).reduce((n,f)=>n+f.shielding,0));}}
});
