import {spriteURL} from './sprites.ts';
import {cell,enemies,species,synergies,type Game} from './engine.ts';
import {trainer,trainerName} from './lobby.ts';
import {encounter} from './campaign.ts';
import {traitText} from './traits.ts';
export function scoutingHTML(round:number){
 const e=encounter(round),units=enemies(round),tiles=Array.from({length:21},(_,slot)=>{const p=cell(slot);return `<rect x="${10+p.x*52}" y="${12+p.y*58}" width="46" height="46" rx="6" fill="#493b49" stroke="#776579"/><text x="${17+p.x*52}" y="${52+p.y*58}" fill="#a89db1" font-size="8">${slot}</text>`;}).join('');
 return `<h3>${e.name} · Round ${round}</h3><p>${e.identity}. ${e.hint}</p><svg viewBox="0 0 390 172" role="img" aria-label="Scouted opponent positions">${tiles}${units.map(u=>{const p=cell(u.slot);return `<image href="${spriteURL(u.species)}" x="${10+p.x*52}" y="${8+p.y*58}" width="46" height="44"/>`;}).join('')}</svg><p>${units.map(u=>`${species(u.species).name} ${'★'.repeat(u.star)} · hex ${u.slot}`).join('<br>')}</p><div>${synergies(units).map(([kind,count])=>`<p><strong>${kind} ${count}</strong> · ${traitText(kind,count)}</p>`).join('')}</div>`;
}
export function lobbyScoutingHTML(g:Game,id:number){
 const p=trainer(g,id),units=p.units.filter(u=>u.board),tiles=Array.from({length:21},(_,i)=>{const slot=21+i,pos=cell(slot);return `<rect x="${10+pos.x*52}" y="${12+(pos.y-2.58)*58}" width="46" height="46" rx="6" fill="#354550" stroke="#708477"/><text x="${17+pos.x*52}" y="${52+(pos.y-2.58)*58}" fill="#a89db1" font-size="8">${slot}</text>`;}).join('');
 return `<h3>${trainerName(g,id)} · ${p.health} HP · level ${p.level}</h3><p>${p.health<=0?'Eliminated; copies returned to the pool.':`${p.gold} gold · ${p.units.filter(u=>!u.board).length} benched · ${Math.abs(p.streak)} ${p.streak<0?'loss':'win'} streak`}</p><svg viewBox="0 0 400 178" role="img" aria-label="Scouted trainer positions">${tiles}${units.map(u=>{const pos=cell(u.slot);return `<image href="${spriteURL(u.species)}" x="${10+pos.x*52}" y="${8+(pos.y-2.58)*58}" width="46" height="44"/>`;}).join('')}</svg><p>${units.map(u=>`${species(u.species).name} ${'★'.repeat(u.star)} · hex ${u.slot}`).join('<br>')||'No deployed units.'}</p>${synergies(units).map(([kind,count])=>`<p><strong>${kind} ${count}</strong> · ${traitText(kind,count)}</p>`).join('')}<h3>Bench</h3><p>${p.units.filter(u=>!u.board).map(u=>`${species(u.species).name} ${'★'.repeat(u.star)}`).join(' · ')||'Empty'}</p>`;
}
