'use client'

import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { groceryConfig } from '@/app/grocery/config'
import { CartPage } from '@/components/cart/CartPage'

const GroceryCartPage = () => (
  <CartPage config={groceryConfig} extractor={getGroceryProductHitValues} />
)

export default GroceryCartPage
