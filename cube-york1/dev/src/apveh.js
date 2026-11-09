/* ======================= PATCH Z — AEROPORTO VIVO: MEZZI DI RAMPA E VIGILI DEL FUOCO ======================= */
// Mezzi di rampa: nastri bagagli, trattorini con carrelli, autobotti, camion del catering, autobus interpista. Si muovono con un modello a
// bicicletta (raggio di sterzata minimo, accelerazioni e frenate dolci, retromarce, manovre a tre punti) lungo percorsi calcolati con A*
// su una griglia del piazzale che conosce l'ingombro vero degli aerei: fusoliera, motori, eliche, gambe del carrello e altezza da terra
// di ali e piani di coda (un trattorino passa sotto un'ala alta, un'autobotte no).
// Vigili del fuoco: tre veri camion con la fisica escono dalla caserma, raggiungono l'incendio, lo spengono con il cannone ad acqua e rientrano.

// ---------- griglie e ricerca dei percorsi ----------
function gridNew(x0,z0,x1,z1,cs){const nx=Math.ceil((x1-x0)/cs),nz=Math.ceil((z1-z0)/cs),n=nx*nz;
 return {x0,z0,cs,nx,nz,n,st:new Float32Array(n).fill(99),dy:new Float32Array(n),ds:new Int32Array(n),stamp:1,cost:new Float32Array(n).fill(1),cmin:1,
  okS:new Int32Array(n),ok:new Uint8Array(n),sk:1,g:new Float32Array(n),gs:new Int32Array(n),par:new Int32Array(n),cl:new Int32Array(n)};}
function gI(G,x,z){const i=Math.floor((x-G.x0)/G.cs),k=Math.floor((z-G.z0)/G.cs);return i<0||k<0||i>=G.nx||k>=G.nz?-1:i+k*G.nx;}
function gCX(G,i){return G.x0+(i%G.nx+.5)*G.cs;}
function gCZ(G,i){return G.z0+(Math.floor(i/G.nx)+.5)*G.cs;}
function gClr(G,i){const s=G.st[i];if(G.ds[i]!==G.stamp)return s;const d=G.dy[i];return d<s?d:s;}
function gPut(G,dyn,i,c){if(!dyn){if(c<G.st[i])G.st[i]=c;return;}if(G.ds[i]!==G.stamp){G.ds[i]=G.stamp;G.dy[i]=c;}else if(c<G.dy[i])G.dy[i]=c;}
function gRas(G,dyn,ax,az,bx,bz,f){const cs=G.cs,i0=Math.max(0,Math.floor((ax-G.x0)/cs)),i1=Math.min(G.nx-1,Math.floor((bx-G.x0)/cs)),k0=Math.max(0,Math.floor((az-G.z0)/cs)),k1=Math.min(G.nz-1,Math.floor((bz-G.z0)/cs));
 for(let k=k0;k<=k1;k++){const z=G.z0+(k+.5)*cs;for(let i=i0;i<=i1;i++){const c=f(G.x0+(i+.5)*cs,z);if(c<99)gPut(G,dyn,i+k*G.nx,c);}}}
function gBox(G,dyn,cx,cz,yaw,hx,hz,c){const s=Math.sin(yaw),co=Math.cos(yaw),e=G.cs*.45,ex=Math.abs(co)*hx+Math.abs(s)*hz+e,ez=Math.abs(s)*hx+Math.abs(co)*hz+e;
 gRas(G,dyn,cx-ex,cz-ez,cx+ex,cz+ez,(x,z)=>{const dx=x-cx,dz=z-cz;return Math.abs(dx*co-dz*s)<hx+e&&Math.abs(dx*s+dz*co)<hz+e?c:99;});}
function gCirc(G,dyn,cx,cz,r,c){const e=r+G.cs*.45;gRas(G,dyn,cx-e,cz-e,cx+e,cz+e,(x,z)=>(x-cx)*(x-cx)+(z-cz)*(z-cz)<e*e?c:99);}
function segDist(px,pz,ax,az,bx,bz){const ux=bx-ax,uz=bz-az,l2=ux*ux+uz*uz||1e-6,t=clamp(((px-ax)*ux+(pz-az)*uz)/l2,0,1);return Math.hypot(px-ax-ux*t,pz-az-uz*t);}
function gSeg(G,dyn,ax,az,bx,bz,hw,c){const e=hw+G.cs*.45;gRas(G,dyn,Math.min(ax,bx)-e,Math.min(az,bz)-e,Math.max(ax,bx)+e,Math.max(az,bz)+e,(x,z)=>segDist(x,z,ax,az,bx,bz)<e?c:99);}
// una cella è percorribile se lei e le otto vicine lasciano almeno h metri di spazio sopra il suolo
function gOk(G,i,h){if(G.okS[i]===G.sk)return G.ok[i];const nx=G.nx,x=i%nx,k=(i-x)/nx;let r=1;
 for(let dk=-1;dk<=1&&r;dk++){const kk=k+dk;if(kk<0||kk>=G.nz){r=0;break;}const b=kk*nx;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=nx||gClr(G,b+xx)<h){r=0;break;}}}
 G.okS[i]=G.sk;G.ok[i]=r;return r;}
function gNear(G,i,h,R){if(i<0)return -1;if(gOk(G,i,h))return i;const nx=G.nx,x=i%nx,k=(i-x)/nx;
 for(let r=1;r<=R;r++){let best=-1,bd=1e9;for(let dk=-r;dk<=r;dk++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dk))!==r)continue;const xx=x+dx,kk=k+dk;if(xx<0||kk<0||xx>=nx||kk>=G.nz)continue;const j=xx+kk*nx;if(!gOk(G,j,h))continue;const d=dx*dx+dk*dk;if(d<bd){bd=d;best=j;}}if(best>=0)return best;}return -1;}
function gLos(G,ax,az,bx,bz,h){const n=Math.ceil(Math.hypot(bx-ax,bz-az)/(G.cs*.5));for(let q=1;q<=n;q++){const t=q/n,i=gI(G,ax+(bx-ax)*t,az+(bz-az)*t);if(i<0||!gOk(G,i,h))return false;}return true;}
const GH={a:[],f:[]},GD=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function ghPush(i,f){const a=GH.a,F=GH.f;let k=a.length;a.push(i);F.push(f);while(k>0){const p=(k-1)>>1;if(F[p]<=f)break;a[k]=a[p];F[k]=F[p];k=p;}a[k]=i;F[k]=f;}
function ghPop(){const a=GH.a,F=GH.f,top=a[0],li=a.pop(),lf=F.pop(),n=a.length;if(n){let k=0;for(;;){let c=2*k+1;if(c>=n)break;if(c+1<n&&F[c+1]<F[c])c++;if(F[c]>=lf)break;a[k]=a[c];F[k]=F[c];k=c;}a[k]=li;F[k]=lf;}return top;}
// A* a 8 direzioni (senza tagliare gli angoli), poi "filo teso": restano solo i punti necessari per non uscire dalle celle libere
function gPath(G,sx,sz,tx,tz,h,maxN){G.sk++;const sk=G.sk,nx=G.nx,cs=G.cs,cm=G.cmin;
 const s=gNear(G,gI(G,sx,sz),h,8),t=gNear(G,gI(G,tx,tz),h,10);if(s<0||t<0)return null;
 const txc=t%nx,tkc=(t-txc)/nx,hf=j=>{const dx=Math.abs(j%nx-txc),dk=Math.abs(Math.floor(j/nx)-tkc);return 1.5*cs*cm*(Math.max(dx,dk)+.4142*Math.min(dx,dk));};
 GH.a.length=0;GH.f.length=0;G.g[s]=0;G.gs[s]=sk;G.par[s]=-1;ghPush(s,hf(s));let n=0,found=false;
 while(GH.a.length){const i=ghPop();if(G.cl[i]===sk)continue;G.cl[i]=sk;if(i===t){found=true;break;}if(++n>(maxN||90000))break;
  const x=i%nx,k=(i-x)/nx,gi=G.g[i];
  for(let d=0;d<8;d++){const dx=GD[d][0],dk=GD[d][1],xx=x+dx,kk=k+dk;if(xx<0||kk<0||xx>=nx||kk>=G.nz)continue;const j=xx+kk*nx;if(G.cl[j]===sk||!gOk(G,j,h))continue;
   if(dx&&dk&&(!gOk(G,x+dx+k*nx,h)||!gOk(G,x+kk*nx,h)))continue;
   const ng=gi+(dx&&dk?1.4142:1)*cs*G.cost[j];if(G.gs[j]===sk&&ng>=G.g[j])continue;G.gs[j]=sk;G.g[j]=ng;G.par[j]=i;ghPush(j,ng+hf(j));}}
 if(!found)return null;const C=[];for(let i=t;i>=0;i=G.par[i])C.push(i);C.reverse();
 const P=[[sx,sz]];let ax=sx,az=sz,j=0;
 while(j<C.length-1){let m=j+1;while(m+1<C.length&&gLos(G,ax,az,gCX(G,C[m+1]),gCZ(G,C[m+1]),h))m++;ax=gCX(G,C[m]);az=gCZ(G,C[m]);P.push([ax,az]);j=m;}
 const e=P[P.length-1];if(Math.hypot(e[0]-tx,e[1]-tz)>.3)P.push([tx,tz]);return P;}
function avWrap(a){return Math.atan2(Math.sin(a),Math.cos(a));}

// ---------- ingombro di un aereo: spazio libero sopra ogni punto del piazzale (0 = pieno fino a terra) ----------
function tabAt(T,x,k){if(x<=T[0][0])return T[0][k];for(let i=1;i<T.length;i++)if(x<=T[i][0]){const a=T[i-1],b=T[i],t=(x-a[0])/((b[0]-a[0])||1);return a[k]+(b[k]-a[k])*t;}return T[T.length-1][k];}
function planeClr(C,lx,lz){const ax=Math.abs(lx),gH=C.gearH;let c=99;
 if(ax<C.R+.5&&lz>-C.L/2-.4&&lz<C.L/2+.4)return 0;
 if(Math.abs(ax-C.main[0])<1.4&&Math.abs(lz-C.main[1])<2.2)return 0;
 for(const e of C.eng){if(Math.abs(ax-e.x)<e.r+.5&&lz>e.z-e.len/2-.5&&lz<e.z+e.len/2+.5)c=Math.min(c,Math.max(0,gH+e.y-e.r));
  if(C.prop&&Math.abs(ax-e.x)<2.2&&Math.abs(lz-(e.z-e.len/2))<.8)c=Math.min(c,Math.max(0,gH+e.y-2.2));}
 const W=C.wing,wt=W[W.length-1][0];if(ax<=wt+.4){const zl=tabAt(W,ax,2),ch=tabAt(W,ax,3);if(lz>zl-.4&&lz<zl+ch+.6)c=Math.min(c,gH+tabAt(W,ax,1)-tabAt(W,ax,4)*ch*.55-.25);}
 const T=C.stab,tt=T[T.length-1][0];if(ax<=tt+.4){const zl=tabAt(T,ax,2),ch=tabAt(T,ax,3);if(lz>zl-.4&&lz<zl+ch+.4)c=Math.min(c,gH+tabAt(T,ax,1)-.3);}
 return Math.max(0,c);}
function gPlane(G,v){const C=v.C,R=v.R,ext=Math.max(C.span,C.L)/2+3,co=R[0],s=R[2];
 gRas(G,true,v.px-ext,v.pz-ext,v.px+ext,v.pz+ext,(x,z)=>{const dx=x-v.px,dz=z-v.pz,lx=dx*co-dz*s,lz=dx*s+dz*co;
  // la cella è larga: si prende il valore peggiore fra il centro e quattro punti vicini
  const e=G.cs*.45;return Math.min(planeClr(C,lx,lz),planeClr(C,lx+e,lz),planeClr(C,lx-e,lz),planeClr(C,lx,lz+e),planeClr(C,lx,lz-e));});}

// ---------- mezzi: dimensioni, prestazioni, luci ----------
// h = altezza da terra con cui si controllano ali e piani di coda; hw/len = mezza larghezza e lunghezza; Rmin = raggio di sterzata minimo
const AVK={
 tug:{len:2.7,hw:.78,h:2.35,Rmin:3.6,vmax:6.5,mass:2600,hy:.8,
  lamps:[[-.55,.72,-1.36,0],[.55,.72,-1.36,0],[-.62,.55,1.33,1],[.62,.55,1.33,1],[0,2.3,.42,2]]},
 belt:{len:7.4,hw:.88,h:1.85,Rmin:6,vmax:5.5,mass:3800,hy:.65,
  lamps:[[-.6,.7,-3.64,0],[.6,.7,-3.64,0],[-.6,.7,3.64,1],[.6,.7,3.64,1],[-.38,2.12,2.75,2]]},
 hyd:{len:8.1,hw:1.18,h:2.5,Rmin:7,vmax:6.5,mass:9500,hy:1.15,
  lamps:[[-.8,.95,-3.98,0],[.8,.95,-3.98,0],[-.95,.9,4.02,1],[.95,.9,4.02,1],[0,2.36,-3.0,2]]},
 fuel:{len:10.4,hw:1.25,h:3.4,Rmin:9,vmax:6,mass:19000,hy:1.6,
  lamps:[[-.85,.95,-5.18,0],[.85,.95,-5.18,0],[-.95,.9,5.1,1],[.95,.9,5.1,1],[0,2.52,-3.7,2]]},
 cat:{len:9.5,hw:1.25,h:3.55,Rmin:8,vmax:6,mass:12500,hy:1.4,
  lamps:[[-.8,.95,-4.72,0],[.8,.95,-4.72,0],[-.95,.9,4.3,1],[.95,.9,4.3,1],[0,2.38,-3.65,2]]},
 bus:{len:12.7,hw:1.47,h:3.25,Rmin:10.5,vmax:7,mass:14500,hy:1.5,
  lamps:[[-1.05,.85,-6.34,0],[1.05,.85,-6.34,0],[-1.15,.95,6.34,1],[1.15,.95,6.34,1],[0,3.24,1.2,2]]}};
