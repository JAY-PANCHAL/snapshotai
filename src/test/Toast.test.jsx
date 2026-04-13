import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { ToastProvider, toast } from '../components/Toast'

function Wrapper({ children }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('ToastProvider', () => {
  it('renders children without crashing', () => {
    render(<Wrapper><div>child</div></Wrapper>)
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('does not show any toast by default', () => {
    render(<Wrapper><div /></Wrapper>)
    expect(screen.queryByRole('status')).toBeNull()
    // container exists but is empty
    const { container } = render(<Wrapper><div /></Wrapper>)
    expect(container.querySelectorAll('[class*="toast"]').length).toBe(0)
  })

  it('shows a toast message when toast() is called', async () => {
    render(<Wrapper><div /></Wrapper>)
    act(() => { toast('Test message', 'success') })
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })

  it('applies the correct type class for success', async () => {
    const { container } = render(<Wrapper><div /></Wrapper>)
    act(() => { toast('Success!', 'success') })
    await waitFor(() => {
      const el = container.querySelector('[class*="success"]')
      expect(el).not.toBeNull()
    })
  })

  it('applies the correct type class for error', async () => {
    const { container } = render(<Wrapper><div /></Wrapper>)
    act(() => { toast('Error!', 'error') })
    await waitFor(() => {
      const el = container.querySelector('[class*="error"]')
      expect(el).not.toBeNull()
    })
  })

  it('applies the correct type class for info', async () => {
    const { container } = render(<Wrapper><div /></Wrapper>)
    act(() => { toast('Info!', 'info') })
    await waitFor(() => {
      const el = container.querySelector('[class*="info"]')
      expect(el).not.toBeNull()
    })
  })

  it('removes a toast when clicked', async () => {
    const { container } = render(<Wrapper><div /></Wrapper>)
    act(() => { toast('Click to remove', 'success', 60000) })
    await waitFor(() => screen.getByText('Click to remove'))

    const toastEl = container.querySelector('[class*="toast"]')
    fireEvent.click(toastEl)
    await waitFor(() => {
      expect(screen.queryByText('Click to remove')).toBeNull()
    })
  })

  it('can show multiple toasts simultaneously', async () => {
    render(<Wrapper><div /></Wrapper>)
    act(() => {
      toast('First',  'success', 60000)
      toast('Second', 'info',    60000)
    })
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  it('shows correct icon for success toast', async () => {
    const { container } = render(<Wrapper><div /></Wrapper>)
    act(() => { toast('Done', 'success') })
    await waitFor(() => {
      const icon = container.querySelector('[class*="icon"]')
      expect(icon?.textContent).toBe('✓')
    })
  })

  it('shows correct icon for error toast', async () => {
    const { container } = render(<Wrapper><div /></Wrapper>)
    act(() => { toast('Fail', 'error') })
    await waitFor(() => {
      const icon = container.querySelector('[class*="icon"]')
      expect(icon?.textContent).toBe('✕')
    })
  })
})
