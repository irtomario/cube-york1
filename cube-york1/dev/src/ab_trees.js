/* ======================= PATCH AB — ALBERI VERI ======================= */
// Prima: abeti fatti di coni impilati, latifoglie fatte di palle verdi, alberi di città a icosaedri, sagome lontane disegnate
// a mano. Ora ogni albero è costruito come quelli veri: tronco che si rastrema con la base allargata e la corteccia a
// fessure (latifoglie) o a placche (conifere), rami principali che si aprono e salgono, rametti, e la chioma fatta di
// "rametti con foglie" (centinaia di foglie disegnate una a una) o di fronde di aghi, disposti lungo i rami.
// La luce: le foglie sono traslucide controsole, l'interno della chioma è in ombra, le ombre a terra sono bucate tra le
// foglie; il vento muove l'albero intero, i rami con fasi diverse e fa tremare le foglie.
// Tre forme diverse per specie, tre livelli di dettaglio (vicino, medio, sagoma lontana ricavata dall'albero vero).
const TRS={atlas:null,mats:{},geo:null,spr:null,err:0};
// ---------- 1) atlante delle texture disegnato al volo: rametti di foglie, fronde di aghi, cortecce ----------
function trRnd(seed){let s=(seed>>>0)||1;return()=>{s=Math.imul(s^(s>>>15),2246822507)^Math.imul(s^(s>>>13),3266489909);s^=s>>>16;return (s>>>0)/4294967296;};}
function trLeafPath(g,L,W,k){g.beginPath();g.moveTo(0,0);
 if(k===0){g.bezierCurveTo(W*.56,-L*.1,W*.62,-L*.62,0,-L);g.bezierCurveTo(-W*.62,-L*.62,-W*.56,-L*.1,0,0);}
 else{g.bezierCurveTo(W*.72,L*.06,W*.7,-L*.72,0,-L);g.bezierCurveTo(-W*.7,-L*.72,-W*.72,L*.06,0,0);}g.closePath();}
function trLeaf(g,r,x,y,a,L,W,k,hue,lit){g.save();g.translate(x,y);g.rotate(a);trLeafPath(g,L,W,k);
 const l0=14+lit*11+r()*6,s0=36+r()*16,h0=hue+(r()-.5)*14,gr=g.createLinearGradient(0,0,0,-L);
 gr.addColorStop(0,'hsl('+h0+','+s0+'%,'+(l0-5)+'%)');gr.addColorStop(.55,'hsl('+(h0+3)+','+s0+'%,'+l0+'%)');gr.addColorStop(1,'hsl('+(h0+7)+','+(s0-6)+'%,'+(l0+4)+'%)');
 g.fillStyle=gr;g.fill();g.lineWidth=1;g.strokeStyle='rgba(10,20,5,.35)';g.stroke();
 g.beginPath();g.moveTo(0,-1);g.lineTo(0,-L*.86);g.lineWidth=1.3;g.strokeStyle='rgba(205,225,150,.32)';g.stroke();
 for(let i=1;i<4;i++){const t=-L*(.22*i);g.beginPath();g.moveTo(0,t);g.lineTo(W*.28,t-L*.12);g.moveTo(0,t);g.lineTo(-W*.28,t-L*.12);g.lineWidth=.7;g.strokeStyle='rgba(205,225,150,.16)';g.stroke();}
 g.restore();}
function trTwig(g,x0,y0,a,len,w0,w1,col){const n=8,pts=[];let x=x0,y=y0,aa=a;for(let i=0;i<=n;i++){pts.push([x,y]);aa+=Math.sin(i*1.7+x0)*.04;x+=Math.sin(aa)*len/n;y-=Math.cos(aa)*len/n;}
 for(let i=0;i<n;i++){g.beginPath();g.moveTo(pts[i][0],pts[i][1]);g.lineTo(pts[i+1][0],pts[i+1][1]);g.lineWidth=w0+(w1-w0)*i/n;g.lineCap='round';g.strokeStyle=col;g.stroke();}return pts;}
