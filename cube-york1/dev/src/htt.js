/* ---------- grattacieli high-tech a celle polari: piante curve, torte, ellittiche, inclinate; distruttibili cella per cella ---------- */
// ogni piano (4 m) è diviso in S spicchi attorno a un nucleo; la facciata è una superficie continua (niente gradini)
const HT={L:[],mat:null,dmat:null,dirty:new Set(),chunks:[],acc:[],q:{},q2:{},qn:{},budget:0};
const HTS={glass:0,diag:1,white:2,fins:3,dome:4,conc:5,cab:6,ring:7};
const HT_DEB=[8,9,9,8,8,3,8,8];
function hRad(q,th){const c=Math.abs(Math.cos(th)),s=Math.abs(Math.sin(th));let r=q.n===2?1/Math.sqrt(c*c/(q.a*q.a)+s*s/(q.b*q.b)):Math.pow(Math.pow(c/q.a,q.n)+Math.pow(s/q.b,q.n),-1/q.n);
 if(q.k3)r*=1+q.k3*Math.cos(3*th+(q.p3||0));if(q.k4)r*=1+q.k4*Math.cos(4*th+(q.p4||0));return r;}
// forma standard: superellisse che si rastrema, ruota, si sposta; tutto in funzione della quota
function htShape(o){return (y,f,q)=>{const t=clamp(y/o.H,0,1);q.a=lerp(o.a0,o.a1===undefined?o.a0:o.a1,o.ease?o.ease(t):t);q.b=lerp(o.b0,o.b1===undefined?o.b0:o.b1,o.ease?o.ease(t):t);q.n=o.n||2;q.k3=o.k3||0;q.p3=o.p3||0;q.k4=o.k4?o.k4*(o.k4f?o.k4f(t,y):1):0;q.p4=o.p4?o.p4(t,y):0;
 q.rot=(o.rot0||0)+(o.twist||0)*(o.tw?o.tw(t):t);q.ox=o.lx?o.lx(t,y):0;q.oz=o.lz?o.lz(t,y):0;q.ri=o.core?o.core*Math.min(q.a,q.b):(o.ri?o.ri(t,y,q):0);if(o.set)o.set(t,y,f,q);return q;};}
function htNew(o){const T=Object.assign({S:20,J:3,K:6,core:.3,hollow:false,st:0,hp0:200,seed:Math.random(),acc:[],lights:[],dead:false,cells:0},o);T.nF=Math.round(T.H/4);T.H=T.nF*4;T.ds=HT_DEB[T.st];
 if(!T.sh)T.sh=htShape(Object.assign({H:T.H},o));HT.L.push(T);T.id=HT.L.length-1;
 let rb=0;for(let f=0;f<=T.nF;f++){const y=Math.min(f*4,T.H-.01),q=T.sh(y,Math.min(f,T.nF-1),_hq);for(let k=0;k<32;k++){const r=hRad(q,k/32*TAU)+Math.hypot(q.ox,q.oz);if(r>rb)rb=r;}}T.rb=rb+1;return T;}
const _hq={},_hq2={};
function htPt(T,y,f,th,o){const q=T.sh(y,f,_hq),r=hRad(q,th),a=th+q.rot;o[0]=T.x+q.ox+r*Math.cos(a);o[1]=y;o[2]=T.z+q.oz+r*Math.sin(a);return r;}
function htPtR(T,y,f,th,r,o){const q=T.sh(y,f,_hq),a=th+q.rot;o[0]=T.x+q.ox+r*Math.cos(a);o[1]=y;o[2]=T.z+q.oz+r*Math.sin(a);}
// lunghezza del perimetro: le finestre (moduli da 1,5 m) chiudono sempre il giro senza cuciture
function htPer(T,y,f){const n=T.S*T.J*2,o=[0,0,0],p=[0,0,0],cum=new Float32Array(n+1);htPt(T,y,f,0,p);for(let k=1;k<=n;k++){htPt(T,y,f,k/n*TAU,o);cum[k]=cum[k-1]+Math.hypot(o[0]-p[0],o[2]-p[2]);p[0]=o[0];p[2]=o[2];}
 const L=cum[n],K=Math.max(1,Math.round(L/1.5));for(let k=0;k<=n;k++)cum[k]=cum[k]/L*K*1.5;return cum;}
function htGeo(){return {P:[],N:[],UV:[],I:[],ON:[],X:[],n:0};}
function htV(G,p,nx,ny,nz,u,v,st,sd,fl,ft){G.P.push(p[0],p[1],p[2]);G.N.push(nx,ny,nz);G.UV.push(u,v);G.I.push(st,sd,fl,ft);G.ON.push(1);return G.n++;}
function htTri(G,a,b,c,ox,oy,oz){const P=G.P,ax=P[a*3],ay=P[a*3+1],az=P[a*3+2],ux=P[b*3]-ax,uy=P[b*3+1]-ay,uz=P[b*3+2]-az,vx=P[c*3]-ax,vy=P[c*3+1]-ay,vz=P[c*3+2]-az,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
 if(nx*ox+ny*oy+nz*oz<0)G.X.push(a,c,b);else G.X.push(a,b,c);}
function htFin(G,hasOn){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.N,3));g.setAttribute('aUV',new THREE.Float32BufferAttribute(G.UV,2));
 g.setAttribute('aI',new THREE.Float32BufferAttribute(G.I,4));const on=new THREE.Float32BufferAttribute(G.ON,1);if(hasOn)on.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aOn',on);g.setIndex(G.n>65535?new THREE.Uint32BufferAttribute(G.X,1):new THREE.Uint16BufferAttribute(G.X,1));g.computeBoundingSphere();return g;}
// centro di una cella (per detriti, esplosioni, carichi)
function htCellC(T,c,o){const S=T.S;if(c>=T.nF*S){const f=c-T.nF*S,q=T.sh(f*4+2,f,_hq2);o[0]=T.x+q.ox;o[1]=f*4+2;o[2]=T.z+q.oz;o[3]=q.ri*2;o[4]=0;o[5]=q.ri*2;return o;}
 const f=Math.floor(c/S),s=c%S,th=(s+.5)/S*TAU,q=T.sh(f*4+2,f,_hq2),R=hRad(q,th),ri=T.hollow?q.ri:q.ri,rm=(R+ri)/2,a=th+q.rot;o[0]=T.x+q.ox+rm*Math.cos(a);o[1]=f*4+2;o[2]=T.z+q.oz+rm*Math.sin(a);o[3]=Math.max(1.5,rm*TAU/S);o[4]=a;o[5]=Math.max(1.5,R-ri);return o;}
