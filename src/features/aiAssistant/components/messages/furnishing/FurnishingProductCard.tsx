'use client'

import { Home, Layers, Ruler } from 'lucide-react'
import Link from 'next/link'

import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import { Image } from '@/components/image/Image'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { ProductCardSkeleton } from '@/features/aiAssistant/components/messages/ProductCardSkeleton'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type { DisplayProduct } from '@/features/aiAssistant/types'
import { useAddToCart } from '@/hooks/useAddToCart'

interface FurnishingProductCardProps {
  product: DisplayProduct
  directData?: FurnishingProductHitValues
}

export const FurnishingProductCard = ({
  product,
  directData,
}: FurnishingProductCardProps) => {
  const productData = useCardData(directData, ['product', product.objectID])
  const { addToCart } = useAddToCart({ surface: 'assistant' })
  const handleLinkClick = useAssistantLinkClick(product.objectID, product)

  if (!productData) return <ProductCardSkeleton />

  const keySpecs = [
    { id: 'dimensions', icon: Ruler, value: productData.dimensions },
    {
      id: 'material',
      icon: Layers,
      value:
        productData.material ??
        productData.frameMaterial ??
        productData.upholsteryFabric,
    },
    { id: 'room', icon: Home, value: productData.roomType },
  ].filter((spec) => Boolean(spec.value))

  return (
    <Link
      href={`/furnishing/product/${encodeURIComponent(product.objectID)}`}
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
      <div className="bg-muted flex flex-1 flex-col space-y-0.5 p-3">
        {productData.brand ? (
          <p className="text-muted-foreground text-micro truncate font-medium tracking-wide uppercase">
            {productData.brand}
          </p>
        ) : (
          <div className="h-3.5" aria-hidden="true" />
        )}
        <p className="text-foreground line-clamp-1 text-sm font-semibold">
          {productData.name}
        </p>
        {keySpecs.length > 0 && (
          <ul className="text-muted-foreground text-micro space-y-0.5 pt-1">
            {keySpecs.map(({ id, icon: Icon, value }) => (
              <li key={id} className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{value}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Footer pinned to the bottom so price + cart align across all cards */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-foreground text-sm font-bold">
            {productData.price !== undefined ? `$${productData.price}` : ''}
          </p>
          <AddToCartButton
            compact
            onAdd={() => {
              addToCart(productData)
            }}
            className="h-6 w-6 shrink-0 [&_svg]:h-3 [&_svg]:w-3"
          />
        </div>
      </div>
    </Link>
  )
}
