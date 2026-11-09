/* ======================= PATCH AA — AUTO NUOVE: CARROZZERIE PARAMETRICHE A PEZZI (berlina, hatchback, station wagon, SUV, pick-up, sportiva, hypercar) ======================= */
// Ogni auto è fatta di pannelli veri: cofano, portiere, bagagliaio/portellone, paraurti, vetri separati. Restano UNA sola mesh per
// la carrozzeria e una per i vetri (poche chiamate di disegno sul telefono): un pezzo che si stacca viene tolto dall'indice dei
// triangoli e diventa un rottame che vola via, lasciando il buco vero (si vedono l'abitacolo e i sedili).
const CDEF={
 // L lunghezza, W semilarghezza, fa/ra assi, r ruota, cl luce a terra, hb altezza paraurti, hh cofano (inizio/fine), belt linea di cintura, roof tetto,
 // zw parabrezza (base,cima), zr fine tetto, zg fine vetro posteriore, deck coda, rear tipo coda, doors numero porte per lato, n squadratura
 sedan:{L:4.62,W:.915,fa:-1.38,ra:1.42,r:.34,cl:.17,hb:.52,hh:[.74,.86],belt:.98,roof:1.44,zw:[-1.02,-.28],zr:.52,zg:1.32,deck:1.0,rear:'sedan',doors:2,n:4.4,mass:1450},
 hatch:{L:4.2,W:.9,fa:-1.3,ra:1.3,r:.33,cl:.16,hb:.52,hh:[.74,.86],belt:.98,roof:1.46,zw:[-.92,-.2],zr:1.42,zg:1.86,deck:1.0,rear:'hatch',doors:2,n:4.2,mass:1250},
 wagon:{L:4.78,W:.915,fa:-1.4,ra:1.42,r:.34,cl:.17,hb:.53,hh:[.74,.87],belt:.99,roof:1.5,zw:[-1.04,-.3],zr:2.05,zg:2.24,deck:1.0,rear:'wagon',doors:2,n:4.4,mass:1550},
 suv:{L:4.62,W:.935,fa:-1.36,ra:1.36,r:.37,cl:.22,hb:.62,hh:[.92,1.02],belt:1.12,roof:1.7,zw:[-.95,-.25],zr:1.88,zg:2.12,deck:1.1,rear:'suv',doors:2,n:5,mass:1800},
 pickup:{L:5.6,W:.99,fa:-1.92,ra:1.72,r:.4,cl:.25,hb:.7,hh:[1.03,1.12],belt:1.2,roof:1.86,zw:[-1.15,-.48],zr:.62,zg:.72,deck:1.18,rear:'bed',doors:2,n:5.6,mass:2300},
 sports:{L:4.5,W:.93,fa:-1.3,ra:1.25,r:.34,cl:.11,hb:.42,hh:[.6,.74],belt:.84,roof:1.26,zw:[-.82,.02],zr:.62,zg:1.62,deck:.88,rear:'fast',doors:1,n:3.8,mass:1420},
 van:{L:5.45,W:1.0,fa:-1.78,ra:1.62,r:.36,cl:.2,hb:.66,hh:[.98,1.12],belt:1.22,roof:2.32,roof2:2.42,zw:[-1.66,-1.02],zr:-.55,zg:-.55,deck:2.42,rear:'box',doors:2,n:7,mass:2500,rf:.42,rr:.12},
 amb:{L:5.9,W:1.0,fa:-1.95,ra:1.75,r:.37,cl:.2,hb:.66,hh:[.98,1.12],belt:1.22,roof:2.32,roof2:2.62,zw:[-1.9,-1.26],zr:-.78,zg:-.78,deck:2.6,rear:'box',doors:2,n:8,mass:3200,rf:.42,rr:.08,Wb:1.08},
 bus:{L:11.8,W:1.27,fa:-3.85,ra:3.25,r:.5,cl:.3,hb:.78,hh:[1.12,1.18],belt:1.22,roof:3.08,zw:[-5.62,-5.3],zr:5.78,zg:5.78,deck:3.08,rear:'bus',doors:1,n:9,mass:12000,rf:.3,rr:.25},
 lorry:{L:7.6,W:1.18,fa:-2.72,ra:2.35,r:.5,cl:.3,hb:.82,hh:[1.28,1.36],belt:1.48,roof:2.78,roof2:3.55,zw:[-3.55,-3.22],zr:-2.25,zg:-2.25,deck:3.55,rear:'box',doors:2,n:8,mass:9000,rf:.3,rr:.05,Wb:1.25,sepBox:1},
 fire:{L:9.6,W:1.24,fa:-3.25,ra:2.95,r:.52,cl:.32,hb:.86,hh:[1.3,1.38],belt:1.5,roof:2.9,roof2:3.05,zw:[-4.5,-4.15],zr:-3.0,zg:-3.0,deck:3.05,rear:'box',doors:2,n:8,mass:15000,rf:.3,rr:.05,Wb:1.25,sepBox:1},
 hyper:{L:4.55,W:1.0,fa:-1.42,ra:1.32,r:.35,cl:.09,hb:.38,hh:[.52,.7],belt:.78,roof:1.13,zw:[-.95,-.12],zr:.42,zg:1.2,deck:.86,rear:'mid',doors:1,n:3.4,mass:1550}};
