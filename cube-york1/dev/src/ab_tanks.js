/* ======================= PATCH AB — CARRI ARMATI: SOSPENSIONI, CINGOLI CHE SEGUONO IL TERRENO, PARTI MOBILI ======================= */
// - Ruote portanti con sospensioni vere: ognuna sale e scende sul terreno che ha sotto (molla e smorzatore), il ramo inferiore
//   del cingolo le segue (la curva del cingolo viene ricalcolata quando cambia), sui dossi il cingolo si piega davvero.
// - Maglie del cingolo con pattino, due rostri, denti di guida e perni; ruote più rotonde con mozzo bullonato e gomma bombata.
// - Antenna a frusta (due tratti) che oscilla con frenate, accelerazioni, curve e rotazioni della torretta.
// - Cannone che vibra dopo il colpo, mitragliatrice sul tetto che segue lo sguardo, fumo dallo scarico che si addensa
//   quando il motore tira, polvere dai cingoli sullo sterrato.
// ---------- ruote, ruote dentate, maglie ----------
wheelG=function(r,w,rub){const ri=r*(1-rub),P=[[0,-w*.42],[r*.12,-w*.43],[r*.2,-w*.47],[r*.26,-w*.5],[r*.34,-w*.5],[r*.42,-w*.44],[r*.6,-w*.36],[ri*.94,-w*.38],[ri*.97,-w*.43],[ri,-w*.5],[ri+(r-ri)*.55,-w*.5],[r*.985,-w*.46],[r,-w*.38],
  [r,w*.38],[r*.985,w*.46],[ri+(r-ri)*.55,w*.5],[ri,w*.5],[ri*.97,w*.43],[ri*.94,w*.38],[r*.6,w*.36],[r*.42,w*.44],[r*.34,w*.5],[r*.26,w*.5],[r*.2,w*.47],[r*.12,w*.43],[0,w*.42]];
 const g=new THREE.LatheGeometry(P.map(p=>new THREE.Vector2(p[0],p[1])),36),pa=g.attributes.position,col=new Float32Array(pa.count*3);
 for(let i=0;i<pa.count;i++){const rr=Math.hypot(pa.getX(i),pa.getZ(i)),k=rub>0&&rr>ri*.985?.13:(rr<r*.26?.55:1);col[i*3]=col[i*3+1]=col[i*3+2]=k;}g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const L=[g];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;for(const s of[-1,1])L.push(colorize(new THREE.CylinderGeometry(r*.035,r*.035,w*.08,6).translate(Math.cos(a)*r*.19,s*w*.48,Math.sin(a)*r*.19),.45,.45,.45));}
 L.push(colorize(new THREE.CylinderGeometry(r*.09,r*.11,w*.95,12),.4,.4,.4));
 return mergeGeos(L).rotateZ(Math.PI/2);};
trackSys=function(parent,S,mat){const cur=trackLoop(S),len=cur.getLength(),N=Math.floor(len/.165),pts=cur.getSpacedPoints(720),lk=Bin(),tw=S.tw;
 lk.add(new THREE.BoxGeometry(tw,.042,.14));
 for(const z of[-.035,.035])lk.add(new THREE.BoxGeometry(tw*.95,.028,.03),0,-.033,z);
 for(const x of(tw>.6?[-tw*.16,tw*.16]:[0]))lk.add(new THREE.BoxGeometry(.05,.085,.075),x,.06,0);
 lk.add(new THREE.CylinderGeometry(.013,.013,tw*1.03,6).rotateZ(Math.PI/2),0,0,.07);
 const im=new THREE.InstancedMesh(mergeBin(lk),mat,N);im.castShadow=im.receiveShadow=true;parent.add(im);const T={im,pts,N,len,off:0,S:Object.assign({},S,{road:S.road.map(q=>q.slice())}),road0:S.road.map(q=>q.slice()),dy:S.road.map(()=>0)};trackSet(T);return T;};
