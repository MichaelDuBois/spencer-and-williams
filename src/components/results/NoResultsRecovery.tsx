'use client'

import { SearchX } from 'lucide-react'
import Link from 'next/link'

import { NoResultsAssistant } from '@/components/results/NoResultsAssistant'
import { NoResultsRecommend } from '@/components/results/NoResultsRecommend'
import { useNoResultsRecoveryState } from '@/hooks/useNoResultsRecoveryState'

interface NoResultsRecoveryProps {
  basePath: string
}

export const NoResultsRecovery = ({ basePath }: NoResultsRecoveryProps) => {
  const {
    query,
    shouldRender,
    hasRefinements,
    hasAssistant,
    suggestionsTitle,
    suggestions,
    categoriesTitle,
    categories,
    handleAssistant,
    handleClearFilters,
    handleSuggestion,
  } = useNoResultsRecoveryState({ basePath })

  if (!shouldRender) return null

  return (
    <section
      aria-label="Search recovery"
      className="rounded-card border-border bg-background border p-6 md:p-8">
      <div className="flex items-center gap-3">
        <SearchX className="text-muted-foreground h-8 w-8 shrink-0" />
        <h2 className="text-foreground text-2xl font-bold">
          {query.trim() ? `No results for "${query}"` : 'No results'}
        </h2>
      </div>
      <p className="text-muted-foreground mt-3 text-sm">
        {hasRefinements
          ? 'Your filters may be hiding matching products.'
          : 'Try checking your spelling, using more general keywords, or exploring a category below.'}
      </p>

      {hasRefinements && (
        <button
          type="button"
          className="text-primary mt-3 cursor-pointer text-sm font-medium hover:underline"
          onClick={handleClearFilters}>
          Clear filters
        </button>
      )}

      {hasAssistant && <NoResultsAssistant onClick={handleAssistant} />}

      {suggestionsTitle && suggestions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-foreground mb-3 font-semibold">
            {suggestionsTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="border-border hover:bg-muted rounded-badge cursor-pointer border px-3 py-1.5 text-sm"
                onClick={() => handleSuggestion(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {categoriesTitle && categories.length > 0 && (
        <div className="mt-6">
          <h3 className="text-foreground mb-3 font-semibold">
            {categoriesTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="border-border hover:bg-muted rounded-badge border px-3 py-1.5 text-sm">
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <NoResultsRecommend />
    </section>
  )
}
