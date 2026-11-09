/* ======================= PATCH Z — BASE MILITARE AREA 51: QUATTRO VOLTE PIÙ GRANDE E MOLTO PIÙ COMPLESSA ======================= */
// Recinto: x da -1260 a 260, z da -2240 a -1380 (1,5 km × 860 m). Due piste parallele (09L/27R da 950 m, 09R/27L da 1380 m),
// rifugi corazzati per gli aerei, polveriere, deposito carburante, torre di controllo, vigili del fuoco, comando, caserme, mensa,
// autoparco, eliporto, radome, missili terra-aria, torre dell'acqua, antenne, doppia recinzione con torrette, cancello presidiato.
const BZ={objs:[],ruin:null,ruinN:0,gate:null,pat:null,sold:[],soldOn:false,helis:[],veh:[],tw:null,rad2:null,flags:[],lights:[]};
bg2Make(-1266,-2246,266,-1698);
// ---------- pavimentazione procedurale della base (dove non c'è niente si vede la sabbia vera del deserto) ----------
const BSG=`
float bsSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
float bsBox(vec2 p,vec2 a,vec2 b){vec2 c=(a+b)*.5,h=abs(b-a)*.5;vec2 d=abs(p-c)-h;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float bsSeg7(vec2 q,float n){float m=n<.5?63.:n<1.5?6.:n<2.5?91.:n<3.5?79.:n<4.5?102.:n<5.5?109.:n<6.5?125.:n<7.5?7.:n<8.5?127.:111.;float d=1e3;
 if(mod(m,2.)>.5)d=min(d,bsSeg(q,vec2(.12,1.68),vec2(.88,1.68)));if(mod(floor(m/2.),2.)>.5)d=min(d,bsSeg(q,vec2(.88,1.68),vec2(.88,.9)));
 if(mod(floor(m/4.),2.)>.5)d=min(d,bsSeg(q,vec2(.88,.9),vec2(.88,.12)));if(mod(floor(m/8.),2.)>.5)d=min(d,bsSeg(q,vec2(.12,.12),vec2(.88,.12)));
 if(mod(floor(m/16.),2.)>.5)d=min(d,bsSeg(q,vec2(.12,.9),vec2(.12,.12)));if(mod(floor(m/32.),2.)>.5)d=min(d,bsSeg(q,vec2(.12,1.68),vec2(.12,.9)));
 if(mod(floor(m/64.),2.)>.5)d=min(d,bsSeg(q,vec2(.12,.9),vec2(.88,.9)));return 1.-step(.13,d);}
float bsLR(vec2 q,float r){float d;if(r<.5)d=min(bsSeg(q,vec2(.12,1.68),vec2(.12,.12)),bsSeg(q,vec2(.12,.12),vec2(.88,.12)));
 else d=min(min(bsSeg(q,vec2(.12,.12),vec2(.12,1.68)),bsSeg(q,vec2(.12,1.68),vec2(.75,1.68))),min(min(bsSeg(q,vec2(.75,1.68),vec2(.88,1.4)),bsSeg(q,vec2(.88,1.4),vec2(.75,.98))),min(bsSeg(q,vec2(.75,.98),vec2(.12,.98)),bsSeg(q,vec2(.42,.98),vec2(.88,.12)))));
 return 1.-step(.13,d);}
float bsTxt(vec2 p,vec2 o,vec2 f,vec2 r,float d1,float d2,float lr){vec2 v=p-o;float lx=dot(v,r),ly=dot(v,f);if(ly<0.||ly>21.||abs(lx)>6.)return 0.;
 if(ly<9.)return bsLR(vec2((lx+1.75)/3.5,ly/5.),lr);float y2=(ly-12.)/5.;if(y2<0.)return 0.;return lx<0.?bsSeg7(vec2((lx+4.4)/3.5,y2),d1):bsSeg7(vec2((lx-.9)/3.5,y2),d2);}
// pista: segnaletica ICAO, numeri e lettere alle testate, gomma delle ruote nella zona di contatto, aree di sicurezza con frecce
void bsRunway(vec2 p,float x0,float x1,float zc,float hw,float wd1,float wd2,float lrW,float ed1,float ed2,float lrE,float n2,float n3,inout vec3 c,inout float rough,inout float hit){
 float dz=p.y-zc,adz=abs(dz);if(hit>.5||p.x<x0-60.||p.x>x1+60.||adz>hw+7.5)return;hit=1.;
 if(p.x<x0||p.x>x1){c=asph(p)*.9;float t0=p.x<x0?x0-p.x:p.x-x1;c=mix(c,vec3(.75,.58,.14),step(.85,fract((t0+adz*1.2)/24.))*step(adz,hw)*.9);rough=.88;return;}
 if(adz>hw){c=asph(p)*1.22+vec3(.025);rough=.9;return;}
 vec3 a=asph(p)*.82*(1.+.08*step(.5,fract(p.x*1.6)));float tW=p.x-x0,tE=x1-p.x,t0=min(tW,tE);
 float mk=step(hw-.9,adz);
 mk=max(mk,step(adz,.45)*step(fract(p.x/50.),.6)*step(75.,t0));
 mk=max(mk,step(6.,t0)*step(t0,36.)*step(3.,adz)*step(adz,hw-3.)*step(.5,fract((adz-3.)/3.6)));
 float tz=t0-150.*floor(t0/150.+.5),kk=floor(t0/150.+.5);if(kk>.5&&kk<3.5&&abs(tz)<11.){float o=adz-6.;mk=max(mk,step(0.,o)*step(o,(4.-kk)*3.)*step(fract(o/3.),.6)*step(adz,hw-3.));}
 if(t0>395.&&t0<455.)mk=max(mk,step(6.,adz)*step(adz,16.));
 if(tW<70.)mk=max(mk,bsTxt(p,vec2(x0+42.,zc),vec2(1.,0.),vec2(0.,1.),wd1,wd2,lrW));
 if(tE<70.)mk=max(mk,bsTxt(p,vec2(x1-42.,zc),vec2(-1.,0.),vec2(0.,-1.),ed1,ed2,lrE));
 float rub=smoothstep(1.,0.,abs(t0-280.)/240.)*smoothstep(14.,3.,adz)*(.5+.5*vn2(p*vec2(.03,.4)));a*=1.-rub*.55;
 mk*=.8+.2*step(.25,n3);c=mix(a,vec3(.78,.78,.76)*(.8+.2*n2),mk);rough=mix(.84,.6,mk);}
// unione di segmenti: distanza dal centro più vicino e distanza con segno dal bordo della pavimentazione
#define TX(AX,AZ,BX,BZ,HW) {float d=bsSeg(p,vec2(AX,AZ),vec2(BX,BZ));tc=min(tc,d);ts=min(ts,d-HW);}
#define RD(AX,AZ,BX,BZ,HW) {float d=bsSeg(p,vec2(AX,AZ),vec2(BX,BZ));if(d-HW<rs){rs=d-HW;rc=d;rhw=HW;rt=abs(BX-AX)>abs(BZ-AZ)?p.x:p.y;}}
#define CN(X0,Z0,X1,Z1) cs=min(cs,bsBox(p,vec2(X0,Z0),vec2(X1,Z1)));
#define GV(X0,Z0,X1,Z1) gs=min(gs,bsBox(p,vec2(X0,Z0),vec2(X1,Z1)));
#define GC(X,Z,R) gs=min(gs,length(p-vec2(X,Z))-R);
float bsFlood(vec2 p){float k=0.;
 for(int i=0;i<8;i++){vec2 d=p-vec2(-1060.+float(i)*100.,-1505.);k+=exp(-dot(d,d)*.0012);}
 for(int i=0;i<8;i++){vec2 d=p-vec2(-1000.+float(i)*100.,-2100.);k+=exp(-dot(d,d)*.0016);}
 vec2 d=p-vec2(0.,-1395.);k+=exp(-dot(d,d)*.002)*1.5;d=p-vec2(-135.,-1530.);k+=exp(-dot(d,d)*.0015);d=p-vec2(-345.,-1850.);k+=exp(-dot(d,d)*.002);d=p-vec2(110.,-1790.);k+=exp(-dot(d,d)*.0012);
 return k;}
void zg(vec2 p){gEmis=vec3(0.);gMet=0.;float n2=vn2(p*2.7),n3=vn2(p*11.),n1=vn2(p*.13);float night=smoothstep(.15,.6,uNight);
 vec3 c=vec3(0.);float rough=.9,hit=0.;
 bsRunway(p,-1200.,-250.,-1640.,25.,0.,9.,0.,2.,7.,1.,n2,n3,c,rough,hit);
 bsRunway(p,-1180.,200.,-1990.,30.,0.,9.,1.,2.,7.,0.,n2,n3,c,rough,hit);
 if(hit<.5){
  // vie di rullaggio
  float tc=1e4,ts=1e4;
  TX(-1205.,-1585.,-285.,-1585.,11.)TX(-1150.,-1640.,-1150.,-1585.,11.5)TX(-300.,-1640.,-300.,-1585.,11.5)
  TX(-1000.,-1585.,-1000.,-1560.,10.)TX(-720.,-1585.,-720.,-1560.,10.)TX(-450.,-1585.,-450.,-1560.,10.)
  TX(-1205.,-1585.,-1205.,-1925.,11.5)TX(-1205.,-1925.,170.,-1925.,11.5)
  TX(-1150.,-1990.,-1150.,-1925.,11.5)TX(-700.,-1990.,-700.,-1925.,11.5)TX(-250.,-1990.,-250.,-1925.,11.5)TX(170.,-1990.,170.,-1925.,11.5)
  TX(-1050.,-2075.,-250.,-2075.,11.5)TX(-1050.,-1990.,-1050.,-2075.,11.5)TX(-250.,-1990.,-250.,-2075.,11.5)
  if(ts<0.){hit=1.;c=asph(p)*.95;rough=.86;float mk=1.-step(.11,tc);float ed=abs(ts+.6);mk=max(mk,(1.-step(.09,ed))+(1.-step(.09,abs(ed-.32))));
   // linee di attesa prima delle piste (due continue e due tratteggiate)
   float o=99.;if(min(abs(p.x+1150.),abs(p.x+300.))<11.&&abs(p.y+1605.)<1.)o=p.y+1605.;
   if(min(min(abs(p.x+1150.),abs(p.x+700.)),min(abs(p.x+250.),abs(p.x-170.)))<11.&&abs(p.y+1948.)<1.)o=p.y+1948.;
   if(min(abs(p.x+1050.),abs(p.x+250.))<11.&&abs(p.y+2032.)<1.)o=-(p.y+2032.);
   if(o<9.){float ao=abs(o);float ln=step(abs(ao-.22),.075)+step(abs(ao-.52),.075);mk=max(mk,ln*(o>0.?1.:step(.5,fract(p.x/1.2))));}
   mk*=.75+.25*step(.25,n3);c=mix(c,vec3(.78,.62,.16)*(.8+.2*n2),clamp(mk,0.,1.));rough=mix(rough,.6,clamp(mk,0.,1.));}}
 if(hit<.5){
  // piazzali e aree in cemento
  float cs=1e4;
  CN(-1110.,-1560.,-330.,-1450.)CN(-212.,-1574.,-56.,-1486.)CN(-372.,-1880.,-318.,-1822.)CN(-768.,-1820.,-616.,-1790.)CN(-482.,-1846.,-400.,-1770.)CN(10.,-1650.,90.,-1585.)CN(-44.,-1624.,-10.,-1574.)CN(-16.,-1408.,16.,-1378.)
  for(int i=0;i<8;i++){float xs=-1000.+float(i)*100.;cs=min(cs,bsBox(p,vec2(xs-16.,-2133.),vec2(xs+16.,-2086.5)));}
  if(cs<0.){hit=1.;vec2 q=fract(p/5.);float jt=1.-step(.012,q.x)*step(q.x,.988)*step(.012,q.y)*step(q.y,.988);c=vec3(.44,.42,.39)*(.88+.12*h21(floor(p/5.)))*(.9+.12*n2);c=mix(c,c*.7,jt);c*=1.-.22*smoothstep(.6,.9,vn2(p*.08+4.));rough=.86;
   float mk=0.;
   // piazzale nord: linee gialle d'ingresso per gli aerei, griglia per gli elicotteri, piazzali dei rifugi
   if(p.y>-1560.&&p.y<-1450.&&p.x<-330.){float lx=min(min(min(abs(p.x+1014.),abs(p.x+914.)),min(abs(p.x+814.),abs(p.x+692.))),min(min(abs(p.x+580.),abs(p.x+480.)),abs(p.x+400.)));mk=max(mk,(1.-step(.12,lx))*step(-1555.,p.y)*step(p.y,-1458.));mk=max(mk,(1.-step(.1,abs(p.y+1555.)))*step(lx,6.));}
   if(p.y<-2085.){float xs=-1000.+100.*floor((p.x+1000.)/100.+.5);mk=max(mk,(1.-step(.12,abs(p.x-xs)))*step(p.y,-2090.));}
   // piazza d'armi: linee di schieramento; campi da basket
   if(p.x>10.&&p.x<90.&&p.y<-1585.&&p.y>-1650.){float gx=fract((p.x-10.)/8.);float wl=step(abs(p.x-50.),36.)*step(abs(p.y+1617.5),28.);mk=max(mk,(1.-step(.015,gx))*wl*.8+step(abs(abs(p.y+1617.5)-28.),.08)*step(abs(p.x-50.),36.));c*=1.04;}
   if(p.x>-44.&&p.x<-10.&&p.y>-1624.&&p.y<-1574.){c=mix(vec3(.12,.24,.18),vec3(.42,.16,.1),step(-1599.,p.y))*(.9+.1*n2);vec2 cc=vec2(-27.,p.y<-1599.?-1611.5:-1586.5);vec2 dv=p-cc;
    mk=max(mk,step(abs(abs(dv.x)-7.),.05)*step(abs(dv.y),12.)+step(abs(abs(dv.y)-12.),.05)*step(abs(dv.x),7.)+step(abs(length(dv)-1.8),.05)+step(abs(dv.y),.05)*step(abs(dv.x),7.));rough=.7;}
   mk=clamp(mk,0.,1.)*(.8+.2*step(.25,n3));c=mix(c,vec3(.8,.66,.2)*(.85+.15*n2),mk);}}
 if(hit<.5){
  // eliporto: tre piazzole con cerchio giallo e H bianca
  for(int i=0;i<3;i++){vec2 hc=vec2(60.+float(i)*50.,-1790.);vec2 d=p-hc;if(max(abs(d.x),abs(d.y))<13.){hit=1.;vec2 q=fract(p/4.);float jt=1.-step(.015,q.x)*step(q.x,.985)*step(.015,q.y)*step(q.y,.985);c=vec3(.47,.46,.43)*(.9+.1*n2);c=mix(c,c*.72,jt);rough=.82;
    float r=length(d);float mk=step(abs(r-9.),.35);float hh=max(step(abs(abs(d.x)-2.4),.45)*step(abs(d.y),4.),step(abs(d.y),.45)*step(abs(d.x),2.4));
    c=mix(c,vec3(.82,.68,.18),mk*.9);c=mix(c,vec3(.86),hh*.92);gEmis+=vec3(.2,1.,.4)*night*1.2*step(abs(r-12.2),.18)*step(.5,fract(atan(d.y,d.x)*2.546));}}}
 if(hit<.5){
  // pista d'atletica con campo da calcio al centro
  vec2 d=p-vec2(160.,-1620.);vec2 q=vec2(max(abs(d.x)-30.,0.),d.y);float r=length(q);
  if(r<35.){hit=1.;if(r>27.){float ln=fract((r-27.)/1.22);c=vec3(.43,.13,.08)*(.88+.15*n2)*(.9+.1*n3);c=mix(c,vec3(.85),(1.-step(.04,ln))*.9);rough=.82;}
   else{c=mix(vec3(.06,.11,.03),vec3(.1,.16,.05),n1)*(.85+.25*n3);c*=.92+.08*step(.5,fract(d.x/6.));float f=step(abs(abs(d.x)-26.),.06)*step(abs(d.y),20.)+step(abs(abs(d.y)-20.),.06)*step(abs(d.x),26.)+step(abs(d.x),.06)*step(abs(d.y),20.)+step(abs(length(d)-6.),.06);c=mix(c,vec3(.8),clamp(f,0.,1.)*.85);rough=.95;}}}
 if(hit<.5){
  // strade: carreggiate in asfalto con margini bianchi e mezzeria gialla
  float rs=1e4,rc=1e4,rhw=3.5,rt=0.;
  RD(0.,-1378.,0.,-1900.,4.5)RD(-1240.,-1705.,245.,-1705.,3.5)RD(-1240.,-1880.,245.,-1880.,3.5)
  RD(-1240.,-1395.,245.,-1395.,3.)RD(245.,-1395.,245.,-2225.,3.)RD(245.,-2225.,-1240.,-2225.,3.)RD(-1240.,-2225.,-1240.,-1395.,3.)
  RD(-1240.,-2120.,-1100.,-2120.,3.)RD(-1240.,-2175.,-1100.,-2175.,3.)RD(-260.,-2110.,245.,-2110.,3.)RD(0.,-1560.,240.,-1560.,3.5)RD(-120.,-1445.,0.,-1445.,3.5)
  RD(-1060.,-1880.,-1060.,-1872.,3.)RD(-345.,-1880.,-345.,-1925.,4.)RD(-560.,-1705.,-560.,-1450.,3.)
  if(rs<0.){hit=1.;c=asph(p);rough=.86;float mk=(1.-step(.08,abs(rs+.3)));mk=max(mk,0.);float yl=(1.-step(.07,abs(rc-(rhw>4.?.18:0.))))*(rhw>4.?1.:step(fract((p.x+p.y)/9.),.5));
   if(rhw>4.)yl=max(yl,1.-step(.07,abs(rc-.18)));c=mix(c,vec3(.78,.77,.73)*(.85+.15*n2),mk*.9);c=mix(c,vec3(.75,.58,.15),yl*.85*(.8+.2*step(.3,n3)));
   gEmis+=c*vec3(1.,.9,.75)*night*1.3*lamps(rt,rc-rhw-.6,30.,15.);}}
 if(hit<.5){
  // parcheggio del personale
  if(p.x>-110.&&p.x<-20.&&p.y>-1470.&&p.y<-1420.){hit=1.;c=asph(p)*1.05;rough=.88;float ry=mod(p.y+1470.,16.);float stl=(ry<5.5||ry>10.5)?1.:0.;float sl=stl*(1.-step(.06,abs(fract((p.x+110.)/2.7)-.5)));float bl=(1.-step(.07,abs(ry-5.5)))+(1.-step(.07,abs(ry-10.5)));c=mix(c,vec3(.82),clamp(sl+bl,0.,1.)*.85);}}
 if(hit<.5){
  // ghiaia: deposito carburante, polveriere, basi di torri, radome, missili, antenne
  float gs=1e4;
  GV(-1115.,-1872.,-975.,-1768.)GV(-1250.,-2232.,-1095.,-2100.)GV(-140.,-1752.,-100.,-1728.)
  GC(-150.,-2150.,17.)GC(-90.,-2190.,14.)GC(130.,-2150.,40.)GC(225.,-1850.,12.)GC(180.,-1850.,10.)GC(150.,-1850.,10.)GC(-400.,-1425.,9.)
  if(gs<0.){hit=1.;float g=vn2(p*3.3)*.55+vn2(p*9.1)*.45;c=mix(vec3(.15,.135,.11),vec3(.24,.215,.18),g)*(.82+.3*vn2(p*14.));c=mix(c,vec3(.36,.26,.15),smoothstep(-4.,0.,gs)*.6);rough=.95;}}
 if(hit<.5)discard;
 gEmis+=c*vec3(1.,.92,.78)*night*1.6*bsFlood(p);
 gAlb=c;gRough=rough;}
`;
// ---------- solidi della base: scatole e cilindri (collisioni per giocatore, auto, detriti) ----------
const BZC={grid:new Map(),all:[]};
function bzReg(o,x0,z0,x1,z1){BZC.all.push(o);for(let gx=Math.floor(x0/32);gx<=Math.floor(x1/32);gx++)for(let gz=Math.floor(z0/32);gz<=Math.floor(z1/32);gz++){const k=gx*100003+gz;let a=BZC.grid.get(k);if(!a)BZC.grid.set(k,a=[]);a.push(o);}return o;}
function bzBoxC(x0,y0,z0,x1,y1,z1){return bzReg({t:0,x0:Math.min(x0,x1),y0:Math.min(y0,y1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),y1:Math.max(y0,y1),z1:Math.max(z0,z1),on:true},Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1));}
function bzCylC(x,z,r,y0,y1){return bzReg({t:1,x,z,r,y0,y1,on:true},x-r,z-r,x+r,z+r);}
// guscio ad arco (rifugi, polveriere): fette di corona circolare approssimate con scatole
function bzArchC(x,z,R,r,L,y0,n){const L2=L/2,list=[];for(let k=0;k<n;k++){const a0=k/n*Math.PI,a1=(k+1)/n*Math.PI,xs=[R*Math.cos(a0),R*Math.cos(a1),r*Math.cos(a0),r*Math.cos(a1)],ys=[R*Math.sin(a0),R*Math.sin(a1),r*Math.sin(a0),r*Math.sin(a1)];
  list.push(bzBoxC(x+Math.min(...xs),y0+Math.min(...ys),z-L2,x+Math.max(...xs),y0+Math.max(...ys),z+L2));}return list;}
