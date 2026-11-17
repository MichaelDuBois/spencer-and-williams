import { describe, expect, it } from 'vitest'

import { IMAGE_ONLY_RESPONSE_INSTRUCTION } from '@/features/aiAssistant/constants'
import type { ChatMessage } from '@/features/aiAssistant/types'
import {
  buildImageContext,
  getImageContextTexts,
  withImageContextParts,
} from '@/features/aiAssistant/utils/buildImageContext'

describe('buildImageContext', () => {
  it.each(['', '   ', '\n\t'])('returns null for an empty analysis %j', (analysis) => {
    expect(buildImageContext(analysis, true)).toBeNull()
    expect(buildImageContext(analysis, false)).toBeNull()
  })

  it('trims the analysis and prefixes the observations', () => {
    expect(buildImageContext('  red sneaker \n', false)).toEqual({
      imageAnalysis: 'Image Analysis:\nred sneaker',
    })
  })

  it('keeps the image-only instruction outside the observations', () => {
    const context = buildImageContext('red sneaker', true)

    expect(context).toEqual({
      imageAnalysis: 'Image Analysis:\nred sneaker',
      imageInstruction: IMAGE_ONLY_RESPONSE_INSTRUCTION,
    })
    expect(context?.imageAnalysis).not.toContain(IMAGE_ONLY_RESPONSE_INSTRUCTION)
  })

  it('requires a missing-message opener for both search outcomes', () => {
    expect(IMAGE_ONLY_RESPONSE_INSTRUCTION).toContain(
      'MUST begin with exactly one of these sentences',
    )
    expect(IMAGE_ONLY_RESPONSE_INSTRUCTION).toContain(
      'No message with your image? Here’s what comes closest.',
    )
    expect(IMAGE_ONLY_RESPONSE_INSTRUCTION).toContain(
      'No message with your image? I couldn’t find a close match.',
    )
  })
})

describe('getImageContextTexts', () => {
  it('lists observations before guidance', () => {
    expect(
      getImageContextTexts({
        imageAnalysis: 'Image Analysis:\nred sneaker',
        imageInstruction: 'guidance',
      }),
    ).toEqual(['Image Analysis:\nred sneaker', 'guidance'])
  })

  it('omits missing guidance', () => {
    expect(getImageContextTexts({ imageAnalysis: 'Image Analysis:\nx' })).toEqual([
      'Image Analysis:\nx',
    ])
  })
})

describe('withImageContextParts', () => {
  const message: ChatMessage = {
    id: 'm1',
    role: 'user',
    parts: [
      { type: 'image', imageUrl: 'data:image/png;base64,QUJD' },
      { type: 'text', text: '' },
      { type: 'image_context', text: 'old' },
    ],
    createdAt: new Date(0),
  }

  it('replaces existing image context parts', () => {
    expect(withImageContextParts(message, ['a', 'b']).parts).toEqual([
      { type: 'image', imageUrl: 'data:image/png;base64,QUJD' },
      { type: 'text', text: '' },
      { type: 'image_context', text: 'a' },
      { type: 'image_context', text: 'b' },
    ])
  })
})
