import { act, renderHook } from '@testing-library/react'
import { createStore } from 'jotai'
import { describe, expect, it, vi } from 'vitest'

import { useSingleIndexSearch } from '@/features/aiAssistant/hooks/search/useSingleIndexSearch'
import { activeConfigAtom } from '@/stores/activeConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'
import type { HitExtractor } from '@/types/hitTemplate.types'

import {
  buildProvidersWrapper,
  createMockConfig,
  createTestQueryClient,
} from '../../../../helpers/test-utils'

import type { LiteClient } from 'algoliasearch/lite'
import type { ReactNode } from 'react'

type TestValues = { objectID: string; name: string; price?: number }

const extractor = ((hit: Record<string, unknown>) => {return {
  objectID: String(hit.objectID),
  name: String(hit.name ?? ''),
  price: typeof hit.price === 'number' ? hit.price : undefined,
}}) as unknown as HitExtractor<TestValues, Record<string, never>>

const buildConfig = (
  overrides: Record<string, unknown> = {},
): VerticalConfig =>
  createMockConfig({
    algolia: {
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      primaryIndex: { name: 'test_index', template: {} },
      indices: {},
      ...overrides,
    },
  } as Partial<VerticalConfig>)

const renderSingleIndexSearch = (
  searchResults: Record<string, unknown>[],
  {
    config = buildConfig(),
    queryOptions,
  }: {
    config?: VerticalConfig
    queryOptions?: { filters?: string }
  } = {},
) => {
  const searchClient = {
    search: vi.fn().mockResolvedValue({ results: searchResults }),
  }
  const store = createStore()
  store.set(activeConfigAtom, config)
  store.set(baseSearchClientAtom, searchClient as unknown as LiteClient)
  const queryClient = createTestQueryClient()
  const { result } = renderHook(
    () => useSingleIndexSearch({ extractor, queryOptions }),
    {
      wrapper: buildProvidersWrapper({ store, queryClient }).Wrapper,
    },
  )

  return { result, searchClient, queryClient }
}

const runSearch = async (
  search: ReturnType<typeof useSingleIndexSearch>,
  queries: Parameters<ReturnType<typeof useSingleIndexSearch>>[0],
) => {
  let response: unknown
  await act(async () => {
    response = await search(queries)
  })
  return response as { summaries: unknown }
}

describe('useSingleIndexSearch', () => {
  it('shapes one request per query, joining agent and baseline filters', async () => {
    const { result, searchClient } = renderSingleIndexSearch(
      [
        { hits: [{ objectID: 'p1', name: 'Shoe' }] },
        { hits: [{ objectID: 'p2', name: 'Boot' }] },
      ],
      { queryOptions: { filters: 'inStock:true' } },
    )

    await runSearch(result.current, [
      { query: 'shoes', filters: 'brand:"Adidas"' },
      { query: 'boots' },
    ])

    expect(searchClient.search).toHaveBeenCalledTimes(1)
    expect(searchClient.search.mock.calls[0][0]).toEqual([
      {
        indexName: 'test_index',
        query: 'shoes',
        params: { clickAnalytics: true, hitsPerPage: 10, filters: 'brand:"Adidas" AND inStock:true' },
      },
      {
        indexName: 'test_index',
        query: 'boots',
        params: { clickAnalytics: true, hitsPerPage: 10, filters: 'inStock:true' },
      },
    ])
  })

  it('returns no summaries and issues no request without a template', async () => {
    const config = createMockConfig({
      algolia: {
        appId: 'APP_ID',
        apiKey: 'API_KEY',
        primaryIndex: { name: 'test_index' },
        indices: {},
      },
    } as Partial<VerticalConfig>)
    const { result, searchClient } = renderSingleIndexSearch(
      [{ hits: [{ objectID: 'p1' }] }],
      { config },
    )

    await expect(runSearch(result.current, [{ query: 'shoes' }])).resolves.toEqual({
      summaries: [],
    })
    expect(searchClient.search).not.toHaveBeenCalled()
  })

  it('returns no summaries and issues no request for empty queries', async () => {
    const { result, searchClient } = renderSingleIndexSearch([
      { hits: [{ objectID: 'p1' }] },
    ])

    await expect(runSearch(result.current, [])).resolves.toEqual({
      summaries: [],
    })
    expect(searchClient.search).not.toHaveBeenCalled()
  })

  it('seeds the default ["product"] cache key with the extracted values', async () => {
    const { result, queryClient } = renderSingleIndexSearch([
      { hits: [{ objectID: 'p1', name: 'Trail Runner', price: 89 }] },
    ])

    await runSearch(result.current, [{ query: 'shoes' }])

    expect(queryClient.getQueryData(['product', 'p1'])).toEqual({
      objectID: 'p1',
      name: 'Trail Runner',
      price: 89,
    })
  })

  it('carries the response queryID and 1-based position into the summaries', async () => {
    const { result } = renderSingleIndexSearch([
      {
        queryID: 'q-abc',
        hits: [
          { objectID: 'p1', name: 'Trail Runner', price: 89 },
          { objectID: 'p2', name: 'Road Shoe' },
        ],
      },
    ])

    await expect(
      runSearch(result.current, [{ query: 'shoes' }]),
    ).resolves.toEqual({
      summaries: [
        {
          objectID: 'p1',
          name: 'Trail Runner',
          price: 89,
          queryID: 'q-abc',
          position: 1,
        },
        {
          objectID: 'p2',
          name: 'Road Shoe',
          price: null,
          queryID: 'q-abc',
          position: 2,
        },
      ],
    })
  })

  it('omits the queryID when the response carries none', async () => {
    const { result } = renderSingleIndexSearch([
      { hits: [{ objectID: 'p1', name: 'Trail Runner' }] },
    ])

    await expect(
      runSearch(result.current, [{ query: 'shoes' }]),
    ).resolves.toEqual({
      summaries: [
        { objectID: 'p1', name: 'Trail Runner', price: null, position: 1 },
      ],
    })
  })

  it('drops malformed hit attribution at the boundary', async () => {
    const { result } = renderSingleIndexSearch([
      {
        queryID: 'q-abc',
        hits: [
          {
            objectID: 'p1',
            name: 'Trail Runner',
            __queryID: 42,
            __position: '3',
          },
        ],
      },
    ])

    await expect(
      runSearch(result.current, [{ query: 'shoes' }]),
    ).resolves.toEqual({
      summaries: [
        {
          objectID: 'p1',
          name: 'Trail Runner',
          price: null,
          queryID: 'q-abc',
          position: 1,
        },
      ],
    })
  })
})
