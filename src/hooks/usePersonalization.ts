'use client'

import { useAtomValue } from 'jotai'

import { useRealtimeProfile } from '@/hooks/useRealtimeProfile'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'
import { getPersonalizationMode } from '@/utilities/getPersonalizationMode'

export type { PersonalizationMode } from '@/utilities/getPersonalizationMode'

// Shared so callers memoizing on the filters keep a stable reference.
const NO_OPTIONAL_FILTERS: string[] = []

/**
 * The Insights userToken for the active profile — atoms only, no request.
 *
 * Split out of `usePersonalization` because sending an event needs the token and
 * nothing else. Going through the full hook would subscribe every component that
 * fires an event to `useRealtimeProfile`'s polling query, which means a
 * `QueryClientProvider` in the tree of every clickable card for a value none of
 * them read.
 */
export const useCurrentUserToken = (): string => {
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const realtimeEnabled = useAtomValue(realtimePersoEnabledAtom, {
    store: personalizationStore,
  })
  const realtimeToken = useAtomValue(realtimeSessionTokenAtom, {
    store: personalizationStore,
  })

  return realtimeEnabled ? realtimeToken : (persona?.token ?? '')
}

export const usePersonalization = () => {
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const realtimeEnabled = useAtomValue(realtimePersoEnabledAtom, {
    store: personalizationStore,
  })
  const realtimeToken = useAtomValue(realtimeSessionTokenAtom, {
    store: personalizationStore,
  })
  const currentUserToken = useCurrentUserToken()

  const { data: realtimeFilters } = useRealtimeProfile(
    realtimeEnabled ? realtimeToken : '',
  )

  const mode = getPersonalizationMode({ persona, realtimeEnabled })

  const currentOptionalFilters = realtimeEnabled
    ? (realtimeFilters ?? NO_OPTIONAL_FILTERS)
    : persona?.type === 'customerGroup'
      ? NO_OPTIONAL_FILTERS
      : (persona?.optionalFilters ?? NO_OPTIONAL_FILTERS)

  return { currentUserToken, currentOptionalFilters, mode }
}
