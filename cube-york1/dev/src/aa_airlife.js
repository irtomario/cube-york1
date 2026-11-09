/* ======================= PATCH AA — AEROPORTI VIVI: PASSEGGERI CON TROLLEY, CODE AI BANCHI, CONTROLLI, GATE, PORTE AUTOMATICHE, PERSONALE DI RAMPA ======================= */
const APL={G:[],pend:null,doors:[],near:null,lugC:[[.07,.07,.08],[.1,.14,.28],[.42,.43,.45],[.5,.09,.11],[.66,.68,.7],[.22,.27,.16],[.13,.22,.33],[.55,.35,.2]],
 vis:[[.86,.95,.08],[1,.42,.05]],ready:false};
// ---------- grafo dei percorsi pedonali: nodi con soste (banchi, tabelloni, negozi, gate) e archi anche a senso unico (code) ----------
function aplG(ap,kind){const G={ap,kind,N:[]};G.nd=(x,z,o)=>{const n=Object.assign({x,z,id:G.N.length,nb:[]},o||{});G.N.push(n);return n;};
 G.ln=(a,b,one)=>{if(!a.nb.includes(b))a.nb.push(b);if(!one&&!b.nb.includes(a))b.nb.push(a);};G.chain=(L,one)=>{for(let i=0;i<L.length-1;i++)G.ln(L[i],L[i+1],one);};
 G.row=(xs,z,o)=>{const L=xs.slice().sort((p,q)=>p-q).map(x=>G.nd(x,z,o&&o(x)));G.chain(L);return L;};G.at=(L,x)=>L.reduce((b,n)=>Math.abs(n.x-x)<Math.abs(b.x-x)?n:b,L[0]);APL.G.push(G);return G;}
