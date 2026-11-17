import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  runMultifeedComposition,
  type MultifeedCompositionResult,
} from '@/lib/multifeed-composition'

const mockSearch = vi.fn()

vi.mock('@algolia/composition', () => {return {
  compositionClient: () => {return { search: mockSearch }},
}})

const COMPOSITION_ID = 'my-composition'

const credentials = { appId: 'app-1', apiKey: 'key-1' }

const makeResult = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => {return {
  hits: [
    {
      objectID: 'hit-1',
      _rankingInfo: { composed: { [COMPOSITION_ID]: {} } },
    },
  ],
  queryID: 'q-1',
  indexUsed: 'products',
  feedID: 'feed-1',
  compositions: {
    [COMPOSITION_ID]: { injectedItems: [{ key: 'Trending' }] },
  },
  ...overrides,
}}

const run = (
  overrides?: Partial<Parameters<typeof runMultifeedComposition>[0]>,
): Promise<MultifeedCompositionResult[]> =>
  runMultifeedComposition({
    credentials,
    compositionId: COMPOSITION_ID,
    params: { query: 'shoes' },
    ...overrides,
  })

describe('runMultifeedComposition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when results is not an array', async () => {
    mockSearch.mockResolvedValue({ results: null })

    expect(await run()).toEqual([])
  })

  it('passes getRankingInfo: true alongside user params', async () => {
    mockSearch.mockResolvedValue({ results: [] })
    await run()

    expect(mockSearch).toHaveBeenCalledWith({
      compositionID: COMPOSITION_ID,
      requestBody: {
        params: { query: 'shoes', getRankingInfo: true },
      },
    })
  })

  it('returns feeds with composed hits enriched with __position and __queryID', async () => {
    mockSearch.mockResolvedValue({ results: [makeResult()] })
    const feeds = await run()

    expect(feeds).toHaveLength(1)
    expect(feeds[0].hits).toEqual([
      expect.objectContaining({
        objectID: 'hit-1',
        __position: 1,
        __queryID: 'q-1',
      }),
    ])
  })

  it('filters out hits not composed by the target compositionId', async () => {
    mockSearch.mockResolvedValue({
      results: [
        makeResult({
          hits: [
            {
              objectID: 'composed',
              _rankingInfo: { composed: { [COMPOSITION_ID]: {} } },
            },
            {
              objectID: 'other-composition',
              _rankingInfo: { composed: { 'other-id': {} } },
            },
            { objectID: 'no-ranking-info' },
          ],
        }),
      ],
    })
    const feeds = await run()

    expect(feeds[0].hits).toHaveLength(1)
    expect(feeds[0].hits[0].objectID).toBe('composed')
  })

  it('filters out result items without injectedItems for the compositionId', async () => {
    mockSearch.mockResolvedValue({
      results: [
        makeResult(),
        makeResult({
          feedID: 'no-injected',
          compositions: { [COMPOSITION_ID]: { injectedItems: [] } },
        }),
        makeResult({
          feedID: 'wrong-composition',
          compositions: { 'other-id': { injectedItems: [{ key: 'X' }] } },
        }),
        makeResult({ feedID: 'no-compositions', compositions: undefined }),
      ],
    })
    const feeds = await run()

    expect(feeds).toHaveLength(1)
    expect(feeds[0].feedId).toBe('feed-1')
  })

  it('derives title from deduplicated injected item keys', async () => {
    mockSearch.mockResolvedValue({
      results: [
        makeResult({
          compositions: {
            [COMPOSITION_ID]: {
              injectedItems: [
                { key: 'New Arrivals' },
                { key: 'Sale' },
                { key: 'New Arrivals' },
              ],
            },
          },
        }),
      ],
    })
    const feeds = await run()

    expect(feeds[0].title).toBe('New Arrivals & Sale')
  })

  it('falls back to feedID for title when injectedItems keys are empty', async () => {
    mockSearch.mockResolvedValue({
      results: [
        makeResult({
          feedID: 'my-feed',
          compositions: {
            [COMPOSITION_ID]: { injectedItems: [{ key: '' }] },
          },
        }),
      ],
    })
    const feeds = await run()

    expect(feeds[0].title).toBe('my-feed')
  })

  it('excludes feedID-less groups (injections inherited from the main composition)', async () => {
    // A rule defined on the main composition surfaces in the multifeed
    // response as a group with injectedItems but no feedID. It belongs in the
    // results grid, not the carousel, so it must be dropped.
    mockSearch.mockResolvedValue({
      results: [
        makeResult(),
        makeResult({
          feedID: undefined,
          indexUsed: 'products_index',
          compositions: {
            [COMPOSITION_ID]: {
              injectedItems: [{ key: 'sponsored-women-adidas-trainers' }],
            },
          },
        }),
      ],
    })
    const feeds = await run()

    expect(feeds).toHaveLength(1)
    expect(feeds[0].feedId).toBe('feed-1')
  })

  it('prefers indexUsed over index for indexName', async () => {
    mockSearch.mockResolvedValue({
      results: [makeResult({ indexUsed: 'used-index', index: 'raw-index' })],
    })
    const feeds = await run()

    expect(feeds[0].indexName).toBe('used-index')
  })

  it('falls back to index when indexUsed is missing', async () => {
    mockSearch.mockResolvedValue({
      results: [makeResult({ indexUsed: undefined, index: 'raw-index' })],
    })
    const feeds = await run()

    expect(feeds[0].indexName).toBe('raw-index')
  })

  it('assigns 1-based __position across composed hits only', async () => {
    mockSearch.mockResolvedValue({
      results: [
        makeResult({
          hits: [
            {
              objectID: 'a',
              _rankingInfo: { composed: { [COMPOSITION_ID]: {} } },
            },
            { objectID: 'b-not-composed' },
            {
              objectID: 'c',
              _rankingInfo: { composed: { [COMPOSITION_ID]: {} } },
            },
          ],
        }),
      ],
    })
    const feeds = await run()

    expect(feeds[0].hits.map((h) => [h.objectID, h.__position])).toEqual([
      ['a', 1],
      ['c', 2],
    ])
  })

  it('excludes hits also composed by the main composition while keeping multifeed-only hits', async () => {
    const MAIN_COMPOSITION_ID = 'main-composition'
    mockSearch.mockResolvedValue({
      results: [
        makeResult({
          hits: [
            {
              objectID: 'multifeed-only',
              _rankingInfo: { composed: { [COMPOSITION_ID]: {} } },
            },
            {
              objectID: 'also-in-main',
              _rankingInfo: {
                composed: {
                  [COMPOSITION_ID]: {},
                  [MAIN_COMPOSITION_ID]: {},
                },
              },
            },
          ],
        }),
      ],
    })
    const feeds = await run({ mainCompositionId: MAIN_COMPOSITION_ID })

    expect(feeds).toHaveLength(1)
    expect(feeds[0].hits).toHaveLength(1)
    expect(feeds[0].hits[0].objectID).toBe('multifeed-only')
  })

  it('drops a feed when every hit is also composed by the main composition', async () => {
    const MAIN_COMPOSITION_ID = 'main-composition'
    mockSearch.mockResolvedValue({
      results: [
        makeResult({
          hits: [
            {
              objectID: 'also-in-main',
              _rankingInfo: {
                composed: {
                  [COMPOSITION_ID]: {},
                  [MAIN_COMPOSITION_ID]: {},
                },
              },
            },
          ],
        }),
      ],
    })
    const feeds = await run({ mainCompositionId: MAIN_COMPOSITION_ID })

    expect(feeds).toHaveLength(0)
  })

  it('drops feeds where all hits are filtered out by isComposedBy', async () => {
    mockSearch.mockResolvedValue({
      results: [
        makeResult({
          feedID: 'empty-after-filter',
          hits: [{ objectID: 'x', _rankingInfo: { composed: {} } }],
        }),
      ],
    })
    const feeds = await run()

    expect(feeds).toHaveLength(0)
  })

  describe('main-only feeds', () => {
    const mainOnlyResult = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => {return {
      feedID: 'Star Wars Series',
      indexUsed: 'media_ns',
      queryID: 'q-9',
      hits: [
        { objectID: 'a' },
        { objectID: 'b', _rankingInfo: { composed: { main: {} } } },
      ],
      ...overrides,
    }}

    it('keeps main-only feeds and all their hits when includeMainFeeds is set', async () => {
      mockSearch.mockResolvedValue({ results: [mainOnlyResult()] })
      const feeds = await run({
        mainCompositionId: 'main',
        params: { query: 'star wars' },
        includeMainFeeds: true,
      })

      expect(feeds).toEqual([
        {
          feedId: 'Star Wars Series',
          title: 'Star Wars Series',
          indexName: 'media_ns',
          hits: [
            { objectID: 'a', __position: 1, __queryID: 'q-9' },
            {
              objectID: 'b',
              _rankingInfo: { composed: { main: {} } },
              __position: 2,
              __queryID: 'q-9',
            },
          ],
        },
      ])
    })

    it('drops main-only feeds by default', async () => {
      mockSearch.mockResolvedValue({ results: [mainOnlyResult()] })
      const feeds = await run({
        mainCompositionId: 'main',
        params: { query: 'star wars' },
      })

      expect(feeds).toEqual([])
    })

    it('drops an empty feed even when includeMainFeeds is set', async () => {
      mockSearch.mockResolvedValue({ results: [mainOnlyResult({ hits: [] })] })
      const feeds = await run({
        mainCompositionId: 'main',
        params: { query: 'star wars' },
        includeMainFeeds: true,
      })

      expect(feeds).toEqual([])
    })
  })
})
