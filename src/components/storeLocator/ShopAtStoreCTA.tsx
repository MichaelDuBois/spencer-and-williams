'use client'

import { useAtomValue } from 'jotai'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
} from '@/stores/groceryDeliveryMethod'

interface ShopAtStoreCTAProps {
  storeId: string
  verticalSlug: string
  noun?: string
  productId?: string
  className?: string
}

export const ShopAtStoreCTA = ({
  storeId,
  verticalSlug,
  noun = 'store',
  productId,
  className,
}: ShopAtStoreCTAProps) => {
  const mode = useAtomValue(groceryDeliveryMethodAtom, {
    store: groceryDeliveryMethodStore,
  })

  const label =
    verticalSlug === 'grocery'
      ? mode === 'pickup'
        ? 'Pick up at this store'
        : 'Deliver from this store'
      : `Shop products at this ${noun}`

  const destination = productId
    ? `/${verticalSlug}/product/${encodeURIComponent(productId)}`
    : `/${verticalSlug}/search`

  return (
    <Link
      href={`${destination}?storeId=${encodeURIComponent(storeId)}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn(
        'bg-accent text-accent-foreground rounded-button mt-3 inline-flex items-center justify-center px-3 py-2 text-sm transition-opacity hover:opacity-90',
        className,
      )}>
      {label}
    </Link>
  )
}
