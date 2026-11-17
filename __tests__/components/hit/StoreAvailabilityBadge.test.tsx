import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StoreAvailabilityBadge } from '@/components/hit/StoreAvailabilityBadge'

const useStoreIdFilterMock = vi.fn()

vi.mock('@/hooks/useStoreIdFilter', () => {
  return {
    useStoreIdFilter: () => useStoreIdFilterMock(),
  }
})

const renderBadge = (
  storeId: string | null,
  availableInStores?: { objectID: string; inStock: boolean }[],
) => {
  useStoreIdFilterMock.mockReturnValue({ storeId })
  return render(<StoreAvailabilityBadge item={{ availableInStores }} />)
}

describe('StoreAvailabilityBadge', () => {
  it('renders nothing when no store is selected', () => {
    const { container } = renderBadge(null, [
      { objectID: 'store-1', inStock: true },
    ])
    expect(container).toBeEmptyDOMElement()
  })

  it('renders an in-stock pill when the store carries the product', () => {
    renderBadge('store-1', [{ objectID: 'store-1', inStock: true }])
    expect(screen.getByText('In stock')).toBeInTheDocument()
  })

  it('renders an out-of-stock pill when the store is out of stock', () => {
    renderBadge('store-1', [{ objectID: 'store-1', inStock: false }])
    expect(screen.getByText('Out of stock')).toBeInTheDocument()
  })

  it('renders nothing when the selected store does not carry the product', () => {
    const { container } = renderBadge('store-2', [
      { objectID: 'store-1', inStock: true },
    ])
    expect(container).toBeEmptyDOMElement()
  })
})
