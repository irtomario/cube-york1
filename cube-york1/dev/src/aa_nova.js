/* ======================= PATCH AA — NOVA ABITATA: PEDONI SUI MARCIAPIEDI E NELLE PIAZZE, TRAFFICO CON SEMAFORI ======================= */
const NVP={lanes:[],pend:null,idle:null,net:null,edges:[],lights:null,lamp:null,lt:0,spT:0,max:0};
function nvNear(x,z,m){const Z=OVL[0];return x>Z.x0-(m||0)&&x<Z.x1+(m||0)&&z>Z.z0-(m||0)&&z<Z.z1+(m||0);}
// ---------- rete stradale di Nova: incroci tra viali e strade, tratti tra incroci vicini ----------
function nvNetBuild(){const N=[];NV.AV.forEach((a,ai)=>NV.ST.forEach((s,si)=>{if(s.z>=a.a-1&&s.z<=a.b+1&&a.x>=s.a-1&&a.x<=s.b+1)N.push({id:N.length,x:a.x,z:s.z,ai,si,av:a,st:s,nb:[]});}));
 const link=(A,B,road)=>{const dx=Math.sign(B.x-A.x),dz=Math.sign(B.z-A.z),hw=road==='av'?A.av.hw:A.st.hw;A.nb.push({to:B,dx,dz,road,hw});B.nb.push({to:A,dx:-dx,dz:-dz,road,hw});};
 NV.AV.forEach((a,ai)=>{const L=N.filter(n=>n.ai===ai).sort((p,q)=>p.z-q.z);for(let i=0;i<L.length-1;i++)link(L[i],L[i+1],'av');});
 NV.ST.forEach((s,si)=>{const L=N.filter(n=>n.si===si).sort((p,q)=>p.x-q.x);for(let i=0;i<L.length-1;i++)link(L[i],L[i+1],'st');});
 NVP.net=N;NVP.edges=[];for(const n of N)for(const e of n.nb)NVP.edges.push({from:n,e});}
const nvLaneOff=hw=>hw>=12?hw*.56:hw*.5;
// distanza dalla linea d'arresto: metà della strada che si incrocia più un margine
function nvStopD(node,road){return (road==='av'?node.st.hw:node.av.hw)+3;}
function nvSpawn(type,ed,frac){const A0=ed.from,e=ed.e,B=e.to,lo=nvLaneOff(e.hw),rx=-e.dz,rz=e.dx,sd0=nvStopD(A0,e.road),sd1=nvStopD(B,e.road);
 const ax=A0.x+e.dx*sd0+rx*lo,az=A0.z+e.dz*sd0+rz*lo,bx=B.x-e.dx*sd1+rx*lo,bz=B.z-e.dz*sd1+rz*lo,x=lerp(ax,bx,frac),z=lerp(az,bz,frac);
 if((bx-ax)*e.dx+(bz-az)*e.dz<6)return null;for(const o of dynCars)if(!o.dead&&Math.hypot(o.px-x,o.pz-z)<(o.car&&o.car.ai?14:6))return null;if(player.veh&&Math.hypot(player.veh.px-x,player.veh.pz-z)<20)return null;if(bAt(x,z))return null;
 const yaw=Math.atan2(-e.dx,-e.dz),b=trMake(type,x,groundH(x,z)+.82,z,yaw),t=TRV[type]||{v:12};
 b.car.ai={i:0,j:0,di:e.dx,dj:e.dz,wp:[{x:bx,z:bz,stop:1,ni:200+B.ai,nj:200+B.si,ax:e.road==='av'?0:1}],mode:'norm',vmax:t.v*(.88+.24*Math.random()),T:0,B:0,S:0,lastV:0,crash:0,stuck:0,rev:0,type,ph:Math.random()*2,out:false,bar:b.car.bar||null,siren:false,horn:0,nv:{node:B,dx:e.dx,dz:e.dz,road:e.road,hw:e.hw}};
 b.car.ai.drv=trDriver(b.obj,b.car.drvPos[0],b.car.drvPos[1],b.car.drvPos[2]);const sp=b.car.ai.vmax*.6;b.vx=e.dx*sp;b.vz=e.dz*sp;TRF.cars.push(b);return b;}
