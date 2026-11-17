'use client'

import { B2BHit } from '@/app/b2b-warehouse/_components/B2BHit'
import { B2BWarehouseHeroBanner } from '@/app/b2b-warehouse/_components/B2BWarehouseHeroBanner'
import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { CategoryGrid } from '@/components/homepage/CategoryGrid'
import { CollectionBanners } from '@/components/homepage/CollectionBanners'
import { HomepageCarousels } from '@/components/homepage/HomepageCarousels'
import { ProductRecommend } from '@/components/recommend/ProductRecommend'

const HomePage = () => {
  const queryOptions = useB2BProductHitOptions()
  const productTemplate = b2bWarehouseConfig.algolia.primaryIndex.template

  return (
    <>
      <B2BWarehouseHeroBanner />
      <div className="container mx-auto space-y-16 px-6 pt-12">
        <HomepageCarousels
          queryOptions={queryOptions}
          className="space-y-16"
          renderItem={(hit) => (
            <B2BHit
              variant="b2b-warehouse"
              item={hit}
              template={productTemplate}
              slug="b2b-warehouse"
              extractor={getB2BWarehouseProductHitValues}
            />
          )}
        />
        <ProductRecommend
          queryOptions={queryOptions}
          section="homepage"
          className="space-y-16"
          renderItem={(hit) => (
            <B2BHit
              variant="b2b-warehouse"
              item={hit}
              template={productTemplate}
              slug="b2b-warehouse"
              extractor={getB2BWarehouseProductHitValues}
            />
          )}
        />
        <CategoryGrid queryOptions={queryOptions} label="Shop by Category" />
      </div>
      <CollectionBanners queryOptions={queryOptions} />
    </>
  )
}

export default HomePage
