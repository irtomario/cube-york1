#!/usr/bin/env python3
"""Costruisce index.html = originale (patch X) + patch esatte + moduli in src/ (patch Y)."""
import os, subprocess, sys, shutil
ROOT = os.path.dirname(os.path.abspath(__file__))   # cartella dev/
REPO = os.path.dirname(ROOT)                        # radice del repository (pubblicata da GitHub Pages)
OUT = os.path.join(REPO, 'index.html')              # il gioco: file unico, generato, da non modificare a mano
src = open(ROOT + '/backup/index_patchX_original.html', encoding='utf-8').read()

def rep(old, new, count=1):
    global src
    n = src.count(old)
    if n != count:
        raise SystemExit('PATCH FALLITA (%d occorrenze invece di %d): %s' % (n, count, old[:160]))
    src = src.replace(old, new)

# ---------- terreno: zone spianate prima dei fiumi, niente alberi nelle zone, terreno abbassato sotto i pavimenti ----------
rep('h=waterCarve(x,z,h,noRiver);return CRT.L.length?h+tmodQ(x,z):h;}',
    'h=waterCarve(x,z,zoneFlat(x,z,h),noRiver);return CRT.L.length?h+tmodQ(x,z):h;}')
rep('if(isCore(x,z)||coreNear(x,z).d<140)continue;',
    'if(isCore(x,z)||coreNear(x,z).d<140||zoneNear(x,z)<36)continue;')
rep('if(!isCore(x,z)&&coreNear(x,z).d>140){',
    'if(!isCore(x,z)&&coreNear(x,z).d>140&&zoneNear(x,z)>40){')
rep('function terH(x,z){return isCore(x,z)?groundBase0(x,z)-2.5:worldH(x,z);}',
    'function terH(x,z){if(isCore(x,z))return groundBase0(x,z)-2.5;const h=worldH(x,z)-zoneSink(x,z);return RDSK?h-1.6:h;}')
# il terreno spianato delle zone nuove è prato, non spiaggia
rep('void terrainShade(){vec3 P=vTW;',
    'float zbox(vec2 p,float x0,float x1,float z0,float z1){float dx=max(max(x0-p.x,p.x-x1),0.),dz=max(max(z0-p.y,p.y-z1),0.);return 1.-smoothstep(15.,70.,length(vec2(dx,dz)));}\n'
    'float zoneLawn(vec2 p){return max(max(zbox(p,1250.,2290.,260.,1500.),zbox(p,2440.,5100.,1270.,1980.)),max(zbox(p,-4320.,-2180.,1800.,2140.),zbox(p,-2520.,-2360.,1560.,1820.)));}\n'
    'void terrainShade(){vec3 P=vTW;')
rep('float bch=1.-smoothstep(1.2,3.8,h+(n3-.5)*1.5);','float bch=(1.-smoothstep(1.2,3.8,h+(n3-.5)*1.5))*(1.-zoneLawn(P.xz)*smoothstep(-.9,.05,h));')
# ---------- i detriti sopravvivono anche fuori dall'isola (Nova e aeroporti) ----------
rep('if(b.py<-40||Math.abs(b.px)>3000||Math.abs(b.pz)>3000)killBody(b);}',
    'if(b.py<-40||Math.abs(b.px)>6300||Math.abs(b.pz)>6300)killBody(b);}')
# ---------- gli aerei militari possono atterrare anche sulle piste civili ----------
rep('(!inBase(v.px,v.pz)&&V>30&&Math.abs(v.py-BASEY-v.m.gearH)>2)',
    '(!inBase(v.px,v.pz)&&!onRunway(v.px,v.pz,0)&&V>30&&Math.abs(v.py-BASEY-v.m.gearH)>2)')

# ---------- nuovi stili di facciata: 8 vetro high-tech, 9 pannelli bianchi high-tech ----------
rep("{d:180,hp:150,K:14,snd:'metal'}];", "{d:180,hp:150,K:14,snd:'metal'},{d:235,hp:190,K:6,snd:'glass'},{d:260,hp:175,K:5,snd:'glass'},{d:200,hp:210,K:9,snd:'metal'}];")
rep('SCAP=[80,40,60,70,80,30,80,60];', 'SCAP=[80,40,60,70,80,30,80,60,85,75,70];')
rep('[.5,.5,.52],[.52,.53,.55]];', '[.5,.5,.52],[.52,.53,.55],[.36,.4,.42],[.62,.62,.6],[.6,.61,.62]];')
# piano terra: niente vetrine e tende da negozio di Manhattan per gli stili high-tech
rep('  if(fl<.5){\n   float bu=fract(u/6.);', '  if(fl<.5&&st<7.5){\n   float bu=fract(u/6.);')
# rami di stile prima di quello metallico (st>6.5)
rep('  }else if(st>6.5){\n   float cu=fract(u/.35);',
    '  }else if(st>7.5){\n' + open(ROOT + '/src/fac_ht.glsl', encoding='utf-8').read() + '\n  }else if(st>6.5){\n   float cu=fract(u/.35);')
rep('if(st>6.5&&abs(n.y)<.5){fAlb=vec3(.27,.28,.3)', 'if(st>6.5&&st<7.5&&abs(n.y)<.5){fAlb=vec3(.27,.28,.3)')
rep('fAlb=mix(wall,gA,gl);if(vStatic>.5)canyon(p,n,gl);', 'fAlb=mix(wall,gA,gl);if(vStatic>.5&&st<7.5)canyon(p,n,gl);')
rep('float ga=fl<.5?.6:(st<.5?.75:', 'float ga=st>9.5?0.:st>8.5?.45:st>7.5?.85:fl<.5?.6:(st<.5?.75:')
rep(' }else if(n.y>.5){\n  float g=vn2(p.xz*.7)*.6+vn2(p.xz*3.1)*.4;',
    ' }else if(n.y<-.5&&st>8.5&&vStatic>.5){\n  float cl=fract(p.x*.25),cz=fract(p.z*.25);fAlb=vec3(.82,.83,.84)*(.93+.07*step(.5,fract(p.x*1.6)));fRough=.6;fMetal=0.;fEmis+=vec3(1.,.96,.9)*(1.-step(.06,abs(cl-.5)))*(.35+uNight*1.1);\n }else if(n.y>.5){\n  float g=vn2(p.xz*.7)*.6+vn2(p.xz*3.1)*.4;')
# tetti high-tech: membrana chiara e pannelli solari
rep('fAlb=vec3(.09,.09,.095)*(.7+.6*g)+vec3(.03)*t1;fRough=.95;fMetal=0.;',
    'fAlb=vec3(.09,.09,.095)*(.7+.6*g)+vec3(.03)*t1;fRough=.95;fMetal=0.;if(st>7.5){vec2 sq=fract(p.xz/vec2(2.1,1.3));float far=smoothstep(40.,160.,length(p-cameraPosition));float pv=step(.05,sq.x)*step(sq.x,.95)*step(.07,sq.y)*step(sq.y,.93)*step(.3,t2)*step(st,9.5);pv=mix(pv,.82*step(.3,t2)*step(st,9.5),far);fAlb=mix(vec3(.5,.51,.5)*(.82+.3*g),vec3(.03,.04,.06),pv);fRough=mix(.8,.35,pv);fMetal=pv*.15;}')
# detriti degli stili nuovi: vetro e alluminio
rep('else if(st2>6.5){if(pm<.75)mt=5;else mt=2;}', 'else if(st2>7.5){if(pm<.45)mt=4;else if(pm<.8)mt=5;else mt=2;}else if(st2>6.5){if(pm<.75)mt=5;else mt=2;}')
rep('else if(((st===0||st===4||st===6)&&pm<.4)||(st===7&&pm<.75)){sy*=.16;sx*=1.15;sz*=1.15;}',
    'else if(((st===0||st===4||st===6||st===8||st===9||st===10)&&pm<.4)||(st===7&&pm<.75)){sy*=.16;sx*=1.15;sz*=1.15;}')

# ---------- menu: viaggi rapidi e incidenti aerei; comandi degli aerei di linea ----------
rep('  <div class="set"><span>Dettaglio persone</span><div class="seg" data-seg="npcd"></div></div>',
    '  <div class="set"><span>Dettaglio persone</span><div class="seg" data-seg="npcd"></div></div>\n'
    '  <div class="set"><span>Voli di linea</span><div class="segx" data-seg="flights"></div></div>\n'
    '  <div class="set"><span>Incidenti aerei</span><div class="segx" data-seg="acc"></div></div>\n'
    '  <div class="set"><span>Vai a</span><div class="row tp" id="tpRow"></div></div>')
rep('  <h3>In elicottero</h3>',
    '  <h3>Aereo di linea</h3>\n'
    '  <dl><dt>Spazio / C</dt><dd>Più o meno motore</dd><dt>W / S</dt><dd>Muso giù e su (a terra S frena)</dd><dt>A / D</dt><dd>Rollio (a terra sterza il ruotino)</dd><dt>Q / E</dt><dd>Timone</dd><dt>Shift</dt><dd>Inversori di spinta a terra, aerofreni in volo</dd><dt>G</dt><dd>Carrello su e giù</dd><dt>R</dt><dd>Flap (sono anche automatici)</dd><dt>F</dt><dd>Sali al posto di comando o scendi</dd></dl>\n'
    '  <h3>In elicottero</h3>')

# finestre accese dei palazzi high-tech: da lontano blocchi accesi a gruppi (niente sfarfallio), molto lontano bagliore medio
rep('float winLit(vec2 id,float sd){return step(.6,h21(id*1.37+sd*17.3));}',
    'float winLit(vec2 id,float sd){return step(.6,h21(id*1.37+sd*17.3));}\nfloat htWinFar(vec2 id,float sd,float fp){float a=winLit(id,sd);vec2 cb=vec2(floor(id.x/6.),floor(id.y/2.));float b=step(.7,h21(cb*2.71+sd*9.1))*.8+.05;return mix(mix(a,b,smoothstep(.25,.6,fp)),.18,smoothstep(2.5,6.,fp));}')

# ======================= PATCH Z: strade consumate, buche vere, fossi, Brooklyn con le sue strade =======================
import json
RW = open(ROOT + '/src/roadwear.glsl', encoding='utf-8').read()
rep('const GLSL_NOISE=`', 'const RW_GLSL=' + json.dumps(RW) + ';\nconst GLSL_NOISE=`')
rep('float gSpec=1.;varying vec3 vWP;varying vec3 vWN;vec3 gAlb;float gRough;vec3 gEmis;',
    'float gSpec=1.;varying vec3 vWP;varying vec3 vWN;vec3 gAlb;float gRough;vec3 gEmis;uniform float uIM;vec2 gN=vec2(0.);float gWetR=0.;')