function bzContact(x,y,z,o){if(x<-1300||x>300||z<-2280||z>-1330)return false;const a=BZC.grid.get(Math.floor(x/32)*100003+Math.floor(z/32));if(!a)return false;
 for(const c of a){if(!c.on)continue;
  if(c.t===0){if(x<c.x0||x>c.x1||y<c.y0||y>c.y1||z<c.z0||z>c.z1)continue;let best=c.y1-y,nx=0,ny=1,nz=0,d;
   if((d=x-c.x0)<best){best=d;nx=-1;ny=0;nz=0;}if((d=c.x1-x)<best){best=d;nx=1;ny=0;nz=0;}if((d=z-c.z0)<best){best=d;nx=0;ny=0;nz=-1;}if((d=c.z1-z)<best){best=d;nx=0;ny=0;nz=1;}if(c.y0>BASEY+.5&&(d=y-c.y0)<best){best=d;nx=0;ny=-1;nz=0;}
   o.nx=nx;o.ny=ny;o.nz=nz;o.d=best;o.b=null;o.ci=-1;return true;}
  if(y<c.y0||y>c.y1)continue;const dx=x-c.x,dz=z-c.z,r=Math.hypot(dx,dz);if(r>c.r)continue;const ds=c.r-r,dt=c.y1-y;
  if(dt<ds){o.nx=0;o.ny=1;o.nz=0;o.d=dt;}else{o.nx=dx/(r||1);o.ny=0;o.nz=dz/(r||1);o.d=ds;}o.b=null;o.ci=-1;return true;}return false;}
{const pc1=pointContact;pointContact=function(x,y,z,o){return pc1(x,y,z,o)||bzContact(x,y,z,o);};}
{const sb1=solidBoxes;solidBoxes=function(x0,y0,z0,x1,y1,z1,out){sb1(x0,y0,z0,x1,y1,z1,out);if(x1<-1300||x0>300||z1<-2280||z0>-1330)return out;const seen=new Set();
 for(let gx=Math.floor(x0/32);gx<=Math.floor(x1/32);gx++)for(let gz=Math.floor(z0/32);gz<=Math.floor(z1/32);gz++){const a=BZC.grid.get(gx*100003+gz);if(!a)continue;for(const c of a){if(!c.on||seen.has(c))continue;seen.add(c);
  if(c.t===0){if(c.x1>x0&&c.x0<x1&&c.y1>y0&&c.y0<y1&&c.z1>z0&&c.z0<z1)out.push(c.x0,c.y0,c.z0,c.x1,c.y1,c.z1);}
  else{const h=c.r*.86;if(c.x+h>x0&&c.x-h<x1&&c.y1>y0&&c.y0<y1&&c.z+h>z0&&c.z-h<z1)out.push(c.x-h,c.y0,c.z-h,c.x+h,c.y1,c.z+h);}}}return out;};}
