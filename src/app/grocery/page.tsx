'use client'

import { GroceryCollectionBanners } from '@/app/grocery/_components/GroceryCollectionBanners'
import { GroceryHeroBanner } from '@/app/grocery/_components/GroceryHeroBanner'
import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { groceryConfig } from '@/app/grocery/config'
import { Hit } from '@/components/hit/Hit'
import { HomepageCarousels } from '@/components/homepage/HomepageCarousels'
import { ProductRecommend } from '@/components/recommend/ProductRecommend'

const HomePage = () => {
  const productTemplate = groceryConfig.algolia.primaryIndex.template

  return (
    <>
      <GroceryHeroBanner />
      <div className="container mx-auto space-y-12 px-6 pt-10">
        <HomepageCarousels
          variant="grocery"
          renderItem={(hit) => (
            <Hit
              variant="grocery"
              item={hit}
              template={productTemplate}
              slug="grocery"
              extractor={getGroceryProductHitValues}
            />
          )}
        />
        <ProductRecommend
          section="homepage"
          className="space-y-12"
          variant="grocery"
          renderItem={(hit) => (
            <Hit
              variant="grocery"
              item={hit}
              template={productTemplate}
              slug="grocery"
              extractor={getGroceryProductHitValues}
            />
          )}
        />
      </div>
      <GroceryCollectionBanners />
    </>
  )
}

export default HomePage
