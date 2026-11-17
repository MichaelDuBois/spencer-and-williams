'use client'

import { FurnishingProductListingPage } from '@/app/furnishing/_components/FurnishingProductListingPage'
import { CollectionPage } from '@/components/collection/CollectionPage'

const FurnishingCollectionPage = () => (
  <CollectionPage indexId="collection_plp_furnishing">
    {(title) => <FurnishingProductListingPage title={title} />}
  </CollectionPage>
)

export default FurnishingCollectionPage
