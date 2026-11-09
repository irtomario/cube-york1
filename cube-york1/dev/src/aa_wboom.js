/* ======================= PATCH AA — ESPLOSIONI IN ACQUA ======================= */
// Sott'acqua il fuoco non c'è: il lampo è soffocato e bluastro, il colpo arriva sordo. La superficie si gonfia in una cupola
// bianca, poi esce la colonna d'acqua (tanto più alta quanto più la carica era vicina alla superficie) con i getti a corona,
// l'acqua ricade con un fragore, alla base rotola un anello di nebbia, sulla superficie si allargano anelli d'onda veri
// (onde di gravità: le più lunghe corrono avanti) e resta una macchia di schiuma che si sfilaccia in un minuto.
// Le esplosioni a pelo d'acqua tengono la palla di fuoco ma sollevano comunque colonna, corona, onde e schiuma.
const WXB={L:[],mute:0,wl:0,clk:0};
U.uWxb={value:Array.from({length:8},()=>new THREE.Vector4(0,-1e5,1e3,0))};U.uWxbN={value:0};
const WXB_GLSL=`uniform vec4 uWxb[8];uniform float uWxbN;vec2 WXG=vec2(0.);
float wxH(vec2 i){return fract(sin(dot(i,vec2(127.1,311.7)))*43758.5453);}
float wxN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wxH(i),wxH(i+vec2(1.,0.)),f.x),mix(wxH(i+vec2(0.,1.)),wxH(i+vec2(1.,1.)),f.x),f.y);}
void wxbWater(vec2 p,inout vec2 g,inout float foam){
 for(int i=0;i<8;i++){if(float(i)>=uWxbN)break;vec4 e=uWxb[i];float t=e.z;if(t<0.||t>95.)continue;vec2 d=p-e.xy;float r=length(d)+.001;float R=e.w;if(r>R*3.+t*9.)continue;
  // pacchetto di onde di gravità: velocità di gruppo ~ 3..8 m/s, lunghezza d'onda coerente (k = g / v^2), si allarga e si smorza
  float v=3.+R*.15,rf=R*.35+t*v,W=R*.45+t*.9,k=9.81/(v*v*1.6);
  float env=exp(-pow((r-rf)/W,2.))*exp(-t/16.)*R*.11/sqrt(1.+r/R);
  g+=d/r*env*k*cos(k*(r-rf));
  // seconda serie più corta e lenta (l'acqua della colonna che ricade)
  float t2=t-1.2-R*.05;if(t2>0.){float v2=1.6+R*.06,rf2=R*.2+t2*v2,W2=R*.3+t2*.6,k2=9.81/(v2*v2*1.4);float e2=exp(-pow((r-rf2)/W2,2.))*exp(-t2/10.)*R*.06/sqrt(1.+r/R);g+=d/r*e2*k2*cos(k2*(r-rf2));}
  // schiuma: la macchia bianca si allarga fino a ~1,7R e si sfilaccia; l'anello del fronte d'onda resta bianco per qualche secondo
  float fr=R*(.55+1.15*(1.-exp(-t/2.5)));float nz=wxN(p*.32+e.xy*.013+t*.04)*.62+wxN(p*1.25-t*.09)*.38;
  float th=.22+.5*clamp(t/70.,0.,1.);float fm=(1.-smoothstep(fr*.6,fr,r))*(1.-smoothstep(28.,85.,t))*smoothstep(th,th+.38,nz+.3*(1.-clamp(t/6.,0.,1.)))*(.5+.5*wxN(p*2.7+vec2(t*.15,-t*.11)))*.85;
  fm=max(fm,exp(-pow((r-rf)/(W*.3),2.))*exp(-t/4.)*.65*smoothstep(.35,.7,nz));
  // l'onda d'urto nel primo istante: un anello chiaro velocissimo
  if(t<.4){float rs=t*300.;fm=max(fm,exp(-pow((r-rs)/(2.+t*25.),2.))*(1.-t/.4)*.6);}
  foam=max(foam,fm);}}
`;
// ---------- iniezione negli shader dell'acqua: mare/laghi (waterMat), fiumi (rvMatF), allagamenti (floodMatF) ----------
const WXB_N0='normal=normalize((viewMatrix*vec4(normalize(vec3(-g.x,1.,-g.y)),0.)).xyz);}';
const WXB_N1='float wfo=0.;wxbWater(p,g,wfo);normal=normalize((viewMatrix*vec4(normalize(vec3(-g.x,1.,-g.y)),0.)).xyz);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.8,.82,.82),wfo*.92);roughnessFactor=mix(roughnessFactor,.6,wfo);}';
function wxbInject(m){const ob=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.uWxb=U.uWxb;sh.uniforms.uWxbN=U.uWxbN;
  sh.fragmentShader=sh.fragmentShader.replace('void main() {',WXB_GLSL+'\nvoid main() {').replace(WXB_N0,WXB_N1);};return m;}
