'use client'

import { ProductListingPage } from '@/app/ecommerce/_components/ProductListingPage'
import { CategoryPage } from '@/components/category/CategoryPage'

const EcommerceCategoryPage = () => (
  <CategoryPage indexId="category_plp_ecommerce">
    {(title) => <ProductListingPage title={title} />}
  </CategoryPage>
)

export default EcommerceCategoryPage
