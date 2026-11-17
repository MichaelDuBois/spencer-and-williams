import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CartPageContent } from '@/components/cart/CartPageContent'

const { useActiveConfig } = vi.hoisted(() => {return { useActiveConfig: vi.fn() }})

vi.mock('@/hooks/useActiveConfig', () => {return { useActiveConfig }})
vi.mock('@/hooks/useCart', () => {return {
  useCart: () => {return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
  }},
}})
vi.mock('@/hooks/useCheckout', () => {return {
  useCheckout: () => {return { checkout: vi.fn(), canCheckout: false }},
}})

describe('CartPageContent', () => {
  beforeEach(() => {
    useActiveConfig.mockReturnValue({
      features: { orderHistory: { enabled: true } },
    })
  })

  it('links to order history from an empty fashion shopping bag', () => {
    render(
      <CartPageContent
        variant="editorial"
        basePath="/fashion"
        recommendRenderItem={() => null}
      />,
    )

    expect(screen.getByText('Your shopping bag is empty.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view order history/i })).toHaveAttribute(
      'href',
      '/fashion/orders',
    )
  })

  it('hides the empty-bag history link when the feature is disabled', () => {
    useActiveConfig.mockReturnValue({
      features: { orderHistory: { enabled: false } },
    })
    render(
      <CartPageContent
        variant="editorial"
        basePath="/fashion"
        recommendRenderItem={() => null}
      />,
    )

    expect(screen.queryByRole('link', { name: /view order history/i })).toBeNull()
  })

  it('keeps the empty-state history link out of the standard cart', () => {
    render(
      <CartPageContent
        variant="standard"
        basePath="/ecommerce"
        recommendRenderItem={() => null}
      />,
    )

    const emptyState = screen.getByText('Your cart is empty.').parentElement as HTMLElement

    expect(within(emptyState).queryByRole('link', { name: /view order history/i })).toBeNull()
    expect(screen.getAllByRole('link', { name: /view order history/i })).toHaveLength(1)
  })
})
