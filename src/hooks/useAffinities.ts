'use client'

import { usePersonalizationProfile } from '@/hooks/usePersonalizationProfile'
import { useRealtimeProfile } from '@/hooks/useRealtimeProfile'
import type { SelectableProfile } from '@/types'
import {
  parseOptionalFilters,
  type AffinitiesMap,
} from '@/utilities/parseOptionalFilters'

const isRealtimeToken = (token: string) => token.startsWith('realtime-')

export const useAffinities = (
  token: string,
  persona: SelectableProfile | undefined,
) => {
  const isCustomerGroup = persona?.type === 'customerGroup'
  const profileToken = isCustomerGroup ? '' : token
  const realtime = isRealtimeToken(profileToken)

  const { data: personaProfile, isLoading: personaLoading } =
    usePersonalizationProfile(realtime ? '' : profileToken)
  const { data: realtimeFilters, isLoading: realtimeLoading } =
    useRealtimeProfile(realtime ? profileToken : '')

  if (isCustomerGroup) return { affinities: null, isLoading: false }

  const isLoading = realtime ? realtimeLoading : personaLoading

  if (realtime) {
    const affinities: AffinitiesMap | null =
      realtimeFilters && realtimeFilters.length > 0
        ? parseOptionalFilters(realtimeFilters)
        : null
    return { affinities, isLoading }
  }

  const hasApiAffinities =
    personaProfile && Object.keys(personaProfile).length > 0
  const affinities: AffinitiesMap | null = hasApiAffinities
    ? personaProfile
    : persona
      ? parseOptionalFilters(persona.optionalFilters)
      : null

  return { affinities, isLoading }
}
