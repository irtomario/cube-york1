/* ======================= PATCH AA — ARREDO URBANO NUOVO: CHIOSCHI, TAVOLINI DEI BAR, PENSILINE, BICI, FIORIERE ======================= */
function aaPropKinds(){const g=(geo,x,y,z)=>geo.translate(x,y,z);
 const dark=MS(0x23272b,.45,.7),steel=MS(0x8e959b,.32,.85),glass=new THREE.MeshStandardMaterial({color:lc(0x203038),roughness:.06,metalness:.2,transparent:true,opacity:.42}),
  conc=MS(0x9c9891,.9,0),soil=MS(0x3b2a1d,.95,0),leaf=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82}),wood=MS(0x7a5636,.7,0);
 // chiosco (giornali e caffè): corpo arrotondato, vetrina, bancone, tenda, insegna luminosa
 {const body=MS(0x1f4d46,.5,.25),awn=MS(0xe8dcc3,.85,0),sign=new THREE.MeshStandardMaterial({color:lc(0x101010),emissive:lc(0xffd29a),emissiveIntensity:1.6,roughness:.5});
  defProp('kiosk',[{g:mergeGeos([g(rboxGeo(2.5,2.25,1.8,.14,2),0,1.33,0),g(rboxGeo(2.86,.14,2.12,.06,1),0,2.52,0)]),m:body},{g:mergeGeos([g(rboxGeo(2.62,.2,1.92,.05,1),0,.1,0)]),m:dark},
   {g:g(new THREE.BoxGeometry(1.7,.92,.03),0,1.5,-.905),m:glass},{g:mergeGeos([g(new THREE.BoxGeometry(1.85,.05,.34),0,1.0,-1.06),g(new THREE.BoxGeometry(.05,.95,.05),-.86,1.5,-.92),g(new THREE.BoxGeometry(.05,.95,.05),.86,1.5,-.92)]),m:steel},
   {g:g(new THREE.BoxGeometry(2.7,.035,.85).rotateX(.38),0,2.06,-1.24),m:awn},{g:g(new THREE.BoxGeometry(2.1,.3,.05),0,2.8,-.7),m:sign}],[1.3,1.3,1],900,80,'metal',.3);}
 // tavolino del bar con due sedie e ombrellone
 {const fab=new THREE.MeshStandardMaterial({color:lc(0xb8473a),roughness:.85,side:THREE.DoubleSide}),fr=[];
  fr.push(g(new THREE.CylinderGeometry(.38,.38,.03,22),0,.74,0),g(new THREE.CylinderGeometry(.028,.028,.72,8),0,.37,0),g(new THREE.CylinderGeometry(.21,.25,.03,18),0,.015,0),g(new THREE.CylinderGeometry(.021,.021,2.38,8),0,1.19,0),g(new THREE.SphereGeometry(.05,10,8),0,2.43,0));
  const st=[];for(const s of[-1,1]){const cx=s*.64;st.push(g(rboxGeo(.42,.04,.42,.015,1),cx,.46,0),g(rboxGeo(.04,.36,.42,.015,1),cx+s*.2,.66,0));for(const a of[-1,1])for(const b of[-1,1])fr.push(g(new THREE.CylinderGeometry(.012,.012,.46,6),cx+a*.18,.23,b*.18));}
  defProp('cafe',[{g:mergeGeos(fr),m:dark},{g:mergeGeos(st),m:wood},{g:g(new THREE.ConeGeometry(1.35,.42,12,1,true),0,2.2,0),m:fab}],[.9,.6,.5],28,320,'metal',.3);}
 // pensilina dell'autobus: tetto, montanti, vetri, pannello pubblicitario illuminato, panca, palina
 {const adm=new THREE.MeshStandardMaterial({color:lc(0x202020),emissive:lc(0xd8ecff),emissiveIntensity:1.25,roughness:.4}),fr=[g(rboxGeo(4.25,.1,1.72,.04,1),0,2.56,0)];
  for(const a of[-1,1])for(const b of[-1,1])fr.push(g(new THREE.CylinderGeometry(.04,.04,2.5,10),a*1.98,1.25,b*.72));fr.push(g(new THREE.BoxGeometry(2.4,.06,.38),0,.47,.46),g(new THREE.BoxGeometry(.06,.45,.3),-1.1,.23,.48),g(new THREE.BoxGeometry(.06,.45,.3),1.1,.23,.48));
  fr.push(g(new THREE.CylinderGeometry(.035,.035,2.9,8),2.45,1.45,-.62),g(new THREE.CylinderGeometry(.26,.26,.03,20).rotateX(Math.PI/2),2.45,2.72,-.62));
  defProp('shelter',[{g:mergeGeos(fr),m:steel},{g:mergeGeos([g(new THREE.BoxGeometry(3.92,1.95,.02),0,1.3,.73),g(new THREE.BoxGeometry(.02,1.95,1.3),1.98,1.3,0)]),m:glass},{g:g(new THREE.BoxGeometry(.07,1.75,1.18),-1.98,1.3,0),m:adm}],[2.1,1.3,.85],420,90,'metal',.25);}
 // rastrelliera con due biciclette
 {const fr=[],tyre=[];for(let i=0;i<3;i++)fr.push(g(new THREE.TorusGeometry(.36,.024,6,14,Math.PI),-.7+i*.7,.02,0));
  for(const bx of[-.35,.35]){for(const wz of[-.52,.52])tyre.push(g(new THREE.TorusGeometry(.33,.025,8,22).rotateY(Math.PI/2),bx,.34,wz));
   const P=(a,b,r)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),L=A.distanceTo(B),c=new THREE.CylinderGeometry(r,r,L,6);c.translate(0,L/2,0);c.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize())));c.translate(A.x,A.y,A.z);return c;};
   fr.push(P([bx,.34,-.52],[bx,.62,-.05],.017),P([bx,.62,-.05],[bx,.34,.52],.017),P([bx,.34,-.52],[bx,.36,.05],.017),P([bx,.36,.05],[bx,.62,-.05],.017),P([bx,.62,-.05],[bx,.85,-.12],.015),P([bx,.36,.05],[bx,.83,.42],.017),P([bx,.83,.42],[bx,.34,.52],.016),
    g(new THREE.BoxGeometry(.08,.03,.22),bx,.88,-.14),g(new THREE.CylinderGeometry(.012,.012,.5,6).rotateX(Math.PI/2).rotateY(Math.PI/2),bx,.98,.45),P([bx,.83,.42],[bx,.98,.45],.015));}
  defProp('bikes',[{g:mergeGeos(fr),m:steel},{g:mergeGeos(tyre),m:dark}],[1.1,.5,.6],40,160,'metal',.3);}
 // fioriera in cemento con cespugli
 {const sh=[];for(let i=0;i<3;i++){const ic=new THREE.IcosahedronGeometry(.42+.08*i,2),P=ic.attributes.position;for(let j=0;j<P.count;j++){const f=.84+.3*vnoise(P.getX(j)*3.1+i*5,P.getY(j)*3.1+P.getZ(j)*2.3);P.setXYZ(j,P.getX(j)*f,P.getY(j)*f*.8,P.getZ(j)*f);}ic.computeVertexNormals();ic.translate(-.6+i*.6,.92,0);const gg=.05+.02*i;colorize(ic,gg*.55,gg*1.25+.03,gg*.35);sh.push(ic);}
  defProp('planter',[{g:g(rboxGeo(2.2,.62,1.1,.08,2),0,.31,0),m:conc},{g:g(new THREE.BoxGeometry(2.02,.05,.92),0,.6,0),m:soil},{g:mergeGeos(sh),m:leaf}],[1.1,.5,.55],700,220,'stone',.25);}}
{const bp1=buildProps;buildProps=function(){aaPropKinds();bp1();try{nvFurniture();}catch(e){console.warn('arredo Nova',e);}};}
// ---------- posa a Nova: pensiline lungo viali e strade, chioschi agli angoli delle piazze, tavolini davanti ai palazzi, bici, fioriere ----------
function nvFurniture(){const R=mulberry32(9090),inX=(z,m)=>NV.ST.some(t=>Math.abs(z-t.z)<t.hw+m),inA=(x,m)=>NV.AV.some(a=>Math.abs(x-a.x)<a.hw+m),free=(x,z,r)=>!bAt(x,z)&&!bAt(x+r,z)&&!bAt(x-r,z)&&!bAt(x,z+r)&&!bAt(x,z-r)&&!inA(x,1)&&!inX(z,1);
 const put=(k,x,z,yaw)=>{if(!PK[k]||!free(x,z,1.5))return false;addProp(PK[k],x,.15,z,yaw);return true;};
 // pensiline: ogni 230 m circa, sul marciapiede, aperte verso la strada
 for(const a of NV.AV)for(let t=a.a+60;t<a.b-30;t+=230+R()*40){if(inX(t,14))continue;for(const s of[-1,1]){if(R()<.35)continue;put('shelter',a.x+s*(a.hw+2.1),t,s*Math.PI/2);}}
 for(const st of NV.ST)for(let t=st.a+70;t<st.b-30;t+=240+R()*40){if(inA(t,14))continue;for(const s of[-1,1]){if(R()<.4)continue;put('shelter',t,st.z+s*(st.hw+2.1),s>0?0:Math.PI);}}
 // fioriere e bici lungo i marciapiedi larghi
 for(const a of NV.AV)for(let t=a.a+20;t<a.b-10;t+=38+R()*20){if(inX(t,10))continue;const s=R()<.5?-1:1,o=a.hw+5.6+R()*2;put(R()<.6?'planter':'bikes',a.x+s*o,t,Math.PI/2);}
 for(const st of NV.ST)for(let t=st.a+20;t<st.b-10;t+=40+R()*22){if(inA(t,10))continue;const s=R()<.5?-1:1,o=st.hw+5.6+R()*2;put(R()<.6?'planter':'bikes',t,st.z+s*o,0);}
 // chioschi e tavolini: sui bordi delle piazze delle torri e della cupola, davanti ai palazzi nuovi
 const spots=[];for(const T of NOVA.T){if(T.hollow)continue;const rr=(T.rb||25)+14;for(let i=0;i<6;i++){const a=i/6*TAU+R();spots.push([T.x+Math.cos(a)*rr,T.z+Math.sin(a)*rr,a]);}}
 const pl=NV.PLAZA;for(let i=0;i<10;i++){const t=i/10;spots.push([lerp(pl.x0+12,pl.x1-12,t),pl.z0+10,Math.PI/2],[lerp(pl.x0+12,pl.x1-12,t),pl.z1-10,-Math.PI/2]);}
 for(const b of NOVA.B){if(b.h>40||R()<.4)continue;const side=Math.floor(R()*4),f=R();if(side===0)spots.push([b.x0+b.w*f,b.z0-5,0]);else if(side===1)spots.push([b.x0+b.w*f,b.z0+b.d+5,0]);else if(side===2)spots.push([b.x0-5,b.z0+b.d*f,0]);else spots.push([b.x0+b.w+5,b.z0+b.d*f,0]);}
 for(const s of spots){const r=R();if(r<.22){put('kiosk',s[0],s[1],s[2]+Math.PI/2);}else if(r<.75){for(let i=0;i<4;i++){const ox=(i%2)*2.8-1.4,oz=Math.floor(i/2)*2.8-1.4;put('cafe',s[0]+ox,s[1]+oz,R()*TAU);}}else put('bikes',s[0],s[1],s[2]);}}