// ---------- materiali e utilità ----------
const BZM={};
function bzMats(){if(BZM.v)return;BZM.v=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.05});BZM.m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.55});
 BZM.glass=new THREE.MeshStandardMaterial({color:lc(0x1d2a33),roughness:.08,metalness:.3,envMapIntensity:1.2});}
function bzInst(geo,mat,L,sh,far){if(!L.length)return null;const im=new THREE.InstancedMesh(geo,mat,L.length);L.forEach((q,i)=>{_dm.position.set(q[0],q[1],q[2]);_dm.rotation.set(q[7]||0,q[3]||0,q[8]||0,'YXZ');_dm.scale.set(q[4]||1,q[5]||1,q[6]||1);_dm.updateMatrix();im.setMatrixAt(i,_dm.matrix);});
 im.castShadow=sh!==false;im.receiveShadow=true;scene.add(im);boundInst(im,far||2600);return im;}
function bzHide(im,i){if(!im)return;_dm.position.set(0,-999,0);_dm.rotation.set(0,0,0);_dm.scale.set(.001,.001,.001);_dm.updateMatrix();im.setMatrixAt(i,_dm.matrix);im.instanceMatrix.needsUpdate=true;}
function bzCanvas(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
// macerie generiche (cumulo di blocchi) per le strutture distrutte
function bzRuin(x,y,z,sx,sy,sz,ry){if(!BZ.ruin)return;const i=BZ.ruinN;if(i>=60)return;BZ.ruinN++;_dm.position.set(x,y,z);_dm.rotation.set(0,ry||0,0);_dm.scale.set(sx,sy,sz);_dm.updateMatrix();BZ.ruin.setMatrixAt(i,_dm.matrix);BZ.ruin.count=BZ.ruinN;BZ.ruin.instanceMatrix.needsUpdate=true;}
// ---------- edifici a voxel (distruttibili): comando, caserme, mensa, autoparco, vigili del fuoco, sala operativa, magazzini, torre di controllo ----------
function bzGen(){const add=(x0,z0,w,d,fl,st,o)=>{const b=addBuilding(x0,z0,w,d,fl,st,[[0,0,fl]]);b.noProps=true;b.bz=true;Object.assign(b,o||{});return b;};
 BZ.hq=add(30,-1474,56,24,5,3);for(const x of[110,170])for(const z of[-1458,-1494,-1530])add(x,z,44,12,4,1);
 BZ.mess=add(30,-1538,56,24,3,3);BZ.garage=add(-178,-1602,44,24,3,7);BZ.fire=add(-366,-1822,40,20,3,1);BZ.ops=add(-470,-1826,28,20,3,3);
 BZ.wh=[add(-762,-1790,56,28,3,7),add(-682,-1790,56,28,3,7)];
 // torre di controllo: fusto in cemento, cabina vetrata a 30 m (il primo piano è sotto la quota della base)
 const cabY=34,r0=3.4;BZ.tw=htNew({name:'Torre Area 51',x:-420,z:-1790,H:44,st:HTS.conc,S:12,J:3,core:0,K:5,hp0:260,seed:.37,sh:(y,f,q)=>{let r;if(y<cabY-4)r=r0+1.1*(1-y/(cabY-4));else if(y<cabY)r=r0+.6+(y-(cabY-4))*.9;else if(y<cabY+8)r=r0+4.4+(y-cabY)*.14;else r=r0+5.6;
  q.a=q.b=r;q.n=2;q.k3=0;q.k4=0;q.rot=0;q.ox=0;q.oz=0;q.ri=0;return q;}});BZ.tw.stF=f=>f*4>=cabY&&f*4<cabY+8?HTS.cab:HTS.conc;}
// ---------- recinzione doppia con filo spinato, torrette di guardia, pali dei fari ----------
function bzFence(){const Y=BASEY,pos=[],uv=[],wpos=[],wuv=[],posts=[],poles=[],signs=[];
 const cl=bzCanvas(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(150,155,158,1)';g.lineWidth=2.2;for(let i=-8;i<16;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16+128,128);g.stroke();g.beginPath();g.moveTo(i*16+128,0);g.lineTo(i*16,128);g.stroke();}g.lineWidth=5;g.beginPath();g.moveTo(0,3);g.lineTo(128,3);g.stroke();});
 cl.wrapS=cl.wrapT=THREE.RepeatWrapping;
 const bw=bzCanvas(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(120,124,128,1)';g.lineWidth=2;for(let k=0;k<3;k++){const y0=10+k*20;g.beginPath();for(let x=0;x<=w;x+=4)g.lineTo(x,y0+Math.sin(x*.21+k)*3);g.stroke();for(let x=6;x<w;x+=24){g.beginPath();g.moveTo(x-4,y0-4);g.lineTo(x+4,y0+4);g.moveTo(x+4,y0-4);g.lineTo(x-4,y0+4);g.stroke();}}});
 bw.wrapS=THREE.RepeatWrapping;
 const quad=(P,UV,ax,ay,az,bx,by,bz,cx,cy,cz,dx,dy,dz,u0,u1)=>{P.push(ax,ay,az,bx,by,bz,cx,cy,cz,ax,ay,az,cx,cy,cz,dx,dy,dz);UV.push(u0,0,u1,0,u1,1,u0,0,u1,1,u0,1);};
 for(const [k,x0,z0,x1,z1] of [[0,-1260,-2240,260,-1380],[1,-1255,-2235,255,-1385]]){const sides=[[x0,z1,x1,z1],[x1,z1,x1,z0],[x1,z0,x0,z0],[x0,z0,x0,z1]];
  for(const [ax,az,bx,bz] of sides){const L=Math.hypot(bx-ax,bz-az),dx=(bx-ax)/L,dz=(bz-az)/L;let nx=dz,nz=-dx;const mx=(ax+bx)/2+500,mz=(az+bz)/2+1810;if(nx*mx+nz*mz<0){nx=-nx;nz=-nz;}
   const north=Math.abs(az-bz)<1&&az>-1400;let runA=null;const n=Math.ceil(L/4);
   const flush=(tA,tB)=>{if(tB-tA<1)return;const xa=ax+dx*tA,za=az+dz*tA,xb=ax+dx*tB,zb=az+dz*tB;
    quad(pos,uv,xa,Y,za,xb,Y,zb,xb,Y+3.2,zb,xa,Y+3.2,za,tA/2.5,tB/2.5);
    quad(wpos,wuv,xa,Y+3.2,za,xb,Y+3.2,zb,xb+nx*.45,Y+3.75,zb+nz*.45,xa+nx*.45,Y+3.75,za+nz*.45,tA/1.6,tB/1.6);};
   for(let i=0;i<=n;i++){const t=i/n*L,x=ax+dx*t,z=az+dz*t,gap=north&&Math.abs(x)<10;
    if(gap){if(runA!==null){flush(runA,t);runA=null;}continue;}if(runA===null)runA=t;posts.push([x,Y+1.7,z,Math.atan2(nx,nz)]);
    if(k===1&&i%17===0)poles.push([x-nx*1.2,Y,z-nz*1.2,Math.atan2(-nx,-nz)]);if(k===0&&i%38===19)signs.push([x+nx*.06,Y+1.5,z+nz*.06,Math.atan2(nx,nz)]);}
   if(runA!==null)flush(runA,L);}}
 const mk=(P,UV,tex,rep)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tex,alphaTest:.45,side:THREE.DoubleSide,roughness:.5,metalness:.6}));m.receiveShadow=true;scene.add(m);return m;};
 lodObj(mk(pos,uv,cl),900);lodObj(mk(wpos,wuv,bw),700);
 {const B=Bin(),gv=C3(0x8a8f93);cBox(B,.08,3.4,.08,0,0,0,gv);B.add(cGeo(new THREE.BoxGeometry(.05,.6,.05),gv),0,1.95,.18,-.7,0,0);tiledInst(mergeBin(B),BZM.m,posts,{tile:400,far:650,set:(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(1,1,1);}});}
 // pali dei fari (si accendono di notte)
 {const B=Bin(),gv=C3(0x7d8286),lp=C3(0x2a2c2e);cCyl(B,.14,11,0,5.5,0,gv,0,0,8);B.add(cGeo(new THREE.BoxGeometry(.12,.12,1.4),gv),0,10.8,.6);cBox(B,.9,.35,.6,0,10.7,1.25,lp);cBox(B,.8,.06,.5,0,10.5,1.25,[3,2.8,2.4]);
  tiledInst(mergeBin(B),BZM.v,poles,{tile:500,far:1500,cast:true,set:(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(1,1,1);}});for(const q of poles){const fx=Math.sin(q[3]),fz=Math.cos(q[3]);lpAdd(q[0]+fx*1.25,q[1]+10.4,q[2]+fz*1.25,[2.6,2.3,1.8],.75,5,0);}}
 // cartelli sulla recinzione
 {const t=bzCanvas(512,320,(g,w,h)=>{g.fillStyle='#f4f2ea';g.fillRect(0,0,w,h);g.fillStyle='#b3261e';g.fillRect(0,0,w,92);g.fillStyle='#fff';g.font='900 64px Arial';g.textAlign='center';g.fillText('ATTENZIONE',w/2,70);
   g.fillStyle='#111';g.font='800 40px Arial';g.fillText('ZONA MILITARE',w/2,150);g.font='600 30px Arial';g.fillText('Vietato fotografare e oltrepassare',w/2,205);g.fillText('Uso della forza autorizzato',w/2,250);g.strokeStyle='#111';g.lineWidth=8;g.strokeRect(4,4,w-8,h-8);});
  tiledInst(new THREE.PlaneGeometry(1.2,.75),new THREE.MeshStandardMaterial({map:t,roughness:.6,side:THREE.DoubleSide}),signs,{tile:500,far:420,set:(q,d)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],0);d.scale.set(1,1,1);}});}
 // torrette di guardia agli angoli e lungo i lati
 const TW=[[-1248,-1392],[248,-1392],[-1248,-2228],[248,-2228],[-870,-1392],[-490,-1392],[-120,-1392],[-870,-2228],[-490,-2228],[-120,-2228],[-1248,-1810],[248,-1810]];
 {const B=Bin(),ol=C3(0x5b5a45),dk=C3(0x2c2d27),cn=C3(0x7c7a6c);for(const sx of[-1,1])for(const sz of[-1,1]){B.add(cGeo(new THREE.BoxGeometry(.22,9.2,.22),ol),sx*1.65,4.6,sz*1.65,sz*.035,0,-sx*.035);}
  for(const y of[2.6,6]){for(const s of[-1,1]){B.add(cGeo(new THREE.BoxGeometry(3.4,.1,.1),ol),0,y,s*1.62,0,0,.95);B.add(cGeo(new THREE.BoxGeometry(.1,.1,3.4),ol),s*1.62,y,0,.95,0,0);}}
  cBox(B,4.6,.25,4.6,0,9.1,0,cn);cBox(B,3.7,1.1,3.7,0,9.8,0,ol);cBox(B,3.7,.3,3.7,0,11.5,0,ol);for(const s of[-1,1]){cBox(B,.16,1.2,3.7,s*1.77,10.9,0,dk);cBox(B,3.7,1.2,.16,0,10.9,s*1.77,dk);}
  for(const s of[-1,1]){cBox(B,.12,2.6,.12,s*1.86,10.6,1.86,ol);cBox(B,.12,2.6,.12,s*1.86,10.6,-1.86,ol);}cBox(B,4.5,.22,4.5,0,11.85,0,cn);cBox(B,4.9,.08,4.9,0,12.0,0,dk);
  cCyl(B,.35,.5,0,12.4,0,dk,Math.PI/2,0,10);for(const s of[-1,1])cBox(B,.06,9,.06,2.05+s*.22,4.5,0,cn);for(let i=0;i<22;i++)cBox(B,.5,.04,.04,2.05,.4+i*.4,0,cn);
  BZ.twIm=bzInst(mergeBin(B),BZM.v,TW.map(q=>[q[0],BASEY,q[1],Math.atan2(q[0]+500,q[1]+1810)]),true,1300);
  for(const q of TW){lpAdd(q[0],BASEY+10.9,q[1],[2.2,1.8,1.2],.45,5,0);lpAdd(q[0],BASEY+12.45,q[1],[3,2.9,2.6],.6,5,0);
   const leg=bzBoxC(q[0]-1.8,BASEY,q[1]-1.8,q[0]+1.8,BASEY+12,q[1]+1.8);BZ.objs.push({kind:'gt',x:q[0],z:q[1],y:BASEY+6,r:3,hp:.9,alive:true,col:[leg],idx:BZ.objs.filter(o=>o.kind==='gt').length});}}
}
// ---------- cancello presidiato: garitta, pensilina, sbarre, new jersey a zig-zag, cartello, bandiere ----------
function bzGate(){const Y=BASEY,g=new THREE.Group();scene.add(g);
 {const B=Bin(),cn=C3(0x9a968a),wh=C3(0xd8d6cf),rd=C3(0xa3271f),dk=C3(0x2b2d2f);
  cBox(B,3.4,3.,4.4,0,Y+1.5,-1393,wh);cBox(B,3.8,.3,4.8,0,Y+.15,-1393,cn);cBox(B,3.6,.12,.04,0,Y+1.9,-1390.78,dk);cBox(B,5.2,.3,6.4,0,Y+3.15,-1393,cn);
  for(const x of[-11,0,11])for(const z of[-1388,-1402])cCyl(B,.28,6,x,Y+3,z,cn,0,0,12);cBox(B,26,.6,16,0,Y+6.3,-1395,wh);cBox(B,26.2,.9,.2,0,Y+6.2,-1387,rd);cBox(B,26.2,.9,.2,0,Y+6.2,-1403,rd);
  for(const x of[-10.5,-6,6,10.5])for(const z of[-1390,-1396,-1402])cBox(B,1.6,.05,.5,x,Y+5.98,z,[3,2.9,2.6]);
  for(const s of[-1,1])cBox(B,1.6,1.1,.6,s*2.3,Y+.55,-1386.2,cn);
  const m=new THREE.Mesh(mergeBin(B),BZM.v);m.castShadow=m.receiveShadow=true;g.add(m);
  const gl=new THREE.Mesh(new THREE.BoxGeometry(3.45,1.1,4.45),BZM.glass);gl.position.set(0,Y+2,-1393);g.add(gl);lodObj(g,1500);}
 bzBoxC(-1.8,Y,-1395.3,1.8,Y+3.3,-1390.7);for(const x of[-11,0,11])for(const z of[-1388,-1402])bzCylC(x,z,.3,Y,Y+6);
 lpAdd(0,Y+5.9,-1395,[2.8,2.6,2.2],1.2,5,0);for(const x of[-8,8])lpAdd(x,Y+5.9,-1395,[2.8,2.6,2.2],1.1,5,0);
 // sbarre a strisce: si alzano quando arriva qualcuno
 const bt=bzCanvas(256,16,(g2,w)=>{for(let i=0;i<8;i++){g2.fillStyle=i%2?'#f2f2ee':'#c81e1e';g2.fillRect(i*32,0,32,16);}});
 BZ.gate={arms:[],t:0};for(const s of[-1,1]){const p=new THREE.Group();p.position.set(s*2.3,Y+1.05,-1386.2);g.add(p);const a=new THREE.Mesh(new THREE.BoxGeometry(7.4,.16,.12).translate(s*3.7,0,0),new THREE.MeshStandardMaterial({map:bt,roughness:.5}));a.castShadow=true;p.add(a);
  const lt=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),new THREE.MeshBasicMaterial({color:new THREE.Color(3,.2,.1)}));lt.position.set(s*7.2,.12,0);p.add(lt);BZ.gate.arms.push({p,s,lt,ang:0});}
 // new jersey a zig-zag sulla strada d'accesso
 {const B=Bin(),cn=C3(0xb9b5aa);const sh=new THREE.Shape();sh.moveTo(-.3,0);sh.lineTo(.3,0);sh.lineTo(.12,.3);sh.lineTo(.1,.8);sh.lineTo(-.1,.8);sh.lineTo(-.12,.3);sh.closePath();const jg=new THREE.ExtrudeGeometry(sh,{depth:3,bevelEnabled:false}).translate(0,0,-1.5);
  const jl=[];for(let i=0;i<6;i++){const z=-1372+i*7,side=i%2?1:-1;for(let k=0;k<2;k++)jl.push([side*(1.8+k*3.05),Y,z,Math.PI/2,1,1,1]);}
  bzInst(cGeo(jg,cn),BZM.v,jl,true,800);for(const q of jl)bzBoxC(q[0]-1.5,Y,q[2]-.3,q[0]+1.5,Y+.8,q[2]+.3);}
 // cartello monumentale
 {const t=bzCanvas(1024,384,(g2,w,h)=>{g2.fillStyle='#2b2a26';g2.fillRect(0,0,w,h);g2.strokeStyle='#c9a24a';g2.lineWidth=10;g2.strokeRect(14,14,w-28,h-28);g2.fillStyle='#e9dfc2';g2.textAlign='center';g2.font='900 150px Arial';g2.fillText('AREA 51',w/2,190);
   g2.font='700 46px Arial';g2.fillText('BASE AEREA · CUBE YORK',w/2,268);g2.font='600 34px Arial';g2.fillStyle='#d9b45a';g2.fillText('ACCESSO CONSENTITO SOLO AL PERSONALE AUTORIZZATO',w/2,330);});
  const wall=new THREE.Mesh(new THREE.BoxGeometry(11,3.4,.8),MS(0x8d877a,.9,0));wall.position.set(-19,Y+1.7,-1366);wall.castShadow=wall.receiveShadow=true;scene.add(wall);bzBoxC(-24.5,Y,-1366.4,-13.5,Y+3.4,-1365.6);
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(10,3.75*10/10.66),new THREE.MeshStandardMaterial({map:t,roughness:.6}));pl.position.set(-19,Y+1.75,-1365.58);scene.add(pl);lodObj(pl,700);lodObj(wall,1200);}
 // bandiere davanti al comando (sventolano col vento)
 {const ft=bzCanvas(256,160,(g2,w,h)=>{for(let i=0;i<13;i++){g2.fillStyle=i%2?'#f4f4f0':'#b22234';g2.fillRect(0,i*h/13,w,h/13+1);}g2.fillStyle='#3c3b6e';g2.fillRect(0,0,w*.4,h*7/13);g2.fillStyle='#fff';for(let r=0;r<9;r++)for(let c=0;c<(r%2?5:6);c++){g2.beginPath();g2.arc(8+c*17+(r%2?8:0),7+r*9.5,2.6,0,7);g2.fill();}});
  const ft2=bzCanvas(256,160,(g2,w,h)=>{g2.fillStyle='#4b5320';g2.fillRect(0,0,w,h);g2.fillStyle='#e9dfc2';g2.textAlign='center';g2.font='900 64px Arial';g2.fillText('51',w/2,95);g2.font='700 22px Arial';g2.fillText('AIR WING',w/2,135);g2.strokeStyle='#d9b45a';g2.lineWidth=6;g2.strokeRect(6,6,w-12,h-12);});
  const fm=tex=>{const m=new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,roughness:.8});m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat fu=uv.x;transformed.z+=sin(uTime*5.+fu*7.+position.y*.6)*.28*fu;transformed.y-=fu*fu*.25;');};return m;};
  [[50,ft],[58,ft2],[66,ft]].forEach(([x,tex],i)=>{const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,12,8),MS(0xd8d8d4,.35,.7));pole.position.set(x,Y+6,-1436);pole.castShadow=true;scene.add(pole);bzCylC(x,-1436,.12,Y,Y+12);
   const f=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2,12,4).translate(1.6,0,0),fm(tex));f.position.set(x+.08,Y+10.8,-1436);f.castShadow=true;scene.add(f);BZ.flags.push(f);lodObj(f,700);lodObj(pole,900);});}}
