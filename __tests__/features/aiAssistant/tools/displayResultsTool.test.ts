import { describe, expect, it } from 'vitest'

import {
  displayResultsToolHandler,
  withNonEmptyGroups,
  withQueryAttribution,
  withoutQueryAttribution,
} from '@/features/aiAssistant/tools/displayResultsTool'
import type {
  DisplayResultsData,
  ProductSummary,
} from '@/features/aiAssistant/types'

describe('withQueryAttribution', () => {
  const summaries: ProductSummary[] = [
    { objectID: 'p1', name: 'Trail Runner', price: 89, queryID: 'q1', position: 3 },
    { objectID: 'p2', name: 'Road Shoe', price: 120 },
  ]

  it('copies queryID and position onto the matching products', () => {
    const data = {
      intro: 'x',
      groups: [
        { title: 'Shoes', products: [{ objectID: 'p1', why: 'Best' }, { objectID: 'p2', why: 'Fast' }] },
      ],
    } as unknown as DisplayResultsData

    expect(withQueryAttribution(data, summaries)).toEqual({
      intro: 'x',
      groups: [
        {
          title: 'Shoes',
          products: [
            { objectID: 'p1', why: 'Best', queryID: 'q1', position: 3 },
            { objectID: 'p2', why: 'Fast' },
          ],
        },
      ],
    })
  })

  it('leaves a product without a matching summary or echoed attribution untouched', () => {
    const data = {
      groups: [{ products: [{ objectID: 'unknown' }] }],
    } as unknown as DisplayResultsData

    expect(withQueryAttribution(data, summaries)).toEqual(data)
  })

  it('strips agent-echoed queryID and position from unattributed products', () => {
    const data = {
      groups: [{ products: [{ objectID: 'unknown', queryID: 'echoed', position: 9 }] }],
    } as unknown as DisplayResultsData

    expect(withQueryAttribution(data, summaries)).toEqual({
      groups: [{ products: [{ objectID: 'unknown' }] }],
    })
  })

  it('prefers the joined attribution over agent-echoed values', () => {
    const data = {
      groups: [{ products: [{ objectID: 'p1', why: 'Best', queryID: 'echoed', position: 9 }] }],
    } as unknown as DisplayResultsData

    expect(withQueryAttribution(data, summaries)).toEqual({
      groups: [
        { products: [{ objectID: 'p1', why: 'Best', queryID: 'q1', position: 3 }] },
      ],
    })
  })

  it('strips agent-echoed attribution when no summary carries a queryID', () => {
    const data = {
      groups: [{ products: [{ objectID: 'p1', queryID: 'echoed', position: 2 }] }],
    } as unknown as DisplayResultsData

    expect(
      withQueryAttribution(data, [{ objectID: 'p1', name: 'X', price: 1 }]),
    ).toEqual({
      groups: [{ products: [{ objectID: 'p1' }] }],
    })
  })

  it('strips agent-echoed attribution when the summaries list is empty', () => {
    const data = {
      groups: [{ products: [{ objectID: 'p1', queryID: 'echoed', position: 2 }] }],
    } as unknown as DisplayResultsData

    expect(withQueryAttribution(data, [])).toEqual({
      groups: [{ products: [{ objectID: 'p1' }] }],
    })
  })

  it('ignores the travel items shape', () => {
    const data = {
      groups: [{ title: 'Guides', items: [{ objectID: 'p1' }] }],
    } as unknown as DisplayResultsData

    expect(withQueryAttribution(data, summaries)).toEqual(data)
  })
})

describe('withoutQueryAttribution', () => {
  it('strips agent-echoed attribution without joining any', () => {
    const data = {
      groups: [{ products: [{ objectID: 'p1', why: 'Best', queryID: 'echoed', position: 4 }] }],
    } as unknown as DisplayResultsData

    expect(withoutQueryAttribution(data)).toEqual({
      groups: [{ products: [{ objectID: 'p1', why: 'Best' }] }],
    })
  })
})

describe('withNonEmptyGroups', () => {
  it('keeps a group with a non-empty products array', () => {
    const data = {
      groups: [{ products: [{ objectID: 'p1' }] }],
    } as DisplayResultsData
    expect(withNonEmptyGroups(data)?.groups).toHaveLength(1)
  })

  it('keeps a group with a non-empty items array', () => {
    const data = {
      groups: [{ items: [{ objectID: 'i1' }] }],
    } as unknown as DisplayResultsData
    expect(withNonEmptyGroups(data)?.groups).toHaveLength(1)
  })

  it('drops empty groups while keeping the populated ones', () => {
    const data = {
      intro: 'x',
      groups: [
        { title: 'Empty', products: [] },
        { title: 'Full', products: [{ objectID: 'p1' }] },
      ],
    } as unknown as DisplayResultsData
    expect(withNonEmptyGroups(data)?.groups).toEqual([
      { title: 'Full', products: [{ objectID: 'p1' }] },
    ])
  })

  it('drops queries at the same indexes as empty groups', () => {
    const data = {
      groups: [
        { title: 'Empty', products: [] },
        { title: 'Full', products: [{ objectID: 'p1' }] },
      ],
      queries: ['empty query', 'matching query'],
    } as unknown as DisplayResultsData

    expect(withNonEmptyGroups(data)?.queries).toEqual(['matching query'])
  })

  it('drops empty item groups in the travel/b2b shape', () => {
    const data = {
      intro: 'x',
      groups: [
        { title: 'Full', items: [{ objectID: 'i1' }] },
        { title: 'Empty', items: [] },
      ],
    } as unknown as DisplayResultsData
    expect(withNonEmptyGroups(data)?.groups).toEqual([
      { title: 'Full', items: [{ objectID: 'i1' }] },
    ])
  })

  it('preserves the other payload fields', () => {
    const data = {
      intro: 'Here you go',
      answer: 'An answer',
      vertical: 'travel',
      groups: [{ title: 'Full', items: [{ objectID: 'i1' }] }],
    } as unknown as DisplayResultsData
    expect(withNonEmptyGroups(data)).toMatchObject({
      intro: 'Here you go',
      answer: 'An answer',
      vertical: 'travel',
    })
  })

  it('returns null when every group is empty', () => {
    const data = {
      groups: [{ products: [] }, { items: [] }],
    } as unknown as DisplayResultsData
    expect(withNonEmptyGroups(data)).toBeNull()
  })

  it('returns null when there are no groups at all', () => {
    expect(
      withNonEmptyGroups({ groups: [] } as unknown as DisplayResultsData),
    ).toBeNull()
  })

  it('does not mutate the input payload', () => {
    const data = {
      groups: [{ title: 'Empty', products: [] }, { products: [{ objectID: 'p1' }] }],
    } as unknown as DisplayResultsData
    withNonEmptyGroups(data)
    expect(data.groups).toHaveLength(2)
  })
})

describe('displayResultsToolHandler', () => {
  it('is registered under the displayResults name', () => {
    expect(displayResultsToolHandler.name).toBe('displayResults')
  })

  it('parseArgs returns the data object unchanged for a valid object', () => {
    const args = { groups: [{ products: [{ objectID: 'p1' }] }] }
    expect(displayResultsToolHandler.parseArgs(args)).toBe(args)
  })
})
