/* ======================= PATCH AB — RIFLESSI VERI SULL'ACQUA E RIVA MORBIDA ======================= */
// Riflesso planare calcolato a ogni fotogramma: la scena viene disegnata una seconda volta da una telecamera specchiata
// rispetto al pelo dell'acqua (con il piano di taglio obliquo, così ciò che sta sotto l'acqua non entra nel riflesso),
// a risoluzione ridotta. Mare, canale, fiumi, laghi e allagamenti riflettono palazzi, ponti, montagne, alberi e nuvole
// come sono in quel momento, mossi dalle onde (la normale dell'acqua sposta il punto letto) e pesati con Fresnel.
// Il piano si sceglie dove sta l'acqua più vicina (mare, lago, fiume, allagamento della città).
// Riva: una mappa della profondità (calcolata a pezzi nei primi secondi, prima le coste vicine) colora l'acqua bassa
// con il fondale, fa rompere le onde in schiuma verso la spiaggia e sfuma il bordo dell'acqua invece della linea a zigzag.
const PREF={rt:null,cam:new THREE.PerspectiveCamera(),h:-1.5,fr:0,hid:[],tm:new THREE.Matrix4(),pl:new THREE.Plane(),cp:new THREE.Vector4(),q:new THREE.Vector4(),
 rwp:new THREE.Vector3(),cwp:new THREE.Vector3(),rm:new THREE.Matrix4(),nrm:new THREE.Vector3(0,1,0),view:new THREE.Vector3(),la:new THREE.Vector3(),tg:new THREE.Vector3(),on:false,ms:0};
U.tPRef={value:null};U.uPRefM={value:new THREE.Matrix4()};U.uPRefOn={value:0};U.uPRefH={value:-1.5};
function prefScale(){return QP===PRESETS.bassa?.3:(QP===PRESETS.media?.38:(QP===PRESETS.alta?.5:.6));}
function prefSize(){const s=prefScale(),w=Math.max(64,Math.floor(canvas.width*s)),h=Math.max(48,Math.floor(canvas.height*s));
 if(!PREF.rt){PREF.rt=new THREE.WebGLRenderTarget(w,h,{type:HDR,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true,stencilBuffer:false});PREF.rt.texture.generateMipmaps=false;U.tPRef.value=PREF.rt.texture;}
 else if(PREF.rt.width!==w||PREF.rt.height!==h)PREF.rt.setSize(w,h);}
{const sp0=setupPost;setupPost=function(){sp0();try{prefSize();}catch(e){}};}
// quota del piano: l'acqua più vicina alla telecamera
function prefPlane(){const c=camera.position;let h=waterLevel,bd=1e9,near=false;
 if(Math.abs(c.x)>PX-140||Math.abs(c.z)>PZ-140||c.y>70){bd=Math.max(0,Math.max(Math.abs(c.x)-PX,Math.abs(c.z)-PZ));near=bd<900||c.y>70;}
 if(WS.D&&Math.abs(c.x)<PX+30&&Math.abs(c.z)<PZ+30){let best=1e9,bh=0;for(let k=0;k<40;k++){const a=k*2.399,r=4+k*3.1,x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r,i=wsCell(x,z);if(i<0||WS.riv[i]||WS.D[i]<.05)continue;if(r<best){best=r;bh=WS.T[i]+WS.D[i];}}if(best<bd){bd=best;h=bh;near=true;}}
 for(const L of LAKES){if(L.lv===undefined)continue;const d=Math.max(0,Math.hypot(c.x-L.x,c.z-L.z)-L.r*1.2);if(d<bd&&d<1400){bd=d;h=L.lv;near=true;}}
 if(RVG){const r=riverQ(c.x,c.z);if(r&&r.d<170&&r.d<bd&&r.y>-1.4){bd=r.d;h=r.y;near=true;}}
 PREF.near=near;return h;}
function prefHidden(o){if(o===waterMesh||(WS&&o===WS.mesh)||(TSU&&o===TSU.m)||o===grassMesh||o.isPoints)return true;const m=o.material;if(!m)return false;
 if(m===waterMat||(m.userData&&m.userData.water))return true;if(m.blending===THREE.AdditiveBlending)return true;if(m.transparent&&m.depthWrite===false)return true;return false;}
