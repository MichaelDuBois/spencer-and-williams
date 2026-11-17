import { createJSONStorage } from 'jotai/utils'

// sessionStorage does not exist during SSR, and atoms with `getOnInit` read
// storage while initializing — so the server needs an inert stand-in.
const serverStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
}

/**
 * A JSON storage backed by sessionStorage (per-tab, cleared when the tab
 * closes) instead of localStorage. Used for demo state that should reset for a
 * fresh session — cart, current order, and order history — so a new tab or a
 * new demo starts clean rather than inheriting stale items.
 */
export const createSessionJSONStorage = <T>() =>
  createJSONStorage<T>(() =>
    typeof window === 'undefined' ? serverStorage : sessionStorage,
  )
