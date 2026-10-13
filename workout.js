// Séance en cours (style Hevy) + sélecteur d'exercices
import { db, save, exOf, allEx, unit, toDisp, fromDisp, roundDisp } from './store.js';
import { GROUPS, MUSCLES, EQUIP } from './exercises.js';
import { makeExercise, newSet, targetLabel, setVolume, doneSets, computePRs, workoutVolume, parseReps } from './core.js';
import { ACT, INP, CHG, R, $, toast, openSheet, closeSheet, confirmSheet, menuSheet, thumb, exSheet, muscleLine } from './ui.js';
import { startTimer, stopTimer, wake, beep } from './timer.js';
import { icon, esc, num, fmtClock, fmtRest, nowTs, uid } from './util.js';

const COLS = {
  wr: [['w', () => unit().toUpperCase()], ['r', () => 'REPS']],
  bw: [['w', () => '+' + unit().toUpperCase()], ['r', () => 'REPS']],
  r: [['r', () => 'REPS']],
  time: [['v', () => 'SEC']],
  dist: [['v', () => 'M']],
  wd: [['w', () => unit().toUpperCase()], ['v', () => 'M']],
};
const TYPE = { w: { l: 'W', n: 'Échauffement' }, n: { l: '', n: 'Normale' }, d: { l: 'D', n: 'Dégressive' }, f: { l: 'F', n: 'Jusqu’à l’échec' } };
const SS_COLORS = { A: 'var(--ss1)', B: 'var(--ss2)', C: 'var(--ss3)', D: 'var(--ss4)' };

const W = () => db.active;
const dispW = v => v === '' || v == null ? '' : num(roundDisp(toDisp(v)), 2).replace(/\s/g, '');
const inVal = (s, f) => f === 'w' ? dispW(s.w) : s[f] === '' || s[f] == null ? '' : String(s[f]);
const phVal = (s, f) => f === 'w' ? dispW(s.pw) : s['p' + f] === '' || s['p' + f] == null ? '' : String(s['p' + f]);

// ---------- Rendu ----------
export function workoutView() {
  const w = W();
  if (!w) return `<div class="empty-state">${icon('dumbbell', 40)}<h2>Aucune séance en cours</h2><a class="btn primary" href="#/entrainement">Choisir une séance</a></div>`;
  const meta = w.kind === 'program' && w.phaseName ? `<div class="wk-meta">${esc(w.phaseName)}</div>` : '';
  return `
  <div class="wk">
    <header class="wk-top">
      <button class="icon-btn" data-act="wkMin" aria-label="Réduire">${icon('down', 24)}</button>
      <button class="wk-title" data-act="wkRename"><b>${esc(w.name)}</b><span id="wkClock">${fmtClock((nowTs() - w.start) / 1000)}</span></button>
      <button class="btn primary sm" data-act="wkFinish">Terminer</button>
    </header>
    <div class="wk-stats">
      <div><span>Durée</span><b id="wkDur">${fmtClock((nowTs() - w.start) / 1000)}</b></div>
      <div><span>Volume</span><b id="wkVol">${volText(w)}</b></div>
      <div><span>Séries</span><b id="wkSets">${setsText(w)}</b></div>
    </div>
    ${meta}
    ${w.warm ? mobCard('warm', 'Échauffement', w.warm) : ''}
    ${w.ex.map((x, i) => exoCard(x, i)).join('')}
    <button class="btn soft block add-ex" data-act="wkAddEx">${icon('plus', 20)} Ajouter un exercice</button>
    ${w.cool ? mobCard('cool', 'Retour au calme', w.cool) : ''}
    <button class="btn text-danger block" data-act="wkDiscard">Abandonner la séance</button>
  </div>`;
}
const volText = w => `${num(toDisp(workoutVolume(w)), 0)} ${unit()}`;
const setsText = w => { const all = w.ex.reduce((a, x) => a + x.sets.filter(s => s.k !== 'w').length, 0); return `${w.ex.reduce((a, x) => a + doneSets(x).length, 0)}/${all}`; };

