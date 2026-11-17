import { atomWithStorage } from 'jotai/utils'

import type { CartItem } from '@/stores/cart'
import { createSessionJSONStorage } from '@/stores/sessionJSONStorage'

export interface OrderItem extends CartItem {
  // Unit amounts at checkout; price remains the amount paid.
  basePrice?: number
  discount?: number
}

export interface OrderBase {
  id: string
  items: OrderItem[]
}

export interface Order extends OrderBase {
  subtotal: number
  shipping: number
  total: number
  createdAt: number
}

const getStorageKey = (vertical: string) => `spencer-williams-${vertical}-order`

const orderStorage = createSessionJSONStorage<Order | null>()

const orderAtomCache = new Map<
  string,
  ReturnType<typeof atomWithStorage<Order | null>>
>()

export const getOrderAtom = (vertical: string) => {
  if (!orderAtomCache.has(vertical)) {
    orderAtomCache.set(
      vertical,
      atomWithStorage<Order | null>(
        getStorageKey(vertical),
        null,
        orderStorage,
      ),
    )
  }
  return orderAtomCache.get(vertical)!
}
