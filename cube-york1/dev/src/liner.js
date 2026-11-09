/* ======================= AEREI DI LINEA: modelli, cabina di pilotaggio, cabina passeggeri, fisica di volo ======================= */
// tre modelli: bimotore medio (tipo A320), widebody (tipo 787), regionale a turboelica (tipo ATR 72)
const LT={
 n:{name:'Bimotore medio',L:37.6,R:1.98,gearH:3.75,span:35.8,mass:64000,T:3.2,kl:.00165,cd0:5.4e-5,vr:72,vref:69,vmax:240,floor:-1.02,
  st:[[-18.8,.05,-.12,.08,2],[-18.62,.38,-.42,.28,2.1],[-18.2,.82,-.92,.62,2.2],[-17.5,1.25,-1.38,1.05,2.3],[-16.6,1.6,-1.7,1.42,2.3],[-15.6,1.84,-1.88,1.72,2.2],[-14.4,1.96,-1.96,1.92,2.1],[-13,1.98,-1.98,1.98,2],[9,1.98,-1.98,1.98,2],[11,1.9,-1.62,1.98,2.05],[13.4,1.55,-.85,1.96,2.1],[15.6,1.12,-.05,1.9,2.1],[17.4,.66,.62,1.78,2.1],[18.6,.24,1.08,1.6,2.1],[18.8,.08,1.24,1.5,2]],
  wing:[[1.7,-1.3,-4.6,6.6,.15],[6.4,-.88,-2.2,3.9,.13],[17.3,.22,2.75,1.5,.105]],wl:[[17.3,.22,2.75,1.5,.1],[17.6,1.15,3.4,1.15,.09],[17.75,2.45,4.35,.62,.08]],
  stab:[[.4,.95,13.7,3.7,.1],[6.3,1.55,17.1,1.35,.09]],fin:[[1.85,11.2,5.6,.11],[7.85,15.9,1.85,.1]],
  eng:[{x:5.75,y:-2.15,z:-6.1,r:1.08,len:4.3,pyl:[5.75,-1.3,-3.2]}],nose:[-13.6],main:[3.8,.75,.6,0],cock:{z:-15.9,eye:[-.55,.62,-15.95],ws:-17.15},door:[-14.2,-.32],ex:[-1.5,2.2,14.8],
  seats:{xs:[-1.53,-1.06,-.6,.6,1.06,1.53],z0:-11.6,z1:11,p:.79},cols:6},
 w:{name:'Widebody',L:62.8,R:2.9,gearH:5.25,span:60.1,mass:198000,T:3,kl:.0015,cd0:4.6e-5,vr:80,vref:74,vmax:255,floor:-1.55,
  st:[[-31.4,.06,-.16,.1,2],[-31.15,.55,-.62,.42,2.1],[-30.5,1.25,-1.4,.98,2.2],[-29.4,1.9,-2.05,1.62,2.3],[-28,2.42,-2.6,2.2,2.25],[-26.4,2.76,-2.84,2.66,2.15],[-24.6,2.9,-2.9,2.88,2.05],[-22.5,2.92,-2.92,2.92,2],[16,2.92,-2.92,2.92,2],[19.5,2.78,-2.35,2.92,2.05],[23.5,2.25,-1.15,2.86,2.1],[27.2,1.5,.12,2.72,2.1],[30.2,.72,1.3,2.5,2.1],[31.3,.2,1.82,2.3,2.1],[31.4,.08,1.9,2.22,2]],
  wing:[[2.6,-2,-8.6,11.4,.16],[11.5,-1.25,-3.4,6.6,.13],[29.8,1.85,6.6,2.3,.1]],wl:[[29.8,1.85,6.6,2.3,.1],[30.1,2.15,7.5,1.6,.09],[30.25,2.4,8.6,.9,.08]],
  stab:[[.6,1.4,23.5,6.2,.1],[10.4,2.6,29.4,2.1,.09]],fin:[[2.7,19.5,9.4,.11],[12.6,28,3.1,.1]],
  eng:[{x:9.7,y:-2.6,z:-9.8,r:1.72,len:7.1,pyl:[9.7,-1.5,-5.4]}],nose:[-23.2],main:[4.9,2,.66,1],cock:{z:-26.5,eye:[-.62,.98,-26.6],ws:-28.2},door:[-21.6,-.38],ex:[-2.4,2.9,25.2],
  seats:{xs:[-2.38,-1.88,-1.38,-.5,0,.5,1.38,1.88,2.38],z0:-12,z1:21,p:.82,biz:{xs:[-2.1,-1.1,1.1,2.1],z0:-20.5,z1:-13.5,p:1.4}},cols:9},
 r:{name:'Regionale a turboelica',L:27.2,R:1.3,gearH:2.25,span:27,mass:20500,T:2.6,kl:.0029,cd0:8e-5,vr:52,vref:56,vmax:150,floor:-.95,prop:1,
  st:[[-13.6,.05,-.08,.06,2],[-13.45,.32,-.36,.2,2.1],[-13,.68,-.75,.45,2.2],[-12.3,1.02,-1.08,.82,2.3],[-11.4,1.22,-1.26,1.12,2.3],[-10.3,1.3,-1.32,1.28,2.2],[-9,1.32,-1.34,1.34,2.4],[6.8,1.32,-1.34,1.34,2.4],[8.6,1.22,-.95,1.34,2.3],[10.6,.96,-.32,1.32,2.2],[12.4,.6,.28,1.25,2.1],[13.4,.2,.72,1.12,2.1],[13.6,.08,.82,1.06,2]],
  wing:[[.9,1.62,-1.5,2.65,.15],[4.8,1.66,-1.45,2.55,.15],[13.4,1.76,-.85,1.45,.12]],wl:null,hiw:1,
  stab:[[.25,6.25,11.2,1.9,.1],[3.9,6.32,12.1,1.15,.09]],fin:[[1.2,7.4,4.5,.12],[6.15,10.4,2.1,.1]],
  eng:[{x:4.1,y:1.25,z:-3.6,r:.62,len:5.6,pyl:null}],nose:[-10.4],main:[2.05,.55,.42,0],cock:{z:-11.2,eye:[-.42,.48,-11.25],ws:-12.15},door:[-9.3,-.42],ex:[1.15,7.1,-1],
  seats:{xs:[-.86,-.41,.41,.86],z0:-7.9,z1:6.2,p:.78},cols:4}};
// muso realistico (in unità di raggio): radome con la punta sotto l'asse, parabrezza inclinato di circa 50 gradi, poi la sezione piena;
// l'occhio dei piloti sta circa un metro dietro la base del parabrezza, 1,22 m sopra il pavimento della cabina di pilotaggio
const NOSE={dz:[0,.126,.404,.707,.909,1.136,1.414,1.818,2.323,2.929],w:[.025,.253,.48,.631,.717,.798,.869,.939,.985,1],yb:[-.343,-.505,-.682,-.798,-.859,-.904,-.944,-.975,-.995,-1],yt:[-.29,-.15,-.06,-.01,.015,.38,.7,.9,.985,1],n:[2,2.1,2.2,2.3,2.3,2.3,2.25,2.15,2.05,2]};
for(const [tk,lf,ex] of [['n',1,.55],['w',1.05,.62],['r',1,.42]]){const C=LT[tk],R=C.st[C.st.length>8?7:6][1],z0=C.st[0][0],zf=z0+2.929*R*lf,rest=C.st.filter(q=>q[0]>zf+.05);
 C.st=NOSE.dz.map((d,i)=>[z0+d*R*lf,NOSE.w[i]*R,NOSE.yb[i]*R,NOSE.yt[i]*R,NOSE.n[i]]).concat(rest);const ey=.152*R,ez=z0+1.414*R*lf;C.cock={z:ez,eye:[-ex,ey,ez],cf:ey-1.22,ws:ez-1,zj:z0+.909*R*lf};}
const AIRL=[{n:'CUBE YORK',sub:'AIRWAYS',code:'CY',reg:'N-CY',c1:'#0b2a5b',c2:'#d9a52b',belly:'#c9ced4',tail:['#0b2a5b','#123d80'],logo:'cube'},
 {n:'NOVA AIR',sub:'',code:'NV',reg:'N-NV',c1:'#5a1e8c',c2:'#1fc3c9',belly:'#e8e8ec',tail:['#2a0d4a','#1fc3c9'],logo:'star'},
 {n:'ATLANTICA',sub:'',code:'AT',reg:'N-AT',c1:'#c8102e',c2:'#1d3b6e',belly:'#d7d9dc',tail:['#c8102e','#7a0a1c'],logo:'wave'},
 {n:'AURORA',sub:'REGIONAL',code:'AU',reg:'N-AU',c1:'#e06a10',c2:'#26323d',belly:'#ececec',tail:['#e06a10','#f6a623'],logo:'sun'}];
/* ---------- livree disegnate su tela: finestrini forati (si vede dentro), porte, scritte, codice di registrazione ---------- */
const LV={};
function lvTex(tk,al){const key=tk+al;if(LV[key])return LV[key];const C=LT[tk],A=AIRL[al],W=2048,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),z0=C.st[0][0],L=C.L;
 const X=z=>(z-z0)/L*W,Y=u=>u*H;g.fillStyle='#f4f5f6';g.fillRect(0,0,W,H);
 g.fillStyle=A.belly;g.fillRect(0,0,W,Y(.15));g.fillRect(0,Y(.85),W,H-Y(.85));
 // linee decorative sotto i finestrini (entrambi i lati) e fascia sul dorso
 for(const [u0,u1,col] of [[.205,.222,A.c1],[.226,.232,A.c2],[.778,.795,A.c1],[.768,.774,A.c2]]){g.fillStyle=col;g.beginPath();g.moveTo(X(z0+L*.12),Y(u0));g.lineTo(X(z0+L*.98),Y(u0)-(u0<.5?-12:12)*0);g.lineTo(X(z0+L*.98),Y(u1));g.lineTo(X(z0+L*.12),Y(u1));g.fill();}
 const grd=g.createLinearGradient(X(z0+L*.62),0,W,0);grd.addColorStop(0,'rgba(0,0,0,0)');grd.addColorStop(1,A.tail[0]);g.fillStyle=grd;g.fillRect(X(z0+L*.62),Y(.4),W-X(z0+L*.62),Y(.2));
 // pannelli e rivetti appena accennati
 g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=1.2;for(let z=z0+2;z<z0+L;z+=1.6){g.beginPath();g.moveTo(X(z),0);g.lineTo(X(z),H);g.stroke();}for(const u of [.1,.18,.32,.42,.58,.68,.82,.9]){g.beginPath();g.moveTo(0,Y(u));g.lineTo(W,Y(u));g.stroke();}
 // porte: contorno e maniglia
 const doors=[C.door[0],C.door[0]+(tk==='w'?14:tk==='r'?99:99),z0+L*.84];const door=(z,u,w,h)=>{g.strokeStyle='rgba(40,44,50,.75)';g.lineWidth=2.2;const r=8;g.beginPath();g.roundRect?g.roundRect(X(z-w/2),Y(u-h/2),X(z+w/2)-X(z-w/2),Y(u+h/2)-Y(u-h/2),r):g.rect(X(z-w/2),Y(u-h/2),X(z+w/2)-X(z-w/2),Y(u+h/2)-Y(u-h/2));g.stroke();g.fillStyle='rgba(60,64,70,.8)';g.fillRect(X(z+w/2)-14,Y(u),9,3);};
 for(const z of doors)if(z<z0+L-2)for(const u of [.3,.7])door(z,u,.85,.17);
 // finestrini (fori nella pelle: trasparenza)
 const win=[];const wz0=C.seats.z0-.4,wz1=C.seats.z1+.4,pitch=tk==='r'?.75:.53;for(let z=wz0;z<=wz1;z+=pitch){if(doors.some(d=>Math.abs(d-z)<.7))continue;win.push(z);}
 // scritte: lato sinistro normale, lato destro capovolto (si legge sempre dal muso alla coda... come sugli aerei veri)
 const title=(u,flip)=>{g.save();g.translate(X(z0+L*.42),Y(u));g.scale(flip?-1:1,flip?-1:1);g.fillStyle=A.c1;g.font='900 '+Math.round(H*.085)+'px Arial, Helvetica, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(A.n,0,0);
  if(A.sub){g.font='700 '+Math.round(H*.04)+'px Arial';g.fillStyle=A.c2;g.fillText(A.sub,0,H*.07);}g.restore();
  g.save();g.translate(X(z0+L*.87),Y(u<.5?.36:.64));g.scale(flip?-1:1,flip?-1:1);g.fillStyle='#30353b';g.font='700 '+Math.round(H*.035)+'px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(A.reg+(tk==='n'?'320':tk==='w'?'789':'72R'),0,0);g.restore();};
 title(.37,true);title(.63,false);
 // tagli dei finestrini e del parabrezza
 g.globalCompositeOperation='destination-out';g.fillStyle='#000';const wr=(z,u,hw,hh,rf)=>{const x0=X(z-hw),x1=X(z+hw),y0=Y(u-hh),y1=Y(u+hh),r=Math.min(x1-x0,y1-y0)*(rf||.45);g.beginPath();if(g.roundRect)g.roundRect(x0,y0,x1-x0,y1-y0,r);else g.rect(x0,y0,x1-x0,y1-y0);g.fill();};
 const wu=tk==='r'?.035:.03;for(const z of win){wr(z,.25+wu,.13,.024);wr(z,.75-wu,.13,.024);}
 g.globalCompositeOperation='source-over';
 // finestrini della cabina di pilotaggio ritagliati dalla vista dei piloti: ogni bordo giace su un piano che passa per l'occhio,
 // così dal posto di pilotaggio i bordi appaiono diritti (parabrezza, finestrino scorrevole, finestrino posteriore) con il montante centrale
 {const M=lvCockMask(tk);g.globalCompositeOperation='destination-out';g.drawImage(M.c,M.x,0);g.globalCompositeOperation='source-over';}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;LV[key]=t;return t;}
