/* ======================= PATCH AB — NOVA VIVA: BOUTIQUE HI-TECH, AUTO DEL FUTURO, DRONI, VERDE ======================= */
// - Al piano terra dei palazzi di Nova che guardano viali e strade: vetrine di negozi e boutique hi-tech (vetrina sporgente
//   con cornice, vetro che riflette, interno illuminato del suo colore, espositori con prodotti luminosi, insegna con il
//   nome del negozio, tutti inventati) che di notte si accendono. Se il palazzo viene distrutto lì, la vetrina sparisce.
// - Auto del futuro nel traffico di Nova: elettriche basse e lisce con tetto tutto vetro, barre di luce a tutta larghezza
//   davanti e dietro, cerchi carenati, sensore sul tetto; e un SUV elettrico.
// - Droni delle consegne che volano tra i palazzi (con le luci di posizione che lampeggiano).
// - Pareti verdi su alcuni palazzi e giardini pensili con alberi sui tetti bassi.
const NVA={shops:[],ms:{},drones:null,green:[],chkT:0};
// ---------- auto del futuro (stesso generatore parametrico delle altre auto) ----------
Object.assign(CDEF,{fut:{L:4.85,W:.96,fa:-1.45,ra:1.5,r:.36,cl:.13,hb:.46,hh:[.62,.72],belt:.86,roof:1.36,zw:[-1.05,-.12],zr:1.55,zg:2.05,deck:.92,rear:'fast',doors:2,n:3.6,mass:1900,rf:.6,rr:.45},
 futs:{L:4.75,W:.98,fa:-1.42,ra:1.42,r:.39,cl:.2,hb:.6,hh:[.86,.95],belt:1.06,roof:1.62,zw:[-1.0,-.18],zr:1.75,zg:2.1,deck:1.08,rear:'suv',doors:2,n:4.2,mass:2300,rf:.55,rr:.4}});
Object.assign(CDMAP,{fut:'fut',futs:'futs'});Object.assign(TRV,{fut:{p:0,v:13,pow:1.6,top:60},futs:{p:0,v:12,pow:1.5,top:52}});
Object.assign(TRCOL,{fut:[0xf2f2f0,0x101114,0x8a9099,0x1e3a5f,0xc9ccd0,0x4d1f6b,0x0f4c4c],futs:[0xe8e8e6,0x15171a,0x5d636b,0x22324a,0x6b2d2d]});
{const mc3=makeCar2;makeCar2=function(type,x,y,z,yaw,col,o){const b=mc3(type,x,y,z,yaw,col,o);if(type==='fut'||type==='futs'){try{nvFutTrim(b);}catch(e){console.warn('auto futura',e);}}return b;};}
function nvFutTrim(b){const c=b.car,G=c.G,D=G.D,g=b.obj,W=D.W,zF=-D.L/2,zR=D.L/2;
 const lb=(w,h,d,x,y,z,col)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:new THREE.Color(col[0],col[1],col[2])}));m.position.set(x,y,z);g.add(m);return m;};
 lb(W*1.86,.035,.03,0,GY+D.hh[0]-.02,zF+.1,[3.2,3.3,3.6]);lb(W*1.86,.05,.03,0,GY+D.deck-.06,zR-.06,[3.6,.12,.1]);lb(W*1.5,.012,.02,0,GY+D.cl+.08,zF+.2,[.3,1.6,2.4]);
 const dk=new THREE.MeshStandardMaterial({color:lc(0x0c0d0f),roughness:.3,metalness:.4});const pod=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,.08,16),dk);pod.position.set(0,GY+D.roof+.04,D.zw[1]+.15);g.add(pod);
 // cerchi carenati (dischi lisci che girano con la ruota)
 const cv=new THREE.MeshStandardMaterial({color:lc(0x9aa0a8),roughness:.25,metalness:.85});for(const w of c.wheels){if(!w.m)continue;const d=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.02,32).rotateZ(Math.PI/2),cv);d.position.x=Math.sign(w.x)*.1;w.m.add(d);}}
{const tp0=trPick;trPick=function(){const c=camera.position;if(typeof nvNear==='function'&&nvNear(c.x,c.z,300)&&Math.random()<.5)return Math.random()<.65?'fut':'futs';return tp0();};}
// ---------- insegne dei negozi (nomi inventati) ----------
const NV_SHOPS=['NEXA','ORBITA','LUMEN','VOLTA','KAIRO','SYNTH','AURA LAB','PIXEL & CO','HELIX','QUANTA','ZENITH','MODA 9','ATELIER 3D','BOTANICA','CAFFÈ NOVA','ROBOTICA','SOLARIS','VERDE VIVO','FUTURA','OTTICA LUX','DRONE HUB','BIO MARKET','GALLERIA','SUONO+','VISORI','NOVA BIKE','TECNO','ARIA'];
function nvSignAtlas(){const c=document.createElement('canvas');c.width=1024;c.height=1024;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,1024,1024);
 const cols=['#7ff3ff','#ff6ad5','#ffffff','#9dff7a','#ffd36b','#7aa8ff','#ff8a5b','#d6b3ff'],fonts=['700 40px Helvetica, Arial, sans-serif','300 42px Helvetica, Arial, sans-serif','700 38px Georgia, serif','600 40px "Trebuchet MS", sans-serif'];
 for(let i=0;i<NV_SHOPS.length;i++){const x=(i%4)*256,y=Math.floor(i/4)*64,col=cols[i%cols.length];g.fillStyle=i%3===0?'#0b0d10':(i%3===1?'#f2f2f0':'#14161a');g.fillRect(x+2,y+2,252,60);
  g.font=fonts[i%fonts.length];g.textAlign='center';g.textBaseline='middle';g.shadowColor=col;g.shadowBlur=i%3===1?0:12;g.fillStyle=i%3===1?'#16181c':col;g.fillText(NV_SHOPS[i],x+128,y+34,236);g.shadowBlur=0;
  g.fillStyle=col;g.fillRect(x+14,y+54,32,3);}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
