/* ======================= PATCH Z — COLLISIONI TRA AEREI (e tra aerei, auto e persone) ======================= */
// Ogni velivolo ha una forma vera: gli aerei di linea fusoliera, ali (con freccia, diedro e spessore), piani di coda, deriva e motori;
// caccia e bombardieri una scatola; gli elicotteri cabina, trave di coda e disco del rotore; il disco volante un ellissoide.
// Si confrontano solo le coppie vicine: i punti campione di uno (bordi d'attacco e d'uscita, fusoliera, motori, pale) contro la forma dell'altro.
// In volo, o a terra oltre ~40 km/h, è uno scontro e precipitano entrambi; a terra e piano è un urto: scintille, rumore, aerei fermi.
// Inoltre gli aerei di linea diventano solidi per auto, rottami, elicotteri e per chi va a piedi.
const ACOL={pts:{},cool:new Map(),ghost:new Map(),t:0};
// punti campione in coordinate locali [x,y,z,raggio]
function acLinerPts(C){if(C._acp)return C._acp;const P=[],W=C.wing,T=C.stab,E=C.eng;
 for(let k=0;k<=6;k++)P.push([0,0,-C.L/2+C.R+(C.L-C.R*1.5)*k/6,C.R*.95]);
 const wt=W[W.length-1][0];for(let k=0;k<=5;k++){const x=W[0][0]+(wt-W[0][0])*k/5,zl=tabAt(W,x,2),ch=tabAt(W,x,3),y=tabAt(W,x,1);for(const s of[-1,1])for(const f of[.05,.5,.95])P.push([s*x,y,zl+ch*f,.35]);}
 const tt=T[T.length-1][0];for(let k=0;k<=2;k++){const x=T[0][0]+(tt-T[0][0])*k/2,zl=tabAt(T,x,2),ch=tabAt(T,x,3),y=tabAt(T,x,1);for(const s of[-1,1])P.push([s*x,y,zl+ch*.5,.35]);}
 const F=C.fin;for(const q of F)P.push([0,q[1],q[2]+q[0]*.5,.4]);
 for(const e of E)for(const s of[-1,1])P.push([s*e.x,e.y,e.z,e.r]);
 return C._acp=P;}
function acPts(I){const o=I.o;if(I.k==='l')return acLinerPts(o.C);
 if(I.k==='p'){if(!o._acp){const P=[];for(let k=0;k<=4;k++)P.push([0,0,-o.hz+o.hz*.5*k,1]);for(const s of[-1,1])for(const f of[.35,.7,1])P.push([s*o.hx*f,0,0,.6]);o._acp=P;}return o._acp;}
 if(I.k==='h'){if(!ACOL.pts.h){const P=[[0,0,0,1.6],[0,-.2,-2,1],[0,.9,4.8,.6],[0,1,6.6,.5]];for(let k=0;k<8;k++){const a=k/8*TAU;P.push([Math.cos(a)*6.9,1.75,Math.sin(a)*6.9,.35],[Math.cos(a)*3.6,1.75,Math.sin(a)*3.6,.35]);}ACOL.pts.h=P;}return ACOL.pts.h;}
 if(!ACOL.pts.u){const P=[[0,0,0,2.5]];for(let k=0;k<8;k++){const a=k/8*TAU;P.push([Math.cos(a)*4.6,0,Math.sin(a)*4.6,.8]);}ACOL.pts.u=P;}return ACOL.pts.u;}
