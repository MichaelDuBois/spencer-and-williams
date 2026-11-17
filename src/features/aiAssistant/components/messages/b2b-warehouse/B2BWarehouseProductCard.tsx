'use client'

import { Star } from 'lucide-react'
import Link from 'next/link'

import { B2BProductPrice } from '@/app/b2b-warehouse/_components/B2BProductPrice'
import { useB2BPrepareCartProduct } from '@/app/b2b-warehouse/_hooks/useB2BPrepareCartProduct'
import { getB2BWarehouseSpecs } from '@/app/b2b-warehouse/_utils/getB2BWarehouseSpecs'
import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import { Image } from '@/components/image/Image'
import { SkuLabel } from '@/components/product/SkuLabel'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useAssistantCatalog } from '@/features/aiAssistant/AssistantCatalogContext'
import { ProductCardSkeleton } from '@/features/aiAssistant/components/messages/ProductCardSkeleton'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type { DisplayProduct } from '@/features/aiAssistant/types'
import { useAddToCart } from '@/hooks/useAddToCart'

interface B2BWarehouseProductCardProps {
  product: DisplayProduct
  directData?: B2BWarehouseProductHitValues
}

const MAX_SPECS = 2

export const B2BWarehouseProductCard = ({
  product,
  directData,
}: B2BWarehouseProductCardProps) => {
  const catalog = useAssistantCatalog()
  const productData = useCardData(directData, [
    ...(catalog?.productCacheKey ?? ['b2b-assistant-unavailable']),
    product.objectID,
  ])
  const { addToCart } = useAddToCart({
    surface: 'assistant',
    prepareProduct: useB2BPrepareCartProduct(catalog?.signal),
  })
  const handleLinkClick = useAssistantLinkClick(product.objectID, product)

  if (
    directData === undefined &&
    (!catalog?.isReady || catalog.signal?.aborted)
  )
    return <ProductCardSkeleton />

  if (!productData) return <ProductCardSkeleton />

  if (catalog?.signal?.aborted) return <ProductCardSkeleton />

  const specs = getB2BWarehouseSpecs(productData).slice(0, MAX_SPECS)

  return (
    <Link
      href={`/b2b-warehouse/product/${encodeURIComponent(product.objectID)}`}
      onClick={handleLinkClick}
      className="border-border group flex w-40 shrink-0 flex-col self-stretch overflow-hidden rounded-lg border transition-shadow duration-200 hover:shadow-lg">
      {/* Image with badge - Hit card style with white bg */}
      <div className="bg-card relative h-40 w-full shrink-0 p-4">
        {product.why && (
          <span className="bg-primary/90 text-primary-foreground text-micro absolute top-1.5 left-1.5 z-10 max-w-[90%] truncate rounded px-1.5 py-0.5 font-medium uppercase">
            {product.why}
          </span>
        )}
        <div className="relative h-full w-full">
          <Image
            src={productData.image}
            alt={productData.name}
            fill
            sizes="128px"
            className="object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Product info */}
      <div className="bg-muted flex flex-1 flex-col space-y-1 p-3">
        {productData.brand ? (
          <p className="text-muted-foreground text-micro truncate font-medium tracking-wide uppercase">
            {productData.brand}
          </p>
        ) : (
          <div className="h-3.5" aria-hidden="true" />
        )}
        <p className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">
          {productData.name}
        </p>
        {productData.sku && <SkuLabel>{productData.sku}</SkuLabel>}
        {productData.rating !== undefined && (
          <div className="text-muted-foreground text-micro flex items-center gap-1">
            <Star className="h-3 w-3 fill-current text-amber-500" />
            <span className="text-foreground font-medium">
              {productData.rating.toFixed(1)}
            </span>
            {productData.reviewsCount !== undefined && (
              <span>({productData.reviewsCount})</span>
            )}
          </div>
        )}
        {specs.length > 0 && (
          <ul className="text-micro mt-1 mb-1 space-y-0.5 pt-1.5">
            {specs.map((spec) => (
              <li
                key={spec.label}
                className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground truncate">
                  {spec.label}
                </span>
                <span className="text-foreground truncate font-medium">
                  {spec.value}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          {productData.price !== undefined ? (
            <B2BProductPrice
              price={productData.price}
              className="text-foreground text-sm font-bold"
            />
          ) : (
            <span aria-hidden="true" />
          )}
          <AddToCartButton
            compact
            onAdd={() => {
              if (catalog?.signal?.aborted)
                throw new Error('Your selection changed. Please try again.')
              return addToCart(productData)
            }}
            className="h-6 w-6 [&_svg]:h-3 [&_svg]:w-3"
          />
        </div>
      </div>
    </Link>
  )
}
