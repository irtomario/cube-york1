/* ======================= PATCH AA — STRADE DISTRUTTIBILI: CRATERI NELL'ASFALTO, NEL CEMENTO E NEL PRATO ======================= */
// L'asfalto non si sbriciola a blocchi come un palazzo: l'esplosione scava una conca, il manto si spacca in lastre che si
// sollevano e si inclinano verso la buca, sotto compaiono la massicciata di ghiaia e la terra annerita, attorno corrono crepe
// radiali e ad anello. Pezzi di asfalto volano e ricadono; in città a volte si spezza una conduttura dell'acqua (il cratere
// si allaga) o del gas (una fiamma che esce dalla buca). Auto, persone e detriti cadono davvero dentro; le auto guidate
// dall'IA si fermano prima del cratere.
// Tre modi: 0 = città (fisica propria su groundBase0), 1 = zone Nova/aeroporti, 2 = strade extraurbane (fisica del cratere nel
// terreno, reso permanente). In tutti i casi il pavimento viene bucato nello shader e sotto c'è una conca vera.
const RCN=16;
const RCR={L:[],C:[],sl:[],ch:[],chunks:[],seed:1,mats:null,ov:null,noRd:false,gb0:groundBase0,pipeMat:null,watMat:null,toastT:0,clk:0};
U.uCrt={value:Array.from({length:RCN},()=>new THREE.Vector4(0,-1e5,0,0))};U.uCrtN={value:0};
const CRT_GLSL=`uniform vec4 uCrt[16];uniform float uCrtN;
float crCut(vec2 p,inout vec3 alb){if(uCrtN<.5)return 0.;
 vec2 fp=fwidth(p);float px=max(max(fp.x,fp.y),.002);
 float gr=clamp((alb.g-max(alb.r,alb.b))*5./max(alb.g,.02),0.,1.);
 float cut=0.,dk=1.;
 for(int i=0;i<16;i++){if(float(i)>=uCrtN)break;vec4 c=uCrt[i];vec2 d=p-c.xy;float r=length(d);float ty=step(7.9,c.w),sd=c.w-8.*ty,ext=1.+.3*ty;
  if(r>c.z*3.4)continue;float a=atan(d.y,d.x);
  float rh=c.z*(1.04+.06*sin(a*3.+sd)+.07*sin(a*7.+sd*2.1)+.035*sin(a*13.+sd*3.3));if(r<rh){cut=1.;break;}
  float q=(r-rh)/c.z,cr=0.;
  for(int k=0;k<7;k++){float fk=float(k);float ak=sd*3.1+fk*.8976+.35*sin(sd*7.+fk*2.3);float da=a-ak;da=atan(sin(da),cos(da));
   float L=c.z*ext*(1.6+.95*fract(sin(sd+fk*12.9)*437.5));if(r>L)continue;
   float w=r*da+.22*sin(r*2.3+fk+sd)*q+.05*sin(r*9.+fk*3.)*q;
   float wd=.025+.085*pow(1.-clamp((r-c.z)/(L-c.z),0.,1.),1.5);
   cr=max(cr,(1.-smoothstep(wd*.5,wd+px,abs(w)))*clamp(wd/(px*1.6),0.,1.));}
  float rr=rh*(1.2+.08*ty)+.25*sin(a*5.+sd);cr=max(cr,(1.-smoothstep(.02,.05+px,abs(r-rr)))*.8*clamp(.05/(px*1.6),0.,1.));
  float soot=(1.-smoothstep(rh,c.z*2.2*ext,r))*.3;
  dk*=(1.-cr*.75*(1.-gr))*(1.-soot);}
 alb*=dk;return cut;}
// il terreno sotto le zone e sotto le strade extraurbane non deve spuntare dentro la buca (lì c'è la conca vera)
float crHoleT(vec2 p){if(uCrtN<.5)return 0.;for(int i=0;i<16;i++){if(float(i)>=uCrtN)break;vec4 c=uCrt[i];if(c.w<7.9)continue;vec2 d=p-c.xy;float r=length(d);if(r>c.z*1.3)continue;
  float sd=c.w-8.,a=atan(d.y,d.x);if(r<c.z*(1.04+.06*sin(a*3.+sd)+.07*sin(a*7.+sd*2.1)+.035*sin(a*13.+sd*3.3)))return 1.;}return 0.;}
// la superficie dell'acqua di falda/mare (piano a -1,5 m) non deve comparire sul fondo dei crateri
float crHoleW(vec2 p){if(uCrtN<.5)return 0.;for(int i=0;i<16;i++){if(float(i)>=uCrtN)break;vec4 c=uCrt[i];vec2 d=p-c.xy;if(dot(d,d)<c.z*c.z*1.5)return 1.;}return 0.;}
`;
// ---------- fisica in città: la conca e un orlo basso di asfalto sollevato ----------
function rcCity(x,z){let dh=0;for(const c of RCR.C){const dx=x-c.x,dz=z-c.z;if(dx>c.Rb||dx<-c.Rb||dz>c.Rb||dz<-c.Rb)continue;const r=Math.sqrt(dx*dx+dz*dz);if(r>=c.Rb)continue;
  if(r<c.R){const u=r/c.R;dh=Math.min(dh,-c.d*(1-u*u));}else if(dh>=0){const u=(r-c.R)/(c.Rb-c.R);dh=Math.max(dh,c.rim*Math.sin(Math.PI*u));}}return dh;}
