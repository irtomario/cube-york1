/* ======================= PATCH AB — ERBA VERA OVUNQUE C'È NATURA ======================= */
// Prima i fili d'erba esistevano solo nel parco centrale. Ora crescono dove il suolo è prato: colline, rive, prati lungo
// le strade (anche nei fossi), prati di Nova e degli aeroporti, parco. Attorno alla telecamera la scheda video disegna
// dall'alto una "mappa del suolo" (quota, quanta erba, quanto è secca, quanto è alta) con le STESSE regole che colorano il
// terreno: niente erba su roccia, ghiaione, neve, sabbia, terra smossa dai crateri, acqua e asfalto, poca nel sottobosco,
// più secca in quota e a chiazze; le pavimentazioni di Nova/aeroporti dicono loro dove hanno il prato; strade, fiumi e laghi
// coprono il terreno sotto. La mappa si ridisegna solo quando ci si sposta (o ogni secondo e mezzo): costa pochissimo.
// Due strati di ciuffi (3 fili curvi per ciuffo vicino, più radi e larghi lontano) che si diradano e si abbassano verso i
// bordi del prato. Ogni filo si piega ad arco senza allungarsi; il vento passa a raffiche e a onde sul prato; si schiaccia
// sotto i piedi, all'onda d'urto delle esplosioni e nel vento del tornado; è traslucido controsole e lucido di taglio.
const GRS={rt:null,cam:null,cx:1e9,cz:1e9,t0:-1e9,dirty:true,near:null,far:null,mT:null,mR:null,mW:null,zm:new Map(),ovl:[],occ:[],nch:-1,cfg:null,qp:null,err:0,uB:{value:0},on:false};
U.tGM={value:null};U.uGM={value:new THREE.Vector4(0,0,1,0)};
function grsCfg(){if(QP===PRESETS.ultra)return{res:256,Rn:16,nN:30000,bN:3,Rf:60,nF:32000};if(QP===PRESETS.alta)return{res:256,Rn:14,nN:20000,bN:3,Rf:46,nF:18000};
 if(QP===PRESETS.media)return{res:192,Rn:13,nN:12000,bN:2,Rf:34,nF:9000};return{res:128,Rn:12,nN:6000,bN:2,Rf:0,nF:0};}
