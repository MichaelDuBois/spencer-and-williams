import { atomWithStorage } from 'jotai/utils'

import { createSessionJSONStorage } from '@/stores/sessionJSONStorage'
import { sanitizeCart } from '@/utilities/cartValidation'

export interface CartProduct {
  objectID: string
  name: string
  image?: string
  price?: number
  brand?: string
}

export interface CartItem extends CartProduct {
  quantity: number
  queryID?: string
  /** Algolia app that generated queryID; absent on legacy cart items. */
  queryAppId?: string
}

export interface Cart {
  items: CartItem[]
  updatedAt: number
}

const initialCart: Cart = {
  items: [],
  updatedAt: Date.now(),
}

const getStorageKey = (vertical: string) => `spencer-williams-${vertical}-cart`

type CartStorage = ReturnType<typeof createSessionJSONStorage<Cart>>

const persistedStorage = createSessionJSONStorage<unknown>()

const readCart = (value: unknown, initialValue: Cart): Cart =>
  sanitizeCart(value) ?? initialValue

/**
 * Validates every read path itself instead of using Jotai's unstable storage
 * validator, which only wraps `getItem` — leaving `subscribe` free to seat an
 * unvalidated `storage` event straight into the atom.
 */
const cartStorage: CartStorage = {
  getItem: (key, initialValue) =>
    readCart(persistedStorage.getItem(key, initialValue), initialValue),
  setItem: (key, value) => persistedStorage.setItem(key, value),
  removeItem: (key) => persistedStorage.removeItem(key),
  subscribe: (key, callback, initialValue) =>
    persistedStorage.subscribe?.(
      key,
      (value) => callback(readCart(value, initialValue)),
      initialValue,
    ),
}

const cartAtomCache = new Map<
  string,
  ReturnType<typeof atomWithStorage<Cart>>
>()

export const getCartAtom = (vertical: string) => {
  if (!cartAtomCache.has(vertical)) {
    cartAtomCache.set(
      vertical,
      atomWithStorage<Cart>(getStorageKey(vertical), initialCart, cartStorage),
    )
  }
  return cartAtomCache.get(vertical)!
}
