#!/usr/bin/env python3
"""mk.py out.json < righe — legge da stdin blocchi "nome|shot(0/1)|js" separati da una riga "@@" e scrive la definizione;
il primo test riceve l'intestazione standard H.js (avvio del gioco, aiuti go/fr/sim/look)."""
import sys,json,os
H=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'H.js'),encoding='utf-8').read()
L=[]
for i,l in enumerate(sys.stdin.read().split('\n@@\n')):
    l=l.strip()
    if not l: continue
    name,shot,js=l.split('|',2)
    L.append({'name':name,'js':(H if not L else '')+js,'shot':shot=='1'})
json.dump(L,open(sys.argv[1],'w'))
print(len(L),'test')
