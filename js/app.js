(function () {
'use strict';

// Habits: personal dashboard. Vanilla JS, no build step.
// Data lives in localStorage under the original key 'vida3' so existing data is preserved.

/* =========================================================================
   ICONS (lucide-style, stroke = currentColor)
   ========================================================================= */
const I = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v3"/><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M21 12h-4a2 2 0 0 0 0 4h4z"/>',
  utensils: '<path d="M4 3v7a3 3 0 0 0 6 0V3"/><path d="M7 3v18"/><path d="M18 21V3a3 3 0 0 0-3 3v6h3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  half: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.5"/>',
  up: '<path d="M7 17 17 7M8 7h9v9"/>',
  down: '<path d="M7 7l10 10M17 8v9H8"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  book: '<path d="M2 4h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
  dumbbell: '<path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  sparkles: '<path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',
  pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/>',
  drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[name] || ''}</svg>`;
const icon = (name, cls = '') => `<span class="icon ${cls}">${svg(name)}</span>`;

/* =========================================================================
   SCHEDULE DATA (unchanged structure from the original dashboard)
   ========================================================================= */
const CT = {
  m: ['sun', 'Mañana'], c: ['utensils', 'Nutrición'], u: ['book', 'Universidad'],
  p: ['layers', 'Productividad'], s: ['dumbbell', 'Fuerza y salud'], n: ['moon', 'Noche'],
  d: ['bed', 'Descanso'], o: ['sparkles', 'Social']
};

const W = [
  ['09:30', 'Despertar, estiramientos (YT) y ducha', 'm', 'Casa', ['Spray nasal', 'Calcio']],
  ['10:00', 'Desayuno y aseo dental', 'c', 'Casa'],
  ['10:30', 'Estudio profundo: 2-3 sesiones 50/10 (asignatura del día)', 'u', 'Escritorio'],
  ['13:00', 'Almuerzo y tiempo libre', 'c', 'Casa'],
  ['14:15', 'Repaso ligero (30-45 min)', 'u', 'Casa'],
  ['15:00', 'Preparar mochila, ordenar cuarto y salir', 'p', 'Casa']
];
const C = (t, x, l, s) => [t, x, 'u', l, s || []];
const N = ['19:30', 'Entrenamiento de cuello', 's', 'Casa'];
const CE = ['20:00', 'Cena ligera (termina 75 min antes del gym)', 'c', 'Casa'];
const G = x => ['21:15', 'Entrenamiento: ' + x, 's', 'Gimnasio'];
const POST = (t, x) => [
  [t, x || 'Llegada y estiramientos nocturnos', 'n', 'Casa', ['Creatina', 'Magnesio']],
  ['23:30', 'Desconexión: pantallas fuera, luz baja', 'n', 'Casa'],
  ['00:00', 'Dormir', 'd', 'Cama']
];
const WE = [
  ['11:00', 'Despertar, estiramientos (YT) y ducha', 'm', 'Casa', ['Spray nasal', 'Calcio']],
  ['11:30', 'Entrenamiento de cuello', 's', 'Casa'],
  ['11:45', 'Desayuno y almuerzo unificado', 'c', 'Casa'],
  ['13:00', 'Estudio y proyectos: sesiones 50/10', 'p', 'Casa'],
  ['16:00', 'Ocio y ordenar cuarto', 'p', 'Casa'],
  ['17:30', 'Merienda', 'c', 'Casa', ['Calcio']],
  ['20:00', 'Cena', 'c', 'Casa']
];

const D = [
  ['Lunes', 'L', [...W, C('15:30', 'CIN (Cálculo infinitesimal)', 'H.012', ['Calcio']), C('17:40', 'MD1 (Matemática discreta 1)', 'H.012'), N, CE, G('Pierna'), ...POST('23:15')]],
  ['Martes', 'M', [...W, C('15:30', 'AE (Administración de empresas)', 'H.012', ['Calcio']), C('17:40', 'FP1 (Fundamentos de prog. 1)', 'H.012'), CE, G('Torso'), ...POST('23:15')]],
  ['Miércoles', 'X', [...W, C('15:30', 'CED (Circuitos electrónicos)', 'H.012 / G1.35', ['Calcio']), C('17:40', 'MD1 (Matemática discreta 1)', 'H.012 / B1.35'), N, ['20:00', 'Cena', 'c', 'Casa'], ['21:00', 'Proyectos personales (día sin gym)', 'p', 'Escritorio'], ...POST('22:45', 'Estiramientos nocturnos')]],
  ['Jueves', 'J', [...W, C('15:30', 'FP1 (Fundamentos de prog. 1)', 'I2.31', ['Calcio']), C('17:40', 'CIN (Cálculo infinitesimal)', 'H.012 / B1.32'), CE, G('Pierna'), ...POST('23:15')]],
  ['Viernes', 'V', [...W, C('15:30', 'CED (Circuitos electrónicos)', 'H0.12', ['Calcio']), C('17:40', 'AE (Administración de empresas)', 'H.012'), CE, G('Pull'), ['23:15', 'Llegada a casa y fiesta', 'o', 'Fuera', ['Creatina', 'Magnesio']]]],
  ['Sábado', 'S', [...WE, G('Push'), ['23:15', 'Fiesta o descanso en casa', 'o', 'Fuera', ['Creatina', 'Magnesio']]]],
  ['Domingo', 'D', [...WE, ['21:00', 'Relax de domingo', 'd', 'Casa', ['Creatina', 'Magnesio']], ['22:30', 'Planificación semanal (20 min)', 'p', 'Escritorio'], ...POST('23:30').slice(1)]]
];

const KEY_HABITS = [
  { id: 'morning', icon: 'sun', short: 'Mañana', name: 'Rutina de mañana', match: b => b[2] === 'm' },
  { id: 'study', icon: 'timer', short: 'Estudio', name: 'Estudio profundo 50/10', match: b => b[1].includes('Estudio') },
  { id: 'uni', icon: 'cap', short: 'Clases', name: 'Clases universidad', match: b => b[3].includes('H.') || b[3].includes('I2.') || b[3].includes('H0.') },
  { id: 'gym', icon: 'dumbbell', short: 'Gimnasio', name: 'Entrenamiento de fuerza', match: b => b[3] === 'Gimnasio' },
  { id: 'neck', icon: 'shield', short: 'Cuello', name: 'Entreno de cuello', match: b => b[1].includes('cuello') },
  { id: 'supps', icon: 'pill', short: 'Suplem.', name: 'Suplementación', isSupps: true },
  { id: 'water', icon: 'drop', short: 'Agua', name: 'Hidratación 3 L', isWater: true }
];

const BLACKBOARD_ICS_URL = 'https://ev.us.es/webapps/calendar/calendarFeed/b9711c0cbad84ef7b37f9addb1de62f4/learn.ics';
const YT_URL = 'https://www.youtube.com/@donmancuerna';
const VIEWS = ['hoy', 'semana', 'uni', 'finanzas', 'nutricion'];
const IS_HOSTED = location.protocol.startsWith('http');

/* =========================================================================
   HELPERS
   ========================================================================= */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mon = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d; };
const wkKey = () => mon().toISOString().slice(0, 10) + '|' + mon().getDate();
const mm = t => { const [h, m] = t.split(':').map(Number); const v = h * 60 + m; return v < 300 ? v + 1440 : v; };
const nowv = () => { const d = new Date(); const v = d.getHours() * 60 + d.getMinutes(); return v < 300 ? v + 1440 : v; };
const td = (new Date().getDay() + 6) % 7;
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const fmtMoney = n => eur.format(Number(n || 0));
const fmtSigned = n => (n > 0 ? '+' : n < 0 ? '-' : '') + eur.format(Math.abs(Number(n || 0)));
const fmtNum = (n, d = 0) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = n => (n > 0 ? '+' : n < 0 ? '-' : '') + fmtNum(Math.abs(n), 2) + ' %';
const fmtPrice = n => {
  const v = Number(n || 0);
  const d = v >= 1000 ? 0 : v >= 1 ? 2 : 6;
  return eur.format(v).replace(/[\d.,]+/, fmtNum(v, d));
};
const fmtQty = n => Number(n || 0).toLocaleString('es-ES', { maximumFractionDigits: 8 });
const shortDate = () => new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
const uid = () => Date.now() + Math.floor(Math.random() * 100000);

let S;
let day = td;
let onlyPending = false;
let view = 'hoy';
let resetArmed = null;
let currentMealThumb = null;
let tradeSide = 'LONG';
let aiProvider = localStorage.getItem('nexora_ai_provider') || 'gemini';
const REVX = { state: 'idle', data: null, error: '', timer: null };

/* =========================================================================
   STATE
   ========================================================================= */
function load() {
  let r = {};
  try { r = JSON.parse(localStorage.getItem('vida3') || '{}') || {}; } catch (e) { r = {}; }
  const defaultProjects = { initialCapital: 500, trades: [], clipping: [], ytSubs: 0, sideHustles: [], revxCache: null };
  const sameWeek = r.wk === wkKey();
  S = {
    wk: wkKey(),
    c: sameWeek ? (r.c || {}) : {},
    notes: sameWeek ? (r.notes || {}) : {},
    calaiMeals: sameWeek ? (r.calaiMeals || {}) : {},
    calaiGoals: Object.assign({ dailyKcal: 2600, dailyProt: 170 }, r.calaiGoals || {}),
    exams: r.exams || [],
    bbSyncedUids: r.bbSyncedUids || {},
    projects: Object.assign({}, defaultProjects, r.projects || {})
  };
  if (S.projects.revxCache) REVX.data = S.projects.revxCache;
}
function save() { try { localStorage.setItem('vida3', JSON.stringify(S)); } catch (e) { toast('No se pudo guardar en este dispositivo'); } }

const tot = d => D[d][2].reduce((a, b) => a + 1 + (b[4] || []).length, 0) + 3;
const keys = d => Object.keys(S.c).filter(k => S.c[k] && k.split('.')[0] == d);
const done = d => keys(d).length;
const dayPct = d => Math.round((done(d) / tot(d)) * 100);

function habitKeys(dIdx, h) {
  if (h.isWater) return [1, 2, 3].map(n => `${dIdx}.w${n}`);
  const list = [];
  if (h.isSupps) {
    D[dIdx][2].forEach((b, i) => (b[4] || []).forEach((_, s) => list.push(`${dIdx}.${i}.${s}`)));
    return list;
  }
  D[dIdx][2].forEach((b, i) => { if (h.match(b)) list.push(`${dIdx}.${i}`); });
  return list;
}
function habitStatus(dIdx, h) {
  const k = habitKeys(dIdx, h);
  if (!k.length) return 'na';
  const n = k.filter(x => S.c[x]).length;
  return n === 0 ? 'none' : n === k.length ? 'done' : 'part';
}
function streak(h) {
  let s = 0;
  for (let i = td; i >= 0; i--) {
    const st = habitStatus(i, h);
    if (st === 'na') continue;
    if (st === 'done') s++; else break;
  }
  return s;
}
function currentBlock(d) {
  let cur = -1;
  if (d === td) D[d][2].forEach((b, i) => { if (mm(b[0]) <= nowv()) cur = i; });
  return cur;
}

/* =========================================================================
   UI PRIMITIVES
   ========================================================================= */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}
function hydrateIcons(root = document) {
  root.querySelectorAll('.icon[data-icon]').forEach(el => { el.innerHTML = svg(el.dataset.icon); });
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('habits_theme', t);
  $$('[data-action="toggle-theme"]').forEach(b => {
    b.querySelector('.icon').innerHTML = svg(t === 'dark' ? 'sun' : 'moon');
    const l = b.querySelector('.theme-label');
    if (l) l.textContent = t === 'dark' ? 'Tema claro' : 'Tema oscuro';
    b.setAttribute('aria-label', t === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  });
  const meta = document.querySelectorAll('meta[name="theme-color"]');
  meta.forEach(m => m.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()));
  renderCharts();
}
function setView(v, push = true) {
  if (!VIEWS.includes(v)) v = 'hoy';
  view = v;
  VIEWS.forEach(id => { $('#view-' + id).hidden = id !== v; });
  $$('.nav-item[data-view], .tab[data-view]').forEach(b => {
    if (b.dataset.view === v) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (push && location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
  window.scrollTo({ top: 0 });
  if (v === 'finanzas') { revxFetch(); startRevxPolling(); } else stopRevxPolling();
  renderCharts();
}
function setRadio(group, attr, value) {
  group.querySelectorAll('[role="radio"]').forEach(b => {
    const on = b.dataset[attr] === value;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  });
}

/* =========================================================================
   RENDER: HOY
   ========================================================================= */
function renderStrips() {
  const kcalDay = i => (S.calaiMeals[i] || []).reduce((a, m) => a + Number(m.kcal || 0), 0);
  $$('[data-strip]').forEach(el => {
    const nutri = el.dataset.strip === 'nutri';
    el.innerHTML = D.map((d, i) => `
      <button type="button" class="day-btn${i === td ? ' is-today' : ''}" data-day="${i}" aria-pressed="${i === day}"
        aria-label="${d[0]}${i === td ? ' (hoy)' : ''}: ${nutri ? fmtNum(kcalDay(i)) + ' kcal' : dayPct(i) + ' % completado'}">
        <b>${d[1]}</b><small>${nutri ? fmtNum(kcalDay(i) / 1000, 1) + 'k' : dayPct(i) + '%'}</small>
      </button>`).join('');
  });
  $('#go-today').hidden = day === td;
}

function renderToday() {
  const now = new Date();
  $('#today-label').textContent = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, c => c.toUpperCase());
  $('#h-hoy').textContent = day === td ? 'Tu día' : D[day][0];

  const pct = dayPct(day);
  $('#day-pct').textContent = pct;
  $('#day-count').textContent = `${done(day)} de ${tot(day)} objetivos`;
  $('#day-bar').style.inlineSize = pct + '%';

  // Now card
  const blocks = D[day][2];
  const cur = currentBlock(day);
  let idx = cur;
  let label = 'Ahora';
  if (idx < 0 || S.c[`${day}.${idx}`]) {
    idx = blocks.findIndex((_, i) => !S.c[`${day}.${i}`] && (day !== td || i >= cur));
    label = day === td ? 'Siguiente' : 'Primer pendiente';
  }
  const nc = $('#now-card');
  if (idx < 0) {
    nc.innerHTML = `<p class="label">Bloques</p><p class="now-title">Todo hecho por ${day === td ? 'hoy' : 'este día'}.</p><p class="now-meta">Buen trabajo. Revisa la semana para ver tus rachas.</p>`;
  } else {
    const b = blocks[idx];
    nc.innerHTML = `
      <div class="now-top"><p class="label">${label}</p><span class="tag tag-accent">${esc(b[0])}</span></div>
      <p class="now-title">${esc(b[1])}</p>
      <p class="now-meta">${esc(CT[b[2]][1])}, ${esc(b[3])}</p>
      <div><button type="button" class="btn btn-primary" data-k="${day}.${idx}" data-force="1">${icon('check')}<span>Marcar como hecho</span></button></div>`;
  }

  // Timeline
  $('#agenda-sub').textContent = `${D[day][0]}: ${blocks.length} bloques`;
  const items = blocks.map((b, i) => {
    const k = `${day}.${i}`;
    const isDone = !!S.c[k];
    if (onlyPending && isDone) return '';
    const chips = (b[4] || []).map((s, j) => {
      const kk = `${k}.${j}`;
      return `<button type="button" class="chip" data-k="${kk}" aria-pressed="${!!S.c[kk]}">${icon('pill')}<span>${esc(s)}</span></button>`;
    }).join('');
    return `
      <li class="t-item${isDone ? ' is-done' : ''}${i === cur ? ' is-now' : ''}">
        <span class="t-time">${esc(b[0])}</span>
        <div class="t-body">
          <p class="t-title">${esc(b[1])}</p>
          <p class="t-meta">${icon(CT[b[2]][0])}<span>${esc(CT[b[2]][1])}, ${esc(b[3])}</span>${i === cur ? '<span class="tag tag-accent">Ahora</span>' : ''}</p>
          ${chips ? `<div class="chips" role="group" aria-label="Suplementos">${chips}</div>` : ''}
        </div>
        <button type="button" class="check" data-k="${k}" aria-pressed="${isDone}" aria-label="${isDone ? 'Desmarcar' : 'Marcar'}: ${esc(b[1])}">
          <span class="check-box">${icon('check')}</span>
        </button>
      </li>`;
  }).join('');
  $('#task-list').innerHTML = items || `<li class="empty">Todo completado. No quedan bloques pendientes.</li>`;
  $('#pending-switch').setAttribute('aria-checked', String(onlyPending));

  // Water
  const wDone = [1, 2, 3].filter(n => S.c[`${day}.w${n}`]).length;
  $('#water-status').textContent = `${wDone} / 3 L`;
  $('#water-row').innerHTML = [1, 2, 3].map(n => `
    <button type="button" data-k="${day}.w${n}" aria-pressed="${!!S.c[`${day}.w${n}`]}">${n} L</button>`).join('');

  // Tasks
  const notes = S.notes[day] || [];
  const pending = notes.filter(x => !x.done).length;
  $('#notes-counter').textContent = `${pending} pendiente${pending === 1 ? '' : 's'}`;
  $('#custom-tasks-list').innerHTML = notes.length ? notes.map(n => `
    <li class="${n.done ? 'is-done' : ''}">
      <button type="button" class="check check-sq" data-note="${n.id}" aria-pressed="${!!n.done}" aria-label="${n.done ? 'Desmarcar' : 'Marcar'}: ${esc(n.text)}">
        <span class="check-box">${icon('check')}</span>
      </button>
      <span class="ct-text">${esc(n.text)}${n.fromBB ? ' <span class="tag">Blackboard</span>' : ''}</span>
      <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="note" data-id="${n.id}" aria-label="Eliminar tarea: ${esc(n.text)}">${icon('trash')}</button>
    </li>`).join('') : `<li class="empty">Sin tareas para el ${D[day][0].toLowerCase()}.</li>`;

  // Next exam
  const nx = upcomingExams()[0];
  $('#next-exam').innerHTML = nx ? `
    <div class="next-exam">
      <p class="next-exam-name">${esc(nx.name)}</p>
      <p class="muted small">${nx.dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <div>${countdown(nx.diff)}</div>
    </div>` : `<p class="muted small">No hay exámenes próximos.</p>`;
}

/* =========================================================================
   RENDER: SEMANA
   ========================================================================= */
function renderWeek() {
  const m = mon();
  const e = new Date(m); e.setDate(e.getDate() + 6);
  const f = x => x.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  $('#week-label').textContent = `Semana del ${f(m)} al ${f(e)}`;

  let tw = 0, dw = 0;
  D.forEach((_, i) => { tw += tot(i); dw += done(i); });
  $('#week-pct').textContent = Math.round((dw / tw) * 100);
  $('#kpi-done').textContent = fmtNum(dw);

  const ks = keys(day);
  const supTotal = D[day][2].reduce((a, b) => a + (b[4] || []).length, 0);
  const supDone = ks.filter(k => k.split('.').length === 3).length;
  const wDone = ks.filter(k => k.includes('.w')).length;
  $('#kpi-supps').textContent = `${supDone + wDone}/${supTotal + 3}`;

  // Matrix
  const head = `<thead><tr><th scope="col"><span class="sr-only">Hábito</span></th>${D.map((d, i) => `<th scope="col" class="${i === day ? 'is-active' : ''}"><abbr title="${d[0]}">${d[1]}</abbr></th>`).join('')}</tr></thead>`;
  const body = KEY_HABITS.map(h => `
    <tr>
      <th scope="row">${esc(h.short)}</th>
      ${D.map((d, i) => {
        const st = habitStatus(i, h);
        if (st === 'na') return `<td><span class="m-na" aria-label="${d[0]}: no aplica">${icon('half')}</span></td>`;
        const word = st === 'done' ? 'hecho' : st === 'part' ? 'parcial' : 'pendiente';
        return `<td><button type="button" class="m-cell" data-habit="${h.id}" data-hday="${i}" data-state="${st}" aria-label="${esc(h.name)}, ${d[0]}: ${word}">${st === 'done' ? icon('check') : st === 'part' ? icon('half') : ''}</button></td>`;
      }).join('')}
    </tr>`).join('');
  $('#matrix-table').innerHTML = `<caption class="sr-only">Estado de cada hábito por día de la semana</caption>${head}<tbody>${body}</tbody>`;

  // Streaks, ranked
  const st = KEY_HABITS.map(h => ({ h, s: streak(h) })).sort((a, b) => b.s - a.s);
  $('#streaks-list').innerHTML = st.map(({ h, s }) => `
    <li class="rank-item">
      ${icon(h.icon)}
      <span class="rank-name">${esc(h.name)}</span>
      <span class="rank-val">${s} ${s === 1 ? 'día' : 'días'}</span>
      <span class="rank-bar" aria-hidden="true"><span style="inline-size:${Math.round((s / 7) * 100)}%"></span></span>
    </li>`).join('');
}

/* =========================================================================
   RENDER: UNIVERSIDAD
   ========================================================================= */
function upcomingExams() {
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  return (S.exams || []).map(x => {
    const dateObj = new Date(x.date + 'T00:00:00');
    return { ...x, dateObj, diff: Math.ceil((dateObj - t0) / 86400000) };
  }).filter(x => x.diff >= 0).sort((a, b) => a.diff - b.diff);
}
function countdown(diff) {
  const txt = diff === 0 ? 'Es hoy' : diff === 1 ? 'Mañana' : diff > 0 ? `En ${diff} días` : 'Finalizado';
  const state = diff < 0 ? 'past' : diff <= 3 ? 'urgent' : '';
  return `<span class="countdown" ${state ? `data-state="${state}"` : ''}>${txt}</span>`;
}
function renderUni() {
  const exams = [...(S.exams || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  $('#exams-counter').textContent = `${exams.length} programado${exams.length === 1 ? '' : 's'}`;
  $('#exams-list').innerHTML = exams.length ? exams.map(x => {
    const dt = new Date(x.date + 'T00:00:00');
    const diff = Math.ceil((dt - t0) / 86400000);
    return `
      <li class="row">
        <div class="row-text">
          <span class="row-title">${esc(x.name)}${x.fromBB ? ' <span class="tag">Blackboard</span>' : ''}</span>
          <span class="row-sub">${dt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div class="row-end">
          ${countdown(diff)}
          <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="exam" data-id="${x.id}" aria-label="Eliminar ${esc(x.name)}">${icon('trash')}</button>
        </div>
      </li>`;
  }).join('') : `<li class="empty">No hay exámenes registrados. Añade uno o sincroniza Blackboard.</li>`;

  const nx = upcomingExams()[0];
  $('#uni-lead').innerHTML = nx ? `
    <p class="label">Próximo examen</p>
    <p class="hero-num">${nx.diff}<span class="hero-unit">${nx.diff === 1 ? 'día' : 'días'}</span></p>
    <p class="strong">${esc(nx.name)}</p>
    <p class="muted small">${nx.dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>` : `
    <p class="label">Próximo examen</p>
    <p class="hero-num">0<span class="hero-unit">pendientes</span></p>
    <p class="muted small">Cuando añadas un examen verás aquí la cuenta atrás.</p>`;
}

/* =========================================================================
   RENDER: FINANZAS
   ========================================================================= */
function financeTotals() {
  const p = S.projects;
  const trades = p.trades || [];
  const pnl = trades.reduce((a, t) => a + Number(t.profit || 0), 0);
  const journal = Number(p.initialCapital || 0) + pnl;
  const clip = (p.clipping || []).reduce((a, c) => a + Number(c.money || 0), 0);
  const hustle = (p.sideHustles || []).reduce((a, h) => a + Number(h.amount || 0), 0);
  const revx = REVX.data && typeof REVX.data.totalEur === 'number' ? REVX.data.totalEur : null;
  const invest = revx ?? journal;
  return { trades, pnl, journal, clip, hustle, revx, invest, total: invest + clip + hustle };
}

function renderFinance() {
  const t = financeTotals();
  const p = S.projects;

  $('#wealth-total').textContent = fmtMoney(t.total);
  $('#wealth-sub').textContent = t.revx !== null ? 'Revolut X en vivo, clipping e ingresos extra' : 'Diario de trading, clipping e ingresos extra';
  const parts = [
    { name: t.revx !== null ? 'Revolut X' : 'Inversiones', v: Math.max(0, t.invest), cls: 'seg-1' },
    { name: 'Clipping', v: Math.max(0, t.clip), cls: 'seg-2' },
    { name: 'Ingresos extra', v: Math.max(0, t.hustle), cls: 'seg-3' }
  ];
  const sum = parts.reduce((a, x) => a + x.v, 0) || 1;
  $('#wealth-bar').innerHTML = parts.map(x => `<span class="${x.cls}" style="flex-grow:${x.v / sum}"></span>`).join('');
  $('#wealth-bar').setAttribute('aria-label', 'Composición: ' + parts.map(x => `${x.name} ${Math.round((x.v / sum) * 100)} %`).join(', '));
  $('#wealth-legend').innerHTML = parts.map(x => `
    <li><span class="lg-name"><span class="swatch ${x.cls}" aria-hidden="true"></span>${x.name}</span><b>${fmtMoney(x.v)}</b></li>`).join('');

  renderRevx();

  // Trading journal
  const wins = t.trades.filter(x => Number(x.profit) > 0).length;
  const rrT = t.trades.filter(x => x.rr !== null && x.rr !== undefined && !isNaN(x.rr));
  const base = Number(p.initialCapital || 0);
  $('#trading-total-val').textContent = fmtMoney(t.journal);
  $('#trading-winrate').textContent = (t.trades.length ? Math.round((wins / t.trades.length) * 100) : 0) + '%';
  $('#trading-avg-rr').textContent = (rrT.length ? (rrT.reduce((a, b) => a + Number(b.rr), 0) / rrT.length) : 0).toFixed(2) + 'R';
  $('#trading-ops-count').textContent = t.trades.length;
  const badge = $('#trading-pnl-badge');
  badge.dataset.trend = t.pnl >= 0 ? 'up' : 'down';
  badge.innerHTML = `${icon(t.pnl >= 0 ? 'up' : 'down')}<span>${fmtSigned(t.pnl)} (${base > 0 ? fmtPct((t.pnl / base) * 100) : '0 %'})</span>`;
  const cap = $('#initial-cap-input');
  if (document.activeElement !== cap) cap.value = base;

  $('#trades-list').innerHTML = t.trades.length ? [...t.trades].reverse().map(x => {
    const up = Number(x.profit) >= 0;
    const rr = x.rr !== null && x.rr !== undefined && !isNaN(x.rr) ? `${Number(x.rr) >= 0 ? '+' : ''}${x.rr}R` : '';
    return `
      <li class="row">
        <div class="row-text">
          <span class="row-title">${esc(x.label)} <span class="tag">${x.side === 'SHORT' ? 'Short' : 'Long'}</span>${rr ? ` <span class="tag">${rr}</span>` : ''}</span>
          <span class="row-sub">${esc(x.date)}${x.buyPrice !== undefined ? ` . ${x.buyPrice} a ${x.sellPrice}` : ''}${x.slPrice ? ` . SL ${x.slPrice}` : ''}${x.qty ? ` . ${x.qty} uds` : ''}</span>
        </div>
        <div class="row-end">
          <span class="amount ${up ? 'amount-up' : 'amount-down'}">${fmtSigned(x.profit)}</span>
          <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="trade" data-id="${x.id}" aria-label="Eliminar operación ${esc(x.label)}">${icon('trash')}</button>
        </div>
      </li>`;
  }).join('') : `<li class="empty">Aún no hay operaciones registradas.</li>`;

  // YouTube
  $('#yt-subs').textContent = fmtNum(p.ytSubs || 0);

  // Clipping
  const clips = p.clipping || [];
  const views = clips.reduce((a, c) => a + Number(c.views || 0), 0);
  $('#clip-money-total').textContent = fmtMoney(t.clip);
  $('#clip-views-total').textContent = fmtNum(views);
  $('#clip-count').textContent = clips.length;
  $('#clip-rpm').textContent = 'RPM ' + fmtMoney(views > 0 ? t.clip / (views / 1000) : 0);
  $('#clip-list').innerHTML = clips.length ? [...clips].reverse().map(c => `
    <li class="row">
      <div class="row-text"><span class="row-title">${esc(c.title)}</span><span class="row-sub">${fmtNum(c.views)} views . ${esc(c.date)}</span></div>
      <div class="row-end"><span class="amount">${fmtMoney(c.money)}</span>
        <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="clip" data-id="${c.id}" aria-label="Eliminar ${esc(c.title)}">${icon('trash')}</button></div>
    </li>`).join('') : `<li class="empty">Sin lotes registrados.</li>`;

  // Hustles
  const hs = p.sideHustles || [];
  $('#hustles-total').textContent = fmtMoney(t.hustle);
  $('#hustle-list').innerHTML = hs.length ? [...hs].reverse().map(h => `
    <li class="row">
      <div class="row-text"><span class="row-title">${esc(h.name)}</span><span class="row-sub">${esc(h.date)}</span></div>
      <div class="row-end"><span class="amount">${fmtMoney(h.amount)}</span>
        <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="hustle" data-id="${h.id}" aria-label="Eliminar ${esc(h.name)}">${icon('trash')}</button></div>
    </li>`).join('') : `<li class="empty">Sin ingresos extra apuntados.</li>`;
}

/* =========================================================================
   REVOLUT X (live, via /api/revolutx on Vercel)
   ========================================================================= */
function renderRevx() {
  const st = $('#revx-status');
  const d = REVX.data;
  const labels = { idle: 'Sin conectar', loading: 'Actualizando', ok: 'En vivo', error: 'Error' };
  st.dataset.state = REVX.state;
  st.querySelector('span:last-child').textContent = labels[REVX.state];
  $('#revx-refresh').setAttribute('aria-busy', String(REVX.state === 'loading'));
  $('#revx-refresh').classList.toggle('is-error', REVX.state === 'error');

  const upd = $('#revx-updated');
  if (REVX.state === 'error') upd.textContent = REVX.error;
  else if (!IS_HOSTED) upd.textContent = 'Disponible al desplegar en Vercel';
  else if (d && d.updatedAt) upd.textContent = 'Actualizado a las ' + new Date(d.updatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  else upd.textContent = 'Sin conectar';

  $('#revx-total').textContent = d ? fmtMoney(d.totalEur) : '--';
  const ch = $('#revx-change');
  if (d && typeof d.change24hEur === 'number') {
    const up = d.change24hEur >= 0;
    ch.dataset.trend = up ? 'up' : 'down';
    ch.innerHTML = `${icon(up ? 'up' : 'down')}<span>${fmtSigned(d.change24hEur)} (${fmtPct(d.change24hPct || 0)}) en 24 h</span>`;
  } else { ch.innerHTML = ''; delete ch.dataset.trend; }

  const rows = d && Array.isArray(d.holdings) ? d.holdings : [];
  $('#revx-rows').innerHTML = rows.length ? rows.map(h => {
    const up = (h.change24hPct || 0) >= 0;
    const hasChg = typeof h.change24hPct === 'number';
    return `
      <tr>
        <td><div class="asset"><span class="asset-mark" aria-hidden="true">${esc(h.currency.slice(0, 3))}</span>
          <div class="asset-text"><b>${esc(h.currency)}</b><small>${fmtQty(h.amount)}${h.staked ? ` . ${fmtQty(h.staked)} en staking` : ''}</small></div></div></td>
        <td class="num">${h.priceEur ? fmtPrice(h.priceEur) : '--'}</td>
        <td class="num col-hide-sm">${hasChg ? `<span class="chg" data-trend="${up ? 'up' : 'down'}">${icon(up ? 'up' : 'down')}${fmtPct(h.change24hPct)}</span>` : '--'}</td>
        <td class="num"><b>${h.valueEur !== null && h.valueEur !== undefined ? fmtMoney(h.valueEur) : '--'}</b></td>
      </tr>`;
  }).join('') : `<tr><td colspan="4" class="empty">${IS_HOSTED ? 'Conecta tu cuenta en Vercel para ver tus posiciones.' : 'Las posiciones aparecerán cuando la app esté desplegada en Vercel.'}</td></tr>`;
}

async function revxFetch(manual = false) {
  if (!IS_HOSTED) { REVX.state = 'idle'; renderRevx(); return; }
  if (REVX.state === 'loading') return;
  REVX.state = 'loading';
  renderRevx();
  try {
    const token = localStorage.getItem('habits_dash_token') || '';
    const res = await fetch('/api/revolutx', { cache: 'no-store', headers: token ? { 'x-dashboard-token': token } : {} });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      REVX.state = 'error';
      REVX.error = (json && json.error) || `No se pudo conectar (código ${res.status})`;
      if (res.status === 401) $('#revx-config').open = true;
    } else {
      REVX.state = 'ok';
      REVX.error = '';
      REVX.data = json;
      S.projects.revxCache = json;
      save();
      if (manual) toast('Revolut X actualizado');
    }
  } catch (e) {
    REVX.state = 'error';
    REVX.error = 'Sin conexión con el servidor';
  }
  renderFinance();
}
function startRevxPolling() {
  stopRevxPolling();
  if (!IS_HOSTED) return;
  REVX.timer = setInterval(() => { if (!document.hidden && view === 'finanzas') revxFetch(); }, 30000);
}
function stopRevxPolling() { if (REVX.timer) clearInterval(REVX.timer); REVX.timer = null; }

/* =========================================================================
   RENDER: NUTRICIÓN
   ========================================================================= */
function dayTotals() {
  return D.map((_, i) => {
    const l = S.calaiMeals[i] || [];
    const s = k => l.reduce((a, m) => a + Number(m[k] || 0), 0);
    return { k: s('kcal'), p: s('prot'), c: s('carbs'), f: s('fat'), n: l.length };
  });
}
function renderNutri() {
  const g = S.calaiGoals;
  const dt = dayTotals();
  const cur = dt[day];
  $('#nutri-day-label').textContent = day === td ? 'Hoy' : D[day][0];
  $('#kcal-day').textContent = fmtNum(cur.k);
  $('#kcal-goal').textContent = `/ ${fmtNum(g.dailyKcal)} kcal`;
  $('#kcal-bar').style.inlineSize = Math.min(100, Math.round((cur.k / g.dailyKcal) * 100)) + '%';
  const wk = dt.reduce((a, x) => ({ k: a.k + x.k, p: a.p + x.p, c: a.c + x.c, f: a.f + x.f }), { k: 0, p: 0, c: 0, f: 0 });
  $('#kcal-week').textContent = `${fmtNum(wk.k)} kcal esta semana de ${fmtNum(g.dailyKcal * 7)}`;
  $('#wk-prot').textContent = fmtNum(wk.p) + ' g';
  $('#wk-carbs').textContent = fmtNum(wk.c) + ' g';
  $('#wk-fat').textContent = fmtNum(wk.f) + ' g';
  $('#nutri-goal-tag').textContent = `Meta ${fmtNum(g.dailyKcal)} kcal`;

  // Macro goals: protein from settings, carbs and fat derived from the remaining kcal (50/50 split).
  const restKcal = Math.max(0, g.dailyKcal - g.dailyProt * 4);
  const goalC = Math.round((restKcal * 0.5) / 4);
  const goalF = Math.round((restKcal * 0.5) / 9);
  const macro = (name, v, goal, cls) => `
    <li class="macro-item">
      <span class="macro-name">${name}</span>
      <span class="macro-val">${fmtNum(v)} / ${fmtNum(goal)} g</span>
      <div class="progress ${cls}" aria-hidden="true"><span style="inline-size:${Math.min(100, Math.round((v / (goal || 1)) * 100))}%"></span></div>
    </li>`;
  $('#macro-list').innerHTML = macro('Proteína', cur.p, g.dailyProt, '') + macro('Carbohidratos', cur.c, goalC, 'is-c') + macro('Grasas', cur.f, goalF, 'is-f');

  // AI status
  const hasKey = !!localStorage.getItem('nexora_ai_key');
  const ai = $('#ai-status');
  ai.dataset.state = hasKey ? 'ok' : '';
  ai.querySelector('span:last-child').textContent = hasKey ? `IA activa (${aiProvider === 'openai' ? 'OpenAI' : 'Gemini'})` : 'IA sin configurar';

  if (!currentMealThumb && !$('#dropzone').dataset.state) resetDropzone();

  const meals = S.calaiMeals[day] || [];
  $('#meals-list').innerHTML = meals.length ? [...meals].reverse().map(m => `
    <li class="row">
      <div class="row-main">
        ${m.thumb ? `<img class="thumb" src="${m.thumb}" alt="">` : `<span class="thumb thumb-icon">${icon('utensils')}</span>`}
        <div class="row-text"><span class="row-title">${esc(m.name)}</span>
          <span class="row-sub">${esc(m.time)} . ${m.prot} g P . ${m.carbs} g C . ${m.fat} g G</span></div>
      </div>
      <div class="row-end"><span class="amount">${fmtNum(m.kcal)} kcal</span>
        <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="meal" data-id="${m.id}" aria-label="Eliminar ${esc(m.name)}">${icon('trash')}</button></div>
    </li>`).join('') : `<li class="empty">Sin comidas el ${D[day][0].toLowerCase()}.</li>`;
}
function resetDropzone() {
  const dz = $('#dropzone');
  delete dz.dataset.state;
  $('#dropzone-inner').innerHTML = `${icon('camera')}<span class="dropzone-title">Hacer foto o elegir imagen</span><span class="muted small" id="ai-scan-status">La IA estimará calorías y macros</span>`;
}

/* =========================================================================
   CHARTS (inline SVG sized to the real container width, no library)
   ========================================================================= */
function smoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M${pts[0].x},${pts[0].y}` : '';
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = (b.x - a.x) * 0.45;
    d += ` C${(a.x + dx).toFixed(1)},${a.y.toFixed(1)} ${(b.x - dx).toFixed(1)},${b.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }
  return d;
}
function chartBox(el) {
  const w = Math.max(240, Math.round(el.clientWidth || 600));
  const probe = el.querySelector('svg');
  const h = probe ? Math.round(probe.getBoundingClientRect().height) || 176 : 176;
  return { w, h };
}
function renderWeekChart() {
  const el = $('#week-chart');
  if (!el || el.closest('[hidden]')) return;
  const pcts = D.map((_, i) => dayPct(i));
  if (!el.querySelector('svg')) el.innerHTML = '<svg></svg>';
  const { w, h } = chartBox(el);
  const pad = 8, col = w / 7;
  const pts = pcts.map((v, i) => ({ x: col * i + col / 2, y: pad + (h - pad * 2) * (1 - v / 100) }));
  const line = smoothPath(pts);
  const area = `${line} L${pts[6].x},${h} L${pts[0].x},${h} Z`;
  const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / 7);
  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Cumplimiento diario: ${D.map((d, i) => `${d[0]} ${pcts[i]} %`).join(', ')}. Media ${avg} %.">
      <line class="c-grid" x1="0" x2="${w}" y1="${h - pad}" y2="${h - pad}"/>
      <line class="c-grid" x1="0" x2="${w}" y1="${pad + (h - pad * 2) / 2}" y2="${pad + (h - pad * 2) / 2}"/>
      <line class="c-guide" x1="${pts[day].x}" x2="${pts[day].x}" y1="0" y2="${h}"/>
      <path class="c-area" d="${area}"/>
      <path class="c-line" d="${line}"/>
      ${pts.map((p, i) => `<circle class="c-dot${i === day ? ' c-dot-active' : ''}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i === day ? 5 : 3.5}"/>`).join('')}
    </svg>
    <div class="chart-x">${D.map((d, i) => `<button type="button" data-day="${i}" aria-pressed="${i === day}" aria-label="${d[0]}, ${pcts[i]} %">${d[1]}<small>${pcts[i]}%</small></button>`).join('')}</div>`;
}
function renderTradingChart() {
  const el = $('#trading-chart');
  if (!el || el.closest('[hidden]')) return;
  const base = Number(S.projects.initialCapital || 0);
  const trades = S.projects.trades || [];
  const vals = [base];
  trades.forEach(t => vals.push(vals[vals.length - 1] + Number(t.profit || 0)));
  if (!el.querySelector('svg')) el.innerHTML = '<svg></svg>';
  const { w, h } = chartBox(el);
  const pad = 10;
  const min = Math.min(...vals, base * 0.97), max = Math.max(...vals, base * 1.03, min + 1);
  const y = v => pad + (h - pad * 2) * (1 - (v - min) / (max - min));
  const n = vals.length;
  const pts = vals.map((v, i) => ({ x: n === 1 ? w / 2 : pad + (w - pad * 2) * (i / (n - 1)), y: y(v) }));
  const last = vals[n - 1];
  const up = last >= base;
  const line = n === 1 ? `M${pad},${pts[0].y} L${w - pad},${pts[0].y}` : smoothPath(pts);
  const area = n === 1 ? '' : `${line} L${pts[n - 1].x},${h} L${pts[0].x},${h} Z`;
  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolución de la cartera del diario: de ${fmtMoney(base)} a ${fmtMoney(last)} en ${trades.length} operaciones.">
      <line class="c-base" x1="0" x2="${w}" y1="${y(base)}" y2="${y(base)}"/>
      ${area ? `<path class="c-area" d="${area}"/>` : ''}
      <path class="c-line ${up ? 'c-up' : 'c-down'}" d="${line}"/>
      <circle class="c-dot ${up ? 'c-up' : 'c-down'}" cx="${pts[n - 1].x.toFixed(1)}" cy="${pts[n - 1].y.toFixed(1)}" r="4"/>
    </svg>
    <div class="chart-ends"><span>Inicio ${fmtMoney(base)}</span><span>Ahora ${fmtMoney(last)}</span></div>`;
}
function renderNutriChart() {
  const el = $('#nutri-week-chart');
  if (!el || el.closest('[hidden]')) return;
  const dt = dayTotals();
  const goal = S.calaiGoals.dailyKcal || 2600;
  if (!el.querySelector('svg')) el.innerHTML = '<svg></svg>';
  const { w, h } = chartBox(el);
  const pad = 6, col = w / 7, bw = Math.min(36, col * 0.56);
  const max = Math.max(goal * 1.15, ...dt.map(x => x.k));
  const y = v => h - pad - (h - pad * 2) * (v / max);
  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Calorías por día frente a la meta de ${fmtNum(goal)}: ${D.map((d, i) => `${d[0]} ${fmtNum(dt[i].k)}`).join(', ')}.">
      <line class="c-grid" x1="0" x2="${w}" y1="${h - pad}" y2="${h - pad}"/>
      ${dt.map((x, i) => { const top = y(x.k); return `<rect class="c-bar${i === day ? ' c-bar-active' : ''}" x="${(col * i + (col - bw) / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, h - pad - top).toFixed(1)}" rx="4"/>`; }).join('')}
      <line class="c-goal" x1="0" x2="${w}" y1="${y(goal)}" y2="${y(goal)}"/>
    </svg>
    <div class="chart-x">${D.map((d, i) => `<button type="button" data-day="${i}" aria-pressed="${i === day}" aria-label="${d[0]}, ${fmtNum(dt[i].k)} kcal">${d[1]}<small>${fmtNum(dt[i].k / 1000, 1)}k</small></button>`).join('')}</div>`;
}
function renderCharts() { renderWeekChart(); renderTradingChart(); renderNutriChart(); }

/* =========================================================================
   RENDER ALL
   ========================================================================= */
function render() {
  renderStrips();
  renderToday();
  renderWeek();
  renderUni();
  renderFinance();
  renderNutri();
  renderCharts();
}

/* =========================================================================
   NETWORK: Blackboard ICS + YouTube (server proxy on Vercel, public fallbacks locally)
   ========================================================================= */
async function fetchText(url, mustContain) {
  const tries = [];
  if (IS_HOSTED) tries.push(`/api/proxy?url=${encodeURIComponent(url)}`);
  tries.push(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  );
  for (const u of tries) {
    try {
      const res = await fetch(u, { cache: 'no-store' });
      if (res.ok) { const t = await res.text(); if (t && (!mustContain || t.includes(mustContain))) return t; }
    } catch (e) { /* next */ }
  }
  throw new Error('fetch failed');
}
function parseIcsDate(val) {
  if (!val) return null;
  const m = val.replace(/^.*:/, '').trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  const a = [+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)];
  return m[7] === 'Z' ? new Date(Date.UTC(...a)) : new Date(...a);
}
function parseIcs(raw) {
  return raw.replace(/\r?\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1).map(block => {
    const body = block.split('END:VEVENT')[0];
    let id = '', summary = '', start = null, end = null;
    body.split(/\r?\n/).forEach(line => {
      if (line.startsWith('UID')) id = line.split(':').slice(1).join(':').trim();
      else if (line.startsWith('SUMMARY')) summary = line.split(':').slice(1).join(':').trim().replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ');
      else if (line.startsWith('DTSTART')) start = parseIcsDate(line);
      else if (line.startsWith('DTEND')) end = parseIcsDate(line);
    });
    const date = start || end;
    return summary && date && !isNaN(date) ? { uid: id || summary + '_' + date.toISOString(), summary, date } : null;
  }).filter(Boolean);
}
function setBB(state, text) {
  $$('[data-bb-dot]').forEach(d => { d.dataset.state = state; });
  $$('[data-bb-text]').forEach(t => { t.textContent = text; });
  const b = $('#bb-sync-btn');
  if (b) b.setAttribute('aria-busy', String(state === 'loading'));
}
async function syncBlackboard(manual = false) {
  setBB('loading', 'Sincronizando Blackboard');
  try {
    const events = parseIcs(await fetchText(BLACKBOARD_ICS_URL, 'BEGIN:VCALENDAR'));
    const wMon = mon();
    const wSun = new Date(wMon); wSun.setDate(wSun.getDate() + 6); wSun.setHours(23, 59, 59, 999);
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    let added = 0;
    events.forEach(ev => {
      if (S.bbSyncedUids[ev.uid]) return;
      const dateStr = ev.date.toISOString().slice(0, 10);
      const examLike = /examen|parcial|control|prueba|convocatoria|test|final/i.test(ev.summary);
      if (ev.date >= wMon && ev.date <= wSun) {
        const di = (ev.date.getDay() + 6) % 7;
        S.notes[di] = S.notes[di] || [];
        if (!S.notes[di].some(n => n.bbUid === ev.uid || n.text === ev.summary)) {
          const hr = ev.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          S.notes[di].push({ id: uid(), text: `${ev.summary} (${hr})`, done: false, fromBB: true, bbUid: ev.uid });
          added++;
        }
      }
      if (ev.date >= t0 && (examLike || ev.date > wSun)) {
        if (!S.exams.some(x => x.bbUid === ev.uid || (x.name === ev.summary && x.date === dateStr))) {
          S.exams.push({ id: uid(), name: ev.summary, date: dateStr, fromBB: true, bbUid: ev.uid });
          added++;
        }
      }
      S.bbSyncedUids[ev.uid] = true;
    });
    S.exams.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    render();
    setBB('ok', added ? `Blackboard: ${added} nuevas` : 'Blackboard al día');
    if (manual) toast(added ? `${added} elementos nuevos de Blackboard` : 'Blackboard ya estaba al día');
  } catch (e) {
    setBB('error', 'Blackboard sin conexión');
    if (manual) toast('No se pudo conectar con Blackboard');
  }
}
async function fetchYtSubs(manual = false) {
  const note = $('#yt-note');
  if (manual) note.textContent = 'Consultando YouTube';
  try {
    const html = await fetchText(YT_URL);
    const m = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/) || html.match(/"metadataParts":\[\{"text":\{"content":"([^"]*suscriptor[^"]*)"/i);
    if (m && m[1]) {
      const n = parseInt(m[1].replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > 0 && !/mil|k|M/.test(m[1])) { S.projects.ytSubs = n; save(); renderFinance(); }
      note.textContent = `YouTube: ${m[1]}`;
      return;
    }
  } catch (e) { /* ignore */ }
  note.textContent = 'Suscriptores (actualiza a mano si no carga)';
}

/* =========================================================================
   CAL AI
   ========================================================================= */
function compressImage(file, maxW = 800, q = 0.78) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, maxW / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', q));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
async function handleMealPhoto(file) {
  const dz = $('#dropzone');
  const inner = $('#dropzone-inner');
  dz.dataset.state = 'loading';
  try {
    const dataUrl = await compressImage(file, 760, 0.75);
    currentMealThumb = await compressImage(file, 140, 0.6);
    inner.innerHTML = `<img src="${dataUrl}" alt="Foto del plato"><span class="small strong" id="ai-scan-status">Analizando con IA</span>`;
    const key = localStorage.getItem('nexora_ai_key');
    if (!key) {
      dz.dataset.state = 'error';
      $('#ai-scan-status').textContent = 'Configura la IA abajo o escribe los valores a mano.';
      $('#ai-config').open = true;
      return;
    }
    const prompt = 'Analiza esta foto de comida como un nutricionista experto. Estima calorías y macronutrientes totales del plato. Responde solo con JSON válido: {"name":"Nombre breve en español","kcal":550,"protein":38,"carbs":45,"fat":18}';
    let out;
    if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', response_format: { type: 'json_object' }, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: dataUrl } }] }] })
      });
      if (!res.ok) throw new Error('openai');
      out = JSON.parse((await res.json()).choices?.[0]?.message?.content || '{}');
    } else {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: dataUrl.split(',')[1] } }] }], generationConfig: { responseMimeType: 'application/json' } })
      });
      if (!res.ok) throw new Error('gemini');
      const raw = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      out = JSON.parse(raw.replace(/```json|```/g, '').trim());
    }
    $('#meal-name').value = out.name || 'Comida escaneada';
    $('#meal-kcal').value = Math.round(+out.kcal || 0);
    $('#meal-prot').value = Math.round(+out.protein || 0);
    $('#meal-carbs').value = Math.round(+out.carbs || 0);
    $('#meal-fat').value = Math.round(+out.fat || 0);
    dz.dataset.state = 'ok';
    $('#ai-scan-status').textContent = 'Análisis listo. Revisa los valores y guarda.';
  } catch (e) {
    dz.dataset.state = 'error';
    const st = $('#ai-scan-status');
    if (st) st.textContent = 'No se pudo analizar. Revisa la clave o escribe los valores.';
  }
}

