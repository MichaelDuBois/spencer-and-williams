import { render, screen } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProductPageShell } from '@/components/pdp/ProductPageShell'
import { productContextState } from '@/features/aiAssistant/stores/aiAssistant'

import type { ReactNode } from 'react'

vi.mock('next/navigation', () => {return {
  useParams: () => {return { id: 'prod-1' }},
}})

const extractedHitMock = vi.fn()
vi.mock('@/hooks/useExtractedHit', () => {return {
  useExtractedHit: () => extractedHitMock(),
}})

vi.mock('@/components/product/ProductLoadingState', () => {return {
  ProductLoadingState: () => <div>loading-state</div>,
}})

vi.mock('@/components/pdp/PdpNotFoundState', () => {return {
  PdpNotFoundState: ({
    title,
    backLabel,
  }: {
    title: string
    backLabel: string
  }) => (
    <div>
      <span>{title}</span>
      <span>{backLabel}</span>
    </div>
  ),
}})

// Minimal config + product satisfying the shell's structural requirements.
const config = {
  slug: 'ecommerce',
  algolia: { primaryIndex: { template: { name: 'tmpl' } } },
}
const product = { objectID: 'prod-1', name: 'Test Product' }
const extractor = vi.fn()

const renderShell = (
  props: Partial<Parameters<typeof ProductPageShell>[0]> = {},
  store = createStore(),
) => {
  render(
    <Provider store={store}>
      <ProductPageShell
        config={config}
        extractor={extractor as never}
        {...props}>
        {(p) => <div>viewing:{(p as typeof product).name}</div>}
      </ProductPageShell>
    </Provider> as ReactNode,
  )
  return store
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('ProductPageShell', () => {
  it('renders the loading state while fetching', () => {
    extractedHitMock.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    })

    renderShell()

    expect(screen.getByText('loading-state')).toBeInTheDocument()
    expect(screen.queryByText(/viewing:/)).not.toBeInTheDocument()
  })

  it('renders the not-found state on error', () => {
    extractedHitMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    })

    renderShell()

    expect(screen.getByText('Product not found')).toBeInTheDocument()
    expect(screen.getByText('Back to products')).toBeInTheDocument()
  })

  it('renders the not-found state when data is missing', () => {
    extractedHitMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    })

    renderShell()

    expect(screen.getByText('Product not found')).toBeInTheDocument()
  })

  it('supports a custom not-found back label', () => {
    extractedHitMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    })

    renderShell({ notFoundBackLabel: 'Back to collection' })

    expect(screen.getByText('Back to collection')).toBeInTheDocument()
  })

  it('renders children with the resolved product once loaded', () => {
    extractedHitMock.mockReturnValue({
      data: product,
      isLoading: false,
      isError: false,
    })

    renderShell()

    expect(screen.getByText('viewing:Test Product')).toBeInTheDocument()
  })

  it('reports the product to the AI assistant context', () => {
    extractedHitMock.mockReturnValue({
      data: product,
      isLoading: false,
      isError: false,
    })

    const store = renderShell()

    expect(store.get(productContextState)).toEqual(product)
  })

  it('does not set assistant context while loading', () => {
    extractedHitMock.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    })

    const store = renderShell()

    expect(store.get(productContextState)).toBeNull()
  })
})