const aplSit=(a,b,f,p)=>({idle:[a,b],face:f,pw:p===undefined?1:p});
function aplBuild(){APL.G.length=0;APL.doors.length=0;
 // ===== CYI: terminal 2722..3002 × 1362..1426 =====
 {const A=AP.CYI,T=A.term,x0=T.x0,z0=T.z0,W=T.w,D=T.d,chkW=96,xs=x0+chkW+4,xL=x0+chkW+32+6,dx=[x0+26,x0+74];
  // --- dentro ---
  const G=aplG('CYI','in');const zA=z0+7.5,zB=z0+27.5,xW=x0+6,xE=x0+chkW-2;
  const Arow=G.row([xW,dx[0],x0+48,dx[1],xE],zA,x=>Math.abs(x-(x0+48))<1?aplSit(4,12,0,.35):null);
  const Brow=G.row([xW,x0+28,x0+50,x0+72,xE],zB,()=>({idle:[2,7],pw:.12}));G.ln(Arow[0],Brow[0]);G.ln(Arow[Arow.length-1],Brow[Brow.length-1]);
  // code ai banchi dell'accettazione (a senso unico: si entra da ovest, si esce a est verso i controlli)
  const Q=(z,face,from,to)=>{const e=G.nd(x0+7,z),m=G.nd(x0+40,z,{idle:[1.5,4],pw:.5,face:-Math.PI/2}),c=G.nd(x0+73,z,aplSit(12,30,face)),o=G.nd(x0+88,z);G.chain([e,m,c,o],true);G.ln(from,e,true);G.ln(o,to,true);return o;};
  const qa=Q(z0+11.3,Math.PI,Arow[0],Arow[Arow.length-1]),qb=Q(z0+18.7,0,Brow[0],Brow[Brow.length-1]),qc=Q(z0+47.3,Math.PI,Brow[0],Brow[Brow.length-1]);
  // controlli di sicurezza: tre corsie (la quarta ha un pilastro sull'arco), sosta allo scanner
  const L0=x0+chkW+44,zL=z0+24,zG=z0+54.8;const Lxs=[L0,xL+18.5,xL+40.5,xL+62.5,xL+84,xL+95.5,xL+117.5,x0+W-12],Lrow=G.row(Lxs,zL,()=>({idle:[2,6],pw:.1}));
  for(const zc of[z0+12,z0+23,z0+45]){const i=G.nd(xs-3,zc),sc=G.nd(xs+6,zc,aplSit(3,7,-Math.PI/2)),o=G.nd(xs+24,zc);G.chain([i,sc,o],true);G.ln(Brow[Brow.length-1],i,true);G.ln(o,Lrow[0],true);}
  G.ln(qa,G.N.find(n=>Math.abs(n.x-(xs-3))<.1&&Math.abs(n.z-(z0+12))<.1),true);
  // negozi della zona partenze, tabelloni
  for(const sx of[x0+chkW+32+12,x0+chkW+32+44,x0+chkW+32+78,x0+W-30]){const s=G.nd(sx,z0+11.6,aplSit(5,16,0,.8));G.ln(G.at(Lrow,sx),s);}
  for(const bx of[x0+chkW+32+30,x0+chkW+32+90]){const s=G.nd(bx,z0+29,aplSit(4,10,Math.PI,.8));G.ln(G.at(Lrow,bx),s);}
  // corridoio dei gate (dietro le file di sedute) e passaggi tra le sedute
  const Gxs=[xL+18.5,xL+40.5,xL+62.5,xL+95.5,xL+117.5,x0+W-12],Grow=G.row(Gxs,zG,x=>({idle:[3,12],pw:.25,face:Math.PI}));
  for(const x of[xL+18.5,xL+40.5,xL+62.5,xL+95.5,xL+117.5])G.ln(G.at(Lrow,x),G.at(Grow,x));G.ln(Lrow[Lrow.length-1],Grow[Grow.length-1]);
  // --- fuori: marciapiede sotto la pensilina, attraversamento pedonale, parcheggio ---
  const O=aplG('CYI','out'),zc=z0-3.6,cx=[];for(let x=x0+6;x<=x0+W-8;x+=19)cx.push(x);const Crow=O.row(cx.concat(dx),zc,()=>({idle:[2,10],pw:.22}));
  for(let k=0;k<2;k++){const d=dx[k],o=O.nd(d,z0-1.6),i=O.nd(d,z0+5.2);O.ln(O.at(Crow,d),o);O.ln(o,i);i.link=G.at(Arow,d);i.doorIn=true;
   APL.doors.push({x:d,z:z0+1.2,ax:'z',w:2.8,h:2.6,t:0,g:A.termB,bay:{a:d-6,b:d+6}});}
  const zw=x0+8,cw=[O.nd(zw,A.land-9.6),O.nd(zw,A.land+8.4)];O.ln(cw[0],cw[1]);O.ln(cw[1],O.at(Crow,zw));
  const pk=[];for(const z of[1284,1300,1316,1332]){const r=O.row([2474,2530,2590,2650,2717],z,()=>({idle:[1,5],pw:.15}));pk.push(r);}
  for(let j=0;j<3;j++)O.ln(pk[j][4],pk[j+1][4]);O.ln(pk[3][4],cw[0]);
  APL.cyi={G,O,box:[x0-260,x0+W+260,z0-130,z0+D+220],cw:[zw,A.land]};}
 // ===== CYW: terminal -2858..-2638 × 1806..1838 (solo interno) =====
 {const A=AP.CYW,T=A.term,x0=T.x0,z0=T.z0,W=T.w,D=T.d,xL=x0+60+6,G=aplG('CYW','in');
  const zA=z0+2.8,zB=z0+24,xW=x0+6,xE=x0+W-8;const Ar=G.row([xW,x0+30,x0+66,x0+110,x0+150,xE],zA,x=>Math.abs(x-(x0+30))<1?aplSit(4,12,0,.4):({idle:[2,6],pw:.1}));
  const Bxs=[xW,xL+18.5,xL+40.5,xL+62.5,xL+84.5,xL+106.5,xE],Br=G.row(Bxs,zB,()=>({idle:[3,12],pw:.3,face:Math.PI}));G.ln(Ar[0],Br[0]);G.ln(Ar[Ar.length-1],Br[Br.length-1]);
  const zM=z0+15.2;for(const x of[xL+18.5,xL+40.5,xL+62.5,xL+84.5,xL+106.5]){const m=G.nd(x,zM,{idle:[1,4],pw:.1});G.ln(G.at(Ar,x),m);G.ln(m,G.at(Br,x));}
  const Q=(z,face)=>{const e=G.nd(x0+7,z),c=G.nd(x0+43,z,aplSit(12,28,face)),o=G.nd(x0+52,z);G.chain([e,c,o],true);G.ln(Ar[0],e,true);G.ln(o,G.at(Ar,x0+66),true);};Q(z0+6.3,Math.PI);Q(z0+13.7,0);
  APL.cyw={G,box:[x0-200,x0+W+200,z0-120,z0+D+160]};}
 APL.ready=true;}
