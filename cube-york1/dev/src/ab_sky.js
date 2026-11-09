/* ======================= PATCH AB — CIELO FISICO, PROSPETTIVA AEREA, OMBRE DELLE NUVOLE, LUCE DAL CIELO ======================= */
// Il cielo non è più una formula approssimata: è calcolato integrando la diffusione della luce del sole nell'atmosfera
// (molecole d'aria = Rayleigh, il blu; foschia e goccioline = Mie, l'alone bianco attorno al sole; ozono, che rende
// blu-viola il cielo del crepuscolo), lungo ogni direzione di vista, con il sole visto attraverso tutta l'aria che
// attraversa (rosso al tramonto). Lo stesso modello colora:
// - la foschia in lontananza (prospettiva aerea: le montagne lontane prendono il colore del cielo in quella direzione,
//   azzurre controsole, dorate verso il sole al tramonto),
// - la luce del sole (colore e forza dopo l'attraversamento dell'atmosfera) e la luce diffusa del cielo,
// - le nubi proiettano ombre vere sul terreno, sui palazzi e sull'acqua, che scorrono col vento.
const ATM={Rg:6360e3,Rt:6460e3,bR:[5.802e-6,13.558e-6,33.1e-6],HR:8000,bMs:3.996e-6,bMe:4.44e-6,HM:1200,bO:[.65e-6,1.881e-6,.085e-6],g:.8,TT:null,NH:32,NM:96};
function atmDens(h){return[Math.exp(-h/ATM.HR),Math.exp(-h/ATM.HM),Math.max(0,1-Math.abs(h-25000)/15000)];}
function atmRay(r,mu,R){const b=r*mu,c=r*r-R*R,d=b*b-c;if(d<0)return -1;const s=Math.sqrt(d),t1=-b-s,t2=-b+s;return t1>0?t1:(t2>0?t2:-1);}
// tabella della trasmittanza dalla quota h verso la direzione con coseno zenitale mu fino al bordo dell'atmosfera
function atmTable(){const NH=ATM.NH,NM=ATM.NM,T=new Float32Array(NH*NM*3);
 for(let j=0;j<NH;j++){const h=Math.pow(j/(NH-1),2)*(ATM.Rt-ATM.Rg),r=ATM.Rg+h;
  for(let i=0;i<NM;i++){const mu=-1+2*i/(NM-1),o=(j*NM+i)*3;if(atmRay(r,mu,ATM.Rg)>0){T[o]=T[o+1]=T[o+2]=0;continue;}
   const L=atmRay(r,mu,ATM.Rt),n=40,dt=L/n;let tR=0,tM=0,tO=0;for(let k=0;k<n;k++){const t=(k+.5)*dt,px=r+mu*t,py=Math.sqrt(Math.max(0,1-mu*mu))*t,hh=Math.hypot(px,py)-ATM.Rg,d=atmDens(hh);tR+=d[0]*dt;tM+=d[1]*dt;tO+=d[2]*dt;}
   for(let c=0;c<3;c++)T[o+c]=Math.exp(-(ATM.bR[c]*tR+ATM.bMe*tM*ATM.hz+ATM.bO[c]*tO));}}ATM.TT=T;}
function atmTr(h,mu,out){const NH=ATM.NH,NM=ATM.NM,fj=Math.sqrt(clamp(h/(ATM.Rt-ATM.Rg),0,1))*(NH-1),fi=(clamp(mu,-1,1)+1)/2*(NM-1),j0=Math.min(NH-2,Math.floor(fj)),i0=Math.min(NM-2,Math.floor(fi)),tj=fj-j0,ti=fi-i0,T=ATM.TT;
 for(let c=0;c<3;c++){const a=T[(j0*NM+i0)*3+c],b=T[(j0*NM+i0+1)*3+c],d=T[((j0+1)*NM+i0)*3+c],e=T[((j0+1)*NM+i0+1)*3+c];out[c]=(a+(b-a)*ti)*(1-tj)+(d+(e-d)*ti)*tj;}return out;}
