/* ======================= PATCH AB — ESPLOSIONI IN ACQUA RIFATTE ======================= */
// Sequenza fisica di uno scoppio sott'acqua (come nei filmati delle cariche di profondità):
// 1) l'onda d'urto sbianca la superficie in un anello velocissimo; 2) la bolla di gas solleva una cupola di spruzzo bianco
// e granuloso; 3) la cupola si squarcia e partono decine di getti: un pennacchio quasi verticale alto quanto permette
// la profondità della carica (più vicina alla superficie = più alto) e una corona di getti inclinati; ogni getto è un
// flusso di gocce che sale, rallenta e ricade lungo una parabola; 4) in cima resta una nube di nebbia che il vento sposta;
// 5) l'acqua ricade come pioggia fitta (anelli e schizzetti dove tocca), alla base rotola un anello di nebbia (base surge);
// 6) restano onde di gravità vere (le cose che galleggiano ci ballano sopra), schiuma che si sfilaccia e bolle che salgono.
// Gli scoppi in aria sopra l'acqua schiacciano la superficie e lanciano spruzzi bassi a raggiera.
const WXB2={dome:null};
function wxbDomeMat(){const m=new THREE.MeshStandardMaterial({color:0xe2e6e6,roughness:.62,metalness:0,transparent:true,opacity:.95,depthWrite:false});
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.uniforms.uK=m.userData.k;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vDp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvDp=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vDp;uniform float uTime;uniform float uK;float dh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float dn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(dh(i),dh(i+vec3(1,0,0)),f.x),mix(dh(i+vec3(0,1,0)),dh(i+vec3(1,1,0)),f.x),f.y),mix(mix(dh(i+vec3(0,0,1)),dh(i+vec3(1,0,1)),f.x),mix(dh(i+vec3(0,1,1)),dh(i+vec3(1,1,1)),f.x),f.y),f.z);}')
   .replace('#include <alphamap_fragment>','#include <alphamap_fragment>\n{float n=dn(vDp*7.+uTime*.6)*.6+dn(vDp*19.-uTime)*.4;float rim=1.-abs(vDp.y);diffuseColor.a*=smoothstep(.15+.55*uK,.5+.4*uK,n+.35*(1.-rim))*(1.-smoothstep(.75,1.,rim)*.5);diffuseColor.rgb*=.86+.24*n;}');};
 m.userData.k={value:0};return m;}
wxbStart=function(w){const e=Object.assign(w,{t:0,mist:false,roar:false,surge:false,bub:0,rainT:0});const R=e.R,hi=QP===PRESETS.alta||QP===PRESETS.ultra;
 e.Vt=Math.sqrt(2*G*Math.max(1,e.H));e.tf=e.mode?e.Vt/G*1.9:.6;
 // getti: pennacchio centrale quasi verticale + corona di getti inclinati; ogni getto emette gocce per un breve tempo
 const nJ=e.mode?Math.round(clamp(18+R*3.2,18,hi?96:60)):Math.round(clamp(10+R*2,10,40));e.jets=[];
 for(let i=0;i<nJ;i++){const core=e.mode?Math.random()<.62:false,a=rand(0,TAU);
  const el=e.mode?(core?rand(1.32,1.565):rand(.62,1.18)):rand(.18,.55),sp=e.mode?e.Vt*(core?Math.sqrt(rand(.3,1.02)):rand(.35,.72)):rand(6,14)*Math.min(1.6,R/8);
  e.jets.push({a,el,sp,r0:R*(core?.22:.38)*Math.sqrt(Math.random()),t0:(e.mode===2?.07:0)+rand(0,.1),dur:rand(.16,.42),acc:0,w:(core?rand(.07,.12):rand(.05,.09))*R+.15});}
 WXB.L.push(e);if(WXB.L.length>8){const o=WXB.L.shift();if(o.dome){scene.remove(o.dome);o.dome.material.dispose();}}
 if(e.mode===2&&e.depth>.6){if(!WXB_DOME){const g=new THREE.SphereGeometry(1,40,14,0,TAU,0,Math.PI/2),P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),n=1+.09*Math.sin(x*7+z*5)+.06*Math.sin(x*13-z*11+y*6)+.04*Math.sin(x*23+z*19-y*9);P.setXYZ(i,x*n,y*n,z*n);}g.computeVertexNormals();WXB_DOME=g;}
  const m=new THREE.Mesh(WXB_DOME,wxbDomeMat());m.position.set(e.x,e.wl,e.z);m.scale.set(.01,.01,.01);m.renderOrder=9;m.layers.set(1);scene.add(m);e.dome=m;}
 // spinta verso l'alto e verso l'esterno a ciò che galleggia sopra la cupola
 const k=Math.min(2,R/8);for(const b of dynCars){if(b.dead)continue;const d=Math.hypot(b.px-e.x,b.pz-e.z);if(d>R*1.4||b.py>e.wl+3)continue;const f=(1-d/(R*1.4))*k*(e.mode===0?.3:1);b.vy+=6*f;b.vx+=(b.px-e.x)/(d+.5)*3*f;b.vz+=(b.pz-e.z)/(d+.5)*3*f;wake(b);}
 for(const b of bodies){if(b.dead||b.car||b.sleep&&Math.hypot(b.px-e.x,b.pz-e.z)>R*1.2)continue;const d=Math.hypot(b.px-e.x,b.pz-e.z);if(d>R*1.3||b.py>e.wl+2||b.py<e.wl-6)continue;const f=(1-d/(R*1.3))*Math.min(2.5,R/6);b.vy+=8*f;b.vx+=(b.px-e.x)/(d+.5)*4*f;b.vz+=(b.pz-e.z)/(d+.5)*4*f;wake(b);}
 // allagamento della città: la buca nell'acqua spinge un'onda vera nella simulazione
 if(WS.D){const c0=wsCell(e.x,e.z);if(c0>=0&&!WS.riv[c0]&&WS.D[c0]>.25){const cs=WS.cs,r1=R*.7,r2=R*1.5;let tot=0;const ring=[];
   for(let dz=-r2;dz<=r2;dz+=cs)for(let dx=-r2;dx<=r2;dx+=cs){const c=wsCell(e.x+dx,e.z+dz);if(c<0||WS.riv[c]||WS.T[c]>100)continue;const d=Math.hypot(dx,dz);if(d<r1){const q=WS.D[c]*.55*Math.min(1,R/10);WS.D[c]-=q;tot+=q;}else if(d<r2)ring.push(c);}
   if(ring.length&&tot>0){for(const c of ring)WS.D[c]+=tot/ring.length;}WS.awake=4;}}
 // primo istante: la superficie si sbianca in un anello che corre via (onda d'urto) e un velo di nebbia bassa
 if(WSP.mesh){const l=TODC.lit;wspRing(e.x,e.wl,e.z,R*3.2,.45);wspRing(e.x,e.wl,e.z,R*1.6,.7);
  if(e.mode===0){for(let i=0;i<Math.round(8+R);i++){const a=rand(0,TAU),r=R*rand(.2,.9);wsp(e.x+Math.cos(a)*r,e.wl+.3,e.z+Math.sin(a)*r,Math.cos(a)*rand(3,9),rand(.2,1.2),Math.sin(a)*rand(3,9),rand(1.5,3),R*.25,R*rand(.8,1.4),1,e.wl,.3*l+.04);}}}
 if(e.mode===0)wxbRoar(Object.assign({},e,{H:3}));};
