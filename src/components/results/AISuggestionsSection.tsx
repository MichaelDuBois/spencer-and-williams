'use client'

import { Sparkles } from 'lucide-react'
import { Configure, Index, useHits } from 'react-instantsearch'

import { useOpenAssistantPanel } from '@/features/aiAssistant'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import type { AISuggestionHit } from '@/types'

interface AISuggestionsContentProps {
  basePath: string
  className?: string
}

const AISuggestionsContent = ({
  basePath,
  className,
}: AISuggestionsContentProps) => {
  const { items } = useHits<AISuggestionHit>()
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  if (!items.length) return null

  return (
    <section className={className}>
      <div className="bg-muted/50 flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <Sparkles className="text-accent h-4 w-4" />
          <span className="text-muted-foreground text-sm font-medium">
            AI Suggestions
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map(({ objectID, query }) => (
            <button
              key={objectID}
              type="button"
              onClick={() =>
                openWithMessage(query, { expanded: false, navigate: false })
              }
              className="border-border bg-muted/50 hover:border-accent hover:bg-accent/5 rounded-badge flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors">
              <Sparkles className="text-primary h-3 w-3 shrink-0" />
              <span className="text-foreground">{query}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

interface AISuggestionsSectionProps {
  filters?: string
  hitsPerPage?: number
  className?: string
}

export const AISuggestionsSection = ({
  filters,
  hitsPerPage = 3,
  className,
}: AISuggestionsSectionProps) => {
  const config = useActiveConfig()
  const aiSuggestionsIndexName = config?.algolia.indices.aiSuggestions?.name

  if (!config || !aiSuggestionsIndexName) return null

  return (
    <Index indexName={aiSuggestionsIndexName}>
      <Configure
        hitsPerPage={hitsPerPage}
        filters={filters ?? (config.slug === 'b2b-warehouse' ? '' : undefined)}
      />
      <AISuggestionsContent
        basePath={`/${config.slug}`}
        className={className}
      />
    </Index>
  )
}