// ---------- tabella del cielo (azimut rispetto al sole × elevazione, più fitta vicino all'orizzonte) ----------
const SKYL={W:64,H:64,f:null,tex:null,row:-1,sunEl:99,hz:-1,ver:0,K:1,on:false};
ATM.hz=1;
function skyLutInit(){const W=SKYL.W,H=SKYL.H;SKYL.f=new Float32Array(W*H*4);SKYL.h=new Uint16Array(W*H*4);
 SKYL.tex=new THREE.DataTexture(SKYL.h,W,H,THREE.RGBAFormat,THREE.HalfFloatType);SKYL.tex.magFilter=SKYL.tex.minFilter=THREE.LinearFilter;SKYL.tex.wrapS=SKYL.tex.wrapT=THREE.ClampToEdgeWrapping;SKYL.tex.needsUpdate=true;SKYL.tex.clone=function(){return this;};}
const _tv=[0,0,0],_tl=[0,0,0];
function skyLutRow(j,sel){const W=SKYL.W,H=SKYL.H,v=(j+.5)/H,sg=v<.5?-1:1,q=Math.abs(v-.5)*2,el=sg*q*q*Math.PI/2,h0=200,r0=ATM.Rg+h0,se=Math.sin(sel),ce=Math.cos(sel),bMs=ATM.bMs*ATM.hz,bMe=ATM.bMe*ATM.hz;
 for(let i=0;i<W;i++){const az=(i+.5)/W*Math.PI,dx=Math.cos(el)*Math.cos(az),dy=Math.sin(el),dz=Math.cos(el)*Math.sin(az),cth=dx*ce+dy*se;
  const PR=.0596831*(1+cth*cth),g=ATM.g,PM=.1193662*(1-g*g)*(1+cth*cth)/((2+g*g)*Math.pow(1+g*g-2*g*cth,1.5));
  let tg=atmRay(r0,dy,ATM.Rg),L=tg>0?tg:atmRay(r0,dy,ATM.Rt);L=Math.min(L,dy<.02?380e3:L);const n=24;let tR=0,tM=0,tO=0,R0=0,G0=0,B0=0,tPrev=0;
  for(let k=0;k<n;k++){const t=L*Math.pow((k+.5)/n,1.6),dt=L*(Math.pow((k+1)/n,1.6)-Math.pow(k/n,1.6)),px=dx*t,py=r0+dy*t,pz=dz*t,rr=Math.hypot(px,py,pz),hh=rr-ATM.Rg,d=atmDens(hh);
   tR+=d[0]*dt;tM+=d[1]*dt;tO+=d[2]*dt;const mus=(px*ce+py*se)/rr;atmTr(hh,mus,_tl);
   for(let c=0;c<3;c++){const tv=Math.exp(-(ATM.bR[c]*tR+bMe*tM+ATM.bO[c]*tO)),s=(ATM.bR[c]*d[0]*PR*1.25+bMs*d[1]*PM)*_tl[c]*tv*dt;if(c===0)R0+=s;else if(c===1)G0+=s;else B0+=s;}}
  const o=(j*W+i)*4;SKYL.f[o]=R0;SKYL.f[o+1]=G0;SKYL.f[o+2]=B0;SKYL.f[o+3]=1;}}
