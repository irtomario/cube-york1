/* ---------- Distretto Nova: grattacieli dalle forme curve, palazzi moderni, arredo urbano ---------- */
const NOVA={T:[],B:[],screens:[]};
function nvTowers(){const add=o=>{const T=htNew(o);NOVA.T.push(T);return T;};
 add({name:'Nova Spire',x:1806,z:976,H:328,st:HTS.glass,a0:27,a1:15.5,b0:27,b1:15.5,n:4.4,twist:Math.PI/2,core:.3,S:24,J:3,hp0:240,seed:.137,K:7});
 add({name:'Helix',x:1594,z:976,H:264,st:HTS.diag,a0:28,a1:20,b0:18.5,b1:14,twist:Math.PI,core:.32,S:24,J:3,hp0:225,seed:.71});
 add({name:'Lens',x:1594,z:1165,H:200,st:HTS.glass,a0:31,b0:13,rot0:.35,core:.3,S:24,J:3,hp0:210,seed:.43,set:(t,y,f,q)=>{if(t>.78){const k=(t-.78)/.22,a=31*(1-k*.72);q.ox=(31-a)*Math.cos(.35);q.oz=(31-a)*Math.sin(.35);q.a=a;q.ri=.3*Math.min(q.a,q.b);}}});
 add({name:'Vela',x:1806,z:1165,H:232,st:HTS.fins,a0:26,a1:19,b0:20,b1:15,k3:.16,twist:.55,lx:t=>-8*t*t,lz:t=>6*t*t,core:.3,S:24,J:3,hp0:220,seed:.29});
 add({name:'Prisma',x:1978,z:976,H:216,st:HTS.glass,a0:25,a1:21,b0:25,b1:21,k3:.2,twist:2.094,core:.3,S:21,J:3,hp0:215,seed:.88});
 add({name:'Gemello Ovest',x:1350,z:976,H:180,st:HTS.glass,a0:17,b0:17,core:.34,S:18,J:3,hp0:225,seed:.52});
 add({name:'Gemello Est',x:1436,z:976,H:180,st:HTS.glass,a0:17,b0:17,core:.34,S:18,J:3,hp0:225,seed:.53});
 add({name:'Onda',x:1978,z:1165,H:152,st:HTS.white,a0:20,b0:18,k4:.07,p4:(t,y)=>y*.045,core:.3,S:24,J:4,hp0:200,seed:.64});
 add({name:'Torre Inclinata',x:1594,z:785,H:140,st:HTS.fins,a0:20,b0:13,n:6,lx:(t,y)=>y*.21,core:.3,S:20,J:3,hp0:225,seed:.33});
 add({name:'Faro',x:1392,z:1353,H:168,st:HTS.diag,a0:22,b0:22,k3:.15,twist:1.05,core:.3,S:21,J:3,hp0:210,seed:.21});
 add({name:'Marina',x:1978,z:1353,H:160,st:HTS.white,a0:22,b0:16,twist:.8,core:.3,S:24,J:3,hp0:200,seed:.95});
 add({name:'Anello',x:NV.RING.x,z:NV.RING.z,H:20,st:HTS.ring,a0:NV.RING.R,b0:NV.RING.R,hollow:true,core:0,ri:()=>NV.RING.R-NV.RING.W,S:72,J:2,K:9,hp0:190,seed:.11});
 const D=NV.DOME,Rs=(D.R*D.R+D.H*D.H)/(2*D.H),y0=D.H-Rs;
 add({name:'Cupola',x:D.x,z:D.z,H:D.H,st:HTS.dome,hollow:true,core:0,S:40,J:2,K:9,hp0:160,seed:.6,sh:(y,f,q)=>{const r=Math.max(.6,Math.sqrt(Math.max(0,Rs*Rs-(y-y0)*(y-y0))));q.a=q.b=r;q.n=2;q.k3=0;q.k4=0;q.rot=0;q.ox=0;q.oz=0;q.ri=Math.max(0,r-2.4);return q;}});}
