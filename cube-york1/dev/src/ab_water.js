/* ======================= PATCH AB — ACQUA: TSUNAMI CHE RESTA MARE, ALLAGAMENTO CON CASCATE ======================= */
// Il difetto: dopo l'impatto la simulazione dell'allagamento teneva il mare del lato colpito alzato di molti metri
// (le celle "fiume" della simulazione), ma il mare disegnato restava a quota normale. Sul lungomare restava così un velo
// d'acqua sospeso, alto come l'onda, con il vuoto sotto. Ora l'onda non sparisce: dopo l'impatto si trasforma nel mare
// sollevato (un altopiano d'acqua che scende piano verso il largo e ai due capi) e segue esattamente la quota usata dalla
// simulazione; quando il mare torna giù l'acqua della città scavalca il muro del lungomare e ricade a cascata nel fiume.
const TSUP_P=[[-640,-.04],[-500,.05],[-380,.18],[-280,.38],[-195,.6],[-125,.8],[-70,.92],[-30,.98],[-8,1],[0,1],[4,-.6]];
const TSU_V2=`uniform vec2 uPS[11];uniform vec2 uPB[11];uniform vec2 uPP[11];uniform float uTH;uniform float uBrk;uniform float uTt;uniform float uPl;uniform float uPH;uniform float uAdv;varying float vTv;varying vec3 vTW2;varying float vPl;
float tn1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(fract(sin(i*12.9898)*43758.5453),fract(sin((i+1.)*12.9898)*43758.5453),f);}
float tsTap(float u){return 1.-smoothstep(720.,860.,abs(u));}
vec3 tsP(float u,float v){float fi=clamp(v,0.,1.)*10.;int i=int(min(floor(fi),9.));float f=fi-float(i);vec2 a=mix(uPS[i],uPB[i],uBrk),b=mix(uPS[i+1],uPB[i+1],uBrk),p=mix(a,b,f),pp=mix(uPP[i],uPP[i+1],f);
 float tp=tsTap(u),hv=uTH*(.8+.4*tn1(u*.006+uTt*.05))*tp,lead=uTH*1.4*(tn1(u*.0035+3.)-.5);float tb=((tn1(u*.09+uTt*1.7)+tn1(u*.031-uTt*.9+v*7.))*.5-.5)*smoothstep(.45,.8,v)*uTH*.07*tp*(1.-uPl);
 float q=pp.y*tp;vec3 wv=vec3(u,p.y*hv+tb,p.x*hv+lead+uAdv),pl=vec3(u,uPH*q+.4-.55*(1.-q),pp.x);return mix(wv,pl,uPl);}`;
