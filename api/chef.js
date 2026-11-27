const crypto = require('node:crypto');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function checkAuth(req) {
  const required = String(process.env.DASHBOARD_TOKEN || '').trim();
  if (!required) return true;
  const provided = String(req.headers['x-dashboard-token'] || '').trim();
  if (!provided) return false;
  const a = Buffer.from(required, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > 250_000) throw new Error('Peticion demasiado grande');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function extractJson(text) {
  const clean = String(text || '').replace(/```json|```/gi, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(clean.slice(start, end + 1));
    }
    throw new Error('Respuesta JSON invalida de Gemini');
  }
}

function buildWeeklyPrompt({ pantry, prefs }) {
  const minKcal = Math.max(1200, Math.min(6000, Number(prefs.minKcal) || 2800));
  const maxKcal = Math.max(minKcal, Math.min(6500, Number(prefs.maxKcal) || 2900));
  const prot = Math.max(60, Math.min(400, Number(prefs.protein) || 180));
  const meals = Math.max(3, Math.min(6, Number(prefs.mealsPerDay) || 5));
  const notes = String(prefs.notes || '').slice(0, 600);

  const pantryLines = Array.isArray(pantry) && pantry.length
    ? pantry.slice(0, 120).map(p => {
      const q = p.qty ? ` (${p.qty} ${p.unit || ''})`.trim() : '';
      return `- ${String(p.name || '').slice(0, 60)}${q ? ' ' + q : ''}`;
    }).join('\n')
    : '- Sin ingredientes registrados todavia (propon ingredientes basicos de supermercado espanol y anadelos a la lista de la compra).';

  const slotHints = {
    3: 'Desayuno, Almuerzo, Cena',
    4: 'Desayuno, Almuerzo, Merienda, Cena',
    5: 'Desayuno, Media manana, Almuerzo, Merienda, Cena',
    6: 'Desayuno, Media manana, Almuerzo, Merienda, Cena, Recena'
  }[meals] || 'Desayuno, Almuerzo, Merienda, Cena';

  return [
    'Eres un nutricionista deportivo y chef practico en Espana.',
    `Disena un menu semanal completo de 7 dias (Lunes a Domingo) para lograr un superavit calorico limpio de entre ${minKcal} y ${maxKcal} kcal CADA DIA, con alrededor de ${prot} g de proteina diaria.`,
    `Cada dia debe tener exactamente ${meals} comidas (${slotHints}).`,
    'Prioriza al maximo los alimentos disponibles en la despensa del usuario para no desperdiciar comida. Puedes usar condimentos basicos (aceite de oliva virgen extra, sal, pimienta, ajo, especias) y si falta algun ingrediente clave para completar calorias o variedad durante la semana, incluyelo en "shoppingList".',
    'Reglas estrictas de formato y estilo:',
    '- Cero emojis y cero guiones largos en todo el texto.',
    '- Recetas realistas, sabrosas, rapidas para un estudiante universitario que entrena fuerza (10 a 25 min por plato, o batch cooking).',
    '- La suma de kcal de las comidas de CADA dia debe caer dentro del rango objetivo (' + minKcal + ' a ' + maxKcal + ' kcal). Verifica la suma matematica.',
    notes ? `Preferencias y notas del usuario: ${notes}` : '',
    'Despensa actual en casa:',
    pantryLines,
    'Devuelve EXCLUSIVAMENTE un objeto JSON valido con esta estructura exacta:',
    JSON.stringify({
      summary: 'Resumen breve en una frase de la estrategia de la semana',
      days: [
        {
          day: 'Lunes',
          meals: [
            {
              slot: 'Desayuno',
              name: 'Nombre apetecible del plato',
              prepMin: 10,
              kcal: 680,
              protein: 42,
              carbs: 78,
              fat: 20,
              ingredients: [{ name: 'Avena', qty: '100 g' }],
              steps: ['Paso 1 claro y directo.', 'Paso 2 claro y directo.']
            }
          ]
        }
      ],
      shoppingList: [
        { name: 'Platanos', qty: '1 kg' }
      ]
    })
  ].filter(Boolean).join('\n\n');
}

function buildSwapPrompt({ pantry, prefs, currentMeal, dayName, targetKcal }) {
  const prot = Math.round((Number(prefs.protein) || 180) / (Number(prefs.mealsPerDay) || 5));
  const notes = String(prefs.notes || '').slice(0, 500);
  const pantryText = Array.isArray(pantry) && pantry.length
    ? pantry.slice(0, 100).map(p => `${p.name}${p.qty ? ` (${p.qty} ${p.unit || ''})` : ''}`).join(', ')
    : 'ingredientes basicos de supermercado';

  return [
    'Eres un nutricionista deportivo y chef practico en Espana.',
    `Genera UNA alternativa distinta para la comida "${currentMeal?.slot || 'Comida'}" del ${dayName || 'dia'}, sustituyendo a "${currentMeal?.name || 'plato anterior'}".`,
    `Debe aportar aproximadamente ${targetKcal} kcal (margen +-60 kcal) y unos ${prot} g de proteina, usando preferiblemente esta despensa: ${pantryText}.`,
    notes ? `Notas del usuario: ${notes}` : '',
    'Cero emojis y cero guiones largos. Devuelve EXCLUSIVAMENTE JSON valido con la forma:',
    JSON.stringify({
      meal: {
        slot: currentMeal?.slot || 'Almuerzo',
        name: 'Nuevo plato distinto',
        prepMin: 15,
        kcal: targetKcal,
        protein: prot,
        carbs: 75,
        fat: 22,
        ingredients: [{ name: 'Ingrediente', qty: '150 g' }],
        steps: ['Paso 1.', 'Paso 2.']
      }
    })
  ].filter(Boolean).join('\n\n');
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Metodo no permitido' }));
    return;
  }

  if (!checkAuth(req)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Token del panel incorrecto o ausente' }));
    return;
  }

  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Falta GEMINI_API_KEY en las variables de entorno de Vercel' }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const mode = body.mode === 'swap' ? 'swap' : 'week';
    const pantry = Array.isArray(body.pantry) ? body.pantry : [];
    const prefs = body.prefs && typeof body.prefs === 'object' ? body.prefs : {};

    const prompt = mode === 'swap'
      ? buildSwapPrompt({
        pantry,
        prefs,
        currentMeal: body.currentMeal || {},
        dayName: body.dayName || 'Lunes',
        targetKcal: Math.max(250, Math.min(2000, Number(body.targetKcal) || 600))
      })
      : buildWeeklyPrompt({ pantry, prefs });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.65,
          responseMimeType: 'application/json'
        }
      })
    });

    const rawJson = await upstream.json().catch(() => null);
    if (!upstream.ok || !rawJson) {
      const msg = rawJson?.error?.message || `Gemini respondio con codigo ${upstream.status}`;
      res.statusCode = upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502;
      res.end(JSON.stringify({ error: msg }));
      return;
    }

    const text = rawJson?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const parsed = extractJson(text);

    res.statusCode = 200;
    res.end(JSON.stringify(parsed));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: e.message || 'Error al generar recetas con IA' }));
  }
};
