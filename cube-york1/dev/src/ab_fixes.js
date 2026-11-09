/* ======================= PATCH AB — DIFETTI DEI VIDEO ======================= */
// 1) Crateri sulle strade: al posto delle lastre enormi disposte a corona come petali, il manto si rompe in frammenti
//    di misure vere (asfalto 25-90 cm, lastre del marciapiede fino a 1,2 m, zolle di terra), con il contorno spigoloso e
//    irregolare di un pezzo rotto, sparsi in modo disordinato, quasi tutti appena inclinati e solo alcuni ribaltati.
// 2) Fuoco "pixelato": il bagliore (bloom) dei livelli più piccoli veniva ingrandito in modo bilineare e si vedevano i
//    quadratini attorno a fiamme, scintille e luci. Ora i livelli larghi si ricampionano in modo bicubico (morbido).
//    In più la texture delle fiamme è a 256 px con lingue di fuoco a più scale (prima 128 px, a chiazze).
// ---------- 1) frammenti dei crateri ----------
function abFragGeo(seed,K){const r=trRnd(seed),n=6+Math.floor(r()*3),pts=[];let a=r()*.5;for(let i=0;i<n;i++){a+=6.2832/n*(.65+r()*.7);const rr=.36+r()*.16;pts.push(new THREE.Vector2(Math.cos(a)*rr,Math.sin(a)*rr));}
 const sh=new THREE.Shape(pts),g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false,curveSegments:1}).rotateX(-Math.PI/2).translate(0,-.5,0);const P=g.attributes.position,N=g.attributes.normal,col=[];
 for(let i=0;i<P.count;i++){const top=N.getY(i)>.5,c=top?K.top:K.side,k=.82+.36*r();col.push(c[0]*k,c[1]*k,c[2]*k);if(top)P.setY(i,P.getY(i)+(r()-.5)*.08);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;}
{const ri0=rcInit;rcInit=function(){const was=!!RCR.mats;ri0();if(was)return;try{for(let k=0;k<3;k++){const g=abFragGeo(31+k*7,RCK[k]);RCR.sl[k].m.geometry=g;RCR.ch[k].geometry=abFragGeo(61+k*5,RCK[k]);}}catch(e){console.warn('frammenti dei crateri',e);}};}
rcDebris=function(c,f){const R=c.R,n=Math.round((7+R*2.6)*f);
 // sul bordo: frammenti sollevati e inclinati, a distanze e angoli disordinati
 for(let i=0;i<n;i++){const a=Math.random()*6.2832;if(Math.random()<.15)continue;const s0=c.surf<0?0:c.surf,K=RCK[s0],big=Math.random()<.18;
  const lim=s0===1?[.4,1.2]:(s0===2?[.2,.6]:[.25,.9]),sx=rand(lim[0],big?lim[1]*1.4:lim[1]),sz=sx*rand(.55,1),tilt=Math.random()<.2?rand(.5,.95)*(Math.random()<.2?-1:1):rand(.04,.45);
  const rc=R*rcJit(c,a)*rand(.9,1.25)+sz*.4*Math.cos(tilt),x=c.x+Math.cos(a)*rc,z=c.z+Math.sin(a)*rc;if(!rcValid(c,x,z))continue;const s=rcSurfAt(c,x,z);if(s<0)continue;const K2=RCK[s];
  rcPlace(c,s,x,z,Math.random()*6.2832,tilt,sx,sz,rand(K2.th[0],K2.th[1]),-.04);}
 // scaglie sparse sul piano attorno
 const m=Math.round((6+R*2.4)*f);for(let i=0;i<m;i++){const a=rand(0,6.2832),r=R*rand(1.2,2.8),x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;const s=rcSurfAt(c,x,z);if(s<0||!rcValid(c,x,z))continue;const K=RCK[s],e=rand(.1,.35);
  rcPlace(c,s,x,z,rand(0,6.2832),rand(-.15,.15),e*rand(.8,1.4),e,rand(K.th[0],K.th[1])*.6,-.02);}
 // pezzi caduti dentro la buca
 const q=Math.round((5+R*1.9)*f);for(let i=0;i<q;i++){const a=rand(0,6.2832),r=R*Math.sqrt(Math.random())*.85,x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r,s=Math.max(0,c.surf),K=RCK[s],e=rand(.15,.55);
  rcPlace(c,s,x,z,rand(0,6.2832),rand(-.7,.7),e*rand(.9,1.5),e,rand(K.th[0],K.th[1]),0);}};
// ---------- 2) fiamme più fini ----------
fireTex=function(){const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N),D=im.data,h=N/2-.5;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x-h)/h,v=(y-h)/h,w=.45+.55*(v+1)/2,r=Math.sqrt((u/w)*(u/w)+v*v*.85);let a=Math.max(0,1-r);a=a*a*(3-2*a);
  const n=vnoise(x*.045,y*.03)*.45+vnoise(x*.1+7,y*.075)*.28+vnoise(x*.21+3,y*.17)*.17+vnoise(x*.43+11,y*.37)*.1;a*=clamp((n-.18)*2.2,0,1);
  const core=Math.max(0,1-r*1.6),o=(y*N+x)*4;D[o]=255;D[o+1]=clamp(140+core*115,0,255);D[o+2]=clamp(60+core*195,0,255);D[o+3]=255*a;}
 g.putImageData(im,0,0);return new THREE.CanvasTexture(c);};
// risoluzione dei livelli del bagliore per il ricampionamento bicubico
{const sp=setupPost;setupPost=function(){sp();try{const u=matComp.uniforms;if(!u.uB2r){u.uB2r={value:new THREE.Vector2(1,1)};u.uB3r={value:new THREE.Vector2(1,1)};}if(post.l[1])u.uB2r.value.set(post.l[1][1].width,post.l[1][1].height);if(post.l[2])u.uB3r.value.set(post.l[2][1].width,post.l[2][1].height);}catch(e){}};}
(function(){try{const u=matComp.uniforms;if(!u.uB2r){u.uB2r={value:new THREE.Vector2(160,90)};u.uB3r={value:new THREE.Vector2(80,45)};}if(post.l&&post.l[2]){u.uB2r.value.set(post.l[1][1].width,post.l[1][1].height);u.uB3r.value.set(post.l[2][1].width,post.l[2][1].height);}}catch(e){}})();
