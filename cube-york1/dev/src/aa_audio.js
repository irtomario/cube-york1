/* ======================= PATCH AA — AUDIO: URLA VERE, ESPLOSIONI CON ECO, PAESAGGIO SONORO, PASSI ======================= */
// ---------- urla sintetizzate: sorgente glottale (dente di sega) con vibrato, tremolio irregolare e ruvidezza, filtrata da tre formanti della vocale "a" ----------
// niente parole: nel panico le persone urlano, gridano, ansimano
AUX.scr=0;
function screamSnd(x,y,z,o){if(!AU.ok||AUX.scr>=6||AU.ctx.state!=='running')return;const ctx=AU.ctx,t0=ctx.currentTime+.01+(o.delay||0),f=!!o.f,k=clamp(o.k||1,.2,1.2);
 const types=o.type?[o.type]:(f?['scream','scream','shriek','yelp','aah']:['scream','yelp','aah','aah','yelp']),type=types[Math.floor(Math.random()*types.length)];
 let dur,fa,fb,fc;
 if(type==='scream'){dur=rand(.9,1.7);fb=f?rand(900,1400):rand(400,680);fa=fb*rand(.6,.78);fc=fb*rand(.6,.82);}
 else if(type==='shriek'){dur=rand(.55,1.05);fb=f?rand(1300,1850):rand(640,880);fa=fb*.86;fc=fb*.92;}
 else if(type==='yelp'){dur=rand(.22,.42);fb=f?rand(780,1150):rand(360,600);fa=fb*.74;fc=fb*.68;}
 else{dur=rand(.7,1.25);fb=f?rand(620,920):rand(290,460);fa=fb*1.04;fc=fb*.52;}
 if(o.old){fa*=.82;fb*=.82;fc*=.82;dur*=.8;}
 const d=Math.hypot(x-camera.position.x,y-camera.position.y,z-camera.position.z);if(d>140)return;
 const nodes=[],osc=ctx.createOscillator();osc.type='sawtooth';nodes.push(osc);
 osc.frequency.setValueAtTime(fa,t0);osc.frequency.exponentialRampToValueAtTime(fb,t0+dur*.2);osc.frequency.setValueAtTime(fb,t0+dur*.72);osc.frequency.exponentialRampToValueAtTime(Math.max(60,fc),t0+dur);
 const vib=ctx.createOscillator();vib.frequency.value=rand(5.5,8.5);const vg=ctx.createGain();vg.gain.setValueAtTime(fb*.012,t0);vg.gain.linearRampToValueAtTime(fb*rand(.03,.055),t0+dur*.6);vib.connect(vg);vg.connect(osc.frequency);nodes.push(vib);
 const jit=ctx.createBufferSource();jit.buffer=AU.brown;jit.loop=true;const jg=ctx.createGain();jg.gain.value=fb*.05;jit.connect(jg);jg.connect(osc.frequency);nodes.push(jit);
 const am=ctx.createGain();am.gain.value=1;const ro=ctx.createOscillator();ro.frequency.value=rand(38,95);const rg=ctx.createGain();rg.gain.value=rand(.18,.38)*k;ro.connect(rg);rg.connect(am.gain);nodes.push(ro);osc.connect(am);
 const out=ctx.createGain();out.gain.value=1;const F=f?[Math.max(920,fb*1.05),1550,3050]:[Math.max(720,fb*1.12),1250,2650],G=[1.6,2.1,1.25],Q=[4.5,9,11];
 for(let i=0;i<3;i++){const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=F[i]*rand(.94,1.08);bp.Q.value=Q[i];const g=ctx.createGain();g.gain.value=G[i];am.connect(bp);bp.connect(g);g.connect(out);}
 {const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4800;const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=320;const dg=ctx.createGain();dg.gain.value=.32;am.connect(hp);hp.connect(lp);lp.connect(dg);dg.connect(out);}
 const nz=ctx.createBufferSource();nz.buffer=AU.noise;nz.loop=true;const nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=f?3300:2700;nf.Q.value=.9;const ng=ctx.createGain();ng.gain.setValueAtTime(.05,t0);ng.gain.linearRampToValueAtTime(.12,t0+dur);nz.connect(nf);nf.connect(ng);ng.connect(out);nodes.push(nz);
 const env=ctx.createGain(),pk=2*k;env.gain.setValueAtTime(0,t0);env.gain.linearRampToValueAtTime(pk,t0+.035);env.gain.setValueAtTime(pk*.92,t0+dur*.72);env.gain.exponentialRampToValueAtTime(.0008,t0+dur);out.connect(env);
 let last=env;if(d>25){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.max(900,16000/(1+d/35));env.connect(lp);last=lp;}
 last.connect(panAt(x,y,z,9));const sv=ctx.createGain();sv.gain.value=.22;last.connect(sv);sv.connect(AU.rev);
 for(const n of nodes){n.start(t0);n.stop(t0+dur+.06);}AUX.scr++;osc.onended=()=>{AUX.scr--;};
 // dopo un urlo lungo si riprende fiato: un respiro affannoso
 if(type==='scream'&&Math.random()<.6)sfx({x,y,z,delay:(t0-ctx.currentTime)+dur+.08,src:'noise',filter:'bandpass',ff0:f?2600:2100,ff1:f?1500:1200,q:1.4,g:.12*k,a:.06,d:.32,ref:6});}
