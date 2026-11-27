const crypto = require('node:crypto');

const STATE_KEY = 'habits:dashboard:v3';
const MAX_BODY_BYTES = 1_500_000;

function checkAuth(req) {
  const required = String(process.env.DASHBOARD_TOKEN || '').trim();
  if (!required) return true;
  const provided = String(req.headers['x-dashboard-token'] || '').trim();
  if (!provided) return false;
  const a = Buffer.from(required, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getRedisConfig() {
  const url = String(
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ''
  ).trim().replace(/\/+$/, '');
  const token = String(
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ''
  ).trim();
  return url && token ? { url, token } : null;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error('Payload demasiado grande');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function redisCommand(cfg, command) {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });
  if (!res.ok) {
    throw new Error(`Error en base de datos (${res.status})`);
  }
  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (!checkAuth(req)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Token del panel incorrecto o ausente' }));
    return;
  }

  const cfg = getRedisConfig();
  if (!cfg) {
    res.statusCode = 503;
    res.end(JSON.stringify({
      configured: false,
      error: 'Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en Vercel'
    }));
    return;
  }

  try {
    if (req.method === 'GET') {
      const out = await redisCommand(cfg, ['GET', STATE_KEY]);
      if (!out || out.result === null || out.result === undefined) {
        res.statusCode = 200;
        res.end(JSON.stringify({ configured: true, state: null }));
        return;
      }
      const parsed = typeof out.result === 'string' ? JSON.parse(out.result) : out.result;
      res.statusCode = 200;
      res.end(JSON.stringify({ configured: true, state: parsed }));
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body || typeof body.state !== 'object' || body.state === null) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Falta el objeto state' }));
        return;
      }
      const payload = {
        ...body.state,
        updatedAt: Number(body.state.updatedAt || Date.now())
      };
      await redisCommand(cfg, ['SET', STATE_KEY, JSON.stringify(payload)]);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, updatedAt: payload.updatedAt }));
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Metodo no permitido' }));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: e.message || 'No se pudo sincronizar' }));
  }
};
