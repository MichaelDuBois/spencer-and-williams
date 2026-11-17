import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createImageThumbnail } from '@/features/chatWidget/utils/createImageThumbnail'

const SOURCE_URL = 'data:image/png;base64,QUJD'
const THUMBNAIL_URL = 'data:image/jpeg;base64,VEhVTUI='

interface FakeImageOptions {
  width?: number
  height?: number
  fails?: boolean
}

const stubImage = ({ width = 800, height = 400, fails = false }: FakeImageOptions = {}) => {
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = width
      naturalHeight = height
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) {
        queueMicrotask(() => (fails ? this.onerror?.() : this.onload?.()))
      }
    },
  )
}

describe('createImageThumbnail', () => {
  const context = {
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  }
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    context.fillRect.mockClear()
    context.drawImage.mockClear()
    canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    vi.spyOn(canvas, 'toDataURL').mockReturnValue(THUMBNAIL_URL)
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) =>
      tagName === 'canvas' ? canvas : createElement(tagName),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('scales the longest side down to the thumbnail size as a JPEG', async () => {
    stubImage({ width: 1600, height: 800 })

    await expect(createImageThumbnail(SOURCE_URL)).resolves.toBe(THUMBNAIL_URL)

    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(200)
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 400, 200)
    expect(canvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.75)
  })

  it('never upscales a small image', async () => {
    stubImage({ width: 40, height: 20 })

    await createImageThumbnail(SOURCE_URL)

    expect(canvas.width).toBe(40)
    expect(canvas.height).toBe(20)
  })

  it('rejects when the image cannot be decoded', async () => {
    stubImage({ fails: true })

    await expect(createImageThumbnail(SOURCE_URL)).rejects.toThrow(
      'Could not load the image',
    )
  })

  it('rejects when no canvas context is available', async () => {
    stubImage()
    vi.mocked(canvas.getContext).mockReturnValue(null)

    await expect(createImageThumbnail(SOURCE_URL)).rejects.toThrow(
      'Canvas is not available',
    )
  })
})