wxbInject(waterMat);
{const ob=waterMat.onBeforeCompile;waterMat.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.uWS=U.uWS;sh.uniforms.tRiv=U.tRiv;sh.fragmentShader='#define WSEA\nuniform float uWS;uniform sampler2D tRiv;\n'+sh.fragmentShader;};}
{const fm0=floodMatF;floodMatF=function(){return wxbInject(fm0());};}
{const rv0=rvMatF;rvMatF=function(){const m=rv0(),ob=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.uWxb=U.uWxb;sh.uniforms.uWxbN=U.uWxbN;
  sh.fragmentShader=sh.fragmentShader.replace('void main() {',WXB_GLSL+'\nvoid main() {')
   .replace('riverShade();diffuseColor.rgb=rvAlb;','riverShade();{float wf=0.;wxbWater(vWP.xz,WXG,wf);rvAlb=mix(rvAlb,vec3(.8,.82,.82),wf*.92);rvRough=mix(rvRough,.6,wf);}diffuseColor.rgb=rvAlb;')
   .replace('vec2 gw=T*rvG.y+N*rvG.x;','vec2 gw=T*rvG.y+N*rvG.x+WXG;');};return m;};}
// ---------- sott'acqua: niente palla di fuoco, lampo soffocato, colpo sordo ----------
{const f0=fireP;fireP=function(x,y,z,vx,vy,vz,s,L){if(WXB.mute>1)return;return f0(x,y,z,vx,vy,vz,s,L);};}
{const s0=sparks;sparks=function(x,y,z,n,sp){if(WXB.mute>1)return;return s0(x,y,z,n,sp);};}
{const fl0=flare;flare=function(x,y,z,s,L,r,g,b){if(WXB.mute>1){fl0(x,WXB.wl+.3,z,s*.35,L*.5,.55,.75,1);return;}return fl0(x,y,z,s,L,r,g,b);};}
{const sm0=smoke;smoke=function(x,y,z,vx,vy,vz,s,L,dk){if(WXB.mute>1){if(Math.random()<.9)return;return sm0(x,Math.max(y,WXB.wl+.6),z,vx*.3,vy,vz*.3,s*.6,L*.5,false);}return sm0(x,y,z,vx,vy,vz,s,L,dk);};}
{const se1=sndExplosion;sndExplosion=function(x,y,z,R){if(WXB.mute>1)return wxbThump(x,WXB.wl,z,R);return se1(x,y,z,R);};}
{const fll=flashLight;flashLight=function(x,y,z,r,g,b,i,d,dur){if(WXB.mute>1)return fll(x,WXB.wl+.6,z,.55,.75,1,i*.3,d*.55,dur*.5);return fll(x,y,z,r,g,b,i,d,dur);};}
function wxbThump(x,y,z,R){if(!AU.ok)return;AU.pri=1;const dl=sDist(x,y,z)/343,big=clamp(R/20,.2,2);
 sfx({x,y,z,delay:dl,src:'osc',type:'sine',f0:46,f1:15,g:.95,a:.01,d:1.3+big,ref:30*big,rev:.35});
 sfx({x,y,z,delay:dl,src:'brown',filter:'lowpass',ff0:420,ff1:70,g:.85,a:.01,d:1.6+big*1.5,ref:28*big,rev:.4,rate:.5});
 sfx({x,y,z,delay:dl,src:'noise',filter:'bandpass',ff0:600,q:.7,g:.2,a:.005,d:.25,ref:15*big});AU.pri=0;}
function wxbRoar(e){if(!AU.ok)return;const big=clamp(e.R/20,.2,2),dl=sDist(e.x,e.wl,e.z)/343;AU.pri=1;
 sfx({x:e.x,y:e.wl+2,z:e.z,delay:dl,src:'noise',filter:'lowpass',ff0:2600,ff1:450,g:.5*Math.min(1.6,big*2.2),a:.3,d:1.4+e.H*.028,ref:25*big,rev:.45,rate:.8});
 for(let i=0;i<5;i++)sfx({x:e.x+rand(-e.R,e.R),y:e.wl,z:e.z+rand(-e.R,e.R),delay:dl+rand(.1,1.2),src:'noise',filter:'bandpass',ff0:rand(500,1600),q:1,g:.16,d:rand(.15,.4),ref:14});AU.pri=0;}