function trBroadCluster(g,ox,oy,k,seed){const r=trRnd(seed),hue=k?92:98;g.save();g.beginPath();g.rect(ox,oy,512,512);g.clip();
 const main=trTwig(g,ox+256,oy+506,(r()-.5)*.12,455,6,2,'#4a3828'),tw=[{p:main}];
 for(let i=0;i<14;i++){const t=.08+i*.062,p=main[Math.min(8,Math.round(t*8))],sd=i%2?1:-1,len=(1-t*.5)*(150+r()*55);tw.push({p:trTwig(g,p[0],p[1],sd*(.6+r()*.4),len,2.6,.9,'#4f3d2b')});
  if(r()<.6){const q=tw[tw.length-1].p[4];tw.push({p:trTwig(g,q[0],q[1],sd*(1.1+r()*.4),len*.45,1.6,.8,'#54412e')});}}
 const L0=k?30:36,Wr=k?.82:.5,lv=[];
 // foglie ogni ~13 px lungo i rametti (lati alterni, girate in avanti e in fuori) e un ciuffo in punta
 for(const T of tw){const P=T.p;let sd=1;for(let j=1;j<P.length;j++){const a=P[j-1],b=P[j],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),n=Math.max(1,Math.round(l/13)),ta=Math.atan2(dx,-dy);
   for(let s2=0;s2<n;s2++){sd=-sd;lv.push([a[0]+dx*s2/n,a[1]+dy*s2/n,ta+sd*(.7+r()*.55),L0*(.75+r()*.45),r()]);}}
  const e=P[P.length-1],d0=P[P.length-2];for(let j=0;j<3;j++)lv.push([e[0],e[1],Math.atan2(e[0]-d0[0],d0[1]-e[1])+(j-1)*.5,L0*(.9+r()*.3),.5+r()*.5]);}
 // prima quelle in ombra (dietro), poi quelle in luce
 lv.sort((a,b)=>a[4]-b[4]);for(const q of lv)trLeaf(g,r,q[0],q[1],q[2],q[3],q[3]*Wr,k,hue,q[4]);
 g.restore();}
function trFrond(g,ox,oy,seed){const r=trRnd(seed);g.save();g.beginPath();g.rect(ox,oy,512,512);g.clip();
 const main=trTwig(g,ox+256,oy+508,(r()-.5)*.08,480,5,1.5,'#4b3626'),tw=[{p:main,s:1}];
 for(let i=0;i<22;i++){const t=.03+i*.043,p=main[Math.min(8,Math.round(t*8))],sd=i%2?1:-1,len=200*Math.pow(1-t,.8)+25;tw.push({p:trTwig(g,p[0]+(r()-.5)*4,p[1]-(r()-.5)*8,sd*(.95+r()*.2),len,2.2,.8,'#4d3a28'),s:1-t});}
 g.lineCap='round';
 for(const T of tw){const P=T.p;for(let j=0;j<P.length-1;j++){const a=P[j],b=P[j+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,n=Math.ceil(l/2.2);
  for(let s=0;s<n;s++){const x=a[0]+dx*s/n,y=a[1]+dy*s/n,tip=(j+s/n)/(P.length-1);for(const sd of[-1,1]){const an=sd*(.6+r()*.35),ca=Math.cos(an),sa=Math.sin(an),vx=ux*ca-uy*sa,vy=ux*sa+uy*ca,L=8+r()*5;
    const lt=tip>.82?18:0;g.strokeStyle='rgb('+(26+r()*12+lt*1.6|0)+','+(52+r()*18+lt*1.8|0)+','+(30+r()*10+lt|0)+')';g.lineWidth=1.3+r()*.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+vx*L,y+vy*L);g.stroke();}}}}
 g.restore();}
function trBark(g,ox,oy,w,h,k,seed){const r=trRnd(seed);g.save();g.beginPath();g.rect(ox,oy,w,h);g.clip();
 g.fillStyle=k?'#62412d':'#5a5048';g.fillRect(ox,oy,w,h);
 for(let i=0;i<2600;i++){const v=r();g.fillStyle=k?'rgba('+(70+v*70|0)+','+(42+v*40|0)+','+(28+v*26|0)+',.35)':'rgba('+(60+v*70|0)+','+(54+v*64|0)+','+(48+v*56|0)+',.3)';g.fillRect(ox+r()*w,oy+r()*h,1+r()*3,1+r()*4);}
 if(!k){for(let i=0;i<46;i++){const x0=r()*w,wd=1.5+r()*4;for(const sh of[-w,0,w]){g.beginPath();let x=x0+sh;g.moveTo(ox+x,oy);for(let y=0;y<=h;y+=8){x+=(r()-.5)*5;g.lineTo(ox+x,oy+y);}g.lineWidth=wd;g.strokeStyle='rgba(28,22,18,.78)';g.stroke();g.lineWidth=1.2;g.strokeStyle='rgba(150,140,128,.22)';g.translate(3,0);g.stroke();g.translate(-3,0);}}}
 else{for(let i=0;i<240;i++){const x=r()*w,y=r()*h,pw=16+r()*26,ph=22+r()*44,v=r();for(const sh of[-w,0,w]){g.fillStyle='rgba('+(118+v*40|0)+','+(76+v*28|0)+','+(52+v*20|0)+',.6)';g.fillRect(ox+x+sh,oy+y,pw,ph);g.lineWidth=2;g.strokeStyle='rgba(40,24,14,.7)';g.strokeRect(ox+x+sh,oy+y,pw,ph);}}}
 g.restore();}