# Brooklyn: doppia linea gialla, corsie di sosta, strisce pedonali, linee d'arresto, usura
rep(""" else if(y<.07&&abs(p.x)>783.&&abs(p.x)<1200.&&abs(p.y)<648.){float ax2=abs(p.x)-792.;float ox=ax2-100.*floor(ax2/100.+.5),oz=p.y-80.*floor(p.y/80.+.5);vec3 asph=vec3(.05,.051,.055)*(.75+.35*n1+.25*n3);float mk=0.;
  if(abs(ox)<8.&&abs(oz)>8.)mk=(1.-step(.1,abs(ox)))*step(fract(p.y/9.),.45);if(abs(oz)<8.&&abs(ox)>8.)mk=max(mk,(1.-step(.1,abs(oz)))*step(fract(p.x/9.),.45));gAlb=mix(asph,vec3(.8,.66,.22),mk);gRough=.88;}""",
""" else if(y<.07&&abs(p.x)>783.&&abs(p.x)<1200.&&abs(p.y)<648.){float ax2=abs(p.x)-792.;float ox=ax2-100.*floor(ax2/100.+.5),oz=p.y-80.*floor(p.y/80.+.5);float sx=p.x<0.?-1.:1.;
  vec3 asph=vec3(.05,.051,.055)*(.75+.35*n1+.25*n3);asph=mix(asph,asph*1.3,step(.7,vn2(p*.06+5.)));
  gWetR=smoothstep(.82,.9,vn2(p*.045+11.))*uWetG*.9;gRough=.86;
  bool zA=abs(ox)<8.;float dA=zA?ox:oz,dS=zA?oz:ox,dAw=zA?ox*sx:oz,dSw=zA?oz:ox*sx;float fw=fwidth(p.x)+fwidth(p.y)+1e-4;
  vec2 mk=vec2(rwLine(abs(abs(dA)-4.4),.06,fw),rwLine(abs(abs(dA)-.16),.06,fw))*step(12.,abs(dS));
  mk.x=max(mk.x,step(8.8,abs(dS))*step(abs(dS),11.6)*step(.5,fract(dA/1.2+.25))*step(abs(dA),7.5));
  mk.x=max(mk.x,step(11.8,abs(dS))*step(abs(dS),12.25)*step(abs(dA),4.4)*step(0.,(zA?1.:-1.)*dAw*dSw));
  mk*=.8+.2*step(.3,n3);
  vec2 sid=zA?vec2(floor(ax2/100.+.5)+(p.x<0.?20.:0.),floor(p.y/80.)):vec2(floor(ax2/100.)+(p.x<0.?60.:40.),floor(p.y/80.+.5)+40.);float al=zA?p.y:p.x;
  vec4 cd=rwCond(sid,1.,.12,al);
  roadWear(p,al,dA,8.,4.4,0.,max(abs(dS)-8.,0.),sid,length(vWP-cameraPosition),1.,cd,uWetG,uIM,asph,mk,gRough,gWetR);
  gN=zA?vec2(rwGr.y*sx,rwGr.x):rwGr;mk=clamp(mk,0.,1.);
  gAlb=mix(asph,vec3(.74,.73,.68)*(.75+.25*n2),mk.x);gAlb=mix(gAlb,vec3(.72,.55,.12)*(.8+.2*n2),mk.y);gRough=mix(gRough,.62,max(mk.x,mk.y));
  vec2 mh=(fract(p/vec2(37.,29.))-.5)*vec2(37.,29.);float mr=length(mh);if(mr<.42){gAlb=vec3(.045)*(.8+.4*step(.5,fract(mr*12.)));gRough=.45;gN=vec2(0.);}}""")
# Manhattan: usura per tratto (viali e strade), buche, crepe, rattoppi, sporco
rep("""  mk*=.5+.5*step(.33,n3);
  gAlb=mix(asph,vec3(.72,.71,.66)*(.7+.3*n2),mk);gRough=mix(gRough,.6,mk);
  vec2 mh=(fract(p/vec2(37.,29.))-.5)*vec2(37.,29.);
  float mr=length(mh);if(mr<.42){gAlb=vec3(.045)*(.8+.4*step(.5,fract(mr*12.)));gRough=.45;}""",
"""  mk*=.75+.25*step(.33,n3);
  {bool zA=onA>.5;vec2 m2=vec2(mk,0.);vec2 sid=zA?vec2(floor(p.x/140.+.5),floor(p.y/84.)):vec2(floor(p.x/140.)+50.,floor(p.y/84.+.5)+50.);float al=zA?p.y:p.x;
   vec4 cd=rwCond(sid,0.,0.,al);gWetR=pud;
   roadWear(p,al,zA?ax:sz,zA?9.:6.,zA?4.5:3.8,zA?0.:1.9,zA?max(abs(sz)-6.,0.):max(abs(ax)-9.,0.),sid,length(vWP-cameraPosition),0.,cd,uWetG,uIM,asph,m2,gRough,gWetR);
   gN=zA?rwGr.yx:rwGr;mk=clamp(m2.x,0.,1.);}
  gAlb=mix(asph,vec3(.74,.73,.68)*(.75+.25*n2),mk);gRough=mix(gRough,.62,mk);
  vec2 mh=(fract(p/vec2(37.,29.))-.5)*vec2(37.,29.);
  float mr=length(mh);if(mr<.42){gAlb=vec3(.045)*(.8+.4*step(.5,fract(mr*12.)));gRough=.45;gN=vec2(0.);}""")
# cordoli dei marciapiedi di Brooklyn
rep('  float curb=max(step(abs(ax),9.6)*step(9.,abs(ax)),step(abs(sz),6.6)*step(6.,abs(sz)))*inCity;',
    '  float curb=max(step(abs(ax),9.6)*step(9.,abs(ax)),step(abs(sz),6.6)*step(6.,abs(sz)))*inCity;\n'
    '  {float bx2=abs(p.x)-792.,bo=bx2-100.*floor(bx2/100.+.5),bz2=p.y-80.*floor(p.y/80.+.5);curb=max(curb,max(step(abs(bo),8.6)*step(8.,abs(bo)),step(abs(bz2),8.6)*step(8.,abs(bz2)))*step(783.,abs(p.x))*step(abs(p.x),1200.)*step(abs(p.y),648.));}')
# acqua nelle buche e nelle pozzanghere: scura, liscia, riflette il cielo
rep('gRough=max(gRough,clamp(length(vWP-cameraPosition)/160.,0.,.6));',
    'gAlb=mix(gAlb,gAlb*.4,gWetR);gRough=mix(gRough,.08,gWetR);gSpec=max(gSpec,gWetR*.85);gN*=1.-gWetR;gRough=max(gRough,clamp(length(vWP-cameraPosition)/160.,0.,.6));')
rep('function groundMatF(){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0});\n m.onBeforeCompile=sh=>{',
    'function groundMatF(){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0});\n m.onBeforeCompile=sh=>{sh.uniforms.uIM=U.uIM;sh.uniforms.uCrt=U.uCrt;sh.uniforms.uCrtN=U.uCrtN;')
rep('+GLSL_NOISE+GND_F)', '+GLSL_NOISE+RW_GLSL+GND_F+CRT_GLSL)')
rep("ground();diffuseColor.rgb=gAlb;')", "ground();if(crCut(vWP.xz,gAlb)>.5)discard;diffuseColor.rgb=gAlb;').replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\\nnormal=normalize(normal+(viewMatrix*vec4(-gN.x,0.,-gN.y,0.)).xyz);')")
# Brooklyn: carreggiate a quota 0 e isolati di marciapiede a 0,15 (prima era tutto un unico lastricato)
rep('sl.push([-1200,-9,-648,-780,.15,648],[780,-9,-648,1200,.15,648]);',
    'sl.push([-1200,-9,-648,-780,0,648],[780,-9,-648,1200,0,648]);for(const sd of[1,-1]){sl.push(sd>0?[780,-.6,-648,784,.15,648]:[-784,-.6,-648,-780,.15,648]);for(let i=0;i<4;i++)for(let k=-8;k<8;k++){const x0=800+100*i,x1=884+100*i,z0=80*k+8,z1=80*k+72;sl.push(sd>0?[x0,-.6,z0,x1,.15,z1]:[-x1,-.6,z0,-x0,.15,z1]);}}')
# fisica: le buche delle strade di città sono vere (le ruote ci cadono dentro)
rep('if(Math.abs(ox)<8||Math.abs(oz)<8)return 0;}return .15;}', 'if(Math.abs(ox)<8||Math.abs(oz)<8)return -bkPot(x,z);}return .15;}')
rep('if(Math.abs(aveOff(x))<9||Math.abs(stOff(z))<6)return 0;return .15;}', 'if(Math.abs(aveOff(x))<9||Math.abs(stOff(z))<6)return -cityPot(x,z);return .15;}')
# strade extraurbane: segmento, parametro e fosso nella ricerca del tracciato
rep('_sq.dp=s.dp;return _sq;}', '_sq.dp=s.dp;_sq.i=bi;_sq.t=bt;_sq.k=s.ak===undefined?0:s.ak+(s.bk-s.ak)*bt;return _sq;}')
rep('RDS.push({ax:a.x,az:a.z,bx:b.x,bz:b.z,ay:a.y,by:b.y,aw:5,bw:5,dp:0});}R.P=P;}',
    'RDS.push({ax:a.x,az:a.z,bx:b.x,bz:b.z,ay:a.y,by:b.y,aw:5,bw:5,dp:0,as:a.s,bs:b.s,ri:ROADS.indexOf(R),ia:i,ak:0,bk:0,full:false,first:i===0,last:i===N-2,guard:false});}R.P=P;}')
rep(' RDG=segGrid(RDS,128,40);}', ' RDG=segGrid(RDS,128,40);rdPrep();}')
rep('function worldH(x,z){const h=worldPre(x,z);if(!RDG)return h;const r=roadQ(x,z);if(!r||r.y-h>=4)return h;return r.d<5.5?r.y:lerp(r.y,h,sst(5.5,34,r.d));}',
    'let RDSK=0,RDDK=0;\nfunction worldH(x,z){RDSK=0;RDDK=0;const h=worldPre(x,z);if(!RDG)return h;const r=roadQ(x,z);if(!r||r.y-h>=4)return h;const g=RDS[r.i];if(r.d<8.7&&g.full&&!(g.first&&r.t<=0)&&!(g.last&&r.t>=1))RDSK=1;const ry=r.y+(CRT.L.length?tmodQ(x,z):0);RDDK=rdDitch(r,h);return (r.d<5.5?ry:lerp(ry,h,sst(5.5,34,r.d)))-RDDK;}')
