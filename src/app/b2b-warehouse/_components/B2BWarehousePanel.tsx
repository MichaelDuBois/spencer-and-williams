'use client'

import { MapPin, Warehouse, X } from 'lucide-react'
import Link from 'next/link'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import { cn } from '@/lib/utils'
import { getLocationName } from '@/types/location.types'

export const B2BWarehousePanel = () => {
  const { storeId, store, isLoading, clear } = useStoreIdFilter()
  const config = useActiveConfig()

  if (!storeId) {
    return (
      <div className="border-border mb-4 flex flex-col gap-3 border-b pb-4">
        <span className="text-foreground font-medium">Warehouse</span>
        <Link
          href={config ? `/${config.slug}/stores` : '/b2b-warehouse/stores'}
          className="text-accent flex items-center gap-2 text-sm font-medium hover:underline">
          <MapPin className="h-4 w-4" />
          Select a warehouse
        </Link>
      </div>
    )
  }

  const storeName = isLoading
    ? 'Loading warehouse…'
    : (store && config && getLocationName(store, config.slug)) ||
      store?.address ||
      'Unknown warehouse'

  return (
    <div
      className={cn(
        'border-accent rounded-card relative mb-4 flex flex-col gap-3 border p-3 px-4',
        isLoading && 'opacity-75',
      )}>
      <button
        type="button"
        onClick={clear}
        aria-label="Clear selected warehouse"
        className="text-muted-foreground hover:text-foreground absolute top-4 right-3 cursor-pointer transition-colors">
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 pr-6">
        <Warehouse className="text-accent h-5 w-5 shrink-0" />
        <span className="text-foreground text-lg font-semibold">
          Shopping at:
        </span>
      </div>

      <p className="text-foreground text-sm">{storeName}</p>
    </div>
  )
}
