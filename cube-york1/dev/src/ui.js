/* ---------- integrazione con il gioco: caricamento, passo per fotogramma, ricostruzione, menu ---------- */
{const g0=genCity;genCity=function(){g0();nvTowers();nvGen();apGen();};}
{const p0=buildProps;buildProps=function(){p0();nvProps();apProps();};}
{const c0=buildCars;buildCars=function(){c0();nvCars();apCars();for(const k in PC.m)PC.m[k].count=k==='wheel'?PC.slots.length*4:PC.slots.length;
 PC.grid=new Map();for(const sl of PC.slots){const k=pgKey(Math.floor(sl.x/16),Math.floor(sl.z/16));let a=PC.grid.get(k);if(!a)PC.grid.set(k,a=[]);a.push(sl);}};}
{const w0=buildWorld;buildWorld=function(){w0();htMats();for(const T of HT.L)htBuild(T);nvAcc();ovMesh(OVL[0],ovMat('nova',nvGLSL()));nvShore();nvScreens();apBuild();lpBuild();
 for(const A of HT.acc){A.p0=A.obj.position.clone();A.q0=A.obj.quaternion.clone();}for(const g of AP.glass){g.m0=Array.from(g.gI.instanceMatrix.array.slice(g.i*16,g.i*16+16));g.f0=Array.from(g.fI.instanceMatrix.array.slice(g.i*16,g.i*16+16));}
 for(const T of AP.tanks)T.mat0=[T.body.material,T.top.material];flInit();};}
lampList=function(){const L=[],seen=new Set();for(const a of propGrid.values())for(const it of a){if(it.k&&(it.k.name==='lamp'||it.k.name==='nlamp')&&!seen.has(it)){seen.add(it);L.push(it);}}return L;};
{const f0=frameUpdate;frameUpdate=function(dt){f0(dt);htStep(dt);apStep(dt);flStep(dt);if(LP.m)LP.m.material.uniforms.uFd.value=scene.fog.density*.65;};}
{const ps0=playerStep;playerStep=function(dt){ps0(dt);apRampsPlayer();flPlayerPush();};}
// ricostruzione: grattacieli, vetrate, depositi, pontili, aerei e orario tornano come all'inizio
{const r0=resetCity;resetCity=function(){for(const v of LN.list.slice()){v.dead=true;scene.remove(v.obj);if(v.ai&&v.ai.tug)scene.remove(v.ai.tug);const j=CVS.indexOf(v);if(j>=0)CVS.splice(j,1);}LN.list.length=0;LN.wrecks=[];FL.list.length=0;FL.rwyBusy={CYI:null,CYW:null};
 for(const k of ['CYI','CYW'])for(const s of AP[k].stands)s.occ=null;for(const J of AP.jb){J.dock=null;J.door=null;J.t=0;apJbPose(J);}
 r0();
 for(const ch of HT.chunks){scene.remove(ch.m);ch.m.geometry.dispose();}HT.chunks.length=0;HT.dirty.clear();
 for(const T of HT.L){T.alive.fill(1);T.cnt=T.N;T.dead=false;T.collapsing=false;for(let c=0;c<T.N;c++)T.hp[c]=c>=T.nF*T.S?T.hp0*4:T.hp0*(Math.floor(c/T.S)===0?1.6:1);T.on.array.fill(1);T.on.updateRange.offset=0;T.on.updateRange.count=-1;T.on.needsUpdate=true;T.lo=1e9;T.hi=-1;
  if(T.dmesh){scene.remove(T.dmesh);T.dmesh.geometry.dispose();T.dmesh=null;}}
 for(const A of HT.acc){A.gone=false;if(A.link)A.link.gone=false;scene.add(A.obj);A.obj.visible=true;if(A.p0){A.obj.position.copy(A.p0);A.obj.quaternion.copy(A.q0);}}
 if(LP.m){const a=LP.m.geometry.attributes.aS;for(let i=0;i<a.count;i++)a.array[i*3]=LP.a[i*9+6];a.needsUpdate=true;}
 for(const g of AP.glass){g.alive=true;if(g.m0){g.gI.instanceMatrix.array.set(g.m0,g.i*16);g.fI.instanceMatrix.array.set(g.f0,g.i*16);}g.gI.instanceMatrix.needsUpdate=true;g.fI.instanceMatrix.needsUpdate=true;}
 for(const T of AP.tanks){T.alive=true;T.hp=1;T.g.scale.set(1,1,1);T.g.rotation.z=0;if(T.mat0){T.body.material=T.mat0[0];T.top.material=T.mat0[1];}}
 for(const k of ['CYI','CYW']){const A=AP[k];apFrame(A.termB);for(const h of A.hang||[])apHollow(h);}
 FL.clock=0;flInit();};}
