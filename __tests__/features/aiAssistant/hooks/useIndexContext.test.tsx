import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { describe, expect, it, vi } from 'vitest'

import { useIndexContext } from '@/features/aiAssistant/hooks/useIndexContext'
import { activeConfigAtom } from '@/stores/activeConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'

import type { ReactNode } from 'react'

const facets = [
  {
    attribute: ['hierarchical_categories.lvl0', 'hierarchical_categories.lvl1'],
    label: 'Category',
    type: 'hierarchical' as const,
  },
  { attribute: 'brand', label: 'Brand', type: 'refinement' as const },
  { attribute: 'price.value', label: 'Price', type: 'slider' as const },
]

const buildConfig = (withFacets = true) =>
  ({
    slug: 'fashion',
    features: { agentStudio: { searchFilters: true } },
    algolia: {
      appId: 'APP',
      apiKey: 'KEY',
      primaryIndex: {
        name: 'fashion_ns',
        facets: withFacets ? [...facets] : [],
      },
    },
  }) as unknown as VerticalConfig

const facetResponse = {
  hits: [],
  facets: {
    'hierarchical_categories.lvl0': { Women: 400 },
    brand: { Nike: 10 },
  },
  facets_stats: { 'price.value': { min: 5, max: 500 } },
}

const buildSearchClient = () => {
  return {
    search: vi.fn(async () => {
      return { results: [facetResponse] }
    }),
  }
}

const wrap = (
  store: ReturnType<typeof createStore>,
  queryClient: QueryClient,
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
  return Wrapper
}

const renderIndexContext = (
  searchClient: { search: unknown },
  config: VerticalConfig,
) => {
  const store = createStore()
  store.set(activeConfigAtom, config)
  store.set(baseSearchClientAtom, searchClient as never)

  return renderHook(() => useIndexContext(), {
    wrapper: wrap(store, new QueryClient()),
  })
}

describe('useIndexContext', () => {
  it('requests the configured facet attributes with an empty query', async () => {
    const searchClient = buildSearchClient()
    const { result } = renderIndexContext(searchClient, buildConfig())

    await act(async () => {
      await result.current.ensureIndexContext()
    })

    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'fashion_ns',
        query: '',
        params: {
          hitsPerPage: 0,
          facets: ['hierarchical_categories.lvl0', 'brand', 'price.value'],
          maxValuesPerFacet: 20,
        },
      },
    ])
  })

  it('omits facets excluded from agent context', async () => {
    const searchClient = buildSearchClient()
    const config = buildConfig()
    config.algolia.primaryIndex!.facets!.push({
      attribute: 'visible_by',
      label: 'Visible by',
      type: 'refinement',
      includeInAgentContext: false,
    })
    const { result } = renderIndexContext(searchClient, config)

    await act(async () => {
      await result.current.ensureIndexContext()
    })

    expect(searchClient.search).toHaveBeenCalledWith([
      expect.objectContaining({
        params: expect.objectContaining({
          facets: ['hierarchical_categories.lvl0', 'brand', 'price.value'],
        }),
      }),
    ])
  })

  it('does not fetch context when every facet is excluded', async () => {
    const searchClient = buildSearchClient()
    const config = buildConfig()
    config.algolia.primaryIndex!.facets = [
      {
        attribute: 'visible_by',
        label: 'Visible by',
        type: 'refinement',
        includeInAgentContext: false,
      },
    ]
    const { result } = renderIndexContext(searchClient, config)

    await act(async () => {
      expect(await result.current.ensureIndexContext()).toBeNull()
    })

    expect(searchClient.search).not.toHaveBeenCalled()
  })

  it('resolves the formatted context block', async () => {
    const { result } = renderIndexContext(buildSearchClient(), buildConfig())

    let context: string | null = null
    await act(async () => {
      context = await result.current.ensureIndexContext()
    })

    expect(context).toContain('[Index context:')
    expect(context).toContain('brand: "Nike"')
    expect(context).toContain('price.value (numeric): min 5, max 500')
  })

  it('serves the cached block on later calls without refetching', async () => {
    const searchClient = buildSearchClient()
    const { result } = renderIndexContext(searchClient, buildConfig())

    await act(async () => {
      await result.current.ensureIndexContext()
      await result.current.ensureIndexContext()
      await result.current.ensureIndexContext()
    })

    expect(searchClient.search).toHaveBeenCalledTimes(1)
  })

  it('resolves null without searching when the vertical configures no facets', async () => {
    const searchClient = buildSearchClient()
    const { result } = renderIndexContext(searchClient, buildConfig(false))

    let context: string | null = 'unset'
    await act(async () => {
      context = await result.current.ensureIndexContext()
    })

    expect(context).toBeNull()
    expect(searchClient.search).not.toHaveBeenCalled()
  })

  it('resolves null instead of rejecting when the facet request fails', async () => {
    const searchClient = {
      search: vi.fn(async () => Promise.reject(new Error('boom'))),
    }
    const { result } = renderIndexContext(searchClient, buildConfig())

    let context: string | null = 'unset'
    await act(async () => {
      context = await result.current.ensureIndexContext()
    })

    expect(context).toBeNull()
  })

  it('resolves null without searching when the vertical has not opted into searchFilters', async () => {
    const searchClient = buildSearchClient()
    const config = {
      ...buildConfig(),
      features: { agentStudio: {} },
    } as unknown as VerticalConfig
    const { result } = renderIndexContext(searchClient, config)

    let context: string | null = 'unset'
    await act(async () => {
      context = await result.current.ensureIndexContext()
    })

    expect(context).toBeNull()
    expect(searchClient.search).not.toHaveBeenCalled()
  })
})

it('isolates facet values by catalog filters and rejects obsolete context', async () => {
  const store = createStore()
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const searchClient = {
    search: vi.fn().mockResolvedValue({ results: [facetResponse] }),
  }
  store.set(activeConfigAtom, buildConfig())
  store.set(baseSearchClientAtom, searchClient as never)
  const controller = new AbortController()
  const { result, rerender } = renderHook(
    ({ filters, signal }) => useIndexContext({ filters }, signal),
    {
      initialProps: {
        filters: 'visible_by:"group0"',
        signal: controller.signal,
      },
      wrapper: wrap(store, queryClient),
    },
  )
  expect(await result.current.ensureIndexContext()).toContain('Nike')
  const oldEnsure = result.current.ensureIndexContext
  controller.abort()
  await expect(oldEnsure()).rejects.toMatchObject({ name: 'AbortError' })
  searchClient.search.mockResolvedValue({
    results: [
      {
        ...facetResponse,
        facets: { ...facetResponse.facets, brand: { Makita: 2 } },
      },
    ],
  })
  rerender({
    filters: 'visible_by:"group1"',
    signal: new AbortController().signal,
  })
  const context = await result.current.ensureIndexContext()
  expect(context).toContain('Makita')
  expect(context).not.toContain('Nike')
  expect(searchClient.search).toHaveBeenCalledTimes(2)
  expect(searchClient.search.mock.calls).toMatchObject([
    [[{ params: { filters: 'visible_by:"group0"' } }]],
    [[{ params: { filters: 'visible_by:"group1"' } }]],
  ])
})
