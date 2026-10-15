import {applyTeamTraits,makeFighter} from './engine.ts';
import {BattleSession,makeRecord} from './battle.ts';
/** Reproducible crowded combat fixture; never changes the adventure or combat rules. */
export function stressRecord(seed=1){
 const rosters=[[143,9,58,3,6,25,43,81],[95,131,59,45,26,94,7,1]];
 const positions=[23,24,25,30,37,39,38,32];
 const equipment=[['focusBand','mysticWater'],['focusBand','mysticWater'],['leftovers','guard'],['miracleSeed','mana'],['choiceSpecs','mana'],['quickClaw','mana'],['miracleSeed','mana'],['mysticWater','mana']];
 const fighters=rosters.flatMap((roster,team)=>roster.map((species,i)=>makeFighter({uid:(team?-1:1)*(i+1),species,star:2,slot:team?41-positions[i]:positions[i],board:true,items:[...equipment[i]]},team)));
 const record=makeRecord(applyTeamTraits(fighters),seed,15,8),session=new BattleSession(record);session.seek(60);record.result=session.result();return record;
}