// regioni (u0,v0,u1,v1): v=1 in alto nella tela
const TR_UV={bl1:[0,.5,.5,1],bl2:[0,0,.5,.5],cf:[.5,.5,1,1]};
function trAtlas(){const S=1024,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.clearRect(0,0,S,S);
 trBroadCluster(g,0,0,0,11);trBroadCluster(g,0,512,1,23);trFrond(g,512,0,37);trBark(g,512,512,512,256,0,41);trBark(g,512,768,512,256,1,53);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t;}
// ---------- 2) costruzione della geometria ----------
const _trv=new THREE.Vector3(),_trw=new THREE.Vector3(),_trn=new THREE.Vector3(),_trb=new THREE.Vector3(),_tru=new THREE.Vector3(0,1,0);
function TGB(){return{p:[],n:[],u:[],c:[],w:[],i:[]};}
function tgV(B,x,y,z,nx,ny,nz,u,v,ao,w0,w1,w2,w3){B.p.push(x,y,z);B.n.push(nx,ny,nz);B.u.push(u,v);B.c.push(ao,ao,ao);B.w.push(w0,w1,w2,w3);return B.p.length/3-1;}
function tgGeo(B){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));g.setAttribute('aWnd',new THREE.Float32BufferAttribute(B.w,4));g.setIndex(B.i);g.computeBoundingSphere();g.computeBoundingBox();return g;}
// tubo lungo una spezzata (tronco, rami): uv della corteccia "srotolata" (ripetuta nello shader), kind 0 latifoglia 2 conifera
function tgTube(B,P,R,n,kind,W,ph,ao){const m=P.length;let ref=new THREE.Vector3(1,0,0),s=0;const C0=2*Math.PI*R[0];const rings=[];
 for(let i=0;i<m;i++){const T=new THREE.Vector3().subVectors(P[Math.min(m-1,i+1)],P[Math.max(0,i-1)]).normalize();const N=ref.clone().addScaledVector(T,-ref.dot(T));if(N.lengthSq()<1e-6)N.set(0,0,1).addScaledVector(T,-T.z);N.normalize();const Bv=new THREE.Vector3().crossVectors(T,N);ref=N;
  if(i)s+=P[i].distanceTo(P[i-1]);const v=s/(.5*C0),b0=B.p.length/3;
  for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);const dx=N.x*ca+Bv.x*sa,dy=N.y*ca+Bv.y*sa,dz=N.z*ca+Bv.z*sa;
   tgV(B,P[i].x+dx*R[i],P[i].y+dy*R[i],P[i].z+dz*R[i],dx,dy,dz,j/n,v,ao*(i===0?.8:1),W[i],0,ph,kind);}
  rings.push(b0);}
 for(let i=0;i<m-1;i++){const a=rings[i],b=rings[i+1];for(let j=0;j<n;j++)B.i.push(a+j,a+j+1,b+j,a+j+1,b+j+1,b+j);}}
// cartoncino del rametto: base attaccata al ramo, "su" lungo il rametto; normali che guardano fuori dalla chioma (sfera o asse)
function tgCard(B,base,up,side,w,h,reg,cc,ax,wB,ph,ao){const cn=_trn.crossVectors(side,up).normalize(),b0=B.p.length/3;
 const crn=[[-.5,0,reg[0],reg[1],0],[.5,0,reg[2],reg[1],0],[.5,1,reg[2],reg[3],1],[-.5,1,reg[0],reg[3],1]];
 for(const q of crn){const x=base.x+side.x*w*q[0]+up.x*h*q[1],y=base.y+side.y*w*q[0]+up.y*h*q[1],z=base.z+side.z*w*q[0]+up.z*h*q[1];
  if(ax)_trw.set(x,0,z).multiplyScalar(1/Math.max(.02,cc.w)).add(_trv.set(0,.55,0));else _trw.set((x-cc.x)/cc.w,(y-cc.y)/(cc.w*.8),(z-cc.z)/cc.w);
  const rl=Math.min(1.2,_trw.length());_trw.normalize();const sg=cn.dot(_trw)<0?-1:1;
  _trb.copy(cn).multiplyScalar(.28*sg).addScaledVector(_trw,.72).normalize();
  const out=Math.min(1,rl),a=ao*(.5+.5*out)*(.85+.3*Math.max(0,_trw.y));tgV(B,x,y,z,_trb.x,_trb.y,_trb.z,q[2],q[3],a,wB,q[4],ph,1);}
 B.i.push(b0,b0+1,b0+2,b0,b0+2,b0+3);}