function mobCard(key, title, list) {
  const done = list.filter(x => x.done).length;
  const open = key === 'warm' ? done < list.length : done > 0 || W().ex.every(x => x.sets.every(s => s.done));
  return `<details class="card mobcard" ${open ? 'open' : ''}>
    <summary><span class="mob-ic">${icon(key === 'warm' ? 'flame' : 'stretch', 18)}</span><b>${title}</b><span class="muted">${done}/${list.length}</span>${icon('down', 18, 'chev')}</summary>
    ${list.map((m, i) => `<div class="mrow ${m.done ? 'done' : ''}">
      <button class="mname" data-act="exInfo" data-id="${m.id}">${thumb(m.id, 34)}<span><b>${esc(exOf(m.id).n)}</b><small>${esc(m.reps)}</small></span></button>
      <button class="ck ${m.done ? 'on' : ''}" data-act="mobCk" data-list="${key}" data-i="${i}">${icon('check', 18)}</button></div>`).join('')}
  </details>`;
}

function exoCard(x, i) {
  const ex = exOf(x.id), cols = COLS[ex.lt] || COLS.wr;
  let n = 0;
  const rows = x.sets.map((s, si) => {
    const lbl = s.k === 'n' ? ++n : TYPE[s.k].l;
    return `<div class="srow ${s.done ? 'done' : ''}" data-x="${i}" data-s="${si}">
      <button class="stype t-${s.k}" data-act="stype">${lbl}</button>
      <span class="prev">${esc(s.prev || '—')}</span>
      ${cols.map(([f]) => `<input class="in" data-f="${f}" inputmode="${f === 'r' ? 'numeric' : 'decimal'}" enterkeyhint="done" value="${inVal(s, f)}" placeholder="${phVal(s, f)}" aria-label="${f}">`).join('')}
      <button class="ck ${s.done ? 'on' : ''}" data-act="ck" aria-label="Valider">${icon('check', 18)}</button></div>`;
  }).join('');
  const sp = x.target ? parseReps(x.target.reps) : null;
  const ss = x.ss ? `<span class="ss-tag" style="--c:${SS_COLORS[x.ss] || 'var(--ac)'}">Superset ${x.ss}</span>` : '';
  return `<section class="exo ${x.ss ? 'is-ss' : ''}" style="${x.ss ? `--c:${SS_COLORS[x.ss] || 'var(--ac)'}` : ''}" data-x="${i}">
    <div class="exo-h">
      <button class="exo-name" data-act="exInfo" data-id="${esc(x.id)}">${thumb(x.id, 40)}<span><b>${esc(ex.n)}</b><small>${esc(muscleLine(ex))}</small></span></button>
      <button class="icon-btn" data-act="exMenu" data-x="${i}" aria-label="Options">${icon('more', 22)}</button>
    </div>
    ${ss || x.target ? `<div class="exo-target">${ss}${x.target ? `<span>${x.target.sets} × ${targetLabel(x.target.reps)}${x.target.rpe ? ` · ${esc(x.target.rpe)}` : ''}</span>` : ''}</div>` : ''}
    ${x.hint ? `<div class="hint ${x.up ? 'up' : ''}">${x.up ? icon('up', 14) : icon('info', 14)}<span>${esc(x.hint)}</span></div>` : ''}
    <input class="exo-note" data-x="${i}" placeholder="Ajouter une note…" value="${esc(x.note)}">
    <div class="exo-tools">
      <button class="chip-btn" data-act="exRest" data-x="${i}">${icon('timer', 16)} ${x.rest ? fmtRest(x.rest) : 'Pas de repos'}</button>
      ${sp?.kind === 'time' || ex.lt === 'time' ? `<button class="chip-btn" data-act="exChrono" data-x="${i}">${icon('play', 14)} Chrono ${sp?.sec || 30} s</button>` : ''}
    </div>
    <div class="sets c${cols.length}">
      <div class="sh"><span>SÉRIE</span><span>PRÉCÉDENT</span>${cols.map(([, l]) => `<span>${l()}</span>`).join('')}<span>${icon('check', 14)}</span></div>
      ${rows}
    </div>
    <button class="add-set" data-act="addSet" data-x="${i}">${icon('plus', 16)} Ajouter une série</button>
  </section>`;
}

