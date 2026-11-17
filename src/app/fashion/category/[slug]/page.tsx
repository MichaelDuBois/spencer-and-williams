'use client'

import { ProductListingPage } from '@/app/fashion/_components/ProductListingPage'
import { CategoryPage } from '@/components/category/CategoryPage'

const FashionCategoryPage = () => (
  <CategoryPage indexId="category_plp_fashion">
    {(title, category) => (
      <ProductListingPage
        category={category}
        header={
          <div className="mb-16 text-center">
            <h1 className="font-secondary text-4xl tracking-[0.15em] uppercase">
              {title}
            </h1>
          </div>
        }
      />
    )}
  </CategoryPage>
)

export default FashionCategoryPage
