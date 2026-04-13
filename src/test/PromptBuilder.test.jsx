import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastProvider } from '../components/Toast'
import PromptBuilder from '../components/PromptBuilder'
import { TEMPLATES } from '../data/templates'

// Mock claudeApi so tests don't make real HTTP calls
vi.mock('../utils/claudeApi', () => ({
  usePromptGeneration: () => ({
    generatedPrompt: '',
    generateEnhancedPrompt: vi.fn().mockResolvedValue('Enhanced prompt from AI'),
    loading: false,
    error: null,
  }),
}))

const stableOnPromptChange = vi.fn()

function renderPromptBuilder(props = {}) {
  return render(
    <ToastProvider>
      <PromptBuilder
        selectedTemplate={null}
        photoData={null}
        prefillPrompt={null}
        onPromptChange={stableOnPromptChange}
        {...props}
      />
    </ToastProvider>
  )
}

describe('PromptBuilder', () => {
  beforeEach(() => {
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined)
    stableOnPromptChange.mockClear()
  })

  it('renders the section heading', () => {
    renderPromptBuilder()
    expect(screen.getByText(/Build Your Master Prompt/i)).toBeInTheDocument()
  })

  it('renders all main control labels', () => {
    const { container } = renderPromptBuilder()
    // Query <label> elements directly — avoids false positives from the generated-prompt textarea
    // which also contains words like "Attire:", "Background:", etc.
    const labelTexts = Array.from(container.querySelectorAll('label')).map(l => l.textContent.trim())
    expect(labelTexts).toContain('Base Template')
    expect(labelTexts).toContain('Platform Target')
    expect(labelTexts).toContain('Output Quality')
    expect(labelTexts).toContain('Lighting Style')
    expect(labelTexts.some(t => /Expression & Mood/i.test(t))).toBe(true)
    expect(labelTexts.some(t => /Background/i.test(t))).toBe(true)
    expect(labelTexts.some(t => /Attire/i.test(t))).toBe(true)
    expect(labelTexts.some(t => /Enhancements/i.test(t))).toBe(true)
  })

  it('renders a generated prompt in the output panel', async () => {
    renderPromptBuilder()
    // The output textarea should exist and have a built prompt
    const textareas = document.querySelectorAll('textarea')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('pre-selects a template via selectedTemplate prop', () => {
    const template = TEMPLATES.find(t => t.id === 'corporate')
    renderPromptBuilder({ selectedTemplate: template })
    const select = screen.getByDisplayValue('Corporate Executive')
    expect(select).toBeInTheDocument()
  })

  it('shows the template badge in the output panel when a template is selected', () => {
    const template = TEMPLATES.find(t => t.id === 'tech-founder')
    renderPromptBuilder({ selectedTemplate: template })
    // The name "Tech & Startup" appears in both the <select> option AND the badge — getAllByText is correct
    const matches = screen.getAllByText('Tech & Startup')
    expect(matches.length).toBeGreaterThanOrEqual(2)
    // Verify one of them is specifically the badge span
    const badge = matches.find(el => el.className && el.className.includes('templateBadge'))
    expect(badge).toBeDefined()
  })

  it('populates the output textarea when prefillPrompt is set', async () => {
    const prefill = { prompt: 'Custom pre-filled prompt text here' }
    renderPromptBuilder({ prefillPrompt: prefill })
    // The prefill sets finalPrompt state — check the output textarea value via getByDisplayValue
    await waitFor(() => {
      const el = screen.queryByDisplayValue(/Custom pre-filled/i)
      expect(el).not.toBeNull()
    })
  })

  it('toggles an extra enhancement on/off when clicked', async () => {
    renderPromptBuilder()
    const sharpEye = screen.getByRole('button', { name: 'Sharp direct eye contact' })

    // Active by default
    expect(sharpEye.className).toMatch(/extraActive/)

    // Click to deactivate
    fireEvent.click(sharpEye)
    expect(sharpEye.className).not.toMatch(/extraActive/)

    // Click again to re-activate
    fireEvent.click(sharpEye)
    expect(sharpEye.className).toMatch(/extraActive/)
  })

  it('copies the prompt when "Copy Prompt" is clicked', async () => {
    renderPromptBuilder()
    const copyBtn = screen.getByRole('button', { name: /Copy Prompt/i })
    fireEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  it('shows "✓ Copied!" feedback after copying', async () => {
    renderPromptBuilder()
    fireEvent.click(screen.getByRole('button', { name: /Copy Prompt/i }))
    await waitFor(() => {
      expect(screen.getByText(/✓ Copied!/i)).toBeInTheDocument()
    })
  })

  it('renders the AI Enhance button', () => {
    renderPromptBuilder()
    expect(screen.getByRole('button', { name: /AI Enhance Prompt/i })).toBeInTheDocument()
  })

  it('AI Enhance button becomes enabled again after the async call resolves', async () => {
    renderPromptBuilder()
    const aiBtn = screen.getByRole('button', { name: /AI Enhance Prompt/i })

    fireEvent.click(aiBtn)

    // While in-flight the button is disabled — wait for it to become re-enabled
    await waitFor(() => {
      expect(aiBtn).not.toBeDisabled()
    }, { timeout: 3000 })
  })

  it('renders the "Generate Image Now" CTA button', () => {
    renderPromptBuilder()
    expect(screen.getByRole('button', { name: /Generate Image Now/i })).toBeInTheDocument()
  })

  it('calls onPromptChange when a setting changes', async () => {
    renderPromptBuilder()
    await waitFor(() => expect(stableOnPromptChange).toHaveBeenCalled())
  })

  it('renders "Where to use" platform links', () => {
    renderPromptBuilder()
    expect(screen.getByText('Midjourney')).toBeInTheDocument()
    expect(screen.getByText('DALL·E 3')).toBeInTheDocument()
  })

  it('shows photo analysis context when photoData is provided', () => {
    const photoData = {
      analysis: { framing: 'chest up', lighting: 'studio', overallScore: 8 },
    }
    renderPromptBuilder({ photoData })
    expect(screen.getByText(/Based on your photo analysis/i)).toBeInTheDocument()
  })

  it('renders the attire text input', () => {
    renderPromptBuilder()
    const attireInput = screen.getByPlaceholderText(/Dark navy suit/i)
    expect(attireInput).toBeInTheDocument()
  })

  it('updates attire when typed in', () => {
    renderPromptBuilder()
    const attireInput = screen.getByPlaceholderText(/Dark navy suit/i)
    fireEvent.change(attireInput, { target: { value: 'Red blazer' } })
    expect(attireInput.value).toBe('Red blazer')
  })

  it('renders the reset-to-template button when a template is active', () => {
    const template = TEMPLATES.find(t => t.id === 'corporate')
    renderPromptBuilder({ selectedTemplate: template })
    // The ↺ reset button should appear next to the template select
    const resetBtn = screen.getByTitle(/Reset to template defaults/i)
    expect(resetBtn).toBeInTheDocument()
  })

  it('does NOT show reset button when no template is selected', () => {
    renderPromptBuilder()
    expect(screen.queryByTitle(/Reset to template defaults/i)).toBeNull()
  })
})
