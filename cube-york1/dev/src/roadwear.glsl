// ======================= USURA DELLE STRADE (patch Z) =======================
// rwE: hash intero esatto (identico in GLSL e in JavaScript) per tutto ciò che conta anche per la fisica (stato del tratto, buche)
float imod(float x,float y){return x-y*floor((x+.5)/y);}
float rwE(vec2 c){float a=imod(c.x,251.);a=imod(a*(a*7.+13.)+5.,251.);a=imod(a+imod(c.y,251.),251.);a=imod(a*(a*7.+13.)+5.,251.);
 float b=imod(c.y,241.);b=imod(b*(b*11.+3.)+17.,241.);b=imod(b+imod(c.x,241.),241.);b=imod(b*(b*11.+3.)+17.,241.);return (a*241.+b)/60491.;}
// rwH, rwN: hash e rumore veloci, solo per i dettagli visivi
float rwH(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 rwH2(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.103,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
float rwN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rwH(i),rwH(i+vec2(1.,0.)),f.x),mix(rwH(i+vec2(0.,1.)),rwH(i+vec2(1.,1.)),f.x),f.y);}
float rwVor(vec2 x){vec2 n=floor(x),f=fract(x);float d1=8.,d2=8.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 r=g+rwH2(n+g)-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return sqrt(d2)-sqrt(d1);}
// linea sottile antialiasata: d distanza dal centro, w semilarghezza, fw dimensione del pixel (m)
float rwLine(float d,float w,float fw){return (1.-smoothstep(w-fw*.5,w+fw*.5,d))*min(1.,2.*w/fw);}
// stato del tratto: x età (0 nuovo, 1 vecchio), y danni, z sporcizia, w tratto appena rifatto
vec4 rwCond(vec2 sid,float base,float bias,float al){
 float ag=clamp(rwE(sid+vec2(base*97.,base*31.))+bias,0.,1.);
 float dm=smoothstep(.72,.97,ag)*(.55+.45*rwE(sid*3.+vec2(11.,base+5.)));
 float rk=floor(al/32.);float rh=rwE(vec2(rk,sid.x*31.+sid.y*77.+base*13.));
 float r0=rk*32.+rh*9.,r1=min(r0+9.+rwE(vec2(rk*7.+3.,sid.y*5.+base))*18.,rk*32.+32.);
 float rep=step(.84-.3*ag,rh)*step(r0,al)*step(al,r1)*step(.3,ag);
 float dr=rwE(sid*vec2(5.,7.)+vec2(base*3.+1.,2.));
 return vec4(mix(ag,.04,rep),dm*(1.-rep),smoothstep(.1,1.,dr)*(.5+.5*ag),rep);}
// buca: x fondo (0..1), y bordo sgretolato, zw gradiente dell'altezza (lungo, traverso)
vec4 rwPot(vec2 lp,vec2 sid,float base,float ag,float dm,float hw){
 vec2 cs=vec2(3.1,2.3);vec2 ci=floor(lp/cs);
 float hx=rwE(ci+sid*vec2(31.,37.)+vec2(base*7.,3.));
 float prb=dm*.22+smoothstep(.6,1.,ag)*.035;
 if(hx>=prb)return vec4(0.);
 float u1=rwE(ci*vec2(3.,5.)+vec2(17.,base+1.)),u2=rwE(ci*vec2(7.,2.)+vec2(base+2.,23.)),u3=rwE(ci+vec2(41.,59.)+sid),u4=rwE(ci*vec2(5.,3.)+vec2(base*5.,71.)+sid);
 vec2 c=(ci+.2+.6*vec2(u1,u2))*cs;
 if(abs(c.y)>hw-.35)return vec4(0.);
 float r=.16+.5*u3*u3+.22*dm*u4;
 vec2 dv=lp-c;float d=length(dv*vec2(1.,1.15));
 float dd=d+(rwN(dv*(3.5/r)+vec2(u1,u2)*40.)-.5)*.42*r;
 if(dd>r*1.5)return vec4(0.);
 float t=clamp((r-dd)/(r*.3),0.,1.);float hole=t*t*(3.-2.*t);
 float dep=(.04+.07*u3)*min(1.,r/.45);
 float rim=(1.-smoothstep(0.,.4*r,abs(dd-r)))*(1.-hole);
 return vec4(hole,rim,dv/max(d,1e-3)*dep*6.*t*(1.-t)/(r*.3));}