function trPerp(d,r){const a=Math.abs(d.y)<.9?_tru:new THREE.Vector3(1,0,0);const s=new THREE.Vector3().crossVectors(d,a).normalize();return s.applyAxisAngle(d,(r-.5)*Math.PI*1.2);}
// latifoglia (altezza 1): tronco, 3-5 rami principali che si aprono e risalgono, rametti, chioma di rametti di foglie
function genBroad(seed,lod,reg){const r=trRnd(seed),B=TGB(),hT=.3+.12*r(),lx=(r()-.5)*.03,lz=(r()-.5)*.03;
 const P=[],R=[],W=[];const nT=lod?4:7;for(let i=0;i<=nT;i++){const t=i/nT,y=t*(hT+.22);P.push(new THREE.Vector3(lx*t*t+Math.sin(t*5+seed)*.004,y,lz*t*t));R.push(t===0?.036:(.026-.014*t)*(1-.15*Math.max(0,t-.6)));W.push(.12*t*t);}
 tgTube(B,P,R,lod?5:8,0,W,0,.85);
 const ends=[],nP=lod?3:(4+Math.floor(r()*2)),a0=r()*6.28;
 for(let k=0;k<nP;k++){const a=a0+k/nP*6.28+(r()-.5)*.6,th=(.5+r()*.38),y0=hT*(.82+.18*r()),L=.3+.13*r();let d=new THREE.Vector3(Math.cos(a)*Math.sin(th),Math.cos(th),Math.sin(a)*Math.sin(th));
  const Q=[new THREE.Vector3(lx*.5,y0,lz*.5)],RR=[.012],WW=[.12];let p=Q[0].clone();const nq=lod?2:4;
  for(let i=1;i<=nq;i++){d=d.clone().lerp(_tru,.13).normalize();p=p.clone().addScaledVector(d,L/nq);Q.push(p);RR.push(.012-.008*i/nq);WW.push(.12+.5*i/nq);}
  tgTube(B,Q,RR,lod?3:5,0,WW,k*1.7,.8);ends.push({p:Q[nq],d,ph:k*1.7});
  if(!lod){const ns=2+Math.floor(r()*2);for(let j=0;j<ns;j++){const t=.45+.45*r(),i0=Math.max(1,Math.round(t*nq)),b=Q[i0],sd=new THREE.Vector3(Math.cos(a+(r()-.5)*2.4),.35+r()*.5,Math.sin(a+(r()-.5)*2.4)).normalize(),l=.12+.08*r();
    const e=b.clone().addScaledVector(sd,l),m=b.clone().addScaledVector(sd,l*.5).add(_trv.set(0,.015,0));tgTube(B,[b,m,e],[.0042,.0028,.0014],4,0,[.5,.7,.85],k*1.7+j,.8);ends.push({p:e,d:sd,ph:k*1.7+j});}}}
 // centro e raggio della chioma dalle punte dei rami
 const cc=new THREE.Vector4(0,0,0,0);for(const e of ends){cc.x+=e.p.x;cc.y+=e.p.y;cc.z+=e.p.z;}cc.x/=ends.length;cc.y=cc.y/ends.length-.02;cc.z/=ends.length;let rr=0;for(const e of ends)rr=Math.max(rr,Math.hypot(e.p.x-cc.x,e.p.z-cc.z));cc.w=Math.max(.2,rr+.06);
 const cs=lod?.28:.14;
 for(const e of ends){const nc=lod?1:3;for(let j=0;j<nc;j++){const up=e.d.clone().applyAxisAngle(trPerp(e.d,r()),(r()-.5)*.9).lerp(_tru,.25).normalize(),sd=trPerp(up,r()),s=cs*(.85+.3*r());tgCard(B,e.p.clone().addScaledVector(up,-s*.3),up,sd,s,s,reg,cc,false,.75,e.ph+j,1);}}
 // riempimento del guscio della chioma (sfera di Fibonacci, la parte bassa più rada)
 const nf=lod?18:58;for(let i=0;i<nf;i++){const y=1-2*(i+.5)/nf;if(y<-.55&&r()<.6)continue;const rad=Math.sqrt(1-y*y),phi=i*2.39996+seed;const dir=new THREE.Vector3(Math.cos(phi)*rad,y,Math.sin(phi)*rad),f=.72+.3*r();
  const p=new THREE.Vector3(cc.x+dir.x*cc.w*f,cc.y+dir.y*cc.w*.78*f,cc.z+dir.z*cc.w*f),up=dir.clone().multiplyScalar(.6).add(_trv.set((r()-.5)*.6,.55,(r()-.5)*.6)).normalize(),s=cs*(.9+.35*r());
  tgCard(B,p.addScaledVector(up,-s*.4),up,trPerp(up,r()),s,s,reg,cc,false,.8,phi,1);}
 return tgGeo(B);}