// ---------- vetrine: istanze per pezzo (cornice, fondale illuminato, vetro, espositori, prodotti, insegna) ----------
function nvShopsBuild(){if(NVA.built||!NOVA||!NOVA.B||!NOVA.B.length)return;NVA.built=true;
 const roadNear=(x,z)=>{for(const a of NV.AV)if(z>a.a-2&&z<a.b+2&&Math.abs(x-a.x)<a.hw+6)return true;for(const s of NV.ST)if(x>s.a-2&&x<s.b+2&&Math.abs(z-s.z)<s.hw+6)return true;return false;};
 const R=mulberry32(5150),S=[];
 for(const b of NOVA.B){if(b.noProps||b.h<8)continue;const x0=b.x0,x1=b.x0+b.w,z0=b.z0,z1=b.z0+b.d;
  const sides=[[x0,z1,x1,z1,0,1],[x1,z0,x0,z0,0,-1],[x0,z0,x0,z1,-1,0],[x1,z1,x1,z0,1,0]];
  for(const [ax,az,bx,bz,nx,nz] of sides){const mx=(ax+bx)/2+nx*9,mz=(az+bz)/2+nz*9;if(!roadNear(mx,mz))continue;const L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L;let t=1.5;
   while(t<L-5){const w=Math.min(L-1.5-t,6+Math.floor(R()*3)*2);if(w<5)break;const cx=ax+ux*(t+w/2),cz=az+uz*(t+w/2);S.push({b,x:cx,z:cz,nx,nz,ux,uz,w,brand:Math.floor(R()*NV_SHOPS.length),col:R(),r:R(),on:true,t0:t,iw:[]});t+=w+.6;}}}
 NVA.shops=S;const N=S.length;if(!N)return;
 const frame=new THREE.MeshStandardMaterial({color:lc(0x22262b),roughness:.35,metalness:.8}),glass=new THREE.MeshPhysicalMaterial({color:lc(0xcfe3ea),roughness:.04,metalness:.1,transparent:true,opacity:.22,depthWrite:false,envMapIntensity:1.4});
 const back=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6});back.onBeforeCompile=sh=>{sh.uniforms.uNight=U.uNight;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uNight;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_INSTANCING_COLOR\ntotalEmissiveRadiance+=vColor*(.35+uNight*1.6);\n#endif');};
 const prod=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.3,metalness:.2});prod.onBeforeCompile=sh=>{sh.uniforms.uNight=U.uNight;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uNight;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_INSTANCING_COLOR\ntotalEmissiveRadiance+=vColor*(.8+uNight*2.2);\n#endif');};
 const ped=new THREE.MeshStandardMaterial({color:lc(0xe9e9e6),roughness:.4,metalness:.1});
 const atlas=nvSignAtlas(),sg=new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1,1)),su=new Float32Array(N*2);sg.setAttribute('aSU',new THREE.InstancedBufferAttribute(su,2));
 const sm=new THREE.ShaderMaterial({uniforms:{map:{value:atlas},uNight:U.uNight},vertexShader:'attribute vec2 aSU;varying vec2 vU;void main(){vU=aSU+uv*vec2(.25,.0625);gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D map;uniform float uNight;varying vec2 vU;void main(){vec3 c=texture2D(map,vU).rgb;gl_FragColor=vec4(c*(1.1+uNight*2.6),1.);}'});
 const mk=(geo,mat,n,sh)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.frustumCulled=false;m.castShadow=!!sh;m.receiveShadow=true;scene.add(m);return m;};
 const M={fr:mk(new THREE.BoxGeometry(1,1,1),frame,N*4,true),bk:mk(new THREE.PlaneGeometry(1,1),back,N),gl:mk(new THREE.PlaneGeometry(1,1),glass,N),pd:mk(new THREE.BoxGeometry(1,1,1),ped,N*3,true),pr:mk(new THREE.BoxGeometry(1,1,1),prod,N*3),sg:mk(sg,sm,N)};NVA.ms=M;
 const o=new THREE.Object3D(),pal=[[.9,.95,1],[1,.85,.6],[.6,.85,1],[1,.6,.85],[.75,1,.8],[1,.95,.75]],pc=[[.2,.9,1],[1,.3,.7],[1,.75,.2],[.5,1,.4],[.6,.5,1],[1,1,1]];let nf=0,np=0;
 const put=(m,i,x,y,z,ry,sx,sy,sz)=>{o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.set(sx,sy,sz);o.updateMatrix();m.setMatrixAt(i,o.matrix);};
 S.forEach((s,i)=>{const ry=Math.atan2(s.nx,s.nz),gy=groundH(s.x+s.nx*.5,s.z+s.nz*.5),d0=.5,px=(t,d)=>s.x+s.ux*t+s.nx*d,pz=(t,d)=>s.z+s.uz*t+s.nz*d,w=s.w,h=3.3;
  // cornice: montanti e traversa, il fondale (interno illuminato) un po' dentro, il vetro sul filo, l'insegna sopra
  for(const t of[-w/2,w/2]){put(M.fr,nf,px(t,d0*.5),gy+h/2,pz(t,d0*.5),ry,.12,h,d0+.2);s.iw.push(['fr',nf++]);}
  put(M.fr,nf,px(0,d0*.5),gy+h+.05,pz(0,d0*.5),ry,w+.12,.14,d0+.25);s.iw.push(['fr',nf++]);put(M.fr,nf,px(0,d0*.5),gy+.12,pz(0,d0*.5),ry,w,.24,d0+.15);s.iw.push(['fr',nf++]);
  put(M.bk,i,px(0,.06),gy+h/2+.1,pz(0,.06),ry,w-.1,h-.3,1);M.bk.setColorAt(i,_tc.setRGB(...pal[Math.floor(s.col*pal.length)]));s.iw.push(['bk',i]);
  put(M.gl,i,px(0,d0+.02),gy+h/2+.05,pz(0,d0+.02),ry,w-.12,h-.2,1);s.iw.push(['gl',i]);
  put(M.sg,i,px(0,d0+.15),gy+h+.62,pz(0,d0+.15),ry,Math.min(w-.3,5.2),Math.min(w-.3,5.2)/4,1);su[i*2]=(s.brand%4)*.25;su[i*2+1]=1-(Math.floor(s.brand/4)+1)*.0625;s.iw.push(['sg',i]);
  const k=Math.floor(s.r*pc.length);for(let j=0;j<3;j++){const t=(j-1)*w*.28,hh=.6+((s.r*7+j)%1)*.5;put(M.pd,np,px(t,.32),gy+hh/2+.24,pz(t,.32),ry,.6,hh,.34);s.iw.push(['pd',np]);
   const ps=.18+((s.r*13+j)%1)*.2;put(M.pr,np,px(t,.32),gy+hh+.24+ps/2,pz(t,.32),ry+j,ps,ps*(1+(j%2)),ps);M.pr.setColorAt(np,_tc.setRGB(...pc[(k+j)%pc.length]));s.iw.push(['pr',np]);np++;}});
 for(const k in M){M[k].instanceMatrix.needsUpdate=true;if(M[k].instanceColor)M[k].instanceColor.needsUpdate=true;}sg.attributes.aSU.needsUpdate=true;M.fr.count=nf;M.pd.count=np;M.pr.count=np;}
