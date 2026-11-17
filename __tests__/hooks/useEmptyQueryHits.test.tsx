import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEmptyQueryHits } from '@/hooks/useEmptyQueryHits'
import { activeConfigAtom } from '@/stores/activeConfig'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'

import { createTestStore } from '../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '../helpers/test-utils'

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

vi.mock('@/hooks/usePersonalization', () => {return {
  usePersonalization: () => mockPersonalization,
}})

const buildStore = () =>
  createTestStore((store) => {
    store.set(activeConfigAtom, createMockConfig({ slug: 'ecommerce' }))
    store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
    store.set(searchClientKeyAtom, 'standard')
  })

const buildWrapper = (store: ReturnType<typeof buildStore>) =>
  buildProvidersWrapper({ store }).Wrapper

const firstRequestParams = () => searchMock.mock.calls[0][0][0].params

describe('useEmptyQueryHits', () => {
  beforeEach(() => {
    searchMock.mockReset()
    searchMock.mockResolvedValue({ results: [{ hits: [{ objectID: 'h1' }] }] })
    mockPersonalization.currentUserToken = ''
    mockPersonalization.currentOptionalFilters = []
    mockPersonalization.mode = 'anonymous'
  })

  it('forwards ruleContexts into the search request when provided', async () => {
    const store = buildStore()

    const { result } = renderHook(
      () => useEmptyQueryHits({ ruleContexts: ['ecommerce-homepage'] }),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(firstRequestParams()).toMatchObject({
      query: '',
      ruleContexts: ['ecommerce-homepage'],
    })
  })

  it('omits ruleContexts when personalization is active', async () => {
    const store = createTestStore((store) => {
      store.set(
        activeConfigAtom,
        createMockConfig({
          slug: 'ecommerce',
          features: { personalization: { enabled: true }, agentStudio: {} },
        }),
      )
      store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
    })
    mockPersonalization.mode = 'persona'

    const { result } = renderHook(
      () => useEmptyQueryHits({ ruleContexts: ['ecommerce-homepage'] }),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(firstRequestParams()).not.toHaveProperty('ruleContexts')
  })

  it('forwards ruleContexts in persona mode when personalization is disabled', async () => {
    const store = buildStore()
    mockPersonalization.mode = 'persona'

    const { result } = renderHook(
      () => useEmptyQueryHits({ ruleContexts: ['ecommerce-homepage'] }),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(firstRequestParams()).toMatchObject({
      ruleContexts: ['ecommerce-homepage'],
    })
  })

  it('keeps filterRuleContexts while personalization is active', async () => {
    const store = createTestStore((store) => {
      store.set(
        activeConfigAtom,
        createMockConfig({
          slug: 'ecommerce',
          features: { personalization: { enabled: true }, agentStudio: {} },
        }),
      )
      store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
    })
    mockPersonalization.mode = 'persona'

    const { result } = renderHook(
      () =>
        useEmptyQueryHits({
          ruleContexts: ['pinning-rule'],
          filterRuleContexts: ['filtering-rule'],
        }),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // The pin is dropped so it can't fight the re-rank; the filter survives.
    expect(firstRequestParams()).toMatchObject({
      ruleContexts: ['filtering-rule'],
    })
  })

  it('omits ruleContexts when none are passed', async () => {
    const store = buildStore()

    const { result } = renderHook(() => useEmptyQueryHits(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(firstRequestParams()).not.toHaveProperty('ruleContexts')
  })

  it('omits ruleContexts when passed an empty array', async () => {
    const store = buildStore()

    const { result } = renderHook(() => useEmptyQueryHits({ ruleContexts: [] }), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(firstRequestParams()).not.toHaveProperty('ruleContexts')
  })

  it('forwards the payload controls into the search request when provided', async () => {
    const store = buildStore()

    const { result } = renderHook(
      () =>
        useEmptyQueryHits({
          attributesToRetrieve: ['objectID', 'title', 'poster_path'],
          attributesToHighlight: [],
        }),
      { wrapper: buildWrapper(store) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(firstRequestParams()).toMatchObject({
      attributesToRetrieve: ['objectID', 'title', 'poster_path'],
      attributesToHighlight: [],
    })
  })

  // The regression guard for the verticals that opt out: their requests have to
  // stay byte-identical, so the keys must be absent rather than `undefined`.
  it('omits the payload controls entirely when not passed', async () => {
    const store = buildStore()

    const { result } = renderHook(() => useEmptyQueryHits(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(firstRequestParams()).not.toHaveProperty('attributesToRetrieve')
    expect(firstRequestParams()).not.toHaveProperty('attributesToHighlight')
  })

  // Swapping the client changes no search parameter, so its identity is the only
  // thing that can invalidate these hits when the composition toggle moves.
  it('refetches when the installed search client swaps pipelines', async () => {
    const store = buildStore()

    const { result } = renderHook(() => useEmptyQueryHits(), {
      wrapper: buildWrapper(store),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchMock).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })

  it('does not run when disabled', () => {
    const store = buildStore()

    const { result } = renderHook(
      () => useEmptyQueryHits({ enabled: false }),
      { wrapper: buildWrapper(store) },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(searchMock).not.toHaveBeenCalled()
  })
})