/* ---------- costruzione della geometria statica: facciate esterne/interne, tetti e terrazze ---------- */
function htBuild(T){const S=T.S,J=T.J,nF=T.nF,G=htGeo(),core=T.core>0&&!T.hollow,N=nF*S+(core?nF:0);T.N=N;T.coreOn=core;
 T.alive=new Uint8Array(N).fill(1);T.hp=new Float32Array(N);T.rng=[];for(let c=0;c<N;c++){T.rng.push([]);T.hp[c]=c>=nF*S?T.hp0*4:T.hp0*(Math.floor(c/S)===0?1.6:1);}
 const p=[0,0,0],pa=[0,0,0],pb=[0,0,0],py=[0,0,0],st=T.st,sd=T.seed,e=.002;
 for(let f=0;f<nF;f++){const y0=f*4,y1=y0+4,c0=htPer(T,y0+.001,f),c1=htPer(T,y1-.001,f);
  for(let s=0;s<S;s++){const c=f*S+s,start=G.n;
   for(let j=0;j<=J;j++){const k=s*J+j,th=k/(S*J)*TAU;
    for(const [y,cum] of [[y0,c0],[y1,c1]]){const yy=Math.min(Math.max(y,y0+.001),y1-.001);htPt(T,yy,f,th,p);htPt(T,yy,f,th+e,pa);htPt(T,yy,f,th-e,pb);htPt(T,Math.min(yy+.05,y1-.0005),f,th,py);const yb=[0,0,0];htPt(T,Math.max(yy-.05,y0+.0005),f,th,yb);
     const tx=pa[0]-pb[0],tz=pa[2]-pb[2],vx=py[0]-yb[0],vy=py[1]-yb[1],vz=py[2]-yb[2];let nx=vy*tz-0*vz,ny=vz*tx-vx*tz,nz=vx*0-vy*tx;const q=T.sh(yy,f,_hq),cx=T.x+q.ox,cz=T.z+q.oz;if(nx*(p[0]-cx)+nz*(p[2]-cz)<0){nx=-nx;ny=-ny;nz=-nz;}const l=Math.hypot(nx,ny,nz)||1;
     p[1]=y;htV(G,p,nx/l,ny/l,nz/l,cum[k*2],y,T.stF?T.stF(f):st,sd,f,0);}}
   for(let j=0;j<J;j++){const b0=start+j*2,t0=b0+1,b1=b0+2,t1=b0+3,mx=(G.P[b0*3]+G.P[t1*3])/2-(T.x+T.sh(y0+2,f,_hq).ox),mz=(G.P[b0*3+2]+G.P[t1*3+2])/2-(T.z+_hq.oz);htTri(G,b0,b1,t0,mx,0,mz);htTri(G,b1,t1,t0,mx,0,mz);}
   T.rng[c].push(start,G.n-start);}}
 // facciata interna (anello, cupola cava)
 if(T.hollow)for(let f=0;f<nF;f++){const y0=f*4,y1=y0+4;for(let s=0;s<S;s++){const c=f*S+s,start=G.n;
  for(let j=0;j<=J;j++){const th=(s*J+j)/(S*J)*TAU;for(const y of [y0,y1]){const yy=Math.min(Math.max(y,y0+.001),y1-.001),q=T.sh(yy,f,_hq),a=th+q.rot;htPtR(T,yy,f,th,q.ri,p);p[1]=y;htV(G,p,-Math.cos(a),0,-Math.sin(a),q.ri*th,y,st,sd,f,5);}}
  for(let j=0;j<J;j++){const b0=start+j*2,q=T.sh(y0+2,f,_hq),a=(s+.5)/S*TAU+q.rot;htTri(G,b0,b0+2,b0+1,-Math.cos(a),0,-Math.sin(a));htTri(G,b0+2,b0+3,b0+1,-Math.cos(a),0,-Math.sin(a));}
  T.rng[c].push(start,G.n-start);}}
 // tetti e terrazze: dove il piano sopra è più stretto o non esiste
 for(let f=0;f<nF;f++){const y=f*4+4;for(let s=0;s<S;s++){const c=f*S+s,start=G.n;let any=false;
  for(let j=0;j<J;j++){const t0=(s*J+j)/(S*J)*TAU,t1=(s*J+j+1)/(S*J)*TAU;const q=T.sh(y-.001,f,_hq),r0=hRad(q,t0),r1=hRad(q,t1);let i0,i1;
   if(f===nF-1){i0=i1=T.hollow||core?q.ri:0;}else{const q2=T.sh(y+.001,f+1,_hq2);i0=hRad(q2,t0);i1=hRad(q2,t1);const dx=q2.ox-q.ox,dz=q2.oz-q.oz,dr=q2.rot-q.rot;if(Math.abs(dr)>.002||Math.hypot(dx,dz)>.05||r0-i0<.4&&r1-i1<.4)continue;}
   if(r0-i0<.05&&r1-i1<.05)continue;any=true;
   const A=[0,0,0],B=[0,0,0],C=[0,0,0],D=[0,0,0];htPtR(T,y-.001,f,t0,r0,A);htPtR(T,y-.001,f,t1,r1,B);htPtR(T,y-.001,f,t1,i1,C);htPtR(T,y-.001,f,t0,i0,D);for(const P of [A,B,C,D])P[1]=y;
   const sf=T.stF?T.stF(f):st,a=htV(G,A,0,1,0,A[0],A[2],sf,sd,f,4),b=htV(G,B,0,1,0,B[0],B[2],sf,sd,f,4),cc=htV(G,C,0,1,0,C[0],C[2],sf,sd,f,4),d=htV(G,D,0,1,0,D[0],D[2],sf,sd,f,4);htTri(G,a,b,cc,0,1,0);htTri(G,a,cc,d,0,1,0);}
  if(any)T.rng[c].push(start,G.n-start);}}
 if(core){const f=nF-1,y=nF*4,c=nF*S+f,start=G.n,q=T.sh(y-.001,f,_hq),n=24,ctr=[T.x+q.ox,y,T.z+q.oz],ci=htV(G,ctr,0,1,0,ctr[0],ctr[2],st,sd,f,4);
  for(let k=0;k<n;k++){const t0=k/n*TAU,t1=(k+1)/n*TAU,A=[0,0,0],B=[0,0,0];htPtR(T,y-.001,f,t0,q.ri,A);htPtR(T,y-.001,f,t1,q.ri,B);A[1]=B[1]=y;const a=htV(G,A,0,1,0,A[0],A[2],st,sd,f,4),b=htV(G,B,0,1,0,B[0],B[2],st,sd,f,4);htTri(G,ci,a,b,0,1,0);}T.rng[c].push(start,G.n-start);}
 T.geo=htFin(G,true);T.mesh=new THREE.Mesh(T.geo,HT.mat);T.mesh.customDepthMaterial=HT.dmat;T.mesh.castShadow=true;T.mesh.receiveShadow=true;T.mesh.userData.ht=T;scene.add(T.mesh);
 T.on=T.geo.attributes.aOn;T.lo=1e9;T.hi=-1;T.dmesh=null;
 T.cells=N;T.cnt=N;htGridAdd(T);htBase(T);}
const HTG=new Map();const htK=(gx,gz)=>gx*100003+gz;
function htGridAdd(T){for(let gx=Math.floor((T.x-T.rb)/64);gx<=Math.floor((T.x+T.rb)/64);gx++)for(let gz=Math.floor((T.z-T.rb)/64);gz<=Math.floor((T.z+T.rb)/64);gz++){const k=htK(gx,gz);let a=HTG.get(k);if(!a)HTG.set(k,a=[]);a.push(T);}}
function htNearXZ(x,z){return HTG.get(htK(Math.floor(x/64),Math.floor(z/64)))||null;}
/* ---------- interrogazioni fisiche ---------- */
const HQ={T:null,c:-1,nx:0,ny:1,nz:0,d:0};
// restituisce la cella che contiene il punto (o -1)
function htCellAt(T,x,y,z){if(y<0||y>=T.H)return -1;const f=Math.floor(y/4),q=T.sh(y,f,_hq),dx=x-T.x-q.ox,dz=z-T.z-q.oz,r=Math.hypot(dx,dz);if(r>T.rb)return -1;
 let th=Math.atan2(dz,dx)-q.rot;th=((th%TAU)+TAU)%TAU;const R=hRad(q,th);if(r>R)return -1;
 if(r<q.ri){if(T.hollow||!T.coreOn)return -1;const c=T.nF*T.S+f;return T.alive[c]?c:-1;}
 const s=Math.floor(th/TAU*T.S)%T.S,c=f*T.S+s;return T.alive[c]?c:-1;}
function htContact(x,y,z,o){const a=htNearXZ(x,z);if(!a)return false;
 for(const T of a){if(T.dead||y<0||y>=T.H)continue;const c=htCellAt(T,x,y,z);if(c<0)continue;const S=T.S,f=Math.floor(y/4),q=T.sh(y,f,_hq),dx=x-T.x-q.ox,dz=z-T.z-q.oz,r=Math.hypot(dx,dz)||1e-4;
  let th=Math.atan2(dz,dx)-q.rot;th=((th%TAU)+TAU)%TAU;const A=T.alive;let best=1e9,nx=0,ny=1,nz=0;
  if(c<T.nF*S){const s=c%S,R=hRad(q,th),R2=hRad(q,th+.01),a=th+q.rot;
   // superficie esterna (normale dalla pendenza della pianta)
   {const d=R-r;if(d<best){best=d;const gx=Math.cos(a),gz=Math.sin(a),tx=-gz,tz=gx,dr=(R2-R)/.01/R;nx=gx-tx*dr;nz=gz-tz*dr;ny=0;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;}}
   if(f===T.nF-1||!A[c+S]){const d=f*4+4-y;if(d<best){best=d;nx=0;ny=1;nz=0;}}
   if(f>0&&!A[c-S]){const d=y-f*4;if(d<best){best=d;nx=0;ny=-1;nz=0;}}
   const sl=f*S+(s+S-1)%S,sr=f*S+(s+1)%S,t0=s/S*TAU,t1=(s+1)/S*TAU;
   if(!A[sl]){const d=r*Math.sin(th-t0);if(d<best){best=d;const aa=t0+q.rot;nx=Math.sin(aa);nz=-Math.cos(aa);ny=0;}}
   if(!A[sr]){const d=r*Math.sin(t1-th);if(d<best){best=d;const aa=t1+q.rot;nx=-Math.sin(aa);nz=Math.cos(aa);ny=0;}}
   if(T.hollow||(T.coreOn&&!A[T.nF*S+f])){const d=r-q.ri;if(d<best){best=d;nx=-dx/r;nz=-dz/r;ny=0;}}}
  else{const d=q.ri-r;best=d;nx=dx/r;nz=dz/r;ny=0;if(f===T.nF-1||!A[c+1]){const d2=f*4+4-y;if(d2<best){best=d2;nx=0;ny=1;nz=0;}}}
  o.nx=nx;o.ny=ny;o.nz=nz;o.d=Math.max(0,best);o.b=null;o.ci=-1;HQ.T=T;HQ.c=c;return true;}return false;}
