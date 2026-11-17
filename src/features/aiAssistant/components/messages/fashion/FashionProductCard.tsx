'use client'

import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { ProductCardSkeleton } from '@/features/aiAssistant/components/messages/ProductCardSkeleton'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type { DisplayProduct, ProductData } from '@/features/aiAssistant/types'
import { useAddToCart } from '@/hooks/useAddToCart'

interface FashionProductCardProps {
  product: DisplayProduct
  directData?: ProductData
}

const CARD_WIDTH = 'w-40'

export const FashionProductCard = ({
  product,
  directData,
}: FashionProductCardProps) => {
  const productData = useCardData(directData, ['product', product.objectID])
  const { addToCart } = useAddToCart({ surface: 'assistant' })
  const handleLinkClick = useAssistantLinkClick(product.objectID, product)

  if (!productData) return <ProductCardSkeleton variant="fashion" />

  return (
    <Link
      href={`/fashion/product/${encodeURIComponent(product.objectID)}`}
      onClick={handleLinkClick}
      className={`group ${CARD_WIDTH} flex shrink-0 flex-col self-stretch`}>
      <div className="bg-background rounded-image relative aspect-3/4 shrink-0 overflow-hidden">
        {product.why && (
          <span className="bg-foreground/90 text-background rounded-badge text-micro absolute top-2 left-2 z-10 max-w-[90%] truncate px-1.5 py-0.5 font-medium tracking-widest uppercase">
            {product.why}
          </span>
        )}
        <Image
          src={productData.image}
          alt={productData.name}
          fill
          sizes="160px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div
          aria-hidden
          className="bg-foreground pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-15"
        />
        <div className="pointer-events-none absolute right-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
          <AddToCartButton
            onAdd={() => {
              addToCart(productData)
            }}
            compact
            className="bg-foreground/90 text-background hover:bg-foreground border-background/20 h-9 w-9 border shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col text-center">
        {productData.brand ? (
          <p className="text-muted-foreground truncate text-xs tracking-widest uppercase">
            {productData.brand}
          </p>
        ) : (
          <div className="h-4" aria-hidden="true" />
        )}
        <h3 className="text-foreground font-secondary mt-1 line-clamp-1 text-xs">
          {productData.name}
        </h3>
        {productData.price !== undefined && (
          <p className="text-foreground mt-auto pt-2 text-xs">
            ${productData.price}
          </p>
        )}
      </div>
    </Link>
  )
}
