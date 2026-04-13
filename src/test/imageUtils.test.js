import { describe, it, expect, vi } from 'vitest'
import {
  fileToDataUrl,
  fileToBase64,
  cropAndResize,
  buildAnalysisPrompt,
  buildHeadshotPrompt,
  ASPECT_RATIOS,
} from '../utils/imageUtils'

// ── fileToDataUrl ─────────────────────────────────────────────────────────────
describe('fileToDataUrl', () => {
  it('resolves with a data URL string for a valid file', async () => {
    const file = new File(['hello'], 'test.jpg', { type: 'image/jpeg' })
    const result = await fileToDataUrl(file)
    expect(typeof result).toBe('string')
    expect(result.startsWith('data:')).toBe(true)
  })

  it('rejects when FileReader errors', async () => {
    const file = new File([''], 'empty.jpg', { type: 'image/jpeg' })
    const origFR = global.FileReader

    global.FileReader = class {
      readAsDataURL() { setTimeout(() => this.onerror(new Error('read error')), 0) }
    }

    await expect(fileToDataUrl(file)).rejects.toBeTruthy()
    global.FileReader = origFR
  })
})

// ── fileToBase64 ──────────────────────────────────────────────────────────────
describe('fileToBase64', () => {
  it('returns base64 string without the data: prefix', async () => {
    const file = new File(['hello'], 'test.png', { type: 'image/png' })
    const result = await fileToBase64(file)
    expect(typeof result).toBe('string')
    expect(result).not.toContain('data:')
    expect(result).not.toContain(',')
  })

  it('produces a non-empty string for a non-empty file', async () => {
    const file = new File(['abc'], 'x.jpg', { type: 'image/jpeg' })
    const b64 = await fileToBase64(file)
    expect(b64.length).toBeGreaterThan(0)
  })
})

// ── cropAndResize ─────────────────────────────────────────────────────────────
describe('cropAndResize', () => {
  it('resolves with a JPEG data URL', async () => {
    const result = await cropAndResize('data:image/jpeg;base64,abc', 1, 800)
    expect(result).toBe('data:image/jpeg;base64,mockBase64Data==')
  })

  it('handles portrait aspect ratio (4/5)', async () => {
    const result = await cropAndResize('data:image/jpeg;base64,abc', 4 / 5, 800)
    expect(result).toContain('data:image/jpeg')
  })

  it('handles wide aspect ratio (16/9)', async () => {
    const result = await cropAndResize('data:image/jpeg;base64,abc', 16 / 9, 800)
    expect(result).toContain('data:image/jpeg')
  })
})

// ── ASPECT_RATIOS ─────────────────────────────────────────────────────────────
describe('ASPECT_RATIOS', () => {
  it('exports a 1:1 square ratio of 1', () => {
    expect(ASPECT_RATIOS['1:1']).toBe(1)
  })

  it('exports a 4:5 portrait ratio', () => {
    expect(ASPECT_RATIOS['4:5']).toBeCloseTo(0.8, 5)
  })

  it('exports a 16:9 widescreen ratio', () => {
    expect(ASPECT_RATIOS['16:9']).toBeCloseTo(16 / 9, 5)
  })

  it('contains all expected keys', () => {
    expect(Object.keys(ASPECT_RATIOS)).toEqual(['1:1', '4:5', '3:4', '2:3', '16:9'])
  })
})

// ── buildAnalysisPrompt ───────────────────────────────────────────────────────
describe('buildAnalysisPrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = buildAnalysisPrompt()
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(50)
  })

  it('asks for JSON with required fields', () => {
    const prompt = buildAnalysisPrompt()
    const requiredFields = [
      'hasFace', 'faceCount', 'lighting', 'background',
      'framing', 'expression', 'attire', 'quality',
      'issues', 'suggestions', 'bestCrops', 'overallScore',
    ]
    requiredFields.forEach(field => {
      expect(prompt).toContain(field)
    })
  })

  it('instructs returning JSON only', () => {
    const prompt = buildAnalysisPrompt()
    expect(prompt.toLowerCase()).toMatch(/json/)
  })
})

// ── buildHeadshotPrompt ───────────────────────────────────────────────────────
describe('buildHeadshotPrompt', () => {
  const baseOptions = {
    template: null,
    background: 'neutral grey seamless backdrop',
    lighting: 'Three-point studio lighting',
    attire: 'Business professional suit',
    mood: 'Confident & approachable',
    platform: 'LinkedIn Profile',
    quality: '4K photorealistic',
    extras: [],
    customNotes: '',
  }

  it('returns a non-empty string', () => {
    const prompt = buildHeadshotPrompt(baseOptions)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(50)
  })

  it('includes the platform name', () => {
    const prompt = buildHeadshotPrompt(baseOptions)
    expect(prompt).toContain('LinkedIn Profile')
  })

  it('includes the attire', () => {
    const prompt = buildHeadshotPrompt(baseOptions)
    expect(prompt).toContain('Business professional suit')
  })

  it('includes the lighting style', () => {
    const prompt = buildHeadshotPrompt(baseOptions)
    expect(prompt).toContain('Three-point studio lighting')
  })

  it('includes the mood', () => {
    const prompt = buildHeadshotPrompt(baseOptions)
    expect(prompt).toContain('Confident & approachable')
  })

  it('includes the quality setting', () => {
    const prompt = buildHeadshotPrompt(baseOptions)
    expect(prompt).toContain('4K photorealistic')
  })

  it('includes extras when provided', () => {
    const options = { ...baseOptions, extras: ['Sharp direct eye contact', 'Natural skin texture preserved'] }
    const prompt = buildHeadshotPrompt(options)
    expect(prompt).toContain('Sharp direct eye contact')
    expect(prompt).toContain('Natural skin texture preserved')
  })

  it('does NOT include empty extras section when extras array is empty', () => {
    const prompt = buildHeadshotPrompt({ ...baseOptions, extras: [] })
    expect(prompt).not.toContain('Emphasize:')
  })

  it('includes custom notes when provided', () => {
    const options = { ...baseOptions, customNotes: 'Short curly red hair' }
    const prompt = buildHeadshotPrompt(options)
    expect(prompt).toContain('Short curly red hair')
  })

  it('does NOT include notes section when customNotes is empty', () => {
    const prompt = buildHeadshotPrompt({ ...baseOptions, customNotes: '' })
    expect(prompt).not.toContain('Additional notes:')
  })

  it('includes template name and description when a template is given', () => {
    const options = {
      ...baseOptions,
      template: { name: 'Corporate Executive', description: 'Authoritative & polished' },
    }
    const prompt = buildHeadshotPrompt(options)
    expect(prompt).toContain('Corporate Executive')
    expect(prompt).toContain('Authoritative & polished')
  })

  it('falls back gracefully when optional fields are undefined', () => {
    const minimal = { extras: [], customNotes: '' }
    const prompt = buildHeadshotPrompt(minimal)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(20)
  })

  it('always ends with professional quality assurance text', () => {
    const prompt = buildHeadshotPrompt(baseOptions)
    expect(prompt).toContain('No AI artifacts')
    expect(prompt).toContain('Professional commercial photography')
  })
})