tsuMat=function(){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.08,metalness:0,side:THREE.DoubleSide,envMapIntensity:.75});
 m.userData.u={uPS:{value:TSUP.S.map(p=>new THREE.Vector2(p[0],p[1]))},uPB:{value:TSUP.B.map(p=>new THREE.Vector2(p[0],p[1]))},uPP:{value:TSUP_P.map(p=>new THREE.Vector2(p[0],p[1]))},
  uTH:{value:1},uBrk:{value:0},uTt:{value:0},uPl:{value:0},uPH:{value:0},uAdv:{value:0},uFl:{value:0}};
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,m.userData.u);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+TSU_V2)
   .replace('#include <beginnormal_vertex>','float tU=position.x,tV=uv.y;vec3 tP0=tsP(tU,tV),tPu=tsP(tU+2.,tV),tPv=tsP(tU,tV+.012);vec3 objectNormal=normalize(cross(tPu-tP0,tPv-tP0));')
   .replace('#include <begin_vertex>','vec3 transformed=tP0;vTv=tV;vTW2=(modelMatrix*vec4(tP0,1.)).xyz;vPl=uPl;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+TSU_F+'\nvarying float vPl;uniform float uFl;')
   .replace('#include <map_fragment>','#include <map_fragment>\nfloat v=vTv;vec2 q=vTW2.xz;float st=tsn(vec2(q.x*.08+q.y*.08,vTW2.y*.35-uTt*1.2)),fo=0.;\n'
    +' fo+=smoothstep(.62,.72,v)*(1.-smoothstep(.84,.92,v))*smoothstep(.55,.8,st)*uBrk*.6;fo+=smoothstep(.72,1.,v)*smoothstep(.45,.75,tsn(vec2(q.x*.05+q.y*.05,vTW2.y*.9-uTt*2.)))*uBrk;\n'
    +' fo+=smoothstep(.93,1.,v)*.8;fo+=(1.-smoothstep(.0,.5,v))*smoothstep(.62,.8,tsn(vec2(q.x*.02+q.y*.02,q.y*.11-q.x*.11)+uTt*.05))*.1;fo*=1.-vPl;\n'
    // mare sollevato: schiuma a strisce che corre verso la riva mentre sale e verso il largo mentre scende, bianca vicino al muro
    +' {float s1=tsn(vec2(q.x*.045+q.y*.045,(q.x-q.y)*.012)+uFl*uTt*vec2(.35,.2)),s2=tsn(q*.17-uFl*uTt*.6);float pf=smoothstep(.55,.85,s1*.7+s2*.3)*(.25+.5*smoothstep(.55,.85,v))+smoothstep(.8,.9,v)*smoothstep(.35,.7,s2)*.8;fo=max(fo,pf*vPl);}\n'
    +' fo=clamp(fo,0.,1.);\n'
    +' vec3 wc=mix(mix(vec3(.006,.035,.045),vec3(.02,.11,.12),smoothstep(.3,.65,v)),vec3(.05,.047,.032),.38*uBrk*(1.-smoothstep(.55,.75,v)));wc=mix(wc,vec3(.032,.045,.036),vPl*.6);diffuseColor.rgb=mix(wc,vec3(.82,.86,.86),fo);')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.3,.88,fo);')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.012,.1,.085)*smoothstep(.62,.74,v)*(1.-smoothstep(.82,.9,v))*(1.-fo)*.9*(1.-vPl);vec2 rq=vTW2.xz*.32+vec2(0.,vTW2.y*.2);float r0=tsn(rq+uTt*vec2(.5,.7))+.5*tsn(rq*2.7-uTt*vec2(.8,.4)),rx=tsn(rq+vec2(.12,0.)+uTt*vec2(.5,.7))+.5*tsn((rq+vec2(.12,0.))*2.7-uTt*vec2(.8,.4)),rz=tsn(rq+vec2(0.,.12)+uTt*vec2(.5,.7))+.5*tsn((rq+vec2(0.,.12))*2.7-uTt*vec2(.8,.4));normal=normalize(normal+(viewMatrix*vec4((r0-rx)*2.2,0.,(r0-rz)*2.2,0.)).xyz*(1.-fo*.6)*(1.-vPl*.55));');};return m;};
function tsuTap(u){return 1-sst(720,860,Math.abs(u));}
// stessa forma dello shader (onda che si trasforma nel mare sollevato): serve per "sono dentro l'acqua?" e per far galleggiare le cose
tsuTop=function(lu,lw){const u=TSU.m.material.userData.u,brk=u.uBrk.value,TH=u.uTH.value,tt=u.uTt.value,pl=u.uPl.value,PH=u.uPH.value,adv=u.uAdv.value,tp=tsuTap(lu),
  hv=TH*(.8+.4*tsuTn1(lu*.006+tt*.05))*tp,lead=TH*1.4*(tsuTn1(lu*.0035+3)-.5),S=TSUP.S,B=TSUP.B,P=TSUP_P;
 let top=-1e9,px=0,py=0;for(let i=0;i<11;i++){const wx=(S[i][0]+(B[i][0]-S[i][0])*brk)*hv+lead+adv,wy=(S[i][1]+(B[i][1]-S[i][1])*brk)*hv,q=P[i][1]*tp,plx=P[i][0],ply=PH*q+.4-.55*(1-q),x=wx+(plx-wx)*pl,y=wy+(ply-wy)*pl;
  if(i>0){const a=Math.min(px,x),b=Math.max(px,x);if(lw>=a&&lw<=b&&b-a>1e-4)top=Math.max(top,py+(y-py)*(lw-px)/(x-px));}px=x;py=y;}return top;};
