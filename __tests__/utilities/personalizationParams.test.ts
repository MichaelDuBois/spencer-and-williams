import { describe, expect, it } from 'vitest'

import {
  getPersonalizationSearchParams,
  isPersonalizationActive,
} from '@/utilities/personalizationParams'

describe('isPersonalizationActive', () => {
  it('does not enable affinity personalization for a customer group', () => {
    expect(
      isPersonalizationActive({
        mode: 'customerGroup',
        isFeatureEnabled: true,
      }),
    ).toBe(false)
  })
  it('is active only with the feature enabled and a real persona', () => {
    expect(
      isPersonalizationActive({ mode: 'persona', isFeatureEnabled: true }),
    ).toBe(true)
    expect(
      isPersonalizationActive({ mode: 'realtime', isFeatureEnabled: true }),
    ).toBe(true)
  })

  it('is inactive for an anonymous visitor, however the vertical is configured', () => {
    expect(
      isPersonalizationActive({ mode: 'anonymous', isFeatureEnabled: true }),
    ).toBe(false)
  })

  it('is inactive when the vertical has the feature off', () => {
    expect(
      isPersonalizationActive({ mode: 'persona', isFeatureEnabled: false }),
    ).toBe(false)
    expect(
      isPersonalizationActive({ mode: 'persona', isFeatureEnabled: undefined }),
    ).toBe(false)
  })
})

describe('getPersonalizationSearchParams', () => {
  it('returns an empty object with no personalization at all', () => {
    expect(getPersonalizationSearchParams({})).toEqual({})
  })

  it('forwards ruleContexts while personalization is inactive', () => {
    expect(
      getPersonalizationSearchParams({
        personalization: { isActive: false },
        ruleContexts: ['homepage_pinned'],
      }),
    ).toEqual({ ruleContexts: ['homepage_pinned'] })
  })

  it('drops ruleContexts once personalization is active, so pins cannot fight the re-rank', () => {
    const params = getPersonalizationSearchParams({
      personalization: {
        isActive: true,
        currentUserToken: 'persona-1',
        currentOptionalFilters: ['genres:Drama<score=2>'],
      },
      ruleContexts: ['homepage_pinned'],
    })

    expect(params).not.toHaveProperty('ruleContexts')
    expect(params).toEqual({
      userToken: 'persona-1',
      enablePersonalization: true,
      optionalFilters: ['genres:Drama<score=2>'],
      getRankingInfo: true,
    })
  })

  it('omits an empty ruleContexts array rather than sending it', () => {
    expect(
      getPersonalizationSearchParams({
        personalization: { isActive: false },
        ruleContexts: [],
      }),
    ).toEqual({})
  })

  it('keeps filterRuleContexts while personalization is active', () => {
    const params = getPersonalizationSearchParams({
      personalization: { isActive: true, currentUserToken: 'persona-1' },
      filterRuleContexts: ['homepage_me_top_10'],
    })

    expect(params.ruleContexts).toEqual(['homepage_me_top_10'])
  })

  it('sends only the filtering contexts once a persona is active', () => {
    expect(
      getPersonalizationSearchParams({
        personalization: { isActive: true },
        ruleContexts: ['homepage_pinned'],
        filterRuleContexts: ['homepage_me_top_10'],
      }).ruleContexts,
    ).toEqual(['homepage_me_top_10'])
  })

  it('sends both kinds of context while personalization is inactive', () => {
    expect(
      getPersonalizationSearchParams({
        personalization: { isActive: false },
        ruleContexts: ['homepage_pinned'],
        filterRuleContexts: ['homepage_me_top_10'],
      }).ruleContexts,
    ).toEqual(['homepage_me_top_10', 'homepage_pinned'])
  })

  it('omits the param when both context fields are empty or absent', () => {
    expect(
      getPersonalizationSearchParams({
        personalization: { isActive: true },
        ruleContexts: [],
        filterRuleContexts: [],
      }),
    ).not.toHaveProperty('ruleContexts')
    expect(
      getPersonalizationSearchParams({ filterRuleContexts: [] }),
    ).not.toHaveProperty('ruleContexts')
  })

  it('sends a userToken without enabling personalization for an anonymous visitor', () => {
    const params = getPersonalizationSearchParams({
      personalization: { isActive: false, currentUserToken: 'anon-1' },
    })

    expect(params).toEqual({ userToken: 'anon-1' })
    expect(params).not.toHaveProperty('enablePersonalization')
  })

  it('omits an empty userToken', () => {
    expect(
      getPersonalizationSearchParams({
        personalization: { isActive: false, currentUserToken: '' },
      }),
    ).not.toHaveProperty('userToken')
  })
})