// pianificazione: all'incrocio si sceglie il prossimo tratto (dritto più spesso), curva morbida, linea d'arresto col semaforo
function nvPlan(b){const A=b.car.ai,S=A.nv,B=S.node,opts=[];for(const e of B.nb){if(e.dx===-S.dx&&e.dz===-S.dz)continue;const straight=e.dx===S.dx&&e.dz===S.dz;opts.push([(straight?.6:.3)*Math.random()+(A.mode==='flee'?Math.random()*.3:0),e]);}
 let e;if(!opts.length)e=B.nb.find(q=>q.dx===-S.dx&&q.dz===-S.dz)||B.nb[0];else{opts.sort((p,q)=>q[0]-p[0]);e=opts[0][1];}if(!e){A.wp.push({x:B.x,z:B.z});return;}
 const loIn=nvLaneOff(S.hw),loOut=nvLaneOff(e.hw),rIx=-S.dz,rIz=S.dx,rOx=-e.dz,rOz=e.dx,sIn=nvStopD(B,S.road),sOut=nvStopD(B,e.road);
 const pin={x:B.x-S.dx*sIn+rIx*loIn,z:B.z-S.dz*sIn+rIz*loIn},pout={x:B.x+e.dx*sOut+rOx*loOut,z:B.z+e.dz*sOut+rOz*loOut};
 if(e.dx===S.dx&&e.dz===S.dz)A.wp.push({x:pout.x,z:pout.z});
 else if(e.dx===-S.dx&&e.dz===-S.dz){A.wp.push({x:B.x+rIx*loIn*.2,z:B.z+rIz*loIn*.2,turn:1},{x:pout.x,z:pout.z,turn:1});}
 else{const c=S.dx!==0?{x:pout.x,z:pin.z}:{x:pin.x,z:pout.z};for(let k=1;k<=4;k++){const t=k/4,u=1-t;A.wp.push({x:u*u*pin.x+2*u*t*c.x+t*t*pout.x,z:u*u*pin.z+2*u*t*c.z+t*t*pout.z,turn:1});}}
 const C=e.to,sC=nvStopD(C,e.road);A.wp.push({x:C.x-e.dx*sC+rOx*loOut,z:C.z-e.dz*sC+rOz*loOut,stop:1,ni:200+C.ai,nj:200+C.si,ax:e.road==='av'?0:1});
 A.nv={node:C,dx:e.dx,dz:e.dz,road:e.road,hw:e.hw};A.di=e.dx;A.dj=e.dz;}
{const tp1=trPlan;trPlan=function(b){const A=b.car&&b.car.ai;if(A&&A.nv)return nvPlan(b);return tp1(b);};}
// ---------- semafori di Nova (stessa logica a fasi dell'isola) ----------
function nvLightsBuild(){const H=[];for(const n of NVP.net)for(const e of n.nb){const dx=-e.dx,dz=-e.dz,hw=e.hw,st=nvStopD(n,e.road),rx=-dz,rz=dx;// auto che arrivano lungo (dx,dz)
  const x=n.x-dx*(st+1)+rx*(hw+1.8),z=n.z-dz*(st+1)+rz*(hw+1.8);if(bAt(x,z))continue;H.push({x,z,ry:Math.atan2(-dx,-dz),ni:200+n.ai,nj:200+n.si,ax:e.road==='av'?0:1});}
 const N=H.length;if(!N)return;const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.09,4.6,10).translate(0,2.3,0),MS(0x9aa0a6,.35,.8),N),arm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.05,.05,2.2,8).rotateZ(Math.PI/2).translate(-1.1,4.5,0),MS(0x9aa0a6,.35,.8),N),
  head=new THREE.InstancedMesh(rboxGeo(.32,.95,.26,.06,1),MS(0x1e2124,.55,.35),N),lamp=new THREE.InstancedMesh(new THREE.SphereGeometry(.095,12,8),new THREE.MeshBasicMaterial({color:0xffffff}),N*3);
 H.forEach((h,k)=>{const y=groundH(h.x,h.z),sx=Math.sin(h.ry),sz=Math.cos(h.ry),cx=Math.cos(h.ry),cz=-Math.sin(h.ry);_dm.rotation.set(0,h.ry,0);_dm.scale.set(1,1,1);_dm.position.set(h.x,y,h.z);_dm.updateMatrix();pole.setMatrixAt(k,_dm.matrix);arm.setMatrixAt(k,_dm.matrix);
  const hx=h.x-cx*2.1,hz=h.z-cz*2.1;_dm.position.set(hx,y+4.0,hz);_dm.updateMatrix();head.setMatrixAt(k,_dm.matrix);
  for(let l=0;l<3;l++){_dm.position.set(hx+sx*.14,y+4.31-l*.3,hz+sz*.14);_dm.updateMatrix();lamp.setMatrixAt(k*3+l,_dm.matrix);lamp.setColorAt(k*3+l,_tc.setRGB(.05,.05,.05));}});
 for(const m of[pole,arm,head]){m.castShadow=true;m.receiveShadow=true;}scene.add(pole,arm,head,lamp);NVP.lights=H;NVP.lamp=lamp;}
{const tl0=trLightsUpdate;trLightsUpdate=function(dt){tl0(dt);if(!NVP.lamp)return;NVP.lt-=dt;if(NVP.lt>0)return;NVP.lt=.25;const L=NVP.lamp,on=[[.1,4.5,.6],[5,3.2,.1],[5.5,.2,.08]],off=[[.02,.06,.03],[.09,.06,.01],[.09,.02,.02]];
 NVP.lights.forEach((h,k)=>{const s=trLight(h.ni,h.nj,h.ax);for(let l=0;l<3;l++){const st=2-l,c=st===s?on[st]:off[st];L.setColorAt(k*3+l,_tc.setRGB(c[0],c[1],c[2]));}});L.instanceColor.needsUpdate=true;};}
