import { fetchSortingStrategy, runComposition } from '@/lib/composition'
import type { IndexReplica } from '@/types/verticalConfig.types'

import type { liteClient } from 'algoliasearch/lite'

type SearchClient = ReturnType<typeof liteClient>

interface SearchRequest {
  indexName: string
  params?: Record<string, unknown>
}

interface CompositionSearchClientOptions {
  baseClient: SearchClient
  appId: string
  apiKey: string
  compositionId: string
  primaryIndexName: string
  replicas?: IndexReplica[]
}

// Params that InstantSearch sends but the Composition API rejects at runtime.
// `distinct` is configured inside the composition itself, so passing it at
// runtime returns a 400 and empties the results.
const BLOCKED_PARAMS = new Set([
  'attributesToRetrieve',
  'attributesToHighlight',
  'attributesToSnippet',
  'highlightPreTag',
  'highlightPostTag',
  'extensions',
  'distinct',
])

export const createCompositionSearchClient = ({
  baseClient,
  appId,
  apiKey,
  compositionId,
  primaryIndexName,
  replicas,
}: CompositionSearchClientOptions): SearchClient => {
  // SortBy switches the index name to a replica. Sorting a replica directly
  // would bypass the composition and lose its groups, so replica requests are
  // sent to the composition with the matching `sortingStrategy` label instead.
  const sortLabelByIndex = new Map(
    (replicas ?? []).map((replica) => [replica.indexName, replica.label]),
  )

  // Fetched once per client, and only when a sort is actually applied.
  let sortingStrategyRequest: Promise<Record<string, string> | null> | null =
    null
  const getSortingStrategy = () => {
    sortingStrategyRequest ??= fetchSortingStrategy({
      credentials: { appId, apiKey },
      compositionId,
    })
    return sortingStrategyRequest
  }

  const warnedLabels = new Set<string>()
  const warnUnmappedSort = (label: string, indexName: string) => {
    if (process.env.NODE_ENV === 'production' || warnedLabels.has(label)) return
    warnedLabels.add(label)
    console.warn(
      `[composition] ${compositionId} has no sortingStrategy entry mapping "${label}" to ${indexName}. Falling back to the replica index: sorting works, but composition groups are unavailable while this sort is active.`,
    )
  }

  return {
    ...baseClient,
    search: async (requests: SearchRequest[]) => {
      // A sort the composition doesn't know about falls back to the replica.
      const hasSortedRequest = requests.some((request) =>
        sortLabelByIndex.has(request.indexName),
      )
      const sortingStrategy = hasSortedRequest
        ? await getSortingStrategy()
        : null

      const isCompositionRequest = (request: SearchRequest) => {
        if (request.indexName === primaryIndexName) return true

        const label = sortLabelByIndex.get(request.indexName)
        if (label === undefined) return false
        if (sortingStrategy?.[label] === request.indexName) return true

        warnUnmappedSort(label, request.indexName)
        return false
      }

      const compositionIndices: number[] = []
      const otherRequests: { index: number; request: SearchRequest }[] = []

      requests.forEach((request, index) => {
        if (isCompositionRequest(request)) {
          compositionIndices.push(index)
        } else {
          otherRequests.push({ index, request })
        }
      })

      const extensionsRequest = compositionIndices.find(
        (i) => requests[i].params?.extensions,
      )
      const hasExtensions = extensionsRequest !== undefined

      const [compositionResults, standardResults, extensionsResult] =
        await Promise.all([
          Promise.all(
            compositionIndices.map((i) => {
              const request = requests[i]
              const sortBy = sortLabelByIndex.get(request.indexName)
              const allParams = {
                ...request.params,
                getRankingInfo: true,
                ...(sortBy && { sortBy }),
              }
              const params = Object.fromEntries(
                Object.entries(allParams).filter(
                  ([key]) => !BLOCKED_PARAMS.has(key),
                ),
              )
              return runComposition({
                credentials: { appId, apiKey },
                compositionId,
                params,
              })
            }),
          ),
          otherRequests.length > 0
            ? baseClient.search(
                otherRequests.map((r) => r.request) as Parameters<
                  SearchClient['search']
                >[0],
              )
            : Promise.resolve({ results: [] }),
          hasExtensions
            ? baseClient.search([requests[extensionsRequest]] as Parameters<
                SearchClient['search']
              >[0])
            : Promise.resolve(null),
        ])

      const results = new Array(requests.length)

      const extensionsResponse = extensionsResult
        ? (
            extensionsResult as {
              results: {
                extensions?: Record<string, unknown>
                renderingContent?: Record<string, unknown>
              }[]
            }
          ).results[0]
        : undefined
      const extensionsData = extensionsResponse?.extensions
      const facetOrdering = extensionsResponse?.renderingContent?.facetOrdering

      compositionIndices.forEach((requestIndex, i) => {
        const hadExtensions = Boolean(requests[requestIndex].params?.extensions)
        const compositionResult = compositionResults[i] as {
          renderingContent?: Record<string, unknown>
        }
        // Composition strips `extensions`, so dynamic facet ordering is
        // computed by the parallel standard search. Overlay its facetOrdering
        // onto the composition renderingContent (keeping redirects/banners).
        const mergedRenderingContent =
          hadExtensions && facetOrdering
            ? {
                ...compositionResult.renderingContent,
                facetOrdering,
              }
            : compositionResult.renderingContent

        results[requestIndex] = {
          index: requests[requestIndex].indexName,
          ...compositionResults[i],
          ...(hadExtensions &&
            extensionsData && { extensions: extensionsData }),
          ...(mergedRenderingContent && {
            renderingContent: mergedRenderingContent,
          }),
        }
      })

      otherRequests.forEach(({ index: requestIndex }, i) => {
        results[requestIndex] = (
          standardResults as { results: unknown[] }
        ).results[i]
      })

      return { results }
    },
  } as SearchClient
}