/* ---------- menu: voli di linea, incidenti, viaggi rapidi ---------- */
{const s0=setSeg;setSeg=function(k,v){if(k==='flights'||k==='acc'){S[k]=v;store.set(k,v);if(k==='flights'&&v==='0'){for(const u of LN.list.slice())if(u.ai&&!u.dead)flGone(u,true);FL.list.length=0;}if(k==='flights'&&v!=='0'&&!LN.list.some(x=>x.ai))flInit();refreshSegs();if(k==='acc')toast(['Incidenti aerei disattivati.','Incidenti aerei rari.','Incidenti aerei frequenti.'][+v]);return;}s0(k,v);};}
const TRAVEL=[['Manhattan',11,40,0],['Distretto Nova',1712,1250,0],['Aeroporto internazionale',2862,1338,Math.PI],['Aeroporto ovest',-2748,1796,Math.PI],['Pista CYI (in volo)',1200,1700,-Math.PI/2]];
function travelTo(i){const t=TRAVEL[i];if(player.veh)exitVehicle();const P=player;P.fly=i===4;P.x=t[1];P.z=t[2];P.y=i===4?160:groundPl(P.x,P.z)+.05;P.vx=P.vy=P.vz=0;P.yaw=t[3];P.pitch=-.05;P.mode='walk';worldForce(P.x,P.z);LOD.forceNext=true;FOREST.dirty=true;resume();toast('Sei arrivato: '+t[0]+'.');}
{const b0=buildUI;buildUI=function(){b0();if(!S.flights)S.flights=store.get('flights','1');if(!S.acc)S.acc=store.get('acc','1');
 const segs={flights:[['0','Nessuno'],['1','Normali'],['2','Tanti']],acc:[['0','Mai'],['1','Rari'],['2','Frequenti']]};
 document.querySelectorAll('.segx').forEach(el=>{const k=el.dataset.seg;el.className='seg';el.innerHTML='';for(const [v,l] of segs[k]){const b=document.createElement('button');b.textContent=l;b.dataset.v=v;b.addEventListener('click',()=>setSeg(k,v));el.appendChild(b);}});
 const row=$('#tpRow');if(row){row.innerHTML='';TRAVEL.forEach((t,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=t[0];b.addEventListener('click',()=>travelTo(i));row.appendChild(b);});}refreshSegs();};}
{const h0=updHUD;updHUD=function(dt){h0(dt);const P=player;if(hudT!==.25)return;
 if(P.mode==='liner')$('#hint').textContent=IS_TOUCH?'Joystick: muso e rollio · Su/Giù motore · Corri inversori/aerofreni · Usa carrello · Salta flap':'Spazio/C motore, W/S muso, A/D rollio (a terra sterza), Q/E timone, Shift inversori, G carrello, R flap, V visuale, F per scendere';
 else if(P.mode==='walk'&&!P.fly){const v=nearestVehicle();if(v&&v.type==='liner')$('#hint').textContent=(IS_TOUCH?'Tocca Guida per ':'Premi F per ')+'salire ai comandi dell’aereo di linea';}
 if(IS_TOUCH&&P.mode==='liner'){$('#tUp').classList.remove('hidden');$('#tDown').classList.remove('hidden');}};}