groundBase0=function(x,z){const h=RCR.gb0(x,z);return RCR.C.length?h+rcCity(x,z):h;};
function rcHash(a,b){const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s);}
function rcJit(c,a){return 1+.06*Math.sin(a*3+c.sd)+.07*Math.sin(a*7+c.sd*2.1)+.035*Math.sin(a*13+c.sd*3.3);}
// ---------- che cosa c'è sotto i piedi: 0 asfalto, 1 cemento/lastricato, 2 prato/terra, -1 niente cratere (acqua, parco, interni) ----------
function rcSegD(x,z,e){const dx=e[2]-e[0],dz=e[3]-e[1],L2=dx*dx+dz*dz||1;const t=clamp(((x-e[0])*dx+(z-e[1])*dz)/L2,0,1);return Math.hypot(e[0]+dx*t-x,e[1]+dz*t-z);}
function rcSurfCity(x,z){const ax=Math.abs(x),az=Math.abs(z);
 if(ax<CX&&az<CZ){if(x>-131&&x<131&&z>-582&&z<-90)return -1;return(Math.abs(aveOff(x))<9||Math.abs(stOff(z))<6)?0:1;}
 if(ax>=784&&ax<1200&&az<648){const ox=(ax-792)-100*Math.round((ax-792)/100),oz=z-80*Math.round(z/80);return(Math.abs(ox)<8||Math.abs(oz)<8)?0:1;}
 if(ax<PX-1&&az<PZ-1)return 1;return -1;}
function rcSurfAp(A,x,z){const R=A.rw,T=A.term,ap=A.apron;if(x>T.x0&&x<T.x0+T.w&&z>T.z0&&z<T.z0+T.d)return -1;
 if(x>R.x0-160&&x<R.x1+200&&Math.abs(z-R.z)<R.hw+7.5)return 0;if(x>R.x0+5&&x<R.x1-5&&Math.abs(z-A.twz)<A.twh)return 0;
 for(const e of A.exits)if(rcSegD(x,z,e)<A.twh)return 0;if(x>ap.x0&&x<ap.x1&&z>ap.z0&&z<ap.z1)return 1;
 if(A===AP.CYI){if(Math.abs(z-A.land)<8&&x<T.x0+T.w+70)return 0;if(x>2470&&x<2716&&z>1276&&z<1338)return 0;if(z>A.land+8&&z<T.z0&&x>T.x0-10&&x<T.x0+T.w+10)return 1;}return 2;}
function rcSurfNova(x,z){for(const a of NV.AV)if(z>a.a&&z<a.b&&Math.abs(x-a.x)<a.hw)return 0;for(const s of NV.ST)if(x>s.a&&x<s.b&&Math.abs(z-s.z)<s.hw)return 0;
 const rr=Math.hypot(x-NV.RING.x,z-NV.RING.z),camp=x>1303&&x<1680&&z>323&&z<677;if(camp&&rr<24)return -1;if(camp&&(rr>NV.RING.R+3||rr<NV.RING.R-NV.RING.W-2))return 2;
 const rd=Math.hypot(x-NV.DOME.x,z-NV.DOME.z);if(rd>NV.DOME.R+4&&rd<NV.DOME.R+11.5)return -1;for(const q of NV.parks)if(x>q[0]&&x<q[1]&&z>q[2]&&z<q[3])return 2;return 1;}
function rcSurfZone(x,z){try{const O=OVL;if(x>O[0].x0&&x<O[0].x1&&z>O[0].z0&&z<O[0].z1)return rcSurfNova(x,z);if(typeof AP==='undefined'||!AP.CYI)return 1;
  if(x>O[1].x0&&x<O[1].x1&&z>O[1].z0&&z<O[1].z1)return rcSurfAp(AP.CYI,x,z);if(x>O[2].x0&&x<O[2].x1&&z>O[2].z0&&z<O[2].z1)return rcSurfAp(AP.CYW,x,z);
  if(x>O[3].x0&&x<O[3].x1&&z>O[3].z0&&z<O[3].z1)return Math.abs(x+2440)<7?0:2;}catch(e){}return 1;}
