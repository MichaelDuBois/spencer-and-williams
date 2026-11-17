import { describe, expect, it } from 'vitest'

import type { RecipeStep } from '@/app/grocery/hitValues.types'
import { getUniqueIngredients } from '@/app/grocery/recipe/[id]/_utils/recipeIngredients'

const makeStep = (overrides: Partial<RecipeStep> = {}): RecipeStep => {
  return {
    title: 'Step',
    ingredient: 'spaghetti',
    quantity: 100,
    unit: 'g',
    explanation: 'Cook it.',
    ...overrides,
  }
}

describe('getUniqueIngredients', () => {
  it('returns an empty array for missing steps', () => {
    expect(getUniqueIngredients(undefined)).toEqual([])
    expect(getUniqueIngredients([])).toEqual([])
  })

  it('maps steps to ingredients with humanized labels', () => {
    const result = getUniqueIngredients([
      makeStep({ ingredient: 'parmesan_cheese', quantity: 25, unit: 'g' }),
    ])

    expect(result).toEqual([
      {
        ingredient: 'parmesan_cheese',
        label: 'parmesan cheese',
        quantity: 25,
        unit: 'g',
      },
    ])
  })

  it('sums quantities for repeated ingredients sharing a unit', () => {
    const result = getUniqueIngredients([
      makeStep({ ingredient: 'cheddar_cheese', quantity: 60, unit: 'g' }),
      makeStep({ ingredient: 'egg', quantity: 1, unit: 'whole' }),
      makeStep({ ingredient: 'cheddar_cheese', quantity: 60, unit: 'g' }),
    ])

    expect(result.map((item) => item.ingredient)).toEqual([
      'cheddar_cheese',
      'egg',
    ])
    expect(result[0].quantity).toBe(120)
  })

  it('keeps same ingredient with different units as separate items', () => {
    const result = getUniqueIngredients([
      makeStep({ ingredient: 'oil', quantity: 5, unit: 'g' }),
      makeStep({ ingredient: 'oil', quantity: 10, unit: 'ml' }),
    ])

    expect(result).toEqual([
      { ingredient: 'oil', label: 'oil', quantity: 5, unit: 'g' },
      { ingredient: 'oil', label: 'oil', quantity: 10, unit: 'ml' },
    ])
  })
})
