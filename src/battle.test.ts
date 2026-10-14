import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {fresh,prepare} from './engine.ts';
import {BattleSession,makeRecord,validateRecord,battleChecksum,seededRandom} from './battle.ts';
const record=()=>makeRecord(prepare(fresh()),123456,1);
test('identical inputs and seed reproduce the full battle at different frame rates and speeds',()=>{
 const results=[];for(const chunk of [1/120,1/60,1/30,.1,.3]){const s=new BattleSession(record());for(let n=0;n<10000&&!s.done;n++)s.advance(chunk);assert.ok(s.done);results.push(s.result());}
 for(const result of results)assert.deepEqual(result,results[0]);
});
test('replay remains identical after JSON storage, seeking, and restarting',()=>{
 const original=new BattleSession(record());original.advance(3);const mid=battleChecksum(original.fighters);const replay=new BattleSession(JSON.parse(JSON.stringify(original.record)));replay.seek(3);assert.equal(battleChecksum(replay.fighters),mid);replay.seek(0);replay.advance(3);assert.equal(battleChecksum(replay.fighters),mid);
 while(!original.done)original.step();replay.seek(60);assert.deepEqual(replay.result(),original.result());
});
test('playback does not mutate the saved battle input or adventure',()=>{const g=fresh(),snapshot=JSON.stringify(g),r=makeRecord(prepare(g),15,1),input=JSON.stringify(r);const s=new BattleSession(r);s.seek(60);assert.equal(JSON.stringify(r),input);assert.equal(JSON.stringify(g),snapshot);});
test('different seeds change combat while equal seeds produce identical random streams',()=>{const a=seededRandom(10),b=seededRandom(10);for(let i=0;i<100;i++)assert.equal(a(),b());const r=record(),s1=new BattleSession(r),s2=new BattleSession({...r,seed:987});s1.seek(60);s2.seek(60);assert.notEqual(s1.result().checksum,s2.result().checksum);});
test('malformed and incompatible replay records are rejected',()=>{assert.equal(validateRecord({...record(),ruleset:'old'}),false);const broken=record();broken.initial[1].slot=broken.initial[0].slot;assert.equal(validateRecord(broken),false);assert.throws(()=>new BattleSession(broken));});
test('seeking to the exact recorded ending tick verifies the replay',()=>{const s=new BattleSession(record());while(!s.done)s.step();const result=s.result();const replay=new BattleSession(record());replay.seek(s.seconds);assert.equal(replay.done,true);assert.deepEqual(replay.result(),result);});
