import { compositionClient } from '@algolia/composition'

import type { SearchResponse } from '@algolia/composition'

type CompositionSearchClient = ReturnType<typeof compositionClient>

// Cache clients per appId to avoid re-creation on every search call
const clientCache = new Map<string, CompositionSearchClient>()

const getClient = (appId: string, apiKey: string): CompositionSearchClient => {
  const key = `${appId}:${apiKey}`
  if (!clientCache.has(key)) {
    clientCache.set(key, compositionClient(appId, apiKey))
  }
  return clientCache.get(key)!
}

interface CompositionCredentials {
  appId: string
  apiKey: string
}

export interface CompositionResponse {
  hits: Record<string, unknown>[]
  nbHits: number
  nbPages: number
  page: number
  hitsPerPage: number
  query: string
  params: string
  queryID?: string
  facets?: Record<string, Record<string, number>>
  facets_stats?: Record<
    string,
    { min: number; max: number; avg: number; sum: number }
  >
  [key: string]: unknown
}

export interface RunCompositionArgs {
  credentials: CompositionCredentials
  compositionId: string
  params: Record<string, unknown>
}

interface FetchSortingStrategyArgs {
  credentials: CompositionCredentials
  compositionId: string
}

/**
 * Reads the composition's `sortingStrategy` map (its sort labels and the
 * replicas they resolve to). Returns null when it can't be read — the key needs
 * the `settings` ACL — so callers can fall back to querying the replica.
 */
export const fetchSortingStrategy = async ({
  credentials,
  compositionId,
}: FetchSortingStrategyArgs): Promise<Record<string, string> | null> => {
  const client = getClient(credentials.appId, credentials.apiKey)

  try {
    const composition = (await client.getComposition({
      compositionID: compositionId,
    })) as { sortingStrategy?: Record<string, string> }

    return composition.sortingStrategy ?? {}
  } catch {
    return null
  }
}

export const runComposition = async ({
  credentials,
  compositionId,
  params,
}: RunCompositionArgs): Promise<CompositionResponse> => {
  const client = getClient(credentials.appId, credentials.apiKey)

  const response: SearchResponse = await client.search({
    compositionID: compositionId,
    requestBody: { params },
  })

  return response.results[0] as unknown as CompositionResponse
}
