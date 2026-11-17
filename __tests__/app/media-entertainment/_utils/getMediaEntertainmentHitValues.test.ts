import { describe, expect, it } from 'vitest'

import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'

const slug = 'media-entertainment'
const template = mediaEntertainmentConfig.algolia.primaryIndex.template!

describe('getMediaEntertainmentHitValues', () => {
  it('builds the title detail URL from the objectID', () => {
    expect(
      getMediaEntertainmentHitValues({ objectID: 'movie_1' }, template, slug)
        .productUrl,
    ).toBe('/media-entertainment/title/movie_1')
  })

  it('prefixes both poster and backdrop with the TMDB CDN', () => {
    const hit = {
      objectID: 'movie_1',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
    }
    const values = getMediaEntertainmentHitValues(hit, template, slug)
    expect(values.poster).toBe('https://image.tmdb.org/t/p/w500/poster.jpg')
    expect(values.backdrop).toBe(
      'https://image.tmdb.org/t/p/w500/backdrop.jpg',
    )
  })

  it('maps core scalar and array attributes', () => {
    const hit = {
      objectID: 'movie_1',
      title: 'The Avengers',
      record_type: 'movie',
      genres: ['Action', 'Science Fiction'],
      release_date_str: '2012',
      vote_average: 7.8,
      certification: 'PG-13',
    }
    const values = getMediaEntertainmentHitValues(hit, template, slug)
    expect(values.title).toBe('The Avengers')
    expect(values.type).toBe('movie')
    expect(values.genres).toEqual(['Action', 'Science Fiction'])
    expect(values.releaseYear).toBe('2012')
    expect(values.rating).toBe(7.8)
    expect(values.maturityRating).toBe('PG-13')
  })

  it('leaves image fields undefined when absent', () => {
    const values = getMediaEntertainmentHitValues(
      { objectID: 'movie_1' },
      template,
      slug,
    )
    expect(values.poster).toBeUndefined()
    expect(values.backdrop).toBeUndefined()
  })

  it('passes through the directors object array unchanged', () => {
    const values = getMediaEntertainmentHitValues(
      { objectID: 'movie_1', directors: [{ name: 'Joss Whedon' }] },
      template,
      slug,
    )
    expect(values.directors).toEqual([{ name: 'Joss Whedon' }])
  })

  it('normalizes cast, resolving portraits against the CDN prefix', () => {
    const hit = {
      objectID: 'movie_1',
      cast: [
        {
          name: 'Robert Downey Jr.',
          character: 'Tony Stark',
          profile_path: '/rdj.jpg',
          facet: 'Robert Downey Jr.||/rdj.jpg',
        },
      ],
    }
    const values = getMediaEntertainmentHitValues(hit, template, slug)
    expect(values.cast).toEqual([
      {
        name: 'Robert Downey Jr.',
        character: 'Tony Stark',
        profileImage: 'https://image.tmdb.org/t/p/w500/rdj.jpg',
      },
    ])
  })

  it('normalizes seasons, resolving posters against the CDN prefix', () => {
    const hit = {
      objectID: 'show_1',
      record_type: 'show',
      seasons: [
        {
          season_number: 1,
          name: 'Season 1',
          episode_count: 8,
          poster_path: '/s1.jpg',
          overview: 'Strange things are afoot in Hawkins.',
        },
      ],
    }
    const values = getMediaEntertainmentHitValues(hit, template, slug)
    expect(values.seasons).toEqual([
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 8,
        poster: 'https://image.tmdb.org/t/p/w500/s1.jpg',
      },
    ])
  })

  it('maps the season and episode counts a series carries', () => {
    const values = getMediaEntertainmentHitValues(
      {
        objectID: 'show_1',
        record_type: 'show',
        number_of_seasons: 5,
        number_of_episodes: 42,
      },
      template,
      slug,
    )
    expect(values.seasonCount).toBe(5)
    expect(values.episodeCount).toBe(42)
  })
})