// quota in più del mare (sopra il livello normale) in un punto fuori dall'isola: onda in arrivo o mare sollevato
function tsuSea(x,z){const m=TSU.m;if(!TSU.on||!m||!m.parent)return 0;const R=m.rotation.y,cr=Math.cos(R),sr=Math.sin(R),dx=x-m.position.x,dz=z-m.position.z,lu=dx*cr-dz*sr,lw=dx*sr+dz*cr;
 if(Math.abs(lu)>860||lw>.5)return 0;const t=tsuTop(lu,lw);return t<-1e8?0:Math.max(0,m.position.y+t-waterLevel);}
{const wa0=waterAt;waterAt=function(x,z){const w=wa0(x,z);if(TSU.on&&TSU.m&&(Math.abs(x)>PX||Math.abs(z)>PZ)){const s=tsuSea(x,z);if(s>.05)return Math.max(w,waterLevel+s+waveH(x,z));}return w;};}
// ---------- passo dello tsunami ----------
updTsunami=function(dt){if(!TSU.on)return;TSU.t+=dt;WS.awake=4;const k0=clamp(TSU.t/TSU.arr,0,1),k=1-Math.pow(1-k0,1.45),off=TSU.dist*(1-k),side=TSU.side,m=TSU.m,after=Math.max(0,TSU.t-TSU.arr),tsh=tsH();
 if(m){const u=m.material.userData.u;u.uTH.value=TSU.H*(.3+.7*Math.pow(k,.8));u.uBrk.value=sst(.42,.95,k);u.uTt.value=TSU.t;u.uPl.value=sst(.4,3.4,after);u.uPH.value=tsh;u.uAdv.value=Math.min(after*13,36);
  const dh=tsh-(TSU.ph0===undefined?tsh:TSU.ph0);TSU.ph0=tsh;u.uFl.value+=(clamp(dh/Math.max(dt,1e-3)*.6,-1,1)-u.uFl.value)*Math.min(1,dt*2);
  m.position.set(side===0?PX+.3+off:side===1?-PX-.3-off:0,waterLevel-.4,side===2?-PZ-.3-off:side===3?PZ+.3+off:0);
  // spruzzi e nebbia salata sulla cresta mentre arriva e si rompe
  const cr=u.uTH.value*(1-u.uPl.value);if(cr>.5&&psA){const [dx,dz]=tsuDir(),n=Math.round(4+10*u.uBrk.value*(1-u.uPl.value));for(let i=0;i<n;i++){const t=rand(-800,800),ad=-u.uAdv.value,x=side<2?m.position.x+dx*(cr*.1-ad):t,z=side<2?t:m.position.z+dz*(cr*.1-ad);if(sDist(x,cr,z)>900)continue;const l=TODC.lit;
   psA.spawn(x,waterLevel+cr*rand(.85,1.15),z,-dx*rand(2,7)+rand(-2,2),rand(1,5),-dz*rand(2,7)+rand(-2,2),rand(2,4),cr*.07,cr*.26,.8*l,.84*l,.86*l,.42,.6,-1.2,1);}}
  // dopo l'impatto: dove il mare è più alto della città l'acqua scavalca il muro (getti verso l'interno),
  // dove la città è più alta del mare l'acqua ricade a cascata nel fiume (schiuma e nebbia ai piedi del muro)
  if(after>.5&&psA&&WS.D){TSU.spT=(TSU.spT||0)-dt;if(TSU.spT<=0){TSU.spT=.05;const P0=player,l=TODC.lit,[dx,dz]=tsuDir();
   for(let i=0;i<6;i++){const t=(side<2?P0.z:P0.x)+rand(-320,320);if(Math.abs(t)>(side<2?PZ:PX))continue;const sx=side===0?PX:side===1?-PX:t,sz=side===2?-PZ:side===3?PZ:t,ix=sx+dx*4,iz=sz+dz*4,c=wsCell(ix,iz);if(c<0)continue;
    const land=WS.T[c]+WS.D[c],sea=waterLevel+tsh,dH=sea-land;if(sDist(sx,sea,sz)>650)continue;
    if(dH>.6){const s=Math.min(1,dH/6);psA.spawn(sx+rand(-1,1),sea+rand(0,.6),sz+rand(-1,1),dx*rand(3,8)*s+rand(-1,1),rand(1.5,5)*s,dz*rand(3,8)*s+rand(-1,1),rand(1.2,2.4),.6+s,2.2+3*s,.82*l,.85*l,.86*l,.55,.5,6,1);}
    else if(dH<-.6&&WS.D[c]>.15){const s=Math.min(1,-dH/5);psA.spawn(sx-dx*rand(.5,2.5),waterLevel+rand(0,1.2),sz-dz*rand(.5,2.5),-dx*rand(.5,2)+rand(-.5,.5),rand(.5,2.2),-dz*rand(.5,2)+rand(-.5,.5),rand(1.5,3),.8+s,2.4+2.5*s,.8*l,.83*l,.84*l,.45,.7,-.3,1);}}}}
  if(after>3.5&&tsh<.04){scene.remove(m);m.geometry.dispose();m.material.dispose();TSU.m=null;}}
 // ruggito che cresce con l'avvicinarsi, poi il rombo dell'acqua che entra e il fragore delle cascate
 if(AU.ok){const L=AU.loops.tsu||(AU.loops.tsu=mkLoop('brown','lowpass',220,.7,true)),cp=camera.position,wx=m?m.position.x:cp.x,wz=m?m.position.z:cp.z,dd=side<2?Math.abs(cp.x-wx):Math.abs(cp.z-wz),
   g=TSU.t<TSU.arr+4?Math.min(1.6,(TSU.H/14)*(260/(dd+120))):Math.max(0,1.2-(TSU.t-TSU.arr-4)/20)*(.35+.65*Math.min(1,tsh/Math.max(1,TSU.H)));loopGain(L,g);if(L.p)setPan(L.p,side<2?wx:cp.x,6,side<2?cp.z:wz);
  const L2=AU.loops.tsuB||(AU.loops.tsuB=mkLoop('noise','highpass',900,.5,true));loopGain(L2,m?g*.7*Math.max(m.material.userData.u.uBrk.value*(1-m.material.userData.u.uPl.value),.35*sst(.5,4,tsh)*Math.min(1,260/(dd+100))):0);if(L2.p)setPan(L2.p,side<2?wx:cp.x,6,side<2?cp.z:wz);if(L.f)L.f.frequency.value=160+TSU.H*6+(TSU.t>TSU.arr?200:0);}
 if(!TSU.hit&&TSU.t>=TSU.arr){TSU.hit=true;tsuImpact();}
 if(TSU.hit){TSU.dmgT-=dt;if(TSU.dmgT<=0){TSU.dmgT=.4;TSU.vx=0;tsuFlowDamage();}}tsuDrag(dt);
 if(TSU.t>TSU.arr+60){TSU.on=false;TSU.mask=null;TSU.ph0=undefined;if(TSU.m){scene.remove(TSU.m);TSU.m.geometry.dispose();TSU.m.material.dispose();TSU.m=null;}if(AU.loops.tsu)loopGain(AU.loops.tsu,0);if(AU.loops.tsuB)loopGain(AU.loops.tsuB,0);}};
