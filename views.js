// Écrans principaux
import { db, save, exOf, unit, toDisp, fromDisp, roundDisp, bodyUnit, bToDisp, bFromDisp, volTxt, GOALS } from './store.js';
import { GROUPS, EQUIP } from './exercises.js';
import { PROGRAM, PHASES, CYCLE_START, ROUTINES, MOBILITY, PRINCIPLES, TESTS, buildSession, ctxOf, testMondays } from './program.js';
import {
  finished, doneSets, weekStatus, streak, weights, avg7, eta, workoutVolume, workoutSets, exBests, e1rm,
  muscleSplit, weeklySeries, PR_LABEL, prText, startProgram, startRoutine, startEmpty, startCopy, setText, dayPlan, phaseInfo, makeExercise, targetLabel,
} from './core.js';
import { ACT, R, $, toast, openSheet, closeSheet, confirmSheet, thumb, muscleLine, howTo, media, exSheet, lineChart, barChart, ring, progressBar, ts } from './ui.js';
import { filterEx, openPicker } from './workout.js';
import { wake } from './timer.js';
import {
  icon, esc, num, today, addDays, mondayOf, diffDays, parse, ymd, fmtDay, fmtShort, fmtMonth, fmtDur, cap,
  DOW, DOW1, DOW_LONG, uid, fmtRest,
} from './util.js';

const P = () => db.profile;
const U = () => unit();
const BU = () => bodyUnit();
const kgTxt = (kg, d = 1) => `${num(toDisp(kg), d)} ${U()}`;
const back = (href = '#/') => `<a class="icon-btn back" href="${href}" data-act="goBack" aria-label="Retour">${icon('back', 24)}</a>`;

// ---------- Démarrer une séance ----------
function begin(make) {
  const go = () => { db.active = make(); save(); wake(true); location.hash = '#/seance'; };
  if (db.active) confirmSheet({ title: 'Une séance est déjà en cours', text: `« ${esc(db.active.name)} » sera abandonnée.`, ok: 'Abandonner et commencer', danger: true, onOk: go });
  else go();
}
ACT.startProg = el => begin(() => startProgram(el.dataset.type));
ACT.startEmpty = () => begin(startEmpty);
ACT.startRoutine = el => begin(() => startRoutine(db.routines[el.dataset.id]));
ACT.startCopy = el => begin(() => startCopy(db.workouts[el.dataset.id]));
ACT.resume = () => { location.hash = '#/seance'; };

// ---------- Cartes communes ----------
function workoutCard(w) {
  const prs = w.prs?.length || 0;
  const list = w.ex.slice(0, 4).map(x => `<li>${thumb(x.id, 26)}<span>${doneSets(x).length} × ${esc(exOf(x.id).n)}</span></li>`).join('');
  return `<a class="card wcard" href="#/w/${w.id}">
    <div class="row between"><b class="wname">${esc(w.name)}</b><span class="muted small">${cap(fmtShort(w.date))}</span></div>
    <div class="wstats"><span>${icon('clock', 15)}${fmtDur(w.end - w.start)}</span><span>${icon('dumbbell', 15)}${kgTxt(workoutVolume(w), 0)}</span>${prs ? `<span class="pr">${icon('trophy', 15)}${prs} record${prs > 1 ? 's' : ''}</span>` : ''}</div>
    <ul class="wlist">${list}</ul>${w.ex.length > 4 ? `<div class="muted small">+ ${w.ex.length - 4} autre${w.ex.length > 5 ? 's' : ''}</div>` : ''}</a>`;
}
const routinePreview = items => items.filter(it => exOf(it.id).cat !== 'mob').map(it => exOf(it.id).n).join(' · ');
function thumbsRow(items, max = 5) {
  return `<div class="thumbs">${items.slice(0, max).map(it => thumb(it.id, 34)).join('')}${items.length > max ? `<span class="thumb more" style="--s:34px">+${items.length - max}</span>` : ''}</div>`;
}