function htInside(x,y,z){const a=htNearXZ(x,z);if(!a)return null;for(const T of a){if(T.dead)continue;const c=htCellAt(T,x,y,z);if(c>=0){HQ.T=T;HQ.c=c;return T;}}return null;}
// raggio contro i grattacieli: marcia lungo il raggio dentro il cilindro di ingombro, poi bisezione
function htRay(ox,oy,oz,dx,dy,dz,maxT){let best=maxT,bt=null,bc=-1;
 for(const T of HT.L){if(T.dead)continue;const ex=ox-T.x,ez=oz-T.z,A=dx*dx+dz*dz;let t0=0,t1=maxT;
  if(A>1e-9){const B=2*(ex*dx+ez*dz),C=ex*ex+ez*ez-T.rb*T.rb,D=B*B-4*A*C;if(D<0)continue;const sq=Math.sqrt(D);t0=Math.max(t0,(-B-sq)/(2*A));t1=Math.min(t1,(-B+sq)/(2*A));}else if(ex*ex+ez*ez>T.rb*T.rb)continue;
  if(Math.abs(dy)>1e-9){const ta=(0-oy)/dy,tb=(T.H-oy)/dy;t0=Math.max(t0,Math.min(ta,tb));t1=Math.min(t1,Math.max(ta,tb));}else if(oy<0||oy>T.H)continue;
  if(t0>t1||t0>=best)continue;t1=Math.min(t1,best);let t=t0,prev=t0,hit=-1;
  while(t<=t1){const x=ox+dx*t,y=oy+dy*t,z=oz+dz*t,c=htCellAt(T,x,y,z);if(c>=0){hit=c;break;}
   let st=.8;if(y>=0&&y<T.H){const f=Math.floor(y/4),q=T.sh(y,f,_hq),r=Math.hypot(x-T.x-q.ox,z-T.z-q.oz);st=Math.max(.6,(r-Math.max(q.a,q.b)*1.15)*.8);}prev=t;t+=st;}
  if(hit<0)continue;let a=prev,b=t;for(let k=0;k<10;k++){const m=(a+b)/2;if(htCellAt(T,ox+dx*m,oy+dy*m,oz+dz*m)>=0)b=m;else a=m;}
  if(b<best){best=b;bt=T;bc=htCellAt(T,ox+dx*b,oy+dy*b,oz+dz*b);}}
 HQ.T=bt;HQ.c=bc;HQ.t=best;return bt;}
/* ---------- distruzione ---------- */
function htHide(T,c){const R=T.rng[c],A=T.on.array;for(let i=0;i<R.length;i+=2){const s=R[i],n=R[i+1];A.fill(0,s,s+n);if(s<T.lo)T.lo=s;if(s+n>T.hi)T.hi=s+n;}}
function htFlush(T){if(T.hi<0)return;const a=T.on;a.updateRange.offset=T.lo;a.updateRange.count=T.hi-T.lo;a.needsUpdate=true;T.lo=1e9;T.hi=-1;}
const _hc=[0,0,0,0,0,0];
function htRemove(T,c,mode,vx,vy,vz,heat){if(!T.alive[c])return false;T.alive[c]=0;T.cnt--;htHide(T,c);htAccCheck(T,c);
 const o=htCellC(T,c,_hc),cx=o[0],cy=o[1],cz=o[2];
 if(mode>=1){const b=spawnDebris(cx,cy,cz,Math.min(o[3],9),4,Math.min(o[5],9),T.ds,T.seed,63,vx,vy,vz,heat||0);if(b){setYaw(b,Math.PI/2-o[4]);}else dustPuff(cx,cy,cz,7);
  if(mode>=2&&debN<QP.debris*.85)for(let k=0;k<2;k++){const s2=rand(1,2.4);spawnDebris(cx+rand(-2,2),cy+rand(-1,1),cz+rand(-2,2),s2,s2*.6,s2,T.ds,T.seed+k,63,vx*1.2+rand(-2,2),vy+rand(0,2),vz*1.2+rand(-2,2),heat||0);}}
 else{dustPuff(cx,cy,cz,7);}
 gravel(cx,cy,cz,mode===0?10:6,3,T.ds);if(c<T.nF*T.S&&(T.ds===8||T.ds===9)){const a=o[4];for(let k=0;k<4;k++){const u=rand(-1.5,1.5);shardSpawn(cx+Math.cos(a)*o[5]*.5-Math.sin(a)*u,cy+rand(-1.6,1.6),cz+Math.sin(a)*o[5]*.5+Math.cos(a)*u,Math.cos(a)*rand(2,7),rand(-1,3),Math.sin(a)*rand(2,7),rand(.06,.22));}if(glassSndT<=0){sndGlass(cx,cy,cz);glassSndT=.08;}}
 HT.dirty.add(T);T.dm=true;stats.cells++;return true;}
function htDamageSphere(x,y,z,R,P){
 const list=[];for(const T of HT.L){if(T.dead)continue;if(Math.hypot(x-T.x,z-T.z)>T.rb+R+2||y-R>T.H||y+R<0)continue;const f0=Math.max(0,Math.floor((y-R-2)/4)),f1=Math.min(T.nF-1,Math.floor((y+R+2)/4));
  for(let f=f0;f<=f1;f++){for(let s=0;s<T.S;s++){const c=f*T.S+s;if(!T.alive[c])continue;const o=htCellC(T,c,_hc),d=Math.max(0,Math.hypot(o[0]-x,o[1]-y,o[2]-z)-Math.min(o[3],o[5])*.35);if(d>R+2)continue;
    T.hp[c]-=P*420*Math.pow(Math.max(0,1-d/(R+2)),1.2)*(R/7+.5);if(T.hp[c]<=0)list.push([T,c,o[0],o[1],o[2],d]);}
   if(T.coreOn){const c=T.nF*T.S+f;if(T.alive[c]){const o=htCellC(T,c,_hc),d=Math.hypot(o[0]-x,o[1]-y,o[2]-z);if(d<R+2){T.hp[c]-=P*420*Math.pow(Math.max(0,1-d/(R+2)),1.2)*(R/7+.5);if(T.hp[c]<=0)list.push([T,c,o[0],o[1],o[2],d]);}}}}}
 if(!list.length)return;list.sort((p,q)=>q[5]-p[5]);let B=Math.min(500,Math.max(0,QP.debris-debN+80));
 for(const e of list){const d=e[5],dl=d+.01,sp=(1-d/(R+2))*22*Math.sqrt(P)+3;let mode=0;if(B>=6&&d<R*.6){mode=2;B-=6;}else if(B>=1){mode=1;B-=1;}
  if(Math.random()<.18&&fireSeeds.length<60)fireSeeds.push([e[2],e[3]-1.5,e[4]]);htRemove(e[0],e[1],mode,(e[2]-x)/dl*sp,(e[3]-y)/dl*sp+sp*.3,(e[4]-z)/dl*sp,U.uTime.value);}
 wakeArea(x,y,z,R+10);}
