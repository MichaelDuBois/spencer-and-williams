'use client'

import { useState, type ReactNode } from 'react'

import type {
  FashionProductHitValues,
  FashionProductInfo,
} from '@/app/fashion/hitValues.types'
import { ColorSelector } from '@/components/product/ColorSelector'
import { SizeSelector } from '@/components/product/SizeSelector'
import { StoreAvailabilityLine } from '@/components/storeLocator/StoreAvailabilityLine'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { Button } from '@/components/ui/button/Button'
import { useAddToCart } from '@/hooks/useAddToCart'

interface ProductActionsProps {
  product: FashionProductHitValues
}

const detailRows: Array<{
  label: string
  key: keyof Pick<
    FashionProductInfo,
    'composition' | 'fit' | 'season' | 'country_of_origin'
  >
}> = [
  { label: 'Composition', key: 'composition' },
  { label: 'Fit', key: 'fit' },
  { label: 'Season', key: 'season' },
  { label: 'Country of Origin', key: 'country_of_origin' },
]

export const ProductActions = ({ product }: ProductActionsProps) => {
  const { brand, sizes, colorVariants, objectID, productInfo } = product
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useAddToCart({ surface: 'pdp' })

  const handleAddToBag = () => addToCart(product)

  const features = productInfo?.features ?? []
  const careInstructions = productInfo?.care_instructions ?? []

  const accordionSections: { title: string; content: ReactNode }[] = [
    {
      title: 'Details',
      content: (
        <ul className="space-y-1">
          {brand && (
            <li>
              <span className="text-foreground">Brand:</span> {brand}
            </li>
          )}
          {detailRows.map(({ label, key }) => {
            const value = productInfo?.[key]
            if (!value) return null
            return (
              <li key={key}>
                <span className="text-foreground">{label}:</span> {value}
              </li>
            )
          })}
        </ul>
      ),
    },
  ]

  if (features.length > 0) {
    accordionSections.push({
      title: 'Features',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          {features.map((feature, index) => (
            <li key={`${feature}-${index}`}>{feature}</li>
          ))}
        </ul>
      ),
    })
  }

  if (careInstructions.length > 0) {
    accordionSections.push({
      title: 'Care',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          {careInstructions.map((instruction, index) => (
            <li key={`${instruction}-${index}`}>{instruction}</li>
          ))}
        </ul>
      ),
    })
  }

  accordionSections.push({
    title: 'Shipping',
    content: (
      <p>
        Complimentary express shipping on all orders. Delivered within 3 - 5
        business days. Free returns within 30 days of receipt.
      </p>
    ),
  })

  return (
    <>
      {sizes && sizes.length > 0 && (
        <div className="mt-10">
          <SizeSelector
            sizes={sizes}
            variant="editorial"
            headerAction={
              <Button variant="link" className="h-auto p-0 text-xs">
                Size Guide
              </Button>
            }
          />
        </div>
      )}

      {colorVariants && colorVariants.length > 0 && (
        <div className="mt-10">
          <ColorSelector colors={colorVariants} selectedObjectID={objectID} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 flex gap-4">
        <AddToCartButton
          onAdd={handleAddToBag}
          animated={false}
          showIcon={false}
          label="Add to Bag"
          addedLabel="Added to Bag"
          className="flex-1 py-4 text-xs tracking-widest uppercase"
        />
        <Button
          variant="outline"
          className="rounded-none px-6 py-4"
          onClick={() => setIsWishlisted(!isWishlisted)}>
          {isWishlisted ? '♥' : '♡'}
        </Button>
      </div>

      <StoreAvailabilityLine
        productId={objectID}
        availableInStores={product.availableInStores}
        className="mt-6"
        linkClassName="text-xs tracking-widest uppercase"
      />

      {/* Details Accordion */}
      <div className="border-border/30 mt-16 space-y-0 border-t">
        {accordionSections.map(({ title, content }) => (
          <details key={title} className="group border-border/30 border-b">
            <summary className="flex cursor-pointer items-center justify-between py-6 text-xs tracking-widest uppercase">
              {title}
              <span className="transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="text-muted-foreground pb-6 text-sm leading-relaxed">
              {content}
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
