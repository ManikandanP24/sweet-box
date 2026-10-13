import {useRef,useState,useEffect,Suspense} from 'react'
import {Canvas,useFrame,useLoader} from '@react-three/fiber'
import {Sky} from '@react-three/drei'
import * as THREE from 'three'

const LX=2.2,KEY='sweetbox-best',slots=[]
const PW={magnet:'#e11d48',shield:'#3b82f6',double:'#f59e0b',boost:'#facc15',escape:'#22c55e'}
const ICON={magnet:'🧲',shield:'🛡️',double:'x2',boost:'⚡',escape:'🏃'}
let muted=false,ac
const beep=(f,d=.12,t='square',v=.05)=>{if(muted)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.stop(ac.currentTime+d)}catch{}}
const fresh=()=>({run:false,pause:false,t:0,dist:0,sp:0,gap:0,lane:1,px:0,y:0,vy:0,slide:0,sweets:0,pts:0,lives:3,inv:0,chase:0,pw:{},items:[],msg:'',mt:0,hud:0,fs:0,tanker:14})
const say=(g,m)=>{g.msg=m;g.mt=1.8}
const add=(g,k,lane,z,x,kind)=>{const o=slots.find(s=>s&&!s.visible);if(!o)return;o.visible=true;o.position.set(x??(lane-1)*LX,0,z);o.rotation.y=0;o.children.forEach(c=>c.visible=c.name===k)
 if(kind){const m=o.getObjectByName('pw').children[0].material;m.color.set(PW[kind]);m.emissive.set(PW[kind])}
 g.items.push({k,lane,z,o,kind})}
const spawn=g=>{const r=Math.random(),L=Math.floor(Math.random()*3),z=-90
 if(r<.4){const k=Math.random()<.12?'gold':'sweet';for(let i=0;i<6;i++)add(g,k,L,z-i*2)}
 else if(r<.55){add(g,'barrier',L,z);if(g.t>20)add(g,'barrier',(L+1)%3,z)}
 else if(r<.68)add(g,'banner',-1,z,0)
 else if(r<.8){add(g,'scooter',L,z);if(g.t>25)add(g,'scooter',(L+1)%3,z)}
 else if(r<.9){const ks=Object.keys(PW);add(g,'pw',L,z,undefined,ks[Math.floor(Math.random()*ks.length)])}
 else if(g.t>12&&g.t-g.tanker>15){g.tanker=g.t;const l=L%2;add(g,'tanker',l,z,(l-.5)*LX);say(g,'TANKER ALERT!');beep(150,.7,'sawtooth',.08)}
 else for(let i=0;i<5;i++)add(g,'sweet',L,z-i*2)}
function hit(g){if(g.inv>0)return
 if(g.pw.shield>0){g.pw.shield=0;say(g,'Shield saved you!')}
 else{g.lives--;g.chase++;say(g,g.chase>=2?'Delivery boys are coming!':'Bro, return the sweets!')}
 g.inv=1.2;beep(120,.3,'sawtooth')}
