/* ======================= PATCH Z — STRADE: USURA, BUCHE VERE, FOSSI, GUARDRAIL, CARTELLI ======================= */
// ---------- gemelli in JavaScript delle funzioni dello shader: le buche che vedi sono le stesse che sentono le sospensioni ----------
const RWJ={ag:0,dm:0,cache:new Map()};
function rwEj(x,y){const m=(v,p)=>{v%=p;return v<0?v+p:v;};let a=m(x,251);a=m(a*(a*7+13)+5,251);a=m(a+m(y,251),251);a=m(a*(a*7+13)+5,251);
 let b=m(y,241);b=m(b*(b*11+3)+17,241);b=m(b+m(x,241),241);b=m(b*(b*11+3)+17,241);return (a*241+b)/60491;}
function rwHj(x,y){const f=v=>v-Math.floor(v);let a=f(x*.1031),b=f(y*.1031),c=a;const d=a*(b+33.33)+b*(c+33.33)+c*(a+33.33);a+=d;b+=d;c+=d;return f((a+b)*c);}
function rwNj(x,y){const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return lerp(lerp(rwHj(ix,iy),rwHj(ix+1,iy),fx),lerp(rwHj(ix,iy+1),rwHj(ix+1,iy+1),fx),fy);}
// stato del tratto (età, danni) con la stessa logica di rwCond
function rwCondJ(s0,s1,base,bias,al){const key=s0*7919+s1*31+base*1000003;let c=RWJ.cache.get(key);
 if(!c){const ag=clamp(rwEj(s0+base*97,s1+base*31)+bias,0,1);c={ag,dm:sst(.72,.97,ag)*(.55+.45*rwEj(s0*3+11,s1*3+base+5))};RWJ.cache.set(key,c);}
 RWJ.ag=c.ag;RWJ.dm=c.dm;if(c.ag<.3)return;
 const rk=Math.floor(al/32),rh=rwEj(rk,s0*31+s1*77+base*13),r0=rk*32+rh*9,r1=Math.min(r0+9+rwEj(rk*7+3,s1*5+base)*18,rk*32+32);
 if(rh>=.84-.3*c.ag&&al>=r0&&r1>=al){RWJ.ag=.04;RWJ.dm=0;}}
// profondità della buca (m) nel punto: stessa logica di rwPot
function rwPotD(al,ac,s0,s1,base,hw){const ag=RWJ.ag,dm=RWJ.dm;const prb=dm*.22+sst(.6,1,ag)*.035;if(prb<=0)return 0;
 const ci0=Math.floor(al/3.1),ci1=Math.floor(ac/2.3);if(rwEj(ci0+s0*31+base*7,ci1+s1*37+3)>=prb)return 0;
 const u1=rwEj(ci0*3+17,ci1*5+base+1),u2=rwEj(ci0*7+base+2,ci1*2+23),u3=rwEj(ci0+41+s0,ci1+59+s1),u4=rwEj(ci0*5+base*5+s0,ci1*3+71+s1);
 const c0=(ci0+.2+.6*u1)*3.1,c1=(ci1+.2+.6*u2)*2.3;if(Math.abs(c1)>hw-.35)return 0;
 const r=.16+.5*u3*u3+.22*dm*u4,d0=al-c0,d1=ac-c1,d=Math.hypot(d0,d1*1.15);if(d>r*1.75)return 0;
 const dd=d+(rwNj(d0*(3.5/r)+u1*40,d1*(3.5/r)+u2*40)-.5)*.42*r;if(dd>r*1.5)return 0;
 const t=clamp((r-dd)/(r*.3),0,1);return (.04+.07*u3)*Math.min(1,r/.45)*t*t*(3-2*t);}
// Manhattan: viali ogni 140 m (carreggiata 18 m), strade ogni 84 m (12 m)
function cityPot(x,z){const ax=x-140*Math.floor(x/140+.5),sz=z-84*Math.floor(z/84+.5);
 if(Math.abs(ax)<=9){const s0=Math.floor(x/140+.5),s1=Math.floor(z/84);rwCondJ(s0,s1,0,0,z);return rwPotD(z,ax,s0,s1,0,9);}
 const s0=Math.floor(x/140)+50,s1=Math.floor(z/84+.5)+50;rwCondJ(s0,s1,0,0,x);return rwPotD(x,sz,s0,s1,0,6);}