// ---------- traffico: nasce e sparisce attorno a chi guarda, solo dentro Nova ----------
{const ts1=trafficStep;trafficStep=function(dt){ts1(dt);if(!NVP.net)return;const cp=camera.position;if(!nvNear(cp.x,cp.z,220)||cp.y>450)return;
 NVP.spT-=dt;let n=0;for(const b of TRF.cars)if(!b.dead&&b.car&&b.car.ai&&b.car.ai.nv)n++;
 if(NVP.spT<=0&&n<NVP.max){NVP.spT=.35;for(let k=0;k<8;k++){const ed=NVP.edges[Math.floor(Math.random()*NVP.edges.length)],mx=(ed.from.x+ed.e.to.x)/2,mz=(ed.from.z+ed.e.to.z)/2,d=Math.hypot(mx-cp.x,mz-cp.z);if(d<90||d>300)continue;if(nvSpawn(trPick(),ed,.15+Math.random()*.7))break;}}};}

// ---------- pedoni: marciapiedi lungo viali e strade, gente ferma nelle piazze e nei giardini ----------
function nvLanesBuild(){const L=[];for(const a of NV.AV)for(const s of[-1,1])L.push({ax:'z',c:a.x+s*(a.hw+3.3),a:a.a+4,b:a.b-4});for(const t of NV.ST)for(const s of[-1,1])L.push({ax:'x',c:t.z+s*(t.hw+3.3),a:t.a+4,b:t.b-4});NVP.lanes=L;
 const I=[];const pl=NV.PLAZA;I.push([pl.x0+8,pl.x1-8,pl.z0+8,pl.z1-8]);for(const p of NV.parks)I.push([p[0]+3,p[1]-3,p[2]+3,p[3]-3]);NVP.idle=I;}
