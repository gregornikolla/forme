// Programme « Recomposition athlétique » : séances par phase, échauffements, calendrier.
import { parse, addDays, diffDays, mondayOf } from './util.js';

export const PROGRAM = {
  name: 'Recomposition athlétique',
  tagline: 'Perdre du gras, gagner du muscle, devenir explosif et plus souple.',
  perWeek: 3,
};

// ---------- Échauffement, retour au calme, souplesse ----------
// Échauffement : général → dynamique → spécifique (les séries d'approche se font sur le 1er exercice).
// Pas d'étirement statique long avant de forcer : il réduit un peu la force et la détente (Behm 2016).
// reps : texte affiché ; sec : durée (minuteur)
const WARM = {
  lower: [
    { id: 'bike', reps: '3 min', sec: 180 }, { id: 'leg_swings', reps: '10 / côté' }, { id: 'wgs', reps: '4 / côté' },
    { id: 'cossack', reps: '5 / côté' }, { id: 'ankle', reps: '10 / côté' }, { id: 'hip_9090', reps: '6 / côté' },
  ],
  upper: [
    { id: 'bike', reps: '3 min', sec: 180 }, { id: 'cat_cow', reps: '8 reps' }, { id: 'open_book', reps: '6 / côté' },
    { id: 'band_pull', reps: '2 × 15' }, { id: 'wgs', reps: '3 / côté' },
  ],
  sprint: [
    { id: 'bike', reps: '3 min', sec: 180 }, { id: 'leg_swings', reps: '10 / côté' }, { id: 'wgs', reps: '4 / côté' },
    { id: 'ankle', reps: '10 / côté' }, { id: 'a_skip', reps: '2 × 20 m' }, { id: 'strides', reps: '3 × 50 m' },
  ],
  short: [
    { id: 'bike', reps: '2 min', sec: 120 }, { id: 'leg_swings', reps: '10 / côté' }, { id: 'wgs', reps: '4 / côté' },
    { id: 'cossack', reps: '5 / côté' }, { id: 'band_pull', reps: '15 reps' },
  ],
};
const WARM_OF = { A: 'lower', B: 'upper', C: 'sprint', L: 'short', R: 'upper' };
// Étirements statiques après la séance, sur les zones visées par tes tests de souplesse
const COOL = {
  A: ['fold', 'couch', 'frog'],
  B: ['pec', 'lat_stretch', 'thread'],
  C: ['fold', 'pigeon', 'calf_wall'],
  L: ['fold', 'couch', 'pec'],
  R: ['pec', 'lat_stretch'],
};
// Routine guidée des jours sans gym. Gains de souplesse : au moins 5 min d'étirement
// par muscle et par semaine (Thomas 2018) → 2 à 3 fois par semaine, en plus des retours au calme.
export const MOBILITY = {
  name: 'Souplesse',
  desc: 'Ischios, hanches, adducteurs, chevilles et épaules. 2 à 3 fois par semaine.',
  steps: [
    { id: 'pike_pnf', hold: 80 },
    { id: 'couch', hold: 60, sides: true },
    { id: 'pigeon', hold: 45, sides: true },
    { id: 'frog', hold: 60 },
    { id: 'deep_squat', hold: 60 },
    { id: 'calf_wall', hold: 45, sides: true },
    { id: 'lat_stretch', hold: 45 },
    { id: 'pec', hold: 45, sides: true },
  ],
};

// Principes du programme (affichés dans Programme)
export const PRINCIPLES = [
  ['Puissance en premier', 'Sauts, lancers et sprints au début de la séance, quand tu es frais : la qualité de chaque répétition compte plus que la fatigue.'],
  ['Force et puissance ensemble', 'Lourd (3–8 reps) et rapide (sauts, charges légères) se complètent : c’est la combinaison qui améliore le plus la détente et le sprint (Cormie 2011).'],
  ['Assez de volume pour le muscle', 'Environ 10 séries par muscle et par semaine, proches de l’échec (1 à 3 reps en réserve), amplitude complète (Schoenfeld 2017).'],
  ['Les muscles étirés grandissent mieux', 'Les exercices qui chargent le muscle en position longue (RDL, leg curl assis, extension triceps au-dessus de la tête, pause en bas aux mollets) donnent plus de résultats (Maeo 2021, 2023).'],
  ['Progression double', 'Même charge jusqu’à réussir le haut de la fourchette de reps sur toutes les séries, puis on ajoute du poids.'],
  ['Prévention qui a fait ses preuves', 'Nordic curl pour les ischios et Copenhagen pour l’aine : deux exercices qui réduisent les blessures dans des essais randomisés.'],
  ['Souplesse', 'Au moins 5 min d’étirement par muscle et par semaine (Thomas 2018). Le statique et le contracter-relâcher fonctionnent tous les deux, et la musculation en amplitude complète améliore aussi la souplesse (Afonso 2021).'],
  ['Semaines allégées', 'Environ un tiers du volume suffit pour garder ta force pendant les examens (Spiering 2021).'],
];

