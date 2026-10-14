import {itemStats,returnEquipment,mergeEquipment,type ItemStats} from './items.ts';
import {encounter} from './campaign.ts';
import type {LobbyState} from './lobby.ts';
import {roles,traitTier,roleMana,type Role} from './traits.ts';
import {skills} from './skills.ts';
export type Kind = 'Grass'|'Water'|'Fire'|'Electric'|'Poison'|'Normal'|'Psychic'|'Rock';
export type Species = { id:number; name:string; types:Kind[]; cost:number; hp:number; atk:number; range:number; ability:string };
export const dex:Species[] = [
{id:45,name:'Vileplume',types:['Grass','Poison'],cost:3,hp:900,atk:68,range:3,ability:'Petal Dance'},
{id:135,name:'Jolteon',types:['Electric'],cost:4,hp:1050,atk:105,range:3,ability:'Pin Missile'},
{id:59,name:'Arcanine',types:['Fire'],cost:5,hp:1600,atk:115,range:1,ability:'Fire Fang'},
{id:131,name:'Lapras',types:['Water','Rock'],cost:5,hp:1850,atk:90,range:2,ability:'Ice Beam'},
{id:81,name:'Magnemite',types:['Electric'],cost:1,hp:520,atk:44,range:3,ability:'Magnet Bomb'},
{id:100,name:'Voltorb',types:['Electric'],cost:2,hp:660,atk:58,range:1,ability:'Discharge'},
{id:26,name:'Raichu',types:['Electric'],cost:3,hp:880,atk:90,range:3,ability:'Thunder'},
{id:23,name:'Ekans',types:['Poison'],cost:1,hp:600,atk:52,range:1,ability:'Poison Fang'},
{id:1,name:'Bulbasaur',types:['Grass','Poison'],cost:1,hp:580,atk:48,range:2,ability:'Vine Whip'},
{id:4,name:'Charmander',types:['Fire'],cost:1,hp:520,atk:60,range:2,ability:'Flamethrower'},
{id:7,name:'Squirtle',types:['Water'],cost:1,hp:680,atk:42,range:2,ability:'Water Pulse'},
{id:25,name:'Pikachu',types:['Electric'],cost:2,hp:510,atk:68,range:3,ability:'Thunderbolt'},
{id:43,name:'Oddish',types:['Grass','Poison'],cost:1,hp:540,atk:46,range:3,ability:'Giga Drain'},
{id:52,name:'Meowth',types:['Normal'],cost:1,hp:560,atk:58,range:1,ability:'Pay Day'},
{id:54,name:'Psyduck',types:['Water','Psychic'],cost:2,hp:640,atk:58,range:2,ability:'Confusion'},
{id:58,name:'Growlithe',types:['Fire'],cost:2,hp:720,atk:64,range:1,ability:'Flame Wheel'},
{id:63,name:'Abra',types:['Psychic'],cost:2,hp:460,atk:85,range:3,ability:'Psybeam'},
{id:74,name:'Geodude',types:['Rock'],cost:1,hp:850,atk:40,range:1,ability:'Rock Throw'},
{id:92,name:'Gastly',types:['Poison','Psychic'],cost:2,hp:490,atk:76,range:3,ability:'Shadow Ball'},
{id:95,name:'Onix',types:['Rock'],cost:3,hp:1250,atk:54,range:1,ability:'Rock Slide'},
{id:133,name:'Eevee',types:['Normal'],cost:2,hp:700,atk:65,range:1,ability:'Swift'},
{id:143,name:'Snorlax',types:['Normal'],cost:3,hp:1500,atk:57,range:1,ability:'Body Slam'},
{id:147,name:'Dratini',types:['Water'],cost:3,hp:820,atk:90,range:3,ability:'Dragon Rage'},
{id:94,name:'Gengar',types:['Poison','Psychic'],cost:4,hp:1000,atk:110,range:3,ability:'Night Shade'},
{id:6,name:'Charizard',types:['Fire'],cost:4,hp:1300,atk:105,range:2,ability:'Fire Blast'},
{id:3,name:'Venusaur',types:['Grass','Poison'],cost:4,hp:1350,atk:95,range:2,ability:'Solar Beam'},
{id:9,name:'Blastoise',types:['Water'],cost:4,hp:1500,atk:88,range:3,ability:'Hydro Pump'}];
export const colors:Record<Kind,string> = {Grass:'#89c96b',Water:'#6da9ed',Fire:'#f18c62',Electric:'#f1cc62',Poison:'#bd83dd',Normal:'#bab4c9',Psychic:'#ee80bb',Rock:'#c1a773'};
export type Unit = {uid:number; species:number; star:number; slot:number; board:boolean;items?:string[]};
export type Game = {gold:number; health:number; level:number; xp:number; round:number; wins:number; streak:number; units:Unit[]; shop:(number|null)[]; locked:boolean; nextId:number;inventory?:string[];lobby?:LobbyState};
export function fresh():Game {const g:Game={gold:18,health:100,level:4,xp:0,round:1,wins:0,streak:0,units:[],shop:[1,25,7,4,43],locked:false,inventory:['power','wise','vital'],nextId:1};g.units=[{uid:g.nextId++,species:1,star:1,slot:31,board:true},{uid:g.nextId++,species:7,star:1,slot:38,board:true},{uid:g.nextId++,species:25,star:1,slot:33,board:true},{uid:g.nextId++,species:4,star:1,slot:0,board:false}];return g;}
export function species(id:number) {return dex.find(d=>d.id===id)!;}
export const shopOdds=[ [100,0,0,0,0],[100,0,0,0,0],[75,25,0,0,0],[55,30,15,0,0],[45,33,20,2,0],[30,40,25,5,0],[19,30,35,15,1],[16,20,35,25,4],[10,15,25,35,15] ];
export function poolSize(id:number){return [0,29,22,18,12,10][species(id).cost];}
type PoolPeer=Pick<Game,'units'|'shop'|'health'>;
export function remainingCopies(g:Game,id:number,offers=true,peers?:PoolPeer[]){
 const rivals=peers??g.lobby?.rivals.filter(p=>p.health>0),held=rivals?[...g.units,...rivals.flatMap(p=>p.units)]:[...g.units,...enemies(g.round)];
 const rivalOffers=rivals?.flatMap(p=>p.shop).filter(x=>x===id).length??0;const drafts=g.lobby?.draftOffers.filter(x=>x===id).length??0;
 return Math.max(0,poolSize(id)-held.filter(u=>u.species===id).reduce((n,u)=>n+Math.pow(3,u.star-1),0)-(offers?g.shop.filter(x=>x===id).length:0)-rivalOffers-drafts);
}

