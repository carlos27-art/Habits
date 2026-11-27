(function () {
'use strict';

/* Habits v3: personal dashboard for iPhone & PC.
   Sections: Habitos (editable + chart + heatmap + streaks), Agenda (Uni + tasks),
   Cocina IA (pantry + weekly 2800-2900 kcal meal plan), Finanzas (Revolut X + trading + clipping + hustles).
   Offline-first in localStorage with cloud sync via /api/state (Upstash Redis on Vercel). */

const STORAGE_KEY = 'habits_v3';
const LEGACY_KEY = 'vida3';
const TOKEN_KEY = 'habits_dash_token';
const BLACKBOARD_ICS_URL = 'https://ev.us.es/webapps/calendar/calendarFeed/b9711c0cbad84ef7b37f9addb1de62f4/learn.ics';
const VIEWS = ['habitos', 'agenda', 'cocina', 'finanzas'];
const DAYS = [
  ['Lunes', 'L'],
  ['Martes', 'M'],
  ['Miércoles', 'X'],
  ['Jueves', 'J'],
  ['Viernes', 'V'],
  ['Sábado', 'S'],
  ['Domingo', 'D']
];
const IS_HOSTED = location.protocol.startsWith('http');
const RING_CIRC = 2 * Math.PI * 52;

/* =========================================================================
   ICONS (lucide-style inline SVG, stroke = currentColor)
   ========================================================================= */
const I = {
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  chef: '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v3"/><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M21 12h-4a2 2 0 0 0 0 4h4z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  sparkles: '<path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  up: '<path d="M7 17 17 7M8 7h9v9"/>',
  down: '<path d="M7 7l10 10M17 8v9H8"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  utensils: '<path d="M4 3v7a3 3 0 0 0 6 0V3"/><path d="M7 3v18"/><path d="M18 21V3a3 3 0 0 0-3 3v6h3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  dumbbell: '<path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  book: '<path d="M2 4h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/>',
  drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'
};

const HABIT_ICONS = [
  ['dumbbell', 'Fuerza'],
  ['timer', 'Estudio'],
  ['sun', 'Manana'],
  ['cap', 'Universidad'],
  ['book', 'Lectura'],
  ['code', 'Codigo'],
  ['shield', 'Disciplina'],
  ['heart', 'Salud'],
  ['bed', 'Descanso'],
  ['drop', 'Agua'],
  ['pill', 'Suplemento'],
  ['target', 'Objetivo']
];

const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[name] || I.flame}</svg>`;
const icon = (name, cls = '') => `<span class="icon${cls ? ' ' + cls : ''}">${svg(name)}</span>`;

/* =========================================================================
   HELPERS & DATES
   ========================================================================= */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function isoOf(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseIso(s) {
  const [y, m, d] = String(s || '').split('-').map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}
function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d, delta) {
  const c = new Date(d);
  c.setDate(c.getDate() + delta);
  return c;
}
function weekdayIdx(d) {
  return (d.getDay() + 6) % 7;
}
function startOfWeek(d = todayDate()) {
  return addDays(d, -weekdayIdx(d));
}

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

/* =========================================================================
   STATE & MIGRATION
   ========================================================================= */
const DEFAULT_HABITS = () => [
  { id: 'gym', name: 'Entrenamiento de fuerza', icon: 'dumbbell', days: [0, 1, 3, 4, 5] },
  { id: 'study', name: 'Estudio profundo', icon: 'timer', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'morning', name: 'Rutina de mañana', icon: 'sun', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'uni', name: 'Clases universidad', icon: 'cap', days: [0, 1, 2, 3, 4] },
  { id: 'neck', name: 'Movilidad y cuello', icon: 'shield', days: [0, 2, 5] }
];

const DEFAULT_SUPPS = () => [
  { id: 'creatina', name: 'Creatina 5 g' },
  { id: 'magnesio', name: 'Magnesio' },
  { id: 'calcio', name: 'Calcio y vitamina D' }
];

let S = null;
let view = 'habitos';
let selectedIso = isoOf(todayDate());
let chartRange = 7;
let taskType = 'tarea';
let agFilter = 'pend';
let menuDay = weekdayIdx(todayDate());
let pantryUnit = 'g';
let prefMeals = 5;
let tradeSide = 'LONG';
let editingHabitId = null;
let habitFormIcon = 'dumbbell';
let habitFormDays = [0, 1, 2, 3, 4, 5, 6];
let clearPantryTimer = null;
let menuLoading = false;
let swappingMealId = null;

const REVX = { state: 'idle', data: null, error: '', timer: null };
const SYNC = { state: 'idle', text: 'Guardado en este dispositivo', pushTimer: null, busy: false };

function emptyState() {
  return {
    version: 3,
    updatedAt: 0,
    habits: DEFAULT_HABITS(),
    supplements: DEFAULT_SUPPS(),
    logs: {},
    agenda: [],
    bbSyncedUids: {},
    kitchen: {
      pantry: [],
      prefs: {
        minKcal: 2800,
        maxKcal: 2900,
        protein: 180,
        mealsPerDay: 5,
        notes: ''
      },
      menu: null,
      eaten: {}
    },
    projects: {
      initialCapital: 500,
      trades: [],
      clipping: [],
      sideHustles: [],
      revxCache: null
    }
  };
}

function normalizeState(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  return {
    version: 3,
    updatedAt: Number(raw.updatedAt || 0),
    habits: Array.isArray(raw.habits) ? raw.habits : base.habits,
    supplements: Array.isArray(raw.supplements) ? raw.supplements : base.supplements,
    logs: raw.logs && typeof raw.logs === 'object' ? raw.logs : {},
    agenda: Array.isArray(raw.agenda) ? raw.agenda : [],
    bbSyncedUids: raw.bbSyncedUids && typeof raw.bbSyncedUids === 'object' ? raw.bbSyncedUids : {},
    kitchen: {
      pantry: Array.isArray(raw.kitchen?.pantry) ? raw.kitchen.pantry : [],
      prefs: Object.assign({}, base.kitchen.prefs, raw.kitchen?.prefs || {}),
      menu: raw.kitchen?.menu || null,
      eaten: raw.kitchen?.eaten && typeof raw.kitchen.eaten === 'object' ? raw.kitchen.eaten : {}
    },
    projects: {
      initialCapital: Number(raw.projects?.initialCapital ?? 500),
      trades: Array.isArray(raw.projects?.trades) ? raw.projects.trades : [],
      clipping: Array.isArray(raw.projects?.clipping) ? raw.projects.clipping : [],
      sideHustles: Array.isArray(raw.projects?.sideHustles) ? raw.projects.sideHustles : [],
      revxCache: raw.projects?.revxCache || null
    }
  };
}

function migrateLegacy() {
  let legacy = null;
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); } catch (e) { legacy = null; }
  const st = emptyState();
  if (!legacy || typeof legacy !== 'object') return st;

  if (Array.isArray(legacy.exams)) {
    legacy.exams.forEach(x => {
      if (x && x.name && x.date) {
        st.agenda.push({
          id: String(x.id || uid()),
          text: String(x.name),
          type: 'examen',
          date: String(x.date),
          time: '',
          done: false,
          fromBB: !!x.fromBB,
          bbUid: x.bbUid || ''
        });
      }
    });
  }

  if (legacy.notes && typeof legacy.notes === 'object') {
    const mon = startOfWeek();
    Object.keys(legacy.notes).forEach(k => {
      const idx = Number(k);
      if (Number.isNaN(idx) || idx < 0 || idx > 6) return;
      const dStr = isoOf(addDays(mon, idx));
      (legacy.notes[k] || []).forEach(n => {
        if (n && n.text) {
          st.agenda.push({
            id: String(n.id || uid()),
            text: String(n.text),
            type: n.fromBB ? 'entrega' : 'tarea',
            date: dStr,
            time: '',
            done: !!n.done,
            fromBB: !!n.fromBB,
            bbUid: n.bbUid || ''
          });
        }
      });
    });
  }

  if (legacy.bbSyncedUids && typeof legacy.bbSyncedUids === 'object') {
    st.bbSyncedUids = { ...legacy.bbSyncedUids };
  }

  if (legacy.projects && typeof legacy.projects === 'object') {
    st.projects.initialCapital = Number(legacy.projects.initialCapital ?? 500);
    st.projects.trades = Array.isArray(legacy.projects.trades) ? legacy.projects.trades : [];
    st.projects.clipping = Array.isArray(legacy.projects.clipping) ? legacy.projects.clipping : [];
    st.projects.sideHustles = Array.isArray(legacy.projects.sideHustles) ? legacy.projects.sideHustles : [];
    st.projects.revxCache = legacy.projects.revxCache || null;
  }

  st.updatedAt = Date.now();
  return st;
}

function load() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
  S = saved ? normalizeState(saved) : migrateLegacy();
  prefMeals = Number(S.kitchen.prefs.mealsPerDay || 5);
  if (S.projects.revxCache) REVX.data = S.projects.revxCache;
  persistLocal();
}

function persistLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch (e) {
    toast('No se pudo guardar en este dispositivo');
  }
}

function save(pushRemote = true) {
  S.updatedAt = Date.now();
  persistLocal();
  if (pushRemote) scheduleCloudPush();
}

/* =========================================================================
   CLOUD SYNC (Upstash Redis via /api/state)
   ========================================================================= */
function getDashToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setSyncStatus(state, text) {
  SYNC.state = state;
  SYNC.text = text;
  $$('[data-sync-dot]').forEach(el => { el.dataset.state = state; });
  $$('[data-sync-text]').forEach(el => { el.textContent = text; });
  const foot = $('#foot-note');
  if (foot) {
    foot.textContent = state === 'ok'
      ? 'Habits. Sincronizado entre iPhone y PC.'
      : 'Habits. Tus datos se guardan en este dispositivo.';
  }
}

function scheduleCloudPush() {
  if (!IS_HOSTED) return;
  clearTimeout(SYNC.pushTimer);
  SYNC.pushTimer = setTimeout(() => { pushCloudState(); }, 900);
}

async function pullCloudState(manual = false) {
  if (!IS_HOSTED) {
    setSyncStatus('idle', 'Modo local en este dispositivo');
    return;
  }
  if (SYNC.busy) return;
  SYNC.busy = true;
  setSyncStatus('loading', 'Sincronizando...');
  try {
    const token = getDashToken();
    const res = await fetch('/api/state', {
      method: 'GET',
      cache: 'no-store',
      headers: token ? { 'x-dashboard-token': token } : {}
    });
    const json = await res.json().catch(() => null);
    if (res.status === 503) {
      setSyncStatus('idle', 'Nube opcional pendiente en Vercel');
      if (manual) toast('Configura Upstash Redis en Vercel para sincronizar');
      SYNC.busy = false;
      return;
    }
    if (res.status === 401) {
      setSyncStatus('error', 'Falta token en Ajustes');
      if (manual) { toast('Introduce el token del panel en Ajustes'); openSettings(); }
      SYNC.busy = false;
      return;
    }
    if (!res.ok || !json) {
      throw new Error(json?.error || 'Error de red');
    }

    const remote = json.state ? normalizeState(json.state) : null;
    if (remote && remote.updatedAt > (S.updatedAt || 0)) {
      S = remote;
      prefMeals = Number(S.kitchen.prefs.mealsPerDay || 5);
      if (S.projects.revxCache && !REVX.data) REVX.data = S.projects.revxCache;
      persistLocal();
      render();
      if (manual) toast('Datos actualizados desde la nube');
    } else if (!remote || (S.updatedAt || 0) > (remote.updatedAt || 0)) {
      SYNC.busy = false;
      await pushCloudState(manual);
      return;
    }
    setSyncStatus('ok', 'Sincronizado iPhone y PC');
    if (manual && remote && remote.updatedAt === S.updatedAt) toast('Ya estaba todo sincronizado');
  } catch (e) {
    setSyncStatus('error', 'Sin conexion con la nube');
    if (manual) toast('No se pudo sincronizar ahora');
  }
  SYNC.busy = false;
}

async function pushCloudState(manual = false) {
  if (!IS_HOSTED || SYNC.busy) return;
  SYNC.busy = true;
  setSyncStatus('loading', 'Guardando en la nube...');
  try {
    const token = getDashToken();
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        token ? { 'x-dashboard-token': token } : {}
      ),
      body: JSON.stringify({ state: S })
    });
    const json = await res.json().catch(() => null);
    if (res.status === 503) {
      setSyncStatus('idle', 'Guardado local (sin base en Vercel)');
    } else if (res.status === 401) {
      setSyncStatus('error', 'Falta token en Ajustes');
    } else if (!res.ok) {
      setSyncStatus('error', 'Error al sincronizar');
    } else {
      setSyncStatus('ok', 'Sincronizado iPhone y PC');
      if (manual) toast('Sincronizado con la nube');
    }
  } catch (e) {
    setSyncStatus('error', 'Guardado local (sin red)');
  }
  SYNC.busy = false;
}

/* =========================================================================
   HABIT METRICS & STREAKS
   ========================================================================= */
function ensureDayLog(iso) {
  if (!S.logs[iso]) S.logs[iso] = { habits: {}, water: 0, supps: {} };
  if (!S.logs[iso].habits) S.logs[iso].habits = {};
  if (!S.logs[iso].supps) S.logs[iso].supps = {};
  return S.logs[iso];
}

function isScheduledOn(habit, dObj) {
  const days = Array.isArray(habit.days) && habit.days.length ? habit.days : [0, 1, 2, 3, 4, 5, 6];
  return days.includes(weekdayIdx(dObj));
}

function dayHabitSummary(iso) {
  const dObj = parseIso(iso);
  const log = S.logs[iso];
  const scheduled = S.habits.filter(h => isScheduledOn(h, dObj));
  const total = scheduled.length;
  const doneCount = scheduled.filter(h => log?.habits?.[h.id]).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  return { scheduled, total, done: doneCount, pct };
}

function habitCurrentStreak(habit) {
  const t = todayDate();
  let count = 0;
  for (let back = 0; back < 365; back++) {
    const d = addDays(t, -back);
    if (!isScheduledOn(habit, d)) continue;
    const iso = isoOf(d);
    const done = !!S.logs[iso]?.habits?.[habit.id];
    if (done) {
      count++;
    } else {
      if (back === 0) continue;
      break;
    }
  }
  return count;
}

function habitBestStreak(habit) {
  const t = todayDate();
  let best = 0;
  let run = 0;
  for (let back = 180; back >= 0; back--) {
    const d = addDays(t, -back);
    if (!isScheduledOn(habit, d)) continue;
    const iso = isoOf(d);
    if (S.logs[iso]?.habits?.[habit.id]) {
      run++;
      if (run > best) best = run;
    } else if (back > 0) {
      run = 0;
    }
  }
  return Math.max(best, habitCurrentStreak(habit));
}

function formatDaysRule(days) {
  if (!Array.isArray(days) || days.length === 7) return 'Todos los días';
  if (days.length === 5 && [0, 1, 2, 3, 4].every(d => days.includes(d))) return 'Lun a Vie';
  if (days.length === 2 && days.includes(5) && days.includes(6)) return 'Fin de semana';
  return days.slice().sort((a, b) => a - b).map(i => DAYS[i][1]).join(' · ');
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
  root.querySelectorAll('.icon[data-icon]').forEach(el => {
    el.innerHTML = svg(el.dataset.icon);
  });
}

function setRadio(group, attr, value) {
  if (!group) return;
  const radios = [...group.querySelectorAll('[role="radio"]')];
  let matched = false;
  radios.forEach(b => {
    const on = String(b.dataset[attr]) === String(value);
    if (on) matched = true;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  if (!matched && radios.length) {
    radios[0].setAttribute('aria-checked', 'true');
    radios[0].tabIndex = 0;
  }
}

function setView(v, push = true) {
  if (!VIEWS.includes(v)) v = 'habitos';
  view = v;
  VIEWS.forEach(id => { $('#view-' + id).hidden = id !== v; });
  $$('.nav-item[data-view], .tab[data-view]').forEach(b => {
    if (b.dataset.view === v) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (push && location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
  window.scrollTo({ top: 0 });
  if (v === 'finanzas') { revxFetch(); startRevxPolling(); } else stopRevxPolling();
  renderCharts();
}

/* =========================================================================
   RENDER: HÁBITOS
   ========================================================================= */
function renderHabits() {
  const today = todayDate();
  const todayIso = isoOf(today);
  const selDate = parseIso(selectedIso);
  const isToday = selectedIso === todayIso;

  $('#h-eyebrow').textContent = selDate.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).replace(/^./, c => c.toUpperCase());
  $('#h-title').textContent = isToday ? 'Hoy' : DAYS[weekdayIdx(selDate)][0];

  const sum = dayHabitSummary(selectedIso);
  $('#day-pct').textContent = sum.pct;
  $('#day-count').textContent = sum.total
    ? `${sum.done} de ${sum.total} completados`
    : 'Sin hábitos programados este día';
  const offset = RING_CIRC * (1 - sum.pct / 100);
  $('#ring-fg').style.strokeDashoffset = offset.toFixed(2);

  const ranked = S.habits.map(h => ({
    h,
    cur: habitCurrentStreak(h),
    best: habitBestStreak(h)
  })).sort((a, b) => (b.cur - a.cur) || (b.best - a.best));

  const top = ranked[0];
  if (top && top.cur > 0) {
    $('#best-streak').textContent = top.cur;
    $('#best-streak-unit').textContent = top.cur === 1 ? 'día en racha' : 'días en racha';
    $('#best-streak-name').textContent = top.h.name;
  } else {
    $('#best-streak').textContent = '0';
    $('#best-streak-unit').textContent = 'días';
    $('#best-streak-name').textContent = S.habits.length
      ? 'Marca tus hábitos de hoy para encender la racha'
      : 'Añade tu primer hábito para empezar';
  }

  // Week day strip (Monday to Sunday of current week)
  const mon = startOfWeek(today);
  $('#habit-strip').innerHTML = DAYS.map((d, i) => {
    const cellDate = addDays(mon, i);
    const cellIso = isoOf(cellDate);
    const future = cellDate > today;
    const cellSum = dayHabitSummary(cellIso);
    return `
      <button type="button" class="day-btn${cellIso === todayIso ? ' is-today' : ''}"
        data-iso="${cellIso}" aria-pressed="${cellIso === selectedIso}" ${future ? 'disabled' : ''}
        aria-label="${d[0]} ${cellDate.getDate()}${cellIso === todayIso ? ' (hoy)' : ''}: ${cellSum.pct} %">
        <span class="day-wd">${d[1]}</span>
        <span class="day-num">${cellDate.getDate()}</span>
        <span class="day-meter" aria-hidden="true"><span style="inline-size:${cellSum.pct}%"></span></span>
      </button>`;
  }).join('');

  // Habits list
  const log = S.logs[selectedIso] || { habits: {}, water: 0, supps: {} };
  $('#h-list-sub').textContent = isToday
    ? 'Pulsa un hábito para marcarlo hoy'
    : `Registro del ${DAYS[weekdayIdx(selDate)][0].toLowerCase()} ${selDate.getDate()}`;

  if (!S.habits.length) {
    $('#habit-list').innerHTML = `
      <li class="empty-block">
        ${icon('flame')}
        <p class="empty-title">Crea tu lista de hábitos</p>
        <p>Añade los hábitos que quieras seguir cada día y mide tus rachas reales.</p>
      </li>`;
  } else {
    const sortedHabits = [...S.habits].sort((a, b) => {
      const sa = isScheduledOn(a, selDate) ? 0 : 1;
      const sb = isScheduledOn(b, selDate) ? 0 : 1;
      return sa - sb;
    });
    $('#habit-list').innerHTML = sortedHabits.map(h => {
      const scheduled = isScheduledOn(h, selDate);
      const isDone = !!(log.habits && log.habits[h.id]);
      const st = habitCurrentStreak(h);
      return `
        <li class="habit${scheduled ? '' : ' is-off'}">
          <button type="button" class="habit-hit" data-toggle-habit="${esc(h.id)}" aria-pressed="${isDone}">
            <span class="habit-icon">${icon(h.icon || 'flame')}</span>
            <span class="habit-text">
              <span class="habit-name">${esc(h.name)}</span>
              <span class="habit-meta">
                <span class="habit-streak">${icon('flame', 'i-sm')}<span>${st} ${st === 1 ? 'día' : 'días'}</span></span>
                <span class="habit-days">${scheduled ? formatDaysRule(h.days) : 'Descanso hoy'}</span>
              </span>
            </span>
            <span class="check-box" aria-hidden="true">${icon('check')}</span>
          </button>
          <button type="button" class="btn btn-ghost btn-sm btn-icon" data-edit-habit="${esc(h.id)}" aria-label="Editar ${esc(h.name)}">
            ${icon('pencil')}
          </button>
        </li>`;
    }).join('');
  }

  // Water
  const wVal = Number(log.water || 0);
  $('#water-status').textContent = `${wVal} / 3 L`;
  $('#water-row').innerHTML = [1, 2, 3].map(n => `
    <button type="button" class="water-btn" data-water="${n}" aria-pressed="${wVal >= n}" aria-label="Agua ${n} litros">
      ${icon('drop')}
      <span>${n} L</span>
    </button>`).join('');

  // Supplements
  const supps = S.supplements || [];
  const supDone = supps.filter(s => log.supps && log.supps[s.id]).length;
  $('#supps-status').textContent = `${supDone} / ${supps.length}`;
  $('#supps-row').innerHTML = supps.length ? supps.map(s => {
    const on = !!(log.supps && log.supps[s.id]);
    return `<button type="button" class="chip" data-supp="${esc(s.id)}" aria-pressed="${on}">${icon('pill')}<span>${esc(s.name)}</span></button>`;
  }).join('') : `<p class="muted small">Sin suplementos configurados.</p>`;

  $('#supps-edit').innerHTML = supps.map(s => `
    <li class="row">
      <span class="row-title">${esc(s.name)}</span>
      <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="supp" data-id="${esc(s.id)}" aria-label="Eliminar ${esc(s.name)}">${icon('trash')}</button>
    </li>`).join('');

  // Range stats (7 or 30 days)
  let pctSum = 0, perfect = 0, totalDone = 0;
  for (let i = chartRange - 1; i >= 0; i--) {
    const dIso = isoOf(addDays(today, -i));
    const ds = dayHabitSummary(dIso);
    pctSum += ds.pct;
    if (ds.total > 0 && ds.done === ds.total) perfect++;
    totalDone += ds.done;
  }
  $('#progress-sub').textContent = `Últimos ${chartRange} días`;
  $('#st-avg').textContent = `${Math.round(pctSum / chartRange)} %`;
  $('#st-perfect').textContent = fmtNum(perfect);
  $('#st-done').textContent = fmtNum(totalDone);

  // 16-week consistency heatmap
  renderHeatmap(today, todayIso);

  // Streaks ranking
  const maxBest = Math.max(7, ...ranked.map(r => r.best));
  $('#streaks-list').innerHTML = ranked.length ? ranked.map(({ h, cur, best }) => `
    <li class="rank-item${cur > 0 ? ' is-hot' : ''}">
      <span class="rank-icon">${icon(h.icon || 'flame')}</span>
      <span class="rank-name">${esc(h.name)}</span>
      <span class="rank-val">${icon('flame', 'i-sm')}<span>${cur} ${cur === 1 ? 'día' : 'días'}</span></span>
      <div class="rank-bar">
        <span class="rank-track" aria-hidden="true"><span style="inline-size:${Math.round((cur / maxBest) * 100)}%"></span></span>
        <span class="rank-best">Mejor: ${best}</span>
      </div>
    </li>`).join('') : `<li class="empty">Añade hábitos para registrar tus rachas.</li>`;
}

function renderHeatmap(today, todayIso) {
  const curMon = startOfWeek(today);
  const firstMon = addDays(curMon, -23 * 7);
  const cells = [];
  for (let w = 0; w < 24; w++) {
    for (let d = 0; d < 7; d++) {
      const cellDate = addDays(firstMon, w * 7 + d);
      const iso = isoOf(cellDate);
      if (cellDate > today) {
        cells.push(`<span class="heat-cell" data-level="future" aria-hidden="true"></span>`);
        continue;
      }
      const { pct } = dayHabitSummary(iso);
      const level = pct === 0 ? 0 : pct < 35 ? 1 : pct < 65 ? 2 : pct < 100 ? 3 : 4;
      const label = `${cellDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}: ${pct} %`;
      cells.push(`<span class="heat-cell${iso === todayIso ? ' is-today' : ''}" data-level="${level}" title="${esc(label)}"></span>`);
    }
  }
  $('#heatmap').innerHTML = `
    <div class="heat-days" aria-hidden="true">
      <span>L</span><span></span><span>X</span><span></span><span>V</span><span></span><span>D</span>
    </div>
    <div class="heat-grid" role="img" aria-label="Mapa de constancia de las últimas 24 semanas">${cells.join('')}</div>`;
}

/* =========================================================================
   RENDER: AGENDA (Universidad + tareas diarias unificadas)
   ========================================================================= */
function typeMeta(type) {
  if (type === 'examen') return { label: 'Examen', cls: 'tag-accent' };
  if (type === 'entrega') return { label: 'Entrega', cls: '' };
  return { label: 'Tarea', cls: '' };
}

function countdownBadge(diff) {
  const txt = diff < 0
    ? `Hace ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'día' : 'días'}`
    : diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : `En ${diff} días`;
  const state = diff < 0 ? 'urgent' : diff <= 3 ? 'urgent' : '';
  return `<span class="countdown"${state ? ` data-state="${state}"` : ''}>${txt}</span>`;
}

function renderAgenda() {
  const today = todayDate();
  const todayIso = isoOf(today);
  const weekLimitIso = isoOf(addDays(today, 7));

  const enriched = (S.agenda || []).map(item => {
    const dt = parseIso(item.date || todayIso);
    const diff = Math.round((dt - today) / 86400000);
    return { ...item, dt, diff };
  }).sort((a, b) => (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99')));

  const pendToday = enriched.filter(x => !x.done && x.date <= todayIso).length;
  const pendWeek = enriched.filter(x => !x.done && x.date >= todayIso && x.date <= weekLimitIso).length;
  $('#ag-today').textContent = fmtNum(pendToday);
  $('#ag-week').textContent = fmtNum(pendWeek);

  const nextMilestone = enriched.find(x => !x.done && x.diff >= 0 && (x.type === 'examen' || x.type === 'entrega'))
    || enriched.find(x => !x.done && x.diff >= 0);

  $('#agenda-lead').innerHTML = nextMilestone ? `
    <p class="label">${nextMilestone.type === 'examen' ? 'Próximo examen' : nextMilestone.type === 'entrega' ? 'Próxima entrega' : 'Próxima tarea'}</p>
    <p class="hero-num">${nextMilestone.diff}<span class="hero-unit">${nextMilestone.diff === 1 ? 'día' : 'días'}</span></p>
    <p class="lead-line">${esc(nextMilestone.text)}</p>
    <p class="muted small">${nextMilestone.dt.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}${nextMilestone.time ? ' · ' + esc(nextMilestone.time) : ''}</p>` : `
    <p class="label">Agenda al día</p>
    <p class="hero-num">0<span class="hero-unit">pendientes</span></p>
    <p class="muted small">Añade tus tareas, entregas o sincroniza Blackboard para tenerlo todo en un mismo sitio.</p>`;

  const dateInput = $('#task-date');
  if (dateInput && !dateInput.value) dateInput.value = todayIso;

  const filtered = enriched.filter(x => {
    if (agFilter === 'pend') return !x.done;
    if (agFilter === 'exam') return x.type === 'examen' || x.type === 'entrega';
    return true;
  });

  if (!filtered.length) {
    $('#agenda-list').innerHTML = `<li class="empty">No hay elementos en esta vista.</li>`;
    return;
  }

  const groups = new Map();
  filtered.forEach(item => {
    const key = !item.done && item.diff < 0 ? 'overdue' : item.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  const html = [];
  for (const [key, items] of groups.entries()) {
    let heading = '';
    let hCls = '';
    if (key === 'overdue') {
      heading = 'Atrasadas';
      hCls = ' is-overdue';
    } else if (key === todayIso) {
      heading = 'Hoy';
      hCls = ' is-today';
    } else if (key === isoOf(addDays(today, 1))) {
      heading = 'Mañana';
    } else {
      const d = parseIso(key);
      heading = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    html.push(`
      <li class="ag-group">
        <div class="ag-head${hCls}">
          <span>${esc(heading)}</span>
          <span>${items.length}</span>
        </div>
        <div class="ag-items">
          ${items.map(item => {
            const tm = typeMeta(item.type);
            return `
              <div class="task${item.done ? ' is-done' : ''}${item.type === 'examen' ? ' is-exam' : ''}">
                <button type="button" class="check" data-toggle-task="${esc(item.id)}" aria-pressed="${!!item.done}" aria-label="${item.done ? 'Desmarcar' : 'Completar'}: ${esc(item.text)}">
                  <span class="check-box">${icon('check')}</span>
                </button>
                <div class="task-body">
                  <p class="task-title">${esc(item.text)}</p>
                  <p class="task-meta">
                    <span class="tag ${tm.cls}">${tm.label}</span>
                    ${item.fromBB ? '<span class="tag">Blackboard</span>' : ''}
                    ${item.time ? `<span class="task-time">${icon('clock', 'i-sm')}${esc(item.time)}</span>` : ''}
                  </p>
                </div>
                <div class="row-end">
                  ${!item.done ? countdownBadge(item.diff) : ''}
                  <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="task" data-id="${esc(item.id)}" aria-label="Eliminar ${esc(item.text)}">${icon('trash')}</button>
                </div>
              </div>`;
          }).join('')}
        </div>
      </li>`);
  }
  $('#agenda-list').innerHTML = html.join('');
}

/* =========================================================================
   RENDER: COCINA IA (Despensa + Menú semanal 2800-2900 kcal)
   ========================================================================= */
function dayDateForMenuIdx(idx) {
  return isoOf(addDays(startOfWeek(todayDate()), idx));
}

function renderKitchen() {
  const k = S.kitchen;
  const prefs = k.prefs;
  const menu = k.menu;
  const todayIdx = weekdayIdx(todayDate());

  $('#k-eyebrow').textContent = `Superávit calórico: ${fmtNum(prefs.minKcal)} a ${fmtNum(prefs.maxKcal)} kcal diarias`;
  $('#k-day-label').textContent = menuDay === todayIdx ? `Plan de hoy (${DAYS[menuDay][0]})` : `Plan del ${DAYS[menuDay][0].toLowerCase()}`;

  const dayPlan = menu && Array.isArray(menu.days) ? (menu.days[menuDay] || menu.days[0]) : null;
  const meals = dayPlan && Array.isArray(dayPlan.meals) ? dayPlan.meals : [];
  const totals = meals.reduce((acc, m) => ({
    kcal: acc.kcal + Number(m.kcal || 0),
    p: acc.p + Number(m.protein || 0),
    c: acc.c + Number(m.carbs || 0),
    f: acc.f + Number(m.fat || 0)
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  $('#k-kcal').textContent = fmtNum(totals.kcal);

  const statusEl = $('#k-target-status');
  if (!meals.length) {
    statusEl.innerHTML = `<span class="tag">Meta: ${fmtNum(prefs.minKcal)} a ${fmtNum(prefs.maxKcal)} kcal</span>`;
  } else if (totals.kcal >= prefs.minKcal && totals.kcal <= prefs.maxKcal) {
    statusEl.innerHTML = `<span class="pill" data-state="ok"><span class="status-dot" aria-hidden="true"></span><span>En objetivo (${fmtNum(prefs.minKcal)} a ${fmtNum(prefs.maxKcal)} kcal)</span></span>`;
  } else {
    const diff = totals.kcal < prefs.minKcal ? prefs.minKcal - totals.kcal : totals.kcal - prefs.maxKcal;
    const msg = totals.kcal < prefs.minKcal ? `Faltan ${fmtNum(diff)} kcal para el mínimo` : `${fmtNum(diff)} kcal sobre el rango`;
    statusEl.innerHTML = `<span class="pill" data-state="loading"><span class="status-dot" aria-hidden="true"></span><span>${msg}</span></span>`;
  }

  const targetKcalMid = Math.round((prefs.minKcal + prefs.maxKcal) / 2);
  const restKcal = Math.max(0, targetKcalMid - prefs.protein * 4);
  const goalC = Math.round((restKcal * 0.58) / 4);
  const goalF = Math.round((restKcal * 0.42) / 9);
  const macroBar = (name, val, goal, cls) => `
    <li class="macro-item">
      <span class="macro-name">${name}</span>
      <span class="macro-val">${fmtNum(val)} / ${fmtNum(goal)} g</span>
      <div class="progress ${cls}" aria-hidden="true"><span style="inline-size:${Math.min(100, Math.round((val / (goal || 1)) * 100))}%"></span></div>
    </li>`;
  $('#k-macros').innerHTML = macroBar('Proteína', totals.p, prefs.protein, '')
    + macroBar('Carbohidratos', totals.c, goalC, 'is-c')
    + macroBar('Grasas', totals.f, goalF, 'is-f');

  // Eaten progress for the selected day
  const dayIso = dayDateForMenuIdx(menuDay);
  const eatenMap = k.eaten[dayIso] || {};
  const eatenKcal = meals.filter(m => eatenMap[m.id]).reduce((a, m) => a + Number(m.kcal || 0), 0);
  const denom = totals.kcal || targetKcalMid;
  $('#k-eaten').textContent = `${fmtNum(eatenKcal)} / ${fmtNum(denom)} kcal`;
  $('#k-eaten-bar').style.inlineSize = `${Math.min(100, Math.round((eatenKcal / denom) * 100))}%`;

  // Menu week strip
  $('#menu-strip').innerHTML = DAYS.map((d, i) => {
    const dm = menu?.days?.[i]?.meals || [];
    const dk = dm.reduce((a, m) => a + Number(m.kcal || 0), 0);
    return `
      <button type="button" class="day-btn${i === todayIdx ? ' is-today' : ''}" data-mday="${i}" aria-pressed="${i === menuDay}"
        aria-label="${d[0]}: ${dk ? fmtNum(dk) + ' kcal' : 'sin menú'}">
        <span class="day-wd">${d[1]}</span>
        <span class="day-sub">${dk ? fmtNum(dk / 1000, 1) + 'k' : '--'}</span>
      </button>`;
  }).join('');

  // Generate button & meta
  const genBtn = $('#gen-btn');
  genBtn.disabled = menuLoading;
  genBtn.setAttribute('aria-busy', String(menuLoading));
  $('#gen-label').textContent = menuLoading ? 'Cocinando menú con IA...' : (menu ? 'Regenerar menú semanal' : 'Generar menú semanal');
  $('#menu-meta').textContent = menuLoading
    ? 'Calculando recetas y macros para los 7 días...'
    : menu?.generatedAt
      ? `Generado el ${new Date(menu.generatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}${menu.summary ? ' · ' + menu.summary : ''}`
      : 'Añade lo que tienes en casa y pulsa Generar menú semanal';

  // Meals of the selected day
  $('#meals-sub').textContent = meals.length
    ? `${DAYS[menuDay][0]}: ${meals.length} comidas · ${fmtNum(totals.kcal)} kcal totales`
    : 'Recetas ajustadas a tu superávit diario';

  if (!meals.length) {
    $('#meal-list').innerHTML = `
      <li class="empty-block">
        ${icon('chef')}
        <p class="empty-title">Sin menú para esta semana</p>
        <p>Apunta tus ingredientes en la despensa y genera un plan semanal de ${fmtNum(prefs.minKcal)} a ${fmtNum(prefs.maxKcal)} kcal al día con Gemini, o carga una plantilla base al instante.</p>
        <button class="btn btn-secondary" type="button" data-action="generate-local-menu">
          ${icon('utensils')}<span>Cargar menú base (${fmtNum(targetKcalMid)} kcal)</span>
        </button>
      </li>`;
  } else {
    $('#meal-list').innerHTML = meals.map((m, idx) => {
      const eaten = !!eatenMap[m.id];
      const busySwap = swappingMealId === m.id;
      const ings = Array.isArray(m.ingredients) ? m.ingredients : [];
      const steps = Array.isArray(m.steps) ? m.steps : [];
      return `
        <li class="meal${eaten ? ' is-eaten' : ''}">
          <div class="meal-top">
            <div class="head-actions">
              <span class="tag tag-accent">${esc(m.slot || `Comida ${idx + 1}`)}</span>
              ${m.prepMin ? `<span class="tag">${icon('clock')}<span>${fmtNum(m.prepMin)} min</span></span>` : ''}
            </div>
            <span class="meal-kcal">${fmtNum(m.kcal)} kcal</span>
          </div>
          <h3 class="meal-name">${esc(m.name)}</h3>
          <div class="meal-macros">
            <span>Proteína <b>${fmtNum(m.protein)} g</b></span>
            <span>Carbos <b>${fmtNum(m.carbs)} g</b></span>
            <span>Grasas <b>${fmtNum(m.fat)} g</b></span>
          </div>
          <details class="disclosure recipe">
            <summary>${icon('chevron')}<span>Ingredientes y preparación (${ings.length})</span></summary>
            <div class="disclosure-body">
              <ul class="ing-list">
                ${ings.map(ing => `<li><span>${esc(ing.name)}</span><span class="ing-qty">${esc(ing.qty || '')}</span></li>`).join('')}
              </ul>
              <ol class="step-list">
                ${steps.map(st => `<li>${esc(st)}</li>`).join('')}
              </ol>
            </div>
          </details>
          <div class="meal-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-eat-meal="${esc(m.id)}" aria-pressed="${eaten}">
              ${icon('check')}<span>${eaten ? 'Comido' : 'Marcar comido'}</span>
            </button>
            <button type="button" class="btn btn-ghost btn-sm" data-swap-meal="${esc(m.id)}" ${busySwap ? 'disabled aria-busy="true"' : ''}>
              ${icon('refresh')}<span>${busySwap ? 'Cambiando...' : 'Otra receta'}</span>
            </button>
          </div>
        </li>`;
    }).join('');
  }

  // Pantry list
  const pantry = k.pantry || [];
  $('#pantry-count').textContent = `${pantry.length} ${pantry.length === 1 ? 'producto' : 'productos'}`;
  $('#clear-pantry').hidden = pantry.length === 0;
  $('#pantry-list').innerHTML = pantry.length ? pantry.map(p => `
    <li class="row">
      <div class="row-text">
        <span class="row-title">${esc(p.name)}</span>
        ${p.qty ? `<span class="row-sub">${fmtNum(p.qty, p.qty % 1 ? 1 : 0)} ${esc(p.unit || '')}</span>` : '<span class="row-sub">Disponible</span>'}
      </div>
      <div class="row-end">
        <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="pantry" data-id="${esc(p.id)}" aria-label="Eliminar ${esc(p.name)}">${icon('trash')}</button>
      </div>
    </li>`).join('') : `<li class="empty">Tu despensa está vacía. Añade arroz, pollo, huevos, pasta, leche, avena o lo que tengas hoy.</li>`;

  // Shopping list
  const shop = menu && Array.isArray(menu.shoppingList) ? menu.shoppingList : [];
  const shopPending = shop.filter(x => !x.done).length;
  $('#shop-count').textContent = fmtNum(shopPending);
  $('#shop-list').innerHTML = shop.length ? shop.map(item => `
    <li class="${item.done ? 'is-done' : ''}">
      <button type="button" class="check" data-toggle-shop="${esc(item.id)}" aria-pressed="${!!item.done}" aria-label="${item.done ? 'Desmarcar' : 'Comprado'}: ${esc(item.name)}">
        <span class="check-box">${icon('check')}</span>
      </button>
      <span class="ct-text">${esc(item.name)}</span>
      ${item.qty ? `<span class="ct-qty">${esc(item.qty)}</span>` : ''}
      <button type="button" class="btn btn-ghost btn-sm" data-shop-to-pantry="${esc(item.id)}" aria-label="Mover ${esc(item.name)} a la despensa">+ Despensa</button>
    </li>`).join('') : `<li class="empty">Cuando generes el menú aparecerá aquí solo lo que te falte comprar.</li>`;

  // Sync prefs inputs when not focused
  const pMin = $('#pref-min'), pMax = $('#pref-max'), pProt = $('#pref-prot'), pNotes = $('#pref-notes');
  if (document.activeElement !== pMin) pMin.value = prefs.minKcal;
  if (document.activeElement !== pMax) pMax.value = prefs.maxKcal;
  if (document.activeElement !== pProt) pProt.value = prefs.protein;
  if (document.activeElement !== pNotes) pNotes.value = prefs.notes || '';
  setRadio($('#pref-meals'), 'meals', prefMeals);
}

/* =========================================================================
   AI MENU GENERATION (/api/chef + smart offline fallback)
   ========================================================================= */
function normalizeGeneratedMenu(raw) {
  const daysIn = Array.isArray(raw?.days) ? raw.days : [];
  const days = DAYS.map((d, idx) => {
    const match = daysIn[idx] || daysIn.find(x => String(x?.day || '').toLowerCase().startsWith(d[0].slice(0, 3).toLowerCase())) || {};
    const meals = Array.isArray(match.meals) ? match.meals.map((m, mi) => ({
      id: m.id || `d${idx}_m${mi}_${uid()}`,
      slot: String(m.slot || `Comida ${mi + 1}`),
      name: String(m.name || 'Plato casero'),
      prepMin: Number(m.prepMin || 15),
      kcal: Math.round(Number(m.kcal || 0)),
      protein: Math.round(Number(m.protein || 0)),
      carbs: Math.round(Number(m.carbs || 0)),
      fat: Math.round(Number(m.fat || 0)),
      ingredients: Array.isArray(m.ingredients) ? m.ingredients.map(i => ({
        name: String(i.name || i),
        qty: String(i.qty || '')
      })) : [],
      steps: Array.isArray(m.steps) ? m.steps.map(s => String(s)) : []
    })) : [];
    return { day: d[0], meals };
  });

  const shoppingList = Array.isArray(raw?.shoppingList) ? raw.shoppingList.map(item => ({
    id: uid(),
    name: String(item.name || item),
    qty: String(item.qty || ''),
    done: false
  })) : [];

  return {
    generatedAt: Date.now(),
    summary: String(raw?.summary || 'Superávit limpio adaptado a tu despensa'),
    days,
    shoppingList
  };
}

function buildLocalSurplusMenu(pantry, prefs) {
  const target = Math.round(((Number(prefs.minKcal) || 2800) + (Number(prefs.maxKcal) || 2900)) / 2);
  const scale = target / 2850;
  const sc = n => Math.round(n * scale);
  const pantryNames = new Set((pantry || []).map(p => p.name.toLowerCase()));

  const templates = [
    [
      { slot: 'Desayuno', name: 'Gachas cremosas de avena, leche entera, plátano y crema de cacahuete', prepMin: 8, kcal: 710, protein: 32, carbs: 94, fat: 22, ingredients: [{ name: 'Copos de avena', qty: '100 g' }, { name: 'Leche entera', qty: '300 ml' }, { name: 'Plátano', qty: '1 ud' }, { name: 'Crema de cacahuete', qty: '25 g' }], steps: ['Calienta la leche con la avena durante 4 minutos removiendo.', 'Añade el plátano troceado y la crema de cacahuete por encima.'] },
      { slot: 'Media mañana', name: 'Bocadillo integral de pavo, queso fresco y aceite de oliva', prepMin: 5, kcal: 460, protein: 30, carbs: 50, fat: 15, ingredients: [{ name: 'Pan integral', qty: '110 g' }, { name: 'Pechuga de pavo', qty: '100 g' }, { name: 'Queso fresco', qty: '60 g' }, { name: 'Aceite de oliva', qty: '10 ml' }], steps: ['Tuesta ligeramente el pan con el aceite de oliva.', 'Rellena con el pavo y el queso fresco en láminas.'] },
      { slot: 'Almuerzo', name: 'Pollo salteado al ajillo con arroz jazmín y aguacate', prepMin: 20, kcal: 820, protein: 58, carbs: 92, fat: 24, ingredients: [{ name: 'Pechuga de pollo', qty: '220 g' }, { name: 'Arroz en crudo', qty: '115 g' }, { name: 'Aguacate', qty: '70 g' }, { name: 'Aceite de oliva', qty: '12 ml' }], steps: ['Cuece el arroz en agua con sal durante 14 minutos.', 'Dora el pollo en dados con ajo laminado y sirve junto al arroz y el aguacate.'] },
      { slot: 'Merienda', name: 'Yogur griego natural con miel, nueces y fruta', prepMin: 4, kcal: 360, protein: 20, carbs: 34, fat: 16, ingredients: [{ name: 'Yogur griego', qty: '200 g' }, { name: 'Nueces', qty: '20 g' }, { name: 'Miel', qty: '15 g' }], steps: ['Sirve el yogur griego en un bol.', 'Añade las nueces picadas y un hilo de miel.'] },
      { slot: 'Cena', name: 'Tortilla francesa de 3 huevos con patata asada y atún', prepMin: 18, kcal: 500, protein: 42, carbs: 40, fat: 19, ingredients: [{ name: 'Huevos', qty: '3 ud' }, { name: 'Patata', qty: '220 g' }, { name: 'Atún al natural', qty: '1 lata' }], steps: ['Cuece o haz al microondas la patata cortada en dados durante 8 minutos.', 'Cuaja la tortilla de tres huevos y acompaña con la patata aliñada y el atún.'] }
    ],
    [
      { slot: 'Desayuno', name: 'Tostadas rústicas con huevos revueltos, jamón serrano y vaso de leche', prepMin: 10, kcal: 680, protein: 38, carbs: 62, fat: 29, ingredients: [{ name: 'Pan de hogaza', qty: '120 g' }, { name: 'Huevos', qty: '3 ud' }, { name: 'Jamón serrano', qty: '45 g' }, { name: 'Leche entera', qty: '250 ml' }], steps: ['Tuesta el pan y haz los huevos revueltos a fuego suave.', 'Coloca el jamón encima y acompaña con la leche.'] },
      { slot: 'Media mañana', name: 'Batido casero hipercalórico de leche, avena, plátano y cacao', prepMin: 4, kcal: 510, protein: 24, carbs: 76, fat: 12, ingredients: [{ name: 'Leche entera', qty: '350 ml' }, { name: 'Copos de avena', qty: '60 g' }, { name: 'Plátano', qty: '1 ud' }, { name: 'Cacao puro', qty: '10 g' }], steps: ['Tritura todos los ingredientes 40 segundos hasta que quede fino.'] },
      { slot: 'Almuerzo', name: 'Pasta rigatoni con carne picada magra de ternera y tomate casero', prepMin: 22, kcal: 840, protein: 56, carbs: 98, fat: 24, ingredients: [{ name: 'Pasta seca', qty: '125 g' }, { name: 'Carne picada magra', qty: '200 g' }, { name: 'Tomate triturado', qty: '160 g' }, { name: 'Aceite de oliva', qty: '12 ml' }], steps: ['Hierve la pasta al dente.', 'Sofríe la carne con tomate triturado y orégano 12 minutos y mezcla con la pasta.'] },
      { slot: 'Merienda', name: 'Queso batido proteico con avena crujiente y frutos rojos', prepMin: 4, kcal: 340, protein: 28, carbs: 42, fat: 6, ingredients: [{ name: 'Queso fresco batido', qty: '250 g' }, { name: 'Copos de avena', qty: '45 g' }, { name: 'Fruta', qty: '100 g' }], steps: ['Mezcla el queso batido con la avena y la fruta troceada.'] },
      { slot: 'Cena', name: 'Salmón a la plancha con arroz basmati y calabacín', prepMin: 16, kcal: 490, protein: 38, carbs: 44, fat: 18, ingredients: [{ name: 'Lomo de salmón', qty: '160 g' }, { name: 'Arroz basmati', qty: '65 g' }, { name: 'Calabacín', qty: '150 g' }], steps: ['Cuece el arroz basmati y saltea el calabacín en rodajas.', 'Marca el salmón 3 minutos por lado a fuego medio-alto.'] }
    ]
  ];

  const needed = new Map();
  const days = DAYS.map((d, idx) => {
    const baseMeals = templates[idx % templates.length];
    const count = Math.max(3, Math.min(5, Number(prefs.mealsPerDay) || 5));
    const factor = 5 / count;
    const picked = baseMeals.slice(0, count).map((m, mi) => {
      m.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
        const inPantry = [...pantryNames].some(pn => pn.includes(key) || key.includes(pn));
        if (!inPantry && !needed.has(ing.name)) needed.set(ing.name, ing.qty);
      });
      return {
        id: `loc_${idx}_${mi}_${uid()}`,
        slot: m.slot,
        name: m.name,
        prepMin: m.prepMin,
        kcal: sc(m.kcal * factor),
        protein: Math.round(m.protein * scale * factor),
        carbs: Math.round(m.carbs * scale * factor),
        fat: Math.round(m.fat * scale * factor),
        ingredients: m.ingredients,
        steps: m.steps
      };
    });
    return { day: d[0], meals: picked };
  });

  return {
    generatedAt: Date.now(),
    summary: `Plantilla base de ${fmtNum(target)} kcal diarias`,
    days,
    shoppingList: [...needed.entries()].slice(0, 14).map(([name, qty]) => ({ id: uid(), name, qty, done: false }))
  };
}

async function generateWeeklyMenu() {
  if (menuLoading) return;
  if (!IS_HOSTED) {
    S.kitchen.menu = buildLocalSurplusMenu(S.kitchen.pantry, S.kitchen.prefs);
    S.kitchen.eaten = {};
    save();
    renderKitchen();
    toast('Menú base cargado (conecta Vercel para IA con Gemini)');
    return;
  }

  menuLoading = true;
  renderKitchen();
  try {
    const token = getDashToken();
    const res = await fetch('/api/chef', {
      method: 'POST',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        token ? { 'x-dashboard-token': token } : {}
      ),
      body: JSON.stringify({
        mode: 'week',
        pantry: S.kitchen.pantry,
        prefs: S.kitchen.prefs
      })
    });
    const json = await res.json().catch(() => null);
    if (res.status === 401) {
      toast('Introduce el token del panel en Ajustes');
      openSettings();
    } else if (res.status === 503) {
      toast(json?.error || 'Configura GEMINI_API_KEY en Vercel');
    } else if (!res.ok || !json) {
      toast(json?.error || 'No se pudo generar el menú con IA');
    } else {
      S.kitchen.menu = normalizeGeneratedMenu(json);
      S.kitchen.eaten = {};
      save();
      toast('Menú semanal generado con IA');
    }
  } catch (e) {
    toast('Sin conexión con el servidor de IA');
  }
  menuLoading = false;
  renderKitchen();
}

async function swapSingleMeal(mealId) {
  const dayPlan = S.kitchen.menu?.days?.[menuDay];
  if (!dayPlan || swappingMealId) return;
  const idx = dayPlan.meals.findIndex(m => m.id === mealId);
  if (idx < 0) return;
  const cur = dayPlan.meals[idx];

  if (!IS_HOSTED) {
    toast('Despliega en Vercel con GEMINI_API_KEY para pedir nuevas recetas a la IA');
    return;
  }

  swappingMealId = mealId;
  renderKitchen();
  try {
    const token = getDashToken();
    const res = await fetch('/api/chef', {
      method: 'POST',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        token ? { 'x-dashboard-token': token } : {}
      ),
      body: JSON.stringify({
        mode: 'swap',
        pantry: S.kitchen.pantry,
        prefs: S.kitchen.prefs,
        currentMeal: cur,
        dayName: DAYS[menuDay][0],
        targetKcal: cur.kcal
      })
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.meal) {
      const m = json.meal;
      dayPlan.meals[idx] = {
        id: uid(),
        slot: String(m.slot || cur.slot),
        name: String(m.name || 'Alternativa casera'),
        prepMin: Number(m.prepMin || 15),
        kcal: Math.round(Number(m.kcal || cur.kcal)),
        protein: Math.round(Number(m.protein || cur.protein)),
        carbs: Math.round(Number(m.carbs || cur.carbs)),
        fat: Math.round(Number(m.fat || cur.fat)),
        ingredients: Array.isArray(m.ingredients) ? m.ingredients : [],
        steps: Array.isArray(m.steps) ? m.steps : []
      };
      save();
      toast('Receta actualizada');
    } else {
      toast(json?.error || 'No se pudo cambiar la receta');
    }
  } catch (e) {
    toast('Error de conexión con la IA');
  }
  swappingMealId = null;
  renderKitchen();
}

/* =========================================================================
   RENDER: FINANZAS (Revolut X + Diario de trading + Clipping + Ingresos extra)
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
  $('#wealth-sub').textContent = t.revx !== null
    ? 'Revolut X en vivo, clipping e ingresos extra'
    : 'Diario de trading, clipping e ingresos extra';

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

  const wins = t.trades.filter(x => Number(x.profit) > 0).length;
  const rrT = t.trades.filter(x => x.rr !== null && x.rr !== undefined && !Number.isNaN(Number(x.rr)));
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
    const rr = x.rr !== null && x.rr !== undefined && !Number.isNaN(Number(x.rr)) ? `${Number(x.rr) >= 0 ? '+' : ''}${x.rr}R` : '';
    return `
      <li class="row">
        <div class="row-text">
          <span class="row-title">${esc(x.label)} <span class="tag">${x.side === 'SHORT' ? 'Short' : 'Long'}</span>${rr ? ` <span class="tag">${rr}</span>` : ''}</span>
          <span class="row-sub">${esc(x.date)}${x.buyPrice !== undefined ? ` · ${x.buyPrice} a ${x.sellPrice}` : ''}${x.slPrice ? ` · SL ${x.slPrice}` : ''}${x.qty ? ` · ${x.qty} uds` : ''}</span>
        </div>
        <div class="row-end">
          <span class="amount ${up ? 'amount-up' : 'amount-down'}">${fmtSigned(x.profit)}</span>
          <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="trade" data-id="${esc(x.id)}" aria-label="Eliminar operación ${esc(x.label)}">${icon('trash')}</button>
        </div>
      </li>`;
  }).join('') : `<li class="empty">Aún no hay operaciones registradas.</li>`;

  const clips = p.clipping || [];
  const views = clips.reduce((a, c) => a + Number(c.views || 0), 0);
  $('#clip-money-total').textContent = fmtMoney(t.clip);
  $('#clip-views-total').textContent = fmtNum(views);
  $('#clip-count').textContent = clips.length;
  $('#clip-rpm').textContent = 'RPM ' + fmtMoney(views > 0 ? t.clip / (views / 1000) : 0);
  $('#clip-list').innerHTML = clips.length ? [...clips].reverse().map(c => `
    <li class="row">
      <div class="row-text"><span class="row-title">${esc(c.title)}</span><span class="row-sub">${fmtNum(c.views)} views · ${esc(c.date)}</span></div>
      <div class="row-end"><span class="amount">${fmtMoney(c.money)}</span>
        <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="clip" data-id="${esc(c.id)}" aria-label="Eliminar ${esc(c.title)}">${icon('trash')}</button></div>
    </li>`).join('') : `<li class="empty">Sin lotes registrados.</li>`;

  const hs = p.sideHustles || [];
  $('#hustles-total').textContent = fmtMoney(t.hustle);
  $('#hustle-list').innerHTML = hs.length ? [...hs].reverse().map(h => `
    <li class="row">
      <div class="row-text"><span class="row-title">${esc(h.name)}</span><span class="row-sub">${esc(h.date)}</span></div>
      <div class="row-end"><span class="amount">${fmtMoney(h.amount)}</span>
        <button type="button" class="btn btn-ghost btn-sm btn-icon btn-del" data-del="hustle" data-id="${esc(h.id)}" aria-label="Eliminar ${esc(h.name)}">${icon('trash')}</button></div>
    </li>`).join('') : `<li class="empty">Sin ingresos extra apuntados.</li>`;
}

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
  } else {
    ch.innerHTML = '';
    delete ch.dataset.trend;
  }

  const rows = d && Array.isArray(d.holdings) ? d.holdings : [];
  $('#revx-rows').innerHTML = rows.length ? rows.map(h => {
    const up = (h.change24hPct || 0) >= 0;
    const hasChg = typeof h.change24hPct === 'number';
    return `
      <tr>
        <td><div class="asset"><span class="asset-mark" aria-hidden="true">${esc(h.currency.slice(0, 3))}</span>
          <div class="asset-text"><b>${esc(h.currency)}</b><small>${fmtQty(h.amount)}${h.staked ? ` · ${fmtQty(h.staked)} en staking` : ''}</small></div></div></td>
        <td class="num">${h.priceEur ? fmtPrice(h.priceEur) : '--'}</td>
        <td class="num col-hide-sm">${hasChg ? `<span class="chg" data-trend="${up ? 'up' : 'down'}">${icon(up ? 'up' : 'down')}${fmtPct(h.change24hPct)}</span>` : '--'}</td>
        <td class="num"><b>${h.valueEur !== null && h.valueEur !== undefined ? fmtMoney(h.valueEur) : '--'}</b></td>
      </tr>`;
  }).join('') : `<tr><td colspan="4" class="empty">${IS_HOSTED ? 'Configura las claves de Revolut X en Vercel para ver tus posiciones.' : 'Las posiciones aparecerán cuando la app esté desplegada en Vercel.'}</td></tr>`;
}

async function revxFetch(manual = false) {
  if (!IS_HOSTED) { REVX.state = 'idle'; renderRevx(); return; }
  if (REVX.state === 'loading') return;
  REVX.state = 'loading';
  renderRevx();
  try {
    const token = getDashToken();
    const res = await fetch('/api/revolutx', { cache: 'no-store', headers: token ? { 'x-dashboard-token': token } : {} });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      REVX.state = 'error';
      REVX.error = (json && json.error) || `No se pudo conectar (código ${res.status})`;
    } else {
      REVX.state = 'ok';
      REVX.error = '';
      REVX.data = json;
      S.projects.revxCache = json;
      persistLocal();
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
   CHARTS (inline SVG with gradient fill, responsive to container width)
   ========================================================================= */
function smoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M${pts[0].x},${pts[0].y}` : '';
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = (b.x - a.x) * 0.42;
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

function renderProgressChart() {
  const el = $('#progress-chart');
  if (!el || el.closest('[hidden]')) return;
  const today = todayDate();
  const series = [];
  for (let i = chartRange - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const iso = isoOf(d);
    const s = dayHabitSummary(iso);
    series.push({ d, iso, pct: s.pct });
  }
  if (!el.querySelector('svg')) el.innerHTML = '<svg></svg>';
  const { w, h } = chartBox(el);
  const pad = 10;
  const n = series.length;
  const pts = series.map((item, i) => ({
    x: n === 1 ? w / 2 : pad + (w - pad * 2) * (i / (n - 1)),
    y: pad + (h - pad * 2) * (1 - item.pct / 100),
    ...item
  }));
  const line = smoothPath(pts);
  const area = `${line} L${pts[n - 1].x.toFixed(1)},${h} L${pts[0].x.toFixed(1)},${h} Z`;
  const avg = Math.round(series.reduce((a, x) => a + x.pct, 0) / n);
  const activeIdx = pts.findIndex(p => p.iso === selectedIso);

  const labelsHtml = chartRange === 7
    ? `<div class="chart-x" style="grid-template-columns:repeat(7,minmax(0,1fr))">${pts.map(p => `
        <button type="button" data-iso="${p.iso}" aria-pressed="${p.iso === selectedIso}" aria-label="${DAYS[weekdayIdx(p.d)][0]} ${p.d.getDate()}: ${p.pct} %">
          ${DAYS[weekdayIdx(p.d)][1]}<small>${p.pct}%</small>
        </button>`).join('')}</div>`
    : `<div class="chart-ends"><span>${pts[0].d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span><span>Media ${avg} %</span><span>Hoy (${pts[n - 1].pct} %)</span></div>`;

  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolución de hábitos en ${chartRange} días. Media ${avg} %.">
      <defs>
        <linearGradient id="grad-progress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" class="c-stop-top"/>
          <stop offset="100%" class="c-stop-bottom"/>
        </linearGradient>
      </defs>
      <line class="c-grid" x1="0" x2="${w}" y1="${h - pad}" y2="${h - pad}"/>
      <line class="c-grid" x1="0" x2="${w}" y1="${pad + (h - pad * 2) / 2}" y2="${pad + (h - pad * 2) / 2}"/>
      ${activeIdx >= 0 ? `<line class="c-guide" x1="${pts[activeIdx].x.toFixed(1)}" x2="${pts[activeIdx].x.toFixed(1)}" y1="0" y2="${h}"/>` : ''}
      <path class="c-area" fill="url(#grad-progress)" d="${area}"/>
      <path class="c-line" d="${line}"/>
      ${pts.map((p, i) => (chartRange === 7 || i === n - 1 || p.iso === selectedIso)
        ? `<circle class="c-dot${p.iso === selectedIso ? ' c-dot-active' : ''}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.iso === selectedIso ? 5 : 3.5}"/>`
        : '').join('')}
    </svg>
    ${labelsHtml}`;
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
      <defs>
        <linearGradient id="grad-trading" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" class="c-stop-top"/>
          <stop offset="100%" class="c-stop-bottom"/>
        </linearGradient>
      </defs>
      <line class="c-base" x1="0" x2="${w}" y1="${y(base)}" y2="${y(base)}"/>
      ${area ? `<path class="c-area" fill="url(#grad-trading)" d="${area}"/>` : ''}
      <path class="c-line ${up ? 'c-up' : 'c-down'}" d="${line}"/>
      <circle class="c-dot ${up ? 'c-up' : 'c-down'}" cx="${pts[n - 1].x.toFixed(1)}" cy="${pts[n - 1].y.toFixed(1)}" r="4"/>
    </svg>
    <div class="chart-ends"><span>Inicio ${fmtMoney(base)}</span><span>Ahora ${fmtMoney(last)}</span></div>`;
}

function renderCharts() {
  renderProgressChart();
  renderTradingChart();
}

function render() {
  renderHabits();
  renderAgenda();
  renderKitchen();
  renderFinance();
  renderCharts();
}

/* =========================================================================
   BLACKBOARD ICS SYNC
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
      if (res.ok) {
        const t = await res.text();
        if (t && (!mustContain || t.includes(mustContain))) return t;
      }
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
    return summary && date && !Number.isNaN(date.getTime()) ? { uid: id || summary + '_' + date.toISOString(), summary, date } : null;
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
    const t0 = todayDate();
    let added = 0;
    events.forEach(ev => {
      if (S.bbSyncedUids[ev.uid]) return;
      if (ev.date < addDays(t0, -1)) return;
      const dateStr = isoOf(ev.date);
      const examLike = /examen|parcial|control|prueba|convocatoria|test|final/i.test(ev.summary);
      const timeStr = ev.date.getHours() || ev.date.getMinutes()
        ? ev.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        : '';
      if (!S.agenda.some(x => x.bbUid === ev.uid || (x.text === ev.summary && x.date === dateStr))) {
        S.agenda.push({
          id: uid(),
          text: ev.summary,
          type: examLike ? 'examen' : 'entrega',
          date: dateStr,
          time: timeStr,
          done: false,
          fromBB: true,
          bbUid: ev.uid
        });
        added++;
      }
      S.bbSyncedUids[ev.uid] = true;
    });
    if (added) save();
    renderAgenda();
    setBB('ok', added ? `Blackboard: ${added} nuevas` : 'Blackboard al día');
    if (manual) toast(added ? `${added} eventos añadidos desde Blackboard` : 'Blackboard ya estaba al día');
  } catch (e) {
    setBB('error', 'Blackboard sin conexión');
    if (manual) toast('No se pudo conectar con Blackboard');
  }
}

/* =========================================================================
   DIALOGS (Habit editor + Settings)
   ========================================================================= */
function renderHabitModalControls() {
  $('#habit-icons').innerHTML = HABIT_ICONS.map(([key, label]) => {
    const on = key === habitFormIcon;
    return `<button type="button" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-hicon="${key}" aria-label="${label}">${icon(key)}</button>`;
  }).join('');

  $('#habit-days').innerHTML = DAYS.map((d, idx) => {
    const on = habitFormDays.includes(idx);
    return `<button type="button" data-hday="${idx}" aria-pressed="${on}" aria-label="${d[0]}">${d[1]}</button>`;
  }).join('');
}

function openHabitDialog(habitId = null) {
  const dlg = $('#habit-dialog');
  const existing = habitId ? S.habits.find(h => h.id === habitId) : null;
  editingHabitId = existing ? existing.id : null;
  $('#habit-dialog-title').textContent = existing ? 'Editar hábito' : 'Nuevo hábito';
  $('#habit-name').value = existing ? existing.name : '';
  habitFormIcon = existing ? (existing.icon || 'dumbbell') : 'dumbbell';
  habitFormDays = existing && Array.isArray(existing.days) ? [...existing.days] : [0, 1, 2, 3, 4, 5, 6];
  $('#habit-delete').hidden = !existing;
  renderHabitModalControls();
  dlg.showModal();
  $('#habit-name').focus();
}

function openSettings() {
  const dlg = $('#settings-dialog');
  $('#token-input').value = getDashToken();
  dlg.showModal();
}

function closeDialogs() {
  ['#habit-dialog', '#settings-dialog'].forEach(sel => {
    const d = $(sel);
    if (d && d.open) d.close();
  });
}

/* =========================================================================
   BULK PANTRY PARSER & TRADING HELPERS
   ========================================================================= */
function parsePantryLine(raw) {
  const clean = raw.replace(/^[-*•]+\s*/, '').trim();
  if (!clean) return null;
  const m = clean.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|gr|l|ml|ud|uds|unidades|latas|huevos)?$/i);
  if (!m) return { id: uid(), name: clean.slice(0, 60), qty: 0, unit: '' };
  let qty = parseFloat(m[2].replace(',', '.')) || 0;
  let u = (m[3] || 'ud').toLowerCase();
  if (u === 'kg') { qty *= 1000; u = 'g'; }
  else if (u === 'gr') { u = 'g'; }
  else if (u === 'l') { qty *= 1000; u = 'ml'; }
  else if (u.startsWith('ud') || u === 'unidades' || u === 'latas' || u === 'huevos') { u = 'ud'; }
  return { id: uid(), name: m[1].trim().slice(0, 60), qty, unit: u };
}

