// Composants partagés : feuilles, toasts, vignettes, graphiques
import { exOf } from './store.js';
import { MUSCLES, EQUIP } from './exercises.js';
import { icon, esc, num, fmtShort, parse, ymd } from './util.js';

// Gestionnaires d'actions : data-act="nom" → ACT.nom(el, event)
export const ACT = {}, CHG = {}, INP = {};
export const R = { render: () => {} };
export const $ = s => document.querySelector(s);

export function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400);
}

// ---------- Feuille du bas (modale) ----------
let sheetEl = null;
export function openSheet(html, { cls = '', onClose } = {}) {
  closeSheet(true);
  sheetEl = document.createElement('div');
  sheetEl.className = 'sheet-wrap';
  sheetEl.innerHTML = `<div class="sheet-bg" data-act="sheetClose"></div><div class="sheet ${cls}" role="dialog"><div class="grab"></div>${html}</div>`;
  sheetEl._onClose = onClose;
  document.body.appendChild(sheetEl);
  requestAnimationFrame(() => sheetEl?.classList.add('open'));
  return sheetEl.querySelector('.sheet');
}
export function closeSheet(instant) {
  if (!sheetEl) return;
  const el = sheetEl; sheetEl = null;
  el._onClose?.();
  if (instant) return el.remove();
  el.classList.remove('open');
  setTimeout(() => el.remove(), 220);
}
export const sheetOpen = () => !!sheetEl;
ACT.sheetClose = () => closeSheet();

// Confirmation (remplace confirm())
let pending = null;
export function confirmSheet({ title, text = '', ok = 'Confirmer', danger = false, cancel = 'Annuler', onOk }) {
  pending = onOk;
  openSheet(`<div class="sheet-body center">
    <h3 class="sheet-title">${title}</h3>${text ? `<p class="muted">${text}</p>` : ''}
    <button class="btn ${danger ? 'danger' : 'primary'} block" data-act="confirmOk">${ok}</button>
    <button class="btn ghost block" data-act="sheetClose">${cancel}</button></div>`);
}
ACT.confirmOk = () => { const f = pending; pending = null; closeSheet(); f?.(); };