const CGEO={};const GY=-.81;// quota del suolo nel sistema della carrozzeria
// ---------- profili: laterale (sotto, sopra) e pianta (larghezza) lungo la lunghezza ----------
function cdProf(D){const zF=-D.L/2,zR=D.L/2,P={zF,zR};
 P.w=z=>{const rf=D.rf||.55,rr=D.rr||.5;let w=D.Wb&&z>D.zg+.05?D.Wb:D.W;if(z<zF+rf){const u=(zF+rf-z)/rf;w*=Math.sqrt(Math.max(.06,1-u*u*u));}if(z>zR-rr){const u=(z-(zR-rr))/rr;w*=Math.sqrt(Math.max(.08,1-u*u*u));}return w;};
 P.bot=z=>{let h=D.cl+.04;h+=Math.max(0,zF+.62-z)*.32+Math.max(0,z-(zR-.6))*.36;return h;};
 P.top=z=>{const a=D.zw[0];let h;
  if(z<zF+.22)h=lerp(D.hb,D.hh[0],sst(zF,zF+.22,z));else if(z<a)h=lerp(D.hh[0],D.hh[1],Math.pow((z-zF-.22)/(a-zF-.22),.8));else h=D.hh[1]+(D.belt-D.hh[1])*sst(a,a+.35,z);
  if(D.rear==='sedan'||D.rear==='fast'||D.rear==='mid'){const z1=D.zg;if(z>z1)h=lerp(D.belt,D.deck,sst(z1,z1+.3,z));if(z>zR-.32)h=lerp(D.deck,D.hb+.08,sst(zR-.32,zR,z));}
  else if(D.rear==='bed'){if(z>D.zg+.02)h=lerp(D.belt,D.cl+.45,sst(D.zg+.02,D.zg+.12,z));if(z>zR-.12)h=Math.min(h,lerp(D.cl+.45,D.hb+.06,sst(zR-.12,zR,z)));}
  else if(D.rear==='box'){if(z>D.zg)h=D.sepBox?lerp(D.belt,D.cl+.78,sst(D.zg,D.zg+.08,z)):lerp(D.belt,D.roof2,sst(D.zg,D.zg+.05,z));}
  else if(D.rear==='bus'){h=Math.max(h,D.belt);}
  else{if(z>zR-.22)h=lerp(D.belt,D.hb+.12,sst(zR-.22,zR,z)*sst(zR-.22,zR,z));}
  return h;};
 // abitacolo vetrato: dal parabrezza alla fine del vetro posteriore
 P.cz0=D.zw[0];P.cz1=D.rear==='box'?D.zg+.02:(D.rear==='bus'?zR-.12:D.zg);P.cab=z=>{const a=D.zw[0],b=D.zw[1],r1=D.zr,g=D.zg;if(z<b)return lerp(D.belt,D.roof,Math.pow(clamp((z-a)/(b-a),0,1),D.rear==='bus'?1:.85));if(D.rear==='box'||D.rear==='bus')return D.roof;
  if(z<r1)return D.roof+.012*Math.sin(clamp((z-b)/(r1-b),0,1)*Math.PI);return lerp(D.roof,D.belt,Math.pow(clamp((z-r1)/(g-r1),0,1),D.rear==='sedan'?1.25:(D.rear==='fast'||D.rear==='mid'?.9:1.8)));};
 return P;}
