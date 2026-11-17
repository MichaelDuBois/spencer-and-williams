'use client'

import { getElectronicsSpecs } from '@/app/electronics/_utils/getElectronicsSpecs'
import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'
import { ElectronicsTechnicalSpecs } from '@/app/electronics/product/[id]/_components/ElectronicsTechnicalSpecs'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { StoreAvailabilityLine } from '@/components/storeLocator/StoreAvailabilityLine'
import { AccordionItem } from '@/components/ui/AccordionItem'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useAddToCart } from '@/hooks/useAddToCart'

interface ProductActionsProps {
  product: ElectronicsProductHitValues
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const { quantity, setQuantity, addToCart } = useAddToCart({ surface: 'pdp' })

  const handleAddToCart = () => addToCart(product)

  const hasSpecs = getElectronicsSpecs(product).length > 0

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
          <AccordionItem title="Technical Specifications">
            <ElectronicsTechnicalSpecs product={product} />
          </AccordionItem>
        )}
      </div>
    </>
  )
}
