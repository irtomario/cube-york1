/* ======================= VOLI DI LINEA AUTOMATICI: orario, pushback, rullaggio, decolli, rotte, avvicinamenti, atterraggi, incidenti ======================= */
const FL={list:[],t:0,next:5,clock:0,log:[],seq:0,rwyBusy:{CYI:null,CYW:null}};
const FL_DEST=[['Roma Fiumicino','E'],['Londra Heathrow','E'],['Parigi CDG','E'],['Madrid Barajas','E'],['Dubai','E'],['Napoli Capodichino','E'],['Los Angeles','W'],['Chicago O\'Hare','W'],['Miami','W'],['Toronto','W'],['Tokyo Haneda','W'],['San Francisco','W']];
const FL_TK=[['n',0],['n',1],['n',2],['w',0],['w',2],['n',0]];
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const flYaw=(dx,dz)=>Math.atan2(-dx,-dz);
const GS=Math.tan(3*Math.PI/180);
function flTODbase(){return {giorno:12*60,pomeriggio:16*60+10,tramonto:19*60+25,notte:23*60+5}[S.tod]||16*60;}
function flClock(min){const m=((Math.round(min)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function flNow(){return flTODbase()+FL.clock/60;}
/* ---------- geometria: CYI usa la pista 09 (decolli e atterraggi verso est), CYW la pista 27 (verso ovest) ---------- */
function flFinal(ap){return ap==='CYI'?{thr:2600,z:1700,dir:1,x1:4900,hw:22.5}:{thr:-2450,z:1990,dir:-1,x1:-4050,hw:15};}
function flHoldLine(ap){return ap==='CYI'?1632.5:1947;}
function flStandC(st,C){return [st.x,st.z+C.L/2+1];}
function flExitList(ap){const A=AP[ap],F=flFinal(ap),out=[];for(const e of A.exits){const r=Math.abs(e[1]-F.z)<Math.abs(e[3]-F.z)?0:1,rx=r?e[2]:e[0],tx=r?e[0]:e[2],tz=r?e[1]:e[3];if((rx-F.thr)*F.dir<700)continue;out.push({rx,tx,tz});}
 out.sort((a,b)=>(a.rx-b.rx)*F.dir);return out;}
/* ---------- percorsi a terra: polilinee con curve raccordate, seguite con un punto guida davanti al muso ---------- */
function flDense(pts,r){const P=[];for(const p of pts){const l=P[P.length-1];if(!l||Math.hypot(p[0]-l[0],p[1]-l[1])>.8)P.push([p[0],p[1]]);}if(P.length<2)return P;
 const out=[P[0]];for(let i=1;i<P.length-1;i++){const A=P[i-1],B=P[i],C=P[i+1];let ux=B[0]-A[0],uz=B[1]-A[1];const l1=Math.hypot(ux,uz);ux/=l1;uz/=l1;let wx=C[0]-B[0],wz=C[1]-B[1];const l2=Math.hypot(wx,wz);wx/=l2;wz/=l2;
  const th=Math.acos(clamp(ux*wx+uz*wz,-1,1));if(th<.02){out.push(B);continue;}const ta=Math.tan(th/2),t=Math.min(r*ta,l1*.5,l2*.5),rr=t/ta,sx=B[0]-ux*t,sz=B[1]-uz*t;let nx=-uz,nz=ux;if(nx*wx+nz*wz<0){nx=-nx;nz=-nz;}
  const ox=sx+nx*rr,oz=sz+nz*rr,a0=Math.atan2(sz-oz,sx-ox),da=wrapA(Math.atan2(B[1]+wz*t-oz,B[0]+wx*t-ox)-a0),n=Math.max(2,Math.ceil(Math.abs(da)*rr/2.5));
  for(let k=0;k<=n;k++){const a=a0+da*k/n;out.push([ox+Math.cos(a)*rr,oz+Math.sin(a)*rr]);}}
 out.push(P[P.length-1]);return out;}
function flMkPath(pts,r){const q=[];for(const a of flDense(pts,r||35)){const l=q[q.length-1];if(!l||Math.hypot(a[0]-l[0],a[1]-l[1])>.3)q.push(a);}if(q.length<2)q.push([q[0][0]+.05,q[0][1]]);
 const cl=[0];for(let i=1;i<q.length;i++)cl.push(cl[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));
 const k=new Float32Array(q.length);for(let i=1;i<q.length-1;i++){const h1=Math.atan2(q[i][1]-q[i-1][1],q[i][0]-q[i-1][0]),h2=Math.atan2(q[i+1][1]-q[i][1],q[i+1][0]-q[i][0]);k[i]=Math.abs(wrapA(h2-h1))/Math.max(.8,(cl[i+1]-cl[i-1])*.5);}
 return {p:q,cl,k,L:cl[cl.length-1],i:0,s:0,ia:0};}
function flAt(P,s){s=clamp(s,0,P.L);let i=P.ia;while(i<P.p.length-2&&P.cl[i+1]<s)i++;while(i>0&&P.cl[i]>s)i--;P.ia=i;const a=P.p[i],b=P.p[i+1],l=P.cl[i+1]-P.cl[i]||1,t=clamp((s-P.cl[i])/l,0,1);
 return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,b[0]-a[0],b[1]-a[1]];}
function flProj(P,x,z){let bd=1e18,bi=P.i,bt=0;const e=Math.min(P.p.length-1,P.i+18);for(let i=P.i;i<e;i++){const a=P.p[i],b=P.p[i+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez||1e-6,t=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1),dx=a[0]+ex*t-x,dz=a[1]+ez*t-z,d=dx*dx+dz*dz;if(d<bd-1e-9){bd=d;bi=i;bt=t;}}
 P.i=bi;P.s=P.cl[bi]+(P.cl[bi+1]-P.cl[bi])*bt;return Math.sqrt(bd);}
// distanza dagli altri aerei a terra davanti al muso: rallenta e si ferma in coda (con uno sblocco se due aerei si aspettano a vicenda)
function flSep(v,dt){const a=v.ai,C=v.C,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);if(a.sepI>0){a.sepI-=dt;return 99;}let vt=99;
 for(const u of LN.list){if(u===v||u.dead)continue;if(u.py-groundH(u.px,u.pz)-u.C.gearH>15)continue;const ux=u.px-v.px,uz=u.pz-v.pz,ah=ux*fx+uz*fz;if(ah<=0||ah>260)continue;
  const lat=Math.abs(ux*fz-uz*fx),wid=(C.span+u.C.span)*.28+5;if(lat>wid)continue;vt=Math.min(vt,Math.max(0,(ah-(C.L+u.C.L)*.5-16)*.3));}
 if(vt<.3){a.sepW=(a.sepW||0)+dt;if(a.sepW>40){a.sepW=0;a.sepI=10;}}else a.sepW=0;return vt;}
function flFollow(v,dt,vmax){const a=v.ai,P=a.P,C=v.C;flProj(P,v.px,v.pz);const rem=P.L-P.s,Ld=clamp(6+a.spd*1.5,7,26),tp=flAt(P,P.s+Ld);
 let vt=vmax;for(let i=P.i+1;i<P.p.length-1&&P.cl[i]-P.s<90;i++){const kk=P.k[i];if(kk>.006){const va=Math.max(2.2,Math.sqrt(.8/kk));vt=Math.min(vt,Math.sqrt(va*va+2*1.1*Math.max(0,P.cl[i]-P.s-3)));}}
 vt=Math.min(vt,Math.sqrt(2*.8*Math.max(0,rem-.4)),flSep(v,dt));
 if(a.spd<vt)a.spd=Math.min(vt,a.spd+.6*dt);else a.spd=Math.max(vt,a.spd-1.5*dt);
 const dx=tp[0]-v.px,dz=tp[1]-v.pz,al=wrapA(flYaw(dx,dz)-a.yaw),Lt=Math.max(4,Math.hypot(dx,dz)),omx=Math.max(.015,a.spd/(C.L>50?24:C.L>30?18:14));
 a.yaw=wrapA(a.yaw+clamp(a.spd*2*Math.sin(al)/Lt,-omx,omx)*dt);flGround(v,dt,0);return rem;}
/* ---------- percorsi dei singoli aeroporti ---------- */
// pushback: indietro lungo la linea di ingresso, poi la coda curva verso il lato opposto alla direzione di rullaggio
function flPushPath(ap,st,C){const c=flStandC(st,C),tz=AP[ap].taxilane,sd=ap==='CYI'?1:-1;return flMkPath([c,[st.x,tz],[st.x+sd*(ap==='CYI'?60:40),tz]],ap==='CYI'?28:16);}
function flDepPath(ap,v){const A=AP[ap],hz=flHoldLine(ap)-2-v.C.L/2,x=ap==='CYI'?2620:-2500;return flMkPath([[v.px,v.pz],[x,A.taxilane],[x,hz]],ap==='CYI'?60:30);}
function flLinePath(ap,v){const F=flFinal(ap),x=ap==='CYI'?2620:-2500;return flMkPath([[v.px,v.pz],[x,F.z],[x+F.dir*100,F.z]],40);}
function flInPath(ap,v,ex,st){const A=AP[ap],F=flFinal(ap),c=flStandC(st,v.C);
 if(ap==='CYI')return flMkPath([[v.px,v.pz],[ex.rx,F.z],[ex.tx,ex.tz],[3440,ex.tz],[3440,A.taxilane],[st.x,A.taxilane],c],35);
 return flMkPath([[v.px,v.pz],[ex.rx,F.z],[ex.tx,ex.tz],[st.x,ex.tz],c],35);}
/* ---------- rotte in volo (x, z, quota) ---------- */
function flDepRoute(ap,f){const side=(f&&f.to&&f.to.side)||'E';
 if(ap==='CYI')return side==='E'?[[5400,1690,350],[7000,1450,900]]:[[4900,1950,300],[5600,3000,500],[4800,4200,800],[1000,4700,1100],[-7000,4800,1400]];
 return side==='W'?[[-5000,2040,300],[-7000,2300,900]]:[[-4600,2250,300],[-5400,3200,500],[-4400,4300,800],[-1000,4700,1100],[7000,4800,1400]];}
// circuito di attesa dopo una riattaccata o un rientro d'emergenza: sottovento sul mare e di nuovo in finale
function flCircuit(ap){return ap==='CYI'?[[4700,1950,300],[5400,3000,450],[4400,4100,450],[-2500,4200,450],[-5300,4300,450],[-5900,3700,450],[-5900,2950,450]]
 :[[-4400,2200,300],[-5300,3100,420],[-4400,4100,450],[2500,4200,450],[5300,4300,440],[5900,3700,440],[5900,3240,440]];}
/* ---------- voli e piazzole ---------- */
function flNew(o){const [tk,al]=o.tkal||FL_TK[Math.floor(Math.random()*FL_TK.length)];const A=AIRL[al];const f={id:++FL.seq,num:A.code+' '+(100+Math.floor(Math.random()*8900)),tk,al,from:o.from,to:o.to,toName:o.toName,fromName:o.fromName,dep:o.dep,arr:o.arr,status:'In orario',gate:o.gate||'',v:null,acc:o.acc||null};FL.list.push(f);return f;}
// incidenti: in partenza un motore in fiamme (rientro), in arrivo errore del pilota contro una torre di Nova, atterraggio duro, uscita di pista, ammaraggio prima della pista
function flAccRoll(dep,ap){const p=[0,.08,.3][+S.acc||0];if(Math.random()>p)return null;if(dep)return Math.random()<.6?'engine':null;const r=Math.random();
 if(r<.4)return ap==='CYI'?'tower':'short';if(r<.65)return 'hard';if(r<.8)return 'overrun';return 'short';}
function flPickStand(ap,tk){const L=AP[ap].stands.filter(s=>!s.occ&&(tk==='w'?s.w>40:tk==='n'?s.w>30:true));if(!L.length)return null;L.sort((a,b)=>(a.jb?0:1)-(b.jb?0:1)+(Math.random()-.5)*.6);return tk!=='w'?L.find(s=>s.w<40)||L[0]:L[0];}
function flParked(ap,f,st){const C=LT[f.tk],c=flStandC(st,C);const v=spawnLiner(f.tk,f.al,c[0],c[1],0,{});v.th=0;v.n1=0;v.off=true;f.v=v;v.fl=f;st.occ=v;v.ai={phase:'park',ap,st,t:0,spd:0,yaw:0,vs:0,om:0,ip:0,ir:0,rt:0};flSetPose(v,0,0);flDock(v,true);return v;}
function flDock(v,on){const st=v.ai&&v.ai.st;if(!st)return;const J=AP.jb.find(j=>j.st===st);if(!J)return;if(on){const C=v.C,R=v.R,lx=-C.R-.1,ly=C.floor,lz=C.door[0];J.door=[v.px+R[0]*lx+R[2]*lz-1.75,v.pz+R[6]*lx+R[8]*lz,v.py+R[3]*lx+R[4]*ly+R[5]*lz-.2];J.dock=v;}else{J.dock=null;}}
// arrivo da fuori mappa, già allineato sul prolungamento della pista e sul sentiero di discesa di 3 gradi
function flSpawnArr(ap,f,st){const F=flFinal(ap),d0=ap==='CYI'?8900:8000,yaw=flYaw(F.dir,0),C=LT[f.tk];const v=spawnLiner(f.tk,f.al,F.thr-F.dir*d0,F.z+rand(-130,130),yaw,{});v.py=15+GS*d0+rand(-8,25);f.v=v;v.fl=f;st.occ=v;
 v.gearCmd=false;v.gearT=0;v.gearDown=false;v.flap=.25;v.th=.4;v.n1=.5;v.ai={phase:'app',ap,st,dest:ap,spd:C.vref*1.3,yaw,vs:-GS*C.vref*1.3,om:0,ip:0,ir:0,t:0,pitch:.03,acc:f.acc,rt:0};flSetPose(v,.03,0);f.status='In arrivo';return v;}
/* ---------- pilota automatico ---------- */
function flSetPose(v,pitch,bank){const a=v.ai;v.q.setFromEuler(_cve.set(pitch,a.yaw,bank,'YXZ'));cvR(v);}
function flTurnTo(v,dt,ty,maxBank){const a=v.ai,V=Math.max(5,a.spd),dh=wrapA(ty-a.yaw),omax=9.81*Math.tan(maxBank)/V,om=clamp(dh*.55,-omax,omax);a.om+=clamp(om-a.om,-dt*.06,dt*.06);a.yaw=wrapA(a.yaw+a.om*dt);return Math.atan(V*a.om/9.81);}
function flRwyFree(ap,v){const R=FL.rwyBusy[ap];if(R&&R!==v&&!R.dead)return false;const F=flFinal(ap);
 for(const u of LN.list){if(u===v||u.dead)continue;const ua=u.ai;if(!ua){if(Math.abs(u.pz-F.z)<F.hw+40&&(u.px-F.thr)*F.dir>-500&&(u.px-F.x1)*F.dir<300&&u.py-groundH(u.px,u.pz)<300)return false;continue;}
  if(ua.dest===ap&&(ua.phase==='flare'||ua.phase==='rollout'))return false;if(ua.dest===ap&&ua.phase==='app'&&(F.thr-u.px)*F.dir<6500)return false;}return true;}
function flRwyRel(ap,v){if(ap&&FL.rwyBusy[ap]===v)FL.rwyBusy[ap]=null;}
function flAIStep(v,dt){const a=v.ai,C=v.C;if(v.dead)return;a.t+=dt;const ph=a.phase;v.off=ph==='park'||ph==='board';
 if(ph==='park'){v.vx=v.vy=v.vz=0;v.th=0;if(a.depT!==undefined&&FL.clock>=a.depT){flDock(v,false);a.phase='board';a.t=0;}return;}
 if(ph==='board'){v.th=0;if(a.t>14&&flPushClear(v)){a.phase='push';a.t=0;a.P=flPushPath(a.ap,a.st,C);a.ps=0;a.spd=0;a.tug=flTug(v);}return;}
 if(ph==='push'){const P=a.P,rem=P.L-a.ps;a.spd=Math.min(2.1,a.spd+.3*dt,Math.sqrt(2*.25*Math.max(0,rem-.1)));a.ps=Math.min(P.L,a.ps+a.spd*dt);const p=flAt(P,a.ps),tl=Math.hypot(p[2],p[3])||1;
  v.px=p[0];v.pz=p[1];a.yaw=flYaw(-p[2]/tl,-p[3]/tl);v.vx=p[2]/tl*a.spd;v.vz=p[3]/tl*a.spd;v.vy=0;v.th=.06;v.py=groundH(v.px,v.pz)+C.gearH;flSetPose(v,0,0);
  if(a.tug){const R=v.R,lz=C.nose[0]-3.2;a.tug.position.set(v.px+R[2]*lz,groundH(v.px,v.pz)+.15,v.pz+R[8]*lz);a.tug.rotation.y=a.yaw+Math.PI;}
  if(rem<.15){a.pt=(a.pt||0)+dt;if(a.pt>6){if(a.tug){scene.remove(a.tug);a.tug=null;}if(a.st&&a.st.occ===v)a.st.occ=null;a.phase='taxi';a.spd=0;a.P=flDepPath(a.ap,v);}}return;}
 if(ph==='taxi'){const rem=flFollow(v,dt,12);if(rem<.6&&a.spd<.3){a.phase='hold';a.spd=0;a.t=0;}return;}
 if(ph==='hold'){v.vx=v.vz=0;v.th=.05;if(a.t>4&&flRwyFree(a.ap,v)){FL.rwyBusy[a.ap]=v;a.phase='lineup';a.P=flLinePath(a.ap,v);}return;}
 if(ph==='lineup'){const rem=flFollow(v,dt,6);if(rem<6){a.phase='roll';a.t=0;const F=flFinal(a.ap);a.lu={yaw:flYaw(F.dir,0),z:F.z,dir:F.dir};}return;}
 if(ph==='roll'){const L=a.lu,F=flFinal(a.ap);v.th=Math.min(1,v.th+dt*.5);a.spd+=(C.T*.68*Math.min(1,v.th)-.05)*dt;a.yaw+=clamp(wrapA(flYaw(F.dir,-(v.pz-L.z)*.04)-a.yaw),-dt*.06,dt*.06);
  if(a.spd>C.vr){a.pitch=Math.min(.16,(a.pitch||0)+dt*.055);if(a.spd>C.vr*1.08&&a.pitch>.1){a.phase='climb';a.vs=1.5;a.t=0;flRwyRel(a.ap,v);
   if(a.acc==='engine'){v.eng=1;flAccStart(v,'engine');a.dest=a.ap;a.route=flCircuit(a.ap).slice();a.ri=0;a.engT=0;}}}
  flGround(v,dt,a.pitch||0);if(a.phase==='roll'&&(v.px-F.x1)*F.dir>-40)linerCrash(v,v.px,v.py,v.pz,'suolo');return;}
 if(ph==='slide'){// atterraggio duro: carrello rotto, l'aereo striscia sulla pancia, sbanda e si ferma fuori pista in fiamme
  const fwd=[-Math.sin(a.yaw),-Math.cos(a.yaw)];a.spd=Math.max(0,a.spd-dt*4.2);a.yaw+=a.slideW*dt*Math.min(1,a.spd/20);v.px+=fwd[0]*a.spd*dt;v.pz+=fwd[1]*a.spd*dt;v.vx=fwd[0]*a.spd;v.vz=fwd[1]*a.spd;v.vy=0;
  v.py=groundH(v.px,v.pz)+C.R*.85;flSetPose(v,-.03,a.slideB);v.gearT=0;v.gearDown=false;v.th=0;
  if(a.spd>3&&Math.random()<dt*25)sparks(v.px+rand(-3,3),groundH(v.px,v.pz)+.3,v.pz+rand(-3,3),6,4);if(Math.random()<dt*6)smoke(v.px,v.py,v.pz,rand(-1,1),rand(1,3),rand(-1,1),3,rand(3,6),true);
  if(a.spd<=0&&!a.stopped){a.stopped=true;a.t=0;v.eng=2;addFire(v.px+v.R[0]*C.eng[0].x,groundH(v.px,v.pz)+1,v.pz+v.R[6]*C.eng[0].x,3,140);flRwyRel(a.dest,v);flAccNote(v,'hard',v.px,v.pz);}
  if(a.stopped&&a.t>150&&sDist(v.px,v.py,v.pz)>700)flGone(v,true);return;}
 if(ph==='sink'){// uscita di pista: l'aereo supera la fine della pista e finisce in mare, dove affonda lentamente
  const fwd=[-Math.sin(a.yaw),-Math.cos(a.yaw)];a.t2=(a.t2||0)+dt;a.spd=Math.max(0,a.spd-dt*(a.wet?6:2.5));v.px+=fwd[0]*a.spd*dt;v.pz+=fwd[1]*a.spd*dt;const g=groundH(v.px,v.pz),w=waterAt(v.px,v.pz);v.th=0;v.gearT=0;v.gearDown=false;
  if(w>g+.5){if(!a.wet){a.wet=true;splash(v.px,w,v.pz,10,-12);splash(v.px+rand(-12,12),w,v.pz+rand(-6,6),7,-9);sndImpact(v.px,w,v.pz,'stone',20);flAccNote(v,'overrun',v.px,v.pz);}a.sk=(a.sk||0)+dt;
   v.py=lerp(v.py,w-C.R*.85-a.sk*.004,Math.min(1,dt*.3));flSetPose(v,-.05-Math.min(.12,a.sk*.002),Math.sin(a.sk*.4)*.04+Math.min(.12,a.sk*.003));if(Math.random()<dt*2)splash(v.px+rand(-8,8),w,v.pz+rand(-5,5),2,-3);}
  else{v.py=g+C.R*.85;flSetPose(v,-.03,0);if(a.spd>2&&Math.random()<dt*20)sparks(v.px+rand(-3,3),g+.3,v.pz+rand(-3,3),5,4);}
  if(a.t2>260)flGone(v,true);return;}
 if(ph==='rollout'){flRollout(v,dt);}
 else if(ph==='exit'){const F=flFinal(a.dest||a.ap);if(FL.rwyBusy[a.dest]===v&&Math.abs(v.pz-F.z)>F.hw+14)flRwyRel(a.dest,v);const rem=flFollow(v,dt,12);if(rem<.6&&a.spd<.3)flArrive(v);}
 else flAir(v,dt);
 if(v.dead||a.phase==='slide')return;
 if(!['climb','route','app','flare'].includes(a.phase))v.gearCmd=true;v.gearT=clamp(v.gearT+(v.gearCmd?1:-1)*dt*.12,0,1);v.gearDown=v.gearT>.95;
 if(v.eng===1){a.engT=(a.engT||0)+dt;if(a.phase==='exit'&&a.engT>40)v.eng=0;}}
function flPushClear(v){const a=v.ai,A=AP[a.ap],px=a.st.x,pz=A.taxilane;for(const u of LN.list){if(u===v||u.dead)continue;const ua=u.ai;if(ua&&(ua.phase==='park'||ua.phase==='board'))continue;if(u.py-groundH(u.px,u.pz)-u.C.gearH>15)continue;if(Math.hypot(u.px-px,u.pz-pz)<150)return false;}return true;}
function flGround(v,dt,pitch){const a=v.ai,C=v.C;const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);v.px+=fx*a.spd*dt;v.pz+=fz*a.spd*dt;v.vx=fx*a.spd;v.vz=fz*a.spd;v.vy=0;v.py=groundH(v.px,v.pz)+C.gearH;flSetPose(v,pitch,0);
 if(a.phase!=='roll'&&a.phase!=='rollout')v.th=clamp(.05+Math.max(0,a.spd-(a.spd0||0))/dt*.25,0,.35);a.spd0=a.spd;if(a.spd>30)linerHits(v);}
