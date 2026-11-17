'use client'

import { useCallback, useMemo } from 'react'

import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import {
  getB2BCatalogFilters,
  isB2BProductEligible,
  type B2BCustomerGroupPolicy,
} from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { B2B_VISIBILITY_ATTRIBUTE } from '@/app/b2b-warehouse/customerGroups'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'

export interface B2BProductHitOptions {
  /** Scope to the customer group only, for lookups that ask which warehouses stock a product. */
  ignoreWarehouse?: boolean
}

export interface B2BProductHitQueryOptions extends HitQueryOptions {
  ruleContexts?: string[]
}

// Only a `ready` policy carries a warehouse; `inactive` and `invalid` keep
// their behaviour, so an invalid policy still fails closed.
const dropWarehouse = (
  policy: B2BCustomerGroupPolicy,
): B2BCustomerGroupPolicy =>
  policy.status === 'ready' ? { ...policy, warehouseId: null } : policy

export const useB2BProductHitOptions = ({
  ignoreWarehouse = false,
}: B2BProductHitOptions = {}): B2BProductHitQueryOptions => {
  const policy = useB2BCustomerGroupPolicy()
  const scopedPolicy = useMemo(
    () => (ignoreWarehouse ? dropWarehouse(policy) : policy),
    [ignoreWarehouse, policy],
  )
  const isHitValid = useCallback<NonNullable<HitQueryOptions['isHitValid']>>(
    (hit) => isB2BProductEligible(hit, scopedPolicy),
    [scopedPolicy],
  )

  return {
    filters: getB2BCatalogFilters(scopedPolicy),
    enabled: policy.status === 'ready',
    isHitValid,
    requiredAttributes: [
      B2B_VISIBILITY_ATTRIBUTE,
      'availableInStores.objectID',
    ],
    ...(policy.status === 'ready' &&
      policy.groupId && { ruleContexts: [policy.groupId] }),
  }
}