// una vetrina sparisce se il palazzo dietro ha perso le celle del piano terra in quel punto
function nvShopsCheck(){const M=NVA.ms;let ch=false;for(const s of NVA.shops){if(!s.on||!s.b.vox)continue;const b=s.b,C=b.vox.cells;let gone=false;
  for(let t=-s.w/2+.5;t<=s.w/2-.5;t+=2){const x=s.x+s.ux*t-s.nx*1.5,z=s.z+s.uz*t-s.nz*1.5,ix=Math.floor((x-b.x0)/4),iz=Math.floor((z-b.z0)/4);if(ix<0||iz<0||ix>=b.nx||iz>=b.nz){gone=true;break;}if(C[ix+b.nx*iz]<0){gone=true;break;}}
  if(gone){s.on=false;ch=true;for(const [k,i] of s.iw)M[k].setMatrixAt(i,_m0);const c=s.b,x=s.x+s.nx*.6,z=s.z+s.nz*.6;for(let q=0;q<26;q++)shardSpawn(x+s.ux*rand(-s.w/2,s.w/2),groundH(x,z)+rand(.3,3),z+s.uz*rand(-s.w/2,s.w/2),s.nx*rand(1,4),rand(0,2),s.nz*rand(1,4),rand(.05,.14));}}
 if(ch)for(const k in M)M[k].instanceMatrix.needsUpdate=true;}
