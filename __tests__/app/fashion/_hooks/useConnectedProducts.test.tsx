import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useConnectedProducts } from '@/app/fashion/_hooks/useConnectedProducts'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

import type { LiteClient } from 'algoliasearch/lite'

const PRODUCT_IDS = ['M0E20000000DU05', 'M0E20000000EXIQ', 'A0E200000002EAN']

const renderConnectedProducts = (
  productIds: string[],
  searchClient: LiteClient | null,
) => {
  const store = createTestStore((s) => {
    s.set(searchClientAtom, searchClient)
    s.set(searchClientKeyAtom, 'standard')
  })
  const { Wrapper } = buildProvidersWrapper({ store })

  return {
    store,
    ...renderHook(() => useConnectedProducts(productIds), {
      wrapper: Wrapper,
    }),
  }
}

describe('useConnectedProducts', () => {
  it('issues one objectID-filtered query per id against the products index', async () => {
    const search = vi.fn().mockResolvedValue({
      results: PRODUCT_IDS.map((objectID) => {return { hits: [{ objectID }] }}),
    })
    const searchClient = createMockSearchClient({ search })

    const { result } = renderConnectedProducts(PRODUCT_IDS, searchClient)

    await waitFor(() => expect(result.current.products).toHaveLength(3))

    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'fashion_ns',
        params: { filters: 'objectID:"M0E20000000DU05"', hitsPerPage: 5 },
      },
      {
        indexName: 'fashion_ns',
        params: { filters: 'objectID:"M0E20000000EXIQ"', hitsPerPage: 5 },
      },
      {
        indexName: 'fashion_ns',
        params: { filters: 'objectID:"A0E200000002EAN"', hitsPerPage: 5 },
      },
    ])
  })

  it('selects requested products when Composition injects hits first', async () => {
    const search = vi.fn().mockResolvedValue({
      results: PRODUCT_IDS.map((objectID) => {return {
        hits: [{ objectID: `injected-${objectID}` }, { objectID }],
      }}),
    })

    const { result } = renderConnectedProducts(
      PRODUCT_IDS,
      createMockSearchClient({ search }),
    )

    await waitFor(() => expect(result.current.products).toHaveLength(3))

    expect(result.current.products.map((hit) => hit.objectID)).toEqual(
      PRODUCT_IDS,
    )
  })

  it('preserves the editorial order of related_products', async () => {
    const search = vi.fn().mockResolvedValue({
      results: PRODUCT_IDS.map((objectID) => {return { hits: [{ objectID }] }}),
    })

    const { result } = renderConnectedProducts(
      PRODUCT_IDS,
      createMockSearchClient({ search }),
    )

    await waitFor(() => expect(result.current.products).toHaveLength(3))

    expect(result.current.products.map((hit) => hit.objectID)).toEqual(
      PRODUCT_IDS,
    )
  })

  it('skips ids that no longer resolve instead of yielding empty hits', async () => {
    const search = vi.fn().mockResolvedValue({
      results: [
        { hits: [{ objectID: 'M0E20000000DU05' }] },
        { hits: [] },
        { hits: [{ objectID: 'A0E200000002EAN' }] },
      ],
    })

    const { result } = renderConnectedProducts(
      PRODUCT_IDS,
      createMockSearchClient({ search }),
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.products.map((hit) => hit.objectID)).toEqual([
      'M0E20000000DU05',
      'A0E200000002EAN',
    ])
  })

  it('stays idle with no ids rather than reporting a perpetual load', () => {
    const search = vi.fn()

    const { result } = renderConnectedProducts(
      [],
      createMockSearchClient({ search }),
    )

    expect(search).not.toHaveBeenCalled()
    expect(result.current.products).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  // Swapping the client changes no search parameter, so its identity is the only
  // thing that can invalidate these products when the composition toggle moves.
  it('refetches when the installed search client swaps pipelines', async () => {
    const search = vi.fn().mockResolvedValue({
      results: PRODUCT_IDS.map((objectID) => {return { hits: [{ objectID }] }}),
    })

    const { result, store } = renderConnectedProducts(
      PRODUCT_IDS,
      createMockSearchClient({ search }),
    )

    await waitFor(() => expect(result.current.products).toHaveLength(3))
    expect(search).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
  })

  it('stays idle until the search client is available', () => {
    const { result } = renderConnectedProducts(PRODUCT_IDS, null)

    expect(result.current.products).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })
})
