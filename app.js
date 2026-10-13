// Coquille : routeur, navigation, événements, lecteur de mobilité
import { db, save, exOf, replaceDb, resetDb, onSaveError } from './store.js';
import { MOBILITY } from './program.js';
import { ACT, R, $, toast, closeSheet, sheetOpen, confirmSheet, media } from './ui.js';
import { audio, beep, vibrate, wake } from './timer.js';
import { workoutView, tickWorkout, onInput as workoutInput, pickerInput } from './workout.js';
import {
  home, train, routineEdit, routineInput, resetDraft, library, libInput, exercisePage, resetExTab, bravo, workoutDetail,
  historyView, profile, bodyView, testsView, submitTests, programView, settingsView, settingsChange, applyTheme,
  onboarding, mobilityView,
} from './views.js';
import { icon, esc, today, fmtClock, nowTs } from './util.js';

onSaveError(e => toast('Sauvegarde impossible : ' + e.message));

const ROUTES = {
  '': home, entrainement: train, exercices: library, ex: exercisePage, profil: profile, seance: workoutView,
  bravo, w: workoutDetail, historique: historyView, corps: bodyView, tests: testsView, programme: programView,
  reglages: settingsView, routine: routineEdit, mobilite: mobilityView,
};
const TAB_OF = { '': '', entrainement: 'entrainement', programme: 'entrainement', routine: 'entrainement', mobilite: 'entrainement',
  exercices: 'exercices', ex: 'exercices', profil: 'profil', historique: 'profil', corps: 'profil', tests: 'profil', reglages: 'profil', w: 'profil' };
const FOCUS = new Set(['seance', 'bravo']);

const route = () => location.hash.replace(/^#\/?/, '').split('/');
let lastRoute = null;
const navStack = [];

function render() {
  let [r, arg] = route();
  if (!(r in ROUTES)) r = '';
  if (!db.profile.onboarded) r = 'bienvenue';
  const key = `${r}/${arg || ''}`;
  if (key !== lastRoute) {
    if (r !== 'routine') resetDraft();
    if (r !== 'ex') resetExTab();
    closeSheet(true);
  }
  const fn = r === 'bienvenue' ? onboarding : ROUTES[r];
  document.body.classList.toggle('focus', FOCUS.has(r) || r === 'bienvenue');
  stopPlayer(false);
  $('#view').innerHTML = fn(arg);
  $('#view').className = `view v-${r || 'home'}`;
  document.querySelectorAll('nav.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === (TAB_OF[r] ?? '')));
  // Mini-barre de séance en cours
  const mini = $('#mini');
  if (db.active && !FOCUS.has(r) && r !== 'bienvenue') {
    mini.innerHTML = `<button class="mini-in" data-act="resume"><span class="pulse"></span><span class="grow"><b>${esc(db.active.name)}</b><small>Séance en cours</small></span><span id="miniClock">${fmtClock((nowTs() - db.active.start) / 1000)}</span>${icon('right', 18)}</button>`;
    mini.classList.add('show');
  } else mini.classList.remove('show');
  if (key !== lastRoute) window.scrollTo(0, 0);
  lastRoute = key;
}
R.render = render;
window.addEventListener('hashchange', () => {
  const h = location.hash || '#/';
  if (navStack.at(-2) === h) navStack.pop(); else navStack.push(h);
  render();
});
navStack.push(location.hash || '#/');
ACT.goBack = (el, e) => { if (navStack.length > 1) { e.preventDefault(); history.back(); } };
ACT.resume = () => { location.hash = '#/seance'; };

setInterval(tickWorkout, 1000);

// ---------- Événements délégués ----------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  audio();
  const fn = ACT[el.dataset.act];
  if (fn) fn(el, e);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (pickerInput(el) || libInput(el)) return;
  if (el.closest('.wk')) return workoutInput(el);
  if (el.matches('input') && routineInput(el)) return;
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('select') && routineInput(el)) return;
  if (settingsChange(el)) return;
  if (el.dataset.imp != null && el.files[0]) {
    el.files[0].text().then(txt => {
      const d = JSON.parse(txt);
      confirmSheet({ title: 'Importer cette sauvegarde ?', text: 'Les données actuelles seront remplacées.', ok: 'Importer', danger: true,
        onOk: () => { replaceDb(d); applyTheme(); toast('Sauvegarde importée'); render(); } });
    }).catch(err => toast('Import impossible : ' + err.message));
  }
});
document.addEventListener('submit', e => {
  if (e.target.dataset.form === 'tests') { e.preventDefault(); submitTests(e.target); }
});
// Entrée = champ suivant dans les séries
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sheetOpen()) return closeSheet();
  if (e.key !== 'Enter' || !e.target.matches('.srow .in')) return;
  e.preventDefault();
  const ins = [...document.querySelectorAll('.srow:not(.done) .in')];
  const i = ins.indexOf(e.target);
  if (ins[i + 1]) ins[i + 1].focus(); else e.target.blur();
});
ACT.wipe = () => confirmSheet({ title: 'Tout effacer ?', text: 'Séances, pesées, routines et réglages seront supprimés de cet appareil.', ok: 'Tout effacer', danger: true,
  onOk: () => { resetDb(); applyTheme(); location.hash = '#/'; render(); } });

