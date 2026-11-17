import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaWatchRails } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { mediaTitleRecordsAtom } from '@/stores/mediaEntertainment'
import { getMediaWatchStateAtom } from '@/stores/mediaWatchState'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'

import { createMediaRailItem } from '@tests/app/media-entertainment/_helpers/railFixtures'
import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendConversionEvent: vi.fn() }
    },
  }
})

const NOW = 1_700_000_000_000

const watchStateAtom = getMediaWatchStateAtom(mediaEntertainmentConfig.slug)

const indexHit = (objectID: string, title: string) => {
  return {
    objectID,
    title,
    record_type: 'movie',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
  }
}

interface RenderArgs {
  myList?: { objectID: string; addedAt: number }[]
  continueWatching?: { objectID: string; addedAt: number; progress: number }[]
  hits?: Record<string, unknown>[]
  cached?: Record<string, unknown>
  resolveMissing?: boolean
}

const renderWatchRails = ({
  myList = [],
  continueWatching = [],
  hits = [],
  cached,
  resolveMissing,
}: RenderArgs = {}) => {
  const searchMock = vi.fn().mockResolvedValue({ results: [{ hits }] })
  const { Wrapper, store } = buildProvidersWrapper()

  store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
  store.set(searchClientKeyAtom, 'standard')
  store.set(watchStateAtom, { anonymous: { myList, continueWatching } })
  if (cached) {
    store.set(mediaTitleRecordsAtom, cached as never)
  }

  const view = renderHook(() => useMediaWatchRails({ resolveMissing }), {
    wrapper: Wrapper,
  })

  return { ...view, searchMock, store }
}

