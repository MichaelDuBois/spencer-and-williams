import { describe, expect, it } from 'vitest'

import {
  buildBaselineFilters,
  withBaselineFilters,
} from '@/app/media-entertainment/_utils/assistantSearchFilters'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'

const template = mediaEntertainmentConfig.algolia.primaryIndex.template!

describe('buildBaselineFilters', () => {
  it('applies the quality floor to every profile', () => {
    expect(
      buildBaselineFilters({
        template,
        qualityFloor: 200,
        isRestrictedProfile: false,
      }),
    ).toBe('vote_count >= 200')
  })

  it('reads the attribute names off the template rather than hardcoding them', () => {
    const filters = buildBaselineFilters({
      template: {
        ...template,
        attributes: {
          ...template.attributes,
          ratingCount: 'rating_count',
          maturityRating: 'age_rating',
          genres: 'category',
        },
      },
      qualityFloor: 200,
      isRestrictedProfile: true,
    })

    expect(filters).toContain('rating_count >= 200')
    expect(filters).toContain('NOT age_rating:"R"')
    expect(filters).toContain('NOT category:"Horror"')
    // Index-only field with no template mapping, so it stays a literal.
    expect(filters).toContain('NOT adult:true')
  })

  it('adds the maturity guard only for a restricted profile', () => {
    const filters = buildBaselineFilters({
      template,
      qualityFloor: 200,
      isRestrictedProfile: true,
    })

    expect(filters).toContain('vote_count >= 200')
    expect(filters).toContain('NOT adult:true')
    expect(filters).toContain('NOT certification:"R"')
    expect(filters).toContain('NOT genres:"Horror"')
  })

  // NR is the largest certification value on this index and the one that lets
  // unrated adult horror through when only the rated codes are excluded.
  it('excludes unrated titles for a restricted profile', () => {
    const filters = buildBaselineFilters({
      template,
      qualityFloor: 200,
      isRestrictedProfile: true,
    })

    expect(filters).toContain('NOT certification:"NR"')
  })

  it('excludes non-US adult certifications, not just the US codes', () => {
    const filters = buildBaselineFilters({
      template,
      qualityFloor: 200,
      isRestrictedProfile: true,
    })

    for (const value of ['18', '18A', '16', '15', 'B-15']) {
      expect(filters).toContain(`NOT certification:"${value}"`)
    }
  })

  it('joins every clause with AND so none can be satisfied alone', () => {
    const filters = buildBaselineFilters({
      template,
      qualityFloor: 200,
      isRestrictedProfile: true,
    })

    expect(filters).not.toContain(' OR ')
  })
})

describe('withBaselineFilters', () => {
  it('returns the baseline alone when the agent sent no filters', () => {
    expect(withBaselineFilters('vote_count >= 200')).toBe('vote_count >= 200')
    expect(withBaselineFilters('vote_count >= 200', '   ')).toBe(
      'vote_count >= 200',
    )
  })

  it('ANDs the agent expression onto the baseline', () => {
    expect(withBaselineFilters('vote_count >= 200', 'genres:"Comedy"')).toBe(
      'vote_count >= 200 AND (genres:"Comedy")',
    )
  })

  // Without the brackets `baseline AND a OR b` matches b alone, so an OR the
  // agent wrote innocently would bypass the guard entirely.
  it('parenthesises the agent expression so an OR cannot escape the baseline', () => {
    expect(
      withBaselineFilters(
        'NOT genres:"Horror"',
        'genres:"Animation" OR genres:"Horror"',
      ),
    ).toBe('NOT genres:"Horror" AND (genres:"Animation" OR genres:"Horror")')
  })
})
