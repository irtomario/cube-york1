/* ======================= PATCH AB — LAMPIONI, RINGHIERE, GUARD RAIL ======================= */
// Lampioni: base ottagonale con flangia e bulloni, palo rastremato con collare, braccio curvo (a pastorale), armatura LED
// piatta con il vetro che si accende; di notte sotto ogni lampione il cono di luce si vede nell'aria (più nella nebbia e
// nella pioggia), più forte vicino alla lampada e al centro (dove la luce attraversa più aria), sfumato ai bordi.
// Il vecchio cono (solo nebbia) viene spento per non sommarsi a questo. Stessa cosa per i lampioni di Nova (più moderni, a lama).
// Ringhiera del lungofiume di Manhattan: prima erano due barre lunghe un chilometro sospese senza sostegni; ora montanti
// ogni 2,4 m, corrimano, due correnti e la grata a bacchette tra i montanti.
// Guard rail: nastro a doppia onda vero (profilo a W estruso) invece di tre scatole, con i distanziatori sui paletti.
const LMP={cone:null,coneMat:null};
function lmpConeMat(){if(LMP.coneMat)return LMP.coneMat;LMP.coneMat=new THREE.ShaderMaterial({uniforms:{uNight:U.uNight,uFogK:{value:1}},
 vertexShader:'varying float vY;varying vec3 vN;varying vec3 vV;varying float vD;void main(){vY=-position.y;vec4 wp=modelMatrix*vec4(position,1.);\n#ifdef USE_INSTANCING\nwp=modelMatrix*instanceMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix*instanceMatrix)*normal);\n#else\nvN=normalize(mat3(modelMatrix)*normal);\n#endif\nvV=normalize(cameraPosition-wp.xyz);vD=length(cameraPosition-wp.xyz);gl_Position=projectionMatrix*viewMatrix*wp;}',
 fragmentShader:'uniform float uNight;uniform float uFogK;varying float vY;varying vec3 vN;varying vec3 vV;varying float vD;void main(){float t=clamp(vY/7.2,0.,1.);float th=pow(abs(dot(normalize(vN),normalize(vV))),1.5);float a=(1.-t)*(1.-t)*(1.-t*.4)*th*smoothstep(.25,.6,uNight)*.03*uFogK*smoothstep(3.,11.,vD);gl_FragColor=vec4(vec3(1.,.84,.62)*a,1.);}',
 transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});return LMP.coneMat;}
function lmpGeos(nova){const T=[],c=(g,k)=>colorize(g,k,k,k);
 if(!nova){T.push(c(new THREE.CylinderGeometry(.17,.21,.46,8).translate(0,.23,0),.8));T.push(c(new THREE.CylinderGeometry(.24,.24,.04,8).translate(0,.02,0),.7));
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;T.push(c(new THREE.CylinderGeometry(.018,.018,.05,6).translate(Math.cos(a)*.2,.06,Math.sin(a)*.2),.5));}
  T.push(c(new THREE.LatheGeometry([[0,.4],[.105,.4],[.1,2],[.085,4.6],[.07,7.05],[0,7.1]].map(p=>new THREE.Vector2(p[0],p[1])),12),1));
  T.push(c(new THREE.CylinderGeometry(.1,.1,.12,12).translate(0,3.4,0),.75));
  const cv=new THREE.CatmullRomCurve3([new THREE.Vector3(0,6.9,0),new THREE.Vector3(0,7.32,-.25),new THREE.Vector3(0,7.48,-.85),new THREE.Vector3(0,7.42,-1.45),new THREE.Vector3(0,7.36,-1.6)]);T.push(c(new THREE.TubeGeometry(cv,24,.042,8,false),1));
  const hs=rboxGeo(.38,.1,.78,.04,2);T.push(c(hs.translate(0,7.33,-1.82),.55));T.push(c(new THREE.BoxGeometry(.06,.05,.16).translate(0,7.4,-1.5),.6));}
 else{T.push(c(new THREE.CylinderGeometry(.2,.24,.5,16).translate(0,.25,0),.8));T.push(c(new THREE.LatheGeometry([[0,.5],[.11,.5],[.09,4],[.06,7.62],[0,7.65]].map(p=>new THREE.Vector2(p[0],p[1])),16),1));
  T.push(c(new THREE.BoxGeometry(.05,.07,1.9).translate(0,7.45,-.9),.9));T.push(c(rboxGeo(.32,.06,.9,.025,2).translate(0,7.4,-1.78),.55));
  T.push(c(new THREE.BoxGeometry(.02,1.6,.02).translate(.065,5.4,0),.3));}
 const lens=nova?new THREE.BoxGeometry(.26,.012,.8).translate(0,7.365,-1.78):new THREE.BoxGeometry(.3,.012,.62).translate(0,7.275,-1.82);
 const cone=new THREE.ConeGeometry(nova?4.6:5.2,7.1,24,1,true).translate(0,-3.55,0).translate(0,nova?7.36:7.27,nova?-1.78:-1.82);
 return {pole:mergeGeos(T),lens,cone};}
