'use client'

import { AGENT_REQUEST_TIMEOUT_MS } from '@/features/aiAssistant/constants'
import { parseAgentStreamResponse } from '@/features/aiAssistant/streaming/agentStreamParser'
import type { StreamResult } from '@/features/aiAssistant/streaming/agentStreamParser'

interface AgentCompletionConfig {
  appId: string
  apiKey: string
  agentId: string
}

export const fetchAgentCompletion = async (
  { appId, apiKey, agentId }: AgentCompletionConfig,
  message: string,
  signal: AbortSignal,
): Promise<StreamResult> => {
  const url = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-algolia-application-id': appId,
      'x-algolia-api-key': apiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
    }),
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(AGENT_REQUEST_TIMEOUT_MS),
    ]),
  })

  if (!response.ok || !response.body) {
    const errorText = await response.text()
    throw new Error(`Failed: ${response.status} - ${errorText}`)
  }

  return parseAgentStreamResponse(response.body.getReader(), () => {})
}
