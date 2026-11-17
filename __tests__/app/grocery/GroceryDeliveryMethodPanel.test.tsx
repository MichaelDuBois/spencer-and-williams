import { fireEvent, render, screen } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GroceryDeliveryMethodPanel } from '@/app/grocery/_components/GroceryDeliveryMethodPanel'
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

const renderPanel = () =>
  render(
    <Provider store={createStore()}>
      <GroceryDeliveryMethodPanel />
    </Provider>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // The pinned atom lives in jotai's global store, so reset it between tests.
  groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, 'delivery')
  useStoreIdFilterMock.mockReturnValue({
    storeId: null,
    store: null,
    clear: vi.fn(),
  })
})

describe('GroceryDeliveryMethodPanel', () => {
  it('defaults to delivery and can switch to pickup', () => {
    renderPanel()
    expect(screen.getByRole('button', { name: /Delivery/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    fireEvent.click(screen.getByRole('button', { name: /Pickup/ }))
    expect(screen.getByRole('button', { name: /Pickup/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows a link to the store locator when no store is selected', () => {
    renderPanel()
    expect(
      screen.getByRole('link', { name: /Select a store/ }),
    ).toHaveAttribute('href', '/grocery/stores')
  })

  it('shows the selected-store card instead of the link once a store is chosen', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 's1',
      store: { name: { grocery: 'Downtown SF' } },
      clear: vi.fn(),
    })
    renderPanel()
    expect(screen.queryByRole('link', { name: /Select a store/ })).toBeNull()
    expect(screen.getByText('Downtown SF')).toBeInTheDocument()
  })
})
