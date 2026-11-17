import type { GrocerySemanticAttributes } from '@/app/grocery/hitValues.types'

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

export const parseSemanticAttributes = (
  raw: unknown,
): GrocerySemanticAttributes | undefined => {
  if (typeof raw !== 'string' || raw.trim() === '') return undefined

  const pairs: Record<string, string> = {}
  const regex = /([A-Z_]+):\s*(.*?)(?=\s+[A-Z_]+:|$)/g

  for (const match of raw.matchAll(regex)) {
    const key = match[1]
    const value = match[2].trim().replace(/\.$/, '').trim()
    if (value) pairs[key] = value
  }

  const result: GrocerySemanticAttributes = {
    allergens: pairs.ALLERGENS,
    countryOfOrigin: pairs.COUNTRY_OF_ORIGIN,
    cuisine: pairs.CUISINE,
    dietaryConsiderations: pairs.DIETARY_CONSIDERATIONS
      ? splitList(pairs.DIETARY_CONSIDERATIONS)
      : undefined,
    packQuantity: pairs.PACK_QUANTITY,
    preparationTime: pairs.PREPARATION_TIME,
    seasonal: pairs.SEASONAL,
    servingSuggestions: pairs.SERVING_SUGGESTIONS
      ? splitList(pairs.SERVING_SUGGESTIONS)
      : undefined,
    spiceLevel: pairs.SPICE_LEVEL,
    storage: pairs.STORAGE,
  }

  const hasValue = Object.values(result).some(
    (value) => value != null && (!Array.isArray(value) || value.length > 0),
  )

  return hasValue ? result : undefined
}
