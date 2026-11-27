const crypto = require('node:crypto');

const REVX_BASE = 'https://revx.revolut.com';

function normalizePrivateKey(raw) {
  const clean = String(raw || '').trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
  if (!clean) throw new Error('Falta REVX_PRIVATE_KEY');

  if (clean.includes('BEGIN PRIVATE KEY') || clean.includes('BEGIN EC PRIVATE KEY')) {
    return crypto.createPrivateKey(clean);
  }

  const compact = clean.replace(/\s+/g, '');
  let der = null;
  if (/^[0-9a-fA-F]{64}$/.test(compact)) {
    const seed = Buffer.from(compact, 'hex');
    const prefix = Buffer.from('302e020100300506032b657004220420', 'hex');
    der = Buffer.concat([prefix, seed]);
  } else {
    const buf = Buffer.from(compact, 'base64');
    if (buf.length === 32) {
      const prefix = Buffer.from('302e020100300506032b657004220420', 'hex');
      der = Buffer.concat([prefix, buf]);
    } else if (buf.length >= 46) {
      der = buf;
    }
  }

  if (!der) throw new Error('Formato de REVX_PRIVATE_KEY no reconocido');
  return crypto.createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
}

function signRevxRequest(privateKey, method, path, query = '') {
  const timestamp = String(Date.now());
  const cleanQuery = query.replace(/^\?/, '');
  const payload = `${timestamp}${method.toUpperCase()}${path}${cleanQuery}`;
  const signature = crypto.sign(null, Buffer.from(payload, 'utf8'), privateKey).toString('base64');
  return { timestamp, signature };
}

