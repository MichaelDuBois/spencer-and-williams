import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FashionOrderConfirmationPage from '@/app/fashion/order/[id]/page'

const { useAtomValue, openWithMessage } = vi.hoisted(() => {return {
  useAtomValue: vi.fn(),
  openWithMessage: vi.fn(),
}})

vi.mock('jotai', () => {return { useAtomValue, atom: vi.fn() }})
vi.mock('@/stores/order', () => {return { getOrderAtom: vi.fn() }})
vi.mock('@/features/aiAssistant/hooks/ui/useOpenAssistantPanel', () => {return {
  useOpenAssistantPanel: () => {return { openWithMessage }},
}})
vi.mock('@/components/order/DeliveryTracker', () => {return { DeliveryTracker: () => null }})
vi.mock('@/components/order/OrderConfirmationHeader', () => {return { OrderConfirmationHeader: () => null }})
vi.mock('@/components/order/OrderItemsSummary', () => {return { OrderItemsSummary: () => null }})

const order = {
  id: 'SW-123',
  items: [
    { objectID: 'shirt-1', name: 'White shirt', image: 'https://example.com/shirt.jpg', price: 30, quantity: 1 },
  ],
  subtotal: 30,
  shipping: 0,
  total: 30,
  createdAt: 123,
}

describe('fashion order confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAtomValue.mockReturnValue(order)
  })

  it('opens Ask AI with the completed order as context', () => {
    render(<FashionOrderConfirmationPage />)
    fireEvent.click(screen.getByRole('button', { name: /style your items/i }))

    expect(openWithMessage).toHaveBeenCalledWith(
      'How can I style the items I just ordered?',
      expect.objectContaining({
        clearHistory: true,
        expanded: true,
        navigate: false,
        orderContext: {
          orderId: 'SW-123',
          items: [{ objectID: 'shirt-1', name: 'White shirt', image: 'https://example.com/shirt.jpg', price: 30 }],
        },
      }),
    )
  })

  it('does not show Ask AI without an order', () => {
    useAtomValue.mockReturnValue(null)
    render(<FashionOrderConfirmationPage />)
    expect(screen.getByText('Order Not Found')).toBeInTheDocument()
    expect(screen.queryByText('Ask AI')).not.toBeInTheDocument()
  })
})
