import {writeFileSync,mkdirSync} from 'node:fs';
import {strict as assert} from 'node:assert';
import {freshMatch,planRival,claimDraft,resolveLobbyRound,advanceLobbyRound,type Rival} from '../src/lobby.ts';
import {prepare,dex,poolSize,sell} from '../src/engine.ts';
import {BattleSession,makeRecord,RULESET} from '../src/battle.ts';
mkdirSync('artifacts',{recursive:true});
const results=[];
for(let seed=1;seed<=20;seed++){
 const g=freshMatch(seed);Object.assign(g,{id:0,name:'You',preferred:seed%2?['Grass','Fire']:['Electric','Water'],lastOpponent:null});let fights=0,drafts=0;const rounds=[];
 while(!g.lobby.placement&&g.round<=80){
  if(g.lobby.roundKind==='draft'){const first=g.lobby.draftOffers.findIndex(Boolean);if(!claimDraft(g,first)){const spare=g.units.find(u=>!u.board);assert.ok(spare);sell(g,spare.uid);assert.ok(claimDraft(g,first));}drafts++;advanceLobbyRound(g);continue;}
  planRival(g,g as Rival);
  const holders=[g,...g.lobby.rivals.filter(p=>p.health>0)];for(const s of dex){const held=holders.flatMap(p=>p.units).filter(u=>u.species===s.id).reduce((n,u)=>n+3**(u.star-1),0)+holders.flatMap(p=>p.shop).filter(id=>id===s.id).length;assert.ok(held<=poolSize(s.id),`${s.name} pool overdrawn: ${held}`);}
  for(const p of holders){assert.ok(p.gold>=0);assert.ok(p.units.every(u=>(u.items?.length??0)<=3));assert.ok(p.units.filter(u=>u.board).length<=p.level);assert.equal(new Set(p.units.filter(u=>u.board).map(u=>u.slot)).size,p.units.filter(u=>u.board).length);}
  const session=new BattleSession(makeRecord(prepare(g),seed*100+g.round,g.round,g.level));session.seek(60);assert.ok(session.done);const replay=new BattleSession(session.record);replay.seek(60);assert.deepEqual(replay.result(),session.result());
  const outcome=resolveLobbyRound(g,session);fights++;rounds.push({round:g.round,kind:g.lobby.roundKind,opponent:g.lobby.opponent,winner:session.winner,health:g.health,alive:holders.filter(p=>p.health>0).length,income:outcome.income});
  if(!outcome.complete)advanceLobbyRound(g);
 }
 results.push({seed,round:g.round,placement:g.lobby.placement,health:g.health,fights,drafts,rounds});
}
writeFileSync('artifacts/lobby-audit.json',JSON.stringify({ruleset:RULESET,method:'Twenty complete equipped eight-trainer matches. Human uses a simple legal purchasing policy, real shared pool, paid XP/rerolls, drafts and health elimination. Every human replay independently checked; all pool, gold, board cap and tile invariants checked each round.',results},null,2));console.table(results.map(({rounds,...r})=>r));