wxbStep=function(dt){WXB.clk+=dt;const V=U.uWxb.value;let n=0;const l=TODC.lit,cp=camera.position,hi=QP===PRESETS.alta||QP===PRESETS.ultra,rate=hi?1:(QP===PRESETS.media?.65:.4);
 for(let i=WXB.L.length-1;i>=0;i--){const e=WXB.L[i];e.t+=dt;if(e.t>95){if(e.dome){scene.remove(e.dome);e.dome.material.dispose();}WXB.L.splice(i,1);}}
 for(const e of WXB.L){V[n++].set(e.x,e.z,e.t,e.R*(e.mode===0?.45:1));const far=Math.abs(e.x-cp.x)+Math.abs(e.z-cp.z)>1500;if(!WSP.mesh||far)continue;const R=e.R;
  // getti: ogni getto emette gocce lungo la sua direzione; quelle emesse dopo sono più lente (la coda del getto)
  if(e.t<1.2)for(const j of e.jets){if(e.t<j.t0||e.t>j.t0+j.dur)continue;const f=(e.t-j.t0)/j.dur;j.acc+=dt*(e.mode?95:55)*rate*Math.min(2.2,.6+R*.05);
   while(j.acc>1){j.acc--;const ce=Math.cos(j.el),se=Math.sin(j.el),s=j.sp*(1-f*.45)*rand(.9,1.06),da=rand(-.06,.06),de=rand(-.05,.05),x=e.x+Math.cos(j.a)*j.r0,z=e.z+Math.sin(j.a)*j.r0;
    const vx=Math.cos(j.a+da)*Math.cos(j.el+de)*s,vz=Math.sin(j.a+da)*Math.cos(j.el+de)*s,vy=Math.sin(j.el+de)*s;
    wsp(x+rand(-.3,.3),e.wl+.2,z+rand(-.3,.3),vx,vy,vz,Math.max(.8,2*vy/G+rand(.2,.8)),j.w*rand(.8,1.3),j.w*rand(.5,.9),0,e.wl,rand(.7,.95));
    // nuvola di spruzzo fitto che accompagna il getto (dà corpo alla colonna, soprattutto in basso)
    if(Math.random()<.32*rate+.08)wsp(x+rand(-.5,.5),e.wl+.4,z+rand(-.5,.5),vx*.85,vy*rand(.7,.95),vz*.85,rand(1,2.2),R*rand(.1,.18),R*rand(.28,.42),1,e.wl,rand(.45,.7),.22,6);}}
  // la cima del pennacchio si sfalda in nebbia che il vento porta via
  if(e.mode&&!e.mist&&e.t>e.Vt/G*.75){e.mist=true;const m=Math.round((14+R*2.4)*rate);for(let k=0;k<m;k++){const a=rand(0,TAU),r=R*rand(0,.7),h=e.H*rand(.5,1.02),c=.9;
    wsp(e.x+Math.cos(a)*r,e.wl+h,e.z+Math.sin(a)*r,rand(-1.2,1.2),rand(-.6,.5),rand(-1.2,1.2),rand(6,12),R*rand(.35,.6),R*rand(1.3,2.3),1,e.wl,.42*c);}}
  // ricaduta: fragore, base surge (anello di nebbia che rotola sulla superficie), pioggia fitta di gocce
  if(e.mode&&!e.roar&&e.t>e.tf*.55){e.roar=true;wxbRoar(e);}
  if(e.mode===2&&!e.surge&&e.t>e.tf*.75&&R>=4){e.surge=true;const m=Math.round((26+R*4)*rate),sp=Math.min(1.7,Math.sqrt(R/8));for(let k=0;k<m;k++){const a=k/m*TAU+rand(-.1,.1);
    wsp(e.x+Math.cos(a)*R*.5,e.wl+rand(.6,2.2),e.z+Math.sin(a)*R*.5,Math.cos(a)*rand(5,11)*sp,rand(.2,1),Math.sin(a)*rand(5,11)*sp,rand(5,9),R*rand(.35,.5),R*rand(1.4,2.2),1,e.wl,.38);}}
  if(e.mode&&e.t>e.tf*.5&&e.t<e.tf*1.4){e.rainT+=dt*(40+R*6)*rate;while(e.rainT>1){e.rainT--;const a=rand(0,TAU),r=R*1.3*Math.sqrt(Math.random()),h=e.H*rand(.15,.6);wsp(e.x+Math.cos(a)*r,e.wl+h,e.z+Math.sin(a)*r,rand(-.5,.5),-rand(2,6),rand(-.5,.5),3,rand(.05,.12),.06,0,e.wl,.6);}}
  // bolle che risalgono dopo uno scoppio sott'acqua: la superficie ribolle
  if(e.mode===2&&e.t<4){e.bub+=dt*(25+R*3)*(1-e.t/4)*rate;while(e.bub>1){e.bub--;const a=rand(0,TAU),r=R*.8*Math.sqrt(Math.random()),x=e.x+Math.cos(a)*r,z=e.z+Math.sin(a)*r;
    if(Math.random()<.5)wsp(x,e.wl+.04,z,rand(-.2,.2),0,rand(-.2,.2),rand(2,5),rand(.4,1.1),rand(1,2.2),3,-1e9,.8,0,0);else wsp(x,e.wl+.05,z,rand(-.4,.4),rand(1.5,3.5),rand(-.4,.4),.7,.1,.06,0,e.wl,.8);}}
  // cupola che si gonfia, si sgrana e si squarcia sotto il pennacchio
  if(e.dome){const t=e.t,T1=.28,rd=R*(.7+.45*Math.min(1,t/T1)),hd=Math.min(e.H*.3,R*.9)*(t<T1?Math.sin(t/T1*Math.PI/2):Math.max(0,1-(t-T1)/.55));
   e.dome.scale.set(Math.max(.01,rd),Math.max(.01,hd),Math.max(.01,rd));e.dome.material.userData.k.value=clamp((t-T1*.6)/.7,0,1);e.dome.material.opacity=.95*(t<T1?1:Math.max(0,1-(t-T1)/.75));if(t>1.1){scene.remove(e.dome);e.dome.material.dispose();e.dome=null;}}}
 for(let i=n;i<8;i++)V[i].set(0,-1e5,1e3,0);U.uWxbN.value=n;};
