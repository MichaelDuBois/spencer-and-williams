import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FurnishingProductCard } from '@/features/aiAssistant/components/messages/furnishing/FurnishingProductCard'
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

const product: DisplayProduct = { objectID: 'f1', why: 'Perfect for small spaces' }

const productData = {
  objectID: 'f1',
  productUrl: '/furnishing/product/f1',
  name: 'Nordic Sofa',
  brand: 'Aalto',
  image: 'https://cdn/sofa.jpg',
  price: 899,
  dimensions: '200 x 90 x 85 cm',
  material: 'Oak',
  roomType: 'Living Room',
} as ProductData

const renderCard = (data?: ProductData) => {
  const queryClient = createTestQueryClient()
  if (data) {
    queryClient.setQueryData(['product', product.objectID], data)
  }
  return render(<FurnishingProductCard product={product} />, { queryClient })
}

describe('FurnishingProductCard', () => {
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

  it('links to the furnishing product detail page', () => {
    renderCard(productData)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/furnishing/product/f1',
    )
  })

  it('renders the brand, name, price, and "why" badge', () => {
    renderCard(productData)

    expect(screen.getByText('Aalto')).toBeInTheDocument()
    expect(screen.getByText('Nordic Sofa')).toBeInTheDocument()
    expect(screen.getByText('$899')).toBeInTheDocument()
    expect(screen.getByText('Perfect for small spaces')).toBeInTheDocument()
  })

  it('renders the key specs (dimensions, material, room type)', () => {
    renderCard(productData)

    expect(screen.getByText('200 x 90 x 85 cm')).toBeInTheDocument()
    expect(screen.getByText('Oak')).toBeInTheDocument()
    expect(screen.getByText('Living Room')).toBeInTheDocument()
  })

  it('falls back to frameMaterial when material is absent', () => {
    renderCard({
      ...productData,
      material: undefined,
      frameMaterial: 'Solid Walnut',
    } as ProductData)

    expect(screen.getByText('Solid Walnut')).toBeInTheDocument()
  })

  it('omits specs that are not present in cached data', () => {
    renderCard({
      ...productData,
      dimensions: undefined,
      material: undefined,
      frameMaterial: undefined,
      upholsteryFabric: undefined,
      roomType: undefined,
    } as ProductData)

    expect(screen.queryByText('200 x 90 x 85 cm')).not.toBeInTheDocument()
    expect(screen.queryByText('Living Room')).not.toBeInTheDocument()
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
      { objectID: 'f1', queryID: undefined, price: 899, quantity: 1 },
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