// strade extraurbane: punto della carreggiata (null su ponti alti e in galleria)
function rcRoad(x,z){if(typeof RDG==='undefined'||!RDG)return null;const r=roadQ(x,z);if(!r)return null;const g=RDS[r.i];if(!g||g.tun)return null;const wd=g.full?(g.wd||14.5):4.6;return{d:r.d,y:r.y,wd,g};}
// ---------- materiali e pezzi ----------
const RCK=[{top:[.046,.045,.048],side:[.19,.18,.165],th:[.09,.14]},{top:[.36,.35,.33],side:[.27,.26,.245],th:[.12,.19]},{top:[.05,.075,.028],side:[.14,.1,.07],th:[.12,.2]}];
function rcInit(){if(RCR.mats)return;
 const dull=m=>{m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directSpecular*=.3;reflectedLight.indirectSpecular*=.12;');};m.customProgramCacheKey=()=>'rcdull';return m;};
 RCR.mats=[-3,-4.5].map(o=>dull(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,metalness:0,polygonOffset:true,polygonOffsetFactor:o,polygonOffsetUnits:o})));RCR.dull=dull;
 for(let k=0;k<3;k++){const K=RCK[k],g=new THREE.BoxGeometry(1,1,1,3,1,3),P=g.attributes.position,col=[];
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),e=1+.22*Math.sin(z*7.3+x*2.1+k)+.12*Math.sin(x*11.7-z*3.3);P.setX(i,x*e);P.setZ(i,z*(1+.18*Math.sin(x*8.1+1.3+k)));
   const c=y>0?K.top:K.side,n=.85+.3*rcHash(i,k);col.push(c[0]*n,c[1]*n,c[2]*n);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();const mat=dull(new THREE.MeshStandardMaterial({vertexColors:true,roughness:k===1?.85:.93}));
  const s=new THREE.InstancedMesh(g,mat,150);s.count=0;s.castShadow=true;s.receiveShadow=true;s.frustumCulled=false;s.visible=false;scene.add(s);RCR.sl.push({m:s,free:[],top:0,cap:150});
  const c=new THREE.InstancedMesh(g,mat,90);c.count=0;c.castShadow=true;c.receiveShadow=true;c.frustumCulled=false;c.visible=false;scene.add(c);RCR.ch.push(c);}
 RCR.pipeMat=new THREE.MeshStandardMaterial({color:0x221c17,roughness:.8,metalness:.3,side:THREE.DoubleSide});
 RCR.gasMat=new THREE.MeshStandardMaterial({color:0x2f2f2c,roughness:.6,metalness:.45,side:THREE.DoubleSide});
 RCR.watMat=new THREE.MeshStandardMaterial({color:0x17140f,roughness:.16,metalness:0,envMapIntensity:.55});}
function rcSlab(k){const S=RCR.sl[k];let i;if(S.free.length)i=S.free.pop();else if(S.top<S.cap){i=S.top++;S.m.count=S.top;}else return -1;S.m.visible=true;return i;}
function rcSlabFree(k,i){const S=RCR.sl[k];S.m.setMatrixAt(i,_m0);S.free.push(i);S.m.instanceMatrix.needsUpdate=true;}
const _rcM=new THREE.Matrix4(),_rcR=new THREE.Matrix4(),_rcS=new THREE.Matrix4();
function rcPlace(c,k,x,z,yaw,tilt,sx,sz,th,lift){const i=rcSlab(k);if(i<0)return;const y=rcSurfY(c,x,z);
 _rcM.makeRotationY(yaw).multiply(_rcR.makeRotationX(tilt)).multiply(_rcS.makeScale(sx,th,sz));_rcM.setPosition(x,y+(lift||0)+th*.5*Math.cos(tilt)+Math.abs(Math.sin(tilt))*sz*.5,z);
 RCR.sl[k].m.setMatrixAt(i,_rcM);RCR.sl[k].m.instanceMatrix.needsUpdate=true;c.slabs.push([k,i]);}
// ---------- la superficie (la stessa che usa la fisica) ----------
function rcSurfY(c,x,z){return c.mode===0?groundBase0(x,z):worldGround(x,z);}
function rcSurfAt(c,x,z){if(c.mode===0)return rcSurfCity(x,z);if(c.mode===1)return inZone(x,z,0)?rcSurfZone(x,z):2;const r=rcRoad(x,z);return r&&r.d<4.35?0:2;}
function rcValid(c,x,z){if(c.mode===0)return Math.abs(RCR.gb0(x,z)-c.y0)<1.1&&!bAt(x,z);if(c.mode===1)return true;const r=rcRoad(x,z);return !r||r.y-worldPre(x,z)<4;}
// colori della conca: fondo annerito, pareti di terra e ghiaia, sezione della massicciata, bordo spezzato, detriti e polvere attorno
function rcCol(s,u,h,o,h2){let r,g,b;const pt=.7+.5*h2;
 if(u<.5){const t=u/.5,n=(.7+.6*h)*pt;r=(.045+.05*t)*n;g=(.04+.043*t)*n;b=(.035+.034*t)*n;}
 else if(u<.93){const n=(.8+.4*h)*pt;r=.1*n;g=.086*n;b=.068*n;if(s===2){r*=.9;g*=.82;b*=.72;}}
 else if(u<.995){if(s===2){r=.09;g=.066;b=.045;}else{r=.19+.05*h;g=.178+.045*h;b=.16+.04*h;}}
 else if(u<1.1){if(s===0){r=g=b=.062+.02*h;b+=.003;}else if(s===1){r=.37+.05*h;g=.36+.05*h;b=.34+.04*h;}else{r=.06;g=.08;b=.032;}}
 else{const k=.72+.28*Math.min(1,(u-1.1)/.45);if(s===0){r=g=b=(.05+.018*h)*k;}else if(s===1){r=(.27+.05*h)*k;g=(.26+.05*h)*k;b=(.245+.04*h)*k;}else{r=.085*k;g=.074*k;b=.052*k;}}
 o[0]=r;o[1]=g;o[2]=b;}
