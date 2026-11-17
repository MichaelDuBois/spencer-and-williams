import { describe, expect, it } from 'vitest'

import { normalizeSeasons } from '@/app/media-entertainment/_utils/normalizeSeasons'

const PREFIX = 'https://image.tmdb.org/t/p/w500'

describe('normalizeSeasons', () => {
  it('keeps the number, name, episode count and poster', () => {
    const raw = [
      {
        season_number: 1,
        name: 'Season 1',
        episode_count: 8,
        poster_path: '/s1.jpg',
        overview: 'Strange things are afoot in Hawkins.',
        air_date: 1468533600000,
      },
    ]

    expect(normalizeSeasons(raw, PREFIX)).toEqual([
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 8,
        poster: `${PREFIX}/s1.jpg`,
      },
    ])
  })

  it('falls back to "Season N" when the name is missing or empty', () => {
    const raw = [
      { season_number: 2 },
      { season_number: 3, name: '' },
    ]

    expect(normalizeSeasons(raw, PREFIX)).toEqual([
      { seasonNumber: 2, name: 'Season 2' },
      { seasonNumber: 3, name: 'Season 3' },
    ])
  })

  it('omits the episode count when TMDB reports zero', () => {
    const [season] =
      normalizeSeasons([{ season_number: 1, episode_count: 0 }], PREFIX) ?? []

    expect(season).toEqual({ seasonNumber: 1, name: 'Season 1' })
  })

  it('omits the poster when there is no poster path', () => {
    const [season] = normalizeSeasons([{ season_number: 1 }], PREFIX) ?? []

    expect(season?.poster).toBeUndefined()
  })

  it('sorts out-of-order seasons ascending', () => {
    const raw = [
      { season_number: 3 },
      { season_number: 1 },
      { season_number: 2 },
    ]

    expect(
      normalizeSeasons(raw, PREFIX)?.map((season) => season.seasonNumber),
    ).toEqual([1, 2, 3])
  })

  it('keeps season 0, which TMDB uses for specials', () => {
    const raw = [{ season_number: 1 }, { season_number: 0, name: 'Specials' }]

    expect(normalizeSeasons(raw, PREFIX)).toEqual([
      { seasonNumber: 0, name: 'Specials' },
      { seasonNumber: 1, name: 'Season 1' },
    ])
  })

  it('drops entries with no numeric season number', () => {
    expect(
      normalizeSeasons([{ name: 'Season 1' }, 'nope', null], PREFIX),
    ).toBeUndefined()
  })

  it('drops a NaN season number rather than labelling it "Season NaN"', () => {
    expect(normalizeSeasons([{ season_number: NaN }], PREFIX)).toBeUndefined()
  })

  it('returns undefined for anything that is not an array', () => {
    expect(normalizeSeasons(undefined, PREFIX)).toBeUndefined()
    expect(normalizeSeasons('Season 1', PREFIX)).toBeUndefined()
  })
})
