/* ======================= PATCH Z — FIUMI: CORRENTE VISIBILE, RIVE, MASSI, ACQUA PULITA O TORBIDA ======================= */
U.tRiv={value:null};
// velocità della corrente dalla pendenza del letto, larghezza, mappa delle rive (distanza dalla linea dell'acqua)
function rvPrep(){
 for(let ri=0;ri<RIVERS.length;ri++){const R=RIVERS[ri],P=R.P;for(let i=0;i<P.length;i++){const p=P[i],a=P[Math.max(0,i-3)],b=P[Math.min(P.length-1,i+3)],sl=(a.y-b.y)/Math.max(1,b.s-a.s);
   p.v0=clamp(.55+sl*420,.45,3.4);p.w=lerp(R.w0,R.w1,p.s/R.S);let inL=false;for(const L of LAKES)if(Math.hypot(p.x-L.x,p.z-L.z)<L.r*1.0)inL=true;p.lake=inL;}}
 let k=0;for(let ri=0;ri<RIVERS.length;ri++){const P=RIVERS[ri].P;for(let i=0;i<P.length-1;i++){const g=RVS[k++];g.ri=ri;g.ia=i;g.av=P[i].v0;g.bv=P[i+1].v0;g.lake=P[i].lake||P[i+1].lake;}}
 const N=2048,cs=12288/N,d=new Uint8Array(N*N).fill(255),enc=v=>Math.max(0,Math.min(255,Math.round((v+20)/60*255)));
 const put=(x0,x1,z0,z1,f)=>{const i0=Math.max(0,Math.floor((x0+6144)/cs)),i1=Math.min(N-1,Math.floor((x1+6144)/cs)),j0=Math.max(0,Math.floor((z0+6144)/cs)),j1=Math.min(N-1,Math.floor((z1+6144)/cs));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=-6144+(i+.5)*cs,z=-6144+(j+.5)*cs,v=enc(f(x,z));if(v<d[i+j*N])d[i+j*N]=v;}};
 for(const g of RVS){const m=Math.max(g.aw,g.bw)+44;put(Math.min(g.ax,g.bx)-m,Math.max(g.ax,g.bx)+m,Math.min(g.az,g.bz)-m,Math.max(g.az,g.bz)+m,(x,z)=>{const dx=g.bx-g.ax,dz=g.bz-g.az;let t=((x-g.ax)*dx+(z-g.az)*dz)/(dx*dx+dz*dz);t=clamp(t,0,1);return Math.hypot(g.ax+dx*t-x,g.az+dz*t-z)-(g.aw+(g.bw-g.aw)*t+1.875);});}
 for(const L of LAKES){if(L.lv===undefined)continue;const m=L.r*1.6+40;put(L.x-m,L.x+m,L.z-m,L.z+m,(x,z)=>{const dx=x-L.x,dz=z-L.z,a=Math.atan2(dz,dx),rr=lakeRR(L,a);return Math.hypot(dx,dz)-(rr+3.5);});}
 const t=new THREE.DataTexture(d,N,N,GL2?THREE.RedFormat:THREE.LuminanceFormat);t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;U.tRiv.value=t;}
// corrente nel punto (m/s): veloce al centro, lenta vicino alle rive, ferma nei laghi
const _rvf=[0,0];
function rvFlow(x,z){_rvf[0]=_rvf[1]=0;if(!RVG)return _rvf;const r=riverQ(x,z);if(!r||r.d>r.w+2)return _rvf;const g=RVS[r.i];if(!g||g.lake)return _rvf;
 const dx=g.bx-g.ax,dz=g.bz-g.az,L=Math.hypot(dx,dz)||1,xr=r.d/r.w,sp=(g.av+(g.bv-g.av)*r.t)*Math.max(.12,1-xr*xr);_rvf[0]=dx/L*sp;_rvf[1]=dz/L*sp;return _rvf;}
