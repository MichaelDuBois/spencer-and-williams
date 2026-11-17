import { describe, it, expect, vi, beforeEach } from 'vitest'

import { fetchSortingStrategy, runComposition } from '@/lib/composition'
import { createCompositionSearchClient } from '@/lib/create-composition-search-client'

vi.mock('@/lib/composition', () => {
  return {
    runComposition: vi.fn(),
    fetchSortingStrategy: vi.fn(),
  }
})

const mockRunComposition = vi.mocked(runComposition)
const mockFetchSortingStrategy = vi.mocked(fetchSortingStrategy)

const mockBaseClient = {
  search: vi.fn(),
  searchForFacetValues: vi.fn(),
}

const defaultOptions = {
  baseClient: mockBaseClient as unknown as Parameters<
    typeof createCompositionSearchClient
  >[0]['baseClient'],
  appId: 'APP_ID',
  apiKey: 'API_KEY',
  compositionId: 'my-composition',
  primaryIndexName: 'products',
  replicas: [{ label: 'Price: Low to High', indexName: 'products_price_asc' }],
}

const primaryRequest = {
  indexName: 'products',
  params: { query: 'shoes', hitsPerPage: 20 },
}

const suggestionsRequest = {
  indexName: 'products_query_suggestions',
  params: { query: 'shoes', hitsPerPage: 5 },
}

const compositionResponse = {
  hits: [{ objectID: '1' }],
  nbHits: 1,
  nbPages: 1,
  page: 0,
  hitsPerPage: 20,
  query: 'shoes',
  params: 'query=shoes',
}

const standardResponse = {
  results: [{ hits: [{ objectID: 'qs1' }], nbHits: 1 }],
}

const sortRequest = {
  indexName: 'products_price_asc',
  params: { query: 'shoes' },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchSortingStrategy.mockResolvedValue({
    'Price: Low to High': 'products_price_asc',
  })
})