function step(g,dt,hud){
 g.t+=dt;const sp=Math.min(14+g.t*.22,34)*(g.pw.boost>0?1.5:1);g.speed=sp
 g.dist+=sp*dt;g.inv-=dt;g.mt-=dt;g.slide-=dt;g.fs+=dt
 for(const k in g.pw)if(g.pw[k]>0)g.pw[k]-=dt
 g.chase=g.pw.escape>0?0:Math.max(0,g.chase-dt*.04)
 g.px+=((g.lane-1)*LX-g.px)*Math.min(1,dt*12)
 g.vy-=32*dt;g.y+=g.vy*dt;if(g.y<0){g.y=0;g.vy=0}
 if(g.fs>.28&&g.y===0){g.fs=0;beep(90,.05,'triangle',.04)}
 if(g.sp>g.gap){g.sp=0;g.gap=11+Math.random()*8-Math.min(g.t*.05,4);spawn(g)}
 const dbl=g.pw.double>0?2:1
 for(let i=g.items.length-1;i>=0;i--){const it=g.items[i];it.z+=sp*dt
  const sw=it.k==='sweet'||it.k==='gold',tk=it.k==='tanker'
  const near=Math.abs(it.z)<(tk?3.2:.8),inLane=it.lane<0||it.lane===g.lane||(tk&&g.lane===it.lane+1)
  let rm=it.z>7
  if(sw){it.o.rotation.y+=dt*3
   if((near&&inLane)||(g.pw.magnet>0&&it.z>-6&&it.z<1)){rm=true;g.sweets++;g.pts+=(it.k==='gold'?50:10)*dbl;beep(880+g.sweets%5*90,.08,'sine');if(g.sweets%10===0)say(g,'Sweet box secured!')}}
  else if(it.k==='pw'){if(near&&inLane){rm=true;g.pw[it.kind]=8;beep(1200,.2,'triangle');say(g,it.kind.toUpperCase()+'!')}}
  else if(near&&inLane&&((it.k==='barrier'&&g.y<.7)||(it.k==='banner'&&g.slide<=0)||it.k==='scooter'||tk))hit(g)
  if(rm){it.o.visible=false;g.items.splice(i,1)}else it.o.position.z=it.z}
 const score=g.pts+Math.floor(g.dist)
 if(g.lives<=0){g.run=false;const b=+localStorage.getItem(KEY)||0,nb=score>b;if(nb)localStorage.setItem(KEY,score);beep(200,.4,'sawtooth');setTimeout(()=>beep(120,.6,'sawtooth'),300);return hud({over:true,score,sweets:g.sweets,nb})}
 if((g.hud-=dt)<=0){g.hud=.1;hud({score,sweets:g.sweets,dist:Math.floor(g.dist),speed:Math.floor(sp*3.2),lives:g.lives,msg:g.mt>0?g.msg:'',pw:Object.fromEntries(Object.entries(g.pw).filter(([,v])=>v>0).map(([k,v])=>[k,Math.ceil(v)]))})}}

const B=({a,p,c,e})=><mesh position={p}><boxGeometry args={a}/><meshStandardMaterial color={c} emissive={e||'#000'} emissiveIntensity={.5}/></mesh>
const Slot=({i})=><group visible={false} ref={r=>{if(r)slots[i]=r}}>
 <group name="sweet"><B a={[.7,.5,.7]} p={[0,.7,0]} c="#d62828" e="#ff6a00"/><B a={[.14,.52,.72]} p={[0,.7,0]} c="#ffd23f"/></group>
 <group name="gold"><B a={[.8,.6,.8]} p={[0,.8,0]} c="#ffd700" e="#ffb300"/><B a={[.16,.62,.82]} p={[0,.8,0]} c="#d62828"/></group>
 <group name="barrier"><B a={[1.8,.35,.3]} p={[0,.6,0]} c="#facc15"/><B a={[1.7,.6,.2]} p={[0,.3,0]} c="#222"/></group>
 <group name="banner"><B a={[7,.7,.2]} p={[0,2.4,0]} c="#c0182b" e="#400"/><B a={[.2,2.4,.2]} p={[-3.4,1.2,0]} c="#555"/><B a={[.2,2.4,.2]} p={[3.4,1.2,0]} c="#555"/></group>
 <group name="scooter"><B a={[.7,.9,1.6]} p={[0,.55,0]} c="#16a34a"/><B a={[.6,.6,.5]} p={[0,1.2,-.3]} c="#ef4444"/></group>
 <group name="tanker"><B a={[3.8,2.2,6]} p={[0,1.5,-.6]} c="#e5e7eb"/><B a={[3.82,.5,6]} p={[0,1.2,-.6]} c="#2563eb"/><B a={[3.6,2,1.8]} p={[0,1.3,3.1]} c="#f3f4f6"/></group>
 <group name="pw"><mesh position-y={1.1}><sphereGeometry args={[.45,16,16]}/><meshStandardMaterial emissiveIntensity={.8}/></mesh></group>
