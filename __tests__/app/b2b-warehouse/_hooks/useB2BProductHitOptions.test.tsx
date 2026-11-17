import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import { ProductPageShell } from '@/components/pdp/ProductPageShell'
import { useGetRawHit } from '@/hooks/useGetRawHit'
import { useProductStoreAvailability } from '@/hooks/useProductStoreAvailability'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  personalizationStore,
  setPersonaModeAtom,
} from '@/stores/personalization'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import { selectedStoreAtom, selectedStoreStore } from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const route = vi.hoisted(() => {return { query: 'productId=A' }})

vi.mock('next/navigation', () => {
  return {
    useParams: () => {
      return { id: 'A' }
    },
    useRouter: () => {
      return { back: vi.fn(), push: vi.fn() }
    },
    useSearchParams: () => new URLSearchParams(route.query),
  }
})

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
    s.set(searchClientAtom, createMockSearchClient({ search }))
    s.set(searchClientKeyAtom, 'standard')
  })
  personalizationStore.set(setPersonaModeAtom, GROUP_0)
  selectedStoreStore.set(selectedStoreAtom, {
    vertical: CONFIG.slug,
    storeId: '1',
  })
  return { search, ...buildProvidersWrapper({ store }) }
}

const useProductHit = (
  objectID: string,
  options: { indexName?: string } = {},
) => {
  const queryOptions = useB2BProductHitOptions()
  return useGetRawHit(objectID, { ...queryOptions, ...options })
}

