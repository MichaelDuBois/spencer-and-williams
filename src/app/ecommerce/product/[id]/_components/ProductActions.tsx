'use client'

import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { StoreAvailabilityLine } from '@/components/storeLocator/StoreAvailabilityLine'
import { AccordionItem } from '@/components/ui/AccordionItem'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useAddToCart } from '@/hooks/useAddToCart'

const DEFAULT_DESCRIPTION =
  'Premium quality product built for performance and durability. Features innovative design and materials for maximum comfort and style.'

interface ProductActionsProps {
  product: EcommerceProductHitValues
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const { quantity, setQuantity, addToCart } = useAddToCart({ surface: 'pdp' })

  const handleAddToCart = () => addToCart(product)

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
        linkClassName="text-xs tracking-widest uppercase"
      />

      <div className="border-border mt-6 border-t">
        <AccordionItem title="Description" defaultOpen>
          <p>{product.description ?? DEFAULT_DESCRIPTION}</p>
        </AccordionItem>
        <AccordionItem title="Shipping & Returns">
          <p>
            Free standard shipping on orders over $50. Express shipping
            available at checkout. 30-day free returns on all orders.
          </p>
        </AccordionItem>
      </div>
    </>
  )
}
