import { isRecommendRail } from '@/app/media-entertainment/_utils/recommendRail'
import type {
  MediaHomepageRailConfig,
  MediaRail,
} from '@/app/media-entertainment/types'

/**
 * The two rows the batched browse query does not resolve. The Recommend row's
 * position comes from config; the genre row has no config entry of its own, so
 * its position lives here.
 */
export const RECOMMEND_ROW = 'recommend-row'
export const GENRE_ROW = 'genre-row'

export const GENRE_ROW_POSITION = 3

export type MediaHomepageRow =
  | MediaRail
  | typeof RECOMMEND_ROW
  | typeof GENRE_ROW

interface BuildHomepageRowsArgs {
  /** Resolved browse rails, empties already dropped. */
  rails: MediaRail[]
  configuredRails: readonly MediaHomepageRailConfig[]
}

/**
 * Where the Recommend row sits among the resolved rails, counted in rails rather
 * than in config entries: a browse rail that came back empty has already dropped
 * out, and counting config entries would push the row past a rail that is no
 * longer on the page. `-1` when no Recommend row is configured.
 */
const getRecommendPosition = ({
  rails,
  configuredRails,
}: BuildHomepageRowsArgs): number => {
  const recommendIndex = configuredRails.findIndex(isRecommendRail)

  if (recommendIndex === -1) return -1

  const configOrder = new Map(
    configuredRails.map((rail, index) => [rail.id, index]),
  )

  return rails.filter((rail) => {
    const index = configOrder.get(rail.id)

    return index !== undefined && index < recommendIndex
  }).length
}

/** Splices the self-fetching rows into the resolved browse rails. */
export const buildHomepageRows = ({
  rails,
  configuredRails,
}: BuildHomepageRowsArgs): MediaHomepageRow[] => {
  const recommendPosition = getRecommendPosition({ rails, configuredRails })

  const rows = rails.flatMap<MediaHomepageRow>((rail, index) => [
    ...(index === recommendPosition ? ([RECOMMEND_ROW] as const) : []),
    rail,
    // Only when rails follow it — otherwise the row that exists to break up a
    // run of poster rails would land at the bottom of the page.
    ...(index === GENRE_ROW_POSITION - 1 && rails.length > GENRE_ROW_POSITION
      ? ([GENRE_ROW] as const)
      : []),
  ])

  // Config can also put the Recommend row after every browse rail, which the
  // splice above has no rail left to sit in front of.
  return recommendPosition === rails.length ? [...rows, RECOMMEND_ROW] : rows
}