function prefRender(){U.uPRefOn.value=0;if(QP===PRESETS.bassa&&!S.refl)return;const c=camera.position;
 const h=prefPlane();if(!PREF.near||c.y<h+.3)return;
 // la parte bassa dell'inquadratura guarda verso il basso? (se si guarda il cielo il riflesso non serve)
 const e=camera.matrixWorld.elements,fy=-e[9],uy=e[5],ha=THREE.MathUtils.degToRad(camera.fov*.5);if(fy*Math.cos(ha)-uy*Math.sin(ha)>.05)return;
 PREF.fr++;let every=QP===PRESETS.media?2:(QP===PRESETS.bassa?3:1);if(typeof fps==='number'&&fps>0){if(fps<48)every=Math.max(every,2);if(fps<32)every=Math.max(every,3);}if(PREF.on&&PREF.fr%every!==0&&Math.abs(h-PREF.h)<.01){U.uPRefOn.value=1;return;}
 if(!PREF.rt)prefSize();PREF.h=h;const V=PREF.cam,rp=PREF.rwp.set(c.x,h,c.z),cw=PREF.cwp.setFromMatrixPosition(camera.matrixWorld),n=PREF.nrm;
 PREF.view.subVectors(rp,cw);if(PREF.view.dot(n)>0)return;PREF.view.reflect(n).negate().add(rp);
 PREF.rm.extractRotation(camera.matrixWorld);PREF.la.set(0,0,-1).applyMatrix4(PREF.rm).add(cw);PREF.tg.subVectors(rp,PREF.la).reflect(n).negate().add(rp);
 V.position.copy(PREF.view);V.up.set(0,1,0).applyMatrix4(PREF.rm).reflect(n);V.lookAt(PREF.tg);V.far=camera.far;V.near=camera.near;V.updateMatrixWorld();V.projectionMatrix.copy(camera.projectionMatrix);
 PREF.tm.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(V.projectionMatrix).multiply(V.matrixWorldInverse);
 // piano di taglio obliquo (E. Lengyel): niente di ciò che sta sotto il pelo dell'acqua entra nel riflesso
 PREF.pl.setFromNormalAndCoplanarPoint(n,rp).applyMatrix4(V.matrixWorldInverse);PREF.cp.set(PREF.pl.normal.x,PREF.pl.normal.y,PREF.pl.normal.z,PREF.pl.constant);
 const P=V.projectionMatrix.elements,q=PREF.q;q.x=(Math.sign(PREF.cp.x)+P[8])/P[0];q.y=(Math.sign(PREF.cp.y)+P[9])/P[5];q.z=-1;q.w=(1+P[10])/P[14];PREF.cp.multiplyScalar(2/PREF.cp.dot(q));
 P[2]=PREF.cp.x;P[6]=PREF.cp.y;P[10]=PREF.cp.z+1-.003;P[14]=PREF.cp.w;V.projectionMatrixInverse.copy(V.projectionMatrix).invert();
 const hid=PREF.hid;hid.length=0;for(const o of scene.children)if(o.visible&&prefHidden(o)){o.visible=false;hid.push(o);}
 const keep=renderer.getRenderTarget(),t0=performance.now(),snu=renderer.shadowMap.needsUpdate;renderer.shadowMap.needsUpdate=false;renderer.setRenderTarget(PREF.rt);renderer.clear();try{renderer.render(scene,V);}finally{renderer.setRenderTarget(keep);renderer.shadowMap.needsUpdate=snu;for(const o of hid)o.visible=true;}
 PREF.ms=PREF.ms*.9+(performance.now()-t0)*.1;U.uPRefM.value.copy(PREF.tm);U.uPRefH.value=h;U.uPRefOn.value=1;PREF.on=true;}
{const rp0=renderPost;renderPost=function(){try{prefRender();}catch(e){U.uPRefOn.value=0;if(!PREF.err){PREF.err=1;console.warn('riflesso planare',e);}}rp0();};}
const PREF_GLSL=`uniform sampler2D tPRef;uniform mat4 uPRefM;uniform float uPRefOn;uniform float uPRefH;
vec3 prefSample(vec3 wp,vec3 nW,float dist,out float k){k=0.;if(uPRefOn<.5)return vec3(0.);float dh=abs(wp.y-uPRefH);k=1.-smoothstep(.7,1.8,dh);if(k<=0.)return vec3(0.);
 vec4 rp=uPRefM*vec4(wp.x,uPRefH,wp.z,1.);vec2 ruv=rp.xy/rp.w+nW.xz*(.01+.045*(1.-smoothstep(8.,320.,dist)));
 k*=smoothstep(0.,.025,ruv.x)*smoothstep(1.,.975,ruv.x)*smoothstep(0.,.025,ruv.y)*smoothstep(1.,.975,ruv.y);return texture2D(tPRef,clamp(ruv,.002,.998)).rgb;}`;
