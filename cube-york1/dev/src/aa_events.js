/* ======================= PATCH AA — LA CITTÀ VIVE: EVENTI CASUALI ======================= */
// Ogni tanto, attorno a chi gioca, succede qualcosa: un appartamento prende fuoco (vetri che scoppiano, fiamme dalla finestra,
// fumo nero, i pompieri arrivano a sirene spiegate), salta un idrante (getto d'acqua alto, pozzanghera che si allarga),
// un'auto si guasta in mezzo alla strada (vapore dal cofano, l'autista scende, quelli dietro suonano il clacson).
// Dopo un'esplosione partono gli antifurti delle auto parcheggiate. Stormi di piccioni beccano sui marciapiedi e nelle piazze,
// volano via quando passa qualcuno o scoppia qualcosa, girano sopra i tetti e si posano altrove.
const EVT={t:22,act:[],alarms:[],flocks:[],bird:null,fT:0};
function evNear(x,z,dmin,dmax){const c=camera.position,d=Math.hypot(x-c.x,z-c.z);return d>=dmin&&d<=dmax;}
// ---------- 1. incendio in un appartamento ----------
function evFire(){const cp=camera.position,cand=[];for(const b of buildings){if(b.vox||b.h<12||b.frame)continue;const cx=b.x0+b.w/2,cz=b.z0+b.d/2;if(!evNear(cx,cz,90,380))continue;cand.push(b);}
 if(!cand.length)return false;for(let tries=0;tries<8;tries++){const b=cand[Math.floor(Math.random()*cand.length)],cx=b.x0+b.w/2,cz=b.z0+b.d/2,dx=cp.x-cx,dz=cp.z-cz;let nx=0,nz=0,x,z;
  if(Math.abs(dx)/b.w>Math.abs(dz)/b.d){nx=Math.sign(dx)||1;x=nx>0?b.x0+b.w:b.x0;z=b.z0+4*Math.floor(rand(1,Math.max(1.01,b.d/4-1)))+2;}else{nz=Math.sign(dz)||1;z=nz>0?b.z0+b.d:b.z0;x=b.x0+4*Math.floor(rand(1,Math.max(1.01,b.w/4-1)))+2;}
  const fl=2+Math.floor(Math.random()*Math.max(1,Math.min(13,Math.floor(b.h/4)-3))),y=fl*4+1.3;if(!inTiers(b,x-nx*.6,y,z-nz*.6))continue;
  // la facciata deve dare sulla strada (non su un cortile chiuso tra due palazzi)
  let open=true;for(const d of [3,8,14])if(bAt(x+nx*d,z+nz*d)){open=false;break;}if(!open)continue;
  const e={k:'fire',b,x,y,z,nx,nz,t:0,life:rand(85,160),lt:0,sp:false};EVT.act.push(e);
  for(let i=0;i<7;i++)shardSpawn(x+nx*.3+(-nz)*rand(-1.4,1.4),y+rand(-.4,1.2),z+nz*.3+nx*rand(-1.4,1.4),nx*rand(2,5),rand(0,2),nz*rand(2,5),rand(.08,.2));
  EVT.truck=rand(10,22);return true;}return false;}
function evFireStep(e,dt){e.t+=dt;const k=Math.min(1,e.t/12)*Math.min(1,(e.life-e.t)/20);if(k<=0)return false;
 if(e.b.vox&&(e.chk=(e.chk||0)-dt)<=0){e.chk=1;if(!pointContact(e.x-e.nx*.6,e.y,e.z-e.nz*.6,CT))return false;}
 const tx=-e.nz,tz=e.nx,cp=camera.position,dc=Math.abs(e.x-cp.x)+Math.abs(e.z-cp.z);if(dc>900)return true;
 if(psF&&Math.random()<dt*40*k)for(let i=0;i<2;i++){const u=rand(-1.4,1.4);fireP(e.x+e.nx*.35+tx*u,e.y+rand(-.8,.5),e.z+e.nz*.35+tz*u,e.nx*rand(.5,2.2),rand(2.5,5),e.nz*rand(.5,2.2),rand(1.2,2.3)*k,rand(.6,1.2));}
 if(Math.random()<dt*8*k)smoke(e.x+e.nx*1.3+tx*rand(-1.2,1.2),e.y+1.8,e.z+e.nz*1.3+tz*rand(-1.2,1.2),e.nx*rand(.6,1.8)+rand(-.4,.4),rand(3,6),e.nz*rand(.6,1.8)+rand(-.4,.4),rand(3,6),rand(12,22),true);
 e.lt-=dt;if(e.lt<=0&&dc<300){e.lt=.2;flashLight(e.x+e.nx*1.5,e.y,e.z+e.nz*1.5,1,.5,.18,7*k*(.7+.6*Math.random()),20,.3);}
 if(dc<90&&Math.random()<dt*3*k)sfx({x:e.x,y:e.y,z:e.z,src:'noise',filter:'bandpass',ff0:rand(900,2600),q:1.5,g:.08,a:.002,d:rand(.04,.12),ref:10});
 // il fuoco sale al piano di sopra
 if(!e.sp&&e.t>35&&Math.random()<dt*.04){e.sp=true;if(inTiers(e.b,e.x-e.nx*.6,e.y+4,e.z-e.nz*.6)&&EVT.act.filter(q=>q.k==='fire').length<4)EVT.act.push({k:'fire',b:e.b,x:e.x,y:e.y+4,z:e.z,nx:e.nx,nz:e.nz,t:0,life:Math.max(40,e.life-e.t),lt:0,sp:true});}
 return true;}
