import { describe, expect, it } from 'vitest'

import { getLocatorNoun } from '@/components/storeLocator/getLocatorNoun'
import type { VerticalConfig } from '@/types'

describe('getLocatorNoun', () => {
  it('defaults to store/stores when config is null', () => {
    expect(getLocatorNoun(null)).toEqual({
      singular: 'store',
      plural: 'stores',
    })
  })

  it('defaults to store/stores when config has no locator', () => {
    const config = {} as VerticalConfig
    expect(getLocatorNoun(config)).toEqual({
      singular: 'store',
      plural: 'stores',
    })
  })

  it('returns the configured nouns when present', () => {
    const config = {
      locator: { nounSingular: 'warehouse', nounPlural: 'warehouses' },
    } as VerticalConfig
    expect(getLocatorNoun(config)).toEqual({
      singular: 'warehouse',
      plural: 'warehouses',
    })
  })
})
