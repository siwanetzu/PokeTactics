import {roll,type Game} from './engine.ts';
export const xpThresholds=[0,2,2,6,10,20,36,48,72,84];
export function xpToNext(level:number){return xpThresholds[level]??84;}
export function levelUpGame(g:Game){while(g.level<9&&g.xp>=xpToNext(g.level)){g.xp-=xpToNext(g.level);g.level++;}}
export function streakBonus(streak:number){const n=Math.abs(streak);return n>=6?3:n>=5?2:n>=3?1:0;}
export function interestGold(gold:number){return Math.min(5,Math.max(0,Math.floor(gold/10)));}
export function payRound(g:Game,won:boolean|null,loss:number){
 if(won!==null){g.wins+=won?1:0;g.streak=won?Math.max(1,g.streak+1):Math.min(-1,g.streak-1);}
 const base=5,interest=interestGold(g.gold),streak=streakBonus(g.streak),victory=won===true?1:0,income=base+interest+streak+victory;
 g.gold+=income;g.health=Math.max(0,g.health-loss);g.xp+=2;levelUpGame(g);
 return {income,loss,base,interest,streak,victory,neutral:0,complete:g.health<=0};
}
export function settleRound(g:Game,won:boolean){return {...payRound(g,won,won?0:8+g.round*2),complete:g.health<=0||g.round===10};}
export function advanceRound(g:Game){if(g.health<=0||g.round===10)return 'complete';g.round++;if(!g.locked)roll(g);return 'ready';}
