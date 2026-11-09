/* ======================= PATCH AB — AUDIO: URLA UMANE VERE, MOTORI E VOLO ======================= */
// ---------- voce umana sintetizzata campione per campione (modello sorgente-filtro) ----------
// Prima le urla erano un oscillatore a dente di sega dentro tre filtri: suonava come una nota di sintetizzatore.
// Ora ogni urlo è costruito come lo fa la gola: impulsi glottali (flusso d'aria che si apre e si chiude a ogni ciclo,
// modello di Rosenberg) con jitter e shimmer (ogni ciclo un po' diverso), sdoppiamento di periodo e ruvidezza
// (la modulazione 30-110 Hz che rende un urlo "allarmante"), rotture della voce, soffio turbolento dell'aria,
// poi il tratto vocale (5 formanti in cascata, la vocale "a" spalancata che si chiude verso la fine) e la
// radiazione dalla bocca. Tipi: urlo lungo, strillo acuto, grido breve, singhiozzo, respiro affannoso, urlo maschile roco.
const ABV={bank:{},q:[],busy:false,n:0,w:null,pend:0};
// generatore autonomo (gira in un Worker: nessuno scatto nel gioco mentre prepara le voci)
const ABV_GEN=`function abVoiceGen(type,fem,seed,sr){
 let s=((seed+(fem?7777:0)+type.length*131)*2654435761)>>>0||1;const r=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};
 const gs=()=>Math.sqrt(-2*Math.log(r()+1e-9))*Math.cos(6.2831853*r());const sst=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 let dur,f0,jit,shim,sub,rough,breath,oq,att,rel;const F=fem?[950,1650,2950,3900,4900]:[760,1250,2600,3500,4500],B=[100,120,170,250,320];
 if(type==='scream'){dur=.95+r()*.85;f0=fem?1000+r()*420:430+r()*260;jit=.025+r()*.025;shim=.1+r()*.08;sub=fem?r()*.06:.05+r()*.09;rough=.28+r()*.25;breath=.16+r()*.12;oq=.48;att=.035;rel=.16;}
 else if(type==='shriek'){dur=.55+r()*.45;f0=fem?1500+r()*600:750+r()*250;jit=.02+r()*.02;shim=.08+r()*.06;sub=r()*.04;rough=.2+r()*.2;breath=.12+r()*.08;oq=.45;att=.02;rel=.1;}
 else if(type==='yelp'){dur=.22+r()*.22;f0=fem?800+r()*380:380+r()*220;jit=.02+r()*.02;shim=.08;sub=r()*.05;rough=.18+r()*.2;breath=.15;oq=.5;att=.012;rel=.07;}
 else if(type==='sob'){dur=.9+r()*.6;f0=fem?520+r()*220:260+r()*120;jit=.035;shim=.14;sub=.04;rough=.25;breath=.3;oq=.55;att=.02;rel=.1;}
 else if(type==='gasp'){dur=.32+r()*.25;f0=fem?650+r()*250:330+r()*140;jit=.05;shim=.2;sub=.02;rough=.1;breath=.9;oq=.6;att=.04;rel=.08;}
 else{dur=.7+r()*.6;f0=fem?700+r()*250:300+r()*170;jit=.03+r()*.02;shim=.12;sub=.08+r()*.1;rough=.35+r()*.2;breath=.18;oq=.5;att=.03;rel=.14;}
 const N=Math.floor(sr*dur),out=new Float32Array(N);const brk=[];
 if(type==='scream'||type==='shriek')for(let i=0;i<1+Math.floor(r()*3);i++)brk.push([r()*.75+.12,.05+r()*.11,(r()<.6?1.28:.78)+r()*.15]);
 // segmenti caotici: la voce si rompe in un ruggito irregolare (fenomeni non lineari tipici delle urla vere)
 const cha=[];if(type!=='gasp'&&type!=='sob')for(let i=0;i<(type==='yelp'?1:2+Math.floor(r()*2));i++)if(r()<.75)cha.push([r()*.8+.05,.06+r()*.14]);
 const syl=type==='sob'?3+Math.floor(r()*2):1,sylL=1/syl,p1=r()*6.28,p2=r()*6.28,p3=r()*6.28,vf=5+r()*3;
 const SN=1024,SIN=new Float32Array(SN);for(let i=0;i<SN;i++)SIN[i]=Math.sin(i/SN*6.2831853);
 const st=new Float64Array(10),A1=new Float64Array(5),A2=new Float64Array(5),G0=new Float64Array(5);
 let ph=0,pT=1,pA=1,cyc=0,uPrev=0,rw=0,frq=45+r()*50,amPh=0,ns1=0,f=f0,env=0;const Tp=oq*.62;
 for(let n=0;n<N;n++){
  if((n&15)===0){const t=n/sr,u=t/dur;
   // frequenza: attacco che sale, deriva lenta, tremolio irregolare, rotture della voce, caduta finale
   f=f0;if(type==='scream'||type==='shout'){f*=.72+.28*sst(0,.13,u);f*=1-.38*sst(.76,1,u);}
   else if(type==='shriek'){f*=.8+.35*Math.sin(Math.PI*Math.min(1,u*1.1));}
   else if(type==='yelp'){f*=u<.35?.82+.32*(u/.35):1.14-.5*(u-.35)/.65;}
   else if(type==='sob'){const sp=Math.floor(u/sylL);f*=1-.12*sp-.18*((u%sylL)/sylL);}
   else if(type==='gasp'){f*=.85+.4*u;}
   for(const b of brk){if(u>b[0]&&u<b[0]+b[1]){const k=sst(b[0],b[0]+.015,u)*(1-sst(b[0]+b[1]-.015,b[0]+b[1],u));f*=1+(b[2]-1)*k;}}
   if((n&255)===0)rw+=gs()*.012-rw*.08;
   f*=1+.03*Math.sin(t*6.28*1.3+p1)+.018*Math.sin(t*6.28*3.1+p2)+rw+.022*Math.sin(t*6.28*vf+p3+Math.sin(t*9)*.6);
   frq=Math.min(110,Math.max(35,frq+gs()*1.4));
   env=Math.min(1,t/att)*Math.min(1,(dur-t)/rel);if(type==='sob'){const q=(u%sylL)/sylL;env*=sst(0,.08,q)*(1-sst(.62,.78,q));}
   if((n&63)===0){// vocale "a" spalancata che si chiude verso la fine; il primo formante insegue la fondamentale quando è acuta
    const cl=sst(.72,1,u)*(type==='yelp'?.3:.6);const FF=[Math.max(F[0]*(1-.35*cl),Math.min(f0*1.08,1350)),F[1]*(1-.3*cl),F[2],F[3],F[4]];
    for(let i=0;i<5;i++){const rr=Math.exp(-Math.PI*B[i]*(f0>900?1.4:1)/sr),th=2*Math.PI*Math.min(FF[i],sr*.45)/sr;A1[i]=2*rr*Math.cos(th);A2[i]=-rr*rr;G0[i]=1-A1[i]-A2[i];}}}
  // ciclo glottale (Rosenberg) con jitter, shimmer e sdoppiamento di periodo
  ph+=f/sr/pT;if(ph>=1){ph-=1;cyc++;const u=n/N;let ch=0;for(const c of cha)if(u>c[0]&&u<c[0]+c[1])ch=Math.sin(Math.PI*(u-c[0])/c[1]);pT=1+jit*(1+3*ch)*gs();pA=1+shim*(1+1.5*ch)*gs();const sb=sub+.12*ch;if(sb>0){const sg=(cyc&1)?1:-1;pT*=1+sb*sg;pA*=1-sb*2.2*sg;}}
  let ug=ph<Tp?.5*(1-SIN[((Math.PI*ph/Tp/6.2831853+.25)*SN|0)&(SN-1)]):(ph<oq?SIN[((.5*(ph-Tp)/(oq-Tp)*.5+.25)*SN|0)&(SN-1)]:0);ug*=pA>.1?pA:.1;
  let e=(ug-uPrev)*sr/(f>150?f:150)*.18*(type==='gasp'?.35:1);uPrev=ug;
  // soffio turbolento modulato dal flusso + ruvidezza (modulazione d'ampiezza irregolare 35-110 Hz)
  ns1+=((r()*2-1)-ns1)*.55;e+=ns1*breath*(.25+ug)*.9;amPh+=frq/sr;e*=1-rough*(.5+.5*SIN[(amPh*SN|0)&(SN-1)]);
  // tratto vocale: 5 risonanze in cascata
  let y=e;for(let i=0;i<5;i++){const j=i*2,v=G0[i]*y+A1[i]*st[j]+A2[i]*st[j+1];st[j+1]=st[j];st[j]=v;y=v;}
  out[n]=y*env;}
 // radiazione dalla bocca, taglio sotto i 100 Hz, normalizzazione, leggera saturazione (gola tirata)
 let x1=0,d1=0,y1=0,pk=0;for(let n=0;n<N;n++){const x=out[n],d=x-.95*x1;x1=x;const y=d-d1+.975*y1;d1=d;y1=y;out[n]=y;const a=y<0?-y:y;if(a>pk)pk=a;}
 const g=1.1/Math.max(1e-6,pk);for(let n=0;n<N;n++)out[n]=Math.tanh(out[n]*g*1.3)*.8;
 if(type==='sob')for(let n=0;n<N;n++){const q=((n/N)%sylL)/sylL;if(q>.7)out[n]+=(r()*2-1)*.09*Math.sin(Math.PI*(q-.7)/.3);}
 return out;}`;
