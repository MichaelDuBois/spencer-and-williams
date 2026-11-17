import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import HomePage from '@/app/b2b-warehouse/page'
import { useEmptyQueryHits } from '@/hooks/useEmptyQueryHits'
import { usePreviewImages } from '@/hooks/usePreviewImages'
import { useRecommend, type ProductRecommendModel } from '@/hooks/useRecommend'
import { activeConfigAtom } from '@/stores/activeConfig'
import { setPersonaModeAtom } from '@/stores/personalization'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import { selectedStoreAtom } from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

vi.mock('@/app/b2b-warehouse/_components/B2BWarehouseHeroBanner', () => {
  return {
    B2BWarehouseHeroBanner: () => null,
  }
})
vi.mock('@/components/hit/Hit', () => {
  return {
    Hit: ({ item }: { item: { objectID: string } }) => (
      <span>Product {item.objectID}</span>
    ),
  }
})

const A = {
  objectID: 'A',
  image: 'a.jpg',
  visible_by: [GROUP_0.groupId],
  availableInStores: [{ objectID: '1' }],
}
const B = { ...A, objectID: 'B', image: 'b.jpg', visible_by: [GROUP_1.groupId] }
const FILTERS =
  'visible_by:"customer_group_0" AND availableInStores.objectID:"1"'
const MODELS: ProductRecommendModel[] = [
  'bought-together',
  'related-products',
  'looking-similar',
  'trending-items',
]
const setup = () => {
  const search = vi.fn().mockResolvedValue({ results: [{ hits: [A, B] }] })
  const getRecommendations = vi.fn().mockResolvedValue({
    results: MODELS.map(() => {
      return { queryID: 'qid', hits: [B, A] }
    }),
  })
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'b2b-warehouse',
        algolia: {
          appId: 'APP',
          apiKey: 'KEY',
          primaryIndex: {
            name: 'products',
            template: { attributes: { name: 'name', image: 'image' } },
          },
          indices: {},
        },
        features: {
          agentStudio: {},
          personalization: { enabled: true },
          recommend: {
            homepage: [{ model: 'trending-items', title: 'Trending' }],
          },
        },
        homepageCarousels: [
          {
            title: 'Featured',
            ruleContexts: ['homepage-featured-b2b-warehouse'],
          },
        ],
        carouselCategories: [{ category: 'Tools', label: 'Tools' }],
        collections: [
          { collection: 'Tools', label: 'Tools', description: 'Tools' },
        ],
      }),
    )
    s.set(setPersonaModeAtom, GROUP_0)
    s.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '1' })
    s.set(
      searchClientAtom,
      createMockSearchClient({ search, getRecommendations }),
    )
    s.set(searchClientKeyAtom, 'standard')
  })
  return { ...buildProvidersWrapper({ store }), search, getRecommendations }
}

const useBrowse = () => {
  const options = useB2BProductHitOptions()
  const homepage = useEmptyQueryHits(options)
  const recommendations = useRecommend(MODELS, 'seed', options)
  const previews = usePreviewImages(
    ['Tools'],
    'categoryPageId',
    'categoryImages',
    options,
  )
  return { homepage, recommendations, previews }
}

