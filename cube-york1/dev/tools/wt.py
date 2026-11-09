#!/usr/bin/env python3
# uso: python3 dev/tools/wt.py test/<x>.log <out.jpg> <colonne> nome1 nome2 ...  (percorsi relativi a dev/)   — aspetta "DONE" nel log, poi affianca le immagini shots/<nome>.jpg
import sys,os,time
from PIL import Image
log,out,cols=sys.argv[1],sys.argv[2],int(sys.argv[3]);names=sys.argv[4:]
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+os.sep   # cartella dev/
t0=time.time()
while time.time()-t0<560:
    s=open(R+log).read() if os.path.exists(R+log) else ''
    if 'DONE' in s: break
    time.sleep(3)
for l in open(R+log).read().splitlines():
    if 'js->' in l or 'ERR' in l or 'DONE' in l: print(l[:600])
ims=[Image.open(R+'shots/%s.jpg'%n) for n in names if os.path.exists(R+'shots/%s.jpg'%n)]
if ims:
    W,H=ims[0].size;rows=(len(ims)+cols-1)//cols
    o=Image.new('RGB',(W*cols,H*rows))
    for i,im in enumerate(ims): o.paste(im,((i%cols)*W,(i//cols)*H))
    o.save(R+'shots/'+out,quality=82);print('tiled',len(ims))
