// Programme « Recomposition athlétique » : séances par phase, échauffements, calendrier.
import { parse, addDays, diffDays, mondayOf } from './util.js';

export const PROGRAM = {
  name: 'Recomposition athlétique',
  tagline: 'Perdre du gras, gagner du muscle, devenir explosif et plus souple.',
  perWeek: 3,
};

// ---------- Mobilité ----------
// reps : texte affiché ; sec : durée (minuteur)
export const WARMUP = [
  { id: 'bike', reps: '3 min', sec: 180 }, { id: 'cat_cow', reps: '8 reps' }, { id: 'hip_9090', reps: '8 / côté' },
  { id: 'wgs', reps: '5 / côté' }, { id: 'cossack', reps: '5 / côté' }, { id: 'ankle', reps: '10 / côté' },
  { id: 'open_book', reps: '6 / côté' }, { id: 'band_pull', reps: '15 reps' }, { id: 'leg_swings', reps: '10 / côté' },
];
const WARMUP_SHORT = [
  { id: 'bike', reps: '2 min', sec: 120 }, { id: 'cat_cow', reps: '8 reps' }, { id: 'wgs', reps: '5 / côté' },
  { id: 'cossack', reps: '5 / côté' }, { id: 'leg_swings', reps: '10 / côté' },
];
const COOL = {
  A: ['fold', 'hip_flexor', 'pigeon'],
  B: ['pec', 'lat_stretch', 'thread'],
  C: ['fold', 'hip_flexor', 'pigeon', 'calf_wall'],
  L: ['fold', 'hip_flexor', 'pec'],
  R: ['pec', 'lat_stretch'],
};
// Routine guidée « jours sans gym »
export const MOBILITY = {
  name: 'Mobilité complète',
  desc: 'Hanches, ischios, dos et épaules. Guidée étape par étape.',
  steps: [
    { id: 'couch', hold: 45, sides: true },
    { id: 'pigeon', hold: 45, sides: true },
    { id: 'pike_pnf', hold: 80 },
    { id: 'frog', hold: 60 },
    { id: 'deep_squat', hold: 60 },
    { id: 'thread', hold: 30, sides: true },
    { id: 'sphinx', hold: 45 },
    { id: 'pec', hold: 45, sides: true },
    { id: 'calf_wall', hold: 60, sides: true },
  ],
};

// ---------- Séances ----------
// x(id, séries, reps, effort, repos (s), superset)
const x = (id, sets, reps, rpe = '', rest = 90, ss = '') => ({ id, sets, reps, rpe, rest, ss });

export const ROUTINES = {
  A: { name: 'Bas du corps + puissance', min: 75 },
  B: { name: 'Haut du corps', min: 75 },
  C: { name: 'Athlétique', min: 75 },
  L: { name: 'Corps complet express', min: 45 },
  R: { name: 'Haut du corps léger', min: 45 },
};