// il punto locale (x,y,z) con raggio r tocca la forma? restituisce la profondità di penetrazione (0 = no)
function acLinerIn(C,x,y,z,r){const ax=Math.abs(x);let d=0;
 if(Math.abs(z)<C.L/2-.3){const q=Math.hypot(x,y);if(q<C.R+r)d=Math.max(d,C.R+r-q);}
 const W=C.wing,wt=W[W.length-1][0];if(ax>C.R*.6&&ax<wt+r){const zl=tabAt(W,ax,2),ch=tabAt(W,ax,3),wy=tabAt(W,ax,1),th=tabAt(W,ax,4)*ch*.5;if(z>zl-r&&z<zl+ch+r){const p=th+r-Math.abs(y-wy);if(p>0)d=Math.max(d,p);}}
 const T=C.stab,tt=T[T.length-1][0];if(ax<tt+r){const zl=tabAt(T,ax,2),ch=tabAt(T,ax,3),ty=tabAt(T,ax,1),th=.1*ch*.5;if(z>zl-r&&z<zl+ch+r){const p=th+r-Math.abs(y-ty);if(p>0)d=Math.max(d,p);}}
 const F=C.fin;if(ax<.35+r&&y>C.R*.5&&y<F[F.length-1][1]+r){const t=clamp((y-F[0][1])/((F[F.length-1][1]-F[0][1])||1),0,1),zl=F[0][2]+(F[F.length-1][2]-F[0][2])*t,ch=F[0][0]+(F[F.length-1][0]-F[0][0])*t;if(z>zl-r&&z<zl+ch+r)d=Math.max(d,.35+r-ax);}
 for(const e of C.eng){const q=Math.hypot(ax-e.x,y-e.y);if(q<e.r+r&&Math.abs(z-e.z)<e.len/2+r)d=Math.max(d,e.r+r-q);}
 // gambe del carrello (principale e anteriore)
 if(y<-C.R*.4&&y>-C.gearH-r){const q=Math.hypot(ax-C.main[0],z-C.main[1]);if(q<.6+r)d=Math.max(d,.6+r-q);const qn=Math.hypot(x,z-C.nose[0]);if(qn<.4+r)d=Math.max(d,.4+r-qn);}
 return d;}
function acIn(I,x,y,z,r){const o=I.o;if(I.k==='l')return acLinerIn(o.C,x,y,z,r);
 if(I.k==='p'){const a=o.hx+r-Math.abs(x),b=1.2+r-Math.abs(y),c=o.hz+r-Math.abs(z);return a>0&&b>0&&c>0?Math.min(a,b,c):0;}
 if(I.k==='h'){let d=0;const a=1.1+r-Math.abs(x),b=1.5+r-Math.abs(y),c=2.2+r-Math.abs(z);if(a>0&&b>0&&c>0)d=Math.min(a,b,c);
  if(Math.abs(x)<.3+r&&Math.abs(y-.9)<.5+r&&z>2&&z<7.2+r)d=Math.max(d,.3);const q=Math.hypot(x,z);if(q<7.4+r&&Math.abs(y-1.75)<.25+r)d=Math.max(d,.25+r-Math.abs(y-1.75));return d;}
 const e=(x*x+z*z)/(5.5+r)**2+y*y/(1.5+r)**2;return e<1?(1-e)*2:0;}
function acItems(){const L=[];for(const v of CVS){if(v.dead||!v.obj||!v.obj.parent)continue;
  if(v.type==='liner')L.push({k:'l',o:v,x:v.px,y:v.py,z:v.pz,r:Math.hypot(v.C.span/2,v.C.L/2)+2,vx:v.vx,vy:v.vy,vz:v.vz,R:v.R});
  else if(v.type==='plane')L.push({k:'p',o:v,x:v.px,y:v.py,z:v.pz,r:Math.hypot(v.hx,v.hz)+1.5,vx:v.vx,vy:v.vy,vz:v.vz,R:v.R});
  else if(v.type==='ufo')L.push({k:'u',o:v,x:v.px,y:v.py,z:v.pz,r:6.5,vx:v.vx,vy:v.vy,vz:v.vz,R:v.R});}
 for(const b of helis){if(b.dead||!b.heli||b.heli.dead)continue;L.push({k:'h',o:b,x:b.px,y:b.py,z:b.pz,r:8,vx:b.vx,vy:b.vy,vz:b.vz,R:b.R});}return L;}
