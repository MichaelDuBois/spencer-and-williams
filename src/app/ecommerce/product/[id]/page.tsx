'use client'

import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { ecommerceConfig } from '@/app/ecommerce/config'
import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import { ProductActions } from '@/app/ecommerce/product/[id]/_components/ProductActions'
import type { EcommerceHitTemplate } from '@/app/ecommerce/types'
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
  product: EcommerceProductHitValues
  productTemplate: EcommerceHitTemplate | undefined
}) => {
  const { slug } = ecommerceConfig
  const isSuggestionsActive = useIsChatWidgetSuggestionsActive()
  const galleryImages = product.image ? [product.image] : []

  return (
    <div className="container mx-auto px-6 py-8">
      <BackToResults fallbackHref={`/${slug}/search`} />
      <ProductBreadcrumb
        slug={slug}
        searchLabel="Products"
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
            rating={4.8}
            reviewCount={342}
            price={product.price}
          />
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
            slug="ecommerce"
            extractor={getEcommerceProductHitValues}
          />
        )}
      />
    </div>
  )
}

const ProductPage = () => (
  <ProductPageShell
    config={ecommerceConfig}
    extractor={getEcommerceProductHitValues}>
    {(product, productTemplate) => (
      <ProductContent product={product} productTemplate={productTemplate} />
    )}
  </ProductPageShell>
)

export default ProductPage
