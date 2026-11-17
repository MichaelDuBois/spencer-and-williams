'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { useIsRestrictedProfile } from '@/app/media-entertainment/_hooks/useIsRestrictedProfile'
import {
  buildBaselineFilters,
  withBaselineFilters,
} from '@/app/media-entertainment/_utils/assistantSearchFilters'
import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { getAssistantAttributes } from '@/app/media-entertainment/_utils/titleAttributes'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'
import type { MediaEntertainmentHitTemplate } from '@/app/media-entertainment/types'
import { searchWithFilterFallback } from '@/features/aiAssistant/hooks/search/searchWithFilterFallback'
import type { AssistantSearchRequest } from '@/features/aiAssistant/hooks/search/searchWithFilterFallback'
import type {
  AssistantSearchOptions,
  MediaContentType,
  MediaSearchQuery,
  MediaTitleSummary,
  UnifiedSearchResult,
} from '@/features/aiAssistant/types'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'

import type { QueryClient } from '@tanstack/react-query'
import type { liteClient } from 'algoliasearch/lite'

type AlgoliaLiteClient = ReturnType<typeof liteClient>

const HITS_PER_PAGE = 12

const { slug, algolia, assistant } = mediaEntertainmentConfig
const { primaryIndex } = algolia

/** React Query key the assistant's cards read a resolved title back from. */
export const getMediaTitleQueryKey = (objectID: string) => [
  'mediaAssistantTitle',
  objectID,
]

const toSummary = (
  values: MediaEntertainmentTitleHitValues,
): MediaTitleSummary => {
  return {
    objectID: values.objectID,
    type: (values.type ?? 'movie') as MediaContentType,
    title: values.title,
    releaseYear: values.releaseYear,
    genres: values.genres,
    maturityRating: values.maturityRating,
    rating: values.rating,
    runtime: values.runtime,
    seasonCount: values.seasonCount,
    episodeCount: values.episodeCount,
  }
}

const runMediaSearch = async (
  queries: MediaSearchQuery[],
  searchClient: AlgoliaLiteClient,
  queryClient: QueryClient,
  baseline: string,
  template: MediaEntertainmentHitTemplate,
  { personalizationParams }: AssistantSearchOptions = {},
): Promise<UnifiedSearchResult> => {
  if (!queries?.length) return { summaries: [] }

  const attributes = getAssistantAttributes(template)

  // Both branches keep the baseline — never `filters` entirely, or a kids
  // profile would lose its guard on the retry paths.
  const buildRequest = (
    query: MediaSearchQuery,
    withAgentFilters: boolean,
  ): AssistantSearchRequest => {
    return {
      indexName: primaryIndex.name,
      query: query.query ?? '',
      params: {
        ...personalizationParams,
        hitsPerPage: HITS_PER_PAGE,
        filters: withAgentFilters
          ? withBaselineFilters(baseline, query.filters)
          : baseline,
        attributesToRetrieve: attributes,
        /**
         * Mood prompts are long natural-language strings and this catalogue has
         * no neural search, so strict AND matching returns nothing for exactly
         * the queries the assistant exists to answer. Making the words optional
         * is what keeps a keyword fallback usable when the agent does send prose.
         */
        removeWordsIfNoResults: 'allOptional',
      },
    }
  }

  const hits = await searchWithFilterFallback({
    queries,
    searchClient,
    buildRequest,
  })

  const summaries: MediaTitleSummary[] = []

  hits.forEach((hit) => {
    const values = getMediaEntertainmentHitValues(hit, template, slug)

    if (!values.objectID) return

    // Cached so the poster cards can render from the objectIDs the agent picks
    // without a second round trip.
    queryClient.setQueryData(getMediaTitleQueryKey(values.objectID), values)
    summaries.push(toSummary(values))
  })

  return { summaries }
}

/**
 * Searches the title catalogue on the assistant's behalf.
 *
 * Owns the baseline filters — a quality floor, and a maturity guard on the
 * profiles config marks as restricted. Both are enforced here rather than in the
 * agent's prompt: the prompt is advice, this is the control, and it holds even
 * when the agent's own filter expression is dropped.
 */
export const useMediaEntertainmentSearch = ({
  personalizationParams,
}: AssistantSearchOptions = {}) => {
  const searchClient = useAtomValue(baseSearchClientAtom)
  const config = useActiveConfig()
  const queryClient = useQueryClient()
  const isRestrictedProfile = useIsRestrictedProfile()
  const template = primaryIndex.template

  return useCallback(
    (queries: MediaSearchQuery[]): Promise<UnifiedSearchResult> => {
      if (!searchClient || !template || config?.slug !== slug) {
        return Promise.resolve({ summaries: [] })
      }

      const baseline = buildBaselineFilters({
        template,
        qualityFloor: assistant.qualityFloor,
        isRestrictedProfile,
      })

      return runMediaSearch(
        queries,
        searchClient,
        queryClient,
        baseline,
        template,
        { personalizationParams },
      )
    },
    [
      searchClient,
      template,
      config?.slug,
      queryClient,
      isRestrictedProfile,
      personalizationParams,
    ],
  )
}
