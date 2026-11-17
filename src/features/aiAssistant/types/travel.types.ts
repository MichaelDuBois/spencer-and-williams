import type {
  ActivityHitValues,
  ArticleHitValues,
  PodcastHitValues,
} from '@/app/travel/hitValues.types'
import type {
  PartialVerticalDisplayGroup,
  VerticalDisplayGroup,
  VerticalDisplayItem,
  VerticalDisplayResultsData,
  VerticalSearchQuery,
} from '@/features/aiAssistant/types/core.types'

export type TravelContentType = 'articles' | 'podcasts' | 'activities'

// Search / display shapes — derived from the generic Vertical* primitives.
export type TravelSearchQuery = VerticalSearchQuery<TravelContentType>
export type TravelDisplayItem = VerticalDisplayItem
export type TravelDisplayGroup = VerticalDisplayGroup<TravelContentType>
export type PartialTravelDisplayGroup =
  PartialVerticalDisplayGroup<TravelContentType>
export type TravelDisplayResultsData =
  VerticalDisplayResultsData<TravelContentType>

// Vertical-specific summary returned to the agent after search.
export interface TravelContentSummary {
  objectID: string
  type: TravelContentType
  title: string
  subtitle?: string
  episode?: string
  summary?: string
}

// Cached travel content data (from Algolia). The `type` field discriminates
// the union below.
export type TravelArticleData = Omit<ArticleHitValues, 'productUrl'> & {
  type: 'articles'
}

export type TravelPodcastData = Omit<PodcastHitValues, 'productUrl'> & {
  type: 'podcasts'
}

export type TravelActivityData = Omit<ActivityHitValues, 'productUrl'> & {
  type: 'activities'
}

export type TravelContentData =
  | TravelArticleData
  | TravelPodcastData
  | TravelActivityData