// ---------- rifugi corazzati per gli aerei (8): volta in cemento, muro di fondo, portoni (alcuni aperti con un caccia dentro) ----------
const BZHAS=[-1000,-900,-800,-700,-600,-500,-400,-300].map((x,i)=>({x,z:-2150,open:i%3!==1}));
function bzShelters(){const Y=BASEY,cn=C3(0x9c917d),cn2=C3(0x857c6b),dr=C3(0x3d4231),dk=C3(0x1c1d1a);
 const arch=()=>{const B=Bin();const sh=new THREE.Shape();sh.absarc(0,0,13,0,Math.PI,false);sh.absarc(0,0,12,Math.PI,0,true);const ex=new THREE.ExtrudeGeometry(sh,{depth:34,bevelEnabled:false,curveSegments:28});ex.translate(0,0,-17);B.add(cGeo(ex,cn));
  B.add(cGeo(new THREE.CylinderGeometry(12.6,12.6,.9,28,1,false,Math.PI/2,Math.PI).rotateX(Math.PI/2),cn2),0,0,-17.2);
  for(const s of[-1,1]){cBox(B,1.6,2.4,34.6,s*13.4,1.2,0,cn2);}cBox(B,27.4,.5,1.2,0,.25,17.3,cn2);return B;};
 const A=arch(),Bc=arch();
 // portone chiuso: due ante d'acciaio con nervature
 Bc.add(cGeo(new THREE.CylinderGeometry(12,12,.5,28,1,false,Math.PI/2,Math.PI).rotateX(Math.PI/2),dr),0,0,16.7);for(let i=-5;i<=5;i++)cBox(Bc,.18,Math.sqrt(Math.max(0,144-(i*2.1)**2))-.3,.12,i*2.1,(Math.sqrt(Math.max(0,144-(i*2.1)**2))-.3)/2,17,dk);cBox(Bc,.12,11.8,.2,0,5.9,17.02,dk);
 const Lo=[],Lc=[];for(const S of BZHAS)(S.open?Lo:Lc).push([S.x,Y,S.z,0]);
 BZ.hasO=bzInst(mergeBin(A),BZM.v,Lo,true,2000);BZ.hasC=bzInst(mergeBin(Bc),BZM.v,Lc,true,2000);let io=0,ic=0;
 for(const S of BZHAS){const col=bzArchC(S.x,S.z,13,12,34,Y,9);col.push(bzBoxC(S.x-12.6,Y,S.z-17.7,S.x+12.6,Y+12.6,S.z-16.7));if(!S.open)col.push(bzBoxC(S.x-12,Y,S.z+16.4,S.x+12,Y+12,S.z+17));
  BZ.objs.push({kind:'has',x:S.x,z:S.z,y:Y+6,r:15,hp:3.2,alive:true,col,im:S.open?BZ.hasO:BZ.hasC,idx:S.open?io++:ic++,S});
  lpAdd(S.x,Y+12.8,S.z+16,[2.6,2.3,1.8],.6,5,0);}}
// ---------- polveriere a igloo (6): tumulo di terra, testata in cemento, porta blindata ----------
const BZIG=[[-1215,-2141],[-1170,-2141],[-1125,-2141],[-1215,-2196],[-1170,-2196],[-1125,-2196]];
function bzIgloos(){const Y=BASEY,B=Bin(),er=C3(0x8a7756),cn=C3(0xa49c8a),dr=C3(0x3b4230),yl=C3(0xd8b21c);
 B.add(cGeo(new THREE.CylinderGeometry(6.5,6.5,18,18,1,false,Math.PI/2,Math.PI).rotateX(Math.PI/2),er),0,0,-1,0,0,0,1,.82,1);
 B.add(cGeo(new THREE.SphereGeometry(6.5,18,8,0,Math.PI,0,Math.PI/2).rotateY(Math.PI),er),0,0,-10,0,0,0,1,.82,1);
 cBox(B,13.5,6.2,.9,0,3.1,8.2,cn);for(const s of[-1,1])cBox(B,.9,4.2,5,s*7.6,2.1,10,cn,0,s*.35,0);cBox(B,3.6,3.4,.25,0,1.7,8.75,dr);cBox(B,3.9,.25,.3,0,3.55,8.8,yl);cBox(B,4.8,.3,1.6,0,3.9,9.3,cn);
 cCyl(B,.08,5,0,7.5,-6,C3(0x8a8f93),0,0,6);
 BZ.igIm=bzInst(mergeBin(B),BZM.v,BZIG.map(q=>[q[0],Y,q[1],0]),true,1800);
 BZIG.forEach((q,i)=>{const col=[bzBoxC(q[0]-6.7,Y,q[1]-17,q[0]+6.7,Y+5.3,q[1]+8.6)];BZ.objs.push({kind:'ig',x:q[0],z:q[1],y:Y+3,r:9,hp:1.1,alive:true,col,im:BZ.igIm,idx:i});lpAdd(q[0],Y+4.3,q[1]+9.4,[2.4,2.1,1.6],.4,5,0);});
 // terrapieni di separazione tra le polveriere
 const bl=[];for(const z of[-2168])bl.push([-1170,Y+.9,z,0,150,1.8,4]);for(const x of[-1238,-1102])bl.push([x,Y+.9,-2168,0,4,1.8,110]);
 const bg=new THREE.BoxGeometry(1,1,1);bzInst(cGeo(bg,er),BZM.v,bl,true,1500);for(const q of bl)bzBoxC(q[0]-q[4]/2,Y,q[2]-q[6]/2,q[0]+q[4]/2,Y+1.8,q[2]+q[6]/2);}
