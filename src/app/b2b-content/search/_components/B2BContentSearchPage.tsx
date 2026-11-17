import type { B2BContentSearchTabKey } from '@/app/b2b-content/_utils/tabUtils'
import { AllResultsPage } from '@/app/b2b-content/search/_components/AllResultsPage'
import { SingleIndexPage } from '@/app/b2b-content/search/_components/SingleIndexPage'
import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'

interface B2BContentSearchPageProps {
  activeTab: B2BContentSearchTabKey
}

export const B2BContentSearchPage = ({
  activeTab,
}: B2BContentSearchPageProps) => (
  <>
    {activeTab === 'all' && <ChatSearchOverview />}
    {activeTab === 'all' ? (
      <AllResultsPage activeTab={activeTab} />
    ) : (
      <SingleIndexPage activeTab={activeTab} indexKey={activeTab} />
    )}
  </>
)
