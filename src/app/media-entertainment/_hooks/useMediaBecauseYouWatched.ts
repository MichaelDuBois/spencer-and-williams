'use client'

import { useMemo } from 'react'

import { useMediaWatchRails } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { isRecommendRail } from '@/app/media-entertainment/_utils/recommendRail'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaRailItem } from '@/app/media-entertainment/hitValues.types'
import type { MediaRail } from '@/app/media-entertainment/types'
import { useRecommend } from '@/hooks/useRecommend'

import type { RecommendHit } from 'algoliasearch/lite'

const { slug, algolia, homepageRails } = mediaEntertainmentConfig
const { primaryIndex } = algolia

const RELATED_MODEL = 'related-products'

const DEFAULT_HITS_PER_PAGE = 14

/** Undefined, and the row is simply not configured — the hook draws nothing. */
const RECOMMEND_RAIL = (homepageRails ?? []).find(isRecommendRail)

export interface UseBecauseYouWatchedResult {
  /** Null whenever there is no part-watched title to seed from. */
  rail: MediaRail | null
  isPending: boolean
}

/** `useRecommend` stamps this on before returning; the client's type predates it. */
const getRecommendQueryID = (hit: RecommendHit): string | undefined =>
  (hit as { __queryID?: string }).__queryID

/**
 * The "Because you watched X" row.
 *
 * Seeded from Continue Watching rather than from Insights history: the seed has
 * to be a title whose name we can print in the heading, and the watch state is
 * the only place a resolved title and a "you watched this" claim exist together.
 *
 * No `fallbackParameters`. Everywhere else a Recommend miss is topped up with an
 * empty-query search, but a heading that names a source title makes a promise
 * about its items — filling the row with the catalogue's most popular titles
 * would break that promise silently. An empty model response hides the row.
 */
export const useMediaBecauseYouWatched = (): UseBecauseYouWatchedResult => {
  const { continueWatchingTitles } = useMediaWatchRails()
  const template = primaryIndex.template

  // Newest first out of the store, so the row follows whatever the viewer
  // pressed Play on last and visibly changes when they press another.
  const seed = continueWatchingTitles[0]

  // A title with no name cannot head the row, and "Because you watched
  // undefined" is worse than no row at all.
  const seedID = RECOMMEND_RAIL && seed?.title ? seed.objectID : undefined

  const { data, isPending } = useRecommend([RELATED_MODEL], seedID, {
    maxRecommendations: RECOMMEND_RAIL?.hitsPerPage ?? DEFAULT_HITS_PER_PAGE,
  })

  const items = useMemo<MediaRailItem[]>(() => {
    if (!template || !seedID) return []

    return (
      (data?.[RELATED_MODEL] ?? [])
        // The model can return the seed itself — Iron Man's top recommendation
        // is Iron Man — and a row that opens with the title you are already
        // watching reads as a bug.
        .filter((hit) => hit.objectID !== seedID)
        .map((hit, index) => {
          const queryID = getRecommendQueryID(hit)

          return {
            ...getMediaEntertainmentHitValues(hit, template, slug),
            rank: index + 1,
            __position: index + 1,
            ...(queryID ? { __queryID: queryID } : {}),
          }
        })
    )
  }, [data, template, seedID])

  return useMemo(() => {
    if (!RECOMMEND_RAIL || !seedID || !seed) {
      return { rail: null, isPending: false }
    }

    return {
      rail: {
        ...RECOMMEND_RAIL,
        title: `${RECOMMEND_RAIL.title} ${seed.title}`,
        items,
      },
      isPending,
    }
  }, [seed, seedID, items, isPending])
}
