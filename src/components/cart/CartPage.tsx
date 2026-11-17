'use client'

import { CartPageContent } from '@/components/cart/CartPageContent'
import { Hit } from '@/components/hit/Hit'
import type { HitProductValues } from '@/components/hit/hit.types'
import { useCart } from '@/hooks/useCart'
import type { RecommendOptions } from '@/hooks/useRecommend'
import type { HitExtractor, HitTemplate } from '@/types/hitTemplate.types'
import type { ProductPriceProps } from '@/types/productPricing.types'
import type { VerticalConfig } from '@/types/verticalConfig.types'

import type { ComponentType } from 'react'

interface CartPageProps<
  TValues extends HitProductValues,
  TTemplate extends HitTemplate<{ name: string }>,
> {
  config: VerticalConfig<TTemplate>
  priceComponent?: ComponentType<ProductPriceProps>
  recommendQueryOptions?: RecommendOptions
  extractor: HitExtractor<TValues, TTemplate>
}

export const CartPage = <
  TValues extends HitProductValues,
  TTemplate extends HitTemplate<{ name: string }>,
>({
  config,
  priceComponent,
  recommendQueryOptions,
  extractor,
}: CartPageProps<TValues, TTemplate>) => {
  const { totalItems } = useCart()
  const productTemplate = config.algolia.primaryIndex.template
  const slug = config.slug
  const basePath = `/${slug}`

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        Shopping Cart {totalItems > 0 && `(${totalItems})`}
      </h1>

      <CartPageContent
        recommendQueryOptions={recommendQueryOptions}
        variant="standard"
        basePath={basePath}
        recommendRenderItem={(hit) => (
          <Hit
            priceComponent={priceComponent}
            variant="standard"
            item={hit}
            template={productTemplate}
            slug={slug}
            extractor={extractor}
          />
        )}
      />
    </div>
  )
}
