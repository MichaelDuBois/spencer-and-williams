import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EcommerceProductCard } from '@/features/aiAssistant/components/messages/ecommerce/EcommerceProductCard'
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

const product: DisplayProduct = { objectID: 'p1', why: 'Best seller' }

const productData = {
  objectID: 'p1',
  productUrl: '/ecommerce/product/p1',
  name: 'Trail Runner',
  brand: 'Stride',
  image: 'https://cdn/shoe.jpg',
  price: 120,
} as ProductData

const renderCard = () => {
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(['product', product.objectID], productData)
  return render(<EcommerceProductCard product={product} />, { queryClient })
}

describe('EcommerceProductCard', () => {
  beforeEach(() => {
    addItemMock.mockReset()
    addItemMock.mockReturnValue(true)
    sendAddToCartEventMock.mockClear()
  })

  it('adds the product once and tracks it as an assistant add', () => {
    renderCard()

    fireEvent.click(screen.getByRole('button'))

    expect(addItemMock).toHaveBeenCalledTimes(1)
    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ objectID: 'p1', quantity: 1 }),
    )
    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
    expect(sendAddToCartEventMock).toHaveBeenCalledWith(
      { objectID: 'p1', queryID: undefined, price: 120, quantity: 1 },
      { surface: 'assistant' },
    )
  })

  it('tracks nothing when the cart refuses the product', () => {
    addItemMock.mockReturnValue(false)
    renderCard()

    fireEvent.click(screen.getByRole('button'))

    expect(sendAddToCartEventMock).not.toHaveBeenCalled()
  })
})
