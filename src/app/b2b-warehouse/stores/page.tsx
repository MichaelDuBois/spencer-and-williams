'use client'

import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import { StoreLocator } from '@/components/storeLocator/StoreLocator'

const StoresPage = () => {
  // The locator answers "which warehouses stock this product", so the lookup
  // must not be scoped to the currently selected warehouse.
  const productQueryOptions = useB2BProductHitOptions({
    ignoreWarehouse: true,
  })
  return <StoreLocator productQueryOptions={productQueryOptions} />
}

export default StoresPage
