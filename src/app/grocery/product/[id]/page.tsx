'use client'

import { Leaf } from 'lucide-react'

import { getDietaryTags } from '@/app/grocery/_utils/getDietaryTags'
import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { groceryConfig } from '@/app/grocery/config'
import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import {
  GroceryRelatedRecipes,
  ProductActions,
} from '@/app/grocery/product/[id]/_components'
import type { GroceryHitTemplate } from '@/app/grocery/types'
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
  product: GroceryProductHitValues
  productTemplate: GroceryHitTemplate | undefined
}) => {
  const { slug } = groceryConfig
  const isSuggestionsActive = useIsChatWidgetSuggestionsActive()
  const galleryImages = product.image ? [product.image] : []
  const dietaryTags = getDietaryTags(product)

  return (
    <div className="container mx-auto px-6 py-8">
      <BackToResults fallbackHref={`/${slug}/search`} />
      <ProductBreadcrumb
        slug={slug}
        searchLabel="Groceries"
        productName={product.name}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,460px)_1fr]">
        <div className="space-y-10 lg:self-start">
          <ProductImageGallery
            images={galleryImages}
            productName={product.name}
          />
          <GroceryRelatedRecipes product={product} />
        </div>

        <div className="space-y-5">
          <ProductInfo
            name={product.name}
            brand={product.brand}
            rating={product.rating}
            reviewCount={product.ratingsCount}
            price={product.price}
            weight={product.weight}>
            {(product.storeBrand || dietaryTags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {product.storeBrand && (
                  <span className="bg-accent/10 text-accent rounded-badge inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium">
                    <Leaf className="h-3 w-3" />
                    Spencer &amp; Williams
                  </span>
                )}
                {dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground rounded-badge px-2.5 py-1 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
            extractor={getGroceryProductHitValues}
          />
        )}
      />
    </div>
  )
}

const ProductPage = () => (
  <ProductPageShell
    config={groceryConfig}
    extractor={getGroceryProductHitValues}>
    {(product, productTemplate) => (
      <ProductContent product={product} productTemplate={productTemplate} />
    )}
  </ProductPageShell>
)

export default ProductPage
