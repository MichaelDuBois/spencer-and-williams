import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { DAY_MS } from '@/utilities/orderStatus'

describe('OrderStatusBadge', () => {
  it('renders "Processing" for a freshly created order', () => {
    render(<OrderStatusBadge createdAt={Date.now()} />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('renders "Shipped" for an order two days old', () => {
    render(<OrderStatusBadge createdAt={Date.now() - 2 * DAY_MS} />)
    expect(screen.getByText('Shipped')).toBeInTheDocument()
  })

  it('renders "Delivered" for an order five days old', () => {
    render(<OrderStatusBadge createdAt={Date.now() - 5 * DAY_MS} />)
    expect(screen.getByText('Delivered')).toBeInTheDocument()
  })

  it('prefers the status override over the age-derived status', () => {
    render(
      <OrderStatusBadge
        createdAt={Date.now() - 12 * DAY_MS}
        statusOverride="returned"
      />,
    )
    expect(screen.getByText('Returned')).toBeInTheDocument()
    expect(screen.queryByText('Delivered')).not.toBeInTheDocument()
  })
})
