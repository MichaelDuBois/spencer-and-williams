import { compositionClient, type SearchResponse } from '@algolia/composition'

type CompositionSearchClient = ReturnType<typeof compositionClient>

const clientCache = new Map<string, CompositionSearchClient>()

const getClient = (appId: string, apiKey: string): CompositionSearchClient => {
  const key = `${appId}:${apiKey}`
  if (!clientCache.has(key)) {
    clientCache.set(key, compositionClient(appId, apiKey))
  }
  return clientCache.get(key)!
}

interface MultifeedCredentials {
  appId: string
  apiKey: string
}

export interface MultifeedCompositionArgs {
  credentials: MultifeedCredentials
  compositionId: string
  mainCompositionId?: string
  params: Record<string, unknown>
  includeMainFeeds?: boolean
}

export interface MultifeedHit extends Record<string, unknown> {
  objectID: string
  __position: number
  __queryID?: string
}

export interface MultifeedCompositionResult {
  feedId: string
  title: string
  indexName: string
  hits: MultifeedHit[]
}

interface MultifeedResultItem {
  hits?: (Record<string, unknown> & { objectID: string })[]
  queryID?: string
  index?: string
  indexUsed?: string
  feedID?: string
  compositions?: Record<string, { injectedItems?: { key: string }[] }>
}

const hasInjectedItemsFor = (
  r: MultifeedResultItem,
  compositionId: string,
): boolean => {
  const entry = r.compositions?.[compositionId]
  return !!entry?.injectedItems?.length
}

const isComposedBy = (
  hit: Record<string, unknown>,
  compositionId: string,
): boolean => {
  const rankingInfo = hit._rankingInfo as
    | { composed?: Record<string, unknown> }
    | undefined
  return !!rankingInfo?.composed?.[compositionId]
}

export const runMultifeedComposition = async ({
  credentials,
  compositionId,
  mainCompositionId,
  params,
  includeMainFeeds = false,
}: MultifeedCompositionArgs): Promise<MultifeedCompositionResult[]> => {
  const client = getClient(credentials.appId, credentials.apiKey)

  const response: SearchResponse = await client.search({
    compositionID: compositionId,
    requestBody: { params: { ...params, getRankingInfo: true } },
  })

  const results = response.results
  if (!Array.isArray(results)) return []

  // `includeMainFeeds` skips the injected/composed guards, so "no rule
  // matches, no rails" relies on the composition returning no feed with hits.
  // `media_multifeed` has only an empty `Default` base feed (`vote_count < 0`),
  // so an unmatched query returns no hits and is dropped; a composition with a
  // non-empty default or main feed would show it.
  return (results as MultifeedResultItem[])
    .filter(
      (r) =>
        r.hits?.length &&
        r.feedID &&
        (includeMainFeeds || hasInjectedItemsFor(r, compositionId)),
    )
    .map((r) => {
      const indexName = r.indexUsed ?? r.index ?? ''
      // Main-only feeds carry no `_rankingInfo.composed` keys, so every hit is kept.
      const composedHits = (r.hits ?? [])
        .filter(
          (hit) =>
            includeMainFeeds ||
            (isComposedBy(hit, compositionId) &&
              !(mainCompositionId && isComposedBy(hit, mainCompositionId))),
        )
        .map((hit, pos) => {
          return {
            ...hit,
            __position: pos + 1,
            __queryID: r.queryID,
          }
        })
      const injectedKeys = (
        r.compositions?.[compositionId]?.injectedItems ?? []
      ).map((item) => item.key)
      const title =
        [...new Set(injectedKeys)].join(' & ') || r.feedID || indexName

      return {
        feedId: r.feedID ?? indexName,
        title,
        indexName,
        hits: composedHits,
      }
    })
    .filter((feed) => feed.hits.length > 0)
}