describe('useB2BProductHitOptions', () => {
  beforeEach(() => {
    route.query = 'productId=A'
  })

  it('uses the URL warehouse in the initial product lookup', async () => {
    route.query = 'productId=A&storeId=2'
    const { Wrapper, search } = setup()
    selectedStoreStore.set(selectedStoreAtom, null)
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'products',
        params: {
          filters:
            'objectID:"A" AND visible_by:"customer_group_0" AND availableInStores.objectID:"2"',
          hitsPerPage: 5,
        },
      },
    ])
  })

  it('restricts the shared product page and removes the product after a group switch', async () => {
    const { Wrapper, store } = setup()
    const Page = () => {
      const queryOptions = useB2BProductHitOptions()
      return (
        <ProductPageShell
          config={{
            slug: 'b2b-warehouse',
            algolia: { primaryIndex: { template: {} } },
          }}
          queryOptions={queryOptions}
          extractor={(raw) => {
            return {
              objectID: raw.objectID,
              name: 'Eligible drill',
              productUrl: '/b2b-warehouse/product/A',
            }
          }}>
          {(product) => <div>{product.name}</div>}
        </ProductPageShell>
      )
    }
    render(<Page />, { wrapper: Wrapper })
    await waitFor(() =>
      expect(screen.getByText('Eligible drill')).toBeInTheDocument(),
    )
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    expect(screen.queryByText('Eligible drill')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('Product not found')).toBeInTheDocument(),
    )
  })

  it('restricts product availability without applying policy to location lookups', async () => {
    const { Wrapper, store, search } = setup()
    const { result } = renderHook(
      () => useProductStoreAvailability(useB2BProductHitOptions()),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.allowedStoreIds).toEqual(['1']))
    expect(search).toHaveBeenLastCalledWith([
      {
        indexName: 'products',
        params: {
          filters:
            'objectID:"A" AND visible_by:"customer_group_0" AND availableInStores.objectID:"1"',
          hitsPerPage: 5,
        },
      },
    ])
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    expect(result.current.allowedStoreIds).toEqual([])
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.product).toBeNull()
  })

  it('blocks invalid group configuration without fetching an unrestricted product', async () => {
    const { Wrapper, search, store } = setup()
    personalizationStore.set(setPersonaModeAtom, { ...GROUP_0, discount: NaN })
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(search).not.toHaveBeenCalled()
  })

  it('does not replace the current result with a late response from the previous group', async () => {
    const { Wrapper, search, store } = setup()
    const pending = Promise.withResolvers<{
      results: { hits: (typeof PRODUCT)[] }[]
    }>()
    search.mockReturnValueOnce(pending.promise)
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })
    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    search.mockResolvedValue({ results: [{ hits: [] }] })
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    await waitFor(() => expect(result.current.data).toBeNull())
    await act(async () => pending.resolve({ results: [{ hits: [PRODUCT] }] }))
    expect(result.current.data).toBeNull()
  })

  it('exposes request errors without retrying with unrestricted filters', async () => {
    const { Wrapper, search } = setup()
    search.mockRejectedValue(new Error('Unavailable'))
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
    expect(search).toHaveBeenCalledOnce()
  })
  it.each([undefined, 'products_price'])(
    'restricts direct product access on index %s',
    async (indexName) => {
      const { Wrapper, search } = setup()
      const { result } = renderHook(() => useProductHit('A', { indexName }), {
        wrapper: Wrapper,
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(search).toHaveBeenCalledWith([
        {
          indexName: indexName ?? 'products',
          params: {
            filters:
              'objectID:"A" AND visible_by:"customer_group_0" AND availableInStores.objectID:"1"',
            hitsPerPage: 5,
          },
        },
      ])
      expect(result.current.data).toEqual(PRODUCT)
    },
  )

  it('does not reuse a cached product after switching groups', async () => {
    const { Wrapper, search, store } = setup()
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })
    await waitFor(() => expect(result.current.data).toEqual(PRODUCT))
    search.mockResolvedValue({ results: [{ hits: [] }] })
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    expect(result.current.data).not.toEqual(PRODUCT)
    await waitFor(() => expect(result.current.data).toBeNull())
    expect(search).toHaveBeenLastCalledWith([
      {
        indexName: 'products',
        params: {
          filters:
            'objectID:"A" AND visible_by:"customer_group_1" AND availableInStores.objectID:"1"',
          hitsPerPage: 5,
        },
      },
    ])
  })

  it('keeps warehouse filtering without a selected group', async () => {
    const { Wrapper, search, store } = setup()
    personalizationStore.set(setPersonaModeAtom, null)
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })
    await waitFor(() => expect(result.current.data).toEqual(PRODUCT))
    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'products',
        params: {
          filters: 'objectID:"A" AND availableInStores.objectID:"1"',
          hitsPerPage: 5,
        },
      },
    ])
  })

  it('does not expose a product returned despite its eligibility restrictions', async () => {
    const { Wrapper, store } = setup()
    personalizationStore.set(setPersonaModeAtom, GROUP_1)
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('refetches after the warehouse or installed search client changes', async () => {
    const { Wrapper, store, search } = setup()
    const { result } = renderHook(() => useProductHit('A'), {
      wrapper: Wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    search.mockResolvedValue({ results: [{ hits: [] }] })
    act(() =>
      selectedStoreStore.set(selectedStoreAtom, {
        vertical: CONFIG.slug,
        storeId: '2',
      }),
    )
    await waitFor(() => expect(result.current.data).toBeNull())
    const compositionSearch = vi
      .fn()
      .mockResolvedValue({ results: [{ hits: [] }] })
    act(() => {
      store.set(
        searchClientAtom,
        createMockSearchClient({ search: compositionSearch }),
      )
      store.set(searchClientKeyAtom, 'composition')
    })
    await waitFor(() => expect(compositionSearch).toHaveBeenCalledOnce())
  })

  describe('ignoreWarehouse', () => {
    const PRODUCT_AT_OTHER_WAREHOUSE = {
      objectID: 'A',
      visible_by: [GROUP_0.groupId],
      availableInStores: [{ objectID: '2', inStock: true }],
    }

    it('scopes the lookup to the customer group without the selected warehouse', () => {
      const { Wrapper } = setup()
      const { result } = renderHook(
        () => useB2BProductHitOptions({ ignoreWarehouse: true }),
        { wrapper: Wrapper },
      )
      expect(result.current.filters).toBe('visible_by:"customer_group_0"')
      expect(result.current.enabled).toBe(true)
    })

    it('keeps the group and warehouse scope by default', () => {
      const { Wrapper } = setup()
      const { result } = renderHook(() => useB2BProductHitOptions(), {
        wrapper: Wrapper,
      })
      expect(result.current.filters).toBe(
        'visible_by:"customer_group_0" AND availableInStores.objectID:"1"',
      )
    })

    it('accepts a product stocked only at another warehouse but not one hidden from the group', () => {
      const { Wrapper } = setup()
      const { result } = renderHook(
        () => useB2BProductHitOptions({ ignoreWarehouse: true }),
        { wrapper: Wrapper },
      )
      expect(result.current.isHitValid?.(PRODUCT_AT_OTHER_WAREHOUSE)).toBe(true)
      expect(
        result.current.isHitValid?.({
          ...PRODUCT_AT_OTHER_WAREHOUSE,
          visible_by: [GROUP_1.groupId],
        }),
      ).toBe(false)
    })

    it('reports every warehouse carrying the product, not only the selected one', async () => {
      const { Wrapper, search } = setup()
      search.mockResolvedValue({
        results: [{ hits: [PRODUCT_AT_OTHER_WAREHOUSE] }],
      })
      const { result } = renderHook(
        () =>
          useProductStoreAvailability(
            useB2BProductHitOptions({ ignoreWarehouse: true }),
          ),
        { wrapper: Wrapper },
      )
      await waitFor(() => expect(result.current.allowedStoreIds).toEqual(['2']))
      expect(result.current.stockByStoreId).toEqual({ '2': true })
      expect(search).toHaveBeenCalledWith([
        {
          indexName: 'products',
          params: {
            filters: 'objectID:"A" AND visible_by:"customer_group_0"',
            hitsPerPage: 5,
          },
        },
      ])
    })

    it('still fails closed for an invalid policy', () => {
      const { Wrapper, store } = setup()
      personalizationStore.set(setPersonaModeAtom, {
        ...GROUP_0,
        discount: NaN,
      })
      const { result } = renderHook(
        () => useB2BProductHitOptions({ ignoreWarehouse: true }),
        { wrapper: Wrapper },
      )
      expect(result.current.enabled).toBe(false)
      expect(result.current.filters).toBe(
        'objectID:"__invalid_b2b_policy__" AND NOT objectID:"__invalid_b2b_policy__"',
      )
      expect(result.current.isHitValid?.(PRODUCT_AT_OTHER_WAREHOUSE)).toBe(
        false,
      )
    })
  })
})
