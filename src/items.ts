import type {Game,Unit} from './engine.ts';
export type ItemStats={attack:number;health:number;haste:number;spell:number;mana:number;resist:number;heal:number;shield:number;regen:number;drain:number};
export type Item={id:string;name:string;icon:string;stats:Partial<ItemStats>;parts?:[string,string]};
export const components:Item[]=[
 {id:'power',name:'Power Band',icon:'⚔',stats:{attack:.08}},
 {id:'swift',name:'Swift Feather',icon:'➶',stats:{haste:.08}},
 {id:'wise',name:'Wise Lens',icon:'✦',stats:{spell:.08}},
 {id:'mana',name:'Mana Orb',icon:'◈',stats:{mana:12}},
 {id:'vital',name:'Vitality Seed',icon:'♥',stats:{health:.08}},
 {id:'guard',name:'Guard Scale',icon:'⬟',stats:{resist:.04}}
];
const specials:Record<string,[string,string,string,Partial<ItemStats>]>={
 'power+power':['charcoal','Charcoal','♨',{attack:.22}],
 'swift+swift':['quickClaw','Quick Claw','➶',{haste:.22}],
 'wise+wise':['choiceSpecs','Choice Specs','✦',{spell:.22}],
 'vital+vital':['leftovers','Leftovers','♥',{health:.18,regen:.008}],
 'guard+guard':['focusBand','Focus Band','⬟',{resist:.12}],
 'guard+mana':['mysticWater','Mystic Water','♦',{mana:12,resist:.04,shield:.12}],
 'vital+wise':['miracleSeed','Miracle Seed','♧',{health:.08,spell:.08,heal:.2}],
 'mana+power':['shellBell','Shell Bell','♬',{attack:.08,mana:12,drain:.1}]
};
const key=(a:string,b:string)=>[a,b].sort().join('+');
export const items:Item[]=[...components];
for(let a=0;a<components.length;a++)for(let b=a;b<components.length;b++){
 const x=components[a],y=components[b],pair=key(x.id,y.id),special=specials[pair];
 const stats:Partial<ItemStats>={};for(const part of [x,y])for(const [stat,value] of Object.entries(part.stats))stats[stat as keyof ItemStats]=(stats[stat as keyof ItemStats]??0)+value!;
 items.push(special?{id:special[0],name:special[1],icon:special[2],stats:special[3],parts:[x.id,y.id]}:{id:pair,name:`${x.name.split(' ')[0]} ${y.name.split(' ')[1]}`,icon:x.icon,stats,parts:[x.id,y.id]});
}
export function item(id:string){return items.find(i=>i.id===id);}
export function recipe(a:string,b:string){if(item(a)?.parts||item(b)?.parts)return;return items.find(i=>i.parts&&key(...i.parts)===key(a,b));}
export function itemStats(ids:readonly string[]=[]):ItemStats{const total:ItemStats={attack:0,health:0,haste:0,spell:0,mana:0,resist:0,heal:0,shield:0,regen:0,drain:0};for(const id of ids.slice(0,3))for(const [stat,value] of Object.entries(item(id)?.stats??{}))total[stat as keyof ItemStats]+=value!;return total;}
export function itemDescription(id:string){const i=item(id);if(!i)return '';return Object.entries(i.stats).map(([stat,value])=>`${stat==='mana'?value:Math.round(value!*100)+'%'} ${({attack:'attack',health:'health',haste:'attack speed',spell:'ability damage',mana:'starting mana',resist:'direct damage reduction',heal:'healing',shield:'opening shield',regen:'health regeneration / sec',drain:'damage healed'})[stat as keyof ItemStats]}`).join(' · ');}
export function equip(g:Game,uid:number,index:number){const u=g.units.find(u=>u.uid===uid),id=g.inventory?.[index];if(!u||!id||!item(id))return 'Choose an item and your Pokémon.';const held=u.items??[],component=held.findIndex(old=>!!recipe(old,id));if(component>=0){held[component]=recipe(held[component],id)!.id;}else{if(held.length>=3)return 'This Pokémon already holds three items.';held.push(id);}u.items=held;g.inventory!.splice(index,1);return '';}
export function combine(g:Game,a:number,b:number){if(a===b)return 'Choose two components.';const result=recipe(g.inventory?.[a]??'',g.inventory?.[b]??'');if(!result)return 'Only two components can combine.';g.inventory!.splice(Math.max(a,b),1);g.inventory!.splice(Math.min(a,b),1,result.id);return '';}
export function returnEquipment(g:Game,u:Unit){(g.inventory??=[]).push(...(u.items??[]));u.items=[];}
export function mergeEquipment(g:Game,keep:Unit,removed:Unit[]){for(const u of removed)for(const id of u.items??[]){const held=keep.items??=[];const index=held.findIndex(old=>!!recipe(old,id));if(index>=0)held[index]=recipe(held[index],id)!.id;else if(held.length<3)held.push(id);else (g.inventory??=[]).push(id);}}
export function autoEquip(g:Game){while(g.inventory?.length){const id=g.inventory[0],stats=item(id)!.stats;const targets=g.units.filter(u=>u.board&&((u.items?.length??0)<3||u.items?.some(old=>recipe(old,id))));targets.sort((a,b)=>{const score=(u:Unit)=>u.star*10+(stats.heal||stats.spell?([3,4,6,43,45,63,92].includes(u.species)?8:0):stats.health||stats.resist?([7,9,74,95,131,143,58,59].includes(u.species)?8:0):[25,26,135,147,52,133].includes(u.species)?8:0);return score(b)-score(a);});if(!targets.length)break;equip(g,targets[0].uid,0);}}
