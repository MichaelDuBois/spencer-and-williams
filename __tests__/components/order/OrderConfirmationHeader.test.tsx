import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OrderConfirmationHeader } from '@/components/order/OrderConfirmationHeader'

describe('OrderConfirmationHeader', () => {
  it('renders the standard confirmation with the order id', () => {
    render(
      <OrderConfirmationHeader variant="standard" orderId="SW-11111-22222" />,
    )
    expect(screen.getByText('Order Confirmed')).toBeInTheDocument()
    expect(screen.getByText('SW-11111-22222')).toBeInTheDocument()
  })

  it('renders the editorial confirmation heading with the order id', () => {
    render(
      <OrderConfirmationHeader variant="editorial" orderId="SW-33333-44444" />,
    )
    expect(screen.getByText('Your Order Is Confirmed')).toBeInTheDocument()
    expect(screen.getByText('SW-33333-44444')).toBeInTheDocument()
  })
})
