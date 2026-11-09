/* ======================= PATCH AB — TORNADO: CICLO DI VITA VERO, IMBUTO A DUE STRATI, NUBE DI DETRITI, PEZZI CHE VOLANO ======================= */
// - Nasce dalla nube: l'imbuto di condensazione scende dalla base del temporale fino a toccare terra (prima si vede solo la
//   nube di polvere che gira al suolo), poi matura (cono) e, se è forte, si allarga a "cuneo"; alla fine si assottiglia in
//   una "corda" contorta e inclinata che si spezza e svanisce.
// - Imbuto a due strati: nucleo denso con le striature a spirale che salgono, guaina esterna più leggera e più veloce;
//   la cima resta indietro rispetto alla base (il temporale si muove più lento del suolo spazzato), luce dal lato del sole,
//   controluce sui bordi.
// - Nube di detriti alla base: un muro di polvere e terra che ruota (spruzzi bianchi sull'acqua).
// - Pezzi veri che volano: assi, lamiere, rami e tegole girano attorno all'imbuto salendo, vengono sputati fuori e ricadono.
const TRN={geo:null,sg:null,dg:null};
const TRN_V=`uniform float uT;uniform float uRc;uniform float uH;uniform float uStage;uniform float uLay;uniform vec2 uTilt;varying vec2 vU;varying float vH;varying vec3 vN;varying vec3 vV;
void main(){vU=uv;float h=position.y;vH=h;float st=uStage,rope=clamp(1.-st,0.,1.);
 float pR=.32+.2*h+1.5*pow(h,4.),pC=.5+.3*h+5.4*pow(h,3.1),pW=1.55+1.1*h+4.4*pow(h,2.4),prof=st<1.?mix(pR,pC,st):mix(pC,pW,st-1.);
 float r=uRc*prof*uLay*(.88+.12*sin(h*21.+uT*3.1*uLay)+.05*sin(h*57.-uT*5.));
 vec3 p=vec3(position.x*r,h*uH,position.z*r);
 p.xz+=uTilt*h*h*uH*(1.+rope*.8);
 p.x+=sin(h*3.6+uT*.6)*h*16.*(1.+rope*1.6)+sin(h*9.+uT*1.7)*h*(1.-h)*6.*(1.+rope*2.5);p.z+=cos(h*2.9+uT*.45)*h*11.*(1.+rope*1.6)+sin(h*7.+uT*1.3)*h*(1.-h)*5.*rope;
 vec4 wp=modelMatrix*vec4(p,1.);vN=normalize(vec3(position.x,-.15+.1*h,position.z));vV=normalize(cameraPosition-wp.xyz);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const TRN_F=`uniform float uT;uniform float uS;uniform vec3 uCol;uniform vec3 uDust;uniform vec3 uSun;uniform float uLay;uniform float uLow;uniform float uA;varying vec2 vU;varying float vH;varying vec3 vN;varying vec3 vV;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
