'use client'

import { useAtom } from 'jotai'
import { useCallback } from 'react'

import {
  chatMessagesState,
  suggestionsState,
  collectedObjectIDsState,
} from '@/features/aiAssistant/stores/aiAssistant'
import type {
  ChatMessage,
  DisplayResultsData,
  GartnerQuadrant,
  OrderContextData,
  OrderHistoryDisplayData,
  SuggestAction,
} from '@/features/aiAssistant/types'
import { withImageContextParts } from '@/features/aiAssistant/utils/buildImageContext'
import { getGroupItemIds } from '@/features/aiAssistant/utils/getGroupItemIds'

const generateId = () => crypto.randomUUID()
const NO_RESULTS_MESSAGE =
  "Sorry, I couldn't find any matching results. Please try a different search."

const getTextParts = (parts: ChatMessage['parts']) =>
  parts.filter(
    (part) =>
      part.type === 'text' && part.text && part.text !== NO_RESULTS_MESSAGE,
  )

export interface MessageStateAPI {
  messages: ChatMessage[]
  suggestions: string[]
  collectedObjectIDs: string[]
  setSuggestions: (suggestions: string[]) => void
  addUserMessage: (
    text: string,
    orderContext?: OrderContextData,
    imageUrl?: string,
  ) => ChatMessage
  createAssistantPlaceholder: () => string
  updateAssistantText: (id: string, text: string) => void
  appendDisplayResults: (id: string, data: DisplayResultsData) => void
  appendOrderHistory: (id: string, data: OrderHistoryDisplayData) => void
  appendSuggestActions: (
    id: string,
    actions: SuggestAction[],
    gartnerQuadrant?: GartnerQuadrant,
  ) => void
  appendNoResultsMessage: (id: string) => void
  dropEmptyAssistantMessage: (id: string) => void
  setImageContext: (id: string, texts: string[]) => void
  reset: () => void
}

/**
 * Hook for managing chat message state.
 * Provides CRUD operations for messages, suggestions, and collected object IDs.
 */
