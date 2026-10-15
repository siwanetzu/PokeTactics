import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {makeFighter} from './engine.ts';
import {BattleSession} from './battle.ts';
import {stressRecord} from './stress.ts';
import {battleHighlights,highlightsHTML} from './highlights.ts';
test('seed-1 8v8 highlights agree with final combat totals for both teams',()=>{
 const record=stressRecord(1),session=new BattleSession(record);session.seek(60);const snapshot=JSON.stringify(session.fighters),highlights=battleHighlights(session.fighters,record.initial);
 assert.deepEqual(highlights.map(t=>t.leaders.map(r=>r.leader?.species)),[[6,3,143],[94,45,131]]);
 assert.deepEqual(highlights.map(t=>t.leaders.map(r=>Math.round(r.leader!.value))),[[8463,1236,5588],[5205,675,5728]]);
 for(const team of highlights){const tank=team.leaders[2].leader!;assert.equal(tank.value,tank.taken+tank.absorbed);}
 const html=highlightsHTML(session.fighters,record.initial,session.seconds,session.winner);assert.equal((html.match(/data-highlight-uid=/g)||[]).length,6);assert.match(html,/Opponent wins/);assert.match(html,/10.8s/);assert.equal(JSON.stringify(session.fighters),snapshot);assert.deepEqual(session.result(),record.result);
 session.seek(0);assert.ok(battleHighlights(session.fighters,record.initial).every(t=>t.leaders.every(r=>r.leader===null)));
});
test('tank uses actual absorption, retains knocked-out units, resolves ties and handles no contribution',()=>{
 const a=makeFighter({uid:1,species:143,star:1,slot:21,board:true},0),b=makeFighter({uid:2,species:6,star:1,slot:22,board:true},0);a.hp=a.maxHp=100;b.hp=b.maxHp=100;const initial=structuredClone([a,b]);
 a.hp=b.hp=0;a.absorbed=200;b.shielding=10000;a.damage=b.damage=50;const rows=battleHighlights([b,a],initial)[0].leaders;assert.equal(rows[0].leader?.uid,1);assert.equal(rows[1].leader,null);assert.equal(rows[2].leader?.uid,1);assert.equal(rows[2].leader?.value,300);
 const html=highlightsHTML([],[],0,-1);assert.equal((html.match(/disabled/g)||[]).length,6);assert.match(html,/No healing/);assert.doesNotMatch(html,/undefined|NaN/);
});