// conifera (altezza 1): fusto dritto fino in cima, palchi di rami che si accorciano verso l'alto, fronde di aghi lungo ogni ramo
function genCon(seed,lod){const r=trRnd(seed),B=TGB(),P=[],R=[],W=[];const lx=(r()-.5)*.02;
 for(let i=0;i<=6;i++){const t=i/6;P.push(new THREE.Vector3(lx*t*t,t,0));R.push(t===0?.024:.016*(1-t)+.0015);W.push(.1*t*t);}
 tgTube(B,P,R,lod?5:8,2,W,0,.8);
 const y0=.1+.07*r(),nW=lod?7:12,sp=(.95-y0)/nW,reg=TR_UV.cf,cc=new THREE.Vector4(0,0,0,.26);
 for(let i=0;i<nW;i++){const y=y0+i*sp+(r()-.5)*sp*.3,L=(.27*Math.pow(1-y,.85)+.035)*(.9+.2*r()),nb=y>.7?4:5,a0=r()*6.28,e=-.28+.42*y;cc.w=Math.max(.05,L);
  for(let b=0;b<nb;b++){const a=a0+b/nb*6.28+(r()-.5)*.35,d=new THREE.Vector3(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)),rt=.016*(1-y)+.0015,st=new THREE.Vector3(lx*y*y+d.x*rt,y,d.z*rt),ph=i*1.3+b;
   if(!lod&&y<.62){const m=st.clone().addScaledVector(d,L*.5).add(_trv.set(0,-.012*(1-y),0)),en=st.clone().addScaledVector(d,L*.92).add(_trv.set(0,-.03*(1-y),0));tgTube(B,[st,m,en],[.005*(1-y)+.0015,.003,.0012],3,2,[.2,.45,.7],ph,.7);}
   const up=d.clone().add(_trv.set(0,-.08*(1-y),0)).normalize(),sd=new THREE.Vector3().crossVectors(up,_tru).normalize(),w=L*.62;
   tgCard(B,st,up,sd,w,L*1.06,reg,cc,true,.55+.3*(1-y),ph,.75+.25*y);
   if(!lod&&y<.8){const sd2=sd.clone().applyAxisAngle(up,1.15);tgCard(B,st,up,sd2,w*.8,L,reg,cc,true,.55,ph+.5,.65+.25*y);}}}
 // cima
 for(const a of[0,1.57]){const sd=new THREE.Vector3(Math.cos(a),0,Math.sin(a));tgCard(B,new THREE.Vector3(lx,.9,0),_tru.clone(),sd,.07,.13,reg,new THREE.Vector4(0,0,0,.06),true,.3,9,1);}
 return tgGeo(B);}
// albero di città (metri): tronco 0..3 m, chioma tonda fino a ~8 m; diviso in "tronco" e "chioma" (si spezzano in due)
function genCityTree(seed,lod){const r=trRnd(seed),T=TGB(),C=TGB(),reg=TR_UV.bl2;
 const P=[],R=[],W=[];for(let i=0;i<=5;i++){const t=i/5;P.push(new THREE.Vector3(Math.sin(t*3+seed)*.03,t*3.5,0));R.push(i===0?.27:.19-.05*t);W.push(0);}tgTube(T,P,R,lod?6:9,0,W,0,.85);
 const ends=[],nP=lod?3:5,a0=r()*6.28;
 for(let k=0;k<nP;k++){const a=a0+k/nP*6.28+(r()-.5)*.5,th=.55+r()*.35,y0=2.7+.5*r(),L=2.5+r()*.8;let d=new THREE.Vector3(Math.cos(a)*Math.sin(th),Math.cos(th),Math.sin(a)*Math.sin(th));
  const Q=[new THREE.Vector3(0,y0,0)],RR=[.13],WW=[.05];let p=Q[0].clone();for(let i=1;i<=3;i++){d=d.clone().lerp(_tru,.15).normalize();p=p.clone().addScaledVector(d,L/3);Q.push(p);RR.push(.13-.1*i/3);WW.push(.1+.4*i/3);}
  tgTube(C,Q,RR,lod?4:6,0,WW,k*1.9,.8);ends.push({p:Q[3],d,ph:k*1.9});
  if(!lod)for(let j=0;j<2;j++){const b=Q[1+j],sd=new THREE.Vector3(Math.cos(a+(r()-.5)*2.2),.4+r()*.5,Math.sin(a+(r()-.5)*2.2)).normalize(),e=b.clone().addScaledVector(sd,1.1+r()*.6);tgTube(C,[b,e],[.05,.015],4,0,[.4,.8],k+j,.8);ends.push({p:e,d:sd,ph:k+j});}}
 const cc=new THREE.Vector4(0,5.3,0,3.1),cs=lod?2.4:1.45;
 for(const e of ends){const nc=lod?1:3;for(let j=0;j<nc;j++){const up=e.d.clone().applyAxisAngle(trPerp(e.d,r()),(r()-.5)*.9).lerp(_tru,.25).normalize(),s=cs*(.85+.3*r());tgCard(C,e.p.clone().addScaledVector(up,-s*.3),up,trPerp(up,r()),s,s,reg,cc,false,.75,e.ph+j,1);}}
 const nf=lod?20:62;for(let i=0;i<nf;i++){const y=1-2*(i+.5)/nf;if(y<-.6&&r()<.6)continue;const rad=Math.sqrt(1-y*y),phi=i*2.39996+seed,dir=new THREE.Vector3(Math.cos(phi)*rad,y,Math.sin(phi)*rad),f=.74+.28*r();
  const p=new THREE.Vector3(dir.x*cc.w*f,cc.y+dir.y*cc.w*.8*f,dir.z*cc.w*f),up=dir.clone().multiplyScalar(.6).add(_trv.set((r()-.5)*.6,.55,(r()-.5)*.6)).normalize(),s=cs*(.9+.35*r());tgCard(C,p.addScaledVector(up,-s*.4),up,trPerp(up,r()),s,s,reg,cc,false,.8,phi,1);}
 return[tgGeo(T),tgGeo(C)];}
