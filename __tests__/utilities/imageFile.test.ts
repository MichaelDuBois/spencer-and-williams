import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  IMAGE_IMPORT_ERRORS,
  MAX_IMAGE_SIZE_BYTES,
  readFileAsBase64,
} from '@/utilities/imageFile'

let mockDataUrl: string | null = 'data:image/png;base64,QUJD'
let shouldError = false

class MockFileReader {
  result: string | null = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL() {
    if (shouldError) {
      this.onerror?.()
      return
    }
    this.result = mockDataUrl
    this.onload?.()
  }
}

const makeFile = (type = 'image/png'): File => ({ type }) as unknown as File

describe('imageFile', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', MockFileReader)
    mockDataUrl = 'data:image/png;base64,QUJD'
    shouldError = false
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('exposes a 10MB size cap', () => {
    expect(MAX_IMAGE_SIZE_BYTES).toBe(10 * 1024 * 1024)
  })

  it('splits the data URL into base64 payload and media type', async () => {
    await expect(readFileAsBase64(makeFile())).resolves.toEqual({
      base64Image: 'QUJD',
      mediaType: 'image/png',
    })
  })

  it('extracts a clean media type when the data URL carries extra params', async () => {
    mockDataUrl = 'data:image/jpeg;charset=utf-8;base64,QUJD'
    await expect(readFileAsBase64(makeFile('image/jpeg'))).resolves.toEqual({
      base64Image: 'QUJD',
      mediaType: 'image/jpeg',
    })
  })

  it('falls back to the file type when the data URL has no media type', async () => {
    mockDataUrl = 'data:;base64,QUJD'
    await expect(readFileAsBase64(makeFile('image/webp'))).resolves.toEqual({
      base64Image: 'QUJD',
      mediaType: 'image/webp',
    })
  })

  it('rejects when there is no base64 payload', async () => {
    mockDataUrl = 'data:image/png;base64,'
    await expect(readFileAsBase64(makeFile())).rejects.toThrow(
      IMAGE_IMPORT_ERRORS.readFailed,
    )
  })

  it('rejects when the reader errors', async () => {
    shouldError = true
    await expect(readFileAsBase64(makeFile())).rejects.toThrow(
      IMAGE_IMPORT_ERRORS.readFailed,
    )
  })
})
