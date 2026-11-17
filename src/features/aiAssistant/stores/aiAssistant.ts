import { atom } from 'jotai'

import type {
  B2BContentArticleHitValues,
  B2BContentBlogHitValues,
  B2BContentDocumentationHitValues,
  B2BContentResourceHitValues,
} from '@/app/b2b-content/hitValues.types'
import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'
import type {
  FashionArticleHitValues,
  FashionProductHitValues,
} from '@/app/fashion/hitValues.types'
import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import type {
  ArticleHitValues,
  PodcastHitValues,
} from '@/app/travel/hitValues.types'
import type {
  ChatMessage,
  OrderContextData,
  TurnContext,
} from '@/features/aiAssistant/types'

// All commerce verticals share productContextState and ProductContextCard.
export type ProductHitValues =
  | EcommerceProductHitValues
  | ElectronicsProductHitValues
  | FashionProductHitValues
  | GroceryProductHitValues
  | FurnishingProductHitValues
  | B2BWarehouseProductHitValues

export type B2BContentContext =
  | { contentType: 'documentation'; record: B2BContentDocumentationHitValues }
  | { contentType: 'articles'; record: B2BContentArticleHitValues }
  | { contentType: 'blogs'; record: B2BContentBlogHitValues }
  | { contentType: 'resources'; record: B2BContentResourceHitValues }

export type TravelContentContext =
  | { contentType: 'article'; record: ArticleHitValues }
  | { contentType: 'podcast'; record: PodcastHitValues }

export const isAIAssistantOpenState = atom<boolean>(false)
export const isAIAssistantExpandedState = atom<boolean>(false)

export const initialAIMessageState = atom<string>('')
/** Hidden grounding for the next programmatically opened assistant turn. */
export const initialAITurnContextState = atom<TurnContext | null>(null)

/** A programmatic follow-up send (e.g. the "See more like this" button). */
export interface FollowUpQuery {
  text: string
  /**
   * Exclude items already shown in the conversation from the results pool, so
   * the agent surfaces fresh matches instead of repeating. Set only by
   * "See more like this" — regular searches must keep every relevant hit.
   */
  excludeShown?: boolean
}

export const followUpQueryState = atom<FollowUpQuery | null>(null)
export const isAssistantBusyState = atom<boolean>(false)
export const initialOrderContextState = atom<OrderContextData | null>(null)
/** Order context passed to the official Chat widget for a post-purchase turn. */
export const chatWidgetOrderContextState = atom<OrderContextData | null>(null)
/** Order context attached to the next official Chat widget user turn only. */
export const chatWidgetPendingOrderContextState = atom<OrderContextData | null>(
  null,
)
/** Hidden grounding attached to the next official Chat widget turn only. */
export const chatWidgetPendingTurnContextState = atom<TurnContext | null>(null)
/** Requests that the official Chat widget clear its current conversation. */
export const chatWidgetClearHistoryState = atom<boolean>(false)
export const collectedObjectIDsState = atom<string[]>([])
export const chatMessagesState = atom<ChatMessage[]>([])
export const suggestionsState = atom<string[]>([])

/**
 * Page-context atoms for the AI assistant.
 * Each holds the extracted HitValues for the page the user is viewing,
 * cleared when not on a PDP.
 */
export const productContextState = atom<ProductHitValues | null>(null)
export const travelContentContextState = atom<TravelContentContext | null>(null)
export const b2bContentContextState = atom<B2BContentContext | null>(null)
export const fashionContentContextState = atom<FashionArticleHitValues | null>(
  null,
)

/** An editorial article shown on the current page that mentions the product. */
export interface RelatedArticleContext {
  objectID: string
  title: string
  url: string
  category?: string
  readingTime?: number
}

/**
 * Supplements productContextState rather than extending it: the PDP shell owns
 * that atom, so a section writing to it would be overwritten by the shell.
 */
export const relatedArticlesContextState = atom<RelatedArticleContext[] | null>(
  null,
)

/**
 * A pre-built `[Context: ...]` note describing who is browsing, set by a vertical
 * that needs to say it in its own vocabulary.
 *
 * When set, it replaces the default commerce-shaped `buildPersonaContext` block
 * for that turn rather than sitting alongside it — two notes describing the same
 * person, one calling them a shopper and one a viewer, is worse than either.
 * Verticals that leave this null keep the default.
 *
 * A string rather than a structured object on purpose: the shape of "who is
 * browsing" is genuinely vertical-specific (a cart and an order history for
 * commerce, a watchlist and progress for media), and a union of every vertical's
 * shape would have to be widened here for each new one.
 */
export const viewerContextState = atom<string | null>(null)
