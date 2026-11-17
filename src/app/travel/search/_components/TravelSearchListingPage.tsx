'use client'

import { SlidersHorizontal, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Hits, useStats } from 'react-instantsearch'

import { ClearAllButton } from '@/components/filters/ClearAllButton'
import { CurrentRefinements } from '@/components/filters/CurrentRefinements'
import { FacetFilters } from '@/components/filters/FacetFilters'
import { Pagination } from '@/components/pagination/Pagination'
import { FilterSuggestionsWidget } from '@/components/results/FilterSuggestionsWidget'
import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'
import { useHrefWithQueryString } from '@/hooks/useHrefWithQueryString'
import type { FacetConfig } from '@/types'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface SearchStatsProps {
  entityName: string
}

const SearchStats = ({ entityName }: SearchStatsProps) => {
  const { nbHits, query } = useStats()
  return (
    <span className="text-muted-foreground text-sm">
      {query ? `${nbHits} results for "${query}"` : `${nbHits} ${entityName}`}
    </span>
  )
}

interface TravelSearchListingPageProps {
  title: string
  icon: React.ReactNode
  entityName: string
  facets: FacetConfig[]
  hitComponent: (hit: AlgoliaHit<BaseHit>) => React.ReactNode
  hitsClassNames?: { list?: string; item?: string }
}

export const TravelSearchListingPage = ({
  title,
  icon,
  entityName,
  facets,
  hitComponent,
  hitsClassNames = { list: 'flex flex-col', item: '' },
}: TravelSearchListingPageProps) => {
  const buildHref = useHrefWithQueryString()
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        href={buildHref('/travel/search')}
        className="text-accent group mb-6 flex w-fit items-center gap-1.5 text-sm font-medium">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        <span className="transition-transform group-hover:-translate-x-0.5">
          All results
        </span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Title + Filters Sidebar */}
        <aside className="lg:col-span-1">
          {/* Page Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              {icon}
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-2xl font-bold">{title}</h1>
            </div>
          </div>

          <div className="sticky top-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-medium">Filters</span>
              </div>
              <ClearAllButton />
            </div>

            <CurrentRefinements facets={facets} />

            <FacetFilters facets={facets} />
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <SearchStats entityName={entityName} />
          </div>
          {/* AI Filter Suggestions */}
          <FilterSuggestionsWidget
            className="mb-6"
            variant="standard"
            attributes={facets
              .filter((f) => f.type !== 'slider')
              .flatMap((f) => f.attribute)}
          />

          <ChatSearchOverview />

          <Hits
            bannerComponent={false}
            hitComponent={({ hit }) => hitComponent(hit)}
            classNames={{
              list: hitsClassNames.list ?? 'flex flex-col',
              item: hitsClassNames.item ?? '',
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
