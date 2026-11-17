'use client'

import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { ecommerceConfig } from '@/app/ecommerce/config'
import { CartPage } from '@/components/cart/CartPage'

const EcommerceCartPage = () => (
  <CartPage config={ecommerceConfig} extractor={getEcommerceProductHitValues} />
)

export default EcommerceCartPage