const AV={list:[],tasks:[],G:null,F:null,ready:false,tick:0,M:{},geo:null,mat:null,matB:null,lampN:0,o:new THREE.Object3D(),beepT:0,lampT:0};
function avGeos(){if(AV.geo)return AV.geo;const G={},K=C3,ye=K(0xe8a31c),dk=K(0x232425),gy=K(0x6d7276),wh=K(0xe9e9e4),gl=K(0x16222c),bl=K(0x1d4e9a),rd=K(0xb8261c),st=K(0x9aa0a6);
 const whl=(B,x,y,z,r,w)=>{cCyl(B,r,w,x,y,z,K(0x151515),0,Math.PI/2,14);cCyl(B,r*.56,w+.02,x,y,z,K(0x8a8d90),0,Math.PI/2,10);};
 // trattorino portabagagli: cofano, sedile, roll-bar con tettuccio, gancio di traino
 {const B=Bin();cBox(B,1.5,.5,2.6,0,.6,0,ye);cBox(B,1.42,.44,1.0,0,1.06,-.75,ye);cBox(B,1.2,.05,.7,0,1.29,-.8,dk);cBox(B,.62,.42,.55,0,1.07,.5,dk);cBox(B,.62,.5,.1,0,1.4,.79,dk);
  for(const s of[-1,1]){cBox(B,.06,1.36,.06,s*.68,1.52,-.18,dk);cBox(B,.06,1.36,.06,s*.68,1.52,1.05,dk);}cBox(B,1.46,.07,1.42,0,2.22,.43,ye);cBox(B,.5,.06,.35,0,1.32,-.12,dk);
  cBox(B,1.58,.18,.16,0,.45,-1.34,dk);cBox(B,.36,.2,.42,0,.45,1.42,dk);for(const z of[-.82,.85])for(const s of[-1,1])whl(B,s*.72,.33,z,.33,.26);G.tug=mergeBin(B);}
 // carrello portabagagli: un telone chiuso, l'altro arrotolato, valigie e borse dentro
 {const B=Bin(),cur=K(0x24539a);cBox(B,1.5,.12,2.9,0,.5,0,gy);cBox(B,1.5,.08,2.95,0,1.86,0,gy);for(const z of[-1.42,1.42])for(const s of[-1,1])cBox(B,.06,1.32,.06,s*.72,1.18,z,dk);
  cBox(B,.04,1.2,2.84,-.74,1.2,0,cur);cCyl(B,.12,2.84,.74,1.72,0,cur,Math.PI/2,0,8);
  const bags=[0x3b2f2f,0x8a1c1c,0x1d3557,0x2a2a2a,0x6b4f2a,0x355e3b,0x4a4a52,0x7a5a1a];for(let i=0;i<8;i++){const w=.42+(i%3)*.08,h=.48+((i*7)%3)*.1,d=.62+(i%2)*.12;cBox(B,w,h,d,(i%2?-.36:.36),.56+h/2+(i>5?.55:0),-1.0+Math.floor((i%6)/2)*.95,K(bags[i]));}
  cBox(B,.07,.07,1.15,0,.42,-1.95,dk);cBox(B,.25,.1,.12,0,.42,-2.5,dk);for(const z of[-1.05,1.05])for(const s of[-1,1])whl(B,s*.62,.22,z,.22,.16);G.cart=mergeBin(B);}
 // nastro trasportatore: telaio basso, cabina in coda a sinistra; il nastro è un pezzo a parte che si alza fino alla stiva
 {const B=Bin();cBox(B,1.7,.5,7.2,0,.62,0,wh);cBox(B,1.72,.12,7.22,0,.38,0,dk);cBox(B,.95,1.3,1.25,-.38,1.35,2.75,wh);cBox(B,.9,.7,.05,-.38,1.6,2.12,gl);cBox(B,.9,.06,1.3,-.38,2.03,2.75,dk);cBox(B,.55,.5,.6,.45,1.12,2.9,dk);
  cBox(B,1.6,.16,.18,0,.5,-3.62,dk);cBox(B,1.6,.16,.18,0,.5,3.62,dk);for(const z of[-2.6,2.6])for(const s of[-1,1])whl(B,s*.8,.34,z,.34,.26);G.belt=mergeBin(B);
  const N=Bin();cBox(N,1.0,.1,7.4,0,.12,-3.7,K(0x1b1b1b));for(const s of[-1,1]){cBox(N,.08,.32,7.4,s*.55,.22,-3.7,wh);cBox(N,.05,.05,7.4,s*.55,.62,-3.7,ye);for(let k=0;k<6;k++)cBox(N,.04,.4,.04,s*.55,.42,-.6-k*1.3,ye);}
  for(let k=0;k<12;k++)cCyl(N,.06,1.0,0,.03,-.3-k*.62,st,0,Math.PI/2,6);cBox(N,.9,.45,.4,0,-.22,-.4,dk);cBox(N,.14,1.1,.14,0,-.5,-2.6,dk);G.conv=mergeBin(N);}
 // autobotte del carburante: cabina, cisterna con fascia rossa, passerella con corrimano, armadio del naspo e scaletta
 {const B=Bin();cBox(B,2.45,1.75,2.1,0,1.58,-4.1,wh);cBox(B,2.3,.8,.05,0,2.0,-5.16,gl);for(const s of[-1,1])cBox(B,.05,.65,1.2,s*1.23,2.0,-4.25,gl);cBox(B,2.5,.25,.2,0,.72,-5.18,dk);cBox(B,2.4,.32,9.8,0,.85,-.1,dk);
  B.add(cGeo(new THREE.CylinderGeometry(1.15,1.15,6.6,24).rotateX(Math.PI/2),wh),0,2.08,.6);cCyl(B,1.165,.45,0,2.08,1.6,rd,Math.PI/2,0,24);cCyl(B,1.165,.12,0,2.08,-.4,rd,Math.PI/2,0,24);
  cBox(B,.8,.05,5.6,0,3.27,.6,st);for(const s of[-1,1]){cBox(B,.04,.04,5.6,s*.42,3.62,.6,ye);for(let k=0;k<5;k++)cBox(B,.04,.36,.04,s*.42,3.44,-1.8+k*1.2,ye);}
  cBox(B,2.2,1.25,1.15,0,1.6,4.45,st);cCyl(B,.5,1.7,0,1.65,4.45,dk,0,Math.PI/2,14);cBox(B,.5,1.6,.06,.8,1.7,5.04,dk);for(let k=0;k<6;k++)cBox(B,.5,.05,.2,.95,.6+k*.3,5.06,st);
  for(const z of[-4.1,2.7,4.0])for(const s of[-1,1])whl(B,s*1.08,.5,z,.5,.38);G.fuel=mergeBin(B);}
 // erogatore da idrante (piazzole con pontile): niente cisterna, filtri, contalitri, due naspi e piattaforma che sale sotto l'ala
 {const B=Bin();cBox(B,2.3,1.55,1.9,0,1.5,-3.0,wh);cBox(B,2.32,.22,1.92,0,.82,-3.0,rd);cBox(B,2.15,.72,.05,0,1.9,-3.96,gl);for(const s of[-1,1])cBox(B,.05,.6,1.0,s*1.16,1.9,-3.1,gl);cBox(B,2.35,.22,.2,0,.66,-4.0,dk);
  cBox(B,2.3,.3,7.4,0,.78,.2,dk);cBox(B,2.2,.08,5.2,0,.96,1.3,st);cCyl(B,.42,1.3,-.6,1.65,-1.0,K(0xd8d8d2),0,0,16);cBox(B,1.0,1.1,1.6,.55,1.55,-.9,wh);cBox(B,.9,.5,.04,.55,1.7,-1.71,dk);
  for(const z of[.75,1.95])cCyl(B,.52,1.1,0,1.55,z,dk,0,Math.PI/2,16);
  for(const z of[-3.0,2.6])for(const s of[-1,1])whl(B,s*1.04,.48,z,.48,.36);G.hyd=mergeBin(B);
  const Q=Bin();cBox(Q,1.7,.08,1.4,0,0,0,st);for(const s of[-1,1]){cBox(Q,.04,.04,1.4,s*.83,.95,0,ye);cBox(Q,.04,.95,.04,s*.83,.48,-.68,ye);cBox(Q,.04,.95,.04,s*.83,.48,.68,ye);}cBox(Q,1.7,.04,.04,0,.95,-.68,ye);cBox(Q,.3,1.25,.3,0,-.62,0,dk);G.hydP=mergeBin(Q);}
 // catering a pantografo: base, cassone che sale e scorre in avanti sopra la cabina, aste delle forbici (una per istanza)
 {const B=Bin();cBox(B,2.4,1.6,2.0,0,1.5,-3.65,wh);cBox(B,2.25,.75,.05,0,1.9,-4.66,gl);for(const s of[-1,1])cBox(B,.05,.6,1.1,s*1.21,1.9,-3.8,gl);cBox(B,2.45,.22,.2,0,.68,-4.7,dk);
  cBox(B,2.4,.38,8.1,0,.86,.2,dk);cBox(B,2.3,.12,5.4,0,1.11,1.3,st);for(const z of[-3.55,2.9])for(const s of[-1,1])whl(B,s*1.07,.48,z,.48,.36);G.catB=mergeBin(B);
  const X=Bin();cBox(X,2.45,2.3,5.2,0,1.15,0,wh);cBox(X,2.47,.32,5.22,0,.5,0,bl);cBox(X,2.0,.1,1.2,0,.05,-3.2,st);for(const s of[-1,1]){for(let k=0;k<3;k++)cBox(X,.04,.95,.04,s*.97,.55,-2.7-k*.48,ye);cBox(X,.04,.04,1.2,s*.97,1.02,-3.2,ye);}
  cBox(X,1.3,2.0,.05,0,1.05,-2.61,K(0xd5d5d0));G.catBox=mergeBin(X);const Y=Bin();cBox(Y,.12,.12,1,0,0,0,st);G.bar=mergeBin(Y);}
 // autobus interpista: pianale basso, vetrate continue, tre porte sul lato destro, condizionatore sul tetto
 {const B=Bin();B.add(cGeo(rboxGeo(2.9,2.5,12.6,.3,2),wh),0,1.62,0);cBox(B,2.92,.75,12.62,0,.72,0,bl);cBox(B,2.94,1.15,11.6,0,2.08,.3,gl);cBox(B,2.5,1.25,.06,0,2.0,-6.31,gl);cBox(B,2.4,.9,.06,0,2.2,6.31,gl);
  for(let i=0;i<3;i++)cBox(B,.07,2.1,1.5,1.46,1.42,-4.2+i*4.2,K(0x2c3e50));cBox(B,1.7,.28,3.2,0,3.0,1.2,st);cBox(B,2.6,.22,.08,0,2.82,-6.33,K(0xf2c200));
  for(const z of[-4.6,4.6])for(const s of[-1,1])whl(B,s*1.26,.5,z,.5,.34);G.bus=mergeBin(B);}
 G.lamp=new THREE.BoxGeometry(1,1,1);
 {const B=Bin(),vest=K(0xf2a516),sk=K(0xc68642),dk2=K(0x1d2a3a);cBox(B,.42,.5,.26,0,.25,0,vest);cBox(B,.44,.06,.27,0,.32,0,K(0xd8d8d0));cBox(B,.2,.1,.2,0,.55,0,sk);B.add(cGeo(new THREE.SphereGeometry(.115,10,8),sk),0,.68,0);
  B.add(cGeo(new THREE.SphereGeometry(.125,10,6,0,TAU,0,1.45),dk2),0,.7,0);for(const s of[-1,1])cBox(B,.1,.1,.42,s*.2,.3,-.2,vest,.35,0,0);cBox(B,.4,.2,.42,0,-.06,-.14,dk2);G.drv=mergeBin(B);}
 {const B=Bin(),or=K(0xff5a0a),wt=K(0xf0f0f0);B.add(cGeo(new THREE.CylinderGeometry(.03,.17,.7,12).translate(0,.39,0),or));B.add(cGeo(new THREE.CylinderGeometry(.11,.135,.12,12).translate(0,.36,0),wt));cBox(B,.4,.04,.4,0,.02,0,or);G.cone=mergeBin(B);
  const C=Bin();cBox(C,.16,.16,.5,0,.08,0,K(0xe8c21a));G.chock=mergeBin(C);}
 AV.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.2});AV.matB=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:.1,color:new THREE.Color(.11,.1,.09)});
 return AV.geo=G;}

// ---------- griglia del piazzale di CYI (celle da 2 m) ----------
function avGridBuild(){const A=AP.CYI,ap=A.apron,G=gridNew(ap.x0-4,ap.z0,ap.x1+6,ap.z1+2,2);
 for(let i=0;i<G.n;i++){const x=gCX(G,i),z=gCZ(G,i);if(x<ap.x0+.5||x>ap.x1-.5||z<ap.z0+.5||z>ap.z1-.5)G.st[i]=0;
  // si preferiscono le strade di servizio dipinte (davanti agli edifici e dietro le code), si evita la linea di rullaggio del piazzale
  G.cost[i]=Math.abs(z-A.taxilane)<13?1.7:(z<ap.z0+14||Math.abs(z-1515.5)<2.5)?.9:1;}
 G.cmin=.9;for(let i=1;i<10;i++)gCirc(G,false,2700+i*125,1584,.9,0);AV.G=G;}
function avIn(G,x,z,m){return x>G.x0-m&&z>G.z0-m&&x<G.x0+G.nx*G.cs+m&&z<G.z0+G.nz*G.cs+m;}
// livello dinamico: aerei fermi, pontili, oggetti di piazzale, mezzi fermi, auto ferme
function avDyn(G,self,h){G.stamp++;
 for(const v of LN.list){if(v.dead||!avIn(G,v.px,v.pz,60))continue;if(v.py-groundH(v.px,v.pz)-v.C.gearH>3)continue;if(Math.hypot(v.vx,v.vz)>1.2)continue;gPlane(G,v);}
 const T=AP.CYI.term,zf=T.z0+T.d;for(const J of AP.jb){if(!avIn(G,J.rx,J.rz,10))continue;gCirc(G,true,J.rx,J.rz,2.8,0);gBox(G,true,J.rx,(J.rz+zf)/2,0,1.7,(J.rz-zf)/2+.6,0);
  if(J.cab){const c=J.cab.position;gSeg(G,true,J.rx,J.rz,c.x,c.z,1.7,0);gCirc(G,true,c.x,c.z,2.2,0);}if(J.wh)gCirc(G,true,J.wh.position.x,J.wh.position.z,1,0);}
 for(const k of ['tug','stairs','abus','fuelt'])if(PK[k]){const he=PK[k].he;for(const it of PK[k].items)if(it.alive&&avIn(G,it.x,it.z,4))gBox(G,true,it.x,it.z,it.yaw,he[0],he[2],0);}
 if(AV.cones)for(const c of AV.cones)gCirc(G,true,c[0],c[1],.3,0);
 for(const u of AV.list){if(u===self||u.s>.3)continue;if(!u.alive){if(u.body&&!u.body.dead)gCirc(G,true,u.body.px,u.body.pz,u.K.len*.5,0);continue;}gBox(G,true,u.x,u.z,u.yaw,u.K.hw,u.K.len/2,0);for(const c of u.carts)gBox(G,true,c.x,c.z,c.yaw,.75,1.5,0);}
 for(const A of AF.list){const b=A.b;if(b&&!b.dead&&avIn(G,b.px,b.pz,6)&&Math.hypot(b.vx,b.vz)<1)gCirc(G,true,b.px,b.pz,4,0);}
 for(const b of dynCars){if(b.dead||!avIn(G,b.px,b.pz,4)||b.car&&b.car.ai&&AF.list.some(A=>A.b===b))continue;if(Math.hypot(b.vx,b.vz)<1)gCirc(G,true,b.px,b.pz,Math.max(b.hx,b.hz)+.3,0);}}

