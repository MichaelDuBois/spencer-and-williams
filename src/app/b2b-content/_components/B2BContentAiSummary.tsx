'use client'

import { BookOpen, FileText, FolderOpen, Newspaper } from 'lucide-react'

import {
  getB2BContentInfo,
  type B2BContentProps,
} from '@/app/b2b-content/_utils/getB2BContentInfo'
import { b2bContentConfig } from '@/app/b2b-content/config'
import { AiSummary } from '@/components/AiSummary'
import {
  OPEN_ASSISTANT_IN_PLACE_OPTIONS,
  useOpenAssistantPanel,
} from '@/features/aiAssistant/hooks/ui/useOpenAssistantPanel'
import { useAiSummary } from '@/features/aiAssistant/hooks/useAiSummary'
import { useSetProductContext } from '@/features/aiAssistant/hooks/useSetProductContext'
import {
  b2bContentContextState,
  type B2BContentContext,
} from '@/features/aiAssistant/stores/aiAssistant'

const FALLBACK_PROMPT_SUGGESTIONS = [
  'What are the key points?',
  'Summarize the main takeaways',
  'What should I focus on?',
]

const CONTENT_META = {
  documentation: {
    icon: FileText,
    label: 'Ask anything about this documentation',
  },
  article: { icon: Newspaper, label: 'Ask anything about this article' },
  blog: { icon: BookOpen, label: 'Ask anything about this blog post' },
  resource: { icon: FolderOpen, label: 'Ask anything about this resource' },
} as const

export const B2BContentAiSummary = (props: B2BContentProps) => {
  const { slug } = b2bContentConfig
  const { openWithMessage } = useOpenAssistantPanel({
    basePath: `/${slug}`,
  })

  const info = getB2BContentInfo(props)
  const { contentType, fallbackSummary } = info

  useSetProductContext(b2bContentContextState, {
    contentType: info.indexKey,
    record: info.record,
  } as B2BContentContext)

  const { summary, promptSuggestions, isLoading } = useAiSummary({
    record: info.record,
    contentType,
    fallbackSummary,
  })

  const { icon: Icon, label: askAnythingLabel } = CONTENT_META[contentType]

  return (
    <div className="my-8">
      <AiSummary
        summary={summary}
        promptSuggestions={promptSuggestions}
        fallbackPromptSuggestions={FALLBACK_PROMPT_SUGGESTIONS}
        isLoading={isLoading}
        icon={Icon}
        askAnythingLabel={askAnythingLabel}
        onSuggestionClick={(suggestion) =>
          openWithMessage(suggestion, OPEN_ASSISTANT_IN_PLACE_OPTIONS)
        }
        onAskAnything={() =>
          openWithMessage('', OPEN_ASSISTANT_IN_PLACE_OPTIONS)
        }
      />
    </div>
  )
}
