import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ToastProvider } from '../components/Toast'
import PhotoUploader from '../components/PhotoUploader'

// Mock claudeApi so tests don't make real HTTP calls
vi.mock('../utils/claudeApi', () => ({
  usePhotoAnalysis: () => ({
    analysis: null,
    loading: false,
    error: null,
    analyzePhoto: vi.fn().mockResolvedValue({
      hasFace: true,
      faceCount: 1,
      lighting: 'studio',
      background: 'plain',
      framing: 'chest up',
      expression: 'confident',
      attire: 'formal',
      quality: 'excellent',
      issues: [],
      suggestions: ['Good posture'],
      bestCrops: ['1:1 square'],
      overallScore: 9,
    }),
  }),
}))

// Mock imageUtils functions that touch the DOM
vi.mock('../utils/imageUtils', async () => {
  const actual = await vi.importActual('../utils/imageUtils')
  return {
    ...actual,
    fileToDataUrl:  vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
    fileToBase64:   vi.fn().mockResolvedValue('mockBase64String'),
    cropAndResize:  vi.fn().mockResolvedValue('data:image/jpeg;base64,cropped'),
  }
})

function makeImageFile(name = 'photo.jpg', type = 'image/jpeg') {
  return new File(['fake-image-bytes'], name, { type })
}

function renderUploader(onPhotoReady = vi.fn()) {
  return render(
    <ToastProvider>
      <PhotoUploader onPhotoReady={onPhotoReady} />
    </ToastProvider>
  )
}

describe('PhotoUploader', () => {
  // ── Initial render ──────────────────────────────────────────────────────────
  it('renders the section heading', () => {
    renderUploader()
    expect(screen.getByText(/Upload & Analyze Your Photo/i)).toBeInTheDocument()
  })

  it('shows the drop zone with upload instructions', () => {
    renderUploader()
    expect(screen.getByText(/Drop your photo here/i)).toBeInTheDocument()
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument()
  })

  it('shows accepted file types hint', () => {
    renderUploader()
    expect(screen.getByText(/JPG, PNG, WEBP/i)).toBeInTheDocument()
  })

  it('renders the "Choose Photo" browse button', () => {
    renderUploader()
    expect(screen.getByRole('button', { name: /Choose Photo/i })).toBeInTheDocument()
  })

  it('shows the empty analysis panel prompt', () => {
    renderUploader()
    expect(screen.getByText(/Upload a photo to get AI analysis/i)).toBeInTheDocument()
  })

  it('renders a hidden file input', () => {
    const { container } = renderUploader()
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).not.toBeNull()
    expect(fileInput.getAttribute('accept')).toBe('image/*')
  })

  // ── File selection ──────────────────────────────────────────────────────────
  it('processes a file when selected via the file input', async () => {
    const onPhotoReady = vi.fn()
    const { container } = renderUploader(onPhotoReady)
    const fileInput = container.querySelector('input[type="file"]')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [makeImageFile()] } })
    })

    await waitFor(() => expect(onPhotoReady).toHaveBeenCalledTimes(1))
  })

  it('calls onPhotoReady with dataUrl, base64, mediaType, analysis', async () => {
    const onPhotoReady = vi.fn()
    const { container } = renderUploader(onPhotoReady)
    const fileInput = container.querySelector('input[type="file"]')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [makeImageFile()] } })
    })

    await waitFor(() => {
      const arg = onPhotoReady.mock.calls[0]?.[0]
      // Analysis is now disabled (Claude API commented out)
      expect(arg).toMatchObject({
        dataUrl:   expect.stringContaining('data:image/jpeg'),
        base64:    'mockBase64String',
        mediaType: 'image/jpeg',
        analysis:  null, // No analysis in MVP
      })
    })
  })

  it('ignores non-image files', async () => {
    const onPhotoReady = vi.fn()
    const { container } = renderUploader(onPhotoReady)
    const fileInput = container.querySelector('input[type="file"]')
    const textFile  = new File(['text'], 'doc.txt', { type: 'text/plain' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [textFile] } })
    })

    // onPhotoReady should NOT be called for non-image files
    expect(onPhotoReady).not.toHaveBeenCalled()
  })

  // ── Preview & crop UI ───────────────────────────────────────────────────────
  it('shows the preview image after a file is loaded', async () => {
    const { container } = renderUploader()
    const fileInput = container.querySelector('input[type="file"]')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [makeImageFile()] } })
    })

    await waitFor(() => {
      const img = container.querySelector('img.previewImg, [class*="previewImg"]')
      expect(img).not.toBeNull()
    })
  })

  it('shows the "Change Photo" button after upload', async () => {
    const { container } = renderUploader()
    const fileInput = container.querySelector('input[type="file"]')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [makeImageFile()] } })
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Change Photo/i })).toBeInTheDocument()
    })
  })

  it('shows crop ratio buttons after upload', async () => {
    const { container } = renderUploader()
    const fileInput = container.querySelector('input[type="file"]')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [makeImageFile()] } })
    })

    await waitFor(() => {
      expect(screen.getByText('1:1')).toBeInTheDocument()
      expect(screen.getByText('4:5')).toBeInTheDocument()
      expect(screen.getByText('3:4')).toBeInTheDocument()
    })
  })

  // ── Drag-and-drop ───────────────────────────────────────────────────────────
  it('sets dragging state on dragover', () => {
    const { container } = renderUploader()
    const dropZone = container.querySelector('[class*="dropZone"]')

    fireEvent.dragOver(dropZone, { preventDefault: () => {} })
    expect(dropZone.className).toMatch(/dragging/)
  })

  it('clears dragging state on dragleave', () => {
    const { container } = renderUploader()
    const dropZone = container.querySelector('[class*="dropZone"]')

    fireEvent.dragOver(dropZone,  { preventDefault: () => {} })
    fireEvent.dragLeave(dropZone)
    expect(dropZone.className).not.toMatch(/dragging/)
  })

  it('processes dropped image files', async () => {
    const onPhotoReady = vi.fn()
    const { container } = renderUploader(onPhotoReady)
    const dropZone = container.querySelector('[class*="dropZone"]')

    await act(async () => {
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [makeImageFile('dropped.jpg')] },
        preventDefault: () => {},
      })
    })

    await waitFor(() => expect(onPhotoReady).toHaveBeenCalled())
  })
})
