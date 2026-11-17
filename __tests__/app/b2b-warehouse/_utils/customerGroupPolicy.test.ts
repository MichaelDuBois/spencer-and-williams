import { describe, expect, it } from 'vitest'

import {
  getB2BCatalogFilters,
  isB2BProductEligible,
  isValidCustomerGroupProfile,
  resolveB2BCustomerGroupPolicy,
} from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { PERSONAS } from '@/app/b2b-warehouse/personas'
import type { SelectableProfile } from '@/types'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'

const resolvePolicy = (
  profile: SelectableProfile | null,
  warehouseId: string | null = null,
) =>
  resolveB2BCustomerGroupPolicy({
    vertical: 'b2b-warehouse',
    profile,
    selectedStore:
      warehouseId === null
        ? null
        : { vertical: 'b2b-warehouse', storeId: warehouseId },
  })

const PRODUCTS = [
  {
    objectID: 'A',
    visible_by: [GROUP_0.groupId],
    availableInStores: [{ objectID: '1', inStock: true }],
  },
  {
    objectID: 'B',
    visible_by: [GROUP_1.groupId],
    availableInStores: [{ objectID: '1', inStock: true }],
  },
  {
    objectID: 'C',
    visible_by: [GROUP_0.groupId, GROUP_1.groupId],
    availableInStores: [{ objectID: '2', inStock: false }],
  },
]

describe('customer group policy', () => {
  it.each([
    [GROUP_0, null, ['A', 'C']],
    [GROUP_1, null, ['B', 'C']],
    [GROUP_0, '1', ['A']],
    [GROUP_1, '2', ['C']],
    [null, null, ['A', 'B', 'C']],
    [null, '1', ['A', 'B']],
    [PERSONAS[0], null, ['A', 'B', 'C']],
  ])(
    'selects eligible products for %j at warehouse %s',
    (profile, warehouseId, ids) => {
      const policy = resolvePolicy(profile, warehouseId)
      expect(
        PRODUCTS.filter((product) => isB2BProductEligible(product, policy)).map(
          (product) => product.objectID,
        ),
      ).toEqual(ids)
    },
  )

  it('keeps warehouse membership separate from in-stock status', () => {
    expect(isB2BProductEligible(PRODUCTS[2], resolvePolicy(GROUP_0, '2'))).toBe(
      true,
    )
  })

  it('does not use the reference locations field as locator membership', () => {
    expect(
      isB2BProductEligible(
        { visible_by: [GROUP_0.groupId], locations: ['1'] },
        resolvePolicy(GROUP_0, '1'),
      ),
    ).toBe(false)
  })

  it.each([undefined, null, 'customer_group_0', [], [GROUP_0.groupId, 123]])(
    'rejects missing or malformed required group membership: %j',
    (visible_by) => {
      expect(isB2BProductEligible({ visible_by }, resolvePolicy(GROUP_0))).toBe(
        false,
      )
    },
  )

  it.each([
    undefined,
    null,
    '1',
    [],
    [{ objectID: 1 }],
    [{ objectID: '1' }, null],
  ])(
    'rejects missing or malformed required warehouse membership: %j',
    (availableInStores) => {
      expect(
        isB2BProductEligible({ availableInStores }, resolvePolicy(null, '1')),
      ).toBe(false)
    },
  )

  it('matches facet values case-insensitively like Algolia', () => {
    expect(
      isB2BProductEligible(
        { visible_by: ['CUSTOMER_GROUP_0'] },
        resolvePolicy(GROUP_0),
      ),
    ).toBe(true)
  })

  it('ignores a warehouse selected in another vertical', () => {
    expect(
      resolveB2BCustomerGroupPolicy({
        vertical: 'b2b-warehouse',
        profile: GROUP_0,
        selectedStore: { vertical: 'fashion', storeId: '1' },
      }),
    ).toEqual({
      status: 'ready',
      groupId: GROUP_0.groupId,
      discount: 0.15,
      warehouseId: null,
    })
  })

  it('leaves unrelated verticals unchanged', () => {
    const policy = resolveB2BCustomerGroupPolicy({
      vertical: 'fashion',
      profile: GROUP_0,
      selectedStore: null,
    })
    expect(policy).toEqual({ status: 'inactive' })
    expect(getB2BCatalogFilters(policy)).toBe('')
    expect(isB2BProductEligible({}, policy)).toBe(true)
  })

  it('uses no group restriction or discount for an ordinary persona', () => {
    const policy = resolvePolicy(PERSONAS[0])
    expect(policy).toEqual({
      status: 'ready',
      groupId: null,
      discount: 0,
      warehouseId: null,
    })
    expect(getB2BCatalogFilters(policy)).toBe('')
  })

  it.each([-0.01, 1.01, NaN, Infinity])(
    'blocks an invalid rate %s instead of dropping the group restriction',
    (discount) => {
      const policy = resolvePolicy({ ...GROUP_0, discount })
      expect(policy).toEqual({ status: 'invalid', reason: 'group' })
      expect(isB2BProductEligible(PRODUCTS[0], policy)).toBe(false)
      expect(getB2BCatalogFilters(policy)).toBe(
        'objectID:"__invalid_b2b_policy__" AND NOT objectID:"__invalid_b2b_policy__"',
      )
    },
  )

  it('rejects an empty selected warehouse rather than showing all warehouses', () => {
    expect(resolvePolicy(GROUP_0, '  ')).toEqual({
      status: 'invalid',
      reason: 'warehouse',
    })
  })

  it('combines group and warehouse as hard filters with escaped values', () => {
    const policy = resolvePolicy(
      { ...GROUP_0, groupId: 'group "A"\\B' },
      'warehouse "1"',
    )
    expect(getB2BCatalogFilters(policy)).toBe(
      'visible_by:"group \\"A\\"\\\\B" AND availableInStores.objectID:"warehouse \\"1\\""',
    )
  })
})

describe('group configuration validation', () => {
  it('accepts groups without affinity properties and bounds inclusive of 0 and 1', () => {
    expect(isValidCustomerGroupProfile(GROUP_0)).toBe(true)
    expect(isValidCustomerGroupProfile({ ...GROUP_0, discount: 0 })).toBe(true)
    expect(isValidCustomerGroupProfile({ ...GROUP_0, discount: 1 })).toBe(true)
  })

  it.each(['id', 'label', 'description', 'token', 'groupId'])(
    'requires nonempty %s',
    (field) => {
      expect(isValidCustomerGroupProfile({ ...GROUP_0, [field]: ' ' })).toBe(
        false,
      )
      expect(
        isValidCustomerGroupProfile({ ...GROUP_0, [field]: undefined }),
      ).toBe(false)
    },
  )

  it.each([null, [], {}, PERSONAS[0], { ...GROUP_0, discount: '0.15' }])(
    'rejects invalid external group configuration %j',
    (value) => {
      expect(isValidCustomerGroupProfile(value)).toBe(false)
    },
  )
})
