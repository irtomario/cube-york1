# PATCH AA — note di lavoro (persistono tra le compattazioni)

## Build e test
- `python3 build.py` → index.html (base backup/index_patchX_original.html + rep() in build.py + src/ MODS). node --check su build/main.js.
- MODS: ... 'aa_core.js','aa_traffic.js','aa_audio.js','aa_nova.js','aa_props.js' (+ nuovi moduli aa_*.js da aggiungere in coda).
- Test: `python3 test/shoot.py test/X.json --q alta [--port 8766]` (header da test/qa.json[0]). Output >1500 char → usare 'out' file con nome diverso dal file di definizione. Run lunghi: nohup in background.
- Variabili nei test: nomi insoliti (__LP) per non scontrarsi con le globali del gioco.

## Fatto in AA (sintesi)
linee nere luci (NaN), fruscio audio + background mute, inseguimenti polizia, tsunami interno, vetri riflessi, urla panico, suoni (ambiente, passi, esplosioni, jet/elicotteri), blur jet, Nova: traffico+semafori+pedoni+edifici in più+arredo (aa_props.js: kiosk, cafe, shelter, bikes, planter).

## Richieste aggiuntive di Mario (18/10 sera, con 5 foto)
- texture terreno, montagne, asfalto, neve, acqua (#41)
- esplosioni nell'acqua (#42)
- strade distruttibili, distruzione tipica dell'asfalto (#43)
- fisica e distruzione dei veicoli molto più realistiche (#44)
- bug foto (#45): fiume sospeso sopra la strada in trincea; guardrail sull'acqua senza impalcato; strada che finisce nella sabbia vicino alla spiaggia con muro verticale città/spiaggia; scarpate verticali e strisce bianche storte lungo strade di campagna.

## Diagnosi strade/fiumi (da codice)
- worldInit: profilo strada y = media mobile + clamp pendenza 8% avanti/indietro DOPO l'innalzamento wl+7.5 sui punti in acqua → il clamp abbassa i ponti → strada sotto il livello del fiume → worldH taglia il terreno fino alla strada e l'acqua del fiume (mesh a quota p.y) resta sospesa (foto 2 e 4).
- Correzione prevista: vincoli minimi (acqua+7.5 sugli attraversamenti, acqua+2.5 vicino ai fiumi) applicati DOPO il clamp con passate solo-innalzamento (rampe 8%).
- worldH/worldGround: il riporto della scarpata (lerp ry→h fino a 34 m) può riempire l'alveo; lo sterro può scendere sotto l'acqua. Limitare con il profilo delle sponde del fiume.
- Strade vicine ai fiumi: ROADS[2] zigzaga attorno a RIVERS[2] (nord, montagne); ROADS[1] incrocia RIVERS[0] verso (-3300..-3600,-650..-1000); ROADS[0] incrocia RIVERS[1] vicino a (2450,250) e corre vicino tra (3950,-2600) e (4350,-2950); ROADS[3] incrocia RIVERS[1] vicino a (3000..3300,-1450..-1800).

## Ordine di lavoro rimanente
1. #27 aeroporti vivi (passeggeri al terminal/marciapiede), verifica arredo Nova
2. #45/#39 strade e fiumi (profilo, ponti veri, estremità orfane, sabbia), asfalto
3. #40 traffico extraurbano + auto nuove
4. #43 strade distruttibili  5. #44 veicoli distruzione  6. #42 esplosioni in acqua
7. #41 texture  8. #28 blocchi edifici + detriti  9. #29 illuminazione  10. #30 modelli veicoli
11. #31 tornado  12. #32 fisica volo  13. #34 eventi casuali  14. #38 UI e animazioni
15. #35 stabilità  16. #36 collaudo finale e consegna (backup, outputs, riepilogo in italiano, istruzioni GitHub: caricare come index.html)

## Stato al 20/10 sera
- FATTO: aa_props.js (arredo Nova), aa_airlife.js (passeggeri con trolley, code ai banchi, controlli, gate, personale di rampa con gilet, porte automatiche CYI; pilastri pensilina spostati sul marciapiede; fila taxi; strisce pedonali), aa_roads.js (profilo strade con vincoli sopra l'acqua + rampe, strade spostate fuori dagli alvei, estremità ancorate, incroci alla stessa quota, gallerie con portali e luci, strada 0 accorciata prima della montagna, scarpate più dolci ai portali, tetto del riempimento sugli alvei), roads.js (corridoio con larghezza graduale, fossi con acqua che riflette il cielo, gallerie scure), aa_light.js (esposizione corretta, bloom solo sulle luci, cielo notturno con luna e inquinamento luminoso, aberrazione cromatica tolta = niente puntini rosa, finestre di notte meno bruciate, occlusione ambientale al suolo e alla base dei muri), shoot.py supporta 'png':true, tools/wt.py (attende DONE e affianca le immagini).
- Foto 3 di Mario (strada che finisce nella sabbia vicino alla città): posizione NON trovata (non è parco, causeway, Nova ovest, sud Brooklyn). Chiedere o lasciare nei limiti.
- PROSSIMI: #40 traffico extraurbano + modelli nuovi (generatore parametrico con parti staccabili, utile anche per #44), #44 distruzione veicoli, #43 strade distruttibili, #42 esplosioni in acqua, #41 texture, #28, #31, #32, #34, #38, #35, #36.

## Stato al 21/10 notte
- FATTO #43 strade distruttibili (src/aa_roaddmg.js): crateri nell'asfalto/cemento/prato in 3 modi (0 città: fisica propria su groundBase0; 1 zone Nova/aeroporti; 2 strade extraurbane: fisica = cratere del terreno reso permanente c.keep, orlo basso c.rk=.06 via override tmodQ). Buco nello shader (crCut in ground/zone/strade, crHoleT nel terreno per modi 1-2, crHoleW nell'acqua a -1,5), conca vera (rcBowl, winding corretto: (a,b,c2),(b,d,c2)), lastre sollevate, frammenti, pezzi in volo, crepe radiali e ad anello, tubature spezzate, conduttura dell'acqua (allaga la buca) o del gas (fiamma), auto IA che si fermano prima della buca, riciclo del cratere più lontano (16), resetCity/clearDebris. Le esplosioni dei veicoli non scavano. Test: test/cr_def.json, test/cq_def.json.
- FATTO #42 esplosioni in acqua (src/aa_wboom.js): sott'acqua niente fuoco (wrapper fireP/sparks/flare/smoke/sndExplosion/flashLight con WXB.mute), colpo sordo, cupola, colonna + corona, nebbia, base surge, bolle, fragore della ricaduta, anelli d'onda e schiuma negli shader (waterMat, rvMatF, floodMatF), spinta verso l'alto a ciò che galleggia, onda vera nella simulazione degli allagamenti. Test: test/wy_def.json, test/wz_def.json.
- FATTO bug lago 0: gli argini naturali del fiume (rep in build.py) attraversavano il lago come due strisce di terra → niente argini dentro i laghi (inL in waterCarve).
- PROSSIMI: #41 texture (erba meno lime, roccia a strati, neve, sabbia, acqua con riva/schiuma), #28, #31, #32, #34, #38, #35, #36.

## Stato al 21/10 mattina
- FATTO #41 texture: src/ter_f.glsl (TER_F riscritto: prato naturale, chiazze, fiori, roccia a strati, ghiaioni, prato alpino, neve a chiazze, sabbia asciutta/bagnata con increspature e sassolini) e src/wat_f.glsl (WAT_F: colore acqua variabile, schiuma a riva nei laghi via tRiv, creste bianche col vento; #define WSEA solo per waterMat); sostituiti da subconst() in build.py. Erba dei fossi meno lime (roads.js).
- FATTO #28 distruzione più fine (src/aa_destr.js): blocchi danneggiati si sbriciolano sulla faccia verso l'esplosione (breakFace), più pezzi e calcinacci su alta/ultra.
- FATTO #31 tornado (src/aa_tornado.js): imbuto nuovo, nube a muro rotante, tetto del temporale, polvere e detriti, tromba marina sull'acqua, fuori città va per la sua strada, abbatte alberi.
- FATTO #32 fisica (rep in build.py + aa_destr.js): aerei stallo graduale, densità con la quota, effetto suolo, inerzia dei comandi, ala che cade, raffiche e tornado; elicotteri inclinazione maggiore, resistenza quadratica (~270 km/h), effetto suolo, portanza di traslazione, vortex ring; auto resistenza aerodinamica e aderenza dal fondo (bagnato, erba, sabbia, neve).
- FATTO #34 eventi (src/aa_events.js): incendio in appartamento (+ autopompa), idrante saltato con pozza, auto in panne con vapore e clacson, antifurti dopo le esplosioni, piccioni che volano via.
- FATTO #38 interfaccia (src/aa_ui.js): animazioni pannelli, schede nella pausa, annuncio arma, mirino che pulsa, toast più lunghi; rete di sicurezza che finisce le animazioni ferme.
- FATTO #30 autopompa nuova (CDEF.fire) con scala, fascia, lampeggianti, scritte.
- PROSSIMI: #35 stabilità (stress test test/stress_def.json), QA finale, consegna.