// ---------- 3) materiale: foglie traslucide, corteccia ripetuta, vento a tre livelli, test alfa che non si sfoglia da lontano ----------
const TR_VH=`attribute vec4 aWnd;uniform float uTime;uniform float uSway;uniform float uYS;uniform vec2 uWindV;varying float vKind;`;
const TR_VB=`{
#ifdef USE_INSTANCING
float ph=instanceMatrix[3].x*.07+instanceMatrix[3].z*.05;
#else
float ph=0.;
#endif
float ws=length(uWindV);vec2 wd=uWindV/max(ws,1e-4);float yn=max(position.y,0.)*uYS;
float sw=(sin(uTime*1.1+ph)+.4*sin(uTime*2.7+ph*1.7)+.6)*uSway*yn*yn/uYS;transformed.xz+=wd*sw;
transformed+=vec3(sin(uTime*2.1+aWnd.z+ph),0.,cos(uTime*1.7+aWnd.z*1.3+ph))*aWnd.x*(.004+.012*ws)/uYS;
transformed+=objectNormal*sin(uTime*8.3+aWnd.z*7.+position.x*41.+position.z*37.)*aWnd.y*step(.5,aWnd.w)*step(aWnd.w,1.5)*(.0016+.003*ws)/uYS;
vKind=aWnd.w;}`;
const TR_FH=`varying float vKind;vec3 gSunC=vec3(0.);`;
// corteccia: la regione dell'atlante viene ripetuta con le derivate giuste (niente cuciture)
const TR_MAP=`#ifdef USE_MAP
vec4 sampledDiffuseColor;
if(vKind>1.5||vKind<.5){vec2 bs=vec2(.5,.25),bo=vec2(.5,vKind>1.5?0.:.25);vec2 lu=vUv*vec2(1.,1.);sampledDiffuseColor=texture2DGradEXT(map,bo+fract(lu)*bs,dFdx(lu)*bs,dFdy(lu)*bs);}
else sampledDiffuseColor=texture2D(map,vUv);
diffuseColor*=sampledDiffuseColor;
#endif`;
const TR_AT=`{float mip=max(0.,log2(max(length(dFdx(vUv)),length(dFdy(vUv)))*1024.));float a=diffuseColor.a*(1.+mip*.3);if(vKind>.5&&vKind<1.5){if(a<alphaTest)discard;}diffuseColor.a=1.;}`;
const TR_FN=`float faceDirection=gl_FrontFacing?1.:-1.;vec3 normal=normalize(vNormal);if(vKind<.5||vKind>1.5)normal*=faceDirection;vec3 geometryNormal=normal;`;
const TR_FT=`
#if NUM_DIR_LIGHTS > 0
if(vKind>.5&&vKind<1.5){vec3 Ld=directionalLights[0].direction;vec3 V=normalize(vViewPosition);float bl=pow(clamp(dot(-Ld,V),0.,1.),4.);
 reflectedLight.directDiffuse+=gSunC*diffuseColor.rgb*vec3(.8,1.05,.5)*(bl*.75+.06);}
#endif
if(vKind>.5&&vKind<1.5){reflectedLight.indirectSpecular*=.35;reflectedLight.directSpecular*=.6;}`;
function trMat(ys,depth){const u={uTime:U.uTime,uSway:FOREST.sway,uYS:{value:ys},uWindV:GU.uWind};
 const m=depth?new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:TRS.atlas,alphaTest:.42}):new THREE.MeshStandardMaterial({map:TRS.atlas,vertexColors:true,alphaTest:.42,side:THREE.DoubleSide,roughness:.72,metalness:0});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+TR_VH).replace('#include <begin_vertex>','#include <begin_vertex>\n'+(depth?'vec3 objectNormal=normal;\n':'')+TR_VB);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+TR_FH).replace('#include <map_fragment>',TR_MAP).replace('#include <alphatest_fragment>',TR_AT);
  if(!depth)sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>',TR_FN).replace('#include <lights_fragment_begin>',grsLights()).replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+TR_FT);};
 m.customProgramCacheKey=()=>'trs'+(depth?'d':'')+ys;m.extensions={derivatives:true,shaderTextureLOD:true};return m;}