// Brooklyn: strade larghe 16 m ogni 100 m (nord-sud) e ogni 80 m (est-ovest)
function bkPot(x,z){const ax2=Math.abs(x)-792,ox=ax2-100*Math.floor(ax2/100+.5),oz=z-80*Math.floor(z/80+.5);
 if(Math.abs(ox)<8){const s0=Math.floor(ax2/100+.5)+(x<0?20:0),s1=Math.floor(z/80);rwCondJ(s0,s1,1,.12,z);return rwPotD(z,ox,s0,s1,1,8);}
 const s0=Math.floor(ax2/100)+(x<0?60:40),s1=Math.floor(z/80+.5)+40;rwCondJ(s0,s1,1,.12,x);return rwPotD(x,oz,s0,s1,1,8);}
// strade extraurbane: tratti di 90 m
function rdPot(x,z,r){const g=RDS[r.i];if(!g)return 0;const s=g.as+(g.bs-g.as)*r.t,dx=g.bx-g.ax,dz=g.bz-g.az,L=Math.hypot(dx,dz)||1,off=((x-g.ax)*-dz+(z-g.az)*dx)/L;
 const s0=Math.floor(s/90);rwCondJ(s0,g.ri,2,0,s);return rwPotD(s,off,s0,g.ri,2,4.2);}
// fosso lungo la strada: sponda interna, fondo, sponda esterna; niente fosso sui rilevati
function rdDitch(r,h){const d=r.d;if(d<=5.2||d>=8.5||!(r.k>0))return 0;const k=r.k*(1-sst(.5,1.8,r.y-h));if(k<=0)return 0;return .85*k*(d<6.3?sst(5.2,6.3,d):d<6.9?1:1-sst(6.9,8.5,d));}
// distanza dal tracciato di una strada precisa
function rdDistTo(ri,x,z){const P=ROADS[ri].P;let bd=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z;let t=((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz);t=clamp(t,0,1);bd=Math.min(bd,Math.hypot(a.x+dx*t-x,a.z+dz*t-z));}return bd;}
// ---------- preparazione: classi delle sezioni (piena, solo carreggiata, nessuna), fossi, incroci ----------
function rdPrep(){
 for(let ri=0;ri<ROADS.length;ri++){const R=ROADS[ri],P=R.P;if(!P)continue;const N=P.length,S=P[N-1].s;
  R.junc=[-1,-1];for(const e of[0,1]){const p=P[e?N-1:0];for(let k=0;k<ROADS.length;k++){if(k===ri||!ROADS[k].P)continue;if(rdDistTo(k,p.x,p.z)<7){R.junc[e]=k;break;}}}
  const br=P.map(p=>p.y-p.g>3);
  P.forEach((p,i)=>{let cls=2;
   if(isCore(p.x,p.z)||inZone(p.x,p.z,2))cls=0;
   else{let nb=false;for(let j=Math.max(0,i-3);j<=Math.min(N-1,i+3);j++)if(br[j])nb=true;
    if(br[i]||coreNear(p.x,p.z).d<22||zoneNear(p.x,p.z)<22||(R.junc[0]>=0&&p.s<22)||(R.junc[1]>=0&&S-p.s<22))cls=1;
    p.nb=nb;}
   if(p.tun&&cls>1)cls=1;p.cls=cls;p.br=br[i];
   let k=cls===2?1:0;if(p.nb||p.tun)k=0;k*=sst(30,90,coreNear(p.x,p.z).d)*sst(25,70,zoneNear(p.x,p.z))*sst(10,40,Math.min(p.s,S-p.s));if(inlandWater(p.x,p.z)>p.g-1.5)k=0;p.dk=k;});}
 // larghezza del corridoio in ogni punto: stretta su ponti, gallerie e incroci, piena altrove, con transizioni graduali
 for(const R of ROADS){const P=R.P;if(!P)continue;const N=P.length;for(const p of P)p.wd=p.cls<2?4.6:14.5;for(let i=1;i<N;i++)P[i].wd=Math.min(P[i].wd,P[i-1].wd+2.6);for(let i=N-2;i>=0;i--)P[i].wd=Math.min(P[i].wd,P[i+1].wd+2.6);}
 for(const R of ROADS)R.segs=[];
 for(const g of RDS){const R=ROADS[g.ri],P=R.P,a=P[g.ia],b=P[g.ia+1];g.ak=a.dk;g.bk=b.dk;g.full=a.cls===2&&b.cls===2;g.wd=Math.min(a.wd,b.wd);g.guard=false;R.segs[g.ia]=g;}}
