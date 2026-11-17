'use client'

import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import { GroceryNutritionFacts } from '@/app/grocery/product/[id]/_components/GroceryNutritionFacts'
import { GroceryPickupAvailability } from '@/app/grocery/product/[id]/_components/GroceryPickupAvailability'
import { GroceryProductDetails } from '@/app/grocery/product/[id]/_components/GroceryProductDetails'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { AccordionItem } from '@/components/ui/AccordionItem'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useAddToCart } from '@/hooks/useAddToCart'

interface ProductActionsProps {
  product: GroceryProductHitValues
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

      <GroceryPickupAvailability product={product} />

      <div className="border-border mt-2 border-t">
        {product.description && (
          <AccordionItem title="Description" defaultOpen>
            <p>{product.description}</p>
          </AccordionItem>
        )}
        {product.nutrition && Object.keys(product.nutrition).length > 0 && (
          <AccordionItem title="Nutrition Facts">
            <GroceryNutritionFacts nutrition={product.nutrition} />
          </AccordionItem>
        )}
        {product.semanticAttributes &&
          Object.keys(product.semanticAttributes).length > 0 && (
            <AccordionItem title="Product Details">
              <GroceryProductDetails attributes={product.semanticAttributes} />
            </AccordionItem>
          )}
      </div>
    </>
  )
}
