import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StepProgress from '../components/StepProgress'

// Mirror the 3-step flow defined in StepProgress.jsx
const STEPS = [
  { id: 'upload',    label: 'Upload Photo' },
  { id: 'templates', label: 'Choose Style' },
  { id: 'studio',    label: 'Generate' },
]

describe('StepProgress', () => {
  it('renders all three step labels', () => {
    render(<StepProgress activeSection="upload" onNav={vi.fn()} />)
    STEPS.forEach(step => {
      expect(screen.getByText(step.label)).toBeInTheDocument()
    })
  })

  it('marks the active step with aria-current="step"', () => {
    render(<StepProgress activeSection="studio" onNav={vi.fn()} />)
    const currentEl = screen.getByRole('button', { name: /Generate/i })
    expect(currentEl).toHaveAttribute('aria-current', 'step')
  })

  it('does not mark non-active steps with aria-current', () => {
    render(<StepProgress activeSection="upload" onNav={vi.fn()} />)
    const templateBtn = screen.getByRole('button', { name: /Choose Style/i })
    expect(templateBtn).not.toHaveAttribute('aria-current', 'step')
  })

  it('calls onNav with the correct step id on click', () => {
    const onNav = vi.fn()
    render(<StepProgress activeSection="upload" onNav={onNav} />)
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))
    expect(onNav).toHaveBeenCalledWith('studio')
  })

  it('shows checkmark icons for completed steps', () => {
    const { container } = render(<StepProgress activeSection="studio" onNav={vi.fn()} />)
    const checkmarks = container.querySelectorAll('[class*="checkmark"]')
    // Steps before "studio" (upload, templates) should show checkmarks
    expect(checkmarks.length).toBeGreaterThanOrEqual(2)
  })

  it('renders the pulse animation on the current step', () => {
    const { container } = render(<StepProgress activeSection="templates" onNav={vi.fn()} />)
    const pulse = container.querySelector('[class*="pulse"]')
    expect(pulse).not.toBeNull()
  })

  it('renders connector lines between steps', () => {
    const { container } = render(<StepProgress activeSection="upload" onNav={vi.fn()} />)
    const connectors = container.querySelectorAll('[class*="connector"]')
    // 3 steps → 2 connectors (wrapper + fill per connector)
    expect(connectors.length).toBeGreaterThan(0)
  })

  it('has accessible nav landmark', () => {
    render(<StepProgress activeSection="upload" onNav={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: /Workflow steps/i })).toBeInTheDocument()
  })
})