const PREF_LIGHT=`{vec3 nW=normalize((vec4(normal,0.)*viewMatrix).xyz);float pk;vec3 prc=prefSample(vWP,nW,length(vWP-cameraPosition),pk);
 if(pk>0.){float ct=clamp(dot(nW,normalize(cameraPosition-vWP)),0.,1.),F=.02+.98*pow(1.-ct,5.);pk*=1.-smoothstep(.12,.5,roughnessFactor);reflectedLight.indirectSpecular=mix(reflectedLight.indirectSpecular,prc*F,pk);}}`;
function prefInject(m,extraUni){const ob=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.tPRef=U.tPRef;sh.uniforms.uPRefM=U.uPRefM;sh.uniforms.uPRefOn=U.uPRefOn;sh.uniforms.uPRefH=U.uPRefH;if(extraUni)extraUni(sh);
  sh.fragmentShader=sh.fragmentShader.replace('void main() {',PREF_GLSL+'\nvoid main() {').replace('#include <aomap_fragment>',PREF_LIGHT+'\n#include <aomap_fragment>');};m.userData.water=true;return m;}
// ---------- mappa della profondità vicino alle coste ----------
const SHORE={N:1024,data:null,tex:null,C:129,c:null,ci:0,fq:null,fi:0,ph:0,upT:0,dirty:false};
U.tShore={value:null};U.uShoreOn={value:0};U.uWLd={value:0};
const shEnc=d=>Math.max(0,Math.min(255,Math.round((d+4)/16*255)));
function shoreInit(){const N=SHORE.N;SHORE.data=new Uint8Array(N*N);SHORE.tex=new THREE.DataTexture(SHORE.data,N,N,GL2?THREE.RedFormat:THREE.LuminanceFormat);SHORE.tex.magFilter=SHORE.tex.minFilter=THREE.LinearFilter;
 SHORE.tex.needsUpdate=true;U.tShore.value=SHORE.tex;SHORE.c=new Float32Array(SHORE.C*SHORE.C);SHORE.ph=1;SHORE.ci=0;}
