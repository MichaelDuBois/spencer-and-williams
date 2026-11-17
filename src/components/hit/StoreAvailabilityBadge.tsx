'use client'

import { StockPill } from '@/components/storeLocator/StockPill'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'

interface AvailableInStoresEntry {
  inStock: boolean
  objectID: string
}

interface StoreAvailabilityBadgeProps {
  item: Record<string, unknown>
}

export const StoreAvailabilityBadge = ({
  item,
}: StoreAvailabilityBadgeProps) => {
  const { storeId } = useStoreIdFilter()
  if (!storeId) return null
  const entries =
    (item.availableInStores as AvailableInStoresEntry[] | undefined) ?? []
  const match = entries.find((e) => e.objectID === storeId)
  if (!match) return null
  return (
    <StockPill inStock={match.inStock} className="absolute top-2 left-2 z-10" />
  )
}
