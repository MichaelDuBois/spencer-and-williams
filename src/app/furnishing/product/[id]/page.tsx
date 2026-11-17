'use client'

import { getFurnishingBreadcrumbCategories } from '@/app/furnishing/_utils/getFurnishingBreadcrumbCategories'
import { getFurnishingProductHitValues } from '@/app/furnishing/_utils/getFurnishingProductHitValues'
import { furnishingConfig } from '@/app/furnishing/config'
import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import {
  FurnishingStyleBadges,
  ProductActions,
} from '@/app/furnishing/product/[id]/_components'
import type { FurnishingHitTemplate } from '@/app/furnishing/types'
import { BackToResults } from '@/components/BackToResults'
import { Hit } from '@/components/hit/Hit'
import { ProductPageShell } from '@/components/pdp/ProductPageShell'
import { ProductBreadcrumb } from '@/components/product/ProductBreadcrumb'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ProductRecommend } from '@/components/recommend/ProductRecommend'
import { ProductAIQuestions } from '@/features/aiAssistant/components/ProductAIQuestions'
import { ProductPromptSuggestions } from '@/features/chatWidget/components/ProductPromptSuggestions'
import { useIsChatWidgetSuggestionsActive } from '@/features/chatWidget/hooks/useIsChatWidgetSuggestionsActive'

const ProductContent = ({
  product,
  productTemplate,
}: {
  product: FurnishingProductHitValues
  productTemplate: FurnishingHitTemplate | undefined
}) => {
  const { slug } = furnishingConfig
  const isSuggestionsActive = useIsChatWidgetSuggestionsActive()
  const galleryImages = product.image ? [product.image] : []
  const breadcrumbCategories = getFurnishingBreadcrumbCategories(
    product.hierarchicalCategories,
    furnishingConfig,
  )

  return (
    <div className="container mx-auto px-6 py-8">
      <BackToResults fallbackHref={`/${slug}/search`} />
      <ProductBreadcrumb
        slug={slug}
        searchLabel="Furniture"
        categories={breadcrumbCategories}
        productName={product.name}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductImageGallery
          images={galleryImages}
          productName={product.name}
        />

        <div className="space-y-5">
          <ProductInfo
            name={product.name}
            brand={product.brand}
            rating={product.rating}
            reviewCount={product.ratingsCount}
            price={product.price}>
            <FurnishingStyleBadges product={product} />
          </ProductInfo>
          <ProductActions product={product} />
          {isSuggestionsActive ? (
            <ProductPromptSuggestions
              objectID={product.objectID}
              productName={product.name}
              brand={product.brand}
              category={product.category}
            />
          ) : (
            <ProductAIQuestions
              productName={product.name}
              basePath={`/${slug}`}
              productData={product}
            />
          )}
        </div>
      </div>

      <ProductRecommend
        objectID={product.objectID}
        className="mt-16 space-y-16"
        renderItem={(hit) => (
          <Hit
            variant="standard"
            item={hit}
            template={productTemplate}
            slug={slug}
            extractor={getFurnishingProductHitValues}
          />
        )}
      />
    </div>
  )
}

const ProductPage = () => (
  <ProductPageShell
    config={furnishingConfig}
    extractor={getFurnishingProductHitValues}>
    {(product, productTemplate) => (
      <ProductContent product={product} productTemplate={productTemplate} />
    )}
  </ProductPageShell>
)

export default ProductPage
