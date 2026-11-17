import type { Cart, CartItem, CartProduct } from '@/stores/cart'
import { isRecord } from '@/utilities/isRecord'

export const isCartQuantity = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

export const isCartProduct = (value: unknown): value is CartProduct =>
  isRecord(value) &&
  typeof value.objectID === 'string' &&
  value.objectID.trim().length > 0 &&
  typeof value.name === 'string' &&
  (value.price === undefined ||
    (typeof value.price === 'number' &&
      Number.isFinite(value.price) &&
      value.price >= 0)) &&
  ['image', 'brand'].every(
    (key) => value[key] === undefined || typeof value[key] === 'string',
  )

export const isCartItem = (value: unknown): value is CartItem =>
  isCartProduct(value) &&
  isRecord(value) &&
  isCartQuantity(value.quantity) &&
  (value.queryID === undefined || typeof value.queryID === 'string')

/**
 * Narrows a persisted payload to a cart, keeping only the items that validate
 * individually. Returns null when the payload is not cart-shaped at all, which
 * is the only case that warrants falling back to the initial cart — a single
 * stale item must not discard the rest.
 */
export const sanitizeCart = (value: unknown): Cart | null => {
  if (
    !isRecord(value) ||
    typeof value.updatedAt !== 'number' ||
    !Number.isFinite(value.updatedAt) ||
    !Array.isArray(value.items)
  )
    return null

  return { items: value.items.filter(isCartItem), updatedAt: value.updatedAt }
}
