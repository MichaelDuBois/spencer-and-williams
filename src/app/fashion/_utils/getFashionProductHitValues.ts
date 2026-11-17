import { getColorVariants } from '@/app/fashion/_utils/getColorVariants'
import type { FashionProductHitValues } from '@/app/fashion/hitValues.types'
import type { FashionHitTemplate } from '@/app/fashion/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'

export const getFashionProductHitValues = createHitExtractor<
  FashionProductHitValues,
  FashionHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/product/${objectID}`,
  imageFields: ['image'],
  derive: {
    colorVariants: (hit, template, slug) =>
      getColorVariants(hit, template, slug),
  },
})