void main(){float spd=uLay>1.1?2.8:1.9,sp=vU.x*10.+vH*7.-uT*spd;
 float n=vn(vec2(sp,vH*22.-uT*1.4))*.5+vn(vec2(sp*2.7,vH*61.-uT*2.6))*.3+vn(vec2(sp*7.,vH*140.-uT*4.))*.2;
 float band=.5+.5*sin(vU.x*25.13+vH*40.-uT*7.*spd/1.9);vec3 N=normalize(vN),V=normalize(vV);
 float fac=abs(dot(N,V)),rim=smoothstep(0.,.55,fac);
 // la condensazione scende dalla nube: sotto uLow non c'è ancora (bordo sfrangiato)
 float low=smoothstep(uLow-.04,uLow+.06,vH+(n-.5)*.08);
 float a=(uLay>1.1?.28+.4*smoothstep(.35,.85,n):.5+.5*smoothstep(.2,.75,n))*(.82+.18*band)*rim*uS*uA*smoothstep(1.,.82,vH)*smoothstep(0.,.02,vH)*low;
 float lit=.5+.5*max(0.,dot(N,uSun)),back=pow(clamp(dot(-V,uSun),0.,1.),3.)*(1.-fac)*.8;
 vec3 c=mix(uDust,uCol,smoothstep(.02,.22,vH))*(.6+.55*n)*(lit+back)*mix(.78,1.1,vH);
 gl_FragColor=vec4(c,clamp(a,0.,.96));}`;
// muro di polvere alla base
const TRN_DV=`uniform float uT;uniform float uRc;uniform float uS;varying vec2 vU;varying float vH;varying vec3 vN;varying vec3 vV;
void main(){vU=uv;float h=position.y;vH=h;float r=uRc*(1.6+1.3*h+.4*sin(h*6.+uT*2.))*(1.+.12*sin(atan(position.z,position.x)*5.+uT*3.));
 vec3 p=vec3(position.x*r,h*uRc*(2.6+.9*sin(uT*.7)),position.z*r);vec4 wp=modelMatrix*vec4(p,1.);vN=normalize(vec3(position.x,.3,position.z));vV=normalize(cameraPosition-wp.xyz);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const TRN_DF=`uniform float uT;uniform float uS;uniform vec3 uDust;uniform vec3 uSun;varying vec2 vU;varying float vH;varying vec3 vN;varying vec3 vV;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
void main(){float sp=vU.x*8.-uT*3.4;float n=vn(vec2(sp,vH*6.-uT*.9))*.55+vn(vec2(sp*2.3,vH*15.-uT*1.6))*.3+vn(vec2(sp*5.,vH*31.))*.15;
 float rim=smoothstep(0.,.6,abs(dot(normalize(vN),normalize(vV))));float a=smoothstep(.3,.75,n)*(1.-smoothstep(.35,1.,vH))*smoothstep(0.,.05,vH)*rim*uS*.85;
 vec3 c=uDust*(.55+.6*n)*(.7+.4*max(0.,dot(normalize(vN),uSun)));gl_FragColor=vec4(c,clamp(a,0.,.9));}`;
function trnGeo(){if(TRN.geo)return;TRN.geo=new THREE.CylinderGeometry(1,1,1,64,96,true).translate(0,.5,0);TRN.dg=new THREE.CylinderGeometry(1,1,1,40,16,true).translate(0,.5,0);
 // pezzi: assi, lamiere, tegole, rami (scatole di forme diverse, un solo disegno)
 const B=Bin();B.add(new THREE.BoxGeometry(1,1,1));TRN.pg=mergeBin(B);}
{const st0=spawnTornado;spawnTornado=function(x,z,P){const n0=tornados.length;st0(x,z,P);if(tornados.length===n0)return;const T=tornados[tornados.length-1];try{trnUpgrade(T);}catch(e){console.warn('tornado: imbuto nuovo',e);}};}
function trnUpgrade(T){trnGeo();const u0=T.m.material.uniforms,l=TODC.lit;
 const mk=(lay,A)=>new THREE.ShaderMaterial({uniforms:{uT:u0.uT,uS:u0.uS,uRc:u0.uRc,uH:u0.uH,uCol:u0.uCol,uDust:u0.uDust,uSun:u0.uSun,uStage:T.uStage||(T.uStage={value:.3}),uLay:{value:lay},uTilt:T.uTilt||(T.uTilt={value:new THREE.Vector2()}),uLow:T.uLow||(T.uLow={value:1}),uA:{value:A}},vertexShader:TRN_V,fragmentShader:TRN_F,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 T.m.material.dispose();T.m.geometry=TRN.geo;T.m.material=mk(1,1);
 const o=new THREE.Mesh(TRN.geo,mk(1.32,.7));o.frustumCulled=false;o.layers.set(1);o.renderOrder=1;T.m.add(o);T.outer=o;
 const dm=new THREE.ShaderMaterial({uniforms:{uT:u0.uT,uS:{value:0},uRc:u0.uRc,uDust:u0.uDust,uSun:u0.uSun},vertexShader:TRN_DV,fragmentShader:TRN_DF,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const d=new THREE.Mesh(TRN.dg,dm);d.frustumCulled=false;d.layers.set(1);d.renderOrder=2;T.m.add(d);T.dust=d;
 // pezzi volanti
 const N=QP===PRESETS.bassa?60:(QP===PRESETS.media?110:180),pm=new THREE.MeshStandardMaterial({vertexColors:false,roughness:.85,metalness:.1});const im=new THREE.InstancedMesh(TRN.pg,pm,N);im.frustumCulled=false;im.castShadow=QP!==PRESETS.bassa;
 const cols=[[.25,.18,.11],[.32,.24,.15],[.2,.21,.22],[.45,.42,.38],[.12,.1,.08],[.5,.2,.15],[.18,.22,.12]];T.pc=[];
 for(let i=0;i<N;i++){const k=Math.floor(Math.random()*cols.length),c=cols[k];im.setColorAt(i,new THREE.Color(c[0]*l*1.6,c[1]*l*1.6,c[2]*l*1.6));const sz=Math.random();
  T.pc.push({a:Math.random()*TAU,r:T.Rc*(.6+Math.random()*1.6),y:Math.random()*60,vy:0,out:0,vx:0,vz:0,px:0,pz:0,s:[.3+sz*2.2,.03+Math.random()*.08,.15+Math.random()*.6],rx:Math.random()*6,ry:Math.random()*6,wr:(Math.random()-.5)*8,wy:(Math.random()-.5)*8});}
 scene.add(im);T.pm=im;T.ph0=Math.random();}
const _tnd=new THREE.Object3D(),_tnv=new THREE.Vector2();
{const ut0=updTornados;updTornados=function(dt){ut0(dt);for(const T of tornados){if(!T.uStage)continue;try{trnStep(T,dt);}catch(e){if(!TRN.err){TRN.err=1;console.warn('tornado',e);}}}
 // tornado finiti: via i pezzi volanti
 for(const k of TRN.live||[])if(tornados.indexOf(k)<0){scene.remove(k.pm);k.pm.dispose();}TRN.live=tornados.slice();};}
function trnStep(T,dt){const f=T.age/T.life,P=T.P,ropeT=T.life-T.age;
 // ciclo di vita: discesa dell'imbuto, maturità (cono → cuneo se forte), "corda" finale
 let stage,low;if(T.age<6){low=1-sst(0,6,T.age)*1;stage=.35+T.age/6*.5;}else{low=0;stage=.85+Math.min(1,(T.age-6)/8)*(.15+P*.8);}
 if(ropeT<7){const k=1-ropeT/7;stage=stage*(1-k)+.02*k;}T.uStage.value+=(stage-T.uStage.value)*Math.min(1,dt*1.5);T.uLow.value=low;
 // la cima resta indietro rispetto al moto (inclinazione), di più quando si assottiglia
 const tilt=.12+(1-Math.min(1,T.uStage.value))*.25+(ropeT<7?(1-ropeT/7)*.35:0);_tnv.set(-Math.cos(T.dir),-Math.sin(T.dir)).multiplyScalar(tilt);T.uTilt.value.lerp(_tnv,Math.min(1,dt*.5));
 // muro di polvere: c'è anche prima che l'imbuto tocchi terra (la rotazione al suolo arriva prima della condensazione)
 if(T.dust){const du=T.dust.material.uniforms;du.uS.value=T.s*(T.wsp?.8:1)*Math.min(1,.4+T.age/4);}
 // pezzi volanti: orbitano più veloci vicino all'asse, salgono, vengono sputati fuori e ricadono
 if(T.pm){const by=T.m.position.y,V=T.V*T.s,M=T.pm;let i=0;for(const q of T.pc){
   if(!q.out){const w=V/Math.max(4,q.r);q.a+=w*dt;q.vy+=(V*.35*(T.Rc/q.r)-q.vy)*Math.min(1,dt*.8);q.y+=q.vy*dt*.6;q.r+=(Math.sin(q.a*.7+q.y*.05)*.4)*dt*T.Rc*.1;
     if(q.y>40+P*120||Math.random()<dt*.06){q.out=1;const vt=w*q.r;q.px=Math.cos(q.a)*q.r;q.pz=Math.sin(q.a)*q.r;q.vx=-Math.sin(q.a)*vt*.6+Math.cos(q.a)*12;q.vz=Math.cos(q.a)*vt*.6+Math.sin(q.a)*12;}}
   else{q.vy-=9.8*dt;q.px+=q.vx*dt;q.pz+=q.vz*dt;q.y+=q.vy*dt;q.vx*=1-dt*.3;q.vz*=1-dt*.3;if(q.y<0||T.s<.05){q.out=0;q.y=0;q.vy=0;q.a=Math.random()*TAU;q.r=T.Rc*(.6+Math.random()*1.6);}}
   const x=q.out?q.px:Math.cos(q.a)*q.r,z=q.out?q.pz:Math.sin(q.a)*q.r,sh=T.s>.05?1:0;q.rx+=q.wr*dt;q.ry+=q.wy*dt;
   _tnd.position.set(T.x+x+T.uTilt.value.x*q.y*q.y/300,by+q.y+.2,T.z+z+T.uTilt.value.y*q.y*q.y/300);_tnd.rotation.set(q.rx,q.ry,q.rx*.5);_tnd.scale.set(q.s[0]*sh,q.s[1]*sh,q.s[2]*sh);_tnd.updateMatrix();M.setMatrixAt(i++,_tnd.matrix);}
  M.instanceMatrix.needsUpdate=true;if(M.instanceColor&&!T.pcOk){M.instanceColor.needsUpdate=true;T.pcOk=1;}}}
