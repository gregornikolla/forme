import { EX, HOME, buildSession, titleOf, PHASES, CYCLE_START, EXAM_WEEKS, DESC } from './data.js';

// ================= Dates =================
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const mondayOf = s => addDays(s, -((parse(s).getDay() + 6) % 7));
const DATE_OVERRIDE = new URLSearchParams(location.search).get('date');
const today = () => DATE_OVERRIDE || ymd(new Date());
const fmtDay = s => parse(s).toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = s => parse(s).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const DOW = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// ================= Stockage =================
const KEY = 'forme.v1';
const DEFAULT = {
  v: 1,
  settings: { unit: 'kg', startWeight: 92, targetWeight: 85, days: { A: 1, B: 3, C: 4 }, overrides: {} },
  sessions: {}, habits: {}, tests: {}, mob: {},
};
let db;
try { db = JSON.parse(localStorage.getItem(KEY)) || structuredClone(DEFAULT); }
catch { db = structuredClone(DEFAULT); }
db.settings = { ...DEFAULT.settings, ...db.settings };
for (const k of ['sessions', 'habits', 'tests', 'mob']) db[k] ||= {};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Sauvegarde impossible : ' + e.message); } };
if (navigator.storage?.persist) navigator.storage.persist();

// ================= Plan =================
function phaseInfo(date) {
  if (date >= CYCLE_START) {
    const n = Math.floor(diffDays(CYCLE_START, date) / 7);
    const key = Math.floor(n / 4) % 2 === 0 ? 'force' : 'puiss';
    const week = (n % 4) + 1;
    return finish({ key, name: key === 'force' ? 'Force' : 'Puissance', week, weeks: 4, deload: week === 4 }, date);
  }
  const p = PHASES.find(p => date >= p.start && date <= p.end) || PHASES[0];
  const week = Math.floor(diffDays(p.start, mondayOf(date)) / 7) + 1;
  const weeks = (diffDays(p.start, p.end) + 1) / 7;
  const deload = (p.key === 'fond' || p.key === 'puiss') && week === 4;
  return finish({ key: p.key, name: p.name, week: Math.max(1, week), weeks, deload }, date);
}
function finish(info, date) {
  const mon = mondayOf(date);
  const ov = db.settings.overrides[mon];
  let light = info.key === 'reprise' || info.key === 'fetes' || EXAM_WEEKS.includes(mon);
  if (ov === 'light') light = true;
  if (ov === 'normal' && !['recup', 'reprise', 'fetes'].includes(info.key)) light = false;
  const phase = info.key === 'fetes' ? 'force' : info.key;
  return { ...info, light, exam: EXAM_WEEKS.includes(mon), phase, monday: mon };
}
function dayPlan(date) {
  const info = phaseInfo(date);
  const dow = parse(date).getDay();
  const d = db.settings.days;
  let gym = null;
  if (info.key === 'recup') gym = dow === 4 && date >= '2026-10-15' ? 'R' : null;
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
function ctxOf(info) { return { phase: info.light && info.key === 'reprise' ? 'reprise' : info.phase, week: info.week, deload: info.deload && !info.light }; }
function testMondays() {
  const out = ['2026-10-26', '2026-11-23', '2027-01-04'];
  for (let m = CYCLE_START; m <= addDays(today(), 60); m = addDays(m, 28)) out.push(m);
  return out;
}
const isTestWeek = date => testMondays().includes(mondayOf(date));
const nextTest = () => testMondays().find(m => addDays(m, 6) >= today());

// ================= Exercices : suggestions =================
const INC = {
  kg: { bb_low: 5, bb_up: 2.5, db: 2, cable: 2.5, machine: 5, bwl: 2.5 },
  lb: { bb_low: 10, bb_up: 5, db: 5, cable: 5, machine: 10, bwl: 5 },
};
function parseReps(s) {
  let m;
  if ((m = s.match(/^(\d+)s(\/côté)?$/))) return { kind: 'time', sec: +m[1], side: !!m[2] };
  if ((m = s.match(/^(\d+)min$/))) return { kind: 'time', sec: +m[1] * 60 };
  if ((m = s.match(/^(\d+)m$/))) return { kind: 'dist', m: +m[1] };
  if (s === 'max') return { kind: 'max' };
  if ((m = s.match(/^(\d+)(?:-(\d+))?(\/\S+)?$/))) return { kind: 'reps', min: +m[1], max: +(m[2] || m[1]), side: m[3] || '' };
  return { kind: 'text' };
}
const needsW = (ex, spec) => !['bw', 'mob'].includes(ex.eq) && spec.kind !== 'time';
const needsR = (ex, spec) => (spec.kind === 'reps' && ex.eq !== 'mob') || spec.kind === 'max';
const repsLabel = (reps, spec) => spec.kind === 'reps' ? reps.replace('-', '–') :
  spec.kind === 'time' ? (spec.sec >= 60 ? spec.sec / 60 + ' min' : spec.sec + ' s') + (spec.side ? '/côté' : '') :
  spec.kind === 'dist' ? spec.m + ' m' : spec.kind === 'max' ? 'max' : reps;
const fmtRest = s => s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)}` : `${s} s`;
const U = () => db.settings.unit;

function sortedSessions() { return Object.values(db.sessions).sort((a, b) => (a.date + a.type).localeCompare(b.date + b.type)); }
function lastPerf(id, beforeDate) {
  const list = sortedSessions().filter(s => s.date < beforeDate).reverse();
  for (const s of list) {
    const sets = (s.items[id] || []).filter(x => x.done);
    if (sets.length) return { date: s.date, sets };
  }
  return null;
}
function suggest(item, spec, ex, deload, date) {
  const last = lastPerf(item.id, date);
  const wantsW = needsW(ex, spec);
  if (!last) return {
    w: ex.eq === 'bwl' ? 0 : '', r: spec.kind === 'reps' ? spec.max : '', first: true,
    hint: wantsW ? (ex.start || 'Première fois : choisis une charge où il te reste environ 3 reps en réserve (RPE 7).') : '',
  };
  const s0 = last.sets[0];
  const prev = last.sets.map(s => (wantsW && s.w !== '' ? `${s.w}×` : '') + (s.r ?? '✓')).join(', ');
  const when = fmtShort(last.date);
  if (spec.kind === 'max') {
    const best = Math.max(...last.sets.map(s => +s.r || 0));
    return { w: s0.w ?? 0, r: best, hint: `Dernière fois (${when}) : ${prev}. Essaie de battre ${best}.` };
  }
  if (spec.kind !== 'reps' || !wantsW) return { w: s0.w ?? '', r: spec.max ?? '', hint: `Dernière fois (${when}) : ${prev}.` };
  const w0 = +s0.w || 0;
  const reps = last.sets.map(s => +s.r || 0);
  const allHit = last.sets.length >= item.sets && reps.every(r => r >= spec.max);
  if (deload) return { w: w0, r: spec.min, hint: `Semaine d’allègement : même charge (${w0} ${U()}), sans forcer.` };
  if (allHit) {
    const inc = INC[U()][ex.eq] || 2.5;
    return { w: +(w0 + inc).toFixed(1), r: spec.min, up: true, hint: `↑ ${prev} la dernière fois (${when}) : toutes les reps réussies, +${inc} ${U()}.` };
  }
  const target = Math.min(spec.max, Math.max(spec.min, Math.min(...reps) + 1));
  return { w: w0, r: target, hint: `Dernière fois (${when}) : ${prev}. Même charge, vise une rep de plus.` };
}

// ================= UI helpers =================
const $ = s => document.querySelector(s);
const view = () => $('#view');
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}
const imgUrl = (id, n) => `img/${id}/${n}.jpg`;
function media(ex) {
  if (!ex.img) return '';
  return `<div class="media" data-anim><img src="${imgUrl(ex.img, 0)}" alt="" loading="lazy"><img src="${imgUrl(ex.img, 1)}" alt="" loading="lazy"></div>`;
}
function howTo(ex, open) {
  const yt = ex.yt ? `<a class="yt" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}" target="_blank" rel="noopener">▶ Voir une vidéo</a>` : '';
  return `<details class="how"${open ? ' open' : ''}><summary>Comment faire</summary>${media(ex)}
    <ol>${ex.cues.map(c => `<li>${c}</li>`).join('')}</ol>${ex.note ? `<p class="muted">${ex.note}</p>` : ''}${yt}</details>`;
}
setInterval(() => document.querySelectorAll('[data-anim]').forEach(m => m.classList.toggle('alt')), 1100);

