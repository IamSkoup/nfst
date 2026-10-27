import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

fs.mkdirSync('test-results/mobile',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
await page.goto('http://127.0.0.1:8080');
await page.waitForFunction(()=>window.__game?.ready,{timeout:60000});
const noOverflow=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
assert.ok(await noOverflow(),'portrait home fits width');
await page.screenshot({path:'test-results/mobile/home-portrait.png'});

await page.locator('[data-action="career"]').tap();
assert.ok(await noOverflow(),'portrait career fits width');
const startButton=page.locator('[data-action="start"]');
await startButton.scrollIntoViewIfNeeded();
const b=await startButton.boundingBox();
assert.ok(b.y>=0&&b.y+b.height<=844,'start button reachable in portrait');
await page.screenshot({path:'test-results/mobile/career-portrait.png'});
await page.locator('[data-action="home"]:visible').first().tap();
await page.locator('[data-action="free"]').tap();
await page.locator('#touchControls').waitFor({state:'visible',timeout:20000});
assert.equal(await page.evaluate(()=>__game.save.settings.quality),'low');
await page.screenshot({path:'test-results/mobile/race-portrait.png'});

// Browser touch input is multi-pointer, unlike keyboard buttons or sequential taps.
const gas=page.locator('[data-touch-key="KeyW"]');
const left=page.locator('[data-touch-key="KeyA"]');
await gas.dispatchEvent('pointerdown',{pointerId:201,pointerType:'touch',button:0});
await left.dispatchEvent('pointerdown',{pointerId:202,pointerType:'touch',button:0});
await page.waitForFunction(()=>__game.race.player.speed>1,{timeout:30000});
await page.waitForFunction(()=>__game.race.player.heading>.04,{timeout:30000});
await left.dispatchEvent('pointerup',{pointerId:202,pointerType:'touch',button:0});
await gas.dispatchEvent('pointerup',{pointerId:201,pointerType:'touch',button:0});
console.log('PASS simultaneous gas and left steering');

const cameraBefore=await page.evaluate(()=>__game.save.settings.camera);
await page.locator('[data-touch-action="camera"]').tap();
assert.equal(await page.evaluate(()=>__game.save.settings.camera),(cameraBefore+1)%5);
await page.locator('[data-touch-action="pause"]').tap();
assert.equal(await page.evaluate(()=>__game.paused),true);
assert.equal(await page.locator('#touchControls').isVisible(),false);
await page.locator('[data-action="resume"]').tap();
assert.equal(await page.evaluate(()=>__game.paused),false);
await page.locator('[data-touch-action="map"]').tap();
assert.equal(await page.locator('#freeMap').isVisible(),true);
await page.locator('[data-action="map"]').tap();
await page.locator('#touchControls').waitFor({state:'visible'});
console.log('PASS camera, pause, resume and touch map');

await page.setViewportSize({width:844,height:390});
await page.waitForTimeout(400);
assert.ok(await noOverflow(),'landscape race fits width');
const visibleButtons=await page.locator('#touchControls button:visible').evaluateAll(nodes=>nodes.map(n=>({name:n.textContent.trim(),x:n.getBoundingClientRect().left,y:n.getBoundingClientRect().top,right:n.getBoundingClientRect().right,bottom:n.getBoundingClientRect().bottom})));
for(const r of visibleButtons)assert.ok(r.x>=-1&&r.y>=-1&&r.right<=845&&r.bottom<=391,`${r.name} on landscape screen`);
await page.screenshot({path:'test-results/mobile/race-landscape.png'});
console.log('PASS landscape control bounds');
for(const size of [{width:320,height:568},{width:360,height:640},{width:667,height:375},{width:915,height:412}]){
 await page.setViewportSize(size);
 await page.waitForTimeout(100);
 assert.ok(await noOverflow(),`page fits ${size.width}x${size.height}`);
 const rects=await page.locator('#touchControls button:visible').evaluateAll(nodes=>nodes.map(n=>({x:n.getBoundingClientRect().left,y:n.getBoundingClientRect().top,right:n.getBoundingClientRect().right,bottom:n.getBoundingClientRect().bottom})));
 for(const r of rects)assert.ok(r.x>=-1&&r.y>=-1&&r.right<=size.width+1&&r.bottom<=size.height+1,`button fits ${size.width}x${size.height}`);
 for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
  const a=rects[i],b=rects[j],overlapX=Math.min(a.right,b.right)-Math.max(a.x,b.x),overlapY=Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y);
  assert.ok(overlapX<2||overlapY<2,`touch buttons do not overlap at ${size.width}x${size.height}`);
 }
}
await page.screenshot({path:'test-results/mobile/race-small-landscape.png'});
console.log('PASS compact phone layouts');
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS mobile browser checks');
