/* ======================= PATCH AB — SPRUZZI D'ACQUA CON FISICA ======================= */
// Sistema di particelle dedicato all'acqua: gocce e getti allungati nel verso del moto (come li vede l'occhio o una
// fotocamera: una goccia veloce è una striscia), con caduta, resistenza dell'aria che dipende dalla dimensione
// (le gocce grosse cadono più in fretta, la nebbia resta sospesa e va col vento), riflesso del cielo e scintillio del
// sole sulle gocce, nebbia illuminata dal sole. Quando una goccia ricade sull'acqua fa un piccolo schizzo e lascia
// un anello che si allarga sulla superficie. Tipi: 0 goccia/getto, 1 nebbia, 2 anello sull'acqua, 3 schiuma che galleggia.
const WSP={cap:0,n:0,p:null,v:null,t:null,L:null,s0:null,s1:null,k:null,sy:null,a:null,sd:null,mesh:null,aP:null,aV:null,aS:null,g:null,mat:null};
const WSP_VS=`attribute vec3 iP;attribute vec3 iV;attribute vec4 iS;uniform float uFogD;uniform float uBlur;varying vec2 vUv;varying float vK;varying float vA;varying float vFog;varying vec3 vVd;varying float vSd;varying float vSp;varying float vSz;
void main(){vUv=uv;float k=iS.z;vK=k;vA=iS.y;vSd=fract(iS.w);vec4 mv=viewMatrix*vec4(iP,1.);float sz=iS.x;vSz=sz;vSp=0.;
 if(k<.5){vec3 vv=(viewMatrix*vec4(iV,0.)).xyz;vec2 d2=vv.xy;float l2=length(d2);vec2 dir=vec2(0.,1.);if(l2>1e-4)dir=d2/l2;vec2 side=vec2(dir.y,-dir.x);
  vSp=length(iV);float len=sz+uBlur*l2;mv.xy+=dir*(position.y*len)+side*(position.x*sz);}
 else if(k<1.5){mv.xy+=position.xy*sz;}
 else{vec3 w=iP+vec3(position.x,0.,position.y)*sz;mv=viewMatrix*vec4(w,1.);}
 vVd=normalize(mv.xyz);gl_Position=projectionMatrix*mv;float fd=uFogD*length(mv.xyz);vFog=1.-exp(-fd*fd);}`;
