'use client'

import { useIsChatWidgetActive } from '@/features/chatWidget/hooks/useIsChatWidgetActive'
import { useActiveConfig } from '@/hooks/useActiveConfig'

/** Whether the PDP swaps ProductAIQuestions for chat widget prompt suggestions. */
export const useIsChatWidgetSuggestionsActive = (): boolean => {
  const isChatWidgetActive = useIsChatWidgetActive()
  const configurationId =
    useActiveConfig()?.features.agentStudio.chatWidgetPromptSuggestionsConfigurationID?.trim()

  return isChatWidgetActive && Boolean(configurationId)
}