// ---------- costruzione della geometria (cache per tipo e livello di dettaglio) ----------
function cdBuild(type,hi){const key=type+(hi?'H':'L');if(CGEO[key])return CGEO[key];const D=CDEF[type],P=cdProf(D),NS=hi?54:22,M=hi?30:14,st=[];
 for(let i=0;i<=NS;i++){const t=i/NS,z=P.zF+t*(P.zR-P.zF),yb=GY+P.bot(z),yt=GY+P.top(z);st.push({z,yb,yt:Math.max(yt,yb+.12),w:P.w(z),n:D.n,tp:.045});}
 const body=sweep(st,M),BP=body.attributes.position;
 // passaruota: i vertici del fianco vicino alle ruote vengono spinti sull'arco
 const wy=GY+D.r,ra=D.r+.1;for(let i=0;i<BP.count;i++){const x=BP.getX(i);if(Math.abs(x)<D.W-.3)continue;for(const wz of[D.fa,D.ra]){const z=BP.getZ(i),y=BP.getY(i),dz=z-wz,dy=y-wy,r=Math.hypot(dz,dy);if(r<ra&&dy>-.08){const k=ra/Math.max(r,.01);BP.setY(i,wy+dy*k);BP.setZ(i,wz+dz*k);}}}
 body.computeVertexNormals();
 // pezzi: ogni triangolo appartiene a un pannello
 const idx=body.index.array,NT=idx.length/3,tp=new Uint8Array(NT),N=body.attributes.normal,zB=D.doors===2?lerp(D.zw[1],D.zr,.55):9,zDe=D.doors===2?D.ra-ra-.06:D.zw[1]+1.15,sill=GY+D.cl+.2;
 // si classifica per quadrilatero (i due triangoli insieme): i bordi dei pannelli seguono le linee della griglia, niente seghettature
 const NQ=(st.length-1)*M;for(let t=0;t<NT;t++){const q=t<NQ*2?(t>>1):-1,a=idx[(q>=0?q*2:t)*3],b=idx[(q>=0?q*2:t)*3+1],c=idx[(q>=0?q*2:t)*3+2],d=q>=0?idx[(q*2+1)*3+1]:c,cx=(BP.getX(a)+BP.getX(b)+BP.getX(c)+BP.getX(d))/4,cy=(BP.getY(a)+BP.getY(b)+BP.getY(c)+BP.getY(d))/4,cz=(BP.getZ(a)+BP.getZ(b)+BP.getZ(c)+BP.getZ(d))/4,ny=(N.getY(a)+N.getY(b)+N.getY(c)+N.getY(d))/4,nx=(N.getX(a)+N.getX(b)+N.getX(c)+N.getX(d))/4,nz=(N.getZ(a)+N.getZ(b)+N.getZ(c)+N.getZ(d))/4;
  let p=0;
  if(cz<P.zF+.32&&cy<GY+D.hh[0]-.1)p=1;else if(cz>P.zR-.3&&cy<GY+D.hb+.05)p=2;
  else if(ny>.55&&cz>P.zF+.2&&cz<D.zw[0]+.05)p=3;
  else if((D.rear==='sedan'||D.rear==='fast')&&ny>.5&&cz>D.zg+.04&&cz<P.zR-.16)p=4;
  else if((D.rear==='hatch'||D.rear==='wagon'||D.rear==='suv'||D.rear==='box')&&nz>.45&&cz>P.zR-.35&&cy>GY+D.hb)p=4;
  else if(Math.abs(nx)>.55&&cy>sill&&cy<GY+D.belt-.02&&cz>D.zw[0]+.12&&cz<zDe){const front=cz<zB;p=nx<0?(front?5:6):(front?7:8);}
  tp[t]=p;}
 // vetri dell'abitacolo
 const cs=[],NC=hi?34:12;for(let i=0;i<=NC;i++){const z=P.cz0+i/NC*(P.cz1-P.cz0),yt=GY+P.cab(z);cs.push({z,yb:GY+D.belt-.04,yt:Math.max(yt,GY+D.belt+.02),w:P.w(z)-.06,n:4.6,tp:.23});}
 const cab=sweep(cs,hi?22:10),CP=cab.attributes.position,CN=cab.attributes.normal,ci=cab.index.array,NTC=ci.length/3,gp=new Uint8Array(NTC);
 const NQC=(cs.length-1)*(hi?22:10);for(let t=0;t<NTC;t++){const q=t<NQC*2?(t>>1):-1,a=ci[(q>=0?q*2:t)*3],b=ci[(q>=0?q*2:t)*3+1],c=ci[(q>=0?q*2:t)*3+2],d=q>=0?ci[(q*2+1)*3+1]:c,cz=(CP.getZ(a)+CP.getZ(b)+CP.getZ(c)+CP.getZ(d))/4,nx=(CN.getX(a)+CN.getX(b)+CN.getX(c)+CN.getX(d))/4,ny=(CN.getY(a)+CN.getY(b)+CN.getY(c)+CN.getY(d))/4,nz=(CN.getZ(a)+CN.getZ(b)+CN.getZ(c)+CN.getZ(d))/4;
  let p=0;if(ny>.75)p=0;else if(nz<-.4&&Math.abs(nx)<.6)p=1;else if(nz>.4&&Math.abs(nx)<.6)p=2;else if(nx<0)p=cz<zB?3:4;else p=cz<zB?5:6;gp[t]=p;}
 // tetto verniciato sopra i vetri
 const rs=[],NR=hi?16:6,ra0=D.zw[1]-.02,ra1=D.rear==='hatch'||D.rear==='wagon'||D.rear==='suv'?D.zr+.05:(D.rear==='box'?D.zg+.06:(D.rear==='bus'?P.zR-.08:D.zr+.04));for(let i=0;i<=NR;i++){const z=ra0+i/NR*(ra1-ra0),yt=GY+P.cab(z);rs.push({z,yb:yt-.07,yt:yt+.012,w:(P.w(z)-.06)*(1-.23)+.012,n:6,tp:.02});}
 const roof=sweep(rs,hi?20:10);
 // ---------- finiture: griglia, fari, specchietti, maniglie, montanti, cornici nere, interni, targhe, scarico ----------
 const T=[],L=[],bx=(A,w,h,d,x,y,z,c,rx,ry)=>{const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);g.translate(x,y,z);A.push(colorize(g,c[0],c[1],c[2]));};
 const dk=[.025,.026,.03],bk=[.045,.045,.05],ch=[.6,.61,.63],gr=[.08,.08,.085],zF=P.zF,zR=P.zR,W=D.W;
 const hF=GY+D.hb,hH=GY+D.hh[0];
 // griglia e prese d'aria
 const gw=D.rear==='bed'?1.3:(type==='hyper'?1.2:.95),gh=D.rear==='bed'?.34:.16;bx(T,gw,gh,.05,0,(hF+hH)/2+.02,zF+.05,bk);for(let i=0;i<4;i++)bx(T,gw-.04,.012,.055,0,(hF+hH)/2-.05+i*.035,zF+.035,D.rear==='bed'?ch:[.12,.12,.13]);
 bx(T,1.15*W,.08,.06,0,hF-.06,zF+.13,dk);
 // fari anteriori, luci diurne, posteriori, catarifrangenti
 for(const s of[-1,1]){const fx=s*(W-.24);bx(L,.36,.09,.06,fx,hH-.05,zF+.13,[3.1,3.0,2.7]);bx(L,.3,.018,.065,fx,hH-.1,zF+.135,[2.2,2.4,2.6]);bx(T,.4,.12,.05,fx,hH-.05,zF+.15,[.06,.06,.07]);
  const rz=zR-.07,rh=GY+(D.rear==='sedan'||D.rear==='fast'||D.rear==='mid'?D.deck:D.belt)-.1;bx(L,.34,.1,.05,s*(W-.22),rh,rz,[2.3,.08,.05]);bx(L,.12,.08,.052,s*(W-.42),rh-.02,rz+.002,[2.4,.9,.08]);bx(L,.07,.05,.05,s*(W-.12),hF-.06,zR-.06,[1.6,.05,.04]);
  // specchietti, maniglie, montanti, cornici
  const mz=D.zw[0]+.12,my=GY+D.belt+.08;bx(T,.08,.06,.14,s*(W+.02),my-.02,mz,dk);bx(T,.15,.1,.17,s*(W+.1),my+.02,mz+.02,D.rear==='bed'?ch:bk);
  for(const hz of(D.doors===2?[D.zw[1]-.1,zB+.45]:[D.zw[1]+.4]))bx(T,.03,.03,.14,s*(W-.005),GY+D.belt-.12,hz,ch);
  bx(T,.035,.05,P.cz1-P.cz0-.1,s*(W-.065),GY+D.belt-.01,(P.cz0+P.cz1)/2,dk);
  if(D.doors===2)bx(T,.03,(D.roof-D.belt)*.92,.09,s*(W-.07-.1),GY+(D.belt+D.roof)/2,zB,dk);
  bx(T,.03,.06,(zR-zF)*.62,s*(W-.01),GY+D.cl+.12,(zF+zR)/2,dk);
  // fanali e fendinebbia
  bx(L,.11,.05,.03,s*(W-.3),hF-.14,zF+.14,[1.6,1.55,1.3]);}
 // targhe, scarico, tergicristalli
 bx(T,.52,.12,.015,0,hF-.13,zF+.06,[.92,.92,.88]);bx(T,.52,.12,.015,0,GY+D.hb+.03,zR+.005,[.92,.92,.88]);
 T.push(colorize(new THREE.CylinderGeometry(.035,.04,.2,10).rotateX(Math.PI/2).translate(W*.55,GY+D.cl+.08,zR-.04),.22,.22,.24));
 for(const s of[-.3,.3])bx(T,.42,.012,.02,s,GY+D.hh[1]+.02,D.zw[0]+.06,dk,0,s*.25);
 // interni: cruscotto, volante, sedili, pannelli porte
 const iy=GY+D.cl+.3;bx(T,W*1.75,.05,1.6,0,iy,(D.zw[0]+D.zg)/2,dk);bx(T,W*1.7,.18,.32,0,GY+D.belt-.06,D.zw[0]+.25,bk);
 T.push(colorize(new THREE.TorusGeometry(.17,.022,8,20).rotateX(Math.PI/2.6).translate(-W*.42,GY+D.belt+.08,D.zw[0]+.5),.02,.02,.02));
 const sZ=D.doors===2?[D.zw[0]+.95,zB+.62]:[D.zw[0]+.95],y0=GY+D.cl+.25,sk=Math.min(1,((D.roof-.12)-(D.cl+.25))/.98);for(const sz of sZ)for(const s of(sz===sZ[1]?[0]:[-1,1])){const sx=s*W*.43,sw=s===0?W*1.4:.5;bx(T,sw,.14*sk,.5,sx,y0+.12*sk,sz,gr);bx(T,sw,.6*sk,.12,sx,y0+.5*sk,sz+.25,gr,-.12);bx(T,s===0?.3:.28,.17*sk,.1,sx,y0+.88*sk,sz+.29,gr);}
 // fondo scuro: niente vuoto sotto l'auto
 bx(T,W*1.8,.03,(zR-zF)*.86,0,GY+D.cl+.02,(zF+zR)/2,[.035,.035,.04]);
 // tipo specifico: cassone del pick-up, barre sul tetto, alettone, prese d'aria laterali
 if(D.rear==='bed'){const bz0=D.zg+.04,bz1=zR-.04,by=GY+D.deck,bl=bz1-bz0;bx(T,W*1.7,.04,bl,0,GY+D.cl+.42,(bz0+bz1)/2,[.06,.06,.065]);bx(T,1.2,.04,.5,0,by+.42,bz0-.25,[.05,.05,.055]);}
 if(D.rear==='wagon'||D.rear==='suv')for(const s of[-1,1])bx(T,.04,.04,(D.zr-D.zw[1])+.2,s*(W-.2),GY+D.roof+.06,(D.zw[1]+D.zr)/2,ch);
 if(type==='hyper'){bx(T,1.85,.05,.42,0,GY+D.deck+.32,zR-.3,bk);for(const s of[-1,1]){bx(T,.05,.28,.12,s*.6,GY+D.deck+.16,zR-.3,bk);bx(T,.07,.26,.9,s*(W-.03),GY+D.cl+.42,.35,bk);}bx(T,1.7,.08,.4,0,GY+D.cl+.06,zR-.12,bk);}
 if(type==='sports')bx(T,1.5,.04,.26,0,GY+D.deck+.06,zR-.2,bk);
 if(D.rear==='bus'){// montanti tra i finestrini, porta anteriore, indicatore di linea, specchi su bracci, griglia motore posteriore
  for(let z=D.zw[1]+.6;z<zR-.4;z+=1.32)for(const s of[-1,1])bx(T,.03,(D.roof-D.belt)*.96,.1,s*(W-.02),GY+(D.belt+D.roof)/2,z,dk);
  bx(T,.035,D.roof-.4,.95,W-.01,GY+(D.roof-.2)/2+.15,zF+.95,[.05,.06,.07]);bx(T,.03,.03,.95,W,GY+1.3,zF+.95,ch);
  bx(L,1.5,.22,.04,0,GY+D.roof-.2,zF+.02,[2.2,1.4,.2]);for(const s of[-1,1]){bx(T,.04,.04,.55,s*(W+.15),GY+D.roof-.5,zF+.3,dk,0,s*.5);bx(T,.08,.32,.16,s*(W+.36),GY+D.roof-.75,zF+.18,bk);}
  bx(T,1.8,.6,.04,0,GY+D.belt+.2,zR+.01,[.05,.05,.055]);for(let i=0;i<6;i++)bx(T,1.7,.025,.045,0,GY+D.belt-.05+i*.09,zR+.015,[.12,.12,.13]);}
 if(D.rear==='box'){// porte posteriori a due ante, guarnizioni del portellone laterale, gradino, tergicristallo
  bx(T,.02,(D.roof2-D.hb)*.9,.03,0,GY+(D.roof2+D.hb)/2,zR+.005,dk);for(const s of[-1,1]){bx(T,.03,.03,.16,s*.35,GY+1.25,zR+.01,ch);bx(T,.02,D.roof2-D.belt-.25,.02,s*(W+.003),GY+(D.roof2+D.belt)/2-.1,zB+.08,dk);bx(T,.02,D.roof2-D.belt-.25,.02,s*(W+.003),GY+(D.roof2+D.belt)/2-.1,zB+1.4,dk);}
  bx(T,1.6,.06,.3,0,GY+D.cl+.12,zR+.1,dk);}

 const out={type,D,P,body,tp,cab,gp,roof,trim:mergeGeos(T),lights:mergeGeos(L),wheel:CARGEO_HI?CARGEO_HI.wheel:null,sign:colorize(new THREE.BoxGeometry(.55,.18,.24).translate(0,GY+D.roof+.1,.2),2.4,2.1,1.4),
  wheels:[{x:-(W-.1),z:D.fa,f:1},{x:W-.1,z:D.fa,f:1},{x:-(W-.1),z:D.ra,f:0},{x:W-.1,z:D.ra,f:0}],wy:wy,ws:D.r/.34,zB,hx:W,hy:Math.max(.45,(D.roof-D.cl)/2-.1),hz:(zR-zF)/2-.02,drv:[-W*.43,GY+D.cl+.75,D.zw[0]+.95]};
 if(D.sepBox){// cassone chiuso separato dalla cabina (colore suo), telaio, ruote gemellate posteriori, paraincastro
  const z0=D.zg+.18,z1=P.zR-.05,y0=GY+D.cl+.82,y1=GY+D.roof2;out.box=rboxGeo(D.Wb*2,y1-y0,z1-z0,.05,1).translate(0,(y0+y1)/2,(z0+z1)/2);
  const BX=[];for(const s of[-1,1])for(let k=0;k<6;k++)BX.push(colorize(new THREE.BoxGeometry(.012,y1-y0-.1,.05).translate(s*(D.Wb+.006),(y0+y1)/2,z0+.4+k*((z1-z0-.8)/5)),.75,.76,.78));
  BX.push(colorize(new THREE.BoxGeometry(D.Wb*2-.1,.12,.12).translate(0,GY+D.cl+.35,z1+.02),.15,.15,.16));out.boxT=mergeGeos(BX);}
 if(D.rear==='bed'){// sponde e portellone del cassone (parte della carrozzeria, staccabili insieme al pannello posteriore)
  const BB=[],bz0=D.zg+.04,bz1=zR-.04,by0=GY+D.cl+.42,by1=GY+D.deck+.02;for(const s of[-1,1])BB.push(new THREE.BoxGeometry(.06,by1-by0,bz1-bz0).translate(s*(W-.04),(by0+by1)/2,(bz0+bz1)/2));
  out.bed=mergeGeos(BB);out.gate=new THREE.BoxGeometry(W*2-.12,by1-by0,.06).translate(0,(by0+by1)/2,bz1-.02);}
 return CGEO[key]=out;}
