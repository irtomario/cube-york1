/* ======================= PATCH AB — STABILITÀ SENZA TOGLIERE DETTAGLI ======================= */
// Risoluzione dinamica: se per qualche secondo il gioco va sotto i 45 fotogrammi al secondo (scena pesantissima:
// tornado più crolli più fuoco), la risoluzione di disegno scende a piccoli passi (fino al 60% di quella scelta) e
// risale da sola quando torna fluido. Geometrie, ombre, riflessi, erba e alberi restano quelli della qualità scelta:
// cambia solo quanti pixel vengono disegnati. Si può spegnere dalle impostazioni (Gioco).
// Rete di sicurezza: un errore in un pezzo del fotogramma non ferma più il gioco (viene segnalato una volta sola).
const DRS={on:true,k:1,acc:0,n:0,cool:3,lowT:0,hiT:0,steps:[1,.9,.8,.7,.6]};
try{const v=store.get('drs',true);DRS.on=v!==false&&v!=='0';}catch(e){}
function drsApply(k){DRS.k=k;try{renderer.setPixelRatio(QP.pr*k);renderer.setSize(innerWidth,innerHeight,false);setupPost();}catch(e){}}
function drsStep(dt){if(!DRS.on||state!=='play'){if(DRS.k!==1&&!DRS.on)drsApply(1);return;}DRS.cool-=dt;const f=fps||60;
 if(f<45)DRS.lowT+=dt;else DRS.lowT=Math.max(0,DRS.lowT-dt*2);if(f>57)DRS.hiT+=dt;else DRS.hiT=0;if(DRS.cool>0)return;
 const i=DRS.steps.indexOf(DRS.k);if(DRS.lowT>2.5&&i<DRS.steps.length-1){drsApply(DRS.steps[i+1]);DRS.cool=4;DRS.lowT=0;}
 else if(DRS.hiT>6&&i>0){drsApply(DRS.steps[i-1]);DRS.cool=5;DRS.hiT=0;}}
{const aq=applyQuality;applyQuality=function(n){aq(n);DRS.k=1;DRS.cool=3;};}
{const fu=frameUpdate;frameUpdate=function(dt){fu(dt);try{drsStep(dt);}catch(e){}};}
// interruttore nelle impostazioni (scheda Gioco)
(function(){try{const pane=document.querySelector('#pause .aapane');if(!pane)return;const row=document.createElement('div');row.className='set';row.innerHTML='<span>Risoluzione dinamica</span><div class="abseg" id="abDrs"><button data-v="1">Sì</button><button data-v="0">No</button></div>';pane.appendChild(row);
 const upd=()=>row.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.v==='1')===DRS.on)));upd();
 row.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{DRS.on=b.dataset.v==='1';try{store.set('drs',DRS.on);}catch(e){}upd();if(!DRS.on)drsApply(1);}));}catch(e){}})();
// ---------- rete di sicurezza ----------
// Un errore in un pezzo del fotogramma (fisica, aggiornamento o disegno) prima saltava tutto il resto di quel fotogramma
// (e se si ripeteva, lo schermo restava fermo). Ora il resto del fotogramma va avanti; l'errore viene scritto nella
// console una volta sola per tipo, così resta visibile a chi fa le prove ma non blocca il gioco.
const SAFE={seen:new Set(),n:0};
function safeErr(tag,e){SAFE.n++;const k=tag+'|'+(e&&e.message);if(SAFE.seen.has(k)||SAFE.seen.size>24)return;SAFE.seen.add(k);
 try{console.error('[Cube York] errore in '+tag+': '+(e&&e.message)+'\n'+String((e&&e.stack)||'').slice(0,900));}catch(_){}setTimeout(()=>{throw e;},0);}
{const f0=fixedStep;fixedStep=function(dt){try{f0(dt);}catch(e){safeErr('fisica',e);}};}
{const f0=frameUpdate;frameUpdate=function(dt){try{f0(dt);}catch(e){safeErr('aggiornamento',e);}};}
{const f0=render;render=function(){try{f0();}catch(e){try{renderer.setRenderTarget(null);}catch(_){}safeErr('disegno',e);}};}
