import { atom, getDefaultStore } from 'jotai'

// Pinned to jotai's global store so this survives the Algolia environment remount.
export const groceryDeliveryMethodStore = getDefaultStore()

export type DeliveryMethod = 'delivery' | 'pickup'

export const groceryDeliveryMethodAtom = atom<DeliveryMethod>('delivery')

export const resetGroceryDeliveryMethodAtom = atom(null, (_get, set) => {
  set(groceryDeliveryMethodAtom, 'delivery')
})