// Mise à jour légère (sans re-rendu)
export function tickWorkout() {
  const w = W(); if (!w) return;
  const t = fmtClock((nowTs() - w.start) / 1000);
  const a = $('#wkClock'), b = $('#wkDur'), c = $('#miniClock');
  if (a) a.textContent = t; if (b) b.textContent = t; if (c) c.textContent = t;
}
function refreshStats() {
  const w = W();
  const v = $('#wkVol'), s = $('#wkSets');
  if (v) v.textContent = volText(w); if (s) s.textContent = setsText(w);
}
function rerender() { const y = window.scrollY; R.render(); window.scrollTo(0, y); }
const rowOf = el => { const r = el.closest('.srow'); return { r, x: +r.dataset.x, s: +r.dataset.s }; };

// ---------- Saisie ----------
INP.setIn = el => {
  const { x, s } = rowOf(el), set = W().ex[x].sets[s], f = el.dataset.f;
  const v = el.value.replace(',', '.').trim();
  set[f] = v === '' || isNaN(+v) ? '' : f === 'w' ? fromDisp(+v) : +v;
  save();
  if (set.done) refreshStats();
};
INP.exNote = el => { W().ex[+el.dataset.x].note = el.value; save(); };

ACT.ck = el => {
  const { r, x, s } = rowOf(el), w = W(), exo = w.ex[x], set = exo.sets[s], ex = exOf(exo.id);
  if (set.done) { set.done = false; save(); r.classList.remove('done'); el.classList.remove('on'); refreshStats(); return; }
  for (const [f] of COLS[ex.lt] || COLS.wr) {
    if (set[f] === '' || set[f] == null) {
      const p = set['p' + f];
      if (p === '' || p == null) {
        if (f === 'w' && ex.lt === 'bw') { set.w = 0; continue; }
        r.querySelector(`[data-f="${f}"]`)?.focus();
        return toast(f === 'w' ? 'Entre la charge' : f === 'r' ? 'Entre le nombre de reps' : 'Entre une valeur');
      }
      set[f] = p;
      const inp = r.querySelector(`[data-f="${f}"]`); if (inp) inp.value = inVal(set, f);
    }
  }
  set.done = true; save();
  r.classList.add('done'); el.classList.add('on'); refreshStats();
  navigator.vibrate?.(15);
  const next = nextUp(x, s);
  if (exo.rest && next !== null) startTimer(exo.rest, next);
  else if (next === null) { stopTimer(); toast('Toutes les séries sont faites. Termine la séance !'); }
};
// Prochaine série à faire (gère les supersets)
function nextUp(x, s) {
  const w = W(), exo = w.ex[x];
  const label = (xi, si) => `${exOf(w.ex[xi].id).n} · série ${si + 1}`;
  if (exo.ss) {
    const grp = w.ex.map((e, i) => ({ e, i })).filter(o => o.e.ss === exo.ss);
    const pos = grp.findIndex(o => o.i === x);
    for (let k = 1; k <= grp.length; k++) {
      const o = grp[(pos + k) % grp.length];
      const si = o.e.sets.findIndex(st => !st.done);
      if (si >= 0) return label(o.i, si);
    }
  }
  const si = exo.sets.findIndex(st => !st.done);
  if (si >= 0) return label(x, si);
  for (let i = 0; i < w.ex.length; i++) {
    const j = w.ex[i].sets.findIndex(st => !st.done);
    if (j >= 0) return label(i, j);
  }
  return null;
}