// ---------- Accueil ----------
export function home() {
  const t = today(), p = dayPlan(t, P()), info = p.info;
  const wk = weekStatus(mondayOf(t));
  const doneToday = finished().filter(w => w.date === t);
  const ws = weights(), cur = avg7(t, ws) ?? ws.at(-1)?.v ?? null, e = eta(ws), prof = P();
  const name = prof.name ? `, ${esc(prof.name)}` : '';
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  // Carte du jour
  let todayCard;
  const progDone = doneToday.find(w => w.kind === 'program');
  if (p.gym && !progDone) {
    const S = buildSession(p.gym, ctxOf(info));
    const activeHere = db.active?.kind === 'program' && db.active.date === t;
    todayCard = `<div class="eyebrow">${icon('cal', 14)} Aujourd’hui${p.optional ? ' · optionnel' : ''}</div>
      <h2 class="today-title">${S.name}</h2>
      <div class="meta">${S.items.length} exercices · ~${S.min} min${info.deload && !info.light ? ' · semaine allégée' : ''}</div>
      ${thumbsRow(S.items)}
      ${activeHere ? `<button class="btn primary block" data-act="resume">${icon('play', 18)} Reprendre la séance</button>`
        : `<button class="btn primary block" data-act="startProg" data-type="${p.gym}">${icon('play', 18)} Commencer</button>`}`;
  } else if (progDone || doneToday.length) {
    const w = progDone || doneToday[0];
    todayCard = `<div class="eyebrow ok">${icon('check', 14)} Séance faite</div>
      <h2 class="today-title">${esc(w.name)}</h2>
      <div class="meta">${fmtDur(w.end - w.start)} · ${kgTxt(workoutVolume(w), 0)}${w.prs?.length ? ` · ${w.prs.length} record${w.prs.length > 1 ? 's' : ''}` : ''}</div>
      <a class="btn soft block" href="#/w/${w.id}">Voir la séance</a>`;
  } else {
    const recup = info.key === 'recup';
    const next = nextSession(t);
    todayCard = `<div class="eyebrow">${icon('cal', 14)} Aujourd’hui</div>
      <h2 class="today-title">${recup ? 'Récupération' : 'Jour de repos'}</h2>
      <div class="meta">${recup ? 'Marche 20–40 min et mobilité douce.' : 'Marche et mobilité : ton corps se construit au repos.'}${next ? ` Prochaine séance : ${DOW_LONG[parse(next.d).getDay()]}.` : ''}</div>
      <a class="btn soft block" href="#/mobilite">${icon('stretch', 18)} Mobilité guidée · ${mobMinutes()} min</a>`;
  }
  const run = p.run ? `<div class="run-row ${db.runs[t] ? 'done' : ''}">
      <span class="run-ic">${icon('run', 18)}</span><div class="grow"><b>Course facile${p.run === 'option' ? ' (optionnelle)' : ''}</b><small>30–40 min à allure de conversation, ou basket/soccer</small></div>
      <button class="ck ${db.runs[t] ? 'on' : ''}" data-act="runCk">${icon('check', 18)}</button></div>` : '';

  // Semaine
  const days = wk.days.map(x => {
    const done = x.done.length > 0, planned = !!x.p.gym;
    const cls = [done ? 'done' : planned ? (x.p.optional ? 'opt' : 'plan') : '', x.d === t ? 'today' : '', !done && planned && !x.p.optional && x.d < t ? 'miss' : ''].join(' ');
    return `<button class="wd ${cls}" data-act="dayPrev" data-d="${x.d}" aria-label="${esc(fmtDay(x.d))}"><span>${DOW1[parse(x.d).getDay()]}</span><i>${done ? icon('check', 14) : parse(x.d).getDate()}</i></button>`;
  }).join('');
  const weekVol = finished().filter(w => w.date >= mondayOf(t)).reduce((a, w) => a + workoutVolume(w), 0);

  // Poids
  const lost = cur != null ? prof.startWeight - cur : 0;
  const pct = cur != null ? lost / (prof.startWeight - prof.targetWeight) : 0;
  const recent = ws.filter(x => x.d >= addDays(t, -42));
  const etaTxt = e?.done ? 'Objectif atteint' : e?.date ? `Objectif prévu le ${fmtShort(e.date)}` : 'Estimation après ~10 jours de pesées';
  const weighed = db.body[t]?.weight;

  // Habitudes
  const h = db.habits[t] || {};
  const habits = prof.habits.map(hb => `<button class="habit ${h[hb.k] ? 'on' : ''}" data-act="habit" data-k="${hb.k}"><span class="ck sm ${h[hb.k] ? 'on' : ''}">${icon('check', 14)}</span>${esc(hb.n)}</button>`).join('');
  const recentW = finished().reverse().slice(0, 3);

  return `
  <header class="top">
    <div><div class="eyebrow">${cap(fmtDay(t))}</div><h1>${hello}${name}</h1></div>
    <a class="avatar" href="#/profil">${esc((prof.name || '?')[0].toUpperCase())}</a>
  </header>
  <section class="card hero">${todayCard}${run}</section>
  <section class="card">
    <div class="row between"><h3>Cette semaine</h3><span class="muted small">${wk.doneN}/${wk.planned} séances</span></div>
    <div class="week">${days}</div>
  </section>
  <div class="stats3">
    <div class="stat"><span class="stat-ic fire">${icon('flame', 18)}</span><b>${streak()}</b><span>semaine${streak() > 1 ? 's' : ''} parfaite${streak() > 1 ? 's' : ''} d’affilée</span></div>
    <div class="stat"><span class="stat-ic">${icon('dumbbell', 18)}</span><b>${finished().length}</b><span>séance${finished().length > 1 ? 's' : ''} au total</span></div>
    <div class="stat"><span class="stat-ic">${icon('chart', 18)}</span><b>${volTxt(weekVol)}</b><span>soulevées cette semaine</span></div>
  </div>
  <section class="card">
    <div class="row between"><h3>Poids</h3><button class="btn soft sm" data-act="weighIn">${weighed ? icon('check', 16) + ' ' + num(bToDisp(weighed), 1) : icon('plus', 16) + ' Pesée'}</button></div>
    <div class="weight-row">
      <div><div class="big-num">${cur != null ? num(bToDisp(cur), 1) : '—'}<small> ${BU()}</small></div>
        <div class="muted small">${avg7(t, ws) != null ? 'moyenne sur 7 jours' : 'dernière pesée'}${cur != null && Math.abs(lost) >= 0.05 ? ` · <span class="${lost > 0 ? 'good' : ''}">${lost > 0 ? '−' : '+'}${num(bToDisp(Math.abs(lost)), 1)} ${BU()}</span>` : ''}</div></div>
      ${ring(pct, 62, 7, `<b>${Math.max(0, Math.round(pct * 100))}%</b>`)}
    </div>
    ${recent.length >= 2 ? lineChart([{ pts: recent.map(x => ({ t: ts(x.d), v: bToDisp(avg7(x.d, ws)) })), cls: 'avg', area: true }], { h: 110, target: bToDisp(prof.targetWeight) }) : ''}
    <div class="muted small row gap6">${icon('target', 14)}<span>${num(bToDisp(prof.targetWeight), 1)} ${BU()} · ${etaTxt}</span></div>
  </section>
  <section class="card"><h3>Habitudes du jour</h3><div class="habits">${habits}</div></section>
  ${recentW.length ? `<section><div class="row between sec-h"><h3>Dernières séances</h3><a class="link" href="#/historique">Tout voir</a></div>${recentW.map(workoutCard).join('')}</section>` : ''}`;
}
function nextSession(t) {
  for (let i = 1; i <= 7; i++) { const d = addDays(t, i), p = dayPlan(d, P()); if (p.gym) return { d, p }; }
  return null;
}
// Aperçu d'un jour de la semaine (touche un jour dans « Cette semaine »)
ACT.dayPrev = el => {
  const d = el.dataset.d, t = today(), p = dayPlan(d, P()), info = p.info;
  const done = finished().filter(w => w.date === d);
  const when = d === t ? 'Aujourd’hui' : d === addDays(t, 1) ? 'Demain' : d === addDays(t, -1) ? 'Hier' : '';
  let body = '';
  if (done.length) body += done.map(w => `<a class="li" href="#/w/${w.id}" data-act="sheetClose">
      <span class="ck sm on">${icon('check', 14)}</span><span class="grow"><b>${esc(w.name)}</b><small>${fmtDur(w.end - w.start)} · ${workoutSets(w)} séries${w.prs?.length ? ` · ${w.prs.length} record${w.prs.length > 1 ? 's' : ''}` : ''}</small></span>${icon('right', 18, 'muted')}</a>`).join('');
  const progDone = done.some(w => w.kind === 'program');
  if (p.gym && !progDone) {
    const ctx = ctxOf(info), S = buildSession(p.gym, ctx);
    const rows = S.items.map(it => {
      const ex = exOf(it.id), x = makeExercise(it, { deload: ctx.deload }), w = x.sets[0]?.pw;
      const load = (ex.lt === 'wr' || ex.lt === 'wd') && w !== '' && w != null ? ` · ${num(roundDisp(toDisp(+w)), 1)} ${U()}`
        : ex.lt === 'bw' && +w > 0 ? ` · +${num(roundDisp(toDisp(+w)), 1)} ${U()}` : '';
      return `<button class="li" data-act="exInfo" data-id="${esc(it.id)}">${thumb(it.id, 40)}<span class="grow"><b>${esc(ex.n)}</b>
        <small>${x.target ? `${x.target.sets} × ${targetLabel(x.target.reps)}` : ''}${load}${it.rpe ? ` · ${esc(it.rpe)}` : ''}</small></span>
        ${it.ss ? `<span class="badge">${it.ss}</span>` : ''}</button>`;
    }).join('');
    const missed = d < t;
    body += `<div class="muted small">${info.name}${info.weeks > 1 ? ` · semaine ${info.week}` : ''}${ctx.deload ? ' · allégée' : ''}${p.optional ? ' · optionnelle' : ''} · ~${S.min} min${missed ? ' · <span class="bad">non faite</span>' : ''}</div>
      <h4 class="prev-h">${esc(S.name)}</h4>
      <div class="muted small">Échauffement : ${S.warm.length} exercices, ~8 min</div>
      <div class="list flush">${rows}</div>
      <div class="muted small">Retour au calme : ${S.cool.map(c => esc(exOf(c.id).n)).join(', ')}</div>
      ${d === t ? `<button class="btn primary block" data-act="startProg" data-type="${p.gym}">${icon('play', 18)} Commencer</button>` : ''}`;
  }
  if (p.run) body += `<div class="li"><span class="run-ic">${icon('run', 18)}</span><span class="grow"><b>Course facile${p.run === 'option' ? ' (optionnelle)' : ''}</b><small>30–40 min à allure de conversation${db.runs[d] ? ' · faite' : ''}</small></span></div>`;
  if (!p.gym && !done.length) body += `<p class="muted">${info.key === 'recup' ? 'Récupération : marche 20–40 min et mobilité douce.' : 'Repos. Marche, et la routine Souplesse si tu as 10 minutes.'}</p>
      <a class="btn soft block" href="#/mobilite" data-act="sheetClose">${icon('stretch', 18)} ${MOBILITY.name} · ${mobMinutes()} min</a>`;
  openSheet(`<div class="sheet-body day-prev"><div class="eyebrow">${when || cap(DOW_LONG[parse(d).getDay()])}</div>
    <h3 class="sheet-title">${cap(fmtDay(d))}</h3>${body}</div>`, { cls: 'tall' });
};
const mobMinutes = () => Math.round(MOBILITY.steps.reduce((s, h) => s + (h.hold + 5) * (h.sides ? 2 : 1), 0) / 60);

