import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { vi } from 'vitest'

import type { CartItem } from '@/stores/cart'
import type { VerticalConfig } from '@/types'

import type { LiteClient } from 'algoliasearch/lite'
import type { ReactElement, ReactNode } from 'react'

type TestStore = ReturnType<typeof createStore>

interface ProvidersOptions {
  store?: TestStore
  queryClient?: QueryClient
}

interface RenderWithProvidersOptions
  extends Omit<RenderOptions, 'wrapper'>,
    ProvidersOptions {}

/** QueryClient with retries disabled for deterministic tests. */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

/**
 * Builds the Jotai + React Query wrapper reusable by `render` and `renderHook`.
 * Returns the `Wrapper` plus the `store` / `queryClient`.
 */
export const buildProvidersWrapper = ({
  store = createStore(),
  queryClient = createTestQueryClient(),
}: ProvidersOptions = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
  return { Wrapper, store, queryClient }
}

/**
 * Custom render wrapping the component in the Jotai + React Query providers.
 * Returns the `store` and `queryClient` used so tests can assert on them.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { store, queryClient, ...options }: RenderWithProvidersOptions = {},
) => {
  const providers = buildProvidersWrapper({ store, queryClient })
  return {
    store: providers.store,
    queryClient: providers.queryClient,
    ...render(ui, { wrapper: providers.Wrapper, ...options }),
  }
}

/** Factory for a valid `CartItem` with partial overrides. */
export const createMockCartItem = (
  overrides: Partial<CartItem> = {},
): CartItem => {
  return {
    objectID: 'p1',
    name: 'Test Product',
    image: 'https://cdn.example.com/p1.jpg',
    price: 19.99,
    brand: 'Acme',
    quantity: 1,
    ...overrides,
  }
}

/** Factory for a minimal but valid `VerticalConfig` with partial overrides. */
export const createMockConfig = (
  overrides: Partial<VerticalConfig> = {},
): VerticalConfig => {
  return {
    slug: 'ecommerce',
    name: 'Ecommerce',
    description: 'Test vertical',
    assets: { favicon: '', logo: '', banner: '' },
    theme: 'ecommerce',
    algolia: {
      appId: 'APP_ID',
      apiKey: 'API_KEY',
      primaryIndex: { name: 'test_index' },
      indices: {},
    },
    features: { agentStudio: {} },
    ...overrides,
  }
}

/** Mocked Algolia client: `search` and `getRecommendations` are `vi.fn()`. */
export const createMockSearchClient = (
  overrides: Partial<Record<string, unknown>> = {},
): LiteClient =>
  ({
    search: vi.fn().mockResolvedValue({ results: [{ hits: [] }] }),
    getRecommendations: vi.fn().mockResolvedValue({ results: [] }),
    ...overrides,
  }) as unknown as LiteClient

export * from '@testing-library/react'
export { renderWithProviders as render }
