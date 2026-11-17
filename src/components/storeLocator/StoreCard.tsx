'use client'

import { ShopAtStoreCTA } from '@/components/storeLocator/ShopAtStoreCTA'
import { StockPill } from '@/components/storeLocator/StockPill'
import { cn } from '@/lib/utils'
import { getLocationName } from '@/types/location.types'
import type { GenericLocation } from '@/types/location.types'
import { formatAddress } from '@/utilities/formatAddress'
import { formatHours } from '@/utilities/formatHours'

interface StoreCardProps {
  location: GenericLocation
  isSelected: boolean
  verticalSlug: string
  noun?: string
  inStock?: boolean
  showShopCTA: boolean
  productId?: string
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

export const StoreCard = ({
  location,
  isSelected,
  verticalSlug,
  noun = 'store',
  inStock,
  showShopCTA,
  productId,
  onHover,
  onSelect,
}: StoreCardProps) => {
  const name = getLocationName(location, verticalSlug)
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => onHover(location.objectID)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(location.objectID)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(location.objectID)
        }
      }}
      className={cn(
        'border-border hover:bg-muted/50 flex w-full flex-col gap-0.5 border-b p-4 text-left transition-colors',
        isSelected && 'bg-muted',
      )}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-foreground truncate text-sm font-medium">
          {name}
        </div>
        {typeof inStock === 'boolean' && <StockPill inStock={inStock} />}
      </div>
      <div className="text-muted-foreground text-xs">
        {formatAddress(location.address).map((line, index) => (
          <div key={`${line}-${index}`}>{line}</div>
        ))}
      </div>
      <div className="text-muted-foreground mt-1 text-xs">
        {formatHours(location.openingTime, location.closingTime)}
      </div>
      {showShopCTA && isSelected && (
        <ShopAtStoreCTA
          storeId={location.objectID}
          verticalSlug={verticalSlug}
          noun={noun}
          productId={productId}
        />
      )}
    </div>
  )
}
