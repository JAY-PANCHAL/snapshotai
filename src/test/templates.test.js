import { describe, it, expect } from 'vitest'
import { TEMPLATES, BACKGROUNDS, SAMPLE_PROMPTS, PLATFORMS } from '../data/templates'

// ── TEMPLATES ─────────────────────────────────────────────────────────────────
describe('TEMPLATES data', () => {
  it('exports an array with at least 8 templates', () => {
    expect(Array.isArray(TEMPLATES)).toBe(true)
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(8)
  })

  it('every template has a unique id', () => {
    const ids = TEMPLATES.map(t => t.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(TEMPLATES.length)
  })

  it('every template has required fields', () => {
    const required = ['id', 'name', 'category', 'description', 'lighting', 'attire', 'mood', 'tags', 'prompt', 'gradient', 'accent']
    TEMPLATES.forEach(t => {
      required.forEach(field => {
        expect(t[field], `template "${t.id}" is missing field "${field}"`).toBeDefined()
      })
    })
  })

  it('every template prompt is a non-empty string', () => {
    TEMPLATES.forEach(t => {
      expect(typeof t.prompt).toBe('string')
      expect(t.prompt.trim().length).toBeGreaterThan(20)
    })
  })

  it('every template has a non-empty tags array', () => {
    TEMPLATES.forEach(t => {
      expect(Array.isArray(t.tags)).toBe(true)
      expect(t.tags.length).toBeGreaterThan(0)
    })
  })

  it('every template has a valid accent colour (hex format)', () => {
    TEMPLATES.forEach(t => {
      expect(t.accent).toMatch(/^#[0-9a-fA-F]{3,8}$/)
    })
  })

  it('includes a "corporate" template', () => {
    expect(TEMPLATES.find(t => t.id === 'corporate')).toBeDefined()
  })

  it('includes a "tech-founder" template', () => {
    expect(TEMPLATES.find(t => t.id === 'tech-founder')).toBeDefined()
  })

  it('includes a "medical" template', () => {
    expect(TEMPLATES.find(t => t.id === 'medical')).toBeDefined()
  })

  it('includes a "legal" template', () => {
    expect(TEMPLATES.find(t => t.id === 'legal')).toBeDefined()
  })

  it('each template has a gradient string', () => {
    TEMPLATES.forEach(t => {
      expect(typeof t.gradient).toBe('string')
      expect(t.gradient).toContain('gradient')
    })
  })

  it('no template has an empty category', () => {
    TEMPLATES.forEach(t => {
      expect(t.category.trim().length).toBeGreaterThan(0)
    })
  })
})

// ── BACKGROUNDS ───────────────────────────────────────────────────────────────
describe('BACKGROUNDS data', () => {
  it('exports an array with at least 10 backgrounds', () => {
    expect(Array.isArray(BACKGROUNDS)).toBe(true)
    expect(BACKGROUNDS.length).toBeGreaterThanOrEqual(10)
  })

  it('every background has id, label, and description', () => {
    BACKGROUNDS.forEach(bg => {
      expect(bg.id,          `bg missing id`).toBeDefined()
      expect(bg.label,       `bg "${bg.id}" missing label`).toBeDefined()
      expect(bg.description, `bg "${bg.id}" missing description`).toBeDefined()
    })
  })

  it('every background has at least a color or gradient', () => {
    BACKGROUNDS.forEach(bg => {
      const hasColor = bg.color !== undefined || bg.gradient !== undefined
      expect(hasColor, `bg "${bg.id}" has no color or gradient`).toBe(true)
    })
  })

  it('every background has a unique id', () => {
    const ids = BACKGROUNDS.map(b => b.id)
    expect(new Set(ids).size).toBe(BACKGROUNDS.length)
  })

  it('includes a transparent/PNG background option', () => {
    const transparent = BACKGROUNDS.find(b => b.id === 'transparent')
    expect(transparent).toBeDefined()
  })

  it('includes a neutral grey background', () => {
    const grey = BACKGROUNDS.find(b => b.id === 'grey')
    expect(grey).toBeDefined()
  })
})

// ── SAMPLE_PROMPTS ────────────────────────────────────────────────────────────
describe('SAMPLE_PROMPTS data', () => {
  it('exports an array with at least 4 sample prompts', () => {
    expect(Array.isArray(SAMPLE_PROMPTS)).toBe(true)
    expect(SAMPLE_PROMPTS.length).toBeGreaterThanOrEqual(4)
  })

  it('every sample has required fields', () => {
    const required = ['id', 'title', 'category', 'platform', 'preview_bg', 'prompt', 'tips', 'quality', 'style_tags']
    SAMPLE_PROMPTS.forEach(s => {
      required.forEach(field => {
        expect(s[field], `sample "${s.title}" missing "${field}"`).toBeDefined()
      })
    })
  })

  it('every sample id is unique', () => {
    const ids = SAMPLE_PROMPTS.map(s => s.id)
    expect(new Set(ids).size).toBe(SAMPLE_PROMPTS.length)
  })

  it('every sample has at least 2 photo tips', () => {
    SAMPLE_PROMPTS.forEach(s => {
      expect(Array.isArray(s.tips)).toBe(true)
      expect(s.tips.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('every sample has at least 1 style tag', () => {
    SAMPLE_PROMPTS.forEach(s => {
      expect(Array.isArray(s.style_tags)).toBe(true)
      expect(s.style_tags.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('every sample prompt is at least 50 characters long', () => {
    SAMPLE_PROMPTS.forEach(s => {
      expect(s.prompt.length).toBeGreaterThanOrEqual(50)
    })
  })

  it('every sample has a valid quality string (contains × or ·)', () => {
    SAMPLE_PROMPTS.forEach(s => {
      expect(s.quality).toMatch(/[·×]/)
    })
  })

  it('includes a LinkedIn sample', () => {
    const found = SAMPLE_PROMPTS.find(s => s.title.toLowerCase().includes('linkedin'))
    expect(found).toBeDefined()
  })
})

// ── PLATFORMS ─────────────────────────────────────────────────────────────────
describe('PLATFORMS data', () => {
  it('exports an array', () => {
    expect(Array.isArray(PLATFORMS)).toBe(true)
    expect(PLATFORMS.length).toBeGreaterThan(0)
  })

  it('every platform has name, size, aspect, and notes', () => {
    PLATFORMS.forEach(p => {
      expect(p.name,   `platform missing name`).toBeDefined()
      expect(p.size,   `"${p.name}" missing size`).toBeDefined()
      expect(p.aspect, `"${p.name}" missing aspect`).toBeDefined()
      expect(p.notes,  `"${p.name}" missing notes`).toBeDefined()
    })
  })

  it('includes LinkedIn as a platform', () => {
    expect(PLATFORMS.find(p => p.name === 'LinkedIn')).toBeDefined()
  })

  it('includes Resume / CV as a platform', () => {
    expect(PLATFORMS.find(p => p.name === 'Resume / CV')).toBeDefined()
  })
})
