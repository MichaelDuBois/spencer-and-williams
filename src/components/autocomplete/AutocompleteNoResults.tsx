'use client'

import { SearchX } from 'lucide-react'

import { useAutocompleteNoResults } from '@/components/autocomplete/hooks/useAutocompleteNoResults'
import { NoResultsAssistant } from '@/components/results/NoResultsAssistant'

interface AutocompleteNoResultsProps {
  basePath: string
  showAssistant?: boolean
}

export const AutocompleteNoResults = ({
  basePath,
  showAssistant = false,
}: AutocompleteNoResultsProps) => {
  const {
    query,
    hasQuery,
    hasAssistant,
    handleAssistant,
    handleSeeAllResults,
  } = useAutocompleteNoResults({ basePath, showAssistant })

  if (!hasQuery) return null

  return (
    <div
      className="flex flex-col gap-4 px-2 py-2"
      data-testid="autocomplete-no-results">
      <div>
        <div className="flex items-center gap-2">
          <SearchX className="text-muted-foreground h-5 w-5 shrink-0" />
          <p className="text-foreground font-semibold">
            {`No results for “${query}”`}
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          Try another phrase or browse all results.
        </p>
      </div>

      {hasAssistant && <NoResultsAssistant compact onClick={handleAssistant} />}

      <button
        type="button"
        className="text-primary cursor-pointer self-start text-sm font-medium hover:underline"
        onClick={handleSeeAllResults}>
        See all results for {query}
      </button>
    </div>
  )
}