/* =========================================================================
   ACTIONS
   ========================================================================= */
function toggleKey(k, force) {
  if (force) S.c[k] = true; else S.c[k] = !S.c[k];
  if (!S.c[k]) delete S.c[k];
  save();
  render();
}
function toggleHabit(dIdx, id) {
  const h = KEY_HABITS.find(x => x.id === id);
  const k = habitKeys(dIdx, h);
  const all = k.every(x => S.c[x]);
  k.forEach(x => { if (all) delete S.c[x]; else S.c[x] = true; });
  save();
  render();
}
function deleteItem(type, id) {
  const p = S.projects;
  if (type === 'note') S.notes[day] = (S.notes[day] || []).filter(x => x.id !== id);
  if (type === 'exam') S.exams = S.exams.filter(x => x.id !== id);
  if (type === 'trade') p.trades = p.trades.filter(x => x.id !== id);
  if (type === 'clip') p.clipping = p.clipping.filter(x => x.id !== id);
  if (type === 'hustle') p.sideHustles = p.sideHustles.filter(x => x.id !== id);
  if (type === 'meal') S.calaiMeals[day] = (S.calaiMeals[day] || []).filter(x => x.id !== id);
  save();
  render();
  toast('Eliminado');
}
function armReset(btn) {
  if (!resetArmed) {
    btn.textContent = 'Confirmar reinicio';
    btn.setAttribute('aria-pressed', 'true');
    resetArmed = setTimeout(() => { resetArmed = null; btn.textContent = 'Reiniciar'; btn.removeAttribute('aria-pressed'); }, 4000);
    return;
  }
  clearTimeout(resetArmed);
  resetArmed = null;
  S.c = {};
  S.calaiMeals = {};
  save();
  btn.textContent = 'Reiniciar';
  btn.removeAttribute('aria-pressed');
  render();
  toast('Semana reiniciada');
}
function autoCalcTrade() {
  const buy = parseFloat($('#trade-buy').value), sell = parseFloat($('#trade-sell').value);
  const sl = parseFloat($('#trade-sl').value), qty = parseFloat($('#trade-qty').value);
  if (isNaN(buy) || isNaN(sell)) return;
  const diff = tradeSide === 'LONG' ? sell - buy : buy - sell;
  if (!isNaN(qty) && qty > 0) $('#trade-profit').value = (diff * qty).toFixed(2);
  if (!isNaN(sl) && Math.abs(buy - sl) > 0) $('#trade-rr').value = (diff / Math.abs(buy - sl)).toFixed(2);
}