// ---------- superficie dell'allagamento: niente velo sospeso, superficie levigata, cascate sul muro del lungomare ----------
wsMeshUpdate=function(){if(!WS.mesh)return;const g=WS.mesh.geometry,P=g.attributes.position.array,Nn=g.attributes.normal.array,Dp=g.attributes.aDep.array,Fo=g.attributes.aFoam.array,W=WS.W,H=WS.H,N=W*H,D=WS.D,T=WS.T,R=WS.riv,cs=WS.cs;
 const S=(WS._sf&&WS._sf.length===N)?WS._sf:(WS._sf=new Float32Array(N)),tsh=TSU.on?tsH():0,tm=TSU.mask;
 for(let c=0;c<N;c++)S[c]=(!R[c]&&D[c]>.02)?T[c]+D[c]:-1e4;
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const c=i+j*W,cx=WS.ox+(i+.5)*cs,cz=WS.oz+(j+.5)*cs,s0=S[c];P[c*3]=cx;P[c*3+2]=cz;
  if(s0>-1e3){let s=s0*4,w=4;for(let dj=-1;dj<=1;dj++){const jj=j+dj;if(jj<0||jj>=H)continue;for(let di=-1;di<=1;di++){const ii=i+di;if((!di&&!dj)||ii<0||ii>=W)continue;const sq=S[ii+jj*W];if(sq>-1e3&&Math.abs(sq-s0)<1.2){const k=(di&&dj)?1:2;s+=sq*k;w+=k;}}}
   P[c*3+1]=Math.max(s/w,T[c]+.02);Dp[c]=D[c];Fo[c]=Math.min(1,Math.hypot(WS.vx[c],WS.vz[c])*.3);if(cx<x0)x0=cx;if(cx>x1)x1=cx;if(cz<z0)z0=cz;if(cz>z1)z1=cz;}
  else{Dp[c]=0;P[c*3+1]=-1e4;}}
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const c=i+j*W;if(P[c*3+1]>-1e3)continue;let sv=-1e4,fo=0;
  for(let dj=-1;dj<=1;dj++){const jj=j+dj;if(jj<0||jj>=H)continue;for(let di=-1;di<=1;di++){const ii=i+di;if(ii<0||ii>=W)continue;const q=ii+jj*W;if(Dp[q]>0&&P[q*3+1]>sv){sv=P[q*3+1];fo=Fo[q];}}}
  if(sv<-1e3){P[c*3+1]=-60;continue;}
  if(R[c]){// cella di fiume accanto all'acqua della città: il bordo della superficie va sul filo del muro, alla quota del mare
   const sea=waterLevel+(tsh>0&&tm&&tm[c]?tsh:0);P[c*3]=clamp(P[c*3],-PX-.3,PX+.3);P[c*3+2]=clamp(P[c*3+2],-PZ-.3,PZ+.3);P[c*3+1]=sea;Fo[c]=Math.max(fo,clamp(Math.abs(sv-sea)*.45,0,1));}
  else{P[c*3+1]=sv;Fo[c]=fo;}}
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const c=i+j*W,y=P[c*3+1];if(y<-50){Nn[c*3]=0;Nn[c*3+1]=1;Nn[c*3+2]=0;continue;}
  const l=(i>0&&P[(c-1)*3+1]>-50)?c-1:c,r=(i<W-1&&P[(c+1)*3+1]>-50)?c+1:c,b=(j>0&&P[(c-W)*3+1]>-50)?c-W:c,t=(j<H-1&&P[(c+W)*3+1]>-50)?c+W:c;
  const ddx=P[r*3]-P[l*3],ddz=P[t*3+2]-P[b*3+2],gx=ddx>.01?(P[r*3+1]-P[l*3+1])/ddx:0,gz=ddz>.01?(P[t*3+1]-P[b*3+1])/ddz:0,L=Math.hypot(gx,1,gz);Nn[c*3]=-gx/L;Nn[c*3+1]=1/L;Nn[c*3+2]=-gz/L;}
 g.attributes.position.needsUpdate=g.attributes.aDep.needsUpdate=g.attributes.aFoam.needsUpdate=g.attributes.normal.needsUpdate=true;WS.bb=[x0-650,x1+650,z0-650,z1+650];};
// la luce segue la pendenza vera della superficie (fronte dell'onda, cascate): l'acqua che cade è bianca e opaca
{const fm1=floodMatF;floodMatF=function(){const m=fm1(),ob=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){ob.call(this,sh,r);
  sh.fragmentShader=sh.fragmentShader.replace('normal=normalize((viewMatrix*vec4(normalize(vec3(-g.x,1.,-g.y)),0.)).xyz);',
   'normal=normalize((viewMatrix*vec4(normalize(vWN+vec3(-g.x,0.,-g.y)*max(vWN.y,.25)),0.)).xyz);{float fall=smoothstep(.86,.5,vWN.y);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.74,.76,.74),fall*(.55+.35*vn2(vWP.xz*.7+vec2(0.,uTime*2.))));roughnessFactor=mix(roughnessFactor,.6,fall);}');};return m;};}
