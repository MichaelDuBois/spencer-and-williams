import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AssistantCatalogContext } from '@/features/aiAssistant/AssistantCatalogContext'
import { B2BWarehouseProductCard } from '@/features/aiAssistant/components/messages/b2b-warehouse/B2BWarehouseProductCard'
import type { DisplayProduct, ProductData } from '@/features/aiAssistant/types'
import { activeConfigAtom } from '@/stores/activeConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'
import { createTestQueryClient, render } from '@tests/helpers/test-utils'

const { addItemMock, sendAddToCartEventMock } = vi.hoisted(() => {
  return { addItemMock: vi.fn(), sendAddToCartEventMock: vi.fn() }
})

vi.mock('search-insights', () => {
  return { default: vi.fn() }
})

vi.mock('@/hooks/useCart', () => {
  return {
    useCart: () => {
      return { addItem: addItemMock }
    },
  }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendAddToCartEvent: sendAddToCartEventMock }
    },
  }
})

vi.mock('@/features/aiAssistant/hooks/ui/useAssistantLinkClick', () => {
  return {
    useAssistantLinkClick: () => vi.fn(),
  }
})

vi.mock('next/link', () => {
  return {
    default: ({
      children,
      href,
      onClick,
    }: {
      children: React.ReactNode
      href: string
      onClick?: () => void
    }) => (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    ),
  }
})

const catalog = {
  queryOptions: {},
  productCacheKey: ['b2b-products', 'group-0'],
  isReady: true,
  sessionKey: '0',
  context: '',
  productContext: null,
  resetSession: vi.fn(),
}

const product: DisplayProduct = { objectID: 'w1', why: 'Bulk pick' }

const productData = {
  objectID: 'w1',
  productUrl: '/b2b-warehouse/product/w1',
  name: 'Titanium Drill Bit Set',
  sku: 'IDB-SET-12',
  brand: 'IronForge',
  image: 'https://cdn/drill.jpg',
  price: 129,
  rating: 4.5,
  reviewsCount: 88,
  info: { Material: 'Titanium', 'Shank Type': 'Hex' },
} as ProductData

const renderCard = (data?: ProductData, catalogHits = [productData]) => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    s.set(
      baseSearchClientAtom,
      createMockSearchClient({
        search: vi
          .fn()
          .mockResolvedValue({ results: [{ hits: catalogHits }] }),
      }),
    )
  })
  const queryClient = createTestQueryClient()
  if (data) {
    queryClient.setQueryData(
      [...catalog.productCacheKey, product.objectID],
      data,
    )
  }
  return render(
    <AssistantCatalogContext.Provider value={catalog}>
      <B2BWarehouseProductCard product={product} />
    </AssistantCatalogContext.Provider>,
    { queryClient, store },
  )
}

describe('B2BWarehouseProductCard', () => {
  beforeEach(() => {
    addItemMock.mockReset()
    addItemMock.mockReturnValue(true)
    sendAddToCartEventMock.mockClear()
  })

  it('renders the loading skeleton until cached product data arrives', () => {
    const { container } = renderCard()

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('links to the b2b-warehouse product detail page', () => {
    renderCard(productData)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/b2b-warehouse/product/w1',
    )
  })

  it('renders the brand, name, SKU, price, and "why" badge', () => {
    renderCard(productData)

    expect(screen.getByText('IronForge')).toBeInTheDocument()
    expect(screen.getByText('Titanium Drill Bit Set')).toBeInTheDocument()
    expect(screen.getByText('SKU: IDB-SET-12')).toBeInTheDocument()
    expect(screen.getByText('$129.00')).toBeInTheDocument()
    expect(screen.getByText('Bulk pick')).toBeInTheDocument()
  })

  it('renders the rating with review count', () => {
    renderCard(productData)

    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(88)')).toBeInTheDocument()
  })

  it('renders up to two spec rows from the product info', () => {
    renderCard(productData)

    expect(screen.getByText('Material')).toBeInTheDocument()
    expect(screen.getByText('Titanium')).toBeInTheDocument()
    expect(screen.getByText('Shank Type')).toBeInTheDocument()
    expect(screen.getByText('Hex')).toBeInTheDocument()
  })

  it('falls back to a "No image" placeholder when no image is cached', () => {
    renderCard({ ...productData, image: undefined } as ProductData)

    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('adds the product to the cart from the add button', async () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(addItemMock).toHaveBeenCalledWith(
        expect.objectContaining({ objectID: 'w1', price: 129, quantity: 1 }),
      ),
    )
  })

  it('tracks the revalidated add once as an assistant add', async () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(sendAddToCartEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ objectID: 'w1', quantity: 1 }),
        { surface: 'assistant' },
      ),
    )
    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
  })

  it('adds and tracks nothing when revalidation rejects the product', async () => {
    renderCard(productData, [])

    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(addItemMock).not.toHaveBeenCalled()
    expect(sendAddToCartEventMock).not.toHaveBeenCalled()
  })
})

it('does not turn an ID from another scope or the legacy cache into an actionable card', () => {
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(['product', 'w1'], productData)
  queryClient.setQueryData(['b2b-products', 'group-1', 'w1'], productData)
  render(
    <AssistantCatalogContext.Provider value={catalog}>
      <B2BWarehouseProductCard product={product} />
    </AssistantCatalogContext.Provider>,
    { queryClient },
  )
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it('ignores an add action after its session was aborted', () => {
  addItemMock.mockClear()
  sendAddToCartEventMock.mockClear()
  const queryClient = createTestQueryClient()
  queryClient.setQueryData([...catalog.productCacheKey, 'w1'], productData)
  const controller = new AbortController()
  render(
    <AssistantCatalogContext.Provider
      value={{ ...catalog, signal: controller.signal }}>
      <B2BWarehouseProductCard product={product} />
    </AssistantCatalogContext.Provider>,
    { queryClient },
  )
  controller.abort()
  fireEvent.click(screen.getByRole('button'))
  expect(addItemMock).not.toHaveBeenCalled()
  expect(sendAddToCartEventMock).not.toHaveBeenCalled()
})
