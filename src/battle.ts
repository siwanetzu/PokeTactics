import {item,itemStats} from './items.ts';
import {tick,species,cell,type Fighter,type Hit} from './engine.ts';
import {roles} from './traits.ts';
export const RULESET='poketactics-11';
export const STEP=1/60;
export type BattleRecord={version:1;ruleset:string;seed:number;round:number;capacity?:number;createdAt:string;initial:Fighter[];result?:{winner:number;steps:number;checksum:string}};
export function seededRandom(seed:number){let state=seed>>>0;return ()=>{state=(state+0x6d2b79f5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function battleChecksum(fighters:Fighter[]){let hash=2166136261;const text=JSON.stringify(fighters);for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);return (hash>>>0).toString(16).padStart(8,'0');}
export function makeRecord(initial:Fighter[],seed:number,round:number,capacity=initial.filter(f=>!f.team).length):BattleRecord{return {version:1,ruleset:RULESET,seed:seed>>>0,round,capacity,createdAt:new Date().toISOString(),initial:structuredClone(initial)};}
export function validateRecord(value:unknown):value is BattleRecord {
 if(!value||typeof value!=='object')return false;const r=value as BattleRecord;
 if(r.version!==1||r.ruleset!==RULESET||!Number.isInteger(r.seed)||r.seed<0||r.seed>0xffffffff||!Number.isInteger(r.round)||!Array.isArray(r.initial)||r.initial.length<2||r.initial.length>42)return false;
 const occupied=new Set<number>(),ids=new Set<number>();
 try{for(const f of r.initial){if(!Array.isArray(f.items)||f.items.length>3||f.items.some(id=>!item(id))||JSON.stringify(f.itemBonuses)!==JSON.stringify(itemStats(f.items)))return false;if(!Number.isInteger(f.uid)||ids.has(f.uid)||!Number.isInteger(f.slot)||f.slot<0||f.slot>=42||occupied.has(f.slot)||!species(f.species)||f.team!==0&&f.team!==1||![f.hp,f.maxHp,f.atk,f.mana,f.cooldown,f.shield,f.x,f.y,f.healing,f.shielding,f.control,f.damage,f.casts,f.absorbed].every(Number.isFinite)||!f.healingTargets||typeof f.healingTargets!=='object'||Object.keys(f.healingTargets).length!==0||f.casts!==0||f.absorbed!==0||f.hp<=0||f.maxHp<=0||f.strike||f.moveTo!==null||!Array.isArray(f.statuses)||f.statuses.length!==0||!f.bonuses||typeof f.bonuses!=='object'||!Object.entries(f.bonuses).every(([key,tier])=>['Grass','Water','Fire','Electric','Poison','Normal','Psychic','Rock'].includes(key)&&(tier===1||tier===2))||f.role!==roles[f.species]||f.x!==cell(f.slot).x||f.y!==cell(f.slot).y)return false;ids.add(f.uid);occupied.add(f.slot);}return r.initial.some(f=>f.team===0)&&r.initial.some(f=>f.team===1);}catch{return false;}
}
export class BattleSession {
 fighters:Fighter[];hits:Hit[]=[];steps=0;accumulator=0;done=false;winner=-1;private random:()=>number;
 record:BattleRecord;
 constructor(record:BattleRecord){this.record=record;if(!validateRecord(record))throw new Error('Replay uses unsupported rules or invalid combat data.');this.fighters=structuredClone(record.initial);this.random=seededRandom(record.seed);}
 get seconds(){return this.steps*STEP;}
 step(){if(this.done)return;tick(this.fighters,STEP,this.hits,this.random);this.hits=this.hits.filter(h=>(h.life-=STEP)>0);this.steps++;const blue=this.fighters.some(f=>!f.team&&f.hp>0),red=this.fighters.some(f=>f.team&&f.hp>0);if((!blue||!red)&&!this.fighters.some(f=>f.strike)||this.steps>=3600){this.done=true;this.winner=blue&&!red?0:red&&!blue?1:-1;}}
 advance(seconds:number){if(!Number.isFinite(seconds)||seconds<0)return;this.accumulator+=seconds;while(this.accumulator+1e-9>=STEP&&!this.done){this.accumulator-=STEP;this.step();}}
 seek(seconds:number){this.fighters=structuredClone(this.record.initial);this.hits=[];this.steps=0;this.accumulator=0;this.done=false;this.winner=-1;this.random=seededRandom(this.record.seed);const target=Math.max(0,Math.min(3600,Math.floor((seconds+1e-9)/STEP)));while(this.steps<target&&!this.done)this.step();}
 result(){return {winner:this.winner,steps:this.steps,checksum:battleChecksum(this.fighters)};}
}
