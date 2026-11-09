/* ======================= PATCH AA — STRADE E FIUMI CHE NON SI SCONTRANO: PONTI VERI, STRADE SOPRA L'ACQUA, ALVEI NON RIEMPITI ======================= */
// Prima: il profilo della strada veniva alzato sopra l'acqua e POI limitato all'8% di pendenza, che abbassava di nuovo i ponti
// fino a metterli sotto il pelo dell'acqua (il fiume restava sospeso sopra una trincea). Ora i minimi sopra l'acqua sono vincoli
// rigidi e le rampe di accesso si alzano con la stessa pendenza massima.
const RDX={moved:0,raised:0,cross:[],tun:[]};
// le strade che corrono parallele a un fiume vengono spostate fuori dall'alveo (tranne nei punti in cui lo attraversano)
function rdAvoidRivers(P){if(!RVG)return P;const N=P.length,info=P.map(p=>{const r=riverQ(p.x,p.z);if(!r)return null;const s=RVS[r.i],dx=s.bx-s.ax,dz=s.bz-s.az,L=Math.hypot(dx,dz)||1,cx=s.ax+dx*r.t,cz=s.az+dz*r.t,side=Math.sign((p.x-s.ax)*dz-(p.z-s.az)*dx)||1;return {d:r.d,w:r.w,cx,cz,side,ux:dx/L,uz:dz/L,seg:r.i};});
 const prot=new Uint8Array(N);
 for(let i=0;i<N-1;i++){const a=info[i],b=info[i+1];if(!a||!b)continue;if(a.side!==b.side&&a.d<a.w+40&&b.d<b.w+40){const k=Math.ceil((Math.max(a.w,b.w)+45)/10);for(let j=Math.max(0,i-k);j<=Math.min(N-1,i+1+k);j++)prot[j]=1;RDX.cross.push([Math.round(P[i].x),Math.round(P[i].z)]);}}
 let any=false;const Q=P.map((p,i)=>{const q=info[i];if(!q||prot[i])return {x:p.x,z:p.z};if((i===0||i===N-1)&&(coreNear(p.x,p.z).d<250||inZone(p.x,p.z,150)))return {x:p.x,z:p.z};const need=q.w+30;if(q.d>=need)return {x:p.x,z:p.z};any=true;RDX.moved++;
  let nx=p.x-q.cx,nz=p.z-q.cz,l=Math.hypot(nx,nz);if(l<.5){nx=q.uz*q.side;nz=-q.ux*q.side;l=1;}return {x:q.cx+nx/l*need,z:q.cz+nz/l*need};});
 if(!any)return P;
 // ammorbidisce il tracciato spostato (niente gomiti), lasciando fermi i tratti protetti e le estremità
 for(let it=0;it<3;it++){const R=Q.map(p=>({x:p.x,z:p.z}));for(let i=2;i<N-2;i++){if(prot[i])continue;let sx=0,sz=0;for(let j=-2;j<=2;j++){sx+=Q[i+j].x;sz+=Q[i+j].z;}R[i].x=sx/5;R[i].z=sz/5;}for(let i=2;i<N-2;i++)if(!prot[i]){Q[i].x=R[i].x;Q[i].z=R[i].z;}}
 return Q;}
// quota minima della strada in ogni punto: sopra i fiumi e i laghi da attraversare un ponte con 6,5 m di luce, vicino all'acqua sempre sopra le sponde
function rdMinY(x,z,g,low){let mn=-1e9;if(low){if(RVG){const r=riverQ(x,z);if(r){const ex=r.d-r.w;if(ex<3)mn=r.y+2;else if(ex<14)mn=r.y+.9;}}for(const L of LAKES){if(L.lv===undefined)continue;if(Math.hypot(x-L.x,z-L.z)<L.r*1.3)mn=Math.max(mn,L.lv+2);}if(g<waterLevel+.6)mn=Math.max(mn,waterLevel+2);return mn;}
 if(RVG){const r=riverQ(x,z);if(r){const ex=r.d-r.w;if(ex<3)mn=Math.max(mn,r.y+6.5);else if(ex<22)mn=Math.max(mn,r.y+2.6);else if(ex<40)mn=Math.max(mn,r.y+1.2);}}
 for(const L of LAKES){if(L.lv===undefined)continue;const dx=x-L.x,dz=z-L.z,dd=Math.hypot(dx,dz);if(dd>L.r*2.4)continue;const a=Math.atan2(dz,dx),rr=lakeRR(L,a);
  if(dd<rr+3.5||g<L.lv+.5)mn=Math.max(mn,L.lv+6.5);else if(dd<rr+30)mn=Math.max(mn,L.lv+2);}
 if(g<waterLevel+.6)mn=Math.max(mn,waterLevel+6.5);return mn;}