rep('function worldGround(x,z){const h=worldPre(x,z);if(!RDG)return h;const r=roadQ(x,z);if(!r)return h;if(r.y-h>=4)return r.d<5.6?r.y:h;return r.d<5.5?r.y:lerp(r.y,h,sst(5.5,34,r.d));}',
    'function worldGround(x,z){const h=worldPre(x,z);if(!RDG)return h;const r=roadQ(x,z);if(!r)return h;if(r.y-h>=4)return r.d<5.6?r.y:h;const ry=r.y+(CRT.L.length?tmodQ(x,z):0);if(r.d<4.25)return ry-rdPot(x,z,r);return (r.d<5.5?ry:lerp(ry,h,sst(5.5,34,r.d)))-rdDitch(r,h);}')
rep('const rq=roadQ(x,z);if(rq&&rq.d<9)continue;', 'const rq=roadQ(x,z);if(rq&&rq.d<10.5)continue;')

# ======================= PATCH Z: fiumi (rive sul terreno, galleggiamento e corrente) =======================
rep('uniform sampler2D tFor;uniform vec4 uHole;vec3 tAlb;float tRough;vec3 tPert;', 'uniform sampler2D tFor;uniform vec4 uHole;uniform sampler2D tRiv;vec3 tAlb;float tRough;vec3 tPert;')
rep('sn*=1.-dst;\n float bch=', """sn*=1.-dst;
 float rvd=texture2D(tRiv,(P.xz+6144.)/12288.).r*60.-20.;float bkw=0.,bkwet=0.;
 if(rvd<12.){float bn=tvn(P.xz*.045+9.);vec3 mud=vec3(.1,.078,.055)*(.8+.35*n4);vec3 grv=mix(vec3(.16,.148,.13),vec3(.26,.24,.21),tvn(P.xz*2.9))*(.75+.4*tvn(P.xz*8.7));
  vec3 bk=mix(mud,grv,smoothstep(.35,.65,bn));bkwet=1.-smoothstep(-.2,1.4,rvd);bk*=1.-.5*bkwet;
  bkw=(1.-smoothstep(1.2+2.5*bn,4.2+3.5*bn,rvd))*(1.-sn)*(1.-rk*.6);c=mix(c,bk,bkw);
  c=mix(c,vec3(.33,.3,.25)*(.8+.3*n4),(1.-smoothstep(0.,.2,abs(rvd-1.)))*.45*step(.55,tvn(P.xz*.25))*bkw);}
 float bch=""")
rep('.9,bch),.97,dst);tPert=', '.9,bch),.97,dst);tRough=mix(tRough,mix(.9,.28,bkwet),bkw);tPert=')
rep('m.onBeforeCompile=sh=>{sh.uniforms.tFor=U.tFor;sh.uniforms.uHole=hole;', 'm.onBeforeCompile=sh=>{sh.uniforms.tFor=U.tFor;sh.uniforms.uHole=hole;sh.uniforms.tRiv=U.tRiv;sh.uniforms.uCrt=U.uCrt;sh.uniforms.uCrtN=U.uCrtN;')
rep("'#include <common>\\n'+TER_F).replace('#include <map_fragment>','#include <map_fragment>\\nterrainShade();diffuseColor.rgb=tAlb;')", "'#include <common>\\n'+TER_F+CRT_GLSL).replace('#include <map_fragment>','#include <map_fragment>\\nif(crHoleT(vTW.xz)>.5)discard;terrainShade();diffuseColor.rgb=tAlb;')")
rep(' RDG=segGrid(RDS,128,40);rdPrep();}', ' RDG=segGrid(RDS,128,40);rdPrep();rvPrep();}')
# galleggiamento corretto anche su laghi e fiumi in quota (prima usava il livello del mare) e corrente che trascina
rep('d=(riv?waterLevel+waveH(b.px+rx,b.pz+rz):wl0)-(b.py+ry);', 'd=(riv&&wl0<waterLevel+.9?waterLevel+waveH(b.px+rx,b.pz+rz):wl0)-(b.py+ry);')
rep('if(!riv){const fv=wsVel(b.px,b.pz),kk=Math.min(1,sub*1.4*dt);b.vx+=(fv[0]-b.vx)*kk;b.vz+=(fv[1]-b.vz)*kk;}',
    'if(!riv){const fv=wsVel(b.px,b.pz),kk=Math.min(1,sub*1.4*dt);b.vx+=(fv[0]-b.vx)*kk;b.vz+=(fv[1]-b.vz)*kk;}else{const fl=rvFlow(b.px,b.pz);if(fl[0]||fl[1]){b.vx+=fl[0]*(1-k);b.vz+=fl[1]*(1-k);const kk=Math.min(1,sub*1.2*dt);b.vx+=(fl[0]-b.vx)*kk;b.vz+=(fl[1]-b.vz)*kk;}}')

# argini naturali: dove il terreno ai lati del fiume è più basso dell'acqua, la riva sale almeno 30 cm sopra il pelo dell'acqua (niente acqua sospesa)
rep('const hc=Math.min(h,d<w?r.y-.6-r.dp*(1-(d/w)*(d/w)):r.y-.6+(d-w)*.32);h=lerp(hc,h,sst(w+30,Math.min(185,w+150),d));',
    'let hc=Math.min(h,d<w?r.y-.6-r.dp*(1-(d/w)*(d/w)):r.y-.6+(d-w)*.32);if(d>=w&&!inL&&r.y>-1.3)hc=Math.max(hc,Math.min(r.y-.6+(d-w)*.32,r.y+.3));h=lerp(hc,h,sst(w+30,Math.min(185,w+150),d));')
# PATCH AA: dentro i laghi il fiume non costruisce argini (prima due strisce di sponda attraversavano il lago 0)
rep('function waterCarve(x,z,h,noRiver){for(const L of LAKES){', 'function waterCarve(x,z,h,noRiver){let inL=false;for(const L of LAKES){')
rep('const hc=Math.min(h,d<1?L.lv-.7-L.dp*(1-d*d):L.lv-.7+(d-1)*rr*.2);h=lerp(hc,h,sst(1.2,1.75,d));}', 'if(d<1.1)inL=true;const hc=Math.min(h,d<1?L.lv-.7-L.dp*(1-d*d):L.lv-.7+(d-1)*rr*.2);h=lerp(hc,h,sst(1.2,1.75,d));}')

# ======================= PATCH Z: base militare quattro volte più grande =======================
rep('const BX0=-1260,BX1=-140,BZ0=-1720,BZ1=-1380,BASEY=4;', 'const BX0=-1260,BX1=260,BZ0=-2240,BZ1=-1380,BASEY=4;')
rep('float fdx=max(max(-1260.-p.x,0.),p.x+140.),fdz=max(max(-1720.-p.y,0.),p.y+1380.);float bf=1.-smoothstep(0.,60.,length(vec2(fdx,fdz)));return mix(desertHG0(p),4.,bf);}',
    'float fdx=max(max(-1260.-p.x,0.),p.x-260.),fdz=max(max(-2240.-p.y,0.),p.y+1380.);float bf=1.-smoothstep(0.,60.,length(vec2(fdx,fdz)));float h0=desertHG0(p);if(abs(p.x)<40.&&p.y<-905.&&p.y>-1380.){float t=(-905.-p.y)/475.;float ry=mix(desertHG0(vec2(0.,-905.)),4.,t);h0=mix(h0,ry,1.-smoothstep(12.,40.,abs(p.x)));}return mix(h0,4.,bf);}')
rep('bf=1-ft*ft*(3-2*ft);return lerp(desertH0(x,z),BASEY,bf);}',
    'bf=1-ft*ft*(3-2*ft);let h0=desertH0(x,z);if(Math.abs(x)<40&&z<-905&&z>-1380){const t=(-905-z)/475,ry=lerp(desertH0(0,-905),BASEY,t);h0=lerp(h0,ry,1-sst(12,40,Math.abs(x)));}return lerp(h0,BASEY,bf);}')
# la vecchia pavimentazione dipinta, le vecchie luci, la recinzione, la strada e il cancello vengono sostituiti da quelli nuovi
def cut(a, b):
    global src
    i = src.index(a); j = src.index(b, i)
    assert src.count(a) == 1
    src = src[:i] + src[j:]
cut(' T.rw.repeat.set(1,950/60);', ' // radar')
cut(' // cancello e cartello', ' // hangar svuotati, luci interne')
rep('addBuilding(-498,-1458,12,12,10,0,[[0,0,10]]).noProps=true;', 'addBuilding(-498,-1458,12,12,3,3,[[0,0,3]]).noProps=true;')
rep('const own=helis.filter(h=>!h.dead&&!h.heli.drv);', 'const own=helis.filter(h=>!h.dead&&!h.heli.drv&&!h.baseHeli);')

# sospensioni proporzionali alla massa: autopompe, camion militari e furgoni pesanti non strisciano più sul pianale
rep('const rest=.36,wr=.34,k=36000,cd=3800;', 'const rest=.36,wr=.34,sr=Math.max(1,b.m/2200),k=36000*sr,cd=3800*sr;')
rep('Fs=clamp(Fs,0,65000);', 'Fs=clamp(Fs,0,65000*sr);')
rep('if(c.brake>0)jf+=clamp(-vl/kf,-c.brake*4500*dt,c.brake*4500*dt);', 'if(c.brake>0)jf+=clamp(-vl/kf,-c.brake*4500*sr*dt,c.brake*4500*sr*dt);')
rep('if(c.hand&&!w.f){grip=.38;jf+=clamp(-vl/kf,-6000*dt,6000*dt);}', 'if(c.hand&&!w.f){grip=.38;jf+=clamp(-vl/kf,-6000*sr*dt,6000*sr*dt);}')

