'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useMediaWatchState } from '@/app/media-entertainment/_hooks/useMediaWatchState'
import { buildRailRequests } from '@/app/media-entertainment/_utils/buildRailRequests'
import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { getRailAttributes } from '@/app/media-entertainment/_utils/titleAttributes'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type {
  MediaEntertainmentTitleHitValues,
  MediaTitleHit,
} from '@/app/media-entertainment/hitValues.types'
import { mediaTitleRecordsAtom } from '@/stores/mediaEntertainment'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import { getObjectIdsFilter } from '@/utilities/algoliaFilters'
import { getResultHits } from '@/utilities/getResultHits'

/** A resolved Continue Watching entry — a title plus how far through it is. */
export interface MediaProgressTitle extends MediaTitleHit {
  progress: number
}

export interface UseMediaWatchRailsArgs {
  /**
   * Whether ids the record cache is missing may be fetched. False keeps the query
   * from ever going out — used by the viewer-context hook, which is mounted on
   * every media route but only needs title names once the assistant is opened.
   */
  resolveMissing?: boolean
}

export interface UseMediaWatchRailsResult {
  myListTitles: MediaTitleHit[]
  continueWatchingTitles: MediaProgressTitle[]
  /** True only while titles are still missing, so a resolved rail never flickers. */
  isPending: boolean
}

const { slug, algolia } = mediaEntertainmentConfig
const { primaryIndex } = algolia

type TitleRecords = Record<string, MediaEntertainmentTitleHitValues>

/**
 * Slack on top of the ids actually asked for, so items a composition injects
 * can't push a requested title out of the response — dropping it from the rail
 * as if the record had been deleted. The `objectID` filter still bounds the
 * organic side to one hit per id, so the spare slots cost nothing, and the
 * hits are matched back by `objectID` rather than by position.
 */
const INJECTION_HEADROOM = 4

/**
 * Resolves the objectIDs the watch state stores into titles the rails can render.
 *
 * Two sources, in order. Anything this session has already rendered is in the
 * in-memory record cache and needs no request, which is what makes an added title
 * appear instantly. Whatever is left — on a first visit, that is the whole seeded
 * list — comes back in a single query.
 *
 * Ids the query does not return are dropped rather than rendered blank, so a title
 * pulled from the index cannot break either rail.
 */
export const useMediaWatchRails = ({
  resolveMissing = true,
}: UseMediaWatchRailsArgs = {}): UseMediaWatchRailsResult => {
  const { myList, continueWatching } = useMediaWatchState()
  // Composition whenever it is enabled, so both rails resolve through the same
  // pipeline as the rest of the homepage. `attributesToRetrieve` is still sent —
  // the Composition API drops it, but it trims the payload with the toggle off.
  const searchClient = useAtomValue(searchClientAtom)
  const searchClientKey = useAtomValue(searchClientKeyAtom)
  const cachedRecords = useAtomValue(mediaTitleRecordsAtom)
  const template = primaryIndex.template

  const missingIds = useMemo(() => {
    const ids = [...myList, ...continueWatching].map((entry) => entry.objectID)

    return [...new Set(ids)]
      .filter((objectID) => !cachedRecords[objectID])
      .sort()
  }, [myList, continueWatching, cachedRecords])

  const { data: fetchedRecords, isPending } = useQuery<TitleRecords>({
    // The sorted id list is the key, so adding a title the cache already holds
    // does not invalidate anything and no request goes out on a toggle. The
    // client's identity joins it: swapping pipelines changes no parameter here
    // either, so nothing else would invalidate these records.
    queryKey: [
      'mediaWatchTitles',
      slug,
      primaryIndex.name,
      missingIds,
      searchClientKey,
    ],
    enabled:
      resolveMissing && !!searchClient && !!template && missingIds.length > 0,
    queryFn: async () => {
      if (!searchClient || !template) {
        throw new Error('Search client not available')
      }

      const requests = buildRailRequests({
        specs: [
          {
            filters: getObjectIdsFilter(missingIds),
            hitsPerPage: missingIds.length + INJECTION_HEADROOM,
          },
        ],
        indexName: primaryIndex.name,
        attributesToRetrieve: getRailAttributes(template),
      })

      const { results } = await searchClient.search(requests)

      return Object.fromEntries(
        getResultHits(results[0]).hits.map((hit) => {
          const values = getMediaEntertainmentHitValues(hit, template, slug)

          return [values.objectID, values]
        }),
      )
    },
  })

  const records = useMemo<TitleRecords>(() => {
    return { ...fetchedRecords, ...cachedRecords }
  }, [fetchedRecords, cachedRecords])

  return useMemo(() => {
    const myListTitles = myList.flatMap((entry) => {
      const record = records[entry.objectID]

      return record ? [record] : []
    })

    const continueWatchingTitles = continueWatching.flatMap((entry) => {
      const record = records[entry.objectID]

      return record ? [{ ...record, progress: entry.progress }] : []
    })

    return {
      myListTitles,
      continueWatchingTitles,
      // A disabled query reports `pending` forever, so the gate has to be part
      // of the flag as well as of `enabled`.
      isPending: resolveMissing && isPending && missingIds.length > 0,
    }
  }, [myList, continueWatching, records, isPending, missingIds, resolveMissing])
}
