import { useState, useCallback } from 'react';
import { buildAnalysisPrompt } from './imageUtils';

// In production (Vercel), calls go through /api/claude (serverless proxy).
// In local dev, falls back to direct Anthropic API if VITE_ANTHROPIC_API_KEY is set.
const API_URL = '/api/claude';

async function callClaude(messages, systemPrompt = '') {
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt || undefined,
    messages,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export function usePhotoAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzePhoto = useCallback(async (base64Image, mediaType = 'image/jpeg') => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const data = await callClaude(
        [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Image },
              },
              { type: 'text', text: buildAnalysisPrompt() },
            ],
          },
        ],
        'You are an expert portrait photographer and photo analyst. Always respond with valid JSON only — no markdown, no extra text.'
      );

      const text = data.content?.find(c => c.type === 'text')?.text || '{}';
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAnalysis(parsed);
      return parsed;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analysis, loading, error, analyzePhoto };
}

export function usePromptGeneration() {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateEnhancedPrompt = useCallback(async (basePrompt, analysisData = null) => {
    setLoading(true);
    setError(null);

    try {
      const context = analysisData
        ? `\n\nPhoto analysis context (use to tailor the prompt): ${JSON.stringify(analysisData)}`
        : '';

      const data = await callClaude([
        {
          role: 'user',
          content: `You are a professional AI headshot photographer specializing in prompts for Midjourney and Stable Diffusion. Enhance this headshot prompt to be more specific, vivid, and effective. Keep it under 300 words. Return ONLY the enhanced prompt text — no explanation, no preamble.\n\nOriginal prompt:\n${basePrompt}${context}`,
        },
      ]);

      const text = data.content?.find(c => c.type === 'text')?.text || basePrompt;
      const enhanced = text.trim();
      setGeneratedPrompt(enhanced);
      return enhanced;
    } catch (e) {
      setError(e.message);
      return basePrompt;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generatedPrompt, setGeneratedPrompt, loading, error, generateEnhancedPrompt };
}
