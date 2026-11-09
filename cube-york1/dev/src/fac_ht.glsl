   if(st>9.5){
    float cu=fract(u/1.2),cv=fract(v/.9);float jt=max(1.-step(.015,cu)*step(cu,.985),1.-step(.02,cv)*step(cv,.98));
    wall=vec3(.74,.76,.78)*(.92+.08*h21(floor(vec2(u/1.2,v/.9))))*(1.-jt*.35);wR=.32;wM=.65;gl=0.;gA=wall;gR=.4;gM=.5;
   }else if(st>8.5){
    float cu=fract(u/2.4);float jt=1.-step(.02,cu)*step(cu,.98);
    gl=step(.22,fy)*step(fy,.8);if(fl<.5)gl=step(.06,fy)*step(fy,.9)*step(.025,abs(cu-.5));
    wall=vec3(.86,.87,.86)*(.9+.1*vn2(vec2(u*.2,v*.1)))*(1.-jt*.22*(1.-gl));wall=mix(wall,vec3(.7,.71,.7),step(.8,fy)*step(fy,.84));wR=.35;wM=.1;
    wid=vec2(floor(u/2.4),fl);gA=vec3(.05,.07,.085)*(.85+.3*h21(wid));gR=.03;gM=.2;
    fPert=vec3(h21(wid)-.5,0.,h21(wid+2.)-.5)*.025;
    fEmis+=gl*vec3(1.,.9,.75)*1.4*uNight*htWinFar(wid,sd,length(p-cameraPosition)*uPix/max(.2,abs(dot(normalize(p-cameraPosition),n))));
   }else{
    float cu=fract(u/1.5);float mul=1.-step(.03,cu)*step(cu,.97);float spd=clamp(step(fy,.11)+step(.955,fy),0.,1.);
    if(fl<.5)spd=step(.93,fy);
    gl=(1.-mul)*(1.-spd);
    wall=mix(vec3(.62,.65,.68),vec3(.05,.07,.08),spd*(1.-mul));wR=.3;wM=.85;
    wid=vec2(floor(u/1.5),fl);
    gA=mix(vec3(.07,.13,.15),vec3(.05,.09,.13),t1)*(.85+.3*h21(wid*.37));gR=.02+.02*h21(wid+3.);gM=.25;
    fPert=vec3(h21(wid)-.5,0.,h21(wid+2.)-.5)*.03;
    fEmis+=gl*vec3(.82,.9,1.)*1.35*uNight*htWinFar(wid,sd,length(p-cameraPosition)*uPix/max(.2,abs(dot(normalize(p-cameraPosition),n))));
    float led=step(.55,t2)*(1.-step(.014,abs(fy-.035)));
    fEmis+=led*vec3(.2,.75,1.)*uNight*2.6*(.65+.35*sin(uTime*1.3+u*.04+fl*.35));
   }