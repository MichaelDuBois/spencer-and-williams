'use client'

import { useB2BCatalogPricing } from '@/app/b2b-warehouse/_hooks/useB2BCatalogPricing'
import { cn } from '@/lib/utils'
import type { ProductPriceProps } from '@/types/productPricing.types'

export const B2BProductPrice = ({
  price,
  className,
  unavailableLabel,
}: ProductPriceProps & { unavailableLabel?: string }) => {
  const getPrice = useB2BCatalogPricing()
  const quote = getPrice(price)
  if (!quote)
    return unavailableLabel ? (
      <span className={className}>{unavailableLabel}</span>
    ) : null
  const formatted = quote.customerPrice.toFixed(2)
  return (
    <span
      className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      {quote.discountAmount > 0 && (
        <del
          className="text-muted-foreground text-[0.8em] font-normal"
          aria-label={`Base price $${quote.basePrice.toFixed(2)}`}>
          ${quote.basePrice.toFixed(2)}
        </del>
      )}
      <span
        aria-label={
          quote.discountAmount > 0 ? `Customer price $${formatted}` : undefined
        }>
        ${formatted}
      </span>
    </span>
  )
}
