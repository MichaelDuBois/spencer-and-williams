import { describe, expect, it } from 'vitest'

import { getRecipeIngredientFilters } from '@/app/grocery/_utils/getRecipeIngredientFilters'

describe('getRecipeIngredientFilters', () => {
  it('returns an empty array for missing or empty types', () => {
    expect(getRecipeIngredientFilters(undefined)).toEqual([])
    expect(getRecipeIngredientFilters('')).toEqual([])
  })

  it('generates underscore, spaced, and singular variants', () => {
    const filters = getRecipeIngredientFilters('chicken_thighs')

    expect(filters).toContain('chicken_thighs')
    expect(filters).toContain('chicken thighs')
    expect(filters).toContain('chicken thigh')
    expect(filters).toContain('chicken_thigh')
  })

  it('does not add a singular variant when the type is not plural', () => {
    expect(getRecipeIngredientFilters('olive_oil')).toEqual([
      'olive_oil',
      'olive oil',
    ])
  })

  it('dedupes variants for single-word types', () => {
    expect(getRecipeIngredientFilters('honey')).toEqual(['honey'])
  })
})