function skyLutFinish(){const F=SKYL.f,Hh=SKYL.h,toH=THREE.DataUtils.toHalfFloat;for(let i=0;i<F.length;i++)Hh[i]=toH(Math.min(6e4,F[i]*SKYL.K));SKYL.tex.needsUpdate=true;SKYL.on=true;SKYL.ver++;}
// elevazione reale del sole (anche di notte, per il crepuscolo): dall'ora del giorno scelta
function skySunEl(){return THREE.MathUtils.degToRad((TODC&&TODC.el!==undefined)?TODC.el:30);}
function skySunAz(){return THREE.MathUtils.degToRad((TODC&&TODC.az!==undefined)?TODC.az:200);}
function skyHaze(){const cl=(typeof WX!=='undefined'&&WX.cloud)||0,rn=(typeof WX!=='undefined'&&WX.rain)||0;return 1+(TODC&&TODC.tur?(TODC.tur-3)*.18:0)+cl*2.5+rn*3;}
function skyLutStep(){if(!ATM.TT){ATM.hz=skyHaze();atmTable();}if(!SKYL.f)skyLutInit();const sel=skySunEl(),hz=skyHaze();
 if(SKYL.row<0){if(Math.abs(sel-SKYL.sunEl)>.002||Math.abs(hz-SKYL.hz)>.25){SKYL.sunEl=sel;SKYL.hz=hz;if(Math.abs(hz-ATM.hz)>.25){ATM.hz=hz;atmTable();}SKYL.row=0;}else return;}
 for(let k=0;k<6&&SKYL.row<SKYL.H;k++)skyLutRow(SKYL.row++,SKYL.sunEl);if(SKYL.row>=SKYL.H){SKYL.row=-1;skyLutFinish();skyLights();}}
// ---------- luce del sole e del cielo dal modello ----------
const SKYC={sun:new THREE.Color(1,1,1),zen:new THREE.Color(),hor:new THREE.Color(),ok:false};
function skyLights(){const sel=SKYL.sunEl,t=atmTr(200,Math.sin(sel),[0,0,0]);const m=Math.max(t[0],t[1],t[2],1e-4);SKYC.sun.setRGB(t[0]/m,t[1]/m,t[2]/m);SKYC.sunLum=.2126*t[0]+.7152*t[1]+.0722*t[2];
 const W=SKYL.W,H=SKYL.H,F=SKYL.f,at=(i,j)=>{const o=(j*W+i)*4;return[F[o],F[o+1],F[o+2]];};const z=at(W>>1,H-1),hz=[0,0,0];for(let i=0;i<W;i++){const c=at(i,(H>>1)+1);hz[0]+=c[0]/W;hz[1]+=c[1]/W;hz[2]+=c[2]/W;}
 SKYC.zen.setRGB(z[0],z[1],z[2]);SKYC.hor.setRGB(hz[0],hz[1],hz[2]);SKYC.ok=true;}
// ---------- nel cielo: la tabella al posto della formula (di giorno e al crepuscolo; di notte resta il cielo notturno) ----------
skyLutInit();U.tSkyL={value:SKYL.tex};U.uSkyL={value:new THREE.Vector4(0,0,0,1)};U.uSkyL.value.clone=function(){return this;};
skyU.tSkyL=U.tSkyL;skyU.uSkyL=U.uSkyL;
const SKY_GLSL=`uniform sampler2D tSkyL;uniform vec4 uSkyL;
vec3 abSky(vec3 d){float az=atan(d.z,d.x)-uSkyL.y;az=abs(mod(az+3.14159265,6.2831853)-3.14159265);float el=asin(clamp(d.y,-1.,1.));float v=.5+.5*sign(el)*sqrt(abs(el)/1.5707963);return texture2D(tSkyL,vec2(az/3.14159265,clamp(v,.004,.996))).rgb;}`;
U.uSkySun={value:new THREE.Color(1,1,1)};skyU.uSkySun=U.uSkySun;
sky.material.fragmentShader=sky.material.fragmentShader.replace('uniform float uStars;','uniform float uStars;\nuniform vec3 uSkySun;\n'+SKY_GLSL)
 .replace('vec3 scol=retColor*skyScale;','vec3 scol=retColor*skyScale;if(uSkyL.x>.5){vec3 sk=abSky(direction);float sd=dot(direction,vSunDirection);float disc=smoothstep(.99990,.99995,sd);'
 +'float limb=.45+.55*sqrt(clamp((sd-.9999)/.0001,0.,1.));sk+=uSkySun*disc*limb*uSkyL.z;scol=mix(scol,sk,uSkyL.w);}');
