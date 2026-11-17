'use client'

import {
  useClearRefinements,
  useCurrentRefinements,
  useInstantSearch,
  useSearchBox,
  useStats,
} from 'react-instantsearch'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useNoResultsAssistant } from '@/hooks/useNoResultsAssistant'
import { useNoResultsRecovery } from '@/hooks/useNoResultsRecovery'
import { useProductHitDefinition } from '@/hooks/useProductHitDefinition'
import {
  getCategoryRecoveryLink,
  getRootCategoryAttribute,
  NO_RESULTS_CATEGORIES,
  NO_RESULTS_SUGGESTIONS,
} from '@/utilities/noResultsRecovery'

interface UseNoResultsRecoveryStateOptions {
  basePath: string
}

interface RecoveryCategory {
  label: string
  href: string
}

interface UseNoResultsRecoveryStateResult {
  query: string
  shouldRender: boolean
  hasRefinements: boolean
  hasAssistant: boolean
  suggestionsTitle: string | undefined
  suggestions: string[]
  categoriesTitle: string | undefined
  categories: RecoveryCategory[]
  handleAssistant: () => void
  handleClearFilters: () => void
  handleSuggestion: (suggestion: string) => void
}

export const useNoResultsRecoveryState = ({
  basePath,
}: UseNoResultsRecoveryStateOptions): UseNoResultsRecoveryStateResult => {
  const config = useActiveConfig()
  const { status, results } = useInstantSearch()
  const { query, refine } = useSearchBox()
  const { nbHits } = useStats()
  const { items: currentRefinements } = useCurrentRefinements()
  const { refine: clearRefinements } = useClearRefinements()
  const { queryOptions } = useProductHitDefinition(config?.slug)
  const assistant = useNoResultsAssistant({ basePath, query })

  const hasQuery = query.trim().length > 0
  const hasRefinements = currentRefinements.length > 0
  const suggestionIndex = config?.algolia?.indices.querySuggestions?.name
  const rootCategoryAttribute = getRootCategoryAttribute(
    config?.algolia?.primaryIndex.facets,
  )
  const isSettledZeroHits =
    status === 'idle' && !results?.__isArtificial && nbHits === 0
  const shouldRender = isSettledZeroHits && (hasQuery || hasRefinements)
  const enableSuggestions = Boolean(hasQuery && suggestionIndex)
  const enableCategories = Boolean(hasQuery && rootCategoryAttribute)

  const { data } = useNoResultsRecovery({
    query,
    enabled: isSettledZeroHits && (enableSuggestions || enableCategories),
    suggestionsLimit: NO_RESULTS_SUGGESTIONS.limit,
    categoriesLimit: NO_RESULTS_CATEGORIES.limit,
    enableSuggestions,
    enableCategories,
    categoryFilters: queryOptions?.filters,
  })

  const categories = (data?.categories ?? []).map((category) =>
    getCategoryRecoveryLink({
      basePath,
      category,
      navigation: config?.navigation,
      carouselCategories: config?.carouselCategories,
    }),
  )

  return {
    query,
    shouldRender,
    hasRefinements,
    hasAssistant: hasQuery && assistant.hasAssistant,
    suggestionsTitle: enableSuggestions
      ? NO_RESULTS_SUGGESTIONS.title
      : undefined,
    suggestions: enableSuggestions ? (data?.suggestions ?? []) : [],
    categoriesTitle: enableCategories ? NO_RESULTS_CATEGORIES.title : undefined,
    categories: enableCategories ? categories : [],
    handleAssistant: assistant.handleAssistant,
    handleClearFilters: clearRefinements,
    handleSuggestion: refine,
  }
}
