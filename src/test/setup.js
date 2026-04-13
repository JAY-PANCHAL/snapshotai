import '@testing-library/jest-dom'

// ── Mock canvas API (used by cropAndResize) ──────────────────────────────────
class MockCanvasRenderingContext2D {
  drawImage() {}
  clearRect() {}
  beginPath() {}
  arc() {}
  fill() {}
}

HTMLCanvasElement.prototype.getContext = () => new MockCanvasRenderingContext2D()
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,mockBase64Data=='

// ── Mock Image loading ────────────────────────────────────────────────────────
global.Image = class {
  constructor() {
    this.onload = null
    this.width  = 800
    this.height = 600
  }
  set src(val) {
    // simulate async load
    setTimeout(() => this.onload?.(), 0)
  }
}

// ── Mock clipboard ────────────────────────────────────────────────────────────
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
})

// ── Mock IntersectionObserver ─────────────────────────────────────────────────
global.IntersectionObserver = class {
  constructor(cb) { this._cb = cb }
  observe()    {}
  unobserve()  {}
  disconnect() {}
}

// ── Mock ResizeObserver ───────────────────────────────────────────────────────
global.ResizeObserver = class {
  observe()    {}
  unobserve()  {}
  disconnect() {}
}

// ── Silence console.error for expected React act() warnings ──────────────────
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('act(')) return
    originalError(...args)
  }
})
afterAll(() => { console.error = originalError })
