/* ======================= PATCH AA — TRAFFICO SULLE STRADE EXTRAURBANE (anche nelle zone isolate) E ALL'AEROPORTO ======================= */
// Le auto seguono la loro corsia sul tracciato vero della strada (ponti, gallerie, curve), rallentano prima delle curve secondo
// l'aderenza (accelerazione laterale ~3 m/s²), agli incroci proseguono sull'altra strada, a Nova entrano nella rete di Nova,
// all'aeroporto accostano davanti al terminal, fanno scendere un passeggero con il trolley e ripartono.
const RTF={grid:null,max:6,spT:0,rmT:0};
const RTMIX=[['sedan',.2],['hatch',.11],['wagon',.1],['suv',.16],['pickup',.13],['van',.1],['lorry',.08],['bus',.03],['sports',.05],['police',.02],['taxi',.02]];
function rtPick(){let r=Math.random(),s=0;for(const q of RTMIX){s+=q[1];if(r<s)return q[0];}return 'sedan';}
function rtBuild(){const G=new Map();ROADS.forEach((R,ri)=>{const P=R.P;if(!P)return;for(let i=3;i<P.length-3;i+=2){const p=P[i];if(p.cls===0)continue;const k=Math.floor(p.x/256)*100003+Math.floor(p.z/256);let a=G.get(k);if(!a)G.set(k,a=[]);a.push([ri,i]);}});
 RTF.grid=G;RTF.max={bassa:4,media:6,alta:9,ultra:12}[S.q]||6;}
function rtNear(cx,cz,dmin,dmax){const out=[],r=Math.ceil(dmax/256),gx=Math.floor(cx/256),gz=Math.floor(cz/256);for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++){const a=RTF.grid.get((gx+i)*100003+(gz+j));if(!a)continue;for(const q of a){const p=ROADS[q[0]].P[q[1]],d=Math.hypot(p.x-cx,p.z-cz);if(d>=dmin&&d<=dmax)out.push(q);}}return out;}
// punto della corsia (1,75 m a destra dell'asse nel verso di marcia)
function rtLane(P,i,dir,off){const a=P[Math.max(0,Math.min(P.length-1,i-dir))],b=P[Math.max(0,Math.min(P.length-1,i+dir))],tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;return {x:P[i].x-tz/l*(off||1.75),z:P[i].z+tx/l*(off||1.75),ux:tx/l,uz:tz/l};}
function rtSpawn(type,ri,i,dir){const P=ROADS[ri].P;if(!P[i+dir]||!P[i-dir])return null;const L=rtLane(P,i,dir),x=L.x,z=L.z;
 for(const o of dynCars)if(!o.dead&&Math.hypot(o.px-x,o.pz-z)<28)return null;if(player.veh&&Math.hypot(player.veh.px-x,player.veh.pz-z)<40)return null;
 const yaw=Math.atan2(-L.ux,-L.uz),b=trMake(type,x,groundH(x,z)+.9,z,yaw),heavy=type==='bus'||type==='lorry';
 const A={i:0,j:0,di:0,dj:1,wp:[],mode:'norm',vmax:(heavy?19:23)+Math.random()*(heavy?3:5),T:0,B:0,S:0,lastV:0,crash:0,stuck:0,rev:0,type,ph:Math.random()*2,out:false,bar:b.car.bar||null,siren:false,horn:0,rd:{ri,i:i+dir,dir}};
 b.car.ai=A;A.drv=trDriver(b.obj,b.car.drvPos[0],b.car.drvPos[1],b.car.drvPos[2]);rtPlan(b);const sp=A.vmax*.75;b.vx=L.ux*sp;b.vz=L.uz*sp;TRF.cars.push(b);return b;}
