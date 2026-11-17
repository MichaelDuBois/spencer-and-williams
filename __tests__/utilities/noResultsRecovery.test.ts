import { describe, expect, it } from 'vitest'

import {
  getCategoryRecoveryLink,
  getKnownCategoryValues,
  getRootCategoryAttribute,
  interpolateRecoveryPrompt,
  NO_RESULTS_ASSISTANT,
} from '@/utilities/noResultsRecovery'

describe('no-results recovery utilities', () => {
  it('interpolates the failed query without changing it', () => {
    expect(
      interpolateRecoveryPrompt(
        NO_RESULTS_ASSISTANT.promptTemplate,
        'red shoes',
      ),
    ).toBe('Help me find red shoes')
  })

  it('uses the configured navigation label for the category route', () => {
    expect(
      getCategoryRecoveryLink({
        basePath: '/shop',
        category: 'Home & Kitchen',
        navigation: [{ category: 'Home & Kitchen', label: 'Home' }],
      }),
    ).toEqual({ label: 'Home', href: '/shop/category/home-kitchen' })
  })

  it('uses a carousel label when the category is not in navigation', () => {
    expect(
      getCategoryRecoveryLink({
        basePath: '/shop',
        category: 'Home > Lighting',
        carouselCategories: [
          { category: 'Home > Lighting', label: 'Lighting' },
        ],
      }),
    ).toEqual({ label: 'Lighting', href: '/shop/category/home-lighting' })
  })

  it('gets the root attribute from the hierarchical facet', () => {
    expect(
      getRootCategoryAttribute([
        { attribute: 'brand', label: 'Brand', type: 'refinement' },
        {
          attribute: ['categories.lvl0', 'categories.lvl1'],
          label: 'Category',
          type: 'hierarchical',
        },
      ]),
    ).toBe('categories.lvl0')
  })

  it('keeps only categories that have a route', () => {
    expect(
      getKnownCategoryValues({
        navigation: [
          {
            category: 'Home',
            label: 'Home',
            children: [{ category: 'Home > Lighting', label: 'Lighting' }],
          },
        ],
        carouselCategories: [{ category: 'Seasonal' }],
      }),
    ).toEqual(new Set(['Home', 'Home > Lighting', 'Seasonal']))
  })
})
