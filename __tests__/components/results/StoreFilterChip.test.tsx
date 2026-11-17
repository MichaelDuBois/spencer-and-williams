import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StoreFilterChip } from '@/components/results/StoreFilterChip'
import type { VerticalConfig } from '@/types'
import type { GenericLocation } from '@/types/location.types'

const { useActiveConfigMock, useStoreIdFilterMock } = vi.hoisted(() => {
  return {
    useActiveConfigMock: vi.fn(),
    useStoreIdFilterMock: vi.fn(),
  }
})

vi.mock('@/hooks/useActiveConfig', () => {
  return { useActiveConfig: useActiveConfigMock }
})
vi.mock('@/hooks/useStoreIdFilter', () => {
  return { useStoreIdFilter: useStoreIdFilterMock }
})

const store: GenericLocation = {
  objectID: '1',
  address: '123 Main St',
  name: { 'b2b-warehouse': 'Peachtree Hardware Depot' },
  country: 'US',
  city: 'Atlanta',
  _geoloc: { lat: 33.6, lng: -84.4 },
  openingTime: 9,
  closingTime: 21,
}

const config = {
  slug: 'b2b-warehouse',
  locator: { nounSingular: 'warehouse', nounPlural: 'warehouses' },
} as unknown as VerticalConfig

describe('StoreFilterChip', () => {
  beforeEach(() => {
    useActiveConfigMock.mockReturnValue(config)
  })

  it('renders the configured singular noun as the label', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: '1',
      store,
      clear: vi.fn(),
    })
    render(<StoreFilterChip />)
    expect(screen.getByText('warehouse:')).toBeInTheDocument()
    expect(screen.getByText('Peachtree Hardware Depot')).toBeInTheDocument()
  })

  it('renders nothing when no storeId is set', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: null,
      store: null,
      clear: vi.fn(),
    })
    const { container } = render(<StoreFilterChip />)
    expect(container).toBeEmptyDOMElement()
  })
})
