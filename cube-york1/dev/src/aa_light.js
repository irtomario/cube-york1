/* ======================= PATCH AA — LUCE PIÙ VERA: ESPOSIZIONE, CONTRASTO, CIELO NOTTURNO CON LUNA E INQUINAMENTO LUMINOSO ======================= */
// Prima la curva di tonemapping riceveva il doppio della luce giusta: tutto appariva lattiginoso e sbiadito.
// Ora l'esposizione è quella di una fotocamera (il cemento al sole è grigio chiaro, non bianco; l'asfalto è scuro),
// le ombre hanno più contrasto, il bloom riguarda solo le luci vere e i riflessi forti.
{const T=TODS;
 Object.assign(T.giorno,{ex:.62,hi:.25,si:2.65,ss:.5});
 Object.assign(T.pomeriggio,{ex:.66,hi:.23,si:2.55,ss:.55});
 Object.assign(T.tramonto,{ex:.92,hi:.15,si:2.25,ss:.7});
 Object.assign(T.notte,{ex:1.3,hi:.04,si:.2,ss:1,fog:[.006,.009,.017]});}
const AALT={giorno:{th:2.2,b:.42,sat:1.1},pomeriggio:{th:2.1,b:.45,sat:1.1},tramonto:{th:1.8,b:.55,sat:1.08},notte:{th:1.15,b:.78,sat:1.02}};
// ---------- cielo notturno: blu quasi nero allo zenit, bagliore arancio della città all'orizzonte, luna con alone, stelle ----------
skyU.uNSky={value:0};skyU.uLP={value:1};skyU.uMoon={value:new THREE.Vector3(0,1,0)};
sky.material.fragmentShader=sky.material.fragmentShader.replace('uniform float uStars;','uniform float uStars;\nuniform float uNSky;uniform float uLP;uniform vec3 uMoon;')
 .replace('gl_FragColor = vec4( retColor*skyScale+vec3(stx*2.5), 1.0 );',
 `vec3 scol=retColor*skyScale;
 if(uNSky>0.){float yy=max(direction.y,0.);vec3 ng=mix(vec3(.0105,.0135,.024),vec3(.0019,.0027,.0062),pow(yy,.45));
  ng+=vec3(.055,.034,.017)*uLP*exp(-yy*7.)+vec3(.011,.008,.005)*uLP*exp(-yy*2.2);
  float md=max(dot(direction,uMoon),0.);ng+=vec3(.045,.055,.07)*pow(md,48.)+vec3(.012,.016,.024)*pow(md,6.);
  float disc=smoothstep(.99991,.99995,md);vec3 mp=direction*900.;float mt=.78+.22*fract(sin(dot(floor(mp*1.7),vec3(12.9898,78.233,37.719)))*43758.5453);ng=mix(ng,vec3(1.,.97,.9)*1.5*mt,disc);
  scol=mix(scol,ng,uNSky);}
 float stw=stx*(1.-.65*uLP*exp(-max(direction.y,0.)*3.))*(.55+.45*fract(sin(dot(floor(direction*420.),vec3(7.13,3.71,9.17)))*1531.7));
 gl_FragColor = vec4( scol+vec3(stw*2.2), 1.0 );`);
// ---------- applicazione per ora del giorno ----------
{const at0=applyTOD;applyTOD=function(n){const t=TODS[n]||TODS.pomeriggio;skyU.uNSky.value=t.night>.9?1:0;if(t.moon)skyU.uMoon.value.setFromSphericalCoords(1,THREE.MathUtils.degToRad(90-t.moon[0]),THREE.MathUtils.degToRad(t.moon[1]));
 at0(n);const a=AALT[S.tod]||AALT.pomeriggio;AAL.th=a.th;AAL.th8=Math.min(.95,a.th*.42);matComp.uniforms.uBloom.value=a.b;matComp.uniforms.uSat.value=a.sat;};}
// inquinamento luminoso: il bagliore arancio sull'orizzonte è forte vicino alla città e svanisce in montagna
{const ls1=lightStep;lightStep=function(dt){ls1(dt);const c=camera.position;let d=coreNear(c.x,c.z).d;if(typeof nvNear==='function'&&nvNear(c.x,c.z,0))d=0;skyU.uLP.value=.25+.75*(1-sst(600,4200,d));matComp.uniforms.uCA.value=0;};}
// l'aberrazione cromatica forte trasformava ogni finestrella illuminata in un puntino rosa e viola: ora è appena percettibile
matComp.uniforms.uCA.value=0;
// ---------- occlusione ambientale del suolo in città: tra palazzi alti il cielo si vede meno, alla base dei muri c'è ombra morbida ----------
var AOMAP=null;
function aoBake(){const W=LMAP.W,H=LMAP.H,cs=4,GW=Math.ceil(LMAP.sx/cs),GH=Math.ceil(LMAP.sz/cs),HG=new Float32Array(GW*GH),A=new Float32Array(GW*GH);
 for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const b=bAt(LMAP.x0+(i+.5)*cs,LMAP.z0+(j+.5)*cs);HG[i+j*GW]=b?b.h:0;}
 const dirs=[];for(let k=0;k<12;k++){const a=k/12*TAU;dirs.push([Math.cos(a),Math.sin(a)]);}const D=[.75,1.5,2.5,4,6];
 for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const o=i+j*GW;if(HG[o]>0){A[o]=1;continue;}let occ=0;
  for(const q of dirs){let mx=0;for(const d of D){const ii=Math.round(i+q[0]*d),jj=Math.round(j+q[1]*d);if(ii<0||jj<0||ii>=GW||jj>=GH)break;const h=HG[ii+jj*GW];if(h>0){const e=h/(d*cs);if(e>mx)mx=e;}}occ+=mx/Math.sqrt(1+mx*mx);}
  A[o]=clamp(1-.8*occ/dirs.length,.35,1);}
 // ricampionata bilineare sulla risoluzione della mappa luci
 AOMAP=new Uint8Array(W*H);const px=LMAP.sx/W,pz=LMAP.sz/H;for(let j=0;j<H;j++){const gz=((j+.5)*pz)/cs-.5,j0=Math.max(0,Math.min(GH-1,Math.floor(gz))),j1=Math.min(GH-1,j0+1),tz=clamp(gz-j0,0,1);
  for(let i=0;i<W;i++){const gx=((i+.5)*px)/cs-.5,i0=Math.max(0,Math.min(GW-1,Math.floor(gx))),i1=Math.min(GW-1,i0+1),tx=clamp(gx-i0,0,1);
   const v=(A[i0+j0*GW]*(1-tx)+A[i1+j0*GW]*tx)*(1-tz)+(A[i0+j1*GW]*(1-tx)+A[i1+j1*GW]*tx)*tz;AOMAP[i+j*W]=Math.round(v*255);}}}
{const li0=lightInit;lightInit=function(){try{aoBake();}catch(e){console.warn('occlusione ambientale',e);AOMAP=null;}li0();};}
