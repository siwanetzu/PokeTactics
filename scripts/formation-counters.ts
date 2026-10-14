import {writeFileSync,mkdirSync} from 'node:fs';
import {strict as assert} from 'node:assert';
import {BattleSession,makeRecord,RULESET} from '../src/battle.ts';
import {sandboxFighters} from '../src/sandbox.ts';
mkdirSync('artifacts',{recursive:true});
const sustain={protected:[24,25,38,32],triangle:[24,31,38,32],rightSupport:[26,33,38,32],rearLeft:[30,37,40,36]};
const shield={protected:[24,25,38,32],staggered:[23,25,37,32],compact:[24,25,31,32],split:[21,27,35,40],leftScreen:[22,23,35,29],rightScreen:[26,25,40,32]};
const results=[];let fights=0;
for(const [blueName,a] of Object.entries(sustain))for(const [redName,b] of Object.entries(shield)){
 let wins=0,draws=0,time=0,heal=0,blocked=0,growLife=0;const sideScores=[0,0];
 for(let seed=1;seed<=100;seed++)for(const reverse of [false,true]){
 const config={teams:reverse?['Electric/Water Shield','Fire/Grass Sustain']:['Fire/Grass Sustain','Electric/Water Shield'],slots:reverse?[b,a.map(x=>41-x)]:[a,b.map(x=>41-x)],seed,star:1};const team=reverse?1:0,s=new BattleSession(makeRecord(sandboxFighters(config),seed,1));let death=null;
 while(!s.done){s.step();if(death===null&&s.fighters.find(f=>f.team===team&&f.species===58).hp<=0)death=s.seconds;}
 const score=s.winner<0?.5:s.winner===team?1:0;wins+=s.winner===team?1:0;draws+=s.winner<0?1:0;sideScores[reverse?1:0]+=score;time+=s.seconds;growLife+=death??s.seconds;const members=s.fighters.filter(f=>f.team===team);heal+=members.reduce((n,f)=>n+f.healing,0);blocked+=members.reduce((n,f)=>n+(f.absorbed??0),0);fights++;
 const again=new BattleSession(s.record);again.seek(60);assert.deepEqual(again.result(),s.result());
 }
 results.push({sustain:blueName,shield:redName,wins,draws,score:(wins+draws*.5)/2,onBlue:sideScores[0],onRed:sideScores[1],seconds:time/200,healing:heal/200,blocked:blocked/200,growlitheSurvival:growLife/200});
}
const report={ruleset:RULESET,fights,method:'Seeds 1–100; one star, 8 gold each. Four Sustain formations versus six Shield formations, both board sides. Every replay independently verified; draws count half.',sustain,shield,results};writeFileSync('artifacts/formation-counters.json',JSON.stringify(report,null,2));console.table(results.map(r=>({sustain:r.sustain,shield:r.shield,score:r.score,growSurvival:+r.growlitheSurvival.toFixed(2),healing:Math.round(r.healing)})));
