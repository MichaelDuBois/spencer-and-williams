'use client'

import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'
import { Hit } from '@/components/hit/Hit'

const SKELETON_COUNT = 5

// Five columns inside a max-w-5xl container settle at ~180px each.
const IMAGE_SIZES = '(min-width: 1024px) 180px, (min-width: 640px) 30vw, 45vw'

const LoadingSkeleton = () => (
  <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
    {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
      <div key={index} className="space-y-4">
        <div className="bg-muted rounded-image aspect-3/4 w-full animate-pulse" />
        <div className="bg-muted mx-auto h-3 w-1/2 animate-pulse" />
        <div className="bg-muted mx-auto h-3 w-3/4 animate-pulse" />
      </div>
    ))}
  </div>
)

interface FashionArticleProductsProps {
  products: Record<string, unknown>[]
  isLoading: boolean
}

export const FashionArticleProducts = ({
  products,
  isLoading,
}: FashionArticleProductsProps) => {
  const { slug, algolia } = fashionConfig
  const productTemplate = algolia.primaryIndex.template

  if (!isLoading && products.length === 0) return null

  return (
    <section className="border-border mt-20 border-t pt-16">
      <div className="text-center">
        <h2 className="font-secondary text-2xl tracking-[0.15em] uppercase">
          Shop the Story
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-md text-sm leading-relaxed">
          The pieces featured in this edit, ready to shop.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <Hit
              key={product.objectID as string}
              variant="editorial"
              item={product}
              template={productTemplate}
              slug={slug}
              extractor={getFashionProductHitValues}
              disableHighlight
              imageSizes={IMAGE_SIZES}
            />
          ))}
        </div>
      )}
    </section>
  )
}