// arrivo in piazzola: allineamento preciso, pontile che si aggancia, nuovo volo in partenza dopo la sosta
function flArrive(v){const a=v.ai,f=v.fl,st=a.st;if(st){const c=flStandC(st,v.C);v.px=c[0];v.pz=c[1];}a.yaw=0;v.py=groundH(v.px,v.pz)+v.C.gearH;flSetPose(v,0,0);a.phase='park';a.spd=0;v.th=0;a.t=0;v.eng=0;
 if(f){f.status='Atterrato';f.landed=FL.clock;f.gone=true;}flDock(v,true);
 const dst=flPickDest();const nf=flNew({tkal:[v.lk,v.al],from:a.ap,to:{side:dst.side},toName:dst.name,dep:flNow()+3+Math.random()*4,gate:st?st.name:''});nf.v=v;v.fl=nf;
 a.depT=FL.clock+(nf.dep-flNow())*60;a.dest=null;a.route=null;a.ex=null;a.ga=0;a.accT=null;a.accSaid=false;a.pt=0;nf.acc=flAccRoll(true,a.ap);a.acc=nf.acc;}
function flPickDest(){const d=FL_DEST[Math.floor(Math.random()*FL_DEST.length)];return {name:d[0],side:d[1]};}
function flGoAround(v,why){const a=v.ai;a.phase='route';a.route=flCircuit(a.dest).slice();a.ri=0;a.rp=[v.px,v.pz];a.ga=(a.ga||0)+1;a.vs=Math.max(a.vs,2.5);flRwyRel(a.dest,v);if(a.acc==='tower'||a.acc==='short')a.acc=null;
 if(sDist(v.px,v.py,v.pz)<4000)flMsg('Il volo '+(v.fl?v.fl.num:'')+' riattacca: '+why+'.');}