// ---------- parti aggiunte a ogni carro ----------
const ABTK={L:new Set()};
{const mk0=mkTank;mkTank=function(kind){const M=mk0(kind);try{abTankParts(M,kind);}catch(e){console.warn('carro: parti',e);}return M;};}
function abTankParts(M,kind){M.kind=kind;M.g.updateMatrixWorld(true);
 // ruote: quota di riposo e stato delle sospensioni
 M.RW.y0=M.RW.list.map(w=>w[1]);M.RW.dy=M.RW.list.map(()=>0);M.RW.vy=M.RW.list.map(()=>0);
 // scatola della torretta (nel sistema della torretta)
 const tb=new THREE.Box3();M.tur.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(M.tur.matrixWorld).invert();
 M.tur.traverse(o=>{if(!o.isMesh||o===M.gun||o.parent===M.gun||!o.geometry)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld).applyMatrix4(inv);tb.union(b);});
 if(tb.isEmpty())tb.set(new THREE.Vector3(-1,0,-1),new THREE.Vector3(1,1,1));M.tb=tb;
 const dk=MS(0x1c1c1a,.6,.5),gm=MS(0x2a2b2c,.45,.75);
 // antenna a frusta: base + due tratti incernierati
 if(kind!=='modern'){const an=new THREE.Group();an.position.set(tb.min.x+.22,tb.max.y-.02,tb.max.z-.3);M.tur.add(an);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.12,10).translate(0,.06,0),dk);an.add(base);
 const s1=new THREE.Group();s1.position.y=.12;an.add(s1);s1.add(new THREE.Mesh(new THREE.CylinderGeometry(.008,.012,1.3,6).translate(0,.65,0),dk));
 const s2=new THREE.Group();s2.position.y=1.3;s1.add(s2);s2.add(new THREE.Mesh(new THREE.CylinderGeometry(.003,.008,1.5,5).translate(0,.75,0),dk));
 M.ant={s1,s2,ax:0,az:0,vx:0,vz:0};}
 // mitragliatrice sul tetto (supporto girevole, culatta, canna con manicotto forato, cassetta delle munizioni)
 if(kind==='tiger'||kind==='sherman'){const mg=new THREE.Group();mg.position.set(tb.min.x+.55,tb.max.y,tb.min.z+.5*(tb.max.z-tb.min.z));M.tur.add(mg);
 mg.add(new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.22,10).translate(0,.11,0),dk));const gp=new THREE.Group();gp.position.y=.26;mg.add(gp);
 gp.add(new THREE.Mesh(new THREE.BoxGeometry(.11,.13,.42).translate(0,0,.05),gm));gp.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.55,10).rotateX(Math.PI/2).translate(0,.01,-.42),gm));
 gp.add(new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.55,8).rotateX(Math.PI/2).translate(0,.01,-.72),dk));gp.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.18).translate(.12,-.03,.05),MS(0x3d4532,.8,.2)));
 gp.add(new THREE.Mesh(new THREE.BoxGeometry(.02,.1,.1).translate(0,-.1,.2),dk));
 for(const o of mg.children)o.castShadow=true;M.mg={g:mg,p:gp};}
 // scarico: due tubi in coda (posizione dalla scatola dello scafo)
 const hb=new THREE.Box3();for(const o of M.body.children){if(o===M.tur)continue;hb.expandByObject(o);}M.hb=hb;M.ex=[[-.55,hb.max.y*.82,M.L/2-.25],[.55,hb.max.y*.82,M.L/2-.25]];M.fireT=9;ABTK.L.add(M);}