function main(type, phase, week) {
  if (type === 'R') return [
    x('db_bench', 3, '10', 'RPE 6', 90), x('lat_pulldown', 3, '10', 'RPE 6', 90),
    x('cable_row', 3, '12', 'RPE 6', 60, 'A'), x('lat_raise', 2, '15', 'RPE 6', 60, 'A'),
    x('face_pull', 2, '15', 'RPE 6', 60)];

  if (type === 'L') {
    const early = phase === 'recup' || phase === 'reprise' || (phase === 'fond' && week <= 2);
    const rpe = phase === 'reprise' ? 'RPE 6' : 'RPE 7';
    return [
      x(early ? 'goblet_squat' : 'back_squat', 3, '5', rpe, 150),
      x(early ? 'db_bench' : 'bench', 3, '5', rpe, 150),
      x('rdl', 3, '8', rpe, 20, 'A'), x('pullup', 3, '6-8', rpe, 90, 'A'),
      x('lunge', 2, '10/jambe', rpe, 20, 'B'), x('db_row', 2, '10', rpe, 75, 'B')];
  }

  if (phase === 'fond') {
    if (type === 'A') return [
      x('box_jump', 3, '5', 'Explosif', 75), x('pogo', 3, '15s', 'Rapide', 60),
      x(week <= 2 ? 'goblet_squat' : 'back_squat', 3, '6-8', 'RPE 7', 150), x('rdl', 3, '8-10', 'RPE 7', 120),
      x('bulgarian', 3, '8-10/jambe', 'RPE 8', 20, 'A'), x('db_row', 3, '10-12', 'RPE 8', 75, 'A'),
      x('calf', 3, '12-15', 'RPE 8', 20, 'B'), x('pallof', 3, '10/côté', 'Contrôlé', 60, 'B')];
    if (type === 'B') return [
      x('mb_chest', 3, '5', 'Explosif', 60), x('mb_rot', 3, '5/côté', 'Explosif', 60),
      x('db_bench', 3, '6-8', 'RPE 7', 120), x('pullup', 3, '6-8', 'RPE 7', 120),
      x('db_ohp', 3, '10-12', 'RPE 8', 20, 'A'), x('cable_row', 3, '10-12', 'RPE 8', 75, 'A'),
      x('lat_raise', 3, '12-15', 'RPE 8', 20, 'B'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'B'),
      x('db_curl', 2, '12-15', 'RPE 8', 20, 'C'), x('tri', 2, '12-15', 'RPE 8', 60, 'C')];
    if (type === 'C') return [
      x('broad_jump', 3, '4', 'Explosif', 75), x('lateral_bound', 3, '4/côté', 'Explosif', 60),
      x('sprint_acc', 5, '15m', '90 %', 75),
      x('trapbar', 3, '5-6', 'RPE 7', 150), x('incline_db', 3, '8-10', 'RPE 7', 120),
      x('lunge', 3, '10/jambe', 'RPE 8', 20, 'A'), x('chinup', 3, 'max', 'Propre', 75, 'A'),
      x('nordic', 3, '4-6', 'Contrôlé', 20, 'B'), x('farmer', 3, '30m', 'Lourd', 75, 'B')];
  }

  if (phase === 'force') {
    if (type === 'A') return [
      x('hurdle_hops', 4, '4', 'Explosif', 75), x('pogo', 3, '15s', 'Rapide', 60),
      x('back_squat', 4, '5', 'RPE 7-8', 180), x('rdl', 3, '6-8', 'RPE 7-8', 150),
      x('bulgarian', 3, '8/jambe', 'RPE 8', 20, 'A'), x('db_row', 3, '8-10', 'RPE 8', 75, 'A'),
      x('calf', 3, '10-12', 'RPE 8', 20, 'B'), x('pallof', 3, '10/côté', 'Contrôlé', 60, 'B')];
    if (type === 'B') return [
      x('mb_chest', 3, '5', 'Explosif', 60), x('mb_rot', 3, '5/côté', 'Explosif', 60),
      x('bench', 4, '5', 'RPE 7-8', 180), x('pullup', 4, '5', 'RPE 8', 150),
      x('db_ohp', 3, '8-10', 'RPE 8', 20, 'A'), x('cable_row', 3, '10-12', 'RPE 8', 75, 'A'),
      x('lat_raise', 3, '12-15', 'RPE 8', 20, 'B'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'B'),
      x('db_curl', 2, '10-12', 'RPE 8', 20, 'C'), x('tri', 2, '10-12', 'RPE 8', 60, 'C')];
    if (type === 'C') return [
      x('sprint_20', 6, '20m', '95 %', 90), x('cod', 4, '1', 'Vif', 90), x('broad_jump', 3, '3', 'Explosif', 75),
      x('trapbar', 4, '4-5', 'RPE 8', 180), x('incline_db', 3, '8', 'RPE 8', 120),
      x('lunge', 3, '8/jambe', 'RPE 8', 20, 'A'), x('chinup', 3, 'max', 'Propre', 75, 'A'),
      x('nordic', 3, '5-6', 'Contrôlé', 20, 'B'), x('copenhagen', 3, '20s/côté', 'Tenir', 60, 'B')];
  }

  if (phase === 'puiss') {
    if (type === 'A') return [
      x('depth_jump', 3, '4', 'Explosif', 90),
      x('back_squat', 4, '3', 'RPE 8', 15, 'A'), x('box_jump', 4, '3', 'Explosif', 180, 'A'),
      x('bulgarian', 3, '8/jambe', 'RPE 8', 90),
      x('rdl', 3, '6-8', 'RPE 8', 20, 'B'), x('calf', 3, '10-12', 'RPE 8', 75, 'B'),
      x('pallof', 3, '10/côté', 'Contrôlé', 45)];
    if (type === 'B') return [
      x('bench', 4, '4', 'RPE 8', 15, 'A'), x('mb_chest', 4, '3', 'Explosif', 150, 'A'),
      x('pullup', 4, '5', 'RPE 8', 150),
      x('db_ohp', 3, '8-10', 'RPE 8', 20, 'B'), x('cable_row', 3, '10-12', 'RPE 8', 75, 'B'),
      x('lat_raise', 3, '12-15', 'RPE 8', 20, 'C'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'C'),
      x('db_curl', 2, '10-12', 'RPE 8', 20, 'D'), x('tri', 2, '10-12', 'RPE 8', 60, 'D')];
    if (type === 'C') return [
      x('sprint_fly', 4, '20m', 'Max', 150), x('cod', 4, '1', 'Vif', 90), x('lateral_bound', 3, '4/côté', 'Explosif', 60),
      x('trapbar_jump', 4, '4', 'Explosif', 90), x('trapbar', 3, '3', 'RPE 8', 180),
      x('chinup', 3, 'max', 'Propre', 20, 'A'), x('nordic', 3, '5-6', 'Contrôlé', 75, 'A'),
      x('farmer', 3, '30m', 'Lourd', 60)];
  }
  return [];
}

