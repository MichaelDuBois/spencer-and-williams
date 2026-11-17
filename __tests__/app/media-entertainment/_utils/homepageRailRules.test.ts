import { describe, expect, it } from 'vitest'

import {
  isHomepageRailRule,
  mergeHomepageRails,
  parseRailDescription,
} from '@/app/media-entertainment/_utils/homepageRailRules'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaHomepageRailConfig } from '@/app/media-entertainment/types'
import type { AlgoliaRule } from '@/lib/algoliaRules'

const PREFIX = mediaEntertainmentConfig.homepageRailDiscovery.contextPrefix
const MAX_DISCOVERED =
  mediaEntertainmentConfig.homepageRailDiscovery.maxDiscovered

const CONFIGURED_RAILS = mediaEntertainmentConfig.homepageRails ?? []

/** A context-only rail rule, shaped like the live ones on `media_ns`. */
const createRailRule = ({
  context,
  description,
  lastUpdate = 1787574551,
  ...overrides
}: {
  context: string
  description?: string
  lastUpdate?: number
} & Partial<AlgoliaRule>): AlgoliaRule => {
  return {
    objectID: context,
    enabled: true,
    ...(description === undefined ? {} : { description }),
    conditions: [{ context }],
    consequence: { params: { filters: 'record_type:movie' } },
    _metadata: { lastUpdate },
    ...overrides,
  }
}

/**
 * The seven rules that actually carry a `homepage_me_*` context on the live
 * index, with their real descriptions and `lastUpdate` values.
 */
const LIVE_RAIL_RULES: AlgoliaRule[] = [
  createRailRule({
    context: 'homepage_me_top_10',
    description:
      'Homepage rail: Top 10 Today (~5,182 titles, index ranking picks the order)',
    lastUpdate: 1788872154,
  }),
  createRailRule({
    context: 'homepage_me_sci_fi',
    description:
      "Homepage rail: Sci-Fi & Fantasy (~1,502 titles, both taxonomies OR'd)",
  }),
  createRailRule({
    context: 'homepage_me_originals',
    description: 'Homepage rail: S&W Originals (~35 titles)',
  }),
  createRailRule({
    context: 'homepage_me_new_releases',
    description: 'Homepage rail: New Releases (~196 titles)',
  }),
  createRailRule({
    context: 'homepage_me_family_night',
    description: 'Homepage rail: Family Movie Night (~1,465 titles)',
  }),
  createRailRule({
    context: 'homepage_me_blockbusters',
    description: 'Homepage rail: Blockbuster Movies (~2,597 titles)',
  }),
  createRailRule({
    context: 'homepage_me_binge_series',
    description: 'Homepage rail: Binge-Worthy Series (~1,051 titles)',
  }),
]

/** One of the nine `qr-*` query rules that share the index with the rails. */
const QUERY_RULE: AlgoliaRule = {
  objectID: 'qr-1769092954327',
  enabled: true,
  conditions: [{ anchoring: 'contains', pattern: '{facet:record_type}' }],
  consequence: { params: { filters: 'record_type:movie' } },
  _metadata: { lastUpdate: 1787236432 },
}

const merge = (
  rules: AlgoliaRule[] | null,
  configured: MediaHomepageRailConfig[] = CONFIGURED_RAILS,
  maxDiscovered = MAX_DISCOVERED,
  reservedContexts?: string[],
) =>
  mergeHomepageRails({
    configured,
    rules,
    prefix: PREFIX,
    maxDiscovered,
    reservedContexts,
  })

const railIds = (rails: MediaHomepageRailConfig[]) =>
  rails.map((rail) => rail.id)

const railTitles = (rails: MediaHomepageRailConfig[]) =>
  rails.map((rail) => rail.title)

describe('isHomepageRailRule', () => {
  it('accepts every live rail rule', () => {
    expect(
      LIVE_RAIL_RULES.every((rule) => isHomepageRailRule(rule, PREFIX)),
    ).toBe(true)
  })

  it('rejects a query rule matching on a pattern', () => {
    expect(isHomepageRailRule(QUERY_RULE, PREFIX)).toBe(false)
  })

  it('rejects a context outside the prefix', () => {
    expect(
      isHomepageRailRule(createRailRule({ context: 'search_me_top' }), PREFIX),
    ).toBe(false)
  })

  it('rejects a disabled rule', () => {
    expect(
      isHomepageRailRule(
        createRailRule({ context: 'homepage_me_top_10', enabled: false }),
        PREFIX,
      ),
    ).toBe(false)
  })

  it('rejects a condition carrying both a context and a pattern', () => {
    expect(
      isHomepageRailRule(
        createRailRule({
          context: 'homepage_me_top_10',
          conditions: [{ context: 'homepage_me_top_10', pattern: 'top' }],
        }),
        PREFIX,
      ),
    ).toBe(false)
  })

  it('rejects a rule with no usable consequence', () => {
    expect(
      isHomepageRailRule(
        createRailRule({ context: 'homepage_me_top_10', consequence: {} }),
        PREFIX,
      ),
    ).toBe(false)
    expect(
      isHomepageRailRule(
        createRailRule({
          context: 'homepage_me_top_10',
          consequence: undefined,
        }),
        PREFIX,
      ),
    ).toBe(false)
  })

  it('rejects a rule with more than one condition', () => {
    expect(
      isHomepageRailRule(
        createRailRule({
          context: 'homepage_me_top_10',
          conditions: [
            { context: 'homepage_me_top_10' },
            { context: 'homepage_me_sci_fi' },
          ],
        }),
        PREFIX,
      ),
    ).toBe(false)
  })

  it('rejects a rule with no conditions at all', () => {
    expect(
      isHomepageRailRule(
        createRailRule({ context: 'homepage_me_top_10', conditions: [] }),
        PREFIX,
      ),
    ).toBe(false)
  })
})

