/* ======================= PATCH AB — VETRI CHE RIFLETTONO DAVVERO ======================= */
// Prima i vetri riflettevano solo un cielo calcolato (o un palazzo di fronte inventato): da lontano una torre di
// vetro sembrava trasparente, con il cielo "dietro". Ora una mappa cubica viene ridisegnata di continuo dalla posizione
// della telecamera (una faccia per fotogramma, due su ultra: niente scatti, ogni faccia è sempre la più recente),
// con palazzi, strade, terreno, acqua e cielo veri. Il vetro la legge con la correzione di parallasse (sfera di 150 m:
// i palazzi vicini si riflettono nel punto giusto), con Fresnel, con una leggera deformazione diversa per ogni lastra
// (le facciate continue non sono mai perfettamente piane) e sfocata dove il materiale è ruvido (pannelli metallici).
const GC={rt:null,cam:null,face:0,hid:[],kt:0,keep:new WeakMap(),on:false};
U.tGC={value:null};U.uGCP={value:new THREE.Vector3()};U.uGCOn={value:0};U.uGCR={value:150};
function gcSize(){return QP===PRESETS.ultra?384:(QP===PRESETS.alta?256:128);}
// due mappe che si alternano: si disegna in una mentre i vetri leggono l'altra (mai lettura e scrittura sulla stessa:
// sarebbe un circolo vizioso che la scheda video rifiuta); ogni 6 facce le due si scambiano
function gcMk(sz){return new THREE.WebGLCubeRenderTarget(sz,{type:HDR,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter});}
function gcInit(){const sz=gcSize();if(GC.rt)GC.rt.dispose();if(GC.rd)GC.rd.dispose();GC.rt=gcMk(sz);GC.rd=gcMk(sz);
 GC.cam=new THREE.CubeCamera(.5,3000,GC.rt);U.tGC.value=GC.rd.texture;GC.sz=sz;GC.n=0;GC.face=0;GC.p0=new THREE.Vector3();U.uGCOn.value=0;}
// nella mappa entrano solo le cose grandi (palazzi, suolo, terreno, acqua, cielo, ponti, torri): le piccole costerebbero troppo
function gcBig(o){if(o===sky||o===bldMesh||o===cellMesh||o===jagMesh||o===waterMesh)return true;const m=o.material;if(!m||Array.isArray(m))return false;
 if(m===groundMat||m===facStatic||m===facDyn||m===waterMat||(m.userData&&m.userData.water)||(typeof HT!=='undefined'&&m===HT.mat))return true;
 if(TERR.L.some(L=>L.m===o)||(DES.base&&o===DES.base))return true;
 if(o.isInstancedMesh)return false;const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return false;if(g.attributes.position.count>3000)return true;
 if(!g.boundingSphere)g.computeBoundingSphere();return !!g.boundingSphere&&g.boundingSphere.radius*Math.max(o.scale.x,o.scale.y,o.scale.z)>45;}
function gcStep(){if(QP===PRESETS.bassa||!state||state==='title'){U.uGCOn.value=0;return;}if(!GC.rt||GC.sz!==gcSize())gcInit();
 const c=camera.position,cam=GC.cam,hid=GC.hid;cam.position.copy(c);cam.updateMatrixWorld(true);hid.length=0;
 for(const o of scene.children){if(!o.visible)continue;let k=GC.keep.get(o);if(k===undefined){k=gcBig(o);GC.keep.set(o,k);}if(!k){o.visible=false;hid.push(o);}}
 const keep=renderer.getRenderTarget(),snu=renderer.shadowMap.needsUpdate;renderer.shadowMap.needsUpdate=false;
 try{const nf=QP===PRESETS.ultra?2:1;for(let i=0;i<nf;i++){const f=GC.face;if(f===0)GC.p0.copy(c);GC.face=(GC.face+1)%6;renderer.setRenderTarget(GC.rt,f);renderer.clear();renderer.render(scene,cam.children[f]);
   if(GC.face===0){const t=GC.rt;GC.rt=GC.rd;GC.rd=t;U.tGC.value=GC.rd.texture;U.uGCP.value.copy(GC.p0);GC.n++;if(GC.n>=1)U.uGCOn.value=1;}}}
 finally{renderer.setRenderTarget(keep);renderer.shadowMap.needsUpdate=snu;for(const o of hid)o.visible=true;}}
{const rp=renderPost;renderPost=function(){try{gcStep();}catch(e){U.uGCOn.value=0;if(!GC.err){GC.err=1;console.warn('mappa riflessi',e);}}rp();};}
// ---------- nel materiale delle facciate: riflesso vero al posto del cielo calcolato e del palazzo inventato ----------
const GC_LIGHT=`{float ct=clamp(dot(normal,normalize(vViewPosition)),0.,1.),fp=pow(1.-ct,5.),fr=fF0+(1.-fF0)*fp;
 if(fGl>0.){vec3 Vw=normalize(vRest-cameraPosition),Nw=normalize(vRN+fPert),Rw=reflect(Vw,Nw);vec3 rc;
  if(uGCOn>.5){vec3 d=vRest-uGCP;float b=dot(d,Rw),c=dot(d,d)-uGCR*uGCR;vec3 dir=Rw;if(c<0.){float t=-b+sqrt(max(b*b-c,0.));dir=d+Rw*t;}
   rc=textureCube(tGC,dir,clamp(fRough*14.,0.,5.)).rgb;}
  else if(fCan>0.)rc=fCanC*1.15;else rc=skyR(Rw);
  reflectedLight.indirectSpecular=mix(reflectedLight.indirectSpecular,rc*fr,fGl);
  // la luce delle stanze arriva attraverso il vetro: dove il vetro riflette (di taglio) se ne vede meno
  totalEmissiveRadiance*=1.-.9*fr*fGl;}
 else if(fCan>0.)reflectedLight.indirectSpecular=mix(reflectedLight.indirectSpecular,fCanC*fr*1.15,fCan);}`;
function gcInject(m){if(!m)return;const ob=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.tGC=U.tGC;sh.uniforms.uGCP=U.uGCP;sh.uniforms.uGCOn=U.uGCOn;sh.uniforms.uGCR=U.uGCR;
  let f=sh.fragmentShader;if(f.indexOf(CANYON_LIGHT)<0){console.warn('vetri: punto di innesto non trovato');return;}
  f=f.replace(CANYON_LIGHT,GC_LIGHT).replace('void main() {','uniform samplerCube tGC;uniform vec3 uGCP;uniform float uGCOn;uniform float uGCR;\nvoid main() {');
  // ogni lastra leggermente storta: il riflesso si spezza tra un vetro e l'altro come nelle facciate continue vere
  f=f.replace('fAlb=mix(wall,gA,gl);','fPert+=vec3(h21(wid+5.3)-.5,(h21(wid+7.1)-.5)*.6,h21(wid+9.7)-.5)*.022*gl*(1.-aa);fAlb=mix(wall,gA,gl);');
  sh.fragmentShader=f;};}
gcInject(facStatic);gcInject(facDyn);
