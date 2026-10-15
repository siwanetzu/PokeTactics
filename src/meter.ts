import {species,type Fighter} from './engine.ts';
import {spriteURL} from './sprites.ts';
export type MeterMetric='damage'|'healing'|'taken'|'shielding';
export const meterMetrics:Record<MeterMetric,{tab:string;label:string;description:string;hint:string}>={
 damage:{tab:'Damage',label:'Damage',description:'Health damage',hint:'Health damage dealt; shield absorption excluded.'},
 healing:{tab:'Healing',label:'Healing',description:'Effective healing',hint:'Actual health restored, including self-healing and regeneration. Overhealing excluded.'},
 taken:{tab:'Taken',label:'Damage taken',description:'Health damage taken',hint:'Cumulative health lost after shields, including damage later healed. Shield absorption is excluded.'},
 shielding:{tab:'Shielding',label:'Shielding',description:'Shields generated',hint:'Opening shields and additional shield gained from abilities. Refreshes count only the increase; absorbed shows actual damage prevented.'}
};
export function meterValue(f:Fighter,fighters:Fighter[],metric:MeterMetric,initial:Fighter[]=[]){
 if(metric!=='taken')return Math.max(0,f[metric]);
 const start=initial.find(i=>i.uid===f.uid),startHp=start?.hp??f.maxHp;
 const received=fighters.reduce((sum,source)=>sum+(source.healingTargets[f.uid]??0),0)-initial.reduce((sum,source)=>sum+(source.healingTargets[f.uid]??0),0);
 const passive=f.healing-Object.values(f.healingTargets).reduce((a,b)=>a+b,0)-(start?start.healing-Object.values(start.healingTargets).reduce((a,b)=>a+b,0):0);
 // Health conservation includes effective incoming healing and own passive regeneration, not outgoing heals.
 return Math.max(0,startHp-f.hp+received+passive);
}
export function meterRows(fighters:Fighter[],team:number,metric:MeterMetric,initial:Fighter[]=[]){
 const values=fighters.filter(f=>f.team===team).map(f=>({f,value:meterValue(f,fighters,metric,initial)})),total=values.reduce((n,r)=>n+r.value,0),peak=Math.max(0,...values.map(r=>r.value));
 return values.map(({f,value})=>({uid:f.uid,species:f.species,star:f.star,alive:f.hp>0,value,share:total>0?value/total:0,bar:peak>0?value/peak:0})).sort((a,b)=>b.value-a.value||Math.abs(a.uid)-Math.abs(b.uid)||a.uid-b.uid);
}
export function mountBattleMeter(host:HTMLElement,inspect:(uid:number)=>void){
 let metric:MeterMetric='damage',team=0,collapsed=false,lastFighters:Fighter[]=[],lastInitial:Fighter[]=[],lastStatus={visible:false,seconds:0,state:'LIVE'};
 host.innerHTML=`<div class="meter-heading"><strong>COMBAT</strong><button id="meter-team" aria-label="Show opponent meter">Your team ⇄</button><span id="meter-state"></span><button id="meter-collapse" aria-label="Collapse combat meter" aria-expanded="true">−</button></div><div class="meter-body"><div class="meter-controls"><div role="group" aria-label="Combat meter statistic">${Object.entries(meterMetrics).map(([id,info])=>`<button data-meter-metric="${id}" aria-label="${info.label}" title="${info.hint}" aria-pressed="${id==='damage'}">${info.tab}</button>`).join('')}</div></div><div class="meter-summary"><span id="meter-description"></span><strong id="meter-total"></strong></div><div id="meter-rows"></div><small id="meter-extra"></small></div>`;
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const rowNodes=new Map<number,HTMLButtonElement>();
 function render(){
  host.classList.toggle('hidden',!lastStatus.visible);if(!lastStatus.visible)return;
  host.dataset.metric=metric;host.dataset.team=String(team);host.dataset.seconds=String(lastStatus.seconds);host.classList.toggle('collapsed',collapsed);
  get('meter-state').textContent=`${lastStatus.state} · ${lastStatus.seconds.toFixed(1)}s`;
  const collapse=get('meter-collapse');collapse.textContent=collapsed?'+':'−';collapse.setAttribute('aria-label',`${collapsed?'Expand':'Collapse'} combat meter`);collapse.setAttribute('aria-expanded',String(!collapsed));
  get('meter-team').textContent=team?'Opponent ⇄':'Your team ⇄';get('meter-team').setAttribute('aria-label',team?'Show your team meter':'Show opponent meter');
  host.querySelectorAll<HTMLElement>('[data-meter-metric]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.meterMetric===metric)));
  const info=meterMetrics[metric];get('meter-description').textContent=info.description;get('meter-description').title=info.hint;
  const rows=meterRows(lastFighters,team,metric,lastInitial),total=rows.reduce((sum,r)=>sum+r.value,0);get('meter-total').textContent=Math.round(total).toLocaleString('en-GB');get('meter-total').dataset.value=String(total);
  const teamFighters=lastFighters.filter(f=>f.team===team),absorbed=teamFighters.reduce((n,f)=>n+f.absorbed,0),remaining=teamFighters.filter(f=>f.hp>0).reduce((n,f)=>n+f.shield,0);get('meter-extra').textContent=metric==='shielding'?`${Math.round(absorbed).toLocaleString('en-GB')} absorbed · ${Math.round(remaining).toLocaleString('en-GB')} remaining`:metric==='taken'?'Health lost after shields, including healed damage':metric==='healing'?'Includes self-healing and regeneration':'Shield absorption excluded';
  const active=new Set(rows.map(r=>r.uid));for(const [uid,node] of rowNodes)if(!active.has(uid)){node.remove();rowNodes.delete(uid);}
  rows.forEach((row,index)=>{let node=rowNodes.get(row.uid);if(!node){node=document.createElement('button');node.className='meter-row';node.dataset.meterUid=String(row.uid);node.innerHTML='<img alt=""><div class="meter-row-content"><div><span class="meter-name"></span><strong class="meter-value"></strong></div><div class="meter-track"><i></i></div></div>';rowNodes.set(row.uid,node);}
   const name=species(row.species).name,formatted=Math.round(row.value).toLocaleString('en-GB');node.dataset.value=String(row.value);node.dataset.rank=String(index+1);node.classList.toggle('knocked-out',!row.alive);node.setAttribute('aria-label',`Inspect ${name}: ${formatted} ${info.label.toLowerCase()}`);node.title=`${name} · ${Math.round(row.share*100)}% of team ${info.label.toLowerCase()}${!row.alive?' · Knocked out':''}`;
   if(metric==='shielding'||metric==='taken'){const fighter=lastFighters.find(f=>f.uid===row.uid)!;node.title+=` · ${Math.round(fighter.absorbed).toLocaleString('en-GB')} damage absorbed by shields${metric==='shielding'?` · ${Math.round(fighter.hp>0?fighter.shield:0).toLocaleString('en-GB')} shield remaining`: ' (excluded)'}`;}
   const img=node.querySelector('img')!;if(img.dataset.species!==String(row.species)){img.src=spriteURL(row.species);img.dataset.species=String(row.species);}
   node.querySelector('.meter-name')!.textContent=`${index===0&&row.value>0?'♛ ':''}${name}${!row.alive?' · KO':''}`;node.querySelector('.meter-value')!.textContent=formatted;(node.querySelector('.meter-track i') as HTMLElement).style.width=`${row.bar*100}%`;
   // Move existing rows only when ranks change; keep keyboard focus and sprite animations stable.
   const parent=get('meter-rows');if(parent.children[index]!==node){const focused=document.activeElement===node;parent.insertBefore(node,parent.children[index]??null);if(focused)node.focus({preventScroll:true});}
  });
  host.parentElement?.style.setProperty('--meter-inspection-top',`${104+host.offsetHeight}px`);
 }
 host.onclick=e=>{const button=(e.target as Element).closest<HTMLElement>('button');if(!button)return;if(button.dataset.meterMetric){metric=button.dataset.meterMetric as MeterMetric;render();}else if(button.id==='meter-team'){team=1-team;render();}else if(button.id==='meter-collapse'){collapsed=!collapsed;render();}else if(button.dataset.meterUid)inspect(Number(button.dataset.meterUid));};
 return {update(fighters:Fighter[],status:typeof lastStatus,initial:Fighter[]=[]){lastFighters=fighters;lastInitial=initial;lastStatus=status;render();}};
}
