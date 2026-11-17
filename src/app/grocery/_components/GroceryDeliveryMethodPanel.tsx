'use client'

import { useAtom } from 'jotai'
import { MapPin, Store, Truck } from 'lucide-react'
import Link from 'next/link'

import { GroceryStoreSummaryCard } from '@/app/grocery/_components/GroceryStoreSummaryCard'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import { cn } from '@/lib/utils'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
} from '@/stores/groceryDeliveryMethod'

const MODES = [
  { value: 'delivery', label: 'Delivery', icon: Truck },
  { value: 'pickup', label: 'Pickup', icon: Store },
] as const

export const GroceryDeliveryMethodPanel = () => {
  const [mode, setMode] = useAtom(groceryDeliveryMethodAtom, {
    store: groceryDeliveryMethodStore,
  })
  const { storeId } = useStoreIdFilter()

  return (
    <div className="border-border flex flex-col gap-3 border-b">
      <span className="text-muted-foreground text-xs tracking-wide uppercase">
        How would you like to shop?
      </span>

      <div className="grid grid-cols-2 gap-2">
        {MODES.map(({ value, label, icon: Icon }) => {
          const isActive = mode === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={isActive}
              className={cn(
                'rounded-button flex cursor-pointer items-center justify-center gap-2 border px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-accent bg-accent/5 text-foreground'
                  : 'border-input text-muted-foreground hover:bg-muted',
              )}>
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-accent' : 'text-muted-foreground',
                )}
              />
              {label}
            </button>
          )
        })}
      </div>

      {storeId ? (
        <GroceryStoreSummaryCard />
      ) : (
        <Link
          href="/grocery/stores"
          className="text-accent mb-2 flex items-center gap-2 text-sm font-medium hover:underline">
          <MapPin className="h-4 w-4" />
          Select a store
        </Link>
      )}
    </div>
  )
}
