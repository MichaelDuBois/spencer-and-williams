import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { expect, it, vi } from 'vitest'

import { ProductListingPage as B2BProductListingPage } from '@/app/b2b-warehouse/_components/ProductListingPage'
import { ProductListingPage } from '@/app/ecommerce/_components/ProductListingPage'
import { ProductListingPage as ElectronicsProductListingPage } from '@/app/electronics/_components/ProductListingPage'
import { ProductListingPage as FashionProductListingPage } from '@/app/fashion/_components/ProductListingPage'
import { FurnishingProductListingPage } from '@/app/furnishing/_components/FurnishingProductListingPage'
import { ProductListingPage as GroceryProductListingPage } from '@/app/grocery/_components/ProductListingPage'
import { HitActionContext } from '@/components/hit/HitActionContext'

import type { ReactNode } from 'react'

vi.mock('@/components/composition/MultifeedCarousels', () => {
  return {
    MultifeedCarousels: () => null,
  }
})
vi.mock('@/components/filters/FacetFilters', () => {
  return {
    FacetFilters: () => null,
  }
})
vi.mock('@/components/filters/FilterPanel', () => {
  return { FilterPanel: () => null }
})
vi.mock('@/components/hit/Hit', () => {
  return {
    Hit: () => <div>Product{useContext(HitActionContext)}</div>,
  }
})
vi.mock('@/app/b2b-warehouse/_components/B2BHit', () => {
  return {
    B2BHit: () => <div>Product{useContext(HitActionContext)}</div>,
  }
})
vi.mock('@/app/b2b-warehouse/_components/B2BVisibilityFacet', () => {
  return {
    B2BVisibilityFacet: () => null,
  }
})
vi.mock('@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy', () => {
  return {
    useB2BCustomerGroupPolicy: () => {
      return { status: 'anonymous' }
    },
  }
})
vi.mock('@/app/grocery/_components/GroceryDeliveryMethodPanel', () => {
  return {
    GroceryDeliveryMethodPanel: () => null,
  }
})
vi.mock('@/app/fashion/_components/InlineArticleIndex', () => {
  return {
    InlineArticleIndex: () => null,
  }
})
vi.mock('@/app/fashion/_hooks/useInlineArticle', () => {
  return {
    useInlineArticle: () => {
      return { isEnabled: false }
    },
  }
})
vi.mock('@/features/chatWidget/hooks/useComparisonCapability', () => {
  return {
    useComparisonCapability: () => {
      return { configurationId: 'config' }
    },
  }
})
vi.mock('@/features/chatWidget/components/CompareToggle', () => {
  return {
    CompareToggle: ({ hit }: { hit: { objectID: string } }) => (
      <button>Compare {hit.objectID}</button>
    ),
  }
})
vi.mock('@/components/pagination/Pagination', () => {
  return {
    Pagination: () => null,
  }
})
vi.mock('@/components/results/FilterSuggestionsWidget', () => {
  return {
    FilterSuggestionsWidget: () => null,
  }
})
vi.mock('@/components/results/QueryCatSuggestion', () => {
  return {
    QueryCatSuggestion: () => null,
  }
})
vi.mock('@/components/results/QueryRuleBanner', () => {
  return {
    QueryRuleBanner: () => null,
  }
})
vi.mock('@/components/results/SearchResultsHeader', () => {
  return {
    SearchResultsHeader: () => null,
  }
})
vi.mock('@/components/results/SortByWidget', () => {
  return {
    SortByWidget: () => null,
  }
})
vi.mock('@/components/results/StoreFilterChip', () => {
  return {
    StoreFilterChip: () => null,
  }
})
vi.mock('@/components/results/HitsWithInjectedContent', () => {
  return {
    HitsWithInjectedContent: ({
      hitComponent,
    }: {
      hitComponent: (props: { hit: { objectID: string } }) => ReactNode
    }) => (
      <div data-testid="grid">{hitComponent({ hit: { objectID: 'p1' } })}</div>
    ),
  }
})
vi.mock('@/features/chatWidget/components/ChatSearchOverview', () => {
  return {
    ChatSearchOverview: () => <div>AI Overview</div>,
  }
})
it.each([
  ['ecommerce', <ProductListingPage key="ecommerce" title="Products" />],
  [
    'electronics',
    <ElectronicsProductListingPage key="electronics" title="Products" />,
  ],
  [
    'fashion',
    <FashionProductListingPage key="fashion" header={<h1>Products</h1>} />,
  ],
  [
    'furnishing',
    <FurnishingProductListingPage key="furnishing" title="Products" />,
  ],
  ['grocery', <GroceryProductListingPage key="grocery" title="Products" />],
  [
    'b2b-warehouse',
    <B2BProductListingPage key="b2b-warehouse" title="Products" />,
  ],
])(
  '%s places the overview before the grid and embeds comparison in the product',
  (_slug, page) => {
    render(page)
    const overview = screen.getByText('AI Overview')
    const grid = screen.getByTestId('grid')
    expect(grid).not.toContainElement(overview)
    expect(
      overview.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    const product = screen.getByText('Product')
    expect(grid).toContainElement(product)
    expect(product).toContainElement(
      screen.getByRole('button', { name: 'Compare p1' }),
    )
  },
)
