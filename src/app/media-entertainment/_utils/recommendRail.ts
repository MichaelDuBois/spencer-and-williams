import type {
  MediaHomepageRailConfig,
  MediaRailConfig,
  MediaRecommendRailConfig,
} from '@/app/media-entertainment/types'

/**
 * `homepageRails` holds rows from two sources: most are selected by the page's
 * batched search, one comes from Recommend. They share the array so config keeps
 * owning the row order, and these two functions are the only place that split
 * matters — the batched search takes the browse rails, the Recommend rail is
 * found by its own hook.
 */
export const isRecommendRail = (
  rail: MediaHomepageRailConfig,
): rail is MediaRecommendRailConfig =>
  'source' in rail && rail.source === 'recommend'

export const getBrowseRails = (
  rails: readonly MediaHomepageRailConfig[],
): MediaRailConfig[] =>
  rails.filter((rail): rail is MediaRailConfig => !isRecommendRail(rail))
