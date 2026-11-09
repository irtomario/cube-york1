/* ======================= PATCH AB — AUTO: LAMIERA CHE SI ACCARTOCCIA DAVVERO ======================= */
// Prima: ammaccature "a bolla" (spinta radiale con un limite) e mascherina, fari, paraurti e vetri che restavano sospesi
// davanti a un muso accartocciato. Ora ogni urto:
// - accartoccia la lamiera nella direzione dell'urto a fisarmonica (pieghe ogni 15-22 cm che si stringono con la forza),
//   con l'imbarcamento laterale irregolare della lamiera; la deformazione si concentra dove c'è stato il contatto e si
//   smorza andando verso l'interno;
// - il cofano si solleva "a tenda" negli urti frontali forti, il tetto si schiaccia e i montanti si piegano dall'alto;
// - l'abitacolo resiste: oltre la paratia e i montanti la deformazione cala di colpo (cellula di sicurezza);
// - mascherina, paraurti, fari, specchietti, interni e vetri seguono la stessa deformazione (niente pezzi sospesi);
// - i fari colpiti si rompono e si spengono, la vernice si graffia fino al fondo grigio e al metallo nudo, lucido;
// - le ruote colpite di lato si storcono (campanatura e convergenza): si vede e l'auto tira da una parte.
// Ruote nuove: pneumatico con battistrada a tasselli e spalla, cerchio in lega a 5 razze concave, dadi, disco del freno
// forato e pinza (che non gira con la ruota e sterza con quelle anteriori).
const ABC={cur:null,zone:'',D:null};
// ---------- vernice: bruciature (come prima) + danni: graffi, fondo, metallo nudo ----------
cdPaint=function(col){const m=carMats.paint.clone();m.color.copy(col);const u={value:0};m.userData.burn=u;
 m.onBeforeCompile=sh=>{sh.uniforms.uBurn=u;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCP;attribute float aDmg;varying float vDmg;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCP=position;vDmg=aDmg;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCP;varying float vDmg;uniform float uBurn;float cbh(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}float cbn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(cbh(i),cbh(i+vec3(1.,0.,0.)),f.x),mix(cbh(i+vec3(0.,1.,0.)),cbh(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(cbh(i+vec3(0.,0.,1.)),cbh(i+vec3(1.,0.,1.)),f.x),mix(cbh(i+vec3(0.,1.,1.)),cbh(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}float abSc=0.,abMt=0.;')
   .replace('#include <color_fragment>','#include <color_fragment>\nif(uBurn>0.){float n=cbn(vCP*2.7)*.6+cbn(vCP*8.3)*.4;vec3 ch=mix(vec3(.016,.014,.013),mix(vec3(.19,.09,.04),vec3(.3,.29,.27),step(.64,n)),smoothstep(.48,.78,n));diffuseColor.rgb=mix(diffuseColor.rgb,ch,uBurn*smoothstep(0.,.35,uBurn+n*.3-.15));}\n'
    // graffi: righe sottili orientate lungo la carrozzeria + chiazze dove la vernice è saltata
    +'if(vDmg>.05){float s1=cbn(vec3(vCP.x*4.,vCP.y*34.,vCP.z*4.)+vCP.z*2.),s2=cbn(vCP*7.),s3=cbn(vCP*13.);float sc=smoothstep(.5,.85,vDmg+(s2-.5)*.35)*smoothstep(.52,.68,s1*.75+s2*.25);abSc=clamp(sc+smoothstep(.85,1.,vDmg)*.45*step(.55,s2),0.,1.);abMt=step(.55,s3);\n'
    +' vec3 bare=mix(vec3(.3,.31,.3),vec3(.58,.58,.6),abMt);diffuseColor.rgb=mix(diffuseColor.rgb,bare,abSc);diffuseColor.rgb*=1.-.2*smoothstep(.25,.8,vDmg)*(1.-abSc)*(s2*.6+.4);}')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(mix(roughnessFactor,.93,uBurn),mix(.7,.32,abMt),abSc);')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,abMt*.9,abSc);')
   .replace('#include <lights_physical_fragment>','#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat*=1.-max(abSc,smoothstep(.4,1.,vDmg)*.7);\n#endif');};
 m.customProgramCacheKey=()=>'cdpaint2';return m;};
// ---------- copie per auto di finiture, fari e vetri (si deformano con la carrozzeria) ----------
function abcPrep(c){if(c.abP)return c.abP;const A={};c.abP=A;
 for(const k of['trimM','lightsM']){const m=c[k];if(!m||!m.geometry)continue;m.geometry=m.geometry.clone();A[k]=Float32Array.from(m.geometry.attributes.position.array);}
 if(c.cab&&c.cab.geometry)A.cab=Float32Array.from(c.cab.geometry.attributes.position.array);
 for(const g of[c.geo,c.parts&&c.parts.roofGeo])if(g&&!g.attributes.aDmg)g.setAttribute('aDmg',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));
 A.r1=Math.random();A.r2=Math.random();return A;}
// ---------- il cuore: accartocciamento ----------
function abCrumple(geo,B,lx,ly,lz,dx,dy,dz,rad,dep,lim,o){const P=geo.attributes.position.array,n=P.length/3,dA=geo.attributes.aDmg?geo.attributes.aDmg.array:null,col=o.lights?geo.attributes.color:null;
 const dl=Math.hypot(dx,dy,dz)||1;dx/=dl;dy/=dl;dz/=dl;let ux=-dz,uy=0,uz=dx;if(Math.abs(dy)>.9){ux=1;uy=0;uz=0;}const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;const vx=dy*uz-dz*uy,vy=dz*ux-dx*uz,vz=dx*uy-dy*ux;
 const fq=6.2832/(.15+.07*o.r1),ph=o.r2*6.28,dd=Math.max(.22,rad*.75),D=o.D,zone=o.zone,fw=D?D.zw[0]+.02:0,rw=D?(D.zg-.06):0,tent=D&&zone==='f'&&dep>.18;
 let any=false;
 for(let i=0;i<n;i++){const j=i*3,ex=P[j]-lx,ey=P[j+1]-ly,ez=P[j+2]-lz,al=ex*dx+ey*dy+ez*dz,qx=ex-dx*al,qy=ey-dy*al,qz=ez-dz*al,lat=Math.sqrt(qx*qx+qy*qy+qz*qz);if(lat>rad)continue;
  let fl=1-lat/rad;fl=fl*fl*(3-2*fl);const fd=al<0?Math.exp(al/.1):Math.exp(-al/dd);let k=dep*fl*fd;if(k<2e-4)continue;
  const bx=B[j],by=B[j+1],bz=B[j+2];
  // cellula di sicurezza: oltre la paratia (urti frontali) o dietro i sedili (urti posteriori) la lamiera quasi non cede
  if(D){if(zone==='f'&&bz>fw)k*=Math.max(.1,1-(bz-fw)/.22);else if(zone==='r'&&bz<rw)k*=Math.max(.1,1-(rw-bz)/.22);else if((zone==='l'||zone==='rt')&&by>GY+D.belt+.05)k*=.55;}
  // pieghe a fisarmonica lungo la direzione dell'urto e imbarcamento laterale della lamiera
  const fo=Math.sin(al*fq+ph+lat*2.7)*.38*Math.min(1,dep*2.6);k*=1+fo;
  const n1=Math.sin(bx*7.1+by*5.3+o.r1*9.)*Math.sin(bz*6.7-by*4.1+o.r2*7.),n2=Math.sin(bx*13.3-bz*11.7+by*9.1+o.r1*3.);const bk=k*.3;
  let x=P[j]+dx*k+(ux*n1+vx*n2)*bk,y=P[j+1]+dy*k+(uy*n1+vy*n2)*bk,z=P[j+2]+dz*k+(uz*n1+vz*n2)*bk;
  // cofano "a tenda": la lamiera spinta indietro si solleva a metà cofano
  if(tent&&by>GY+D.hh[0]-.06&&bz<D.zw[0]-.05&&bz>-D.L/2+.15){const t=clamp((bz+D.L/2)/(D.zw[0]+D.L/2),0,1),cx=1-Math.min(1,(bx*bx)/(D.W*D.W));y+=Math.min(.22,dep*.42)*Math.pow(Math.sin(Math.PI*t),2)*cx*fl;}
  const ox=x-bx,oy=y-by,oz=z-bz,ol=Math.sqrt(ox*ox+oy*oy+oz*oz);if(ol>lim){x=bx+ox/ol*lim;y=by+oy/ol*lim;z=bz+oz/ol*lim;}
  P[j]=x;P[j+1]=y;P[j+2]=z;any=true;
  if(dA)dA[i]=Math.min(1,dA[i]+k/.3);
  if(col&&k>.02*Math.max(.3,dep)&&fl>.35){col.setXYZ(i,.025,.025,.028);}}
 if(any){geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();if(dA)geo.attributes.aDmg.needsUpdate=true;if(col)col.needsUpdate=true;}
 return any;}
// l'AA chiama cdDeform per carrozzeria e tetto: qui diventa l'accartocciamento, e la stessa spinta va a finiture, fari e vetri
{const cd0=cdDeform;cdDeform=function(geo,B,lx,ly,lz,dx,dy,dz,rad,dep,lim){const c=ABC.cur;
 if(!c||!c.abP)return cd0(geo,B,lx,ly,lz,dx,dy,dz,rad,dep,lim);const A=c.abP,o={D:ABC.D,zone:ABC.zone,r1:A.r1,r2:A.r2};
 abCrumple(geo,B,lx,ly,lz,dx,dy,dz,rad,dep,lim,o);
 if(geo===c.geo){if(c.trimM&&A.trimM)abCrumple(c.trimM.geometry,A.trimM,lx,ly,lz,dx,dy,dz,rad*.95,dep*.9,lim,o);
  if(c.lightsM&&A.lightsM)abCrumple(c.lightsM.geometry,A.lightsM,lx,ly,lz,dx,dy,dz,rad,dep,lim,Object.assign({lights:true},o));
  if(c.cab&&A.cab&&c.cab.geometry.attributes.position.count*3===A.cab.length)abCrumple(c.cab.geometry,A.cab,lx,ly,lz,dx,dy,dz,rad*.9,dep*.75,lim*.8,o);}};}
{const dent1=dent;dent=function(b,cx,cy,cz,nx,ny,nz,s){const c=b.car;
 if(!c||!c.parts||!c.G){return dent1(b,cx,cy,cz,nx,ny,nz,s);}
 abcPrep(c);const R=b.R,wx=cx-b.px,wy=cy-b.py,wz=cz-b.pz,lx=R[0]*wx+R[3]*wy+R[6]*wz,ly=R[1]*wx+R[4]*wy+R[7]*wz,lz=R[2]*wx+R[5]*wy+R[8]*wz,D=c.G.D,tail=D.rear==='sedan'||D.rear==='fast'||D.rear==='mid'||D.rear==='bed'?D.zg+.1:D.zr+.1;
 ABC.cur=c;ABC.D=D;ABC.zone=ly>GY+D.belt+.1?'top':(lz<D.zw[0]-.05?'f':(lz>tail?'r':(lx<0?'l':'rt')));
 try{dent1(b,cx,cy,cz,nx,ny,nz,s);}finally{ABC.cur=null;}
 // ruote storte: colpo forte vicino a una ruota (di lato o d'angolo)
 if(s>11)for(const w of c.wheels){if(w.off)continue;const d=Math.hypot(w.x-lx,w.z-lz);if(d<1.0){const k=(s-10)/30*(1-d);w.toe=clamp((w.toe||0)+(Math.random()-.5)*.16*k+(w.x<0?.04:-.04)*k,-.22,.22);w.cam=clamp((w.cam||0)+(Math.sign(w.x)*.1+(Math.random()-.5)*.06)*k,-.3,.3);}}};}
// ---------- ruote nuove (pneumatico a tasselli, cerchio in lega, disco forato) e pinze dei freni ----------
function abWheelGeo(){const T=[],N=48,col=(g,r,gg,b)=>colorize(g,r,gg,b);
 // pneumatico: profilo (raggio, x) con spalla arrotondata e battistrada; tasselli modulando il raggio esterno
 const pr=[[.21,-.115],[.27,-.122],[.315,-.112],[.336,-.09],[.343,-.06],[.345,-.025],[.345,.025],[.343,.06],[.336,.09],[.315,.112],[.27,.122],[.21,.115]].map(p=>new THREE.Vector2(p[0],p[1]));
 const tire=new THREE.LatheGeometry(pr,120),TP=tire.attributes.position;for(let i=0;i<TP.count;i++){const x=TP.getX(i),z=TP.getZ(i),y=TP.getY(i),r=Math.hypot(x,z);if(r<.338)continue;const a=Math.atan2(z,x),blk=Math.sin(a*30+(Math.abs(y)>.04?Math.sign(y)*.9:0)),gr=Math.abs(y)<.012?-.006:0,k=(blk>0?0:-.007)+gr;TP.setX(i,x*(1+k/r));TP.setZ(i,z*(1+k/r));}
 tire.computeVertexNormals();tire.rotateZ(Math.PI/2);T.push(col(tire,.022,.022,.024));
 // cerchio: canale, flangia, 5 razze concave a V, mozzo, dadi
 T.push(col(new THREE.CylinderGeometry(.212,.212,.2,N,1,true).rotateZ(Math.PI/2),.5,.51,.53));
 T.push(col(new THREE.TorusGeometry(.205,.012,6,N).rotateY(Math.PI/2).translate(.098,0,0),.68,.69,.71));T.push(col(new THREE.TorusGeometry(.205,.012,6,N).rotateY(Math.PI/2).translate(-.098,0,0),.4,.41,.43));
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;for(const s of[-1,1]){const g=new THREE.BoxGeometry(.03,.17,.032);const P2=g.attributes.position;for(let q=0;q<P2.count;q++){const yy=P2.getY(q);P2.setX(q,P2.getX(q)-(yy+.085)*.09);P2.setZ(q,P2.getZ(q)+(yy+.085)*.07*s);}
   g.translate(.085,.1,s*.022).rotateX(a);T.push(col(g,.66,.67,.69));}}
 T.push(col(new THREE.CylinderGeometry(.06,.07,.05,16).rotateZ(Math.PI/2).translate(.085,0,0),.55,.56,.58));T.push(col(new THREE.CylinderGeometry(.03,.03,.052,10).rotateZ(Math.PI/2).translate(.09,0,0),.15,.15,.16));
 for(let i=0;i<5;i++){const a=(i+.5)/5*Math.PI*2;T.push(col(new THREE.CylinderGeometry(.009,.009,.03,6).rotateZ(Math.PI/2).translate(.104,Math.cos(a)*.045,Math.sin(a)*.045),.75,.76,.78));}
 // disco del freno (forato): gira con la ruota
 T.push(col(new THREE.CylinderGeometry(.165,.165,.026,32).rotateZ(Math.PI/2).translate(-.01,0,0),.27,.27,.28));
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=.12+(i%2)*.022;T.push(col(new THREE.CylinderGeometry(.006,.006,.03,6).rotateZ(Math.PI/2).translate(-.01,Math.cos(a)*r,Math.sin(a)*r),.05,.05,.05));}
 return mergeGeos(T);}