// ---------- Séances ----------
// x(id, séries, reps, effort, repos (s), superset)
const x = (id, sets, reps, rpe = '', rest = 90, ss = '') => ({ id, sets, reps, rpe, rest, ss });

export const ROUTINES = {
  A: { name: 'Bas du corps + puissance', min: 75 },
  B: { name: 'Haut du corps', min: 70 },
  C: { name: 'Vitesse + corps complet', min: 75 },
  L: { name: 'Corps complet express', min: 45 },
  R: { name: 'Haut du corps léger', min: 45 },
};

function main(type, phase, week) {
  if (type === 'R') return [
    x('db_bench', 3, '10', 'RPE 6', 90), x('lat_pulldown', 3, '10', 'RPE 6', 90),
    x('cable_row', 3, '12', 'RPE 6', 60, 'A'), x('lat_raise', 2, '15', 'RPE 6', 60, 'A'),
    x('face_pull', 2, '15', 'RPE 6', 60)];

  // Maintien : 1 série lourde par mouvement suffit presque, on en garde 2–3 (Spiering 2021)
  if (type === 'L') {
    const early = phase === 'recup' || phase === 'reprise' || (phase === 'fond' && week <= 2);
    const rpe = phase === 'reprise' ? 'RPE 6' : 'RPE 7';
    return [
      x(early ? 'goblet_squat' : 'back_squat', 3, '5', rpe, 150),
      x(early ? 'db_bench' : 'bench', 3, '5', rpe, 150),
      x('rdl', 3, '8', rpe, 20, 'A'), x('pullup', 3, '6-8', rpe, 90, 'A'),
      x('bulgarian', 2, '8/jambe', rpe, 20, 'B'), x('db_row', 2, '10', rpe, 75, 'B')];
  }

  // Fondation : apprendre les mouvements, volume pour le muscle, préparer tendons et ischios
  if (phase === 'fond') {
    if (type === 'A') return [
      x('pogo', 3, '15s', 'Rapide', 60), x('cmj', 3, '5', 'Explosif', 75),
      x(week <= 2 ? 'goblet_squat' : 'back_squat', 3, '6-8', 'RPE 7', 150), x('rdl', 3, '8-10', 'RPE 7', 120),
      x('bulgarian', 3, '8-10/jambe', 'RPE 8', 20, 'A'), x('seated_leg_curl', 3, '10-12', 'RPE 8', 75, 'A'),
      x('calf', 3, '10-15', 'RPE 8', 20, 'B'), x('hanging_raise', 3, '8-12', 'RPE 8', 60, 'B')];
    if (type === 'B') return [
      x('mb_rot', 3, '5/côté', 'Explosif', 60),
      x('bench', 3, '6-8', 'RPE 7', 150), x('pullup', 3, '6-8', 'RPE 7', 120),
      x('incline_db', 3, '8-12', 'RPE 8', 20, 'A'), x('cable_row', 3, '10-12', 'RPE 8', 75, 'A'),
      x('lat_raise', 3, '12-15', 'RPE 8', 20, 'B'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'B'),
      x('incline_curl', 3, '10-12', 'RPE 8', 20, 'C'), x('tri_overhead', 3, '10-12', 'RPE 8', 60, 'C')];
    if (type === 'C') return [
      x('sprint_acc', 5, '15m', '90 %', 90), x('broad_jump', 3, '4', 'Explosif', 75), x('lateral_bound', 2, '4/côté', 'Explosif', 60),
      x('trapbar', 3, '5-6', 'RPE 7', 150), x('ohp', 3, '6-8', 'RPE 7', 120),
      x('chinup', 3, '6-10', 'RPE 8', 20, 'A'), x('dips_chest', 3, '8-12', 'RPE 8', 75, 'A'),
      x('nordic', 2, '4-6', 'Contrôlé', 20, 'B'), x('copenhagen', 2, '6/côté', 'Contrôlé', 60, 'B')];
  }

  // Force : charges lourdes, sprints plus rapides, pliométrie réactive basse
  if (phase === 'force') {
    if (type === 'A') return [
      x('drop_jump', 3, '5', 'Réactif', 75), x('hurdle_hops', 3, '4', 'Explosif', 75),
      x('back_squat', 4, '4-6', 'RPE 8', 180), x('rdl', 3, '6-8', 'RPE 8', 150),
      x('bulgarian', 3, '6-8/jambe', 'RPE 8', 20, 'A'), x('seated_leg_curl', 3, '8-10', 'RPE 8', 75, 'A'),
      x('calf', 3, '8-12', 'RPE 8', 20, 'B'), x('hanging_raise', 3, '10-12', 'RPE 8', 60, 'B')];
    if (type === 'B') return [
      x('mb_rot', 3, '5/côté', 'Explosif', 60),
      x('bench', 4, '4-6', 'RPE 8', 180), x('pullup', 4, '4-6', 'RPE 8', 150),
      x('incline_db', 3, '8-10', 'RPE 8', 20, 'A'), x('cable_row', 3, '8-10', 'RPE 8', 75, 'A'),
      x('lat_raise', 3, '12-15', 'RPE 8', 20, 'B'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'B'),
      x('incline_curl', 3, '8-12', 'RPE 8', 20, 'C'), x('tri_overhead', 3, '8-12', 'RPE 8', 60, 'C')];
    if (type === 'C') return [
      x('sprint_20', 5, '20m', '95 %', 120), x('cod', 4, '1', 'Vif', 90),
      x('trapbar', 4, '3-5', 'RPE 8', 180), x('ohp', 3, '5-6', 'RPE 8', 150),
      x('chinup', 3, '5-8', 'RPE 8', 20, 'A'), x('dips_chest', 3, '6-10', 'RPE 8', 75, 'A'),
      x('nordic', 3, '5', 'Contrôlé', 20, 'B'), x('copenhagen', 3, '8/côté', 'Contrôlé', 60, 'B')];
  }

  // Puissance : pliométrie haute, sauts chargés, vitesse maximale ; on garde le lourd
  if (phase === 'puiss') {
    if (type === 'A') return [
      x('depth_jump', 3, '4', 'Réactif', 90), x('trapbar_jump', 4, '4', 'Explosif', 120),
      x('back_squat', 4, '3', 'RPE 8', 180), x('rdl', 3, '6', 'RPE 8', 150),
      x('bulgarian', 3, '6/jambe', 'RPE 8', 20, 'A'), x('seated_leg_curl', 3, '8', 'RPE 8', 75, 'A'),
      x('calf', 3, '8-10', 'RPE 8', 20, 'B'), x('hanging_raise', 3, '10-12', 'RPE 8', 60, 'B')];
    if (type === 'B') return [
      x('mb_chest', 3, '5', 'Explosif', 60), x('mb_rot', 3, '4/côté', 'Explosif', 60),
      x('bench', 4, '3-5', 'RPE 8', 180), x('pullup', 4, '4-6', 'RPE 8', 150),
      x('incline_db', 3, '6-8', 'RPE 8', 20, 'A'), x('cable_row', 3, '8-10', 'RPE 8', 75, 'A'),
      x('lat_raise', 3, '12-15', 'RPE 8', 20, 'B'), x('face_pull', 3, '12-15', 'RPE 8', 60, 'B'),
      x('incline_curl', 2, '8-12', 'RPE 8', 20, 'C'), x('tri_overhead', 2, '8-12', 'RPE 8', 60, 'C')];
    if (type === 'C') return [
      x('sprint_fly', 4, '20m', 'Max', 180), x('cod', 4, '1', 'Vif', 90), x('lateral_bound', 3, '4/côté', 'Explosif', 60),
      x('trapbar', 3, '3', 'RPE 8', 180), x('push_press', 3, '3-5', 'Explosif', 150),
      x('chinup', 3, '5-8', 'RPE 8', 20, 'A'), x('dips_chest', 3, '6-10', 'RPE 8', 75, 'A'),
      x('nordic', 3, '5', 'Contrôlé', 20, 'B'), x('copenhagen', 3, '8/côté', 'Contrôlé', 60, 'B')];
  }
  return [];
}

