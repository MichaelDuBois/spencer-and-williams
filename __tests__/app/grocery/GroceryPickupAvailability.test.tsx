import { render, screen } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GroceryPickupAvailability } from '@/app/grocery/product/[id]/_components/GroceryPickupAvailability'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
} from '@/stores/groceryDeliveryMethod'

const useStoreIdFilterMock = vi.fn()

vi.mock('@/hooks/useStoreIdFilter', () => {
  return { useStoreIdFilter: () => useStoreIdFilterMock() }
})
vi.mock('@/hooks/useActiveConfig', () => {
  return { useActiveConfig: () => {return { slug: 'grocery' }} }
})
vi.mock('next/link', () => {
  return {
    default: ({
      children,
      href,
    }: {
      children: React.ReactNode
      href: string
    }) => <a href={href}>{children}</a>,
  }
})

const STORE = { name: { grocery: 'Downtown' } }
const product = {
  objectID: 'p1',
  name: 'Test',
  availableInStores: [{ objectID: 's1', inStock: false }],
} as never

const renderLine = (mode: 'pickup' | 'delivery' = 'delivery') => {
  groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, mode)
  return render(
    <Provider store={createStore()}>
      <GroceryPickupAvailability product={product} />
    </Provider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // The pinned atom lives in jotai's global store, so reset it between tests.
  groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, 'delivery')
})

describe('GroceryPickupAvailability', () => {
  it('shows the aggregate in-stock count when no store is selected', () => {
    useStoreIdFilterMock.mockReturnValue({ storeId: null, store: null })
    render(
      <Provider store={createStore()}>
        <GroceryPickupAvailability
          product={
            {
              objectID: 'p1',
              availableInStores: [
                { objectID: 's1', inStock: true },
                { objectID: 's2', inStock: true },
              ],
            } as never
          }
        />
      </Provider>,
    )
    expect(screen.getByText('In stock at 2 stores')).toBeInTheDocument()
  })

  it('links to choose a different store when out of stock at the selected store', () => {
    useStoreIdFilterMock.mockReturnValue({ storeId: 's1', store: STORE })
    renderLine()
    expect(
      screen.getByText('Currently unavailable at Downtown'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Choose a different store/ }),
    ).toHaveAttribute('href', '/grocery/stores?productId=p1')
  })

  it('shows a pickup message when in stock in pickup mode', () => {
    useStoreIdFilterMock.mockReturnValue({ storeId: 's1', store: STORE })
    groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, 'pickup')
    render(
      <Provider store={createStore()}>
        <GroceryPickupAvailability
          product={
            {
              objectID: 'p1',
              availableInStores: [{ objectID: 's1', inStock: true }],
            } as never
          }
        />
      </Provider>,
    )
    expect(screen.getByText('Ready for pickup at Downtown')).toBeInTheDocument()
  })
})