ACT.stype = el => {
  const { x, s } = rowOf(el);
  stype.cur = { x, s };
  const k = W().ex[x].sets[s].k;
  menuSheet('Type de série', [
    ...Object.entries(TYPE).map(([kk, t]) => ({ icon: kk === k ? 'check' : 'right', label: `${t.l ? t.l + ' · ' : ''}${t.n}`, act: 'stypeSet', data: { k: kk } })),
    { icon: 'trash', label: 'Supprimer la série', act: 'setDel', danger: true }]);
};
const stype = {};
ACT.stypeSet = el => { const { x, s } = stype.cur; W().ex[x].sets[s].k = el.dataset.k; save(); closeSheet(); rerender(); };
ACT.setDel = () => {
  const { x, s } = stype.cur, exo = W().ex[x];
  exo.sets.splice(s, 1); save(); closeSheet(); rerender();
};
ACT.addSet = el => { const exo = W().ex[+el.dataset.x]; exo.sets.push(newSet(exo)); save(); rerender(); };

ACT.mobCk = el => {
  const list = W()[el.dataset.list], m = list[+el.dataset.i];
  m.done = !m.done; save();
  el.classList.toggle('on', m.done); el.closest('.mrow').classList.toggle('done', m.done);
  el.closest('details').querySelector('summary .muted').textContent = `${list.filter(x => x.done).length}/${list.length}`;
};
ACT.exInfo = el => exSheet(el.dataset.id);

ACT.exMenu = el => {
  const x = +el.dataset.x, n = W().ex.length;
  exMenuCur = x;
  menuSheet(exOf(W().ex[x].id).n, [
    { icon: 'info', label: 'Instructions', act: 'exInfo', data: { id: W().ex[x].id } },
    { icon: 'swap', label: 'Remplacer l’exercice', act: 'exReplace' },
    ...(x > 0 ? [{ icon: 'up', label: 'Monter', act: 'exMove', data: { d: -1 } }] : []),
    ...(x < n - 1 ? [{ icon: 'dn', label: 'Descendre', act: 'exMove', data: { d: 1 } }] : []),
    { icon: 'trash', label: 'Retirer de la séance', act: 'exDel', danger: true }]);
};
let exMenuCur = 0;
ACT.exMove = el => {
  const ex = W().ex, x = exMenuCur, y = x + +el.dataset.d;
  [ex[x], ex[y]] = [ex[y], ex[x]]; save(); closeSheet(); rerender();
};
ACT.exDel = () => { W().ex.splice(exMenuCur, 1); save(); closeSheet(); rerender(); };
ACT.exReplace = () => {
  const x = exMenuCur;
  openPicker({ multi: false, title: 'Remplacer par…', onPick: ([id]) => {
    const old = W().ex[x];
    const nx = makeExercise({ id, sets: old.sets.length, rest: old.rest, ss: old.ss, reps: old.target?.reps || '', rpe: old.target?.rpe });
    nx.target = old.target; W().ex[x] = nx; save(); rerender();
  } });
};
ACT.exRest = el => {
  exMenuCur = +el.dataset.x;
  const cur = W().ex[exMenuCur].rest;
  menuSheet('Temps de repos', [0, 30, 45, 60, 75, 90, 120, 150, 180, 240].map(s =>
    ({ icon: s === cur ? 'check' : 'timer', label: s ? fmtRest(s) : 'Désactivé', act: 'exRestSet', data: { s } })));
};
ACT.exRestSet = el => { W().ex[exMenuCur].rest = +el.dataset.s; save(); closeSheet(); rerender(); };
ACT.exChrono = el => {
  const x = W().ex[+el.dataset.x], sp = x.target ? parseReps(x.target.reps) : null;
  beep(880, 0.15); startTimer(sp?.sec || 30, exOf(x.id).n, 'work');
};
ACT.wkAddEx = () => openPicker({ multi: true, title: 'Ajouter des exercices', onPick: ids => {
  for (const id of ids) W().ex.push(makeExercise({ id, rest: 90 }));
  save(); rerender();
  setTimeout(() => document.querySelector('.exo:last-of-type')?.scrollIntoView({ block: 'center' }), 50);
} });
ACT.wkMin = () => { location.hash = '#/'; };
ACT.wkRename = () => {
  openSheet(`<div class="sheet-body"><h3 class="sheet-title">Nom de la séance</h3>
    <input class="field" id="wkName" value="${esc(W().name)}" maxlength="60">
    <button class="btn primary block" data-act="wkRenameOk">Enregistrer</button></div>`);
  setTimeout(() => $('#wkName')?.select(), 250);
};
ACT.wkRenameOk = () => { const v = $('#wkName').value.trim(); if (v) { W().name = v; save(); } closeSheet(); rerender(); };
ACT.wkDiscard = () => confirmSheet({ title: 'Abandonner la séance ?', text: 'Les séries notées seront perdues.', ok: 'Abandonner', danger: true,
  onOk: () => { db.active = null; save(); stopTimer(); wake(false); location.hash = '#/'; } });

