/* ======================= PATCH Z — PRESTAZIONI: oggetti ripetuti divisi a riquadri, spariscono quando sono lontani ======================= */
// In three r147 le InstancedMesh non vengono mai scartate fuori inquadratura: qui ogni gruppo ha la sua sfera di ingombro
// (geometria che condivide i buffer con l'originale) e oltre una certa distanza dalla camera non viene proprio disegnato.
const PZL={L:[],t:0};
function shareGeo(geo,sph){const g=new THREE.BufferGeometry();if(geo.index)g.setIndex(geo.index);for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);g.boundingSphere=sph;return g;}
function lodReg(o,far,cx,cy,cz,r){PZL.L.push({o,far,cx,cy,cz,r});}
function lodTick(dt,force){PZL.t-=dt;if(PZL.t>0&&!force)return;PZL.t=.25;const cp=camera.position;for(const e of PZL.L){const v=Math.hypot(cp.x-e.cx,cp.y-e.cy,cp.z-e.cz)-e.r<e.far;if(e.o.visible!==v)e.o.visible=v;}}
// istanze a riquadri: list = elementi qualsiasi, set(q,dm) posiziona l'oggetto di appoggio _dm
function tiledInst(geo,mat,list,o){const T=o.tile||400,map=new Map(),out=[];if(!list.length)return out;if(!geo.boundingSphere)geo.computeBoundingSphere();const gr=geo.boundingSphere.radius+geo.boundingSphere.center.length();
 for(const q of list){o.set(q,_dm);const k=Math.floor(_dm.position.x/T)*100003+Math.floor(_dm.position.z/T);let a=map.get(k);if(!a)map.set(k,a=[]);a.push(q);}
 for(const a of map.values()){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9,sm=0;const ms=[];
  for(const q of a){o.set(q,_dm);_dm.updateMatrix();ms.push(_dm.matrix.clone());const p=_dm.position;x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);sm=Math.max(sm,Math.abs(_dm.scale.x),Math.abs(_dm.scale.y),Math.abs(_dm.scale.z));}
  const c=new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),R=Math.hypot(x1-x0,y1-y0,z1-z0)/2+gr*sm;
  const im=new THREE.InstancedMesh(shareGeo(geo,new THREE.Sphere(c,R)),mat,a.length);im.userData.tag=o.tag||'tile';ms.forEach((m,i)=>im.setMatrixAt(i,m));im.frustumCulled=true;im.castShadow=!!o.cast;im.receiveShadow=o.recv!==false;
  if(o.colors)a.forEach((q,i)=>im.setColorAt(i,o.colors(q,i)));scene.add(im);lodReg(im,o.far||800,c.x,c.y,c.z,R);out.push(im);}
 return out;}
// una InstancedMesh già pronta: sfera calcolata dalle istanze, distanza massima di disegno
function boundInst(im,far){if(!im)return im;const g=im.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const gr=g.boundingSphere.radius+g.boundingSphere.center.length(),m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9,sm=0;for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);m.decompose(p,q,s);if(Math.max(s.x,s.y,s.z)<.01)continue;x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);sm=Math.max(sm,s.x,s.y,s.z);}
 if(x0>x1)return im;const c=new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),R=Math.hypot(x1-x0,y1-y0,z1-z0)/2+gr*sm;im.geometry=shareGeo(g,new THREE.Sphere(c,R));im.frustumCulled=true;if(far)lodReg(im,far,c.x,c.y,c.z,R);return im;}
// oggetti singoli (Mesh o Group): solo distanza
function lodObj(o,far){o.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(o);if(b.isEmpty())return o;const c=b.getCenter(new THREE.Vector3()),R=b.getSize(new THREE.Vector3()).length()/2;lodReg(o,far,c.x,c.y,c.z,R);return o;}
{const f0=frameUpdate;frameUpdate=function(dt){f0(dt);lodTick(dt);};}
// dettagli lontani di veicoli e velivoli (caccia, carri, elicotteri, auto): i pezzi piccoli passano su un livello che la telecamera non disegna
// (si usa il livello 5: la visibilità decisa dal gioco, per esempio fiamme o carrello, resta intatta)
const DLOD={t:0,objs:new Map(),v:new THREE.Vector3()};
function dlodVisit(o,px,py,pz,own,cp,n0,n1){if(!o)return;const d=Math.hypot(px-cp.x,py-cp.y,pz-cp.z),t=own?0:d<n0?0:d<n1?1:2;let e=DLOD.objs.get(o);if(!e){e={t:0};DLOD.objs.set(o,e);}if(e.t===t)return;e.t=t;
 o.updateMatrixWorld(true);o.traverse(q=>{if(!q.isMesh)return;const ud=q.userData;if(ud.lyr===undefined){ud.lyr=q.layers.mask;if(!q.geometry.boundingSphere)q.geometry.computeBoundingSphere();const s=q.getWorldScale(DLOD.v);ud.dr=(q.geometry.boundingSphere?q.geometry.boundingSphere.radius:1)*Math.max(s.x,s.y,s.z);}
  const keep=t===0||(t===1&&ud.dr>=.9)||(t===2&&ud.dr>=2.4);q.layers.mask=keep?ud.lyr:32;});}
function dlodTick(dt){DLOD.t-=dt;if(DLOD.t>0)return;DLOD.t=.4;const cp=camera.position,lo=S.q==='bassa',n0=lo?220:380,n1=lo?700:1100,P=player;
 for(const v of CVS){if(v.dead||v.type==='liner')continue;dlodVisit(v.obj,v.px,v.py,v.pz,P.veh===v,cp,n0,n1);}
 for(const b of helis)if(!b.dead)dlodVisit(b.obj,b.px,b.py,b.pz,P.veh===b,cp,n0,n1);
 for(const b of dynCars)if(!b.dead)dlodVisit(b.obj,b.px,b.py,b.pz,P.veh===b,cp,n0,n1);
 if(DLOD.objs.size>300)for(const o of [...DLOD.objs.keys()])if(!o.parent)DLOD.objs.delete(o);}
{const f1=frameUpdate;frameUpdate=function(dt){f1(dt);dlodTick(dt);};}