// le pavimentazioni procedurali si ricordano il loro codice, per farne la versione "maschera"
{const o0=ovMat;ovMat=function(id,body){const m=o0(id,body);m.userData.zgBody=body;m.userData.zgId=id;return m;};}
// ---------- materiali della mappa del suolo ----------
const GRS_PARK=`float parkPath(vec2 p){float d=abs(p.y-(-210.+sin(p.x*.025)*38.));d=min(d,abs(p.y-(-520.+sin(p.x*.03)*25.)));d=min(d,abs(length(vec2(p.x/1.1,p.y+430.))-84.));d=min(d,abs(p.y-(-130.+cos(p.x*.04)*12.)));d=min(d,abs(p.x-80.+cos(p.y*.05)*8.));d=min(d,abs(p.x+70.+sin(p.y*.04)*10.));return 1.-smoothstep(2.,3.,d);}
float parkHG(vec2 p){float ex=min(p.x+121.,121.-p.x),ez=min(p.y+573.,-99.-p.y);if(ex<0.||ez<0.)return .2;float edge=min(1.,min(ex,ez)/25.);float h=max(.2,.2+edge*(2.2*sin(p.x*.021+1.3)*sin(p.y*.017+.4)+1.4*sin(p.x*.043-p.y*.031+2.1)+1.6)*.8);float ld=length(vec2(p.x/58.,(p.y+430.)/74.));if(ld<1.25)h=mix(h,-4.2,clamp((1.25-ld)/.35,0.,1.));return h;}
bool inCoreG(vec2 p){return (p.x>-780.&&p.x<780.&&p.y>-905.&&p.y<880.)||(p.x>780.&&p.x<1200.&&abs(p.y)<648.)||(p.x>-1200.&&p.x<-780.&&abs(p.y)<648.)||(abs(p.x)<1300.&&p.y>-2300.&&p.y<=-905.);}
`;
const GRS_TV=`attribute float aDst;varying vec3 vTW;varying vec3 vTN;varying float vDst;
#ifdef ROAD
attribute vec4 aRd;varying vec4 vRd;
#endif
void main(){vec4 wp=modelMatrix*vec4(position,1.);vTW=wp.xyz;vTN=normalize(mat3(modelMatrix)*normal);vDst=aDst;
#ifdef ROAD
vRd=aRd;wp.y+=1.5;
#endif
gl_Position=projectionMatrix*viewMatrix*wp;}`;
function grsTerMat(road){
 const f='uniform float uBase;\n#ifdef ROAD\nvarying vec4 vRd;\n#endif\n'+TER_F+CRT_GLSL+GRS_PARK+`
void main(){vec2 p=vTW.xz;float h=vTW.y,d=0.,dry=.1,hs=.6;
 if(p.x>-121.&&p.x<121.&&p.y>-573.&&p.y<-99.){h=parkHG(p);d=mix(step(.32,h),smoothstep(-1.32,-1.08,h),step(length(vec2(p.x/58.,(p.y+430.)/74.)),1.3))*(1.-parkPath(p));hs=.42;dry=.05;}
 else if(!inCoreG(p)){if(crHoleT(p)>.5)discard;terrainShade();d=tGrass;dry=tDry;hs=.5+.55*tLush;
#ifdef ROAD
  float o=abs(vRd.x);d*=smoothstep(5.5,6.6,o)*step(-.5,vRd.z);if(vRd.z>.05){hs*=1.35;dry*=.6;}
#endif
 }
 gl_FragColor=vec4(h-uBase,clamp(d,0.,1.),dry,hs);}`;
 return new THREE.ShaderMaterial({defines:road?{ROAD:1}:{},uniforms:{uBase:GRS.uB,tFor:U.tFor,tRiv:U.tRiv,uHole:{value:new THREE.Vector4(0,0,0,0)},uCrt:U.uCrt,uCrtN:U.uCrtN},
  vertexShader:GRS_TV,fragmentShader:f,side:THREE.DoubleSide,extensions:{derivatives:true}});}
function grsZoneMat(body){return new THREE.ShaderMaterial({uniforms:{uBase:GRS.uB,uTime:U.uTime,uNight:U.uNight,uDmg:U.uDmg,uDmgN:U.uDmgN,uWetG:U.uWetG,uCrt:U.uCrt,uCrtN:U.uCrtN},
 vertexShader:'varying vec3 vWP;varying vec3 vWN;void main(){vec4 wp=modelMatrix*vec4(position,1.);vWP=wp.xyz;vWN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*wp;}',
 // dove la pavimentazione ha disegnato il prato (e il colore finale è ancora verde: non sui vialetti né sulle bruciature) crescono i fili, bassi (prato tagliato)
 fragmentShader:'uniform float uBase;\n'+GLSL_NOISE+ZG_HEAD+body+CRT_GLSL+'\nvoid main(){zg(vWP.xz);zgPost();if(crCut(vWP.xz,gAlb)>.5)discard;float gg=gIsG*smoothstep(.006,.025,gAlb.g-max(gAlb.r,gAlb.b));gl_FragColor=vec4(vWP.y-uBase,gg,.07,.3);}',
 side:THREE.DoubleSide,extensions:{derivatives:true}});}
// acqua, rocce delle scogliere: coprono il terreno (alzate di 30 cm: niente erba sul bagnasciuga)
function grsWatMat(){return new THREE.ShaderMaterial({uniforms:{uBase:GRS.uB},vertexShader:'varying float vY;void main(){vec4 wp=vec4(position,1.);\n#ifdef USE_INSTANCING\nwp=instanceMatrix*wp;\n#endif\nwp=modelMatrix*wp;vY=wp.y;wp.y+=.3;gl_Position=projectionMatrix*viewMatrix*wp;}',
 fragmentShader:'uniform float uBase;varying float vY;void main(){gl_FragColor=vec4(vY-uBase,0.,0.,0.);}',side:THREE.DoubleSide});}
