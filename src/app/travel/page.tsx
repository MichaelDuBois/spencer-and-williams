'use client'

import { FeaturedArticles } from '@/app/travel/_components/FeaturedArticles'
import { FeaturedPodcasts } from '@/app/travel/_components/FeaturedPodcasts'
import { TravelHeroBanner } from '@/app/travel/_components/TravelHeroBanner'

const HomePage = () => (
  <div>
    <TravelHeroBanner />
    <div id="travel-content" className="container mx-auto px-6 py-12">
      <FeaturedArticles />
      <FeaturedPodcasts />
    </div>
  </div>
)

export default HomePage
