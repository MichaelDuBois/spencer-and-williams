import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { ecommerceConfig } from '@/app/ecommerce/config'
import { Hit } from '@/components/hit/Hit'
import { ComparableSearchHit } from '@/features/chatWidget/components/ComparableSearchHit'

const state = vi.hoisted(() => {
  return { capability: true, toggle: vi.fn() }
})
vi.mock('react-instantsearch', () => {
  return {
    Highlight: () => <span>Widget</span>,
    useCompare: () => {
      return {
        isSelected: () => false,
        canAddItems: true,
        toggleItem: state.toggle,
      }
    },
  }
})
vi.mock('@/features/chatWidget/hooks/useComparisonCapability', () => {
  return {
    useComparisonCapability: () =>
      state.capability
        ? { configurationId: 'config', minItems: 2, maxItems: 3 }
        : null,
  }
})
vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendProductClickEvent: vi.fn() }
    },
  }
})
vi.mock('@/hooks/useAddToCart', () => {
  return {
    useAddToCart: () => {
      return { addToCart: vi.fn() }
    },
  }
})
vi.mock('@/hooks/useRankingBadges', () => {
  return {
    useRankingBadges: () => {
      return {
        isComposed: false,
        isPersonalized: false,
        isSponsored: false,
      }
    },
  }
})
vi.mock('@/hooks/useStoreIdFilter', () => {
  return {
    useStoreIdFilter: () => {
      return { storeId: null }
    },
  }
})

const hit = { objectID: 'p1', name: 'Widget', price: 19.99, __position: 1 }
const card = (
  <Hit
    variant="standard"
    item={hit}
    template={ecommerceConfig.algolia.primaryIndex.template!}
    slug="ecommerce"
    extractor={getEcommerceProductHitValues}
  />
)

beforeEach(() => {
  state.capability = true
  state.toggle.mockClear()
})

describe('ComparableSearchHit', () => {
  it('does not offer selection without configuration and preserves the card', () => {
    state.capability = false
    const { rerender } = render(
      <ComparableSearchHit hit={hit}>{card}</ComparableSearchHit>,
    )
    const article = screen.getByRole('article')
    expect(
      screen.queryByRole('button', { name: /Compare/ }),
    ).not.toBeInTheDocument()
    state.capability = true
    rerender(<ComparableSearchHit hit={hit}>{card}</ComparableSearchHit>)
    expect(screen.getByRole('article')).toBe(article)
    expect(
      screen.getByRole('button', { name: 'Compare Widget' }),
    ).toBeInTheDocument()
  })

  it('embeds the real comparison action after the price and outside the link', () => {
    render(<ComparableSearchHit hit={hit}>{card}</ComparableSearchHit>)
    const action = screen.getByRole('button', { name: 'Compare Widget' })
    const price = screen.getByText('$19.99')
    expect(action.closest('article')).toContainElement(price)
    expect(action.closest('a')).toBeNull()
    expect(
      price.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    fireEvent.click(action)
    expect(state.toggle).toHaveBeenCalledWith(hit)
  })

  it.each([true, false])(
    'keeps the full card link with comparison enabled: %s',
    (enabled) => {
      state.capability = enabled
      render(<ComparableSearchHit hit={hit}>{card}</ComparableSearchHit>)
      const article = screen.getByRole('article')
      const link = screen.getByRole('link')
      expect(article).toContainElement(link)
      expect(article).toHaveClass('relative')
      expect(link).toHaveClass('after:absolute', 'after:inset-0')
      expect(link).toContainElement(screen.getByText('$19.99'))
      const action = screen.queryByRole('button', { name: 'Compare Widget' })
      if (enabled) {
        expect(action?.closest('a')).toBeNull()
        expect(action?.parentElement).toHaveClass('relative', 'z-20')
      } else {
        expect(action).not.toBeInTheDocument()
      }
    },
  )
})