// in volo: salita, rotta, avvicinamento sul sentiero di discesa, richiamata e contatto
function flAir(v,dt){const a=v.ai,C=v.C,gy=groundH(v.px,v.pz),h=v.py-gy-C.gearH;let tgtSpd=C.vref*1.45,vsT=0,ty=a.yaw,maxB=.6,pitchT=null;
 if(a.phase==='climb'){vsT=v.lk==='w'?8.5:v.lk==='r'?7:10;ty=a.lu?a.lu.yaw:a.yaw;maxB=.12;if(h>25)v.gearCmd=false;if(h>70)v.flap=Math.max(0,v.flap-dt*.05);
  if(!a.route){a.route=flDepRoute(a.ap,v.fl).slice();a.ri=0;}if(h>150){a.phase='route';a.rp=[v.px,v.pz];}}
 if(a.phase==='route'){const w=a.route&&a.route[a.ri];
  if(!w){if(a.dest)a.phase='app';else{flGone(v);return;}}
  else{ty=flYaw(w[0]-v.px,w[1]-v.pz);const d=Math.hypot(w[0]-v.px,w[1]-v.pz);vsT=clamp((w[2]-v.py)*.08,-9,10);tgtSpd=a.dest&&a.ri>=a.route.length-3?C.vref*1.15:C.vref*1.45;
   // punto superato (anche se il raggio di virata non permette di passarci sopra): si passa al successivo
   const pv=a.rp||(a.rp=[v.px,v.pz]),passed=(v.px-w[0])*(w[0]-pv[0])+(v.pz-w[1])*(w[1]-pv[1])>0;if(d<Math.max(300,a.spd*5)||passed){a.rp=[w[0],w[1]];a.ri++;}
   if(h>60&&(a.dest||a.ga))v.gearCmd=false;if(h>90)v.flap=Math.max(a.dest?.25:0,v.flap-dt*.04);}
  if(!a.dest&&(Math.abs(v.px)>6400||Math.abs(v.pz)>6400)){flGone(v);return;}if(Math.abs(v.px)>9000||Math.abs(v.pz)>9000){flGone(v);return;}}
 if(a.phase==='app'){const F=flFinal(a.dest),d=(F.thr-v.px)*F.dir,lat=v.pz-F.z,gp=Math.max(-5,15+GS*d);
  ty=flYaw(F.dir,clamp(-(lat+v.vz*15)*.0022,-.55,.55));maxB=Math.abs(lat)>120?.56:.35;tgtSpd=d>5500?C.vref*1.3:C.vref+4;vsT=clamp(-GS*a.spd+(gp-v.py)*.15,-8,3);
  if(Math.abs(lat)>60&&d>2500){let tm=0;for(const k of [400,900,1500]){tm=Math.max(tm,groundH(v.px-Math.sin(a.yaw)*k,v.pz-Math.cos(a.yaw)*k));}if(v.py<tm+150)vsT=Math.max(vsT,clamp((tm+170-v.py)*.1,0,6));}v.gearCmd=d<5000;if(d<6500)v.flap=Math.min(1,v.flap+dt*.05);
  const R=FL.rwyBusy[a.dest];if(d<3200&&(!R||R.dead))FL.rwyBusy[a.dest]=v;
  if(a.acc==='tower'&&d<3600){const T=a.accT||(a.accT=flTowerTarget(v));if(T&&!T.dead){const dd=Math.hypot(T.x-v.px,T.z-v.pz);ty=flYaw(T.x-v.px,T.z-v.pz);vsT=clamp((T.H*.45-v.py)*.1,-8,3);maxB=.6;tgtSpd=C.vref+12;v.gearCmd=dd<1800;
    if(!a.accSaid){a.accSaid=true;flAccStart(v,'tower');}if(dd<120&&a.t>1){a.acc=null;}}else a.acc=null;}
  else if(a.acc==='short'&&d<4500){vsT=clamp(-GS*a.spd*1.9,-9,0);if(!a.accSaid&&d<2600){a.accSaid=true;}}
  else if(a.acc==='overrun'){tgtSpd=C.vref+22;vsT=clamp(-GS*a.spd+(gp+(d>600?28:8)-v.py)*.15,-8,3);}
  if(R&&R!==v&&!R.dead&&d<1300&&d>-200&&a.acc!=='tower'){flGoAround(v,'pista occupata');return;}
  if(a.acc!=='tower'&&a.acc!=='short'){if(h<(v.lk==='w'?11:v.lk==='r'?6:9)&&d<500){a.phase='flare';a.t=0;}else if(d<-650&&h>30&&a.acc!=='overrun'){flGoAround(v,'avvicinamento troppo alto');return;}}}
 if(a.phase==='flare'){const F=flFinal(a.dest);tgtSpd=C.vref-5;ty=flYaw(F.dir,-(v.pz-F.z)*.02);maxB=.1;vsT=a.acc==='hard'?-6.5:-Math.max(.6,h*.33);pitchT=a.acc==='hard'?-.01:.085;}
 // dinamica comune: velocità, virata, rateo di salita, assetto
 const bank=flTurnTo(v,dt,ty,maxB);a.spd+=clamp(tgtSpd-a.spd,-dt*1.1,dt*1.3);a.vs+=clamp(vsT-a.vs,-dt*1.6,dt*1.6);
 const pt=pitchT!==null?pitchT:Math.asin(clamp(a.vs/Math.max(20,a.spd),-.3,.3))+(a.spd<C.vref*1.4?.07:.03);a.pitch=lerp(a.pitch||0,pt,Math.min(1,dt*.9));
 const hs=Math.sqrt(Math.max(1,a.spd*a.spd-a.vs*a.vs));v.vx=-Math.sin(a.yaw)*hs;v.vz=-Math.cos(a.yaw)*hs;v.vy=a.vs;v.px+=v.vx*dt;v.pz+=v.vz*dt;v.py+=v.vy*dt;
 v.th=a.phase==='flare'?.12:clamp(.35+(tgtSpd-a.spd)*.05+a.vs*.03,.15,1);a.ip=clamp(a.vs*.08,-1,1);a.ir=clamp(-a.om*3,-1,1);flSetPose(v,a.pitch,bank);
 if(v.eng===1&&Math.random()<dt*12){const R=v.R,E=C.eng[0],x=v.px+R[0]*E.x+R[2]*(E.z+E.len*.6),y=v.py+R[3]*E.x+R[4]*E.y+R[5]*(E.z+E.len*.6),z=v.pz+R[6]*E.x+R[8]*(E.z+E.len*.6);smoke(x,y,z,-v.vx*.05,0,-v.vz*.05,2.5,rand(5,9),true);fireP(x,y,z,-v.vx*.1,0,-v.vz*.1,1.6,.6);}
 const g2=groundH(v.px,v.pz);
 if(a.phase==='flare'&&v.py-g2-C.gearH<=.05){v.py=g2+C.gearH;a.vs=0;
  if(a.acc==='hard'){a.phase='slide';a.slideW=rand(.05,.1)*(Math.random()<.5?-1:1);a.slideB=rand(-.06,.06);sndImpact(v.px,g2,v.pz,'metal',20);player.shake=Math.max(player.shake,clamp(600/(sDist(v.px,g2,v.pz)+80),0,1.2));return;}
  a.phase='rollout';a.t=0;a.rt=0;a.ex=null;
  for(const sd of [1,-1])for(let k=0;k<5;k++)smoke(v.px+v.R[0]*C.main[0]*sd,g2+.4,v.pz+v.R[6]*C.main[0]*sd,rand(-1,1),rand(0,1.2),rand(-1,1),1.8,rand(1.5,3),false);sfx({x:v.px,y:g2,z:v.pz,src:'noise',filter:'bandpass',ff0:900,ff1:400,g:.4,d:.4,ref:40});return;}
 if(v.py<g2+C.R*.6){linerCrash(v,v.px,g2+1,v.pz,'suolo');return;}if(waterAt(v.px,v.pz)>v.py-C.R*.5){linerCrash(v,v.px,v.py,v.pz,'acqua');return;}
 if(v.py-g2<500)linerHits(v);}
