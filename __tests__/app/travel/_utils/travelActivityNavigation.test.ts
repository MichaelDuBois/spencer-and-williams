import { describe, expect, it } from 'vitest'

import { getRelatedActivityHref } from '@/app/travel/_utils/travelActivityNavigation'

describe('getRelatedActivityHref', () => {
  it('builds an article href for article objectIDs', () => {
    expect(getRelatedActivityHref('article-42', 'travel')).toBe(
      '/travel/article/article-42',
    )
  })

  it('builds a podcast href for podcast objectIDs', () => {
    expect(getRelatedActivityHref('podcast-7', 'travel')).toBe(
      '/travel/podcast/podcast-7',
    )
  })

  it('returns null for an unrecognized objectID prefix', () => {
    expect(getRelatedActivityHref('hotel-1', 'travel')).toBeNull()
  })
})
