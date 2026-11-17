'use client'

import { MapPin } from 'lucide-react'
import Link from 'next/link'

import { getLocatorNoun } from '@/components/storeLocator/getLocatorNoun'
import { StockPill } from '@/components/storeLocator/StockPill'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import { cn } from '@/lib/utils'
import { getLocationName } from '@/types/location.types'
import type { StoreAvailability } from '@/types/location.types'

import type { ReactNode } from 'react'

interface StoreAvailabilityLineProps {
  productId: string
  availableInStores?: StoreAvailability[]
  className?: string
  linkClassName?: string
  inStockLabel?: (storeName: string) => string
}

export const StoreAvailabilityLine = ({
  productId,
  availableInStores,
  className,
  linkClassName,
  inStockLabel,
}: StoreAvailabilityLineProps) => {
  const { storeId, store } = useStoreIdFilter()
  const config = useActiveConfig()

  if (!config) return null

  const slug = config.slug
  const { singular, plural } = getLocatorNoun(config)

  const storesHref = `/${slug}/stores?productId=${encodeURIComponent(productId)}`
  const linkClasses = cn(
    'text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors',
    linkClassName,
  )

  const renderLink = (label: string) => (
    <Link href={storesHref} className={linkClasses}>
      <MapPin className="h-3.5 w-3.5" />
      {label}
    </Link>
  )

  let content: ReactNode

  if (!storeId) {
    const inStockCount = availableInStores?.filter((s) => s.inStock).length ?? 0
    const hasStoreData = (availableInStores?.length ?? 0) > 0
    content = renderLink(
      hasStoreData && inStockCount > 0
        ? `In stock at ${inStockCount} ${inStockCount === 1 ? singular : plural}`
        : `Show in-${singular} availability`,
    )
  } else {
    const storeName = store
      ? getLocationName(store, slug)
      : `selected ${singular}`
    const entry = availableInStores?.find((s) => s.objectID === storeId)

    if (!entry) {
      content = renderLink(
        `Not carried at ${storeName} — find another ${singular}`,
      )
    } else if (!entry.inStock) {
      content = (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm">
            <StockPill inStock={false} />
            <span className="text-muted-foreground">
              Currently unavailable at {storeName}
            </span>
          </div>
          {renderLink(`Choose a different ${singular}`)}
        </div>
      )
    } else {
      content = (
        <div className="flex items-center gap-2 text-sm">
          <StockPill inStock />
          <span className="text-muted-foreground">
            {inStockLabel
              ? inStockLabel(storeName)
              : `Available at ${storeName}`}
          </span>
        </div>
      )
    }
  }

  return className ? <div className={className}>{content}</div> : <>{content}</>
}
