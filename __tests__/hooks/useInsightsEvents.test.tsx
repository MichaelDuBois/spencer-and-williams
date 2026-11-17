import { renderHook, act } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAddToCart, type PrepareCartProduct } from '@/hooks/useAddToCart'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { VerticalConfig } from '@/types'

import type { ReactNode } from 'react'

const { aaMock } = vi.hoisted(() => {return { aaMock: vi.fn() }})

vi.mock('search-insights', () => {return { default: aaMock }})

const { trackMock, addItemMock } = vi.hoisted(() => {
  return { trackMock: vi.fn(), addItemMock: vi.fn() }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

vi.mock('@/hooks/useCart', () => {
  return {
    useCart: () => {
      return { addItem: addItemMock }
    },
  }
})

const mockPersonalization: {
  currentUserToken: string
  currentOptionalFilters: string[]
  mode: 'anonymous' | 'persona' | 'realtime'
} = {
  currentUserToken: '',
  currentOptionalFilters: [],
  mode: 'anonymous',
}

vi.mock('@/hooks/usePersonalization', () => {return {
  useCurrentUserToken: () => mockPersonalization.currentUserToken,
  usePersonalization: () => mockPersonalization,
}})

const minimalConfig = {
  algolia: {
    appId: 'TEST_APP',
    apiKey: 'TEST_KEY',
    primaryIndex: { name: 'test_products' },
  },
} as unknown as VerticalConfig

const buildStore = (overrides?: { config?: VerticalConfig | null }) => {
  const store = createStore()
  const config =
    overrides && 'config' in overrides ? overrides.config ?? null : minimalConfig
  store.set(activeConfigAtom, config)
  return store
}

const buildWrapper = (store: ReturnType<typeof createStore>) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return Wrapper
}

describe('useInsightsEvents', () => {
  beforeEach(() => {
    aaMock.mockClear()
    mockPersonalization.currentUserToken = ''
    mockPersonalization.currentOptionalFilters = []
    mockPersonalization.mode = 'anonymous'
  })

  describe('sendProductClickEvent', () => {
    it('calls clickedObjectIDsAfterSearch when hit has __queryID', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendProductClickEvent(
          {
            objectID: 'p1',
            __queryID: 'q123',
            __position: 3,
          },
          { surface: 'product_card' },
        )
      })

      expect(aaMock).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
        index: 'test_products',
        eventName: 'Product Clicked',
        queryID: 'q123',
        objectIDs: ['p1'],
        positions: [3],
      })
    })

    it('calls clickedObjectIDs when hit has no __queryID', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendProductClickEvent({ objectID: 'p1' }, { surface: 'product_card' })
      })

      expect(aaMock).toHaveBeenCalledWith('clickedObjectIDs', {
        index: 'test_products',
        eventName: 'Product Clicked',
        objectIDs: ['p1'],
      })
    })

    it('defaults position to 1 when __queryID is present but __position is missing', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendProductClickEvent(
          {
            objectID: 'p1',
            __queryID: 'q123',
          },
          { surface: 'product_card' },
        )
      })

      expect(aaMock).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.objectContaining({ positions: [1] }),
      )
    })

    it('includes userToken when persona is active', () => {
      mockPersonalization.currentUserToken = 'persona-outdoor'
      mockPersonalization.mode = 'persona'

      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendProductClickEvent({ objectID: 'p1' }, { surface: 'product_card' })
      })

      expect(aaMock).toHaveBeenCalledWith(
        'clickedObjectIDs',
        expect.objectContaining({ userToken: 'persona-outdoor' }),
      )
    })

    it('includes realtime token when realtime mode is active', () => {
      mockPersonalization.currentUserToken = 'realtime-abc'
      mockPersonalization.mode = 'realtime'

      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendProductClickEvent({ objectID: 'p1' }, { surface: 'product_card' })
      })

      expect(aaMock).toHaveBeenCalledWith(
        'clickedObjectIDs',
        expect.objectContaining({ userToken: 'realtime-abc' }),
      )
    })

    it('omits userToken when anonymous', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendProductClickEvent({ objectID: 'p1' }, { surface: 'product_card' })
      })

      const payload = aaMock.mock.calls.find(
        (c) => c[0] === 'clickedObjectIDs',
      )?.[1]
      expect(payload).not.toHaveProperty('userToken')
    })

    it('no-ops when index is empty', () => {
      const store = buildStore({ config: null })
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendProductClickEvent({ objectID: 'p1' }, { surface: 'product_card' })
      })

      expect(aaMock).not.toHaveBeenCalledWith(
        'clickedObjectIDs',
        expect.anything(),
      )
      expect(aaMock).not.toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.anything(),
      )
    })
  })

  describe('sendAddToCartEvent', () => {
    it('calls addedToCartObjectIDsAfterSearch when queryID is provided', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendAddToCartEvent(
          {
            objectID: 'p1',
            queryID: 'q123',
            price: 29.99,
          },
          { surface: 'pdp' },
        )
      })

      expect(aaMock).toHaveBeenCalledWith('addedToCartObjectIDsAfterSearch', {
        index: 'test_products',
        eventName: 'Product Added to Cart',
        queryID: 'q123',
        objectIDs: ['p1'],
        objectData: [{ price: 29.99, quantity: 1 }],
        value: 29.99,
        currency: 'USD',
      })
    })

    it('calls addedToCartObjectIDs when no queryID', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendAddToCartEvent({ objectID: 'p1', price: 15 }, { surface: 'pdp' })
      })

      expect(aaMock).toHaveBeenCalledWith('addedToCartObjectIDs', {
        index: 'test_products',
        eventName: 'Product Added to Cart',
        objectIDs: ['p1'],
        objectData: [{ price: 15, quantity: 1 }],
        value: 15,
        currency: 'USD',
      })
    })

    it('rounds value correctly for floating point arithmetic', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendAddToCartEvent(
          {
            objectID: 'p1',
            price: 39.99,
            quantity: 3,
          },
          { surface: 'pdp' },
        )
      })

      expect(aaMock).toHaveBeenCalledWith(
        'addedToCartObjectIDs',
        expect.objectContaining({ value: 119.97 }),
      )
    })

    it('defaults quantity to 1 when omitted', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendAddToCartEvent({ objectID: 'p1', price: 10 }, { surface: 'pdp' })
      })

      expect(aaMock).toHaveBeenCalledWith(
        'addedToCartObjectIDs',
        expect.objectContaining({
          objectData: [{ price: 10, quantity: 1 }],
          value: 10,
        }),
      )
    })
  })

  describe('sendPurchaseEvent', () => {
    it('calls purchasedObjectIDs with correct payload', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendPurchaseEvent([
          { objectID: 'p1', price: 29.99, quantity: 1 },
          { objectID: 'p2', price: 49.99, quantity: 2 },
        ])
      })

      expect(aaMock).toHaveBeenCalledWith('purchasedObjectIDs', {
        index: 'test_products',
        eventName: 'Product Purchased',
        objectIDs: ['p1', 'p2'],
        objectData: [
          { price: 29.99, quantity: 1, discount: 0 },
          { price: 49.99, quantity: 2, discount: 0 },
        ],
        value: 129.97,
        currency: 'USD',
      })
    })

    it('rounds total value to avoid floating point issues', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendPurchaseEvent([
          { objectID: 'p1', price: 133.33, quantity: 3 },
        ])
      })

      expect(aaMock).toHaveBeenCalledWith(
        'purchasedObjectIDs',
        expect.objectContaining({ value: 399.99 }),
      )
    })

    it('sends purchasedObjectIDsAfterSearch with per-object queryID for attributed items', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendPurchaseEvent([
          { objectID: 'p1', price: 10, quantity: 1, queryID: 'q1' },
          { objectID: 'p2', price: 20, quantity: 2, queryID: 'q2' },
        ])
      })

      expect(aaMock).toHaveBeenCalledWith('purchasedObjectIDsAfterSearch', {
        index: 'test_products',
        eventName: 'Product Purchased',
        objectIDs: ['p1', 'p2'],
        objectData: [
          { price: 10, quantity: 1, discount: 0, queryID: 'q1' },
          { price: 20, quantity: 2, discount: 0, queryID: 'q2' },
        ],
        value: 50,
        currency: 'USD',
      })
      expect(aaMock).not.toHaveBeenCalledWith(
        'purchasedObjectIDs',
        expect.anything(),
      )
    })

    it('splits mixed carts into after-search and plain purchase events', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendPurchaseEvent([
          { objectID: 'p1', price: 10, quantity: 1, queryID: 'q1' },
          { objectID: 'p2', price: 20, quantity: 1 },
        ])
      })

      expect(aaMock).toHaveBeenCalledWith('purchasedObjectIDsAfterSearch', {
        index: 'test_products',
        eventName: 'Product Purchased',
        objectIDs: ['p1'],
        objectData: [{ price: 10, quantity: 1, discount: 0, queryID: 'q1' }],
        value: 10,
        currency: 'USD',
      })
      expect(aaMock).toHaveBeenCalledWith('purchasedObjectIDs', {
        index: 'test_products',
        eventName: 'Product Purchased',
        objectIDs: ['p2'],
        objectData: [{ price: 20, quantity: 1, discount: 0 }],
        value: 20,
        currency: 'USD',
      })
    })

    it('no-ops when items array is empty', () => {
      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendPurchaseEvent([])
      })

      expect(aaMock).not.toHaveBeenCalledWith(
        'purchasedObjectIDs',
        expect.anything(),
      )
    })

    it('no-ops when index is empty', () => {
      const store = buildStore({ config: null })
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendPurchaseEvent([{ objectID: 'p1', price: 10 }])
      })

      expect(aaMock).not.toHaveBeenCalledWith(
        'purchasedObjectIDs',
        expect.anything(),
      )
    })

    it('includes userToken when persona is active', () => {
      mockPersonalization.currentUserToken = 'persona-outdoor'
      mockPersonalization.mode = 'persona'

      const store = buildStore()
      const { result } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      act(() => {
        result.current.sendPurchaseEvent([{ objectID: 'p1', price: 10 }])
      })

      expect(aaMock).toHaveBeenCalledWith(
        'purchasedObjectIDs',
        expect.objectContaining({ userToken: 'persona-outdoor' }),
      )
    })
  })

  describe('aa init', () => {
    it('calls aa init with appId, apiKey, useCookie, and partial', () => {
      const initConfig = {
        algolia: {
          appId: 'INIT_APP',
          apiKey: 'INIT_KEY',
          primaryIndex: { name: 'init_index' },
        },
      } as unknown as VerticalConfig
      const store = buildStore({ config: initConfig })

      renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      expect(aaMock).toHaveBeenCalledWith('init', {
        appId: 'INIT_APP',
        apiKey: 'INIT_KEY',
        useCookie: true,
        partial: true,
      })
    })

    it('does not re-init for the same appId on subsequent renders', () => {
      const config = {
        algolia: {
          appId: 'DEDUP_APP',
          apiKey: 'DEDUP_KEY',
          primaryIndex: { name: 'dedup_index' },
        },
      } as unknown as VerticalConfig
      const store = buildStore({ config })

      const { rerender } = renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      const initCalls = aaMock.mock.calls.filter(
        (c) => c[0] === 'init' && c[1].appId === 'DEDUP_APP',
      )
      expect(initCalls).toHaveLength(1)

      aaMock.mockClear()
      rerender()

      expect(aaMock).not.toHaveBeenCalledWith('init', expect.anything())
    })

    it('re-inits on every credentials change, including back to the first app', () => {
      const prodConfig = {
        algolia: {
          appId: 'SWAP_PROD_APP',
          apiKey: 'SWAP_PROD_KEY',
          primaryIndex: { name: 'swap_index' },
        },
      } as unknown as VerticalConfig
      const stagingConfig = {
        algolia: {
          appId: 'SWAP_STAGING_APP',
          apiKey: 'SWAP_STAGING_KEY',
          primaryIndex: { name: 'swap_index' },
        },
      } as unknown as VerticalConfig

      renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(buildStore({ config: prodConfig })),
      })
      aaMock.mockClear()

      renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(buildStore({ config: stagingConfig })),
      })

      expect(aaMock).toHaveBeenCalledWith('init', {
        appId: 'SWAP_STAGING_APP',
        apiKey: 'SWAP_STAGING_KEY',
        useCookie: true,
        partial: true,
      })

      aaMock.mockClear()

      renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(buildStore({ config: prodConfig })),
      })

      expect(aaMock).toHaveBeenCalledWith('init', {
        appId: 'SWAP_PROD_APP',
        apiKey: 'SWAP_PROD_KEY',
        useCookie: true,
        partial: true,
      })
    })

    it('does not call aa init when config is missing', () => {
      const store = buildStore({ config: null })

      renderHook(() => useInsightsEvents(), {
        wrapper: buildWrapper(store),
      })

      expect(aaMock).not.toHaveBeenCalledWith('init', expect.anything())
    })
  })
})

