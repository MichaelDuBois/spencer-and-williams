'use client'

import { EcommerceHeroBanner } from '@/app/ecommerce/_components/EcommerceHeroBanner'
import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { ecommerceConfig } from '@/app/ecommerce/config'
import { Hit } from '@/components/hit/Hit'
import { CategoryGrid } from '@/components/homepage/CategoryGrid'
import { CollectionBanners } from '@/components/homepage/CollectionBanners'
import { HomepageCarousels } from '@/components/homepage/HomepageCarousels'

const HomePage = () => {
  const productTemplate = ecommerceConfig.algolia.primaryIndex.template

  return (
    <>
      <EcommerceHeroBanner />
      <div className="container mx-auto px-6">
        <HomepageCarousels
          className="mb-16 space-y-16"
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
        <CategoryGrid />
      </div>
      <CollectionBanners />
    </>
  )
}

export default HomePage