worldInit=function(){
 for(const L of LAKES){L.ph=L.x*.01;let m=1e9;for(const k of[1.06,1.3,1.55,1.78])for(let i=0;i<28;i++){const a=i/28*TAU;m=Math.min(m,worldPre(L.x+Math.cos(a)*L.r*k,L.z+Math.sin(a)*L.r*k,true));}L.lv=Math.max(2,m-1.2);L.dp=Math.min(24,L.r*.06);}
 for(const R of RIVERS){const P=densify(R.pts,18);let S=0;P.forEach((p,i)=>{if(i)S+=Math.hypot(p.x-P[i-1].x,p.z-P[i-1].z);p.s=S;});
  if(typeof rvMeander==='function'){rvMeander(R,P,S);S=0;P.forEach((p,i)=>{if(i)S+=Math.hypot(p.x-P[i-1].x,p.z-P[i-1].z);p.s=S;});}
  let y=1e9;for(const p of P){let hp=worldPre(p.x,p.z,true);for(const L of LAKES)if(Math.hypot(p.x-L.x,p.z-L.z)<L.r*1.1)hp=Math.max(hp,L.lv+1.4);y=Math.min(y,hp-1.4);p.y=Math.max(-1.5,y);}
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],wa=lerp(R.w0,R.w1,a.s/S),wb=lerp(R.w0,R.w1,b.s/S);RVS.push({ax:a.x,az:a.z,bx:b.x,bz:b.z,ay:a.y,by:b.y,aw:wa,bw:wb,dp:1.6+.18*(wa+wb)});}R.P=P;R.S=S;}
 RVG=segGrid(RVS,200,200);
 for(const R of ROADS){const P=rdAvoidRivers(densify(R,10)),N=P.length;let S=0;P.forEach((p,i)=>{if(i)S+=Math.hypot(p.x-P[i-1].x,p.z-P[i-1].z);p.s=S;});
  let y=P.map(p=>worldPre(p.x,p.z));const g0=y.slice();
  // profilo più aderente al terreno (meno lisciatura, pendenza fino al 10% come le strade di montagna vere): trincee e rilevati molto meno profondi
  for(let k=0;k<3;k++){const y2=y.slice();for(let i=0;i<N;i++){let a=0,c=0;for(let j=Math.max(0,i-5);j<=Math.min(N-1,i+5);j++){a+=y[j];c++;}y2[i]=a/c;}y=y2;}
  y[0]=g0[0];const GR=.1;
  for(let i=1;i<N;i++){const ds=P[i].s-P[i-1].s;y[i]=clamp(y[i],y[i-1]-GR*ds,y[i-1]+GR*ds);}for(let i=N-2;i>=1;i--){const ds=P[i+1].s-P[i].s;y[i]=clamp(y[i],y[i+1]-GR*ds,y[i+1]+GR*ds);}
  // vincoli rigidi sopra l'acqua + rampe all'8% che salgono verso il ponte (invece di abbassarlo)
  let up=false;for(let i=0;i<N;i++){const m=rdMinY(P[i].x,P[i].z,g0[i]);if(y[i]<m){y[i]=m;up=true;RDX.raised++;}}
  if(up){for(let i=1;i<N;i++){const ds=P[i].s-P[i-1].s;y[i]=Math.max(y[i],y[i-1]-.08*ds);}for(let i=N-2;i>=0;i--){const ds=P[i+1].s-P[i].s;y[i]=Math.max(y[i],y[i+1]-.08*ds);}
   // le estremità restano attaccate al terreno (città, quartieri, aeroporto, incroci): la rampa sale all'8,5% e, se serve, il ponte vicino è più basso (mai meno di 2 m sopra l'acqua)
   for(const e of[0,1]){const i0=e?N-1:0,dir=e?-1:1;for(let k=0;k<N;k++){const i=i0+dir*k;if(i<0||i>=N)break;const cap=g0[i0]+.085*Math.abs(P[i].s-P[i0].s);if(y[i]<=cap)break;y[i]=Math.max(cap,rdMinY(P[i].x,P[i].z,g0[i],true));}}}
  P.forEach((p,i)=>{p.y=y[i];p.g=g0[i];});R.P=P;}
 // una strada che finirebbe dentro la montagna (trincea sempre più profonda fino al capolinea) si ferma prima, dove il terreno lo permette
 for(const R of ROADS){const P=R.P,N=P.length;if(N<12)continue;const cut=i=>P[i].g-P[i].y;if(cut(N-1)<22&&cut(N-2)<22)continue;let t0=N-1;while(t0>0&&cut(t0-1)>14)t0--;let j=t0;while(j>6&&cut(j)>6)j--;
  if(j>6&&j<N-1){R.P=P.slice(0,j+1);R.trunc=N-1-j;RDX.trunc=(RDX.trunc||0)+1;}}
 // incroci: la strada secondaria arriva alla stessa quota della principale (prima poteva finire 2-5 m più in alto o più in basso: scalino e parete verticale)
 for(const R of ROADS){const P=R.P,N=P.length;for(const e of[0,1]){const i0=e?N-1:0,dir=e?-1:1,p=P[i0];let best=null;
   for(const K of ROADS){if(K===R)continue;const q=rdYat(K,p.x,p.z);if(q[0]<8&&(!best||q[0]<best[0]))best=q;}if(!best)continue;const yK=best[1];p.y=yK;RDX.junc=(RDX.junc||0)+1;
   for(let k=1,ok=0;k<N;k++){const i=i0+dir*k;if(i<0||i>=N)break;const sd=Math.abs(P[i].s-p.s),lo=yK-.085*sd,hi=yK+.085*sd;if(P[i].y>=lo&&P[i].y<=hi){if(++ok>3)break;}else{ok=0;P[i].y=clamp(P[i].y,lo,hi);}}}}
 // gallerie: dove la trincea supererebbe i 22 m la strada passa dentro la montagna (niente pareti verticali alte decine di metri)
 for(const R of ROADS){const P=R.P,N=P.length;for(let i=0;i<N;i++)P[i].tun=false;let i=0;while(i<N){if(P[i].g-P[i].y>16){let j=i;while(j+1<N&&P[j+1].g-P[j+1].y>16)j++;let mx=0;for(let k=i;k<=j;k++)mx=Math.max(mx,P[k].g-P[k].y);
   if(mx>22&&j-i>=2&&i>1&&j<N-2){for(let k=i;k<=j;k++)P[k].tun=true;RDX.tun.push({R,i0:i,i1:j});}i=j+1;}else i++;}}
 for(const R of ROADS){const P=R.P,N=P.length;let d=1e9;for(let i=0;i<N;i++){if(P[i].tun)d=0;else if(i)d+=P[i].s-P[i-1].s;P[i].pd=d;}d=1e9;for(let i=N-1;i>=0;i--){if(P[i].tun)d=0;else if(i<N-1)d+=P[i+1].s-P[i].s;P[i].pd=Math.min(P[i].pd,d);}
  for(let i=0;i<N-1;i++){const a=P[i],b=P[i+1];RDS.push({ax:a.x,az:a.z,bx:b.x,bz:b.z,ay:a.y,by:b.y,aw:5,bw:5,dp:0,as:a.s,bs:b.s,ri:ROADS.indexOf(R),ia:i,ak:0,bk:0,full:false,first:i===0,last:i===N-2,guard:false,tun:a.tun&&b.tun,pw:Math.min(a.pd,b.pd)});}}
 RDG=segGrid(RDS,128,40);rdPrep();rvPrep();};
