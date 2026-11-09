/* ======================= PATCH Y — DISTRETTO NOVA, AEROPORTI, AEREI DI LINEA ======================= */
/* ---------- zone spianate: il terreno viene tagliato (colline) o riempito (mare) fino a quota 0,15 ---------- */
const ZF=[{x0:1250,x1:2290,z0:260,z1:1500},{x0:2440,x1:5100,z0:1270,z1:1980},{x0:-4320,x1:-2180,z0:1800,z1:2140},{x0:-2520,x1:-2360,z0:1560,z1:1820}];
// pavimentazioni disegnate sopra il terreno (il terreno sotto viene abbassato per non sfarfallare)
const OVL=[{x0:1272,x1:2068,z0:296,z1:1500},{x0:2440,x1:5100,z0:1270,z1:1980},{x0:-4320,x1:-2180,z0:1800,z1:2140},{x0:-2520,x1:-2360,z0:1560,z1:1820}];
function zoneD(x,z,Z){return Math.hypot(Math.max(Z.x0-x,0,x-Z.x1),Math.max(Z.z0-z,0,z-Z.z1));}
function zoneNear(x,z){let d=1e9;for(const Z of ZF){const q=zoneD(x,z,Z);if(q<d)d=q;}return d;}
function zoneFlat(x,z,h){for(const Z of ZF){if(x<Z.x0-270||x>Z.x1+270||z<Z.z0-270||z>Z.z1+270)continue;const d=zoneD(x,z,Z);
  if(h>.15){if(d<260)h=.15+(h-.15)*sst(0,260,d);}
  // colmata sul mare: il bordo non è più un rettangolo, ma una riva che avanza e rientra
  else{const m=8+17*(1+fbm2(x*.006+3,z*.006-5,3)),B=40+15*(1+fbm2(x*.011-2,z*.011+4,2));if(d<m+B)h=.15+(h-.15)*sst(m,m+B,d);}}return h;}
function zoneSink(x,z){for(const Z of OVL){if(x<Z.x0||x>Z.x1||z<Z.z0||z>Z.z1)continue;const d=Math.min(x-Z.x0,Z.x1-x,z-Z.z0,Z.z1-z);return .7*clamp((d-2)/4,0,1);}return 0;}
function inZone(x,z,m){for(const Z of OVL)if(x>Z.x0-(m||0)&&x<Z.x1+(m||0)&&z>Z.z0-(m||0)&&z<Z.z1+(m||0))return true;return false;}
/* ---------- piste: Cube York International (CYI, 09/27, 2300 m) e Cube York Ovest (CYW, 09/27, 1600 m) ---------- */
const RWY=[{id:'CYI',x0:2600,x1:4900,z:1700,hw:22.5},{id:'CYW',x0:-4050,x1:-2450,z:1990,hw:15}];
function onRunway(x,z,m){for(const R of RWY)if(x>R.x0-60&&x<R.x1+60&&Math.abs(z-R.z)<R.hw+7.5+(m||0))return R;return null;}
/* ---------- strade nuove: ingresso di Nova e strada dell'aeroporto con ponte sul fiume ---------- */
ROADS.push([[1702,81],[1701,190],[1700,298]]);
ROADS.push([[2062,1445],[2140,1440],[2260,1412],[2380,1370],[2445,1350]]);
/* ---------- griglie aggiuntive dei palazzi a voxel (Nova + CYI, CYW) ---------- */
const BG2=[];
function bg2Make(x0,z0,x1,z1){const W=Math.ceil((x1-x0)/4),H=Math.ceil((z1-z0)/4);BG2.push({x0,z0,W,H,a:new Int16Array(W*H)});}
bg2Make(1202,202,5202,2002);bg2Make(-4402,1502,-2102,2202);
bAt=function(x,z){let gx=Math.floor((x+1202)/4),gz=Math.floor((z+1702)/4);if(gx>=0&&gz>=0&&gx<BG_W&&gz<BG_H){const i=bgrid[gx+gz*BG_W];return i?buildings[i-1]:null;}
 for(let k=0;k<BG2.length;k++){const G=BG2[k];gx=Math.floor((x-G.x0)/4);gz=Math.floor((z-G.z0)/4);if(gx>=0&&gz>=0&&gx<G.W&&gz<G.H){const i=G.a[gx+gz*G.W];return i?buildings[i-1]:null;}}return null;};
{const _ab=addBuilding;addBuilding=function(x0,z0,w,d,fl,style,tiers){const b=_ab(x0,z0,w,d,fl,style,tiers);
 for(const G of BG2){const gx0=Math.round((x0-G.x0)/4),gz0=Math.round((z0-G.z0)/4);for(let gz=gz0;gz<gz0+b.nz;gz++)for(let gx=gx0;gx<gx0+b.nx;gx++)if(gx>=0&&gz>=0&&gx<G.W&&gz<G.H)G.a[gx+gz*G.W]=b.id+1;}return b;};}
