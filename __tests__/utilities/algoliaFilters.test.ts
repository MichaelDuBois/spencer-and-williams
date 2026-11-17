import { describe, expect, it } from 'vitest'

import {
  combineAlgoliaFilters,
  getObjectIdsFilter,
} from '@/utilities/algoliaFilters'

describe('combineAlgoliaFilters', () => {
  it('preserves an OR expression when adding hard restrictions', () => {
    expect(
      combineAlgoliaFilters(
        getObjectIdsFilter(['A', 'B']),
        'visible_by:"group0"',
        'availableInStores.objectID:"1"',
      ),
    ).toBe(
      '(objectID:"A" OR objectID:"B") AND visible_by:"group0" AND availableInStores.objectID:"1"',
    )
  })

  it('keeps valid AND expressions and already-grouped OR expressions without extra parentheses', () => {
    expect(
      combineAlgoliaFilters(
        'price > 10 AND (brand:A OR brand:B)',
        'visible_by:group0',
      ),
    ).toBe('price > 10 AND (brand:A OR brand:B) AND visible_by:group0')
  })

  it('ignores OR and parentheses inside escaped quoted values', () => {
    expect(
      combineAlgoliaFilters(
        String.raw`brand:"(A \" OR B)"`,
        "category:'A OR B'",
        'visible_by:group0',
      ),
    ).toBe(
      String.raw`brand:"(A \" OR B)" AND category:'A OR B' AND visible_by:group0`,
    )
  })

  it('ignores absent filters', () => {
    expect(combineAlgoliaFilters(undefined, '', null, '  ')).toBe('')
    expect(combineAlgoliaFilters(undefined, ' brand:A ')).toBe('brand:A')
  })
})