// Séance du programme pour un contexte { phase, week, deload }
export function buildSession(type, ctx) {
  const short = type === 'L' || type === 'R';
  // A/B/C choisies pendant la récupération → version Fondation semaine 1
  const early = ['recup', 'reprise'].includes(ctx.phase) && 'ABC'.includes(type);
  const items = main(type, early ? 'fond' : ctx.phase, early ? 1 : ctx.week)
    .map(it => ({ ...it, sets: ctx.deload ? Math.max(2, it.sets - 1) : it.sets }));
  return {
    type, name: ROUTINES[type].name, min: ROUTINES[type].min, items,
    warm: short ? WARMUP_SHORT : WARMUP,
    cool: (COOL[type] || COOL.L).map(id => ({ id, reps: '2 × 40 s' })),
  };
}

// ---------- Calendrier ----------
export const PHASES = [
  { key: 'recup',   name: 'Récupération', start: '2026-10-12', end: '2026-10-18', desc: 'Marche, mobilité douce, rien de lourd pour les jambes.' },
  { key: 'reprise', name: 'Reprise',      start: '2026-10-19', end: '2026-10-25', desc: '2 séances légères pour reprendre l’habitude, sans sauts.' },
  { key: 'fond',    name: 'Fondation',    start: '2026-10-26', end: '2026-11-22', desc: 'Apprendre les mouvements et construire la base.' },
  { key: 'force',   name: 'Force',        start: '2026-11-23', end: '2026-12-20', desc: 'Charges plus lourdes, sprints, changements de direction.' },
  { key: 'fetes',   name: 'Pause',        start: '2026-12-21', end: '2027-01-03', desc: 'Séances libres et alimentation de maintien.' },
  { key: 'puiss',   name: 'Puissance',    start: '2027-01-04', end: '2027-01-31', desc: 'Lourd et explosif enchaînés, vitesse et agilité.' },
];
// Ensuite : alternance Force (4 sem.) / Puissance (4 sem.), 4e semaine allégée
export const CYCLE_START = '2027-02-01';

