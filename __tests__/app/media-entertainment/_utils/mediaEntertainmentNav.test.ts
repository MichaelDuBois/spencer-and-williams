import { describe, expect, it } from 'vitest'

import {
  isNavItemActive,
  MEDIA_NAV_ITEMS,
} from '@/app/media-entertainment/_utils/mediaEntertainmentNav'

const itemFor = (label: string) =>
  MEDIA_NAV_ITEMS.find((item) => item.label === label)!

describe('MEDIA_NAV_ITEMS', () => {
  it('runs Home, then the configured sections, then My List', () => {
    expect(MEDIA_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Home',
      'TV Series',
      'Movies',
      'New & Popular',
      'My List',
    ])
  })

  it('routes every item', () => {
    expect(itemFor('Home').href).toBe('/media-entertainment')
    expect(itemFor('Movies').href).toBe('/media-entertainment/search/movies')
    expect(itemFor('My List').href).toBe('/media-entertainment/my-list')
  })
})

describe('isNavItemActive', () => {
  it('marks the item whose route is open', () => {
    expect(
      isNavItemActive(itemFor('Movies'), '/media-entertainment/search/movies'),
    ).toBe(true)
  })

  it('ignores a trailing slash', () => {
    expect(isNavItemActive(itemFor('Home'), '/media-entertainment/')).toBe(true)
  })

  it('leaves Home inactive on a nested route', () => {
    expect(isNavItemActive(itemFor('Home'), '/media-entertainment/search')).toBe(
      false,
    )
    expect(
      isNavItemActive(itemFor('Home'), '/media-entertainment/title/movie_1'),
    ).toBe(false)
  })

  it('matches no item on the plain search page', () => {
    const active = MEDIA_NAV_ITEMS.filter((item) =>
      isNavItemActive(item, '/media-entertainment/search'),
    )

    expect(active).toEqual([])
  })

  it('never marks an unrouted item active', () => {
    expect(isNavItemActive({ label: 'Unrouted' }, '/media-entertainment')).toBe(
      false,
    )
  })

  it('marks My List active on its own route', () => {
    expect(
      isNavItemActive(itemFor('My List'), '/media-entertainment/my-list'),
    ).toBe(true)
  })

  it('handles a null pathname', () => {
    expect(isNavItemActive(itemFor('Home'), null)).toBe(false)
  })
})
