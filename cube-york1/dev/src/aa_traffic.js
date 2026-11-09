/* ======================= PATCH AA — TRAFFICO: LE AUTO ACCOSTANO PER I SOCCORSI, INSEGUIMENTI VERI CON ARRESTO ======================= */
// spostamento laterale in metri (positivo = verso destra): chi non ha la sirena accosta e rallenta, chi ce l'ha sorpassa nella corsia opposta
function trLat(b,A,fx,fz,rx,rz,sp,dt){A.vcap=undefined;if(A.lo===undefined)A.lo=0;let want=0;const sir=(A.siren&&A.mode!=='norm'&&A.mode!=='panic')||A.mode==='flee';
 if(!sir){if(A.yld>0)A.yld-=dt;A.yt=(A.yt||0)-dt;
  if(A.yt<=0){A.yt=.3;A.ystop=0;for(const o of TRF.cars){const B=o.car&&o.car.ai;if(o===b||o.dead||!B||B.out||!(B.siren||B.mode==='flee')||B.mode==='norm')continue;const qx=o.px-b.px,qz=o.pz-b.pz,fw=qx*fx+qz*fz,lt=qx*rx+qz*rz,ofx=-o.R[2],ofz=-o.R[8],al=ofx*fx+ofz*fz;
    if(fw<-2&&fw>-60&&Math.abs(lt)<5&&al>.55&&B.mode!=='flee'&&B.mode!=='hold'){A.yld=3;}
    else if(fw>3&&fw<28&&Math.abs(lt)<10&&Math.abs(al)<.45&&Math.hypot(o.vx,o.vz)>2){A.yld=Math.max(A.yld||0,1.4);A.ystop=1;}}}
  // accostare: sui viali (corsie a 4,5 m dal centro) c'è più spazio che nelle strade (corsie a 3 m)
  if(A.yld>0){want=A.ystop?0:(A.di===0?2.4:.6);A.vcap=A.ystop?0:(A.di===0?3.5:1.5);}}
 else{if(A.ovt>0)A.ovt-=dt;if(A.push>0)A.push-=dt;A.ot=(A.ot||0)-dt;
  if(A.ot<=0){A.ot=.25;let blk=false,opp=false;for(const o of dynCars){if(o===b||o.dead)continue;const qx=o.px-b.px,qz=o.pz-b.pz;if(qx*qx+qz*qz>3600)continue;const fw=qx*fx+qz*fz,lt=qx*rx+qz*rz,ov=o.vx*fx+o.vz*fz;
    if(fw>3&&fw<30&&Math.abs(lt)<2.6&&(ov<sp-2||ov<6))blk=true;
    if(fw>-6&&fw<55&&lt<-2&&lt>-8&&ov<4)opp=true;}
   if(blk&&!opp)A.ovt=2.8;else if(opp&&A.ovt>0)A.ovt=Math.min(A.ovt,.35);
   // bloccato da più di 2,5 s nonostante tutto: si fa largo spingendo (la fisica gestisce l'urto)
   if(A.mode!=='hold'&&sp<2&&blk)A.bt=(A.bt||0)+.25;else A.bt=0;if(A.bt>(A.mode==='flee'?1:2.5)){A.push=2.2;A.bt=0;}}
  if(A.ovt>0)want=-3.6;if(A.push>0)A.vcap=4.5;}
 if(A.wp.length&&A.wp[0].turn)want*=.3;
 A.lo+=(want-A.lo)*Math.min(1,dt*1.7);return A.lo;}