// pianificazione lungo la strada; fine strada: incrocio, Nova, aeroporto o capolinea
function rtPlan(b){const A=b.car.ai,S=A.rd;if(!S)return;for(let k=0;k<12&&A.wp.length<9;k++){if(S.end)return;const R=ROADS[S.ri],P=R.P;if(S.i<=0||S.i>=P.length-1){rtEnd(b);if(A.rd!==S)return;continue;}
  const L=rtLane(P,S.i,S.dir);A.wp.push({x:L.x,z:L.z});S.i+=S.dir;}}
function rtEnd(b){const A=b.car.ai,S=A.rd;if(!S||!ROADS[S.ri]||!ROADS[S.ri].P){if(S)S.end=true;return;}const R=ROADS[S.ri],P=R.P,e=S.dir>0?1:0,p=P[e?P.length-1:0];
 // aeroporto CYI: la strada da Nova arriva sul viale del terminal
 if(Math.hypot(p.x-2445,p.z-1350)<20&&S.dir>0&&typeof AP!=='undefined'){rtAirport(b);return;}
 // Nova: si entra nella rete di strade del quartiere
 if(typeof NVP!=='undefined'&&NVP.net&&nvNear(p.x,p.z,30)){let N=null,bd=70;for(const n of NVP.net){const d=Math.hypot(n.x-p.x,n.z-p.z);if(d<bd){bd=d;N=n;}}
  if(N){const ux=p.x-P[e?P.length-2:1].x,uz=p.z-P[e?P.length-2:1].z;let best=null,bs=-9;for(const q of N.nb){const s=q.dx*ux+q.dz*uz;if(s>bs){bs=s;best=q;}}
   if(best){const lo=nvLaneOff(best.hw),rx=-best.dz,rz=best.dx,C=best.to,sC=nvStopD(C,best.road);A.wp.push({x:N.x+rx*lo,z:N.z+rz*lo},{x:C.x-best.dx*sC+rx*lo,z:C.z-best.dz*sC+rz*lo,stop:1,ni:200+C.ai,nj:200+C.si,ax:best.road==='av'?0:1});
    A.nv={node:C,dx:best.dx,dz:best.dz,road:best.road,hw:best.hw};A.rd=null;A.vmax=Math.min(A.vmax,14);return;}}}
 // incrocio con un'altra strada extraurbana: si prosegue su quella, nel verso che porta lontano dall'incrocio
 const K=R.junc?R.junc[e]:-1;if(K>=0&&ROADS[K].P){const Q=ROADS[K].P;let j=0,bd=1e9;for(let i=0;i<Q.length;i++){const d=Math.hypot(Q[i].x-p.x,Q[i].z-p.z);if(d<bd){bd=d;j=i;}}
  let dir=Math.random()<.5?1:-1;if(j<4)dir=1;else if(j>Q.length-5)dir=-1;S.ri=K;S.i=j+dir*2;S.dir=dir;return;}
 // capolinea (città, quartieri, strada senza uscita): l'auto si ferma e sparisce quando nessuno la guarda
 S.end=true;A.wp.push({x:p.x,z:p.z});}
// ---------- aeroporto: corsia esterna, sosta davanti al terminal, inversione in fondo al viale, ritorno verso Nova ----------
function rtAirport(b){const A=b.car.ai,land=AP.CYI.land,x0=2745+Math.random()*190,zc=land+5.2,zr=land-3.4;
 A.wp.push({x:2470,z:land+3.6},{x:x0-40,z:zc},{x:x0,z:zc,hold:12+Math.random()*16},{x:x0+30,z:land+3.6},{x:3035,z:land+3},{x:3056,z:land+1.5,turn:1},{x:3062,z:land-1.4,turn:1},{x:3052,z:land-3.6,turn:1},{x:3030,z:zr},{x:2700,z:zr},{x:2480,z:zr});
 A.rd={ri:ROADS.findIndex(R=>R.P&&Math.hypot(R.P[R.P.length-1].x-2445,R.P[R.P.length-1].z-1350)<20),i:-1,dir:-1,air:1};A.vmax=Math.min(A.vmax,15);}