describe('useMediaWatchRails', () => {
  beforeEach(() => sessionStorage.clear())

  it('sends no request and reports nothing pending for two empty lists', () => {
    const { result, searchMock } = renderWatchRails()

    expect(searchMock).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(false)
    expect(result.current.myListTitles).toEqual([])
    expect(result.current.continueWatchingTitles).toEqual([])
  })

  it('resolves stored objectIDs into titles', async () => {
    const { result } = renderWatchRails({
      myList: [{ objectID: 'movie_1', addedAt: NOW }],
      hits: [indexHit('movie_1', 'Zootopia')],
    })

    await waitFor(() => expect(result.current.myListTitles).toHaveLength(1))
    expect(result.current.myListTitles[0].title).toBe('Zootopia')
    expect(result.current.myListTitles[0].productUrl).toBe(
      '/media-entertainment/title/movie_1',
    )
  })

  it('carries the stored progress onto the resolved title', async () => {
    const { result } = renderWatchRails({
      continueWatching: [{ objectID: 'movie_2', addedAt: NOW, progress: 0.42 }],
      hits: [indexHit('movie_2', 'Up')],
    })

    await waitFor(() =>
      expect(result.current.continueWatchingTitles).toHaveLength(1),
    )
    expect(result.current.continueWatchingTitles[0].progress).toBe(0.42)
  })

  it('asks for both lists in one request, deduped', async () => {
    const { result, searchMock } = renderWatchRails({
      myList: [{ objectID: 'movie_1', addedAt: NOW }],
      continueWatching: [{ objectID: 'movie_1', addedAt: NOW, progress: 0.5 }],
      hits: [indexHit('movie_1', 'Encanto')],
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1))
    expect(searchMock.mock.calls[0][0]).toHaveLength(1)
    expect(searchMock.mock.calls[0][0][0].params.filters).toBe(
      'objectID:"movie_1"',
    )
    await waitFor(() =>
      expect(result.current.continueWatchingTitles).toHaveLength(1),
    )
  })

  it('ORs every missing id into one filter', async () => {
    const { searchMock } = renderWatchRails({
      myList: [
        { objectID: 'movie_1', addedAt: NOW },
        { objectID: 'movie_2', addedAt: NOW - 1 },
      ],
      hits: [],
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1))
    expect(searchMock.mock.calls[0][0][0].params.filters).toBe(
      'objectID:"movie_1" OR objectID:"movie_2"',
    )
  })

  it('asks for more slots than ids, so an injected item cannot push one out', async () => {
    const { searchMock } = renderWatchRails({
      myList: [
        { objectID: 'movie_1', addedAt: NOW },
        { objectID: 'movie_2', addedAt: NOW - 1 },
      ],
      hits: [],
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1))
    expect(searchMock.mock.calls[0][0][0].params.hitsPerPage).toBeGreaterThan(2)
  })

  it('resolves by objectID, ignoring an item the composition injected', async () => {
    const { result } = renderWatchRails({
      myList: [{ objectID: 'movie_1', addedAt: NOW }],
      // A pinned injection takes the top slot; the requested record follows.
      hits: [
        indexHit('movie_injected', 'Sponsored'),
        indexHit('movie_1', 'Zootopia'),
      ],
    })

    await waitFor(() => expect(result.current.myListTitles).toHaveLength(1))
    expect(result.current.myListTitles[0].objectID).toBe('movie_1')
    expect(result.current.myListTitles[0].title).toBe('Zootopia')
  })

  it('re-resolves the titles when the installed search client swaps pipelines', async () => {
    const { result, searchMock, store } = renderWatchRails({
      myList: [{ objectID: 'movie_1', addedAt: NOW }],
      hits: [indexHit('movie_1', 'Zootopia')],
    })

    await waitFor(() => expect(result.current.myListTitles).toHaveLength(1))
    expect(searchMock).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })

  it('drops an id the index no longer returns rather than rendering it blank', async () => {
    const { result } = renderWatchRails({
      myList: [
        { objectID: 'movie_1', addedAt: NOW },
        { objectID: 'movie_gone', addedAt: NOW - 1 },
      ],
      hits: [indexHit('movie_1', 'Zootopia')],
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.myListTitles.map((title) => title.objectID)).toEqual([
      'movie_1',
    ])
  })

  it('serves a cached title without a request, so an add paints instantly', () => {
    const cachedTitle = createMediaRailItem()
    const { result, searchMock } = renderWatchRails({
      myList: [{ objectID: 'movie_1', addedAt: NOW }],
      cached: { movie_1: cachedTitle },
    })

    expect(searchMock).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(false)
    expect(result.current.myListTitles[0].title).toBe('Blade Runner 2049')
  })

  describe('with resolveMissing false', () => {
    it('sends no request and reports nothing pending', () => {
      const { result, searchMock } = renderWatchRails({
        myList: [{ objectID: 'movie_1', addedAt: NOW }],
        hits: [indexHit('movie_1', 'Zootopia')],
        resolveMissing: false,
      })

      expect(searchMock).not.toHaveBeenCalled()
      expect(result.current.isPending).toBe(false)
      expect(result.current.myListTitles).toEqual([])
    })

    it('still serves titles the record cache already holds', () => {
      const cachedTitle = createMediaRailItem()
      const { result, searchMock } = renderWatchRails({
        myList: [{ objectID: 'movie_1', addedAt: NOW }],
        cached: { movie_1: cachedTitle },
        resolveMissing: false,
      })

      expect(searchMock).not.toHaveBeenCalled()
      expect(result.current.myListTitles[0].title).toBe('Blade Runner 2049')
    })
  })

  it('keeps the stored order rather than the order the index returns', async () => {
    const { result } = renderWatchRails({
      myList: [
        { objectID: 'movie_2', addedAt: NOW },
        { objectID: 'movie_1', addedAt: NOW - 1 },
      ],
      // Ranking order, which is the reverse of the list order.
      hits: [indexHit('movie_1', 'First'), indexHit('movie_2', 'Second')],
    })

    await waitFor(() => expect(result.current.myListTitles).toHaveLength(2))
    expect(result.current.myListTitles.map((title) => title.objectID)).toEqual([
      'movie_2',
      'movie_1',
    ])
  })
})