function bar(pct) { return `<div class="bar"><span style="width:${Math.max(0, Math.min(100, pct)).toFixed(0)}%"></span></div>`; }

// Graphique SVG simple : séries [{pts:[{t,v}], cls, dots}], ligne cible optionnelle
function chart(series, { h = 150, target = null, unit = '' } = {}) {
  const all = series.flatMap(s => s.pts);
  if (all.length < 2) return `<p class="muted">Pas encore assez de données pour un graphique.</p>`;
  const W = 340, H = h, L = 34, R = 8, T = 10, B = 20;
  let t0 = Math.min(...all.map(p => p.t)), t1 = Math.max(...all.map(p => p.t));
  if (t1 === t0) t1 = t0 + 864e5;
  const vals = all.map(p => p.v).concat(target != null ? [target] : []);
  let v0 = Math.min(...vals), v1 = Math.max(...vals);
  const padV = (v1 - v0) * 0.1 || 1; v0 -= padV; v1 += padV;
  const X = t => L + (t - t0) / (t1 - t0) * (W - L - R);
  const Y = v => T + (1 - (v - v0) / (v1 - v0)) * (H - T - B);
  const lines = series.map(s => {
    const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
    const dots = s.dots ? s.pts.map(p => `<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.6"/>`).join('') : '';
    return `<g class="${s.cls}">${s.line === false ? '' : `<path d="${d}"/>`}${dots}</g>`;
  }).join('');
  const tgt = target != null ? `<line class="target" x1="${L}" x2="${W - R}" y1="${Y(target)}" y2="${Y(target)}"/><text class="lbl" x="${W - R}" y="${Y(target) - 4}" text-anchor="end">cible ${target}${unit}</text>` : '';
  const fmt = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
  const d0 = new Date(t0), d1 = new Date(t1);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">
    <text class="lbl" x="2" y="${T + 8}">${fmt(v1 - padV)}</text><text class="lbl" x="2" y="${H - B}">${fmt(v0 + padV)}</text>
    <text class="lbl" x="${L}" y="${H - 4}">${fmtShort(ymd(d0))}</text><text class="lbl" x="${W - R}" y="${H - 4}" text-anchor="end">${fmtShort(ymd(d1))}</text>
    ${tgt}${lines}</svg>`;
}

// ================= Poids =================
function weights() {
  return Object.entries(db.habits).filter(([, h]) => h.weight > 0).map(([d, h]) => ({ d, v: +h.weight })).sort((a, b) => a.d.localeCompare(b.d));
}
function avg7(date, ws = weights()) {
  const from = addDays(date, -6);
  const w = ws.filter(x => x.d >= from && x.d <= date);
  return w.length ? w.reduce((s, x) => s + x.v, 0) / w.length : null;
}
function eta(ws) {
  const recent = ws.filter(x => x.d >= addDays(today(), -28));
  if (recent.length < 5 || diffDays(recent[0].d, recent.at(-1).d) < 10) return null;
  const xs = recent.map(x => diffDays(recent[0].d, x.d)), ys = recent.map(x => x.v);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const cur = avg7(today(), ws);
  const tgt = db.settings.targetWeight;
  if (cur <= tgt) return { done: true, slope };
  if (!(slope < -0.005)) return { slope };
  return { slope, date: addDays(today(), Math.round((cur - tgt) / -slope)) };
}

// ================= Semaine / série =================
function weekStatus(mon) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), p = dayPlan(d);
    const done = Object.values(db.sessions).filter(s => s.date === d && s.endedAt);
    days.push({ d, p, done, mob: !!db.mob[d] || !!db.habits[d]?.mob });
  }
  const planned = days.filter(x => x.p.gym && !x.p.optional).length;
  const doneN = days.reduce((n, x) => n + x.done.length, 0);
  return { days, planned, doneN };
}
function streak() {
  let n = 0, mon = mondayOf(today());
  for (let k = 0; k < 120; k++, mon = addDays(mon, -7)) {
    if (mon < '2026-10-12') break;
    const w = weekStatus(mon);
    if (w.planned === 0) continue;
    if (w.doneN >= w.planned) n++;
    else if (k === 0) continue;
    else break;
  }
  return n;
}

// ================= Habitudes =================
const HABITS = [
  { k: 'prot', n: 'Protéines à chaque repas' },
  { k: 'steps', n: '8 000 pas' },
  { k: 'mob', n: 'Mobilité' },
  { k: 'snack', n: 'Pas de grignotage' },
];
const hab = d => (db.habits[d] ||= {});

// ================= Vues =================
const routes = { '': home, seance: session, mobilite: mobility, progres: progress, guide, reglages: settings };
function render() {
  const [r, arg] = location.hash.replace(/^#\/?/, '').split('/');
  const fn = routes[r] || home;
  stopPlayer(false);
  view().innerHTML = fn(arg);
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + (r || '')));
  $('#hdate').textContent = cap(fmtDay(today()));
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

// ---------- Accueil ----------
function home() {
  const t = today(), p = dayPlan(t), info = p.info;
  const ws = weights(), cur = avg7(t, ws), st = db.settings;
  const lost = cur != null ? st.startWeight - cur : 0;
  const pct = lost / (st.startWeight - st.targetWeight) * 100;
  const e = eta(ws);
  const wk = weekStatus(mondayOf(t));
  const todays = Object.values(db.sessions).filter(s => s.date === t);
  const h = db.habits[t] || {};

  let hero;
  if (p.gym) {
    const rec = db.sessions[`${t}_${p.gym}`];
    hero = rec?.endedAt
      ? `<div class="big ok">✓ ${titleOf(p.gym)} faite</div><p class="muted">${dur(rec)}. Bien joué.</p>`
      : `<div class="big">${titleOf(p.gym)}</div>
         <p class="muted">CEPSUM · environ ${p.gym === 'L' ? 45 : p.gym === 'R' ? 45 : 75} min${p.optional ? ' · optionnelle' : ''}${p.gym === 'R' ? ' · seulement si les courbatures sont parties' : ''}</p>
         <a class="btn" href="#/seance">${rec ? 'Continuer' : 'Commencer'} la séance</a>`;
  } else {
    const rest = info.key === 'recup' ? 'Récupération : marche de 20 à 40 min + mobilité douce.' : 'Pas de gym aujourd’hui. Repos actif : marche + mobilité.';
    hero = `<div class="big">${rest}</div><a class="btn" href="#/mobilite">Routine mobilité (12 min)</a>`;
  }
  const extra = todays.filter(s => s.endedAt && s.type !== p.gym).map(s => `<p class="ok">✓ ${titleOf(s.type)} faite</p>`).join('');
  const runCard = p.run ? `<div class="card row between">
      <div><b>Course facile ${p.run === 'option' ? '(optionnelle)' : ''}</b><div class="muted">30–40 min à allure de conversation, ou basket/soccer.${t === '2026-10-25' ? ' Premier footing : 20–25 min max.' : ''}</div></div>
      <button class="chk ${h.run ? 'on' : ''}" data-act="run">✓</button></div>` : '';
  const testCard = isTestWeek(t) && (p.gym === 'C' || (p.gym === 'L' && parse(t).getDay() === st.days.C))
    ? `<div class="card note"><b>Semaine de tests.</b> Après l’échauffement, fais les tests et note-les dans <a href="#/progres">Progrès</a>.</div>` : '';

  const days = wk.days.map(x => {
    const lbl = x.p.gym ? (x.p.gym === 'L' ? 'L' : x.p.gym === 'R' ? 'R' : x.p.gym) : '·';
    const cls = x.done.length ? 'done' : x.p.gym && x.d < t && !x.p.optional ? 'miss' : '';
    return `<div class="day ${cls} ${x.d === t ? 'today' : ''}"><span>${DOW[parse(x.d).getDay()]}</span><b>${x.done.length ? '✓' : lbl}</b><i class="${x.mob ? 'on' : ''}"></i></div>`;
  }).join('');

  const elapsed = Math.min(7, diffDays(mondayOf(t), t) + 1);
  const habStats = HABITS.map(hb => {
    let n = 0; for (let i = 0; i < elapsed; i++) if (db.habits[addDays(mondayOf(t), i)]?.[hb.k]) n++;
    return `<div class="hs"><span>${hb.n}</span>${bar(n / elapsed * 100)}<b>${n}/${elapsed}</b></div>`;
  }).join('');
  const totalDone = Object.values(db.sessions).filter(s => s.endedAt).length;
  const nt = nextTest();

  return `
  <section class="card hero">
    <div class="chips"><span class="chip">${info.name}${info.weeks > 1 ? ` · sem. ${info.week}/${info.weeks}` : ''}</span>
      ${info.deload ? '<span class="chip warn">Allègement</span>' : ''}${info.light && info.exam ? '<span class="chip warn">Examens</span>' : ''}</div>
    ${hero}${extra}
  </section>
  ${runCard}${testCard}
  <section class="card">
    <h3>Aujourd’hui</h3>
    <div class="row wrap">
      <label class="wt">Poids <input type="number" inputmode="decimal" step="0.1" min="40" max="200" data-act="weight" value="${h.weight ?? ''}" placeholder="kg"></label>
      ${HABITS.map(hb => `<button class="pill ${h[hb.k] ? 'on' : ''}" data-act="habit" data-k="${hb.k}">${hb.n}</button>`).join('')}
    </div>
  </section>
  <section class="card">
    <h3>Cette semaine <span class="muted">${wk.doneN}/${wk.planned} séances</span></h3>
    <div class="week">${days}</div>
  </section>
  <section class="grid">
    <div class="tile"><b>${streak()}</b><span>semaine(s) parfaites d’affilée</span></div>
    <div class="tile"><b>${totalDone}</b><span>séances faites</span></div>
    <div class="tile"><b>${cur != null ? cur.toFixed(1).replace('.', ',') : '—'}</b><span>kg, moyenne 7 jours${cur != null ? ` (${lost >= 0 ? '−' : '+'}${Math.abs(lost).toFixed(1).replace('.', ',')})` : ''}</span></div>
    <div class="tile"><b>${e?.done ? '🎯' : e?.date ? fmtShort(e.date) : '—'}</b><span>${e?.done ? 'cible atteinte' : e?.date ? `${st.targetWeight} kg prévu (${(e.slope * 7).toFixed(2).replace('.', ',')} kg/sem.)` : `${st.targetWeight} kg : estimation après ~10 jours de pesées`}</span></div>
  </section>
  <section class="card">
    <h3>Vers ${st.targetWeight} kg</h3>
    ${bar(pct)}
    <p class="muted">${st.startWeight} kg → ${st.targetWeight} kg. Pèse-toi le matin à jeun. Seule la moyenne compte.</p>
    ${chart([{ pts: ws.filter(x => x.d >= addDays(t, -60)).map(x => ({ t: +parse(x.d), v: x.v })), cls: 'raw', dots: true, line: false },
             { pts: ws.filter(x => x.d >= addDays(t, -60)).map(x => ({ t: +parse(x.d), v: avg7(x.d, ws) })), cls: 'avg' }],
      { target: st.targetWeight, unit: ' kg' })}
  </section>
  <section class="card"><h3>Habitudes cette semaine</h3>${habStats}</section>
  ${nt ? `<p class="muted center">Prochains tests : semaine du ${fmtShort(nt)}</p>` : ''}`;
}
const dur = r => r.startedAt && r.endedAt ? `${Math.round((r.endedAt - r.startedAt) / 60000)} min` : '';

// ---------- Séance ----------
function sessionKeyFor(arg) {
  const t = today();
  if (arg) return `${t}_${arg}`;
  if (db.active?.startsWith(t + '_')) return db.active;
  const p = dayPlan(t);
  return p.gym ? `${t}_${p.gym}` : null;
}
function session(arg) {
  const t = today(), p = dayPlan(t), info = p.info;
  const key = sessionKeyFor(arg);
  const picker = `<div class="row wrap picker">${['A', 'B', 'C', 'L'].map(x => `<a class="pill" href="#/seance/${x}">${titleOf(x).replace('Séance ', '')}</a>`).join('')}</div>`;
  if (!key) return `<section class="card"><div class="big">Pas de gym aujourd’hui</div>
    <p class="muted">Profite du repos actif, ou fais la <a href="#/mobilite">routine mobilité</a>. Tu as dû changer de jour ? Choisis une séance :</p>${picker}</section>`;
  const type = key.split('_')[1];
  const ctx = ctxOf(info);
  const S = buildSession(type, ctx);
  const rec = db.sessions[key];
  let n = 0;
  const blocks = S.blocks.map((b, bi) => `<section class="block"><h3>${b.name}</h3>${
    b.kind === 'mob' ? `<div class="card mob">${b.items.map(it => mobRow(it, rec)).join('')}</div>`
      : b.items.map((it, ii) => exCard(it, bi, ii, rec, ctx, ++n)).join('')}</section>`).join('');
  return `
  <section class="card hero">
    <div class="chips"><span class="chip">${info.name}${info.weeks > 1 ? ` · sem. ${info.week}/${info.weeks}` : ''}</span>${ctx.deload ? '<span class="chip warn">Allègement : 1 série de moins</span>' : ''}${info.key === 'reprise' ? '<span class="chip warn">Charges légères</span>' : ''}</div>
    <div class="big">${S.title}</div>
    <p class="muted">Coche chaque série : le minuteur de repos démarre tout seul. Les charges sont pré-remplies d’après ta dernière séance.</p>
    <details class="swap"><summary>Changer de séance</summary>${picker}</details>
  </section>
  ${blocks}
  <section class="end">
    ${rec?.endedAt ? `<p class="ok center">✓ Séance terminée (${dur(rec)})</p><button class="btn ghost" data-act="reopen" data-key="${key}">Rouvrir</button>`
      : `<button class="btn" data-act="finish" data-key="${key}">Terminer la séance</button>`}
  </section>`;
}
function mobRow(it, rec) {
  const ex = EX[it.id], done = rec?.items[it.id]?.[0]?.done;
  return `<div class="mrow"><button class="chk sm ${done ? 'on' : ''}" data-act="mobchk" data-id="${it.id}">✓</button>
    <div class="grow"><b>${ex.n}</b> <span class="muted">${it.reps.replace('min', ' min')}</span>${howTo(ex, false)}</div></div>`;
}
function exCard(it, bi, ii, rec, ctx, n) {
  const ex = EX[it.id], spec = parseReps(it.reps);
  const sg = suggest(it, spec, ex, ctx.deload, today());
  const saved = rec?.items[it.id] || [];
  const wantsW = needsW(ex, spec), wantsR = needsR(ex, spec);
  const rows = Array.from({ length: it.sets }, (_, i) => {
    const s = saved[i] || {};
    const w = s.w ?? sg.w, r = s.r ?? sg.r;
    return `<div class="set ${s.done ? 'done' : ''}" data-id="${it.id}" data-i="${i}" data-b="${bi}" data-ii="${ii}">
      <span class="sn">${i + 1}</span>
      ${wantsW ? `<input type="number" inputmode="decimal" step="any" class="w" value="${w}" aria-label="charge"><span class="u">${U()}</span>` : ''}
      ${wantsR ? `<span class="x">×</span><input type="number" inputmode="numeric" class="r" value="${r}" aria-label="reps">` : ''}
      ${!wantsW && !wantsR ? `<span class="grow muted">${repsLabel(it.reps, spec)}</span>` : '<span class="grow"></span>'}
      ${spec.kind === 'time' ? `<button class="tbtn" data-act="work" data-sec="${spec.sec}" data-name="${ex.n}">▶ ${spec.sec} s</button>` : ''}
      <button class="chk ${s.done ? 'on' : ''}" data-act="set">✓</button></div>`;
  }).join('');
  return `<article class="card ex">
    <div class="exh">${it.ss ? `<span class="ss">${it.ss}</span>` : `<span class="num">${n}</span>`}
      <div class="grow"><b>${ex.n}</b><div class="target">${it.sets} × ${repsLabel(it.reps, spec)}${it.rpe ? ' · ' + it.rpe : ''} · repos ${fmtRest(it.rest)}</div></div></div>
    ${sg.hint ? `<p class="hint ${sg.up ? 'up' : ''}">${sg.hint}</p>` : ''}
    ${howTo(ex, sg.first)}
    <div class="sets">${rows}</div></article>`;
}
function ensureRec(key) {
  const [date, type] = key.split('_');
  if (!db.sessions[key]) {
    const info = phaseInfo(date);
    db.sessions[key] = { date, type, phase: info.key, week: info.week, startedAt: Date.now(), items: {} };
    db.active = key;
    wake(true);
  }
  return db.sessions[key];
}
function nextLabel(bi, ii, i) {
  const S = buildSession(currentType(), ctxOf(phaseInfo(today())));
  const items = S.blocks[bi].items, it = items[ii];
  if (it.ss?.endsWith('1') && items[ii + 1]) return `${items[ii + 1].ss} · ${EX[items[ii + 1].id].n}`;
  if (it.ss?.endsWith('2') && i < it.sets - 1) return `${items[ii - 1].ss} · ${EX[items[ii - 1].id].n} (série ${i + 2})`;
  if (i < it.sets - 1) return `${EX[it.id].n} (série ${i + 2})`;
  const nxt = items[ii + 1] || S.blocks[bi + 1]?.items[0];
  return nxt ? EX[nxt.id].n : 'Retour au calme';
}
const currentType = () => sessionKeyFor(location.hash.split('/')[2])?.split('_')[1];

// ---------- Mobilité ----------
function mobility() {
  const t = today(), done = !!db.mob[t];
  const total = HOME.reduce((s, h) => s + h.hold * (h.sides ? 2 : 1), 0);
  const recup = phaseInfo(t).key === 'recup';
  return `
  <section class="card hero">
    <div class="big">Routine « Raide partout »</div>
    <p class="muted">${HOME.length} étirements · environ ${Math.round(total / 60 + 1.5)} min · les jours sans gym. Guidée : tu n’as qu’à suivre l’écran.${recup ? ' <b>Semaine de récupération : version douce, va à 50 % de ton amplitude.</b>' : ''}</p>
    ${done ? '<p class="ok">✓ Faite aujourd’hui</p>' : ''}
    <button class="btn" data-act="play">${done ? 'Refaire' : 'Démarrer'}</button>
  </section>
  ${HOME.map((h, i) => { const ex = EX[h.id]; return `<article class="card ex"><div class="exh"><span class="num">${i + 1}</span>
    <div class="grow"><b>${ex.n}</b><div class="target">${h.hold} s${h.sides ? ' par côté' : ''}</div></div></div>${howTo(ex, false)}</article>`; }).join('')}
  <section class="card note"><b>Astuce pendant l’étude :</b> toutes les 45–60 min, lève-toi 2 min : squat profond tenu + couch stretch.</section>`;
}
let player = null;
function startPlayer() {
  const steps = HOME.flatMap(h => h.sides ? [{ ...h, side: 'Côté gauche' }, { ...h, side: 'Côté droit' }] : [{ ...h }]);
  player = { steps, i: 0, left: 5, prep: true, paused: false };
  wake(true);
  const el = document.createElement('div'); el.id = 'player'; document.body.appendChild(el);
  drawPlayer();
  player.iv = setInterval(tickPlayer, 1000);
}
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
  const st = player.steps[player.i], ex = EX[st.id];
  const sig = `${player.i}|${player.prep}|${player.paused}`;
  if (player.sig === sig) { el.querySelector('.ptime').textContent = player.left; return; }
  player.sig = sig;
  el.innerHTML = `<div class="pl">
    <div class="row between"><span class="muted">${player.i + 1} / ${player.steps.length}</span><button class="x" data-act="pclose">✕</button></div>
    <div class="pname">${player.prep ? 'Prépare-toi :' : ''} ${ex.n}</div>${st.side ? `<div class="pside">${st.side}</div>` : ''}
    <div class="ptime ${player.prep ? 'prep' : ''}">${player.left}</div>
    ${media(ex)}<ol class="pcues">${ex.cues.map(c => `<li>${c}</li>`).join('')}</ol>
    <div class="row center pctl"><button class="btn ghost" data-act="pprev">◀</button><button class="btn" data-act="ppause">${player.paused ? 'Reprendre' : 'Pause'}</button><button class="btn ghost" data-act="pnext">▶</button></div></div>`;
}
function endPlayer() {
  const t = today();
  db.mob[t] = true; hab(t).mob = true; save();
  stopPlayer(true); toast('Mobilité faite ✓'); render();
}
function stopPlayer(release) {
  if (!player) return;
  clearInterval(player.iv); player = null; $('#player')?.remove();
  if (release) wake(false);
}

// ---------- Progrès ----------
const TESTS = [
  { k: 'waist', n: 'Tour de taille', u: 'cm', how: 'Ruban au nombril, ventre relâché.' },
  { k: 'broad', n: 'Saut en longueur', u: 'cm', how: 'Meilleur de 3, sans élan.' },
  { k: 'vert', n: 'Saut vertical', u: 'cm', how: 'Marque au mur (bras tendu, puis saut) ou app My Jump.' },
  { k: 'sprint', n: 'Sprint 20 m', u: 's', how: 'Vidéo au téléphone, départ arrêté.' },
  { k: 'reach', n: 'Doigts-orteils', u: 'cm', how: 'Debout, jambes tendues : négatif si tu n’atteins pas tes orteils (ex. −12), positif au-delà.' },
  { k: 'squat', n: 'Squat profond tenu', u: 's', how: 'Talons au sol, sans te tenir.' },
  { k: 'push', n: 'Pompes max', u: '', how: 'Propres, poitrine près du sol.' },
  { k: 'pull', n: 'Tractions max', u: '', how: 'Bras tendus en bas, menton au-dessus.' },
];
function progress() {
  const ws = weights();
  const lifts = [...new Set(sortedSessions().flatMap(s => Object.keys(s.items)))]
    .filter(id => EX[id] && !['bw', 'mob'].includes(EX[id].eq));
  const sel = progress.sel && lifts.includes(progress.sel) ? progress.sel : lifts[0];
  const liftPts = sel ? sortedSessions().map(s => {
    const sets = (s.items[sel] || []).filter(x => x.done && x.w !== '' && x.w != null);
    if (!sets.length) return null;
    const best = Math.max(...sets.map(x => +x.w));
    return { t: +parse(s.date), v: best, sets, d: s.date };
  }).filter(Boolean) : [];
  const testDates = Object.keys(db.tests).sort();
  const hist = sortedSessions().filter(s => s.endedAt).reverse().slice(0, 30);
  return `
  <section class="card"><h3>Poids</h3>
    ${chart([{ pts: ws.map(x => ({ t: +parse(x.d), v: x.v })), cls: 'raw', dots: true, line: false },
             { pts: ws.map(x => ({ t: +parse(x.d), v: avg7(x.d, ws) })), cls: 'avg' }], { target: db.settings.targetWeight, unit: ' kg' })}
    <p class="muted">Points = pesées, ligne = moyenne sur 7 jours. La créatine ajoute 1–2 kg d’eau au début : c’est normal.</p></section>
  <section class="card"><h3>Charges</h3>
    ${lifts.length ? `<select data-act="lift">${lifts.map(id => `<option value="${id}" ${id === sel ? 'selected' : ''}>${EX[id].n}</option>`).join('')}</select>
      ${chart([{ pts: liftPts, cls: 'avg', dots: true }], { unit: ' ' + U() })}
      <ul class="hist">${liftPts.slice(-5).reverse().map(p => `<li><span>${fmtShort(p.d)}</span> ${p.sets.map(s => `${s.w}×${s.r ?? ''}`).join(', ')}</li>`).join('')}</ul>`
      : '<p class="muted">Tes charges apparaîtront ici après ta première séance.</p>'}
  </section>
  <section class="card"><h3>Tests mensuels</h3>
    <p class="muted">À faire la semaine du ${testMondays().filter(m => addDays(m, 6) >= '2026-10-26').slice(0, 4).map(fmtShort).join(', ')}… Photos face/profil/dos le même jour, même lumière.</p>
    ${testDates.length ? `<div class="scroll"><table><tr><th></th>${testDates.map(d => `<th>${fmtShort(d)}</th>`).join('')}</tr>
      ${TESTS.map(tt => `<tr><td>${tt.n}</td>${testDates.map(d => `<td>${db.tests[d][tt.k] ?? ''}</td>`).join('')}</tr>`).join('')}</table></div>` : ''}
    <details class="how"${isTestWeek(today()) ? ' open' : ''}><summary>Entrer des résultats</summary>
      <form data-act="tests"><label>Date <input type="date" name="date" value="${today()}"></label>
      ${TESTS.map(tt => `<label>${tt.n}${tt.u ? ` (${tt.u})` : ''} <input type="number" step="any" inputmode="decimal" name="${tt.k}" value="${db.tests[today()]?.[tt.k] ?? ''}"><small>${tt.how}</small></label>`).join('')}
      <button class="btn" type="submit">Enregistrer</button></form></details>
  </section>
  <section class="card"><h3>Historique</h3>
    ${hist.length ? `<ul class="hist">${hist.map(s => `<li><details><summary><span>${fmtShort(s.date)}</span> ${titleOf(s.type)} <span class="muted">${dur(s)}</span></summary>
      ${Object.entries(s.items).filter(([id]) => EX[id] && EX[id].eq !== 'mob').map(([id, sets]) => `<div class="muted">${EX[id].n} : ${sets.filter(x => x.done).map(x => (x.w !== '' && x.w != null ? x.w + '×' : '') + (x.r ?? '✓')).join(', ')}</div>`).join('')}</details></li>`).join('')}</ul>`
      : '<p class="muted">Aucune séance terminée pour l’instant.</p>'}
  </section>`;
}

// ---------- Guide ----------
function guide() {
  const t = today(), cur = phaseInfo(t).key;
  const ph = PHASES.map(p => `<li class="${p.key === cur ? 'on' : ''}"><b>${p.name}</b> <span class="muted">${fmtShort(p.start)} – ${fmtShort(p.end)}</span><br>${DESC[p.key]}</li>`).join('');
  return `
  <section class="card"><h3>Le plan</h3><ul class="phases">${ph}
    <li class="${t >= CYCLE_START ? 'on' : ''}"><b>Dès février</b> <span class="muted">en continu</span><br>Alternance de 4 semaines Force / 4 semaines Puissance. La 4ᵉ semaine de chaque bloc est allégée.</li></ul>
    <p class="muted">Semaines d’examens (7–20 déc.) : version allégée automatique, 2 séances. Une semaine chargée ? Réglages → « Cette semaine ».</p></section>
  <section class="card"><h3>Règle d’or</h3><p>3 séances par semaine pendant 4 mois, même imparfaites, valent mieux que 5 séances pendant 3 semaines. Une séance ratée : on reprend à la suivante, sans essayer de rattraper.</p></section>
  <section class="card"><h3>L’assiette (3 repas)</h3><ul>
    <li><b>Protéines : 2 paumes</b> (~40 g) : poulet, bœuf maigre, poisson, œufs, tofu, skyr, cottage.</li>
    <li><b>Légumes : 2 poings</b>, à manger en premier.</li>
    <li><b>Glucides : 1 poing</b> (riz, pâtes, patates, pain, avoine). <b>2 poings</b> les jours de gym ou de match.</li>
    <li><b>Gras : 1 pouce</b> (huile, noix, avocat, fromage).</li>
    <li><b>+ 1 collation protéinée</b> : shake, skyr + fruit, cottage, œufs durs.</li></ul>
    <p class="muted">Repère : maintien ≈ 2 900–3 100 kcal, cible ≈ 2 400–2 500 kcal, ~170 g de protéines. Inutile de compter.</p></section>
  <section class="card"><h3>Tes 3 pièges</h3><ul>
    <li><b>Grignotage / sucre :</b> pas de sucreries à la maison. Collations prêtes : skyr, fruits, jerky, popcorn nature, shake. Un dessert planifié par semaine, sans culpabilité.</li>
    <li><b>Portions :</b> servir dans la cuisine, une seule assiette. Encore faim ? Rajoute des légumes ou des protéines, pas des féculents. 15–20 min par repas, sans écran.</li>
    <li><b>Stress d’examen :</b> meal prep le dimanche. Sur le bureau : eau, thé, gomme, collations protéinées. « Faim ou stress ? » Si c’est le stress, 5 min de marche.</li></ul></section>
  <section class="card"><h3>Meal prep du dimanche (45 min)</h3><p>1,5 kg de poulet ou de bœuf haché maigre · 1 gros chaudron de riz ou de patates · 2 plaques de légumes rôtis · 12 œufs durs. Ça couvre les repas jusqu’à mercredi.</p></section>
  <section class="card"><h3>Suppléments</h3><ul>
    <li><b>Créatine</b> 5 g/jour, tous les jours (+1–2 kg d’eau au début : normal).</li>
    <li><b>Whey</b> : 1 dose si tu manques de protéines.</li>
    <li><b>Vitamine D3</b> 1 000–2 000 UI/jour, d’octobre à avril.</li></ul></section>
  <section class="card"><h3>Ajuster</h3><ul>
    <li>La moyenne ne baisse pas pendant 2 semaines → enlève 1 poing de glucides par jour, ou ajoute 2 000 pas.</li>
    <li>Tu perds plus d’1 kg/semaine ou tu es vidé au gym → ajoute 1 poing de glucides.</li>
    <li>Vise 8 000–10 000 pas par jour : c’est le levier le plus sous-estimé.</li></ul></section>
  <section class="card"><h3>RPE et progression</h3>
    <p><b>RPE</b> = effort sur 10. RPE 7 = il te reste 3 reps en réserve, RPE 8 = 2, RPE 9 = 1.</p>
    <p><b>Progression :</b> l’app le fait pour toi. Quand toutes les séries atteignent le haut de la fourchette, elle augmente la charge. Sinon, garde la même charge et vise une rep de plus.</p>
    <p><b>Sauts et sprints :</b> toujours frais, qualité maximale. Si tu ralentis, arrête.</p></section>
  <section class="card"><h3>Le matin au CEPSUM</h3><ul>
    <li>Lever ~5 h 50, coucher ~22 h. Le sommeil fait tenir le plan.</li>
    <li>Sac prêt la veille. Petit déj léger avant (banane + yogourt) ou shake après.</li>
    <li>Fin de séance vers 7 h 55 → cours à 8 h 30.</li></ul></section>
  <section class="card"><h3>Pourquoi tu te sens lent</h3><p>Pas à cause des os : un squelette dense ajoute au plus 1–2 kg. Le marathon a entraîné ton corps à être endurant et économe, l’inverse de l’explosivité. Sauts, sprints et charges lourdes vont changer ça en quelques mois.</p></section>`;
}

// ---------- Réglages ----------
function settings() {
  const st = db.settings, mon = mondayOf(today()), next = addDays(mon, 7);
  const ovSel = (m, label) => `<label>${label} <select data-act="ov" data-mon="${m}">
    ${[['', 'Automatique'], ['light', 'Allégée (2 séances)'], ['normal', 'Normale']].map(([v, l]) => `<option value="${v}" ${(st.overrides[m] || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  const daySel = k => `<label>Séance ${k} <select data-act="day" data-k="${k}">${[1, 2, 3, 4, 5, 6, 0].map(d => `<option value="${d}" ${st.days[k] === d ? 'selected' : ''}>${DOW[d]}</option>`).join('')}</select></label>`;
  return `
  <section class="card"><h3>Semaines</h3>${ovSel(mon, 'Cette semaine')}${ovSel(next, 'Semaine prochaine')}
    <p class="muted">Allégée = 2 séances de 45 min (examens, semaine chargée, fatigue).</p></section>
  <section class="card"><h3>Jours de gym</h3>${daySel('A')}${daySel('B')}${daySel('C')}
    <p class="muted">En semaine allégée : séances le jour A et le jour C.</p></section>
  <section class="card"><h3>Objectif</h3>
    <label>Poids de départ (kg) <input type="number" step="0.1" data-act="set" data-k="startWeight" value="${st.startWeight}"></label>
    <label>Poids cible (kg) <input type="number" step="0.1" data-act="set" data-k="targetWeight" value="${st.targetWeight}"></label>
    <label>Unité des charges <select data-act="unit"><option value="kg" ${st.unit === 'kg' ? 'selected' : ''}>kg</option><option value="lb" ${st.unit === 'lb' ? 'selected' : ''}>lb</option></select></label></section>
  <section class="card"><h3>Notifications</h3>
    <p class="muted">Rappels de séance : agenda Google « Gym ». Ici : alerte de fin de repos quand l’écran est éteint.</p>
    <button class="btn ghost" data-act="notif">${'Notification' in window && Notification.permission === 'granted' ? '✓ Activées' : 'Activer'}</button></section>
  <section class="card"><h3>Sauvegarde</h3>
    <p class="muted">Tes données restent sur ce téléphone. Exporte une sauvegarde de temps en temps.</p>
    <div class="row wrap"><button class="btn ghost" data-act="export">Exporter</button>
    <label class="btn ghost">Importer<input type="file" accept="application/json" data-act="import" hidden></label></div></section>`;
}

// ================= Minuteur =================
let timer = null, actx = null;
function audio() { try { actx ||= new (window.AudioContext || window.webkitAudioContext)(); actx.resume?.(); } catch { } }
function beep(f = 880, d = 0.2) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.frequency.value = f; g.gain.value = 0.25; o.connect(g); g.connect(actx.destination);
  o.start(); o.stop(actx.currentTime + d);
}
const vibrate = p => navigator.vibrate?.(p);
function startTimer(sec, label, kind = 'rest') {
  timer = { end: Date.now() + sec * 1000, label, kind };
  $('#timer').classList.add('show'); drawTimer();
}
function drawTimer() {
  if (!timer) return;
  const left = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000));
  $('#timer').innerHTML = `<div class="tl"><b>${fmtRest(left).replace(' s', '')}</b><span>${timer.kind === 'rest' ? 'Repos · suivant : ' : ''}${timer.label}</span></div>
    <button data-act="t-">−15</button><button data-act="t+">+15</button><button data-act="tx">✕</button>`;
  if (left <= 0) {
    beep(880, 0.35); setTimeout(() => beep(1100, 0.35), 400); vibrate([300, 120, 300]);
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted')
      navigator.serviceWorker?.ready.then(r => r.showNotification(timer.kind === 'rest' ? 'Repos terminé' : 'Temps écoulé', { body: timer.label, tag: 'rest', vibrate: [300, 120, 300] }));
    stopTimer();
  }
}
function stopTimer() { timer = null; $('#timer').classList.remove('show'); }
setInterval(drawTimer, 250);

let lock = null;
async function wake(on) {
  try {
    if (on && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => (lock = null)); }
    if (!on && lock) { await lock.release(); lock = null; }
  } catch { }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const k = db.active, r = k && db.sessions[k];
    if ((r && !r.endedAt && r.date === today()) || player) wake(true);
    if (location.hash === '' || location.hash === '#/') render(); // nouveau jour
  }
});

// ================= Événements =================
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, t = today();
  audio();
  if (act === 'set') {
    const row = b.closest('.set'), { id, i, b: bi, ii } = row.dataset;
    const key = sessionKeyFor(location.hash.split('/')[2]); const rec = ensureRec(key);
    const arr = (rec.items[id] ||= []);
    const w = row.querySelector('.w')?.value ?? '', r = row.querySelector('.r')?.value;
    const was = arr[+i]?.done;
    arr[+i] = { w: w === '' ? '' : +w, r: r === undefined || r === '' ? undefined : +r, done: !was };
    save();
    row.classList.toggle('done', !was); b.classList.toggle('on', !was);
    if (!was) {
      const S = buildSession(key.split('_')[1], ctxOf(phaseInfo(t)));
      const it = S.blocks[+bi].items[+ii];
      startTimer(it.rest, nextLabel(+bi, +ii, +i));
    }
  } else if (act === 'mobchk') {
    const key = sessionKeyFor(location.hash.split('/')[2]); const rec = ensureRec(key);
    const was = rec.items[b.dataset.id]?.[0]?.done;
    rec.items[b.dataset.id] = [{ done: !was }]; save(); b.classList.toggle('on', !was);
  } else if (act === 'work') {
    startTimer(+b.dataset.sec, b.dataset.name, 'work');
  } else if (act === 'finish') {
    const rec = ensureRec(b.dataset.key);
    const n = Object.values(rec.items).flat().filter(x => x.done).length;
    if (!n) return toast('Coche au moins une série avant de terminer.');
    rec.endedAt = Date.now(); hab(rec.date).mob = true; db.active = null; save();
    wake(false); stopTimer(); toast(`Séance terminée ✓ ${n} séries cochées`);
    location.hash = '#/';
  } else if (act === 'reopen') {
    const rec = db.sessions[b.dataset.key]; delete rec.endedAt; db.active = b.dataset.key; save(); render();
  } else if (act === 'habit') {
    const h = hab(t); h[b.dataset.k] = !h[b.dataset.k]; save(); render();
  } else if (act === 'run') {
    const h = hab(t); h.run = !h.run; save(); render();
  } else if (act === 'play') startPlayer();
  else if (act === 'pclose') { stopPlayer(true); render(); }
  else if (act === 'ppause') { player.paused = !player.paused; drawPlayer(); }
  else if (act === 'pnext' || act === 'pprev') {
    player.i = Math.max(0, player.i + (act === 'pnext' ? 1 : -1));
    if (player.i >= player.steps.length) return endPlayer();
    player.prep = false; player.left = player.steps[player.i].hold; drawPlayer();
  }
  else if (act === 't-') { timer.end -= 15000; drawTimer(); }
  else if (act === 't+') { timer.end += 15000; drawTimer(); }
  else if (act === 'tx') stopTimer();
  else if (act === 'notif') Notification.requestPermission().then(render);
  else if (act === 'export') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' }));
    a.download = `forme-sauvegarde-${t}.json`; a.click();
  }
});
document.addEventListener('change', e => {
  const el = e.target, act = el.dataset.act, t = today();
  if (el.closest('.set')) {
    const row = el.closest('.set'), { id, i } = row.dataset;
    const key = sessionKeyFor(location.hash.split('/')[2]); const rec = db.sessions[key];
    if (rec?.items[id]?.[+i]) {
      const s = rec.items[id][+i];
      if (el.classList.contains('w')) s.w = el.value === '' ? '' : +el.value;
      if (el.classList.contains('r')) s.r = el.value === '' ? undefined : +el.value;
      save();
    }
    return;
  }
  if (act === 'weight') { const v = parseFloat(el.value); hab(t).weight = v > 0 ? v : undefined; save(); render(); }
  else if (act === 'lift') { progress.sel = el.value; render(); }
  else if (act === 'ov') { if (el.value) db.settings.overrides[el.dataset.mon] = el.value; else delete db.settings.overrides[el.dataset.mon]; save(); toast('Enregistré'); }
  else if (act === 'day') { db.settings.days[el.dataset.k] = +el.value; save(); toast('Enregistré'); }
  else if (act === 'set') { db.settings[el.dataset.k] = parseFloat(el.value); save(); toast('Enregistré'); }
  else if (act === 'unit') { db.settings.unit = el.value; save(); toast('Enregistré'); }
  else if (act === 'import' && el.files[0]) {
    el.files[0].text().then(txt => {
      const d = JSON.parse(txt);
      if (!d.sessions || !d.settings) throw new Error('fichier invalide');
      db = d; save(); toast('Sauvegarde importée ✓'); render();
    }).catch(err => toast('Import impossible : ' + err.message));
  }
});
document.addEventListener('submit', e => {
  if (e.target.dataset.act !== 'tests') return;
  e.preventDefault();
  const f = new FormData(e.target), d = f.get('date'), rec = {};
  for (const tt of TESTS) { const v = f.get(tt.k); if (v !== '' && v != null) rec[tt.k] = +v; }
  if (!Object.keys(rec).length) return toast('Aucune valeur entrée.');
  db.tests[d] = { ...(db.tests[d] || {}), ...rec };
  if (rec.waist) hab(d).waist = rec.waist;
  save(); toast('Tests enregistrés ✓'); render();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
render();