/* ---------- stabilità: celle staccate, piani schiacciati, crolli a pancake e ribaltamenti ---------- */
function htStruct(T){if(T.dead||T.collapsing)return;const S=T.S,nF=T.nF,N=T.N,A=T.alive,K=T.K,RS=nF*S;
 const D=new Int16Array(N).fill(32000),QL=N*4+8,Q=new Int32Array(QL);let h=0,t=0;
 const p0=c=>{h=(h-1+QL)%QL;Q[h]=c;},p1=c=>{Q[t]=c;t=(t+1)%QL;};
 for(let s=0;s<S;s++)if(A[s]){D[s]=0;p1(s);}if(T.coreOn&&A[RS]){D[RS]=0;p1(RS);}
 while(h!==t){const c=Q[h];h=(h+1)%QL;const d=D[c];if(d>K)continue;const d1=d+1;
  if(c<RS){const f=Math.floor(c/S),s=c%S;if(f+1<nF){const u=c+S;if(A[u]&&D[u]>d){D[u]=d;p0(u);}}if(f>0){const w=c-S;if(A[w]&&D[w]>d1){D[w]=d1;p1(w);}}
   const l=f*S+(s+S-1)%S,r=f*S+(s+1)%S;if(A[l]&&D[l]>d1){D[l]=d1;p1(l);}if(A[r]&&D[r]>d1){D[r]=d1;p1(r);}if(T.coreOn){const k=RS+f;if(A[k]&&D[k]>d1){D[k]=d1;p1(k);}}}
  else{const f=c-RS;if(f+1<nF){const u=c+1;if(A[u]&&D[u]>d){D[u]=d;p0(u);}}if(f>0){const w=c-1;if(A[w]&&D[w]>d1){D[w]=d1;p1(w);}}for(let s=0;s<S;s++){const k=f*S+s;if(A[k]&&D[k]>d1){D[k]=d1;p1(k);}}}}
 const loose=[];for(let c=0;c<N;c++)if(A[c]&&D[c]>K)loose.push(c);
 if(loose.length){// se la parte staccata è grande cade tutta insieme come un blocco unico
  const fl=new Set();for(const c of loose)fl.add(c<RS?Math.floor(c/S):c-RS);let fmin=1e9;for(const f of fl)fmin=Math.min(fmin,f);
  if(loose.length>S*3&&fmin>0){htCollapse(T,fmin,'pancake');return;}
  for(const c of loose){const o=htCellC(T,c,_hc);htRemove(T,c,debN<QP.debris*.8?1:0,rand(-.4,.4),0,rand(-.4,.4),0);}sndCollapse(T.x,_hc[1],T.z,loose.length*3);return;}
 // carichi: dall'alto verso il basso (l'eccentricità di progetto, es. torre inclinata, non conta)
 const L=htLoads(T);let above=0,ax=0,az=0,worst=null;
 for(let f=nF-1;f>=0;f--){const w=L.w[f];
  if(above>0){const q=T.sh(f*4+2,f,_hq),Rf=Math.max(4,Math.min(q.a,q.b)),rr=w>0?above/(w*nF*1.8):99;let ex=0,ez=0;if(w>0){ex=ax/above-L.sx[f]/w-T.e0x[f];ez=az/above-L.sz[f]/w-T.e0z[f];}
   const e=Math.hypot(ex,ez)/Rf,sev=Math.max(rr,e*1.6);if(!worst||sev>worst.sev)worst={f,rr,e,sev,dx:ex,dz:ez};}
  above+=w;ax+=L.sx[f];az+=L.sz[f];}
 if(!worst)return;
 if(worst.rr>1){htCollapse(T,worst.f+1,'pancake',worst);return;}
 if(worst.e>.42&&worst.rr>.35){htCollapse(T,worst.f+1,'topple',worst);return;}}
function htLoads(T){const S=T.S,nF=T.nF,RS=nF*S,A=T.alive,cw=4,cc=[0,0,0,0,0,0],w=new Float32Array(nF),sx=new Float32Array(nF),sz=new Float32Array(nF);
 for(let f=0;f<nF;f++){for(let s=0;s<S;s++){const c=f*S+s;if(!A[c])continue;htCellC(T,c,cc);w[f]++;sx[f]+=cc[0];sz[f]+=cc[2];}
  if(T.coreOn&&A[RS+f]){const q=T.sh(f*4+2,f,_hq);w[f]+=cw;sx[f]+=(T.x+q.ox)*cw;sz[f]+=(T.z+q.oz)*cw;}}return {w,sx,sz};}
function htBase(T){const L=htLoads(T),nF=T.nF;T.e0x=new Float32Array(nF);T.e0z=new Float32Array(nF);let above=0,ax=0,az=0;
 for(let f=nF-1;f>=0;f--){const w=L.w[f];if(above>0&&w>0){T.e0x[f]=ax/above-L.sx[f]/w;T.e0z[f]=az/above-L.sz[f]/w;}above+=w;ax+=L.sx[f];az+=L.sz[f];}}
// il blocco sopra il piano f0 diventa un pezzo unico che cade (a pancake) o si ribalta
function htCollapse(T,f0,mode,W){const S=T.S,nF=T.nF,RS=nF*S;if(f0>=nF)return;if(f0<1)f0=1;
 const cells=[];for(let f=f0;f<nF;f++){for(let s=0;s<S;s++){const c=f*S+s;if(T.alive[c])cells.push(c);}if(T.coreOn&&T.alive[RS+f])cells.push(RS+f);}
 if(!cells.length)return;const q=T.sh(f0*4,f0,_hq),piv=new THREE.Vector3(T.x+q.ox,f0*4,T.z+q.oz);
 let dx=0,dz=0;if(mode==='topple'&&W){const l=Math.hypot(W.dx,W.dz)||1;dx=W.dx/l;dz=W.dz/l;const R0=Math.max(q.a,q.b)*.7;piv.x+=dx*R0;piv.z+=dz*R0;}
 // geometria del blocco: copia dei vertici delle celle (in coordinate del perno), con l'ordine per piani per poter schiacciare il fondo
 const src=T.geo.attributes,G=htGeo(),fr=[];const map=new Map();
 const byF=[];for(const c of cells){const f=c<RS?Math.floor(c/S):c-RS;(byF[f-f0]||(byF[f-f0]=[])).push(c);}
 for(let i=0;i<byF.length;i++){const st=G.n;for(const c of byF[i]||[]){const R=T.rng[c];for(let k=0;k<R.length;k+=2){for(let v=R[k];v<R[k]+R[k+1];v++){map.set(v,G.n);G.P.push(src.position.array[v*3]-piv.x,src.position.array[v*3+1]-piv.y,src.position.array[v*3+2]-piv.z);G.N.push(src.normal.array[v*3],src.normal.array[v*3+1],src.normal.array[v*3+2]);G.UV.push(src.aUV.array[v*2],src.aUV.array[v*2+1]);
     for(let j=0;j<4;j++)G.I.push(src.aI.array[v*4+j]);G.ON.push(1);G.n++;}}}fr.push([st,G.n-st]);}
 const I=T.geo.index.array;for(let i=0;i<I.length;i+=3){const a=map.get(I[i]),b=map.get(I[i+1]),c=map.get(I[i+2]);if(a!==undefined&&b!==undefined&&c!==undefined)G.X.push(a,b,c);}
 // chiusura sotto il blocco
 {const st=G.n,y=f0*4;for(let s=0;s<S;s++){if(!T.alive[f0*S+s])continue;for(let j=0;j<T.J;j++){const t0=(s*T.J+j)/(S*T.J)*TAU,t1=(s*T.J+j+1)/(S*T.J)*TAU,q2=T.sh(y+.001,f0,_hq2),A=[0,0,0],B=[0,0,0],C=[0,0,0],D=[0,0,0];
   htPtR(T,y+.001,f0,t0,hRad(q2,t0),A);htPtR(T,y+.001,f0,t1,hRad(q2,t1),B);htPtR(T,y+.001,f0,t1,q2.ri,C);htPtR(T,y+.001,f0,t0,q2.ri,D);const vs=[A,B,C,D].map(P=>{P[0]-=piv.x;P[1]=y-piv.y;P[2]-=piv.z;return htV(G,P,0,-1,0,P[0],P[2],T.st,T.seed,f0,2);});htTri(G,vs[0],vs[1],vs[2],0,-1,0);htTri(G,vs[0],vs[2],vs[3],0,-1,0);}}
  if(fr[0])fr[0].push(st,G.n-st);}
 for(const c of cells){T.alive[c]=0;T.cnt--;htHide(T,c);}
 const m=new THREE.Mesh(htFin(G,true),HT.mat);m.customDepthMaterial=HT.dmat;m.castShadow=true;m.receiveShadow=true;m.position.copy(piv);scene.add(m);
 const ch={T,m,f0,fb:0,fr,cells,mode,piv,vy:0,y:0,th:.004,w:mode==='topple'?.05:0,ax:new THREE.Vector3(dz,0,-dx),dx,dz,below:f0-1,t:0,H:(nF-f0)*4,crushK:0,done:false};
 for(const A of T.acc)if(A.cell>=0&&!A.gone&&cells.includes(A.cell)){if(A.link&&!A.link.gone){htAccCheck(T,A.cell);continue;}A.gone=true;m.attach(A.obj);}
 T.collapsing=true;HT.chunks.push(ch);HT.dirty.add(T);T.dm=true;stats.collapses++;
 sndCollapse(piv.x,piv.y,piv.z,cells.length*4);for(let k=0;k<14;k++)dustPuff(piv.x+rand(-14,14),piv.y+rand(-3,2),piv.z+rand(-14,14),rand(10,18));creak(piv.x,piv.y,piv.z);
 wakeBox(piv.x-60,0,piv.z-60,piv.x+60,T.H+20,piv.z+60);}