ACT.habit = el => { const t = today(), h = (db.habits[t] ||= {}); h[el.dataset.k] = !h[el.dataset.k]; save(); R.render(); };
ACT.runCk = () => { const t = today(); if (db.runs[t]) delete db.runs[t]; else db.runs[t] = true; save(); R.render(); };
ACT.weighIn = () => {
  const t = today(), cur = db.body[t]?.weight ?? weights().at(-1)?.v;
  openSheet(`<div class="sheet-body center"><h3 class="sheet-title">Pesée du ${fmtShort(t)}</h3>
    <p class="muted small">Le matin, à jeun, après la toilette. Seule la moyenne compte.</p>
    <div class="big-input"><input id="wIn" type="number" inputmode="decimal" step="0.1" value="${db.body[t]?.weight ? num(bToDisp(cur), 1).replace(',', '.') : ''}" placeholder="${cur ? num(bToDisp(cur), 1).replace(',', '.') : ''}"><span>${BU()}</span></div>
    <button class="btn primary block" data-act="weighSave">Enregistrer</button></div>`);
  setTimeout(() => $('#wIn')?.focus(), 250);
};
ACT.weighSave = () => {
  const v = parseFloat($('#wIn').value.replace(',', '.'));
  if (!(v > 20 && v < 500)) return toast('Entre un poids valide');
  const t = today(); (db.body[t] ||= {}).weight = bFromDisp(v); save(); closeSheet(); toast('Pesée enregistrée'); R.render();
};

// ---------- Entraînement ----------
export function train() {
  const t = today(), p = dayPlan(t, P()), info = p.info;
  const ctx = ctxOf(info);
  const types = info.key === 'recup' ? ['R', 'L'] : info.light ? ['L', 'A', 'B', 'C'] : ['A', 'B', 'C', 'L'];
  const nextDay = type => { for (let i = 0; i < 7; i++) { const d = addDays(t, i); if (dayPlan(d, P()).gym === type) return i === 0 ? 'Aujourd’hui' : i === 1 ? 'Demain' : cap(DOW_LONG[parse(d).getDay()]); } return ''; };
  const routineCards = types.map(type => {
    const S = buildSession(type, ctx), when = nextDay(type);
    return `<div class="card rcard">
      <div class="row between"><b>${S.name}</b>${when ? `<span class="badge ${when === 'Aujourd’hui' ? 'ac' : ''}">${when}</span>` : ''}</div>
      <p class="muted small clamp2">${esc(routinePreview(S.items))}</p>
      <div class="row between">${thumbsRow(S.items, 4)}<button class="btn soft sm" data-act="startProg" data-type="${type}">Commencer</button></div></div>`;
  }).join('');
  const progPct = programPct(t);
  const mine = Object.values(db.routines).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return `
  <header class="top"><h1>Entraînement</h1></header>
  ${db.active ? `<button class="btn primary block" data-act="resume">${icon('play', 18)} Reprendre « ${esc(db.active.name)} »</button>`
    : `<button class="btn primary block" data-act="startEmpty">${icon('plus', 18)} Séance libre</button>`}
  <div class="row between sec-h"><h3>Mon programme</h3><a class="link" href="#/programme">Détails</a></div>
  <a class="card prog" href="#/programme">
    <div class="row between"><div><b>${PROGRAM.name}</b><div class="muted small">${info.name}${info.weeks > 1 ? ` · semaine ${info.week} sur ${info.weeks}` : ''}${info.light ? ' · semaine allégée' : ''}</div></div>${icon('right', 20, 'muted')}</div>
    ${progressBar(progPct * 100)}
  </a>
  ${routineCards}
  <div class="row between sec-h"><h3>Mobilité</h3></div>
  <a class="card rcard" href="#/mobilite">
    <div class="row between"><b>${MOBILITY.name}</b><span class="badge">${mobMinutes()} min</span></div>
    <p class="muted small">${MOBILITY.desc}</p>${thumbsRow(MOBILITY.steps.map(s => ({ id: s.id })), 6)}</a>
  <div class="row between sec-h"><h3>Mes routines</h3><a class="link" href="#/routine/new">${icon('plus', 16)} Nouvelle</a></div>
  ${mine.length ? mine.map(r => `<div class="card rcard">
      <div class="row between"><b>${esc(r.name)}</b><a class="icon-btn" href="#/routine/${r.id}" aria-label="Modifier">${icon('edit', 18)}</a></div>
      <p class="muted small clamp2">${esc(routinePreview(r.items)) || 'Aucun exercice'}</p>
      <div class="row between">${thumbsRow(r.items, 4)}<button class="btn soft sm" data-act="startRoutine" data-id="${r.id}" ${r.items.length ? '' : 'disabled'}>Commencer</button></div></div>`).join('')
    : `<a class="card empty-card" href="#/routine/new">${icon('plus', 20)}<span>Crée ta propre routine : choisis les exercices, les séries et les repos.</span></a>`}`;
}
function programPct(t) {
  const s = PHASES[0].start, e = addDays(CYCLE_START, -1);
  return Math.max(0, Math.min(1, diffDays(s, t) / diffDays(s, e)));
}

// ---------- Routine (création / édition) ----------
let draft = null;
export function routineEdit(id) {
  if (!draft || draft._for !== id) {
    const src = id !== 'new' && db.routines[id];
    draft = src ? structuredClone(src) : { id: uid(), name: '', items: [] };
    draft._for = id;
  }
  const items = draft.items.map((it, i) => `<div class="card redit">
      <div class="row between"><button class="exo-name" data-act="exInfo" data-id="${esc(it.id)}">${thumb(it.id, 38)}<span><b>${esc(exOf(it.id).n)}</b><small>${esc(muscleLine(exOf(it.id)))}</small></span></button>
        <button class="icon-btn" data-act="rDel" data-i="${i}" aria-label="Retirer">${icon('x', 18)}</button></div>
      <div class="redit-row">
        <div class="stepper"><button data-act="rSets" data-i="${i}" data-d="-1">−</button><span><b>${it.sets}</b> séries</span><button data-act="rSets" data-i="${i}" data-d="1">+</button></div>
        <input class="field sm" data-r="${i}" value="${esc(it.reps || '')}" placeholder="reps (ex. 8-12)">
        <select class="field sm" data-rest="${i}">${[0, 30, 45, 60, 75, 90, 120, 150, 180, 240].map(s => `<option value="${s}" ${s === it.rest ? 'selected' : ''}>${s ? fmtRest(s) : 'Pas de repos'}</option>`).join('')}</select>
      </div>
      <div class="row gap">${i > 0 ? `<button class="link small" data-act="rMove" data-i="${i}" data-d="-1">${icon('up', 14)} Monter</button>` : ''}${i < draft.items.length - 1 ? `<button class="link small" data-act="rMove" data-i="${i}" data-d="1">${icon('dn', 14)} Descendre</button>` : ''}</div>
    </div>`).join('');
  return `
  <header class="top bar">${back('#/entrainement')}<h1 class="h-sm">${id === 'new' ? 'Nouvelle routine' : 'Modifier la routine'}</h1>
    <button class="btn primary sm" data-act="rSave">Enregistrer</button></header>
  <input class="field title-field" id="rName" value="${esc(draft.name)}" placeholder="Nom de la routine (ex. Haut du corps)" maxlength="50">
  ${items || `<div class="empty-state small">${icon('dumbbell', 32)}<p>Ajoute des exercices pour commencer.</p></div>`}
  <button class="btn soft block" data-act="rAdd">${icon('plus', 18)} Ajouter des exercices</button>
  ${id !== 'new' ? `<button class="btn text-danger block" data-act="rRemove">Supprimer la routine</button>` : ''}`;
}
const keepName = () => { const n = $('#rName'); if (n) draft.name = n.value; };
ACT.rAdd = () => { keepName(); openPicker({ multi: true, title: 'Ajouter des exercices', onPick: ids => { ids.forEach(id => draft.items.push({ id, sets: 3, reps: '', rest: 90 })); R.render(); } }); };
ACT.rDel = el => { keepName(); draft.items.splice(+el.dataset.i, 1); R.render(); };
ACT.rSets = el => { keepName(); const it = draft.items[+el.dataset.i]; it.sets = Math.max(1, Math.min(10, it.sets + +el.dataset.d)); R.render(); };
ACT.rMove = el => { keepName(); const i = +el.dataset.i, j = i + +el.dataset.d; [draft.items[i], draft.items[j]] = [draft.items[j], draft.items[i]]; R.render(); };
ACT.rSave = () => {
  keepName();
  if (!draft.name.trim()) return toast('Donne un nom à la routine');
  const { _for, ...r } = draft; r.name = r.name.trim();
  db.routines[r.id] = r; save(); draft = null; toast('Routine enregistrée'); location.hash = '#/entrainement';
};
ACT.rRemove = () => confirmSheet({ title: 'Supprimer la routine ?', ok: 'Supprimer', danger: true,
  onOk: () => { delete db.routines[draft.id]; save(); draft = null; location.hash = '#/entrainement'; } });