// ---------- Lecteur de mobilité guidée ----------
let player = null;
const CIRC = 597;
ACT.play = () => {
  const steps = MOBILITY.steps.flatMap(h => h.sides ? [{ ...h, side: 'Côté gauche' }, { ...h, side: 'Côté droit' }] : [{ ...h }]);
  player = { steps, i: 0, left: 5, prep: true, paused: false };
  wake(true);
  const el = document.createElement('div'); el.id = 'player'; document.body.appendChild(el);
  drawPlayer();
  player.iv = setInterval(tickPlayer, 1000);
};
function tickPlayer() {
  if (!player || player.paused) return;
  player.left--;
  if (player.left <= 3 && player.left > 0) beep(660, 0.08);
  if (player.left <= 0) {
    if (player.prep) { player.prep = false; player.left = player.steps[player.i].hold; beep(880, 0.25); }
    else { player.i++; if (player.i >= player.steps.length) return endPlayer(); player.prep = true; player.left = 5; beep(520, 0.25); vibrate([200]); }
  }
  drawPlayer();
}
function drawPlayer() {
  const el = $('#player'); if (!el || !player) return;
  const st = player.steps[player.i], ex = exOf(st.id);
  const total = player.prep ? 5 : st.hold;
  const off = CIRC * (1 - player.left / total);
  const sig = `${player.i}|${player.prep}|${player.paused}`;
  if (player.sig === sig) {
    el.querySelector('.p-time').textContent = player.left;
    el.querySelector('.p-ring .val').style.strokeDashoffset = off;
    return;
  }
  player.sig = sig;
  el.innerHTML = `<div class="pl">
    <div class="pl-top"><button class="icon-btn" data-act="pClose" aria-label="Fermer">${icon('x', 24)}</button>
      <div class="pl-prog"><span style="width:${(player.i / player.steps.length) * 100}%"></span></div><span class="muted small">${player.i + 1}/${player.steps.length}</span></div>
    <div class="pl-name">${player.prep ? '<small>Prépare-toi</small>' : ''}<b>${esc(ex.n)}</b>${st.side ? `<span>${st.side}</span>` : ''}</div>
    <div class="p-ring ${player.prep ? 'prep' : ''}"><svg viewBox="0 0 200 200"><circle class="trk" cx="100" cy="100" r="95"/><circle class="val" cx="100" cy="100" r="95" stroke-dasharray="${CIRC}" style="stroke-dashoffset:${off}" transform="rotate(-90 100 100)"/></svg><b class="p-time">${player.left}</b></div>
    ${media(ex)}
    <ol class="steps">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
    <div class="pl-ctl"><button class="icon-btn lg" data-act="pPrev" aria-label="Précédent">${icon('back', 26)}</button>
      <button class="btn primary round" data-act="pPause" aria-label="Pause">${icon(player.paused ? 'play' : 'pause', 26)}</button>
      <button class="icon-btn lg" data-act="pNext" aria-label="Suivant">${icon('right', 26)}</button></div></div>`;
}
function endPlayer() {
  const t = today();
  db.mob[t] = true; (db.habits[t] ||= {}).mob = true; save();
  stopPlayer(true); toast('Mobilité faite'); render();
}
function stopPlayer(release) {
  if (!player) return;
  clearInterval(player.iv); player = null; $('#player')?.remove();
  if (release) wake(false);
}
ACT.pClose = () => { stopPlayer(true); render(); };
ACT.pPause = () => { player.paused = !player.paused; drawPlayer(); };
ACT.pNext = ACT.pPrev = el => {
  player.i = Math.max(0, player.i + (el.dataset.act === 'pNext' ? 1 : -1));
  if (player.i >= player.steps.length) return endPlayer();
  player.prep = false; player.left = player.steps[player.i].hold; drawPlayer();
};

// ---------- Cycle de vie ----------
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (db.active || player) wake(true);
  if (!route()[0]) render(); // nouveau jour
});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
applyTheme();
if (db.active) wake(true);
render();
