/* ======================= PATCH AB — LAGO DEL PARCO ======================= */
// Prima: nel lago del parco si vedeva il mare di tutta la mappa dentro la buca (grigio, piatto, senza riflessi) e per la
// fisica l'acqua non c'era (si camminava sul fondo, i colpi non facevano spruzzi).
// Ora il lago ha una superficie sua, alla quota del mare (segue mareggiate e allagamenti):
// - colore di un laghetto di città (verde-bruno, un po' torbido), il fondale si vede dove l'acqua è bassa: la profondità
//   viene dalla forma vera della conca, quindi la riva sfuma invece di tagliare il prato con una linea dritta;
// - trasparenza fisica: il riflesso di superficie (Fresnel) resta anche dove l'acqua è bassa, il corpo dell'acqua copre il
//   fondale secondo la profondità;
// - increspature del vento (onde corte che vanno nel verso del vento, più forti a chiazze che scorrono) e anelli di pioggia;
// - riflesso vero della città, degli alberi e del cielo (lo stesso riflesso planare del mare e dei fiumi);
// - per la fisica è acqua: si nuota, si galleggia, i colpi fanno spruzzi e le esplosioni sono subacquee;
// - riva: prato fino a pochi centimetri dall'acqua, striscia di terra bagnata, canneti a gruppi, ninfee con qualche fiore,
//   massi sul bordo.
const PKL={mesh:null,pads:null,flw:null,y:-99,uLv:{value:-1.5},uRain:{value:0},uWv:{value:new THREE.Vector2(1,0)}};
function pkLakeLd(x,z){return Math.hypot(x/58,(z+430)/74);}
// quota del pelo dell'acqua del lago in (x,z), oppure -1e9 se lì non c'è lago
function pkLakeAt(x,z){if(Math.abs(x)>80||z<-530||z>-330)return -1e9;if(pkLakeLd(x,z)>1.25||waterLevel>.1)return -1e9;if(parkH(x,z)>=waterLevel)return -1e9;return waterLevel;}
{const wa=waterAt;waterAt=function(x,z){const w=wa(x,z);const l=pkLakeAt(x,z);if(l>-1e8){const r=(typeof waveH==='function'?waveH(x,z)*.06:0);return Math.max(w,l+r);}return w;};}
// il riflesso planare sceglie il lago quando è l'acqua vicina
// (solo se il lago è nell'inquadratura: altrimenti il secondo disegno della scena non serve)
const _pkF=new THREE.Frustum(),_pkM=new THREE.Matrix4(),_pkS=new THREE.Sphere(new THREE.Vector3(0,-1.5,-430),95);
{const pp=prefPlane;prefPlane=function(){const h=pp();const c=camera.position;if(!PKL.mesh||waterLevel>.1||Math.abs(c.x)>PX||Math.abs(c.z)>PZ)return h;const d=Math.max(0,pkLakeLd(c.x,c.z)-1.1)*62;
  if(d<300&&(!PREF.near||d<70)){_pkM.copy(camera.matrixWorld).invert().premultiply(camera.projectionMatrix);_pkF.setFromProjectionMatrix(_pkM);if(!_pkF.intersectsSphere(_pkS))return h;PREF.near=true;return waterLevel;}return h;};}
