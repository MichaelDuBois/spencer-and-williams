import { atom, getDefaultStore } from 'jotai'

import type { SelectableProfile } from '@/types'

// Pinned to jotai's global store so these survive the Algolia environment remount.
export const personalizationStore = getDefaultStore()

export const activePersonaAtom = atom<SelectableProfile | null>(null)
export const realtimePersoEnabledAtom = atom(false)
export const realtimeSessionTokenAtom = atom('')

export const setPersonaModeAtom = atom(
  null,
  (_get, set, persona: SelectableProfile | null) => {
    set(activePersonaAtom, persona)
    set(realtimePersoEnabledAtom, false)
    set(realtimeSessionTokenAtom, '')
  },
)

export const resetPersonalizationAtom = atom(null, (_get, set) => {
  set(activePersonaAtom, null)
  set(realtimePersoEnabledAtom, false)
  set(realtimeSessionTokenAtom, '')
})

export const setRealtimeModeAtom = atom(null, (_get, set) => {
  set(activePersonaAtom, null)
  set(realtimePersoEnabledAtom, true)
  set(realtimeSessionTokenAtom, `realtime-${crypto.randomUUID()}`)
})