function lvCockMask(tk){const key='cm'+tk;if(LV[key])return LV[key];const C=LT[tk],W=2048,H=512,z0=C.st[0][0],L=C.L,X=z=>(z-z0)/L*W,E=C.cock.eye,st=C.st,zA=E[2]-3.4,zB=E[2]+1.7,xa=Math.max(0,Math.floor(X(zA))),xb=Math.min(W-1,Math.ceil(X(zB))),iw=xb-xa+1;
 const c=document.createElement('canvas');c.width=iw;c.height=H;const mg=c.getContext('2d'),img=mg.createImageData(iw,H),D=img.data;
 const DEG=180/Math.PI;
 const sp=(z,a)=>{let i=0;while(i<st.length-2&&st[i+1][0]<z)i++;const A=st[i],B=st[i+1],t=clamp((z-A[0])/(B[0]-A[0]),0,1),ca=Math.cos(a),sa=Math.sin(a);
  const p=S=>{const e=2/S[4],ym=(S[3]+S[2])/2,hh=(S[3]-S[2])/2;return [Math.sign(ca)*Math.pow(Math.abs(ca),e)*S[1],ym+Math.sign(sa)*Math.pow(Math.abs(sa),e)*hh];};const P=p(A),Q=p(B);return [P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t];};
 const inWin=(z,a)=>{if(z<C.cock.zj-.02)return false;const q=sp(z,a);if(q[1]<E[1]-.95)return false;for(const sd of [-1,1]){if(q[0]*sd<-.14)continue;const dx=(q[0]-(sd<0?E[0]:-E[0]))*(sd<0?1:-1);if(lvWinTest(dx,q[1]-E[1],z-E[2],.015))return true;}return false;};
 const r0=Math.floor(H*.12),r1=Math.ceil(H*.88);
 for(let px=0;px<iw;px++)for(let py=r0;py<r1;py++){let k=0;for(const [ox,oy] of [[.25,.25],[.75,.25],[.25,.75],[.75,.75]])if(inWin(z0+(xa+px+ox)/W*L,-Math.PI/2+(py+oy)/H*TAU))k++;if(k)D[(py*iw+px)*4+3]=k*64-(k===4?1:0);}
 mg.putImageData(img,0,0);LV[key]={c,x:xa};return LV[key];}
const LV_WIN=[[0,-.6,.48,-.36,.45,.12],[-1.0472,-.445,.424,-.344,.364,.15],[-1.8413,-.277,.277,-.268,.213,.15]];// [direzione centrale, u0,u1, w0,w1, inclinazione del bordo superiore]
function lvWinTest(dx,dy,dz,m){for(const w of LV_WIN){const ca=Math.cos(w[0]),sa=Math.sin(w[0]),dc=dx*sa-dz*ca;if(dc<=.01)continue;const u=(dx*ca+dz*sa)/dc,v=dy/dc;if(u>w[1]+m&&u<w[2]-m&&v>w[3]+m&&v<w[4]+w[5]*u-m)return true;}return false;}
function lvNoseMask(tk){const key='nm'+tk;if(LV[key])return LV[key];const C=LT[tk],E=C.cock.eye,st=C.st,zA=st[0][0],zB=C.cock.zB,WZ=1024,HZ=1024,DEG=180/Math.PI;
 const c=document.createElement('canvas');c.width=WZ;c.height=HZ;const g=c.getContext('2d'),img=g.createImageData(WZ,HZ),D=img.data;
 const sp=(z,a)=>{let i=0;while(i<st.length-2&&st[i+1][0]<z)i++;const A=st[i],B=st[i+1],t=clamp((z-A[0])/(B[0]-A[0]),0,1),ca=Math.cos(a),sa=Math.sin(a);
  const p=S=>{const e=2/S[4],ym=(S[3]+S[2])/2,hh=(S[3]-S[2])/2;return [Math.sign(ca)*Math.pow(Math.abs(ca),e)*S[1],ym+Math.sign(sa)*Math.pow(Math.abs(sa),e)*hh];};const P=p(A),Q=p(B);return [P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t];};
 for(let i=0;i<D.length;i+=4){D[i]=D[i+1]=D[i+2]=255;D[i+3]=255;}
 const r0=Math.floor(HZ*.12),r1=Math.ceil(HZ*.88);
 for(let px=0;px<WZ;px++){const z=zA+(px+.5)/WZ*(zB-zA);if(z<C.cock.zj-.02||z>E[2]+1.75)continue;for(let py=r0;py<r1;py++){const a=-Math.PI/2+(py+.5)/HZ*TAU,q=sp(z,a);if(q[1]<E[1]-.95)continue;let cut=false;
   for(const sd of [-1,1]){if(q[0]*sd<-.14)continue;const dx=q[0]-(sd<0?E[0]:-E[0]),dy=q[1]-E[1],dz=z-E[2],az=Math.atan2(dx,-dz)*DEG*(sd<0?1:-1),el=Math.atan2(dy,Math.hypot(dx,dz))*DEG;
    for(const w of LV_WIN)if(az>w[0]&&az<w[1]&&el>w[2]&&el<w[3]){cut=true;break;}if(cut)break;}
   if(cut){const j=(py*WZ+px)*4;D[j]=D[j+1]=D[j+2]=0;}}}
 g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.anisotropy=4;LV[key]=t;return t;}
function lfWinPatch(m,tk,inner){const C=LT[tk],E=C.cock.eye,f=v=>v<0?'('+(+v).toFixed(4)+')':(+v).toFixed(4);const prev=m.onBeforeCompile;
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;');
  let fn='varying vec3 vLP;float winF;\nfloat wTest(vec3 d,float ac,float u0,float u1,float w0,float w1,float k){float ca=cos(ac),sa=sin(ac),dc=d.x*sa-d.z*ca;if(dc<=.01)return 0.;float u=(d.x*ca+d.z*sa)/dc,v=d.y/dc;float e=min(min(u-u0,u1-u),min(v-w0,w1+k*u-v));return e>0.?1.:e>-.038?2.:0.;}\n';
  fn+='float cutWin(vec3 p){if(p.z<'+f(C.cock.zj-.06)+'||p.z>'+f(E[2]+1.85)+'||p.y<'+f(E[1]-1.)+')return 0.;float res=0.;for(int k=0;k<2;k++){float sd=k==0?-1.:1.;if(p.x*sd<-.2)continue;float ex=sd<0.?'+f(E[0])+':'+f(-E[0])+';vec3 d=vec3((p.x-ex)*(sd<0.?1.:-1.),p.y-'+f(E[1])+',p.z-'+f(E[2])+');';
  for(const w of LV_WIN)fn+='{float t=wTest(d,'+w.map(f).join(',')+');if(t>.5&&t<1.5)return 1.;res=max(res,t);}';
  fn+='}return res;}\n';
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+fn).replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nwinF=cutWin(vLP);if(winF>.5&&winF<1.5)discard;')
   .replace('#include <color_fragment>','#include <color_fragment>\nif(winF>1.5)diffuseColor.rgb='+(inner?'vec3(.16,.17,.19)':'vec3(.05,.055,.06)')+';');};
 const k0=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):null;m.customProgramCacheKey=()=>'lfwin'+tk+(inner?'i':'o')+(k0?k0():'');return m;}
function lvFinTex(al){const key='fin'+al;if(LV[key])return LV[key];const A=AIRL[al],c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d');
 const gr=g.createLinearGradient(0,512,512,0);gr.addColorStop(0,A.tail[0]);gr.addColorStop(1,A.tail[1]);g.fillStyle=gr;g.fillRect(0,0,512,512);g.save();g.translate(256,250);
 if(A.logo==='cube'){g.strokeStyle=A.c2;g.lineWidth=18;for(let i=0;i<3;i++){g.rotate(TAU/3);g.beginPath();g.moveTo(0,0);g.lineTo(0,-110);g.lineTo(95,-55);g.lineTo(95,55);g.stroke();}}
 else if(A.logo==='star'){g.fillStyle='#fff';g.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?40:130;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.fill();g.fillStyle=A.c2;g.beginPath();g.arc(0,0,34,0,TAU);g.fill();}
 else if(A.logo==='wave'){g.strokeStyle='#fff';g.lineWidth=22;for(let i=0;i<3;i++){g.beginPath();for(let x=-150;x<=150;x+=10)g.lineTo(x,-60+i*55+Math.sin(x*.03+i)*24);g.stroke();}}
 else{g.fillStyle='#fff';g.beginPath();g.arc(0,40,95,Math.PI,TAU);g.fill();for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;g.fillRect(Math.cos(a)*120-6,40+Math.sin(a)*120-6,12,12);}}
 g.restore();const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;LV[key]=t;return t;}
/* ---------- geometrie ---------- */
// fusoliera a sezioni superellittiche con UV per la livrea (u = giro, v = lunghezza)
function lfFus(st,M,z0,L,sc){const pos=[],uv=[],idx=[],R=M+1;sc=sc||1;
 for(const s of st){const [z,w,yb,yt,n]=s,e=2/n,ym=(yt+yb)/2,hh=(yt-yb)/2*sc;for(let k=0;k<=M;k++){const a=-Math.PI/2+k/M*TAU,ca=Math.cos(a),sa=Math.sin(a);pos.push(Math.sign(ca)*Math.pow(Math.abs(ca),e)*w*sc,ym+Math.sign(sa)*Math.pow(Math.abs(sa),e)*hh,z);uv.push((z-z0)/L,1-k/M);}}
 for(let s=0;s<st.length-1;s++)for(let k=0;k<M;k++){const a=s*R+k,b=a+1,c=a+R,d=c+1;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const N=g.attributes.normal;for(let s=0;s<st.length;s++){const a=s*R,b=s*R+M;for(let j=0;j<3;j++){const v=(N.array[a*3+j]+N.array[b*3+j])/2;N.array[a*3+j]=N.array[b*3+j]=v;}}return g;}
// ala: sezioni [x(apertura), y, z bordo d'attacco, corda, spessore relativo]; specchiata per il lato sinistro
function lfWing(secs,nc,mir){return foil(secs.map(s=>({x:s[0],y:s[1],z:s[2],c:s[3],t:s[4]})),nc,mir);}
function lfFin(secs,nc){// deriva verticale: sezioni [y, z bordo d'attacco, corda, spessore]
 const g=foil(secs.map(s=>({x:s[0],y:0,z:s[1],c:s[2],t:s[3]})),nc,false);const P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i);P.setXYZ(i,y,x,P.getZ(i));}
 const I=g.index.array;for(let i=0;i<I.length;i+=3){const t=I[i+1];I[i+1]=I[i+2];I[i+2]=t;}g.computeVertexNormals();g.computeBoundingBox();const bb=g.boundingBox,U=g.attributes.uv;
 for(let i=0;i<P.count;i++)U.setXY(i,(P.getZ(i)-bb.min.z)/(bb.max.z-bb.min.z),(P.getY(i)-bb.min.y)/(bb.max.y-bb.min.y));return g;}
