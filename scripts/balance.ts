import {writeFileSync,mkdirSync} from 'node:fs';
import {RULESET} from '../src/battle.ts';
import {applyTeamTraits,makeFighter,species} from '../src/engine.ts';
import {BattleSession,makeRecord} from '../src/battle.ts';
import {sandboxTeams,sandboxFormations} from '../src/sandbox.ts';
export const teams=sandboxTeams;
export const formations=sandboxFormations;
export function match(a,b,fa='screen',fb='screen',seed=1,reverse=false,star=1){
 const build=(name,form,team)=>teams[name].map((id,i)=>makeFighter({uid:(team?-1:1)*(i+1),species:id,star,slot:team?41-formations[form][i]:formations[form][i],board:true},team));
 const fs=applyTeamTraits([...build(reverse?b:a,reverse?fb:fa,0),...build(reverse?a:b,reverse?fa:fb,1)]);
 const s=new BattleSession(makeRecord(fs,seed,1));s.seek(60);return {score:s.winner<0?.5:s.winner===(reverse?1:0)?1:0,seconds:s.seconds};
}
export function rate(a,b,fa='screen',fb='screen',n=24,star=1){let sum=0;for(let i=1;i<=n;i++)for(const reverse of [false,true])sum+=match(a,b,fa,fb,i,reverse,star).score;return Math.round(sum/(n*2)*100);}
if(process.argv[1]?.endsWith('balance.ts')){
 const names=Object.keys(teams),forms=Object.keys(formations),n=24;
 const matrix={};let battles=0;
 for(const a of names){matrix[a]={};for(const b of names){if(a===b){matrix[a][b]='—';continue;}let sum=0;for(const fa of forms)for(const fb of forms){sum+=rate(a,b,fa,fb,n);battles+=n*2;}matrix[a][b]=Math.round(sum/16);}}
 const overall=Object.fromEntries(names.map(a=>[a,Math.round(names.filter(b=>b!==a).reduce((sum,b)=>sum+matrix[a][b],0)/3)]));
 const positioning={screen:rate('Electric','Water','screen','spread',32),spread:rate('Electric','Water','spread','spread',32)};
 const report={ruleset:RULESET,seedRange:[1,n],stars:1,squadSize:4,gold:8,teams:Object.fromEntries(names.map(a=>[a,teams[a].map(id=>species(id).name)])),formations,method:'Four formations on each side, swapped board sides, seeded fixed-step engine; draws score half. Representative squads, not every possible roster.',matrix,overall,positioning, matrixBattles:battles};
 mkdirSync('artifacts',{recursive:true});writeFileSync('artifacts/balance-report.json',JSON.stringify(report,null,2)+'\n');
 console.log(`${RULESET} · ${battles} seeded fights · 8-gold, 4-unit, one-star squads · both board sides · four formations each`);
 console.table(matrix);console.log('Average matchup score (%)',overall);console.log('Electric vs spread Water, same squad and 32 seeds per side:',positioning);
 console.log('Saved artifacts/balance-report.json');
}
