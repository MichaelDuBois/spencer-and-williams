import { describe, expect, it } from 'vitest'

import { getResultHits } from '@/utilities/getResultHits'

describe('getResultHits', () => {
  it('returns an empty hit list for undefined, null and non-objects', () => {
    expect(getResultHits(undefined)).toEqual({ hits: [], queryID: undefined })
    expect(getResultHits(null)).toEqual({ hits: [], queryID: undefined })
    expect(getResultHits('boom')).toEqual({ hits: [], queryID: undefined })
  })

  it('ignores a non-array hits value and a non-string queryID', () => {
    expect(getResultHits({ hits: 'nope', queryID: 42 })).toEqual({
      hits: [],
      queryID: undefined,
    })
  })

  it('returns the hits and the queryID of a well-formed result', () => {
    expect(
      getResultHits({ hits: [{ objectID: 'movie_1' }], queryID: 'q-1' }),
    ).toEqual({ hits: [{ objectID: 'movie_1' }], queryID: 'q-1' })
  })

  it('returns the hits of a result carrying no queryID', () => {
    expect(getResultHits({ hits: [{ objectID: 'movie_1' }] })).toEqual({
      hits: [{ objectID: 'movie_1' }],
      queryID: undefined,
    })
  })

  it('returns an empty hit list for a facet-only response', () => {
    expect(getResultHits({ facetHits: [{ value: 'Drama', count: 12 }] })).toEqual(
      { hits: [], queryID: undefined },
    )
  })
})
