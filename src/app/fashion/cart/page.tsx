'use client'

import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'
import { CartPageContent } from '@/components/cart/CartPageContent'
import { Hit } from '@/components/hit/Hit'
import { useCart } from '@/hooks/useCart'

const CartPage = () => {
  const { totalItems } = useCart()
  const productTemplate = fashionConfig.algolia.primaryIndex.template
  const slug = fashionConfig.slug
  const basePath = `/${slug}`

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="font-secondary mb-12 text-center text-3xl tracking-[0.15em] uppercase">
        Shopping Bag
        {totalItems > 0 && (
          <span className="text-muted-foreground ml-3 text-xs tracking-widest">
            ({totalItems})
          </span>
        )}
      </h1>

      <div className="mx-auto max-w-4xl">
        <CartPageContent
          variant="editorial"
          basePath={basePath}
          recommendVariant="editorial"
          recommendRenderItem={(hit) => (
            <Hit
              variant="editorial"
              item={hit}
              template={productTemplate}
              slug={slug}
              extractor={getFashionProductHitValues}
            />
          )}
        />
      </div>
    </div>
  )
}

export default CartPage
