import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {makeFighter,cell,type Hit} from './engine.ts';
import {spriteFacing} from './facing.ts';
const unit=(uid:number,slot:number,team=0)=>makeFighter({uid,species:58,slot,star:1,board:true},team);
test('left-facing assets mirror when walking right and unmirror when walking left',()=>{
 const f=unit(1,24);f.moveTo=25;assert.equal(spriteFacing(f,[f]),-1);
 f.moveTo=23;assert.equal(spriteFacing(f,[f]),1);
});
test('attacks face their target and idle or vertical actions retain the last direction',()=>{
 const f=unit(1,24),target=unit(-1,25,1);
 const hit:Hit={x:f.x,y:f.y,toX:target.x,toY:target.y,value:0,color:'#fff',life:1,duration:1,attacker:1,target:-1,species:58,primary:true};
 f.strike={remaining:.3,ability:false,victims:[{uid:-1,amount:10,hit}]};
 assert.equal(spriteFacing(f,[f,target]),-1);
 target.x=f.x;assert.equal(spriteFacing(f,[f,target]),-1);
 f.strike=null;assert.equal(spriteFacing(f,[f,target]),-1);
 target.x=cell(23).x;assert.equal(spriteFacing(f,[f,target],[hit]),1);
});
test('visual facing does not mutate combat state and fresh replay fighters reset it',()=>{
 const f=unit(1,24),before=structuredClone(f);assert.equal(spriteFacing(f,[f]),1);assert.deepEqual(f,before);
 f.moveTo=25;assert.equal(spriteFacing(f,[f]),-1);const replay=unit(1,24);assert.equal(spriteFacing(replay,[replay]),1);
 assert.equal(spriteFacing(unit(-1,17,1),[]),-1);
});
