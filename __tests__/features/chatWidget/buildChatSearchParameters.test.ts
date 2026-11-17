import { describe, expect, it } from 'vitest'

import {
  buildChatSearchParameters,
  getChatSearchIndexNames,
} from '@/features/chatWidget/utils/buildChatSearchParameters'

const OPTIONAL_FILTERS = ['brand:Nike<score=5>']

describe('getChatSearchIndexNames', () => {
  it('defaults to the primary index only', () => {
    expect(getChatSearchIndexNames('fashion_ns')).toEqual(['fashion_ns'])
  })

  it('adds configured extra indices after the primary', () => {
    expect(
      getChatSearchIndexNames('fashion_ns', ['support_faq', 'fashion_articles']),
    ).toEqual(['fashion_ns', 'support_faq', 'fashion_articles'])
  })

  it('dedupes names and drops empty or blank ones', () => {
    expect(
      getChatSearchIndexNames('products', ['products', '', '  ', 'faq', 'faq']),
    ).toEqual(['products', 'faq'])
  })

  it('returns no names without a primary or extras', () => {
    expect(getChatSearchIndexNames(undefined)).toEqual([])
  })
})

describe('buildChatSearchParameters', () => {
  it('sends token, re-rank and optionalFilters to every index for an active persona', () => {
    expect(
      buildChatSearchParameters(['a', 'b'], {
        userToken: 'persona-runner',
        enablePersonalization: true,
        optionalFilters: OPTIONAL_FILTERS,
        getRankingInfo: true,
        ruleContexts: ['pin'],
      }),
    ).toEqual({
      a: {
        userToken: 'persona-runner',
        enablePersonalization: true,
        optionalFilters: OPTIONAL_FILTERS,
      },
      b: {
        userToken: 'persona-runner',
        enablePersonalization: true,
        optionalFilters: OPTIONAL_FILTERS,
      },
    })
  })

  it('sends the realtime session token and filters', () => {
    expect(
      buildChatSearchParameters(['a'], {
        userToken: 'realtime-123',
        enablePersonalization: true,
        optionalFilters: ['category:Shoes<score=3>'],
      }),
    ).toEqual({
      a: {
        userToken: 'realtime-123',
        enablePersonalization: true,
        optionalFilters: ['category:Shoes<score=3>'],
      },
    })
  })

  it('sends an explicit false and no filters when no persona is active', () => {
    expect(
      buildChatSearchParameters(['a'], { enablePersonalization: false }),
    ).toEqual({ a: { enablePersonalization: false } })
  })

  it('keeps the token but drops filters while personalization is off', () => {
    expect(
      buildChatSearchParameters(['a'], {
        userToken: 'group-0',
        enablePersonalization: false,
        optionalFilters: OPTIONAL_FILTERS,
      }),
    ).toEqual({ a: { userToken: 'group-0', enablePersonalization: false } })
  })

  it('returns undefined when the vertical has personalization disabled and no token', () => {
    expect(buildChatSearchParameters(['a'], {})).toBeUndefined()
  })

  it('returns undefined without index names', () => {
    expect(
      buildChatSearchParameters([], { enablePersonalization: false }),
    ).toBeUndefined()
  })
})