# ======================= PATCH AA: pixel non validi (NaN/Inf) non diventano più strisce nere =======================
# composizione finale: i campioni non validi vengono scartati (prima diventavano neri e la sfocatura li allungava in strisce)
rep('uniform vec4 uWaves[4];uniform vec4 uHole;varying vec2 vUv;',
    'uniform vec4 uWaves[4];uniform vec4 uHole;uniform vec2 uPx;varying vec2 vUv;\n'
    'float fok(vec3 c){return (c.r<6e4&&c.g<6e4&&c.b<6e4&&c.r>-1.&&c.g>-1.&&c.b>-1.)?1.:0.;}\n'
    'vec3 fin(vec3 c){return vec3(c.r<6e4?max(c.r,0.):(c.r>=6e4?6e4:0.),c.g<6e4?max(c.g,0.):(c.g>=6e4?6e4:0.),c.b<6e4?max(c.b,0.):(c.b>=6e4?6e4:0.));}')
rep(' vec3 col=vec3(texture2D(tScene,uv+cd*uCA).r,texture2D(tScene,uv).g,texture2D(tScene,uv-cd*uCA).b);',
    ' vec3 c0=texture2D(tScene,uv).rgb;vec3 col=fin(vec3(texture2D(tScene,uv+cd*uCA).r,c0.g,texture2D(tScene,uv-cd*uCA).b));\n'
    ' if(fok(c0)<.5){vec3 nb=vec3(0.);float nw=0.;for(int i=0;i<4;i++){vec2 o=i==0?vec2(1.,0.):(i==1?vec2(-1.,0.):(i==2?vec2(0.,1.):vec2(0.,-1.)));vec3 s=texture2D(tScene,uv+o*uPx*1.5).rgb;float k=fok(s);nb+=fin(s)*k;nw+=k;}col=nw>0.?nb/nw:vec3(0.);}')
rep(' if(uSpd>.001){vec2 dv=(uv-.5)*uSpd*.032;vec3 acc=col;for(int i=1;i<6;i++)acc+=texture2D(tScene,uv-dv*float(i)).rgb;col=acc/6.;}',
    ' if(uSpd>.001){vec2 dv=(uv-.5)*uSpd*.032;vec3 acc=col;float wa=1.;for(int i=1;i<6;i++){vec3 s=texture2D(tScene,uv-dv*float(i)).rgb;float k=fok(s);acc+=fin(s)*k;wa+=k;}col=acc/wa;}')
rep(' if(!(col.r<6e4&&col.g<6e4&&col.b<6e4))col=vec3(0.);col*=uExp;', ' col=fin(col);col*=uExp;')
rep('uHole:{value:new THREE.Vector4()},uUnder:{value:0},', 'uHole:{value:new THREE.Vector4()},uPx:{value:new THREE.Vector2(1/1920,1/1080)},uUnder:{value:0},')
rep('matComp.uniforms.uAspect.value=v.x/Math.max(1,v.y);', 'matComp.uniforms.uAspect.value=v.x/Math.max(1,v.y);matComp.uniforms.uPx.value.set(1/Math.max(1,v.x),1/Math.max(1,v.y));')
rep('vec3 kt(vec2 o){return texture2D(tDiffuse,vUv+o*uTx).rgb;}',
    'vec3 kt(vec2 o){vec3 c=texture2D(tDiffuse,vUv+o*uTx).rgb;return vec3(c.r<6e4?max(c.r,0.):0.,c.g<6e4?max(c.g,0.):0.,c.b<6e4?max(c.b,0.):0.);}')
# coni di luce dei lampioni: con l'antialiasing i bordi del cono leggono valori estrapolati (negativi) e pow() dava NaN
rep("fragmentShader:'uniform float uK;varying float vY;varying float vF;varying float vD;void main(){float a=uK*(1.-vY*.75)*(1.-vY)*pow(vF,1.5)*(1.-smoothstep(60.,170.,vD))*.06;",
    "fragmentShader:'uniform float uK;varying float vY;varying float vF;varying float vD;void main(){float cy=clamp(vY,0.,1.),cf=clamp(vF,0.,1.);float a=max(0.,uK*(1.-cy*.75)*(1.-cy)*cf*sqrt(cf)*(1.-smoothstep(60.,170.,vD))*.06);")
rep("fragmentShader:'uniform float uFog;varying vec2 vU;varying float vA;void main(){float r=length(vU);float a=(exp(-r*r*8.)*1.3+exp(-r*r*2.4)*(.06+uFog*.22))*vA;",
    "fragmentShader:'uniform float uFog;varying vec2 vU;varying float vA;void main(){float r=length(vU);float a=max(0.,(exp(-r*r*8.)*1.3+exp(-r*r*2.4)*(.06+uFog*.22))*clamp(vA,0.,1.));")
# sfocatura da velocità realistica: dipende da quanto in fretta scorre il paesaggio vicino (velocità / distanza dal suolo)
rep('matComp.uniforms.uSpd.value=clamp((s-35)/230,0,.85)*(air?1:.6);',
    'const nearD=air?Math.max(8,alt+6):6,flow=s/nearD;matComp.uniforms.uSpd.value=clamp((flow-1.5)/9,0,1)*clamp((s-22)/60,0,1)*(air?.45:.3);')
rep('const tg=clamp((s-18)*.085,0,24);', 'const tg=clamp((s-25)*.035,0,9);')

# ======================= PATCH AA: traffico — le auto accostano per i soccorsi, i soccorsi sorpassano =======================
rep('if(chase&&Math.hypot(A.tgt.px-b.px,A.tgt.pz-b.pz)<45){tx=A.tgt.px+A.tgt.vx*.4;tz=A.tgt.pz+A.tgt.vz*.4;}',
    'if(chase&&Math.hypot(A.tgt.px-b.px,A.tgt.pz-b.pz)<45){tx=A.tgt.px+A.tgt.vx*.4;tz=A.tgt.pz+A.tgt.vz*.4;}{const lo=trLat(b,A,fx,fz,rx,rz,sp,dt);tx+=rx*lo;tz+=rz*lo;}')
rep(" let vT=A.vmax;const emg=A.mode!=='norm';", " let vT=A.vcap!==undefined?Math.min(A.vmax,A.vcap):A.vmax;const emg=A.mode!=='norm';")
rep('if(fw>0&&fw<36&&Math.abs(lt)<(ped?1.7:2.2)+Math.min(1,Math.abs(A.S))*1.4){vT=Math.min(vT,Math.max(0,(fw-b.hz-(hz||1)-2.5)*.6));',
    'if(fw>0&&fw<36&&Math.abs(lt)<(ped?1.7:(b.hx||.92)+(ohx||.95)+.28)+Math.min(1,Math.abs(A.S))*.8){if(!ped&&(A.push>0||(oa&&oa.yld>0&&lt>.45&&(A.siren||A.mode===\'flee\'))))return;if(A.ovt>0&&!ped&&fw>6&&lt>-1.4){vT=Math.min(vT,11);return;}vT=Math.min(vT,Math.max(0,(fw-b.hz-(hz||1)-2.5)*.6));')
rep('for(const o of TRF.cars)if(o!==b&&!o.dead)look(o.px,o.pz,o.hz);', 'for(const o of TRF.cars)if(o!==b&&!o.dead)look(o.px,o.pz,o.hz,false,o.car&&o.car.ai,o.hx);')
rep('for(const o of dynCars)if(!o.dead&&!(o.car&&o.car.ai)&&Math.hypot(o.px-b.px,o.pz-b.pz)<40)look(o.px,o.pz,o.hz||2.2);', 'for(const o of dynCars)if(!o.dead&&!(o.car&&o.car.ai)&&Math.hypot(o.px-b.px,o.pz-b.pz)<40)look(o.px,o.pz,o.hz||2.2,false,null,o.hx);')
rep('const look=(ox,oz,hz,ped)=>{', 'const look=(ox,oz,hz,ped,oa,ohx)=>{')
# i mezzi di soccorso reggono gli urti normali di un inseguimento: solo un urto violento li ferma
rep('const dv=A.lastV-sp;A.lastV=sp;if(dv>6.5&&A.crash<=0){A.crash=1.5;A.vmax=0;}', 'const dv=A.lastV-sp;A.lastV=sp;if(dv>(A.mode===\'norm\'||A.mode===\'panic\'||A.mode===\'flee\'?6.5:14)&&A.crash<=0){A.crash=1.5;A.vmax=0;}')
# strade (larghe 12 m): le auto in sosta erano a 4,5 m dal centro e le corsie a 3 m, quindi le auto che passavano strisciavano contro quelle parcheggiate
# e le spingevano in mezzo alla strada; ora sosta a 4,9 m (bordo a 5,8 m, il marciapiede è a 6 m) e corsie a 2,7 m
rep('const z=j*84+s*4.5;for(let x=-CX+8;x<=CX-8;x+=7.4){', 'const z=j*84+s*4.9;for(let x=-CX+8;x<=CX-8;x+=7.4){')
rep('lx=n0x-4.5*e.dj,lz=n0z+3*e.di;', 'lx=n0x-4.5*e.dj,lz=n0z+2.7*e.di;')
rep(':{x:nx-A.di*sIn,z:nz+3*A.di}', ':{x:nx-A.di*sIn,z:nz+2.7*A.di}')
rep(':{x:nx+di*sOut,z:nz+3*di};', ':{x:nx+di*sOut,z:nz+2.7*di};')
rep('{x:n2x-di*sOut,z:nz+3*di,stop:1,ni,nj,ax:1}', '{x:n2x-di*sOut,z:nz+2.7*di,stop:1,ni,nj,ax:1}')
rep('const x=140*(i+di*f)+(di?0:-4.5*dj),z=84*(j+dj*f)+(dj?0:3*di);', 'const x=140*(i+di*f)+(di?0:-4.5*dj),z=84*(j+dj*f)+(dj?0:2.7*di);')
# le auto parcheggiate diventano corpi fisici solo se vengono toccate davvero (prima bastava passarci a 2,7 m: ogni auto che passava le "svegliava")
rep('if((Math.abs(lx)<b.hx+1.3&&Math.abs(lz)<b.hz+1.3)||Math.hypot(dx,dz)<b.r*.6+1.2){const c=carDyn(sl);if(c){convN++;wake(c);}}',
    'const sy=Math.sin(sl.yaw),cy=Math.cos(sl.yaw),ex=Math.abs(-sy*R[0]-cy*R[6])*2.25+Math.abs(cy*R[0]-sy*R[6])*.93,ez=Math.abs(-sy*R[2]-cy*R[8])*2.25+Math.abs(cy*R[2]-sy*R[8])*.93;if(Math.abs(lx)<b.hx+ex+.18&&Math.abs(lz)<b.hz+ez+.18){const c=carDyn(sl);if(c){convN++;wake(c);}}')
