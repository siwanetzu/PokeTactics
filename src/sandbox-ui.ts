import {spriteURL} from './sprites.ts';
import {battleReportHTML} from './report.ts';
import {spriteFacing} from './facing.ts';
import {skills,skillRules} from './skills.ts';
import {roles,manaRules} from './traits.ts';
import {SandboxLab,sandboxRosters,sandboxLayouts,mixedGuides,formationSlots,moveSandbox,sandboxFighters,type SandboxTeam,type SandboxFormation} from './sandbox.ts';
import {cell,species,colors,type Fighter} from './engine.ts';
import {elementGuides} from './traits.ts';
import {renderAttackEffects} from './effects.ts';
const lab=new SandboxLab();
const point=(x:number,y:number)=>({x:60+x*88,y:50+y*88});
const names=Object.keys(sandboxRosters) as SandboxTeam[];
const forms=Object.keys(sandboxLayouts) as SandboxFormation[];
const labels={screen:'Screened carries',spread:'Wide frontline',clump:'Compact formation',exposed:'Exposed carries',protected:'Protected backline',staggered:'Staggered support',compactMixed:'Compact mixed',split:'Split wings',triangle:'Support triangle',rightSupport:'Right-side healers',rearLeft:'Rear-left healers'};
export function mountSandbox(host:HTMLElement){
 lab.edit();let selected:{team:number;index:number}|null=null,paused=false,playing=false,rate=3,last=0,historySignature='';
 host.innerHTML=`<small class="eyebrow">REPEATABLE MATCHUPS</small><h2>Battle sandbox</h2><p class="sandbox-intro">Pick two 8-gold squads. Click a Pokémon, then a hex on its side to move or swap it. Keep the seed unchanged to compare positioning.</p>
 <div class="sandbox-pickers">${[0,1].map(team=>`<div class="sandbox-team-picker"><strong>${team?'RED · OPPONENT':'BLUE · YOUR TEAM'}</strong><label>Team<select id="sandbox-team-${team}" aria-label="${team?'Red':'Blue'} team">${names.map(name=>`<option>${name}</option>`).join('')}</select></label><label>Formation<select id="sandbox-form-${team}" aria-label="${team?'Red':'Blue'} formation">${forms.map(name=>`<option value="${name}">${labels[name]}</option>`).join('')}<option value="custom" disabled>Custom positioning</option></select></label><p id="sandbox-guide-${team}"></p></div>`).join('')}</div>
 <div class="sandbox-options"><label>Seed<input id="sandbox-seed" aria-label="Battle seed" type="number" min="0" max="4294967295" step="1" value="${lab.config.seed}"></label><label>Stars<select id="sandbox-stars" aria-label="Both teams star level">${[1,2,3].map(n=>`<option value="${n}">${n} ★</option>`).join('')}</select></label><label>Speed<select id="sandbox-speed" aria-label="Sandbox speed"><option value="1">1×</option><option value="3" selected>3×</option><option value="6">6×</option></select></label></div>
 <div class="sandbox-actions"><button id="sandbox-run">Run fight</button><button id="sandbox-replay">Replay last fight</button><button id="sandbox-pause">Pause</button><button id="sandbox-finish">Finish instantly</button><button id="sandbox-edit">Edit positioning</button></div>
 <div id="sandbox-status" class="sandbox-status" role="status"></div><div id="sandbox-board" class="sandbox-board"><div id="sandbox-inner"><div id="sandbox-tiles"></div><div id="sandbox-effects"></div></div></div>
 <div id="sandbox-metrics" class="sandbox-metrics"></div><details id="sandbox-report"><summary>Detailed battle report</summary><div id="sandbox-report-content"></div></details><h3>Fight comparisons</h3><p class="sandbox-hint">Results retain the original seed, positions and checksum. Replay any saved fight below, even after editing your teams. Your adventure is unaffected.</p><div id="sandbox-history" class="sandbox-history"></div>`;
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const select=(id:string)=>get(id) as HTMLSelectElement;
 function resetEdit(){lab.edit();playing=false;paused=false;selected=null;render();}
 function syncPickers(){for(const team of [0,1]){select(`sandbox-team-${team}`).value=lab.config.teams[team];const matched=forms.find(form=>JSON.stringify(formationSlots(form,team))===JSON.stringify(lab.config.slots[team]));select(`sandbox-form-${team}`).value=matched??'custom';const name=lab.config.teams[team];get(`sandbox-guide-${team}`).textContent=name in mixedGuides?mixedGuides[name as keyof typeof mixedGuides]:elementGuides[name as keyof typeof elementGuides]!.counter;}select('sandbox-stars').value=String(lab.config.star);}
 for(const team of [0,1]){
  select(`sandbox-team-${team}`).onchange=()=>{lab.config.teams[team]=select(`sandbox-team-${team}`).value as SandboxTeam;resetEdit();syncPickers();};
  select(`sandbox-form-${team}`).onchange=()=>{lab.config.slots[team]=formationSlots(select(`sandbox-form-${team}`).value as SandboxFormation,team);resetEdit();syncPickers();};
 }
 select('sandbox-stars').onchange=()=>{lab.config.star=Number(select('sandbox-stars').value);resetEdit();};
 select('sandbox-speed').onchange=()=>rate=Number(select('sandbox-speed').value);
 get('sandbox-seed').onchange=()=>{lab.config.seed=Number((get('sandbox-seed') as HTMLInputElement).value);resetEdit();};
 get('sandbox-run').onclick=()=>{try{const value=(get('sandbox-seed') as HTMLInputElement).value;if(!value.trim())throw new Error('Enter a seed from 0 to 4294967295.');lab.config.seed=Number(value);lab.start();playing=true;paused=false;selected=null;render();}catch(error){get('sandbox-status').textContent=(error as Error).message;}};
 function replay(index=0){if(!lab.replay(index))return;playing=true;paused=false;selected=null;render();}
 get('sandbox-replay').onclick=()=>replay();
 get('sandbox-pause').onclick=()=>{paused=!paused;render();};
 get('sandbox-finish').onclick=()=>{lab.finish();playing=false;paused=false;render();};
 get('sandbox-edit').onclick=resetEdit;
 function choose(target:Element){if(lab.session)return;const actor=target.closest('[data-sandbox-unit]');if(actor){const team=Number(actor.getAttribute('data-team')),index=Number(actor.getAttribute('data-index'));if(selected&&selected.team===team&&selected.index!==index){moveSandbox(lab.config,team,selected.index,lab.config.slots[team][index]);selected=null;syncPickers();}else selected=selected?.team===team&&selected.index===index?null:{team,index};render();return;}const tile=target.closest('[data-sandbox-slot]');if(tile&&selected){if(moveSandbox(lab.config,selected.team,selected.index,Number(tile.getAttribute('data-sandbox-slot')))){selected=null;syncPickers();render();}else get('sandbox-status').textContent='Choose a hex on the selected Pokémon’s own side.';}}
 get('sandbox-board').onclick=e=>choose(e.target as Element);
 get('sandbox-board').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(e.target as Element);}};
 get('sandbox-history').onclick=e=>{const button=(e.target as Element).closest('[data-sandbox-replay]');if(button)replay(Number(button.getAttribute('data-sandbox-replay')));};
 function summary(fs:Fighter[],team:number){const alive=fs.filter(f=>f.team===team&&f.hp>0);return `${alive.length}/4 alive · ${Math.round(alive.reduce((sum,f)=>sum+f.hp,0))} HP`;}
 function render(){
  let fs:Fighter[];try{fs=lab.session?.fighters??sandboxFighters(lab.config);}catch{get('sandbox-status').textContent='Enter a whole-number seed from 0 to 4294967295.';return;}
  const active=!!lab.session&&!lab.session.done;host.querySelectorAll<HTMLInputElement|HTMLSelectElement>('.sandbox-pickers select,.sandbox-options input,#sandbox-stars').forEach(el=>el.disabled=active);
  (get('sandbox-run') as HTMLButtonElement).disabled=active;(get('sandbox-replay') as HTMLButtonElement).disabled=!lab.history.length||active;(get('sandbox-pause') as HTMLButtonElement).disabled=!active;(get('sandbox-finish') as HTMLButtonElement).disabled=!active;get('sandbox-pause').textContent=paused?'Resume':'Pause';
  const s=lab.session,config=s? s.record.initial:fs;
  const teamName=(team:number)=>sandboxTeamsName(config,team);
  get('sandbox-status').textContent=s?(s.done?`${s.winner<0?'Draw':s.winner?'RED '+teamName(1)+' wins':'BLUE '+teamName(0)+' wins'} · ${s.seconds.toFixed(2)}s · seed ${s.record.seed} · ${lab.replaying?(lab.verified?'VERIFIED REPLAY':'REPLAY MISMATCH'):s.result().checksum}`:`${paused?'Paused':'Fighting'} · ${s.seconds.toFixed(1)}s · seed ${s.record.seed}${lab.replaying?' · replay':''}`):selected?`Selected ${species(sandboxRosters[lab.config.teams[selected.team]][selected.index]).name}. Click a ${selected.team?'red':'blue'} hex to move or swap.`:'Ready · blue below, red above · seed '+lab.config.seed;
  const tiles=Array.from({length:42},(_,slot)=>{const p=point(cell(slot).x,cell(slot).y),points=Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180;return `${p.x+Math.cos(a)*49},${p.y+Math.sin(a)*49}`;}).join(' '),own=selected&&(selected.team?slot<21:slot>=21);return `<g data-sandbox-slot="${slot}" role="button" tabindex="${s?-1:0}" aria-label="${slot<21?'Red':'Blue'} hex ${slot}"><polygon points="${points}" fill="${own?'#465e57':slot<21?'#493b49':'#353e52'}" stroke="#777185" stroke-width="1.5"/><text x="${p.x}" y="${p.y+29}" text-anchor="middle" fill="#a99fb3" font-size="9">${slot}</text></g>`;}).join('');
  const actors=fs.filter(f=>f.hp>0).map(f=>{const p=point(f.x,f.y),index=Math.abs(f.uid)-1,isSelected=selected?.team===f.team&&selected.index===index,color=f.team?'#e69ca6':'#a1d79a';return `<g data-sandbox-unit="${f.uid}" data-team="${f.team}" data-index="${index}" role="button" tabindex="${s?-1:0}" aria-label="${f.team?'Red':'Blue'} ${species(f.species).name}, hex ${f.slot}"><title>${species(f.species).name}: ${skillRules(f.species)} ${manaRules(roles[f.species])}</title>${isSelected?`<ellipse cx="${p.x}" cy="${p.y}" rx="31" ry="25" fill="none" stroke="#ffe2a0" stroke-width="3"/>`:''}<rect x="${p.x-23}" y="${p.y-36}" width="46" height="4" fill="#171926"/><rect x="${p.x-23}" y="${p.y-36}" width="${46*f.hp/f.maxHp}" height="4" fill="${color}"/><rect x="${p.x-23}" y="${p.y-30}" width="${46*Math.min(1,f.mana/skills[f.species].mana)}" height="2" fill="#92bcff"/><image href="${spriteURL(f.species)}" x="${p.x-27}" y="${p.y-27}" width="54" height="49" transform="translate(${p.x} 0) scale(${spriteFacing(f,fs,s?.hits??[])} 1) translate(${-p.x} 0)" style="image-rendering:pixelated"/><text x="${p.x}" y="${p.y+20}" text-anchor="middle" fill="${color}" font-size="9">${species(f.species).name}${f.shield>0?' ◈':''}</text></g>`;}).join('');
  get('sandbox-tiles').innerHTML=`<svg viewBox="0 0 700 480" width="700" height="480">${tiles}${actors}</svg>`;
  get('sandbox-effects').innerHTML=renderAttackEffects(s?.hits??[],point,700,480,49);
  get('sandbox-metrics').innerHTML=[0,1].map(team=>`<div><strong>${team?'RED':'BLUE'} · ${teamName(team)}</strong><span>${summary(fs,team)}</span><small>${Math.round(fs.filter(f=>f.team===team).reduce((sum,f)=>sum+f.damage,0))} damage · ${Math.round(fs.filter(f=>f.team===team).reduce((sum,f)=>sum+f.healing,0))} healing</small></div>`).join('');
  if(s?.done)get('sandbox-report-content').innerHTML=battleReportHTML(fs);else get('sandbox-report-content').innerHTML='<p>Finish a fight to inspect casts, healing targets and shields.</p>';
  const signature=lab.history.map(h=>h.record.result!.checksum).join('|');if(signature!==historySignature||!get('sandbox-history').innerHTML){historySignature=signature;get('sandbox-history').innerHTML=lab.history.map((h,i)=>`<button data-sandbox-replay="${i}" aria-label="Replay comparison ${i+1}"><strong>${h.config.teams[0]} vs ${h.config.teams[1]} · ${h.record.result!.winner<0?'Draw':h.config.teams[h.record.result!.winner]+' wins'}</strong><span>${(h.record.result!.steps/60).toFixed(2)}s · seed ${h.record.seed} · ${h.config.star}★ · ${h.record.result!.checksum}</span><small>Blue: ${h.config.slots[0].join(', ')} · Red: ${h.config.slots[1].join(', ')}</small><em>Replay →</em></button>`).join('')||'<p>No fights yet. Run a matchup to start comparing.</p>';}
 }
 function sandboxTeamsName(fs:Fighter[],team:number){const ids=fs.filter(f=>f.team===team).map(f=>f.species);return names.find(name=>sandboxRosters[name].every(id=>ids.includes(id)))??lab.config.teams[team];}
 const observer=new ResizeObserver(()=>{get('sandbox-inner').style.transform=`scale(${get('sandbox-board').clientWidth/700})`;});observer.observe(get('sandbox-board'));
 syncPickers();render();
 function frame(time:number){if(!host.isConnected||host.closest('.hidden')){observer.disconnect();return;}const dt=Math.min(.25,(time-last)/1000||0);last=time;if(playing&&!paused){lab.advance(dt*rate);if(lab.session?.done)playing=false;render();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
}