function addOrMergePantry(item) {
  const existing = S.kitchen.pantry.find(
    p => p.name.toLowerCase() === item.name.toLowerCase() && (p.unit || '') === (item.unit || '')
  );
  if (existing && item.qty > 0) {
    existing.qty = Number(existing.qty || 0) + item.qty;
  } else {
    S.kitchen.pantry.push(item);
  }
}

function autoCalcTrade() {
  const buy = parseFloat($('#trade-buy').value), sell = parseFloat($('#trade-sell').value);
  const sl = parseFloat($('#trade-sl').value), qty = parseFloat($('#trade-qty').value);
  if (Number.isNaN(buy) || Number.isNaN(sell)) return;
  const diff = tradeSide === 'LONG' ? sell - buy : buy - sell;
  if (!Number.isNaN(qty) && qty > 0) $('#trade-profit').value = (diff * qty).toFixed(2);
  if (!Number.isNaN(sl) && Math.abs(buy - sl) > 0) $('#trade-rr').value = (diff / Math.abs(buy - sl)).toFixed(2);
}

/* =========================================================================
   FORMS & ACTIONS
   ========================================================================= */
const forms = {
  habit() {
    const name = $('#habit-name').value.trim();
    if (!name) return 'nosave';
    const days = habitFormDays.length ? [...habitFormDays].sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5, 6];
    if (editingHabitId) {
      const h = S.habits.find(x => x.id === editingHabitId);
      if (h) { h.name = name; h.icon = habitFormIcon; h.days = days; }
      toast('Hábito actualizado');
    } else {
      S.habits.push({ id: uid(), name, icon: habitFormIcon, days });
      toast('Hábito creado');
    }
    closeDialogs();
  },
  supp(f) {
    const inp = $('#supp-input');
    const name = inp.value.trim();
    if (!name) return 'nosave';
    S.supplements.push({ id: uid(), name });
    f.reset();
    toast('Suplemento añadido');
  },
  task(f) {
    const txt = $('#task-text').value.trim();
    const date = $('#task-date').value || isoOf(todayDate());
    const time = $('#task-time').value || '';
    if (!txt) return 'nosave';
    S.agenda.push({ id: uid(), text: txt, type: taskType, date, time, done: false });
    f.reset();
    $('#task-date').value = date;
    setRadio($('#task-type'), 'ttype', taskType);
    toast('Añadido a la agenda');
  },
  pantry(f) {
    const name = $('#pantry-name').value.trim();
    const qty = parseFloat($('#pantry-qty').value) || 0;
    if (!name) return 'nosave';
    addOrMergePantry({ id: uid(), name, qty, unit: qty > 0 ? pantryUnit : '' });
    f.reset();
    setRadio($('#pantry-unit'), 'unit', pantryUnit);
    toast('Añadido a la despensa');
  },
  'pantry-bulk'(f) {
    const raw = $('#pantry-bulk').value;
    const items = raw.split(/\r?\n/).map(parsePantryLine).filter(Boolean);
    if (!items.length) return 'nosave';
    items.forEach(addOrMergePantry);
    f.reset();
    toast(`${items.length} productos añadidos`);
  },
  prefs() {
    const minK = Math.max(1200, parseInt($('#pref-min').value, 10) || 2800);
    const maxK = Math.max(minK, parseInt($('#pref-max').value, 10) || 2900);
    const prot = Math.max(40, parseInt($('#pref-prot').value, 10) || 180);
    S.kitchen.prefs = {
      minKcal: minK,
      maxKcal: maxK,
      protein: prot,
      mealsPerDay: prefMeals,
      notes: $('#pref-notes').value.trim()
    };
    $('#prefs').open = false;
    toast('Preferencias guardadas');
  },
  trade(f) {
    const label = $('#trade-label').value.trim().toUpperCase();
    const buy = parseFloat($('#trade-buy').value), sell = parseFloat($('#trade-sell').value);
    const sl = parseFloat($('#trade-sl').value), qty = parseFloat($('#trade-qty').value);
    const profit = parseFloat($('#trade-profit').value);
    let rr = parseFloat($('#trade-rr').value);
    if (!label || Number.isNaN(buy) || Number.isNaN(sell) || Number.isNaN(profit)) return 'nosave';
    if (Number.isNaN(rr) && !Number.isNaN(sl) && sl !== buy) {
      rr = Number(((tradeSide === 'LONG' ? sell - buy : buy - sell) / Math.abs(buy - sl)).toFixed(2));
    }
    S.projects.trades.push({
      id: uid(),
      label,
      side: tradeSide,
      buyPrice: buy,
      sellPrice: sell,
      slPrice: Number.isNaN(sl) ? null : sl,
      qty: Number.isNaN(qty) ? null : qty,
      profit,
      rr: Number.isNaN(rr) ? null : rr,
      date: shortDate()
    });
    const capVal = $('#initial-cap-input').value;
    f.reset();
    $('#initial-cap-input').value = capVal;
    setRadio($('#trade-side'), 'side', tradeSide);
    toast('Operación registrada');
  },
  clip(f) {
    const title = $('#clip-title').value.trim();
    if (!title) return 'nosave';
    S.projects.clipping.push({
      id: uid(),
      title,
      views: parseInt($('#clip-views').value, 10) || 0,
      money: parseFloat($('#clip-money').value) || 0,
      date: shortDate()
    });
    f.reset();
    toast('Lote registrado');
  },
  hustle(f) {
    const name = $('#hustle-name').value.trim();
    if (!name) return 'nosave';
    S.projects.sideHustles.push({
      id: uid(),
      name,
      amount: parseFloat($('#hustle-amount').value) || 0,
      date: shortDate()
    });
    f.reset();
    toast('Ingreso registrado');
  },
  settings() {
    const v = $('#token-input').value.trim();
    if (v) localStorage.setItem(TOKEN_KEY, v);
    else localStorage.removeItem(TOKEN_KEY);
    closeDialogs();
    REVX.state = 'idle';
    pullCloudState(true);
    if (view === 'finanzas') revxFetch(true);
    return 'nosave';
  }
};

