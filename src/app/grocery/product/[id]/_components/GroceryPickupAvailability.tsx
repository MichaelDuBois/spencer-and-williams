'use client'

import { useAtomValue } from 'jotai'

import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import { StoreAvailabilityLine } from '@/components/storeLocator/StoreAvailabilityLine'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
} from '@/stores/groceryDeliveryMethod'

interface GroceryPickupAvailabilityProps {
  product: GroceryProductHitValues
}

export const GroceryPickupAvailability = ({
  product,
}: GroceryPickupAvailabilityProps) => {
  const mode = useAtomValue(groceryDeliveryMethodAtom, {
    store: groceryDeliveryMethodStore,
  })

  return (
    <StoreAvailabilityLine
      productId={product.objectID}
      availableInStores={product.availableInStores}
      inStockLabel={
        mode === 'pickup'
          ? (storeName) => `Ready for pickup at ${storeName}`
          : undefined
      }
    />
  )
}