// ---------- inseguimenti: la polizia recupera, sperona, ferma il fuggitivo e lo arresta ----------
const PCH={f:null,cops:[],t:0,lost:0,slow:0,st:null,arrT:0,sus:null,offs:[],said:0};
function copLook(){const R=Math.random,pk=a=>a[Math.floor(R()*a.length)],f=R()<.3,skin=NSK[Math.floor(R()*NSK.length)];
 const P=[],cnt=[0,0,0,0,0,0,0,0],add=(t,b,o,s,c)=>{const k=NPCG.T.indexOf(t);if(cnt[k]<NPCG.K[k])P.push({t:k,j:cnt[k]++,b,o,s,c});};
 const navy=[.06,.08,.16],dk=[.04,.05,.09],blk=[.03,.03,.035],gold=[.85,.68,.25],tw=(f?.37:.43)*pk([1,1.05,1.12]);
 add('torso',0,[0,.03,0],[tw*.96,.26,.25],dk);add('box',0,[0,.13,0],[tw*1.03,.065,.285],blk);for(const sx of[-1,1])add('box',0,[sx*(tw*.5+.025),.07,.02],[.06,.15,.11],blk);
 for(const k of[0,1]){const th=k?9:7,sh=k?10:8;add('limb',th,[0,-.22,0],[.17,.46,.18],dk);add('limb',sh,[0,-.21,0],[.15,.44,.16],dk);add('shoe',sh,[0,-.465,-.04],[.14,.12,.29],blk);add('shoe',sh,[0,-.515,-.04],[.146,.034,.296],[.015,.015,.015]);}
 add('torso',1,[0,.31,0],[tw*1.04,.62,.27],navy);add('limb',2,[0,-.01,0],[.1,.15,.1],skin);add('box',1,[0,.3,-.005],[tw*1.12,.48,.31],[.045,.05,.06]);
 add('box',1,[.1,.5,-.163],[.055,.065,.01],gold);add('box',1,[-.11,.52,-.165],[.05,.09,.035],blk);add('box',1,[0,.6,-.02],[tw*.5,.06,.27],navy);
 for(const k of[0,1]){const ua=k?5:3,fa=k?6:4;add('limb',ua,[0,-.16,0],[.135,.34,.145],navy);add('limb',fa,[0,-.15,0],[.12,.3,.13],navy);add('hand',fa,[0,-.35,-.005],[.09,.16,.06],skin);}
 add('box',6,[0,-.43,-.08],[.035,.06,.17],blk);add('box',6,[0,-.4,-.02],[.03,.1,.035],blk);
 add('head',2,[0,.17,0],[.235,.3,.26],skin);
 for(const sx of[-1,1]){add('sph',2,[sx*.052,.205,-.112],[.05,.034,.02],[.96,.96,.95]);add('sph',2,[sx*.052,.205,-.12],[.026,.026,.012],[.18,.11,.06]);add('sph',2,[sx*.118,.18,.005],[.028,.065,.048],skin.map(v=>v*.96));}
 add('box',2,[0,.108,-.118],[.066,.018,.014],skin.map(v=>v*.78));
 add('hair',2,[0,.248,.012],[.274,.2,.3],navy);add('box',2,[0,.262,-.152],[.24,.02,.12],blk);add('box',2,[0,.305,-.138],[.06,.05,.01],gold);
 return {parts:P,sc:(f?.95:1)*rand(.96,1.08),f,old:false,phone:false};}
function copSpawn(x,z,yaw){const nl=npcLook;npcLook=copLook;let n=null;try{n=spawnNPC(x,groundH(x,z),z,{keep:true,yaw});}finally{npcLook=nl;}return n;}
trChase=function(){if(PCH.f)return false;const e=trEdgeNear(170,260);if(!e)return false;
 const f=trSpawn(['sports','sports','hyper','sedan','suv','sedan'][Math.floor(Math.random()*6)],e,.85,'flee');if(!f)return false;const A=f.car.ai;A.vmax0=A.vmax=19.5+Math.random()*4.5;
 const pe={i:e.i-e.di,j:e.j-e.dj,di:e.di,dj:e.dj},cops=[],c1=trSpawn('police',e,.25,'chase');if(c1)cops.push(c1);
 if(trEdgeOK(pe.i,pe.j,pe.di,pe.dj)){const c2=trSpawn('police',pe,.6,'chase');if(c2)cops.push(c2);}
 if(!cops.length){trRemove(f);return false;}
 for(const p of cops){const B=p.car.ai;B.tgt=f;B.vmax=28;B.siren=true;}
 Object.assign(PCH,{f,cops,t:0,lost:0,slow:0,st:'run',arrT:0,sus:null,offs:[],said:0});return true;};
function chaseEnd(why){PCH.why=why||'?';for(const c of PCH.cops){const A=c.car&&c.car.ai;if(!A||c.dead||A.out)continue;A.mode='norm';A.tgt=null;A.siren=false;A.vmax=12;A.crash=0;}
 for(const o of PCH.offs)if(!o.dead)npcKill(o);if(PCH.sus&&!PCH.sus.dead)npcKill(PCH.sus);PCH.f=null;PCH.cops=[];PCH.offs=[];PCH.sus=null;PCH.st=null;}
function chaseArrest(f){PCH.st='arrest';PCH.arrT=0;const FA=f.car.ai;
 if(!FA.out){FA.out=true;FA.T=0;FA.B=1;FA.S=0;FA.siren=false;}
 // le volanti si avvicinano piano fino a 10-14 m e solo allora gli agenti scendono
 for(const c of PCH.cops){const A=c.car.ai;A.mode='chase';A.tgt=f;A.siren=true;A.ovt=0;A.appr=1;A.apT=0;}}