export function routineInput(el) {
  if (!draft) return false;
  if (el.dataset.r != null) { draft.items[+el.dataset.r].reps = el.value.replace(/\s/g, ''); return true; }
  if (el.dataset.rest != null) { draft.items[+el.dataset.rest].rest = +el.value; return true; }
  if (el.id === 'rName') { draft.name = el.value; return true; }
  return false;
}
export const resetDraft = () => { draft = null; };

// ---------- Bibliothèque ----------
const lib = { q: '', g: '' };
export function library() {
  return `
  <header class="top"><h1>Exercices</h1><button class="icon-btn" data-act="customNew" aria-label="Créer">${icon('plus', 24)}</button></header>
  <label class="search">${icon('search', 18)}<input id="libQ" placeholder="Rechercher" value="${esc(lib.q)}" autocomplete="off"></label>
  <div class="chips scroll-x">${['', ...GROUPS.map(g => g.k)].map(k => `<button class="chip ${k === lib.g ? 'on' : ''}" data-act="libG" data-g="${k}">${k ? GROUPS.find(g => g.k === k).n : 'Tous'}</button>`).join('')}</div>
  <div id="libList">${libList()}</div>`;
}
function libList() {
  const list = filterEx(lib.q, lib.g);
  return `<div class="muted small pad-s">${list.length} exercice${list.length > 1 ? 's' : ''}</div><div class="card list">${list.map(([id, ex]) => {
    const b = exBests(id);
    return `<a class="li" href="#/ex/${encodeURIComponent(id)}">${thumb(id, 44)}<span class="grow"><b>${esc(ex.n)}</b><small>${esc(muscleLine(ex))} · ${EQUIP[ex.eq] || ''}</small></span>${b.n ? `<span class="badge">${b.n} séries</span>` : ''}${icon('right', 18, 'muted')}</a>`;
  }).join('')}</div>`;
}
export function libInput(el) { if (el.id !== 'libQ') return false; lib.q = el.value; $('#libList').innerHTML = libList(); return true; }
ACT.libG = el => { lib.g = el.dataset.g; el.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)); $('#libList').innerHTML = libList(); };