// ---------- dove è esplosa: in aria, a pelo d'acqua o sotto ----------
function wxbWhere(x,y,z,R){const wl=waterAt(x,z);if(!(wl>-1e8))return null;const bed=groundH(x,z);if(wl-bed<.5)return null;
 if(y>wl+R*1.5)return null;let mode,depth=wl-y;if(y>wl+Math.max(.8,R*.55))mode=0;else if(depth<.7)mode=1;else mode=2;
 depth=Math.max(0,Math.min(depth,wl-bed));let H;
 if(mode===0)H=0;else if(mode===1)H=R*1.25;else{const q=depth/R;H=R*2.3*(q<.5?.75+q*1.1:1.3*Math.exp(-(q-.5)/1.1));}
 H=Math.min(140,Math.max(mode?3:0,H*Math.min(1,(wl-bed)/(R*.35)+.25)));return{x,z,wl,R,mode,depth,H,bed};}
{const ex2=explode;explode=function(x,y,z,R,P,o){let w=null;try{w=wxbWhere(x,y,z,R);}catch(e){w=null;}
 if(w&&w.mode===2){WXB.mute=2;WXB.wl=w.wl;}
 try{ex2(x,y,z,R,P,o);}finally{WXB.mute=0;if(w)try{wxbStart(w);}catch(e){console.warn('esplosione in acqua',e);}}};}
// ---------- avvio: cupola, getti, onde, spinta verso l'alto di ciò che galleggia, onda nell'allagamento ----------
let WXB_DOME=null;
function wxbStart(w){const e=Object.assign(w,{t:0,em:0,surge:false,roar:false,mist:false,bub:0});
 e.N=e.mode?Math.min(440,60+e.R*26):Math.round(24+e.R*6);e.dur=.22+e.R*.008;e.Vt=Math.sqrt(2*G*Math.max(1,e.H));e.tf=e.mode?e.Vt/G*1.9:.6;
 WXB.L.push(e);if(WXB.L.length>8){const o=WXB.L.shift();if(o.dome){scene.remove(o.dome);o.dome.material.dispose();}}
 if(e.mode===2&&e.depth>.6){if(!WXB_DOME){const g=new THREE.SphereGeometry(1,28,10,0,TAU,0,Math.PI/2),P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),n=1+.09*Math.sin(x*7+z*5)+.06*Math.sin(x*13-z*11+y*6);P.setXYZ(i,x*n,y*n,z*n);}g.computeVertexNormals();WXB_DOME=g;}
  const m=new THREE.Mesh(WXB_DOME,new THREE.MeshStandardMaterial({color:0xd8dcdc,roughness:.55,metalness:0,transparent:true,opacity:.92,depthWrite:false}));m.position.set(e.x,e.wl,e.z);m.scale.set(.01,.01,.01);m.renderOrder=10;scene.add(m);e.dome=m;}
 // spinta verso l'alto e verso l'esterno a ciò che galleggia sopra la cupola
 const k=Math.min(2,e.R/8);for(const b of dynCars){if(b.dead)continue;const d=Math.hypot(b.px-e.x,b.pz-e.z);if(d>e.R*1.4||b.py>e.wl+3)continue;const f=(1-d/(e.R*1.4))*k*(e.mode===0?.3:1);b.vy+=6*f;b.vx+=(b.px-e.x)/(d+.5)*3*f;b.vz+=(b.pz-e.z)/(d+.5)*3*f;}
 // allagamento della città: la buca nell'acqua spinge un'onda vera nella simulazione
 if(WS.D){const c0=wsCell(e.x,e.z);if(c0>=0&&!WS.riv[c0]&&WS.D[c0]>.25){const cs=WS.cs,r1=e.R*.7,r2=e.R*1.5;let tot=0;const ring=[];
   for(let dz=-r2;dz<=r2;dz+=cs)for(let dx=-r2;dx<=r2;dx+=cs){const c=wsCell(e.x+dx,e.z+dz);if(c<0||WS.riv[c]||WS.T[c]>100)continue;const d=Math.hypot(dx,dz);if(d<r1){const q=WS.D[c]*.55*Math.min(1,e.R/10);WS.D[c]-=q;tot+=q;}else if(d<r2)ring.push(c);}
   if(ring.length&&tot>0){for(const c of ring)WS.D[c]+=tot/ring.length;}WS.awake=4;}}
 if(e.mode===0)wxbRoar(Object.assign({},e,{H:3}));}
