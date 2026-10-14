import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {strict as assert} from 'node:assert';
import {BattleSession,makeRecord,RULESET} from '../src/battle.ts';
import {sandboxTeams,sandboxFormations,sandboxFighters,formationSlots} from '../src/sandbox.ts';
mkdirSync('artifacts',{recursive:true});
const names=Object.keys(sandboxTeams),forms=Object.keys(sandboxFormations);let count=0,maxBudgetError=0,draws=0;
function fight(a,b,fa,fb,seed,reverse=false,star=1,details=false){
 const config={teams:reverse?[b,a]:[a,b],slots:reverse?[formationSlots(fb,0),formationSlots(fa,1)]:[formationSlots(fa,0),formationSlots(fb,1)],seed,star};
 const initial=sandboxFighters(config),session=new BattleSession(makeRecord(initial,seed,1));
 const starting=[0,1].map(t=>initial.filter(f=>f.team===t).reduce((sum,f)=>sum+f.hp,0));const categories=[{basic:0,ability:0,dot:0},{basic:0,ability:0,dot:0}],seen=new WeakSet();
 if(details){while(!session.done){session.step();for(const hit of session.hits){if(hit.value<=0||hit.kind==='heal'||hit.kind==='shield'||seen.has(hit))continue;seen.add(hit);const source=session.fighters.find(f=>f.uid===hit.attacker);if(source)categories[source.team][hit.ability?'ability':hit.duration===.7?'dot':'basic']+=hit.value;}}}else session.seek(60);
 count++;if(session.winner<0)draws++;
 const summaries=[0,1].map(team=>{const fs=session.fighters.filter(f=>f.team===team);return {team:config.teams[team],hp:fs.reduce((sum,f)=>sum+f.hp,0),alive:fs.filter(f=>f.hp>0).length,damage:fs.reduce((sum,f)=>sum+f.damage,0),healing:fs.reduce((sum,f)=>sum+f.healing,0),shieldingGenerated:fs.reduce((sum,f)=>sum+f.shielding,0),roundedHitBreakdown:categories[team]};});
 for(const f of session.fighters){assert.ok(Number.isFinite(f.hp)&&f.hp>=0&&f.hp<=f.maxHp+1e-7,'invalid HP');assert.ok(Number.isFinite(f.shield)&&f.shield>=0,'invalid shield');assert.ok(Number.isFinite(f.damage)&&f.damage>=0,'invalid damage');}
 for(const team of [0,1]){const expected=starting[team]+summaries[team].healing-summaries[team].hp,error=Math.abs(expected-summaries[1-team].damage);maxBudgetError=Math.max(maxBudgetError,error);assert.ok(error<1e-5,`damage accounting: ${a}/${b} ${seed} ${error}`);}
 return {score:session.winner<0?.5:session.winner===(reverse?1:0)?1:0,winner:session.winner<0?'Draw':config.teams[session.winner],seconds:session.seconds,result:session.result(),summaries};
}
const matrices={},averages={};
for(const star of [1,2,3]){
 const matrix=Object.fromEntries(names.map(a=>[a,Object.fromEntries(names.map(b=>[b,a===b?null:0]))]));
 for(let ai=0;ai<names.length;ai++)for(let bi=ai+1;bi<names.length;bi++){const a=names[ai],b=names[bi];let score=0,n=0;for(const fa of forms)for(const fb of forms)for(let seed=1;seed<=32;seed++)for(const reverse of [false,true]){score+=fight(a,b,fa,fb,seed,reverse,star).score;n++;}matrix[a][b]=Math.round(score/n*1000)/10;matrix[b][a]=Math.round((1-score/n)*1000)/10;}
 matrices[star]=matrix;averages[star]=Object.fromEntries(names.map(a=>[a,Math.round(names.filter(b=>b!==a).reduce((sum,b)=>sum+matrix[a][b],0)/3*10)/10]));console.log(`${star} stars average score`,averages[star]);
}
const target=process.argv.includes('--grass')?'Grass':'Fire',opponent=target==='Grass'?'Fire':'Water';
const focused=[];
for(const star of [1,2,3])for(const form of ['clump','spread']){let wins=0,n=0,totalTime=0,blue=0,red=0;for(let seed=1;seed<=128;seed++)for(const reverse of [false,true]){const result=fight(target,opponent,form,'spread',seed,reverse,star);wins+=result.score;reverse?red+=result.score:blue+=result.score;totalTime+=result.seconds;n++;}focused.push({star,team:target,opponent,formation:form,opponentFormation:'spread',seeds:128,battles:n,winScore:Math.round(wins/n*1000)/10,onBlue:Math.round(blue/128*1000)/10,onRed:Math.round(red/128*1000)/10,averageSeconds:Math.round(totalTime/n*100)/100});}
const examples=['clump','spread'].map(form=>({form,seed:1,...fight(target,'Water',form,'spread',1,false,1,true)}));
const report={ruleset:RULESET,totalBattles:count,draws,maxDamageAccountingError:maxBudgetError,method:'32 seeds × six unordered matchups × sixteen formation pairs × two board orientations × three equal star levels; the focused selected matchup uses 128 seeds per formation, side and star level. Four units/eight gold per team. Damage accounting uses exact HP; category breakdown uses displayed hit values (DOT values round).',matrices,averages,focused,examples};const out=target==='Grass'?'artifacts/grass-after-audit.json':'artifacts/damage-audit.json';writeFileSync(out,JSON.stringify(report,null,2)+'\n');if(target==='Grass'){const before=JSON.parse(readFileSync('artifacts/grass-before-audit.json','utf8'));console.log('Grass before/after average:',before.averages[1].Grass,report.averages[1].Grass);assert.ok(report.averages[1].Grass>before.averages[1].Grass+3);assert.ok(report.matrices[1].Fire.Grass>=55);}console.table(focused);console.log('Audit:',{count,draws,maxBudgetError});console.log('Seed 1 examples:',examples.map(e=>({form:e.form,winner:e.winner,seconds:e.seconds,remainingHP:e.summaries.map(s=>Math.round(s.hp)),damage:e.summaries.map(s=>Math.round(s.damage))})));console.log('Saved',out);