// ---------- posizioni di servizio intorno a un aereo fermo ----------
// coordinate locali dell'aereo: x verso destra, z verso la coda (il muso guarda −z); yaw locale del mezzo (0 = muso come l'aereo)
// app = metri di rettilineo con cui il mezzo entra in posizione; rev = esce in retromarcia sullo stesso rettilineo
function wingClr(C,x){const W=C.wing,ch=tabAt(W,x,3);return C.gearH+tabAt(W,x,1)-tabAt(W,x,4)*ch*.55;}
// piazzole con pontile (jb): l'erogatore entra sotto l'ala destra, il catering va alla porta posteriore sinistra;
// piazzole remote: autobotte davanti all'ala destra, catering alla porta anteriore destra, autobus a sinistra davanti
function avSpotL(C,kind,jb){const R=C.R,E=C.eng[0],ex=E.x+E.r+(C.prop?1.4:0),door=C.door[0],sill=Math.sqrt(Math.max(.1,R*R-C.floor*C.floor)),cargo=C.L*.17;
 if(kind==='fuel'){const x=ex+6.2;return {x,z:tabAt(C.wing,x-3,2)-1.6,yaw:Math.PI/2,app:13,rev:true};}
 // erogatore sotto l'ala sinistra, più all'esterno del catering posteriore sinistro, dove l'ala è abbastanza alta
 if(kind==='hyd'){let x=Math.max(ex+2.3,sill+.15+5.7+4.75+1.7);while(x<C.span/2-2&&wingClr(C,x)<3.2)x+=.5;const zl=tabAt(C.wing,x,2),ch=tabAt(C.wing,x,3);return {x:-x,z:zl+ch*.4,yaw:0,app:16,rev:true,lift:clamp(wingClr(C,x)-1.25-.98-.2,0,1.2)};}
 if(kind==='cat'){const lift=Math.max(.3,C.gearH+C.floor-.05-1.17);return jb?{x:-(sill+.15+5.7),z:C.L/2-6.5,yaw:-Math.PI/2,app:11,rev:true,lift}:{x:sill+.15+5.7,z:door+.3,yaw:Math.PI/2,app:11,rev:true,lift};}
 if(kind==='belt'){const top=C.gearH-.75*R+.1;return {x:R+.3+3.7,z:cargo,yaw:Math.PI/2,app:10,rev:true,up:Math.asin(clamp((top-1)/7.4,.07,.5))};}
 if(kind==='tug'){const x=R+9.9,z=cargo+3.5;return {x,z,yaw:0,app:16,rev:false,exit:[[x+5,z-4],[x+11,z+1],[x+12,z+12]]};}
 if(kind==='bus')return {x:-(R+11.5),z:door-4.5,yaw:Math.PI,app:14,rev:true};return null;}
function avSpot(pl,kind,jb){const L=avSpotL(pl.C,kind,jb);if(!L)return null;if(kind!=='bus')L.app=Math.max(L.app,AVK[kind].Rmin*1.6);const R=pl.R,W=(lx,lz)=>[pl.px+lx*R[0]+lz*R[2],pl.pz+lx*R[6]+lz*R[8]];
 const p=W(L.x,L.z),fy=Math.atan2(R[2],R[8])+L.yaw,fx=-Math.sin(fy),fz=-Math.cos(fy);
 return {x:p[0],z:p[1],yaw:fy,pre:[p[0]-fx*L.app,p[1]-fz*L.app],rev:L.rev,exit:L.exit?L.exit.map(q=>W(q[0],q[1])):null,lift:L.lift||0,up:L.up||.07};}

// ---------- parco mezzi: deposito sul piazzale est, davanti al terminal merci ----------
const AV_SEAT={tug:[0,.86,.5],belt:[-.38,1.2,2.8],hyd:[-.55,1.2,-2.9],fuel:[-.6,1.25,-4.0],cat:[-.6,1.2,-3.55],bus:[-.85,1.15,-5.3]};
const AV_SLOTS=[['tug',2612,1462],['tug',2621,1462],['belt',2631,1459],['belt',2639,1459],['hyd',2650,1460],['hyd',2660,1460],['cat',2671,1460],
 ['tug',3548,1462],['tug',3557,1462],['belt',3567,1459],['belt',3575,1459],['fuel',3586,1460],['fuel',3596,1460],['cat',3607,1460],['bus',3619,1462],['bus',3631,1462]];
function avCartsHome(v){let hx=v.x+Math.sin(v.yaw)*1.62,hz=v.z+Math.cos(v.yaw)*1.62;for(const c of v.carts){c.yaw=v.yaw;c.x=hx+Math.sin(v.yaw)*2.5;c.z=hz+Math.cos(v.yaw)*2.5;hx=c.x+Math.sin(v.yaw)*1.5;hz=c.z+Math.cos(v.yaw)*1.5;}}
function avInit(){const G=avGeos(),cnt={};AV.list.length=0;AV.tasks.length=0;AV.lampN=0;
 AV_SLOTS.forEach(([k,x,z],n)=>{const K=AVK[k],i=cnt[k]||0;cnt[k]=i+1;const v={id:n,kind:k,K,x,z,yaw:Math.PI,s:0,legs:[],pi:0,st:'idle',task:null,spot:null,home:{x,z,yaw:Math.PI},ii:i,carts:[],lift:0,up:.07,
   alive:true,hp:k==='fuel'?.55:.4,blk:0,blkT:0,ghost:0,rpT:0,t:0,mv:true,li0:AV.lampN,body:null,fail:0};AV.lampN+=K.lamps.length;
  if(k==='tug')for(let c=0;c<3;c++)v.carts.push({x,z,yaw:Math.PI,ii:i*3+c});avCartsHome(v);AV.list.push(v);});
 if(!AV.M.tug){const sph=new THREE.Sphere(new THREE.Vector3(3215,6,1505),720),mk=(geo,n,mat,sh)=>{const m=new THREE.InstancedMesh(shareGeo(geo,sph),mat||AV.mat,Math.max(1,n));m.count=n;m.castShadow=sh!==false;m.receiveShadow=sh!==false;m.frustumCulled=true;scene.add(m);lodReg(m,520,3215,6,1505,720);return m;};
  const M=AV.M;M.tug=mk(G.tug,cnt.tug);M.cart=mk(G.cart,cnt.tug*3);M.belt=mk(G.belt,cnt.belt);M.conv=mk(G.conv,cnt.belt);M.fuel=mk(G.fuel,cnt.fuel);M.catB=mk(G.catB,cnt.cat);M.catBox=mk(G.catBox,cnt.cat);M.bar=mk(G.bar,cnt.cat*4);M.bus=mk(G.bus,cnt.bus);M.hyd=mk(G.hyd,cnt.hyd);M.hydP=mk(G.hydP,cnt.hyd);
  M.drv=mk(G.drv,AV.list.length,null,false);M.cone=mk(G.cone,72,null,false);M.chock=mk(G.chock,24,null,false);AV.cones=[];const z0=new THREE.Matrix4().makeScale(0,0,0);for(let i=0;i<72;i++)M.cone.setMatrixAt(i,z0);for(let i=0;i<24;i++)M.chock.setMatrixAt(i,z0);
  M.lamp=mk(G.lamp,AV.lampN,new THREE.MeshBasicMaterial({color:0xffffff}),false);for(let i=0;i<AV.lampN;i++)M.lamp.setColorAt(i,_tc.setRGB(.2,.2,.2));}
 for(const v of AV.list)avDraw(v);avLamps();AV.ready=true;}
// ---------- disegno: una InstancedMesh per tipo (pochissime chiamate di disegno) ----------
function avDraw(v){const O=AV.o,M=AV.M,y=groundH(v.x,v.z),c=Math.cos(v.yaw),s=Math.sin(v.yaw),W=(lx,ly,lz)=>O.position.set(v.x+lx*c+lz*s,y+ly,v.z-lx*s+lz*c);
 O.scale.set(1,1,1);O.position.set(v.x,y,v.z);O.rotation.set(0,v.yaw,0,'YXZ');O.updateMatrix();const main=v.kind==='cat'?M.catB:M[v.kind];main.setMatrixAt(v.ii,O.matrix);main.instanceMatrix.needsUpdate=true;
 if(v.kind==='belt'){W(0,1.0,3.3);O.rotation.set(v.up,v.yaw,0,'YXZ');O.updateMatrix();M.conv.setMatrixAt(v.ii,O.matrix);M.conv.instanceMatrix.needsUpdate=true;}
 if(v.kind==='cat'){const f=clamp(v.lift/1.2,0,1),zb=.9-2.6*f,yb=1.17+v.lift;W(0,yb,zb);O.rotation.set(0,v.yaw,0,'YXZ');O.updateMatrix();M.catBox.setMatrixAt(v.ii,O.matrix);M.catBox.instanceMatrix.needsUpdate=true;
  let q=v.ii*4;for(const sx of[-1,1])for(const [za,zz] of [[2.6,zb-2.4],[-1.6,zb+1.7]]){const ya=1.2,yy=yb-.02,dz=zz-za,dy=yy-ya,L=Math.hypot(dz,dy);W(sx*1.0,(ya+yy)/2,(za+zz)/2);O.rotation.set(Math.atan2(-dy,dz),v.yaw,0,'YXZ');O.scale.set(1,1,L);O.updateMatrix();M.bar.setMatrixAt(q++,O.matrix);}
  O.scale.set(1,1,1);M.bar.instanceMatrix.needsUpdate=true;}
 if(v.kind==='hyd'){W(0,1.25+v.lift,3.3);O.rotation.set(0,v.yaw,0,'YXZ');O.updateMatrix();M.hydP.setMatrixAt(v.ii,O.matrix);M.hydP.instanceMatrix.needsUpdate=true;}
 for(const ct of v.carts){O.position.set(ct.x,groundH(ct.x,ct.z),ct.z);O.rotation.set(0,ct.yaw,0,'YXZ');O.updateMatrix();M.cart.setMatrixAt(ct.ii,O.matrix);}if(v.carts.length)M.cart.instanceMatrix.needsUpdate=true;
 if(M.drv){const S=AV_SEAT[v.kind];if(v.st==='idle'||!v.alive)O.scale.set(0,0,0);W(S[0],S[1],S[2]);O.rotation.set(0,v.yaw,0,'YXZ');O.updateMatrix();M.drv.setMatrixAt(v.id,O.matrix);M.drv.instanceMatrix.needsUpdate=true;O.scale.set(1,1,1);}
 const L=v.K.lamps;for(let j=0;j<L.length;j++){const l=L[j];W(l[0],l[1],l[2]);O.rotation.set(0,v.yaw,0,'YXZ');if(l[3]===2)O.scale.set(.2,.16,.2);else if(l[3]===0)O.scale.set(.26,.14,.06);else O.scale.set(.22,.12,.06);O.updateMatrix();M.lamp.setMatrixAt(v.li0+j,O.matrix);}
 O.scale.set(1,1,1);M.lamp.instanceMatrix.needsUpdate=true;}
function avHideInst(v){const M=AV.M,z=new THREE.Matrix4().makeScale(0,0,0);(v.kind==='cat'?M.catB:M[v.kind]).setMatrixAt(v.ii,z);(v.kind==='cat'?M.catB:M[v.kind]).instanceMatrix.needsUpdate=true;
 if(v.kind==='belt'){M.conv.setMatrixAt(v.ii,z);M.conv.instanceMatrix.needsUpdate=true;}if(v.kind==='hyd'){M.hydP.setMatrixAt(v.ii,z);M.hydP.instanceMatrix.needsUpdate=true;}if(v.kind==='cat'){M.catBox.setMatrixAt(v.ii,z);for(let q=0;q<4;q++)M.bar.setMatrixAt(v.ii*4+q,z);M.catBox.instanceMatrix.needsUpdate=true;M.bar.instanceMatrix.needsUpdate=true;}
 for(const c of v.carts)M.cart.setMatrixAt(c.ii,z);M.cart.instanceMatrix.needsUpdate=true;for(let j=0;j<v.K.lamps.length;j++)M.lamp.setMatrixAt(v.li0+j,z);M.lamp.instanceMatrix.needsUpdate=true;}
// fari accesi quando lavorano (più forti di notte), luci di posizione rosse, lampeggiante ambra
function avLamps(){const M=AV.M.lamp,n=U.uNight.value,t=U.uTime.value,col=_tc;
 for(const v of AV.list){const L=v.K.lamps,act=v.alive&&v.st!=='idle';for(let j=0;j<L.length;j++){const ty=L[j][3];
  if(!v.alive)col.setRGB(.03,.03,.03);else if(ty===0){const k=act?.55+n*1.9:.12+n*.08;col.setRGB(k*1.05,k,k*.88);}else if(ty===1){const k=act?.3+n*1.3:.07;col.setRGB(k,k*.06,k*.04);}
  else{const on=act&&((t*1.55+v.id*.37)%1)<.3;col.setRGB(on?3.2:.24,on?1.5:.11,on?.1:.02);}M.setColorAt(v.li0+j,col);}}
 if(M.instanceColor)M.instanceColor.needsUpdate=true;}