describe('createCompositionSearchClient', () => {
  it.each(['products', 'products_price_asc'])(
    'preserves eligibility in Composition and its parallel extension search for %s',
    async (indexName) => {
      const filters =
        'visible_by:"customer_group_0" AND availableInStores.objectID:"1"'
      const request = {
        indexName,
        params: {
          query: 'drill',
          filters,
          extensions: { '*': { input: { enableDynamicFaceting: true } } },
        },
      }
      mockRunComposition.mockResolvedValue(compositionResponse)
      mockBaseClient.search.mockResolvedValue(standardResponse)
      const client = createCompositionSearchClient(defaultOptions)

      await client.search([request] as Parameters<typeof client.search>[0])

      expect(mockRunComposition).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ query: 'drill', filters }),
        }),
      )
      expect(mockBaseClient.search).toHaveBeenCalledWith([request])
    },
  )

  it('preserves eligibility when sorting falls back to the standard replica', async () => {
    const request = {
      ...sortRequest,
      params: {
        ...sortRequest.params,
        filters:
          'visible_by:"customer_group_1" AND availableInStores.objectID:"2"',
      },
    }
    mockFetchSortingStrategy.mockResolvedValue(null)
    mockBaseClient.search.mockResolvedValue(standardResponse)
    const client = createCompositionSearchClient(defaultOptions)

    await client.search([request] as Parameters<typeof client.search>[0])

    expect(mockRunComposition).not.toHaveBeenCalled()
    expect(mockBaseClient.search).toHaveBeenCalledWith([request])
  })

  it('routes primary index through Composition API', async () => {
    mockRunComposition.mockResolvedValue(compositionResponse)
    const client = createCompositionSearchClient(defaultOptions)

    const result = await client.search([primaryRequest] as Parameters<
      typeof client.search
    >[0])

    expect(mockRunComposition).toHaveBeenCalledWith({
      credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
      compositionId: 'my-composition',
      params: { query: 'shoes', hitsPerPage: 20, getRankingInfo: true },
    })
    expect(mockBaseClient.search).not.toHaveBeenCalled()
    expect((result as { results: unknown[] }).results).toHaveLength(1)
  })

  it('strips distinct, which the Composition API rejects at runtime', async () => {
    mockRunComposition.mockResolvedValue(compositionResponse)
    const client = createCompositionSearchClient(defaultOptions)

    await client.search([
      { indexName: 'products', params: { query: 'shoes', distinct: true } },
    ] as Parameters<typeof client.search>[0])

    expect(mockRunComposition).toHaveBeenCalledWith({
      credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
      compositionId: 'my-composition',
      params: { query: 'shoes', getRankingInfo: true },
    })
  })

  it('routes non-primary index through standard client', async () => {
    mockBaseClient.search.mockResolvedValue(standardResponse)
    const client = createCompositionSearchClient(defaultOptions)

    const result = await client.search([suggestionsRequest] as Parameters<
      typeof client.search
    >[0])

    expect(mockRunComposition).not.toHaveBeenCalled()
    expect(mockBaseClient.search).toHaveBeenCalled()
    expect((result as { results: unknown[] }).results).toHaveLength(1)
  })

  it('partitions mixed requests correctly', async () => {
    mockRunComposition.mockResolvedValue(compositionResponse)
    mockBaseClient.search.mockResolvedValue(standardResponse)
    const client = createCompositionSearchClient(defaultOptions)

    const result = await client.search([
      primaryRequest,
      suggestionsRequest,
    ] as Parameters<typeof client.search>[0])

    expect(mockRunComposition).toHaveBeenCalledOnce()
    expect(mockBaseClient.search).toHaveBeenCalledOnce()

    const results = (result as { results: unknown[] }).results
    expect(results).toHaveLength(2)
    expect((results[0] as { index: string }).index).toBe('products')
    expect((results[1] as { hits: unknown[] }).hits).toEqual([
      { objectID: 'qs1' },
    ])
  })

  it('grafts extensions and facetOrdering from the parallel standard search', async () => {
    // Composition strips `extensions`, so a parallel standard search recovers
    // both the extensions data and the dynamic facet ordering.
    const primaryRequestWithExtensions = {
      indexName: 'products',
      params: {
        query: 'shoes',
        hitsPerPage: 20,
        extensions: { '*': { input: { enableDynamicFaceting: true } } },
      },
    }
    const facetOrdering = { facets: { order: ['brand', 'color'] } }
    mockRunComposition.mockResolvedValue({
      ...compositionResponse,
      renderingContent: { redirect: { url: '/promo' } },
    })
    mockBaseClient.search.mockResolvedValue({
      results: [
        {
          hits: [{ objectID: '1' }],
          extensions: { queryCategorization: { categories: ['shoes'] } },
          renderingContent: { facetOrdering },
        },
      ],
    })
    const client = createCompositionSearchClient(defaultOptions)

    const result = await client.search([
      primaryRequestWithExtensions,
    ] as Parameters<typeof client.search>[0])

    // Composition API must not receive the blocked `extensions` param.
    expect(mockRunComposition).toHaveBeenCalledWith({
      credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
      compositionId: 'my-composition',
      params: { query: 'shoes', hitsPerPage: 20, getRankingInfo: true },
    })

    const primary = (result as { results: { renderingContent: unknown }[] })
      .results[0] as {
      extensions: unknown
      renderingContent: { facetOrdering: unknown; redirect: unknown }
    }
    expect(primary.extensions).toEqual({
      queryCategorization: { categories: ['shoes'] },
    })
    // facetOrdering is overlaid while composition's own renderingContent
    // (e.g. redirects) is preserved.
    expect(primary.renderingContent.facetOrdering).toEqual(facetOrdering)
    expect(primary.renderingContent.redirect).toEqual({ url: '/promo' })
  })

  it('routes a sort replica through the composition with its sortingStrategy label', async () => {
    mockRunComposition.mockResolvedValue(compositionResponse)
    const client = createCompositionSearchClient(defaultOptions)

    await client.search([sortRequest] as Parameters<typeof client.search>[0])

    expect(mockRunComposition).toHaveBeenCalledWith({
      credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
      compositionId: 'my-composition',
      params: {
        query: 'shoes',
        getRankingInfo: true,
        sortBy: 'Price: Low to High',
      },
    })
    expect(mockBaseClient.search).not.toHaveBeenCalled()
  })

  it('does not send sortBy, or read the strategy, for the primary index', async () => {
    mockRunComposition.mockResolvedValue(compositionResponse)
    const client = createCompositionSearchClient(defaultOptions)

    await client.search([primaryRequest] as Parameters<typeof client.search>[0])

    expect(mockFetchSortingStrategy).not.toHaveBeenCalled()
    expect(mockRunComposition).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { query: 'shoes', hitsPerPage: 20, getRankingInfo: true },
      }),
    )
  })

  it('reads the sorting strategy once across searches', async () => {
    mockRunComposition.mockResolvedValue(compositionResponse)
    const client = createCompositionSearchClient(defaultOptions)

    await client.search([sortRequest] as Parameters<typeof client.search>[0])
    await client.search([sortRequest] as Parameters<typeof client.search>[0])

    expect(mockFetchSortingStrategy).toHaveBeenCalledOnce()
  })

  it.each([
    ['the label is missing from the strategy', {}],
    ['the label maps to a different index', { 'Price: Low to High': 'other' }],
    ['the strategy cannot be read', null],
  ])('falls back to the replica index when %s', async (_label, strategy) => {
    // Sorting keeps working through the plain index; only groups are lost.
    mockFetchSortingStrategy.mockResolvedValue(strategy)
    mockBaseClient.search.mockResolvedValue(standardResponse)
    const client = createCompositionSearchClient(defaultOptions)

    const result = await client.search([sortRequest] as Parameters<
      typeof client.search
    >[0])

    expect(mockRunComposition).not.toHaveBeenCalled()
    expect(mockBaseClient.search).toHaveBeenCalledWith([sortRequest])
    expect((result as { results: unknown[] }).results).toEqual(
      standardResponse.results,
    )
  })

  it('keeps the primary request on the composition when a sort falls back', async () => {
    mockFetchSortingStrategy.mockResolvedValue({})
    mockRunComposition.mockResolvedValue(compositionResponse)
    mockBaseClient.search.mockResolvedValue(standardResponse)
    const client = createCompositionSearchClient(defaultOptions)

    await client.search([primaryRequest, sortRequest] as Parameters<
      typeof client.search
    >[0])

    expect(mockRunComposition).toHaveBeenCalledOnce()
    expect(mockBaseClient.search).toHaveBeenCalledWith([sortRequest])
  })

  it('does not graft renderingContent when the request has no extensions', async () => {
    mockRunComposition.mockResolvedValue({
      ...compositionResponse,
      renderingContent: { redirect: { url: '/promo' } },
    })
    const client = createCompositionSearchClient(defaultOptions)

    const result = await client.search([primaryRequest] as Parameters<
      typeof client.search
    >[0])

    expect(mockBaseClient.search).not.toHaveBeenCalled()
    const primary = (result as { results: { renderingContent: unknown }[] })
      .results[0] as { renderingContent: { facetOrdering?: unknown } }
    expect(primary.renderingContent.facetOrdering).toBeUndefined()
  })
})
