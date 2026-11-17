import { onlineManager } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useB2BCart } from '@/app/b2b-warehouse/_hooks/useB2BCart'
import { useB2BPrepareCartProduct } from '@/app/b2b-warehouse/_hooks/useB2BPrepareCartProduct'
import { useAddToCart } from '@/hooks/useAddToCart'
import { useCheckout } from '@/hooks/useCheckout'
import { activeConfigAtom } from '@/stores/activeConfig'
import { getCartAtom } from '@/stores/cart'
import { getOrderAtom } from '@/stores/order'
import { getOrderHistoryAtom } from '@/stores/orderHistory'
import {
  personalizationStore,
  setPersonaModeAtom,
} from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'
import { selectedStoreAtom, selectedStoreStore } from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const { push, insights } = vi.hoisted(() => {
  return { push: vi.fn(), insights: vi.fn() }
})
vi.mock('next/navigation', () => {
  return {
    useRouter: () => {
      return { push }
    },
  }
})
vi.mock('search-insights', () => {
  return { default: insights }
})

const PRODUCT = {
  objectID: 'A',
  name: 'Drill',
  price: '100',
  visible_by: [GROUP_0.groupId, GROUP_1.groupId],
  availableInStores: [{ objectID: '1' }],
}
const ITEM = { objectID: 'A', name: 'Legacy drill', price: 999, quantity: 2 }
const cartAtom = getCartAtom('b2b-warehouse')
const setup = (hasItems = true) => {
  const search = vi.fn().mockResolvedValue({ results: [{ hits: [PRODUCT] }] })
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    s.set(baseSearchClientAtom, createMockSearchClient({ search }))
    s.set(cartAtom, { items: hasItems ? [ITEM] : [], updatedAt: 1 })
  })
  personalizationStore.set(setPersonaModeAtom, GROUP_0)
  selectedStoreStore.set(selectedStoreAtom, {
    vertical: 'b2b-warehouse',
    storeId: '1',
  })
  return { search, ...buildProvidersWrapper({ store }) }
}

beforeEach(() => vi.clearAllMocks())

