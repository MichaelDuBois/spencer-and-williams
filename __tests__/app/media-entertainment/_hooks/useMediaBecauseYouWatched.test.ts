import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaBecauseYouWatched } from '@/app/media-entertainment/_hooks/useMediaBecauseYouWatched'
import type { MediaProgressTitle } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'

import { createMediaRailItem } from '@tests/app/media-entertainment/_helpers/railFixtures'

const railsResult = {
  myListTitles: [] as MediaTitleHit[],
  continueWatchingTitles: [] as MediaProgressTitle[],
  isPending: false,
}

const recommendResult = {
  data: undefined as Record<string, unknown[]> | undefined,
  isPending: false,
}

const useRecommendMock = vi.fn(
  (_models: string[], _objectID?: string) => recommendResult,
)

vi.mock('@/app/media-entertainment/_hooks/useMediaWatchRails', () => {
  return {
    useMediaWatchRails: () => railsResult,
  }
})

vi.mock('@/hooks/useRecommend', () => {
  return {
    useRecommend: (models: string[], objectID?: string) =>
      useRecommendMock(models, objectID),
  }
})

const indexHit = (objectID: string, title: string) => {
  return { objectID, title, record_type: 'movie', poster_path: '/poster.jpg' }
}

const partWatched = (objectID: string, title: string): MediaProgressTitle => {
  return { ...createMediaRailItem({ objectID, title }), progress: 0.4 }
}

const setRecommendations = (hits: Record<string, unknown>[]) => {
  recommendResult.data = { 'related-products': hits }
}

/** The objectID `useRecommend` was seeded with on the latest render. */
const seededObjectID = () => useRecommendMock.mock.lastCall?.[1]

describe('useMediaBecauseYouWatched', () => {
  beforeEach(() => {
    railsResult.continueWatchingTitles = []
    recommendResult.data = undefined
    recommendResult.isPending = false
    useRecommendMock.mockClear()
  })

  it('has no rail while nothing is part-watched', () => {
    const { result } = renderHook(() => useMediaBecauseYouWatched())

    expect(result.current.rail).toBeNull()
    expect(seededObjectID()).toBeUndefined()
  })

  it('names the row after the newest part-watched title', () => {
    railsResult.continueWatchingTitles = [
      partWatched('movie_299536', 'Avengers: Infinity War'),
      partWatched('movie_1726', 'Iron Man'),
    ]
    setRecommendations([indexHit('movie_299534', 'Avengers: Endgame')])

    const { result } = renderHook(() => useMediaBecauseYouWatched())

    expect(result.current.rail?.title).toBe(
      'Because you watched Avengers: Infinity War',
    )
    expect(seededObjectID()).toBe('movie_299536')
    expect(result.current.rail?.items.map((item) => item.title)).toEqual([
      'Avengers: Endgame',
    ])
  })

  it('drops the seed out of its own recommendations', () => {
    railsResult.continueWatchingTitles = [partWatched('movie_1726', 'Iron Man')]
    setRecommendations([
      indexHit('movie_1726', 'Iron Man'),
      indexHit('movie_68721', 'Iron Man 3'),
    ])

    const { result } = renderHook(() => useMediaBecauseYouWatched())

    expect(result.current.rail?.items.map((item) => item.objectID)).toEqual([
      'movie_68721',
    ])
  })

  it('ranks the items contiguously from 1 after the seed is dropped', () => {
    railsResult.continueWatchingTitles = [partWatched('movie_1726', 'Iron Man')]
    setRecommendations([
      indexHit('movie_1726', 'Iron Man'),
      indexHit('movie_68721', 'Iron Man 3'),
      indexHit('movie_10138', 'Iron Man 2'),
    ])

    const { result } = renderHook(() => useMediaBecauseYouWatched())

    expect(result.current.rail?.items.map((item) => item.rank)).toEqual([1, 2])
  })

  it('renders no rail, and sends no request, when the seed has no title', () => {
    railsResult.continueWatchingTitles = [partWatched('movie_1726', '')]

    const { result } = renderHook(() => useMediaBecauseYouWatched())

    expect(result.current.rail).toBeNull()
    expect(seededObjectID()).toBeUndefined()
  })

  it('leaves the rail empty when the model returns nothing', () => {
    railsResult.continueWatchingTitles = [partWatched('movie_1726', 'Iron Man')]
    setRecommendations([])

    const { result } = renderHook(() => useMediaBecauseYouWatched())

    expect(result.current.rail?.items).toEqual([])
  })

  it('reports pending only while a seed exists', () => {
    recommendResult.isPending = true

    const { result: withoutSeed } = renderHook(() =>
      useMediaBecauseYouWatched(),
    )
    expect(withoutSeed.current.isPending).toBe(false)

    railsResult.continueWatchingTitles = [partWatched('movie_1726', 'Iron Man')]

    const { result: withSeed } = renderHook(() => useMediaBecauseYouWatched())
    expect(withSeed.current.isPending).toBe(true)
  })
})
