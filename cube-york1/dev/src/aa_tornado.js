/* ======================= PATCH AA — TORNADO PIÙ VERO ======================= */
// Prima era un "vaso di vetro" grigio con la bocca aperta in cima. Ora: imbuto di condensazione che si allarga dolcemente
// nella nube a muro (wall cloud) che ruota, sopra il tetto scuro del temporale; strisce che salgono a spirale, bordi morbidi,
// lato in luce e lato in ombra, nube di detriti alla base (polvere, pezzi scuri che orbitano), sull'acqua diventa una tromba
// marina (spruzzi bianchi). Fuori da Manhattan non viene più richiamato verso la città: va per la sua strada e sradica e
// abbatte gli alberi che incontra.
const TOR={geo:null,disc:null};
const TOR_V=`uniform float uT;uniform float uRc;uniform float uH;varying vec2 vU;varying float vH;varying vec3 vN;varying vec3 vV;
void main(){vU=uv;vH=position.y;float h=position.y;
 float r=uRc*(.5+.3*h+5.4*pow(h,3.1))*(.88+.12*sin(h*21.+uT*3.1)+.05*sin(h*57.-uT*5.));
 vec3 p=vec3(position.x*r,h*uH,position.z*r);
 p.x+=sin(h*3.6+uT*.6)*h*16.+sin(h*9.+uT*1.7)*h*(1.-h)*6.;p.z+=cos(h*2.9+uT*.45)*h*11.;
 vec4 wp=modelMatrix*vec4(p,1.);vN=normalize(vec3(position.x,-.12,position.z));vV=normalize(cameraPosition-wp.xyz);
 gl_Position=projectionMatrix*viewMatrix*wp;}`;
const TOR_F=`uniform float uT;uniform float uS;uniform vec3 uCol;uniform vec3 uDust;uniform vec3 uSun;varying vec2 vU;varying float vH;varying vec3 vN;varying vec3 vV;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
void main(){float sp=vU.x*10.+vH*7.-uT*1.9;
 float n=vn(vec2(sp,vH*22.-uT*1.4))*.55+vn(vec2(sp*2.7,vH*61.-uT*2.6))*.3+vn(vec2(sp*7.,vH*140.))*.15;
 float band=.5+.5*sin(vU.x*25.13+vH*40.-uT*7.);vec3 N=normalize(vN);
 float rim=smoothstep(0.,.6,abs(dot(N,normalize(vV))));
 float a=(.45+.55*smoothstep(.22,.78,n))*(.84+.16*band)*rim*uS*smoothstep(1.,.8,vH)*smoothstep(0.,.02,vH);
 float lit=.55+.45*max(0.,dot(N,uSun));
 vec3 c=mix(uDust,uCol,smoothstep(.015,.2,vH))*(.62+.55*n)*lit*mix(.82,1.08,vH);
 gl_FragColor=vec4(c,clamp(a,0.,.95));}`;
// nube a muro e tetto del temporale: dischi a griglia polare, il centro più basso, la nube gira più in fretta vicino all'asse
const TOR_DV=`uniform float uT;uniform float uDrop;varying vec2 vP;varying float vR;void main(){vec3 p=position;float r=length(p.xz);vR=r;vP=p.xz;
 p.y=-pow(max(0.,1.-r*r),1.5)*uDrop+sin(p.x*9.+uT*.3)*sin(p.z*7.-uT*.2)*uDrop*.06;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const TOR_DF=`uniform float uT;uniform float uS;uniform vec3 uCol;uniform float uSpin;uniform float uEdge;varying vec2 vP;varying float vR;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