// ---------- shader del corridoio stradale: terreno + carreggiata consumata + banchina + fosso ----------
const RD_F=`varying vec4 vRd;varying vec2 vTan;uniform float uWetG;uniform float uIM;uniform float uTime;uniform vec3 uSkyZ;uniform vec3 uSkyH;vec3 tRefl=vec3(0.);
void roadShade(){
 float off=vRd.x,ao=abs(off),s=vRd.y,dk=vRd.z,ri=floor(vRd.w+.5);vec2 p=vTW.xz;float dist=length(vTW-cameraPosition);
 float fw=fwidth(s)+fwidth(off)+1e-4;float dst=clamp(vDst,0.,1.);
 vec2 sid=vec2(floor(s/90.),ri);vec4 cd=rwCond(sid,2.,0.,s);float ag=cd.x;
 vec2 T=normalize(vTan+vec2(1e-5,0.));vec2 N=vec2(-T.y,T.x);
 vec3 c=tAlb;float rgh=tRough;vec3 pert=tPert;
 if(ao<5.7){
  float gv=rwN(p*3.1)*.5+rwN(p*.9)*.5;
  vec3 grav=mix(vec3(.19,.18,.16),vec3(.31,.28,.24),gv)*(.8+.4*rwN(p*11.));
  float gin=smoothstep(.35,.85,rwN(p*.6+ri)*.7+(ao-4.4)*.9);
  float vm=smoothstep(4.1,4.35,ao)*(1.-smoothstep(5.05,5.6,ao))*(1.-dst);
  c=mix(c,mix(grav,tAlb,gin),vm);rgh=mix(rgh,.95,vm);
 }
 float edge=4.25-(rwN(vec2(s*.7,ri*5.))*.35+.05)*ag*(1.-cd.w);
 float paved=(1.-smoothstep(edge-fw*.5,edge+fw*.5,ao))*(1.-smoothstep(.35,.7,dst));
 if(paved>0.){
  vec3 a=vec3(.05,.051,.055)*(.75+.35*rwN(p*.35+ri)+.25*rwN(p*11.));a=mix(a,a*1.3,step(.7,rwN(p*.06+5.+ri)));
  vec2 mk=vec2(rwLine(abs(ao-3.52),.075,fw),0.);
  float pz=rwH(vec2(floor(s/300.),ri+.5));float dsh=step(fract(s/12.),.35);
  mk.y=max(rwLine(abs(off-.17),.055,fw)*(pz>.62?dsh:1.),rwLine(abs(off+.17),.055,fw)*(pz<.3?dsh:1.));
  float rough=.85,wet=smoothstep(.82,.9,rwN(p*.045+11.))*uWetG*.9;
  roadWear(p,s,off,4.2,3.5,0.,1e3,sid,dist,2.,cd,uWetG,uIM,a,mk,rough,wet);
  mk=clamp(mk,0.,1.);
  vec3 col=mix(a,vec3(.74,.73,.68)*(.8+.2*rwN(p*2.7)),mk.x);col=mix(col,vec3(.72,.55,.12)*(.85+.15*rwN(p*2.7)),mk.y);
  rough=mix(rough,.62,max(mk.x,mk.y));col=mix(col,col*.38,wet);rough=mix(rough,.05,wet);
  c=mix(c,col,paved);rgh=mix(rgh,rough,paved);
  vec2 g=(T*rwGr.x+N*rwGr.y)*(1.-wet);pert=mix(pert,vec3(-g.x,0.,-g.y),paved);
 }
 if(dk>.02&&ao>5.1&&ao<8.7){
  float pr=ao<6.3?smoothstep(5.2,6.3,ao):(ao<6.9?1.:1.-smoothstep(6.9,8.5,ao));
  float bot=1.-smoothstep(.2,.5,abs(ao-6.6));float sd=off>0.?1.:0.;
  float wl=smoothstep(.66,.8,rwN(vec2(s*.035,ri*7.+sd*13.))+uWetG*.42);
  float mud=smoothstep(.3,.6,rwN(vec2(s*.08,ri*3.+sd*5.)));
  vec3 lush=mix(vec3(.04,.08,.022),vec3(.075,.105,.034),rwN(p*.3+ri))*(.82+.3*rwN(p*2.3));c=mix(c,lush,smoothstep(0.,.35,pr)*dk);
  vec3 mc=mix(vec3(.055,.045,.03),vec3(.1,.085,.055),rwN(p*1.7));
  c=mix(c,mc,bot*max(mud,wl)*dk*.9);rgh=mix(rgh,.8,bot*mud*dk);
  float wf=bot*wl*dk*smoothstep(.6,.9,pr);
  if(wf>.01){vec2 rp=vec2(rwN(p*1.7+uTime*.35),rwN(p*1.9-uTime*.3+7.))-.5;c=mix(c,vec3(.035,.04,.028),wf);rgh=mix(rgh,.06,wf);pert=mix(pert,vec3(rp.x,0.,rp.y)*.05,wf);
   // acqua ferma del fosso: riflette il cielo (prima era nera dove la mappa ambientale non arriva)
   vec3 V=normalize(vTW-cameraPosition);float fr=.02+.98*pow(1.-clamp(-V.y,0.,1.),5.);vec3 Rw=reflect(V,normalize(vec3(rp.x*.05,1.,rp.y*.05)));tRefl=mix(uSkyH,uSkyZ,pow(clamp(Rw.y,0.,1.),.6))*fr*wf*.85;}
 }
 if(dk<-.5){c*=.3;}
 tAlb=c;tRough=rgh;tPert=pert;}`;
