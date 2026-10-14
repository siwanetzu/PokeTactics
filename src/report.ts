import {spriteURL} from './sprites.ts';
import {species,type Fighter} from './engine.ts';
import {skills} from './skills.ts';

export function battleReportHTML(fighters:Fighter[]) {
 return [0,1].map(team=>`<h3>${team?'Opponent':'Your team'}</h3><div class="full-report">${fighters.filter(f=>f.team===team).sort((a,b)=>b.damage-a.damage).map(f=>`<div><img class="sprite" src="${spriteURL(f.species)}" alt="${species(f.species).name}"><div><strong>${species(f.species).name} <small>${f.role}</small></strong><p>${Math.round(f.damage)} health damage · ${Math.round(f.healing)} healing<br>${Math.round(f.shielding)} shields generated · ${Math.round(f.absorbed)} damage absorbed<br>${skills[f.species].name}: ${f.casts} cast${f.casts===1?'':'s'} · ${f.control.toFixed(1)}s control</p><p>${Object.entries(f.healingTargets).map(([uid,amount])=>{const target=fighters.find(t=>t.uid===Number(uid));return `${target?species(target.species).name:'Ally'}${Number(uid)===f.uid?' (self)':''}: ${Math.round(amount)} healed`;}).join(' · ')||'No targeted healing'}<br>${Math.round(Math.max(0,f.healing-Object.values(f.healingTargets).reduce((n,x)=>n+x,0)))} passive regeneration</p></div></div>`).join('')}</div>`).join('');
}
