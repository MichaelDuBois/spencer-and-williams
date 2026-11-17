import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'

import { getCartAtom } from '@/stores/cart'

describe('getCartAtom', () => {
  it('returns the same atom instance for a given vertical (cached)', () => {
    expect(getCartAtom('ecommerce')).toBe(getCartAtom('ecommerce'))
  })

  it('returns distinct atoms for different verticals', () => {
    expect(getCartAtom('ecommerce')).not.toBe(getCartAtom('fashion'))
  })

  it('initializes with an empty cart', () => {
    const store = createStore()
    const cart = store.get(getCartAtom('cart-init-test'))
    expect(cart.items).toEqual([])
  })

  it('isolates cart state between verticals', () => {
    const store = createStore()
    const ecommerceAtom = getCartAtom('iso-ecommerce')
    const fashionAtom = getCartAtom('iso-fashion')

    store.set(ecommerceAtom, {
      items: [
        {
          objectID: 'p1',
          name: 'Item',
          quantity: 1,
        },
      ],
      updatedAt: 1,
    })

    expect(store.get(ecommerceAtom).items).toHaveLength(1)
    expect(store.get(fashionAtom).items).toEqual([])
  })
})

it('loads a valid legacy cart without eligibility metadata', () => {
  const atom = getCartAtom('legacy-cart')
  const saved = {
    items: [{ objectID: 'A', name: 'Drill', quantity: 2, price: 100 }],
    updatedAt: 1,
  }
  sessionStorage.setItem(
    'spencer-williams-legacy-cart-cart',
    JSON.stringify(saved),
  )
  const store = createStore()
  const unsubscribe = store.sub(atom, () => {})
  expect(store.get(atom)).toEqual(saved)
  unsubscribe()
})

it.each([
  null,
  { items: 'invalid', updatedAt: 1 },
  { items: [{ objectID: 'A', name: 'Drill', quantity: -1 }], updatedAt: 1 },
  {
    items: [{ objectID: 'A', name: 'Drill', quantity: 1, price: '100' }],
    updatedAt: 1,
  },
])('rejects malformed persisted cart %j', (saved) => {
  const atom = getCartAtom('malformed-cart')
  sessionStorage.setItem(
    'spencer-williams-malformed-cart-cart',
    JSON.stringify(saved),
  )
  const store = createStore()
  const unsubscribe = store.sub(atom, () => {})
  expect(store.get(atom).items).toEqual([])
  unsubscribe()
})

describe('persisted cart storage', () => {
  const readPersisted = (vertical: string, raw: string) => {
    sessionStorage.setItem(`spencer-williams-${vertical}-cart`, raw)
    const atom = getCartAtom(vertical)
    const store = createStore()
    const unsubscribe = store.sub(atom, () => {})
    const cart = store.get(atom)
    unsubscribe()
    return cart
  }

  const VALID_ITEM = { objectID: 'A', name: 'Drill', price: 100, quantity: 2 }

  it('keeps the individually valid items and drops only the invalid ones', () => {
    const cart = readPersisted(
      'partially-valid-cart',
      JSON.stringify({
        items: [
          VALID_ITEM,
          { objectID: 'B', name: 'Saw', price: '250', quantity: 1 },
          { objectID: 'C', name: 'Nail', price: null, quantity: 1 },
        ],
        updatedAt: 42,
      }),
    )

    expect(cart).toEqual({ items: [VALID_ITEM], updatedAt: 42 })
  })

  it('round-trips a fully valid payload unchanged', () => {
    const saved = {
      items: [VALID_ITEM, { objectID: 'B', name: 'Saw', quantity: 1 }],
      updatedAt: 99,
    }

    expect(readPersisted('valid-cart', JSON.stringify(saved))).toEqual(saved)
  })

  it('falls back to the empty cart when the payload is unparseable', () => {
    expect(readPersisted('unparseable-cart', '{not json').items).toEqual([])
  })

  it('falls back to the empty cart when the payload is not cart-shaped', () => {
    const cart = readPersisted('unshaped-cart', JSON.stringify([VALID_ITEM]))
    expect(cart.items).toEqual([])
  })

  it('validates a value arriving through the storage subscription', () => {
    const vertical = 'subscribed-cart'
    const key = `spencer-williams-${vertical}-cart`
    const atom = getCartAtom(vertical)
    const store = createStore()
    const unsubscribe = store.sub(atom, () => {})

    window.dispatchEvent(
      new StorageEvent('storage', {
        key,
        storageArea: sessionStorage,
        newValue: JSON.stringify({
          items: [
            VALID_ITEM,
            { objectID: 'B', name: 'Saw', price: '250', quantity: 1 },
          ],
          updatedAt: 55,
        }),
      }),
    )

    expect(store.get(atom)).toEqual({ items: [VALID_ITEM], updatedAt: 55 })
    unsubscribe()
  })

  it('falls back to the empty cart when a storage event is not cart-shaped', () => {
    const vertical = 'subscribed-invalid-cart'
    const key = `spencer-williams-${vertical}-cart`
    const atom = getCartAtom(vertical)
    const store = createStore()
    const unsubscribe = store.sub(atom, () => {})

    const dispatch = (payload: unknown) =>
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          storageArea: sessionStorage,
          newValue: JSON.stringify(payload),
        }),
      )

    // Seat a valid cart first, so the fallback below is observable rather than
    // indistinguishable from the initial empty cart.
    dispatch({ items: [VALID_ITEM], updatedAt: 10 })
    expect(store.get(atom).items).toEqual([VALID_ITEM])

    dispatch({ items: 'invalid', updatedAt: 1 })
    expect(store.get(atom).items).toEqual([])
    unsubscribe()
  })
})