function htCrushFloor(T,f,vy){const S=T.S;let n=0;for(let s=0;s<S;s++){const c=f*S+s;if(!T.alive[c])continue;const o=htCellC(T,c,_hc),a=o[4];htRemove(T,c,(n++)%4===0&&debN<QP.debris*.75?1:0,Math.cos(a)*rand(4,10),vy*.3,Math.sin(a)*rand(4,10),0);}
 if(T.coreOn)htRemove(T,T.nF*S+f,0,0,0,0,0);const q=T.sh(f*4+2,f,_hq);for(let k=0;k<4;k++){const a=rand(0,TAU),r=Math.max(q.a,q.b)*rand(.8,1.4);dustPuff(T.x+q.ox+Math.cos(a)*r,f*4+rand(0,4),T.z+q.oz+Math.sin(a)*r,rand(9,16));}}
function htChunkHideFloor(ch,i){const r=ch.fr[i];if(!r)return;const on=ch.m.geometry.attributes.aOn;for(let k=0;k<r.length;k+=2)on.array.fill(0,r[k],r[k]+r[k+1]);on.needsUpdate=true;}
const _cq=new THREE.Quaternion(),_cv=new THREE.Vector3();
function htChunkCrush(ch){const T=ch.T,S=T.S,RS=T.nF*S,f=ch.f0+ch.fb,o=[0,0,0,0,0,0];htChunkHideFloor(ch,ch.fb);let n=0;
 for(const c of ch.cells){const cf=c<RS?Math.floor(c/S):c-RS;if(cf!==f)continue;htCellC(T,c,o);const x=o[0],y=o[1]+ch.y,z=o[2];
  if(c<RS&&(n++)%3===0&&debN<QP.debris*.8){const b=spawnDebris(x,Math.max(y,1.5),z,Math.min(o[3],8),3.2,Math.min(o[5],8),T.ds,T.seed+c,63,Math.cos(o[4])*rand(3,9),rand(-2,3),Math.sin(o[4])*rand(3,9),0);if(b)setYaw(b,Math.PI/2-o[4]);}
  else if(Math.random()<.3)gravel(x,Math.max(y,1),z,4,4,T.ds);}
 ch.fb++;}
function htDustRing(x,y,z,R,n,sp){if(!psA)return;const l=TODC.lit;for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(.4,1)*sp;psA.spawn(x+Math.cos(a)*R,y+rand(-1,2),z+Math.sin(a)*R,Math.cos(a)*s,rand(.3,2.5),Math.sin(a)*s,rand(6,12),R*.25,R*.8,.47*l,.44*l,.4*l,.55,1.4,-.08,1);}}

function htChunkStep(ch,dt){const T=ch.T;ch.t+=dt;
 if(ch.mode==='pancake'){ch.vy=Math.max(ch.vy-G*dt*.92,-34);ch.y+=ch.vy*dt;ch.m.position.y=ch.piv.y+ch.y;let bot=ch.piv.y+ch.y+ch.fb*4;
  if(Math.random()<dt*14){const q=T.sh(Math.max(0,Math.min(bot,T.H-1)),Math.max(0,ch.below),_hq);htDustRing(T.x+q.ox,Math.max(1,bot),T.z+q.oz,Math.max(q.a,q.b)*1.1,2,6);}
  // schiacciamento verso il basso: i piani sotto il blocco cedono uno dopo l'altro
  while(ch.below>=0&&bot<ch.below*4+4){htCrushFloor(T,ch.below,ch.vy);ch.below--;ch.vy*=.86;ch.crushK++;if(ch.crushK%2===0&&ch.fb<ch.fr.length-1){htChunkCrush(ch);bot+=4;}
   player.shake=Math.min(1.5,player.shake+clamp(160/(sDist(T.x,bot,T.z)+60),0,.25));if(ch.crushK%3===0)sndCollapse(T.x,bot,T.z,T.S*20);}
  // poi il blocco stesso si sbriciola a terra, piano dopo piano, dentro una nuvola di polvere
  while(ch.below<0&&bot<=.8){if(ch.fb<ch.fr.length-1){htChunkCrush(ch);bot+=4;ch.vy*=.84;ch.crushK++;if(ch.crushK%3===0)sndCollapse(T.x,2,T.z,T.S*25);player.shake=Math.min(1.5,player.shake+clamp(200/(sDist(T.x,0,T.z)+60),0,.2));
    const q=T.sh(2,0,_hq);htDustRing(T.x+q.ox,1.5,T.z+q.oz,Math.max(q.a,q.b)*1.2,10,12);}else{htChunkBreak(ch,0,0,0);break;}}}
 else{const Hc=ch.H;ch.w+=(1.5*G/Math.max(8,Hc)*Math.sin(ch.th)+.02)*dt;ch.th+=ch.w*dt;ch.y-=Math.min(2.5,ch.th*2)*dt;_cq.setFromAxisAngle(ch.ax,ch.th);ch.m.quaternion.copy(_cq);ch.m.position.set(ch.piv.x,ch.piv.y+ch.y,ch.piv.z);
  if(ch.below>=0&&Math.random()<dt*3){htCrushFloor(T,ch.below,-2);ch.below--;}
  let hit=null;for(let k=1;k<=4&&!hit;k++){_cv.set(0,Hc*k/4,0).applyQuaternion(_cq).add(ch.m.position);if(_cv.y<groundH(_cv.x,_cv.z)+1)hit=[_cv.x,_cv.y,_cv.z,1];else if(pointContact(_cv.x,_cv.y,_cv.z,CT)&&!(htInside(_cv.x,_cv.y,_cv.z)===T))hit=[_cv.x,_cv.y,_cv.z,0];}
  if(hit&&!hit[3]&&ch.th>.06){destroySphere(hit[0],hit[1],hit[2],7+ch.w*6,1.6+ch.w*2);}
  if(ch.th>1.05||(hit&&hit[3])||(hit&&ch.th>.35)){const vx=ch.ax.z*0,vz=0;htChunkBreak(ch,vx,0,vz);}}
 if(ch.t>40)htChunkBreak(ch,0,0,0);}
// il blocco si frantuma: detriti con la velocità di rotazione, polvere enorme
function htChunkBreak(ch,vx0,vy0,vz0){if(ch.done)return;ch.done=true;const T=ch.T,S=T.S,RS=T.nF*S,q=ch.m.quaternion,pos=ch.m.position,o=[0,0,0,0,0,0];
 const live=ch.cells.filter(c=>{const f=c<RS?Math.floor(c/S):c-RS;return f-ch.f0>=ch.fb;});const step=live.length>260?3:live.length>120?2:1;let n=0;
 const wv=new THREE.Vector3().copy(ch.ax).multiplyScalar(ch.w);
 for(let i=0;i<live.length;i+=step){const c=live[i];htCellC(T,c,o);_cv.set(o[0]-ch.piv.x,o[1]-ch.piv.y,o[2]-ch.piv.z).applyQuaternion(q);const x=pos.x+_cv.x,y=pos.y+_cv.y,z=pos.z+_cv.z;
  const rv=new THREE.Vector3().crossVectors(wv,_cv),sx=Math.min(o[3]*(step>1?1.4:1),10),sz=Math.min(o[5],10),sy=4*(step>2?1.5:1);
  const b=spawnDebris(x,Math.max(y,groundH(x,z)+sy*.5),z,sx,sy,sz,T.ds,T.seed+i,63,vx0+rv.x+rand(-1.5,1.5),vy0+ch.vy*.5+rv.y+rand(0,2),vz0+rv.z+rand(-1.5,1.5),0);
  if(b){_cq.setFromAxisAngle(_upv,Math.PI/2-o[4]).premultiply(q);b.qx=_cq.x;b.qy=_cq.y;b.qz=_cq.z;b.qw=_cq.w;updR(b);n++;}}
 for(const A of T.acc)if(A.obj.parent===ch.m){A.gone=false;A.cell=-2;const c0=A.cell;A.obj.updateMatrixWorld(true);htAccDrop(A);}
 const cx=pos.x,cz=pos.z;for(let k=0;k<Math.min(60,10+live.length/8);k++){const a=rand(0,TAU),r=rand(0,ch.H*.6);dustPuff(cx+Math.cos(a)*r+ch.dx*ch.H*.3,rand(1,14),cz+Math.sin(a)*r+ch.dz*ch.H*.3,rand(14,28));}
 sndCollapse(cx,4,cz,live.length*6);player.shake=Math.min(2,player.shake+clamp(300/(sDist(cx,0,cz)+80),0,1));addWave(cx,2,cz,30);
 scene.remove(ch.m);ch.m.geometry.dispose();T.collapsing=false;HT.dirty.add(T);T.dm=true;if(T.cnt<T.S)T.dead=T.cnt<=0;}
