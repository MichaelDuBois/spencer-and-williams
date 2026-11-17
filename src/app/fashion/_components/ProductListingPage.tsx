'use client'

import { useAtom } from 'jotai'
import { SlidersHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import { type ReactNode } from 'react'

import { FashionInlineArticleCard } from '@/app/fashion/_components/FashionInlineArticleCard'
import { InlineArticleIndex } from '@/app/fashion/_components/InlineArticleIndex'
import { useInlineArticle } from '@/app/fashion/_hooks/useInlineArticle'
import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'
import { FacetFilters } from '@/components/filters/FacetFilters'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Hit } from '@/components/hit/Hit'
import { Pagination } from '@/components/pagination/Pagination'
import { FilterSuggestionsWidget } from '@/components/results/FilterSuggestionsWidget'
import { HitsWithInjectedContent } from '@/components/results/HitsWithInjectedContent'
import { QueryCatSuggestion } from '@/components/results/QueryCatSuggestion'
import { QueryRuleBanner } from '@/components/results/QueryRuleBanner'
import { SortByWidget } from '@/components/results/SortByWidget'
import { StoreFilterChip } from '@/components/results/StoreFilterChip'
import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'
import { ComparableSearchHit } from '@/features/chatWidget/components/ComparableSearchHit'
import { DURATION_LAYOUT } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { isFilterOpenAtom } from '@/stores/filterPanel'

interface ProductListingPageProps {
  header: ReactNode
  category?: string
}

export const ProductListingPage = ({
  header,
  category,
}: ProductListingPageProps) => {
  const { algolia } = fashionConfig
  const primaryIndex = algolia.primaryIndex
  const productTemplate = primaryIndex.template
  const facets = primaryIndex.facets ?? []
  const [isFilterOpen, setIsFilterOpen] = useAtom(isFilterOpenAtom)
  const {
    isEnabled: isArticleEnabled,
    article,
    position: articlePosition,
    urlOverride,
  } = useInlineArticle()

  return (
    <div className="container mx-auto px-4 py-16">
      <InlineArticleIndex category={category} isEnabled={isArticleEnabled} />

      {header}

      <QueryRuleBanner />

      <QueryCatSuggestion variant="editorial" />

      <StoreFilterChip variant="editorial" />

      <FilterSuggestionsWidget
        className="mb-8"
        variant="editorial"
        attributes={facets.flatMap((f) => f.attribute)}
      />

      <div
        className={cn(
          'grid grid-cols-1 gap-12 lg:transition-[grid-template-columns,gap] lg:duration-500 lg:ease-out',
          isFilterOpen
            ? 'lg:grid-cols-[1fr_4fr]'
            : 'lg:grid-cols-[0fr_1fr] lg:gap-0',
        )}>
        {/* Filters */}
        <FilterPanel
          facets={facets}
          collapsible
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen((prev) => !prev)}>
          <FacetFilters facets={facets} variant="editorial" />
        </FilterPanel>

        {/* Product Grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <motion.button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              aria-hidden={isFilterOpen}
              tabIndex={isFilterOpen ? -1 : 0}
              animate={{ opacity: isFilterOpen ? 0 : 1 }}
              transition={{
                duration: 0,
                delay: isFilterOpen ? 0 : DURATION_LAYOUT,
              }}
              className={cn(
                'text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 text-xs tracking-widest uppercase transition-colors max-lg:hidden',
                isFilterOpen && 'pointer-events-none',
              )}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </motion.button>
            <div className="ml-auto">
              <SortByWidget primaryIndex={primaryIndex} variant="editorial" />
            </div>
          </div>

          {/* Hits */}
          <ChatSearchOverview />
          <HitsWithInjectedContent
            injection={
              article
                ? {
                    content: (
                      <FashionInlineArticleCard
                        article={article}
                        urlOverride={urlOverride}
                      />
                    ),
                    afterIndex: articlePosition,
                    span: 'cell',
                    replacesHit: true,
                  }
                : undefined
            }
            hitComponent={({ hit }) => (
              <ComparableSearchHit hit={hit}>
                <Hit
                  variant="editorial"
                  item={hit}
                  template={productTemplate}
                  slug="fashion"
                  extractor={getFashionProductHitValues}
                />
              </ComparableSearchHit>
            )}
            classNames={{
              list: cn(
                'grid grid-cols-2 sm:grid-cols-3 gap-8',
                isFilterOpen ? 'xl:grid-cols-4' : 'xl:grid-cols-5',
              ),
              item: '',
            }}
          />

          {/* Pagination */}
          <div className="mt-16">
            <Pagination variant="editorial" />
          </div>
        </div>
      </div>
    </div>
  )
}