// gondola del motore (presa d'aria, carenatura, ugello) per rivoluzione
function lfNac(r,len){const P=[[r*.86,0],[r*.98,.04],[r,.16],[r*.99,.45],[r*.93,.72],[r*.8,.92],[r*.66,1]].map(p=>new THREE.Vector2(p[0],p[1]*len));return new THREE.LatheGeometry(P,32).rotateX(Math.PI/2).translate(0,0,-len/2);}
// maschera dei fori (finestrini e parabrezza) per il rivestimento interno della cabina
function lvHoles(tk){const key='h'+tk;if(LV[key])return LV[key];const src=lvTex(tk,0).image,c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
 g.globalCompositeOperation='destination-in';g.drawImage(src,0,0);g.globalCompositeOperation='destination-over';g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);const t=new THREE.CanvasTexture(c);LV[key]=t;return t;}
/* ---------- materiali condivisi ---------- */
const LM={};
function lmats(){if(LM.ok)return LM;LM.ok=true;LM.wing=new THREE.MeshPhysicalMaterial({color:lc(0xd5d9de),roughness:.38,metalness:.35,clearcoat:.4,clearcoatRoughness:.3});LM.dk=MS(0x2c3036,.55,.6);LM.ch=MS(0xd8dbde,.22,.95);LM.tire=MS(0x141414,.92,0);
 LM.eng=new THREE.MeshPhysicalMaterial({color:lc(0xe9ecef),roughness:.3,metalness:.3,clearcoat:.7,clearcoatRoughness:.15});LM.inl=MS(0xb7bcc2,.25,.95);LM.fan=MS(0x3b4047,.35,.85);LM.noz=MS(0x55595e,.45,.8);
 LM.glass=new THREE.MeshPhysicalMaterial({color:lc(0x1a2a33),roughness:.03,metalness:.4,transparent:true,opacity:.36,depthWrite:false,clearcoat:1,side:THREE.DoubleSide});
 LM.cabin=new THREE.MeshStandardMaterial({color:lc(0xe6e1d6),roughness:.7,metalness:0,side:THREE.BackSide,alphaTest:.5,emissive:lc(0xffe7c2),emissiveIntensity:.05});
 LM.seat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:.05});LM.pax=new THREE.MeshStandardMaterial({roughness:.75});LM.hair=new THREE.MeshStandardMaterial({roughness:.6,metalness:.05});LM.int=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.15});
 LM.emi=new THREE.MeshBasicMaterial({vertexColors:true});LM.lt=[];for(const c of [[3,.15,.1],[.15,3,.5],[3,3,3],[4,.2,.1]])LM.lt.push(new THREE.MeshBasicMaterial({color:new THREE.Color(c[0],c[1],c[2])}));
 LM.scr=lfScreens();return LM;}
// schermi della cabina di pilotaggio: statici per gli aerei degli altri, dinamici per quello che piloti
function lfScreens(){const mk=(draw)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');draw(g);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(1.3,1.3,1.3)});};
 const pfd=mk(g=>{g.fillStyle='#2a6fb8';g.fillRect(0,0,256,128);g.fillStyle='#7a4a24';g.fillRect(0,128,256,128);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(0,128);g.lineTo(256,128);g.stroke();g.fillStyle='#111';g.fillRect(0,0,44,256);g.fillRect(212,0,44,256);g.strokeStyle='#ff0';g.lineWidth=5;g.beginPath();g.moveTo(80,128);g.lineTo(115,128);g.moveTo(141,128);g.lineTo(176,128);g.stroke();});
 const nd=mk(g=>{g.fillStyle='#050608';g.fillRect(0,0,256,256);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(128,190,110,Math.PI*1.15,Math.PI*1.85);g.stroke();g.strokeStyle='#e040e0';g.beginPath();g.moveTo(128,190);g.lineTo(150,40);g.stroke();g.fillStyle='#ff0';g.fillRect(122,184,12,12);});
 const ec=mk(g=>{g.fillStyle='#050608';g.fillRect(0,0,256,256);g.strokeStyle='#3f3';g.lineWidth=4;for(const x of [70,186]){g.beginPath();g.arc(x,70,40,Math.PI*.8,Math.PI*2.1);g.stroke();}g.fillStyle='#3f3';g.font='bold 20px monospace';g.fillText('N1',112,140);});
 const oh=mk(g=>{g.fillStyle='#3a3f45';g.fillRect(0,0,256,256);for(let y=8;y<256;y+=18)for(let x=8;x<256;x+=22){g.fillStyle=Math.random()<.15?'#3cf':(Math.random()<.1?'#fb3':'#1a1d21');g.fillRect(x,y,14,9);}});
 return {pfd,nd,ec,oh};}
/* ---------- costruzione del modello completo ---------- */
const LGEO={};
function lfGeos(tk){if(LGEO[tk])return LGEO[tk];const C=LT[tk],z0=C.st[0][0],G={};
 G.skin=lfFus(C.st,48,z0,C.L);{let iS=C.st.findIndex(q=>q[0]>C.cock.eye[2]+1.8);if(iS<2)iS=C.st.length-1;C.cock.zB=C.st[iS][0];G.liner=lfFus(C.st.slice(iS),40,z0,C.L,.965);G.linN=lfFus(C.st.slice(0,iS+1),56,z0,C.L,.965);const U=G.linN.attributes.uv,P=G.linN.attributes.position;for(let i=0;i<U.count;i++)U.setX(i,(P.getZ(i)-z0)/(C.cock.zB-z0));U.needsUpdate=true;}
 G.ws=lfFus(C.st.filter(s=>s[0]<=C.cock.eye[2]+2.6),40,z0,C.L,.99);
 G.wR=lfWing(C.wing,26,false);G.wL=lfWing(C.wing,26,true);if(C.wl){G.wlR=lfWing(C.wl,14,false);G.wlL=lfWing(C.wl,14,true);}
 G.sR=lfWing(C.stab,16,false);G.sL=lfWing(C.stab,16,true);G.fin=lfFin(C.fin,18);
 // superfici mobili: flap interni ed esterni, alettoni (bordo d'uscita)
 const te=x=>{const W=C.wing;for(let i=0;i<W.length-1;i++){const a=W[i],b=W[i+1];if(x<=b[0]){const k=(x-a[0])/(b[0]-a[0]);return [lerp(a[1],b[1],k),lerp(a[2]+a[3],b[2]+b[3],k),lerp(a[3],b[3],k)];}}const l=W[W.length-1];return [l[1],l[2]+l[3],l[3]];};
 const strip=(xa,xb,f)=>{const A=te(xa),B=te(xb);return [[xa,A[0]-.02,A[1]-A[2]*f*.55,A[2]*f,.07],[xb,B[0]-.02,B[1]-B[2]*f*.55,B[2]*f,.07]];};
 const W0=C.wing[0][0],Wk=C.wing[1][0],Wt=C.wing[C.wing.length-1][0];G.cs=[];
 for(const [xa,xb,k,f] of [[W0+.2,Wk,'flap',.3],[Wk+.1,W0+(Wt-W0)*.72,'flap',.28],[W0+(Wt-W0)*.73,W0+(Wt-W0)*.93,'ail',.26]]){const s=strip(xa,xb,f);G.cs.push({k,R:lfWing(s,10,false),L:lfWing(s,10,true),a:[xa,s[0][1],s[0][2]],b:[xb,s[1][1],s[1][2]]});}
 const stb=C.stab,es=[[stb[0][0]+.2,stb[0][1],stb[0][2]+stb[0][3]*.72,stb[0][3]*.32,.06],[stb[1][0]-.1,stb[1][1],stb[1][2]+stb[1][3]*.72,stb[1][3]*.32,.06]];G.elev={R:lfWing(es,10,false),L:lfWing(es,10,true)};
 const fn=C.fin;G.rud=lfFin([[fn[0][0]+.3,fn[0][1]+fn[0][2]*.7,fn[0][2]*.33,.06],[fn[1][0]-.2,fn[1][1]+fn[1][2]*.7,fn[1][2]*.33,.06]],10);
 // motori
 const E=C.eng[0];if(C.prop){G.nac=new THREE.LatheGeometry([[0,0],[E.r*.55,.05],[E.r*.85,.18],[E.r,.4],[E.r*.95,.7],[E.r*.55,.95],[E.r*.2,1]].map(p=>new THREE.Vector2(p[0],p[1]*E.len)),24).rotateX(Math.PI/2).translate(0,0,-E.len*.35);
  G.spin=new THREE.ConeGeometry(.32,.9,18).rotateX(-Math.PI/2);const bl=[];for(let i=0;i<6;i++)bl.push(new THREE.BoxGeometry(.2,1.95,.05).translate(0,1.05,0).rotateY(.35).rotateZ(i/6*TAU));G.blades=mergeGeos(bl);G.disc=new THREE.CircleGeometry(1.98,32);}
 else{G.nac=lfNac(E.r,E.len);G.inl=new THREE.CylinderGeometry(E.r*.86,E.r*.86,.25,32,1,true).rotateX(Math.PI/2);G.fanD=new THREE.CircleGeometry(E.r*.84,32).rotateY(Math.PI);
  const bl=[];const nb=tk==='w'?18:22;for(let i=0;i<nb;i++)bl.push(new THREE.BoxGeometry(.06,E.r*.62,.22).translate(0,E.r*.48,0).rotateY(.5).rotateZ(i/nb*TAU));G.blades=mergeGeos(bl);
  G.spin=new THREE.ConeGeometry(E.r*.24,E.r*.62,20).rotateX(-Math.PI/2);G.core=new THREE.ConeGeometry(E.r*.38,E.r*.9,20).rotateX(Math.PI/2);G.pyl=new THREE.BoxGeometry(.38,1,1);}
 LGEO[tk]=G;return G;}