void main(){float r=vR,a=atan(vP.y,vP.x)+uT*uSpin/(r+.25);vec2 q=vec2(cos(a),sin(a))*r;
 float n=vn(q*7.+3.)*.5+vn(q*19.-uT*.05)*.3+vn(q*47.)*.2;float sw=.5+.5*sin(a*3.-r*14.);
 float al=(1.-smoothstep(uEdge,1.,r))*uS*(.62+.38*smoothstep(.25,.8,n))*(.85+.15*sw);
 gl_FragColor=vec4(uCol*(.7+.5*n)*(.8+.25*(1.-r)),clamp(al,0.,.97));}`;
function torGeo(){if(TOR.geo)return;TOR.geo=new THREE.CylinderGeometry(1,1,1,56,64,true).translate(0,.5,0);
 const K=10,S=72,pos=[],idx=[];pos.push(0,0,0);for(let k=1;k<=K;k++){const r=Math.pow(k/K,1.3);for(let s=0;s<S;s++){const a=s/S*TAU;pos.push(Math.cos(a)*r,0,Math.sin(a)*r);}}
 for(let s=0;s<S;s++)idx.push(0,1+(s+1)%S,1+s);for(let k=1;k<K;k++)for(let s=0;s<S;s++){const a=1+(k-1)*S+s,b=1+(k-1)*S+(s+1)%S,c=a+S,d=b+S;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);TOR.disc=g;}
spawnTornado=function(x,z,P){if(tornados.length>=2){toast('Ci sono già due tornado attivi.');return;}torGeo();const Rc=8+P*12,l=TODC.lit,wsp=waterAt(x,z)>groundH(x,z)+.5;
 const U0={uT:{value:0},uS:{value:0}};
 const mat=new THREE.ShaderMaterial({uniforms:{uT:U0.uT,uS:U0.uS,uRc:{value:Rc},uH:{value:300},uCol:{value:new THREE.Color(.13*l+.025,.127*l+.025,.122*l+.026)},uDust:{value:new THREE.Color(.2*l+.02,.165*l+.02,.12*l+.015)},uSun:{value:new THREE.Vector3(0,1,0)}},vertexShader:TOR_V,fragmentShader:TOR_F,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const m=new THREE.Mesh(TOR.geo,mat);m.frustumCulled=false;m.position.set(x,groundH(x,z),z);m.layers.set(1);scene.add(m);
 const dm=(col,spin,edge,drop)=>new THREE.ShaderMaterial({uniforms:{uT:U0.uT,uS:U0.uS,uCol:{value:col},uSpin:{value:spin},uEdge:{value:edge},uDrop:{value:drop}},vertexShader:TOR_DV,fragmentShader:TOR_DF,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const wc=new THREE.Mesh(TOR.disc,dm(new THREE.Color(.1*l+.02,.1*l+.021,.105*l+.024),.55,.45,26));wc.position.y=300;wc.scale.set(Rc*13,1,Rc*13);wc.frustumCulled=false;wc.layers.set(1);m.add(wc);
 const dk=new THREE.Mesh(TOR.disc,dm(new THREE.Color(.16*l+.03,.165*l+.032,.18*l+.036),.04,.3,0));dk.position.y=332;dk.scale.set(1150,1,1150);dk.frustumCulled=false;dk.layers.set(1);m.add(dk);
 tornados.push({x,z,dir:rand(0,TAU),age:0,life:26+P*16,P,Rc,V:45+P*50,m,s:0,dmgT:0,wc,dk,core:isCore(x,z),wsp,trT:0});};
const _tsun=new THREE.Vector3();
updTornados=function(dt){let near=1e9,nt=null;_tsun.copy(sun.position).sub(sun.target.position).normalize();
 for(let i=tornados.length-1;i>=0;i--){const T=tornados[i];T.age+=dt;T.s=clamp(T.age/4,0,1)*clamp((T.life-T.age)/5,0,1);
  if(T.age>T.life){scene.remove(T.m);T.m.material.dispose();if(T.wc){T.wc.material.dispose();T.dk.material.dispose();}tornados.splice(i,1);continue;}
  T.dir+=(vnoise(T.age*.2,T.x*.01)-.5)*dt*1.2;
  if(T.core!==false){if(Math.abs(T.x)>CX-40||Math.abs(T.z)>CZ-40)T.dir=Math.atan2(-T.z,-T.x)+rand(-.3,.3);}else if(Math.max(Math.abs(T.x),Math.abs(T.z))>5500)T.dir=Math.atan2(-T.z,-T.x)+rand(-.3,.3);
  T.x+=Math.cos(T.dir)*8*dt;T.z+=Math.sin(T.dir)*8*dt;const gy=groundH(T.x,T.z),wl=waterAt(T.x,T.z);T.wsp=wl>gy+.5;const by=T.wsp?wl:gy;
  T.m.position.set(T.x,by,T.z);const u=T.m.material.uniforms;u.uT.value+=dt;u.uS.value=T.s;u.uSun.value.copy(_tsun);
  if(T.wsp)u.uDust.value.setRGB(.52*TODC.lit+.04,.55*TODC.lit+.04,.57*TODC.lit+.045);
  // la nube a muro segue la cima dell'imbuto
  if(T.wc){const t=u.uT.value;T.wc.position.x=Math.sin(3.6+t*.6)*16+Math.sin(9+t*1.7)*0;T.wc.position.z=Math.cos(2.9+t*.45)*11;T.wc.position.y=300-by+gy;T.dk.position.y=332-by+gy;}
  if(psA&&T.s>0){const l=TODC.lit,sw=T.wsp;
   for(let k=0;k<20;k++){const a=rand(0,TAU),r=rand(.4,2)*T.Rc,h=Math.random()<.75?rand(0,12):rand(12,150),x=T.x+Math.cos(a)*r,z=T.z+Math.sin(a)*r,c=sw?.62*l+.05:.21*l;
    psA.spawn(x,by+h,z,-Math.sin(a)*22,rand(2,10),Math.cos(a)*22,rand(3,6),rand(4,8),rand(10,22),c*(sw?1:1.05),c*(sw?1.02:.9),c*(sw?1.05:.74),sw?.5:.62,.2,-.5,1);}
   // pezzi scuri che orbitano (assi, foglie, terra) / spruzzi d'acqua
   for(let k=0;k<7;k++){const a=rand(0,TAU),r=rand(.8,2.6)*T.Rc,x=T.x+Math.cos(a)*r,z=T.z+Math.sin(a)*r,c=sw?.7*l:.08*l;
    psA.spawn(x,by+rand(0,45),z,-Math.sin(a)*30,rand(4,14),Math.cos(a)*30,rand(4,8),sw?.6:.3,sw?1.2:.5,c,c*.95,c*.9,.9,.05,-.2,1);}}
  wakeBox(T.x-T.Rc*3,-5,T.z-T.Rc*3,T.x+T.Rc*3,260,T.z+T.Rc*3);
  T.dmgT-=dt;if(T.dmgT<=0&&T.s>.4){T.dmgT=.12;tornadoDamage(T);}
  // alberi: sradicati vicino all'asse, abbattuti nel verso della rotazione più in là
  T.trT-=dt;if(T.trT<=0&&T.s>.4&&FOREST.n){T.trT=.25;const R=T.Rc*1.7;treesNear(T.x,T.z,(c,i)=>{if(c[i+3]<=0)return;const dx=c[i]-T.x,dz=c[i+2]-T.z,d=Math.hypot(dx,dz)+.01;if(d>R||Math.random()>.4*T.s)return;
    if(d<T.Rc*.7){leafBurst(c[i],c[i+1]+c[i+3]*.6,c[i+2],30,-dz/d*14,10,dx/d*14);chips(c[i],c[i+1]+2,c[i+2],6);c[i+3]=0;FOREST.dirty=true;}else fellTree(c,i,-dz/d+dx/d*.25,dx/d+dz/d*.25,1.4*T.s);});}
  const d=sDist(T.x,10,T.z);if(d<near){near=d;nt=T;}}
 if(AU.ok){const L=tornados.length?getLoop('tornado'):AU.loops.tornado;if(L){loopGain(L,nt?clamp(nt.s*1.2,0,1):0,.3);if(nt)setPan(L.p,nt.x,20,nt.z);}}
 if(nt)GU.uVort.value.set(nt.x,nt.z,nt.s*2,nt.Rc*2.5);else GU.uVort.value.z=0;};
