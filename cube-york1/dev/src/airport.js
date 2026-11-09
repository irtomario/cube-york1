/* ======================= AEROPORTI: Cube York International (CYI) e Cube York Ovest (CYW) ======================= */
// CYI: pista 09/27 lunga 2300 m e larga 45 m, via di rullaggio parallela "A", piazzale, terminal con 5 pontili, torre di controllo, hangar
const AP={CYI:{rw:RWY[0],twz:1600,twh:11.5,exits:[[2620,1600,2620,1700],[3050,1700,3220,1600],[3600,1700,3770,1600],[4300,1600,4300,1700],[4880,1600,4880,1700]],
  apron:{x0:2590,x1:3840,z0:1426,z1:1588},term:{x0:2722,z0:1362,w:280,d:64,fl:4},
  stands:[{x:2748,z:1431,w:36,jb:1},{x:2793,z:1431,w:36,jb:1},{x:2838,z:1431,w:36,jb:1},{x:2883,z:1431,w:36,jb:1},{x:2950,z:1431,w:65,jb:1},{x:3080,z:1448,w:36,jb:0},{x:3125,z:1448,w:36,jb:0},{x:3170,z:1448,w:36,jb:0},{x:3245,z:1448,w:65,jb:0}],
  taxilane:1530,tower:{x:3062,z:1328},land:1346},
 CYW:{rw:RWY[1],twz:1925,twh:9,exits:[[-4000,1925,-4000,1990],[-3250,1925,-3250,1990],[-2500,1925,-2500,1990]],apron:{x0:-2900,x1:-2470,z0:1838,z1:1915},term:{x0:-2858,z0:1806,w:220,d:32,fl:3},
  stands:[{x:-2830,z:1846,w:28,jb:0},{x:-2790,z:1846,w:28,jb:0},{x:-2750,z:1846,w:28,jb:0},{x:-2700,z:1846,w:36,jb:0}],taxilane:1890,tower:{x:-2610,z:1812}},
 glass:[],jb:[],tanks:[],socks:[],radar:null,fids:[],B:[],T:[]};