// corsa di atterraggio: inversori di spinta, frenata calibrata sull'uscita scelta, poi rullaggio verso la piazzola prenotata
function flRollout(v,dt){const a=v.ai,C=v.C,F=flFinal(a.dest);a.rt+=dt;v.rev=a.rt>1.5&&a.spd>26?1:0;v.th=v.rev?.75:.03;
 a.yaw+=clamp(wrapA(flYaw(F.dir,-(v.pz-F.z)*.03)-a.yaw),-dt*.08,dt*.08);a.pitch=Math.max(0,(a.pitch||0)-dt*.05);
 if(a.acc==='overrun'){a.spd=Math.max(0,a.spd-.75*dt);flGround(v,dt,a.pitch);if((v.px-F.x1)*F.dir>60){a.phase='sink';a.t2=0;flRwyRel(a.dest,v);v.rev=0;}else if(a.spd<=0){a.acc=null;}return;}
 if(!a.ex){const L=flExitList(a.dest);a.ex=L.find(e=>(e.rx-v.px)*F.dir-80>(a.spd*a.spd-100)/(2*2.2))||L[L.length-1];}
 const dist=(a.ex.rx-v.px)*F.dir-80,vt=Math.sqrt(100+2*2.2*Math.max(0,dist));if(a.spd>vt)a.spd=Math.max(vt,a.spd-3.2*dt);else if(a.spd>10)a.spd=Math.max(10,a.spd-.5*dt);
 flGround(v,dt,a.pitch);
 if(dist<=0){let st=a.st;if(!st||(st.occ&&st.occ!==v))st=flPickStand(a.dest,v.lk);if(!st){flGone(v);return;}st.occ=v;a.st=st;a.ap=a.dest;a.phase='exit';a.P=flInPath(a.dest,v,a.ex,st);v.rev=0;if(v.fl)v.fl.gate=st.name;}}
