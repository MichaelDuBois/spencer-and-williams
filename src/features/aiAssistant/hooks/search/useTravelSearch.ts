import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import {
  getActivityHitValues,
  getArticleHitValues,
  getPodcastHitValues,
} from '@/app/travel/_utils/getTravelHitValues'
import type {
  TravelActivityHitTemplate,
  TravelArticleHitTemplate,
  TravelPodcastHitTemplate,
} from '@/app/travel/types'
import type {
  AssistantSearchOptions,
  TravelSearchQuery,
  TravelContentSummary,
  TravelContentData,
  TravelContentType,
  UnifiedSearchResult,
} from '@/features/aiAssistant/types'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'
import type { PersonalizationSearchParams } from '@/utilities/personalizationParams'

import type { QueryClient } from '@tanstack/react-query'
import type { liteClient } from 'algoliasearch/lite'

type AlgoliaLiteClient = ReturnType<typeof liteClient>

interface SearchHit {
  objectID: string
  [key: string]: unknown
}

const getIndexName = (
  type: TravelContentType,
  algolia: VerticalConfig['algolia'],
): string | null => {
  switch (type) {
    case 'articles':
      return algolia.primaryIndex?.name ?? null
    case 'podcasts':
      return algolia.indices.podcasts?.name ?? null
    case 'activities':
      return algolia.indices.activities?.name ?? null
    default:
      return null
  }
}

const runTravelSearch = async (
  queries: TravelSearchQuery[],
  searchClient: AlgoliaLiteClient,
  config: VerticalConfig,
  queryClient: QueryClient,
  { personalizationParams }: AssistantSearchOptions = {},
): Promise<UnifiedSearchResult> => {
  if (!queries || queries.length === 0) {
    return { summaries: [] }
  }

  if (config.slug !== 'travel') {
    return { summaries: [] }
  }

  const { primaryIndex, indices } = config.algolia
  const travelArticleHitTemplate = primaryIndex?.template as
    | TravelArticleHitTemplate
    | undefined
  const travelPodcastHitTemplate = indices.podcasts?.template as
    | TravelPodcastHitTemplate
    | undefined
  const travelActivityHitTemplate = indices.activities?.template as
    | TravelActivityHitTemplate
    | undefined

  // Build search requests for each query
  const searchRequests = queries
    .map((q) => {
      const indexName = getIndexName(q.index, config.algolia)
      if (!indexName) return null

      return {
        indexName,
        query: q.query,
        params: {
          ...personalizationParams,
          hitsPerPage: 10,
        },
        // Pass filters once we add facets to the travel index
        // filters: q.filters,
        _contentType: q.index,
      }
    })
    .filter(Boolean) as Array<{
    indexName: string
    query: string
    params: PersonalizationSearchParams & { hitsPerPage: number }
    _contentType: TravelContentType
  }>

  if (searchRequests.length === 0) {
    return { summaries: [] }
  }

  // Execute multi-query search
  const response = await searchClient.search<SearchHit>(
    searchRequests.map(({ _contentType, ...req }) => req),
  )

  const contentMap = new Map<string, TravelContentData>()
  const summaries: TravelContentSummary[] = []

  // Process results from each index
  response.results.forEach((result, index) => {
    if (!('hits' in result)) return

    const contentType = searchRequests[index]._contentType

    result.hits.forEach((hit) => {
      // Skip duplicates
      const key = `${contentType}:${hit.objectID}`
      if (contentMap.has(key)) return

      let contentData: TravelContentData | null = null

      switch (contentType) {
        case 'articles':
          if (travelArticleHitTemplate) {
            contentData = {
              ...getArticleHitValues(
                hit,
                travelArticleHitTemplate,
                config.slug,
              ),
              type: 'articles',
            }
          }
          break
        case 'podcasts':
          if (travelPodcastHitTemplate) {
            contentData = {
              ...getPodcastHitValues(
                hit,
                travelPodcastHitTemplate,
                config.slug,
              ),
              type: 'podcasts',
            }
          }
          break
        case 'activities':
          if (travelActivityHitTemplate) {
            contentData = {
              ...getActivityHitValues(
                hit,
                travelActivityHitTemplate,
                config.slug,
              ),
              type: 'activities',
            }
          }
          break
      }

      if (contentData) {
        contentMap.set(key, contentData)

        // Cache the content data for later retrieval by UI components
        queryClient.setQueryData(
          ['travelContent', contentType, hit.objectID],
          contentData,
        )

        // Build summary for agent
        const summary: TravelContentSummary = {
          objectID: hit.objectID,
          type: contentType,
          title: contentData.title,
        }

        // Add appropriate fields based on content type
        if (contentType === 'podcasts' && 'episode' in contentData) {
          summary.episode = contentData.episode
          summary.summary = contentData.summary
        } else if ('subtitle' in contentData) {
          summary.subtitle = contentData.subtitle
        }

        summaries.push(summary)
      }
    })
  })

  return { summaries }
}

/**
 * Hook for searching travel content across multiple indices.
 */
export const useTravelSearch = ({
  personalizationParams,
}: AssistantSearchOptions = {}) => {
  const searchClient = useAtomValue(baseSearchClientAtom)
  const config = useActiveConfig()
  const queryClient = useQueryClient()

  return useCallback(
    (queries: TravelSearchQuery[]): Promise<UnifiedSearchResult> => {
      if (!searchClient || !config) return Promise.resolve({ summaries: [] })
      return runTravelSearch(queries, searchClient, config, queryClient, {
        personalizationParams,
      })
    },
    [searchClient, config, queryClient, personalizationParams],
  )
}
