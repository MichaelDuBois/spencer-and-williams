import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMultifeedComposition } from '@/hooks/useMultifeedComposition'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  compositionEnabledAtom,
  demoOptionsStore,
} from '@/stores/demoOptions'

import { createTestStore } from '../helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '../helpers/test-utils'

const useInstantSearchMock = vi.fn()
const runMultifeedCompositionMock = vi.fn()

vi.mock('react-instantsearch', () => {return {
  useInstantSearch: () => useInstantSearchMock(),
}})

vi.mock('@/lib/multifeed-composition', () => {return {
  runMultifeedComposition: (args: unknown) => runMultifeedCompositionMock(args),
}})

const setResults = (results: unknown) =>
  useInstantSearchMock.mockReturnValue({ results })

const buildStore = ({ enabled = true } = {}) => {
  demoOptionsStore.set(compositionEnabledAtom, enabled)

  return createTestStore((store) => {
    store.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'travel',
        features: {
          agentStudio: {},
          composition: { multiFeedCompositionId: 'multifeed-1' },
        },
      }),
    )
  })
}

const buildWrapper = (store: ReturnType<typeof buildStore>) =>
  buildProvidersWrapper({ store }).Wrapper

describe('useMultifeedComposition', () => {
  beforeEach(() => {
    demoOptionsStore.set(compositionEnabledAtom, true)
    useInstantSearchMock.mockReset()
    runMultifeedCompositionMock.mockReset()
    runMultifeedCompositionMock.mockResolvedValue([
      {
        feedId: 'f1',
        title: 'Feed 1',
        indexName: 'idx',
        hits: [{ objectID: 'h1', __position: 1 }],
      },
    ])
  })

  it('passes the query and filters off the InstantSearch results into runMultifeedComposition', async () => {
    setResults({ query: 'tokyo', _state: { filters: 'country:Japan' } })
    const store = buildStore()

    const { result } = renderHook(() => useMultifeedComposition(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1)
    expect(runMultifeedCompositionMock).toHaveBeenCalledWith({
      credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
      compositionId: 'multifeed-1',
      params: { query: 'tokyo', filters: 'country:Japan' },
    })
  })

  it('defaults the query to an empty string and omits filters when results carry neither', async () => {
    setResults({})
    const store = buildStore()

    const { result } = renderHook(() => useMultifeedComposition(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(runMultifeedCompositionMock).toHaveBeenCalledWith({
      credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
      compositionId: 'multifeed-1',
      params: { query: '' },
    })
  })

  it('does not run while composition is toggled off', () => {
    setResults({ query: 'tokyo' })
    const store = buildStore({ enabled: false })

    const { result } = renderHook(() => useMultifeedComposition(), {
      wrapper: buildWrapper(store),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(runMultifeedCompositionMock).not.toHaveBeenCalled()
  })

  it('drops the fetched feeds as soon as composition is toggled off', async () => {
    setResults({ query: 'tokyo' })
    const store = buildStore()

    const { result } = renderHook(() => useMultifeedComposition(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.data).toHaveLength(1))

    act(() => demoOptionsStore.set(compositionEnabledAtom, false))

    // Disabling a query keeps its cached data, so the toggle has to change the
    // key — otherwise the carousels keep rendering the last composition feeds.
    expect(result.current.data).toBeUndefined()
    expect(result.current.fetchStatus).toBe('idle')
    expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1)
  })

  it('serves the feeds from cache when composition is toggled back on', async () => {
    setResults({ query: 'tokyo' })
    const store = buildStore()

    const { result } = renderHook(() => useMultifeedComposition(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.data).toHaveLength(1))

    act(() => demoOptionsStore.set(compositionEnabledAtom, false))
    act(() => demoOptionsStore.set(compositionEnabledAtom, true))

    expect(result.current.data).toHaveLength(1)
    expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1)
  })

  it('treats an empty composition result as stale so it is not cached as fresh', async () => {
    runMultifeedCompositionMock.mockResolvedValue([])
    setResults({ query: 'tokyo' })
    const store = buildStore()

    const { result } = renderHook(() => useMultifeedComposition(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
    expect(result.current.isStale).toBe(true)
  })

  describe('options', () => {
    // `useRefinementList` defaults to the `or` operator, so chip refinements
    // land in `disjunctiveFacetsRefinements`.
    const genresRefined = {
      query: '',
      _state: {
        disjunctiveFacetsRefinements: { genres: ['Horror', 'Comedy'] },
      },
    }

    it('forwards refined genres as one OR group and passes includeMainFeeds', async () => {
      setResults(genresRefined)
      const store = buildStore()

      renderHook(
        () =>
          useMultifeedComposition({
            includeMainFeeds: true,
            forwardFacets: ['genres'],
          }),
        { wrapper: buildWrapper(store) },
      )

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledWith({
          credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
          compositionId: 'multifeed-1',
          includeMainFeeds: true,
          params: {
            query: '',
            facetFilters: [['genres:Horror', 'genres:Comedy']],
          },
        }),
      )
    })

    it('merges conjunctive and disjunctive refinements of a facet, deduped', async () => {
      setResults({
        query: '',
        _state: {
          disjunctiveFacetsRefinements: { genres: ['Horror'] },
          facetsRefinements: { genres: ['Horror', 'Drama'] },
        },
      })
      const store = buildStore()

      renderHook(() => useMultifeedComposition({ forwardFacets: ['genres'] }), {
        wrapper: buildWrapper(store),
      })

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1),
      )
      expect(runMultifeedCompositionMock.mock.calls[0][0].params).toEqual({
        query: '',
        facetFilters: [['genres:Horror', 'genres:Drama']],
      })
    })

    it('sends one OR group per forwarded facet and skips unrefined ones', async () => {
      setResults({
        query: '',
        _state: {
          disjunctiveFacetsRefinements: {
            genres: ['Horror'],
            rating: [],
          },
          facetsRefinements: { record_type: ['movie'] },
        },
      })
      const store = buildStore()

      renderHook(
        () =>
          useMultifeedComposition({
            forwardFacets: ['genres', 'rating', 'record_type'],
          }),
        { wrapper: buildWrapper(store) },
      )

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1),
      )
      expect(runMultifeedCompositionMock.mock.calls[0][0].params).toEqual({
        query: '',
        facetFilters: [['genres:Horror'], ['record_type:movie']],
      })
    })

    it('omits facetFilters when the forwarded facet is not refined', async () => {
      setResults({
        query: 'star wars',
        _state: { disjunctiveFacetsRefinements: { genres: [] } },
      })
      const store = buildStore()

      renderHook(() => useMultifeedComposition({ forwardFacets: ['genres'] }), {
        wrapper: buildWrapper(store),
      })

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1),
      )
      expect(runMultifeedCompositionMock.mock.calls[0][0].params).toEqual({
        query: 'star wars',
      })
    })

    it('keeps the facet filters alongside existing filters', async () => {
      setResults({
        query: '',
        _state: {
          filters: 'year > 2000',
          disjunctiveFacetsRefinements: { genres: ['Horror'] },
        },
      })
      const store = buildStore()

      renderHook(() => useMultifeedComposition({ forwardFacets: ['genres'] }), {
        wrapper: buildWrapper(store),
      })

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1),
      )
      expect(runMultifeedCompositionMock.mock.calls[0][0].params).toEqual({
        query: '',
        filters: 'year > 2000',
        facetFilters: [['genres:Horror']],
      })
    })

    it('includes the facet filters and includeMainFeeds in the query key', async () => {
      setResults(genresRefined)
      const store = buildStore()
      const { Wrapper, queryClient } = buildProvidersWrapper({ store })

      renderHook(
        () =>
          useMultifeedComposition({
            includeMainFeeds: true,
            forwardFacets: ['genres'],
          }),
        { wrapper: Wrapper },
      )

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1),
      )
      const [query] = queryClient.getQueryCache().getAll()
      expect(query.queryKey).toEqual([
        'multifeed-composition',
        'travel',
        'multifeed-1',
        undefined,
        '',
        undefined,
        true,
        'main-feeds',
        [['genres:Horror', 'genres:Comedy']],
      ])
    })

    it('sends the same request and query key as before when called without options', async () => {
      setResults(genresRefined)
      const store = buildStore()
      const { Wrapper, queryClient } = buildProvidersWrapper({ store })

      renderHook(() => useMultifeedComposition(), { wrapper: Wrapper })

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1),
      )
      const [args] = runMultifeedCompositionMock.mock.calls[0]
      expect(args).toStrictEqual({
        credentials: { appId: 'APP_ID', apiKey: 'API_KEY' },
        compositionId: 'multifeed-1',
        mainCompositionId: undefined,
        params: { query: '' },
      })
      expect(args).not.toHaveProperty('includeMainFeeds')

      const [query] = queryClient.getQueryCache().getAll()
      expect(query.queryKey).toEqual([
        'multifeed-composition',
        'travel',
        'multifeed-1',
        undefined,
        '',
        undefined,
        true,
      ])
      expect(query.queryKey).toHaveLength(7)
    })
  })

  describe('keepPreviousData', () => {
    const pendingNextQuery = () =>
      runMultifeedCompositionMock.mockReturnValueOnce(new Promise(() => {}))

    it('keeps the previous feeds while the next query loads when on', async () => {
      setResults({ query: 'star wars' })
      const store = buildStore()

      const { result, rerender } = renderHook(
        () => useMultifeedComposition({ keepPreviousData: true }),
        { wrapper: buildWrapper(store) },
      )

      await waitFor(() => expect(result.current.data).toHaveLength(1))

      pendingNextQuery()
      setResults({ query: 'star wars andor' })
      rerender()

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(2),
      )
      expect(result.current.data).toHaveLength(1)
      expect(result.current.isPlaceholderData).toBe(true)
    })

    it('drops the previous feeds while the next query loads when off', async () => {
      setResults({ query: 'star wars' })
      const store = buildStore()

      const { result, rerender } = renderHook(
        () => useMultifeedComposition(),
        { wrapper: buildWrapper(store) },
      )

      await waitFor(() => expect(result.current.data).toHaveLength(1))

      pendingNextQuery()
      setResults({ query: 'star wars andor' })
      rerender()

      await waitFor(() =>
        expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(2),
      )
      expect(result.current.data).toBeUndefined()
    })

    it('does not keep the previous feeds once composition is toggled off', async () => {
      setResults({ query: 'star wars' })
      const store = buildStore()

      const { result } = renderHook(
        () => useMultifeedComposition({ keepPreviousData: true }),
        { wrapper: buildWrapper(store) },
      )

      await waitFor(() => expect(result.current.data).toHaveLength(1))

      act(() => demoOptionsStore.set(compositionEnabledAtom, false))

      expect(result.current.data).toBeUndefined()
      expect(result.current.isPlaceholderData).toBe(false)
      expect(runMultifeedCompositionMock).toHaveBeenCalledTimes(1)
    })
  })

  it('keeps a non-empty composition result fresh within the stale window', async () => {
    setResults({ query: 'tokyo' })
    const store = buildStore()

    const { result } = renderHook(() => useMultifeedComposition(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.isStale).toBe(false)
  })
})