describe('B2B browse retrieval', () => {
  it('connects the B2B homepage carousels, recommendations and previews to the policy', async () => {
    const { Wrapper, search, getRecommendations } = setup()
    render(<HomePage />, { wrapper: Wrapper })
    await waitFor(() =>
      expect(screen.getAllByText('Product A')).toHaveLength(2),
    )
    expect(screen.queryByText('Product B')).not.toBeInTheDocument()
    expect(search).toHaveBeenCalledTimes(3)
    const params = search.mock.calls.flatMap(([requests]) =>
      requests.map(
        (request: { params: { filters: string } }) => request.params,
      ),
    )
    expect(params.map((entry) => entry.filters)).toEqual(
      expect.arrayContaining([
        FILTERS,
        `categoryPageId:"Tools" AND ${FILTERS}`,
        `_collections:"Tools" AND ${FILTERS}`,
      ]),
    )
    expect(
      getRecommendations.mock.calls[0][0].requests[0].queryParameters.filters,
    ).toBe(FILTERS)
  })

  it('supplies restrictions to default recommendation fallbacks', async () => {
    const { Wrapper, getRecommendations } = setup()
    const { result } = renderHook(
      () => useRecommend(MODELS, 'seed', useB2BProductHitOptions()),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    for (const request of getRecommendations.mock.calls[0][0].requests)
      expect(request.fallbackParameters).toEqual({ filters: FILTERS })
  })

  it('retains membership fields when a recommendation fallback trims attributes', async () => {
    const { Wrapper, getRecommendations } = setup()
    const { result } = renderHook(
      () =>
        useRecommend(['related-products'], 'seed', {
          ...useB2BProductHitOptions(),
          fallbackParameters: { attributesToRetrieve: ['image'] },
        }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(
      getRecommendations.mock.calls[0][0].requests[0].fallbackParameters,
    ).toEqual({
      filters: FILTERS,
      attributesToRetrieve: [
        'image',
        'visible_by',
        'availableInStores.objectID',
      ],
    })
  })

  it('retains validation fields when a homepage caller trims the payload', async () => {
    const { Wrapper, search } = setup()
    const { result } = renderHook(
      () =>
        useEmptyQueryHits({
          ...useB2BProductHitOptions(),
          attributesToRetrieve: ['image'],
          attributesToHighlight: [],
        }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(search.mock.calls[0][0][0].params.attributesToRetrieve).toEqual([
      'image',
      'visible_by',
      'availableInStores.objectID',
    ])
    expect(result.current.data).toEqual([A])
  })

  it('does not fetch any product surface with invalid group configuration', () => {
    const { Wrapper, store, search, getRecommendations } = setup()
    store.set(setPersonaModeAtom, { ...GROUP_0, discount: NaN })
    const { result } = renderHook(useBrowse, { wrapper: Wrapper })
    expect(result.current.homepage.data).toBeUndefined()
    expect(result.current.recommendations.data).toBeUndefined()
    expect(result.current.previews.get('Tools')).toBeNull()
    expect(search).not.toHaveBeenCalled()
    expect(getRecommendations).not.toHaveBeenCalled()
  })

  it('keeps late responses from a previous group out of all current surfaces', async () => {
    const { Wrapper, store, search, getRecommendations } = setup()
    const oldSearch = Promise.withResolvers<{
      results: { hits: (typeof A)[] }[]
    }>()
    const oldRecommendations = Promise.withResolvers<{
      results: { hits: (typeof A)[] }[]
    }>()
    search.mockReturnValue(oldSearch.promise)
    getRecommendations.mockReturnValue(oldRecommendations.promise)
    const { result } = renderHook(useBrowse, { wrapper: Wrapper })
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    search.mockResolvedValue({ results: [{ hits: [B] }] })
    getRecommendations.mockResolvedValue({
      results: MODELS.map(() => {
        return { hits: [B] }
      }),
    })
    act(() => store.set(setPersonaModeAtom, GROUP_1))
    await waitFor(() => expect(result.current.homepage.data).toEqual([B]))
    await waitFor(() =>
      expect(
        result.current.recommendations.data?.['related-products']?.[0]
          ?.objectID,
      ).toBe('B'),
    )
    await waitFor(() =>
      expect(result.current.previews.get('Tools')).toBe('b.jpg'),
    )
    await act(async () => {
      oldSearch.resolve({ results: [{ hits: [A] }] })
      oldRecommendations.resolve({
        results: MODELS.map(() => {
          return { hits: [A] }
        }),
      })
    })
    expect(result.current.homepage.data).toEqual([B])
    expect(
      result.current.recommendations.data?.['related-products']?.[0]?.objectID,
    ).toBe('B')
    expect(result.current.previews.get('Tools')).toBe('b.jpg')
  })

  it('clears cached products during a warehouse switch and refetches on pipeline changes', async () => {
    const { Wrapper, store, search, getRecommendations } = setup()
    const { result } = renderHook(useBrowse, { wrapper: Wrapper })
    await waitFor(() => expect(result.current.homepage.data).toEqual([A]))
    await waitFor(() =>
      expect(result.current.recommendations.isSuccess).toBe(true),
    )
    await waitFor(() =>
      expect(result.current.previews.get('Tools')).toBe('a.jpg'),
    )
    search.mockImplementation(() => new Promise(() => {}))
    getRecommendations.mockImplementation(() => new Promise(() => {}))
    act(() =>
      store.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '2' }),
    )
    expect(result.current.homepage.data).toBeUndefined()
    expect(result.current.recommendations.data).toBeUndefined()
    expect(result.current.previews.get('Tools')).toBeNull()
    await waitFor(() => expect(search).toHaveBeenCalledTimes(4))
    search.mockResolvedValue({ results: [{ hits: [] }] })
    getRecommendations.mockResolvedValue({ results: [] })
    act(() => store.set(searchClientKeyAtom, 'composition'))
    await waitFor(() => expect(result.current.homepage.data).toEqual([]))
    await waitFor(() =>
      expect(result.current.recommendations.isSuccess).toBe(true),
    )
    expect(search).toHaveBeenCalledTimes(6)
    expect(getRecommendations).toHaveBeenCalledTimes(3)
  })

  it('keeps surfaces empty on errors without unfiltered retries', async () => {
    const { Wrapper, search, getRecommendations } = setup()
    search.mockRejectedValue(new Error('Unavailable'))
    getRecommendations.mockRejectedValue(new Error('Unavailable'))
    const { result } = renderHook(useBrowse, { wrapper: Wrapper })
    await waitFor(() => expect(result.current.homepage.isError).toBe(true))
    await waitFor(() =>
      expect(result.current.recommendations.isError).toBe(true),
    )
    expect(result.current.homepage.data).toBeUndefined()
    expect(result.current.recommendations.data).toBeUndefined()
    expect(result.current.previews.get('Tools')).toBeNull()
    expect(search).toHaveBeenCalledTimes(2)
    expect(getRecommendations).toHaveBeenCalledOnce()
  })

  it('uses warehouse membership without imposing a group on anonymous selection', async () => {
    const { Wrapper, store, search } = setup()
    store.set(setPersonaModeAtom, null)
    const { result } = renderHook(
      () => useEmptyQueryHits(useB2BProductHitOptions()),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.data).toEqual([A, B]))
    expect(search.mock.calls[0][0][0].params.filters).toBe(
      'availableInStores.objectID:"1"',
    )
  })

  it('restricts homepage hits while retaining its merchandising rule', async () => {
    const { Wrapper, search } = setup()
    const { result } = renderHook(
      () =>
        useEmptyQueryHits({
          ...useB2BProductHitOptions(),
          ruleContexts: ['homepage-featured-b2b-warehouse'],
        }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(search.mock.calls[0][0][0].params).toMatchObject({
      filters: FILTERS,
      ruleContexts: ['homepage-featured-b2b-warehouse'],
    })
    expect(result.current.data).toEqual([A])
  })

  it('restricts every recommendation model and its fallback without renumbering analytics positions', async () => {
    const { Wrapper, getRecommendations } = setup()
    const { result } = renderHook(
      () =>
        useRecommend(MODELS, 'seed', {
          ...useB2BProductHitOptions(),
          fallbackParameters: {
            filters: 'brand:"One" OR brand:"Two"',
            query: 'tools',
          },
        }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    for (const request of getRecommendations.mock.calls[0][0].requests) {
      expect(request.queryParameters.filters).toBe(FILTERS)
      expect(request.fallbackParameters).toEqual({
        query: 'tools',
        filters: `(brand:"One" OR brand:"Two") AND ${FILTERS}`,
      })
    }
    for (const model of MODELS)
      expect(result.current.data?.[model]).toEqual([
        { ...A, __position: 2, __queryID: 'qid' },
      ])
  })

  it('restricts preview requests and fetches the membership fields needed for validation', async () => {
    const { Wrapper, search } = setup()
    const { result } = renderHook(
      () =>
        usePreviewImages(
          ['Tools'],
          'categoryPageId',
          'categoryImages',
          useB2BProductHitOptions(),
        ),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.get('Tools')).toBe('a.jpg'))
    expect(search.mock.calls[0][0][0].params).toMatchObject({
      filters: `categoryPageId:"Tools" AND ${FILTERS}`,
      attributesToRetrieve: [
        'image',
        'objectID',
        'visible_by',
        'availableInStores.objectID',
      ],
    })
  })

  it('clears previous warehouse previews before the next response arrives', async () => {
    const { Wrapper, store, search } = setup()
    const { result } = renderHook(
      () =>
        usePreviewImages(
          ['Tools'],
          'categoryPageId',
          'categoryImages',
          useB2BProductHitOptions(),
        ),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.get('Tools')).toBe('a.jpg'))
    search.mockImplementation(() => new Promise(() => {}))
    act(() =>
      store.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '2' }),
    )
    expect(result.current.get('Tools')).not.toBe('a.jpg')
  })
})
