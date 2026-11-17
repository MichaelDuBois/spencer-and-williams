import { describe, expect, it } from 'vitest'

import {
  BILLBOARD_QUERY,
  DEFAULT_BILLBOARD_LIMIT,
  getBillboardLimit,
  pickBillboardCandidates,
  resolveBillboardSource,
} from '@/app/media-entertainment/_utils/billboardSource'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'


describe('resolveBillboardSource', () => {
  it('orders the sources rules, curated, fallback', () => {
    const sources = resolveBillboardSource({
      ruleContexts: ['homepage_me_billboard'],
      objectIDs: ['movie_1', 'movie_2'],
      fallbackFilters: 'vote_count > 2000',
    })

    expect(sources.map((source) => source.kind)).toEqual([
      'rules',
      'curated',
      'fallback',
    ])
  })

  it('skips the rules source when no rule context is configured', () => {
    const sources = resolveBillboardSource({
      objectIDs: ['movie_1'],
      fallbackFilters: 'vote_count > 2000',
    })

    expect(sources.map((source) => source.kind)).toEqual([
      'curated',
      'fallback',
    ])
  })

  it('skips the curated source when no objectIDs are configured', () => {
    const sources = resolveBillboardSource({
      ruleContexts: ['homepage_me_billboard'],
      fallbackFilters: 'vote_count > 2000',
    })

    expect(sources.map((source) => source.kind)).toEqual(['rules', 'fallback'])
  })

  it('always keeps a fallback source, so the hero can never render empty', () => {
    const sources = resolveBillboardSource({})

    expect(sources.map((source) => source.kind)).toEqual(['fallback'])
    expect(sources[0]).not.toHaveProperty('filters')
  })

  it('sends no filters at all with the rules source, so pins cannot be gated', () => {
    const [rules] = resolveBillboardSource({
      ruleContexts: ['homepage_me_billboard'],
      fallbackFilters: 'vote_count > 2000 AND runtime > 0',
    })

    expect(rules).not.toHaveProperty('filters')
    expect(rules.ruleContexts).toEqual(['homepage_me_billboard'])
  })

  it('keeps the quality filters on the fallback source', () => {
    const sources = resolveBillboardSource({
      ruleContexts: ['homepage_me_billboard'],
      fallbackFilters: 'vote_count > 2000 AND runtime > 0',
    })
    const fallback = sources.at(-1)!

    expect(fallback.filters).toBe('vote_count > 2000 AND runtime > 0')
  })

  it('builds an escaped OR filter for the curated objectIDs and keeps their order', () => {
    const [curated] = resolveBillboardSource({
      objectIDs: ['movie_1', 'show_2'],
    })

    expect(curated.filters).toBe('objectID:"movie_1" OR objectID:"show_2"')
    expect(curated.objectIDs).toEqual(['movie_1', 'show_2'])
    expect(curated.hitsPerPage).toBe(2)
  })

  it('over-fetches at least 20 hits so client-side filtering has room', () => {
    const sources = resolveBillboardSource({ limit: 2 })

    expect(sources[0].hitsPerPage).toBe(20)
  })

  it('scales the over-fetch with a large limit', () => {
    const sources = resolveBillboardSource({ limit: 8 })

    expect(sources[0].hitsPerPage).toBe(32)
  })

  it('resolves the default billboard query to rules plus fallback', () => {
    const sources = resolveBillboardSource()

    expect(sources.map((source) => source.kind)).toEqual(['rules', 'fallback'])
    expect(sources[0].ruleContexts).toEqual(BILLBOARD_QUERY.ruleContexts)
    expect(sources.at(-1)!.filters).toBe(BILLBOARD_QUERY.fallbackFilters)
  })
})

describe('getBillboardLimit', () => {
  it('reads the passed limit', () => {
    expect(getBillboardLimit({ limit: 3 })).toBe(3)
  })

  it('falls back to the default for an unset or omitted query', () => {
    expect(getBillboardLimit({})).toBe(DEFAULT_BILLBOARD_LIMIT)
    expect(getBillboardLimit()).toBe(DEFAULT_BILLBOARD_LIMIT)
  })
})


const candidate = (
  overrides: Partial<MediaEntertainmentTitleHitValues> = {},
): MediaEntertainmentTitleHitValues => {return {
  objectID: 'movie_1',
  productUrl: '/media-entertainment/title/movie_1',
  title: 'The Avengers',
  tagline: 'Some assembly required.',
  overview: 'Earth’s mightiest heroes.',
  genres: ['Action'],
  backdrop: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
  maturityRating: 'PG-13',
  runtime: 143,
  releaseYear: '2012',
  ...overrides,
}}

const ids = (candidates: MediaEntertainmentTitleHitValues[]) =>
  candidates.map((entry) => entry.objectID)

