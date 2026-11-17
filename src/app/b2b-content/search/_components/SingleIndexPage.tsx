import { Configure, Index } from 'react-instantsearch'

import { getIndexConfig } from '@/app/b2b-content/_utils/getIndexConfig'
import type { B2BContentSearchTabKey } from '@/app/b2b-content/_utils/tabUtils'
import { SearchScaffold } from '@/app/b2b-content/search/_components/SearchScaffold'
import { SectionHits } from '@/app/b2b-content/search/_components/SectionHits'
import type { B2BContentIndexKey } from '@/app/b2b-content/types'
import { FacetFilters } from '@/components/filters/FacetFilters'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Pagination } from '@/components/pagination/Pagination'
import { FilterSuggestionsWidget } from '@/components/results/FilterSuggestionsWidget'

interface SingleIndexPageProps {
  activeTab: B2BContentSearchTabKey
  indexKey: B2BContentIndexKey
}

export const SingleIndexPage = ({
  activeTab,
  indexKey,
}: SingleIndexPageProps) => {
  const { name, facets } = getIndexConfig(indexKey)

  return (
    <Index indexName={name}>
      <Configure hitsPerPage={12} />
      <SearchScaffold activeTab={activeTab} filters={`indexName:"${name}"`}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <FilterPanel facets={facets ?? []}>
            <FacetFilters facets={facets ?? []} />
          </FilterPanel>
          <div className="lg:col-span-3">
            {facets?.length ? (
              <div className="mb-6">
                <FilterSuggestionsWidget
                  variant="standard"
                  attributes={facets.flatMap((f) => f.attribute)}
                />
              </div>
            ) : null}
            <SectionHits indexKey={indexKey} />
            <div className="mt-10">
              <Pagination variant="standard" />
            </div>
          </div>
        </div>
      </SearchScaffold>
    </Index>
  )
}