// ---------- vernice con bruciature a chiazze (fiamme vere lasciano metallo nero, ruggine e zinco grigio, non un nero uniforme) ----------
function cdPaint(col){const m=carMats.paint.clone();m.color.copy(col);const u={value:0};m.userData.burn=u;
 m.onBeforeCompile=sh=>{sh.uniforms.uBurn=u;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCP=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCP;uniform float uBurn;float cbh(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}float cbn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(cbh(i),cbh(i+vec3(1.,0.,0.)),f.x),mix(cbh(i+vec3(0.,1.,0.)),cbh(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(cbh(i+vec3(0.,0.,1.)),cbh(i+vec3(1.,0.,1.)),f.x),mix(cbh(i+vec3(0.,1.,1.)),cbh(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}')
   .replace('#include <color_fragment>','#include <color_fragment>\nif(uBurn>0.){float n=cbn(vCP*2.7)*.6+cbn(vCP*8.3)*.4;vec3 ch=mix(vec3(.016,.014,.013),mix(vec3(.19,.09,.04),vec3(.3,.29,.27),step(.64,n)),smoothstep(.48,.78,n));diffuseColor.rgb=mix(diffuseColor.rgb,ch,uBurn*smoothstep(0.,.35,uBurn+n*.3-.15));}')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.93,uBurn);');};
 m.customProgramCacheKey=()=>'cdpaint';return m;}
const CDM={};function cdMats(){if(CDM.ok)return CDM;CDM.ok=true;CDM.wheelB=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:.2,color:new THREE.Color(.25,.22,.2)});
 CDM.trimB=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:.1,color:new THREE.Color(.12,.1,.09)});CDM.lightsOff=new THREE.MeshStandardMaterial({color:0x111111,roughness:.6});return CDM;}
