'use client'

import { Configure } from 'react-instantsearch'

import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { getB2BCatalogFilters } from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import { toAlgoliaFilterStringLiteral } from '@/utilities/algoliaFilters'

export const StoreFilterConfigure = () => {
  const { storeId } = useStoreIdFilter()
  const policy = useB2BCustomerGroupPolicy()
  const filters =
    policy.status !== 'inactive'
      ? getB2BCatalogFilters(policy)
      : storeId
        ? `availableInStores.objectID:${toAlgoliaFilterStringLiteral(storeId)}`
        : ''
  const ruleContexts =
    policy.status === 'ready' && policy.groupId ? [policy.groupId] : undefined

  return <Configure filters={filters} {...(ruleContexts && { ruleContexts })} />
}
