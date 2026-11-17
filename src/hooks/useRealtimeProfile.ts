'use client'

import { useQuery } from '@tanstack/react-query'

import { PROFILE_REQUEST_TIMEOUT_MS } from '@/features/aiAssistant/constants'
import { useActiveConfig } from '@/hooks/useActiveConfig'

interface RealtimeResponse {
  search?: Record<
    string,
    {
      filters?: {
        session?: string[]
      }
    }
  >
}

const fetchRealtimeFilters = async (
  token: string,
  appId: string,
  apiKey: string,
  indexName: string,
): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://ai-personalization.us.algolia.com/2/realtime/users/${encodeURIComponent(token)}`,
      {
        headers: {
          'X-Algolia-Application-Id': appId,
          'X-Algolia-API-Key': apiKey,
        },
        signal: AbortSignal.timeout(PROFILE_REQUEST_TIMEOUT_MS),
      },
    )
    if (!response.ok) return []
    const data: RealtimeResponse = await response.json()
    return data.search?.[indexName]?.filters?.session ?? []
  } catch {
    return []
  }
}

export const useRealtimeProfile = (token: string) => {
  const config = useActiveConfig()
  const appId = config?.algolia.appId ?? ''
  const apiKey = config?.algolia.apiKey ?? ''
  const indexName = config?.algolia.primaryIndex.name ?? ''

  return useQuery({
    queryKey: ['realtime-profile', appId, token, indexName],
    queryFn: () => fetchRealtimeFilters(token, appId, apiKey, indexName),
    enabled: token !== '' && appId !== '' && apiKey !== '' && indexName !== '',
    staleTime: 5_000,
    refetchInterval: 10_000,
  })
}