// ---------- guida: modello a bicicletta che insegue un punto sul percorso (pure pursuit) ----------
function avLeg(pts,dir,vmax,goal,tail){const P=[pts[0]];for(let i=1;i<pts.length;i++){const q=P[P.length-1],d=Math.hypot(pts[i][0]-q[0],pts[i][1]-q[1]);const last=i===pts.length-1;if(last&&d<2.5&&P.length>1)P[P.length-1]=pts[i];else if(d>.8||last)P.push(pts[i]);}if(P.length<2)P.push([P[0][0]+.01,P[0][1]]);
 const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return {pts:P,dir,vmax:vmax||0,cum,goal:goal||null,tail:tail||null};}
function avLookYaw(P,x,z,d){let px=x,pz=z,left=d;for(let i=1;i<P.length;i++){const l=Math.hypot(P[i][0]-px,P[i][1]-pz);if(l>=left){const f=left/(l||1);px+=(P[i][0]-px)*f;pz+=(P[i][1]-pz)*f;break;}left-=l;px=P[i][0];pz=P[i][1];}
 return Math.atan2(-(px-x),-(pz-z));}
// manovra a tre punti: retromarcia in curva e poi avanti in curva finché il muso non guarda dove serve; prova i due versi e controlla lo spazio
function avKturn(v,G,h,want){const R=v.K.Rmin*1.08,dy=avWrap(want-v.yaw);
 for(const sg of [Math.sign(dy)||1,-(Math.sign(dy)||1)]){const tot=sg>0?(dy>0?dy:dy+TAU):(dy<0?dy:dy-TAU);if(Math.abs(tot)>4.2)continue;
  const a1=tot*.55,a2=tot-a1;let x=v.x,z=v.z,y=v.yaw,ok=true;const r1=[[x,z]],r2=[];
  const n1=Math.max(2,Math.ceil(Math.abs(a1)*R/.5)),d1=Math.abs(a1)*R/n1;for(let q=0;q<n1&&ok;q++){x+=Math.sin(y)*d1;z+=Math.cos(y)*d1;y+=Math.sign(a1)*d1/R;const i=gI(G,x,z);if(i<0||!gOk(G,i,h))ok=false;if(q%2===1||q===n1-1)r1.push([x,z]);}
  if(!ok)continue;r2.push([x,z]);
  const n2=Math.max(2,Math.ceil(Math.abs(a2)*R/.5)),d2=Math.abs(a2)*R/n2;for(let q=0;q<n2&&ok;q++){x-=Math.sin(y)*d2;z-=Math.cos(y)*d2;y+=Math.sign(a2)*d2/R;const i=gI(G,x,z);if(i<0||!gOk(G,i,h))ok=false;if(q%2===1||q===n2-1)r2.push([x,z]);}
  if(!ok)continue;return {legs:[avLeg(r1,-1,2),avLeg(r2,1,3)],x,z,yaw:y};}
 return null;}
// percorso dal punto in cui si trova il mezzo fino a (tx,tz), poi il tratto finale "tail" (entrata in posizione)
function avRoute(v,tx,tz,tail){const G=AV.G,h=v.K.h+.35;avDyn(G,v,h);G.sk++;let P=gPath(G,v.x,v.z,tx,tz,h);if(!P)return null;const legs=[];
 const want=avLookYaw(P,v.x,v.z,12);if(Math.abs(avWrap(want-v.yaw))>1.75&&!v.carts.length){G.sk++;const kt=avKturn(v,G,h,want);if(kt){legs.push(...kt.legs);P=gPath(G,kt.x,kt.z,tx,tz,h);if(!P)return null;}}
 legs.push(avLeg(P.concat(tail||[]),1,0,[tx,tz],tail||null));return legs;}
// c'è qualcosa davanti? (altri mezzi e carrelli, il giocatore, auto, aerei che si muovono verso di noi)
// rettangoli orientati che si sovrappongono? (assi separatori)
function obbHit(cx,cz,fx,fz,hl,hw,ox,oz,oy,ol,ow){const gx=-Math.sin(oy),gz=-Math.cos(oy),dx=ox-cx,dz=oz-cz;
 for(const [ax,az] of [[fx,fz],[-fz,fx],[gx,gz],[-gz,gx]]){const ra=Math.abs(fx*ax+fz*az)*hl+Math.abs(-fz*ax+fx*az)*hw,rb=Math.abs(gx*ax+gz*az)*ol+Math.abs(-gz*ax+gx*az)*ow;if(Math.abs(dx*ax+dz*az)>ra+rb)return false;}return true;}
function avAhead(v,dir){if(v.ghost>0)return null;const K=v.K,fx=-Math.sin(v.yaw)*dir,fz=-Math.cos(v.yaw)*dir,L0=K.len/2,L1=L0+1.8+v.s*v.s/5+v.s*.45,hl=(L1-L0)/2+.2,cx=v.x+fx*(L0+L1)/2,cz=v.z+fz*(L0+L1)/2,W=K.hw+.25;
 const hit=(x,z,oy,ol,ow)=>obbHit(cx,cz,fx,fz,hl,W,x,z,oy,ol,ow);
 for(const u of AV.list){if(u===v||!u.alive)continue;if(Math.abs(u.x-v.x)>45||Math.abs(u.z-v.z)>45)continue;let h=hit(u.x,u.z,u.yaw,u.K.len/2,u.K.hw);if(!h)for(const c of u.carts)if(hit(c.x,c.z,c.yaw,1.45,.75)){h=true;break;}
  if(h){if(u.blkBy===v&&u.blk>.5&&u.id<v.id)continue;return u;}}
 const P=player;if(P.veh){if(!P.veh.cv&&hit(P.veh.px,P.veh.pz,0,2.2,2.2))return P;}else if(!P.fly&&hit(P.x,P.z,0,.45,.45))return P;
 for(const b of dynCars){if(b.dead||Math.abs(b.px-v.x)>30||Math.abs(b.pz-v.z)>30)continue;if(hit(b.px,b.pz,Math.atan2(b.R[2],b.R[8]),b.hz,b.hx))return b;}
 // aerei che si muovono: si prevede dove saranno fra 0 e 4,5 secondi e dove saremo noi, nell'ingombro vero (apertura alare e lunghezza)
 for(const u of LN.list){if(u.dead)continue;const sp=Math.hypot(u.vx,u.vz);if(sp<.35||u.py-groundH(u.px,u.pz)-u.C.gearH>6)continue;if(Math.hypot(u.px-v.x,u.pz-v.z)>u.C.span+u.C.L+40)continue;const R=u.R,ax=u.C.span/2+K.hw+3,az=u.C.L/2+K.len/2+3,vs=Math.max(v.s,2);
  for(const t of[0,1.5,3,4.5]){const qx=v.x+fx*vs*t-u.px-u.vx*t,qz=v.z+fz*vs*t-u.pz-u.vz*t;if(Math.abs(qx*R[0]+qz*R[6])<ax&&Math.abs(qx*R[2]+qz*R[8])<az)return u;}}
 return null;}
function avFollow(v,dt){const L=v.legs[0];if(!L)return true;const P=L.pts,dir=L.dir,K=v.K;
 let i=v.pi;while(i<P.length-2){const a=P[i],b=P[i+1],ux=b[0]-a[0],uz=b[1]-a[1],l2=ux*ux+uz*uz||1;if(((v.x-a[0])*ux+(v.z-a[1])*uz)/l2<1)break;i++;}v.pi=i;
 const a=P[i],b=P[i+1],ux=b[0]-a[0],uz=b[1]-a[1],sl=Math.hypot(ux,uz)||1e-3,t=clamp(((v.x-a[0])*ux+(v.z-a[1])*uz)/(sl*sl),0,1),last=L.cum[L.cum.length-1],rem=(1-t)*sl+last-L.cum[i+1];
 const Ld=dir>0?Math.max(2.6,v.s*.9+2.2):2.4;let tx,tz,need=Ld,seg=i,s0=(1-t)*sl;
 if(need<=s0){tx=a[0]+ux*(t+need/sl);tz=a[1]+uz*(t+need/sl);}else{need-=s0;seg++;while(seg<P.length-1){const c=P[seg],d=P[seg+1],l=L.cum[seg+1]-L.cum[seg];if(need<=l){const f=need/(l||1);tx=c[0]+(d[0]-c[0])*f;tz=c[1]+(d[1]-c[1])*f;break;}need-=l;seg++;}}
 if(tx===undefined){const e=P[P.length-1],p=P[P.length-2],ex=e[0]-p[0],ez=e[1]-p[1],el=Math.hypot(ex,ez)||1;tx=e[0]+ex/el*(need);tz=e[1]+ez/el*(need);}
 const hx=-Math.sin(v.yaw)*dir,hz=-Math.cos(v.yaw)*dir,dx=tx-v.x,dz=tz-v.z,dd=Math.hypot(dx,dz)||1e-3,al=Math.atan2(hx*dz-hz*dx,hx*dx+hz*dz);
 const km=1/K.Rmin;let k=Math.abs(al)>Math.PI/2?Math.sign(al)*km:clamp(2*Math.sin(al)/Math.max(dd,1.2),-km,km);if(rem<.5)k=0;
 const dE=Math.hypot(P[P.length-1][0]-v.x,P[P.length-1][1]-v.z);let want=Math.min(L.vmax||K.vmax,K.vmax,Math.sqrt(1.3/Math.max(Math.abs(k),.015)),Math.sqrt(2*1.1*Math.max(0,Math.min(rem,dE+1)-.1))+.04);if(Math.abs(al)>1.2)want=Math.min(want,1.3);if(dir<0)want=Math.min(want,2.2);
 const blk=avAhead(v,dir);if(blk){want=0;v.blk+=dt;v.blkBy=blk;}else{v.blk=0;v.blkBy=null;}
 v.s+=clamp(want-v.s,-2.8*dt,1.25*dt);if(v.s<0)v.s=0;
 v.yaw-=k*v.s*dt;v.x+=hx*v.s*dt;v.z+=hz*v.s*dt;v.mv=v.mv||v.s>.001;
 // carrelli: ognuno segue il gancio di quello davanti (geometria vera del rimorchio)
 if(v.carts.length&&v.s>.001){let gx=v.x+Math.sin(v.yaw)*1.62,gz=v.z+Math.cos(v.yaw)*1.62;for(const c of v.carts){const ex=gx-c.x,ez=gz-c.z,l=Math.hypot(ex,ez)||1;c.yaw=Math.atan2(-ex,-ez);c.x=gx-ex/l*2.5;c.z=gz-ez/l*2.5;gx=c.x+Math.sin(c.yaw)*1.5;gz=c.z+Math.cos(c.yaw)*1.5;}}
 // bloccati a lungo: si ricalcola il percorso intorno all'ostacolo, e alla fine si passa comunque (niente stalli eterni)
 if(!blk){v.rpN=0;if(L.best===undefined||rem<L.best-1){L.best=rem;L.bt=0;}else L.bt+=dt;
  if(L.bt>9){L.bt=0;L.best=rem;if(dir>0&&L.goal){const nl=avRoute(v,L.goal[0],L.goal[1],L.tail);if(nl){v.legs.splice(0,1,...nl);v.pi=0;return false;}}else{v.legs.shift();v.pi=0;return !v.legs.length;}}}
 if(v.blk>5&&dir>0&&L.goal&&!(blk&&blk.C)&&v.rpT<=0){v.rpT=6;v.rpN=(v.rpN||0)+1;const nl=v.rpN<3&&avRoute(v,L.goal[0],L.goal[1],L.tail);if(nl){v.legs.splice(0,1,...nl);v.pi=0;v.blk=0;}else{v.ghost=3;v.blk=0;v.rpN=0;}}
 if(v.blk>12&&!(blk&&blk.C)){v.ghost=3;v.blk=0;}
 const ep=P[P.length-1],dEnd=Math.hypot(ep[0]-v.x,ep[1]-v.z),beh=(ep[0]-v.x)*hx+(ep[1]-v.z)*hz<0;
 if((rem<.3||dEnd<.35||(beh&&dEnd<2))&&v.s<.6){v.legs.shift();v.pi=0;v.s=0;return !v.legs.length;}return false;}

// ---------- servizi: un compito per mezzo, con orari legati alla partenza del volo ----------
function avTurn(st,pl){const now=FL.clock,C=pl.C,dep=pl.ai.depT,T=(kind,t0,dur,min)=>AV.tasks.push({kind,st,pl,t0:now+t0,dur,min,v:null,done:false,fail:0});
 if(!st.jb)T('bus',1,rand(40,55),35);T('belt',5,rand(150,190),80);T('tug',16,rand(120,160),70);T(st.jb?'hyd':'fuel',22,rand(90,130),70);if(C.L>30)T('cat',30,rand(70,95),60);
 if(!st.jb&&dep!==undefined&&dep-now>190)AV.tasks.push({kind:'bus',st,pl,t0:dep-105,dur:55,min:45,v:null,done:false,fail:0});}
function avCones(){const M=AV.M,O=AV.o;if(!M.cone)return;let ic=0,ih=0;const put=(x,z,y,mesh,i,yaw)=>{O.position.set(x,groundH(x,z),z);O.rotation.set(0,yaw||0,0,'YXZ');O.scale.set(1,1,1);O.updateMatrix();mesh.setMatrixAt(i,O.matrix);};AV.cones.length=0;
 for(const st of AP.CYI.stands){const v=st.occ,a=v&&!v.dead?v.ai:null;if(!a||!(a.phase==='park'&&a.t>8||a.phase==='board'&&a.t<10))continue;const C=v.C,R=v.R,W=(lx,lz)=>[v.px+lx*R[0]+lz*R[2],v.pz+lx*R[6]+lz*R[8]],yw=Math.atan2(R[2],R[8]),E=C.eng[0],tip=C.wing[C.wing.length-1];
  const pts=[[0,-C.L/2-1.6],[0,C.L/2+1.6],[tip[0]-.3,tip[2]+tip[3]*.5],[-(tip[0]-.3),tip[2]+tip[3]*.5],[E.x,E.z-E.len/2-1.3],[-E.x,E.z-E.len/2-1.3]];
  for(const q of pts){if(ic>=72)break;const p=W(q[0],q[1]);put(p[0],p[1],0,M.cone,ic++,yw);AV.cones.push(p);}
  for(const s of[-1,1]){if(ih>=24)break;const p=W(s*.42,C.nose[0]);put(p[0],p[1],0,M.chock,ih++,yw);}}
 const z0=new THREE.Matrix4().makeScale(0,0,0);for(let i=ic;i<72;i++)M.cone.setMatrixAt(i,z0);for(let i=ih;i<24;i++)M.chock.setMatrixAt(i,z0);M.cone.instanceMatrix.needsUpdate=true;M.chock.instanceMatrix.needsUpdate=true;}
