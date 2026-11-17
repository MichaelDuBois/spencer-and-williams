import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StoreAvailabilityLine } from '@/components/storeLocator/StoreAvailabilityLine'

const useStoreIdFilterMock = vi.fn()
const useActiveConfigMock = vi.fn()

vi.mock('@/hooks/useStoreIdFilter', () => {
  return { useStoreIdFilter: () => useStoreIdFilterMock() }
})
vi.mock('@/hooks/useActiveConfig', () => {
  return { useActiveConfig: () => useActiveConfigMock() }
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

const STORE = { name: { ecommerce: 'Downtown' } }

beforeEach(() => {
  vi.clearAllMocks()
  useActiveConfigMock.mockReturnValue({ slug: 'ecommerce' })
})

describe('StoreAvailabilityLine', () => {
  it('links to the store locator when no store is selected', () => {
    useStoreIdFilterMock.mockReturnValue({ storeId: null, store: null })
    render(<StoreAvailabilityLine productId="p1" />)
    expect(
      screen.getByRole('link', { name: /Show in-store availability/ }),
    ).toHaveAttribute('href', '/ecommerce/stores?productId=p1')
  })

  it('shows a generic in-stock message at the selected store', () => {
    useStoreIdFilterMock.mockReturnValue({ storeId: 's1', store: STORE })
    render(
      <StoreAvailabilityLine
        productId="p1"
        availableInStores={[{ objectID: 's1', inStock: true }]}
      />,
    )
    expect(screen.getByText('Available at Downtown')).toBeInTheDocument()
  })

  it('uses a custom in-stock label when provided', () => {
    useStoreIdFilterMock.mockReturnValue({ storeId: 's1', store: STORE })
    render(
      <StoreAvailabilityLine
        productId="p1"
        availableInStores={[{ objectID: 's1', inStock: true }]}
        inStockLabel={(name) => `Ready for pickup at ${name}`}
      />,
    )
    expect(screen.getByText('Ready for pickup at Downtown')).toBeInTheDocument()
  })

  it('offers another store when the selected store does not carry it', () => {
    useStoreIdFilterMock.mockReturnValue({ storeId: 's2', store: STORE })
    render(
      <StoreAvailabilityLine
        productId="p1"
        availableInStores={[{ objectID: 's1', inStock: true }]}
      />,
    )
    expect(
      screen.getByText(/Not carried at Downtown/),
    ).toBeInTheDocument()
  })

  it('uses the configured noun in link labels', () => {
    useActiveConfigMock.mockReturnValue({
      slug: 'b2b-warehouse',
      locator: { nounSingular: 'warehouse', nounPlural: 'warehouses' },
    })
    useStoreIdFilterMock.mockReturnValue({ storeId: null, store: null })
    render(<StoreAvailabilityLine productId="p1" />)
    expect(
      screen.getByRole('link', { name: /Show in-warehouse availability/ }),
    ).toBeInTheDocument()
  })
})
