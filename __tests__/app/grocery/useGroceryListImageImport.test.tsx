import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  IMAGE_IMPORT_ERRORS,
  useGroceryListImageImport,
} from '@/app/grocery/_hooks/useGroceryListImageImport'
import { extractGroceryListFromImage } from '@/app/grocery/_services/groceryImageService'

import { buildProvidersWrapper } from '../../helpers/test-utils'

vi.mock('@/app/grocery/_services/groceryImageService', () => {return {
  extractGroceryListFromImage: vi.fn(),
}})

const mockedService = vi.mocked(extractGroceryListFromImage)

// Minimal FileReader that resolves synchronously with a configurable data URL.
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

const renderImport = (onImportSuccess = vi.fn()) => {
  const { Wrapper } = buildProvidersWrapper()
  const utils = renderHook(
    () => useGroceryListImageImport({ onImportSuccess }),
    { wrapper: Wrapper },
  )
  return { ...utils, onImportSuccess }
}

describe('useGroceryListImageImport', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', MockFileReader)
    mockedService.mockReset()
    mockDataUrl = 'data:image/png;base64,QUJD'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects a non-image file without calling the service', async () => {
    const { result, onImportSuccess } = renderImport()

    act(() =>
      result.current.importImage(makeFile({ type: 'text/plain', size: 1000 })),
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe(IMAGE_IMPORT_ERRORS.invalidType)
    expect(mockedService).not.toHaveBeenCalled()
    expect(onImportSuccess).not.toHaveBeenCalled()
  })

  it('rejects a file larger than 10MB without calling the service', async () => {
    const { result, onImportSuccess } = renderImport()

    act(() =>
      result.current.importImage(
        makeFile({ type: 'image/png', size: 11 * 1024 * 1024 }),
      ),
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe(IMAGE_IMPORT_ERRORS.tooLarge)
    expect(mockedService).not.toHaveBeenCalled()
    expect(onImportSuccess).not.toHaveBeenCalled()
  })

  it('converts a valid image to base64 and forwards extracted items', async () => {
    mockedService.mockResolvedValue(['milk', 'eggs'])
    const { result, onImportSuccess } = renderImport()

    act(() =>
      result.current.importImage(makeFile({ type: 'image/png', size: 2048 })),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedService).toHaveBeenCalledWith({
      base64Image: 'QUJD',
      mediaType: 'image/png',
    })
    expect(onImportSuccess).toHaveBeenCalledWith(['milk', 'eggs'])
    expect(result.current.importedItems).toEqual(['milk', 'eggs'])
  })

  it('extracts a clean media type when the data URL includes extra params', async () => {
    mockDataUrl = 'data:image/png;charset=utf-8;base64,QUJD'
    mockedService.mockResolvedValue(['milk'])
    const { result } = renderImport()

    act(() =>
      result.current.importImage(makeFile({ type: 'image/png', size: 2048 })),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService).toHaveBeenCalledWith({
      base64Image: 'QUJD',
      mediaType: 'image/png',
    })
  })

  it('flags an empty result via isEmpty', async () => {
    mockedService.mockResolvedValue([])
    const { result, onImportSuccess } = renderImport()

    act(() =>
      result.current.importImage(makeFile({ type: 'image/jpeg', size: 2048 })),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.isEmpty).toBe(true)
    expect(onImportSuccess).toHaveBeenCalledWith([])
  })
})
