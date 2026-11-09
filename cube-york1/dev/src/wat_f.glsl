{vec2 p=vWP.xz;float t=uTime;float dist=length(vWP-cameraPosition);vec2 g=vec2(0.);float wl=28.;float crs=0.;
for(int i=0;i<10;i++){float ang=.35+float(i)*2.39996;vec2 d=vec2(cos(ang),sin(ang));float k=6.2831/wl;float c=sqrt(9.81*k);float A=wl*.011;float fd=1.-smoothstep(wl*12.,wl*36.,dist);float ph=dot(d,p)*k-c*t+float(i)*1.7;g+=d*k*A*cos(ph)*fd;if(i<4)crs+=sin(ph)*fd;wl*=.71;}
#ifdef WSEA
{float cv=vn2(p*.0021+3.)*.6+vn2(p*.009-t*.004)*.4;
 vec3 wc=mix(vec3(.0035,.019,.026),vec3(.007,.03,.031),cv);wc=mix(wc,vec3(.015,.03,.025),smoothstep(.62,.85,vn2(p*.0045+11.))*.45);
 float sss=clamp(crs*.25+.3,0.,1.)*(1.-smoothstep(60.,320.,dist));wc+=vec3(.003,.014,.013)*sss;
 float rvd=texture2D(tRiv,(p+6144.)/12288.).r*60.-20.;
 if(rvd<6.){float lap=sin(rvd*2.1-t*1.6+vn2(p*.15)*4.)*.5+.5;float shf=(1.-smoothstep(0.,2.6,abs(rvd+3.2+(vn2(p*.18+t*.05)-.5)*2.2)))*(.45+.55*lap)*smoothstep(.3,.6,vn2(p*1.1-t*.4));
  wc=mix(wc,vec3(.04,.045,.035),smoothstep(-9.,-3.,rvd)*.35);wc=mix(wc,vec3(.72,.74,.72),shf*.75*(1.-smoothstep(80.,260.,dist)));roughnessFactor=mix(roughnessFactor,.55,shf*.7);}
 diffuseColor.rgb=wc;
 float wsx=smoothstep(1.2,2.8,uWS);if(wsx>0.){float wf=smoothstep(1.55,2.15,crs+vn2(p*.12+t*.25)*.8)*wsx*(1.-smoothstep(150.,700.,dist))*smoothstep(.55,.8,vn2(p*vec2(.9,2.2)-t*.5))*(.5+.5*vn2(p*3.3+t));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.75,.75),wf*.7);roughnessFactor=mix(roughnessFactor,.5,wf);}}
#endif
normal=normalize((viewMatrix*vec4(normalize(vec3(-g.x,1.,-g.y)),0.)).xyz);}
