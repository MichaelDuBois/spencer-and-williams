'use client'

import { ProductListingPage } from '@/app/electronics/_components/ProductListingPage'
import { CollectionPage } from '@/components/collection/CollectionPage'

const ElectronicsCollectionPage = () => (
  <CollectionPage indexId="collection_plp_electronics">
    {(title) => <ProductListingPage title={title} />}
  </CollectionPage>
)

export default ElectronicsCollectionPage
