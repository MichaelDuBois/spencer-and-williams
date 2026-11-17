'use client'

import { Sparkles } from 'lucide-react'

import { SuggestionButtons } from '@/features/aiAssistant/components/SuggestionButtons'

import type { LucideIcon } from 'lucide-react'

interface AiSummaryProps {
  summary: string
  promptSuggestions: string[]
  fallbackPromptSuggestions: string[]
  isLoading: boolean
  icon?: LucideIcon
  askAnythingLabel: string
  onSuggestionClick: (suggestion: string) => void
  onAskAnything: () => void
}

export const AiSummary = ({
  summary,
  promptSuggestions,
  fallbackPromptSuggestions,
  isLoading,
  icon: Icon = Sparkles,
  askAnythingLabel,
  onSuggestionClick,
  onAskAnything,
}: AiSummaryProps) => {
  const displayedPromptSuggestions =
    promptSuggestions.length > 0
      ? promptSuggestions
      : !isLoading
        ? fallbackPromptSuggestions
        : []
  const shouldShowSummaryCard = isLoading || Boolean(summary)

  if (!shouldShowSummaryCard && promptSuggestions.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {shouldShowSummaryCard && (
        <div className="border-border rounded-card border px-5 py-5 md:px-6 md:py-6">
          <div className="text-accent flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.28em] uppercase">
            <Icon className="h-4 w-4" />
            AI Summary
          </div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <div className="bg-muted-foreground/20 rounded-card h-6 w-19/20 animate-pulse" />
              <div className="bg-muted-foreground/20 rounded-card h-6 w-18/20 animate-pulse" />
              <div className="bg-muted-foreground/20 rounded-card h-6 w-20/20 animate-pulse" />
              <div className="bg-muted-foreground/20 rounded-card h-6 w-18/20 animate-pulse" />
              <div className="bg-muted-foreground/20 rounded-card h-6 w-9/20 animate-pulse" />
            </div>
          ) : (
            <p className="text-foreground mt-4 max-w-3xl text-[length:var(--article-body-font-size)] leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="mt-4 flex gap-2">
          <div className="bg-muted-foreground/20 rounded-badge h-9 flex-1 animate-pulse" />
          <div className="bg-muted-foreground/20 rounded-badge h-9 flex-1 animate-pulse" />
          <div className="bg-muted-foreground/20 rounded-badge h-9 flex-1 animate-pulse" />
        </div>
      ) : (
        displayedPromptSuggestions.length > 0 && (
          <div className="mt-4 w-full">
            <SuggestionButtons
              suggestions={displayedPromptSuggestions}
              className="justify-between"
              buttonClassName="sm:flex-1 sm:basis-0"
              onSuggestionClick={onSuggestionClick}
              disabled={false}
            />
          </div>
        )
      )}
      <button
        type="button"
        onClick={onAskAnything}
        className="border-accent/50 hover:border-accent hover:bg-accent/5 rounded-button mt-4 flex w-full cursor-pointer items-center justify-center gap-2 border bg-transparent px-4 py-3 text-sm font-medium transition-colors">
        <Sparkles className="text-accent h-4 w-4" />
        {askAnythingLabel}
      </button>
    </div>
  )
}