describe('useInsightsEvents Amplitude events', () => {
  beforeEach(() => {
    aaMock.mockClear()
    trackMock.mockClear()
    addItemMock.mockReset()
    addItemMock.mockReturnValue(true)
    mockPersonalization.currentUserToken = ''
  })

  const renderInsightsEvents = (store = buildStore()) =>
    renderHook(() => useInsightsEvents(), { wrapper: buildWrapper(store) })

  const countAaCalls = (method: string): number =>
    aaMock.mock.calls.filter((call) => call[0] === method).length

  describe('product_clicked', () => {
    it('tracks the click with its position, queryID, index and surface', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendProductClickEvent(
          { objectID: 'p1', __queryID: 'q123', __position: 3 },
          { surface: 'product_card' },
        )
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('product_clicked', {
        objectID: 'p1',
        surface: 'product_card',
        position: 3,
        queryID: 'q123',
        index: 'test_products',
      })
      expect(countAaCalls('clickedObjectIDsAfterSearch')).toBe(1)
    })

    it('omits position and queryID when the hit has none', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendProductClickEvent({ objectID: 'p1' }, { surface: 'autocomplete' })
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('product_clicked', {
        objectID: 'p1',
        surface: 'autocomplete',
        index: 'test_products',
      })
      expect(trackMock.mock.calls[0][1]).not.toHaveProperty('model')
    })

    it('forwards the recommend model with the click', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendProductClickEvent(
          { objectID: 'p1' },
          { surface: 'recommend', model: 'related-products' },
        )
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('product_clicked', {
        objectID: 'p1',
        surface: 'recommend',
        model: 'related-products',
        index: 'test_products',
      })
      expect(countAaCalls('clickedObjectIDs')).toBe(1)
    })

    it('still tracks the click when no index is configured', () => {
      const { result } = renderInsightsEvents(buildStore({ config: null }))

      act(() => {
        result.current.sendProductClickEvent({ objectID: 'p1' }, { surface: 'media_title' })
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('product_clicked', {
        objectID: 'p1',
        surface: 'media_title',
      })
      expect(countAaCalls('clickedObjectIDs')).toBe(0)
    })
  })

  describe('add_to_cart', () => {
    it('tracks the attributed add with its price and quantity', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendAddToCartEvent(
          {
            objectID: 'p1',
            queryID: 'q123',
            price: 29.99,
            discount: 5,
            quantity: 2,
          },
          { surface: 'product_card' },
        )
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('add_to_cart', {
        objectID: 'p1',
        surface: 'product_card',
        quantity: 2,
        price: 29.99,
        queryID: 'q123',
      })
      expect(countAaCalls('addedToCartObjectIDsAfterSearch')).toBe(1)
    })

    it('omits price and queryID when they are unknown', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendAddToCartEvent({ objectID: 'p1' }, { surface: 'assistant' })
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('add_to_cart', {
        objectID: 'p1',
        surface: 'assistant',
        quantity: 1,
      })
    })

    it('sends the Recommend model with the add when one is given', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendAddToCartEvent(
          { objectID: 'p1', price: 10 },
          { surface: 'recommend', model: 'related-products' },
        )
      })

      expect(trackMock).toHaveBeenCalledWith('add_to_cart', {
        objectID: 'p1',
        surface: 'recommend',
        model: 'related-products',
        quantity: 1,
        price: 10,
      })
      expect(countAaCalls('addedToCartObjectIDs')).toBe(1)
    })

    it('omits the model key when no model is given', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendAddToCartEvent(
          { objectID: 'p1' },
          { surface: 'product_card', model: undefined },
        )
      })

      expect(trackMock.mock.calls[0][1]).not.toHaveProperty('model')
    })

    it('still tracks the add when no index is configured', () => {
      const { result } = renderInsightsEvents(buildStore({ config: null }))

      act(() => {
        result.current.sendAddToCartEvent({ objectID: 'p1' }, { surface: 'pdp' })
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('add_to_cart', {
        objectID: 'p1',
        surface: 'pdp',
        quantity: 1,
      })
      expect(countAaCalls('addedToCartObjectIDs')).toBe(0)
    })
  })

  describe('checkout_completed', () => {
    it('tracks one checkout for a cart split into attributed and unattributed batches', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendPurchaseEvent([
          { objectID: 'p1', price: 10, quantity: 1, queryID: 'q1' },
          { objectID: 'p2', price: 20, quantity: 2 },
          { objectID: 'p3', price: 5.55, quantity: 3 },
        ])
      })

      expect(countAaCalls('purchasedObjectIDsAfterSearch')).toBe(1)
      expect(countAaCalls('purchasedObjectIDs')).toBe(1)
      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('checkout_completed', {
        item_count: 6,
        order_value: 66.65,
        currency: 'USD',
        $revenue: 66.65,
      })
    })

    it('counts an item without a quantity as one unit', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendPurchaseEvent([{ objectID: 'p1', price: 133.33 }])
      })

      expect(trackMock).toHaveBeenCalledWith('checkout_completed', {
        item_count: 1,
        order_value: 133.33,
        currency: 'USD',
        $revenue: 133.33,
      })
    })

    it('tracks nothing for an empty order', () => {
      const { result } = renderInsightsEvents()

      act(() => {
        result.current.sendPurchaseEvent([])
      })

      expect(trackMock).not.toHaveBeenCalled()
    })

    it('still tracks the checkout when no index is configured', () => {
      const { result } = renderInsightsEvents(buildStore({ config: null }))

      act(() => {
        result.current.sendPurchaseEvent([{ objectID: 'p1', price: 10 }])
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(countAaCalls('purchasedObjectIDs')).toBe(0)
    })
  })

  describe('add_to_cart through a revalidated (B2B) add', () => {
    const PRODUCT = {
      objectID: 'sku-1',
      name: 'Pallet jack',
      image: '/pallet-jack.webp',
      price: 100,
    }

    const prepareB2BProduct =
      (isCurrent = () => true): PrepareCartProduct =>
      async (product) => {
        return {
          product: { ...product, price: 100 },
          price: 80,
          discount: 20,
          isCurrent,
        }
      }

    const renderAddToCart = (prepareProduct: PrepareCartProduct) =>
      renderHook(
        () => useAddToCart({ surface: 'product_card', prepareProduct }),
        { wrapper: buildWrapper(buildStore()) },
      )

    it('tracks one add at the net price once the item is accepted', async () => {
      const { result } = renderAddToCart(prepareB2BProduct())

      await act(() => result.current.addToCart(PRODUCT, { queryID: 'q1' }))

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('add_to_cart', {
        objectID: 'sku-1',
        surface: 'product_card',
        quantity: 1,
        price: 80,
        queryID: 'q1',
      })
      expect(countAaCalls('addedToCartObjectIDsAfterSearch')).toBe(1)
    })

    it('tracks nothing when revalidation rejects the item', async () => {
      const rejectProduct: PrepareCartProduct = async () => {
        throw new Error('This product is unavailable.')
      }
      const { result } = renderAddToCart(rejectProduct)

      await act(async () => {
        await expect(result.current.addToCart(PRODUCT)).rejects.toThrow()
      })

      expect(trackMock).not.toHaveBeenCalled()
      expect(countAaCalls('addedToCartObjectIDs')).toBe(0)
    })

    it('tracks nothing when the selection changed during revalidation', async () => {
      const { result } = renderAddToCart(prepareB2BProduct(() => false))

      await act(async () => {
        await expect(result.current.addToCart(PRODUCT)).rejects.toThrow()
      })

      expect(trackMock).not.toHaveBeenCalled()
      expect(addItemMock).not.toHaveBeenCalled()
    })

    it('tracks nothing when the cart refuses the item', async () => {
      addItemMock.mockReturnValue(false)
      const { result } = renderAddToCart(prepareB2BProduct())

      await act(() => result.current.addToCart(PRODUCT))

      expect(addItemMock).toHaveBeenCalledTimes(1)
      expect(trackMock).not.toHaveBeenCalled()
      expect(countAaCalls('addedToCartObjectIDs')).toBe(0)
    })
  })
})
