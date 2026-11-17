import { Hits } from 'react-instantsearch'

import { B2BContentHit } from '@/app/b2b-content/_components/hitCards/B2BContentHit'
import type { B2BContentIndexKey } from '@/app/b2b-content/types'
import { EmptyIndexState } from '@/components/results/EmptyIndexState'

interface SectionHitsProps {
  indexKey: B2BContentIndexKey
  emptyMessage?: string
}

export const SectionHits = ({ indexKey, emptyMessage }: SectionHitsProps) => (
  <>
    <EmptyIndexState message={emptyMessage} />
    <Hits
      bannerComponent={false}
      hitComponent={({ hit }) => (
        <B2BContentHit hit={hit} indexKey={indexKey} />
      )}
      classNames={{
        list:
          indexKey === 'blogs' || indexKey === 'resources'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'divide-border divide-y',
        item: '',
      }}
    />
  </>
)
