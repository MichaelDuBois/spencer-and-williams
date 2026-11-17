// =============================================================================
// Generic vertical-content building blocks
// -----------------------------------------------------------------------------
// Verticals that follow the multi-index "search → group items by content type"
// pattern (travel, b2b-content, ...) build their concrete types by aliasing
// these generics with their own discriminator union (e.g. TravelContentType).
// =============================================================================
import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'
import type { FashionProductHitValues } from '@/app/fashion/hitValues.types'
import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import type { ProductPriceQuote } from '@/types/productPricing.types'
import type { PersonalizationSearchParams } from '@/utilities/personalizationParams'

/** One search the agent asked for. Every vertical's search shape starts here. */
export interface SearchQuery {
  query: string
  filters?: string
}

/** Options every assistant search hook and request builder accepts. */
export interface AssistantSearchOptions {
  personalizationParams?: PersonalizationSearchParams
}

/**
 * A search on a vertical that spans several indices — the base plus which index
 * to run it against. Single-index verticals use `SearchQuery` directly.
 */
export interface VerticalSearchQuery<
  TIndex extends string,
> extends SearchQuery {
  index: TIndex
}

export interface VerticalDisplayItem {
  objectID: string
  why: string
}

export interface VerticalDisplayGroup<TType extends string> {
  title: string
  type: TType
  why: string
  items: VerticalDisplayItem[]
}

export interface PartialVerticalDisplayGroup<TType extends string> {
  title: string | null
  type: TType | null
  why: string | null
  items: VerticalDisplayItem[]
  itemsComplete?: boolean
}

export interface VerticalDisplayResultsData<TType extends string> {
  intro: string
  groups: VerticalDisplayGroup<TType>[]
  retry?: string
}

// =============================================================================
// Order context (post-purchase AI)
// =============================================================================

export interface OrderContextData {
  orderId: string
  items: Array<{
    objectID: string
    name: string
    image?: string
    price?: number
  }>
}

// =============================================================================
// Previous-order history display (client-side, session order history)
// =============================================================================

export interface OrderHistoryDisplayItem {
  id: string
  createdAt: number
  status?: string
  total: number
  items: Array<{
    objectID: string
    name: string
    image?: string
    price?: number
    quantity?: number
  }>
}

export interface OrderHistoryDisplayData {
  intro?: string
  orders: OrderHistoryDisplayItem[]
}

export interface DisplayOrdersArgs {
  orderIds?: string[]
  limit?: number
  intro?: string
}

// =============================================================================
// Chat & tool primitives
// =============================================================================

export type ChatStatus =
  | 'idle'
  | 'streaming'
  | 'awaiting_tool'
  | 'analyzing_image'
  | 'error'

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  result: unknown
}

export interface ToolExecutionResult {
  suggestions?: string[]
}

// =============================================================================
// Product (ecommerce) search/display types
// -----------------------------------------------------------------------------
// Kept distinct from the Vertical* generics because the ecommerce shape uses
// `products` rather than `items` and has no content-type discriminator.
// =============================================================================

export interface SearchResult {
  objectID: string
  [key: string]: unknown
}

/**
 * Query attribution carried alongside a result from the search response to the
 * click event: the `queryID` ties the click back to the query that produced the
 * hit, and `position` is the hit's 1-based rank within that result set.
 */
export interface QueryAttribution {
  queryID?: string
  position?: number
}

export interface ProductSummary extends QueryAttribution {
  pricing?: ProductPriceQuote | null
  objectID: string
  name: string
  price: number | null
}

export type ProductData =
  | EcommerceProductHitValues
  | ElectronicsProductHitValues
  | FashionProductHitValues
  | FurnishingProductHitValues
  | GroceryProductHitValues
  | B2BWarehouseProductHitValues

export interface DisplayProduct extends QueryAttribution {
  objectID: string
  why: string
}

export interface DisplayGroup {
  title: string
  why: string
  products: DisplayProduct[]
}

export interface PartialDisplayGroup {
  title: string | null
  why: string | null
  products: DisplayProduct[]
  itemsComplete?: boolean
}