// ---------- posa e accessori: trolley tirato con il braccio sinistro, gilet ad alta visibilità e cuffie per il personale di rampa ----------
function aplPart(n,t,b,o,s,c){const k=NPCG.T.indexOf(t);let j=-1;for(const p of n.parts)if(p.t===k&&p.j>j)j=p.j;j++;if(j>=NPCG.K[k])return false;n.parts.push({t:k,j,b,o,s,c});
 const m=NPCG.M[k];m.setColorAt(n.blk*NPCG.K[k]+j,_nc.setRGB(c[0],c[1],c[2]).convertSRGBToLinear());if(m.instanceColor)m.instanceColor.needsUpdate=true;return true;}
function aplRecolor(n,f,c){for(const p of n.parts)if(f(p)){p.c=c;NPCG.M[p.t].setColorAt(n.blk*NPCG.K[p.t]+p.j,_nc.setRGB(c[0],c[1],c[2]).convertSRGBToLinear());}for(const m of NPCG.M)if(m.instanceColor)m.instanceColor.needsUpdate=true;}
function aplLuggage(n){const c=APL.lugC[Math.floor(Math.random()*APL.lugC.length)],big=Math.random()<.45,h=big?.68:.52,w=big?.44:.36,dk=[.06,.06,.065],al=[.62,.64,.66];
 if(!aplPart(n,'box',4,[0,-.395,0],[.15,.03,.035],dk))return;aplPart(n,'box',4,[-.065,-.6,.02],[.016,.4,.016],al);aplPart(n,'box',4,[.065,-.6,.02],[.016,.4,.016],al);
 const yc=-.8-h/2;aplPart(n,'box',4,[0,yc,.03],[w,h,.24],c);aplPart(n,'box',4,[0,yc+h*.18,.155],[w*.86,.02,.012],c.map(v=>v*.7));aplPart(n,'box',4,[0,yc-h*.3,.155],[w*.86,.02,.012],c.map(v=>v*.7));
 aplPart(n,'sph',4,[-w*.38,yc-h/2-.02,.12],[.07,.07,.045],dk);aplPart(n,'sph',4,[w*.38,yc-h/2-.02,.12],[.07,.07,.045],dk);n.lug=h;}
