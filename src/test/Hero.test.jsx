import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Hero from '../components/Hero'

describe('Hero', () => {
  it('renders the main headline', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByText(/Transform any selfie/i)).toBeInTheDocument()
  })

  it('renders "studio-perfect" italic text in the headline', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByText(/studio-perfect/i)).toBeInTheDocument()
  })

  it('renders the subtitle description', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByText(/Upload your photo, analyze with AI/i)).toBeInTheDocument()
  })

  it('renders the AI badge', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByText(/AI-Powered Studio Quality Headshots/i)).toBeInTheDocument()
  })

  it('renders the primary CTA button', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Upload Your Photo/i })).toBeInTheDocument()
  })

  it('renders the secondary "See Sample Results" button', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByRole('button', { name: /See Sample Results/i })).toBeInTheDocument()
  })

  it('calls onGetStarted when primary CTA is clicked', () => {
    const onGetStarted = vi.fn()
    render(<Hero onGetStarted={onGetStarted} />)
    fireEvent.click(screen.getByRole('button', { name: /Upload Your Photo/i }))
    expect(onGetStarted).toHaveBeenCalledTimes(1)
  })

  it('renders all stats', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByText('18M+')).toBeInTheDocument()
    expect(screen.getByText('200K+')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders all stat labels', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByText(/Headshots Generated/i)).toBeInTheDocument()
    expect(screen.getByText(/Professionals/i)).toBeInTheDocument()
    expect(screen.getByText(/Style Templates/i)).toBeInTheDocument()
    expect(screen.getByText(/Background Options/i)).toBeInTheDocument()
    expect(screen.getByText(/Platform Presets/i)).toBeInTheDocument()
  })

  it('renders platform badges', () => {
    render(<Hero onGetStarted={vi.fn()} />)
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Upwork')).toBeInTheDocument()
    expect(screen.getByText('Fiverr')).toBeInTheDocument()
    expect(screen.getByText('Resume')).toBeInTheDocument()
  })

  it('renders a canvas element for particle animation', () => {
    const { container } = render(<Hero onGetStarted={vi.fn()} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders the hero section element', () => {
    const { container } = render(<Hero onGetStarted={vi.fn()} />)
    const section = container.querySelector('section')
    expect(section).not.toBeNull()
  })

  it('renders the animated badge dot', () => {
    const { container } = render(<Hero onGetStarted={vi.fn()} />)
    const badgeDot = container.querySelector('[class*="badgeDot"]')
    expect(badgeDot).not.toBeNull()
  })
})