ROADS.push([[-1200,160],[-1480,520],[-1720,940],[-1930,1330],[-2180,1515],[-2440,1572],[-2440,1562]]);
/* ---------- pavimentazione dell'aeroporto: pista con segnaletica ICAO, vie di rullaggio, piazzale, parcheggi ---------- */
function apGLSL(A,id){const f=v=>v<0?'('+(+v).toFixed(1)+')':(+v).toFixed(1),R=A.rw,T=A.term,ap=A.apron;let s='';
 s+=`float segD(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
float flood(vec2 p){float k=0.;${A===AP.CYI?'for(int i=1;i<10;i++){vec2 c=vec2(2700.+float(i)*125.,1580.);vec2 d=p-c;k+=exp(-dot(d,d)*.0011);}':'for(int i=0;i<3;i++){vec2 c=vec2(-2860.+float(i)*130.,1906.);vec2 d=p-c;k+=exp(-dot(d,d)*.0016);}'}return k;}
void zg(vec2 p){gEmis=vec3(0.);gMet=0.;float n2=vn2(p*2.7),n3=vn2(p*11.),n1=vn2(p*.13);float night=smoothstep(.15,.6,uNight);
 float rx=p.x,dz=p.y-${f(R.z)};vec3 c;float rough=.9;
 bool rw=rx>${f(R.x0)}&&rx<${f(R.x1)}&&abs(dz)<${f(R.hw)};bool sh=rx>${f(R.x0-20)}&&rx<${f(R.x1+20)}&&abs(dz)<${f(R.hw+7.5)};bool pad=(rx>${f(R.x0-160)}&&rx<${f(R.x0)}||rx>${f(R.x1)}&&rx<${f(R.x1+200)})&&abs(dz)<${f(R.hw+7.5)};
 float tw=abs(p.y-${f(A.twz)})-${f(A.twh)};bool twA=rx>${f(R.x0+5)}&&rx<${f(R.x1-5)}&&tw<0.;float exd=1e4;`;
 for(const e of A.exits)s+=`exd=min(exd,segD(p,vec2(${f(e[0])},${f(e[1])}),vec2(${f(e[2])},${f(e[3])})));`;
 s+=`bool ex=exd<${f(A.twh)};
 bool apr=p.x>${f(ap.x0)}&&p.x<${f(ap.x1)}&&p.y>${f(ap.z0)}&&p.y<${f(ap.z1)};
 bool term=p.x>${f(T.x0)}&&p.x<${f(T.x0+T.w)}&&p.y>${f(T.z0)}&&p.y<${f(T.z0+T.d)};
 if(term){vec2 q=p/vec2(1.2,1.2);vec2 tf=fract(q);float jt=1.-step(.015,tf.x)*step(tf.x,.985)*step(.015,tf.y)*step(tf.y,.985);float ch=step(.5,fract(floor(q.x)*.5+floor(q.y)*.5));
  c=mix(vec3(.58,.56,.52),vec3(.5,.49,.47),ch)*(.9+.12*h21(floor(q)))*(.92+.1*n2);c=mix(c,c*.7,jt);
  float lane=step(abs(p.y-${f(T.z0+T.d/2)}),2.2);c=mix(c,vec3(.24,.26,.3),lane*.85);rough=.22;gSpec=1.;
  vec2 lg=fract(p/vec2(8.,8.))-.5;gEmis+=c*vec3(1.,.95,.86)*(.22+night*.55)*(.75+.25*exp(-dot(lg,lg)*12.));}
 else if(rw){vec3 a=asph(p)*.82*(1.+.1*step(.5,fract(p.x*1.5)));float mk=0.;float adz=abs(dz);
  mk=max(mk,step(${f(R.hw-.9)},adz));
  mk=max(mk,step(adz,.45)*step(fract((rx-${f(R.x0)})/60.),.6)*step(${f(R.x0+90)},rx)*step(rx,${f(R.x1-90)}));
  for(int e=0;e<2;e++){float t0=e==0?rx-${f(R.x0)}:${f(R.x1)}-rx;
   mk=max(mk,step(6.,t0)*step(t0,36.)*step(3.,adz)*step(adz,${f(R.hw-3.)})*step(.5,fract((adz-3.)/3.6)));
   float tz=t0-150.*floor(t0/150.+.5);float k=floor(t0/150.+.5);if(k>.5&&k<6.5&&abs(tz)<11.){float nb=k<2.5?3.:(k<4.5?2.:1.);float o=adz-6.;mk=max(mk,step(0.,o)*step(o,nb*3.)*step(fract(o/3.),.6)*step(adz,${f(R.hw-3.)}));}
   if(t0>395.&&t0<455.)mk=max(mk,step(6.,adz)*step(adz,16.));
   float rub=smoothstep(1.,0.,abs(t0-520.)/380.)*smoothstep(16.,4.,adz)*(.5+.5*vn2(p*vec2(.03,.4)));a*=1.-rub*.55;}
  mk*=.75+.25*step(.25,n3);c=mix(a,vec3(.78,.78,.76)*(.8+.2*n2),mk);rough=mix(.84,.6,mk);}
 else if(pad){vec3 a=asph(p)*.9;float t0=rx<${f(R.x0)}?${f(R.x0)}-rx:rx-${f(R.x1)};float ch=fract((t0+abs(dz)*1.2)/24.);float mk=step(.85,ch)*step(abs(dz),${f(R.hw)});c=mix(a,vec3(.75,.58,.14),mk*.9);rough=.88;}
 else if(sh){c=asph(p)*1.25+vec3(.03);rough=.9;}
 else if(twA||ex||apr){vec3 a=asph(p)*.95;rough=.86;float mk=0.;vec3 mc=vec3(.78,.62,.16);
  if(apr){vec2 q=fract(p/5.);float jt=1.-step(.012,q.x)*step(q.x,.988)*step(.012,q.y)*step(q.y,.988);a=vec3(.42,.415,.4)*(.88+.12*h21(floor(p/5.)))*(.9+.12*n2);a=mix(a,a*.7,jt);a*=1.-.25*smoothstep(.6,.9,vn2(p*.08+4.));rough=.86;
   mk=max(mk,1.-step(.12,abs(p.y-${f(A.taxilane)})));`;
 for(const st of A.stands){s+=`if(abs(p.x-${f(st.x)})<.12&&p.y>${f(st.z+4)}&&p.y<${f(A.taxilane)})mk=1.;if(abs(p.y-${f(st.z+(st.w>40?5:3))})<.25&&abs(p.x-${f(st.x)})<3.)mk=1.;`;
  // linee di ingresso curve: dalla corsia del piazzale (CYI) o dalla via di rullaggio (CYW) fino alla piazzola
  const zc=st.z+(st.w>40?62.8:A===AP.CYI?37.6:27.2)/2+1;if(A===AP.CYI){const r=Math.min(35,(A.taxilane-zc)/2);s+=`{vec2 q=p-vec2(${f(st.x+r)},${f(A.taxilane-r)});if(abs(length(q)-${f(r)})<.12&&q.x<0.&&q.y>0.)mk=1.;}`;}
  else{const r=Math.min(35,(A.twz-zc)/2);s+=`{vec2 q=p-vec2(${f(st.x-r)},${f(A.twz-r)});if(abs(length(q)-${f(r)})<.12&&q.x>0.&&q.y>0.)mk=1.;}`;}}
 // linee di uscita verso la pista: curva dalla corsia del piazzale al raccordo di testata
 s+=A===AP.CYI?`{vec2 q=p-vec2(2660.,1570.);if(abs(length(q)-40.)<.12&&q.x<0.&&q.y<0.)mk=1.;if(abs(p.x-2620.)<.12&&p.y>1570.)mk=1.;}`:`{vec2 q=p-vec2(-2520.7,1910.7);if(abs(length(q)-20.7)<.12&&q.x>0.&&q.y<0.)mk=1.;if(abs(p.x+2500.)<.12&&p.y>1910.7)mk=1.;}`;
 s+=`   float srv=step(abs(p.y-${f(ap.z0+7)}),.08)*step(.5,fract(p.x/6.));if(srv>0.){c=vec3(.85);}a=mix(a,vec3(.85,.85,.83),srv);
   float red=step(p.y,${f(ap.z0+4)})*step(.5,fract((p.x+p.y)/1.6));a=mix(a,vec3(.5,.08,.06),red*.6);
   gEmis+=a*vec3(1.,.9,.72)*night*1.8*flood(p);}
  if(twA||ex){float cl=twA?abs(p.y-${f(A.twz)}):exd;mk=max(mk,1.-step(.1,cl));float ed=twA?abs(abs(p.y-${f(A.twz)})-${f(A.twh-.6)}):abs(exd-${f(A.twh-.6)});mk=max(mk,(1.-step(.1,ed))+(1.-step(.1,abs(ed-.35))));
   float hz=abs(p.y-${f(R.z-R.hw-45)});if(ex&&hz<2.){float o=p.y-${f(R.z-R.hw-45)};mk=max(mk,(step(abs(o+1.5),.12)+step(abs(o+.9),.12))+(step(abs(o-.3),.12)+step(abs(o-.9),.12))*step(.5,fract(p.x/1.)));}}
  mk*=.75+.25*step(.25,n3);c=mix(a,mc*(.8+.2*n2),clamp(mk,0.,1.));rough=mix(rough,.6,clamp(mk,0.,1.));}
 else{`;
 if(A===AP.CYI)s+=`bool road=abs(p.y-${f(A.land)})<8.&&p.x<${f(T.x0+T.w+70)};bool park=p.x>2470.&&p.x<2716.&&p.y>1276.&&p.y<1338.;bool curb=p.y>${f(A.land+8)}&&p.y<${f(T.z0)}&&p.x>${f(T.x0-10)}&&p.x<${f(T.x0+T.w+10)};
  if(road){vec3 a=asph(p);float d=abs(p.y-${f(A.land)});float mk=(1.-step(.08,abs(d-3.6)))*step(fract(p.x/9.),.45)*step(2.4,abs(p.x-2730.))+(1.-step(.08,abs(d-7.3)));mk=max(mk,(1.-step(2.,abs(p.x-2730.)))*step(fract((p.y-${f(A.land)})*.8+.25),.5)*(1.-step(7.,d)));c=mix(a,vec3(.75,.74,.7),mk*(.7+.3*n2));rough=.86;gEmis+=a*vec3(1.,.93,.82)*night*1.5*lamps(p.x,d-7.15,30.,15.);}
  else if(park){vec3 a=asph(p)*1.08;float ry=mod(p.y-1276.,16.);float stl=(ry<5.||ry>11.)?1.:0.;float sl=stl*(1.-step(.05,abs(fract((p.x-2470.)/2.6)-.5)));float bl=(1.-step(.07,abs(ry-5.)))+(1.-step(.07,abs(ry-11.)));c=mix(a,vec3(.8),clamp(sl+bl,0.,1.)*.85);rough=.88;gEmis+=a*vec3(1.,.9,.75)*night*1.2*lamps(p.x,ry-8.,24.,12.);}
  else if(curb){vec2 q=p/vec2(.6,1.2);vec2 tf=fract(q);float jt=1.-step(.03,tf.x)*step(tf.x,.97)*step(.02,tf.y)*step(tf.y,.98);c=vec3(.38,.37,.35)*(.86+.18*h21(floor(q)))*(.9+.15*n2);c=mix(c,c*.65,jt);rough=.8;gEmis+=c*vec3(1.,.92,.8)*night*1.3*lamps(p.x,p.y-${f(T.z0-4)},16.,8.);}
  else{`;
 else s+=`if(false){}else{`;
 s+=`vec3 g=grass(p);float mow=step(.5,fract(p.x/12.));g*=.9+.12*mow;c=g;rough=.95;}`;
 s+=`}
 gAlb=c;gRough=rough;}
`;return s;}
/* ---------- edifici a voxel: terminal (struttura cava con grandi vetrate), hangar, merci, vigili del fuoco, autosilo ---------- */
function apGen(){const sn=v=>Math.round((v-2)/4)*4+2;const add=(x0,z0,w,d,fl,st,o)=>{const b=addBuilding(sn(x0),sn(z0),w,d,fl,st,[[0,0,fl]]);b.noProps=true;Object.assign(b,o||{});AP.B.push(b);return b;};
 for(const k of ['CYI','CYW']){const A=AP[k],T=A.term;A.termB=add(T.x0,T.z0,T.w,T.d,T.fl,10,{frame:k});}
 const C=AP.CYI;C.hang=[add(3302,1366,100,60,6,7,{hollow:'open',door:'s'}),add(3418,1366,100,60,6,7,{hollow:'open',door:'s'})];
 add(3542,1370,120,56,3,7);C.fs=add(3690,1390,40,36,2,9,{hollow:'open',door:'s'});add(2722,1286,136,56,4,3);add(3778,1386,44,40,3,10);
 AP.CYW.hang=[add(-3082,1810,80,44,5,7,{hollow:'open',door:'s'})];
 // torri di controllo (celle polari: fusto in cemento, cabina vetrata che si allarga verso l'alto)
 const tw=(x,z,H,r0,cabY,name)=>{const T=htNew({name,x,z,H,st:HTS.conc,S:12,J:3,core:0,K:5,hp0:260,seed:Math.random(),sh:(y,f,q)=>{let r;if(y<cabY-4)r=r0+1.1*(1-y/(cabY-4));else if(y<cabY)r=r0+.6+(y-(cabY-4))*.9;else if(y<cabY+8)r=r0+4.4+(y-cabY)*.14;else r=r0+5.6;
  q.a=q.b=r;q.n=2;q.k3=0;q.k4=0;q.rot=0;q.ox=0;q.oz=0;q.ri=0;return q;}});T.stF=f=>f*4>=cabY&&f*4<cabY+8?HTS.cab:HTS.conc;AP.T.push(T);return T;};
 C.twr=tw(C.tower.x,C.tower.z,76,4.6,64,'Torre CYI');AP.CYW.twr=tw(AP.CYW.tower.x,AP.CYW.tower.z,40,3.4,28,'Torre CYW');}