describe('parseRailDescription', () => {
  it('turns every live description into the title the page shows today', () => {
    expect(
      LIVE_RAIL_RULES.map((rule) => parseRailDescription(rule.description)),
    ).toEqual([
      { title: 'Top 10 Today' },
      { title: 'Sci-Fi & Fantasy' },
      { title: 'S&W Originals' },
      { title: 'New Releases' },
      { title: 'Family Movie Night' },
      { title: 'Blockbuster Movies' },
      { title: 'Binge-Worthy Series' },
    ])
  })

  it('reads a shape token and keeps it out of the title', () => {
    expect(
      parseRailDescription(
        'Homepage rail: Award Winners [shape=backdrop] (~42 titles)',
      ),
    ).toEqual({ title: 'Award Winners', shape: 'backdrop' })
  })

  it('strips a token it does not understand', () => {
    expect(
      parseRailDescription('Homepage rail: Award Winners [owner=demo-eng]'),
    ).toEqual({ title: 'Award Winners' })
  })

  it('ignores a shape a dashboard rule may not claim', () => {
    expect(
      parseRailDescription('Homepage rail: Award Winners [shape=top10]'),
    ).toEqual({ title: 'Award Winners' })
  })

  it('reports no title for a blank or missing description', () => {
    expect(parseRailDescription()).toEqual({})
    expect(parseRailDescription('   ')).toEqual({})
    expect(parseRailDescription('Homepage rail:')).toEqual({})
  })
})