</group>
const COL=['#f59e0b','#ec4899','#14b8a6','#f97316','#a855f7','#ef4444']
function Scene({g,hud}){
 const face=useLoader(THREE.TextureLoader,import.meta.env.BASE_URL+'player-face.jpg');face.colorSpace=THREE.SRGBColorSpace
 const P=useRef(),legs=useRef(),lines=useRef(),bl=useRef(),ch=useRef()
 useFrame(({camera},dt)=>{dt=Math.min(dt,.05)
  if(g.run&&!g.pause)step(g,dt,hud)
  const s=Math.sin(g.t*16)*.7,sl=g.slide>0
  P.current.position.set(g.px,g.y,0);P.current.scale.y=sl?.55:1;P.current.rotation.x=sl?-.4:0
  P.current.visible=g.inv<=0||Math.floor(g.inv*12)%2===0
  legs.current.children[0].rotation.x=s;legs.current.children[1].rotation.x=-s
  lines.current.position.z=g.dist%8;bl.current.position.z=g.dist%14
  ch.current.position.set(g.px,0,7-Math.min(g.chase,3)*1.6)
  camera.position.set(camera.position.x+(g.px*.6-camera.position.x)*.1,3.4,6.5);camera.lookAt(g.px*.5,1.2,-8)})
 return <>
  <mesh rotation-x={-Math.PI/2} position={[0,0,-80]}><planeGeometry args={[7.4,220]}/><meshStandardMaterial color="#3a3a40"/></mesh>
  <mesh rotation-x={-Math.PI/2} position={[0,-.02,-80]}><planeGeometry args={[60,220]}/><meshStandardMaterial color="#c9a66b"/></mesh>
  <group ref={lines}>{[...Array(14)].map((_,i)=>[-1.1,1.1].map(x=><B key={i+'_'+x} a={[.12,.02,3]} p={[x,.02,-i*8]} c="#fff"/>))}</group>
  <group ref={bl}>{[...Array(14)].map((_,i)=>[-1,1].map(sd=>{const h=6+((i*7+(sd>0?3:0))%5)*3;return <B key={i+'b'+sd} a={[5,h,10]} p={[sd*10,h/2,-i*14]} c={COL[(i+(sd>0?2:0))%6]}/>}))}</group>
  <group ref={P}>
   <group ref={legs} position-y={.8}>{[-.17,.17].map(x=><group key={x} position-x={x}><B a={[.28,.8,.3]} p={[0,-.4,0]} c="#2b5aa8"/></group>)}</group>
   <B a={[.8,.8,.45]} p={[0,1.2,0]} c="#9fb4dc"/><B a={[.82,.08,.47]} p={[0,1.3,0]} c="#4b6cb7"/><B a={[.82,.08,.47]} p={[0,1.05,0]} c="#4b6cb7"/>
   <mesh position-y={1.85}><sphereGeometry args={[.36,16,16]}/><meshStandardMaterial color="#1b1410"/></mesh>
   <mesh position={[0,1.82,.37]}><circleGeometry args={[.3,24]}/><meshBasicMaterial map={face}/></mesh>
  </group>
  <group ref={ch}><B a={[.7,.8,.4]} p={[0,1.2,0]} c="#dc2626"/><B a={[.3,.8,.3]} p={[0,.4,0]} c="#222"/><mesh position-y={1.8}><sphereGeometry args={[.3,12,12]}/><meshStandardMaterial color="#dc2626"/></mesh></group>
  {[...Array(30)].map((_,i)=><Slot key={i} i={i}/>)}
 </>}
