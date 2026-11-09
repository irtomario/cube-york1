/* ======================= PATCH AB — PERSONE: CAMMINATA E CORSA VERE, PIEDI, PROTAGONISTA NUOVO ======================= */
// Camminata e corsa ricostruite sui dati del passo umano (angoli di anca, ginocchio e caviglia lungo il ciclo):
// - appoggio del tallone, piede piatto, spinta della punta, ginocchio che si piega appena all'appoggio e molto in volo;
// - bacino che sale a metà appoggio e scende nel doppio appoggio, ruota e si inclina dal lato della gamba in volo,
//   si sposta sulla gamba d'appoggio; busto che ruota al contrario del bacino; testa che resta ferma sull'orizzonte;
// - braccia che oscillano in opposizione alle gambe, gomiti che si piegano di più in avanti;
// - corsa: fase di volo, ginocchio fino a 115°, busto in avanti (prima era all'indietro!), braccia piegate a 90°;
// - fermi: respiro, peso che passa da una gamba all'altra, sguardo che si guarda attorno.
// Le persone hanno ora i piedi (due ossa in più): le scarpe rullano dal tallone alla punta invece di restare rigide.
// Il protagonista è rifatto con forme vere (testa scolpita con viso, felpa con cappuccio, jeans, scarpe da ginnastica).
// ---------- modello del passo ----------
const PGT={};
function gtBump(x,c,w){let d=x-c;d-=Math.round(d);return Math.exp(-(d*d)/(2*w*w));}
// angoli (radianti) di una gamba alla fase t (0 = appoggio del tallone), run 0..1: anca (+ avanti), ginocchio (+ piegato), caviglia (+ punta su)
function gtLeg(t,run,o){const c=Math.cos(6.2832*(t-.02)),cr=Math.cos(6.2832*(t-.06));
 const hw=.17+.35*c,hr=.36+.55*cr,kw=.26*gtBump(t,.15,.06)+1.05*gtBump(t,.72,.11)+.05,kr=.55*gtBump(t,.15,.07)+1.95*gtBump(t,.66,.13)+.18,
  aw=-.12*gtBump(t,.06,.04)+.17*gtBump(t,.42,.12)-.36*gtBump(t,.62,.05),ar=.18*gtBump(t,.1,.05)-.5*gtBump(t,.37,.05)+.12*gtBump(t,.75,.1);
 o.h=hw+(hr-hw)*run;o.k=kw+(kr-kw)*run;o.a=aw+(ar-aw)*run;return o;}
// bacino e busto: sollevamento, rotazione, inclinazione, spostamento laterale, inclinazione in avanti
function gtBody(t,run,walk,o){const bw=-.022*Math.cos(12.566*t),br=-.05*Math.cos(12.566*(t-.18));o.bob=(bw+(br-bw)*run)*walk;
 o.yaw=(.075-.03*run)*Math.cos(6.2832*t)*walk;o.roll=.05*Math.sin(6.2832*t)*walk*(1-.5*run);o.sway=.018*Math.sin(6.2832*(t-.1))*walk*(1-.6*run);o.lean=(.04+.14*run)*walk;return o;}
const _pgL={},_pgR={},_pgB={};
// ---------- persone: piedi e nuovo scheletro animato ----------
{const sn0=spawnNPC;spawnNPC=function(x,y,z,o){const n=sn0(x,y,z,o);if(n){n.B.push(new THREE.Matrix4(),new THREE.Matrix4());
  for(const p of n.parts){if((p.b===8||p.b===10)&&p.o[1]<-.395){p.b=p.b===8?11:12;p.o=[p.o[0],p.o[1]+.43,p.o[2]];}}}return n;};}