// ---------- 2. idrante saltato ----------
let EVT_HYD=null;
function evGeyser(){const cp=camera.position;for(let k=0;k<14;k++){const i=Math.round((cp.x+rand(-230,230))/140),j=Math.round((cp.z+rand(-230,230))/84),sx=Math.random()<.5?-1:1,sz=Math.random()<.5?-1:1,x=i*140+sx*10.3,z=j*84+sz*7.3;
  if(Math.abs(x)>CX-12||Math.abs(z)>CZ-12||(x>-131&&x<131&&z>-582&&z<-90)||bAt(x,z)||!evNear(x,z,35,260))continue;
  if(!EVT_HYD){const g=new THREE.CylinderGeometry(.13,.16,.62,12).translate(0,.31,0),m=new THREE.MeshStandardMaterial({color:0x8e1c12,roughness:.55,metalness:.3});EVT_HYD={g,m,cap:new THREE.CylinderGeometry(.17,.17,.08,12)};}
  const grp=new THREE.Group(),body=new THREE.Mesh(EVT_HYD.g,EVT_HYD.m);body.rotation.z=Math.PI/2*.92;body.position.set(.55,.17,.1);body.castShadow=true;grp.add(body);
  const stub=new THREE.Mesh(EVT_HYD.cap,EVT_HYD.m);stub.position.y=.04;grp.add(stub);grp.position.set(x,groundH(x,z),z);grp.rotation.y=rand(0,TAU);scene.add(grp);
  EVT.act.push({k:'gey',x,z,y:groundH(x,z),t:0,life:rand(50,95),grp,pool:null,sx,sz});return true;}return false;}
function evGeyStep(e,dt){e.t+=dt;const k=Math.min(1,e.t/1.5)*Math.max(0,Math.min(1,(e.life-e.t)/8));const cp=camera.position,dc=Math.abs(e.x-cp.x)+Math.abs(e.z-cp.z);
 if(k>0&&psA&&dc<500){const l=TODC.lit,n=Math.min(7,Math.floor(dt*60*k+Math.random()));for(let i=0;i<n;i++){const s=rand(.85,1),c=.72*l+.05;psA.spawn(e.x+rand(-.1,.1),e.y+.3,e.z+rand(-.1,.1),rand(-1.2,1.2),rand(10,15.5)*s*Math.sqrt(k),rand(-1.2,1.2),rand(1.6,2.6),.2,1.1,c,c*1.04,c*1.09,.62,.22,9.8,2);}
  if(Math.random()<dt*20*k){const a=rand(0,TAU),c=.7*l+.05;psA.spawn(e.x,e.y+.25,e.z,Math.cos(a)*rand(2,4.5),rand(.5,2),Math.sin(a)*rand(2,4.5),rand(.5,.9),.15,.5,c,c,c*1.05,.6,.2,9.8,2);}}
 if(Math.random()<dt*1.1*k&&dc<80)sfx({x:e.x,y:e.y+2,z:e.z,src:'noise',filter:'bandpass',ff0:1500,ff1:1100,g:.2*k,a:.12,d:1.3,ref:12});
 // la pozza sulla carreggiata: pellicola d'acqua che si allarga verso il centro della strada
 const R=Math.min(6.5,.6+e.t*.12)*(e.t<e.life?1:Math.max(0,1-(e.t-e.life)/40));if(R>.05){if(!e.pool){if(!EVT.ptex){const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d'),gr=q.createRadialGradient(64,64,8,64,64,64);gr.addColorStop(0,'#fff');gr.addColorStop(.62,'#ddd');gr.addColorStop(1,'#000');q.fillStyle=gr;q.fillRect(0,0,128,128);for(let i=0;i<70;i++){q.fillStyle='rgba(0,0,0,'+(.15+Math.random()*.3)+')';const a=Math.random()*6.283,r=40+Math.random()*24;q.beginPath();q.arc(64+Math.cos(a)*r,64+Math.sin(a)*r,4+Math.random()*9,0,6.283);q.fill();}EVT.ptex=new THREE.CanvasTexture(c);}
  e.pool=new THREE.Mesh(new THREE.CircleGeometry(1,32).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x0a0c0d,roughness:.07,metalness:0,alphaMap:EVT.ptex,transparent:true,depthWrite:false,opacity:.92,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,envMapIntensity:.8}));e.pool.receiveShadow=true;scene.add(e.pool);}
  e.pool.position.set(e.x-e.sx*R*.55,.02,e.z-e.sz*R*.35);e.pool.scale.set(R*1.25,1,R);}
 if(e.t>e.life+40){if(e.pool){scene.remove(e.pool);e.pool.geometry.dispose();e.pool.material.dispose();}scene.remove(e.grp);return false;}return true;}
