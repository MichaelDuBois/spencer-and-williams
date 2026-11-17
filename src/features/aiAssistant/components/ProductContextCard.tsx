'use client'

import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { useAssistantCatalog } from '@/features/aiAssistant/AssistantCatalogContext'
import { AIContextCardLayout } from '@/features/aiAssistant/components/AIContextCardLayout'
import { useProductContext } from '@/features/aiAssistant/hooks/useProductContext'
import { useAddToCart } from '@/hooks/useAddToCart'

export const ProductContextCard = () => {
  const catalog = useAssistantCatalog()
  const PriceComponent = catalog?.priceComponent
  const productContext = useProductContext()
  const { addToCart } = useAddToCart({
    surface: 'assistant_context',
    prepareProduct: catalog?.prepareCartProduct,
  })

  if (!productContext) return null

  const { name, brand, image } = productContext

  return (
    <AIContextCardLayout
      label="Viewing this product:"
      image={image}
      imageAlt={name}
      action={
        <AddToCartButton
          compact
          onAdd={() => {
            if (catalog?.signal?.aborted)
              throw new Error('Your selection changed. Please try again.')
            return addToCart(productContext)
          }}
          className="h-6 w-6 [&_svg]:h-3 [&_svg]:w-3"
        />
      }>
      {brand && (
        <p className="text-muted-foreground text-micro truncate tracking-wide uppercase">
          {brand}
        </p>
      )}
      {PriceComponent && (
        <PriceComponent
          price={productContext.price}
          className="text-xs font-semibold"
        />
      )}
      <p className="truncate text-xs leading-tight font-medium">{name}</p>
    </AIContextCardLayout>
  )
}
