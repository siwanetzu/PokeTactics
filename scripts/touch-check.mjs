import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve('artifacts/touch-tests');
await fs.mkdir(path.join(root,'frames'),{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const page=await context.newPage(),cdp=await context.newCDPSession(page);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TOUCH_URL??'http://127.0.0.1:5175/PokeTactics/?test-run=1');
await page.getByRole('button',{name:'Your Bulbasaur',exact:true}).waitFor();
await page.evaluate(()=>{const label=document.createElement('div');label.id='qa-gesture-label';label.style.cssText='position:fixed;top:150px;left:8px;padding:5px 9px;color:#fff4bd;background:#16283de8;border:1px solid #dbc58b;border-radius:6px;font:12px sans-serif;z-index:900;pointer-events:none';document.body.append(label);const finger=document.createElement('div');finger.id='qa-finger';finger.style.cssText='position:fixed;width:24px;height:24px;border:2px solid #fff6b2;border-radius:50%;background:#f4d55a55;transform:translate(-50%,-50%);z-index:901;pointer-events:none;display:none';document.body.append(finger);});
let count=0;const frames=[];
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poketactics-test-match-v1')));
const center=async locator=>{const r=await locator.boundingBox();assert.ok(r);return {x:r.x+r.width/2,y:r.y+r.height/2};};
async function capture(label,point=null,duration=50){await page.evaluate(({label,point})=>{document.getElementById('qa-gesture-label').textContent=label;const f=document.getElementById('qa-finger');f.style.display=point?'block':'none';if(point){f.style.left=point.x+'px';f.style.top=point.y+'px';}},{label,point});const file=`${String(count++).padStart(3,'0')}.png`;await page.screenshot({path:path.join(root,'frames',file)});frames.push({file,duration});}
async function gesture(from,to,label,{cancel=false}={}){
 const pt=p=>({...p,id:1,radiusX:5,radiusY:5,force:1});
 await capture(label,null,300);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pt(from)]});
 await capture(label,from);
 for(let i=1;i<=12;i++){const p={x:from.x+(to.x-from.x)*i/12,y:from.y+(to.y-from.y)*i/12};await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pt(p)]});await page.waitForTimeout(20);await capture(label,p);}
 await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
 await page.waitForTimeout(180);await capture(label+' ✓',null,350);
}
try{
 await page.getByRole('button',{name:'Charmander',exact:true}).tap();await page.getByRole('button',{name:'Bench slot 3',exact:true}).tap();const initial=await state();
 const start=await center(page.getByRole('button',{name:'Charmander',exact:true}));
 await gesture(start,{x:12,y:start.y},'Swipe bench — team stays unchanged');
 assert.ok(await page.locator('#bench').evaluate(el=>el.scrollLeft)>0,'Bench did not scroll');
 assert.deepEqual((await state()).units,initial.units,'Bench swipe moved or sold a Pokémon');
 assert.deepEqual((await state()).inventory,initial.inventory);
 const shop=page.locator('#shop-cards');const card=await center(shop.locator('button').nth(2));
 await gesture(card,{x:card.x-140,y:card.y},'Swipe shop — no accidental purchases');
 assert.ok(await shop.evaluate(el=>el.scrollLeft)>0,'Shop did not scroll');
 assert.deepEqual((await state()).units,initial.units);assert.equal((await state()).gold,initial.gold);
 // Native reverse pan returns the first reserve to view.
 const benchBox=await page.locator('#bench').boundingBox();
 await gesture({x:benchBox.x+35,y:benchBox.y+25},{x:benchBox.x+benchBox.width-12,y:benchBox.y+25},'Swipe bench back');
 await page.getByRole('button',{name:'Charmander',exact:true}).tap();
 const tile=await center(page.getByRole('button',{name:'Place Charmander on row 1, column 1',exact:true}));
 await page.getByRole('button',{name:'Cancel selection',exact:true}).tap();
 await gesture(await center(page.getByRole('button',{name:'Charmander',exact:true})),tile,'Drag Pokémon up onto a tile');
 const charmander=(await state()).units.find(u=>u.species===4);
 assert.equal(charmander.board,true,'Charmander did not deploy');assert.equal(charmander.slot,21);
 assert.equal(await page.locator('.drag-ghost').count(),0);
 
 // Board drag to another legal tile.
 await page.getByRole('button',{name:'Your Charmander',exact:true}).tap();
 const second=await center(page.getByRole('button',{name:'Place Charmander on row 2, column 1',exact:true}));
 await page.getByRole('button',{name:'Cancel selection',exact:true}).tap();
 await gesture(await center(page.getByRole('button',{name:'Your Charmander',exact:true})),second,'Drag Pokémon between board tiles');
 assert.equal((await state()).units.find(u=>u.species===4).slot,28);
 const bagBefore=(await state()).inventory.length;
 await page.getByRole('button',{name:`Items · ${bagBefore}`,exact:true}).tap();
 const source=await center(page.getByRole('button',{name:'Vitality Seed',exact:true}));
 const target=await center(page.getByRole('button',{name:'Your Squirtle',exact:true}));
 await gesture(source,target,'Drag item onto Squirtle');
 const equipped=await state();assert.equal(equipped.inventory.length,bagBefore-1);assert.ok(equipped.units.find(u=>u.species===7).items.includes('vital'));
 assert.equal(await page.locator('.item-drag-ghost').count(),0);
 assert.equal(await page.locator('#equipment-hud').isVisible(),false,'Drawer blocks the drop target');
 // Cancellation must never consume an item or leave a ghost/capture behind.
 await page.getByRole('button',{name:`Items · ${equipped.inventory.length}`,exact:true}).tap();
 const power=await center(page.getByRole('button',{name:'Power Band',exact:true}));
 await gesture(power,{x:power.x+90,y:power.y-60},'Cancel item drag — inventory preserved',{cancel:true});
 assert.deepEqual((await state()).inventory,equipped.inventory);assert.equal(await page.locator('.item-drag-ghost').count(),0);
 assert.equal(await page.locator('.equip-ready').count(),0,'Cancelled item drag leaves a selected item');
 const positionsBefore=(await state()).units;
 await gesture(await center(page.getByRole('button',{name:'Your Charmander',exact:true})),{x:90,y:300},'Cancel Pokémon drag — position preserved',{cancel:true});
 assert.deepEqual((await state()).units,positionsBefore);assert.equal(await page.locator('.drag-ghost').count(),0);
 const empty=await center(page.getByRole('button',{name:'Bench slot 3',exact:true}));
 await gesture(await center(page.getByRole('button',{name:'Your Charmander',exact:true})),empty,'Drag Pokémon back to the bench');
 assert.equal((await state()).units.find(u=>u.species===4).board,false);
 assert.deepEqual(errors,[]);
 console.log('PASS: trusted touch bench/shop pans, bench deployment, board movement, item equip and cancellation.');
}catch(error){await page.screenshot({path:path.join(root,'failure.png')});console.error(error);process.exitCode=1;}
finally{await fs.writeFile(path.join(root,'frames.json'),JSON.stringify(frames));await fs.writeFile(path.join(root,'final-state.json'),JSON.stringify(await state()));await browser.close();}
