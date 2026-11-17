import { isValidDiscountRate } from '@/app/b2b-warehouse/_utils/customerGroupPricing'
import { B2B_VISIBILITY_ATTRIBUTE } from '@/app/b2b-warehouse/customerGroups'
import type { SelectedStore } from '@/stores/selectedStore'
import type { CustomerGroupProfile, SelectableProfile } from '@/types'
import {
  combineAlgoliaFilters,
  toAlgoliaFilterStringLiteral,
} from '@/utilities/algoliaFilters'
import { isRecord } from '@/utilities/isRecord'

export type B2BCustomerGroupPolicy =
  | { status: 'inactive' }
  | { status: 'invalid'; reason: 'group' | 'warehouse' }
  | {
      status: 'ready'
      groupId: string | null
      discount: number
      warehouseId: string | null
    }

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export const isValidCustomerGroupProfile = (
  value: unknown,
): value is CustomerGroupProfile =>
  isRecord(value) &&
  !Array.isArray(value) &&
  value.type === 'customerGroup' &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.label) &&
  isNonEmptyString(value.description) &&
  isNonEmptyString(value.token) &&
  isNonEmptyString(value.groupId) &&
  isValidDiscountRate(value.discount)

interface ResolvePolicyArgs {
  vertical: string | undefined
  profile: SelectableProfile | null
  selectedStore: SelectedStore | null
}

export const resolveB2BCustomerGroupPolicy = ({
  vertical,
  profile,
  selectedStore,
}: ResolvePolicyArgs): B2BCustomerGroupPolicy => {
  if (vertical !== 'b2b-warehouse') return { status: 'inactive' }

  const group = profile?.type === 'customerGroup' ? profile : null
  if (group && !isValidCustomerGroupProfile(group)) {
    return { status: 'invalid', reason: 'group' }
  }

  const warehouseId =
    selectedStore?.vertical === vertical ? selectedStore.storeId : null
  if (warehouseId !== null && !isNonEmptyString(warehouseId)) {
    return { status: 'invalid', reason: 'warehouse' }
  }

  return {
    status: 'ready',
    groupId: group?.groupId ?? null,
    discount: group?.discount ?? 0,
    warehouseId,
  }
}

export const getB2BCatalogFilters = (
  policy: B2BCustomerGroupPolicy,
): string => {
  if (policy.status === 'inactive') return ''
  if (policy.status === 'invalid') {
    // A contradiction cannot match a record, even if a sentinel ID exists.
    return 'objectID:"__invalid_b2b_policy__" AND NOT objectID:"__invalid_b2b_policy__"'
  }

  return combineAlgoliaFilters(
    policy.groupId &&
      `${B2B_VISIBILITY_ATTRIBUTE}:${toAlgoliaFilterStringLiteral(policy.groupId)}`,
    policy.warehouseId &&
      `availableInStores.objectID:${toAlgoliaFilterStringLiteral(policy.warehouseId)}`,
  )
}

const matchesFacetValue = (value: string, selected: string): boolean =>
  value.toLowerCase() === selected.toLowerCase()

export const isB2BProductEligible = (
  product: unknown,
  policy: B2BCustomerGroupPolicy,
): boolean => {
  if (policy.status === 'inactive') return true
  if (policy.status === 'invalid') return false
  if (!isRecord(product) || Array.isArray(product)) return false

  const { groupId, warehouseId } = policy
  if (groupId !== null) {
    const groups = product[B2B_VISIBILITY_ATTRIBUTE]
    if (
      !Array.isArray(groups) ||
      !groups.every(isNonEmptyString) ||
      !groups.some((group) => matchesFacetValue(group, groupId))
    ) {
      return false
    }
  }

  if (warehouseId !== null) {
    const stores = product.availableInStores
    if (
      !Array.isArray(stores) ||
      !stores.every(
        (store): store is { objectID: string } =>
          isRecord(store) &&
          !Array.isArray(store) &&
          isNonEmptyString(store.objectID),
      ) ||
      !stores.some((store) => matchesFacetValue(store.objectID, warehouseId))
    ) {
      return false
    }
  }

  return true
}
