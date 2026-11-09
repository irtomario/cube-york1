/* ======================= PATCH AA — DISTRUZIONE DEGLI EDIFICI PIÙ FINE ======================= */
// La griglia dei palazzi resta a blocchi di 4 m (fisica, crolli e prestazioni dipendono da quella), ma la rottura non è più
// "a cubetti": i blocchi colpiti e non ancora staccati si sbriciolano sulla faccia rivolta all'esplosione (spigoli mangiati,
// ferri d'armatura che spuntano), i blocchi vicini al centro si spezzano in più pezzi e ogni distacco lascia più calcinacci.
const ADS={hi:()=>QP===PRESETS.alta||QP===PRESETS.ultra};
function adCrumble(x,y,z,R){let n=0;const lim=QP===PRESETS.bassa?10:(QP===PRESETS.media?28:(QP===PRESETS.alta?55:80)),M=R+4;
 for(const b of buildings){if(!b.vox)continue;if(x+M<b.x0||x-M>b.x0+b.w||z+M<b.z0||z-M>b.z0+b.d||y-M>b.h||y+M<0)continue;
  const V=b.vox,C=V.cells,HP=V.hp,H0=STYLE[b.style].hp,L=b.nx*b.nz;
  const ix0=Math.max(0,Math.floor((x-M-b.x0)/4)),ix1=Math.min(b.nx-1,Math.floor((x+M-b.x0)/4)),iy0=Math.max(0,Math.floor((y-M)/4)),iy1=Math.min(b.ny-1,Math.floor((y+M)/4)),iz0=Math.max(0,Math.floor((z-M-b.z0)/4)),iz1=Math.min(b.nz-1,Math.floor((z+M-b.z0)/4));
  for(let iy=iy0;iy<=iy1;iy++)for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){const ci=ix+b.nx*(iz+b.nz*iy);if(C[ci]<0)continue;
   const hr=HP[ci]/(H0*(iy===0?1.5:1));if(hr>.68)continue;const cx=b.x0+ix*4+2,cy=iy*4+2,cz=b.z0+iz*4+2,vx=x-cx,vy=y-cy,vz=z-cz,ax=Math.abs(vx),ay=Math.abs(vy),az=Math.abs(vz);
   // la faccia rivolta verso l'esplosione, se è all'aperto (niente blocco pieno dall'altra parte)
   let bit,nb;if(ax>=ay&&ax>=az){bit=vx>0?1:2;nb=vx>0?(ix<b.nx-1?ci+1:-1):(ix>0?ci-1:-1);}else if(ay>=az){bit=vy>0?4:8;nb=vy>0?(iy<b.ny-1?ci+L:-1):(iy>0?ci-L:-1);}else{bit=vz>0?16:32;nb=vz>0?(iz<b.nz-1?ci+b.nx:-1):(iz>0?ci-b.nx:-1);}
   if(nb>=0&&C[nb]>=0)continue;if(iy===0&&bit===8)continue;
   breakFace(b,ci,bit);n++;
   // molto danneggiato: si sbriciola anche una seconda faccia esposta
   if(hr<.35){const o=[[1,ix<b.nx-1?ci+1:-1],[2,ix>0?ci-1:-1],[16,iz<b.nz-1?ci+b.nx:-1],[32,iz>0?ci-b.nx:-1],[4,iy<b.ny-1?ci+L:-1]];for(const [bt,q] of o){if(bt===bit||(q>=0&&C[q]>=0))continue;breakFace(b,ci,bt);break;}}
   if(Math.random()<.5)gravel(cx+Math.sign(vx)*Math.min(2,ax),cy+Math.sign(vy)*Math.min(2,ay),cz+Math.sign(vz)*Math.min(2,az),5,2.5,b.style);
   if(n>=lim)return;}}}
{const ds0=destroySphere;destroySphere=function(x,y,z,R,P){ds0(x,y,z,R,P);try{adCrumble(x,y,z,R);}catch(e){if(!ADS.err){ADS.err=1;console.warn('sbriciolamento',e);}}};}
// i blocchi vicini al centro si spezzano in più pezzi (con la qualità alta o ultra)
fragmentBox=function(cx,cy,cz,sx,sy,sz,st,sd,mask,vx,vy,vz,heat,depth){let out=[];splitBox(cx,cy,cz,sx,sy,sz,mask,out);
 if(depth===2){const pr=ADS.hi()?.6:.42,o2=[];for(const p of out){if(Math.random()<pr)splitBox(p[0],p[1],p[2],p[3],p[4],p[5],p[6],o2);else o2.push(p);}out=o2;}
 const sp=Math.hypot(vx,vy,vz)*.15+1.2;let n=0;
 for(const p of out){const sm=Math.sqrt(4/Math.max(1,p[3]+p[4]+p[5]))*1.1;if(spawnDebris(p[0],p[1],p[2],p[3],p[4],p[5],st,sd,p[6],(vx+(p[0]-cx)*sp)*sm+rand(-1,1),(vy+(p[1]-cy)*sp*.6)*sm+rand(0,1.5),(vz+(p[2]-cz)*sp)*sm+rand(-1,1),heat))n++;}
 if(n<out.length)dustPuff(cx,cy,cz,5);chips(cx,cy,cz,depth===2?11:5);if(depth===2)dustPuff(cx,cy,cz,6);
 if(ADS.hi())gravel(cx,cy,cz,depth===2?10:6,Math.min(9,sp*1.2+2),st);};
