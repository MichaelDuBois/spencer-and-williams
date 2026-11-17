import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ElectronicsProductCard } from '@/features/aiAssistant/components/messages/electronics/ElectronicsProductCard'
import type {
  DisplayProduct,
  ProductData,
} from '@/features/aiAssistant/types'

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

const product: DisplayProduct = { objectID: 'e1', why: 'Great for editing' }

const productData = {
  objectID: 'e1',
  productUrl: '/electronics/product/e1',
  name: 'ProBook 16',
  brand: 'Acme',
  image: 'https://cdn/laptop.jpg',
  price: 1299,
  screenSize: '16 in',
  storage: '1 TB',
  cpu: 'M3 Pro',
} as ProductData

const renderCard = (data?: ProductData) => {
  const queryClient = createTestQueryClient()
  if (data) {
    queryClient.setQueryData(['product', product.objectID], data)
  }
  return render(<ElectronicsProductCard product={product} />, { queryClient })
}

describe('ElectronicsProductCard', () => {
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

  it('links to the electronics product detail page', () => {
    renderCard(productData)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/electronics/product/e1',
    )
  })

  it('renders the brand, name, price, and "why" badge', () => {
    renderCard(productData)

    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('ProBook 16')).toBeInTheDocument()
    expect(screen.getByText('$1299')).toBeInTheDocument()
    expect(screen.getByText('Great for editing')).toBeInTheDocument()
  })

  it('renders the key specs (screen, storage, cpu)', () => {
    renderCard(productData)

    expect(screen.getByText('16 in')).toBeInTheDocument()
    expect(screen.getByText('1 TB')).toBeInTheDocument()
    expect(screen.getByText('M3 Pro')).toBeInTheDocument()
  })

  it('falls back to hardDiskSize when storage is absent', () => {
    renderCard({
      ...productData,
      storage: undefined,
      hardDiskSize: '512 GB SSD',
    } as ProductData)

    expect(screen.getByText('512 GB SSD')).toBeInTheDocument()
  })

  it('omits specs that are not present in cached data', () => {
    renderCard({
      ...productData,
      screenSize: undefined,
      storage: undefined,
      hardDiskSize: undefined,
      cpu: undefined,
    } as ProductData)

    expect(screen.queryByText('16 in')).not.toBeInTheDocument()
    expect(screen.queryByText('M3 Pro')).not.toBeInTheDocument()
  })

  it('adds the product to the cart from the add button', () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button'))

    expect(addItemMock).toHaveBeenCalledTimes(1)
    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ objectID: 'e1', quantity: 1 }),
    )
  })

  it('tracks the add once as an assistant add', () => {
    renderCard(productData)

    fireEvent.click(screen.getByRole('button'))

    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
    expect(sendAddToCartEventMock).toHaveBeenCalledWith(
      { objectID: 'e1', queryID: undefined, price: 1299, quantity: 1 },
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
