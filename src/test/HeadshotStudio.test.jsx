import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastProvider } from '../components/Toast'
import HeadshotStudio from '../components/HeadshotStudio'
import { TEMPLATES } from '../data/templates'

// Stub fetch so tests don't make real HTTP calls
const mockBlob = new Blob(['img'], { type: 'image/jpeg' })
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  headers: { get: () => 'image/jpeg' },
  blob: () => Promise.resolve(mockBlob),
})

// Stub createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/test-img')

function renderStudio(props = {}) {
  return render(
    <ToastProvider>
      <HeadshotStudio
        selectedTemplate={null}
        photoData={null}
        {...props}
      />
    </ToastProvider>
  )
}

describe('HeadshotStudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/jpeg' },
      blob: () => Promise.resolve(mockBlob),
    })
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/test-img')
  })

  /* ── rendering ── */

  it('renders the section heading', () => {
    renderStudio()
    expect(screen.getByText(/Create Your AI Headshot/i)).toBeInTheDocument()
  })

  it('renders the step label', () => {
    renderStudio()
    expect(screen.getByText(/Step 3/i)).toBeInTheDocument()
  })

  it('renders the generate button', () => {
    renderStudio()
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument()
  })

  it('generate button text is correct when idle', () => {
    renderStudio()
    expect(screen.getByTestId('generate-btn')).toHaveTextContent(/Generate My Headshots/i)
  })

  it('renders platform chips', () => {
    // Use getAllByRole — "LinkedIn" also appears in template card names and size hints
    renderStudio()
    const allBtns = screen.getAllByRole('button')
    const linkedInChip = allBtns.find(b => b.className?.includes('chip') && b.textContent?.includes('LinkedIn'))
    expect(linkedInChip).toBeDefined()
    const resumeChip = allBtns.find(b => b.className?.includes('chip') && b.textContent?.includes('Resume'))
    expect(resumeChip).toBeDefined()
  })

  it('renders mood chips', () => {
    renderStudio()
    expect(screen.getByRole('button', { name: /Confident/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Warm Smile/i })).toBeInTheDocument()
  })

  it('renders lighting chips', () => {
    renderStudio()
    const allBtns = screen.getAllByRole('button')
    const studioChip = allBtns.find(b => b.className?.includes('chip') && b.textContent?.trim() === 'Studio')
    expect(studioChip).toBeDefined()
    const naturalChip = allBtns.find(b => b.className?.includes('chip') && b.textContent?.trim() === 'Natural')
    expect(naturalChip).toBeDefined()
  })

  it('renders AI model options', () => {
    renderStudio()
    expect(screen.getByRole('button', { name: /Hyper-Realistic/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /High Quality/i })).toBeInTheDocument()
  })

  it('renders size options', () => {
    renderStudio()
    expect(screen.getByRole('button', { name: /1:1 Square/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /4:5 Portrait/i })).toBeInTheDocument()
  })

  it('renders the attire input', () => {
    renderStudio()
    expect(screen.getByPlaceholderText(/Dark navy suit/i)).toBeInTheDocument()
  })

  it('renders empty state message when no images yet', () => {
    renderStudio()
    expect(screen.getByText(/Your AI headshots will appear here/i)).toBeInTheDocument()
  })

  it('renders the free/no-signup note', () => {
    renderStudio()
    expect(screen.getByText(/No signup/i)).toBeInTheDocument()
  })

  /* ── prompt preview toggle ── */

  it('prompt preview is hidden by default', () => {
    renderStudio()
    expect(screen.queryByText(/Ultra-realistic/i)).toBeNull()
  })

  it('shows prompt preview after clicking the toggle', () => {
    renderStudio()
    fireEvent.click(screen.getByRole('button', { name: /Preview AI prompt/i }))
    expect(screen.getByText(/Ultra-realistic/i)).toBeInTheDocument()
  })

  it('hides prompt preview again after second click', () => {
    renderStudio()
    const toggle = screen.getByRole('button', { name: /Preview AI prompt/i })
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(screen.queryByText(/Ultra-realistic/i)).toBeNull()
  })

  /* ── interaction ── */

  it('switches platform when a chip is clicked', () => {
    renderStudio()
    // Find the chip specifically (not a template card or size hint)
    const allBtns = screen.getAllByRole('button')
    const websiteChip = allBtns.find(b => b.className?.includes('chip') && b.textContent?.includes('Website'))
    expect(websiteChip).toBeDefined()
    fireEvent.click(websiteChip)
    expect(websiteChip.className).toMatch(/chipActive/)
  })

  it('switches mood when a chip is clicked', () => {
    renderStudio()
    const authoritative = screen.getByRole('button', { name: /Authoritative/i })
    fireEvent.click(authoritative)
    expect(authoritative.className).toMatch(/chipActive/)
  })

  it('switches model when a button is clicked', () => {
    renderStudio()
    const highQualBtn = screen.getByRole('button', { name: /High Quality/i })
    fireEvent.click(highQualBtn)
    expect(highQualBtn.className).toMatch(/modelActive/)
  })

  it('updates attire input value', () => {
    renderStudio()
    const input = screen.getByPlaceholderText(/Dark navy suit/i)
    fireEvent.change(input, { target: { value: 'Red blazer' } })
    expect(input.value).toBe('Red blazer')
  })

  /* ── template prop ── */

  it('pre-selects template when selectedTemplate prop is provided', () => {
    const template = TEMPLATES.find(t => t.id === 'corporate')
    renderStudio({ selectedTemplate: template })
    const btn = screen.getByRole('button', { name: /Corporate Executive/i })
    expect(btn.className).toMatch(/templateActive/)
  })

  it('shows photo context in summary bar when photoData is provided', () => {
    const photoData = {
      analysis: { framing: 'chest up', lighting: 'studio', overallScore: 8 },
    }
    renderStudio({ photoData })
    expect(screen.getByText(/Photo score: 8\/10/i)).toBeInTheDocument()
  })

  /* ── generation ── */

  it('generate button is disabled while generating', async () => {
    // Make fetch hang so we can check the disabled state
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderStudio()
    const btn = screen.getByTestId('generate-btn')
    fireEvent.click(btn)
    expect(btn).toBeDisabled()
  })

  it('shows loading text during generation', async () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderStudio()
    fireEvent.click(screen.getByTestId('generate-btn'))
    await waitFor(() => {
      // The generate button itself changes text to "Generating X headshots…"
      expect(screen.getByTestId('generate-btn').textContent).toMatch(/Generating/i)
    })
  })

  it('calls fetch with a pollinations.ai URL on generate', async () => {
    renderStudio()
    fireEvent.click(screen.getByTestId('generate-btn'))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
      const url = global.fetch.mock.calls[0][0]
      expect(url).toMatch(/pollinations\.ai|\/api\/image/)
    })
  })

  it('renders variation images after generation completes', async () => {
    renderStudio()
    fireEvent.click(screen.getByTestId('generate-btn'))
    await waitFor(() => {
      const imgs = screen.getAllByRole('img')
      expect(imgs.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('shows error message when all fetches fail', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    renderStudio()
    fireEvent.click(screen.getByTestId('generate-btn'))
    await waitFor(() => {
      expect(screen.getByText(/Generation failed/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('re-enables generate button after generation completes', async () => {
    renderStudio()
    const btn = screen.getByTestId('generate-btn')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(btn).not.toBeDisabled()
    }, { timeout: 5000 })
  })
})
