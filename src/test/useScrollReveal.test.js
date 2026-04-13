import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const OriginalIO = global.IntersectionObserver

afterEach(() => { global.IntersectionObserver = OriginalIO })

/** Creates a constructor-compatible IntersectionObserver mock */
function makeIOMock(overrides = {}) {
  return class MockIO {
    constructor(callback, options) {
      this._callback = callback
      this._options  = options
      this.observe    = overrides.observe    ?? vi.fn()
      this.unobserve  = overrides.unobserve  ?? vi.fn()
      this.disconnect = overrides.disconnect ?? vi.fn()
      MockIO.lastInstance = this
    }
  }
}

describe('useScrollReveal', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() => useScrollReveal())
    expect(result.current).toHaveProperty('current')
  })

  it('initial ref value is null (hook not attached to a DOM node)', () => {
    const { result } = renderHook(() => useScrollReveal())
    expect(result.current.current).toBeNull()
  })

  it('accepts custom options without throwing', () => {
    expect(() => {
      renderHook(() => useScrollReveal({ threshold: 0.2, rootMargin: '-50px 0px' }))
    }).not.toThrow()
  })

  it('uses default options when none are provided', () => {
    expect(() => {
      renderHook(() => useScrollReveal())
    }).not.toThrow()
  })

  it('constructs an IntersectionObserver on mount', () => {
    const MockIO = makeIOMock()
    const spy = vi.fn().mockImplementation((...args) => new MockIO(...args))
    // Make spy behave like a constructor by copying prototype
    Object.setPrototypeOf(spy, Function.prototype)
    global.IntersectionObserver = class extends MockIO {}

    const constructorSpy = vi.spyOn(global, 'IntersectionObserver')
    renderHook(() => useScrollReveal())
    expect(constructorSpy).toHaveBeenCalledTimes(1)
    constructorSpy.mockRestore()
  })

  it('calls disconnect when the component unmounts', () => {
    const disconnectSpy = vi.fn()
    global.IntersectionObserver = class {
      constructor() {
        this.observe    = vi.fn()
        this.unobserve  = vi.fn()
        this.disconnect = disconnectSpy
      }
    }
    const { unmount } = renderHook(() => useScrollReveal())
    unmount()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })

  it('passes the threshold option to the observer', () => {
    let capturedOptions
    global.IntersectionObserver = class {
      constructor(_cb, options) {
        capturedOptions = options
        this.observe    = vi.fn()
        this.unobserve  = vi.fn()
        this.disconnect = vi.fn()
      }
    }
    renderHook(() => useScrollReveal({ threshold: 0.5 }))
    expect(capturedOptions.threshold).toBe(0.5)
  })

  it('passes the rootMargin option to the observer', () => {
    let capturedOptions
    global.IntersectionObserver = class {
      constructor(_cb, options) {
        capturedOptions = options
        this.observe    = vi.fn()
        this.unobserve  = vi.fn()
        this.disconnect = vi.fn()
      }
    }
    renderHook(() => useScrollReveal({ rootMargin: '-20px 0px' }))
    expect(capturedOptions.rootMargin).toBe('-20px 0px')
  })

  it('uses default threshold of 0.1 when not specified', () => {
    let capturedOptions
    global.IntersectionObserver = class {
      constructor(_cb, options) {
        capturedOptions = options
        this.observe = vi.fn(); this.unobserve = vi.fn(); this.disconnect = vi.fn()
      }
    }
    renderHook(() => useScrollReveal())
    expect(capturedOptions.threshold).toBe(0.1)
  })
})