function mkLiner(tk,al){const C=LT[tk],G=lfGeos(tk),M=lmats(),g=new THREE.Group();
 const skinM=lfWinPatch(new THREE.MeshPhysicalMaterial({map:lvTex(tk,al),alphaTest:.5,roughness:.3,metalness:.22,clearcoat:.75,clearcoatRoughness:.12}),tk);
 const finM=new THREE.MeshPhysicalMaterial({map:lvFinTex(al),roughness:.32,metalness:.2,clearcoat:.7,clearcoatRoughness:.15,side:THREE.DoubleSide});
 const add=(geo,mat,x,y,z,sh)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=sh!==false;m.receiveShadow=true;g.add(m);return m;};
 add(G.skin,skinM);const linM=M.cabin.clone();linM.alphaMap=lvHoles(tk);const lin=add(G.liner,linM,0,0,0,false);const linNM=lfWinPatch(M.cabin.clone(),tk,true);linNM.color=lc(0xc2c8cf);const linN=add(G.linN,linNM,0,0,0,false);const far=[lin,linN,add(G.ws,M.glass,0,0,0,false)];
 // patch Z: ali, piani di coda e piloni (stesso materiale) uniti in un solo pezzo per tipo d'aereo; alette d'estremità unite: molte meno chiamate di disegno
 const E0=C.eng[0];if(!G.wingM){const parts=[G.wR,G.wL,G.sR,G.sL];if(!C.prop)for(const sd of [1,-1])parts.push(G.pyl.clone().scale(1,Math.abs(E0.pyl[1]-E0.y)+.4,E0.len*.8).translate(E0.x*sd,(E0.y+E0.pyl[1])/2+.3,(E0.z+E0.pyl[2])/2+.4));G.wingM=mergeGeos(parts);if(G.wlR)G.wlM=mergeGeos([G.wlR,G.wlL]);}
 add(G.wingM,M.wing);if(G.wlM){const wlM=new THREE.MeshPhysicalMaterial({color:lc(AIRL[al].tail[0]),roughness:.35,metalness:.25,clearcoat:.6});add(G.wlM,wlM);}
 add(G.fin,finM);const mid=[];
 const cs=[];for(const s of G.cs)for(const sd of [1,-1]){const a=[s.a[0]*sd,s.a[1],s.a[2]],b=[s.b[0]*sd,s.b[1],s.b[2]];cs.push({k:s.k,r:hinge(g,sd>0?s.R:s.L,M.wing,a,b),s:sd});}
 {const st=C.stab;for(const sd of [1,-1])cs.push({k:'elev',r:hinge(g,sd>0?G.elev.R:G.elev.L,M.wing,[st[0][0]*sd,st[0][1],st[0][2]+st[0][3]*.72],[st[1][0]*sd,st[1][1],st[1][2]+st[1][3]*.72]),s:sd});}
 {const fn=C.fin;cs.push({k:'rud',r:hinge(g,G.rud,finM,[0,fn[0][0],fn[0][1]+fn[0][2]*.7],[0,fn[1][0],fn[1][1]+fn[1][2]*.7]),s:1});}
 const fans=[],E=C.eng[0];
 for(const sd of [1,-1]){const x=E.x*sd;
  if(C.prop){add(G.nac,M.eng,x,E.y,E.z);const pg=new THREE.Group();pg.position.set(x,E.y,E.z-E.len*.36);g.add(pg);const sp=new THREE.Mesh(G.spin,M.eng);sp.position.z=-.35;pg.add(sp);const bl=new THREE.Mesh(G.blades,M.fan);bl.castShadow=true;pg.add(bl);
   const disc=new THREE.Mesh(G.disc,new THREE.MeshBasicMaterial({color:0x202020,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));disc.position.z=.02;pg.add(disc);fans.push({g:pg,bl,disc,prop:true});}
  else{add(G.nac,M.eng,x,E.y,E.z);mid.push(add(G.inl,M.inl,x,E.y,E.z-E.len/2+.13,false));const fg=new THREE.Group();fg.position.set(x,E.y,E.z-E.len/2+.45);g.add(fg);fg.add(new THREE.Mesh(G.fanD,M.fan));const bl=new THREE.Mesh(G.blades,M.fan);bl.position.z=-.05;fg.add(bl);const sp=new THREE.Mesh(G.spin,M.ch);sp.position.z=-.3;fg.add(sp);fans.push({g:fg,bl});
   mid.push(add(G.core,M.noz,x,E.y,E.z+E.len/2+E.r*.3,false));}}
 const legs=[[0,C.nose[0],tk==='r'?.3:.37,1,0]];for(const sd of [1,-1])legs.push([C.main[0]*sd,C.main[1],C.main[2],C.main[3]?0:1,C.main[3]]);
 const gear=gear2(g,legs,C.gearH,M.wing);
 // patch Z: carrello visto da lontano in un solo pezzo (colori nei vertici), quello dettagliato solo da vicino
 const gearN=gear.children.filter(o=>o.isMesh);if(!G.gearF){const parts=[];for(const m of gearN){const q=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();m.updateMatrix();q.applyMatrix4(m.matrix);const c=m.material.color,n=q.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}q.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(q);}G.gearF=mergeGeos(parts);}
 const gearF=new THREE.Mesh(G.gearF,LM.gearF||(LM.gearF=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.45})));gearF.castShadow=gearF.receiveShadow=true;gearF.visible=false;gear.add(gearF);
 const W=C.wing[C.wing.length-1],lt=(m,x,y,z,r)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(r||.12,8,6),m);s.position.set(x,y,z);g.add(s);return s;},tl=C.st[C.st.length-1];
 const L={nav:[lt(M.lt[0],-W[0]-.1,W[1]+.08,W[2]+.3),lt(M.lt[1],W[0]+.1,W[1]+.08,W[2]+.3),lt(M.lt[2],0,tl[2]+.25,tl[0]+.1,.09)],
  str:[lt(M.lt[2],-W[0]-.12,W[1]+.05,W[2]+.8,.16),lt(M.lt[2],W[0]+.12,W[1]+.05,W[2]+.8,.16)],bcn:[lt(M.lt[3],0,C.R+.06,-2,.16),lt(M.lt[3],0,-C.R-.06,1,.16)],
  land:[lt(M.lt[2],-C.wing[0][0]-.5,C.wing[0][1]-.15,C.wing[0][2]+.3,.2),lt(M.lt[2],C.wing[0][0]+.5,C.wing[0][1]-.15,C.wing[0][2]+.3,.2)]};
 const beams=[];for(const s of L.land){const cone=new THREE.Mesh(new THREE.ConeGeometry(7,110,20,1,true).translate(0,-55,0).rotateX(-Math.PI/2+.06),new THREE.MeshBasicMaterial({color:new THREE.Color(.45,.43,.38),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));cone.position.copy(s.position);g.add(cone);beams.push(cone);}
 const cock=lfCockpit(tk,g),cab=lfCabin(tk,g,al);
 // dettagli che si vedono solo da vicino (superfici mobili, ventole ed eliche, prese d'aria, ugelli): niente ombre, spariscono oltre i 150 m
 for(const c of cs)mid.push(c.r);for(const f of fans)mid.push(f.g);for(const o of mid)o.traverse(q=>{if(q.isMesh)q.castShadow=false;});
 for(const l of L.nav)l.visible=false;
 return {g,C,tk,al,skinM,cs,fans,gear,gearN,gearF,L,beams,cock,cab,lin,linN,far,mid,isFar:false,midV:true,gearH:C.gearH,size:C.L};}
/* ---------- cabina di pilotaggio: pannelli, schermi, sedili e due piloti in divisa ---------- */
function lfPilot(B,x,y,z,cap){const C=(g,c)=>colorize(g,c[0],c[1],c[2]);const sk=[.78,.6,.48],sh=[.95,.96,.97],tr=[.08,.09,.11],gold=[.85,.68,.2],hs=[.15,.15,.16];
 B.add(C(rboxGeo(.44,.56,.27,.09,1),sh),x,y+.72,z);B.add(C(new THREE.BoxGeometry(.06,.36,.02),tr),x,y+.72,z-.14);
 for(const s of[-1,1]){B.add(C(new THREE.BoxGeometry(.11,.025,.16),tr),x+s*.17,y+.99,z);for(let k=0;k<(cap?4:3);k++)B.add(C(new THREE.BoxGeometry(.11,.006,.02),gold),x+s*.17,y+1.004,z-.06+k*.035);}
 B.add(C(new THREE.CylinderGeometry(.055,.06,.1,10),sk),x,y+1.04,z);B.add(C(new THREE.SphereGeometry(.12,14,10).scale(1,1.12,1.05),sk),x,y+1.2,z-.01);B.add(C(new THREE.SphereGeometry(.125,14,8,0,TAU,0,1.45).scale(1,1.1,1.07),cap?[.32,.32,.33]:[.24,.16,.1]),x,y+1.23,z+.012);
 B.add(C(new THREE.TorusGeometry(.13,.015,6,16,Math.PI),hs),x,y+1.24,z+.01,0,Math.PI/2,0);for(const s of[-1,1])B.add(C(new THREE.CylinderGeometry(.055,.055,.04,12).rotateZ(Math.PI/2),hs),x+s*.125,y+1.19,z);B.add(C(new THREE.CylinderGeometry(.008,.008,.16,6).rotateX(Math.PI/2.4),hs),x-.1,y+1.13,z-.08);
 for(const s of[-1,1]){B.add(C(new THREE.CylinderGeometry(.05,.045,.3,8),sh),x+s*.25,y+.78,z-.06,.5,0,s*.1);B.add(C(new THREE.CylinderGeometry(.04,.035,.28,8),sh),x+s*.27,y+.6,z-.24,1.2,0,0);B.add(C(new THREE.BoxGeometry(.07,.06,.1),sk),x+s*.27,y+.56,z-.38);
  B.add(C(new THREE.CylinderGeometry(.075,.07,.44,8),tr),x+s*.11,y+.44,z-.2,Math.PI/2,0,0);B.add(C(new THREE.CylinderGeometry(.06,.055,.45,8),tr),x+s*.11,y+.2,z-.43);B.add(C(new THREE.BoxGeometry(.1,.07,.24),[.05,.05,.05]),x+s*.11,y,z-.5);}}
const _bzM=new THREE.MeshStandardMaterial({color:0x0b0c0e,roughness:.5,metalness:.2});function B2frame(g,x,y,z,s){const m=new THREE.Mesh(new THREE.PlaneGeometry(s+.035,s+.035),_bzM);m.position.set(x,y,z-.0015);g.add(m);}
function lfCockpit(tk,parent){const C=LT[tk],k=C.cock,E=k.eye,g=new THREE.Group();parent.add(g);let capt=null;const B=Bin(),col=(geo,c)=>colorize(geo,c[0],c[1],c[2]);
 const fy=k.cf,ez=E[2],ey=E[1],sx=Math.abs(E[0]),pn=[.2,.22,.25],dk=[.07,.075,.08],sg=[.33,.35,.38],wall=[.62,.62,.6];
 // mezza larghezza interna della fusoliera alla coordinata z e alla quota y (superellisse interpolata tra le stazioni)
 const hw=(z,y)=>{const st=C.st;let i=0;while(i<st.length-2&&st[i+1][0]<z)i++;const A=st[i],Q=st[i+1],t=clamp((z-A[0])/(Q[0]-A[0]),0,1),w=lerp(A[1],Q[1],t),yb=lerp(A[2],Q[2],t),yt=lerp(A[3],Q[3],t),n=lerp(A[4],Q[4],t),ym=(yt+yb)/2,hh=(yt-yb)/2,q=clamp(Math.abs(y-ym)/hh,0,1);return w*Math.pow(1-Math.pow(q,n),1/n)*.96;};
 const zb=ez+1.55;// paratia
 B.add(col(new THREE.BoxGeometry(hw(ez,fy+.1)*2,.06,zb-(ez-1.35)),[.15,.16,.18]),0,fy,(zb+ez-1.35)/2);
 if(fy>C.floor+.08){const h=fy-C.floor;B.add(col(new THREE.BoxGeometry(.9,h,.32),[.25,.26,.28]),0,C.floor+h/2,zb+.2);B.add(col(new THREE.BoxGeometry(.9,h*.5,.32),[.25,.26,.28]),0,C.floor+h*.25,zb+.52);}
 // cruscotto principale, schermo antiriflesso con il pannello dell'autopilota, piedistallo con le manette, pannello superiore
 const pw=Math.min(hw(ez-1,ey-.4),1.5);B.add(col(new THREE.BoxGeometry(pw*2,.54,.45),pn),0,ey-.43,ez-1);B.add(col(new THREE.BoxGeometry(pw*2.02,.08,.6),[.11,.12,.13]),0,ey-.16,ez-1.08);
 B.add(col(new THREE.BoxGeometry(.95,.09,.1),sg),0,ey-.17,ez-.76);for(let i=0;i<8;i++)B.add(col(new THREE.BoxGeometry(.05,.03,.02),i%3?[.9,.9,.85]:[.2,.9,.4]),-.35+i*.1,ey-.16,ez-.705);
 B.add(col(new THREE.BoxGeometry(.46,ey-.72-fy,1.15),pn),0,(ey-.72+fy)/2,ez-.38);for(const s2 of[-1,1]){B.add(col(new THREE.BoxGeometry(.05,.14,.05),[.75,.76,.78]),s2*.07,ey-.62,ez-.52,-.35,0,0);B.add(col(new THREE.BoxGeometry(.09,.03,.05),[.15,.15,.16]),s2*.07,ey-.55,ez-.55);}
 B.add(col(new THREE.BoxGeometry(.3,.02,.2),[.05,.05,.06]),0,ey-.715,ez-.2);
 const oy=Math.min(ey+.62,ey+hw(ez,ey+.6)*.0+.62);B.add(col(new THREE.BoxGeometry(Math.min(.95,hw(ez,oy)*1.5),.08,1.15),pn),0,oy,ez-.15,.22,0,0);
 // paratia con porta aperta verso la cabina passeggeri
 {const bw2=hw(zb,fy+1),bw=Math.max(.3,bw2-.42);for(const s2 of[-1,1])B.add(col(new THREE.BoxGeometry(bw,2.3,.12),wall),s2*(.42+bw/2),fy+1.15,zb);B.add(col(new THREE.BoxGeometry(.84,.3,.12),wall),0,fy+2.15,zb);
  B.add(col(new THREE.BoxGeometry(.05,1.95,.8),[.5,.5,.49]),.42,fy+.98,zb-.44);B.add(col(new THREE.BoxGeometry(.03,.12,.05),[.75,.75,.73]),.39,fy+1.02,zb-.72);}
 for(const s2 of[-1,1]){const x=s2*sx,pz=ez+.02;
  B.add(col(rboxGeo(.5,.12,.5,.04,1),dk),x,fy+.42,pz-.04);B.add(col(rboxGeo(.5,.8,.1,.04,1),dk),x,fy+.85,pz+.25,-.12,0,0);B.add(col(new THREE.CylinderGeometry(.05,.07,.38,8),sg),x,fy+.19,pz);
  for(const s3 of[-1,1])B.add(col(new THREE.BoxGeometry(.05,.24,.28),dk),x+s3*.28,fy+.6,pz-.02);
  for(const s3 of[-1,1])B.add(col(new THREE.BoxGeometry(.08,.03,.2),[.2,.2,.21]),x+s3*.12,fy+.13,ez-.62,-.5,0,0);
  if(tk==='n'){const cx=x+s2*.42,cw=Math.max(.12,Math.min(.24,hw(ez-.2,fy+.7)-Math.abs(x)-.3));B.add(col(new THREE.BoxGeometry(cw,.08,.55),pn),x+s2*(.3+cw/2),fy+.66,ez-.18);B.add(col(new THREE.CylinderGeometry(.018,.024,.17,8),dk),x+s2*(.3+cw/2),fy+.78,ez-.24,-.15,0,0);B.add(col(new THREE.SphereGeometry(.03,8,6),dk),x+s2*(.3+cw/2),fy+.87,ez-.26);}
  else{B.add(col(new THREE.CylinderGeometry(.03,.03,ey-.48-fy,8),sg),x,(ey-.48+fy)/2,ez-.66);B.add(col(new THREE.BoxGeometry(.32,.05,.05),dk),x,ey-.45,ez-.62);for(const s3 of[-1,1])B.add(col(new THREE.BoxGeometry(.05,.11,.05),dk),x+s3*.15,ey-.41,ez-.62);}
  if(s2<0){const B2=Bin();lfPilot(B2,x,fy+.02,pz,true);capt=new THREE.Mesh(mergeBin(B2),lmats().int);capt.castShadow=true;g.add(capt);}else lfPilot(B,x,fy+.02,pz,false);}
 const mesh=new THREE.Mesh(mergeBin(B),lmats().int);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
 const M=lmats().scr,scr=[];const sp=(mat,x,y,z,w2,h2,ry,rx)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w2,h2),mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0,'YXZ');g.add(m);scr.push(m);return m;};
 const py=ey-.42,pz=ez-.768,sz=tk==='w'?.24:.2;for(const s2 of[-1,1]){sp(M.pfd,s2*(sx+.23),py,pz,sz,sz,0,0);sp(M.nd,s2*(sx-.02),py,pz,sz,sz,0,0);}sp(M.ec,0,py+.08,pz,sz,sz,0,0);sp(M.ec,0,py-.15,pz,sz*.9,sz*.9,0,0);
 for(const s2 of[-1,1])for(const x of [s2*(sx+.23),s2*(sx-.02)])B2frame(g,x,py,pz+.001,sz);B2frame(g,0,py+.08,pz+.001,sz);B2frame(g,0,py-.15,pz+.001,sz*.9);
 const oh=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(.9,hw(ez,oy)*1.4),1.1),M.oh);oh.position.set(0,oy-.045,ez-.15);oh.rotation.set(Math.PI/2+.22,0,0);g.add(oh);
 return {g,scr,mesh,capt};}
