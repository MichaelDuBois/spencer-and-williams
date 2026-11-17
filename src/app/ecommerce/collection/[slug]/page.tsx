'use client'

import { ProductListingPage } from '@/app/ecommerce/_components/ProductListingPage'
import { CollectionPage } from '@/components/collection/CollectionPage'

const EcommerceCollectionPage = () => (
  <CollectionPage indexId="collection_plp_ecommerce">
    {(title) => <ProductListingPage title={title} />}
  </CollectionPage>
)

export default EcommerceCollectionPage