export function roll(g:Game,rng=Math.random,peers?:PoolPeer[]) {
 g.shop=[];for(let i=0;i<5;i++){
  const weights=shopOdds[Math.max(0,Math.min(8,g.level-1))],pool=dex.filter(s=>remainingCopies(g,s.id,true,peers)>0&&weights[s.cost-1]>0),tiers=[1,2,3,4,5].filter(cost=>pool.some(s=>s.cost===cost));
  let ticket=rng()*tiers.reduce((n,c)=>n+weights[c-1],0),tier=tiers[tiers.length-1];for(const cost of tiers){ticket-=weights[cost-1];if(ticket<0){tier=cost;break;}}
  const candidates=pool.filter(s=>s.cost===tier),total=candidates.reduce((n,s)=>n+remainingCopies(g,s.id,true,peers),0);let copy=rng()*total,pick:number|null=null;
  for(const s of candidates){copy-=remainingCopies(g,s.id,true,peers);if(copy<0){pick=s.id;break;}}g.shop.push(pick);
 }
}
export function unitSaleValue(u:Unit){return species(u.species).cost*Math.pow(3,u.star-1);}
export function sell(g:Game,uid:number){const u=g.units.find(u=>u.uid===uid);if(!u)return 0;const price=unitSaleValue(u);g.gold+=price;returnEquipment(g,u);g.units=g.units.filter(v=>v!==u);return price;}