// ---------- droni delle consegne ----------
function nvDrones(){const N=QP===PRESETS.bassa?6:14,B=Bin(),dk=[.08,.085,.09],wh=[.85,.86,.88];
 const box=(w,h,d,x,y,z,c,rz)=>B.add(colorize(new THREE.BoxGeometry(w,h,d),c[0],c[1],c[2]),x,y,z,0,0,rz||0);
 box(.42,.14,.42,0,0,0,wh);box(.3,.06,.3,0,.09,0,dk);for(const a of[.785,2.356,3.927,5.498]){B.add(colorize(new THREE.BoxGeometry(.5,.035,.05),.1,.1,.11),Math.cos(a)*.3,.02,Math.sin(a)*.3,0,-a,0);B.add(colorize(new THREE.CylinderGeometry(.05,.05,.06,10),.1,.1,.11),Math.cos(a)*.52,.05,Math.sin(a)*.52);}
 box(.26,.22,.26,0,-.2,0,[.6,.45,.28]);for(const s of[-1,1])B.add(colorize(new THREE.SphereGeometry(.03,8,6),s>0?.2:3.4,s>0?3.2:.15,.2),s*.2,.0,-.22);
 const body=new THREE.InstancedMesh(mergeBin(B),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.4}),N);body.frustumCulled=false;body.castShadow=true;scene.add(body);
 const disc=new THREE.CircleGeometry(.22,20).rotateX(-Math.PI/2),dm=new THREE.MeshBasicMaterial({color:new THREE.Color(.2,.2,.22),transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}),rot=new THREE.InstancedMesh(disc,dm,N*4);rot.frustumCulled=false;scene.add(rot);
 const Z=OVL[0],L=[];for(let i=0;i<N;i++){const p=new THREE.Vector3(rand(Z.x0+40,Z.x1-40),rand(32,70),rand(Z.z0+40,Z.z1-40));L.push({p,t:p.clone(),v:new THREE.Vector3(),sp:rand(8,14),yaw:0,bank:0,wait:0});}
 NVA.drones={body,rot,L};}
function nvDroneStep(dt){const D=NVA.drones;if(!D)return;const c=camera.position,Z=OVL[0];if(!nvNear(c.x,c.z,500)){D.body.visible=D.rot.visible=false;return;}D.body.visible=D.rot.visible=true;
 const o=NVA.o||(NVA.o=new THREE.Object3D());let i=0;for(const d of D.L){if(d.wait>0)d.wait-=dt;else{const to=_tnv2.subVectors(d.t,d.p),dist=to.length();if(dist<3){d.t.set(rand(Z.x0+40,Z.x1-40),rand(32,75),rand(Z.z0+40,Z.z1-40));if(Math.random()<.3)d.wait=rand(1,4);}
   else{to.multiplyScalar(Math.min(d.sp,dist)/dist);d.v.lerp(to,Math.min(1,dt*1.2));}}if(d.wait>0)d.v.multiplyScalar(1-Math.min(1,dt*2));
  d.p.addScaledVector(d.v,dt);const hs=Math.hypot(d.v.x,d.v.z);if(hs>.3){const ty=Math.atan2(-d.v.x,-d.v.z);let dy=ty-d.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));d.yaw+=dy*Math.min(1,dt*2.5);d.bank+=((-dy*.8)-d.bank)*Math.min(1,dt*3);}
  o.position.copy(d.p);o.position.y+=Math.sin(U.uTime.value*2+i)*.08;o.rotation.set(-Math.min(.35,hs*.025),d.yaw,d.bank,'YXZ');o.scale.setScalar(1);o.updateMatrix();D.body.setMatrixAt(i,o.matrix);
  for(let k=0;k<4;k++){const a=.785+k*1.5708;_tnv2.set(Math.cos(a)*.52,.09,Math.sin(a)*.52).applyEuler(o.rotation).add(o.position);o.position.copy(_tnv2);o.updateMatrix();D.rot.setMatrixAt(i*4+k,o.matrix);o.position.copy(d.p);}i++;}
 D.body.instanceMatrix.needsUpdate=true;D.rot.instanceMatrix.needsUpdate=true;}
