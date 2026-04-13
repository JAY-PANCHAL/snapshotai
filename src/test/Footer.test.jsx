import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

describe('Footer', () => {
  it('renders the SnapshotAI brand name', () => {
    render(<Footer />)
    // Multiple nodes contain "SnapShot" (logo span + copyright line) — getAllByText is correct here
    expect(screen.getAllByText(/SnapShot/i).length).toBeGreaterThan(0)
  })

  it('renders the tagline', () => {
    render(<Footer />)
    expect(screen.getByText(/Professional headshots powered by AI/i)).toBeInTheDocument()
  })

  it('renders the Tools section links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /Upload & Analyze/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Style Templates/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sample Prompts/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Generate Headshots/i })).toBeInTheDocument()
  })

  it('renders external AI platform links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /Midjourney/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /DALL·E 3/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /HeadshotPro/i })).toBeInTheDocument()
  })

  it('renders the platform optimise-for section', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /LinkedIn Profile/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Resume \/ CV/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Company Website/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Business Card/i })).toBeInTheDocument()
  })

  it('renders the copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(/2025 SnapShot AI/i)).toBeInTheDocument()
    expect(screen.getByText(/Mindtech Solutions/i)).toBeInTheDocument()
  })

  it('renders the privacy note', () => {
    render(<Footer />)
    expect(screen.getByText(/photos are never stored/i)).toBeInTheDocument()
  })

  it('renders Midjourney link with correct href', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /Midjourney/i })
    expect(link.getAttribute('href')).toBe('https://midjourney.com')
  })

  it('renders external links with target="_blank"', () => {
    render(<Footer />)
    const midjourney = screen.getByRole('link', { name: /Midjourney/i })
    expect(midjourney.getAttribute('target')).toBe('_blank')
  })

  it('renders external links with rel="noopener noreferrer"', () => {
    render(<Footer />)
    const midjourney = screen.getByRole('link', { name: /Midjourney/i })
    expect(midjourney.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders a footer element as the root', () => {
    const { container } = render(<Footer />)
    expect(container.querySelector('footer')).not.toBeNull()
  })

  it('renders link group headings', () => {
    render(<Footer />)
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('AI Platforms')).toBeInTheDocument()
    expect(screen.getByText('Optimize For')).toBeInTheDocument()
  })
})
