import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import type { FashionArticleHitTemplate } from '@/app/fashion/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'

export const getFashionArticleHitValues = createHitExtractor<
  FashionArticleHitValues,
  FashionArticleHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/article/${objectID}`,
  imageFields: ['image', 'thumbnail'],
})
