# CUBE YORK — Contesto completo per continuare lo sviluppo (Claude Cowork)

> Metti questo file nella stessa cartella di `index.html` e scrivi a Claude in Cowork:
> «Leggi CUBE_YORK_CONTESTO.md e index.html in questa cartella: è il mio gioco Cube York. Continuiamo da dove eravamo rimasti.»

Aggiornato al 12 ottobre 2026. Scritto da Claude alla fine della chat di sviluppo su claude.ai, per passare il lavoro a una nuova sessione.

---

## 0. Istruzioni per Claude (leggere prima di tutto)

- **Lingua:** rispondi sempre in italiano. Mario scrive spesso a voce, con frasi spezzate o trascritte male: interpreta il senso. Esempio: «cubettuto» vuol dire «fatto a cubetti, poco realistico».
- **Obiettivo di qualità:** tutto «incredibilmente dettagliato», rispettando sempre le leggi della realtà, della fisica e della luce. Niente forme a cubetti, niente bordi rettangolari, niente effetti «di plastica».
- **Onestà:** di' chiaramente cosa hai fatto, cosa no e quali sono i limiti reali, cioè cosa non si può fare in un browser su un telefono. Mario apprezza le critiche dirette.
- **Il gioco è un solo file HTML** (`index.html`, circa 468 KB e 3000 righe, JavaScript inline). Non dividerlo in più file: l'app su GitHub Pages e il link su claude.ai si aspettano un file unico autosufficiente.
- **Prima di modificare:** fai una copia di backup. Applica le modifiche con sostituzioni di testo esatte, cioè controlla che il testo da sostituire compaia una sola volta. Dopo ogni modifica controlla la sintassi estraendo il codice dall'ultimo `<script>` e lanciando `node --check`.
- **Collauda sempre** caricando la pagina in un browser e guardando le immagini (vedi sezione 10). Un errore negli shader non blocca la sintassi JavaScript ma rompe la grafica: controlla la console.
- **Lavora per blocchi:** Mario sceglie un argomento alla volta (per esempio «vai col traffico»). Alla fine di ogni blocco elenca in modo semplice cosa è cambiato, i limiti onesti e cosa resta da fare.
- **Telefono:** il gioco gira soprattutto su un telefono Android con Chrome Beta. Tieni d'occhio le prestazioni e scala gli effetti con l'impostazione di grafica.

---

## 1. Cos'è Cube York

Gioco 3D nel browser, un sandbox di distruzione ambientato in una città in stile New York. Il giocatore cammina, corre, nuota e vola. Guida auto, elicotteri, aerei militari, carri armati e un UFO. Distrugge palazzi con 13 armi e strumenti, e intorno c'è un mondo di circa 12×12 km con montagne, laghi, fiumi, foreste, deserto e una base militare. Il motore è three.js r147, senza altri framework.

---

## 2. File, pubblicazione e app