// svuota i palazzi a struttura: restano pilastri, copertura e testate; le facce interne diventano esterne
function apFrame(b){if(!voxelize(b))return;const V=b.vox,C=V.cells,nx=b.nx,nz=b.nz,ny=b.ny,M=V.mask;
 for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const ci=x+nx*(z+nz*y);if(C[ci]<0)continue;const edge=x===0||z===0||x===nx-1||z===nz-1,roof=y===ny-1;
  let keep=false;if(roof)keep=true;else if(edge){const lg=z===0||z===nz-1,sh=x===0||x===nx-1;keep=(lg&&(x%4===0||x===nx-1))||(sh&&(z%4===0||z===nz-1));}else keep=nz>=12&&x%8===4&&z===Math.floor(nz/2);
  if(!keep){cellRelease(C[ci]);C[ci]=-1;}}
 const so=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<nx&&y<ny&&z<nz&&C[x+nx*(z+nz*y)]>=0;
 for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const ci=x+nx*(z+nz*y);if(C[ci]<0)continue;let m=0;if(!so(x+1,y,z))m|=1;if(!so(x-1,y,z))m|=2;if(!so(x,y+1,z))m|=4;if(y>0&&!so(x,y-1,z))m|=8;if(!so(x,y,z+1))m|=16;if(!so(x,y,z-1))m|=32;M[ci]=m;
  iAttr(cellMesh,C[ci],b.x0+x*4+2,y*4+2,b.z0+z*4+2,4,4,4,b.style,b.seed,m,0);}}
function apHollow(b){if(!voxelize(b))return;const V=b.vox,C=V.cells,nx=b.nx,nz=b.nz,ny=b.ny,M=V.mask;
 for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const ci=x+nx*(z+nz*y);if(C[ci]<0)continue;const shell=x===0||z===0||x===nx-1||z===nz-1||y===ny-1;let keep=shell;
  if(b.door==='s'&&z===nz-1&&y<ny-1&&x>0&&x<nx-1)keep=false;if(!keep){cellRelease(C[ci]);C[ci]=-1;}}
 const so=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<nx&&y<ny&&z<nz&&C[x+nx*(z+nz*y)]>=0;
 for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const ci=x+nx*(z+nz*y);if(C[ci]<0)continue;let m=0;if(!so(x+1,y,z))m|=1;if(!so(x-1,y,z))m|=2;if(!so(x,y+1,z))m|=4;if(y>0&&!so(x,y-1,z))m|=8;if(!so(x,y,z+1))m|=16;if(!so(x,y,z-1))m|=32;M[ci]=m;
  iAttr(cellMesh,C[ci],b.x0+x*4+2,y*4+2,b.z0+z*4+2,4,4,4,b.style,b.seed,m,0);}}
/* ---------- vetrate continue del terminal: lastre vere (si vede fuori e dentro), si frantumano ---------- */
function apGlassBuild(b){const nx=b.nx,nz=b.nz,ny=b.ny,H=(ny-1)*4,P=[];
 const bayX=(zFace,zi)=>{for(let k=0;4*k+1<nx-1;k++){const c0=4*k+1,c1=Math.min(4*k+3,nx-2);if(c1<c0)continue;const xa=b.x0+c0*4,xb=b.x0+(c1+1)*4;P.push({ax:'z',a:xa,b:xb,c:zFace,zi,c0,c1});}};
 const bayZ=(xFace,xi)=>{for(let k=0;4*k+1<nz-1;k++){const c0=4*k+1,c1=Math.min(4*k+3,nz-2);if(c1<c0)continue;const za=b.z0+c0*4,zb=b.z0+(c1+1)*4;P.push({ax:'x',a:za,b:zb,c:xFace,xi,c0,c1});}};
 bayX(b.z0+1.2,0);bayX(b.z0+b.d-1.2,nz-1);bayZ(b.x0+1.2,0);bayZ(b.x0+b.w-1.2,nx-1);
 const gm=new THREE.MeshPhysicalMaterial({color:lc(0xd6e6ec),metalness:.15,roughness:.04,transparent:true,opacity:.2,envMapIntensity:1.3,depthWrite:false,side:THREE.DoubleSide}),fm=MS(0x8f979e,.32,.85);
 const gI=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),gm,P.length);gI.castShadow=false;gI.receiveShadow=false;gI.renderOrder=3;
 const FB=[];for(const p of P){const w=p.b-p.a,mc=Math.round(w/1.5);const B=Bin();for(let i=0;i<=mc;i++)B.add(new THREE.BoxGeometry(.08,H-.15,.18),-w/2+i*w/mc,(H-.15)/2,0);for(const y of [.06,3.1,6.2,9.3,H-.2])B.add(new THREE.BoxGeometry(w,.12,.2),0,y,0);FB.push(mergeBin(B));}
 const fI=new THREE.InstancedMesh(FB[0],fm,P.length);fI.castShadow=true;fI.receiveShadow=true;
 P.forEach((p,i)=>{const w=p.b-p.a,cx=(p.a+p.b)/2;if(p.ax==='z'){_dm.position.set(cx,.15+(H-.15)/2,p.c);_dm.rotation.set(0,0,0);}else{_dm.position.set(p.c,.15+(H-.15)/2,cx);_dm.rotation.set(0,Math.PI/2,0);}_dm.scale.set(w,H-.15,.05);_dm.updateMatrix();gI.setMatrixAt(i,_dm.matrix);
  _dm.position.y=.15;_dm.scale.set(w/(FB[0].boundingBox?1:1)/ (P[0].b-P[0].a),1,1);_dm.updateMatrix();fI.setMatrixAt(i,_dm.matrix);
  const cells=[];const L=nx*nz,Y=ny-1;for(let c=p.c0-1;c<=p.c1+1;c++){const ci=p.ax==='z'?c+nx*(p.zi+nz*Y):p.xi+nx*(c+nz*Y);cells.push(ci);}for(const c of [p.c0-1,p.c1+1])for(let y=0;y<Y;y++)cells.push(p.ax==='z'?c+nx*(p.zi+nz*y):p.xi+nx*(c+nz*y));
  const bb=p.ax==='z'?[p.a,0,p.c-.3,p.b,H,p.c+.3]:[p.c-.3,0,p.a,p.c+.3,H,p.b];AP.glass.push({b,gI,fI,i,bb,cells,alive:true,ax:p.ax,w,H});});
 scene.add(gI);scene.add(fI);}
function apShatter(g,vx,vz){if(!g.alive)return;g.alive=false;g.gI.setMatrixAt(g.i,_m0);g.gI.instanceMatrix.needsUpdate=true;g.fI.setMatrixAt(g.i,_m0);g.fI.instanceMatrix.needsUpdate=true;const B=g.bb;
 for(let k=0;k<Math.min(60,QP.shards*.15);k++)shardSpawn(rand(B[0],B[3]),rand(.5,B[4]),rand(B[2],B[5]),(vx||0)+rand(-2,2),rand(-1,2),(vz||0)+rand(-2,2),rand(.08,.32));
 sndGlass((B[0]+B[3])/2,3,(B[2]+B[5])/2);if(Math.random()<.5)spawnDebris((B[0]+B[3])/2,1.5,(B[2]+B[5])/2,2,.1,1.4,10,.3,63,rand(-1,1),1,rand(-1,1),0);}
