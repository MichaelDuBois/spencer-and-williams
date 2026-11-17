'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { useGetRawHit, type UseGetRawHitOptions } from '@/hooks/useGetRawHit'
import type {
  EcommerceProductHit,
  FashionProductHit,
} from '@/types/recordHit.types'

interface AvailableInStoresEntry {
  inStock: boolean
  objectID: string
}

type ProductWithStores = (FashionProductHit | EcommerceProductHit) & {
  availableInStores?: AvailableInStoresEntry[]
}

export interface UseProductStoreAvailabilityReturn {
  product: ProductWithStores | null
  productId: string | null
  productName: string | undefined
  allowedStoreIds: string[]
  stockByStoreId: Record<string, boolean>
  isAvailable: boolean
  isLoading: boolean
}

export const useProductStoreAvailability = (
  queryOptions?: UseGetRawHitOptions,
): UseProductStoreAvailabilityReturn => {
  const params = useSearchParams()
  const productId = params.get('productId')

  const { data: product, isLoading } = useGetRawHit<ProductWithStores>(
    productId ?? '',
    queryOptions,
  )

  const { allowedStoreIds, stockByStoreId } = useMemo(() => {
    const entries = product?.availableInStores ?? []
    const ids: string[] = []
    const stock: Record<string, boolean> = {}
    for (const entry of entries) {
      ids.push(entry.objectID)
      stock[entry.objectID] = entry.inStock
    }
    return { allowedStoreIds: ids, stockByStoreId: stock }
  }, [product])

  return {
    product: product ?? null,
    productId,
    productName: product?.name,
    allowedStoreIds,
    stockByStoreId,
    isAvailable: Boolean(productId),
    isLoading,
  }
}