solidBoxes=function(x0,y0,z0,x1,y1,z1,out){out.length=0;bStamp++;
 const scan=(gxa,gxb,gza,gzb,W,H,A)=>{for(let gx=Math.max(0,gxa);gx<=Math.min(W-1,gxb);gx++)for(let gz=Math.max(0,gza);gz<=Math.min(H-1,gzb);gz++){const id=A[gx+gz*W];if(!id)continue;const b=buildings[id-1];if(b.stamp===bStamp)continue;b.stamp=bStamp;
   if(!b.vox){for(const t of b.tiers)if(t.x1>x0&&t.x0<x1&&t.z1>z0&&t.z0<z1&&t.y1>y0&&t.y0<y1)out.push(t.x0,t.y0,t.z0,t.x1,t.y1,t.z1);}
   else{const C=b.vox.cells,ix0=Math.max(0,Math.floor((x0-b.x0)/4)),ix1=Math.min(b.nx-1,Math.floor((x1-b.x0)/4)),iy0=Math.max(0,Math.floor(y0/4)),iy1=Math.min(b.ny-1,Math.floor(y1/4)),iz0=Math.max(0,Math.floor((z0-b.z0)/4)),iz1=Math.min(b.nz-1,Math.floor((z1-b.z0)/4));
    for(let iy=iy0;iy<=iy1;iy++)for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++)if(C[ix+b.nx*(iz+b.nz*iy)]>=0)out.push(b.x0+ix*4,iy*4,b.z0+iz*4,b.x0+ix*4+4,iy*4+4,b.z0+iz*4+4);}}};
 scan(Math.floor((x0+1202)/4),Math.floor((x1+1202)/4),Math.floor((z0+1702)/4),Math.floor((z1+1702)/4),BG_W,BG_H,bgrid);
 for(const G of BG2)scan(Math.floor((x0-G.x0)/4),Math.floor((x1-G.x0)/4),Math.floor((z0-G.z0)/4),Math.floor((z1-G.z0)/4),G.W,G.H,G.a);return out;};

/* ---------- luci puntiformi: piste, ostacoli, segnaletica luminosa (visibili anche da lontano) ---------- */
const LP={a:[],m:null};
// modi: 0 fissa, 1 lampeggiante rossa (ostacoli), 2 flash bianco, 3 lampi in sequenza (sentiero luminoso), 4 PAPI, 5 solo di notte
function lpAdd(x,y,z,c,s,mode,ph){LP.a.push(x,y,z,c[0],c[1],c[2],s,mode||0,ph||0);}
const LP_V=`attribute vec3 aP;attribute vec3 aC;attribute vec3 aS;uniform float uT;uniform float uN;uniform float uFd;varying vec2 vU;varying vec3 vC;
void main(){vU=position.xy;vec4 mv=viewMatrix*vec4(aP,1.);float d=-mv.z;float md=aS.y,k=1.;vec3 c=aC;
 if(md>.5&&md<1.5)k=step(.45,fract(uT*.8+aS.z));else if(md>1.5&&md<2.5)k=step(fract(uT*.9+aS.z),.07);else if(md>2.5&&md<3.5)k=step(fract(uT*2.-aS.z),.06);
 if(md>3.5&&md<4.5){vec3 dv=cameraPosition-aP;float an=atan(dv.y,length(dv.xz));c=an>aS.z?vec3(3.2,3.,2.8):vec3(3.4,.09,.05);}
 if(md>4.5&&md<5.5)k*=smoothstep(.15,.6,uN);
 float day=mix(.3,1.,smoothstep(.1,.6,uN));float s=aS.x*(1.+d*.0032);mv.xy+=position.xy*s;vC=c*k*day*exp(-d*uFd);if(k<.01||d<.3)mv.z=1e5;gl_Position=projectionMatrix*mv;}`;
