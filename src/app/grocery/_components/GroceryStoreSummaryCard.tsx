'use client'

import { useAtomValue } from 'jotai'
import { Store, Truck, X } from 'lucide-react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
} from '@/stores/groceryDeliveryMethod'
import { getLocationName } from '@/types/location.types'

export const GroceryStoreSummaryCard = () => {
  const { storeId, store, clear } = useStoreIdFilter()
  const config = useActiveConfig()
  const mode = useAtomValue(groceryDeliveryMethodAtom, {
    store: groceryDeliveryMethodStore,
  })

  if (!storeId) return null

  const isPickup = mode === 'pickup'
  const Icon = isPickup ? Store : Truck
  const heading = isPickup ? 'Picking up at:' : 'Delivering from:'
  const storeName =
    (store && config && getLocationName(store, config.slug)) ||
    store?.address ||
    'Loading store…'

  return (
    <div className="border-accent rounded-card relative mb-2 flex flex-col gap-3 border p-3 px-4">
      <button
        type="button"
        onClick={clear}
        aria-label="Clear selected store"
        className="text-muted-foreground hover:text-foreground absolute top-4 right-3 cursor-pointer transition-colors">
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 pr-6">
        <Icon className="text-accent h-5 w-5 shrink-0" />
        <span className="text-foreground text-lg font-semibold">{heading}</span>
      </div>

      <p className="text-foreground text-sm">{storeName}</p>
    </div>
  )
}