const ABV_THG=`function abThunderGen(S,sr,ic,seed){let s=(seed*2654435761)>>>0||1;const r=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};
 const n=S.length/8;let dmin=1e9,dmax=0;for(let i=0;i<n;i++){const d=Math.hypot(S[i*8],S[i*8+1],S[i*8+2]);if(d<dmin)dmin=d;if(d>dmax)dmax=d;}
 const dur=Math.min(14,(dmax-dmin)/343+1.3),N=Math.floor(sr*dur),o=new Float32Array(N);
 // ogni tratto del canale emette un'onda a N (compressione poi rarefazione); arriva quando il suono ha percorso la sua distanza
 for(let i=0;i<n;i++){const x=S[i*8],y=S[i*8+1],z=S[i*8+2],L=S[i*8+3],A=S[i*8+4],dx=S[i*8+5],dy=S[i*8+6],dz=S[i*8+7],d=Math.max(30,Math.hypot(x,y,z)),dl=Math.max(1e-3,Math.hypot(dx,dy,dz));
  const cs=Math.abs((x*dx+y*dy+z*dz)/(d*dl)),broad=.25+.75*Math.sqrt(Math.max(0,1-cs*cs)),w=A*L/d*broad*(.7+.6*r());
  const tau=(.0022+.007*r())*(1+d/2200)*(ic?1.6:1),ta=(d-dmin)/343,i0=Math.floor(ta*sr),M=Math.max(4,Math.floor(2*tau*sr));
  for(let k=0;k<M&&i0+k<N;k++){const q=k/M*2-1,sm=1-Math.pow(Math.abs(q),10);o[i0+k]+=w*(-q)*sm;}}
 // rombo: rumore grave che segue la densità degli arrivi (il "rotolare" del tuono)
 let env=0,b=0,lp=0;const fa=Math.exp(-1/(sr*.06));for(let k=0;k<N;k++){const a=Math.abs(o[k]);env=Math.max(a,env*fa);const w=r()*2-1;b+=(w*.02-b*.0015);o[k]+=b*env*14;}
 // l'aria assorbe gli acuti: più il fulmine è lontano, più il tuono è cupo
 const fc=Math.max(70,3800*Math.exp(-dmin/1300)),al=1-Math.exp(-2*Math.PI*fc/sr);let pk=0,y1=0,y2=0,hp=0,hx=0;
 for(let k=0;k<N;k++){y1+=(o[k]-y1)*al;y2+=(y1-y2)*al;const h=y2-hx+.996*hp;hx=y2;hp=h;o[k]=h;const a=Math.abs(h);if(a>pk)pk=a;}
 const g=.95/Math.max(1e-6,pk),fo=Math.floor(sr*.8);for(let k=0;k<N;k++){let v=Math.tanh(o[k]*g*1.25)*.85;if(k>N-fo)v*=(N-k)/fo;o[k]=v;}
 return {o,t0:dmin/343};}`;
