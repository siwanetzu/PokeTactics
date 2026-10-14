import {item} from './items.ts';
import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {freshMatch,prepareLobbyRound,pairingsFor,resolveLobbyRound,advanceLobbyRound,claimDraft,stageLabel,roundKind} from './lobby.ts';
import {remainingCopies,prepare,poolSize,type Unit} from './engine.ts';
import {BattleSession,makeRecord} from './battle.ts';

test('new matches contain seven persistent opponents and equal starting equipment',()=>{
 const a=freshMatch(1),b=freshMatch(1);assert.deepEqual(a,b);assert.equal(a.lobby!.rivals.length,7);assert.equal(a.inventory!.length,3);assert.ok(a.lobby!.rivals.every(p=>(p.inventory?.length??0)+p.units.reduce((n,u)=>n+(u.items??[]).reduce((total,id)=>total+(item(id)?.parts?2:1),0),0)===3));assert.ok(a.lobby!.rivals.every(p=>p.units.length>0&&p.gold>=0&&p.units.filter(u=>u.board).length<=p.level));
});
test('stage structure contains warmups, shared drafts, neutral rounds and PvP',()=>{
 assert.deepEqual([1,2,3,4,7,10,11,14,17].map(roundKind),['neutral','neutral','neutral','pvp','draft','neutral','pvp','draft','neutral']);assert.equal(stageLabel(4),'2-1');assert.equal(stageLabel(7),'2-4');assert.equal(stageLabel(11),'3-1');
});
test('round-robin matching visits all opponents before repeating despite non-PvP rounds',()=>{
 const g=freshMatch(2),opponents:number[]=[];for(let round=4;round<15;round++){if(roundKind(round)!=='pvp')continue;g.round=round;prepareLobbyRound(g);opponents.push(g.lobby!.opponent);}
 assert.equal(new Set(opponents.slice(0,7)).size,7);assert.ok(!opponents.includes(0));
});
test('odd-sized lobbies give one ghost fight without duplicating real participants',()=>{
 for(let round=1;round<=3;round++){const pairs=pairingsFor([0,2,5],round),real=pairs.flatMap(p=>p.ghost?[p.a]:[p.a,p.b]);assert.equal(pairs.filter(p=>p.ghost).length,1);assert.deepEqual(real.sort((a,b)=>a-b),[0,2,5]);assert.ok(pairs.every(p=>p.a!==p.b));}
});
test('rival units and shop offers contest copies and elimination releases them',()=>{
 const g=freshMatch(3),bot=g.lobby!.rivals[0];const before=remainingCopies(g,131);bot.units.push({uid:99,species:131,star:2,slot:8,board:false});assert.equal(remainingCopies(g,131),before-3);bot.shop=[131];assert.equal(remainingCopies(g,131),before-4);bot.health=0;assert.equal(remainingCopies(g,131),before);
});
test('lower-health bots draft before the player and claiming is atomic and saved',()=>{
 const g=freshMatch(4);g.round=7;g.health=50;g.lobby!.rivals[0].health=20;prepareLobbyRound(g);assert.deepEqual(g.lobby!.draftOrder.slice(0,2),[1,0]);assert.equal(g.lobby!.draftCursor,1);assert.equal(g.lobby!.draftOffers.filter(Boolean).length,7);
 const loaded=JSON.parse(JSON.stringify(g)),index=loaded.lobby.draftOffers.findIndex(Boolean),id=loaded.lobby.draftOffers[index];assert.ok(claimDraft(loaded,index));assert.ok(loaded.units.some((u:Unit)=>u.species===id));assert.equal(claimDraft(loaded,index),false);assert.equal(loaded.lobby.draftOffers.length,0);advanceLobbyRound(loaded);assert.equal(loaded.round,8);
});
test('trainer damage and elimination settle once and return opponent stock',()=>{
 const g=freshMatch(5);g.round=4;g.level=9;g.units=[95,143,3,9,6,94,25,43,147].map((species,i)=>({uid:i+1,species,star:3,slot:21+i,board:true}));prepareLobbyRound(g);const rival=g.lobby!.rivals.find(p=>p.id===g.lobby!.opponent)!;rival.health=1;
 const s=new BattleSession(makeRecord(prepare(g),1,4));s.seek(60);assert.equal(s.winner,0);const result=resolveLobbyRound(g,s);assert.equal(rival.health,0);assert.ok(rival.placement);assert.equal(rival.units.length,0);assert.equal(rival.shop.length,0);assert.equal(result.loss,0);const snapshot=JSON.stringify(g);resolveLobbyRound(g,s);assert.equal(JSON.stringify(g),snapshot);
});
test('the last surviving trainer wins rather than ending at round ten',()=>{
 const g=freshMatch(6);g.round=11;g.level=9;g.units=[95,143,3,9,6,94,25,43,147].map((species,i)=>({uid:i+1,species,star:3,slot:21+i,board:true}));g.lobby!.rivals.slice(1).forEach((p,i)=>{p.health=0;p.placement=8-i;p.units=[];p.shop=[];});g.lobby!.rivals[0].health=1;prepareLobbyRound(g);
 const s=new BattleSession(makeRecord(prepare(g),1,11));s.seek(60);assert.equal(s.winner,0);assert.ok(resolveLobbyRound(g,s).complete);assert.equal(g.lobby!.placement,1);assert.equal(advanceLobbyRound(g),'complete');
});
