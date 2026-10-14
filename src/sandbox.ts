import {applyTeamTraits,makeFighter,species,type Fighter} from './engine.ts';
import {BattleSession,makeRecord,type BattleRecord} from './battle.ts';
export const sandboxTeams={Fire:[58,6,4,74],Electric:[100,26,25,74],Grass:[3,1,43,133],Water:[9,54,7,74]} as const;
export const sandboxFormations={screen:[24,32,38,22],spread:[21,34,38,27],clump:[24,31,32,25],exposed:[38,24,22,39]} as const;
export const mixedTeams={
 'Fire/Grass Burst':[58,1,6,43],
 'Fire/Grass Sustain':[58,3,4,43],
 'Electric/Water Carry':[7,54,26,25],
 'Electric/Water Shield':[9,7,25,81],
} as const;
export const sandboxRosters={...sandboxTeams,...mixedTeams} as const;
export const mixedFormations={protected:[24,25,38,32],staggered:[23,25,37,32],compactMixed:[24,25,31,32],split:[21,27,35,40]} as const;
export const supportFormations={triangle:[24,31,38,32],rightSupport:[26,33,38,32],rearLeft:[30,37,40,36]} as const;
export const sandboxLayouts={...sandboxFormations,...mixedFormations,...supportFormations} as const;
export const mixedGuides:Record<keyof typeof mixedTeams,string>={
 'Fire/Grass Burst':'Growlithe screens Charizard; Bulbasaur roots enemies and Oddish heals. Fire 2, Grass 2, Poison 2.',
 'Fire/Grass Sustain':'Growlithe screens Venusaur and Charmander; Venusaur and Oddish heal wounded allies within two hexes. Fire 2, Grass 2, Poison 2.',
 'Electric/Water Carry':'Squirtle and Psyduck screen Raichu and Pikachu. Electric 2, Water 2; angle Thunder through the backline.',
 'Electric/Water Shield':'Blastoise and Squirtle screen Pikachu; Magnemite heals nearby allies. Electric 2, Water 2.',
};
export type SandboxTeam=keyof typeof sandboxRosters;
export type SandboxFormation=keyof typeof sandboxLayouts;
export type SandboxConfig={teams:[SandboxTeam,SandboxTeam];slots:[number[],number[]];seed:number;star:number};
export type SandboxResult={record:BattleRecord;config:SandboxConfig};
export function formationSlots(name:SandboxFormation,team:number){return sandboxLayouts[name].map(slot=>team?41-slot:slot);}
export function defaultSandbox():SandboxConfig{return {teams:['Electric','Water'],slots:[formationSlots('screen',0),formationSlots('spread',1)],seed:1,star:1};}
export function sandboxFighters(config:SandboxConfig):Fighter[]{
 if(!Number.isInteger(config.seed)||config.seed<0||config.seed>0xffffffff||!Number.isInteger(config.star)||config.star<1||config.star>3)throw new Error('Choose a valid seed and star level.');
 const occupied=new Set<number>();
 const fighters=config.teams.flatMap((name,team)=>{
  if(!sandboxRosters[name]||config.slots[team].length!==4)throw new Error('Choose four positions per team.');
  return sandboxRosters[name].map((id,i)=>{const slot=config.slots[team][i];if(!Number.isInteger(slot)||slot<(team?0:21)||slot>=(team?21:42)||occupied.has(slot))throw new Error('Each Pokémon needs a unique tile on its side.');occupied.add(slot);return makeFighter({uid:(team?-1:1)*(i+1),species:id,star:config.star,slot,board:true},team);});
 });
 return applyTeamTraits(fighters);
}
export function moveSandbox(config:SandboxConfig,team:number,index:number,slot:number){
 if((team!==0&&team!==1)||!Number.isInteger(index)||index<0||index>=4||!Number.isInteger(slot)||slot<(team?0:21)||slot>=(team?21:42))return false;
 const slots=config.slots[team],other=slots.indexOf(slot),old=slots[index];if(other>=0)slots[other]=old;slots[index]=slot;return true;
}
export class SandboxLab {
 config=defaultSandbox();session:BattleSession|null=null;history:SandboxResult[]=[];replaying=false;verified=false;private activeConfig:SandboxConfig|null=null;private expected:BattleRecord['result'];private committed=false;
 start(){const fs=sandboxFighters(this.config);this.activeConfig=structuredClone(this.config);this.session=new BattleSession(makeRecord(fs,this.config.seed,1));this.replaying=false;this.expected=undefined;this.verified=false;this.committed=false;return this.session;}
 replay(index=0){const result=this.history[index];if(!result)return null;this.activeConfig=structuredClone(result.config);this.session=new BattleSession(structuredClone(result.record));this.replaying=true;this.expected=result.record.result;this.verified=false;this.committed=false;return this.session;}
 advance(seconds:number){this.session?.advance(seconds);this.commit();}
 finish(){this.session?.seek(60);this.commit();}
 edit(){this.session=null;this.replaying=false;this.verified=false;}
 private commit(){if(!this.session?.done||this.committed)return;this.committed=true;const result=this.session.result();if(this.replaying){this.verified=!!this.expected&&this.expected.checksum===result.checksum&&this.expected.steps===result.steps&&this.expected.winner===result.winner;}else{const record=structuredClone(this.session.record);record.result=result;this.history.unshift({record,config:structuredClone(this.activeConfig!)});this.history=this.history.slice(0,8);}}
}
