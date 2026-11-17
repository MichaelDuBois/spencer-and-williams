'use client'

import { FurnishingHeroBanner } from '@/app/furnishing/_components/FurnishingHeroBanner'
import { getFurnishingProductHitValues } from '@/app/furnishing/_utils/getFurnishingProductHitValues'
import { furnishingConfig } from '@/app/furnishing/config'
import { Hit } from '@/components/hit/Hit'
import { CategoryGrid } from '@/components/homepage/CategoryGrid'
import { CollectionBanners } from '@/components/homepage/CollectionBanners'
import { HomepageCarousels } from '@/components/homepage/HomepageCarousels'

const HomePage = () => {
  const productTemplate = furnishingConfig.algolia.primaryIndex.template

  return (
    <>
      <FurnishingHeroBanner />
      <div className="container mx-auto px-6 pt-10">
        <HomepageCarousels
          className="mb-16 space-y-16"
          renderItem={(hit) => (
            <Hit
              variant="standard"
              item={hit}
              template={productTemplate}
              slug="furnishing"
              extractor={getFurnishingProductHitValues}
            />
          )}
        />
        <CategoryGrid label={'Shop by Room'} />
      </div>
      <CollectionBanners />
    </>
  )
}

export default HomePage
