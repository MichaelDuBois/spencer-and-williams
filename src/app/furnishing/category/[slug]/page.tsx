'use client'

import { FurnishingProductListingPage } from '@/app/furnishing/_components/FurnishingProductListingPage'
import { CategoryPage } from '@/components/category/CategoryPage'

const FurnishingCategoryPage = () => (
  <CategoryPage indexId="category_plp_furnishing">
    {(title) => <FurnishingProductListingPage title={title} />}
  </CategoryPage>
)

export default FurnishingCategoryPage