function nvSpot(){const P=player;for(let k=0;k<14;k++){if(Math.random()<.22&&NVP.idle.length){const r=NVP.idle[Math.floor(Math.random()*NVP.idle.length)],x=rand(r[0],r[1]),z=rand(r[2],r[3]);if(Math.hypot(x-P.x,z-P.z)>160||bAt(x,z))continue;return {x,z,idle:true};}
  const L=NVP.lanes[Math.floor(Math.random()*NVP.lanes.length)];let x,z;if(L.ax==='z'){x=L.c;z=clamp(P.z+rand(-140,140),L.a,L.b);}else{z=L.c;x=clamp(P.x+rand(-140,140),L.a,L.b);}
  const d=Math.hypot(x-P.x,z-P.z);if(d<25||d>165||bAt(x,z))continue;const g=groundBase(x,z);if(waterAt(x,z)>g+.2)continue;return {x,z,lane:L};}return null;}
{const ns0=npcSpot;npcSpot=function(){const P=player;if(NVP.lanes.length&&nvNear(P.x,P.z,120)){const s=nvSpot();if(s){NVP.pend=s;return [s.x,s.z];}return null;}return ns0();};}
{const sp0=spawnNPC;spawnNPC=function(x,y,z,o){const p=NVP.pend;NVP.pend=null;const n=sp0(x,y,z,o);if(n&&p){if(p.idle){n.idle=true;n.nvIdle=true;}else{n.nv=p.lane;n.dir=Math.random()<.5?1:-1;n.lane='nv';}}return n;};}
function nvCross(L,x,z){if(L.ax==='z'){for(const s of NV.ST)if(x>s.a-4&&x<s.b+4&&Math.abs(z-s.z)<s.hw+3.3)return {ax:'x',s};}else{for(const a of NV.AV)if(z>a.a-4&&z<a.b+4&&Math.abs(x-a.x)<a.hw+3.3)return {ax:'z',a};}return null;}
function nvWalk(n,dt){const L=n.nv,sp=n.spd;
 if(L.ax==='z'){n.x+=(L.c-n.x)*Math.min(1,dt*2);n.z+=n.dir*sp*dt;n.yaw=n.dir>0?Math.PI:0;if(n.z<L.a||n.z>L.b){n.dir*=-1;n.z=clamp(n.z,L.a,L.b);}}
 else{n.z+=(L.c-n.z)*Math.min(1,dt*2);n.x+=n.dir*sp*dt;n.yaw=n.dir>0?-Math.PI/2:Math.PI/2;if(n.x<L.a||n.x>L.b){n.dir*=-1;n.x=clamp(n.x,L.a,L.b);}}
 // agli incroci a volte si svolta sul marciapiede della strada trasversale
 const c=nvCross(L,n.x,n.z);if(c){if(!n.dec){n.dec=1;if(Math.random()<.4){let nl=null;if(c.ax==='x'){const sg=n.z>c.s.z?1:-1,cc=c.s.z+sg*(c.s.hw+3.3);nl=NVP.lanes.find(q=>q.ax==='x'&&Math.abs(q.c-cc)<.5&&n.x>q.a&&n.x<q.b);}else{const sg=n.x>c.a.x?1:-1,cc=c.a.x+sg*(c.a.hw+3.3);nl=NVP.lanes.find(q=>q.ax==='z'&&Math.abs(q.c-cc)<.5&&n.z>q.a&&n.z<q.b);}if(nl){n.nv=nl;n.dir=Math.random()<.5?1:-1;}}}}else n.dec=0;
 if(bAt(n.x,n.z)){n.dir*=-1;if(L.ax==='z')n.z+=n.dir*1.5;else n.x+=n.dir*1.5;}
 n.spdNow=sp;n.ph+=sp*dt*TAU/(sp>3?2.4:1.5);if(!n.roof)n.y=groundH(n.x,n.z);}
{const nw1=npcWalk;npcWalk=function(n,dt){if(n.nv&&!(n.flee>0)&&!n.idle&&!n.ctl)return nvWalk(n,dt);if(n.nv&&n.flee>0)n.nv=null;return nw1(n,dt);};}
// la costruzione avviene dopo il mondo (il gioco chiama trInit dopo aver creato città e Nova)
{const ti0=trInit;trInit=function(){ti0();try{nvNetBuild();nvLanesBuild();nvLightsBuild();NVP.max={bassa:6,media:11,alta:16,ultra:22}[S.q]||12;}catch(e){console.warn('Nova traffico',e);}};}

