import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OrderItemsSummary } from '@/components/order/OrderItemsSummary/OrderItemsSummary'
import type { Order } from '@/stores/order'

import { createMockCartItem } from '../../helpers/test-utils'

const buildOrder = (overrides: Partial<Order> = {}): Order => {return {
  id: 'SW-12345-67890',
  items: [
    createMockCartItem({ objectID: 'A', name: 'Alpha', price: 10, quantity: 2 }),
    createMockCartItem({ objectID: 'B', name: 'Beta', price: 5, quantity: 1 }),
  ],
  subtotal: 25,
  shipping: 4.5,
  total: 29.5,
  createdAt: 0,
  ...overrides,
}}

describe('OrderItemsSummary', () => {
  it('lists every order item with its line total and quantity', () => {
    render(<OrderItemsSummary variant="standard" order={buildOrder()} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('$20.00')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
    expect(screen.getByText('Qty: 2')).toBeInTheDocument()
  })

  it('renders the subtotal, shipping, and total figures', () => {
    render(<OrderItemsSummary variant="standard" order={buildOrder()} />)
    expect(screen.getByText('$25.00')).toBeInTheDocument()
    expect(screen.getByText('$4.50')).toBeInTheDocument()
    expect(screen.getByText('$29.50')).toBeInTheDocument()
  })

  it('uses the "Order Details" title for the editorial variant', () => {
    render(<OrderItemsSummary variant="editorial" order={buildOrder()} />)
    expect(screen.getByText('Order Details')).toBeInTheDocument()
    expect(screen.getByText('Qty 2')).toBeInTheDocument()
  })
})