// ---------- deposito carburante (6 serbatoi in un bacino di contenimento): esplodono a catena ----------
const BZFT=[[-1085,-1795],[-1045,-1795],[-1005,-1795],[-1085,-1845],[-1045,-1845],[-1005,-1845]];
function bzFuel(){const Y=BASEY,B=Bin(),wh=C3(0xd9d6cc),gr=C3(0x9aa0a3),rd=C3(0xa3271f);
 cCyl(B,8,11,0,5.5,0,wh,0,0,36);B.add(cGeo(new THREE.ConeGeometry(8.2,1.4,36),wh),0,11.7,0);B.add(cGeo(new THREE.TorusGeometry(8.1,.07,4,40).rotateX(Math.PI/2),gr),0,11.1,0);
 for(let i=0;i<14;i++){const a=i*.16,y=.6+i*.75;cBox(B,1.1,.08,.5,Math.cos(a)*8.3,y,Math.sin(a)*8.3,gr,0,-a,0);}cBox(B,.06,11,.06,8.75,5.5,1.1,gr);
 cCyl(B,8.03,.9,0,9.6,0,rd,0,0,36);cCyl(B,.4,3,7,1.2,4,gr,Math.PI/2,0,10);
 BZ.ftIm=bzInst(mergeBin(B),BZM.v,BZFT.map(q=>[q[0],Y,q[1],0]),true,2000);for(let i=0;i<BZFT.length;i++)BZ.ftIm.setColorAt(i,new THREE.Color(1,1,1));
 BZFT.forEach((q,i)=>{const col=[bzCylC(q[0],q[1],8,Y,Y+12.4)];BZ.objs.push({kind:'ft',x:q[0],z:q[1],y:Y+6,r:8,hp:1,alive:true,col,im:BZ.ftIm,idx:i});});
 // bacino di contenimento (argini in terra) e tubazioni
 const er=C3(0x8d7a58),bl=[[-1045,Y+.8,-1768,0,140,1.6,3],[-1045,Y+.8,-1872,0,140,1.6,3],[-1115,Y+.8,-1820,0,3,1.6,104],[-975,Y+.8,-1820,0,3,1.6,104]];
 bzInst(cGeo(new THREE.BoxGeometry(1,1,1),er),BZM.v,bl,true,1300);for(const q of bl)bzBoxC(q[0]-q[4]/2,Y,q[2]-q[6]/2,q[0]+q[4]/2,Y+1.6,q[2]+q[6]/2);
 const P=Bin();for(const z of[-1820,-1823])P.add(cGeo(new THREE.CylinderGeometry(.35,.35,120,10).rotateZ(Math.PI/2),gr),-1045,Y+1.1,z);for(let x=-1100;x<=-990;x+=10)cBox(P,.3,1,2.2,x,Y+.5,-1821.5,gr);
 const pm=new THREE.Mesh(mergeBin(P),BZM.m);pm.castShadow=pm.receiveShadow=true;scene.add(pm);BZ.pipes=lodObj(pm,1300);}
// ---------- radome, torre dell'acqua a scacchi, traliccio delle antenne con parabole ----------
const BZRD=[[-150,-2150,10],[-90,-2190,8]];
function bzDomes(){const Y=BASEY,base=Bin(),cn=C3(0x9b978d),wh=C3(0xe9e9e4);cCyl(base,.78,6,0,3,0,cn,0,0,24);cBox(base,.5,2.2,.12,0,1.1,.79,C3(0x3b3d3f));
 const sp=new THREE.IcosahedronGeometry(1,2);const sc=cGeo(sp,wh);
 BZ.rdBase=bzInst(mergeBin(base),BZM.v,BZRD.map(q=>[q[0],Y,q[1],0,q[2],1,q[2]]),true,1800);
 const dm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.05,flatShading:true});BZ.rdSph=bzInst(sc,dm,BZRD.map(q=>[q[0],Y+6+q[2]*.62,q[1],0,q[2],q[2],q[2]]),true,2600);
 BZRD.forEach((q,i)=>{const col=[bzCylC(q[0],q[1],q[2]*.78,Y,Y+6),bzCylC(q[0],q[1],q[2]*.92,Y+6,Y+6+q[2]*1.5)];BZ.objs.push({kind:'rd',x:q[0],z:q[1],y:Y+6+q[2]*.6,r:q[2],hp:.9,alive:true,col:[col[1]],im:BZ.rdSph,idx:i});lpAdd(q[0],Y+6+q[2]*1.63,q[1],[3,.12,.08],.5,1,i*.3);});}
function bzWater(){const Y=BASEY,x=-120,z=-1740,B=Bin(),st=C3(0x9aa0a4);
 for(let i=0;i<4;i++){const a=i/4*TAU+.785,cx=Math.cos(a),cz=Math.sin(a);B.add(cGeo(new THREE.CylinderGeometry(.22,.3,24.5,8),st),cx*3.3,12.2,cz*3.3,cz*.1,0,-cx*.1);}
 for(const y of[6,12,18])for(let i=0;i<4;i++){const a=i/4*TAU+.785,b=a+TAU/4,r=3.6-y*.025,x0=Math.cos(a)*r,z0=Math.sin(a)*r,x1=Math.cos(b)*r,z1=Math.sin(b)*r,L=Math.hypot(x1-x0,z1-z0);B.add(cGeo(new THREE.BoxGeometry(.1,.1,L),st),(x0+x1)/2,y,(z0+z1)/2,0,Math.atan2(x1-x0,z1-z0),0);}
 cCyl(B,.45,24,0,12,0,st,0,0,10);
 // serbatoio sferico con gli scacchi bianchi e rossi da ostacolo alla navigazione
 const sg=new THREE.SphereGeometry(6.5,24,16).toNonIndexed(),P=sg.attributes.position,col=new Float32Array(P.count*3);
 for(let i=0;i<P.count;i+=3){const cx=(P.getX(i)+P.getX(i+1)+P.getX(i+2))/3,cy=(P.getY(i)+P.getY(i+1)+P.getY(i+2))/3,cz=(P.getZ(i)+P.getZ(i+1)+P.getZ(i+2))/3,a=Math.atan2(cz,cx),e=Math.asin(clamp(cy/6.5,-1,1));const ck=(Math.floor((a+Math.PI)/(TAU/12))+Math.floor((e+1.6)/.52))%2;
  const c=ck?[.62,.06,.05]:[.93,.93,.9];for(let k=0;k<3;k++){col[(i+k)*3]=c[0];col[(i+k)*3+1]=c[1];col[(i+k)*3+2]=c[2];}}
 sg.setAttribute('color',new THREE.BufferAttribute(col,3));B.add(sg,0,27.5,0);cBox(B,.08,9,.08,6.6,26,0,st);
 const m=new THREE.Mesh(mergeBin(B),BZM.v);m.position.set(x,Y,z);m.castShadow=m.receiveShadow=true;scene.add(m);BZ.wt=m;
 const col2=[bzCylC(x,z,3.9,Y,Y+21),bzCylC(x,z,6.5,Y+21,Y+34)];BZ.objs.push({kind:'wt',x,z,y:Y+27,r:7,hp:1.1,alive:true,col:col2,mesh:m});lpAdd(x,Y+34.3,z,[3,.12,.08],.6,1,.2);}
function bzMast(){const Y=BASEY,x=225,z=-1850,H=60,B=Bin(),rd=C3(0xc8331f),wh=C3(0xeeeeea);
 const leg=k=>{const a=k/3*TAU;return [Math.cos(a),Math.sin(a)];};
 for(let y=0;y<H;y+=3){const r0=2.6-y/H*1.9,r1=2.6-(y+3)/H*1.9,c=(Math.floor(y/9)%2)?rd:wh;
  for(let k=0;k<3;k++){const [ax,az]=leg(k),[bx,bz]=leg(k+1);B.add(cGeo(new THREE.CylinderGeometry(.09,.09,3.05,5),c),ax*(r0+r1)/2,y+1.5,az*(r0+r1)/2);
   const x0=ax*r0,z0=az*r0,x1=bx*r1,z1=bz*r1,y0=y,y1=y+3,L=Math.hypot(x1-x0,y1-y0,z1-z0);const g=new THREE.CylinderGeometry(.035,.035,L,4);g.translate(0,L/2,0);
   const dir=new THREE.Vector3(x1-x0,y1-y0,z1-z0).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);g.applyQuaternion(q);g.translate(x0,y0,z0);B.add(cGeo(g,c));}}
 for(const [y,a] of[[44,.4],[36,2.6],[28,4.5]]){B.add(cGeo(new THREE.CylinderGeometry(.9,.9,.5,16).rotateZ(Math.PI/2),C3(0xd8d8d2)),Math.cos(a)*1.5,y,Math.sin(a)*1.5,0,-a,0);}
 cCyl(B,.06,6,0,H+3,0,wh,0,0,6);
 const m=new THREE.Mesh(mergeBin(B),BZM.v);m.position.set(x,Y,z);m.castShadow=true;scene.add(m);BZ.mast=m;bzCylC(x,z,2.4,Y,Y+H);
 BZ.objs.push({kind:'ms',x,z,y:Y+20,r:3,hp:1,alive:true,col:[],mesh:m});lpAdd(x,Y+H+6,z,[3,.12,.08],.8,1,0);lpAdd(x,Y+30,z,[3,.12,.08],.6,1,.5);
 // parabole satellitari
 const D=Bin(),wh2=C3(0xe4e4df),gy=C3(0x7c8084);cCyl(D,.5,3,0,1.5,0,gy,0,0,10);D.add(cGeo(new THREE.SphereGeometry(4.2,24,10,0,TAU,0,Math.PI*.3).scale(1,.45,1).rotateX(-Math.PI/2+.6),wh2),0,4.2,0);
 D.add(cGeo(new THREE.CylinderGeometry(.05,.05,3.6,5),gy),0,5.1,1.2,.95,0,0);
 bzInst(mergeBin(D),BZM.v,[[180,Y,-1850,2.2],[150,Y,-1850,.4]],true,1400);bzCylC(180,-1850,1.2,Y,Y+5);bzCylC(150,-1850,1.2,Y,Y+5);}
