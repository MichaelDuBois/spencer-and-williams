'use client'

import { B2BContentHeroBanner } from '@/app/b2b-content/_components/B2BContentHeroBanner'
import { FeaturedBlogs } from '@/app/b2b-content/_components/FeaturedBlogs'
import { FeaturedResources } from '@/app/b2b-content/_components/FeaturedResources'

const HomePage = () => (
  <div>
    <B2BContentHeroBanner />
    <div id="b2b-content-body" className="container mx-auto px-6 py-12">
      <FeaturedBlogs />
      <FeaturedResources />
    </div>
  </div>
)

export default HomePage