const forms = {
  task(f) {
    const i = $('#custom-task-input'); const text = i.value.trim(); if (!text) return;
    (S.notes[day] = S.notes[day] || []).push({ id: uid(), text, done: false });
    i.value = '';
  },
  exam() {
    const n = $('#exam-name-input'), d = $('#exam-date-input');
    if (!n.value.trim() || !d.value) return;
    S.exams.push({ id: uid(), name: n.value.trim(), date: d.value });
    S.exams.sort((a, b) => new Date(a.date) - new Date(b.date));
    n.value = ''; d.value = '';
    toast('Examen añadido');
  },
  trade() {
    const label = $('#trade-label').value.trim().toUpperCase();
    const buy = parseFloat($('#trade-buy').value), sell = parseFloat($('#trade-sell').value);
    const sl = parseFloat($('#trade-sl').value), qty = parseFloat($('#trade-qty').value);
    const profit = parseFloat($('#trade-profit').value);
    let rr = parseFloat($('#trade-rr').value);
    if (!label || isNaN(buy) || isNaN(sell) || isNaN(profit)) return;
    if (isNaN(rr) && !isNaN(sl) && sl !== buy) rr = Number(((tradeSide === 'LONG' ? sell - buy : buy - sell) / Math.abs(buy - sl)).toFixed(2));
    S.projects.trades.push({ id: uid(), label, side: tradeSide, buyPrice: buy, sellPrice: sell, slPrice: isNaN(sl) ? null : sl, qty: isNaN(qty) ? null : qty, profit, rr: isNaN(rr) ? null : rr, date: shortDate() });
    ['trade-label', 'trade-buy', 'trade-sell', 'trade-sl', 'trade-qty', 'trade-profit', 'trade-rr'].forEach(id => { $('#' + id).value = ''; });
    toast('Operación registrada');
  },
  clip() {
    const title = $('#clip-title').value.trim(); if (!title) return;
    S.projects.clipping.push({ id: uid(), title, views: parseInt($('#clip-views').value, 10) || 0, money: parseFloat($('#clip-money').value) || 0, date: shortDate() });
    ['clip-title', 'clip-views', 'clip-money'].forEach(id => { $('#' + id).value = ''; });
  },
  hustle() {
    const name = $('#hustle-name').value.trim(); if (!name) return;
    S.projects.sideHustles.push({ id: uid(), name, amount: parseFloat($('#hustle-amount').value) || 0, date: shortDate() });
    ['hustle-name', 'hustle-amount'].forEach(id => { $('#' + id).value = ''; });
  },
  meal() {
    const name = $('#meal-name').value.trim(); if (!name) return;
    (S.calaiMeals[day] = S.calaiMeals[day] || []).push({
      id: uid(), name,
      kcal: parseInt($('#meal-kcal').value, 10) || 0, prot: parseInt($('#meal-prot').value, 10) || 0,
      carbs: parseInt($('#meal-carbs').value, 10) || 0, fat: parseInt($('#meal-fat').value, 10) || 0,
      thumb: currentMealThumb, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    });
    ['meal-name', 'meal-kcal', 'meal-prot', 'meal-carbs', 'meal-fat'].forEach(id => { $('#' + id).value = ''; });
    currentMealThumb = null;
    resetDropzone();
    toast('Comida guardada');
  },
  ai() {
    const key = $('#ai-api-key-input').value.trim();
    if (key) localStorage.setItem('nexora_ai_key', key);
    localStorage.setItem('nexora_ai_provider', aiProvider);
    S.calaiGoals = { dailyKcal: parseInt($('#goal-kcal').value, 10) || 2600, dailyProt: parseInt($('#goal-prot').value, 10) || 170 };
    $('#ai-config').open = false;
    toast('Ajustes de IA guardados');
  },
  'revx-token'() {
    const v = $('#revx-token-input').value.trim();
    if (v) localStorage.setItem('habits_dash_token', v); else localStorage.removeItem('habits_dash_token');
    $('#revx-config').open = false;
    REVX.state = 'idle';
    revxFetch(true);
    return 'nosave';
  }
};