const ABV_SR=22050;
// banca delle voci: preparate in un Worker (o, se non si può, una alla volta tra un fotogramma e l'altro)
const ABV_T=['scream','scream','scream','shriek','yelp','yelp','sob','gasp','shout'];
function abvStore(key,data){if(!AU.ctx)return;const b=AU.ctx.createBuffer(1,data.length,ABV_SR);b.copyToChannel?b.copyToChannel(data,0):b.getChannelData(0).set(data);(ABV.bank[key]||(ABV.bank[key]=[])).push(b);}
function abvFill(){if(!AU.ok||!AU.ctx)return;const TOT=ABV_T.length*2*3;
 if(ABV.w===null){try{const W=new Worker(URL.createObjectURL(new Blob([ABV_GEN+'\n'+ABV_THG+'\nonmessage=e=>{const d=e.data;if(d.kind==="th"){const R=abThunderGen(d.segs,d.sr,d.ic,d.seed);postMessage({key:"th",id:d.id,o:R.o,t0:R.t0},[R.o.buffer]);return;}const o=abVoiceGen(d.type,d.fem,d.seed,d.sr);postMessage({key:d.key,o},[o.buffer]);};'],{type:'application/javascript'})));
   W.onmessage=e=>{if(e.data.key==='th'){abThunderPlay(e.data);return;}ABV.pend--;abvStore(e.data.key,e.data.o);};W.onerror=()=>{ABV.w=false;};ABV.w=W;}catch(e){ABV.w=false;}}
 if(ABV.n>=TOT)return;
 if(ABV.w){while(ABV.n<TOT&&ABV.pend<4){const i=ABV.n++,type=ABV_T[i%ABV_T.length],fem=Math.floor(i/ABV_T.length)%2===0;ABV.pend++;ABV.w.postMessage({type,fem,seed:i*97+11,sr:ABV_SR,key:type+(fem?'F':'M')});}}
 else{if(!ABV.fn)ABV.fn=new Function(ABV_GEN+'\nreturn abVoiceGen;')();ABV.sk=(ABV.sk||0)+1;if(ABV.sk%3)return;const i=ABV.n++,type=ABV_T[i%ABV_T.length],fem=Math.floor(i/ABV_T.length)%2===0;try{abvStore(type+(fem?'F':'M'),ABV.fn(type,fem,i*97+11,ABV_SR));}catch(e){ABV.n=999;}}}
