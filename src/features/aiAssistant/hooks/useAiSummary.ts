'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchAgentCompletion } from '@/features/aiAssistant/utils/fetchAgentCompletion'
import { useActiveConfig } from '@/hooks/useActiveConfig'

export type AiSummaryContentType =
  | 'article'
  | 'podcast'
  | 'documentation'
  | 'blog'
  | 'resource'

interface UseAiSummaryProps<T> {
  record: T | undefined
  contentType: AiSummaryContentType
  fallbackSummary?: string
}

interface AiSummaryResult {
  summary: string
  promptSuggestions: string[]
}

const buildSummaryPrompt = <T>({
  record,
  contentType,
}: {
  record: T
  contentType: AiSummaryContentType
}): string =>
  `Make a summary for: ${JSON.stringify(record)}. Return only the summary in the response, without any additional text. The summary should be concise and capture the main points of the ${contentType}.`

export const useAiSummary = <T extends { objectID: string }>({
  record,
  contentType,
  fallbackSummary,
}: UseAiSummaryProps<T>) => {
  const config = useActiveConfig()
  const agentId = config?.features.agentStudio.summaryAgentID
  const appId = config?.algolia.appId
  const apiKey = config?.algolia.apiKey

  const { data, isPending } = useQuery({
    queryKey: ['aiSummary', appId, agentId, contentType, record?.objectID],
    queryFn: async ({ signal }): Promise<AiSummaryResult> => {
      if (!appId || !apiKey || !agentId) {
        throw new Error('Missing config')
      }

      if (!record) {
        throw new Error('Missing record data')
      }

      const result = await fetchAgentCompletion(
        { appId, apiKey, agentId },
        buildSummaryPrompt({ record, contentType }),
        signal,
      )
      const summary = result.textContent.trim()
      const promptSuggestions = result.suggestions

      if (summary || promptSuggestions.length > 0) {
        return {
          summary,
          promptSuggestions,
        }
      }

      throw new Error('No summary or prompt suggestions returned')
    },
    enabled: !!agentId && !!appId && !!apiKey && !!record,
    staleTime: 1000 * 60 * 30,
    retry: false,
  })

  const isLoading = isPending && !!agentId
  const summary = data?.summary || (!isLoading ? fallbackSummary?.trim() : '')

  return {
    summary: summary ?? '',
    promptSuggestions: data?.promptSuggestions ?? [],
    isLoading,
  }
}
