import { afterEach, describe, expect, it } from 'vitest'

import { PERSONAS } from '@/app/ecommerce/personas'
import {
  VERTICAL_SLUGS,
  getDemoContext,
  getVerticalFromPathname,
  readDemoContext,
  type DemoContextInput,
} from '@/lib/analytics/demo-context'
import {
  algoliaEnvironmentAtom,
  algoliaEnvironmentStore,
} from '@/stores/algoliaEnvironment'
import { DEMO_OPTION_KEYS, type DemoOptionKey } from '@/stores/demoOptions'
import { verticals } from '@/verticals'

import { GROUP_0 } from '@tests/helpers/customerGroups'

const allOptions = (enabled: boolean): Record<DemoOptionKey, boolean> =>
  Object.fromEntries(
    DEMO_OPTION_KEYS.map((key) => [key, enabled]),
  ) as Record<DemoOptionKey, boolean>

const baseInput: DemoContextInput = {
  pathname: '/ecommerce',
  persona: null,
  realtimeEnabled: false,
  demoOptions: allOptions(false),
  environment: 'production',
}

describe('getVerticalFromPathname', () => {
  it('keeps the slug list in sync with the vertical registry', () => {
    expect([...VERTICAL_SLUGS].sort()).toEqual(
      verticals.map(({ config }) => config.slug).sort(),
    )
  })

  it.each(VERTICAL_SLUGS)('reads %s from its landing path', (slug) => {
    expect(getVerticalFromPathname(`/${slug}`)).toBe(slug)
  })

  it.each([
    ['/travel/article/x', 'travel'],
    ['/ecommerce/', 'ecommerce'],
    ['/b2b-warehouse/search', 'b2b-warehouse'],
    ['/media-entertainment/watch/42', 'media-entertainment'],
  ])('reads the first segment of nested path %s', (pathname, vertical) => {
    expect(getVerticalFromPathname(pathname)).toBe(vertical)
  })

  it.each(['/', '', '/not-a-vertical', '/about/ecommerce', '/ecommerce-x'])(
    'is null for non-vertical path %j',
    (pathname) => {
      expect(getVerticalFromPathname(pathname)).toBeNull()
    },
  )
})

describe('getDemoContext', () => {
  it('describes an anonymous visitor at the root', () => {
    expect(getDemoContext({ ...baseInput, pathname: '/' })).toEqual({
      vertical: null,
      persona: null,
      personalization_mode: 'anonymous',
      demo_options_enabled: [],
      algolia_environment: 'production',
    })
  })

  it('carries the active Algolia environment', () => {
    expect(
      getDemoContext({ ...baseInput, environment: 'staging' })
        .algolia_environment,
    ).toBe('staging')
  })

  it('carries the vertical of a nested path', () => {
    expect(
      getDemoContext({ ...baseInput, pathname: '/travel/article/x' }).vertical,
    ).toBe('travel')
  })

  it('carries the active persona id in persona mode', () => {
    expect(getDemoContext({ ...baseInput, persona: PERSONAS[0] })).toMatchObject(
      { persona: PERSONAS[0].id, personalization_mode: 'persona' },
    )
  })

  it('carries the customer group id in customer group mode', () => {
    expect(getDemoContext({ ...baseInput, persona: GROUP_0 })).toMatchObject({
      persona: GROUP_0.id,
      personalization_mode: 'customerGroup',
    })
  })

  it('has no persona in realtime mode', () => {
    expect(
      getDemoContext({ ...baseInput, realtimeEnabled: true }),
    ).toMatchObject({ persona: null, personalization_mode: 'realtime' })
  })

  it('lists every enabled demo option', () => {
    expect(
      getDemoContext({ ...baseInput, demoOptions: allOptions(true) })
        .demo_options_enabled,
    ).toEqual(DEMO_OPTION_KEYS)
  })

  it('lists only the enabled demo options', () => {
    expect(
      getDemoContext({
        ...baseInput,
        demoOptions: {
          ...allOptions(false),
          neural_search: true,
          chat_widget: true,
        },
      }).demo_options_enabled,
    ).toEqual(['neural_search', 'chat_widget'])
  })
})

describe('readDemoContext', () => {
  afterEach(() => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'production')
  })

  it('reads the Algolia environment from the pinned store', () => {
    expect(readDemoContext('/ecommerce').algolia_environment).toBe(
      'production',
    )

    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')

    expect(readDemoContext('/ecommerce').algolia_environment).toBe('staging')
  })
})