# frenata prima delle curve con la fisica (v² = v_curva² + 2·a·d): i soccorsi non vanno più a 36 km/h per tutto l'isolato
rep('if(w.turn)vT=Math.min(vT,emg?10:6.5+d*.12);', 'if(w.turn)vT=Math.min(vT,emg?Math.sqrt(100+11*Math.max(0,d-8)):6.5+d*.12);')

# ======================= PATCH AA: tsunami — dentro l'onda si è sott'acqua (prima sopra c'era la superficie e sotto il vuoto) =======================
rep('const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.08,metalness:0,side:THREE.DoubleSide,envMapIntensity:1.1});',
    'const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.08,metalness:0,side:THREE.DoubleSide,envMapIntensity:.75});')
rep(".replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\\nroughnessFactor=mix(.17,.85,fo);')",
    ".replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\\nroughnessFactor=mix(.3,.88,fo);')")
# la normale dell'onda era girata rispetto al verso dei triangoli: con il doppio lato la faccia verso la riva veniva illuminata "da dietro" e sembrava uno specchio pallido
rep('vec3 objectNormal=normalize(cross(tPv-tP0,tPu-tP0));', 'vec3 objectNormal=normalize(cross(tPu-tP0,tPv-tP0));')
rep('f.color.setRGB(.012,.048,.055);f.density=.085;}render0();',
    'if(TSUIN){const l=.25+.75*TODC.lit;f.color.setRGB(.085*l,.1*l,.075*l);f.density=.075;}else{f.color.setRGB(.012,.048,.055);f.density=.085;}}render0();')
rep('if(uUnder>0.)col=mix(col,vec3(.01,.06,.075),.55)*vec3(.55,.9,1.);',
    'if(uUnder>0.)col=mix(col,mix(vec3(.01,.06,.075),vec3(.07,.085,.06),uMurk),.55-.15*uMurk)*mix(vec3(.55,.9,1.),vec3(.85,.92,.78),uMurk);')
rep('uniform vec4 uWaves[4];uniform vec4 uHole;uniform vec2 uPx;varying vec2 vUv;', 'uniform vec4 uWaves[4];uniform vec4 uHole;uniform vec2 uPx;uniform float uMurk;varying vec2 vUv;')
rep('uHole:{value:new THREE.Vector4()},uPx:{value:new THREE.Vector2(1/1920,1/1080)},uUnder:{value:0},', 'uHole:{value:new THREE.Vector4()},uPx:{value:new THREE.Vector2(1/1920,1/1080)},uMurk:{value:0},uUnder:{value:0},')
rep('cu.uUnder.value=camera.position.y<waterAt(camera.position.x,camera.position.z)?1:0;',
    'TSUIN=tsuInside();cu.uUnder.value=(TSUIN||camera.position.y<waterAt(camera.position.x,camera.position.z))?1:0;cu.uMurk.value=TSUIN?1:0;')

# ======================= PATCH AA: vetri con riflessi su ogni telefono (cielo calcolato se la mappa ambientale non funziona), vetri a specchio =======================
rep("const CANYON_LIGHT='if(fCan>0.){float ct=clamp(dot(normal,normalize(vViewPosition)),0.,1.);float fr=.04+.96*pow(1.-ct,5.);reflectedLight.indirectSpecular=mix(reflectedLight.indirectSpecular,fCanC*fr*1.15,fCan);}';",
    "const CANYON_LIGHT='{float ct=clamp(dot(normal,normalize(vViewPosition)),0.,1.),fp=pow(1.-ct,5.),fr=fF0+(1.-fF0)*fp;"
    "if(fGl>0.&&fCan<=0.){vec3 Rw=reflect(normalize(vRest-cameraPosition),normalize(vRN+fPert));reflectedLight.indirectSpecular=mix(reflectedLight.indirectSpecular,skyR(Rw)*fr,fGl);}"
    "if(fCan>0.)reflectedLight.indirectSpecular=mix(reflectedLight.indirectSpecular,fCanC*fr*1.15,fCan);}';")
rep("const FAC_F=`\nuniform float uNight;uniform float uTime;uniform vec4 uDmg[24];uniform float uDmgN;",
    "const FAC_F=`\nuniform float uNight;uniform float uTime;uniform vec4 uDmg[24];uniform float uDmgN;\n"
    "uniform vec3 uSkyZ;uniform vec3 uSkyH;uniform vec3 uSkyG;uniform float uEnvOK;float fGl=0.;float fF0=.04;\n"
    "vec3 skyR(vec3 R){float y=R.y;if(y<0.)return mix(uSkyH,uSkyG,smoothstep(0.,.25,-y));return mix(uSkyH,uSkyZ,pow(y,.6));}")
rep(" fEmis=vec3(0.);fPert=vec3(0.);", " fEmis=vec3(0.);fPert=vec3(0.);fGl=0.;fF0=.04;")
rep("fAlb=mix(wall,gA,gl);if(vStatic>.5&&st<7.5)canyon(p,n,gl);fRough=mix(wR,gR,gl);fMetal=mix(wM,gM,gl);",
    "fGl=gl;fF0=fl<.5&&st<7.5?.05:(st<.5?.15:(st>5.5&&st<6.5?.17:(st>7.5&&st<8.5?.22:(st>8.5&&st<9.5?.1:(st>3.5&&st<4.5?.13:.045)))));"
    "fAlb=mix(wall,gA,gl);if(vStatic>.5&&st<7.5)canyon(p,n,gl);fRough=mix(wR,gR,gl);fMetal=mix(wM,gM,gl);")
rep("function facadeMat(sway){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0});const sw={value:sway};\n m.onBeforeCompile=sh=>{sh.uniforms.tLamp=U.tLamp;",
    "function facadeMat(sway){const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0});const sw={value:sway};\n m.onBeforeCompile=sh=>{sh.uniforms.tLamp=U.tLamp;sh.uniforms.uSkyZ=U.uSkyZ;sh.uniforms.uSkyH=U.uSkyH;sh.uniforms.uSkyG=U.uSkyG;sh.uniforms.uEnvOK=U.uEnvOK;")
# di giorno l'interno dietro il vetro è molto meno luminoso dell'esterno: prevalgono i riflessi, come nella realtà
rep("vec3 ie=rc*mix(.15+hole*.3,lt*1.3+.01,uNight)", "vec3 ie=rc*mix(.075+hole*.3,lt*1.3+.01,uNight)")

# passi: la superficie si riconosce ovunque (sabbia nel deserto, prato e terra in campagna, asfalto, acqua)
rep("sndStep(inParkFn(P.x,P.z)?'grass':(waterAt(P.x,P.z)>P.y+.05?'water':'hard'),P.x,P.y,P.z);", "sndStep(stepSurf(P.x,P.y,P.z),P.x,P.y,P.z);")

# alberi: fascia libera più larga ai lati delle strade extraurbane (prima i tronchi arrivavano sulla banchina)
rep("const rq=roadQ(x,z);if(rq&&rq.d<10.5)continue;", "const rq=roadQ(x,z);if(rq&&rq.d<12.5)continue;")

# soglia del bloom regolabile (prima fissa a 1,1: tutto ciò che era al sole "sbavava" e l'immagine sembrava lattiginosa)
rep("matBright.uniforms.uTh.value=HDR===THREE.UnsignedByteType?.8:1.1;", "matBright.uniforms.uTh.value=HDR===THREE.UnsignedByteType?(window.AAL?AAL.th8:.8):(window.AAL?AAL.th:1.1);")

# finestre di notte: niente puntini rosa/viola in lontananza (l'interno dettagliato si media con la distanza), meno stanze accese, luce più calda e non bruciata
rep("return cc*(1.-clamp(tt/16.,0.,.5));}",
    "vec3 rr=cc*(1.-clamp(tt/16.,0.,.5));float fdl=smoothstep(60.,140.,length(p-cameraPosition));if(fdl>0.){vec3 av=off?vec3(.6,.63,.66):(ty>3.5?vec3(.62,.56,.47):vec3(.6,.52,.41));av*=.82+.36*r2;rr=mix(rr,av,fdl);rEm*=1.-fdl;}return rr;}")
rep("lit=step(.42,h21(bmin.xz*.91+vec2(bmin.y*.71)));", "lit=step(.58,h21(bmin.xz*.91+vec2(bmin.y*.71)));")
rep("lt*1.3+.01", "lt*.95+.006")

rep("lit*uNight*2.4", "lit*uNight*1.45")

# scaffali dei negozi: prodotti dai colori credibili invece di un mosaico di caramelle
rep("cc=sh<.14?vec3(.74,.74,.72):pc*.8+.1;", "cc=sh<.14?vec3(.74,.74,.72):mix(vec3(.4,.38,.35),pc,.42)*.95+.04;")

# occlusione ambientale: il canale alfa della mappa luci della città porta quanta luce di cielo arriva al suolo tra i palazzi
rep("d[k*4+3]=255;", "d[k*4+3]=AOMAP?AOMAP[k]:255;")
rep(".replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\\ntotalEmissiveRadiance+=gEmis;').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\\nreflectedLight.directSpecular*=gSpec;",
    ".replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\\ntotalEmissiveRadiance+=gEmis;').replace('#include <aomap_fragment>','#include <aomap_fragment>\\n{float gAO=texture2D(tLamp,(vWP.xz-uLmin)/uLsz).a;reflectedLight.indirectDiffuse*=gAO;reflectedLight.indirectSpecular*=mix(1.,gAO,.6);}').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\\nreflectedLight.directSpecular*=gSpec;")
rep(".replace('#include <lights_fragment_end>','#include <lights_fragment_end>\\n'+CANYON_LIGHT);};\n return m;}",
    ".replace('#include <lights_fragment_end>','#include <lights_fragment_end>\\n'+CANYON_LIGHT).replace('#include <aomap_fragment>','#include <aomap_fragment>\\n{float fy=clamp((vLW.y-.15)/3.2,0.,1.);float fao=mix(.58,1.,fy*fy*(3.-2.*fy));reflectedLight.indirectDiffuse*=fao;}');};\n return m;}")

# ruote staccate (auto distrutte): restano nella lista ma non toccano più terra
rep("for(const w of c.wheels){const hx=R[0]*w.x-R[1]*.2+R[2]*w.z", "for(const w of c.wheels){if(w.off){w.comp=0;w.slip=0;continue;}const hx=R[0]*w.x-R[1]*.2+R[2]*w.z")

