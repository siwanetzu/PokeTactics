import {species,type Fighter} from './engine.ts';
import {spriteURL} from './sprites.ts';
export type MeterMetric='damage'|'healing';
export function meterRows(fighters:Fighter[],team:number,metric:MeterMetric){
 const members=fighters.filter(f=>f.team===team),total=members.reduce((n,f)=>n+Math.max(0,f[metric]),0),peak=Math.max(0,...members.map(f=>f[metric]));
 return members.map(f=>({uid:f.uid,species:f.species,star:f.star,alive:f.hp>0,value:Math.max(0,f[metric]),share:total>0?Math.max(0,f[metric])/total:0,bar:peak>0?Math.max(0,f[metric])/peak:0})).sort((a,b)=>b.value-a.value||Math.abs(a.uid)-Math.abs(b.uid)||a.uid-b.uid);
}
export function mountBattleMeter(host:HTMLElement,inspect:(uid:number)=>void){
 let metric:MeterMetric='damage',team=0,collapsed=false,lastFighters:Fighter[]=[],lastStatus={visible:false,seconds:0,state:'LIVE'};
 host.innerHTML=`<div class="meter-heading"><strong>COMBAT</strong><span id="meter-state"></span><button id="meter-collapse" aria-label="Collapse combat meter" aria-expanded="true">−</button></div><div class="meter-body"><div class="meter-controls"><div role="group" aria-label="Combat meter statistic"><button data-meter-metric="damage" aria-pressed="true">Damage</button><button data-meter-metric="healing" aria-pressed="false">Healing</button></div><button id="meter-team" aria-label="Show opponent meter">Your team ⇄</button></div><div class="meter-summary"><span id="meter-description"></span><strong id="meter-total"></strong></div><div id="meter-rows"></div></div>`;
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const rowNodes=new Map<number,HTMLButtonElement>();
 function render(){
  host.classList.toggle('hidden',!lastStatus.visible);if(!lastStatus.visible)return;
  host.dataset.metric=metric;host.dataset.team=String(team);host.dataset.seconds=String(lastStatus.seconds);host.classList.toggle('collapsed',collapsed);
  get('meter-state').textContent=`${lastStatus.state} · ${lastStatus.seconds.toFixed(1)}s`;
  const collapse=get('meter-collapse');collapse.textContent=collapsed?'+':'−';collapse.setAttribute('aria-label',`${collapsed?'Expand':'Collapse'} combat meter`);collapse.setAttribute('aria-expanded',String(!collapsed));
  get('meter-team').textContent=team?'Opponent ⇄':'Your team ⇄';get('meter-team').setAttribute('aria-label',team?'Show your team meter':'Show opponent meter');
  host.querySelectorAll<HTMLElement>('[data-meter-metric]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.meterMetric===metric)));
  get('meter-description').textContent=metric==='damage'?'Health damage':'Effective healing';get('meter-description').title=metric==='damage'?'Health damage dealt; shield absorption excluded.':'Actual health restored, including self-healing and regeneration. Overhealing excluded.';
  const rows=meterRows(lastFighters,team,metric),total=rows.reduce((sum,r)=>sum+r.value,0);get('meter-total').textContent=Math.round(total).toLocaleString('en-GB');get('meter-total').dataset.value=String(total);
  const active=new Set(rows.map(r=>r.uid));for(const [uid,node] of rowNodes)if(!active.has(uid)){node.remove();rowNodes.delete(uid);}
  rows.forEach((row,index)=>{let node=rowNodes.get(row.uid);if(!node){node=document.createElement('button');node.className='meter-row';node.dataset.meterUid=String(row.uid);node.innerHTML='<img alt=""><div class="meter-row-content"><div><span class="meter-name"></span><strong class="meter-value"></strong></div><div class="meter-track"><i></i></div></div>';rowNodes.set(row.uid,node);}
   const name=species(row.species).name,formatted=Math.round(row.value).toLocaleString('en-GB');node.dataset.value=String(row.value);node.dataset.rank=String(index+1);node.classList.toggle('knocked-out',!row.alive);node.setAttribute('aria-label',`Inspect ${name}: ${formatted} ${metric}`);node.title=`${name} · ${Math.round(row.share*100)}% of team ${metric}${!row.alive?' · Knocked out':''}`;
   const img=node.querySelector('img')!;if(img.dataset.species!==String(row.species)){img.src=spriteURL(row.species);img.dataset.species=String(row.species);}
   node.querySelector('.meter-name')!.textContent=`${index===0&&row.value>0?'♛ ':''}${name}${!row.alive?' · KO':''}`;node.querySelector('.meter-value')!.textContent=formatted;(node.querySelector('.meter-track i') as HTMLElement).style.width=`${row.bar*100}%`;
   // Move existing rows only when ranks change; keep keyboard focus and sprite animations stable.
   const parent=get('meter-rows');if(parent.children[index]!==node){const focused=document.activeElement===node;parent.insertBefore(node,parent.children[index]??null);if(focused)node.focus({preventScroll:true});}
  });
  host.parentElement?.style.setProperty('--meter-inspection-top',`${104+host.offsetHeight}px`);
 }
 host.onclick=e=>{const button=(e.target as Element).closest<HTMLElement>('button');if(!button)return;if(button.dataset.meterMetric){metric=button.dataset.meterMetric as MeterMetric;render();}else if(button.id==='meter-team'){team=1-team;render();}else if(button.id==='meter-collapse'){collapsed=!collapsed;render();}else if(button.dataset.meterUid)inspect(Number(button.dataset.meterUid));};
 return {update(fighters:Fighter[],status:typeof lastStatus){lastFighters=fighters;lastStatus=status;render();}};
}