export function merge(g:Game) {let changed=true;while(changed){changed=false;for(const u of g.units){if(u.star>=3)continue;const copies=g.units.filter(v=>v.species===u.species&&v.star===u.star);if(copies.length>=3){const keep=copies.find(v=>v.board)||copies[0];const remove=copies.filter(v=>v!==keep).slice(0,2);keep.star++;mergeEquipment(g,keep,remove);g.units=g.units.filter(v=>!remove.includes(v));changed=true;break;}}}}
export function buy(g:Game,index:number,peers?:PoolPeer[]):string {const id=g.shop[index];if(!id)return 'This slot is sold out.';const s=species(id);if(remainingCopies(g,id,false,peers)<1)return 'No copies remain in the shared pool.';if(g.gold<s.cost)return 'Not enough gold.';const copies=g.units.filter(u=>u.species===id&&u.star===1);const slot=Array.from({length:9},(_,i)=>i).find(i=>!g.units.some(u=>!u.board&&u.slot===i));if(slot===undefined&&copies.length<2)return 'Your bench is full.';g.gold-=s.cost;g.shop[index]=null;g.units.push({uid:g.nextId++,species:id,star:1,slot:slot??0,board:false});merge(g);return '';}
export function synergies(units:Unit[]) {const counts:Partial<Record<Kind,number>>={};new Set(units.filter(u=>u.board).map(u=>u.species)).forEach(id=>species(id).types.forEach(t=>counts[t]=(counts[t]||0)+1));return Object.entries(counts) as [Kind,number][];}
export function place(g:Game,uid:number,slot:number,board:boolean):string {const u=g.units.find(v=>v.uid===uid);if(!u)return '';if(!Number.isInteger(slot)||slot<0||slot>=(board?42:9))return 'Choose a valid position.';if(board&&slot<21)return 'Place your team in the lower half.';const target=g.units.find(v=>v.board===board&&v.slot===slot);if(board&&!u.board&&!target&&g.units.filter(v=>v.board).length>=g.level)return 'Team full. Buy XP to increase capacity.';if(target){target.board=u.board;target.slot=u.slot;}u.board=board;u.slot=slot;return '';}
export type Fighter={items?:string[];itemBonuses?:ItemStats;uid:number;species:number;star:number;team:number;slot:number;moveTo:number|null;moveProgress:number;x:number;y:number;hp:number;maxHp:number;atk:number;mana:number;cooldown:number;damage:number;flash:number;shield:number;statuses:Status[];strike:Strike|null;role:Role;bonuses:Partial<Record<Kind,number>>;healing:number;shielding:number;control:number;casts:number;absorbed:number;healingTargets:Record<number,number>};
export type Strike={remaining:number;ability:boolean;victims:{uid:number;amount:number;hit:Hit}[]};
export type Status={kind:'burn'|'poison'|'root'|'stun'|'slow';time:number;source:number;power:number;pulse:number;healingCut?:number};
export type Hit={x:number;y:number;toX:number;toY:number;value:number;color:string;life:number;ability?:string;attacker:number;target:number;species:number;primary:boolean;duration?:number;kind?:'damage'|'heal'|'shield'};
export function cell(slot:number) {const row=Math.floor(slot/7),col=slot%7;return {x:col+(row%2)*.5,y:row*.86};}
export function makeFighter(u:Unit,team:number):Fighter {const s=species(u.species),p=cell(u.slot),scale=Math.pow(1.85,u.star-1),gear=itemStats(u.items);return {items:[...(u.items??[])],itemBonuses:gear,uid:u.uid,species:u.species,star:u.star,team,slot:u.slot,moveTo:null,moveProgress:0,...p,hp:s.hp*scale*(1+gear.health),maxHp:s.hp*scale*(1+gear.health),atk:s.atk*scale*(1+gear.attack),mana:0,cooldown:.3+(Math.abs(u.uid)%5)*.14,damage:0,flash:0,shield:0,statuses:[],strike:null,role:roles[u.species],bonuses:{},healing:0,shielding:0,control:0,casts:0,absorbed:0,healingTargets:{}};}
export function enemies(round:number):Unit[] {const e=encounter(round);return e.ids.map((id,i)=>({uid:-100-i,species:id,star:round>=7&&i<(round===10?1:round-6)?2:1,slot:e.slots[i],board:true}));}