sky.material.needsUpdate=true;
// ---------- prospettiva aerea per tutti i materiali con la nebbia ----------
THREE.ShaderChunk.fog_pars_vertex+='\n#ifdef USE_FOG\nvarying vec3 vFogDir;\n#endif\n';
THREE.ShaderChunk.fog_vertex+='\n#ifdef USE_FOG\nvFogDir=(vec4(mvPosition.xyz,0.)*viewMatrix).xyz;\n#endif\n';
THREE.ShaderChunk.fog_pars_fragment+='\n#ifdef USE_FOG\nvarying vec3 vFogDir;uniform sampler2D tSkyL;uniform vec4 uSkyL;uniform vec4 uSkyF;\n'+SKY_GLSL.replace('uniform sampler2D tSkyL;uniform vec4 uSkyL;','')+'\n#endif\n';
THREE.ShaderChunk.fog_fragment=THREE.ShaderChunk.fog_fragment.replace('gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );',
 'vec3 fogC=fogColor;if(uSkyL.x>.5){vec3 dd=normalize(vFogDir);dd.y=max(dd.y,-.02);fogC=mix(abSky(dd)*uSkyF.x,fogColor,uSkyF.y);}\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogC, fogFactor );');
U.uSkyF={value:new THREE.Vector4(1,0,0,0)};U.uSkyF.value.clone=function(){return this;};
for(const k in THREE.ShaderLib){const L=THREE.ShaderLib[k];if(L.uniforms&&L.uniforms.fogColor){L.uniforms.tSkyL=U.tSkyL;L.uniforms.uSkyL=U.uSkyL;L.uniforms.uSkyF=U.uSkyF;}}
// costante di scala: la foschia dell'orizzonte di giorno torna alla luminosità di prima (la scena resta esposta come prima)
function skyRefK(){if(!ATM.TT){ATM.hz=skyHaze();atmTable();}const keep=SKYL.f.slice(0),j=(SKYL.H>>1)+2;skyLutRow(j,THREE.MathUtils.degToRad(57));let L=0;const W=SKYL.W;for(let i=0;i<W;i++){const o=(j*W+i)*4;L+=(.2126*SKYL.f[o]+.7152*SKYL.f[o+1]+.0722*SKYL.f[o+2])/W;}SKYL.f.set(keep);return .6/Math.max(1e-9,L);}
function skyFrame(dt){try{if(SKYL.K===1)SKYL.K=skyRefK();skyLutStep();}catch(e){if(!SKYL.err){SKYL.err=1;console.warn('cielo',e);}return;}
 const sp=skyU.sunPosition.value,sel=SKYL.sunEl,day=sst(-.16,-.01,sel),cl=(typeof WX!=='undefined'&&WX.cloud)||0;
 U.uSkyL.value.set(SKYL.on&&day>.01?1:0,Math.atan2(sp.z,sp.x),(1-cl*.95)*2500*(SKYC.sunLum||1),day*(1-cl*.15));
 U.uSkySun.value.copy(SKYC.sun);U.uSkyF.value.set(1,Math.max(1-day,cl*.85),0,0);
 if(SKYL.ver!==SKYL.envV&&SKYL.on){SKYL.envV=SKYL.ver;try{dropProbe();makeSkyEnv();}catch(e){}}}
{const ls=lightStep;lightStep=function(dt){ls(dt);skyFrame(dt);};}
// ---------- ombre delle nubi: mappa vista dal sole, calcolata con la stessa densità delle nuvole volumetriche ----------
const CSH={N:96,S:7200,x0:0,z0:0,d:null,tex:null,row:-1,cx:1e9,cz:1e9,w:[0,0]};
U.tCSh={value:null};U.uCSh={value:new THREE.Vector4(0,0,1/7200,0)};U.uCSh.value.clone=function(){return this;};
(function(){const N=CSH.N;CSH.d=new Uint8Array(N*N).fill(255);CSH.tex=new THREE.DataTexture(CSH.d,N,N,GL2?THREE.RedFormat:THREE.LuminanceFormat);CSH.tex.magFilter=CSH.tex.minFilter=THREE.LinearFilter;CSH.tex.wrapS=CSH.tex.wrapT=THREE.ClampToEdgeWrapping;CSH.tex.needsUpdate=true;CSH.tex.clone=function(){return this;};U.tCSh.value=CSH.tex;})();
THREE.ShaderChunk.lights_pars_begin+='\nuniform sampler2D tCSh;uniform vec4 uCSh;\nfloat abCloudSh(vec3 vp){if(uCSh.w<.5)return 1.;vec3 w=(vec4(vp-viewMatrix[3].xyz,0.)*viewMatrix).xyz;vec2 q=(w.xz-uCSh.xy)*uCSh.z;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)return 1.;return mix(1.,texture2D(tCSh,q).r,uCSh.w-.5);}\n';
{const k='\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 )';const c=THREE.ShaderChunk.lights_fragment_begin;
 if(c.indexOf(k)>=0)THREE.ShaderChunk.lights_fragment_begin=c.replace(k,'\t\tif(UNROLLED_LOOP_INDEX==0)directLight.color*=abCloudSh(geometry.position);\n'+k);else console.warn('ombre nubi: punto di innesto non trovato');}
