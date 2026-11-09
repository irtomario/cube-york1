# Cube York — istruzioni per Claude Code

Gioco 3D nel browser (three.js 0.147, un solo file `index.html`): sandbox di distruzione in una città stile New York
(isola tipo Manhattan, Nova high-tech, aeroporti, base militare nel deserto, mondo di circa 12×12 km).
Autore: Mario. Lo pubblica con GitHub Pages da questo repository e ci gioca sul telefono (Samsung Galaxy Z Fold 7,
Chrome Beta, app installata, grafica Alta/Ultra).

## Come lavorare con Mario
- Rispondi sempre in italiano, con parole semplici. Scrive spesso a voce: interpreta il senso.
- Qualità: tutto molto dettagliato, rispettando fisica, luce e realtà; niente forme "a cubetti".
- Onestà: alla fine di ogni lavoro elenca cosa è cambiato, i limiti veri e cosa provare sul telefono.
  Non dire mai di aver provato sul telefono: i test girano in un browser senza GPU (SwiftShader).
- Il telefono conta: niente allocazioni per fotogramma, istanze (InstancedMesh), effetti scalati con la grafica
  (`QP`/`PRESETS`: bassa, media, alta, ultra).

## Struttura
- `index.html` (radice) = il gioco pubblicato. È GENERATO: non modificarlo a mano, rigeneralo con la build.
- `dev/backup/index_patchX_original.html` = codice originale (patch X). Non toccarlo.
- `dev/build.py` = originale + sostituzioni esatte `rep(old, new)` (devono trovare il testo esattamente 1 volta)
  + `subconst` (shader `TER_F`, `WAT_F`) + i moduli di `dev/src/` concatenati nell'ordine della lista `MODS`.
- `dev/src/` = moduli. Patch Y/Z: zone, htt (grattacieli high-tech), nova, airport, liner, flights, rivers, roads,
  base, apveh, aircol. Patch AA (`aa_*`): traffico, auto, strade, crateri, luce, distruzione, tornado, eventi, ui.
  Patch AB (`ab_*`): coast, water (tsunami/allagamenti), refl (riflesso planare + riva), spray, wboom2, audio
  (voci, motori in AudioWorklet, tuono), glass (vetri), sky (cielo fisico, nuvole, fulmini), light2 (ombre lontane),
  grass, trees, cars (deformazione), tanks, people, tornado, laser, nova, lamps, park (lago del parco), ui, fixes,
  perf (risoluzione dinamica + rete di sicurezza). Shader: ter_f, wat_f, fac_ht, roadwear (.glsl).
- `dev/docs/NOTES_AB.md`, `NOTES_AA.md` = storia delle patch, diagnosi e trappole (i percorsi lì sono relativi a dev/).
  `dev/docs/CUBE_YORK_CONTESTO.md` = mappa del codice originale (numeri e dimensioni vecchi).

## Comandi
- Build: `python3 dev/build.py` → riscrive `index.html` e fa `node --check`. Deve stampare `OK <n> byte`.
  `PATCH FALLITA` = il testo `old` di un `rep()` non c'è (o c'è più volte).
- Test visivi: una volta per sessione `bash dev/setup.sh`, poi
  `python3 dev/test/shoot.py dev/test/<x>_def.json --q alta` (telefono aperto: `--w 832 --h 740 --touch`;
  telefono chiuso: `--w 896 --h 400 --touch`). Immagini in `dev/shots/`. Guardale sempre.
- Nuovi test: `python3 dev/test/mk.py dev/test/<x>_def.json < righe.txt`, blocchi `nome|shot(0/1)|js` separati da una
  riga `@@`; il primo riceve `dev/test/H.js` (avvia il gioco; aiuti `go(x,y,z,tx,ty,tz)`, `fr(n)`, `sim(secondi)`).
  `"page": true` fotografa anche l'interfaccia HTML.
- Prima di consegnare: build OK, `qa_ab.json` (`--q alta`, poi `bassa` e `ultra`) e `stress_ab.json`:
  `page errors: 0` e nessun `[Cube York] errore` nella console.

## Regole del codice (imparate a caro prezzo)
- Per estendere una funzione usa un involucro: `{const f0=nome;nome=function(...a){const r=f0(...a);/*…*/return r;};}`.
- `function X` è "hoisted": una nuova funzione o costante con un nome già usato SOSTITUISCE in silenzio quella vecchia
  e rompe parti del gioco senza errori. Prima di creare un nome globale:
  `grep -cP "(const|let|var|function)\s+NOME\b" index.html` deve dare 0.
- three r147: nei cicli srotolati usa `UNROLLED_LOOP_INDEX`; `DoubleSide` capovolge le normali (foglie e erba hanno
  normali proprie); con `onBeforeCompile` imposta `customProgramCacheKey`; i `defines` entrano nella chiave della cache.
- Un errore negli shader non blocca la sintassi JS: controlla la console nei test.
- `ab_perf.js` mette fisica, aggiornamento e disegno in try/catch: un errore non ferma il gioco ma va comunque trovato.

## Trucchi per i test
- SwiftShader è lento (30-110 s per immagine): poche immagini, 640×360 se basta.
- Immagine stabile: alla fine del js `state='still';` (il ciclo disegna soltanto) e `GU.uCam.value.copy(camera.position);`
  (erba); poi `state='play';` per riprendere.
- Telecamera mai sotto il terreno: sposta il giocatore. Il protagonista si vede solo in terza persona.
- La risoluzione dinamica deve essere spenta (`DRS.on=false`, lo fa già H.js).

## Consegna
- Lavora su un branch e fai push; Mario crea la PR e fa "Merge": GitHub Pages aggiorna il gioco in 2-3 minuti.
  Ricordagli di chiudere e riaprire l'app due volte.
- Aggiorna `dev/docs/NOTES_AB.md` (o un nuovo NOTES_AC.md) con cosa hai fatto e le trappole, in poche righe.

## Risparmiare i limiti
- Non leggere mai `index.html` o il file originale per intero (oltre 1 MB): usa grep con poche righe di contesto.
- Leggi solo i moduli che servono al compito. Un argomento per sessione.
