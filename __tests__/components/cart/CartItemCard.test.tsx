import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CartItemCard } from '@/components/cart/CartItemCard/CartItemCard'

import { createMockCartItem } from '../../helpers/test-utils'

const renderCard = (
  overrides: Parameters<typeof createMockCartItem>[0] = {},
  variant: 'standard' | 'editorial' = 'standard',
) => {
  const onUpdateQuantity = vi.fn()
  const onRemove = vi.fn()
  const item = createMockCartItem(overrides)
  render(
    <CartItemCard
      variant={variant}
      item={item}
      onUpdateQuantity={onUpdateQuantity}
      onRemove={onRemove}
    />,
  )
  return { onUpdateQuantity, onRemove, item }
}

describe('CartItemCard', () => {
  it('renders the brand, name, and line total (price × quantity)', () => {
    renderCard({ name: 'Widget', brand: 'Acme', price: 10, quantity: 3 })
    expect(screen.getByText('Widget')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('$30.00')).toBeInTheDocument()
  })

  it('decrements the quantity by one when the minus button is clicked', () => {
    const { onUpdateQuantity, item } = renderCard({ quantity: 2 })
    fireEvent.click(screen.getByLabelText('Decrease quantity'))
    expect(onUpdateQuantity).toHaveBeenCalledWith(item.objectID, 1)
  })

  it('increments the quantity by one when the plus button is clicked', () => {
    const { onUpdateQuantity, item } = renderCard({ quantity: 2 })
    fireEvent.click(screen.getByLabelText('Increase quantity'))
    expect(onUpdateQuantity).toHaveBeenCalledWith(item.objectID, 3)
  })

  it('removes the item when the remove button is clicked', () => {
    const { onRemove, item } = renderCard()
    fireEvent.click(screen.getByLabelText('Remove item'))
    expect(onRemove).toHaveBeenCalledWith(item.objectID)
  })

  it('shows a placeholder when the item has no image', () => {
    renderCard({ image: undefined })
    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('renders the editorial variant with a textual remove control', () => {
    const { onRemove, item } = renderCard({}, 'editorial')
    fireEvent.click(screen.getByText('Remove'))
    expect(onRemove).toHaveBeenCalledWith(item.objectID)
  })
})