// accessori: antenne, corone luminose, passerella tra i gemelli, luci per gli aerei
function nvAcc(){const steel=MS(0xc9ced3,.3,.9),dk=MS(0x30343a,.5,.7),led=new THREE.MeshBasicMaterial({color:new THREE.Color(.25,2.2,3.2)}),red=[4,.15,.08];
 const top=(T)=>{const q=T.sh(T.H-.01,T.nF-1,{});return {x:T.x+q.ox,z:T.z+q.oz,q};};
 const obst=(T,A,extra)=>{const t=top(T),n=T.H>200?4:3;for(let k=0;k<n;k++){const a=k/n*TAU+.3,r=hRad(t.q,a-t.q.rot)*.92;A.lp.push(LP.a.length/9);lpAdd(t.x+Math.cos(a)*r,T.H+.6,t.z+Math.sin(a)*r,red,.55,1,k*.07);}
  if(T.H>150){for(let k=0;k<3;k++){const y=T.H*.5,f=Math.floor(y/4),q=T.sh(y,f,{}),a=k/3*TAU;const r=hRad(q,a-q.rot)+.3;A.lp.push(LP.a.length/9);lpAdd(T.x+q.ox+Math.cos(a)*r,y,T.z+q.oz+Math.sin(a)*r,red,.45,0,0);}}};
 for(const T of NOVA.T){if(T.H<100)continue;const t=top(T),RS=T.nF*T.S,topCell=T.coreOn?RS+T.nF-1:(T.nF-1)*T.S;const g=new THREE.Group();g.position.set(t.x,T.H,t.z);
  if(T.name==='Nova Spire'){AB(g,new THREE.CylinderGeometry(3.2,4.4,6,16),dk,0,3,0);AB(g,new THREE.CylinderGeometry(.35,1.9,62,12),steel,0,37,0);AB(g,new THREE.SphereGeometry(.9,12,8),steel,0,68.5,0);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(hRad(t.q,.785)*.98,.45,8,96).rotateX(Math.PI/2),led);ring.position.y=-6;g.add(ring);const A=htAcc(T,g,topCell);A.lp.push(LP.a.length/9);lpAdd(t.x,T.H+69.5,t.z,red,.8,1,0);obst(T,A);}
  else if(T.name==='Helix'){for(const s of[-1,1])AB(g,new THREE.CylinderGeometry(.25,.6,26,8),steel,s*5,13,0);const A=htAcc(T,g,topCell);for(const s of[-1,1]){A.lp.push(LP.a.length/9);lpAdd(t.x+s*5,T.H+26.4,t.z,red,.6,1,s*.2);}obst(T,A);}
  else if(T.name==='Gemello Ovest'){const A=htAcc(T,g,topCell);obst(T,A);
   // passerella sospesa tra i due gemelli al 35° piano
   const W=NOVA.T.find(x=>x.name==='Gemello Est'),y=35*4,len=W.x-T.x-2*16.2,br=new THREE.Group();br.position.set((T.x+W.x)/2,y,T.z);
   const glass=new THREE.MeshPhysicalMaterial({color:lc(0x9fc6d4),roughness:.05,metalness:.3,transparent:true,opacity:.42,clearcoat:1});AB(br,new THREE.BoxGeometry(len,1.1,9),MS(0xd8dcdf,.4,.6),0,0,0);AB(br,new THREE.BoxGeometry(len,.9,9.2),MS(0xd8dcdf,.4,.6),0,6.3,0);
   for(const s of[-1,1])AB(br,new THREE.BoxGeometry(len,5.2,.12),glass,0,3.15,s*4.5);for(let i=0;i<=8;i++)for(const s of[-1,1])AB(br,new THREE.BoxGeometry(.25,5.4,.3),MS(0xd8dcdf,.4,.6),-len/2+i*len/8,3.15,s*4.5);
   AB(br,new THREE.BoxGeometry(len,.12,.3),new THREE.MeshBasicMaterial({color:new THREE.Color(.3,2,2.8)}),0,-.6,4.6);const A1=htAcc(T,br,35*T.S+0,{});const A2={T:W,obj:br,cell:35*W.S+Math.round(W.S/2),gone:false,lp:[],link:A1};A1.link=A2;W.acc.push(A2);HT.acc.push(A2);}
  else{const A=htAcc(T,g,topCell);AB(g,new THREE.BoxGeometry(6,3,4),dk,0,1.5,0);AB(g,new THREE.CylinderGeometry(.2,.3,12,6),steel,2,7,1);obst(T,A);}}}