function avPlan(){const A=AP.CYI,now=FL.clock;avCones();
 for(const st of A.stands){const pl=st.occ,a=pl&&!pl.dead?pl.ai:null;if(!a||(a.phase!=='park'&&a.phase!=='board')){st.svcPl=null;continue;}if(st.svcPl!==pl&&a.phase==='park'&&a.t>4){st.svcPl=pl;avTurn(st,pl);}}
 const far=Math.hypot(camera.position.x-3215,camera.position.z-1500)>1800;
 let planned=0;for(const T of AV.tasks){if(T.v||T.done||now<T.t0)continue;const pl=T.pl,a=pl.ai;if(pl.dead||!a||a.phase!=='park'||a.st!==T.st){T.done=true;continue;}
  const left=(a.depT!==undefined?a.depT:now+400)-now-25;if(left<T.min){T.done=true;continue;}
  if(T.kind==='tug'){const B=AV.tasks.find(q=>q.kind==='belt'&&q.st===T.st&&q.pl===pl&&!q.done);if(B&&!(B.v&&B.v.st==='serve')&&now-T.t0<120)continue;}
  let v=null,bd=1e9;for(const u of AV.list){if(!u.alive||u.kind!==T.kind||(u.st!=='idle'&&u.st!=='back'))continue;const d=Math.hypot(u.x-T.st.x,u.z-T.st.z)+(u.st==='back'?40:0);if(d<bd){bd=d;v=u;}}if(!v)continue;if(planned>=2)break;planned++;
  const sp=avSpot(pl,T.kind,!!T.st.jb);if(!sp){T.done=true;continue;}
  if(far){T.v=v;T.dur=Math.min(T.dur,left);v.task=T;v.spot=sp;v.legs=[];v.st='serve';v.t=0;v.x=sp.x;v.z=sp.z;v.yaw=sp.yaw;v.s=0;avCartsHome(v);if(v.kind==='belt')v.up=sp.up;if(v.kind==='cat'||v.kind==='hyd')v.lift=sp.lift;avDraw(v);planned--;continue;}
  const L=avRoute(v,sp.pre[0],sp.pre[1],[[sp.x,sp.z]]);if(!L){if(++T.fail>5)T.done=true;continue;}
  T.v=v;T.dur=Math.min(T.dur,left);v.task=T;v.spot=sp;v.legs=L;v.pi=0;v.st='go';v.t=0;}
 AV.tasks=AV.tasks.filter(T=>!T.done);}
// fine del servizio: retromarcia sul rettilineo d'ingresso (o curva in avanti per i trenini), poi a casa
function avLeave(v){const sp=v.spot;v.legs=[];if(sp&&sp.rev)v.legs.push(avLeg([[v.x,v.z],sp.pre],-1,2.2));else if(sp&&sp.exit)v.legs.push(avLeg([[v.x,v.z],...sp.exit],1,3.5));
 if(v.task)v.task.done=true;v.task=null;v.pi=0;v.st='leave';v.t=0;}
// rientro nel deposito: lungo la corsia, poi un quarto di cerchio (raggio poco più del minimo) e 10 m dritti nella piazzola
function avHome(v){const h=v.home,R=v.K.Rmin*1.25,fx=-Math.sin(h.yaw),fz=-Math.cos(h.yaw),rx=-fz,rz=fx,sd=((v.x-h.x)*rx+(v.z-h.z)*rz)>0?1:-1,ax=h.x-fx*10,az=h.z-fz*10,cx=ax+sd*rx*R,cz=az+sd*rz*R,arc=[];
 for(let k=0;k<=6;k++){const t=k/6*Math.PI/2,c=Math.cos(t),s2=Math.sin(t);arc.push([cx+R*(-fx*c-sd*rx*s2),cz+R*(-fz*c-sd*rz*s2)]);}
 const S=arc.shift(),L=avRoute(v,S[0],S[1],arc.concat([[ax,az],[h.x,h.z]]));if(!L)return false;v.legs=L;v.pi=0;v.st='back';return true;}
function avStep(dt){if(!AV.ready)return;AV.tick-=dt;if(AV.tick<=0){AV.tick=1;avPlan();}const cp=camera.position,near=Math.hypot(cp.x-3215,cp.z-1500)<2400,far=!near;
 for(const v of AV.list){if(!v.alive)continue;v.mv=false;if(v.ghost>0)v.ghost-=dt;if(v.rpT>0)v.rpT-=dt;
  if(far&&v.st==='go'){const sp=v.spot;v.legs=[];v.x=sp.x;v.z=sp.z;v.yaw=sp.yaw;v.s=0;avCartsHome(v);v.st='serve';v.t=0;v.mv=true;}
  if(far&&(v.st==='leave'||v.st==='home?'||v.st==='back'||v.st==='settle')){v.legs=[];v.x=v.home.x;v.z=v.home.z;v.yaw=v.home.yaw;v.s=0;v.up=.07;v.lift=0;avCartsHome(v);v.st='idle';v.mv=true;}
  if(v.st==='go'){if(avFollow(v,dt)){v.st='serve';v.t=0;}}
  else if(v.st==='serve'){v.t+=dt;const T=v.task,pl=T&&T.pl,gone=!pl||pl.dead||!pl.ai||pl.ai.phase!=='park',end=gone||!T||v.t>T.dur;
   if(v.kind==='belt'){const g=end||v.t>T.dur-5?.07:v.spot.up;if(Math.abs(g-v.up)>.001){v.up+=clamp(g-v.up,-dt*.1,dt*.1);v.mv=true;}}
   if(v.kind==='cat'||v.kind==='hyd'){const g=end||v.t>T.dur-(v.kind==='cat'?12:7)?0:v.spot.lift;if(Math.abs(g-v.lift)>.001){v.lift+=clamp(g-v.lift,-dt*.32,dt*.28);v.mv=true;}}
   if(end&&(v.kind!=='belt'||v.up<.075)&&v.lift<.01)avLeave(v);}
  else if(v.st==='leave'){if(avFollow(v,dt)){v.t=0;v.st='home?';}}
  else if(v.st==='home?'){v.t-=dt;if(v.t<=0){if(avHome(v))v.fail=0;else{v.t=2;if(++v.fail>6&&Math.hypot(cp.x-v.x,cp.z-v.z)>350){v.x=v.home.x;v.z=v.home.z;v.yaw=v.home.yaw;avCartsHome(v);v.st='idle';v.mv=true;}}}}
  else if(v.st==='back'){const hd=Math.hypot(v.x-v.home.x,v.z-v.home.z);if(avFollow(v,dt)||(hd<3.5&&Math.abs(avWrap(v.yaw-v.home.yaw))<.7&&v.s<2.5)){v.st='settle';v.t=0;v.legs=[];}}
  else if(v.st==='settle'){v.t+=dt;const k=Math.min(1,dt*1.6),h=v.home;v.x+=(h.x-v.x)*k;v.z+=(h.z-v.z)*k;v.yaw+=avWrap(h.yaw-v.yaw)*k;v.s=0;if(v.carts.length){let gx=v.x+Math.sin(v.yaw)*1.62,gz=v.z+Math.cos(v.yaw)*1.62;for(const c of v.carts){const ex=gx-c.x,ez=gz-c.z,l=Math.hypot(ex,ez)||1;c.yaw+=avWrap(Math.atan2(-ex,-ez)-c.yaw)*k;c.x=gx-ex/l*2.5;c.z=gz-ez/l*2.5;gx=c.x+Math.sin(c.yaw)*1.5;gz=c.z+Math.cos(c.yaw)*1.5;}}v.mv=true;if(v.t>2.2){v.st='idle';v.x=h.x;v.z=h.z;v.yaw=h.yaw;avCartsHome(v);}}
  if(v.mv)v.dirty=true;if(v.dirty&&near){avDraw(v);v.dirty=false;}
  // segnalatore acustico di retromarcia
  if(v.legs[0]&&v.legs[0].dir<0&&v.s>.2&&AU.ok&&near){v.bp=(v.bp||0)-dt;if(v.bp<=0){v.bp=1;const d=Math.hypot(cp.x-v.x,cp.y-groundH(v.x,v.z),cp.z-v.z);if(d<90)sfx({x:v.x,y:groundH(v.x,v.z)+1.5,z:v.z,src:'osc',type:'square',f0:1180,filter:'lowpass',ff0:2600,g:.12,a:.005,d:.32,ref:10});}}}
 AV.lampT-=dt;if(AV.lampT<=0&&near){AV.lampT=.1;avLamps();}
 avImpacts();}

// ---------- rapporti con gli aerei ----------
// il push-back aspetta che i mezzi se ne siano andati (al massimo 75 s); un aereo che rulla si ferma se un mezzo è sul suo percorso
{const pc0=flPushClear;flPushClear=function(v){if(!pc0(v))return false;if(!AV.ready||v.ai.t>75)return true;const st=v.ai.st,tl=AP[v.ai.ap]?AP[v.ai.ap].taxilane:1e9;
 for(const u of AV.list){if(!u.alive)continue;if(u.task&&u.task.pl===v)return false;if(st&&u.st!=='idle'&&Math.abs(u.x-st.x)<v.C.span/2+6&&u.z>v.pz-v.C.L*.3&&u.z<tl+22)return false;}return true;};}
function avPlaneHold(v){const a=v.ai,sp=Math.hypot(v.vx,v.vz);if(sp>.2){a.mdx=v.vx/sp;a.mdz=v.vz/sp;}if(a.mdx===undefined)return false;const C=v.C,W=C.span/2+2;
 for(const u of AV.list){if(!u.alive)continue;const qx=u.x-v.px,qz=u.z-v.pz,al=qx*a.mdx+qz*a.mdz,lt=Math.abs(qz*a.mdx-qx*a.mdz);if(al>-C.L*.3&&al<C.L/2+22&&lt<W+u.K.hw)return true;
  for(const c of u.carts){const cx=c.x-v.px,cz=c.z-v.pz,ca=cx*a.mdx+cz*a.mdz;if(ca>-C.L*.3&&ca<C.L/2+22&&Math.abs(cz*a.mdx-cx*a.mdz)<W+.8)return true;}}return false;}
// aereo con il motore in fiamme appena atterrato: si ferma fuori pista e aspetta i pompieri (il fuoco non si spegne da solo)
{const fa0=flAIStep;flAIStep=function(v,dt){const a=v.ai,J=typeof AF!=='undefined'?AF.job:null,emg=a&&!v.dead&&J&&J.kind==='emg'&&J.v===v&&!J.ext;
 if(emg&&(a.phase==='exit'||a.phase==='taxi')){a.emgH=(a.emgH||0)+dt;if(a.emgH<150){v.vx=v.vz=0;a.spd=0;v.th=0;v.eng=1;
   if(!J.fire){J.fire=1;const R=v.R,E=v.C.eng[0];addFire(v.px+R[0]*E.x+R[2]*E.z,groundH(v.px,v.pz)+v.C.gearH+E.y,v.pz+R[6]*E.x+R[8]*E.z,2.4,240);}return;}}
 if(a&&!v.dead&&AV.ready&&(a.phase==='taxi'||a.phase==='exit'||a.phase==='push')&&avPlaneHold(v)){a.hold=(a.hold||0)+dt;if(a.hold<25){v.vx=v.vz=0;a.spd=0;return;}}else if(a)a.hold=0;
 const r=fa0(v,dt);if(emg&&v.eng===0&&!v.dead&&(a.phase==='rollout'||a.phase==='exit'))v.eng=1;return r;};}

// ---------- i mezzi sono solidi: il giocatore ci sbatte contro, i corpi fisici rimbalzano ----------
function avBoxC(x,y,z,cx,cz,yaw,hx,hz,H,o){const c=Math.cos(yaw),s=Math.sin(yaw),dx=x-cx,dz=z-cz,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>hx||Math.abs(lz)>hz)return false;const ly=y-groundH(cx,cz);if(ly<.12||ly>H)return false;
 let best=H-ly,nx=0,ny=1,nz=0,d;if((d=hx-Math.abs(lx))<best){best=d;const g=lx<0?-1:1;nx=g*c;nz=-g*s;ny=0;}if((d=hz-Math.abs(lz))<best){best=d;const g=lz<0?-1:1;nx=g*s;nz=g*c;ny=0;}
 o.nx=nx;o.ny=ny;o.nz=nz;o.d=best;o.b=null;o.ci=-1;return true;}
function avContact(x,y,z,o){if(!AV.ready||x<2570||x>3870||z<1380||z>1610||(typeof ACB!=='undefined'&&ACB.off))return false;
 for(const v of AV.list){if(!v.alive)continue;const K=v.K,dx=x-v.x,dz=z-v.z,r=K.len*.5+1;if(dx*dx+dz*dz<r*r&&avBoxC(x,y,z,v.x,v.z,v.yaw,K.hw,K.len/2,K.hy*2,o))return true;
  for(const c of v.carts)if(Math.abs(x-c.x)<2.2&&Math.abs(z-c.z)<2.2&&avBoxC(x,y,z,c.x,c.z,c.yaw,.75,1.45,1.9,o))return true;}
 for(const D of AF.doors){const h=3.9*(1-D.open);if(h>.3&&Math.abs(x-D.x)<5.2&&Math.abs(z-1424)<.35&&y>0&&y<h+.1){o.nx=0;o.ny=0;o.nz=z<1424?-1:1;o.d=.35-Math.abs(z-1424);o.b=null;o.ci=-1;return true;}}
 return false;}
{const pc2=pointContact;pointContact=function(x,y,z,o){return pc2(x,y,z,o)||avContact(x,y,z,o);};}
{const sb2=solidBoxes;solidBoxes=function(x0,y0,z0,x1,y1,z1,out){sb2(x0,y0,z0,x1,y1,z1,out);if(!AV.ready||x1<2570||x0>3870||z1<1380||z0>1610)return out;
 const add=(cx,cz,yaw,hx,hz,H)=>{const c=Math.abs(Math.cos(yaw)),s=Math.abs(Math.sin(yaw)),n=Math.max(1,Math.ceil(hz/1.6)),seg=hz/n,gy=groundH(cx,cz),fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  for(let k=0;k<n;k++){const off=-hz+seg*(2*k+1),px=cx+fx*off,pz=cz+fz*off,ex=c*hx+s*seg,ez=s*hx+c*seg;if(px+ex<x0||px-ex>x1||pz+ez<z0||pz-ez>z1||gy+H<y0||gy+.12>y1)continue;out.push(px-ex,gy+.12,pz-ez,px+ex,gy+H,pz+ez);}};
 const mx=(x0+x1)/2,mz=(z0+z1)/2;for(const v of AV.list){if(!v.alive||Math.abs(v.x-mx)>v.K.len+20||Math.abs(v.z-mz)>v.K.len+20)continue;add(v.x,v.z,v.yaw,v.K.hw,v.K.len/2,v.K.hy*2);for(const c of v.carts)add(c.x,c.z,c.yaw,.75,1.45,1.9);}
 for(const D of AF.doors){const h=3.9*(1-D.open);if(h>.3&&D.x+5.2>x0&&D.x-5.2<x1&&1424.35>z0&&1423.65<z1)out.push(D.x-5.2,0,1423.65,D.x+5.2,h,1424.35);}
 return out;};}

