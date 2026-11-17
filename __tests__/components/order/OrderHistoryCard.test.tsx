import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrderHistoryCard } from '@/components/order/OrderHistoryCard'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

import { createMockCartItem } from '../../helpers/test-utils'

const { openWithMessage } = vi.hoisted(() => {return { openWithMessage: vi.fn() }})

vi.mock('@/features/aiAssistant/hooks/ui/useOpenAssistantPanel', () => {return {
  useOpenAssistantPanel: () => {return { openWithMessage }},
}})

const buildOrder = (
  overrides: Partial<OrderHistoryEntry> = {},
): OrderHistoryEntry => {return {
  id: 'SW-TEST-0001',
  items: [
    createMockCartItem({
      objectID: 'A',
      name: 'Alpha Widget',
      price: 10,
      quantity: 2,
    }),
  ],
  subtotal: 20,
  shipping: 0,
  total: 20,
  createdAt: Date.now(),
  ...overrides,
}}

const renderCard = (overrides: Partial<OrderHistoryEntry> = {}) =>
  render(<OrderHistoryCard order={buildOrder(overrides)} basePath="/ecommerce" />)

describe('OrderHistoryCard', () => {
  beforeEach(() => {
    openWithMessage.mockClear()
  })

  it('renders the summary row with id, total, and item count', () => {
    renderCard()
    expect(screen.getByText('SW-TEST-0001')).toBeInTheDocument()
    expect(screen.getByText('$20.00')).toBeInTheDocument()
    expect(screen.getByText(/2 items/)).toBeInTheDocument()
  })

  it('hides line items until the card is expanded', () => {
    renderCard()
    expect(screen.queryByText('Alpha Widget')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /SW-TEST-0001/ }))
    expect(screen.getByText('Alpha Widget')).toBeInTheDocument()
  })

  it('opens the assistant with the order context when Ask AI is clicked', () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /SW-TEST-0001/ }))
    fireEvent.click(
      screen.getByRole('button', { name: /ask ai about this order/i }),
    )

    expect(openWithMessage).toHaveBeenCalledTimes(1)
    const [, options] = openWithMessage.mock.calls[0]
    expect(options.orderContext.orderId).toBe('SW-TEST-0001')
    expect(options.navigate).toBe(false)
  })
})
