import type { CarouselSectionVariant } from '@/components/CarouselSection'
import type {
  B2BContentDisplayGroup,
  DisplayGroup,
  MediaDisplayGroup,
  PartialB2BContentDisplayGroup,
  PartialDisplayGroup,
  PartialMediaDisplayGroup,
  PartialTravelDisplayGroup,
  TravelDisplayGroup,
} from '@/features/aiAssistant/types'
import type { EmptyQueryRowConfig } from '@/types'

import type { Hit } from 'algoliasearch/lite'
import type { ReactNode } from 'react'

export type VerticalDisplayGroup =
  | DisplayGroup
  | TravelDisplayGroup
  | B2BContentDisplayGroup
  | MediaDisplayGroup

export type VerticalDisplayGroupArray =
  | DisplayGroup[]
  | TravelDisplayGroup[]
  | B2BContentDisplayGroup[]
  | MediaDisplayGroup[]

export type VerticalPartialDisplayGroup =
  | PartialDisplayGroup
  | PartialTravelDisplayGroup
  | PartialB2BContentDisplayGroup
  | PartialMediaDisplayGroup

export interface StreamingParseResult {
  intro: string
  answer: string
  groups: VerticalDisplayGroupArray
  streamingGroup: VerticalPartialDisplayGroup | null
}

export type StreamingParser = (jsonBuffer: string) => StreamingParseResult

export interface StreamingRenderProps {
  intro: string
  answer: string
  groups: VerticalDisplayGroupArray
  streamingGroup: VerticalPartialDisplayGroup | null
  isExpanded: boolean
}

export interface RenderResultGroupContext {
  vertical: string
  query?: string
}

/**
 * Overrides the empty-state trending carousel's default source of
 * `config.homepageCarousels?.[0]`, for a vertical (e.g. media) whose homepage
 * rows are `homepageRails` — a different shape and fetch strategy — instead.
 */
export interface TrendingCarouselConfig extends EmptyQueryRowConfig {
  /** Unlike `ruleContexts`, always sent even while a persona re-rank is active. */
  filterRuleContexts?: string[]
  /** Falls back to `useEmptyQueryHits`' own default. */
  hitsPerPage?: number
  /** Trims the payload to the fields the row's card renders. */
  attributesToRetrieve?: string[]
  /** Pass `[]` to suppress `_highlightResult`, which this row never renders. */
  attributesToHighlight?: string[]
}

export interface VerticalConfig {
  slug: string
  streamingParser: StreamingParser
  followUpLabel: string
  placeholderText: string
  emptyStateText: string
  suggestedQuestions: string[]
  renderResultGroup: (
    group: VerticalDisplayGroup,
    isExpanded: boolean,
    context?: RenderResultGroupContext,
  ) => ReactNode
  renderStreamingDisplay: (props: StreamingRenderProps) => ReactNode
  renderTrendingItem?: (hit: Hit) => ReactNode
  /** Source for the empty-state trending carousel. Falls back to `config.homepageCarousels?.[0]`. */
  trendingCarousel?: TrendingCarouselConfig
  /** Slot width/gap for the empty-state trending carousel. Defaults to 'standard'. */
  trendingCarouselVariant?: CarouselSectionVariant
  /**
   * How persona mode builds the empty-state greeting and starter chips.
   * 'affinity' (default): commerce-style — affinity-derived "Show me X" chips
   * plus order/return-policy chips and a product-finding greeting.
   * 'curated': content verticals — persona mode personalizes only the greeting
   * line and keeps the vertical's curated `suggestedQuestions` as chips.
   */
  personaStarters?: 'affinity' | 'curated'
}