/* ---------- cabina passeggeri: pavimento, cappelliere, luci, sedili e passeggeri istanziati, cucine, equipaggio ---------- */
const LCAB={};
function lfCabinGeos(tk){if(LCAB[tk])return LCAB[tk];const col=(g,c)=>colorize(g,c[0],c[1],c[2]),S=Bin();const sc=tk==='w'?[.12,.2,.38]:tk==='r'?[.32,.08,.1]:[.1,.16,.34];
 S.add(col(rboxGeo(.44,.12,.46,.04,1),sc),0,.45,0);S.add(col(rboxGeo(.44,.66,.1,.04,1),sc),0,.8,.24,-.1,0,0);S.add(col(new THREE.BoxGeometry(.4,.16,.11),[.92,.92,.9]),0,1.1,.27,-.1,0,0);S.add(col(new THREE.BoxGeometry(.05,.2,.4),[.4,.41,.43]),.24,.58,0);S.add(col(new THREE.BoxGeometry(.06,.4,.06),[.3,.3,.32]),0,.2,0);
 S.add(col(new THREE.BoxGeometry(.25,.16,.012),[.05,.06,.08]),0,.98,.296,-.1,0,0);S.add(col(new THREE.BoxGeometry(.36,.2,.02),[.3,.31,.33]),0,.66,.3,-.1,0,0);
 const P=Bin();P.add(rboxGeo(.36,.16,.3,.06,1),0,.56,.04);P.add(rboxGeo(.38,.44,.22,.08,1),0,.82,.1,-.08,0,0);P.add(rboxGeo(.43,.11,.22,.05,1),0,1,.115,-.08,0,0);
 for(const sd of[-1,1]){P.add(new THREE.CylinderGeometry(.055,.05,.3,7),sd*.225,.86,.1,.18,0,sd*.06);P.add(new THREE.CylinderGeometry(.047,.04,.27,7),sd*.235,.69,-.075,1.3,0,0);
  P.add(new THREE.CylinderGeometry(.078,.066,.42,8),sd*.095,.53,-.15,Math.PI/2,0,0);P.add(new THREE.CylinderGeometry(.06,.05,.42,7),sd*.095,.28,-.37);P.add(rboxGeo(.1,.07,.24,.03,1),sd*.095,.05,-.42);}
 const H=Bin();H.add(new THREE.CylinderGeometry(.05,.055,.1,7,1,true),0,1.09,.1);H.add(new THREE.SphereGeometry(.1,11,8).scale(.92,1.12,1.02),0,1.23,.09);H.add(new THREE.BoxGeometry(.028,.05,.04),0,1.215,-.005);
 for(const sd of[-1,1]){H.add(new THREE.SphereGeometry(.022,5,4).scale(.6,1,1),sd*.093,1.23,.1);H.add(new THREE.SphereGeometry(.045,6,5).scale(.9,.7,1.3),sd*.235,.645,-.23);}
 const Hr=Bin();Hr.add(new THREE.SphereGeometry(.106,11,5,0,TAU,0,1.2).scale(.94,1.1,1.05),0,1.245,.1);Hr.add(new THREE.SphereGeometry(.104,8,4,0,Math.PI,.9,1.1).scale(.94,1.1,1.05),0,1.24,.1);
 LCAB[tk]={seat:mergeBin(S),pax:mergeBin(P),skin:mergeBin(H),hair:mergeBin(Hr)};return LCAB[tk];}
function lfCabin(tk,parent,al){const C=LT[tk],G=lfCabinGeos(tk),g=new THREE.Group();parent.add(g);const B=Bin(),E=Bin(),col=(geo,c)=>colorize(geo,c[0],c[1],c[2]),fy=C.floor,s=C.seats,sA=s.biz?Math.min(s.z0,s.biz.z0):s.z0,len=s.z1-sA+3,zc=(sA+s.z1)/2,w=C.R*.92;
 const B0=C.st.reduce((a,q)=>q[1]>a[1]?q:a),hwY=y=>{const ym=(B0[3]+B0[2])/2,hh=(B0[3]-B0[2])/2,q=Math.min(1,Math.abs(y-ym)/hh);return B0[1]*Math.pow(1-Math.pow(q,B0[4]),1/B0[4]);};B.add(col(new THREE.BoxGeometry(hwY(fy)*1.94,.08,len+4),[.28,.3,.36]),0,fy,zc);B.add(col(new THREE.BoxGeometry(.5,.01,len+4),[.5,.12,.12]),0,fy+.045,zc);
 const by=C.R*.42,bx=C.R*.72;for(const sd of[-1,1]){B.add(col(new THREE.BoxGeometry(.62,.42,len),[.88,.88,.86]),sd*bx,by,zc);B.add(col(new THREE.BoxGeometry(.08,.03,len),[.3,.3,.32]),sd*(bx-.3),by-.2,zc);}
 if(tk==='w')for(const sd of[-1,1])B.add(col(new THREE.BoxGeometry(.7,.4,len*.8),[.88,.88,.86]),sd*.95,by+.25,zc);
 B.add(col(new THREE.BoxGeometry(w*1.2,.04,len),[.92,.92,.9]),0,C.R*.72,zc);E.add(col(new THREE.BoxGeometry(.12,.02,len),[1,.93,.8]),-w*.5,C.R*.7,zc);E.add(col(new THREE.BoxGeometry(.12,.02,len),[1,.93,.8]),w*.5,C.R*.7,zc);
 for(const [z,fr] of [[sA-1.8,1],[s.z1+1.8,0]]){const gw=fr?w*.7:w*1.4,gx=fr?w*.47:0;B.add(col(new THREE.BoxGeometry(gw,C.R*1.2,.9),[.75,.76,.77]),gx,fy+C.R*.6,z);B.add(col(new THREE.BoxGeometry(gw*.86,.04,.92),[.4,.41,.43]),gx,fy+1.02,z);for(let k=0;k<3;k++)B.add(col(new THREE.BoxGeometry(gw*.26,.34,.02),[.62,.63,.65]),gx-gw*.3+k*gw*.3,fy+.55,z+(fr?.46:-.46));}
 const crew=al===0?[.05,.12,.3]:al===1?[.3,.1,.42]:[.35,.08,.12];
 for(const [z,x] of [[C.door[0]+1.15,-C.R*.5],[s.z1+1.1,.62]]){const U=Bin(),K=Bin(),Hh=Bin();U.add(rboxGeo(.36,.52,.2,.08,1),0,1.17,0);U.add(rboxGeo(.4,.1,.21,.05,1),0,1.4,0);U.add(new THREE.CylinderGeometry(.15,.2,.6,12),0,.62,0);for(const sd of[-1,1]){U.add(new THREE.CylinderGeometry(.05,.045,.56,8),sd*.22,1.15,0,0,0,sd*.08);U.add(new THREE.CylinderGeometry(.045,.04,.34,8),sd*.08,.17,0);}U.add(new THREE.BoxGeometry(.3,.04,.03),0,1.32,-.105);
  K.add(new THREE.CylinderGeometry(.05,.055,.1,10),0,1.48,0);K.add(new THREE.SphereGeometry(.1,14,10).scale(.92,1.12,1.02),0,1.62,0);for(const sd of[-1,1])K.add(new THREE.SphereGeometry(.042,8,6),sd*.25,.86,0);Hh.add(new THREE.SphereGeometry(.106,14,8,0,TAU,0,1.25).scale(.94,1.1,1.05),0,1.64,.01);Hh.add(new THREE.SphereGeometry(.07,10,8),0,1.62,.12);
  B.add(colorize(mergeBin(U),crew[0],crew[1],crew[2]),x,fy,z);B.add(colorize(mergeBin(K),.88,.68,.55),x,fy,z);B.add(colorize(mergeBin(Hh),.25,.16,.1),x,fy,z);}
 const m=new THREE.Mesh(mergeBin(B),lmats().int);m.receiveShadow=true;g.add(m);const me=new THREE.Mesh(mergeBin(E),lmats().emi);g.add(me);
 const pos=[];const rows=(L,z0,z1,p,b)=>{for(let z=z0;z<=z1;z+=p)for(const x of L)pos.push([x,z,b]);};if(s.biz)rows(s.biz.xs,s.biz.z0,s.biz.z1,s.biz.p,1);rows(s.xs,s.z0,s.z1,s.p,0);
 const si=new THREE.InstancedMesh(G.seat,lmats().seat,pos.length);pos.forEach((p,i)=>{_m4.makeScale(p[2]?1.45:1,p[2]?1.06:1,p[2]?1.35:1).setPosition(p[0],fy,p[1]);si.setMatrixAt(i,_m4);});si.receiveShadow=true;g.add(si);
 const occ=pos.filter(()=>Math.random()<.78),n=Math.max(1,occ.length),pi=new THREE.InstancedMesh(G.pax,lmats().pax,n),ps=new THREE.InstancedMesh(G.skin,lmats().pax,n),ph=new THREE.InstancedMesh(G.hair,lmats().hair,n),pc=[0x2b3a55,0x6b2a2a,0x2c5a3c,0xc8c2b4,0x1d1d1f,0x8a6a3a,0x3d4f7a,0xd9d4c7,0x5a2d5f,0xa33b3b,0x2f6f7f,0x4a4f57,0x7a5c3e],
  sk=[0xf1d2bd,0xe0b48f,0xc48a64,0x8d5a3b,0x5c3a26,0xf5dcc8],hc=[0x1b1512,0x3b2618,0x6a4423,0xb8935a,0x8a8a88,0x7a3518,0x2a1d17];
 occ.forEach((p,i)=>{_m4.makeTranslation(p[0],fy,p[1]);for(const m of [pi,ps,ph])m.setMatrixAt(i,_m4);pi.setColorAt(i,_tc.set(pc[Math.floor(Math.random()*pc.length)]).convertSRGBToLinear());ps.setColorAt(i,_tc.set(sk[Math.floor(Math.random()*sk.length)]).convertSRGBToLinear());ph.setColorAt(i,_tc.set(hc[Math.floor(Math.random()*hc.length)]).convertSRGBToLinear());});for(const m of [pi,ps,ph]){m.castShadow=false;m.receiveShadow=true;g.add(m);}
 return {g,seats:si,pax:pi,n:occ.length,emi:me};}
