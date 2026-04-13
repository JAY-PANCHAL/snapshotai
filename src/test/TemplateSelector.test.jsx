import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TemplateSelector from '../components/TemplateSelector'
import { TEMPLATES } from '../data/templates'

describe('TemplateSelector', () => {
  it('renders the section heading', () => {
    render(<TemplateSelector selected={null} onSelect={vi.fn()} />)
    expect(screen.getByText(/Choose Your Style Template/i)).toBeInTheDocument()
  })

  it('renders all template cards by default', () => {
    render(<TemplateSelector selected={null} onSelect={vi.fn()} />)
    TEMPLATES.forEach(t => {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    })
  })

  it('renders category filter buttons', () => {
    render(<TemplateSelector selected={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })

  it('filters templates when a category is selected', () => {
    render(<TemplateSelector selected={null} onSelect={vi.fn()} />)
    const businessBtn = screen.getByRole('button', { name: 'Business' })
    fireEvent.click(businessBtn)
    // Only "Corporate Executive" is in the Business category
    expect(screen.getByText('Corporate Executive')).toBeInTheDocument()
    // A non-Business template should not appear
    expect(screen.queryByText('Creative Professional')).toBeNull()
  })

  it('shows all templates again when "All" is clicked after filtering', () => {
    render(<TemplateSelector selected={null} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Business' }))
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    TEMPLATES.forEach(t => {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    })
  })

  it('calls onSelect with the template when a card is clicked', () => {
    const onSelect = vi.fn()
    render(<TemplateSelector selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Corporate Executive'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].id).toBe('corporate')
  })

  it('shows "Selected" badge on the currently selected template', () => {
    const selected = TEMPLATES.find(t => t.id === 'corporate')
    render(<TemplateSelector selected={selected} onSelect={vi.fn()} />)
    expect(screen.getByText('✓ Selected')).toBeInTheDocument()
  })

  it('shows a "Continue to Prompt Builder" button when a template is selected', () => {
    const selected = TEMPLATES[0]
    render(<TemplateSelector selected={selected} onSelect={vi.fn()} />)
    expect(screen.getByText(/Continue to Prompt Builder/i)).toBeInTheDocument()
  })

  it('does NOT show the continue button when nothing is selected', () => {
    render(<TemplateSelector selected={null} onSelect={vi.fn()} />)
    expect(screen.queryByText(/Continue to Prompt Builder/i)).toBeNull()
  })

  it('displays the selected template name in the info bar', () => {
    const selected = TEMPLATES.find(t => t.id === 'linkedin-pro')
    render(<TemplateSelector selected={selected} onSelect={vi.fn()} />)
    expect(screen.getByText(`${selected.name} selected`)).toBeInTheDocument()
  })

  it('shows the template description in the card', () => {
    render(<TemplateSelector selected={null} onSelect={vi.fn()} />)
    const corp = TEMPLATES.find(t => t.id === 'corporate')
    expect(screen.getByText(corp.description)).toBeInTheDocument()
  })
})
