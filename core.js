// Logique : séances, progression, records, statistiques
import { db, exOf, unit, toDisp, fromDisp, roundDisp } from './store.js';
import { increment, GROUPS } from './exercises.js';
import { buildSession, dayPlan, phaseInfo, ctxOf, ROUTINES } from './program.js';
import { uid, today, nowTs, addDays, mondayOf, diffDays, parse, dateOfTs, num, fmtShort } from './util.js';

// ---------- Séances terminées ----------
export const finished = () => Object.values(db.workouts).sort((a, b) => a.start - b.start);
export const doneSets = ex => ex.sets.filter(s => s.done && s.k !== 'w');

export function lastPerf(exId, beforeTs = Infinity) {
  const list = finished().filter(w => w.start < beforeTs).reverse();
  for (const w of list) {
    for (const ex of w.ex) {
      if (ex.id !== exId) continue;
      const sets = doneSets(ex);
      if (sets.length) return { date: w.date, sets };
    }
  }
  return null;
}

// ---------- Cibles ----------
export function parseReps(s) {
  let m;
  if (!s) return { kind: 'free' };
  if ((m = s.match(/^(\d+)s(\/\S+)?$/))) return { kind: 'time', sec: +m[1], side: m[2] || '' };
  if ((m = s.match(/^(\d+)m$/))) return { kind: 'dist', m: +m[1] };
  if (s === 'max') return { kind: 'max' };
  if ((m = s.match(/^(\d+)(?:-(\d+))?(\/\S+)?$/))) return { kind: 'reps', min: +m[1], max: +(m[2] || m[1]), side: m[3] || '' };
  return { kind: 'free' };
}
export const targetLabel = (reps) => {
  const sp = parseReps(reps);
  const side = sp.side ? ' ' + sp.side.replace('/', '/ ') : '';
  if (sp.kind === 'reps') return `${sp.min}${sp.max !== sp.min ? '–' + sp.max : ''} reps${side}`;
  if (sp.kind === 'time') return `${sp.sec} s${side}`;
  if (sp.kind === 'dist') return `${sp.m} m`;
  if (sp.kind === 'max') return 'max reps';
  return reps || '';
};

// Texte « précédent » pour une série
export function setText(s, lt) {
  const w = s.w === '' || s.w == null ? null : num(roundDisp(toDisp(s.w)), 2);
  switch (lt) {
    case 'wr': return w != null ? `${w} × ${s.r || 0}` : `${s.r || 0} reps`;
    case 'bw': return `${!w || +s.w === 0 ? 'PDC' : (s.w > 0 ? '+' : '') + w} × ${s.r || 0}`;
    case 'r': return `${s.r || 0} reps`;
    case 'time': return `${s.v || 0} s`;
    case 'dist': return `${s.v || 0} m`;
    case 'wd': return `${w ?? 0} × ${s.v || 0} m`;
  }
  return '';
}

// Double progression : charges suggérées (placeholders) + message
function suggest(item, ex, deload, last) {
  const sp = parseReps(item.reps);
  const lt = ex.lt;
  const base = { r: sp.kind === 'reps' ? sp.max : '', v: sp.kind === 'time' ? sp.sec : sp.kind === 'dist' ? sp.m : '' };
  if (!last) {
    const needW = lt === 'wr' || lt === 'wd';
    return { ...base, w: lt === 'bw' ? 0 : '', hint: needW ? (ex.start || 'Première fois : choisis une charge où il te reste environ 3 reps en réserve.') : '' };
  }
  const s0 = last.sets[0];
  const reps = last.sets.map(s => +s.r || 0);
  if (sp.kind === 'max') {
    const best = Math.max(...reps);
    return { ...base, w: s0.w, r: best, hint: `Objectif : battre ${best} reps.` };
  }
  if (!(lt === 'wr' || lt === 'bw') || sp.kind !== 'reps') return { ...base, w: s0.w ?? '', hint: '' };
  const w0 = roundDisp(toDisp(+s0.w || 0));
  const u = unit();
  if (deload) return { ...base, w: s0.w, r: sp.min, hint: `Semaine allégée : même charge, sans forcer.` };
  const allHit = last.sets.length >= item.sets && reps.every(r => r >= sp.max);
  if (allHit) {
    const inc = increment(ex, u);
    return { ...base, w: fromDisp(w0 + inc), r: sp.min, up: true, hint: `+${num(inc, 2)} ${u} : toutes les reps réussies la dernière fois.` };
  }
  const target = Math.min(sp.max, Math.max(sp.min, Math.min(...reps) + 1));
  return { ...base, w: s0.w, r: target, hint: `Même charge, vise ${target} reps.` };
}

