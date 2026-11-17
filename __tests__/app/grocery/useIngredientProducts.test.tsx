import { act, renderHook, waitFor } from '@testing-library/react'
import { createStore } from 'jotai'
import { describe, expect, it, vi } from 'vitest'

import { useIngredientProducts } from '@/app/grocery/_hooks/useIngredientProducts'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'

import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '../../helpers/test-utils'

const CANNED_HITS = [
  {
    objectID: 'p1',
    name: 'Whole Milk',
    image: 'milk.jpg',
    price: 3.49,
    brand: 'Farm Fresh',
    type: 'whole_milk',
  },
  {
    objectID: 'p2',
    name: 'Skim Milk',
    image: 'skim.jpg',
    price: 2.99,
    brand: 'Farm Fresh',
    type: 'skim_milk',
  },
]

const renderWithClient = (ingredient: string, client = createMockSearchClient()) => {
  const store = createStore()
  store.set(searchClientAtom, client)
  store.set(searchClientKeyAtom, 'standard')
  const { Wrapper } = buildProvidersWrapper({ store })
  return {
    client,
    store,
    ...renderHook(() => useIngredientProducts(ingredient), { wrapper: Wrapper }),
  }
}

describe('useIngredientProducts', () => {
  it('queries the grocery product index (with clickAnalytics) and returns raw hits tagged with query metadata', async () => {
    const client = createMockSearchClient({
      search: vi.fn().mockResolvedValue({
        results: [{ hits: CANNED_HITS, queryID: 'q123' }],
      }),
    })
    const { result } = renderWithClient('milk', client)

    await waitFor(() => expect(result.current.products).toHaveLength(2))

    expect(client.search).toHaveBeenCalledWith([
      {
        indexName: 'grocery_prod_ns',
        params: { query: 'milk', hitsPerPage: 10, clickAnalytics: true },
      },
    ])

    expect(result.current.products[0]).toMatchObject({
      objectID: 'p1',
      name: 'Whole Milk',
      price: 3.49,
      brand: 'Farm Fresh',
      __queryID: 'q123',
      __position: 1,
    })
    expect(result.current.products[1]).toMatchObject({
      objectID: 'p2',
      __position: 2,
    })
  })

  // Swapping the client changes no search parameter, so its identity is the only
  // thing that can invalidate these products when the composition toggle moves.
  it('refetches when the installed search client swaps pipelines', async () => {
    const search = vi.fn().mockResolvedValue({
      results: [{ hits: CANNED_HITS, queryID: 'q123' }],
    })
    const { result, store } = renderWithClient(
      'milk',
      createMockSearchClient({ search }),
    )

    await waitFor(() => expect(result.current.products).toHaveLength(2))
    expect(search).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
  })

  it('is disabled (no search) when the ingredient is empty', async () => {
    const { result, client } = renderWithClient('   ')

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(client.search).not.toHaveBeenCalled()
    expect(result.current.products).toEqual([])
  })

  it('is disabled when there is no search client', async () => {
    const store = createStore()
    const { Wrapper } = buildProvidersWrapper({ store })
    const { result } = renderHook(() => useIngredientProducts('milk'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.products).toEqual([])
  })
})