describe('B2B cart validation and checkout', () => {
  it('blocks pending checks, then snapshots net prices into order, history and Insights', async () => {
    const { Wrapper, store, search } = setup()
    const { result } = renderHook(
      () => {
        const cart = useB2BCart()
        return { cart, ...useCheckout('/b2b-warehouse', cart.checkoutOptions) }
      },
      { wrapper: Wrapper },
    )
    expect(result.current.canCheckout).toBe(false)
    act(() => result.current.checkout())
    expect(push).not.toHaveBeenCalled()
    await waitFor(() => expect(result.current.canCheckout).toBe(true))
    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'test_index',
        params: {
          hitsPerPage: 1,
          filters:
            'objectID:"A" AND visible_by:"customer_group_0" AND availableInStores.objectID:"1"',
        },
      },
    ])
    expect(store.get(cartAtom).items[0].price).toBe(999)
    await act(async () => {
      await result.current.checkout()
    })
    const order = store.get(getOrderAtom('b2b-warehouse'))
    expect(order).toMatchObject({
      total: 170,
      subtotal: 170,
      items: [
        { objectID: 'A', price: 85, basePrice: 100, discount: 15, quantity: 2 },
      ],
    })
    expect(
      store.get(getOrderHistoryAtom('b2b-warehouse'))[GROUP_0.id],
    ).toContainEqual(order)
    expect(insights).toHaveBeenCalledWith(
      'purchasedObjectIDs',
      expect.objectContaining({
        value: 170,
        objectData: [{ price: 85, quantity: 2, discount: 15 }],
        userToken: GROUP_0.token,
      }),
    )
    expect(store.get(cartAtom).items).toEqual([])
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    expect(order?.items[0].price).toBe(85)
  })

  it('revalidates the cart quote before creating an order', async () => {
    const { Wrapper, search, store } = setup()
    const { result } = renderHook(
      () => {
        const cart = useB2BCart()
        return { cart, ...useCheckout('/b2b-warehouse', cart.checkoutOptions) }
      },
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.canCheckout).toBe(true))
    search.mockResolvedValueOnce({
      results: [{ hits: [{ ...PRODUCT, price: '120' }] }],
    })

    await act(async () => {
      await result.current.checkout()
    })

    expect(search).toHaveBeenCalledTimes(2)
    expect(store.get(getOrderAtom('b2b-warehouse'))).toMatchObject({
      subtotal: 204,
      items: [{ objectID: 'A', price: 102, quantity: 2 }],
    })
  })

  it('rejects stale snapshots before React renders a selection or quantity change', async () => {
    const { Wrapper, store } = setup()
    const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
    await waitFor(() =>
      expect(result.current.checkoutOptions.canCheckout).toBe(true),
    )
    const oldSnapshot = result.current.checkoutOptions.getSnapshot
    act(() => {
      personalizationStore.set(setPersonaModeAtom, GROUP_1)
      expect(oldSnapshot()).toBeNull()
    })
    await waitFor(() => expect(result.current.quote.subtotalCents).toBe(14000))
    const nextSnapshot = result.current.checkoutOptions.getSnapshot
    act(() => {
      result.current.updateQuantity('A', 3)
      expect(nextSnapshot()).toBeNull()
    })
    expect(result.current.quote.subtotalCents).toBe(21000)
  })

  it('retains unavailable items after a warehouse change and allows removal', async () => {
    const { Wrapper, store } = setup()
    const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
    await waitFor(() =>
      expect(result.current.checkoutOptions.canCheckout).toBe(true),
    )
    act(() =>
      selectedStoreStore.set(selectedStoreAtom, {
        vertical: 'b2b-warehouse',
        storeId: '2',
      }),
    )
    expect(result.current.checkoutOptions.canCheckout).toBe(false)
    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.quote.lines[0].status).toBe('unavailable')
    expect(result.current.items).toHaveLength(1)
    expect(result.current.quote.subtotalCents).toBe(0)
    act(() => result.current.removeItem('A'))
    expect(result.current.items).toEqual([])
    expect(result.current.checkoutOptions.canCheckout).toBe(false)
  })

  it('keeps failures blocked and supports an explicit retry', async () => {
    const { Wrapper, search } = setup()
    search.mockRejectedValueOnce(new Error('Offline'))
    const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.checkoutOptions.getSnapshot()).toBeNull()
    expect(search).toHaveBeenCalledOnce()
    await act(async () => {
      await result.current.retry()
    })
    await waitFor(() =>
      expect(result.current.checkoutOptions.canCheckout).toBe(true),
    )
  })

  it('does not accept a late response from a previous group', async () => {
    const { Wrapper, search, store } = setup()
    const pending = Promise.withResolvers<{
      results: { hits: (typeof PRODUCT)[] }[]
    }>()
    search.mockReturnValueOnce(pending.promise)
    const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    search.mockResolvedValue({ results: [{ hits: [] }] })
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    await waitFor(() => expect(result.current.isReady).toBe(true))
    await act(async () => pending.resolve({ results: [{ hits: [PRODUCT] }] }))
    expect(result.current.quote.lines[0].status).toBe('unavailable')
    expect(result.current.checkoutOptions.getSnapshot()).toBeNull()
  })
})

describe('B2B add-to-cart preparation', () => {
  it('revalidates before storing base price and emitting a net-price event with quantity', async () => {
    const { Wrapper, store } = setup(false)
    const { result } = renderHook(
      () =>
        useAddToCart({
          surface: 'pdp',
          prepareProduct: useB2BPrepareCartProduct(),
        }),
      { wrapper: Wrapper },
    )
    act(() => result.current.setQuantity(3))
    await act(async () => result.current.addToCart(ITEM, { queryID: 'q1' }))
    expect(store.get(cartAtom).items).toEqual([
      expect.objectContaining({ price: 100, quantity: 3, queryID: 'q1' }),
    ])
    expect(insights).toHaveBeenCalledWith(
      'addedToCartObjectIDsAfterSearch',
      expect.objectContaining({
        value: 255,
        objectData: [{ price: 85, discount: 15, quantity: 3 }],
        queryID: 'q1',
      }),
    )
  })

  it.each(['ineligible', 'unpriced', 'failed'])(
    'does not add or emit an event for %s validation',
    async (failure) => {
      const { Wrapper, store, search } = setup(false)
      if (failure === 'failed') search.mockRejectedValue(new Error('Offline'))
      else
        search.mockResolvedValue({
          results: [
            {
              hits: [
                {
                  ...PRODUCT,
                  ...(failure === 'ineligible'
                    ? { visible_by: [] }
                    : { price: undefined }),
                },
              ],
            },
          ],
        })
      const { result } = renderHook(
        () =>
          useAddToCart({
            surface: 'pdp',
            prepareProduct: useB2BPrepareCartProduct(),
          }),
        { wrapper: Wrapper },
      )
      await act(async () => {
        await expect(result.current.addToCart(ITEM)).rejects.toThrow()
      })
      expect(store.get(cartAtom).items).toEqual([])
      expect(
        insights.mock.calls.filter(([event]) =>
          String(event).startsWith('addedToCart'),
        ),
      ).toEqual([])
    },
  )

  it('rejects pending additions after the customer group changes', async () => {
    const { Wrapper, store, search } = setup(false)
    const pending = Promise.withResolvers<{
      results: { hits: (typeof PRODUCT)[] }[]
    }>()
    search.mockReturnValueOnce(pending.promise)
    const { result } = renderHook(
      () =>
        useAddToCart({
          surface: 'pdp',
          prepareProduct: useB2BPrepareCartProduct(),
        }),
      { wrapper: Wrapper },
    )
    const adding = result.current.addToCart(ITEM)
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    await act(async () => {
      pending.resolve({ results: [{ hits: [PRODUCT] }] })
      await expect(adding).rejects.toThrow('selection changed')
    })
    expect(store.get(cartAtom).items).toEqual([])
    expect(
      insights.mock.calls.filter(([event]) =>
        String(event).startsWith('addedToCart'),
      ),
    ).toEqual([])
  })
})