// punti di A dentro la forma di B: restituisce il punto di contatto in coordinate del mondo
function acTest(A,B){const P=acPts(A),Ra=A.R,Rb=B.R;for(const p of P){const wx=A.x+Ra[0]*p[0]+Ra[1]*p[1]+Ra[2]*p[2],wy=A.y+Ra[3]*p[0]+Ra[4]*p[1]+Ra[5]*p[2],wz=A.z+Ra[6]*p[0]+Ra[7]*p[1]+Ra[8]*p[2];
  const dx=wx-B.x,dy=wy-B.y,dz=wz-B.z;if(dx*dx+dy*dy+dz*dz>(B.r+p[3])**2)continue;const lx=dx*Rb[0]+dy*Rb[3]+dz*Rb[6],ly=dx*Rb[1]+dy*Rb[4]+dz*Rb[7],lz=dx*Rb[2]+dy*Rb[5]+dz*Rb[8];
  if(acIn(B,lx,ly,lz,p[3])>0)return [wx,wy,wz];}return null;}
function acAir(I){const o=I.o,g=groundH(I.x,I.z);if(I.k==='l')return I.y-g-o.C.gearH>2.5;if(I.k==='p')return I.y-g>4.5;if(I.k==='h')return I.y-g>3.2&&o.heli.rpm>.4;return true;}
function acName(I){const v=I.o;if(I.k==='l')return v.fl?'il volo '+v.fl.num:'un aereo di linea';if(I.k==='p')return v.p&&v.p.name?'il '+v.p.name.toLowerCase():'un aereo militare';if(I.k==='h')return 'un elicottero';return 'il disco volante';}
function acKill(I,x,y,z){const o=I.o;if(I.k==='l')linerCrash(o,x,y,z,'collisione');else if(I.k==='p')planeCrash(o);else if(I.k==='h')heliCrash(o);}
function acHit(A,B,c){const rv=Math.hypot(A.vx-B.vx,A.vy-B.vy,A.vz-B.vz),key=A.o===B.o?0:[A.o,B.o];
 if(acAir(A)||acAir(B)||rv>11){if(A.k==='u'&&B.k==='u')return;acKill(A,c[0],c[1],c[2]);acKill(B,c[0],c[1],c[2]);
  const m='Collisione: '+acName(A)+' si è scontrato con '+acName(B)+'.';if(typeof flMsg==='function'&&(A.k==='l'||B.k==='l'))flMsg(m.charAt(0).toUpperCase()+m.slice(1));return;}
 // urto lento a terra: scintille, lamiere che strisciano, chi si muoveva si ferma
 const ck=ACOL.cool.get(A.o)===B.o||ACOL.cool.get(B.o)===A.o;sparks(c[0],c[1],c[2],30,4);if(!ck){sndImpact(c[0],c[1],c[2],'metal',Math.max(6,rv*3));ACOL.cool.set(A.o,B.o);ACOL.cool.set(B.o,A.o);
  if(A.k==='l'||B.k==='l')flMsg('Urto a terra: '+acName(A)+' ha toccato '+acName(B)+'. Aerei fermi per i controlli.');}
 for(const I of[A,B]){const o=I.o;if(I.k==='l'&&o.ai){o.ai.bumpT=25;o.ai.spd=0;}if(I.k!=='h'){o.vx*=.2;o.vz*=.2;}else{o.vx*=.5;o.vz*=.5;}}
 // chi è in movimento non resta incastrato: per un minuto ignora l'altro
 ACOL.ghost.set(A.o,{b:B.o,t:60});ACOL.ghost.set(B.o,{b:A.o,t:60});}
