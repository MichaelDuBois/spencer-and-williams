import { describe, expect, it } from 'vitest'

import { getGroceryRecipeHitValues } from '@/app/grocery/_utils/getGroceryRecipeHitValues'
import type { GroceryRecipeHitTemplate } from '@/app/grocery/types'

const template: GroceryRecipeHitTemplate = {
  attributes: {
    name: 'name',
    image: 'image',
    description: 'description',
    attrs: 'attrs',
    steps: 'steps',
  },
}

const rawRecipe = {
  objectID: 'spaghetti_carbonara',
  name: 'Spaghetti Carbonara',
  description: 'A Roman classic.',
  image: 'https://cdn.example.com/carbonara.png',
  attrs: [
    { key: 'Prep', val: '10m' },
    { key: 'Level', val: 'Intermediate' },
  ],
  steps: [
    {
      title: 'Step 1',
      ingredient: 'spaghetti',
      quantity: 100,
      unit: 'g',
      explanation: 'Boil the pasta.',
    },
  ],
}

describe('getGroceryRecipeHitValues', () => {
  it('extracts core recipe fields', () => {
    const recipe = getGroceryRecipeHitValues(rawRecipe, template, 'grocery')

    expect(recipe.objectID).toBe('spaghetti_carbonara')
    expect(recipe.name).toBe('Spaghetti Carbonara')
    expect(recipe.description).toBe('A Roman classic.')
  })

  it('builds the recipe route as productUrl', () => {
    const recipe = getGroceryRecipeHitValues(rawRecipe, template, 'grocery')

    expect(recipe.productUrl).toBe('/grocery/recipe/spaghetti_carbonara')
  })

  it('passes an absolute image URL through unchanged', () => {
    const recipe = getGroceryRecipeHitValues(rawRecipe, template, 'grocery')

    expect(recipe.image).toBe('https://cdn.example.com/carbonara.png')
  })

  it('preserves the attrs and steps arrays', () => {
    const recipe = getGroceryRecipeHitValues(rawRecipe, template, 'grocery')

    expect(recipe.attrs).toEqual([
      { key: 'Prep', val: '10m' },
      { key: 'Level', val: 'Intermediate' },
    ])
    expect(recipe.steps).toHaveLength(1)
    expect(recipe.steps?.[0].ingredient).toBe('spaghetti')
  })
})