function pchSuspectOut(f){if(PCH.sus)return;const FA=f.car.ai;if(FA.drv&&f.obj){f.obj.remove(FA.drv);FA.drv=null;}
 const R=f.R,lx=-(f.hx+.9);let x=f.px+R[0]*lx,z=f.pz+R[6]*lx;if(bAt(x,z)){x=f.px-R[0]*lx;z=f.pz-R[6]*lx;}
 const s=spawnNPC(x,groundH(x,z),z,{yaw:Math.atan2(-R[0],-R[6]),keep:true});if(s){s.ctl='sus';s.pose='hands';PCH.sus=s;if(typeof npcVoice==='function'){NPC.vt=0;npcVoice(s);}}}
function pchCopsOut(c){const A=c.car.ai;if(A.offOut)return;A.offOut=1;A.mode='hold';A.vmax=0;A.tgt=null;A.appr=0;const Rc=c.R,s=PCH.sus;let k=0;
 for(const sd of[-1,1]){if(PCH.offs.length>=4||k>=2)break;const ox=c.px+Rc[0]*sd*(c.hx+.8),oz=c.pz+Rc[6]*sd*(c.hx+.8);if(bAt(ox,oz))continue;const o=copSpawn(ox,oz,s?Math.atan2(-(s.x-ox),-(s.z-oz)):0);if(!o)continue;o.ctl='cop';o.pose='aim';o.spd=1.8;PCH.offs.push(o);k++;}}
// rincorsa fuori campo: una volante rimasta troppo indietro o incastrata, se non la stai guardando, riparte sulla strada dietro al fuggitivo
const _pchF=new THREE.Frustum(),_pchM=new THREE.Matrix4(),_pchS=new THREE.Sphere();
function pchSeen(x,y,z){_pchM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_pchF.setFromProjectionMatrix(_pchM);_pchS.center.set(x,y,z);_pchS.radius=4;return _pchF.intersectsSphere(_pchS)&&Math.hypot(x-camera.position.x,z-camera.position.z)<420;}
function pchRoad(x,z){if(Math.abs(x)>CX-3||Math.abs(z)>CZ-3||(x>-131&&x<131&&z>-582&&z<-90)||bAt(x,z))return false;return Math.abs(aveOff(x))<7.5||Math.abs(stOff(z))<4.6;}
function copWarp(c,f){const FA=f.car.ai,A=c.car.ai,R=f.R,fx=-R[2],fz=-R[8];if(!FA.wp||!FA.wp.length)return false;
 for(const D of[70,50,90,35,115]){const x=f.px-fx*D,z=f.pz-fz*D;if(!pchRoad(x,z)||pchSeen(x,1,z))continue;let busy=false;for(const o of dynCars)if(o!==c&&!o.dead&&Math.hypot(o.px-x,o.pz-z)<9){busy=true;break;}if(busy)continue;
  const v=Math.max(8,Math.hypot(f.vx,f.vz)),yaw=Math.atan2(-fx,-fz);c.px=x;c.pz=z;c.py=groundH(x,z)+.85;setYaw(c,yaw);c.vx=fx*v;c.vz=fz*v;c.vy=0;c.wx=c.wy=c.wz=0;c.sleep=false;syncObj(c);
  A.wp=[{x:f.px,z:f.pz}].concat(FA.wp.map(w=>Object.assign({},w)));A.i=FA.i;A.j=FA.j;A.di=FA.di;A.dj=FA.dj;A.lastV=v;A.stuck=0;A.rev=0;A.crash=0;A.ovt=0;A.push=0;A.lo=0;return true;}
 return false;}
