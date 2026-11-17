'use client'

import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { electronicsConfig } from '@/app/electronics/config'
import { CartPage } from '@/components/cart/CartPage'

const ElectronicsCartPage = () => (
  <CartPage
    config={electronicsConfig}
    extractor={getElectronicsProductHitValues}
  />
)

export default ElectronicsCartPage