function deleteById(kind, id) {
  if (kind === 'supp') S.supplements = S.supplements.filter(x => String(x.id) !== String(id));
  if (kind === 'task') S.agenda = S.agenda.filter(x => String(x.id) !== String(id));
  if (kind === 'pantry') S.kitchen.pantry = S.kitchen.pantry.filter(x => String(x.id) !== String(id));
  if (kind === 'trade') S.projects.trades = S.projects.trades.filter(x => String(x.id) !== String(id));
  if (kind === 'clip') S.projects.clipping = S.projects.clipping.filter(x => String(x.id) !== String(id));
  if (kind === 'hustle') S.projects.sideHustles = S.projects.sideHustles.filter(x => String(x.id) !== String(id));
  save();
  render();
  toast('Eliminado');
}

function armClearPantry(btn) {
  if (!clearPantryTimer) {
    btn.textContent = 'Confirmar vaciado';
    btn.setAttribute('aria-pressed', 'true');
    clearPantryTimer = setTimeout(() => {
      clearPantryTimer = null;
      btn.textContent = 'Vaciar despensa';
      btn.removeAttribute('aria-pressed');
    }, 4000);
    return;
  }
  clearTimeout(clearPantryTimer);
  clearPantryTimer = null;
  btn.textContent = 'Vaciar despensa';
  btn.removeAttribute('aria-pressed');
  S.kitchen.pantry = [];
  save();
  renderKitchen();
  toast('Despensa vaciada');
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habits-backup-${isoOf(todayDate())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Copia descargada');
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(String(ev.target.result || ''));
      S = normalizeState(parsed);
      save();
      render();
      closeDialogs();
      toast('Copia restaurada');
    } catch (e) {
      toast('El archivo no es una copia válida');
    }
  };
  reader.readAsText(file);
}