function abvPick(type,fem){const k=type+(fem?'F':'M'),L=ABV.bank[k];if(L&&L.length)return L[Math.floor(Math.random()*L.length)];
 const any=ABV.bank['scream'+(fem?'F':'M')];if(any&&any.length)return any[Math.floor(Math.random()*any.length)];return null;}
screamSnd=function(x,y,z,o){if(!AU.ok||AUX.scr>=7||AU.ctx.state!=='running')return;const ctx=AU.ctx,f=!!o.f,k=clamp(o.k||1,.2,1.2),d=Math.hypot(x-camera.position.x,y-camera.position.y,z-camera.position.z);if(d>150)return;
 const types=o.type?[o.type]:(f?['scream','scream','shriek','yelp','scream','sob','gasp']:['shout','scream','yelp','shout','gasp','yelp']),type=types[Math.floor(Math.random()*types.length)];
 const b=abvPick(type,f);if(!b)return;const t0=ctx.currentTime+.01+(o.delay||0),s=ctx.createBufferSource();s.buffer=b;s.playbackRate.value=rand(.92,1.08)*(o.old?.86:1)*(o.kid?1.22:1);
 const g=ctx.createGain();g.gain.value=1.25*k;s.connect(g);let last=g;
 // da lontano gli acuti si perdono e arriva soprattutto il riverbero della strada
 if(d>20){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.max(1200,18000/(1+d/30));g.connect(lp);last=lp;}
 last.connect(panAt(x,y,z,9));const sv=ctx.createGain();sv.gain.value=.18+Math.min(.25,d/400);last.connect(sv);sv.connect(AU.rev);
 s.start(t0);AUX.scr++;s.onended=()=>{AUX.scr--;};
 // dopo un urlo lungo: il respiro affannoso di chi riprende fiato
 if((type==='scream'||type==='shout')&&Math.random()<.45){const b2=abvPick('gasp',f);if(b2){const s2=ctx.createBufferSource();s2.buffer=b2;s2.playbackRate.value=rand(.95,1.05);const g2=ctx.createGain();g2.gain.value=.55*k;s2.connect(g2);g2.connect(panAt(x,y,z,7));s2.start(t0+b.duration/s.playbackRate.value+rand(.05,.2));}}};
{const vv=vehicleVisuals;vehicleVisuals=function(dt){vv(dt);try{abvFill();}catch(e){}};}
// ---------- motori: sintesi fisica nel thread audio (AudioWorklet) ----------
// Auto/camion: a ogni scoppio di un cilindro (all'angolo di manovella giusto, con la variabilità ciclo per ciclo)
// un impulso di pressione eccita le risonanze del collettore e del silenziatore; aspirazione e combustione sono
// soffi filtrati, la distribuzione ticchetta al minimo, il turbo fischia sotto carico (diesel). Jet: rombo a banda larga
// che sale con la spinta, fischio della ventola e del compressore legati alla velocità delle turbine, "buzzsaw" a piena
// potenza, crepitio del postbruciatore. Elica: motore a pistoni + impulsi delle pale. Elicottero: "wop-wop" delle pale
// (più forte in discesa e in virata), ronzio del rotore di coda, fischio della turbina. Carro armato: diesel V12
// + clangore dei cingoli che segue la velocità.
const EV_WK=`class EV extends AudioWorkletProcessor{
 static get parameterDescriptors(){return[{name:'rpm',defaultValue:900,minValue:0,maxValue:40000,automationRate:'k-rate'},{name:'load',defaultValue:0,minValue:0,maxValue:1,automationRate:'k-rate'},{name:'aux',defaultValue:0,minValue:-10,maxValue:10,automationRate:'k-rate'},{name:'spd',defaultValue:0,minValue:0,maxValue:600,automationRate:'k-rate'}];}
 constructor(o){super();this.s=(Math.random()*4294967295)>>>0||7;this.ph=0;this.st=new Float64Array(24);this.nb=0;this.ex=0;this.kn=0;this.pf=0;this.pc=0;this.pb=0;this.pt=0;this.cr=0;this.lp1=0;this.lp2=0;this.br=0;this.dc1=0;this.dc2=0;this.tk=0;this.tr=0;this.tq=0;
  this.cfg((o&&o.processorOptions)||{});this.port.onmessage=e=>this.cfg(e.data);}
 cfg(p){this.m=p.model||'car';this.offs=p.offs||[0,180,360,540];this.amp=p.amp||this.offs.map(()=>1);this.exF=p.exF||(p.pk?p.pk*.55:115);this.red=p.red||6800;this.bl=p.blades||4;this.fan=p.fan||2100;this.core=p.core||7200;this.ds=this.m==='diesel'||this.m==='tank';
  const sr=sampleRate,R=(f,bw,imp)=>{const r=Math.exp(-Math.PI*bw/sr),th=2*Math.PI*Math.min(f,sr*.45)/sr;return[2*r*Math.cos(th),-r*r,imp?Math.sin(th):(1-r)*Math.sqrt(1-2*r*Math.cos(2*th)+r*r)];};this.r1=R(this.exF,this.exF*.22,1);this.r2=R(this.exF*2.7,this.exF*.5,1);this.r3=R(this.ds?1800:1150,500,0);this.r4=R(2400,180,0);this.r5=R(3700,240,0);}
 rn(){let s=this.s;s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;this.s=s;return s/2147483648-1;}
 res(c,i,x){const S=this.st,y=c[2]*x+c[0]*S[i]+c[1]*S[i+1];S[i+1]=S[i];S[i]=y;return y;}
 piston(rpm,ld,k){rpm=Math.min(9000,Math.max(0,rpm));const pv=this.ph;this.ph+=rpm/60*720/sampleRate;let w=false;if(this.ph>=720){this.ph-=720;w=true;}
  for(let c=0;c<this.offs.length;c++){const f=this.offs[c];if((!w&&pv<=f&&this.ph>f)||(w&&(f>pv||f<=this.ph))){const a=this.amp[c]*(.32+.68*ld)*(1+.08*this.rn());this.ex+=a;this.nb=Math.max(this.nb,a*(.12+.88*ld));if(this.ds)this.kn=a*(.5+ld);}}
  const x=this.ex;this.ex=0;const e1=this.res(this.r1,0,x),e2=this.res(this.r2,2,x*.6);this.nb*=.9985-rpm*1e-7;const nz=this.rn()*this.nb;const i3=this.res(this.r3,4,nz*1.2);
  let y=e1+.55*e2+.5*i3;if(this.ds){this.kn*=.992;y+=this.res(this.r4,6,this.rn()*this.kn*1.5)*.6;const tf=1800+rpm/this.red*7000;this.pt+=tf/sampleRate;y+=Math.sin(this.pt*6.2832)*.012*ld*rpm/this.red;}
  this.pc+=rpm/60*this.offs.length*1.5/sampleRate;if(this.pc>=1){this.pc-=1;this.tk=.25;}this.tk*=.93;y+=this.res(this.r5,8,this.rn()*this.tk*.8)*(1-ld*.7);return y;}
 process(I,O,P){const out=O[0][0],N=out.length,sr=sampleRate,rpm=P.rpm[0],ld=P.load[0],aux=P.aux[0],spd=P.spd[0],m=this.m;
  for(let n=0;n<N;n++){let y=0;
   if(m==='car'||m==='diesel'){y=this.piston(rpm,ld);}
   else if(m==='tank'){y=this.piston(rpm,ld)*.9;const lf=spd/.17;this.tq+=lf/sr;if(this.tq>=1){this.tq-=1;this.tr=.6+.4*Math.random();}this.tr*=.985;y+=(this.res(this.r4,10,this.rn()*this.tr*2.5)+this.res(this.r5,12,this.rn()*this.tr*1.8))*Math.min(1,spd/3);this.br+=(this.rn()*.02-this.br*.002);y+=this.br*Math.min(1,spd/6)*.6;}
   else if(m==='jet'){const n1=Math.min(1.25,Math.max(.15,rpm)),w=this.rn();this.lp1+=(w-this.lp1)*Math.min(.85,.04+.5*n1*n1);this.lp2+=(this.lp1-this.lp2)*Math.min(.85,.05+.45*n1*n1);this.br+=(w*.02-this.br*.003);
    let b=(this.lp2*1.4+this.br*2.2)*Math.pow(n1,2.2)*(.35+.65*ld);this.pf+=n1*this.fan/sr;const fan=Math.sin(this.pf*6.2832)+.35*Math.sin(this.pf*12.566);this.pc+=Math.max(.3,n1)*this.core/sr;const core=Math.sin(this.pc*6.2832);
    let bz=0;if(n1>.78){const sh=this.pf/24;for(let k=7;k<15;k+=2)bz+=Math.sin(sh*6.2832*k+k*1.3)/k;bz*=(n1-.78)*4;}
    y=b+fan*.05*n1+core*(.018+.012*(1-n1))+bz*.05;if(aux>.5){if(Math.random()<.004){this.cr=(Math.random()*.8+.2);}this.cr*=.9;y+=this.cr*this.rn()*.5+this.br*3;}}
   else if(m==='prop'){y=this.piston(rpm,ld)*.8;this.pb+=Math.min(9000,Math.max(0,rpm))/60*this.bl*.5/sr;if(this.pb>=1)this.pb-=1;const q=(this.pb-.5)*10;y+=-q*Math.exp(-q*q)*.25*(.3+.7*ld);}
   else if(m==='heli'){const bpf=Math.min(1200,Math.max(0,rpm))/60*this.bl;this.pb+=bpf/sr;if(this.pb>=1)this.pb-=1;const q=(this.pb-.5)*26,sl=.35+.4*ld+1.1*Math.max(0,aux);
    y=-q*Math.exp(-q*q)*sl*1.1;const w=this.rn();this.lp1+=(w-this.lp1)*.06;y+=this.lp1*(.35+.3*Math.cos(this.pb*6.2832))*.22;
    this.pt+=bpf*5.6/sr;if(this.pt>=1)this.pt-=1;const t2=(this.pt-.5)*9;y+=-t2*Math.exp(-t2*t2)*.07;this.pc+=6700/sr;y+=Math.sin(this.pc*6.2832)*.012;}
   // blocco della componente continua e saturazione dolce
   let d=y-this.dc1+.996*this.dc2;if(!(d===d)||d>1e4||d<-1e4){this.st.fill(0);this.lp1=this.lp2=this.br=this.dc1=this.dc2=this.nb=this.ex=this.kn=this.tk=this.tr=this.cr=0;y=0;d=0;}this.dc1=y;this.dc2=d;out[n]=Math.tanh(d*.9)*.8;}
  for(let c=1;c<O[0].length;c++)O[0][c].set(out);return true;}}
registerProcessor('cy-eng',EV);`;
// il motore dell'auto del giocatore usa lo stesso processore (più ricco del precedente)
engInit=function(){if(AU.engS||!AU.ok)return;if(!AU.ctx.audioWorklet){AU.engS='no';return;}AU.engS='loading';
 try{const W=AU.ctx.audioWorklet,blob=()=>URL.createObjectURL(new Blob([EV_WK],{type:'application/javascript'})),data=()=>'data:application/javascript;base64,'+btoa(unescape(encodeURIComponent(EV_WK)));
  W.addModule(blob()).catch(()=>W.addModule(data())).then(()=>{const ctx=AU.ctx,n=new AudioWorkletNode(ctx,'cy-eng',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[1],processorOptions:Object.assign({model:'car'},ENGP['4 cilindri'])}),lp=ctx.createBiquadFilter(),pk=ctx.createBiquadFilter(),g=ctx.createGain();
   lp.type='lowpass';lp.Q.value=.8;pk.type='peaking';pk.gain.value=5;pk.Q.value=1.2;g.gain.value=0;n.connect(lp);lp.connect(pk);pk.connect(g);g.connect(AU.master);AU.eng={n,lp,pk,g,cur:null};AU.engS='ok';}).catch(()=>{AU.engS='no';});}catch(e){AU.engS='no';}};
