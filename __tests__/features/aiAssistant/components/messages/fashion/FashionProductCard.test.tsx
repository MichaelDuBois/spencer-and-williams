import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FashionProductCard } from '@/features/aiAssistant/components/messages/fashion/FashionProductCard'
import type { DisplayProduct, ProductData } from '@/features/aiAssistant/types'

import { createTestQueryClient, render } from '@tests/helpers/test-utils'

const { addItemMock, sendAddToCartEventMock } = vi.hoisted(() => {
  return { addItemMock: vi.fn(), sendAddToCartEventMock: vi.fn() }
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

const product: DisplayProduct = { objectID: 'f1', why: 'On-trend pick' }

const productData = {
  objectID: 'f1',
  productUrl: '/fashion/product/f1',
  name: 'Linen Blazer',
  brand: 'Maison',
  image: 'https://cdn/blazer.jpg',
  price: 249,
} as ProductData

const renderCard = (data?: ProductData) => {
  const queryClient = createTestQueryClient()
  if (data) {
    queryClient.setQueryData(['product', product.objectID], data)
  }
  return render(<FashionProductCard product={product} />, { queryClient })
}

describe('FashionProductCard', () => {
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

  it('links to the fashion product detail page', () => {
    renderCard(productData)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/fashion/product/f1',
    )
  })

  it('renders the brand, name, price, and "why" badge', () => {
    renderCard(productData)

    expect(screen.getByText('Maison')).toBeInTheDocument()
    expect(screen.getByText('Linen Blazer')).toBeInTheDocument()
    expect(screen.getByText('$249')).toBeInTheDocument()
    expect(screen.getByText('On-trend pick')).toBeInTheDocument()
  })

  it('adds the product to the cart from the add button', () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button'))

    expect(addItemMock).toHaveBeenCalledTimes(1)
    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ objectID: 'f1', quantity: 1 }),
    )
  })

  it('tracks the add once as an assistant add', () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button'))

    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
    expect(sendAddToCartEventMock).toHaveBeenCalledWith(
      { objectID: 'f1', queryID: undefined, price: 249, quantity: 1 },
      { surface: 'assistant' },
    )
  })

  it('tracks nothing when the cart refuses the product', () => {
    addItemMock.mockReturnValue(false)
    renderCard(productData)

    fireEvent.click(screen.getByRole('button'))

    expect(sendAddToCartEventMock).not.toHaveBeenCalled()
  })
})
