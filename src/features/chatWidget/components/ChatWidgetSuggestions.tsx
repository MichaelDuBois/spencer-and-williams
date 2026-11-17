'use client'

import { useContext } from 'react'

import { ChatWidgetQueuedImageContext } from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'
import { cn } from '@/lib/utils'

import type { ChatPromptSuggestionsOwnProps } from 'instantsearch-ui-components'

/** Follow-up suggestions, disabled while a queued image turn waits to be sent. */
export const ChatWidgetSuggestions = ({
  suggestions = [],
  onSuggestionClick,
  classNames = {},
}: ChatPromptSuggestionsOwnProps) => {
  const queuedImageMessage = useContext(ChatWidgetQueuedImageContext)
  const isDisabled = queuedImageMessage !== null
  const visibleSuggestions = suggestions.filter(
    (suggestion) => suggestion.trim() !== '',
  )

  if (visibleSuggestions.length === 0) return <></>

  return (
    <div className={cn('ais-ChatPromptSuggestions', classNames.root)}>
      {visibleSuggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          disabled={isDisabled}
          className={cn(
            'ais-Button ais-Button--primary ais-Button--sm ais-ChatPromptSuggestions-suggestion',
            classNames.suggestion,
          )}
          onClick={() => {
            if (!isDisabled) onSuggestionClick(suggestion)
          }}>
          {suggestion}
        </button>
      ))}
    </div>
  )
}
