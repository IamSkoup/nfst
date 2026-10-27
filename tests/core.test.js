import test from 'node:test';import assert from 'node:assert/strict';
import {Race,events,freshSave,buy,stats,validateSave,makeTrack,controlsFromKeys} from '../js/core.js';
const upgraded=()=>{const s=freshSave();for(const k in s.upgrades)s.upgrades[k]=3;return s;};
const drive=(r,seconds=220)=>{for(let i=0;i<seconds*60&&!r.over;i++)r.update(1/60,r.ai(r.player));return r;};
test('A and left steer left; D and right steer right',()=>{
 // The chase camera faces +Z, so positive world steering appears to the left.
 for(const key of ['KeyA','ArrowLeft'])assert.equal(controlsFromKeys(new Set([key])).steer,1,key);
 for(const key of ['KeyD','ArrowRight'])assert.equal(controlsFromKeys(new Set([key])).steer,-1,key);
 assert.equal(controlsFromKeys(new Set(['KeyA','ArrowRight'])).steer,0);
 const c=controlsFromKeys(new Set(['KeyW','KeyS','KeyA','ShiftLeft','Space']));
 assert.deepEqual(c,{throttle:true,brake:true,steer:1,boost:true,jump:true});
});
for(const e of events)test(`${e.name}: physical route completes`,()=>{const r=drive(new Race(e,upgraded()));assert.equal(r.over,true);assert.ok(r.time>7&&r.time<220);assert.ok(r.result.rank>=1&&r.result.rank<=Math.max(2,r.racers.length));assert.ok(Number.isFinite(r.player.x));if(!['Knockout','Outrun'].includes(e.type))assert.ok(r.player.finished);});
test('countdown prevents movement',()=>{const r=new Race(events[0],freshSave());r.update(.05,{throttle:true});assert.equal(r.player.speed,0);assert.equal(r.time,0);});
test('throttle, steering, braking, finite boost and jumping',()=>{const r=new Race(events[0],freshSave(),true);r.countdown=0;for(let i=0;i<240;i++)r.update(1/60,{throttle:true,boost:true,steer:.1});assert.ok(r.player.speed>15);assert.ok(r.player.x>1);assert.ok(r.player.boost<100);r.update(1/60,{jump:true});assert.ok(r.player.air>0);for(let i=0;i<200;i++)r.update(1/60,{brake:true});assert.equal(r.player.speed,0);assert.equal(r.player.air,0);});
test('collision resolves and slows racer',()=>{const r=new Race(events[0],freshSave(),true);r.countdown=0;r.obstacles=[{x:0,z:8,r:2,h:4}];for(let i=0;i<180;i++)r.update(1/60,{throttle:true});assert.ok(Math.hypot(r.player.x,r.player.z-8)>=2.49);assert.ok(r.player.z<7);});
test('no finish through shortcut',()=>{const r=new Race(events[0],freshSave());r.countdown=0;const end=r.track.pts.at(-1);r.player.x=end.x;r.player.z=end.z;r.update(1/60,{});assert.equal(r.over,false);assert.equal(r.player.lap,0);});
test('drift finish counts at the real line, not several metres early',()=>{
 const r=new Race(events[3],freshSave());r.countdown=0;const n=r.track.n,step=r.track.length/n;
 const early=r.track.pts[n-5];Object.assign(r.player,{x:early.x,z:early.z,index:n-5,progress:(n-5)*step,next:n});
 r.update(1/60,{});assert.equal(r.player.lap,0);
 const finish=r.track.pts[n-1];Object.assign(r.player,{x:finish.x,z:finish.z,index:n-1,progress:(n-1)*step});
 r.update(1/60,{});assert.equal(r.player.lap,1);
});
test('ordered checkpoint accepts legitimate wide turns',()=>{
 const r=new Race(events[3],freshSave());r.countdown=0;
 const p=r.track.pts[6],q=r.track.pts[7],d=Math.hypot(q.x-p.x,q.z-p.z);
 Object.assign(r.player,{x:p.x-(q.z-p.z)/d*r.track.width*.87,z:p.z+(q.x-p.x)/d*r.track.width*.87,index:5,progress:6*r.track.length/r.track.n,next:6});
 r.update(1/60,{});assert.equal(r.player.next,12);
});
test('reset restores the nearest checkpoint and its progress consistently',()=>{
 const r=new Race(events[3],freshSave());r.countdown=0;
 Object.assign(r.player,{lap:1,index:95,progress:r.track.length+95*r.track.length/r.track.n,next:108,x:200,z:300});
 r.reset();assert.equal(r.player.index,102);assert.equal(r.player.progress,(r.track.n+102)*r.track.length/r.track.n);
 assert.ok(Math.hypot(r.player.x-r.track.pts[102].x,r.player.z-r.track.pts[102].z)<.001);
});
test('fourth career race can be won by keyboard-style controlled drifts, without waiting for AI',()=>{
 const r=new Race(events[3],freshSave());r.countdown=0;
 for(let i=0;i<60*118&&!r.over;i++){
  const steering=r.ai(r.player).steer;
  const c={throttle:true,brake:Math.abs(steering)>.18,steer:steering,boost:true};
  r.update(1/60,c);
  // Keep other racers away from the finish to reproduce the old endless wait.
  for(const rival of r.racers.slice(1)){rival.x=500;rival.z=500;rival.index=0;rival.progress=0;rival.next=6;}
 }
 assert.equal(r.over,true);assert.equal(r.player.finished,true);assert.equal(r.player.lap,2);
 assert.ok(r.time<118);assert.equal(r.player.speed,0);assert.equal(r.result.rank,1);
 assert.ok(r.player.style>0);
});
test('upgrade transaction is atomic and bounded',()=>{const s=freshSave();assert.ok(buy(s,'speed'));assert.equal(s.money,250);assert.equal(s.upgrades.speed,1);assert.ok(stats(s).max>stats(freshSave()).max);assert.equal(buy(s,'speed'),false);assert.equal(s.money,250);assert.equal(buy(s,'madeup'),false);s.upgrades.speed=3;assert.equal(buy(s,'speed'),false);});
test('rewards pay once and quick races never unlock career',()=>{const r=drive(new Race(events[0],upgraded()));const initial=r.save.money;const reward=r.reward(0);assert.ok(reward>0);assert.equal(r.save.money,initial+reward);assert.equal(r.reward(0),0);assert.deepEqual(r.save.completed,[0]);const q=drive(new Race(events[0],upgraded()));q.reward(0,false);assert.equal(q.save.money,700);assert.deepEqual(q.save.completed,[]);});
test('time trial expires when stationary',()=>{const r=new Race(events[5],freshSave());for(let i=0;i<60*65&&!r.over;i++)r.update(1/60,{});assert.equal(r.result.win,false);assert.equal(r.player.finished,false);});
test('time trial stores a real trajectory',()=>{const r=drive(new Race(events[5],upgraded()));r.reward(5);assert.ok(r.save.ghosts[5].length>100);assert.notDeepEqual(r.save.ghosts[5][0],r.save.ghosts[5].at(-1));});
test('free roam never ends or grants rewards',()=>{const r=new Race(events[0],freshSave(),true);r.countdown=0;for(let i=0;i<1000;i++)r.update(1/60,{throttle:true});assert.equal(r.over,false);assert.equal(r.reward(0),0);assert.ok(r.player.z>100);});
test('slow canyon entry recovers on opposite bank',()=>{const r=new Race(events[9],freshSave());r.countdown=0;const idx=r.track.gap-5,p=r.track.pts[idx];Object.assign(r.player,{x:p.x,z:p.z,index:idx,next:idx,speed:4});r.update(1/60,{throttle:true});assert.equal(r.jumps,1);assert.ok(r.player.index>r.track.gap);assert.ok(r.player.blink>0);assert.ok(Number.isFinite(r.player.x));});
test('save import validates and round trips',()=>{const s=upgraded();s.completed=[0,1];s.money=321;assert.deepEqual(validateSave(JSON.parse(JSON.stringify(s))),s);assert.throws(()=>validateSave({version:1,money:-5}));assert.throws(()=>validateSave({version:2,money:0}));assert.deepEqual(validateSave({...s,completed:[-1,0,0,999]}).completed,[0]);});
test('six routes have finite geometry and distinct lengths',()=>{const lengths=[];for(let i=0;i<6;i++){const t=makeTrack(i);assert.ok(t.pts.every(p=>Object.values(p).every(Number.isFinite)));lengths.push(t.length);}assert.equal(new Set(lengths).size,6);});
test('30 / 60 / 120 Hz give comparable physics',()=>{const runs=[30,60,120].map(hz=>{const r=new Race(events[0],freshSave(),true);r.countdown=0;for(let i=0;i<hz*10;i++)r.update(1/hz,{throttle:true});return r.player.z;});assert.ok(Math.max(...runs)-Math.min(...runs)<1);});