// Construit un exercice de séance (avec placeholders et « précédent »)
export function makeExercise(item, { deload = false, beforeTs = Infinity } = {}) {
  const ex = exOf(item.id);
  const last = lastPerf(item.id, beforeTs);
  const sg = item.reps ? suggest(item, ex, deload, last) : null;
  const n = item.sets || (last ? last.sets.length : 3);
  const sets = Array.from({ length: n }, (_, i) => {
    const p = last?.sets[Math.min(i, last.sets.length - 1)];
    const ph = sg ? { pw: sg.w, pr: sg.r, pv: sg.v } : p ? { pw: p.w, pr: p.r, pv: p.v } : {};
    return { k: 'n', w: '', r: '', v: '', done: false, prev: last && i < last.sets.length ? setText(last.sets[i], ex.lt) : '', ...ph };
  });
  return {
    uid: uid(), id: item.id, note: '', rest: item.rest ?? 90, ss: item.ss || '',
    target: item.reps ? { sets: item.sets, reps: item.reps, rpe: item.rpe || '' } : null,
    hint: sg?.hint || '', up: !!sg?.up, sets,
  };
}

export function newSet(exo) {
  const ex = exOf(exo.id);
  const prevSets = exo.sets.filter(s => s.k !== 'w');
  const ref = exo.sets[exo.sets.length - 1] || {};
  const last = lastPerf(exo.id);
  const i = prevSets.length;
  return { k: 'n', w: '', r: '', v: '', done: false,
    pw: ref.w !== '' && ref.w != null ? ref.w : ref.pw, pr: ref.r || ref.pr, pv: ref.v || ref.pv,
    prev: last && last.sets[i] ? setText(last.sets[i], ex.lt) : '' };
}

// ---------- Démarrer une séance ----------
export function startProgram(type, date = today()) {
  const info = phaseInfo(date, db.profile);
  const ctx = ctxOf(info);
  const S = buildSession(type, ctx);
  const phaseName = `${info.name}${info.weeks > 1 ? ` · semaine ${info.week} sur ${info.weeks}` : ''}${ctx.deload ? ' · semaine allégée (1 série de moins)' : ''}`;
  return {
    id: uid(), kind: 'program', type, name: S.name, date, start: nowTs(), phase: info.key, week: info.week, phaseName,
    warm: S.warm.map(w => ({ ...w, done: false })), cool: S.cool.map(c => ({ ...c, done: false })),
    ex: S.items.map(it => makeExercise(it, { deload: ctx.deload })),
  };
}
export function startRoutine(r) {
  return { id: uid(), kind: 'routine', routineId: r.id, name: r.name, date: today(), start: nowTs(),
    ex: r.items.map(it => makeExercise({ id: it.id, sets: it.sets, rest: it.rest, reps: it.reps || '' })) };
}
export function startEmpty() {
  const h = new Date().getHours();
  const name = h < 11 ? 'Séance du matin' : h < 17 ? 'Séance de l’après-midi' : 'Séance du soir';
  return { id: uid(), kind: 'empty', name, date: today(), start: nowTs(), ex: [] };
}
export function startCopy(w) {
  return { id: uid(), kind: 'routine', name: w.name, date: today(), start: nowTs(),
    ex: w.ex.map(x => makeExercise({ id: x.id, sets: doneSets(x).length || x.sets.length, rest: x.rest, ss: x.ss })) };
}

// ---------- Volume, records ----------
export function setVolume(s, lt) {
  if (!s.done || s.k === 'w') return 0;
  if (lt === 'wr') return (+s.w || 0) * (+s.r || 0);
  if (lt === 'bw' && +s.w > 0) return +s.w * (+s.r || 0);
  return 0;
}
export const workoutVolume = w => w.ex.reduce((t, x) => t + x.sets.reduce((a, s) => a + setVolume(s, exOf(x.id).lt), 0), 0);
export const workoutSets = w => w.ex.reduce((t, x) => t + doneSets(x).length, 0);
export const e1rm = (w, r) => r <= 0 ? 0 : r === 1 ? w : w * (1 + Math.min(r, 12) / 30);

