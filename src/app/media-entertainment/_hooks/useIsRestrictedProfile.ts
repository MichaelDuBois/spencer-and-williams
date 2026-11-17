'use client'

import { useAtomValue } from 'jotai'

import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import {
  activePersonaAtom,
  personalizationStore,
} from '@/stores/personalization'

const { restrictedProfileIds } = mediaEntertainmentConfig.assistant

/**
 * Whether the active profile is one config marks as restricted.
 *
 * Shared rather than inlined at each call site: it decides both the search filter
 * that enforces the limit and the wording that explains it, and those two must
 * never disagree about which profile is a kids profile.
 */
export const useIsRestrictedProfile = (): boolean => {
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })

  return Boolean(persona && restrictedProfileIds.includes(persona.id))
}