function shoreDepth(x,z){if(Math.abs(x)<PX&&Math.abs(z)<PZ)return -1.65;return -1.5-groundBase(x,z);}
function shoreStep(budget){if(!SHORE.ph||SHORE.ph>3)return;const N=SHORE.N,C=SHORE.C,cs=12288/(C-1);
 if(SHORE.ph===1){for(let k=0;k<budget&&SHORE.ci<C*C;k++,SHORE.ci++){const i=SHORE.ci%C,j=Math.floor(SHORE.ci/C);SHORE.c[SHORE.ci]=shoreDepth(-6144+i*cs,-6144+j*cs);}
  if(SHORE.ci<C*C)return;
  // classificazione: celle tutte terra o tutte acqua profonda si riempiono interpolando, le altre si calcolano fini
  const D=SHORE.data,f=N/(C-1),q=[],cp=camera.position;
  for(let j=0;j<C-1;j++)for(let i=0;i<C-1;i++){const a=SHORE.c[i+j*C],b=SHORE.c[i+1+j*C],c=SHORE.c[i+(j+1)*C],d=SHORE.c[i+1+(j+1)*C],mn=Math.min(a,b,c,d),mx=Math.max(a,b,c,d);
   for(let v=0;v<f;v++)for(let u=0;u<f;u++){const tu=(u+.5)/f,tv=(v+.5)/f;D[(i*f+u)+(j*f+v)*N]=shEnc(lerp(lerp(a,b,tu),lerp(c,d,tu),tv));}
   if(mx>-7&&mn<13)q.push([i,j,Math.hypot(-6144+(i+.5)*cs-cp.x,-6144+(j+.5)*cs-cp.z)]);}
  q.sort((A,B)=>A[2]-B[2]);SHORE.fq=q;SHORE.fi=0;SHORE.ph=2;SHORE.tex.needsUpdate=true;U.uShoreOn.value=1;return;}
 if(SHORE.ph===2){const D=SHORE.data,f=N/(C-1),tcs=12288/N;let k=0;
  while(k<budget&&SHORE.fi<SHORE.fq.length){const [ci,cj]=SHORE.fq[SHORE.fi++];for(let v=0;v<f;v++)for(let u=0;u<f;u++){const ti=ci*f+u,tj=cj*f+v;D[ti+tj*N]=shEnc(shoreDepth(-6144+(ti+.5)*tcs,-6144+(tj+.5)*tcs));}k+=f*f;SHORE.dirty=true;}
  if(SHORE.fi>=SHORE.fq.length){SHORE.ph=4;SHORE.tex.needsUpdate=true;SHORE.dirty=false;}}}
function shoreFrame(dt){if(!SHORE.ph){if(typeof RDG!=='undefined'&&RDG&&state==='play')shoreInit();return;}
 const b=QP===PRESETS.bassa?120:(QP===PRESETS.media?200:300);shoreStep(b);SHORE.upT-=dt;if(SHORE.dirty&&SHORE.upT<=0){SHORE.upT=1.2;SHORE.dirty=false;SHORE.tex.needsUpdate=true;}U.uWLd.value=waterLevel+1.5;}
{const vv=vehicleVisuals;vehicleVisuals=function(dt){vv(dt);try{shoreFrame(dt);}catch(e){if(!SHORE.err){SHORE.err=1;console.warn('riva',e);}}};}
const SHORE_F=`{float sd=texture2D(tShore,(vWP.xz+6144.)/12288.).r*16.-4.+uWLd;
 if(uShoreOn>.5&&sd<5.){float d0=length(vWP-cameraPosition),sh=1.-smoothstep(.25,4.8,sd);
  vec3 bot=mix(vec3(.12,.105,.075),vec3(.04,.065,.055),smoothstep(.4,3.2,sd));diffuseColor.rgb=mix(diffuseColor.rgb,bot*.5,sh*.72);
  float ph=sd*2.3+uTime*1.25+vn2(vWP.xz*.045)*3.;float br=pow(max(0.,sin(ph)),6.)*(1.-smoothstep(.1,1.7,sd))*smoothstep(-.1,.2,sd);
  float fo=br*(.45+.55*vn2(vWP.xz*.3+uTime*.2))+(1.-smoothstep(0.,.4,sd))*.6*smoothstep(.35,.7,vn2(vWP.xz*.8-uTime*.3));fo=clamp(fo*(1.-smoothstep(150.,600.,d0)),0.,1.);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.74,.72),fo*.85);roughnessFactor=mix(roughnessFactor,.6,fo);
  float a=smoothstep(-.1,.32,sd);if(a<1.){float ign=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(ign>a)discard;}}}`;
{const ob=waterMat.onBeforeCompile;waterMat.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.tShore=U.tShore;sh.uniforms.uShoreOn=U.uShoreOn;sh.uniforms.uWLd=U.uWLd;
  sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform sampler2D tShore;uniform float uShoreOn;uniform float uWLd;\nvoid main() {').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+SHORE_F);};}
prefInject(waterMat);
{const rv1=rvMatF;rvMatF=function(){return prefInject(rv1());};}
{const fm2=floodMatF;floodMatF=function(){return prefInject(fm2());};}