// Séance du programme pour un contexte { phase, week, deload }
export function buildSession(type, ctx) {
  // A/B/C choisies pendant la récupération → version Fondation semaine 1
  const early = ['recup', 'reprise'].includes(ctx.phase) && 'ABC'.includes(type);
  const items = main(type, early ? 'fond' : ctx.phase, early ? 1 : ctx.week)
    .map(it => ({ ...it, sets: ctx.deload ? Math.max(2, it.sets - 1) : it.sets }));
  return {
    type, name: ROUTINES[type].name, min: ROUTINES[type].min, items,
    warm: WARM[WARM_OF[type]],
    cool: (COOL[type] || COOL.L).map(id => ({ id, reps: '2 × 45 s' })),
  };
}

// ---------- Calendrier ----------
export const PHASES = [
  { key: 'recup',   name: 'Récupération', start: '2026-10-12', end: '2026-10-18', desc: 'Marche, mobilité douce, rien de lourd pour les jambes.' },
  { key: 'reprise', name: 'Reprise',      start: '2026-10-19', end: '2026-10-25', desc: '2 séances légères pour reprendre l’habitude, sans sauts.' },
  { key: 'fond',    name: 'Fondation',    start: '2026-10-26', end: '2026-11-22', desc: 'Apprendre les mouvements et construire la base.' },
  { key: 'force',   name: 'Force',        start: '2026-11-23', end: '2026-12-20', desc: 'Charges plus lourdes, pliométrie réactive, sprints et changements de direction.' },
  { key: 'fetes',   name: 'Pause',        start: '2026-12-21', end: '2027-01-03', desc: 'Séances libres et alimentation de maintien.' },
  { key: 'puiss',   name: 'Puissance',    start: '2027-01-04', end: '2027-01-31', desc: 'Sauts plus hauts, sauts avec charge, vitesse maximale. Le lourd reste.' },
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