// Menu d'options : [{ icon, label, act, data, danger }]
export function menuSheet(title, items) {
  openSheet(`<div class="sheet-body">${title ? `<h3 class="sheet-title">${title}</h3>` : ''}
    <div class="menu">${items.map(it => `<button class="menu-item ${it.danger ? 'danger' : ''}" data-act="${it.act}" ${Object.entries(it.data || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>
      ${icon(it.icon || 'right', 20)}<span>${it.label}</span></button>`).join('')}</div></div>`);
}

// ---------- Exercices ----------
const initials = n => n.split(/\s+/).filter(w => w.length > 2 && /^\p{L}/u.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase() || n[0];
export function thumb(id, size = 44) {
  const ex = exOf(id);
  return ex.img
    ? `<span class="thumb" style="--s:${size}px"><img src="img/${ex.img}/0.jpg" alt="" loading="lazy"></span>`
    : `<span class="thumb ph" style="--s:${size}px">${esc(initials(ex.n))}</span>`;
}
export const muscleLine = ex => [...new Set(ex.mu)].map(m => MUSCLES[m] || m).join(', ');
export function media(ex) {
  if (!ex.img) return '';
  return `<div class="media" data-anim><img src="img/${ex.img}/0.jpg" alt=""><img src="img/${ex.img}/1.jpg" alt=""></div>`;
}
setInterval(() => document.querySelectorAll('[data-anim]').forEach(m => m.classList.toggle('alt')), 1100);

export function howTo(id) {
  const ex = exOf(id);
  const tags = [...ex.mu.map(m => `<span class="tag strong">${MUSCLES[m] || m}</span>`), ...ex.mu2.map(m => `<span class="tag">${MUSCLES[m] || m}</span>`)];
  return `${media(ex)}
    <div class="tags">${tags.join('')}<span class="tag eq">${EQUIP[ex.eq] || ''}</span></div>
    ${ex.why ? `<div class="why"><b>Pourquoi cet exercice</b><p>${esc(ex.why)}</p></div>` : ''}
    ${ex.cues?.length ? `<ol class="steps">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ol>` : '<p class="muted">Exercice personnalisé.</p>'}
    ${ex.note ? `<p class="callout">${icon('info', 16)}<span>${esc(ex.note)}</span></p>` : ''}
    ${ex.yt ? `<a class="btn ghost block" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}" target="_blank" rel="noopener">${icon('video', 18)} Voir une vidéo</a>` : ''}`;
}
export function exSheet(id) {
  const ex = exOf(id);
  openSheet(`<div class="sheet-body"><h3 class="sheet-title">${esc(ex.n)}</h3>${howTo(id)}
    <a class="btn ghost block" href="#/ex/${encodeURIComponent(id)}" data-act="sheetClose">Historique et records</a></div>`, { cls: 'tall' });
}

// ---------- Graphiques SVG ----------
// series : [{ pts:[{t,v}], cls, dots, line }]
export function lineChart(series, { h = 160, target = null, fmt = v => num(v, 1), empty = 'Pas encore assez de données.' } = {}) {
  const all = series.flatMap(s => s.pts);
  if (all.length < 2) return `<div class="chart-empty">${empty}</div>`;
  const W = 340, H = h, L = 6, Rr = 40, T = 12, B = 22;
  let t0 = Math.min(...all.map(p => p.t)), t1 = Math.max(...all.map(p => p.t));
  if (t1 === t0) t1 = t0 + 864e5;
  const vals = all.map(p => p.v).concat(target != null ? [target] : []);
  let v0 = Math.min(...vals), v1 = Math.max(...vals);
  const padV = (v1 - v0) * 0.12 || 1; v0 -= padV; v1 += padV;
  const X = t => L + (t - t0) / (t1 - t0) * (W - L - Rr);
  const Y = v => T + (1 - (v - v0) / (v1 - v0)) * (H - T - B);
  const grid = [0, 0.5, 1].map(f => { const v = v0 + padV + f * (v1 - v0 - 2 * padV); return `<line class="grid" x1="${L}" x2="${W - Rr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="lbl" x="${W - Rr + 6}" y="${Y(v) + 4}">${fmt(v)}</text>`; }).join('');
  const lines = series.map(s => {
    const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
    const area = s.area ? `<path class="area" d="${d}L${X(s.pts.at(-1).t).toFixed(1)},${H - B}L${X(s.pts[0].t).toFixed(1)},${H - B}Z"/>` : '';
    const dots = s.dots ? s.pts.map(p => `<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3"/>`).join('') : '';
    return `<g class="${s.cls}">${area}${s.line === false ? '' : `<path class="ln" d="${d}"/>`}${dots}</g>`;
  }).join('');
  const tgt = target != null ? `<line class="target" x1="${L}" x2="${W - Rr}" y1="${Y(target)}" y2="${Y(target)}"/>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${grid}${tgt}${lines}
    <text class="lbl" x="${L}" y="${H - 5}">${fmtShort(ymd(new Date(t0)))}</text>
    <text class="lbl" x="${W - Rr}" y="${H - 5}" text-anchor="end">${fmtShort(ymd(new Date(t1)))}</text></svg>`;
}
// vals : [{ label, v, hi }]
export function barChart(vals, { h = 140, fmt = v => num(v, 0) } = {}) {
  const W = 340, H = h, T = 18, B = 20, n = vals.length;
  const max = Math.max(1, ...vals.map(x => x.v));
  const bw = (W / n) * 0.56, gap = W / n;
  const bars = vals.map((x, i) => {
    const bh = (x.v / max) * (H - T - B), xx = i * gap + (gap - bw) / 2, y = H - B - bh;
    return `<rect class="${x.hi ? 'hi' : ''}" x="${xx.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(bh, x.v ? 2 : 0).toFixed(1)}" rx="3"/>
      ${x.v && x.hi ? `<text class="val" x="${(xx + bw / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle">${fmt(x.v)}</text>` : ''}
      ${x.label ? `<text class="lbl" x="${(xx + bw / 2).toFixed(1)}" y="${H - 5}" text-anchor="middle">${x.label}</text>` : ''}`;
  }).join('');
  return `<svg class="chart bars" viewBox="0 0 ${W} ${H}" role="img"><line class="grid" x1="0" x2="${W}" y1="${H - B}" y2="${H - B}"/>${bars}</svg>`;
}
export function ring(pct, size = 64, stroke = 7, inner = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct));
  return `<span class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}">
    <circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
    <circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><span>${inner}</span></span>`;
}
export const progressBar = pct => `<div class="pbar"><span style="width:${Math.max(0, Math.min(100, pct)).toFixed(1)}%"></span></div>`;
export const ts = d => +parse(d);
