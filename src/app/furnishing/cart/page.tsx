'use client'

import { getFurnishingProductHitValues } from '@/app/furnishing/_utils/getFurnishingProductHitValues'
import { furnishingConfig } from '@/app/furnishing/config'
import { CartPage } from '@/components/cart/CartPage'

const FurnishingCartPage = () => (
  <CartPage
    config={furnishingConfig}
    extractor={getFurnishingProductHitValues}
  />
)

export default FurnishingCartPage