export function applyTeamTraits(fighters:Fighter[]) {
 for(const team of [0,1]){
  const counts:Partial<Record<Kind,number>>={};const members=fighters.filter(f=>f.team===team);
  for(const id of new Set(members.map(f=>f.species)))for(const type of species(id).types)counts[type]=(counts[type]??0)+1;
  for(const f of members){f.bonuses={};for(const type of species(f.species).types){const tier=traitTier(type,counts[type]??0);if(tier)f.bonuses[type]=tier;}f.mana=Math.min(skills[f.species].mana,(skills[f.species].startMana??(f.role==='Caster'?15:0))+(f.itemBonuses?.mana??0));f.shield=f.maxHp*(f.itemBonuses?.shield??0);f.shielding=f.shield;const water=f.bonuses.Water??0;if(water){f.shield+=f.maxHp*(water===2?.22:.15);f.shielding=f.shield;}}
 }
 return fighters;
}
export function opponentUnits(g:Game):Unit[]{
 if(!g.lobby)return enemies(g.round);
 if(g.lobby.roundKind==='draft')return [];
 if(g.lobby.roundKind==='neutral')return enemies(Math.min(3,g.round)).map(u=>({...u,star:g.round<10?1:Math.min(3,1+Math.floor(g.round/14))}));
 const rival=g.lobby.rivals.find(p=>p.id===g.lobby!.opponent);return (rival?.units.filter(u=>u.board)??[]).map((u,i)=>({...u,uid:-100-i,slot:41-u.slot}));
}
export function prepare(g:Game) {return applyTeamTraits([...g.units.filter(u=>u.board).map(u=>makeFighter(u,0)),...opponentUnits(g).map(u=>makeFighter(u,1))]);}
/** Hex distance on the board's odd-row offset grid. */
export function hexDistance(a:number,b:number) {
 const ar=Math.floor(a/7),br=Math.floor(b/7);
 const aq=a%7-(ar-(ar&1))/2,bq=b%7-(br-(br&1))/2;
 return Math.max(Math.abs(aq-bq),Math.abs(ar-br),Math.abs(aq-bq+ar-br));
}
const adjacency=Array.from({length:42},(_,a)=>Array.from({length:42},(_,b)=>b).filter(b=>hexDistance(a,b)===1));
export function hexNeighbors(slot:number):readonly number[] {return adjacency[slot]??[];}

