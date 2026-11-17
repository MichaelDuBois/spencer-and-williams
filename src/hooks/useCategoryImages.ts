'use client'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { usePreviewImages } from '@/hooks/usePreviewImages'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'

export const useCategoryImages = (queryOptions?: HitQueryOptions) => {
  const config = useActiveConfig()
  const carouselCategories = config?.carouselCategories ?? []
  const categories = carouselCategories.map((c) => c.category)
  const imageMap = usePreviewImages(
    categories,
    config?.merchandising?.categoryAttribute ?? 'categoryPageId',
    'categoryImages',
    queryOptions,
  )

  return { carouselCategories, imageMap }
}