// ---------- voci dei motori nel mondo: aereo/carro/elicottero del giocatore, elicotteri, jet e carri vicini, auto che passano ----------
// Ogni sorgente ha la sua voce sintetizzata, posizionata nello spazio, con effetto Doppler (il passaggio di un jet
// scende di tono), e i vecchi rumori a ciclo continuo per quei mezzi vengono spenti.
const EVM={v:[],t:0,on:false};
const EV_CFG={jet:{model:'jet'},heli:{model:'heli',blades:4},tank:{model:'tank',offs:[0,60,120,180,240,300,360,420,480,540,600,660],amp:Array(12).fill(1),exF:62,red:2600},
 car4:Object.assign({model:'car'},ENGP['4 cilindri']),v6:Object.assign({model:'car'},ENGP['V6']),v8:Object.assign({model:'car'},ENGP['V8']),diesel:{model:'diesel',offs:[0,120,240,360,480,600],amp:[1,1,1,1,1,1],exF:70,red:3200}};
function evVoice(){const ctx=AU.ctx,n=new AudioWorkletNode(ctx,'cy-eng',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[1],processorOptions:EV_CFG.car4}),lp=ctx.createBiquadFilter(),g=ctx.createGain();lp.type='lowpass';lp.frequency.value=9000;g.gain.value=0;
 const p=ctx.createPanner();p.panningModel='equalpower';p.distanceModel='inverse';p.refDistance=10;p.rolloffFactor=1;p.maxDistance=6000;n.connect(lp);lp.connect(g);g.connect(p);p.connect(AU.master);const sv=ctx.createGain();sv.gain.value=.12;g.connect(sv);sv.connect(AU.rev);
 return{n,lp,g,p,src:null,cfg:null,sp:0,n1:.2};}