/** Both the source and destination stay reserved until a step finishes. */
export function occupiedTiles(fighters:Fighter[]) {
 const occupied=new Set<number>();
 for(const f of fighters)if(f.hp>0){occupied.add(f.slot);if(f.moveTo!==null)occupied.add(f.moveTo);}
 return occupied;
}
function nextCombatStep(f:Fighter,targets:Fighter[],blocked:Set<number>):number|null {
 const range=species(f.species).range;
 const queue=[f.slot],firstStep=new Map<number,number>();
 firstStep.set(f.slot,f.slot);
 for(let i=0;i<queue.length;i++) {
  const current=queue[i];
  if(current!==f.slot&&targets.some(t=>hexDistance(current,t.slot)<=range))return firstStep.get(current)!;
  for(const next of (f.team?[...hexNeighbors(current)].reverse():hexNeighbors(current))) {
   if(blocked.has(next)||firstStep.has(next))continue;
   firstStep.set(next,current===f.slot?next:firstStep.get(current)!);
   queue.push(next);
  }
 }
 return null; // Surrounded units wait and replan when a tile opens.
}
function gainMana(target:Fighter,amount:number){if(target.hp>0&&!target.strike?.ability)target.mana=Math.min(skills[target.species].mana,target.mana+amount);}
function grantHeal(target:Fighter,amount:number,source:Fighter,hits:Hit[]){const grass=source.bonuses.Grass??0;amount*=(grass?1.15:1)*(1+(source.itemBonuses?.heal??0));const cut=Math.max(0,...target.statuses.map(s=>s.healingCut??0));const heal=Math.max(0,Math.min(target.maxHp-target.hp,amount*(1-cut)));if(target.hp<=0||heal<=0)return;target.hp+=heal;source.healing+=heal;source.healingTargets[target.uid]=(source.healingTargets[target.uid]??0)+heal;if(heal>=1)hits.push({x:source.x,y:source.y,toX:target.x,toY:target.y,value:Math.round(heal),color:'#bdffa2',life:1.1,duration:1.8,attacker:source.uid,target:target.uid,species:source.species,primary:false,kind:'heal'});}
function addStatus(source:Fighter,target:Fighter,kind:Status['kind'],duration:number){const grass=target.bonuses.Grass??0;if(grass&&(kind==='stun'||kind==='root'||kind==='slow'))duration*=grass===2?.4:.55;const poison=source.bonuses.Poison??0,fire=source.bonuses.Fire??0;const power=source.atk*(kind==='burn'&&fire?(fire===2?.55:.42):.24);const healingCut=kind==='poison'&&poison?(poison===2?.5:.25):kind==='burn'&&fire?(fire===2?.6:.4):0;const prior=target.statuses.find(s=>s.kind===kind);if(prior){prior.time=Math.max(prior.time,duration);if(power>prior.power){prior.power=power;prior.source=source.uid;}prior.healingCut=Math.max(prior.healingCut??0,healingCut);}else target.statuses.push({kind,time:duration,source:source.uid,power,pulse:.7,healingCut});if(kind==='root'||kind==='stun'||kind==='slow')source.control+=duration;}
function defense(target:Fighter){const rock=target.bonuses.Rock??0;return (target.role==='Tank'?.88:1)*(rock===2?.75:rock===1?.86:1);}
function resolveStrike(f:Fighter,fighters:Fighter[],hits:Hit[]) {
 const strike=f.strike!;const skill=skills[f.species];let totalDamage=0;
 for(const impact of strike.victims){const v=fighters.find(v=>v.uid===impact.uid);if(!v||v.hp<=0){impact.hit.value=0;continue;}
  const grass=v.bonuses.Grass??0;const canopy=strike.ability&&grass?(grass===2?.65:.75):1;const amount=impact.amount*defense(v)*canopy*(1-Math.min(.35,v.itemBonuses?.resist??0));const electric=f.bonuses.Electric??0;const shieldPressure=strike.ability&&electric?(electric===2?1.5:1.3):1;const absorbed=Math.min(v.shield/shieldPressure,amount);v.shield=Math.max(0,v.shield-absorbed*shieldPressure);v.absorbed+=absorbed;
  const dealt=Math.min(v.hp,Math.max(0,Math.round(amount-absorbed)));v.hp=Math.max(0,v.hp-dealt);v.flash=.18;f.damage+=dealt;totalDamage+=dealt;impact.hit.value=dealt;impact.hit.toX=v.x;impact.hit.toY=v.y;
  if(roleMana[v.role].damage)gainMana(v,Math.min(8,dealt/v.maxHp*100));
  if(strike.ability&&v.hp>0){if(skill.status)addStatus(f,v,skill.status,skill.duration??1);if(f.bonuses.Fire)addStatus(f,v,'burn',f.bonuses.Fire===2?4:3);if(f.bonuses.Poison)addStatus(f,v,'poison',f.bonuses.Poison===2?6:4);}
 }
 if(f.hp>0){if(strike.ability&&skill.heal){const recipient=skill.healTarget?fighters.filter(v=>v.team===f.team&&v.hp>0&&hexDistance(v.slot,f.slot)<=2).sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp)||Math.abs(a.uid)-Math.abs(b.uid))[0]:f;if(recipient)grantHeal(recipient,recipient===f&&skill.selfHeal!==undefined?totalDamage*skill.selfHeal:totalDamage*skill.heal+f.atk*(skill.healFlat??0),f,hits);}if(f.itemBonuses?.drain)grantHeal(f,totalDamage*f.itemBonuses.drain,f,hits);if(f.role==='Bruiser')grantHeal(f,totalDamage*.12,f,hits);
  if(strike.ability&&f.role==='Support'&&!skill.healTarget){const ally=fighters.filter(v=>v.team===f.team&&v.hp>0&&hexDistance(v.slot,f.slot)<=2).sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp)||Math.abs(a.uid)-Math.abs(b.uid))[0];if(ally)grantHeal(ally,f.atk*.9,f,hits);}
  if(strike.ability&&skill.shield){const next=f.maxHp*skill.shield;f.shielding+=Math.max(0,next-f.shield);f.shield=Math.max(f.shield,next);}
 }
 f.strike=null;
}
export function tick(fighters:Fighter[],dt:number,hits:Hit[],rng=Math.random) {
 const occupied=occupiedTiles(fighters);
 for(const f of fighters) {
  f.flash=Math.max(0,f.flash-dt);
  if(f.strike){f.strike.remaining-=dt;for(const impact of f.strike.victims){const target=fighters.find(v=>v.uid===impact.uid);if(target){impact.hit.toX=target.x;impact.hit.toY=target.y;}}if(f.strike.remaining<=0)resolveStrike(f,fighters,hits);}
  if(f.hp<=0)continue;
  for(const status of f.statuses){status.time-=dt;status.pulse-=dt;if((status.kind==='burn'||status.kind==='poison')&&status.pulse<=0){status.pulse+=.7;const water=f.bonuses.Water??0;const amount=status.power*(status.kind==='burn'&&water?(water===2?.55:.75):status.kind==='poison'&&water?(water===2?.75:.85):1);const absorbed=Math.min(f.shield,amount);f.shield-=absorbed;f.absorbed+=absorbed;const damage=Math.min(f.hp,amount-absorbed);f.hp-=damage;if(roleMana[f.role].damage)gainMana(f,Math.min(8,damage/f.maxHp*100));const source=fighters.find(v=>v.uid===status.source);if(source)source.damage+=damage;hits.push({x:f.x,y:f.y,toX:f.x,toY:f.y,value:Math.round(damage),color:status.kind==='burn'?'#ff9963':'#d29aff',life:.7,duration:.7,attacker:status.source,target:f.uid,species:source?.species??f.species,primary:false});}}
  f.statuses=f.statuses.filter(s=>s.time>0);
  if(f.hp<=0)continue;
  const grass=f.bonuses.Grass??0;if(grass){const cut=Math.max(0,...f.statuses.map(s=>s.healingCut??0));const heal=Math.min(f.maxHp-f.hp,f.maxHp*(grass===2?.03:.025)*dt*(1-cut)*(1+(f.itemBonuses?.heal??0)));f.hp+=heal;f.healing+=heal;}
  if(f.itemBonuses?.regen)grantHeal(f,f.maxHp*f.itemBonuses.regen*dt,f,hits);gainMana(f,roleMana[f.role].regen*dt);
  if(f.statuses.some(s=>s.kind==='stun'))continue;
  f.cooldown-=dt;
  if(f.strike)continue;
  if(f.moveTo!==null) {
   if(f.statuses.some(s=>s.kind==='root'))continue;
   f.moveProgress=Math.min(1,f.moveProgress+dt/(f.statuses.some(s=>s.kind==='slow')?.85:.5));
   const start=cell(f.slot),end=cell(f.moveTo);
   f.x=start.x+(end.x-start.x)*f.moveProgress;
   f.y=start.y+(end.y-start.y)*f.moveProgress;
   if(f.moveProgress>=1){occupied.delete(f.slot);f.slot=f.moveTo;f.moveTo=null;f.moveProgress=0;}
   continue;
  }
  const targets=fighters.filter(t=>t.team!==f.team&&t.hp>0)
   .sort((a,b)=>hexDistance(f.slot,a.slot)-hexDistance(f.slot,b.slot)||Math.abs(a.uid)-Math.abs(b.uid));
  if(!targets.length)continue;
  const inRange=targets.filter(t=>hexDistance(f.slot,t.slot)<=species(f.species).range);if(f.role==='Disruptor')inRange.sort((a,b)=>b.mana-a.mana||Math.abs(a.uid)-Math.abs(b.uid));if(f.role==='Caster')inRange.sort((a,b)=>b.hp-a.hp||Math.abs(a.uid)-Math.abs(b.uid));const t=inRange[0];
  if(!t) {
   const next=nextCombatStep(f,targets,occupied);
   if(next!==null&&!f.statuses.some(s=>s.kind==='root')){f.moveTo=next;f.moveProgress=0;occupied.add(next);}
   continue;
  }
  const skill=skills[f.species],ability=f.mana>=skill.mana;
  if(f.cooldown>0&&!ability)continue;
  const normal=f.bonuses.Normal??0;f.cooldown=(.8+rng()*.3)/((1+(f.itemBonuses?.haste??0))*(f.role==='Carry'?1.12:1)*(normal===2?1.24:normal===1?1.12:1));
  if(ability){f.mana=0;f.casts++;}else gainMana(f,roleMana[f.role].attack+(f.bonuses.Electric===2?9:f.bonuses.Electric?5:0));
  const damage=Math.round(f.atk*(ability?(1+(f.itemBonuses?.spell??0))*skill.power*(f.bonuses.Psychic===2?1.32:f.bonuses.Psychic?1.18:1):1)*(f.shield>0&&f.bonuses.Water?(f.bonuses.Water===2?1.15:1.1):1)*(0.9+rng()*.2));
  let victims=[t];
  if(ability){
   if(skill.pattern==='splash')victims=targets.filter(v=>hexDistance(v.slot,t.slot)<=(f.species===6||f.species===95?2:1));
   if(skill.pattern==='nova')victims=targets.filter(v=>hexDistance(v.slot,f.slot)<=1); // Frontline impact originates at the caster.
   if(skill.pattern==='volley')victims=f.species===94?targets:targets.slice(0,3);
   if(skill.pattern==='chain'){let last=t;victims=[t];while(victims.length<3){const next=targets.filter(v=>!victims.includes(v)&&hexDistance(v.slot,last.slot)<=2).sort((a,b)=>hexDistance(a.slot,last.slot)-hexDistance(b.slot,last.slot))[0];if(!next)break;victims.push(next);last=next;}}
   if(skill.pattern==='line'||skill.pattern==='cone'){const dx=t.x-f.x,dy=t.y-f.y,d=Math.hypot(dx,dy)||1;victims=targets.filter(v=>{const vx=v.x-f.x,vy=v.y-f.y,along=(vx*dx+vy*dy)/d,side=Math.abs(vx*dy-vy*dx)/d;return along>=0&&along<=5&&(skill.pattern==='line'?side<.55:side<.45+along*.6);});}
   if(!victims.length)victims=[t];
   else if(victims.includes(t))victims=[t,...victims.filter(v=>v!==t)];
  }
  const strike:Strike={remaining:ability?.612:.34,ability,victims:[]};
  for(const [index,v] of victims.entries()) {
   const falloff=!ability||v===t?1:skill.pattern==='chain'?Math.pow(.82,index):skill.pattern==='line'?.8:f.species===94?.5:.65;
   const amount=damage*falloff;
   const start=ability&&skill.pattern==='chain'&&index>0?victims[index-1]:f;
   const hit:Hit={x:start.x,y:start.y,toX:v.x,toY:v.y,value:0,color:ability?skill.color:colors[species(f.species).types[0]],life:ability?1.8:1,duration:ability?1.8:1,ability:ability?skill.name:undefined,attacker:f.uid,target:v.uid,species:f.species,primary:index===0};
   hits.push(hit);strike.victims.push({uid:v.uid,amount,hit});
  }
  f.strike=strike;
 }
}
