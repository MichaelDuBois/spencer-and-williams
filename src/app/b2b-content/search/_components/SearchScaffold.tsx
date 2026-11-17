'use client'

import type { B2BContentSearchTabKey } from '@/app/b2b-content/_utils/tabUtils'
import { SearchTabs } from '@/app/b2b-content/search/_components/SearchTabs'
import { AISuggestionsSection } from '@/components/results/AISuggestionsSection'
import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'
import { useScrollToTop } from '@/hooks/useScrollToTop'

interface SearchScaffoldProps {
  activeTab: B2BContentSearchTabKey
  children: React.ReactNode
  filters?: string
}

export const SearchScaffold = ({
  activeTab,
  children,
  filters,
}: SearchScaffoldProps) => {
  useScrollToTop()

  return (
    <div className="container mx-auto px-6 py-8">
      <SearchResultsHeader
        label="Search"
        showResultCount={activeTab !== 'all'}
      />
      <AISuggestionsSection className="mb-8" filters={filters} />
      <SearchTabs activeTab={activeTab} />
      <div className="mt-8">{children}</div>
    </div>
  )
}
