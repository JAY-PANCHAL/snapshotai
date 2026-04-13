// /api/image — proxies Pollinations.ai image requests (fixes CORS and keeps URLs private)

export default async function handler(req, res) {
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
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch image' });
  }
}