// ---------- ogni fotogramma: sospensioni, cingoli, antenna, mitragliatrice, cannone, fumo, polvere ----------
const _abtv=new THREE.Vector3(),_abtm=new THREE.Matrix4();
function abTankFrame(v,dt){const M=v.m;if(!M||!M.RW||!M.RW.y0)return;const cam=camera.position,dc=Math.hypot(v.px-cam.x,v.pz-cam.z);if(dc>220)return;
 M.body.updateMatrixWorld(true);const W=M.RW,mw=M.body.matrixWorld;let ch=false;
 // 1) sospensioni: ogni ruota cerca il suolo (corsa -12/+20 cm), molla-smorzatore
 for(let i=0;i<W.list.length;i++){const w=W.list[i];_abtv.set(w[0],W.y0[i]-W.r,w[2]).applyMatrix4(mw);const gy=groundH(_abtv.x,_abtv.z),tgt=clamp(gy-_abtv.y,-.12,.2);
  W.vy[i]+=((tgt-W.dy[i])*160-W.vy[i]*16)*dt;W.dy[i]+=W.vy[i]*dt;if(W.dy[i]>.2){W.dy[i]=.2;W.vy[i]=0;}if(W.dy[i]<-.12){W.dy[i]=-.12;W.vy[i]=0;}
  const ny=W.y0[i]+W.dy[i];if(Math.abs(ny-w[1])>.002){w[1]=ny;ch=true;}}
 if(ch)wheelSet(W);
 // 2) il ramo inferiore del cingolo segue le ruote (solo da vicino: costa)
 if(dc<90)for(const T of M.trk){if(!T.S||!T.road0)continue;let mx=0;const sx=Math.sign(T.S.x);
  for(let k=0;k<T.road0.length;k++){let s=0,c=0;for(let i=0;i<W.list.length;i++){const w=W.list[i];if(Math.sign(w[3])===sx&&Math.abs(w[2]-T.road0[k][0])<.05){s+=W.dy[i];c++;}}const d=c?s/c:0;mx=Math.max(mx,Math.abs(d-T.dy[k]));T.dy[k]=d;}
  if(mx>.006||T.dirty){T.dirty=false;for(let k=0;k<T.road0.length;k++)T.S.road[k][1]=T.road0[k][1]+T.dy[k];T.pts=trackLoop(T.S).getSpacedPoints(720);trackSet(T);}}
 // 3) antenna: frenate, accelerazioni, curve e rotazioni della torretta la fanno oscillare
 const A=M.ant;if(A){const sp=v.sp||0,acc=(sp-(v.abSp||0))/Math.max(dt,1e-3);v.abSp=sp;const ty=v.tyaw||0,tr=(ty-(v.abTy||0))/Math.max(dt,1e-3);v.abTy=ty;const yr=((v.yaw||0)-(v.abYw||0))/Math.max(dt,1e-3);v.abYw=v.yaw||0;
  const bump=(Math.random()-.5)*Math.min(12,Math.abs(sp))*.9;A.vx+=(-A.ax*55-A.vx*2.2-clamp(acc,-12,12)*1.5+bump)*dt;A.vz+=(-A.az*55-A.vz*2.2+clamp(yr*sp,-15,15)*.8+clamp(tr,-3,3)*3+bump*.6)*dt;A.ax=clamp(A.ax+A.vx*dt,-.45,.45);A.az=clamp(A.az+A.vz*dt,-.45,.45);
  A.s1.rotation.set(A.ax*.45,0,A.az*.45);A.s2.rotation.set(A.ax*.9,0,A.az*.9);}
 // 4) mitragliatrice: segue lo sguardo di chi guida (rispetto alla torretta), altrimenti torna in avanti
 if(M.mg){const tgt=v.drv?Math.atan2(Math.sin(player.yaw-(v.yaw+(v.tyaw||0))),Math.cos(player.yaw-(v.yaw+(v.tyaw||0)))):0;M.mg.g.rotation.y+=clamp(tgt-M.mg.g.rotation.y,-1.5*dt,1.5*dt);M.mg.p.rotation.x+=((v.drv?clamp(player.pitch,-.2,.5):0)-M.mg.p.rotation.x)*Math.min(1,dt*3);}
 // 5) cannone: vibrazione dopo il colpo (oltre al rinculo)
 if(v.rec>.98)M.fireT=0;M.fireT+=dt;if(M.fireT<1.2)M.gun.rotation.x+=.018*Math.exp(-M.fireT*5)*Math.sin(M.fireT*48);
 // 6) scarico: fumo grigio, nero quando il motore tira (partenza, salita)
 const tq=Math.abs((v.sp||0)-(v.abSp0||0))/Math.max(dt,1e-3);v.abSp0=v.sp||0;const load=clamp(tq*.25+(v.drv&&inp.mz?.35:0),0,1);
 if(dc<160&&(v.drv||Math.abs(v.sp||0)>.1)&&Math.random()<dt*(2+load*14)){for(const e of M.ex){_abtv.set(e[0],e[1],e[2]).applyMatrix4(mw);smoke(_abtv.x,_abtv.y,_abtv.z,rand(-.3,.3)+(v.vx||0)*.3,rand(.6,1.4),rand(-.3,.3)+(v.vz||0)*.3,.6+load*.6,rand(2,4),load>.4);}}
 // 7) polvere dai cingoli fuori dalle strade
 const as=Math.abs(v.sp||0);if(as>1.5&&dc<160&&Math.random()<dt*as*.9){const onR=typeof roadQ==='function'&&(()=>{const r=roadQ(v.px,v.pz);return r&&r.d<6;})();if(!onR&&!isCore(v.px,v.pz)){const sd=Math.random()<.5?-1:1,fz=v.sp>0?1:-1;_abtv.set(sd*(M.W/2-.3),.3,fz*M.L*.45).applyMatrix4(mw);dustPuff(_abtv.x,groundH(_abtv.x,_abtv.z)+.3,_abtv.z,1.2+as*.08);}}}
{const cf=cvFrame;cvFrame=function(dt){cf(dt);for(const v of CVS){if(v.type!=='tank'||v.dead)continue;try{abTankFrame(v,dt);}catch(e){if(!ABTK.err){ABTK.err=1;console.warn('carro: animazioni',e);}}}};}