function rdYat(K,x,z){const P=K.P;let bd=1e9,by=0;if(!P)return [bd,by];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z,L2=dx*dx+dz*dz||1;let t=((x-a.x)*dx+(z-a.z)*dz)/L2;t=clamp(t,0,1);const d=Math.hypot(a.x+dx*t-x,a.z+dz*t-z);if(d<bd){bd=d;by=a.y+(b.y-a.y)*t;}}return [bd,by];}
// il riporto della scarpata non può riempire l'alveo di un fiume: oltre il ciglio della strada il terreno scende verso la sponda
function rdCap(x,z,ry,rd){if(!RVG)return 1e9;const q=riverQ(x,z);if(!q||q.d>q.w+34)return 1e9;const bank=q.d<q.w?q.y-.6-q.dp*(1-(q.d/q.w)*(q.d/q.w)):q.y-.6+(q.d-q.w)*.32;return Math.max(bank,ry-Math.max(0,rd-5.5)*1.1);}
worldH=function(x,z){RDSK=0;RDDK=0;const h=worldPre(x,z);if(!RDG)return h;const r=roadQ(x,z);if(!r||r.y-h>=4)return h;const g=RDS[r.i];if(g.tun)return h;{const wd=g.wd||14.5;if(g.full&&r.d<wd-.3&&!(g.first&&r.t<=0)&&!(g.last&&r.t>=1))RDSK=1-sst(Math.min(8.7,wd*.6),wd-.3,r.d);}
 const ry=r.y+(CRT.L.length?tmodQ(x,z):0);RDDK=rdDitch(r,h);const rd=r.d,bw=g.pw<60?5.5+28.5*clamp(g.pw/60,.37,1):34;let v=(rd<5.5?ry:lerp(ry,h,sst(5.5,bw,rd)))-RDDK;if(rd>=5.5&&v>h){const c=rdCap(x,z,ry,rd);if(v>c)v=Math.max(h,c);}return v;};
