import type { MediaRailItem } from '@/app/media-entertainment/hitValues.types'
import type { MediaRail } from '@/app/media-entertainment/types'

/**
 * A fully-populated rail item. Every optional field is present so a test that
 * cares about an absent field can null it explicitly and read as intentional.
 */
export const createMediaRailItem = (
  overrides: Partial<MediaRailItem> = {},
): MediaRailItem => {
  return {
    objectID: 'movie_1',
    productUrl: '/media-entertainment/title/movie_1',
    title: 'Blade Runner 2049',
    type: 'movie',
    genres: ['Science Fiction', 'Drama', 'Thriller'],
    releaseYear: '2017',
    runtime: 164,
    maturityRating: 'R',
    poster: 'https://image.tmdb.org/t/p/w500/poster1.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w500/backdrop1.jpg',
    rank: 1,
    ...overrides,
  }
}

/** `count` items with distinct objectIDs, titles and contiguous 1-based ranks. */
export const createMediaRailItems = (count: number): MediaRailItem[] =>
  Array.from({ length: count }, (_, index) =>
    createMediaRailItem({
      objectID: `movie_${index + 1}`,
      productUrl: `/media-entertainment/title/movie_${index + 1}`,
      title: `Title ${index + 1}`,
      rank: index + 1,
    }),
  )

export const createMediaRail = (overrides: Partial<MediaRail> = {}): MediaRail => {
  return {
    id: 'blockbusters',
    title: 'Blockbuster Movies',
    items: createMediaRailItems(3),
    ...overrides,
  }
}
