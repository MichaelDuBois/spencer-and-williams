import type {
  QueryAttribution,
  SearchQuery,
} from '@/features/aiAssistant/types'
import { getResultHits } from '@/utilities/getResultHits'

import type { LegacySearchMethodProps, liteClient } from 'algoliasearch/lite'

/**
 * One entry of the v4-style `search([...])` payload the lite client accepts.
 *
 * The shipped `LegacySearchQuery` type wraps every search parameter in `params`
 * and forgets that the query text also sits at the root, so it is added back.
 */
export type AssistantSearchRequest = LegacySearchMethodProps[number] & {
  query?: string
}

type AttributedHit = Record<string, unknown> & {
  __queryID?: QueryAttribution['queryID']
  __position: NonNullable<QueryAttribution['position']>
}

interface SearchWithFilterFallbackArgs {
  queries: SearchQuery[]
  signal?: AbortSignal
  searchClient: ReturnType<typeof liteClient>
  /**
   * Builds one request. With `withAgentFilters: false` it must keep the query
   * text and drop only the agent-authored filter expression — a vertical's own
   * baseline filters belong in both branches.
   */
  buildRequest: (
    query: SearchQuery,
    withAgentFilters: boolean,
  ) => AssistantSearchRequest
}

/**
 * Stamps each hit with the attribution its click event needs: the response's
 * `queryID` (same convention as the SRP hits) and the hit's 1-based rank within
 * its own result set. There is no pagination on the assistant search path, so
 * the in-page index is the full ranking.
 */
const toAttributedHits = (result: unknown): AttributedHit[] => {
  const { hits, queryID } = getResultHits(result)

  return hits.map((hit, index) => {
    return {
      ...hit,
      ...(queryID ? { __queryID: queryID } : {}),
      __position: index + 1,
    }
  })
}

/**
 * Runs a batch of assistant searches with the two-stage fallback every vertical
 * needs, and returns the deduped hits in encounter order.
 *
 * The agent writes the filter expressions, so they are the untrustworthy half of
 * every request. Stage one retries the whole batch without them when a single
 * malformed clause gets the batch rejected; stage two re-runs only the filtered
 * queries that matched nothing, since an over-narrow filter is indistinguishable
 * from no results at all. Both retries keep the query text and whatever baseline
 * filters the caller bakes into `buildRequest`.
 */
export const searchWithFilterFallback = async ({
  queries,
  searchClient,
  buildRequest,
  signal,
}: SearchWithFilterFallbackArgs): Promise<AttributedHit[]> => {
  signal?.throwIfAborted()
  if (!queries?.length) return []

  let didFallBack = false

  const response = await searchClient
    .search<
      Record<string, unknown>
    >(queries.map((query) => buildRequest(query, true)))
    .catch(() => {
      signal?.throwIfAborted()
      didFallBack = true

      return searchClient.search<Record<string, unknown>>(
        queries.map((query) => buildRequest(query, false)),
      )
    })

  signal?.throwIfAborted()
  const hitLists = response.results.map(toAttributedHits)

  const narrowIndices = didFallBack
    ? []
    : queries.reduce<number[]>((indices, query, index) => {
        if (query.filters && hitLists[index].length === 0) indices.push(index)

        return indices
      }, [])

  if (narrowIndices.length > 0) {
    // Swallowed: stage one already produced hits for the rest of the batch, and
    // a rejected widening is no reason to fail the whole search.
    const retried = await searchClient
      .search<
        Record<string, unknown>
      >(narrowIndices.map((index) => buildRequest(queries[index], false)))
      .catch(() => null)

    signal?.throwIfAborted()
    retried?.results.forEach((result, index) => {
      hitLists[narrowIndices[index]] = toAttributedHits(result)
    })
  }

  const dedupedByObjectID = new Map<string, AttributedHit>()

  hitLists.flat().forEach((hit) => {
    if (!hit.objectID) return

    const objectID = String(hit.objectID)
    if (!dedupedByObjectID.has(objectID)) dedupedByObjectID.set(objectID, hit)
  })

  return [...dedupedByObjectID.values()]
}