function apGlassCheck(){for(const g of AP.glass){if(!g.alive)continue;const C=g.b.vox&&g.b.vox.cells;if(C){for(const ci of g.cells)if(ci>=0&&ci<C.length&&C[ci]<0){apShatter(g);break;}}}}
/* ---------- interni del terminal: banchi accettazione, nastri, controlli di sicurezza, sedute, negozi, porte d'imbarco ---------- */
function apInterior(A,big){const T=A.term,y=.15,x0=T.x0,z0=T.z0,W=T.w,D=T.d,col=(c,r,g,b)=>colorize(c,r,g,b);
 const S=Bin(),M=Bin(),E=Bin(),seats=[];
 const box=(B,w,h,d,x,yy,z,c,ry)=>B.add(col(new THREE.BoxGeometry(w,h,d),c[0],c[1],c[2]),x,yy,z,0,ry||0,0);
 const wood=[.42,.3,.2],wht=[.86,.86,.85],gry=[.36,.37,.39],dk=[.07,.075,.08],blu=[.12,.24,.5],red=[.55,.1,.1];
 const chkW=big?96:60,secW=big?32:0;
 // accettazione: isole con banchi su due lati, nastro bagagli al centro, totem retroilluminati
 const ZC=big?[z0+15,z0+D-13]:[z0+10];for(let i=0;i<ZC.length;i++){const zc=ZC[i],xa=x0+10,len=chkW-22;
  box(S,len,1.05,1.1,xa+len/2,y+.52,zc-1.6,wht);box(S,len,1.05,1.1,xa+len/2,y+.52,zc+1.6,wht);box(S,len,.08,1.25,xa+len/2,y+1.08,zc-1.6,gry);box(S,len,.08,1.25,xa+len/2,y+1.08,zc+1.6,gry);
  box(M,len,.35,1.1,xa+len/2,y+.4,zc,dk);for(let k=0;k<len;k+=.6)box(M,.05,.06,1.05,xa+k+.3,y+.6,zc,gry);
  for(let k=1.5;k<len;k+=3){for(const s of[-1,1]){box(E,.5,.32,.04,xa+k,y+1.32,zc+s*1.06,[.25,.45,.8]);box(M,.08,.25,.08,xa+k,y+1.2,zc+s*1.1,dk);}}
  for(const s of[-1,1]){const bx=xa+len/2;box(S,.2,4.2,.2,bx-6,y+2.1,zc,gry);box(S,.2,4.2,.2,bx+6,y+2.1,zc,gry);box(E,12.6,1.2,.15,bx,y+4.4,zc+s*.02,i%2?[.15,.45,.9]:[.95,.55,.12]);}
  for(let k=0;k<len;k+=2.4)for(const s of[-1,1]){box(M,.08,1,.08,xa+k,y+.5,zc+s*5.2,[.75,.76,.78]);if(k+2.4<len)box(M,2.4,.05,.03,xa+k+1.2,y+.92,zc+s*5.2,blu);}}
 // controlli di sicurezza (solo CYI): archi, scanner a raggi X, rulliere, paratia di vetro
 if(secW){const xs=x0+chkW+4;for(let l=0;l<4;l++){const zc=z0+12+l*11;box(S,1.2,2.3,.25,xs+14,y+1.15,zc-.9,gry);box(S,1.2,2.3,.25,xs+14,y+1.15,zc+.9,gry);box(S,1.2,.3,2,xs+14,y+2.35,zc,gry);
   box(S,3.6,1.6,1.4,xs+6,y+.8,zc+2.6,[.55,.57,.6]);box(M,3.6,.3,.9,xs+6,y+.45,zc+2.6,dk);box(M,6,.75,.9,xs+1.2,y+.38,zc+2.6,[.6,.62,.64]);box(M,4,.75,.9,xs+10,y+.38,zc+2.6,[.6,.62,.64]);
   for(let k=0;k<10;k++)box(M,.06,.06,.85,xs-1.6+k*.6,y+.78,zc+2.6,gry);box(E,.5,.35,.04,xs+6,y+2.2,zc+1.9,[.2,.8,.3]);box(M,.1,1,.1,xs+6,y+1.6,zc+1.9,dk);}
  const gp=Bin();for(let z=z0+4;z<z0+D-4;z+=2)gp.add(new THREE.BoxGeometry(.06,2.6,1.98),xs+20,y+1.3,z+1);const gm=new THREE.Mesh(mergeBin(gp),new THREE.MeshPhysicalMaterial({color:lc(0xcfe0e6),roughness:.05,transparent:true,opacity:.18,depthWrite:false}));scene.add(gm);}
 // sala partenze: file di sedute rivolte verso le vetrate, porte d'imbarco con banco e numero, negozi
 const xL=x0+chkW+secW+6,xR=x0+W-6;for(let x=xL;x<xR-6;x+=11){for(let r=0;r<(big?5:3);r++){const zz=z0+D-14-r*3.4;if(Math.abs((x-x0)%32-18)<4&&Math.abs(zz-(z0+D/2))<5)continue;for(let k=0;k<6;k++)seats.push([x+k*.78,y,zz]);}}
 const gates=A.stands.filter(s=>s.jb);gates.forEach((st,i)=>{const gx=st.x-20,gz=z0+D-5;box(S,3.2,1.05,.9,gx+5,y+.52,gz,wht);box(S,3.3,.07,1,gx+5,y+1.07,gz,gry);box(M,.12,3.2,.12,gx+9,y+1.6,gz,dk);box(E,1.6,.9,.1,gx+9,y+3.5,gz,[.95,.75,.1]);});
 if(big){const shops=[[x0+chkW+secW+12,[.85,.18,.18]],[x0+chkW+secW+44,[.15,.55,.25]],[x0+chkW+secW+78,[.95,.6,.1]],[x0+W-30,[.2,.35,.85]]];
  for(const [sx,c] of shops){const sz=z0+7;box(S,14,1.1,1,sx,y+.55,sz+3,wht);box(S,14,2.4,.3,sx,y+1.2,sz-1.6,wood);for(let k=0;k<5;k++)box(M,2.2,1.6,.5,sx-5.6+k*2.8,y+.8,sz-1,[.6,.58,.55]);box(E,10,1.1,.15,sx,y+4.2,sz+3.5,c);box(S,.15,3.5,.15,sx-6.8,y+2.3,sz+3.4,gry);box(S,.15,3.5,.15,sx+6.8,y+2.3,sz+3.4,gry);
   for(let k=0;k<4;k++){const tx=sx-5+k*3.3,tz=sz+7;box(M,1,.05,1,tx,y+.75,tz,wht);box(M,.08,.75,.08,tx,y+.37,tz,dk);}}}
 // piante in vaso
 for(let x=xL+5;x<xR;x+=24)box(M,1.2,.9,1.2,x,y+.45,z0+D/2+3,[.6,.6,.58]);
 const mS=new THREE.Mesh(mergeBin(S),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.25})),mM=new THREE.Mesh(mergeBin(M),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.3})),mE=new THREE.Mesh(mergeBin(E),new THREE.MeshBasicMaterial({vertexColors:true}));
 for(const m of [mS,mM]){m.castShadow=true;m.receiveShadow=true;scene.add(m);}mE.material.color.setScalar(1.6);scene.add(mE);
 // sedute istanziate (scocca, braccioli, gambe)
 const sg=Bin();sg.add(colorize(rboxGeo(.62,.08,.5,.03,1),.2,.32,.55),0,.45,0);sg.add(colorize(rboxGeo(.62,.55,.08,.03,1),.2,.32,.55),0,.75,.24,-.12);sg.add(colorize(new THREE.BoxGeometry(.05,.22,.42),.5,.5,.52),.34,.58,0);sg.add(colorize(new THREE.BoxGeometry(.05,.45,.05),.2,.2,.22),0,.22,0);
 const si=new THREE.InstancedMesh(mergeBin(sg),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.2}),Math.max(1,seats.length));seats.forEach((p,i)=>{_m4.makeRotationY(Math.PI).setPosition(p[0],p[1],p[2]);si.setMatrixAt(i,_m4);});si.castShadow=true;si.receiveShadow=true;scene.add(si);
 A.seats=seats;
 // persone sedute e in coda (figure semplici a colori diversi)
 const pg=Bin();pg.add(rboxGeo(.42,.55,.26,.08,1),0,.95,-.02);pg.add(new THREE.SphereGeometry(.12,10,8),0,1.38,-.02);pg.add(rboxGeo(.36,.16,.48,.06,1),0,.6,-.22);for(const s of[-1,1]){pg.add(new THREE.CylinderGeometry(.065,.06,.46,8),s*.1,.28,-.45);pg.add(new THREE.CylinderGeometry(.05,.045,.42,8),s*.26,.92,-.1,.3,0,0);}
 const pp=[];for(const p of seats)if(Math.random()<.42)pp.push([p[0],p[1],p[2]-.02,Math.PI]);
 const pi=new THREE.InstancedMesh(mergeBin(pg),new THREE.MeshStandardMaterial({roughness:.75}),Math.max(1,pp.length));const pc=[0x2b3a55,0x6b2a2a,0x2c5a3c,0xc8c2b4,0x1d1d1f,0x8a6a3a,0x3d4f7a,0xd9d4c7,0x5a2d5f];
 pp.forEach((p,i)=>{_m4.makeRotationY(p[3]).setPosition(p[0],p[1],p[2]);pi.setMatrixAt(i,_m4);pi.setColorAt(i,new THREE.Color(pc[i%pc.length]).convertSRGBToLinear());});pi.castShadow=true;scene.add(pi);
 // tabelloni partenze/arrivi con i voli veri (aggiornati dal programma dei voli)
 const mkF=(x,z,ry,kind)=>{const c=document.createElement('canvas');c.width=1024;c.height=512;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const m=new THREE.Mesh(new THREE.PlaneGeometry(6.4,3.2),new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(1.5,1.5,1.5)}));
  m.position.set(x,y+4.1,z);m.rotation.y=ry;scene.add(m);const back=new THREE.Mesh(new THREE.BoxGeometry(6.7,3.5,.3),MS(0x1d2024,.5,.6));back.position.set(x-Math.sin(ry)*.17,y+4.1,z-Math.cos(ry)*.17);back.rotation.y=ry;back.castShadow=true;scene.add(back);
  const pst=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,2.4,10),MS(0x50555c,.4,.8));pst.position.set(x-Math.sin(ry)*.17,y+1.2,z-Math.cos(ry)*.17);scene.add(pst);AP.fids.push({c,t,kind,ap:A===AP.CYI?'CYI':'CYW',m});};
 mkF(x0+chkW/2,z0+5,0,'dep');if(big){mkF(x0+chkW+secW+30,z0+D/2+1,Math.PI,'dep');mkF(x0+chkW+secW+90,z0+D/2+1,Math.PI,'arr');mkF(x0+chkW*.3,z0+D-6,Math.PI,'arr');}else mkF(x0+W-40,z0+D-4,Math.PI,'arr');}
