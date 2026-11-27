const ALLOWED_HOSTS = new Set([
  'ev.us.es'
]);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const rawUrl = req.query && req.query.url ? String(req.query.url) : '';
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (e) {
    res.statusCode = 400;
    res.end('Invalid URL');
    return;
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    res.statusCode = 403;
    res.end('Forbidden host');
    return;
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HabitsDashboard/3.0)',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });
    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.end('Upstream error');
      return;
    }
    const text = await upstream.text();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = 200;
    res.end(text);
  } catch (e) {
    res.statusCode = 502;
    res.end('Bad Gateway');
  }
};