// ---------- 4) sagome lontane ricavate dagli alberi veri (fotografate di lato all'avvio) ----------
function trBake(geo){const rt=new THREE.WebGLRenderTarget(256,512,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter});(TRS.rts||(TRS.rts=[])).push(rt);
 const mat=new THREE.ShaderMaterial({uniforms:{map:{value:TRS.atlas}},vertexShader:'attribute vec4 aWnd;varying vec2 vU;varying vec3 vC;varying float vK;void main(){vU=uv;vC=color;vK=aWnd.w;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D map;varying vec2 vU;varying vec3 vC;varying float vK;void main(){vec4 t;if(vK>.5&&vK<1.5)t=texture2D(map,vU);else t=texture2D(map,vec2(.5,vK>1.5?0.:.25)+fract(vU)*vec2(.5,.25));if(vK>.5&&vK<1.5&&t.a<.42)discard;gl_FragColor=vec4(sqrt(t.rgb*vC),1.);}',side:THREE.DoubleSide,vertexColors:true});
 const cam=new THREE.OrthographicCamera(-.5,.5,1.02,-.02,-5,5),m=new THREE.Mesh(geo,mat),keep=renderer.getRenderTarget(),cc=renderer.getClearColor(new THREE.Color()),ca=renderer.getClearAlpha(),snu=renderer.shadowMap.needsUpdate;
 try{renderer.setRenderTarget(rt);renderer.setClearColor(0x203018,0);renderer.clear();renderer.shadowMap.needsUpdate=false;renderer.render(m,cam);}finally{renderer.setRenderTarget(keep);renderer.setClearColor(cc,ca);renderer.shadowMap.needsUpdate=snu;mat.dispose();}
 return rt.texture;}
function trSprMat(tex){const m=new THREE.MeshStandardMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide,roughness:.92});
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n#ifdef USE_INSTANCING\n{vec3 wc=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz,wq=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz,of=wq-wc;float hw=max(.5*length(instanceMatrix[0].xyz),.01);of.y=0.;vec3 tc=cameraPosition-wq;tc.y=0.;tc=normalize(tc+vec3(1e-4,0.,0.));vec3 nw=normalize(of/hw*.85+vec3(0.,.55+(position.y-.45)*.9,0.)+tc*.45);transformedNormal=normalize((viewMatrix*vec4(nw,0.)).xyz);}\n#endif');
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.;vec3 normal=normalize(vNormal);vec3 geometryNormal=normal;').replace('#include <map_fragment>','#ifdef USE_MAP\nvec4 sampledDiffuseColor=texture2D(map,vUv);sampledDiffuseColor.rgb*=sampledDiffuseColor.rgb;diffuseColor*=sampledDiffuseColor;\n#endif').replace('#include <alphatest_fragment>','{float mip=max(0.,log2(max(length(dFdx(vUv)),length(dFdy(vUv)))*512.));if(diffuseColor.a*(1.+mip*.35)<alphaTest)discard;diffuseColor.a=1.;}')
   .replace('#include <common>','#include <common>\nvec3 gSunC=vec3(0.);const float vKind=1.;').replace('#include <lights_fragment_begin>',grsLights()).replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+TR_FT);};
 m.customProgramCacheKey=()=>'trspr';m.extensions={derivatives:true};return m;}
// ---------- 5) bosco: 3 forme × 2 specie × 3 livelli ----------
function abTreeInit(){if(TRS.geo)return;TRS.atlas=trAtlas();
 TRS.geo={c:[[genCon(101,0),genCon(102,0),genCon(103,0)],[genCon(101,1),genCon(102,1),genCon(103,1)]],b:[[genBroad(201,0,TR_UV.bl1),genBroad(202,0,TR_UV.bl1),genBroad(203,0,TR_UV.bl2)],[genBroad(201,1,TR_UV.bl1),genBroad(202,1,TR_UV.bl1),genBroad(203,1,TR_UV.bl2)]]};
 TRS.mats.f=trMat(1,false);TRS.mats.fd=trMat(1,true);TRS.mats.c=trMat(.125,false);TRS.mats.cd=trMat(.125,true);}
