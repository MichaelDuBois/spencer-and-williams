import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StoreFilterConfigure } from '@/components/results/StoreFilterConfigure'

const configureSpy = vi.fn()

vi.mock('react-instantsearch', () => {return {
  Configure: (props: Record<string, unknown>) => {
    configureSpy(props)
    return null
  },
}})

const storeIdFilterMock = vi.fn()
vi.mock('@/hooks/useStoreIdFilter', () => {return {
  useStoreIdFilter: () => storeIdFilterMock(),
}})

const renderWithStore = (storeId: string | null) => {
  storeIdFilterMock.mockReturnValue({ storeId })
  render(<StoreFilterConfigure />)
  return configureSpy.mock.lastCall?.[0]
}

describe('StoreFilterConfigure', () => {
  it('restricts results to the selected store with a hard filter', () => {
    expect(renderWithStore('16').filters).toBe(
      'availableInStores.objectID:"16"',
    )
  })

  it('applies no filter when no store is selected', () => {
    expect(renderWithStore(null).filters).toBe('')
  })

  // The store constraint must not be an optionalFilter: that only boosts, so
  // out-of-store products stay in the results, and it pollutes
  // `_rankingInfo.filters` (which the "For You" badge reads).
  it('never sets optionalFilters', () => {
    expect(renderWithStore('16')).not.toHaveProperty('optionalFilters')
  })
})
