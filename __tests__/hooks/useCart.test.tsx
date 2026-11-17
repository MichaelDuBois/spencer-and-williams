import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useCart } from '@/hooks/useCart'
import { activeConfigAtom } from '@/stores/activeConfig'
import { getCartAtom } from '@/stores/cart'

import { createTestStore, buildJotaiWrapper } from '../helpers/jotai-wrapper'
import { createMockConfig } from '../helpers/test-utils'

let verticalCounter = 0

// Each render uses a unique vertical slug so the atomWithStorage-backed cart
// starts empty and stays isolated from other tests.
const renderUseCart = () => {
  verticalCounter += 1
  const store = createTestStore((s) =>
    s.set(
      activeConfigAtom,
      createMockConfig({ slug: `cart-test-${verticalCounter}` }),
    ),
  )
  const rendered = renderHook(() => useCart(), {
    wrapper: buildJotaiWrapper(store),
  })
  const switchApp = (appId: string) => {
    const config = store.get(activeConfigAtom)!
    act(() =>
      store.set(activeConfigAtom, {
        ...config,
        algolia: { ...config.algolia, appId },
      }),
    )
  }
  return { ...rendered, store, switchApp }
}

const product = { objectID: 'p1', name: 'Widget', price: 10 }

describe('useCart', () => {
  it('adds a new item with quantity 1', () => {
    const { result } = renderUseCart()
    let accepted: boolean | undefined
    act(() => {
      accepted = result.current.addItem(product)
    })
    expect(accepted).toBe(true)
    expect(result.current.items).toEqual([{ ...product, quantity: 1 }])
  })

  it('increments quantity when adding an existing objectID', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem(product))
    act(() => result.current.addItem(product))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('persists queryID on a new item', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem({ ...product, queryID: 'q1' }))
    expect(result.current.items[0].queryID).toBe('q1')
    expect(result.current.items[0]).toMatchObject({ queryAppId: 'APP_ID' })
  })

  it('preserves the originating app through a provider remount', () => {
    const { result, store, unmount } = renderUseCart()
    act(() => result.current.addItem({ ...product, queryID: 'q1' }))
    const config = store.get(activeConfigAtom)!
    unmount()

    const stagingStore = createTestStore((s) =>
      s.set(activeConfigAtom, {
        ...config,
        algolia: { ...config.algolia, appId: 'STAGING_APP' },
      }),
    )
    const remounted = renderHook(() => useCart(), {
      wrapper: buildJotaiWrapper(stagingStore),
    })

    expect(remounted.result.current.items).toEqual([
      expect.objectContaining({
        ...product,
        quantity: 1,
        queryID: 'q1',
        queryAppId: 'APP_ID',
      }),
    ])
  })

  it('uses the new app attribution when the same product is added from its search', () => {
    const { result, switchApp } = renderUseCart()
    act(() =>
      result.current.addItem({ ...product, queryID: 'production-query' }),
    )
    switchApp('STAGING_APP')
    act(() => result.current.addItem({ ...product, queryID: 'staging-query' }))
    expect(result.current.items).toEqual([
      expect.objectContaining({
        quantity: 2,
        queryID: 'staging-query',
        queryAppId: 'STAGING_APP',
      }),
    ])
  })

  it('keeps the original attribution when another app adds without a query', () => {
    const { result, switchApp } = renderUseCart()
    act(() =>
      result.current.addItem({ ...product, queryID: 'production-query' }),
    )
    switchApp('STAGING_APP')
    act(() => result.current.addItem(product))
    expect(result.current.items[0]).toMatchObject({
      quantity: 2,
      queryID: 'production-query',
      queryAppId: 'APP_ID',
    })
  })

  it('replaces legacy attribution when a new search adds the same product', () => {
    const { result, store } = renderUseCart()
    const config = store.get(activeConfigAtom)!
    act(() =>
      store.set(getCartAtom(config.slug), {
        items: [{ ...product, quantity: 1, queryID: 'legacy-query' }],
        updatedAt: 1,
      }),
    )
    act(() => result.current.addItem({ ...product, queryID: 'current-query' }))
    expect(result.current.items[0]).toMatchObject({
      quantity: 2,
      queryID: 'current-query',
      queryAppId: 'APP_ID',
    })
  })

  it('keeps the original queryID when the same item is re-added', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem({ ...product, queryID: 'q1' }))
    act(() => result.current.addItem({ ...product, queryID: 'q2' }))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].queryID).toBe('q1')
  })

  it('backfills queryID when the first add had none', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem(product))
    act(() => result.current.addItem({ ...product, queryID: 'q2' }))
    expect(result.current.items[0].queryID).toBe('q2')
  })

  it('respects an explicit quantity', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem({ ...product, quantity: 3 }))
    expect(result.current.items[0].quantity).toBe(3)
  })

  it('removes an item by objectID', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem(product))
    act(() => result.current.removeItem('p1'))
    expect(result.current.items).toEqual([])
  })

  it('is a no-op when removing a missing objectID', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem(product))
    act(() => result.current.removeItem('does-not-exist'))
    expect(result.current.items).toHaveLength(1)
  })

  it('updates an item to an exact quantity', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem(product))
    act(() => result.current.updateQuantity('p1', 5))
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('removes the item when quantity is set to zero or below', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem(product))
    act(() => result.current.updateQuantity('p1', 0))
    expect(result.current.items).toEqual([])
  })

  it('clears every item', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem(product))
    act(() =>
      result.current.addItem({ objectID: 'p2', name: 'Other', price: 5 }),
    )
    act(() => result.current.clearCart())
    expect(result.current.items).toEqual([])
  })

  it('sums totalItems across quantities', () => {
    const { result } = renderUseCart()
    act(() => result.current.addItem({ ...product, quantity: 2 }))
    act(() =>
      result.current.addItem({ objectID: 'p2', name: 'Other', quantity: 3 }),
    )
    expect(result.current.totalItems).toBe(5)
  })

  it('computes totalPrice as the sum of price × quantity', () => {
    const { result } = renderUseCart()
    act(() =>
      result.current.addItem({
        objectID: 'a',
        name: 'A',
        price: 10,
        quantity: 2,
      }),
    )
    act(() =>
      result.current.addItem({
        objectID: 'b',
        name: 'B',
        price: 5,
        quantity: 1,
      }),
    )
    expect(result.current.totalPrice).toBe(25)
  })
})

