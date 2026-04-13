// Vercel Serverless Functions — multiple endpoints
// /api/claude — proxies Anthropic API calls (disabled for MVP)
// /api/image — proxies Pollinations.ai image requests (fixes CORS issues)

export default async function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // Route to image proxy for /api/image
  if (pathname === '/api/image') {
    return handleImageProxy(req, res);
  }

  // Route to Claude proxy for /api/claude (disabled in MVP)
  if (pathname === '/api/claude') {
    return handleClaudeProxy(req, res);
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}

async function handleImageProxy(req, res) {
  // Proxy image requests from Pollinations.ai to avoid CORS errors
  // Browser calls /api/image?url=... → We fetch from pollinations.ai → Return image blob
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET to fetch images' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const imageRes = await fetch(url);
    if (!imageRes.ok) throw new Error(`HTTP ${imageRes.status}`);

    const buffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 year
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch image' });
  }
}

async function handleClaudeProxy(req, res) {
  // Claude API proxy — disabled in MVP to avoid API costs
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Photo analysis is disabled in MVP.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