ACT.wkFinish = () => {
  const w = W();
  const done = w.ex.reduce((a, x) => a + doneSets(x).length, 0);
  const left = w.ex.reduce((a, x) => a + x.sets.filter(s => !s.done).length, 0);
  if (!done) return confirmSheet({ title: 'Aucune série validée', text: 'Valide au moins une série avec ✓, ou abandonne la séance.', ok: 'Continuer la séance', cancel: 'Fermer', onOk: () => {} });
  if (left) return confirmSheet({ title: 'Terminer la séance ?', text: `${left} série${left > 1 ? 's' : ''} non validée${left > 1 ? 's seront ignorées' : ' sera ignorée'}.`, ok: 'Terminer', onOk: finish });
  finish();
};
function finish() {
  const w = W();
  w.end = nowTs();
  w.ex = w.ex.map(x => ({ ...x, sets: x.sets.filter(s => s.done).map(({ pw, pr, pv, prev, ...s }) => s) })).filter(x => x.sets.length);
  w.warm = w.warm?.filter(m => m.done).map(m => m.id);
  w.cool = w.cool?.filter(m => m.done).map(m => m.id);
  w.prs = computePRs(w);
  db.workouts[w.id] = w;
  if (w.kind === 'program') (db.habits[w.date] ||= {}).mob = true;
  db.profile.since ||= w.date;
  db.active = null; save();
  stopTimer(); wake(false);
  beep(660, 0.12); setTimeout(() => beep(880, 0.12), 130); setTimeout(() => beep(1320, 0.3), 260);
  location.hash = '#/bravo/' + w.id;
}

// Événements d'entrée (délégués depuis app.js)
export function onInput(el) {
  if (el.matches('.srow .in')) INP.setIn(el);
  else if (el.matches('.exo-note')) INP.exNote(el);
}