function evSources(){const cp=camera.position,P=player,L=[];const pv=P.mode!=='walk'?P.veh:null;
 for(const v of CVS){if(v.dead)continue;const d=Math.hypot(v.px-cp.x,v.py-cp.y,v.pz-cp.z);if(v.type==='plane'&&d<2500)L.push({o:v,k:'jet',d,pr:v===pv?0:d});else if(v.type==='tank'&&d<500)L.push({o:v,k:'tank',d,pr:v===pv?0:d*1.2});}
 for(const h of helis){if(h.dead||h.heli.rpm<=.02)continue;const d=Math.hypot(h.px-cp.x,h.py-cp.y,h.pz-cp.z);if(d<1600)L.push({o:h,k:'heli',d,pr:h===pv?0:d*.8});}
 if(typeof TRF!=='undefined'&&TRF.cars){let c1=null,c2=null,d1=1e9,d2=1e9;for(const c of TRF.cars){if(c.dead||c===pv)continue;const d=Math.hypot(c.px-cp.x,c.py-cp.y,c.pz-cp.z);if(d>45||Math.hypot(c.vx,c.vz)<1)continue;if(d<d1){c2=c1;d2=d1;c1=c;d1=d;}else if(d<d2){c2=c;d2=d;}}
  for(const [c,d] of [[c1,d1],[c2,d2]])if(c){const big=(c.hx||1)*(c.hz||2)>5;L.push({o:c,k:big?'diesel':((c.id||0)%3===0?'v6':'car4'),d,pr:d*3+40});}}
 L.sort((a,b)=>a.pr-b.pr);return L.slice(0,QP===PRESETS.bassa?2:4);}
