import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { B2BWarehousePanel } from '@/app/b2b-warehouse/_components/B2BWarehousePanel'

const clearMock = vi.fn()
const useStoreIdFilterMock = vi.fn()

vi.mock('@/hooks/useStoreIdFilter', () => {
  return { useStoreIdFilter: () => useStoreIdFilterMock() }
})
vi.mock('@/hooks/useActiveConfig', () => {
  return { useActiveConfig: () => {return { slug: 'b2b-warehouse' }} }
})

const renderPanel = () => render(<B2BWarehousePanel />)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('B2BWarehousePanel', () => {
  it('renders the select link when no warehouse is selected', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: null,
      store: null,
      isLoading: false,
      select: vi.fn(),
      clear: clearMock,
    })
    renderPanel()
    const link = screen.getByRole('link', { name: 'Select a warehouse' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/b2b-warehouse/stores')
  })

  it('renders the summary card with the store name when a warehouse is selected', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 'w1',
      store: {
        name: { 'b2b-warehouse': 'Oakland DC' },
        address: '1000 Harbor Bay Pkwy',
      },
      isLoading: false,
      select: vi.fn(),
      clear: clearMock,
    })
    renderPanel()
    expect(screen.getByText('Shopping at:')).toBeInTheDocument()
    expect(screen.getByText('Oakland DC')).toBeInTheDocument()
  })

  it('clears the warehouse when the clear button is clicked', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 'w1',
      store: {
        name: { 'b2b-warehouse': 'Oakland DC' },
        address: '1000 Harbor Bay Pkwy',
      },
      isLoading: false,
      select: vi.fn(),
      clear: clearMock,
    })
    renderPanel()
    fireEvent.click(
      screen.getByRole('button', { name: 'Clear selected warehouse' }),
    )
    expect(clearMock).toHaveBeenCalled()
  })

  it('shows a loading label while the warehouse record is fetched', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 'w1',
      store: null,
      isLoading: true,
      select: vi.fn(),
      clear: clearMock,
    })
    renderPanel()
    expect(screen.getByText('Loading warehouse…')).toBeInTheDocument()
  })

  it('falls back to an unknown label when the warehouse record is missing', () => {
    useStoreIdFilterMock.mockReturnValue({
      storeId: 'w1',
      store: null,
      isLoading: false,
      select: vi.fn(),
      clear: clearMock,
    })
    renderPanel()
    expect(screen.getByText('Unknown warehouse')).toBeInTheDocument()
  })
})
