/* ======================= PATCH AB — LASER: RAGGIO VERO, PUNTO FUSO, TAGLI CHE SI RAFFREDDANO ======================= */
// Prima: due cilindri verdi sovrapposti (si vedevano le facce) e qualche scintilla.
// Ora:
// - il raggio è una lama di luce sempre rivolta alla telecamera: nucleo bianco-verde accecante con profilo gaussiano,
//   alone che sfuma, impulsi di energia che corrono lungo il raggio, tremolio;
// - all'uscita dal dispositivo un bagliore con la sua luce sulla mano;
// - dove colpisce: punto fuso bianco-giallo che pulsa, alone di calore, scintille e gocce di metallo fuso che cadono e
//   rimbalzano, fumo che sale;
// - il raggio lascia sulla superficie un taglio incandescente che si raffredda come il metallo vero (bianco → giallo →
//   arancio → rosso → nero) e resta come bruciatura.
const LZ={dec:null,n:0,cap:260,lastX:1e9,lastY:0,lastZ:0,t:0};
const LZ_V=`attribute vec2 aQ;varying vec2 vQ;varying float vLen;void main(){vec3 o=(modelMatrix*vec4(0.,0.,0.,1.)).xyz,e=(modelMatrix*vec4(0.,0.,1.,1.)).xyz,ax=e-o;float L=length(ax);vec3 d=ax/max(L,1e-4);
 vec3 p=o+ax*aQ.y;vec3 tc=normalize(cameraPosition-p);vec3 sd=normalize(cross(d,tc)+vec3(1e-5));float w=length(modelMatrix[0].xyz);p+=sd*aQ.x*w;vQ=aQ;vLen=L;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`;
const LZ_CF=`uniform float uT;uniform vec3 uCol;uniform float uI;varying vec2 vQ;varying float vLen;
void main(){float x=vQ.x,g=exp(-x*x*7.),gc=exp(-x*x*40.),z=vQ.y*vLen;float flow=.82+.18*sin(z*2.4-uT*70.)+.1*sin(z*.7-uT*23.);float fl=.92+.08*sin(uT*91.);
 float st=smoothstep(0.,.25,z)*(1.-smoothstep(vLen-.05,vLen,z)+smoothstep(vLen-.05,vLen,z)*.6);vec3 c=(uCol*g*flow+vec3(1.,1.,.95)*gc*1.6)*uI*fl*st;gl_FragColor=vec4(c,1.);}`;