const WSP_FS=`uniform vec3 uSunD;uniform vec3 uSunC;uniform vec3 uSkyZ;uniform vec3 uSkyH;uniform vec3 uAmb;uniform vec3 uFogC;uniform float uTime;varying vec2 vUv;varying float vK;varying float vA;varying float vFog;varying vec3 vVd;varying float vSd;varying float vSp;varying float vSz;
float wh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float wn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wh(i),wh(i+vec2(1.,0.)),f.x),mix(wh(i+vec2(0.,1.)),wh(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec2 q=vUv*2.-1.;vec3 Vw=normalize((vec4(vVd,0.)*viewMatrix).xyz);float sun=max(dot(-Vw,uSunD),0.);float lit=max(uSunD.y,0.)*.85+.15;
 vec3 col;float a;
 if(vK<.5){float aer=smoothstep(.12,.5,vSz);float n=wn(vec2(q.x*1.7,q.y*.8)+vSd*23.);
  a=mix((1.-smoothstep(.55,1.,abs(q.x)))*(1.-smoothstep(.6,1.,abs(q.y))),smoothstep(1.,.25,length(vec2(q.x,q.y*.9)))*(.65+.35*n),aer)*vA;
  // goccia limpida: riflesso del cielo, scintillio del sole; getto d'acqua piena d'aria: bianco, illuminato dal sole
  vec3 sky=mix(uSkyH,uSkyZ,.45);float fw=max(dot(Vw,uSunD),0.);vec3 clr=sky*.75+uAmb*.4+uSunC*(.08*lit+pow(sun,30.)*.6+pow(fw,8.)*1.3);
  vec3 wht=uSunC*(.62*lit+.35*pow(fw,3.))+uAmb*1.15+uSkyH*.25;col=mix(clr,wht*(.9+.15*n),aer);a*=mix(.6,.92,aer);}
 else if(vK<1.5){float r=length(q);float n=wn(q*2.3+vSd*17.)*.5+wn(q*5.1-vSd*9.)*.3+wn(q*11.3+vSd*5.)*.2;a=(1.-smoothstep(.15,1.,r+(n-.5)*.55))*(.35+.65*smoothstep(.25,.75,n))*vA;
  col=(uSunC*(.55*lit+.5*pow(sun,4.))+uAmb*1.1+uSkyH*.35)*(.92+.1*n);}
 else if(vK<2.5){float r=length(q);float w=.08+.12*(1.-vA);a=(1.-smoothstep(w,w*2.,abs(r-.8)))*vA*.7;col=mix(uSkyH,uSkyZ,.3)*1.1+uSunC*.12*lit;}
 else{float r=length(q);float n=wn(q*3.+vSd*9.);a=smoothstep(1.,.3,r)*smoothstep(.3,.65,n)*vA*.8;col=(uSunC*.45*lit+uAmb*1.2+uSkyH*.3)*.9;}
 if(vK<1.5&&uSunD.y>.02){float th=degrees(acos(clamp(dot(Vw,-uSunD),-1.,1.)));float rb=smoothstep(39.6,40.6,th)*(1.-smoothstep(42.4,43.4,th));if(rb>0.){float h=clamp((th-40.6)/1.9,0.,1.);vec3 sp=clamp(vec3(smoothstep(.45,.95,h),sin(h*3.1416),1.-smoothstep(.05,.55,h)),0.,1.);col+=sp*rb*uSunC*(vK<.5?.55:.3)*smoothstep(.02,.15,uSunD.y);}}
 if(a<.004)discard;col=mix(col,uFogC,vFog);gl_FragColor=vec4(col,a*(1.-vFog*.6));}`;