// ---------- Fiche exercice ----------
const exTab = { cur: 'sum' };
export function exercisePage(id) {
  id = decodeURIComponent(id || '');
  const ex = exOf(id), lt = ex.lt;
  const hist = finished().filter(w => w.ex.some(x => x.id === id && doneSets(x).length)).reverse();
  const b = exBests(id);
  const tabs = [['sum', 'Résumé'], ['hist', 'Historique'], ['how', 'Technique']];
  let body = '';
  if (exTab.cur === 'sum') {
    const pts = hist.slice().reverse().map(w => {
      const sets = w.ex.filter(x => x.id === id).flatMap(doneSets);
      const v = lt === 'wr' ? Math.max(...sets.map(s => e1rm(+s.w || 0, +s.r || 0))) : lt === 'time' ? Math.max(...sets.map(s => +s.v || 0))
        : lt === 'wd' ? Math.max(...sets.map(s => +s.w || 0)) : Math.max(...sets.map(s => +s.r || 0));
      return { t: ts(w.date), v: lt === 'wr' || lt === 'wd' ? toDisp(v) : v };
    });
    const cards = [];
    if (b.w != null) cards.push(['Charge max', `${num(roundDisp(toDisp(b.w)), 1)} ${U()}`]);
    if (b.rm) cards.push(['1RM estimé', `${num(roundDisp(toDisp(b.rm)), 1)} ${U()}`]);
    if (b.vol) cards.push(['Meilleure série', `${num(toDisp(b.vol), 0)} ${U()}`]);
    if (b.reps) cards.push(['Reps max', b.reps]);
    if (b.time) cards.push(['Temps max', `${b.time} s`]);
    cards.push(['Séances', hist.length]);
    body = `${media(ex)}
      <div class="grid2">${cards.map(([l, v]) => `<div class="mini"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
      <section class="card"><h3>${lt === 'wr' ? '1RM estimé' : lt === 'time' ? 'Meilleur temps' : lt === 'wd' ? 'Charge' : 'Meilleures reps'}</h3>
        ${lineChart([{ pts: pts, cls: 'avg', dots: true, area: true }], { empty: 'Le graphique apparaîtra après deux séances avec cet exercice.' })}</section>`;
  } else if (exTab.cur === 'hist') {
    body = hist.length ? hist.map(w => `<a class="card hrow" href="#/w/${w.id}"><div class="row between"><b>${esc(w.name)}</b><span class="muted small">${cap(fmtShort(w.date))}</span></div>
      <ol class="setlist">${w.ex.filter(x => x.id === id).flatMap(doneSets).map(s => `<li><span class="sn t-${s.k}">${s.k === 'n' ? '' : s.k.toUpperCase()}</span>${setText(s, lt)}${lt === 'wr' && s.r ? `<span class="muted small">1RM ${num(roundDisp(toDisp(e1rm(+s.w, +s.r))), 1)}</span>` : ''}</li>`).join('')}</ol></a>`).join('')
      : `<div class="empty-state small">${icon('note', 32)}<p>Pas encore d’historique.</p></div>`;
  } else body = `<section class="card">${howTo(id)}</section>`;
  return `
  <header class="top bar">${back('#/exercices')}<h1 class="h-sm">${esc(ex.n)}</h1>${ex.custom ? `<button class="icon-btn" data-act="customDel" data-id="${esc(id)}" aria-label="Supprimer">${icon('trash', 20)}</button>` : '<span></span>'}</header>
  <div class="muted small center-left">${esc(muscleLine(ex))} · ${EQUIP[ex.eq] || ''}</div>
  <div class="seg">${tabs.map(([k, l]) => `<button class="${exTab.cur === k ? 'on' : ''}" data-act="exTab" data-k="${k}">${l}</button>`).join('')}</div>
  ${body}`;
}
ACT.exTab = el => { exTab.cur = el.dataset.k; R.render(); };
export const resetExTab = () => { exTab.cur = 'sum'; };
ACT.customDel = el => confirmSheet({ title: 'Supprimer cet exercice ?', text: 'L’historique déjà enregistré est conservé.', ok: 'Supprimer', danger: true,
  onOk: () => { delete db.custom[el.dataset.id]; save(); location.hash = '#/exercices'; } });

// ---------- Fin de séance ----------
export function bravo(id) {
  const w = db.workouts[id];
  if (!w) return home();
  const n = finished().findIndex(x => x.id === id) + 1;
  return `<div class="bravo">
    <div class="bravo-ic">${icon(w.prs?.length ? 'trophy' : 'check', 44)}</div>
    <h1>Bien joué${P().name ? ', ' + esc(P().name) : ''} !</h1>
    <p class="muted">C’est ta ${n}${n === 1 ? 're' : 'e'} séance. ${esc(w.name)}.</p>
    <div class="grid2">
      <div class="mini"><span>Durée</span><b>${fmtDur(w.end - w.start)}</b></div>
      <div class="mini"><span>Volume</span><b>${kgTxt(workoutVolume(w), 0)}</b></div>
      <div class="mini"><span>Séries</span><b>${workoutSets(w)}</b></div>
      <div class="mini"><span>Records</span><b>${w.prs?.length || 0}</b></div>
    </div>
    ${w.prs?.length ? `<section class="card"><h3>Nouveaux records</h3>${w.prs.map(p => `<div class="pr-row">${icon('trophy', 18)}<span class="grow">${esc(exOf(p.id).n)}<small>${PR_LABEL[p.k]}</small></span><b>${prText(p)}</b></div>`).join('')}</section>` : ''}
    <a class="btn primary block" href="#/">Terminer</a>
    <a class="btn ghost block" href="#/w/${w.id}">Voir le détail</a>
  </div>`;
}

// ---------- Détail d'une séance ----------
export function workoutDetail(id) {
  const w = db.workouts[id];
  if (!w) return `<header class="top bar">${back()}<h1 class="h-sm">Séance introuvable</h1><span></span></header>`;
  const prIds = new Set((w.prs || []).map(p => p.id));
  const start = new Date(w.start);
  return `
  <header class="top bar">${back('#/historique')}<h1 class="h-sm">${esc(w.name)}</h1><button class="icon-btn" data-act="wDel" data-id="${w.id}" aria-label="Supprimer">${icon('trash', 20)}</button></header>
  <div class="muted small">${cap(fmtDay(w.date))} · ${start.getHours()} h ${String(start.getMinutes()).padStart(2, '0')}</div>
  <div class="grid4">
    <div class="mini"><span>Durée</span><b>${fmtDur(w.end - w.start)}</b></div>
    <div class="mini"><span>Volume</span><b>${num(toDisp(workoutVolume(w)), 0)}</b></div>
    <div class="mini"><span>Séries</span><b>${workoutSets(w)}</b></div>
    <div class="mini"><span>Records</span><b>${w.prs?.length || 0}</b></div>
  </div>
  ${w.ex.map(x => {
    const ex = exOf(x.id); let n = 0;
    return `<section class="card">
      <button class="exo-name" data-act="exInfo" data-id="${esc(x.id)}">${thumb(x.id, 40)}<span><b>${esc(ex.n)}${prIds.has(x.id) ? ` <span class="pr">${icon('trophy', 14)}</span>` : ''}</b><small>${esc(muscleLine(ex))}</small></span></button>
      ${x.note ? `<p class="muted small note">${esc(x.note)}</p>` : ''}
      <ol class="setlist">${x.sets.map(s => `<li><span class="sn t-${s.k}">${s.k === 'n' ? ++n : s.k.toUpperCase()}</span>${setText(s, ex.lt)}</li>`).join('')}</ol></section>`;
  }).join('')}
  <button class="btn soft block" data-act="startCopy" data-id="${w.id}">${icon('play', 18)} Refaire cette séance</button>`;
}
ACT.wDel = el => confirmSheet({ title: 'Supprimer cette séance ?', text: 'Cette action est définitive.', ok: 'Supprimer', danger: true,
  onOk: () => { delete db.workouts[el.dataset.id]; save(); toast('Séance supprimée'); location.hash = '#/historique'; } });

// ---------- Historique ----------
export function historyView() {
  const list = finished().reverse();
  let month = '';
  const items = list.map(w => {
    const m = w.date.slice(0, 7), head = m !== month ? `<h3 class="month">${cap(fmtMonth(w.date))}</h3>` : '';
    month = m; return head + workoutCard(w);
  }).join('');
  return `<header class="top bar">${back('#/profil')}<h1 class="h-sm">Historique</h1><span></span></header>
    ${items || `<div class="empty-state">${icon('cal', 40)}<h2>Aucune séance</h2><p class="muted">Tes séances terminées apparaîtront ici.</p></div>`}`;
}

// ---------- Profil ----------
const prof = { metric: 'n', month: 0 };
export function profile() {
  const t = today(), all = finished(), p = P();
  const hours = all.reduce((a, w) => a + (w.end - w.start), 0) / 36e5;
  const vol = all.reduce((a, w) => a + workoutVolume(w), 0);
  const ws = weights(), cur = avg7(t, ws) ?? ws.at(-1)?.v ?? null, e = eta(ws);
  const pct = cur != null ? (p.startWeight - cur) / (p.startWeight - p.targetWeight) : 0;

  // Records clés : exercices charge×reps les plus pratiqués
  const freq = {};
  all.forEach(w => w.ex.forEach(x => { if (exOf(x.id).lt === 'wr' && exOf(x.id).cat !== 'power') freq[x.id] = (freq[x.id] || 0) + 1; }));
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id);
  const firstRm = id => { for (const w of all) for (const x of w.ex) if (x.id === id) { const s = doneSets(x); if (s.length) return Math.max(...s.map(z => e1rm(+z.w || 0, +z.r || 0))); } return 0; };
  const lifts = top.map(id => { const b = exBests(id), f = firstRm(id), d = b.rm - f;
    return `<a class="li" href="#/ex/${encodeURIComponent(id)}">${thumb(id, 38)}<span class="grow"><b>${esc(exOf(id).n)}</b><small>1RM estimé</small></span>
      <span class="right"><b>${num(roundDisp(toDisp(b.rm)), 1)} ${U()}</b>${d > 0.01 ? `<small class="good">+${num(toDisp(d), 1)}</small>` : ''}</span></a>`; }).join('');

  // Tests
  const tDates = Object.keys(db.tests).sort();
  const lastT = k => { for (let i = tDates.length - 1; i >= 0; i--) if (db.tests[tDates[i]][k] != null) return db.tests[tDates[i]][k]; return null; };
  const firstT = k => { for (const d of tDates) if (db.tests[d][k] != null) return db.tests[d][k]; return null; };
  const tests = TESTS.filter(tt => !['waist', 'squat'].includes(tt.k)).map(tt => {
    const v = lastT(tt.k), f = firstT(tt.k), d = v != null && f != null ? v - f : 0;
    const good = tt.up ? d > 0 : d < 0;
    return `<div class="mini"><span>${tt.n}</span><b>${v != null ? num(v, 2) + (tt.u ? ' ' + tt.u : '') : '—'}</b>${d ? `<small class="${good ? 'good' : 'bad'}">${d > 0 ? '+' : ''}${num(d, 2)}</small>` : ''}</div>`;
  }).join('');
  const nt = testMondays(addDays(t, 60)).find(m => addDays(m, 6) >= t);

  // Graphique hebdomadaire
  const ser = weeklySeries(12, prof.metric);
  const bars = barChart(ser.map((s, i) => ({ v: prof.metric === 'vol' ? toDisp(s.v) / 1000 : prof.metric === 'dur' ? s.v / 60 : s.v, label: i % 3 === 2 || i === ser.length - 1 ? fmtShort(s.mon).replace('.', '') : '', hi: i === ser.length - 1 })),
    { fmt: v => prof.metric === 'n' ? num(v, 0) : num(v, 1) });

  // Muscles
  const split = muscleSplit(30), maxS = Math.max(1, ...Object.values(split));
  const muscles = GROUPS.filter(g => g.mu).map(g => `<div class="mbar"><span>${g.n}</span><div class="pbar"><span style="width:${(split[g.k] / maxS) * 100}%"></span></div><b>${num(split[g.k], 0)}</b></div>`).join('');

  return `
  <header class="top"><h1>Profil</h1><a class="icon-btn" href="#/reglages" aria-label="Réglages">${icon('gear', 24)}</a></header>
  <section class="phead">
    <span class="avatar xl">${esc((p.name || '?')[0].toUpperCase())}</span>
    <div><h2>${esc(p.name || 'Athlète')}</h2><div class="muted small">${p.since ? `Depuis le ${fmtShort(p.since)}` : 'Première séance à venir'}</div></div>
  </section>
  <div class="grid3">
    <div class="mini"><span>Séances</span><b>${all.length}</b></div>
    <div class="mini"><span>Heures</span><b>${num(hours, 1)}</b></div>
    <div class="mini"><span>Volume</span><b>${volTxt(vol)}</b></div>
  </div>
  <section class="card">
    <h3>Objectifs</h3>
    <div class="tags">${GOALS.filter(g => p.goals.includes(g.k)).map(g => `<span class="tag strong">${g.n}</span>`).join('')}</div>
    <a class="goal" href="#/corps">
      <div class="row between"><span>Poids</span><span class="muted small">${num(bToDisp(p.startWeight), 1)} → <b class="tx">${cur != null ? num(bToDisp(cur), 1) : '—'}</b> → ${num(bToDisp(p.targetWeight), 1)} ${BU()}</span></div>
      ${progressBar(pct * 100)}
      <div class="muted small">${e?.done ? 'Objectif atteint' : e?.date ? `Prévu le ${fmtShort(e.date)} (${num(-e.slope * 7 * (BU() === 'lb' ? 2.20462 : 1), 2)} ${BU()}/sem.)` : 'Pèse-toi chaque matin : l’estimation apparaît après ~10 jours.'}</div>
    </a>
  </section>
  ${lifts ? `<section class="card"><h3>Force</h3><div class="list flush">${lifts}</div></section>` : ''}
  <section class="card">
    <div class="row between"><h3>Explosivité et souplesse</h3><a class="link" href="#/tests">${tDates.length ? 'Ajouter' : 'Faire les tests'}</a></div>
    <div class="grid2">${tests}</div>
    ${nt ? `<div class="muted small row gap6">${icon('cal', 14)} Prochains tests : semaine du ${fmtShort(nt)}</div>` : ''}
  </section>
  <section class="card">
    <div class="seg sm">${[['n', 'Séances'], ['vol', unit() === 'lb' ? 'Volume (k lb)' : 'Volume (t)'], ['dur', 'Heures']].map(([k, l]) => `<button class="${prof.metric === k ? 'on' : ''}" data-act="profMetric" data-k="${k}">${l}</button>`).join('')}</div>
    ${bars}<div class="muted small center">12 dernières semaines</div>
  </section>
  <section class="card"><h3>Muscles travaillés <span class="muted small">· séries, 30 jours</span></h3>${muscles}</section>
  <section class="card">${calendar()}</section>
  <div class="card list">
    <a class="li" href="#/historique"><span class="li-ic">${icon('note', 20)}</span><span class="grow"><b>Historique</b></span>${icon('right', 18, 'muted')}</a>
    <a class="li" href="#/corps"><span class="li-ic">${icon('scale', 20)}</span><span class="grow"><b>Poids et mesures</b></span>${icon('right', 18, 'muted')}</a>
    <a class="li" href="#/programme"><span class="li-ic">${icon('target', 20)}</span><span class="grow"><b>Programme</b></span>${icon('right', 18, 'muted')}</a>
    <a class="li" href="#/reglages"><span class="li-ic">${icon('gear', 20)}</span><span class="grow"><b>Réglages</b></span>${icon('right', 18, 'muted')}</a>
  </div>`;
}
ACT.profMetric = el => { prof.metric = el.dataset.k; R.render(); };
function calendar() {
  const t = today(), base = parse(t); base.setDate(1); base.setMonth(base.getMonth() + prof.month);
  const first = ymd(base), y = base.getFullYear(), m = base.getMonth();
  const daysIn = new Date(y, m + 1, 0).getDate(), lead = (base.getDay() + 6) % 7;
  const dates = new Set(finished().map(w => w.date));
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<span></span>');
  for (let d = 1; d <= daysIn; d++) {
    const ds = ymd(new Date(y, m, d, 12));
    const plan = ds >= t && dayPlan(ds, P()).gym;
    cells.push(`<span class="cd ${dates.has(ds) ? 'on' : ''} ${ds === t ? 'today' : ''} ${plan ? 'plan' : ''}">${d}</span>`);
  }
  const n = [...dates].filter(d => d.startsWith(first.slice(0, 7))).length;
  return `<div class="row between"><button class="icon-btn" data-act="calNav" data-d="-1">${icon('back', 20)}</button>
    <div class="center"><b>${cap(fmtMonth(first))}</b><div class="muted small">${n} séance${n > 1 ? 's' : ''}</div></div>
    <button class="icon-btn" data-act="calNav" data-d="1">${icon('right', 20)}</button></div>
    <div class="cal">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<span class="ch">${x}</span>`).join('')}${cells.join('')}</div>`;
}
ACT.calNav = el => { prof.month += +el.dataset.d; R.render(); };

// ---------- Poids et mesures ----------
export function bodyView() {
  const ws = weights(), p = P();
  const chart = lineChart([
    { pts: ws.map(x => ({ t: ts(x.d), v: bToDisp(x.v) })), cls: 'raw', dots: true, line: false },
    { pts: ws.map(x => ({ t: ts(x.d), v: bToDisp(avg7(x.d, ws)) })), cls: 'avg' }], { target: bToDisp(p.targetWeight), h: 190, empty: 'Pèse-toi quelques matins pour voir ta courbe.' });
  const waist = Object.keys(db.tests).sort().filter(d => db.tests[d].waist).map(d => ({ t: ts(d), v: db.tests[d].waist }));
  return `<header class="top bar">${back('#/profil')}<h1 class="h-sm">Poids et mesures</h1><button class="btn primary sm" data-act="weighIn">${icon('plus', 16)} Pesée</button></header>
  <section class="card"><h3>Poids</h3>${chart}<div class="legend"><span><i class="dot"></i>Pesées</span><span><i class="line"></i>Moyenne 7 jours</span><span><i class="dash"></i>Objectif</span></div></section>
  ${waist.length ? `<section class="card"><h3>Tour de taille</h3>${lineChart([{ pts: waist, cls: 'avg', dots: true }], { h: 130 })}</section>` : ''}
  <section class="card list">${ws.slice().reverse().slice(0, 60).map(x => `<div class="li"><span class="grow"><b>${num(bToDisp(x.v), 1)} ${BU()}</b><small>${cap(fmtDay(x.d))}</small></span>
    <button class="icon-btn" data-act="wDelBody" data-d="${x.d}" aria-label="Supprimer">${icon('x', 18)}</button></div>`).join('') || '<p class="muted pad">Aucune pesée.</p>'}</section>`;
}
ACT.wDelBody = el => { const b = db.body[el.dataset.d]; if (b) { delete b.weight; save(); R.render(); } };

// ---------- Tests ----------
export function testsView() {
  const dates = Object.keys(db.tests).sort();
  const t = today();
  return `<header class="top bar">${back('#/profil')}<h1 class="h-sm">Tests</h1><span></span></header>
  <p class="muted small">Toutes les 4 semaines, après l’échauffement, quand tu es frais. Photos face, profil et dos le même jour.</p>
  ${dates.length ? `<section class="card"><div class="scroll-x"><table class="tbl"><tr><th></th>${dates.map(d => `<th>${fmtShort(d)}</th>`).join('')}</tr>
    ${TESTS.map(tt => `<tr><td>${tt.n}</td>${dates.map(d => `<td>${db.tests[d][tt.k] != null ? num(db.tests[d][tt.k], 2) : ''}</td>`).join('')}</tr>`).join('')}</table></div></section>` : ''}
  <form class="card form" data-form="tests"><h3>Nouveaux résultats</h3>
    <label class="lbl">Date<input class="field" type="date" name="date" value="${t}"></label>
    ${TESTS.map(tt => `<label class="lbl">${tt.n}${tt.u ? ` (${tt.u})` : ''}<input class="field" type="number" step="any" inputmode="decimal" name="${tt.k}" value="${db.tests[t]?.[tt.k] ?? ''}"><small>${tt.how}</small></label>`).join('')}
    <button class="btn primary block" type="submit">Enregistrer</button></form>`;
}
export function submitTests(form) {
  const f = new FormData(form), d = f.get('date'), rec = {};
  for (const tt of TESTS) { const v = f.get(tt.k); if (v !== '' && v != null) rec[tt.k] = +v; }
  if (!Object.keys(rec).length) return toast('Aucune valeur entrée');
  db.tests[d] = { ...(db.tests[d] || {}), ...rec }; save(); toast('Tests enregistrés'); R.render();
}

// ---------- Programme ----------
export function programView() {
  const t = today(), info = phaseInfo(t, P()), p = P();
  const all = [...PHASES, { key: 'cycle', name: 'Force / Puissance en alternance', start: CYCLE_START, end: null, desc: 'Blocs de 4 semaines, la 4e allégée. En continu.' }];
  const phases = all.map(ph => {
    const on = t >= ph.start && (!ph.end || t <= ph.end), past = ph.end && t > ph.end;
    return `<li class="${on ? 'on' : ''} ${past ? 'past' : ''}"><i></i><div><b>${ph.name}</b><span class="muted small">${fmtShort(ph.start)}${ph.end ? ' – ' + fmtShort(ph.end) : ' →'}</span><p class="muted small">${ph.desc}</p></div></li>`;
  }).join('');
  const mon = mondayOf(t), next = addDays(mon, 7);
  const ov = (m, label) => `<label class="lbl">${label}<select class="field" data-ov="${m}">
    ${[['', 'Automatique'], ['light', 'Allégée (2 séances courtes)'], ['normal', 'Normale']].map(([v, l]) => `<option value="${v}" ${(p.overrides[m] || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  const sched = ['A', 'B', 'C'].map(k => `<div class="li"><span class="day-pill">${DOW[p.days[k]]}</span><span class="grow"><b>${ROUTINES[k].name}</b></span></div>`).join('');
  return `<header class="top bar">${back('#/entrainement')}<h1 class="h-sm">Programme</h1><span></span></header>
  <section class="card hero"><div class="eyebrow">${icon('target', 14)} ${PROGRAM.perWeek} séances par semaine</div><h2 class="today-title">${PROGRAM.name}</h2><p class="muted">${PROGRAM.tagline}</p>
    <div class="muted small">En ce moment : <b class="tx">${info.name}${info.weeks > 1 ? `, semaine ${info.week} sur ${info.weeks}` : ''}</b>${info.light ? ' · allégée' : ''}</div></section>
  <section class="card"><h3>Ta semaine type</h3><div class="list flush">${sched}</div>
    <p class="muted small">Course facile le dimanche. Change tes jours dans Réglages.</p></section>
  <section class="card"><h3>Ajuster la semaine</h3>${ov(mon, 'Cette semaine')}${ov(next, 'Semaine prochaine')}
    <p class="muted small">Allégée = 2 séances de 45 min (examens, semaine chargée, fatigue).</p></section>
  <section class="card"><h3>Étapes</h3><ul class="timeline">${phases}</ul></section>
  <section class="card"><h3>Sur quoi repose le programme</h3>
    <ol class="principles">${PRINCIPLES.map(([t, d]) => `<li><b>${t}.</b> <span>${d}</span></li>`).join('')}</ol>
    <p class="small muted">RPE 7 = il te reste 3 reps en réserve · RPE 8 = 2 · RPE 9 = 1. Touche un exercice pour voir pourquoi il est là.</p></section>`;
}

// ---------- Réglages ----------
export function settingsView() {
  const p = P();
  const daySel = k => `<label class="lbl">${ROUTINES[k].name}<select class="field" data-day="${k}">${[1, 2, 3, 4, 5, 6, 0].map(d => `<option value="${d}" ${p.days[k] === d ? 'selected' : ''}>${cap(DOW_LONG[d])}</option>`).join('')}</select></label>`;
  const seg = (key, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${p[key] === v ? 'on' : ''}" data-act="setSeg" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  return `<header class="top bar">${back('#/profil')}<h1 class="h-sm">Réglages</h1><span></span></header>
  <section class="card"><h3>Profil</h3>
    <label class="lbl">Prénom<input class="field" data-pf="name" value="${esc(p.name)}" maxlength="30"></label>
    <label class="lbl">Poids de départ (${BU()})<input class="field" type="number" step="0.1" inputmode="decimal" data-pf="startWeight" value="${num(bToDisp(p.startWeight), 1).replace(',', '.')}"></label>
    <label class="lbl">Poids cible (${BU()})<input class="field" type="number" step="0.1" inputmode="decimal" data-pf="targetWeight" value="${num(bToDisp(p.targetWeight), 1).replace(',', '.')}"></label>
    <div class="lbl">Objectifs</div><div class="tags">${GOALS.map(g => `<button class="tag btn-tag ${p.goals.includes(g.k) ? 'strong' : ''}" data-act="goal" data-k="${g.k}">${g.n}</button>`).join('')}</div>
  </section>
  <section class="card"><h3>Jours d’entraînement</h3>${daySel('A')}${daySel('B')}${daySel('C')}
    <p class="muted small">Semaine allégée : séances le 1er et le 3e jour.</p></section>
  <section class="card"><h3>Unités</h3>
    <div class="lbl">Charges (barres, haltères, machines)</div>${seg('unit', [['kg', 'Kilogrammes'], ['lb', 'Livres']])}
    <div class="lbl">Poids du corps</div>${seg('bodyUnit', [['kg', 'Kilogrammes'], ['lb', 'Livres']])}</section>
  <section class="card"><h3>Apparence</h3>${seg('theme', [['auto', 'Auto'], ['dark', 'Sombre'], ['light', 'Clair']])}</section>
  <section class="card"><h3>Habitudes quotidiennes</h3>
    <div class="list flush">${p.habits.map((h, i) => `<div class="li"><span class="grow">${esc(h.n)}</span><button class="icon-btn" data-act="habDel" data-i="${i}" aria-label="Retirer">${icon('x', 18)}</button></div>`).join('')}</div>
    <div class="row gap"><input class="field" id="habNew" placeholder="Nouvelle habitude" maxlength="40"><button class="btn soft" data-act="habAdd">Ajouter</button></div></section>
  <section class="card"><h3>Notifications</h3>
    <p class="muted small">Alerte de fin de repos quand l’écran est éteint. Les rappels de séance passent par ton agenda.</p>
    <button class="btn soft block" data-act="notif">${icon('bell', 18)} ${'Notification' in window && Notification.permission === 'granted' ? 'Activées' : 'Activer'}</button></section>
  <section class="card"><h3>Données</h3>
    <p class="muted small">Tout est enregistré sur cet appareil. Exporte une sauvegarde de temps en temps.</p>
    <div class="row gap"><button class="btn soft grow" data-act="export">${icon('download', 18)} Exporter</button>
    <label class="btn soft grow">${icon('upload', 18)} Importer<input type="file" accept="application/json" data-imp hidden></label></div>
    <button class="btn text-danger block" data-act="wipe">Effacer toutes les données</button></section>
  <p class="muted small center">Forme · images d’exercices : free-exercise-db (domaine public)</p>`;
}
ACT.setSeg = el => {
  const k = el.dataset.k; P()[k] = el.dataset.v; save();
  if (k === 'theme') applyTheme();
  R.render();
};
export function applyTheme() {
  const th = P().theme;
  if (th === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = th;
  const dark = th === 'dark' || (th === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0b0b0e' : '#f5f5f7');
}
ACT.goal = el => { const g = P().goals, i = g.indexOf(el.dataset.k); if (i >= 0) g.splice(i, 1); else g.push(el.dataset.k); save(); R.render(); };
ACT.habDel = el => { P().habits.splice(+el.dataset.i, 1); save(); R.render(); };
ACT.habAdd = () => { const v = $('#habNew').value.trim(); if (!v) return; P().habits.push({ k: 'h' + uid(), n: v }); save(); R.render(); };
ACT.notif = () => { if ('Notification' in window) Notification.requestPermission().then(() => R.render()); else toast('Non pris en charge sur ce navigateur'); };
ACT.export = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db)], { type: 'application/json' }));
  a.download = `forme-${today()}.json`; a.click();
};
export function settingsChange(el) {
  const p = P();
  if (el.dataset.pf) {
    const k = el.dataset.pf;
    if (k === 'name') p.name = el.value.trim();
    else { const v = parseFloat(el.value); if (v > 20) p[k] = bFromDisp(v); }
    save(); toast('Enregistré'); return true;
  }
  if (el.dataset.day) { p.days[el.dataset.day] = +el.value; save(); toast('Enregistré'); return true; }
  if (el.dataset.ov) { if (el.value) p.overrides[el.dataset.ov] = el.value; else delete p.overrides[el.dataset.ov]; save(); toast('Enregistré'); return true; }
  return false;
}

// ---------- Bienvenue ----------
const ob = { step: 0 };
export function onboarding() {
  const p = P();
  const dots = `<div class="dots">${[0, 1, 2, 3].map(i => `<i class="${i === ob.step ? 'on' : ''}"></i>`).join('')}</div>`;
  let body;
  if (ob.step === 0) body = `<div class="ob-hero"><img src="icons/icon-192.png" alt="" class="ob-logo"><h1>Forme</h1>
      <p>Ton programme, tes séances, tes progrès.<br>Tout est planifié : tu n’as qu’à suivre.</p></div>
      <button class="btn primary block" data-act="obNext">Commencer</button>`;
  else if (ob.step === 1) body = `<h1>Comment tu t’appelles ?</h1>
      <input class="field big" id="obName" value="${esc(p.name)}" placeholder="Prénom" maxlength="30" autocomplete="given-name">
      <h3>Charges au gym</h3><div class="seg">${[['kg', 'kg'], ['lb', 'lb']].map(([v, l]) => `<button class="${p.unit === v ? 'on' : ''}" data-act="obUnit" data-k="unit" data-v="${v}">${l}</button>`).join('')}</div>
      <h3>Poids du corps</h3><div class="seg">${[['kg', 'kg'], ['lb', 'lb']].map(([v, l]) => `<button class="${p.bodyUnit === v ? 'on' : ''}" data-act="obUnit" data-k="bodyUnit" data-v="${v}">${l}</button>`).join('')}</div>
      <button class="btn primary block" data-act="obNext">Continuer</button>`;
  else if (ob.step === 2) body = `<h1>Tes objectifs</h1>
      <div class="ob-goals">${GOALS.map(g => `<button class="ob-goal ${p.goals.includes(g.k) ? 'on' : ''}" data-act="obGoal" data-k="${g.k}"><span class="ck sm ${p.goals.includes(g.k) ? 'on' : ''}">${icon('check', 14)}</span>${g.n}</button>`).join('')}</div>
      <div class="grid2"><label class="lbl">Poids actuel (${BU()})<input class="field" id="obW" type="number" inputmode="decimal" step="0.1" value="${num(bToDisp(p.startWeight), 1).replace(',', '.')}"></label>
      <label class="lbl">Poids cible (${BU()})<input class="field" id="obT" type="number" inputmode="decimal" step="0.1" value="${num(bToDisp(p.targetWeight), 1).replace(',', '.')}"></label></div>
      <button class="btn primary block" data-act="obNext">Continuer</button>`;
  else body = `<h1>Ton programme</h1>
      <div class="card hero"><div class="eyebrow">${icon('target', 14)} ${PROGRAM.perWeek} séances par semaine</div><h2 class="today-title">${PROGRAM.name}</h2><p class="muted small">${PROGRAM.tagline}</p></div>
      <h3>Tes jours de gym</h3>
      ${['A', 'B', 'C'].map(k => `<label class="lbl">${ROUTINES[k].name}<select class="field" data-day="${k}">${[1, 2, 3, 4, 5, 6, 0].map(d => `<option value="${d}" ${p.days[k] === d ? 'selected' : ''}>${cap(DOW_LONG[d])}</option>`).join('')}</select></label>`).join('')}
      <button class="btn primary block" data-act="obDone">C’est parti</button>`;
  return `<div class="ob">${ob.step ? `<button class="icon-btn" data-act="obBack">${icon('back', 24)}</button>` : '<span></span>'}${dots}<div class="ob-body">${body}</div></div>`;
}
function obKeep() {
  const p = P();
  const n = $('#obName'); if (n) p.name = n.value.trim();
  const w = $('#obW'), t = $('#obT');
  if (w && +w.value > 20) p.startWeight = bFromDisp(+w.value);
  if (t && +t.value > 20) p.targetWeight = bFromDisp(+t.value);
  save();
}
ACT.obNext = () => { obKeep(); if (ob.step === 1 && !P().name) return toast('Entre ton prénom'); ob.step++; R.render(); };
ACT.obBack = () => { obKeep(); ob.step = Math.max(0, ob.step - 1); R.render(); };
ACT.obUnit = el => { obKeep(); P()[el.dataset.k] = el.dataset.v; save(); R.render(); };
ACT.obGoal = el => { obKeep(); ACT.goal(el); };
ACT.obDone = () => {
  const p = P(); p.onboarded = true;
  const t = today();
  if (!weights().length) (db.body[t] ||= {}).weight = p.startWeight;
  save(); location.hash = '#/'; R.render();
};

// ---------- Mobilité ----------
export function mobilityView() {
  const t = today(), done = !!db.mob[t];
  const recup = phaseInfo(t, P()).key === 'recup';
  return `<header class="top bar">${back('#/entrainement')}<h1 class="h-sm">Mobilité</h1><span></span></header>
  <section class="card hero"><div class="eyebrow">${icon('stretch', 14)} ${MOBILITY.steps.length} étirements · ${mobMinutes()} min</div>
    <h2 class="today-title">${MOBILITY.name}</h2><p class="muted">${MOBILITY.desc}${recup ? ' Cette semaine : version douce, à 50 % de ton amplitude.' : ''}</p>
    ${done ? `<div class="eyebrow ok">${icon('check', 14)} Faite aujourd’hui</div>` : ''}
    <button class="btn primary block" data-act="play">${icon('play', 18)} ${done ? 'Refaire' : 'Démarrer'}</button></section>
  <div class="card list">${MOBILITY.steps.map(s => `<button class="li" data-act="exInfo" data-id="${s.id}">${thumb(s.id, 42)}<span class="grow"><b>${esc(exOf(s.id).n)}</b><small>${s.hold} s${s.sides ? ' par côté' : ''}</small></span>${icon('info', 18, 'muted')}</button>`).join('')}</div>`;
}
