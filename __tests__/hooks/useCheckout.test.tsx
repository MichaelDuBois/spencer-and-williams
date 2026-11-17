import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCheckout } from '@/hooks/useCheckout'

const routerPush = vi.fn()
const clearCart = vi.fn()
const setOrder = vi.fn()
let appId = 'APP_ID'

let mockItems: Array<{
  objectID: string
  name: string
  image: string
  price: number
  brand: string
  quantity: number
  queryID?: string
  queryAppId?: string
}>

vi.mock('next/navigation', () => {
  return {
    useRouter: () => {
      return { push: routerPush }
    },
  }
})

vi.mock('@/hooks/useActiveConfig', () => {
  return {
    useActiveConfig: () => {
      return { slug: 'fashion', algolia: { appId } }
    },
  }
})

vi.mock('@/hooks/useCart', () => {
  return {
    useCart: () => {
      return {
        items: mockItems,
        totalPrice: mockItems.reduce((s, i) => s + i.price * i.quantity, 0),
        clearCart,
      }
    },
  }
})

const sendPurchaseEvent = vi.fn()

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendPurchaseEvent }
    },
  }
})

vi.mock('jotai', () => {
  return {
    useSetAtom: () => setOrder,
  }
})

vi.mock('@/stores/order', () => {
  return {
    getOrderAtom: (vertical: string) => `order-atom-${vertical}`,
  }
})

const addOrderToHistory = vi.fn()

vi.mock('@/hooks/useOrderHistory', () => {
  return {
    useOrderHistory: () => {
      return { orders: [], addOrderToHistory, personaKey: 'guest' }
    },
  }
})

const ITEM = {
  objectID: 'p1',
  name: 'Shirt',
  image: '/shirt.webp',
  price: 40,
  brand: 'Acme',
  quantity: 2,
}

