/* ======================= PATCH AA — RENDERING SENZA PIXEL NON VALIDI, AUDIO IN BACKGROUND, VENTO E BRUSIO REALISTICI ======================= */
// ogni materiale standard scrive solo colori validi: un NaN o un valore infinito (capita su alcune GPU dei telefoni) non diventa più un punto nero
THREE.ShaderChunk.output_fragment=THREE.ShaderChunk.output_fragment.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
 'outgoingLight=vec3(outgoingLight.r<3e4?max(outgoingLight.r,0.):(outgoingLight.r>=3e4?3e4:0.),outgoingLight.g<3e4?max(outgoingLight.g,0.):(outgoingLight.g>=3e4?3e4:0.),outgoingLight.b<3e4?max(outgoingLight.b,0.):(outgoingLight.b>=3e4?3e4:0.));\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );');

// ---------- audio: muto quando l'app va in background, abbassato con il menu aperto ----------
const AUX={started:false,trT:0,trees:0,rust:null};
function auVis(){if(!AU.ctx)return;const hid=document.visibilityState==='hidden';
 try{if(hid){if(AU.ctx.state==='running')AU.ctx.suspend();if(window.speechSynthesis)speechSynthesis.cancel();}
  else if(AU.ctx.state!=='running'&&AUX.started)AU.ctx.resume();}catch(e){}}
document.addEventListener('visibilitychange',auVis);
window.addEventListener('pagehide',()=>{try{if(AU.ctx&&AU.ctx.state==='running')AU.ctx.suspend();if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}});
window.addEventListener('pageshow',auVis);
{const ai0=audioInit;audioInit=function(){if(document.visibilityState==='hidden')return;ai0();if(AU.ok)AUX.started=true;};}
// con il gioco in pausa (menu) i suoni continui si abbassano invece di restare a pieno volume
setInterval(()=>{if(!AU.ok||document.visibilityState==='hidden')return;if(typeof state!=='undefined'&&state!=='play')AU.master.gain.setTargetAtTime(S.vol*(state==='title'?.5:.15),AU.ctx.currentTime,.12);},200);

// ---------- vento e brusio della città: niente fruscio quando l'aria è ferma ----------
updAudio=function(){if(!AU.ok)return;const ctx=AU.ctx,t=ctx.currentTime,L=ctx.listener,c=camera.position,f=_v3.set(0,0,-1).applyQuaternion(camera.quaternion);
 if(L.positionX){L.positionX.value=c.x;L.positionY.value=c.y;L.positionZ.value=c.z;L.forwardX.value=f.x;L.forwardY.value=f.y;L.forwardZ.value=f.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}else{L.setPosition(c.x,c.y,c.z);L.setOrientation(f.x,f.y,f.z,0,1,0);}
 AU.master.gain.setTargetAtTime(S.vol,t,.06);
 const gy=groundH(c.x,c.z),alt=Math.max(0,c.y-gy),ax=Math.abs(c.x),az=Math.abs(c.z);
 // brusio lontano del traffico: solo dove c'è una città, più forte di giorno, si perde salendo di quota
 let city=0;if(ax<CX+80&&az<CZ+80)city=1;else if(ax>740&&ax<1240&&az<690)city=.6;else if(c.x>1200&&c.x<2320&&c.z>220&&c.z<1560)city=.6;else if(typeof inZone==='function'&&inZone(c.x,c.z,120))city=.3;
 const day=1-.6*(U.uNight?U.uNight.value:0);
 if(AU.loops.hum)loopGain(AU.loops.hum,.05*city*day*clamp(1-alt/420,.06,1),1.5);
 // vento: velocità vera del meteo, riparata tra i palazzi, più forte in quota, a raffiche
 const ws=Math.hypot(WX.wx||0,WX.wz||0);let sh=1;if(city>.5&&alt<45)sh=.42+.58*clamp(alt/45,0,1);else if(alt<3)sh=.8;
 const va=ws*sh*clamp(.75+.3*Math.log10(1+alt/8),.75,1.5),gust=.8+.2*Math.sin(t*.37+Math.sin(t*.11)*3)+.1*Math.sin(t*1.9+1.3),vg=va*gust;
 const wk=sst(5,34,vg);
 if(AU.loops.wind){loopGain(AU.loops.wind,.32*Math.pow(wk,1.7),.4);AU.loops.wind.f.frequency.setTargetAtTime(220+vg*15,t,.35);}
 // fruscio delle foglie solo vicino agli alberi e solo con un po' di vento
 AUX.trT-=1/60;if(AUX.trT<=0){AUX.trT=.5;let n=0;if(alt<30){try{if(typeof treesNear==='function')treesNear(c.x,c.z,(cc,i)=>{if(cc[i+3]>0){const dx=cc[i]-c.x,dz=cc[i+2]-c.z;if(dx*dx+dz*dz<900)n++;}});if(typeof propsNear==='function')propsNear(c.x,c.z,30,it=>{if(it.k&&it.k.name==='tree')n++;});}catch(e){}if(typeof inParkFn==='function'&&inParkFn(c.x,c.z))n+=6;}AUX.trees=Math.min(1,n/10);}
 if(!AUX.rust&&AUX.trees>0)AUX.rust=mkLoop('noise','highpass',2600,.4,false);
 if(AUX.rust)loopGain(AUX.rust,.09*AUX.trees*sst(3,22,vg)*(.7+.3*Math.sin(t*.9+Math.sin(t*.23)*2)),.6);};

