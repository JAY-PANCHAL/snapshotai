import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ToastProvider } from '../components/Toast'
import ImageGenerator from '../components/ImageGenerator'

function renderGenerator(prompt = '') {
  return render(
    <ToastProvider>
      <ImageGenerator prompt={prompt} />
    </ToastProvider>
  )
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
function mockSuccessfulFetch() {
  const blob = new Blob(['fakejpegdata'], { type: 'image/jpeg' })
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(blob),
  })
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
}

function mockFailedFetch() {
  global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ImageGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => { vi.restoreAllMocks() })

  // ── Rendering ──
  it('renders the section heading', () => {
    renderGenerator()
    expect(screen.getByText(/Generate Your Headshot/i)).toBeInTheDocument()
  })

  it('renders the prompt textarea', () => {
    renderGenerator('test prompt')
    const textarea = screen.getByPlaceholderText(/Your prompt will appear here/i)
    expect(textarea).toBeInTheDocument()
    expect(textarea.value).toBe('test prompt')
  })

  it('renders all three AI model buttons', () => {
    renderGenerator()
    expect(screen.getByText('Flux')).toBeInTheDocument()
    expect(screen.getByText('Flux Realism')).toBeInTheDocument()
    expect(screen.getByText('Turbo')).toBeInTheDocument()
  })

  it('renders all four size option buttons', () => {
    renderGenerator()
    expect(screen.getByText('1:1 Square')).toBeInTheDocument()
    expect(screen.getByText('4:5 Portrait')).toBeInTheDocument()
    expect(screen.getByText('3:4 Classic')).toBeInTheDocument()
    expect(screen.getByText('2:3 Tall')).toBeInTheDocument()
  })

  it('renders the empty state when no images have been generated', () => {
    renderGenerator()
    expect(screen.getByText(/Your headshots will appear here/i)).toBeInTheDocument()
  })

  it('renders the free/no-signup note', () => {
    renderGenerator()
    expect(screen.getByText(/Free.*No signup/i)).toBeInTheDocument()
  })

  // ── Model selection ──
  it('highlights "Flux Realism" as the default selected model', () => {
    const { container } = renderGenerator()
    const activeModel = container.querySelector('[class*="modelActive"]')
    expect(activeModel?.textContent).toContain('Flux Realism')
  })

  it('changes the active model when a different model is clicked', () => {
    const { container } = renderGenerator()
    const turboBtn = screen.getAllByRole('button').find(b => b.textContent.includes('Turbo'))
    fireEvent.click(turboBtn)
    const activeModel = container.querySelector('[class*="modelActive"]')
    expect(activeModel?.textContent).toContain('Turbo')
  })

  // ── Size selection ──
  it('highlights "1:1 Square" as the default selected size', () => {
    const { container } = renderGenerator()
    const activeSize = container.querySelector('[class*="sizeActive"]')
    expect(activeSize?.textContent).toContain('1:1 Square')
  })

  it('changes the active size when a different size is clicked', () => {
    const { container } = renderGenerator()
    fireEvent.click(screen.getByText('4:5 Portrait'))
    const activeSize = container.querySelector('[class*="sizeActive"]')
    expect(activeSize?.textContent).toContain('4:5 Portrait')
  })

  // ── Prompt interaction ──
  it('shows error when generate is clicked with empty prompt', async () => {
    renderGenerator('')
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))
    await waitFor(() => {
      expect(screen.getByText(/Please enter or generate a prompt first/i)).toBeInTheDocument()
    })
  })

  it('accepts typed prompt changes', () => {
    renderGenerator()
    const textarea = screen.getByPlaceholderText(/Your prompt will appear here/i)
    fireEvent.change(textarea, { target: { value: 'New typed prompt' } })
    expect(textarea.value).toBe('New typed prompt')
  })

  it('copies the prompt to clipboard when Copy button is clicked', async () => {
    renderGenerator('my test prompt')
    const copyBtn = screen.getByRole('button', { name: /Copy/i })
    fireEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('my test prompt')
  })

  it('shows char count in prompt hint', () => {
    renderGenerator('hello')
    expect(screen.getByText(/5 chars/i)).toBeInTheDocument()
  })

  // ── Generation flow ──
  it('shows loading state during generation', async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})) // never resolves
    renderGenerator('valid prompt')
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))
    await waitFor(() => {
      expect(screen.getByText(/Generating 4 variations/i)).toBeInTheDocument()
    })
  })

  it('disables the generate button while generating', async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    renderGenerator('valid prompt')
    const genBtn = screen.getByRole('button', { name: /Generate/i })
    fireEvent.click(genBtn)
    await waitFor(() => expect(genBtn).toBeDisabled())
  })

  it('renders variation cards after successful generation', async () => {
    mockSuccessfulFetch()
    renderGenerator('valid prompt')

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Generate/i }))
    })

    await waitFor(() => {
      const images = screen.getAllByAltText(/Variation/i)
      expect(images.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('shows retry button on failed variation', async () => {
    mockFailedFetch()
    renderGenerator('valid prompt')

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Generate/i }))
    })

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Retry/i }).length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  // ── URL update on prop change ──
  it('updates prompt textarea when initialPrompt prop changes', async () => {
    const { rerender } = render(
      <ToastProvider><ImageGenerator prompt="first prompt" /></ToastProvider>
    )
    expect(screen.getByDisplayValue('first prompt')).toBeInTheDocument()

    rerender(
      <ToastProvider><ImageGenerator prompt="second prompt" /></ToastProvider>
    )
    await waitFor(() => {
      expect(screen.getByDisplayValue('second prompt')).toBeInTheDocument()
    })
  })
})