// ---------- disegno della mappa ----------
function grsCollect(){GRS.ovl.length=0;GRS.occ.length=0;
 for(const o of scene.children){if(!o.isMesh||o.isInstancedMesh)continue;const m=o.material;if(!m||Array.isArray(m))continue;
  if(m.userData&&m.userData.zgBody!==undefined)GRS.ovl.push(o);
  else if((typeof RVX!=='undefined'&&(m===RVX.mat||m===RVX.lakeMat))||(typeof ROCKM!=='undefined'&&ROCKM.m&&m===ROCKM.m))GRS.occ.push(o);}
 GRS.nch=scene.children.length;}
const _gb=new THREE.Box3(),_gs=new THREE.Sphere();
function grsHit(o,x0,x1,z0,z1){const g=o.geometry;if(!g)return false;if(!g.boundingSphere)g.computeBoundingSphere();_gs.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
 return _gs.center.x+_gs.radius>x0&&_gs.center.x-_gs.radius<x1&&_gs.center.z+_gs.radius>z0&&_gs.center.z-_gs.radius<z1;}
function grsDraw(o,mat){const m0=o.material,v0=o.visible;o.material=mat;o.visible=true;try{renderer.render(o,GRS.cam);}finally{o.material=m0;o.visible=v0;}}
function grsMask(cx,cz,base){const C=GRS.cfg,S=GRS.S,h=S/2;
 if(!GRS.rt||GRS.rt.width!==C.res){if(GRS.rt)GRS.rt.dispose();GRS.rt=new THREE.WebGLRenderTarget(C.res,C.res,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false,depthBuffer:true,stencilBuffer:false});}
 if(!GRS.cam){GRS.cam=new THREE.OrthographicCamera(-1,1,1,-1,10,9000);GRS.cam.up.set(0,0,-1);GRS.cam.layers.enableAll();}
 const cam=GRS.cam;cam.left=-h;cam.right=h;cam.top=h;cam.bottom=-h;cam.updateProjectionMatrix();cam.position.set(cx,4500,cz);cam.lookAt(cx,0,cz);cam.updateMatrixWorld(true);
 if(!GRS.mT){GRS.mT=grsTerMat(false);GRS.mR=grsTerMat(true);GRS.mW=grsWatMat();}
 if(GRS.nch!==scene.children.length)grsCollect();
 GRS.uB.value=base;
 const keep=renderer.getRenderTarget(),ac=renderer.autoClear,snu=renderer.shadowMap.needsUpdate,cc=renderer.getClearColor(new THREE.Color()),ca=renderer.getClearAlpha();
 try{renderer.autoClear=false;renderer.shadowMap.needsUpdate=false;renderer.setRenderTarget(GRS.rt);renderer.setClearColor(0x000000,0);renderer.clear(true,true,false);
  const x0=cx-h,x1=cx+h,z0=cz-h,z1=cz+h;
  // 1) terreno (il livello più fine, che contiene sempre la finestra)
  const L0=TERR.L[0];if(L0&&L0.m)grsDraw(L0.m,GRS.mT);
  // 2) strade extraurbane: carreggiata senza erba, fossi e scarpate col prato del terreno, alla quota vera della strada
  if(typeof RDCOR!=='undefined')for(const ch of RDCOR.chunks){const B=ch.box;if(!B||B.max.x<x0||B.min.x>x1||B.max.z<z0||B.min.z>z1)continue;grsDraw(ch.m,GRS.mR);}
  // 3) pavimentazioni di Nova, aeroporti, base: il loro prato
  for(const o of GRS.ovl){if(!grsHit(o,x0,x1,z0,z1))continue;const b=o.material.userData;let zm=GRS.zm.get(b.zgId);if(!zm){zm=grsZoneMat(b.zgBody);GRS.zm.set(b.zgId,zm);}grsDraw(o,zm);}
  // 4) fiumi, laghi, scogliere
  for(const o of GRS.occ){if(grsHit(o,x0,x1,z0,z1))grsDraw(o,GRS.mW);}}
 finally{renderer.setRenderTarget(keep);renderer.autoClear=ac;renderer.shadowMap.needsUpdate=snu;renderer.setClearColor(cc,ca);}
 U.tGM.value=GRS.rt.texture;U.uGM.value.set(cx,cz,S,base);GRS.cx=cx;GRS.cz=cz;GRS.t0=performance.now();GRS.dirty=false;}
