/* ======================= PATCH AA — INTERFACCIA: ANIMAZIONI, IMPOSTAZIONI A SCHEDE, ANNUNCIO DELL'ARMA ======================= */
// Stesso stile da cartello della metropolitana, ma vivo: i pannelli entrano scorrendo e la riga bianca si disegna, i pulsanti
// rispondono al tocco, l'arma scelta si ingrandisce nella lista e compare in grande al centro (utile sul telefono, dove i nomi
// sono nascosti), il mirino pulsa a ogni colpo, i messaggi scendono dall'alto e restano il tempo che serve per leggerli.
// Le impostazioni della pausa sono divise in schede: Gioco, Città, Controlli, Viaggio.
(function(){const st=document.createElement('style');st.textContent=`
@keyframes aaSignIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes aaRuleIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes aaXh{0%{transform:scale(1)}30%{transform:scale(1.45) rotate(8deg)}100%{transform:scale(1)}}
@keyframes aaPulse{0%{box-shadow:0 0 0 2px #000,0 0 0 4px #fff}50%{box-shadow:0 0 0 2px #000,0 0 0 7px rgba(255,255,255,.55)}100%{box-shadow:0 0 0 2px #000,0 0 0 4px #fff}}
.screen:not(.hidden)>.sign{animation:aaSignIn .38s cubic-bezier(.2,.8,.2,1) both}
.screen:not(.hidden)>.sign::before{transform-origin:left;animation:aaRuleIn .55s .08s cubic-bezier(.2,.8,.2,1) both}
#start:not(.hidden) h1{animation:aaSignIn .6s .1s cubic-bezier(.2,.8,.2,1) both}
#start:not(.hidden) .lead{animation:aaSignIn .6s .22s cubic-bezier(.2,.8,.2,1) both}
#start:not(.hidden) .row,#start:not(.hidden) .set{animation:aaSignIn .6s .32s cubic-bezier(.2,.8,.2,1) both}
.btn{transition:background-color .16s,color .16s,transform .12s}
.btn:not(.primary):hover{background:rgba(255,255,255,.12)}
.btn:active,.tb:active,.seg button:active,.tabs button:active{transform:scale(.95)}
.seg button,.tb{transition:background-color .16s,color .16s,transform .12s}
.seg button:not([aria-pressed="true"]):hover{background:rgba(255,255,255,.12)}
.wrow{transition:color .18s,background-color .18s;border-radius:18px}
.wrow .bullet{transition:transform .24s cubic-bezier(.3,1.6,.5,1)}
.wrow.on .bullet{transform:scale(1.14);animation:aaPulse 1.8s ease-in-out infinite}
.wrow.on{background:linear-gradient(90deg,rgba(255,255,255,.14),rgba(255,255,255,0))}
.wrow:not(.on):hover{color:#fff;background:rgba(255,255,255,.06)}
#toast{transform:translate(-50%,-12px);transition:opacity .3s,transform .4s cubic-bezier(.2,.8,.2,1)}
#toast.show{transform:translate(-50%,0)}
#xh.aafire{animation:aaXh .22s ease-out}
#aaWann{position:absolute;left:50%;top:21%;transform:translate(-50%,0);display:flex;align-items:center;gap:12px;padding:18px 18px 10px;opacity:0;pointer-events:none;transition:opacity .25s,transform .35s cubic-bezier(.2,.8,.2,1)}
#aaWann.show{opacity:1;transform:translate(-50%,8px)}
#aaWann .bullet{width:40px;height:40px}#aaWann .bullet svg{width:24px;height:24px}
#aaWann b{font-size:26px;font-weight:900;font-stretch:70%;letter-spacing:.01em;white-space:nowrap}
#aaWann small{display:block;font-size:12px;font-weight:600;color:var(--dim)}
.aatabs{display:flex;margin:14px 0 6px;border:2px solid #fff;width:max-content;max-width:100%;flex-wrap:wrap}
.aatabs button{padding:7px 13px;font-weight:700;font-stretch:90%;font-size:14px;min-height:38px;transition:background-color .16s,color .16s}
.aatabs button[aria-selected="true"]{background:#fff;color:#000}
.aapane{animation:aaSignIn .25s both}
.aapane[hidden]{display:none}
#aaVer{font-size:12px;color:var(--faint);margin:10px 0 0;letter-spacing:.02em}
@media (prefers-reduced-motion:reduce){.screen>.sign,.screen>.sign::before,#start h1,#start .lead,#start .row,#start .set,.aapane,#xh.aafire,.wrow.on .bullet{animation:none!important}#toast,#aaWann{transition:none}}
`;document.head.appendChild(st);})();
// ---------- impostazioni della pausa in schede ----------
(function(){const P=document.querySelector('#pause .sign');if(!P)return;
 const find=sel=>{const e=P.querySelector(sel);if(!e)return null;return e.closest('.set')||e.closest('.row');};
 const groups=[['Gioco',['[data-seg="q"]','[data-seg="tod"]','[data-seg="view"]','[data-seg="meteo"]']],['Città',['#rLod','#rNpc','[data-seg="npcd"]','[data-seg="flights"]','[data-seg="acc"]']],
  ['Controlli',['#rPow2','#rSens','#rFov','#rVol']],['Viaggio',['#tpRow','#bClear']]];
 const first=P.querySelector('.row');if(!first)return;const bar=document.createElement('div');bar.className='aatabs';bar.setAttribute('role','tablist');first.after(bar);let prev=bar;const panes=[];
 groups.forEach(([name,sels],i)=>{const pane=document.createElement('div');pane.className='aapane';pane.setAttribute('role','tabpanel');if(i)pane.hidden=true;
  for(const s of sels){const r=find(s);if(r&&r!==first)pane.appendChild(r);}prev.after(pane);prev=pane;panes.push(pane);
  const b=document.createElement('button');b.textContent=name;b.setAttribute('role','tab');b.setAttribute('aria-selected',i?'false':'true');
  b.addEventListener('click',()=>{panes.forEach((p,j)=>{p.hidden=j!==i;});bar.querySelectorAll('button').forEach((x,j)=>x.setAttribute('aria-selected',j===i?'true':'false'));try{store.set('aatab',i);}catch(e){}});bar.appendChild(b);});
 try{const t=store.get('aatab',0);if(t>0&&t<panes.length)bar.children[t].click();}catch(e){}})();
