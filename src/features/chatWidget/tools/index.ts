import { createDefaultTools } from 'react-instantsearch'

import { ChatComparisonItem } from '@/features/chatWidget/components/ChatComparisonItem'
import { displayItineraryTool } from '@/features/chatWidget/tools/displayItineraryTool'
import { createDisplayOrdersTool } from '@/features/chatWidget/tools/displayOrdersTool'
import { createSearchIndexTool } from '@/features/chatWidget/tools/searchIndexTool'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

interface ChatWidgetToolDeps {
  /** Current order history, re-read on every `displayOrders` call. */
  getOrders: () => OrderHistoryEntry[]
}

/**
 * Every client tool the InstantSearch Chat widget registers, keyed by the
 * Agent Studio tool names the widget's agent calls.
 */
export const createChatWidgetTools = ({ getOrders }: ChatWidgetToolDeps) => {
  return {
    algolia_search_index: createSearchIndexTool(),
    algolia_compare_products:
      createDefaultTools(ChatComparisonItem).algolia_compare_products,
    displayOrders: createDisplayOrdersTool(getOrders),
    displayItinerary: displayItineraryTool,
  }
}