// la mappa va rifatta quando cambia il terreno vicino (nuova griglia, crateri)
{const ta=terApply;terApply=function(L,buf,cx,cz){ta(L,buf,cx,cz);if(L===TERR.L[0])GRS.dirty=true;};}
// ---------- i fili ----------
const GRS_VH=`uniform sampler2D tGM;uniform vec4 uGM;uniform vec3 uCam;uniform float uTime;uniform vec4 uPush;uniform vec4 uWave;uniform vec4 uVort;uniform vec2 uWind;uniform vec4 uGP;uniform vec2 uGT;
attribute vec2 aOff;attribute vec4 aRnd;varying float vGh;varying float vDry;varying float vVar;varying float vDen;
float gh1(float n){return fract(sin(n)*43758.5453);}`;
const GRS_VN=`vec2 rel=mod(aOff*uGT.x-uCam.xz+uGT.x*.5,uGT.x)-uGT.x*.5;vec2 tc=uCam.xz+rel;
float kb=position.z,t=position.y,sd=position.x;
float r1=gh1(aRnd.x*97.31+kb*17.17),r2=gh1(aRnd.y*61.73+kb*11.31),r3=gh1(aRnd.z*41.17+kb*5.71),r4=gh1(aRnd.w*29.3+kb*3.1);
vec2 sp=(vec2(r1,r2)-.5)*uGP.z;vec2 root=tc+sp;
vec4 M=texture2D(tGM,vec2((root.x-uGM.x)/uGM.z+.5,(uGM.y-root.y)/uGM.z+.5));
float inw=step(abs(root.x-uGM.x),uGM.z*.5-1.)*step(abs(root.y-uGM.y),uGM.z*.5-1.);
float den=M.g*inw,dc=length(root-uCam.xz);
float H=uGP.x*M.a*(.55+.6*r3)*smoothstep(0.,.15,den-aRnd.w*.9)*(1.-smoothstep(uGT.y*.68,uGT.y,dc));
float ang=(r1+r4)*3.14159;vec2 F=vec2(cos(ang),sin(ang));vec3 Wv=vec3(-F.y,0.,F.x);
vec2 lean=(length(sp)>.004?normalize(sp):F)*(.15+.4*r2);
float ws=length(uWind);vec2 wd=uWind/max(ws,1e-4);
float gu=vn2(root*.045-wd*uTime*1.7);float wv=sin(dot(root,wd)*.33-uTime*2.4+vn2(root*.017)*5.);
vec2 bend=uWind*(.3+1.25*gu*gu)+wd*ws*.45*max(wv,0.)+vec2(sin(uTime*6.3+r1*40.+root.x*1.7),cos(uTime*5.7+r2*40.+root.y*1.9))*(.03+.05*ws);
vec2 dp=root-uPush.xz;float dl=length(dp)+.001;bend+=dp/dl*(1.-smoothstep(0.,uPush.w,dl))*2.4*step(uPush.y,1.6);
if(uWave.w>0.){vec2 dw=root-uWave.xy;float rr=length(dw)+.001;bend+=dw/rr*exp(-pow((rr-uWave.z)*.25,2.))*uWave.w;}
if(uVort.z>0.){vec2 dv=root-uVort.xy;float rr=length(dv)+.01;float kk=uVort.z*exp(-rr/uVort.w);bend+=(vec2(-dv.y,dv.x)*1.5-dv)/rr*kk;}
vec2 bb=lean+bend;float bl=length(bb);float th=min(bl,1.5);vec2 bd=bb/max(bl,1e-4);
float aa=th*t,sx,sy;if(th>.02){sx=(1.-cos(aa))/th;sy=sin(aa)/th;}else{sx=.5*th*t*t;sy=t;}
float wdt=uGP.y*(.7+.6*r4)*(1.-pow(t,1.6));
vec3 gP=vec3(root.x,uGM.w+M.r,root.y)+vec3(bd.x*sx,sy,bd.y*sx)*H+Wv*sd*wdt;
if(H<.004)gP=vec3(uCam.x,-9000.,uCam.z);
vec3 Tg=vec3(bd.x*sin(aa),cos(aa),bd.y*sin(aa));vec3 objectNormal=normalize(cross(Wv,Tg)+Wv*sd*.5);
vGh=t;vDry=M.b;vVar=r3;vDen=den;`;
const GRS_FH=`varying float vGh;varying float vDry;varying float vVar;varying float vDen;vec3 gSunC=vec3(0.);`;
const GRS_FC=`{vec3 lR=vec3(.022,.054,.014),lT=vec3(.074,.134,.032),dR=vec3(.11,.09,.042),dT=vec3(.3,.26,.125);
 float tt=pow(vGh,.8);vec3 gc=mix(mix(lR,lT,tt),mix(dR,dT,vGh),clamp(vDry+(vVar-.5)*.22,0.,1.));
 gc*=.78+.44*vVar;gc.r*=.9+.3*fract(vVar*7.31);gc.b*=.85+.3*fract(vVar*3.7);
 gc*=mix(1.,mix(.3,1.,smoothstep(0.,.65,vGh)),.45+.55*vDen);diffuseColor.rgb=gc;}`;
