import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastProvider } from '../components/Toast'
import SampleGallery from '../components/SampleGallery'
import { SAMPLE_PROMPTS } from '../data/templates'

function renderWithToast(ui) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('SampleGallery', () => {
  beforeEach(() => {
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined)
  })

  it('renders the section heading', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    expect(screen.getByText(/See what's possible/i)).toBeInTheDocument()
  })

  it('renders all sample prompt cards', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    SAMPLE_PROMPTS.forEach(s => {
      expect(screen.getByText(s.title)).toBeInTheDocument()
    })
  })

  it('renders category tags for each sample', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    const uniqueCategories = [...new Set(SAMPLE_PROMPTS.map(s => s.category))]
    uniqueCategories.forEach(cat => {
      expect(screen.getAllByText(cat).length).toBeGreaterThan(0)
    })
  })

  it('shows truncated prompt by default (not full)', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    const fullPrompt = SAMPLE_PROMPTS[0].prompt
    // The truncated version is first 100 chars + '...'
    expect(screen.queryByText(fullPrompt)).toBeNull()
  })

  it('expands the prompt when "Show full prompt" is clicked', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    const expandBtns = screen.getAllByRole('button', { name: /Show full prompt/i })
    fireEvent.click(expandBtns[0])
    // Full prompt should now be visible
    expect(screen.getByText(SAMPLE_PROMPTS[0].prompt)).toBeInTheDocument()
  })

  it('collapses the prompt when "Show less" is clicked', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    const expandBtns = screen.getAllByRole('button', { name: /Show full prompt/i })
    fireEvent.click(expandBtns[0])
    fireEvent.click(screen.getByRole('button', { name: /Show less/i }))
    expect(screen.queryByText(SAMPLE_PROMPTS[0].prompt)).toBeNull()
  })

  it('copies prompt to clipboard when "Copy Prompt" is clicked', async () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    const copyBtns = screen.getAllByRole('button', { name: /Copy Prompt/i })
    fireEvent.click(copyBtns[0])
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(SAMPLE_PROMPTS[0].prompt)
  })

  it('shows "✓ Copied!" feedback after copying', async () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    const copyBtns = screen.getAllByRole('button', { name: /Copy Prompt/i })
    fireEvent.click(copyBtns[0])
    await waitFor(() => {
      expect(screen.getAllByText(/✓ Copied!/i).length).toBeGreaterThan(0)
    })
  })

  it('calls onUsePrompt with the sample when "Use in Builder" is clicked', () => {
    const onUsePrompt = vi.fn()
    renderWithToast(<SampleGallery onUsePrompt={onUsePrompt} />)
    const useBtns = screen.getAllByRole('button', { name: /Use in Builder/i })
    fireEvent.click(useBtns[0])
    expect(onUsePrompt).toHaveBeenCalledWith(SAMPLE_PROMPTS[0])
  })

  it('renders photo tips for each sample', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    SAMPLE_PROMPTS[0].tips.forEach(tip => {
      expect(screen.getByText(tip)).toBeInTheDocument()
    })
  })

  it('renders style tags on each card', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    SAMPLE_PROMPTS[0].style_tags.forEach(tag => {
      expect(screen.getAllByText(tag).length).toBeGreaterThan(0)
    })
  })

  it('renders the disclaimer note', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    expect(screen.getByText(/portraits above are AI-generated/i)).toBeInTheDocument()
  })

  it('shows the platform badge on each card', () => {
    renderWithToast(<SampleGallery onUsePrompt={vi.fn()} />)
    expect(screen.getByText(SAMPLE_PROMPTS[0].platform)).toBeInTheDocument()
  })
})