/* ---------- palazzi moderni a voxel (distruttibili come quelli di Manhattan) ---------- */
function nvGen(){const sn=v=>Math.round((v-2)/4)*4+2;
 const add=(x0,z0,x1,z1,fl,st,tw)=>{const a=sn(x0),c=sn(z0),w=Math.max(8,Math.floor((x1-a)/4)*4),d=Math.max(8,Math.floor((z1-c)/4)*4);const tiers=tw?tw:[[0,0,fl]];const b=addBuilding(a,c,w,d,fl,st,tiers);b.nova=true;NOVA.B.push(b);return b;};
 const park=(x0,z0,x1,z1)=>NV.parks.push([x0,x1,z0,z1]);
 // blocco (2,0): centro dati + uffici
 add(1728,331,1884,411,4,10);add(1736,427,1792,479,22,8,[[0,0,4],[1,4,22]]);add(1812,427,1876,479,9,9);
 // blocco (3,0)
 add(1926,331,1982,395,16,8);add(1994,331,2030,447,26,9);add(1926,411,1986,479,10,6);
 // blocco (2,1)
 add(1728,521,1800,593,24,8,[[0,0,4],[1,4,24]]);add(1816,521,1884,581,12,9);add(1728,609,1884,669,6,3);
 // blocco (3,1): autosilo e giardino
 add(1926,521,2030,601,5,3).noProps=true;park(1926,613,2030,669);
 // blocco (0,2): residenze
 add(1311,711,1371,771,14,9);add(1391,711,1475,763,11,9);add(1311,791,1363,857,18,9);park(1380,780,1475,857);
 // blocco (2,2): albergo e uffici
 add(1728,711,1800,799,30,8,[[0,0,5],[2,5,30]]);add(1820,711,1884,767,12,6);add(1728,815,1884,857,5,9);
 // blocco (3,2)
 add(1926,711,2030,763,20,8);add(1926,779,1990,857,8,9);park(1998,779,2030,857);
 // blocco (0,4)
 add(1311,1091,1383,1163,28,8,[[0,0,6],[1,6,28]]);add(1399,1091,1475,1143,12,9);add(1311,1183,1475,1239,7,6);
 // padiglioni bassi accanto alle torri
 add(1728,903,1764,947,2,9);add(1848,1011,1884,1049,3,8);add(1516,903,1552,935,2,9);add(1640,1205,1676,1241,3,9);add(1926,1205,1962,1241,2,8);
 park(1520,1090,1556,1130);park(1846,1090,1884,1130);park(1311,1290,1350,1330);park(1990,1290,2030,1330);}
