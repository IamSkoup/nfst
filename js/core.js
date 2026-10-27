import {CatmullRomCurve3, Vector3} from 'three';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const angle=x=>Math.atan2(Math.sin(x),Math.cos(x));
export function controlsFromKeys(keys){return {throttle:keys.has('KeyW')||keys.has('ArrowUp'),brake:keys.has('KeyS')||keys.has('ArrowDown'),steer:Number(keys.has('KeyA')||keys.has('ArrowLeft'))-Number(keys.has('KeyD')||keys.has('ArrowRight')),boost:keys.has('ShiftLeft')||keys.has('ShiftRight'),jump:keys.has('Space')};}
export const terrain=(x,z)=>Math.sin(x*.018)*2.2+Math.sin(z*.023)*1.8+Math.sin((x+z)*.009)*3;
export const trackDefs=[
 {name:'Лунная саванна',region:'ЗЕМЛИ ПРАЙДА',closed:true,width:13,points:[[0,0],[0,85],[52,145],[130,140],[178,70],[145,-10],[65,-55],[-5,-50]]},
 {name:'Серебряная река',region:'ЗЕМЛИ ПРАЙДА',closed:false,width:12,points:[[0,0],[10,95],[-45,170],[-120,225],[-175,320],[-110,415],[0,460],[90,540]]},
 {name:'Пепельный каньон',region:'ЧУЖЕЗЕМЬЕ',closed:false,width:12,points:[[0,0],[0,80],[75,145],[140,240],[90,320],[150,410],[245,470],[220,560]]},
 {name:'Каменный лабиринт',region:'ЧУЖЕЗЕМЬЕ',closed:true,width:10,points:[[0,0],[0,55],[45,85],[80,45],[45,10],[105,-35],[80,-90],[10,-70],[-35,-30]]},
 {name:'Сухое русло',region:'ЗЕМЛИ ПРАЙДА',closed:false,width:14,points:[[0,0],[0,90],[12,180],[-8,280],[10,390],[0,540]]},
 {name:'Тихие дюны',region:'ЧУЖЕЗЕМЬЕ',closed:true,width:18,points:[[0,0],[-35,80],[20,145],[110,105],[135,20],[85,-65],[0,-95],[-60,-45]]}
];
export function makeTrack(id){const d=trackDefs[id];const curve=new CatmullRomCurve3(d.points.map(([x,z])=>new Vector3(x,0,z)),d.closed,'catmullrom',.35);const length=curve.getLength(),n=Math.ceil(length/3);const pts=curve.getSpacedPoints(n).map(p=>({x:p.x,z:p.z,y:terrain(p.x,p.z)}));return {...d,id,curve,length,n,pts,gap:id===2?Math.floor(n*.47):null};}
export const events=[
 {name:'Первый след',type:'Sprint',track:1,laps:1,prize:650,desc:'Ночь только начинается. Оставь первый след на серебряном песке.'},
 {name:'Под светом луны',type:'Circuit',track:0,laps:2,prize:850,desc:'Два круга вокруг древней скалы. Держи внутреннюю траекторию.'},
 {name:'Ритм охоты',type:'Drag',track:4,laps:1,prize:950,desc:'Нажимай E на вспышке ритма. Точный шаг даёт дополнительный рывок.'},
 {name:'Песчаный почерк',type:'Drift',track:5,laps:2,prize:1100,desc:'В повороте зажми W + S и A/D для управляемого скольжения. Побеждает лучший стиль.'},
 {name:'Последний в стае',type:'Knockout',track:0,laps:3,prize:1300,desc:'На каждом круге последний гонщик выбывает. Останься единственной.'},
 {name:'Обогнать тишину',type:'Time Trial',track:1,laps:1,prize:1200,limit:55,desc:'Финишируй за 55 секунд. Лучшая попытка вернётся призраком.'},
 {name:'Кошачья траектория',type:'Street X',track:3,laps:3,prize:1500,desc:'Тесные повороты среди скал. Адреналин отключён: решает техника.'},
 {name:'Лига полуночи',type:'League',track:0,laps:1,prize:2100,desc:'Три заезда: саванна, лабиринт, дюны. Победитель определяется по сумме очков.'},
 {name:'Без оглядки',type:'Outrun',track:5,laps:3,prize:1600,desc:'Дуэль: создай отрыв 65 метров. Если за три круга отрыва нет, решит финиш.'},
 {name:'По ту сторону',type:'Special',track:2,laps:1,prize:1900,desc:'Прыжок через каньон. Набери скорость перед сияющими грибами.'},
 {name:'Азад • Ветер Востока',type:'Duel',boss:'azaad',track:1,laps:1,prize:2400,desc:'Один на один с Азадом. «Скорость — это не только сила, Фули».'},
 {name:'FULI VS AZDAT',type:'Duel',boss:'azdat',track:2,laps:1,prize:3500,desc:'THE LAST RUN. Кайон и его потрёпанный электроскутер. Последняя ночь чемпионата.'}
];
export const upgrades=[['accel','Мощный рывок','Разгон'],['speed','Скорость ветра','Скорость'],['handling','Кошачья траектория','Управление'],['grip','Мягкая поступь','Сцепление'],['stamina','Второе дыхание','Выносливость'],['boost','Сердце охотницы','Адреналин']];
export function freshSave(){return {version:1,money:700,completed:[],upgrades:{accel:0,speed:0,handling:0,grip:0,stamina:0,boost:0},records:{},ghosts:{},style:0,races:0,wins:0,distance:0,cosmetic:0,settings:{music:.35,sfx:.55,master:.8,quality:'medium',brightness:1,hud:1,difficulty:0,camera:0,shake:false,cinematic:true}};}
export function validateSave(raw){if(!raw||raw.version!==1||!Number.isFinite(raw.money)||raw.money<0||raw.money>1e9)throw Error('Некорректный файл сохранения');const s=freshSave();s.money=Math.floor(raw.money);s.completed=[...new Set((raw.completed||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<events.length))];for(const [k] of upgrades)s.upgrades[k]=clamp(Math.floor(Number(raw.upgrades?.[k])||0),0,3);for(const k of ['style','races','wins','distance'])s[k]=clamp(Number(raw[k])||0,0,1e9);s.cosmetic=clamp(Math.floor(Number(raw.cosmetic)||0),0,3);if(raw.records)for(const [k,v] of Object.entries(raw.records))if(Number.isFinite(v)&&v>0)s.records[k]=v;if(raw.ghosts)for(const [k,v] of Object.entries(raw.ghosts))if(Array.isArray(v)&&v.length<=6000&&v.every(p=>Array.isArray(p)&&p.length===4&&p.every(Number.isFinite)))s.ghosts[k]=v;s.settings={...s.settings,...raw.settings};for(const k of ['music','sfx','master'])s.settings[k]=clamp(Number(s.settings[k])||0,0,1);s.settings.brightness=clamp(Number(s.settings.brightness)||1,.6,1.7);s.settings.hud=clamp(Number(s.settings.hud)||1,.7,1.3);s.settings.difficulty=clamp(Number(s.settings.difficulty)||0,0,2);s.settings.camera=clamp(Number(s.settings.camera)||0,0,4);if(!['low','medium','high'].includes(s.settings.quality))s.settings.quality='medium';return s;}
export function buy(s,key){if(!upgrades.some(u=>u[0]===key)||s.upgrades[key]>=3)return false;const cost=(s.upgrades[key]+1)*450;if(s.money<cost)return false;s.money-=cost;s.upgrades[key]++;return true;}
export function stats(s){return {max:20+s.upgrades.speed*3.1,accel:6+s.upgrades.accel*2.1,turn:1.5+s.upgrades.handling*.17,grip:3.8+s.upgrades.grip*.8,capacity:100+s.upgrades.boost*35,stamina:1+s.upgrades.stamina*.1};}
export function nearest(track,x,z){let best=Infinity,index=0;for(let i=0;i<track.pts.length;i++){const p=track.pts[i],d=(x-p.x)**2+(z-p.z)**2;if(d<best){best=d;index=i;}}return {index,distance:Math.sqrt(best)};}
export class Race{
 constructor(event,save,free=false){this.event=event;this.save=save;this.track=makeTrack(event.track);this.free=free;this.time=0;this.countdown=3.5;this.over=false;this.paid=false;this.eliminations=0;this.jumps=0;this.recording=[];this.obstacles=[];this.messages=[];this.cinematic=0;this.result=null;
 const count=free||event.type==='Time Trial'?1:event.boss||event.type==='Outrun'?2:4;this.racers=Array.from({length:count},(_,i)=>({id:i,name:i===0?'Фули':event.boss==='azdat'?'Кайон / Аздат':event.boss==='azaad'?'Азад':['','Сафира','Тано','Нуру'][i],x:(i-(count-1)/2)*2.3,z:-i*2,heading:0,vx:0,vz:0,speed:0,air:0,vy:0,boost:stats(save).capacity,progress:0,index:0,next:Math.min(6,this.track.n),lap:0,style:0,finished:false,finishTime:null,out:false,blink:0,boosting:false,drifting:false,gapDone:-1}));this.player=this.racers[0];}
 reset(r=this.player){const idx=clamp(this.free?r.index:r.next-6,0,this.track.n-1);const p=this.track.pts[idx],q=this.track.pts[idx+1];r.x=p.x;r.z=p.z;r.index=idx;if(!this.free)r.progress=(r.lap*this.track.n+idx)*this.track.length/this.track.n;r.heading=Math.atan2(q.x-p.x,q.z-p.z);r.speed=5;r.vx=Math.sin(r.heading)*5;r.vz=Math.cos(r.heading)*5;r.air=0;r.vy=0;r.blink=1.5;}
 ai(r){const t=this.track,look=(r.index+Math.floor(3+r.speed*.12))%t.n;const targetIndex=r.next<r.index-8?r.next:(t.closed?look:Math.min(r.index+5,t.n));const p=t.pts[targetIndex];const lateral=Math.sin(this.time*.7+r.id*2)*1.1;const aim=Math.atan2(p.x+Math.cos(r.heading)*lateral-r.x,p.z-Math.sin(r.heading)*lateral-r.z);const turn=angle(aim-r.heading);return {throttle:Math.abs(turn)<.38,brake:Math.abs(turn)>.48,steer:clamp(turn*2,-1,1),boost:Math.abs(turn)<.15&&r.boost>20&&r.progress>30,jump:false,drift:this.event.type==='Drift'&&Math.abs(turn)>.20};}
 update(dt,input={}){
 if(this.over)return;dt=clamp(dt,0,.05);if(this.countdown>0){this.countdown-=dt;return;}this.time+=dt;this.cinematic=Math.max(0,this.cinematic-dt);const t=this.track,ps=stats(this.save);
 for(const r of this.racers){if(r.out||r.finished)continue;const c=r.id?this.ai(r):input;const skill=this.save.settings.difficulty;const st=r.id?{...ps,max:18+Math.min(this.save.completed.length,10)*.9+skill*2+(this.event.boss?3:0)+r.id*.35,accel:6.2+skill,turn:2.15,grip:6}:ps;
 r.blink=Math.max(0,r.blink-dt);const off=nearest(t,r.x,r.z);const onRoad=off.distance<t.width*.5;const top=st.max*(onRoad||this.free?1:.58)*(r.id?1:Math.max(.86,1-this.time/(360*st.stamina)));
 if(!c.boost)r.boostLock=false;if(r.boost<=0)r.boostLock=true;r.boosting=!!c.boost&&!r.boostLock&&r.boost>0&&this.event.type!=='Street X'&&r.speed>3;r.boost=clamp(r.boost+(r.boosting?-24:8)*dt,0,ps.capacity);
 // In a drift race, accelerating while holding the brake and steering maintains
 // a controlled slide; braking by itself must still bring the racer to a stop.
 const controlledDrift=this.event.type==='Drift'&&c.throttle&&c.brake&&Math.abs(c.steer||0)>.2;
 const target=controlledDrift?top*.65:c.brake?0:c.throttle?top*(r.boosting?1.42:1):0;const drag=controlledDrift?st.accel:c.brake?st.accel*2.4:c.throttle?st.accel:2.8;r.speed+=clamp(target-r.speed,-drag*dt,drag*dt);r.speed=Math.max(0,r.speed);
 r.drifting=(!!c.drift||!!c.brake)&&Math.abs(c.steer||0)>.2&&r.speed>7;r.heading+=Number(c.steer||0)*st.turn*dt*clamp(r.speed/6,0,1)*(r.drifting?1.3:1);
 const grip=r.drifting?1.25:st.grip;const tx=Math.sin(r.heading)*r.speed,tz=Math.cos(r.heading)*r.speed;r.vx+=(tx-r.vx)*Math.min(1,grip*dt);r.vz+=(tz-r.vz)*Math.min(1,grip*dt);r.x+=r.vx*dt;r.z+=r.vz*dt;
 if(r.drifting){const slip=Math.abs(angle(Math.atan2(r.vx,r.vz)-r.heading));r.style+=slip*r.speed*dt*8;}
 if(c.jump&&r.air===0){r.vy=8;r.air=.01;}if(r.air>0){r.vy-=18*dt;r.air=Math.max(0,r.air+r.vy*dt);if(r.air===0)r.vy=0;}
 for(const o of this.obstacles){const dx=r.x-o.x,dz=r.z-o.z,d=Math.hypot(dx,dz);if(d<o.r+.5&&r.air<o.h){const a=Math.atan2(dx,dz);r.x=o.x+Math.sin(a)*(o.r+.52);r.z=o.z+Math.cos(a)*(o.r+.52);r.speed*=.65;r.vx*=.5;r.vz*=.5;}}
 r.x=clamp(r.x,-570,570);r.z=clamp(r.z,-570,650);
 if(!this.free){const now=nearest(t,r.x,r.z);let delta=now.index-r.index;if(t.closed&&delta<-t.n/2)delta+=t.n;if(t.closed&&delta>t.n/2)delta-=t.n;
 if(Math.abs(delta)<20&&now.distance<t.width*.9){r.progress+=delta*t.length/t.n;r.index=now.index;}
 // Follow ordered track progress instead of a small checkpoint circle: a
 // legitimate wide turn must not permanently miss a gate. The last gate only
 // counts at the finish line, not fifteen metres before it.
 const gateDistance=t.length/t.n;
 const gatePosition=(r.lap*t.n+r.next-1)*gateDistance;
 if(now.distance<t.width*.9&&r.progress>=gatePosition){
   if(r.next===t.n){r.lap++;r.next=Math.min(6,t.n);if(!t.closed||r.lap>=this.event.laps){r.finished=true;r.finishTime=this.time;r.speed=0;r.vx=0;r.vz=0;r.boosting=false;r.drifting=false;}}
   else r.next=Math.min(t.n,r.next+6);
 }
 if(t.gap&&r.index>=t.gap-6&&r.index<=t.gap-3&&r.gapDone!==r.lap){r.gapDone=r.lap;r.vy=14;r.air=.1;if(!r.id){this.jumps++;this.cinematic=this.save.settings.cinematic?1.7:0;}if(r.speed<16){const p=t.pts[t.gap+8];r.x=p.x;r.z=p.z;r.index=t.gap+8;r.progress=(r.lap*t.n+r.index)*t.length/t.n;r.next=Math.max(r.next,Math.ceil((t.gap+8)/6)*6);r.blink=1.5;r.speed=15;}}
 }
 }
 if(this.free)return;
 const p=this.player;
 if(Math.floor(this.time*10)>this.recording.length&&this.recording.length<6000)this.recording.push([p.x,p.z,p.heading,p.air]);
 if(this.event.type==='Knockout'){
 const firstLap=Math.max(...this.racers.filter(r=>!r.out).map(r=>r.lap));if(firstLap>this.eliminations&&this.eliminations<3){const last=this.ranking().filter(r=>!r.out).at(-1);last.out=true;this.eliminations++;if(last.id===0)this.end();else if(this.eliminations===3)this.end();}
 }
 if(this.event.type==='Outrun'){const d=p.progress-this.racers[1].progress;if(Math.abs(d)>65&&this.time>8){this.outrunWin=d>0;this.end();}}
 // Never lock the player at the line waiting for AI opponents to finish.
 if(p.finished||p.out||(this.event.type==='Time Trial'&&this.time>this.event.limit))this.end();
 }
 ranking(){return [...this.racers].sort((a,b)=>Number(a.out)-Number(b.out)||(a.finishTime??Infinity)-(b.finishTime??Infinity)||b.progress-a.progress);}
 end(){if(this.over)return;this.over=true;let rank=this.ranking().findIndex(r=>r.id===0)+1;if(this.event.type==='Drift')rank=[...this.racers].sort((a,b)=>b.style-a.style).findIndex(r=>r.id===0)+1;if(this.event.type==='Time Trial')rank=this.player.finished&&this.time<=this.event.limit?1:2;if(this.outrunWin!==undefined)rank=this.outrunWin?1:2;if(this.player.out)rank=this.racers.length;this.result={rank,win:rank===1,time:this.time,style:Math.floor(this.player.style)};}
 reward(index,career=true){if(!this.over||this.paid)return 0;this.paid=true;const s=this.save;s.races++;s.distance+=Math.max(0,this.player.progress);s.style+=Math.floor(this.player.style);if(this.result.win)s.wins++;let money=0;if(career){money=this.result.win?(s.completed.includes(index)?Math.floor(this.event.prize*.35):this.event.prize):Math.floor(this.event.prize*.12);s.money+=money;if(this.result.win&&!s.completed.includes(index))s.completed.push(index);}if(this.player.finished&&(!s.records[index]||this.time<s.records[index])){s.records[index]=this.time;if(this.event.type==='Time Trial')s.ghosts[index]=this.recording;}return money;}
}
