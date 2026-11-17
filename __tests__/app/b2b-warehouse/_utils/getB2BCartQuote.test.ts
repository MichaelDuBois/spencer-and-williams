import { describe, expect, it } from 'vitest'

import { getB2BCartQuote } from '@/app/b2b-warehouse/_utils/getB2BCartQuote'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'

const template = b2bWarehouseConfig.algolia.primaryIndex.template!
const item = Object.freeze({
  objectID: 'A',
  name: 'Saved drill',
  price: 999,
  quantity: 2,
  queryID: 'query',
})
const product = Object.freeze({
  objectID: 'A',
  name: 'Drill',
  price: '100',
  raw_price: 999,
  visible_by: ['customer_group_0'],
  availableInStores: [{ objectID: '1', inStock: false }],
})
const policy = {
  status: 'ready',
  groupId: 'customer_group_0',
  discount: 0.15,
  warehouseId: '1',
} as const

describe('getB2BCartQuote', () => {
  it.each([
    [0.15, 170, 15],
    [0.3, 140, 30],
    [0, 200, 0],
    [1, 0, 100],
  ])(
    'quotes current base prices with discount %s without changing saved items',
    (discount, subtotal, unitDiscount) => {
      const quote = getB2BCartQuote(
        [item],
        [product],
        { ...policy, discount },
        template,
      )
      expect(quote.canCheckout).toBe(true)
      expect(quote.subtotalCents).toBe(subtotal * 100)
      expect(quote.orderItems[0]).toMatchObject({
        price: subtotal / 2,
        basePrice: 100,
        discount: unitDiscount,
        quantity: 2,
        queryID: 'query',
      })
      expect(item.price).toBe(999)
      expect(product.price).toBe('100')
    },
  )

  it('rounds unit prices before multiplying quantities', () => {
    const quote = getB2BCartQuote(
      [{ ...item, quantity: 3 }],
      [{ ...product, price: 15.9 }],
      policy,
      template,
    )
    expect(quote.subtotalCents).toBe(4056)
    expect(quote.orderItems[0]).toMatchObject({
      price: 13.52,
      basePrice: 15.9,
      discount: 2.38,
    })
  })

  it('retains blocked lines and excludes them from the subtotal', () => {
    const quote = getB2BCartQuote(
      [item, { ...item, objectID: 'B' }, { ...item, objectID: 'C' }],
      [product, { ...product, objectID: 'B', visible_by: [] }],
      policy,
      template,
    )
    expect(quote.lines.map((line) => line.status)).toEqual([
      'eligible',
      'unavailable',
      'unavailable',
    ])
    expect(quote.subtotalCents).toBe(17000)
    expect(quote.canCheckout).toBe(false)
  })

  it.each([undefined, NaN, Infinity, -1])(
    'blocks unavailable price %s',
    (price) => {
      const quote = getB2BCartQuote(
        [item],
        [{ ...product, price }],
        policy,
        template,
      )
      expect(quote.lines[0].status).toBe('unpriced')
      expect(quote.canCheckout).toBe(false)
      expect(quote.subtotalCents).toBe(0)
    },
  )

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])(
    'blocks invalid or overflowing quantity %s',
    (quantity) => {
      const quote = getB2BCartQuote(
        [{ ...item, quantity }],
        [product],
        policy,
        template,
      )
      expect(quote.lines[0].status).toBe('invalid-quantity')
      expect(quote.canCheckout).toBe(false)
    },
  )

  it('requires warehouse membership and keeps empty carts uncheckoutable', () => {
    expect(
      getB2BCartQuote(
        [item],
        [product],
        { ...policy, warehouseId: '2' },
        template,
      ).canCheckout,
    ).toBe(false)
    expect(getB2BCartQuote([], [], policy, template).canCheckout).toBe(false)
  })
})

it('blocks malformed product fields from order snapshots', () => {
  const quote = getB2BCartQuote(
    [item],
    [{ ...product, name: { invalid: 'name' } }],
    policy,
    template,
  )
  expect(quote.canCheckout).toBe(false)
  expect(quote.lines[0].status).toBe('unavailable')
})
