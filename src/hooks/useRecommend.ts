'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { usePersonalization } from '@/hooks/usePersonalization'
import { activeConfigAtom } from '@/stores/activeConfig'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import { combineAlgoliaFilters } from '@/utilities/algoliaFilters'

import type {
  BoughtTogetherQuery,
  FbtModel,
  LookingSimilarModel,
  LookingSimilarQuery,
  RecommendHit,
  RelatedModel,
  RelatedQuery,
  TrendingItemsModel,
  TrendingItemsQuery,
} from 'algoliasearch/lite'

export type ProductRecommendModel =
  | FbtModel
  | LookingSimilarModel
  | RelatedModel
  | TrendingItemsModel

const MODELS_REQUIRING_OBJECT_ID: ProductRecommendModel[] = [
  'bought-together',
  'looking-similar',
  'related-products',
]

const requiresObjectID = (model: ProductRecommendModel) =>
  MODELS_REQUIRING_OBJECT_ID.includes(model)

/** Recommend's own fallback search, as the client already types it. */
type RecommendFallbackParameters = NonNullable<
  RelatedQuery['fallbackParameters']
>

export interface RecommendOptions extends HitQueryOptions {
  indexName?: string
  /** No caller overrides it, but the API rejects a request without it: 400. */
  threshold?: number
  maxRecommendations?: number
  fallbackParameters?: RecommendFallbackParameters
}

export type RecommendBatchResult = Partial<
  Record<ProductRecommendModel, RecommendHit[]>
>

type RecommendRequest =
  | BoughtTogetherQuery
  | RelatedQuery
  | LookingSimilarQuery
  | TrendingItemsQuery

export const useRecommend = (
  models: ProductRecommendModel[],
  objectID: string | undefined,
  {
    indexName,
    threshold = 0,
    maxRecommendations = 8,
    fallbackParameters,
    filters,
    enabled = true,
    isHitValid,
    requiredAttributes,
  }: RecommendOptions = {},
) => {
  const searchClient = useAtomValue(searchClientAtom)
  const config = useAtomValue(activeConfigAtom)
  const searchClientKey = useAtomValue(searchClientKeyAtom)
  const { currentUserToken, currentOptionalFilters } = usePersonalization()
  const currentIndex = indexName ?? config?.algolia.primaryIndex.name

  const needsObjectID = models.some(requiresObjectID)

  return useQuery<RecommendBatchResult>({
    queryKey: [
      'recommend',
      config?.slug,
      config?.algolia.appId,
      searchClientKey,
      filters,
      currentIndex,
      models,
      objectID,
      threshold,
      maxRecommendations,
      fallbackParameters,
      requiredAttributes,
      currentUserToken,
      currentOptionalFilters,
    ],
    queryFn: async ({ signal }) => {
      const queryParameters = {
        clickAnalytics: true,
        ...(filters ? { filters } : {}),
        ...(currentUserToken && { userToken: currentUserToken }),
        ...(currentOptionalFilters.length > 0 && {
          optionalFilters: currentOptionalFilters,
          getRankingInfo: true,
        }),
      }

      const fallbackAttributes = fallbackParameters?.attributesToRetrieve
      const scopedFallback =
        filters || (fallbackAttributes && requiredAttributes)
          ? {
              ...fallbackParameters,
              ...(filters && {
                filters: combineAlgoliaFilters(
                  fallbackParameters?.filters,
                  filters,
                ),
              }),
              ...(fallbackAttributes &&
                requiredAttributes && {
                  attributesToRetrieve: [
                    ...new Set([...fallbackAttributes, ...requiredAttributes]),
                  ],
                }),
            }
          : fallbackParameters

      const requests = models.map((model) => {
        const base = {
          model,
          indexName: currentIndex,
          threshold,
          maxRecommendations,
          queryParameters,
          ...(scopedFallback && { fallbackParameters: scopedFallback }),
        }
        if (requiresObjectID(model)) {
          return { ...base, objectID } as RecommendRequest
        }
        return base as RecommendRequest
      })

      const response = await searchClient!.getRecommendations({ requests })
      signal.throwIfAborted()

      return models.reduce<RecommendBatchResult>((acc, model, index) => {
        const result = response.results[index]
        const queryID = result?.queryID
        const hits = (result?.hits ?? []) as RecommendHit[]
        acc[model] = hits.map((hit, hitIndex) => {
          return {
            ...hit,
            __queryID: queryID,
            __position: hitIndex + 1,
          }
        }) as RecommendHit[]
        return acc
      }, {})
    },
    select: (results) => {
      if (!isHitValid) return results
      return models.reduce<RecommendBatchResult>((filtered, model) => {
        filtered[model] = results[model]?.filter(isHitValid) ?? []
        return filtered
      }, {})
    },
    enabled:
      enabled &&
      !!searchClient &&
      !!currentIndex &&
      models.length > 0 &&
      (!needsObjectID || !!objectID),
    staleTime: 1000 * 60 * 5,
  })
}
