function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('Invalid reference image format');
  }
  const splitAt = dataUrl.indexOf(',');
  if (splitAt === -1) throw new Error('Malformed data URL');
  const header = dataUrl.slice(0, splitAt);
  const base64 = dataUrl.slice(splitAt + 1);
  const mime = (header.match(/^data:(.*?);base64$/i) || [])[1] || 'image/jpeg';
  const buffer = Buffer.from(base64, 'base64');
  return new Blob([buffer], { type: mime });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST for identity-locked headshot generation' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Identity lock unavailable: POLLINATIONS_API_KEY is not configured on server.',
    });
  }

  const {
    prompt,
    model = 'gptimage',
    width = 1024,
    height = 1024,
    seed = -1,
    referenceImage,
  } = req.body || {};

  if (!prompt || !referenceImage) {
    return res.status(400).json({ error: 'Missing prompt or referenceImage' });
  }

  try {
    const imageBlob = dataUrlToBlob(referenceImage);
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('model', model);
    formData.append('size', `${width}x${height}`);
    formData.append('n', '1');
    formData.append('seed', String(seed));
    formData.append('response_format', 'b64_json');
    formData.append('image', imageBlob, 'reference.jpg');

    const editRes = await fetch('https://gen.pollinations.ai/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const payload = await editRes.json().catch(() => null);
    if (!editRes.ok) {
      const reason = payload?.error?.message || payload?.error || `HTTP ${editRes.status}`;
      throw new Error(reason);
    }

    const item = payload?.data?.[0];
    if (!item) throw new Error('No image returned by identity model');

    if (item.b64_json) {
      const buffer = Buffer.from(item.b64_json, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(buffer);
    }

    if (item.url) {
      const proxied = await fetch(item.url);
      if (!proxied.ok) throw new Error(`Failed to fetch generated image URL (HTTP ${proxied.status})`);
      const buf = Buffer.from(await proxied.arrayBuffer());
      const contentType = proxied.headers.get('content-type') || 'image/png';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(buf);
    }

    throw new Error('Identity model returned unsupported payload');
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Identity generation failed' });
  }
}