// ---------- distruzione: un'esplosione o un urto forte trasforma il mezzo in un rottame con la fisica ----------
function avHit(x,y,z,R,P){for(const v of AV.list){if(!v.alive)continue;const d=Math.hypot(v.x-x,(groundH(v.x,v.z)+1.2)-y,v.z-z);if(d>R+5)continue;v.hp-=P*.6*(1-d/(R+5));if(v.hp<=0)avKill(v,x,y,z,P);}}
function avKill(v,x,y,z,P){if(!v.alive)return;v.alive=false;v.st='dead';v.legs=[];avHideInst(v);if(v.task){v.task.done=true;v.task=null;}const K=v.K,G=AV.geo,mat=P>0?AV.matB:AV.mat;
 const mk=(geo,px,pz,yaw,hx,hy,hz,m,extra)=>{const g=new THREE.Group(),me=new THREE.Mesh(geo,mat);me.position.y=-hy;me.castShadow=me.receiveShadow=true;g.add(me);if(extra)extra(g,hy);scene.add(g);
  const b=newBody(1,px,groundH(px,pz)+hy+.04,pz,hx,hy,hz,m);setYaw(b,yaw);b.obj=g;b.snd='metal';b.rest=.12;b.mu=.65;
  if(P>0){const dx=px-x,dz=pz-z,dd=Math.hypot(dx,dz)||1,k=clamp(P*9/(dd*.25+1),0,24)*Math.sqrt(3000/(m+3000));b.vx=dx/dd*k;b.vz=dz/dd*k;b.vy=k*.45;b.wx=rand(-.6,.6)*k*.1;b.wy=rand(-.5,.5)*k*.1;b.wz=rand(-.6,.6)*k*.1;}syncObj(b);return b;};
 v.body=mk(v.kind==='cat'?G.catB:G[v.kind],v.x,v.z,v.yaw,K.hw,K.hy,K.len/2,K.mass,(g,hy)=>{
  if(v.kind==='belt'){const n=new THREE.Mesh(G.conv,mat);n.position.set(0,1-hy,3.3);n.rotation.x=v.up;n.castShadow=true;g.add(n);}
  if(v.kind==='cat'){const f=clamp(v.lift/1.2,0,1),bx=new THREE.Mesh(G.catBox,mat);bx.position.set(0,1.17+v.lift-hy,.9-2.6*f);bx.castShadow=true;g.add(bx);}
  if(v.kind==='hyd'){const q=new THREE.Mesh(G.hydP,mat);q.position.set(0,1.25+v.lift-hy,3.3);q.castShadow=true;g.add(q);}});
 for(const c of v.carts)mk(G.cart,c.x,c.z,c.yaw,.75,.95,1.45,650);
 if(P>0){const gy=groundH(v.x,v.z);addFire(v.x,gy+1.3,v.z,v.kind==='fuel'?4.5:v.kind==='bus'?3:2.2,rand(70,140));
  if(v.kind==='fuel')setTimeout(()=>{explode(v.x,gy+2.2,v.z,15,2);addFire(v.x+rand(-4,4),gy+.4,v.z+rand(-4,4),5,rand(120,200));},450);}}
// auto lanciate contro un mezzo, aerei che rullano o strisciano sopra
function avImpacts(){for(const v of AV.list){if(!v.alive)continue;const c=Math.cos(v.yaw),s=Math.sin(v.yaw),vx=-s*v.s,vz=-c*v.s;
 for(const b of dynCars){if(b.dead||b.sleep||Math.abs(b.px-v.x)>16||Math.abs(b.pz-v.z)>16)continue;if(Math.hypot(b.vx-vx,b.vz-vz)<5)continue;const dx=b.px-v.x,dz=b.pz-v.z,m=Math.max(b.hx,b.hz)+.3;
  if(Math.abs(dx*c-dz*s)<v.K.hw+m&&Math.abs(dx*s+dz*c)<v.K.len/2+m){avKill(v,b.px,b.py,b.pz,0);break;}}
 if(!v.alive)continue;for(const u of LN.list){if(u.dead||Math.hypot(u.vx,u.vz)<3||u.py-groundH(u.px,u.pz)>u.C.gearH+4)continue;const qx=v.x-u.px,qz=v.z-u.pz,R=u.R,lx=qx*R[0]+qz*R[6],lz=qx*R[2]+qz*R[8];
  if(Math.abs(lz)<u.C.L/2+1&&Math.abs(lx)<u.C.span/2+1&&planeClr(u.C,lx,lz)<v.K.h){avKill(v,u.px,u.py,u.pz,1.2);break;}}}}

// ======================= VIGILI DEL FUOCO DELL'AEROPORTO =======================
// caserma: rimessa con tre porte avvolgibili; i camion stanno dentro col muso verso fuori, rientrano in retromarcia
const AFS={bays:[3699.9,3710.4,3720.9],zIn:1409,zOut:1447,front:1426,x0:3694.6};
const AF={list:[],G:null,scan:3,sir:[],doors:[],dOpen:0,want:0,job:null,lock:null,allHomeT:0,bl:[]};
function afGridBuild(){const Z=OVL[1],G=gridNew(Z.x0+4,Z.z0+4,Z.x1-4,Z.z1-4,4),A=AP.CYI,R=A.rw;
 for(let i=0;i<G.n;i++){const x=gCX(G,i),z=gCZ(G,i);if(waterAt(x,z)>groundH(x,z)-.3){G.st[i]=0;continue;}
  if(bAt(x,z)){let sol=false;for(const o of[[0,0],[1.5,1.5],[-1.5,1.5],[1.5,-1.5],[-1.5,-1.5]])if(pointContact(x+o[0],1.2,z+o[1],CT)||pointContact(x+o[0],2.8,z+o[1],CT)){sol=true;break;}if(sol){G.st[i]=0;continue;}}
  const pav=(x>A.apron.x0&&x<A.apron.x1&&z>A.apron.z0&&z<A.apron.z1)||(x>R.x0-5&&x<R.x1+5&&(Math.abs(z-A.twz)<A.twh+1||Math.abs(z-R.z)<R.hw+8))||A.exits.some(e=>segDist(x,z,e[0],e[1],e[2],e[3])<A.twh+1);
  G.cost[i]=pav?1:1.35;}
 for(const T of AP.tanks)gCirc(G,false,T.x,T.z,T.r+2.6,0);gCirc(G,false,3175,1305,5,0);for(const T of AP.T)gCirc(G,false,T.x,T.z,8,0);
 for(let i=1;i<10;i++)gCirc(G,false,2700+i*125,1584,1,0);gCirc(G,false,R.x0+300,R.z+120,2.5,0);gCirc(G,false,R.x0+150,R.z-60,1.5,0);gCirc(G,false,R.x1-150,R.z-60,1.5,0);
 for(const k of ['nlamp','tree','tug','stairs','fuelt','abus'])if(PK[k])for(const it of PK[k].items)if(it.alive&&avIn(G,it.x,it.z,0))gCirc(G,false,it.x,it.z,k==='tree'?1.3:k==='nlamp'?.8:2.2,0);
 const zf=A.term.z0+A.term.d;for(const J of AP.jb)if(avIn(G,J.rx,J.rz,0)){gCirc(G,false,J.rx,J.rz,2.8,0);gBox(G,false,J.rx,(J.rz+zf)/2,0,1.7,(J.rz-zf)/2+.6,0);}
 AF.G=G;}
function afDyn(G,self){G.stamp++;for(const v of LN.list){if(v.dead||!avIn(G,v.px,v.pz,60)||v.py-groundH(v.px,v.pz)-v.C.gearH>3||Math.hypot(v.vx,v.vz)>1.5)continue;gPlane(G,v);}
 for(const u of AV.list){if(u.alive){gBox(G,true,u.x,u.z,u.yaw,u.K.hw,u.K.len/2,0);for(const c of u.carts)gBox(G,true,c.x,c.z,c.yaw,.75,1.5,0);}else if(u.body&&!u.body.dead)gCirc(G,true,u.body.px,u.body.pz,u.K.len*.4,0);}
 for(let k=AF.bl.length-1;k>=0;k--){const q=AF.bl[k];if(FL.clock-q.t>90||FL.clock<q.t){AF.bl.splice(k,1);continue;}gCirc(G,true,q.x,q.z,1.5,0);}
 for(const A of AF.list){if(A===self||A.b.dead)continue;if(Math.hypot(A.b.vx,A.b.vz)<1)gCirc(G,true,A.b.px,A.b.pz,3,0);}
 if(LN.wrecks)for(const W of LN.wrecks){const b=W.b;if(b&&!b.dead)gCirc(G,true,b.px,b.pz,Math.max(b.hx,b.hz)*.8,0);}}
// porte avvolgibili: lamiera a doghe con una fila di oblò; salendo si nascondono dentro l'architrave
function afDoorTex(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.fillStyle='#c9ccd0';g.fillRect(0,0,64,256);
 for(let y=0;y<256;y+=12){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,y,64,2);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,y+2,64,1);}
 g.fillStyle='#22303a';for(let x=4;x<64;x+=15)g.fillRect(x,64,10,14);g.fillStyle='#b3140f';g.fillRect(0,236,64,20);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
function afDoors(){if(AF.doors.length)return;const m=new THREE.MeshStandardMaterial({map:afDoorTex(),roughness:.5,metalness:.55}),pm=MS(0xb3140f,.6,.3),w=10.4;
 for(let k=0;k<3;k++){const x=AFS.bays[k],pan=new THREE.Mesh(new THREE.BoxGeometry(w,3.9,.1),m);pan.position.set(x,2.0,1424);pan.castShadow=pan.receiveShadow=true;scene.add(pan);AF.doors.push({pan,x,open:0});}
 for(const x of [3705.15,3715.65]){const p=new THREE.Mesh(new THREE.BoxGeometry(.4,4,.7),pm);p.position.set(x,2,1424);p.castShadow=true;scene.add(p);}
 // segnaletica gialla davanti alle porte: zona da tenere libera
 const ym=new THREE.MeshBasicMaterial({color:new THREE.Color(.75,.58,.08)});for(const x of AFS.bays)for(const s of[-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(.18,.02,18),ym);l.position.set(x+s*4.6,groundH(x,1436)+.03,1436);scene.add(l);}}
function afDoorStep(dt){const tgt=AF.want?1:0;AF.dOpen+=clamp(tgt-AF.dOpen,-dt/4.5,dt/3.2);for(const D of AF.doors){D.open=AF.dOpen;D.pan.position.y=2.0+3.9*AF.dOpen;}
 if(AF.doors.length&&AF.dOpen>0&&AF.dOpen<1&&AU.ok&&Math.random()<dt*3){const D=AF.doors[1];if(Math.hypot(camera.position.x-D.x,camera.position.z-1424)<120)sfx({x:D.x,y:4,z:1424,src:'noise',filter:'bandpass',ff0:300,ff1:220,g:.2,d:.45,ref:16});}}
// cannone ad acqua sul tetto: ruota e si alza verso il fuoco
function afTurret(b){const g=new THREE.Group(),m=MS(0xc9ccd0,.4,.7),dk=MS(0x2a2c2f,.6,.4);g.position.set(0,1.62,-1.75);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,.26,14),dk);base.position.y=.13;g.add(base);const yawG=new THREE.Group();yawG.position.y=.28;g.add(yawG);
 const body=new THREE.Mesh(new THREE.BoxGeometry(.34,.28,.46),m);body.position.y=.12;yawG.add(body);const pit=new THREE.Group();pit.position.set(0,.2,-.08);yawG.add(pit);
 const br=new THREE.Mesh(new THREE.CylinderGeometry(.065,.1,1.25,10).rotateX(Math.PI/2),m);br.position.z=-.62;pit.add(br);const nz=new THREE.Mesh(new THREE.CylinderGeometry(.12,.075,.22,10).rotateX(Math.PI/2),dk);nz.position.z=-1.3;pit.add(nz);
 for(const o of[base,body,br,nz]){o.castShadow=true;}b.obj.add(g);return {g,yaw:yawG,pit,a:0,e:.2};}
function afNew(i){const x=AFS.bays[i],z=AFS.zIn,b=trMake('fire',x,groundH(x,z)+1.3,z,Math.PI);b.car.ai={T:0,B:1,S:0,out:true};
 return {b,i,st:'home',t:0,legs:[],pi:0,stuck:0,unst:0,tur:afTurret(b),ph:Math.random()*2,drv:null,rp:0,spT:0,goal:null,tail:null,dly:0};}