# ---------- PATCH AA: fisica di volo e generale ----------
# aerei: stallo graduale (non più a scalino), densità dell'aria con la quota, effetto suolo in atterraggio
rep("CL=clamp(.12+5.2*al,-1,1.4)*(Math.abs(al)>.38?.45:1);",
    "CL=clamp(.12+5.2*al,-1,1.4)*(1-.58*sst(.28,.5,Math.abs(al)));v.stl=onGround0(v)?0:sst(.28,.42,Math.abs(al))*clamp((vf-8)/20,0,1);")
rep("const lift=P.kl*vf*Math.max(0,vf)*CL,thrust=v.th*P.T*(v.ab?P.ab:1),",
    "const rho=Math.exp(-Math.max(0,v.py)/8500),gef=1+.22*Math.max(0,1-(v.py-groundH(v.px,v.pz))/(v.hx*1.5+4)),lift=P.kl*vf*Math.max(0,vf)*CL*rho*gef,thrust=v.th*P.T*(v.ab?P.ab:1)*Math.pow(rho,.7),")
# raffiche di vento e aria del tornado sugli aerei
rep("v.vx+=(fx*thrust+ux*lift-v.vx*iv*drag)*dt;v.vy+=(fy*thrust+uy*lift-v.vy*iv*drag-9.8)*dt;v.vz+=(fz*thrust+uz*lift-v.vz*iv*drag)*dt;",
    "v.vx+=(fx*thrust+ux*lift-v.vx*iv*drag)*dt;v.vy+=(fy*thrust+uy*lift-v.vy*iv*drag-9.8)*dt;v.vz+=(fz*thrust+uz*lift-v.vz*iv*drag)*dt;airGust(v,dt);")
# inerzia di rollio/beccheggio/imbardata, ala che cade in stallo, muso che scende, vibrazione
rep(" v.q.multiply(_cvq.setFromEuler(_cve.set(wx*dt,wy*dt,wz*dt,'YXZ'))).normalize();cvR(v);\n v.px+=v.vx*dt;v.py+=v.vy*dt;v.pz+=v.vz*dt;\n if(v.py<gy){const bank",
    " if(v.stl>.04){if(!v.wd)v.wd=Math.random()<.5?-1:1;wz+=v.wd*v.stl*1.7;wx-=v.stl*.6;if(drv)player.shake=Math.max(player.shake,v.stl*.4);}else v.wd=0;\n"
    " {const ka=Math.min(1,dt*(onG?14:5.5));v.rwx=(v.rwx||0)+(wx-(v.rwx||0))*ka;v.rwy=(v.rwy||0)+(wy-(v.rwy||0))*ka;v.rwz=(v.rwz||0)+(wz-(v.rwz||0))*Math.min(1,dt*(onG?14:4.2));}\n"
    " v.q.multiply(_cvq.setFromEuler(_cve.set(v.rwx*dt,v.rwy*dt,v.rwz*dt,'YXZ'))).normalize();cvR(v);\n v.px+=v.vx*dt;v.py+=v.vy*dt;v.pz+=v.vz*dt;\n if(v.py<gy){const bank")
# elicotteri: inclinazione massima maggiore, resistenza aerodinamica quadratica (velocità massima ~270 km/h invece di ~60),
# effetto suolo, portanza di traslazione, aria più rarefatta in quota, "vortex ring state" scendendo in verticale troppo in fretta
rep("_q4.setFromEuler(_e3.set(-hiz*.32,H.yaw,-hir*.3,'YXZ'));", "_q4.setFromEuler(_e3.set(-hiz*.42,H.yaw,-hir*.38,'YXZ'));")
rep("b.vx*=1-.2*dt;b.vz*=1-.2*dt;", "{const hs=Math.hypot(b.vx,b.vz),kd=Math.min(.5,(.00078*hs+.03)*dt);b.vx*=1-kd;b.vz*=1-kd;}")
rep("T=clamp(T,0,b.m*G*2.4)*H.rpm;",
    "{const hs=Math.hypot(b.vx,b.vz),agl=b.py-groundH(b.px,b.pz),ge=1+.15*Math.max(0,1-agl/12),tl=1+.12*sst(8,24,hs);T=clamp(T,0,b.m*G*2.4*ge*tl)*H.rpm*Math.pow(Math.exp(-Math.max(0,b.py)/8500),.8);if(b.vy<-7&&hs<9){T*=.72;if(H.drv)player.shake=Math.max(player.shake,.22);}}")
# auto: resistenza dell'aria e aderenza che dipende dal fondo (asfalto bagnato, erba, sabbia, neve)
rep("if(uy<.3){for(const w of c.wheels){w.comp=0;w.slip=0;}return;}",
    "if(uy<.3){for(const w of c.wheels){w.comp=0;w.slip=0;}return;}\n {const V2=b.vx*b.vx+b.vy*b.vy+b.vz*b.vz;if(V2>16){const k=.6*(c.cda||.72)*Math.sqrt(V2)*b.im*dt;b.vx-=b.vx*k;b.vy-=b.vy*k;b.vz-=b.vz*k;}}")
rep("let grip=.95;", "let grip=.95*(c.gm||1);")

# ======================= PATCH AB =======================
# eventi casuali e meteo: nessun annuncio, succedono e basta (si vedono e si sentono)
rep("if(nk!==WX.kind){WX.kind=nk;toast({sereno:'Il cielo si sta rasserenando.',nuvoloso:'Le nuvole stanno coprendo il cielo.',pioggia:'Sta per piovere.',tempesta:'Sta arrivando un temporale: fulmini e tuoni.',uragano:'Allerta uragano: vento oltre 200 km/h e mareggiata!'}[nk]);",
    "if(nk!==WX.kind){WX.kind=nk;")
rep("WX.dynT=rand(50,120);if(!quiet)toast('Meteo automatico: il tempo cambierà da solo, a volte con temporali o uragani.');", "WX.dynT=rand(50,120);")
rep("if(!quiet)toast('Meteo: '+WXN[k]+(k==='uragano'?'. Vento oltre 200 km/h e mareggiata.':(k==='tempesta'?'. Arrivano fulmini e tuoni.':'')));}", "}")
rep("\n toast('Tsunami! Un’onda di '+Math.round(TSU.H)+' metri arriva dal '+['fiume a est','fiume a ovest','mare a nord','mare a sud'][side]+': ha circa 25 secondi.');", "")
rep("E0:Math.pow(size,3)*.45});toast('Asteroide in arrivo!');", "E0:Math.pow(size,3)*.45});")
rep("p.car.ai.siren=true;}toast('Inseguimento in corso: la polizia insegue un’auto in fuga!');", "p.car.ai.siren=true;}")
rep("ripT:0};toast('Si è aperto un buco nero.');", "ripT:0};")
rep("I:0};toast('Terremoto di magnitudo '+(5.2+P*3.3).toFixed(1).replace('.',',')+'.');", "I:0};")
rep("waterTarget=flooding?1.75+P*7:-1.5;toast(flooding?'Il fiume sta salendo.':'L’acqua sta defluendo.');", "waterTarget=flooding?1.75+P*7:-1.5;")
rep("flare(v.px,v.py-1,v.pz,3,.15,.5,2.5,2);toast('Rapiti: '+v.abd);", "flare(v.px,v.py-1,v.pz,3,.15,.5,2.5,2);")
rep("npcKill(n);v.abd++;toast('Rapiti: '+v.abd);", "npcKill(n);v.abd++;")
# coste naturali (src/ab_coast.js): riva del canale, costa sud con baie e falesie, laghi frastagliati, deserto con dune vere
rep('if(q.d<300)h=lerp(groundBase0(q.x,q.z),h,sst(0,300,q.d));const e=Math.max(', 'if(q.d<300)h=lerp(groundBase0(q.x,q.z),h,sst(0,300,q.d));h=moatApply(x,z,h);const e=Math.max(')
rep('return 880+650*sst(650,1700,ax)+220*fbm2(x*.0009,3.7,3)+170*sst(1700,4000,ax)*Math.sin(x*.0011);}',
    'return 880+650*sst(650,1700,ax)+220*fbm2(x*.0009,3.7,3)+60*fbm2(x*.0043+9.1,1.7,3)+170*sst(1700,4000,ax)*Math.sin(x*.0011);}')
rep('const r=Math.hypot(x,z*.9),cz=coastZ(x),sea=sst(cz-120,cz+380,z);',
    'const r=Math.hypot(x,z*.9),cz=coastZ(x);let sea=0;if(z>cz-820){const zc=z+seaWarp(x,z),cl=seaCliff(x);sea=lerp(sst(cz-120,cz+380,zc),sst(cz-25,cz+105,zc),cl);}')
rep('dd=Math.hypot(dx,dz);if(dd>L.r*2.2)continue;const a=Math.atan2(dz,dx),rr=L.r*(1+.15*Math.sin(a*3+L.ph)+.07*Math.sin(a*7+L.ph*2.3)),d=dd/rr;',
    'dd=Math.hypot(dx,dz);if(dd>L.r*2.6)continue;const a=Math.atan2(dz,dx),rr=lakeRR(L,a),d=dd/rr;')
