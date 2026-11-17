import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMediaTitleDetail } from '@/app/media-entertainment/_hooks/useMediaTitleDetail'
import { searchClientAtom } from '@/stores/searchClient'

import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const TITLE_ID = 'title-42'

const detailHit = (objectID: string, title: string) => {
  return {
    objectID,
    title,
    record_type: 'movie',
    overview: `${title} synopsis`,
    poster_path: '/poster.jpg',
  }
}

const renderDetail = (hits: Record<string, unknown>[]) => {
  const searchMock = vi.fn().mockResolvedValue({ results: [{ hits }] })
  const { Wrapper, store } = buildProvidersWrapper()

  store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))

  const view = renderHook(() => useMediaTitleDetail(TITLE_ID), {
    wrapper: Wrapper,
  })

  return { ...view, searchMock }
}

describe('useMediaTitleDetail', () => {
  it('resolves the requested title', async () => {
    const { result } = renderDetail([detailHit(TITLE_ID, 'The Requested One')])

    await waitFor(() =>
      expect(result.current.detail?.objectID).toBe(TITLE_ID),
    )
    expect(result.current.detail?.title).toBe('The Requested One')
  })

  it('goes through the composition-aware client', async () => {
    const { searchMock } = renderDetail([detailHit(TITLE_ID, 'Any')])

    await waitFor(() => expect(searchMock).toHaveBeenCalled())

    const [[requests]] = searchMock.mock.calls
    expect(requests[0].params.filters).toBe(`objectID:"${TITLE_ID}"`)
    // Room for an injected item above the record without evicting it.
    expect(requests[0].params.hitsPerPage).toBeGreaterThan(1)
  })

  it('picks the requested title out of an injected result set', async () => {
    const { result } = renderDetail([
      detailHit('injected-promo', 'Pinned Promo'),
      detailHit(TITLE_ID, 'The Requested One'),
    ])

    await waitFor(() =>
      expect(result.current.detail?.objectID).toBe(TITLE_ID),
    )
    expect(result.current.detail?.title).toBe('The Requested One')
  })

  it('returns null rather than a wrong title when the record is absent', async () => {
    const { result } = renderDetail([detailHit('injected-promo', 'Pinned')])

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.detail).toBeNull()
  })
})
