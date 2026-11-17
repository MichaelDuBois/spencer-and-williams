'use client'

import { atom, getDefaultStore } from 'jotai'

export type AlgoliaEnvironment = 'production' | 'staging'

export const algoliaEnvironmentAtom = atom<AlgoliaEnvironment>('production')

// In-memory by design: the acknowledgement expires with the flag it warns about.
export const stagingNoticeAcknowledgedAtom = atom(false)

// Module-lifetime store: survives client navigation, resets on hard reload.
export const algoliaEnvironmentStore = getDefaultStore()
