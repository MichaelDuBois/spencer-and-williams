import type {
  PartialVerticalDisplayGroup,
  SearchQuery,
  VerticalDisplayGroup,
  VerticalDisplayItem,
} from '@/features/aiAssistant/types/core.types'

/** Matches the index's `record_type`, so the agent's groups map straight onto it. */
export type MediaContentType = 'movie' | 'show'

// Search / display shapes — derived from the generic Vertical* primitives.

/**
 * No `index` discriminator: the whole catalogue is one index, films and series
 * together, and `record_type` separates them as a facet. Asking the agent to
 * name an index would be asking it for a value the search hook ignores.
 */
export type MediaSearchQuery = SearchQuery
export type MediaDisplayItem = VerticalDisplayItem
export type MediaDisplayGroup = VerticalDisplayGroup<MediaContentType>
export type PartialMediaDisplayGroup =
  PartialVerticalDisplayGroup<MediaContentType>

/**
 * What goes back to the agent after a search. Deliberately narrower than the
 * hit values: the agent picks from titles and needs the signals it filtered on
 * to explain its choice, not poster paths or cast lists.
 */
export interface MediaTitleSummary {
  objectID: string
  type: MediaContentType
  title: string
  releaseYear?: string
  genres?: string[]
  maturityRating?: string
  rating?: number
  /** Movies only — series carry no runtime on this catalogue. */
  runtime?: number
  seasonCount?: number
  episodeCount?: number
}