/* ---------- facce interne scoperte dai danni (solai, pareti di taglio, nucleo) ---------- */
function htDamageMesh(T){if(T.dmesh){scene.remove(T.dmesh);T.dmesh.geometry.dispose();T.dmesh=null;}const S=T.S,J=T.J,nF=T.nF,RS=nF*S,A=T.alive,G=htGeo(),st=T.st,sd=T.seed;let any=false;
 const sector=(f,s,y,up)=>{for(let j=0;j<J;j++){const t0=(s*J+j)/(S*J)*TAU,t1=(s*J+j+1)/(S*J)*TAU,yy=up?y-.001:y+.001,ff=up?f:f,q=T.sh(yy,ff,_hq),Aa=[0,0,0],B=[0,0,0],C=[0,0,0],D=[0,0,0];
  htPtR(T,yy,ff,t0,hRad(q,t0),Aa);htPtR(T,yy,ff,t1,hRad(q,t1),B);htPtR(T,yy,ff,t1,q.ri,C);htPtR(T,yy,ff,t0,q.ri,D);const vs=[Aa,B,C,D].map(P=>{P[1]=y;return htV(G,P,0,up?1:-1,0,P[0],P[2],st,sd,f,up?1:2);});htTri(G,vs[0],vs[1],vs[2],0,up?1:-1,0);htTri(G,vs[0],vs[2],vs[3],0,up?1:-1,0);}};
 const side=(f,s,th,sg)=>{const P=[];for(const y of [f*4+.001,f*4+3.999]){const q=T.sh(y,f,_hq);const o1=[0,0,0],o2=[0,0,0];htPtR(T,y,f,th,hRad(q,th),o1);htPtR(T,y,f,th,q.ri,o2);P.push(o1,o2);}
  const q=T.sh(f*4+2,f,_hq),a=th+q.rot,nx=-Math.sin(a)*sg,nz=Math.cos(a)*sg,vs=P.map((p,i)=>htV(G,p,nx,0,nz,i%2?0:Math.hypot(p[0]-T.x-q.ox,p[2]-T.z-q.oz),p[1],st,sd,f,2));htTri(G,vs[0],vs[1],vs[3],nx,0,nz);htTri(G,vs[0],vs[3],vs[2],nx,0,nz);};
 const coreW=(f,s,inward)=>{for(let j=0;j<J;j++){const t0=(s*J+j)/(S*J)*TAU,t1=(s*J+j+1)/(S*J)*TAU,P=[];for(const y of [f*4+.001,f*4+3.999]){const q=T.sh(y,f,_hq);for(const th of [t0,t1]){const o=[0,0,0];htPtR(T,y,f,th,q.ri,o);P.push(o);}}
  const q=T.sh(f*4+2,f,_hq),a=(t0+t1)/2+q.rot,sg=inward?-1:1,nx=Math.cos(a)*sg,nz=Math.sin(a)*sg,vs=P.map(p=>htV(G,p,nx,0,nz,(t0+t1)*q.ri*.5,p[1],st,sd,f,3));htTri(G,vs[0],vs[1],vs[2],nx,0,nz);htTri(G,vs[1],vs[3],vs[2],nx,0,nz);}};
 for(let f=0;f<nF;f++)for(let s=0;s<S;s++){const c=f*S+s;if(A[c])continue;any=true;
  if(f>0&&A[c-S])sector(f-1,s,f*4,true);if(f<nF-1&&A[c+S])sector(f+1,s,f*4+4,false);
  const l=f*S+(s+S-1)%S,r=f*S+(s+1)%S;if(A[l])side(f,(s+S-1)%S,s/S*TAU,1);if(A[r])side(f,(s+1)%S,(s+1)/S*TAU,-1);
  if(T.coreOn&&A[RS+f])coreW(f,s,false);}
 if(T.coreOn)for(let f=0;f<nF;f++){if(A[RS+f])continue;for(let s=0;s<S;s++)if(A[f*S+s]){any=true;coreW(f,s,true);}}
 if(!any||!G.n)return;T.dmesh=new THREE.Mesh(htFin(G,false),HT.mat);T.dmesh.customDepthMaterial=HT.dmat;T.dmesh.castShadow=true;T.dmesh.receiveShadow=true;scene.add(T.dmesh);}
/* ---------- accessori: guglie, corone luminose, passerelle (cadono con la cella che li regge) ---------- */
function htAcc(T,obj,cell,o){const A=Object.assign({T,obj,cell,gone:false,lp:[]},o||{});T.acc.push(A);HT.acc.push(A);scene.add(obj);return A;}
function htAccCheck(T,c){for(const A of T.acc){if(A.gone||A.cell!==c)continue;A.gone=true;if(A.link)A.link.gone=true;if(A.obj.parent&&A.obj.parent!==scene){const wp=new THREE.Vector3(),wq=new THREE.Quaternion();A.obj.getWorldPosition(wp);A.obj.getWorldQuaternion(wq);A.obj.parent.remove(A.obj);A.obj.position.copy(wp);A.obj.quaternion.copy(wq);scene.add(A.obj);}const o=A.obj;o.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3());
  if(sz.x*sz.y*sz.z<6000&&Math.max(sz.x,sz.y,sz.z)<90){const g=new THREE.Group();scene.remove(o);g.add(o);o.position.sub(ct);scene.add(g);const b=newBody(1,ct.x,ct.y,ct.z,Math.max(.4,sz.x/2),Math.max(.4,sz.y/2),Math.max(.4,sz.z/2),Math.min(60000,200+sz.x*sz.y*sz.z*60));b.obj=g;b.snd='metal';b.vx=rand(-2,2);b.vz=rand(-2,2);b.wx=rand(-.6,.6);b.wz=rand(-.6,.6);syncObj(b);}
  else{o.visible=false;for(let k=0;k<6;k++)spawnDebris(ct.x+rand(-sz.x,sz.x)*.4,ct.y+rand(-sz.y,sz.y)*.4,ct.z+rand(-sz.z,sz.z)*.4,rand(2,5),rand(1,3),rand(2,5),T.ds,T.seed+k,63,rand(-3,3),rand(0,3),rand(-3,3),0);}
  for(const i of A.lp)lpHide(i);}}
function htAccDrop(A){const o=A.obj,wp=new THREE.Vector3(),wq=new THREE.Quaternion();o.getWorldPosition(wp);o.getWorldQuaternion(wq);if(o.parent)o.parent.remove(o);o.position.copy(wp);o.quaternion.copy(wq);scene.add(o);A.gone=true;
 const bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),g=new THREE.Group();scene.remove(o);g.add(o);o.position.sub(ct);g.position.copy(ct);scene.add(g);
 const b=newBody(1,ct.x,ct.y,ct.z,Math.max(.4,sz.x/2),Math.max(.4,sz.y/2),Math.max(.4,sz.z/2),Math.min(60000,200+sz.x*sz.y*sz.z*60));b.obj=g;b.snd='metal';b.wx=rand(-.5,.5);b.wz=rand(-.5,.5);syncObj(b);for(const i of A.lp)lpHide(i);}