const LP_F='varying vec2 vU;varying vec3 vC;void main(){float r=length(vU);float a=exp(-r*r*6.)+.22*exp(-r*r*1.4);if(a<.012)discard;gl_FragColor=vec4(vC*a,1.);}';
function lpBuild(){const n=LP.a.length/9;if(!n)return;const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,1,-1,0,1,1,0,-1,1,0],3));g.setIndex([0,1,2,0,2,3]);
 const P=new Float32Array(n*3),C=new Float32Array(n*3),S=new Float32Array(n*3);for(let i=0;i<n;i++){const o=i*9;for(let k=0;k<3;k++){P[i*3+k]=LP.a[o+k];C[i*3+k]=LP.a[o+3+k];S[i*3+k]=LP.a[o+6+k];}}
 g.setAttribute('aP',new THREE.InstancedBufferAttribute(P,3));g.setAttribute('aC',new THREE.InstancedBufferAttribute(C,3));g.setAttribute('aS',new THREE.InstancedBufferAttribute(S,3));g.instanceCount=n;
 LP.m=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{uT:U.uTime,uN:U.uNight,uFd:{value:.0003}},vertexShader:LP_V,fragmentShader:LP_F,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
 LP.m.frustumCulled=false;LP.m.renderOrder=6;scene.add(LP.m);}

/* ---------- pavimentazioni procedurali (strade, marciapiedi, piazze, piste) ---------- */
const ZG_HEAD=`uniform float uTime;uniform float uNight;uniform vec4 uDmg[24];uniform float uDmgN;uniform float uWetG;varying vec3 vWP;varying vec3 vWN;vec3 gAlb;float gRough;vec3 gEmis;float gMet;float gSpec=1.;
vec3 asph(vec2 p){vec3 a=vec3(.052,.053,.057)*(.74+.34*vn2(p*.35)+.22*vn2(p*11.));return mix(a,a*1.28,step(.7,vn2(p*.07+3.)));}
vec3 conc(vec2 p,float sz){vec2 q=p/sz;vec2 f=fract(q);float j=1.-step(.012,f.x)*step(f.x,.988)*step(.012,f.y)*step(f.y,.988);vec3 c=vec3(.5,.495,.47)*(.86+.12*h21(floor(q))+.1*vn2(p*.9));return mix(c,c*.62,j);}
float gIsG=0.;vec3 grass(vec2 p){gIsG=1.;return mix(vec3(.04,.075,.02),vec3(.075,.105,.03),vn2(p*.3))*(.8+.3*vn2(p*2.7))*(.9+.15*vn2(p*13.));}
float lamps(float t,float lat,float per,float off){float tt=t-off;float dt=tt-per*floor(tt/per+.5);return exp(-(dt*dt+lat*lat)*.028);}
void zgPost(){float sc=0.;for(int i=0;i<24;i++){if(float(i)>=uDmgN)break;vec4 d=uDmg[i];if(d.w>0.){float dd=length(vWP-d.xyz);sc=max(sc,1.-smoothstep(d.w*.1,d.w*.38,dd));}}
 gAlb*=1.-sc*.85;gRough=mix(gRough,1.,sc*.6);gEmis*=1.-sc;
 float pud=smoothstep(.8,.9,vn2(vWP.xz*.045+11.))*uWetG;float wt=max(uWetG*.7,pud);gSpec=mix(.25,1.,clamp(wt*1.3,0.,1.));gAlb=mix(gAlb,gAlb*.5,wt*.7);gRough=mix(gRough,.12,wt*.85);gRough=max(gRough,clamp(length(vWP-cameraPosition)/170.,0.,.55));}
`;
function ovMat(id,body){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uTime:U.uTime,uNight:U.uNight,uDmg:U.uDmg,uDmgN:U.uDmgN,uWetG:U.uWetG,uCrt:U.uCrt,uCrtN:U.uCrtN});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <project_vertex>','#include <project_vertex>\n'+WP_VM);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GLSL_NOISE+ZG_HEAD+body+CRT_GLSL)
   .replace('#include <color_fragment>','#include <color_fragment>\nzg(vWP.xz);zgPost();if(crCut(vWP.xz,gAlb)>.5)discard;diffuseColor.rgb=gAlb;')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=gRough;')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=gMet;')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=gEmis;')
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directSpecular*=gSpec;reflectedLight.indirectSpecular=min(reflectedLight.indirectSpecular*gSpec,vec3(.05+.5*(gSpec-.25)));');};
 m.customProgramCacheKey=()=>'zg-'+id;return m;}
