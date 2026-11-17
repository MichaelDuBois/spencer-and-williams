'use client'

import { useMemo } from 'react'

import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'
import { useRecommend } from '@/hooks/useRecommend'

const { slug, algolia } = mediaEntertainmentConfig
const { primaryIndex } = algolia

const RELATED_MODEL = 'related-products'

export const SIMILAR_TITLES_LIMIT = 12

export const useMediaSimilarTitles = (
  title: MediaEntertainmentTitleHitValues | null,
) => {
  const template = primaryIndex.template
  const objectID = title?.objectID

  const { data: recommended, isPending } = useRecommend(
    [RELATED_MODEL],
    objectID,
    { maxRecommendations: SIMILAR_TITLES_LIMIT },
  )

  const items = useMemo<MediaEntertainmentTitleHitValues[]>(() => {
    if (!template) return []

    return (
      (recommended?.[RELATED_MODEL] ?? [])
        // The model can return the open title itself — Iron Man's top related
        // title is Iron Man — and a grid led by the thing you are already
        // looking at reads as a bug. The removed top-up search excluded it with
        // a `NOT objectID` filter; this keeps that guarantee.
        .filter((hit) => hit.objectID !== objectID)
        .slice(0, SIMILAR_TITLES_LIMIT)
        .map((hit) => getMediaEntertainmentHitValues(hit, template, slug))
    )
  }, [recommended, template, objectID])

  return { items, isPending: isPending && !!title }
}