function acStep(dt){const L=acItems();for(const [k,g] of ACOL.ghost){g.t-=dt;if(g.t<=0)ACOL.ghost.delete(k);}
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const A=L[i],B=L[j],dx=A.x-B.x,dy=A.y-B.y,dz=A.z-B.z,rr=A.r+B.r;if(dx*dx+dy*dy+dz*dz>rr*rr)continue;
  // due aerei di linea fermi alle piazzole o il disco volante con sé stesso: niente
  const gA=ACOL.ghost.get(A.o),gB=ACOL.ghost.get(B.o);if(gA&&gA.b===B.o||gB&&gB.b===A.o)continue;
  if(Math.hypot(A.vx,A.vy,A.vz)<.2&&Math.hypot(B.vx,B.vy,B.vz)<.2)continue;
  const c=acTest(A,B)||acTest(B,A);if(c)acHit(A,B,c);}}
// gli aerei urtati a terra restano fermi qualche secondo
{const fb0=flAIStep;flAIStep=function(v,dt){const a=v.ai;if(a&&a.bumpT>0&&!v.dead){a.bumpT-=dt;v.vx=v.vz=0;a.spd=0;return;}return fb0(v,dt);};}

// ---------- aerei di linea solidi per auto, rottami ed elicotteri (contatto punto-forma) e per chi va a piedi ----------
const ACB={L:[],t:0,off:false};
function acBodiesRefresh(){ACB.L.length=0;for(const v of CVS){if(v.type!=='liner'||v.dead||!v.obj||!v.obj.parent)continue;ACB.L.push({v,r:Math.hypot(v.C.span/2,v.C.L/2)+1});}}
// contatto punto-aereo in coordinate locali: per ogni pezzo si spinge fuori lungo l'asse più corto (fusoliera e motori: radiale o di testa;
// ali e piani di coda: sopra/sotto, bordo d'attacco/d'uscita o estremità; deriva: di lato)
const _acc={d:0,x:0,y:0,z:0};
function acLinerContact(C,x,y,z){let best=null;const ax=Math.abs(x),sx=x<0?-1:1,take=(d,nx,ny,nz)=>{if(d>0&&(!best||d<best.d))best={d,x:nx,y:ny,z:nz};};
 {const q=Math.hypot(x,y),dr=C.R-q,da=C.L/2-.3-Math.abs(z);if(dr>0&&da>0){if(dr<da)take(dr,x/(q||1),y/(q||1),0);else take(da,0,0,z<0?-1:1);}}
 for(const e of C.eng){const q=Math.hypot(ax-e.x,y-e.y),dr=e.r-q,da=e.len/2-Math.abs(z-e.z);if(dr>0&&da>0){if(dr<da)take(dr,sx*(ax-e.x)/(q||1),(y-e.y)/(q||1),0);else take(da,0,0,z<e.z?-1:1);}}
 const plate=(T,th0)=>{const tt=T[T.length-1][0];if(ax>tt)return;const zl=tabAt(T,ax,2),ch=tabAt(T,ax,3),wy=tabAt(T,ax,1),th=th0?th0*ch*.5:tabAt(T,ax,4)*ch*.5;
  const dy=th-Math.abs(y-wy),dl=z-zl,dt=zl+ch-z,dx=tt-ax;if(dy<=0||dl<=0||dt<=0)return;const m=Math.min(dy,dl,dt,dx);
  if(m===dy)take(dy,0,y>wy?1:-1,0);else if(m===dl)take(dl,0,0,-1);else if(m===dt)take(dt,0,0,1);else take(dx,sx,0,0);};
 if(ax>C.R*.6)plate(C.wing,0);plate(C.stab,.1);
 {const F=C.fin,y0=F[0][1],y1=F[F.length-1][1];if(ax<.35&&y>C.R*.5&&y<y1){const t=clamp((y-y0)/((y1-y0)||1),0,1),zl=F[0][2]+(F[F.length-1][2]-F[0][2])*t,ch=F[0][0]+(F[F.length-1][0]-F[0][0])*t;if(z>zl&&z<zl+ch)take(.35-ax,sx,0,0);}}
 if(y<-C.R*.4&&y>-C.gearH){const q=Math.hypot(ax-C.main[0],z-C.main[1]);if(q<.6)take(.6-q,sx*(ax-C.main[0])/(q||1),0,(z-C.main[1])/(q||1));const qn=Math.hypot(x,z-C.nose[0]);if(qn<.4)take(.4-qn,x/(qn||1),0,(z-C.nose[0])/(qn||1));}
 return best;}