function afInit(){if(!AF.G)afGridBuild();AF.list.length=0;AF.job=null;AF.lock=null;AF.bl.length=0;AF.want=0;AF.dOpen=0;afDoors();for(let i=0;i<3;i++)AF.list.push(afNew(i));for(const D of AF.doors){D.open=0;D.pan.position.y=2;}}
// incendi da coprire: dentro la zona dell'aeroporto e non in acqua
function afFires(){const F=[],Z=OVL[1];for(const f of bfires){if(f.t>f.life-2)continue;if(f.x<Z.x0-40||f.x>Z.x1+40||f.z<Z.z0-40||f.z>Z.z1+40)continue;if(waterAt(f.x,f.z)>groundH(f.x,f.z)+.3)continue;F.push(f);}return F;}
function afScan(){const F=afFires(),J=AF.job;
 if(J&&J.kind==='fire'){let n=0;for(const f of F)if(Math.hypot(f.x-J.x,f.z-J.z)<45)n++;J.calm=n?0:(J.calm||0)+2.5;if(J.calm>=7.5||FL.clock-J.t0>360)afEnd();return;}
 if(J&&J.kind==='emg'){const v=J.v;if(v.dead||v.eng!==1||FL.clock-J.t0>420){if(v.dead&&F.length){AF.job=null;}else{afEnd();return;}}else return;}
 if(F.length){let best=null,bs=-1;for(const f of F){let s=0;for(const g of F)if(Math.hypot(g.x-f.x,g.z-f.z)<35)s+=g.s;if(s>bs){bs=s;best=f;}}
  let cx=0,cz=0,cy=0,w=0;for(const g of F)if(Math.hypot(g.x-best.x,g.z-best.z)<35){cx+=g.x*g.s;cz+=g.z*g.s;cy+=g.y*g.s;w+=g.s;}afStart({kind:'fire',x:cx/w,z:cz/w,y:cy/w,t0:FL.clock});return;}
 // aereo con un motore in fiamme che rientra: i camion si piazzano a lato della pista e poi lo raggiungono
 for(const v of LN.list){if(v.dead||v.eng!==1||!v.ai)continue;const a=v.ai;if((a.dest||a.ap)!=='CYI')continue;afStart({kind:'emg',v,t0:FL.clock});return;}}
function afStart(J){AF.job=J;AF.want=1;AF.lock=null;let k=0;for(const A of AF.list){if(A.b.dead||A.b.car.drv)continue;A.wasHome=A.st==='home';A.st='wait';A.dly=A.wasHome?2.2+k*1.6:k*.8;A.legs=[];A.t=0;A.goal=null;k++;}
}
function afEnd(){AF.job=null;for(const A of AF.list){if(A.b.dead||A.st==='home'||A.st==='player')continue;A.st='ret';A.legs=[];A.t=0;}}
function afAim(A){const J=AF.job,b=A.b;if(J.kind==='fire'){const dx=b.px-J.x,dz=b.pz-J.z,a0=Math.atan2(dz,dx)+(A.i-1)*.6;let best=null;
  for(const r of [24,30,19,36])for(const da of [0,.35,-.35,.7,-.7]){const x=J.x+Math.cos(a0+da)*r,z=J.z+Math.sin(a0+da)*r,i=gI(AF.G,x,z);if(i>=0&&gOk(AF.G,i,3.9)){best=[x,z];break;}if(best)break;}
  return best||[J.x+Math.cos(a0)*24,J.z+Math.sin(a0)*24];}
 const v=J.v,a=v.ai;if(v.py-groundH(v.px,v.pz)-v.C.gearH>2||a.phase==='climb'||a.phase==='route'||a.phase==='app'||a.phase==='flare'){const R=AP.CYI.rw;return [R.x0+900+A.i*34,AP.CYI.twz+40];}
 const R=v.R,E=v.C.eng[0],ex=v.px+R[0]*E.x,ez=v.pz+R[6]*E.x;
 // posti lungo il fianco dell'aereo: il primo camion che arriva prende quello più lontano, così gli altri non devono sorpassarlo
 if(!J.slots){const live=AF.list.filter(B=>!B.b.dead&&B.st!=='player'),dv=B=>Math.hypot(B.b.px-v.px,B.b.pz-v.pz);if(live.length&&live.some(B=>dv(B)<160)){let cx=0,cz=0;for(const B of live){cx+=B.b.px/live.length;cz+=B.b.pz/live.length;}
   const pr=(v.px-cx)*R[2]+(v.pz-cz)*R[8],sp=[0,1,2].sort((p,q)=>(q-1)*pr-(p-1)*pr);J.slots={};live.sort((p,q)=>dv(p)-dv(q)).forEach((B,r)=>{J.slots[B.i]=sp[Math.min(r,2)];});}}
 const k=J.slots&&J.slots[A.i]!==undefined?J.slots[A.i]:A.i,ox=R[0]*(E.x+16)+R[2]*(k-1)*9,oz=R[6]*(E.x+16)+R[8]*(k-1)*9;return [v.px+ox,v.pz+oz,ex,ez];}
// guida dei camion veri: inseguimento del percorso, sterzo da modello a bicicletta (passo 5,2 m), retromarce con sterzo invertito
function afFollow(A,dt,vmax){const b=A.b,c=b.car,ai=c.ai,L=A.legs[0];if(!L){ai.T=0;ai.B=1;ai.S=0;return true;}b.sleep=false;b.slow=0;const P=L.pts,dir=L.dir,R=b.R,fx=-R[2],fz=-R[8],vf=b.vx*fx+b.vz*fz;
 let i=A.pi;while(i<P.length-2){const a=P[i],q=P[i+1],ux=q[0]-a[0],uz=q[1]-a[1],l2=ux*ux+uz*uz||1;if(((b.px-a[0])*ux+(b.pz-a[1])*uz)/l2<1)break;i++;}A.pi=i;
 const a=P[i],q=P[i+1],ux=q[0]-a[0],uz=q[1]-a[1],sl=Math.hypot(ux,uz)||1e-3,t=clamp(((b.px-a[0])*ux+(b.pz-a[1])*uz)/(sl*sl),0,1),rem=(1-t)*sl+L.cum[L.cum.length-1]-L.cum[i+1];
 const Ld=dir>0?7+Math.abs(vf)*.65:4.5;let tx,tz,need=Ld,seg=i,s0=(1-t)*sl;if(need<=s0){tx=a[0]+ux*(t+need/sl);tz=a[1]+uz*(t+need/sl);}else{need-=s0;seg++;while(seg<P.length-1){const c2=P[seg],d=P[seg+1],l=L.cum[seg+1]-L.cum[seg];if(need<=l){const f=need/(l||1);tx=c2[0]+(d[0]-c2[0])*f;tz=c2[1]+(d[1]-c2[1])*f;break;}need-=l;seg++;}}
 if(tx===undefined){const e=P[P.length-1],p=P[P.length-2],ex=e[0]-p[0],ez=e[1]-p[1],el=Math.hypot(ex,ez)||1;tx=e[0]+ex/el*need;tz=e[1]+ez/el*need;}
 const hx=fx*dir,hz=fz*dir,dx=tx-b.px,dz=tz-b.pz,dd=Math.hypot(dx,dz)||1e-3,al=Math.atan2(hx*dz-hz*dx,hx*dx+hz*dz),st=Math.abs(al)>Math.PI/2?Math.sign(al)*.55:clamp(Math.atan(2*5.2*Math.sin(al)/Math.max(dd,3)),-.55,.55);ai.S=dir>0?st:-st;
 const ep=P[P.length-1],dEnd=Math.hypot(ep[0]-b.px,ep[1]-b.pz),beh=(ep[0]-b.px)*hx+(ep[1]-b.pz)*hz<0,kap=Math.abs(2*Math.sin(al)/Math.max(dd,3));let want=Math.min(L.vmax||vmax,Math.sqrt(3.2/Math.max(kap,.004)),Math.sqrt(2*3.2*Math.max(0,Math.min(rem,dEnd+1)-.4))+.2);if(Math.abs(al)>1.3)want=Math.min(want,3);if(dir<0)want=Math.min(want,3.2);
 // non investire nessuno: persone, mezzi e carrelli che stanno sulla traiettoria dei prossimi metri (non solo davanti al muso)
 const P2=player,Dh=8+Math.abs(vf)*1.6,onP=(x,z,r)=>{const qx=x-b.px,qz=z-b.pz;if(qx*hx+qz*hz<1.5||qx*qx+qz*qz>(Dh+14)*(Dh+14))return false;
   let acc=0,k=i,ax=b.px,az=b.pz;while(k<P.length-1&&acc<Dh){const bx=P[k+1][0],bz=P[k+1][1];if(segDist(x,z,ax,az,bx,bz)<1.7+r)return true;acc+=Math.hypot(bx-ax,bz-az);ax=bx;az=bz;k++;}return false;};
 let blk=!P2.fly&&!P2.veh&&onP(P2.x,P2.z,.4);
 if(!blk&&!(A.gh>0)){blk=AV.list.some(u=>u.alive&&(onP(u.x,u.z,u.K.hw)||u.carts.some(c=>onP(c.x,c.z,.8))));
  // un altro camion davanti che va nella stessa direzione: lo si segue a distanza invece di fermarsi
  if(!blk)for(const B of AF.list){if(B===A||B.b.dead||!onP(B.b.px,B.b.pz,1.3))continue;const bb=B.b,va=bb.vx*hx+bb.vz*hz,dB=Math.hypot(bb.px-b.px,bb.pz-b.pz);if(va>1.5&&dB>12)want=Math.min(want,Math.max(0,va+(dB-14)*.4));else{blk=true;break;}}}
 if(A.gh>0)A.gh-=dt;
 if(blk){want=0;A.blk=(A.blk||0)+dt;
  // fermo da più di 3 s: si ripianifica (il nuovo percorso aggira i mezzi fermi); dopo tre tentativi si passa piano ignorandoli per 4 s
  if(A.blk>3&&A.goal&&A.st!=='park'&&dir>0){A.blk=0;A.nblk=(A.nblk||0)+1;if(A.nblk>=3){A.nblk=0;A.gh=4;}else{afPlan(A,A.goal[0],A.goal[1],A.tail,L.vmax);return false;}}}
 else{A.blk=0;if(Math.abs(vf)>2)A.nblk=0;}
 const sp=vf*dir;if(want<.05){ai.T=0;ai.B=1;}else if(sp<want){ai.T=dir*clamp((want-sp)*.35+.22,0,dir>0?1:.75);ai.B=0;}else{ai.T=0;ai.B=clamp((sp-want)*.3,0,1);}
 if(sp<-.4){ai.T=0;ai.B=1;}
 if(Math.abs(ai.T)>.3&&Math.abs(vf)<.5){A.stuck+=dt;if(A.stuck>3){A.stuck=0;A.unst=1.6;A.unDir=-dir;
   // ostacolo che la griglia non conosce: lo si segna per 90 s, così il percorso successivo lo aggira
   const ox=b.px+hx*5.5,oz=b.pz+hz*5.5;if(Math.hypot(ox-AFS.bays[1],oz-AFS.front)>40&&!AF.list.some(B=>B!==A&&Math.hypot(B.b.px-ox,B.b.pz-oz)<7)&&!AV.list.some(u=>Math.hypot(u.x-ox,u.z-oz)<6)){AF.bl.push({x:ox,z:oz,t:FL.clock});if(AF.bl.length>24)AF.bl.shift();}}}
 else A.stuck=Math.max(0,A.stuck-dt*.5);
 if((rem<1||dEnd<1.5)&&Math.abs(vf)<.8||(beh&&dEnd<9)){A.legs.shift();A.pi=0;return !A.legs.length;}return false;}
// dentro la rimessa la griglia (celle da 4 m) è troppo grossolana: si esce sempre dritti dalla propria porta e si pianifica da fuori
function afInBay(A){const b=A.b;return b.px>AFS.x0-4.6&&b.px<AFS.x0+35.4&&b.pz>AFS.zIn-19&&b.pz<AFS.front+1.5;}
function afPlan(A,tx,tz,tail,vmax){const G=AF.G;afDyn(G,A);let sx=A.b.px,sz=A.b.pz,pre=[];
 if(afInBay(A)){let bx=AFS.bays[0];for(const x of AFS.bays)if(Math.abs(x-A.b.px)<Math.abs(bx-A.b.px))bx=x;pre=[[A.b.px,A.b.pz],[bx,AFS.front+3]];sx=bx;sz=AFS.zOut;}
 const P=gPath(G,sx,sz,tx,tz,3.9,120000)||[[sx,sz],[tx,tz]];A.legs=[avLeg(pre.concat(P,tail||[]),1,vmax||0)];A.pi=0;A.goal=[tx,tz];A.tail=tail||null;A.rp=4;}
// rientro: si arriva davanti alla rimessa, si passa oltre la propria porta e si entra in retromarcia con una curva (muso verso l'uscita)
function afParkLegs(A){const sx=AFS.bays[A.i],zo=AFS.zOut,E=[sx+9.5,zo],arc=[];for(let k=0;k<=8;k++){const th=Math.PI/2+k/8*Math.PI/2;arc.push([E[0]+9.5*Math.cos(th),E[1]-9.5+9.5*Math.sin(th)]);}
 arc.push([sx,AFS.zIn]);return [avLeg([[A.b.px,A.b.pz],[sx-6,zo],E],1,5),avLeg(arc,-1,2.5)];}
function afSpray(A,tx,ty,tz,dt){const b=A.b,T=A.tur;b.obj.updateMatrixWorld(true);const w=new THREE.Vector3(0,.48,-.08).applyMatrix4(T.yaw.matrixWorld);
 // angolo del cannone nel riferimento del camion
 const R=b.R,dx=tx-w.x,dz=tz-w.z,lx=dx*R[0]+dz*R[6],lz=dx*R[2]+dz*R[8],D=Math.hypot(dx,dz),V=clamp(Math.sqrt(9.8*Math.max(D,8)*1.1),17,32),g=9.8,h=ty-w.y;
 let e=.5*Math.asin(clamp(g*D/(V*V),0,1))+Math.atan2(h,Math.max(D,1))*.5;e=clamp(e,-.1,.75);T.a+=clamp(avWrap(Math.atan2(-lx,-lz)-T.a),-dt*1.4,dt*1.4);T.e+=clamp(e-T.e,-dt*.8,dt*.8);T.yaw.rotation.y=T.a;T.pit.rotation.x=T.e;
 T.pit.updateMatrixWorld(true);const tip=new THREE.Vector3(0,0,-1.42).applyMatrix4(T.pit.matrixWorld),dir=new THREE.Vector3(0,0,-1).transformDirection(T.pit.matrixWorld);
 if(psA){const l=TODC.lit,rate={bassa:45,media:80,alta:120,ultra:150}[S.q]||80;A.spT+=dt*rate;while(A.spT>=1){A.spT-=1;const j=rand(.93,1.05);psA.spawn(tip.x,tip.y,tip.z,dir.x*V*j+rand(-.5,.5),dir.y*V*j+rand(-.4,.4),dir.z*V*j+rand(-.5,.5),rand(2.2,3.4),.28,1.9,.86*l,.9*l,.96*l,.62,.04,9.8,2);if(Math.random()<.25)psA.spawn(tip.x,tip.y,tip.z,dir.x*V*j*.9,dir.y*V*j*.9,dir.z*V*j*.9,rand(1.5,2.5),.6,3.2,.9*l,.92*l,.96*l,.18,.5,6,1);}
  if(Math.random()<dt*7)psA.spawn(tx+rand(-3,3),ty+rand(0,2),tz+rand(-3,3),rand(-.6,.6),rand(.8,2.4),rand(-.6,.6),rand(2,4),1.2,4.5,.85*l,.87*l,.9*l,.32,.6,-.2,1);}
 return Math.abs(avWrap(Math.atan2(-lx,-lz)-T.a))<.25;}