function lpHide(i){if(!LP.m)return;const a=LP.m.geometry.attributes.aS;a.array[i*3]=0;a.needsUpdate=true;}
/* ---------- materiale delle facciate high-tech ---------- */
const HT_F=`varying vec2 vUV;varying vec4 vI;varying vec3 vWP;varying vec3 vWN;uniform float uNight;uniform float uTime;uniform vec4 uDmg[24];uniform float uDmgN;uniform float uIM;uniform float uPix;
vec3 fAlb;float fRough;float fMetal;vec3 fEmis;vec3 fPert;
`+FAC_F.slice(FAC_F.indexOf('float rEm=0.;'),FAC_F.indexOf('vec3 fAlb;'))+`
float gFp;
// finestre accese: da lontano (meno di 2-3 pixel per finestra) diventano un bagliore medio, senza sfarfallio
float wl2(vec2 id,float sd){float a=step(.6,h21(id*1.37+sd*17.3));vec2 cb=vec2(floor(id.x/6.),floor(id.y/2.));float b=step(.7,h21(cb*2.71+sd*9.1))*.8+.05;return mix(mix(a,b,smoothstep(.25,.6,gFp)),.18,smoothstep(2.5,6.,gFp));}
void htFacade(){vec3 p=vWP,n=normalize(vWN);gFp=length(p-cameraPosition)*uPix/max(.2,abs(dot(normalize(p-cameraPosition),n)));float st=floor(vI.x+.5),sd=vI.y,fl=vI.z,ft=floor(vI.w+.5),u=vUV.x,v=vUV.y,fy=fract(v*.25);
 fEmis=vec3(0.);fPert=vec3(0.);float t1=h11(sd*91.7+1.3),t2=h11(sd*37.1+7.7);
 float brk=0.,soot=0.,crk=0.;for(int i=0;i<24;i++){if(float(i)>=uDmgN)break;vec4 d=uDmg[i];if(d.w>0.){float dd=length(p-d.xyz);brk=max(brk,1.-step(d.w,dd));crk=max(crk,1.-step(d.w*1.5,dd));soot=max(soot,1.-smoothstep(d.w*.16,d.w*.4,dd));}}
 float n2=vn2(p.xz*1.3+p.y*.7),n3=vn2(p.xz*4.1+p.y*2.3);
 if(ft>.5&&ft<1.5){vec2 q=p.xz*.5;float cp=step(.5,h21(floor(p.xz*.125)+fl));fAlb=mix(vec3(.36,.35,.33),mix(vec3(.18,.17,.2),vec3(.3,.22,.15),t2),cp*.7)*(.7+.4*n2);fAlb*=1.-.35*step(.8,vn2(p.xz*.6+fl));fRough=.95;fMetal=0.;}
 else if(ft>1.5&&ft<3.5){float jg=vn2(p.xz*2.7+p.y*1.9);fAlb=vec3(.38,.37,.35)*(.62+.5*jg)*(1.-.3*step(.82,n3));if(ft>2.5)fAlb=vec3(.46,.45,.43)*(.8+.25*n2);fRough=.97;fMetal=0.;fEmis+=vec3(3.,1.,.2)*step(.985,h21(floor(p.xz*2.)+floor(p.y*2.)))*soot;}
 else if(ft>3.5&&ft<4.5){
  if(st>6.5){vec2 q=fract(p.xz/vec2(2.2,1.4));float pv=step(.06,q.x)*step(q.x,.94)*step(.08,q.y)*step(q.y,.92)*step(.45,vn2(p.xz*.05));fAlb=mix(mix(vec3(.05,.1,.03),vec3(.1,.15,.05),n2),vec3(.03,.045,.09),pv);fRough=mix(.9,.15,pv);fMetal=pv*.4;}
  else if(st>3.5&&st<4.5){fAlb=vec3(.7);fRough=.4;fMetal=.3;}
  else{vec2 q=fract(p.xz/3.);float jt=1.-step(.03,q.x)*step(q.x,.97)*step(.03,q.y)*step(q.y,.97);fAlb=vec3(.5,.5,.49)*(.85+.2*n2)*(1.-jt*.3);fRough=.8;fMetal=.05;}
  }
 else{float gl=0.,wR=.5,wM=0.,gR=.05,gM=.2;vec3 wall=vec3(.5),gA=vec3(.05);vec2 wid=vec2(floor(u/1.5),fl);float ga=.8;
  if(st<.5){float cu=fract(u/1.5),mul=1.-step(.025,cu)*step(cu,.975),spd=clamp(step(fy,.1)+step(.96,fy),0.,1.);gl=(1.-mul)*(1.-spd);
   wall=mix(vec3(.66,.69,.72),vec3(.045,.06,.07),spd*(1.-mul));wR=.28;wM=.9;gA=mix(vec3(.06,.12,.15),vec3(.08,.11,.16),t1)*(.86+.28*h21(wid*.37));gR=.015+.02*h21(wid+3.);gM=.3;ga=.88;
   fPert=vec3(h21(wid)-.5,0.,h21(wid+2.)-.5)*.025;fEmis+=gl*vec3(.82,.9,1.)*.84*uNight*wl2(wid,sd);}
  else if(st<1.5){float P=9.,k=1.125,d1=abs(fract((u+v*k)/P)-.5)*P,d2=abs(fract((u-v*k)/P)-.5)*P,dm=min(d1,d2)*.66;float mem=1.-smoothstep(.32,.42,dm);
   float cu=fract(u/1.5),mul=1.-step(.02,cu)*step(cu,.98);gl=(1.-mem)*(1.-mul)*(1.-clamp(step(fy,.06)+step(.97,fy),0.,1.));
   wall=mix(vec3(.12,.13,.14),vec3(.88,.89,.9)*(.92+.08*n2),mem);wR=mix(.4,.35,mem);wM=mix(.6,.15,mem);gA=vec3(.04,.06,.08)*(.85+.3*h21(wid));gR=.02;gM=.3;ga=.7;
   fEmis+=gl*vec3(1.,.93,.82)*.81*uNight*wl2(wid,sd);fEmis+=mem*vec3(.3,.7,1.)*uNight*.35*step(.5,t2);}
  else if(st<2.5){float bal=step(fy,.3);float cu=fract(u/2.2);gl=(1.-bal)*step(.04,cu)*step(cu,.96)*step(fy,.94);
   wall=mix(vec3(.15),vec3(.9,.9,.88)*(.92+.08*n2),bal);wR=.35;wM=.05;gA=vec3(.05,.065,.075)*(.85+.3*h21(wid));gR=.03;gM=.2;wid=vec2(floor(u/2.2),fl);ga=.6;
   fEmis+=gl*vec3(1.,.86,.66)*.93*uNight*wl2(wid,sd);fEmis+=bal*(1.-step(.02,abs(fy-.29)))*vec3(1.,.8,.55)*uNight*1.2;}
  else if(st<3.5){float cu=fract(u/1.2);float fin=1.-smoothstep(.08,.16,abs(cu-.5));gl=(1.-fin)*(1.-clamp(step(fy,.08)+step(.96,fy),0.,1.));
   wall=mix(vec3(.04,.045,.05),vec3(.52,.4,.26)*(.8+.4*abs(cu-.5)*4.),fin);wR=.38;wM=.85;gA=vec3(.035,.045,.05)*(.85+.3*h21(wid));gR=.02;gM=.3;wid=vec2(floor(u/1.2),fl);ga=.55;
   fEmis+=gl*vec3(1.,.9,.7)*.87*uNight*wl2(wid,sd);}
  else if(st<4.5){vec2 q=vec2(u/4.,v/3.464);vec2 g=vec2(q.x+.5*q.y,q.y);float a1=fract(g.x),a2=fract(g.y),a3=fract(g.x-g.y);float fr=1.-step(.035,a1)*step(a1,.965)*step(.035,a2)*step(a2,.965)*step(.035,abs(a3))*step(abs(a3),.965);
   gl=1.-fr;wall=vec3(.9,.9,.88);wR=.3;wM=.25;wid=floor(g)+vec2(fl);gA=mix(vec3(.08,.12,.13),vec3(.13,.15,.15),h21(floor(g)*1.3))*(.85+.3*h21(floor(g)));gR=.02;gM=.35;ga=.9;
   fEmis+=gl*vec3(1.,.85,.6)*uNight*(.5+.5*vn2(p.xz*.05+uTime*.05))*.9;}
  else if(st<5.5){float cv=fract(v/1.2),cu=fract(u/2.4);float jt=max(1.-step(.012,cv)*step(cv,.988),(1.-step(.01,cu)*step(cu,.99))*.6);wall=vec3(.6,.59,.56)*(.86+.18*n2)*(1.-jt*.25);wR=.85;wM=0.;
   float sl=step(.42,fract(u/9.))*step(fract(u/9.),.58)*step(.3,fy)*step(fy,.7)*step(.5,fract(fl*.5));gl=sl;gA=vec3(.05);gR=.1;gM=.2;ga=.05;fEmis+=sl*vec3(1.,.9,.7)*uNight*.8;}
  else if(st<6.5){float cu=fract(u/3.),mul=1.-step(.02,cu)*step(cu,.98);gl=(1.-mul);wall=vec3(.15,.16,.17);wR=.4;wM=.7;gA=vec3(.06,.13,.12);gR=.02;gM=.35;ga=.9;
   fEmis+=gl*vec3(.4,1.,.7)*uNight*.4;}
  else{float cu=fract(u/3.2),mul=1.-step(.015,cu)*step(cu,.985),bnd=1.-step(.1,fy)*step(fy,.93);gl=(1.-mul)*(1.-bnd);
   wall=mix(vec3(.6,.62,.64),vec3(.93,.93,.92),bnd);wR=.3;wM=.4;gA=vec3(.07,.11,.12)*(.86+.28*h21(vec2(floor(u/3.2),fl)));gR=.015;gM=.3;wid=vec2(floor(u/3.2),fl);ga=.85;
   fEmis+=gl*vec3(.95,.95,1.)*.81*uNight*wl2(wid,sd);fEmis+=bnd*(1.-step(.015,abs(fy-.95)))*vec3(.6,.9,1.)*uNight*1.6;}
  if(ft>4.5){gl*=.8;}
  float fpm=length(p-cameraPosition)*uPix/max(.2,abs(dot(normalize(p-cameraPosition),n)));float aa=smoothstep(.3,1.,fpm),ai=1.-smoothstep(.06,.25,fpm);float hole=0.;
  if(brk>.5&&gl>.5){float ex=min(fract(u*.625),1.-fract(u*.625)),ey=min(fy,1.-fy),jag=vn2(vec2(u,v)*9.+sd*3.)*.2+vn2(vec2(u,v)*23.)*.07;float keep=step(min(ex,ey*.8),jag);hole=1.-keep;
   gA=mix(vec3(.012,.011,.01),gA,keep);gM*=keep;gR=mix(.9,gR,keep);fPert*=keep;fEmis*=.3;fEmis+=hole*vec3(3.,1.1,.25)*step(.8,h21(wid+sd*5.))*soot*(.6+.4*sin(uTime*11.+wid.x*3.));}
  else if(crk>.5&&gl>.5){float cr=abs(sin((u*3.1+v*1.7)*5.3+sd)*sin((v*2.9-u*2.3)*4.7));float ln=1.-smoothstep(0.,.06,cr);gA=mix(gA,vec3(.5,.52,.53),ln*.7);gR=mix(gR,.6,ln);}
  if(uIM>.5&&gl>.01&&ai>.01&&st!=4.){float lt;vec3 rc=roomCol(p,n,lt,ai);vec3 ie=rc*mix(.12+hole*.02,lt*.95+.006,uNight)+rc*rEm*(.5+uNight*1.5);fEmis=mix(fEmis,ie*(1.+hole*.2),gl*ai);if(hole>.5)gA=mix(gA,rc*.04,ai);}
  wall*=mix(.7,1.,smoothstep(0.,6.,v));gl=mix(gl,ga,aa);fPert*=1.-aa;gR=mix(gR,.25,aa*.7);
  fAlb=mix(wall,gA,gl);fRough=mix(wR,gR,gl);fMetal=mix(wM,gM,gl);}
 fAlb*=1.-soot*.8;fRough=mix(fRough,1.,soot*.7);fMetal*=1.-soot*.9;}
`;
function htMats(){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uTime:U.uTime,uNight:U.uNight,uDmg:U.uDmg,uDmgN:U.uDmgN,uIM:U.uIM,uPix:U.uPix,uQuake:U.uQuake});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aUV;attribute vec4 aI;attribute float aOn;varying vec2 vUV;varying vec4 vI;varying vec3 vWP;varying vec3 vWN;uniform vec4 uQuake;uniform float uTime;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvUV=aUV;vI=aI;if(aOn<.5)transformed=vec3(0.,-1e5,0.);else if(uQuake.w>0.){float hf=clamp(transformed.y/220.,0.,1.);transformed.xz+=vec2(sin(uTime*uQuake.x+aI.y*40.),cos(uTime*uQuake.x*.87+aI.y*52.))*uQuake.w*hf*hf*3.;}')
   .replace('#include <project_vertex>','#include <project_vertex>\n'+WP_VM);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GLSL_NOISE+HT_F)
   .replace('#include <color_fragment>','#include <color_fragment>\nhtFacade();diffuseColor.rgb=fAlb;')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=fRough;')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=fMetal;')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+(viewMatrix*vec4(fPert,0.)).xyz);')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=fEmis;');};
 m.customProgramCacheKey=()=>'htfac';HT.mat=m;
 const d=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});d.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aOn;').replace('#include <begin_vertex>','#include <begin_vertex>\nif(aOn<.5)transformed=vec3(0.,-1e5,0.);');};d.customProgramCacheKey=()=>'htdep';HT.dmat=d;}
