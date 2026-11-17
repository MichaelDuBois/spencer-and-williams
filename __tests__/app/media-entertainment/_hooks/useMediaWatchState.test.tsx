import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  advanceProgress,
  INITIAL_PROGRESS,
  MAX_PROGRESS,
  PROGRESS_STEP,
  useMediaWatchState,
} from '@/app/media-entertainment/_hooks/useMediaWatchState'
import { PERSONAS } from '@/app/media-entertainment/personas'
import { track } from '@/lib/analytics/track'
import { mediaTitleRecordsAtom } from '@/stores/mediaEntertainment'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'

import { createMediaRailItem } from '@tests/app/media-entertainment/_helpers/railFixtures'
import { buildJotaiWrapper, createTestStore } from '@tests/helpers/jotai-wrapper'

const sendConversionEvent = vi.fn()

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendConversionEvent }
    },
  }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

const [marvelFan, kidsFamily] = PERSONAS

const renderWatchState = (store = createTestStore()) => {
  const view = renderHook(() => useMediaWatchState(), {
    wrapper: buildJotaiWrapper(store),
  })

  return { ...view, store }
}

describe('useMediaWatchState', () => {
  beforeEach(() => {
    // The atom is module-cached and sessionStorage-backed, so without this a
    // toggle in one test leaks into the next.
    sessionStorage.clear()
    sendConversionEvent.mockClear()
    vi.mocked(track).mockClear()
    // The personalization atoms live on the global store, so reset them here.
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
  })

  it('starts an anonymous viewer with both lists empty', () => {
    const { result } = renderWatchState()

    expect(result.current.profileKey).toBe('anonymous')
    expect(result.current.myList).toEqual([])
    expect(result.current.continueWatching).toEqual([])
  })

  it('starts a seeded persona from its configured lists', () => {
    personalizationStore.set(activePersonaAtom, marvelFan)
    const { result } = renderWatchState()

    expect(result.current.profileKey).toBe('marvel-fan')
    expect(result.current.myList.length).toBeGreaterThan(0)
    expect(result.current.continueWatching.length).toBeGreaterThan(0)
  })

  it('adds and removes a title, and reports membership', () => {
    const title = createMediaRailItem()
    const { result } = renderWatchState()

    act(() => result.current.toggleMyList(title))

    expect(result.current.isInMyList('movie_1')).toBe(true)
    expect(result.current.myList).toEqual([
      { objectID: 'movie_1', addedAt: expect.any(Number) },
    ])

    act(() => result.current.toggleMyList(title))

    expect(result.current.isInMyList('movie_1')).toBe(false)
    expect(result.current.myList).toEqual([])
  })

  it('sends a conversion event on the add but not on the remove', () => {
    const title = createMediaRailItem({ __queryID: 'query-1' })
    const { result } = renderWatchState()

    act(() => result.current.toggleMyList(title))
    act(() => result.current.toggleMyList(title))

    expect(sendConversionEvent).toHaveBeenCalledTimes(1)
    expect(sendConversionEvent).toHaveBeenCalledWith({
      objectID: 'movie_1',
      eventName: 'Title Added to My List',
      queryID: 'query-1',
    })
  })

  it('tracks the add once and leaves the remove untracked', () => {
    const title = createMediaRailItem({ __queryID: 'query-1' })
    const { result } = renderWatchState()

    act(() => result.current.toggleMyList(title))
    act(() => result.current.toggleMyList(title))

    expect(vi.mocked(track).mock.calls).toEqual([
      ['title_added_to_list', { objectID: 'movie_1', queryID: 'query-1' }],
    ])
  })

  it('tracks one title_played per Play', () => {
    const title = createMediaRailItem()
    const { result } = renderWatchState()

    act(() => result.current.markInProgress(title))
    act(() => result.current.markInProgress(title))

    expect(vi.mocked(track).mock.calls).toEqual([
      ['title_played', { objectID: 'movie_1' }],
      ['title_played', { objectID: 'movie_1' }],
    ])
  })

  it('caches the hit values so a rail can paint the title without a lookup', () => {
    const title = createMediaRailItem()
    const { result, store } = renderWatchState()

    act(() => result.current.toggleMyList(title))

    expect(store.get(mediaTitleRecordsAtom).movie_1).toEqual(title)
  })

  it('starts progress on the first Play and advances it on the next', () => {
    const title = createMediaRailItem()
    const { result } = renderWatchState()

    act(() => result.current.markInProgress(title))
    expect(result.current.continueWatching[0].progress).toBe(INITIAL_PROGRESS)

    act(() => result.current.markInProgress(title))
    expect(result.current.continueWatching[0].progress).toBe(
      INITIAL_PROGRESS + PROGRESS_STEP,
    )
    expect(result.current.continueWatching).toHaveLength(1)
  })

  it('moves a replayed title back to the front of the row', () => {
    const first = createMediaRailItem({ objectID: 'movie_1' })
    const second = createMediaRailItem({ objectID: 'movie_2' })
    const { result } = renderWatchState()

    act(() => result.current.markInProgress(first))
    act(() => result.current.markInProgress(second))
    act(() => result.current.markInProgress(first))

    expect(
      result.current.continueWatching.map((entry) => entry.objectID),
    ).toEqual(['movie_1', 'movie_2'])
  })

  it('drops a title out of Continue Watching on request', () => {
    const title = createMediaRailItem()
    const { result } = renderWatchState()

    act(() => result.current.markInProgress(title))
    act(() => result.current.removeFromContinueWatching('movie_1'))

    expect(result.current.continueWatching).toEqual([])
  })

  it('keeps each profile in its own bucket', () => {
    const title = createMediaRailItem()
    personalizationStore.set(activePersonaAtom, marvelFan)
    const { result } = renderWatchState()

    act(() => result.current.toggleMyList(title))
    expect(result.current.isInMyList('movie_1')).toBe(true)

    act(() => personalizationStore.set(activePersonaAtom, kidsFamily))
    expect(result.current.profileKey).toBe('kids-family')
    expect(result.current.isInMyList('movie_1')).toBe(false)

    act(() => personalizationStore.set(activePersonaAtom, marvelFan))
    expect(result.current.isInMyList('movie_1')).toBe(true)
  })

  it('keeps realtime out of the anonymous bucket, though neither has a persona', () => {
    const title = createMediaRailItem()
    personalizationStore.set(realtimePersoEnabledAtom, true)
    const { result } = renderWatchState()

    expect(result.current.profileKey).toBe('realtime')

    act(() => result.current.toggleMyList(title))
    expect(result.current.isInMyList('movie_1')).toBe(true)

    act(() => personalizationStore.set(realtimePersoEnabledAtom, false))
    expect(result.current.profileKey).toBe('anonymous')
    expect(result.current.isInMyList('movie_1')).toBe(false)
  })
})

describe('advanceProgress', () => {
  it('opens at the initial progress for a title never played', () => {
    expect(advanceProgress(undefined)).toBe(INITIAL_PROGRESS)
  })

  it('steps an existing progress forward', () => {
    expect(advanceProgress(0.5)).toBe(0.5 + PROGRESS_STEP)
  })

  it('never reaches 1, which would drop the title out of the row', () => {
    expect(advanceProgress(0.99)).toBe(MAX_PROGRESS)
  })
})