function acPointLiner(x,y,z,o){for(const e of ACB.L){const v=e.v,dx=x-v.px,dy=y-v.py,dz=z-v.pz;if(dx*dx+dz*dz>e.r*e.r||dy>25||dy<-12)continue;const R=v.R,C=v.C,lx=dx*R[0]+dy*R[3]+dz*R[6],ly=dx*R[1]+dy*R[4]+dz*R[7],lz=dx*R[2]+dy*R[5]+dz*R[8];
  const c=acLinerContact(C,lx,ly,lz);if(!c)continue;
  o.nx=R[0]*c.x+R[1]*c.y+R[2]*c.z;o.ny=R[3]*c.x+R[4]*c.y+R[5]*c.z;o.nz=R[6]*c.x+R[7]*c.y+R[8]*c.z;o.d=Math.min(c.d,1.2);o.b=null;o.ci=-1;return true;}return false;}
{const pc3=pointContact;pointContact=function(x,y,z,o){return pc3(x,y,z,o)||(ACB.L.length>0&&!ACB.off&&acPointLiner(x,y,z,o));};}
// i controlli "aereo contro palazzi" non devono vedere gli aerei stessi (gli scontri tra aerei li gestisce acStep)
{const lh0=linerHits;linerHits=function(v){ACB.off=true;try{return lh0(v);}finally{ACB.off=false;}};}
{const sb3=solidBoxes;solidBoxes=function(x0,y0,z0,x1,y1,z1,out){sb3(x0,y0,z0,x1,y1,z1,out);if(!ACB.L.length)return out;const mx=(x0+x1)/2,mz=(z0+z1)/2;
 const P=player;for(const e of ACB.L){const v=e.v;if(P.cab===v||P.veh===v||Math.abs(v.px-mx)>e.r+4||Math.abs(v.pz-mz)>e.r+4)continue;const C=v.C,R=v.R,n=Math.ceil(C.L/2.5);
  // fusoliera a fette, gambe del carrello e motori: scatole allineate agli assi intorno a ogni pezzo
  for(let k=0;k<n;k++){const lz=-C.L/2+(k+.5)*C.L/n,cx=v.px+R[2]*lz,cy=v.py+R[5]*lz,cz=v.pz+R[8]*lz,h=C.L/n/2,ex=Math.abs(R[2])*h+Math.abs(R[0])*C.R+Math.abs(R[1])*C.R,ez=Math.abs(R[8])*h+Math.abs(R[6])*C.R+Math.abs(R[7])*C.R;
   if(cx+ex<x0||cx-ex>x1||cz+ez<z0||cz-ez>z1||cy+C.R<y0||cy-C.R>y1)continue;out.push(cx-ex,cy-C.R*.92,cz-ez,cx+ex,cy+C.R*.92,cz+ez);}
  const gy=groundH(v.px,v.pz);for(const s of[-1,1]){for(const E of C.eng){const cx=v.px+R[0]*s*E.x+R[2]*E.z,cy=v.py+R[3]*s*E.x+R[4]*E.y+R[5]*E.z,cz=v.pz+R[6]*s*E.x+R[8]*E.z,ex=Math.abs(R[2])*E.len/2+Math.abs(R[0])*E.r,ez=Math.abs(R[8])*E.len/2+Math.abs(R[6])*E.r;
    if(cx+ex<x0||cx-ex>x1||cz+ez<z0||cz-ez>z1)continue;out.push(cx-ex,cy-E.r,cz-ez,cx+ex,cy+E.r,cz+ez);}
   const gx=v.px+R[0]*s*C.main[0]+R[2]*C.main[1],gz=v.pz+R[6]*s*C.main[0]+R[8]*C.main[1];if(gx+.6>x0&&gx-.6<x1&&gz+.9>z0&&gz-.9<z1)out.push(gx-.6,gy,gz-.9,gx+.6,v.py-C.R*.5,gz+.9);}
  const nx=v.px+R[2]*C.nose[0],nz=v.pz+R[8]*C.nose[0];if(nx+.4>x0&&nx-.4<x1&&nz+.6>z0&&nz-.6<z1)out.push(nx-.4,gy,nz-.6,nx+.4,v.py-C.R*.5,nz+.6);}
 return out;};}
