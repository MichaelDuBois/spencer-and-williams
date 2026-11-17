'use client'

import { B2BHit } from '@/app/b2b-warehouse/_components/B2BHit'
import { B2BProductPrice } from '@/app/b2b-warehouse/_components/B2BProductPrice'
import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import { ProductActions } from '@/app/b2b-warehouse/product/[id]/_components'
import type { B2BWarehouseHitTemplate } from '@/app/b2b-warehouse/types'
import { BackToResults } from '@/components/BackToResults'
import { ProductPageShell } from '@/components/pdp/ProductPageShell'
import { ProductBreadcrumb } from '@/components/product/ProductBreadcrumb'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { SkuLabel } from '@/components/product/SkuLabel'
import { ProductRecommend } from '@/components/recommend/ProductRecommend'
import { ProductAIQuestions } from '@/features/aiAssistant/components/ProductAIQuestions'
import { ProductPromptSuggestions } from '@/features/chatWidget/components/ProductPromptSuggestions'
import { useIsChatWidgetSuggestionsActive } from '@/features/chatWidget/hooks/useIsChatWidgetSuggestionsActive'

const ProductContent = ({
  product,
  productTemplate,
}: {
  product: B2BWarehouseProductHitValues
  productTemplate: B2BWarehouseHitTemplate | undefined
}) => {
  const queryOptions = useB2BProductHitOptions()
  const { slug } = b2bWarehouseConfig
  const isSuggestionsActive = useIsChatWidgetSuggestionsActive()
  const galleryImages = product.image ? [product.image] : []

  return (
    <div className="container mx-auto px-6 py-8">
      <BackToResults fallbackHref={`/${slug}/search`} />
      <ProductBreadcrumb
        slug={slug}
        searchLabel="B2B Warehouse"
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
            reviewCount={product.reviewsCount}
            price={product.price}
            priceContent={
              <B2BProductPrice
                price={product.price}
                className="text-foreground text-2xl font-bold"
                unavailableLabel="Price unavailable"
              />
            }>
            {product.sku && <SkuLabel>{product.sku}</SkuLabel>}
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
        queryOptions={queryOptions}
        objectID={product.objectID}
        className="mt-16 space-y-16"
        renderItem={(hit) => (
          <B2BHit
            variant="b2b-warehouse"
            item={hit}
            template={productTemplate}
            slug={slug}
            extractor={getB2BWarehouseProductHitValues}
          />
        )}
      />
    </div>
  )
}

const ProductPage = () => {
  const queryOptions = useB2BProductHitOptions()
  return (
    <ProductPageShell
      queryOptions={queryOptions}
      config={b2bWarehouseConfig}
      extractor={getB2BWarehouseProductHitValues}>
      {(product, productTemplate) => (
        <ProductContent product={product} productTemplate={productTemplate} />
      )}
    </ProductPageShell>
  )
}

export default ProductPage