function flGone(v,keep){const f=v.fl,a=v.ai;if(player.cab===v){player.cab=null;player.fly=true;toast('Il volo ha lasciato Cube York: sei di nuovo in volo libero (X per scendere).');}if(f){if(!keep&&a&&f.from===a.ap&&!a.dest)f.status='Decollato';f.gone=true;}v.dead=true;scene.remove(v.obj);v.obj=new THREE.Group();
 if(a){if(a.tug){scene.remove(a.tug);a.tug=null;}const st=a.st;if(st&&st.occ===v)st.occ=null;for(const k in FL.rwyBusy)if(FL.rwyBusy[k]===v)FL.rwyBusy[k]=null;}
 const i=LN.list.indexOf(v);if(i>=0)LN.list.splice(i,1);const j=CVS.indexOf(v);if(j>=0)CVS.splice(j,1);}
function flTug(v){const k=PK.tug;if(!k)return null;const g=new THREE.Group();for(const p of k.parts){const m=new THREE.Mesh(p.g,p.m);m.castShadow=true;g.add(m);}scene.add(g);return g;}
/* ---------- incidenti ---------- */
function flTowerTarget(v){let best=null,bd=1e9;for(const T of HT.L){if(T.dead||T.hollow||T.H<120)continue;if(!(T.x>1250&&T.x<2300&&T.z>900))continue;const d=Math.hypot(T.x-v.px,T.z-v.pz)+Math.abs(T.z-1450)*.8;if(d<bd){bd=d;best=T;}}return best;}
function flAccStart(v,k){const f=v.fl,n=f?f.num:'';if(k==='tower')flMsg('Allarme: il volo '+n+' ha perso il sentiero di discesa e punta verso Nova!');else if(k==='engine')flMsg('Il volo '+n+' ha un motore in fiamme dopo il decollo: rientra in emergenza.');}
function flAccNote(v,why,x,z,y){const f=v.fl,n=f?f.num:'un aereo';if(f){f.status=why==='hard'?'Incidente':'Cancellato';f.acc=why;f.gone=true;}if(!v.ai||player.veh===v)return;
 const where=why==='palazzo'?(()=>{let T=htInside(x,y||20,z);if(!T){let bd=90;for(const q of HT.L){const d=Math.hypot(q.x-x,q.z-z);if(d<bd&&(y||0)<q.H+10){bd=d;T=q;}}}return T?' contro '+(T.name==='Marina'||T.name==='Faro'?'la torre '+T.name:T.name):' contro un palazzo';})():why==='acqua'?' in mare':why==='hard'?' in pista':'';
 flMsg((why==='hard'?'Atterraggio d’emergenza: il volo '+n+' ha perso il carrello':why==='overrun'?'Il volo '+n+' è uscito di pista ed è finito in mare':'Incidente: il volo '+n+' è precipitato'+where)+'.');}