function rdMatF(po){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0,polygonOffset:true,polygonOffsetFactor:po,polygonOffsetUnits:po}),hole={value:new THREE.Vector4(0,0,0,0)};
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{tFor:U.tFor,tRiv:U.tRiv,uHole:hole,uWetG:U.uWetG,uIM:U.uIM,uTime:U.uTime,uSkyZ:U.uSkyZ,uSkyH:U.uSkyH,uCrt:U.uCrt,uCrtN:U.uCrtN});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vTW;varying vec3 vTN;attribute float aDst;varying float vDst;attribute vec4 aRd;attribute vec2 aTan;varying vec4 vRd;varying vec2 vTan;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvTW=(modelMatrix*vec4(transformed,1.)).xyz;vTN=normalize(mat3(modelMatrix)*objectNormal);vDst=aDst;vRd=aRd;vTan=aTan;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+TER_F+RW_GLSL+RD_F+CRT_GLSL).replace('#include <map_fragment>','#include <map_fragment>\nterrainShade();roadShade();if(crCut(vTW.xz,tAlb)>.5)discard;diffuseColor.rgb=tAlb;')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=tRough;').replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+(viewMatrix*vec4(tPert,0.)).xyz);').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=tRefl;');};
 m.customProgramCacheKey=()=>'rdcor'+po;return m;}
