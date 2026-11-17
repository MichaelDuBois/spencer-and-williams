import { describe, expect, it } from 'vitest'

import {
  DEFAULT_RAIL_HITS_PER_PAGE,
  buildRailRequests,
} from '@/app/media-entertainment/_utils/buildRailRequests'
import { getBrowseRails } from '@/app/media-entertainment/_utils/recommendRail'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaRailConfig } from '@/app/media-entertainment/types'

const indexName = 'media_ns'
// Attribute sets are resolved from the template elsewhere; the builder only has
// to forward whatever it is handed.
const attributesToRetrieve = ['objectID', 'title', 'poster_path']

const build = (
  specs: MediaRailConfig[],
  overrides: Partial<Parameters<typeof buildRailRequests>[0]> = {},
) =>
  buildRailRequests({
    specs,
    indexName,
    attributesToRetrieve,
    ...overrides,
  })

const rail = (overrides: Partial<MediaRailConfig> = {}): MediaRailConfig => {return {
  id: 'rail',
  title: 'Rail',
  ...overrides,
}}

describe('buildRailRequests', () => {
  it('emits one request per spec, in the same order', () => {
    const specs = [rail({ id: 'a' }), rail({ id: 'b' }), rail({ id: 'c' })]

    const requests = build(specs)

    expect(requests).toHaveLength(specs.length)
    expect(requests.map((request) => request.indexName)).toEqual([
      'media_ns',
      'media_ns',
      'media_ns',
    ])
  })

  it('keeps a spec with no options at all, so positional alignment holds', () => {
    const requests = build([rail()])

    expect(requests[0].params).toMatchObject({
      query: '',
      hitsPerPage: DEFAULT_RAIL_HITS_PER_PAGE,
    })
    // No client-side quality floor: an option-less spec queries unfiltered.
    expect(requests[0].params).not.toHaveProperty('filters')
  })

  // Facet-value narrowing goes through `filters` rather than a typed
  // `recordType` / `genres` / `certifications` triple, so the builder never
  // sends `facetFilters` at all.
  it('never emits facetFilters, facet-value predicates included', () => {
    const requests = build([
      rail({ filters: 'record_type:movie AND genres:"Sci-Fi & Fantasy"' }),
    ])

    expect(requests[0].params).not.toHaveProperty('facetFilters')
    expect(requests[0].params.filters).toBe(
      'record_type:movie AND genres:"Sci-Fi & Fantasy"',
    )
  })

  it("sends a spec's filters verbatim, wrapping nothing around them", () => {
    expect(build([rail({ filters: 'vote_count > 500' })])[0].params.filters).toBe(
      'vote_count > 500',
    )
  })

  // Nothing is AND'd in beneath a spec's filters any more, so the OR-group
  // nesting that Algolia used to reject with a 400 can't arise.
  it('passes a parenthesized OR group through untouched', () => {
    const filters = '(genres:"Science Fiction" OR genres:Fantasy) AND vote_count > 1000'

    expect(build([rail({ filters })])[0].params.filters).toBe(filters)
  })

  it('omits filters completely for a rule-driven spec with none of its own', () => {
    expect(
      build([rail({ ruleContexts: ['pinned'] })])[0].params,
    ).not.toHaveProperty('filters')
  })

  it('forwards ruleContexts when personalization is inactive', () => {
    const requests = build([rail({ ruleContexts: ['homepage_me_originals'] })], {
      personalization: {
        isActive: false,
        currentUserToken: '',
        currentOptionalFilters: [],
      },
    })

    expect(requests[0].params.ruleContexts).toEqual(['homepage_me_originals'])
  })

  it('drops ruleContexts when personalization is active', () => {
    const requests = build([rail({ ruleContexts: ['homepage_me_originals'] })], {
      personalization: {
        isActive: true,
        currentUserToken: 'persona-1',
        currentOptionalFilters: ['genres:Action<score=2>'],
      },
    })

    expect(requests[0].params).not.toHaveProperty('ruleContexts')
    expect(requests[0].params).toMatchObject({
      enablePersonalization: true,
      optionalFilters: ['genres:Action<score=2>'],
      getRankingInfo: true,
      userToken: 'persona-1',
    })
  })

  it('forwards filterRuleContexts even when personalization is active', () => {
    const requests = build(
      [rail({ filterRuleContexts: ['homepage_me_top_10'] })],
      {
        personalization: {
          isActive: true,
          currentUserToken: 'persona-1',
          currentOptionalFilters: ['genres:Action<score=2>'],
        },
      },
    )

    expect(requests[0].params.ruleContexts).toEqual(['homepage_me_top_10'])
    expect(requests[0].params).toMatchObject({
      enablePersonalization: true,
      getRankingInfo: true,
    })
  })

  it('keeps a rail context while dropping a pinning context under a persona', () => {
    const requests = build(
      [
        rail({
          ruleContexts: ['homepage_pinned'],
          filterRuleContexts: ['homepage_me_top_10'],
        }),
      ],
      { personalization: { isActive: true, currentUserToken: 'persona-1' } },
    )

    expect(requests[0].params.ruleContexts).toEqual(['homepage_me_top_10'])
  })

  it('never sends enablePersonalization without a persona', () => {
    const requests = build([rail()], {
      personalization: {
        isActive: false,
        currentUserToken: 'anonymous-insights-token',
        currentOptionalFilters: [],
      },
    })

    expect(requests[0].params).not.toHaveProperty('enablePersonalization')
    expect(requests[0].params).not.toHaveProperty('optionalFilters')
  })

  it('omits userToken when it is empty', () => {
    const requests = build([rail()], {
      personalization: {
        isActive: false,
        currentUserToken: '',
        currentOptionalFilters: [],
      },
    })

    expect(requests[0].params).not.toHaveProperty('userToken')
  })

  it('omits an empty ruleContexts array', () => {
    expect(build([rail({ ruleContexts: [] })])[0].params).not.toHaveProperty(
      'ruleContexts',
    )
  })

  it("prefers the spec's hitsPerPage over the default", () => {
    const requests = build([rail({ hitsPerPage: 10 }), rail()])

    expect(requests.map((request) => request.params.hitsPerPage)).toEqual([
      10,
      DEFAULT_RAIL_HITS_PER_PAGE,
    ])
  })

  it('falls back to 20 hits when the spec does not say', () => {
    expect(DEFAULT_RAIL_HITS_PER_PAGE).toBe(20)
    expect(build([rail()])[0].params.hitsPerPage).toBe(20)
  })

  it('turns highlighting off on every request it emits', () => {
    const requests = build([rail({ id: 'a' }), rail({ id: 'b' })])

    requests.forEach((request) => {
      expect(request.params.attributesToHighlight).toEqual([])
    })
  })

  it('sets clickAnalytics and the lean attribute set on every request', () => {
    const requests = build([rail({ id: 'a' }), rail({ id: 'b' })])

    requests.forEach((request) => {
      expect(request.params.clickAnalytics).toBe(true)
      expect(request.params.attributesToRetrieve).toEqual(attributesToRetrieve)
      expect(request.params).not.toHaveProperty('analytics')
    })
  })

  // Only the browse rails: the Recommend row shares `homepageRails` but has no
  // query, and it is filtered out before the batched search is built.
  describe('the configured rails', () => {
    const configuredRails = getBrowseRails(
      mediaEntertainmentConfig.homepageRails ?? [],
    )

    const requests = buildRailRequests({
      specs: configuredRails,
      indexName,
      attributesToRetrieve,
    })

    it('builds one request per configured browse rail', () => {
      expect(requests).toHaveLength(configuredRails.length)
    })

    it('leaves the Recommend row out of the batched search', () => {
      expect(configuredRails).toHaveLength(
        (mediaEntertainmentConfig.homepageRails?.length ?? 0) - 1,
      )
    })

    // Every row is merchandised by a dashboard rule, so the config carries a
    // context and no local predicates. A rail that grows one is either an
    // intentional escape hatch or a rule that was never authored — either way
    // it should be a deliberate edit here, not a silent drift.
    it('drives every rail from exactly one rule context', () => {
      configuredRails.forEach((configured) => {
        expect(configured.filterRuleContexts).toHaveLength(1)
      })
    })

    it('leaves every rail free of local query predicates', () => {
      configuredRails.forEach((configured) => {
        expect(configured.filters).toBeUndefined()
      })
    })

    // The rule's consequence is the entire selection: the request carries the
    // context and nothing else to narrow it.
    it('sends only the context on every rail request', () => {
      requests.forEach((request, index) => {
        expect(request.params.ruleContexts).toEqual(
          configuredRails[index].filterRuleContexts,
        )
        expect(request.params).not.toHaveProperty('filters')
        expect(request.params).not.toHaveProperty('facetFilters')
      })
    })

    it('keeps the rule contexts unique, so two rows cannot share a rule', () => {
      const contexts = configuredRails.flatMap(
        (configured) => configured.filterRuleContexts ?? [],
      )

      expect(new Set(contexts).size).toBe(contexts.length)
    })
  })
})
