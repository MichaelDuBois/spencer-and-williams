'use client'

import { ProductListingPage } from '@/app/grocery/_components/ProductListingPage'
import { CollectionPage } from '@/components/collection/CollectionPage'

const GroceryCollectionPage = () => (
  <CollectionPage indexId="collection_plp_grocery">
    {(title) => <ProductListingPage title={title} />}
  </CollectionPage>
)

export default GroceryCollectionPage