function flMsg(m){FL.log.push(m);if(FL.log.length>30)FL.log.shift();}
function flTaken(v){const a=v.ai;if(a&&a.tug){scene.remove(a.tug);a.tug=null;}const f=v.fl;if(f){f.status='Dirottato';f.taken=true;f.gone=true;}const st=a&&a.st;if(st&&st.occ===v)st.occ=null;flDock(v,false);for(const k in FL.rwyBusy)if(FL.rwyBusy[k]===v)FL.rwyBusy[k]=null;}
/* ---------- orario: quanti voli per qualità grafica, arrivi da fuori mappa, partenze ---------- */
function flWant(){return S.flights==='0'?0:({bassa:3,media:5,alta:7,ultra:9}[S.q]||5)*(S.flights==='2'?1.5:1);}
function flInit(){if(!S.flights)S.flights=store.get('flights','1');if(!S.acc)S.acc=store.get('acc','1');for(const k of ['CYI','CYW']){const A=AP[k];A.stands.forEach((s,i)=>{s.name=(k==='CYI'?(s.jb?'A':'B'):'C')+(i+1);});}
 if(S.flights==='0')return;
 const plan=[['CYI',0],['CYW',0],['CYI',1],['CYI',4],['CYW',2],['CYI',2],['CYI',5],['CYI',3],['CYW',1]];let n=0;
 for(const [ap,si] of plan){if(n>=Math.ceil(flWant()*.7))break;const st=AP[ap].stands[si];if(st.occ)continue;const tkal=ap==='CYW'?['r',3]:st.w>40?['w',[0,2][n%2]]:['n',n%3];
  const dst=flPickDest(),f=flNew({tkal,from:ap,to:{side:dst.side},toName:dst.name,dep:flNow()+1.2+n*2+Math.random(),gate:st.name});const v=flParked(ap,f,st);v.ai.depT=FL.clock+(f.dep-flNow())*60;f.acc=flAccRoll(true,ap);v.ai.acc=f.acc;n++;}
 FL.next=25;}
