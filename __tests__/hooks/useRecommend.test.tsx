import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRecommend } from '@/hooks/useRecommend'
import { activeConfigAtom } from '@/stores/activeConfig'
import { searchClientAtom } from '@/stores/searchClient'

import { createTestStore } from '../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '../helpers/test-utils'

const getRecommendationsMock = vi.fn()

const mockPersonalization: {
  currentUserToken: string
  currentOptionalFilters: string[]
  mode: 'anonymous' | 'persona' | 'realtime'
} = {
  currentUserToken: '',
  currentOptionalFilters: [],
  mode: 'anonymous',
}

vi.mock('@/hooks/usePersonalization', () => {return {
  usePersonalization: () => mockPersonalization,
}})

const buildStore = () =>
  createTestStore((store) => {
    store.set(activeConfigAtom, createMockConfig({ slug: 'ecommerce' }))
    store.set(
      searchClientAtom,
      createMockSearchClient({ getRecommendations: getRecommendationsMock }),
    )
  })

const buildWrapper = (store: ReturnType<typeof buildStore>) =>
  buildProvidersWrapper({ store }).Wrapper

describe('useRecommend', () => {
  beforeEach(() => {
    getRecommendationsMock.mockReset()
    getRecommendationsMock.mockResolvedValue({
      results: [
        { queryID: 'qid-1', hits: [{ objectID: 'h1' }, { objectID: 'h2' }] },
        { queryID: 'qid-2', hits: [{ objectID: 'h3' }] },
      ],
    })
    mockPersonalization.currentUserToken = ''
    mockPersonalization.currentOptionalFilters = []
    mockPersonalization.mode = 'anonymous'
  })

  it('batches every model into a single getRecommendations call with hook defaults', async () => {
    const store = buildStore()

    const { result } = renderHook(
      () =>
        useRecommend(['bought-together', 'related-products'], 'p1'),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(getRecommendationsMock).toHaveBeenCalledTimes(1)
    expect(getRecommendationsMock).toHaveBeenCalledWith({
      requests: [
        {
          model: 'bought-together',
          objectID: 'p1',
          indexName: 'test_index',
          threshold: 0,
          maxRecommendations: 8,
          queryParameters: { clickAnalytics: true },
        },
        {
          model: 'related-products',
          objectID: 'p1',
          indexName: 'test_index',
          threshold: 0,
          maxRecommendations: 8,
          queryParameters: { clickAnalytics: true },
        },
      ],
    })
  })

  it('returns hits keyed by model in the order they were requested', async () => {
    const store = buildStore()

    const { result } = renderHook(
      () =>
        useRecommend(['bought-together', 'related-products'], 'p1'),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      'bought-together': [
        { objectID: 'h1', __queryID: 'qid-1', __position: 1 },
        { objectID: 'h2', __queryID: 'qid-1', __position: 2 },
      ],
      'related-products': [{ objectID: 'h3', __queryID: 'qid-2', __position: 1 }],
    })
  })

  it('returns an empty array for any model whose result has no hits', async () => {
    getRecommendationsMock.mockResolvedValueOnce({
      results: [
        { queryID: 'qid-1', hits: [{ objectID: 'h1' }] },
        { queryID: 'qid-2', hits: [] },
      ],
    })
    const store = buildStore()

    const { result } = renderHook(
      () => useRecommend(['bought-together', 'looking-similar'], 'p1'),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      'bought-together': [{ objectID: 'h1', __queryID: 'qid-1', __position: 1 }],
      'looking-similar': [],
    })
  })

  it('forwards threshold and maxRecommendations to every request', async () => {
    const store = buildStore()

    renderHook(
      () =>
        useRecommend(['related-products', 'looking-similar'], 'p1', {
          threshold: 30,
          maxRecommendations: 5,
        }),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() =>
      expect(getRecommendationsMock).toHaveBeenCalledTimes(1),
    )

    expect(getRecommendationsMock).toHaveBeenCalledWith({
      requests: [
        {
          model: 'related-products',
          objectID: 'p1',
          indexName: 'test_index',
          threshold: 30,
          maxRecommendations: 5,
          queryParameters: { clickAnalytics: true },
        },
        {
          model: 'looking-similar',
          objectID: 'p1',
          indexName: 'test_index',
          threshold: 30,
          maxRecommendations: 5,
          queryParameters: { clickAnalytics: true },
        },
      ],
    })
  })

  it('forwards fallbackParameters to every request when given', async () => {
    const store = buildStore()

    renderHook(
      () =>
        useRecommend(['related-products'], 'p1', {
          fallbackParameters: { query: '' },
        }),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() =>
      expect(getRecommendationsMock).toHaveBeenCalledTimes(1),
    )

    expect(getRecommendationsMock).toHaveBeenCalledWith({
      requests: [
        {
          model: 'related-products',
          objectID: 'p1',
          indexName: 'test_index',
          threshold: 0,
          maxRecommendations: 8,
          queryParameters: { clickAnalytics: true },
          fallbackParameters: { query: '' },
        },
      ],
    })
  })

  it('leaves fallbackParameters off the request when not given', async () => {
    const store = buildStore()

    renderHook(() => useRecommend(['related-products'], 'p1'), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() =>
      expect(getRecommendationsMock).toHaveBeenCalledTimes(1),
    )

    const [{ requests }] = getRecommendationsMock.mock.calls[0]

    expect(requests[0]).not.toHaveProperty('fallbackParameters')
  })

  it('does not call the API when objectID is empty', () => {
    const store = buildStore()

    const { result } = renderHook(() => useRecommend(['bought-together'], ''), {
      wrapper: buildWrapper(store),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getRecommendationsMock).not.toHaveBeenCalled()
  })

  it('does not call the API when no models are requested', () => {
    const store = buildStore()

    const { result } = renderHook(() => useRecommend([], 'p1'), {
      wrapper: buildWrapper(store),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getRecommendationsMock).not.toHaveBeenCalled()
  })

  it('omits objectID from trending-items requests and runs without one', async () => {
    getRecommendationsMock.mockResolvedValueOnce({
      results: [{ queryID: 'qid-1', hits: [{ objectID: 'h1' }] }],
    })
    const store = buildStore()

    const { result } = renderHook(
      () => useRecommend(['trending-items'], undefined),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(getRecommendationsMock).toHaveBeenCalledWith({
      requests: [
        {
          model: 'trending-items',
          indexName: 'test_index',
          threshold: 0,
          maxRecommendations: 8,
          queryParameters: { clickAnalytics: true },
        },
      ],
    })
    expect(result.current.data).toEqual({
      'trending-items': [{ objectID: 'h1', __queryID: 'qid-1', __position: 1 }],
    })
  })

  it('mixes trending-items with object-based models in one batch', async () => {
    getRecommendationsMock.mockResolvedValueOnce({
      results: [
        { hits: [{ objectID: 't1' }] },
        { hits: [{ objectID: 'r1' }] },
      ],
    })
    const store = buildStore()

    renderHook(
      () => useRecommend(['trending-items', 'related-products'], 'p1'),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() =>
      expect(getRecommendationsMock).toHaveBeenCalledTimes(1),
    )

    expect(getRecommendationsMock).toHaveBeenCalledWith({
      requests: [
        {
          model: 'trending-items',
          indexName: 'test_index',
          threshold: 0,
          maxRecommendations: 8,
          queryParameters: { clickAnalytics: true },
        },
        {
          model: 'related-products',
          objectID: 'p1',
          indexName: 'test_index',
          threshold: 0,
          maxRecommendations: 8,
          queryParameters: { clickAnalytics: true },
        },
      ],
    })
  })

  it('waits for an objectID when any model needs one', () => {
    const store = buildStore()

    const { result } = renderHook(
      () => useRecommend(['trending-items', 'related-products'], ''),
      { wrapper: buildWrapper(store) },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(getRecommendationsMock).not.toHaveBeenCalled()
  })

  it('includes queryParameters when personalization is active', async () => {
    mockPersonalization.currentUserToken = 'persona-outdoor'
    mockPersonalization.currentOptionalFilters = ['category:Outdoor<score=5>']
    mockPersonalization.mode = 'persona'

    const store = buildStore()

    const { result } = renderHook(
      () => useRecommend(['related-products'], 'p1'),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(getRecommendationsMock).toHaveBeenCalledWith({
      requests: [
        {
          model: 'related-products',
          objectID: 'p1',
          indexName: 'test_index',
          threshold: 0,
          maxRecommendations: 8,
          queryParameters: {
            clickAnalytics: true,
            userToken: 'persona-outdoor',
            optionalFilters: ['category:Outdoor<score=5>'],
            getRankingInfo: true,
          },
        },
      ],
    })
  })
})
