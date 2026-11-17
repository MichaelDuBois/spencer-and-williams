'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'

import {
  isAIAssistantExpandedState,
  isAIAssistantOpenState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import {
  chatWidgetEnabledAtom,
  chatWidgetOpenAtom,
  chatWidgetPendingMessageAtom,
  demoOptionsStore,
} from '@/stores/demoOptions'

export const useAssistantImplementation = () => {
  const config = useActiveConfig()
  const [isChatWidgetEnabled, setChatWidgetEnabled] = useAtom(
    chatWidgetEnabledAtom,
    { store: demoOptionsStore },
  )
  const isAIAssistantOpen = useAtomValue(isAIAssistantOpenState)
  const isChatWidgetOpen = useAtomValue(chatWidgetOpenAtom)
  const setIsAIAssistantOpen = useSetAtom(isAIAssistantOpenState)
  const setIsAIAssistantExpanded = useSetAtom(isAIAssistantExpandedState)
  const setChatWidgetOpen = useSetAtom(chatWidgetOpenAtom)
  const setChatWidgetPendingMessage = useSetAtom(chatWidgetPendingMessageAtom)

  const basePath = config ? `/${config.slug}` : ''
  const mode = useChatWidgetMode(basePath)
  const shouldExpandCustomAssistant = mode === 'fullscreen'

  const setAssistantImplementation = (useChatWidget: boolean) => {
    if (useChatWidget === isChatWidgetEnabled) return

    if (useChatWidget) {
      setChatWidgetPendingMessage(null)
      setChatWidgetEnabled(true)

      if (isAIAssistantOpen && !isChatWidgetOpen) {
        setIsAIAssistantOpen(false)
        // An empty message opens Chat without submitting a new turn.
        setChatWidgetPendingMessage('')
      }

      return
    }

    setChatWidgetEnabled(false)
    setChatWidgetOpen(false)
    setChatWidgetPendingMessage(null)

    if (isChatWidgetOpen && !isAIAssistantOpen) {
      setIsAIAssistantOpen(true)
      setIsAIAssistantExpanded(shouldExpandCustomAssistant)
    }
  }

  return { isChatWidgetEnabled, setAssistantImplementation }
}