export default function App(){
 const gRef=useRef(null);if(!gRef.current)gRef.current=fresh();const g=gRef.current
 const [ph,setPh]=useState('start'),[h,setH]=useState({}),[best,setBest]=useState(+localStorage.getItem(KEY)||0),[mute,setMute]=useState(false)
 const hud=d=>{setH(d);if(d.over){setPh('over');setBest(+localStorage.getItem(KEY)||0)}}
 const start=()=>{Object.assign(g,fresh());slots.forEach(s=>s&&(s.visible=false));g.run=true;say(g,'Run, bro, RUN!');setH({});setPh('play');beep(520)}
 const pause=()=>{if(!g.run)return;g.pause=!g.pause;setPh(g.pause?'pause':'play')}
 const act=a=>{if(!g.run||g.pause)return
  if(a==='L'&&g.lane>0)g.lane--;if(a==='R'&&g.lane<2)g.lane++
  if(a==='U'&&g.y<.05){g.vy=11.5;g.slide=0;beep(660,.1)}
  if(a==='D'){g.slide=.7;if(g.y>0)g.vy=-18;beep(300,.1)}}
 useEffect(()=>{const m={arrowleft:'L',a:'L',arrowright:'R',d:'R',arrowup:'U',w:'U',' ':'U',arrowdown:'D',s:'D'}
  const kd=e=>{const k=e.key.toLowerCase();if(k==='escape'||k==='p')return pause();if(m[k]){e.preventDefault();act(m[k])}}
  let t0;const ts=e=>{t0=e.touches[0]},te=e=>{const t=e.changedTouches[0],dx=t.clientX-t0.clientX,dy=t.clientY-t0.clientY;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;act(Math.abs(dx)>Math.abs(dy)?(dx<0?'L':'R'):(dy<0?'U':'D'))}
  addEventListener('keydown',kd);addEventListener('touchstart',ts);addEventListener('touchend',te)
  return()=>{removeEventListener('keydown',kd);removeEventListener('touchstart',ts);removeEventListener('touchend',te)}},[])
 const playing=ph==='play'||ph==='pause'
 return <div className="app">
  <Canvas camera={{fov:60,position:[0,3.4,6.5]}}><fog attach="fog" args={['#cfe8ff',30,100]}/><Sky sunPosition={[50,30,-100]}/><ambientLight intensity={.9}/><directionalLight position={[5,10,5]} intensity={1.2}/><Suspense fallback={null}><Scene g={g} hud={hud}/></Suspense></Canvas>
  {playing&&<><div className="hud"><button className="btn" onClick={pause}>{ph==='pause'?'▶':'⏸'}</button><span className="chip">🎁 {h.sweets||0}</span><span className="chip">📏 {h.dist||0} m</span><span className="chip">⚡ {h.speed||0} km/h</span><span className="chip">⭐ {h.score||0}</span><span className="chip">🏆 {best}</span><span className="chip">{'❤️'.repeat(Math.max(h.lives??3,0))}</span><button className="btn" onClick={()=>{muted=!muted;setMute(muted)}}>{mute?'🔇':'🔊'}</button>{Object.entries(h.pw||{}).map(([k,v])=><span key={k} className="chip" style={{background:PW[k]}}>{ICON[k]} {v}s</span>)}</div><div className="toast">{h.msg}</div></>}
  {ph==='start'&&<div className="screen"><img className="app-logo" src={import.meta.env.BASE_URL+'app-logo.webp'} alt="Sweet Box Run logo"/><img className="face" src={import.meta.env.BASE_URL+'player-face.jpg'} alt="Runner"/><h1>SWEET BOX RUN</h1><div>Bro, return the sweets! Delivery boys are coming!</div><button className="btn big" onClick={start}>▶ PLAY</button><div>Best: {best} · Arrows/WASD/Space · swipe on mobile · P to pause</div></div>}
  {ph==='pause'&&<div className="screen"><h1>PAUSED</h1><button className="btn big" onClick={pause}>Resume</button></div>}
  {ph==='over'&&<div className="screen"><h1>GAME OVER</h1><div style={{fontSize:28}}>{h.nb?'🎉 New best! You escaped with the sweets!':'Caught!'}</div><div style={{fontSize:24}}>Score {h.score} · 🎁 {h.sweets} · Best {best}</div><button className="btn big" onClick={start}>↻ RETRY</button></div>}
 </div>}
}