/* ---------- pontili d'imbarco telescopici: rotonda, tunnel vetrato, cabina con soffietto; si agganciano alla porta dell'aereo ---------- */
const AP_RAMPS=[];
function apJetBridges(A){const zf=A.term.z0+A.term.d,mt=MS(0xb9bec4,.45,.55),dk=MS(0x2e3237,.6,.5),gl=new THREE.MeshPhysicalMaterial({color:lc(0xa9c4cf),roughness:.06,metalness:.2,transparent:true,opacity:.35,depthWrite:false});
 for(const st of A.stands){if(!st.jb)continue;const rx=st.x-22,rz=zf+7.5,ry=.75,J={st,rx,rz,ry,t:0,tg:0,dock:null,door:null};
  const g=new THREE.Group();scene.add(g);
  const link=new THREE.Mesh(new THREE.BoxGeometry(3,3.1,6.2),mt);link.position.set(rx,.15+1.7,zf+2.9);link.castShadow=link.receiveShadow=true;g.add(link);
  const rot=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,3.3,20),mt);rot.position.set(rx,ry+1.6,rz);rot.castShadow=true;g.add(rot);const col=new THREE.Mesh(new THREE.CylinderGeometry(.5,.6,ry,10),dk);col.position.set(rx,ry/2,rz);g.add(col);
  const arm=new THREE.Group();arm.position.set(rx,ry,rz);g.add(arm);
  const tub=new THREE.Group();arm.add(tub);const sh=new THREE.Mesh(new THREE.BoxGeometry(1,.35,2.8),mt),roof=new THREE.Mesh(new THREE.BoxGeometry(1,.3,2.9),mt),gL=new THREE.Mesh(new THREE.BoxGeometry(1,2.2,.06),gl),gR=gL.clone(),fl=new THREE.Mesh(new THREE.BoxGeometry(1,.08,2.4),MS(0x3a3f45,.8,.2));
  sh.position.y=.0;roof.position.y=2.75;gL.position.set(0,1.3,1.38);gR.position.set(0,1.3,-1.38);fl.position.y=.2;for(const m of [sh,roof,fl]){m.castShadow=m.receiveShadow=true;tub.add(m);}tub.add(gL,gR);
  const cab=new THREE.Group();scene.add(cab);const cb=new THREE.Mesh(new THREE.BoxGeometry(3.2,3.1,3.4),mt);cb.position.y=1.55;cb.castShadow=true;cab.add(cb);const bel=new THREE.Mesh(new THREE.BoxGeometry(.8,2.9,3.1),dk);bel.position.set(1.9,1.55,0);cab.add(bel);
  const wl=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,1,8),dk);scene.add(wl);const wh=new THREE.Mesh(new THREE.BoxGeometry(1.6,.7,.9),dk);scene.add(wh);
  Object.assign(J,{g,arm,tub,cab,wl,wh});(A.jbL||(A.jbL=[])).push(J);AP.jb.push(J);J.ramp={ax:rx,az:rz,ay:ry+.2,bx:rx,bz:rz,by:ry+.2,hw:1.15};J.link={ax:rx,az:zf-.5,ay:.15,bx:rx,bz:rz,by:ry+.2,hw:1.3};AP_RAMPS.push(J.ramp,J.link);apJbPose(J);}}
function apJbPose(J){const st=J.st,wide=st.w>40,park=[st.x-22+8,J.rz+6,J.ry+1.2],dock=J.door||[st.x-(wide?3.1:1.98)-1.75,st.z+(wide?11:6.5),wide?4.9:3.4],t=J.t*J.t*(3-2*J.t);
 const cx=lerp(park[0],dock[0],t),cz=lerp(park[1],dock[1],t),cy=lerp(park[2],dock[2],t)-.05,dx=cx-J.rx,dz=cz-J.rz,L=Math.max(3,Math.hypot(dx,dz)-1.6),yaw=Math.atan2(-dz,dx),pit=Math.atan2(cy-J.ry,L);
 J.arm.rotation.set(0,yaw,pit,'YXZ');J.tub.scale.set(L,1,1);J.tub.position.set(L/2+2.2,0,0);J.cab.position.set(cx,cy,cz);J.cab.rotation.y=yaw;
 const wx=J.rx+Math.cos(yaw)*(L*.78+2),wz=J.rz-Math.sin(yaw)*(L*.78+2),wy=J.ry+(cy-J.ry)*.78;J.wl.position.set(wx,wy/2,wz);J.wl.scale.y=wy;J.wh.position.set(wx,.5,wz);J.wh.rotation.y=yaw;
 const R=J.ramp;R.ax=J.rx;R.az=J.rz;R.ay=J.ry+.2;R.bx=cx;R.bz=cz;R.by=cy+.25;J.cabP=[cx,cy,cz];}
function apRampsPlayer(){const P=player;if(P.mode!=='walk'||P.fly||P.swim)return;for(const r of AP_RAMPS){const dx=r.bx-r.ax,dz=r.bz-r.az,L2=dx*dx+dz*dz+1e-6;let t=((P.x-r.ax)*dx+(P.z-r.az)*dz)/L2;if(t<-.08||t>1.08)continue;t=clamp(t,0,1);
  const px=r.ax+dx*t,pz=r.az+dz*t,lat=Math.hypot(P.x-px,P.z-pz);if(lat>r.hw+.4)continue;const y=r.ay+(r.by-r.ay)*t;if(P.y<y-1.4||P.y>y+2)continue;
  if(P.y<=y+.45&&P.vy<=.5){P.y=y;P.vy=Math.max(0,P.vy);P.ground=true;}if(lat>r.hw-.35){const k=(r.hw-.35)/lat;P.x=px+(P.x-px)*k;P.z=pz+(P.z-pz)*k;}}}
