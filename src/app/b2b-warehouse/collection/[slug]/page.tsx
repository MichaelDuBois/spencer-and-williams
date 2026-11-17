'use client'

import { ProductListingPage } from '@/app/b2b-warehouse/_components/ProductListingPage'
import { CollectionPage } from '@/components/collection/CollectionPage'

const B2BWarehouseCollectionPage = () => (
  <CollectionPage indexId="collection_plp_b2b-warehouse">
    {(title) => <ProductListingPage title={title} />}
  </CollectionPage>
)

export default B2BWarehouseCollectionPage
