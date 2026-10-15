import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {makeFighter} from './engine.ts';
import {BattleSession} from './battle.ts';
import {stressRecord} from './stress.ts';
import {meterRows} from './meter.ts';
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
