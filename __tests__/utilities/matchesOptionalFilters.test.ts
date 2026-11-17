import { describe, expect, it } from 'vitest'

import { matchesOptionalFilters } from '@/utilities/matchesOptionalFilters'

describe('matchesOptionalFilters', () => {
  it('matches a filter carrying a score suffix', () => {
    expect(
      matchesOptionalFilters({ brand: 'Horizon Organic' }, [
        'brand:Horizon Organic<score=10>',
      ]),
    ).toBe(true)
  })

  it('matches a filter without a score suffix', () => {
    expect(matchesOptionalFilters({ brand: 'Nike' }, ['brand:Nike'])).toBe(
      true,
    )
  })

  it.each([
    [{ brand: 'Nike' }, 'brand:nike<score=5>'],
    [{ brand: 'nike' }, 'brand:NIKE'],
    [{ brand: 'Niman Ranch' }, 'brand:"niman ranch"<score=10>'],
    [{ genres: ['Comedy', 'Drama'] }, 'genres:drama<score=2>'],
  ])('matches facet values regardless of case: %j, %s', (hit, filter) => {
    expect(matchesOptionalFilters(hit, [filter])).toBe(true)
  })

  it('keeps facet names case-sensitive', () => {
    expect(matchesOptionalFilters({ brand: 'Nike' }, ['Brand:Nike'])).toBe(
      false,
    )
  })

  it('keeps tag values case-sensitive', () => {
    expect(
      matchesOptionalFilters({ _tags: ['Featured'] }, ['_tags:Featured']),
    ).toBe(true)
    expect(
      matchesOptionalFilters({ _tags: ['Featured'] }, ['_tags:featured']),
    ).toBe(false)
  })

  it('matches a value wrapped in double quotes', () => {
    expect(
      matchesOptionalFilters({ brand: 'Niman Ranch' }, [
        'brand:"Niman Ranch"<score=10>',
      ]),
    ).toBe(true)
  })

  it('matches a hierarchical value containing " > " and commas on a nested path', () => {
    const hit = {
      hierarchicalCategories: {
        level0: 'Dairy, Eggs & Plant-Based Alternatives',
        level1: 'Dairy, Eggs & Plant-Based Alternatives > Milk',
      },
    }

    expect(
      matchesOptionalFilters(hit, [
        'hierarchicalCategories.level1:Dairy, Eggs & Plant-Based Alternatives > Milk<score=18>',
      ]),
    ).toBe(true)
  })

  it('matches a nested object path', () => {
    expect(
      matchesOptionalFilters({ category: { name: 'Shopify', id: 3 } }, [
        'category.name:Shopify<score=18>',
      ]),
    ).toBe(true)
  })

  it('matches when any entry of an array value equals the filter value', () => {
    expect(
      matchesOptionalFilters({ genres: ['Comedy', 'Drama'] }, [
        'genres:Drama<score=2>',
      ]),
    ).toBe(true)
  })

  it('compares numeric and boolean hit values as strings', () => {
    expect(matchesOptionalFilters({ year: 2024 }, ['year:2024'])).toBe(true)
    expect(matchesOptionalFilters({ onSale: true }, ['onSale:true'])).toBe(
      true,
    )
  })

  it.each(['brand:-Nike<score=5>', 'brand:"-Nike"<score=5>'])(
    'never counts a negated filter as a match: %s',
    (filter) => {
      expect(matchesOptionalFilters({ brand: '-Nike' }, [filter])).toBe(false)
      expect(matchesOptionalFilters({ brand: 'Nike' }, [filter])).toBe(false)
      expect(matchesOptionalFilters({ brand: 'Adidas' }, [filter])).toBe(false)
    },
  )

  it('still matches a positive filter alongside a negated filter', () => {
    expect(
      matchesOptionalFilters({ brand: 'Nike' }, [
        'brand:-Adidas',
        'brand:Nike',
      ]),
    ).toBe(true)
  })

  it.each(['brand:\\-Nike<score=5>', 'brand:"\\-Nike"<score=5>'])(
    'matches an escaped literal leading minus: %s',
    (filter) => {
      expect(matchesOptionalFilters({ brand: '-Nike' }, [filter])).toBe(true)
      expect(matchesOptionalFilters({ brand: 'Nike' }, [filter])).toBe(false)
    },
  )

  it('returns false when no filter matches the hit', () => {
    const hit = { brand: 'Generic', genres: ['Horror'] }

    expect(
      matchesOptionalFilters(hit, [
        'brand:Nike<score=5>',
        'genres:Drama<score=2>',
        'missing.path:Anything',
      ]),
    ).toBe(false)
  })

  it('returns false with no optional filters', () => {
    expect(matchesOptionalFilters({ brand: 'Nike' }, [])).toBe(false)
  })
})