/* ---------- arredo urbano: lampioni LED, alberi, panchine; auto in sosta; schermi giganti ---------- */
function nvProps(){const pole=new THREE.CylinderGeometry(.06,.11,7.6,10).translate(0,3.8,0),arm=new THREE.CylinderGeometry(.045,.045,1.9,8).rotateX(Math.PI/2).translate(0,7.42,-.88),
  head=new THREE.BoxGeometry(.3,.07,.82).translate(0,7.36,-1.75),base=new THREE.CylinderGeometry(.2,.24,.5,10).translate(0,.25,0);
 const steel=new THREE.MeshStandardMaterial({color:lc(0x7c8287),roughness:.35,metalness:.85});
 const nl=defProp('nlamp',[{g:mergeGeos([pole,arm,base]),m:steel},{g:head,m:lampHead}],[.25,3.8,.25],140,1600,'metal',.04);
 const wood=new THREE.MeshStandardMaterial({color:lc(0x6a4a30),roughness:.75}),cst=new THREE.MeshStandardMaterial({color:lc(0x9d9a94),roughness:.9});
 const slats=[];for(let i=0;i<5;i++)slats.push(new THREE.BoxGeometry(1.9,.04,.11).translate(0,.46,-.24+i*.12));for(let i=0;i<3;i++)slats.push(new THREE.BoxGeometry(1.9,.1,.04).translate(0,.62+i*.12,.33).rotateX(-.15));
 const bench=defProp('nbench',[{g:mergeGeos(slats),m:wood},{g:mergeGeos([new THREE.BoxGeometry(.16,.44,.62).translate(-.8,.22,0),new THREE.BoxGeometry(.16,.44,.62).translate(.8,.22,0)]),m:cst}],[1,.4,.35],60,700,'wood',.3);
 const bol=defProp('bollard',[{g:new THREE.CylinderGeometry(.11,.12,.95,12).translate(0,.47,0),m:steel},{g:new THREE.CylinderGeometry(.115,.115,.04,12).translate(0,.8,0),m:new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.5,1.3)})}],[.12,.47,.12],40,900,'metal',.02);
 const inX=(z,m)=>{for(const t of NV.ST)if(Math.abs(z-t.z)<t.hw+m)return true;return false;},inA=(x,m)=>{for(const a of NV.AV)if(Math.abs(x-a.x)<a.hw+m)return true;return false;};
 const R=mulberry32(4242);
 for(const a of NV.AV){for(let t=15+30*Math.ceil((a.a-15)/30);t<a.b;t+=30){if(inX(t,6)||(Math.abs(a.x-1700)<1&&t>1265))continue;addProp(nl,a.x+a.hw+.9,.15,t,Math.PI/2);addProp(nl,a.x-a.hw-.9,.15,t,-Math.PI/2);}
  for(let t=7.5+15*Math.ceil((a.a-7.5)/15);t<a.b;t+=15){if(inX(t,7)||R()>.55)continue;for(const s of[-1,1])addProp(PK.tree,a.x+s*(a.hw+1.8),.15,t,R()*TAU);}
  if(Math.abs(a.x-1700)<1)for(let t=a.a+8;t<1262;t+=12){if(inX(t,4))continue;addProp(PK.tree,1700,.15,t,R()*TAU);}}
 for(const s of NV.ST){for(let t=15+30*Math.ceil((s.a-15)/30);t<s.b;t+=30){if(inA(t,6))continue;addProp(nl,t,.15,s.z+s.hw+.9,0);addProp(nl,t,.15,s.z-s.hw-.9,Math.PI);}
  for(let t=7.5+15*Math.ceil((s.a-7.5)/15);t<s.b;t+=15){if(inA(t,7)||R()>.5)continue;for(const k of[-1,1])addProp(PK.tree,t,.15,s.z+k*(s.hw+1.8),R()*TAU);}}
 // lungomare: panchine, lampioni bassi, alberi in vaso
 for(let x=1290;x<2056;x+=20){addProp(bench,x+6,.15,1478,Math.PI);if(Math.round(x/20)%2)addProp(PK.tree,x-3,.15,1468,R()*TAU);}
 for(let x=1284;x<2060;x+=4)addProp(bol,x,.15,1453.5,0);
 // giardino del campus (dentro l'anello) e parchi
 const C=NV.RING;for(let i=0,n=0;i<4000&&n<150;i++){const a=R()*TAU,r=25+R()*52,x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r;if(Math.abs(r-56)<4||Math.abs(x-C.x)<4||Math.abs(z-C.z)<4)continue;addProp(PK.tree,x,.15,z,R()*TAU);n++;}
 for(let i=0;i<24;i++){const a=i/24*TAU;addProp(bench,C.x+Math.cos(a)*59,.15,C.z+Math.sin(a)*59,-a-Math.PI/2);}
 for(let i=0,n=0;i<3000&&n<90;i++){const x=1305+R()*373,z=325+R()*350,d=Math.hypot(x-C.x,z-C.z);if(d<C.R+6||Math.abs(d-136)<3)continue;addProp(PK.tree,x,.15,z,R()*TAU);n++;}
 for(const p of NV.parks){const n=Math.floor((p[1]-p[0])*(p[3]-p[2])/220);for(let i=0;i<n;i++)addProp(PK.tree,p[0]+3+R()*(p[1]-p[0]-6),.15,p[2]+3+R()*(p[3]-p[2]-6),R()*TAU);}
 // piazza del mare: panchine attorno alla cupola, alberi in fila
 for(let i=0;i<32;i++){const a=i/32*TAU,D=NV.DOME;addProp(bench,D.x+Math.cos(a)*(D.R+16),.15,D.z+Math.sin(a)*(D.R+16),-a+Math.PI/2);if(i%2===0)addProp(PK.tree,D.x+Math.cos(a)*(D.R+24),.15,D.z+Math.sin(a)*(D.R+24),R()*TAU);}
 // piazze attorno ai grattacieli
 for(const T of NOVA.T){if(T.hollow)continue;const rr=T.rb+8;for(let i=0;i<10;i++){const a=i/10*TAU+.2,x=T.x+Math.cos(a)*rr,z=T.z+Math.sin(a)*rr;if(inA(x,6)||inX(z,6)||bAt(x,z))continue;addProp(i%2?bench:PK.tree,x,.15,z,-a+Math.PI/2);}}}
