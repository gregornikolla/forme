// Données locales (localStorage) + migration depuis la v1
import { EX } from './exercises.js';
import { uid, parse } from './util.js';

const KEY = 'forme.v2';
const OLD = 'forme.v1';
const LB = 2.20462;

export const DEFAULT_HABITS = [
  { k: 'prot', n: 'Protéines à chaque repas' },
  { k: 'steps', n: '8 000 pas' },
  { k: 'mob', n: 'Mobilité' },
  { k: 'snack', n: 'Pas de grignotage' },
];
export const GOALS = [
  { k: 'fat', n: 'Perdre du gras' },
  { k: 'muscle', n: 'Gagner du muscle' },
  { k: 'power', n: 'Être plus explosif' },
  { k: 'mob', n: 'Être plus souple' },
];

const fresh = () => ({
  v: 2,
  profile: {
    name: '', onboarded: false, unit: 'kg', theme: 'auto',
    startWeight: 92, targetWeight: 85, goals: ['fat', 'muscle', 'power', 'mob'],
    days: { A: 1, B: 3, C: 4 }, overrides: {}, lightWeeks: ['2026-12-07', '2026-12-14'],
    habits: DEFAULT_HABITS, since: null,
  },
  workouts: {}, active: null, routines: {}, custom: {},
  body: {}, habits: {}, tests: {}, mob: {}, runs: {},
});

function migrate(old) {
  const db = fresh();
  const st = old.settings || {};
  Object.assign(db.profile, {
    unit: st.unit || 'kg', startWeight: st.startWeight ?? 92, targetWeight: st.targetWeight ?? 85,
    days: st.days || db.profile.days, overrides: st.overrides || {},
  });
  const toKg = v => (v === '' || v == null) ? '' : st.unit === 'lb' ? +v / LB : +v;
  for (const [d, h] of Object.entries(old.habits || {})) {
    const { weight, waist, run, ...flags } = h;
    if (weight > 0) db.body[d] = { weight: st.unit === 'lb' ? weight / LB : weight };
    if (waist) (db.body[d] ||= {}).waist = waist;
    if (run) db.runs[d] = true;
    const f = Object.fromEntries(Object.entries(flags).filter(([, v]) => v === true));
    if (Object.keys(f).length) db.habits[d] = f;
  }
  db.tests = old.tests || {};
  db.mob = old.mob || {};
  const NAMES = { A: 'Bas du corps + puissance', B: 'Haut du corps', C: 'Athlétique', L: 'Corps complet express', R: 'Haut du corps léger' };
  for (const s of Object.values(old.sessions || {})) {
    if (!s.endedAt) continue;
    const ex = Object.entries(s.items || {}).filter(([id]) => EX[id] && EX[id].eq !== 'mob').map(([id, sets]) => ({
      uid: uid(), id, note: '', rest: 90,
      sets: sets.filter(x => x.done).map(x => ({ k: 'n', w: toKg(x.w), r: x.r ?? '', done: true })),
    })).filter(x => x.sets.length);
    const id = uid();
    db.workouts[id] = { id, name: NAMES[s.type] || 'Séance', type: s.type, kind: 'program', date: s.date,
      start: s.startedAt || +parse(s.date), end: s.endedAt, ex, prs: [] };
  }
  db.profile.since = Object.values(db.workouts).map(w => w.date).sort()[0] || null;
  return db;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    const old = localStorage.getItem(OLD);
    if (old) return migrate(JSON.parse(old));
  } catch (e) { console.error(e); }
  return fresh();
}

export let db = load();
// Complète les champs manquants (nouvelles versions)
function normalize() {
  const f = fresh();
  db.profile = { ...f.profile, ...db.profile };
  for (const k of Object.keys(f)) if (db[k] === undefined) db[k] = f[k];
}
normalize();

let failed = false;
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); failed = false; }
  catch (e) { if (!failed) alertSave(e); failed = true; }
}
let alertSave = () => {};
export const onSaveError = fn => { alertSave = fn; };
export function replaceDb(d) {
  if (d.v === 2 && d.profile && d.workouts) db = d;
  else if (d.settings && d.sessions) db = migrate(d);
  else throw new Error('fichier non reconnu');
  normalize(); save();
}
export function resetDb() { db = fresh(); save(); }
if (navigator.storage?.persist) navigator.storage.persist();

// ---------- Unités (stockage en kg) ----------
export const unit = () => db.profile.unit;
export const toDisp = kg => (kg === '' || kg == null) ? '' : unit() === 'lb' ? kg * LB : kg;
export const fromDisp = v => (v === '' || v == null || isNaN(v)) ? '' : unit() === 'lb' ? v / LB : +v;
// Arrondi d'affichage : 0,25 kg / 0,5 lb
export const roundDisp = v => v === '' ? '' : unit() === 'lb' ? Math.round(v * 2) / 2 : Math.round(v * 4) / 4;

export const exOf = id => EX[id] || db.custom[id] || { n: 'Exercice supprimé', eq: 'other', mu: [], mu2: [], lt: 'wr', cues: [], cat: 'force' };
export const allEx = () => ({ ...EX, ...db.custom });