describe('pickBillboardCandidates', () => {
  it('drops a candidate with no backdrop', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'no_backdrop', backdrop: undefined }),
        candidate({ objectID: 'ok' }),
      ],
    })

    expect(ids(picked)).toEqual(['ok'])
  })

  it('drops a candidate with no title', () => {
    const picked = pickBillboardCandidates({
      candidates: [candidate({ objectID: 'no_title', title: '' })],
    })

    expect(picked).toEqual([])
  })

  it('drops a candidate with neither tagline nor overview', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'no_copy', tagline: undefined, overview: undefined }),
        candidate({ objectID: 'overview_only', tagline: undefined }),
      ],
    })

    expect(ids(picked)).toEqual(['overview_only'])
  })

  it('drops a candidate with an empty genre list', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'no_genres', genres: [] }),
        candidate({ objectID: 'undefined_genres', genres: undefined }),
        candidate({ objectID: 'ok' }),
      ],
    })

    expect(ids(picked)).toEqual(['ok'])
  })

  it('keeps a candidate with no maturityRating but ranks it lower', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'no_cert', maturityRating: undefined }),
        candidate({ objectID: 'complete' }),
      ],
    })

    expect(ids(picked)).toEqual(['complete', 'no_cert'])
  })

  it('ranks a zero runtime and a missing year below a complete candidate', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'no_runtime', runtime: 0 }),
        candidate({ objectID: 'no_year', releaseYear: undefined }),
        candidate({ objectID: 'complete' }),
      ],
    })

    expect(ids(picked)[0]).toBe('complete')
    expect(ids(picked)).toHaveLength(3)
  })

  it('dedupes by objectID across the curated and fallback sets, keeping the first', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'movie_1', title: 'Curated copy' }),
        candidate({ objectID: 'movie_1', title: 'Fallback copy' }),
        candidate({ objectID: 'movie_2' }),
      ],
    })

    expect(ids(picked)).toEqual(['movie_1', 'movie_2'])
    expect(picked[0].title).toBe('Curated copy')
  })

  it('respects the limit', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'a' }),
        candidate({ objectID: 'b' }),
        candidate({ objectID: 'c' }),
      ],
      limit: 2,
    })

    expect(ids(picked)).toEqual(['a', 'b'])
  })

  it('defaults to five slides', () => {
    const candidates = Array.from({ length: 8 }, (_, index) =>
      candidate({ objectID: `movie_${index}` }),
    )

    expect(pickBillboardCandidates({ candidates })).toHaveLength(5)
  })

  it('is deterministic across two identical calls', () => {
    const candidates = [
      candidate({ objectID: 'a', maturityRating: undefined }),
      candidate({ objectID: 'b' }),
      candidate({ objectID: 'c', runtime: 0 }),
      candidate({ objectID: 'd' }),
      candidate({ objectID: 'e', releaseYear: undefined }),
    ]

    expect(ids(pickBillboardCandidates({ candidates }))).toEqual(
      ids(pickBillboardCandidates({ candidates })),
    )
  })

  it('breaks score ties by input order, so equal candidates keep source precedence', () => {
    const candidates = [
      candidate({ objectID: 'first' }),
      candidate({ objectID: 'second' }),
      candidate({ objectID: 'third' }),
    ]

    expect(ids(pickBillboardCandidates({ candidates }))).toEqual([
      'first',
      'second',
      'third',
    ])
  })

  // An `objectID:"a" OR objectID:"b"` query returns hits in index ranking
  // order, not config order.
  it('puts curated IDs in config order regardless of the order they came back in', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'movie_3' }),
        candidate({ objectID: 'movie_1' }),
        candidate({ objectID: 'movie_2' }),
      ],
      order: ['movie_1', 'movie_2', 'movie_3'],
    })

    expect(ids(picked)).toEqual(['movie_1', 'movie_2', 'movie_3'])
  })

  it('keeps a curated ID ahead of a better-scored uncurated one', () => {
    const picked = pickBillboardCandidates({
      candidates: [
        candidate({ objectID: 'fallback_hit' }),
        candidate({ objectID: 'curated_hit', maturityRating: undefined }),
      ],
      order: ['curated_hit'],
    })

    expect(ids(picked)).toEqual(['curated_hit', 'fallback_hit'])
  })

  it('preserves fields the caller stamped onto the candidates', () => {
    const picked = pickBillboardCandidates({
      candidates: [{ ...candidate(), rank: 7, __queryID: 'q1' }],
    })

    expect(picked[0].__queryID).toBe('q1')
  })

  it('returns an empty list for no candidates', () => {
    expect(pickBillboardCandidates({ candidates: [] })).toEqual([])
  })
})
