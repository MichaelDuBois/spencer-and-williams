'use client'

import { FashionHeroBanner } from '@/app/fashion/_components/FashionHeroBanner'
import { FeaturedCollections } from '@/app/fashion/_components/FeaturedCollections'
import { JournalSection } from '@/app/fashion/_components/JournalSection'
import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'
import { Hit } from '@/components/hit/Hit'
import { HomepageCarousels } from '@/components/homepage/HomepageCarousels'

const HomePage = () => {
  const productTemplate = fashionConfig.algolia.primaryIndex.template

  return (
    <div>
      <FashionHeroBanner />
      <section className="container mx-auto px-4 py-24">
        <HomepageCarousels
          variant="editorial"
          className="space-y-16"
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
      </section>
      <FeaturedCollections />
      <JournalSection />
    </div>
  )
}

export default HomePage