// normale: la faccia del filo girata verso chi guarda, mescolata con la verticale (il prato si illumina come il terreno)
const GRS_FN=`float faceDirection=1.;vec3 nB=normalize(vNormal);nB*=sign(dot(nB,vViewPosition)+1e-4);vec3 upV=normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz);
vec3 normal=normalize(mix(nB,upV,.5));vec3 geometryNormal=normal;`;
// traslucenza: col sole dietro al filo la luce lo attraversa (verde-giallo)
const GRS_FT=`
#if NUM_DIR_LIGHTS > 0
{vec3 Ld=directionalLights[0].direction;vec3 V=normalize(vViewPosition);float bl=pow(clamp(dot(-Ld,V),0.,1.),3.);
 reflectedLight.directDiffuse+=gSunC*diffuseColor.rgb*vec3(1.,1.2,.6)*bl*(.35+.65*vGh)*(1.-.5*vDry);}
#endif`;
function grsLights(){const c=THREE.ShaderChunk.lights_fragment_begin,i=c.indexOf('getDirectionalLightInfo'),k='RE_Direct( directLight, geometry, material, reflectedLight );';if(i<0)return c;const j=c.indexOf(k,i);if(j<0)return c;
 return c.slice(0,j)+'if(UNROLLED_LOOP_INDEX==0)gSunC=directLight.color;\n\t\t'+c.slice(j);}
function grsMat(P){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5,metalness:0,side:THREE.DoubleSide});
 const u={tGM:U.tGM,uGM:U.uGM,uCam:GU.uCam,uTime:U.uTime,uPush:GU.uPush,uWave:GU.uWave,uVort:GU.uVort,uWind:GU.uWind,uGP:{value:P.gp},uGT:{value:P.gt}};m.userData.gu=u;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+GLSL_NOISE+GRS_VH).replace('#include <beginnormal_vertex>',GRS_VN).replace('#include <begin_vertex>','vec3 transformed=gP;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GRS_FH).replace('#include <color_fragment>','#include <color_fragment>\n'+GRS_FC)
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=.42+.3*vDry;').replace('#include <normal_fragment_begin>',GRS_FN)
   .replace('#include <lights_fragment_begin>',grsLights()).replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+GRS_FT);};
 m.customProgramCacheKey=()=>'grs2';return m;}