// ---------- versione sul titolo ----------
(function(){const s=document.querySelector('#start .sign');if(!s)return;const p=document.createElement('p');p.id='aaVer';p.textContent='Versione AA · strade e auto distruttibili, esplosioni in acqua, tornado, città più viva';s.appendChild(p);})();
// ---------- annuncio dell'arma al centro ----------
(function(){const hud=document.getElementById('hud');if(!hud)return;const d=document.createElement('div');d.id='aaWann';d.className='sign';hud.appendChild(d);})();
{const sw0=selectWeapon;let first=true;selectWeapon=function(i){sw0(i);if(first){first=false;return;}try{const d=document.getElementById('aaWann'),W=WEAPONS[wIdx],row=document.querySelectorAll('.wrow')[wIdx];if(!d||!W||state!=='play')return;
  const bl=row?row.querySelector('.bullet'):null;d.innerHTML=(bl?bl.outerHTML:'')+'<div><b></b><small></small></div>';d.querySelector('b').textContent=W.name;d.querySelector('small').textContent=IS_TOUCH?'':'Tasto '+W.key;
  d.classList.add('show');clearTimeout(selectWeapon.h);selectWeapon.h=setTimeout(()=>d.classList.remove('show'),1100);}catch(e){}};}
// ---------- il mirino pulsa a ogni colpo ----------
{const wf0=weaponFire;weaponFire=function(dt){const a=fireCD;wf0(dt);if(fireCD>a+.001){const x=document.getElementById('xh');if(x){x.classList.remove('aafire');void x.offsetWidth;x.classList.add('aafire');}}};}
// ---------- messaggi: restano il tempo che serve per leggerli ----------
toast=function(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),Math.min(7000,Math.max(2800,String(msg).length*62)));};
// rete di sicurezza: se per qualche motivo un'animazione d'entrata resta ferma (scheda in secondo piano, browser sotto sforzo),
// dopo un attimo viene portata alla fine, così pannelli e impostazioni non restano mai invisibili
function aaFinishAnims(el){setTimeout(()=>{try{for(const a of el.getAnimations({subtree:true})){const t=a.effect&&a.effect.getTiming?a.effect.getTiming():null;if(t&&t.iterations!==Infinity&&a.playState!=='finished')a.finish();}}catch(e){}},950);}
(function(){try{const mo=new MutationObserver(ms=>{for(const m of ms){const el=m.target;if(el.classList&&el.classList.contains('screen')&&!el.classList.contains('hidden'))aaFinishAnims(el);}});
 document.querySelectorAll('.screen').forEach(s=>{mo.observe(s,{attributes:true,attributeFilter:['class']});if(!s.classList.contains('hidden'))aaFinishAnims(s);});
 document.querySelectorAll('.aatabs button').forEach(b=>b.addEventListener('click',()=>{const p=document.querySelector('#pause .sign');if(p)aaFinishAnims(p);}));}catch(e){}})();
