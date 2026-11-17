'use client'

import { useState, useCallback } from 'react'

import type { SendCompletionOptions } from '@/features/aiAssistant/hooks/useAgentClient'
import type { MessageStateAPI } from '@/features/aiAssistant/hooks/useMessageState'
import type { StreamResult } from '@/features/aiAssistant/streaming/agentStreamParser'
import {
  getToolHandler,
  isServerExecutedTool,
} from '@/features/aiAssistant/tools/registry'
import type {
  ToolCall,
  StreamingDisplayState,
  ToolExecutionContext,
  SearchQuery,
  TravelSearchQuery,
  B2BContentSearchQuery,
  SearchSummaries,
  UnifiedSearchResult,
} from '@/features/aiAssistant/types'
import { getVerticalConfig } from '@/features/aiAssistant/verticals/registry'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

type ApiMessage = { role: string; parts: Array<{ text?: string }> }

type SendCompletionFn = (
  messages: Array<{ role: string; parts: Array<{ text?: string }> }>,
  options?: SendCompletionOptions,
) => Promise<StreamResult>

type UnifiedSearchFn = (
  queries: (SearchQuery | TravelSearchQuery | B2BContentSearchQuery)[],
) => Promise<UnifiedSearchResult>

interface UseToolExecutorOptions {
  messageState: MessageStateAPI
  sendCompletion: SendCompletionFn
  search: UnifiedSearchFn
  vertical: string
  orders: OrderHistoryEntry[]
}

const buildFollowUpText = (
  followUpLabel: string,
  summariesJson: string,
): string => {
  const labelSegment = followUpLabel ? `${followUpLabel} ` : ''
  return `Here are the ${labelSegment}search results I found: ${summariesJson}. Now please call the displayResults tool to show them to the user.`
}

/**
 * Unified hook for executing tool calls from the agent.
 * Routes tool calls to their handlers via the tool registry.
 * Supports both standard and travel verticals.
 */
export const useToolExecutor = ({
  messageState,
  sendCompletion,
  search,
  vertical,
  orders,
}: UseToolExecutorOptions) => {
  const [streamingDisplay, setStreamingDisplay] =
    useState<StreamingDisplayState | null>(null)

  // Create a function to send search results back to agent
  const createSendFollowUp = useCallback(
    (previousMessages: ApiMessage[], signal?: AbortSignal) =>
      async (
        summaries: SearchSummaries,
      ): Promise<{ toolCalls: ToolCall[]; suggestions: string[] }> => {
        signal?.throwIfAborted()
        const verticalConfig = getVerticalConfig(vertical)

        const resultMessage = {
          role: 'user',
          parts: [
            {
              text: buildFollowUpText(
                verticalConfig.followUpLabel,
                JSON.stringify(summaries),
              ),
            },
          ],
        }

        const extractStream = verticalConfig.streamingParser

        const result = await sendCompletion(
          [...previousMessages, resultMessage],
          {
            signal,
            onToolInputDelta: (toolCallId, toolName, _delta, fullBuffer) => {
              if (!signal?.aborted && toolName === 'displayResults') {
                const extracted = extractStream(fullBuffer)
                setStreamingDisplay({
                  intro: extracted.intro,
                  answer: extracted.answer,
                  groups: extracted.groups,
                  streamingGroup: extracted.streamingGroup,
                  isStreaming: true,
                  toolCallId,
                  vertical,
                })
              }
            },
          },
        )

        signal?.throwIfAborted()
        return {
          toolCalls: result.toolCalls,
          suggestions: result.suggestions,
        }
      },
    [sendCompletion, vertical],
  )

  // Execute tool calls using the registry
  const executeToolCalls = useCallback(
    async (
      toolCalls: ToolCall[],
      assistantMessageId: string,
      previousApiMessages: ApiMessage[],
      signal?: AbortSignal,
      excludeShown = false,
    ): Promise<{ suggestions: string[] }> => {
      signal?.throwIfAborted()
      let finalSuggestions: string[] = []

      for (const toolCall of toolCalls) {
        signal?.throwIfAborted()
        const handler = getToolHandler(toolCall.name)

        if (!handler) {
          // Built-in Agent Studio index-search tools run server-side and stream
          // their answer as text; the client has no handler for them and should
          // skip them silently rather than warning.
          if (isServerExecutedTool(toolCall.name)) {
            console.debug(
              `[executeToolCalls] Skipping server-executed tool: ${toolCall.name}`,
            )
            continue
          }
          console.warn(`[executeToolCalls] Unknown tool: ${toolCall.name}`)
          continue
        }

        // Parse arguments
        const parsedArgs = handler.parseArgs(toolCall.args)
        if (parsedArgs === null) {
          continue
        }

        // Build execution context with vertical info
        const context: ToolExecutionContext = {
          assistantMessageId,
          signal,
          vertical,
          // Only a "See more like this" turn (excludeShown) drops already-shown
          // items from the pool; regular searches keep every relevant hit.
          shownObjectIDs: excludeShown ? messageState.collectedObjectIDs : [],
          appendDisplayResults: (messageId, data) => {
            signal?.throwIfAborted()
            // Inject vertical into display data
            messageState.appendDisplayResults(messageId, {
              ...data,
              vertical,
            })
          },
          orders,
          appendOrderHistory: (...args) => {
            signal?.throwIfAborted()
            messageState.appendOrderHistory(...args)
          },
          appendSuggestActions: (...args) => {
            signal?.throwIfAborted()
            messageState.appendSuggestActions(...args)
          },
          appendNoResultsMessage: (...args) => {
            signal?.throwIfAborted()
            messageState.appendNoResultsMessage(...args)
          },
          executeSearch: async (queries) => {
            signal?.throwIfAborted()
            const result = await search(queries)
            signal?.throwIfAborted()
            return result
          },
          setStreamingDisplay: (state) => {
            signal?.throwIfAborted()
            if (state) {
              setStreamingDisplay({ ...state, vertical })
            } else {
              setStreamingDisplay(null)
            }
          },
          sendFollowUp: createSendFollowUp(previousApiMessages, signal),
        }

        try {
          const result = await handler.execute(parsedArgs, context)

          signal?.throwIfAborted()
          if (result.suggestions && result.suggestions.length > 0) {
            finalSuggestions = result.suggestions
          }
        } catch (error) {
          signal?.throwIfAborted()
          console.error(`[executeToolCalls] Error in ${toolCall.name}:`, error)
          throw error
        }
      }

      return { suggestions: finalSuggestions }
    },
    [messageState, search, createSendFollowUp, vertical, orders],
  )

  return {
    executeToolCalls,
    streamingDisplay,
  }
}
