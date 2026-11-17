import { describe, expect, it } from 'vitest'

import { pluralize } from '@/app/media-entertainment/_utils/pluralize'

describe('pluralize', () => {
  it('keeps the noun singular for one', () => {
    expect(pluralize(1, 'episode')).toBe('1 episode')
  })

  it('adds an s for many', () => {
    expect(pluralize(8, 'episode')).toBe('8 episodes')
  })

  it('adds an s for none', () => {
    expect(pluralize(0, 'episode')).toBe('0 episodes')
  })
})