// ---------- Nova più densa: palazzi bassi e medi negli spazi vuoti dei lotti, attorno alle torri ----------
function nvMore(){const R=mulberry32(77731),sn=v=>Math.round((v-2)/4)*4+2;
 const occ=(x,z)=>{for(const b of buildings){if(x>b.x0-5&&x<b.x0+b.w+5&&z>b.z0-5&&z<b.z0+b.d+5)return true;}for(const T of NOVA.T){if(Math.hypot(x-T.x,z-T.z)<(T.rb||30)+6)return true;}
  for(const p of NV.parks)if(x>p[0]-3&&x<p[1]+3&&z>p[2]-3&&z<p[3]+3)return true;const pl=NV.PLAZA;if(x>pl.x0-6&&x<pl.x1+6&&z>pl.z0-6&&z<pl.z1+6)return true;
  if(Math.hypot(x-NV.RING.x,z-NV.RING.z)<NV.RING.R+12)return true;if(Math.hypot(x-NV.DOME.x,z-NV.DOME.z)<NV.DOME.R+12)return true;return false;};
 let made=0;for(const C of NV.COLS)for(const Rw of NV.ROWS){const x0=sn(C[0]+4),z0=sn(Rw[0]+4),x1=C[1]-3,z1=Rw[1]-3,nx=Math.floor((x1-x0)/4),nz=Math.floor((z1-z0)/4);if(nx<5||nz<5)continue;
  const F=new Uint8Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)F[i+j*nx]=occ(x0+i*4+2,z0+j*4+2)?1:0;let put=0;
  for(let t=0;t<220&&put<5;t++){const w=4+Math.floor(R()*10),d=4+Math.floor(R()*8);if(w>nx||d>nz)continue;const i0=Math.floor(R()*(nx-w+1)),j0=Math.floor(R()*(nz-d+1));let ok=true;
   for(let j=j0;j<j0+d&&ok;j++)for(let i=i0;i<i0+w;i++)if(F[i+j*nx]){ok=false;break;}if(!ok)continue;
   const tall=R()<.5&&w>=6&&d>=5,fl=tall?8+Math.floor(R()*9):2+Math.floor(R()*4),st=tall?(R()<.55?8:9):(R()<.5?9:10),a=Math.max(2,Math.round(fl*.35));
   const b=addBuilding(x0+i0*4,z0+j0*4,w*4,d*4,fl,st,tall&&w>=8&&d>=7?[[0,0,a],[1,a,fl]]:[[0,0,fl]]);b.nova=true;NOVA.B.push(b);made++;put++;
   for(let j=Math.max(0,j0-1);j<Math.min(nz,j0+d+1);j++)for(let i=Math.max(0,i0-1);i<Math.min(nx,i0+w+1);i++)F[i+j*nx]=1;}}
 NVP.more=made;}
{const g2=genCity;genCity=function(){g2();try{nvMore();}catch(e){console.warn('Nova palazzi',e);}};}
// gli arredi già previsti non finiscono dentro i palazzi nuovi
{const np0=nvProps;nvProps=function(){const ap0=addProp;addProp=function(k,x,y,z,yaw,b){if(bAt(x,z))return null;return ap0(k,x,y,z,yaw,b);};try{np0();}finally{addProp=ap0;}};}