/* ---------- passo per fotogramma: aggiornamenti, stabilità, crolli ---------- */
function htStep(dt){for(const T of HT.L)htFlush(T);
 if(HT.dirty.size){const L=[...HT.dirty];HT.dirty.clear();for(const T of L){if(!T.collapsing)htStruct(T);}}
 for(let i=HT.chunks.length-1;i>=0;i--){const ch=HT.chunks[i];if(ch.done){HT.chunks.splice(i,1);continue;}htChunkStep(ch,dt);}
 HT.dmT=(HT.dmT||0)-dt;if(HT.dmT<=0){HT.dmT=.12;for(const T of HT.L)if(T.dm){T.dm=false;htDamageMesh(T);}}}
// collegamento con il resto del gioco: contatti, raggi, esplosioni, laser, asteroidi, tornado, buco nero, carri armati
{const pc0=pointContact;pointContact=function(x,y,z,o){return pc0(x,y,z,o)||htContact(x,y,z,o);};}
{const nb0=nearB;nearB=function(b){if(nb0(b))return true;const a=htNearXZ(b.px,b.pz);if(!a)return false;for(const T of a)if(!T.dead&&b.py-b.r<T.H&&Math.hypot(b.px-T.x,b.pz-T.z)<T.rb+b.r)return true;return false;};}
{const rc0=raycast;raycast=function(ox,oy,oz,dx,dy,dz,maxD,ignore){const hit=rc0(ox,oy,oz,dx,dy,dz,maxD,ignore);if(!HT.L.length)return hit;const T=htRay(ox,oy,oz,dx,dy,dz,hit?RH.t:maxD);
 if(T){const t=HQ.t;RH.t=t;RH.x=ox+dx*t;RH.y=oy+dy*t;RH.z=oz+dz*t;RH.kind='htt';RH.b=null;RH.ci=-1;RH.body=null;RH.ht=T;RH.hc=HQ.c;if(htContact(RH.x-dx*.02,RH.y-dy*.02,RH.z-dz*.02,CT)){RH.nx=CT.nx;RH.ny=CT.ny;RH.nz=CT.nz;}else{RH.nx=-dx;RH.ny=-dy;RH.nz=-dz;}return true;}return hit;};}
{const ds0=destroySphere;destroySphere=function(x,y,z,R,P){ds0(x,y,z,R,P);htDamageSphere(x,y,z,R,P);};}
{const lt0=laserTick;laserTick=function(dt){if(AIM.kind==='htt'&&AIM.ht){const T=AIM.ht,c=AIM.hc;AIM.kind='ground';lt0(dt);AIM.kind='htt';if(c>=0&&T.alive[c]){T.hp[c]-=420*dt*(.4+S.pow);if(T.hp[c]<=0)htRemove(T,c,2,AIM.nx*3,2,AIM.nz*3,U.uTime.value);}return;}lt0(dt);};}
{const ms0=meteorSweep;meteorSweep=function(M,dx,dy,dz,len){const r=M.size*1.15;for(let s2=0;s2<=len;s2+=2){const x=M.x+dx*s2,y=M.y+dy*s2,z=M.z+dz*s2;const T=htInside(x,y,z)||htInside(x+r*.7,y,z)||htInside(x-r*.7,y,z)||htInside(x,y,z+r*.7)||htInside(x,y,z-r*.7);
  if(T){const n0=T.cnt;htDamageSphere(x,y,z,r+2,4+M.P*6);M.E-=Math.max(1,n0-T.cnt)*.7;if(M.E<=0)return[x,y,z];}}return ms0(M,dx,dy,dz,len);};}
{const td0=tornadoDamage;tornadoDamage=function(Tn){td0(Tn);const R=Tn.Rc*1.5;for(const T of HT.L){if(T.dead||Math.hypot(T.x-Tn.x,T.z-Tn.z)>T.rb+R)continue;for(let k=0;k<3+Tn.P*6;k++){const f=Math.floor(Math.pow(Math.random(),1.6)*Math.min(T.nF,30)),s=Math.floor(rand(0,T.S)),c=f*T.S+s;if(!T.alive[c]||Math.random()>.3*Tn.s)continue;
   const o=htCellC(T,c,_hc);if(Math.hypot(o[0]-Tn.x,o[2]-Tn.z)>R+8)continue;tornadoAir(Tn,o[0],o[1],o[2],_air);htRemove(T,c,2,_air[0]*.3,_air[1]*.3+3,_air[2]*.3,0);}}};}
{const hr0=holeRip;holeRip=function(H){hr0(H);for(const T of HT.L){if(T.dead||Math.hypot(T.x-H.x,T.z-H.z)>T.rb+H.R||H.y-H.R>T.H)continue;for(let k=0;k<12;k++){const f=clamp(Math.floor((H.y+rand(-H.R,H.R))/4),0,T.nF-1),c=f*T.S+Math.floor(rand(0,T.S));if(!T.alive[c])continue;const o=htCellC(T,c,_hc),d=Math.hypot(o[0]-H.x,o[1]-H.y,o[2]-H.z);if(d>H.R*.7)continue;htRemove(T,c,2,(H.x-o[0])/d*8,(H.y-o[1])/d*8,(H.z-o[2])/d*8,0);}}};}
{const tb0=tankBreak;tankBreak=function(x,y,z,v){const T=htInside(x,y,z);if(T){const c=HQ.c;T.hp[c]-=Math.abs(v.sp)*30;if(T.hp[c]<=0){htRemove(T,c,2,-Math.sin(v.yaw)*Math.abs(v.sp),1.5,-Math.cos(v.yaw)*Math.abs(v.sp),0);sndImpact(x,y,z,'stone',14);}return;}tb0(x,y,z,v);};}
