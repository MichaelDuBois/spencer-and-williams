'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useSearchClient } from '@/hooks/useSearchClient'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import {
  combineAlgoliaFilters,
  toAlgoliaFilterStringLiteral,
} from '@/utilities/algoliaFilters'
import { buildImageUrl } from '@/utilities/buildImageUrl'

interface ImageInfo {
  imageAttribute: string
  imageHrefPrefix?: string
}

const getImageInfo = (hitTemplate: unknown): ImageInfo | null => {
  if (!hitTemplate || typeof hitTemplate !== 'object') return null

  const template = hitTemplate as {
    attributes?: { image?: unknown }
    imageHrefPrefix?: unknown
  }

  if (typeof template.attributes?.image !== 'string') return null

  return {
    imageAttribute: template.attributes.image,
    imageHrefPrefix:
      typeof template.imageHrefPrefix === 'string'
        ? template.imageHrefPrefix
        : undefined,
  }
}

export const usePreviewImages = (
  items: string[],
  attribute: string,
  queryKeyPrefix: string,
  {
    filters,
    enabled = true,
    isHitValid,
    requiredAttributes,
  }: HitQueryOptions = {},
): Map<string, string | null> => {
  const { client: searchClient, key: searchClientKey } = useSearchClient()
  const config = useActiveConfig()
  const slug = config?.slug
  const primaryIndex = config?.algolia.primaryIndex
  const hitTemplate = primaryIndex?.template as
    | Record<string, unknown>
    | undefined
  const productsIndex = primaryIndex?.name

  const imageInfo = useMemo(() => getImageInfo(hitTemplate), [hitTemplate])

  const { data } = useQuery({
    queryKey: [
      queryKeyPrefix,
      slug,
      config?.algolia.appId,
      productsIndex,
      searchClientKey,
      items,
      attribute,
      imageInfo,
      filters,
      requiredAttributes,
    ],
    queryFn: async ({ signal }) => {
      if (!searchClient || items.length === 0 || !productsIndex || !imageInfo) {
        return []
      }

      const { imageAttribute } = imageInfo

      const searchRequests = items.map((item) => {
        return {
          indexName: productsIndex,
          params: {
            filters: combineAlgoliaFilters(
              `${attribute}:${toAlgoliaFilterStringLiteral(item)}`,
              filters,
            ),
            hitsPerPage: 1,
            attributesToRetrieve: [
              ...new Set([
                imageAttribute,
                'objectID',
                ...(requiredAttributes ?? []),
              ]),
            ],
          },
        }
      })

      const response =
        await searchClient.search<Record<string, unknown>>(searchRequests)

      signal.throwIfAborted()
      return response.results.map((result) =>
        result && 'hits' in result ? (result.hits[0] ?? null) : null,
      )
    },
    enabled:
      !!searchClient &&
      !!productsIndex &&
      !!imageInfo &&
      items.length > 0 &&
      enabled,
    staleTime: 1000 * 60 * 10,
  })

  return useMemo(
    () =>
      new Map(
        items.map((item, index) => {
          const hit = data?.[index]
          const rawImage =
            hit && imageInfo && (!isHitValid || isHitValid(hit))
              ? hit[imageInfo.imageAttribute]
              : null
          const imageUrl =
            typeof rawImage === 'string' && rawImage
              ? buildImageUrl(rawImage, { prefix: imageInfo?.imageHrefPrefix })
              : null
          return [item, imageUrl]
        }),
      ),
    [data, items, imageInfo, isHitValid],
  )
}