function aplCrew(n){const v=APL.vis[Math.random()<.65?0:1],tor=NPCG.T.indexOf('torso');aplRecolor(n,p=>p.b===1&&p.t===tor,v);aplRecolor(n,p=>p.b===1&&p.t===NPCG.T.indexOf('box')&&p.s[1]>.3,v);
 const tw=.43,st=[.82,.84,.86];aplPart(n,'box',1,[0,.24,0],[tw*1.12,.04,.31],st);aplPart(n,'box',1,[0,.4,0],[tw*1.12,.04,.31],st);aplPart(n,'box',1,[-.07,.47,-.16],[.04,.3,.012],st);aplPart(n,'box',1,[.07,.47,-.16],[.04,.3,.012],st);
 const ec=Math.random()<.5?[.6,.08,.08]:[.12,.32,.14],hs=(o,s)=>[[o[0]*.72,.1425+(o[1]-.17)*.82,o[2]*.79],[s[0]*.72,s[1]*.82,s[2]*.79]];
 for(const sx of[-1,1]){const q=hs([sx*.13,.17,0],[.07,.11,.1]);aplPart(n,'sph',2,q[0],q[1],ec);}const q=hs([0,.33,0],[.3,.025,.04]);aplPart(n,'box',2,q[0],q[1],[.1,.1,.11]);n.crew=true;}
{const nb0=npcBones;npcBones=function(n){nb0(n);if(!n.lug||n.rag||n.flee>0)return;const B=n.B,sc=n.sc,sp=n.spdNow||0;
 _nm[1].makeRotationFromEuler(_ne.set(-.42-(sp>.2?.04*Math.sin(n.ph):0),0,-.07)).setPosition(-(n.f?.2:.23)*sc,.58*sc,0);B[3].multiplyMatrices(B[1],_nm[1]);B[4].multiplyMatrices(B[3],_nm[1].makeRotationX(.04).setPosition(0,-.32*sc,0));};}
// ---------- dove nascono: dentro i terminal, sul marciapiede, nel parcheggio, sul piazzale accanto agli aerei ----------
function aplWhere(x,z){if(!APL.ready)return null;for(const k of['cyi','cyw']){const Z=APL[k],b=Z.box;if(x>b[0]&&x<b[1]&&z>b[2]&&z<b[3])return k;}return null;}
function aplEdgePick(G,P,dmin,dmax){for(let k=0;k<12;k++){const a=G.N[Math.floor(Math.random()*G.N.length)];if(!a.nb.length)continue;const b=a.nb[Math.floor(Math.random()*a.nb.length)],t=Math.random(),x=lerp(a.x,b.x,t),z=lerp(a.z,b.z,t),d=Math.hypot(x-P.x,z-P.z);if(d<dmin||d>dmax)continue;return {G,a,b,x,z};}return null;}
function aplStand(ap,P){const A=AP[ap];for(let k=0;k<10;k++){const st=A.stands[Math.floor(Math.random()*A.stands.length)],wide=st.w>40,L=wide?62.8:(ap==='CYI'?37.6:27.2);let x,z;
  if(Math.random()<.55){x=st.x+rand(-st.w*.42,st.w*.42);z=st.z+rand(2,9);}else{x=st.x+rand(-st.w*.45,st.w*.45);z=st.z+rand(4,L);}
  const dx=Math.abs(x-st.x);if(dx<(wide?3.8:2.6))continue;if(dx>(wide?7:4.2)&&dx<(wide?18:7.6)&&z>st.z+L*.3&&z<st.z+L*.62)continue;const d=Math.hypot(x-P.x,z-P.z);if(d<25||d>170)continue;return {crew:{st,ap,L,wide},x,z};}return null;}
function aplSpot(){const P=player,w=aplWhere(P.x,P.z);if(!w)return null;const r=Math.random();
 if(w==='cyi'){const Z=APL.cyi;if(r<.5)return aplEdgePick(Z.G,P,22,170);if(r<.82)return aplEdgePick(Z.O,P,25,170);return aplStand('CYI',P);}
 if(r<.68)return aplEdgePick(APL.cyw.G,P,22,170);return aplStand('CYW',P);}
{const ns1=npcSpot;npcSpot=function(){const P=player;if(aplWhere(P.x,P.z)){const s=aplSpot();if(s){APL.pend=s;return [s.x,s.z];}return null;}return ns1();};}
{const sp1=spawnNPC;spawnNPC=function(x,y,z,o){const p=APL.pend;APL.pend=null;const n=sp1(x,y,z,o);if(!n||!p)return n;
 if(p.crew){n.apz={crew:p.crew,tx:x,tz:z,idle:rand(1,6)};aplCrew(n);n.spd=rand(1.05,1.45);return n;}
 const lo=p.G.kind==='in'?rand(-.55,.55):rand(-.9,.9);n.apz={G:p.G,a:p.a,b:p.b,sx:x,sz:z,lo,idle:0};n.y=groundH(x,z);
 if(Math.random()<(p.G.kind==='in'?.62:.5))aplLuggage(n);if(n.lug)n.spd*=.86;return n;};}