/* ---------- creazione dell'aereo come mezzo pilotabile ---------- */
const LN={list:[],pfd:null};
function spawnLiner(tk,al,x,z,yaw,o){const M=mkLiner(tk,al),C=LT[tk];M.g.traverse(q=>{if(q.isMesh)q.frustumCulled=true;});
 const v=cvNew('liner',M.g,x,groundH(x,z)+C.gearH,z,yaw,Object.assign({lk:tk,al,C,m:M,th:0,flap:.5,flapCmd:2,flapAuto:true,gearDown:true,gearCmd:true,gearAuto:true,gearT:1,sb:0,rev:0,brk:0,vyH:0,ip0:0,
  reach:Math.max(9,C.L*.42),camH:C.R*1.4+1.5,camD:C.L*1.2+10,hx:C.span/2,hy:C.R+.8,hz:C.L/2,hitR:C.L*.45,ai:null,dmg:0,crashT:0,eng:0,
  msg:C.name+': Spazio/C motore, S per tirare su il muso a 250 km/h, G carrello, R flap. Atterra in pista sotto i 4 m/s di discesa.'},o||{}));
 LN.list.push(v);return v;}
/* ---------- fisica di volo (quando lo piloti tu): portanza con flap, stallo, resistenza di carrello e aerofreni, comandi di volo con protezioni ---------- */
const _lv=new THREE.Vector3();
function linerStep(v,dt){if(v.dead)return;const C=v.C,R=v.R,drv=v.drv;const fx=-R[2],fy=-R[5],fz=-R[8],ux=R[1],uy=R[4],uz=R[7],rx=R[0],ry=R[3],rz=R[6];
 let ip=0,ir=0,iy=0;if(drv){ip=-inp.mz;ir=-inp.mx;iy=-inp.roll;if(inp.up)v.th=Math.min(1,v.th+dt*.4);if(inp.flyDown)v.th=Math.max(0,v.th-dt*.4);if(IS_TOUCH&&inp.fireP){v.gearCmd=!v.gearCmd;v.gearAuto=false;toast(v.gearCmd?'Carrello giù':'Carrello su');}if(IS_TOUCH&&inp.jumpP){v.flapCmd=(v.flapCmd+1)%5;v.flapAuto=false;toast('Flap '+['0','1','2','3','TUTTI'][v.flapCmd]);}}
 const V=Math.hypot(v.vx,v.vy,v.vz),vf=v.vx*fx+v.vy*fy+v.vz*fz,vu=v.vx*ux+v.vy*uy+v.vz*uz,vr=v.vx*rx+v.vy*ry+v.vz*rz;
 const gy=groundH(v.px,v.pz),agl=v.py-gy-C.gearH,onG=agl<=.06,rw=onRunway(v.px,v.pz,0),paved=rw||inZone(v.px,v.pz,0);
 // flap e carrello automatici finché non li tocchi
 if(v.flapAuto){const sp=vf,fc=onG&&sp<C.vr*1.15?2:sp>C.vref*2.2?0:sp>C.vref*1.8?1:sp>C.vref*1.45?2:sp>C.vref*1.2?3:4;v.flapCmd=!onG&&v.vy>.8&&!v.gearCmd?Math.min(v.flapCmd,fc):!onG&&v.vy>.8?Math.min(Math.max(v.flapCmd,0),fc,2):fc;}
 if(v.gearAuto){if(!onG&&agl>15&&v.vy>2)v.gearCmd=false;if(agl<320&&vf<C.vref*1.8&&v.vy<.5)v.gearCmd=true;}
 v.flap+=clamp(v.flapCmd/4-v.flap,-dt*.12,dt*.12);v.gearT=clamp(v.gearT+(v.gearCmd?1:-1)*dt*.12,0,1);v.gearDown=v.gearT>.95;
 v.sb=onG?(v.th<.05&&V>15?1:0):(drv&&inp.sprint?1:0);v.rev=onG&&drv&&inp.sprint&&v.th<.35?Math.min(1,v.rev+dt*1.5):Math.max(0,v.rev-dt*2);
 const al=Math.atan2(-vu,Math.max(2,vf)),fl=v.flap,alS=.25+fl*.04;let CL=.15+fl*.65+5.2*al;const stall=!onG&&al>alS&&vf>10;if(stall){CL*=.5;player.shake=Math.max(player.shake,drv?.3:0);}CL=clamp(CL,-1,2.5);
 const lift=C.kl*vf*Math.max(0,vf)*CL,thr=(v.th*(1-v.rev)-v.rev*.45)*C.T*(v.eng?.5:1),drag=(C.cd0*(1+(v.gearT*.004+fl*.011+v.sb*.016)*150)+C.kl*.045*CL*CL)*V*V,iv=V>.1?1/V:0;
 v.vx+=(fx*thr+ux*lift-v.vx*iv*drag)*dt;v.vy+=(fy*thr+uy*lift-v.vy*iv*drag-9.81)*dt;v.vz+=(fz*thr+uz*lift-v.vz*iv*drag)*dt;
 if(!onG){const sk=Math.min(1,dt*1.6);v.vx-=rx*vr*sk;v.vy-=ry*vr*sk;v.vz-=rz*vr*sk;}
 const auth=clamp(vf/C.vref,.06,1.5),bank=Math.asin(clamp(R[3],-1,1)),pitch=Math.asin(clamp(fy,-1,1));let wx=0,wz=0,wy=0;
 if(!onG){if(Math.abs(ip)>.05){wx=ip*.42*auth;v.vyH=v.vy;}else{v.vyH*=1-dt*.15;wx=clamp((v.vyH-v.vy)*.035,-.09,.09)*auth;}
  if(al>alS*.92)wx-=(al-alS*.92)*3;if(al<-.08)wx+=(-.08-al)*2;
  wz=Math.abs(ir)>.05?ir*.62*auth:(Math.abs(bank)>.58?-bank*.4:-bank*.08);if(Math.abs(bank)>1.15&&Math.sign(wz)===Math.sign(-bank)*-1)wz=-bank*.6;
  wy=iy*.12*auth-(vr/Math.max(25,V))*1.4;}
 else{const wb=Math.abs(C.nose[0]-C.main[1]),dm=.7/(1+Math.abs(vf)/5);wy=(drv?-inp.mx:(v.steer||0))*Math.abs(vf)*Math.tan(dm)/wb;
  if(ip>0&&vf>C.vr*.92)wx=ip*.3*auth;else if(pitch>0.005)wx=-Math.min(.4,pitch*1.5);else if(pitch<-.002)wx=-pitch*3;
  const vside=vr;v.vx-=rx*vside*Math.min(1,dt*6);v.vz-=rz*vside*Math.min(1,dt*6);
  const brk=(v.th<.05&&drv?(rw?3.2:2):0)+(drv&&ip>.3&&vf<C.vr*.9?2.6*ip:0)+(v.brk||0)+(paved?.12:.8),Vn=Math.hypot(v.vx,v.vz),dv=brk*dt;if(Vn>dv){const k=(Vn-dv)/Vn;v.vx*=k;v.vz*=k;}else{v.vx=0;v.vz=0;}}
 v.q.multiply(_cvq.setFromEuler(_cve.set(wx*dt,wy*dt,wz*dt,'YXZ'))).normalize();cvR(v);
 v.px+=v.vx*dt;v.py+=v.vy*dt;v.pz+=v.vz*dt;
 // contatto con il suolo: atterraggio, atterraggio duro, schianto
 const g2=groundH(v.px,v.pz),floorY=g2+(v.gearT>.5?C.gearH:C.R*.8);
 if(v.py<floorY){const vy=v.vy,bk=Math.abs(bank),pt=Math.asin(clamp(-R[5],-1,1));
  if(!v.wasG){if(v.gearT<.5||vy<-7||bk>.32||pt<-.08||(!paved&&V>45)||waterAt(v.px,v.pz)>g2+.5){linerCrash(v,v.px,g2+1,v.pz,'suolo');return;}
   if(vy<-3.6){player.shake=Math.max(player.shake,drv?1:0);sndImpact(v.px,g2,v.pz,'metal',14);v.dmg+=(-vy-3.6)*.25;if(drv)toast('Atterraggio duro!');}
   else if(V>30){for(const sd of [1,-1])for(let k=0;k<4;k++)smoke(v.px+rx*C.main[0]*sd,g2+.4,v.pz+rz*C.main[0]*sd,rand(-1,1),rand(0,1.2),rand(-1,1),1.6,rand(1.5,3),false);sfx({x:v.px,y:g2,z:v.pz,src:'noise',filter:'bandpass',ff0:900,ff1:400,g:.35,d:.4,ref:30});}
   v.wasG=true;}
  v.py=floorY;v.vy=Math.max(0,v.vy);}else if(v.py>floorY+.5)v.wasG=false;
 if(waterAt(v.px,v.pz)>v.py-C.R){linerCrash(v,v.px,v.py,v.pz,'acqua');return;}
 if(V>4)linerHits(v);}
// urti con palazzi e grattacieli: muso, coda, estremità alari, motori
const _lh=[[0,0,-1],[0,.6,1],[1,0,.05],[-1,0,.05],[.5,-.3,-.15],[-.5,-.3,-.15],[0,.9,.92],[0,0,-.5],[0,0,.5]];
function linerHits(v){const C=v.C,R=v.R,hx=C.span/2*.97,hz=C.L/2*.96;for(const o of _lh){const lx=o[0]*hx,ly=o[1]*(o[1]>0.8?C.fin[1][0]*.9:C.R),lz=o[2]*hz,x=v.px+R[0]*lx+R[1]*ly+R[2]*lz,y=v.py+R[3]*lx+R[4]*ly+R[5]*lz,z=v.pz+R[6]*lx+R[7]*ly+R[8]*lz;
  if(y>groundH(x,z)+1.2&&pointContact(x,y,z,CT)){linerCrash(v,x,y,z,'palazzo');return true;}}return false;}