// ---------- shader dell'acqua di fiume ----------
const RV_F=`vec3 rvNd(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f),du=6.*f*(1.-f);float a=rwH(i),b=rwH(i+vec2(1.,0.)),c=rwH(i+vec2(0.,1.)),d=rwH(i+vec2(1.,1.));return vec3(a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y,du*(vec2(b-a,c-a)+(a-b-c+d)*u.yx));}
varying vec4 vRv;varying vec2 vTn;varying float vSp;varying vec3 vWP;uniform float uTime;uniform float uWetG;uniform sampler2D tRiv;
vec3 rvAlb;float rvRough;vec2 rvG;
void riverShade(){
 bool lake=vRv.w>8.5;float ac=vRv.x,s=vRv.y,w=max(vRv.z,1.),ri=floor(vRv.w+.5);vec2 p=vWP.xz;float dist=length(vWP-cameraPosition);
 float rvd=texture2D(tRiv,(p+6144.)/12288.).r*60.-20.;
 float xr=lake?0.:abs(ac)/w;float sp=lake?0.:vSp*max(.12,1.-xr*xr);
 float tb=lake?.2:(ri<.5?.3:(ri<1.5?.78:.12));tb=clamp(tb+(rwN(lake?p*.003:vec2(s*.004,ri*7.))-.5)*.35+uWetG*.3,0.,1.);
 vec2 q0=lake?vec2(-p.x,p.y):vec2(ac,s);
 vec2 g=vec2(0.);float foam=0.;float nf=1.-smoothstep(25.,70.,dist);
 for(int j=0;j<2;j++){float ph=fract(uTime/3.+float(j)*.5);float wg=1.-abs(2.*ph-1.);
  vec2 q=q0-vec2(0.,sp*ph*3.)+vec2(float(j)*17.3,float(j)*5.1);
  vec2 F1=lake?vec2(.7):vec2(1.1,.45),F2=lake?vec2(1.9):vec2(2.7,1.3),F3=lake?vec2(4.6):vec2(6.5,3.2);
  vec3 n1=rvNd(q*F1),n2=rvNd(q*F2+3.7),n3=rvNd(q*F3+9.1);
  g+=(n1.yz*F1*.05+n2.yz*F2*.022+n3.yz*F3*.009*nf)*wg*(lake?.6:.55+.45*smoothstep(.6,2.5,vSp));
  float fb=rwN(q*vec2(.9,.11)+vec2(ri*13.,0.))*.62+rwN(q*vec2(2.6,.32)+5.)*.38;
  float f=smoothstep(.9,.985,1.-abs(2.*fb-1.))*(.5+.5*n2.x)+smoothstep(.83,.97,n1.x)*.3;foam+=f*wg;}
 foam*=lake?.03:(.03+.55*smoothstep(1.,3.,vSp)+.12*smoothstep(.75,1.05,xr)*smoothstep(1.,2.5,vSp));
 float rk=0.;float c0=floor(s/22.);
 if(!lake)for(int j=-1;j<=1;j++){float c=c0+float(j);if(rwE(vec2(c,ri*17.+3.))<.3){float u=rwE(vec2(c*3.+1.,ri*5.+11.)),r=.5+1.1*rwE(vec2(c*7.+2.,ri+29.));
   vec2 rc=vec2((u-.5)*w*1.5,c*22.+4.+rwE(vec2(c*5.+7.,ri*3.+1.))*14.);vec2 dv=vec2(ac,s)-rc;float dd=length(dv);
   float ring=(1.-smoothstep(r*.95,r*1.8,dd))*(.55+.45*rwN(dv*3.+vec2(0.,-2.*uTime)));
   float wake=step(0.,dv.y)*exp(-abs(dv.x)/(r*.8))*exp(-dv.y/(r*(5.+3.*vSp)))*smoothstep(.3,.7,rwN(vec2(dv.x*2.,dv.y*.6-uTime*vSp*1.2)));
   rk=max(rk,max(ring,wake));g+=dv/max(dd,.01)*(1.-smoothstep(r,r*1.6,dd))*.45;}}
 foam=clamp(foam+rk,0.,1.);
 float dep=smoothstep(.3,-4.5,rvd);
 vec3 deepC=mix(vec3(.005,.028,.032),vec3(.06,.046,.026),tb);
 vec3 bed=mix(vec3(.11,.12,.09)*(.65+.6*(rwN(p*2.2)*.6+rwN(p*6.5)*.4)),vec3(.15,.115,.065),tb)*.5;bed=mix(bed,deepC,.3);
 vec3 col=mix(bed,deepC,dep);col=mix(col,mix(vec3(.6,.62,.6),vec3(.5,.45,.36),tb),foam*.85);
 rvAlb=col;rvRough=mix(.035+.04*tb,.55,foam);rvG=g*(1.-foam*.6);}`;