// ---------- camminata sul grafo, soste, fuga verso il lato opposto all'esplosione ----------
function aplNext(n,Z){const b=Z.b,c=b.nb.filter(q=>q!==Z.a);let L=c.length?c:b.nb;if(!L.length)return Z.a;
 if(n.flee>0){let best=L[0],bd=-1;for(const q of L){const d=Math.hypot(q.x-n.fx,q.z-n.fz);if(d>bd){bd=d;best=q;}}return best;}
 const hx=b.x-Z.a.x,hz=b.z-Z.a.z,hl=Math.hypot(hx,hz)||1;let tot=0;const w=L.map(q=>{const qx=q.x-b.x,qz=q.z-b.z,ql=Math.hypot(qx,qz)||1,al=(qx*hx+qz*hz)/(ql*hl);const v=1+Math.max(0,al)*1.2+(q.idle?.4:0);tot+=v;return v;});
 let r=Math.random()*tot;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i];}return L[L.length-1];}
function aplWalk(n,dt){const Z=n.apz;
 if(Z.crew){const C=Z.crew,st=C.st;let sp=n.spd;if(n.flee>0){n.apz=null;return false;}
  if(Z.idle>0){Z.idle-=dt;n.spdNow=0;if(Z.face!==undefined)n.yaw+=Math.atan2(Math.sin(Z.face-n.yaw),Math.cos(Z.face-n.yaw))*Math.min(1,dt*3);n.y=groundH(n.x,n.z);return true;}
  const dx=Z.tx-n.x,dz=Z.tz-n.z,d=Math.hypot(dx,dz);if(d<.4){Z.idle=rand(2,12);Z.face=Math.atan2(-(st.x-n.x),-(st.z+8-n.z))+rand(-1,1);
   for(let k=0;k<6;k++){const x=st.x+rand(-st.w*.44,st.w*.44),z=Math.random()<.6?st.z+rand(2,9):st.z+rand(4,C.L),ax=Math.abs(x-st.x);if(ax<(C.wide?3.8:2.6))continue;if(ax>(C.wide?7:4.2)&&ax<(C.wide?18:7.6)&&z>st.z+C.L*.3&&z<st.z+C.L*.62)continue;Z.tx=x;Z.tz=z;break;}return true;}
  const s=Math.min(d,sp*dt);n.x+=dx/d*s;n.z+=dz/d*s;n.yaw=Math.atan2(-dx,-dz);n.spdNow=sp;n.ph+=sp*dt*TAU/1.5;n.y=groundH(n.x,n.z);return true;}
 const G=Z.G;let sp=n.spd;if(n.flee>0){sp=G.kind==='in'?3.9:4.4;Z.idle=0;n.flee-=dt;if(G.kind==='out'){n.apz=null;n.flee+=dt;return false;}}
 if(Z.idle>0){Z.idle-=dt;n.spdNow=0;if(Z.b.face!==undefined)n.yaw+=Math.atan2(Math.sin(Z.b.face-n.yaw),Math.cos(Z.b.face-n.yaw))*Math.min(1,dt*3);n.y=groundH(n.x,n.z);return true;}
 const b=Z.b,ex=b.x-Z.sx,ez=b.z-Z.sz,L=Math.hypot(ex,ez)||1e-3,ux=ex/L,uz=ez/L;
 // punto d'arrivo con il proprio scostamento laterale (così non camminano tutti sulla stessa riga)
 const tx=b.x-uz*Z.lo,tz=b.z+ux*Z.lo,dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz);
 if(d<.35){
  // dal marciapiede si entra nel terminal attraverso la porta automatica
  if(G.kind==='out'&&b.doorIn&&Z.a!==b.link){Z.G=APL.cyi.G;Z.a=b;Z.b=b.link;Z.sx=n.x;Z.sz=n.z;return true;}
  if(b.idle&&!(n.flee>0)&&Math.random()<(b.pw||0))Z.idle=rand(b.idle[0],b.idle[1]);const nx=aplNext(n,Z);Z.a=b;Z.b=nx;Z.sx=n.x;Z.sz=n.z;return true;}
 const s=Math.min(d,sp*dt);n.x+=dx/d*s;n.z+=dz/d*s;n.yaw=Math.atan2(-dx,-dz);n.spdNow=sp;n.ph+=sp*dt*TAU/(sp>3?2.4:1.5);n.y=groundH(n.x,n.z);
 // spinto via da un'esplosione o da un'auto: riparte verso il nodo più vicino del suo percorso
 {const px=n.x-Z.sx,pz=n.z-Z.sz;if(Math.abs(px*uz-pz*ux)>3.5){let bn=G.N[0],bd=1e9;for(const q of G.N){const e=Math.hypot(q.x-n.x,q.z-n.z);if(e<bd){bd=e;bn=q;}}Z.a=bn;Z.b=bn;Z.sx=n.x;Z.sz=n.z;}}
 return true;}
{const nw2=npcWalk;npcWalk=function(n,dt){if(n.apz&&!n.ctl){if(aplWalk(n,dt))return;}return nw2(n,dt);};}
// chi esce dal terminal passa sul marciapiede: dal nodo interno della porta si torna al grafo esterno
function aplLinkBack(){const Z=APL.cyi;if(!Z)return;for(const n of Z.O.N)if(n.doorIn){const inn=n.link;inn.out=n;}}
{const an0=aplNext;aplNext=function(n,Z){const b=Z.b;if(b.out&&Z.G.kind==='in'&&n.flee<=0&&Math.random()<.18){Z.G=APL.cyi.O;return b.out;}if(b.out&&Z.G.kind==='in'&&n.flee>0){Z.G=APL.cyi.O;return b.out;}return an0(n,Z);};}
// ---------- porte scorrevoli automatiche sulla facciata lato città ----------
function aplDoorsBuild(){if(!APL.doors.length)return;const gm=AP.glass.length?AP.glass[0].gI.material:new THREE.MeshPhysicalMaterial({color:0xd6e6ec,transparent:true,opacity:.2,depthWrite:false}),fm=MS(0x8f979e,.32,.85),H=12-.15;
 const pane=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),gm,APL.doors.length*3);pane.renderOrder=3;
 const fr=Bin(),lg=new THREE.BoxGeometry(1.4,2.56,.035),lf=Bin();lf.add(new THREE.BoxGeometry(1.44,.07,.06),0,1.285,0).add(new THREE.BoxGeometry(1.44,.1,.06),0,-1.27,0).add(new THREE.BoxGeometry(.06,2.6,.06),-.7,0,0).add(new THREE.BoxGeometry(.06,2.6,.06),.7,0,0).add(new THREE.BoxGeometry(.04,.06,.4),.62,0,0);
 const leafG=new THREE.InstancedMesh(lg,gm,APL.doors.length*2),leafF=new THREE.InstancedMesh(mergeBin(lf),fm,APL.doors.length*2);leafG.renderOrder=3;leafF.castShadow=true;
 APL.doors.forEach((D,k)=>{const g=AP.glass.find(q=>q.b===D.g&&q.ax==='z'&&Math.abs(q.bb[2]+.3-D.z)<.5&&Math.abs((q.bb[0]+q.bb[3])/2-D.x)<1);D.gl=g;
  const a=g?g.bb[0]:D.x-6,b=g?g.bb[3]:D.x+6,y0=.15,w2=D.w/2+.08;if(g){g.gI.setMatrixAt(g.i,_m0);g.gI.instanceMatrix.needsUpdate=true;}
  const put=(i,x0,x1,ya,yb)=>{_dm.position.set((x0+x1)/2,(ya+yb)/2,D.z);_dm.rotation.set(0,0,0);_dm.scale.set(x1-x0,yb-ya,.05);_dm.updateMatrix();pane.setMatrixAt(k*3+i,_dm.matrix);};
  put(0,a,D.x-w2,y0,y0+H);put(1,D.x+w2,b,y0,y0+H);put(2,D.x-w2,D.x+w2,y0+2.86,y0+H);
  fr.add(new THREE.BoxGeometry(D.w+.3,.2,.24),D.x,y0+2.76,D.z).add(new THREE.BoxGeometry(.12,2.7,.24),D.x-w2,y0+1.35,D.z).add(new THREE.BoxGeometry(.12,2.7,.24),D.x+w2,y0+1.35,D.z).add(new THREE.BoxGeometry(D.w+.3,.04,1.4),D.x,y0+.02,D.z);D.k=k;});
 const frm=new THREE.Mesh(mergeBin(fr),fm);frm.castShadow=true;frm.receiveShadow=true;scene.add(pane,leafG,leafF,frm);APL.dm={pane,leafG,leafF};aplDoorsPose(true);}