/* ---------- incidente: palla di fuoco, fusoliera che si spezza, ali e motori che volano via, fumo e incendi ---------- */
function linerCrash(v,x,y,z,why){if(v.dead)return;v.dead=true;if(v.m&&v.m.mid)for(const o of v.m.mid)o.visible=true;v.th=0;if(player.cab===v){const P=player;P.cab=null;P.fly=true;P.y=Math.max(P.y+6,groundH(P.x,P.z)+3);P.vx=P.vy=P.vz=0;toast('L’aereo su cui viaggiavi è precipitato: ti sei salvato per un soffio (X per scendere).');}const C=v.C,M=v.m,sp=Math.hypot(v.vx,v.vy,v.vz),dx=v.vx/(sp||1),dy=v.vy/(sp||1),dz=v.vz/(sp||1),big=v.lk==='w'?1.4:v.lk==='r'?.7:1;
 if(player.veh===v){exitVehicle();const P=player,l=Math.hypot(v.vx,v.vz)||1;P.x=x-v.vx/l*45;P.z=z-v.vz/l*45;P.y=Math.max(groundH(P.x,P.z)+2,y+8);P.vx=P.vy=P.vz=0;P.fly=true;toast('Hai perso il controllo dell’aereo: sei in volo, premi X per scendere.');}
 // dentro un palazzo l'aereo sfonda piani interi lungo la sua traiettoria
 if(why==='palazzo'){const n=Math.min(7,2+Math.floor(sp/25));for(let k=0;k<n;k++)setTimeout(()=>{destroySphere(x+dx*k*7,y+dy*k*7,z+dz*k*7,(8+k)*big,2.2*big);placeFire(x+dx*k*7+rand(-6,6),y+dy*k*7,z+dz*k*7+rand(-6,6),rand(2.5,4),rand(120,240));},k*70);}
 explode(x,y,z,(14+sp*.06)*big,(1.6+sp*.006)*big);setTimeout(()=>explode(x+dx*10,y+2,z+dz*10,11*big,1.2*big),160);
 for(let k=0;k<5;k++)setTimeout(()=>{fireP(x+rand(-8,8),y+rand(0,6),z+rand(-8,8),rand(-4,4),rand(4,12),rand(-4,4),12*big,rand(1.5,2.6));},k*90);
 M.g.updateMatrixWorld(true);const parts={b:[],wR:[],wL:[]};M.g.children.slice().forEach(o=>{const p=o.position;if(o===M.cock.g||o===M.cab.g){parts.b.push(o);return;}const ax=Math.abs(p.x);(ax>C.R*1.6&&p.x>0?parts.wR:ax>C.R*1.6?parts.wL:parts.b).push(o);});
 const burn=MS(0x16130f,.95,.1);const mk=(list,hx,hy,hz,m)=>{if(!list.length)return null;const bb=new THREE.Box3();for(const o of list)bb.expandByObject(o);const ct=bb.getCenter(new THREE.Vector3());
  const gr=new THREE.Group();gr.position.copy(ct);gr.quaternion.copy(v.q);scene.add(gr);gr.updateMatrixWorld(true);for(const o of list)gr.attach(o);
  gr.traverse(q=>{if(q.isMesh&&q.material&&!q.material.transparent&&!q.material.isMeshBasicMaterial&&Math.random()<.8)q.material=burn;});
  const b=newBody(1,ct.x,ct.y,ct.z,hx,hy,hz,m);b.qx=v.q.x;b.qy=v.q.y;b.qz=v.q.z;b.qw=v.q.w;updR(b);b.obj=gr;b.snd='metal';b.rest=.15;b.mu=.5;
  b.vx=v.vx*.55+rand(-3,3);b.vy=Math.max(v.vy*.3,0)+rand(2,7);b.vz=v.vz*.55+rand(-3,3);b.wx=rand(-.8,.8);b.wy=rand(-.5,.5);b.wz=rand(-1.2,1.2);syncObj(b);return b;};
 // fusoliera intera (o in due pezzi ad alta velocità), ali staccate
 const bodyB=mk(parts.b,C.R*1.05,C.R*1.05,C.L*.48,Math.max(6000,C.mass*.5));const wr=mk(parts.wR,C.span*.22,.6,C.wing[0][3]*.45,C.mass*.06),wl=mk(parts.wL,C.span*.22,.6,C.wing[0][3]*.45,C.mass*.06);
 for(const b of [bodyB,wr,wl])if(b){LN.wrecks=(LN.wrecks||[]);LN.wrecks.push({b,t:0,fire:0,x:b.px,z:b.pz});}
 scene.remove(M.g);v.obj=new THREE.Group();v.vx=v.vy=v.vz=0;v.py=-500;sndExplosion(x,y,z,30*big);player.shake=Math.min(2,player.shake+clamp(800/(sDist(x,y,z)+100),0,1.5));
 if(typeof flAccNote==='function')flAccNote(v,why,x,z,y);}
// i rottami bruciano e fumano a lungo dopo essersi fermati
function linerWrecks(dt){if(!LN.wrecks)return;for(let i=LN.wrecks.length-1;i>=0;i--){const W=LN.wrecks[i],b=W.b;W.t+=dt;if(b.dead){LN.wrecks.splice(i,1);continue;}
 if(W.t>1.5&&!W.fire&&(b.sleep||Math.hypot(b.vx,b.vz)<1.5)){W.fire=1;for(let k=0;k<3;k++)addFire(b.px+rand(-b.hx,b.hx)*.6,b.py+b.hy*.6,b.pz+rand(-b.hz,b.hz)*.4,rand(2.5,4.5),rand(80,160));}
 if(W.t<200&&Math.random()<dt*3)smoke(b.px+rand(-2,2),b.py+b.hy+1,b.pz+rand(-2,2),rand(-.5,.5)+WIND.x*.3,rand(4,8),rand(-.5,.5)+WIND.z*.3,rand(4,7),rand(10,18),true);}}
/* ---------- aspetto in volo: motori che girano, superfici mobili, carrello che rientra, luci, cabina accesa di notte ---------- */
const _lq=new THREE.Quaternion(),_le=new THREE.Euler();
// patch Z: luci di navigazione di tutti gli aerei di linea in un'unica istanza (una chiamata di disegno invece di tre per aereo)
const LNAV={m:null,slot:new Map(),used:new Set(),q:new THREE.Quaternion(),p:new THREE.Vector3(),s:new THREE.Vector3(),mx:new THREE.Matrix4()};
function lnavSet(v,M,ks){if(!LNAV.m){const m=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),120);m.count=120;m.frustumCulled=false;const z=new THREE.Matrix4().makeScale(0,0,0);for(let i=0;i<120;i++){m.setMatrixAt(i,z);m.setColorAt(i,new THREE.Color(1,1,1));}scene.add(m);LNAV.m=m;}
 let k=LNAV.slot.get(v);if(k===undefined){for(let i=0;i<40;i++)if(![...LNAV.slot.values()].includes(i)){k=i;break;}if(k===undefined)return;LNAV.slot.set(v,k);for(let j=0;j<3;j++)LNAV.m.setColorAt(k*3+j,M.L.nav[j].material.color);LNAV.m.instanceColor.needsUpdate=true;}
 LNAV.used.add(v);const R=v.R;for(let j=0;j<3;j++){const l=M.L.nav[j],p=l.position,r=l.geometry.parameters.radius||.12;LNAV.p.set(v.px+R[0]*p.x+R[1]*p.y+R[2]*p.z,v.py+R[3]*p.x+R[4]*p.y+R[5]*p.z,v.pz+R[6]*p.x+R[7]*p.y+R[8]*p.z);LNAV.s.setScalar(r*ks);LNAV.mx.compose(LNAV.p,LNAV.q,LNAV.s);LNAV.m.setMatrixAt(k*3+j,LNAV.mx);}LNAV.m.instanceMatrix.needsUpdate=true;}
function lnavFlush(){if(!LNAV.m)return;const z=new THREE.Matrix4().makeScale(0,0,0);for(const [v,k] of LNAV.slot){if(!LNAV.used.has(v)||v.dead){for(let j=0;j<3;j++)LNAV.m.setMatrixAt(k*3+j,z);LNAV.slot.delete(v);LNAV.m.instanceMatrix.needsUpdate=true;}}LNAV.used.clear();}
function linerVisual(v,dt){const M=v.m,C=v.C,t=U.uTime.value,cp=camera.position,d=Math.hypot(v.px-cp.x,v.py-cp.y,v.pz-cp.z),ai=v.ai,drv=v.drv;
 const ip=drv?-inp.mz:(ai?ai.ip||0:0),ir=drv?-inp.mx:(ai?ai.ir||0:0),iy=drv?-inp.roll:0;
 for(const c of M.cs){const tg=c.k==='flap'?v.flap*.62*c.s:c.k==='ail'?ir*.32:c.k==='elev'?-ip*.38*c.s:-iy*.4;c.r.rotation.x+=(tg-c.r.rotation.x)*Math.min(1,dt*5);}
 v.n1=lerp(v.n1||.2,(v.eng>=2||v.off)?0:.22+v.th*.78,Math.min(1,dt*1.2));for(const f of M.fans){if(f.prop){f.bl.rotation.z+=dt*v.n1*70;f.disc.material.opacity=v.n1>.3?.18:0;f.bl.visible=v.n1<.55||d<30;}else f.g.rotation.z+=dt*v.n1*48;}
 const G=M.gear;G.visible=v.gearT>.04;G.position.y=(1-v.gearT)*C.gearH*.55;G.scale.y=.3+.7*v.gearT;
 const night=U.uNight.value,air=v.py-groundH(v.px,v.pz)-C.gearH>2,on=!v.dead&&(v.n1>.25||air);
 M.L.str[0].visible=M.L.str[1].visible=on&&(air||onRunway(v.px,v.pz,0))&&(t*1.1%1)<.06;M.L.bcn[0].visible=M.L.bcn[1].visible=on&&((t*.9+.4)%1)<.08;
 const land=on&&(v.gearT>.5||v.py<900)&&(air||onRunway(v.px,v.pz,0));for(const l of M.L.land)l.visible=land;const ks0=Math.max(1,d*.011);{const ks=ks0;if(Math.abs(ks-(M.lsc||1))>.05){M.lsc=ks;for(const k of ['nav','str','bcn'])for(const l of M.L[k])l.scale.setScalar(ks);for(const l of M.L.land)l.scale.setScalar(ks*1.3);}}for(const b of M.beams){b.material.opacity=land?.06+.22*night:0;b.visible=land;}
 const lo=S.q==='bassa',near=d<(lo?40:75)||player.veh===v||player.cab===v,isFar=d>(lo?260:450)&&!near;if(isFar!==M.isFar){M.isFar=isFar;for(const o of M.far)o.visible=!isFar;}
 const midV=near||d<(lo?90:160)||v.dead;if(M.mid&&midV!==M.midV){M.midV=midV;for(const o of M.mid)o.visible=midV;for(const o of M.gearN)o.visible=midV;M.gearF.visible=!midV;}
 lnavSet(v,M,ks0);M.cab.g.visible=near;M.cock.g.visible=near;if(M.cock.capt)M.cock.capt.visible=!(player.veh===v&&S.view==='1p');M.lin.material.emissiveIntensity=M.linN.material.emissiveIntensity=.04+night*1.1;
 if(player.veh===v&&drv&&S.view==='1p')linerScreens(v,dt);}