// ---------- 3. auto in panne ----------
function evBreak(){for(const b of TRF.cars){const A=b.car&&b.car.ai;if(!A||A.out||A.mode!=='norm'||A.rd||b.dead||b===player.veh||A.brk)continue;if(!evNear(b.px,b.pz,45,220)||Math.random()<.4)continue;
  A.vmax=0;A.brk=1;EVT.act.push({k:'brk',b,t:0,life:rand(50,90),hT:rand(2,5)});return true;}return false;}
function evBrkStep(e,dt){e.t+=dt;const b=e.b;if(b.dead)return false;const A=b.car&&b.car.ai;const sp=Math.hypot(b.vx,b.vz),R=b.R,fx=-R[2],fz=-R[8];
 if(sp<.6&&e.t<e.life&&Math.random()<dt*7)smoke(b.px+fx*(b.hz||2.2)*.85,b.py+.7,b.pz+fz*(b.hz||2.2)*.85,rand(-.3,.3),rand(.8,1.8),rand(-.3,.3),rand(.5,.9),rand(2,4),false);
 if(sp<.5&&e.t>7&&A&&!A.out)trExit(b,false);
 // chi è in coda dietro suona il clacson
 e.hT-=dt;if(e.hT<=0){e.hT=rand(2.5,7);for(const o of TRF.cars){if(o===b||o.dead)continue;const dx=o.px-b.px,dz=o.pz-b.pz,d=Math.hypot(dx,dz);if(d<4||d>16||Math.hypot(o.vx,o.vz)>.6)continue;if(dx*fx+dz*fz>0)continue;
   if(evNear(o.px,o.pz,0,90))sfx({x:o.px,y:o.py+.5,z:o.pz,src:'osc',type:'square',f0:rand(380,470),filter:'lowpass',ff0:1900,g:.24,a:.01,d:rand(.3,.9),ref:14});break;}}
 return e.t<e.life;}
// ---------- 4. antifurti delle auto parcheggiate dopo un'esplosione ----------
{const ex3=explode;explode=function(x,y,z,R,P,o){ex3(x,y,z,R,P,o);try{let n=0;for(const sl of PC.slots){if(!sl.alive)continue;const d=Math.hypot(sl.x-x,sl.z-z);if(d<R*2.4||d>R*9+20||Math.random()>.18)continue;
  if(EVT.alarms.length>=4)break;EVT.alarms.push({x:sl.x,z:sl.z,t:-rand(.2,1.5),life:rand(14,30),ty:Math.floor(Math.random()*3),bt:0});if(++n>=2)break;}}catch(e){}};}
function evAlarmStep(a,dt){a.t+=dt;if(a.t<0)return true;if(a.t>a.life)return false;a.bt-=dt;if(a.bt>0||!evNear(a.x,a.z,0,140))return true;
 if(a.ty===0){a.bt=.5;sfx({x:a.x,y:1,z:a.z,src:'osc',type:'square',f0:950,f1:1500,filter:'lowpass',ff0:3000,g:.11,a:.01,d:.45,ref:10});}
 else if(a.ty===1){a.bt=.3;a.ph=!a.ph;sfx({x:a.x,y:1,z:a.z,src:'osc',type:'square',f0:a.ph?780:1120,filter:'lowpass',ff0:3000,g:.11,a:.005,d:.26,ref:10});}
 else{a.bt=.16;sfx({x:a.x,y:1,z:a.z,src:'osc',type:'square',f0:2100,f1:1400,filter:'lowpass',ff0:3500,g:.09,a:.003,d:.1,ref:10});}return true;}
