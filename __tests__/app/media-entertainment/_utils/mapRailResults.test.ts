import { describe, expect, it } from 'vitest'

import {
  mapMultifeedRails,
  mapRailResults,
  toRailItems,
} from '@/app/media-entertainment/_utils/mapRailResults'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaRailConfig } from '@/app/media-entertainment/types'

const slug = 'media-entertainment'
const template = mediaEntertainmentConfig.algolia.primaryIndex.template!

const rails: MediaRailConfig[] = [
  { id: 'top-10', title: 'Top 10 Today', shape: 'top10' },
  { id: 'new-releases', title: 'New Releases', shape: 'backdrop' },
  { id: 'blockbusters', title: 'Blockbuster Movies' },
]

const hit = (objectID: string, title: string) => {return { objectID, title }}

describe('mapRailResults', () => {
  it('aligns results positionally with the rails that produced them', () => {
    const results = [
      { hits: [hit('movie_1', 'Avengers')], queryID: 'q-top-10' },
      { hits: [hit('movie_2', 'Frankenstein')], queryID: 'q-new-releases' },
      { hits: [hit('movie_3', 'Avatar')], queryID: 'q-blockbusters' },
    ]

    const mapped = mapRailResults({ rails, results, template, slug })

    expect(mapped.map((rail) => rail.id)).toEqual([
      'top-10',
      'new-releases',
      'blockbusters',
    ])
    expect(mapped.map((rail) => rail.items[0].title)).toEqual([
      'Avengers',
      'Frankenstein',
      'Avatar',
    ])
    expect(mapped.map((rail) => rail.items[0].__queryID)).toEqual([
      'q-top-10',
      'q-new-releases',
      'q-blockbusters',
    ])
  })

  it('preserves the rail config on the mapped rail', () => {
    const mapped = mapRailResults({ rails, results: [], template, slug })

    expect(mapped[0]).toMatchObject({
      id: 'top-10',
      title: 'Top 10 Today',
      shape: 'top10',
    })
  })

  it('yields items: [] for a missing result rather than throwing', () => {
    const mapped = mapRailResults({
      rails,
      results: [{ hits: [hit('movie_1', 'Avengers')] }],
      template,
      slug,
    })

    expect(mapped).toHaveLength(3)
    expect(mapped[1].items).toEqual([])
    expect(mapped[2].items).toEqual([])
  })

  it('yields items: [] for a result with no hits key', () => {
    const mapped = mapRailResults({
      rails: [rails[0]],
      results: [{ facetHits: [] }],
      template,
      slug,
    })

    expect(mapped[0].items).toEqual([])
  })

  it('stamps a 1-based contiguous rank and position', () => {
    const items = toRailItems({
      result: {
        hits: [
          hit('movie_1', 'One'),
          hit('movie_2', 'Two'),
          hit('movie_3', 'Three'),
        ],
      },
      template,
      slug,
    })

    expect(items.map((item) => item.rank)).toEqual([1, 2, 3])
    expect(items.map((item) => item.__position)).toEqual([1, 2, 3])
  })

  it('omits __queryID when the result carries none', () => {
    const items = toRailItems({
      result: { hits: [hit('movie_1', 'One')] },
      template,
      slug,
    })

    expect(items[0]).not.toHaveProperty('__queryID')
  })

  it('builds productUrl through the extractor and the vertical slug', () => {
    const items = toRailItems({
      result: { hits: [hit('movie_1', 'One')] },
      template,
      slug,
    })

    expect(items[0].productUrl).toBe('/media-entertainment/title/movie_1')
  })
})

describe('mapMultifeedRails', () => {
  const feedHit = (objectID: string, title: string, position: number) => {
    return { objectID, title, __position: position, __queryID: 'q-feed' }
  }

  it('maps each feed to a rail keyed and titled by the feed', () => {
    const rails = mapMultifeedRails({
      feeds: [
        {
          feedId: 'Star Wars Series',
          title: 'Star Wars Series',
          indexName: 'media_ns',
          hits: [feedHit('show_1', 'The Mandalorian', 1)],
        },
        {
          feedId: 'Star Wars Movies',
          title: 'Star Wars Movies',
          indexName: 'media_ns',
          hits: [feedHit('movie_1', 'A New Hope', 1)],
        },
      ],
      template,
      slug,
    })

    expect(
      rails.map((rail) => {
        return { id: rail.id, title: rail.title }
      }),
    ).toEqual([
      { id: 'Star Wars Series', title: 'Star Wars Series' },
      { id: 'Star Wars Movies', title: 'Star Wars Movies' },
    ])
    expect(rails[1].items[0].title).toBe('A New Hope')
  })

  it('stamps rank, position and the feed queryID on every item', () => {
    const [rail] = mapMultifeedRails({
      feeds: [
        {
          feedId: 'Recent Horror',
          title: 'Recent Horror',
          indexName: 'media_ns',
          hits: [feedHit('movie_1', 'One', 1), feedHit('movie_2', 'Two', 2)],
        },
      ],
      template,
      slug,
    })

    expect(
      rail.items.map((item) => {
        return {
          rank: item.rank,
          __position: item.__position,
          __queryID: item.__queryID,
        }
      }),
    ).toEqual([
      { rank: 1, __position: 1, __queryID: 'q-feed' },
      { rank: 2, __position: 2, __queryID: 'q-feed' },
    ])
  })
})