rep("float desertHG0(vec2 p){float x=p.x,z=p.y;float e=clamp((-z-890.)/60.,0.,1.);float big=sin(x*.0021+.7)*cos(z*.0017+1.1)*9.+sin(x*.0047-z*.0031+2.3)*5.;float u=x*.0062+z*.0091+sin(x*.004)*1.4;float f=fract(u);float du=f<.75?f/.75:(1.-f)/.25;float dh=(6.+5.*sin(x*.0013+z*.0009))*du*du*(3.-2.*du);return .3+e*(max(0.,big+12.)*.6+dh);}",
    "float moatEG(vec2 p){float dx=max(-780.-p.x,p.x-780.),dz=max(-905.-p.y,p.y-880.);return (dx>0.||dz>0.)?length(vec2(max(dx,0.),max(dz,0.))):max(dx,dz);}\n"
    "float moatShoreG(vec2 p){float x=p.x,z=p.y;float wx=x+55.*sin(z*.0089+1.1)+21.*sin(z*.0213+.3),wz=z+55.*sin(x*.0083+2.3)+21.*sin(x*.0197+1.9);"
    "float s=62.+24.*sin(wx*.0021+wz*.0017+1.3)+22.*sin(wx*.0071-wz*.0059+.7)*sin(wz*.0023+wx*.0013+.4)+24.*sin(wx*.0127+wz*.0109+2.9)+15.*sin(wx*.0251-wz*.0233+4.1)+8.*sin(wx*.049+wz*.043+.3)+3.5*sin(wx*.097-wz*.089+1.7);return max(6.,s);}\n"
    "float moatCliffG(vec2 p){return smoothstep(.3,.8,.5+.5*sin(p.x*.0031-p.y*.0027+.8)*sin(p.x*.0013+p.y*.0019+2.2));}\n"
    "float sminG(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}\n"
    "float moatHG(vec2 p){float e=moatEG(p);if(e>420.)return 1e9;float s=moatShoreG(p),c=moatCliffG(p);if(e<s)return -9.+7.5*smoothstep(0.,s,e);return -1.5+(e-s)*(.035+.5*c*c);}\n"
    "float dunesHG(vec2 p){float x=p.x,z=p.y;float wx=x+48.*sin(z*.0043+1.7)+21.*sin(z*.0117+x*.004+.6)+9.*sin(x*.031-z*.027+2.2),wz=z+44.*sin(x*.0039+.4)+19.*sin(x*.0109-z*.005+2.8)+8.*sin(z*.029+x*.023+1.3);"
    "float u=wx*.0062+wz*.0091+sin(wx*.004)*1.1,f=fract(u),du=f<.72?f/.72:(1.-f)/.28;"
    "float amp=(5.5+4.*sin(wx*.0013+wz*.0009))*smoothstep(-.35,.55,sin(wx*.0031-wz*.0024+1.9)+.6*sin(wx*.0017+wz*.0041+.3));"
    "float u2=wx*.0141-wz*.0058+sin(wz*.006)*.8,f2=fract(u2),d2=f2<.65?f2/.65:(1.-f2)/.35;"
    "return amp*du*du*(3.-2.*du)+(1.4+sin(wx*.0027+.5))*d2*d2*(3.-2.*d2)*.5;}\n"
    "float desertHG0(vec2 p){float x=p.x,z=p.y;float e=clamp((-z-890.)/60.,0.,1.);float big=sin(x*.0021+.7)*cos(z*.0017+1.1)*9.+sin(x*.0047-z*.0031+2.3)*5.;float h=.3+e*(max(0.,big+12.)*.6+dunesHG(p));"
    "float m=moatHG(p);if(m<h+4.)h=mix(h,sminG(h,m,2.),smoothstep(15.,90.,abs(x)));return h;}")
# bug antico: a nord la fascia z tra -905 e -880 era "terra" per la fisica (si camminava sull'acqua) ma disegnata come canale
rep("if(Math.abs(x)>=780||Math.abs(z)>=880){const ax=Math.abs(x);", "if(Math.abs(x)>=780||z>=880||z<=-905){const ax=Math.abs(x);")
# finestre rotte: l'apertura ha la forma vera della finestra (si vede la stanza dietro) con qualche scheggia rimasta;
# non più macchie nere frastagliate che sembravano buchi trasparenti. Alcune finestre restano solo incrinate.
rep("  if(brk>.5&&gl>.5){float ex=min(fract(u*.625),1.-fract(u*.625)),ey=min(fy,1.-fy),jag=vn2(vec2(u,v)*9.+sd*3.)*.2+vn2(vec2(u,v)*23.)*.07;float keep=step(min(ex,ey*.8),jag);hole=1.-keep;\n   gA=mix(vec3(.012,.011,.01),gA,keep);gM*=keep;gR=mix(.9,gR,keep);fPert*=keep;fEmis*=.3;\n   fEmis+=hole*vec3(3.,1.1,.25)*step(.82,h21(wid+sd*5.))*soot*(.6+.4*sin(uTime*11.+wid.x*3.));}\n  else if(crk>.5&&gl>.5)",
    "  if(brk>.5&&gl>.5&&h21(wid*1.31+vec2(sd*3.7,7.))<.82){float glo=fl<.5?.06:.22,ghi=fl<.5?.9:.8;float jg=(vn2(vec2(u*6.,sd*3.+fl))*.65+vn2(vec2(u*17.,sd+fl*2.))*.35)*.13*step(.35,h21(wid+2.3));float keep=max(step(fy,glo+jg),step(ghi-jg*.7,fy));hole=1.-keep;\n   gA=mix(vec3(.012,.011,.01),gA,keep);gM*=keep;gR=mix(.9,gR,keep);fPert*=keep;fEmis*=keep;\n   fEmis+=hole*vec3(3.,1.1,.25)*step(.82,h21(wid+sd*5.))*soot*(.6+.4*sin(uTime*11.+wid.x*3.));}\n  else if((crk>.5||brk>.5)&&gl>.5)")
# vetrina/finestra rotta di giorno: si vede la stanza in ombra (non più bianca e "accesa" come una lampada), schegge solo
# lungo i bordi del telaio invece di macchie scure sparse in mezzo al vetro
rep("vec3 ie=rc*mix(.075+hole*.3,lt*.95+.006,uNight)+rc*rEm*(.5+uNight*1.5);fEmis=mix(fEmis,ie*(1.+hole),gl*ai);if(hole>.5)gA=mix(gA,rc*.2,ai);",
    "vec3 ie=(rc*mix(.075+hole*.025,lt*.95+.006,uNight)+rc*rEm*(.5+uNight*1.5))*(fl<.5?1.-.35*uNight:1.);fEmis=mix(fEmis,ie*(1.+hole*.2),gl*ai);if(hole>.5)gA=mix(gA,rc*.04,ai);")
# fuliggine: sale a pennacchio sopra il punto dell'esplosione, sfrangiata, non più un disco nero perfetto
rep("soot=max(soot,1.-smoothstep(d.w*.16,d.w*.4,dd));}}", "{vec3 sq=p-d.xyz;sq.y*=sq.y>0.?.42:1.3;soot=max(soot,(1.-smoothstep(d.w*.14,d.w*.48,length(sq)))*(.5+.5*vn2(p.xz*.6+p.y*.22+d.xz)));}}}")
# nuvole volumetriche: si formano e si dissolvono (la mappa della copertura scorre rispetto alla forma), cambiano forma
# lentamente, luce con diffusione multipla (tre ottave: interni più morbidi e luminosi, bordi controsole d'argento)
rep("float wm=texture(tN,vec3(q.xz*.000042,.37)).b,cov=clamp(uC*.6+uStorm*.36+(wm-.5)*.55,0.,1.);",
    "float wm=texture(tN,vec3(q.xz*.000042+uT*vec2(.0005,-.0003),.37)).b,cov=clamp(uC*.74+uStorm*.3+(wm-.5)*.6,0.,1.);")
rep("j=h1(gl_FragCoord.xy+fract(uT*.37)*91.)", "j=fract(52.9829189*fract(dot(gl_FragCoord.xy+fract(uT*.37)*vec2(47.,17.),vec2(.06711056,.00583715))))")
rep("float s=texture(tN,q*.00036).r,b=clamp((s-(1.-cov))/max(cov,.06),0.,1.)*prof;",
    "float s=texture(tN,q*.00036+vec3(0.,uT*.00012,0.)).r,b=clamp((s-(1.-cov))/max(cov,.06),0.,1.)*prof;")
rep("return clamp((texture(tN,q*.00036).r-(1.-cov))/max(cov,.06),0.,1.)*prof*(1.+uStorm*.9);}",
    "return clamp((texture(tN,q*.00036+vec3(0.,uT*.00012,0.)).r-(1.-cov))/max(cov,.06),0.,1.)*prof*(1.+uStorm*.9);}")
rep("vec3 sunL=uSunC*(exp(-od*.021)+exp(-od*.006)*.3)*(1.-exp(-od*.042))*ph*24.;",
    "float msc=0.,ma=1.,mb=1.,mc=1.;for(int o=0;o<3;o++){msc+=mb*exp(-od*.021*ma)*mix(hgp(cth,.6*mc),hgp(cth,-.2*mc),.4);ma*=.38;mb*=.52;mc*=.5;}vec3 sunL=uSunC*msc*(1.-exp(-od*.042-d*.8))*24.;")
# finestre illuminate di notte: come negli edifici veri si accendono a piani e a gruppi di stanze (uffici aperti),
# con qualche ufficio isolato nei piani spenti e intensità diverse da gruppo a gruppo (prima: puntini bianchi casuali
# su tutte le facciate, sembrava neve). Colore delle luci da interni (neutro-caldo, non azzurro).
rep('float winLit(vec2 id,float sd){return step(.6,h21(id*1.37+sd*17.3));}',
    'float winLit(vec2 id,float sd){float fo=step(.5,h21(vec2(id.y*1.73+3.1,sd*7.7))),gx=floor(id.x/4.),zo=h21(vec2(gx*2.31+id.y*.71,sd*3.3));'
    'float on=mix(step(.93,zo),step(.3,zo),fo)*step(.12,h21(id*1.37+sd*17.3));return on*(.45+.5*h21(vec2(gx,id.y)+sd*1.7));}')
rep('fEmis+=gl*vec3(.8,.88,1.)*1.4*uNight*winLit(wid,sd);', 'fEmis+=gl*vec3(.96,.93,.84)*1.4*uNight*winLit(wid,sd);')
rep('fEmis+=gl*vec3(.85,.9,1.)*1.4*uNight*winLit(wid,sd);', 'fEmis+=gl*vec3(.97,.94,.86)*1.4*uNight*winLit(wid,sd);')
rep('fEmis+=gl*vec3(.85,.9,1.)*1.3*uNight*winLit(wid,sd);', 'fEmis+=gl*vec3(.97,.94,.86)*1.3*uNight*winLit(wid,sd);')
# al tramonto il cielo è ancora luminoso: le luci delle stanze si notano appena (crescono col quadrato del buio)
rep('*uNight*winLit(wid,sd)', '*uNight*uNight*winLit(wid,sd)', 6)
rep('*uNight*htWinFar(', '*uNight*uNight*htWinFar(', 2)
rep('fEmis+=gl*vec3(.82,.9,1.)*1.35*uNight*uNight*htWinFar(', 'fEmis+=gl*vec3(.95,.93,.86)*1.35*uNight*uNight*htWinFar(')
# sabbia bagnata secondo la quota sull'acqua (prima era una fascia dritta lungo il bordo del deserto)
rep("float wet=smoothstep(-932.,-906.,q.y);c*=1.-.38*wet;", "float wet=1.-smoothstep(-1.2,.9,vWP.y+(n2-.5)*.4);c*=1.-.38*wet;")