function evStep(dt){if(AU.ok&&!AU.engS)engInit();if(AU.engS!=='ok'||!AU.ok||AU.ctx.state!=='running')return;if(!EVM.on){EVM.on=true;for(let i=0;i<(QP===PRESETS.bassa?2:4);i++)EVM.v.push(evVoice());}
 const ctx=AU.ctx,t=ctx.currentTime,cp=camera.position,S=evSources();
 // assegnazione stabile: chi aveva già una voce la tiene
 for(const v of EVM.v){if(v.src&&!S.some(s=>s.o===v.src))v.src=null;}
 for(const s of S){if(EVM.v.some(v=>v.src===s.o))continue;const f=EVM.v.find(v=>!v.src);if(f){f.src=s.o;f.k=s.k;}}
 for(const v of EVM.v){if(!v.src){v.g.gain.setTargetAtTime(0,t,.15);continue;}const o=v.src,s=S.find(q=>q.o===o);if(!s){v.g.gain.setTargetAtTime(0,t,.15);continue;}
  let fresh=false;if(v.cfg!==v.k){v.n.port.postMessage(EV_CFG[v.k]);v.cfg=v.k;fresh=true;}
  const R=v.n.parameters,dx=o.px-cp.x,dy=o.py-cp.y,dz=o.pz-cp.z,d=Math.max(1,Math.hypot(dx,dy,dz)),vt=-((o.vx||0)*dx+(o.vy||0)*dy+(o.vz||0)*dz)/d,dop=clamp(343/(343-clamp(vt,-250,250)),.55,2.2);
  setPan(v.p,o.px,o.py,o.pz);let rpm=900,ld=0,aux=0,spd=0,gain=.5,lpf=12000;
  if(v.k==='jet'){const th=clamp(o.th===undefined?.6:o.th,0,1);v.n1+=(Math.max(.22,th)-v.n1)*Math.min(1,dt*.9);rpm=v.n1*dop;ld=th;aux=o.ab?1:0;gain=.9+th*.6;
   // il rombo del getto è più forte dietro, il fischio davanti: chi è davanti al jet sente più alti
   const R9=o.R||[1,0,0,0,1,0,0,0,1],fx=-R9[2],fy=-R9[5],fz=-R9[8],ahead=-(fx*dx+fy*dy+fz*dz)/d;lpf=ahead>0?14000:5000+9000*(1+ahead);}
  else if(v.k==='heli'){const H=o.heli,hs=Math.hypot(o.vx,o.vz);rpm=390*H.rpm*dop;ld=clamp(.4+(o.vy||0)*.05,0,1);aux=clamp(-(o.vy||0)*.12+hs*.012,0,1.2);gain=.8*H.rpm;}
  else if(v.k==='tank'){spd=Math.abs(o.sp||0);rpm=(800+Math.min(1,spd/((o.p&&o.p.vmax)||12))*1700)*dop;ld=clamp(.3+spd*.06,0,1);gain=.85;}
  else{spd=Math.hypot(o.vx,o.vz);const GR=[3.4,2.1,1.45,1.1,.88,.72];let gr=0,r=900+spd*GR[0]*95;while(r>4800&&gr<5){gr++;r=900+spd*GR[gr]*95;}rpm=r*dop;ld=.25+Math.min(.5,spd*.02);gain=.3;lpf=4000+spd*200;}
  if(!(isFinite(rpm)&&isFinite(ld)&&isFinite(aux)&&isFinite(spd))){v.g.gain.setTargetAtTime(0,t,.1);continue;}if(fresh){for(const [k,x] of [['rpm',rpm],['load',ld],['aux',aux],['spd',spd]]){const q=R.get(k);q.cancelScheduledValues(t);q.setValueAtTime(x,t);}}else{R.get('rpm').setTargetAtTime(rpm,t,.03);R.get('load').setTargetAtTime(ld,t,.05);R.get('aux').setTargetAtTime(aux,t,.05);R.get('spd').setTargetAtTime(spd,t,.05);}
  // lontano: l'aria assorbe gli acuti
  v.lp.frequency.setTargetAtTime(Math.min(lpf,22000/(1+d/180)),t,.1);v.g.gain.setTargetAtTime(gain,t,.12);}
 // i vecchi suoni a ciclo continuo di questi mezzi si spengono (sostituiti dalle voci nuove)
 for(const k of['jetN','jetA','jetW','tankE','tankT','heli','jetT','jetR','heliT','heliW'])if(AU.loops[k])loopGain(AU.loops[k],0,.05);}
{const fu=frameUpdate;frameUpdate=function(dt){fu(dt);try{evStep(dt);}catch(e){if(!EVM.err){EVM.err=1;console.warn('motori',e);}}};}
// ---------- vento in volo: rombo basso + sibilo, a raffiche, che cresce col quadrato della velocità ----------
const AWX={g:0,t:0};
{const sf=speedFX;speedFX=function(dt){sf(dt);if(!AU.ok)return;const P=player;let s=0,air=false,open=true;if(P.mode!=='walk'&&P.veh){const b=P.veh;s=Math.hypot(b.vx||0,b.vy||0,b.vz||0);air=b.type==='plane'||b.type==='ufo'||!!b.heli;open=false;}else if(P.fly){s=Math.hypot(P.vx||0,P.vy||0,P.vz||0);air=true;}
 AWX.t-=dt;if(AWX.t<=0){AWX.t=rand(.15,.6);AWX.g=rand(.6,1.25);}const q=clamp(s/120,0,1.4),k=(air?1:.25)*q*q*(open?1.3:.55);
 const L=AU.loops.air,R=AU.loops.airR||(AU.loops.airR=mkLoop('brown','lowpass',260,.7,false)),t=AU.ctx.currentTime;
 if(L){L.g.gain.setTargetAtTime(.5*k*AWX.g,t,.18);L.f.frequency.setTargetAtTime(500+s*6*(open?1:.6),t,.2);}loopGain(R,.6*k*(.8+.4*AWX.g),.25);R.f.frequency.setTargetAtTime(160+s*1.5,t,.3);};}