function afQuench(x,z,dt){let left=0;for(const g of bfires){if(Math.hypot(g.x-x,g.z-z)>26)continue;g.life=Math.max(g.t+.5,g.life-dt*9);if(g.life-g.t>.6)left++;if(psA&&Math.random()<dt*2){const l=TODC.lit;psA.spawn(g.x+rand(-1,1),g.y+.5,g.z+rand(-1,1),rand(-.4,.4),rand(1.5,3),rand(-.4,.4),rand(3,6),1.5,5,.8*l,.8*l,.82*l,.35,.4,-.3,1);}}
 if(LN.wrecks)for(const W of LN.wrecks){const w=W.b;if(w&&!w.dead&&Math.hypot(w.px-x,w.pz-z)<32)W.t=Math.max(W.t,Math.min(199,W.t+dt*7));}return left;}
function afStep(dt){if(!AF.list.length)return;afDoorStep(dt);const cpv=camera.position;for(const A of AF.list){const b=A.b;if(b.dead||!b.obj)continue;const d=Math.hypot(b.px-cpv.x,b.pz-cpv.z),vis=A.st==='home'?d<380:d<760;if(b.obj.visible!==vis)b.obj.visible=vis;}AF.scan-=dt;if(AF.scan<=0){AF.scan=2.5;afScan();}const tt=U.uTime.value,J=AF.job;let home=0;
 for(const A of AF.list){const b=A.b;if(b.dead){A.st='dead';continue;}const c=b.car;
  if(c.drv){if(A.st!=='player'){A.st='player';A.legs=[];if(A.drv){b.obj.remove(A.drv);A.drv=null;}}continue;}
  if(!c.ai)c.ai={T:0,B:1,S:0,out:true};const ai=c.ai;if(A.st==='player'){A.st=Math.hypot(b.px-AFS.bays[A.i],b.pz-AFS.zIn)<4?'home':'ret';A.legs=[];}
  if(A.st!=='home'&&A.st!=='dead'){ai.out=false;b.sleep=false;b.slow=0;b.noSleep=true;if(!A.drv)A.drv=trDriver(b.obj,-.6,.95,-2.7);}else b.noSleep=false;
  if(A.unst>0){A.unst-=dt;ai.T=A.unDir*.6;ai.B=0;ai.S=0;if(A.unst<=0&&A.goal&&A.st!=='park')afPlan(A,A.goal[0],A.goal[1],A.tail);afBar(A,tt);continue;}
  A.t+=dt;if(A.rp>0)A.rp-=dt;
  if(A.st==='home'){ai.T=0;ai.B=1;ai.S=0;ai.out=true;home++;}
  else if(A.st==='wait'){ai.T=0;ai.B=1;if(A.t>A.dly&&(!A.wasHome||AF.dOpen>.97)&&J){A.st='go';const p=afAim(A);afPlan(A,p[0],p[1],null,J.kind==='emg'?20:18);}}
  else if(A.st==='go'){if(!J){A.st='ret';A.legs=[];}else{
    if(J.kind==='emg'){const p=afAim(A);if(!A.goal||(p.length>2?A.rp<=0:Math.hypot(p[0]-A.goal[0],p[1]-A.goal[1])>6)){if(p.length>2&&!afInBay(A)){A.legs=[avLeg([[b.px,b.pz],[p[0],p[1]]],1,22)];A.pi=0;A.goal=[p[0],p[1]];A.rp=.5;}else afPlan(A,p[0],p[1],null,20);}
     const done=afFollow(A,dt,22);if(p.length>2&&Math.hypot(b.px-p[0],b.pz-p[1])<14&&Math.hypot(b.vx,b.vz)<J.v.ai.spd+2){A.st='spray';A.t=0;}else if(done&&p.length<=2){ai.T=0;ai.B=1;}}
    else{if(afFollow(A,dt,18)){A.st='spray';A.t=0;}}}}
  else if(A.st==='spray'){if(!J){A.st='ret';A.legs=[];}else if(J.kind==='fire'){ai.T=0;ai.B=1;ai.S=0;const on=afSpray(A,J.x,J.y+.5,J.z,dt);if(on)afQuench(J.x,J.z,dt);if(Math.hypot(b.px-J.x,b.pz-J.z)>48){A.st='go';afPlan(A,...afAim(A),null,10);}}
   else{const v=J.v,p=afAim(A);if(p.length>2){const d=Math.hypot(b.px-p[0],b.pz-p[1]);A.legs=[avLeg([[b.px,b.pz],[p[0],p[1]]],1,Math.max(3,(v.ai.spd||0)+3))];A.pi=0;if(d>5)afFollow(A,dt,20);else{ai.T=0;ai.B=1;ai.S=0;}
     const E=v.C.eng[0],R=v.R;if(afSpray(A,p[2],v.py+R[4]*E.y,p[3],dt)){afQuench(p[2],p[3],dt);J.wet=(J.wet||0)+dt;if(J.wet>7&&v.eng===1){v.eng=0;J.ext=true;for(const g of bfires)if(Math.hypot(g.x-p[2],g.z-p[3])<15)g.life=Math.min(g.life,g.t+.5);afEnd();}}}else{A.st='go';}}}
  else if(A.st==='ret'){if(!A.legs.length){ai.T=0;ai.B=1;ai.S=0;const sx=AFS.bays[A.i];if(Math.hypot(b.px-sx,b.pz-(AFS.zOut))<30&&(!AF.lock||AF.lock===A)){AF.lock=A;A.legs=afParkLegs(A);A.pi=0;A.st='park';}
     else if(A.rp<=0)afPlan(A,sx-14,AFS.zOut+6,null,14);}
   else if(afFollow(A,dt,14)){A.legs=[];}}
  else if(A.st==='park'){if(afFollow(A,dt,4)){A.st='home';if(AF.lock===A)AF.lock=null;if(A.drv){b.obj.remove(A.drv);A.drv=null;}A.tur.a=0;A.tur.e=.2;A.tur.yaw.rotation.y=0;A.tur.pit.rotation.x=.2;}}
  if(A.st!=='spray'&&A.st!=='home'){A.tur.a*=1-Math.min(1,dt*.8);A.tur.e+=(.2-A.tur.e)*Math.min(1,dt*.8);A.tur.yaw.rotation.y=A.tur.a;A.tur.pit.rotation.x=A.tur.e;}
  afBar(A,tt);}
 // porte: si chiudono quando tutti sono rientrati
 if(home===AF.list.filter(A=>!A.b.dead).length&&!AF.job){AF.allHomeT+=dt;if(AF.allHomeT>3)AF.want=0;}else{AF.allHomeT=0;if(AF.job||AF.list.some(A=>A.st==='park'||(A.st==='ret'&&Math.hypot(A.b.px-AFS.bays[A.i],A.b.pz-AFS.zOut)<60)))AF.want=1;}
 afSirens();}
function afBar(A,tt){const bar=A.b.car.bar;if(!bar)return;const lit=A.st==='go'||A.st==='spray'||A.st==='wait',on=((tt*5+A.ph)%2)<1;bar.r.color.setRGB(lit&&on?5.5:.25,lit&&on?.12:0,lit&&on?.06:0);if(bar.w)bar.bl.color.setRGB(lit&&!on?5:.25,lit&&!on?5:.25,lit&&!on?5:.25);else bar.bl.color.setRGB(0,0,lit&&!on?5.5:.25);}
function afSirens(){if(!AU.ok)return;const cp=camera.position,ct=AU.ctx.currentTime,act=AF.list.filter(A=>!A.b.dead&&A.st==='go'&&Math.hypot(A.b.px-cp.x,A.b.pz-cp.z)<320).sort((p,q)=>Math.hypot(p.b.px-cp.x,p.b.pz-cp.z)-Math.hypot(q.b.px-cp.x,q.b.pz-cp.z)).slice(0,2).map(A=>A.b);
 for(const s of AF.sir)if(s.b&&!act.includes(s.b)){s.g.gain.setTargetAtTime(0,ct,.15);s.b=null;}
 for(const b of act){let s=AF.sir.find(q=>q.b===b);if(!s){s=AF.sir.find(q=>!q.b);if(!s){s=trSirenNew();AF.sir.push(s);}s.b=b;}let f=520+320*(.5+.5*Math.sin(ct*TAU/4.6+AF.sir.indexOf(s)));
  const dx=b.px-cp.x,dz=b.pz-cp.z,dd=Math.hypot(dx,dz)||1,lv=player.veh||{vx:0,vz:0},vr=((b.vx-(lv.vx||0))*dx+(b.vz-(lv.vz||0))*dz)/dd;f*=343/(343+clamp(vr,-60,60));
  s.o.frequency.setTargetAtTime(f,ct,.03);s.g.gain.setTargetAtTime(.3,ct,.1);setPan(s.p,b.px,b.py+1.5,b.pz);}}

// ======================= VIGILI DEL FUOCO IN CITTÀ =======================
// un incendio a Manhattan vicino a dove sei: un'autopompa arriva lungo le strade (a sirene spiegate, senza fermarsi ai semafori),
// si ferma nella via più vicina al fuoco e spegne con il cannone; finito il lavoro torna nel traffico normale
const CF={calls:[],t:2};
function cfEdge(f){const cp=camera.position;let best=null,bs=1e9;for(const e of TRF.edges){const mx=140*(e.i+e.di*.5),mz=84*(e.j+e.dj*.5),d=Math.hypot(mx-f.x,mz-f.z),dc=Math.hypot(mx-cp.x,mz-cp.z);if(d<80||d>190||dc>300)continue;
 const tx=f.x-mx,tz=f.z-mz,dot=(e.di*tx+e.dj*tz)/(Math.hypot(tx,tz)||1);if(dot<.3)continue;const sc=Math.abs(d-130)+(1-dot)*60+Math.random()*30;if(sc<bs){bs=sc;best=e;}}return best;}
function cfStep(dt){if(!TRF.edges)return;for(let i=CF.calls.length-1;i>=0;i--){const b=CF.calls[i].b,A=b.car&&b.car.ai;if(b.dead||!A||A.out||A.mode!=='fire')CF.calls.splice(i,1);}
 CF.t-=dt;if(CF.t>0)return;CF.t=3;const cp=camera.position;if(CF.calls.length>=3)return;
 for(const f of bfires){if(f.t>f.life-4||f.y-groundH(f.x,f.z)>30)continue;if(Math.abs(f.x)>CX+40||Math.abs(f.z)>CZ+40)continue;if(Math.hypot(f.x-cp.x,f.z-cp.z)>300)continue;if(CF.calls.some(c=>Math.hypot(c.x-f.x,c.z-f.z)<70))continue;
  const e=cfEdge(f);if(!e)continue;const b=trSpawn('fire',e,.3,'emg');if(!b)continue;const A=b.car.ai;A.mode='fire';A.tgt={px:f.x,pz:f.z,vx:0,vz:0,dead:false};A.siren=true;A.vmax=16;A.fx=f.x;A.fy=f.y;A.fz=f.z;A.fst='go';A.fT=0;A.calm=0;
  CF.calls.push({x:f.x,z:f.z,b});break;}}
{const tp0=trPlan;trPlan=function(b){const A=b.car&&b.car.ai;if(A&&A.mode==='fire'){A.mode='chase';try{tp0(b);}finally{A.mode='fire';}return;}return tp0(b);};}
{const td0=trDrive;trDrive=function(b,dt){const A=b.car&&b.car.ai;if(!A||A.mode!=='fire')return td0(b,dt);const d=Math.hypot(b.px-A.fx,b.pz-A.fz);
 if(A.fst==='go'){td0(b,dt);const sp=Math.hypot(b.vx,b.vz);A.fStk=sp<.5?(A.fStk||0)+dt:0;A.vmax=d<75?6:16;if(d<46||(A.fStk>4&&d<92)){A.fst='stop';return;}
  // fermi dietro ad auto abbandonate o in coda: l'autopompa avanza piano e le sposta (è pesante nove tonnellate)
  if(A.fStk>6){A.push=3.5;A.fStk=0;}if(A.push>0){A.push-=dt;A.T=.55;A.B=0;}return;}
 b.sleep=false;A.T=0;A.B=1;A.S=0;A.fT+=dt;if(Math.hypot(b.vx,b.vz)>.7)return;
 if(!A.spr)A.spr={b,tur:afTurret(b),spT:0};const on=afSpray(A.spr,A.fx,A.fy+.5,A.fz,dt);let left=0;
 if(on)for(const g of bfires){if(Math.hypot(g.x-A.fx,g.z-A.fz)>24||g.y-b.py>28)continue;g.life=Math.max(g.t+.5,g.life-dt*8);if(g.life-g.t>.6)left++;}else left=1;
 A.calm=left?0:A.calm+dt;if(A.calm>4||A.fT>110){A.mode='norm';A.siren=false;A.fst='done';A.vmax=12;A.tgt=null;}};}

// ---------- collegamenti con il resto del gioco ----------
{const ds4=destroySphere;destroySphere=function(x,y,z,R,P){ds4(x,y,z,R,P);if(AV.ready&&x>2450&&x<3950&&z>1300&&z<1720)avHit(x,y,z,R,P);};}
{const f4=frameUpdate;frameUpdate=function(dt){f4(dt);avStep(dt);afStep(dt);cfStep(dt);};}
{const w4=buildWorld;buildWorld=function(){w4();avGridBuild();afInit();avInit();};}
{const r4=resetCity;resetCity=function(){r4();for(const st of AP.CYI.stands)st.svcPl=null;AV.ready=false;avInit();afInit();CF.calls.length=0;};}