function nvCars(){const R=mulberry32(909),inX=(z,m)=>{for(const t of NV.ST)if(Math.abs(z-t.z)<t.hw+m)return true;return false;},inA=(x,m)=>{for(const a of NV.AV)if(Math.abs(x-a.x)<a.hw+m)return true;return false;};
 const put=(x,z,yaw)=>{if(PC.slots.length>=1440)return;const col=CAR_COLS[3+Math.floor(R()*(CAR_COLS.length-3))];const sl={i:PC.slots.length,x,z,yaw,y:.96,col:lc(col),taxi:false,alive:true};PC.slots.push(sl);setSlot(sl,true);};
 for(const a of NV.AV){const off=a.hw>12?13.8:a.hw-1.2;for(let t=a.a+10;t<a.b-6;t+=7.4){if(inX(t,7)||R()>.32)continue;for(const s of[-1,1])if(R()<.6)put(a.x+s*off,t,s>0?0:Math.PI);}}
 for(const s of NV.ST){if(s.hw<8)continue;for(let t=s.a+10;t<s.b-6;t+=7.4){if(inA(t,7)||R()>.28)continue;for(const k of[-1,1])if(R()<.6)put(t,s.z+k*(s.hw-1.2),k>0?-Math.PI/2:Math.PI/2);}}}
// schermi giganti animati sulle facciate che guardano il viale
function nvScreens(){let n=40;const put=(b,x,y,z,w,h,ry,ix,iz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:adCanvas(n++),color:new THREE.Color(2.2,2.2,2.2)}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);BBS.push({m,b,x:ix,y,z:iz,ph:Math.random()*10});};
 for(const b of NOVA.B){if(b.h<40)continue;if(b.x0>1700&&b.x0<1740){put(b,b.x0-.25,Math.min(b.h-10,34),b.z0+b.d/2,Math.min(26,b.d-8),14,-Math.PI/2,b.x0+1.25,b.z0+b.d/2);}
  else if(b.x0+b.w<1700&&b.x0+b.w>1660){put(b,b.x0+b.w+.25,Math.min(b.h-10,34),b.z0+b.d/2,Math.min(24,b.d-8),13,Math.PI/2,b.x0+b.w-1.25,b.z0+b.d/2);}}}
// parapetto del lungomare e scogliera artificiale
function nvShore(){const steel=MS(0x8e959b,.3,.85),glass=new THREE.MeshPhysicalMaterial({color:lc(0xbcd6dc),roughness:.04,metalness:.1,transparent:true,opacity:.28,depthWrite:false});
 const L=2062-1278,g=new THREE.Group();AB(g,new THREE.BoxGeometry(L,.06,.12),steel,0,1.1,0);AB(g,new THREE.BoxGeometry(L,1,.03),glass,0,.58,0).castShadow=false;
 const posts=new THREE.InstancedMesh(new THREE.BoxGeometry(.08,1.1,.08),steel,Math.ceil(L/2.5));for(let i=0;i<posts.count;i++){_m4.makeTranslation(-L/2+i*2.5,.55,0);posts.setMatrixAt(i,_m4);}posts.castShadow=true;g.add(posts);
 g.position.set((1278+2062)/2,.15,1499.2);scene.add(g);seawall(1260,1500,2080,1500,0,1);}