const PKL_GLSL=`uniform float uTime;uniform float uLv;uniform float uRain;uniform vec2 uWv;varying vec3 vWP;
vec3 pkAlb;float pkRough;vec2 pkG;float pkA;float pkEdge;
float pkH21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float pkN(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(pkH21(i),pkH21(i+vec2(1.,0.)),u.x),mix(pkH21(i+vec2(0.,1.)),pkH21(i+vec2(1.,1.)),u.x),u.y);}
float pkBed(vec2 p){float ex=min(p.x+121.,121.-p.x),ez=min(p.y+573.,-99.-p.y);if(ex<0.||ez<0.)return .2;float edge=min(1.,min(ex,ez)/25.);
 float h=max(.2,.2+edge*(2.2*sin(p.x*.021+1.3)*sin(p.y*.017+.4)+1.4*sin(p.x*.043-p.y*.031+2.1)+1.6)*.8);float ld=length(vec2(p.x/58.,(p.y+430.)/74.));if(ld<1.25)h=mix(h,-4.2,clamp((1.25-ld)/.35,0.,1.));return h;}
void pkShade(){vec2 p=vWP.xz;float t=uTime;float dist=length(vWP-cameraPosition);float dep=uLv-pkBed(p);
 float ws=length(uWv);vec2 wd=ws>.01?uWv/ws:vec2(1.,0.);float wk=clamp(ws/12.,0.,1.);
 // chiazze di vento che scorrono sul lago (zone più increspate e zone quasi a specchio)
 float cp=smoothstep(.3,.75,pkN(p*.045-wd*t*.6)*.65+pkN(p*.11+wd*t*.25)*.35);
 // onde corte di gravità-capillarità: dispersione vera (c=sqrt(gk+σk³/ρ)), lunghezze da 2,4 m a 12 cm
 vec2 g=vec2(0.);float wl=2.4;
 for(int i=0;i<7;i++){float ang=float(i)*2.39996+.5;vec2 d=normalize(wd*1.4+vec2(cos(ang),sin(ang)));float k=6.2831/wl;float c=sqrt(9.81*k+7.4e-5*k*k*k);
  float A=wl*(.0035+.009*wk)*(.35+.65*cp);float fd=1.-smoothstep(wl*25.,wl*80.,dist);float ph=dot(d,p)*k-c*t+float(i)*1.9;g+=d*k*A*cos(ph)*fd;wl*=.6;}
 // anelli della pioggia (due strati sfalsati)
 if(uRain>.01){for(int L=0;L<2;L++){vec2 q=p*2.3+float(L)*vec2(.37,.71);vec2 c0=floor(q);vec2 f=fract(q)-.5;float r0=pkH21(c0+float(L)*7.13);
   float tt=fract(t*1.15+r0);vec2 off=vec2(pkH21(c0+3.1),pkH21(c0+5.7))-.5;vec2 dv=f-off*.45;float dd=length(dv);float rr=tt*.42;
   float ring=sin((dd-rr)*48.)*exp(-pow((dd-rr)*13.,2.))*(1.-tt)*step(r0,uRain*1.2);g+=dv/max(dd,.001)*ring*.5*uRain*(1.-smoothstep(25.,60.,dist));}}
 pkG=g;
 // colore del corpo dell'acqua: laghetto di città, verde-bruno e un po' torbido, a chiazze lente
 float tb=pkN(p*.018+3.)*.6+pkN(p*.07-t*.01)*.4;
 pkAlb=mix(vec3(.010,.026,.018),vec3(.022,.034,.016),tb);
 // velo di polline e foglioline sottovento vicino alla riva
 float sh=smoothstep(.0,.1,dep)*(1.-smoothstep(.15,.9,dep))*smoothstep(.55,.8,pkN(p*.35+wd*2.))*(.4+.6*smoothstep(-.2,.6,dot(normalize(p-vec2(0.,-430.)+vec2(.001,0.)),wd)));
 pkAlb=mix(pkAlb,vec3(.09,.085,.045),sh*.6);
 // quanto il corpo dell'acqua copre il fondale (assorbimento e torbidità)
 pkA=1.-exp(-max(dep,0.)*2.2);pkA=max(pkA,sh*.7);
 pkRough=.04+.05*smoothstep(.25,1.,length(g))+sh*.35;
 pkEdge=smoothstep(0.,.07,dep);}`;
// uscita: riflesso di superficie (pesato con Fresnel) + corpo dell'acqua; ciò che resta lascia vedere il fondale vero
const PKL_OUT=`{vec3 vd=normalize(vViewPosition);float ct=clamp(abs(dot(normal,vd)),0.,1.);float F=.02+.98*pow(1.-ct,5.);
 float a=1.-(1.-pkA)*(1.-F);vec3 c=(totalDiffuse*pkA+totalSpecular+totalEmissiveRadiance)/max(a,.02);gl_FragColor=vec4(c,a*pkEdge);}`;