/* ---------- luci aeroportuali: bordi pista, asse, soglie, zona di contatto, sentiero luminoso con lampi in sequenza, PAPI, raccordi ---------- */
function apLights(A,code){const R=A.rw,W=[2.6,2.5,2.2],G=[.2,3,.6],Rd=[3.2,.12,.08],B=[.25,.5,3.2],Y=[3,2.2,.3],y=.45,isI=code==='CYI';
 for(let x=R.x0;x<=R.x1+.1;x+=60)for(const s of[-1,1])lpAdd(x,y,R.z+s*(R.hw+1),x>R.x1-600?Y:W,.32,0,0);
 for(let x=R.x0+15;x<R.x1;x+=30)lpAdd(x,.25,R.z,(R.x1-x<300)?Rd:(R.x1-x<900&&Math.floor(x/30)%2)?Rd:W,.22,0,0);
 for(let k=-R.hw;k<=R.hw+.1;k+=R.hw/5){lpAdd(R.x0-2,y,R.z+k,G,.34,0,0);lpAdd(R.x0+1,y,R.z+k,Rd,.3,0,0);lpAdd(R.x1+2,y,R.z+k,G,.34,0,0);lpAdd(R.x1-1,y,R.z+k,Rd,.3,0,0);}
 if(isI)for(let x=R.x0+60;x<R.x0+900;x+=60)for(const s of[-1,1])for(let k=0;k<3;k++)lpAdd(x,.25,R.z+s*(9+k*1.5),W,.2,0,0);
 // sentiero luminoso di avvicinamento (lato 09: sul mare, su pali) e PAPI
 const piers=[],bars=[];const als=(x0,dir,len)=>{for(let d=30;d<=len;d+=30){const x=x0-dir*d,gy=Math.max(groundH(x,R.z),-6),ly=Math.max(.6,gy+.6)+d*.004;for(let k=-2;k<=2;k++)lpAdd(x,ly,R.z+k*1.05,W,.3,0,0);
   if(gy<0)piers.push([x,(ly+gy-1)/2-1,R.z,.35,ly-gy+2,.35]);bars.push([x,ly-.25,R.z,.25,.15,5.4]);if(d>=300&&d<=len)lpAdd(x,ly+.35,R.z,[4,4,4],.55,3,(len-d)/len*.6);
   if(d===300){for(let k=-14;k<=14;k+=1.5)if(Math.abs(k)>3)lpAdd(x,ly,R.z+k,W,.3,0,0);bars.push([x,ly-.25,R.z,.25,.15,30]);}
   if(d<=270&&d>=60&&isI){for(const s of[-1,1])for(let k=0;k<3;k++)lpAdd(x,ly,R.z+s*(6+k*1.3),Rd,.26,0,0);}}};
 if(isI){als(R.x0,1,900);als(R.x1,-1,720);}else{als(R.x1,-1,600);als(R.x0,1,300);}
 const papi=(x,s,dirx)=>{for(let k=0;k<4;k++){const ang=[3.5,3.17,2.83,2.5][k]*Math.PI/180;lpAdd(x,.9,R.z+s*(R.hw+15+k*9),[1,1,1],.42,4,ang);}};
 papi(R.x0+300,-1,1);papi(R.x1-300,1,-1);
 // vie di rullaggio: bordi blu, asse verde
 for(let x=R.x0+20;x<R.x1-20;x+=45)for(const s of[-1,1])lpAdd(x,.35,A.twz+s*(A.twh+1),B,.24,0,0);
 for(let x=R.x0+20;x<R.x1-20;x+=30)lpAdd(x,.2,A.twz,G,.17,0,0);
 for(const e of A.exits){const L=Math.hypot(e[2]-e[0],e[3]-e[1]);for(let d=0;d<=L;d+=15){const t=d/L;lpAdd(lerp(e[0],e[2],t),.2,lerp(e[1],e[3],t),G,.17,0,0);}
  const hx=lerp(e[0],e[2],(R.z-R.hw-45-e[1])/(e[3]-e[1])),hz=R.z-R.hw-45;for(const s of[-1,1])lpAdd(hx+s*(A.twh+2.5),.9,hz,Y,.3,1,s>0?.5:0);}
 const pm=MS(0x5d6268,.5,.7),pI=new THREE.InstancedMesh(boxGeo,pm,Math.max(1,piers.length+bars.length));[...piers,...bars].forEach((q,i)=>{_m4.makeScale(q[3],q[4],q[5]).setPosition(q[0],q[1],q[2]);pI.setMatrixAt(i,_m4);});pI.castShadow=true;scene.add(pI);}
/* ---------- numeri di pista, cartelli, maniche a vento, radar, depositi di carburante ---------- */
function apDecal(txt,x,z,ry,w,h){const c=document.createElement('canvas');c.width=256;c.height=512;const g=c.getContext('2d');g.fillStyle='#fff';g.font='900 300px Arial, Helvetica, sans-serif';g.textAlign='center';g.textBaseline='middle';
 g.save();g.translate(128,256);g.scale(.42,1.25);g.fillText(txt,0,8);g.restore();const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.3,roughness:.7,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-4,color:new THREE.Color(.85,.85,.83)}));m.position.set(x,.17,z);m.rotation.y=ry;m.receiveShadow=true;scene.add(m);}
function apSock(x,z){const g=new THREE.Group();g.position.set(x,.15,z);scene.add(g);AB(g,new THREE.CylinderGeometry(.07,.1,7,8),MS(0xd8d8d4,.5,.6),0,3.5,0);AB(g,new THREE.TorusGeometry(.42,.04,6,16).rotateY(Math.PI/2),MS(0x777b80,.4,.7),0,7,0);
 const s=new THREE.Group();s.position.y=7;g.add(s);const segs=[];for(let i=0;i<5;i++){const r0=.42-i*.055,r1=r0-.055,m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,.75,14,1,true).rotateZ(Math.PI/2),new THREE.MeshStandardMaterial({color:lc(i%2?0xf2f2ee:0xff5a14),roughness:.85,side:THREE.DoubleSide}));m.position.x=.375+i*.75;m.castShadow=true;s.add(m);segs.push(m);}
 lpAdd(x,7.4,z,[3,.1,.08],.3,0,0);AP.socks.push({g,s,segs,ph:Math.random()*9});}
function apTank(x,z,r,h){const g=new THREE.Group();g.position.set(x,.15,z);scene.add(g);const body=AB(g,new THREE.CylinderGeometry(r,r,h,40),MS(0xe9ebec,.55,.25),0,h/2,0),top=AB(g,new THREE.SphereGeometry(r,40,10,0,TAU,0,.42).scale(1,.55,1),MS(0xd4d7da,.5,.3),0,h-.8,0);
 for(let i=0;i<8;i++)AB(g,new THREE.BoxGeometry(.12,h,.12),MS(0x9aa0a6,.5,.6),Math.cos(i/8*TAU)*(r+.05),h/2,Math.sin(i/8*TAU)*(r+.05));AB(g,new THREE.TorusGeometry(r+.6,.08,6,48).rotateX(Math.PI/2),MS(0x9aa0a6,.5,.6),0,h+.4,0);
 AB(g,new THREE.CylinderGeometry(r+2.4,r+2.4,.9,40,1,true),MS(0x8f8b84,.9,0),0,.45,0).material.side=THREE.DoubleSide;AP.tanks.push({g,body,top,x,z,r,h,hp:1,alive:true});}
function apTankHit(x,y,z,R,P){for(const T of AP.tanks){if(!T.alive)continue;const d=Math.hypot(x-T.x,z-T.z)-T.r,dy=Math.max(0,y-T.h);if(d>R+3||dy>R)continue;T.hp-=P*.5*(1-Math.max(0,d)/(R+3));if(T.hp>0)continue;T.alive=false;
  setTimeout(()=>{explode(T.x,T.h*.7,T.z,26,2.6);for(let k=0;k<6;k++)addFire(T.x+rand(-T.r,T.r)*.6,T.h*.3,T.z+rand(-T.r,T.r)*.6,rand(4,7),rand(90,160));T.body.material=T.top.material=MS(0x1b1a19,.95,.1);T.g.scale.set(1,.55,1);T.g.rotation.z=rand(-.08,.08);
   for(const o of AP.tanks)if(o.alive&&Math.hypot(o.x-T.x,o.z-T.z)<T.r*3.2)o.hp-=.6;},220+Math.random()*500);}}
function apRadar(x,z){const g=new THREE.Group();g.position.set(x,.15,z);scene.add(g);const m=MS(0xe6e8ea,.5,.4);for(let i=0;i<4;i++){const a=i/4*TAU+.785;AB(g,new THREE.CylinderGeometry(.12,.16,16,6),m,Math.cos(a)*1.4,8,Math.sin(a)*1.4,Math.sin(a)*.09,0,-Math.cos(a)*.09);}
 AB(g,new THREE.BoxGeometry(3.6,.4,3.6),m,0,16.1,0);const rot=new THREE.Group();rot.position.y=16.4;g.add(rot);const ant=new THREE.Mesh(new THREE.CylinderGeometry(3.6,3.6,6.5,24,1,true,-.5,1).rotateZ(Math.PI/2).scale(.35,1,1),new THREE.MeshStandardMaterial({color:lc(0xd9dcdf),roughness:.4,metalness:.6,side:THREE.DoubleSide}));ant.position.set(0,2.2,0);rot.add(ant);
 AB(rot,new THREE.BoxGeometry(.6,1.6,.6),m,0,.8,0);lpAdd(x,.15+21.5,z,[3.5,.1,.08],.45,1,.3);AP.radar=rot;}
