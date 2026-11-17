import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGetRawHit } from '@/hooks/useGetRawHit'
import { activeConfigAtom } from '@/stores/activeConfig'
import { setPersonaModeAtom } from '@/stores/personalization'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import { selectedStoreAtom } from '@/stores/selectedStore'

import { GROUP_0 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const PRODUCT = {
  objectID: 'A',
  visible_by: [GROUP_0.groupId],
  availableInStores: [{ objectID: '1' }],
}
const CONFIG = createMockConfig({
  slug: 'b2b-warehouse',
  algolia: {
    appId: 'APP_ID',
    apiKey: 'API_KEY',
    primaryIndex: {
      name: 'products',
      replicas: [{ label: 'Price', indexName: 'products_price' }],
    },
    indices: { locations: { name: 'locations' } },
  },
})

const setup = () => {
  const search = vi.fn().mockResolvedValue({ results: [{ hits: [PRODUCT] }] })
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, CONFIG)
    s.set(setPersonaModeAtom, GROUP_0)
    s.set(selectedStoreAtom, { vertical: CONFIG.slug, storeId: '1' })
    s.set(searchClientAtom, createMockSearchClient({ search }))
    s.set(searchClientKeyAtom, 'standard')
  })
  return { search, ...buildProvidersWrapper({ store }) }
}

describe('useGetRawHit', () => {
  it('does not infer product policy from the active vertical or persona', async () => {
    const { Wrapper, search } = setup()
    const { result } = renderHook(() => useGetRawHit('A'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'products',
        params: { filters: 'objectID:"A"', hitsPerPage: 5 },
      },
    ])
  })

  it('leaves other verticals unrestricted by B2B selections', async () => {
    const { Wrapper, search, store } = setup()
    store.set(activeConfigAtom, { ...CONFIG, slug: 'ecommerce' })
    const { result } = renderHook(() => useGetRawHit('A'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.data).toEqual(PRODUCT))
    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'products',
        params: { filters: 'objectID:"A"', hitsPerPage: 5 },
      },
    ])
  })

  it('leaves location lookups unrestricted', async () => {
    const { Wrapper, search } = setup()
    const { result } = renderHook(
      () => useGetRawHit('1', { indexName: 'locations' }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'locations',
        params: { filters: 'objectID:"1"', hitsPerPage: 5 },
      },
    ])
  })

  it('combines caller filters with the object ID and separates cached scopes', async () => {
    const { Wrapper, search } = setup()
    const { result, rerender } = renderHook(
      ({ filters }) => useGetRawHit('A', { filters }),
      { wrapper: Wrapper, initialProps: { filters: 'brand:"One"' } },
    )
    await waitFor(() => expect(result.current.data).toEqual(PRODUCT))
    expect(search).toHaveBeenLastCalledWith([
      {
        indexName: 'products',
        params: { filters: 'objectID:"A" AND brand:"One"', hitsPerPage: 5 },
      },
    ])
    search.mockResolvedValue({ results: [{ hits: [] }] })
    rerender({ filters: 'brand:"Two"' })
    expect(result.current.data).toBeUndefined()
    await waitFor(() => expect(result.current.data).toBeNull())
    expect(search).toHaveBeenLastCalledWith([
      {
        indexName: 'products',
        params: { filters: 'objectID:"A" AND brand:"Two"', hitsPerPage: 5 },
      },
    ])
  })

  it('validates cached data with the current caller predicate', async () => {
    const { Wrapper, search } = setup()
    const { result, rerender } = renderHook(
      ({ acceptsHit }) => useGetRawHit('A', { isHitValid: () => acceptsHit }),
      { wrapper: Wrapper, initialProps: { acceptsHit: true } },
    )
    await waitFor(() => expect(result.current.data).toEqual(PRODUCT))
    rerender({ acceptsHit: false })
    expect(result.current.data).toBeNull()
    expect(search).toHaveBeenCalledOnce()
  })

  it('does not fetch when disabled', () => {
    const { Wrapper, search } = setup()
    const { result } = renderHook(() => useGetRawHit('A', { enabled: false }), {
      wrapper: Wrapper,
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(search).not.toHaveBeenCalled()
  })

  it('rejects a response containing a different object ID', async () => {
    const { Wrapper } = setup()
    const { result } = renderHook(() => useGetRawHit('B'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.data).toBeNull())
  })
})

const searchMock = vi.fn()

const buildStore = () =>
  createTestStore((store) => {
    store.set(activeConfigAtom, createMockConfig({ slug: 'ecommerce' }))
    store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
    store.set(searchClientKeyAtom, 'standard')
  })

const renderRawHit = (
  store: ReturnType<typeof buildStore>,
  options: Parameters<typeof useGetRawHit>[1] = {},
) =>
  renderHook(() => useGetRawHit('p1', options), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })

describe('useGetRawHit', () => {
  beforeEach(() => {
    searchMock.mockReset()
    searchMock.mockResolvedValue({
      results: [{ hits: [{ objectID: 'p1', name: 'Test Product' }] }],
    })
  })

  it("fetches the record from the active config's primary index", async () => {
    const { result } = renderRawHit(buildStore())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchMock).toHaveBeenCalledWith([
      {
        indexName: 'test_index',
        params: { filters: 'objectID:"p1"', hitsPerPage: 5 },
      },
    ])
    expect(result.current.data).toMatchObject({ objectID: 'p1' })
  })

  it('selects the requested record when Composition injects a hit first', async () => {
    searchMock.mockResolvedValue({
      results: [
        {
          hits: [
            { objectID: 'injected-promo', name: 'Pinned Promo' },
            { objectID: 'p1', name: 'Test Product' },
          ],
        },
      ],
    })

    const { result } = renderRawHit(buildStore())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toMatchObject({
      objectID: 'p1',
      name: 'Test Product',
    })
  })

  // Swapping the client changes no search parameter, so its identity is the only
  // thing that can invalidate this record when the composition toggle moves.
  it('refetches when the installed search client swaps pipelines', async () => {
    const store = buildStore()
    const { result } = renderRawHit(store)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchMock).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })

  // The key is folded in unconditionally, so an override index pays one extra
  // refetch rather than risking a stale composition response.
  it('refetches on a pipeline swap even for an explicit index override', async () => {
    const store = buildStore()
    const { result } = renderRawHit(store, { indexName: 'other_index' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchMock.mock.calls[0][0][0].indexName).toBe('other_index')

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })
})
