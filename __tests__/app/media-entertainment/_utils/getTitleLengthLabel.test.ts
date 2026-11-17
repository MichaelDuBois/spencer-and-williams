import { describe, expect, it } from 'vitest'

import { getTitleLengthLabel } from '@/app/media-entertainment/_utils/getTitleLengthLabel'

describe('getTitleLengthLabel', () => {
  it('prefers a real runtime, whatever the type', () => {
    expect(getTitleLengthLabel({ runtime: 164, type: 'movie' })).toBe('2h 44m')
    expect(getTitleLengthLabel({ runtime: 45, type: 'show' })).toBe('45m')
  })

  it('returns nothing for a film with no runtime rather than "0m"', () => {
    expect(getTitleLengthLabel({ runtime: 0, type: 'movie' })).toBeNull()
  })

  it('counts seasons for a series with no runtime', () => {
    expect(getTitleLengthLabel({ runtime: 0, type: 'show', seasonCount: 5 })).toBe(
      '5 Seasons',
    )
    expect(getTitleLengthLabel({ type: 'show', seasonCount: 1 })).toBe(
      '1 Season',
    )
  })

  it('falls back to "Series" when the season count was never fetched', () => {
    expect(getTitleLengthLabel({ runtime: 0, type: 'show' })).toBe('Series')
  })
})
