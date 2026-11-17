'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Configure, Index } from 'react-instantsearch'

import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { getB2BCatalogFilters } from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { combineAlgoliaFilters } from '@/utilities/algoliaFilters'
import { getFilter } from '@/utilities/getSlug'

interface CollectionPageProps {
  indexId: string
  children: (title: string) => React.ReactNode
}

export const CollectionPage = ({ indexId, children }: CollectionPageProps) => {
  const { slug: urlSlug } = useParams<{ slug: string }>()
  const config = useActiveConfig()
  const policy = useB2BCustomerGroupPolicy()
  const storeId = useSearchParams().get('storeId')
  useScrollToTop()

  if (!config) return null

  const collections = config.collections?.map((c) => c.collection) ?? []

  const { name, filter } = getFilter(urlSlug, {
    items: collections,
    attribute: '_collections',
  })

  const storeFilter = storeId ? `availableInStores.objectID:"${storeId}"` : null
  const filters = combineAlgoliaFilters(
    filter,
    policy.status === 'inactive' ? storeFilter : getB2BCatalogFilters(policy),
  )
  const customerGroupRuleContexts =
    policy.status === 'ready' && policy.groupId ? [policy.groupId] : []

  const indexName = config.algolia.primaryIndex.name

  return (
    <Index indexName={indexName} indexId={indexId}>
      <Configure
        filters={filters}
        ruleContexts={[...customerGroupRuleContexts, `collection-${urlSlug}`]}
        query=""
      />
      {children(name)}
    </Index>
  )
}