// ---------- 5. piccioni ----------
function birdInit(){if(EVT.bird)return;const P=[],W=[];const tri=(a,b,c,w)=>{P.push(...a,...b,...c);W.push(w[0],w[1],w[2]);};
 // corpo a fuso (otto facce), testa, ali in due pezzi per lato (la punta sbatte di più), coda a ventaglio
 const Nq=[0,.03,-.2],Tq=[0,.035,.15],Lq=[-.06,.03,-.03],Rq=[.06,.03,-.03],Uq=[0,.1,-.04],Dq=[0,-.02,-.03],Z=[0,0,0];
 for(const [a,b] of [[Lq,Uq],[Uq,Rq],[Rq,Dq],[Dq,Lq]]){tri(Nq,b,a,Z);tri(Tq,a,b,Z);}
 const H=[0,.12,-.18],h1=[-.025,.07,-.14],h2=[.025,.07,-.14],h3=[0,.08,-.23];tri(H,h1,h3,Z);tri(H,h3,h2,Z);tri(H,h2,h1,Z);
 tri([.045,.07,-.08],[.21,.075,-.02],[.045,.07,.05],[0,.5,0]);tri([.21,.075,-.02],[.36,.07,.04],[.17,.075,.07],[.5,1,.5]);
 tri([-.045,.07,-.08],[-.045,.07,.05],[-.21,.075,-.02],[0,0,.5]);tri([-.21,.075,-.02],[-.17,.075,.07],[-.36,.07,.04],[.5,.5,1]);
 tri([-.035,.04,.12],[.035,.04,.12],[.06,.035,.26],Z);tri([-.035,.04,.12],[.06,.035,.26],[-.06,.035,.26],Z);
 const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(W,1));g.computeVertexNormals();
 const N=160;g.setAttribute('aF',new THREE.InstancedBufferAttribute(new Float32Array(N*2),2).setUsage(THREE.DynamicDrawUsage));
 const m=new THREE.MeshStandardMaterial({color:0x2a2c31,roughness:.85,side:THREE.DoubleSide});m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aW;attribute vec2 aF;uniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat fl=sin(aF.x)*aF.y;transformed.y+=fl*aW*.18;');};
 m.customProgramCacheKey=()=>'pigeon';const im=new THREE.InstancedMesh(g,m,N);im.count=0;im.frustumCulled=false;im.castShadow=false;scene.add(im);EVT.bird={im,N,aF:g.attributes.aF};}
function flockNew(x,y,z,roof){const n=Math.round(rand(8,18)),B=[];for(let i=0;i<n;i++){const a=rand(0,TAU),r=Math.sqrt(Math.random())*2.6;B.push({x:x+Math.cos(a)*r,y,z:z+Math.sin(a)*r,yaw:rand(0,TAU),vy:0,ph:rand(0,TAU),hop:rand(0,3),ox:rand(-6,6),oy:rand(-2,2),oz:rand(-6,6),fl:0});}
 return{x,y,z,roof,B,st:'ground',t:0,cx:x,cy:y,cz:z,tx:0,ty:0,tz:0,ang:0,rad:0,dir:1,land:null,fly:0};}
function flockSpot(){const cp=camera.position;for(let k=0;k<20;k++){const a=rand(0,TAU),r=rand(25,140),x=cp.x+Math.cos(a)*r,z=cp.z+Math.sin(a)*r;
  if(isCore(x,z)){if(Math.abs(x)>CX||Math.abs(z)>CZ)continue;const b=bAt(x,z);if(b){if(b.vox||b.h>45||Math.random()<.5)continue;return{x,y:b.h,z,roof:true};}if(Math.abs(aveOff(x))<9.5||Math.abs(stOff(z))<6.5)continue;return{x,y:groundH(x,z),z,roof:false};}
  if(typeof inZone==='function'&&inZone(x,z,0)&&!bAt(x,z)){const s=typeof rcSurfZone==='function'?rcSurfZone(x,z):1;if(s===1||s===2)return{x,y:groundH(x,z),z,roof:false};}}return null;}
