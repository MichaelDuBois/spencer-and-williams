import { Provider, createStore } from 'jotai'

import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'
import { selectedStoreAtom, selectedStoreStore } from '@/stores/selectedStore'
import type { SelectableProfile } from '@/types'

import type { ReactNode } from 'react'

type TestStore = ReturnType<typeof createStore>

const isPersistentAtom = (atom: unknown) =>
  atom === activePersonaAtom ||
  atom === setPersonaModeAtom ||
  atom === setRealtimeModeAtom ||
  atom === realtimePersoEnabledAtom ||
  atom === realtimeSessionTokenAtom ||
  atom === selectedStoreAtom

const resetPersistentState = () => {
  personalizationStore.set(activePersonaAtom, null)
  personalizationStore.set(realtimePersoEnabledAtom, false)
  personalizationStore.set(realtimeSessionTokenAtom, '')
  selectedStoreStore.set(selectedStoreAtom, null)
}

const syncPersistentState = (atom: unknown, value: unknown) => {
  if (atom === activePersonaAtom) {
    personalizationStore.set(
      activePersonaAtom,
      value as SelectableProfile | null,
    )
  } else if (atom === setPersonaModeAtom) {
    personalizationStore.set(
      setPersonaModeAtom,
      value as SelectableProfile | null,
    )
  } else if (atom === setRealtimeModeAtom) {
    personalizationStore.set(setRealtimeModeAtom)
  } else if (atom === realtimePersoEnabledAtom) {
    personalizationStore.set(realtimePersoEnabledAtom, Boolean(value))
  } else if (atom === realtimeSessionTokenAtom) {
    personalizationStore.set(realtimeSessionTokenAtom, String(value))
  } else if (atom === selectedStoreAtom) {
    selectedStoreStore.set(
      selectedStoreAtom,
      value as { vertical: string; storeId: string } | null,
    )
  }
}

/**
 * Creates a fresh, isolated Jotai store for a test. The `init` callback
 * pre-populates atoms in a type-safe way: `init={(s) => s.set(atom, value)}`.
 */
export const createTestStore = (init?: (store: TestStore) => void): TestStore => {
  const store = createStore()
  const set = store.set.bind(store)
  let isInitializing = true
  let didResetPersistentState = false
  const setWithPersistentState = ((atom: unknown, value?: unknown) => {
    if (
      isInitializing &&
      !didResetPersistentState &&
      isPersistentAtom(atom)
    ) {
      resetPersistentState()
      didResetPersistentState = true
    }
    Reflect.apply(set, store, [atom, value])
    syncPersistentState(atom, value)
  }) as typeof store.set

  store.set = setWithPersistentState
  init?.(store)
  isInitializing = false
  return store
}

/**
 * Jotai wrapper for `render` / `renderHook`. Reuses a provided store or creates
 * a fresh one, guaranteeing isolation between tests.
 */
export const buildJotaiWrapper = (store: TestStore = createTestStore()) => {
  const JotaiTestWrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return JotaiTestWrapper
}