// schermi veri per l'aereo che piloti: orizzonte artificiale, nastri di velocità e quota, bussola, motori
function linerScreens(v,dt){LN.st=(LN.st||0)-dt;if(LN.st>0)return;LN.st=.1;if(!LN.pfd){const mk=()=>{const c=document.createElement('canvas');c.width=c.height=256;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return {c,g:c.getContext('2d'),t,m:new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(1.3,1.3,1.3)})};};LN.pfd=mk();LN.nd=mk();LN.ec=mk();}
 const R=v.R,pitch=Math.asin(clamp(-R[5],-1,1)),bank=Math.atan2(R[3],R[4]),hdg=((Math.atan2(-R[2],-R[8])*180/Math.PI)+360)%360,spd=Math.hypot(v.vx,v.vy,v.vz)*1.944,alt=Math.max(0,(v.py-v.C.gearH-.15)*3.281),vs=v.vy*196.85;
 {const g=LN.pfd.g;g.save();g.fillStyle='#000';g.fillRect(0,0,256,256);g.beginPath();g.rect(40,30,176,180);g.clip();g.translate(128,120);g.rotate(-bank);const pp=pitch*180/Math.PI*4;
  g.fillStyle='#2b6fc0';g.fillRect(-250,-400+pp,500,400);g.fillStyle='#7a4d26';g.fillRect(-250,pp,500,400);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(-250,pp);g.lineTo(250,pp);g.stroke();
  g.font='bold 11px monospace';g.fillStyle='#fff';for(let k=-30;k<=30;k+=5){if(!k)continue;const y=pp-k*4,w=k%10?14:28;g.beginPath();g.moveTo(-w,y);g.lineTo(w,y);g.stroke();if(!(k%10))g.fillText(Math.abs(k),w+3,y+4);}g.restore();
  g.strokeStyle='#ffd400';g.lineWidth=5;g.beginPath();g.moveTo(78,120);g.lineTo(112,120);g.lineTo(112,128);g.moveTo(178,120);g.lineTo(144,120);g.lineTo(144,128);g.stroke();g.fillStyle='#ffd400';g.fillRect(124,116,8,8);
  g.fillStyle='rgba(40,40,48,.9)';g.fillRect(0,30,38,180);g.fillRect(218,30,38,180);g.fillStyle='#fff';g.font='bold 12px monospace';
  for(let k=-4;k<=4;k++){const s0=Math.round(spd/10)*10+k*10,y=120-(s0-spd)*1.8;if(y>34&&y<206&&s0>=0)g.fillText(String(s0).padStart(3,' '),4,y+4);}
  for(let k=-4;k<=4;k++){const a0=Math.round(alt/100)*100+k*100,y=120-(a0-alt)*.18;if(y>34&&y<206&&a0>=0)g.fillText(String(a0).padStart(5,' ').slice(-5),219,y+4);}
  g.fillStyle='#000';g.fillRect(0,110,40,20);g.fillRect(214,110,42,20);g.strokeStyle='#ffd400';g.lineWidth=2;g.strokeRect(0,110,40,20);g.strokeRect(214,110,42,20);g.fillStyle='#3f3';g.font='bold 14px monospace';g.fillText(String(Math.round(spd)).padStart(3,' '),4,125);g.fillText(String(Math.round(alt)).padStart(5,' '),215,125);
  g.fillStyle='#3f3';g.font='bold 11px monospace';g.fillText('SPEED',45,20);g.fillText(v.gearDown?'GEAR DN':'GEAR UP',100,20);g.fillText('FLAP '+['0','1','2','3','F'][Math.round(v.flap*4)],170,20);g.fillStyle='#fff';g.fillText('HDG '+String(Math.round(hdg)).padStart(3,'0'),96,236);g.fillText('V/S '+Math.round(vs/100)*100,160,252);
  LN.pfd.t.needsUpdate=true;}
 {const g=LN.nd.g;g.fillStyle='#050608';g.fillRect(0,0,256,256);g.save();g.translate(128,190);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(0,0,150,Math.PI*1.1,Math.PI*1.9);g.stroke();g.font='bold 12px monospace';g.fillStyle='#fff';
  for(let a=-60;a<=60;a+=10){const hh=Math.round((hdg+a+360)%360),r=a*Math.PI/180;g.save();g.rotate(r);g.beginPath();g.moveTo(0,-150);g.lineTo(0,a%30?-143:-136);g.stroke();if(!(a%30))g.fillText(String(Math.round(hh/10)%36).padStart(2,'0'),-8,-122);g.restore();}
  const tg=v.navT;if(tg){const b=(Math.atan2(tg[0]-v.px,-(tg[1]-v.pz))*180/Math.PI-hdg+540)%360-180,dist=Math.hypot(tg[0]-v.px,tg[1]-v.pz);g.save();g.rotate(b*Math.PI/180);g.strokeStyle='#e040e0';g.beginPath();g.moveTo(0,0);g.lineTo(0,-Math.min(150,dist*.05));g.stroke();g.restore();g.fillStyle='#e040e0';g.fillText((dist/1852).toFixed(1)+' NM',-110,-160+28);}
  g.fillStyle='#ffd400';g.beginPath();g.moveTo(0,-8);g.lineTo(-7,8);g.lineTo(7,8);g.fill();g.restore();g.fillStyle='#3f3';g.font='bold 13px monospace';g.fillText('GS '+Math.round(Math.hypot(v.vx,v.vz)*1.944),6,18);g.fillText('TRK '+String(Math.round(hdg)).padStart(3,'0'),170,18);LN.nd.t.needsUpdate=true;}
 {const g=LN.ec.g;g.fillStyle='#050608';g.fillRect(0,0,256,256);for(const [x,k] of [[66,0],[190,1]]){const n=(v.eng===2||(v.eng===1&&k===1))?0:(v.n1||0)*100;g.strokeStyle='#888';g.lineWidth=3;g.beginPath();g.arc(x,80,46,Math.PI*.75,Math.PI*2.25);g.stroke();
   g.strokeStyle=n>95?'#f80':'#3f3';g.lineWidth=7;g.beginPath();g.arc(x,80,46,Math.PI*.75,Math.PI*(.75+1.5*n/104));g.stroke();g.fillStyle='#3f3';g.font='bold 18px monospace';g.fillText(n.toFixed(1),x-24,90);}
  g.fillStyle='#fff';g.font='bold 14px monospace';g.fillText('N1 %',104,150);g.fillStyle='#3cf';g.fillText('THR '+Math.round(v.th*100)+'%'+(v.rev>.1?'  REV':''),60,190);g.fillStyle=v.dmg>.5?'#f80':'#3f3';g.fillText(v.dmg>.5?'GEAR DAMAGE':'SYS NORMAL',62,225);LN.ec.t.needsUpdate=true;}
 const S2=v.m.cock.scr;if(!v.scrDyn){v.scrDyn=true;S2[0].material=S2[2].material=LN.pfd.m;S2[1].material=S2[3].material=LN.nd.m;S2[4].material=S2[5].material=LN.ec.m;}}
/* ---------- collegamento col gioco: passo fisico, aspetto, informazioni, visuale dalla cabina, salire e scendere ---------- */
{const s0=cvStep;cvStep=function(dt){s0(dt);for(const v of CVS){if(v.type!=='liner'||v.dead)continue;if(v.ai&&!v.drv){if(typeof flAIStep==='function')flAIStep(v,dt);}else linerStep(v,dt);}};}
{const f0=cvFrame;cvFrame=function(dt){f0(dt);for(const v of LN.list)if(!v.dead)linerVisual(v,dt);lnavFlush();linerWrecks(dt);linerAudio();};}
{const i0=cvInfo;cvInfo=function(b){if(b.type!=='liner')return i0(b);const alt=Math.round(Math.max(0,b.py-groundH(b.px,b.pz)-b.C.gearH));
 return 'Spinta '+Math.round(b.th*100)+'%'+(b.rev>.1?' · inversori':'')+(b.sb>.5&&b.vy!==0&&alt>2?' · aerofreni':'')+' · quota '+alt+' m · variometro '+(b.vy>=0?'+':'')+b.vy.toFixed(1).replace('.',',')+' m/s · flap '+['0','1','2','3','TUTTI'][Math.round(b.flap*4)]+' · carrello '+(b.gearT>.95?'giù':b.gearT<.05?'su':'in movimento')+' · '+Math.round(Math.hypot(b.vx,b.vy,b.vz)*1.944)+' nodi';};}
{const u0=updateCamera;updateCamera=function(dt){const P=player,b=P.veh;if(P.mode==='liner'&&b&&!b.dead&&S.view==='1p'){P.yaw=clamp(P.yaw,-2.5,2.5);P.pitch=clamp(P.pitch,-1.1,.95);const e=b.C.cock.eye;_lv.set(e[0],e[1],e[2]).applyQuaternion(b.q);camera.position.set(b.px+_lv.x,b.py+_lv.y,b.pz+_lv.z);
  _lq.setFromEuler(_le.set(P.pitch,P.yaw,0,'YXZ'));camera.quaternion.copy(b.q).multiply(_lq);P.camNear=true;applyShake(dt);return;}u0(dt);};}
{const e0=enterVehicle;enterVehicle=function(){e0();const P=player,b=P.veh;if(b&&b.type==='liner'){P.yaw=0;P.pitch=-.12;P.lookT=performance.now();b.th=b.th||0;if(b.ai){b.ai.taken=true;if(typeof flTaken==='function')flTaken(b);b.ai=null;}b.flapAuto=b.gearAuto=true;}};}
{const x0=exitVehicle;exitVehicle=function(){const P=player,b=P.veh;if(b&&b.type==='liner'){const C=b.C,R=b.R,air=b.py-groundH(b.px,b.pz)-C.gearH>20;x0();if(!air){const J=AP.jb.find(j=>j.dock===b);
  if(Math.hypot(b.vx,b.vz)<3){const lx=-.25,ly=C.floor,lz=C.door[0]+.1;P.x=b.px+R[0]*lx+R[1]*ly+R[2]*lz;P.y=b.py+R[3]*lx+R[4]*ly+R[5]*lz;P.z=b.pz+R[6]*lx+R[7]*ly+R[8]*lz;P.vx=P.vy=P.vz=0;P.fly=false;flCabin(b,lx,ly,lz);P.yaw=Math.atan2(-R[2],-R[8]);P.pitch=-.05;toast('Sei in cabina, accanto alla porta anteriore. Premi F per tornare ai comandi.');}else if(J&&J.cabP){P.x=J.cabP[0]-Math.cos(J.arm.rotation.y)*2;P.z=J.cabP[2]+Math.sin(J.arm.rotation.y)*2;P.y=J.cabP[1]+.25;}else{const lx=-C.R-1.5,lz=C.door[0];P.x=b.px+R[0]*lx+R[2]*lz;P.z=b.pz+R[6]*lx+R[8]*lz;P.y=groundPl(P.x,P.z);}if(!P.cab){P.yaw=Math.atan2(-(b.px-P.x),-(b.pz-P.z));P.pitch=0;}}b.th=Math.min(b.th,.05);return;}x0();};}
addEventListener('keydown',e=>{if(state!=='play'||e.repeat)return;const b=player.veh;if(player.mode!=='liner'||!b||b.dead)return;
 if(e.code==='KeyG'){b.gearCmd=!b.gearCmd;b.gearAuto=false;if(!b.gearCmd&&b.py-groundH(b.px,b.pz)-b.C.gearH<2){b.gearCmd=true;toast('A terra il carrello non si può alzare.');}else toast(b.gearCmd?'Carrello giù':'Carrello su');}
 else if(e.code==='KeyR'){b.flapCmd=(b.flapCmd+1)%5;b.flapAuto=false;toast('Flap '+['0','1','2','3','TUTTI'][b.flapCmd]);}});
// suono dei motori: quello che piloti e l'aereo più vicino
function linerAudio(){if(!AU.ok)return;const P=player,b=P.veh&&P.veh.type==='liner'&&!P.veh.dead?P.veh:null;
 const W=AU.loops.lnW||(AU.loops.lnW=mkLoop('noise','bandpass',2600,1.4,false)),R=AU.loops.lnR||(AU.loops.lnR=mkLoop('brown','lowpass',140,.8,false)),F=AU.loops.lnF||(AU.loops.lnF=mkOscLoop('sawtooth',300,'bandpass',1200));
 if(b){const n=b.n1||.2,cab=S.view==='1p'?.45:1;loopGain(W,(.05+n*.28)*cab,.3);W.f.frequency.value=1800+n*2600;loopGain(R,(.08+n*.35+b.rev*.3)*cab,.3);F.o.frequency.value=b.lk==='r'?60+n*45:180+n*900;loopGain(F,(.012+n*.04)*cab,.3);}
 else{for(const L of [W,R,F])loopGain(L,0,.4);}
 const NL=AU.loops.lnN||(AU.loops.lnN=mkLoop('noise','bandpass',900,.6,true)),NR=AU.loops.lnNR||(AU.loops.lnNR=mkLoop('brown','lowpass',180,.8,true));let best=null,bd=1500;
 for(const v of LN.list){if(v.dead||v===b)continue;const d=sDist(v.px,v.py,v.pz);if(d<bd&&(v.n1||0)>.25){bd=d;best=v;}}
 if(best){const n=best.n1||.3;setPan(NL.p,best.px,best.py,best.pz);setPan(NR.p,best.px,best.py,best.pz);loopGain(NL,(.15+n*.5),.4);loopGain(NR,(.2+n*.7),.4);NL.f.frequency.value=700+n*1400;}else{loopGain(NL,0,.6);loopGain(NR,0,.6);}}
