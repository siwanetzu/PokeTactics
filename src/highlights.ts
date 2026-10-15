import {species,type Fighter} from './engine.ts';
import {meterValue} from './meter.ts';
import {spriteURL} from './sprites.ts';
export type HighlightKind='damage'|'healing'|'tank';
export function battleHighlights(fighters:Fighter[],initial:Fighter[]=[]){
 return [0,1].map(team=>({team,leaders:([['damage','Damage dealer'],['healing','Healer'],['tank','Tank']] as const).map(([kind,label])=>{
  const ranked=fighters.filter(f=>f.team===team).map(f=>{const taken=meterValue(f,fighters,'taken',initial),absorbed=f.absorbed;return {uid:f.uid,species:f.species,star:f.star,value:kind==='tank'?taken+absorbed:f[kind],taken,absorbed};}).sort((a,b)=>b.value-a.value||Math.abs(a.uid)-Math.abs(b.uid)||a.uid-b.uid);
  const leader=ranked[0];return {kind:kind as HighlightKind,label,leader:leader&&leader.value>1e-8?leader:null};
 })}));
}
export function highlightsHTML(fighters:Fighter[],initial:Fighter[],seconds:number,winner:number){
 const teams=battleHighlights(fighters,initial),format=(n:number)=>Math.round(n).toLocaleString('en-GB');
 return `<div class="highlight-heading"><strong>BATTLE HIGHLIGHTS</strong><button data-highlight-meter aria-label="Show full combat meter">Meter ↗</button></div><p class="highlight-outcome">${winner===0?'Your team wins':winner===1?'Opponent wins':'Draw'} · ${seconds.toFixed(1)}s</p><div class="highlight-teams"><b>Your team</b><b>Opponent</b></div><div class="highlight-grid">${[0,1,2].flatMap(index=>teams.map(({team,leaders})=>{const {kind,label,leader}=leaders[index],suffix=kind==='tank'?'soaked':kind==='healing'?'healed':'damage',detail=leader?kind==='tank'?`${format(leader.taken)} health damage taken + ${format(leader.absorbed)} shield damage absorbed`:kind==='healing'?'Effective healing, including self-healing and regeneration.':'Health damage dealt, excluding shield absorption.':'';return `<button class="highlight-card ${kind}" data-highlight-team="${team}" data-highlight-kind="${kind}" ${leader?`data-highlight-uid="${leader.uid}" data-highlight-value="${leader.value}" title="${detail}" aria-label="Inspect ${species(leader.species).name}, ${team?'opponent':'your team'} ${label.toLowerCase()}: ${format(leader.value)} ${suffix}"`:'disabled'}><small>${label}</small>${leader?`<span class="highlight-pokemon"><img src="${spriteURL(leader.species)}" alt=""><b>${species(leader.species).name}</b></span><strong>${format(leader.value)} <em>${suffix}</em></strong>`:`<span class="highlight-empty">${kind==='tank'?'No damage soaked':kind==='healing'?'No healing':'No damage'}</span>`}</button>`;})).join('')}</div><p class="highlight-definition">Tank = health damage taken + damage absorbed by shields.</p>`;
}