// ---------- auto completa: stessa interfaccia fisica di prima (ruote, sterzo, IA, entrare/uscire), carrozzeria a pezzi ----------
function makeCar2(type,x,y,z,yaw,col,o){o=o||{};const G=cdBuild(type,true),mat=cdPaint(col),g=new THREE.Group(),D=G.D;
 const bodyGeo=G.body.clone(),cabGeo=G.cab.clone(),roofGeo=G.roof.clone(),mBody=new THREE.Mesh(bodyGeo,mat),mRoof=new THREE.Mesh(roofGeo,mat),mCab=new THREE.Mesh(cabGeo,carMats.glass),mL=new THREE.Mesh(G.lights,carMats.lights),mT=new THREE.Mesh(G.trim,carMats.trim);
 for(const m of[mBody,mRoof,mCab,mL,mT]){m.castShadow=true;m.receiveShadow=true;g.add(m);}
 if(o.taxi)g.add(new THREE.Mesh(G.sign,carMats.lights));
 if(G.box){const bm=new THREE.Mesh(G.box,new THREE.MeshStandardMaterial({color:lc([0xe9e9e6,0xdedcd6,0xf2f2f0,0x2f4f6f][Math.floor(Math.random()*4)]),roughness:.55,metalness:.15}));bm.castShadow=bm.receiveShadow=true;g.add(bm);const bt=new THREE.Mesh(G.boxT,carMats.trim);g.add(bt);}
 let mBed=null,mGate=null;if(G.bed){mBed=new THREE.Mesh(G.bed,mat);mGate=new THREE.Mesh(G.gate,mat);for(const m of[mBed,mGate]){m.castShadow=true;m.receiveShadow=true;g.add(m);}}
 const wm=G.wheels.map(w=>{const m=new THREE.Mesh(CARGEO_HI.wheel,carMats.wheel);m.castShadow=true;m.rotation.order='YXZ';m.scale.setScalar(G.ws);m.position.set(w.x,G.wy,w.z);g.add(m);return m;});scene.add(g);
 const hy=D.rear==='bed'||type==='suv'?.55:.45,b=newBody(2,x,y,z,G.hx,hy,G.hz,D.mass);setYaw(b,yaw);b.obj=g;b.snd='metal';b.bv=2.4;b.rest=.2;b.mu=.6;
 const i0=Uint32Array.from(bodyGeo.index.array),g0=Uint32Array.from(cabGeo.index.array);
 b.car={wheels:G.wheels.map((w,i)=>({x:w.x,z:w.z,f:w.f,comp:0,prev:0,spin:0,slip:0,m:wm[i]})),steer:0,thr:0,brake:0,hand:0,rpm:800,mat,geo:bodyGeo,base:Float32Array.from(bodyGeo.attributes.position.array),burnt:false,cab:mCab,
  type:'aa_'+type,G,wyo:G.wy+.47,body:mBody,lightsM:mL,trimM:mT,
  parts:{i0,g0,off:new Set(),goff:new Set(),dmg:{f:0,r:0,l:0,rt:0,top:0},roofGeo,roofBase:Float32Array.from(roofGeo.attributes.position.array),bed:mBed,gate:mGate,boomed:false,ws:0}};
 syncObj(b);dynCars.push(b);return b;}
// ruote più grandi per SUV e pick-up: la posizione visiva tiene conto del raggio vero
{const vv0=vehicleVisuals;vehicleVisuals=function(dt){vv0(dt);for(const b of dynCars){const c=b.car;if(b.dead||!c||!c.wyo)continue;for(const w of c.wheels)if(w.m)w.m.position.y+=c.wyo;}};}
// ---------- pezzi: estrazione del pannello, nuovo indice senza il pannello, vetri che si frantumano ----------
function cdReindex(c){const I=c.parts.i0,T=c.G.tp,off=c.parts.off,o=[];for(let t=0;t<T.length;t++)if(!off.has(T[t]))o.push(I[t*3],I[t*3+1],I[t*3+2]);c.geo.setIndex(o);}
function cdGlassReindex(c){const I=c.parts.g0,T=c.G.gp,off=c.parts.goff,o=[];for(let t=0;t<T.length;t++)if(!off.has(T[t]))o.push(I[t*3],I[t*3+1],I[t*3+2]);c.cab.geometry.setIndex(o);}
function cdExtract(c,pid){const P=c.geo.attributes.position.array,N=c.geo.attributes.normal.array,I=c.parts.i0,T=c.G.tp,v=[],n=[];
 for(let t=0;t<T.length;t++){if(T[t]!==pid)continue;for(let k=0;k<3;k++){const i=I[t*3+k];v.push(P[i*3],P[i*3+1],P[i*3+2]);n.push(N[i*3],N[i*3+1],N[i*3+2]);}}
 if(v.length<9)return null;let cx=0,cy=0,cz=0;const nv=v.length/3;for(let i=0;i<nv;i++){cx+=v[i*3];cy+=v[i*3+1];cz+=v[i*3+2];}cx/=nv;cy/=nv;cz/=nv;for(let i=0;i<nv;i++){v[i*3]-=cx;v[i*3+1]-=cy;v[i*3+2]-=cz;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));return {g,c:[cx,cy,cz]};}
