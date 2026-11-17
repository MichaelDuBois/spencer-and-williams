'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import {
  BILLBOARD_QUERY,
  getBillboardLimit,
  pickBillboardCandidates,
  resolveBillboardSource,
  type MediaBillboardQuery,
} from '@/app/media-entertainment/_utils/billboardSource'
import { buildRailRequests } from '@/app/media-entertainment/_utils/buildRailRequests'
import {
  mapRailResults,
  toRailItems,
} from '@/app/media-entertainment/_utils/mapRailResults'
import { getBrowseRails } from '@/app/media-entertainment/_utils/recommendRail'
import {
  getBillboardAttributes,
  getRailAttributes,
} from '@/app/media-entertainment/_utils/titleAttributes'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaRailItem } from '@/app/media-entertainment/hitValues.types'
import type {
  MediaHomepageRailConfig,
  MediaRail,
} from '@/app/media-entertainment/types'
import { usePersonalization } from '@/hooks/usePersonalization'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import { isPersonalizationActive } from '@/utilities/personalizationParams'

interface UseMediaEntertainmentRailsArgs {
  /** Injectable so tests don't have to `vi.mock` the config module. */
  rails?: MediaHomepageRailConfig[]
  /** `null` skips the hero entirely — rail consumers off the homepage. */
  billboard?: MediaBillboardQuery | null
  /**
   * `false` holds the batch back until the caller knows its final rail list, so
   * the page still makes exactly one search instead of one per rail list it
   * passes through. `useQuery` reports `isPending: true` for a disabled query,
   * so a caller waiting on this keeps showing its skeletons for free.
   */
  enabled?: boolean
}

interface MediaHomepageData {
  rails: MediaRail[]
  billboardTitles: MediaRailItem[]
}

export interface UseMediaEntertainmentRailsResult extends MediaHomepageData {
  isPending: boolean
  isError: boolean
  refetch: () => void
}

const { slug, algolia } = mediaEntertainmentConfig
const { primaryIndex } = algolia

/**
 * The whole homepage — every rail plus every billboard source — in one
 * `search([...])` call.
 *
 * Served by the composition whenever it is enabled, so the rails come from the
 * same pipeline as the search page. One caveat rides along: the Composition API
 * runs one composition per request, so the batch is a single HTTP round trip
 * only while the toggle is off. With it on, the client fans the batch out into
 * one parallel composition call per row.
 */
export const useMediaEntertainmentRails = ({
  rails = mediaEntertainmentConfig.homepageRails ?? [],
  billboard = BILLBOARD_QUERY,
  enabled = true,
}: UseMediaEntertainmentRailsArgs = {}): UseMediaEntertainmentRailsResult => {
  // `attributesToRetrieve` is still sent: the Composition API has no runtime
  // equivalent and drops it — the rail attribute set has to live on the
  // composition's own source — but it still trims the payload when the
  // composition toggle is off and this falls back to the base client.
  const searchClient = useAtomValue(searchClientAtom)
  const searchClientKey = useAtomValue(searchClientKeyAtom)
  const { currentUserToken, currentOptionalFilters, mode } =
    usePersonalization()
  const template = primaryIndex.template

  const personalizationActive = isPersonalizationActive({
    mode,
    isFeatureEnabled:
      mediaEntertainmentConfig.features?.personalization?.enabled,
  })

  const billboardSources = useMemo(
    () => (billboard ? resolveBillboardSource(billboard) : []),
    [billboard],
  )

  // The Recommend row shares `homepageRails` so config owns the row order, but it
  // has no query of its own — it fetches from Recommend in a hook of its own, and
  // including it here would send an unfiltered empty-query search for it.
  const browseRails = useMemo(() => getBrowseRails(rails), [rails])

  const { data, isPending, isError, refetch } = useQuery<MediaHomepageData>({
    // The client's identity belongs in the key: swapping it changes no search
    // parameter, so without it every rail would keep serving the results the
    // outgoing pipeline returned after the composition toggle moved.
    queryKey: [
      'mediaEntertainmentRails',
      slug,
      primaryIndex.name,
      browseRails,
      billboard,
      currentUserToken,
      currentOptionalFilters,
      personalizationActive,
      searchClientKey,
    ],
    enabled:
      enabled &&
      !!searchClient &&
      !!template &&
      browseRails.length + billboardSources.length > 0,
    queryFn: async () => {
      if (!searchClient || !template) {
        throw new Error('Search client not available')
      }

      const personalization = {
        isActive: personalizationActive,
        currentUserToken,
        currentOptionalFilters,
      }

      const railRequests = buildRailRequests({
        specs: browseRails,
        indexName: primaryIndex.name,
        attributesToRetrieve: getRailAttributes(template),
        personalization,
      })

      const billboardRequests = buildRailRequests({
        specs: billboardSources,
        indexName: primaryIndex.name,
        attributesToRetrieve: getBillboardAttributes(template),
        personalization,
      })

      const { results } = await searchClient.search([
        ...railRequests,
        ...billboardRequests,
      ])

      const railResults = results.slice(0, railRequests.length)
      const billboardResults = results.slice(railRequests.length)

      // Source order is precedence order (rules, curated, fallback), and the
      // dedupe in `pickBillboardCandidates` keeps the first occurrence, so pins
      // win over the algorithmic fallback.
      const candidates = billboardResults.flatMap((result) =>
        toRailItems({ result, template, slug }),
      )
      const curatedOrder = billboardSources.flatMap(
        (source) => source.objectIDs ?? [],
      )

      const billboardTitles = pickBillboardCandidates({
        candidates,
        limit: getBillboardLimit(billboard ?? undefined),
        order: curatedOrder,
      }).map((title, index) => {
        return { ...title, rank: index + 1 }
      })

      return {
        rails: mapRailResults({
          rails: browseRails,
          results: railResults,
          template,
          slug,
        }),
        billboardTitles,
      }
    },
  })

  // Every rail stays present with `items: []` while loading, so the skeletons
  // know the row count and titles from config; empty rails only drop out once
  // the data has landed.
  const resolvedRails = useMemo<MediaRail[]>(
    () =>
      data
        ? data.rails.filter((rail) => rail.items.length > 0)
        : browseRails.map((rail) => {
            return { ...rail, items: [] }
          }),
    [data, browseRails],
  )

  return {
    rails: resolvedRails,
    billboardTitles: data?.billboardTitles ?? [],
    isPending,
    isError,
    refetch,
  }
}