vec2 rwGr;
// p mondo, al lungo la strada (m), ac di traverso con segno (m), hw semilarghezza fino al cordolo, LW larghezza corsia, lo sfasamento corsie,
// ae distanza dall'incrocio (1e3 se non c'è), sid id del tratto, dist distanza dalla camera, base seme, cd stato, wetG pioggia, hq qualità (0 bassa)
// mk: x segnaletica bianca, y gialla. wet: acqua (pozzanghere, buche piene)
void roadWear(vec2 p,float al,float ac,float hw,float LW,float lo,float ae,vec2 sid,float dist,float base,vec4 cd,float wetG,float hq,inout vec3 a,inout vec2 mk,inout float rough,inout float wet){
 rwGr=vec2(0.);
 float ag=cd.x,dm=cd.y,dirt=cd.z,rep=cd.w;
 float fw=fwidth(al)+fwidth(ac)+1e-4;
 float near=1.-smoothstep(70.,150.,dist),close=1.-smoothstep(12.,45.,dist);
 // colore: nuovo quasi nero e uniforme, vecchio grigio chiaro con gli inerti che affiorano
 float sp=smoothstep(.62,.82,rwN(p*26.))*close;
 vec3 fresh=a*vec3(.6,.61,.64);
 vec3 old=mix(a*1.45,vec3(.088,.085,.08),.6)*(.88+.24*rwN(p*.45+base))+vec3(.03,.029,.027)*sp;
 a=mix(fresh,old,ag);rough=mix(.72,.9,ag);
 // corsie: carreggiate delle ruote levigate, striscia d'olio al centro della corsia
 float lc=(fract((ac+lo)/LW)-.5)*LW;
 float inL=1.-smoothstep(hw-.9,hw-.5,abs(ac));
 float wp=(1.-smoothstep(.15,.42,abs(abs(lc)-.86)))*inL;
 float oil=(1.-smoothstep(.15,.5,abs(lc)))*inL*(.5+.5*rwN(vec2(al*.2,ac*1.5)+base));
 a*=1.+(.13*wp-(.18+.25*dirt)*oil)*ag;rough-=(.14*wp+.08*oil)*ag;
 // segnaletica consumata dal traffico (nuova e brillante se il tratto è stato rifatto)
 mk*=mix(mix(1.,.3+.45*rwN(vec2(al*.6,ac*3.)+base),ag)*(1.-.5*wp*ag),1.,rep);
 if(rep>.5){float rk=floor(al/32.);float rh=rwE(vec2(rk,sid.x*31.+sid.y*77.+base*13.));float r0=rk*32.+rh*9.,r1=min(r0+9.+rwE(vec2(rk*7.+3.,sid.y*5.+base))*18.,rk*32.+32.);
  float sm=max(rwLine(abs(al-r0),.04,fw),rwLine(abs(al-r1),.04,fw));a=mix(a,vec3(.012),sm*.9);rough=mix(rough,.35,sm);}
 if(near>0.){
  // crepe: trasversali, lungo i giunti tra le corsie, reticolo dell'asfalto vecchio, a pelle di coccodrillo dove è rotto
  if(ag>.22){
   float sealed=step(rwH(sid*5.31+base),.45)*(1.-step(.05,dm));
   float Lc=5.+7.*rwH(sid*3.33+base);float kq=floor(al/Lc);vec2 hq2=rwH2(vec2(kq,sid.x*5.+sid.y*11.+base));
   float x0=(kq+.25+.5*hq2.x)*Lc+(rwN(vec2(ac*.55,kq*3.1))-.5)*1.6;
   float ext=step(abs(ac-(hq2.y-.5)*hw*.8),hw*(.35+.75*rwH(hq2*7.)))*step(rwH(hq2*3.1),.2+.75*ag);
   float jp=floor((ac+lo)/LW+.5)*LW-lo;
   float dj=abs(ac-jp+(rwN(vec2(al*.35,jp+base))-.5)*.45);
   float pj=step(.5,rwN(vec2(al*.05,jp*3.+base)))*step(.4,ag)*step(abs(jp),hw-.5);
   float w=sealed>.5?.028:(.004+.01*ag+.016*dm);
   float cr=max(rwLine(abs(al-x0),w,fw)*ext,rwLine(dj,w,fw)*pj);
   if(hq>.5){
    float nw=abs(rwN(p*.8+base*3.)-.5)*1.25;
    cr=max(cr,rwLine(nw,.006+.012*dm,fw)*smoothstep(.55,.95,ag)*step(.45,rwN(p*.15+base))*(1.-sealed*.6));
    if(dm>.05&&dist<55.){float vo=rwVor(p*2.6+base)/2.6;cr=max(cr,rwLine(vo,.005+.008*dm,fw)*wp*dm*step(.3,rwN(p*.25+base*2.)));}
   }
   cr*=near;
   vec3 cc=sealed>.5?vec3(.012,.012,.013):a*.3;
   a=mix(a,cc,cr);rough=mix(rough,sealed>.5?.32:.95,cr);mk*=1.-cr*.7;
  }
  // rattoppi: scavi richiusi, riparazioni, a volte una corsia intera; coprono anche la segnaletica
  float pk=floor(al/18.);vec2 ph=rwH2(vec2(pk,sid.x*2.+sid.y*9.+base+.5));
  if(ph.x<.12+.45*ag&&rep<.5){
   float pl=1.4+ph.y*6.,full=step(ph.x,.05);float pwd=mix(1.+2.6*rwH(ph*5.),hw*2.-.4,full);
   float pc=pk*18.+2.+rwH(ph*9.)*(14.-pl),pa=(rwH(ph*2.3)-.5)*(hw*2.-.4-pwd);
   vec2 q=abs(vec2(al-pc-pl*.5,ac-pa))-vec2(pl*.5,pwd*.5);float sd=max(q.x,q.y);
   if(sd<.1){float inP=1.-smoothstep(-fw*.5,fw*.5,sd);
    vec3 pcol=ph.y>.45?a*.62:a*1.18+.006;
    a=mix(a,pcol*(.9+.2*rwN(p*3.+pk)),inP);rough=mix(rough,ph.y>.45?.75:.92,inP);mk*=1.-inP*.9;
    float ed=rwLine(abs(sd),.03,fw)*near;a=mix(a,vec3(.014),ed*.85);rough=mix(rough,.35,ed);}
  }
  // buche: bordo sgretolato, fondo di ghiaia, acqua dopo la pioggia (o fango che non asciuga mai)
  vec4 ph2=rwPot(vec2(al,ac),sid,base,ag,dm,hw);
  if(ph2.x+ph2.y>0.){
   float hole=ph2.x*near,rim=ph2.y*near;
   vec3 bot=mix(vec3(.026,.023,.02),vec3(.08,.072,.062),smoothstep(.3,.8,rwN(p*30.)))*mix(.5,1.,smoothstep(.25,.95,ph2.x));
   a=mix(a,min(a*1.9+.035,vec3(.24)),rim*.8);
   a=mix(a,bot,hole);rough=mix(rough,.97,hole);mk*=1.-max(hole,rim*.8);
   vec2 ci=floor(vec2(al,ac)/vec2(3.1,2.3));
   float wl=clamp(step(.6,rwE(ci*vec2(2.,9.)+sid+vec2(base,5.)))*.75+wetG*1.5,0.,1.)*smoothstep(.3,.65,ph2.x);
   wet=max(wet,wl*near*.85);
   rwGr+=ph2.zw*near*(1.-wl);
  }
  // caditoie lungo il cordolo vicino agli incroci
  if(ae<30.){float gx=abs(ae-11.),gy=abs(abs(ac)-(hw-.42));if(gx<.5&&gy<.26){float fr=step(.44,gx)+step(.21,gy);float sl=step(.45,fract(ae*8.));a=fr>.5?vec3(.05,.048,.045):mix(vec3(.008),vec3(.05,.047,.043),sl);rough=.5;mk=vec2(0.);}}
  // macchie d'olio dove le auto si fermano e nelle corsie di sosta
  float stp=(1.-smoothstep(3.,24.,ae))*(1.-smoothstep(.3,.75,abs(lc)))+smoothstep(hw-2.6,hw-2.,abs(ac))*(1.-smoothstep(hw-.6,hw-.3,abs(ac)))*.7;
  float os=smoothstep(.62,.82,rwN(p*1.6+base*5.))*stp*(.3+.7*dirt)*near;
  a*=1.-.5*os;rough=mix(rough,.45,os);
  // frenate davanti agli incroci
  float ln=floor((ac+lo)/LW);float sk=rwH(vec2(ln,sid.x*13.+sid.y*3.+base));
  if(sk<.25*ag+.05&&ae<40.){float len=8.+rwH(vec2(sk,ln))*30.;float on=step(1.5,ae)*step(ae,len)*(1.-ae/len);
   float tr=(rwLine(abs(lc-.8),.1,fw)+rwLine(abs(lc+.8),.1,fw))*on*(.5+.5*rwN(vec2(al*1.5,ln)))*near;
   a*=1.-.6*tr;rough=mix(rough,.55,tr);}
  // avvallamenti: le pozzanghere restano più a lungo sulle strade rovinate
  wet=max(wet,smoothstep(.7,.85,rwN(p*.08+base))*dm*clamp(wetG*2.,0.,1.));
 }
 // sporcizia: fango e sabbia lungo il cordolo, velo di polvere, foglie d'autunno e cartacce
 float gut=smoothstep(hw-1.4,hw-.15,abs(ac));
 float gr=gut*(.2+.8*dirt)*(.55+.45*rwN(p*.7+base));
 a=mix(a,mix(vec3(.06,.05,.04),vec3(.15,.12,.085),rwN(p*2.1)),gr*.8);rough=mix(rough,.95,gr);mk*=1.-gr*.6;
 a=mix(a,vec3(.12,.11,.095),dirt*.22*(.4+.6*rwN(p*.12+base)));
 if(close>0.&&hq>.5){vec2 cq=floor(p*5.);float hl=rwH(cq+base);float lit=step(.94-.12*dirt*gut,hl)*(.25+.75*gut)*dirt*close;
  if(lit>0.){vec2 fq=fract(p*5.)-.5;float sh=1.-smoothstep(.22,.3,length(fq*vec2(1.,1.6)));float k=rwH(cq+7.);
   vec3 lcol=k<.6?mix(vec3(.45,.17,.04),vec3(.55,.38,.08),rwH(cq+3.)):vec3(.6,.59,.55);a=mix(a,lcol,sh*lit);rough=mix(rough,.85,sh*lit);mk*=1.-sh*lit;}}
}
