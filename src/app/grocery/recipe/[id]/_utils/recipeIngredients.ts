import { humanizeSlug } from '@/app/grocery/_utils/humanizeSlug'
import type { RecipeStep } from '@/app/grocery/hitValues.types'

export interface RecipeIngredient {
  ingredient: string
  label: string
  quantity: number
  unit: string
}

export const getUniqueIngredients = (
  steps: RecipeStep[] | undefined,
): RecipeIngredient[] => {
  if (!steps?.length) return []

  const byIngredientAndUnit = new Map<string, RecipeIngredient>()
  const ingredients: RecipeIngredient[] = []

  for (const step of steps) {
    if (!step.ingredient) continue

    const key = `${step.ingredient}__${step.unit}`
    const existing = byIngredientAndUnit.get(key)

    if (existing) {
      existing.quantity += step.quantity
      continue
    }

    const ingredient: RecipeIngredient = {
      ingredient: step.ingredient,
      label: humanizeSlug(step.ingredient),
      quantity: step.quantity,
      unit: step.unit,
    }
    byIngredientAndUnit.set(key, ingredient)
    ingredients.push(ingredient)
  }

  return ingredients
}