function pkWaterMat(){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.05,metalness:0,envMapIntensity:1.1,transparent:true,depthWrite:true,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uTime:U.uTime,uLv:PKL.uLv,uRain:PKL.uRain,uWv:PKL.uWv});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>','#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+PKL_GLSL)
   .replace('#include <color_fragment>','#include <color_fragment>\npkShade();diffuseColor.rgb=pkAlb;')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=pkRough;')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize((viewMatrix*vec4(normalize(vec3(-pkG.x,1.,-pkG.y)),0.)).xyz)*faceDirection;')
   .replace('#include <output_fragment>',PKL_OUT);};
 m.customProgramCacheKey=()=>'pklake';return prefInject(m);}
// riva: distanza "ellittica" della riva in una direzione (dove il terreno scende sotto il pelo dell'acqua + dh)
function pkShoreLd(th,dh){const c=Math.cos(th),s=Math.sin(th);let a=.6,b=1.25;for(let i=0;i<22;i++){const m=(a+b)/2;if(parkH(c*58*m,-430+s*74*m)<-1.5+dh)a=m;else b=m;}return (a+b)/2;}
function pkPt(th,ld){return [Math.cos(th)*58*ld,-430+Math.sin(th)*74*ld];}
// ---------- canneti veri (anche lungo i fiumi): foglie nastriformi curve e spighe di tifa, mossi dal vento ----------
// Prima erano tre pannelli piatti con un disegno: da vicino sembravano rettangoli scuri a strisce.
reedAssets=function(){if(reedAssets.v3)return reedAssets.v3;const R=trRnd(777),P=[],N=[],C=[],I=[];let vi=0;
 const leaf=(az,len,w,tilt,bend,dry)=>{const ca=Math.cos(az),sa=Math.sin(az),S=4;const c0=dry?[.13,.1,.045]:[.03,.055,.018],c1=dry?[.3,.25,.12]:[.14,.17,.05];
  for(let k=0;k<=S;k++){const t=k/S,a=tilt+bend*t*t,r=Math.sin(a)*len*t*.9,y=Math.cos(a)*len*t,hw=w*(1-t*.92)*.5,px=ca*r,pz=sa*r,tx=-sa*hw,tz=ca*hw;
   const nx=ca*.55,ny=.8,nz=sa*.55,cc=[c0[0]+(c1[0]-c0[0])*t,c0[1]+(c1[1]-c0[1])*t,c0[2]+(c1[2]-c0[2])*t];
   P.push(px-tx,y,pz-tz,px+tx,y,pz+tz);N.push(nx,ny,nz,nx,ny,nz);C.push(...cc,...cc);
   if(k<S){const a0=vi+k*2;I.push(a0,a0+1,a0+3,a0,a0+3,a0+2);}}vi+=(S+1)*2;};
 for(let i=0;i<13;i++){const az=R()*6.2832,dry=R()<.15;leaf(az,.85+R()*.9,.026+R()*.016,.05+R()*.22,.15+R()*.55,dry);}
 // spighe di tifa: stelo sottile, spiga bruna, punta
 const cyl=(x,z,y0,y1,r,col,seg)=>{for(let k=0;k<=1;k++)for(let j=0;j<=seg;j++){const a=j/seg*6.2832,y=k?y1:y0;P.push(x+Math.cos(a)*r,y,z+Math.sin(a)*r);N.push(Math.cos(a),0,Math.sin(a));C.push(...col);}
  for(let j=0;j<seg;j++){const a=vi+j,b=vi+seg+1+j;I.push(a,b,a+1,a+1,b,b+1);}vi+=(seg+1)*2;};
 for(let i=0;i<3;i++){const x=(R()-.5)*.25,z=(R()-.5)*.25,h=1.35+R()*.5;cyl(x,z,0,h,.0055,[.06,.07,.025],4);cyl(x,z,h-.24,h-.06,.017,[.085,.05,.022],6);cyl(x,z,h-.06,h+.09,.003,[.12,.11,.06],3);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:0,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\n{float hh=max(position.y,0.);vec3 ip=vec3(0.);\n#ifdef USE_INSTANCING\nip=instanceMatrix[3].xyz;\n#endif\nfloat ph=uTime*1.7+ip.x*.37+ip.z*.29;float sw=(sin(ph)+.4*sin(ph*2.3+1.))*.05*hh*hh;transformed.x+=sw;transformed.z+=sw*.6+.02*sin(ph*1.3+position.x*9.)*hh;}');};
 m.customProgramCacheKey=()=>'reed3d';return reedAssets.v3={geo:g,mat:m};};
function pkBuild(){if(PKL.mesh)return;const R=trRnd(4242);
 // superficie
 const g=new THREE.CircleGeometry(1,160).rotateX(-Math.PI/2).scale(58*1.26,1,74*1.26);const m=new THREE.Mesh(g,pkWaterMat());m.position.set(0,-1.5,-430);m.receiveShadow=true;m.castShadow=false;m.renderOrder=2;scene.add(m);PKL.mesh=m;
 // ninfee: foglie tonde con l'intaglio, a gruppi dove l'acqua è profonda 0,4-1,4 m; qualche fiore bianco o rosa
 const padG=new THREE.CircleGeometry(1,18,.17,Math.PI*2-.34).rotateX(-Math.PI/2);{const P=padG.attributes.position;for(let i=0;i<P.count;i++){const r=Math.hypot(P.getX(i),P.getZ(i));P.setY(i,r*r*.05);}padG.computeVertexNormals();}
 const pads=[],fl=[];for(let c=0;c<15;c++){const th=R()*6.2832,dh=-(.45+R()*.9),ld=pkShoreLd(th,dh),[cx,cz]=pkPt(th,ld),n=8+Math.floor(R()*18),sp=1.2+R()*2.4;
  for(let k=0;k<n;k++){const a=R()*6.2832,r=Math.sqrt(R())*sp,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(parkH(x,z)>-1.85)continue;const s=.13+R()*.17;pads.push([x,z,s,R()*6.2832,R()]);if(R()<.09)fl.push([x+(R()-.5)*s,z+(R()-.5)*s,.8+R()*.5,R()<.6?0:1]);}}
 if(pads.length){const pm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:0});const im=new THREE.InstancedMesh(padG,pm,pads.length);const o=new THREE.Object3D(),col=new THREE.Color();
  pads.forEach((q,i)=>{o.position.set(q[0],.012,q[1]+430);o.rotation.set(0,q[3],0);o.scale.set(q[2],1,q[2]);o.updateMatrix();im.setMatrixAt(i,o.matrix);col.setRGB(.035+.03*q[4],.075+.045*q[4],.018+.01*q[4]);if(q[4]>.9)col.setRGB(.09,.07,.025);im.setColorAt(i,col);});
  im.position.set(0,-1.5,-430);im.receiveShadow=true;im.castShadow=false;im.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,0,0),100);scene.add(im);PKL.pads=im;}
 if(fl.length){const B=[];const pet=new THREE.LatheGeometry([[0,0],[.03,.004],[.055,.022],[.062,.045],[.05,.06]].map(p=>new THREE.Vector2(p[0],p[1])),9);B.push(colorize(pet,1,1,1));B.push(colorize(new THREE.SphereGeometry(.018,8,6).translate(0,.02,0),1.,.75,.1));
  const fg=mergeGeos(B),fm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,side:THREE.DoubleSide});const im=new THREE.InstancedMesh(fg,fm,fl.length);const o=new THREE.Object3D(),col=new THREE.Color();
  fl.forEach((q,i)=>{o.position.set(q[0],.01,q[1]+430);o.rotation.set(0,R()*6.28,0);o.scale.setScalar(q[2]);o.updateMatrix();im.setMatrixAt(i,o.matrix);col.setRGB(q[3]?.95:.92,q[3]?.62:.9,q[3]?.72:.86);im.setColorAt(i,col);});
  im.position.set(0,-1.5,-430);im.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,0,0),100);scene.add(im);PKL.flw=im;}
 // canneti a gruppi sulla riva (metà nell'acqua bassa, metà sulla terra bagnata)
 try{const A=reedAssets(),rd=[];for(let c=0;c<22;c++){const th=R()*6.2832,n=4+Math.floor(R()*9);for(let k=0;k<n;k++){const t2=th+(R()-.5)*.09,ld=pkShoreLd(t2,(R()-.6)*.5),[x,z]=pkPt(t2,ld);const y=parkH(x,z);rd.push([x,Math.min(y,-1.5)-.05,z,R()*6.28,.75+R()*.7]);}}
  const im=new THREE.InstancedMesh(A.geo,A.mat,rd.length);const o=new THREE.Object3D();rd.forEach((q,i)=>{o.position.set(q[0],q[1],q[2]);o.rotation.set(0,q[3],0);o.scale.setScalar(q[4]);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
  im.receiveShadow=true;im.castShadow=false;im.geometry=im.geometry.clone();im.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,-1.5,-430),110);scene.add(im);}catch(e){console.warn('canneti del lago',e);}
 // massi sul bordo, in parte nell'acqua
 try{const rk=[];for(let c=0;c<18;c++){const th=R()*6.2832,ld=pkShoreLd(th,(R()-.5)*.6),[x,z]=pkPt(th,ld),s=.35+R()*.6;rk.push([x,parkH(x,z)-s*.25,z,s,R()*6.28,R()]);}
  const rg=new THREE.IcosahedronGeometry(1,2);{const Q=rg.attributes.position;for(let i=0;i<Q.count;i++){const x=Q.getX(i),y=Q.getY(i),z=Q.getZ(i),f=.8+.28*rwHj(x*3.1+y*1.7,z*2.9-y*1.3)+.08*rwHj(x*9.,z*9.+y*5.);Q.setXYZ(i,x*f,y*f*.72,z*f);}rg.computeVertexNormals();}const rm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92});const im=new THREE.InstancedMesh(rg,rm,rk.length);const o=new THREE.Object3D(),col=new THREE.Color();
  rk.forEach((q,i)=>{o.position.set(q[0],q[1],q[2]);o.rotation.set(R()*.4,q[4],R()*.4);o.scale.set(q[3]*1.2,q[3]*.8,q[3]);o.updateMatrix();im.setMatrixAt(i,o.matrix);const v=.055+.045*q[5];col.setRGB(v*1.05,v,v*.88);im.setColorAt(i,col);});
  im.castShadow=true;im.receiveShadow=true;im.geometry=im.geometry.clone();im.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,-1.5,-430),110);scene.add(im);}catch(e){console.warn('massi del lago',e);}}
{const bw=buildWorld;buildWorld=function(){bw();try{pkBuild();}catch(e){console.warn('lago del parco',e);}};}
// ogni fotogramma: quota (segue il mare), vento e pioggia
function pkStep(){if(!PKL.mesh)return;const on=waterLevel<.1;PKL.mesh.visible=on;if(PKL.pads)PKL.pads.visible=on;if(PKL.flw)PKL.flw.visible=on;
 if(PKL.y!==waterLevel){PKL.y=waterLevel;PKL.mesh.position.y=waterLevel;PKL.uLv.value=waterLevel;if(PKL.pads)PKL.pads.position.y=waterLevel;if(PKL.flw)PKL.flw.position.y=waterLevel;}
 PKL.uWv.value.set(WX.wx||3,WX.wz||1);
 PKL.uRain.value=(typeof WX!=='undefined'&&WX.rain)?Math.min(1,WX.rain):0;}
{const fu=frameUpdate;frameUpdate=function(dt){fu(dt);try{pkStep();}catch(e){}};}