const LZ_GF=`uniform float uT;uniform vec3 uCol;uniform float uI;varying vec2 vQ;varying float vLen;float h1(float n){return fract(sin(n)*43758.5453);}
void main(){float x=vQ.x,z=vQ.y*vLen,g=exp(-x*x*3.2);float n=.75+.25*sin(z*.9-uT*31.+sin(z*.31+uT*7.)*2.)+.1*(h1(floor(z*3.-uT*40.))-.5);vec3 c=uCol*g*n*uI*smoothstep(0.,.4,z);gl_FragColor=vec4(c,1.);}`;
// bagliori puntiformi (uscita e punto fuso)
const LZ_SV='varying vec2 vU;void main(){vU=uv*2.-1.;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);mv.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));gl_Position=projectionMatrix*mv;}';
const LZ_SF='uniform vec3 uCol;uniform float uI;uniform float uT;varying vec2 vU;void main(){float r=length(vU),a=atan(vU.y,vU.x);float g=exp(-r*r*9.)+.35*exp(-r*r*2.2)+.12*exp(-r*1.6)*(.6+.4*sin(a*7.+uT*30.));vec3 c=mix(uCol,vec3(1.),exp(-r*r*30.))*g*uI;gl_FragColor=vec4(c,1.);}';
// tagli e bruciature che si raffreddano
const LZ_DV='attribute float aB;attribute float aS;uniform float uT;varying vec2 vU;varying float vAge;varying float vS;void main(){vU=uv;vAge=uT-aB;vS=aS;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}';
const LZ_DF=`varying vec2 vU;varying float vAge;varying float vS;
vec3 bb(float t){return clamp(vec3(1.,.35+.65*smoothstep(.25,.85,t),.08+.92*smoothstep(.7,1.,t))*smoothstep(0.,.35,t)*(.3+t*t*3.),0.,9.);}
void main(){float r=length(vU-.5)*2.;if(r>1.)discard;float h=exp(-vAge*.85)*(1.-smoothstep(0.,.75,r));float ed=(1.-smoothstep(.5,1.,r))*(1.-smoothstep(18.,28.,vAge));
 vec3 e=bb(h)*5.*h;float soot=ed*.85;gl_FragColor=vec4(mix(vec3(.018,.015,.013),vec3(0.),.0)+e,max(soot,min(1.,h*2.)));}`;
{const ml0=makeLaser;makeLaser=function(){ml0();try{lzBuild();}catch(e){console.warn('laser nuovo',e);}};}
function lzBuild(){const qg=new THREE.BufferGeometry();qg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0,0,0,1,0,0,1],3));qg.setAttribute('aQ',new THREE.Float32BufferAttribute([-1,0,1,0,1,1,-1,1],2));qg.setIndex([0,1,2,0,2,3]);
 LZ.uT={value:0};const add={transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide};
 laser.core.geometry=qg;laser.core.material=new THREE.ShaderMaterial(Object.assign({uniforms:{uT:LZ.uT,uCol:{value:new THREE.Color(1.6,5.5,2.1)},uI:{value:1.6}},vertexShader:LZ_V,fragmentShader:LZ_CF},add));
 laser.glow.geometry=qg;laser.glow.material=new THREE.ShaderMaterial(Object.assign({uniforms:{uT:LZ.uT,uCol:{value:new THREE.Color(.25,1.5,.45)},uI:{value:.9}},vertexShader:LZ_V,fragmentShader:LZ_GF},add));
 const sq=new THREE.PlaneGeometry(1,1),sm=(c,i)=>new THREE.ShaderMaterial(Object.assign({uniforms:{uT:LZ.uT,uCol:{value:c},uI:{value:i}},vertexShader:LZ_SV,fragmentShader:LZ_SF},add));
 LZ.muz=new THREE.Mesh(sq,sm(new THREE.Color(.6,3.2,1.),1.2));LZ.hot=new THREE.Mesh(sq,sm(new THREE.Color(3.2,1.6,.45),1.4));
 for(const m of[LZ.muz,LZ.hot]){m.frustumCulled=false;m.visible=false;m.layers.set(1);m.renderOrder=5;scene.add(m);}
 const dg=new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1,1));const aB=new Float32Array(LZ.cap).fill(-1e5),aS=new Float32Array(LZ.cap);
 dg.setAttribute('aB',new THREE.InstancedBufferAttribute(aB,1));dg.setAttribute('aS',new THREE.InstancedBufferAttribute(aS,1));
 const dm=new THREE.ShaderMaterial({uniforms:{uT:LZ.uT},vertexShader:LZ_DV,fragmentShader:LZ_DF,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 const im=new THREE.InstancedMesh(dg,dm,LZ.cap);im.frustumCulled=false;im.count=LZ.cap;for(let i=0;i<LZ.cap;i++)im.setMatrixAt(i,_m0);scene.add(im);LZ.dec=im;}
const _lzo=new THREE.Object3D(),_lzn=new THREE.Vector3();
function lzDecal(x,y,z,nx,ny,nz,s){const im=LZ.dec;if(!im)return;const i=LZ.n++%LZ.cap;_lzn.set(nx,ny,nz).normalize();_lzo.position.set(x+_lzn.x*.02,y+_lzn.y*.02,z+_lzn.z*.02);_lzo.lookAt(x+_lzn.x,y+_lzn.y,z+_lzn.z);_lzo.rotateZ(Math.random()*6.28);_lzo.scale.set(s,s,s);_lzo.updateMatrix();
 im.setMatrixAt(i,_lzo.matrix);im.instanceMatrix.needsUpdate=true;const g=im.geometry;g.attributes.aB.array[i]=LZ.uT.value;g.attributes.aS.array[i]=s;g.attributes.aB.needsUpdate=true;g.attributes.aS.needsUpdate=true;}
{const lt0=laserTick;laserTick=function(dt){lt0(dt);if(!LZ.muz)return;LZ.uT.value=U.uTime.value;const o=handPos(),h=AIM;
 LZ.muz.visible=true;LZ.muz.position.copy(o);const ms=.22+.06*Math.sin(LZ.uT.value*47.);LZ.muz.scale.set(ms,ms,1);
 if(!h.kind){LZ.hot.visible=false;LZ.lastX=1e9;return;}
 LZ.hot.visible=true;LZ.hot.position.set(h.x+h.nx*.08,h.y+h.ny*.08,h.z+h.nz*.08);const hs=.55+.2*Math.sin(LZ.uT.value*33.)+Math.random()*.15;LZ.hot.scale.set(hs,hs,1);
 // taglio: una bruciatura ogni ~5 cm di spostamento o 60 ms
 LZ.t+=dt;const mv=Math.hypot(h.x-LZ.lastX,h.y-LZ.lastY,h.z-LZ.lastZ);if(mv>.05||LZ.t>.06){LZ.t=0;LZ.lastX=h.x;LZ.lastY=h.y;LZ.lastZ=h.z;lzDecal(h.x,h.y,h.z,h.nx,h.ny,h.nz,.22+Math.random()*.12);}
 // gocce di metallo fuso (cadono, rimbalzano, si spengono) e scintille più vive
 if(psF&&Math.random()<dt*28){const c=Math.random();psF.spawn(h.x+h.nx*.05,h.y+h.ny*.05,h.z+h.nz*.05,h.nx*rand(.5,2)+rand(-1,1),h.ny*rand(.5,2)+rand(-.5,1.5),h.nz*rand(.5,2)+rand(-1,1),rand(.6,1.4),.05,.03,6+c*2,3.4+c,1.2,1,.2,9.8,6);}}}
{const ls0=laserStop;laserStop=function(){ls0();if(LZ.muz){LZ.muz.visible=false;LZ.hot.visible=false;}LZ.lastX=1e9;};}
{const fu0=frameUpdate;frameUpdate=function(dt){fu0(dt);if(LZ.dec)LZ.uT.value=U.uTime.value;};}