/* =========================================================================
   DELEGATED EVENTS & KEYBOARD
   ========================================================================= */
document.addEventListener('click', e => {
  if (e.target.tagName === 'DIALOG') { e.target.close(); return; }
  const t = e.target.closest('button, a, [data-view]');
  if (!t || t.disabled) return;
  const ds = t.dataset;

  if (ds.view && !ds.action) { setView(ds.view); return; }
  if (ds.iso) { selectedIso = ds.iso; renderHabits(); renderProgressChart(); return; }
  if (ds.mday !== undefined) { menuDay = Number(ds.mday); renderKitchen(); return; }

  if (ds.toggleHabit) {
    const log = ensureDayLog(selectedIso);
    if (log.habits[ds.toggleHabit]) delete log.habits[ds.toggleHabit];
    else log.habits[ds.toggleHabit] = true;
    save();
    renderHabits();
    renderProgressChart();
    return;
  }
  if (ds.editHabit) { openHabitDialog(ds.editHabit); return; }
  if (ds.hicon) { habitFormIcon = ds.hicon; setRadio($('#habit-icons'), 'hicon', ds.hicon); return; }
  if (ds.hday !== undefined) {
    const d = Number(ds.hday);
    if (habitFormDays.includes(d)) {
      if (habitFormDays.length > 1) habitFormDays = habitFormDays.filter(x => x !== d);
    } else {
      habitFormDays.push(d);
    }
    renderHabitModalControls();
    return;
  }

  if (ds.water !== undefined) {
    const n = Number(ds.water);
    const log = ensureDayLog(selectedIso);
    log.water = log.water === n ? n - 1 : n;
    save();
    renderHabits();
    return;
  }
  if (ds.supp) {
    const log = ensureDayLog(selectedIso);
    if (log.supps[ds.supp]) delete log.supps[ds.supp];
    else log.supps[ds.supp] = true;
    save();
    renderHabits();
    return;
  }

  if (ds.range) {
    chartRange = Number(ds.range);
    setRadio($('#range-group'), 'range', ds.range);
    renderHabits();
    renderProgressChart();
    return;
  }
  if (ds.ttype) { taskType = ds.ttype; setRadio($('#task-type'), 'ttype', ds.ttype); return; }
  if (ds.agfilter) { agFilter = ds.agfilter; setRadio($('#ag-filter'), 'agfilter', ds.agfilter); renderAgenda(); return; }
  if (ds.toggleTask) {
    const item = S.agenda.find(x => String(x.id) === String(ds.toggleTask));
    if (item) { item.done = !item.done; save(); renderAgenda(); }
    return;
  }

  if (ds.unit) { pantryUnit = ds.unit; setRadio($('#pantry-unit'), 'unit', ds.unit); return; }
  if (ds.meals) { prefMeals = Number(ds.meals); setRadio($('#pref-meals'), 'meals', ds.meals); return; }
  if (ds.eatMeal) {
    const dayIso = dayDateForMenuIdx(menuDay);
    S.kitchen.eaten[dayIso] = S.kitchen.eaten[dayIso] || {};
    if (S.kitchen.eaten[dayIso][ds.eatMeal]) delete S.kitchen.eaten[dayIso][ds.eatMeal];
    else S.kitchen.eaten[dayIso][ds.eatMeal] = true;
    save();
    renderKitchen();
    return;
  }
  if (ds.swapMeal) { swapSingleMeal(ds.swapMeal); return; }
  if (ds.toggleShop) {
    const list = S.kitchen.menu?.shoppingList || [];
    const item = list.find(x => String(x.id) === String(ds.toggleShop));
    if (item) { item.done = !item.done; save(); renderKitchen(); }
    return;
  }
  if (ds.shopToPantry) {
    const list = S.kitchen.menu?.shoppingList || [];
    const idx = list.findIndex(x => String(x.id) === String(ds.shopToPantry));
    if (idx >= 0) {
      const [item] = list.splice(idx, 1);
      const parsed = parsePantryLine(`${item.name} ${item.qty || ''}`);
      if (parsed) addOrMergePantry(parsed);
      save();
      renderKitchen();
      toast(`${item.name} pasado a tu despensa`);
    }
    return;
  }

  if (ds.side) { tradeSide = ds.side; setRadio($('#trade-side'), 'side', ds.side); autoCalcTrade(); return; }
  if (ds.del) { deleteById(ds.del, ds.id); return; }

  switch (ds.action) {
    case 'add-habit': openHabitDialog(null); break;
    case 'habit-delete':
      if (editingHabitId) {
        S.habits = S.habits.filter(h => h.id !== editingHabitId);
        editingHabitId = null;
        closeDialogs();
        save();
        renderHabits();
        renderProgressChart();
        toast('Hábito eliminado');
      }
      break;
    case 'open-settings': openSettings(); break;
    case 'close-dialog': closeDialogs(); break;
    case 'bb-sync': syncBlackboard(true); break;
    case 'generate-menu': generateWeeklyMenu(); break;
    case 'generate-local-menu':
      S.kitchen.menu = buildLocalSurplusMenu(S.kitchen.pantry, S.kitchen.prefs);
      S.kitchen.eaten = {};
      save();
      renderKitchen();
      toast('Menú semanal cargado');
      break;
    case 'clear-pantry': armClearPantry(t); break;
    case 'revx-refresh': revxFetch(true); break;
    case 'sync-now': pullCloudState(true); break;
    case 'export': exportBackup(); break;
    default: break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  const fn = forms[f.dataset.form];
  if (!fn) return;
  const r = fn(f);
  if (r !== 'nosave') { save(); render(); }
});

document.addEventListener('keydown', e => {
  const r = e.target.closest('[role="radio"]');
  if (!r || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const all = [...r.parentElement.querySelectorAll('[role="radio"]')].filter(b => !b.disabled);
  let i = all.indexOf(r);
  if (e.key === 'Home') i = 0;
  else if (e.key === 'End') i = all.length - 1;
  else i = (i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + all.length) % all.length;
  all[i].focus();
  all[i].click();
});

$('#initial-cap-input').addEventListener('change', e => {
  const n = parseFloat(e.target.value);
  S.projects.initialCapital = Number.isNaN(n) ? 0 : n;
  save();
  renderFinance();
  renderTradingChart();
});
['trade-buy', 'trade-sell', 'trade-sl', 'trade-qty'].forEach(id => $('#' + id).addEventListener('input', autoCalcTrade));
$('#import-input').addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f) importBackup(f);
  e.target.value = '';
});

window.addEventListener('hashchange', () => setView(location.hash.slice(1), false));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    pullCloudState(false);
    if (view === 'finanzas') revxFetch();
  }
});

let rz;
new ResizeObserver(() => {
  cancelAnimationFrame(rz);
  rz = requestAnimationFrame(renderCharts);
}).observe(document.body);

/* =========================================================================
   BOOT
   ========================================================================= */
hydrateIcons();
load();

setRadio($('#range-group'), 'range', chartRange);
setRadio($('#task-type'), 'ttype', taskType);
setRadio($('#ag-filter'), 'agfilter', agFilter);
setRadio($('#pantry-unit'), 'unit', pantryUnit);
setRadio($('#pref-meals'), 'meals', prefMeals);
setRadio($('#trade-side'), 'side', tradeSide);

const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
$$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', themeColor));

render();
const initialHash = location.hash.slice(1);
setView(VIEWS.includes(initialHash) ? initialHash : 'habitos', false);

pullCloudState(false);
syncBlackboard(false);
if (view !== 'finanzas') revxFetch();
setInterval(() => syncBlackboard(false), 15 * 60 * 1000);

if ('serviceWorker' in navigator && IS_HOSTED) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
})();