function wspInit(){const cap=QP===PRESETS.bassa?1600:(QP===PRESETS.media?2800:(QP===PRESETS.alta?4200:6000));WSP.cap=cap;const F=Float32Array;
 Object.assign(WSP,{n:0,p:new F(cap*3),v:new F(cap*3),t:new F(cap),L:new F(cap),s0:new F(cap),s1:new F(cap),k:new Uint8Array(cap),sy:new F(cap),a:new F(cap),sd:new F(cap),dr:new F(cap),gr:new F(cap)});
 const q=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry();g.index=q.index;g.setAttribute('position',q.attributes.position);g.setAttribute('uv',q.attributes.uv);
 WSP.aP=new THREE.InstancedBufferAttribute(new F(cap*3),3).setUsage(THREE.DynamicDrawUsage);WSP.aV=new THREE.InstancedBufferAttribute(new F(cap*3),3).setUsage(THREE.DynamicDrawUsage);WSP.aS=new THREE.InstancedBufferAttribute(new F(cap*4),4).setUsage(THREE.DynamicDrawUsage);
 g.setAttribute('iP',WSP.aP);g.setAttribute('iV',WSP.aV);g.setAttribute('iS',WSP.aS);g.instanceCount=0;WSP.g=g;
 WSP.mat=new THREE.ShaderMaterial({uniforms:{uFogD:{value:.001},uFogC:{value:new THREE.Color()},uBlur:{value:.045},uSunD:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color(1,1,1)},uSkyZ:U.uSkyZ,uSkyH:U.uSkyH,uAmb:{value:new THREE.Color(.3,.32,.35)},uTime:U.uTime},
  vertexShader:WSP_VS,fragmentShader:WSP_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 WSP.mesh=new THREE.Mesh(g,WSP.mat);WSP.mesh.frustumCulled=false;WSP.mesh.layers.set(1);WSP.mesh.renderOrder=10;scene.add(WSP.mesh);}
// k: 0 goccia, 1 nebbia, 2 anello, 3 schiuma; sy: quota dell'acqua sotto (per l'impatto); dr: resistenza; gr: gravità
function wsp(x,y,z,vx,vy,vz,L,s0,s1,k,sy,a,dr,gr){if(!WSP.mesh)return;if(WSP.n>=WSP.cap){if(k!==1&&k!==0)return;const j=Math.floor(Math.random()*WSP.cap);if(WSP.k[j]===1)return;WSP.n--;wspCp(WSP.n,j);}
 const i=WSP.n++,i3=i*3;WSP.p[i3]=x;WSP.p[i3+1]=y;WSP.p[i3+2]=z;WSP.v[i3]=vx;WSP.v[i3+1]=vy;WSP.v[i3+2]=vz;WSP.t[i]=0;WSP.L[i]=L;WSP.s0[i]=s0;WSP.s1[i]=s1;WSP.k[i]=k;WSP.sy[i]=sy;WSP.a[i]=a;WSP.sd[i]=Math.random();
 WSP.dr[i]=dr===undefined?(k===0?.0045/Math.max(.004,s0):(k===1?.9:0)):dr;WSP.gr[i]=gr===undefined?(k===0?9.81:(k===1?-.15:0)):gr;}
function wspCp(j,i){const i3=i*3,j3=j*3;for(let q=0;q<3;q++){WSP.p[i3+q]=WSP.p[j3+q];WSP.v[i3+q]=WSP.v[j3+q];}WSP.t[i]=WSP.t[j];WSP.L[i]=WSP.L[j];WSP.s0[i]=WSP.s0[j];WSP.s1[i]=WSP.s1[j];WSP.k[i]=WSP.k[j];WSP.sy[i]=WSP.sy[j];WSP.a[i]=WSP.a[j];WSP.sd[i]=WSP.sd[j];WSP.dr[i]=WSP.dr[j];WSP.gr[i]=WSP.gr[j];}
function wspRing(x,y,z,s,L){wsp(x,y+.03,z,0,0,0,L||rand(.8,1.4),s*.15,s,2,-1e9,rand(.6,1),0,0);}
function wspStep(dt){if(!WSP.mesh){if(typeof psA!=='undefined'&&psA)wspInit();return;}const p=WSP.p,v=WSP.v,W=WIND;let n=WSP.n,splashes=0;
 for(let i=n-1;i>=0;i--){const t=WSP.t[i]+dt;if(t>=WSP.L[i]){n--;if(i!==n)wspCp(n,i);continue;}WSP.t[i]=t;const i3=i*3,k=WSP.k[i];
  if(k===0||k===1){const sp=Math.hypot(v[i3],v[i3+1],v[i3+2]),d=1/(1+WSP.dr[i]*sp*dt);v[i3]*=d;v[i3+1]*=d;v[i3+2]*=d;v[i3+1]-=WSP.gr[i]*dt;
   if(k===1){v[i3]+=(W.x-v[i3])*dt*.35;v[i3+2]+=(W.z-v[i3+2])*dt*.35;}
   p[i3]+=v[i3]*dt;p[i3+1]+=v[i3+1]*dt;p[i3+2]+=v[i3+2]*dt;
   if(k===0&&v[i3+1]<0&&p[i3+1]<WSP.sy[i]){const vy=-v[i3+1],s=WSP.s0[i];
    // goccia che ricade: anello sull'acqua e, se cade forte, un piccolo rimbalzo di goccioline
    if(splashes<60&&s>.05){splashes++;wspRing(p[i3],WSP.sy[i],p[i3+2],Math.min(3.5,s*3+vy*.12),rand(.7,1.3));if(vy>4.5&&Math.random()<.5&&WSP.n<WSP.cap-4)for(let m=0;m<2;m++)wsp(p[i3],WSP.sy[i]+.05,p[i3+2],rand(-1,1)*vy*.12,vy*rand(.15,.32),rand(-1,1)*vy*.12,rand(.4,.8),s*.35,s*.25,0,WSP.sy[i],.7);}
    n--;if(i!==n)wspCp(n,i);continue;}
   if(k===1&&p[i3+1]<WSP.sy[i]+.3){p[i3+1]=WSP.sy[i]+.3;v[i3+1]=Math.max(0,v[i3+1]);}}
  else if(k===3){p[i3]+=v[i3]*dt;p[i3+2]+=v[i3+2]*dt;v[i3]*=1-dt*.5;v[i3+2]*=1-dt*.5;}}
 WSP.n=n;const aP=WSP.aP.array,aV=WSP.aV.array,aS=WSP.aS.array;
 for(let i=0;i<n;i++){const i3=i*3,i4=i*4,f=WSP.t[i]/WSP.L[i],k=WSP.k[i];aP[i3]=p[i3];aP[i3+1]=p[i3+1];aP[i3+2]=p[i3+2];aV[i3]=v[i3];aV[i3+1]=v[i3+1];aV[i3+2]=v[i3+2];
  const e=k===2?Math.sqrt(f):1-(1-f)*(1-f);aS[i4]=WSP.s0[i]+(WSP.s1[i]-WSP.s0[i])*e;
  aS[i4+1]=WSP.a[i]*(k===1?Math.min(1,f*6)*(1-f)*(1-f*.4):(k===2?(1-f):(k===3?Math.min(1,f*4)*(1-f):Math.min(1,f*20)*(1-f*f))));aS[i4+2]=k;aS[i4+3]=WSP.sd[i];}
 WSP.g.instanceCount=n;if(n>0)for(const [A,c] of [[WSP.aP,3],[WSP.aV,3],[WSP.aS,4]]){A.updateRange.offset=0;A.updateRange.count=n*c;A.needsUpdate=true;}
 const u=WSP.mat.uniforms;u.uFogC.value.copy(scene.fog.color);u.uFogD.value=scene.fog.density;u.uSunD.value.copy(sunDir);const si=sun.intensity/2.5;u.uSunC.value.copy(sun.color).multiplyScalar(si);
 u.uAmb.value.copy(hemi.color).multiplyScalar(hemi.intensity*1.2).lerp(U.uSkyH.value,.35);}
{const vv=vehicleVisuals;vehicleVisuals=function(dt){vv(dt);try{wspStep(dt);}catch(e){if(!WSP.err){WSP.err=1;console.warn('spruzzi',e);}}};}
{const rs=resetCity;resetCity=function(){rs();WSP.n=0;if(WSP.g)WSP.g.instanceCount=0;};}
// ---------- schizzo di un corpo che entra in acqua: corona, getto centrale, nebbia, anelli ----------
// E = energia d'impatto (J): decide quante gocce, quanto in alto, quanto larga la corona
function waterSplash(x,y,z,r,vy,E){if(!WSP.mesh)return;const sy=y,v=Math.abs(vy||4),en=E||(r*r*r*900*v*v*.5),q=clamp(Math.log10(1+en)/6,.05,1.4),l=TODC.lit;
 const cr=Math.max(.4,r),nC=Math.round(18+90*q),vc=Math.min(14,1.2+v*.55)*(.75+.35*q);
 for(let i=0;i<nC;i++){const a=i/nC*TAU+rand(-.08,.08),el=rand(.95,1.35),s=vc*rand(.7,1.15),rr=cr*rand(.8,1.1);
  wsp(x+Math.cos(a)*rr,sy+.05,z+Math.sin(a)*rr,Math.cos(a)*Math.cos(el)*s,Math.sin(el)*s,Math.sin(a)*Math.cos(el)*s,rand(.9,2),rand(.05,.12)*(1+q),rand(.03,.08),0,sy,rand(.6,.95));}
 // getto di Worthington: la colonna che risale dal buco lasciato dall'oggetto
 if(v>3&&r>.3){const nJ=Math.round(8+30*q),vj=Math.min(16,2+v*.6)*(.7+.4*q);for(let i=0;i<nJ;i++)wsp(x+rand(-.2,.2)*cr,sy+.1,z+rand(-.2,.2)*cr,rand(-.6,.6),vj*rand(.6,1.05),rand(-.6,.6),rand(1,2.2),rand(.08,.18)*(1+q*.6),rand(.05,.1),0,sy,rand(.6,.9),undefined,9.81);}
 for(let i=0;i<Math.round(3+8*q);i++)wsp(x+rand(-1,1)*cr,sy+rand(.2,1),z+rand(-1,1)*cr,rand(-1,1),rand(.3,1.5),rand(-1,1),rand(1.5,3.5),cr*.4,cr*rand(1.6,2.6),1,sy,.32*l+.05);
 for(let i=0;i<Math.round(4+10*q);i++){const a=rand(0,TAU),s=vc*rand(.5,.9);wsp(x+Math.cos(a)*cr*.7,sy+.2,z+Math.sin(a)*cr*.7,Math.cos(a)*s*.45,s*rand(.6,1),Math.sin(a)*s*.45,rand(.8,1.5),cr*rand(.25,.4),cr*rand(.6,.9),1,sy,rand(.4,.6),.3,6);}
 wspRing(x,sy,z,cr*2.5+v*.25,rand(1.4,2.2));wspRing(x,sy,z,cr*1.4+v*.12,rand(.9,1.4));
 for(let i=0;i<Math.round(4+10*q);i++){const a=rand(0,TAU),rr=cr*rand(.5,1.6);wsp(x+Math.cos(a)*rr,sy+.04,z+Math.sin(a)*rr,Math.cos(a)*rand(.1,.6),0,Math.sin(a)*rand(.1,.6),rand(5,12),cr*rand(.3,.6),cr*rand(.6,1.1),3,-1e9,rand(.5,.9),0,0);}}
// lo schizzo del gioco (oggetti, persone, auto, detriti) passa al sistema nuovo
{const sp0=splash;splash=function(x,y,z,r,vy){if(!WSP.mesh)return sp0(x,y,z,r,vy);waterSplash(x,y,z,r,vy);sfx({x,y,z,src:'noise',filter:'lowpass',ff0:1800,ff1:350,g:Math.min(.6,.18+r*.06),d:.6+r*.05,ref:10});};}
// ---------- pioggia sull'acqua (anelli e goccioline) e scia di ciò che si muove in acqua ----------
const WSR={t:0,wk:0};
function wspRainWake(dt){if(!WSP.mesh)return;const cp=camera.position,rain=(typeof WX!=='undefined'&&WX.rain)||0;
 if(rain>.05){WSR.t+=dt*rain*(QP===PRESETS.bassa?40:110);while(WSR.t>1){WSR.t--;const a=Math.random()*TAU,r=3+Math.sqrt(Math.random())*45,x=cp.x+Math.cos(a)*r,z=cp.z+Math.sin(a)*r,w=waterAt(x,z);if(!(w>-1e8)||w<groundH(x,z)+.05)continue;
   wspRing(x,w,z,rand(.25,.6),rand(.45,.8));if(Math.random()<.25)wsp(x,w+.02,z,rand(-.3,.3),rand(1,2.2),rand(-.3,.3),.35,.025,.02,0,w,.6);}}
 WSR.wk-=dt;if(WSR.wk>0)return;WSR.wk=.1;
 for(const b of bodies){if(b.dead||b.sleep||!b.inF)continue;const sp=Math.hypot(b.vx,b.vz);if(sp<1.8||Math.abs(b.px-cp.x)+Math.abs(b.pz-cp.z)>260)continue;const w=waterAt(b.px,b.pz);if(!(w>-1e8)||b.py-(b.hy||.5)>w+.3)continue;
  const ux=b.vx/sp,uz=b.vz/sp,L=Math.max(b.hx||1,b.hz||1),k=Math.min(1,(sp-1.8)/8);
  // prua: spruzzo che si apre a ventaglio; dietro: schiuma che resta e si allarga
  for(let i=0;i<Math.round(2+6*k);i++){const sd=Math.random()<.5?-1:1;wsp(b.px+ux*L,w+.1,b.pz+uz*L,ux*sp*.6-uz*sd*rand(1,3),rand(.8,2.5)*k+.5,uz*sp*.6+ux*sd*rand(1,3),rand(.5,1),rand(.06,.14),.05,0,w,.75);}
  wsp(b.px-ux*L,w+.04,b.pz-uz*L,-ux*sp*.15,0,-uz*sp*.15,rand(4,8),L*.5,L*rand(1.2,1.8),3,-1e9,.7*k+.2,0,0);}}
{const vv=vehicleVisuals;vehicleVisuals=function(dt){vv(dt);try{wspRainWake(dt);}catch(e){}};}
