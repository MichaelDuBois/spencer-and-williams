'use client'

import { useCallback } from 'react'

import { B2BHit } from '@/app/b2b-warehouse/_components/B2BHit'
import { B2BVisibilityFacet } from '@/app/b2b-warehouse/_components/B2BVisibilityFacet'
import { B2BWarehousePanel } from '@/app/b2b-warehouse/_components/B2BWarehousePanel'
import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { isB2BProductEligible } from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { B2B_VISIBILITY_ATTRIBUTE } from '@/app/b2b-warehouse/customerGroups'
import { FacetFilters } from '@/components/filters/FacetFilters'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Pagination } from '@/components/pagination/Pagination'
import { FilterSuggestionsWidget } from '@/components/results/FilterSuggestionsWidget'
import { HitsWithInjectedContent } from '@/components/results/HitsWithInjectedContent'
import { QueryCatSuggestion } from '@/components/results/QueryCatSuggestion'
import { QueryRuleBanner } from '@/components/results/QueryRuleBanner'
import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'
import { SortByWidget } from '@/components/results/SortByWidget'
import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'
import { ComparableSearchHit } from '@/features/chatWidget/components/ComparableSearchHit'

import type { BaseHit, Hit as AlgoliaHit } from 'instantsearch.js'

interface ProductListingPageProps {
  title: string
}

export const ProductListingPage = ({ title }: ProductListingPageProps) => {
  const policy = useB2BCustomerGroupPolicy()
  const transformItems = useCallback(
    (hits: AlgoliaHit<BaseHit>[]) =>
      hits.filter((hit) => isB2BProductEligible(hit, policy)),
    [policy],
  )
  const { algolia } = b2bWarehouseConfig
  const primaryIndex = algolia.primaryIndex
  const productTemplate = primaryIndex.template
  const facets = (primaryIndex.facets ?? []).map((facet) =>
    policy.status === 'ready' && policy.groupId && facet.attribute === 'price'
      ? { ...facet, label: 'Base price' }
      : facet,
  )
  const standardFacets = facets.filter(
    (facet) => facet.attribute !== B2B_VISIBILITY_ATTRIBUTE,
  )

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
        {/* FilterPanel uses the full list to label active visibility refinements. */}
        <FilterPanel facets={facets}>
          <B2BWarehousePanel />
          <B2BVisibilityFacet
            groupId={policy.status === 'ready' ? policy.groupId : null}
          />
          <FacetFilters facets={standardFacets} />
        </FilterPanel>

        <div className="lg:col-span-3">
          <ChatSearchOverview />
          <HitsWithInjectedContent
            transformItems={transformItems}
            hitComponent={({ hit }) => (
              <ComparableSearchHit hit={hit}>
                <B2BHit
                  variant="b2b-warehouse"
                  item={hit}
                  template={productTemplate}
                  slug="b2b-warehouse"
                  extractor={getB2BWarehouseProductHitValues}
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
                  attributes={standardFacets
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
