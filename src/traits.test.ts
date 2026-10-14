import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {applyTeamTraits,makeFighter,tick,synergies,type Fighter} from './engine.ts';
import {roles,traits,traitTier} from './traits.ts';
const unit=(id:number,species:number,slot:number,team=0)=>makeFighter({uid:id,species,slot,star:1,board:true},team);
test('trait tiers count distinct deployed species, separately for both teams',()=>{
 const fs=applyTeamTraits([unit(1,25,21),unit(2,25,22),unit(3,81,23),unit(4,26,24),unit(5,25,0,1)]);
 assert.equal(fs[0].bonuses.Electric,2);assert.equal(fs[4].bonuses.Electric,undefined);assert.equal(traitTier('Electric',1),0);
 assert.equal(synergies([{uid:1,species:25,star:1,slot:0,board:false}]).length,0);
});
test('Water starts shielded, Grass regenerates, and Casters start charged',()=>{
 const water=applyTeamTraits([unit(1,7,21),unit(2,54,22)]);assert.equal(water[0].shield,water[0].maxHp*.15);
 const grass=applyTeamTraits([unit(1,1,21),unit(2,43,22)]);grass[0].hp-=100;const hp=grass[0].hp;tick(grass,.5,[],()=>.5);assert.ok(grass[0].hp>hp);assert.ok(grass[0].healing>0);
 const caster=applyTeamTraits([unit(1,63,21)])[0];assert.equal(caster.mana,15);
});
test('Electric provides extra mana and Normal accelerates basic attacks',()=>{
 const fs=applyTeamTraits([unit(1,25,21),unit(2,81,22),unit(3,143,14,1)]);fs[0].cooldown=0;tick(fs,.01,[],()=>.5);assert.equal(fs[0].mana,15);
 const normal=applyTeamTraits([unit(1,52,21),unit(2,133,22),unit(3,143,14,1)]);normal[0].cooldown=0;tick(normal,.01,[],()=>.5);assert.ok(normal[0].cooldown<.9);
});
test('Fire and Poison perks attach distinct status effects at impact',()=>{
 const fs=applyTeamTraits([unit(1,4,21),unit(2,58,22),unit(3,1,23),unit(4,43,24),unit(5,143,14,1)]);for(const f of fs)f.cooldown=999;
 fs[0].mana=120;fs[0].cooldown=0;tick(fs,.01,[],()=>.5);tick(fs,.62,[],()=>.5);assert.ok(fs[4].statuses.some(s=>s.kind==='burn'&&s.power>=fs[0].atk*.35));
 fs[2].slot=21;fs[0].slot=23;fs[2].mana=120;fs[2].cooldown=0;tick(fs,.01,[],()=>.5);tick(fs,.62,[],()=>.5);assert.ok(fs[4].statuses.some(s=>s.kind==='poison'&&s.healingCut===.25));
});
test('every roster role and all eight distinct traits have explicit combat identities',()=>{assert.equal(Object.keys(traits).length,8);assert.equal(new Set(Object.values(roles)).size,6);assert.equal(new Set(Object.values(traits).map(t=>t.summaries[0])).size,8);});
test('Rock reduces direct damage and Psychic increases ability damage',()=>{
 const trial=(withRock:boolean)=>{const caster=unit(1,25,21),target=unit(2,95,14,1),other=unit(3,74,15,1);const fs=withRock?applyTeamTraits([caster,target,other]):[caster,target];for(const f of fs)f.cooldown=999;caster.cooldown=0;caster.mana=120;const hits:any[]=[];tick(fs,.01,hits,()=>.5);tick(fs,.62,hits,()=>.5);return hits.find(h=>h.target===2)?.value;};
 assert.ok(trial(true)<trial(false));
 const ability=(active:boolean)=>{const caster=unit(1,63,21),target=unit(2,143,14,1),partner=unit(3,92,22);const fs=active?applyTeamTraits([caster,target,partner]):[caster,target];for(const f of fs)f.cooldown=999;caster.mana=120;caster.cooldown=0;const hits:any[]=[];tick(fs,.01,hits,()=>.5);tick(fs,.62,hits,()=>.5);return hits.find(h=>h.target===2)?.value;};assert.ok(ability(true)>ability(false));
});
test('Disruptors focus charged enemies and Supports heal nearby injured allies',()=>{
 const disruptor=unit(1,54,21),nearest=unit(2,143,14,1),charged=unit(3,143,15,1);charged.mana=95;disruptor.cooldown=0;nearest.cooldown=charged.cooldown=999;const hits:any[]=[];tick([disruptor,nearest,charged],.01,hits,()=>.5);assert.equal(hits.find(h=>h.primary)?.target,charged.uid);
 const support=unit(1,43,21),ally=unit(2,7,22),enemy=unit(3,143,14,1);ally.hp-=200;const hp=ally.hp;support.mana=120;support.cooldown=0;ally.cooldown=enemy.cooldown=999;tick([support,ally,enemy],.01,[],()=>.5);tick([support,ally,enemy],.62,[],()=>.5);assert.ok(ally.hp>hp);assert.ok(support.healing>0);
});
test('Poison trait suppresses healing and Bruisers recover health from strikes',()=>{
 const attacker=unit(1,1,21),partner=unit(2,43,22),victim=unit(3,43,14,1);const fs=applyTeamTraits([attacker,partner,victim]);for(const f of fs)f.cooldown=999;attacker.mana=120;attacker.cooldown=0;tick(fs,.01,[],()=>.5);tick(fs,.62,[],()=>.5);assert.equal(victim.statuses.find(s=>s.kind==='poison')?.healingCut,.25);
 const bruiser=unit(1,58,21),enemy=unit(2,143,14,1);bruiser.hp-=100;const before=bruiser.hp;bruiser.cooldown=0;enemy.cooldown=999;tick([bruiser,enemy],.01,[],()=>.5);tick([bruiser,enemy],.35,[],()=>.5);assert.ok(bruiser.hp>before);assert.ok(bruiser.healing>0);
 const heal=(cut:number)=>{const a=unit(1,43,21),b=unit(2,143,14,1);a.hp=100;a.mana=120;a.cooldown=0;b.cooldown=999;a.statuses.push({kind:'poison',time:5,source:b.uid,power:0,pulse:999,healingCut:cut});tick([a,b],.01,[],()=>.5);tick([a,b],.62,[],()=>.5);return a.healing;};assert.ok(heal(0)>0);assert.ok(Math.abs(heal(.25)/heal(0)-.75)<1e-9);
});