for(const k in THREE.ShaderLib){const L=THREE.ShaderLib[k];if(L.uniforms&&L.uniforms.directionalLights){L.uniforms.tCSh=U.tCSh;L.uniforms.uCSh=U.uCSh;}}
function cshTexel(u){return u;}
// campionamento della texture 3D del rumore delle nubi (stessa interpolazione della scheda video, ripetuta)
function cshTN(D,N,x,y,z,ch){x=x*N-.5;y=y*N-.5;z=z*N-.5;const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz;let r=0;
 for(let k=0;k<8;k++){const a=k&1,b=(k>>1)&1,c=(k>>2)&1,X=((ix+a)%N+N)%N,Y=((iy+b)%N+N)%N,Z=((iz+c)%N+N)%N;r+=D[(X+N*(Y+N*Z))*4+ch]*(a?fx:1-fx)*(b?fy:1-fy)*(c?fz:1-fz);}return r/255;}
function cshStep(){const dome=WX.dome;if(!dome||!dome.material.uniforms||!dome.material.uniforms.tN||!sunDir||sunDir.y<.05||WX.cloud<.03){U.uCSh.value.w=0;return;}
 const u=dome.material.uniforms,T=u.tN.value.image,D=T.data,N=T.width,cp=camera.position;if(!D)return;
 if(CSH.row<0){if(Math.abs(cp.x-CSH.cx)>900||Math.abs(cp.z-CSH.cz)>900){CSH.cx=Math.round(cp.x/100)*100;CSH.cz=Math.round(cp.z/100)*100;}CSH.nx0=CSH.cx-CSH.S/2;CSH.nz0=CSH.cz-CSH.S/2;CSH.w=[u.uWind.value.x,u.uWind.value.y];CSH.row=0;CSH.buf=CSH.buf||new Uint8Array(CSH.N*CSH.N);}
 const uT=u.uT.value,st=u.uStorm.value,cv=clamp(u.uC.value*.6+st*.36,0,1),hb=1250,ht=hb+lerp(950,3300,st),sx=sunDir.x/sunDir.y,sz=sunDir.z/sunDir.y,cs=CSH.S/CSH.N,Nn=CSH.N;
 for(let r=0;r<8&&CSH.row<Nn;r++,CSH.row++){const j=CSH.row;for(let i=0;i<Nn;i++){const gx=CSH.nx0+(i+.5)*cs,gz=CSH.nz0+(j+.5)*cs;let od=0;
   for(let k=0;k<5;k++){const y=hb+(ht-hb)*(k+.5)/5,px=gx+sx*y+CSH.w[0],pz=gz+sz*y+CSH.w[1],h=(y-hb)/(ht-hb);
    const prof=sst(0,.09,h)*lerp(1-sst(.58,1,h),(1-sst(.86,1,h))*(1+.25*h),st),wm=cshTN(D,N,px*.000042+uT*.0005,pz*.000042-uT*.0003,.37,2),cov=clamp(u.uC.value*.74+st*.3+(wm-.5)*.6,0,1),s=cshTN(D,N,px*.00036,y*.00036+uT*.00012,pz*.00036,0);
    od+=clamp((s-(1-cov))/Math.max(cov,.06),0,1)*prof*(1+st*.9)*(ht-hb)/5;}
   CSH.buf[i+j*Nn]=Math.round(255*Math.max(.04,Math.exp(-od*.012)));}}
 if(CSH.row>=Nn){CSH.row=-1;CSH.d.set(CSH.buf);CSH.tex.needsUpdate=true;U.uCSh.value.set(CSH.nx0,CSH.nz0,1/CSH.S,.5+clamp(WX.cloud*3,0,1)*.98);}}
{const ls=lightStep;lightStep=function(dt){ls(dt);try{cshStep();}catch(e){if(!CSH.err){CSH.err=1;console.warn('ombre nubi',e);}}};}
// con le ombre vere delle nubi il sole non va più abbassato tutto insieme dalla copertura (prima: -85%)
{const uw=updWeather;updWeather=function(dt){uw(dt);if(WX.dome&&U.uCSh.value.w>.5)sun.intensity=TODC.si*(1-.3*WX.cloud);};}
// ---------- fulmini: canale tortuoso con ramificazioni (leader a gradini che scende), colpi di ritorno, tuono dalla geometria ----------
// Il canale scende dalla base della nube a passi di 8-30 m con deviazioni casuali (la tortuosità vera è di circa 16°),
// si ramifica più volte (rami che si spengono a mezz'aria), prima appare il leader debole che scende ramificandosi,
// poi il colpo di ritorno accecante sul canale principale e 2-5 ritorni successivi. Il tuono non è più un rumore
// generico: è la somma delle onde d'urto partite da ogni tratto del canale, che arrivano in tempi diversi a seconda
// della distanza (lo schiocco del tratto più vicino, poi il brontolio che rotola per secondi).
function abBoltPath(x0,y0,z0,x1,y1,z1,stepMin,stepMax,devi){const P=[new THREE.Vector3(x0,y0,z0)];let p=P[0].clone(),dir=new THREE.Vector3(x1-x0,y1-y0,z1-z0).normalize(),guard=0;
 while(p.y>y1+2&&guard++<400){const toT=new THREE.Vector3(x1-p.x,y1-p.y,z1-p.z),dl=toT.length();toT.normalize();dir.lerp(toT,.22).add(new THREE.Vector3(rand(-1,1),rand(-.4,.6),rand(-1,1)).multiplyScalar(devi)).normalize();if(dir.y>-.25)dir.y=-.25;dir.normalize();
  const st=Math.min(dl,rand(stepMin,stepMax));p=p.clone().addScaledVector(dir,st);P.push(p);if(dl<stepMin)break;}P.push(new THREE.Vector3(x1,y1,z1));return P;}