function aplDoorsPose(all){const M=APL.dm;if(!M)return;let ch=false;for(const D of APL.doors){if(!all&&!D.dirty)continue;D.dirty=false;ch=true;const e=D.t*D.t*(3-2*D.t),y=.15+1.33,dead=D.gl&&!D.gl.alive;
  for(let s=0;s<2;s++){const sg=s?1:-1,x=D.x+sg*(.71+e*1.36);if(dead){M.leafG.setMatrixAt(D.k*2+s,_m0);M.leafF.setMatrixAt(D.k*2+s,_m0);continue;}_dm.position.set(x,y,D.z+.13);_dm.rotation.set(0,s?Math.PI:0,0);_dm.scale.set(1,1,1);_dm.updateMatrix();M.leafG.setMatrixAt(D.k*2+s,_dm.matrix);M.leafF.setMatrixAt(D.k*2+s,_dm.matrix);}
  if(dead)for(let i=0;i<3;i++)M.pane.setMatrixAt(D.k*3+i,_m0);}
 if(ch){M.leafG.instanceMatrix.needsUpdate=M.leafF.instanceMatrix.needsUpdate=M.pane.instanceMatrix.needsUpdate=true;}}
function aplDoorsStep(dt){if(!APL.dm)return;const cp=camera.position;for(const D of APL.doors){if(Math.abs(cp.x-D.x)>260||Math.abs(cp.z-D.z)>260)continue;let near=false;const P=player;
  if(Math.abs(P.x-D.x)<2.4&&Math.abs(P.z-D.z)<3.6&&P.y<6)near=true;if(!near)for(const n of NPC.list){if(n.dead||n.rag)continue;if(Math.abs(n.x-D.x)<2.2&&Math.abs(n.z-D.z)<3.4){near=true;break;}}
  const tg=near?1:0;if(D.t!==tg){const o=D.t;D.t=clamp(D.t+(tg>D.t?1.5:-.9)*dt,0,1);D.dirty=true;if(o===0&&tg===1&&AU.ok&&Math.hypot(cp.x-D.x,cp.z-D.z)<25)sfx({x:D.x,y:1.4,z:D.z,src:'noise',filter:'bandpass',ff0:900,ff1:500,q:.8,g:.06,a:.08,d:.7,ref:4});}}aplDoorsPose(false);}
{const sh0=apShatter;apShatter=function(g,vx,vz){sh0(g,vx,vz);for(const D of APL.doors)if(D.gl===g)D.dirty=true;};}
// ---------- avvio e aggiornamento ----------
{const ti1=trInit;trInit=function(){ti1();try{aplBuild();aplLinkBack();aplDoorsBuild();}catch(e){console.warn('aeroporti vivi',e);}};}
{const as0=apStep;apStep=function(dt){as0(dt);try{aplDoorsStep(dt);}catch(e){}};}