/* =========================================================================
   EVENTS (delegated)
   ========================================================================= */
document.addEventListener('click', e => {
  const t = e.target.closest('button, a, [data-view]');
  if (!t) return;
  const ds = t.dataset;

  if (ds.view && !ds.action) { setView(ds.view); return; }
  if (ds.day !== undefined) { day = +ds.day; render(); return; }
  if (ds.k) { toggleKey(ds.k, ds.force === '1'); return; }
  if (ds.habit) { toggleHabit(+ds.hday, ds.habit); return; }
  if (ds.note) {
    const n = (S.notes[day] || []).find(x => x.id === +ds.note);
    if (n) { n.done = !n.done; save(); render(); }
    return;
  }
  if (ds.del) { deleteItem(ds.del, +ds.id); return; }
  if (ds.side) { tradeSide = ds.side; setRadio($('#trade-side'), 'side', ds.side); autoCalcTrade(); return; }
  if (ds.provider) { aiProvider = ds.provider; setRadio($('#ai-provider'), 'provider', ds.provider); return; }

  switch (ds.action) {
    case 'toggle-theme': setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); break;
    case 'toggle-pending': onlyPending = !onlyPending; renderToday(); break;
    case 'go-today': day = td; render(); break;
    case 'reset-week': armReset(t); break;
    case 'bb-sync': syncBlackboard(true); break;
    case 'revx-refresh': revxFetch(true); break;
    case 'yt-add': S.projects.ytSubs = Math.max(0, (S.projects.ytSubs || 0) + Number(ds.n)); save(); renderFinance(); break;
    case 'yt-set': {
      const v = prompt('Número actual de suscriptores:', S.projects.ytSubs || 0);
      if (v !== null) { const n = parseInt(v.replace(/\D/g, ''), 10); if (!isNaN(n)) { S.projects.ytSubs = n; save(); renderFinance(); } }
      break;
    }
    case 'yt-refresh': fetchYtSubs(true); break;
    case 'ai-clear': localStorage.removeItem('nexora_ai_key'); $('#ai-api-key-input').value = ''; renderNutri(); toast('Clave borrada'); break;
    default: break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  const r = forms[f.dataset.form] && forms[f.dataset.form](f);
  if (r !== 'nosave') { save(); render(); }
});