// ---------- velocità: curve (aderenza), soste ----------
function rtCurveCap(b,A){const w=A.wp;if(w.length<3)return 99;let v=99,dist=Math.hypot(w[0].x-b.px,w[0].z-b.pz),hx=w[1].x-w[0].x,hz=w[1].z-w[0].z,hl=Math.hypot(hx,hz)||1;hx/=hl;hz/=hl;
 for(let k=1;k<Math.min(w.length-1,9);k++){const dx=w[k+1].x-w[k].x,dz=w[k+1].z-w[k].z,l=Math.hypot(dx,dz);if(l<.5)continue;dist+=hl;const nx=dx/l,nz=dz/l,ang=Math.acos(clamp(hx*nx+hz*nz,-1,1));
  if(ang>.015){const Rr=Math.max(l,hl)/ang,vc=Math.sqrt(3.1*Rr);v=Math.min(v,Math.sqrt(vc*vc+2*3.2*Math.max(0,dist-6)));}hx=nx;hz=nz;hl=l;}return v;}
{const tl0=trLat;trLat=function(b,A,fx,fz,rx,rz,sp,dt){const r=tl0(b,A,fx,fz,rx,rz,sp,dt);
 if(A.rd){let cap=rtCurveCap(b,A);const w=A.wp[0];
  if(w&&w.hold){const d=Math.hypot(w.x-b.px,w.z-b.pz);cap=Math.min(cap,Math.max(0,(d-5.6)*.7));if(d<7.5&&sp<.6){if(!A.held){A.held=1;rtDropOff(b,w);}w.hold-=dt;if(w.hold<=0){A.wp.shift();A.held=0;}}}
  if(A.rd.end){const e=A.wp[A.wp.length-1];if(e){const d=Math.hypot(e.x-b.px,e.z-b.pz);cap=Math.min(cap,Math.max(0,(d-8)*.6));}}
  A.vcap=A.vcap===undefined?cap:Math.min(A.vcap,cap);}
 return r;};}
// il passeggero scende dal lato del marciapiede con il trolley e va verso le porte
function rtDropOff(b,w){if(typeof APL==='undefined'||!APL.cyi)return;const O=APL.cyi.O;let a=null,bd=1e9;for(const n of O.N){if(n.doorIn)continue;const d=Math.hypot(n.x-w.x,n.z-(w.z+6));if(d<bd&&Math.abs(n.z-(AP.CYI.term.z0-3.6))<1.5){bd=d;a=n;}}if(!a)return;
 const x=b.px+(-b.R[0])*-1.3,z=b.pz+(-b.R[6])*-1.3;APL.pend={G:O,a,b:a,x,z};const n=spawnNPC(x,groundH(x,z),z,{yaw:Math.atan2(0,1)});if(n&&n.apz){n.apz.sx=x;n.apz.sz=z;}}
