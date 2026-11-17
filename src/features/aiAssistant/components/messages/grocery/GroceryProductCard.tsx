'use client'

import { Utensils } from 'lucide-react'
import Link from 'next/link'

import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import { Image } from '@/components/image/Image'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { ProductCardSkeleton } from '@/features/aiAssistant/components/messages/ProductCardSkeleton'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type { DisplayProduct } from '@/features/aiAssistant/types'
import { useAddToCart } from '@/hooks/useAddToCart'

interface GroceryProductCardProps {
  product: DisplayProduct
  directData?: GroceryProductHitValues
}

const CARD_WIDTH = 'w-40'

export const GroceryProductCard = ({
  product,
  directData,
}: GroceryProductCardProps) => {
  const productData = useCardData(directData, ['product', product.objectID])
  const { addToCart } = useAddToCart({ surface: 'assistant' })
  const handleLinkClick = useAssistantLinkClick(product.objectID, product)

  if (!productData) return <ProductCardSkeleton variant="grocery" />

  return (
    <Link
      href={`/grocery/product/${encodeURIComponent(product.objectID)}`}
      onClick={handleLinkClick}
      className={`group border-border rounded-card bg-card ${CARD_WIDTH} flex shrink-0 flex-col self-stretch overflow-hidden border transition-shadow duration-200 hover:shadow-md`}>
      <div className="bg-card relative h-40 w-full shrink-0 px-4 pt-9 pb-4">
        {product.why && (
          <span className="bg-accent/10 text-accent text-micro absolute top-2 left-2 z-10 max-w-[calc(100%-1rem)] truncate rounded-full px-2 py-0.5 font-medium tracking-wide">
            {product.why}
          </span>
        )}
        <div className="relative h-full w-full">
          <Image
            src={productData.image}
            alt={productData.name}
            fill
            sizes="160px"
            className="object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        {productData.brand ? (
          <p className="text-muted-foreground truncate text-xs font-medium tracking-wide uppercase">
            {productData.brand}
          </p>
        ) : (
          <div className="h-4" aria-hidden="true" />
        )}
        <h3 className="text-foreground mt-0.5 line-clamp-2 text-xs leading-snug font-medium">
          {productData.name}
        </h3>
        {/* Footer pinned to the bottom so the gap opens between name and price */}
        <div className="mt-auto flex flex-col pt-3">
          {productData.price !== undefined && (
            <p className="text-foreground text-base font-bold">
              ${productData.price.toFixed(2)}
            </p>
          )}
          {productData.nutrition?.servingSize && (
            <div className="text-muted-foreground mt-1 flex items-start gap-2 text-xs">
              <Utensils className="mt-0.5 h-3 w-3 shrink-0" />
              <p>{productData.nutrition.servingSize}</p>
            </div>
          )}
          <AddToCartButton
            label="Add"
            showIcon={false}
            animated={false}
            onAdd={() => {
              addToCart(productData)
            }}
            className="mt-3 w-full rounded-md"
          />
        </div>
      </div>
    </Link>
  )
}