// ---------- batteria di missili terra-aria: 4 lanciatori e un camion radar dentro muri di sacchi di sabbia ----------
function bzSAM(){const Y=BASEY,cx=130,cz=-2150,ol=C3(0x5d5d45),dk=C3(0x24251f),tn=C3(0xb19e78),wh=C3(0xdadad2);
 const truck=B=>{cBox(B,2.5,1.1,8.8,0,1.25,0,ol);cBox(B,2.5,1.9,2.2,0,1.75,3.6,ol);cBox(B,2.3,.7,.06,0,2.2,4.71,C3(0x1d2a33));for(const z of[-3.2,-1.7,3.2])for(const s of[-1,1])cCyl(B,.55,.45,s*1.22,.55,z,dk,0,Math.PI/2,12);};
 const L=Bin();truck(L);L.add(cGeo(new THREE.BoxGeometry(2.4,2.2,6.2),ol),0,3.4,-1.6,.85,0,0);for(const sx of[-.6,.6])for(const sy of[-.55,.55])L.add(cGeo(new THREE.CylinderGeometry(.45,.45,.1,12).rotateX(Math.PI/2),wh),sx,5.76+sy*.66,-3.68+sy*.75,.85,0,0);
 const R=Bin();truck(R);cBox(R,.3,2.5,.3,0,3.,-1.5,dk);cBox(R,4.2,3.2,.35,0,5.4,-1.5,ol,-.35,0,0);
 const pos=[];for(let i=0;i<4;i++){const a=i/4*TAU+.4;pos.push([cx+Math.cos(a)*24,Y,cz+Math.sin(a)*24,-a+Math.PI/2]);}
 BZ.samIm=bzInst(mergeBin(L),BZM.v,pos,true,1200);for(let i=0;i<4;i++)BZ.samIm.setColorAt(i,new THREE.Color(1,1,1));bzInst(mergeBin(R),BZM.v,[[cx,Y,cz,.3]],true,1200);
 pos.forEach((q,i)=>{const col=[bzCylC(q[0],q[2],3.2,Y,Y+4)];BZ.objs.push({kind:'sam',x:q[0],z:q[2],y:Y+2,r:4,hp:.6,alive:true,col,im:BZ.samIm,idx:i});});bzCylC(cx,cz,3,Y,Y+5);
 // muri di sacchi di sabbia a ferro di cavallo
 const sb=new THREE.BoxGeometry(.95,.32,.5),bags=[];for(const q of pos.concat([[cx,Y,cz,.3]]))for(let r=0;r<3;r++)for(let k=0;k<26;k++){const a=-Math.PI*.8+k/25*Math.PI*1.6+(r%2)*.03,rr=7.5;const ry=q[3]+Math.PI;bags.push([q[0]+Math.sin(ry+a)*rr,Y+.17+r*.32,q[2]+Math.cos(ry+a)*rr,ry+a+Math.PI/2]);}
 bzInst(cGeo(sb,tn),BZM.v,bags,false,650);}
// ---------- mezzi militari: fuoristrada leggero e camion da trasporto (guidabili, e anche in versione parcheggiata) ----------
function bzHmvGeos(){const B=Bin(),Gl=Bin(),Li=Bin(),Tr=Bin(),dk=C3(0x1b1c1a),dk2=C3(0x2c2e29);
 B.add(rboxGeo(2.2,.72,4.7,.08,1),0,-.08,0);B.add(rboxGeo(2.1,.34,1.55,.06,1),0,.42,-1.52,-.1,0,0);B.add(rboxGeo(2.14,.92,2.3,.06,1),0,.76,.34);B.add(rboxGeo(2.14,.5,1.3,.05,1),0,.5,1.74);
 for(const s of[-1,1]){Gl.add(new THREE.BoxGeometry(.92,.5,.04),s*.5,.96,-.82,-.22,0,0);Gl.add(new THREE.BoxGeometry(.04,.42,.85),s*1.075,.98,-.2);Gl.add(new THREE.BoxGeometry(.04,.42,.8),s*1.075,.98,.75);}
 for(const s of[-1,1]){Li.add(cGeo(new THREE.BoxGeometry(.22,.16,.04),[2.6,2.5,2.2]),s*.78,.2,-2.36);Li.add(cGeo(new THREE.BoxGeometry(.14,.14,.04),[1.8,.05,.03]),s*.95,.25,2.36);}
 cBox(Tr,2.25,.26,.24,0,-.3,-2.4,dk);cBox(Tr,2.25,.26,.24,0,-.3,2.38,dk);for(let i=0;i<7;i++)cBox(Tr,.06,.3,.04,-.36+i*.12,.32,-2.33,dk2);for(const s of[-1,1]){cBox(Tr,.06,.24,.16,s*1.2,1.0,-.75,dk);cBox(Tr,.26,.8,.32,s*1.0,.0,-1.7,dk2);}
 cCyl(Tr,.03,1.8,.85,1.9,1.9,dk,0,0,5);cCyl(Tr,.42,.28,0,.6,2.42,dk,Math.PI/2,0,14);cCyl(Tr,.3,.12,0,1.27,.3,dk2,0,0,12);
 return {body:mergeBin(B),glass:mergeBin(Gl),lights:mergeBin(Li),trim:mergeBin(Tr)};}
function bzTruckGeos(){const B=Bin(),Gl=Bin(),Li=Bin(),Tr=Bin(),dk=C3(0x1b1c1a),cv=C3(0x4e5038);
 B.add(rboxGeo(2.4,.9,1.8,.08,1),0,.12,-3.0);B.add(rboxGeo(2.4,1.25,1.7,.08,1),0,.95,-1.6);B.add(rboxGeo(2.45,.55,5.0,.05,1),0,.1,1.25);
 for(const s of[-1,1])B.add(new THREE.BoxGeometry(.06,.75,5),s*1.2,.75,1.25);Tr.add(cGeo(new THREE.CylinderGeometry(1.25,1.25,4.9,14,1,true,Math.PI/2,Math.PI).rotateX(Math.PI/2),cv),0,1.15,1.25,0,0,0,1,.85,1);
 for(let i=0;i<5;i++)cBox(Tr,2.5,.05,.06,0,1.15+Math.sin(Math.acos(0))*1.04,-1.1+i*1.18,dk);
 Gl.add(new THREE.BoxGeometry(2.1,.62,.05),0,1.25,-2.46);for(const s of[-1,1])Gl.add(new THREE.BoxGeometry(.04,.55,.9),s*1.21,1.25,-1.6);
 for(const s of[-1,1]){Li.add(cGeo(new THREE.BoxGeometry(.24,.2,.05),[2.6,2.5,2.2]),s*.85,.3,-3.92);Li.add(cGeo(new THREE.BoxGeometry(.16,.16,.05),[1.8,.05,.03]),s*1.05,.2,3.78);}
 cBox(Tr,2.5,.3,.3,0,-.3,-3.95,dk);cBox(Tr,1.6,.5,.04,0,.3,-3.91,C3(0x2c2e29));cBox(Tr,2.5,.25,.25,0,-.25,3.8,dk);for(const s of[-1,1])cBox(Tr,.1,.3,.2,s*1.32,1.5,-2.35,dk);
 return {body:mergeBin(B),glass:mergeBin(Gl),lights:mergeBin(Li),trim:mergeBin(Tr)};}
// versione unica (per i mezzi fermi sotto le tettoie): tutte le parti in una geometria colorata
function bzStatic(G,col,wheels,ws){const B=Bin();B.add(cGeo(G.body.clone(),col));B.add(cGeo(G.glass.clone(),[.06,.08,.1]));B.add(G.lights.clone());B.add(G.trim.clone());
 for(const w of wheels)B.add(cGeo(new THREE.CylinderGeometry(.34*ws,.34*ws,.3*ws,14).rotateZ(Math.PI/2),C3(0x1a1a1a)),w[0],-.56,w[1]);return mergeBin(B);}
const BZW={hmv:[{x:-.98,z:-1.55,f:1},{x:.98,z:-1.55,f:1},{x:-.98,z:1.55,f:0},{x:.98,z:1.55,f:0}],trk:[{x:-1.06,z:-2.85,f:1},{x:1.06,z:-2.85,f:1},{x:-1.06,z:.75,f:0},{x:1.06,z:.75,f:0}]};
function bzMotorPool(){const Y=BASEY,ol=C3(0x6c6a52),gy=C3(0x8a8d8f);
 // tettoie su pilastri d'acciaio
 const T=Bin();for(let i=0;i<5;i++)for(const z of[-1,1])cCyl(T,.14,4.4,-16+i*8,2.2,z*4.6,gy,0,0,8);cBox(T,34,.25,10.6,0,4.5,0,C3(0x76797b));for(let i=0;i<18;i++)cBox(T,.06,.06,10.6,-16.5+i*1.95,4.66,0,gy);
 const tl=[[-170,Y,-1505,0],[-100,Y,-1505,0]];bzInst(mergeBin(T),BZM.m,tl,true,1100);for(const q of tl){for(let i=0;i<5;i++)for(const z of[-1,1])bzCylC(q[0]-16+i*8,q[2]+z*4.6,.16,Y,Y+4.4);bzBoxC(q[0]-17,Y+4.35,q[2]-5.3,q[0]+17,Y+4.65,q[2]+5.3);}
 const H=bzHmvGeos(),K=bzTruckGeos();BZ.hmvG=H;BZ.trkG=K;
 const hs=bzStatic(H,C3(0xb3a07a),BZW.hmv.map(w=>[w.x,w.z]),1.15),ks=bzStatic(K,C3(0x5d5e44),[[-1.06,-2.85],[1.06,-2.85],[-1.06,.75],[1.06,.75],[-1.06,2.15],[1.06,2.15]],1.15);
 const hl=[],kl=[];for(let i=0;i<4;i++){hl.push([-182+i*8,Y+.92,-1505,0]);kl.push([-112+i*8,Y+1.0,-1505,0]);}for(let i=0;i<4;i++)hl.push([-200+i*7,Y+.92,-1545,Math.PI/2]);
 BZ.hmvIm=bzInst(hs,BZM.v,hl,true,900);BZ.trkIm=bzInst(ks,BZM.v,kl,true,900);for(const im of[BZ.hmvIm,BZ.trkIm])for(let i=0;i<im.count;i++)im.setColorAt(i,new THREE.Color(1,1,1));
 hl.forEach((q,i)=>{BZ.objs.push({kind:'veh',x:q[0],z:q[2],y:Y+1,r:2.6,hp:.35,alive:true,col:[bzBoxC(q[0]-(q[3]?2.4:1.1),Y,q[2]-(q[3]?1.1:2.4),q[0]+(q[3]?2.4:1.1),Y+2.1,q[2]+(q[3]?1.1:2.4))],im:BZ.hmvIm,idx:i});});
 kl.forEach((q,i)=>{BZ.objs.push({kind:'veh',x:q[0],z:q[2],y:Y+1.3,r:4,hp:.45,alive:true,col:[bzBoxC(q[0]-1.25,Y,q[2]-4,q[0]+1.25,Y+2.6,q[2]+3.9)],im:BZ.trkIm,idx:i});});}
// mezzi guidabili: due fuoristrada e un camion davanti all'autoparco (fisica vera, si guidano come le auto)
function bzDrivables(){const Y=BASEY;const mkH=(x,z,yaw)=>{const b=makeCarX(x,Y+1.0,z,yaw,lc(0xb3a07a),BZ.hmvG,{wheels:BZW.hmv,hx:1.1,hy:.55,hz:2.4,mass:2700,ws:1.15});b.car.pow=2.0;b.car.vtop=38;b.car.drvPos=[-.48,.85,-.1];BZ.veh.push(b);return b;};
 mkH(-150,-1560,Math.PI/2);mkH(-140,-1560,Math.PI/2);
 const t=makeCarX(-120,Y+1.1,-1562,Math.PI/2,lc(0x5d5e44),BZ.trkG,{wheels:BZW.trk,hx:1.25,hy:.7,hz:3.95,mass:7000,ws:1.15,extra:[[-1.06,2.15],[1.06,2.15]]});t.car.pow=4.2;t.car.vtop=30;t.car.drvPos=[-.55,1.35,-1.75];BZ.veh.push(t);}
