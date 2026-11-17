import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import type { MediaRailItem } from '@/app/media-entertainment/hitValues.types'
import type {
  MediaEntertainmentHitTemplate,
  MediaRail,
  MediaRailConfig,
} from '@/app/media-entertainment/types'
import type { MultifeedCompositionResult } from '@/lib/multifeed-composition'
import { getResultHits } from '@/utilities/getResultHits'

interface ToRailItemsArgs {
  result: unknown
  template: MediaEntertainmentHitTemplate
  slug: string
}

interface MapMultifeedRailsArgs {
  feeds: readonly MultifeedCompositionResult[]
  template: MediaEntertainmentHitTemplate
  slug: string
}

interface MapRailResultsArgs {
  rails: readonly MediaRailConfig[]
  results: readonly unknown[]
  template: MediaEntertainmentHitTemplate
  slug: string
}

/** Extracts one result's hits, stamping the rank and the Insights identifiers. */
export const toRailItems = ({
  result,
  template,
  slug,
}: ToRailItemsArgs): MediaRailItem[] => {
  const { hits, queryID } = getResultHits(result)

  return hits.map((hit, index) => {
    return {
      ...getMediaEntertainmentHitValues(hit, template, slug),
      rank: index + 1,
      __position: index + 1,
      ...(queryID ? { __queryID: queryID } : {}),
    }
  })
}

/**
 * Aligns `results[i]` to `rails[i]`. Always maps through the primary index's
 * template regardless of which index a rail queried — replicas share the record
 * shape and have no template of their own.
 */
export const mapRailResults = ({
  rails,
  results,
  template,
  slug,
}: MapRailResultsArgs): MediaRail[] =>
  rails.map((rail, index) => {
    return {
      ...rail,
      items: toRailItems({ result: results[index], template, slug }),
    }
  })

/**
 * One rail per composition feed, keyed and titled by the feed. Every hit in a
 * feed carries that feed's queryID, so the first hit's stands for the feed.
 */
export const mapMultifeedRails = ({
  feeds,
  template,
  slug,
}: MapMultifeedRailsArgs): MediaRail[] =>
  feeds.map((feed) => {
    return {
      id: feed.feedId,
      title: feed.title,
      items: toRailItems({
        result: { hits: feed.hits, queryID: feed.hits[0]?.__queryID },
        template,
        slug,
      }),
    }
  })
