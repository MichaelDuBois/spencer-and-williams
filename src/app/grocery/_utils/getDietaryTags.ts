import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'

const TAG_LABELS: Record<string, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  gluten_free: 'Gluten-Free',
  dairy_free: 'Dairy-Free',
  organic: 'Organic',
  non_gmo: 'Non-GMO',
  nut_free: 'Nut-Free',
  keto: 'Keto',
  kosher: 'Kosher',
  halal: 'Halal',
  low_fat: 'Low Fat',
  sugar_free: 'Sugar-Free',
}

const titleCase = (value: string): string =>
  value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const getDietaryTags = (product: GroceryProductHitValues): string[] => {
  const tags = new Set<string>()

  for (const entry of product.semanticAttributes?.dietaryConsiderations ?? []) {
    const key = entry.toLowerCase()
    tags.add(TAG_LABELS[key] ?? titleCase(entry))
  }

  for (const keyword of product.keywords ?? []) {
    const key = keyword.toLowerCase()
    if (key in TAG_LABELS) tags.add(TAG_LABELS[key])
  }

  return [...tags]
}