function ovMesh(Z,mat){const w=Z.x1-Z.x0,d=Z.z1-Z.z0,g=new THREE.PlaneGeometry(w,d,Math.max(1,Math.round(w/200)),Math.max(1,Math.round(d/200))).rotateX(-Math.PI/2);const m=new THREE.Mesh(g,mat);m.position.set((Z.x0+Z.x1)/2,.15,(Z.z0+Z.z1)/2);m.receiveShadow=true;scene.add(m);return m;}

/* ---------- pianta del Distretto Nova ---------- */
// viali nord-sud e strade est-ovest: centro, semilarghezza della carreggiata, estensione
const NV={AV:[{x:1290,hw:8,a:298,b:1452},{x:1495,hw:8,a:682,b:1452},{x:1700,hw:15,a:298,b:1268},{x:1905,hw:8,a:298,b:1452},{x:2050,hw:7,a:298,b:1452}],
 ST:[{z:310,hw:8,a:1278,b:2062},{z:500,hw:8,a:1685,b:2062},{z:690,hw:8,a:1278,b:2062},{z:880,hw:10,a:1278,b:2062},{z:1070,hw:8,a:1278,b:2062},{z:1260,hw:8,a:1278,b:2062},{z:1445,hw:7,a:1278,b:2062}],
 COLS:[[1303,1482],[1508,1680],[1720,1892],[1918,2038]],ROWS:[[323,487],[513,677],[703,865],[895,1057],[1083,1247],[1273,1433]],
 RING:{x:1491,z:500,R:118,W:36},DOME:{x:1700,z:1353,R:65,H:40},PLAZA:{x0:1508,x1:1892,z0:1273,z1:1433},parks:[]};
