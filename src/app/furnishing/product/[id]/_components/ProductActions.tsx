'use client'

import { getFurnishingSpecs } from '@/app/furnishing/_utils/getFurnishingSpecs'
import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import { FurnishingSpecs } from '@/app/furnishing/product/[id]/_components/FurnishingSpecs'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { StoreAvailabilityLine } from '@/components/storeLocator/StoreAvailabilityLine'
import { AccordionItem } from '@/components/ui/AccordionItem'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useAddToCart } from '@/hooks/useAddToCart'

interface ProductActionsProps {
  product: FurnishingProductHitValues
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const { quantity, setQuantity, addToCart } = useAddToCart({ surface: 'pdp' })

  const handleAddToCart = () => addToCart(product)

  const hasSpecs = getFurnishingSpecs(product).length > 0

  return (
    <>
      <div className="flex items-center gap-3">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <div className="flex-1">
          <AddToCartButton onAdd={handleAddToCart} />
        </div>
      </div>

      <StoreAvailabilityLine
        productId={product.objectID}
        availableInStores={product.availableInStores}
        className="mt-4"
      />

      <div className="border-border mt-2 border-t">
        {product.description && (
          <AccordionItem title="Description" defaultOpen>
            <p>{product.description}</p>
          </AccordionItem>
        )}
        {hasSpecs && (
          <AccordionItem title="Specifications">
            <FurnishingSpecs product={product} />
          </AccordionItem>
        )}
      </div>
    </>
  )
}
