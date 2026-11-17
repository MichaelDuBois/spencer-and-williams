import { fireEvent, render, screen } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GroceryStoreSummaryCard } from '@/app/grocery/_components/GroceryStoreSummaryCard'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
} from '@/stores/groceryDeliveryMethod'

const clearMock = vi.fn()
const useStoreIdFilterMock = vi.fn()

vi.mock('@/hooks/useStoreIdFilter', () => {
  return { useStoreIdFilter: () => useStoreIdFilterMock() }
})
vi.mock('@/hooks/useActiveConfig', () => {
  return { useActiveConfig: () => {return { slug: 'grocery' }} }
})

const renderCard = (mode: 'pickup' | 'delivery' = 'delivery') => {
  groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, mode)
  return render(
    <Provider store={createStore()}>
      <GroceryStoreSummaryCard />
    </Provider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // The pinned atom lives in jotai's global store, so reset it between tests.
  groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, 'delivery')
})

describe('GroceryStoreSummaryCard', () => {
  it('renders nothing when no store is selected', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: null,
      store: null,
      clear: clearMock,
    })
    const { container } = renderCard()
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the pickup heading and location name when a store is selected', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 's1',
      store: { name: { grocery: 'Downtown SF' }, address: '92 Newland St' },
      clear: clearMock,
    })
    renderCard('pickup')
    expect(screen.getByText('Picking up at:')).toBeInTheDocument()
    expect(screen.getByText('Downtown SF')).toBeInTheDocument()
  })

  it('shows the delivery heading in delivery mode', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 's1',
      store: { name: { grocery: 'Downtown SF' } },
      clear: clearMock,
    })
    renderCard('delivery')
    expect(screen.getByText('Delivering from:')).toBeInTheDocument()
  })

  it('clears the store when Clear is clicked', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 's1',
      store: { name: { grocery: 'Downtown SF' } },
      clear: clearMock,
    })
    renderCard()
    fireEvent.click(
      screen.getByRole('button', { name: 'Clear selected store' }),
    )
    expect(clearMock).toHaveBeenCalled()
  })
})