buildForest=function(){abTreeInit();const R={bassa:[45,140,650],media:[65,180,800],alta:[90,230,1000],ultra:[120,300,1250]}[S.q]||[65,180,800];FOREST.Rd=R[0];FOREST.R0=R[1];FOREST.R1=R[2];
 const mk=(geo,mat,cap,sh,dm)=>{const m=new THREE.InstancedMesh(geo,mat,cap);m.count=0;m.frustumCulled=false;m.castShadow=sh;m.receiveShadow=true;if(dm)m.customDepthMaterial=dm;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.setColorAt(0,new THREE.Color(1,1,1));m.instanceColor.setUsage(THREE.DynamicDrawUsage);scene.add(m);return m;};
 const G=TRS.geo,M=TRS.mats;
 FOREST.nd=[G.c[0].map(g=>mk(g,M.f,1200,true,M.fd)),G.b[0].map(g=>mk(g,M.f,1200,true,M.fd))];
 FOREST.nm=[G.c[1].map(g=>mk(g,M.f,3500,false)),G.b[1].map(g=>mk(g,M.f,3500,false))];
 const ig=(()=>{const a=new THREE.PlaneGeometry(1,1).translate(0,.5,0),b=a.clone().rotateY(Math.PI/2),B2=Bin();B2.add(a).add(b);const g=mergeBin(B2),N=g.attributes.normal;for(let i=0;i<N.count;i++)N.setXYZ(i,0,1,0);return g;})();
 TRS.spr=[trSprMat(trBake(G.c[0][0])),trSprMat(trBake(G.b[0][0]))];
 FOREST.i=[mk(ig,TRS.spr[0],26000,false),mk(ig,TRS.spr[1],26000,false)];
 FOREST.n=[FOREST.nd[0][0],FOREST.nd[1][0]];FOREST.all=[...FOREST.nd[0],...FOREST.nd[1],...FOREST.nm[0],...FOREST.nm[1],...FOREST.i];};
forestUpdate=function(px,pz,force){const F=FOREST;if(!F.nd)return;if(!force&&!F.dirty&&Math.hypot(px-F.cx,pz-F.cz)<40)return;let budget=force?1e9:10,miss=false;const R1=F.R1,R0=F.R0,Rd=F.Rd,cnt=new Map();
 for(let gx=Math.floor((px-R1)/64);gx<=Math.floor((px+R1)/64);gx++)for(let gz=Math.floor((pz-R1)/64);gz<=Math.floor((pz+R1)/64);gz++){const dx=Math.max(0,Math.abs(px-(gx*64+32))-32),dz=Math.max(0,Math.abs(pz-(gz*64+32))-32);if(dx*dx+dz*dz>R1*R1)continue;
  let c=F.cache.get(gx*100003+gz);if(!c){if(budget-->0)c=treeCell(gx,gz);else{miss=true;continue;}}
  for(let i=0;i<c.length;i+=7){if(c[i+3]<=0)continue;const d=Math.hypot(c[i]-px,c[i+2]-pz);if(d>R1)continue;const t=c[i+6],v=Math.floor(((c[i+5]*7.31)%1)*3)%3,M=d<Rd?F.nd[t][v]:(d<R0?F.nm[t][v]:F.i[t]);
   const n=cnt.get(M)||0;if(n>=M.instanceMatrix.count)continue;const H=c[i+3],w=c[i+4],sp=M===F.i[t];
   _dm.position.set(c[i],c[i+1],c[i+2]);_dm.rotation.set(0,c[i+5],0);if(sp)_dm.scale.set(H*w,H,H*w);else _dm.scale.set(H*w,H,H*w);_dm.updateMatrix();M.setMatrixAt(n,_dm.matrix);
   const vv=.84+.3*((c[i+5]*13.7)%1),au=t?.0:.0;M.setColorAt(n,_tc.setRGB(vv*(1+au),vv*(1.02-.05*t),vv*(.94+.04*t)));cnt.set(M,n+1);}}
 for(const M of F.all){M.count=cnt.get(M)||0;M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true;}F.dirty=miss;if(!miss){F.cx=px;F.cz=pz;}};
// ---------- 6) alberi di città e dei parchi ----------
function trCity(){const k=PK.tree;if(!k)return;abTreeInit();const [t0,c0]=genCityTree(301,0),[t1,c1]=genCityTree(301,1),M=TRS.mats;
 k.parts[0].g=t0;k.parts[1].g=c0;k.parts[0].m=M.c;k.parts[1].m=M.c;
 for(let i=0;i<2;i++){const nm=k.meshes[i],fm=k.fmeshes[i];nm.geometry=i?c0:t0;nm.material=M.c;nm.customDepthMaterial=M.cd;fm.geometry=i?c1:t1;fm.material=M.c;}}
{const bp=buildProps;buildProps=function(){bp();try{trCity();}catch(e){console.warn('alberi di città',e);}};}
