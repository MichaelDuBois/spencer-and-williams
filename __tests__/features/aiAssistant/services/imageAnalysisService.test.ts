import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { invoke } = vi.hoisted(() => {
  return { invoke: vi.fn() }
})

vi.mock('@/services/supabase', () => {
  return { supabase: { functions: { invoke } } }
})

import { analyzeImage } from '@/features/aiAssistant/services/imageAnalysisService'

const params = { base64Image: 'QUJD', mediaType: 'image/png' }

describe('analyzeImage', () => {
  beforeEach(() => {
    invoke.mockReset()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('invokes the analyze-image edge function with the image payload', async () => {
    invoke.mockResolvedValue({ data: { analysis: 'red running shoe' }, error: null })

    const description = await analyzeImage(params)

    expect(invoke).toHaveBeenCalledWith('analyze-image', { body: params })
    expect(description).toBe('red running shoe')
  })

  it('returns an empty string when the function omits an analysis', async () => {
    invoke.mockResolvedValue({ data: {}, error: null })
    await expect(analyzeImage(params)).resolves.toBe('')
  })

  it('throws when the edge function returns an error', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'boom' } })
    await expect(analyzeImage(params)).rejects.toThrow(/Failed to analyze image: boom/)
  })

  it('throws a clear error when Supabase is not configured', async () => {
    vi.resetModules()
    vi.doMock('@/services/supabase', () => {
      return { supabase: null }
    })
    const { analyzeImage: analyze } = await import(
      '@/features/aiAssistant/services/imageAnalysisService'
    )
    await expect(analyze(params)).rejects.toThrow(/Supabase is not configured/)
  })
})