// ---------- geometria: sezioni trasversali ogni 10 m, a pezzi di ~500 m (vengono scartati quando sono fuori dall'inquadratura) ----------
const RDCOR={OFF:[-14.5,-12.4,-10.6,-9.3,-8.5,-7.7,-6.9,-6.3,-5.75,-5.2,-4.6,-4.2,-3.5,-1.75,0,1.75,3.5,4.2,4.6,5.2,5.75,6.3,6.9,7.7,8.5,9.3,10.6,12.4,14.5],chunks:[],mats:[]};
function rdRows(ri){const R=ROADS[ri],P0=R.P,rows=[];
 // accorcia la strada secondaria agli incroci: finisce sul bordo della carreggiata principale
 let P=P0.slice();for(const e of[0,1]){const k=R.junc[e];if(k<0)continue;const Q=e?P.slice().reverse():P;let cut=-1;
  for(let i=0;i<Q.length-1;i++){const d0=rdDistTo(k,Q[i].x,Q[i].z),d1=rdDistTo(k,Q[i+1].x,Q[i+1].z);if(d0<4&&d1>=4){const t=(4-d0)/(d1-d0),a=Q[i],b=Q[i+1];Q[i]={x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),y:lerp(a.y,b.y,t),g:lerp(a.g,b.g,t),s:lerp(a.s,b.s,t),cls:1,dk:0,br:false};cut=i;break;}if(d0>=4)break;}
  if(cut>0)Q.splice(0,cut);if(e)P=Q.reverse();else P=Q;}
 for(let i=0;i<P.length;i++){const p=P[i],a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;rows.push({p,tx:(b.x-a.x)/l,tz:(b.z-a.z)/l});}
 return rows;}