// un aereo che rulla spinge via auto e rottami che trova sulla sua strada
function acPush(){for(const e of ACB.L){const v=e.v,sp=Math.hypot(v.vx,v.vz);if(sp<1.2||v.py-groundH(v.px,v.pz)-v.C.gearH>3)continue;const R=v.R,C=v.C;
 for(const b of bodies){if(b.dead||b.heli||Math.abs(b.px-v.px)>e.r||Math.abs(b.pz-v.pz)>e.r)continue;const dx=b.px-v.px,dy=b.py-v.py,dz=b.pz-v.pz,lx=dx*R[0]+dy*R[3]+dz*R[6],ly=dx*R[1]+dy*R[4]+dz*R[7],lz=dx*R[2]+dy*R[5]+dz*R[8];
  if(acLinerIn(C,lx,ly,lz,Math.max(b.hx,b.hz)*.8)<=0)continue;const rv=(v.vx-b.vx)*v.vx/sp+(v.vz-b.vz)*v.vz/sp;if(rv<.5)continue;wake(b);const k=Math.min(1,v.C.mass/(v.C.mass+(b.m||1000)));
  b.vx+=v.vx/sp*rv*k*1.1+lx*0;b.vz+=v.vz/sp*rv*k*1.1;b.vy+=rv*.15;if(rv>4){sparks(b.px,b.py,b.pz,12,3);sndImpact(b.px,b.py,b.pz,'metal',rv*2);}}}}
{const fa=frameUpdate;frameUpdate=function(dt){fa(dt);ACB.t-=dt;if(ACB.t<=0){ACB.t=.5;acBodiesRefresh();}acStep(dt);acPush();};}
{const ra=resetCity;resetCity=function(){ra();ACOL.cool.clear();ACOL.ghost.clear();acBodiesRefresh();};}
// i corpi fisici controllano i contatti "fini" solo vicino ai palazzi: si aggiungono aerei di linea, mezzi di rampa, porte della caserma
// e le strutture della base militare (prima auto e camion ci passavano attraverso)
{const nb1=nearB;nearB=function(b){if(nb1(b))return true;const r=b.r+1;
 if(typeof BZC!=='undefined'&&BZC.grid&&b.px>-1330&&b.px<330&&b.pz>-2310&&b.pz<-1300){for(const q of [[0,0],[r,r],[-r,r],[r,-r],[-r,-r]]){const a=BZC.grid.get(Math.floor((b.px+q[0])/32)*100003+Math.floor((b.pz+q[1])/32));if(a&&a.length)return true;}}
 if(typeof AV!=='undefined'&&AV.ready&&b.px>2560&&b.px<3880&&b.pz>1380&&b.pz<1620){for(const v of AV.list){if(!v.alive)continue;const q=v.K.len/2+r+(v.carts.length?13:0);if(Math.abs(v.x-b.px)<q&&Math.abs(v.z-b.pz)<q)return true;}if(Math.abs(b.px-3710)<20+r&&Math.abs(b.pz-1424)<r+2)return true;}
 for(const e of ACB.L){const v=e.v;if(Math.abs(v.px-b.px)<e.r+r&&Math.abs(v.pz-b.pz)<e.r+r&&b.py-r<v.py+25)return true;}return false;};}