function flockScare(F,sx,sz){if(F.st!=='ground')return;F.st='up';F.t=0;const a=Math.atan2(F.cz-sz,F.cx-sx);F.ang=a;F.rad=rand(25,55);F.dir=Math.random()<.5?1:-1;F.cy0=F.cy;F.alt=F.cy+rand(14,30);
 F.ox=F.cx-Math.cos(a)*F.rad;F.oz=F.cz-Math.sin(a)*F.rad;F.laps=rand(.8,1.8);F.land=flockSpot();
 if(evNear(F.cx,F.cz,0,60)){sfx({x:F.cx,y:F.cy+1,z:F.cz,src:'noise',filter:'bandpass',ff0:900,q:.8,g:.25,a:.01,d:.9,ref:10});for(let i=0;i<5;i++)sfx({x:F.cx,y:F.cy+1,z:F.cz,delay:rand(0,.5),src:'noise',filter:'highpass',ff0:2500,g:.08,a:.002,d:.07,ref:8});}}
{const ex4=explode;explode=function(x,y,z,R,P,o){ex4(x,y,z,R,P,o);for(const F of EVT.flocks)if(Math.hypot(F.cx-x,F.cz-z)<R*14+40)flockScare(F,x,z);};}
function flockStep(F,dt){F.t+=dt;const cp=camera.position;
 if(F.st==='ground'){// beccano, fanno piccoli saltelli; si spaventano se qualcuno si avvicina
  const P=player;const px=P.veh?P.veh.px:P.x,pz=P.veh?P.veh.pz:P.z,py=P.veh?P.veh.py:P.y;if(Math.hypot(px-F.cx,pz-F.cz)<(P.veh?9:5.5)&&Math.abs(py-F.cy)<6)flockScare(F,px,pz);
  if(!F.roof)for(const b of TRF.cars){if(Math.abs(b.px-F.cx)<5&&Math.abs(b.pz-F.cz)<5&&Math.hypot(b.vx,b.vz)>3){flockScare(F,b.px,b.pz);break;}}
  for(const q of F.B){q.hop-=dt;q.fl=0;if(q.hop<=0){q.hop=rand(.6,3.5);if(Math.random()<.6){const a=q.yaw+rand(-1,1);q.x-=Math.sin(a)*rand(.1,.35);q.z-=Math.cos(a)*rand(.1,.35);q.yaw=a;q.vy=1.4;}else q.yaw+=rand(-1.2,1.2);}
   if(Math.hypot(q.x-F.cx,q.z-F.cz)>3.2){q.yaw=Math.atan2(F.cx-q.x,F.cz-q.z)+Math.PI;}q.vy-=G*dt;q.y+=q.vy*dt;if(q.y<F.cy){q.y=F.cy;q.vy=0;}}return;}
 // in volo: decollo, uno o due giri sopra i tetti, planata verso il nuovo posatoio
 if(F.st==='up'||F.st==='circle'){const sp=11;F.ang+=F.dir*sp/F.rad*dt;const tx=F.ox+Math.cos(F.ang)*F.rad,tz=F.oz+Math.sin(F.ang)*F.rad,ty=F.st==='up'?F.cy0+(F.alt-F.cy0)*Math.min(1,F.t/2.2):F.alt+Math.sin(F.t*.7)*3;
  F.cx+=(tx-F.cx)*Math.min(1,dt*2.5);F.cz+=(tz-F.cz)*Math.min(1,dt*2.5);F.cy+=(ty-F.cy)*Math.min(1,dt*2);if(F.st==='up'&&F.t>2.2)F.st='circle';
  if(F.st==='circle'&&F.t>2.2+F.laps*TAU*F.rad/sp){if(F.land){F.st='down';F.t=0;F.sx=F.cx;F.sy=F.cy;F.sz=F.cz;F.dl=Math.max(3,Math.hypot(F.land.x-F.cx,F.land.z-F.cz)/9);}else{F.dead=true;}}}
 else if(F.st==='down'){const u=Math.min(1,F.t/F.dl),e=u*u*(3-2*u);F.cx=F.sx+(F.land.x-F.sx)*e;F.cz=F.sz+(F.land.z-F.sz)*e;F.cy=F.sy+(F.land.y-F.sy)*(1-(1-u)*(1-u));
  if(u>=1){F.st='ground';F.roof=F.land.roof;F.cy=F.land.y;for(const q of F.B){const a=rand(0,TAU),r=Math.sqrt(Math.random())*2.6;q.x=F.cx+Math.cos(a)*r;q.z=F.cz+Math.sin(a)*r;q.y=F.cy;q.vy=0;}}}
 for(const q of F.B){const k=Math.min(1,dt*(2+q.ph%1.5));const tx=F.cx+q.ox*(F.st==='down'?1-Math.min(1,F.t/F.dl)*.7:1),ty=F.cy+q.oy+(F.st==='down'?0:Math.sin(F.t*2+q.ph)*.8),tz=F.cz+q.oz;
  const dx=tx-q.x,dz=tz-q.z;q.x+=dx*k;q.y+=(ty-q.y)*k;q.z+=dz*k;if(dx*dx+dz*dz>.01)q.yaw=Math.atan2(dx,dz)+Math.PI;q.fl=F.st==='down'&&F.t>F.dl*.75?.5:1;}}
