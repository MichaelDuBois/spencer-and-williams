'use client'

import { useContext } from 'react'

import { AIAssistantSuggestions } from '@/features/aiAssistant/components/AIAssistantSuggestions'
import { AIAssistantTrendingCarousel } from '@/features/aiAssistant/components/AIAssistantTrendingCarousel'
import { useAssistantWelcome } from '@/features/aiAssistant/hooks/useAssistantWelcome'
import { ChatWidgetQueuedImageContext } from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'
import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { track } from '@/lib/analytics/track'

import type {
  ChatComponentPropsWithContext,
  ChatEmptyProps,
} from 'instantsearch-ui-components'

type ChatWidgetWelcomeProps = ChatComponentPropsWithContext<ChatEmptyProps>

/** Empty conversation state, sharing `useAssistantWelcome` with the custom assistant. */
export const ChatWidgetWelcome = ({ context }: ChatWidgetWelcomeProps) => {
  const queuedImageMessage = useContext(ChatWidgetQueuedImageContext)
  const config = useActiveConfig()
  const basePath = config ? `/${config.slug}` : ''
  const chatWidgetMode = useChatWidgetMode(basePath)
  const isExpanded = context.maximized || chatWidgetMode === 'fullscreen'
  const { greetingText, starterQuestions } = useAssistantWelcome()

  const handleStarterQuestionSelect = (question: string) => {
    track('assistant_suggestion_clicked', {
      surface: 'chat_widget',
      suggestion: question,
    })
    context.sendMessage?.({ text: question })
  }

  if (queuedImageMessage) return <></>

  return (
    <div className="sw-ChatWidget-welcome flex w-full flex-col gap-6 py-2">
      {isExpanded && <AIAssistantTrendingCarousel />}
      <p className="text-muted-foreground text-sm">{greetingText}</p>
      <AIAssistantSuggestions
        questions={starterQuestions}
        onSelect={handleStarterQuestionSelect}
        stacked={!isExpanded}
      />
    </div>
  )
}