npcVoice=function(n){if(NPC.vt>0)return;const cp=camera.position,d=Math.hypot(n.x-cp.x,n.z-cp.z);if(d>120)return;NPC.vt=rand(.35,1.1);
 screamSnd(n.rag?n.rag.p[6]:n.x,(n.rag?n.rag.p[7]:n.y+1.55),n.rag?n.rag.p[8]:n.z,{f:n.f,old:n.old,k:clamp(1.1-d/150,.35,1)});
 // chi è vicino spesso urla subito dopo (il panico si propaga)
 if(Math.random()<.45){for(const m of NPC.list){if(m===n||m.dead||m.rag)continue;if(Math.hypot(m.x-n.x,m.z-n.z)<14&&Math.random()<.5){screamSnd(m.x,m.y+1.55,m.z,{f:m.f,old:m.old,k:clamp(1.05-d/150,.3,.95),delay:rand(.15,.6)});break;}}}};

// ---------- esplosioni: colpo secco vicino, boato basso, eco tra i palazzi, pioggia di detriti; gli acuti si perdono con la distanza ----------
{const se0=sndExplosion;sndExplosion=function(x,y,z,R){se0(x,y,z,R);if(!AU.ok)return;const d=sDist(x,y,z),dl=d/343,big=clamp(R/20,.2,2);AU.pri=1;
 if(d<60)sfx({x,y,z,delay:dl,src:'noise',filter:'highpass',ff0:2500,g:.5*big,a:.001,d:.06,ref:12});
 sfx({x,y,z,delay:dl,src:'osc',type:'sine',f0:38,f1:16,g:.7*big,a:.015,d:1.8+big,ref:40*big});
 // eco: in città i palazzi riflettono il boato (due o tre ritorni), in campagna arriva l'eco lontana delle colline
 const city=Math.abs(x)<CX+60&&Math.abs(z)<CZ+60,ne=city?3:1;for(let i=0;i<ne;i++){const ed=city?rand(.18,.65)*(i+1):rand(1.2,2.6);sfx({x:x+rand(-60,60),y,z:z+rand(-60,60),delay:dl+ed,src:'brown',filter:'lowpass',ff0:900,ff1:140,g:.45*big/(i+1.3),a:.02,d:1.2+big,ref:30*big,rev:.7,rate:.7});}
 // detriti che ricadono
 const nd=Math.round(4+big*5);for(let i=0;i<nd;i++)sfx({x:x+rand(-R,R),y:0,z:z+rand(-R,R),delay:dl+rand(.6,2.6),src:'noise',filter:'bandpass',ff0:rand(500,2400),q:2,g:.12*big,a:.002,d:rand(.04,.16),ref:14});
 AU.pri=0;};}

