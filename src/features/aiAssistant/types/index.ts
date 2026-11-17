// =============================================================================
// AI Assistant types — public surface
// -----------------------------------------------------------------------------
// Per-vertical types live in dedicated files. This barrel re-exports them and
// defines the cross-vertical "glue" types (DisplayResultsData,
// StreamingDisplayState, MessagePart, ChatMessage, ToolExecutionContext,
// UnifiedSearchResult, ToolHandler) that union over every vertical.
// =============================================================================

import type {
  B2BContentDisplayGroup,
  B2BContentSearchQuery,
  B2BContentSummary,
  PartialB2BContentDisplayGroup,
} from '@/features/aiAssistant/types/b2bContent.types'
import type {
  DisplayGroup,
  OrderContextData,
  OrderHistoryDisplayData,
  PartialDisplayGroup,
  ProductSummary,
  SearchQuery,
  ToolCall,
  ToolExecutionResult,
} from '@/features/aiAssistant/types/core.types'
import type {
  MediaDisplayGroup,
  MediaSearchQuery,
  MediaTitleSummary,
  PartialMediaDisplayGroup,
} from '@/features/aiAssistant/types/mediaEntertainment.types'
import type {
  PartialTravelDisplayGroup,
  TravelContentSummary,
  TravelDisplayGroup,
  TravelSearchQuery,
} from '@/features/aiAssistant/types/travel.types'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

export * from '@/features/aiAssistant/types/core.types'
export * from '@/features/aiAssistant/types/travel.types'
export * from '@/features/aiAssistant/types/b2bContent.types'
export * from '@/features/aiAssistant/types/mediaEntertainment.types'

// =============================================================================
// Cross-vertical message / streaming types
// =============================================================================

export interface SuggestAction {
  label: string
  url: string
}

/** Hidden metadata used to ground a single assistant turn. */
export type TurnContext = Record<string, string>

export interface GartnerQuadrant {
  imageUrl: string
  url: string
}

export interface MessagePart {
  type:
    | 'text'
    | 'image'
    | 'tool_call'
    | 'tool_result'
    | 'display_results'
    | 'order_context'
    | 'image_context'
    | 'order_history'
    | 'suggest_actions'
  text?: string
  imageUrl?: string
  toolCallId?: string
  toolName?: string
  args?: Record<string, unknown>
  result?: unknown
  displayData?: DisplayResultsData
  orderContext?: OrderContextData
  orderHistoryData?: OrderHistoryDisplayData
  suggestActionsData?: SuggestAction[]
  gartnerQuadrant?: GartnerQuadrant
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: MessagePart[]
  createdAt: Date
}

export interface DisplayResultsData {
  intro: string
  groups:
    | DisplayGroup[]
    | TravelDisplayGroup[]
    | B2BContentDisplayGroup[]
    | MediaDisplayGroup[]
  answer?: string
  retry?: string
  vertical?: string // 'travel' | 'ecommerce' | 'fashion' | 'b2b-content' etc.
  queries?: string[]
}

export interface StreamingDisplayState {
  intro: string
  answer?: string
  groups:
    | DisplayGroup[]
    | TravelDisplayGroup[]
    | B2BContentDisplayGroup[]
    | MediaDisplayGroup[]
  streamingGroup:
    | PartialDisplayGroup
    | PartialTravelDisplayGroup
    | PartialB2BContentDisplayGroup
    | PartialMediaDisplayGroup
    | null
  isStreaming: boolean
  toolCallId: string | null
  vertical?: string
}

// =============================================================================
// Cross-vertical search / tool execution glue
// =============================================================================

/** The shapes a vertical's search hook can hand back to a tool handler. */
export type SearchSummaries =
  | ProductSummary[]
  | TravelContentSummary[]
  | B2BContentSummary[]
  | MediaTitleSummary[]

// Unified search result (can be products, travel content, or B2B content).
export interface UnifiedSearchResult {
  summaries: SearchSummaries
}

/**
 * Context passed to tool handlers during execution.
 * Contains shared dependencies and state management functions.
 */
export interface ToolExecutionContext {
  assistantMessageId: string
  signal?: AbortSignal
  vertical: string // 'travel' | 'ecommerce' | 'fashion' etc.
  // objectIDs already shown on screen — excluded from the candidate pool so a
  // "See more like this" follow-up surfaces fresh matches instead of repeats.
  // Optional: tools that don't dedupe against shown results can omit it.
  shownObjectIDs?: string[]
  // Session order history (client-side; not Algolia)
  orders: OrderHistoryEntry[]
  // Message state operations
  appendDisplayResults: (messageId: string, data: DisplayResultsData) => void
  appendOrderHistory: (messageId: string, data: OrderHistoryDisplayData) => void
  appendNoResultsMessage: (messageId: string) => void
  appendSuggestActions: (
    messageId: string,
    actions: SuggestAction[],
    gartnerQuadrant?: GartnerQuadrant,
  ) => void
  // Unified search operations (routes based on vertical)
  executeSearch: (
    queries: (
      | SearchQuery
      | TravelSearchQuery
      | B2BContentSearchQuery
      | MediaSearchQuery
    )[],
  ) => Promise<UnifiedSearchResult>
  // Streaming display
  setStreamingDisplay: (state: StreamingDisplayState | null) => void
  // Send follow-up to agent (for multi-step tools like search)
  sendFollowUp: (
    summaries: SearchSummaries,
  ) => Promise<{ toolCalls: ToolCall[]; suggestions: string[] }>
}

/**
 * Generic tool handler interface.
 * Each tool implements this to define its parsing and execution logic.
 */
export interface ToolHandler<TArgs = unknown> {
  name: string
  parseArgs: (args: Record<string, unknown>) => TArgs | null
  execute: (
    args: TArgs,
    context: ToolExecutionContext,
  ) => Promise<ToolExecutionResult>
}
