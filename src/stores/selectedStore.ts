import { atom, getDefaultStore } from 'jotai'

// Pinned to jotai's global store so this survives the Algolia environment remount.
export const selectedStoreStore = getDefaultStore()

export interface SelectedStore {
  vertical: string
  storeId: string
}

export const selectedStoreAtom = atom<SelectedStore | null>(null)

// A cleared `?storeId=` that must not re-hydrate, scoped to its vertical.
export const ignoredUrlStoreIdAtom = atom<SelectedStore | null>(null)
