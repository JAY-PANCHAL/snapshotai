import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '../components/Navbar'

const LINKS = [
  { label: 'Upload & Analyze', id: 'upload' },
  { label: 'Style Templates',  id: 'templates' },
  { label: 'Sample Prompts',   id: 'samples' },
  { label: '✦ Generate Headshots', id: 'studio' },
]

describe('Navbar', () => {
  it('renders the brand logo', () => {
    render(<Navbar activeSection="home" onNav={vi.fn()} />)
    expect(screen.getByText(/SnapShot/)).toBeInTheDocument()
    expect(screen.getByText(/AI/)).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Navbar activeSection="home" onNav={vi.fn()} />)
    LINKS.forEach(({ label }) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    })
  })

  it('renders the CTA button', () => {
    render(<Navbar activeSection="home" onNav={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Get Started Free/i })).toBeInTheDocument()
  })

  it('calls onNav with correct id when a link is clicked', () => {
    const onNav = vi.fn()
    render(<Navbar activeSection="home" onNav={onNav} />)
    fireEvent.click(screen.getByRole('button', { name: 'Style Templates' }))
    expect(onNav).toHaveBeenCalledWith('templates')
  })

  it('calls onNav with "studio" when generate link is clicked', () => {
    const onNav = vi.fn()
    render(<Navbar activeSection="home" onNav={onNav} />)
    fireEvent.click(screen.getByRole('button', { name: /Generate Headshots/i }))
    expect(onNav).toHaveBeenCalledWith('studio')
  })

  it('calls onNav with "upload" when CTA is clicked', () => {
    const onNav = vi.fn()
    render(<Navbar activeSection="home" onNav={onNav} />)
    fireEvent.click(screen.getByRole('button', { name: /Get Started Free/i }))
    expect(onNav).toHaveBeenCalledWith('upload')
  })

  it('applies active styling to the active section link', () => {
    const { container } = render(<Navbar activeSection="templates" onNav={vi.fn()} />)
    const active = container.querySelector('[class*="active"]')
    expect(active).not.toBeNull()
    expect(active.textContent).toContain('Templates')
  })

  it('opens mobile menu on hamburger click', () => {
    const { container } = render(<Navbar activeSection="home" onNav={vi.fn()} />)
    const hamburger = container.querySelector('button[class*="hamburger"]')
    if (!hamburger) return
    fireEvent.click(hamburger)
    const linksEl = container.querySelector('[class*="links"]')
    expect(linksEl?.className).toContain('open')
  })

  it('closes mobile menu after a nav link is clicked', () => {
    const onNav = vi.fn()
    const { container } = render(<Navbar activeSection="home" onNav={onNav} />)
    const hamburger = container.querySelector('button[class*="hamburger"]')
    if (!hamburger) return
    fireEvent.click(hamburger)
    fireEvent.click(screen.getByRole('button', { name: 'Style Templates' }))
    const linksEl = container.querySelector('[class*="links"]')
    expect(linksEl?.className).not.toContain('open')
  })
})
