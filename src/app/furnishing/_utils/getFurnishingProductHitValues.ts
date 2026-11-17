import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import type { FurnishingHitTemplate } from '@/app/furnishing/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'

export const getFurnishingProductHitValues = createHitExtractor<
  FurnishingProductHitValues,
  FurnishingHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/product/${objectID}`,
  imageFields: ['image'],
})