// ---------- passi: tallone e punta, superfici diverse, mai due passi uguali ----------
sndStep=function(surf,x,y,z){const r=rand(.88,1.14);
 if(surf==='grass'){sfx({x,y,z,src:'noise',filter:'bandpass',ff0:2200*r,q:.7,g:.055,d:.12,ref:3});sfx({x,y,z,delay:.05,src:'noise',filter:'highpass',ff0:3800*r,g:.035,d:.09,ref:3});}
 else if(surf==='water'){sfx({x,y,z,src:'noise',filter:'lowpass',ff0:1100*r,ff1:280,g:.16,d:.24,ref:3});sfx({x,y,z,delay:.07,src:'noise',filter:'bandpass',ff0:2400*r,q:1.5,g:.05,d:.12,ref:3});}
 else if(surf==='sand'){sfx({x,y,z,src:'noise',filter:'bandpass',ff0:1600*r,q:.6,g:.07,d:.16,ref:3});}
 else if(surf==='metal'){sfx({x,y,z,src:'osc',type:'triangle',f0:rand(260,420),f1:180,g:.06,d:.12,ref:4});sfx({x,y,z,src:'noise',filter:'bandpass',ff0:2800*r,q:2,g:.05,d:.05,ref:4});}
 else{sfx({x,y,z,src:'noise',filter:'bandpass',ff0:1500*r,q:.9,g:.085,d:.05,ref:3});sfx({x,y,z,src:'osc',type:'sine',f0:105*r,f1:52,g:.07,d:.055,ref:3});sfx({x,y,z,delay:.045+rand(0,.02),src:'noise',filter:'bandpass',ff0:2600*r,q:1.1,g:.04,d:.035,ref:3});}};

// ---------- paesaggio sonoro: uccelli di giorno, grilli di notte, onde vicino all'acqua, fiumi che scorrono, clacson lontani, folla ----------
const AMB={t:0,birdT:2,hornT:6,sea:0,riv:0,green:0,crowd:0,crick:null,seaL:null,rivL:null,crowdL:null,cityF:0};
function ambChirp(x,y,z,sp){const f0=rand(2300,4800)*(sp||1),n=2+Math.floor(Math.random()*5),gap=rand(.06,.14),up=Math.random()<.6;
 for(let i=0;i<n;i++){const ff=f0*rand(.92,1.08);sfx({x,y,z,delay:i*gap,src:'osc',type:'sine',f0:up?ff:ff*1.35,f1:up?ff*1.35:ff*.8,g:.05,a:.005,d:rand(.035,.08),ref:6});if(Math.random()<.5)sfx({x,y,z,delay:i*gap,src:'osc',type:'sine',f0:(up?ff:ff*1.35)*2,f1:(up?ff*1.35:ff*.8)*2,g:.012,a:.005,d:.05,ref:6});}}