document.addEventListener('keydown', e => {
  const r = e.target.closest('[role="radio"]');
  if (!r || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const all = [...r.parentElement.querySelectorAll('[role="radio"]')];
  let i = all.indexOf(r);
  if (e.key === 'Home') i = 0;
  else if (e.key === 'End') i = all.length - 1;
  else i = (i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + all.length) % all.length;
  all[i].focus();
  all[i].click();
});

$('#meal-photo-input').addEventListener('change', e => { const f = e.target.files?.[0]; if (f) handleMealPhoto(f); e.target.value = ''; });
$('#initial-cap-input').addEventListener('change', e => { const n = parseFloat(e.target.value); S.projects.initialCapital = isNaN(n) ? 0 : n; save(); renderFinance(); renderCharts(); });
['trade-buy', 'trade-sell', 'trade-sl', 'trade-qty'].forEach(id => $('#' + id).addEventListener('input', autoCalcTrade));
$('#ai-config').addEventListener('toggle', e => {
  if (!e.target.open) return;
  $('#ai-api-key-input').value = localStorage.getItem('nexora_ai_key') || '';
  $('#goal-kcal').value = S.calaiGoals.dailyKcal;
  $('#goal-prot').value = S.calaiGoals.dailyProt;
  setRadio($('#ai-provider'), 'provider', aiProvider);
});
$('#revx-config').addEventListener('toggle', e => { if (e.target.open) $('#revx-token-input').value = localStorage.getItem('habits_dash_token') || ''; });
window.addEventListener('hashchange', () => setView(location.hash.slice(1), false));
document.addEventListener('visibilitychange', () => { if (!document.hidden && view === 'finanzas') revxFetch(); });

let rz;
new ResizeObserver(() => { cancelAnimationFrame(rz); rz = requestAnimationFrame(renderCharts); }).observe(document.body);

/* =========================================================================
   BOOT
   ========================================================================= */
hydrateIcons();
load();
setRadio($('#trade-side'), 'side', tradeSide);
setRadio($('#ai-provider'), 'provider', aiProvider);
setTheme(document.documentElement.getAttribute('data-theme') || 'light');
render();
setView(location.hash.slice(1) || 'hoy', false);
if (view !== 'finanzas') revxFetch();
syncBlackboard();
fetchYtSubs();
setInterval(syncBlackboard, 15 * 60 * 1000);
setInterval(() => { if (!document.hidden) renderToday(); }, 60 * 1000);

if ('serviceWorker' in navigator && IS_HOSTED) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
})();