worldGround=function(x,z){const h=worldPre(x,z);if(!RDG)return h;const r=roadQ(x,z);if(!r)return h;if(r.y-h>=4)return r.d<5.6?r.y:h;const g=RDS[r.i];if(g.tun)return r.d<7.2?r.y:h;const ry=r.y+(CRT.L.length?tmodQ(x,z):0);if(r.d<4.25)return ry-rdPot(x,z,r);
 const rd=r.d,bw=g.pw<60?5.5+28.5*clamp(g.pw/60,.37,1):34;let v=(rd<5.5?ry:lerp(ry,h,sst(5.5,bw,rd)))-rdDitch(r,h);if(rd>=5.5&&v>h){const c=rdCap(x,z,ry,rd);if(v>c)v=Math.max(h,c);}return v;};
// ---------- gallerie: volta in calcestruzzo annerita in basso, marciapiedi di servizio, luci in chiave di volta, portali con muri di sostegno ----------
function rdTunnels(){if(!RDX.tun.length)return;const V=[],C=[],I=[],LV=[],LI=[],W=[],WC=[],WI=[];
 const prof=[[-4.45,0],[-5.1,0],[-5.1,.25],[-5.95,.25],[-5.95,4]];for(let k=1;k<=12;k++){const t=Math.PI-k/12*Math.PI;prof.push([5.95*Math.cos(t),4+3.1*Math.sin(t)]);}prof.push([5.95,.25],[5.1,.25],[5.1,0],[4.45,0]);
 const NP=prof.length;
 for(const T of RDX.tun){const P=T.R.P,rows=[];for(let i=T.i0;i<=T.i1;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;rows.push({x:P[i].x,z:P[i].z,y:P[i].y,tx:(b.x-a.x)/l,tz:(b.z-a.z)/l});}
  // si allunga di 3 m oltre i portali per infilarsi nel muro di testa
  const f=rows[0],l=rows[rows.length-1];rows.unshift({x:f.x-f.tx*3,z:f.z-f.tz*3,y:f.y-.1*3*Math.sign(P[T.i0+1].y-P[T.i0].y),tx:f.tx,tz:f.tz});rows.push({x:l.x+l.tx*3,z:l.z+l.tz*3,y:l.y,tx:l.tx,tz:l.tz});
  const base=V.length/3;rows.forEach((r,ri)=>{const nx=-r.tz,nz=r.tx;for(const q of prof){V.push(r.x+nx*q[0],r.y+q[1],r.z+nz*q[0]);const soot=q[1]<.3?.09:q[1]<3?.11+.02*Math.sin(ri*1.7+q[0]):.19+.02*Math.sin(ri*.9+q[0]*.3);C.push(soot,soot*.98,soot*.95);}});
  for(let r=0;r<rows.length-1;r++)for(let k=0;k<NP-1;k++){const a=base+r*NP+k,b=a+NP;I.push(a,b,a+1,a+1,b,b+1);}
  // luci: due file di plafoniere vicino alla chiave di volta
  rows.forEach((r,ri)=>{if(ri===0||ri===rows.length-1)return;const nx=-r.tz,nz=r.tx;for(const u of[-2.3,2.3]){const b0=LV.length/3,cx=r.x+nx*u,cz=r.z+nz*u,cy=r.y+6.72,hl=1.1;for(const [ax,az] of[[-hl,-.12],[hl,-.12],[hl,.12],[-hl,.12]]){LV.push(cx+r.tx*ax+nx*az,cy,cz+r.tz*ax+nz*az);}LI.push(b0,b0+1,b0+2,b0,b0+2,b0+3);}});
  // portali e muri di sostegno ai lati della trincea d'accesso
  for(const e of[0,1]){const r=e?rows[rows.length-1]:rows[0],dir=e?1:-1,i=e?T.i1:T.i0,cut=Math.max(8,Math.min(26,(P[i].g-P[i].y)+2.5));T['p'+e]={x:r.x,z:r.z,y:r.y,tx:r.tx*dir,tz:r.tz*dir,h:cut};
   const nx=-r.tz,nz=r.tx;const fr=[];for(let k=0;k<=5;k++){const j=i+dir*(k+1);if(j<0||j>=P.length)break;fr.push(P[j]);}
   for(const sd of[-1,1]){const wb=W.length/3;fr.forEach((q,k)=>{const a=P[Math.max(0,P.indexOf(q)-1)],b=P[Math.min(P.length-1,P.indexOf(q)+1)],ll=Math.hypot(b.x-a.x,b.z-a.z)||1,mx=-(b.z-a.z)/ll,mz=(b.x-a.x)/ll,x=q.x+mx*7.4*sd,z=q.z+mz*7.4*sd,top=Math.max(q.y+.6,worldH(q.x+mx*8.6*sd,q.z+mz*8.6*sd)+.3);
     W.push(x,q.y-.4,z,x,top,z);WC.push(.5,.49,.47,.56,.55,.52);});for(let k=0;k<fr.length-1;k++){const a=wb+k*2;WI.push(a,a+2,a+1,a+1,a+2,a+3,a,a+1,a+2,a+1,a+3,a+2);}}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(V,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();
 // le normali devono guardare verso l'asse della galleria (dentro): controllo sul primo anello
 {const N=g.attributes.normal,i=3;if(N.getX(i)<0){I.reverse();g.setIndex(I);g.computeVertexNormals();}}
 const tm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0,envMapIntensity:.04}),tube=new THREE.Mesh(g,tm);tube.castShadow=true;tube.receiveShadow=true;scene.add(tube);
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(LV,3));lg.setIndex(LI);const lm=new THREE.Mesh(lg,new THREE.MeshBasicMaterial({color:new THREE.Color(3.4,3.1,2.6),side:THREE.DoubleSide}));scene.add(lm);
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(W,3));wg.setAttribute('color',new THREE.Float32BufferAttribute(WC,3));wg.setIndex(WI);wg.computeVertexNormals();const wm=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,side:THREE.DoubleSide}));wm.castShadow=wm.receiveShadow=true;scene.add(wm);RDX.wm=wm;
 // muro di testa con la bocca ad arco, cornicione e due lampade
 const conc=MS(0x8d8a84,.9,0),dark=MS(0x3a3836,.9,0);for(const T of RDX.tun)for(const e of[0,1]){const q=T['p'+e];if(!q)continue;const sh=new THREE.Shape(),H=q.h;sh.moveTo(-12,-.6);sh.lineTo(12,-.6);sh.lineTo(12,H);sh.lineTo(-12,H);sh.lineTo(-12,-.6);
   const hole=new THREE.Path();hole.moveTo(-6.2,-.6);hole.lineTo(6.2,-.6);hole.lineTo(6.2,4);for(let k=1;k<=16;k++){const t=k/16*Math.PI;hole.lineTo(6.2*Math.cos(t),4+3.35*Math.sin(t));}hole.lineTo(-6.2,-.6);sh.holes.push(hole);
   const hg=new THREE.ExtrudeGeometry(sh,{depth:1.1,bevelEnabled:false});const m=new THREE.Mesh(hg,conc),ry=Math.atan2(q.tx,q.tz);m.position.set(q.x,q.y,q.z);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;scene.add(m);
   const cn=new THREE.Mesh(new THREE.BoxGeometry(25,.55,1.7),dark);cn.position.set(q.x+q.tx*.3,q.y+H+.27,q.z+q.tz*.3);cn.rotation.y=ry;cn.castShadow=true;scene.add(cn);
   for(const u of[-4.5,4.5]){const nx=q.tz,nz=-q.tx;lpAdd(q.x+nx*u+q.tx*1.3,q.y+8.2,q.z+nz*u+q.tz*1.3,[3,2.75,2.3],.5,5,0);}}
 RDX.tube=tube;}
{const br0=buildRoads;buildRoads=function(){br0();try{rdTunnels();}catch(e){console.warn('gallerie',e);}};}
// il terreno sotto il corridoio stradale scende con gradualità (prima: gradino di 1,6 m a 8,7 m dall'asse, visibile come solco scuro sulle scarpate)
terH=function(x,z){if(isCore(x,z))return groundBase0(x,z)-2.5;const h=worldH(x,z)-zoneSink(x,z);return h-RDSK*1.6;};