// ---------- elicotteri verde oliva sulle piazzole ----------
function bzHelis(){for(const [x,z,yaw] of[[60,-1790,.3],[110,-1790,-.2]]){const h=makeHeli(x,z,yaw);h.baseHeli=true;h.obj.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){const c=o.material.color;if(c.b>c.r*1.3&&c.b>.02){o.material=o.material.clone();o.material.color.setRGB(.105,.115,.07);}}});BZ.helis.push(h);}}
// ---------- luci di pista e di rullaggio, maniche a vento, PAPI ----------
function bzLights(){const Y=BASEY+.25;
 for(const [x0,x1,zc,hw] of[[-1200,-250,-1640,25],[-1180,200,-1990,30]]){
  for(let x=x0;x<=x1+.1;x+=60)for(const s of[-1,1])lpAdd(x,Y,zc+s*(hw+1),[2.6,2.5,2.3],.45,0,0);
  for(let z=-hw+2;z<=hw-2;z+=4){lpAdd(x0-1,Y,zc+z,[.2,2.6,.6],.5,0,0);lpAdd(x1+1,Y,zc+z,[2.8,.15,.1],.5,0,0);lpAdd(x1+3,Y,zc+z,[.2,2.6,.6],.5,0,0);lpAdd(x0-3,Y,zc+z,[2.8,.15,.1],.5,0,0);}
  for(let i=0;i<4;i++){lpAdd(x0+300,Y+.3,zc-hw-12-i*9,[3,3,3],.7,4,(2.25+i*.33)*Math.PI/180);lpAdd(x1-300,Y+.3,zc+hw+12+i*9,[3,3,3],.7,4,(2.25+i*.33)*Math.PI/180);}}
 const tw=[[-1205,-1585,-285,-1585],[-1205,-1925,170,-1925],[-1050,-2075,-250,-2075]];for(const [ax,az,bx,bz] of tw){const L=Math.hypot(bx-ax,bz-az);for(let t=0;t<=L;t+=40)for(const s of[-1,1])lpAdd(ax+(bx-ax)*t/L,Y,az+s*12.2,[.3,.6,3],.4,0,0);}
 for(let z=-1925;z<=-1585;z+=40)for(const s of[-1,1])lpAdd(-1205+s*12.2,Y,z,[.3,.6,3],.4,0,0);
 for(const [x,z] of[[-1215,-1610],[215,-2025]]){apSock(x,z);const sk=AP.socks[AP.socks.length-1];sk.g.position.y=BASEY+.04;lodObj(sk.g,700);}}
// ---------- radar girevole e faro rotante sulla torre di controllo ----------
function bzTowerTop(){const g=new THREE.Group();g.position.set(-420,BASEY+44,-1790);scene.add(g);const m=MS(0x8a8f93,.45,.6);AB(g,new THREE.CylinderGeometry(.25,.35,3,10),m,0,1.5,0);
 const a=new THREE.Group();a.position.y=3.1;g.add(a);AB(a,new THREE.BoxGeometry(5.4,.9,.35),MS(0xd8d8d2,.5,.3),0,0,0);AB(a,new THREE.BoxGeometry(.4,.4,.8),m,0,-.2,.4);BZ.rad2=a;lodObj(g,1800);
 lpAdd(-420,BASEY+47.6,-1790,[.2,3,.6],1.1,2,0);lpAdd(-420,BASEY+47.9,-1790,[3,3,3],1.1,2,.5);lpAdd(-420,BASEY+45,-1784.4,[3,.12,.08],.6,1,.2);}
// ---------- costruzione ----------
function bzBuild(){bzMats();const Y=BASEY;
 // pavimentazione procedurale: un solo piano grande quanto il recinto
 const g=new THREE.PlaneGeometry(1520,860,8,5).rotateX(-Math.PI/2),m=new THREE.Mesh(g,ovMat('base51',BSG));m.position.set(-500,Y+.03,-1810);m.receiveShadow=true;scene.add(m);BZ.ground=m;
 // macerie generiche per ciò che viene distrutto
 {const B=Bin(),c1=C3(0x5a5650),c2=C3(0x3a3835),c3=C3(0x77736a);for(let i=0;i<14;i++){const a=i*2.4,r=.15+.3*((i*37)%10)/10;cBox(B,.25+.2*((i*13)%7)/7,.12+.25*((i*7)%5)/5,.2+.2*((i*11)%6)/6,Math.cos(a)*r,.12,Math.sin(a)*r,[c1,c2,c3][i%3],(i%4)*.3,a,(i%3)*.2);}
  cBox(B,.9,.12,.9,0,.05,0,c2);BZ.ruin=new THREE.InstancedMesh(mergeBin(B),BZM.v,60);BZ.ruin.count=0;BZ.ruin.castShadow=BZ.ruin.receiveShadow=true;scene.add(BZ.ruin);}
 bzAccessRoad();bzFence();bzGate();bzShelters();bzIgloos();bzFuel();bzDomes();bzWater();bzMast();bzSAM();bzMotorPool();bzLights();bzTowerTop();
 // un caccia dentro ogni rifugio aperto (pronto a uscire), più due sul piazzale sud
 let nf=0;for(const S of BZHAS)if(S.open&&nf++<2)spawnPlane('fighter',S.x,S.z-2,Math.PI);
 spawnPlane('stealth',-560,-2105,Math.PI);}
// strada d'accesso dalla diga al cancello (il deserto sotto è spianato)
const BSR=`void zg(vec2 p){gEmis=vec3(0.);gMet=0.;float n2=vn2(p*2.7),n3=vn2(p*11.);float ax=abs(p.x);vec3 c=asph(p);float rough=.86;
 float mk=(1.-step(.09,abs(ax-4.6)))+(1.-step(.07,abs(ax-.16)));mk*=.75+.25*step(.3,n3);c=mix(c,ax<1.?vec3(.75,.58,.15):vec3(.78,.77,.73),clamp(mk,0.,1.)*.85);
 float sd=smoothstep(3.6,5.6,ax+(vn2(p*vec2(.4,.08))-.5)*2.)*.85+smoothstep(.72,.9,vn2(p*vec2(.25,.05)+3.))*.5;c=mix(c,vec3(.6,.47,.3)*(.85+.25*n2),clamp(sd,0.,1.));rough=mix(rough,.95,sd);
 if(ax>5.4)discard;gAlb=c;gRough=rough;}`;
function bzAccessRoad(){const pos=[],idx=[];let n=0;for(let z=-903;z>=-1381;z-=4){for(const x of[-5.5,0,5.5]){pos.push(x,desertH(x,z)+.05,z);}if(n){const a=(n-1)*3;idx.push(a,a+1,a+3,a+1,a+4,a+3,a+1,a+2,a+4,a+2,a+5,a+4);}n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,ovMat('base51road',BSR));m.receiveShadow=true;scene.add(m);}
// ---------- distruzione: rifugi, polveriere, serbatoi, radome, torri, mezzi ----------
function bzKill(o,P){if(!o.alive)return;o.alive=false;for(const c of o.col)c.on=false;const Y=BASEY,l=TODC.lit;
 if(o.im&&o.kind!=='ft'&&o.kind!=='sam'&&o.kind!=='veh')bzHide(o.im,o.idx);
 if(o.mesh)o.mesh.visible=false;
 const deb=(n,sx,sy,sz,st,sp)=>{for(let i=0;i<n;i++){const a=rand(0,TAU),r=rand(0,o.r*.8);spawnDebris(o.x+Math.cos(a)*r,o.y+rand(-1,2),o.z+Math.sin(a)*r,rand(.5,1.4)*sx,rand(.4,1)*sy,rand(.5,1.4)*sz,st,Math.random(),0,Math.cos(a)*sp*rand(.4,1),rand(4,12),Math.sin(a)*sp*rand(.4,1),.6);}};
 if(o.kind==='has'){explode(o.x,Y+4,o.z,16,2.4);deb(18,2.2,.6,2.2,3,10);bzRuin(o.x,Y,o.z,26,8,30);for(let k=0;k<4;k++)addFire(o.x+rand(-9,9),Y+.5,o.z+rand(-12,12),rand(3,5),rand(80,150));}
 else if(o.kind==='ig'){explode(o.x,Y+3,o.z,34,3.4);deb(16,1.6,.8,1.6,3,18);bzRuin(o.x,Y,o.z,14,5,24);
  for(let k=0;k<5;k++)setTimeout(()=>{explode(o.x+rand(-6,6),Y+rand(2,8),o.z+rand(-10,6),rand(9,16),2);},300+k*380+Math.random()*300);
  for(const q of BZ.objs)if(q.alive&&q!==o&&Math.hypot(q.x-o.x,q.z-o.z)<70){const d=Math.hypot(q.x-o.x,q.z-o.z);q.hp-=(q.kind==='ig'?1.6:1.2)*(1-d/70);if(q.hp<=0)setTimeout(()=>bzKill(q,2),500+d*25);}}
 else if(o.kind==='ft'){explode(o.x,Y+8,o.z,26,2.6);for(let k=0;k<6;k++)addFire(o.x+rand(-6,6),Y+3,o.z+rand(-6,6),rand(4,7),rand(100,170));
  _dm.position.set(o.x,Y,o.z);_dm.rotation.set(rand(-.06,.06),rand(0,TAU),rand(-.06,.06));_dm.scale.set(1,.5,1);_dm.updateMatrix();o.im.setMatrixAt(o.idx,_dm.matrix);o.im.setColorAt(o.idx,new THREE.Color(.09,.085,.08));o.im.instanceMatrix.needsUpdate=true;o.im.instanceColor.needsUpdate=true;
  for(const q of BZ.objs)if(q.alive&&q.kind==='ft'&&Math.hypot(q.x-o.x,q.z-o.z)<60){q.hp-=.7;if(q.hp<=0)setTimeout(()=>bzKill(q,2),400+Math.random()*700);}
  // il fuoco si propaga lentamente ai serbatoi vicini
  setTimeout(()=>{for(const q of BZ.objs)if(q.alive&&q.kind==='ft'&&Math.hypot(q.x-o.x,q.z-o.z)<45){q.hp-=.55;if(q.hp<=0)bzKill(q,1);}},9000+Math.random()*7000);}
 else if(o.kind==='rd'){deb(14,1.2,.2,1.2,2,8);explode(o.x,o.y,o.z,6,.8);}
 else if(o.kind==='wt'){deb(16,1,.8,1,7,6);explode(o.x,Y+26,o.z,7,.8);if(psA)for(let i=0;i<120;i++){const a=rand(0,TAU),s=rand(2,9);psA.spawn(o.x+Math.cos(a)*3,Y+24,o.z+Math.sin(a)*3,Math.cos(a)*s,rand(-2,6),Math.sin(a)*s,rand(1,2.5),.6,2.5,.55*l,.62*l,.68*l,.5,.2,9.8,1);}bzRuin(o.x,Y,o.z,9,4,9);}
 else if(o.kind==='ms'){deb(14,.6,3,.6,7,5);bzRuin(o.x,Y,o.z,6,3,6);}
 else if(o.kind==='gt'){deb(8,.8,.8,.8,7,6);bzRuin(o.x,Y,o.z,4.5,3,4.5);addFire(o.x,Y+.5,o.z,2,60);}
 else if(o.kind==='sam'||o.kind==='veh'){explode(o.x,o.y+.5,o.z,o.kind==='sam'?9:5,1.2);o.im.setColorAt(o.idx,new THREE.Color(.07,.065,.06));o.im.instanceColor.needsUpdate=true;addFire(o.x,o.y,o.z,o.kind==='sam'?3:2,rand(60,110));
  if(o.kind==='sam'&&psF)for(let k=0;k<4;k++)setTimeout(()=>{const a=rand(0,TAU);for(let i=0;i<30;i++)psF.spawn(o.x,o.y+3,o.z,Math.cos(a)*rand(20,40),rand(15,40),Math.sin(a)*rand(20,40),rand(.6,1.2),.3,.15,5,3,1.4,1,.2,9.8,5);},400+k*500);}
 stats.collapses=(stats.collapses||0)+1;}
function bzHit(x,y,z,R,P){if(x<-1320||x>320||z<-2300||z>-1320)return;for(const o of BZ.objs){if(!o.alive)continue;const d=Math.hypot(x-o.x,z-o.z)-o.r,dy=Math.abs(y-o.y)-o.r*1.2;if(d>R+2||dy>R+4)continue;
  o.hp-=P*.55*(1-clamp(Math.max(0,d)/(R+2),0,1));if(o.hp<=0)setTimeout(()=>bzKill(o,P),o.kind==='ig'||o.kind==='ft'?150+Math.random()*300:30);}}
{const ds2=destroySphere;destroySphere=function(x,y,z,R,P){ds2(x,y,z,R,P);bzHit(x,y,z,R,P);};}
// ---------- pattuglia: fuoristrada che gira lungo la strada perimetrale ----------
const BZPATH=[[-1240,-1395],[245,-1395],[245,-2225],[-1240,-2225]];
function bzPatrolInit(){const G=bzStatic(BZ.hmvG,C3(0xb3a07a),BZW.hmv.map(w=>[w.x,w.z]),1.15),mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.15}),m=new THREE.Mesh(G,mat);m.castShadow=m.receiveShadow=true;scene.add(m);
 const hl=new THREE.MeshBasicMaterial({color:new THREE.Color(2.5,2.3,1.9)});for(const s of[-1,1]){const h=new THREE.Mesh(new THREE.BoxGeometry(.24,.18,.03),hl);h.position.set(s*.78,.2,-2.39);m.add(h);}
 let L=0;const seg=[];for(let i=0;i<4;i++){const a=BZPATH[i],b=BZPATH[(i+1)%4],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push({a,b,l,s0:L});L+=l;}
 BZ.pat={m,mat,hl,seg,L,s:0,sp:9,o:{kind:'pat',x:0,z:0,y:BASEY+1,r:2.6,hp:.35,alive:true,col:[]}};BZ.objs.push(BZ.pat.o);}
