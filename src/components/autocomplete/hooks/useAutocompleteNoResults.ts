import { useRouter } from 'next/navigation'
import { useInstantSearch, useSearchBox } from 'react-instantsearch'

import { useNoResultsAssistant } from '@/hooks/useNoResultsAssistant'

interface UseAutocompleteNoResultsOptions {
  basePath: string
  showAssistant?: boolean
}

interface UseAutocompleteNoResultsResult {
  query: string
  hasQuery: boolean
  hasAssistant: boolean
  handleAssistant: () => void
  handleSeeAllResults: () => void
}

export const useAutocompleteNoResults = ({
  basePath,
  showAssistant = false,
}: UseAutocompleteNoResultsOptions): UseAutocompleteNoResultsResult => {
  // Autocomplete keeps its active query in its connector state while typing;
  // its isolated Index does not reliably expose that state through
  // `useInstantSearch().indexUiState` to no-results components.
  const { query } = useSearchBox()
  const { status, indexRenderState } = useInstantSearch()
  // The isolated autocomplete parent can stay artificial after its sources
  // finish searching. Check source results for the active query instead.
  const hasResolvedQuery =
    indexRenderState.autocomplete?.indices.some(
      ({ results }) =>
        results && !results.__isArtificial && results.query === query,
    ) ?? false
  const router = useRouter()
  const assistant = useNoResultsAssistant({ basePath, query })
  const hasAssistant = showAssistant && assistant.hasAssistant

  const navigateToResults = () => {
    router.push(`${basePath}/search?query=${encodeURIComponent(query)}`)
  }

  const handleSeeAllResults = () => {
    closeAutocomplete()
    navigateToResults()
  }

  const handleAssistant = () => {
    closeAutocomplete()
    assistant.handleAssistant()
    navigateToResults()
  }

  return {
    query,
    hasQuery: query.trim().length > 0 && status === 'idle' && hasResolvedQuery,
    hasAssistant,
    handleAssistant,
    handleSeeAllResults,
  }
}

const closeAutocomplete = (): void => {
  document.querySelector<HTMLElement>(DETACHED_CANCEL_SELECTOR)?.click()
  document.querySelector<HTMLInputElement>(AUTOCOMPLETE_INPUT_SELECTOR)?.blur()
}

const DETACHED_CANCEL_SELECTOR = '.ais-AutocompleteDetachedCancelButton'
const AUTOCOMPLETE_INPUT_SELECTOR = '.ais-AutocompleteForm input'
