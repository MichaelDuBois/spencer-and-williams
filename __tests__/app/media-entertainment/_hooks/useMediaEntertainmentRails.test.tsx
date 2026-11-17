import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaEntertainmentRails } from '@/app/media-entertainment/_hooks/useMediaEntertainmentRails'
import type { MediaBillboardQuery } from '@/app/media-entertainment/_utils/billboardSource'
import { getBrowseRails } from '@/app/media-entertainment/_utils/recommendRail'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaRailConfig } from '@/app/media-entertainment/types'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'



const searchMock = vi.fn()

const mockPersonalization: {
  currentUserToken: string
  currentOptionalFilters: string[]
  mode: 'anonymous' | 'persona' | 'realtime'
} = {
  currentUserToken: '',
  currentOptionalFilters: [],
  mode: 'anonymous',
}

vi.mock('@/hooks/usePersonalization', () => {
  return {
    usePersonalization: () => mockPersonalization,
  }
})

const rails: MediaRailConfig[] = [
  { id: 'top-10', title: 'Top 10 Today', shape: 'top10', hitsPerPage: 10 },
  { id: 'new-releases', title: 'New Releases', shape: 'backdrop' },
  { id: 'blockbusters', title: 'Blockbuster Movies', filters: 'record_type:movie' },
]

const billboard: MediaBillboardQuery = {
  ruleContexts: ['homepage_me_billboard'],
  fallbackFilters: 'vote_count > 2000 AND runtime > 0',
  limit: 2,
}

const billboardHit = (objectID: string, title: string) => {return {
  objectID,
  title,
  tagline: 'Some assembly required.',
  genres: ['Action'],
  backdrop_path: '/backdrop.jpg',
  certification: 'PG-13',
  runtime: 143,
  release_date_str: '2012',
}}

const railResult = (objectID: string, queryID: string) => {return {
  hits: [{ objectID, title: objectID }],
  queryID,
}}

const buildStore = (withClient = true) =>
  createTestStore((store) => {
    if (withClient) {
      store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
      store.set(searchClientKeyAtom, 'standard')
    }
  })

const buildWrapper = (store: ReturnType<typeof buildStore>) =>
  buildProvidersWrapper({ store }).Wrapper

const renderRails = (
  store: ReturnType<typeof buildStore>,
  args: Parameters<typeof useMediaEntertainmentRails>[0] = {
    rails,
    billboard,
  },
) =>
  renderHook(() => useMediaEntertainmentRails(args), {
    wrapper: buildWrapper(store),
  })

