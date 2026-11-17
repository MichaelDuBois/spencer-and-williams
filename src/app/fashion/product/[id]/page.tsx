'use client'

import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'
import type { FashionProductHitValues } from '@/app/fashion/hitValues.types'
import {
  FashionProductArticles,
  ProductActions,
  ProductInfo,
} from '@/app/fashion/product/[id]/_components'
import type { FashionHitTemplate } from '@/app/fashion/types'
import { BackToResults } from '@/components/BackToResults'
import { Hit } from '@/components/hit/Hit'
import { ProductPageShell } from '@/components/pdp/ProductPageShell'
import { ProductBreadcrumb } from '@/components/product/ProductBreadcrumb'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { ProductRecommend } from '@/components/recommend/ProductRecommend'
import { ProductAIQuestions } from '@/features/aiAssistant/components/ProductAIQuestions'
import { ProductPromptSuggestions } from '@/features/chatWidget/components/ProductPromptSuggestions'
import { useIsChatWidgetSuggestionsActive } from '@/features/chatWidget/hooks/useIsChatWidgetSuggestionsActive'

const ProductContent = ({
  product,
  productTemplate,
}: {
  product: FashionProductHitValues
  productTemplate: FashionHitTemplate | undefined
}) => {
  const { slug } = fashionConfig
  const isSuggestionsActive = useIsChatWidgetSuggestionsActive()

  return (
    <div className="container mx-auto px-4 py-12">
      <BackToResults
        fallbackHref={`/${slug}/search`}
        label="Back to collection"
      />
      <ProductBreadcrumb
        slug={slug}
        searchLabel="Collection"
        productName={product.name}
        variant="editorial"
      />

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        <ProductImageGallery
          variant="editorial"
          images={
            product.images && product.images.length > 0
              ? product.images
              : product.image
                ? [product.image]
                : []
          }
          productName={product.name}
        />

        <div className="lg:py-8">
          <ProductInfo product={product} />
          <ProductActions product={product} />
          {isSuggestionsActive ? (
            <ProductPromptSuggestions
              objectID={product.objectID}
              productName={product.name}
              brand={product.brand}
            />
          ) : (
            <ProductAIQuestions
              productName={product.name}
              basePath={`/${slug}`}
              productData={{ brand: product.brand }}
            />
          )}
        </div>
      </div>

      <ProductRecommend
        objectID={product.objectID}
        variant="editorial"
        className="mt-16 space-y-16"
        renderItem={(hit) => (
          <Hit
            variant="editorial"
            item={hit}
            template={productTemplate}
            slug="fashion"
            extractor={getFashionProductHitValues}
          />
        )}
      />

      <FashionProductArticles objectID={product.objectID} />
    </div>
  )
}

const ProductPage = () => (
  <ProductPageShell
    config={fashionConfig}
    extractor={getFashionProductHitValues}
    notFoundBackLabel="Back to collection">
    {(product, productTemplate) => (
      <ProductContent product={product} productTemplate={productTemplate} />
    )}
  </ProductPageShell>
)

export default ProductPage
