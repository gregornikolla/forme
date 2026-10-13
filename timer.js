// Minuteur de repos, sons, vibrations, écran allumé
import { $, ACT } from './ui.js';
import { fmtClock } from './util.js';

let actx = null;
export function audio() { try { actx ||= new (window.AudioContext || window.webkitAudioContext)(); actx.resume?.(); } catch { } }
export function beep(f = 880, d = 0.2) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.frequency.value = f; g.gain.setValueAtTime(0.22, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + d);
  o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + d);
}
export const vibrate = p => navigator.vibrate?.(p);

let timer = null;
export const timerState = () => timer;
export function startTimer(sec, label, kind = 'rest') {
  if (!sec) return stopTimer();
  timer = { end: Date.now() + sec * 1000, total: sec, label, kind };
  $('#timer').classList.add('show');
  drawTimer();
}
export function stopTimer() { timer = null; $('#timer')?.classList.remove('show'); }
function drawTimer() {
  if (!timer) return;
  const left = Math.max(0, (timer.end - Date.now()) / 1000);
  const el = $('#timer');
  if (!el.querySelector('.t-time')) {
    el.innerHTML = `<div class="t-bar"><span></span></div><div class="t-row">
      <button class="t-btn" data-act="tMinus">−15</button>
      <div class="t-mid"><b class="t-time"></b><span class="t-lbl"></span></div>
      <button class="t-btn" data-act="tPlus">+15</button>
      <button class="t-skip" data-act="tSkip">Passer</button></div>`;
  }
  el.querySelector('.t-time').textContent = fmtClock(Math.ceil(left));
  el.querySelector('.t-lbl').textContent = (timer.kind === 'rest' ? 'Repos' + (timer.label ? ' · ensuite ' : '') : '') + (timer.label || '');
  el.querySelector('.t-bar span').style.width = `${(left / timer.total) * 100}%`;
  if (left <= 3.05 && left > 0 && timer.tick !== Math.ceil(left)) { timer.tick = Math.ceil(left); beep(660, 0.08); }
  if (left <= 0) {
    beep(880, 0.35); setTimeout(() => beep(1175, 0.4), 380); vibrate([300, 120, 300]);
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      const t = timer;
      navigator.serviceWorker?.ready.then(r => r.showNotification(t.kind === 'rest' ? 'Repos terminé' : 'Temps écoulé',
        { body: t.label ? `Ensuite : ${t.label}` : '', tag: 'rest', vibrate: [300, 120, 300], icon: 'icons/icon-192.png' }));
    }
    stopTimer();
  }
}
setInterval(drawTimer, 200);
ACT.tMinus = () => { if (timer) { timer.end -= 15000; drawTimer(); } };
ACT.tPlus = () => { if (timer) { timer.end += 15000; timer.total += 15; drawTimer(); } };
ACT.tSkip = () => stopTimer();

let lock = null;
export async function wake(on) {
  try {
    if (on && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => (lock = null)); }
    if (!on && lock) { await lock.release(); lock = null; }
  } catch { }
}
