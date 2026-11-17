'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchAgentCompletion } from '@/features/aiAssistant/utils/fetchAgentCompletion'
import { useActiveConfig } from '@/hooks/useActiveConfig'

export interface ProductQuestionsContext {
  brand?: string
  category?: string
}

interface UseProductQuestionsProps {
  productName: string
  productData?: ProductQuestionsContext
}

const TOOL_NAME = 'suggest_questions'

export const useProductQuestions = ({
  productName,
  productData,
}: UseProductQuestionsProps) => {
  const config = useActiveConfig()
  const agentId = config?.features.agentStudio.questionSuggestionsAgentID
  const appId = config?.algolia.appId
  const apiKey = config?.algolia.apiKey

  const { data: questions = [], isPending } = useQuery({
    queryKey: ['productQuestions', productName],
    queryFn: async ({ signal }) => {
      if (!appId || !apiKey || !agentId) {
        throw new Error('Missing config')
      }

      const result = await fetchAgentCompletion(
        { appId, apiKey, agentId },
        `Generate questions for: ${JSON.stringify({ name: productName, brand: productData?.brand, category: productData?.category })}`,
        signal,
      )

      const questions = result.toolCalls
        .filter((t) => t.name === TOOL_NAME)
        .map((t) => t.args?.question as string)
        .filter(Boolean)
        .slice(0, 3)

      if (questions.length > 0) {
        return questions
      }

      throw new Error('No questions returned')
    },
    enabled: !!agentId && !!appId && !!apiKey,
    staleTime: 1000 * 60 * 30,
    retry: false,
  })

  return {
    questions,
    isLoading: isPending && !!agentId,
  }
}
