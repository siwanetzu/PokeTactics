import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gestureIntent} from './gestures.ts';

test('touch jitter does not begin dragging or alter the bench',()=>{
 for(const surface of ['board','bench','item'] as const)assert.equal(gestureIntent('touch',surface,4,5),'pending');
 assert.equal(gestureIntent('touch','bench',8,0),'pending');
});
test('sideways bench swipes remain browsing in either direction',()=>{
 for(const dx of [-45,45])for(const dy of [-12,0,12])assert.equal(gestureIntent('touch','bench',dx,dy),'scroll');
 assert.equal(gestureIntent('touch','bench',20,20),'scroll');
});
test('vertical bench gestures and board/item gestures drag',()=>{
 for(const dy of [-45,45])assert.equal(gestureIntent('touch','bench',12,dy),'drag');
 for(const surface of ['board','item'] as const){assert.equal(gestureIntent('touch',surface,40,0),'drag');assert.equal(gestureIntent('touch',surface,0,-40),'drag');}
});
test('mouse bench drags preserve desktop movement in every direction',()=>{
 assert.equal(gestureIntent('mouse','bench',40,0),'drag');
 assert.equal(gestureIntent('mouse','bench',0,40),'drag');
 assert.equal(gestureIntent('mouse','bench',5,0),'pending');
});
test('landscape reserves pan vertically and deploy with horizontal drags',()=>{
 assert.equal(gestureIntent('touch','bench',12,-45,'y'),'scroll');
 assert.equal(gestureIntent('touch','bench',12,45,'y'),'scroll');
 assert.equal(gestureIntent('touch','bench',-45,12,'y'),'drag');
 assert.equal(gestureIntent('touch','bench',45,12,'y'),'drag');
});