// rottami: volano con la velocità dell'auto più la spinta, girano, rimbalzano; le ruote rotolano
const CPD=[];
function cdSpawnPiece(geo,mat,b,lc,v,spin,o){o=o||{};const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;if(o.sc)m.scale.setScalar(o.sc);b.obj.updateMatrixWorld(true);
 m.position.set(lc[0],lc[1],lc[2]).applyMatrix4(b.obj.matrixWorld);m.quaternion.copy(b.obj.quaternion);if(o.rot)m.quaternion.multiply(o.rot);scene.add(m);if(!geo.boundingSphere)geo.computeBoundingSphere();
 CPD.push({m,vx:b.vx+v[0],vy:b.vy+v[1],vz:b.vz+v[2],w:new THREE.Vector3(spin[0],spin[1],spin[2]),r:geo.boundingSphere.radius*(o.sc||1),t:0,rest:false,wheel:!!o.wheel,shared:!!o.shared,rr:o.rr||.34});
 while(CPD.length>(QP.shards>600?80:45)){const q=CPD.shift();scene.remove(q.m);if(!q.shared)q.m.geometry.dispose();}}
const _cdv=new THREE.Vector3(),_cdq=new THREE.Quaternion();
function cdPieceStep(dt){for(let i=CPD.length-1;i>=0;i--){const p=CPD[i],m=p.m;p.t+=dt;if(p.t>150){scene.remove(m);if(!p.shared)m.geometry.dispose();CPD.splice(i,1);continue;}if(p.rest)continue;
  p.vy-=G*dt;const wl0=waterAt(m.position.x,m.position.z);if(m.position.y<wl0){p.vy+=G*dt*.82;p.vx*=.97;p.vz*=.97;p.vy*=.95;p.w.multiplyScalar(.97);}
  m.position.x+=p.vx*dt;m.position.y+=p.vy*dt;m.position.z+=p.vz*dt;const wl=p.w.length();if(wl>1e-4){_cdq.setFromAxisAngle(_cdv.copy(p.w).multiplyScalar(1/wl),wl*dt);m.quaternion.premultiply(_cdq);}
  const g=groundH(m.position.x,m.position.z),lim=g+(p.wheel?p.rr*.92:Math.min(.18,p.r*.18));
  if(m.position.y<lim){m.position.y=lim;if(p.vy<-3){if(p.t>.15)sndImpact(m.position.x,m.position.y,m.position.z,'metal',Math.min(12,-p.vy*1.4));p.vy*=-.26;}else p.vy=0;
   if(p.wheel){const sp=Math.hypot(p.vx,p.vz);p.vx*=.993;p.vz*=.993;if(sp>.4)p.w.set(p.vz,0,-p.vx).multiplyScalar(1/p.rr);else p.w.multiplyScalar(.9);}else{p.vx*=.78;p.vz*=.78;p.w.multiplyScalar(.72);}
   if(Math.hypot(p.vx,p.vz)<.25&&Math.abs(p.vy)<.4&&p.t>1.2)p.rest=true;}}}
function cdShatter(b,gid,quiet){const c=b.car,P=c.parts;if(!P||P.goff.has(gid))return;P.goff.add(gid);cdGlassReindex(c);if(quiet)return;
 const G=c.G,D=G.D,lz=gid===1?D.zw[0]+.3:gid===2?D.zg-.25:(gid===3||gid===5)?(D.zw[1]+G.zB)/2:(G.zB+D.zr)/2,lx=gid>=5?D.W-.08:(gid>=3?-(D.W-.08):0),ly=GY+D.belt+.22;
 _cdv.set(lx,ly,lz).applyMatrix4((b.obj.updateMatrixWorld(true),b.obj.matrixWorld));const R=b.R,ox=gid>=5?R[0]:(gid>=3?-R[0]:0),oz=gid>=5?R[6]:(gid>=3?-R[6]:0);
 for(let k=0;k<14;k++)shardSpawn(_cdv.x+rand(-.4,.4),_cdv.y+rand(-.15,.25),_cdv.z+rand(-.4,.4),b.vx*.6+ox*rand(.5,3)+rand(-1,1),rand(-.5,2),b.vz*.6+oz*rand(.5,3)+rand(-1,1),.14);
 sndGlass(_cdv.x,_cdv.y,_cdv.z);}
function cdDetach(b,pid,vel){const c=b.car,P=c.parts;if(!P||P.off.has(pid))return false;const ex=cdExtract(c,pid);if(!ex)return false;P.off.add(pid);cdReindex(c);
 const pm=cdPaint(c.mat.color);pm.side=THREE.DoubleSide;pm.userData.burn.value=c.mat.userData.burn.value;pm.clearcoat=c.mat.clearcoat;
 cdSpawnPiece(ex.g,pm,b,ex.c,vel||[0,1,0],[rand(-5,5),rand(-5,5),rand(-5,5)]);if(pid>=5&&pid<=8)cdShatter(b,pid-2,true);
 sndImpact(b.px,b.py,b.pz,'metal',9);return true;}
function cdWheelOff(b,w,vel){const c=b.car;if(w.off||!w.m||c.wheels.indexOf(w)<0)return;w.off=true;b.obj.remove(w.m);
 cdSpawnPiece(w.m.geometry,w.m.material,b,[w.x,(c.G?c.G.wy:-.47),w.z],vel||[Math.sign(w.x)*rand(2,5),rand(1,4),rand(-2,2)],[rand(-8,8),rand(-3,3),rand(-8,8)],{wheel:true,shared:true,sc:c.G?c.G.ws:1,rr:.34*(c.G?c.G.ws:1)});}
