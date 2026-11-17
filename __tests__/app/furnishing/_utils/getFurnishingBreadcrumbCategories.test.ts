import { describe, expect, it } from 'vitest'

import { getFurnishingBreadcrumbCategories } from '@/app/furnishing/_utils/getFurnishingBreadcrumbCategories'
import type { FurnishingConfigType } from '@/app/furnishing/types'

const config = {
  slug: 'furnishing',
  navigation: [
    {
      label: 'Living Room',
      category: 'Home & Kitchen > Furniture > Living Room Furniture',
    },
  ],
  carouselCategories: [
    { category: 'Home & Kitchen > Home Décor Products', label: 'Décor' },
  ],
} as FurnishingConfigType

describe('getFurnishingBreadcrumbCategories', () => {
  it('keeps only configured categories, labeled from navigation', () => {
    const result = getFurnishingBreadcrumbCategories(
      [
        'Home & Kitchen',
        'Home & Kitchen > Furniture',
        'Home & Kitchen > Furniture > Living Room Furniture',
        'Home & Kitchen > Furniture > Living Room Furniture > Sofas & Couches',
      ],
      config,
    )

    expect(result).toEqual([
      {
        label: 'Living Room',
        href: '/furnishing/category/home-kitchen-furniture-living-room-furniture',
      },
    ])
  })

  it('falls back to carouselCategories for labels', () => {
    const result = getFurnishingBreadcrumbCategories(
      ['Home & Kitchen', 'Home & Kitchen > Home Décor Products'],
      config,
    )

    expect(result).toEqual([
      {
        label: 'Décor',
        href: '/furnishing/category/home-kitchen-home-decor-products',
      },
    ])
  })

  it('returns an empty array when nothing matches or input is missing', () => {
    expect(getFurnishingBreadcrumbCategories(['Unknown'], config)).toEqual([])
    expect(getFurnishingBreadcrumbCategories(undefined, config)).toEqual([])
  })
})
