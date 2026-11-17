'use client'

import { useSetAtom, useStore } from 'jotai'
import { useRouter } from 'next/navigation'
import { useSearchBox } from 'react-instantsearch'

import {
  isAIAssistantOpenState,
  isAIAssistantExpandedState,
  initialAIMessageState,
  initialAITurnContextState,
  initialOrderContextState,
  chatWidgetClearHistoryState,
  chatWidgetOrderContextState,
  chatWidgetPendingOrderContextState,
  chatWidgetPendingTurnContextState,
  chatMessagesState,
  suggestionsState,
  collectedObjectIDsState,
} from '@/features/aiAssistant/stores/aiAssistant'
import type {
  OrderContextData,
  TurnContext,
} from '@/features/aiAssistant/types'
import { useIsChatWidgetActive } from '@/features/chatWidget/hooks/useIsChatWidgetActive'
import { track } from '@/lib/analytics/track'
import { chatWidgetPendingMessageAtom } from '@/stores/demoOptions'

interface UseOpenAssistantPanelOptions {
  basePath: string
}

interface OpenWithMessageOptions {
  clearHistory?: boolean
  expanded?: boolean
  navigate?: boolean
  keepQuery?: boolean
  orderContext?: OrderContextData
  turnContext?: TurnContext
}

export const OPEN_ASSISTANT_IN_PLACE_OPTIONS = {
  clearHistory: false,
  expanded: false,
  navigate: false,
} as const

/**
 * Hook for managing the opening of the AI Assistant panel with a specific message.
 */
export const useOpenAssistantPanel = ({
  basePath,
}: UseOpenAssistantPanelOptions) => {
  const setIsAIAssistantOpen = useSetAtom(isAIAssistantOpenState)
  const setIsAIAssistantExpanded = useSetAtom(isAIAssistantExpandedState)
  const setInitialAIMessage = useSetAtom(initialAIMessageState)
  const setInitialTurnContext = useSetAtom(initialAITurnContextState)
  const setInitialOrderContext = useSetAtom(initialOrderContextState)
  const setChatWidgetClearHistory = useSetAtom(chatWidgetClearHistoryState)
  const setChatWidgetOrderContext = useSetAtom(chatWidgetOrderContextState)
  const setChatWidgetPendingOrderContext = useSetAtom(
    chatWidgetPendingOrderContextState,
  )
  const setChatWidgetPendingTurnContext = useSetAtom(
    chatWidgetPendingTurnContextState,
  )
  const setMessages = useSetAtom(chatMessagesState)
  const setSuggestions = useSetAtom(suggestionsState)
  const setCollectedObjectIDs = useSetAtom(collectedObjectIDsState)
  const isChatWidgetActive = useIsChatWidgetActive()
  const setChatWidgetPendingMessage = useSetAtom(chatWidgetPendingMessageAtom)
  // Read at call time rather than subscribed: every search box and suggestion
  // mounts this hook and none of them should re-render when the panel toggles.
  const store = useStore()
  const router = useRouter()
  const { refine } = useSearchBox()

  const openWithMessage = (
    message: string,
    options: OpenWithMessageOptions = {},
  ) => {
    const {
      clearHistory = true,
      expanded = true,
      navigate = true,
      keepQuery = false,
      orderContext,
    } = options

    // Hand the message to the InstantSearch Chat widget instead of the panel.
    if (isChatWidgetActive) {
      if (!keepQuery) refine('')
      setChatWidgetClearHistory(clearHistory)
      setChatWidgetOrderContext(orderContext ?? null)
      setChatWidgetPendingOrderContext(orderContext ?? null)
      setChatWidgetPendingTurnContext(options.turnContext ?? null)
      setChatWidgetPendingMessage(message)
      if (navigate) router.push(`${basePath}/search`)
      return
    }

    // Clear the InstantSearch query so the SRP shows all products
    if (!keepQuery) refine('')

    // Optionally clear previous AI chat state
    if (clearHistory) {
      setMessages([])
      setSuggestions([])
      setCollectedObjectIDs([])
    }

    // Set the initial message and optional order context for the AI chat
    setInitialAIMessage(message)
    setInitialTurnContext(options.turnContext ?? null)
    setInitialOrderContext(orderContext ?? null)

    // Open the AI assistant panel
    if (!store.get(isAIAssistantOpenState)) {
      track('assistant_opened', { surface: 'ai_assistant' })
    }
    setIsAIAssistantOpen(true)
    setIsAIAssistantExpanded(expanded)

    // Optionally navigate to the search page
    if (navigate) {
      router.push(`${basePath}/search`)
    }
  }

  return { openWithMessage }
}
