'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { buildRailRequests } from '@/app/media-entertainment/_utils/buildRailRequests'
import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { getDetailAttributes } from '@/app/media-entertainment/_utils/titleAttributes'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import { getObjectIdFilter } from '@/utilities/algoliaFilters'
import { getResultHits } from '@/utilities/getResultHits'

const { slug, algolia } = mediaEntertainmentConfig
const { primaryIndex } = algolia

/**
 * Enough slots that an injected item pinned above the record can't push it out
 * of the response. The `objectID` filter still bounds the organic side to one
 * hit, so this costs nothing.
 */
const DETAIL_HITS_PER_PAGE = 5

/**
 * The full record behind an open sheet. Browse trims its attribute set hard, so
 * the synopsis, cast, vote count and season count only ever arrive here — one
 * request per title, cached by React Query for the rest of the session.
 *
 * Served by the composition whenever it is enabled, so the sheet comes from the
 * same pipeline as the rails around it. `attributesToRetrieve` is still sent:
 * the Composition API has no runtime equivalent and drops it — the detail set
 * has to live on the composition's own source — but it still applies when the
 * composition toggle is off and this falls back to the base client.
 */
export const useMediaTitleDetail = (objectID: string | undefined) => {
  const searchClient = useAtomValue(searchClientAtom)
  const searchClientKey = useAtomValue(searchClientKeyAtom)
  const template = primaryIndex.template

  const { data, isPending } = useQuery<MediaEntertainmentTitleHitValues | null>(
    {
      // The client's identity belongs in the key: it decides which pipeline
      // answers, and without it a record fetched through the composition stays
      // cached under the same key after the toggle is switched off.
      queryKey: [
        'mediaTitleDetail',
        slug,
        primaryIndex.name,
        objectID,
        searchClientKey,
      ],
      enabled: !!searchClient && !!template && !!objectID,
      queryFn: async () => {
        if (!searchClient || !template || !objectID) {
          throw new Error('Search client not available')
        }

        const requests = buildRailRequests({
          specs: [
            {
              filters: getObjectIdFilter(objectID),
              hitsPerPage: DETAIL_HITS_PER_PAGE,
            },
          ],
          indexName: primaryIndex.name,
          attributesToRetrieve: getDetailAttributes(template),
        })

        const { results } = await searchClient.search(requests)
        // Never `hits[0]`: a composition can inject items that the request's
        // `objectID` filter doesn't constrain, and taking the top slot on faith
        // would render a different title in the sheet.
        const hit = getResultHits(results[0]).hits.find(
          (candidate) => candidate.objectID === objectID,
        )

        return hit ? getMediaEntertainmentHitValues(hit, template, slug) : null
      },
    },
  )

  return { detail: data ?? null, isPending: isPending && !!objectID }
}
