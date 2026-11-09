/* ======================= PATCH AB — INTERFACCIA NUOVA: "VETRO" ======================= */
// Filosofia nuova (al posto del cartello della metropolitana):
// 1. La città è la protagonista: l'interfaccia è vetro smerigliato sottile ai bordi dello schermo, si nota solo quando serve.
// 2. Contesto: le cose compaiono quando contano (tachimetro solo sui mezzi, suggerimento solo quando cambia, messaggi che
//    scendono e se ne vanno da soli) e si fanno da parte quando giochi.
// 3. Pollice prima di tutto: sul telefono i comandi sono grandi, rotondi, nelle zone che il pollice raggiunge.
// 4. Un solo linguaggio: vetro, bordi a capello, angoli morbidi, un colore d'accento che è quello dell'arma scelta,
//    caratteri di sistema con numeri allineati.
// 5. Movimento con uno scopo: entrate a molla, liste che arrivano in cascata, mirino che si apre quando corri e si
//    stringe quando sei fermo, arco del tachimetro che scorre, pressione dei tasti che si sente. Rispetta "riduci movimento".
(function(){const st=document.createElement('style');st.id='abUI';st.textContent=`
:root{--g-bg:rgba(16,18,23,.44);--g-bg2:rgba(16,18,23,.66);--g-brd:rgba(255,255,255,.13);--g-hi:rgba(255,255,255,.07);--ink:#f4f6f9;--dim:rgba(232,238,245,.7);--faint:rgba(232,238,245,.32);
 --acc:#5ad1ff;--acc-ink:#06121a;--r:18px;--blur:saturate(165%) blur(18px);--ease:cubic-bezier(.2,.9,.25,1);--spring:cubic-bezier(.3,1.45,.5,1);
 --font:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Inter,"Helvetica Neue",Arial,sans-serif;--panel:var(--g-bg)}
body{font-family:var(--font);letter-spacing:.005em}
@keyframes abIn{from{opacity:0;transform:translateY(14px) scale(.985);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
@keyframes abSheet{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes abPop{0%{opacity:0;transform:translate(-50%,0) scale(.82)}60%{opacity:1;transform:translate(-50%,6px) scale(1.04)}100%{opacity:1;transform:translate(-50%,6px) scale(1)}}
@keyframes abGlow{0%,100%{box-shadow:0 0 0 1px rgba(255,255,255,.2),0 8px 30px -6px var(--acc)}50%{box-shadow:0 0 0 1px rgba(255,255,255,.35),0 8px 44px -2px var(--acc)}}
@keyframes abBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@keyframes abShine{from{background-position:-200% 0}to{background-position:200% 0}}
@keyframes abHit{0%{transform:scale(1)}35%{transform:scale(1.35) rotate(45deg)}100%{transform:scale(1) rotate(0)}}
@keyframes abBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
/* superfici di vetro */
.sign{background:var(--g-bg);border:1px solid var(--g-brd);border-radius:var(--r);-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);box-shadow:0 10px 40px -12px rgba(0,0,0,.55),inset 0 1px 0 var(--g-hi);padding:18px 18px 14px}
.sign::before{left:18px;right:auto;top:0;width:34px;height:3px;border-radius:0 0 3px 3px;background:var(--acc);transition:background .4s}
/* titoli */
h1{font-family:var(--font);font-weight:800;font-stretch:normal;letter-spacing:-.035em;line-height:.9;background:linear-gradient(180deg,#fff 30%,rgba(255,255,255,.62));-webkit-background-clip:text;background-clip:text;color:transparent;font-size:clamp(52px,11vw,118px)}
h2{font-family:var(--font);font-weight:800;font-stretch:normal;letter-spacing:-.03em;font-size:38px}
h3{font-weight:650;letter-spacing:.01em;color:var(--dim)}
.lead{color:var(--dim);font-size:16.5px}
/* pulsanti a pillola */
.btn{border:1px solid var(--g-brd);border-radius:999px;background:rgba(255,255,255,.06);padding:10px 20px;font-weight:650;font-stretch:normal;min-height:46px;transition:transform .16s var(--spring),background-color .2s,box-shadow .3s}
.btn:not(.primary):hover{background:rgba(255,255,255,.14)}
.btn.primary{background:var(--acc);color:var(--acc-ink);border-color:transparent;animation:abGlow 2.6s ease-in-out infinite}
.btn:active{transform:scale(.94)}
/* controlli segmentati e cursori */
.seg,.aatabs,.abseg{display:inline-flex;border:1px solid var(--g-brd)!important;border-radius:999px;background:rgba(0,0,0,.22);padding:3px;gap:2px}
.seg button,.aatabs button,.abseg button{border-radius:999px;font-weight:600;font-stretch:normal;padding:7px 13px;min-height:34px;color:var(--dim);transition:background-color .25s var(--ease),color .25s,transform .16s var(--spring)}
.seg button[aria-pressed="true"],.aatabs button[aria-selected="true"],.abseg button[aria-pressed="true"]{background:var(--ink);color:#0b0d10;box-shadow:0 2px 10px rgba(0,0,0,.35)}
.seg button:not([aria-pressed="true"]):hover,.aatabs button:not([aria-selected="true"]):hover{background:rgba(255,255,255,.1);color:var(--ink)}
input[type=range]{-webkit-appearance:none;appearance:none;height:28px;background:transparent;accent-color:var(--acc)}
input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:4px;background:linear-gradient(90deg,var(--acc),rgba(255,255,255,.25))}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;margin-top:-8px;box-shadow:0 2px 8px rgba(0,0,0,.45),0 0 0 4px rgba(255,255,255,.12);transition:transform .15s var(--spring)}
input[type=range]:active::-webkit-slider-thumb{transform:scale(1.25)}
input[type=range]::-moz-range-track{height:4px;border-radius:4px;background:rgba(255,255,255,.25)}input[type=range]::-moz-range-progress{height:4px;border-radius:4px;background:var(--acc)}
input[type=range]::-moz-range-thumb{width:20px;height:20px;border:0;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.45)}
.set{border-top:1px solid rgba(255,255,255,.06);padding-top:10px}
.set>span{color:var(--dim);font-weight:550}
/* schermate: sfondo sfumato, pannello che sale dal basso (telefono) o entra al centro */
.screen{background:radial-gradient(120% 90% at 50% 120%,rgba(0,0,0,.72),rgba(0,0,0,.18) 60%,rgba(0,0,0,0));align-items:flex-end;justify-content:flex-start}
.screen:not(.hidden)>.sign{animation:abSheet .5s var(--ease) both!important}
.screen>.sign{width:min(600px,100%);background:var(--g-bg2)}
#start .sign{background:linear-gradient(160deg,rgba(16,18,23,.5),rgba(16,18,23,.3))}
#start:not(.hidden) h1,#start:not(.hidden) .lead,#start:not(.hidden) .row,#start:not(.hidden) .set{animation:abIn .7s var(--ease) both!important}
#start:not(.hidden) .lead{animation-delay:.1s!important}#start:not(.hidden) .row{animation-delay:.2s!important}#start:not(.hidden) .set{animation-delay:.28s!important}
#loadbar{height:3px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}
#loadbar i{border-radius:3px;background:linear-gradient(90deg,var(--acc),#fff,var(--acc));background-size:200% 100%;animation:abShine 1.6s linear infinite}
#aaVer{color:var(--faint)}
.aapane{animation:abIn .32s var(--ease) both!important}
#help dt{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:12.5px;font-weight:600;background:rgba(255,255,255,.08);border:1px solid var(--g-brd);border-bottom-width:2px;border-radius:7px;padding:2px 7px;align-self:start;width:max-content}
/* HUD */
#hud .sign{padding:12px 12px 10px}
#xh{width:44px!important;height:44px!important;margin:-22px 0 0 -22px!important;filter:drop-shadow(0 0 1.5px rgba(0,0,0,.85));transition:transform .12s;--xs:0px}
#xh path{display:none}#xh .abx{stroke:#fff;stroke-width:2;stroke-linecap:round;transition:transform .12s var(--ease)}#xh .abd{fill:var(--acc)}
#xh.aafire{animation:abHit .26s var(--ease)!important}
#stats{border-radius:999px!important;padding:6px 12px!important;font-size:12px!important;line-height:1.3;min-width:0!important}
#stats::before{display:none}
#wbar{border-radius:24px!important;padding:14px 8px 10px!important;transition:transform .35s var(--ease),opacity .35s}
.wrow{border-radius:14px!important;padding:5px 6px!important;color:var(--dim);transition:background-color .2s,color .2s,transform .18s var(--spring)}
.wrow:active{transform:scale(.95)}
.wrow.on{color:#fff;background:linear-gradient(90deg,rgba(255,255,255,.13),rgba(255,255,255,0))!important}
.wrow .bullet{box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.4)}
.wrow.on .bullet{animation:none!important;box-shadow:0 0 0 2px rgba(0,0,0,.5),0 0 0 4px var(--acc),0 0 18px var(--acc)!important;transform:scale(1.12)}
#wdesc{color:var(--dim)}
#powm button{border:1px solid var(--g-brd)!important;border-radius:999px!important;background:rgba(255,255,255,.08)}
#hint{background:var(--g-bg);border:1px solid var(--g-brd);border-radius:999px;-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);padding:8px 16px;text-shadow:none!important;font-weight:550;font-size:13.5px;color:var(--ink);transition:opacity .35s,transform .35s var(--ease);max-width:min(92vw,720px);white-space:normal!important;text-align:center}
#hint:empty{opacity:0;transform:translate(-50%,8px)}
#hint.abNew{animation:abIn .45s var(--ease)}
body:has(#speedo:not(.hidden)) #hint:not(:empty){bottom:calc(env(safe-area-inset-bottom,0px) + 158px)}
@media (pointer:coarse){#hint{bottom:auto!important;top:calc(env(safe-area-inset-top,0px) + 12px)!important;max-width:min(64vw,560px);font-size:12.5px;padding:7px 14px}#hint:empty{transform:translate(-50%,-8px)}#toast{top:calc(env(safe-area-inset-top,0px) + 58px)!important}#speedo{left:calc(170px + (100% - 540px)/2)!important;transform:translateX(-50%) scale(.82)!important;transform-origin:50% 100%}}
#bDet{border-radius:999px;background:#ff3b30!important;box-shadow:0 8px 30px -6px #ff3b30;animation:abBreath 1.4s ease-in-out infinite}
#bMenu{border-radius:50%!important;background:var(--g-bg)!important;border:1px solid var(--g-brd);-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);transition:transform .16s var(--spring)}
#bMenu:active{transform:scale(.9)}
#toast{border-radius:999px!important;padding:10px 18px 12px!important;font-weight:600;overflow:hidden}
#toast::before{left:0!important;right:0!important;top:auto!important;bottom:0!important;width:auto!important;height:2px!important;border-radius:0!important;transform-origin:left;opacity:.9}
#toast.show::before{animation:abBar var(--td,3s) linear both}
#aaWann{border-radius:999px!important;padding:10px 20px 10px 10px!important}
#aaWann.show{animation:abPop .45s var(--ease) both}
#aaWann b{font-family:var(--font);font-weight:800;font-stretch:normal;letter-spacing:-.02em}
/* tachimetro: arco che scorre */
#speedo{width:132px;height:132px;min-width:0!important;padding:0!important;border-radius:50%!important;display:grid;place-items:center;align-content:center;font-size:11px!important;color:var(--dim)}
#speedo::before{display:none}
#speedo b{font-size:30px!important;font-weight:750!important;margin:0!important;color:var(--ink);font-variant-numeric:tabular-nums;line-height:1}
#speedo span{font-size:10.5px!important;max-width:110px;text-align:center;line-height:1.2}
#speedo svg.abArc{position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);transform:rotate(135deg);pointer-events:none}
#speedo .abTrk{fill:none;stroke:rgba(255,255,255,.12);stroke-width:5;stroke-linecap:round}
#speedo .abVal{fill:none;stroke:var(--acc);stroke-width:5;stroke-linecap:round;transition:stroke-dashoffset .25s var(--ease);filter:drop-shadow(0 0 4px var(--acc))}
#speedo:not(.hidden){animation:abIn .4s var(--ease)}
/* comandi touch: vetro rotondo */
.tb{background:var(--g-bg)!important;border:1px solid rgba(255,255,255,.22)!important;-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);font-weight:650;letter-spacing:.01em;box-shadow:0 6px 20px -8px rgba(0,0,0,.6);transition:transform .14s var(--spring),background-color .2s}
.tb:active,.tb.on{transform:scale(.92);background:rgba(255,255,255,.85)!important;color:#0b0d10}
#tFire{background:radial-gradient(circle at 50% 35%,var(--acc),rgba(0,0,0,.35) 140%)!important;border:2px solid rgba(255,255,255,.55)!important;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);box-shadow:0 0 0 6px rgba(255,255,255,.06),0 10px 30px -8px var(--acc)}
#joy{background:radial-gradient(circle,rgba(255,255,255,.06),rgba(16,18,23,.38))!important;border:1px solid rgba(255,255,255,.25)!important;-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur)}
#joy i{background:radial-gradient(circle at 40% 35%,#fff,rgba(255,255,255,.7))!important;box-shadow:0 4px 16px rgba(0,0,0,.45)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;document.head.appendChild(st);})();
// ---------- mirino dinamico ----------
(function(){const x=document.getElementById('xh');if(!x)return;x.setAttribute('viewBox','-22 -22 44 44');
 x.insertAdjacentHTML('beforeend','<g class="abxg"><line class="abx" id="abx0" x1="0" y1="-6" x2="0" y2="-13"/><line class="abx" id="abx1" x1="0" y1="6" x2="0" y2="13"/><line class="abx" id="abx2" x1="-6" y1="0" x2="-13" y2="0"/><line class="abx" id="abx3" x1="6" y1="0" x2="13" y2="0"/><circle class="abd" r="1.6"/></g>');})();
const ABUI={sp:0,arc:null,len:0,last:''};
{const fu=frameUpdate;frameUpdate=function(dt){fu(dt);try{abUIFrame(dt);}catch(e){}};}
function abUIFrame(dt){const P=player,sp=Math.hypot(P.vx||0,P.vz||0),aiming=P.aimT>0,tgt=(P.mode==='walk'?Math.min(9,sp*1.1)+(P.ground?0:5):0)-(aiming?2.5:0);ABUI.sp+=(tgt-ABUI.sp)*Math.min(1,dt*10);
 const s=Math.max(0,ABUI.sp);for(let i=0;i<4;i++){const e=document.getElementById('abx'+i);if(!e)break;const dx=i===2?-s:i===3?s:0,dy=i===0?-s:i===1?s:0;e.setAttribute('transform','translate('+dx.toFixed(2)+' '+dy.toFixed(2)+')');}
 // arco del tachimetro
 const sv=document.getElementById('spV'),so=document.getElementById('speedo');if(sv&&so&&!so.classList.contains('hidden')){if(!ABUI.arc){so.insertAdjacentHTML('afterbegin','<svg class="abArc" viewBox="0 0 100 100"><circle class="abTrk" cx="50" cy="50" r="44" pathLength="100" stroke-dasharray="75 100"/><circle class="abVal" cx="50" cy="50" r="44" pathLength="100" stroke-dasharray="75 100" stroke-dashoffset="75"/></svg>');ABUI.arc=so.querySelector('.abVal');}
  const v=parseFloat(sv.textContent)||0,mx=P.mode==='plane'?1100:(P.mode==='heli'?320:(P.mode==='tank'?80:260)),f=Math.min(1,v/mx);ABUI.arc.setAttribute('stroke-dashoffset',(75-75*f).toFixed(2));}}
// ---------- colore d'accento = colore dell'arma scelta ----------
{const sw=selectWeapon;selectWeapon=function(i){sw(i);try{const W=WEAPONS[wIdx];if(W){document.documentElement.style.setProperty('--acc',W.col);const c=new THREE.Color(W.col),l=.299*c.r+.587*c.g+.114*c.b;document.documentElement.style.setProperty('--acc-ink',l>.55?'#0b0d10':'#ffffff');}}catch(e){}};}
// ---------- messaggi: barra che si consuma col tempo di lettura; suggerimento che entra quando cambia ----------
{const t0=toast;toast=function(msg){t0(msg);try{const t=document.getElementById('toast');t.style.setProperty('--td',(Math.min(7000,Math.max(2800,String(msg).length*62))/1000)+'s');}catch(e){}};}
(function(){const h=document.getElementById('hint');if(!h)return;let last='';new MutationObserver(()=>{const t=h.textContent;if(t&&t!==last){h.classList.remove('abNew');void h.offsetWidth;h.classList.add('abNew');}last=t;}).observe(h,{childList:true,characterData:true,subtree:true});})();
(function(){const v=document.getElementById('aaVer');if(v)v.textContent='Versione AB · erba e alberi veri, cielo fisico, acqua e vetri che riflettono, auto che si accartocciano, Nova viva';})();
