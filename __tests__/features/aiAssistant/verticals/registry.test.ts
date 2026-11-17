import { describe, expect, it } from 'vitest'

import { getVerticalConfig } from '@/features/aiAssistant/verticals/registry'

describe('getVerticalConfig', () => {
  it('resolves the electronics vertical for the electronics slug', () => {
    const config = getVerticalConfig('electronics')

    expect(config.slug).toBe('electronics')
    expect(config.placeholderText).toBe('Ask about electronics...')
  })

  it('resolves the furnishing vertical for the furnishing slug', () => {
    const config = getVerticalConfig('furnishing')

    expect(config.slug).toBe('furnishing')
    expect(config.placeholderText).toBe('Ask about furniture...')
  })

  it('resolves the grocery vertical for the grocery slug', () => {
    expect(getVerticalConfig('grocery').slug).toBe('grocery')
  })

  it('resolves the b2b-warehouse vertical for the b2b-warehouse slug', () => {
    expect(getVerticalConfig('b2b-warehouse').slug).toBe('b2b-warehouse')
  })

  // An unregistered slug silently resolves to the commerce fallback, which would
  // render product cards against title records.
  it('resolves the media vertical rather than the commerce fallback', () => {
    const config = getVerticalConfig('media-entertainment')

    expect(config.slug).toBe('media-entertainment')
    expect(config.placeholderText).toBe('What are you in the mood for?')
    expect(config.suggestedQuestions.length).toBeGreaterThan(0)
  })

  it('falls back to the product vertical for unknown slugs', () => {
    expect(getVerticalConfig('unknown').slug).toBe('product')
  })

  it('falls back to the product vertical when slug is undefined', () => {
    expect(getVerticalConfig(undefined).slug).toBe('product')
  })
})
