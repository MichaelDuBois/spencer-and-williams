'use client'

import { useCallback } from 'react'

import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { getCustomerGroupPrice } from '@/app/b2b-warehouse/_utils/customerGroupPricing'
import type { ProductPriceResolver } from '@/types/productPricing.types'

export const useB2BCatalogPricing = (): ProductPriceResolver => {
  const policy = useB2BCustomerGroupPolicy()
  return useCallback(
    (basePrice) => {
      if (policy.status !== 'ready') return undefined
      const price = getCustomerGroupPrice(basePrice, policy.discount)
      return price
        ? {
            basePrice: price.baseUnitCents / 100,
            customerPrice: price.netUnitCents / 100,
            discountAmount: price.discountUnitCents / 100,
          }
        : undefined
    },
    [policy],
  )
}
