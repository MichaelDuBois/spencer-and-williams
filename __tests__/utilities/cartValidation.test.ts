import { describe, expect, it } from 'vitest'

import {
  isCartItem,
  isCartProduct,
  isCartQuantity,
  sanitizeCart,
} from '@/utilities/cartValidation'

const VALID_PRODUCT = {
  objectID: 'p1',
  name: 'Widget',
  image: '/widget.webp',
  price: 19.99,
  brand: 'Acme',
}

const VALID_ITEM = { ...VALID_PRODUCT, quantity: 2 }

describe('isCartQuantity', () => {
  it.each([1, 2, 99, Number.MAX_SAFE_INTEGER])(
    'accepts the positive safe integer %s',
    (quantity) => {
      expect(isCartQuantity(quantity)).toBe(true)
    },
  )

  it.each([
    0,
    -1,
    1.5,
    Infinity,
    -Infinity,
    NaN,
    Number.MAX_SAFE_INTEGER + 1,
    '2',
    null,
    undefined,
    {},
  ])('rejects %s (case %#)', (quantity) => {
    expect(isCartQuantity(quantity)).toBe(false)
  })
})

describe('isCartProduct', () => {
  it('accepts a fully populated product', () => {
    expect(isCartProduct(VALID_PRODUCT)).toBe(true)
  })

  it('accepts a minimal product with only the required fields', () => {
    expect(isCartProduct({ objectID: 'p1', name: 'Widget' })).toBe(true)
  })

  it('accepts a product carrying unrelated extra fields', () => {
    expect(
      isCartProduct({ ...VALID_PRODUCT, productUrl: '/p1', nutrition: {} }),
    ).toBe(true)
  })

  it('accepts a zero price', () => {
    expect(isCartProduct({ ...VALID_PRODUCT, price: 0 })).toBe(true)
  })

  it('rejects a string price', () => {
    expect(isCartProduct({ ...VALID_PRODUCT, price: '19.99' })).toBe(false)
  })

  it('rejects a null price', () => {
    expect(isCartProduct({ ...VALID_PRODUCT, price: null })).toBe(false)
  })

  it.each([NaN, Infinity, -1])('rejects the price %s', (price) => {
    expect(isCartProduct({ ...VALID_PRODUCT, price })).toBe(false)
  })

  it('rejects a missing objectID', () => {
    expect(isCartProduct({ name: 'Widget' })).toBe(false)
  })

  it.each(['', '   '])('rejects the blank objectID %j', (objectID) => {
    expect(isCartProduct({ ...VALID_PRODUCT, objectID })).toBe(false)
  })

  it('rejects a non-string objectID', () => {
    expect(isCartProduct({ ...VALID_PRODUCT, objectID: 1 })).toBe(false)
  })

  it('rejects a missing name', () => {
    expect(isCartProduct({ objectID: 'p1' })).toBe(false)
  })

  it.each<[string, unknown]>([
    ['image', 1],
    ['brand', null],
  ])('rejects a non-string %s', (key, value) => {
    expect(isCartProduct({ ...VALID_PRODUCT, [key]: value })).toBe(false)
  })

  it.each([null, undefined, 'p1', 5, true, []])(
    'rejects the non-object entry %s (case %#)',
    (value) => {
      expect(isCartProduct(value)).toBe(false)
    },
  )
})

describe('isCartItem', () => {
  it('accepts a valid item', () => {
    expect(isCartItem(VALID_ITEM)).toBe(true)
  })

  it('accepts a string queryID', () => {
    expect(isCartItem({ ...VALID_ITEM, queryID: 'q1' })).toBe(true)
  })

  it('rejects a non-string queryID', () => {
    expect(isCartItem({ ...VALID_ITEM, queryID: 7 })).toBe(false)
  })

  it('rejects a product with no quantity', () => {
    expect(isCartItem(VALID_PRODUCT)).toBe(false)
  })

  it.each([0, -1, 1.5, NaN])('rejects the quantity %s', (quantity) => {
    expect(isCartItem({ ...VALID_ITEM, quantity })).toBe(false)
  })

  it('rejects an otherwise valid item with an invalid price', () => {
    expect(isCartItem({ ...VALID_ITEM, price: '19.99' })).toBe(false)
  })
})

describe('sanitizeCart', () => {
  it('returns a valid payload unchanged', () => {
    const cart = { items: [VALID_ITEM], updatedAt: 1700000000000 }
    expect(sanitizeCart(cart)).toEqual(cart)
  })

  it('keeps the valid items and drops only the invalid ones', () => {
    const valid = { objectID: 'A', name: 'Drill', price: 100, quantity: 2 }
    const stringPrice = { objectID: 'B', name: 'Saw', price: '250', quantity: 1 }
    const nullPrice = { objectID: 'C', name: 'Nail', price: null, quantity: 1 }
    const badQuantity = { objectID: 'D', name: 'Vise', price: 10, quantity: 0 }

    expect(
      sanitizeCart({
        items: [valid, stringPrice, nullPrice, badQuantity],
        updatedAt: 7,
      }),
    ).toEqual({ items: [valid], updatedAt: 7 })
  })

  it('drops non-object entries from the items array', () => {
    expect(
      sanitizeCart({ items: [null, 'nope', 5, VALID_ITEM], updatedAt: 3 }),
    ).toEqual({ items: [VALID_ITEM], updatedAt: 3 })
  })

  it('returns an empty item list when every item is invalid', () => {
    expect(
      sanitizeCart({
        items: [{ objectID: 'A', name: 'Drill', quantity: -1 }],
        updatedAt: 3,
      }),
    ).toEqual({ items: [], updatedAt: 3 })
  })

  it('preserves an empty but well-formed cart', () => {
    expect(sanitizeCart({ items: [], updatedAt: 5 })).toEqual({
      items: [],
      updatedAt: 5,
    })
  })

  it('does not mutate the payload it validates', () => {
    const items = [VALID_ITEM, { objectID: 'B', name: 'Saw', quantity: 0 }]
    const cart = { items, updatedAt: 1 }
    sanitizeCart(cart)
    expect(cart.items).toHaveLength(2)
    expect(items[0]).toEqual(VALID_ITEM)
  })

  it.each([
    null,
    undefined,
    'cart',
    5,
    true,
    [],
    {},
    { items: [] },
    { updatedAt: 1 },
    { items: 'invalid', updatedAt: 1 },
    { items: [], updatedAt: '1' },
    { items: [], updatedAt: NaN },
  ])('returns null for the non-cart-shaped payload %s (case %#)', (payload) => {
    expect(sanitizeCart(payload)).toBeNull()
  })
})
