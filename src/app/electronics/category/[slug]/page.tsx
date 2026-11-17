'use client'

import { ProductListingPage } from '@/app/electronics/_components/ProductListingPage'
import { CategoryPage } from '@/components/category/CategoryPage'

const ElectronicsCategoryPage = () => (
  <CategoryPage indexId="category_plp_electronics">
    {(title) => <ProductListingPage title={title} />}
  </CategoryPage>
)

export default ElectronicsCategoryPage
