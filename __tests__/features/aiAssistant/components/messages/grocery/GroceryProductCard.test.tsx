import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GroceryProductCard } from '@/features/aiAssistant/components/messages/grocery/GroceryProductCard'
import type {
  DisplayProduct,
  ProductData,
} from '@/features/aiAssistant/types'

import {
  createTestQueryClient,
  render,
} from '@tests/helpers/test-utils'


const { addItemMock, sendAddToCartEventMock } = vi.hoisted(() => {
  return { addItemMock: vi.fn(), sendAddToCartEventMock: vi.fn() }
})

vi.mock('@/hooks/useCart', () => {return {
  useCart: () => {return { addItem: addItemMock }},
}})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendAddToCartEvent: sendAddToCartEventMock }
    },
  }
})

vi.mock(
  '@/features/aiAssistant/hooks/ui/useAssistantLinkClick',
  () => {return {
    useAssistantLinkClick: () => vi.fn(),
  }},
)

vi.mock('next/link', () => {return {
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
}})

const product: DisplayProduct = { objectID: 'g1', why: 'Organic pick' }

const productData = {
  objectID: 'g1',
  productUrl: '/grocery/product/g1',
  name: 'Organic Bananas',
  brand: 'Fresh Farms',
  image: 'https://cdn/banana.jpg',
  price: 2.99,
} as ProductData

const renderCard = (data?: ProductData) => {
  const queryClient = createTestQueryClient()
  if (data) {
    queryClient.setQueryData(['product', product.objectID], data)
  }
  return render(<GroceryProductCard product={product} />, { queryClient })
}

describe('GroceryProductCard', () => {
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

  it('links to the grocery product detail page', () => {
    renderCard(productData)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/grocery/product/g1',
    )
  })

  it('renders the brand, name, price, and "why" badge', () => {
    renderCard(productData)

    expect(screen.getByText('Fresh Farms')).toBeInTheDocument()
    expect(screen.getByText('Organic Bananas')).toBeInTheDocument()
    expect(screen.getByText('$2.99')).toBeInTheDocument()
    expect(screen.getByText('Organic pick')).toBeInTheDocument()
  })

  it('renders the image with the cached src via next/image', () => {
    const { container } = renderCard(productData)

    expect(
      container.querySelector('img[src="https://cdn/banana.jpg"]'),
    ).toBeInTheDocument()
  })

  it('falls back to a "No image" placeholder when no image is cached', () => {
    renderCard({ ...productData, image: undefined } as ProductData)

    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('renders the serving size when present in cached data', () => {
    renderCard({
      ...productData,
      nutrition: { servingSize: '1 cup (30g)' },
    } as ProductData)

    expect(screen.getByText('1 cup (30g)')).toBeInTheDocument()
  })

  it('omits the serving size when not present', () => {
    renderCard(productData)

    expect(screen.queryByText('1 cup (30g)')).not.toBeInTheDocument()
  })

  it('adds the product to the cart from the add button', () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button', { name: /add/i }))

    expect(addItemMock).toHaveBeenCalledTimes(1)
    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ objectID: 'g1', quantity: 1 }),
    )
  })

  it('tracks the add once as an assistant add', () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button', { name: /add/i }))

    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
    expect(sendAddToCartEventMock).toHaveBeenCalledWith(
      { objectID: 'g1', queryID: undefined, price: 2.99, quantity: 1 },
      { surface: 'assistant' },
    )
  })

  it('tracks nothing when the cart refuses the product', () => {
    addItemMock.mockReturnValue(false)
    renderCard(productData)

    fireEvent.click(screen.getByRole('button', { name: /add/i }))

    expect(sendAddToCartEventMock).not.toHaveBeenCalled()
  })
})
