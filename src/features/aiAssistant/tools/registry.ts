import {
  displayOrdersToolHandler,
  DISPLAY_ORDERS_TOOL_NAME,
} from '@/features/aiAssistant/tools/displayOrdersTool'
import {
  displayResultsToolHandler,
  DISPLAY_RESULTS_TOOL_NAME,
} from '@/features/aiAssistant/tools/displayResultsTool'
import {
  searchToolHandler,
  SEARCH_TOOL_NAME,
} from '@/features/aiAssistant/tools/searchTool'
import {
  suggestActionsToolHandler,
  SUGGEST_ACTIONS_TOOL_NAME,
} from '@/features/aiAssistant/tools/suggestActionsTool'
import type { ToolHandler } from '@/features/aiAssistant/types'

/**
 * Registry of tool handlers.
 * Tools are vertical-agnostic - the vertical is passed via context.
 * Add new tools here to make them available to the executor.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toolHandlers: Record<string, ToolHandler<any>> = {
  [SEARCH_TOOL_NAME]: searchToolHandler,
  [DISPLAY_RESULTS_TOOL_NAME]: displayResultsToolHandler,
  [DISPLAY_ORDERS_TOOL_NAME]: displayOrdersToolHandler,
  [SUGGEST_ACTIONS_TOOL_NAME]: suggestActionsToolHandler,
}

/**
 * Get a tool handler by name.
 */
export const getToolHandler = (name: string): ToolHandler | undefined =>
  toolHandlers[name]

/**
 * Check if a tool name is valid (has a registered handler).
 */
export const isValidTool = (name: string): boolean => name in toolHandlers

/**
 * List of all registered tool names.
 */
export const availableTools = Object.keys(toolHandlers)

/** Built-in Agent Studio index-search tools (e.g. algolia_search_index_support_faq)
 *  execute server-side and stream their answer as text — the client has no handler
 *  and should ignore them silently instead of warning. */
export const isServerExecutedTool = (name: string): boolean =>
  /^algolia_search_index_/.test(name)
