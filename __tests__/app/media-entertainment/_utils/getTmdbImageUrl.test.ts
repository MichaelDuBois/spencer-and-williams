import { describe, expect, it } from 'vitest'

import { getTmdbImageUrl } from '@/app/media-entertainment/_utils/getTmdbImageUrl'

const W500 = 'https://image.tmdb.org/t/p/w500/kQjmbLLDkuTfnbNRJcvVDDQCFHt.jpg'

describe('getTmdbImageUrl', () => {
  it('re-points a w500 derivative at w1280', () => {
    expect(getTmdbImageUrl(W500, 'w1280')).toBe(
      'https://image.tmdb.org/t/p/w1280/kQjmbLLDkuTfnbNRJcvVDDQCFHt.jpg',
    )
  })

  it('re-points a w500 derivative at w780', () => {
    expect(getTmdbImageUrl(W500, 'w780')).toBe(
      'https://image.tmdb.org/t/p/w780/kQjmbLLDkuTfnbNRJcvVDDQCFHt.jpg',
    )
  })

  it('supports the original derivative', () => {
    expect(getTmdbImageUrl(W500, 'original')).toBe(
      'https://image.tmdb.org/t/p/original/kQjmbLLDkuTfnbNRJcvVDDQCFHt.jpg',
    )
  })

  it('rewrites any existing size segment, not just w500', () => {
    expect(
      getTmdbImageUrl('https://image.tmdb.org/t/p/original/abc.jpg', 'w780'),
    ).toBe('https://image.tmdb.org/t/p/w780/abc.jpg')
  })

  it('returns undefined for undefined', () => {
    expect(getTmdbImageUrl(undefined, 'w780')).toBeUndefined()
  })

  it('returns undefined for null and for an empty string', () => {
    expect(getTmdbImageUrl(null, 'w780')).toBeUndefined()
    expect(getTmdbImageUrl('', 'w780')).toBeUndefined()
  })

  it('leaves a non-TMDB URL untouched', () => {
    const url = 'https://cdn.example.com/artwork/poster1.jpg'
    expect(getTmdbImageUrl(url, 'w1280')).toBe(url)
  })

  it('leaves a non-TMDB URL untouched even when it contains a size-like segment', () => {
    const url = 'https://cdn.example.com/images/w500/poster1.jpg'
    expect(getTmdbImageUrl(url, 'w1280')).toBe(url)
  })

  it('does not corrupt a filename that contains the size token', () => {
    expect(
      getTmdbImageUrl('https://image.tmdb.org/t/p/w500/aw500b.jpg', 'w780'),
    ).toBe('https://image.tmdb.org/t/p/w780/aw500b.jpg')
  })

  it('rewrites only the size segment when a deeper path repeats it', () => {
    expect(
      getTmdbImageUrl('https://image.tmdb.org/t/p/w500/nested/w500/a.jpg', 'w780'),
    ).toBe('https://image.tmdb.org/t/p/w780/nested/w500/a.jpg')
  })
})
