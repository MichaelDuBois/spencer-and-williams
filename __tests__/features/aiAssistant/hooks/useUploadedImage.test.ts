import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUploadedImage } from '@/features/aiAssistant/hooks/useUploadedImage'
import { IMAGE_IMPORT_ERRORS } from '@/utilities/imageFile'

let mockDataUrl = 'data:image/png;base64,QUJD'

class MockFileReader {
  result: string | null = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL() {
    this.result = mockDataUrl
    this.onload?.()
  }
}

const makeFile = ({ type, size }: { type: string; size: number }): File =>
  ({ type, size }) as unknown as File

describe('useUploadedImage', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', MockFileReader)
    mockDataUrl = 'data:image/png;base64,QUJD'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects a non-image file', async () => {
    const { result } = renderHook(() => useUploadedImage())

    await act(async () => {
      await result.current.uploadFile(
        makeFile({ type: 'text/plain', size: 100 }),
      )
    })

    expect(result.current.error).toBe(IMAGE_IMPORT_ERRORS.invalidType)
    expect(result.current.uploaded).toBeNull()
  })

  it('rejects a file larger than the size cap', async () => {
    const { result } = renderHook(() => useUploadedImage())

    await act(async () => {
      await result.current.uploadFile(
        makeFile({ type: 'image/png', size: 11 * 1024 * 1024 }),
      )
    })

    expect(result.current.error).toBe(IMAGE_IMPORT_ERRORS.tooLarge)
    expect(result.current.uploaded).toBeNull()
  })

  it('holds a valid image with base64, media type, and a data URL', async () => {
    const { result } = renderHook(() => useUploadedImage())

    await act(async () => {
      await result.current.uploadFile(
        makeFile({ type: 'image/png', size: 2048 }),
      )
    })

    await waitFor(() => expect(result.current.uploaded).not.toBeNull())
    expect(result.current.uploaded).toEqual({
      dataUrl: 'data:image/png;base64,QUJD',
      base64Image: 'QUJD',
      mediaType: 'image/png',
    })
    expect(result.current.error).toBeNull()
  })

  it('clears an uploaded image', async () => {
    const { result } = renderHook(() => useUploadedImage())

    await act(async () => {
      await result.current.uploadFile(
        makeFile({ type: 'image/png', size: 2048 }),
      )
    })
    await waitFor(() => expect(result.current.uploaded).not.toBeNull())

    act(() => result.current.clear())
    expect(result.current.uploaded).toBeNull()
  })
})
