import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useFashionArticles } from '@/app/fashion/_hooks/useFashionArticles'
import { searchClientAtom } from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

import type { LiteClient } from 'algoliasearch/lite'

type SearchRequest = { indexName: string; params: Record<string, unknown> }

const CARD_ATTRIBUTES = [
  'objectID',
  'title',
  'category',
  'reading_time',
  'thumbnail_image',
  'banner_image',
]

const buildHit = (objectID: string) => {
  return {
    objectID,
    title: `Article ${objectID}`,
    category: 'Styling Guide',
    reading_time: 5,
    thumbnail_image: `https://cdn.example.com/${objectID}.jpg`,
  }
}

const renderArticles = (
  hits: Record<string, unknown>[],
  {
    key = 'journal-articles',
    count = 3,
    filters,
    enabled,
    searchClient = createMockSearchClient({
      search: vi.fn().mockResolvedValue({ results: [{ hits }] }),
    }) as LiteClient | null,
  }: {
    key?: string
    count?: number
    filters?: string
    enabled?: boolean
    searchClient?: LiteClient | null
  } = {},
) => {
  const store = createTestStore((s) => s.set(searchClientAtom, searchClient))
  const { Wrapper } = buildProvidersWrapper({ store })

  return {
    searchClient,
    ...renderHook(
      () => useFashionArticles({ key, count, filters, enabled }),
      { wrapper: Wrapper },
    ),
  }
}

describe('useFashionArticles', () => {
  it('asks Algolia for only the articles it renders', async () => {
    const { searchClient, result } = renderArticles([buildHit('a')], {
      count: 2,
    })

    await waitFor(() => expect(result.current.articles).toHaveLength(1))

    expect(searchClient?.search).toHaveBeenCalledWith([
      {
        indexName: 'fashion_articles',
        params: {
          hitsPerPage: 2,
          attributesToRetrieve: CARD_ATTRIBUTES,
          attributesToHighlight: [],
        },
      },
    ])
  })

  it('omits the filters param entirely when no filter is passed', async () => {
    let requests: SearchRequest[] = []
    const searchClient = createMockSearchClient({
      search: vi.fn((args: SearchRequest[]) => {
        requests = args
        return Promise.resolve({ results: [{ hits: [buildHit('a')] }] })
      }),
    })
    const store = createTestStore((s) => s.set(searchClientAtom, searchClient))
    const { Wrapper } = buildProvidersWrapper({ store })

    const { result } = renderHook(
      () => useFashionArticles({ key: 'journal-articles', count: 3 }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.articles).toHaveLength(1))

    expect(requests[0].params).not.toHaveProperty('filters')
  })

  it('passes a filter expression through to the search', async () => {
    const { searchClient, result } = renderArticles([buildHit('a')], {
      key: 'product-articles',
      filters: 'related_products:"M0E20000000DU05"',
    })

    await waitFor(() => expect(result.current.articles).toHaveLength(1))

    expect(searchClient?.search).toHaveBeenCalledWith([
      {
        indexName: 'fashion_articles',
        params: {
          filters: 'related_products:"M0E20000000DU05"',
          hitsPerPage: 3,
          attributesToRetrieve: CARD_ATTRIBUTES,
          attributesToHighlight: [],
        },
      },
    ])
  })

  it('preserves the order Algolia returned so hit positions stay accurate', async () => {
    const { result } = renderArticles([
      buildHit('third-in-index'),
      buildHit('first-in-index'),
      buildHit('second-in-index'),
    ])

    await waitFor(() => expect(result.current.articles).toHaveLength(3))

    expect(result.current.articles.map((a) => a.objectID)).toEqual([
      'third-in-index',
      'first-in-index',
      'second-in-index',
    ])
  })

  it('extracts article values so cards link through to the article route', async () => {
    const { result } = renderArticles([buildHit('zip-and-puff')])

    await waitFor(() => expect(result.current.articles).toHaveLength(1))

    expect(result.current.articles[0]).toMatchObject({
      title: 'Article zip-and-puff',
      category: 'Styling Guide',
      readingTime: 5,
      productUrl: '/fashion/article/zip-and-puff',
      thumbnail: 'https://cdn.example.com/zip-and-puff.jpg',
    })
  })

  it('caches separately per filter so one product cannot serve another', async () => {
    const searchClient = createMockSearchClient({
      search: vi.fn().mockResolvedValue({ results: [{ hits: [buildHit('a')] }] }),
    })
    const store = createTestStore((s) => s.set(searchClientAtom, searchClient))
    const { Wrapper, queryClient } = buildProvidersWrapper({ store })

    const first = renderHook(
      () =>
        useFashionArticles({
          key: 'product-articles',
          count: 3,
          filters: 'related_products:"one"',
        }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(first.result.current.articles).toHaveLength(1))

    renderHook(
      () =>
        useFashionArticles({
          key: 'product-articles',
          count: 3,
          filters: 'related_products:"two"',
        }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(2))
    expect(queryClient.getQueryData(['product-articles', 'fashion', 'fashion_articles', 3, 'related_products:"two"'])).toBeDefined()
  })

  it('returns no articles when the search comes back empty', async () => {
    const { searchClient, result } = renderArticles([])

    await waitFor(() => expect(searchClient?.search).toHaveBeenCalled())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.articles).toEqual([])
  })

  it('returns a stable empty array so callers can memoise off it', () => {
    const { result, rerender } = renderArticles([], { searchClient: null })
    const firstRender = result.current.articles

    rerender()

    expect(result.current.articles).toBe(firstRender)
  })

  it('stays idle until the search client is available', () => {
    const { result } = renderArticles([], { searchClient: null })

    expect(result.current.articles).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('stays idle when the caller disables it', () => {
    const { searchClient, result } = renderArticles([buildHit('a')], {
      key: 'product-articles',
      enabled: false,
    })

    expect(result.current.articles).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(searchClient?.search).not.toHaveBeenCalled()
  })
})
