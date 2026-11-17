import { StarRating } from '@/components/ui/StarRating'

import type { ReactNode } from 'react'

interface ProductInfoProps {
  name: string
  brand?: string
  rating?: number
  reviewCount?: number
  price?: number
  priceContent?: ReactNode
  weight?: number
  children?: ReactNode
}

export const ProductInfo = ({
  name,
  brand,
  rating,
  reviewCount,
  price,
  priceContent,
  weight,
  children,
}: ProductInfoProps) => {
  const unitPrice = price && weight ? price / (weight / 1000) : null

  return (
    <>
      {brand && (
        <p className="text-accent text-xs font-medium tracking-wide uppercase">
          {brand}
        </p>
      )}

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-foreground line-clamp-2 text-2xl font-bold">
          {name}
        </h1>
      </div>

      <StarRating rating={rating} count={reviewCount} size="md" />

      {children}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {priceContent ?? (
          <p className="text-foreground text-2xl font-bold">
            ${price?.toFixed(2) ?? '0.00'}
          </p>
        )}
        {weight && (
          <p className="text-muted-foreground text-sm">
            {weight}g{unitPrice && <> · ${unitPrice.toFixed(2)}/kg</>}
          </p>
        )}
      </div>
    </>
  )
}