// la pianificazione delle auto extraurbane passa da qui (le altre restano a Manhattan e a Nova)
{const tp2=trPlan;trPlan=function(b){const A=b.car&&b.car.ai;if(A&&A.rd){if(A.rd.air){if(A.wp.length<2){const R=ROADS[A.rd.ri];if(R&&R.P){A.rd={ri:A.rd.ri,i:R.P.length-2,dir:-1};rtPlan(b);}else{A.rd.end=true;}}return;}return rtPlan(b);}return tp2(b);};}
// ---------- nascita e rimozione attorno a chi guarda ----------
{const ts2=trafficStep;trafficStep=function(dt){ts2(dt);if(!RTF.grid)return;const cp=camera.position;if(cp.y>700)return;
 RTF.rmT-=dt;if(RTF.rmT<=0){RTF.rmT=1;for(const b of TRF.cars){const A=b.car&&b.car.ai;if(!A||!A.rd||!A.rd.end||b===player.veh)continue;const d=Math.hypot(b.px-cp.x,b.pz-cp.z);if(d>140||(d>60&&!rtSeen(b)))A.gone=1;}
  for(let i=TRF.cars.length-1;i>=0;i--){const b=TRF.cars[i];if(b.car&&b.car.ai&&b.car.ai.gone){trRemove(b);TRF.cars.splice(i,1);}}}
 RTF.spT-=dt;if(RTF.spT>0)return;RTF.spT=.6;let n=0;for(const b of TRF.cars){const A=b.car&&b.car.ai;if(A&&(A.rd||A.rdx)&&!b.dead)n++;}if(n>=RTF.max)return;
 const C=rtNear(cp.x,cp.z,150,315);if(!C.length)return;for(let k=0;k<6;k++){const q=C[Math.floor(Math.random()*C.length)],P=ROADS[q[0]].P;const dir=Math.random()<.5?1:-1;if(q[1]+dir*3<1||q[1]+dir*3>P.length-2)continue;
  const b=rtSpawn(rtPick(),q[0],q[1],dir);if(b){b.car.ai.rdx=1;break;}}};}
function rtSeen(b){const v=_v3.set(b.px-camera.position.x,b.py-camera.position.y,b.pz-camera.position.z),d=v.length();if(d<1)return true;const f=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);return v.dot(f)/d>Math.cos(THREE.MathUtils.degToRad(camera.fov*.8));}
{const ti2=trInit;trInit=function(){ti2();try{rtBuild();}catch(e){console.warn('traffico extraurbano',e);}};}
// all'aeroporto arrivano auto anche quando la strada da Nova è lontana: nascono all'inizio del viale del terminal
{const ts3=trafficStep;trafficStep=function(dt){ts3(dt);if(typeof AP==='undefined'||typeof aplWhere!=='function')return;const cp=camera.position;if(aplWhere(cp.x,cp.z)!=='cyi')return;
 RTF.airT=(RTF.airT||0)-dt;if(RTF.airT>0)return;RTF.airT=6+Math.random()*7;let n=0;for(const b of TRF.cars){const A=b.car&&b.car.ai;if(A&&A.rd&&A.rd.air&&!b.dead)n++;}if(n>=5)return;
 const land=AP.CYI.land,x=2468,z=land+3.6;if(Math.hypot(cp.x-x,cp.z-z)<60)return;for(const o of dynCars)if(!o.dead&&Math.hypot(o.px-x,o.pz-z)<16)return;
 const type=Math.random()<.35?'taxi':(Math.random()<.12?'van':['sedan','hatch','wagon','suv','pickup'][Math.floor(Math.random()*5)]),b=trMake(type,x,groundH(x,z)+.9,z,-Math.PI/2);
 const A={i:0,j:0,di:1,dj:0,wp:[],mode:'norm',vmax:13+Math.random()*3,T:0,B:0,S:0,lastV:0,crash:0,stuck:0,rev:0,type,ph:Math.random()*2,out:false,bar:b.car.bar||null,siren:false,horn:0,rd:{air:1},rdx:1};
 b.car.ai=A;A.drv=trDriver(b.obj,b.car.drvPos[0],b.car.drvPos[1],b.car.drvPos[2]);rtAirport(b);A.wp.shift();b.vx=8;b.vz=0;TRF.cars.push(b);};}
// auto guidate dall'IA: non vanno mai "a dormire" (prima un'auto ferma a lungo a un semaforo o in sosta si addormentava
// e ad ogni passo di fisica la velocità veniva azzerata: non ripartiva più)
{const tl1=trLat;trLat=function(b,A,fx,fz,rx,rz,sp,dt){b.noSleep=true;b.slow=0;return tl1(b,A,fx,fz,rx,rz,sp,dt);};}
{const te0=trExit;trExit=function(b,scared){te0(b,scared);if(b&&b!==player.veh)b.noSleep=false;};}
