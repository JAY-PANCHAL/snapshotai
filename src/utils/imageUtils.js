/**
 * Reads a File as a base64 data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a File as raw base64 (no prefix)
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Crop & resize image on canvas, return data URL
 * aspectRatio: e.g. 1 for square, 4/5 for portrait
 */
export function cropAndResize(dataUrl, aspectRatio = 1, maxSize = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
      const imgAspect = img.width / img.height;

      if (imgAspect > aspectRatio) {
        srcW = img.height * aspectRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        srcH = img.width / aspectRatio;
        srcY = (img.height - srcH) / 2;
      }

      const outW = aspectRatio >= 1 ? maxSize : Math.round(maxSize * aspectRatio);
      const outH = aspectRatio >= 1 ? Math.round(maxSize / aspectRatio) : maxSize;

      canvas.width = outW;
      canvas.height = outH;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

/**
 * Get face region hint from Claude's analysis
 */
export function buildAnalysisPrompt() {
  return `Analyze this portrait photo and respond ONLY with a JSON object (no markdown, no explanation) with these exact fields:
{
  "hasFace": true/false,
  "faceCount": number,
  "lighting": "natural|studio|outdoor|indoor|mixed",
  "background": "plain|office|outdoor|complex",
  "framing": "tight headshot|chest up|half body|full body",
  "expression": "smiling|neutral|serious|confident",
  "attire": "formal|business casual|casual|medical|other",
  "quality": "excellent|good|fair|poor",
  "issues": ["list of any issues like blur, dark lighting, sunglasses, etc"],
  "suggestions": ["list of 2-3 improvement tips"],
  "bestCrops": ["1:1 square","4:5 portrait","3:4 classic"],
  "overallScore": number between 1-10
}`;
}

export function buildHeadshotPrompt(options) {
  const {
    template,
    background,
    lighting,
    attire,
    mood,
    platform,
    quality,
    extras = [],
    customNotes = '',
  } = options;

  const extrasStr = extras.length ? `Emphasize: ${extras.join(', ')}.` : '';
  const notesStr = customNotes ? `Additional notes: ${customNotes}.` : '';

  return `Ultra-realistic professional headshot for ${platform || 'LinkedIn profile'}. 
${template ? `Style: ${template.name} — ${template.description}.` : ''}
Attire: ${attire || 'business professional'}.
Background: ${background || 'neutral grey seamless backdrop'}.
Lighting: ${lighting || 'soft three-point studio lighting'}.
Expression & mood: ${mood || 'confident and approachable'}.
Camera: 85mm portrait lens, f/2.2 aperture, shallow depth of field.
Quality: ${quality || '4K photorealistic'}, natural skin texture, sharp eyes, preserve authentic facial features.
${extrasStr}
${notesStr}
No AI artifacts. No distorted hands. Professional commercial photography standard.`.trim();
}

export const ASPECT_RATIOS = {
  '1:1': 1,
  '4:5': 4 / 5,
  '3:4': 3 / 4,
  '2:3': 2 / 3,
  '16:9': 16 / 9,
};