function bestsOf(sets, lt) {
  const b = {};
  for (const s of sets) {
    const w = +s.w || 0, r = +s.r || 0, v = +s.v || 0;
    if (lt === 'wr' || lt === 'wd') { if (r || lt === 'wd') b.w = Math.max(b.w || 0, w); }
    if (lt === 'wr' && r) { b.rm = Math.max(b.rm || 0, e1rm(w, r)); b.vol = Math.max(b.vol || 0, w * r); }
    if (lt === 'r' || lt === 'bw') b.reps = Math.max(b.reps || 0, r);
    if (lt === 'bw' && w > 0) b.w = Math.max(b.w || 0, w);
    if (lt === 'time') b.time = Math.max(b.time || 0, v);
  }
  return b;
}
export function exBests(exId, beforeTs = Infinity) {
  const lt = exOf(exId).lt;
  const sets = finished().filter(w => w.start < beforeTs).flatMap(w => w.ex.filter(x => x.id === exId).flatMap(doneSets));
  return { ...bestsOf(sets, lt), n: sets.length };
}
export const PR_LABEL = { w: 'Charge max', rm: '1RM estimé', vol: 'Meilleure série', reps: 'Reps max', time: 'Temps max' };
export function computePRs(w) {
  const out = [];
  for (const x of w.ex) {
    const lt = exOf(x.id).lt;
    const prev = exBests(x.id, w.start);
    if (!prev.n) continue; // première fois : pas de record
    const cur = bestsOf(doneSets(x), lt);
    for (const k of Object.keys(cur)) if (cur[k] > (prev[k] || 0) + 1e-9) out.push({ id: x.id, k, v: cur[k] });
  }
  return out;
}
export function prText(p) {
  const u = unit();
  if (p.k === 'reps') return `${p.v} reps`;
  if (p.k === 'time') return `${p.v} s`;
  if (p.k === 'vol') return `${num(toDisp(p.v), 0)} ${u}`;
  return `${num(roundDisp(toDisp(p.v)), 1)} ${u}`;
}

// ---------- Semaine, série ----------
export function weekStatus(mon) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), p = dayPlan(d, db.profile);
    const done = finished().filter(w => w.date === d);
    days.push({ d, p, done });
  }
  const planned = days.filter(x => x.p.gym && !x.p.optional).length;
  const doneN = days.reduce((n, x) => n + x.done.length, 0);
  return { days, planned, doneN };
}
export function streak() {
  let n = 0, mon = mondayOf(today());
  const first = db.profile.since || '2026-10-12';
  for (let k = 0; k < 200; k++, mon = addDays(mon, -7)) {
    if (addDays(mon, 6) < first) break;
    const w = weekStatus(mon);
    if (w.planned === 0) continue;
    if (w.doneN >= w.planned) n++;
    else if (k === 0) continue;
    else break;
  }
  return n;
}

// ---------- Poids ----------
export const weights = () => Object.entries(db.body).filter(([, b]) => b.weight > 0)
  .map(([d, b]) => ({ d, v: b.weight })).sort((a, b) => a.d.localeCompare(b.d));
export function avg7(date, ws = weights()) {
  const from = addDays(date, -6);
  const w = ws.filter(x => x.d >= from && x.d <= date);
  return w.length ? w.reduce((s, x) => s + x.v, 0) / w.length : null;
}
export function eta(ws = weights()) {
  const t = today();
  const recent = ws.filter(x => x.d >= addDays(t, -28));
  if (recent.length < 5 || diffDays(recent[0].d, recent.at(-1).d) < 10) return null;
  const xs = recent.map(x => diffDays(recent[0].d, x.d)), ys = recent.map(x => x.v);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const cur = avg7(t, ws), tgt = db.profile.targetWeight;
  if (cur <= tgt) return { done: true, slope };
  if (!(slope < -0.005)) return { slope };
  return { slope, date: addDays(t, Math.round((cur - tgt) / -slope)) };
}

// ---------- Répartition musculaire ----------
export function muscleSplit(days = 30) {
  const from = addDays(today(), -days + 1);
  const count = Object.fromEntries(GROUPS.filter(g => g.mu).map(g => [g.k, 0]));
  for (const w of finished().filter(w => w.date >= from)) {
    for (const x of w.ex) {
      const ex = exOf(x.id), n = doneSets(x).length;
      if (!n) continue;
      const g1 = new Set(ex.mu.map(groupOf).filter(Boolean));
      const g2 = new Set(ex.mu2.map(groupOf).filter(g => g && !g1.has(g)));
      g1.forEach(g => (count[g] += n));
      g2.forEach(g => (count[g] += n / 2));
    }
  }
  return count;
}
const groupOf = m => GROUPS.find(g => g.mu?.includes(m))?.k;

// Séances par semaine (12 dernières)
export function weeklySeries(weeks = 12, metric = 'n') {
  const out = [];
  let mon = addDays(mondayOf(today()), -7 * (weeks - 1));
  for (let i = 0; i < weeks; i++, mon = addDays(mon, 7)) {
    const ws = finished().filter(w => w.date >= mon && w.date <= addDays(mon, 6));
    const v = metric === 'n' ? ws.length : metric === 'vol' ? ws.reduce((a, w) => a + workoutVolume(w), 0)
      : ws.reduce((a, w) => a + (w.end - w.start) / 60000, 0);
    out.push({ mon, v });
  }
  return out;
}

export { dayPlan, phaseInfo, ROUTINES, dateOfTs, fmtShort, parse };
