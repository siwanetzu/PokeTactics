import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {makeFighter} from './engine.ts';
import {pokemonInspectionHTML,itemInspectionHTML} from './inspection.ts';
test('inspection uses the live fighter health, shield, mana, statuses and held equipment',()=>{
 const f=makeFighter({uid:1,species:7,star:2,slot:24,board:true,items:['mysticWater']},0),target=makeFighter({uid:-1,species:25,star:1,slot:17,board:true},1);
 f.hp=321;f.shield=87;f.mana=23;f.statuses=[{kind:'slow',time:1,source:-1,power:0,pulse:1}];
 const html=pokemonInspectionHTML(f,true,target);assert.match(html,/HP 321/);assert.match(html,/Mana 23 \/ 50/);assert.match(html,/87 shield/);assert.match(html,/Target → Pikachu/);assert.match(html,/SLOW/);assert.match(html,/Mystic Water/);assert.match(html,/1 \/ 3/);
});
test('item inspection exposes component recipes and completed-item statistics',()=>{
 assert.match(itemInspectionHTML('power'),/Shell Bell/);assert.match(itemInspectionHTML('power'),/8% attack/);assert.match(itemInspectionHTML('mysticWater'),/Mana Orb \+ Guard Scale/);assert.match(itemInspectionHTML('mysticWater'),/12% opening shield/);
});