// più calcinacci a ogni distacco (alta/ultra)
{const gv0=gravel;gravel=function(x,y,z,n,sp,st){return gv0(x,y,z,ADS.hi()?Math.round(n*1.5):n,sp,st);};}
/* ======================= PATCH AA — FISICA: VENTO SUGLI AEREI, ADERENZA DELLE GOMME ======================= */
function onGround0(v){return v.py<=groundH(v.px,v.pz)+(v.m&&v.m.gearH||0)+.1;}
// raffiche (più forti col maltempo e vicino al suolo caldo) e aria del tornado che sbatte gli aerei
function airGust(v,dt){if(WX.wind>.2){const t=simT,w=WX.wind;v.vx+=(Math.sin(t*1.3+v.px*.011)+Math.sin(t*3.7+v.pz*.017)*.5)*w*1.3*dt;v.vy+=(Math.sin(t*2.1+v.pz*.013)+Math.sin(t*5.3+v.px*.02)*.6)*w*1.8*dt;v.vz+=(Math.cos(t*1.7+v.px*.009)+Math.cos(t*4.1)*.5)*w*1.3*dt;}
 for(const T of tornados){if(T.s<=0)continue;const dx=v.px-T.x,dz=v.pz-T.z;if(dx*dx+dz*dz>T.Rc*T.Rc*40)continue;tornadoAir(T,v.px,v.py-groundH(v.px,v.pz),v.pz,_air);const k=Math.min(.5,dt*.8);v.vx+=(_air[0]-v.vx)*k*.4;v.vy+=(_air[1]-v.vy)*k*.4;v.vz+=(_air[2]-v.vz)*k*.4;if(player.veh===v)player.shake=Math.max(player.shake,.35*T.s);}}
// aderenza: asfalto asciutto 1, bagnato fino a 0,7; erba ~0,62, terra/sabbia ~0,55, neve ~0,35
function surfGrip(x,z){let g=1;const wet=U.uWetG?U.uWetG.value:0;
 if(isCore(x,z)){if(inDesert(x,z))g=.55;else if(x>-131&&x<131&&z>-582&&z<-90&&!(Math.abs(aveOff(x))<9||Math.abs(stOff(z))<6))g=.66;}
 else if(typeof inZone==='function'&&inZone(x,z,0)){if(typeof rcSurfZone==='function'&&rcSurfZone(x,z)===2)g=.64;}
 else{const r=typeof RDG!=='undefined'&&RDG?roadQ(x,z):null;if(!r||r.d>5.4){const h=worldH(x,z);g=h>500?.36:(h<3.2?.56:.62);}}
 return g*(1-.3*wet*(g>.9?1:.6));}
{const cf0=carForces;carForces=function(b,dt){const c=b.car;if(c){c.gmT=(c.gmT||0)-dt;if(c.gmT<=0){c.gmT=.2+Math.random()*.1;c.gm=surfGrip(b.px,b.pz);}}return cf0(b,dt);};}