// ---------- urti: deformazione a zone (muso e coda si accartocciano, l'abitacolo resiste), vetri, pezzi che si staccano ----------
function cdDeform(geo,B,lx,ly,lz,dx,dy,dz,rad,dep,lim){const P=geo.attributes.position.array;let any=false;
 for(let i=0;i<P.length;i+=3){const ex=P[i]-lx,ey=P[i+1]-ly,ez=P[i+2]-lz,d=Math.sqrt(ex*ex+ey*ey+ez*ez);if(d>rad)continue;const f=1-d/rad,k=dep*f*f;let x=P[i]+dx*k,y=P[i+1]+dy*k,z=P[i+2]+dz*k;
  const ox=x-B[i],oy=y-B[i+1],oz=z-B[i+2],ol=Math.sqrt(ox*ox+oy*oy+oz*oz);if(ol>lim){x=B[i]+ox/ol*lim;y=B[i+1]+oy/ol*lim;z=B[i+2]+oz/ol*lim;}P[i]=x;P[i+1]=y;P[i+2]=z;any=true;}
 if(any){geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();}}
{const dent0=dent;dent=function(b,cx,cy,cz,nx,ny,nz,s){const c=b.car;if(!c||!c.parts)return dent0(b,cx,cy,cz,nx,ny,nz,s);
 const R=b.R,wx=cx-b.px,wy=cy-b.py,wz=cz-b.pz,lx=R[0]*wx+R[3]*wy+R[6]*wz,ly=R[1]*wx+R[4]*wy+R[7]*wz,lz=R[2]*wx+R[5]*wy+R[8]*wz,dx=R[0]*nx+R[3]*ny+R[6]*nz,dy=R[1]*nx+R[4]*ny+R[7]*nz,dz=R[2]*nx+R[5]*ny+R[8]*nz;
 const G=c.G,D=G.D,P=c.parts,tail=D.rear==='sedan'||D.rear==='fast'||D.rear==='mid'||D.rear==='bed'?D.zg+.1:D.zr+.1;
 const zone=ly>GY+D.belt+.1?'top':(lz<D.zw[0]-.05?'f':(lz>tail?'r':(lx<0?'l':'rt'))),crz=zone==='f'||zone==='r';
 const rad=clamp(.5+s*.06,.5,1.9),dep=clamp(s*(crz?.03:.02),.02,crz?.9:.5),lim=crz?.95:(zone==='top'?.62:.5);
 cdDeform(c.geo,c.base,lx,ly,lz,dx,dy,dz,rad,dep,lim);cdDeform(P.roofGeo,P.roofBase,lx,ly,lz,dx,dy,dz,rad,dep*.9,lim);P.dmg[zone]+=s;
 if(s>7&&(zone==='f'||zone==='top')&&!c.cracked){c.cracked=true;c.cab.material=CRACKGLASS;}
 if(s>10&&(zone==='l'||zone==='rt'))cdShatter(b,lx<0?(lz<G.zB?3:4):(lz<G.zB?5:6));if(s>15&&zone==='r')cdShatter(b,2);if(s>22&&zone==='f')cdShatter(b,1);if(s>16&&zone==='top'){for(const g of[3,4,5,6])if(Math.random()<.5)cdShatter(b,g);}
 const fx=-R[2],fz=-R[8],sx=R[0],sz=R[6];
 if(zone==='f'&&P.dmg.f>30&&s>11&&Math.random()<.5)cdDetach(b,1,[fx*rand(1,3),rand(.5,2),fz*rand(1,3)]);
 if(zone==='r'&&P.dmg.r>30&&s>11&&Math.random()<.5)cdDetach(b,2,[-fx*rand(1,3),rand(.5,2),-fz*rand(1,3)]);
 if(zone==='f'&&P.dmg.f>58&&s>15&&Math.random()<.35)cdDetach(b,3,[fx*2,rand(3,6),fz*2]);
 if((zone==='l'||zone==='rt')&&s>17&&P.dmg[zone]>26&&Math.random()<.45){const sg=lx<0?-1:1,dr=lx<0?(lz<G.zB?5:6):(lz<G.zB?7:8);cdDetach(b,D.doors===1&&dr%2===0?dr-1:dr,[sx*sg*rand(1.5,4),rand(.5,2),sz*sg*rand(1.5,4)]);}
 if(s>26)for(const w of c.wheels){if(!w.off&&Math.hypot(w.x-lx,w.z-lz)<1.1&&Math.random()<.4)cdWheelOff(b,w);}
 if(!c.burnt&&((s>22&&Math.random()<.1)||(P.dmg.f>75&&s>12&&Math.random()<.25)))ignite(b);}}
// ---------- esplosione dell'auto: vetri in frantumi, cofano e portiere che volano, gomme bruciate, vernice carbonizzata a chiazze ----------
function cdBoom(b){const c=b.car,P=c.parts;P.boomed=true;cdMats();c.mat.userData.burn.value=1;c.mat.clearcoat=0;for(let g=1;g<=6;g++)cdShatter(b,g,g>2);
 const up=()=>[rand(-4,4),rand(7,14),rand(-4,4)],R=b.R,sx=R[0],sz=R[6];
 if(Math.random()<.8)cdDetach(b,3,up());if(Math.random()<.6)cdDetach(b,4,up());
 for(const d of[5,6,7,8]){if(Math.random()<.45){const sg=d<7?-1:1;cdDetach(b,d,[sx*sg*rand(4,10),rand(2,7),sz*sg*rand(4,10)]);}}
 for(const p of[1,2])if(Math.random()<.45)cdDetach(b,p,[rand(-4,4),rand(1,5),rand(-4,4)]);
 for(const w of c.wheels)if(!w.off&&Math.random()<.2)cdWheelOff(b,w,[Math.sign(w.x)*rand(3,8),rand(2,6),rand(-3,3)]);
 for(const w of c.wheels)if(w.m)w.m.material=CDM.wheelB;c.trimM.material=CDM.trimB;c.lightsM.material=CDM.lightsOff;}
