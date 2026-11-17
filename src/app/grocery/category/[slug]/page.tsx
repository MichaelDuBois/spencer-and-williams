'use client'

import { ProductListingPage } from '@/app/grocery/_components/ProductListingPage'
import { CategoryPage } from '@/components/category/CategoryPage'

const GroceryCategoryPage = () => (
  <CategoryPage indexId="category_plp_grocery">
    {(title) => <ProductListingPage title={title} />}
  </CategoryPage>
)

export default GroceryCategoryPage
