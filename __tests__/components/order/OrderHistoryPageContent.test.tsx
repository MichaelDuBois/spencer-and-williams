import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrderHistoryPageContent } from '@/components/order/OrderHistoryPageContent'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

import { createMockCartItem } from '../../helpers/test-utils'

const mocks = vi.hoisted(() => {return {
  orders: [] as OrderHistoryEntry[],
  openWithMessage: vi.fn(),
}})

vi.mock('@/hooks/useOrderHistory', () => {return {
  useOrderHistory: () => {return {
    orders: mocks.orders,
    addOrderToHistory: vi.fn(),
    personaKey: 'guest',
  }},
}})

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => {return { slug: 'ecommerce' }},
}})

vi.mock('@/features/aiAssistant/hooks/ui/useOpenAssistantPanel', () => {return {
  useOpenAssistantPanel: () => {return { openWithMessage: mocks.openWithMessage }},
}})

const buildOrder = (id: string): OrderHistoryEntry => {return {
  id,
  items: [createMockCartItem({ objectID: id, name: `Item ${id}` })],
  subtotal: 20,
  shipping: 0,
  total: 20,
  createdAt: Date.now(),
}}

describe('OrderHistoryPageContent', () => {
  beforeEach(() => {
    mocks.orders = []
    mocks.openWithMessage.mockClear()
  })

  it('shows an empty state when there are no orders', () => {
    render(<OrderHistoryPageContent />)
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /ask about your orders/i }),
    ).not.toBeInTheDocument()
  })

  it('renders a card per order and the page-level Ask button', () => {
    mocks.orders = [buildOrder('SW-A'), buildOrder('SW-B')]
    render(<OrderHistoryPageContent />)

    expect(screen.getByText('SW-A')).toBeInTheDocument()
    expect(screen.getByText('SW-B')).toBeInTheDocument()
    expect(screen.queryByText('No orders yet')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /ask about your orders/i }),
    )
    expect(mocks.openWithMessage).toHaveBeenCalledTimes(1)
    const [, options] = mocks.openWithMessage.mock.calls[0]
    expect(options.orderContext.orderId).toBe('SW-A')
  })
})