describe('useCart invalid input', () => {
  it.each([
    ['an invalid quantity', { ...product, quantity: 0 }],
    ['an invalid product', { ...product, price: NaN }],
  ])('reports rejection for %s', (_label, item) => {
    const { result } = renderUseCart()
    let accepted: boolean | undefined

    act(() => {
      accepted = result.current.addItem(item)
    })

    expect(accepted).toBe(false)
    expect(result.current.items).toEqual([])
  })

  it.each([0, -1, 1.5, Infinity, NaN])(
    'skips an invalid added quantity %s without throwing',
    (quantity) => {
      const { result } = renderUseCart()
      expect(() =>
        act(() => result.current.addItem({ ...product, quantity })),
      ).not.toThrow()
      expect(result.current.items).toEqual([])
    },
  )

  it.each<[string, unknown]>([
    ['a string price', '10'],
    ['a null price', null],
    ['a NaN price', NaN],
  ])('skips a product with %s without throwing', (_label, price) => {
    const { result } = renderUseCart()
    expect(() =>
      act(() =>
        result.current.addItem({ ...product, price: price as number }),
      ),
    ).not.toThrow()
    expect(result.current.items).toEqual([])
  })

  it('skips a product with a missing objectID without throwing', () => {
    const { result } = renderUseCart()
    expect(() =>
      act(() =>
        result.current.addItem({
          name: 'No ID',
        } as unknown as Parameters<typeof result.current.addItem>[0]),
      ),
    ).not.toThrow()
    expect(result.current.items).toEqual([])
  })

  it('adds the valid items and skips the invalid one in a single pass', () => {
    const { result } = renderUseCart()
    act(() => {
      result.current.addItem(product)
      result.current.addItem({
        objectID: 'bad',
        name: 'Bad',
        price: '5' as unknown as number,
      })
      result.current.addItem({ objectID: 'p2', name: 'Other', price: 5 })
    })
    expect(result.current.items.map((item) => item.objectID)).toEqual([
      'p1',
      'p2',
    ])
  })

  it('leaves the cart unchanged when a merge would overflow a safe integer', () => {
    const { result } = renderUseCart()
    act(() =>
      result.current.addItem({ ...product, quantity: Number.MAX_SAFE_INTEGER }),
    )
    let accepted: boolean | undefined
    expect(() =>
      act(() => {
        accepted = result.current.addItem(product)
      }),
    ).not.toThrow()
    expect(accepted).toBe(false)
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(Number.MAX_SAFE_INTEGER)
  })

  it.each([1.5, NaN, Number.MAX_SAFE_INTEGER + 1])(
    'ignores an invalid updated quantity %s without throwing',
    (quantity) => {
      const { result } = renderUseCart()
      act(() => result.current.addItem(product))
      expect(() =>
        act(() => result.current.updateQuantity('p1', quantity)),
      ).not.toThrow()
      expect(result.current.items[0].quantity).toBe(1)
    },
  )
})
