'use client'

import { useB2BPrepareCartProduct } from '@/app/b2b-warehouse/_hooks/useB2BPrepareCartProduct'
import { getB2BWarehouseSpecs } from '@/app/b2b-warehouse/_utils/getB2BWarehouseSpecs'
import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import { B2BWarehouseSpecsTable } from '@/app/b2b-warehouse/product/[id]/_components/B2BWarehouseSpecsTable'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { StoreAvailabilityLine } from '@/components/storeLocator/StoreAvailabilityLine'
import { AccordionItem } from '@/components/ui/AccordionItem'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useAddToCart } from '@/hooks/useAddToCart'

interface ProductActionsProps {
  product: B2BWarehouseProductHitValues
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const { quantity, setQuantity, addToCart } = useAddToCart({
    surface: 'pdp',
    prepareProduct: useB2BPrepareCartProduct(),
  })

  const handleAddToCart = () => addToCart(product)

  const specs = getB2BWarehouseSpecs(product)

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
        {specs.length > 0 && (
          <AccordionItem title="Specifications" defaultOpen>
            <B2BWarehouseSpecsTable rows={specs} />
          </AccordionItem>
        )}
      </div>
    </>
  )
}