export const useMessageState = (): MessageStateAPI => {
  const [messages, setMessages] = useAtom(chatMessagesState)
  const [suggestions, setSuggestionsAtom] = useAtom(suggestionsState)
  const [collectedObjectIDs, setCollectedObjectIDs] = useAtom(
    collectedObjectIDsState,
  )

  const setSuggestions = useCallback(
    (newSuggestions: string[]) => {
      setSuggestionsAtom(newSuggestions)
    },
    [setSuggestionsAtom],
  )

  const addUserMessage = useCallback(
    (
      text: string,
      orderContext?: OrderContextData,
      imageUrl?: string,
    ): ChatMessage => {
      const parts: ChatMessage['parts'] = []

      // Add order context first if provided
      if (orderContext) {
        parts.push({ type: 'order_context', orderContext })
      }

      // Show the uploaded image above the text (image-search flow)
      if (imageUrl) {
        parts.push({ type: 'image', imageUrl })
      }

      // Add the text message
      parts.push({ type: 'text', text })

      const message: ChatMessage = {
        id: generateId(),
        role: 'user',
        parts,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, message])
      return message
    },
    [setMessages],
  )

  const createAssistantPlaceholder = useCallback((): string => {
    const id = generateId()
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: 'assistant',
        parts: [{ type: 'text', text: '' }],
        createdAt: new Date(),
      },
    ])
    return id
  }, [setMessages])

  const updateAssistantText = useCallback(
    (id: string, text: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, parts: [{ type: 'text', text }] } : msg,
        ),
      )
    },
    [setMessages],
  )

  /**
   * Append display results to a message.
   * Handles both standard (products) and travel (items) formats.
   * The vertical field in data determines which UI components render.
   */
  const appendDisplayResults = useCallback(
    (id: string, data: DisplayResultsData) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== id) return msg
          const textParts = getTextParts(msg.parts)
          const suggestParts = msg.parts.filter(
            (p) => p.type === 'suggest_actions',
          )
          // Preserve any order-history card added in the same turn so a combined
          // "where's my order, and show me X" request keeps both sections.
          const orderHistoryParts = msg.parts.filter(
            (p) => p.type === 'order_history',
          )
          // A single shopper message can require more than one search (for
          // example, a drill and the required safety equipment). Keep every
          // result payload from that turn instead of replacing earlier ones.
          const displayResultsParts = msg.parts.filter(
            (p) => p.type === 'display_results',
          )
          return {
            ...msg,
            parts: [
              ...textParts,
              ...orderHistoryParts,
              ...displayResultsParts,
              { type: 'display_results', displayData: data },
              ...suggestParts,
            ],
          }
        }),
      )
      // Update collected object IDs (handles both products and items)
      const allObjectIDs = data.groups.flatMap(getGroupItemIds)
      setCollectedObjectIDs((current) => [
        ...new Set([...current, ...allObjectIDs]),
      ])
    },
    [setMessages, setCollectedObjectIDs],
  )

  /**
   * Append previous-order cards to a message. Mirrors appendDisplayResults but
   * does not touch collectedObjectIDs — order items are local session data, not
   * Algolia hits to collect.
   */
  const appendOrderHistory = useCallback(
    (id: string, data: OrderHistoryDisplayData) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== id) return msg
          const textParts = getTextParts(msg.parts)
          const suggestParts = msg.parts.filter(
            (p) => p.type === 'suggest_actions',
          )
          // Preserve any product results added in the same turn so a combined
          // "where's my order, and show me X" request keeps both sections.
          const displayResultsParts = msg.parts.filter(
            (p) => p.type === 'display_results',
          )
          return {
            ...msg,
            parts: [
              ...textParts,
              ...displayResultsParts,
              { type: 'order_history', orderHistoryData: data },
              ...suggestParts,
            ],
          }
        }),
      )
    },
    [setMessages],
  )

  const appendSuggestActions = useCallback(
    (
      id: string,
      actions: SuggestAction[],
      gartnerQuadrant?: GartnerQuadrant,
    ) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                parts: [
                  ...msg.parts,
                  {
                    type: 'suggest_actions' as const,
                    suggestActionsData: actions,
                    ...(gartnerQuadrant ? { gartnerQuadrant } : {}),
                  },
                ],
              }
            : msg,
        ),
      )
    },
    [setMessages],
  )

  const appendNoResultsMessage = useCallback(
    (id: string) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== id) return msg

          const textParts = getTextParts(msg.parts)
          const displayResultsParts = msg.parts.filter(
            (part) => part.type === 'display_results',
          )
          const orderHistoryParts = msg.parts.filter(
            (part) => part.type === 'order_history',
          )
          const suggestParts = msg.parts.filter(
            (part) => part.type === 'suggest_actions',
          )
          const hasExistingResults =
            displayResultsParts.length > 0 || orderHistoryParts.length > 0

          return {
            ...msg,
            parts: [
              ...textParts,
              ...orderHistoryParts,
              ...displayResultsParts,
              ...(hasExistingResults
                ? []
                : [{ type: 'text' as const, text: NO_RESULTS_MESSAGE }]),
              ...suggestParts,
            ],
          }
        }),
      )
    },
    [setMessages],
  )

  /**
   * Remove an assistant message that never received content (e.g. the streaming
   * placeholder left behind when a send errors before any text/results arrive).
   * Messages that already hold text, results, or actions are kept.
   */
  const dropEmptyAssistantMessage = useCallback(
    (id: string) => {
      setMessages((prev) =>
        prev.filter((msg) => {
          if (msg.id !== id) return true
          return msg.parts.some(
            (p) =>
              (p.type === 'text' && p.text) ||
              p.type === 'display_results' ||
              p.type === 'order_history' ||
              p.type === 'suggest_actions',
          )
        }),
      )
    },
    [setMessages],
  )

  const setImageContext = useCallback(
    (id: string, texts: string[]) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? withImageContextParts(msg, texts) : msg,
        ),
      )
    },
    [setMessages],
  )

  const reset = useCallback(() => {
    setMessages([])
    setSuggestionsAtom([])
    setCollectedObjectIDs([])
  }, [setMessages, setSuggestionsAtom, setCollectedObjectIDs])

  return {
    messages,
    suggestions,
    collectedObjectIDs,
    setSuggestions,
    addUserMessage,
    createAssistantPlaceholder,
    updateAssistantText,
    appendDisplayResults,
    appendOrderHistory,
    appendSuggestActions,
    appendNoResultsMessage,
    dropEmptyAssistantMessage,
    setImageContext,
    reset,
  }
}