it('rejects an addition still pending when the assistant session is reset', async () => {
  const { Wrapper, store, search } = setup(false)
  const controller = new AbortController()
  const pending = Promise.withResolvers<{
    results: { hits: (typeof PRODUCT)[] }[]
  }>()
  search.mockReturnValueOnce(pending.promise)
  const { result } = renderHook(
    () =>
      useAddToCart({
        surface: 'pdp',
        prepareProduct: useB2BPrepareCartProduct(controller.signal),
      }),
    { wrapper: Wrapper },
  )
  const adding = result.current.addToCart(ITEM)
  controller.abort()
  await act(async () => {
    pending.resolve({ results: [{ hits: [PRODUCT] }] })
    await expect(adding).rejects.toThrow('selection changed')
  })
  expect(store.get(cartAtom).items).toEqual([])
  expect(
    insights.mock.calls.filter(([event]) =>
      String(event).startsWith('addedToCart'),
    ),
  ).toEqual([])
})

it('blocks invalid group configuration without issuing unrestricted checks', () => {
  const { Wrapper, store, search } = setup()
  personalizationStore.set(setPersonaModeAtom, { ...GROUP_0, discount: NaN })
  const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
  expect(result.current.checkoutOptions.getSnapshot()).toBeNull()
  expect(result.current.isInvalid).toBe(true)
  expect(search).not.toHaveBeenCalled()
})

it('uses base prices when the group selection is cleared', async () => {
  const { Wrapper, store } = setup()
  personalizationStore.set(setPersonaModeAtom, null)
  const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
  await waitFor(() =>
    expect(result.current.checkoutOptions.canCheckout).toBe(true),
  )
  expect(result.current.quote.subtotalCents).toBe(20000)
  expect(result.current.quote.orderItems[0].discount).toBe(0)
})

it('fails closed on a malformed validation response', async () => {
  const { Wrapper, search } = setup()
  search.mockResolvedValue({ results: [{ facets: {} }] })
  const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(result.current.checkoutOptions.getSnapshot()).toBeNull()
  expect(result.current.items).toHaveLength(1)
})

it('revalidates when the installed base client is replaced', async () => {
  const { Wrapper, store } = setup()
  const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
  await waitFor(() =>
    expect(result.current.checkoutOptions.canCheckout).toBe(true),
  )
  const replacement = vi.fn().mockResolvedValue({ results: [{ hits: [] }] })
  act(() =>
    store.set(
      baseSearchClientAtom,
      createMockSearchClient({ search: replacement }),
    ),
  )
  expect(result.current.checkoutOptions.canCheckout).toBe(false)
  await waitFor(() => expect(replacement).toHaveBeenCalledOnce())
  await waitFor(() => expect(result.current.isReady).toBe(true))
  expect(result.current.checkoutOptions.getSnapshot()).toBeNull()
})

it('disables checkout while an offline availability refresh is paused', async () => {
  const { Wrapper } = setup()
  const { result } = renderHook(() => useB2BCart(), { wrapper: Wrapper })
  await waitFor(() =>
    expect(result.current.checkoutOptions.canCheckout).toBe(true),
  )
  try {
    onlineManager.setOnline(false)
    act(() => {
      void result.current.retry()
    })
    await waitFor(() =>
      expect(result.current.checkoutOptions.canCheckout).toBe(false),
    )
    expect(result.current.checkoutOptions.getSnapshot()).toBeNull()
  } finally {
    await act(async () => onlineManager.setOnline(true))
  }
})