const _pgM=[new THREE.Matrix4(),new THREE.Matrix4(),new THREE.Matrix4()],_pgE=new THREE.Euler();
npcBones=function(n){const B=n.B,sc=n.sc,sp=n.spdNow||0,walk=Math.min(1,sp/1.2),run=clamp((sp-2.4)/1.8,0,1),up=n.up||0,fl=n.flee>0?1:0,T=PGT.t=U.uTime.value;
 const t=((n.ph/6.2832)%1+1)%1,L=gtLeg(t,run,_pgL),Rr=gtLeg((t+.5)%1,run,_pgR),bd=gtBody(t,run,walk,_pgB);
 // fermi: respiro e peso che si sposta
 const idle=1-walk,br=Math.sin(T*1.9+n.blk)*.006*idle,ws=Math.sin(T*.31+n.blk*1.7)*idle;
 _pgM[0].makeRotationY(n.yaw).setPosition(n.x,n.y,n.z);
 _pgM[1].makeRotationFromEuler(_pgE.set(0,bd.yaw,bd.roll+ws*.03,'YXZ')).setPosition((bd.sway+ws*.02)*sc,(.92+bd.bob+br-up*.55)*sc,0);B[0].multiplyMatrices(_pgM[0],_pgM[1]);
 const lean=bd.lean+up*1.1+(n.old?.16:0)+fl*.18;
 B[1].multiplyMatrices(B[0],_pgM[1].makeRotationFromEuler(_pgE.set(-lean,-bd.yaw*1.7,-bd.roll*.6,'YXZ')));
 B[2].multiplyMatrices(B[1],_pgM[1].makeRotationFromEuler(_pgE.set(lean*.75-(n.phone&&!fl?.35:0)+(n.old?.12:0),bd.yaw*.75+Math.sin(T*.37+n.blk)*.35*idle,bd.roll*.4,'YXZ')).setPosition(0,.62*sc,0));
 // braccia in opposizione alle gambe; in fuga alzate e agitate
 for(const k of[0,1]){const sg=k?1:-1,G=k?_pgR:_pgL,sw=-(G.h-.17-(.36-.17)*run)*(.62+.35*run)*walk,abd=sg*(.07+run*.12+.03*idle);
  const ax=fl?-2.7+Math.sin(n.ph*2+k)*.3:(k&&n.phone?-.42:sw);B[k?5:3].multiplyMatrices(B[1],_pgM[1].makeRotationFromEuler(_pgE.set(ax,0,abd)).setPosition(sg*(n.f?.2:.23)*sc,.58*sc,0));
  const el=fl?.3:(k&&n.phone?1.55:.22+Math.max(0,-sw)*.35+run*1.15);B[k?6:4].multiplyMatrices(B[k?5:3],_pgM[1].makeRotationX(el).setPosition(0,-.32*sc,0));}
 // gambe: anca, ginocchio, caviglia (piede nuovo)
 for(const k of[0,1]){const sg=k?1:-1,G=k?_pgR:_pgL,hip=G.h*walk+(1-walk)*(.02+(k?-ws:ws)*.04)+up*1.2,knee=G.k*walk+(1-walk)*(.04+Math.max(0,k?ws:-ws)*.12),ank=G.a*walk;
  B[k?9:7].multiplyMatrices(B[0],_pgM[1].makeRotationX(hip).setPosition(sg*.1*sc,-.02*sc,0));
  B[k?10:8].multiplyMatrices(B[k?9:7],_pgM[1].makeRotationX(-knee-up*2).setPosition(0,-.45*sc,0));
  if(B[11])B[k?12:11].multiplyMatrices(B[k?10:8],_pgM[1].makeRotationX(ank+(knee-hip)*.15*walk).setPosition(0,-.43*sc,0));}
 // pose speciali delle patch precedenti (stesso risultato di prima): valigia trascinata, mani alzate / ammanettato
 if(n.lug&&!n.rag&&!(n.flee>0)){_pgM[1].makeRotationFromEuler(_pgE.set(-.42-(sp>.2?.04*Math.sin(n.ph):0),0,-.07)).setPosition(-(n.f?.2:.23)*sc,.58*sc,0);B[3].multiplyMatrices(B[1],_pgM[1]);B[4].multiplyMatrices(B[3],_pgM[1].makeRotationX(.04).setPosition(0,-.32*sc,0));}
 if(n.pose){const h=n.pose==='hands';for(const k of[0,1]){const sg=k?1:-1,ax=h?-2.85:(k?1.42:1.3),az=h?sg*.22:(k?-.1:.33);
   B[k?5:3].multiplyMatrices(B[1],_pgM[1].makeRotationFromEuler(_pgE.set(ax,0,az)).setPosition(sg*(n.f?.2:.23)*sc,.58*sc,0));B[k?6:4].multiplyMatrices(B[k?5:3],_pgM[1].makeRotationX(h?-.3:.1).setPosition(0,-.32*sc,0));}}};
{const rb0=ragBones;ragBones=function(n){rb0(n);const B=n.B;if(B[11]){B[11].multiplyMatrices(B[8],_pgM[2].makeTranslation(0,-.43*n.sc,0));B[12].multiplyMatrices(B[10],_pgM[2].makeTranslation(0,-.43*n.sc,0));}};}
// ---------- protagonista: modello nuovo con la stessa gerarchia (bacino, busto, testa, braccia, gambe, piedi) ----------
makeChar=function(){const M=(c,r,o)=>new THREE.MeshStandardMaterial(Object.assign({color:lc(c),roughness:r},o||{}));
 const mt={skin:M(0xd9a27a,.55),hood:new THREE.MeshPhysicalMaterial({color:lc(0x23344d),roughness:.85,sheen:1,sheenColor:lc(0x6688bb),sheenRoughness:.6}),hood2:M(0x1a2638,.9),jeans:M(0x2c4468,.88),jeans2:M(0x22385a,.9),shoe:M(0xeeeeee,.45),sole:M(0x1b1b1b,.8),hair:M(0x2a1a10,.7),white:M(0xf4f4f4,.25),dark:M(0x080808,.2),iris:M(0x3a2414,.3),mouth:M(0x8a4a44,.6),metal:M(0xb8b8b8,.3,{metalness:.9}),dev:M(0x15171a,.35,{metalness:.6}),red:M(0xcc2222,.6),glow:new THREE.MeshBasicMaterial({color:new THREE.Color(3,.6,.5)})};
 const G=npcGeos();const add=(p,g,m,x,y,z,sx,sy,sz,rx,ry,rz)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);if(sx!==undefined)o.scale.set(sx,sy,sz);if(rx||ry||rz)o.rotation.set(rx||0,ry||0,rz||0);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;},grp=(p,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;};
 const root=new THREE.Group();root.scale.setScalar(.88);const hips=grp(root,0,.92,0),torso=grp(hips,0,0,0);
 // bacino (jeans), cintura, tasche
 add(hips,G.torso,mt.jeans,0,.02,0,.37,.26,.25);add(hips,new THREE.TorusGeometry(.5,.08,6,24).rotateX(Math.PI/2),mt.sole,0,.12,0,.37,.5,.25);add(hips,rboxGeo(1,1,1,.3,1),mt.metal,0,.12,-.128,.06,.04,.012);
 for(const s of[-1,1])add(hips,rboxGeo(1,1,1,.2,1),mt.jeans2,s*.1,.0,.128,.12,.12,.01);
 // felpa: busto, fascia in vita, tasca a marsupio, zip, cappuccio ripiegato dietro il collo, coulisse
 add(torso,G.torso,mt.hood,0,.33,0,.5,.64,.31);add(torso,G.torso,mt.hood2,0,.06,0,.47,.1,.29);
 add(torso,rboxGeo(1,1,1,.35,2),mt.hood,0,.16,-.13,.32,.16,.05);add(torso,new THREE.BoxGeometry(.012,.44,.012),mt.metal,0,.36,-.158);
 add(torso,new THREE.TorusGeometry(.13,.06,8,20,Math.PI*1.25).rotateZ(-Math.PI*.12),mt.hood,0,.62,.07,1.25,.9,1,1.25,0,0);add(torso,G.sph,mt.hood2,0,.6,.15,.3,.2,.16);
 for(const s of[-1,1]){add(torso,new THREE.CylinderGeometry(.006,.006,.17,5),mt.white,s*.05,.5,-.158);add(torso,G.sph,mt.white,s*.05,.41,-.158,.018,.025,.018);}
 add(torso,G.limb,mt.skin,0,.66,0,.11,.14,.11);
 // testa scolpita (stessa forma delle persone: naso, zigomi, mento), occhi, sopracciglia, orecchie, capelli con ciuffo
 const head=grp(torso,0,.69,0);add(head,G.head,mt.skin,0,.2,0,.235,.3,.26);const eyes=[];
 for(const s of[-1,1]){const e=grp(head,s*.052,.235,-.112);add(e,G.sph,mt.white,0,0,0,.05,.034,.02);add(e,G.sph,mt.iris,0,0,-.008,.026,.026,.012);add(e,G.sph,mt.dark,0,0,-.012,.012,.012,.006);eyes.push(e);
  add(head,rboxGeo(1,1,1,.3,1),mt.hair,s*.052,.273,-.118,.06,.013,.016,0,0,s*-.08);add(head,G.sph,mt.skin,s*.118,.21,.005,.028,.065,.048);}
 add(head,rboxGeo(1,1,1,.4,1),mt.mouth,0,.138,-.118,.064,.016,.014);
 add(head,G.hair,mt.hair,0,.24,.012,.268,.29,.296);add(head,rboxGeo(1,1,1,.4,2),mt.hair,0,.33,-.105,.2,.07,.07,.35,0,0);for(const s of[-1,1])add(head,rboxGeo(1,1,1,.4,1),mt.hair,s*.112,.25,-.02,.04,.12,.16);
 // braccia: maniche della felpa, polsini, mani con le dita
 const arm=s=>{const sh=grp(torso,s*.235,.56,0);add(sh,G.sph,mt.hood,0,-.02,0,.16,.15,.16);add(sh,G.limb,mt.hood,0,-.16,0,.15,.34,.16);const el=grp(sh,0,-.31,0);
  add(el,G.limb,mt.hood,0,-.14,0,.135,.3,.14);add(el,G.limb,mt.hood2,0,-.28,0,.13,.06,.135);add(el,G.hand,mt.skin,0,-.36,-.005,.095,.165,.065,0,s<0?0:Math.PI,0);return [sh,el];};
 const [aL,eL]=arm(-1),[aR,eR]=arm(1);const dev=add(eR,rboxGeo(1,1,1,.2,1),mt.dev,0,-.25,-.07,.07,.06,.2);add(eR,new THREE.BoxGeometry(.075,.012,.14),mt.glow,0,-.218,-.08);
 // gambe: jeans con ginocchio, orlo; scarpe da ginnastica con suola, punta, lacci e baffo rosso
 const leg=s=>{const hp=grp(hips,s*.1,-.02,0);add(hp,G.limb,mt.jeans,0,-.22,0,.18,.47,.19);const kn=grp(hp,0,-.43,0);add(kn,G.limb,mt.jeans,0,-.2,0,.155,.42,.165);add(kn,G.limb,mt.jeans2,0,-.38,0,.165,.06,.175);
  const ft=grp(kn,0,-.42,0);add(ft,G.shoe,mt.shoe,0,-.035,-.045,.14,.12,.29);add(ft,G.shoe,mt.sole,0,-.085,-.045,.148,.036,.3);add(ft,rboxGeo(1,1,1,.3,1),mt.white,0,.015,-.12,.07,.012,.12);
  add(ft,new THREE.BoxGeometry(.006,.045,.15),mt.red,s*.071,-.04,-.03);return [hp,kn,ft];};
 const [lL,kL,fL]=leg(-1),[lR,kR,fR]=leg(1);root.traverse(o=>o.layers.set(1));scene.add(root);
 CH={root,hips,torso,head,aL,eL,aR,eR,lL,kL,lR,kR,fL,fR,eyes,dev,glowMat:mt.glow,blink:2};
 VM=new THREE.Group();add(VM,G.limb,mt.hood,0,0,0,.13,.46,.14,Math.PI/2,0,0);add(VM,G.limb,mt.hood2,0,0,-.21,.125,.05,.13,Math.PI/2,0,0);add(VM,G.hand,mt.skin,0,-.01,-.3,.095,.165,.065,Math.PI/2,0,0);add(VM,rboxGeo(1,1,1,.2,1),mt.dev,0,-.02,-.12,.07,.06,.2);add(VM,new THREE.BoxGeometry(.075,.012,.14),mt.glow,0,.015,-.12);
 VM.traverse(o=>{o.layers.set(1);o.castShadow=false;});VM.visible=false;VM.position.set(.26,-.24,-.42);VM.rotation.set(.08,.1,0);camera.add(VM);};
