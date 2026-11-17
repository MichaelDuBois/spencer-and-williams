import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useNoResultsRecovery } from '@/hooks/useNoResultsRecovery'
import { activeConfigAtom } from '@/stores/activeConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'

import { createTestStore } from '../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '../helpers/test-utils'

const searchMock = vi.fn()
const searchForFacetsMock = vi.fn()

const renderRecoveryHook = () => {
  const store = createTestStore((state) => {
    state.set(
      activeConfigAtom,
      createMockConfig({
        algolia: {
          appId: 'APP_ID',
          apiKey: 'API_KEY',
          primaryIndex: {
            name: 'products',
            facets: [
              {
                attribute: ['categories.lvl0', 'categories.lvl1'],
                label: 'Category',
                type: 'hierarchical',
              },
            ],
          },
          indices: { querySuggestions: { name: 'suggestions' } },
        },
        merchandising: {
          categoryAttribute: 'categoryPageId',
          nestedSeparator: ' > ',
        },
        navigation: [{ category: 'Shoes', label: 'Footwear' }],
      }),
    )
    state.set(
      baseSearchClientAtom,
      createMockSearchClient({
        search: searchMock,
        searchForFacets: searchForFacetsMock,
      }),
    )
  })

  return renderHook(
    () =>
      useNoResultsRecovery({
        query: 'red shoes',
        enabled: true,
        enableSuggestions: true,
        enableCategories: true,
      }),
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )
}

describe('useNoResultsRecovery', () => {
  beforeEach(() => {
    searchMock.mockReset()
    searchForFacetsMock.mockReset()
  })

  it('excludes the failed query and falls back to known categories', async () => {
    searchMock.mockResolvedValue({
      results: [{ hits: [{ query: 'red shoes' }, { query: 'running shoes' }] }],
    })
    searchForFacetsMock
      .mockResolvedValueOnce({ results: [{ facetHits: [] }] })
      .mockResolvedValueOnce({
        results: [{ facetHits: [{ value: 'Unknown' }, { value: 'Shoes' }] }],
      })

    const { result } = renderRecoveryHook()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchMock).toHaveBeenCalledWith([
      expect.objectContaining({
        indexName: 'suggestions',
        params: expect.objectContaining({
          query: 'red shoes',
          removeWordsIfNoResults: 'allOptional',
        }),
      }),
    ])
    expect(searchForFacetsMock).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([
        expect.objectContaining({ facet: 'categories.lvl0' }),
      ]),
    )
    expect(searchForFacetsMock).toHaveBeenNthCalledWith(
      2,
      expect.arrayContaining([
        expect.objectContaining({ facetQuery: '', indexName: 'products' }),
      ]),
    )
    expect(result.current.data).toEqual({
      suggestions: ['running shoes'],
      categories: ['Shoes'],
    })
  })

  it('keeps categories when the suggestions request fails', async () => {
    searchMock.mockRejectedValue(new Error('suggestions unavailable'))
    searchForFacetsMock.mockResolvedValue({
      results: [{ facetHits: [{ value: 'Shoes' }] }],
    })

    const { result } = renderRecoveryHook()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      suggestions: [],
      categories: ['Shoes'],
    })
  })

  it('uses popular categories when the matching facet request fails', async () => {
    searchMock.mockResolvedValue({ results: [{ hits: [] }] })
    searchForFacetsMock
      .mockRejectedValueOnce(new Error('facet matching unavailable'))
      .mockResolvedValueOnce({
        results: [{ facetHits: [{ value: 'Shoes' }] }],
      })

    const { result } = renderRecoveryHook()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.categories).toEqual(['Shoes'])
  })

  it('returns no categories when the fallback request fails', async () => {
    searchMock.mockResolvedValue({ results: [{ hits: [] }] })
    searchForFacetsMock
      .mockResolvedValueOnce({ results: [{ facetHits: [] }] })
      .mockRejectedValueOnce(new Error('facet fallback unavailable'))

    const { result } = renderRecoveryHook()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.categories).toEqual([])
  })

  it('does not call suggestion APIs for an empty query', () => {
    const store = createTestStore()
    const { result } = renderHook(
      () =>
        useNoResultsRecovery({
          query: ' ',
          enabled: true,
          enableSuggestions: true,
          enableCategories: true,
        }),
      { wrapper: buildProvidersWrapper({ store }).Wrapper },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(searchMock).not.toHaveBeenCalled()
    expect(searchForFacetsMock).not.toHaveBeenCalled()
  })
})
