'use client'

import { Sparkles } from 'lucide-react'

import { NO_RESULTS_ASSISTANT } from '@/utilities/noResultsRecovery'

interface NoResultsAssistantProps {
  compact?: boolean
  onClick: () => void
}

export const NoResultsAssistant = ({
  compact = false,
  onClick,
}: NoResultsAssistantProps) => (
  <div
    className={
      compact
        ? 'bg-muted/60 rounded-card flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center'
        : 'bg-muted/60 rounded-card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center'
    }>
    <Sparkles className="text-foreground h-6 w-6 shrink-0" />
    <div className="min-w-0 sm:mr-auto">
      <h3 className="text-foreground text-sm font-semibold">
        {NO_RESULTS_ASSISTANT.title}
      </h3>
      <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
        {NO_RESULTS_ASSISTANT.description}
      </p>
    </div>
    <button
      type="button"
      className={
        compact
          ? 'bg-accent! text-accent-foreground! rounded-button cursor-pointer self-start px-4! py-2! text-sm font-medium whitespace-nowrap sm:self-auto'
          : 'bg-accent text-accent-foreground rounded-button cursor-pointer self-start px-4 py-2 text-sm font-medium whitespace-nowrap sm:self-auto'
      }
      onClick={onClick}>
      {NO_RESULTS_ASSISTANT.ctaLabel}
    </button>
  </div>
)