function abBranch(from,len,steps,devi){const P=[from.clone()];let p=from.clone(),dir=new THREE.Vector3(rand(-1,1),-rand(.6,1.4),rand(-1,1)).normalize();for(let i=0;i<steps;i++){dir.add(new THREE.Vector3(rand(-1,1),rand(-.3,.3),rand(-1,1)).multiplyScalar(devi)).normalize();if(dir.y>-.1)dir.y=-.1;p=p.clone().addScaledVector(dir,len*rand(.6,1.2));P.push(p);}return P;}
lightning=function(){const cp=camera.position,ic=Math.random()<.38,a=rand(0,TAU),d=rand(220,2400);let x=cp.x+Math.cos(a)*d,z=cp.z+Math.sin(a)*d,ty=groundH(x,z),best=null;
 if(!ic){for(const b of buildings){if(b.h<40)continue;const dd=Math.hypot(b.x0+b.w/2-x,b.z0+b.d/2-z);if(dd<140&&(!best||b.h>best.h))best=b;}if(best&&Math.random()<.75){x=best.x0+best.w/2;z=best.z0+best.d/2;ty=best.h;}else best=null;}
 const top=1250+rand(30,320),grp=new THREE.Group(),seq=[],segs=[];
 const addSegs=(P,amp)=>{for(let i=1;i<P.length;i++){const A=P[i-1],B=P[i];segs.push((A.x+B.x)/2-cp.x,(A.y+B.y)/2-cp.y,(A.z+B.z)/2-cp.z,A.distanceTo(B),amp,B.x-A.x,B.y-A.y,B.z-A.z);}};
 if(!ic){const sx=x+rand(-260,260),sz=z+rand(-260,260),main=abBoltPath(sx,top,sz,x,ty,z,9,26,.42);addSegs(main,1);
  const core=boltRibbon(main,1.1,new THREE.Vector3(10,10,12),1),glow=boltRibbon(main,16,new THREE.Vector3(.55,.6,1.05),.5);core.userData.main=1;glow.userData.main=1;grp.add(core,glow);
  // rami: più numerosi in alto, che si spengono a mezz'aria; qualche ramo secondario
  const nb=8+Math.floor(Math.random()*9);for(let b=0;b<nb;b++){const k=Math.floor(Math.pow(Math.random(),1.6)*(main.length-6))+1,br=abBranch(main[k],rand(10,24),5+Math.floor(Math.random()*12),.55);addSegs(br,.45);
   const r1=boltRibbon(br,.5,new THREE.Vector3(6,6,8),.75),r2=boltRibbon(br,6,new THREE.Vector3(.4,.46,.9),.3);r1.userData.br=r2.userData.br=k/main.length;grp.add(r1,r2);
   if(Math.random()<.45&&br.length>4){const sb=abBranch(br[2+Math.floor(Math.random()*(br.length-3))],rand(6,14),3+Math.floor(Math.random()*6),.6);addSegs(sb,.25);const s1=boltRibbon(sb,.32,new THREE.Vector3(4,4,6),.6);s1.userData.br=k/main.length;grp.add(s1);}}
  scene.add(grp);if(d<1300)flashLight(x,ty+40,z,.75,.8,1,80,1300,.35);}
 else{// lampo dentro la nube: canale orizzontale che non si vede, illumina la nube da dentro; il tuono è un brontolio lontano
  let p=new THREE.Vector3(x,top+rand(200,1200),z);const P=[p.clone()];for(let i=0;i<40;i++){p=p.clone().add(new THREE.Vector3(rand(-60,60),rand(-25,25),rand(-60,60)));P.push(p);}addSegs(P,.7);}
 const n=2+Math.floor(Math.random()*(ic?3:4));let t=ic?0:rand(.03,.06);for(let i=0;i<n;i++){seq.push([t,i===0?1:rand(.35,.95)]);t+=rand(.045,.13);}
 WX.bolts.push({g:ic?null:grp,seq,t:0,dur:t+.2,d,ic,fx:x,fy:top-60,fz:z,ab:1,lead:ic?0:seq[0][0]});
 if(typeof abThunder==='function'&&AU.ok&&abThunder(segs,Math.hypot(x-cp.x,(ic?top:ty)-cp.y,z-cp.z),ic,x,ty,z)){}else thunder(x,ic?top:ty,z,Math.hypot(x-cp.x,(ic?top:ty)-cp.y,z-cp.z),ic);
 if(best&&Math.random()<.6){placeFire(x,ty-.5,z,4,40);sparks(x,ty,z,40,10);}};
// leader: prima del colpo di ritorno il canale scende a gradini, debole e ramificato
{const uw=updWeather;updWeather=function(dt){uw(dt);for(const B of WX.bolts){if(!B.ab||!B.g)continue;const pre=B.t<B.lead;
  for(const m of B.g.children){const g=m.geometry,N=g.index?g.index.count:0;if(pre){const f=clamp(B.t/B.lead,0,1),lim=m.userData.br!==undefined?clamp((f-m.userData.br)*3,0,1):f;g.setDrawRange(0,Math.floor(N*lim/6)*6);m.material.uniforms.uI.value=.12+.1*Math.random();}
   else{g.setDrawRange(0,N);if(m.userData.br!==undefined)m.material.uniforms.uI.value*=.55;}}}};}
