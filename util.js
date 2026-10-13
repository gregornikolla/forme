// Dates, formats, icônes

export const pad = n => String(n).padStart(2, '0');
export const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
export const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
export const mondayOf = s => addDays(s, -((parse(s).getDay() + 6) % 7));
const DATE_OVERRIDE = new URLSearchParams(location.search).get('date');
export const today = () => DATE_OVERRIDE || ymd(new Date());
// Horodatage « maintenant » cohérent avec ?date= (tests)
export const nowTs = () => DATE_OVERRIDE ? +parse(DATE_OVERRIDE) - 5 * 36e5 + (Date.now() % 36e5) : Date.now();
export const dateOfTs = ts => ymd(new Date(ts));

const loc = 'fr-CA';
export const fmtDay = s => parse(s).toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtShort = s => parse(s).toLocaleDateString(loc, { day: 'numeric', month: 'short' });
export const fmtMonth = s => parse(s).toLocaleDateString(loc, { month: 'long', year: 'numeric' });
export const fmtWeekday = s => parse(s).toLocaleDateString(loc, { weekday: 'long' });
export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
export const DOW = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const DOW1 = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
export const DOW_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// Nombres à la française : 82,5 · 12 450
export const num = (v, d = 1) => {
  if (v == null || v === '' || isNaN(v)) return '';
  const r = Math.round(v * 10 ** d) / 10 ** d;
  return r.toLocaleString(loc, { maximumFractionDigits: d }).replace(/ | /g, ' ');
};
export const fmtDur = ms => {
  const m = Math.max(0, Math.round(ms / 60000));
  return m >= 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)}` : `${m} min`;
};
export const fmtClock = sec => {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};
export const fmtRest = s => s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? ' ' + pad(s % 60) : ''}` : `${s} s`;

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Icônes (trait 2 px, 24×24)
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
  scale: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9a5 5 0 0 1 8 0l-3 3"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4M9 2h6"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  cal: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  dn: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  stretch: '<circle cx="12" cy="4.5" r="2"/><path d="M4 9h16M12 9v5l-4 7M12 14l4 7"/>',
  run: '<circle cx="15" cy="4.5" r="2"/><path d="M5 21l4-6 4 2 1-5-4-2-3 3M14 12l3 3h4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
  note: '<path d="M5 3h10l4 4v14H5zM9 12h6M9 16h4"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
export const icon = (name, size = 22, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
