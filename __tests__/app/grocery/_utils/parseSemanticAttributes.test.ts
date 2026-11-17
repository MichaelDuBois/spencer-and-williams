import { describe, expect, it } from 'vitest'

import { parseSemanticAttributes } from '@/app/grocery/_utils/parseSemanticAttributes'

describe('parseSemanticAttributes', () => {
  it('parses a full attribute string', () => {
    const raw =
      'COUNTRY_OF_ORIGIN: United States. STORAGE: refrigerate_after_opening. ALLERGENS: contains milk.'

    expect(parseSemanticAttributes(raw)).toEqual({
      allergens: 'contains milk',
      countryOfOrigin: 'United States',
      cuisine: undefined,
      dietaryConsiderations: undefined,
      packQuantity: undefined,
      preparationTime: undefined,
      seasonal: undefined,
      servingSuggestions: undefined,
      spiceLevel: undefined,
      storage: 'refrigerate_after_opening',
    })
  })

  it('splits comma-separated lists for dietary considerations', () => {
    const raw = 'DIETARY_CONSIDERATIONS: vegan, gluten_free.'

    const result = parseSemanticAttributes(raw)

    expect(result?.dietaryConsiderations).toEqual(['vegan', 'gluten_free'])
  })

  it('splits comma-separated lists for serving suggestions', () => {
    const raw = 'SERVING_SUGGESTIONS: with rice, as a side dish.'

    const result = parseSemanticAttributes(raw)

    expect(result?.servingSuggestions).toEqual(['with rice', 'as a side dish'])
  })

  it('returns undefined for non-string input', () => {
    expect(parseSemanticAttributes(null)).toBeUndefined()
    expect(parseSemanticAttributes(undefined)).toBeUndefined()
    expect(parseSemanticAttributes(42)).toBeUndefined()
  })

  it('returns undefined for empty or whitespace-only string', () => {
    expect(parseSemanticAttributes('')).toBeUndefined()
    expect(parseSemanticAttributes('   ')).toBeUndefined()
  })

  it('strips trailing periods from values', () => {
    const raw = 'CUISINE: Italian.'

    expect(parseSemanticAttributes(raw)?.cuisine).toBe('Italian')
  })

  it('skips keys with empty values', () => {
    const raw = 'CUISINE: . STORAGE: cool dry place.'

    const result = parseSemanticAttributes(raw)

    expect(result?.cuisine).toBeUndefined()
    expect(result?.storage).toBe('cool dry place')
  })

  it('returns undefined when no recognised keys have values', () => {
    const raw = 'UNKNOWN_KEY: something.'

    expect(parseSemanticAttributes(raw)).toBeUndefined()
  })
})
