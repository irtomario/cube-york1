/* ======================= PATCH AB — COSTE NATURALI ======================= */
// Prima: il canale attorno all'isola era un rettangolo perfetto (rive dritte a x=±780, z=880, z=-905), il deserto finiva
// con una linea dritta sull'acqua, le dune erano strisce parallele tutte uguali, i laghi avevano la forma di un fiore,
// la costa sud era una curva liscia, gli argini dei fiumi proseguivano in mare come due moli e le zone spianate
// entravano in mare con bordi squadrati.
// Ora: la riva esterna del canale si sposta avanti e indietro (calette, punte, spiagge larghe e tratti a scogliera),
// il deserto scende in acqua con una spiaggia irregolare, le dune hanno creste curve di altezza diversa, i laghi hanno
// rive frastagliate, la costa sud ha baie e promontori, i fiumi sfociano senza argini in mare, le colmate delle zone
// hanno un bordo naturale. Funzioni solo a base di seni dove serve la stessa forma anche nella GPU (deserto vicino).
// ---------- riva esterna del canale ----------
function moatE(x,z){const dx=Math.max(-780-x,x-780),dz=Math.max(-905-z,z-880);return(dx>0||dz>0)?Math.hypot(Math.max(dx,0),Math.max(dz,0)):Math.max(dx,dz);}
function moatShore(x,z){const wx=x+55*Math.sin(z*.0089+1.1)+21*Math.sin(z*.0213+.3),wz=z+55*Math.sin(x*.0083+2.3)+21*Math.sin(x*.0197+1.9);
 const s=62+24*Math.sin(wx*.0021+wz*.0017+1.3)+22*Math.sin(wx*.0071-wz*.0059+.7)*Math.sin(wz*.0023+wx*.0013+.4)+24*Math.sin(wx*.0127+wz*.0109+2.9)+15*Math.sin(wx*.0251-wz*.0233+4.1)+8*Math.sin(wx*.049+wz*.043+.3)+3.5*Math.sin(wx*.097-wz*.089+1.7);
 return Math.max(6,s);}
function moatCliff(x,z){return sst(.3,.8,.5+.5*Math.sin(x*.0031-z*.0027+.8)*Math.sin(x*.0013+z*.0019+2.2));}
function smin(a,b,k){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;}
// quota della riva: fondale del canale (-9) che risale fino alla linea dell'acqua, poi spiaggia o scogliera
function moatH(x,z){const e=moatE(x,z);if(e>420)return 1e9;const s=moatShore(x,z),c=moatCliff(x,z);
 if(e<s)return -9+7.5*sst(0,s,e);return -1.5+(e-s)*(.035+.5*c*c);}
function moatApply(x,z,h){if(moatE(x,z)<=0)return h;const m=moatH(x,z);if(m>h+4)return h;return smin(h,m,2);}
// ---------- deserto: dune vere (creste curve, altezze diverse, dune secondarie) e spiaggia irregolare sul canale ----------
function dunesH(x,z){const wx=x+48*Math.sin(z*.0043+1.7)+21*Math.sin(z*.0117+x*.004+.6)+9*Math.sin(x*.031-z*.027+2.2),wz=z+44*Math.sin(x*.0039+.4)+19*Math.sin(x*.0109-z*.005+2.8)+8*Math.sin(z*.029+x*.023+1.3);
 const u=wx*.0062+wz*.0091+Math.sin(wx*.004)*1.1,f=u-Math.floor(u),du=f<.72?f/.72:(1-f)/.28;
 const amp=(5.5+4*Math.sin(wx*.0013+wz*.0009))*sst(-.35,.55,Math.sin(wx*.0031-wz*.0024+1.9)+.6*Math.sin(wx*.0017+wz*.0041+.3));
 const u2=wx*.0141-wz*.0058+Math.sin(wz*.006)*.8,f2=u2-Math.floor(u2),d2=f2<.65?f2/.65:(1-f2)/.35;
 return amp*du*du*(3-2*du)+(1.4+Math.sin(wx*.0027+.5))*d2*d2*(3-2*d2)*.5;}
desertH0=function(x,z){const e=clamp((-z-890)/60,0,1),big=Math.sin(x*.0021+.7)*Math.cos(z*.0017+1.1)*9+Math.sin(x*.0047-z*.0031+2.3)*5;let h=.3+e*(Math.max(0,big+12)*.6+dunesH(x,z));
 const m=moatH(x,z);if(m<h+4)h=lerp(h,smin(h,m,2),sst(15,90,Math.abs(x)));return h;};
// ---------- laghi: rive frastagliate (somma di armoniche con ampiezza che cala come in una costa vera) ----------
function lakeRR(L,a){const p=L.ph;return L.r*(1+.75*(.11*Math.sin(2*a+p)+.085*Math.sin(3*a+p*1.7+.4)+.06*Math.sin(5*a+p*2.3+1.1)+.045*Math.sin(7*a+p*.9+2)+.032*Math.sin(11*a+p*3.1+.7)+.022*Math.sin(17*a+p*1.3+2.9)+.014*Math.sin(23*a+p*2.7+1.6)+.009*Math.sin(31*a+p*.6+.2)));}
// ---------- fiumi: anse (il percorso oscilla con due armoniche legate alla larghezza), mai dentro i laghi, vicino alle zone o alle estremità ----------
function rvMeander(R,P,S){const N=P.length;if(N<5)return;const ph=R.pts[0][0]*.0013+R.pts[0][1]*.0007,off=new Float32Array(N);
 for(let i=1;i<N-1;i++){const p=P[i],w=lerp(R.w0,R.w1,p.s/S),P1=14*w+260,A1=.55*w+14,P2=P1*.43,A2=A1*.42;
  let o=A1*Math.sin(p.s/P1*TAU+ph)+A2*Math.sin(p.s/P2*TAU+ph*2.3+1.1);o*=sst(0,160,p.s)*sst(0,160,S-p.s)*sst(40,170,zoneNear(p.x,p.z));
  for(const L of LAKES)o*=sst(L.r*1.05,L.r*1.6,Math.hypot(p.x-L.x,p.z-L.z));off[i]=o;}
 const nx=new Float32Array(N),nz=new Float32Array(N);for(let i=0;i<N;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(N-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;nx[i]=-dz/l;nz[i]=dx/l;}
 for(let i=1;i<N-1;i++){P[i].x+=nx[i]*off[i];P[i].z+=nz[i]*off[i];}}
// ---------- costa sud: baie, promontori e tratti a falesia ----------
function seaWarp(x,z){return(70*fbm2(x*.0029+4.1,z*.0029-1.3,3)+24*fbm2(x*.012+2,z*.012+7,2))*sst(60,260,zoneNear(x,z));}
function seaCliff(x){return sst(.15,.55,fbm2(x*.0016-3,2.2,2));}