function rvMatF(){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.05,metalness:0,envMapIntensity:1.15,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uTime:U.uTime,uWetG:U.uWetG,tRiv:U.tRiv});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aRv;attribute vec2 aTn;attribute float aSp;varying vec4 vRv;varying vec2 vTn;varying float vSp;varying vec3 vWP;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvRv=aRv;vTn=aTn;vSp=aSp;vWP=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+RW_GLSL+RV_F)
   .replace('#include <color_fragment>','#include <color_fragment>\nriverShade();diffuseColor.rgb=rvAlb;')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=rvRough;')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n{vec2 T=normalize(vTn+vec2(1e-5,0.));vec2 N=vec2(-T.y,T.x);vec2 gw=T*rvG.y+N*rvG.x;normal=normalize((viewMatrix*vec4(-gw.x,1.,-gw.y,0.)).xyz)*faceDirection;}').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n{vec3 rr=reflect(-geometry.viewDir,geometry.normal);vec3 rw=(vec4(rr,0.)*viewMatrix).xyz;float sky=smoothstep(.02,.3,rw.y);reflectedLight.indirectSpecular=mix(vec3(.025,.04,.03),reflectedLight.indirectSpecular*.65,sky);}');};
 m.customProgramCacheKey=()=>'river';return m;}
// ---------- oggetti lungo i fiumi: massi nel letto (con la loro schiuma), canneti, sassi e tronchi sulle rive ----------
function reedAssets(){if(reedAssets.v)return reedAssets.v;const c=document.createElement('canvas');c.width=128;c.height=256;const q=c.getContext('2d');
 for(let i=0;i<46;i++){const x=10+Math.random()*108,h=120+Math.random()*130,bend=(Math.random()-.5)*30;q.strokeStyle=Math.random()<.3?'#7d7a42':(Math.random()<.5?'#4f6b2a':'#3d5a22');q.lineWidth=2+Math.random()*2.5;q.beginPath();q.moveTo(x,256);q.quadraticCurveTo(x+bend*.3,256-h*.6,x+bend,256-h);q.stroke();
  if(i%7===0){q.fillStyle='#4a2f1a';q.fillRect(x+bend-3,256-h-4,7,26);}}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const a=new THREE.PlaneGeometry(1.3,1.6).translate(0,.8,0),b=a.clone().rotateY(Math.PI/3),d=a.clone().rotateY(-Math.PI/3),B2=Bin();B2.add(a).add(b).add(d);const geo=mergeBin(B2),Nn=geo.attributes.normal;for(let i=0;i<Nn.count;i++)Nn.setXYZ(i,0,1,0);
 return reedAssets.v={geo,mat:new THREE.MeshStandardMaterial({map:t,alphaTest:.45,side:THREE.DoubleSide,roughness:.85})};}
function rockGeo(seed){const G=new THREE.IcosahedronGeometry(1,1),P=G.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),f=.78+.32*rwHj(x*7.3+y*3.1+seed,z*5.7-y*2.3+seed*2);P.setXYZ(i,x*f*1.15,y*f*.78,z*f);}G.computeVertexNormals();return G;}
function rvProps(){const rocks=[],reeds=[],stones=[],logs=[];
 for(let ri=0;ri<RIVERS.length;ri++){const R=RIVERS[ri],P=R.P,S=R.S;
  const at=(sc)=>{const i=P.findIndex(p=>p.s>sc);if(i<1)return null;const a=P[i-1],b=P[i],t=(sc-a.s)/(b.s-a.s),dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;return {x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),y:lerp(a.y,b.y,t),w:lerp(a.w,b.w,t),nx:-dz/l,nz:dx/l,ok:!a.lake&&!b.lake&&a.y>-1.45&&b.y>-1.45};};
  for(let c=0;c*22<S;c++){if(rwEj(c,ri*17+3)>=.3)continue;const u=rwEj(c*3+1,ri*5+11),r=.5+1.1*rwEj(c*7+2,ri+29),sc=c*22+4+rwEj(c*5+7,ri*3+1)*14,q=at(sc);if(!q||!q.ok)continue;const ac=(u-.5)*q.w*1.5;
   rocks.push([q.x+q.nx*ac,q.y-r*.36,q.z+q.nz*ac,r,rwEj(c,ri+3)*TAU]);}
  for(let sc=10;sc<S-10;sc+=3.2)for(const sd of[-1,1]){const q=at(sc);if(!q||!q.ok)continue;const off=.2+2.6*rwHj(sc*.37,sd+ri*5),dd=q.w+1.875+off,x=q.x+q.nx*dd*sd,z=q.z+q.nz*dd*sd,bn=rwNj(x*.045+9,z*.045+9),h=worldH(x,z);if(h<q.y-.05)continue;
   if(bn<.42&&rwHj(x*.7,z*.7)<.55)reeds.push([x,h-.05,z,rwHj(x,z)*TAU,.75+.6*rwHj(z,x)]);
   else if(bn>.62&&rwHj(x*1.3,z*.9)<.09)stones.push([x,h-.12,z,.25+.55*rwHj(x*3.1,z),rwHj(z*1.7,x)*TAU]);
   if(rwHj(sc*.013+ri,sd*3)<.0085)logs.push([x,h+.2,z,rwHj(x*2,z)*TAU,4+5*rwHj(z*2,x)]);}}
 const rm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.82,metalness:0,flatShading:true});
 const sR=(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[4],0);d.scale.set(q[3],q[3],q[3]);};
 tiledInst(rockGeo(1),rm,rocks,{tile:600,far:1500,cast:true,set:sR,colors:(q,i)=>new THREE.Color(.36+.08*rwHj(q[0],1),.34+.06*rwHj(q[2],2),.3+.05*rwHj(q[0]+q[2],3))});
 tiledInst(rockGeo(7),rm,stones,{tile:500,far:650,cast:true,set:sR,colors:(q,i)=>new THREE.Color(.42+.1*rwHj(q[0],4),.4+.08*rwHj(q[2],5),.36+.06*rwHj(q[0]+q[2],6))});
 if(reeds.length){const A=reedAssets();tiledInst(A.geo,A.mat,reeds,{tile:300,far:350,set:(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(q[4],q[4],q[4]);}});}
 if(logs.length){const B=Bin(),bark=C3(0x4a3a2a);cCyl(B,.32,1,0,0,0,bark,0,Math.PI/2,10);B.add(cGeo(new THREE.CylinderGeometry(.12,.16,.9,7),bark),.2,.25,0,.4,0,1.1);
  tiledInst(mergeBin(B),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9}),logs,{tile:800,far:900,cast:true,set:(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(q[4],1,1);}});}
 RVX.n=[rocks.length,reeds.length,stones.length,logs.length];}