async function revxGet(path, query, apiKey, privateKey, signed = true) {
  const qs = query ? `?${query.replace(/^\?/, '')}` : '';
  const headers = { Accept: 'application/json' };
  if (signed) {
    const { timestamp, signature } = signRevxRequest(privateKey, 'GET', path, query);
    headers['X-Revx-API-Key'] = apiKey;
    headers['X-Revx-Timestamp'] = timestamp;
    headers['X-Revx-Signature'] = signature;
  }
  const res = await fetch(`${REVX_BASE}${path}${qs}`, { headers });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
  if (!res.ok) {
    const detail = (json && (json.message || json.error_message || json.error)) || `HTTP ${res.status}`;
    const err = new Error(`Revolut X respondio con error: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

function checkDashboardToken(req) {
  const expected = (process.env.DASHBOARD_TOKEN || '').trim();
  if (!expected) return true;
  const provided = String(req.headers['x-dashboard-token'] || '').trim();
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parsePair(symbol) {
  const parts = String(symbol || '').toUpperCase().split(/[/-]/);
  return parts.length === 2 ? { base: parts[0], quote: parts[1] } : null;
}

function buildTickerMap(rawTickers) {
  const list = Array.isArray(rawTickers) ? rawTickers : (rawTickers && Array.isArray(rawTickers.data) ? rawTickers.data : []);
  const pairs = new Map();
  for (const t of list) {
    const p = parsePair(t.symbol);
    if (!p) continue;
    const price = Number(t.mid || t.last_price || t.index_price || t.bid || 0);
    if (!(price > 0)) continue;
    const delta = t.price_change_24h !== undefined ? Number(t.price_change_24h) : null;
    const prev = delta !== null && !Number.isNaN(delta) ? price - delta : null;
    const pct = prev && prev > 0 ? (delta / prev) * 100 : null;
    const key = `${p.base}/${p.quote}`;
    if (!pairs.has(key) || t.region === 'EEA') {
      pairs.set(key, { price, delta: Number.isFinite(delta) ? delta : 0, pct: Number.isFinite(pct) ? pct : 0 });
    }
  }
  return pairs;
}

function resolveUsdToEur(pairs) {
  if (pairs.has('EUR/USD')) return 1 / pairs.get('EUR/USD').price;
  if (pairs.has('USD/EUR')) return pairs.get('USD/EUR').price;
  if (pairs.has('USDC/EUR')) return pairs.get('USDC/EUR').price;
  if (pairs.has('USDT/EUR')) return pairs.get('USDT/EUR').price;
  if (pairs.has('BTC/EUR') && pairs.has('BTC/USD')) return pairs.get('BTC/EUR').price / pairs.get('BTC/USD').price;
  if (pairs.has('ETH/EUR') && pairs.has('ETH/USD')) return pairs.get('ETH/EUR').price / pairs.get('ETH/USD').price;
  return 0.92;
}

function resolveGbpToEur(pairs) {
  if (pairs.has('GBP/EUR')) return pairs.get('GBP/EUR').price;
  if (pairs.has('EUR/GBP')) return 1 / pairs.get('EUR/GBP').price;
  if (pairs.has('BTC/EUR') && pairs.has('BTC/GBP')) return pairs.get('BTC/EUR').price / pairs.get('BTC/GBP').price;
  return 1.17;
}

function valueAssetInEur(currency, pairs, usdToEur, gbpToEur) {
  const c = currency.toUpperCase();
  if (c === 'EUR') return { priceEur: 1, change24hPct: 0 };
  if (c === 'USD') return { priceEur: usdToEur, change24hPct: 0 };
  if (c === 'GBP') return { priceEur: gbpToEur, change24hPct: 0 };

  const direct = pairs.get(`${c}/EUR`);
  if (direct) return { priceEur: direct.price, change24hPct: direct.pct };

  for (const q of ['USD', 'USDC', 'USDT']) {
    const viaUsd = pairs.get(`${c}/${q}`);
    if (viaUsd) {
      const qRate = q === 'USD' ? usdToEur : (pairs.get(`${q}/EUR`)?.price || usdToEur);
      return { priceEur: viaUsd.price * qRate, change24hPct: viaUsd.pct };
    }
  }

  const viaGbp = pairs.get(`${c}/GBP`);
  if (viaGbp) return { priceEur: viaGbp.price * gbpToEur, change24hPct: viaGbp.pct };

  return { priceEur: null, change24hPct: null };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Metodo no permitido' }));
    return;
  }

  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: 'Origen externo bloqueado' }));
    return;
  }

  if (!checkDashboardToken(req)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Introduce el token del panel en Ajustes' }));
    return;
  }

  const apiKey = (process.env.REVX_API_KEY || '').trim();
  const rawPriv = process.env.REVX_PRIVATE_KEY || '';
  if (!apiKey || !rawPriv) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Configura REVX_API_KEY y REVX_PRIVATE_KEY en Vercel' }));
    return;
  }

  let privateKey;
  try {
    privateKey = normalizePrivateKey(rawPriv);
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
    return;
  }

  try {
    const [balancesRaw, tickersRaw] = await Promise.all([
      revxGet('/api/1.0/balances', '', apiKey, privateKey, true),
      revxGet('/api/1.0/public/tickers', 'region=EEA', apiKey, privateKey, false)
        .catch(() => revxGet('/api/1.0/tickers', '', apiKey, privateKey, true))
        .catch(() => ({ data: [] }))
    ]);

    const balances = Array.isArray(balancesRaw)
      ? balancesRaw
      : (balancesRaw && Array.isArray(balancesRaw.data) ? balancesRaw.data : []);

    const pairs = buildTickerMap(tickersRaw);
    const usdToEur = resolveUsdToEur(pairs);
    const gbpToEur = resolveGbpToEur(pairs);

    const holdings = [];
    let totalEur = 0;
    let prevTotalEur = 0;

    for (const b of balances) {
      const currency = String(b.currency || '').toUpperCase();
      const available = Number(b.available || 0);
      const reserved = Number(b.reserved || 0);
      const staked = Number(b.staked || 0);
      const amount = b.total !== undefined ? Number(b.total) : (available + reserved + staked);
      if (!currency || !(amount > 0)) continue;

      const { priceEur, change24hPct } = valueAssetInEur(currency, pairs, usdToEur, gbpToEur);
      const valueEur = priceEur !== null ? amount * priceEur : null;

      if (valueEur !== null) {
        totalEur += valueEur;
        const pct = change24hPct || 0;
        const prevVal = pct > -99.9 ? valueEur / (1 + pct / 100) : valueEur;
        prevTotalEur += prevVal;
      }

      holdings.push({
        currency,
        amount,
        available,
        reserved,
        staked,
        priceEur,
        valueEur,
        change24hPct
      });
    }

    holdings.sort((a, b) => (b.valueEur ?? -1) - (a.valueEur ?? -1));
    const change24hEur = totalEur - prevTotalEur;
    const change24hPct = prevTotalEur > 0 ? (change24hEur / prevTotalEur) * 100 : 0;

    res.statusCode = 200;
    res.end(JSON.stringify({
      totalEur,
      change24hEur,
      change24hPct,
      holdings,
      updatedAt: Date.now()
    }));
  } catch (e) {
    res.statusCode = e.status && e.status >= 400 && e.status < 600 ? e.status : 502;
    res.end(JSON.stringify({ error: e.message || 'Error al consultar Revolut X' }));
  }
};
