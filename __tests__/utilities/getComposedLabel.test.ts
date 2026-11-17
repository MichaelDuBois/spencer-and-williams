import { describe, it, expect } from 'vitest'

import { getComposedLabel } from '@/utilities/getComposedLabel'

describe('getComposedLabel', () => {
  it('maps a key to its prefix label', () => {
    expect(getComposedLabel('promoted-1')).toBe('Promoted')
    expect(getComposedLabel('sponsored-123')).toBe('Sponsored')
    expect(getComposedLabel('new-arrival-7')).toBe('New Arrival')
    expect(getComposedLabel('popular_items')).toBe('Popular')
    expect(getComposedLabel('rating-top')).toBe('Highly Rated')
    expect(getComposedLabel('recommend-abc')).toBe('Recommended')
  })

  it('matches the external source prefix', () => {
    expect(getComposedLabel('demo_external_source_42')).toBe(
      'SPONSORED external',
    )
  })

  it('falls back to Promoted when the key matches no prefix', () => {
    expect(getComposedLabel('unknown-key')).toBe('Promoted')
  })

  it('falls back to Promoted when the key is undefined', () => {
    expect(getComposedLabel()).toBe('Promoted')
  })
})