# erba: la nuova (src/ab_grass.js) decide da sola dove e quanta; via la vecchia regola "solo vicino al parco"
rep("if(grassMesh){grassMesh.geometry.instanceCount=QP.grass;GU.uT.value=QP.grassR*2;}", "GU.uT.value=QP.grassR*2;")
rep("if(grassMesh){const gx=camera.position.x,gz=camera.position.z,ddx=Math.max(-121-gx,0,gx-121),ddz=Math.max(-573-gz,0,gz+99);grassMesh.visible=Math.hypot(ddx,ddz)<GU.uT.value*.55+4;}", "")

# ruote storte dopo un urto: la convergenza sbagliata entra nella fisica (l'auto tira da una parte)
rep("const st=w.f?c.steer:0,cs=Math.cos(st),sn=Math.sin(st);", "const st=(w.f?c.steer:0)+(w.toe||0),cs=Math.cos(st),sn=Math.sin(st);")

# bagliore: i livelli larghi (1/8 e 1/16 della risoluzione) si ricampionano in modo bicubico, niente quadratini attorno a fuochi e luci
rep("float hh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}\nvoid main(){vec2 uv=vUv;",
    "float hh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}\nuniform vec2 uB2r;uniform vec2 uB3r;\nvec4 bcw(float v){vec4 n=vec4(1.,2.,3.,4.)-v;vec4 s=n*n*n;float x=s.x,y=s.y-4.*s.x,z=s.z-4.*s.y+6.*s.x,w=6.-x-y-z;return vec4(x,y,z,w)*(1./6.);}\nvec3 bicub(sampler2D t,vec2 uv,vec2 res){vec2 tc=uv*res-.5;vec2 f=fract(tc);tc-=f;vec4 xc=bcw(f.x),yc=bcw(f.y);vec4 c=tc.xxyy+vec2(-.5,1.5).xyxy;vec4 s=vec4(xc.xz+xc.yw,yc.xz+yc.yw);vec4 o=(c+vec4(xc.yw,yc.yw)/s)/res.xxyy;vec3 s0=texture2D(t,o.xz).rgb,s1=texture2D(t,o.yz).rgb,s2=texture2D(t,o.xw).rgb,s3=texture2D(t,o.yw).rgb;float sx=s.x/(s.x+s.y),sy=s.z/(s.z+s.w);return mix(mix(s3,s2,sx),mix(s1,s0,sx),sy);}\nvoid main(){vec2 uv=vUv;")
rep("col+=(texture2D(tB1,uv).rgb*.5+texture2D(tB2,uv).rgb*.35+texture2D(tB3,uv).rgb*.3)*uBloom;",
    "col+=(texture2D(tB1,uv).rgb*.5+bicub(tB2,uv,uB2r)*.35+bicub(tB3,uv,uB3r)*.3)*uBloom;")

# ---------- PATCH AB: faccia rotta dei blocchi danneggiati ----------
# Prima: la faccia colpita diventava un grande masso grigio liscio e bombato (più scavato ai bordi che al centro).
# Ora: scavo irregolare più profondo al centro che ai bordi (buca nella facciata, non un masso), cemento sbrecciato, mattoni e malta a vista nei palazzi in mattoni,
# inerti del calcestruzzo, cavità più scure dove lo scavo è profondo, chiazze di polvere e fuliggine.
rep("float nz3=vn3(vRest*.85+aInfo.y*7.)*.65+vn3(vRest*2.3)*.35;float dep=(nz3*1.3*ed+.12*nz3)*w;",
    "float nz3=vn3(vRest*1.25+aInfo.y*7.)*.55+vn3(vRest*3.1)*.3+vn3(vRest*6.3)*.15;float dep=(nz3*(1.15-.75*ed)+.1*nz3)*w;")
rep("if(vJag>.03){float gq=.7+.45*vn2(p.xz*2.1+p.y*1.7);fAlb=vec3(.37,.355,.33)*gq*(1.-min(vJag,1.2)*.38);fRough=.96;fMetal=0.;return;}",
    "if(vJag>.03){float j1=vn2(p.xz*2.1+p.y*1.7),j2=vn2(vec2(p.x+p.z,p.y)*7.3),j3=vn2(vec2(p.x-p.z*.7,p.y)*19.);vec3 con=vec3(.36,.345,.32)*(.72+.4*j1)*(.82+.32*j2);"
    "if(abs(vInfo.x-1.)<.5){vec2 bq=vec2(p.x+p.z,p.y)*vec2(4.4,11.);bq.x+=floor(bq.y)*.5;vec2 bf=fract(bq);float mo=1.-step(.08,bf.x)*step(.12,bf.y);con=mix(vec3(.42,.17,.1)*(.7+.5*h21(floor(bq))),vec3(.5,.48,.43),mo)*(.8+.3*j2);}"
    "float cav=smoothstep(.15,1.,vJag);con*=1.-.55*cav*(.6+.4*j3);con=mix(con,con*vec3(.55,.5,.45),smoothstep(.55,.85,j2)*.5);fAlb=con;fRough=.95;fMetal=0.;return;}")
# ---------- PATCH AB: increspature della sabbia del deserto ----------
# Prima: un'unica serie di increspature con la stessa direzione e la stessa forza su tutto il deserto → righe
# parallele fino all'orizzonte. Ora la direzione segue il vento locale (cambia lentamente), le increspature vengono
# a chiazze (zone lisce e zone increspate), sono più fini e svaniscono con la distanza invece di creare strisce.
rep("vec2 wd=normalize(vec2(.55,.83));float ph=dot(q,wd)*15.+vn2(q*.35)*7.;float fw=fwidth(ph);float ra=(1.-smoothstep(.8,2.5,fw))*.22*(1.-wet);",
    "float ang=.98+(vn2(q*.0045)-.5)*1.6+(vn2(q*.021+7.)-.5)*.5;vec2 wd=vec2(cos(ang),sin(ang));float ph=dot(q,wd)*17.+vn2(q*.35)*6.+vn2(q*1.3)*1.5;float fw=fwidth(ph);"
    "float pm=smoothstep(.3,.72,vn2(q*.045+3.))*(.55+.45*vn2(q*.13+9.));float ra=(1.-smoothstep(.6,2.,fw))*.13*pm*(1.-wet);")
# ---------- PATCH AB: lago del parco (riva bagnata, prato fino all'acqua, acqua piena per la simulazione) ----------
rep("gAlb=mix(mix(gr,dirt,pth),vec3(.07,.06,.045),1.-smoothstep(-.8,.1,y));gRough=.95;", "gAlb=mix(mix(gr,dirt,pth),vec3(.07,.06,.045),1.-smoothstep(-1.42,-1.08,y));gRough=.95;{float wb=1.-smoothstep(-1.5,-1.28,y);gAlb*=1.-.45*wb;gRough=mix(gRough,.38,wb);}")
rep("let t=groundH(x,z);const b=bAt(x,z);", "let t=groundH(x,z);if(t<-1.5&&Math.hypot(x/58,(z+430)/74)<1.25)t=-1.5;const b=bAt(x,z);")
# il piano del suolo della città (y=0) copriva la conca del lago come un disco piatto: lì sopra il prato del parco si scarta
rep("ground();if(crCut(vWP.xz,gAlb)>.5)discard;diffuseColor.rgb=gAlb;", "ground();if(crCut(vWP.xz,gAlb)>.5)discard;if(vWP.x>-121.&&vWP.x<121.&&vWP.z>-573.&&vWP.z<-99.&&vWP.y>parkHG(vWP.xz)+.25)discard;diffuseColor.rgb=gAlb;")
# ---------- PATCH AA: texture del terreno e dell'acqua riscritte (src/ter_f.glsl, src/wat_f.glsl) ----------
def subconst(name, path):
    global src
    i = src.index('const %s=`' % name); j = src.index('`;', i)
    body = open(ROOT + '/src/' + path, encoding='utf-8').read().rstrip('\n')
    assert '`' not in body and '${' not in body
    src = src[:i] + 'const %s=`' % name + body + src[j:]
subconst('TER_F', 'ter_f.glsl')
subconst('WAT_F', 'wat_f.glsl')

# ---------- moduli nuovi (patch Y) ----------
MODS = ['zone.js', 'htt.js', 'nova.js', 'airport.js', 'liner.js', 'flights.js', 'ui.js', 'perf.js', 'rivers.js', 'roads.js', 'base.js', 'apveh.js', 'aircol.js', 'aa_core.js', 'aa_traffic.js', 'aa_audio.js', 'aa_nova.js', 'aa_props.js', 'aa_airlife.js', 'aa_roads.js', 'aa_light.js', 'aa_cars.js', 'aa_rtraffic.js', 'aa_roaddmg.js', 'aa_wboom.js', 'aa_destr.js', 'aa_tornado.js', 'aa_events.js', 'aa_ui.js', 'ab_coast.js', 'ab_water.js', 'ab_refl.js', 'ab_spray.js', 'ab_wboom2.js', 'ab_audio.js', 'ab_glass.js', 'ab_sky.js', 'ab_light2.js', 'ab_grass.js', 'ab_trees.js', 'ab_cars.js', 'ab_tanks.js', 'ab_people.js', 'ab_tornado.js', 'ab_laser.js', 'ab_nova.js', 'ab_lamps.js', 'ab_park.js', 'ab_ui.js', 'ab_fixes.js', 'ab_perf.js']
js = '\n'.join(open(ROOT + '/src/' + m, encoding='utf-8').read() for m in MODS if os.path.exists(ROOT + '/src/' + m))
rep('requestAnimationFrame(loop);init();', js + '\nrequestAnimationFrame(loop);init();')

open(OUT, 'w', encoding='utf-8', newline='\n').write(src)
# controllo di sintassi dello script principale (serve node)
a = src.index("<script>\n'use strict';")
b = src.index('</script>', a)
os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
MAIN = os.path.join(ROOT, 'build', 'main.js')
open(MAIN, 'w', encoding='utf-8', newline='\n').write(src[a + 8:b])
node = shutil.which('node')
if not node:
    print('ATTENZIONE: node non trovato, controllo di sintassi saltato')
    print('OK', len(src), 'byte (senza controllo di sintassi)')
    sys.exit(0)
r = subprocess.run([node, '--check', MAIN], capture_output=True, text=True)
if r.returncode:
    print(r.stderr[:3000])
    raise SystemExit('ERRORE DI SINTASSI')
print('OK', len(src), 'byte')
