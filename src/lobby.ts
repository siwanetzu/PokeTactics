import {components,autoEquip} from './items.ts';
import {fresh,buy,roll,sell,merge,species,dex,poolSize,remainingCopies,makeFighter,applyTeamTraits,prepare,type Game,type Unit} from './engine.ts';
import {BattleSession,makeRecord,seededRandom} from './battle.ts';
import {roles} from './traits.ts';
import {payRound,levelUpGame,xpToNext} from './run.ts';

export type Rival=Game&{id:number;name:string;preferred:string[];lastOpponent:number|null;placement?:number};
export type Pairing={a:number;b:number;ghost:boolean};
export type LobbyState={seed:number;rivals:Rival[];opponent:number;pairings:Pairing[];roundKind:'neutral'|'pvp'|'draft';resolvedRound:number;matchNumber:number;placement?:number;draftOffers:(number|null)[];draftOrder:number[];draftCursor:number;lastIncome?:ReturnType<typeof payRound>;log:{round:number;label:string;winner:string;damage:number}[]};
const profiles=[
 {name:'Brock',preferred:['Rock','Normal'],ids:[74,95,1]},
 {name:'Misty',preferred:['Water'],ids:[7,54,74,81]},
 {name:'Erika',preferred:['Grass','Poison'],ids:[1,43,133,74]},
 {name:'Lt. Surge',preferred:['Electric'],ids:[100,25,81]},
 {name:'Blaine',preferred:['Fire'],ids:[58,4,74,43]},
 {name:'Sabrina',preferred:['Psychic','Poison'],ids:[63,92,43]},
 {name:'Giovanni',preferred:['Normal','Rock','Poison'],ids:[52,23,133,1]},
];
export function stageLabel(round:number){if(round<=3)return `1-${round}`;return `${2+Math.floor((round-4)/7)}-${1+(round-4)%7}`;}
export function roundKind(round:number):LobbyState['roundKind']{if(round<=3||(round-4)%7===6)return 'neutral';if((round-4)%7===3)return 'draft';return 'pvp';}
export function freshMatch(seed=crypto.getRandomValues(new Uint32Array(1))[0]):Game{
 const g=fresh();g.lobby={seed:seed>>>0,rivals:profiles.map((p,i)=>{const bot=fresh();bot.units=p.ids.map((id,j)=>({uid:j+1,species:id,star:1,slot:[24,32,38,22][j],board:true}));bot.nextId=p.ids.length+1;bot.gold=23-p.ids.reduce((n,id)=>n+species(id).cost,0);bot.shop=[];return {...bot,id:i+1,name:p.name,preferred:p.preferred,lastOpponent:null};}),opponent:-1,pairings:[],roundKind:'neutral',resolvedRound:0,matchNumber:0,draftOffers:[],draftOrder:[],draftCursor:0,log:[]};
 prepareLobbyRound(g);return g;
}
export function trainer(g:Game,id:number):Game{return id===0?g:g.lobby!.rivals.find(p=>p.id===id)!;}
function peers(g:Game,id:number){return [g,...g.lobby!.rivals.filter(p=>p.health>0)].filter(p=>p!==trainer(g,id));}
function power(u:Unit){const s=species(u.species);return (s.hp*.18+s.atk*6)*Math.pow(1.85,u.star-1);}
function deploy(bot:Rival){
 const army=bot.units.slice().sort((a,b)=>{const favored=(u:Unit)=>species(u.species).types.some(t=>bot.preferred.includes(t))?90:0;return power(b)+favored(b)-power(a)-favored(a);}).slice(0,bot.level);
 army.sort((a,b)=>Number(['Tank','Bruiser'].includes(roles[b.species]))-Number(['Tank','Bruiser'].includes(roles[a.species]))||species(b.species).hp-species(a.species).hp);
 const slots=[23,25,24,30,32,34,37,39,38];bot.units.forEach(u=>u.board=false);army.forEach((u,i)=>{u.board=true;u.slot=slots[i];});let bench=0;bot.units.filter(u=>!u.board).forEach(u=>u.slot=bench++);
}
export function planRival(g:Game,bot:Rival){
 bot.round=g.round;const rng=seededRandom(g.lobby!.seed^Math.imul(g.round,7919)^Math.imul(bot.id,104729)),target=Math.min(9,4+Math.floor(g.round/5));
 while(bot.level<target&&bot.gold>=14){bot.gold-=4;bot.xp+=4;levelUpGame(bot);}
 const reserve=bot.health<35?0:g.round<9?10:30;
 for(let refresh=0;refresh<3;refresh++){
  roll(bot,rng,peers(g,bot.id));
  for(let i=0;i<5;i++){const id=bot.shop[i];if(!id||bot.gold-species(id).cost<reserve)continue;const copies=bot.units.filter(u=>u.species===id&&u.star<3),favored=species(id).types.some(t=>bot.preferred.includes(t));
   if(!copies.length&&!favored)continue;if(bot.units.length>=bot.level+7&&!copies.length)continue;
   if(bot.units.filter(u=>!u.board).length>=9&&copies.length<2){const spare=bot.units.filter(u=>!u.board&&u.star===1).sort((a,b)=>power(a)-power(b))[0];if(spare)sell(bot,spare.uid);else continue;}
   buy(bot,i,peers(g,bot.id));
  }
  deploy(bot);if(refresh>=2||bot.gold<reserve+7)break;bot.gold-=2;
 }
 deploy(bot);autoEquip(bot);
}
export function pairingsFor(ids:number[],round:number):Pairing[]{
 if(ids.length<2)return [];const ring=ids.slice();if(ring.length%2)ring.push(-1);
 for(let n=0;n<(round-1)%(ring.length-1);n++)ring.splice(1,0,ring.pop()!);
 const result:Pairing[]=[];for(let i=0;i<ring.length/2;i++){const a=ring[i],b=ring[ring.length-1-i];if(a===-1||b===-1){const solo=a===-1?b:a,ghost=ids.find(id=>id!==solo)!;result.push({a:solo,b:ghost,ghost:true});}else result.push({a,b,ghost:false});}return result;
}
export function prepareLobbyRound(g:Game){
 const lobby=g.lobby!;lobby.roundKind=roundKind(g.round);lobby.draftOffers=[];
 if(lobby.roundKind==='draft'){prepareDraft(g);return;}
 const alive=lobby.rivals.filter(p=>p.health>0);alive.forEach(bot=>bot.shop=[]);
 const order=alive.slice();if(order.length)order.push(...order.splice(0,g.round%order.length));for(const bot of order)planRival(g,bot);
 if(lobby.roundKind==='pvp')lobby.matchNumber=(lobby.matchNumber??0)+1;
 lobby.pairings=pairingsFor([0,...alive.map(p=>p.id)],Math.max(1,lobby.matchNumber));const pair=lobby.pairings.find(p=>p.a===0||!p.ghost&&p.b===0);lobby.opponent=pair?(pair.a===0?pair.b:pair.a):-1;
 if(!g.locked)roll(g,seededRandom(lobby.seed^Math.imul(g.round,65537)));
}
function battleBetween(g:Game,a:number,b:number){
 const fs=applyTeamTraits([trainer(g,a).units.filter(u=>u.board).map(u=>makeFighter(u,0)),trainer(g,b).units.filter(u=>u.board).map((u,i)=>makeFighter({...u,uid:-100-i,slot:41-u.slot},1))].flat());
 const session=new BattleSession(makeRecord(fs,g.lobby!.seed^Math.imul(g.round,8191)^Math.imul(a+1,131)^Math.imul(b+1,17),g.round));session.seek(60);return session;
}
function lossDamage(g:Game,session:BattleSession,losingTeam:number){const stage=Number(stageLabel(g.round).split('-')[0]);return 2+stage*2+session.fighters.filter(f=>f.team!==losingTeam&&f.hp>0).reduce((n,f)=>n+f.star,0);}
export function resolveLobbyRound(g:Game,session:BattleSession){
 const lobby=g.lobby!;if(lobby.resolvedRound===g.round)return lobby.lastIncome!;lobby.resolvedRound=g.round;
 const beforeHealth=new Map([g,...lobby.rivals].map((p,i)=>[i,p.health]));
 let playerIncome:ReturnType<typeof payRound>|undefined;
 function settle(id:number,won:boolean|null,damage:number){const p=trainer(g,id);const income=payRound(p,won,damage);if(id===0)playerIncome=income;}
 if(lobby.roundKind==='neutral'){
  settle(0,null,0);if(session.winner===0){g.gold+=2;playerIncome!.income+=2;playerIncome!.neutral=2;}
  for(const bot of lobby.rivals.filter(p=>p.health>0)){payRound(bot,null,0);bot.gold+=2;}
  // Equal component drops, awarded once per neutral round to every surviving trainer.
  const drop=components[Math.floor(seededRandom(lobby.seed^Math.imul(g.round,3571))()*components.length)].id;for(const p of [g,...lobby.rivals.filter(p=>p.health>0)])(p.inventory??=[]).push(drop);
 }else for(const pair of lobby.pairings){
  const human=pair.a===0||!pair.ghost&&pair.b===0,s=human?session:battleBetween(g,pair.a,pair.b),a=human?0:pair.a,b=human?lobby.opponent:pair.b;
  if(s.winner<0){trainer(g,a).streak=0;if(!pair.ghost)trainer(g,b).streak=0;}
  settle(a,s.winner===0,s.winner===0?0:lossDamage(g,s,0));if(!pair.ghost)settle(b,s.winner===1,s.winner===1?0:lossDamage(g,s,1));
  if(s.winner<0){trainer(g,a).streak=0;if(!pair.ghost)trainer(g,b).streak=0;}
  if(a>0)(trainer(g,a) as Rival).lastOpponent=b;if(b>0&&!pair.ghost)(trainer(g,b) as Rival).lastOpponent=a;
 }
 const dead=[...lobby.rivals.filter(p=>p.health<=0&&p.placement===undefined).map(p=>({id:p.id,health:p.health})),...(g.health<=0&&lobby.placement===undefined?[{id:0,health:g.health}]:[])].sort((a,b)=>(beforeHealth.get(a.id)??0)-(beforeHealth.get(b.id)??0)||b.id-a.id);
 let remaining=1+lobby.rivals.filter(p=>p.placement===undefined).length-(lobby.placement?1:0);
 for(const p of dead){if(p.id===0)lobby.placement=remaining;else{const rival=trainer(g,p.id) as Rival;rival.placement=remaining;rival.units=[];rival.shop=[];}remaining--;}
 const complete=g.health<=0||lobby.rivals.every(p=>p.health<=0);
 if(complete&&g.health>0)lobby.placement=1;
 const result={...playerIncome!,complete};lobby.lastIncome=result;lobby.log.unshift({round:g.round,label:stageLabel(g.round),winner:session.winner===0?'You':lobby.roundKind==='neutral'?'Wild Pokémon':trainerName(g,lobby.opponent),damage:result.loss});lobby.log=lobby.log.slice(0,20);return result;
}
export function trainerName(g:Game,id:number){return id===0?'You':g.lobby!.rivals.find(p=>p.id===id)?.name??'Wild Pokémon';}
export function advanceLobbyRound(g:Game){if(g.lobby!.placement)return 'complete';g.round++;prepareLobbyRound(g);return 'ready';}
function prepareDraft(g:Game){
 const lobby=g.lobby!,rng=seededRandom(lobby.seed^Math.imul(g.round,99991)),tier=Math.min(5,2+Math.floor((g.round-7)/7));
 lobby.draftOffers=[];for(let i=0;i<8;i++){const candidates=dex.filter(s=>s.cost<=tier&&s.cost>=Math.max(1,tier-1)&&remainingCopies(g,s.id)>0);const pick=candidates[Math.floor(rng()*candidates.length)];lobby.draftOffers.push(pick?.id??null);}
 lobby.draftOrder=[{id:0,health:g.health},...lobby.rivals.filter(p=>p.health>0)].sort((a,b)=>a.health-b.health||a.id-b.id).map(p=>p.id);lobby.draftCursor=0;draftBotsUntilHuman(g);
}
function acquireDraft(g:Game,id:number,index:number){const p=trainer(g,id),speciesId=g.lobby!.draftOffers[index];if(!speciesId)return false;
 const slot=Array.from({length:9},(_,i)=>i).find(i=>!p.units.some(u=>!u.board&&u.slot===i)),copies=p.units.filter(u=>u.species===speciesId&&u.star===1);
 if(slot===undefined&&copies.length<2){if(id===0)return false;p.gold+=species(speciesId).cost;}else{p.units.push({uid:p.nextId++,species:speciesId,star:1,slot:slot??0,board:false});merge(p);}
 g.lobby!.draftOffers[index]=null;return true;
}
function draftBotsUntilHuman(g:Game){const lobby=g.lobby!;while(lobby.draftCursor<lobby.draftOrder.length&&lobby.draftOrder[lobby.draftCursor]!==0){const bot=trainer(g,lobby.draftOrder[lobby.draftCursor]) as Rival,index=lobby.draftOffers.map((id,i)=>({id,i})).filter(x=>x.id).sort((a,b)=>Number(species(b.id!).types.some(t=>bot.preferred.includes(t)))-Number(species(a.id!).types.some(t=>bot.preferred.includes(t)))||species(b.id!).cost-species(a.id!).cost)[0]?.i;if(index!==undefined)acquireDraft(g,bot.id,index);lobby.draftCursor++;}}
export function claimDraft(g:Game,index:number){const lobby=g.lobby!;if(lobby.roundKind!=='draft'||lobby.draftOrder[lobby.draftCursor]!==0||!acquireDraft(g,0,index))return false;lobby.draftCursor++;draftBotsUntilHuman(g);lobby.draftOffers=[];lobby.resolvedRound=g.round;return true;}
