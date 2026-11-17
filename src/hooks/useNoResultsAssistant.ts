'use client'

import { useOpenAssistantPanel } from '@/features/aiAssistant'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import {
  getNoResultsAssistantContext,
  interpolateRecoveryPrompt,
  NO_RESULTS_ASSISTANT,
} from '@/utilities/noResultsRecovery'

interface UseNoResultsAssistantOptions {
  basePath: string
  query: string
}

interface UseNoResultsAssistantResult {
  hasAssistant: boolean
  handleAssistant: () => void
}

export const useNoResultsAssistant = ({
  basePath,
  query,
}: UseNoResultsAssistantOptions): UseNoResultsAssistantResult => {
  const config = useActiveConfig()
  const { openWithMessage } = useOpenAssistantPanel({ basePath })
  const hasAssistant = Boolean(
    config?.features?.agentStudio?.shoppingAssistantAgentID,
  )

  const handleAssistant = () => {
    if (!hasAssistant) return

    openWithMessage(
      interpolateRecoveryPrompt(NO_RESULTS_ASSISTANT.promptTemplate, query),
      {
        keepQuery: true,
        navigate: false,
        turnContext: { searchRecovery: getNoResultsAssistantContext(query) },
      },
    )
  }

  return { hasAssistant, handleAssistant }
}
