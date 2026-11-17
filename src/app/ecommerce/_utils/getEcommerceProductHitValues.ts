import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import type { EcommerceHitTemplate } from '@/app/ecommerce/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'

export const getEcommerceProductHitValues = createHitExtractor<
  EcommerceProductHitValues,
  EcommerceHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/product/${objectID}`,
  imageFields: ['image'],
})