function abCaliperGeo(){const T=[];const g=new THREE.BoxGeometry(.05,.13,.085);T.push(colorize(g.translate(0,.11,.0),1,1,1));const h=new THREE.CylinderGeometry(.02,.02,.055,8).rotateZ(Math.PI/2).translate(0,.06,0);T.push(colorize(h,1,1,1));return mergeGeos(T);}
{const bc1=buildCars;buildCars=function(){bc1();try{const g=abWheelGeo();CARGEO_HI.wheel=g;ABC.wheel=g;ABC.cal=abCaliperGeo();
  ABC.calM=[new THREE.MeshStandardMaterial({vertexColors:true,color:lc(0xb4141a),roughness:.45,metalness:.3}),new THREE.MeshStandardMaterial({vertexColors:true,color:lc(0x3a3c40),roughness:.5,metalness:.6}),new THREE.MeshStandardMaterial({vertexColors:true,color:lc(0xd8a20f),roughness:.45,metalness:.3})];}catch(e){console.warn('ruote nuove',e);}};}
{const mc2=makeCar2;makeCar2=function(type,x,y,z,yaw,col,o){const b=mc2(type,x,y,z,yaw,col,o);try{const c=b.car;if(ABC.cal&&c&&c.G){const ws=c.G.ws||1,mi=type==='sports'||type==='hyper'?(Math.random()<.6?0:2):1;
  for(const w of c.wheels){const m=new THREE.Mesh(ABC.cal,ABC.calM[mi]);m.scale.setScalar(ws);m.rotation.order='YXZ';m.position.set(w.x-Math.sign(w.x)*.07*ws,c.G.wy,w.z);m.castShadow=false;b.obj.add(m);w.cal=m;}}}catch(e){}return b;};}
{const vv2=vehicleVisuals;vehicleVisuals=function(dt){vv2(dt);for(const b of dynCars){const c=b.car;if(b.dead||!c)continue;
  for(const w of c.wheels){if(!w.m)continue;if(w.toe)w.m.rotation.y+=w.toe;if(w.cam)w.m.rotation.z=w.cam;if(w.cal){if(w.off){w.cal.visible=false;continue;}w.cal.position.y=w.m.position.y;w.cal.rotation.y=w.m.rotation.y;w.cal.rotation.z=w.cam||0;}}}};}
