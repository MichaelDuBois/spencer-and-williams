'use client'

import { useCallback } from 'react'

import { AGENT_REQUEST_TIMEOUT_MS } from '@/features/aiAssistant/constants'
import { parseAgentStreamResponse } from '@/features/aiAssistant/streaming/agentStreamParser'
import type {
  StreamResult,
  OnToolInputDelta,
} from '@/features/aiAssistant/streaming/agentStreamParser'
import { useActiveConfig } from '@/hooks/useActiveConfig'

export interface SendCompletionOptions {
  signal?: AbortSignal
  onTextDelta?: (text: string) => void
  onToolInputDelta?: OnToolInputDelta
}

/**
 * Hook to interact with the Algolia Agent Studio API.
 * Returns a sendCompletion function for streaming chat completions.
 */
export const useAgentClient = () => {
  const config = useActiveConfig()
  /**
   * Send a completion request to the Agent Studio API.
   */
  const sendCompletion = useCallback(
    async (
      messages: Array<{ role: string; parts: Array<{ text?: string }> }>,
      options: SendCompletionOptions = {},
    ): Promise<StreamResult> => {
      if (!config) {
        throw new Error('Config not available')
      }

      const { appId, apiKey } = config.algolia
      const agentId = config.features.agentStudio.shoppingAssistantAgentID

      if (!agentId) {
        throw new Error('Agent ID not configured')
      }

      const { signal, onTextDelta = () => {}, onToolInputDelta } = options

      const url = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`

      const timeoutSignal = AbortSignal.timeout(AGENT_REQUEST_TIMEOUT_MS)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-algolia-application-id': appId,
          'x-algolia-api-key': apiKey,
        },
        body: JSON.stringify({ messages }),
        signal: signal
          ? AbortSignal.any([signal, timeoutSignal])
          : timeoutSignal,
      })

      if (!response.ok || !response.body) {
        const errorText = await response.text()
        throw new Error(`Agent API error: ${response.status} - ${errorText}`)
      }

      return parseAgentStreamResponse(
        response.body.getReader(),
        onTextDelta,
        onToolInputDelta,
      )
    },
    [config],
  )

  const isReady = !!config?.features.agentStudio.shoppingAssistantAgentID

  return {
    sendCompletion,
    isReady,
  }
}