function birdsDraw(){const B=EVT.bird;if(!B)return;let n=0;const A=B.aF.array,t=U.uTime.value;
 for(const F of EVT.flocks)for(const q of F.B){if(n>=B.N)break;_dm.position.set(q.x,q.y+.08,q.z);_dm.rotation.set(0,q.yaw,0);_dm.scale.setScalar(1.2);_dm.updateMatrix();B.im.setMatrixAt(n,_dm.matrix);
  A[n*2]=(t*(q.fl?32:0)+q.ph*6)%(TAU*50);A[n*2+1]=q.fl;n++;}
 B.im.count=n;B.im.instanceMatrix.needsUpdate=true;B.aF.needsUpdate=true;}
function flocksStep(dt){const cp=camera.position;const city=(isCore(cp.x,cp.z)&&Math.abs(cp.x)<CX+60&&Math.abs(cp.z)<CZ+60)||(typeof inZone==='function'&&inZone(cp.x,cp.z,60));
 for(let i=EVT.flocks.length-1;i>=0;i--){const F=EVT.flocks[i];if(F.dead||Math.hypot(F.cx-cp.x,F.cz-cp.z)>320){EVT.flocks.splice(i,1);continue;}flockStep(F,dt);}
 EVT.fT-=dt;if(EVT.fT<=0){EVT.fT=4;if(city&&cp.y<300&&EVT.flocks.length<(QP===PRESETS.bassa?2:4)){const s=flockSpot();if(s){birdInit();EVT.flocks.push(flockNew(s.x,s.y,s.z,s.roof));}}}
 if(EVT.flocks.length||(EVT.bird&&EVT.bird.im.count)){birdInit();birdsDraw();}}
// ---------- regia degli eventi ----------
function evStep(dt){const cp=camera.position,city=Math.abs(cp.x)<CX+150&&Math.abs(cp.z)<CZ+150&&cp.y<450;
 EVT.t-=dt;if(EVT.t<=0){EVT.t=rand(38,85);if(city){const r=Math.random(),nf=EVT.act.filter(e=>e.k==='fire').length,ng=EVT.act.filter(e=>e.k==='gey').length,nb=EVT.act.filter(e=>e.k==='brk').length;let ok=false;
   if(r<.3&&nf<2)ok=evFire();else if(r<.58&&ng<2)ok=evGeyser();else if(nb<3)ok=evBreak();if(!ok)EVT.t=6;}}
 if(EVT.truck!==undefined){EVT.truck-=dt;if(EVT.truck<=0){EVT.truck=undefined;try{trEvent('fire');}catch(e){}}}
 for(let i=EVT.act.length-1;i>=0;i--){const e=EVT.act[i];let keep=true;try{keep=e.k==='fire'?evFireStep(e,dt):e.k==='gey'?evGeyStep(e,dt):evBrkStep(e,dt);}catch(er){keep=false;}if(!keep)EVT.act.splice(i,1);}
 for(let i=EVT.alarms.length-1;i>=0;i--)if(!evAlarmStep(EVT.alarms[i],dt))EVT.alarms.splice(i,1);
 flocksStep(dt);}
{const vv4=vehicleVisuals;vehicleVisuals=function(dt){vv4(dt);try{evStep(dt);}catch(e){if(!EVT.err){EVT.err=1;console.warn('eventi',e);}}};}
{const rs2=resetCity;resetCity=function(){rs2();for(const e of EVT.act){if(e.grp)scene.remove(e.grp);if(e.pool)scene.remove(e.pool);}EVT.act.length=0;EVT.alarms.length=0;};}