function chaseStep(dt){if(!PCH.f)return;const f=PCH.f,FA=f.car&&f.car.ai;PCH.t+=dt;
 PCH.cops=PCH.cops.filter(c=>{const ok=!c.dead&&c.car&&c.car.ai&&!c.car.ai.out&&TRF.cars.includes(c);if(!ok)PCH.lostCop=(c.dead?'dead':!c.car||!c.car.ai?'noai':c.car.ai.out?'out':'despawn')+'@'+Math.round(PCH.t);return ok;});
 if(f.dead||!FA||!TRF.cars.includes(f)){chaseEnd(f.dead?'fdead':!FA?'fnoai':'fdespawn');return;}
 const fs=Math.hypot(f.vx,f.vz);let dmin=1e9;for(const c of PCH.cops)dmin=Math.min(dmin,Math.hypot(c.px-f.px,c.pz-f.pz));
 if(PCH.st==='run'){
  for(const c of PCH.cops){const A=c.car.ai,d=Math.hypot(c.px-f.px,c.pz-f.pz),cv=Math.hypot(c.vx,c.vz);A.mode='chase';A.tgt=f;A.siren=true;A.vmax=d>120?33:d>45?29.5:clamp(fs+3.5,12,31);
   A.slowT=cv<1.2?(A.slowT||0)+dt:0;A.wT=(A.wT||0)-dt;if(A.wT<=0&&(d>170||A.slowT>6)&&!pchSeen(c.px,c.py,c.pz)){A.wT=4;if(copWarp(c,f))A.slowT=0;}}
  if(!FA.out)FA.vmax=(FA.vmax0||21)+(dmin<28?3:0);
  const stop=FA.out||FA.crash>0;PCH.slow=(stop||fs<1.5)?PCH.slow+dt:0;
  if((stop&&dmin<70)||(PCH.slow>4.5&&dmin<26)){chaseArrest(f);return;}
  // rinforzi: se resta una sola volante (o nessuna) ne arriva un'altra da una strada vicina, fuori dalla vista
  PCH.bk=(PCH.bk||0)-dt;if(PCH.cops.length<2&&PCH.bk<=0&&PCH.t<220){PCH.bk=10;for(let k=0;k<14;k++){const e=TRF.edges[Math.floor(Math.random()*TRF.edges.length)],mx=140*(e.i+e.di*.5),mz=84*(e.j+e.dj*.5),d=Math.hypot(mx-f.px,mz-f.pz);if(d<70||d>210||pchSeen(mx,1,mz))continue;const c=trSpawn('police',e,.5,'chase');if(c){const B=c.car.ai;B.tgt=f;B.vmax=30;B.siren=true;PCH.cops.push(c);break;}}}
  PCH.lost=dmin>400?PCH.lost+dt:0;
  if(PCH.lost>14){chaseEnd('lost');return;}
  if(PCH.t>300||(!PCH.cops.length&&PCH.t>4))chaseEnd(PCH.t>300?'timeout':'nocops');}
 else if(PCH.st==='arrest'){PCH.arrT+=dt;
  for(const c of PCH.cops){const A=c.car.ai;if(!A.appr)continue;A.apT+=dt;const d=Math.hypot(c.px-f.px,c.pz-f.pz),cv=Math.hypot(c.vx,c.vz);A.vmax=clamp((d-11)*.7,0,14);
   if(d<15&&cv<1.5||A.apT>18&&cv<1){if(d<34){pchSuspectOut(f);pchCopsOut(c);}else{A.appr=0;A.mode='hold';A.vmax=0;}}}
  if(PCH.sus&&PCH.offs.length&&!PCH.said&&PCH.offs.some(o=>!o.dead&&Math.hypot(o.x-PCH.sus.x,o.z-PCH.sus.z)<3.2)){PCH.said=1;PCH.saidT=PCH.arrT;}
  if(!PCH.sus&&PCH.arrT>25){chaseEnd('noapproach');return;}
  if((PCH.said&&PCH.arrT-PCH.saidT>14)||PCH.arrT>60)chaseEnd(PCH.said?'arrested':'arrestTimeout');}}
{const ts0=trafficStep;trafficStep=function(dt){ts0(dt);chaseStep(dt);};}
// agenti e fermato: si muovono da soli (gli agenti si avvicinano con l'arma puntata, il fermato resta con le mani alzate)
{const nw0=npcWalk;npcWalk=function(n,dt){if(n.ctl&&n.flee>0){n.ctl=null;n.pose=null;}
  if(n.ctl==='cop'){const s=PCH.sus;if(!s||s.dead){n.ctl=null;n.pose=null;return nw0(n,dt);}const dx=s.x-n.x,dz=s.z-n.z,d=Math.hypot(dx,dz);n.yaw=Math.atan2(-dx,-dz);let sp=0;
   if(d>2.6){sp=Math.min(1.8,(d-2.4)*1.1);const nx=n.x+dx/d*sp*dt,nz=n.z+dz/d*sp*dt;if(!bAt(nx,nz)){n.x=nx;n.z=nz;}}n.spdNow=sp;n.ph+=sp*dt*TAU/1.5;if(!n.roof)n.y=groundH(n.x,n.z);return;}
  if(n.ctl==='sus'){n.spdNow=0;if(!n.roof)n.y=groundH(n.x,n.z);return;}
  return nw0(n,dt);};}
{const nb0=npcBones;npcBones=function(n){nb0(n);if(!n.pose)return;const B=n.B,sc=n.sc,h=n.pose==='hands';
 for(const k of[0,1]){const sg=k?1:-1,ax=h?-2.85:(k?1.42:1.3),az=h?sg*.22:(k?-.1:.33);
  B[k?5:3].multiplyMatrices(B[1],_nm[1].makeRotationFromEuler(_ne.set(ax,0,az)).setPosition(sg*(n.f?.2:.23)*sc,.58*sc,0));
  B[k?6:4].multiplyMatrices(B[k?5:3],_nm[1].makeRotationX(h?-.3:.1).setPosition(0,-.32*sc,0));}};}