function bzPatAt(s){const P=BZ.pat;s=((s%P.L)+P.L)%P.L;for(const g of P.seg)if(s<=g.s0+g.l){const t=(s-g.s0)/g.l,dx=(g.b[0]-g.a[0])/g.l,dz=(g.b[1]-g.a[1])/g.l;return [g.a[0]+(g.b[0]-g.a[0])*t-dz*1.6,g.a[1]+(g.b[1]-g.a[1])*t+dx*1.6];}return BZPATH[0];}
function bzPatStep(dt){const P=BZ.pat;if(!P)return;const o=P.o;if(!o.alive){if(!P.burnt){P.burnt=true;P.mat.color.setRGB(.12,.11,.1);P.hl.color.setRGB(0,0,0);}return;}
 const pl=player,near=Math.hypot(pl.x-o.x,pl.z-o.z)<9&&Math.abs(pl.y-o.y)<3;P.s+=P.sp*dt*(near?0:1);const a=bzPatAt(P.s),b=bzPatAt(P.s+3);const yaw=Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]));
 P.m.position.set(a[0],BASEY+.92,a[1]);P.m.rotation.set(0,yaw,0);o.x=a[0];o.z=a[1];const k=.2+2.3*smoothstepJ(.15,.6,U.uNight.value);P.hl.color.setRGB(k,k*.92,k*.76);}
function smoothstepJ(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
// ---------- soldati: sentinelle e pattuglie a piedi (compaiono quando sei vicino alla base) ----------
function bzSoldierLook(){const R=Math.random,P=[],cnt=[0,0,0,0,0,0,0,0],add=(t,b,o,s,c)=>{const k=NPCG.T.indexOf(t);if(cnt[k]<NPCG.K[k])P.push({t:k,j:cnt[k]++,b,o,s,c});};
 const skin=NSK[Math.floor(R()*NSK.length)],cam=[.55,.48,.35],cam2=[.47,.41,.3],vest=[.4,.37,.27],boot=[.32,.25,.17],helm=[.45,.41,.3],dk=[.12,.12,.11],eye=[.1,.07,.05],tw=.41;
 add('torso',0,[0,.03,0],[tw*.96,.26,.25],cam);add('box',0,[0,.13,0],[tw*.98,.05,.27],dk);
 for(const k of[0,1]){const th=k?9:7,sh=k?10:8;add('limb',th,[0,-.22,0],[.18,.46,.19],cam);add('limb',sh,[0,-.21,0],[.16,.44,.17],cam2);add('limb',sh,[0,-.36,0],[.17,.18,.18],boot);add('shoe',sh,[0,-.465,-.04],[.14,.12,.29],boot);add('shoe',sh,[0,-.515,-.04],[.145,.035,.3],dk);add('box',th,[k?.1:-.1,-.18,-.01],[.05,.14,.12],cam2);}
 add('torso',1,[0,.31,0],[tw*1.06,.62,.28],cam);add('torso',1,[0,.33,.005],[tw*1.12,.48,.32],vest);add('box',1,[0,.26,-.165],[.3,.16,.02],cam2);for(const sx of[-1,1])add('box',1,[sx*.11,.42,-.166],[.09,.1,.02],cam2);add('limb',2,[0,-.01,0],[.1,.15,.1],skin);
 for(const k of[0,1]){const ua=k?5:3,fa=k?6:4;add('limb',ua,[0,-.16,0],[.14,.34,.15],cam);add('limb',fa,[0,-.15,0],[.125,.3,.135],cam);add('hand',fa,[0,-.35,-.005],[.095,.16,.065],k?dk:skin);}
 add('box',1,[.06,.3,.2],[.06,.68,.07],dk);add('box',1,[.06,.56,.2],[.05,.12,.12],dk);
 add('head',2,[0,.17,0],[.235,.3,.26],skin);for(const sx of[-1,1]){add('sph',2,[sx*.052,.205,-.112],[.05,.034,.02],[.96,.96,.95]);add('sph',2,[sx*.052,.205,-.12],[.026,.026,.012],eye);add('sph',2,[sx*.118,.18,.005],[.028,.065,.048],skin.map(v=>v*.96));}
 add('box',2,[0,.108,-.118],[.066,.018,.014],skin.map(v=>v*.78));add('hair',2,[0,.25,.01],[.3,.26,.32],helm);add('box',2,[0,.245,-.15],[.24,.02,.06],helm);
 for(const p of P)if(p.b===2&&p.o[1]>.03){p.o=[p.o[0]*.72,.1425+(p.o[1]-.17)*.82,p.o[2]*.79];p.s=[p.s[0]*.72,p.s[1]*.82,p.s[2]*.79];}
 return {parts:P,sc:rand(.95,1.07),f:false,old:false,phone:false};}
const BZS={guards:[[-3.2,-1391,0],[3.2,-1391,0],[52,-1445,0],[64,-1445,0],[-1045,-1764,0],[-412,-1781,0],[130,-2178,Math.PI],[-640,-2096,Math.PI]],
 routes:[{pts:[[20,-1441],[96,-1441],[96,-1552],[20,-1552]],loop:true},{pts:[[-1100,-1566],[-340,-1566]],loop:false},{pts:[[-1020,-2092],[-280,-2092]],loop:false},{pts:[[-1230,-1700],[-1230,-2110],[-1110,-2110]],loop:false}]};
function bzSoldiers(on){if(on===BZ.soldOn)return;BZ.soldOn=on;
 if(!on){for(const n of BZ.sold)if(!n.dead)npcKill(n);BZ.sold.length=0;return;}
 const L0=npcLook;npcLook=bzSoldierLook;try{
  for(const [x,z,yaw] of BZS.guards){const n=spawnNPC(x,groundH(x,z),z,{keep:true,yaw});if(n){n.bzG=yaw;BZ.sold.push(n);}}
  BZS.routes.forEach((r,ri)=>{for(let k=0;k<2;k++){const p=r.pts[0],n=spawnNPC(p[0]+k*1.4,groundH(p[0],p[1]),p[1]+k*.8,{keep:true});if(n){n.bzP={pts:r.pts,i:1,dir:1,loop:r.loop,off:k*1.4};n.spd=1.35;BZ.sold.push(n);}}});
 }finally{npcLook=L0;}}
{const w0=npcWalk;npcWalk=function(n,dt){if(n.flee>0||(!n.bzP&&n.bzG===undefined))return w0(n,dt);
 if(n.bzG!==undefined&&!n.bzP){n.spdNow=0;n.yaw+=(n.bzG-n.yaw)*Math.min(1,dt*2);n.ph+=0;if(!n.roof)n.y=groundH(n.x,n.z);return;}
 const P=n.bzP,t=P.pts[P.i],tx=t[0]+P.off,tz=t[1],dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz),sp=n.spd;
 if(d<.7){if(P.loop)P.i=(P.i+1)%P.pts.length;else{if(P.i+P.dir<0||P.i+P.dir>=P.pts.length)P.dir*=-1;P.i+=P.dir;}}
 else{n.x+=dx/d*sp*dt;n.z+=dz/d*sp*dt;const ty=Math.atan2(-dx,-dz);let dy=ty-n.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));n.yaw+=dy*Math.min(1,dt*5);}
 n.spdNow=sp;n.ph+=sp*dt*TAU/1.5;if(!n.roof)n.y=groundH(n.x,n.z);};}
// ---------- ogni fotogramma: sbarre, radar, pattuglia, soldati ----------
function bzFrame(dt){const P=player,cx=P.x,cz=P.z;
 if(BZ.rad2)BZ.rad2.rotation.y+=dt*1.25;
 if(BZ.gate){let near=Math.hypot(cx,cz+1386)<38;if(BZ.pat&&Math.hypot(BZ.pat.o.x,BZ.pat.o.z+1386)<22)near=true;for(const a of BZ.gate.arms){if(a.broken)continue;const tg=near?1.42:0;a.ang+=clamp(tg-a.ang,-dt*.9,dt*.9);a.p.rotation.z=a.s*a.ang;
   const v=P.veh;if(v&&!v.dead&&a.ang<.4&&Math.abs(v.pz+1386.2)<1.6&&Math.abs(v.px-a.s*6)<4.5&&Math.hypot(v.vx,v.vz)>3){a.broken=true;a.p.rotation.set(rand(-.3,.3),0,a.s*-.25);a.p.position.y-=.6;sndImpact(v.px,v.py,v.pz,'metal',8);}}
  const k=smoothstepJ(.1,.5,U.uNight.value),bl=(U.uTime.value%1)<.5?1:.15;for(const a of BZ.gate.arms)a.lt.material.color.setRGB(3*bl*(.3+k),.2*bl,.1*bl);}
 bzPatStep(dt);
 BZ.lt=(BZ.lt||0)-dt;if(BZ.lt<=0){BZ.lt=.3;const cp=camera.position;
  for(const v of CVS){if(v.dead||!v.obj||(v.type!=='plane'&&v.type!=='tank'&&v.type!=='ufo'))continue;const vis=v.drv||!inBase(v.px,v.pz)||Math.hypot(v.px-cp.x,v.py-cp.y,v.pz-cp.z)<1300;if(v.obj.visible!==vis)v.obj.visible=vis;}
  for(const h of BZ.helis)if(!h.dead)h.obj.visible=h.heli.drv||Math.hypot(h.px-cp.x,h.py-cp.y,h.pz-cp.z)<1300;
  for(const b of BZ.veh)if(!b.dead)b.obj.visible=(b.car&&b.car.drv)||Math.hypot(b.px-cp.x,b.py-cp.y,b.pz-cp.z)<900;}
 BZ.st=(BZ.st||0)-dt;if(BZ.st<=0){BZ.st=2;const d=Math.hypot(cx+500,cz+1810);bzSoldiers(BZ.soldOn?d<1150:d<950);}}
// ---------- ricostruzione: tutto torna intatto ----------
function bzReset(){for(const o of BZ.objs){o.alive=true;o.hp=o.hp0;for(const c of o.col)c.on=true;if(o.mesh)o.mesh.visible=true;if(o.im&&o.m0){o.im.setMatrixAt(o.idx,o.m0);o.im.instanceMatrix.needsUpdate=true;}if(o.im&&o.im.instanceColor){o.im.setColorAt(o.idx,new THREE.Color(1,1,1));o.im.instanceColor.needsUpdate=true;}}
 if(BZ.ruin){BZ.ruin.count=0;BZ.ruinN=0;}
 if(BZ.pat){BZ.pat.burnt=false;BZ.pat.mat.color.setRGB(1,1,1);}
 if(BZ.gate)for(const a of BZ.gate.arms){a.broken=false;a.ang=0;a.p.rotation.set(0,0,0);a.p.position.y=BASEY+1.05;}
 BZ.soldOn=false;BZ.sold.length=0;
 BZ.veh.length=0;bzDrivables();BZ.helis.length=0;bzHelis();}
function bzSnapshot(){const m=new THREE.Matrix4();for(const o of BZ.objs){o.hp0=o.hp;if(o.im){o.im.getMatrixAt(o.idx,m);o.m0=m.clone();}}}
// ---------- collegamento al gioco ----------
{const g1=genCity;genCity=function(){g1();bzGen();};}
{const b1=buildBase;buildBase=function(){b1();bzBuild();bzDrivables();bzHelis();bzPatrolInit();bzSnapshot();};}
{const f1=frameUpdate;frameUpdate=function(dt){f1(dt);bzFrame(dt);};}
{const r1=resetCity;resetCity=function(){r1();bzReset();};}