describe('useMediaEntertainmentRails', () => {
  beforeEach(() => {
    searchMock.mockReset()
    searchMock.mockResolvedValue({
      results: [
        railResult('movie_1', 'q-top-10'),
        railResult('movie_2', 'q-new-releases'),
        railResult('movie_3', 'q-blockbusters'),
        { hits: [billboardHit('movie_10', 'Rules Pin')], queryID: 'q-rules' },
        {
          hits: [
            billboardHit('movie_10', 'Rules Pin'),
            billboardHit('movie_11', 'Avatar'),
            billboardHit('movie_12', 'Zootopia'),
          ],
          queryID: 'q-fallback',
        },
      ],
    })
    mockPersonalization.currentUserToken = ''
    mockPersonalization.currentOptionalFilters = []
    mockPersonalization.mode = 'anonymous'
  })

  it('fires exactly one search containing every rail and billboard request', async () => {
    const { result } = renderRails(buildStore())

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(searchMock).toHaveBeenCalledTimes(1)
    // 3 rails + the rules and fallback billboard sources.
    expect(searchMock.mock.calls[0][0]).toHaveLength(5)
  })

  it('keeps the requests in config order, rails first', async () => {
    const { result } = renderRails(buildStore())

    await waitFor(() => expect(result.current.isPending).toBe(false))

    const requests = searchMock.mock.calls[0][0]
    expect(requests[0].params.hitsPerPage).toBe(10)
    expect(requests[2].params.filters).toBe('record_type:movie')
    expect(requests[3].params.ruleContexts).toEqual(['homepage_me_billboard'])
    expect(requests[3]).not.toHaveProperty('params.filters')
    // The fallback's own filters, sent verbatim — no quality floor wraps them.
    expect(requests[4].params.filters).toBe('vote_count > 2000 AND runtime > 0')
  })

  it('returns the rails in config order once the data lands', async () => {
    const { result } = renderRails(buildStore())

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(result.current.rails.map((rail) => rail.id)).toEqual([
      'top-10',
      'new-releases',
      'blockbusters',
    ])
    expect(result.current.rails[0].items[0].productUrl).toBe(
      '/media-entertainment/title/movie_1',
    )
    expect(result.current.rails[0].items[0].__queryID).toBe('q-top-10')
  })

  it('keeps every rail present while loading, so the skeletons know the count', () => {
    searchMock.mockReturnValue(new Promise(() => {}))

    const { result } = renderRails(buildStore())

    expect(result.current.isPending).toBe(true)
    expect(result.current.rails.map((rail) => rail.title)).toEqual([
      'Top 10 Today',
      'New Releases',
      'Blockbuster Movies',
    ])
    expect(result.current.rails.every((rail) => rail.items.length === 0)).toBe(
      true,
    )
  })

  it('drops empty rails only after the data lands', async () => {
    searchMock.mockResolvedValue({
      results: [
        railResult('movie_1', 'q-top-10'),
        { hits: [] },
        railResult('movie_3', 'q-blockbusters'),
        { hits: [] },
        { hits: [] },
      ],
    })

    const { result } = renderRails(buildStore())

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(result.current.rails.map((rail) => rail.id)).toEqual([
      'top-10',
      'blockbusters',
    ])
  })

  it('picks deduped billboard titles up to the configured limit', async () => {
    const { result } = renderRails(buildStore())

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(
      result.current.billboardTitles.map((title) => title.objectID),
    ).toEqual(['movie_10', 'movie_11'])
    expect(result.current.billboardTitles.map((title) => title.rank)).toEqual([
      1, 2,
    ])
    expect(result.current.billboardTitles[0].__queryID).toBe('q-rules')
  })

  // The client arrives from a provider effect, so this window is every first
  // paint. Reporting "not pending" here would let the page render an empty body
  // before the skeletons.
  it('stays pending, without searching, while there is no search client', () => {
    const { result } = renderRails(buildStore(false))

    expect(searchMock).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.rails).toHaveLength(3)
    expect(result.current.billboardTitles).toEqual([])
  })

  // The homepage holds the batch back until the rules have settled its rail
  // list, so `enabled: false` has to read the same as "not yet loaded".
  it('issues no search, and stays pending, while disabled', () => {
    const { result } = renderRails(buildStore(), {
      rails,
      billboard,
      enabled: false,
    })

    expect(searchMock).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.rails).toHaveLength(3)
  })

  it('queries the billboard alone when no rails are configured', async () => {
    searchMock.mockResolvedValue({
      results: [
        { hits: [billboardHit('movie_10', 'Rules Pin')], queryID: 'q-rules' },
        { hits: [], queryID: 'q-fallback' },
      ],
    })

    const { result } = renderRails(buildStore(), { rails: [], billboard })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(searchMock.mock.calls[0][0]).toHaveLength(2)
    expect(result.current.rails).toEqual([])
    expect(result.current.billboardTitles).toHaveLength(1)
  })

  it('refetches when the persona token changes', async () => {
    const store = buildStore()
    const { result, rerender } = renderRails(store)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(searchMock).toHaveBeenCalledTimes(1)

    mockPersonalization.currentUserToken = 'persona-1'
    mockPersonalization.mode = 'persona'
    rerender()

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })

  // Swapping the client changes no search parameter, so its identity is the only
  // thing that can invalidate the rails when the composition toggle moves.
  it('refetches when the installed search client swaps pipelines', async () => {
    const store = buildStore()
    const { result } = renderRails(store)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(searchMock).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })

  it('surfaces an error without throwing, and stops reporting pending', async () => {
    searchMock.mockRejectedValue(new Error('boom'))

    const { result } = renderRails(buildStore())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isPending).toBe(false)
    expect(result.current.rails).toHaveLength(3)
  })

  it('refetches on demand, so the error state can offer a retry', async () => {
    searchMock.mockRejectedValueOnce(new Error('boom'))

    const { result } = renderRails(buildStore())

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Braces, not a concise body: `refetch` returns a promise React Query owns,
    // and handing it back to `act` opens a scope this test never awaits.
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => expect(result.current.isError).toBe(false))
    expect(result.current.rails).toHaveLength(3)
    expect(result.current.rails[0].items).toHaveLength(1)
  })

  it('falls back to the vertical config when no rails are injected', async () => {
    searchMock.mockResolvedValue({ results: [] })

    const { result } = renderRails(buildStore(), {})

    await waitFor(() => expect(result.current.isPending).toBe(false))

    // Browse rails only — the Recommend row is in `homepageRails` but fetches
    // from Recommend, so it contributes no request to the batch.
    const configuredRails = getBrowseRails(
      mediaEntertainmentConfig.homepageRails ?? [],
    )
    expect(searchMock.mock.calls[0][0]).toHaveLength(
      configuredRails.length + 2,
    )
  })
})