// ---------- protagonista: passo vero (dopo l'animazione di base, solo a piedi sul suolo) ----------
{const ac0=animChar;animChar=function(dt){ac0(dt);const P=player,C=CH;if(!C||P.mode!=='walk'||P.swim||P.fly||!P.ground)return;
 const sp=Math.hypot(P.vx,P.vz),walk=clamp(sp/4.2,0,1),run=clamp((sp-4.6)/3.2,0,1),t=((P.ph/6.2832)%1+1)%1,T=U.uTime.value;
 const L=gtLeg(t,run,_pgL),R=gtLeg((t+.5)%1,run,_pgR),bd=gtBody(t,run,walk,_pgB),idle=1-walk,ws=Math.sin(T*.31)*idle;
 C.hips.position.y=.92+bd.bob*1.1;C.hips.position.x=bd.sway+ws*.015;C.hips.rotation.set(0,bd.yaw,bd.roll+ws*.025);
 C.lL.rotation.set(L.h*walk+(1-walk)*(.02+ws*.04),0,-.02);C.lR.rotation.set(R.h*walk+(1-walk)*(.02-ws*.04),0,.02);
 C.kL.rotation.x=-(L.k*walk+(1-walk)*(.04+Math.max(0,-ws)*.12));C.kR.rotation.x=-(R.k*walk+(1-walk)*(.04+Math.max(0,ws)*.12));
 C.fL.rotation.x=L.a*walk+(L.k-L.h)*.12*walk;C.fR.rotation.x=R.a*walk+(R.k-R.h)*.12*walk;
 const lean=bd.lean;C.torso.rotation.set(-lean,-bd.yaw*1.7,-bd.roll*.6,'YXZ');
 if(!(P.aimT>0)){const swL=-(L.h-.17-(.36-.17)*run)*(.62+.35*run)*walk,swR=-(R.h-.17-(.36-.17)*run)*(.62+.35*run)*walk;
  C.aL.rotation.set(swL,0,-.07-run*.12-.02*idle);C.aR.rotation.set(swR,0,.07+run*.12+.02*idle);C.eL.rotation.x=.2+Math.max(0,-swL)*.35+run*1.15;C.eR.rotation.x=.2+Math.max(0,-swR)*.35+run*1.15;
  C.head.rotation.set(lean*.8,bd.yaw*.75+(walk<.05?Math.sin(T*.37)*.15:0),bd.roll*.4,'YXZ');}};}