function ambStep(dt){if(!AU.ok||AU.ctx.state!=='running')return;const c=camera.position,ctx=AU.ctx,t=ctx.currentTime,night=U.uNight?U.uNight.value:0,day=1-night,rain=WX.rain||0,gy=groundH(c.x,c.z),alt=Math.max(0,c.y-gy);AMB.t-=dt;
 if(AMB.t<=0){AMB.t=.5;// dove sono: acqua vicina, verde vicino, città
  let wn=0;for(let i=0;i<12;i++){const a=i/12*TAU;for(const r of[18,45,90]){const x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;if(waterAt(x,z)>groundH(x,z)+.2){wn+=r<20?1:r<50?.6:.3;}}}AMB.sea=clamp(wn/9,0,1)*clamp(1-alt/120,0,1);
  let rv=0;try{const q=typeof riverQ==='function'?riverQ(c.x,c.z):null;if(q&&q.d<q.w+60)rv=clamp(1-(q.d-q.w)/60,0,1);}catch(e){}AMB.riv=rv*clamp(1-alt/80,0,1);
  const ax=Math.abs(c.x),az=Math.abs(c.z),city=(ax<CX+60&&az<CZ+60)?1:((ax>760&&ax<1240&&az<690)||(c.x>1220&&c.x<2320&&c.z>220&&c.z<1560))?.6:0;AMB.cityF=city;
  AMB.green=clamp((typeof AUX!=='undefined'?AUX.trees:0)+(city?0:.6)+(typeof inParkFn==='function'&&inParkFn(c.x,c.z)?.6:0),0,1)*clamp(1-alt/60,0,1);
  let nn=0;for(const n of NPC.list){if(n.dead||n.rag)continue;const q=(n.x-c.x)**2+(n.z-c.z)**2;if(q<900)nn++;}AMB.crowd=clamp((nn-3)/12,0,1)*clamp(1-alt/25,0,1);}
 // uccelli: di giorno, tra gli alberi e in campagna, non sotto la pioggia
 AMB.birdT-=dt;if(AMB.birdT<=0){AMB.birdT=rand(1.2,4.5);if(day>.5&&rain<.2&&AMB.green>.25&&Math.random()<AMB.green){const a=rand(0,TAU),r=rand(8,35);ambChirp(c.x+Math.cos(a)*r,gy+rand(4,12),c.z+Math.sin(a)*r,rand(.8,1.2));}}
 // grilli: di notte nel verde
 const ck=night>.6&&rain<.3?AMB.green*(.6+.4*AMB.green):0;if(ck>0&&!AMB.crick){const o=ctx.createOscillator();o.frequency.value=4600;const am=ctx.createGain();am.gain.value=0;const lfo=ctx.createOscillator();lfo.type='square';lfo.frequency.value=32;const lg=ctx.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(am.gain);
  const gate=ctx.createGain();gate.gain.value=0;const lf2=ctx.createOscillator();lf2.type='square';lf2.frequency.value=2.6;const g2=ctx.createGain();g2.gain.value=.5;lf2.connect(g2);g2.connect(gate.gain);const g=ctx.createGain();g.gain.value=0;o.connect(am);am.connect(gate);gate.connect(g);g.connect(AU.master);o.start();lfo.start();lf2.start();AMB.crick={g,o};}
 if(AMB.crick){AMB.crick.g.gain.setTargetAtTime(.022*ck,t,.8);AMB.crick.o.frequency.setTargetAtTime(4500+Math.sin(t*.05)*180,t,1);}
 // onde contro la riva: rumore basso che sale e scende con la risacca
 if(AMB.sea>0&&!AMB.seaL)AMB.seaL=mkLoop('brown','lowpass',520,.6,false);
 if(AMB.seaL){const sw=Math.pow(.5+.5*Math.sin(t*TAU/7.5+Math.sin(t*.13)*1.5),2.2);loopGain(AMB.seaL,AMB.sea*(.05+.13*sw)*(1+(WX.wind||0)),.3);AMB.seaL.f.frequency.setTargetAtTime(380+520*sw,t,.4);}
 // fiume che scorre: fruscio costante e gorgoglio
 if(AMB.riv>0&&!AMB.rivL)AMB.rivL=mkLoop('noise','bandpass',820,.55,false);
 if(AMB.rivL)loopGain(AMB.rivL,AMB.riv*.07*(.85+.15*Math.sin(t*1.7)),.6);
 // folla: brusio di voci senza parole quando ci sono molte persone vicine
 if(AMB.crowd>0&&!AMB.crowdL){AMB.crowdL=mkLoop('brown','bandpass',480,1.2,false);}
 if(AMB.crowdL){loopGain(AMB.crowdL,AMB.crowd*.05*day+AMB.crowd*.02*night,1);AMB.crowdL.f.frequency.setTargetAtTime(420+120*Math.sin(t*2.3)+90*Math.sin(t*3.7),t,.15);}
 // clacson e sirene lontane in città, di giorno più spesso
 AMB.hornT-=dt;if(AMB.hornT<=0){AMB.hornT=rand(5,14)/(.4+day);if(AMB.cityF>.5&&alt<200){const a=rand(0,TAU),r=rand(120,320),x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;
  if(Math.random()<.8){const f0=rand(330,470);sfx({x,y:1,z,src:'osc',type:'square',f0,filter:'lowpass',ff0:1500,g:.07,a:.01,d:rand(.25,.7),ref:30});if(Math.random()<.5)sfx({x,y:1,z,delay:rand(.3,.6),src:'osc',type:'square',f0,filter:'lowpass',ff0:1500,g:.06,a:.01,d:rand(.15,.4),ref:30});}
  else{const f0=rand(700,900);sfx({x,y:2,z,src:'osc',type:'sawtooth',f0,f1:f0*1.6,filter:'bandpass',ff0:1300,g:.04,a:.4,d:1.6,ref:60});}}}}
{const fu0=frameUpdate;frameUpdate=function(dt){fu0(dt);try{ambStep(dt);}catch(e){}};}
function stepSurf(x,y,z){if(waterAt(x,z)>y+.05)return 'water';if(typeof inParkFn==='function'&&inParkFn(x,z))return 'grass';
 if(typeof inDesert==='function'&&inDesert(x,z)&&Math.abs(x)>9&&!(typeof inBase==='function'&&inBase(x,z)))return 'sand';
 if(typeof isCore==='function'&&!isCore(x,z)){if(typeof inZone==='function'&&inZone(x,z,0))return 'hard';try{const r=typeof roadQ==='function'?roadQ(x,z):null;if(r&&r.d<5.5)return 'hard';}catch(e){}return z>coastZ(x)-40?'sand':'grass';}
 return 'hard';}

