varying vec3 vTW;varying vec3 vTN;varying float vDst;uniform sampler2D tFor;uniform vec4 uHole;uniform sampler2D tRiv;vec3 tAlb;float tRough;vec3 tPert;float tGrass;float tDry;float tLush;
float th21(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float tvn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(th21(i),th21(i+vec2(1.,0.)),f.x),mix(th21(i+vec2(0.,1.)),th21(i+vec2(1.,1.)),f.x),f.y);}
float zbox(vec2 p,float x0,float x1,float z0,float z1){float dx=max(max(x0-p.x,p.x-x1),0.),dz=max(max(z0-p.y,p.y-z1),0.);return 1.-smoothstep(15.,70.,length(vec2(dx,dz)));}
float cbox(vec2 p,float x0,float x1,float z0,float z1){float dx=max(max(x0-p.x,p.x-x1),0.),dz=max(max(z0-p.y,p.y-z1),0.);return 1.-smoothstep(60.,170.,length(vec2(dx,dz)));}
// accanto alla città (Manhattan e Brooklyn) niente spiaggia appiccicata agli isolati: prato e terra battuta
float coreLawn(vec2 p){return max(cbox(p,780.,1200.,-648.,648.),cbox(p,-1200.,-780.,-648.,648.));}
float zoneLawn(vec2 p){return max(max(zbox(p,1250.,2290.,260.,1500.),zbox(p,2440.,5100.,1270.,1980.)),max(zbox(p,-4320.,-2180.,1800.,2140.),zbox(p,-2520.,-2360.,1560.,1820.)));}
// PATCH AA — terreno più vero: prato naturale (non più verde lime) con chiazze secche, umide e di terra battuta, fiori di campo da vicino;
// roccia a strati con fessure e licheni, ghiaioni ai piedi delle pareti, prato alpino che si dirada; neve a chiazze sul limite,
// sporca in basso, con le onde del vento; sabbia asciutta chiara e bagnata scura e lucida, con le increspature.
void terrainShade(){vec3 P=vTW;if(uHole.w>.5&&abs(P.x-uHole.x)<uHole.z&&abs(P.z-uHole.y)<uHole.z)discard;
 float h=P.y,sl=1.-clamp(normalize(vTN).y,0.,1.),n1=tvn(P.xz*.004),n2=tvn(P.xz*.03),n3=tvn(P.xz*.21),n4=tvn(P.xz*1.3),fD=texture2D(tFor,(P.xz+6144.)/12288.).r;
 float dist=length(P-cameraPosition),fd=1.-smoothstep(30.,130.,dist),fd2=1.-smoothstep(7.,26.,dist);
 float m1=tvn(P.xz*.0023+3.1),m2=tvn(P.xz*.011-1.7),m3=tvn(P.xz*.052+5.3),m5=fd>0.?tvn(P.xz*3.1):.5;
 // --- prato
 vec3 g=mix(vec3(.036,.079,.021),vec3(.056,.088,.027),smoothstep(.3,.72,m1));
 g=mix(g,vec3(.14,.128,.068),clamp(smoothstep(.6,.88,m2)*.38+smoothstep(230.,430.,h)*.42,0.,1.));
 g=mix(g,vec3(.032,.056,.021),smoothstep(.62,.9,m3)*.42);
 g*=(.84+.28*n3)*(.9+.2*n4)*(1.+(m5-.5)*.24*fd);
 float bare=smoothstep(.8,.93,tvn(P.xz*.07+9.)*.75+n3*.25)*.55;g=mix(g,vec3(.098,.078,.056)*(.85+.3*n4),bare);
 if(fd2>0.&&h<320.){vec2 fc=floor(P.xz*2.3);float fh=th21(fc+17.);if(fh>.982){float t=fract(fh*97.);vec3 fl=t<.4?vec3(.62,.55,.07):(t<.72?vec3(.64,.64,.62):vec3(.3,.11,.4));vec2 fo=fract(P.xz*2.3)-.5;g=mix(g,fl,(1.-smoothstep(.1,.2,length(fo)))*fd2*(1.-bare)*(1.-fD));}}
 // sottobosco: foglie secche e aghi
 vec3 c=mix(g,mix(vec3(.038,.048,.026),vec3(.068,.056,.034),n3)*(.8+.4*n4),fD*.9);
 // --- roccia, ghiaioni, prato alpino
 float rk=smoothstep(.34,.52,sl+(n3-.5)*.12),scr=smoothstep(.2,.33,sl)*(1.-rk)*smoothstep(150.,260.,h),alp=smoothstep(300.,460.,h)*(1.-rk);
 if(rk+scr+alp>.001){float st=sin(h*1.7+tvn(P.xz*.02)*6.)*.5+.5,st2=sin(h*5.3+tvn(P.xz*.08)*4.)*.5+.5;
  vec3 rock=mix(vec3(.2,.19,.176),vec3(.34,.322,.292),st*.6+n2*.4);rock=mix(rock,vec3(.29,.245,.188),smoothstep(.55,.8,tvn(P.xz*.006+2.))*.5);rock=mix(rock,vec3(.14,.136,.13),smoothstep(.62,.92,st2)*.35);
  float cr=1.-abs(tvn(P.xz*.55+vec2(h*.31,-h*.17))*2.-1.);rock*=1.-.4*smoothstep(.86,.98,cr);rock*=(.8+.32*n4)*(.92+.16*m5*fd);
  rock=mix(rock,rock*vec3(.76,.9,.66),smoothstep(.7,.86,tvn(P.xz*.9+3.))*.45);
  vec3 scree=mix(vec3(.23,.222,.205),vec3(.31,.3,.28),tvn(P.xz*1.7))*(.78+.38*th21(floor(P.xz*2.7)));
  c=mix(c,scree,scr*.8);c=mix(c,mix(c,scree,.4)*vec3(1.06,1.,.9),alp*.55);c=mix(c,rock,rk);}
 // --- neve
 float sline=520.+70.*(n1-.5)+45.*(m2-.5),sn=smoothstep(sline-30.,sline+30.,h)*(1.-smoothstep(.5,.68,sl+(n4-.5)*.1));
 if(sn>0.){sn*=smoothstep(.12,.42,tvn(P.xz*.035+7.)*.8+n3*.2+smoothstep(sline,sline+110.,h));
  vec3 snow=mix(vec3(.84,.86,.9),vec3(.72,.73,.74),smoothstep(.55,.8,tvn(P.xz*.013+4.))*.6)*(.95+.05*n4);snow=mix(snow,vec3(.52,.5,.47),(1.-smoothstep(sline-10.,sline+70.,h))*.38*(1.-n3*.5));c=mix(c,snow,sn);}
 float dst=clamp(vDst,0.,1.);c=mix(c,mix(vec3(.13,.085,.055),vec3(.24,.22,.2),smoothstep(.35,.75,n3)*rk+.25*sn)*(.75+.35*n4),dst);sn*=1.-dst;
 // --- rive di fiumi e laghi
 float rvd=texture2D(tRiv,(P.xz+6144.)/12288.).r*60.-20.;float bkw=0.,bkwet=0.;
 if(rvd<12.){float bn=tvn(P.xz*.045+9.);vec3 mud=vec3(.1,.078,.055)*(.8+.35*n4);vec3 grv=mix(vec3(.16,.148,.13),vec3(.26,.24,.21),tvn(P.xz*2.9))*(.75+.4*tvn(P.xz*8.7));
  vec3 bk=mix(mud,grv,smoothstep(.35,.65,bn));bkwet=1.-smoothstep(-.2,1.4,rvd);bk*=1.-.5*bkwet;
  bkw=(1.-smoothstep(1.2+2.5*bn,4.2+3.5*bn,rvd))*(1.-sn)*(1.-rk*.6);c=mix(c,bk,bkw);
  c=mix(c,vec3(.33,.3,.25)*(.8+.3*n4),(1.-smoothstep(0.,.2,abs(rvd-1.)))*.45*step(.55,tvn(P.xz*.25))*bkw);}
 // --- spiaggia
 float bch=(1.-smoothstep(1.2,3.8,h+(n3-.5)*1.5))*(1.-max(zoneLawn(P.xz),coreLawn(P.xz))*smoothstep(-.9,.05,h)),wet=1.-smoothstep(-1.5,-.5,h+(n4-.5)*.25);
 vec3 sand=mix(vec3(.37,.32,.225),vec3(.44,.385,.275),n3)*(.9+.15*n4)*(.95+.1*m5*fd);sand=mix(sand,vec3(.2,.17,.12),wet*.85);
 if(fd2>0.){vec2 pc=floor(P.xz*4.);float pb=th21(pc+3.);vec2 po=fract(P.xz*4.)-.5-(vec2(th21(pc+7.),th21(pc+11.))-.5)*.5;sand=mix(sand,mix(vec3(.3,.27,.23),vec3(.42,.4,.36),th21(pc+5.)),step(.955,pb)*(1.-smoothstep(.07,.13,length(po)))*fd2*(1.-wet)*.8);}
 c=mix(c,sand,bch);c=mix(c,vec3(.1,.09,.07),1.-smoothstep(-3.,-1.65,h));
 tAlb=c;tRough=mix(mix(mix(mix(.95,.86,rk),.55,sn),mix(.9,.32,wet),bch),.97,dst);tRough=mix(tRough,mix(.9,.28,bkwet),bkw);
 // --- micro-rilievo: zolle, scabrosità della roccia, increspature della sabbia, onde di vento sulla neve
 vec3 pr=vec3(tvn(P.xz*.9+3.)-.5,0.,tvn(P.xz*.9-7.)-.5)*(.22+.3*rk)*(1.-sn*.6);
 if(fd>0.){pr.xz+=(vec2(tvn(P.xz*4.1),tvn(P.xz*4.1+9.))-.5)*.32*rk*fd;
  float rip=sin(dot(P.xz,vec2(.82,.57))*2.6+tvn(P.xz*.3)*5.);pr.xz+=vec2(.82,.57)*rip*.13*bch*(1.-wet)*fd;
  float sas=sin(dot(P.xz,vec2(.6,-.8))*1.3+tvn(P.xz*.15)*6.);pr.xz+=vec2(.6,-.8)*sas*.09*sn*fd;}
 tPert=pr;
 // PATCH AB — quanta erba cresce qui (per i fili d'erba veri): niente su roccia, ghiaione, neve, sabbia, terra smossa, rive e acqua; poca nel sottobosco
 tLush=smoothstep(.3,.72,m1);tDry=clamp(smoothstep(.6,.88,m2)*.38+smoothstep(230.,430.,h)*.42+bare*.6,0.,1.);
 tGrass=(1.-fD*.78)*(1.-bare*.8)*(1.-rk)*(1.-scr*.85)*(1.-alp*.45)*(1.-sn)*(1.-dst)*(1.-bkw)*(1.-bch)*smoothstep(-1.4,-.9,h)*smoothstep(.8,2.6,rvd);}