// ---------- passo ----------
function wxbStep(dt){WXB.clk+=dt;const V=U.uWxb.value;let n=0;const l=TODC.lit,cp=camera.position;
 for(let i=WXB.L.length-1;i>=0;i--){const e=WXB.L[i];e.t+=dt;if(e.t>95){if(e.dome){scene.remove(e.dome);e.dome.material.dispose();}WXB.L.splice(i,1);}}
 for(const e of WXB.L){V[n++].set(e.x,e.z,e.t,e.R*(e.mode===0?.45:1));const far=Math.abs(e.x-cp.x)+Math.abs(e.z-cp.z)>1400;
  if(!psA||far)continue;
  // getti della colonna e della corona, emessi nei primi istanti
  if(e.em<e.N&&e.t>(e.mode===2?.08:0)){const want=Math.min(e.N,Math.ceil(e.N*Math.min(1,e.t/e.dur)));for(;e.em<want;e.em++){const a=rand(0,TAU),r0=e.R*.3*Math.sqrt(Math.random()),x=e.x+Math.cos(a)*r0,z=e.z+Math.sin(a)*r0,cr=e.mode===0||Math.random()<.3;
    let vy,vr;if(e.mode===0){vy=rand(2,6)*Math.min(1.4,e.R/8);vr=rand(5,13)*Math.min(1.5,e.R/8);}else if(cr){const el=rand(.6,1.15),s=e.Vt*rand(.35,.75);vy=Math.sin(el)*s;vr=Math.cos(el)*s;}else{vy=e.Vt*Math.sqrt(rand(.25,1));vr=rand(.2,1.6)+e.R*.04*Math.random();}
    const s0=(cr?.35:.55)+e.R*rand(.08,.16),c=(.82+.12*Math.random())*l+.04;
    psA.spawn(x,e.wl+.2,z,Math.cos(a)*vr,vy,Math.sin(a)*vr,Math.max(.6,2*vy/G*rand(.85,1.05)),s0,s0*rand(2.1,3.1),c,c*1.02,c*1.05,cr?.85:.97,.1,9.8,2);}}
  // nebbia che resta in cima alla colonna e si allarga col vento
  if(e.mode&&!e.mist&&e.t>e.Vt/G*.8){e.mist=true;const m=Math.round(16+e.R*2.2);for(let k=0;k<m;k++){const a=rand(0,TAU),r=e.R*rand(0,.6),h=e.H*rand(.45,1),c=.86*l+.05;
    psA.spawn(e.x+Math.cos(a)*r,e.wl+h,e.z+Math.sin(a)*r,rand(-1,1),rand(-.5,.4),rand(-1,1),rand(5,10),e.R*rand(.35,.6),e.R*rand(1.2,2),c,c,c*1.02,.38,.8,-.03,1);}}
  // l'acqua ricade: fragore e anello di nebbia che rotola sulla superficie (base surge)
  if(e.mode&&!e.roar&&e.t>e.tf*.55){e.roar=true;wxbRoar(e);}
  if(e.mode===2&&!e.surge&&e.t>e.tf*.8&&e.R>=5){e.surge=true;const m=Math.round(22+e.R*4.5),sp=Math.min(1.6,Math.sqrt(e.R/8));for(let k=0;k<m;k++){const a=k/m*TAU+rand(-.1,.1),c=.82*l+.05;
    psA.spawn(e.x+Math.cos(a)*e.R*.5,e.wl+rand(.5,2),e.z+Math.sin(a)*e.R*.5,Math.cos(a)*rand(4,10)*sp,rand(.2,1.1),Math.sin(a)*rand(4,10)*sp,rand(4,8),e.R*rand(.3,.45),e.R*rand(1.3,2),c,c,c*1.03,.42,.7,-.02,1);}}
  // ribollire di bolle dopo uno scoppio sott'acqua
  if(e.mode===2&&e.t<3.5){e.bub+=dt*(30+e.R*3)*(1-e.t/3.5);while(e.bub>1){e.bub--;const a=rand(0,TAU),r=e.R*.7*Math.sqrt(Math.random()),c=.85*l+.05;psA.spawn(e.x+Math.cos(a)*r,e.wl+.05,e.z+Math.sin(a)*r,0,rand(.8,2.6),0,rand(.35,.8),.18,.5,c,c,c,.7,.3,9.8,2);}}
  // cupola che si gonfia e poi si squarcia sotto la colonna
  if(e.dome){const t=e.t,T1=.3,rd=e.R*(.75+.4*Math.min(1,t/T1)),hd=Math.min(e.H*.3,e.R*.9)*(t<T1?Math.sin(t/T1*Math.PI/2):Math.max(0,1-(t-T1)/.6));
   e.dome.scale.set(Math.max(.01,rd),Math.max(.01,hd),Math.max(.01,rd));e.dome.material.opacity=.92*(t<T1?1:Math.max(0,1-(t-T1)/.7));if(t>1.1){scene.remove(e.dome);e.dome.material.dispose();e.dome=null;}}}
 for(let i=n;i<8;i++)V[i].set(0,-1e5,1e3,0);U.uWxbN.value=n;}
{const vv3=vehicleVisuals;vehicleVisuals=function(dt){vv3(dt);try{wxbStep(dt);}catch(e){if(!WXB.err){WXB.err=1;console.warn('acqua',e);}}};}
{const rs1=resetCity;resetCity=function(){rs1();for(const e of WXB.L)if(e.dome){scene.remove(e.dome);e.dome.material.dispose();}WXB.L.length=0;U.uWxbN.value=0;};}