function flSpawnArrival(){const order=Math.random()<.68?['CYI','CYW']:['CYW','CYI'];
 for(const ap of order){const F=flFinal(ap),d0=ap==='CYI'?8900:8000;let ok=true;for(const v of LN.list){const a=v.ai;if(v.dead||!a||a.dest!==ap)continue;if(a.phase==='app'&&(F.thr-v.px)*F.dir>d0-6500)ok=false;if(a.phase==='route'&&a.route&&a.ri>=a.route.length-2)ok=false;}if(!ok)continue;
  const tkal=ap==='CYW'?['r',3]:FL_TK[Math.floor(Math.random()*FL_TK.length)];const st=flPickStand(ap,tkal[0]);if(!st)continue;const o=FL_DEST[Math.floor(Math.random()*FL_DEST.length)];
  const f=flNew({tkal,from:'X',fromName:o[0],to:ap,arr:flNow()+2.5,gate:st.name});f.acc=flAccRoll(false,ap);flSpawnArr(ap,f,st);return true;}return false;}
function flStep(dt){if(!AP.CYI.stands[0].name)return;FL.clock+=dt;
 // pulizia: piazzole, piste e pontili ancora legati ad aerei precipitati
 for(const k of ['CYI','CYW']){for(const s2 of AP[k].stands)if(s2.occ&&s2.occ.dead)s2.occ=null;if(FL.rwyBusy[k]&&FL.rwyBusy[k].dead)FL.rwyBusy[k]=null;}for(const J of AP.jb)if(J.dock&&J.dock.dead)J.dock=null;
 for(let i=LN.list.length-1;i>=0;i--){const v=LN.list[i];if(v.dead&&v.py<-100&&player.veh!==v){LN.list.splice(i,1);const j=CVS.indexOf(v);if(j>=0)CVS.splice(j,1);}}
 if(S.flights!=='0'){let live=0;for(const v of LN.list)if(!v.dead&&v.ai)live++;FL.next-=dt;if(FL.next<=0){FL.next=rand(30,60)/(S.flights==='2'?1.6:1);if(live<flWant())flSpawnArrival();}}
 for(let i=FL.list.length-1;i>=0;i--){const f=FL.list[i];if(f.v&&f.v.dead&&!f.gone)f.gone=true;if(f.gone&&FL.clock-(f.goneT||(f.goneT=FL.clock))>240)FL.list.splice(i,1);}
 for(const v of LN.list){if(v.dead||!v.ai)continue;const f=v.fl;if(!f||f.gone)continue;const a=v.ai,ph=a.phase;
  if(f.from===a.ap&&!f.landed){f.status=ph==='park'?(f.dep-flNow()<2?'Imbarco':'In orario'):ph==='board'?'Chiuso':ph==='push'||ph==='taxi'||ph==='hold'||ph==='lineup'?'In rullaggio':ph==='roll'?'In decollo':ph==='climb'?'Decollato':ph==='route'&&a.dest?'Rientro':f.status;}
  else if(f.to===a.dest){const F=flFinal(a.dest);f.status=ph==='app'||ph==='flare'?((F.thr-v.px)*F.dir<4000?'In atterraggio':'In arrivo'):ph==='rollout'||ph==='exit'?'Atterrato':ph==='route'?'In attesa':f.status;}}
 FL.ft=(FL.ft||0)-dt;if(FL.ft<=0){FL.ft=2.5;flFids();}}
