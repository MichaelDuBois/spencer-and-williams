'use client'

import { ElectronicsHeroBanner } from '@/app/electronics/_components/ElectronicsHeroBanner'
import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { electronicsConfig } from '@/app/electronics/config'
import { Hit } from '@/components/hit/Hit'
import { CategoryGrid } from '@/components/homepage/CategoryGrid'
import { CollectionBanners } from '@/components/homepage/CollectionBanners'
import { HomepageCarousels } from '@/components/homepage/HomepageCarousels'

const HomePage = () => {
  const productTemplate = electronicsConfig.algolia.primaryIndex.template

  return (
    <>
      <ElectronicsHeroBanner />
      <div className="container mx-auto px-6">
        <HomepageCarousels
          className="mb-16 space-y-16"
          renderItem={(hit) => (
            <Hit
              variant="standard"
              item={hit}
              template={productTemplate}
              slug="electronics"
              extractor={getElectronicsProductHitValues}
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