// ---------- motori: turbina che fischia e postbruciatore che crepita sui jet, rotore di coda e turbina sugli elicotteri ----------
const VXA={ct:0};
function vehAudioX(dt){if(!AU.ok||AU.ctx.state!=='running')return;const P=player,b=P.veh,ctx=AU.ctx,t=ctx.currentTime;
 const jet=b&&b.cv&&b.type==='plane'&&!b.dead,th=jet?clamp(b.th||0,0,1):0;
 const T=AU.loops.jetT||(jet?(AU.loops.jetT=mkOscLoop('sine',3000,'bandpass',3200)):null);if(T){T.o.frequency.setTargetAtTime(2200+th*2600,t,.4);loopGain(T,jet?.012+th*.03:0,.4);}
 const R=AU.loops.jetR||(jet?(AU.loops.jetR=mkLoop('noise','lowpass',600,.7,false)):null);if(R){R.f.frequency.setTargetAtTime(450+th*2100+(b&&b.ab?1200:0),t,.3);loopGain(R,jet?.05+th*.16+(b.ab?.12:0):0,.35);}
 if(jet&&b.ab){VXA.ct-=dt;while(VXA.ct<=0){VXA.ct+=rand(.018,.06);sfx({src:'noise',filter:'bandpass',ff0:rand(600,2200),q:1.6,g:rand(.05,.14),a:.001,d:rand(.012,.04)});}}
 // elicottero più vicino: rotore di coda (ronzio) e turbina (fischio) sopra il battito delle pale
 let hn=null,hd=1e9;for(const h of helis){if(h.dead||h.heli.rpm<=.01)continue;const d=sDist(h.px,h.py,h.pz);if(d<hd){hd=d;hn=h;}}
 const HT=AU.loops.heliT||(hn?(AU.loops.heliT=mkOscLoop('sawtooth',105,'bandpass',420)):null),HW=AU.loops.heliW||(hn?(AU.loops.heliW=mkOscLoop('sine',2600,'bandpass',2600)):null);
 const hk=hn?clamp(1-hd/420,0,1)*hn.heli.rpm:0;if(HT){HT.o.frequency.setTargetAtTime(95+hk*30,t,.3);loopGain(HT,.035*hk,.25);}if(HW)loopGain(HW,.012*hk,.25);}
{const fu1=frameUpdate;frameUpdate=function(dt){fu1(dt);try{vehAudioX(dt);}catch(e){}};}