/* ---------- tabelloni del terminal ---------- */
function flFids(){const now=flNow();for(const B of AP.fids){const g=B.c.getContext('2d'),W=1024,H=512;g.fillStyle='#04070d';g.fillRect(0,0,W,H);g.fillStyle='#0d1626';g.fillRect(0,0,W,64);
 g.fillStyle='#ffd23a';g.font='bold 34px Arial, Helvetica, sans-serif';g.textBaseline='middle';g.fillText(B.kind==='dep'?'PARTENZE  ✈':'ARRIVI  ✈',22,34);g.fillStyle='#9fb3d1';g.font='bold 22px Arial';g.fillText(flClock(now),W-100,34);
 g.font='bold 18px Arial';g.fillStyle='#6f84a3';const cols=B.kind==='dep'?[[22,'ORA'],[110,'VOLO'],[250,'DESTINAZIONE'],[690,'GATE'],[790,'STATO']]:[[22,'ORA'],[110,'VOLO'],[250,'PROVENIENZA'],[690,'GATE'],[790,'STATO']];for(const [x,t] of cols)g.fillText(t,x,88);
 const L=FL.list.filter(f=>B.kind==='dep'?f.from===B.ap:f.to===B.ap).sort((a,b)=>(B.kind==='dep'?a.dep-b.dep:a.arr-b.arr)).slice(0,8);g.font='bold 26px "Courier New", monospace';
 L.forEach((f,i)=>{const y=126+i*46;g.fillStyle=i%2?'#08101c':'#0b1424';g.fillRect(12,y-21,W-24,42);const t=B.kind==='dep'?f.dep:f.arr||f.dep;g.fillStyle='#fff';g.fillText(flClock(t||now),22,y);g.fillStyle='#ffd23a';g.fillText(f.num,110,y);g.fillStyle='#fff';
  g.fillText((B.kind==='dep'?(f.toName||'-'):(f.fromName||'-')).toUpperCase().slice(0,24),250,y);g.fillText(f.gate||'-',690,y);
  const st=f.status||'';g.fillStyle=/Canc|Incid|Dirott/.test(st)?'#ff4d4d':/Imbarco|atterraggio/.test(st)?'#5dff7a':/Ritardo|attesa|Rientro/.test(st)?'#ffb13b':'#bcd';g.fillText(st.toUpperCase().slice(0,14),790,y);});
 if(!L.length){g.fillStyle='#6f84a3';g.font='bold 26px Arial';g.fillText('Nessun volo in programma',300,260);}
 B.t.needsUpdate=true;}}
// esplosioni vicine agli aerei: l'aereo prende fuoco e precipita (o salta in aria a terra)
{const ds0=destroySphere;destroySphere=function(x,y,z,R,P){ds0(x,y,z,R,P);for(const v of LN.list){if(v.dead)continue;const d=Math.hypot(v.px-x,v.py-y,v.pz-z);if(d<R*1.3+v.C.R*2){v.dmg+=P*(1-d/(R*1.3+v.C.R*2+1))*1.5;if(v.dmg>1.1)setTimeout(()=>{if(!v.dead)linerCrash(v,v.px,v.py,v.pz,'esplosione');},60);}}};}
// a piedi: la fusoliera spinge via chi ci cammina contro; dal pontile si entra dalla porta anteriore sinistra e si cammina in cabina
// lungo il corridoio, fino alla cabina di pilotaggio; se l'aereo si muove (rullaggio, decollo, volo) il passeggero viaggia con lui
function flCabin(v,lx,ly,lz){const C=v.C,P=player,s=C.seats,dz=C.door[0],aw=v.lk==='w'?1.15:v.lk==='r'?.22:.3,z0=C.cock.z+.38,z1=s.z1+1.3,zb=C.cock.z+1.55;
 const fyAt=z=>z<zb?C.cock.cf:z<zb+.75?lerp(C.cock.cf,C.floor,(z-zb)/.75):C.floor;let fy=fyAt(lz);
 if(ly<fy-1.3||ly>fy+1.9)return false;const atDoor=Math.abs(lz-dz)<.8&&lx<0&&lx>-(C.R+2.6);if(!atDoor&&!(lz>z0-.25&&lz<z1+.25&&Math.abs(lx)<C.R*.75))return false;
 if(atDoor&&lx<-C.R*.5){lx=clamp(lx,-(C.R+2.6),C.R*.6);lz=clamp(lz,dz-.75,dz+.75);}else{const cw=lz<zb?.32:aw;lx=clamp(lx,-(atDoor?C.R*.6:cw),atDoor?C.R*.6:cw);lz=clamp(lz,z0,z1);}
 fy=fyAt(lz);if(ly<=fy+.45&&P.vy<=.5){ly=fy;P.vy=Math.max(0,P.vy);P.ground=true;}ly=Math.min(ly,fy+.75);
 const R=v.R;P.x=v.px+R[0]*lx+R[1]*ly+R[2]*lz;P.y=v.py+R[3]*lx+R[4]*ly+R[5]*lz;P.z=v.pz+R[6]*lx+R[7]*ly+R[8]*lz;P.cab=v;P.cabL=[lx,ly,lz];P.cabW=[P.x,P.y,P.z];P.cabR=Array.from(R);return true;}
function flPlayerPush(){const P=player;if(P.mode!=='walk'||P.fly||P.swim){P.cab=null;return;}
 let v=P.cab;if(v&&(v.dead||LN.list.indexOf(v)<0))v=P.cab=null;
 if(v){const o=P.cabR,dx=P.x-P.cabW[0],dy=P.y-P.cabW[1],dz=P.z-P.cabW[2],L=P.cabL;if(flCabin(v,L[0]+o[0]*dx+o[3]*dy+o[6]*dz,L[1]+o[1]*dx+o[4]*dy+o[7]*dz,L[2]+o[2]*dx+o[5]*dy+o[8]*dz))return;P.cab=null;}
 for(const u of LN.list){if(u.dead)continue;const dx=P.x-u.px,dz=P.z-u.pz;if(dx*dx+dz*dz>u.C.L*u.C.L*.3)continue;const R=u.R,dy=P.y-u.py,C=u.C,lx=R[0]*dx+R[3]*dy+R[6]*dz,ly=R[1]*dx+R[4]*dy+R[7]*dz,lz=R[2]*dx+R[5]*dy+R[8]*dz;
  if(flCabin(u,lx,ly,lz))return;
  if(Math.abs(lz)<C.L*.45&&Math.abs(ly+1)<C.R+.2&&Math.abs(lx)<C.R+.35){const sg=Math.sign(lx)||1,pen=C.R+.35-Math.abs(lx);P.x+=R[0]*sg*pen;P.z+=R[6]*sg*pen;}}}
