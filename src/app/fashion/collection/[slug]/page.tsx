'use client'

import { ProductListingPage } from '@/app/fashion/_components/ProductListingPage'
import { CollectionPage } from '@/components/collection/CollectionPage'

const FashionCollectionPage = () => (
  <CollectionPage indexId="collection_plp_fashion">
    {(title) => (
      <ProductListingPage
        header={
          <div className="mb-16 text-center">
            <h1 className="font-secondary text-4xl tracking-[0.15em] uppercase">
              {title}
            </h1>
            <p className="text-muted-foreground mt-4 text-sm">
              Discover our curated pieces
            </p>
          </div>
        }
      />
    )}
  </CollectionPage>
)

export default FashionCollectionPage
