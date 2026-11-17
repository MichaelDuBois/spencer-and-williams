import type { FurnishingConfigType } from '@/app/furnishing/types'
import { getSlug } from '@/utilities/getSlug'

export interface BreadcrumbCategory {
  label: string
  href: string
}

export const getFurnishingBreadcrumbCategories = (
  hierarchicalCategories: string[] | undefined,
  config: FurnishingConfigType,
): BreadcrumbCategory[] => {
  if (!hierarchicalCategories) return []

  const navigation = config.navigation ?? []
  const carousels = config.carouselCategories ?? []

  return hierarchicalCategories
    .map((category) => {
      const match =
        navigation.find((n) => n.category === category) ??
        carousels.find((c) => c.category === category)
      if (!match) return null
      return {
        label: match.label,
        href: `/${config.slug}/category/${getSlug(category)}`,
      }
    })
    .filter((item): item is BreadcrumbCategory => item !== null)
}