describe('useCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItems = [ITEM]
    appId = 'APP_ID'
  })

  describe('empty-cart short-circuit', () => {
    it('does not call setOrder, clearCart, or router.push when cart is empty', () => {
      mockItems = []
      const { result } = renderHook(() => useCheckout('/fashion'))

      act(() => result.current.checkout())

      expect(setOrder).not.toHaveBeenCalled()
      expect(clearCart).not.toHaveBeenCalled()
      expect(routerPush).not.toHaveBeenCalled()
    })
  })

  describe('order snapshot', () => {
    it('persists a copy of items, not the live reference', () => {
      const { result } = renderHook(() => useCheckout('/fashion'))

      act(() => result.current.checkout())

      const order = setOrder.mock.calls[0][0]
      expect(order.items).toEqual([ITEM])
      expect(order.items).not.toBe(mockItems)
    })
  })

  describe('call ordering', () => {
    it('calls setOrder before clearCart, and clearCart before router.push', () => {
      const { result } = renderHook(() => useCheckout('/fashion'))

      act(() => result.current.checkout())

      const [setOrderSeq] = setOrder.mock.invocationCallOrder
      const [clearCartSeq] = clearCart.mock.invocationCallOrder
      const [pushSeq] = routerPush.mock.invocationCallOrder

      expect(setOrderSeq).toBeLessThan(clearCartSeq)
      expect(clearCartSeq).toBeLessThan(pushSeq)
    })
  })

  describe('purchase event', () => {
    it('forwards each item objectID, price, quantity, and queryID', () => {
      mockItems = [
        { ...ITEM, objectID: 'p1', queryID: 'q1', queryAppId: 'APP_ID' },
        { ...ITEM, objectID: 'p2', queryID: undefined },
      ]
      const { result } = renderHook(() => useCheckout('/fashion'))

      act(() => result.current.checkout())

      expect(sendPurchaseEvent).toHaveBeenCalledWith([
        { objectID: 'p1', price: 40, quantity: 2, queryID: 'q1' },
        { objectID: 'p2', price: 40, quantity: 2, queryID: undefined },
      ])
    })

    it('omits attribution from a different app and legacy items with no app', () => {
      mockItems = [
        {
          ...ITEM,
          objectID: 'staging',
          queryID: 'staging-query',
          queryAppId: 'STAGING_APP',
        },
        { ...ITEM, objectID: 'legacy', queryID: 'unknown-query' },
      ]
      const { result } = renderHook(() => useCheckout('/fashion'))
      act(() => result.current.checkout())
      expect(sendPurchaseEvent).toHaveBeenCalledWith([
        { objectID: 'staging', price: 40, quantity: 2, queryID: undefined },
        { objectID: 'legacy', price: 40, quantity: 2, queryID: undefined },
      ])
    })

    it('uses retained attribution after switching back to the originating app', () => {
      mockItems = [
        { ...ITEM, queryID: 'production-query', queryAppId: 'APP_ID' },
      ]
      appId = 'STAGING_APP'
      const { result, rerender } = renderHook(() => useCheckout('/fashion'))
      appId = 'APP_ID'
      rerender()
      act(() => result.current.checkout())
      expect(sendPurchaseEvent).toHaveBeenCalledWith([
        { objectID: 'p1', price: 40, quantity: 2, queryID: 'production-query' },
      ])
    })
  })

  describe('canCheckout', () => {
    it('returns false when the cart is empty', () => {
      mockItems = []
      const { result } = renderHook(() => useCheckout('/fashion'))

      expect(result.current.canCheckout).toBe(false)
    })

    it('returns true when the cart has items', () => {
      const { result } = renderHook(() => useCheckout('/fashion'))

      expect(result.current.canCheckout).toBe(true)
    })
  })

  describe('order history', () => {
    it('appends the completed order to the active persona history', () => {
      const { result } = renderHook(() => useCheckout('/fashion'))

      act(() => result.current.checkout())

      expect(addOrderToHistory).toHaveBeenCalledTimes(1)
      expect(addOrderToHistory.mock.calls[0][0]).toBe(setOrder.mock.calls[0][0])
    })

    it('does not append when the cart is empty', () => {
      mockItems = []
      const { result } = renderHook(() => useCheckout('/fashion'))

      act(() => result.current.checkout())

      expect(addOrderToHistory).not.toHaveBeenCalled()
    })

    it('appends before clearing the cart', () => {
      const { result } = renderHook(() => useCheckout('/fashion'))

      act(() => result.current.checkout())

      const [addOrderToHistorySeq] = addOrderToHistory.mock.invocationCallOrder
      const [clearCartSeq] = clearCart.mock.invocationCallOrder

      expect(addOrderToHistorySeq).toBeLessThan(clearCartSeq)
    })
  })
})

describe('explicit checkout snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockItems = [ITEM]
  })

  it('keeps the supplied net amounts in the order and purchase payload', () => {
    const snapshotItem = { ...ITEM, price: 34, basePrice: 40, discount: 6 }
    const { result } = renderHook(() =>
      useCheckout('/b2b-warehouse', {
        canCheckout: true,
        getSnapshot: () => {
          return { items: [snapshotItem], subtotal: 68 }
        },
      }),
    )
    act(() => result.current.checkout())
    expect(setOrder.mock.calls[0][0]).toMatchObject({
      items: [snapshotItem],
      subtotal: 68,
      total: 68,
    })
    expect(setOrder.mock.calls[0][0].items[0]).not.toBe(snapshotItem)
    expect(sendPurchaseEvent).toHaveBeenCalledWith([
      expect.objectContaining({ price: 34, discount: 6, quantity: 2 }),
    ])
  })

  it('does not checkout if the snapshot becomes stale', () => {
    const { result } = renderHook(() =>
      useCheckout('/b2b-warehouse', {
        canCheckout: true,
        getSnapshot: () => null,
      }),
    )
    act(() => result.current.checkout())
    expect(setOrder).not.toHaveBeenCalled()
    expect(clearCart).not.toHaveBeenCalled()
    expect(sendPurchaseEvent).not.toHaveBeenCalled()
  })

  it('honors a disabled checkout even when a snapshot is supplied', () => {
    const { result } = renderHook(() =>
      useCheckout('/b2b-warehouse', {
        canCheckout: false,
        getSnapshot: () => {
          return { items: [ITEM], subtotal: 80 }
        },
      }),
    )
    act(() => result.current.checkout())
    expect(setOrder).not.toHaveBeenCalled()
  })
})
