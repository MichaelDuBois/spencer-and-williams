'use client'

import { Headphones, Sparkles } from 'lucide-react'

import { travelConfig } from '@/app/travel/config'
import type {
  ArticleHitValues,
  PodcastHitValues,
} from '@/app/travel/hitValues.types'
import { AiSummary } from '@/components/AiSummary'
import {
  OPEN_ASSISTANT_IN_PLACE_OPTIONS,
  useOpenAssistantPanel,
} from '@/features/aiAssistant/hooks/ui/useOpenAssistantPanel'
import { useAiSummary } from '@/features/aiAssistant/hooks/useAiSummary'

const ARTICLE_FALLBACK_PROMPT_SUGGESTIONS = [
  'What is the best time of year to visit?',
  'How many days should I spend there?',
  'What should I pack for this trip?',
]

const PODCAST_FALLBACK_PROMPT_SUGGESTIONS = [
  'What are the main takeaways from this episode?',
  'What practical travel tips stand out most in this conversation?',
  'Can you turn this episode into a quick checklist for travelers?',
]

type TravelAiSummaryProps =
  | { article: ArticleHitValues }
  | { podcast: PodcastHitValues }

export const TravelAiSummary = (props: TravelAiSummaryProps) => {
  const article = 'article' in props ? props.article : undefined
  const podcast = 'podcast' in props ? props.podcast : undefined
  const { slug } = travelConfig
  const { openWithMessage } = useOpenAssistantPanel({
    basePath: `/${slug}`,
  })

  const contentType = article ? 'article' : 'podcast'
  const record = article ?? podcast

  const fallbackSummary = article
    ? (article.aiSummary?.trim() ?? '')
    : (podcast?.summary?.trim() ?? '')
  const { summary, promptSuggestions, isLoading } = useAiSummary({
    record,
    contentType,
    fallbackSummary,
  })
  const fallbackPromptSuggestions = article
    ? ARTICLE_FALLBACK_PROMPT_SUGGESTIONS
    : PODCAST_FALLBACK_PROMPT_SUGGESTIONS
  const Icon = article ? Sparkles : Headphones
  const askAnythingLabel = article
    ? 'Ask anything about this article'
    : 'Ask anything about this podcast'

  return (
    <AiSummary
      summary={summary}
      promptSuggestions={promptSuggestions}
      fallbackPromptSuggestions={fallbackPromptSuggestions}
      isLoading={isLoading}
      icon={Icon}
      askAnythingLabel={askAnythingLabel}
      onSuggestionClick={(suggestion) =>
        openWithMessage(suggestion, OPEN_ASSISTANT_IN_PLACE_OPTIONS)
      }
      onAskAnything={() => openWithMessage('', OPEN_ASSISTANT_IN_PLACE_OPTIONS)}
    />
  )
}