const RVX={mat:null,n:null};
// ---------- acque interne: laghi come prima, fiumi con il loro materiale e gli oggetti lungo le rive ----------
buildWorldWater=function(){RVX.mat=rvMatF();
 for(const L of LAKES){const g=new THREE.CircleGeometry(L.r*1.78,96).rotateX(-Math.PI/2),n=g.attributes.position.count,rv=new Float32Array(n*4),tn=new Float32Array(n*2),sp=new Float32Array(n);for(let i=0;i<n;i++){rv[i*4+1]=-5000;rv[i*4+2]=50;rv[i*4+3]=9;tn[i*2+1]=1;}
  g.setAttribute('aRv',new THREE.BufferAttribute(rv,4));g.setAttribute('aTn',new THREE.BufferAttribute(tn,2));g.setAttribute('aSp',new THREE.BufferAttribute(sp,1));const m=new THREE.Mesh(g,RVX.lakeMat||(RVX.lakeMat=(()=>{const q=rvMatF();q.polygonOffset=false;return q;})()));m.position.set(L.x,L.lv,L.z);m.receiveShadow=true;scene.add(m);}const COLS=[-1,-.82,-.6,-.32,0,.32,.6,.82,1];
 for(let ri=0;ri<RIVERS.length;ri++){const R=RIVERS[ri];let seg=[];
  const flush=()=>{if(seg.length>2){const n=seg.length,C=COLS.length,pos=new Float32Array(n*C*3),rv=new Float32Array(n*C*4),tn=new Float32Array(n*C*2),sp=new Float32Array(n*C),idx=[];
    seg.forEach((p,i)=>{const a=seg[Math.max(0,i-1)],b=seg[Math.min(n-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,tx=dx/l,tz=dz/l;
     for(let c=0;c<C;c++){const o=COLS[c]*(p.w+3),k=i*C+c;pos[k*3]=p.x-tz*o;pos[k*3+1]=p.y;pos[k*3+2]=p.z+tx*o;rv[k*4]=o;rv[k*4+1]=p.s;rv[k*4+2]=p.w;rv[k*4+3]=ri;tn[k*2]=tx;tn[k*2+1]=tz;sp[k]=p.v0;}});
    for(let i=0;i<n-1;i++)for(let c=0;c<C-1;c++){const a=i*C+c,b=a+C;idx.push(a,a+1,b,a+1,b+1,b);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aRv',new THREE.BufferAttribute(rv,4));g.setAttribute('aTn',new THREE.BufferAttribute(tn,2));g.setAttribute('aSp',new THREE.BufferAttribute(sp,1));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
    const m=new THREE.Mesh(g,RVX.mat);m.receiveShadow=true;scene.add(m);}seg=[];};
  for(const p of R.P){if(p.lake||p.y<=-1.45)flush();else seg.push(p);}flush();}
 rvProps();};
// la corrente trascina chi nuota
{const ps0=playerStep;playerStep=function(dt){ps0(dt);const P=player;if(P.mode==='walk'&&P.swim&&!P.fly){const f=rvFlow(P.x,P.z);P.x+=f[0]*dt*.85;P.z+=f[1]*dt*.85;}};}