- **Link su claude.ai (artifact):** https://claude.ai/artifact/LK9cDJnT3697JEgt4q6wtg. Si aggiorna solo dalla chat claude.ai che l'ha creato; da Cowork probabilmente no.
- **Repository GitHub:** `irtomario/cube-york1`, pubblico, con GitHub Pages attivo.
- **App installata (PWA):** https://irtomario.github.io/cube-york1/
  - Nel repository ci sono `index.html` (il gioco), `sw.js` (service worker per l'uso offline), `manifest.webmanifest` e le icone PNG 192 e 512.
  - **Per aggiornare:** si carica il nuovo `index.html` sovrascrivendo quello vecchio con lo stesso nome. Una volta Mario l'aveva caricato per errore come `index-2.html`.
  - Dopo l'aggiornamento: aspettare 2–3 minuti, poi chiudere e riaprire l'app anche due volte, perché il service worker tiene la vecchia copia.
  - Se cambi `sw.js`, aumenta il numero di versione della cache (`cubeyork-vN`).
- **Dipendenze esterne (CDN):**
  - `https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js`
  - `https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/objects/Sky.js`
  - font Archivo da Google Fonts.
- **Salvataggio impostazioni:** in `localStorage` con prefisso `cubeyork_`, per esempio `cubeyork_q`, `cubeyork_meteo`, `cubeyork_tod`.

---

## 3. Comandi e menu

**Tastiera:**
- WASD muovi, Spazio salta (in volo o in aereo: sale), C scende, Shift corri (in aereo: postbruciatore).
- X attiva il volo libero (48 m/s con Shift).
- 1–9, 0, -, = scelgono le armi; G fa detonare il C4.
- V cambia visuale (prima o terza persona), F sale o scende da qualsiasi veicolo, Esc apre la pausa.

**Telefono:** joystick a sinistra per muoversi, area a destra per guardare, pulsanti tondi (Vola, Su, Giù, Corri, Salta, Vista, Usa, Guida), pulsante ⛶ per lo schermo intero.

**Armi** (array `WEAPONS`): C4, Esplosione, Razzo, Laser, Asteroide, Tornado, Terremoto, Buco nero, Inondazione, Tsunami, Auto (generata dove miri), Elicottero (dove miri, in volo stazionario se in quota), Persone (cadono dove miri).

**Menu pausa:**
- Grafica Bassa, Media, Alta o Ultra (`PRESETS`). Sul telefono la predefinita è Bassa, ma Mario usa anche Ultra.
- Ora del giorno: giorno, pomeriggio, tramonto, notte.
- Visuale prima o terza persona.
- Meteo: Auto, Sereno, Nuvoloso, Pioggia, Tempesta, Uragano. La predefinita è Auto.
- Cursori: distanza dettagli (`LODV=[120,180,250,400,700,∞]`), persone in città (0–150), potenza armi, sensibilità, campo visivo, volume.
- Dettaglio persone: Semplice, Normale, Alto.
- Pulsanti «Pulisci detriti» e «Ricostruisci la città».

**Oggetto impostazioni:** `S={q,tod,view,meteo,npcN,npcd,lod,sens,vol,fov,pow}`. Il preset di grafica attivo è in `QP=PRESETS[S.q]` e decide risoluzione, ombre, bloom, MSAA, erba, detriti, particelle, schegge e parti statiche.

---

## 4. Coordinate e geografia (metri; −z = nord)

**Città-isola (Manhattan):**
- Costanti: `CX=574`, `CZ=682` (bordi della città), `PX=590`, `PZ=698` (bordi dell'isola con l'argine).
- Viali lungo z ogni 140 m: centri in `x=140*k` per k da −4 a 4, mezza larghezza 9 m, funzione `aveOff(x)`.
- Strade lungo x ogni 84 m: centri in `z=84*k` per k da −8 a 8, mezza larghezza 6 m, funzione `stOff(z)`.
- Marciapiedi a quota 0,15, strade a 0.
- Parco: x tra −121 e 121, z tra −573 e −99, con colline (`parkH`), lago e sentieri.
- Times Square con 28 cartelloni (`BBS[]`).
- Torri gemelle (`b.twin`) intorno a z≈522.

**Fiume attorno all'isola:** acqua a quota −1,5 (`waterLevel`).

**Ponti e quartieri:**
- Ponte sospeso est (`buildBridge`, gruppo `BRG`, profilo `bridgeH(x)`) da x≈590 a 792 vicino a z=0.
- Copia speculare verso ovest per Jersey City (`BRG.clone()` con `scale.x=-1`); la fisica in `groundBase0` usa `bridgeH(-x)`.
- Brooklyn (x da 780 a 1200) e Jersey City (x da −1200 a −780), entrambi con |z|<648. Viali a `±(792+100i)` e strade ogni 80 m.

**Strada rialzata nord:** collega la città al deserto (x≈0, z da −698 a −912), profilo `causeH`.

**Deserto:** z tra −2300 e −905, |x|<1300 (`inDesert`), dune `desertH0` e `desertH`.

**Base militare:** `BX0=-1260`, `BX1=-140`, `BZ0=-1720`, `BZ1=-1380`, quota `BASEY=4`.
- Tre hangar «open» a x0 = −1050, −950, −850, larghi 72 m, profondi 40, con z0=−1454 e il lato aperto verso −z.
- Museo dei carri a x0=−742 (100×40 m), con vetrine a x = −716, −692, −668 e z=−1430.
- Hangar 18 a x0=−602 (44×32 m): UFO schiantato a (−574, −1432), capsule degli alieni a x tra −598 e −591.

**Mondo esteso:** quadrato di ±6144 m (`WR`).
- Il «nucleo» resta com'è (`CORE`: [−780,780]×[−905,880], i due quartieri, il deserto). Fuori dal nucleo il terreno è `worldGround()`, raccordato al nucleo in 300 m.
- Mare a sud con costa `coastZ(x)`: circa 880 al centro, più a sud ai lati. Oltre ±5300 il terreno scende verso il mare.
- Montagne a ovest (x<−2100), a nord (z<−2700) e a nord-est, fino a circa 1000 m. Neve sopra circa 520 m sui pendii poco ripidi, limite del bosco intorno a 370–470 m.
- **Laghi** (`LAKES`): (−2650,150; r330), (2650,−520; r540), (−900,−3350; r400), (−4350,−950; r170), (3950,−3050; r180). Il livello è calcolato al punto più basso della riva.
- **Fiumi** (`RIVERS`): 3 tracciati che scendono sempre, cioè il livello è il minimo progressivo lungo il corso, e finiscono in mare o in un lago.
- **Strade** (`ROADS`): 5 tracciati.
  - Est: da (1200,0) fino a (4650,−3350).
  - Ovest: da (−1200,0) fino a (−4750,−2500).
  - Nord: da (0,−2300) fino a (100,−5350).
  - Raccordo nord-est e raccordo nord-ovest.
  - Pendenza massima 8%. Viadotti automatici sopra l'acqua e le valli, quando la strada passa più di 3–4 m sopra il terreno.

---

## 5. Architettura tecnica

**Rendering:**
- `WebGLRenderer` con `NoToneMapping`; tone mapping, bloom, vignetta e grana sono fatti nel compositing (`setupPost`, `renderPost`, `matComp` con `uUnder`, `uFlash`, `uExp` eccetera).
- Le destinazioni di rendering devono avere `stencilBuffer:true`: così la profondità è a 24 bit. Con 16 bit comparivano strisce chiare a terra.
- Camera: `near=.2`, `far=13000`. Nebbia `FogExp2` con densità dalla tabella `TODS`/`TODC` (ora del giorno) e dal meteo.
- Cielo `THREE.Sky` scalato a 30000, così avvolge tutto il mondo.
- Ombre con `PCFSoftShadowMap`, luce del sole `sun` in direzione `sunDir`, aggiornata da `updateShadowCam` e `applyTOD`.

**Materiali:** quasi tutto è `MeshStandardMaterial` modificato con `onBeforeCompile` e pezzi GLSL in stringhe.
- `FAC_F`, `FAC_V`, `FAC_VM`: facciate procedurali, finestre, vetri dielettrici con Fresnel e `CANYON_LIGHT`, stanze interne `roomCol()` con mobili calcolati con intersezione raggio-scatola.
- `GND_F`: suolo e strade.
- `WAT_F`: increspature dell'acqua.
- `TER_F`: terreno con erba, roccia, neve, sabbia e colore del bosco.
- `VCLD_F`: nuvole volumetriche.
- `TSU_F`: onda dello tsunami.
- Le uniformi globali stanno nell'oggetto `U`: `uTime`, `uNight`, `uWetG`, `tWet`, `uDmg`, `tLamp`, `uLampK`, `tFor` e altre.

**Fisica:**
- Corpi rigidi a scatola, creati con `newBody(kind,x,y,z,hx,hy,hz,mass)` e messi nell'array `bodies`.
- `kind`: 0 detriti, 1 oggetti, 2 auto. Funzioni collegate: `setYaw`, `syncObj`, `killBody`.
- Passo fisso `fixedStep(dt)`, poi `frameUpdate(dt)` per la grafica e `render()`.
- Suolo e acqua: `groundH(x,z)` / `groundBase(x,z)` e `waterAt(x,z)`.
- Auto: `carForces(b,dt)` con ruote a raggio, sospensioni, trazione posteriore e spinta `c.thr*9800*(c.pow||1)`. Comandi: `c.thr`, `c.brake`, `c.steer`, `c.hand`.
- Le auto parcheggiate sono «slot» statici in `PC.slots`. `carDyn()` le trasforma in auto fisiche (`dynCars`).

**Città e distruzione:**
- Generazione: `genCity`, `genLots`, `addBuilding(x0,z0,w,d,h,style,segs)`, array `buildings`. Stili 0 vetro, 1–4 mattoni, pietra o cemento, 6 gessato, 7 lamiera degli hangar.
- `voxelize` divide i palazzi in celle; poi `removeCell`, `breakFace` (bordi frastagliati in `jagMesh`), `exposeN`, `spawnRebar` (ferri d'armatura), `fragmentBox`, `collapse`, `structural`.
- `explode(x,y,z,R,P,o)` richiama anche `trafficBlast`, `sandCrater` (nel deserto), `terrainCrater` e `forestBlast` (fuori città).
- Detriti con materiale secondo lo stile del palazzo: mattoni, cemento, legno, alluminio, lamiera, pietra.

**Acqua:**
- Simulazione delle acque basse `WS` su una griglia di 154×180 celle da 8 m: `wsStep`, `wsCell`, `wsMeshUpdate`. Tracce bagnate in `tWet`.
- Le inondazioni portano il livello a `waterTarget`.
- Tsunami: `spawnTsunami`, `updTsunami`, oggetto `TSU`, mesh d'onda con `TSU_F` e profili da fermo e in frangenza. I danni della corrente sono in `tsuFlowDamage` e il trascinamento in `tsuDrag`.

**Audio** (`AU`):
- `sfx({...})` per suoni posizionali sintetizzati con sorgenti noise, brown e osc, filtri, ritardo e riverbero.
- `mkLoop`, `getLoop`, `loopGain` per i suoni continui; `panAt` e `setPan` per la posizione.
- Motore delle auto in un AudioWorklet (`ENG_WK`, `ENGP`, `engInit`, `engPick`): scoppi per cilindro con ordine di accensione. Tipi: V2, 4 cilindri, V6, V8, V8 sportivo, V10, V12.
- Voci degli NPC con `speechSynthesis` in inglese (`npcVoice`); se non disponibile, urlo sintetico.

**Livelli di dettaglio:** `lodUpdate`, `lodFade` (dissolvenza a puntini), impostori delle auto (`carImpostor`), palazzi di sfondo.

---

## 6. Sistemi principali

### 6.1 Terreno del mondo esteso (`world`)
- Generazione: `terrainNat` (rumore `tnz`, `fbm2`, `ridge2`), poi `worldPre` (raccordo col nucleo, scavo di laghi e fiumi con `waterCarve`), `worldH` (strade spianate) e `worldGround` (anche le travate dei ponti).
- Mesh a 3 livelli `TERR.L`: 192×192 celle da 4 m, 192×192 da 16 m, 256×256 da 48 m. Le prime due si ricostruiscono a righe (`terUpdate`), i livelli grossolani hanno un buco sotto quelli fini (`uHole`).
- Il terreno viene scartato nello shader sotto le aree del nucleo, per evitare sovrapposizioni.
- `worldForce(x,z)` ricostruisce subito tutto attorno a un punto: serve nei collaudi e nei teletrasporti.
- Crateri: `terrainCrater` e `CRT` si riempiono lentamente (`craterStep`, costante di tempo di circa 120 s). Il colore terra o roccia viene da `aDst`.

### 6.2 Foreste (`FOREST`)
- Celle da 64 m generate in modo deterministico (`treeCell`) e memorizzate.
- Abeti (tipo 0, 15–34 m) e latifoglie (tipo 1, 11–24 m). Da vicino modelli 3D (`FOREST.n`, oscillano col vento con `uSway`), più lontano sagome incrociate (`FOREST.i`), ancora più lontano la texture di densità `tFor`.
- Raggi `R0` e `R1` secondo la grafica: 140/650, 180/800, 230/1000, 300/1250 m.
- Collisioni (`treeCollide`) per giocatore, auto e aerei. Abbattimento: `fellTree`, `forestBlast`, `fallStep`, `FALL`.

### 6.3 Veicoli militari (`CVS`)
- Modelli: `mkFighter` (stile F-22), `mkBomber` (stile B-2), `mkStealth` (stile F-117), `mkTank(kind)` con kind `tiger`, `sherman`, `t34`, `modern`, e `mkUFO`.
- Fisica: `planeStep` (portanza, stallo, postbruciatore), `tankStep` (sfonda muri, abbatte alberi), `ufoStep` (raggio traente).
- Grafica e audio: `cvFrame`. Cingoli a maglie: `trackSys`, `trackSet`, `tankRoll`. Superfici mobili degli aerei: `cs` con `hinge`.
- Armi: `cvGun`, `fireRocket`, `dropBomb`, `BOMBS`, `TRACERS`.

### 6.4 Traffico (`TRF`)
- Avvio: `trInit` crea i 524 tratti stradali validi dell'isola (escluso il parco) e i semafori (`trLightsBuild`, fasi in `trLight(i,j,asse)` con ciclo di 26 s sfasato).
- Ogni frame: `trafficStep`.
  - Fa comparire auto tra 110 e 270 m da te: massimo 12, 22, 32 o 42 secondo la grafica (`trSpawn`, `trMake`).
  - Fa guidare le auto: `trPlan` decide percorso e svolte, `trDrive` fa l'inseguimento della traiettoria, gestisce velocità, semafori, distanze, pedoni e clacson.
- Tipi in `TRV`: sedan, suv, taxi, van, sports, hyper, police, amb, fire. Modelli: furgone e ambulanza in `vanGeos`, pompieri in `truckGeos`, auto speciali in `makeCarX`.
- Conducenti visibili (`trDriver`). Quando escono diventano NPC veri (`trExit`).
- Eventi: soccorsi con `trEvent`, inseguimenti con `trChase`; sirene con effetto Doppler in `trSirens`.

### 6.5 Persone (`NPC`)
- Disegnate con istanze multiple per tipo di forma (`NPCG.T`: box, limb, torso, head, hand, shoe, hair, sph; quantità in `NPCG.K`), geometrie in `npcGeos` (testa scolpita, mani con dita).
- Aspetto casuale in `npcLook`: carnagione `NSK`, capelli `NHC`, vestiti `NCL` e `NPA`, gatti `NCAT`, età, corporatura, telefono.
- Animazione con 11 ossa `n.B` (`npcBones`). Ragdoll con 15 punti (`ragStep`, `ragBones`).
- Comportamento: camminata sui marciapiedi (`npcWalk`, `npcLane`), paura e fuga (`npcBlast`, `npcVoice`). Comparsa e scomparsa automatiche: `spawnNPC`, `npcStep`, `npcFrame`.

### 6.6 Meteo (`WX`)
- `setWeather(k)` con k uguale a `'auto'` o a un tipo; la modalità automatica è `weatherAuto`, una catena di Markov che valuta un cambio ogni 80–210 s.
- Valori di riferimento per tipo in `WXP`; aggiornamento continuo in `updWeather`.
- Nuvole volumetriche: `initWeather` con `VCLD_F` e texture 3D 40³ (`cloudNoiseTex`), solo con WebGL2 e grafica da Media in su. Passi per qualità: Media 9+1, Alta 13+2, Ultra 19+2.
- Pioggia istanziata. Fulmini a nastro con colpi di ritorno (`lightning`, `boltRibbon`); tuoni con `thunder`.

### 6.7 Illuminazione notturna (`LAMPL`, `LMAP`)
- `lampBake` crea una texture 1536×896 che copre x da −1240 a 1240 e z da −720 a 720. Contiene la luce reale dei 2376 lampioni (legge 1/r² e coseno, lampade a 7,2 m), quella dei neon colorati e quella delle vetrine.
- La texture si usa sul suolo (`GND_F`) e sulle facciate basse. Luci vere sui lampioni più vicini: 0, 4, 6 o 8 secondo la grafica.
- Effetti: aloni, coni nella nebbia, pozze di luce dei fari (`lightStep`). Quando un lampione cade, `LAMPL.dirty` fa ricalcolare la texture.

### 6.8 Interni
- Città: stanze dietro le finestre calcolate nello shader (`roomCol`), con tipi ufficio, soggiorno, camera, cucina, negozio, atrio e magazzino.
- Base: oggetti 3D istanziati (`buildInteriors`, `PROPM`, `floorSlab`), cartelli e schermi.

### 6.9 Neon e pubblicità
- `buildNeon`: circa 900 insegne prese da un atlante di 16 scritte (BAR, PIZZA, OPEN, HOTEL, 24H…), con tremolio.
- `adCanvas` e `drawAd`: 6 animazioni in loop sugli schermi di Times Square.

---

## 7. Cosa c'è già (tutto quello che Mario ha chiesto ed è stato fatto)

- **Città e quartieri:** città con circa 890 palazzi e torri gemelle; parco; Times Square animata; neon; condizionatori sui tetti; Brooklyn e Jersey City; due ponti sospesi.
- **Armi e distruzione:** 13 armi; distruzione realistica con bordi rotti, ferri d'armatura e asteroide che sfonda palazzo dopo palazzo; detriti per materiale.
- **Acqua e tsunami:** acqua simulata, nuoto, vista sott'acqua torbida; tsunami realistico con danni e detriti trascinati; acqua alzata fangosa e opaca.
- **Vetri e interni:** vetri realistici; stanze arredate dietro ogni finestra; vetrine del museo; interni della base.
- **Mezzi:**
  - aerei militari dettagliati e pilotabili;
  - carri armati dettagliati;
  - UFO con raggio traente e Hangar 18 come sorpresa;
  - auto ed elicottero dettagliati con ammaccature;
  - motori audio realistici e contachilometri.
- **Mondo esteso:** 12 km con montagne innevate, colline, mare, 5 laghi, 3 fiumi, foreste fitte e 5 strade con viadotti; terreno e boschi distruttibili.
- **Traffico:** NPC alla guida, semafori, soccorsi, inseguimenti; conducenti che scendono e scappano.
- **Persone:** realistiche, con età, corporature, telefono e voci in inglese.
- **Meteo e luce:**
  - meteo dinamico con nuvole volumetriche, fulmini e tuoni;
  - illuminazione notturna da lampioni, neon, vetrine e fari;
  - nebbia calibrata per vedere le montagne a 5–6 km.
- **Sensazioni di gioco:** sensazione di velocità in volo; aerei che si schiantano sugli alberi.
- **Correzioni:** strisce a terra eliminate; cielo di tempesta grigio scuro.

---

## 8. Limiti noti (da dire sempre con onestà)

- **Traffico:** solo sull'isola, non nei quartieri né in montagna. Le auto non accostano per i soccorsi. Sportive e hypercar sono la berlina abbassata e allargata con alettone.
- **Nuvole volumetriche:** sono la parte più pesante; sul telefono è meglio la grafica Media. Sono sempre disegnate dietro palazzi e montagne e non fanno ombra a terra.
- **Lampioni:** non fanno ombre; i riflessi sull'asfalto bagnato sono approssimati.
- **Mondo esteso:** l'erba alta c'è solo nel parco; sotto i viadotti non si passa a piedi, perché la fisica considera la travata come suolo; i fiumi non mostrano la corrente.
- **Persone:** niente espressioni del viso e una sola famiglia di camminate.
- **Collaudi:** finora fatti in Chromium con SwiftShader (grafica software) a bassa risoluzione. Lì un fotogramma con le nuvole volumetriche impiegava 40–50 s, quindi i tempi non sono indicativi.

---

## 9. Cosa resta da fare (richieste di Mario non ancora realizzate)

1. **Nuova zona urbana high-tech** «dall'altra parte», cioè su terreno libero del mondo esteso:
   - forme astratte, moderne e tecnologiche;
   - aeroporto civile con terminal e interni dettagliati;
   - aerei di linea pilotabili, con piloti, copiloti e passeggeri dettagliati e interni curati;
   - voli automatici guidati da NPC da un luogo all'altro, con atterraggio;
   - probabilità di incidenti, per esempio un aereo che per errore del pilota si schianta su un palazzo.
2. **Strade e fiumi più dettagliati:** a volte danneggiati, con buche e fossi, alcuni puliti e altri sporchi.
3. **Base militare** molto più dettagliata e complessa.
4. **Miglioramenti possibili:**
   - traffico anche nei quartieri e sulle strade di montagna;
   - auto che accostano per i soccorsi;
   - modelli unici per sportive e hypercar;
   - ombre delle nuvole;
   - erba e sassi sul terreno esteso;
   - corrente visibile nei fiumi.

---

## 10. Come collaudare

Ricetta usata finora: Python con Playwright e Chromium in modalità software. Adattala a quello che Cowork può eseguire.

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle'])
    pg = b.new_page(viewport={'width':640,'height':360})
    pg.on('pageerror', lambda e: print('ERR', e))
    pg.on('console', lambda m: print(m.type, m.text) if m.type in ('error','warning') else None)
    pg.add_init_script("localStorage.setItem('cubeyork_q', JSON.stringify('media'))")
    pg.goto('file:///percorso/index.html')          # meglio servirlo via http://localhost (AudioWorklet richiede contesto sicuro)
    pg.wait_for_function('window.__ready===true', timeout=600000)
    pg.evaluate("()=>{audioInit=()=>{};requestLock=()=>{};startGame();setSeg('tod','notte');setSeg('view','1p');}")
    pg.evaluate("()=>{const P=player;P.fly=true;P.x=0;P.y=60;P.z=300;P.yaw=0;P.pitch=-.2;worldForce(P.x,P.z);for(let i=0;i<3;i++)frameUpdate(1/30);}")
    img = pg.evaluate("()=>{render();return canvas.toDataURL('image/jpeg',.9)}")   # salva e guarda l'immagine
    b.close()
```

**Funzioni utili nei collaudi:**
- `fixedStep(1/60)` fa avanzare la fisica; `frameUpdate(dt)` aggiorna la grafica.
- `setWeather('tempesta',true)` e poi `updWeather(1/30)` ripetuto molte volte per arrivare a regime.
- `spawnTsunami({kind:1,x:0,z:1100})`, `explode(x,y,z,R,1,{})`, `trChase()`, `trEvent('amb')`, `lampBake()`.
- `player` ha i campi `x`, `y`, `z`, `yaw`, `pitch`, `fly`. In avanti si va verso (−sin yaw, −cos yaw); `pitch` positivo guarda in alto.

**Altri accorgimenti:**
- In modalità software ogni fotogramma può impiegare molti secondi: lancia i test in background e controlla periodicamente.
- Per il deploy controlla anche la versione reale sul telefono, sul link GitHub Pages.

---

## 11. Cronologia delle modifiche (patch A → X)

| Patch | Contenuto |
|---|---|
| A | Mappa 4 volte più grande, torri gemelle, parco, Times Square |
| B | Simulazione dell'acqua, nuoto, volo, veicoli generati dove si mira |
| C | Bordi rotti, ferri d'armatura, asteroide che sfonda |
| D | Auto ed elicottero in alta definizione, ammaccature, pale che volano |
| E | Brooklyn e Jersey City, ponte sospeso, 3 livelli di dettaglio |
| F | Correzione dei puntini gialli, bloom, interfaccia compatta, app installabile |
| G | Riflessi fluidi dei vetri, colori degli NPC |
| H | Cursore distanza dettagli, meteo, tsunami, tornado, motore, contachilometri |
| I | NPC con ragdoll |
| K | Deserto e alberi con foglie fisiche |
| L1–L2 | Base Area 51: aerei, carri, UFO |
| M | Vetri realistici, cielo di tempesta, acqua vista da sotto, NPC con voci, motori AudioWorklet, neon, schermi animati |
| N | Nebbia sott'acqua, correzioni al motore |
| P | Aerei e carri rifatti in dettaglio |
| Q–Q2 | Interni della città e della base, pavimenti degli hangar |
| R–R2 | Mondo esteso (montagne, laghi, fiumi, foreste, strade, ponte ovest), cielo grande |
| S | Profondità a 24 bit (fine delle strisce), tsunami nuovo, acqua torbida, detriti per materiale, velocità percepita, crateri e boschi distruttibili |
| T | Danni dello tsunami ai palazzi |
| (ritocchi) | Onda: increspature, sedimenti, schiuma, fragore |
| U | Traffico |
| V–V2 | Nuvole volumetriche, meteo automatico, fulmini, tuoni |
| W | NPC realistici con proporzioni corrette |
| X | Illuminazione notturna |

---

## 12. Indice di tutte le funzioni (479, in ordine di apparizione nel file)

Da usare per cercare nel codice.

`mulberry32`, `hash2`, `vnoise`, `addDamage`, `facadeMat`, `groundMatF`, `waterMatF`, `mkRT`, `setupPost`, `fsPass`, `renderPost`, `makeSkyEnv`
`envOKTest`, `envSelfTest`, `probeHideList`, `updateProbe`, `probeStep`, `dropProbe`, `setShadowRes`, `updateShadowCam`, `flashLight`, `updLights`, `applyTOD`, `rboxGeo`
`mergeGeos`, `colorize`, `parkH`, `bridgeH`, `groundBase`, `groundBase0`, `thash`, `tnz`, `fbm2`, `ridge2`, `coastZ`, `terrainNat`
`isCore`, `coreNear`, `segGrid`, `segQ`, `riverQ`, `roadQ`, `waterCarve`, `worldPre`, `worldH`, `worldGround`, `inlandWater`, `densify`
`worldInit`, `forestD`, `fTexAt`, `forestTex`, `terMat`, `terLevel`, `terH`, `terRows`, `terApply`, `terHoles`, `terBuild`, `terUpdate`
`treeGeos`, `treeSprite`, `treeCell`, `buildForest`, `forestUpdate`, `treesNear`, `treeCollide`, `roadTex`, `ribbon`, `buildWorldWater`, `buildRoads`, `tmodQ`
`tmodDst`, `terrainCrater`, `terRefreshArea`, `fellTree`, `forestBlast`, `fallStep`, `craterStep`, `worldForce`, `buildWorld`, `worldStep`, `rhI`, `groundH`
`groundPl`, `parkDist`, `bAt`, `addBuilding`, `genLots`, `genCity`, `adTex`, `neonAtlas`, `buildNeon`, `adCanvas`, `drawAd`, `underFog`
`buildBillboards`, `updBillboards`, `buildBridge`, `bridgeRail`, `makeInst`, `iDirty`, `iAttr`, `iSet`, `iHide`, `iFlush`, `buildCityMeshes`, `makeGrass`
`defProp`, `addProp`, `lodR`, `showProp`, `lodRS`, `lodRC`, `lodFillK`, `lodFillCars`, `lodUpdate`, `propsNear`, `propDyn`, `buildProps`
`sweep`, `heliFus`, `heliBoom`, `carGeos`, `carImpostor`, `lodFade`, `warmup`, `buildCars`, `setSlot`, `carsNear`, `carDyn`, `makeCar`
`cellAlloc`, `cellRelease`, `jagAlloc`, `breakFace`, `exposeN`, `spawnRebar`, `killRebar`, `inTiers`, `voxelize`, `removeCell`, `splitBox`, `fragmentBox`
`structural`, `collapse`, `loadCheck`, `crushLevel`, `startLean`, `bShake`, `creak`, `topple`, `updLeans`, `placeFire`, `addFire`, `updFires`
`debAlloc`, `newBody`, `updR`, `setYaw`, `syncObj`, `killBody`, `spawnDebris`, `freeOld`, `writeBodyMatrix`, `rubblize`, `samplePts`, `pointContact`
`angT`, `applyImp`, `cStatic`, `nearB`, `worldContacts`, `hIns`, `buildHash`, `forNear`, `pairContacts`, `cornersIn`, `resolvePair`, `wake`
`wakeBox`, `wsCell`, `waterAt`, `wsTerrain`, `wsInit`, `wsStep`, `floodMatF`, `wsMesh`, `wsMeshUpdate`, `wsPersist`, `wsReset`, `buoyancy`
`integrate`, `impactEvent`, `fractureBody`, `physStep`, `puffTex`, `fireTex`, `dustPuff`, `smoke`, `fireP`, `sparks`, `chips`, `flare`
`splash`, `makeShards`, `shardSpawn`, `shardUpdate`, `makeGravel`, `gravel`, `gravelUpdate`, `glassBurst`, `audioInit`, `setPan`, `panAt`, `sfx`
`sndImpact`, `sndExplosion`, `sndCollapse`, `sndGlass`, `sndStep`, `mkLoop`, `mkOscLoop`, `loopGain`, `getLoop`, `updAudio`, `rb`, `makeChar`
`solidBoxes`, `playerStep`, `collideAxis`, `collideY`, `playerBodies`, `updateCamera`, `applyShake`, `animChar`, `rayBox`, `rayVox`, `rayOBB`, `raycast`
`carForces`, `antiRoll`, `dent`, `ignite`, `nearestVehicle`, `enterVehicle`, `exitVehicle`, `makeHeli`, `heliForces`, `updFly`, `heliCrash`, `vehicleVisuals`
`addWave`, `explode`, `destroySphere`, `shockStep`, `placeC4`, `detonate`, `supported`, `updCharges`, `fireRocket`, `updRockets`, `makeLaser`, `handPos`
`laserTick`, `laserStop`, `makeMeteorAssets`, `nearBuildings`, `carve`, `meteorSweep`, `spawnMeteor`, `updMeteors`, `meteorImpact`, `spawnTornado`, `tornadoAir`, `tornadoDamage`
`makeRain`, `cloudNoiseTex`, `boltRibbon`, `thunder`, `lightning`, `weatherAuto`, `setWeather`, `initWeather`, `updWeather`, `windForces`, `tsH`, `tsuMat`
`spawnTsunami`, `tsuDir`, `tsuImpact`, `tsuFlowDamage`, `tsuDrag`, `updTsunami`, `npcWant`, `npcGeos`, `npcShadow`, `initNPC`, `npcLook`, `npcWrite`
`npcAlloc`, `spawnNPC`, `npcKill`, `npcClear`, `npcSpot`, `npcLane`, `npcWalk`, `npcBones`, `npcRag`, `ragStep`, `ragBones`, `npcVoice`
`npcBlast`, `spawnNPCAt`, `npcStep`, `npcFrame`, `inDesert`, `desertH`, `desertH0`, `causeH`, `sandMatF`, `trkInit`, `trkDepth`, `trkStamp`
`trkRecenter`, `sandCrater`, `desertDrag`, `buildDesert`, `updDesert`, `initLeaves`, `leafAdd`, `leafBurst`, `leafBlast`, `leafClear`, `updLeaves`, `treeSplit`
`slab`, `cvR`, `cvNew`, `flameM`, `gearSet`, `Bin`, `mergeBin`, `binMesh`, `uvS`, `ccwP`, `loftU`, `polyLoft`
`foil`, `hinge`, `panelTex`, `skinMat`, `decal`, `star5`, `tireG`, `gear2`, `navLights`, `wAt`, `flameSet`, `mkFighter`
`mkBomber`, `mkStealth`, `wheelG`, `sprocketG`, `trackLoop`, `trackSys`, `trackSet`, `wheelSet`, `tankRoll`, `mkTank`, `spawnPlane`, `cvFwd`
`planeCrash`, `planeStep`, `cvGun`, `dropBomb`, `bombStep`, `spawnTank`, `tankBreak`, `vitHit`, `tankStep`, `mkUFO`, `spawnUFO`, `ufoStep`
`baseMats`, `cGeo`, `cBox`, `cCyl`, `floorSlab`, `trHex`, `trPick`, `vanGeos`, `truckGeos`, `makeCarX`, `trScale`, `trWing`
`trBar`, `trDriver`, `trMake`, `trEdgeOK`, `trLight`, `trSpawn`, `trPlan`, `trDrive`, `trExit`, `trRemove`, `trafficBlast`, `trEdgeNear`
`trEvent`, `trChase`, `trLightsBuild`, `trLightsUpdate`, `trSirenNew`, `trSirens`, `trInit`, `trafficStep`, `lampList`, `lampBake`, `lampFX`, `lightInit`
`lightStep`, `buildInteriors`, `buildBase`, `cvStep`, `cvFrame`, `cvSilence`, `cvInfo`, `updTornados`, `applyFields`, `fieldParticle`, `fieldPlayer`, `spawnHole`
`holeRip`, `updHole`, `startQuake`, `quakeStep`, `updQuake`, `toggleFlood`, `slotsNear`, `staticContacts`, `playerSlots`, `aimPoint`, `spawnCarAt`, `spawnHeliAt`
`aim`, `weaponFire`, `toast`, `refreshSegs`, `setSeg`, `selectWeapon`, `buildUI`, `updHUD`, `readInput`, `fitTouch`, `goFull`, `toggleFly`
`lookBy`, `lockFail`, `requestLock`, `setupTouch`, `startGame`, `pause`, `resume`, `applyQuality`, `onResize`, `clearDebris`, `resetCity`, `fixedStep`
`engInit`, `engPick`, `vehicleAudio`, `speedFX`, `frameUpdate`, `inParkFn`, `titleCam`, `render`, `render0`, `loop`, `setLoad`