describe('mergeHomepageRails', () => {
  it('returns the configured rails verbatim when the rules cannot be read', () => {
    expect(merge(null)).toBe(CONFIGURED_RAILS)
  })

  it('leaves the homepage exactly as configured for the live rule set', () => {
    const merged = merge(LIVE_RAIL_RULES)

    expect(railIds(merged)).toEqual(railIds(CONFIGURED_RAILS))
    expect(railTitles(merged)).toEqual(railTitles(CONFIGURED_RAILS))
  })

  it('ignores the query rules sharing the index', () => {
    expect(railIds(merge([...LIVE_RAIL_RULES, QUERY_RULE]))).toEqual(
      railIds(CONFIGURED_RAILS),
    )
  })

  it('retitles a pinned rail from its rule description', () => {
    const rules = LIVE_RAIL_RULES.map((rule) =>
      rule.objectID === 'homepage_me_sci_fi'
        ? { ...rule, description: 'Homepage rail: Worlds Elsewhere (~1,502)' }
        : rule,
    )

    const sciFi = merge(rules).find((rail) => rail.id === 'sci-fi')

    expect(sciFi?.title).toBe('Worlds Elsewhere')
  })

  it('keeps the config title when the rule description is blank or missing', () => {
    const rules = LIVE_RAIL_RULES.map((rule) =>
      rule.objectID === 'homepage_me_sci_fi'
        ? { ...rule, description: '   ' }
        : rule,
    )

    expect(merge(rules).find((rail) => rail.id === 'sci-fi')?.title).toBe(
      'Sci-Fi & Fantasy',
    )
  })

  it('keeps a pinned rail on its configured shape even when the rule names one', () => {
    const rules = LIVE_RAIL_RULES.map((rule) =>
      rule.objectID === 'homepage_me_top_10'
        ? {
            ...rule,
            description: 'Homepage rail: Top 10 Today [shape=backdrop]',
          }
        : rule,
    )

    const topTen = merge(rules).find((rail) => rail.id === 'top-10')

    expect(topTen?.shape).toBe('top10')
    expect(topTen?.title).toBe('Top 10 Today')
  })

  it('drops a pinned rail whose rule has gone', () => {
    const rules = LIVE_RAIL_RULES.filter(
      (rule) => rule.objectID !== 'homepage_me_blockbusters',
    )

    expect(railIds(merge(rules))).not.toContain('blockbusters')
    expect(merge(rules)).toHaveLength(CONFIGURED_RAILS.length - 1)
  })

  it('drops a pinned rail whose rule was disabled', () => {
    const rules = LIVE_RAIL_RULES.map((rule) =>
      rule.objectID === 'homepage_me_binge_series'
        ? { ...rule, enabled: false }
        : rule,
    )

    expect(railIds(merge(rules))).not.toContain('binge-series')
  })

  it('keeps the Recommend row, which has no rule of its own', () => {
    expect(railIds(merge(LIVE_RAIL_RULES))).toContain('because-you-watched')
    expect(railIds(merge([]))).toEqual(['because-you-watched'])
  })

  it('keeps a rail that declares no rule context', () => {
    const configured: MediaHomepageRailConfig[] = [
      {
        id: 'own-filters',
        title: 'Documentaries',
        filters: 'genres:Documentary',
      },
    ]

    expect(merge([], configured)).toEqual(configured)
  })

  it('appends a discovered rail after every configured row', () => {
    const discovered = createRailRule({
      context: 'homepage_me_award_winners',
      description: 'Homepage rail: Award Winners (~120 titles)',
      lastUpdate: 1788999999,
    })

    const merged = merge([...LIVE_RAIL_RULES, discovered])

    expect(merged).toHaveLength(CONFIGURED_RAILS.length + 1)
    expect(merged.at(-1)).toEqual({
      id: 'homepage_me_award_winners',
      title: 'Award Winners',
      filterRuleContexts: ['homepage_me_award_winners'],
      shape: 'poster',
    })
  })

  it('humanizes the context when a discovered rule has no description', () => {
    const merged = merge([
      createRailRule({ context: 'homepage_me_award_winners' }),
    ])

    expect(merged.at(-1)?.title).toBe('Award Winners')
  })

  it('takes a discovered rail shape from its description token', () => {
    const merged = merge([
      createRailRule({
        context: 'homepage_me_award_winners',
        description: 'Homepage rail: Award Winners [shape=spotlight]',
      }),
    ])

    expect(merged.at(-1)?.shape).toBe('spotlight')
  })

  it('orders discovered rails oldest first, so a new rule lands last', () => {
    const merged = merge([
      createRailRule({ context: 'homepage_me_newest', lastUpdate: 300 }),
      createRailRule({ context: 'homepage_me_oldest', lastUpdate: 100 }),
      createRailRule({ context: 'homepage_me_middle', lastUpdate: 200 }),
    ])

    expect(railIds(merged).slice(1)).toEqual([
      'homepage_me_oldest',
      'homepage_me_middle',
      'homepage_me_newest',
    ])
  })

  it('breaks a lastUpdate tie on objectID', () => {
    const merged = merge([
      createRailRule({ context: 'homepage_me_beta', lastUpdate: 100 }),
      createRailRule({ context: 'homepage_me_alpha', lastUpdate: 100 }),
    ])

    expect(railIds(merged).slice(1)).toEqual([
      'homepage_me_alpha',
      'homepage_me_beta',
    ])
  })

  it('caps the discovered rails at maxDiscovered', () => {
    const rules = Array.from({ length: 5 }, (_, index) =>
      createRailRule({
        context: `homepage_me_extra_${index}`,
        lastUpdate: 100 + index,
      }),
    )

    const merged = merge([...LIVE_RAIL_RULES, ...rules], CONFIGURED_RAILS, 2)

    expect(merged).toHaveLength(CONFIGURED_RAILS.length + 2)
    expect(railIds(merged).slice(-2)).toEqual([
      'homepage_me_extra_0',
      'homepage_me_extra_1',
    ])
  })

  it('does not rediscover a second context a rail already declares', () => {
    const configured: MediaHomepageRailConfig[] = [
      {
        id: 'top-10',
        title: 'Top 10 Today',
        shape: 'top10',
        filterRuleContexts: ['homepage_me_top_10', 'homepage_me_sci_fi'],
      },
    ]

    const rules = LIVE_RAIL_RULES.filter((rule) =>
      ['homepage_me_top_10', 'homepage_me_sci_fi'].includes(rule.objectID),
    )

    expect(railIds(merge(rules, configured))).toEqual(['top-10'])
  })

  it('never discovers a reserved context, such as the billboard', () => {
    const merged = merge(
      [...LIVE_RAIL_RULES, createRailRule({ context: 'homepage_me_billboard' })],
      CONFIGURED_RAILS,
      MAX_DISCOVERED,
      ['homepage_me_billboard'],
    )

    expect(railIds(merged)).toEqual(railIds(CONFIGURED_RAILS))
  })

  it('keeps the first rule when two claim the same context', () => {
    const merged = merge(
      [
        createRailRule({
          context: 'homepage_me_award_winners',
          objectID: 'first',
          description: 'Homepage rail: First Wins',
        }),
        createRailRule({
          context: 'homepage_me_award_winners',
          objectID: 'second',
          description: 'Homepage rail: Second Loses',
        }),
      ],
      [],
    )

    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('First Wins')
  })
})
