'use client'

import { ProductListingPage } from '@/app/b2b-warehouse/_components/ProductListingPage'
import { CategoryPage } from '@/components/category/CategoryPage'

const B2BWarehouseCategoryPage = () => (
  <CategoryPage indexId="category_plp_b2b-warehouse">
    {(title) => <ProductListingPage title={title} />}
  </CategoryPage>
)

export default B2BWarehouseCategoryPage
