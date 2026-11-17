'use client'

import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { electronicsConfig } from '@/app/electronics/config'
import { FacetFilters } from '@/components/filters/FacetFilters'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Hit } from '@/components/hit/Hit'
import { Pagination } from '@/components/pagination/Pagination'
import { FilterSuggestionsWidget } from '@/components/results/FilterSuggestionsWidget'
import { HitsWithInjectedContent } from '@/components/results/HitsWithInjectedContent'
import { QueryCatSuggestion } from '@/components/results/QueryCatSuggestion'
import { QueryRuleBanner } from '@/components/results/QueryRuleBanner'
import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'
import { SortByWidget } from '@/components/results/SortByWidget'
import { StoreFilterChip } from '@/components/results/StoreFilterChip'
import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'
import { ComparableSearchHit } from '@/features/chatWidget/components/ComparableSearchHit'

interface ProductListingPageProps {
  title: string
}

export const ProductListingPage = ({ title }: ProductListingPageProps) => {
  const { algolia } = electronicsConfig
  const primaryIndex = algolia.primaryIndex
  const productTemplate = primaryIndex.template
  const facets = primaryIndex.facets ?? []

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <SearchResultsHeader
          label={title}
          showResultCount
          className="mb-0 [&>h1]:text-2xl"
        />
        <SortByWidget primaryIndex={primaryIndex} variant="standard" />
      </div>

      <QueryRuleBanner />

      <QueryCatSuggestion variant="standard" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-8">
        <FilterPanel facets={facets}>
          <FacetFilters facets={facets} />
        </FilterPanel>

        <div className="lg:col-span-3">
          <StoreFilterChip />
          <ChatSearchOverview />
          <HitsWithInjectedContent
            hitComponent={({ hit }) => (
              <ComparableSearchHit hit={hit}>
                <Hit
                  variant="standard"
                  item={hit}
                  template={productTemplate}
                  slug="electronics"
                  extractor={getElectronicsProductHitValues}
                />
              </ComparableSearchHit>
            )}
            classNames={{
              list: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6',
              item: 'h-full w-full',
            }}
            injection={{
              content: (
                <FilterSuggestionsWidget
                  variant="standard"
                  attributes={facets
                    .filter((f) => f.type !== 'slider')
                    .flatMap((f) => f.attribute)}
                />
              ),
              afterIndex: 6,
            }}
          />

          <div className="mt-10">
            <Pagination variant="standard" />
          </div>
        </div>
      </div>
    </div>
  )
}
