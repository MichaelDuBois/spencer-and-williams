import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { OrderNotFound } from '@/components/order/OrderNotFound'

vi.mock('next/link', () => {return {
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}})

describe('OrderNotFound', () => {
  it('renders the not-found message and a continue-shopping link', () => {
    render(
      <OrderNotFound variant="standard" continueShoppingHref="/ecommerce" />,
    )
    expect(screen.getByText('Order Not Found')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Continue Shopping' })
    expect(link).toHaveAttribute('href', '/ecommerce')
  })

  it('renders the editorial variant with the same link target', () => {
    render(
      <OrderNotFound variant="editorial" continueShoppingHref="/fashion" />,
    )
    expect(
      screen.getByRole('link', { name: 'Continue Shopping' }),
    ).toHaveAttribute('href', '/fashion')
  })
})