const _tnv2=new THREE.Vector3();
// ---------- verde: pareti verdi e giardini pensili ----------
function nvGreenTex(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.clearRect(0,0,256,256);const r=trRnd(77);
 for(let i=0;i<900;i++){const x=r()*256,y=r()*256,L=8+r()*9;for(const dx of[-256,0,256])for(const dy of[-256,0,256]){g.save();g.translate(x+dx,y+dy);g.rotate(r()*6.28);trLeafPath(g,L,L*.6,0);const l=16+r()*16;g.fillStyle='hsl('+(95+r()*25)+','+(35+r()*20)+'%,'+l+'%)';g.fill();g.restore();}}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function nvGreen(){const R=mulberry32(808),tex=nvGreenTex();const mat=new THREE.MeshStandardMaterial({map:tex,alphaTest:.45,roughness:.8,side:THREE.DoubleSide});const geos=[];
 for(const b of NOVA.B){if(b.h<16||R()>.35)continue;const side=Math.floor(R()*4),x0=b.x0,x1=b.x0+b.w,z0=b.z0,z1=b.z0+b.d,top=Math.min(b.h-4,8+R()*b.h*.6),w=(side<2?b.w:b.d)*(.35+R()*.4);
  const g=new THREE.PlaneGeometry(w,top-4,1,1);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/3,uv.getY(i)*(top-4)/3);
  const cx=side<2?(x0+x1)/2+(R()-.5)*(b.w-w)*.8:(side===2?x0-.12:x1+.12),cz=side>=2?(z0+z1)/2+(R()-.5)*(b.d-w)*.8:(side===0?z1+.12:z0-.12);g.rotateY(side===0?0:side===1?Math.PI:side===2?-Math.PI/2:Math.PI/2);g.translate(cx,4+(top-4)/2,cz);geos.push(g);
  NVA.green.push({b,x:cx,z:cz,y0:4,y1:top});}
 if(geos.length){const m=new THREE.Mesh(mergeGeos(geos.map(g=>colorize(g,1,1,1))),mat);m.material.vertexColors=true;m.receiveShadow=true;m.castShadow=false;scene.add(m);NVA.gm=m;}
 // alberi sui tetti dei palazzi bassi
 for(const b of NOVA.B){if(b.h>14||b.h<8||b.noProps||R()>.6)continue;const n=Math.floor(b.w*b.d/160);for(let i=0;i<n;i++)addProp(PK.tree,b.x0+3+R()*(b.w-6),b.h,b.z0+3+R()*(b.d-6),R()*TAU,b);}}
// ---------- integrazione: costruiti dopo il mondo, controlli e animazioni a ogni fotogramma ----------
function nvLazy(){if(!NOVA||!NOVA.B||!NOVA.B.length)return;if(!NVA.built){try{nvShopsBuild();}catch(e){NVA.built=true;console.warn('Nova: vetrine',e);}}if(!NVA.gdone){NVA.gdone=true;try{nvGreen();}catch(e){console.warn('Nova: verde',e);}}if(!NVA.drones&&!NVA.dErr){try{nvDrones();}catch(e){NVA.dErr=1;console.warn('Nova: droni',e);}}}
{const bw=buildWorld;buildWorld=function(){bw();nvLazy();};}
{const fu1=frameUpdate;frameUpdate=function(dt){fu1(dt);try{if(!NVA.built||!NVA.gdone)nvLazy();nvDroneStep(dt);NVA.chkT-=dt;if(NVA.chkT<=0){NVA.chkT=.7;nvShopsCheck();}}catch(e){if(!NVA.err){NVA.err=1;console.warn('Nova',e);}}};}