// ---------- tsunami: il volume dell'onda è acqua torbida (la superficie da sola lasciava il vuoto sotto) ----------
let TSUIN=false;
function tsuTn1(x){const i=Math.floor(x);let f=x-i;f=f*f*(3-2*f);const h=a=>{const s=Math.sin(a*12.9898)*43758.5453;return s-Math.floor(s);};return h(i)+(h(i+1)-h(i))*f;}
function tsuTop(lu,lw){const u=TSU.m.material.userData.u,brk=u.uBrk.value,TH=u.uTH.value,tt=u.uTt.value,hv=TH*(.8+.4*tsuTn1(lu*.006+tt*.05)),lead=TH*1.4*(tsuTn1(lu*.0035+3)-.5),S=TSUP.S,B=TSUP.B;
 let top=-1e9,px=0,py=0;for(let i=0;i<S.length;i++){const x=(S[i][0]+(B[i][0]-S[i][0])*brk)*hv+lead,y=(S[i][1]+(B[i][1]-S[i][1])*brk)*hv;if(i>0){const a=Math.min(px,x),b=Math.max(px,x);if(lw>=a&&lw<=b&&b-a>1e-4){top=Math.max(top,py+(y-py)*(lw-px)/(x-px));}}px=x;py=y;}return top;}
function tsuInside(){const m=TSU.m;if(!TSU.on||!m||!m.parent)return false;const c=camera.position,R=m.rotation.y,cr=Math.cos(R),sr=Math.sin(R),dx=c.x-m.position.x,dz=c.z-m.position.z,lu=dx*cr-dz*sr,lw=dx*sr+dz*cr;
 if(Math.abs(lu)>850)return false;const top=tsuTop(lu,lw);if(top<-1e8)return false;return c.y<m.position.y+top&&c.y>groundH(c.x,c.z)-.5;}

// ---------- cielo per i riflessi dei vetri (serve dove la mappa ambientale non funziona) ----------
U.uSkyZ={value:new THREE.Color(.11,.21,.45)};U.uSkyH={value:new THREE.Color(.6,.62,.65)};U.uSkyG={value:new THREE.Color(.08,.08,.085)};U.uEnvOK={value:1};
const SKYZ={giorno:[.1,.22,.52],pomeriggio:[.11,.2,.43],tramonto:[.09,.1,.21],notte:[.003,.004,.009]};
function skyReflUpd(){const z=SKYZ[S.tod]||SKYZ.pomeriggio,f=TODC.fog,cl=clamp(WX.cloud||0,0,1),lit=TODC.lit,ov=[.42*lit+.01,.44*lit+.012,.47*lit+.016];
 const hz=[f[0]*1.08,f[1]*1.08,f[2]*1.08];if(TODC.night>.9){hz[0]+=.035;hz[1]+=.026;hz[2]+=.02;}
 U.uSkyZ.value.setRGB(lerp(z[0],ov[0],cl),lerp(z[1],ov[1],cl),lerp(z[2],ov[2],cl));U.uSkyH.value.setRGB(lerp(hz[0],ov[0]*1.1,cl),lerp(hz[1],ov[1]*1.1,cl),lerp(hz[2],ov[2]*1.1,cl));
 U.uSkyG.value.setRGB(.07*lit+.005,.07*lit+.005,.075*lit+.006);U.uEnvOK.value=(scene.environment&&!ENV_BAD)?1:0;}
{const ls0=lightStep;lightStep=function(dt){ls0(dt);skyReflUpd();};}
// test dei riflessi ambientali meno severo: si spegne solo se la sfera di prova non viene proprio disegnata due volte di fila
envSelfTest=function(){const run=()=>{try{const ws=new THREE.Scene();ws.background=new THREE.Color(1,1,1);const wrt=pmrem.fromScene(ws);const r=envOKTest(wrt.texture);wrt.dispose();return r;}catch(e){return {lum:0,bad:99};}};
 const r1=run();if(r1.bad<=8)return;setTimeout(()=>{const r2=run();if(r2.bad>8){ENV_BAD=true;probeOff=true;scene.environment=null;console.warn('Riflessi ambientali non supportati: i vetri usano il cielo calcolato',r1,r2);}},2500);};
// ---------- parametri di luce (soglia del bloom per ora del giorno) ----------
var AAL={th:1.1,th8:.8};