const RCU0=[0,.2,.38,.55,.7,.82,.91,.97,1,1.05,1.1,1.2,1.34],RCU1=[0,.2,.38,.55,.7,.82,.91,.97,1,1.05,1.1,1.21,1.34,1.5,1.7];
function rcBowl(c){if(c.mesh){scene.remove(c.mesh);c.mesh.geometry.dispose();c.mesh=null;}
 const U2=c.mode===0?RCU0:RCU1,K=U2.length,SG=48,pos=[],col=[],ok=[],idx=[],cc=[0,0,0];
 for(let k=0;k<K;k++){const u=U2[k];for(let s=0;s<SG;s++){const a=s/SG*TAU,jt=1+(rcJit(c,a)-1)*clamp((1.6-u)/.6,0,1),r=u*c.R*jt,x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r,h=rcHash(s+c.sd*7,k);
   let v=rcValid(c,x,z);if(v)for(const o of RCR.L){if(o===c||o.gone)continue;const dc=Math.hypot(x-c.x,z-c.z)/c.Rb,dO=Math.hypot(x-o.x,z-o.z)/o.Rb;if(dO<1&&dO+.06<dc){v=false;break;}}
   const y0=rcSurfY(c,x,z);let y=y0+.012;if(u<.97){const nz=Math.sin(x*1.3+c.sd)*Math.sin(z*1.5-c.sd)*.65+Math.sin(x*2.9-z*2.3+c.sd*2)*.35;y+=nz*.11*Math.min(1,c.d*.6)*Math.min(1,(1-u)*6);}else if(u>1.1)y+=h*.025;
   const hs=.5+.5*Math.sin(x*.9+z*.7+c.sd)*Math.sin(z*1.1-x*.4+c.sd*1.7);rcCol(rcSurfAt(c,x,z),u,u<.97?hs*.7+h*.3:h,cc,u<.97?hs:rcHash(k*3.1+c.sd,s*1.7));if(u<1){const ao=1-.42*clamp((c.y0-y0)/Math.max(.5,c.d),0,1);cc[0]*=ao;cc[1]*=ao;cc[2]*=ao;}
   pos.push(x,y,z);col.push(cc[0],cc[1],cc[2]);ok.push(v);}}
 for(let k=0;k<K-1;k++)for(let s=0;s<SG;s++){const a=k*SG+s,b=k*SG+(s+1)%SG,c2=a+SG,d=b+SG;if(ok[a]&&ok[c2]&&ok[b])idx.push(a,b,c2);if(ok[b]&&ok[c2]&&ok[d])idx.push(b,d,c2);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
 const m=new THREE.Mesh(g,RCR.mats[c.par]);m.receiveShadow=true;m.castShadow=true;scene.add(m);c.mesh=m;}
// ---------- tubature spezzate sul fondo (acqua: ghisa scura, gas: acciaio giallo) ----------
function rcPipes(c){c.pipes=[];if(c.mode===2||c.d<(c.wm||c.gas?1.5:2.3))return;if(c.mode===1&&c.surf!==0)return;
 // le condotte corrono lungo la strada: sui viali nord-sud, sulle strade est-ovest
 let ax;if(c.mode===0){if(Math.abs(c.x)>=784){const ox=(Math.abs(c.x)-792)-100*Math.round((Math.abs(c.x)-792)/100);ax=Math.abs(ox)<8?1:0;}
   else{const ave=Math.abs(aveOff(c.x))<9,st=Math.abs(stOff(c.z))<6;ax=ave&&!st?1:(st&&!ave?0:(Math.random()<.5?1:0));}}
 else{ax=0;for(const a of NV.AV)if(Math.abs(c.x-a.x)<a.hw&&c.z>a.a&&c.z<a.b)ax=1;}
 const list=[{kind:'w',rad:.3,dep:rand(1.15,1.45)}];if(c.gas||Math.random()<.45)list.push({kind:'g',rad:.12,dep:rand(.8,1.05)});
 for(const P of list){let o=0,okk=false;for(let t=0;t<6;t++){o=rand(-.45,.45)*c.R;if(c.d*(1-(o/c.R)**2)>P.dep+.45){okk=true;break;}}if(!okk)continue;
  // il tubo esce dalla parete dove la conca arriva alla sua profondità, ed è spezzato vicino al centro con i due monconi che pendono
  const up=Math.sqrt(Math.max(0,1-P.dep/c.d)),se=c.R*Math.sqrt(Math.max(0,up*up-(o/c.R)**2));if(se<.9)continue;const gap=Math.max(.4,2*se-2*rand(.35,1.05));
  for(const sg of[-1,1]){const L=se+.7-gap*.5,phi=rand(.03,.15),g=new THREE.CylinderGeometry(P.rad,P.rad,L,10,1,true);g.rotateZ(Math.PI/2);g.translate(-L/2,0,0);
   const m=new THREE.Mesh(g,P.kind==='w'?RCR.pipeMat:RCR.gasMat),wo=sg*(se+.7),y=c.y0-P.dep;
   if(ax){m.position.set(c.x+o,y,c.z+wo);m.rotation.set(0,sg>0?-Math.PI/2:Math.PI/2,phi);}else{m.position.set(c.x+wo,y,c.z+o);m.rotation.set(0,sg>0?0:Math.PI,phi);}
   m.castShadow=true;m.receiveShadow=true;scene.add(m);c.pipes.push(m);
   const ex=sg*(se+.7-L*Math.cos(phi)),ey=y-L*Math.sin(phi),px=ax?c.x+o:c.x+ex,pz=ax?c.z+ex:c.z+o;
   if(P.kind==='w'&&c.wm&&sg>0)Object.assign(c.wm,{x:px,y:ey,z:pz,ax});
   if(P.kind==='g'&&c.gas&&sg<0)Object.assign(c.gas,{x:px,y:ey,z:pz});}}}
// ---------- crateri: creazione, fusione, riciclo ----------
function rcUni(){const V=U.uCrt.value;let n=0;for(const c of RCR.L){V[n++].set(c.x,c.z,c.R,c.sd+(c.mode>0?8:0));}for(let i=n;i<RCN;i++)V[i].set(0,-1e5,0,0);U.uCrtN.value=n;RCR.C=RCR.L.filter(c=>c.mode===0);}
function rcKill(c){c.gone=true;if(c.mesh){scene.remove(c.mesh);c.mesh.geometry.dispose();}for(const p of c.pipes||[]){scene.remove(p);p.geometry.dispose();}if(c.pool){scene.remove(c.pool);c.pool.geometry.dispose();}
 for(const [k,i] of c.slabs)rcSlabFree(k,i);c.slabs.length=0;
 if(c.tcs&&c.tcs.length){for(const t of c.tcs){t.d=0;t.keep=false;const i=CRT.L.indexOf(t);if(i>=0)CRT.L.splice(i,1);for(const a of CRT.G.values()){const j=a.indexOf(t);if(j>=0)a.splice(j,1);}}try{terRefreshArea(c.x,c.z,c.Rb*1.15);}catch(e){}}}
function rcClear(){for(const c of RCR.L)rcKill(c);RCR.L.length=0;rcUni();for(const p of RCR.chunks)p.dead=1;RCR.chunks.length=0;for(const m of RCR.ch){m.count=0;m.visible=false;}}
function rcAdd(pv,tc){rcInit();const near=(o)=>Math.hypot(o.x-pv.x,o.z-pv.z);
 // un'altra esplosione nella stessa buca: la approfondisce e la allarga un po'
 for(const c of RCR.L){if(c.mode!==pv.mode||near(c)>c.R*.6)continue;
  if(c.mode===0){c.d=Math.min(8,Math.max(c.d,pv.d)+Math.min(c.d,pv.d)*.35);c.rim=Math.min(.2,.05*c.d+.05);}else{if(tc)c.tcs.push(tc);c.d+=pv.d*.5;}
  c.R=Math.max(c.R,pv.r);c.Rb=c.R*(c.mode===0?1.34:1.7);rcUni();rcBowl(c);rcDebris(c,.45);rcFly(c,pv.r,.7);rcRebuildNear(c);return c;}
 if(RCR.L.length>=RCN){const cp=camera.position;let far=null,fd=-1;for(const c of RCR.L){const d=Math.hypot(c.x-cp.x,c.z-cp.z);if(d>fd){fd=d;far=c;}}if(far){rcKill(far);RCR.L.splice(RCR.L.indexOf(far),1);}}
 RCR.seed++;const c={x:pv.x,z:pv.z,R:pv.r,d:pv.d,mode:pv.mode,surf:pv.surf,y0:pv.y0,Rb:pv.r*(pv.mode===0?1.34:1.7),rim:Math.min(.2,.05*pv.d+.05),sd:(RCR.seed*1.7317)%6.2,slabs:[],tcs:tc?[tc]:[],t:0,par:RCR.seed&1,pipes:[]};
 if(c.mode===0&&c.d>1.5&&c.surf===0){const r=RCR.force==='wm'?0:RCR.force==='gas'?.45:RCR.force==='none'?1:Math.random();if(r<.38)c.wm={t:0,life:rand(45,80),x:c.x,y:c.y0-c.d*.6,z:c.z,ax:0,fill:0};else if(r<.5)c.gas={t:0,life:rand(30,60),x:c.x,y:c.y0-c.d*.7,z:c.z,lt:0};}
 RCR.L.push(c);rcUni();rcBowl(c);try{rcPipes(c);}catch(e){console.warn('tubature',e);}rcDebris(c,1);rcFly(c,c.R,1);rcRebuildNear(c);
 return c;}
function rcRebuildNear(c){for(const o of RCR.L){if(o===c)continue;if(Math.hypot(o.x-c.x,o.z-c.z)<o.Rb+c.Rb){rcBowl(o);}}}
// lastre sollevate e inclinate attorno al bordo, frammenti sparsi sul piano, pezzi caduti nella buca
function rcDebris(c,f){const R=c.R,sz0=Math.min(1,R/2.6+.3),n=Math.round((5+R*1.9)*f);let a=rand(0,TAU);
 for(let i=0;i<n;i++){a+=TAU/n*rand(.45,1.6);if(Math.random()<.18)continue;const big=Math.random()<.3,tilt=Math.random()<.25?rand(.05,.22):rand(.3,1.05)*(Math.random()<.15?-.5:1),sx=clamp(R*rand(.22,big?.75:.48),.3,2.6)*sz0,szr=clamp(R*rand(.16,big?.5:.34),.25,1.8)*sz0;
  const rc=R*rcJit(c,a)*rand(.97,1.12)+szr*.5*Math.cos(tilt),x=c.x+Math.cos(a)*rc,z=c.z+Math.sin(a)*rc;
  if(!rcValid(c,x,z))continue;const s=rcSurfAt(c,x,z);if(s<0)continue;const K=RCK[s];rcPlace(c,s,x,z,Math.PI/2-a+rand(-.35,.35),tilt,sx,szr,rand(K.th[0],K.th[1]),-.04);}
 const m=Math.round((5+R*2.2)*f);for(let i=0;i<m;i++){const a=rand(0,TAU),r=R*rand(1.25,2.7),x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;const s=rcSurfAt(c,x,z);if(s<0||!rcValid(c,x,z))continue;const K=RCK[s],e=rand(.18,.55)*sz0;
  rcPlace(c,s,x,z,rand(0,TAU),rand(-.12,.12),e*rand(.8,1.4),e,rand(K.th[0],K.th[1])*.8,-.02);}
 const q=Math.round((4+R*1.7)*f);for(let i=0;i<q;i++){const a=rand(0,TAU),r=R*Math.sqrt(Math.random())*.85,x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r,s=Math.max(0,c.surf),K=RCK[s],e=rand(.18,.65)*sz0;
  rcPlace(c,s,x,z,rand(0,TAU),rand(-.6,.6),e*rand(.9,1.5),e,rand(K.th[0],K.th[1]),0);}}
// pezzi che volano e ricadono rimbalzando
function rcFly(c,R,f){const nc=Math.round((10+R*3.5)*f);for(let i=0;i<nc;i++){const a=rand(0,TAU),s=rand(4,11)*Math.min(1.6,R/3.2),k=c.surf<0?0:(c.mode===2?(Math.random()<.6?0:2):c.surf);
  RCR.chunks.push({x:c.x+Math.cos(a)*R*.35,y:c.y0+.3,z:c.z+Math.sin(a)*R*.35,vx:Math.cos(a)*s,vy:rand(5,14)*Math.min(1.5,R/3.2),vz:Math.sin(a)*s,rx:rand(0,6),ry:rand(0,6),wx:rand(-9,9),wy:rand(-9,9),sc:rand(.1,.42),k,t:0,rest:false,hit:0});}
 while(RCR.chunks.length>240)RCR.chunks.shift();}
// ---------- passo: pezzi in volo, acqua, gas, fumo ----------
function rcStep(dt){if(!RCR.mats)return;RCR.toastT-=dt;const C=RCR.chunks,cp=camera.position;let clicks=0;
 for(let i=C.length-1;i>=0;i--){const p=C[i];p.t+=dt;if(p.t>150){C.splice(i,1);continue;}if(p.rest)continue;
  p.vy-=G*dt;p.vx*=1-.04*dt;p.vz*=1-.04*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.rx+=p.wx*dt;p.ry+=p.wy*dt;const g=groundH(p.x,p.z)+p.sc*.12;
  if(p.y<g){p.y=g;if(p.vy<-3&&p.hit<3){p.hit++;p.vy*=-.28;p.vx*=.45;p.vz*=.45;p.wx*=.5;p.wy*=.5;if(clicks<3&&Math.abs(p.x-cp.x)+Math.abs(p.z-cp.z)<45){clicks++;sfx({x:p.x,y:p.y,z:p.z,src:'noise',filter:'bandpass',ff0:2400+p.sc*-2000,ff1:900,g:.05+p.sc*.15,a:.002,d:.07,ref:8});}}
   else{p.rest=true;p.rx=rand(-.25,.25);p.wx=0;}}}
 const N=[0,0,0];for(const p of C){const m=RCR.ch[p.k];if(N[p.k]>=90)continue;_dm.position.set(p.x,p.y,p.z);_dm.rotation.set(p.rx,p.ry,0);_dm.scale.set(p.sc*1.35,p.sc*.32,p.sc);_dm.updateMatrix();m.setMatrixAt(N[p.k]++,_dm.matrix);}
 for(let k=0;k<3;k++){const m=RCR.ch[k];m.count=N[k];m.visible=N[k]>0;if(N[k])m.instanceMatrix.needsUpdate=true;}
 const l=TODC.lit;
 for(const c of RCR.L){c.t+=dt;const dc=Math.abs(c.x-cp.x)+Math.abs(c.z-cp.z);
  // la buca fuma ancora per un po'
  if(c.t<22&&dc<500&&Math.random()<dt*3.2*(1-c.t/22))smoke(c.x+rand(-c.R,c.R)*.4,c.y0-c.d*.4,c.z+rand(-c.R,c.R)*.4,rand(-.4,.4),rand(.8,2.2),rand(-.4,.4),c.R*rand(.35,.6),rand(5,9),Math.random()<.5);
  if(c.wm){const w=c.wm;w.t+=dt;const k=w.t<w.life?(w.t>w.life*.6?1-(w.t-w.life*.6)/(w.life*.4):1):0;
   if(k>0&&dc<450&&psA){const n=Math.min(6,Math.floor(dt*55*k+Math.random()));for(let i=0;i<n;i++){const s=rand(.8,1),side=w.ax?[rand(-1.2,1.2),rand(1.5,4)]:[rand(1.5,4),rand(-1.2,1.2)];
     psA.spawn(w.x+rand(-.15,.15),w.y+.2,w.z+rand(-.15,.15),side[0]*s*(Math.random()<.5?-1:1)*.6,rand(8,14.5)*s*Math.sqrt(k),side[1]*s*(Math.random()<.5?-1:1)*.6,rand(1.1,1.9),.22,1.,.7*l+.05,.77*l+.05,.82*l+.06,.55,.25,9.8,2);}
    if(Math.random()<dt*1.2&&dc<70)sfx({x:w.x,y:w.y+1,z:w.z,src:'noise',filter:'bandpass',ff0:1300,ff1:900,g:.22*k,a:.15,d:1.3,ref:14});}
   w.fill=Math.min(1,w.fill+dt/45*(k>0?1:0));
   if(w.fill>.02){const lvl=c.y0-c.d*(1-.62*w.fill),rr=c.R*Math.sqrt(.62*w.fill+.015)*1.08;if(!c.pool){c.pool=new THREE.Mesh(new THREE.CircleGeometry(1,28).rotateX(-Math.PI/2),RCR.watMat);c.pool.receiveShadow=true;scene.add(c.pool);}
    c.pool.position.set(c.x,lvl,c.z);c.pool.scale.set(rr,1,rr);}}
  if(c.gas){const q=c.gas;q.t+=dt;const k=q.t<q.life?Math.min(1,q.t*2):Math.max(0,1-(q.t-q.life)/4);
   if(k>0&&dc<600){if(psF){const n=Math.min(5,Math.floor(dt*45*k+Math.random()));for(let i=0;i<n;i++)fireP(q.x+rand(-.3,.3),q.y+.2,q.z+rand(-.3,.3),rand(-.7,.7),rand(6,11)*k,rand(-.7,.7),rand(.7,1.5),rand(.45,.9));}
    if(Math.random()<dt*3*k)smoke(q.x+rand(-.5,.5),q.y+5,q.z+rand(-.5,.5),rand(-.5,.5),rand(3,6),rand(-.5,.5),1.8,rand(8,14),true);
    q.lt-=dt;if(q.lt<=0&&dc<220){q.lt=.22;flashLight(q.x,q.y+3,q.z,1,.55,.22,9*k*(.8+.4*Math.random()),26,.32);}
    if(Math.random()<dt*.9&&dc<90)sfx({x:q.x,y:q.y+2,z:q.z,src:'noise',filter:'lowpass',ff0:520,ff1:380,g:.3*k,a:.12,d:1.4,ref:18});
    if(Math.random()<dt*2)for(const b of dynCars)if(!b.dead&&Math.abs(b.px-q.x)<3.5&&Math.abs(b.pz-q.z)<3.5)ignite(b);}}}}
// ---------- dove e come l'esplosione scava ----------
function rcWhere(x,y,z,R){if(R<2.5)return null;const kd=(g)=>1-clamp((y-g)/(R*.8),0,1)*.6,dep=(k)=>Math.min(R*.25,5)*k*clamp((R-2)/4,.35,1),rr=Math.min(R*.45,14);
 if(isCore(x,z)){if(inDesert(x,z))return null;const s=rcSurfCity(x,z);if(s<0||bAt(x,z))return null;const g=RCR.gb0(x,z);if(y>g+R*.8)return null;const k=kd(g);return{mode:0,x,z,r:rr,d:dep(k),surf:s,y0:g};}
 if(!TERR.L.length||inDesert(x,z))return null;const gy=worldGround(x,z);if(y>gy+R*.8)return null;const k=kd(gy);
 if(inZone(x,z,0)){const s=rcSurfZone(x,z);if(s<0||bAt(x,z))return null;return{mode:1,x,z,r:rr,d:dep(k),surf:s,y0:gy};}
 const rd=rcRoad(x,z);if(rd&&rd.d<rd.wd+rr*.9&&Math.abs(rd.y-gy)<(rd.d<rd.wd?8:3)&&rd.y-worldPre(x,z)<3.5)return{mode:2,x,z,r:rr,d:dep(k)*1.15,surf:rd.d<4.35?0:2,y0:gy};
 return null;}
{const ex1=explode;explode=function(x,y,z,R,P,o){let pv=null;try{if(!(o&&o.src&&(o.src.kind===2||o.src.heli)))pv=rcWhere(x,y,z,R);}catch(e){pv=null;}
 if(pv&&pv.mode>0){RCR.ov={r:pv.r,d:pv.d,tc:null};RCR.noRd=pv.mode===2;}
 try{ex1(x,y,z,R,P,o);}finally{const ov=RCR.ov;RCR.ov=null;RCR.noRd=false;
  if(pv)try{if(pv.mode===0)rcAdd(pv,null);else if(ov&&ov.tc)rcAdd(pv,ov.tc);
   if(pv.mode===0&&psA){const l=TODC.lit;for(let i=0;i<Math.min(60,pv.r*9);i++){const a=rand(0,TAU),s=rand(.3,1)*pv.r*2.2;psA.spawn(x+Math.cos(a)*pv.r*.3,pv.y0+.4,z+Math.sin(a)*pv.r*.3,Math.cos(a)*s,rand(4,13),Math.sin(a)*s,rand(1.4,2.8),pv.r*.12,pv.r*.3,.3*l,.28*l,.25*l,1,.25,9.8,3);}}
  }catch(e){console.warn('cratere asfalto',e);}}};}
// nelle zone e sulle strade extraurbane la buca nel terreno ha le misure dell'asfalto e non si richiude da sola
{const tc1=terrainCrater;terrainCrater=function(x,z,R,dep){const o=RCR.ov;if(o){R=o.r;dep=o.d;}tc1(x,z,R,dep);if(o){const c=CRT.L[CRT.L.length-1];if(c&&c.x===x&&c.z===z){c.keep=true;c.rk=.06;o.tc=c;terRefreshArea(x,z,R*1.8);}}};}
tmodQ=function(x,z,out){let dh=0,ds=0;if(CRT.L.length){const a=CRT.G.get(Math.floor(x/64)*100003+Math.floor(z/64));if(a)for(const c of a){const dd=Math.hypot(x-c.x,z-c.z)/c.R;if(dd<1.7){if(dd<1)dh-=c.d*(1-dd*dd);else dh+=c.d*(c.rk===undefined?.2:c.rk)*Math.sin((dd-1)/.7*Math.PI);ds=Math.max(ds,(1-sst(.8,1.55,dd))*Math.min(1,.4+c.d0*.25));}}}if(out)out.ds=ds;return dh;};
craterStep=function(dt){CRT.rt-=dt;let any=false;for(const c of CRT.L){if(c.keep)continue;if(c.d>.05){c.d-=c.d*dt/120;any=true;}}
 if(any&&CRT.rt<=0){CRT.rt=2;const cp=camera.position;for(const c of CRT.L)if(!c.keep&&c.d>.05&&Math.hypot(c.x-cp.x,c.z-cp.z)<900)terRefreshArea(c.x,c.z,c.R*1.8);}};
// la carreggiata extraurbana non si piega più a gradoni di 10 m: viene bucata e sotto c'è la conca vera (resta la bruciatura)
{const rc0=rdCrater;rdCrater=function(x,z,r){if(!RCR.noRd)return rc0(x,z,r);for(const ch of RDCOR.chunks){const B=ch.box;if(x+r<B.min.x||x-r>B.max.x||z+r<B.min.z||z-r>B.max.z)continue;const P=ch.g.attributes.position,D=ch.g.attributes.aDst;let any=false;
  for(let i=0;i<P.count;i++){const px=P.getX(i),pz=P.getZ(i);if(Math.abs(px-x)>r||Math.abs(pz-z)>r)continue;D.setX(i,tmodDst(px,pz));any=true;}if(any)D.needsUpdate=true;}};}
// le auto dell'IA si fermano prima della buca (e non ci si buttano dentro)
{const tl3=trLat;trLat=function(b,A,fx,fz,rx,rz,sp,dt){const r=tl3(b,A,fx,fz,rx,rz,sp,dt);if(RCR.L.length){let cap=1e9;
  for(const c of RCR.L){const qx=c.x-b.px,qz=c.z-b.pz;if(qx>80||qx<-80||qz>80||qz<-80)continue;const fw=qx*fx+qz*fz,lt=qx*rx+qz*rz,need=c.Rb+1.2;if(fw<0||fw>70||Math.abs(lt)>need)continue;
   const edge=fw-Math.sqrt(Math.max(0,need*need-lt*lt));cap=Math.min(cap,Math.max(0,(edge-(b.hz||2.2)-1.5)*.65));}
  if(cap<1e9)A.vcap=A.vcap===undefined?cap:Math.min(A.vcap,cap);}return r;};}
{const vv2=vehicleVisuals;vehicleVisuals=function(dt){vv2(dt);try{rcStep(dt);}catch(e){if(!RCR.err){RCR.err=1;console.warn('crateri',e);}}};}
{const rs0=resetCity;resetCity=function(){rs0();try{rcClear();}catch(e){console.warn('crateri reset',e);}};}
{const cd0=clearDebris;clearDebris=function(){cd0();RCR.chunks.length=0;for(const m of RCR.ch){m.count=0;m.visible=false;}};}
{const ob=waterMat.onBeforeCompile;waterMat.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.uCrt=U.uCrt;sh.uniforms.uCrtN=U.uCrtN;
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CRT_GLSL).replace('if(abs(vWP.x)<589.&&abs(vWP.z)<697.)discard;','if(abs(vWP.x)<589.&&abs(vWP.z)<697.)discard;if(crHoleW(vWP.xz)>.5)discard;');};}
