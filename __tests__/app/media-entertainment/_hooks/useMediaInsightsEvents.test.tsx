import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaInsightsEvents } from '@/app/media-entertainment/_hooks/useMediaInsightsEvents'
import { track } from '@/lib/analytics/track'

import { createMediaRailItem } from '@tests/app/media-entertainment/_helpers/railFixtures'

const sendConversionEvent = vi.fn()

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendConversionEvent }
    },
  }
})

describe('useMediaInsightsEvents', () => {
  beforeEach(() => {
    sendConversionEvent.mockClear()
    vi.mocked(track).mockClear()
  })

  it('names the add-to-list conversion and attributes it to the query', () => {
    const { result } = renderHook(() => useMediaInsightsEvents())

    result.current.sendAddToListEvent(
      createMediaRailItem({ __queryID: 'query-1' }),
    )

    expect(sendConversionEvent).toHaveBeenCalledWith({
      objectID: 'movie_1',
      eventName: 'Title Added to My List',
      queryID: 'query-1',
    })
  })

  it('names the play conversion', () => {
    const { result } = renderHook(() => useMediaInsightsEvents())

    result.current.sendPlayEvent(createMediaRailItem({ __queryID: 'query-1' }))

    expect(sendConversionEvent).toHaveBeenCalledWith({
      objectID: 'movie_1',
      eventName: 'Title Played',
      queryID: 'query-1',
    })
  })

  it('leaves the queryID undefined where no query surfaced the title', () => {
    const { result } = renderHook(() => useMediaInsightsEvents())

    result.current.sendPlayEvent(createMediaRailItem())

    expect(sendConversionEvent).toHaveBeenCalledWith(
      expect.objectContaining({ queryID: undefined }),
    )
  })

  it('tracks one title_added_to_list per add, attributed to the query', () => {
    const { result } = renderHook(() => useMediaInsightsEvents())

    result.current.sendAddToListEvent(
      createMediaRailItem({ __queryID: 'query-1' }),
    )

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('title_added_to_list', {
      objectID: 'movie_1',
      queryID: 'query-1',
    })
  })

  it('tracks one title_played per play, attributed to the query', () => {
    const { result } = renderHook(() => useMediaInsightsEvents())

    result.current.sendPlayEvent(createMediaRailItem({ __queryID: 'query-1' }))

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('title_played', {
      objectID: 'movie_1',
      queryID: 'query-1',
    })
  })

  it('omits the queryID from the tracked event where no query surfaced the title', () => {
    const { result } = renderHook(() => useMediaInsightsEvents())

    result.current.sendAddToListEvent(createMediaRailItem())
    result.current.sendPlayEvent(createMediaRailItem())

    expect(vi.mocked(track).mock.calls).toEqual([
      ['title_added_to_list', { objectID: 'movie_1' }],
      ['title_played', { objectID: 'movie_1' }],
    ])
  })
})