// onde vere: le cose che galleggiano salgono e scendono con le onde dello scoppio
function wxbWaveH(x,z){let h=0;for(const e of WXB.L){const t=e.t;if(t>90)continue;const dx=x-e.x,dz=z-e.z,r=Math.hypot(dx,dz)+.001,R=e.R*(e.mode===0?.45:1);if(r>R*3+t*9)continue;
  const v=3+R*.15,rf=R*.35+t*v,W=R*.45+t*.9,k=9.81/(v*v*1.6);const q1=(r-rf)/W;h+=Math.exp(-q1*q1)*Math.exp(-t/16)*R*.11/Math.sqrt(1+r/R)*Math.sin(k*(r-rf));
  const t2=t-1.2-R*.05;if(t2>0){const v2=1.6+R*.06,rf2=R*.2+t2*v2,W2=R*.3+t2*.6,k2=9.81/(v2*v2*1.4);const q2=(r-rf2)/W2;h+=Math.exp(-q2*q2)*Math.exp(-t2/10)*R*.06/Math.sqrt(1+r/R)*Math.sin(k2*(r-rf2));}}return h;}
{const wa1=waterAt;waterAt=function(x,z){const w=wa1(x,z);if(WXB.L.length&&w>-1e8)return w+wxbWaveH(x,z);return w;};}