export function phaseInfo(date, prof) {
  let info;
  if (date >= CYCLE_START) {
    const n = Math.floor(diffDays(CYCLE_START, date) / 7);
    const key = Math.floor(n / 4) % 2 === 0 ? 'force' : 'puiss';
    const week = (n % 4) + 1;
    const start = addDays(CYCLE_START, Math.floor(n / 4) * 28);
    info = { key, name: key === 'force' ? 'Force' : 'Puissance', week, weeks: 4, deload: week === 4, start, end: addDays(start, 27) };
  } else {
    const p = PHASES.find(p => date >= p.start && date <= p.end) || PHASES[0];
    const week = Math.max(1, Math.floor(diffDays(p.start, mondayOf(date)) / 7) + 1);
    const weeks = (diffDays(p.start, p.end) + 1) / 7;
    info = { key: p.key, name: p.name, week, weeks, deload: (p.key === 'fond' || p.key === 'puiss') && week === 4, start: p.start, end: p.end };
  }
  const mon = mondayOf(date);
  const ov = prof.overrides?.[mon];
  const busy = (prof.lightWeeks || []).includes(mon);
  let light = info.key === 'reprise' || info.key === 'fetes' || busy;
  if (ov === 'light') light = true;
  if (ov === 'normal' && !['recup', 'reprise', 'fetes'].includes(info.key)) light = false;
  return { ...info, light, busy, phase: info.key === 'fetes' ? 'force' : info.key, monday: mon };
}

export const ctxOf = info => ({
  phase: info.light && info.key === 'reprise' ? 'reprise' : info.phase,
  week: info.week, deload: info.deload && !info.light,
});

// Ce qui est prévu un jour donné : séance du programme, course
export function dayPlan(date, prof) {
  const info = phaseInfo(date, prof);
  const dow = parse(date).getDay();
  const d = prof.days;
  let gym = null;
  if (info.key === 'recup') gym = dow === d.C && date >= '2026-10-15' ? 'R' : null;
  else if (info.light) gym = dow === d.A || dow === d.C ? 'L' : null;
  else gym = dow === d.A ? 'A' : dow === d.B ? 'B' : dow === d.C ? 'C' : null;
  let run = null;
  if (info.key !== 'recup' && date >= '2026-10-25') {
    if (dow === 0) run = 'main';
    else if (dow === 2 && info.key !== 'reprise') run = 'option';
  }
  const optional = info.key === 'fetes' || gym === 'R';
  return { date, info, gym, run, optional };
}

// Semaines de tests (lundis)
export function testMondays(until) {
  const out = ['2026-10-26', '2026-11-23', '2027-01-04'];
  for (let m = CYCLE_START; m <= until; m = addDays(m, 28)) out.push(m);
  return out;
}

export const TESTS = [
  { k: 'vert', n: 'Saut vertical', u: 'cm', up: true, how: 'Marque au mur bras tendu, puis saut : la différence.' },
  { k: 'broad', n: 'Saut en longueur', u: 'cm', up: true, how: 'Meilleur de 3, sans élan.' },
  { k: 'sprint', n: 'Sprint 20 m', u: 's', up: false, how: 'Vidéo au téléphone, départ arrêté.' },
  { k: 'reach', n: 'Doigts-orteils', u: 'cm', up: true, how: 'Debout, jambes tendues. Négatif si tu n’atteins pas tes orteils.' },
  { k: 'squat', n: 'Squat profond tenu', u: 's', up: true, how: 'Talons au sol, sans te tenir.' },
  { k: 'push', n: 'Pompes max', u: '', up: true, how: 'Propres, poitrine près du sol.' },
  { k: 'pull', n: 'Tractions max', u: '', up: true, how: 'Bras tendus en bas, menton au-dessus.' },
  { k: 'waist', n: 'Tour de taille', u: 'cm', up: false, how: 'Ruban au nombril, ventre relâché.' },
];