// ---------- tuono dalla geometria del fulmine ----------
const ABT={id:0,req:{}};
function abThunder(segs,dist,ic,x,y,z){if(!AU.ok||!AU.ctx)return false;const id=++ABT.id,sent=performance.now();ABT.req[id]={x,y,z,sent,ic};const S=new Float32Array(segs);
 if(ABV.w){ABV.w.postMessage({kind:'th',segs:S,sr:ABV_SR,ic,seed:id*31+7,id},[S.buffer]);return true;}
 try{if(!ABV.thf)ABV.thf=new Function(ABV_THG+'\nreturn abThunderGen;')();const R=ABV.thf(S,ABV_SR,ic,id*31+7);abThunderPlay({id,o:R.o,t0:R.t0});return true;}catch(e){return false;}}
function abThunderPlay(d){const q=ABT.req[d.id];delete ABT.req[d.id];if(!q||!AU.ok)return;const ctx=AU.ctx,b=ctx.createBuffer(1,d.o.length,ABV_SR);b.copyToChannel?b.copyToChannel(d.o,0):b.getChannelData(0).set(d.o);
 const el=(performance.now()-q.sent)/1000,s=ctx.createBufferSource();s.buffer=b;const g=ctx.createGain(),near=d.t0<1.2;g.gain.value=(near?2.2:1.6)*(q.ic?.75:1);s.connect(g);
 const p=ctx.createPanner();p.panningModel='equalpower';p.distanceModel='inverse';p.refDistance=600;p.rolloffFactor=.6;p.maxDistance=10000;setPan(p,q.x,q.y,q.z);g.connect(p);p.connect(AU.master);
 const sv=ctx.createGain();sv.gain.value=.55;g.connect(sv);sv.connect(AU.rev);s.start(ctx.currentTime+Math.max(0,d.t0-el));}
