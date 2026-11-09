/* ======================= PATCH AB — LUCE CALCOLATA DAL CIELO E OMBRE SU TUTTA LA CITTÀ ======================= */
// - Il colore del sole è quello che arriva davvero attraverso l'atmosfera in quel momento (bianco a mezzogiorno,
//   dorato nel pomeriggio, arancio-rosso al tramonto, smorzato dalla foschia), la luce diffusa del cielo ha il colore
//   del cielo calcolato e quella che rimbalza dal suolo il colore del suolo illuminato.
// - Ombre a due livelli: la mappa vicina (nitida, attorno al giocatore) e una mappa lontana di 1,4 km che contiene
//   palazzi e torri: dall'alto ogni grattacielo proietta la sua ombra sulla città, non solo quelli vicini.
//   La mappa lontana si ridisegna solo quando serve (la telecamera si è spostata o il sole è cambiato) e contiene
//   solo gli oggetti grandi, quindi costa poco.
const SFAR={L:null,ext:720,t:0,px:1e9,pz:1e9,sd:new THREE.Vector3(),n:0};
function sfarRes(){return QP===PRESETS.ultra?4096:(QP===PRESETS.alta?2048:1536);}
function sfarInit(){if(QP===PRESETS.bassa||SFAR.L)return;const L=new THREE.DirectionalLight(0xffffff,0);L.castShadow=true;const r=sfarRes();L.shadow.mapSize.set(r,r);L.shadow.bias=-.0016;L.shadow.normalBias=.9;L.shadow.radius=2;
 const c=L.shadow.camera,e=SFAR.ext;c.left=-e;c.right=e;c.top=e;c.bottom=-e;c.near=1;c.far=4000;c.updateProjectionMatrix();c.layers.set(5);L.shadow.autoUpdate=false;L.shadow.needsUpdate=true;scene.add(L);scene.add(L.target);SFAR.L=L;
 // nella mappa lontana entrano solo palazzi e torri (livello 5)
 for(const o of [bldMesh,cellMesh,jagMesh])if(o)o.layers.enable(5);if(typeof HT!=='undefined'&&HT.L)for(const T of HT.L){if(T.mesh)T.mesh.layers.enable(5);if(T.dmesh)T.dmesh.layers.enable(5);}}
function sfarStep(){if(!SFAR.L){if(QP!==PRESETS.bassa&&typeof bldMesh!=='undefined'&&bldMesh)sfarInit();return;}const L=SFAR.L,c=camera.position;SFAR.t++;
 if(SFAR.t%90===0&&typeof HT!=='undefined'&&HT.L)for(const T of HT.L){if(T.mesh)T.mesh.layers.enable(5);if(T.dmesh)T.dmesh.layers.enable(5);}
 const ts=2*SFAR.ext/L.shadow.mapSize.x,moved=Math.hypot(c.x-SFAR.px,c.z-SFAR.pz)>60,sunCh=SFAR.sd.distanceToSquared(sunDir)>1e-6;
 if(!moved&&!sunCh&&SFAR.t%120!==0)return;SFAR.px=c.x;SFAR.pz=c.z;SFAR.sd.copy(sunDir);
 // centro agganciato ai texel (niente tremolio delle ombre quando ci si muove)
 const r=Math.round((c.x*shR.x+c.z*shR.z)/ts)*ts,u=Math.round((c.x*shU.x+c.z*shU.z)/ts)*ts,f=c.x*sunDir.x+c.z*sunDir.z;
 const px=shR.x*r+shU.x*u+sunDir.x*f,py=shR.y*r+shU.y*u+sunDir.y*f,pz=shR.z*r+shU.z*u+sunDir.z*f;L.target.position.set(px,py,pz);L.position.set(px+sunDir.x*1800,py+sunDir.y*1800,pz+sunDir.z*1800);
 L.target.updateMatrixWorld();L.updateMatrixWorld();L.shadow.needsUpdate=true;SFAR.n++;}
{const r0=render0;render0=function(){try{sfarStep();}catch(e){if(!SFAR.err){SFAR.err=1;console.warn('ombre lontane',e);}}r0();};}
// nel calcolo della luce: vicino la mappa nitida, fuori (e nella fascia di raccordo) la mappa lontana
{const k='\t\tdirectLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;';
 const c=THREE.ShaderChunk.lights_fragment_begin;
 if(c.indexOf(k)>=0)THREE.ShaderChunk.lights_fragment_begin=c.replace(k,'\t\t#if NUM_DIR_LIGHT_SHADOWS > 1\n'
  +'\t\tif(UNROLLED_LOOP_INDEX==0){vec4 sc0=vDirectionalShadowCoord[ i ];vec3 s0=sc0.xyz/sc0.w;float e0=min(min(s0.x,1.-s0.x),min(s0.y,1.-s0.y));float w0=smoothstep(0.,.07,e0)*step(s0.z,1.);float shN=1.,shF=1.;\n'
  +'\t\t if(all(bvec2(directLight.visible,receiveShadow))){if(w0>0.)shN=getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] );\n'
  +'\t\t  if(w0<1.)shF=getShadow( directionalShadowMap[ 1 ], directionalLightShadows[ 1 ].shadowMapSize, directionalLightShadows[ 1 ].shadowBias, directionalLightShadows[ 1 ].shadowRadius, vDirectionalShadowCoord[ 1 ] );}\n'
  +'\t\t directLight.color*=mix(shF,shN,w0);}\n\t\telse\n\t\t#endif\n'+k);
 else console.warn('ombre lontane: punto di innesto non trovato');}
// ---------- colori della luce dal cielo calcolato ----------
const ALC={sun:new THREE.Color(),sky:new THREE.Color(),gnd:new THREE.Color()};
function alcStep(){if(!SKYC.ok||!SKYL.on)return;const sel=SKYL.sunEl;if(sel<-.03)return;const day=sst(-.03,.08,sel);
 // sole: colore dopo l'atmosfera (luminanza normalizzata a 1: la forza resta quella tarata per ogni ora)
 ALC.sun.copy(SKYC.sun);const m=Math.max(ALC.sun.r,ALC.sun.g,ALC.sun.b,1e-4);ALC.sun.multiplyScalar(1/m);sun.color.lerp(ALC.sun,.9*day);
 // cielo: lo zenit calcolato (normalizzato), il suolo: verde-grigio illuminato dal sole
 const z=SKYC.zen,zm=Math.max(z.r,z.g,z.b,1e-6);ALC.sky.setRGB(z.r/zm,z.g/zm,z.b/zm);hemi.color.lerp(ALC.sky,.85*day);
 ALC.gnd.setRGB(.34,.32,.27).multiply(ALC.sun);hemi.groundColor.lerp(ALC.gnd,.7*day);}
{const ls=lightStep;lightStep=function(dt){ls(dt);try{alcStep();}catch(e){}};}