function lmpUpgrade(k,nova){if(!k)return;const G=lmpGeos(nova),mat=new THREE.MeshStandardMaterial({vertexColors:true,color:lc(nova?0x7c8287:0x2b3134),roughness:nova?.35:.45,metalness:.8});
 k.parts[0].g=G.pole;k.parts[0].m=mat;k.parts[1].g=G.lens;
 k.meshes[0].geometry=G.pole;k.meshes[0].material=mat;k.fmeshes[0].geometry=G.pole;k.fmeshes[0].material=mat;k.meshes[1].geometry=G.lens;k.fmeshes[1].geometry=G.lens;
 // cono di luce: segue le istanze vicine del lampione (non è un pezzo fisico: non vola via se il lampione cade)
 const cm=new THREE.InstancedMesh(G.cone,lmpConeMat(),k.cap);cm.count=0;cm.frustumCulled=false;cm.castShadow=false;cm.receiveShadow=false;cm.renderOrder=7;scene.add(cm);k.meshes.push(cm);(LMP.cones||(LMP.cones=[])).push(cm);}
{const bp=buildProps;buildProps=function(){bp();try{lmpUpgrade(PK.lamp,false);}catch(e){console.warn('lampioni',e);}};}
{const bw=buildWorld;buildWorld=function(){bw();try{if(PK.nlamp&&!PK.nlamp.abL){PK.nlamp.abL=1;lmpUpgrade(PK.nlamp,true);}}catch(e){console.warn('lampioni Nova',e);}try{abRailing();}catch(e){console.warn('ringhiera',e);}};}
{const lt=lightStep;lightStep=function(dt){lt(dt);if(LMP.cones){const on=U.uNight.value>.25;const fk=1+(WX.rain||0)*2.5+(WX.fog||0)*3+(scene.fog?scene.fog.density*900:0);LMP.coneMat.uniforms.uFogK.value=Math.min(4,fk);for(const m of LMP.cones)m.visible=on;if(typeof LAMPL!=='undefined'&&LAMPL.cone)LAMPL.cone.visible=false;}};}
// ---------- ringhiera del lungofiume ----------
function abBarTex(){const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');g.clearRect(0,0,64,128);g.fillStyle='#ffffff';g.fillRect(28,0,8,128);
 const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=4;return t;}
function abRailing(){if(LMP.rail)return;let old=null;for(const o of scene.children)if(o.isInstancedMesh&&o.count===14&&o.material&&Math.abs(o.material.roughness-.4)<1e-3&&Math.abs(o.material.metalness-.7)<1e-3){old=o;break;}if(!old)return;
 const spans=[[-299.5,-697.5,581,0],[299.5,-697.5,581,0],[0,697.5,1180,0],[-589.5,-353.5,689,1],[-589.5,353.5,689,1],[589.5,-353.5,689,1],[589.5,353.5,689,1]];old.visible=false;LMP.rail=true;
 const met=new THREE.MeshStandardMaterial({color:lc(0x23272b),roughness:.4,metalness:.7}),bars=new THREE.MeshStandardMaterial({color:lc(0x23272b),roughness:.45,metalness:.65,map:abBarTex(),alphaTest:.5,side:THREE.DoubleSide});
 const rails=[],panels=[],posts=[];
 for(const [cx,cz,L,ax] of spans){const rot=ax?Math.PI/2:0;for(const [y,r] of[[1.08,.032],[.62,.018],[.16,.018]])rails.push(new THREE.CylinderGeometry(r,r,L,8).rotateZ(Math.PI/2).rotateY(rot).translate(cx,y,cz));
  const p=new THREE.PlaneGeometry(L,.44);const uv=p.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*L/.13);p.rotateY(rot).translate(cx,.39,cz);panels.push(p);const p2=new THREE.PlaneGeometry(L,.44);const uv2=p2.attributes.uv;for(let i=0;i<uv2.count;i++)uv2.setX(i,uv2.getX(i)*L/.13);p2.rotateY(rot).translate(cx,.84,cz);panels.push(p2);
  const n=Math.floor(L/2.4);for(let i=0;i<=n;i++){const t=-L/2+i*L/n;posts.push(ax?[cx,cz+t]:[cx+t,cz]);}}
 const rm=new THREE.Mesh(mergeGeos(rails.map(g=>colorize(g,1,1,1))),met);rm.castShadow=true;rm.receiveShadow=true;scene.add(rm);
 const pm=new THREE.Mesh(mergeGeos(panels.map(g=>colorize(g,1,1,1))),bars);pm.castShadow=true;pm.receiveShadow=true;scene.add(pm);
 const pg=mergeGeos([colorize(new THREE.CylinderGeometry(.04,.045,1.12,8).translate(0,.56,0),1,1,1),colorize(new THREE.CylinderGeometry(.07,.07,.04,8).translate(0,.02,0),1,1,1),colorize(new THREE.SphereGeometry(.05,8,6).translate(0,1.13,0),1,1,1)]);
 const im=new THREE.InstancedMesh(pg,met,posts.length);const o=new THREE.Object3D();posts.forEach((q,i)=>{o.position.set(q[0],0,q[1]);o.updateMatrix();im.setMatrixAt(i,o.matrix);});im.castShadow=true;im.receiveShadow=true;scene.add(im);}
