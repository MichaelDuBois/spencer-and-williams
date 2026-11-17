import { humanizeSlug } from '@/app/grocery/_utils/humanizeSlug'

export const getRecipeIngredientFilters = (
  type: string | undefined,
): string[] => {
  if (!type) return []

  const spaced = humanizeSlug(type)
  if (!spaced) return []

  const variants = new Set<string>([type, spaced])

  for (const value of [type, spaced]) {
    if (value.endsWith('s')) variants.add(value.slice(0, -1))
  }

  return [...variants]
}
