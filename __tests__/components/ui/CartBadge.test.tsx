import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CartBadge } from '@/components/ui/CartBadge'

const useCartMock = vi.fn()

vi.mock('@/hooks/useCart', () => {return {
  useCart: () => useCartMock(),
}})

vi.mock('next/link', () => {return {
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}})

const renderBadge = (totalItems: number) => {
  useCartMock.mockReturnValue({ totalItems })
  return render(<CartBadge href="/ecommerce/cart" />)
}

describe('CartBadge', () => {
  it('shows the item count when the cart is not empty', () => {
    renderBadge(3)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides the count badge when the cart is empty', () => {
    renderBadge(0)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('caps the displayed count at 99+', () => {
    renderBadge(150)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('exposes the count in the accessible label and links to the cart', () => {
    renderBadge(2)
    const link = screen.getByRole('link', { name: 'Cart with 2 items' })
    expect(link).toHaveAttribute('href', '/ecommerce/cart')
  })
})
