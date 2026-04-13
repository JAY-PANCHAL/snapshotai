import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePhotoAnalysis, usePromptGeneration } from '../utils/claudeApi'

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockAnalysis = {
  hasFace: true, faceCount: 1, lighting: 'studio', background: 'plain',
  framing: 'chest up', expression: 'confident', attire: 'formal',
  quality: 'excellent', issues: [], suggestions: ['Good posture'],
  bestCrops: ['1:1 square'], overallScore: 9,
}

function mockFetchOk(payload) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(payload),
  })
}

function mockFetchError(status = 500, message = 'Internal Server Error') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: { message } }),
  })
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))
}

// ── usePhotoAnalysis ──────────────────────────────────────────────────────────
describe('usePhotoAnalysis', () => {
  afterEach(() => vi.restoreAllMocks())

  it('starts with null analysis and loading=false', () => {
    const { result } = renderHook(() => usePhotoAnalysis())
    expect(result.current.analysis).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets loading=true while request is in flight', async () => {
    let resolveFetch
    global.fetch = vi.fn().mockReturnValue(
      new Promise(resolve => { resolveFetch = resolve })
    )
    const { result } = renderHook(() => usePhotoAnalysis())

    act(() => { result.current.analyzePhoto('base64data', 'image/jpeg') })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveFetch({
        ok: true,
        json: () => Promise.resolve({ content: [{ type: 'text', text: JSON.stringify(mockAnalysis) }] }),
      })
    })
    expect(result.current.loading).toBe(false)
  })

  it('parses and stores analysis on success', async () => {
    mockFetchOk({ content: [{ type: 'text', text: JSON.stringify(mockAnalysis) }] })
    const { result } = renderHook(() => usePhotoAnalysis())

    await act(async () => {
      await result.current.analyzePhoto('base64data', 'image/jpeg')
    })

    expect(result.current.analysis).toEqual(mockAnalysis)
    expect(result.current.error).toBeNull()
  })

  it('returns parsed analysis from analyzePhoto call', async () => {
    mockFetchOk({ content: [{ type: 'text', text: JSON.stringify(mockAnalysis) }] })
    const { result } = renderHook(() => usePhotoAnalysis())

    let returned
    await act(async () => {
      returned = await result.current.analyzePhoto('base64data', 'image/jpeg')
    })
    expect(returned).toEqual(mockAnalysis)
  })

  it('strips markdown code fences from API response', async () => {
    const withFences = `\`\`\`json\n${JSON.stringify(mockAnalysis)}\n\`\`\``
    mockFetchOk({ content: [{ type: 'text', text: withFences }] })
    const { result } = renderHook(() => usePhotoAnalysis())

    await act(async () => {
      await result.current.analyzePhoto('base64data', 'image/jpeg')
    })
    expect(result.current.analysis).toEqual(mockAnalysis)
  })

  it('sets error when API returns non-ok status', async () => {
    mockFetchError(401, 'Unauthorized')
    const { result } = renderHook(() => usePhotoAnalysis())

    await act(async () => {
      await result.current.analyzePhoto('bad-key', 'image/jpeg')
    })

    expect(result.current.analysis).toBeNull()
    expect(result.current.error).toBeTruthy()
    expect(result.current.loading).toBe(false)
  })

  it('returns null when API errors', async () => {
    mockFetchError(500)
    const { result } = renderHook(() => usePhotoAnalysis())

    let returned
    await act(async () => {
      returned = await result.current.analyzePhoto('x', 'image/jpeg')
    })
    expect(returned).toBeNull()
  })

  it('handles network-level failures gracefully', async () => {
    mockFetchNetworkError()
    const { result } = renderHook(() => usePhotoAnalysis())

    await act(async () => {
      await result.current.analyzePhoto('x', 'image/jpeg')
    })
    expect(result.current.error).toBeTruthy()
    expect(result.current.loading).toBe(false)
  })

  it('clears previous analysis on a new call', async () => {
    mockFetchOk({ content: [{ type: 'text', text: JSON.stringify(mockAnalysis) }] })
    const { result } = renderHook(() => usePhotoAnalysis())

    await act(async () => { await result.current.analyzePhoto('x', 'image/jpeg') })
    expect(result.current.analysis).not.toBeNull()

    // Start another call — analysis should immediately clear
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})) // never resolves
    act(() => { result.current.analyzePhoto('y', 'image/jpeg') })
    expect(result.current.analysis).toBeNull()
  })
})

// ── usePromptGeneration ───────────────────────────────────────────────────────
describe('usePromptGeneration', () => {
  afterEach(() => vi.restoreAllMocks())

  it('starts with empty generatedPrompt', () => {
    const { result } = renderHook(() => usePromptGeneration())
    expect(result.current.generatedPrompt).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns enhanced prompt text on success', async () => {
    const enhanced = 'Ultra-detailed enhanced headshot prompt for LinkedIn'
    mockFetchOk({ content: [{ type: 'text', text: enhanced }] })
    const { result } = renderHook(() => usePromptGeneration())

    let returned
    await act(async () => {
      returned = await result.current.generateEnhancedPrompt('basic prompt')
    })
    expect(returned).toBe(enhanced)
    expect(result.current.generatedPrompt).toBe(enhanced)
  })

  it('stores enhanced prompt in state', async () => {
    const enhanced = 'Enhanced prompt here'
    mockFetchOk({ content: [{ type: 'text', text: enhanced }] })
    const { result } = renderHook(() => usePromptGeneration())

    await act(async () => {
      await result.current.generateEnhancedPrompt('original prompt')
    })
    expect(result.current.generatedPrompt).toBe(enhanced)
  })

  it('falls back to original prompt on API error', async () => {
    mockFetchError(500)
    const { result } = renderHook(() => usePromptGeneration())

    let returned
    await act(async () => {
      returned = await result.current.generateEnhancedPrompt('original prompt')
    })
    expect(returned).toBe('original prompt')
  })

  it('sends analysis context when provided', async () => {
    mockFetchOk({ content: [{ type: 'text', text: 'enhanced' }] })
    const { result } = renderHook(() => usePromptGeneration())
    const analysis = { overallScore: 8, lighting: 'studio' }

    await act(async () => {
      await result.current.generateEnhancedPrompt('prompt', analysis)
    })

    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(JSON.stringify(body)).toContain('overallScore')
  })

  it('sets loading=true during the call', async () => {
    let resolve
    global.fetch = vi.fn().mockReturnValue(new Promise(r => { resolve = r }))
    const { result } = renderHook(() => usePromptGeneration())

    act(() => { result.current.generateEnhancedPrompt('prompt') })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolve({ ok: true, json: () => Promise.resolve({ content: [{ type: 'text', text: 'done' }] }) })
    })
    expect(result.current.loading).toBe(false)
  })

  it('trims whitespace from the returned prompt', async () => {
    mockFetchOk({ content: [{ type: 'text', text: '  padded prompt  \n' }] })
    const { result } = renderHook(() => usePromptGeneration())

    let returned
    await act(async () => { returned = await result.current.generateEnhancedPrompt('x') })
    expect(returned).toBe('padded prompt')
  })
})