// ciuffi distribuiti a griglia con scarto casuale (copertura uniforme, niente grumi né buchi)
function grsGeo(n,bN,seg){const pos=[],idx=[];for(let k=0;k<bN;k++){const b0=pos.length/3;for(let i=0;i<seg;i++){const t=i/seg;pos.push(-1,t,k,1,t,k);}pos.push(0,1,k);
  for(let i=0;i<seg;i++){const a=b0+i*2;if(i<seg-1)idx.push(a,a+1,a+2,a+1,a+3,a+2);else idx.push(a,a+1,b0+seg*2);}}
 const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(new Float32Array(pos.length),3));g.setIndex(idx);
 const G=Math.ceil(Math.sqrt(n)),off=new Float32Array(n*2),rn=new Float32Array(n*4),ord=new Uint32Array(G*G);for(let i=0;i<G*G;i++)ord[i]=i;for(let i=G*G-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),t=ord[i];ord[i]=ord[j];ord[j]=t;}
 for(let i=0;i<n;i++){const c=ord[i];off[i*2]=((c%G)+Math.random())/G;off[i*2+1]=(Math.floor(c/G)+Math.random())/G;for(let j=0;j<4;j++)rn[i*4+j]=Math.random();}
 g.setAttribute('aOff',new THREE.InstancedBufferAttribute(off,2));g.setAttribute('aRnd',new THREE.InstancedBufferAttribute(rn,4));g.instanceCount=n;return g;}
function grsBuild(){const C=grsCfg();GRS.cfg=C;GRS.qp=QP;GRS.S=2*(Math.max(C.Rn,C.Rf)+8);GRS.dirty=true;
 for(const k of ['near','far']){const o=GRS[k];if(o){scene.remove(o);o.geometry.dispose();}GRS[k]=null;}
 const mk=(n,bN,seg,gp,gt)=>{const m=new THREE.Mesh(grsGeo(n,bN,seg),grsMat({gp,gt}));m.frustumCulled=false;m.receiveShadow=true;m.layers.set(1);m.visible=false;scene.add(m);return m;};
 GRS.near=mk(C.nN,C.bN,3,new THREE.Vector4(.5,.016,.15,0),new THREE.Vector2(2*C.Rn+2,C.Rn));
 if(C.nF>0)GRS.far=mk(C.nF,3,2,new THREE.Vector4(.56,.034,.3,1),new THREE.Vector2(2*C.Rf+2,C.Rf));
 grassMesh=GRS.near;}
makeGrass=function(){grsBuild();};
// erba attiva solo se attorno c'è natura e la telecamera è abbastanza bassa da vederla
function grsActive(){if(!state||state==='title')return false;const c=camera.position;let gy=0;try{gy=groundH(c.x,c.z);}catch(e){}
 if(c.y-gy>Math.max(GRS.cfg.Rn,GRS.cfg.Rf)*.85+6)return false;const h=GRS.S/2;
 for(const R of CORE)if(c.x-h>R[0]&&c.x+h<R[1]&&c.z-h>R[2]&&c.z+h<R[3])return c.x+h>-121&&c.x-h<121&&c.z+h>-573&&c.z-h<-99;return true;}
function grsStep(){if(!GRS.near)return;if(GRS.qp!==QP)grsBuild();const on=QP&&grsActive();GRS.on=on;
 if(!on){GRS.near.visible=false;if(GRS.far)GRS.far.visible=false;return;}
 const c=camera.position,ts=GRS.S/GRS.cfg.res,cx=Math.round(c.x/ts)*ts,cz=Math.round(c.z/ts)*ts;
 if(GRS.dirty||Math.max(Math.abs(cx-GRS.cx),Math.abs(cz-GRS.cz))>GRS.S*.1||performance.now()-GRS.t0>1500){let gy=0;try{gy=groundH(c.x,c.z);}catch(e){}grsMask(cx,cz,Math.round(gy));}
 GRS.near.visible=true;if(GRS.far)GRS.far.visible=true;}
{const r0=render0;render0=function(){try{grsStep();}catch(e){if(GRS.near)GRS.near.visible=false;if(GRS.far)GRS.far.visible=false;if(!GRS.err){GRS.err=1;console.warn('erba',e);}}r0();};}
{const ph=prefHidden;prefHidden=function(o){return (GRS.far&&o===GRS.far)||ph(o);};}