// ---------- Sélecteur d'exercices ----------
let picker = null;
export function openPicker({ multi = true, title = 'Exercices', onPick }) {
  picker = { multi, onPick, sel: [], q: '', g: '' };
  openSheet(`<div class="sheet-body picker">
    <div class="row between"><h3 class="sheet-title">${title}</h3><button class="link" data-act="customNew">${icon('plus', 16)} Créer</button></div>
    <label class="search">${icon('search', 18)}<input id="pkQ" placeholder="Rechercher un exercice" autocomplete="off"></label>
    <div class="chips scroll-x">${['', ...GROUPS.map(g => g.k)].map(k => `<button class="chip ${k === '' ? 'on' : ''}" data-act="pkG" data-g="${k}">${k ? GROUPS.find(g => g.k === k).n : 'Tous'}</button>`).join('')}</div>
    <div class="pk-list" id="pkList">${pickerList()}</div>
    ${multi ? `<div class="pk-foot"><button class="btn primary block" data-act="pkDone" id="pkBtn" disabled>Ajouter</button></div>` : ''}
  </div>`, { cls: 'tall full' });
}
export function filterEx(q, g) {
  const G = GROUPS.find(x => x.k === g);
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nq = norm(q || '');
  return Object.entries(allEx()).filter(([, ex]) => {
    if (ex.hide) return false;
    if (G?.cat && !G.cat.includes(ex.cat)) return false;
    if (G?.mu && (ex.cat === 'mob' || !ex.mu.some(m => G.mu.includes(m)))) return false;
    if (!G && ex.cat === 'mob' && !nq) return false;
    return !nq || norm(ex.n + ' ' + muscleLine(ex) + ' ' + (EQUIP[ex.eq] || '')).includes(nq);
  }).sort((a, b) => a[1].n.localeCompare(b[1].n, 'fr'));
}
function pickerList() {
  const list = filterEx(picker.q, picker.g);
  if (!list.length) return `<p class="muted center pad">Aucun résultat. <button class="link" data-act="customNew">Créer « ${esc(picker.q)} »</button></p>`;
  return list.map(([id, ex]) => `<button class="pk-item ${picker.sel.includes(id) ? 'on' : ''}" data-act="pkItem" data-id="${esc(id)}">
    ${thumb(id, 42)}<span class="grow"><b>${esc(ex.n)}</b><small>${esc(muscleLine(ex))} · ${EQUIP[ex.eq] || ''}</small></span>
    <span class="pk-ck">${icon('check', 16)}</span></button>`).join('');
}
export function pickerInput(el) {
  if (el.id !== 'pkQ' || !picker) return false;
  picker.q = el.value; $('#pkList').innerHTML = pickerList(); return true;
}
ACT.pkG = el => {
  picker.g = el.dataset.g;
  el.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el));
  $('#pkList').innerHTML = pickerList(); $('#pkList').scrollTop = 0;
};
ACT.pkItem = el => {
  const id = el.dataset.id;
  if (!picker.multi) { const f = picker.onPick; closeSheet(); return f([id]); }
  const i = picker.sel.indexOf(id);
  if (i >= 0) picker.sel.splice(i, 1); else picker.sel.push(id);
  el.classList.toggle('on', i < 0);
  const b = $('#pkBtn'); b.disabled = !picker.sel.length;
  b.textContent = picker.sel.length ? `Ajouter ${picker.sel.length} exercice${picker.sel.length > 1 ? 's' : ''}` : 'Ajouter';
};
ACT.pkDone = () => { const { sel, onPick } = picker; closeSheet(); onPick(sel); };

// Exercice personnalisé
ACT.customNew = () => {
  const keep = picker;
  const q = keep?.q || '';
  openSheet(`<div class="sheet-body"><h3 class="sheet-title">Nouvel exercice</h3>
    <label class="lbl">Nom<input class="field" id="cxN" value="${esc(q)}" maxlength="50"></label>
    <label class="lbl">Muscle principal<select class="field" id="cxM">${Object.entries(MUSCLES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <label class="lbl">Équipement<select class="field" id="cxE">${Object.entries(EQUIP).filter(([k]) => k !== 'mob').map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <label class="lbl">Saisie<select class="field" id="cxT">
      <option value="wr">Charge et reps</option><option value="r">Reps seulement</option><option value="bw">Poids du corps + lest</option>
      <option value="time">Durée</option><option value="dist">Distance</option></select></label>
    <button class="btn primary block" data-act="customSave">Créer</button></div>`);
  ACT.customSave = () => {
    const n = $('#cxN').value.trim();
    if (!n) return toast('Donne un nom à l’exercice');
    const id = 'c_' + uid();
    db.custom[id] = { n, img: null, eq: $('#cxE').value, mu: [$('#cxM').value], mu2: [], lt: $('#cxT').value, cues: [], yt: n, cat: 'force', custom: true };
    save(); closeSheet(true);
    toast('Exercice créé');
    if (keep) keep.onPick([id]); else R.render();
  };
};