function rdChunk(rows,ri,mat){const OFF=RDCOR.OFF,C=OFF.length,n=rows.length,pos=new Float32Array(n*C*3),nor=new Float32Array(n*C*3),rd=new Float32Array(n*C*4),tan=new Float32Array(n*C*2),dst=new Float32Array(n*C),idx=[];
 // larghezza del corridoio che cresce gradualmente tra i tratti stretti (ponti, gallerie, incroci) e quelli pieni: niente triangoli stirati in diagonale
 const WD=rows.map(q=>q.p.cls<2?4.6:(q.p.wd||14.5));
 for(let r=0;r<n;r++){const {p,tx,tz}=rows[r],nx=-tz,nz=tx,narrow=p.cls<2,wd=WD[r];
  for(let c=0;c<C;c++){let o=OFF[c];o=clamp(o,-wd,wd);const x=p.x+nx*o,z=p.z+nz*o,k=r*C+c;let y,dke=0;
   if(p.tun)dke=-1;if(p.br||p.tun)y=p.y;else if(narrow)y=p.y+(CRT.L.length?tmodQ(x,z):0);else{y=worldH(x,z);dke=RDDK/.85;}
   pos[k*3]=x;pos[k*3+1]=y+.015;pos[k*3+2]=z;
   rd[k*4]=o;rd[k*4+1]=p.s;rd[k*4+2]=dke;rd[k*4+3]=ri;tan[k*2]=tx;tan[k*2+1]=tz;dst[k]=CRT.L.length?tmodDst(x,z):0;}}
 for(let r=0;r<n-1;r++)for(let c=0;c<C-1;c++){const a=r*C+c,b=a+C;idx.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('aRd',new THREE.BufferAttribute(rd,4));g.setAttribute('aTan',new THREE.BufferAttribute(tan,2));g.setAttribute('aDst',new THREE.BufferAttribute(dst,1));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();g.computeBoundingBox();
 const m=new THREE.Mesh(g,mat);m.receiveShadow=true;scene.add(m);RDCOR.chunks.push({m,g,rows,ri,box:g.boundingBox});const bs=g.boundingSphere;lodReg(m,3200,bs.center.x,bs.center.y,bs.center.z,bs.radius);return m;}
// crateri sulle strade: la carreggiata sprofonda insieme al terreno e diventa terra bruciata
function rdCrater(x,z,r){for(const ch of RDCOR.chunks){const B=ch.box;if(x+r<B.min.x||x-r>B.max.x||z+r<B.min.z||z-r>B.max.z)continue;const P=ch.g.attributes.position,D=ch.g.attributes.aDst,RD=ch.g.attributes.aRd;let any=false;
  for(let i=0;i<P.count;i++){const px=P.getX(i),pz=P.getZ(i);if(Math.abs(px-x)>r||Math.abs(pz-z)>r)continue;const row=ch.rows[Math.floor(i/RDCOR.OFF.length)];if(row.p.br)continue;P.setY(i,worldH(px,pz)+.015);D.setX(i,tmodDst(px,pz));any=true;}
  if(any){P.needsUpdate=D.needsUpdate=true;ch.g.computeVertexNormals();}}}
// ---------- strade extraurbane complete: corridoi, ponti, delineatori, guardrail, cartelli, canneti nei fossi ----------
buildRoads=function(){const conc=MS(0x8c8a85,.85,0),deck=[],par=[],pier=[],dl=[],gp=[],gr=[],reed=[],signs={sp:[],cr:[],cl:[],gd:[]},spost=[];
 RDCOR.mats=[rdMatF(-2),rdMatF(-4)];
 for(let ri=0;ri<ROADS.length;ri++){const R=ROADS[ri],P=R.P;if(!P)continue;const side=R.junc[0]>=0||R.junc[1]>=0,mat=RDCOR.mats[side?1:0];
  const rows=rdRows(ri);let run=[];const flush=()=>{if(run.length>1)rdChunk(run,ri,mat);run=[];};
  for(const rw of rows){if(rw.p.cls===0){flush();continue;}run.push(rw);if(run.length>=52){const last=run[run.length-1];flush();run.push(last);}}flush();
  // ponti: impalcato, parapetti, piloni (come prima)
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],br=a.y-a.g>3&&b.y-b.g>3,mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,my=(a.y+b.y)/2,L=Math.hypot(b.x-a.x,b.z-a.z),ry=Math.atan2(b.x-a.x,b.z-a.z),pt=Math.atan2(b.y-a.y,L);
   if(a.tun&&b.tun)continue;
   if(br){deck.push([mx,my-.68,mz,ry,pt,11,1.3,L+.3]);for(const s of[-1,1])par.push([mx+Math.cos(ry)*s*5.4,my+.45,mz-Math.sin(ry)*s*5.4,ry,pt,.3,.95,L+.3]);if(i%3===0){const gb=a.g,hh=a.y-1.3-gb;if(hh>1)pier.push([a.x,gb+hh/2,a.z,ry,0,2.4,hh,2.4]);}continue;}
   if(a.cls===0||b.cls===0)continue;
   // guardrail sui rilevati alti e vicino alle spalle dei ponti
   const emb=Math.max(a.y-a.g,b.y-b.g)>2||a.nb||b.nb;
   if(emb){const seg=R.segs[i];if(seg)seg.guard=true;
    for(const s of[-1,1]){const ox=Math.cos(ry)*s*4.75,oz=-Math.sin(ry)*s*4.75;gr.push([mx+ox,my+.62,mz+oz,ry+(s>0?Math.PI:0),pt*(s>0?-1:1),1,1,L+.05]);
     for(let t=0;t<L;t+=4){const u=t/L,x=lerp(a.x,b.x,u)+ox,z=lerp(a.z,b.z,u)+oz,y=lerp(a.y,b.y,u);gp.push([x,y+.37,z,ry,0,.12,.75,.16]);}}}
   else if(i%6===0)for(const s of[-1,1]){const x=a.x+Math.cos(ry)*s*4.95,z=a.z-Math.sin(ry)*s*4.95;dl.push([x,worldH(x,z),z,ry+(s>0?Math.PI:0)]);}
   // canne e tife nei tratti del fosso con acqua ferma
   if(a.dk>.4&&b.dk>.4)for(let t=0;t<L;t+=2.6){const u=t/L,s=lerp(a.s,b.s,u);for(const sd of[0,1]){const wl=sst(.52,.7,rwNj(s*.035,ri*7+sd*13));if(wl<.5||rwHj(s*1.3,ri+sd*7)<.35)continue;
     const o=(sd?1:-1)*(6.6+(rwHj(s,sd+ri)-.5)*.5),x=lerp(a.x,b.x,u)+Math.cos(ry)*o,z=lerp(a.z,b.z,u)-Math.sin(ry)*o;reed.push([x,worldH(x,z)-.05,z,rwHj(s*3.1,ri)*TAU,.8+.6*rwHj(s*2.3,sd)]);}}
  }
  // cartelli: limite di velocità ogni ~1,8 km, curva pericolosa prima delle curve strette, indicazioni per Cube York all'inizio
  if(P.length>20){const S=P[P.length-1].s;
   const put=(kind,i,dir)=>{const p=P[i];if(!p||p.cls!==2||p.br)return;const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],ry=Math.atan2(b.x-a.x,b.z-a.z),sgn=dir>0?1:-1,o=5.6*sgn;const nx=-(b.z-a.z),nz=b.x-a.x,l=Math.hypot(nx,nz)||1;
    const x=p.x+nx/l*o,z=p.z+nz/l*o,y=worldH(x,z),face=ry+(dir>0?Math.PI:0);signs[kind].push([x,y,z,face]);spost.push([x,y+1.1,z,face,0,.07,2.2,.07]);};
   for(let s=600;s<S-300;s+=1800){const i=P.findIndex(p=>p.s>=s);if(i>0){put('sp',i,1);put('sp',Math.min(P.length-1,i+3),-1);}}
   for(let i=12;i<P.length-12;i++){const h0=Math.atan2(P[i].x-P[i-3].x,P[i].z-P[i-3].z),h1=Math.atan2(P[i+3].x-P[i].x,P[i+3].z-P[i].z);let dh=h1-h0;dh=Math.atan2(Math.sin(dh),Math.cos(dh));
    if(Math.abs(dh)>.42&&!(P[i].curveSign)){for(let j=i-3;j<=i+3;j++)P[j].curveSign=1;const right=dh<0;put(right?'cr':'cl',i-9,1);put(right?'cl':'cr',Math.min(P.length-1,i+9),-1);}}
   if(R.junc[0]<0)put('gd',Math.min(P.length-1,6),-1);if(R.junc[1]<0)put('gd',Math.max(0,P.length-7),1);}
 }
 const setB=(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(-q[4],q[3],0,'YXZ');d.scale.set(q[5],q[6],q[7]);};
 const inst=(L,mat2,sh,geo,far,tile)=>tiledInst(geo||boxGeo,mat2,L,{tile:tile||500,far:far||1200,cast:sh,set:setB});
 inst(deck,conc,true,null,4500,900);inst(par,conc,true,null,2500,900);inst(pier,conc,true,null,4500,900);
 {const B=Bin(),c1=C3(0xb4b8bb),c2=C3(0x6d7276);cBox(B,.05,.11,1,.035,.1,0,c1);cBox(B,.04,.1,1,0,0,0,c2);cBox(B,.05,.11,1,.035,-.1,0,c1);cBox(B,.03,.05,1,-.02,0,0,c2);inst(gr,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:.75}),true,mergeBin(B),1300);}inst(gp,MS(0x8e9295,.5,.6),false,null,550);inst(spost,MS(0x9aa0a4,.45,.7),false,null,900);
 // delineatori: paletto bianco con fascia nera e catarifrangente
 if(dl.length){const B=Bin();cBox(B,.11,1.0,.11,0,.5,0,C3(0xecebe6));cBox(B,.115,.24,.115,0,.83,0,C3(0x151515));tiledInst(mergeBin(B),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5}),dl,{tile:500,far:600,set:(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(1,1,1);}});}
 // cartelli (atlante disegnato su canvas)
 const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const g=cv.getContext('2d');
 {g.fillStyle='#f4f4ef';g.fillRect(8,8,240,240);g.strokeStyle='#111';g.lineWidth=7;g.strokeRect(18,18,220,220);g.fillStyle='#111';g.textAlign='center';g.font='900 40px Arial';g.fillText('SPEED',128,70);g.fillText('LIMIT',128,112);g.font='900 104px Arial';g.fillText('55',128,215);}
 const dia=(x0,right)=>{g.save();g.translate(x0+128,128);g.rotate(Math.PI/4);g.fillStyle='#f2c200';g.fillRect(-84,-84,168,168);g.strokeStyle='#111';g.lineWidth=8;g.strokeRect(-76,-76,152,152);g.restore();
  g.save();g.translate(x0+128,128);if(!right)g.scale(-1,1);g.strokeStyle='#111';g.lineWidth=16;g.lineCap='round';g.beginPath();g.moveTo(-14,70);g.lineTo(-14,10);g.quadraticCurveTo(-14,-30,30,-36);g.stroke();g.fillStyle='#111';g.beginPath();g.moveTo(50,-38);g.lineTo(22,-62);g.lineTo(22,-12);g.closePath();g.fill();g.restore();};
 dia(256,true);dia(512,false);
 {g.fillStyle='#0b6b3a';g.fillRect(776,40,240,176);g.strokeStyle='#f4f4ef';g.lineWidth=6;g.strokeRect(786,50,220,156);g.fillStyle='#f4f4ef';g.textAlign='center';g.font='900 38px Arial';g.fillText('CUBE YORK',896,112);g.font='700 30px Arial';g.fillText('CITY CENTER',896,160);g.font='700 26px Arial';g.fillText('◄ ►',896,196);}
 const st=new THREE.CanvasTexture(cv);st.encoding=THREE.sRGBEncoding;st.anisotropy=4;const smat=new THREE.MeshStandardMaterial({map:st,roughness:.45,metalness:.1,alphaTest:.5,transparent:false});
 const back=MS(0x8a9095,.5,.6);
 const plate=(L,u0,w,h,y0)=>{if(!L.length)return;const pg=new THREE.PlaneGeometry(w,h),uv=pg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,u0+uv.getX(i)*.25);uv.needsUpdate=true;pg.translate(0,y0,.05);
  const bg=new THREE.BoxGeometry(w*.98,h*.98,.03).translate(0,y0,0),st2=(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(1,1,1);};
  tiledInst(pg,smat,L,{tile:800,far:900,set:st2});tiledInst(bg,back,L,{tile:800,far:900,cast:true,set:st2});};
 plate(signs.sp,0,.75,.75,1.85);plate(signs.cr,.25,.9,.9,1.85);plate(signs.cl,.5,.9,.9,1.85);plate(signs.gd,.75,1.6,1.2,2.05);
 // canneti: ciuffi di foglie strette e tife scure
 if(reed.length){const A=reedAssets();RDCOR.reeds=tiledInst(A.geo,A.mat,reed,{tile:300,far:350,set:(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(q[4],q[4],q[4]);}});}
};
// i crateri delle esplosioni deformano anche il corridoio stradale
{const _tc0=terrainCrater;terrainCrater=function(x,z,R,dep){_tc0(x,z,R,dep);if(RDCOR.chunks.length)rdCrater(x,z,R*1.8);};}
// le auto rimbalzano sul guardrail invece di attraversarlo
function rdGuard(){for(const b of dynCars){if(b.dead||isCore(b.px,b.pz)||!RDG)continue;const r=roadQ(b.px,b.pz);if(!r||r.d<4.15||r.d>5.3)continue;const g=RDS[r.i];if(!g||!g.guard)continue;
  const dx=g.bx-g.ax,dz=g.bz-g.az,L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L,off=(b.px-g.ax)*nx+(b.pz-g.az)*nz,sg=off>0?1:-1;if(b.py-(r.y)>2.5)continue;
  const vn=(b.vx*nx+b.vz*nz)*sg;if(Math.abs(off)>4.35&&vn>0){const push=Math.abs(off)-4.35;b.px-=nx*sg*push;b.pz-=nz*sg*push;b.vx-=nx*sg*vn*1.35;b.vz-=nz*sg*vn*1.35;b.vx*=.9;b.vz*=.9;
   if(vn>5){dent(b,b.px+nx*sg*1.,b.py+.3,b.pz+nz*sg*1.,-nx*sg,0,-nz*sg,vn*2);sndImpact(b.px,b.py,b.pz,'metal',vn);sparks(b.px+nx*sg,b.py,b.pz+nz*sg,Math.min(40,Math.round(vn*3)),3);}}}}
{const s0=cvStep;cvStep=function(dt){s0(dt);rdGuard();};}
