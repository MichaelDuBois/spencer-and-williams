import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePreviewImages } from '@/hooks/usePreviewImages'
import { activeConfigAtom } from '@/stores/activeConfig'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const setup = () => {
  const search = vi.fn().mockResolvedValue({
    results: [{ hits: [{ objectID: 'A', image: 'a.jpg' }] }],
  })
  const config = createMockConfig({
    slug: 'ecommerce',
    algolia: {
      appId: 'APP',
      apiKey: 'KEY',
      primaryIndex: {
        name: 'products',
        template: { attributes: { name: 'name', image: 'image' } },
      },
      indices: {},
    },
  })
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, config)
    s.set(searchClientAtom, createMockSearchClient({ search }))
    s.set(searchClientKeyAtom, 'standard')
  })
  return { ...buildProvidersWrapper({ store }), search, config }
}

const searchMock = vi.fn()

const ITEMS = ['whole_milk']

/** `usePreviewImages` bails out unless the template maps `image` to a string. */
const previewConfig = () =>
  createMockConfig({
    slug: 'grocery',
    algolia: {
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      primaryIndex: {
        name: 'grocery_prod_ns',
        template: {
          attributes: { image: 'image' },
          imageHrefPrefix: 'https://cdn.example.com/',
        },
      },
      indices: {},
    },
  })
describe('usePreviewImages', () => {
  it('preserves default preview retrieval without product policy', async () => {
    const { Wrapper, search } = setup()
    const { result } = renderHook(
      () => usePreviewImages(['Tools'], 'categoryPageId', 'images'),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.get('Tools')).toBe('a.jpg'))
    expect(search).toHaveBeenCalledWith([
      {
        indexName: 'products',
        params: {
          filters: 'categoryPageId:"Tools"',
          hitsPerPage: 1,
          attributesToRetrieve: ['image', 'objectID'],
        },
      },
    ])
  })

  it('escapes category values and combines them with caller filters', async () => {
    const { Wrapper, search } = setup()
    renderHook(
      () =>
        usePreviewImages(['5" drills'], 'categoryPageId', 'images', {
          filters: 'brand:"One" OR brand:"Two"',
        }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    expect(search.mock.calls[0][0][0].params.filters).toBe(
      'categoryPageId:"5\\" drills" AND (brand:"One" OR brand:"Two")',
    )
  })

  it('refetches when attribute, index, application or image mapping changes', async () => {
    const { Wrapper, store, config, search } = setup()
    const { result, rerender } = renderHook(
      ({ attribute }) => usePreviewImages(['Tools'], attribute, 'images'),
      { wrapper: Wrapper, initialProps: { attribute: 'categoryPageId' } },
    )
    await waitFor(() => expect(result.current.get('Tools')).toBe('a.jpg'))
    rerender({ attribute: '_collections' })
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    act(() =>
      store.set(activeConfigAtom, {
        ...config,
        algolia: {
          ...config.algolia,
          primaryIndex: {
            ...config.algolia.primaryIndex,
            name: 'other-products',
          },
        },
      }),
    )
    await waitFor(() => expect(search).toHaveBeenCalledTimes(3))
    act(() =>
      store.set(activeConfigAtom, {
        ...config,
        algolia: { ...config.algolia, appId: 'OTHER_APP' },
      }),
    )
    await waitFor(() => expect(search).toHaveBeenCalledTimes(4))
    search.mockResolvedValue({
      results: [{ hits: [{ objectID: 'A', thumbnail: 'thumb.jpg' }] }],
    })
    act(() =>
      store.set(activeConfigAtom, {
        ...config,
        algolia: {
          ...config.algolia,
          primaryIndex: {
            ...config.algolia.primaryIndex,
            template: { attributes: { name: 'name', image: 'thumbnail' } },
          },
        },
      }),
    )
    await waitFor(() => expect(result.current.get('Tools')).toBe('thumb.jpg'))
    expect(search).toHaveBeenCalledTimes(5)
  })

  it('returns an empty image for an empty response or missing image', async () => {
    const { Wrapper, search } = setup()
    search.mockResolvedValue({
      results: [{ hits: [] }, { hits: [{ objectID: 'B' }] }],
    })
    const { result } = renderHook(
      () => usePreviewImages(['Tools', 'Safety'], 'categoryPageId', 'images'),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    expect(result.current.get('Tools')).toBeNull()
    expect(result.current.get('Safety')).toBeNull()
  })

  it('does not fetch without an image mapping', () => {
    const { Wrapper, store, config, search } = setup()
    store.set(activeConfigAtom, {
      ...config,
      algolia: { ...config.algolia, primaryIndex: { name: 'products' } },
    })
    renderHook(() => usePreviewImages(['Tools'], 'categoryPageId', 'images'), {
      wrapper: Wrapper,
    })
    expect(search).not.toHaveBeenCalled()
  })
})

const buildStore = () =>
  createTestStore((store) => {
    store.set(activeConfigAtom, previewConfig())
    store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
    store.set(searchClientKeyAtom, 'standard')
  })

const renderPreviewImages = (store: ReturnType<typeof buildStore>) =>
  renderHook(() => usePreviewImages(ITEMS, 'type', 'ingredientPreviews'), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })

describe('usePreviewImages', () => {
  beforeEach(() => {
    searchMock.mockReset()
    searchMock.mockResolvedValue({
      results: [{ hits: [{ objectID: 'p1', image: 'milk.jpg' }] }],
    })
  })

  it('resolves each item to a prefixed image URL', async () => {
    const { result } = renderPreviewImages(buildStore())

    await waitFor(() =>
      expect(result.current.get('whole_milk')).toBe(
        'https://cdn.example.com/milk.jpg',
      ),
    )
  })

  // Swapping the client changes no search parameter, so its identity is the only
  // thing that can invalidate these previews when the composition toggle moves.
  it('refetches when the installed search client swaps pipelines', async () => {
    const store = buildStore()
    const { result } = renderPreviewImages(store)

    await waitFor(() => expect(result.current.size).toBe(1))
    expect(searchMock).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })
})
