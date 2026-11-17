'use client'

import { Sparkles } from 'lucide-react'

import { useOpenAssistantPanel } from '@/features/aiAssistant'
import type { AISuggestionHit } from '@/types'

interface AISuggestionsHitProps {
  item: AISuggestionHit
  basePath: string
  onSelect: () => void
}

export const AISuggestionsHit = ({
  item,
  basePath,
  onSelect,
}: AISuggestionsHitProps) => {
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const handleClick = () => {
    // Close the autocomplete dropdown
    onSelect()

    // Open AI assistant in full page with the query
    openWithMessage(item.query, { expanded: true })
  }

  return (
    <div
      role="button"
      className="text-foreground hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
      onClick={handleClick}>
      <Sparkles className="text-primary h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1">{item.query}</span>
    </div>
  )
}
