'use client'

import { Sparkles } from 'lucide-react'

import { fashionConfig } from '@/app/fashion/config'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { AiSummary } from '@/components/AiSummary'
import {
  OPEN_ASSISTANT_IN_PLACE_OPTIONS,
  useOpenAssistantPanel,
} from '@/features/aiAssistant/hooks/ui/useOpenAssistantPanel'
import { useAiSummary } from '@/features/aiAssistant/hooks/useAiSummary'

const FALLBACK_PROMPT_SUGGESTIONS = [
  'How would I style this for everyday wear?',
  'What pieces complete this look?',
  'Which season does this edit suit best?',
]

interface FashionAiSummaryProps {
  article: FashionArticleHitValues
}

export const FashionAiSummary = ({ article }: FashionAiSummaryProps) => {
  const { slug } = fashionConfig
  const { openWithMessage } = useOpenAssistantPanel({
    basePath: `/${slug}`,
  })

  const { summary, promptSuggestions, isLoading } = useAiSummary({
    record: article,
    contentType: 'article',
    fallbackSummary: article.aiSummary,
  })

  return (
    <AiSummary
      summary={summary}
      promptSuggestions={promptSuggestions}
      fallbackPromptSuggestions={FALLBACK_PROMPT_SUGGESTIONS}
      isLoading={isLoading}
      icon={Sparkles}
      askAnythingLabel="Ask anything about this edit"
      onSuggestionClick={(suggestion) =>
        openWithMessage(suggestion, OPEN_ASSISTANT_IN_PLACE_OPTIONS)
      }
      onAskAnything={() => openWithMessage('', OPEN_ASSISTANT_IN_PLACE_OPTIONS)}
    />
  )
}
