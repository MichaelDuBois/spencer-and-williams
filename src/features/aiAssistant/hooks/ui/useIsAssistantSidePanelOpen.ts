'use client'

import { useAtomValue } from 'jotai'

import {
  isAIAssistantExpandedState,
  isAIAssistantOpenState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'
import { useIsChatWidgetActive } from '@/features/chatWidget/hooks/useIsChatWidgetActive'
import { chatWidgetOpenAtom } from '@/stores/demoOptions'

export const useIsAssistantSidePanelOpen = (basePath: string): boolean => {
  const mode = useChatWidgetMode(basePath)
  const isChatWidgetActive = useIsChatWidgetActive()
  const isChatWidgetOpen = useAtomValue(chatWidgetOpenAtom)
  const isAIAssistantOpen = useAtomValue(isAIAssistantOpenState)
  const isAIAssistantExpanded = useAtomValue(isAIAssistantExpandedState)

  if (mode === 'fullscreen') return false

  return isChatWidgetActive
    ? isChatWidgetOpen
    : isAIAssistantOpen && !isAIAssistantExpanded
}
