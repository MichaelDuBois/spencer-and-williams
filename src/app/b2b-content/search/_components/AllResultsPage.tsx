import type { B2BContentSearchTabKey } from '@/app/b2b-content/_utils/tabUtils'
import { FederatedSection } from '@/app/b2b-content/search/_components/FederatedSection'
import { SearchScaffold } from '@/app/b2b-content/search/_components/SearchScaffold'
import { B2B_CONTENT_INDEX_KEYS } from '@/app/b2b-content/types'

interface AllResultsPageProps {
  activeTab: B2BContentSearchTabKey
}

export const AllResultsPage = ({ activeTab }: AllResultsPageProps) => (
  <SearchScaffold activeTab={activeTab}>
    <div className="space-y-10">
      {B2B_CONTENT_INDEX_KEYS.map((indexKey) => (
        <FederatedSection key={indexKey} indexKey={indexKey} />
      ))}
    </div>
  </SearchScaffold>
)