function cdStep(dt){cdPieceStep(dt);for(const b of dynCars){const c=b.car;if(b.dead||!c||!c.parts)continue;const P=c.parts;
  if(b.fire>0&&!c.burnt&&c.boom)c.mat.userData.burn.value=Math.max(c.mat.userData.burn.value,Math.min(.45,b.fire/c.boom*.45));
  if(c.burnt&&!P.boomed)cdBoom(b);
  // radiatore rotto: vapore e poi fumo nero dal cofano dopo un urto frontale forte
  if(!c.burnt&&P.dmg.f>45&&Math.random()<dt*(P.dmg.f>80?9:4)){const D=c.G.D;_cdv.set(rand(-.3,.3),GY+D.hh[1]+.05,D.zw[0]-.45).applyMatrix4(b.obj.matrixWorld);smoke(_cdv.x,_cdv.y,_cdv.z,rand(-.3,.3)+b.vx*.3,rand(.8,1.6),rand(-.3,.3)+b.vz*.3,.5,rand(2,4),P.dmg.f>80);}}}
{const vv1=vehicleVisuals;vehicleVisuals=function(dt){vv1(dt);try{cdStep(dt);}catch(e){console.warn('auto a pezzi',e);}};}
// ---------- integrazione: traffico, auto parcheggiate, auto del giocatore ----------
Object.assign(TRV,{hatch:{p:.12,v:12},wagon:{p:.05,v:12},pickup:{p:.04,v:12,pow:1.35}});
const TRMIX=[['sedan',.27],['hatch',.12],['wagon',.05],['suv',.12],['pickup',.04],['taxi',.16],['van',.1],['sports',.06],['hyper',.02],['police',.06]];
trPick=function(){let r=Math.random(),s=0;for(const q of TRMIX){s+=q[1];if(r<s)return q[0];}return 'sedan';};
var TRCOL={hatch:[0xc41e1e,0xe8e8e6,0x1d4f9a,0x6f7378,0x111214,0x2c6e3f,0xd9a400,0x8c8f93],wagon:[0xb9bcc0,0x1c2a44,0xe8e8e6,0x111214,0x5b4636,0x3d4a3f],pickup:[0xe8e8e6,0x111214,0x8e1b1b,0x4b4f54,0x1e3a66,0x6b5a3a]};
function trHex2(t){const P=TRCOL[t];return P?P[Math.floor(Math.random()*P.length)]:trHex(t);}
const CDMAP={sedan:'sedan',taxi:'sedan',police:'sedan',suv:'suv',sports:'sports',hyper:'hyper',hatch:'hatch',wagon:'wagon',pickup:'pickup',van:'van',amb:'amb',bus:'bus',lorry:'lorry',fire:'fire'};
Object.assign(TRV,{bus:{v:11,pow:3.4,top:32},lorry:{v:11,pow:3.6,top:34}});Object.assign(TRV.fire,{pow:4.2,top:32});TRV.van.pow=1.8;TRV.amb.pow=2.3;
Object.assign(TRCOL,{bus:[0x1f5fa8,0xe8e8e6,0xd8a50f,0xb3261e,0x2e7d32],lorry:[0xe8e8e6,0xe8e8e6,0x1c2a44,0x8e1b1b,0x2f4f6f],van:[0xf0f0ee,0xf0f0ee,0xf0f0ee,0x9aa0a6,0x1c2a44,0x5a1414,0x2c5a3c]});
{const tm1=trMake;trMake=function(type,x,y,z,yaw){const k=CDMAP[type];if(!k)return tm1(type,x,y,z,yaw);
 const col=type==='taxi'?lc(0xf2b705):type==='police'?lc(0x101114):type==='amb'?lc(0xf4f4f0):type==='fire'?lc(0xb5150f):lc(trHex2(type)),b=makeCar2(k,x,y,z,yaw,col,{taxi:type==='taxi'}),G=b.car.G,D=G.D;
 if(type==='amb'){b.car.bar=trBar(b.obj,GY+D.roof+.06,D.zw[1]+.15,1.5,true);const rs=new THREE.MeshStandardMaterial({color:lc(0xb01818),roughness:.5});for(const s of[-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(.02,.22,D.L*.62),rs);st.position.set(s*((D.Wb||D.W)+.006),GY+1.15,D.zg+1.4);b.obj.add(st);decal(b.obj,DCL.num('AMBULANCE','#b01818'),1.9,.34,s*((D.Wb||D.W)+.012),GY+1.75,D.zg+1.5,s*Math.PI/2);}}
 if(type==='police'){const wh=new THREE.MeshPhysicalMaterial({color:lc(0xf2f2f0),metalness:.3,roughness:.35,clearcoat:1});for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.025,.36,1.9),wh);p.position.set(s*(D.W+.004),GY+D.cl+.52,(D.zw[1]+G.zB)/2);b.obj.add(p);
   decal(b.obj,DCL.num('POLICE','#101114'),1.0,.24,s*(D.W+.02),GY+D.cl+.52,(D.zw[1]+G.zB)/2,s*Math.PI/2);}b.car.bar=trBar(b.obj,GY+D.roof+.02,.1,1.25,false);}
 if(type==='fire'){// autopompa: cassone rosso come la cabina, scala sul tetto, fascia riflettente, lampeggianti, scritte, pedana posteriore
  b.obj.traverse(o=>{if(o.isMesh&&o.geometry===G.box){o.material.color.copy(col);o.material.roughness=.4;}});
  b.car.bar=trBar(b.obj,GY+D.roof+.06,D.zw[1]+.3,1.9,true);
  const met=new THREE.MeshStandardMaterial({color:lc(0xb9bcc0),roughness:.35,metalness:.85}),wh=new THREE.MeshStandardMaterial({color:lc(0xf0f0ea),roughness:.45,emissive:new THREE.Color(.04,.04,.035)});
  const z0=D.zg+.3,z1=D.L/2-.25,lad=[];for(const s of[-1,1])lad.push(new THREE.BoxGeometry(.07,.09,z1-z0).translate(s*.42,GY+D.roof2+.2,(z0+z1)/2));
  for(let zz=z0+.15;zz<z1;zz+=.36)lad.push(new THREE.BoxGeometry(.84,.035,.035).translate(0,GY+D.roof2+.2,zz));for(const zz of[z0+.4,z1-.4])for(const s of[-1,1])lad.push(new THREE.BoxGeometry(.05,.16,.05).translate(s*.42,GY+D.roof2+.08,zz));
  const L=new THREE.Mesh(mergeGeos(lad),met);L.castShadow=true;b.obj.add(L);
  for(const s of[-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(.02,.13,D.L-1.2),wh);st.position.set(s*((D.Wb||D.W)+.008),GY+1.3,.35);b.obj.add(st);
   decal(b.obj,DCL.num('FIRE DEPT.','#e8c25a'),1.5,.28,s*(D.W+.03),GY+1.95,D.zw[0]+1.05,s*Math.PI/2);decal(b.obj,DCL.num('ENGINE 7','#e8c25a'),1.7,.3,s*((D.Wb||D.W)+.02),GY+2.45,D.zg+2.4,s*Math.PI/2);}
  const step=new THREE.Mesh(new THREE.BoxGeometry((D.Wb||D.W)*2-.2,.08,.45),met);step.position.set(0,GY+D.cl+.42,D.L/2+.15);b.obj.add(step);}
 const t=TRV[type]||{};if(t.pow)b.car.pow=t.pow;if(t.top)b.car.vtop=t.top;b.car.drvPos=G.drv;return b;};}
// auto parcheggiate che diventano dinamiche e auto create dal giocatore: berlina nuova
makeCar=function(x,y,z,yaw,col,taxi){return makeCar2('sedan',x,y,z,yaw,col,{taxi});};
// le auto parcheggiate istanziate usano la stessa carrozzeria nuova (versione leggera)
{const bc0=buildCars;buildCars=function(){bc0();try{const N=cdBuild('sedan',false),H=cdBuild('sedan',true);for(const k of['body','roof','cab','lights','trim','sign']){const g=k==='cab'?N.cab:N[k];if(g&&PC.m[k])PC.m[k].geometry=g;}
  CARGEO_LO.body=N.body;CARGEO_LO.roof=N.roof;CARGEO_LO.cab=N.cab;CARGEO_LO.trim=N.trim;CARGEO_LO.lights=N.lights;CARGEO_LO.sign=N.sign;}catch(e){console.warn('auto parcheggiate nuove',e);}};}