function apSigns(A){const mk=(txt,bg,fg)=>{const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,256,96);g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(5,5,246,86);g.fillStyle=fg;g.font='900 64px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,128,52);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return new THREE.MeshStandardMaterial({map:t,emissive:new THREE.Color(1,1,1),emissiveMap:t,emissiveIntensity:.35,roughness:.6});};
 const R=A.rw,frame=MS(0x1b1d20,.6,.4);for(let i=0;i<A.exits.length;i++){const e=A.exits[i],hz=R.z-R.hw-48,hx=lerp(e[0],e[2],(hz-e[1])/(e[3]-e[1]))-A.twh-4;
  const g=new THREE.Group();g.position.set(hx,.15,hz);scene.add(g);AB(g,new THREE.BoxGeometry(2.6,1,.3),frame,0,.85,0);const f1=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.9),mk('09-27','#c4161c','#fff')),f2=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.9),mk('A'+(i+1),'#111','#f5c400'));
  f1.position.set(-.64,.85,.16);f2.position.set(.64,.85,.16);g.add(f1,f2);const b1=f1.clone();b1.rotation.y=Math.PI;b1.position.z=-.16;g.add(b1);}}
/* ---------- mezzi di piazzale (si possono travolgere e far saltare come gli altri oggetti) ---------- */
function apVehicleKinds(){if(PK.tug)return;const wheel=r=>new THREE.CylinderGeometry(r,r,.3,14).rotateZ(Math.PI/2),C=(g,c)=>colorize(g,c[0],c[1],c[2]);
 const Y=[.85,.62,.08],Wt=[.88,.88,.86],D=[.06,.06,.07],Gl=[.1,.14,.18],Rd=[.6,.08,.06],Bl=[.1,.22,.45];
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.3});
 const tug=[C(rboxGeo(2.4,.9,5.2,.12,1),Y),C(rboxGeo(1.6,.9,1.2,.1,1),Gl),C(new THREE.BoxGeometry(2.5,.12,.4),D)];tug[0].translate(0,.75,0);tug[1].translate(0,1.55,1.3);tug[2].translate(0,.45,-2.7);for(const p of[[-1.05,-1.6],[1.05,-1.6],[-1.05,1.6],[1.05,1.6]])tug.push(C(wheel(.48),D).translate(p[0],.48,p[1]));
 defProp('tug',[{g:mergeGeos(tug),m:mat}],[1.25,.9,2.6],9000,60,'metal',2);
 const bus=[C(rboxGeo(2.9,2.6,13,.25,2),Bl),C(new THREE.BoxGeometry(2.95,1.2,12.2),Gl),C(new THREE.BoxGeometry(3,.12,13.1),Wt)];bus[0].translate(0,1.65,0);bus[1].translate(0,2.05,0);bus[2].translate(0,.85,0);for(const z of[-4.8,4.8])for(const x of[-1.25,1.25])bus.push(C(wheel(.5),D).translate(x,.5,z));
 defProp('abus',[{g:mergeGeos(bus),m:mat}],[1.5,1.6,6.5],14000,30,'metal',4);
 const fuel=[C(rboxGeo(2.5,2.2,2.4,.15,1),Rd),C(new THREE.BoxGeometry(2.4,.9,.08),Gl),C(new THREE.CylinderGeometry(1.25,1.25,6.4,20).rotateX(Math.PI/2),Wt),C(new THREE.BoxGeometry(2.4,.3,7.2),D)];fuel[0].translate(0,1.6,-3.9);fuel[1].translate(0,2.1,-5.12);fuel[2].translate(0,2,1);fuel[3].translate(0,.75,.5);
 for(const z of[-3.9,2,3.4])for(const x of[-1.1,1.1])fuel.push(C(wheel(.52),D).translate(x,.52,z));defProp('fuelt',[{g:mergeGeos(fuel),m:mat}],[1.3,1.6,4.6],16000,30,'metal',3);
 const stp=[C(rboxGeo(2.3,1.9,2,.12,1),Wt),C(new THREE.BoxGeometry(2.3,.4,6),D)];stp[0].translate(0,1.35,-2.6);stp[1].translate(0,.75,.4);for(let i=0;i<14;i++)stp.push(C(new THREE.BoxGeometry(1.4,.08,.4),[.7,.72,.75]).translate(0,1.2+i*.26,-1.2+i*.32));
 stp.push(C(new THREE.BoxGeometry(.06,4.6,.06),[.8,.8,.82]).translate(-.72,2.6,1.4),C(new THREE.BoxGeometry(.06,4.6,.06),[.8,.8,.82]).translate(.72,2.6,1.4),C(new THREE.BoxGeometry(1.6,.12,1.4),[.7,.72,.75]).translate(0,4.85,3.6));for(const z of[-2.6,2])for(const x of[-1.05,1.05])stp.push(C(wheel(.42),D).translate(x,.42,z));
 defProp('stairs',[{g:mergeGeos(stp),m:mat}],[1.2,2.4,3.6],6000,30,'metal',2);}
/* ---------- scogliere sui lati verso il mare ---------- */
function seaEdges(Z,skip){const E=[[Z.x0,Z.z1,Z.x1,Z.z1,0,1],[Z.x0,Z.z0,Z.x1,Z.z0,0,-1],[Z.x0,Z.z0,Z.x0,Z.z1,-1,0],[Z.x1,Z.z0,Z.x1,Z.z1,1,0]];
 for(const e of E){const L=Math.hypot(e[2]-e[0],e[3]-e[1]),n=Math.ceil(L/40);let st=-1;for(let i=0;i<=n;i++){const t=Math.min(1,i/n),x=lerp(e[0],e[2],t),z=lerp(e[1],e[3],t);let sea=i<n&&terrainNat(x+e[4]*30,z+e[5]*30)<-2;if(skip&&skip(x,z))sea=false;
  if(sea&&st<0)st=t;if((!sea||i===n)&&st>=0){const t1=sea?1:t;if(t1>st)seawall(lerp(e[0],e[2],st),lerp(e[1],e[3],st),lerp(e[0],e[2],t1),lerp(e[1],e[3],t1),e[4],e[5]);st=-1;}}}}