function nvGLSL(){let s='#define AVQ(X,HW,A,B) if(p.y>A&&p.y<B){float d=abs(p.x-X);if(d-HW<dA-hA){dA=d;hA=HW;xA=X;}}\n#define STQ(Z,HW,A,B) if(p.x>A&&p.x<B){float d=abs(p.y-Z);if(d-HW<dS-hS){dS=d;hS=HW;zS=Z;}}\n';
 const f=v=>v<0?'('+(+v).toFixed(1)+')':(+v).toFixed(1);
 s+='bool inPark(vec2 p){'+NV.parks.map(q=>'if(p.x>'+f(q[0])+'&&p.x<'+f(q[1])+'&&p.y>'+f(q[2])+'&&p.y<'+f(q[3])+')return true;').join('')+'return false;}\n';
 s+='void zg(vec2 p){gEmis=vec3(0.);gMet=0.;float dA=1e4,hA=0.,xA=0.,dS=1e4,hS=0.,zS=0.;\n';
 for(const a of NV.AV)s+='AVQ('+f(a.x)+','+f(a.hw)+','+f(a.a)+','+f(a.b)+')';for(const t of NV.ST)s+='STQ('+f(t.z)+','+f(t.hw)+','+f(t.a)+','+f(t.b)+')';
 s+=`
 float rA=dA-hA,rS=dS-hS;float n2=vn2(p*2.7),n3=vn2(p*11.);
 bool med=abs(xA-1700.)<1.&&dA<3.&&rS>0.;
 bool road=(rA<0.||rS<0.)&&!med;bool walk=!road&&!med&&(rA<5.||rS<5.);
 float night=smoothstep(.15,.6,uNight);
 if(road){vec3 a=asph(p);float mk=0.;vec3 mc=vec3(.74,.73,.68);float ylw=0.;
  if(rA<0.&&rS>=0.){float dx=dA;
   if(hA>12.){mk=max(mk,(1.-step(.08,abs(dx-6.5)))*step(fract(p.y/9.),.45));mk=max(mk,1.-step(.08,abs(dx-10.2)));
    if(dx>10.5&&dx<12.5){a=mix(a,vec3(.075,.14,.09)*(.8+.3*n2)*(.8+.25*n3),.8);}}
   else{ylw=max(1.-step(.07,abs(dx-.17)),0.);mk=max(mk,1.-step(.08,abs(dx-5.6)));}
   if(rS<4.6)mk=max(mk,step(.5,fract((p.x-xA)/1.)));else if(rS<5.1)mk=1.;}
  if(rS<0.&&rA>=0.){float dz=dS;
   if(hS>9.){ylw=max(1.-step(.07,abs(dz-.17)),0.);mk=max(mk,(1.-step(.08,abs(dz-4.)))*step(fract(p.x/9.),.45));mk=max(mk,1.-step(.08,abs(dz-7.6)));}
   else{ylw=max(1.-step(.07,abs(dz-.17)),0.);mk=max(mk,1.-step(.08,abs(dz-5.6)));}
   if(rA<4.6)mk=max(mk,step(.5,fract((p.y-zS)/1.)));else if(rA<5.1)mk=1.;}
  float wear=.55+.45*step(.3,n3);mk*=wear;ylw*=wear;
  a=mix(a,mc*(.75+.25*n2),mk);a=mix(a,vec3(.75,.58,.16)*(.8+.2*n2),ylw);
  gAlb=a;gRough=mix(.86+.08*n3,.6,max(mk,ylw));
  gEmis+=a*vec3(1.,.93,.82)*night*1.6*max(lamps(p.y,dA-(hA-.85),30.,15.)*step(0.,rS),lamps(p.x,dS-(hS-.85),30.,15.)*step(0.,rA));
  vec2 mh=(fract(p/vec2(41.,33.))-.5)*vec2(41.,33.);float mr=length(mh);if(mr<.42){gAlb=vec3(.045)*(.8+.4*step(.5,fract(mr*12.)));gRough=.45;}
 }else if(walk){float r=min(rA<5.?rA:9.,rS<5.?rS:9.);bool alongZ=rA<rS;float t=alongZ?p.y:p.x;
  vec2 q=alongZ?vec2(p.x,p.y):vec2(p.y,p.x);vec2 tq=q/vec2(.6,1.2);vec2 tf=fract(tq);float jt=1.-step(.03,tf.x)*step(tf.x,.97)*step(.02,tf.y)*step(tf.y,.98);
  vec3 sw=vec3(.35,.345,.33)*(.86+.18*h21(floor(tq)))*(.88+.2*n2);sw=mix(sw,sw*.6,jt);
  float curb=1.-step(.35,r);sw=mix(sw,vec3(.46,.45,.43)*(.85+.25*n3),curb);
  float pit=step(1.,r)*step(r,2.6)*step(abs(t-7.5-15.*floor((t-7.5)/15.+.5)),.8);sw=mix(sw,vec3(.08,.065,.05)*(.8+.4*n3)*(1.-.5*step(.5,fract(t*4.))),pit);
  float tac=((rS>.5&&rS<4.2&&rA>0.&&rA<.9)||(rA>.5&&rA<4.2&&rS>0.&&rS<.9))?1.:0.;sw=mix(sw,vec3(.62,.5,.12)*(.8+.3*step(.5,fract(t*5.))),tac*.85);
  gAlb=sw;gRough=.84-.06*vn2(p*.06+5.);
  gEmis+=sw*vec3(1.,.93,.82)*night*1.4*max(lamps(p.y,dA-(hA-.85),30.,15.),lamps(p.x,dS-(hS-.85),30.,15.));
 }else if(med){gAlb=grass(p);gRough=.95;float e=step(2.6,dA);gAlb=mix(gAlb,vec3(.5,.49,.46)*(.85+.2*n3),e);
 }else{
  vec2 dr=p-vec2(${f(NV.RING.x)},${f(NV.RING.z)});float rr=length(dr);
  vec2 dd=p-vec2(${f(NV.DOME.x)},${f(NV.DOME.z)});float rd=length(dd);
  bool camp=p.x>1303.&&p.x<1680.&&p.y>323.&&p.y<677.;
  bool plaza=p.x>${f(NV.PLAZA.x0)}&&p.x<${f(NV.PLAZA.x1)}&&p.y>${f(NV.PLAZA.z0)}&&p.y<${f(NV.PLAZA.z1)};
  if(p.y>1452.){vec2 q=p/vec2(1.2,.6);q.x+=floor(q.y)*.5;vec2 tf=fract(q);float jt=1.-step(.02,tf.x)*step(tf.x,.98)*step(.04,tf.y)*step(tf.y,.96);vec3 st=vec3(.42,.4,.37)*(.86+.16*h21(floor(q)))*(.9+.14*n2);gAlb=mix(st,st*.68,jt);gRough=.75;
   if(abs(p.y-1484.)<2.2){vec2 b=vec2(p.x/2.4+floor(p.y/.16)*.37,p.y/.16);float pl=step(.1,fract(b.y));vec3 wd=vec3(.33,.22,.13)*(.75+.35*h21(floor(b)))*(.85+.2*vn2(vec2(p.x*.4,p.y*8.)));gAlb=mix(wd*.45,wd,pl);gRough=.7;}
   if(p.y>1496.5){gAlb=vec3(.46,.45,.43)*(.85+.2*n3);}
   gEmis+=vec3(.15,.75,1.)*night*2.5*(1.-step(.12,abs(p.y-1496.2)))*step(.3,fract(p.x/3.));
   gEmis+=gAlb*vec3(1.,.9,.75)*night*1.2*lamps(p.x,p.y-1490.,24.,6.);}
  else if(camp&&rr<${f(NV.RING.R-NV.RING.W-2)}){
   float pth=max(1.-step(1.6,abs(rr-56.)),(1.-step(1.4,abs(dr.x)))+(1.-step(1.4,abs(dr.y))));
   if(rr<22.){float rip=.5+.5*sin(rr*2.2-uTime*1.4);gAlb=vec3(.02,.05,.06)*(.9+.1*rip);gRough=.06;gMet=.0;gEmis+=vec3(.1,.5,.7)*night*.5*(1.-step(.3,abs(rr-21.5)));}
   else if(rr<24.){gAlb=vec3(.55,.54,.5)*(.85+.2*n3);gRough=.7;}
   else{gAlb=mix(grass(p),vec3(.45,.43,.38)*(.85+.2*n3),clamp(pth,0.,1.));gRough=.93;gEmis+=vec3(1.,.9,.7)*night*.5*clamp(pth,0.,1.)*lamps(atan(dr.y,dr.x)*56.,rr-56.,18.,0.);}}
  else if(camp&&rr>${f(NV.RING.R+3)}){gAlb=grass(p);gRough=.94;float pth=1.-step(1.5,abs(rr-136.));gAlb=mix(gAlb,vec3(.45,.43,.38)*(.85+.2*n3),pth);}
  else if(plaza){float rg=fract(rd/3.2),an=atan(dd.y,dd.x);vec2 q=vec2(rd/3.2,an*rd/2.4);float jt=1.-step(.02,fract(q.x))*step(fract(q.x),.98)*step(.02,fract(q.y))*step(fract(q.y),.98);
   vec3 st=mix(vec3(.42,.4,.37),vec3(.36,.35,.34),step(.5,fract(floor(q.x)*.5)))*(.88+.15*h21(floor(q)))*(.9+.15*n2);gAlb=mix(st,st*.7,jt);gRough=.72;
   if(rd>${f(NV.DOME.R+5)}&&rd<${f(NV.DOME.R+11)}){float rip=.5+.5*sin(rd*3.-uTime*1.7+an*4.);gAlb=vec3(.015,.035,.045)*(.9+.1*rip);gRough=.05;}
   gEmis+=vec3(.2,.8,1.)*night*2.*(1.-step(.18,abs(rd-${f(NV.DOME.R+12)})))*step(.5,fract(an*20.));
   gEmis+=gAlb*vec3(1.,.92,.8)*night*.9*lamps(an*${f(NV.DOME.R+30)},rd-${f(NV.DOME.R+30)},26.,0.);}
  else if(inPark(p)){gAlb=grass(p);gRough=.95;}
  else{vec2 q=p/vec2(2.4,1.2);q.x+=floor(q.y)*.5;vec2 tf=fract(q);float jt=1.-step(.015,tf.x)*step(tf.x,.985)*step(.03,tf.y)*step(tf.y,.97);
   vec3 st=mix(vec3(.4,.38,.355),vec3(.33,.33,.34),step(.62,h21(floor(q*.25))))*(.86+.14*h21(floor(q)))*(.9+.14*n2);gAlb=mix(st,st*.68,jt);gRough=.78;}
 }}
`;return s;}
/* ---------- scogliere artificiali lungo i bordi sul mare (massi, coronamento in cemento) ---------- */
const ROCKM={m:null,c:null};
function seawall(x0,z0,x1,z1,nx,nz,cap){if(!ROCKM.m){ROCKM.m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.93,metalness:0,flatShading:true});ROCKM.c=MS(0xa29f98,.88,0);}
 const L=Math.hypot(x1-x0,z1-z0),n=Math.max(2,Math.round(L/2.3)),m=7,dx=(x1-x0)/L,dz=(z1-z0)/L,pos=[],col=[],idx=[],sg=dz*nx-dx*nz;
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){const t=i/n*L,u=j/m,h=hash2(i*1.7+x0*.01,j*3.1),h2=hash2(i*.37+5,j*.91+z0*.01),in_=j>0&&j<m?1:0;
  const w=.6+u*11+in_*(h-.5)*1.2,sl=in_*(h2-.5)*1.3;let y=.05-u*u*2.2-u*4.4+in_*(h2-.5)*.9;
  pos.push(x0+dx*(t+sl)+nx*w,y,z0+dz*(t+sl)+nz*w);const c=(.26+.16*h)*(y<-1.35?.5:1);col.push(c,c*.96,c*.9);}
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;if(sg<0)idx.push(a,b,a+1,b,b+1,a+1);else idx.push(a,a+1,b,b,a+1,b+1);}
 let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g=g.toNonIndexed();g.computeVertexNormals();
 const mm=new THREE.Mesh(g,ROCKM.m);mm.receiveShadow=true;scene.add(mm);
 if(cap!==0){const c=new THREE.Mesh(new THREE.BoxGeometry(L,.42,.8),ROCKM.c);c.position.set((x0+x1)/2+nx*.3,.2,(z0+z1)/2+nz*.3);c.rotation.y=-Math.atan2(dz,dx);c.receiveShadow=c.castShadow=true;scene.add(c);}}
