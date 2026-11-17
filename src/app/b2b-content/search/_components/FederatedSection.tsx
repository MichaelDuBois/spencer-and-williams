'use client'

import Link from 'next/link'
import { Configure, Index } from 'react-instantsearch'

import { getIndexConfig } from '@/app/b2b-content/_utils/getIndexConfig'
import { tabHref, tabLabel } from '@/app/b2b-content/_utils/tabUtils'
import { SectionHits } from '@/app/b2b-content/search/_components/SectionHits'
import type { B2BContentIndexKey } from '@/app/b2b-content/types'
import { useHrefWithQueryString } from '@/hooks/useHrefWithQueryString'

interface FederatedSectionProps {
  indexKey: B2BContentIndexKey
}

export const FederatedSection = ({ indexKey }: FederatedSectionProps) => {
  const buildHref = useHrefWithQueryString()
  const { name } = getIndexConfig(indexKey)

  return (
    <Index indexName={name}>
      <Configure hitsPerPage={3} />
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-foreground text-xl font-semibold">
            {tabLabel(indexKey)}
          </h2>
          <Link
            href={buildHref(tabHref(indexKey))}
            className="text-accent text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <SectionHits
          indexKey={indexKey}
          emptyMessage={`No ${tabLabel(indexKey).toLowerCase()} found`}
        />
      </section>
    </Index>
  )
}
