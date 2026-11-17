'use client'

import { useAtomValue } from 'jotai'
import { useState, useCallback } from 'react'

import { useAssistantCatalog } from '@/features/aiAssistant/AssistantCatalogContext'
import {
  IMAGE_ONLY_MESSAGE,
  IMAGE_ONLY_RESPONSE_INSTRUCTION,
} from '@/features/aiAssistant/constants'
import { useSearch } from '@/features/aiAssistant/hooks/search/useSearch'
import { useAgentClient } from '@/features/aiAssistant/hooks/useAgentClient'
import { useIndexContext } from '@/features/aiAssistant/hooks/useIndexContext'
import { useMessageState } from '@/features/aiAssistant/hooks/useMessageState'
import { usePageContext } from '@/features/aiAssistant/hooks/usePageContext'
import { useShopperContext } from '@/features/aiAssistant/hooks/useShopperContext'
import { useToolExecutor } from '@/features/aiAssistant/hooks/useToolExecutor'
import { analyzeImage } from '@/features/aiAssistant/services/imageAnalysisService'
import {
  relatedArticlesContextState,
  viewerContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import {
  DISPLAY_ORDERS_TOOL_NAME,
  extractStreamingOrdersArgs,
  resolveStreamingOrderPreview,
} from '@/features/aiAssistant/tools/displayOrdersTool'
import type {
  ChatMessage,
  ChatStatus,
  OrderContextData,
  OrderHistoryDisplayData,
  StreamingDisplayState,
  TurnContext,
} from '@/features/aiAssistant/types'
import {
  buildImageContext,
  getImageContextTexts,
  withImageContextParts,
} from '@/features/aiAssistant/utils/buildImageContext'
import { buildOrderContextNote } from '@/features/aiAssistant/utils/buildOrderContext'
import { getGroupItemIds } from '@/features/aiAssistant/utils/getGroupItemIds'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { track } from '@/lib/analytics/track'

type ApiMessage = { role: string; parts: Array<{ text?: string }> }

const AGENT_TIMEOUT_ERROR_MESSAGE =
  'The assistant took too long to respond. Please try again.'

interface SendMessageOptions {
  /** Session order history folded into the request as hidden context. */
  orderContext?: OrderContextData
  /** Thumbnail shown alongside the user's message in the transcript. */
  imageUrl?: string
  /** Drop already-shown results from the candidate pool (for "See more like this"). */
  excludeShown?: boolean
  /** Hidden grounding for this turn; never rendered in the transcript. */
  turnContext?: TurnContext
}

interface SendImageMessageArgs {
  /** The user's optional question. */
  text: string
  /** Data URL shown as the user's thumbnail in the transcript. */
  imageDataUrl: string
  /** Raw payload forwarded to the vision endpoint (never displayed). */
  base64Image: string
  mediaType: string
}

interface UseAgentChatReturn {
  messages: ChatMessage[]
  status: ChatStatus
  error: string | null
  sendMessage: (text: string, options?: SendMessageOptions) => Promise<void>
  sendImageMessage: (args: SendImageMessageArgs) => Promise<void>
  resetChat: () => void
  clearError: () => void
  collectedObjectIDs: string[]
  streamingDisplay: StreamingDisplayState | null
  streamingOrders: OrderHistoryDisplayData | null
  suggestions: string[]
}

/**
 * Main hook for the AI assistant chat.
 * Orchestrates message state, API calls, and tool execution.
 * Supports all verticals (ecommerce, travel, fashion, etc.).
 */
export const useAgentChat = (): UseAgentChatReturn => {
  const catalog = useAssistantCatalog()
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  // Live preview of displayOrders while its tool input is still streaming in.
  // Cleared once the tool executes and appends the final order_history part.
  const [streamingOrders, setStreamingOrders] =
    useState<OrderHistoryDisplayData | null>(null)

  // Config and API
  const config = useActiveConfig()
  const pageContext = usePageContext()
  const relatedArticles = useAtomValue(relatedArticlesContextState)
  const viewerContext = useAtomValue(viewerContextState)
  const { sendCompletion, isReady } = useAgentClient()
  const { ensureIndexContext } = useIndexContext(
    catalog?.queryOptions,
    catalog?.signal,
  )
  const search = useSearch()
  const { orders, getShopperContext } = useShopperContext(viewerContext)

  // Get vertical from config
  const vertical = config?.slug ?? 'ecommerce'

  // Message state management
  const messageState = useMessageState()

  // Tool execution with vertical awareness
  const { executeToolCalls, streamingDisplay } = useToolExecutor({
    messageState,
    sendCompletion,
    search,
    vertical,
    orders,
  })

  // Build the Agent Studio message payload from current chat state. Only
  // text/order/image-context/display parts are serialized — image parts are shown in the UI
  // but never sent to the agent. Page context (PDP, travel/B2B content) is
  // prepended when present, with the index context ahead of it.
  const buildApiMessages = useCallback(
    (
      allMessages: ChatMessage[],
      indexContext: string | null,
      turnContext?: TurnContext,
    ): ApiMessage[] => {
      const apiMessages: ApiMessage[] = allMessages.map((msg) => {
        const parts: Array<{ text?: string }> = []

        for (const p of msg.parts) {
          if (p.type === 'text' && p.text) {
            parts.push({ text: p.text })
          } else if (p.type === 'order_context' && p.orderContext) {
            parts.push({
              text: buildOrderContextNote(p.orderContext),
            })
          } else if (p.type === 'image_context' && p.text) {
            parts.push({ text: p.text })
          } else if (p.type === 'display_results' && p.displayData) {
            const itemSummary = p.displayData.groups
              .map((g) => {
                const ids = getGroupItemIds(g).join(', ')
                return `${g.title}: ${ids}`
              })
              .join('; ')
            if (itemSummary) {
              parts.push({ text: `[Previously shown items: ${itemSummary}]` })
            }
          }
        }

        return { role: msg.role, parts }
      })

      // Unshifted ahead of the page context so it lands directly after it,
      // reading as "this product, then the editorials that mention it".
      if (relatedArticles?.length && apiMessages.length > 0) {
        apiMessages.unshift({
          role: 'user',
          parts: [
            {
              text: `[Context: these articles on the page mention the product being viewed. Point the user to them when they ask about styling, outfits, or editorial coverage: ${JSON.stringify(relatedArticles)}]`,
            },
          ],
        })
      }

      if (pageContext && apiMessages.length > 0) {
        apiMessages.unshift({
          role: 'user',
          parts: [{ text: pageContext }],
        })
      }

      // Shopper context: prepend so the agent knows who it's talking to. Same
      // guard as pageContext — don't send with no messages.
      const personaContext = getShopperContext()

      if (personaContext && apiMessages.length > 0) {
        apiMessages.unshift({
          role: 'user',
          parts: [{ text: personaContext }],
        })
      }

      if (catalog?.context && apiMessages.length > 0) {
        apiMessages.unshift({
          role: 'user',
          parts: [{ text: catalog.context }],
        })
      }

      if (indexContext) {
        apiMessages.unshift({ role: 'user', parts: [{ text: indexContext }] })
      }

      if (turnContext && apiMessages.length > 0) {
        apiMessages.splice(-1, 0, {
          role: 'user',
          parts: [{ text: Object.values(turnContext).join('\n') }],
        })
      }

      return apiMessages
    },
    [pageContext, catalog?.context, relatedArticles, getShopperContext],
  )

  // Stream the agent response into the given assistant placeholder, then run
  // any tool calls it requested. Shared by text and image sends.
  const streamCompletion = useCallback(
    async (
      apiMessages: ApiMessage[],
      assistantMessageId: string,
      signal: AbortSignal,
      excludeShown = false,
    ) => {
      signal.throwIfAborted()
      let currentText = ''
      const result = await sendCompletion(apiMessages, {
        signal,
        onTextDelta: (delta) => {
          if (signal.aborted) return
          currentText += delta
          messageState.updateAssistantText(assistantMessageId, currentText)
        },
        // displayOrders is a direct first-turn tool whose data lives in local
        // session history, so render a live preview from the partial input
        // instead of waiting for the stream to finish.
        onToolInputDelta: (_toolCallId, toolName, _delta, fullBuffer) => {
          if (signal.aborted || toolName !== DISPLAY_ORDERS_TOOL_NAME) return
          const args = extractStreamingOrdersArgs(fullBuffer)
          setStreamingOrders(resolveStreamingOrderPreview(orders, args))
        },
      })

      signal.throwIfAborted()
      if (result.suggestions.length > 0) {
        messageState.setSuggestions(result.suggestions)
      }

      if (result.toolCalls.length > 0) {
        setStatus('awaiting_tool')
        try {
          const toolResult = await executeToolCalls(
            result.toolCalls,
            assistantMessageId,
            apiMessages,
            signal,
            excludeShown,
          )
          signal.throwIfAborted()
          if (toolResult.suggestions.length > 0) {
            messageState.setSuggestions(toolResult.suggestions)
          }
        } finally {
          // Final order_history part is now in message state; drop the preview.
          if (!signal.aborted) setStreamingOrders(null)
        }
      } else {
        setStreamingOrders(null)
      }
    },
    [sendCompletion, executeToolCalls, messageState, orders],
  )

  const handleSendError = useCallback(
    (err: unknown, assistantMessageId: string) => {
      setStreamingOrders(null)
      if ((err as Error).name === 'AbortError') return
      console.error('[useAgentChat] Error:', err)
      // Remove the empty placeholder so a failed turn doesn't leave a blank
      // assistant bubble (and an empty assistant turn in the next request).
      messageState.dropEmptyAssistantMessage(assistantMessageId)
      setError(
        (err as Error).name === 'TimeoutError'
          ? AGENT_TIMEOUT_ERROR_MESSAGE
          : (err as Error).message || 'Something went wrong. Please try again.',
      )
      setStatus('error')
    },
    [messageState],
  )

  // Send a text message
  const sendMessage = useCallback(
    async (text: string, options?: SendMessageOptions) => {
      if (!config || !text.trim() || !isReady || catalog?.isReady === false)
        return

      const signal = catalog?.signal ?? new AbortController().signal
      if (signal.aborted) return
      // Past the guards above, so a message dropped while the chat or catalog
      // isn't ready is never counted as sent.
      track('assistant_message_sent', {
        surface: 'ai_assistant',
        message: text,
      })
      messageState.setSuggestions([])
      setError(null)

      const userMessage = messageState.addUserMessage(
        text,
        options?.orderContext,
        options?.imageUrl,
      )
      const assistantMessageId = messageState.createAssistantPlaceholder()
      setStatus('streaming')

      try {
        const indexContext = await ensureIndexContext()
        signal.throwIfAborted()
        const apiMessages = buildApiMessages(
          [...messageState.messages, userMessage],
          indexContext,
          options?.turnContext,
        )
        await streamCompletion(
          apiMessages,
          assistantMessageId,
          signal,
          options?.excludeShown ?? false,
        )
        signal.throwIfAborted()
        setStatus('idle')
      } catch (err) {
        if (!signal.aborted) handleSendError(err, assistantMessageId)
      }
    },
    [
      config,
      isReady,
      messageState,
      buildApiMessages,
      streamCompletion,
      handleSendError,
      ensureIndexContext,
      catalog?.signal,
      catalog?.isReady,
    ],
  )

  // Send an image message: show the user's prompt + image thumbnail, analyze
  // the image in the background, then fold the analysis into the agent request
  // as hidden context (never displayed). The reply streams into the same
  // assistant placeholder shown from the start.
  const sendImageMessage = useCallback(
    async ({
      text,
      imageDataUrl,
      base64Image,
      mediaType,
    }: SendImageMessageArgs) => {
      if (!config || !isReady || catalog?.isReady === false) return

      const promptText = text.trim()
      const isImageOnly = !promptText
      const signal = catalog?.signal ?? new AbortController().signal
      if (signal.aborted) return
      track('assistant_message_sent', {
        surface: 'ai_assistant',
        message: promptText,
      })
      messageState.setSuggestions([])
      setError(null)

      const addedMessage = messageState.addUserMessage(
        promptText,
        undefined,
        imageDataUrl,
      )
      // An image-only turn keeps hidden text so history never sends empty parts.
      const fallbackTexts = isImageOnly
        ? [IMAGE_ONLY_MESSAGE, IMAGE_ONLY_RESPONSE_INSTRUCTION]
        : []
      if (fallbackTexts.length > 0) {
        messageState.setImageContext(addedMessage.id, fallbackTexts)
      }
      const assistantMessageId = messageState.createAssistantPlaceholder()
      setStatus('analyzing_image')

      try {
        const [analysis, indexContext] = await Promise.all([
          analyzeImage({ base64Image, mediaType }),
          ensureIndexContext(),
        ])

        signal.throwIfAborted()
        const imageContext = buildImageContext(analysis, isImageOnly)
        const contextTexts = imageContext
          ? getImageContextTexts(imageContext)
          : fallbackTexts
        // Persist the image context so follow-up requests still carry it.
        if (imageContext) {
          messageState.setImageContext(addedMessage.id, contextTexts)
        }
        const userMessage = withImageContextParts(addedMessage, contextTexts)
        const apiMessages = buildApiMessages(
          [...messageState.messages, userMessage],
          indexContext,
        )

        setStatus('streaming')
        await streamCompletion(apiMessages, assistantMessageId, signal)
        signal.throwIfAborted()
        setStatus('idle')
      } catch (err) {
        if (!signal.aborted) handleSendError(err, assistantMessageId)
      }
    },
    [
      config,
      isReady,
      messageState,
      buildApiMessages,
      streamCompletion,
      handleSendError,
      ensureIndexContext,
      catalog?.signal,
      catalog?.isReady,
    ],
  )

  // Reset chat
  const resetChat = useCallback(() => {
    catalog?.resetSession()
    messageState.reset()
    setStatus('idle')
    setError(null)
    setStreamingOrders(null)
  }, [messageState, catalog])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
    setStatus('idle')
  }, [])

  return {
    messages: messageState.messages,
    status,
    error,
    sendMessage,
    sendImageMessage,
    resetChat,
    clearError,
    collectedObjectIDs: messageState.collectedObjectIDs,
    streamingDisplay,
    streamingOrders,
    suggestions: messageState.suggestions,
  }
}
