'use client'

import { useQuery } from '@tanstack/react-query'

import { PROFILE_REQUEST_TIMEOUT_MS } from '@/features/aiAssistant/constants'
import { useActiveConfig } from '@/hooks/useActiveConfig'

interface PersonalizationProfile {
  [facet: string]: Record<string, number>
}

const fetchProfile = async (
  token: string,
  appId: string,
  apiKey: string,
): Promise<PersonalizationProfile> => {
  try {
    const response = await fetch(
      `https://personalization.us.algolia.com/1/profiles/personalization/${encodeURIComponent(token)}`,
      {
        headers: {
          'X-Algolia-Application-Id': appId,
          'X-Algolia-API-Key': apiKey,
        },
        signal: AbortSignal.timeout(PROFILE_REQUEST_TIMEOUT_MS),
      },
    )
    if (!response.ok) return {}
    const data = await response.json()
    return data.scores ?? {}
  } catch {
    return {}
  }
}

export const usePersonalizationProfile = (token: string) => {
  const config = useActiveConfig()
  const appId = config?.algolia.appId ?? ''
  const apiKey = config?.algolia.apiKey ?? ''

  return useQuery({
    queryKey: ['personalization-profile', appId, token],
    queryFn: () => fetchProfile(token, appId, apiKey),
    enabled: token !== '' && appId !== '' && apiKey !== '',
    staleTime: 30_000,
  })
}