/* ---------- costruzione completa degli aeroporti ---------- */
function apBuild(){const C=AP.CYI,W=AP.CYW;
 ovMesh(OVL[1],ovMat('cyi',apGLSL(C,'cyi')));ovMesh(OVL[2],ovMat('cyw',apGLSL(W,'cyw')));ovMesh(OVL[3],ovMat('cyw2',`void zg(vec2 p){gEmis=vec3(0.);gMet=0.;float d=abs(p.x+2440.);float n2=vn2(p*2.7);if(d<7.){vec3 a=asph(p);float mk=(1.-step(.08,abs(d-3.6)))*step(fract(p.y/9.),.45)+(1.-step(.08,abs(d-6.6)));gAlb=mix(a,vec3(.75,.74,.7),mk*.8);gRough=.86;gEmis+=a*vec3(1.,.93,.82)*smoothstep(.15,.6,uNight)*1.4*lamps(p.y,d-5.,30.,15.);}else{gAlb=grass(p);gRough=.95;}}`));
 seaEdges(OVL[1]);seaEdges(OVL[2],(x,z)=>x>-2530&&x<-2350&&z<1805);seaEdges(OVL[3]);
 for(const k of ['CYI','CYW']){const A=AP[k];apFrame(A.termB);apGlassBuild(A.termB);apInterior(A,k==='CYI');apLights(A,k);for(const h of A.hang||[])apHollow(h);if(A.fs)apHollow(A.fs);}
 apJetBridges(C);apSigns(C);apSigns(W);
 const R=C.rw;apDecal('09',R.x0+75,R.z,-Math.PI/2,9,20);apDecal('27',R.x1-75,R.z,Math.PI/2,9,20);const R2=W.rw;apDecal('09',R2.x0+60,R2.z,-Math.PI/2,7,15);apDecal('27',R2.x1-60,R2.z,Math.PI/2,7,15);
 apSock(R.x0+150,R.z-60);apSock(R.x1-150,R.z-60);apSock(R2.x1-200,R2.z-45);apRadar(3175,1305);
 for(let i=0;i<4;i++)apTank(3962+i*42,1306,11,15);
 // pensilina davanti al terminal, torri faro del piazzale, antenne ILS e sentinella della pendenza
 {const T=C.term,g=new THREE.Group(),m=MS(0xdfe2e5,.4,.5),led=new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,2.3,2.1)});scene.add(g);AB(g,new THREE.BoxGeometry(T.w+8,.5,13),m,T.x0+T.w/2,6.3,T.z0-6.5);
  for(let x=T.x0;x<=T.x0+T.w;x+=16){AB(g,new THREE.CylinderGeometry(.22,.26,6.2,12),m,x,3.2,T.z0-6.9);}for(let x=T.x0+8;x<T.x0+T.w;x+=16)AB(g,new THREE.BoxGeometry(3,.05,.3),led,x,6.03,T.z0-4).castShadow=false;}
 {const m=MS(0x9aa1a8,.5,.6),hm=MS(0x30343a,.5,.5);for(let i=1;i<10;i++){const x=2700+i*125,z=1584,g=new THREE.Group();g.position.set(x,.15,z);scene.add(g);AB(g,new THREE.CylinderGeometry(.35,.6,25,10),m,0,12.5,0);AB(g,new THREE.BoxGeometry(4.2,.3,1.4),hm,0,25.2,0);
   for(let k=0;k<4;k++){AB(g,new THREE.BoxGeometry(.8,.6,.5),hm,-1.6+k*1.07,24.6,-.3);lpAdd(x-1.6+k*1.07,24.35+.15,z-.62,[3,2.7,2.2],.5,5,0);}}
  for(let i=0;i<3;i++){const x=-2860+i*130,z=1908,g=new THREE.Group();g.position.set(x,.15,z);scene.add(g);AB(g,new THREE.CylinderGeometry(.3,.5,20,10),m,0,10,0);AB(g,new THREE.BoxGeometry(3,.3,1.2),hm,0,20.2,0);for(let k=0;k<3;k++)lpAdd(x-1+k,19.6,z-.6,[3,2.7,2.2],.45,5,0);}}
 {const m=MS(0xd8d8d4,.5,.6),r=MS(0xc8102e,.6,.2),g=new THREE.Group();g.position.set(R.x1+260,.15,R.z);scene.add(g);for(let k=-12;k<=12;k++){AB(g,new THREE.BoxGeometry(.3,2.4,.3),m,0,1.2,k*1.6);AB(g,new THREE.BoxGeometry(.6,.25,.8),k%2?r:m,0,2.6,k*1.6);}AB(g,new THREE.BoxGeometry(.4,.3,40),m,0,2.2,0);
  const gs=new THREE.Group();gs.position.set(R.x0+300,.15,R.z+120);scene.add(gs);AB(gs,new THREE.CylinderGeometry(.18,.3,14,8),m,0,7,0);for(const y of [6,10,13.4])AB(gs,new THREE.BoxGeometry(.4,.8,1.2),r,.3,y,0);AB(gs,new THREE.BoxGeometry(2,2,2),m,1.5,1,0);}
 // luci di ostacolo su torri, hangar e terminal
 for(const T of AP.T){lpAdd(T.x,T.H+1.2,T.z,[4,.15,.08],.6,1,Math.random());}for(const h of [...(C.hang||[]),...(W.hang||[])]){for(const p of [[h.x0,h.z0],[h.x0+h.w,h.z0],[h.x0,h.z0+h.d],[h.x0+h.w,h.z0+h.d]])lpAdd(p[0],h.h+.5,p[1],[3.2,.12,.08],.35,0,0);}
 // antenne e cupole radar sul tetto della torre
 for(const T of AP.T){const g=new THREE.Group();g.position.set(T.x,T.H,T.z);AB(g,new THREE.CylinderGeometry(.08,.12,6,6),MS(0xcfd3d6,.4,.8),1.5,3,0);AB(g,new THREE.SphereGeometry(1.1,16,10),MS(0xf0f0ee,.6,.1),-1.5,1,1);AB(g,new THREE.CylinderGeometry(.06,.06,4,6),MS(0xcfd3d6,.4,.8),-1,2,-2);htAcc(T,g,T.N-1);}}
function apProps(){apVehicleKinds();const C=AP.CYI,W=AP.CYW;
 for(const st of C.stands){if(!st.jb)addProp(PK.stairs,st.x-8,.15,st.z+9,Math.PI/2);addProp(PK.tug,st.x+(st.w/2+5),.15,st.z+14,Math.PI*.5+rand(-.2,.2));}
 addProp(PK.fuelt,4060,.15,1340,0);
 for(const st of W.stands){addProp(PK.stairs,st.x-6,.15,st.z+8,Math.PI/2);}addProp(PK.tug,-2650,.15,1880,0);addProp(PK.fuelt,-2620,.15,1890,Math.PI/2);
 for(let x=2460;x<3070;x+=30)for(const s of[-1,1]){if(s>0&&x>C.term.x0-14&&x<C.term.x0+C.term.w+14)continue;addProp(PK.nlamp,x,.15,C.land+s*8.9,s>0?0:Math.PI);}
 for(let x=2482;x<2716;x+=24)for(let j=0;j<4;j++)addProp(PK.nlamp,x,.15,1276+16*j+8+1.75,0);
 for(let z=1575;z<1815;z+=30)for(const s of[-1,1])addProp(PK.nlamp,-2440+s*7.4,.15,z,s>0?Math.PI/2:-Math.PI/2);
 for(let x=2450;x<2700;x+=14)addProp(PK.tree,x,.15,1360,Math.random()*TAU);}
function apCars(){const R=mulberry32(31);const put=(x,z,yaw)=>{if(PC.slots.length>=1500)return;const sl={i:PC.slots.length,x,z,yaw,y:.96,col:lc(CAR_COLS[Math.floor(R()*CAR_COLS.length)]),taxi:false,alive:true};PC.slots.push(sl);setSlot(sl,true);};
 for(let j=0;j<4;j++)for(let x=2471.3;x<2715;x+=2.6){if(R()>.55)continue;const z0=1276+16*j;put(x,z0+2.5,0);if(R()<.8)put(x,z0+13.5,Math.PI);}
 // fila dei taxi in attesa in fondo al marciapiede (la corsia davanti al terminal resta libera per chi accompagna i passeggeri)
 for(let x=2962;x<3000;x+=6.3){if(PC.slots.length>=1500)break;const sl={i:PC.slots.length,x,z:C_CURB(),yaw:-Math.PI/2,y:.96,col:lc(0xf2b705),taxi:true,alive:true};PC.slots.push(sl);setSlot(sl,true);}}
function C_CURB(){return AP.CYI.land+6.4;}
/* ---------- aggiornamento per fotogramma: maniche a vento, radar, pontili, vetrate ---------- */
let apT=0;
function apStep(dt){apT+=dt;const wa=Math.atan2(WIND.z,WIND.x),ws=clamp(.35+(WX.wind||.12)*1.3,.2,1);
 for(const S of AP.socks){S.g.rotation.y=-wa+Math.sin(apT*.7+S.ph)*.12;const droop=(1-ws)*1.2;S.segs.forEach((m,i)=>{m.position.y=-Math.pow(i/4,1.5)*droop*.9;m.rotation.z=-droop*.35*(i/4)+Math.sin(apT*6+i+S.ph)*.04*ws;m.scale.y=m.scale.z=.85+.15*ws;});}
 if(AP.radar)AP.radar.rotation.y+=dt*2.6;
 for(const J of AP.jb){const tg=J.dock?1:0;if(Math.abs(J.t-tg)>.001){J.t=clamp(J.t+(tg>J.t?1:-1)*dt*.12,0,1);apJbPose(J);}}
 if(Math.floor(apT*4)!==Math.floor((apT-dt)*4))apGlassCheck();}
// esplosioni: vetrate e depositi di carburante
{const ds0=destroySphere;destroySphere=function(x,y,z,R,P){ds0(x,y,z,R,P);if(inZone(x,z,60)){for(const g of AP.glass){if(!g.alive)continue;const B=g.bb,cx=clamp(x,B[0],B[3]),cy=clamp(y,B[1],B[4]),cz=clamp(z,B[2],B[5]);if(Math.hypot(cx-x,cy-y,cz-z)<R*1.8+2)apShatter(g,(cx-x)*.5,(cz-z)*.5);}apTankHit(x,y,z,R,P);}};}
