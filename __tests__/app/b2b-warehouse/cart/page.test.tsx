import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import B2BWarehouseCartPage from '@/app/b2b-warehouse/cart/page'
import { activeConfigAtom } from '@/stores/activeConfig'
import { getCartAtom } from '@/stores/cart'
import { setPersonaModeAtom } from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'

import { GROUP_0 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

vi.mock('next/navigation', () => {
  return {
    useRouter: () => {
      return { push: vi.fn() }
    },
    useSearchParams: () => new URLSearchParams(),
  }
})
vi.mock('search-insights', () => {
  return { default: vi.fn() }
})
vi.mock('@/components/recommend/ProductRecommend', () => {
  return { ProductRecommend: () => null }
})

const setup = (fails = false) => {
  const search = vi.fn().mockResolvedValue({ results: [{ hits: [] }] })
  if (fails) search.mockRejectedValueOnce(new Error('Offline'))
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    s.set(setPersonaModeAtom, GROUP_0)
    s.set(baseSearchClientAtom, createMockSearchClient({ search }))
    s.set(getCartAtom('b2b-warehouse'), {
      items: [{ objectID: 'A', name: 'Drill', price: 100, quantity: 2 }],
      updatedAt: 1,
    })
  })
  return { search, ...buildProvidersWrapper({ store }) }
}

describe('B2B cart page', () => {
  it('shows checking and blocked states, then lets the user remove an unavailable line', async () => {
    const { Wrapper } = setup()
    render(<B2BWarehouseCartPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking prices and availability',
    )
    await screen.findByText(
      'Unavailable for your current customer group or warehouse. Remove this item or change your selection.',
    )
    expect(screen.getByText('Drill')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Remove item' }))
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Continue Shopping' }),
    ).toHaveAttribute('href', '/b2b-warehouse/search')
  })

  it('offers retry after an error and enables checkout with current customer totals', async () => {
    const { Wrapper, search } = setup(true)
    render(<B2BWarehouseCartPage />, { wrapper: Wrapper })
    const retry = await screen.findByRole('button', {
      name: 'Retry availability check',
    })
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled()
    search.mockResolvedValue({
      results: [
        {
          hits: [
            {
              objectID: 'A',
              name: 'Drill',
              price: 100,
              visible_by: [GROUP_0.groupId],
            },
          ],
        },
      ],
    })
    fireEvent.click(retry)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Checkout' })).toBeEnabled(),
    )
    expect(screen.getAllByText('$170.00')).toHaveLength(3)
    expect(screen.getByText('$200.00').tagName).toBe('DEL')
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(screen.getAllByText('$255.00')).toHaveLength(3)
  })
})
